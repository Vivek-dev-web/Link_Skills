"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, UserPlus, Briefcase, BookOpen, Hash, Flame, Check } from "lucide-react";
import Avatar from "@/components/Avatar";

const PROMOTED_COURSE = {
  title: "Azure Solutions Architect Expert (AZ-305)",
  provider: "Microsoft Learn",
  tag: "Most enrolled this week",
};

const TAG_COLORS = [
  "bg-teal/10 text-teal border-teal/20",
  "bg-amber/10 text-amber-dark border-amber/20",
  "bg-coral/10 text-coral border-coral/20",
  "bg-violet/10 text-violet border-violet/20",
  "bg-blue-500/10 text-blue-500 border-blue-500/20",
];

export default function FeedRightSidebar() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [trending, setTrending] = useState<{ tag: string; posts: string }[]>([]);
  const [connected, setConnected] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/users/suggestions").then((r) => r.json()).then((d) => setSuggestions((d.users ?? []).slice(0, 4)));
    fetch("/api/jobs/recommended").then((r) => r.json()).then((d) => setJobs((d.jobs ?? []).slice(0, 3)));
    fetch("/api/trending").then((r) => r.json()).then((d) => setTrending(d.trending ?? []));
  }, []);

  async function connectWith(userId: string) {
    setConnected((s) => new Set(s).add(userId));
    await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresseeId: userId }),
    });
    setTimeout(() => setSuggestions((s) => s.filter((u) => u.id !== userId)), 1200);
  }

  return (
    <aside className="w-[280px] shrink-0 hidden lg:block sticky top-20 space-y-3 self-start">

      {/* ── Promoted course ─────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="relative h-[88px] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #003B6F 0%, #0055A5 60%, #0078D4 100%)" }}>
          {/* animated pulse ring */}
          <div className="absolute top-4 right-4 w-10 h-10">
            <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "2.5s" }} />
            <div className="absolute inset-0 rounded-full bg-white/15 flex items-center justify-center">
              <BookOpen size={16} color="white" />
            </div>
          </div>
          {/* dot pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="rs-dots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rs-dots)" />
          </svg>
          <div className="absolute bottom-3 left-4 right-14">
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block mb-0.5">Promoted</span>
            <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{PROMOTED_COURSE.title}</p>
          </div>
        </div>
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs text-muted">{PROMOTED_COURSE.provider}</p>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-dark bg-amber/10 rounded-full px-2 py-0.5">
              <Flame size={9} /> Hot
            </span>
          </div>
          <Link href="/courses"
            className="btn-accent btn-sm w-full justify-center text-xs">
            Enroll free →
          </Link>
        </div>
      </div>

      {/* ── Trending ─────────────────────────────────────────────── */}
      {trending.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-teal" />
            <h3 className="font-semibold text-sm text-ink">Trending now</h3>
          </div>
          <div className="space-y-2">
            {trending.map((t, i) => (
              <div key={t.tag}
                className="flex items-center gap-2.5 group cursor-pointer rounded-lg px-2 py-1.5 hover:bg-paper transition-colors">
                <span className="text-xs font-bold text-muted w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold rounded-full border px-2 py-0.5 ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                    <Hash size={9} />{t.tag}
                  </span>
                  <p className="text-[10px] text-muted mt-0.5">{t.posts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── People you may know ──────────────────────────────────── */}
      {suggestions.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-ink">People to follow</h3>
            <Link href="/connections" className="text-[11px] text-teal font-medium hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {suggestions.map((u) => (
              <div key={u.id} className="flex items-center gap-2.5">
                <Link href={`/profile/${u.id}`} className="shrink-0">
                  <Avatar name={u.name} src={u.image} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${u.id}`}
                    className="text-xs font-semibold text-ink hover:text-teal block truncate transition-colors">
                    {u.name}
                  </Link>
                  <p className="text-[10px] text-muted truncate">{u.headline ?? "SkillWarehouse member"}</p>
                </div>
                <button
                  onClick={() => connectWith(u.id)}
                  disabled={connected.has(u.id)}
                  className={`shrink-0 flex items-center gap-1 rounded-full border text-[10px] font-semibold px-2.5 py-1 transition-all ${
                    connected.has(u.id)
                      ? "border-teal text-teal bg-teal/5"
                      : "border-border text-muted hover:border-teal hover:text-teal"
                  }`}
                >
                  {connected.has(u.id)
                    ? <><Check size={10} /> Sent</>
                    : <><UserPlus size={10} /> Follow</>
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Jobs picked for you ──────────────────────────────────── */}
      {jobs.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-ink">Jobs for you</h3>
            <Link href="/jobs" className="text-[11px] text-teal font-medium hover:underline">See all</Link>
          </div>
          <div className="space-y-2.5">
            {jobs.map((j) => (
              <Link key={j.id} href={`/jobs/${j.id}`}
                className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-paper transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0">
                  <Briefcase size={13} className="text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink group-hover:text-teal truncate transition-colors">
                    {j.title}
                  </p>
                  <p className="text-[10px] text-muted truncate">
                    {j.company?.name} · {j.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}
