"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bookmark, GraduationCap, Users2, TrendingUp } from "lucide-react";
import Avatar from "@/components/Avatar";

export default function FeedLeftSidebar() {
  const { data: session } = useSession();
  const user = session?.user as any;

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
            {(user as any)?.headline ?? "Atlas member"}
          </p>
          <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Profile views</span>
              <span className="font-semibold text-teal">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Post impressions</span>
              <span className="font-semibold text-teal">—</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="card p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted px-2 mb-1">
          Quick links
        </p>
        <nav className="space-y-0.5">
          {[
            { href: "/jobs/saved", icon: Bookmark, label: "Saved Jobs" },
            { href: "/courses/mine", icon: GraduationCap, label: "My Learning" },
            { href: "/connections", icon: Users2, label: "My Network" },
            { href: "/feed", icon: TrendingUp, label: "Trending" },
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
