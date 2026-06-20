"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2, FileText, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Avatar from "@/components/Avatar";
import { formatRelativeTime, cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface PostAuthor {
  id: string;
  name: string;
  image?: string | null;
  headline?: string | null;
}

interface PostData {
  id: string;
  content: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  documentUrl?: string | null;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export default function PostCard({ post, onDeleted }: { post: PostData; onDeleted?: (id: string) => void }) {
  const { data: session } = useSession();
  const { show } = useToast();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[] | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [reposted, setReposted] = useState(false);

  async function toggleLike() {
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    }
  }

  async function loadComments() {
    setShowComments((s) => !s);
    if (!comments) {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
    }
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments((c) => [...(c ?? []), data]);
      setCommentCount((c) => c + 1);
      setCommentText("");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted?.(post.id);
      show("Post deleted", "success");
    }
  }

  function handleShare() {
    setReposted(true);
    show("Shared to your network", "success");
  }

  const isOwner = (session?.user as any)?.id === post.author.id;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <Link href={`/profile/${post.author.id}`} className="flex items-start gap-3">
          <Avatar name={post.author.name} src={post.author.image} />
          <div>
            <p className="font-medium text-sm text-ink">{post.author.name}</p>
            {post.author.headline && <p className="text-xs text-muted">{post.author.headline}</p>}
            <p className="text-xs text-muted">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </Link>
        {isOwner && (
          <button onClick={handleDelete} className="text-muted hover:text-coral p-1">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <p className="text-sm text-ink mt-3 whitespace-pre-wrap">{post.content}</p>

      {post.linkUrl && (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block text-xs text-coral truncate hover:underline"
        >
          {post.linkUrl}
        </a>
      )}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="mt-3 rounded-lg max-h-96 w-full object-cover" />
      )}
      {post.documentUrl && (
        <a
          href={post.documentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-paper"
        >
          <FileText size={16} className="text-amber-dark" /> View attached document
        </a>
      )}

      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
        <button
          onClick={toggleLike}
          className={cn("btn-ghost btn-sm flex-1", liked && "text-coral")}
        >
          <Heart size={15} className={liked ? "fill-coral" : ""} /> {likeCount > 0 ? likeCount : ""} Like
        </button>
        <button onClick={loadComments} className="btn-ghost btn-sm flex-1">
          <MessageCircle size={15} /> {commentCount > 0 ? commentCount : ""} Comment
        </button>
        <button onClick={handleShare} className={cn("btn-ghost btn-sm flex-1", reposted && "text-teal")}>
          <Repeat2 size={15} /> {reposted ? "Shared" : "Share"}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {comments?.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar name={c.user.name} src={c.user.image} size="xs" />
              <div className="bg-paper rounded-lg px-3 py-1.5 flex-1">
                <p className="text-xs font-medium text-ink">{c.user.name}</p>
                <p className="text-sm text-ink">{c.content}</p>
              </div>
            </div>
          ))}
          {session?.user && (
            <div className="flex items-center gap-2">
              <Avatar name={session.user.name ?? "?"} src={session.user.image} size="xs" />
              <input
                className="input flex-1"
                placeholder="Write a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
