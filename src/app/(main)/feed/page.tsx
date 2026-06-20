"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus, Briefcase } from "lucide-react";
import CreatePostBox from "@/components/CreatePostBox";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { MessageCircle } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[] | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []));
    fetch("/api/users/suggestions")
      .then((r) => r.json())
      .then((d) => setSuggestions(d.users ?? []));
    fetch("/api/jobs/recommended")
      .then((r) => r.json())
      .then((d) => setJobs((d.jobs ?? []).slice(0, 3)));
  }, []);

  async function connectWith(userId: string) {
    await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresseeId: userId }),
    });
    setSuggestions((s) => s.filter((u) => u.id !== userId));
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4 max-w-2xl">
        <CreatePostBox onPosted={(post) => setPosts((p) => [post, ...(p ?? [])])} />

        {posts === null && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-muted" />
          </div>
        )}

        {posts?.length === 0 && (
          <EmptyState
            icon={MessageCircle}
            title="Your feed is quiet"
            description="Connect with a few people or follow companies to start seeing updates here."
            action={
              <Link href="/connections" className="btn-accent btn-sm">
                Find people
              </Link>
            }
          />
        )}

        {posts?.map((post) => (
          <PostCard key={post.id} post={post} onDeleted={(id) => setPosts((p) => p?.filter((x) => x.id !== id) ?? [])} />
        ))}
      </div>

      <aside className="space-y-4 hidden lg:block">
        <div className="card p-4">
          <h3 className="font-display text-base text-ink mb-3">People you may know</h3>
          {suggestions.length === 0 && <p className="text-xs text-muted">No suggestions right now.</p>}
          <div className="space-y-3">
            {suggestions.slice(0, 4).map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <Link href={`/profile/${u.id}`}>
                  <Avatar name={u.name} src={u.image} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${u.id}`} className="text-sm font-medium text-ink hover:underline block truncate">
                    {u.name}
                  </Link>
                  <p className="text-xs text-muted truncate">{u.headline ?? "Atlas member"}</p>
                </div>
                <button onClick={() => connectWith(u.id)} className="btn-outline btn-sm !px-2" title="Connect">
                  <UserPlus size={14} />
                </button>
              </div>
            ))}
          </div>
          <Link href="/connections" className="text-xs text-coral font-medium block mt-3">
            See all suggestions
          </Link>
        </div>

        <div className="card p-4">
          <h3 className="font-display text-base text-ink mb-3">Jobs picked for you</h3>
          {jobs.length === 0 && <p className="text-xs text-muted">Add skills to your profile to get matches.</p>}
          <div className="space-y-3">
            {jobs.map((j) => (
              <Link key={j.id} href={`/jobs/${j.id}`} className="block group">
                <p className="text-sm font-medium text-ink group-hover:text-coral truncate">{j.title}</p>
                <p className="text-xs text-muted truncate">{j.company?.name} · {j.location}</p>
              </Link>
            ))}
          </div>
          <Link href="/jobs" className="text-xs text-coral font-medium flex items-center gap-1 mt-3">
            <Briefcase size={12} /> Browse all jobs
          </Link>
        </div>
      </aside>
    </div>
  );
}
