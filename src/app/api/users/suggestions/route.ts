import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// "People you may know" — ranks by mutual connections, then shared
// company/location, falling back to most recent members.
export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ users: [] });
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me) return NextResponse.json({ users: [] });

  const existingConnections = await prisma.connection.findMany({
    where: { OR: [{ requesterId: me.id }, { addresseeId: me.id }] },
  });
  const connectedIds = new Set<string>();
  existingConnections.forEach((c) => {
    connectedIds.add(c.requesterId === me.id ? c.addresseeId : c.requesterId);
  });
  connectedIds.add(me.id);

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: me.id }, { blockedId: me.id }] },
  });
  blocks.forEach((b) => connectedIds.add(b.blockerId === me.id ? b.blockedId : b.blockerId));

  // My accepted connections, to compute mutuals
  const myConnectionIds = existingConnections
    .filter((c) => c.status === "ACCEPTED")
    .map((c) => (c.requesterId === me.id ? c.addresseeId : c.requesterId));

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(connectedIds) },
      deactivated: false,
      visibility: { not: "PRIVATE" },
    },
    select: {
      id: true,
      name: true,
      image: true,
      headline: true,
      currentCompany: true,
      location: true,
      sentConnections: { where: { status: "ACCEPTED" }, select: { addresseeId: true } },
      receivedConnections: { where: { status: "ACCEPTED" }, select: { requesterId: true } },
    },
    take: 50,
  });

  const scored = candidates.map((c) => {
    const theirConnectionIds = [
      ...c.sentConnections.map((s) => s.addresseeId),
      ...c.receivedConnections.map((r) => r.requesterId),
    ];
    const mutuals = theirConnectionIds.filter((id) => myConnectionIds.includes(id)).length;
    let score = mutuals * 10;
    if (me.currentCompany && c.currentCompany === me.currentCompany) score += 5;
    if (me.location && c.location === me.location) score += 2;
    return {
      id: c.id,
      name: c.name,
      image: c.image,
      headline: c.headline,
      mutualConnections: mutuals,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return NextResponse.json({ users: scored.slice(0, 10) });
}
