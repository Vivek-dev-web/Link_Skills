"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { formatRelativeTime, cn } from "@/lib/utils";

function MessagesInner() {
  const { data: session } = useSession();
  const myId = (session?.user as any)?.id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeId = searchParams.get("c");

  const [conversations, setConversations] = useState<any[] | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef(0);

  async function loadConversations() {
    const res = await fetch("/api/messages/conversations");
    const data = await res.json();
    setConversations(data.conversations ?? []);
  }

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setOtherUser(null);
      return;
    }
    let active = true;
    async function poll() {
      const res = await fetch(`/api/messages/conversations/${activeId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!active) return;
      setMessages(data.messages ?? []);
      setOtherUser(data.otherUser ?? null);
      setIsTyping(!!data.isOtherTyping);
    }
    poll();
    fetch(`/api/messages/conversations/${activeId}/read`, { method: "PUT" });
    const id = setInterval(poll, 2500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleTyping() {
    const now = Date.now();
    if (activeId && now - lastTypingSent.current > 1500) {
      lastTypingSent.current = now;
      fetch(`/api/messages/conversations/${activeId}/typing`, { method: "PUT" });
    }
  }

  async function sendMessage() {
    if (!draft.trim() || !activeId) return;
    setSending(true);
    const content = draft.trim();
    setDraft("");
    const res = await fetch(`/api/messages/conversations/${activeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const message = await res.json();
    setSending(false);
    if (res.ok) {
      setMessages((m) => [...m, message]);
      loadConversations();
    }
  }

  return (
    <div className="card overflow-hidden" style={{ height: "calc(100vh - 160px)" }}>
      <div className="grid md:grid-cols-[300px_1fr] h-full">
        <div className={cn("border-r border-border overflow-y-auto", activeId && "hidden md:block")}>
          <div className="p-4 border-b border-border">
            <h1 className="font-display text-lg text-ink">Messages</h1>
          </div>
          {conversations === null && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted" />
            </div>
          )}
          {conversations?.length === 0 && (
            <div className="p-4">
              <p className="text-sm text-muted">No conversations yet. Message a connection from their profile.</p>
            </div>
          )}
          {conversations?.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/messages?c=${c.id}`)}
              className={cn(
                "w-full flex items-center gap-3 p-3 border-b border-border text-left hover:bg-paper",
                activeId === c.id && "bg-paper"
              )}
            >
              <Avatar name={c.otherUser?.name ?? "?"} src={c.otherUser?.image} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink truncate">{c.otherUser?.name}</p>
                  {c.lastMessage && (
                    <span className="text-[10px] text-muted shrink-0">{formatRelativeTime(c.lastMessage.createdAt)}</span>
                  )}
                </div>
                <p className="text-xs text-muted truncate">{c.lastMessage?.content ?? "Say hello"}</p>
              </div>
              {c.unreadCount > 0 && (
                <span className="h-5 min-w-[20px] px-1 rounded-full bg-coral text-white text-[10px] flex items-center justify-center font-semibold">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={cn("flex flex-col", !activeId && "hidden md:flex")}>
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageCircle} title="Select a conversation" description="Pick someone from the left to see your messages." />
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border flex items-center gap-2">
                <button onClick={() => router.push("/messages")} className="md:hidden btn-ghost btn-sm !px-2">
                  ←
                </button>
                <Avatar name={otherUser?.name ?? "?"} src={otherUser?.image} size="sm" />
                <div>
                  <p className="text-sm font-medium text-ink">{otherUser?.name}</p>
                  {isTyping && <p className="text-xs text-teal-dark">typing…</p>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => {
                  const mine = m.senderId === myId;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-3.5 py-2 text-sm",
                          mine ? "bg-ink text-paper rounded-br-sm" : "bg-paper text-ink rounded-bl-sm"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={cn("text-[10px] mt-1", mine ? "text-paper/60" : "text-muted")}>
                          {formatRelativeTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t border-border flex items-center gap-2">
                <input
                  className="input flex-1"
                  placeholder="Write a message…"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage} disabled={sending || !draft.trim()} className="btn-accent !rounded-full !p-2.5">
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesInner />
    </Suspense>
  );
}
