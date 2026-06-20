import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";

// GET /api/posts — feed of posts from the viewer + connections + followed
// people, newest first. Falls back to a public/global feed for guests or
// people with no network yet, so the feed is never empty.
export async function GET(req: Request) {
  const session = await getCurrentSession();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const authorId = searchParams.get("authorId") ?? undefined;
  const pageSize = 10;

  let authorIds: string[] | undefined;

  if (authorId) {
    authorIds = [authorId];
  } else if (session?.user) {
    const [connections, follows] = await Promise.all([
      prisma.connection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: session.user.id }, { addresseeId: session.user.id }],
        },
      }),
      prisma.follow.findMany({ where: { followerId: session.user.id } }),
    ]);
    const networkIds = new Set<string>([session.user.id]);
    connections.forEach((c) =>
      networkIds.add(c.requesterId === session.user.id ? c.addresseeId : c.requesterId)
    );
    follows.forEach((f) => networkIds.add(f.followeeId));
    authorIds = Array.from(networkIds);
  }

  const where: any = authorIds ? { authorId: { in: authorIds } } : {};

  let posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, image: true, headline: true } },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // If a logged-in user's network feed is sparse, top up with global recent posts
  if (session?.user && !authorId && posts.length < pageSize && page === 1) {
    const existingIds = posts.map((p) => p.id);
    const filler = await prisma.post.findMany({
      where: { id: { notIn: existingIds } },
      include: {
        author: { select: { id: true, name: true, image: true, headline: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: session.user.id }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize - posts.length,
    });
    posts = [...posts, ...filler].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const formatted = posts.map((p: any) => ({
    ...p,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    likedByMe: Array.isArray(p.likes) && p.likes.length > 0,
    likes: undefined,
  }));

  return NextResponse.json({ posts: formatted });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const post = await prisma.post.create({
    data: { ...parsed.data, authorId: session.user.id },
    include: {
      author: { select: { id: true, name: true, image: true, headline: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json({ ...post, likeCount: 0, commentCount: 0, likedByMe: false });
}
