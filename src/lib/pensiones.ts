// Shared (client-safe) Pensiones helpers + row types. No DB / server-only imports
// here so client components (the lookup) can use them.

// US jurisdiction code (e.g. "US-OR") -> display state name. INTL/unknown pass through.
export const STATE_NAMES: Record<string, string> = {
  "US-WA": "Washington",
  "US-OR": "Oregon",
  "US-NY": "New York",
  "US-FL": "Florida",
  "US-NC": "North Carolina",
  "US-MA": "Massachusetts",
  "US-CA": "California",
  "US-IL": "Illinois",
  "US-NJ": "New Jersey",
  INTL: "International",
};

export function jurisdictionLabel(code: string | null): string {
  if (!code) return "";
  return STATE_NAMES[code] ?? code;
}

export type PensionInvestmentRow = {
  id: string;
  amountDisplay: string | null;
  amountUsd: number | null;
  fundName: string | null;
  pensionFundName: string;
  pensionFundSlug: string;
  pensionFundJurisdiction: string | null;
  pensionFundCategory: string;
  hedgeFundName: string;
  hedgeFundSlug: string;
};

export type BondClaimRow = {
  id: string;
  claimedAmountDisplay: string | null;
  claimedAmountUsd: number | null;
  shellEntity: string | null;
  hedgeFundName: string;
  hedgeFundSlug: string;
};
