import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  const viewerId = session?.user?.id ?? null;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      experiences: { orderBy: { startDate: "desc" } },
      education: { orderBy: { startDate: "desc" } },
      skills: { include: { skill: true }, orderBy: { endorsements: "desc" } },
      certificates: { orderBy: { issuedAt: "desc" } },
      _count: {
        select: {
          sentConnections: true,
          receivedConnections: true,
          followers: true,
        },
      },
    },
  });

  if (!user || user.deactivated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let connectionStatus: string | null = null;
  let isFollowing = false;
  let isOwner = viewerId === user.id;

  if (viewerId && !isOwner) {
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: viewerId, addresseeId: user.id },
          { requesterId: user.id, addresseeId: viewerId },
        ],
      },
    });
    connectionStatus = connection?.status ?? null;

    const follow = await prisma.follow.findUnique({
      where: { followerId_followeeId: { followerId: viewerId, followeeId: user.id } },
    });
    isFollowing = !!follow;
  }

  // Visibility enforcement
  if (!isOwner && user.visibility === "PRIVATE") {
    return NextResponse.json({ error: "This profile is private" }, { status: 403 });
  }
  if (!isOwner && user.visibility === "CONNECTIONS" && connectionStatus !== "ACCEPTED") {
    const { experiences, education, skills, about, resumeUrl, ...limited } = user;
    return NextResponse.json({
      ...limited,
      experiences: [],
      education: [],
      skills: [],
      about: null,
      resumeUrl: null,
      limitedVisibility: true,
      connectionStatus,
      isFollowing,
      isOwner,
    });
  }

  const connectionCount = await prisma.connection.count({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
  });

  const { password, ...safeUser } = user;
  return NextResponse.json({
    ...safeUser,
    connectionCount,
    followerCount: user._count.followers,
    connectionStatus,
    isFollowing,
    isOwner,
  });
}
