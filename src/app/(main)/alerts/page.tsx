"use client";

import { useState } from "react";
import {
  Bell, Plus, Trash2, MapPin, Edit3, Briefcase, Check,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";

type Alert = {
  id: string;
  query: string;
  location: string;
  minExp: string;
  salary: string;
  jobType: string;
  freq: "Daily" | "Weekly";
  active: boolean;
  matched: number;
};

const INITIAL_ALERTS: Alert[] = [
  { id: "a1", query: "Azure Data Engineer",   location: "Bengaluru",  minExp: "3–5 yrs",  salary: "20+ LPA", jobType: "Full-time", freq: "Daily",  active: true,  matched: 12 },
  { id: "a2", query: "Data Scientist",         location: "Remote",     minExp: "0–2 yrs",  salary: "10+ LPA", jobType: "Any",       freq: "Weekly", active: true,  matched: 5  },
  { id: "a3", query: "MLOps Engineer",         location: "Hyderabad",  minExp: "5–10 yrs", salary: "30+ LPA", jobType: "Full-time", freq: "Daily",  active: false, matched: 0  },
];

const EXP_OPTIONS = ["0–1 yr", "0–2 yrs", "1–3 yrs", "3–5 yrs", "5–10 yrs", "10+ yrs"];
const SALARY_OPTIONS = ["Any", "5+ LPA", "10+ LPA", "15+ LPA", "20+ LPA", "30+ LPA", "50+ LPA"];
const JOB_TYPE_OPTIONS = ["Any", "Full-time", "Contract", "Internship", "Freelance"];
const FREQ_OPTIONS = ["Daily", "Weekly"] as const;

function AlertCard({ alert, onToggle, onDelete, onEdit }: {
  alert: Alert;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className={cn("card p-4 transition-opacity", !alert.active && "opacity-60")}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
            alert.active ? "bg-teal-light" : "bg-paper"
          )}>
            <Bell size={16} className={alert.active ? "text-teal" : "text-muted"} />
          </div>
          <div>
            <p className="font-semibold text-sm text-ink">{alert.query}</p>
            <div className="flex gap-2 mt-1 flex-wrap text-xs text-muted">
              <span className="flex items-center gap-1"><MapPin size={10} />{alert.location}</span>
              <span>{alert.minExp}</span>
              <span>{alert.salary}</span>
              <span>{alert.jobType}</span>
            </div>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="chip !py-0.5 !px-2 !text-[11px]">{alert.freq}</span>
          <button
            onClick={onToggle}
            aria-label={alert.active ? "Disable alert" : "Enable alert"}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              alert.active ? "bg-teal" : "bg-border"
            )}
          >
            <span className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
              alert.active ? "translate-x-4" : "translate-x-0.5"
            )} />
          </button>
        </div>
      </div>

      {alert.active && alert.matched > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <Check size={12} className="text-teal" />
          <p className="text-xs text-teal">
            Last matched <span className="font-semibold">{alert.matched} jobs</span>
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
        <button onClick={onEdit} className="btn-outline btn-sm gap-1">
          <Edit3 size={12} /> Edit
        </button>
        <button onClick={onDelete} className="btn-ghost btn-sm text-muted hover:text-coral gap-1">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [creating, setCreating] = useState(false);
  const [saved, setSaved] = useState(false);

  // New alert form state
  const [query, setQuery]       = useState("");
  const [location, setLocation] = useState("");
  const [minExp, setMinExp]     = useState("Any");
  const [salary, setSalary]     = useState("Any");
  const [jobType, setJobType]   = useState("Any");
  const [freq, setFreq]         = useState<"Daily" | "Weekly">("Daily");

  function handleSave() {
    if (!query.trim()) return;
    const newAlert: Alert = {
      id: `a${Date.now()}`,
      query: query.trim(),
      location: location.trim() || "Anywhere",
      minExp: minExp === "Any" ? "Any experience" : minExp,
      salary,
      jobType,
      freq,
      active: true,
      matched: 0,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setCreating(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setQuery(""); setLocation(""); setMinExp("Any"); setSalary("Any"); setJobType("Any"); setFreq("Daily");
  }

  function toggleAlert(id: string) {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  }

  function deleteAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const activeCount = alerts.filter((a) => a.active).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Job Alerts</h1>
          <p className="text-sm text-muted mt-0.5">
            {activeCount} active alert{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)} className="btn-accent btn-sm gap-1.5">
            <Plus size={14} /> New alert
          </button>
        )}
      </div>

      {/* Success banner */}
      {saved && (
        <div className="card p-3 border-teal/30 bg-teal-light flex items-center gap-2 text-teal text-sm">
          <Check size={16} /> Alert created! You'll get notified {freq.toLowerCase()}.
        </div>
      )}

      {/* Create form */}
      {creating && (
        <div className="card p-5 border-teal/30 border-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg text-ink">New job alert</p>
            <button onClick={() => setCreating(false)} className="btn-ghost btn-sm text-muted">Cancel</button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Keywords <span className="text-coral">*</span></label>
              <input
                className="input"
                placeholder="e.g. Azure Data Engineer"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                placeholder="City or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Experience</label>
              <select className="input" value={minExp} onChange={(e) => setMinExp(e.target.value)}>
                <option>Any</option>
                {EXP_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min Salary</label>
              <select className="input" value={salary} onChange={(e) => setSalary(e.target.value)}>
                {SALARY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Job Type</label>
              <select className="input" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                {JOB_TYPE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Alert Frequency</label>
              <div className="flex gap-2">
                {FREQ_OPTIONS.map((f) => (
                  <label key={f} className="flex-1 flex items-center gap-2 border border-border rounded-lg px-3 py-2 cursor-pointer transition-colors hover:border-teal">
                    <input
                      type="radio"
                      name="freq"
                      value={f}
                      checked={freq === f}
                      onChange={() => setFreq(f)}
                      className="accent-teal"
                    />
                    <span className="text-sm text-ink">{f}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!query.trim()} className="btn-accent flex-1">
              Create alert
            </button>
            <button onClick={() => setCreating(false)} className="btn-outline btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Alerts list */}
      {alerts.length === 0 && !creating && (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Create your first job alert to get notified when new matching roles are posted."
        />
      )}

      <div className="space-y-3">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onToggle={() => toggleAlert(alert.id)}
            onDelete={() => deleteAlert(alert.id)}
            onEdit={() => {}}
          />
        ))}
      </div>

      {alerts.length > 0 && (
        <p className="text-xs text-muted text-center">
          Alerts are sent to <span className="text-ink font-medium">your registered email</span>.
          Manage delivery in <a href="/settings" className="text-teal hover:underline">Settings</a>.
        </p>
      )}
    </div>
  );
}
