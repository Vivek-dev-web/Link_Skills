"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bookmark, Briefcase, FileText, Loader2, MapPin, Heart } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import EmptyState from "@/components/EmptyState";
import { formatRelativeTime, formatSalary } from "@/lib/utils";
import { WORK_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SavedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") ?? "posts") as "posts" | "jobs";

  const [posts, setPosts]         = useState<any[] | null>(null);
  const [jobs,  setJobs]          = useState<any[] | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/posts/saved")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]));

    fetch("/api/jobs/saved")
      .then((r) => r.json())
      .then((d) => {
        const list = d.jobs ?? [];
        setJobs(list);
        setSavedJobIds(new Set(list.map((j: any) => j.id)));
      })
      .catch(() => setJobs([]));
  }, []);

  async function unsaveJob(jobId: string) {
    await fetch(`/api/jobs/${jobId}/save`, { method: "POST" });
    setJobs((prev) => (prev ?? []).filter((j) => j.id !== jobId));
    setSavedJobIds((s) => { const n = new Set(s); n.delete(jobId); return n; });
  }

  function setTab(t: "posts" | "jobs") {
    router.push(`/saved?tab=${t}`);
  }

  const postCount = posts?.length ?? 0;
  const jobCount  = jobs?.length  ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-teal-light flex items-center justify-center">
          <Bookmark size={20} className="text-teal" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-ink">Saved Items</h1>
          <p className="text-xs text-muted">{postCount + jobCount} saved · posts and jobs in one place</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["posts", "jobs"] as const).map((t) => {
          const count = t === "posts" ? postCount : jobCount;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize flex items-center gap-1.5",
                tab === t ? "border-teal text-teal" : "border-transparent text-muted hover:text-ink"
              )}
            >
              {t === "posts" ? <FileText size={14} /> : <Briefcase size={14} />}
              {t === "posts" ? "Posts" : "Jobs"}
              {count > 0 && (
                <span className={cn("text-[11px] px-1.5 py-0.5 rounded-full font-mono",
                  tab === t ? "bg-teal text-white" : "bg-paper text-muted")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Posts tab ── */}
      {tab === "posts" && (
        <div className="space-y-3">
          {posts === null && (
            <div className="flex justify-center py-14"><Loader2 className="animate-spin text-muted" /></div>
          )}
          {posts?.length === 0 && (
            <EmptyState icon={FileText} title="No saved posts" description="Hit the ⚙ menu on any post and choose Save to bookmark it here." />
          )}
          {posts?.map((p) => (
            <div key={p.id} className="space-y-1">
              <PostCard post={p} savedByMe={true} />
              <p className="text-[11px] text-muted px-1">Saved {formatRelativeTime(p.savedAt)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Jobs tab ── */}
      {tab === "jobs" && (
        <div className="space-y-3">
          {jobs === null && (
            <div className="flex justify-center py-14"><Loader2 className="animate-spin text-muted" /></div>
          )}
          {jobs?.length === 0 && (
            <EmptyState icon={Briefcase} title="No saved jobs" description="Tap the ♥ on any job card to save it here." />
          )}
          {jobs?.map((job) => (
            <div key={job.id} className="card p-4 flex items-start gap-3">
              <div className="h-11 w-11 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0 overflow-hidden">
                {job.company?.logoUrl
                  ? <img src={job.company.logoUrl} alt="" className="h-full w-full object-cover" />
                  : <Briefcase size={18} className="text-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/jobs/${job.id}`} className="font-medium text-sm text-ink hover:text-teal transition-colors">
                  {job.title}
                </Link>
                <p className="text-xs text-muted">{job.company?.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                  <span className="chip !py-0.5 !px-2">{WORK_TYPE_LABELS[job.workType] ?? job.workType}</span>
                  {job.remote && <span className="chip-teal !py-0.5 !px-2">Remote</span>}
                </div>
                {job.salaryMin && (
                  <p className="text-xs font-mono text-ink mt-1">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                )}
                <p className="text-[11px] text-muted mt-1">Saved {formatRelativeTime(job.savedAt)}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link href={`/jobs/${job.id}`} className="btn-accent btn-sm">Apply</Link>
                <button
                  onClick={() => unsaveJob(job.id)}
                  className="btn-outline btn-sm flex items-center gap-1 text-coral border-coral/30 hover:bg-coral-light"
                  title="Remove from saved"
                >
                  <Heart size={12} className="fill-coral" /> Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
