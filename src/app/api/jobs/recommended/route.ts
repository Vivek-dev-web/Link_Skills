import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Recommend open jobs whose required skills overlap with the user's
// listed skills, ranked by number of overlapping skills.
export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ jobs: [] });

  const mySkills = await prisma.userSkill.findMany({
    where: { userId: session.user.id },
    select: { skillId: true },
  });
  const skillIds = mySkills.map((s) => s.skillId);

  if (skillIds.length === 0) {
    const recent = await prisma.job.findMany({
      where: { status: "OPEN" },
      include: { company: true, skills: { include: { skill: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return NextResponse.json({ jobs: recent });
  }

  const applied = await prisma.application.findMany({
    where: { applicantId: session.user.id },
    select: { jobId: true },
  });
  const appliedIds = applied.map((a) => a.jobId);

  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      id: { notIn: appliedIds },
      skills: { some: { skillId: { in: skillIds } } },
    },
    include: { company: true, skills: { include: { skill: true } } },
    take: 30,
  });

  const ranked = jobs
    .map((job) => ({
      job,
      overlap: job.skills.filter((js) => skillIds.includes(js.skillId)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 6)
    .map((r) => ({ ...r.job, matchingSkillCount: r.overlap }));

  return NextResponse.json({ jobs: ranked });
}
