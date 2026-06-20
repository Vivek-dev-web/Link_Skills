import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Recommends courses that teach skills required by jobs the user has
// saved or applied to, but doesn't have listed on their profile yet —
// i.e. closing the gap between "jobs I want" and "skills I have".
export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ courses: [], gapSkills: [] });

  const [savedJobs, applications, mySkills, myEnrollments] = await Promise.all([
    prisma.savedJob.findMany({
      where: { userId: session.user.id },
      include: { job: { include: { skills: true } } },
    }),
    prisma.application.findMany({
      where: { applicantId: session.user.id },
      include: { job: { include: { skills: true } } },
    }),
    prisma.userSkill.findMany({ where: { userId: session.user.id }, select: { skillId: true } }),
    prisma.enrollment.findMany({ where: { userId: session.user.id }, select: { courseId: true } }),
  ]);

  const mySkillIds = new Set(mySkills.map((s) => s.skillId));
  const wantedSkillIds = new Set<string>();
  [...savedJobs.map((s) => s.job), ...applications.map((a) => a.job)].forEach((job) => {
    job.skills.forEach((js) => {
      if (!mySkillIds.has(js.skillId)) wantedSkillIds.add(js.skillId);
    });
  });

  const enrolledCourseIds = myEnrollments.map((e) => e.courseId);

  let courses;
  if (wantedSkillIds.size > 0) {
    courses = await prisma.course.findMany({
      where: {
        published: true,
        id: { notIn: enrolledCourseIds },
        skills: { some: { skillId: { in: Array.from(wantedSkillIds) } } },
      },
      include: { creator: { select: { name: true } }, skills: { include: { skill: true } } },
      take: 6,
    });
  } else {
    courses = await prisma.course.findMany({
      where: { published: true, id: { notIn: enrolledCourseIds } },
      include: { creator: { select: { name: true } }, skills: { include: { skill: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  }

  const gapSkills = await prisma.skill.findMany({ where: { id: { in: Array.from(wantedSkillIds) } } });

  return NextResponse.json({ courses, gapSkills });
}
