import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const existing = await prisma.savedPost.findUnique({
    where: { postId_userId: { postId: params.id, userId: session.user.id } },
  });
  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }
  await prisma.savedPost.create({ data: { postId: params.id, userId: session.user.id } });
  return NextResponse.json({ saved: true });
}
