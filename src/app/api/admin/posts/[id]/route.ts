import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

// Mark all reports on a post as resolved (dismiss)
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.report.updateMany({ where: { postId: params.id }, data: { resolved: true } });
  return NextResponse.json({ ok: true });
}
