"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, Briefcase, Bookmark, Building2, CheckCircle2 } from "lucide-react";
import { formatSalary, formatRelativeTime } from "@/lib/utils";
import { WORK_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { show } = useToast();
  const [job, setJob] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  async function load() {
    const res = await fetch(`/api/jobs/${id}`);
    const data = await res.json();
    setJob(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!job) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }
  if (job.error) {
    return <div className="card p-8 text-center text-muted max-w-2xl mx-auto">{job.error}</div>;
  }

  async function submitApplication() {
    setApplying(true);
    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverLetter: coverLetter.trim() || undefined }),
    });
    const data = await res.json();
    setApplying(false);
    if (res.ok) {
      show("Application submitted", "success");
      setShowApplyForm(false);
      load();
    } else {
      show(data.error ?? "Couldn't submit application", "error");
    }
  }

  async function toggleSave() {
    const res = await fetch(`/api/jobs/${id}/save`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setJob((j: any) => ({ ...j, isSaved: data.saved }));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {job.company?.logoUrl ? (
              <img src={job.company.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Briefcase size={22} className="text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl text-ink">{job.title}</h1>
            <Link href={`/companies/${job.company?.id}`} className="text-sm text-coral font-medium flex items-center gap-1 mt-1">
              <Building2 size={13} /> {job.company?.name}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {job.location}
              </span>
              <span className="chip !py-0.5">{WORK_TYPE_LABELS[job.workType] ?? job.workType}</span>
              <span className="chip !py-0.5">{EXPERIENCE_LEVEL_LABELS[job.experienceLevel] ?? job.experienceLevel}</span>
              {job.remote && <span className="chip-teal !py-0.5">Remote</span>}
              <span>Posted {formatRelativeTime(job.createdAt)}</span>
            </div>
            <p className="font-mono text-sm text-ink mt-2">{formatSalary(job.salaryMin, job.salaryMax)}</p>
          </div>
          <button onClick={toggleSave} className={cn("p-2 rounded-full hover:bg-paper shrink-0", job.isSaved && "text-coral")}>
            <Bookmark size={18} className={job.isSaved ? "fill-coral" : ""} />
          </button>
        </div>

        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {job.skills.map((s: any) => (
              <span key={s.skillId} className="chip">{s.skill.name}</span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          {job.canManage ? (
            <Link href={`/jobs/manage/${job.id}`} className="btn-outline">
              View applicants
            </Link>
          ) : job.hasApplied ? (
            <span className="btn-outline !cursor-default">
              <CheckCircle2 size={15} className="text-teal" /> Application submitted
            </span>
          ) : showApplyForm ? null : (
            <button onClick={() => setShowApplyForm(true)} className="btn-accent">
              Apply with my profile
            </button>
          )}
        </div>

        {showApplyForm && (
          <div className="mt-4 rounded-lg border border-border p-4 space-y-3">
            <p className="text-sm text-ink">
              We'll include your resume on file. Add an optional note for the hiring team:
            </p>
            <textarea
              className="textarea min-h-[100px]"
              placeholder="Why you're a great fit (optional)…"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={submitApplication} disabled={applying} className="btn-accent btn-sm">
                {applying && <Loader2 size={14} className="animate-spin" />} Submit application
              </button>
              <button onClick={() => setShowApplyForm(false)} className="btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-3">About this role</h2>
        <p className="text-sm text-ink whitespace-pre-wrap">{job.description}</p>
      </div>

      {job.requirements && (
        <div className="card p-6">
          <h2 className="font-display text-lg text-ink mb-3">Requirements</h2>
          <p className="text-sm text-ink whitespace-pre-wrap">{job.requirements}</p>
        </div>
      )}
    </div>
  );
}
