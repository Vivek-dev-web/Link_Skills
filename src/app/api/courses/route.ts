import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const level = searchParams.get("level")?.trim();
  const skill = searchParams.get("skill")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 12;

  const AND: any[] = [{ published: true }];
  if (q) AND.push({ OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] });
  if (level) AND.push({ level });
  if (skill) AND.push({ skills: { some: { skill: { name: { contains: skill, mode: "insensitive" } } } } });

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: { AND },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        skills: { include: { skill: true } },
        _count: { select: { enrollments: true, reviews: true, modules: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.course.count({ where: { AND } }),
  ]);

  const withRating = courses.map((c) => {
    const avg = c.reviews.length
      ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
      : null;
    return { ...c, avgRating: avg, reviews: undefined };
  });

  return NextResponse.json({ courses: withRating, total, page, pageSize });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { skills, modules, ...courseData } = parsed.data;

  const skillRecords = await Promise.all(
    skills.map((name) =>
      prisma.skill.upsert({ where: { name: name.trim() }, update: {}, create: { name: name.trim() } })
    )
  );

  const course = await prisma.course.create({
    data: {
      ...courseData,
      creatorId: session.user.id,
      skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
      modules: {
        create: modules.map((m) => ({
          title: m.title,
          order: m.order,
          lessons: { create: m.lessons.map((l) => ({ ...l })) },
        })),
      },
    },
    include: { modules: { include: { lessons: true } }, skills: { include: { skill: true } } },
  });

  // Provider role granted on first course creation
  await prisma.user.update({ where: { id: session.user.id }, data: { role: "PROVIDER" } });

  return NextResponse.json(course);
}
