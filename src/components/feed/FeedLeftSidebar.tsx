"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bookmark, GraduationCap, Users2, BarChart2,
  Calendar, Newspaper, Zap,
} from "lucide-react";
import Avatar from "@/components/Avatar";

const QUICK_LINKS = [
  { href: "/saved",        icon: Bookmark,      label: "Saved items",   color: "bg-amber/10 text-amber-dark"  },
  { href: "/courses/mine", icon: GraduationCap, label: "My Learning",   color: "bg-teal/10 text-teal"         },
  { href: "/groups",       icon: Users2,        label: "Groups",        color: "bg-violet/10 text-violet"     },
  { href: "/newsletters",  icon: Newspaper,     label: "Newsletters",   color: "bg-coral/10 text-coral"       },
  { href: "/events",       icon: Calendar,      label: "Events",        color: "bg-blue-500/10 text-blue-500" },
];

export default function FeedLeftSidebar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [stats, setStats] = useState<{ impressions: number | null; followers: number | null }>({
    impressions: null,
    followers: null,
  });

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setStats({
        impressions: d?.overview?.postImpressions7 ?? 0,
        followers:   d?.overview?.totalFollowers ?? 0,
      }))
      .catch(() => {});
  }, []);

  return (
    <aside className="w-60 shrink-0 hidden xl:block sticky top-20 space-y-3 self-start">

      {/* ── Profile card ───────────────────────────────────────── */}
      <div className="card">
        {/* Banner */}
        <div className="relative h-[48px] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B1120 0%, #0D3B38 50%, #0F7A72 100%)" }}>
          {/* grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ls-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ls-grid)" />
          </svg>
          {/* glow dot */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #0F7A72, transparent 70%)" }} />
        </div>

        <div className="px-4 pb-4">
          {/* Avatar overlapping banner */}
          <div className="relative z-10 -mt-7 mb-2.5">
            <Avatar
              name={user?.name ?? "?"}
              src={user?.image}
              size="lg"
              className="ring-[3px] ring-white"
            />
          </div>

          <Link href={`/profile/${user?.id}`}
            className="font-display font-semibold text-sm text-ink hover:text-teal transition-colors block leading-snug truncate">
            {user?.name}
          </Link>
          <p className="text-xs text-muted truncate mt-0.5">
            {user?.headline ?? "SkillWarehouse member"}
          </p>

          {/* Stats row */}
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2">
            <Link href="/analytics?tab=content"
              className="flex flex-col items-center rounded-lg bg-paper p-2 hover:bg-teal/5 hover:border-teal/20 border border-transparent transition-all group">
              <span className="font-display text-lg font-bold text-teal leading-none">
                {stats.impressions === null ? "—" : stats.impressions}
              </span>
              <span className="text-[10px] text-muted mt-0.5 text-center leading-tight">
                Impressions
              </span>
            </Link>
            <Link href="/analytics?tab=audience"
              className="flex flex-col items-center rounded-lg bg-paper p-2 hover:bg-teal/5 hover:border-teal/20 border border-transparent transition-all group">
              <span className="font-display text-lg font-bold text-teal leading-none">
                {stats.followers === null ? "—" : stats.followers}
              </span>
              <span className="text-[10px] text-muted mt-0.5 text-center leading-tight">
                Followers
              </span>
            </Link>
          </div>

          <Link href="/analytics"
            className="mt-3 flex items-center justify-center gap-1.5 text-xs text-teal font-semibold hover:underline">
            <BarChart2 size={12} /> View analytics
          </Link>
        </div>
      </div>

      {/* ── Quick links ─────────────────────────────────────────── */}
      <div className="card p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted px-2 mb-2">
          Quick links
        </p>
        <nav className="space-y-0.5">
          {QUICK_LINKS.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-ink hover:bg-paper transition-colors group">
              <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={13} />
              </span>
              <span className="group-hover:text-teal transition-colors">{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Skill level widget ──────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-teal/10 flex items-center justify-center">
            <Zap size={13} className="text-teal" />
          </div>
          <p className="text-xs font-bold text-ink">Profile strength</p>
        </div>
        <div className="space-y-2">
          {[
            { label: "Skills added",     done: true  },
            { label: "Photo uploaded",   done: !!user?.image },
            { label: "Headline set",     done: !!user?.headline },
            { label: "3+ connections",   done: (stats.followers ?? 0) >= 3 },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center ${
                done ? "bg-teal" : "border-2 border-border"
              }`}>
                {done && (
                  <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                    <path d="M1 3l1.5 1.5L6 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`text-xs ${done ? "text-ink line-through opacity-50" : "text-muted"}`}>{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-paper overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal to-teal/60 transition-all"
            style={{
              width: `${([!!user?.image, !!user?.headline, true, (stats.followers ?? 0) >= 3].filter(Boolean).length / 4) * 100}%`
            }}
          />
        </div>
      </div>

    </aside>
  );
}
