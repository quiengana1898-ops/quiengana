// Client-safe El Cable types + formatters (no DB imports), usable by server
// pages and any future client feed component.

/** An entity mentioned in an article. `linkable` = has a live detail page. */
export type CableMention = {
  entityId: string;
  name: string;
  slug: string;
  entityType: string;
  confidence: number | null;
};

export type CableArticle = {
  id: string;
  url: string;
  title: string;
  source: string;
  publishedAt: Date;
  language: string;
  mentions: CableMention[];
};

// Only pension/hedge entities have detail pages today (/circuitos/pensiones/[slug]).
// Other entity types render as plain (non-link) chips until their pages exist.
const LINKABLE_TYPES = new Set(["pension_fund", "hedge_fund"]);

export function entityHref(m: CableMention): string | null {
  return LINKABLE_TYPES.has(m.entityType)
    ? `/circuitos/pensiones/${m.slug}`
    : null;
}

/** Locale-aware date label, e.g. "Jun 30, 2026" / "30 jun 2026". */
export function formatArticleDate(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
