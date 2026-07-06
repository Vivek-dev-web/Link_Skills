"use client";

import { useState } from "react";
import { Newspaper, Search, Clock, Users, TrendingUp, Mail, Bell, BellOff, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Newsletter = {
  id: string;
  name: string;
  author: string;
  authorRole: string;
  category: string;
  frequency: string;
  subscribers: number;
  description: string;
  latestIssue: string;
  latestDate: string;
  tags: string[];
  logo: string;
  logoColor: string;
  featured?: boolean;
};

const CATEGORIES = ["All", "Technology", "Career", "AI & ML", "Design", "Finance", "Startups", "Marketing"];

const MOCK_NEWSLETTERS: Newsletter[] = [
  {
    id: "1",
    name: "TLDR Tech",
    author: "Dan Ni",
    authorRole: "Founder",
    category: "Technology",
    frequency: "Daily",
    subscribers: 1250000,
    description: "The most important stories in tech, science, and programming — curated in 5 minutes every morning.",
    latestIssue: "OpenAI o3 benchmarks, GitHub Copilot's new agent mode, and the Rust vs Go debate",
    latestDate: "Today",
    tags: ["Tech", "AI", "Programming"],
    logo: "TL",
    logoColor: "bg-teal-light text-teal-dark",
    featured: true,
  },
  {
    id: "2",
    name: "The Pragmatic Engineer",
    author: "Gergely Orosz",
    authorRole: "Staff Engineer @ Uber",
    category: "Technology",
    frequency: "Biweekly",
    subscribers: 380000,
    description: "Insights for software engineers at Big Tech and high-growth startups. Compensation, architecture, and career growth.",
    latestIssue: "How top engineers grow beyond the IC track",
    latestDate: "3 days ago",
    tags: ["Engineering", "Career", "BigTech"],
    logo: "PE",
    logoColor: "bg-brand/10 text-ink",
    featured: true,
  },
  {
    id: "3",
    name: "Lenny's Newsletter",
    author: "Lenny Rachitsky",
    authorRole: "Ex-Airbnb PM",
    category: "Career",
    frequency: "Weekly",
    subscribers: 720000,
    description: "Product management, growth strategies, and career advice from a former Airbnb product lead.",
    latestIssue: "The 10 traits that separate good PMs from great ones",
    latestDate: "1 week ago",
    tags: ["Product", "Career", "Growth"],
    logo: "LN",
    logoColor: "bg-coral-light text-coral",
    featured: true,
  },
  {
    id: "4",
    name: "AI Breakfast",
    author: "Andrei Zúbkov",
    authorRole: "AI Researcher",
    category: "AI & ML",
    frequency: "Daily",
    subscribers: 210000,
    description: "Quick, digestible coverage of AI research papers, model releases, and industry developments — before your morning coffee.",
    latestIssue: "Claude 5 system card analysis and multimodal reasoning benchmarks",
    latestDate: "Today",
    tags: ["AI", "Research", "LLMs"],
    logo: "AB",
    logoColor: "bg-amber-light text-amber-dark",
  },
  {
    id: "5",
    name: "Indian Startup Digest",
    author: "The Ken",
    authorRole: "Media Company",
    category: "Startups",
    frequency: "Weekly",
    subscribers: 95000,
    description: "Deep-dive analysis of Indian startup ecosystem — funding rounds, exits, regulatory changes, and founder stories.",
    latestIssue: "Inside Zepto's $1B Series G and quick commerce wars",
    latestDate: "5 days ago",
    tags: ["India", "Startups", "VC"],
    logo: "IS",
    logoColor: "bg-brand/10 text-ink",
  },
  {
    id: "6",
    name: "Design Lobster",
    author: "Harry Pearce",
    authorRole: "Creative Director @ Pentagram",
    category: "Design",
    frequency: "Weekly",
    subscribers: 145000,
    description: "Exploring the ideas behind great design — from brand identity to typography to cultural context.",
    latestIssue: "What makes a logo timeless? Lessons from the classics",
    latestDate: "4 days ago",
    tags: ["Design", "Brand", "Typography"],
    logo: "DL",
    logoColor: "bg-coral-light text-coral",
  },
  {
    id: "7",
    name: "No Priors",
    author: "Sarah Guo & Elad Gil",
    authorRole: "Venture Capitalists",
    category: "AI & ML",
    frequency: "Biweekly",
    subscribers: 340000,
    description: "The intersection of AI research and company building — conversations with top founders and researchers.",
    latestIssue: "Foundation model commoditization and where value accrues",
    latestDate: "2 weeks ago",
    tags: ["AI", "VentureCapital", "Startups"],
    logo: "NP",
    logoColor: "bg-teal-light text-teal-dark",
  },
  {
    id: "8",
    name: "Growth In Reverse",
    author: "Corey Haines",
    authorRole: "Indie Maker",
    category: "Marketing",
    frequency: "Weekly",
    subscribers: 78000,
    description: "Teardowns of how the fastest-growing SaaS companies built their initial audience without paid ads.",
    latestIssue: "Notion's 0-to-1M users playbook deconstructed",
    latestDate: "1 week ago",
    tags: ["Growth", "SaaS", "Marketing"],
    logo: "GR",
    logoColor: "bg-amber-light text-amber-dark",
  },
  {
    id: "9",
    name: "Money Control Daily",
    author: "MoneyControl",
    authorRole: "Financial Media",
    category: "Finance",
    frequency: "Daily",
    subscribers: 890000,
    description: "India's most-read financial news briefing — markets, economy, personal finance, and investing insights.",
    latestIssue: "Sensex hits 83K, IT sector outlook, and RBI policy watch",
    latestDate: "Today",
    tags: ["Finance", "Markets", "India"],
    logo: "MC",
    logoColor: "bg-brand/10 text-ink",
  },
];

function formatSubs(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
}

const FREQ_COLOR: Record<string, string> = {
  Daily: "chip-coral",
  Weekly: "chip-teal",
  Biweekly: "chip-amber",
};

export default function NewslettersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set(["1", "3"]));
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleSubscribe(id: string) {
    setSubscribed((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const myNewsletters = MOCK_NEWSLETTERS.filter((n) => subscribed.has(n.id));
  const featured = MOCK_NEWSLETTERS.filter((n) => n.featured && !subscribed.has(n.id));
  const discover = MOCK_NEWSLETTERS.filter(
    (n) =>
      !subscribed.has(n.id) &&
      (category === "All" || n.category === category) &&
      (search === "" ||
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase()) ||
        n.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink">Newsletters</h1>
        <p className="text-sm text-muted mt-1">Subscribe to professional insights delivered to your inbox</p>
      </div>

      {/* My subscriptions */}
      {myNewsletters.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Subscribed ({myNewsletters.length})</h2>
          <div className="card divide-y divide-border">
            {myNewsletters.map((n) => (
              <NewsletterRow
                key={n.id}
                newsletter={n}
                subscribed={true}
                expanded={expanded === n.id}
                onToggle={toggleSubscribe}
                onExpand={() => setExpanded(expanded === n.id ? null : n.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-teal" />
            <h2 className="font-display text-lg text-ink">Trending this week</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map((n) => (
              <FeaturedCard key={n.id} newsletter={n} subscribed={subscribed.has(n.id)} onToggle={toggleSubscribe} />
            ))}
          </div>
        </div>
      )}

      {/* Discover all */}
      <div>
        <h2 className="font-display text-lg text-ink mb-3">Discover newsletters</h2>

        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search newsletters…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "chip transition-colors",
                category === c ? "chip-teal" : "hover:bg-teal-light hover:text-teal-dark"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {discover.length === 0 ? (
          <div className="card p-10 text-center">
            <Newspaper size={32} className="mx-auto text-muted mb-3" />
            <p className="text-sm font-medium text-ink">No newsletters match your filters</p>
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {discover.map((n) => (
              <NewsletterRow
                key={n.id}
                newsletter={n}
                subscribed={subscribed.has(n.id)}
                expanded={expanded === n.id}
                onToggle={toggleSubscribe}
                onExpand={() => setExpanded(expanded === n.id ? null : n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewsletterRow({
  newsletter: n,
  subscribed,
  expanded,
  onToggle,
  onExpand,
}: {
  newsletter: Newsletter;
  subscribed: boolean;
  expanded: boolean;
  onToggle: (id: string) => void;
  onExpand: () => void;
}) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${n.logoColor}`}
        >
          {n.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-ink">{n.name}</p>
            <span className={`chip text-[10px] py-0 ${FREQ_COLOR[n.frequency] ?? "chip"}`}>{n.frequency}</span>
          </div>
          <p className="text-xs text-muted">by {n.author} · {n.authorRole}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted hidden sm:block">
            <Users size={11} className="inline mr-0.5" />
            {formatSubs(n.subscribers)}
          </span>
          <button
            onClick={() => onToggle(n.id)}
            className={cn(
              "btn-sm flex items-center gap-1.5",
              subscribed ? "btn-outline text-muted" : "btn-accent"
            )}
          >
            {subscribed ? <BellOff size={13} /> : <Bell size={13} />}
            {subscribed ? "Unsubscribe" : "Subscribe"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pl-13 space-y-2">
          <p className="text-xs text-muted">{n.description}</p>
          <div className="bg-paper rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              <Mail size={10} /> Latest issue · {n.latestDate}
            </div>
            <p className="text-xs text-ink font-medium">{n.latestIssue}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {n.tags.map((tag) => (
              <span key={tag} className="chip text-[10px] py-0">#{tag}</span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onExpand}
        className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors"
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? "Show less" : "Preview latest issue"}
      </button>
    </div>
  );
}

function FeaturedCard({
  newsletter: n,
  subscribed,
  onToggle,
}: {
  newsletter: Newsletter;
  subscribed: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${n.logoColor}`}>
          {n.logo}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{n.name}</p>
          <span className={`chip text-[10px] py-0 ${FREQ_COLOR[n.frequency] ?? "chip"}`}>{n.frequency}</span>
        </div>
      </div>
      <p className="text-xs text-muted line-clamp-2 flex-1">{n.description}</p>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-xs text-muted">
          <Users size={11} className="inline mr-0.5" />
          {formatSubs(n.subscribers)}
        </span>
        <button
          onClick={() => onToggle(n.id)}
          className={cn("btn-sm", subscribed ? "btn-outline" : "btn-accent")}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>
    </div>
  );
}
