import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      skills: { include: { skill: true } },
      postedBy: { select: { id: true, name: true, image: true } },
    },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let hasApplied = false;
  let isSaved = false;
  let canManage = false;
  if (session?.user) {
    const [application, saved, member] = await Promise.all([
      prisma.application.findUnique({
        where: { jobId_applicantId: { jobId: job.id, applicantId: session.user.id } },
      }),
      prisma.savedJob.findUnique({
        where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
      }),
      prisma.companyMember.findUnique({
        where: { companyId_userId: { companyId: job.companyId, userId: session.user.id } },
      }),
    ]);
    hasApplied = !!application;
    isSaved = !!saved;
    canManage = !!member;
  }

  return NextResponse.json({ ...job, hasApplied, isSaved, canManage });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: job.companyId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await req.json();
  const parsed = jobSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { skills, ...jobData } = parsed.data;

  if (skills) {
    const skillRecords = await Promise.all(
      skills.map((name) =>
        prisma.skill.upsert({ where: { name: name.trim() }, update: {}, create: { name: name.trim() } })
      )
    );
    await prisma.jobSkill.deleteMany({ where: { jobId: params.id } });
    await prisma.jobSkill.createMany({
      data: skillRecords.map((s) => ({ jobId: params.id, skillId: s.id })),
    });
  }

  const updated = await prisma.job.update({
    where: { id: params.id },
    data: jobData,
    include: { company: true, skills: { include: { skill: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: job.companyId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
