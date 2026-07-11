"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Inbox, Calendar, Video, MessageSquare, FileText,
  Clock, Briefcase, GraduationCap,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

type Consultation = {
  id: string;
  createdAt: string;
  type: string;
  college: string | null;
  yearOfStudy: string | null;
  interestArea: string | null;
  question: string | null;
  timeSlot: string | null;
  currentRole: string | null;
  yearsExp: number | null;
  goal: string | null;
  challenge: string | null;
  mode: string | null;
  availableFrom: string | null;
  user: { id: string; name: string; email: string; image: string | null };
};

const MODE_ICON: Record<string, any> = {
  "Video call":   Video,
  "Chat (async)": MessageSquare,
  "Written Q&A":  FileText,
};

const GOAL_LABELS: Record<string, string> = {
  promote: "Get promoted",
  switch:  "Switch domain",
  startup: "Start a business",
  abroad:  "Work abroad",
};

function ConsultationCard({ c }: { c: Consultation }) {
  const isStudent = c.type === "STUDENT";
  const ModeIcon  = c.mode ? (MODE_ICON[c.mode] ?? MessageSquare) : MessageSquare;

  return (
    <div className="bg-white rounded-xl border border-border p-5 space-y-4">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={c.user.name} src={c.user.image} size="sm" />
          <div>
            <p className="text-sm font-semibold text-ink">{c.user.name}</p>
            <p className="text-xs text-muted">{c.user.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={cn(
            "text-[10px] font-semibold rounded-full px-2.5 py-0.5 uppercase tracking-wide",
            isStudent ? "bg-teal/10 text-teal" : "bg-amber/10 text-amber-dark"
          )}>
            {isStudent ? "Student" : "Professional"}
          </span>
          <span className="text-[10px] text-muted flex items-center gap-1">
            <Clock size={10} />
            {format(new Date(c.createdAt), "dd MMM yyyy, hh:mm a")}
          </span>
        </div>
      </div>

      {/* details */}
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted">
        {isStudent ? (
          <>
            {c.college     && <div><span className="font-medium text-ink">College: </span>{c.college}</div>}
            {c.yearOfStudy && <div><span className="font-medium text-ink">Year: </span>{c.yearOfStudy}</div>}
            {c.interestArea && <div><span className="font-medium text-ink">Interest: </span>{c.interestArea}</div>}
            {c.timeSlot    && <div className="flex items-center gap-1"><Calendar size={10} /><span className="font-medium text-ink">Slot: </span>{c.timeSlot}</div>}
          </>
        ) : (
          <>
            {c.currentRole && <div className="flex items-center gap-1"><Briefcase size={10} /><span className="font-medium text-ink">Role: </span>{c.currentRole}</div>}
            {c.yearsExp != null && <div><span className="font-medium text-ink">Experience: </span>{c.yearsExp} yrs</div>}
            {c.goal        && <div><span className="font-medium text-ink">Goal: </span>{GOAL_LABELS[c.goal] ?? c.goal}</div>}
            {c.mode        && <div className="flex items-center gap-1"><ModeIcon size={10} /><span className="font-medium text-ink">Mode: </span>{c.mode}</div>}
            {c.availableFrom && <div className="flex items-center gap-1"><Calendar size={10} /><span className="font-medium text-ink">Available from: </span>{format(new Date(c.availableFrom), "dd MMM yyyy")}</div>}
          </>
        )}
      </div>

      {/* question / challenge */}
      {(c.question || c.challenge) && (
        <div className="bg-paper border border-border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">
            {isStudent ? "Question for mentor" : "Specific challenge"}
          </p>
          <p className="text-sm text-ink leading-relaxed">{c.question ?? c.challenge}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminConsultationsPage() {
  const [list, setList]     = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "STUDENT" | "PROFESSIONAL">("ALL");

  useEffect(() => {
    fetch("/api/admin/consultations")
      .then((r) => r.json())
      .then((data) => { setList(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = list.filter((c) => filter === "ALL" || c.type === filter);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Consultation Requests</h1>
          <p className="text-sm text-muted mt-0.5">{list.length} total request{list.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* filter tabs */}
      <div className="flex gap-2">
        {(["ALL", "STUDENT", "PROFESSIONAL"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
              filter === t
                ? "bg-teal text-white"
                : "bg-white border border-border text-muted hover:border-teal/40"
            )}
          >
            {t === "STUDENT"      && <GraduationCap size={11} />}
            {t === "PROFESSIONAL" && <Briefcase size={11} />}
            {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            <span className={cn("rounded-full px-1.5 text-[10px]", filter === t ? "bg-white/20" : "bg-paper")}>
              {t === "ALL" ? list.length : list.filter((c) => c.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-teal border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center space-y-3">
          <Inbox size={40} className="text-muted mx-auto" />
          <p className="text-muted text-sm">No consultation requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => <ConsultationCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
