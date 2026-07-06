"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Users,
  BarChart2,
  FileText,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  Download,
  ChevronDown,
  ArrowRight,
  Dot,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

type Tab = "overview" | "content" | "audience";
type Range = "7" | "14" | "28" | "90" | "365";

function pctColor(n: number | null) {
  if (n === null) return "text-muted";
  if (n > 0) return "text-teal-dark";
  if (n < 0) return "text-coral";
  return "text-muted";
}
function PctBadge({ n }: { n: number | null }) {
  if (n === null) return <span className="text-muted text-xs flex items-center gap-0.5"><Minus size={11} /> 0%</span>;
  const color = pctColor(n);
  if (n > 0) return <span className={`text-xs flex items-center gap-0.5 ${color}`}><TrendingUp size={11} /> {n}%</span>;
  if (n < 0) return <span className={`text-xs flex items-center gap-0.5 ${color}`}><TrendingDown size={11} /> {Math.abs(n)}%</span>;
  return <span className="text-muted text-xs flex items-center gap-0.5"><Minus size={11} /> 0%</span>;
}

// Simple SVG line chart
function LineChart({
  data,
  height = 120,
  color = "#00C4A7",
  fill = true,
}: {
  data: number[];
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  if (data.length < 2) return <div className="h-[120px] flex items-center justify-center text-xs text-muted">Not enough data</div>;
  const w = 400;
  const h = height;
  const pad = { top: 8, right: 8, bottom: 8, left: 8 };
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  const pts = data.map((v, i) => {
    const x = pad.left + (i / (data.length - 1)) * (w - pad.left - pad.right);
    const y = pad.top + ((1 - (v - minVal) / range) * (h - pad.top - pad.bottom));
    return [x, y] as [number, number];
  });
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fillPath = fill
    ? `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${(h - pad.bottom).toFixed(1)} L${pts[0][0].toFixed(1)},${(h - pad.bottom).toFixed(1)} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {fill && (
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={fillPath} fill="url(#chartFill)" />}
      <path d={linePath} stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />
      ))}
    </svg>
  );
}

// Horizontal bar for demographics
function DemoBar({ label, pct, color = "bg-teal" }: { label: string; pct: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink">{label}</span>
        <span className="text-muted">{pct}%</span>
      </div>
      <div className="h-1 bg-paper rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "28", label: "28 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "365 days" },
];

const DEMO_TABS = ["All", "Job title", "Location", "Seniority", "Company", "Industry", "Company size"];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [tab, setTab] = useState<Tab>("overview");
  const [range, setRange] = useState<Range>("7");
  const [showRange, setShowRange] = useState(false);
  const [demoTab, setDemoTab] = useState("All");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const ov = data?.overview ?? {};
  const ca = data?.contentAnalytics ?? {};
  const aa = data?.audienceAnalytics ?? {};

  const impData = ca.dailyImpressions?.map((d: any) => d.impressions) ?? [];
  const impLabels = ca.dailyImpressions?.map((d: any) => d.label) ?? [];

  // Follower growth cumulative series
  const followerCumulative: number[] = (() => {
    if (!aa.followerGrowth) return [];
    const base = (aa.totalFollowers ?? 0) - (aa.followerGrowth?.length ?? 0);
    return aa.followerGrowth.map((_: any, i: number) => base + i + 1);
  })();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-6 items-start">
        {/* Left sidebar nav */}
        <aside className="w-48 shrink-0 hidden lg:block sticky top-20 self-start">
          <div className="card p-2 space-y-0.5">
            <div className="px-3 py-2 mb-1">
              <div className="flex items-center gap-2">
                <Avatar name={user?.name ?? "?"} src={user?.image} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink truncate">{user?.name}</p>
                </div>
              </div>
            </div>
            {[
              { id: "overview", label: "Overview" },
              { id: "content", label: "Content analytics" },
              { id: "audience", label: "Audience analytics" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                  tab === t.id
                    ? "text-teal font-semibold border-l-2 border-teal bg-teal-light/50 rounded-l-none"
                    : "text-ink hover:bg-paper"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Mobile tab strip */}
          <div className="flex gap-1 border-b border-border lg:hidden">
            {[
              { id: "overview", label: "Overview" },
              { id: "content", label: "Content" },
              { id: "audience", label: "Audience" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  tab === t.id ? "border-teal text-teal" : "border-transparent text-muted hover:text-ink"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-xl text-ink">Overview</h1>
              </div>

              {/* Track performance */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-ink">Track performance</h2>
                  <BarChart2 size={14} className="text-muted" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Post impressions in 7 days",
                      value: loading ? "—" : ov.postImpressions7 ?? 0,
                      delta: ov.postImpressionsDelta ?? null,
                      sub: "vs. prior 7 days",
                    },
                    {
                      label: "Total followers",
                      value: loading ? "—" : ov.totalFollowers ?? 0,
                      delta: ov.followersDelta ?? null,
                      sub: "vs. prior 7 days",
                    },
                    {
                      label: "Profile viewers in 90 days",
                      value: loading ? "—" : ov.profileViewers90 ?? 0,
                      delta: null,
                      sub: "vs. prior 7 days",
                    },
                    {
                      label: "Search appearances",
                      value: loading ? "—" : ov.searchAppearances ?? 0,
                      delta: null,
                      sub: "last 7 days",
                    },
                  ].map((kpi) => (
                    <div key={kpi.label} className="border border-border rounded-xl p-4 space-y-1">
                      <p className="font-display text-2xl text-ink">{kpi.value}</p>
                      <p className="text-xs text-muted leading-snug">{kpi.label}</p>
                      <div className="flex items-center gap-1.5">
                        <PctBadge n={kpi.delta} />
                        <span className="text-xs text-muted">{kpi.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly progress */}
              <div className="card p-5 space-y-4">
                <div>
                  <h2 className="font-semibold text-sm text-ink">Weekly progress</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}–
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Posts */}
                  <div className="border border-border rounded-xl p-4">
                    {ov.postsThisWeek > 0 ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-ink">{ov.postsThisWeek} post{ov.postsThisWeek !== 1 ? "s" : ""} this week</p>
                          <p className="text-xs text-muted mt-0.5">Members who post weekly get up to 4× more profile views.</p>
                        </div>
                        <TrendingUp size={20} className="text-teal shrink-0" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-ink">No posts yet</p>
                        <p className="text-xs text-muted mt-0.5">Members who post once per week on average see up to 4× more profile views.</p>
                        <Link href="/feed" className="mt-2 inline-flex items-center gap-1 text-teal text-xs font-medium hover:underline">
                          <FileText size={12} /> Start a post
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="border border-border rounded-xl p-4">
                    {ov.commentsThisWeek > 0 ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-ink">{ov.commentsThisWeek} comment{ov.commentsThisWeek !== 1 ? "s" : ""} this week</p>
                          <p className="text-xs text-muted mt-0.5">Keep engaging with your network!</p>
                        </div>
                        <MessageCircle size={20} className="text-teal shrink-0" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-ink">No comments yet</p>
                        <p className="text-xs text-muted mt-0.5">Members who comment once per week on average see up to 3× more profile views.</p>
                        <Link href="/feed" className="mt-2 inline-flex items-center gap-1 text-teal text-xs font-medium hover:underline">
                          Comment on feed <ArrowRight size={12} />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setTab("content")} className="btn-outline btn-sm flex items-center gap-1.5">
                  View content analytics <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── CONTENT ANALYTICS ── */}
          {tab === "content" && (
            <div className="space-y-5">
              {/* Range + Export header */}
              <div className="flex items-center justify-between">
                <div className="relative">
                  <button
                    onClick={() => setShowRange((s) => !s)}
                    className="btn-outline btn-sm flex items-center gap-1.5"
                  >
                    {RANGE_OPTIONS.find((r) => r.value === range)?.label}
                    <ChevronDown size={13} />
                  </button>
                  {showRange && (
                    <div className="absolute top-9 left-0 z-20 card p-2 w-40 space-y-1">
                      {RANGE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setRange(opt.value); setShowRange(false); }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-paper transition-colors",
                            range === opt.value ? "text-teal font-medium" : "text-ink"
                          )}
                        >
                          {opt.label}
                          {range === opt.value && (
                            <span className="w-4 h-4 rounded-full border-2 border-teal bg-teal inline-block" />
                          )}
                        </button>
                      ))}
                      <button className="w-full px-3 py-2 mt-1 rounded-lg text-sm text-center bg-teal text-white font-medium hover:bg-teal-dark transition-colors">
                        Show results
                      </button>
                    </div>
                  )}
                </div>
                <button className="btn-outline btn-sm flex items-center gap-1.5">
                  <Download size={13} /> Export
                </button>
              </div>

              {/* Content performance chart */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-ink">Content performance</h2>
                  <BarChart2 size={14} className="text-muted" />
                </div>

                <div className="flex gap-2">
                  <button className="btn-outline btn-sm flex items-center gap-1">Impressions <ChevronDown size={12} /></button>
                  <button className="btn-outline btn-sm flex items-center gap-1">Cumulative <ChevronDown size={12} /></button>
                </div>

                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-display text-2xl text-ink">{ca.totalImpressions ?? 0}</span>
                    <span className="text-sm text-muted">Impressions</span>
                  </div>
                  <PctBadge n={ov.postImpressionsDelta ?? null} />
                </div>

                {/* Chart */}
                <div className="relative">
                  {/* Y-axis labels */}
                  <div className="flex">
                    <div className="w-6 shrink-0" />
                    <div className="flex-1 border-l border-b border-border relative" style={{ height: 140 }}>
                      {[0, 1, 2, 3, 4].map((tick) => (
                        <div
                          key={tick}
                          className="absolute w-full border-t border-border/50"
                          style={{ bottom: `${(tick / 4) * 100}%` }}
                        >
                          <span className="absolute -left-6 -top-2 text-[10px] text-muted">{tick}</span>
                        </div>
                      ))}
                      <div className="absolute inset-0 p-1">
                        <LineChart data={impData.length > 0 ? impData : [0, 0, 1, 1, 3, 3, 3]} height={128} />
                      </div>
                    </div>
                  </div>
                  {/* X-axis labels */}
                  <div className="flex mt-1 ml-6">
                    {(impLabels.length > 0 ? impLabels : ["Jun 30", "Jul 1", "Jul 2", "Jul 3", "Jul 4", "Jul 5", "Jul 6"]).map(
                      (l: string, i: number) => (
                        <div key={i} className="flex-1 text-center text-[10px] text-muted">{l}</div>
                      )
                    )}
                  </div>
                  <p className="text-[10px] text-muted mt-1">Daily data is recorded in UTC</p>
                </div>
              </div>

              {/* Discovery */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-ink">Discovery</h2>
                  <BarChart2 size={14} className="text-muted" />
                </div>
                <div>
                  <p className="font-display text-2xl text-ink">{ca.totalImpressions ?? 0}</p>
                  <p className="text-xs text-muted">Impressions</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "In-network (followers and connections)", pct: ca.inNetworkPct ?? 40, icon: Users },
                    { label: "Out-of-network", pct: ca.outOfNetworkPct ?? 60, icon: TrendingUp },
                  ].map(({ label, pct, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon size={14} className="text-muted shrink-0" />
                      <span className="text-xs text-ink flex-1">{label}</span>
                      <span className="text-xs font-medium text-ink">{pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="font-display text-2xl text-ink">{ca.membersReached ?? 0}</p>
                  <p className="text-xs text-muted">Members reached</p>
                </div>

                {/* Tip banner */}
                <div className="bg-amber-light border border-amber/20 rounded-xl p-3 flex items-start gap-2">
                  <span className="text-sm">💡</span>
                  <div className="text-xs text-ink">
                    Members who post once a week can get up to 4× more profile views.{" "}
                    <Link href="/feed" className="text-teal font-medium hover:underline">Start a post →</Link>
                  </div>
                </div>
              </div>

              {/* Engagement */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-ink">Engagement</h2>
                  <BarChart2 size={14} className="text-muted" />
                </div>
                <div>
                  <p className="font-display text-2xl text-ink">
                    {(ca.engagement?.reactions ?? 0) + (ca.engagement?.comments ?? 0)}
                  </p>
                  <p className="text-xs text-muted">Social engagements</p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: "Reactions", value: ca.engagement?.reactions ?? 0, icon: TrendingUp },
                    { label: "Comments", value: ca.engagement?.comments ?? 0, icon: MessageCircle },
                    { label: "Reposts", value: ca.engagement?.reposts ?? 0, icon: Repeat2 },
                    { label: "Saves", value: ca.engagement?.saves ?? 0, icon: Bookmark },
                    { label: "Shares", value: 0, icon: Share2 },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Icon size={14} /> {label}
                      </div>
                      <span className="text-sm text-ink font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top performing posts */}
              {ca.topPosts?.length > 0 && (
                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm text-ink">Top performing posts</h2>
                    <BarChart2 size={14} className="text-muted" />
                  </div>
                  <div className="divide-y divide-border">
                    {ca.topPosts.map((post: any) => (
                      <div key={post.id} className="py-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span>{post.impressions} impression{post.impressions !== 1 ? "s" : ""}</span>
                          <Dot size={12} />
                          <span>{post.engagements} engagement{post.engagements !== 1 ? "s" : ""}</span>
                          <button className="ml-auto text-teal hover:underline font-medium flex items-center gap-1">
                            View analytics <ArrowRight size={11} />
                          </button>
                        </div>
                        <p className="text-sm text-ink line-clamp-2">{post.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AUDIENCE ANALYTICS ── */}
          {tab === "audience" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-xl text-ink">Audience analytics</h1>
                <button className="btn-outline btn-sm flex items-center gap-1.5">
                  <Download size={13} /> Export
                </button>
              </div>

              {/* Follower growth chart */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm text-ink">New followers</h2>
                    <BarChart2 size={14} className="text-muted" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowRange((s) => !s)}
                      className="btn-outline btn-sm flex items-center gap-1.5"
                    >
                      {RANGE_OPTIONS.find((r) => r.value === range)?.label}
                      <ChevronDown size={12} />
                    </button>
                    {showRange && (
                      <div className="absolute top-9 right-0 z-20 card p-2 w-40 space-y-1">
                        {RANGE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setRange(opt.value); setShowRange(false); }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-paper transition-colors",
                              range === opt.value ? "text-teal font-medium" : "text-ink"
                            )}
                          >
                            {opt.label}
                            {range === opt.value && (
                              <span className="w-4 h-4 rounded-full bg-teal inline-block" />
                            )}
                          </button>
                        ))}
                        <button
                          onClick={() => setShowRange(false)}
                          className="w-full px-3 py-2 mt-1 rounded-lg text-sm text-center bg-teal text-white font-medium hover:bg-teal-dark transition-colors"
                        >
                          Show results
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl text-ink">{aa.totalFollowers ?? 0}</span>
                  <span className="text-sm text-muted">Total followers</span>
                </div>
                {aa.newFollowersLast7 > 0 && (
                  <p className="text-xs text-teal-dark flex items-center gap-1">
                    <TrendingUp size={12} /> +{aa.newFollowersLast7} new in the last 7 days
                  </p>
                )}

                <div className="relative border-b border-l border-border" style={{ height: 120 }}>
                  <LineChart
                    data={followerCumulative.length > 1 ? followerCumulative : [0, 1, 2, 3, 5, 8, 13, 21, aa.totalFollowers ?? 21]}
                    height={120}
                    color="#00C4A7"
                    fill={true}
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-muted">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              {/* Top demographics */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-ink">Top demographics</h2>
                  <BarChart2 size={14} className="text-muted" />
                </div>

                {/* Demo category tabs */}
                <div className="flex flex-wrap gap-2">
                  {DEMO_TABS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setDemoTab(t)}
                      className={cn(
                        "chip text-xs transition-colors",
                        demoTab === t ? "chip-teal" : "hover:bg-teal-light hover:text-teal-dark"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Bars */}
                <div className="space-y-3 mt-2">
                  {(() => {
                    const d = aa.demographics ?? {};
                    const items =
                      demoTab === "Seniority"    ? d.seniority   :
                      demoTab === "Location"     ? d.locations   :
                      demoTab === "Industry"     ? d.industries  :
                      demoTab === "Company size" ? d.companySizes :
                      demoTab === "Job title"    ? d.jobTitles   :
                      d.companies; // "All" and "Company"
                    const color =
                      demoTab === "Seniority"    ? "bg-coral"     :
                      demoTab === "Industry"     ? "bg-amber-dark" :
                      demoTab === "Company size" ? "bg-teal"      :
                      demoTab === "Job title"    ? "bg-coral"     :
                      "bg-teal";
                    return items?.map((item: any) => (
                      <DemoBar key={item.name} label={item.name} pct={item.pct} color={color} />
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
