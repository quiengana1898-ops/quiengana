import { RowActions } from "@/app/admin/staging/row-actions";
import { getStagedContracts } from "@/lib/queries/admin";

function usd(cents: number | null) {
  if (cents == null) return "—";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toFixed(0)}`;
}

export default async function StagingPage() {
  const contracts = await getStagedContracts(200);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium">Staging review</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ingested records, not yet public. Publish to promote (the contractor is
          published with it); reject to remove. Every action is audited.
        </p>
      </div>

      <div className="overflow-hidden rounded-sm border border-ink-line bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-line font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
            <tr>
              <th className="px-4 py-2">Contractor</th>
              <th className="px-4 py-2">Agency</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-faint">
                  Nothing staged. Run <code className="font-mono">npm run ingest:contratos</code>.
                </td>
              </tr>
            ) : (
              contracts.map((c) => (
                <tr key={c.id} className="border-b border-ink-line/60 align-top last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.contractorName}</div>
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-ink-faint underline-offset-2 hover:text-rojo hover:underline"
                    >
                      source
                    </a>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{c.awardingAgency ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-display font-semibold text-rojo">
                    {usd(c.amountUsd)}
                  </td>
                  <td className="max-w-[320px] px-4 py-3 text-xs text-ink-muted">
                    <span className="line-clamp-2">{c.description ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions kind="contract" id={c.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
