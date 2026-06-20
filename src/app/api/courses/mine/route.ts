import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ enrolled: [], created: [] });

  const [enrollments, created] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: { creator: { select: { name: true } }, _count: { select: { modules: true } } },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
    }),
    prisma.course.findMany({
      where: { creatorId: session.user.id },
      include: { _count: { select: { enrollments: true, modules: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ enrolled: enrollments, created });
}
