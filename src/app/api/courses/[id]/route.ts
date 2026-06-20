import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { id: true, name: true, image: true, headline: true } },
      skills: { include: { skill: true } },
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      reviews: { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const avgRating = course.reviews.length
    ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
    : null;

  let enrollment = null;
  let completedLessonIds: string[] = [];
  let isOwner = false;
  if (session?.user) {
    isOwner = session.user.id === course.creatorId;
    enrollment = await prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId: course.id, userId: session.user.id } },
    });
    if (enrollment) {
      const progress = await prisma.lessonProgress.findMany({
        where: { userId: session.user.id, completed: true, lesson: { module: { courseId: course.id } } },
      });
      completedLessonIds = progress.map((p) => p.lessonId);
    }
  }

  return NextResponse.json({ ...course, avgRating, enrollment, completedLessonIds, isOwner });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course || course.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = courseSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { skills, modules, ...courseData } = parsed.data;
  const updated = await prisma.course.update({ where: { id: params.id }, data: courseData });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course || course.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
