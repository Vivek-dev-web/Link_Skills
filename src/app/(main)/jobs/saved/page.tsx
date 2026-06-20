"use client";

import { useEffect, useState } from "react";
import { Loader2, Bookmark } from "lucide-react";
import JobCard from "@/components/JobCard";
import EmptyState from "@/components/EmptyState";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[] | null>(null);

  async function load() {
    const res = await fetch("/api/jobs/saved");
    const data = await res.json();
    setJobs(data.jobs ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function unsave(jobId: string) {
    await fetch(`/api/jobs/${jobId}/save`, { method: "POST" });
    setJobs((j) => j?.filter((x) => x.id !== jobId) ?? []);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="font-display text-2xl text-ink">Saved jobs</h1>
      {jobs === null && (
        <div className="flex justify-center py-14">
          <Loader2 className="animate-spin text-muted" />
        </div>
      )}
      {jobs?.length === 0 && (
        <EmptyState icon={Bookmark} title="No saved jobs yet" description="Tap the bookmark icon on any job to save it for later." />
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {jobs?.map((j) => (
          <JobCard key={j.id} job={j} saved onToggleSave={unsave} />
        ))}
      </div>
    </div>
  );
}
