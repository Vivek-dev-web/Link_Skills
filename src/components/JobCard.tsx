import Link from "next/link";
import { MapPin, Briefcase, Heart } from "lucide-react";
import { formatSalary, formatRelativeTime } from "@/lib/utils";
import { WORK_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function JobCard({
  job,
  saved,
  onToggleSave,
}: {
  job: any;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <Link href={`/jobs/${job.id}`} className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-11 w-11 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {job.company?.logoUrl ? (
              <img src={job.company.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Briefcase size={18} className="text-muted" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-ink truncate hover:text-coral">{job.title}</p>
            <p className="text-xs text-muted truncate">{job.company?.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {job.location}
              </span>
              <span className="chip !py-0.5 !px-2">{WORK_TYPE_LABELS[job.workType] ?? job.workType}</span>
              {job.remote && <span className="chip-teal !py-0.5 !px-2">Remote</span>}
            </div>
          </div>
        </Link>
        {onToggleSave && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(job.id); }}
            className={cn(
              "relative z-20 p-1.5 rounded-full transition-colors shrink-0",
              saved ? "text-coral bg-coral-light" : "text-muted hover:text-coral hover:bg-coral-light"
            )}
            title={saved ? "Remove from saved" : "Save job"}
          >
            <Heart size={16} className={saved ? "fill-coral" : ""} strokeWidth={saved ? 2.4 : 1.8} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs font-mono text-ink">{formatSalary(job.salaryMin, job.salaryMax)}</p>
        <p className="text-xs text-muted">{job.createdAt ? formatRelativeTime(job.createdAt) : ""}</p>
      </div>

      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.skills.slice(0, 4).map((s: any) => (
            <span key={s.skillId ?? s.skill?.id} className="chip !py-0.5 !px-2 text-[11px]">
              {s.skill?.name ?? s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
