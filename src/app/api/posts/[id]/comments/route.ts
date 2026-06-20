import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";
import { notify } from "@/lib/notify";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { postId: params.id },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { postId: params.id, userId: session.user.id, content: parsed.data.content },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (post && post.authorId !== session.user.id) {
    const commenter = await prisma.user.findUnique({ where: { id: session.user.id } });
    await notify({
      userId: post.authorId,
      type: "POST_COMMENT",
      message: `${commenter?.name} commented on your post`,
      link: `/feed?post=${params.id}`,
    });
  }

  return NextResponse.json(comment);
}
