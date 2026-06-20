import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { saveUploadedFile } from "@/lib/uploads";

const FOLDERS = ["photos", "posts", "resumes", "logos", "certificates"] as const;

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!folder || !FOLDERS.includes(folder as any)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  try {
    const url = await saveUploadedFile(file, folder as any);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Upload failed" }, { status: 400 });
  }
}
