import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await prisma.block.deleteMany({
    where: { blockerId: session.user.id, blockedId: params.id },
  });
  return NextResponse.json({ ok: true });
}
