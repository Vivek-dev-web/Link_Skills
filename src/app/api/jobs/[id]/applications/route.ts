import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin) {
    const member = await prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId: job.companyId, userId: session.user.id } },
    });
    if (!member) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const applications = await prisma.application.findMany({
    where: { jobId: params.id },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          image: true,
          headline: true,
          currentRole: true,
          currentCompany: true,
          resumeUrl: true,
          skills: { include: { skill: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications, job });
}
