"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Pencil, Trash2, Upload, FileText, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import SkillTagInput from "@/components/SkillTagInput";
import CompletenessBar from "@/components/profile/CompletenessBar";
import { useToast } from "@/components/Toast";
import { profileCompleteness, formatDateRange } from "@/lib/utils";
import { VISIBILITY } from "@/lib/constants";

const emptyExp = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" };
const emptyEdu = { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" };

export default function ProfileEditPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { show } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [expForm, setExpForm] = useState<any | null>(null);
  const [eduForm, setEduForm] = useState<any | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/users/${(session.user as any).id}`)
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setLoading(false);
      });
  }, [session]);

  if (loading || !profile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  async function saveBasics(field: string, value: any) {
    setProfile((p: any) => ({ ...p, [field]: value }));
  }

  async function submitBasics(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        headline: profile.headline,
        about: profile.about,
        location: profile.location,
        currentRole: profile.currentRole,
        currentCompany: profile.currentCompany,
        visibility: profile.visibility,
      }),
    });
    setSaving(false);
    if (res.ok) {
      show("Profile updated", "success");
      await update({ name: profile.name, image: profile.image });
    } else {
      show("Couldn't save your profile", "error");
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "photos");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) return show(data.error ?? "Upload failed", "error");
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: data.url }),
    });
    setProfile((p: any) => ({ ...p, image: data.url }));
    await update({ image: data.url });
    show("Photo updated", "success");
  }

  async function handleRemovePhoto() {
    if (!confirm("Remove your profile photo?")) return;
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: null }),
    });
    setProfile((p: any) => ({ ...p, image: null }));
    await update({ image: null });
    show("Photo removed", "success");
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "resumes");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) return show(data.error ?? "Upload failed", "error");
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeUrl: data.url }),
    });
    setProfile((p: any) => ({ ...p, resumeUrl: data.url }));
    show("Resume uploaded", "success");
  }

  async function submitExperience() {
    if (!expForm.title || !expForm.company || !expForm.startDate) {
      return show("Title, company, and start date are required", "error");
    }
    const method = expForm.id ? "PUT" : "POST";
    const url = expForm.id ? `/api/profile/experience/${expForm.id}` : "/api/profile/experience";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expForm),
    });
    const data = await res.json();
    if (!res.ok) return show(data.error ?? "Couldn't save", "error");
    setProfile((p: any) => ({
      ...p,
      experiences: expForm.id
        ? p.experiences.map((x: any) => (x.id === data.id ? data : x))
        : [data, ...p.experiences],
    }));
    setExpForm(null);
  }

  async function deleteExperience(id: string) {
    if (!confirm("Remove this experience?")) return;
    await fetch(`/api/profile/experience/${id}`, { method: "DELETE" });
    setProfile((p: any) => ({ ...p, experiences: p.experiences.filter((x: any) => x.id !== id) }));
  }

  async function submitEducation() {
    if (!eduForm.school || !eduForm.startDate) return show("School and start date are required", "error");
    const method = eduForm.id ? "PUT" : "POST";
    const url = eduForm.id ? `/api/profile/education/${eduForm.id}` : "/api/profile/education";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eduForm),
    });
    const data = await res.json();
    if (!res.ok) return show(data.error ?? "Couldn't save", "error");
    setProfile((p: any) => ({
      ...p,
      education: eduForm.id ? p.education.map((x: any) => (x.id === data.id ? data : x)) : [data, ...p.education],
    }));
    setEduForm(null);
  }

  async function deleteEducation(id: string) {
    if (!confirm("Remove this education entry?")) return;
    await fetch(`/api/profile/education/${id}`, { method: "DELETE" });
    setProfile((p: any) => ({ ...p, education: p.education.filter((x: any) => x.id !== id) }));
  }

  async function addSkill(name: string) {
    const res = await fetch("/api/profile/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) setProfile((p: any) => ({ ...p, skills: [...p.skills, data] }));
  }

  async function removeSkill(name: string) {
    const skill = profile.skills.find((s: any) => s.skill.name === name);
    if (!skill) return;
    await fetch(`/api/profile/skills/${skill.id}`, { method: "DELETE" });
    setProfile((p: any) => ({ ...p, skills: p.skills.filter((s: any) => s.id !== skill.id) }));
  }

  const completeness = profileCompleteness(profile);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Edit your profile</h1>
        <button onClick={() => router.push(`/profile/${profile.id}`)} className="btn-outline btn-sm">
          View profile
        </button>
      </div>

      <CompletenessBar percent={completeness} />

      {/* Photo + resume */}
      <div className="card p-5 flex items-center gap-5">
        <Avatar name={profile.name} src={profile.image} size="xl" />
        <div className="space-y-2">
          <button onClick={() => photoInputRef.current?.click()} className="btn-outline btn-sm">
            <Upload size={14} /> Change photo
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
          {profile.image && (
            <button onClick={handleRemovePhoto} className="btn-outline btn-sm text-coral border-coral/40 hover:bg-coral/5">
              <X size={14} /> Remove photo
            </button>
          )}
          <div>
            <button onClick={() => resumeInputRef.current?.click()} className="btn-outline btn-sm">
              <FileText size={14} /> {profile.resumeUrl ? "Replace resume" : "Upload resume"}
            </button>
            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" hidden onChange={handleResumeUpload} />
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-coral ml-2">
                View current
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Basics */}
      <form onSubmit={submitBasics} className="card p-5 space-y-4">
        <h2 className="font-display text-lg text-ink">Basics</h2>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={profile.name} onChange={(e) => saveBasics("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Headline</label>
          <input
            className="input"
            placeholder="e.g. Senior Product Designer at Northwind"
            value={profile.headline ?? ""}
            onChange={(e) => saveBasics("headline", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Current role</label>
            <input className="input" value={profile.currentRole ?? ""} onChange={(e) => saveBasics("currentRole", e.target.value)} />
          </div>
          <div>
            <label className="label">Current company</label>
            <input className="input" value={profile.currentCompany ?? ""} onChange={(e) => saveBasics("currentCompany", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Location</label>
          <input className="input" value={profile.location ?? ""} onChange={(e) => saveBasics("location", e.target.value)} />
        </div>
        <div>
          <label className="label">About</label>
          <textarea
            className="textarea min-h-[100px]"
            value={profile.about ?? ""}
            onChange={(e) => saveBasics("about", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Who can see your profile</label>
          <select className="input" value={profile.visibility} onChange={(e) => saveBasics("visibility", e.target.value)}>
            {VISIBILITY.map((v) => (
              <option key={v} value={v}>
                {v === "PUBLIC" ? "Everyone" : v === "CONNECTIONS" ? "Connections only" : "Only me"}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={saving} className="btn-accent">
          {saving && <Loader2 size={14} className="animate-spin" />} Save basics
        </button>
      </form>

      {/* Experience */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink">Experience</h2>
          <button onClick={() => setExpForm({ ...emptyExp })} className="btn-outline btn-sm">
            <Plus size={14} /> Add
          </button>
        </div>

        {expForm && (
          <ExperienceFormFields
            value={expForm}
            onChange={setExpForm}
            onCancel={() => setExpForm(null)}
            onSubmit={submitExperience}
          />
        )}

        <div className="route-line space-y-5 mt-4">
          {profile.experiences.map((exp: any) => (
            <div key={exp.id} className="relative">
              <span className={exp.current ? "route-node-done" : "route-node"} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm text-ink">{exp.title}</p>
                  <p className="text-xs text-muted">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                  <p className="text-xs text-muted">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                  {exp.description && <p className="text-sm text-ink mt-1">{exp.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() =>
                      setExpForm({
                        ...exp,
                        startDate: exp.startDate?.slice(0, 10),
                        endDate: exp.endDate?.slice(0, 10) ?? "",
                      })
                    }
                    className="text-muted hover:text-ink p-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteExperience(exp.id)} className="text-muted hover:text-coral p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {profile.experiences.length === 0 && <p className="text-sm text-muted">No experience added yet.</p>}
        </div>
      </div>

      {/* Education */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink">Education</h2>
          <button onClick={() => setEduForm({ ...emptyEdu })} className="btn-outline btn-sm">
            <Plus size={14} /> Add
          </button>
        </div>

        {eduForm && (
          <EducationFormFields
            value={eduForm}
            onChange={setEduForm}
            onCancel={() => setEduForm(null)}
            onSubmit={submitEducation}
          />
        )}

        <div className="route-line space-y-5 mt-4">
          {profile.education.map((edu: any) => (
            <div key={edu.id} className="relative">
              <span className="route-node-done" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm text-ink">{edu.school}</p>
                  <p className="text-xs text-muted">
                    {[edu.degree, edu.field].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-muted">{formatDateRange(edu.startDate, edu.endDate, false)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() =>
                      setEduForm({ ...edu, startDate: edu.startDate?.slice(0, 10), endDate: edu.endDate?.slice(0, 10) ?? "" })
                    }
                    className="text-muted hover:text-ink p-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteEducation(edu.id)} className="text-muted hover:text-coral p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {profile.education.length === 0 && <p className="text-sm text-muted">No education added yet.</p>}
        </div>
      </div>

      {/* Skills */}
      <div className="card p-5">
        <h2 className="font-display text-lg text-ink mb-3">Skills</h2>
        <SkillTagInput
          skills={profile.skills.map((s: any) => s.skill.name)}
          onAdd={addSkill}
          onRemove={removeSkill}
        />
      </div>
    </div>
  );
}

function ExperienceFormFields({ value, onChange, onCancel, onSubmit }: any) {
  return (
    <div className="rounded-lg border border-border p-4 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="Title" value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
        <input className="input" placeholder="Company" value={value.company} onChange={(e) => onChange({ ...value, company: e.target.value })} />
      </div>
      <input className="input" placeholder="Location (optional)" value={value.location ?? ""} onChange={(e) => onChange({ ...value, location: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={value.startDate} onChange={(e) => onChange({ ...value, startDate: e.target.value })} />
        </div>
        <div>
          <label className="label">End date</label>
          <input
            type="date"
            className="input"
            value={value.endDate ?? ""}
            disabled={value.current}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={value.current} onChange={(e) => onChange({ ...value, current: e.target.checked, endDate: "" })} />
        I currently work here
      </label>
      <textarea className="textarea" placeholder="Description (optional)" value={value.description ?? ""} onChange={(e) => onChange({ ...value, description: e.target.value })} />
      <div className="flex gap-2">
        <button onClick={onSubmit} className="btn-accent btn-sm">Save</button>
        <button onClick={onCancel} className="btn-ghost btn-sm">Cancel</button>
      </div>
    </div>
  );
}

function EducationFormFields({ value, onChange, onCancel, onSubmit }: any) {
  return (
    <div className="rounded-lg border border-border p-4 mb-4 space-y-3">
      <input className="input" placeholder="School" value={value.school} onChange={(e) => onChange({ ...value, school: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="Degree (optional)" value={value.degree ?? ""} onChange={(e) => onChange({ ...value, degree: e.target.value })} />
        <input className="input" placeholder="Field of study (optional)" value={value.field ?? ""} onChange={(e) => onChange({ ...value, field: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={value.startDate} onChange={(e) => onChange({ ...value, startDate: e.target.value })} />
        </div>
        <div>
          <label className="label">End date (optional)</label>
          <input type="date" className="input" value={value.endDate ?? ""} onChange={(e) => onChange({ ...value, endDate: e.target.value })} />
        </div>
      </div>
      <textarea className="textarea" placeholder="Description (optional)" value={value.description ?? ""} onChange={(e) => onChange({ ...value, description: e.target.value })} />
      <div className="flex gap-2">
        <button onClick={onSubmit} className="btn-accent btn-sm">Save</button>
        <button onClick={onCancel} className="btn-ghost btn-sm">Cancel</button>
      </div>
    </div>
  );
}
