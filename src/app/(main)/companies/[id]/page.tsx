"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Globe, Users2, Briefcase, Star, MapPin,
  TrendingUp, ThumbsUp, ThumbsDown, DollarSign, MessageSquare,
  CheckCircle2, Building2, Zap, Plus, X, Trash2,
} from "lucide-react";
import JobCard from "@/components/JobCard";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

type Tab = "overview" | "jobs" | "reviews" | "salaries" | "interviews";

const TECH_STACK = ["AWS", "Python", "Databricks", "Spark", "Kubernetes", "Terraform", "React", "PostgreSQL"];

const MOCK_REVIEWS = [
  { id: 1, role: "Senior Data Engineer", rating: 4, pros: "Great work-life balance. Fully remote option, excellent tech stack.", cons: "Growth can be slow. Promotion cycles are long.", wlb: 4, salary: 3, culture: 5, type: "Current Employee" },
  { id: 2, role: "Product Manager", rating: 5, pros: "Strong leadership, amazing perks, great learning culture.", cons: "Fast-paced—can be stressful at times.", wlb: 4, salary: 5, culture: 5, type: "Current Employee" },
  { id: 3, role: "SDE II", rating: 3, pros: "Solid engineering team, good comp.", cons: "Too many meetings. Middle management needs improvement.", wlb: 3, salary: 4, culture: 3, type: "Former Employee" },
];

const MOCK_SALARIES = [
  { role: "Data Engineer",        avg: 28, min: 20, max: 40, reports: 34 },
  { role: "Senior Data Engineer", avg: 42, min: 32, max: 58, reports: 18 },
  { role: "ML Engineer",          avg: 38, min: 28, max: 52, reports: 12 },
  { role: "SDE II",               avg: 32, min: 24, max: 45, reports: 27 },
  { role: "Product Manager",      avg: 35, min: 26, max: 50, reports: 9  },
  { role: "DevOps Engineer",      avg: 25, min: 18, max: 38, reports: 14 },
];

const MOCK_INTERVIEWS = [
  { id: 1, role: "Senior Data Engineer", difficulty: "Medium", outcome: "Offer",    steps: ["HR screen", "Technical round (SQL + Python)", "System design", "Culture fit", "Offer"] },
  { id: 2, role: "ML Engineer",          difficulty: "Hard",   outcome: "Rejected",  steps: ["Online assessment", "Two technical rounds", "Case study", "Final round"] },
  { id: 3, role: "SDE II",               difficulty: "Easy",   outcome: "No response", steps: ["Resume screening", "One coding round", "Manager chat"] },
];

const difficultyColor: Record<string, string> = {
  Easy:   "chip-teal",
  Medium: "chip-amber",
  Hard:   "chip-coral",
};
const outcomeColor: Record<string, string> = {
  Offer:       "chip-teal",
  Rejected:    "chip-coral",
  "No response": "chip",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={12} className={n <= rating ? "text-amber fill-amber" : "text-border"} />
      ))}
    </span>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-paper rounded-full overflow-hidden">
        <div className="h-full bg-teal rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-ink font-mono w-5 text-right">{value}</span>
    </div>
  );
}

const BLANK_INTERVIEW = { role: "", difficulty: "Medium", outcome: "Offer", steps: [""] };

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [interviews, setInterviews] = useState(MOCK_INTERVIEWS as any[]);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [form, setForm] = useState({ ...BLANK_INTERVIEW, steps: [""] });

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => r.json())
      .then(setCompany);
  }, [id]);

  if (!company) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  const avgRating = 4.1;
  const openRoles = company.jobs?.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Company header */}
      <div className="card overflow-hidden">
        <div className="h-28 gradient-brand" />
        <div className="p-6 -mt-8">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="h-16 w-16 rounded-xl bg-surface border-2 border-border flex items-center justify-center overflow-hidden shrink-0 shadow-card">
              {company.logoUrl
                ? <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
                : <Briefcase size={24} className="text-muted" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl text-ink">{company.name}</h1>
                {openRoles > 0 && (
                  <span className="chip-teal !py-0.5 !px-2 !text-[11px] flex items-center gap-1">
                    <Zap size={10} /> Actively hiring
                  </span>
                )}
              </div>
              <p className="text-sm text-muted">{company.industry}{company.size ? ` · ${company.size}` : ""}</p>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-coral flex items-center gap-1">
                    <Globe size={11} /> {company.website}
                  </a>
                )}
                <span className="text-xs text-muted flex items-center gap-1">
                  <Users2 size={11} /> {company.employeesOnPlatform} on SkillWarehouse
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <MapPin size={11} /> India
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <Stars rating={Math.round(avgRating)} />
                <span className="text-sm font-semibold text-ink">{avgRating}</span>
              </div>
              <p className="text-[11px] text-muted">{MOCK_REVIEWS.length} reviews</p>
              <p className="text-[11px] text-muted">{openRoles} open roles</p>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="border-t border-border flex overflow-x-auto">
          {(["overview", "jobs", "reviews", "salaries", "interviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-3 text-xs font-medium capitalize whitespace-nowrap transition-colors border-b-2",
                tab === t ? "border-teal text-teal" : "border-transparent text-muted hover:text-ink"
              )}
            >
              {t === "jobs" ? `Jobs (${openRoles})` : t}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-4">
          {company.about && (
            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-2">About</p>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{company.about}</p>
            </div>
          )}

          <div className="card p-5">
            <p className="font-semibold text-sm text-ink mb-3">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((s) => (
                <span key={s} className="chip-brand">{s}</span>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="font-semibold text-sm text-ink mb-3">Culture highlights</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: CheckCircle2, label: "Flexible remote policy" },
                { icon: TrendingUp, label: "Strong L&D culture" },
                { icon: Building2, label: "Flat org structure" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-ink">
                  <div className="h-8 w-8 rounded-lg bg-teal-light flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-teal" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {company.members?.length > 0 && (
            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-3">Recruiters on SkillWarehouse</p>
              <div className="flex flex-wrap gap-3">
                {company.members.map((m: any) => (
                  <Link key={m.id} href={`/profile/${m.user.id}`} className="flex items-center gap-2 hover:underline">
                    <Avatar name={m.user.name} src={m.user.image} size="sm" />
                    <span className="text-sm text-ink">{m.user.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── JOBS ── */}
      {tab === "jobs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-display text-lg text-ink">Open roles ({openRoles})</h2>
            <input className="input !w-48 !text-xs !py-1.5" placeholder="Filter by title…" />
          </div>
          {openRoles === 0
            ? <p className="text-sm text-muted card p-6 text-center">No open roles right now.</p>
            : (
              <div className="grid sm:grid-cols-2 gap-4">
                {company.jobs?.map((j: any) => (
                  <JobCard key={j.id} job={{ ...j, company }} />
                ))}
              </div>
            )}
        </div>
      )}

      {/* ── REVIEWS ── */}
      {tab === "reviews" && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-display text-4xl text-ink">{avgRating}</p>
                <Stars rating={Math.round(avgRating)} />
                <p className="text-[11px] text-muted mt-1">{MOCK_REVIEWS.length} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                <RatingBar label="Work-Life Balance" value={3.8} />
                <RatingBar label="Salary & Benefits" value={4.1} />
                <RatingBar label="Culture"           value={4.5} />
                <RatingBar label="Career Growth"     value={3.6} />
              </div>
            </div>
          </div>

          {MOCK_REVIEWS.map((r) => (
            <div key={r.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm text-ink">{r.role}</p>
                  <p className="text-[11px] text-muted">{r.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  <span className="text-sm font-semibold text-ink">{r.rating}.0</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-teal-light rounded-lg">
                  <p className="text-[10px] font-semibold text-teal-dark uppercase tracking-wide flex items-center gap-1 mb-1">
                    <ThumbsUp size={10} /> Pros
                  </p>
                  <p className="text-xs text-ink">{r.pros}</p>
                </div>
                <div className="p-3 bg-coral-light rounded-lg">
                  <p className="text-[10px] font-semibold text-coral-dark uppercase tracking-wide flex items-center gap-1 mb-1">
                    <ThumbsDown size={10} /> Cons
                  </p>
                  <p className="text-xs text-ink">{r.cons}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <RatingBar label="Work-Life" value={r.wlb} />
                <RatingBar label="Salary"    value={r.salary} />
                <RatingBar label="Culture"   value={r.culture} />
              </div>
            </div>
          ))}

          <div className="card p-5 border-dashed border-2 flex flex-col items-center gap-2 text-center">
            <MessageSquare size={24} className="text-muted" />
            <p className="text-sm font-medium text-ink">Share your experience</p>
            <p className="text-xs text-muted">Help others by writing a review for {company.name}</p>
            <button className="btn-accent btn-sm mt-1">Write a review</button>
          </div>
        </div>
      )}

      {/* ── SALARIES ── */}
      {tab === "salaries" && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border">
              <p className="font-semibold text-sm text-ink">Role-wise Salary Data (LPA)</p>
              <p className="text-xs text-muted">Based on {MOCK_SALARIES.reduce((a, s) => a + s.reports, 0)} employee reports</p>
            </div>
            <div className="divide-y divide-border">
              <div className="grid grid-cols-5 px-4 py-2 text-[11px] font-semibold text-muted uppercase tracking-wide bg-paper">
                <span className="col-span-2">Role</span>
                <span className="text-right">Avg</span>
                <span className="text-right">Range</span>
                <span className="text-right">Reports</span>
              </div>
              {MOCK_SALARIES.map((row) => (
                <div key={row.role} className="grid grid-cols-5 px-4 py-3 text-xs hover:bg-paper transition-colors">
                  <span className="col-span-2 text-ink font-medium">{row.role}</span>
                  <span className="text-right font-mono text-teal font-semibold">{row.avg} LPA</span>
                  <span className="text-right text-muted">{row.min}–{row.max}</span>
                  <span className="text-right text-muted">{row.reports}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5 border-dashed border-2 flex flex-col items-center gap-2 text-center">
            <DollarSign size={24} className="text-muted" />
            <p className="text-sm font-medium text-ink">Add your salary</p>
            <p className="text-xs text-muted">Contribute anonymously to help the community</p>
            <button className="btn-outline btn-sm mt-1">Submit salary</button>
          </div>
        </div>
      )}

      {/* ── INTERVIEWS ── */}
      {tab === "interviews" && (
        <div className="space-y-4">
          {interviews.map((iv, idx) => (
            <div key={idx} className="card p-5 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <p className="font-medium text-sm text-ink">{iv.role}</p>
                <div className="flex gap-2">
                  <span className={cn("chip !py-0.5 !px-2 !text-[11px]", difficultyColor[iv.difficulty] ?? "chip")}>
                    {iv.difficulty}
                  </span>
                  <span className={cn("chip !py-0.5 !px-2 !text-[11px]", outcomeColor[iv.outcome] ?? "chip")}>
                    {iv.outcome}
                  </span>
                </div>
              </div>
              <div className="route-line space-y-2">
                {iv.steps.filter(Boolean).map((step: string, i: number) => (
                  <div key={i} className="relative">
                    <span className={i === iv.steps.length - 1 && iv.outcome === "Offer" ? "route-node-done" : "route-node"} />
                    <p className="text-xs text-ink">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="card p-5 border-dashed border-2 flex flex-col items-center gap-2 text-center">
            <MessageSquare size={24} className="text-muted" />
            <p className="text-sm font-medium text-ink">Share your interview experience</p>
            <button className="btn-accent btn-sm mt-1" onClick={() => { setForm({ ...BLANK_INTERVIEW, steps: [""] }); setShowInterviewModal(true); }}>
              Add experience
            </button>
          </div>
        </div>
      )}

      {/* ── INTERVIEW MODAL ── */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display text-lg text-ink">Share interview experience</h2>
              <button onClick={() => setShowInterviewModal(false)} className="p-1.5 rounded-lg hover:bg-paper text-muted">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Role */}
              <div>
                <label className="label">Role applied for</label>
                <input className="input" placeholder="e.g. Senior Data Engineer"
                  value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </div>

              {/* Difficulty */}
              <div>
                <label className="label">Difficulty</label>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <button key={d} onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                      className={cn("chip flex-1 justify-center transition-colors",
                        form.difficulty === d ? difficultyColor[d] : "hover:bg-paper")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outcome */}
              <div>
                <label className="label">Outcome</label>
                <div className="flex gap-2">
                  {["Offer", "Rejected", "No response"].map((o) => (
                    <button key={o} onClick={() => setForm((f) => ({ ...f, outcome: o }))}
                      className={cn("chip flex-1 justify-center text-[11px] transition-colors",
                        form.outcome === o ? outcomeColor[o] : "hover:bg-paper")}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <label className="label">Interview steps</label>
                <div className="space-y-2">
                  {form.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input className="input flex-1 !py-1.5 !text-sm" placeholder={`Step ${i + 1}`}
                        value={step}
                        onChange={(e) => {
                          const steps = [...form.steps];
                          steps[i] = e.target.value;
                          setForm((f) => ({ ...f, steps }));
                        }} />
                      {form.steps.length > 1 && (
                        <button onClick={() => setForm((f) => ({ ...f, steps: f.steps.filter((_, j) => j !== i) }))}
                          className="p-1.5 text-muted hover:text-coral transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, ""] }))}
                    className="btn-ghost btn-sm flex items-center gap-1 text-teal">
                    <Plus size={13} /> Add step
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-5 border-t border-border">
              <button onClick={() => setShowInterviewModal(false)} className="btn-outline flex-1">Cancel</button>
              <button
                disabled={!form.role.trim() || form.steps.every((s) => !s.trim())}
                onClick={() => {
                  setInterviews((prev) => [...prev, { ...form, steps: form.steps.filter(Boolean), id: Date.now() }]);
                  setShowInterviewModal(false);
                }}
                className="btn-accent flex-1">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
