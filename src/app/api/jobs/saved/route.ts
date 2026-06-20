import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ jobs: [] });

  const saved = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ jobs: saved.map((s) => s.job) });
}
