"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search, MapPin, Loader2, Briefcase, Bookmark, ListChecks,
  PlusCircle, SlidersHorizontal, Star, Zap, ChevronDown, X,
} from "lucide-react";
import JobCard from "@/components/JobCard";
import EmptyState from "@/components/EmptyState";
import { WORK_TYPES, WORK_TYPE_LABELS, EXPERIENCE_LEVELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SKILL_OPTIONS = ["AWS", "Azure", "GCP", "Python", "Databricks", "Spark", "Terraform", "Docker", "Kubernetes", "SQL", "React", "Node.js", "Java", "Scala", "Airflow"];
const WORK_MODES = ["Remote", "Hybrid", "Work from Office"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "salary_desc", label: "Salary (High to Low)" },
];
const INDUSTRY_OPTIONS = ["Technology", "Finance", "E-Commerce", "Healthcare", "Consulting", "Media", "Manufacturing"];

const FILTER_PILLS = ["Experience", "Salary", "Job Type", "Industry", "Date Posted", "Company Type"];

export default function JobsPage() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("relevance");
  const [easyApplyOnly, setEasyApplyOnly] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const search = useCallback(async () => {
    setJobs(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (workType) params.set("workType", workType);
    if (experienceLevel) params.set("experienceLevel", experienceLevel);
    if (remoteOnly) params.set("remote", "true");
    if (sort !== "relevance") params.set("sort", sort);
    if (salaryMin > 0) params.set("minSalary", String(salaryMin * 100000));
    selectedSkills.forEach((s) => params.append("skill", s));
    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setTotal(data.total ?? 0);
  }, [q, location, workType, experienceLevel, remoteOnly, sort, salaryMin, selectedSkills]);

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

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function toggleMode(mode: string) {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
    if (mode === "Remote") setRemoteOnly((v) => !v);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Hero search bar */}
      <div className="card p-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              placeholder="Skills, designation, or company"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
          </div>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              placeholder="Location, city, or remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 items-center">
          {FILTER_PILLS.map((pill) => (
            <button key={pill} className="chip hover:border-teal hover:text-teal transition-colors">
              {pill} <ChevronDown size={11} />
            </button>
          ))}
          <label className="flex items-center gap-1.5 text-xs text-ink ml-auto cursor-pointer">
            <input
              type="checkbox"
              checked={easyApplyOnly}
              onChange={(e) => setEasyApplyOnly(e.target.checked)}
              className="accent-teal"
            />
            <Zap size={12} className="text-teal" /> Easy Apply only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={search} className="btn-accent btn-sm">Search jobs</button>
          <select
            className="input !w-auto !py-1.5 !text-xs"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex gap-2 ml-auto">
            <Link href="/my-jobs" className="btn-outline btn-sm">
              <ListChecks size={13} /> My Jobs
            </Link>
            <Link href="/jobs/post" className="btn-accent btn-sm">
              <PlusCircle size={13} /> Post a job
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Filter sidebar */}
        <aside className={cn("w-56 shrink-0 space-y-3", !sidebarOpen && "hidden lg:block")}>
          <div className="card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink flex items-center gap-1">
                <SlidersHorizontal size={13} /> Filters
              </span>
              <button
                className="text-[11px] text-teal hover:underline"
                onClick={() => {
                  setExperienceLevel(""); setWorkType(""); setSelectedSkills([]);
                  setSelectedModes([]); setSalaryMin(0); setRemoteOnly(false);
                }}
              >
                Clear all
              </button>
            </div>

            {/* Experience Level */}
            <div>
              <p className="label">Experience</p>
              <div className="space-y-1.5">
                {[
                  { val: "ENTRY", label: "0–1 yr" },
                  { val: "MID", label: "1–3 yrs" },
                  { val: "SENIOR", label: "3–5 yrs" },
                  { val: "LEAD", label: "5–10 yrs" },
                  { val: "EXECUTIVE", label: "10+ yrs" },
                ].map((e) => (
                  <label key={e.val} className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                    <input
                      type="radio"
                      name="exp"
                      value={e.val}
                      checked={experienceLevel === e.val}
                      onChange={() => setExperienceLevel(e.val)}
                      className="accent-teal"
                    />
                    {e.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range (LPA) */}
            <div>
              <p className="label">Min Salary</p>
              <input
                type="range"
                min={0} max={50} step={5}
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-[11px] text-muted mt-1">
                <span>0 LPA</span>
                <span className="text-teal font-medium">{salaryMin > 0 ? `${salaryMin}+ LPA` : "Any"}</span>
                <span>50 LPA</span>
              </div>
            </div>

            {/* Work Mode */}
            <div>
              <p className="label">Work Mode</p>
              <div className="space-y-1.5">
                {WORK_MODES.map((mode) => (
                  <label key={mode} className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedModes.includes(mode)}
                      onChange={() => toggleMode(mode)}
                      className="accent-teal"
                    />
                    {mode}
                  </label>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <p className="label">Employment Type</p>
              <div className="space-y-1.5">
                {WORK_TYPES.map((w) => (
                  <label key={w} className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workType === w}
                      onChange={() => setWorkType(workType === w ? "" : w)}
                      className="accent-teal"
                    />
                    {WORK_TYPE_LABELS[w]}
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="label">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.map((s) => (
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

            {/* Industry */}
            <div>
              <p className="label">Industry</p>
              <select className="input !text-xs !py-1.5">
                <option value="">All industries</option>
                {INDUSTRY_OPTIONS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>

            {/* Top Companies */}
            <div>
              <p className="label">Top Companies</p>
              <div className="space-y-1.5">
                {["Google", "Microsoft", "Flipkart", "Amazon", "Swiggy"].map((co) => (
                  <label key={co} className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                    <input type="checkbox" className="accent-teal" />
                    <Star size={10} className="text-amber" /> {co}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Job listings */}
        <div className="flex-1 min-w-0 space-y-3">
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted">Active filters:</span>
              {selectedSkills.map((s) => (
                <span key={s} className="chip-teal flex items-center gap-1">
                  {s}
                  <button onClick={() => toggleSkill(s)}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}

          {jobs === null && (
            <div className="flex justify-center py-14">
              <Loader2 className="animate-spin text-muted" />
            </div>
          )}

          {jobs?.length === 0 && (
            <EmptyState
              icon={Briefcase}
              title="No jobs matched"
              description="Try widening your filters or searching a different keyword."
            />
          )}

          {jobs && jobs.length > 0 && (
            <>
              <p className="text-xs text-muted">{total} open role{total === 1 ? "" : "s"}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {jobs.map((j, idx) => (
                  <div key={j.id} className="relative">
                    {idx === 0 && (
                      <span className="absolute top-3 left-3 z-10 chip-amber !py-0.5 !px-2 !text-[10px]">
                        <Star size={9} /> Featured
                      </span>
                    )}
                    {idx === 2 && (
                      <span className="absolute top-3 left-3 z-10 chip-coral !py-0.5 !px-2 !text-[10px]">
                        Promoted
                      </span>
                    )}
                    <JobCard job={j} saved={savedIds.has(j.id)} onToggleSave={toggleSave} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
