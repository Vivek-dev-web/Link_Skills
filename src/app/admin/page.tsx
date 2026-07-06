"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, FileText, ShieldAlert, Building2, GitBranch, UserPlus, PlusCircle } from "lucide-react";

type Stats = {
  users: number; jobs: number; posts: number; reports: number;
  connections: number; companies: number; newUsersToday: number; newJobsToday: number;
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-start gap-4">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-ink">{value.toLocaleString()}</p>
        <p className="text-sm text-muted">{label}</p>
        {sub && <p className="text-xs text-teal mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return (
    <div className="space-y-2">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-5 h-24 animate-pulse bg-paper" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Total users"    value={stats.users}       sub={`+${stats.newUsersToday} today`} color="bg-teal-light text-teal" />
        <StatCard icon={Briefcase}  label="Active jobs"    value={stats.jobs}        sub={`+${stats.newJobsToday} today`}  color="bg-amber-light text-amber-dark" />
        <StatCard icon={FileText}   label="Total posts"    value={stats.posts}       color="bg-brand/10 text-ink" />
        <StatCard icon={ShieldAlert} label="Pending reports" value={stats.reports}   color={stats.reports > 0 ? "bg-coral-light text-coral" : "bg-paper text-muted"} />
        <StatCard icon={GitBranch}  label="Connections"    value={stats.connections} color="bg-teal-light text-teal" />
        <StatCard icon={Building2}  label="Companies"      value={stats.companies}   color="bg-amber-light text-amber-dark" />
      </div>

      {stats.reports > 0 && (
        <div className="bg-coral-light border border-coral/30 rounded-xl p-4 flex items-center gap-3">
          <ShieldAlert size={20} className="text-coral shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">{stats.reports} unresolved report{stats.reports !== 1 ? "s" : ""}</p>
            <p className="text-xs text-muted">Review flagged posts before they spread.</p>
          </div>
          <a href="/admin/posts?filter=reported" className="btn-sm bg-coral text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-coral-dark transition-colors">
            Review now
          </a>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border p-5">
        <p className="font-semibold text-sm text-ink mb-1">First time setup</p>
        <p className="text-xs text-muted mb-3">
          You are the platform admin. Use the sidebar to manage users, jobs, and reported content.
        </p>
        <div className="flex gap-2 flex-wrap">
          <a href="/admin/users" className="btn-outline btn-sm flex items-center gap-1.5"><UserPlus size={13} /> Manage users</a>
          <a href="/admin/jobs"  className="btn-outline btn-sm flex items-center gap-1.5"><Briefcase size={13} /> Manage jobs</a>
          {stats.reports > 0 && <a href="/admin/posts?filter=reported" className="btn-sm bg-coral text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-coral-dark transition-colors flex items-center gap-1.5"><ShieldAlert size={13} /> Review reports</a>}
        </div>
      </div>
    </div>
  );
}
