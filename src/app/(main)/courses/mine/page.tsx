"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Award, PlayCircle, Users2, Pencil } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { GraduationCap } from "lucide-react";

export default function MyCoursesPage() {
  const [data, setData] = useState<{ enrolled: any[]; created: any[] } | null>(null);

  useEffect(() => {
    fetch("/api/courses/mine")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink mb-4">My learning</h1>
        {data.enrolled.length === 0 ? (
          <EmptyState icon={GraduationCap} title="You haven't enrolled in anything yet" description="Browse the catalog to start building new skills." action={<Link href="/courses" className="btn-accent btn-sm">Browse courses</Link>} />
        ) : (
          <div className="space-y-3">
            {data.enrolled.map((e) => (
              <div key={e.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/courses/${e.course.id}`} className="text-sm font-medium text-ink hover:text-coral truncate block">
                    {e.course.title}
                  </Link>
                  <p className="text-xs text-muted">{e.course.creator?.name} · {e.course._count?.modules ?? 0} modules</p>
                  <div className="h-1.5 w-48 rounded-full bg-paper overflow-hidden mt-2">
                    <div className="h-full bg-teal rounded-full" style={{ width: `${e.progressPercent}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {e.completedAt ? (
                    <a href={`/api/courses/${e.course.id}/certificate`} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                      <Award size={13} /> Certificate
                    </a>
                  ) : (
                    <Link href={`/courses/${e.course.id}/learn`} className="btn-accent btn-sm">
                      <PlayCircle size={13} /> {e.progressPercent}%
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink">Courses I've created</h2>
          <Link href="/courses/create" className="btn-outline btn-sm">New course</Link>
        </div>
        {data.created.length === 0 ? (
          <p className="text-sm text-muted">You haven't published a course yet.</p>
        ) : (
          <div className="space-y-3">
            {data.created.map((c) => (
              <div key={c.id} className="card p-4 flex items-center justify-between">
                <div>
                  <Link href={`/courses/${c.id}`} className="text-sm font-medium text-ink hover:text-coral">{c.title}</Link>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <Users2 size={11} /> {c._count?.enrollments ?? 0} enrolled · {c._count?.modules ?? 0} modules
                  </p>
                </div>
                <Link href={`/courses/${c.id}`} className="btn-ghost btn-sm"><Pencil size={13} /> View</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
