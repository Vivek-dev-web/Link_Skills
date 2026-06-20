import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      jobs: { where: { status: "OPEN" }, orderBy: { createdAt: "desc" } },
      members: { include: { user: { select: { id: true, name: true, image: true, headline: true } } } },
    },
  });
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const employeesOnPlatform = await prisma.user.count({
    where: { currentCompany: company.name },
  });

  return NextResponse.json({ ...company, employeesOnPlatform });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const member = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: params.id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await req.json();
  const parsed = companySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const company = await prisma.company.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(company);
}
