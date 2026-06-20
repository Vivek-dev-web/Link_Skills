import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Endorse another user's skill (params.id is the UserSkill id)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const userSkill = await prisma.userSkill.findUnique({ where: { id: params.id } });
  if (!userSkill) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (userSkill.userId === session.user.id) {
    return NextResponse.json({ error: "You can't endorse your own skill" }, { status: 400 });
  }

  const updated = await prisma.userSkill.update({
    where: { id: params.id },
    data: { endorsements: { increment: 1 } },
  });
  return NextResponse.json(updated);
}
