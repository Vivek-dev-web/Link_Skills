"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const ICONS: Record<string, any> = { TEXT: FileText, VIDEO: PlayCircle, DOCUMENT: FileText, QUIZ: HelpCircle };

export default function LearnPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { show } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [justCompletedCourse, setJustCompletedCourse] = useState(false);

  async function load() {
    const res = await fetch(`/api/courses/${id}`);
    const data = await res.json();
    if (!res.ok || !data.enrollment) {
      show("Enroll in this course first", "error");
      router.push(`/courses/${id}`);
      return;
    }
    setCourse(data);
    setCompletedIds(new Set(data.completedLessonIds));
    const firstIncomplete = data.modules
      .flatMap((m: any) => m.lessons)
      .find((l: any) => !data.completedLessonIds.includes(l.id));
    setActiveLessonId(firstIncomplete?.id ?? data.modules[0]?.lessons[0]?.id ?? null);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const allLessons = useMemo(
    () => (course ? course.modules.flatMap((m: any) => m.lessons) : []),
    [course]
  );
  const activeLesson = allLessons.find((l: any) => l.id === activeLessonId);
  const activeIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);

  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(activeLesson ? completedIds.has(activeLesson.id) && activeLesson.type === "QUIZ" : false);
  }, [activeLessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!course || !activeLesson) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  const percent = Math.round((completedIds.size / allLessons.length) * 100);

  async function markComplete(lessonId: string) {
    const res = await fetch(`/api/courses/${id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: true }),
    });
    const data = await res.json();
    if (res.ok) {
      setCompletedIds((s) => new Set(s).add(lessonId));
      if (data.justCompleted) {
        setJustCompletedCourse(true);
        show("Course complete! Your certificate is ready.", "success");
      }
    }
  }

  function goToNext() {
    const next = allLessons[activeIndex + 1];
    if (next) setActiveLessonId(next.id);
  }

  let quiz: { questions: QuizQuestion[] } | null = null;
  if (activeLesson.type === "QUIZ") {
    try {
      quiz = JSON.parse(activeLesson.content);
    } catch {
      quiz = { questions: [] };
    }
  }

  function submitQuiz() {
    if (!quiz) return;
    const correct = quiz.questions.filter((q, i) => quizAnswers[i] === q.correctIndex).length;
    const passed = quiz.questions.length === 0 || correct / quiz.questions.length >= 0.7;
    setQuizSubmitted(true);
    if (passed) {
      markComplete(activeLesson.id);
      show(`Passed (${correct}/${quiz.questions.length}) — lesson complete`, "success");
    } else {
      show(`${correct}/${quiz.questions.length} correct — try again`, "error");
    }
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <aside className="card p-4 h-fit lg:sticky lg:top-20">
        <Link href={`/courses/${id}`} className="text-xs text-coral font-medium">
          ← Back to overview
        </Link>
        <h2 className="font-display text-base text-ink mt-2 mb-1">{course.title}</h2>
        <div className="h-1.5 rounded-full bg-paper overflow-hidden mb-4">
          <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>

        {justCompletedCourse && (
          <a
            href={`/api/courses/${id}/certificate`}
            target="_blank"
            rel="noreferrer"
            className="btn-accent btn-sm w-full mb-3"
          >
            <Award size={14} /> Get certificate
          </a>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {course.modules.map((m: any, mi: number) => (
            <div key={m.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                {mi + 1}. {m.title}
              </p>
              <div className="space-y-0.5">
                {m.lessons.map((l: any) => {
                  const Icon = ICONS[l.type] ?? FileText;
                  const done = completedIds.has(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => setActiveLessonId(l.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm",
                        l.id === activeLessonId ? "bg-paper text-ink font-medium" : "text-muted hover:bg-paper"
                      )}
                    >
                      {done ? <CheckCircle2 size={14} className="text-teal shrink-0" /> : <Circle size={14} className="shrink-0" />}
                      <Icon size={13} className="shrink-0" />
                      <span className="truncate flex-1">{l.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="card p-6">
        <p className="text-xs text-muted mb-1">{ICONS[activeLesson.type] ? activeLesson.type : ""} · {activeLesson.durationMinutes} min</p>
        <h1 className="font-display text-2xl text-ink mb-4">{activeLesson.title}</h1>

        {activeLesson.type === "TEXT" && (
          <div className="prose-lesson">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="font-display text-xl text-ink font-bold mt-6 mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="font-display text-lg text-ink font-semibold mt-5 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="font-display text-base text-ink font-semibold mt-4 mb-1.5">{children}</h3>,
                p: ({ children }) => <p className="text-sm text-ink leading-relaxed mb-3">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                em: ({ children }) => <em className="italic text-muted">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-ink">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-ink">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ inline, children }: any) =>
                  inline ? (
                    <code className="bg-paper border border-border rounded px-1.5 py-0.5 text-xs font-mono text-teal">{children}</code>
                  ) : (
                    <code className="block bg-[#0f1117] text-green-300 text-xs font-mono rounded-lg p-4 overflow-x-auto mb-3 leading-relaxed whitespace-pre">{children}</code>
                  ),
                pre: ({ children }) => <>{children}</>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-teal/40 pl-4 italic text-muted text-sm mb-3">{children}</blockquote>
                ),
                hr: () => <hr className="border-border my-4" />,
              }}
            >
              {activeLesson.content}
            </ReactMarkdown>
          </div>
        )}

        {activeLesson.type === "VIDEO" && (
          <div>
            <div className="aspect-video rounded-lg bg-ink/90 flex items-center justify-center mb-3">
              <PlayCircle size={48} className="text-paper/70" />
            </div>
            <p className="text-xs text-muted break-all">{activeLesson.content}</p>
          </div>
        )}

        {activeLesson.type === "DOCUMENT" && (
          <a href={activeLesson.content} target="_blank" rel="noreferrer" className="btn-outline">
            <FileText size={15} /> Open document
          </a>
        )}

        {activeLesson.type === "QUIZ" && quiz && (
          <div className="space-y-5">
            {quiz.questions.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-medium text-ink mb-2">{qi + 1}. {q.question}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer",
                        quizAnswers[qi] === oi ? "border-ink bg-paper" : "border-border"
                      )}
                    >
                      <input
                        type="radio"
                        name={`q${qi}`}
                        checked={quizAnswers[qi] === oi}
                        onChange={() => setQuizAnswers((a) => ({ ...a, [qi]: oi }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitQuiz} className="btn-accent">Submit answers</button>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <button
            onClick={() => activeIndex > 0 && setActiveLessonId(allLessons[activeIndex - 1].id)}
            disabled={activeIndex <= 0}
            className="btn-ghost btn-sm"
          >
            <ChevronLeft size={14} /> Previous
          </button>

          {activeLesson.type !== "QUIZ" && !completedIds.has(activeLesson.id) && (
            <button onClick={() => markComplete(activeLesson.id)} className="btn-accent btn-sm">
              Mark complete
            </button>
          )}

          <button
            onClick={goToNext}
            disabled={activeIndex >= allLessons.length - 1}
            className="btn-ghost btn-sm"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
