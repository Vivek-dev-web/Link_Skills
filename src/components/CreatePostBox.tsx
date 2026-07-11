"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Image as ImageIcon, Link2, FileText, Loader2, X, Smile } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

const ATTACH_BUTTONS = [
  { key: "image",    icon: ImageIcon, label: "Photo",    color: "text-teal",      activeColor: "bg-teal/10"       },
  { key: "document", icon: FileText,  label: "Document", color: "text-amber-dark", activeColor: "bg-amber/10"     },
  { key: "link",     icon: Link2,     label: "Link",     color: "text-coral",     activeColor: "bg-coral/10"      },
];

export default function CreatePostBox({ onPosted }: { onPosted: (post: any) => void }) {
  const { data: session } = useSession();
  const { show }          = useToast();
  const [content,       setContent]       = useState("");
  const [imageUrl,      setImageUrl]      = useState<string | null>(null);
  const [documentUrl,   setDocumentUrl]   = useState<string | null>(null);
  const [linkUrl,       setLinkUrl]       = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [posting,       setPosting]       = useState(false);
  const [focused,       setFocused]       = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef   = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "posts");
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: formData });
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
    if (file) { const url = await uploadFile(file); if (url) setImageUrl(url); }
  }

  async function handleDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { const url = await uploadFile(file); if (url) setDocumentUrl(url); }
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res  = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), imageUrl, documentUrl, linkUrl: linkUrl.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onPosted(data);
      setContent(""); setImageUrl(null); setDocumentUrl(null); setLinkUrl(""); setShowLinkInput(false); setFocused(false);
    } catch (err: any) {
      show(err.message ?? "Couldn't post that", "error");
    } finally {
      setPosting(false);
    }
  }

  const hasContent = content.trim().length > 0;

  return (
    <div className={cn(
      "card transition-all duration-200",
      focused ? "shadow-md ring-1 ring-teal/20" : ""
    )}>
      <div className="p-4">
        <div className="flex gap-3 items-start">
          <Avatar name={session?.user?.name ?? "?"} src={session?.user?.image} size="md" />
          <div className="flex-1 min-w-0">
            <textarea
              rows={focused ? 3 : 1}
              className={cn(
                "w-full resize-none text-sm text-ink placeholder:text-muted bg-paper rounded-xl px-4 py-2.5 border border-border focus:outline-none focus:border-teal/50 focus:bg-white transition-all duration-200",
                focused ? "min-h-[80px]" : "min-h-[40px]"
              )}
              placeholder="Share an update, a win, or an insight…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
            />
          </div>
        </div>

        {/* Attachments preview */}
        {imageUrl && (
          <div className="relative mt-3 ml-12 rounded-xl overflow-hidden border border-border">
            <img src={imageUrl} alt="" className="max-h-64 w-full object-cover" />
            <button onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-ink/70 text-white flex items-center justify-center hover:bg-ink transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
        {documentUrl && (
          <div className="mt-3 ml-12 flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm bg-paper">
            <FileText size={16} className="text-amber-dark shrink-0" />
            <span className="flex-1 truncate text-muted">Document attached</span>
            <button onClick={() => setDocumentUrl(null)} className="text-muted hover:text-coral transition-colors">
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
      </div>

      {/* Bottom action bar */}
      <div className={cn(
        "flex items-center justify-between border-t border-border px-4 py-2.5 transition-all",
        focused ? "opacity-100" : "opacity-60"
      )}>
        <div className="flex items-center gap-0.5">
          {ATTACH_BUTTONS.map(({ key, icon: Icon, label, color }) => (
            <button
              key={key}
              onClick={() => {
                if (key === "image")    imageInputRef.current?.click();
                if (key === "document") docInputRef.current?.click();
                if (key === "link")     setShowLinkInput((s) => !s);
              }}
              disabled={uploading}
              title={label}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-paper",
                color
              )}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <input ref={imageInputRef} type="file" accept="image/*"          hidden onChange={handleImageSelect} />
          <input ref={docInputRef}   type="file" accept="application/pdf"  hidden onChange={handleDocSelect}   />
          {uploading && <Loader2 size={14} className="animate-spin text-muted ml-1" />}
        </div>

        <div className="flex items-center gap-2">
          {focused && !hasContent && (
            <button onClick={() => setFocused(false)}
              className="text-xs text-muted hover:text-ink transition-colors px-2 py-1.5">
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={posting || !hasContent}
            className={cn(
              "btn-sm rounded-full px-5 font-semibold transition-all",
              hasContent
                ? "btn-accent shadow-sm"
                : "bg-paper border border-border text-muted cursor-not-allowed"
            )}
          >
            {posting ? <Loader2 size={14} className="animate-spin" /> : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
