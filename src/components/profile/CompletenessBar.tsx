import { cn } from "@/lib/utils";

export default function CompletenessBar({ percent }: { percent: number }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-ink">Profile completeness</p>
        <span className="font-mono text-sm text-coral">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-paper overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", percent === 100 ? "bg-teal" : "bg-coral")}
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent < 100 && (
        <p className="text-xs text-muted mt-2">
          Add a photo, summary, experience, education, skills, and resume to reach 100%.
        </p>
      )}
    </div>
  );
}
