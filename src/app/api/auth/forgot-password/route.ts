import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomToken } from "@/lib/utils";

// Local/dev build has no email service configured, so instead of sending a
// reset email we generate the token and hand the reset link straight back.
// Swap this for a real mailer (Resend, SES, etc.) in production — just
// stop returning `resetUrl` in the response once you do.
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    // Don't reveal whether the account exists
    return NextResponse.json({ ok: true });
  }

  const token = randomToken(40);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + 1000 * 60 * 60) },
  });

  console.log(`[SkillWarehouse] Password reset link for ${user.email}: /reset-password?token=${token}`);

  return NextResponse.json({ ok: true, resetUrl: `/reset-password?token=${token}` });
}
