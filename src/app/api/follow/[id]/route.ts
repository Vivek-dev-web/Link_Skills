import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// params.id is the followeeId
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, followeeId: params.id },
  });
  return NextResponse.json({ ok: true });
}
