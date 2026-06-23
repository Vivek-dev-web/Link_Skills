"use client";

import { useState, useRef } from "react";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Download,
  Eye, Sparkles, Plus, Trash2, User, Briefcase, GraduationCap,
  Award, Code2, FolderOpen, Globe, ToggleLeft, ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SCORE_TIPS = [
  { done: true,  text: "Add work experience (2+ positions)" },
  { done: true,  text: "Add educational background" },
  { done: false, text: "Write a professional summary" },
  { done: false, text: "Include at least 5 skills" },
  { done: false, text: "Add certifications or courses" },
];

const SECTIONS = [
  { id: "info",           label: "Personal Info",    icon: User,          done: true },
  { id: "summary",        label: "Summary",          icon: FileText,      done: false },
  { id: "experience",     label: "Work Experience",  icon: Briefcase,     done: true },
  { id: "education",      label: "Education",        icon: GraduationCap, done: true },
  { id: "skills",         label: "Skills",           icon: Code2,         done: false },
  { id: "certifications", label: "Certifications",   icon: Award,         done: false },
  { id: "projects",       label: "Projects",         icon: FolderOpen,    done: false },
  { id: "languages",      label: "Languages",        icon: Globe,         done: false },
];

const TEMPLATES = ["Classic", "Modern", "Tech Minimal", "Creative"];

function ScoreGauge({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? "#00C4A7" : score >= 45 ? "#F59E0B" : "#FF6B47";
  return (
    <svg width="116" height="116" viewBox="0 0 116 116" className="shrink-0">
      <circle cx="58" cy="58" r={r} fill="none" stroke="#E4E7EC" strokeWidth="10" />
      <circle
        cx="58" cy="58" r={r} fill="none"
        stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 58 58)"
        style={{ transition: "stroke-dasharray 1s ease-out" }}
      />
      <text x="58" y="53" textAnchor="middle" fontSize="24" fontWeight="700" fill="#1B1F3B" fontFamily="'JetBrains Mono', monospace">
        {score}
      </text>
      <text x="58" y="70" textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="Inter, sans-serif">
        / 100
      </text>
    </svg>
  );
}

export default function ResumePage() {
  const [tab, setTab] = useState<"dashboard" | "builder">("dashboard");
  const [template, setTemplate] = useState("Modern");
  const [activeSection, setActiveSection] = useState("info");
  const [recruiterVisible, setRecruiterVisible] = useState(true);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const score = 58;
  const done = SECTIONS.filter((s) => s.done).length;
  const completePct = Math.round((done / SECTIONS.length) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Resume Manager</h1>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["dashboard", "builder"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                tab === t ? "bg-ink text-paper" : "text-muted hover:bg-paper"
              )}
            >
              {t === "dashboard" ? "Dashboard" : "Resume Builder"}
            </button>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === "dashboard" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Score card */}
            <div className="card p-6 flex items-start gap-6 flex-wrap">
              <ScoreGauge score={score} />
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg text-ink mb-0.5">Resume Score</p>
                <p className="text-xs text-muted mb-3">
                  Your resume is{" "}
                  <span className="font-semibold text-amber">below average</span>.
                  Complete these to reach 80+:
                </p>
                <div className="space-y-2">
                  {SCORE_TIPS.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {tip.done
                        ? <CheckCircle2 size={14} className="text-teal shrink-0" />
                        : <AlertCircle size={14} className="text-amber shrink-0" />}
                      <span className={tip.done ? "text-muted line-through" : "text-ink"}>
                        {tip.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload zone */}
            <div
              className={cn(
                "card p-8 border-2 border-dashed flex flex-col items-center gap-3 cursor-pointer select-none",
                dragging ? "border-teal bg-teal-light" : "border-border hover:border-teal/60"
              )}
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); setDragging(false); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" />
              <div className="h-12 w-12 rounded-full bg-teal-light flex items-center justify-center">
                <Upload size={22} className="text-teal" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm text-ink">Drop your resume here</p>
                <p className="text-xs text-muted mt-0.5">PDF or DOCX · up to 5 MB</p>
              </div>
              <button
                className="btn-accent btn-sm"
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                Browse files
              </button>
            </div>

            {/* Profile completeness */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-ink">Profile Completeness</p>
                <span className="text-sm font-mono text-teal">{completePct}%</span>
              </div>
              <div className="h-2 bg-paper rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-teal rounded-full transition-[width] duration-700"
                  style={{ width: `${completePct}%` }}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg",
                        s.done ? "text-teal" : "text-muted"
                      )}
                    >
                      {s.done
                        ? <CheckCircle2 size={12} />
                        : <AlertCircle size={12} />}
                      <Icon size={12} />
                      {s.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-3">Resume Visibility</p>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs text-ink font-medium">Searchable by recruiters</p>
                  <p className="text-[11px] text-muted">Let recruiters discover your profile</p>
                </div>
                <button
                  onClick={() => setRecruiterVisible((v) => !v)}
                  className="text-teal transition-colors"
                >
                  {recruiterVisible
                    ? <ToggleRight size={30} />
                    : <ToggleLeft size={30} className="text-muted" />}
                </button>
              </div>
              <div className="border-t border-border pt-3 mt-2 space-y-1">
                <p className="text-[11px] text-muted">Last updated: 3 days ago</p>
                <p className="text-xs font-semibold text-ink">24 recruiter views this month</p>
              </div>
            </div>

            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-3">Quick Actions</p>
              <div className="space-y-2">
                <button className="w-full btn-outline btn-sm justify-start gap-2 text-left">
                  <Download size={13} /> Download as PDF
                </button>
                <button className="w-full btn-outline btn-sm justify-start gap-2 text-left">
                  <Eye size={13} /> Preview resume
                </button>
                <button
                  className="w-full btn-accent btn-sm justify-start gap-2 text-left"
                  onClick={() => setTab("builder")}
                >
                  <Sparkles size={13} /> Open Builder
                </button>
              </div>
            </div>

            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-1">Resume Downloads</p>
              <p className="font-display text-3xl text-teal">7</p>
              <p className="text-[11px] text-muted">by recruiters this month</p>
            </div>
          </div>
        </div>
      )}

      {/* ── BUILDER TAB ── */}
      {tab === "builder" && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Section navigator */}
          <div className="lg:col-span-1 space-y-3">
            <div className="card p-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted px-2 py-1.5">Sections</p>
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-left transition-colors",
                      activeSection === s.id
                        ? "bg-brand-light text-ink font-medium"
                        : "text-muted hover:bg-paper hover:text-ink"
                    )}
                  >
                    <Icon size={12} />
                    <span className="flex-1">{s.label}</span>
                    {s.done && <CheckCircle2 size={11} className="text-teal" />}
                  </button>
                );
              })}
            </div>

            <div className="card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">Template</p>
              {TEMPLATES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                    template === t ? "text-teal font-semibold" : "text-muted hover:text-ink"
                  )}
                >
                  {template === t && "✓ "}{t}
                </button>
              ))}
            </div>
          </div>

          {/* Form area */}
          <div className="lg:col-span-2 card p-5">
            {activeSection === "info" && (
              <div className="space-y-4">
                <p className="font-display text-lg text-ink">Personal Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">First Name</label><input className="input" placeholder="Rahul" /></div>
                  <div><label className="label">Last Name</label><input className="input" placeholder="Sharma" /></div>
                </div>
                <div><label className="label">Job Title</label><input className="input" placeholder="Senior Data Engineer" /></div>
                <div><label className="label">Email</label><input className="input" type="email" placeholder="rahul@example.com" /></div>
                <div><label className="label">Location</label><input className="input" placeholder="Bengaluru, India" /></div>
                <div><label className="label">LinkedIn</label><input className="input" placeholder="linkedin.com/in/rahulsharma" /></div>
                <div><label className="label">GitHub / Portfolio</label><input className="input" placeholder="github.com/rahulsharma" /></div>
              </div>
            )}

            {activeSection === "summary" && (
              <div className="space-y-3">
                <p className="font-display text-lg text-ink">Professional Summary</p>
                <p className="text-xs text-muted">3–5 sentences on your key strengths, experience, and goals.</p>
                <textarea className="textarea h-44" placeholder="Results-driven Data Engineer with 6+ years building scalable data pipelines..." />
                <p className="text-[11px] text-muted">Tip: mention your primary tech stack and a key business impact.</p>
              </div>
            )}

            {activeSection === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-ink">Work Experience</p>
                  <button className="btn-accent btn-sm"><Plus size={13} /> Add role</button>
                </div>
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-ink">Position 1</p>
                    <button className="p-1 text-muted hover:text-coral transition-colors"><Trash2 size={13} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Job Title</label><input className="input" placeholder="Data Engineer" /></div>
                    <div><label className="label">Company</label><input className="input" placeholder="Flipkart" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Start</label><input className="input" type="month" /></div>
                    <div><label className="label">End</label><input className="input" type="month" /></div>
                  </div>
                  <div><label className="label">Tech used</label><input className="input" placeholder="Python, Spark, AWS" /></div>
                  <div><label className="label">Key achievements</label><textarea className="textarea h-20" placeholder="• Reduced pipeline latency by 40%..." /></div>
                </div>
              </div>
            )}

            {activeSection === "skills" && (
              <div className="space-y-3">
                <p className="font-display text-lg text-ink">Skills</p>
                <p className="text-xs text-muted">Add skills relevant to your target roles.</p>
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-xl min-h-20">
                  {["Python", "Databricks", "Apache Spark", "AWS"].map((s) => (
                    <span key={s} className="chip flex items-center gap-1">
                      {s} <button className="text-muted hover:text-coral"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <input className="input" placeholder="Type a skill and press Enter" />
              </div>
            )}

            {!["info", "summary", "experience", "skills"].includes(activeSection) && (
              <div className="flex flex-col items-center justify-center h-52 text-center">
                <FileText size={32} className="text-muted mb-3" />
                <p className="font-medium text-sm text-ink capitalize">{activeSection.replace("-", " ")}</p>
                <p className="text-xs text-muted mt-1">Add entries to this section</p>
                <button className="btn-accent btn-sm mt-4"><Plus size={13} /> Add entry</button>
              </div>
            )}

            <div className="pt-5 flex gap-2">
              <button className="btn-accent flex-1">Save section</button>
              <button className="btn-outline btn-sm gap-1.5"><Download size={13} /> PDF</button>
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:col-span-2 card p-4 bg-paper">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                Live Preview · {template}
              </p>
              <button className="btn-outline btn-sm gap-1"><Eye size={11} /> Expand</button>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 text-xs space-y-4 min-h-96">
              {/* Preview header */}
              <div className="pb-3 border-b border-border">
                <p className="font-display text-base text-ink">Rahul Sharma</p>
                <p className="text-muted text-[11px]">Senior Data Engineer · Bengaluru</p>
                <p className="text-teal text-[11px] mt-0.5">rahul@example.com · github.com/rahulsharma</p>
              </div>
              <div>
                <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-1">Summary</p>
                <p className="text-ink leading-relaxed text-[11px]">
                  Experienced Data Engineer with 6+ years building scalable data pipelines and cloud infrastructure on AWS and Databricks…
                </p>
              </div>
              <div>
                <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-2">Experience</p>
                <div className="route-line space-y-3">
                  <div className="relative">
                    <span className="route-node-done" />
                    <p className="font-medium text-ink text-[11px]">Senior Data Engineer · Flipkart</p>
                    <p className="text-muted text-[10px]">Jan 2022 – Present · Bengaluru</p>
                  </div>
                  <div className="relative">
                    <span className="route-node" />
                    <p className="font-medium text-ink text-[11px]">Data Engineer · Myntra</p>
                    <p className="text-muted text-[10px]">Jun 2019 – Dec 2021 · Bengaluru</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-1">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {["Python", "Spark", "Databricks", "AWS", "Terraform"].map((s) => (
                    <span key={s} className="chip !py-0 !px-1.5 !text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
