"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, Plus } from "lucide-react";
import SkillTagInput from "@/components/SkillTagInput";
import { useToast } from "@/components/Toast";
import { WORK_TYPES, WORK_TYPE_LABELS, EXPERIENCE_LEVELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";

export default function PostJobPage() {
  const router = useRouter();
  const { show } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [creatingCompany, setCreatingCompany] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState("FULL_TIME");
  const [experienceLevel, setExperienceLevel] = useState("MID");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [remote, setRemote] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadCompanies() {
    const res = await fetch("/api/companies/mine");
    const data = await res.json();
    setCompanies(data.companies ?? []);
    if (data.companies?.length) setCompanyId(data.companies[0].id);
    else setShowNewCompany(true);
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function createCompany() {
    if (!newCompanyName.trim()) return;
    setCreatingCompany(true);
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCompanyName.trim() }),
    });
    const data = await res.json();
    setCreatingCompany(false);
    if (res.ok) {
      setCompanies((c) => [...c, data]);
      setCompanyId(data.id);
      setShowNewCompany(false);
      setNewCompanyName("");
      show("Company page created", "success");
    } else {
      show(data.error ?? "Couldn't create company", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return show("Choose or create a company first", "error");
    setSubmitting(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        title,
        description,
        requirements: requirements || undefined,
        location,
        workType,
        experienceLevel,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        remote,
        skills,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      show("Job posted", "success");
      router.push(`/jobs/${data.id}`);
    } else {
      show(data.error ?? "Couldn't post job", "error");
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <h1 className="font-display text-2xl text-ink">Post a job</h1>

      <div className="card p-5 space-y-3">
        <h2 className="font-display text-lg text-ink flex items-center gap-2">
          <Building2 size={18} /> Hiring company
        </h2>
        {companies.length > 0 && !showNewCompany && (
          <select className="input" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        {!showNewCompany ? (
          <button onClick={() => setShowNewCompany(true)} className="btn-ghost btn-sm">
            <Plus size={14} /> Add a different company
          </button>
        ) : (
          <div className="flex gap-2">
            <input className="input" placeholder="Company name" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
            <button onClick={createCompany} disabled={creatingCompany} className="btn-accent btn-sm shrink-0">
              {creatingCompany && <Loader2 size={14} className="animate-spin" />} Create
            </button>
            {companies.length > 0 && (
              <button onClick={() => setShowNewCompany(false)} className="btn-ghost btn-sm shrink-0">Cancel</button>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="label">Job title</label>
          <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Product Designer" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea required className="textarea min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will this person do day to day?" />
        </div>
        <div>
          <label className="label">Requirements (optional)</label>
          <textarea className="textarea min-h-[80px]" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
        </div>
        <div>
          <label className="label">Location</label>
          <input required className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Austin, TX" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Work type</label>
            <select className="input" value={workType} onChange={(e) => setWorkType(e.target.value)}>
              {WORK_TYPES.map((w) => (
                <option key={w} value={w}>{WORK_TYPE_LABELS[w]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Experience level</label>
            <select className="input" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>{EXPERIENCE_LEVEL_LABELS[l]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Salary min (optional)</label>
            <input type="number" className="input" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
          </div>
          <div>
            <label className="label">Salary max (optional)</label>
            <input type="number" className="input" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} /> Remote-friendly
        </label>
        <div>
          <label className="label">Skills required</label>
          <SkillTagInput skills={skills} onAdd={(s) => setSkills((arr) => [...arr, s])} onRemove={(s) => setSkills((arr) => arr.filter((x) => x !== s))} />
        </div>
        <button type="submit" disabled={submitting} className="btn-accent w-full">
          {submitting && <Loader2 size={14} className="animate-spin" />} Post job
        </button>
      </form>
    </div>
  );
}
