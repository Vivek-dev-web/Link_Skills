"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Bell, UserPlus, Heart, MessageSquare, Briefcase, GraduationCap, Mail } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { formatRelativeTime, cn } from "@/lib/utils";

const ICONS: Record<string, any> = {
  CONNECTION_REQUEST: UserPlus,
  CONNECTION_ACCEPTED: UserPlus,
  POST_LIKE: Heart,
  POST_COMMENT: MessageSquare,
  JOB_MATCH: Briefcase,
  APPLICATION_UPDATE: Briefcase,
  COURSE_UPDATE: GraduationCap,
  MESSAGE: Mail,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[] | null>(null);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((n) => n?.map((x) => ({ ...x, read: true })) ?? []);
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PUT" });
    setNotifications((n) => n?.map((x) => (x.id === id ? { ...x, read: true } : x)) ?? []);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Notifications</h1>
        {notifications && notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="btn-outline btn-sm">Mark all as read</button>
        )}
      </div>

      {notifications === null && (
        <div className="flex justify-center py-14">
          <Loader2 className="animate-spin text-muted" />
        </div>
      )}

      {notifications?.length === 0 && (
        <EmptyState icon={Bell} title="No notifications yet" description="We'll let you know about connections, engagement, jobs, and courses here." />
      )}

      <div className="card divide-y divide-border">
        {notifications?.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          const body = (
            <div className="flex items-start gap-3 p-4">
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", n.read ? "bg-paper" : "bg-coral-light")}>
                <Icon size={14} className={n.read ? "text-muted" : "text-coral-dark"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", n.read ? "text-ink" : "text-ink font-medium")}>{n.message}</p>
                <p className="text-xs text-muted mt-0.5">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.read && <span className="h-2 w-2 rounded-full bg-coral mt-2 shrink-0" />}
            </div>
          );
          return n.link ? (
            <Link key={n.id} href={n.link} onClick={() => markRead(n.id)} className="block hover:bg-paper">
              {body}
            </Link>
          ) : (
            <button key={n.id} onClick={() => markRead(n.id)} className="block w-full text-left hover:bg-paper">
              {body}
            </button>
          );
        })}
      </div>
    </div>
  );
}
