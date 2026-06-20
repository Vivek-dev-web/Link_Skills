"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Globe, Users2, Briefcase } from "lucide-react";
import JobCard from "@/components/JobCard";
import Avatar from "@/components/Avatar";

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => r.json())
      .then(setCompany);
  }, [id]);

  if (!company) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-paper border border-border flex items-center justify-center overflow-hidden shrink-0">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Briefcase size={24} className="text-muted" />
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink">{company.name}</h1>
            <p className="text-sm text-muted">{company.industry}{company.size ? ` · ${company.size}` : ""}</p>
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-coral flex items-center gap-1 mt-1">
                <Globe size={11} /> {company.website}
              </a>
            )}
            <p className="text-xs text-muted flex items-center gap-1 mt-1">
              <Users2 size={11} /> {company.employeesOnPlatform} on Atlas
            </p>
          </div>
        </div>
        {company.about && <p className="text-sm text-ink mt-4 whitespace-pre-wrap">{company.about}</p>}
      </div>

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Open roles ({company.jobs?.length ?? 0})</h2>
        {company.jobs?.length === 0 ? (
          <p className="text-sm text-muted">No open roles right now.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {company.jobs?.map((j: any) => (
              <JobCard key={j.id} job={{ ...j, company }} />
            ))}
          </div>
        )}
      </div>

      {company.members?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-lg text-ink mb-3">Recruiters</h2>
          <div className="flex flex-wrap gap-3">
            {company.members.map((m: any) => (
              <Link key={m.id} href={`/profile/${m.user.id}`} className="flex items-center gap-2">
                <Avatar name={m.user.name} src={m.user.image} size="sm" />
                <span className="text-sm text-ink">{m.user.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
