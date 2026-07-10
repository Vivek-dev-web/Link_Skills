import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const {
    type, college, yearOfStudy, interestArea, question, timeSlot,
    currentRole, yearsExp, goal, challenge, mode, availableFrom,
  } = body;

  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  const consultation = await prisma.consultation.create({
    data: {
      userId: me.id,
      type,
      college:       college       || null,
      yearOfStudy:   yearOfStudy   || null,
      interestArea:  interestArea  || null,
      question:      question      || null,
      timeSlot:      timeSlot      || null,
      currentRole:   currentRole   || null,
      yearsExp:      yearsExp      ? Number(yearsExp) : null,
      goal:          goal          || null,
      challenge:     challenge     || null,
      mode:          mode          || null,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
    },
  });

  return NextResponse.json({ ok: true, id: consultation.id });
}
