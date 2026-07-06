"use client";

import { useState } from "react";
import { Building2, Search, Users, Globe, ExternalLink, TrendingUp, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

type PageType = "company" | "creator";

type Page = {
  id: string;
  name: string;
  type: PageType;
  category: string;
  tagline: string;
  followers: number;
  logo: string;
  logoColor: string;
  verified: boolean;
  website?: string;
  tags: string[];
};

const CATEGORIES = ["All", "Technology", "Design", "Finance", "Media", "Education", "Health", "E-commerce"];

const MOCK_PAGES: Page[] = [
  {
    id: "1",
    name: "Google India",
    type: "company",
    category: "Technology",
    tagline: "Organizing the world's information and making it universally accessible.",
    followers: 4200000,
    logo: "G",
    logoColor: "bg-teal-light text-teal-dark",
    verified: true,
    website: "google.com",
    tags: ["Search", "Cloud", "AI"],
  },
  {
    id: "2",
    name: "Zerodha",
    type: "company",
    category: "Finance",
    tagline: "India's largest stock broker by active clients. Simple. Transparent. Fair.",
    followers: 1800000,
    logo: "Z",
    logoColor: "bg-amber-light text-amber-dark",
    verified: true,
    website: "zerodha.com",
    tags: ["Trading", "FinTech", "Investing"],
  },
  {
    id: "3",
    name: "Nikhil Kamath",
    type: "creator",
    category: "Finance",
    tagline: "Co-founder, Zerodha & True Beacon. Investing, startups, and India's economy.",
    followers: 950000,
    logo: "NK",
    logoColor: "bg-coral-light text-coral",
    verified: true,
    tags: ["Investing", "Startups", "Finance"],
  },
  {
    id: "4",
    name: "Razorpay",
    type: "company",
    category: "Finance",
    tagline: "The new-age business banking platform powering India's digital payments.",
    followers: 1200000,
    logo: "R",
    logoColor: "bg-teal-light text-teal-dark",
    verified: true,
    website: "razorpay.com",
    tags: ["Payments", "FinTech", "APIs"],
  },
  {
    id: "5",
    name: "Tanmay Bhat",
    type: "creator",
    category: "Media",
    tagline: "Comedian. Creator. Advisor. Building things at the intersection of comedy & tech.",
    followers: 3200000,
    logo: "TB",
    logoColor: "bg-amber-light text-amber-dark",
    verified: true,
    tags: ["Comedy", "Creator", "Media"],
  },
  {
    id: "6",
    name: "Scaler Academy",
    type: "company",
    category: "Education",
    tagline: "Tech education for working professionals. DSA, System Design, and career transitions.",
    followers: 2100000,
    logo: "S",
    logoColor: "bg-brand/10 text-ink",
    verified: true,
    website: "scaler.com",
    tags: ["EdTech", "DSA", "Careers"],
  },
  {
    id: "7",
    name: "Kunal Shah",
    type: "creator",
    category: "Technology",
    tagline: "Founder of CRED. Thinker. Delta 4 framework. Trust as a competitive moat.",
    followers: 1650000,
    logo: "KS",
    logoColor: "bg-coral-light text-coral",
    verified: true,
    tags: ["Startups", "Fintech", "Frameworks"],
  },
  {
    id: "8",
    name: "Freshworks",
    type: "company",
    category: "Technology",
    tagline: "Modern customer and employee experience software built for the mid-market.",
    followers: 1400000,
    logo: "F",
    logoColor: "bg-teal-light text-teal-dark",
    verified: true,
    website: "freshworks.com",
    tags: ["SaaS", "CRM", "Support"],
  },
  {
    id: "9",
    name: "Priya Mohan",
    type: "creator",
    category: "Design",
    tagline: "Lead Designer @ Swiggy. Writing about product design, systems, and career growth.",
    followers: 215000,
    logo: "PM",
    logoColor: "bg-amber-light text-amber-dark",
    verified: false,
    tags: ["ProductDesign", "UIX", "Career"],
  },
  {
    id: "10",
    name: "Meesho",
    type: "company",
    category: "E-commerce",
    tagline: "Enabling small businesses to succeed online. India's fastest growing e-commerce platform.",
    followers: 890000,
    logo: "M",
    logoColor: "bg-coral-light text-coral",
    verified: true,
    website: "meesho.com",
    tags: ["E-commerce", "SMB", "Social"],
  },
  {
    id: "11",
    name: "The Ken",
    type: "company",
    category: "Media",
    tagline: "Subscriber-only journalism. In-depth business and technology stories from South & Southeast Asia.",
    followers: 420000,
    logo: "TK",
    logoColor: "bg-brand/10 text-ink",
    verified: true,
    website: "the-ken.com",
    tags: ["Journalism", "Business", "Asia"],
  },
  {
    id: "12",
    name: "Arpit Bhayani",
    type: "creator",
    category: "Technology",
    tagline: "System Design, DSA, and engineering at scale. Teach what I learn at Gojek.",
    followers: 380000,
    logo: "AB",
    logoColor: "bg-teal-light text-teal-dark",
    verified: false,
    tags: ["SystemDesign", "DSA", "Engineering"],
  },
];

function formatFollowers(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
}

export default function PagesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"all" | "company" | "creator">("all");
  const [following, setFollowing] = useState<Set<string>>(new Set(["1", "6"]));

  function toggleFollow(id: string) {
    setFollowing((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const myPages = MOCK_PAGES.filter((p) => following.has(p.id));
  const discover = MOCK_PAGES.filter(
    (p) =>
      !following.has(p.id) &&
      (category === "All" || p.category === category) &&
      (typeFilter === "all" || p.type === typeFilter) &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.tagline.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink">Pages</h1>
        <p className="text-sm text-muted mt-1">Follow companies and creators to stay informed</p>
      </div>

      {/* Following */}
      {myPages.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Pages you follow ({myPages.length})</h2>
          <div className="card divide-y divide-border">
            {myPages.map((p) => (
              <PageRow key={p.id} page={p} followed={true} onToggle={toggleFollow} />
            ))}
          </div>
        </div>
      )}

      {/* Discover */}
      <div>
        <h2 className="font-display text-lg text-ink mb-3">Discover pages</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search pages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Type + Category filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: "All pages" },
            { id: "company", label: "Companies" },
            { id: "creator", label: "Creators" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id as "all" | "company" | "creator")}
              className={cn(
                "chip transition-colors",
                typeFilter === t.id ? "chip-coral" : "hover:bg-coral-light hover:text-coral"
              )}
            >
              {t.id === "company" ? <Building2 size={11} className="inline mr-1" /> : null}
              {t.id === "creator" ? <TrendingUp size={11} className="inline mr-1" /> : null}
              {t.label}
            </button>
          ))}

          <span className="text-muted self-center text-xs">·</span>

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
            <Building2 size={32} className="mx-auto text-muted mb-3" />
            <p className="text-sm font-medium text-ink">No pages match your filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {discover.map((p) => (
              <PageCard key={p.id} page={p} followed={following.has(p.id)} onToggle={toggleFollow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PageRow({ page, followed, onToggle }: { page: Page; followed: boolean; onToggle: (id: string) => void }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${page.logoColor}`}>
        {page.logo}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-ink truncate">{page.name}</p>
          {page.verified && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <circle cx="7" cy="7" r="7" fill="#00C4A7" />
              <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <p className="text-xs text-muted">
          {page.type === "company" ? (
            <span className="flex items-center gap-1"><Briefcase size={10} /> Company</span>
          ) : (
            <span className="flex items-center gap-1"><TrendingUp size={10} /> Creator</span>
          )}
        </p>
      </div>
      <p className="text-xs text-muted shrink-0">{formatFollowers(page.followers)} followers</p>
      <button onClick={() => onToggle(page.id)} className={cn("btn-sm", followed ? "btn-outline" : "btn-accent")}>
        {followed ? "Following" : "Follow"}
      </button>
    </div>
  );
}

function PageCard({ page, followed, onToggle }: { page: Page; followed: boolean; onToggle: (id: string) => void }) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${page.logoColor}`}>
          {page.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-ink truncate">{page.name}</p>
            {page.verified && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <circle cx="7" cy="7" r="7" fill="#00C4A7" />
                <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="chip text-[10px] py-0">{page.category}</span>
            <span className="text-[10px] text-muted">
              {page.type === "company" ? "Company" : "Creator"}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted line-clamp-2">{page.tagline}</p>

      <div className="flex flex-wrap gap-1">
        {page.tags.map((tag) => (
          <span key={tag} className="chip text-[10px] py-0">#{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
        <span className="text-xs text-muted flex items-center gap-1">
          <Users size={11} /> {formatFollowers(page.followers)}
        </span>
        <div className="flex items-center gap-2">
          {page.website && (
            <a
              href={`https://${page.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-teal transition-colors"
            >
              <Globe size={14} />
            </a>
          )}
          <button onClick={() => onToggle(page.id)} className={cn("btn-sm", followed ? "btn-outline" : "btn-accent")}>
            {followed ? "Following" : "Follow"}
          </button>
        </div>
      </div>
    </div>
  );
}
