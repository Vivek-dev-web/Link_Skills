"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Image as ImageIcon, Link2, FileText, Loader2, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";

export default function CreatePostBox({ onPosted }: { onPosted: (post: any) => void }) {
  const { data: session } = useSession();
  const { show } = useToast();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, kind: "posts") {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", kind);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.url as string;
    } catch (err: any) {
      show(err.message ?? "Upload failed", "error");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "posts");
    if (url) setImageUrl(url);
  }

  async function handleDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "posts");
    if (url) setDocumentUrl(url);
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl,
          documentUrl,
          linkUrl: linkUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onPosted(data);
      setContent("");
      setImageUrl(null);
      setDocumentUrl(null);
      setLinkUrl("");
      setShowLinkInput(false);
    } catch (err: any) {
      show(err.message ?? "Couldn't post that", "error");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <Avatar name={session?.user?.name ?? "?"} src={session?.user?.image} />
        <textarea
          className="textarea flex-1 min-h-[60px] border-0 bg-paper focus:border-0"
          placeholder="Share an update, an article, or a win…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {imageUrl && (
        <div className="relative mt-3 ml-12">
          <img src={imageUrl} alt="" className="rounded-lg max-h-64 object-cover" />
          <button
            onClick={() => setImageUrl(null)}
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-ink/70 text-white flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {documentUrl && (
        <div className="mt-3 ml-12 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
          <FileText size={16} className="text-muted" />
          <span className="flex-1 truncate">Document attached</span>
          <button onClick={() => setDocumentUrl(null)} className="text-muted hover:text-coral">
            <X size={14} />
          </button>
        </div>
      )}
      {showLinkInput && (
        <div className="mt-3 ml-12">
          <input
            className="input"
            placeholder="https://example.com/article"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-3 ml-12">
        <div className="flex items-center gap-1">
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="btn-ghost btn-sm"
            title="Add image"
          >
            <ImageIcon size={16} className="text-teal" />
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />

          <button
            onClick={() => docInputRef.current?.click()}
            disabled={uploading}
            className="btn-ghost btn-sm"
            title="Add document"
          >
            <FileText size={16} className="text-amber-dark" />
          </button>
          <input ref={docInputRef} type="file" accept="application/pdf" hidden onChange={handleDocSelect} />

          <button onClick={() => setShowLinkInput((s) => !s)} className="btn-ghost btn-sm" title="Add link">
            <Link2 size={16} className="text-coral" />
          </button>
          {uploading && <Loader2 size={14} className="animate-spin text-muted ml-1" />}
        </div>
        <button onClick={handleSubmit} disabled={posting || !content.trim()} className="btn-accent btn-sm">
          {posting && <Loader2 size={14} className="animate-spin" />}
          Post
        </button>
      </div>
    </div>
  );
}
