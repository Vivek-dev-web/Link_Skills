"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Loader2,
  UserPlus,
  Clock,
  MessageCircle,
  Pencil,
  MapPin,
  FileText,
  Award,
  ThumbsUp,
  Ban,
  Rss,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import CompletenessBar from "@/components/profile/CompletenessBar";
import { formatDateRange, profileCompleteness } from "@/lib/utils";
import { useToast } from "@/components/Toast";

export default function ProfileViewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const { show } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const myId = (session?.user as any)?.id;
  const isOwner = myId === id;

  async function load() {
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't load profile");
      return;
    }
    setProfile(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return <div className="card p-8 text-center text-muted">{error}</div>;
  }
  if (!profile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  async function sendConnectionRequest() {
    setBusy(true);
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresseeId: id }),
    });
    setBusy(false);
    if (res.ok) {
      show("Connection request sent", "success");
      load();
    } else {
      const d = await res.json();
      show(d.error ?? "Couldn't send request", "error");
    }
  }

  async function toggleFollow() {
    setBusy(true);
    if (profile.isFollowing) {
      await fetch(`/api/follow/${id}`, { method: "DELETE" });
    } else {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followeeId: id }),
      });
    }
    setBusy(false);
    load();
  }

  async function startConversation() {
    setBusy(true);
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) router.push(`/messages?c=${data.id}`);
    else show(data.error ?? "You can only message your connections", "error");
  }

  async function endorse(userSkillId: string) {
    const res = await fetch(`/api/profile/skills/${userSkillId}/endorse`, { method: "POST" });
    if (res.ok) load();
  }

  async function blockUser() {
    if (!confirm(`Block ${profile.name}? This removes any connection between you.`)) return;
    await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    show("User blocked", "success");
    router.push("/connections");
  }

  const completeness = isOwner ? profileCompleteness(profile) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {isOwner && completeness !== null && completeness < 100 && <CompletenessBar percent={completeness} />}

      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-coral-light via-amber-light to-teal-light" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between">
            <Avatar name={profile.name} src={profile.image} size="xl" className="ring-4 ring-surface" />
            {isOwner ? (
              <Link href="/profile/edit" className="btn-outline btn-sm mb-2">
                <Pencil size={14} /> Edit profile
              </Link>
            ) : (
              <div className="flex gap-2 mb-2">
                {profile.connectionStatus === "ACCEPTED" ? (
                  <button onClick={startConversation} disabled={busy} className="btn-accent btn-sm">
                    <MessageCircle size={14} /> Message
                  </button>
                ) : profile.connectionStatus === "PENDING" ? (
                  <button disabled className="btn-outline btn-sm">
                    <Clock size={14} /> Pending
                  </button>
                ) : (
                  <button onClick={sendConnectionRequest} disabled={busy} className="btn-accent btn-sm">
                    <UserPlus size={14} /> Connect
                  </button>
                )}
                <button onClick={toggleFollow} disabled={busy} className="btn-outline btn-sm">
                  <Rss size={14} /> {profile.isFollowing ? "Following" : "Follow"}
                </button>
                <button onClick={blockUser} className="btn-ghost btn-sm !px-2 text-muted" title="Block">
                  <Ban size={14} />
                </button>
              </div>
            )}
          </div>

          <h1 className="font-display text-2xl text-ink mt-2">{profile.name}</h1>
          {profile.headline && <p className="text-ink">{profile.headline}</p>}
          <div className="flex items-center gap-3 text-sm text-muted mt-1">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {profile.location}
              </span>
            )}
            <span>{profile.connectionCount ?? 0} connections</span>
            <span>{profile.followerCount ?? 0} followers</span>
          </div>

          {profile.limitedVisibility && (
            <p className="mt-3 text-xs text-muted bg-paper rounded-lg px-3 py-2">
              This member limits their profile to connections. Connect to see more.
            </p>
          )}
        </div>
      </div>

      {profile.about && (
        <div className="card p-5">
          <h2 className="font-display text-lg text-ink mb-2">About</h2>
          <p className="text-sm text-ink whitespace-pre-wrap">{profile.about}</p>
        </div>
      )}

      {(isOwner && profile.resumeUrl) && (
        <div className="card p-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-ink">
            <FileText size={16} className="text-amber-dark" /> Resume on file
          </span>
          <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-coral text-sm font-medium">
            View
          </a>
        </div>
      )}

      {profile.experiences?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-lg text-ink mb-4">Experience</h2>
          <div className="route-line space-y-5">
            {profile.experiences.map((exp: any) => (
              <div key={exp.id} className="relative">
                <span className={exp.current ? "route-node-done" : "route-node"} />
                <p className="font-medium text-sm text-ink">{exp.title}</p>
                <p className="text-xs text-muted">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                <p className="text-xs text-muted">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                {exp.description && <p className="text-sm text-ink mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.education?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-lg text-ink mb-4">Education</h2>
          <div className="route-line space-y-5">
            {profile.education.map((edu: any) => (
              <div key={edu.id} className="relative">
                <span className="route-node-done" />
                <p className="font-medium text-sm text-ink">{edu.school}</p>
                <p className="text-xs text-muted">{[edu.degree, edu.field].filter(Boolean).join(", ")}</p>
                <p className="text-xs text-muted">{formatDateRange(edu.startDate, edu.endDate, false)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-lg text-ink mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s: any) => (
              <div key={s.id} className="chip pr-1">
                {s.skill.name}
                {s.endorsements > 0 && <span className="text-muted">· {s.endorsements}</span>}
                {!isOwner && (
                  <button onClick={() => endorse(s.id)} className="ml-1 text-muted hover:text-coral" title="Endorse">
                    <ThumbsUp size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.certificates?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-lg text-ink mb-3">Certificates</h2>
          <div className="space-y-2">
            {profile.certificates.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-ink">
                  <Award size={15} className="text-amber-dark" /> {c.courseName}
                </span>
                <Link href={`/courses/${c.courseId}`} className="text-xs text-coral">
                  View course
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
