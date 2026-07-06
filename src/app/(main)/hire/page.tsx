"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Users, Briefcase, PlusCircle, Eye, MessageCircle,
  MapPin, Star, CheckCircle2, Filter, TrendingUp, ChevronRight,
  FileText, Loader2, Award, Trash2, X,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

type RecruiterTab = "post" | "candidates" | "pipeline" | "assessments";

const SKILL_OPTIONS = ["AWS", "Azure", "Python", "Databricks", "Spark", "Terraform", "Docker", "Kubernetes", "SQL", "React", "Node.js", "Java"];

const ASSESS_CATEGORIES = ["Cloud", "Programming", "Database", "Big Data", "DevOps", "ML/AI"];
const BLANK_ASSESSMENT = { skill: "", category: "Cloud", questions: 20, duration: 30, difficulty: "Intermediate" as const, featured: false };
const STORAGE_KEY = "atlas_custom_assessments";

const MOCK_PIPELINE = [
  { id: "p1", title: "Senior Data Engineer",  applicants: 24, viewed: 18, shortlisted: 6, interviews: 3 },
  { id: "p2", title: "Cloud Architect",        applicants: 12, viewed: 10, shortlisted: 3, interviews: 1 },
  { id: "p3", title: "ML Engineer",            applicants: 31, viewed: 25, shortlisted: 9, interviews: 4 },
];

export default function HirePage() {
  const [tab, setTab] = useState<RecruiterTab>("post");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateLocation, setCandidateLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minExp, setMinExp] = useState("");
  const [contactedIds, setContactedIds] = useState<Set<string>>(new Set());
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateTotal, setCandidateTotal] = useState(0);
  const [candidateLoading, setCandidateLoading] = useState(false);

  const [customAssessments, setCustomAssessments] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [assessForm, setAssessForm] = useState(BLANK_ASSESSMENT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCustomAssessments(JSON.parse(stored));
    } catch {}
  }, []);

  function saveAssessments(list: any[]) {
    setCustomAssessments(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function addAssessment() {
    if (!assessForm.skill.trim()) return;
    const newA = { ...assessForm, id: `custom_${Date.now()}`, custom: true };
    saveAssessments([...customAssessments, newA]);
    setAssessForm(BLANK_ASSESSMENT);
    setShowAddForm(false);
  }

  function deleteAssessment(id: string) {
    saveAssessments(customAssessments.filter((a) => a.id !== id));
  }

  function toggleSkill(s: string) {
    setSelectedSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  const fetchCandidates = useCallback(async () => {
    setCandidateLoading(true);
    const params = new URLSearchParams();
    if (candidateSearch) params.set("q", candidateSearch);
    if (candidateLocation) params.set("location", candidateLocation);
    if (selectedSkills.length === 1) params.set("skill", selectedSkills[0]);
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setCandidates(data.users ?? []);
    setCandidateTotal(data.total ?? 0);
    setCandidateLoading(false);
  }, [candidateSearch, candidateLocation, selectedSkills]);

  useEffect(() => {
    if (tab === "candidates") fetchCandidates();
  }, [tab, fetchCandidates]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="card p-5 gradient-teal text-white">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase size={20} />
          <p className="font-display text-xl">Recruiter Portal</p>
        </div>
        <p className="text-sm text-white/80">Post jobs, discover candidates, and track your hiring pipeline.</p>
        <div className="flex gap-4 mt-3">
          {[
            { label: "Jobs Posted", value: MOCK_PIPELINE.length },
            { label: "Total Applicants", value: MOCK_PIPELINE.reduce((a, p) => a + p.applicants, 0) },
            { label: "Interviews Scheduled", value: MOCK_PIPELINE.reduce((a, p) => a + p.interviews, 0) },
          ].map(({ label, value }) => (
            <div key={label} className="text-white/90">
              <p className="font-display text-2xl text-white">{value}</p>
              <p className="text-[11px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {([
            { id: "post",        label: "Post a Job",      icon: PlusCircle },
            { id: "candidates",  label: "Find Candidates",  icon: Users      },
            { id: "pipeline",    label: "My Pipeline",      icon: TrendingUp },
            { id: "assessments", label: "Assessments",      icon: Award      },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b sm:border-b-0 border-border last:border-b-0",
                tab === id ? "bg-ink text-paper" : "text-muted hover:bg-paper"
              )}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── POST A JOB ── */}
      {tab === "post" && (
        <div className="card p-6 space-y-5">
          <p className="font-display text-lg text-ink">Post a new job</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title <span className="text-coral">*</span></label>
              <input className="input" placeholder="e.g. Senior Data Engineer" />
            </div>
            <div>
              <label className="label">Location <span className="text-coral">*</span></label>
              <input className="input" placeholder="Bengaluru / Remote" />
            </div>
            <div>
              <label className="label">Experience Required</label>
              <select className="input">
                <option>0–2 years</option>
                <option>2–5 years</option>
                <option>5–8 years</option>
                <option>8+ years</option>
              </select>
            </div>
            <div>
              <label className="label">Employment Type</label>
              <select className="input">
                <option>Full-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Freelance</option>
              </select>
            </div>
            <div>
              <label className="label">Min Salary (LPA)</label>
              <input className="input" type="number" placeholder="20" />
            </div>
            <div>
              <label className="label">Max Salary (LPA)</label>
              <input className="input" type="number" placeholder="35" />
            </div>
          </div>
          <div>
            <label className="label">Job Description <span className="text-coral">*</span></label>
            <textarea className="textarea h-32" placeholder="Describe the role, responsibilities, and requirements..." />
          </div>
          <div>
            <label className="label">Required Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SKILL_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    selectedSkills.includes(s)
                      ? "bg-teal text-white border-teal"
                      : "bg-paper border-border text-ink hover:border-teal"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Work Mode</label>
            <div className="flex gap-3">
              {["Remote", "Hybrid", "On-site"].map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                  <input type="radio" name="workMode" className="accent-teal" /> {m}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-accent flex-1">Publish job</button>
            <button className="btn-outline btn-sm">Save as draft</button>
          </div>
        </div>
      )}

      {/* ── FIND CANDIDATES ── */}
      {tab === "candidates" && (
        <div className="grid lg:grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="lg:col-span-1 card p-4 space-y-4">
            <p className="text-xs font-semibold text-ink flex items-center gap-1">
              <Filter size={12} /> Filters
            </p>
            <div>
              <label className="label">Skills</label>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.slice(0, 8).map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full border transition-colors",
                      selectedSkills.includes(s)
                        ? "bg-teal text-white border-teal"
                        : "bg-paper border-border text-ink hover:border-teal"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Min Experience</label>
              <select className="input !text-xs !py-1.5" value={minExp} onChange={(e) => setMinExp(e.target.value)}>
                <option value="">Any</option>
                <option>1+ yrs</option>
                <option>3+ yrs</option>
                <option>5+ yrs</option>
                <option>8+ yrs</option>
              </select>
            </div>
            <div>
              <label className="label">Availability</label>
              <select className="input !text-xs !py-1.5">
                <option>Any</option>
                <option>Immediate</option>
                <option>1 month</option>
                <option>2 months</option>
              </select>
            </div>
          </div>

          {/* Candidate list */}
          <div className="lg:col-span-3 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input className="input pl-9" placeholder="Name, skill, or keyword" value={candidateSearch} onChange={(e) => setCandidateSearch(e.target.value)} />
              </div>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input className="input pl-9" placeholder="Location" value={candidateLocation} onChange={(e) => setCandidateLocation(e.target.value)} />
              </div>
            </div>

            <p className="text-xs text-muted">
              {candidateLoading ? "Searching…" : `${candidateTotal} candidate${candidateTotal !== 1 ? "s" : ""} found`}
            </p>

            {candidateLoading && (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-muted" />
              </div>
            )}

            {!candidateLoading && candidates.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={c.name} src={c.image} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium text-sm text-ink">{c.name}</p>
                    </div>
                    <p className="text-xs text-muted">{c.headline}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted flex-wrap">
                      {c.location && <span className="flex items-center gap-1"><MapPin size={10} />{c.location}</span>}
                      {c.currentCompany && <span>{c.currentCompany}</span>}
                    </div>
                    {c.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.skills.map((s: any) => (
                          <span key={s.skill.name} className="chip !py-0 !px-1.5 !text-[11px]">{s.skill.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/profile/${c.id}`} className="btn-outline btn-sm gap-1">
                    <Eye size={12} /> View profile
                  </Link>
                  <button
                    onClick={() => setContactedIds((s) => new Set([...s, c.id]))}
                    className={cn("btn-sm gap-1", contactedIds.has(c.id) ? "btn-outline text-teal border-teal" : "btn-accent")}
                    disabled={contactedIds.has(c.id)}
                  >
                    {contactedIds.has(c.id)
                      ? <><CheckCircle2 size={12} /> Contacted</>
                      : <><MessageCircle size={12} /> Contact</>}
                  </button>
                </div>
              </div>
            ))}

            {!candidateLoading && candidates.length === 0 && (
              <div className="text-center py-10 text-muted text-sm">No candidates found. Try a different search.</div>
            )}
          </div>
        </div>
      )}

      {/* ── ASSESSMENTS ── */}
      {tab === "assessments" && (
        <div className="space-y-5">
          {/* Summary bar */}
          <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-display text-base text-ink">Manage Skill Assessments</p>
              <p className="text-xs text-muted mt-0.5">
                {customAssessments.length} custom · 10 built-in · visible on the Assessments page
              </p>
            </div>
            <button
              onClick={() => { setAssessForm(BLANK_ASSESSMENT); setShowAddForm(true); }}
              className="btn-accent btn-sm gap-1"
            >
              <PlusCircle size={13} /> Add Assessment
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="card p-5 space-y-4 border-2 border-teal/30">
              <div className="flex items-center justify-between">
                <p className="font-display text-base text-ink">New Assessment</p>
                <button onClick={() => setShowAddForm(false)} className="p-1 text-muted hover:text-ink">
                  <X size={16} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Skill / Assessment Name <span className="text-coral">*</span></label>
                  <input
                    className="input"
                    placeholder="e.g. React Fundamentals"
                    value={assessForm.skill}
                    onChange={(e) => setAssessForm((f) => ({ ...f, skill: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={assessForm.category}
                    onChange={(e) => setAssessForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {ASSESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Difficulty</label>
                  <select
                    className="input"
                    value={assessForm.difficulty}
                    onChange={(e) => setAssessForm((f) => ({ ...f, difficulty: e.target.value as any }))}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="label">Number of Questions</label>
                  <input
                    className="input"
                    type="number"
                    min={5}
                    max={100}
                    value={assessForm.questions}
                    onChange={(e) => setAssessForm((f) => ({ ...f, questions: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="label">Duration (minutes)</label>
                  <input
                    className="input"
                    type="number"
                    min={5}
                    max={180}
                    value={assessForm.duration}
                    onChange={(e) => setAssessForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    id="featured-toggle"
                    type="checkbox"
                    className="accent-teal w-4 h-4"
                    checked={assessForm.featured}
                    onChange={(e) => setAssessForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  <label htmlFor="featured-toggle" className="text-sm text-ink cursor-pointer">
                    Mark as <span className="font-medium">Featured</span> (appears in top Featured section)
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={addAssessment}
                  disabled={!assessForm.skill.trim()}
                  className="btn-accent flex-1 disabled:opacity-50"
                >
                  Save Assessment
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn-outline btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Custom assessments list */}
          {customAssessments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Your custom assessments</p>
              <div className="card divide-y divide-border">
                {customAssessments.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-8 w-8 rounded-lg bg-teal-light flex items-center justify-center shrink-0">
                      <Award size={15} className="text-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-ink">{a.skill}</p>
                        <span className="chip-teal !py-0 !px-1.5 !text-[10px]">Custom</span>
                        {a.featured && <span className="chip-amber !py-0 !px-1.5 !text-[10px]">Featured</span>}
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {a.category} · {a.questions} Q · {a.duration} min ·{" "}
                        <span className={
                          a.difficulty === "Beginner" ? "text-teal" :
                          a.difficulty === "Intermediate" ? "text-amber" : "text-coral"
                        }>
                          {a.difficulty}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => deleteAssessment(a.id)}
                      className="p-1.5 text-muted hover:text-coral rounded-lg hover:bg-coral-light transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customAssessments.length === 0 && !showAddForm && (
            <div className="text-center py-10 text-muted text-sm">
              No custom assessments yet. Click <span className="font-medium text-teal">Add Assessment</span> to create one.
            </div>
          )}

          {/* Built-in list (read-only reference) */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Built-in assessments (read-only)</p>
            <div className="card divide-y divide-border opacity-70">
              {[
                { skill: "Azure Fundamentals",        category: "Cloud",       difficulty: "Intermediate" },
                { skill: "AWS Cloud Practitioner",     category: "Cloud",       difficulty: "Beginner"     },
                { skill: "Python for Data Engineering",category: "Programming", difficulty: "Intermediate" },
                { skill: "SQL Proficiency",            category: "Database",    difficulty: "Beginner"     },
                { skill: "Databricks Associate",       category: "Big Data",    difficulty: "Advanced"     },
                { skill: "Terraform Basics",           category: "DevOps",      difficulty: "Beginner"     },
                { skill: "Docker & Containers",        category: "DevOps",      difficulty: "Intermediate" },
                { skill: "Kubernetes Essentials",      category: "DevOps",      difficulty: "Advanced"     },
                { skill: "Apache Spark",               category: "Big Data",    difficulty: "Intermediate" },
                { skill: "Deep Learning Fundamentals", category: "ML/AI",       difficulty: "Advanced"     },
              ].map((a) => (
                <div key={a.skill} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="h-7 w-7 rounded-lg bg-paper flex items-center justify-center shrink-0">
                    <Award size={13} className="text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink">{a.skill}</p>
                    <p className="text-xs text-muted">{a.category} · <span className={
                      a.difficulty === "Beginner" ? "text-teal" :
                      a.difficulty === "Intermediate" ? "text-amber" : "text-coral"
                    }>{a.difficulty}</span></p>
                  </div>
                  <span className="text-[11px] text-muted">Built-in</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PIPELINE ── */}
      {tab === "pipeline" && (
        <div className="space-y-4">
          {MOCK_PIPELINE.map((job) => (
            <div key={job.id} className="card p-5">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
                <div>
                  <p className="font-semibold text-sm text-ink">{job.title}</p>
                  <p className="text-xs text-muted">Active listing</p>
                </div>
                <div className="flex gap-2">
                  <Link href="/jobs/manage" className="btn-outline btn-sm gap-1">
                    <Eye size={12} /> View
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Applied",      value: job.applicants,  color: "text-ink"   },
                  { label: "Viewed",       value: job.viewed,      color: "text-amber"  },
                  { label: "Shortlisted",  value: job.shortlisted, color: "text-teal"   },
                  { label: "Interviewing", value: job.interviews,  color: "text-coral"  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-3 bg-paper rounded-xl">
                    <p className={cn("font-display text-2xl", color)}>{value}</p>
                    <p className="text-[11px] text-muted">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-1.5 bg-paper rounded-full overflow-hidden flex">
                <div className="bg-border" style={{ width: `${(job.viewed / job.applicants) * 100}%` }} />
                <div className="bg-amber" style={{ width: `${(job.shortlisted / job.applicants) * 100}%` }} />
                <div className="bg-teal" style={{ width: `${(job.interviews / job.applicants) * 100}%` }} />
              </div>
              <div className="flex justify-end mt-3">
                <Link href="/jobs/manage" className="btn-outline btn-sm gap-1">
                  View applicants <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
