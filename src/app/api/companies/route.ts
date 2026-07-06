import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validations";
import { slugify, randomToken } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const companies = await prisma.company.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    include: { _count: { select: { jobs: true, members: true } } },
    orderBy: { name: "asc" },
    take: 50,
  });
  return NextResponse.json({ companies });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const parsed = companySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  let slug = slugify(parsed.data.name);
  const collision = await prisma.company.findUnique({ where: { slug } });
  if (collision) slug = `${slug}-${randomToken(4).toLowerCase()}`;

  const company = await prisma.company.create({
    data: {
      ...parsed.data,
      website: parsed.data.website || null,
      slug,
      members: { create: { userId: session.user.id, role: "ADMIN" } },
    },
  });

  // Posting a company makes you a recruiter on the platform
  await prisma.user.update({ where: { id: session.user.id }, data: { role: "RECRUITER" } });

  return NextResponse.json(company);
}
