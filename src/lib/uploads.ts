import { randomToken } from "@/lib/utils";

const ALLOWED_TYPES: Record<string, string[]> = {
  photos: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  posts: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"],
  resumes: ["application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  logos: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  certificates: ["application/pdf"],
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function validate(file: File, folder: keyof typeof ALLOWED_TYPES) {
  if (!file || file.size === 0) throw new Error("No file provided.");
  if (file.size > MAX_BYTES) throw new Error("File is too large (max 8 MB).");
  const allowed = ALLOWED_TYPES[folder];
  if (allowed && !allowed.includes(file.type))
    throw new Error(`Unsupported file type: ${file.type}`);
}

async function saveToBlob(file: File, folder: string): Promise<string> {
  const { put } = await import("@vercel/blob");
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const filename = `${folder}/${Date.now()}-${randomToken(8)}.${ext}`;
  const blob = await put(filename, file, { access: "public" });
  return blob.url;
}

async function saveToDisk(file: File, folder: string): Promise<string> {
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const filename = `${Date.now()}-${randomToken(8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}

export async function saveUploadedFile(
  file: File,
  folder: keyof typeof ALLOWED_TYPES
): Promise<string> {
  validate(file, folder);
  // Use Vercel Blob in production; fall back to local disk in dev
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return saveToBlob(file, folder);
  }
  return saveToDisk(file, folder);
}
