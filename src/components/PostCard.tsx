"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, Smile, Lightbulb, MessageCircle, Repeat2, FileText, Trash2, CornerDownRight } from "lucide-react";
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

type Reaction = "like" | "celebrate" | "insightful";

const REACTIONS: { key: Reaction; icon: React.ElementType; label: string; activeClass: string }[] = [
  { key: "like", icon: ThumbsUp, label: "Like", activeClass: "text-teal" },
  { key: "celebrate", icon: Smile, label: "Celebrate", activeClass: "text-amber-dark" },
  { key: "insightful", icon: Lightbulb, label: "Insightful", activeClass: "text-coral" },
];

function CommentRow({
  comment,
  postId,
  onReply,
}: {
  comment: any;
  postId: string;
  onReply: (name: string) => void;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(comment.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(comment.likeCount ?? 0);

  async function toggleLike() {
    if (!session?.user) return;
    const prev = liked;
    setLiked(!prev);
    setLikeCount((c: number) => (prev ? c - 1 : c + 1));
    const res = await fetch(`/api/posts/${postId}/comments/${comment.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } else {
      setLiked(prev);
      setLikeCount((c: number) => (prev ? c + 1 : c - 1));
    }
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar name={comment.user.name} src={comment.user.image} size="xs" />
      <div className="flex-1 min-w-0">
        <div className="bg-paper rounded-xl px-3 py-2">
          <p className="text-xs font-semibold text-ink">{comment.user.name}</p>
          <p className="text-sm text-ink mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-2">
          <button
            onClick={toggleLike}
            className={cn(
              "flex items-center gap-1 text-xs font-medium transition-colors",
              liked ? "text-teal" : "text-muted hover:text-teal"
            )}
          >
            <ThumbsUp size={12} className={liked ? "fill-current" : ""} strokeWidth={liked ? 2.4 : 1.8} />
            {likeCount > 0 && <span>{likeCount}</span>}
            <span>{liked ? "Liked" : "Like"}</span>
          </button>
          {session?.user && (
            <button
              onClick={() => onReply(comment.user.name)}
              className="flex items-center gap-1 text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              <CornerDownRight size={12} strokeWidth={1.8} />
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostCard({ post, onDeleted }: { post: PostData; onDeleted?: (id: string) => void }) {
  const { data: session } = useSession();
  const { show } = useToast();
  const [reaction, setReaction] = useState<Reaction | null>(post.likedByMe ? "like" : null);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[] | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [reposted, setReposted] = useState(false);

  async function handleReaction(r: Reaction) {
    const wasActive = reaction === r;
    setReaction(wasActive ? null : r);
    setLikeCount((c) => (wasActive ? c - 1 : reaction ? c : c + 1));
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setLikeCount(data.likeCount);
      if (!data.liked) setReaction(null);
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
    <div className="card p-4 hover:shadow-hover transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link href={`/profile/${post.author.id}`} className="flex items-start gap-3 group">
          <Avatar name={post.author.name} src={post.author.image} />
          <div>
            <p className="font-semibold text-sm text-ink group-hover:text-teal transition-colors">
              {post.author.name}
            </p>
            {post.author.headline && (
              <p className="text-xs text-muted">{post.author.headline}</p>
            )}
            <p className="text-xs text-muted">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </Link>
        {isOwner && (
          <button onClick={handleDelete} className="text-muted hover:text-coral p-1 transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-ink mt-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>

      {post.linkUrl && (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block text-xs text-teal truncate hover:underline"
        >
          {post.linkUrl}
        </a>
      )}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="mt-3 rounded-xl w-full max-h-96 object-cover" />
      )}
      {post.documentUrl && (
        <a
          href={post.documentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-paper transition-colors"
        >
          <FileText size={16} className="text-amber-dark" /> View attached document
        </a>
      )}

      {/* Reaction summary */}
      {likeCount > 0 && (
        <p className="mt-3 text-xs text-muted">
          {likeCount} {likeCount === 1 ? "reaction" : "reactions"}
        </p>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
        {REACTIONS.map(({ key, icon: Icon, label, activeClass }) => (
          <button
            key={key}
            onClick={() => handleReaction(key)}
            className={cn(
              "btn-ghost btn-sm flex-1 gap-1.5 text-xs",
              reaction === key && activeClass
            )}
            title={label}
          >
            <Icon
              size={15}
              className={reaction === key ? "fill-current" : ""}
              strokeWidth={reaction === key ? 2.4 : 1.8}
            />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
        <button
          onClick={loadComments}
          className={cn("btn-ghost btn-sm flex-1 gap-1.5 text-xs", showComments && "text-teal")}
        >
          <MessageCircle size={15} strokeWidth={showComments ? 2.4 : 1.8} />
          <span className="hidden sm:inline">{commentCount > 0 ? commentCount : ""} Comment</span>
        </button>
        <button
          onClick={handleShare}
          className={cn("btn-ghost btn-sm flex-1 gap-1.5 text-xs", reposted && "text-teal")}
        >
          <Repeat2 size={15} />
          <span className="hidden sm:inline">{reposted ? "Shared" : "Share"}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {comments?.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              postId={post.id}
              onReply={(name) => setCommentText(`@${name} `)}
            />
          ))}
          {session?.user && (
            <div className="flex items-center gap-2">
              <Avatar name={session.user.name ?? "?"} src={session.user.image} size="xs" />
              <input
                className="input flex-1 rounded-full"
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
