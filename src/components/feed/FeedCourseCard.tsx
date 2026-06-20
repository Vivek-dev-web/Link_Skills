import Link from "next/link";
import { Clock, BarChart2, BookOpen } from "lucide-react";

export interface FeedCourse {
  id: string;
  title: string;
  provider: string;
  platform: "Azure" | "AWS" | "Databricks" | "Multi-cloud";
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  gradient: string;
  platformColor: string;
}

export const SAMPLE_FEED_COURSES: FeedCourse[] = [
  {
    id: "fc1",
    title: "Azure Solutions Architect Expert (AZ-305) — Certification Prep",
    provider: "Microsoft Learn",
    platform: "Azure",
    duration: "32 hrs",
    level: "Advanced",
    gradient: "linear-gradient(135deg, #0078D4 0%, #004E8C 100%)",
    platformColor: "#0078D4",
  },
  {
    id: "fc2",
    title: "Databricks Lakehouse Fundamentals",
    provider: "Databricks Academy",
    platform: "Databricks",
    duration: "12 hrs",
    level: "Beginner",
    gradient: "linear-gradient(135deg, #FF3621 0%, #1B1F3B 100%)",
    platformColor: "#FF3621",
  },
  {
    id: "fc3",
    title: "AWS Certified Cloud Practitioner — Crash Course",
    provider: "AWS Skill Builder",
    platform: "AWS",
    duration: "18 hrs",
    level: "Beginner",
    gradient: "linear-gradient(135deg, #232F3E 0%, #FF9900 100%)",
    platformColor: "#FF9900",
  },
  {
    id: "fc4",
    title: "Multi-Cloud Security: Azure, AWS & GCP",
    provider: "Atlas Learning",
    platform: "Multi-cloud",
    duration: "24 hrs",
    level: "Intermediate",
    gradient: "linear-gradient(135deg, #1B1F3B 0%, #00C4A7 100%)",
    platformColor: "#00C4A7",
  },
];

const LEVEL_CHIP: Record<string, string> = {
  Beginner: "chip-teal",
  Intermediate: "chip-amber",
  Advanced: "chip-coral",
};

export default function FeedCourseCard({ course }: { course: FeedCourse }) {
  return (
    <div className="card-hover overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden" style={{ background: course.gradient }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${course.id}`} x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${course.id})`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen size={36} color="rgba(255,255,255,0.3)" strokeWidth={1.2} />
        </div>
        {/* Platform badge */}
        <span
          className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
          style={{ backgroundColor: course.platformColor }}
        >
          {course.platform}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <span className={`${LEVEL_CHIP[course.level] ?? "chip"} !py-0.5 !px-2 !text-[11px] mb-2 inline-block`}>
          {course.level}
        </span>
        <h3 className="font-semibold text-sm text-ink leading-snug line-clamp-2 mb-1">
          {course.title}
        </h3>
        <p className="text-xs text-muted mb-3">{course.provider}</p>

        <div className="flex items-center gap-4 text-xs text-muted mb-4">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 size={12} /> {course.level}
          </span>
        </div>

        <Link href="/courses" className="btn-accent btn-sm w-full justify-center">
          Enroll free
        </Link>
      </div>
    </div>
  );
}
