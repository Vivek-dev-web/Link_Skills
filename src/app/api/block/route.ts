import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId || userId === session.user.id) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: session.user.id, blockedId: userId } },
      update: {},
      create: { blockerId: session.user.id, blockedId: userId },
    }),
    prisma.connection.deleteMany({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: userId },
          { requesterId: userId, addresseeId: session.user.id },
        ],
      },
    }),
    prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: session.user.id, followeeId: userId },
          { followerId: userId, followeeId: session.user.id },
        ],
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
