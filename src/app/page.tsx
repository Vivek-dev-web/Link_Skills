import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Briefcase, GraduationCap, ArrowRight, MapPin } from "lucide-react";
import { getCurrentSession } from "@/lib/session";
import Logo from "@/components/Logo";

export default async function LandingPage() {
  const session = await getCurrentSession();
  if (session?.user) redirect("/feed");

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
            <Link href="/register" className="btn-accent">
              Join Atlas
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="chip-coral mb-5">
            <MapPin size={12} /> One map, three destinations
          </span>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink mb-6">
            Navigate your <em className="not-italic text-coral">whole</em> career, not just the next job.
          </h1>
          <p className="text-muted text-lg max-w-md mb-8">
            Atlas connects the people you work with, the roles worth chasing, and the skills
            that get you there — in one place, instead of three different tabs.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/register" className="btn-accent">
              Create your account <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-outline">
              I already have one
            </Link>
          </div>
        </div>

        {/* Signature route-line visual: a career path */}
        <div className="card p-8">
          <p className="label mb-5">A career, mapped</p>
          <div className="route-line space-y-7">
            <div className="relative">
              <span className="route-node-done" />
              <p className="font-medium text-ink text-sm">Built a profile, connected with 40 peers</p>
              <p className="text-xs text-muted mt-0.5">Professional networking</p>
            </div>
            <div className="relative">
              <span className="route-node-done" />
              <p className="font-medium text-ink text-sm">Completed "Data Analysis with SQL"</p>
              <p className="text-xs text-muted mt-0.5">Training &amp; certification</p>
            </div>
            <div className="relative">
              <span className="route-node" />
              <p className="font-medium text-ink text-sm">Applied to Senior Analyst at a growing startup</p>
              <p className="text-xs text-muted mt-0.5">Job openings — in progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="h-10 w-10 rounded-full bg-coral-light flex items-center justify-center mb-4">
              <Users size={18} className="text-coral-dark" />
            </div>
            <h3 className="font-display text-xl text-ink mb-2">Network with intent</h3>
            <p className="text-sm text-muted">
              Build a profile that shows your real experience, connect with people who matter
              to your work, and keep up through a feed that's actually about your field.
            </p>
          </div>
          <div className="card p-6">
            <div className="h-10 w-10 rounded-full bg-teal-light flex items-center justify-center mb-4">
              <Briefcase size={18} className="text-teal-dark" />
            </div>
            <h3 className="font-display text-xl text-ink mb-2">Find roles worth taking</h3>
            <p className="text-sm text-muted">
              Filter by what actually matters — pay, location, work type, skills — and apply
              with one click using the profile you've already built.
            </p>
          </div>
          <div className="card p-6">
            <div className="h-10 w-10 rounded-full bg-amber-light flex items-center justify-center mb-4">
              <GraduationCap size={18} className="text-amber-dark" />
            </div>
            <h3 className="font-display text-xl text-ink mb-2">Close the skill gap</h3>
            <p className="text-sm text-muted">
              Take courses built around the skills the jobs you want actually require, and
              walk away with a certificate that lands straight on your profile.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-muted">
          <span>© {new Date().getFullYear()} Atlas</span>
          <span>Built for job seekers, professionals, recruiters, and training providers.</span>
        </div>
      </footer>
    </div>
  );
}
