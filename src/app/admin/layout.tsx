"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, FileText, ShieldAlert, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",       label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users",     icon: Users           },
  { href: "/admin/jobs",  label: "Jobs",      icon: Briefcase       },
  { href: "/admin/posts", label: "Posts",     icon: FileText        },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.replace("/feed");
    }
  }, [status, session, router]);

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-teal border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-ink text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-teal" />
            <span className="font-display font-semibold text-sm">Atlas Admin</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1 truncate">{session?.user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active ? "bg-teal text-ink font-medium" : "text-white/70 hover:bg-white/10 hover:text-white")}>
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link href="/feed" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors mb-1">
            ← Back to app
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
