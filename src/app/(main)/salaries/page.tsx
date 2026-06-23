"use client";

import { useState } from "react";
import { Search, TrendingUp, Building2, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SalaryRow = { company: string; avg: number; min: number; max: number; reports: number };

type RoleData = {
  role: string;
  location: string;
  avgLPA: number;
  minLPA: number;
  maxLPA: number;
  reports: number;
  yoy: number;
  companies: SalaryRow[];
};

const SALARY_DB: RoleData[] = [
  {
    role: "Data Engineer", location: "Bengaluru", avgLPA: 26, minLPA: 14, maxLPA: 45, reports: 218, yoy: 12,
    companies: [
      { company: "Google",    avg: 48, min: 40, max: 60, reports: 12 },
      { company: "Amazon",    avg: 42, min: 35, max: 52, reports: 18 },
      { company: "Flipkart",  avg: 34, min: 28, max: 44, reports: 27 },
      { company: "Microsoft", avg: 40, min: 32, max: 50, reports: 9  },
      { company: "Swiggy",    avg: 28, min: 22, max: 38, reports: 14 },
    ],
  },
  {
    role: "Senior Data Engineer", location: "Bengaluru", avgLPA: 42, minLPA: 28, maxLPA: 65, reports: 134, yoy: 15,
    companies: [
      { company: "Google",    avg: 70, min: 60, max: 85, reports: 8  },
      { company: "Amazon",    avg: 60, min: 50, max: 72, reports: 11 },
      { company: "Flipkart",  avg: 50, min: 40, max: 62, reports: 19 },
      { company: "Razorpay",  avg: 55, min: 45, max: 68, reports: 7  },
      { company: "Paytm",     avg: 40, min: 32, max: 52, reports: 15 },
    ],
  },
  {
    role: "ML Engineer", location: "Bengaluru", avgLPA: 36, minLPA: 20, maxLPA: 60, reports: 156, yoy: 18,
    companies: [
      { company: "Google",    avg: 68, min: 55, max: 82, reports: 10 },
      { company: "NVIDIA",    avg: 62, min: 50, max: 76, reports: 5  },
      { company: "Flipkart",  avg: 44, min: 35, max: 55, reports: 16 },
      { company: "MPhasis",   avg: 28, min: 22, max: 38, reports: 22 },
      { company: "Infosys",   avg: 18, min: 14, max: 26, reports: 30 },
    ],
  },
  {
    role: "DevOps Engineer", location: "Hyderabad", avgLPA: 22, minLPA: 12, maxLPA: 40, reports: 97, yoy: 9,
    companies: [
      { company: "Amazon",      avg: 38, min: 30, max: 48, reports: 14 },
      { company: "TCS",         avg: 14, min: 10, max: 20, reports: 32 },
      { company: "Wipro",       avg: 16, min: 12, max: 22, reports: 28 },
      { company: "Tech Mahindra",avg: 18, min: 14, max: 24, reports: 23 },
    ],
  },
];

const ROLES = [...new Set(SALARY_DB.map((d) => d.role))];
const LOCATIONS = [...new Set(SALARY_DB.map((d) => d.location))];
const EXP_OPTIONS = ["Any", "0–2 yrs", "2–5 yrs", "5–10 yrs", "10+ yrs"];

const TOP_PAYING = [
  { company: "Google",    role: "Senior Data Engineer", avg: 70 },
  { company: "Amazon",    role: "Senior Data Engineer", avg: 60 },
  { company: "NVIDIA",    role: "ML Engineer",          avg: 62 },
  { company: "Microsoft", role: "Cloud Architect",      avg: 58 },
  { company: "Razorpay",  role: "Senior Data Engineer", avg: 55 },
];

function SalaryGauge({ value, min, max }: { value: number; min: number; max: number }) {
  const r = 52;
  const circ = Math.PI * r;
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const dash = pct * circ;
  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      <path d={`M 14 70 A ${r} ${r} 0 0 1 126 70`} fill="none" stroke="#E4E7EC" strokeWidth="12" strokeLinecap="round" />
      <path d={`M 14 70 A ${r} ${r} 0 0 1 126 70`} fill="none" stroke="#00C4A7" strokeWidth="12" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} />
      <text x="70" y="64" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1B1F3B" fontFamily="'JetBrains Mono', monospace">{value}</text>
      <text x="70" y="77" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Inter, sans-serif">LPA avg</text>
      <text x="14" y="78" textAnchor="middle" fontSize="9" fill="#64748B">{min}</text>
      <text x="126" y="78" textAnchor="middle" fontSize="9" fill="#64748B">{max}</text>
    </svg>
  );
}

export default function SalariesPage() {
  const [role, setRole] = useState(ROLES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [exp, setExp] = useState("Any");
  const [searched, setSearched] = useState(true);

  const data = SALARY_DB.find((d) => d.role === role && d.location === location);

  const userSalary = 28;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink">Salary Insights</h1>
        <p className="text-sm text-muted mt-1">Explore role-wise salary data from employee reports across India.</p>
      </div>

      {/* Search */}
      <div className="card p-5 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <select className="input" value={location} onChange={(e) => setLocation(e.target.value)}>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Experience</label>
            <select className="input" value={exp} onChange={(e) => setExp(e.target.value)}>
              {EXP_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={() => setSearched(true)}
          className="btn-accent btn-sm gap-1.5"
        >
          <Search size={14} /> Search salaries
        </button>
      </div>

      {searched && data && (
        <>
          {/* Overview card */}
          <div className="card p-6">
            <div className="flex items-start gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-1">
                <SalaryGauge value={data.avgLPA} min={data.minLPA} max={data.maxLPA} />
                <p className="text-[11px] text-muted mt-1">Based on {data.reports} reports</p>
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <p className="font-display text-xl text-ink">{data.role}</p>
                  <p className="text-sm text-muted">{data.location} · {exp === "Any" ? "All experience levels" : exp}</p>
                </div>

                {/* Range bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted mb-1.5">
                    <span>Min · {data.minLPA} LPA</span>
                    <span className="text-teal font-semibold">Avg · {data.avgLPA} LPA</span>
                    <span>Max · {data.maxLPA} LPA</span>
                  </div>
                  <div className="h-3 bg-paper rounded-full overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 rounded-full bg-gradient-to-r from-teal/40 to-teal"
                      style={{
                        left: `${((data.minLPA) / data.maxLPA) * 100}%`,
                        width: `${((data.maxLPA - data.minLPA) / data.maxLPA) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute inset-y-0 w-1 bg-teal-dark rounded-full"
                      style={{ left: `${(data.avgLPA / data.maxLPA) * 100}%` }}
                    />
                  </div>
                </div>

                {/* YoY growth */}
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-teal" />
                  <p className="text-sm text-ink">
                    <span className="font-semibold text-teal">+{data.yoy}% YoY growth</span>
                    {" "}in salaries for {data.role} roles
                  </p>
                </div>

                {/* How your salary compares */}
                <div className="p-3 bg-brand-light rounded-xl">
                  <p className="text-xs font-semibold text-ink mb-1">How your salary compares</p>
                  <div className="h-2 bg-paper rounded-full overflow-hidden relative mb-2">
                    <div className="h-full bg-teal rounded-full" style={{ width: `${(data.avgLPA / data.maxLPA) * 100}%` }} />
                    <div
                      className="absolute top-0 w-2 h-2 bg-coral rounded-full border-2 border-white"
                      style={{ left: `${(userSalary / data.maxLPA) * 100 - 1}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted">
                    Your salary (<span className="font-semibold text-ink">{userSalary} LPA</span>) is{" "}
                    {userSalary < data.avgLPA
                      ? <span className="text-coral">below the market average by {data.avgLPA - userSalary} LPA</span>
                      : <span className="text-teal">above the market average by {userSalary - data.avgLPA} LPA</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company breakdown */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Building2 size={16} className="text-muted" />
              <p className="font-semibold text-sm text-ink">Company-wise salary breakdown</p>
            </div>
            <div className="divide-y divide-border">
              <div className="grid grid-cols-5 px-5 py-2 bg-paper text-[11px] font-semibold text-muted uppercase tracking-wide">
                <span className="col-span-2">Company</span>
                <span className="text-right">Avg LPA</span>
                <span className="text-right">Range</span>
                <span className="text-right">Reports</span>
              </div>
              {data.companies.map((c, i) => (
                <div key={c.company} className="grid grid-cols-5 px-5 py-3 text-sm items-center hover:bg-paper transition-colors">
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={cn(
                      "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                      i === 0 ? "bg-amber" : i === 1 ? "bg-muted" : "bg-border text-muted"
                    )}>
                      {i + 1}
                    </span>
                    <span className="font-medium text-ink">{c.company}</span>
                  </div>
                  <span className="text-right font-mono font-semibold text-teal">{c.avg}</span>
                  <span className="text-right text-xs text-muted">{c.min}–{c.max}</span>
                  <span className="text-right text-xs text-muted flex items-center justify-end gap-1">
                    <Users size={10} /> {c.reports}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Top paying companies */}
      <div>
        <p className="font-display text-lg text-ink mb-3">Top paying companies for Data roles</p>
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TOP_PAYING.map((t, i) => (
            <div key={t.company} className="card p-4 text-center card-hover">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 text-sm font-bold text-white",
                i === 0 ? "bg-amber" : i === 1 ? "bg-brand-mid" : "bg-teal"
              )}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : t.company[0]}
              </div>
              <p className="font-semibold text-sm text-ink">{t.company}</p>
              <p className="text-[11px] text-muted mt-0.5">{t.role}</p>
              <p className="font-mono font-bold text-teal mt-1">{t.avg} LPA</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add your salary CTA */}
      <div className="card p-5 border-dashed border-2 flex flex-col items-center gap-2 text-center">
        <p className="font-display text-lg text-ink">Contribute anonymously</p>
        <p className="text-sm text-muted">Add your salary to help the community make informed decisions.</p>
        <button className="btn-accent btn-sm mt-2 gap-1.5">
          <ChevronRight size={13} /> Add your salary
        </button>
      </div>
    </div>
  );
}
