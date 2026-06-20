import Link from "next/link";
import { MapPin, Bookmark, Zap, Cloud, GitBranch, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Remote" | "Hybrid" | "On-site";
  skills: string[];
  salary?: string;
  gradient: string;
  accentColor: string;
  Icon: React.ElementType;
}

export const SAMPLE_FEED_JOBS: FeedJob[] = [
  {
    id: "fj1",
    title: "Senior Azure Cloud Engineer",
    company: "Northwind Labs",
    location: "London, UK",
    type: "Hybrid",
    skills: ["Azure", "Terraform", "Kubernetes", "ARM Templates"],
    salary: "£90k – £120k",
    gradient: "linear-gradient(135deg, #0078D4 0%, #1B1F3B 100%)",
    accentColor: "#0078D4",
    Icon: Cloud,
  },
  {
    id: "fj2",
    title: "AWS Solutions Architect",
    company: "CloudScale Inc.",
    location: "Remote",
    type: "Remote",
    skills: ["AWS", "Lambda", "CDK", "DynamoDB"],
    salary: "$130k – $160k",
    gradient: "linear-gradient(135deg, #1A1A2E 0%, #FF9900 100%)",
    accentColor: "#FF9900",
    Icon: Zap,
  },
  {
    id: "fj3",
    title: "Databricks Data Engineer",
    company: "DataFusion AI",
    location: "Berlin, Germany",
    type: "Remote",
    skills: ["Databricks", "Apache Spark", "Delta Lake", "Python"],
    salary: "€95k – €125k",
    gradient: "linear-gradient(135deg, #FF3621 0%, #1B1F3B 100%)",
    accentColor: "#FF3621",
    Icon: Database,
  },
  {
    id: "fj4",
    title: "Cloud DevOps Engineer (Multi-cloud)",
    company: "AeroPeak Solutions",
    location: "Austin, TX",
    type: "On-site",
    skills: ["CI/CD", "Docker", "Jenkins", "Azure DevOps"],
    salary: "$110k – $140k",
    gradient: "linear-gradient(135deg, #00C4A7 0%, #1B1F3B 100%)",
    accentColor: "#00C4A7",
    Icon: GitBranch,
  },
];

const TYPE_STYLE: Record<string, string> = {
  Remote: "chip-teal",
  Hybrid: "chip-amber",
  "On-site": "chip",
};

export default function FeedJobCard({ job }: { job: FeedJob }) {
  const Icon = job.Icon;
  return (
    <div className="card-hover overflow-hidden">
      {/* Hero gradient */}
      <div className="relative h-32 overflow-hidden" style={{ background: job.gradient }}>
        {/* Dot-grid pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`dots-${job.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${job.id})`} />
        </svg>
        {/* Company badge */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center border border-white/20"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
          >
            <Icon size={20} color="white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-snug">{job.company}</p>
            <p className="text-white/60 text-xs flex items-center gap-1">
              <MapPin size={10} /> {job.location}
            </p>
          </div>
        </div>
        {/* Promoted badge */}
        <span className="absolute top-3 right-3 text-[10px] font-semibold text-white/70 bg-white/10 backdrop-blur px-2 py-0.5 rounded-full border border-white/20">
          Promoted
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-sm text-ink leading-snug">{job.title}</h3>
            {job.salary && (
              <p className="text-xs font-mono text-teal-dark mt-0.5">{job.salary}</p>
            )}
          </div>
          <button className="p-1.5 rounded-full hover:bg-paper text-muted hover:text-teal transition-colors shrink-0" title="Save job">
            <Bookmark size={15} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={cn(TYPE_STYLE[job.type] ?? "chip", "!py-0.5 !px-2 !text-[11px]")}>
            {job.type}
          </span>
          {job.skills.map((s) => (
            <span key={s} className="chip !py-0.5 !px-2 !text-[11px]">{s}</span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/jobs" className="btn-accent btn-sm flex-1 justify-center">
            Easy Apply
          </Link>
          <Link href="/jobs" className="btn-outline btn-sm">
            View role
          </Link>
        </div>
      </div>
    </div>
  );
}
