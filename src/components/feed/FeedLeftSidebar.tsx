"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, GraduationCap, Users2, BarChart2, Calendar, Newspaper } from "lucide-react";
import Avatar from "@/components/Avatar";

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
      .then((d) => {
        setStats({
          impressions: d?.overview?.postImpressions7 ?? 0,
          followers: d?.overview?.totalFollowers ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="w-56 shrink-0 hidden xl:block sticky top-20 space-y-3 self-start">
      {/* Mini profile card */}
      <div className="card overflow-hidden">
        <div
          className="h-14"
          style={{ background: "linear-gradient(135deg, #1B1F3B 0%, #2D3158 60%, #00C4A7 100%)" }}
        />
        <div className="px-4 pb-4">
          <div className="-mt-6 mb-2">
            <Avatar
              name={user?.name ?? "?"}
              src={user?.image}
              size="lg"
              className="ring-2 ring-surface"
            />
          </div>
          <Link
            href={`/profile/${user?.id}`}
            className="font-semibold text-sm text-ink hover:text-teal block truncate leading-snug"
          >
            {user?.name}
          </Link>
          <p className="text-xs text-muted truncate mt-0.5">
            {user?.headline ?? "Atlas member"}
          </p>

          {/* Stats — clickable, link to /analytics */}
          <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs">
            <Link
              href="/analytics?tab=content"
              className="flex items-center justify-between group hover:text-teal transition-colors"
            >
              <span className="text-muted group-hover:text-teal">Post impressions</span>
              <span className="font-semibold text-teal">
                {stats.impressions === null ? "—" : stats.impressions}
              </span>
            </Link>
            <Link
              href="/analytics?tab=audience"
              className="flex items-center justify-between group hover:text-teal transition-colors"
            >
              <span className="text-muted group-hover:text-teal">Followers</span>
              <span className="font-semibold text-teal">
                {stats.followers === null ? "—" : stats.followers}
              </span>
            </Link>
          </div>

          <Link
            href="/analytics"
            className="mt-3 flex items-center justify-center gap-1.5 text-xs text-teal font-medium hover:underline"
          >
            <BarChart2 size={12} /> View full analytics
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="card p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted px-2 mb-1">
          Quick links
        </p>
        <nav className="space-y-0.5">
          {[
            { href: "/jobs/saved",   icon: Bookmark,       label: "Saved items"  },
            { href: "/courses/mine", icon: GraduationCap,  label: "My Learning"  },
            { href: "/groups",       icon: Users2,         label: "Groups"       },
            { href: "/newsletters",  icon: Newspaper,      label: "Newsletters"  },
            { href: "/events",       icon: Calendar,       label: "Events"       },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-ink hover:bg-paper hover:text-teal transition-colors"
            >
              <Icon size={14} className="text-muted shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
