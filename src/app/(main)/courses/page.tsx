"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, GraduationCap, PlusCircle, BookMarked, Sparkles } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import { COURSE_LEVELS, COURSE_LEVEL_LABELS } from "@/lib/constants";

export default function CoursesPage() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [courses, setCourses] = useState<any[] | null>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [gapSkills, setGapSkills] = useState<any[]>([]);

  const search = useCallback(async () => {
    setCourses(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (level) params.set("level", level);
    const res = await fetch(`/api/courses?${params.toString()}`);
    const data = await res.json();
    setCourses(data.courses ?? []);
  }, [q, level]);

  useEffect(() => {
    search();
  }, [search]);

  useEffect(() => {
    fetch("/api/courses/recommended")
      .then((r) => r.json())
      .then((d) => {
        setRecommended(d.courses ?? []);
        setGapSkills(d.gapSkills ?? []);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Grow your skills</h1>
        <div className="flex gap-2">
          <Link href="/courses/mine" className="btn-outline btn-sm">
            <BookMarked size={14} /> My learning
          </Link>
          <Link href="/courses/create" className="btn-accent btn-sm">
            <PlusCircle size={14} /> Create a course
          </Link>
        </div>
      </div>

      {recommended.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink mb-1 flex items-center gap-2">
            <Sparkles size={16} className="text-coral" /> Recommended for you
          </h2>
          {gapSkills.length > 0 && (
            <p className="text-xs text-muted mb-3">
              Based on skills jobs you're interested in want: {gapSkills.map((s: any) => s.name).join(", ")}
            </p>
          )}
          <div className="grid sm:grid-cols-3 gap-4 mb-2">
            {recommended.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      )}

      <div className="card p-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-8"
            placeholder="Search courses or skills"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
        </div>
        <select className="input sm:w-48" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Any level</option>
          {COURSE_LEVELS.map((l) => (
            <option key={l} value={l}>{COURSE_LEVEL_LABELS[l]}</option>
          ))}
        </select>
        <button onClick={search} className="btn-accent btn-sm shrink-0">Search</button>
      </div>

      {courses === null && (
        <div className="flex justify-center py-14">
          <Loader2 className="animate-spin text-muted" />
        </div>
      )}
      {courses?.length === 0 && (
        <EmptyState icon={GraduationCap} title="No courses found" description="Try a different search, or be the first to create one." />
      )}
      <div className="grid sm:grid-cols-3 gap-4">
        {courses?.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}
