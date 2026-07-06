import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// One-time bootstrap: promotes the calling user to ADMIN if no admins exist yet.
export async function POST() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin) {
    return NextResponse.json({ error: "An admin already exists. Contact them to grant access." }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
