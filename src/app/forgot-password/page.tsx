"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setDone(true);
    if (data.resetUrl) setResetUrl(data.resetUrl);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll help you get back in."
      footer={
        <Link href="/login" className="text-coral font-medium">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <div className="text-sm">
          <div className="flex items-center gap-2 text-teal-dark mb-3">
            <CheckCircle2 size={18} />
            <p>If that email exists, a reset link was created.</p>
          </div>
          {resetUrl && (
            <div className="rounded-lg bg-paper border border-border p-3">
              <p className="text-xs text-muted mb-2">
                No email service is configured in this local build, so here's your link directly:
              </p>
              <Link href={resetUrl} className="text-coral font-medium break-all text-xs">
                {resetUrl}
              </Link>
            </div>
          )}
        </div>
      ) : (
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
          <button type="submit" disabled={loading} className="btn-accent w-full">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}
