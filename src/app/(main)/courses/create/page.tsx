"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import SkillTagInput from "@/components/SkillTagInput";
import { useToast } from "@/components/Toast";
import { COURSE_LEVELS, COURSE_LEVEL_LABELS, LESSON_TYPES } from "@/lib/constants";

interface LessonDraft {
  title: string;
  type: string;
  content: string;
  durationMinutes: number;
  quizQuestions?: { question: string; options: string[]; correctIndex: number }[];
}
interface ModuleDraft {
  title: string;
  lessons: LessonDraft[];
}

const emptyLesson = (): LessonDraft => ({ title: "", type: "TEXT", content: "", durationMinutes: 10 });
const emptyModule = (): ModuleDraft => ({ title: "", lessons: [emptyLesson()] });

export default function CreateCoursePage() {
  const router = useRouter();
  const { show } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [providerName, setProviderName] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [skills, setSkills] = useState<string[]>([]);
  const [modules, setModules] = useState<ModuleDraft[]>([emptyModule()]);
  const [submitting, setSubmitting] = useState(false);

  function updateModule(i: number, patch: Partial<ModuleDraft>) {
    setModules((m) => m.map((mod, idx) => (idx === i ? { ...mod, ...patch } : mod)));
  }
  function updateLesson(mi: number, li: number, patch: Partial<LessonDraft>) {
    setModules((m) =>
      m.map((mod, idx) =>
        idx === mi ? { ...mod, lessons: mod.lessons.map((l, lidx) => (lidx === li ? { ...l, ...patch } : l)) } : mod
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return show("Title and description are required", "error");
    setSubmitting(true);

    const payload = {
      title,
      description,
      providerName: providerName || undefined,
      level,
      skills,
      modules: modules.map((m, mi) => ({
        title: m.title || `Module ${mi + 1}`,
        order: mi,
        lessons: m.lessons.map((l, li) => ({
          title: l.title || `Lesson ${li + 1}`,
          type: l.type,
          order: li,
          durationMinutes: l.durationMinutes,
          content:
            l.type === "QUIZ"
              ? JSON.stringify({ questions: l.quizQuestions ?? [] })
              : l.content,
        })),
      })),
    };

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      show("Course published", "success");
      router.push(`/courses/${data.id}`);
    } else {
      show(data.error ?? "Couldn't create course", "error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="font-display text-2xl text-ink">Create a course</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <div>
            <label className="label">Course title</label>
            <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SQL for Data Analysis" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required className="textarea min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Provider / instructor name</label>
              <input className="input" value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
                {COURSE_LEVELS.map((l) => (
                  <option key={l} value={l}>{COURSE_LEVEL_LABELS[l]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Skills this course teaches</label>
            <p className="text-xs text-muted mb-2">
              These get added automatically to a learner's profile when they finish the course.
            </p>
            <SkillTagInput skills={skills} onAdd={(s) => setSkills((arr) => [...arr, s])} onRemove={(s) => setSkills((arr) => arr.filter((x) => x !== s))} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Modules &amp; lessons</h2>
            <button type="button" onClick={() => setModules((m) => [...m, emptyModule()])} className="btn-outline btn-sm">
              <Plus size={14} /> Add module
            </button>
          </div>

          {modules.map((mod, mi) => (
            <div key={mi} className="card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-muted shrink-0" />
                <input
                  className="input flex-1"
                  placeholder={`Module ${mi + 1} title`}
                  value={mod.title}
                  onChange={(e) => updateModule(mi, { title: e.target.value })}
                />
                {modules.length > 1 && (
                  <button type="button" onClick={() => setModules((m) => m.filter((_, i) => i !== mi))} className="text-muted hover:text-coral p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="pl-5 space-y-3 border-l-2 border-border">
                {mod.lessons.map((lesson, li) => (
                  <div key={li} className="rounded-lg bg-paper p-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        className="input flex-1"
                        placeholder={`Lesson ${li + 1} title`}
                        value={lesson.title}
                        onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                      />
                      <select
                        className="input w-32"
                        value={lesson.type}
                        onChange={(e) => updateLesson(mi, li, { type: e.target.value, content: "" })}
                      >
                        {LESSON_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="input w-20"
                        title="Minutes"
                        value={lesson.durationMinutes}
                        onChange={(e) => updateLesson(mi, li, { durationMinutes: Number(e.target.value) })}
                      />
                      {mod.lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => updateModule(mi, { lessons: mod.lessons.filter((_, i) => i !== li) })}
                          className="text-muted hover:text-coral p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {lesson.type === "TEXT" && (
                      <textarea
                        className="textarea"
                        placeholder="Lesson content"
                        value={lesson.content}
                        onChange={(e) => updateLesson(mi, li, { content: e.target.value })}
                      />
                    )}
                    {lesson.type === "VIDEO" && (
                      <input
                        className="input"
                        placeholder="Video URL (YouTube, Vimeo, etc.)"
                        value={lesson.content}
                        onChange={(e) => updateLesson(mi, li, { content: e.target.value })}
                      />
                    )}
                    {lesson.type === "DOCUMENT" && (
                      <input
                        className="input"
                        placeholder="Document URL"
                        value={lesson.content}
                        onChange={(e) => updateLesson(mi, li, { content: e.target.value })}
                      />
                    )}
                    {lesson.type === "QUIZ" && (
                      <QuizEditor
                        questions={lesson.quizQuestions ?? []}
                        onChange={(qs) => updateLesson(mi, li, { quizQuestions: qs })}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateModule(mi, { lessons: [...mod.lessons, emptyLesson()] })}
                  className="btn-ghost btn-sm"
                >
                  <Plus size={13} /> Add lesson
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={submitting} className="btn-accent w-full">
          {submitting && <Loader2 size={14} className="animate-spin" />} Publish course
        </button>
      </form>
    </div>
  );
}

function QuizEditor({
  questions,
  onChange,
}: {
  questions: { question: string; options: string[]; correctIndex: number }[];
  onChange: (qs: { question: string; options: string[]; correctIndex: number }[]) => void;
}) {
  function addQuestion() {
    onChange([...questions, { question: "", options: ["", ""], correctIndex: 0 }]);
  }
  function update(i: number, patch: Partial<{ question: string; options: string[]; correctIndex: number }>) {
    onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  return (
    <div className="space-y-3">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-border p-3 space-y-2">
          <input
            className="input"
            placeholder="Question"
            value={q.question}
            onChange={(e) => update(qi, { question: e.target.value })}
          />
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input
                type="radio"
                checked={q.correctIndex === oi}
                onChange={() => update(qi, { correctIndex: oi })}
                title="Correct answer"
              />
              <input
                className="input flex-1"
                placeholder={`Option ${oi + 1}`}
                value={opt}
                onChange={(e) =>
                  update(qi, { options: q.options.map((o, i) => (i === oi ? e.target.value : o)) })
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => update(qi, { options: [...q.options, ""] })}
            className="text-xs text-coral font-medium"
          >
            + Add option
          </button>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="btn-ghost btn-sm">
        <Plus size={13} /> Add question
      </button>
    </div>
  );
}
