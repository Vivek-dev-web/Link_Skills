"use client";

import { useEffect, useRef, useState } from "react";
import { Users2, Search, Plus, Lock, Globe, X, Link2, Settings, LogOut } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

type Group = {
  id: string;
  name: string;
  category: string;
  description: string;
  members: number;
  privacy: "public" | "private";
  joined: boolean;
  requested?: boolean;
  logo: string;
};

const CATEGORIES = ["All", "Technology", "Design", "AI & ML", "Career", "Entrepreneurship", "Finance", "Marketing"];

const MOCK_GROUPS: Group[] = [
  { id: "1",  name: "Full-Stack Engineers India",                          category: "Technology",      description: "A community for full-stack developers to share ideas, ask questions, and grow together.",                           members: 48200,  privacy: "public",  joined: true,  logo: "FS" },
  { id: "2",  name: "Product Designers Network",                           category: "Design",          description: "Connect with product designers from top startups. Share portfolios, get feedback, discuss design systems.",          members: 31500,  privacy: "public",  joined: true,  logo: "PD" },
  { id: "3",  name: "AI & Machine Learning Hub",                           category: "AI & ML",         description: "Latest research, papers, tools, and career opportunities in AI and ML.",                                            members: 92100,  privacy: "public",  joined: false, logo: "AI" },
  { id: "4",  name: "Startup Founders Circle",                             category: "Entrepreneurship",description: "A private group for founders to share wins, failures, fundraising tips, and investor intros.",                      members: 14300,  privacy: "private", joined: false, requested: true, logo: "SF" },
  { id: "5",  name: "Tech Careers & Growth",                               category: "Career",          description: "Resume reviews, interview prep, compensation negotiation, and career pivots in tech.",                              members: 67800,  privacy: "public",  joined: false, logo: "TC" },
  { id: "6",  name: "DevOps & Cloud Architects",                           category: "Technology",      description: "Best practices, war stories, and emerging patterns in DevOps, Kubernetes, and cloud-native stacks.",                members: 28400,  privacy: "public",  joined: true,  logo: "DC" },
  { id: "7",  name: "Women in Tech India",                                 category: "Career",          description: "Empowering women in technology through mentorship, events, and community support.",                                 members: 42600,  privacy: "public",  joined: false, logo: "WT" },
  { id: "8",  name: "Generative AI Builders",                              category: "AI & ML",         description: "Builders using LLMs, diffusion models, and generative tools to create products.",                                  members: 23700,  privacy: "public",  joined: false, requested: true, logo: "GB" },
  { id: "9",  name: "SaaS Growth & Marketing",                             category: "Marketing",       description: "GTM strategies, growth experiments, and marketing tactics for B2B SaaS companies.",                                members: 19200,  privacy: "private", joined: false, logo: "SG" },
  { id: "10", name: "React & Next.js Developers",                          category: "Technology",      description: "Everything React: hooks, patterns, performance, and the Next.js ecosystem.",                                       members: 55300,  privacy: "public",  joined: false, logo: "RN" },
  { id: "11", name: "FinTech Innovators",                                  category: "Finance",         description: "Disrupting finance with technology — payments, lending, crypto, and regulatory tech.",                             members: 17600,  privacy: "public",  joined: false, logo: "FI" },
  { id: "12", name: "UX Research & Strategy",                              category: "Design",          description: "User research methods, usability testing, and translating insights into product decisions.",                        members: 12800,  privacy: "private", joined: false, logo: "UX" },
];

function formatMembers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${n}`;
}

export default function GroupsPage() {
  const { show } = useToast();
  const [mainTab, setMainTab] = useState<"yourgroups" | "requested">("yourgroups");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [memberships, setMemberships] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_GROUPS.map((g) => [g.id, g.joined]))
  );
  const [requests, setRequests] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_GROUPS.map((g) => [g.id, g.requested ?? false]))
  );
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createPrivacy, setCreatePrivacy] = useState<"public" | "private">("public");
  const [createCategory, setCreateCategory] = useState("Technology");

  const myGroups   = MOCK_GROUPS.filter((g) => memberships[g.id]);
  const requested  = MOCK_GROUPS.filter((g) => requests[g.id] && !memberships[g.id]);
  const discover   = MOCK_GROUPS.filter((g) => !memberships[g.id] && !requests[g.id]);

  const filtered = discover.filter((g) => {
    const matchCat = category === "All" || g.category === category;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function join(id: string) { setMemberships((m) => ({ ...m, [id]: true })); setRequests((r) => ({ ...r, [id]: false })); }
  function leave(id: string) { setMemberships((m) => ({ ...m, [id]: false })); show("You've left the group", "info"); }
  function request(id: string) { setRequests((r) => ({ ...r, [id]: true })); show("Request sent", "success"); }
  function withdraw(id: string) { setRequests((r) => ({ ...r, [id]: false })); show("Request withdrawn", "info"); }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setShowCreate(false);
    setCreateName("");
    setCreateDesc("");
    show("Group created!", "success");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Groups</h1>
        <button onClick={() => setShowCreate(true)} className="btn-outline flex items-center gap-1.5">
          <Plus size={16} /> Create group
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border">
        {(["yourgroups", "requested"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMainTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              mainTab === t
                ? "border-teal text-teal"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            {t === "yourgroups" ? "Your groups" : `Requested${requested.length ? ` (${requested.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* Create group modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Create a group</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted hover:text-ink"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Group name</label>
                <input className="input" placeholder="e.g. Python Data Scientists" value={createName} onChange={(e) => setCreateName(e.target.value)} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input min-h-[80px] resize-none" placeholder="What is this group about?" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={createCategory} onChange={(e) => setCreateCategory(e.target.value)}>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Privacy</label>
                  <select className="input" value={createPrivacy} onChange={(e) => setCreatePrivacy(e.target.value as "public" | "private")}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-accent w-full" disabled={!createName.trim()}>Create group</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Your groups tab ── */}
      {mainTab === "yourgroups" && (
        <div className="space-y-6">
          {myGroups.length === 0 ? (
            <EmptyState icon={Users2} title="You haven't joined any groups" description="Discover and join groups that match your interests below." />
          ) : (
            <div className="card divide-y divide-border">
              {myGroups.map((g) => (
                <GroupRow key={g.id} group={g} joined onLeave={leave} />
              ))}
            </div>
          )}

          {/* Discover section */}
          <div>
            <h2 className="font-display text-lg text-ink mb-3">Discover groups</h2>
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-9" placeholder="Search groups…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={cn("chip transition-colors", category === c ? "chip-teal" : "hover:bg-teal-light hover:text-teal-dark")}>
                  {c}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <EmptyState icon={Users2} title="No groups found" description="Try a different search or category filter." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {filtered.map((g) => (
                  <GroupCard key={g.id} group={g} joined={false} onJoin={g.privacy === "private" ? () => request(g.id) : () => join(g.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Requested tab ── */}
      {mainTab === "requested" && (
        <div>
          {requested.length === 0 ? (
            <EmptyState icon={Users2} title="No pending requests" description="When you request to join a private group, it will appear here." />
          ) : (
            <div className="card divide-y divide-border">
              {requested.map((g) => (
                <RequestedRow key={g.id} group={g} onWithdraw={withdraw} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LogoBadge({ initials }: { initials: string }) {
  const colors = ["bg-teal-light text-teal-dark", "bg-coral-light text-coral", "bg-amber-light text-amber-dark", "bg-brand/10 text-ink"];
  const idx = initials.charCodeAt(0) % colors.length;
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${colors[idx]}`}>
      {initials}
    </div>
  );
}

function GroupRow({ group, joined, onLeave }: { group: Group; joined: boolean; onLeave: (id: string) => void }) {
  const { show } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/groups/${group.id}`).then(() => show("Link copied", "success"));
    setMenuOpen(false);
  }

  return (
    <div className="p-4 flex items-center gap-3">
      <LogoBadge initials={group.logo} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{group.name}</p>
        <p className="text-xs text-muted">
          {formatMembers(group.members)} members ·{" "}
          {group.privacy === "private"
            ? <span className="inline-flex items-center gap-0.5"><Lock size={10} /> Private</span>
            : <span className="inline-flex items-center gap-0.5"><Globe size={10} /> Public</span>}
        </p>
      </div>

      {/* 3-dot menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-paper transition-colors"
          aria-label="Group options"
        >
          <Settings size={15} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-50 w-52 card shadow-pop py-1">
            <GroupMenuBtn icon={Link2} label="Copy link to group" onClick={copyLink} />
            <GroupMenuBtn icon={Settings} label="Update your settings" onClick={() => { show("Group settings coming soon", "info"); setMenuOpen(false); }} />
            <div className="h-px bg-border my-1" />
            <GroupMenuBtn icon={LogOut} label="Leave this group" onClick={() => { onLeave(group.id); setMenuOpen(false); }} className="text-coral" />
          </div>
        )}
      </div>
    </div>
  );
}

function RequestedRow({ group, onWithdraw }: { group: Group; onWithdraw: (id: string) => void }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <LogoBadge initials={group.logo} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{group.name}</p>
        <p className="text-xs text-muted">
          {formatMembers(group.members)} members ·{" "}
          <span className="inline-flex items-center gap-0.5"><Lock size={10} /> Private</span>
          {" · "}<span className="text-amber">Pending</span>
        </p>
      </div>
      <button onClick={() => onWithdraw(group.id)} className="btn-outline btn-sm text-coral border-coral/30 hover:bg-coral-light">
        Withdraw
      </button>
    </div>
  );
}

function GroupCard({ group, joined, onJoin }: { group: Group; joined: boolean; onJoin: () => void }) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <LogoBadge initials={group.logo} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink leading-tight">{group.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="chip text-[10px] py-0">{group.category}</span>
            {group.privacy === "private"
              ? <span className="text-[10px] text-muted flex items-center gap-0.5"><Lock size={10} /> Private</span>
              : <span className="text-[10px] text-muted flex items-center gap-0.5"><Globe size={10} /> Public</span>}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted line-clamp-2">{group.description}</p>
      <div className="flex items-center justify-between mt-auto">
        <p className="text-xs text-muted">{formatMembers(group.members)} members</p>
        <button onClick={onJoin} className="btn-accent btn-sm">
          {group.privacy === "private" ? "Request to join" : "Join"}
        </button>
      </div>
    </div>
  );
}

function GroupMenuBtn({ icon: Icon, label, onClick, className }: { icon: React.ElementType; label: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-paper transition-colors text-left", className)}
    >
      <Icon size={15} className="shrink-0" />
      {label}
    </button>
  );
}
