import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { followeeId } = await req.json();
  if (!followeeId || followeeId === session.user.id) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  const follow = await prisma.follow.upsert({
    where: { followerId_followeeId: { followerId: session.user.id, followeeId } },
    update: {},
    create: { followerId: session.user.id, followeeId },
  });
  return NextResponse.json(follow);
}
