import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { applicationStatusSchema } from "@/lib/validations";
import { notify } from "@/lib/notify";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: { job: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: application.job.companyId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await req.json();
  const parsed = applicationStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });

  await notify({
    userId: application.applicantId,
    type: "APPLICATION_UPDATE",
    message: `Your application for ${application.job.title} moved to "${parsed.data.status}"`,
    link: `/jobs/${application.jobId}`,
  });

  return NextResponse.json(updated);
}
