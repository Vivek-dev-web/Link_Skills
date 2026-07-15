import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatDateRange(
  start: Date | string,
  end: Date | string | null,
  current: boolean
): string {
  const fmt = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  if (current) return `${fmt(start)} — Present`;
  if (!end) return fmt(start);
  return `${fmt(start)} — ${fmt(end)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function formatSalary(min?: number | null, max?: number | null, location?: string | null): string {
  if (!min && !max) return "Salary not specified";

  const isIndia = location
    ? /, IN\b|India|Bangalore|Mumbai|Delhi|Pune|Hyderabad|Chennai|Bengaluru/.test(location)
    : (min ?? 0) >= 500_000 || (max ?? 0) >= 500_000; // fallback: large numbers = rupees

  if (isIndia) {
    const lpa = (n: number) => `${Math.round(n / 100_000)} LPA`;
    if (min && max) return `${lpa(min)} – ${lpa(max)}`;
    if (min) return `From ${lpa(min)}`;
    if (max) return `Up to ${lpa(max)}`;
  }

  const usd = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${usd(min)} – ${usd(max)}`;
  if (min) return `From ${usd(min)}`;
  if (max) return `Up to ${usd(max)}`;
  return "Salary not specified";
}

interface ProfileLike {
  image?: string | null;
  headline?: string | null;
  about?: string | null;
  location?: string | null;
  resumeUrl?: string | null;
  experiences?: unknown[];
  education?: unknown[];
  skills?: unknown[];
}

export function profileCompleteness(profile: ProfileLike): number {
  const checks = [
    !!profile.image,
    !!profile.headline,
    !!profile.about,
    !!profile.location,
    !!profile.resumeUrl,
    (profile.experiences?.length ?? 0) > 0,
    (profile.education?.length ?? 0) > 0,
    (profile.skills?.length ?? 0) > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function randomToken(length = 32): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
