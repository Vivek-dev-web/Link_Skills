import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const saved = await prisma.savedPost.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
        include: {
          author: { select: { id: true, name: true, image: true, headline: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const posts = saved.map((s) => ({
    ...s.post,
    likeCount: s.post._count.likes,
    commentCount: s.post._count.comments,
    likedByMe: false,
    savedAt: s.createdAt,
  }));

  return NextResponse.json({ posts });
}
