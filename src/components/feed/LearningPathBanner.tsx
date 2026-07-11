import Link from "next/link";
import { ArrowRight, Cloud, Database, Zap, Award, Clock, Users } from "lucide-react";

const STEPS = [
  { icon: Cloud,     label: "Azure Fundamentals",  color: "#0078D4", bg: "#0078D420" },
  { icon: Database,  label: "Databricks & Spark",  color: "#FF3621", bg: "#FF362120" },
  { icon: Zap,       label: "AWS Core Services",   color: "#FF9900", bg: "#FF990020" },
  { icon: Award,     label: "Multi-Cloud Cert",    color: "#0F7A72", bg: "#0F7A7220" },
];

export default function LearningPathBanner() {
  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B1120 0%, #0D2535 55%, #0B1C1A 100%)" }}>

      {/* grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lp-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lp-grid)" />
      </svg>

      {/* glow blobs */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #0F7A72, transparent 70%)" }} />
      <div className="absolute bottom-0 left-20 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #0078D4, transparent 70%)" }} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              Featured learning path
            </div>
            <h2 className="font-display text-xl text-white leading-snug">
              Become a Cloud Data Engineer
              <br />
              <span style={{ color: "#0F7A72" }}>in 90 Days</span>
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-white/40 text-xs">
                <Clock size={11} /> ~90 hours
              </span>
              <span className="flex items-center gap-1 text-white/40 text-xs">
                <Users size={11} /> 2,400+ enrolled
              </span>
              <span className="text-[10px] font-semibold text-amber-dark bg-amber/10 border border-amber/20 rounded-full px-2 py-0.5">
                Certificate included
              </span>
            </div>
          </div>
          <Link href="/courses"
            className="flex items-center gap-2 rounded-full bg-teal text-white text-sm font-semibold px-5 py-2.5 hover:bg-teal/90 transition-colors shrink-0 shadow-lg">
            Start path <ArrowRight size={14} />
          </Link>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: step.bg }}>
                    <Icon size={20} color={step.color} />
                  </div>
                  <span className="text-[10px] text-white/50 text-center w-20 leading-tight font-medium">
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex items-center mx-3 mb-4">
                    <div className="w-8 h-px border-t-2 border-dashed border-white/15" />
                    <ArrowRight size={10} className="text-white/20 -ml-1.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
