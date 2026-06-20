"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/Toast";

const PREF_GROUPS: { key: string; label: string; description: string }[] = [
  { key: "connections", label: "Connections", description: "Requests, acceptances" },
  { key: "engagement", label: "Engagement", description: "Likes and comments on your posts" },
  { key: "jobs", label: "Jobs", description: "New matches and application updates" },
  { key: "courses", label: "Courses", description: "Enrollments and course updates" },
  { key: "messages", label: "Messages", description: "New direct messages" },
];

export default function SettingsPage() {
  const { show } = useToast();
  const [prefs, setPrefs] = useState<any>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then((r) => r.json())
      .then(setPrefs);
  }, []);

  async function savePrefs() {
    setSavingPrefs(true);
    const res = await fetch("/api/settings/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setSavingPrefs(false);
    if (res.ok) show("Notification preferences saved", "success");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    const res = await fetch("/api/settings/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSavingPassword(false);
    if (res.ok) {
      show("Password updated", "success");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      show(data.error ?? "Couldn't update password", "error");
    }
  }

  async function deactivate() {
    if (!confirm("Deactivate your account? You can ask an admin to reactivate it later.")) return;
    await fetch("/api/settings/deactivate", { method: "POST" });
    signOut({ callbackUrl: "/" });
  }

  async function deleteAccount() {
    if (confirmText !== "DELETE") return show('Type "DELETE" to confirm', "error");
    await fetch("/api/settings/delete", { method: "POST" });
    signOut({ callbackUrl: "/" });
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="font-display text-2xl text-ink">Settings</h1>

      <div className="card p-5">
        <h2 className="font-display text-lg text-ink mb-1">Notification preferences</h2>
        <p className="text-xs text-muted mb-4">Choose what you hear about, and where.</p>
        {!prefs ? (
          <Loader2 className="animate-spin text-muted" />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_70px_70px] gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <span>Category</span>
              <span className="text-center">In-app</span>
              <span className="text-center">Email</span>
            </div>
            {PREF_GROUPS.map((g) => (
              <div key={g.key} className="grid grid-cols-[1fr_70px_70px] gap-2 items-center">
                <div>
                  <p className="text-sm text-ink">{g.label}</p>
                  <p className="text-xs text-muted">{g.description}</p>
                </div>
                <input
                  type="checkbox"
                  className="justify-self-center"
                  checked={prefs[`${g.key}InApp`]}
                  onChange={(e) => setPrefs((p: any) => ({ ...p, [`${g.key}InApp`]: e.target.checked }))}
                />
                <input
                  type="checkbox"
                  className="justify-self-center"
                  checked={prefs[`${g.key}Email`]}
                  onChange={(e) => setPrefs((p: any) => ({ ...p, [`${g.key}Email`]: e.target.checked }))}
                />
              </div>
            ))}
            <button onClick={savePrefs} disabled={savingPrefs} className="btn-accent btn-sm mt-2">
              {savingPrefs && <Loader2 size={14} className="animate-spin" />} Save preferences
            </button>
          </div>
        )}
      </div>

      <form onSubmit={changePassword} className="card p-5 space-y-3">
        <h2 className="font-display text-lg text-ink">Change password</h2>
        <div>
          <label className="label">Current password</label>
          <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" minLength={8} required className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={savingPassword} className="btn-accent btn-sm">
          {savingPassword && <Loader2 size={14} className="animate-spin" />} Update password
        </button>
      </form>

      <div className="card p-5 space-y-3">
        <h2 className="font-display text-lg text-ink">Privacy</h2>
        <p className="text-sm text-muted">
          Profile visibility (public / connections-only / private) is managed from your{" "}
          <a href="/profile/edit" className="text-coral font-medium">profile editor</a>.
        </p>
      </div>

      <div className="card p-5 space-y-4 border-coral/30">
        <h2 className="font-display text-lg text-ink flex items-center gap-2">
          <AlertTriangle size={16} className="text-coral" /> Danger zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">Deactivate account</p>
            <p className="text-xs text-muted">Hides your profile. You can come back any time.</p>
          </div>
          <button onClick={deactivate} className="btn-outline btn-sm">Deactivate</button>
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-sm text-ink font-medium mb-1">Delete account</p>
          <p className="text-xs text-muted mb-2">
            Permanently deletes your profile, posts, connections, applications, and enrollments. This can't be undone.
          </p>
          <div className="flex items-center gap-2">
            <input
              className="input flex-1"
              placeholder='Type "DELETE" to confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <button onClick={deleteAccount} className="btn-accent btn-sm !bg-coral-dark shrink-0">
              Delete forever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
