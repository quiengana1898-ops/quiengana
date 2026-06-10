// Client-safe Contratos helpers + types (no DB imports), usable by the client
// contract browser.

export type ContractRow = {
  id: string;
  amountUsd: number | null;
  awardingAgency: string | null;
  description: string | null;
  sourceUrl: string;
  contractorName: string;
  contractorSlug: string;
};

/** cents -> compact USD ($797.1M / $250K / $900). */
export function usdCompact(cents: number | null): string {
  if (cents == null) return "—";
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${(d / 1_000).toFixed(0)}K`;
  return `$${d.toFixed(0)}`;
}
