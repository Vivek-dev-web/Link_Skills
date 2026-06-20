import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await prisma.user.update({ where: { id: session.user.id }, data: { deactivated: true } });
  return NextResponse.json({ ok: true });
}
