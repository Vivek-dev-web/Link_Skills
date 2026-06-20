import Link from "next/link";
import { ArrowRight, Cloud, Database, Zap, Award } from "lucide-react";

const STEPS = [
  { icon: Cloud, label: "Azure Fundamentals", color: "#0078D4" },
  { icon: Database, label: "Databricks & Spark", color: "#FF3621" },
  { icon: Zap, label: "AWS Core Services", color: "#FF9900" },
  { icon: Award, label: "Multi-Cloud Cert", color: "#00C4A7" },
];

export default function LearningPathBanner() {
  return (
    <div
      className="rounded-xl2 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #1B1F3B 0%, #2D3158 60%, #00443B 100%)" }}
    >
      {/* Dot grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lp-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lp-dots)" />
      </svg>

      <div className="relative p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-teal uppercase mb-2 block">
              Featured learning path
            </span>
            <h2 className="font-display text-xl text-white leading-snug mb-1">
              Become a Cloud Data Engineer
              <br />
              <span className="text-teal">in 90 Days</span>
            </h2>
            <p className="text-white/50 text-xs mt-1.5">
              4 curated courses · Hands-on labs · Certificate included
            </p>
          </div>
          <Link
            href="/courses"
            className="btn bg-teal text-white hover:bg-teal-dark shrink-0 self-start"
          >
            Start path <ArrowRight size={14} />
          </Link>
        </div>

        {/* Steps */}
        <div className="mt-5 flex items-center gap-0 overflow-x-auto pb-1">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center border border-white/20"
                    style={{ backgroundColor: `${step.color}33` }}
                  >
                    <Icon size={18} color={step.color} />
                  </div>
                  <span className="text-[10px] text-white/60 text-center w-20 leading-tight">
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex items-center mx-2 mb-4">
                    <div className="w-6 h-px border-t border-dashed border-white/20" />
                    <ArrowRight size={10} className="text-white/20 -ml-1" />
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
