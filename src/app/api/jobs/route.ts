import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validations";
import { notify } from "@/lib/notify";

// GET /api/jobs?q=&location=&workType=&experienceLevel=&remote=&skill=&minSalary=&page=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const location = searchParams.get("location")?.trim();
  const workType = searchParams.get("workType")?.trim();
  const experienceLevel = searchParams.get("experienceLevel")?.trim();
  const remote = searchParams.get("remote");
  const skill = searchParams.get("skill")?.trim();
  const minSalary = searchParams.get("minSalary");
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 12;

  const AND: any[] = [{ status: "OPEN" }];
  if (q) {
    AND.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  }
  if (location) AND.push({ location: { contains: location, mode: "insensitive" } });
  if (workType) AND.push({ workType });
  if (experienceLevel) AND.push({ experienceLevel });
  if (remote === "true") AND.push({ remote: true });
  if (skill) AND.push({ skills: { some: { skill: { name: { contains: skill, mode: "insensitive" } } } } });
  if (minSalary) AND.push({ salaryMax: { gte: Number(minSalary) } });

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: { AND },
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: sort === "salary" ? { salaryMax: "desc" } : { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where: { AND } }),
  ]);

  return NextResponse.json({ jobs, total, page, pageSize });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const member = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: parsed.data.companyId, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "You must be a member of this company to post jobs" }, { status: 403 });
  }

  const { skills, ...jobData } = parsed.data;

  const skillRecords = await Promise.all(
    skills.map((name) =>
      prisma.skill.upsert({ where: { name: name.trim() }, update: {}, create: { name: name.trim() } })
    )
  );

  const job = await prisma.job.create({
    data: {
      ...jobData,
      postedById: session.user.id,
      skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
    },
    include: { company: true, skills: { include: { skill: true } } },
  });

  // Notify candidates whose listed skills match this job, capped to keep it light
  if (job.status === "OPEN" && skillRecords.length) {
    const matches = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        skills: { some: { skillId: { in: skillRecords.map((s) => s.id) } } },
      },
      take: 25,
    });
    await Promise.all(
      matches.map((u) =>
        notify({
          userId: u.id,
          type: "JOB_MATCH",
          message: `New job matching your skills: ${job.title} at ${job.company.name}`,
          link: `/jobs/${job.id}`,
        })
      )
    );
  }

  return NextResponse.json(job);
}
