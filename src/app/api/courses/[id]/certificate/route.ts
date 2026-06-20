import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateCertificatePdf } from "@/lib/certificate";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const certificate = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: params.id } },
  });
  if (!certificate) {
    return NextResponse.json(
      { error: "Complete the course to unlock your certificate." },
      { status: 404 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const dir = path.join(process.cwd(), "public", "uploads", "certificates");
  await mkdir(dir, { recursive: true });
  const filename = `${certificate.id}.pdf`;
  const filepath = path.join(dir, filename);
  const publicUrl = `/uploads/certificates/${filename}`;

  let bytes: Uint8Array;
  try {
    bytes = await readFile(filepath);
  } catch {
    bytes = await generateCertificatePdf({
      recipientName: user?.name ?? "Atlas member",
      courseName: certificate.courseName,
      issuedAt: certificate.issuedAt,
      certificateId: certificate.id,
    });
    await writeFile(filepath, bytes);
    if (!certificate.fileUrl) {
      await prisma.certificate.update({ where: { id: certificate.id }, data: { fileUrl: publicUrl } });
    }
  }

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${certificate.courseName.replace(/[^a-z0-9]+/gi, "-")}-certificate.pdf"`,
    },
  });
}
