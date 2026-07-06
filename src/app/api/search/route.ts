import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/search?q=...  returns top matches across all four pillars,
// used for the global search bar's quick results / tabs.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ people: [], jobs: [], courses: [], companies: [] });

  const [people, jobs, courses, companies] = await Promise.all([
    prisma.user.findMany({
      where: {
        deactivated: false,
        visibility: { not: "PRIVATE" },
        OR: [{ name: { contains: q, mode: "insensitive" } }, { headline: { contains: q, mode: "insensitive" } }],
      },
      select: { id: true, name: true, image: true, headline: true },
      take: 6,
    }),
    prisma.job.findMany({
      where: { status: "OPEN", OR: [{ title: { contains: q, mode: "insensitive" } }, { location: { contains: q, mode: "insensitive" } }] },
      include: { company: { select: { name: true, logoUrl: true } } },
      take: 6,
    }),
    prisma.course.findMany({
      where: { published: true, OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      select: { id: true, title: true, imageUrl: true, level: true },
      take: 6,
    }),
    prisma.company.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, logoUrl: true, industry: true },
      take: 6,
    }),
  ]);

  return NextResponse.json({ people, jobs, courses, companies });
}
