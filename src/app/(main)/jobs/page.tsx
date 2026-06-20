"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, Briefcase, Bookmark, ListChecks, PlusCircle } from "lucide-react";
import JobCard from "@/components/JobCard";
import EmptyState from "@/components/EmptyState";
import { WORK_TYPES, WORK_TYPE_LABELS, EXPERIENCE_LEVELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";

export default function JobsPage() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);

  const search = useCallback(async () => {
    setJobs(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (workType) params.set("workType", workType);
    if (experienceLevel) params.set("experienceLevel", experienceLevel);
    if (remoteOnly) params.set("remote", "true");
    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setTotal(data.total ?? 0);
  }, [q, location, workType, experienceLevel, remoteOnly]);

  useEffect(() => {
    search();
    fetch("/api/jobs/saved")
      .then((r) => r.json())
      .then((d) => setSavedIds(new Set((d.jobs ?? []).map((j: any) => j.id))));
  }, [search]);

  async function toggleSave(jobId: string) {
    const res = await fetch(`/api/jobs/${jobId}/save`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setSavedIds((s) => {
        const next = new Set(s);
        if (data.saved) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Find your next role</h1>
        <div className="flex gap-2">
          <Link href="/jobs/applications" className="btn-outline btn-sm">
            <ListChecks size={14} /> My applications
          </Link>
          <Link href="/jobs/saved" className="btn-outline btn-sm">
            <Bookmark size={14} /> Saved
          </Link>
          <Link href="/jobs/manage" className="btn-outline btn-sm">
            <Briefcase size={14} /> Manage
          </Link>
          <Link href="/jobs/post" className="btn-accent btn-sm">
            <PlusCircle size={14} /> Post a job
          </Link>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-8"
            placeholder="Job title, keyword, or company"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
        </div>
        <div className="grid sm:grid-cols-4 gap-2">
          <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <select className="input" value={workType} onChange={(e) => setWorkType(e.target.value)}>
            <option value="">Any work type</option>
            {WORK_TYPES.map((w) => (
              <option key={w} value={w}>{WORK_TYPE_LABELS[w]}</option>
            ))}
          </select>
          <select className="input" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
            <option value="">Any experience level</option>
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l} value={l}>{EXPERIENCE_LEVEL_LABELS[l]}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-ink px-1">
            <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
            Remote only
          </label>
        </div>
        <button onClick={search} className="btn-accent btn-sm">Apply filters</button>
      </div>

      {jobs === null && (
        <div className="flex justify-center py-14">
          <Loader2 className="animate-spin text-muted" />
        </div>
      )}

      {jobs?.length === 0 && (
        <EmptyState icon={Briefcase} title="No jobs matched" description="Try widening your filters or searching a different keyword." />
      )}

      {jobs && jobs.length > 0 && (
        <>
          <p className="text-xs text-muted">{total} open role{total === 1 ? "" : "s"}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} saved={savedIds.has(j.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
