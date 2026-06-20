import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomToken } from "@/lib/utils";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES: Record<string, string[]> = {
  photos: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  posts: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"],
  resumes: ["application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  logos: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  certificates: ["application/pdf"],
};

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

/**
 * Saves an uploaded File to /public/uploads/<folder>/ and returns the
 * public URL path (e.g. "/uploads/photos/abc123.png"). This stands in for
 * an S3 bucket — swap this implementation out for an S3 SDK call later
 * without touching any call sites.
 */
export async function saveUploadedFile(
  file: File,
  folder: keyof typeof ALLOWED_TYPES
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large (max 8MB).");
  }
  const allowed = ALLOWED_TYPES[folder];
  if (allowed && !allowed.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const filename = `${Date.now()}-${randomToken(8)}.${ext}`;
  const filepath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${folder}/${filename}`;
}
