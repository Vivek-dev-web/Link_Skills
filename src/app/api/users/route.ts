import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/users?q=&company=&skill=&location=&page=
export async function GET(req: Request) {
  const session = await getCurrentSession();
  const viewerId = session?.user?.id;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const company = searchParams.get("company")?.trim();
  const skill = searchParams.get("skill")?.trim();
  const location = searchParams.get("location")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 20;

  const where: any = {
    deactivated: false,
    visibility: { not: "PRIVATE" },
    ...(viewerId ? { id: { not: viewerId } } : {}),
  };

  const AND: any[] = [];
  if (q) {
    AND.push({
      OR: [
        { name:           { contains: q, mode: "insensitive" } },
        { headline:       { contains: q, mode: "insensitive" } },
        { currentRole:    { contains: q, mode: "insensitive" } },
        { email:          { contains: q, mode: "insensitive" } },
        { currentCompany: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (company) AND.push({ currentCompany: { contains: company, mode: "insensitive" } });
  if (location) AND.push({ location: { contains: location, mode: "insensitive" } });
  if (skill) AND.push({ skills: { some: { skill: { name: { contains: skill, mode: "insensitive" } } } } });
  if (AND.length) where.AND = AND;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        image: true,
        headline: true,
        currentRole: true,
        currentCompany: true,
        location: true,
        skills: { select: { skill: { select: { name: true } } }, take: 5 },
        _count: { select: { experiences: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pageSize });
}
