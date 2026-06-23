"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Users, Briefcase, PlusCircle, Eye, MessageCircle,
  MapPin, Star, CheckCircle2, Filter, TrendingUp, ChevronRight,
  FileText,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

type RecruiterTab = "post" | "candidates" | "pipeline";

const SKILL_OPTIONS = ["AWS", "Azure", "Python", "Databricks", "Spark", "Terraform", "Docker", "Kubernetes", "SQL", "React", "Node.js", "Java"];

const MOCK_CANDIDATES = [
  { id: "c1", name: "Priya Menon",   headline: "Senior Data Engineer · 6 yrs exp",   location: "Bengaluru", skills: ["Python", "Databricks", "AWS"],      exp: "6 yrs",  salary: "30–40 LPA", available: "Immediately", score: 94 },
  { id: "c2", name: "Arjun Kapoor",  headline: "Cloud Architect · 8 yrs exp",         location: "Hyderabad", skills: ["Azure", "Terraform", "Kubernetes"], exp: "8 yrs",  salary: "40–55 LPA", available: "1 month",      score: 89 },
  { id: "c3", name: "Riya Desai",    headline: "ML Engineer · 4 yrs exp",             location: "Mumbai",    skills: ["Python", "TensorFlow", "AWS"],      exp: "4 yrs",  salary: "25–35 LPA", available: "2 months",     score: 82 },
  { id: "c4", name: "Vikram Singh",  headline: "DevOps Lead · 7 yrs exp",             location: "Pune",      skills: ["Docker", "Kubernetes", "AWS"],      exp: "7 yrs",  salary: "35–45 LPA", available: "1 month",      score: 91 },
  { id: "c5", name: "Ananya Bose",   headline: "Data Scientist · 3 yrs exp",          location: "Remote",    skills: ["Python", "SQL", "Spark"],           exp: "3 yrs",  salary: "18–28 LPA", available: "Immediately",  score: 78 },
];

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

  function toggleSkill(s: string) {
    setSelectedSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  const filteredCandidates = MOCK_CANDIDATES.filter((c) => {
    if (candidateSearch && !c.name.toLowerCase().includes(candidateSearch.toLowerCase()) &&
        !c.headline.toLowerCase().includes(candidateSearch.toLowerCase())) return false;
    if (candidateLocation && !c.location.toLowerCase().includes(candidateLocation.toLowerCase())) return false;
    if (selectedSkills.length > 0 && !selectedSkills.some((s) => c.skills.includes(s))) return false;
    return true;
  });

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
      <div className="flex rounded-xl border border-border overflow-hidden">
        {([
          { id: "post",       label: "Post a Job",      icon: PlusCircle },
          { id: "candidates", label: "Find Candidates",  icon: Users      },
          { id: "pipeline",   label: "My Pipeline",      icon: TrendingUp },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
              tab === id ? "bg-ink text-paper" : "text-muted hover:bg-paper"
            )}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
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

            <p className="text-xs text-muted">{filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? "s" : ""} found</p>

            {filteredCandidates.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={c.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium text-sm text-ink">{c.name}</p>
                      <span className="chip-teal !py-0.5 !px-2 !text-[11px] flex items-center gap-1">
                        <Star size={10} className="fill-teal" /> {c.score}% match
                      </span>
                    </div>
                    <p className="text-xs text-muted">{c.headline}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={10} />{c.location}</span>
                      <span>{c.exp} exp</span>
                      <span>{c.salary}</span>
                      <span>Available: {c.available}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {c.skills.map((s) => (
                        <span key={s} className="chip !py-0 !px-1.5 !text-[11px]">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="btn-outline btn-sm gap-1">
                    <Eye size={12} /> View profile
                  </button>
                  <button
                    onClick={() => setContactedIds((s) => new Set([...s, c.id]))}
                    className={cn("btn-sm gap-1", contactedIds.has(c.id) ? "btn-outline text-teal border-teal" : "btn-accent")}
                    disabled={contactedIds.has(c.id)}
                  >
                    {contactedIds.has(c.id)
                      ? <><CheckCircle2 size={12} /> Contacted</>
                      : <><MessageCircle size={12} /> Contact</>}
                  </button>
                  <button className="btn-ghost btn-sm text-muted gap-1">
                    <FileText size={12} /> Resume
                  </button>
                </div>
              </div>
            ))}
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
                <button className="btn-outline btn-sm gap-1">
                  View applicants <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
