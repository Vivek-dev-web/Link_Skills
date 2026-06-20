"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, FileText } from "lucide-react";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { Users2 } from "lucide-react";
import { APPLICATION_PIPELINE, APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { useToast } from "@/components/Toast";

export default function ApplicantPipelinePage() {
  const { id } = useParams<{ id: string }>();
  const { show } = useToast();
  const [data, setData] = useState<{ applications: any[]; job: any } | null>(null);

  async function load() {
    const res = await fetch(`/api/jobs/${id}/applications`);
    const json = await res.json();
    if (res.ok) setData(json);
    else show(json.error ?? "Couldn't load applicants", "error");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(applicationId: string, status: string) {
    setData((d) =>
      d ? { ...d, applications: d.applications.map((a) => (a.id === applicationId ? { ...a, status } : a)) } : d
    );
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      show("Couldn't update status", "error");
      load();
    }
  }

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  const columns = APPLICATION_PIPELINE;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-ink">{data.job.title}</h1>
        <p className="text-sm text-muted">{data.applications.length} applicant{data.applications.length === 1 ? "" : "s"}</p>
      </div>

      {data.applications.length === 0 ? (
        <EmptyState icon={Users2} title="No applicants yet" description="Share the job link to start getting applications." />
      ) : (
        <div className="grid md:grid-cols-5 gap-3 overflow-x-auto">
          {columns.map((stage) => (
            <div key={stage} className="min-w-[220px]">
              <p className="label">{APPLICATION_STATUS_LABELS[stage]} ({data.applications.filter((a) => a.status === stage).length})</p>
              <div className="space-y-2">
                {data.applications
                  .filter((a) => a.status === stage)
                  .map((app) => (
                    <div key={app.id} className="card p-3">
                      <Link href={`/profile/${app.applicant.id}`} className="flex items-center gap-2">
                        <Avatar name={app.applicant.name} src={app.applicant.image} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-ink truncate">{app.applicant.name}</p>
                          <p className="text-[11px] text-muted truncate">{app.applicant.headline}</p>
                        </div>
                      </Link>
                      {app.applicant.resumeUrl && (
                        <a
                          href={app.applicant.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-coral mt-2"
                        >
                          <FileText size={11} /> Resume
                        </a>
                      )}
                      <select
                        className="input !py-1 !text-xs mt-2"
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                      >
                        {columns.map((s) => (
                          <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
