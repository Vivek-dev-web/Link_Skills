import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId: params.commentId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.commentLike.create({
      data: { commentId: params.commentId, userId: session.user.id },
    });
  }

  const likeCount = await prisma.commentLike.count({ where: { commentId: params.commentId } });
  return NextResponse.json({ liked: !existing, likeCount });
}
