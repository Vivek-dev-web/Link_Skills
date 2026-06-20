import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const reviews = await prisma.courseReview.findMany({
    where: { courseId: params.id },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: params.id, userId: session.user.id } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Enroll in this course before reviewing it" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const review = await prisma.courseReview.upsert({
    where: { courseId_userId: { courseId: params.id, userId: session.user.id } },
    update: parsed.data,
    create: { ...parsed.data, courseId: params.id, userId: session.user.id },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(review);
}
