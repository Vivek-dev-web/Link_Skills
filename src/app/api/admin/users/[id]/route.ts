import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const allowed = ["role", "deactivated"];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  // Prevent admin from revoking their own admin role
  if (params.id === session?.user?.id && data.role && data.role !== "ADMIN") {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, deactivated: true },
  });

  return NextResponse.json(user);
}
