import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations";
import { notify } from "@/lib/notify";

async function assertMember(conversationId: string, userId: string) {
  const member = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return !!member;
}

// GET ?since=<ISO date> for polling new messages
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  if (!(await assertMember(params.id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  const [messages, conversation] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: params.id, ...(since ? { createdAt: { gt: new Date(since) } } : {}) },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, image: true } } },
    }),
    prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        participants: { include: { user: { select: { id: true, name: true, image: true, headline: true } } } },
      },
    }),
  ]);

  const otherParticipant = conversation?.participants.find((p) => p.userId !== session.user.id);
  const isOtherTyping =
    !!otherParticipant?.typingAt && Date.now() - new Date(otherParticipant.typingAt).getTime() < 3000;

  return NextResponse.json({
    messages,
    otherUser: otherParticipant?.user ?? null,
    isOtherTyping,
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  if (!(await assertMember(params.id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const message = await prisma.message.create({
    data: { conversationId: params.id, senderId: session.user.id, content: parsed.data.content },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  await prisma.$transaction([
    prisma.conversation.update({ where: { id: params.id }, data: { updatedAt: new Date() } }),
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
      data: { lastReadAt: new Date() },
    }),
  ]);

  const otherMember = await prisma.conversationParticipant.findFirst({
    where: { conversationId: params.id, userId: { not: session.user.id } },
  });
  if (otherMember) {
    const sender = await prisma.user.findUnique({ where: { id: session.user.id } });
    await notify({
      userId: otherMember.userId,
      type: "MESSAGE",
      message: `${sender?.name} sent you a message`,
      link: `/messages?c=${params.id}`,
    });
  }

  return NextResponse.json(message);
}
