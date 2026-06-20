import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// My applications — the job seeker's status tracker
export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ applications: [] });

  const applications = await prisma.application.findMany({
    where: { applicantId: session.user.id },
    include: { job: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}
