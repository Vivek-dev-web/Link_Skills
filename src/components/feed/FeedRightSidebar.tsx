"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, UserPlus, Briefcase, BookOpen, Hash } from "lucide-react";
import Avatar from "@/components/Avatar";

const TRENDING = [
  { tag: "AzureOpenAI", posts: "2.4k posts" },
  { tag: "Databricks", posts: "1.8k posts" },
  { tag: "KubernetesDay", posts: "1.2k posts" },
  { tag: "CloudSecurity", posts: "980 posts" },
  { tag: "AWSreinvent", posts: "756 posts" },
];

const PROMOTED_COURSE = {
  title: "Azure Solutions Architect Expert (AZ-305)",
  provider: "Microsoft Learn",
  gradient: "linear-gradient(135deg, #0078D4 0%, #004E8C 100%)",
};

export default function FeedRightSidebar() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/users/suggestions")
      .then((r) => r.json())
      .then((d) => setSuggestions((d.users ?? []).slice(0, 4)));
    fetch("/api/jobs/recommended")
      .then((r) => r.json())
      .then((d) => setJobs((d.jobs ?? []).slice(0, 3)));
  }, []);

  async function connectWith(userId: string) {
    await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresseeId: userId }),
    });
    setSuggestions((s) => s.filter((u) => u.id !== userId));
  }

  return (
    <aside className="w-72 shrink-0 hidden lg:block sticky top-20 space-y-3 self-start">
      {/* Promoted course */}
      <div className="card overflow-hidden">
        <div className="relative h-20 overflow-hidden" style={{ background: PROMOTED_COURSE.gradient }}>
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pc-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pc-dots)" />
          </svg>
          <div className="absolute inset-0 flex items-center px-4 gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <BookOpen size={16} color="white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Promoted</p>
              <p className="text-white text-xs font-semibold leading-snug line-clamp-2">
                {PROMOTED_COURSE.title}
              </p>
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs text-muted mb-2">{PROMOTED_COURSE.provider}</p>
          <Link href="/courses" className="btn-accent btn-sm w-full justify-center">
            Enroll free
          </Link>
        </div>
      </div>

      {/* Trending */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-teal" />
          <h3 className="font-semibold text-sm text-ink">Trending in Cloud &amp; Data</h3>
        </div>
        <div className="space-y-2.5">
          {TRENDING.map((t, i) => (
            <div key={t.tag} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted w-4">{i + 1}</span>
                <div>
                  <p className="text-xs font-semibold text-ink group-hover:text-teal transition-colors flex items-center gap-0.5">
                    <Hash size={10} className="text-muted" />{t.tag}
                  </p>
                  <p className="text-[10px] text-muted">{t.posts}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* People you may know */}
      {suggestions.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-ink mb-3">People you may know</h3>
          <div className="space-y-3">
            {suggestions.map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <Link href={`/profile/${u.id}`}>
                  <Avatar name={u.name} src={u.image} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${u.id}`}
                    className="text-xs font-semibold text-ink hover:text-teal block truncate"
                  >
                    {u.name}
                  </Link>
                  <p className="text-[11px] text-muted truncate">{u.headline ?? "Atlas member"}</p>
                </div>
                <button
                  onClick={() => connectWith(u.id)}
                  className="p-1.5 rounded-full border border-border hover:border-teal hover:text-teal text-muted transition-colors shrink-0"
                  title="Connect"
                >
                  <UserPlus size={12} />
                </button>
              </div>
            ))}
          </div>
          <Link href="/connections" className="text-xs text-teal font-medium block mt-3 hover:underline">
            See all suggestions →
          </Link>
        </div>
      )}

      {/* Jobs picked for you */}
      {jobs.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-ink mb-3">Jobs picked for you</h3>
          <div className="space-y-3">
            {jobs.map((j) => (
              <Link key={j.id} href={`/jobs/${j.id}`} className="block group">
                <p className="text-xs font-semibold text-ink group-hover:text-teal truncate transition-colors">
                  {j.title}
                </p>
                <p className="text-[11px] text-muted truncate">
                  {j.company?.name} · {j.location}
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/jobs"
            className="text-xs text-teal font-medium flex items-center gap-1 mt-3 hover:underline"
          >
            <Briefcase size={11} /> Browse all jobs →
          </Link>
        </div>
      )}
    </aside>
  );
}
