"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck, UserX, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

const ROLES = ["MEMBER", "RECRUITER", "PROVIDER", "ADMIN"];
const ROLE_COLOR: Record<string, string> = {
  ADMIN:     "bg-coral-light text-coral",
  RECRUITER: "bg-amber-light text-amber-dark",
  PROVIDER:  "bg-teal-light text-teal",
  MEMBER:    "bg-paper text-muted",
};

export default function AdminUsersPage() {
  const { show } = useToast();
  const [users, setUsers]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(p = page) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set("q", q);
    if (roleFilter) params.set("role", roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(1); setPage(1); }, [q, roleFilter]);

  async function updateUser(id: string, patch: Record<string, any>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...data } : u));
      show("Updated", "success");
    } else {
      show(data.error ?? "Failed", "error");
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Users <span className="text-muted text-lg font-sans">({total})</span></h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-8 !py-1.5 !text-sm w-48" placeholder="Search name or email…"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input !py-1.5 !text-sm !w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted hidden md:table-cell">Posts</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted hidden md:table-cell">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 bg-paper rounded animate-pulse" /></td></tr>
            ))}
            {!loading && users.map((u) => (
              <tr key={u.id} className={cn("hover:bg-paper/50 transition-colors", u.deactivated && "opacity-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} src={u.image} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-ink text-xs truncate max-w-[140px]">{u.name}</p>
                      <p className="text-[11px] text-muted truncate max-w-[140px]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => updateUser(u.id, { role: e.target.value })}
                    className={cn("text-xs rounded-lg px-2 py-1 border-0 font-medium cursor-pointer", ROLE_COLOR[u.role])}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted hidden md:table-cell">{u._count?.posts ?? 0}</td>
                <td className="px-4 py-3 text-xs text-muted hidden md:table-cell">{formatRelativeTime(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full",
                    u.deactivated ? "bg-coral-light text-coral" : "bg-teal-light text-teal")}>
                    {u.deactivated ? "Deactivated" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateUser(u.id, { deactivated: !u.deactivated })}
                    className="p-1.5 rounded-lg text-muted hover:bg-paper transition-colors"
                    title={u.deactivated ? "Reactivate" : "Deactivate"}
                  >
                    {u.deactivated ? <UserCheck size={14} className="text-teal" /> : <UserX size={14} className="text-coral" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => { setPage(page - 1); load(page - 1); }}
              className="p-1.5 rounded border border-border disabled:opacity-40 hover:bg-paper transition-colors"><ChevronLeft size={14} /></button>
            <button disabled={page === totalPages} onClick={() => { setPage(page + 1); load(page + 1); }}
              className="p-1.5 rounded border border-border disabled:opacity-40 hover:bg-paper transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
