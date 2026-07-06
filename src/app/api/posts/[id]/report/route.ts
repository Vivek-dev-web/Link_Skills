import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { reason = "spam" } = await req.json().catch(() => ({}));

  await prisma.report.upsert({
    where: { postId_userId: { postId: params.id, userId: session.user.id } },
    update: { reason, resolved: false },
    create: { postId: params.id, userId: session.user.id, reason },
  });

  return NextResponse.json({ ok: true });
}
