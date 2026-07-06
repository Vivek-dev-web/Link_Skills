import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK = [
  { tag: "AzureOpenAI",    count: 2400 },
  { tag: "Databricks",     count: 1800 },
  { tag: "KubernetesDay",  count: 1200 },
  { tag: "CloudSecurity",  count: 980  },
  { tag: "AWSreinvent",    count: 756  },
];

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k posts`;
  return `${n} posts`;
}

export async function GET() {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const posts = await prisma.post.findMany({
      select: { content: true },
      where: { createdAt: { gte: since } },
      take: 1000,
    });

    const counts: Record<string, number> = {};
    for (const { content } of posts) {
      const tags = content.match(/#\w+/g) ?? [];
      for (const raw of tags) {
        const key = raw.slice(1);
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const trending = sorted.length > 0
      ? sorted.map(([tag, count]) => ({ tag, posts: fmt(count) }))
      : FALLBACK.map((f) => ({ tag: f.tag, posts: fmt(f.count) }));

    return NextResponse.json({ trending });
  } catch {
    return NextResponse.json({
      trending: FALLBACK.map((f) => ({ tag: f.tag, posts: fmt(f.count) })),
    });
  }
}
