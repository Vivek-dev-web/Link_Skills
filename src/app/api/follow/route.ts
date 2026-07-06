import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "following";

  if (type === "following") {
    const follows = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      include: {
        followee: { select: { id: true, name: true, image: true, headline: true, currentRole: true, currentCompany: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ follows });
  } else {
    const follows = await prisma.follow.findMany({
      where: { followeeId: session.user.id },
      include: {
        follower: { select: { id: true, name: true, image: true, headline: true, currentRole: true, currentCompany: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ follows });
  }
}

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
