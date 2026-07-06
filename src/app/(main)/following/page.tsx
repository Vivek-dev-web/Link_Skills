"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserCheck, Users, UserMinus } from "lucide-react";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

type Tab = "following" | "followers";

export default function FollowingPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) ?? "following";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState(true);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    fetch("/api/follow?type=following")
      .then((r) => r.json())
      .then((d) => setFollowing(d.follows ?? []))
      .finally(() => setLoadingFollow(false));
    fetch("/api/follow?type=followers")
      .then((r) => r.json())
      .then((d) => setFollowers(d.follows ?? []))
      .finally(() => setLoadingFollowers(false));
  }, []);

  async function unfollow(followeeId: string) {
    const res = await fetch(`/api/follow/${followeeId}`, { method: "DELETE" });
    if (res.ok) {
      setUnfollowedIds((s) => new Set(s).add(followeeId));
      show("Unfollowed", "success");
    }
  }

  const activeFollowing = following.filter((f) => !unfollowedIds.has(f.followeeId));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl text-ink">Following &amp; followers</h1>
        <p className="text-sm text-muted mt-1">Manage who you follow and who follows you</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { id: "following" as Tab, label: `Following (${activeFollowing.length})` },
          { id: "followers" as Tab, label: `Followers (${followers.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-teal text-teal" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "following" && (
        <div>
          {loadingFollow ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full skeleton" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 skeleton rounded" />
                    <div className="h-3 w-48 skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeFollowing.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="Not following anyone yet"
              description="Follow people to see their posts and updates in your feed."
            />
          ) : (
            <div className="card divide-y divide-border">
              {activeFollowing.map((f) => (
                <div key={f.id} className="p-4 flex items-center gap-3">
                  <Link href={`/profile/${f.followee.id}`}>
                    <Avatar name={f.followee.name} src={f.followee.image} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${f.followee.id}`}
                      className="text-sm font-medium text-ink hover:underline block truncate"
                    >
                      {f.followee.name}
                    </Link>
                    <p className="text-xs text-muted truncate">
                      {f.followee.headline ??
                        [f.followee.currentRole, f.followee.currentCompany].filter(Boolean).join(" at ") ??
                        "Atlas member"}
                    </p>
                  </div>
                  <button
                    onClick={() => unfollow(f.followeeId)}
                    className="btn-outline btn-sm flex items-center gap-1.5"
                  >
                    <UserMinus size={13} /> Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "followers" && (
        <div>
          {loadingFollowers ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full skeleton" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 skeleton rounded" />
                    <div className="h-3 w-48 skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : followers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No followers yet"
              description="When people follow you, they'll appear here."
            />
          ) : (
            <div className="card divide-y divide-border">
              {followers.map((f) => (
                <div key={f.id} className="p-4 flex items-center gap-3">
                  <Link href={`/profile/${f.follower.id}`}>
                    <Avatar name={f.follower.name} src={f.follower.image} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${f.follower.id}`}
                      className="text-sm font-medium text-ink hover:underline block truncate"
                    >
                      {f.follower.name}
                    </Link>
                    <p className="text-xs text-muted truncate">
                      {f.follower.headline ??
                        [f.follower.currentRole, f.follower.currentCompany].filter(Boolean).join(" at ") ??
                        "Atlas member"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
