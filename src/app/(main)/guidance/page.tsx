"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, GraduationCap, Briefcase, ChevronRight,
  CheckCircle2, Loader2, Star, Users, BookOpen,
  ArrowRight, X, Plus, Building2,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";
import { DOMAIN_SKILLS, NEXT_SKILLS } from "@/lib/recommender";

// ─── types ───────────────────────────────────────────────────────────────────

type Track = "student" | "professional";

type RecResult = {
  jobs:          any[];
  courses:       any[];
  matchedSkills: string[];
  domain:        string;
  roadmap:       { step: string; skills: string[] }[];
  nextSkills:    Record<string, string[]>;
};

// ─── constants ───────────────────────────────────────────────────────────────

const DOMAINS = Object.keys(DOMAIN_SKILLS);

const GOALS = [
  { value: "promote",  label: "Get promoted" },
  { value: "switch",   label: "Switch domain" },
  { value: "startup",  label: "Start a business" },
  { value: "abroad",   label: "Work abroad" },
];

const YEARS  = ["1st year", "2nd year", "3rd year", "4th year", "Masters / PG", "PhD"];
const SLOTS  = ["Morning (9 am – 12 pm)", "Afternoon (12 pm – 4 pm)", "Evening (4 pm – 8 pm)"];
const MODES  = ["Video call", "Chat (async)", "Written Q&A"];

// ─── sub-components ──────────────────────────────────────────────────────────

function SkillTag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 text-teal text-xs font-medium px-2.5 py-1">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-coral transition-colors">
          <X size={10} />
        </button>
      )}
    </span>
  );
}

function JobCard({ job }: { job: any }) {
  return (
    <Link href={`/jobs/${job.id}`} className="card p-4 flex gap-3 hover:border-teal/40 transition-colors group">
      <div className="w-10 h-10 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0 overflow-hidden">
        {job.company?.logoUrl
          ? <img src={job.company.logoUrl} alt="" className="h-full w-full object-cover" />
          : <Building2 size={18} className="text-muted" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink group-hover:text-teal transition-colors truncate">{job.title}</p>
        <p className="text-xs text-muted truncate">{job.company?.name} · {job.location}</p>
        <div className="flex gap-1 flex-wrap mt-1.5">
          {job.skills?.slice(0, 3).map((s: any) => (
            <span key={s.skill.id} className="text-[10px] bg-paper border border-border rounded-full px-2 py-0.5 text-muted">{s.skill.name}</span>
          ))}
        </div>
      </div>
      <ChevronRight size={14} className="text-muted shrink-0 mt-1 group-hover:text-teal transition-colors" />
    </Link>
  );
}

function CourseCard({ course }: { course: any }) {
  return (
    <Link href={`/courses/${course.id}`} className="card p-4 hover:border-teal/40 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-teal" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink group-hover:text-teal transition-colors line-clamp-2">{course.title}</p>
          <p className="text-xs text-muted mt-0.5">{course.creator?.name}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {course.avgRating && (
              <span className="flex items-center gap-0.5 text-xs text-amber-dark">
                <Star size={11} fill="currentColor" />
                {course.avgRating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted">
              <Users size={11} /> {course._count?.enrollments ?? 0}
            </span>
            <span className={cn(
              "text-[10px] font-medium rounded-full px-2 py-0.5",
              course.level === "BEGINNER"     && "bg-teal/10 text-teal",
              course.level === "INTERMEDIATE" && "bg-amber/10 text-amber-dark",
              course.level === "ADVANCED"     && "bg-coral/10 text-coral",
            )}>
              {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RoadmapStep({ index, step, skills, total }: { index: number; step: string; skills: string[]; total: number }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          index === 0 ? "bg-teal text-white" : "bg-paper border-2 border-border text-muted"
        )}>
          {index + 1}
        </div>
        {index < total - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink mb-1.5">{step}</p>
        <div className="flex flex-wrap gap-1">
          {skills.map((s) => (
            <span key={s} className="text-[10px] bg-paper border border-border rounded-full px-2 py-0.5 text-muted">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function GuidancePage() {
  const [track, setTrack]   = useState<Track>("student");
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState<RecResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── student inputs ──
  const [sDomain,  setSDomain]  = useState("auto");
  const [sYear,    setSYear]    = useState("");
  const [sInput,   setSInput]   = useState("");

  // ── professional inputs ──
  const [pRole,    setPRole]    = useState("");
  const [pYears,   setPYears]   = useState("");
  const [pGoal,    setPGoal]    = useState("");
  const [pSkillInput, setPSkillInput] = useState("");
  const [pSkills,  setPSkills]  = useState<string[]>([]);

  // ── consultation form (shared) ──
  const [cf, setCf] = useState({
    college: "", yearOfStudy: "", interestArea: "", question: "", timeSlot: "",
    currentRole: "", yearsExp: "", goal: "", challenge: "", mode: "", availableFrom: "",
  });

  // ── skill tag helpers ──
  function addSkill() {
    const s = pSkillInput.trim();
    if (s && !pSkills.includes(s)) setPSkills((prev) => [...prev, s]);
    setPSkillInput("");
  }

  // ── fetch recommendations ──
  async function fetchRec() {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/guidance/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input:      track === "student" ? sInput : pRole + " " + pGoal,
          domain:     track === "student" ? sDomain : "auto",
          userType:   track,
          userSkills: track === "professional" ? pSkills : [],
        }),
      });
      const data = await res.json();
      setResults(data);
      // pre-fill consultation form from inputs
      if (track === "student") {
        setCf((p) => ({ ...p, yearOfStudy: sYear, interestArea: sDomain !== "auto" ? sDomain : "" }));
      } else {
        setCf((p) => ({ ...p, currentRole: pRole, yearsExp: pYears, goal: pGoal }));
      }
    } finally {
      setLoading(false);
    }
  }

  // ── submit consultation ──
  async function submitConsultation(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/guidance/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: track.toUpperCase(), ...cf }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const canSearch = track === "student"
    ? (sDomain !== "auto" || sInput.trim().length > 2)
    : (pSkills.length > 0 || pRole.trim().length > 2);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* ── hero ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-teal/10 text-teal text-xs font-semibold px-3 py-1.5 rounded-full">
          <Sparkles size={13} /> AI-powered Career Guidance
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink">
          Your personalised<br className="hidden sm:block" /> career roadmap
        </h1>
        <p className="text-muted max-w-md mx-auto text-sm">
          Tell us where you are and where you want to go — we'll surface the right
          jobs, courses, and connections from the SkillWarehouse network.
        </p>
      </div>

      {/* ── track selector ── */}
      <div className="flex gap-3 justify-center flex-wrap">
        {(["student", "professional"] as Track[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTrack(t); setResults(null); setSubmitted(false); }}
            className={cn(
              "flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all",
              track === t
                ? "border-teal bg-teal/5 text-teal"
                : "border-border text-muted hover:border-teal/40"
            )}
          >
            {t === "student" ? <GraduationCap size={18} /> : <Briefcase size={18} />}
            {t === "student" ? "I'm a Student" : "I'm a Professional"}
          </button>
        ))}
      </div>

      {/* ═══════════════════════ STUDENT TRACK ═══════════════════════ */}
      {track === "student" && (
        <div className="card p-6 space-y-6">
          <h2 className="font-display text-xl text-ink">Tell us about yourself</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Field of interest</label>
              <select
                value={sDomain}
                onChange={(e) => setSDomain(e.target.value)}
                className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-teal"
              >
                <option value="auto">— Let us detect —</option>
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Year of study</label>
              <select
                value={sYear}
                onChange={(e) => setSYear(e.target.value)}
                className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-teal"
              >
                <option value="">Select year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Describe your goal <span className="normal-case font-normal">(optional)</span></label>
            <textarea
              value={sInput}
              onChange={(e) => setSInput(e.target.value)}
              rows={2}
              placeholder="e.g. I want to become a frontend developer and land an internship after graduation…"
              className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal resize-none"
            />
          </div>

          <button
            onClick={fetchRec}
            disabled={!canSearch || loading}
            className="btn-accent flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Finding recommendations…" : "Get Recommendations"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      )}

      {/* ═══════════════════════ PROFESSIONAL TRACK ═══════════════════════ */}
      {track === "professional" && (
        <div className="card p-6 space-y-6">
          <h2 className="font-display text-xl text-ink">Your current profile</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Current role</label>
              <input
                value={pRole}
                onChange={(e) => setPRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Years of experience</label>
              <input
                value={pYears}
                onChange={(e) => setPYears(e.target.value)}
                type="number" min="0" max="40"
                placeholder="e.g. 4"
                className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal"
              />
            </div>
          </div>

          {/* skill tag input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Your top skills</label>
            <div className="flex gap-2">
              <input
                value={pSkillInput}
                onChange={(e) => setPSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter…"
                className="flex-1 rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal"
              />
              <button onClick={addSkill} className="btn-outline btn-sm !px-3">
                <Plus size={14} />
              </button>
            </div>
            {pSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pSkills.map((s) => (
                  <SkillTag key={s} label={s} onRemove={() => setPSkills((p) => p.filter((x) => x !== s))} />
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted">
              Suggestions: {Object.keys(NEXT_SKILLS).slice(0, 8).join(", ")}
            </p>
          </div>

          {/* goal */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Your primary goal</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setPGoal(g.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium text-center transition-all",
                    pGoal === g.value
                      ? "border-teal bg-teal/5 text-teal"
                      : "border-border text-muted hover:border-teal/40"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchRec}
            disabled={!canSearch || loading}
            className="btn-accent flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Analysing your profile…" : "Find Opportunities"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      )}

      {/* ═══════════════════════ RESULTS ═══════════════════════ */}
      {results && (
        <div className="space-y-8 animate-in fade-in duration-300">

          {/* ── skill gap (professional only) ── */}
          {track === "professional" && Object.keys(results.nextSkills).length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-xl text-ink flex items-center gap-2">
                <Sparkles size={18} className="text-teal" /> Skills to add next
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(results.nextSkills).map(([skill, next]) => (
                  <div key={skill} className="card p-4">
                    <p className="text-xs font-semibold text-muted mb-2">You know <span className="text-teal">{skill}</span> — learn these next:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {next.map((n) => (
                        <span key={n} className="text-xs bg-teal/10 text-teal rounded-full px-2.5 py-0.5 font-medium">{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── matched skills banner ── */}
          {track === "student" && results.matchedSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-teal/5 border border-teal/20 rounded-xl">
              <span className="text-xs font-semibold text-teal">Key skills for {results.domain}:</span>
              {results.matchedSkills.map((s) => <SkillTag key={s} label={s} />)}
            </div>
          )}

          {/* ── jobs + courses grid ── */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="space-y-3">
              <h2 className="font-display text-lg text-ink flex items-center gap-2">
                <Briefcase size={16} className="text-teal" />
                {track === "student" ? "Entry-level roles" : "Roles you can grow into"}
              </h2>
              {results.jobs.length > 0 ? (
                <div className="space-y-2">
                  {results.jobs.map((j) => <JobCard key={j.id} job={j} />)}
                </div>
              ) : (
                <p className="text-sm text-muted card p-4 text-center">
                  No matching jobs right now — <Link href="/jobs" className="text-teal hover:underline">browse all jobs</Link>
                </p>
              )}
              <Link href="/jobs" className="text-xs text-teal hover:underline flex items-center gap-1">
                View all jobs <ArrowRight size={11} />
              </Link>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg text-ink flex items-center gap-2">
                <GraduationCap size={16} className="text-teal" />
                {track === "student" ? "Courses to get started" : "Upskilling courses"}
              </h2>
              {results.courses.length > 0 ? (
                <div className="space-y-2">
                  {results.courses.map((c) => <CourseCard key={c.id} course={c} />)}
                </div>
              ) : (
                <p className="text-sm text-muted card p-4 text-center">
                  No matching courses yet — <Link href="/courses" className="text-teal hover:underline">browse all courses</Link>
                </p>
              )}
              <Link href="/courses" className="text-xs text-teal hover:underline flex items-center gap-1">
                View all courses <ArrowRight size={11} />
              </Link>
            </section>
          </div>

          {/* ── career roadmap (student only) ── */}
          {track === "student" && results.roadmap.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-xl text-ink">
                Your {results.domain} learning roadmap
              </h2>
              <div className="card p-6">
                {results.roadmap.map((r, i) => (
                  <RoadmapStep
                    key={i} index={i} step={r.step} skills={r.skills}
                    total={results.roadmap.length}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ═══════════════════════ CONSULTATION FORM ═══════════════════════ */}
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl text-ink">
                {track === "student" ? "Book a mentor session" : "Connect with an expert"}
              </h2>
              <p className="text-sm text-muted mt-1">
                {track === "student"
                  ? "Get personalised guidance from a senior professional in your field of interest."
                  : "Speak with a domain expert to build a concrete 90-day action plan."}
              </p>
            </div>

            {submitted ? (
              <div className="card p-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 size={40} className="text-teal" />
                <p className="font-display text-lg text-ink">Request submitted!</p>
                <p className="text-sm text-muted max-w-xs">
                  {track === "student"
                    ? "We'll match you with a mentor within 48 hours. Check your messages."
                    : "We'll match you with an expert within 24 hours. Expect a message soon."}
                </p>
              </div>
            ) : (
              <form onSubmit={submitConsultation} className="card p-6 space-y-5">
                {track === "student" ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wide">College / University</label>
                        <input
                          value={cf.college}
                          onChange={(e) => setCf((p) => ({ ...p, college: e.target.value }))}
                          placeholder="e.g. IIT Bombay"
                          className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wide">Year of study</label>
                        <select
                          value={cf.yearOfStudy}
                          onChange={(e) => setCf((p) => ({ ...p, yearOfStudy: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-teal"
                          required
                        >
                          <option value="">Select year</option>
                          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">Area of interest</label>
                      <select
                        value={cf.interestArea}
                        onChange={(e) => setCf((p) => ({ ...p, interestArea: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-teal"
                        required
                      >
                        <option value="">Select domain</option>
                        {DOMAINS.map((d) => (
                          <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">Your question for the mentor</label>
                      <textarea
                        value={cf.question}
                        onChange={(e) => setCf((p) => ({ ...p, question: e.target.value }))}
                        rows={3}
                        maxLength={500}
                        placeholder="What specific guidance are you looking for?"
                        className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal resize-none"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">Preferred time slot</label>
                      <div className="grid sm:grid-cols-3 gap-2">
                        {SLOTS.map((s) => (
                          <button
                            key={s} type="button"
                            onClick={() => setCf((p) => ({ ...p, timeSlot: s }))}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                              cf.timeSlot === s
                                ? "border-teal bg-teal/5 text-teal"
                                : "border-border text-muted hover:border-teal/40"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wide">Current role</label>
                        <input
                          value={cf.currentRole}
                          onChange={(e) => setCf((p) => ({ ...p, currentRole: e.target.value }))}
                          placeholder="e.g. Senior Backend Engineer"
                          className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wide">Years of experience</label>
                        <input
                          value={cf.yearsExp}
                          onChange={(e) => setCf((p) => ({ ...p, yearsExp: e.target.value }))}
                          type="number" min="0" max="40"
                          placeholder="e.g. 6"
                          className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">Your primary goal</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {GOALS.map((g) => (
                          <button
                            key={g.value} type="button"
                            onClick={() => setCf((p) => ({ ...p, goal: g.value }))}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                              cf.goal === g.value
                                ? "border-teal bg-teal/5 text-teal"
                                : "border-border text-muted hover:border-teal/40"
                            )}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">Specific challenge</label>
                      <textarea
                        value={cf.challenge}
                        onChange={(e) => setCf((p) => ({ ...p, challenge: e.target.value }))}
                        rows={3}
                        maxLength={500}
                        placeholder="What's blocking you right now? What specific advice do you need?"
                        className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-teal resize-none"
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wide">Consultation mode</label>
                        <div className="space-y-1.5">
                          {MODES.map((m) => (
                            <button
                              key={m} type="button"
                              onClick={() => setCf((p) => ({ ...p, mode: m }))}
                              className={cn(
                                "w-full rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all",
                                cf.mode === m
                                  ? "border-teal bg-teal/5 text-teal"
                                  : "border-border text-muted hover:border-teal/40"
                              )}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wide">Available from</label>
                        <input
                          value={cf.availableFrom}
                          onChange={(e) => setCf((p) => ({ ...p, availableFrom: e.target.value }))}
                          type="date"
                          className="w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-teal"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {submitting ? "Submitting…" : track === "student" ? "Book mentor session" : "Request expert consultation"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
