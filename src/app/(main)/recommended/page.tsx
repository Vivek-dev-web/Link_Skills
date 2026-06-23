"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2, Briefcase, MapPin, Bookmark, ThumbsDown,
  ChevronDown, ChevronUp, Zap, Sparkles, Clock,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { WORK_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { formatSalary, formatRelativeTime, cn } from "@/lib/utils";

type TimeFilter = "all" | "today" | "week" | "remote";

// Augments real job data with mock AI-match metadata
function withMatch(jobs: any[]): any[] {
  const reasons: string[][] = [
    ["Matches your Python & Databricks skills", "Bengaluru aligns with your preferred location", "Experience level matches your profile"],
    ["AWS expertise is a strong fit", "Salary range meets your expectation (25+ LPA)", "Remote role – matches your work mode preference"],
    ["Spark & SQL are in your top skills", "Company is actively hiring in your domain", "Mid-level role suits your 3-year track record"],
    ["Azure skills verified via your assessment", "Contract role fits your availability", "Tech stack overlaps with your last role"],
    ["Full-stack data profile aligns", "Growth-stage startup matches your preference", "Interview process is streamlined"],
  ];
  return jobs.map((j, i) => ({
    ...j,
    match: 95 - i * 7 < 60 ? 62 + i * 4 : 95 - i * 7,
    reasons: reasons[i % reasons.length],
    saved: false,
  }));
}

const TOP_SKILLS = ["Databricks", "Python", "AWS"];

export default function RecommendedPage() {
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [filter, setFilter] = useState<TimeFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/jobs/recommended");
      const data = await res.json();
      setJobs(withMatch(data.jobs ?? []));
    }
    load();
    fetch("/api/jobs/saved")
      .then((r) => r.json())
      .then((d) => setSavedIds(new Set((d.jobs ?? []).map((j: any) => j.id))));
  }, []);

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

  const displayed = (jobs ?? []).filter((j) => {
    if (dismissedIds.has(j.id)) return false;
    if (filter === "remote" && !j.remote) return false;
    if (filter === "today") {
      const hours = (Date.now() - new Date(j.createdAt).getTime()) / 3600000;
      return hours <= 24;
    }
    if (filter === "week") {
      const days = (Date.now() - new Date(j.createdAt).getTime()) / 86400000;
      return days <= 7;
    }
    return true;
  });

  const matchColor = (pct: number) =>
    pct >= 85 ? "text-teal bg-teal-light border-teal/20" :
    pct >= 70 ? "text-amber bg-amber-light border-amber/20" :
    "text-coral bg-coral-light border-coral/20";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Hero */}
      <div className="card p-5 gradient-teal text-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} />
          <p className="font-display text-lg">Jobs matched to your profile</p>
        </div>
        <p className="text-sm text-white/80 mb-3">Based on your skills, experience, and preferences</p>
        <div className="flex gap-2 flex-wrap">
          {TOP_SKILLS.map((s) => (
            <span key={s} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full border border-white/30">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "today", "week", "remote"] as TimeFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "btn-sm capitalize",
              filter === f ? "btn-primary" : "btn-outline"
            )}
          >
            {f === "all" ? "All matches" :
             f === "today" ? <><Clock size={12} /> Today</> :
             f === "week" ? "This week" :
             <><MapPin size={12} /> Remote only</>}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted self-center">
          {displayed.length} matched role{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Loading */}
      {jobs === null && (
        <div className="flex justify-center py-14"><Loader2 className="animate-spin text-muted" /></div>
      )}

      {/* Empty */}
      {jobs !== null && displayed.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No matches for this filter"
          description="Try a different time range or check back later for new recommendations."
        />
      )}

      {/* Job cards */}
      <div className="space-y-3">
        {displayed.map((job) => {
          const isExpanded = expandedId === job.id;
          const isSaved = savedIds.has(job.id);
          return (
            <div key={job.id} className="card p-4 card-hover">
              <div className="flex items-start gap-3">
                {/* Logo */}
                <div className="h-11 w-11 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0 overflow-hidden">
                  {job.company?.logoUrl
                    ? <img src={job.company.logoUrl} alt="" className="h-full w-full object-cover" />
                    : <Briefcase size={18} className="text-muted" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/jobs/${job.id}`} className="font-medium text-sm text-ink hover:text-coral truncate">
                      {job.title}
                    </Link>
                    {/* Match badge */}
                    <span className={cn("chip shrink-0 !py-0.5 !px-2 !text-[11px] border font-semibold", matchColor(job.match))}>
                      {job.match}% Match
                    </span>
                  </div>
                  <p className="text-xs text-muted">{job.company?.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                    <span className="chip !py-0 !px-1.5 !text-[11px]">{WORK_TYPE_LABELS[job.workType] ?? job.workType}</span>
                    {job.remote && <span className="chip-teal !py-0 !px-1.5 !text-[11px]">Remote</span>}
                    {job.createdAt && <span>{formatRelativeTime(job.createdAt)}</span>}
                  </div>
                </div>
              </div>

              {/* Salary & skills */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs font-mono text-ink">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                {job.experienceLevel && (
                  <span className="text-[11px] text-muted">{EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}</span>
                )}
              </div>
              {job.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.skills.slice(0, 5).map((s: any) => (
                    <span key={s.skillId ?? s.skill?.id} className="chip !py-0.5 !px-2 !text-[11px]">
                      {s.skill?.name ?? s.name}
                    </span>
                  ))}
                </div>
              )}

              {/* "Why this matches" */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : job.id)}
                className="mt-3 flex items-center gap-1 text-xs text-teal hover:underline"
              >
                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                Why this matches you
              </button>
              {isExpanded && (
                <div className="mt-2 p-3 bg-teal-light rounded-lg border border-teal/20 space-y-1.5">
                  {job.reasons.map((r: string, i: number) => (
                    <p key={i} className="text-xs text-teal-dark flex items-start gap-1.5">
                      <span className="mt-0.5">✓</span> {r}
                    </p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <Link href={`/jobs/${job.id}`} className="btn-accent btn-sm flex-1 justify-center">
                  <Zap size={12} /> Easy Apply
                </Link>
                <button
                  onClick={() => toggleSave(job.id)}
                  className={cn("btn-outline btn-sm", isSaved && "border-coral text-coral")}
                >
                  <Bookmark size={13} className={isSaved ? "fill-coral" : ""} />
                  {isSaved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => setDismissedIds((s) => new Set([...s, job.id]))}
                  className="btn-ghost btn-sm text-muted"
                  title="Not interested"
                >
                  <ThumbsDown size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
