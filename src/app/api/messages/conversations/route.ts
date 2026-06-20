import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const memberships = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: { include: { user: { select: { id: true, name: true, image: true, headline: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  const conversations = await Promise.all(
    memberships.map(async (m) => {
      const other = m.conversation.participants.find((p) => p.userId !== session.user.id)?.user;
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: m.conversationId,
          senderId: { not: session.user.id },
          createdAt: { gt: m.lastReadAt ?? new Date(0) },
        },
      });
      return {
        id: m.conversation.id,
        otherUser: other,
        lastMessage: m.conversation.messages[0] ?? null,
        unreadCount,
        updatedAt: m.conversation.updatedAt,
      };
    })
  );

  return NextResponse.json({ conversations });
}

// Find or create a 1:1 conversation with another user. Only allowed
// between accepted connections, matching the spec ("messages between
// connections").
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId || userId === session.user.id) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  const connection = await prisma.connection.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: session.user.id, addresseeId: userId },
        { requesterId: userId, addresseeId: session.user.id },
      ],
    },
  });
  if (!connection) {
    return NextResponse.json({ error: "You can only message your connections" }, { status: 403 });
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId } } },
      ],
    },
  });
  if (existing) return NextResponse.json({ id: existing.id });

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: session.user.id }, { userId }],
      },
    },
  });

  return NextResponse.json({ id: conversation.id });
}
