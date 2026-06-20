"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Briefcase, Users2, PlusCircle } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { WORK_TYPE_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/jobs/manage")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []));
  }, []);

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
          <Link key={j.id} href={`/jobs/manage/${j.id}`} className="flex items-center justify-between p-4 hover:bg-paper">
            <div>
              <p className="text-sm font-medium text-ink">{j.title}</p>
              <p className="text-xs text-muted">{j.company?.name} · {WORK_TYPE_LABELS[j.workType]} · {j.status}</p>
              <p className="text-xs text-muted">Posted {formatRelativeTime(j.createdAt)}</p>
            </div>
            <span className="flex items-center gap-1.5 text-sm text-ink font-mono">
              <Users2 size={14} /> {j._count?.applications ?? 0}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
