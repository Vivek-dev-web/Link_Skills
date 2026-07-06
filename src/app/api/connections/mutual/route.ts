import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("userId");
  if (!targetId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [myConns, theirConns] = await Promise.all([
    prisma.connection.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: me.id }, { addresseeId: me.id }] },
      select: { requesterId: true, addresseeId: true },
    }),
    prisma.connection.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: targetId }, { addresseeId: targetId }] },
      select: { requesterId: true, addresseeId: true },
    }),
  ]);

  const myIds = new Set(myConns.map((c) => (c.requesterId === me.id ? c.addresseeId : c.requesterId)));
  const theirIds = new Set(theirConns.map((c) => (c.requesterId === targetId ? c.addresseeId : c.requesterId)));
  const mutualIds = [...myIds].filter((id) => theirIds.has(id));

  if (mutualIds.length === 0) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: { id: { in: mutualIds } },
    select: { id: true, name: true, image: true, headline: true },
    take: 10,
  });

  return NextResponse.json({ users });
}
