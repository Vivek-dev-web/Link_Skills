import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, lesson: { module: { courseId: params.id } } },
  });
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: params.id, userId: session.user.id } },
  });

  return NextResponse.json({ progress, enrollment });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { lessonId, completed = true } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "lessonId is required" }, { status: 400 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: params.id, userId: session.user.id } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Enroll in this course first" }, { status: 403 });
  }

  await prisma.lessonProgress.upsert({
    where: { lessonId_userId: { lessonId, userId: session.user.id } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { lessonId, userId: session.user.id, completed, completedAt: completed ? new Date() : null },
  });

  // Recompute overall percent complete
  const allLessons = await prisma.lesson.findMany({
    where: { module: { courseId: params.id } },
    select: { id: true },
  });
  const doneCount = await prisma.lessonProgress.count({
    where: {
      userId: session.user.id,
      completed: true,
      lessonId: { in: allLessons.map((l) => l.id) },
    },
  });
  const percent = allLessons.length ? Math.round((doneCount / allLessons.length) * 100) : 0;
  const justCompleted = percent === 100 && !enrollment.completedAt;

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progressPercent: percent,
      lastAccessedAt: new Date(),
      completedAt: percent === 100 ? enrollment.completedAt ?? new Date() : enrollment.completedAt,
    },
  });

  if (justCompleted) {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: { skills: { include: { skill: true } } },
    });

    if (course) {
      // Auto-populate the user's skill section with what this course teaches
      await Promise.all(
        course.skills.map((cs) =>
          prisma.userSkill.upsert({
            where: { userId_skillId: { userId: session.user.id, skillId: cs.skillId } },
            update: {},
            create: {
              userId: session.user.id,
              skillId: cs.skillId,
              source: `course:${course.id}`,
            },
          })
        )
      );

      await prisma.certificate.upsert({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        update: {},
        create: { userId: session.user.id, courseId: course.id, courseName: course.title },
      });

      await notify({
        userId: session.user.id,
        type: "COURSE_UPDATE",
        message: `You completed "${course.title}" — your certificate is ready`,
        link: `/courses/${course.id}/learn`,
      });
    }
  }

  return NextResponse.json({ enrollment: updatedEnrollment, percent, justCompleted });
}
