import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

// GET /api/connections?status=PENDING&type=received
export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const type = searchParams.get("type") ?? "all"; // sent | received | all

  const where: any = {
    ...(status ? { status } : {}),
    ...(type === "sent"
      ? { requesterId: session.user.id }
      : type === "received"
      ? { addresseeId: session.user.id }
      : { OR: [{ requesterId: session.user.id }, { addresseeId: session.user.id }] }),
  };

  const connections = await prisma.connection.findMany({
    where,
    include: {
      requester: { select: { id: true, name: true, image: true, headline: true } },
      addressee: { select: { id: true, name: true, image: true, headline: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ connections });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { addresseeId } = await req.json();
  if (!addresseeId || addresseeId === session.user.id) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: session.user.id, addresseeId },
        { requesterId: addresseeId, addresseeId: session.user.id },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: "A connection already exists with this person" }, { status: 409 });
  }

  const connection = await prisma.connection.create({
    data: { requesterId: session.user.id, addresseeId, status: "PENDING" },
  });

  const requester = await prisma.user.findUnique({ where: { id: session.user.id } });
  await notify({
    userId: addresseeId,
    type: "CONNECTION_REQUEST",
    message: `${requester?.name} sent you a connection request`,
    link: `/connections`,
  });

  return NextResponse.json(connection);
}
