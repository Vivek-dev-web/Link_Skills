import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: params.id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json(existing);

  const enrollment = await prisma.enrollment.create({
    data: { courseId: params.id, userId: session.user.id, lastAccessedAt: new Date() },
  });

  await notify({
    userId: course.creatorId,
    type: "COURSE_UPDATE",
    message: `Someone enrolled in your course "${course.title}"`,
    link: `/courses/${params.id}`,
  });

  return NextResponse.json(enrollment);
}
