"use client";

import { useEffect, useState } from "react";
import { Search, Star, Zap, Trash2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

const STATUS_OPTS = ["", "OPEN", "CLOSED", "DRAFT"];
const STATUS_COLOR: Record<string, string> = {
  OPEN:   "bg-teal-light text-teal",
  CLOSED: "bg-coral-light text-coral",
  DRAFT:  "bg-paper text-muted",
};

export default function AdminJobsPage() {
  const { show } = useToast();
  const [jobs, setJobs]     = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load(p = page) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(1); setPage(1); }, [q, status]);

  async function patch(id: string, patch: Record<string, any>) {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) {
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, ...data } : j));
      show("Updated", "success");
    } else {
      show(data.error ?? "Failed", "error");
    }
  }

  async function deleteJob(id: string) {
    if (!confirm("Delete this job permanently?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setTotal((t) => t - 1);
      show("Job deleted", "success");
    } else {
      show("Failed to delete", "error");
    }
    setDeleting(null);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Jobs <span className="text-muted text-lg font-sans">({total})</span></h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-8 !py-1.5 !text-sm w-48" placeholder="Search title or company…"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input !py-1.5 !text-sm !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            {STATUS_OPTS.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted hidden md:table-cell">Company</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted hidden sm:table-cell">Posted</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted">Featured</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted">Promoted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 bg-paper rounded animate-pulse" /></td></tr>
            ))}
            {!loading && jobs.map((j) => (
              <tr key={j.id} className="hover:bg-paper/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink text-xs truncate max-w-[160px]">{j.title}</p>
                  <p className="text-[11px] text-muted">{j.type} · {j.location}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted hidden md:table-cell truncate max-w-[120px]">
                  {j.company?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", STATUS_COLOR[j.status] ?? "bg-paper text-muted")}>
                    {j.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">{formatRelativeTime(j.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => patch(j.id, { featured: !j.featured })}
                    className={cn("p-1.5 rounded-lg transition-colors", j.featured ? "text-amber bg-amber-light" : "text-muted hover:bg-paper")}
                    title={j.featured ? "Remove featured" : "Mark featured"}
                  >
                    <Star size={13} fill={j.featured ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => patch(j.id, { promoted: !j.promoted })}
                    className={cn("p-1.5 rounded-lg transition-colors", j.promoted ? "text-coral bg-coral-light" : "text-muted hover:bg-paper")}
                    title={j.promoted ? "Remove promoted" : "Mark promoted"}
                  >
                    <Zap size={13} fill={j.promoted ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <a href={`/jobs/${j.id}`} target="_blank" rel="noreferrer"
                      className="p-1.5 rounded-lg text-muted hover:bg-paper transition-colors">
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={() => deleteJob(j.id)}
                      disabled={deleting === j.id}
                      className="p-1.5 rounded-lg text-muted hover:bg-coral-light hover:text-coral transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
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
