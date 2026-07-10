import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users, Briefcase, GraduationCap, ArrowRight, Sparkles,
  CheckCircle, TrendingUp, Shield, Zap, Star, BarChart2,
} from "lucide-react";
import { getCurrentSession } from "@/lib/session";
import Logo from "@/components/Logo";

export default async function LandingPage() {
  const session = await getCurrentSession();
  if (session?.user) redirect("/feed");

  return (
    <div className="min-h-screen bg-paper">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-white/10 bg-brand/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-white">
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-outline-white btn-sm">Sign in</Link>
            <Link href="/register" className="btn-accent">Get started →</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="mesh-hero text-white py-24 px-4 relative overflow-hidden">
        {/* decorative rings */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center relative">
          {/* left */}
          <div className="animate-fade-up">
            <span className="section-pill-teal mb-6 inline-flex">
              <Sparkles size={12} /> AI-powered career platform
            </span>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.08] mb-6 font-bold">
              Match your{" "}
              <span className="gradient-text-teal">skills</span>
              <br />to the roles<br />that actually fit.
            </h1>
            <p className="text-white/65 text-lg max-w-md mb-10 leading-relaxed">
              SkillWarehouse connects your verified skills to the right jobs,
              the right people, and the right courses — in one place, not three
              different tabs.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-12">
              <Link href="/register" className="btn-accent text-base px-6 py-3">
                Create free account <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn-outline-white text-base px-6 py-3">
                Sign in
              </Link>
            </div>
            {/* social proof */}
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <div className="flex -space-x-2">
                {["A","P","M","L","N"].map((l) => (
                  <div key={l} className="w-7 h-7 rounded-full bg-teal/30 border-2 border-brand flex items-center justify-center text-[10px] font-bold text-teal">{l}</div>
                ))}
              </div>
              <span>Join <span className="text-white font-semibold">10,000+</span> professionals already on SkillWarehouse</span>
            </div>
          </div>

          {/* right — platform preview card */}
          <div className="card-glass p-6 space-y-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            {/* profile row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white font-bold text-sm shrink-0">PR</div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Priya Nair</p>
                <p className="text-white/50 text-xs">Data Analyst · Bangalore, IN</p>
              </div>
              <span className="badge-new text-[10px]">● Active</span>
            </div>
            {/* skills */}
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wide font-semibold mb-2">Verified skills</p>
              <div className="flex flex-wrap gap-1.5">
                {["Python","SQL","Pandas","Machine Learning","Power BI"].map((s) => (
                  <span key={s} className="text-[11px] bg-white/8 border border-white/12 text-white/70 rounded-full px-2.5 py-0.5 font-medium">{s}</span>
                ))}
              </div>
            </div>
            {/* job matches */}
            <div className="border-t border-white/10 pt-4 space-y-2.5">
              <p className="text-white/40 text-[10px] uppercase tracking-wide font-semibold">Top matches</p>
              {[
                { title: "Data Scientist", company: "DataVault AI", match: "96%" },
                { title: "ML Engineer", company: "CloudNine", match: "91%" },
                { title: "Analytics Lead", company: "Bluepeak", match: "88%" },
              ].map((j) => (
                <div key={j.title} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-xs font-medium">{j.title}</p>
                    <p className="text-white/40 text-[10px]">{j.company}</p>
                  </div>
                  <span className="text-teal text-xs font-bold">{j.match}</span>
                </div>
              ))}
            </div>
            {/* recommended course */}
            <div className="bg-teal/10 border border-teal/20 rounded-xl p-3">
              <p className="text-teal text-[10px] font-bold uppercase tracking-wide mb-1">Recommended course</p>
              <p className="text-white text-xs font-medium">Machine Learning with PyTorch</p>
              <p className="text-white/40 text-[10px] mt-0.5">Closes the gap for 3 of your target roles</p>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="max-w-6xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: "10k+",  label: "Professionals" },
            { n: "500+",  label: "Courses & materials" },
            { n: "200+",  label: "Hiring companies" },
            { n: "94%",   label: "Placement rate" },
          ].map(({ n, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-4xl font-bold text-white mb-1">{n}</p>
              <p className="text-white/45 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <span className="section-pill-violet mb-4 inline-flex">
            <Zap size={12} /> Everything in one place
          </span>
          <h2 className="font-display text-4xl text-ink mb-4">
            One platform, your entire career
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            From first job to senior lead — SkillWarehouse has the tools,
            courses, and network to get you there faster.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: <Users size={22} />, bubble: "icon-bubble-teal",
              title: "Network with intent",
              desc: "Build a skill-first profile. Connect with people who share your domain. See who's mutual before you reach out.",
              chip: "chip-teal", chipLabel: "Connections",
            },
            {
              icon: <Briefcase size={22} />, bubble: "icon-bubble-coral",
              title: "Find roles worth taking",
              desc: "Filter by salary, remote, skills, and experience level. Apply in one click using the profile you've already built.",
              chip: "chip-coral", chipLabel: "Jobs",
            },
            {
              icon: <GraduationCap size={22} />, bubble: "icon-bubble-amber",
              title: "Close the skill gap",
              desc: "Take courses built around the skills the jobs you want actually require. Earn certificates that land on your profile.",
              chip: "chip-amber", chipLabel: "Learning",
            },
            {
              icon: <Sparkles size={22} />, bubble: "icon-bubble-violet",
              title: "AI career guidance",
              desc: "Tell us where you are and where you want to go. Get personalised roadmaps, course picks, and mentor connections.",
              chip: "chip-violet", chipLabel: "Guidance",
            },
            {
              icon: <TrendingUp size={22} />, bubble: "icon-bubble-coral",
              title: "Salary insights",
              desc: "Browse real compensation data by role, company, and city. Add your own salary to help the community.",
              chip: "chip-coral", chipLabel: "Salaries",
            },
            {
              icon: <BarChart2 size={22} />, bubble: "icon-bubble-teal",
              title: "Recruiter portal",
              desc: "Post jobs, search candidates by skill, and manage your applicant pipeline — all in one clean dashboard.",
              chip: "chip-teal", chipLabel: "Hire",
            },
          ].map((f) => (
            <div key={f.title} className="card-glow p-6 group">
              <div className={`${f.bubble} mb-4 transition-transform group-hover:scale-110 duration-200`}>{f.icon}</div>
              <h3 className="font-display text-xl text-ink mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-4">{f.desc}</p>
              <span className={f.chip}>{f.chipLabel}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="section-teal py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-pill-teal mb-4 inline-flex">
              <CheckCircle size={12} /> Simple to start
            </span>
            <h2 className="font-display text-4xl text-ink mb-4">Up and running in minutes</h2>
            <p className="text-muted max-w-lg mx-auto">No long onboarding. Build your profile, get matched, start learning.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01", color: "text-teal",
                title: "Build your skill profile",
                desc: "Add your experience, education, and skills. Endorse peers. The profile works on its own — no need to attach a resume.",
              },
              {
                n: "02", color: "gradient-text-violet",
                title: "Get matched automatically",
                desc: "Our recommendation engine scans open roles and surfaces the ones where your skills overlap with what's needed — sorted by fit.",
              },
              {
                n: "03", color: "gradient-text-warm",
                title: "Learn, grow, get hired",
                desc: "Close skill gaps with targeted courses. Earn certificates. Apply with one click and track your pipeline in one place.",
              },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <p className={`font-display text-6xl font-bold mb-4 ${s.color}`}>{s.n}</p>
                <h3 className="font-display text-xl text-ink mb-3">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses preview ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="section-pill-coral mb-3 inline-flex">
              <GraduationCap size={12} /> Learning library
            </span>
            <h2 className="font-display text-4xl text-ink">Study materials & courses</h2>
          </div>
          <Link href="/courses" className="btn-outline flex items-center gap-2">
            Browse all courses <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Next.js 15 Production Masterclass", level: "ADVANCED",   color: "bg-teal/8   border-teal/20",   dot: "bg-teal",   icon: "⚡" },
            { title: "Python for Data Science",           level: "BEGINNER",   color: "bg-amber/8  border-amber/20",  dot: "bg-amber",  icon: "🐍" },
            { title: "Docker & Kubernetes",               level: "INTERMEDIATE",color: "bg-coral/8  border-coral/20",  dot: "bg-coral",  icon: "🐳" },
            { title: "Machine Learning with PyTorch",     level: "ADVANCED",   color: "bg-violet/8 border-violet/20", dot: "bg-violet", icon: "🤖" },
          ].map((c) => (
            <Link href="/courses" key={c.title} className={`card p-4 border ${c.color} hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="text-3xl mb-3">{c.icon}</div>
              <p className="font-semibold text-ink text-sm mb-2 leading-snug">{c.title}</p>
              <div className="flex items-center gap-1.5 mt-auto">
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                <span className="text-[10px] text-muted font-medium">{c.level.charAt(0) + c.level.slice(1).toLowerCase()}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Social proof ───────────────────────────────────── */}
      <section className="section-violet py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { quote: "Found my first data role in 3 weeks after completing the SQL course and building my profile.", author: "Priya N.", role: "Data Analyst", rating: 5 },
            { quote: "The recruiter portal saves me hours every week. Pipeline management and candidate search in one place.", author: "Jordan K.", role: "Talent Lead", rating: 5 },
            { quote: "The AI guidance section mapped out exactly what I needed to learn to move from mid to senior.", author: "Liam C.", role: "Backend Engineer", rating: 5 },
          ].map((t) => (
            <div key={t.author} className="card p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="#F59E0B" className="text-amber" />
                ))}
              </div>
              <p className="text-sm text-ink leading-relaxed mb-4">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-ink">{t.author}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────── */}
      <section className="mesh-hero py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="section-pill-teal mb-6 inline-flex">
            <Shield size={12} /> Free forever for job seekers
          </span>
          <h2 className="font-display text-5xl text-white mb-6 leading-tight">
            Your next career move<br />starts here.
          </h2>
          <p className="text-white/55 text-lg mb-10 max-w-lg mx-auto">
            Build your profile in 5 minutes. Get matched to real jobs.
            Learn what you need. No credit card required.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register" className="btn-accent text-base px-8 py-3">
              Create your free account <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-outline-white text-base px-8 py-3">
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-brand border-t border-white/8 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white/80">
              <Logo />
            </div>
            <div className="flex items-center gap-6 text-xs text-white/35">
              <span>© {new Date().getFullYear()} SkillWarehouse</span>
              <span>·</span>
              <span>Built for job seekers, professionals, recruiters, and training providers.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
