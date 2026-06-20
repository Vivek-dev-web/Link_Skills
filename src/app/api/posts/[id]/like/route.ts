import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

// Toggle like
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId: params.id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { postId: params.id } });
    return NextResponse.json({ liked: false, likeCount: count });
  }

  await prisma.like.create({ data: { postId: params.id, userId: session.user.id } });
  const count = await prisma.like.count({ where: { postId: params.id } });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (post && post.authorId !== session.user.id) {
    const liker = await prisma.user.findUnique({ where: { id: session.user.id } });
    await notify({
      userId: post.authorId,
      type: "POST_LIKE",
      message: `${liker?.name} liked your post`,
      link: `/feed?post=${params.id}`,
    });
  }

  return NextResponse.json({ liked: true, likeCount: count });
}
