"use client";

import { useState, useEffect } from "react";
import {
  Award, Clock, CheckCircle2, TrendingUp, Star,
  Trophy, BarChart2, ChevronRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

type Assessment = {
  id: string;
  skill: string;
  category: string;
  questions: number;
  duration: number;
  difficulty: Difficulty;
  featured: boolean;
  completed?: boolean;
  score?: number;
  percentile?: number;
};

const ASSESSMENTS: Assessment[] = [
  { id: "az",  skill: "Azure Fundamentals",           category: "Cloud",        questions: 40, duration: 45, difficulty: "Intermediate", featured: true,  completed: true,  score: 88, percentile: 78 },
  { id: "aws", skill: "AWS Cloud Practitioner",        category: "Cloud",        questions: 35, duration: 40, difficulty: "Beginner",      featured: true                   },
  { id: "py",  skill: "Python for Data Engineering",   category: "Programming",  questions: 30, duration: 35, difficulty: "Intermediate", featured: true                   },
  { id: "sql", skill: "SQL Proficiency",               category: "Database",     questions: 25, duration: 30, difficulty: "Beginner",      featured: true,  completed: true,  score: 92, percentile: 91 },
  { id: "db",  skill: "Databricks Associate",          category: "Big Data",     questions: 45, duration: 60, difficulty: "Advanced",      featured: true                   },
  { id: "tf",  skill: "Terraform Basics",              category: "DevOps",       questions: 30, duration: 35, difficulty: "Beginner",      featured: false                  },
  { id: "dk",  skill: "Docker & Containers",           category: "DevOps",       questions: 28, duration: 30, difficulty: "Intermediate", featured: false                  },
  { id: "k8s", skill: "Kubernetes Essentials",         category: "DevOps",       questions: 35, duration: 40, difficulty: "Advanced",      featured: false                  },
  { id: "sp",  skill: "Apache Spark",                  category: "Big Data",     questions: 30, duration: 35, difficulty: "Intermediate", featured: false                  },
  { id: "dl",  skill: "Deep Learning Fundamentals",    category: "ML/AI",        questions: 40, duration: 50, difficulty: "Advanced",      featured: false                  },
];

const CATEGORIES = ["All", "Cloud", "Programming", "Database", "Big Data", "DevOps", "ML/AI"];

const difficultyColor: Record<Difficulty, string> = {
  Beginner:     "chip-teal",
  Intermediate: "chip-amber",
  Advanced:     "chip-coral",
};

type Question = { text: string; opts: [string, string, string, string]; correct: number };

type ModalProps = {
  assessment: Assessment;
  onClose: () => void;
  onComplete: (id: string, score: number) => void;
};

function TestModal({ assessment, onClose, onComplete }: ModalProps) {
  const customQs: Question[] = (assessment as any).questionItems ?? [];
  const hasCustomQs = customQs.length > 0;

  const [step, setStep] = useState<"intro" | "question" | "q1" | "q2" | "result">("intro");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState({ score: 0, percentile: 0 });

  const [mockResult] = useState(() => ({
    score: Math.floor(70 + Math.random() * 28),
    percentile: Math.floor(60 + Math.random() * 35),
  }));

  function startAssessment() {
    if (hasCustomQs) {
      setQIdx(0);
      setAnswers([]);
      setSelected(null);
      setStep("question");
    } else {
      setStep("q1");
    }
  }

  function nextQuestion() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (qIdx < customQs.length - 1) {
      setAnswers(newAnswers);
      setQIdx(qIdx + 1);
      setSelected(null);
    } else {
      const correct = customQs.filter((q, i) => newAnswers[i] === q.correct).length;
      const score = Math.round((correct / customQs.length) * 100);
      const percentile = Math.floor(50 + Math.random() * 40);
      setFinalScore({ score, percentile });
      setStep("result");
    }
  }

  const result = hasCustomQs ? finalScore : mockResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-ink">{assessment.skill}</p>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink"><X size={18} /></button>
        </div>

        {step === "intro" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Questions", value: hasCustomQs ? customQs.length : assessment.questions },
                { label: "Duration",  value: `${assessment.duration}m` },
                { label: "Level",     value: assessment.difficulty },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-paper rounded-xl">
                  <p className="font-semibold text-sm text-ink">{value}</p>
                  <p className="text-[11px] text-muted">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted">
              This is a timed assessment. Once started, the timer cannot be paused. A passing score earns you a verified badge on your profile.
            </p>
            <button onClick={startAssessment} className="btn-accent w-full">Start assessment</button>
          </div>
        )}

        {/* Custom questions */}
        {step === "question" && hasCustomQs && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-muted">
              <span>Question {qIdx + 1} of {customQs.length}</span>
              <span className="flex items-center gap-1 text-coral"><Clock size={12} /> {assessment.duration}:00</span>
            </div>
            <div className="w-full bg-paper rounded-full h-1.5">
              <div className="bg-teal h-1.5 rounded-full transition-all" style={{ width: `${((qIdx) / customQs.length) * 100}%` }} />
            </div>
            <p className="text-sm text-ink font-medium">{customQs[qIdx].text}</p>
            <div className="space-y-2">
              {customQs[qIdx].opts.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                    selected === i ? "border-teal bg-teal-light text-teal-dark" : "border-border hover:border-teal/50"
                  )}
                >
                  <span className="font-semibold text-muted mr-2">{["A", "B", "C", "D"][i]}.</span>{opt}
                </button>
              ))}
            </div>
            <button
              disabled={selected === null}
              onClick={nextQuestion}
              className="btn-accent w-full disabled:opacity-50"
            >
              {qIdx < customQs.length - 1 ? "Next" : "Finish"}
            </button>
          </div>
        )}

        {/* Built-in fallback questions */}
        {(step === "q1" || step === "q2") && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-muted">
              <span>Question {step === "q1" ? 1 : 2} of {assessment.questions}</span>
              <span className="flex items-center gap-1 text-coral"><Clock size={12} /> {assessment.duration}:00</span>
            </div>
            <p className="text-sm text-ink font-medium">
              {step === "q1"
                ? `Which service in ${assessment.skill.includes("Azure") ? "Azure" : "AWS"} is primarily used for managed Spark workloads?`
                : "What does 'idempotent' mean in the context of data pipelines?"}
            </p>
            <div className="space-y-2">
              {(step === "q1"
                ? ["Azure Synapse Analytics", "Azure Databricks", "Azure Data Factory", "Azure Stream Analytics"]
                : ["The pipeline can only run once", "Running it multiple times produces the same result", "It processes data in real time", "It requires manual intervention"]
              ).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                    selected === i ? "border-teal bg-teal-light text-teal-dark" : "border-border hover:border-teal/50"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button
              disabled={selected === null}
              onClick={() => { setSelected(null); step === "q1" ? setStep("q2") : setStep("result"); }}
              className="btn-accent w-full"
            >
              {step === "q1" ? "Next" : "Finish"}
            </button>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-4 text-center">
            <div className="h-20 w-20 rounded-full bg-teal-light flex items-center justify-center mx-auto">
              <Trophy size={36} className="text-teal" />
            </div>
            <div>
              <p className="font-display text-3xl text-ink">{result.score}%</p>
              <p className="text-sm text-muted">You scored better than <span className="font-semibold text-teal">{result.percentile}%</span> of test takers</p>
            </div>
            {result.score >= 70 && (
              <div className="flex items-center justify-center gap-2 text-teal text-sm">
                <CheckCircle2 size={16} />
                <span>Verified badge earned!</span>
              </div>
            )}
            <button
              onClick={() => { onComplete(assessment.id, result.score); onClose(); }}
              className="btn-accent w-full"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  const [category, setCategory] = useState("All");
  const [activeTest, setActiveTest] = useState<Assessment | null>(null);
  const [results, setResults] = useState<Record<string, { score: number; percentile: number }>>({});
  const [customAssessments, setCustomAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas_custom_assessments");
      if (stored) setCustomAssessments(JSON.parse(stored));
    } catch {}
  }, []);

  const allAssessments = [...ASSESSMENTS, ...customAssessments].map((a) => ({
    ...a,
    completed: a.completed || !!results[a.id],
    score: results[a.id]?.score ?? a.score,
    percentile: results[a.id]?.percentile ?? a.percentile,
  }));

  const featured = allAssessments.filter((a) => a.featured);
  const filtered = allAssessments.filter((a) => category === "All" || a.category === category);

  function handleComplete(id: string, score: number) {
    const percentile = Math.floor(60 + Math.random() * 35);
    setResults((r) => ({ ...r, [id]: { score, percentile } }));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {activeTest && (
        <TestModal
          assessment={activeTest}
          onClose={() => setActiveTest(null)}
          onComplete={handleComplete}
        />
      )}

      {/* Header */}
      <div className="card p-5 gradient-brand text-white">
        <div className="flex items-center gap-2 mb-1">
          <Award size={20} />
          <p className="font-display text-xl">Skill Assessments</p>
        </div>
        <p className="text-sm text-white/80">
          Earn verified badges to stand out to recruiters. Badges appear on your profile under each skill.
        </p>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1.5 text-white/90">
            <CheckCircle2 size={14} className="text-teal" />
            {allAssessments.filter((a) => a.completed).length} completed
          </span>
          <span className="flex items-center gap-1.5 text-white/90">
            <TrendingUp size={14} />
            {allAssessments.length} available ({customAssessments.length} custom)
          </span>
        </div>
      </div>

      {/* Featured */}
      <div>
        <p className="font-display text-lg text-ink mb-3">Featured Assessments</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((a) => (
            <div key={a.id} className="card p-4 card-hover space-y-3">
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-lg bg-brand-light flex items-center justify-center">
                  <Award size={18} className="text-brand-mid" />
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {(a as any).custom && (
                    <span className="chip !py-0.5 !px-2 !text-[10px] border border-teal/40 text-teal bg-teal-light">Custom</span>
                  )}
                  {a.completed && (
                    <span className="chip-teal !py-0.5 !px-2 !text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verified
                    </span>
                  )}
                  <span className={cn("!py-0.5 !px-2 !text-[10px]", difficultyColor[a.difficulty], "chip")}>
                    {a.difficulty}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm text-ink">{a.skill}</p>
                <p className="text-[11px] text-muted mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1"><span>{a.questions} Q</span></span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {a.duration} min</span>
                </p>
              </div>
              {a.completed && a.score != null && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-teal font-semibold">{a.score}% score</span>
                  <span className="text-muted">Top {100 - (a.percentile ?? 0)}%</span>
                </div>
              )}
              <button
                onClick={() => setActiveTest(a)}
                className={cn("w-full btn-sm", a.completed ? "btn-outline" : "btn-accent")}
              >
                {a.completed ? "Retake test" : "Take test"}
                <ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All assessments */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="font-display text-lg text-ink">All Assessments</p>
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn("btn-sm whitespace-nowrap", category === c ? "btn-primary" : "btn-outline")}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3 hover:bg-paper transition-colors">
                <div className="h-8 w-8 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                  <Award size={15} className="text-brand-mid" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-ink">{a.skill}</p>
                    {(a as any).custom && (
                      <span className="chip !py-0 !px-1.5 !text-[10px] border border-teal/40 text-teal bg-teal-light">Custom</span>
                    )}
                    {a.completed && (
                      <span className="chip-teal !py-0 !px-1.5 !text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={9} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {a.questions} questions · {a.duration} min ·{" "}
                    <span className={a.difficulty === "Beginner" ? "text-teal" : a.difficulty === "Intermediate" ? "text-amber" : "text-coral"}>
                      {a.difficulty}
                    </span>
                  </p>
                </div>
                {a.completed && a.score != null && (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-teal">{a.score}%</p>
                    <p className="text-[11px] text-muted flex items-center gap-1 justify-end">
                      <BarChart2 size={10} /> Top {100 - (a.percentile ?? 0)}%
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setActiveTest(a)}
                  className="btn-outline btn-sm shrink-0"
                >
                  {a.completed ? "Retake" : "Start"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-amber" />
          <p className="font-display text-lg text-ink">Leaderboard · This Month</p>
        </div>
        <div className="space-y-2">
          {[
            { rank: 1, name: "Priya Menon",   skills: ["AWS", "Python"],   badges: 6, avg: 94 },
            { rank: 2, name: "Arjun Kapoor",  skills: ["SQL", "Spark"],    badges: 5, avg: 91 },
            { rank: 3, name: "Sneha Sharma",  skills: ["Azure", "Terraform"], badges: 4, avg: 89 },
            { rank: 4, name: "You",           skills: ["Azure", "SQL"],    badges: 2, avg: 90 },
          ].map((row) => (
            <div
              key={row.rank}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                row.name === "You" ? "bg-brand-light" : "hover:bg-paper"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                row.rank === 1 ? "bg-amber text-white" :
                row.rank === 2 ? "bg-muted text-white" :
                row.rank === 3 ? "bg-coral-light text-coral" :
                "bg-paper text-muted border border-border"
              )}>
                {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : row.rank}
              </span>
              <span className={cn("flex-1 font-medium", row.name === "You" ? "text-ink" : "text-ink")}>{row.name}</span>
              <div className="flex gap-1">
                {row.skills.map((s) => <span key={s} className="chip !py-0 !px-1.5 !text-[10px]">{s}</span>)}
              </div>
              <span className="chip-teal !py-0.5 !px-2 !text-[10px] shrink-0">{row.badges} badges</span>
              <span className="text-xs font-mono text-ink shrink-0">{row.avg}% avg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
