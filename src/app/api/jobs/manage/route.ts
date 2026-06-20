import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// All jobs across companies the current user belongs to
export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ jobs: [] });

  const memberships = await prisma.companyMember.findMany({ where: { userId: session.user.id } });
  const companyIds = memberships.map((m) => m.companyId);

  const jobs = await prisma.job.findMany({
    where: { companyId: { in: companyIds } },
    include: {
      company: { select: { id: true, name: true, logoUrl: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}
