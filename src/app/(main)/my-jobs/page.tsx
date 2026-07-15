"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2, Bookmark, ListChecks, Sparkles, Bell,
  Briefcase, MapPin, Clock, Zap, Trash2, ChevronRight,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { APPLICATION_PIPELINE, APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatRelativeTime, formatSalary, cn } from "@/lib/utils";

type MainTab = "saved" | "applied" | "recommended" | "alerts";

const STATUS_CHIP: Record<string, string> = {
  APPLIED:     "chip",
  SHORTLISTED: "chip-amber",
  INTERVIEW:   "chip-amber",
  OFFER:       "chip-teal",
  REJECTED:    "chip-coral",
};

const MOCK_ALERTS = [
  { id: "a1", query: "Azure Data Engineer", location: "Bengaluru", minExp: "3–5 yrs", salary: "20+ LPA", type: "Full-time", freq: "Daily",   active: true,  matched: 12 },
  { id: "a2", query: "Data Scientist",      location: "Remote",     minExp: "0–2 yrs", salary: "10+ LPA", type: "Any",       freq: "Weekly",  active: true,  matched: 5  },
  { id: "a3", query: "MLOps Engineer",      location: "Hyderabad",  minExp: "5–10 yrs",salary: "30+ LPA", type: "Full-time", freq: "Daily",   active: false, matched: 0  },
];

export default function MyJobsPage() {
  const [tab, setTab] = useState<MainTab>("saved");
  const [saved, setSaved] = useState<any[] | null>(null);
  const [applications, setApplications] = useState<any[] | null>(null);
  const [recommended, setRecommended] = useState<any[] | null>(null);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  useEffect(() => {
    fetch("/api/jobs/saved")
      .then((r) => r.json())
      .then((d) => setSaved(d.jobs ?? []));
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setApplications(d.applications ?? []));
    fetch("/api/jobs/recommended")
      .then((r) => r.json())
      .then((d) => setRecommended(d.jobs ?? []));
  }, []);

  async function unsave(id: string) {
    await fetch(`/api/jobs/${id}/save`, { method: "POST" });
    setSaved((s) => (s ?? []).filter((j) => j.id !== id));
  }

  function toggleAlert(id: string) {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  }

  function deleteAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const TABS = [
    { id: "saved",       label: "Saved Jobs",    icon: Bookmark,   count: saved?.length },
    { id: "applied",     label: "Applied",       icon: ListChecks, count: applications?.length },
    { id: "recommended", label: "Recommended",   icon: Sparkles,   count: recommended?.length },
    { id: "alerts",      label: "Alerts",        icon: Bell,       count: alerts.filter((a) => a.active).length },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">My Jobs</h1>
        <Link href="/jobs" className="btn-outline btn-sm gap-1.5">
          <Briefcase size={13} /> Browse jobs
        </Link>
      </div>

      {/* Tab row */}
      <div className="card p-1 flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id as MainTab)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-1 justify-center",
              tab === id ? "bg-ink text-paper" : "text-muted hover:bg-paper hover:text-ink"
            )}
          >
            <Icon size={13} />
            {label}
            {count != null && count > 0 && (
              <span className={cn(
                "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                tab === id ? "bg-white/20 text-paper" : "bg-border text-muted"
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── SAVED JOBS ── */}
      {tab === "saved" && (
        <>
          {saved === null && <div className="flex justify-center py-14"><Loader2 className="animate-spin text-muted" /></div>}
          {saved?.length === 0 && (
            <EmptyState icon={Bookmark} title="No saved jobs" description="Bookmark jobs to review them later." />
          )}
          <div className="space-y-3">
            {saved?.map((job) => (
              <div key={job.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0">
                    {job.company?.logoUrl
                      ? <img src={job.company.logoUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                      : <Briefcase size={16} className="text-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/jobs/${job.id}`} className="font-medium text-sm text-ink hover:text-coral truncate block">
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted">{job.company?.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                      <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                      <span className="font-mono">{formatSalary(job.salaryMin, job.salaryMax, job.location)}</span>
                      {job.createdAt && <span className="flex items-center gap-1"><Clock size={10} />{formatRelativeTime(job.createdAt)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/jobs/${job.id}`} className="btn-accent btn-sm"><Zap size={12} /> Apply</Link>
                    <button onClick={() => unsave(job.id)} className="btn-ghost btn-sm text-muted hover:text-coral">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── APPLIED JOBS ── */}
      {tab === "applied" && (
        <>
          {applications === null && <div className="flex justify-center py-14"><Loader2 className="animate-spin text-muted" /></div>}
          {applications?.length === 0 && (
            <EmptyState icon={ListChecks} title="No applications yet" description="Apply to jobs to track your application status here." />
          )}
          <div className="space-y-3">
            {applications?.map((app) => {
              const currentIndex = APPLICATION_PIPELINE.indexOf(app.status);
              const stages = APPLICATION_PIPELINE.filter((s) => s !== "REJECTED" || app.status === "REJECTED");
              return (
                <div key={app.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Link href={`/jobs/${app.job.id}`} className="font-medium text-sm text-ink hover:text-coral">
                        {app.job.title}
                      </Link>
                      <p className="text-xs text-muted">{app.job.company?.name} · {app.job.location}</p>
                      <p className="text-[11px] text-muted mt-0.5">Applied {formatRelativeTime(app.createdAt)}</p>
                    </div>
                    <span className={STATUS_CHIP[app.status] ?? "chip"}>
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                  </div>

                  {/* Pipeline track */}
                  <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
                    {stages.map((stage, i) => {
                      const reached = i <= currentIndex;
                      const isActive = i === currentIndex;
                      return (
                        <div key={stage} className="flex items-center gap-1 shrink-0">
                          <div className={cn(
                            "h-5 px-2 rounded-full text-[10px] font-medium flex items-center whitespace-nowrap transition-all",
                            isActive ? "bg-teal text-white" :
                            reached ? "bg-teal-light text-teal-dark" :
                            "bg-paper text-muted border border-border"
                          )}>
                            {APPLICATION_STATUS_LABELS[stage]}
                          </div>
                          {i < stages.length - 1 && (
                            <ChevronRight size={12} className={reached ? "text-teal" : "text-border"} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── RECOMMENDED ── */}
      {tab === "recommended" && (
        <>
          {recommended === null && <div className="flex justify-center py-14"><Loader2 className="animate-spin text-muted" /></div>}
          {recommended?.length === 0 && (
            <EmptyState icon={Sparkles} title="No recommendations yet" description="Complete your profile to get personalised job matches." />
          )}
          <div className="space-y-3">
            {(recommended ?? []).map((job, i) => {
              const match = 95 - i * 7 < 62 ? 62 + i * 3 : 95 - i * 7;
              return (
                <div key={job.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0">
                      <Briefcase size={16} className="text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/jobs/${job.id}`} className="font-medium text-sm text-ink hover:text-coral truncate">
                          {job.title}
                        </Link>
                        <span className={cn(
                          "chip shrink-0 !py-0.5 !px-2 !text-[11px] font-semibold",
                          match >= 85 ? "chip-teal" : match >= 70 ? "chip-amber" : "chip-coral"
                        )}>
                          {match}% Match
                        </span>
                      </div>
                      <p className="text-xs text-muted">{job.company?.name} · {job.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/jobs/${job.id}`} className="btn-accent btn-sm"><Zap size={12} /> Apply</Link>
                    <Link href="/recommended" className="btn-outline btn-sm">View all matches</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── ALERTS ── */}
      {tab === "alerts" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted">{alerts.filter((a) => a.active).length} active alerts</p>
            <Link href="/alerts" className="btn-accent btn-sm gap-1"><Bell size={13} /> Manage alerts</Link>
          </div>
          {alerts.length === 0 && (
            <EmptyState icon={Bell} title="No alerts set up" description="Create alerts to get notified when new matching jobs are posted." />
          )}
          {alerts.map((alert) => (
            <div key={alert.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm text-ink">{alert.query}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={10} />{alert.location}</span>
                    <span>{alert.minExp}</span>
                    <span>{alert.salary}</span>
                    <span>{alert.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="chip !py-0.5 !px-2 !text-[11px]">{alert.freq}</span>
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors shrink-0",
                      alert.active ? "bg-teal" : "bg-border"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      alert.active ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>
              {alert.active && alert.matched > 0 && (
                <p className="text-[11px] text-teal mt-2">
                  Last matched <strong>{alert.matched} jobs</strong>
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <button className="btn-outline btn-sm text-xs">Edit</button>
                <button onClick={() => deleteAlert(alert.id)} className="btn-ghost btn-sm text-muted hover:text-coral">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
