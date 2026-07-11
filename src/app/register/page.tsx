"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Loader2, Briefcase, GraduationCap, User,
  CheckCircle2, Sparkles, Users, BookOpen, ArrowRight,
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

const ROLE_HOME: Record<string, string> = {
  MEMBER:    "/feed",
  RECRUITER: "/hire",
  PROVIDER:  "/courses",
};

const ROLE_OPTIONS = [
  {
    value: "MEMBER",
    label: "Job Seeker",
    sub: "Find roles that match your verified skills",
    icon: User,
    gradient: "from-teal/20 to-teal/5",
    activeRing: "border-teal",
    iconColor: "text-teal",
  },
  {
    value: "RECRUITER",
    label: "Recruiter",
    sub: "Source and hire skill-verified talent",
    icon: Briefcase,
    gradient: "from-amber/20 to-amber/5",
    activeRing: "border-amber-dark",
    iconColor: "text-amber-dark",
  },
  {
    value: "PROVIDER",
    label: "Training Provider",
    sub: "Publish courses and reach active learners",
    icon: GraduationCap,
    gradient: "from-coral/20 to-coral/5",
    activeRing: "border-coral",
    iconColor: "text-coral",
  },
] as const;

const SKILLS = [
  "React", "Python", "SQL", "TypeScript", "Figma", "Node.js",
  "Docker", "AWS", "Machine Learning", "Product Management",
  "Kubernetes", "GraphQL", "Next.js", "Data Analysis", "Go",
  "System Design", "PostgreSQL", "Tailwind CSS",
];

const FEATURES = [
  { icon: Sparkles, text: "AI-matched job recommendations" },
  { icon: BookOpen, text: "Verified skill-based learning paths" },
  { icon: Users,    text: "Connect with top recruiters directly" },
];

export default function RegisterPage() {
  const router  = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState<(typeof ROLE_OPTIONS)[number]["value"]>("MEMBER");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }
      const signinRes = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (signinRes?.error) { router.push("/login"); return; }
      router.push(ROLE_HOME[role] ?? "/feed");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT BRAND PANEL ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #0B1120 0%, #0D1A2E 60%, #0B1C1A 100%)" }}
      >
        {/* mesh glow blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #0F7A72, transparent 70%)" }} />
        <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #FF6B47, transparent 70%)" }} />

        {/* floating skill pills */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {SKILLS.map((skill, i) => (
            <span
              key={skill}
              className="absolute text-xs font-medium px-3 py-1 rounded-full border border-white/10 text-white/30"
              style={{
                left: `${8 + (i * 17) % 80}%`,
                bottom: `-${20 + (i * 13) % 20}px`,
                animation: `floatUp ${8 + (i % 5) * 2}s ${(i * 0.7) % 6}s linear infinite`,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        <style>{`
          @keyframes floatUp {
            0%   { transform: translateY(0)   opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 0.6; }
            100% { transform: translateY(-110vh); opacity: 0; }
          }
        `}</style>

        {/* content */}
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* logo */}
          <Link href="/" className="text-white">
            <Logo />
          </Link>

          {/* headline */}
          <div className="flex-1 flex flex-col justify-center mt-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-4">
              Your career, accelerated
            </p>
            <h1 className="font-display text-4xl xl:text-5xl text-white leading-tight mb-6">
              Match your skills<br />
              to roles that<br />
              <span style={{ color: "#0F7A72" }}>actually fit.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-xs mb-10">
              SkillWarehouse connects verified skills with the right jobs, the right learning, and the right people.
            </p>

            {/* feature list */}
            <div className="space-y-4 mb-12">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(15,122,114,0.2)" }}>
                    <Icon size={15} style={{ color: "#0F7A72" }} />
                  </div>
                  <span className="text-sm text-white/70">{text}</span>
                </div>
              ))}
            </div>

            {/* social proof */}
            <div className="flex items-center gap-6 pt-8 border-t border-white/10">
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-white">10k+</p>
                <p className="text-xs text-white/40 mt-0.5">Professionals</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-white">500+</p>
                <p className="text-xs text-white/40 mt-0.5">Courses</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-white">200+</p>
                <p className="text-xs text-white/40 mt-0.5">Companies hiring</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-paper overflow-y-auto">
        {/* mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/"><Logo /></Link>
        </div>

        <div className="w-full max-w-md">
          {/* header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl text-ink font-bold mb-2">Create your account</h2>
            <p className="text-muted text-sm">
              Already have one?{" "}
              <Link href="/login" className="text-teal font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* name + email row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                  Full name
                </label>
                <input
                  required
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Lee"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* password */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            {/* role selector */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                I'm joining as…
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon    = opt.icon;
                  const active  = role === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setRole(opt.value)}
                      className={cn(
                        "relative flex flex-col items-center text-center gap-2.5 rounded-xl border-2 px-3 py-4 transition-all duration-150",
                        active
                          ? `${opt.activeRing} bg-paper shadow-md`
                          : "border-border hover:border-muted bg-white"
                      )}
                    >
                      {active && (
                        <CheckCircle2 size={14}
                          className={cn("absolute top-2 right-2", opt.iconColor)} />
                      )}
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                        opt.gradient
                      )}>
                        <Icon size={18} className={opt.iconColor} />
                      </div>
                      <div>
                        <p className={cn(
                          "text-xs font-bold leading-tight",
                          active ? "text-ink" : "text-muted"
                        )}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-muted leading-tight mt-0.5 hidden sm:block">
                          {opt.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted mt-2">
                Just a starting point — every account can explore everything.
              </p>
            </div>

            {error && (
              <p className="text-sm text-coral bg-coral/5 border border-coral/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full text-base py-3 flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                : <><span>Create free account</span><ArrowRight size={16} /></>
              }
            </button>

            <p className="text-[11px] text-muted text-center leading-relaxed">
              By creating an account you agree to our{" "}
              <Link href="#" className="underline hover:text-ink">Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" className="underline hover:text-ink">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
