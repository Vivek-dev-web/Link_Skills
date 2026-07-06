"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Trash2, ChevronLeft, ChevronRight, Flag, ExternalLink } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

export default function AdminPostsPage() {
  const { show } = useToast();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<"all" | "reported">(
    searchParams.get("filter") === "reported" ? "reported" : "all"
  );
  const [posts, setPosts]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function load(p = page, f = filter) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (f === "reported") params.set("filter", "reported");
    const res = await fetch(`/api/admin/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(1, filter); setPage(1); }, [filter]);

  async function dismissReports(id: string) {
    setActing(id + "_dismiss");
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolveReports: true }),
    });
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, _count: { ...p._count, reports: 0 } } : p));
      if (filter === "reported") setPosts((prev) => prev.filter((p) => p.id !== id));
      show("Reports dismissed", "success");
    } else {
      show("Failed", "error");
    }
    setActing(null);
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    setActing(id + "_delete");
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
      show("Post deleted", "success");
    } else {
      show("Failed to delete", "error");
    }
    setActing(null);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Posts <span className="text-muted text-lg font-sans">({total})</span></h1>
        <div className="flex gap-1 bg-paper rounded-lg p-0.5 border border-border">
          {(["all", "reported"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                filter === f ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink")}>
              {f === "reported" ? <span className="flex items-center gap-1"><Flag size={11} /> Reported</span> : "All posts"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4 h-20 animate-pulse" />
        ))}
        {!loading && posts.length === 0 && (
          <div className="bg-white rounded-xl border border-border p-8 text-center text-muted text-sm">
            {filter === "reported" ? "No unresolved reports." : "No posts found."}
          </div>
        )}
        {!loading && posts.map((p) => {
          const reportCount = p._count?.reports ?? 0;
          return (
            <div key={p.id} className={cn("bg-white rounded-xl border p-4 flex items-start gap-3",
              reportCount > 0 ? "border-coral/40" : "border-border")}>
              <Avatar name={p.author?.name} src={p.author?.image} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-ink">{p.author?.name}</span>
                  <span className="text-[11px] text-muted">{formatRelativeTime(p.createdAt)}</span>
                  {reportCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[11px] font-medium text-coral bg-coral-light px-1.5 py-0.5 rounded-full">
                      <Flag size={10} fill="currentColor" /> {reportCount} report{reportCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1 line-clamp-2">{p.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={`/posts/${p.id}`} target="_blank" rel="noreferrer"
                  className="p-1.5 rounded-lg text-muted hover:bg-paper transition-colors">
                  <ExternalLink size={13} />
                </a>
                {reportCount > 0 && (
                  <button
                    onClick={() => dismissReports(p.id)}
                    disabled={acting === p.id + "_dismiss"}
                    title="Dismiss all reports"
                    className="p-1.5 rounded-lg text-muted hover:bg-teal-light hover:text-teal transition-colors disabled:opacity-50"
                  >
                    <ShieldCheck size={13} />
                  </button>
                )}
                <button
                  onClick={() => deletePost(p.id)}
                  disabled={acting === p.id + "_delete"}
                  title="Delete post"
                  className="p-1.5 rounded-lg text-muted hover:bg-coral-light hover:text-coral transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
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
