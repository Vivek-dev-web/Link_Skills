"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, GraduationCap, Star, Users2, PlayCircle, Award, CheckCircle2 } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { COURSE_LEVEL_LABELS } from "@/lib/constants";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { show } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  async function load() {
    const res = await fetch(`/api/courses/${id}`);
    const data = await res.json();
    setCourse(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!course) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  const totalLessons = course.modules.reduce((s: number, m: any) => s + m.lessons.length, 0);
  const totalMinutes = course.modules.reduce(
    (s: number, m: any) => s + m.lessons.reduce((s2: number, l: any) => s2 + l.durationMinutes, 0),
    0
  );

  async function enroll() {
    setEnrolling(true);
    const res = await fetch(`/api/courses/${id}/enroll`, { method: "POST" });
    setEnrolling(false);
    if (res.ok) {
      show("Enrolled — let's get started", "success");
      router.push(`/courses/${id}/learn`);
    }
  }

  async function submitReview() {
    if (!myRating) return show("Pick a star rating first", "error");
    setSubmittingReview(true);
    const res = await fetch(`/api/courses/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: myRating, comment: myComment || undefined }),
    });
    setSubmittingReview(false);
    if (res.ok) {
      show("Thanks for the review", "success");
      load();
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="card overflow-hidden">
        <div className="h-36 bg-gradient-to-br from-amber-light via-coral-light to-teal-light flex items-center justify-center">
          {course.imageUrl ? (
            <img src={course.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <GraduationCap size={36} className="text-ink/30" />
          )}
        </div>
        <div className="p-6">
          <span className="chip-amber !py-0.5 mb-2 inline-block">{COURSE_LEVEL_LABELS[course.level]}</span>
          <h1 className="font-display text-2xl text-ink">{course.title}</h1>
          <p className="text-sm text-muted mt-1">{course.providerName || course.creator?.name}</p>
          <div className="flex items-center gap-3 text-xs text-muted mt-2">
            <span className="flex items-center gap-1"><Users2 size={12} /> {course._count?.enrollments ?? 0} enrolled</span>
            {course.avgRating && (
              <span className="flex items-center gap-1 text-amber-dark"><Star size={12} className="fill-amber-dark" /> {course.avgRating.toFixed(1)} ({course.reviews.length})</span>
            )}
            <span>{totalLessons} lessons · ~{totalMinutes} min</span>
          </div>

          <p className="text-sm text-ink mt-4 whitespace-pre-wrap">{course.description}</p>

          {course.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {course.skills.map((s: any) => (
                <span key={s.skillId} className="chip">{s.skill.name}</span>
              ))}
            </div>
          )}

          <div className="mt-5">
            {course.isOwner ? (
              <span className="text-sm text-muted">You created this course.</span>
            ) : course.enrollment ? (
              course.enrollment.completedAt ? (
                <div className="flex items-center gap-2">
                  <Link href={`/courses/${id}/learn`} className="btn-outline">
                    <CheckCircle2 size={15} className="text-teal" /> Review course
                  </Link>
                  <a href={`/api/courses/${id}/certificate`} target="_blank" rel="noreferrer" className="btn-accent">
                    <Award size={15} /> View certificate
                  </a>
                </div>
              ) : (
                <Link href={`/courses/${id}/learn`} className="btn-accent">
                  <PlayCircle size={15} /> Continue ({course.enrollment.progressPercent}%)
                </Link>
              )
            ) : (
              <button onClick={enroll} disabled={enrolling} className="btn-accent">
                {enrolling && <Loader2 size={14} className="animate-spin" />} Enroll for free
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-3">Syllabus</h2>
        <div className="space-y-4">
          {course.modules.map((m: any, i: number) => (
            <div key={m.id}>
              <p className="text-sm font-medium text-ink mb-1">{i + 1}. {m.title}</p>
              <ul className="text-sm text-muted space-y-1 pl-4">
                {m.lessons.map((l: any) => (
                  <li key={l.id} className="flex items-center justify-between">
                    <span>{l.title}</span>
                    <span className="text-xs">{l.durationMinutes} min</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-3">Reviews</h2>
        {course.enrollment && (
          <div className="rounded-lg border border-border p-4 mb-4 space-y-2">
            <p className="text-sm text-ink font-medium">Leave a review</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setMyRating(n)}>
                  <Star size={20} className={n <= myRating ? "fill-amber-dark text-amber-dark" : "text-border"} />
                </button>
              ))}
            </div>
            <textarea className="textarea" placeholder="Optional comment" value={myComment} onChange={(e) => setMyComment(e.target.value)} />
            <button onClick={submitReview} disabled={submittingReview} className="btn-accent btn-sm">
              {submittingReview && <Loader2 size={14} className="animate-spin" />} Submit review
            </button>
          </div>
        )}
        <div className="space-y-4">
          {course.reviews.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}
          {course.reviews.map((r: any) => (
            <div key={r.id} className="flex items-start gap-3">
              <Avatar name={r.user.name} src={r.user.image} size="sm" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">{r.user.name}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={12} className={n <= r.rating ? "fill-amber-dark text-amber-dark" : "text-border"} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-ink mt-0.5">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
