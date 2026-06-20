import Link from "next/link";
import { Star, GraduationCap, Users2 } from "lucide-react";
import { COURSE_LEVEL_LABELS } from "@/lib/constants";

export default function CourseCard({ course }: { course: any }) {
  return (
    <Link href={`/courses/${course.id}`} className="card overflow-hidden block group">
      <div className="h-28 bg-gradient-to-br from-amber-light via-coral-light to-teal-light flex items-center justify-center">
        {course.imageUrl ? (
          <img src={course.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <GraduationCap size={28} className="text-ink/30" />
        )}
      </div>
      <div className="p-4">
        <span className="chip-amber !py-0.5 !px-2 text-[11px] mb-2 inline-block">
          {COURSE_LEVEL_LABELS[course.level] ?? course.level}
        </span>
        <p className="font-medium text-sm text-ink group-hover:text-coral line-clamp-2">{course.title}</p>
        <p className="text-xs text-muted mt-1">{course.providerName || course.creator?.name}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Users2 size={12} /> {course._count?.enrollments ?? 0}
          </span>
          {course.avgRating ? (
            <span className="flex items-center gap-1 text-amber-dark">
              <Star size={12} className="fill-amber-dark" /> {course.avgRating.toFixed(1)}
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>
        {course.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {course.skills.slice(0, 3).map((s: any) => (
              <span key={s.skillId} className="chip !py-0.5 !px-2 text-[10px]">{s.skill.name}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
