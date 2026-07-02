// Client-safe search types + helpers (no DB imports). Shared by the API route,
// the hero search component, and any results view.

export type SearchResult = {
  name: string;
  slug: string;
  entityType: string;
  href: string; // where clicking the result lands (routed per circuit)
};

// entity_type -> i18n key under the `search.kind` namespace (label shown on results).
export const KIND_KEY: Record<string, string> = {
  contractor: "contractor",
  hedge_fund: "hedgeFund",
  pension_fund: "pensionFund",
  government_body: "government",
  corporation: "corporation",
  individual: "individual",
  pharma_company: "pharma",
  union: "union",
  property_owner: "propertyOwner",
  other: "other",
};

export function kindKey(entityType: string): string {
  return KIND_KEY[entityType] ?? "other";
}

/**
 * Where a search hit routes. Pension/hedge funds have detail pages; contractors
 * deep-link into the Contratos browser pre-filtered by name; everything else
 * falls back to the circuits index. Locale prefix is added by the i18n <Link>.
 */
export function resultHref(entityType: string, slug: string, name: string): string {
  if (entityType === "pension_fund" || entityType === "hedge_fund") {
    return `/circuitos/pensiones/${slug}`;
  }
  if (entityType === "contractor") {
    return `/circuitos/contratos?q=${encodeURIComponent(name)}`;
  }
  return `/circuitos`;
}
