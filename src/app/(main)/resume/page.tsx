"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Download,
  Eye, Sparkles, Plus, Trash2, User, Briefcase, GraduationCap,
  Award, Code2, FolderOpen, Globe, ToggleLeft, ToggleRight, X, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

// ─── Types ───────────────────────────────────────────────────────
type Experience   = { id: string; title: string; company: string; location: string; start: string; end: string; current: boolean; tech: string; achievements: string };
type Education    = { id: string; school: string; degree: string; field: string; start: string; end: string };
type Certification= { id: string; name: string; issuer: string; date: string; url: string };
type Project      = { id: string; name: string; description: string; tech: string; url: string };
type Language     = { id: string; name: string; proficiency: string };

type ResumeData = {
  info:           { firstName: string; lastName: string; title: string; email: string; location: string; linkedin: string; portfolio: string };
  summary:        string;
  experience:     Experience[];
  education:      Education[];
  skills:         string[];
  certifications: Certification[];
  projects:       Project[];
  languages:      Language[];
};

const BLANK: ResumeData = {
  info:           { firstName: "", lastName: "", title: "", email: "", location: "", linkedin: "", portfolio: "" },
  summary:        "",
  experience:     [{ id: "e1", title: "", company: "", location: "", start: "", end: "", current: false, tech: "", achievements: "" }],
  education:      [{ id: "edu1", school: "", degree: "", field: "", start: "", end: "" }],
  skills:         [],
  certifications: [],
  projects:       [],
  languages:      [],
};

function uid() { return Math.random().toString(36).slice(2, 9); }

function loadSaved(): ResumeData {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("atlas_resume_v1") : null;
    if (raw) return JSON.parse(raw) as ResumeData;
  } catch {}
  return BLANK;
}

// ─── Score gauge ─────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const r = 44, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  const color = score >= 70 ? "#00C4A7" : score >= 45 ? "#F59E0B" : "#FF6B47";
  return (
    <svg width="116" height="116" viewBox="0 0 116 116" className="shrink-0">
      <circle cx="58" cy="58" r={r} fill="none" stroke="#E4E7EC" strokeWidth="10" />
      <circle cx="58" cy="58" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 58 58)"
        style={{ transition: "stroke-dasharray 1s ease-out" }} />
      <text x="58" y="53" textAnchor="middle" fontSize="24" fontWeight="700" fill="#1B1F3B" fontFamily="monospace">{score}</text>
      <text x="58" y="70" textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="sans-serif">/ 100</text>
    </svg>
  );
}

// ─── Upload state ────────────────────────────────────────────────
type UploadState = "idle" | "uploading" | "success" | "error";

const SECTION_META = [
  { id: "info",           label: "Personal Info",   icon: User          },
  { id: "summary",        label: "Summary",          icon: FileText      },
  { id: "experience",     label: "Work Experience",  icon: Briefcase     },
  { id: "education",      label: "Education",        icon: GraduationCap },
  { id: "skills",         label: "Skills",           icon: Code2         },
  { id: "certifications", label: "Certifications",   icon: Award         },
  { id: "projects",       label: "Projects",         icon: FolderOpen    },
  { id: "languages",      label: "Languages",        icon: Globe         },
];

const TEMPLATES = ["Classic", "Modern", "Tech Minimal", "Creative"];
const PROFICIENCY = ["Beginner", "Conversational", "Professional", "Fluent", "Native"];

// ─── Main component ───────────────────────────────────────────────
export default function ResumePage() {
  const { show } = useToast();
  const [tab, setTab]                     = useState<"dashboard" | "builder">("dashboard");
  const [template, setTemplate]           = useState("Modern");
  const [activeSection, setActiveSection] = useState("info");
  const [recruiterVisible, setRecruiterVisible] = useState(true);
  const [dragging, setDragging]           = useState(false);
  const [uploadState, setUploadState]     = useState<UploadState>("idle");
  const [uploadedFile, setUploadedFile]   = useState<{ name: string; size: number; url: string } | null>(null);
  const [uploadError, setUploadError]     = useState<string | null>(null);
  const [resume, setResume]               = useState<ResumeData>(BLANK);
  const [skillInput, setSkillInput]       = useState("");
  const [saved, setSaved]                 = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => { setResume(loadSaved()); }, []);

  // ── Helpers ──
  function updateInfo(field: keyof ResumeData["info"], val: string) {
    setResume((r) => ({ ...r, info: { ...r.info, [field]: val } }));
  }
  function updateExp(id: string, field: keyof Experience, val: string | boolean) {
    setResume((r) => ({ ...r, experience: r.experience.map((e) => e.id === id ? { ...e, [field]: val } : e) }));
  }
  function addExp() {
    setResume((r) => ({ ...r, experience: [...r.experience, { id: uid(), title: "", company: "", location: "", start: "", end: "", current: false, tech: "", achievements: "" }] }));
  }
  function removeExp(id: string) {
    setResume((r) => ({ ...r, experience: r.experience.filter((e) => e.id !== id) }));
  }
  function updateEdu(id: string, field: keyof Education, val: string) {
    setResume((r) => ({ ...r, education: r.education.map((e) => e.id === id ? { ...e, [field]: val } : e) }));
  }
  function addEdu() {
    setResume((r) => ({ ...r, education: [...r.education, { id: uid(), school: "", degree: "", field: "", start: "", end: "" }] }));
  }
  function removeEdu(id: string) {
    setResume((r) => ({ ...r, education: r.education.filter((e) => e.id !== id) }));
  }
  function addSkill() {
    const s = skillInput.trim();
    if (!s || resume.skills.includes(s)) { setSkillInput(""); return; }
    setResume((r) => ({ ...r, skills: [...r.skills, s] }));
    setSkillInput("");
  }
  function removeSkill(s: string) {
    setResume((r) => ({ ...r, skills: r.skills.filter((x) => x !== s) }));
  }
  function updateCert(id: string, field: keyof Certification, val: string) {
    setResume((r) => ({ ...r, certifications: r.certifications.map((c) => c.id === id ? { ...c, [field]: val } : c) }));
  }
  function addCert() {
    setResume((r) => ({ ...r, certifications: [...r.certifications, { id: uid(), name: "", issuer: "", date: "", url: "" }] }));
  }
  function removeCert(id: string) {
    setResume((r) => ({ ...r, certifications: r.certifications.filter((c) => c.id !== id) }));
  }
  function updateProject(id: string, field: keyof Project, val: string) {
    setResume((r) => ({ ...r, projects: r.projects.map((p) => p.id === id ? { ...p, [field]: val } : p) }));
  }
  function addProject() {
    setResume((r) => ({ ...r, projects: [...r.projects, { id: uid(), name: "", description: "", tech: "", url: "" }] }));
  }
  function removeProject(id: string) {
    setResume((r) => ({ ...r, projects: r.projects.filter((p) => p.id !== id) }));
  }
  function updateLang(id: string, field: keyof Language, val: string) {
    setResume((r) => ({ ...r, languages: r.languages.map((l) => l.id === id ? { ...l, [field]: val } : l) }));
  }
  function addLang() {
    setResume((r) => ({ ...r, languages: [...r.languages, { id: uid(), name: "", proficiency: "Conversational" }] }));
  }
  function removeLang(id: string) {
    setResume((r) => ({ ...r, languages: r.languages.filter((l) => l.id !== id) }));
  }

  function saveSection() {
    localStorage.setItem("atlas_resume_v1", JSON.stringify(resume));
    setSaved(true);
    show("Section saved", "success");
    setTimeout(() => setSaved(false), 2000);
  }

  function printResume() {
    const content = previewRef.current?.innerHTML;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Resume</title>
<style>
  body{font-family:Inter,system-ui,sans-serif;max-width:700px;margin:40px auto;color:#1B1F3B;font-size:12px;line-height:1.5}
  h1{font-size:20px;font-weight:700;margin:0 0 2px}
  .sub{color:#64748B;font-size:11px}
  .teal{color:#00C4A7}
  hr{border:none;border-top:1px solid #E4E7EC;margin:10px 0}
  .label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin:10px 0 4px}
  .chip{display:inline-block;border:1px solid #E4E7EC;border-radius:4px;padding:1px 7px;margin:2px;font-size:10px}
  .exp-row{margin-bottom:8px}
  .exp-row strong{font-size:12px}
  @media print{body{margin:0}}
</style></head><body>${content}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  }

  // ── Computed score / completeness based on actual data ──
  const hasSummary   = resume.summary.trim().length > 20;
  const hasSkills    = resume.skills.length >= 3;
  const hasCerts     = resume.certifications.length > 0;
  const hasExp       = resume.experience.some((e) => e.title.trim());
  const hasEdu       = resume.education.some((e) => e.school.trim());
  const hasInfo      = !!(resume.info.firstName.trim() && resume.info.email.trim());
  const doneSections = [hasInfo, hasSummary, hasExp, hasEdu, hasSkills, hasCerts, resume.projects.length > 0, resume.languages.length > 0];
  const doneCount    = doneSections.filter(Boolean).length;
  const completePct  = Math.round((doneCount / 8) * 100);
  const score        = Math.min(100, 30 + doneCount * 10);

  const SCORE_TIPS = [
    { done: hasExp,     text: "Add work experience (2+ positions)" },
    { done: hasEdu,     text: "Add educational background" },
    { done: hasSummary, text: "Write a professional summary" },
    { done: hasSkills,  text: "Include at least 3 skills" },
    { done: hasCerts,   text: "Add certifications or courses" },
  ];

  const sectionDone: Record<string, boolean> = {
    info: hasInfo, summary: hasSummary, experience: hasExp, education: hasEdu,
    skills: hasSkills, certifications: hasCerts, projects: resume.projects.length > 0, languages: resume.languages.length > 0,
  };

  // ── Upload handler ──
  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") { setUploadError("Only PDF and DOCX files are supported."); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("File must be under 5 MB."); return; }
    setUploadState("uploading"); setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("folder", "resumes");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUploadedFile({ name: file.name, size: file.size, url: data.url });
      setUploadState("success");
    } catch (err: any) {
      setUploadError(err.message ?? "Upload failed. Please try again.");
      setUploadState("error");
    }
  }

  // ── Preview name ──
  const previewName = [resume.info.firstName, resume.info.lastName].filter(Boolean).join(" ") || "Your Name";
  const previewTitle = resume.info.title || "Your Title";
  const previewLocation = resume.info.location || "Your Location";
  const previewEmail = resume.info.email || "your@email.com";
  const previewPortfolio = resume.info.portfolio || "";

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Resume Manager</h1>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["dashboard", "builder"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                tab === t ? "bg-ink text-paper" : "text-muted hover:bg-paper")}>
              {t === "dashboard" ? "Dashboard" : "Resume Builder"}
            </button>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === "dashboard" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Score */}
            <div className="card p-6 flex items-start gap-6 flex-wrap">
              <ScoreGauge score={score} />
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg text-ink mb-0.5">Resume Score</p>
                <p className="text-xs text-muted mb-3">
                  Your resume is <span className={cn("font-semibold", score >= 70 ? "text-teal" : "text-amber")}>
                    {score >= 70 ? "above average" : "below average"}</span>. Complete these to reach 80+:
                </p>
                <div className="space-y-2">
                  {SCORE_TIPS.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {tip.done ? <CheckCircle2 size={14} className="text-teal shrink-0" /> : <AlertCircle size={14} className="text-amber shrink-0" />}
                      <span className={tip.done ? "text-muted line-through" : "text-ink"}>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload zone */}
            {uploadState === "success" && uploadedFile ? (
              <div className="card p-5 border-2 border-teal/40 bg-teal-light/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-light flex items-center justify-center shrink-0"><FileText size={18} className="text-teal" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-muted">{(uploadedFile.size / 1024).toFixed(0)} KB · Uploaded successfully</p>
                  </div>
                  <CheckCircle2 size={20} className="text-teal shrink-0" />
                </div>
                <div className="flex gap-2 mt-3">
                  <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm flex items-center gap-1.5"><Eye size={13} /> Preview</a>
                  <a href={uploadedFile.url} download={uploadedFile.name} className="btn-outline btn-sm flex items-center gap-1.5"><Download size={13} /> Download</a>
                  <button className="btn-ghost btn-sm text-muted ml-auto"
                    onClick={() => { setUploadState("idle"); setUploadedFile(null); if (fileRef.current) fileRef.current.value = ""; }}>Replace</button>
                </div>
              </div>
            ) : (
              <div
                className={cn("card p-8 border-2 border-dashed flex flex-col items-center gap-3 cursor-pointer select-none transition-colors",
                  dragging ? "border-teal bg-teal-light" : "border-border hover:border-teal/60",
                  uploadState === "uploading" && "pointer-events-none opacity-70")}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => uploadState !== "uploading" && fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                <div className="h-12 w-12 rounded-full bg-teal-light flex items-center justify-center">
                  {uploadState === "uploading" ? <div className="h-5 w-5 rounded-full border-2 border-teal border-t-transparent animate-spin" /> : <Upload size={22} className="text-teal" />}
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-ink">{uploadState === "uploading" ? "Uploading…" : "Drop your resume here"}</p>
                  <p className="text-xs text-muted mt-0.5">PDF or DOCX · up to 5 MB</p>
                </div>
                {uploadState !== "uploading" && (
                  <button className="btn-accent btn-sm" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Browse files</button>
                )}
                {(uploadState === "error" || uploadError) && (
                  <p className="text-xs text-coral flex items-center gap-1"><AlertCircle size={12} /> {uploadError ?? "Upload failed."}</p>
                )}
              </div>
            )}

            {/* Profile completeness */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-ink">Profile Completeness</p>
                <span className="text-sm font-mono text-teal">{completePct}%</span>
              </div>
              <div className="h-2 bg-paper rounded-full overflow-hidden mb-4">
                <div className="h-full bg-teal rounded-full transition-[width] duration-700" style={{ width: `${completePct}%` }} />
              </div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {SECTION_META.map((s, i) => {
                  const Icon = s.icon;
                  const done = doneSections[i];
                  return (
                    <button key={s.id} onClick={() => { setTab("builder"); setActiveSection(s.id); }}
                      className={cn("flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-paper transition-colors", done ? "text-teal" : "text-muted")}>
                      {done ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      <Icon size={12} />{s.label}
                    </button>
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
                <button onClick={() => setRecruiterVisible((v) => !v)} className="text-teal transition-colors">
                  {recruiterVisible ? <ToggleRight size={30} /> : <ToggleLeft size={30} className="text-muted" />}
                </button>
              </div>
              <div className="border-t border-border pt-3 mt-2 space-y-1">
                <p className="text-[11px] text-muted">Last updated: just now</p>
                <p className="text-xs font-semibold text-ink">24 recruiter views this month</p>
              </div>
            </div>
            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-3">Quick Actions</p>
              <div className="space-y-2">
                <button onClick={printResume} className="w-full btn-outline btn-sm justify-start gap-2 text-left"><Download size={13} /> Download as PDF</button>
                <button onClick={() => setTab("builder")} className="w-full btn-outline btn-sm justify-start gap-2 text-left"><Eye size={13} /> Open Builder</button>
                <button onClick={() => setTab("builder")} className="w-full btn-accent btn-sm justify-start gap-2 text-left"><Sparkles size={13} /> Open Builder</button>
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
              {SECTION_META.map((s) => {
                const Icon = s.icon;
                const done = sectionDone[s.id];
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-left transition-colors",
                      activeSection === s.id ? "bg-brand-light text-ink font-medium" : "text-muted hover:bg-paper hover:text-ink")}>
                    <Icon size={12} />
                    <span className="flex-1">{s.label}</span>
                    {done && <CheckCircle2 size={11} className="text-teal" />}
                  </button>
                );
              })}
            </div>
            <div className="card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">Template</p>
              {TEMPLATES.map((t) => (
                <button key={t} onClick={() => setTemplate(t)}
                  className={cn("w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                    template === t ? "text-teal font-semibold" : "text-muted hover:text-ink")}>
                  {template === t && "✓ "}{t}
                </button>
              ))}
            </div>
          </div>

          {/* ── Form area ── */}
          <div className="lg:col-span-2 card p-5 space-y-4">

            {/* Personal Info */}
            {activeSection === "info" && (
              <div className="space-y-4">
                <p className="font-display text-lg text-ink">Personal Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">First Name</label>
                    <input className="input" placeholder="Rahul" value={resume.info.firstName} onChange={(e) => updateInfo("firstName", e.target.value)} /></div>
                  <div><label className="label">Last Name</label>
                    <input className="input" placeholder="Sharma" value={resume.info.lastName} onChange={(e) => updateInfo("lastName", e.target.value)} /></div>
                </div>
                <div><label className="label">Job Title</label>
                  <input className="input" placeholder="Senior Data Engineer" value={resume.info.title} onChange={(e) => updateInfo("title", e.target.value)} /></div>
                <div><label className="label">Email</label>
                  <input className="input" type="email" placeholder="rahul@example.com" value={resume.info.email} onChange={(e) => updateInfo("email", e.target.value)} /></div>
                <div><label className="label">Location</label>
                  <input className="input" placeholder="Bengaluru, India" value={resume.info.location} onChange={(e) => updateInfo("location", e.target.value)} /></div>
                <div><label className="label">LinkedIn</label>
                  <input className="input" placeholder="linkedin.com/in/yourname" value={resume.info.linkedin} onChange={(e) => updateInfo("linkedin", e.target.value)} /></div>
                <div><label className="label">GitHub / Portfolio</label>
                  <input className="input" placeholder="github.com/yourname" value={resume.info.portfolio} onChange={(e) => updateInfo("portfolio", e.target.value)} /></div>
              </div>
            )}

            {/* Summary */}
            {activeSection === "summary" && (
              <div className="space-y-3">
                <p className="font-display text-lg text-ink">Professional Summary</p>
                <p className="text-xs text-muted">3–5 sentences on your key strengths, experience, and goals.</p>
                <textarea className="textarea h-44" placeholder="Results-driven Data Engineer with 6+ years building scalable data pipelines…"
                  value={resume.summary} onChange={(e) => setResume((r) => ({ ...r, summary: e.target.value }))} />
                <p className="text-[11px] text-muted">Tip: mention your primary tech stack and a key business impact.</p>
              </div>
            )}

            {/* Work Experience */}
            {activeSection === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-ink">Work Experience</p>
                  <button onClick={addExp} className="btn-accent btn-sm flex items-center gap-1"><Plus size={13} /> Add role</button>
                </div>
                {resume.experience.map((exp, i) => (
                  <div key={exp.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-ink">Position {i + 1}</p>
                      {resume.experience.length > 1 && (
                        <button onClick={() => removeExp(exp.id)} className="p-1 text-muted hover:text-coral transition-colors"><Trash2 size={13} /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Job Title</label>
                        <input className="input" placeholder="Data Engineer" value={exp.title} onChange={(e) => updateExp(exp.id, "title", e.target.value)} /></div>
                      <div><label className="label">Company</label>
                        <input className="input" placeholder="Flipkart" value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} /></div>
                    </div>
                    <div><label className="label">Location</label>
                      <input className="input" placeholder="Bengaluru, India" value={exp.location} onChange={(e) => updateExp(exp.id, "location", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Start</label>
                        <input className="input" type="month" value={exp.start} onChange={(e) => updateExp(exp.id, "start", e.target.value)} /></div>
                      <div><label className="label">End</label>
                        <input className="input" type="month" value={exp.end} disabled={exp.current} onChange={(e) => updateExp(exp.id, "end", e.target.value)} /></div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, "current", e.target.checked)} className="accent-teal" />
                      Currently working here
                    </label>
                    <div><label className="label">Tech stack</label>
                      <input className="input" placeholder="Python, Spark, AWS, Databricks" value={exp.tech} onChange={(e) => updateExp(exp.id, "tech", e.target.value)} /></div>
                    <div><label className="label">Key achievements</label>
                      <textarea className="textarea h-20" placeholder="• Reduced pipeline latency by 40%…" value={exp.achievements} onChange={(e) => updateExp(exp.id, "achievements", e.target.value)} /></div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {activeSection === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-ink">Education</p>
                  <button onClick={addEdu} className="btn-accent btn-sm flex items-center gap-1"><Plus size={13} /> Add</button>
                </div>
                {resume.education.map((edu, i) => (
                  <div key={edu.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-ink">Entry {i + 1}</p>
                      {resume.education.length > 1 && (
                        <button onClick={() => removeEdu(edu.id)} className="p-1 text-muted hover:text-coral transition-colors"><Trash2 size={13} /></button>
                      )}
                    </div>
                    <div><label className="label">School / University</label>
                      <input className="input" placeholder="IIT Bombay" value={edu.school} onChange={(e) => updateEdu(edu.id, "school", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Degree</label>
                        <input className="input" placeholder="B.Tech" value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} /></div>
                      <div><label className="label">Field of Study</label>
                        <input className="input" placeholder="Computer Science" value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Start</label>
                        <input className="input" type="month" value={edu.start} onChange={(e) => updateEdu(edu.id, "start", e.target.value)} /></div>
                      <div><label className="label">End</label>
                        <input className="input" type="month" value={edu.end} onChange={(e) => updateEdu(edu.id, "end", e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {activeSection === "skills" && (
              <div className="space-y-3">
                <p className="font-display text-lg text-ink">Skills</p>
                <p className="text-xs text-muted">Type a skill and press Enter to add it.</p>
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-xl min-h-[80px]">
                  {resume.skills.length === 0 && <p className="text-xs text-muted self-start">No skills added yet</p>}
                  {resume.skills.map((s) => (
                    <span key={s} className="chip flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="text-muted hover:text-coral transition-colors ml-0.5">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="e.g. Python, React, AWS…"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                  <button onClick={addSkill} className="btn-accent btn-sm px-3">Add</button>
                </div>
              </div>
            )}

            {/* Certifications */}
            {activeSection === "certifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-ink">Certifications</p>
                  <button onClick={addCert} className="btn-accent btn-sm flex items-center gap-1"><Plus size={13} /> Add</button>
                </div>
                {resume.certifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl">
                    <Award size={28} className="text-muted mb-2" />
                    <p className="text-sm text-muted">No certifications yet</p>
                    <button onClick={addCert} className="btn-accent btn-sm mt-3 flex items-center gap-1"><Plus size={13} /> Add certification</button>
                  </div>
                )}
                {resume.certifications.map((cert, i) => (
                  <div key={cert.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-ink">Certification {i + 1}</p>
                      <button onClick={() => removeCert(cert.id)} className="p-1 text-muted hover:text-coral transition-colors"><Trash2 size={13} /></button>
                    </div>
                    <div><label className="label">Certification Name</label>
                      <input className="input" placeholder="AWS Certified Solutions Architect" value={cert.name} onChange={(e) => updateCert(cert.id, "name", e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Issuer</label>
                        <input className="input" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => updateCert(cert.id, "issuer", e.target.value)} /></div>
                      <div><label className="label">Date</label>
                        <input className="input" type="month" value={cert.date} onChange={(e) => updateCert(cert.id, "date", e.target.value)} /></div>
                    </div>
                    <div><label className="label">Credential URL (optional)</label>
                      <input className="input" placeholder="https://…" value={cert.url} onChange={(e) => updateCert(cert.id, "url", e.target.value)} /></div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {activeSection === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-ink">Projects</p>
                  <button onClick={addProject} className="btn-accent btn-sm flex items-center gap-1"><Plus size={13} /> Add</button>
                </div>
                {resume.projects.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl">
                    <FolderOpen size={28} className="text-muted mb-2" />
                    <p className="text-sm text-muted">No projects yet</p>
                    <button onClick={addProject} className="btn-accent btn-sm mt-3 flex items-center gap-1"><Plus size={13} /> Add project</button>
                  </div>
                )}
                {resume.projects.map((proj, i) => (
                  <div key={proj.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-ink">Project {i + 1}</p>
                      <button onClick={() => removeProject(proj.id)} className="p-1 text-muted hover:text-coral transition-colors"><Trash2 size={13} /></button>
                    </div>
                    <div><label className="label">Project Name</label>
                      <input className="input" placeholder="Real-time Data Pipeline" value={proj.name} onChange={(e) => updateProject(proj.id, "name", e.target.value)} /></div>
                    <div><label className="label">Description</label>
                      <textarea className="textarea h-20" placeholder="What did you build and what impact did it have?" value={proj.description} onChange={(e) => updateProject(proj.id, "description", e.target.value)} /></div>
                    <div><label className="label">Tech stack</label>
                      <input className="input" placeholder="Kafka, Spark, PostgreSQL" value={proj.tech} onChange={(e) => updateProject(proj.id, "tech", e.target.value)} /></div>
                    <div><label className="label">URL (optional)</label>
                      <input className="input" placeholder="https://github.com/…" value={proj.url} onChange={(e) => updateProject(proj.id, "url", e.target.value)} /></div>
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {activeSection === "languages" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-ink">Languages</p>
                  <button onClick={addLang} className="btn-accent btn-sm flex items-center gap-1"><Plus size={13} /> Add</button>
                </div>
                {resume.languages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl">
                    <Globe size={28} className="text-muted mb-2" />
                    <p className="text-sm text-muted">No languages yet</p>
                    <button onClick={addLang} className="btn-accent btn-sm mt-3 flex items-center gap-1"><Plus size={13} /> Add language</button>
                  </div>
                )}
                {resume.languages.map((lang, i) => (
                  <div key={lang.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-ink">Language {i + 1}</p>
                      <button onClick={() => removeLang(lang.id)} className="p-1 text-muted hover:text-coral transition-colors"><Trash2 size={13} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Language</label>
                        <input className="input" placeholder="Hindi" value={lang.name} onChange={(e) => updateLang(lang.id, "name", e.target.value)} /></div>
                      <div><label className="label">Proficiency</label>
                        <select className="input" value={lang.proficiency} onChange={(e) => updateLang(lang.id, "proficiency", e.target.value)}>
                          {PROFICIENCY.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Save + PDF */}
            <div className="pt-2 flex gap-2 border-t border-border">
              <button onClick={saveSection}
                className={cn("btn-accent flex-1 flex items-center justify-center gap-2", saved && "bg-teal-dark")}>
                <Save size={13} /> {saved ? "Saved!" : "Save section"}
              </button>
              <button onClick={printResume} className="btn-outline btn-sm gap-1.5 flex items-center">
                <Download size={13} /> PDF
              </button>
            </div>
          </div>

          {/* ── Live preview ── */}
          <div className="lg:col-span-2 card p-4 bg-paper">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Live Preview · {template}</p>
              <button onClick={printResume} className="btn-outline btn-sm gap-1 flex items-center"><Eye size={11} /> Print / PDF</button>
            </div>
            <div ref={previewRef} className="bg-surface border border-border rounded-xl p-5 text-xs space-y-4 min-h-96 overflow-auto">
              <div className="pb-3 border-b border-border">
                <p className="font-display text-base text-ink">{previewName}</p>
                <p className="text-muted text-[11px]">{previewTitle} · {previewLocation}</p>
                <p className="text-teal text-[11px] mt-0.5">
                  {previewEmail}{previewPortfolio && ` · ${previewPortfolio}`}
                </p>
              </div>

              {resume.summary && (
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-1">Summary</p>
                  <p className="text-ink leading-relaxed text-[11px]">{resume.summary}</p>
                </div>
              )}

              {resume.experience.some((e) => e.title) && (
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-2">Experience</p>
                  <div className="route-line space-y-3">
                    {resume.experience.filter((e) => e.title).map((exp) => (
                      <div key={exp.id} className="relative">
                        <span className="route-node-done" />
                        <p className="font-medium text-ink text-[11px]">{exp.title}{exp.company && ` · ${exp.company}`}</p>
                        <p className="text-muted text-[10px]">
                          {exp.start && exp.start}{exp.start && (exp.current ? " – Present" : exp.end ? ` – ${exp.end}` : "")}{exp.location && ` · ${exp.location}`}
                        </p>
                        {exp.achievements && <p className="text-[10px] text-ink mt-0.5 whitespace-pre-line">{exp.achievements.slice(0, 120)}{exp.achievements.length > 120 ? "…" : ""}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.education.some((e) => e.school) && (
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-2">Education</p>
                  <div className="space-y-2">
                    {resume.education.filter((e) => e.school).map((edu) => (
                      <div key={edu.id}>
                        <p className="font-medium text-ink text-[11px]">{edu.school}</p>
                        <p className="text-muted text-[10px]">{[edu.degree, edu.field].filter(Boolean).join(" · ")}{edu.start && ` · ${edu.start}${edu.end ? ` – ${edu.end}` : ""}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.skills.length > 0 && (
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.map((s) => <span key={s} className="chip !py-0 !px-1.5 !text-[10px]">{s}</span>)}
                  </div>
                </div>
              )}

              {resume.certifications.some((c) => c.name) && (
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-1">Certifications</p>
                  <div className="space-y-1">
                    {resume.certifications.filter((c) => c.name).map((cert) => (
                      <div key={cert.id}>
                        <p className="font-medium text-[11px] text-ink">{cert.name}</p>
                        <p className="text-[10px] text-muted">{cert.issuer}{cert.date && ` · ${cert.date}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.projects.some((p) => p.name) && (
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-1">Projects</p>
                  <div className="space-y-2">
                    {resume.projects.filter((p) => p.name).map((proj) => (
                      <div key={proj.id}>
                        <p className="font-medium text-[11px] text-ink">{proj.name}</p>
                        {proj.description && <p className="text-[10px] text-muted">{proj.description.slice(0, 100)}</p>}
                        {proj.tech && <p className="text-[10px] text-teal">{proj.tech}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.languages.some((l) => l.name) && (
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-widest text-muted mb-1">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {resume.languages.filter((l) => l.name).map((lang) => (
                      <span key={lang.id} className="chip !text-[10px] !py-0">
                        {lang.name} <span className="text-muted">· {lang.proficiency}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
