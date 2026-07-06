"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, UserCheck, Users2, Calendar, Building2, Newspaper, ChevronRight, Network } from "lucide-react";

const SECTIONS = [
  {
    href: "/connections",
    label: "Connections",
    icon: Users,
    color: "text-teal",
    bg: "bg-teal-light",
    desc: "Manage your professional connections",
  },
  {
    href: "/following",
    label: "Following & followers",
    icon: UserCheck,
    color: "text-coral",
    bg: "bg-coral-light",
    desc: "People and companies you follow",
  },
  {
    href: "/groups",
    label: "Groups",
    icon: Users2,
    color: "text-amber-dark",
    bg: "bg-amber-light",
    desc: "Communities built around shared interests",
  },
  {
    href: "/events",
    label: "Events",
    icon: Calendar,
    color: "text-teal",
    bg: "bg-teal-light",
    desc: "Attend webinars, workshops, and conferences",
  },
  {
    href: "/pages",
    label: "Pages",
    icon: Building2,
    color: "text-coral",
    bg: "bg-coral-light",
    desc: "Companies and creators worth following",
  },
  {
    href: "/newsletters",
    label: "Newsletters",
    icon: Newspaper,
    color: "text-amber-dark",
    bg: "bg-amber-light",
    desc: "Subscribe to professional insights",
  },
];

export default function NetworkPage() {
  const [stats, setStats] = useState({ connections: 0, following: 0, followers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/connections?status=ACCEPTED").then((r) => r.json()),
      fetch("/api/follow?type=following").then((r) => r.json()),
      fetch("/api/follow?type=followers").then((r) => r.json()),
    ])
      .then(([c, following, followers]) => {
        setStats({
          connections: c.connections?.length ?? 0,
          following: following.follows?.length ?? 0,
          followers: followers.follows?.length ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
          <Network size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-ink">Manage my network</h1>
          <p className="text-sm text-muted">Your connections, communities, and subscriptions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-0 grid grid-cols-3 divide-x divide-border">
        {[
          { label: "Connections", value: stats.connections, href: "/connections" },
          { label: "Following", value: stats.following, href: "/following" },
          { label: "Followers", value: stats.followers, href: "/following?tab=followers" },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href} className="px-4 py-5 text-center hover:bg-paper transition-colors rounded-sm">
            <p className={`font-display text-2xl text-ink ${loading ? "opacity-40" : ""}`}>{loading ? "—" : value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Section links */}
      <div className="card divide-y divide-border">
        {SECTIONS.map(({ href, label, icon: Icon, color, bg, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 p-4 hover:bg-paper transition-colors group"
          >
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color} shrink-0`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink group-hover:text-teal transition-colors">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-muted shrink-0" />
          </Link>
        ))}
      </div>

      {/* Grow your network CTA */}
      <div className="card p-5 gradient-brand text-white rounded-xl">
        <p className="font-display text-lg">Grow your network</p>
        <p className="text-sm opacity-80 mt-1">Discover professionals who share your skills and interests.</p>
        <Link
          href="/connections"
          className="mt-4 inline-flex items-center gap-2 bg-white text-ink text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          <Users size={15} /> Find connections
        </Link>
      </div>
    </div>
  );
}
