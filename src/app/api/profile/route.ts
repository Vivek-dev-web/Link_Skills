import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  return NextResponse.json(user);
}

// Supports updating just the photo or resume URL after an upload
export async function PATCH(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const allowed: Record<string, any> = {};
  if (typeof body.image === "string" || body.image === null) allowed.image = body.image ?? null;
  if (typeof body.resumeUrl === "string" || body.resumeUrl === null) allowed.resumeUrl = body.resumeUrl ?? null;

  const user = await prisma.user.update({ where: { id: session.user.id }, data: allowed });
  return NextResponse.json(user);
}
