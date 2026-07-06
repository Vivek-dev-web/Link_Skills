"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Briefcase, Users2, PlusCircle, Star, Zap } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { WORK_TYPE_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

export default function ManageJobsPage() {
  const { show } = useToast();
  const [jobs, setJobs] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/jobs/manage")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []));
  }, []);

  async function toggleFlag(jobId: string, field: "featured" | "promoted", current: boolean) {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    });
    if (res.ok) {
      setJobs((prev) => prev?.map((j) => j.id === jobId ? { ...j, [field]: !current } : j) ?? null);
      show(`${field === "featured" ? "Featured" : "Promoted"} ${!current ? "enabled" : "disabled"}`, "success");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Manage your job posts</h1>
        <Link href="/jobs/post" className="btn-accent btn-sm">
          <PlusCircle size={14} /> Post a job
        </Link>
      </div>

      {jobs === null && (
        <div className="flex justify-center py-14">
          <Loader2 className="animate-spin text-muted" />
        </div>
      )}

      {jobs?.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create a company page and post your first opening to start building a pipeline."
          action={<Link href="/jobs/post" className="btn-accent btn-sm">Post a job</Link>}
        />
      )}

      <div className="card divide-y divide-border">
        {jobs?.map((j) => (
          <div key={j.id} className="flex items-center justify-between p-4 hover:bg-paper gap-3">
            <Link href={`/jobs/manage/${j.id}`} className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                {j.title}
                {j.featured && <span className="chip-amber !py-0 !px-1.5 !text-[10px]">Featured</span>}
                {j.promoted && <span className="chip-coral !py-0 !px-1.5 !text-[10px]">Promoted</span>}
              </p>
              <p className="text-xs text-muted">{j.company?.name} · {WORK_TYPE_LABELS[j.workType]} · {j.status}</p>
              <p className="text-xs text-muted">Posted {formatRelativeTime(j.createdAt)}</p>
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleFlag(j.id, "featured", j.featured)}
                className={cn("btn-sm flex items-center gap-1 text-xs border rounded-lg px-2 py-1 transition-colors",
                  j.featured ? "bg-amber-light text-amber-dark border-amber/30" : "text-muted border-border hover:border-amber/50 hover:text-amber")}
                title="Toggle featured"
              >
                <Star size={12} /> Featured
              </button>
              <button
                onClick={() => toggleFlag(j.id, "promoted", j.promoted)}
                className={cn("btn-sm flex items-center gap-1 text-xs border rounded-lg px-2 py-1 transition-colors",
                  j.promoted ? "bg-coral-light text-coral border-coral/30" : "text-muted border-border hover:border-coral/50 hover:text-coral")}
                title="Toggle promoted"
              >
                <Zap size={12} /> Promoted
              </button>
              <Link href={`/jobs/manage/${j.id}`}
                className="flex items-center gap-1 text-sm font-medium text-teal hover:underline ml-1"
                title="View applicants">
                <Users2 size={14} /> {j._count?.applications ?? 0} applicant{(j._count?.applications ?? 0) !== 1 ? "s" : ""}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
