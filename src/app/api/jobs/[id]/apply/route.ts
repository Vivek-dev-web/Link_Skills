import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id: params.id }, include: { company: true } });
  if (!job || job.status !== "OPEN") {
    return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 400 });
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_applicantId: { jobId: params.id, applicantId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "You already applied to this job" }, { status: 409 });

  const { resumeUrl, coverLetter } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const application = await prisma.application.create({
    data: {
      jobId: params.id,
      applicantId: session.user.id,
      resumeUrl: resumeUrl || user?.resumeUrl || null,
      coverLetter: coverLetter || null,
    },
  });

  // Notify everyone on the hiring side
  const members = await prisma.companyMember.findMany({ where: { companyId: job.companyId } });
  await Promise.all(
    members.map((m) =>
      notify({
        userId: m.userId,
        type: "APPLICATION_UPDATE",
        message: `${user?.name} applied to ${job.title}`,
        link: `/jobs/manage`,
      })
    )
  );

  return NextResponse.json(application);
}
