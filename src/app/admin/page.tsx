import Link from "next/link";

import { getRecentJobRuns, getStagedContractCount } from "@/lib/queries/admin";

function fmtTime(d: Date | null) {
  return d ? new Date(d).toISOString().replace("T", " ").slice(0, 16) : "—";
}

export default async function AdminDashboard() {
  const [stagedContracts, jobRuns] = await Promise.all([
    getStagedContractCount(),
    getRecentJobRuns(8),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl font-medium">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
        <Link
          href="/admin/staging"
          className="rounded-sm border border-ink-line bg-cream p-5 no-underline transition-colors hover:border-ink"
        >
          <div className="font-display text-4xl font-semibold text-rojo">
            {stagedContracts}
          </div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Contracts awaiting review →
          </div>
        </Link>
      </div>

      <div>
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Recent ingestion runs
        </h2>
        <div className="overflow-hidden rounded-sm border border-ink-line bg-cream">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-line font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
              <tr>
                <th className="px-4 py-2">Job</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Processed</th>
                <th className="px-4 py-2">Started</th>
              </tr>
            </thead>
            <tbody>
              {jobRuns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-ink-faint">
                    No runs yet.
                  </td>
                </tr>
              ) : (
                jobRuns.map((j) => (
                  <tr key={j.id} className="border-b border-ink-line/60 last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{j.jobName}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          j.status === "success"
                            ? "text-celeste-deep"
                            : j.status === "failure"
                              ? "text-rojo"
                              : "text-ink-muted"
                        }
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{j.recordsCreated ?? 0}</td>
                    <td className="px-4 py-2">{j.recordsProcessed ?? 0}</td>
                    <td className="px-4 py-2 font-mono text-xs text-ink-faint">
                      {fmtTime(j.startedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
