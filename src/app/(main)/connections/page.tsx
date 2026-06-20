"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, UserPlus, Check, X, UserMinus, Users } from "lucide-react";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

type Tab = "discover" | "requests" | "network";

export default function ConnectionsPage() {
  const { show } = useToast();
  const [tab, setTab] = useState<Tab>("discover");

  const [q, setQ] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  async function loadSuggestions() {
    const res = await fetch("/api/users/suggestions");
    const data = await res.json();
    setSuggestions(data.users ?? []);
  }

  async function loadRequests() {
    const [r1, r2] = await Promise.all([
      fetch("/api/connections?status=PENDING&type=received").then((r) => r.json()),
      fetch("/api/connections?status=PENDING&type=sent").then((r) => r.json()),
    ]);
    setReceived(r1.connections ?? []);
    setSent(r2.connections ?? []);
  }

  async function loadNetwork() {
    const res = await fetch("/api/connections?status=ACCEPTED");
    const data = await res.json();
    setNetwork(data.connections ?? []);
  }

  useEffect(() => {
    loadSuggestions();
    loadRequests();
    loadNetwork();
  }, []);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setResults(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (company) params.set("company", company);
    if (location) params.set("location", location);
    const res = await fetch(`/api/users?${params.toString()}`);
    const data = await res.json();
    setResults(data.users ?? []);
  }

  async function sendRequest(userId: string) {
    setRequestedIds((s) => new Set(s).add(userId));
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresseeId: userId }),
    });
    if (res.ok) {
      show("Request sent", "success");
      setSuggestions((s) => s.filter((u) => u.id !== userId));
    } else {
      const d = await res.json();
      show(d.error ?? "Couldn't send request", "error");
    }
  }

  async function respond(connectionId: string, status: "ACCEPTED" | "REJECTED") {
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      loadRequests();
      if (status === "ACCEPTED") {
        loadNetwork();
        show("Connection accepted", "success");
      }
    }
  }

  async function withdraw(connectionId: string) {
    await fetch(`/api/connections/${connectionId}`, { method: "DELETE" });
    loadRequests();
  }

  async function removeConnection(connectionId: string) {
    if (!confirm("Remove this connection?")) return;
    await fetch(`/api/connections/${connectionId}`, { method: "DELETE" });
    loadNetwork();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="font-display text-2xl text-ink">My network</h1>

      <div className="flex gap-1 border-b border-border">
        {[
          { id: "discover", label: "Discover" },
          { id: "requests", label: `Requests${received.length ? ` (${received.length})` : ""}` },
          { id: "network", label: `Connections (${network.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-coral text-coral" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "discover" && (
        <div className="space-y-5">
          <form onSubmit={runSearch} className="card p-4 grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-8" placeholder="Name or title" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <input className="input" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <button type="submit" className="btn-accent">Search</button>
          </form>

          {results !== null && (
            <div className="card divide-y divide-border">
              {results.length === 0 && <p className="p-4 text-sm text-muted">No one matched that search.</p>}
              {results.map((u) => (
                <PersonRow key={u.id} user={u} onConnect={sendRequest} requested={requestedIds.has(u.id)} />
              ))}
            </div>
          )}

          <div>
            <h2 className="font-display text-lg text-ink mb-3">People you may know</h2>
            {suggestions.length === 0 ? (
              <EmptyState icon={Users} title="No suggestions yet" description="As your network grows, we'll surface more relevant people here." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {suggestions.map((u) => (
                  <div key={u.id} className="card p-4 flex items-center gap-3">
                    <Link href={`/profile/${u.id}`}>
                      <Avatar name={u.name} src={u.image} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${u.id}`} className="text-sm font-medium text-ink hover:underline block truncate">
                        {u.name}
                      </Link>
                      <p className="text-xs text-muted truncate">{u.headline ?? "Atlas member"}</p>
                      {u.mutualConnections > 0 && (
                        <p className="text-xs text-teal-dark mt-0.5">{u.mutualConnections} mutual connections</p>
                      )}
                    </div>
                    <button
                      onClick={() => sendRequest(u.id)}
                      disabled={requestedIds.has(u.id)}
                      className="btn-outline btn-sm !px-2"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg text-ink mb-3">Received</h2>
            {received.length === 0 ? (
              <p className="text-sm text-muted">No pending requests.</p>
            ) : (
              <div className="card divide-y divide-border">
                {received.map((c) => (
                  <div key={c.id} className="p-4 flex items-center gap-3">
                    <Link href={`/profile/${c.requester.id}`}>
                      <Avatar name={c.requester.name} src={c.requester.image} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${c.requester.id}`} className="text-sm font-medium text-ink hover:underline">
                        {c.requester.name}
                      </Link>
                      <p className="text-xs text-muted truncate">{c.requester.headline}</p>
                    </div>
                    <button onClick={() => respond(c.id, "ACCEPTED")} className="btn-accent btn-sm !px-2">
                      <Check size={14} />
                    </button>
                    <button onClick={() => respond(c.id, "REJECTED")} className="btn-outline btn-sm !px-2">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-lg text-ink mb-3">Sent</h2>
            {sent.length === 0 ? (
              <p className="text-sm text-muted">No outgoing requests.</p>
            ) : (
              <div className="card divide-y divide-border">
                {sent.map((c) => (
                  <div key={c.id} className="p-4 flex items-center gap-3">
                    <Link href={`/profile/${c.addressee.id}`}>
                      <Avatar name={c.addressee.name} src={c.addressee.image} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${c.addressee.id}`} className="text-sm font-medium text-ink hover:underline">
                        {c.addressee.name}
                      </Link>
                      <p className="text-xs text-muted">Pending</p>
                    </div>
                    <button onClick={() => withdraw(c.id)} className="btn-outline btn-sm">Withdraw</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "network" && (
        <div className="card divide-y divide-border">
          {network.length === 0 && <p className="p-4 text-sm text-muted">You haven't connected with anyone yet.</p>}
          {network.map((c) => (
            <NetworkRow key={c.id} connection={c} onRemove={removeConnection} />
          ))}
        </div>
      )}
    </div>
  );
}

function PersonRow({ user, onConnect, requested }: { user: any; onConnect: (id: string) => void; requested: boolean }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <Link href={`/profile/${user.id}`}>
        <Avatar name={user.name} src={user.image} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.id}`} className="text-sm font-medium text-ink hover:underline">
          {user.name}
        </Link>
        <p className="text-xs text-muted truncate">
          {user.headline ?? [user.currentRole, user.currentCompany].filter(Boolean).join(" at ")}
        </p>
      </div>
      <button onClick={() => onConnect(user.id)} disabled={requested} className="btn-outline btn-sm">
        <UserPlus size={14} /> {requested ? "Sent" : "Connect"}
      </button>
    </div>
  );
}

function NetworkRow({ connection, onRemove }: { connection: any; onRemove: (id: string) => void }) {
  const { data: session } = useSession();
  const myId = (session?.user as any)?.id;
  const other = connection.requesterId === myId ? connection.addressee : connection.requester;

  return (
    <div className="p-4 flex items-center gap-3">
      <Link href={`/profile/${other.id}`}>
        <Avatar name={other.name} src={other.image} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${other.id}`} className="text-sm font-medium text-ink hover:underline">
          {other.name}
        </Link>
        <p className="text-xs text-muted truncate">{other.headline}</p>
      </div>
      <button onClick={() => onRemove(connection.id)} className="btn-ghost btn-sm text-muted">
        <UserMinus size={14} /> Remove
      </button>
    </div>
  );
}
