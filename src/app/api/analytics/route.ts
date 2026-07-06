import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const userId = session.user.id;
  const now = new Date();
  const days7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const days14ago = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const days90ago = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [
    totalFollowers,
    followersLast7,
    followersPrior7,
    postsLast7,
    postsPrior7,
    totalPosts,
    totalConnections,
    recentPosts,
  ] = await Promise.all([
    prisma.follow.count({ where: { followeeId: userId } }),
    prisma.follow.count({ where: { followeeId: userId, createdAt: { gte: days7ago } } }),
    prisma.follow.count({ where: { followeeId: userId, createdAt: { gte: days14ago, lt: days7ago } } }),
    prisma.post.count({ where: { authorId: userId, createdAt: { gte: days7ago } } }),
    prisma.post.count({ where: { authorId: userId, createdAt: { gte: days14ago, lt: days7ago } } }),
    prisma.post.count({ where: { authorId: userId } }),
    prisma.connection.count({
      where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
    }),
    prisma.post.findMany({
      where: { authorId: userId },
      include: { _count: { select: { likes: true, comments: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Build post impressions (likes × 3 + comments × 5 as a rough proxy) for last 7 days
  const last7Posts = await prisma.post.findMany({
    where: { authorId: userId, createdAt: { gte: days7ago } },
    include: { _count: { select: { likes: true, comments: true } } },
  });
  const postImpressions7 = last7Posts.reduce((sum, p) => sum + p._count.likes * 3 + p._count.comments * 5 + 1, 0);
  const prior7Posts = await prisma.post.findMany({
    where: { authorId: userId, createdAt: { gte: days14ago, lt: days7ago } },
    include: { _count: { select: { likes: true, comments: true } } },
  });
  const postImpressionsPrior7 = prior7Posts.reduce((sum, p) => sum + p._count.likes * 3 + p._count.comments * 5 + 1, 0);

  // Follower growth over 30 days (bucket by day)
  const followers30 = await prisma.follow.findMany({
    where: { followeeId: userId, createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Build daily buckets for content impressions (last 7 days)
  const dailyImpressions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(days7ago.getTime() + i * 24 * 60 * 60 * 1000);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayPosts = last7Posts.filter((p) => {
      const pd = new Date(p.createdAt);
      return pd.toDateString() === d.toDateString();
    });
    const impressions = dayPosts.reduce((s, p) => s + p._count.likes * 3 + p._count.comments * 5 + 1, 0);
    return { label, impressions };
  });

  // Aggregate total engagement
  const allPosts7Engagement = last7Posts.reduce(
    (acc, p) => ({
      reactions: acc.reactions + p._count.likes,
      comments: acc.comments + p._count.comments,
    }),
    { reactions: 0, comments: 0 }
  );

  return NextResponse.json({
    overview: {
      postImpressions7,
      postImpressionsDelta: postImpressionsPrior7 === 0 ? null : Math.round(((postImpressions7 - postImpressionsPrior7) / Math.max(postImpressionsPrior7, 1)) * 100),
      totalFollowers,
      followersDelta: followersPrior7 === 0 ? null : Math.round(((followersLast7 - followersPrior7) / Math.max(followersPrior7, 1)) * 100),
      profileViewers90: totalConnections * 2 + totalPosts * 3, // proxy
      searchAppearances: totalConnections + totalPosts * 2,    // proxy
      postsThisWeek: postsLast7,
      commentsThisWeek: allPosts7Engagement.comments,
    },
    contentAnalytics: {
      dailyImpressions,
      totalImpressions: postImpressions7,
      inNetworkPct: totalFollowers > 0 ? 40 : 0,
      outOfNetworkPct: totalFollowers > 0 ? 60 : 100,
      membersReached: Math.max(1, Math.floor(postImpressions7 / 3)),
      engagement: {
        reactions: allPosts7Engagement.reactions,
        comments: allPosts7Engagement.comments,
        reposts: 0,
        saves: 0,
      },
      topPosts: recentPosts.map((p) => ({
        id: p.id,
        content: p.content.slice(0, 120),
        impressions: p._count.likes * 3 + p._count.comments * 5 + 1,
        engagements: p._count.likes + p._count.comments,
        createdAt: p.createdAt,
      })),
    },
    audienceAnalytics: {
      followerGrowth: followers30.map((f) => ({
        date: f.createdAt,
      })),
      totalFollowers,
      newFollowersLast7: followersLast7,
      demographics: {
        companies: [
          { name: "Tech companies", pct: 35 },
          { name: "Consulting firms", pct: 22 },
          { name: "Startups", pct: 18 },
          { name: "MNCs", pct: 15 },
          { name: "Other", pct: 10 },
        ],
        seniority: [
          { name: "Mid-level", pct: 38 },
          { name: "Senior", pct: 28 },
          { name: "Entry-level", pct: 20 },
          { name: "Leadership", pct: 14 },
        ],
        locations: [
          { name: "Bengaluru", pct: 32 },
          { name: "Hyderabad", pct: 18 },
          { name: "Mumbai", pct: 16 },
          { name: "Delhi NCR", pct: 14 },
          { name: "Pune", pct: 12 },
          { name: "Other", pct: 8 },
        ],
      },
    },
  });
}
