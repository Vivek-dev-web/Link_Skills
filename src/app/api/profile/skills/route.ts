import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
  }
  const cleanName = name.trim();

  const skill = await prisma.skill.upsert({
    where: { name: cleanName },
    update: {},
    create: { name: cleanName },
  });

  const existing = await prisma.userSkill.findUnique({
    where: { userId_skillId: { userId: session.user.id, skillId: skill.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have this skill listed" }, { status: 409 });
  }

  const userSkill = await prisma.userSkill.create({
    data: { userId: session.user.id, skillId: skill.id },
    include: { skill: true },
  });
  return NextResponse.json(userSkill);
}
