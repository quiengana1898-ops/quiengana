"use client";

import { useState, useTransition } from "react";

import { publishContracts, rejectContract } from "@/app/admin/actions";
import { usdCompact } from "@/lib/contratos";

export type StagedRow = {
  id: string;
  awardingAgency: string | null;
  amountUsd: number | null;
  description: string | null;
  sourceUrl: string;
  contractorName: string;
};

export function StagingTable({ contracts }: { contracts: StagedRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allSelected = selected.size > 0 && selected.size === contracts.length;
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(contracts.map((c) => c.id)));

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        setSelected(new Set());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending || selected.size === 0}
          onClick={() => run(() => publishContracts([...selected]))}
          className="cursor-pointer rounded-xs bg-celeste-deep px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-cream disabled:opacity-40"
        >
          Publish selected ({selected.size})
        </button>
        <button
          type="button"
          disabled={pending || contracts.length === 0}
          onClick={() => run(() => publishContracts(contracts.map((c) => c.id)))}
          className="cursor-pointer rounded-xs border border-ink-line-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted hover:border-ink hover:text-ink disabled:opacity-40"
        >
          Publish all ({contracts.length})
        </button>
        {pending && <span className="font-mono text-[11px] text-ink-faint">working…</span>}
        {error && <span className="font-mono text-[11px] text-rojo">{error}</span>}
      </div>

      <div className="overflow-hidden rounded-sm border border-ink-line bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-line font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
            <tr>
              <th className="px-3 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="select all" />
              </th>
              <th className="px-4 py-2">Contractor</th>
              <th className="px-4 py-2">Agency</th>
              <th className="px-4 py-2 text-right">Amount</th>
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
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      aria-label={`select ${c.contractorName}`}
                    />
                  </td>
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
                    {usdCompact(c.amountUsd)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => rejectContract(c.id))}
                      className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:text-rojo disabled:opacity-40"
                    >
                      Reject
                    </button>
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
