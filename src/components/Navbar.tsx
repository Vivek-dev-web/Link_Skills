"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  Users,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
  Home,
  FileText,
  Sparkles,
  ListChecks,
  Award,
  DollarSign,
  HardHat,
  Network,
  UserCheck,
  Users2,
  Calendar,
  Building2,
  Newspaper,
  BarChart2,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/feed",     label: "Feed",     icon: Home },
  { href: "/network",  label: "Network",  icon: Users },
  { href: "/jobs",     label: "Jobs",     icon: Briefcase },
  { href: "/courses",  label: "Learning", icon: GraduationCap },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/guidance", label: "Guidance", icon: Sparkles },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (active) setUnread(data.unreadCount ?? 0);
      } catch {
        // ignore transient polling errors
      }
    }
    poll();
    const id = setInterval(poll, 8000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-border shadow-card">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/feed" className="text-ink shrink-0">
          <Logo />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xs">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, jobs, courses…"
              className="w-full rounded-full border border-border bg-paper pl-9 pr-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-teal transition-colors"
            />
          </div>
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center px-3 py-2 rounded-lg text-[11px] font-medium gap-0.5 transition-colors",
                  active ? "text-teal" : "text-muted hover:text-ink"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Notifications */}
        <Link
          href="/notifications"
          className={cn(
            "relative ml-1 md:ml-0 flex flex-col items-center px-3 py-2 rounded-lg transition-colors",
            pathname === "/notifications" ? "text-teal" : "text-muted hover:text-ink"
          )}
        >
          <Bell size={20} strokeWidth={pathname === "/notifications" ? 2.4 : 1.8} />
          {unread > 0 && (
            <span className="absolute top-1 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-teal text-white text-[10px] leading-4 text-center font-semibold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        {/* Profile menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-paper transition-colors"
          >
            <Avatar name={user?.name ?? "?"} src={user?.image} size="sm" />
            <ChevronDown size={14} className="text-muted" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 card p-2 z-50 shadow-pop max-h-[80vh] overflow-y-auto">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="font-medium text-sm text-ink truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <Link
                href={`/profile/${(user as any)?.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-paper transition-colors"
              >
                <UserIcon size={16} /> View profile
              </Link>
              <Link
                href="/analytics"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-paper transition-colors"
              >
                <BarChart2 size={16} className="text-muted" /> Analytics
              </Link>

              <div className="px-3 py-1 mt-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Network</p>
              </div>
              {[
                { href: "/network",     label: "Manage my network", icon: Network    },
                { href: "/following",   label: "Following & followers", icon: UserCheck  },
                { href: "/groups",      label: "Groups",            icon: Users2      },
                { href: "/events",      label: "Events",            icon: Calendar    },
                { href: "/pages",       label: "Pages",             icon: Building2   },
                { href: "/newsletters", label: "Newsletters",       icon: Newspaper   },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-paper transition-colors"
                >
                  <Icon size={16} className="text-muted" /> {label}
                </Link>
              ))}

              <div className="px-3 py-1 mt-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Job Tools</p>
              </div>
              {[
                { href: "/resume",        label: "Resume Manager",    icon: FileText    },
                { href: "/my-jobs",       label: "My Jobs",           icon: ListChecks  },
                { href: "/recommended",   label: "Recommended Jobs",  icon: Sparkles    },
                { href: "/assessments",   label: "Skill Assessments", icon: Award       },
                { href: "/salaries",      label: "Salary Insights",   icon: DollarSign  },
                { href: "/hire",          label: "Hire (Recruiter)",  icon: HardHat     },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-paper transition-colors"
                >
                  <Icon size={16} className="text-muted" /> {label}
                </Link>
              ))}

              <div className="border-t border-border mt-1 pt-1">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-paper transition-colors"
                >
                  <Settings size={16} /> Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-coral hover:bg-coral-light transition-colors"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden flex items-center justify-around border-t border-border py-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center px-2 py-1.5 text-[10px] gap-0.5 transition-colors",
                active ? "text-teal" : "text-muted"
              )}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
