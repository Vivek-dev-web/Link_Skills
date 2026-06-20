"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ListChecks } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { formatRelativeTime, cn } from "@/lib/utils";
import { APPLICATION_PIPELINE, APPLICATION_STATUS_LABELS } from "@/lib/constants";

const STATUS_COLOR: Record<string, string> = {
  APPLIED: "chip",
  SHORTLISTED: "chip-amber",
  INTERVIEW: "chip-amber",
  OFFER: "chip-teal",
  REJECTED: "chip",
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setApplications(d.applications ?? []));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="font-display text-2xl text-ink">My applications</h1>

      {applications === null && (
        <div className="flex justify-center py-14">
          <Loader2 className="animate-spin text-muted" />
        </div>
      )}

      {applications?.length === 0 && (
        <EmptyState icon={ListChecks} title="No applications yet" description="Once you apply to jobs, you can track their status here." />
      )}

      <div className="space-y-3">
        {applications?.map((app) => (
          <div key={app.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/jobs/${app.job.id}`} className="text-sm font-medium text-ink hover:text-coral">
                  {app.job.title}
                </Link>
                <p className="text-xs text-muted">{app.job.company?.name} · {app.job.location}</p>
                <p className="text-xs text-muted mt-0.5">Applied {formatRelativeTime(app.createdAt)}</p>
              </div>
              <span className={STATUS_COLOR[app.status] ?? "chip"}>{APPLICATION_STATUS_LABELS[app.status]}</span>
            </div>

            {/* pipeline progress */}
            <div className="route-line mt-4 space-y-2">
              {APPLICATION_PIPELINE.filter((s) => s !== "REJECTED" || app.status === "REJECTED").map((stage) => {
                const stageIndex = APPLICATION_PIPELINE.indexOf(stage);
                const currentIndex = APPLICATION_PIPELINE.indexOf(app.status);
                const reached = stageIndex <= currentIndex;
                return (
                  <div key={stage} className="relative">
                    <span className={reached ? "route-node-done" : "route-node"} />
                    <p className={cn("text-xs", reached ? "text-ink font-medium" : "text-muted")}>
                      {APPLICATION_STATUS_LABELS[stage]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
