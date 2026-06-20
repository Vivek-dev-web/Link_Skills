"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

type Tab = "people" | "jobs" | "courses" | "companies";

function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [tab, setTab] = useState<Tab>("people");
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!initialQ) return;
    setResults(null);
    fetch(`/api/search?q=${encodeURIComponent(initialQ)}`)
      .then((r) => r.json())
      .then(setResults);
  }, [initialQ]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  const counts = results
    ? {
        people: results.people.length,
        jobs: results.jobs.length,
        courses: results.courses.length,
        companies: results.companies.length,
      }
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <form onSubmit={handleSearch} className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people, jobs, courses, companies…"
        />
      </form>

      {!initialQ && <p className="text-sm text-muted">Type something to search across Atlas.</p>}

      {initialQ && results === null && (
        <div className="flex justify-center py-14">
          <Loader2 className="animate-spin text-muted" />
        </div>
      )}

      {results && (
        <>
          <div className="flex gap-1 border-b border-border">
            {(["people", "jobs", "courses", "companies"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize",
                  tab === t ? "border-coral text-coral" : "border-transparent text-muted hover:text-ink"
                )}
              >
                {t} {counts && counts[t] > 0 ? `(${counts[t]})` : ""}
              </button>
            ))}
          </div>

          {tab === "people" && (
            <div className="card divide-y divide-border">
              {results.people.length === 0 && <p className="p-4 text-sm text-muted">No people matched.</p>}
              {results.people.map((p: any) => (
                <Link key={p.id} href={`/profile/${p.id}`} className="flex items-center gap-3 p-4 hover:bg-paper">
                  <Avatar name={p.name} src={p.image} />
                  <div>
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-muted">{p.headline}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tab === "jobs" && (
            <div className="card divide-y divide-border">
              {results.jobs.length === 0 && <p className="p-4 text-sm text-muted">No jobs matched.</p>}
              {results.jobs.map((j: any) => (
                <Link key={j.id} href={`/jobs/${j.id}`} className="flex items-center gap-3 p-4 hover:bg-paper">
                  <div className="h-10 w-10 rounded-lg bg-paper border border-border shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink">{j.title}</p>
                    <p className="text-xs text-muted">{j.company?.name} · {j.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tab === "courses" && (
            <div className="card divide-y divide-border">
              {results.courses.length === 0 && <p className="p-4 text-sm text-muted">No courses matched.</p>}
              {results.courses.map((c: any) => (
                <Link key={c.id} href={`/courses/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-paper">
                  <div className="h-10 w-10 rounded-lg bg-amber-light shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink">{c.title}</p>
                    <p className="text-xs text-muted">{c.level}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tab === "companies" && (
            <div className="card divide-y divide-border">
              {results.companies.length === 0 && <p className="p-4 text-sm text-muted">No companies matched.</p>}
              {results.companies.map((c: any) => (
                <Link key={c.id} href={`/companies/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-paper">
                  <div className="h-10 w-10 rounded-lg bg-paper border border-border shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-muted">{c.industry}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
