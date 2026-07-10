"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";

const ROLE_HOME: Record<string, string> = {
  MEMBER:    "/feed",
  RECRUITER: "/hire",
  PROVIDER:  "/courses",
};
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Incorrect email or password." : res.error);
      return;
    }
    // callbackUrl takes priority (e.g. user was bounced to login mid-flow)
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl) {
      router.push(callbackUrl);
    } else {
      const session = await getSession();
      const role = (session?.user as any)?.role as string | undefined;
      router.push(ROLE_HOME[role ?? ""] ?? "/feed");
    }
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep building your career."
      footer={
        <>
          New to SkillWarehouse?{" "}
          <Link href="/register" className="text-coral font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link href="/forgot-password" className="text-xs text-coral font-medium">
              Forgot it?
            </Link>
          </div>
          <input
            type="password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-coral-dark">{error}</p>}
        <button type="submit" disabled={loading} className="btn-accent w-full">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Sign in
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-border text-xs text-muted">
        Demo account (seeded): <br />
        <code className="font-mono">alex@atlas.dev</code> ·{" "}
        <code className="font-mono">password123</code>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
