"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2, Briefcase, GraduationCap, User } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Job seeker / professional", icon: User },
  { value: "RECRUITER", label: "Recruiter / hiring", icon: Briefcase },
  { value: "PROVIDER", label: "Training provider", icon: GraduationCap },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]["value"]>("MEMBER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      const signinRes = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (signinRes?.error) {
        router.push("/login");
        return;
      }
      router.push("/feed");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="It only takes a minute to get started."
      footer={
        <>
          Already on SkillWarehouse?{" "}
          <Link href="/login" className="text-coral font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="label">Password</label>
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
        <div>
          <label className="label">I'm here primarily to…</label>
          <div className="space-y-2">
            {ROLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors",
                    role === opt.value ? "border-ink bg-paper" : "border-border hover:bg-paper"
                  )}
                >
                  <Icon size={16} className={role === opt.value ? "text-coral" : "text-muted"} />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-1.5">
            Just a starting point — every account can post jobs, take courses, and build a
            network.
          </p>
        </div>
        {error && <p className="text-sm text-coral-dark">{error}</p>}
        <button type="submit" disabled={loading} className="btn-accent w-full">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create account
        </button>
      </form>
    </AuthShell>
  );
}
