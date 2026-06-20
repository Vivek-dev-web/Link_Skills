"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import CreatePostBox from "@/components/CreatePostBox";
import PostCard from "@/components/PostCard";
import EmptyState from "@/components/EmptyState";
import FeedLeftSidebar from "@/components/feed/FeedLeftSidebar";
import FeedRightSidebar from "@/components/feed/FeedRightSidebar";
import FeedJobCard, { SAMPLE_FEED_JOBS } from "@/components/feed/FeedJobCard";
import FeedCourseCard, { SAMPLE_FEED_COURSES } from "@/components/feed/FeedCourseCard";
import LearningPathBanner from "@/components/feed/LearningPathBanner";

type FeedItem =
  | { type: "post"; data: any }
  | { type: "job"; data: (typeof SAMPLE_FEED_JOBS)[number] }
  | { type: "course"; data: (typeof SAMPLE_FEED_COURSES)[number] }
  | { type: "banner" };

function buildEnrichedFeed(posts: any[]): FeedItem[] {
  const items: FeedItem[] = [];
  const jobs = [...SAMPLE_FEED_JOBS];
  const courses = [...SAMPLE_FEED_COURSES];

  // Always open with the learning path banner
  items.push({ type: "banner" });

  if (posts.length === 0) {
    // No real posts yet — show sample cards so the feed isn't empty
    jobs.forEach((j) => items.push({ type: "job", data: j }));
    courses.slice(0, 2).forEach((c) => items.push({ type: "course", data: c }));
    return items;
  }

  posts.forEach((post, i) => {
    items.push({ type: "post", data: post });
    // Insert a job card after the 1st, 4th, 8th post
    if ((i === 0 || i === 3 || i === 7) && jobs.length > 0) {
      items.push({ type: "job", data: jobs.shift()! });
    }
    // Insert a course card after the 2nd and 6th post
    if ((i === 1 || i === 5) && courses.length > 0) {
      items.push({ type: "course", data: courses.shift()! });
    }
    // Insert a second learning path banner after the 4th post
    if (i === 3) {
      items.push({ type: "banner" });
    }
  });

  return items;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []));
  }, []);

  const feedItems = useMemo(
    () => (posts === null ? null : buildEnrichedFeed(posts)),
    [posts]
  );

  return (
    <div className="flex gap-5 items-start">
      {/* Left sidebar */}
      <FeedLeftSidebar />

      {/* Center feed */}
      <div className="flex-1 min-w-0 max-w-xl space-y-4">
        <CreatePostBox onPosted={(post) => setPosts((p) => [post, ...(p ?? [])])} />

        {feedItems === null && (
          <div className="flex justify-center py-12">
            <div className="space-y-4 w-full">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-32 rounded" />
                      <div className="skeleton h-2 w-24 rounded" />
                    </div>
                  </div>
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {feedItems?.length === 1 && feedItems[0].type === "banner" && (
          <>
            {feedItems.map((item, i) =>
              item.type === "banner" ? <LearningPathBanner key={i} /> : null
            )}
            <EmptyState
              icon={MessageCircle}
              title="Your feed is quiet"
              description="Connect with people or follow companies to start seeing updates."
              action={
                <Link href="/connections" className="btn-accent btn-sm">
                  Find people
                </Link>
              }
            />
          </>
        )}

        {feedItems?.map((item, i) => {
          if (item.type === "banner") return <LearningPathBanner key={`banner-${i}`} />;
          if (item.type === "job") return <FeedJobCard key={item.data.id} job={item.data} />;
          if (item.type === "course") return <FeedCourseCard key={item.data.id} course={item.data} />;
          if (item.type === "post")
            return (
              <PostCard
                key={item.data.id}
                post={item.data}
                onDeleted={(id) => setPosts((p) => p?.filter((x) => x.id !== id) ?? [])}
              />
            );
        })}
      </div>

      {/* Right sidebar */}
      <FeedRightSidebar />
    </div>
  );
}
