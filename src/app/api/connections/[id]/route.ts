import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { status } = await req.json();
  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const connection = await prisma.connection.findUnique({ where: { id: params.id } });
  if (!connection || connection.addresseeId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.connection.update({ where: { id: params.id }, data: { status } });

  if (status === "ACCEPTED") {
    const addressee = await prisma.user.findUnique({ where: { id: session.user.id } });
    await notify({
      userId: connection.requesterId,
      type: "CONNECTION_ACCEPTED",
      message: `${addressee?.name} accepted your connection request`,
      link: `/profile/${session.user.id}`,
    });
  }

  return NextResponse.json(updated);
}

// Withdraw (if pending requester) or remove (if accepted, either side)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const connection = await prisma.connection.findUnique({ where: { id: params.id } });
  if (
    !connection ||
    (connection.requesterId !== session.user.id && connection.addresseeId !== session.user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.connection.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
