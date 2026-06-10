import "server-only";

import { and, desc, eq, isNull, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db, schema } from "@/lib/db";
import type { BondClaimRow, PensionInvestmentRow } from "@/lib/pensiones";

// Re-export client-safe helpers/types so server callers can import from one place.
export { jurisdictionLabel } from "@/lib/pensiones";
export type { BondClaimRow, PensionInvestmentRow } from "@/lib/pensiones";

const { entities, pensionInvestments, ersBondClaims } = schema;

/** Published pension investments (SPEC §9.0), joined to both entity sides, for the lookup. */
export async function getPensionInvestments(): Promise<PensionInvestmentRow[]> {
  const pf = alias(entities, "pf");
  const hf = alias(entities, "hf");

  const rows = await db
    .select({
      id: pensionInvestments.id,
      amountDisplay: pensionInvestments.amountDisplay,
      amountUsd: pensionInvestments.amountUsd,
      fundName: pensionInvestments.fundName,
      pensionFundName: pf.displayName,
      pensionFundSlug: pf.slug,
      pensionFundJurisdiction: pf.jurisdiction,
      pensionFundMetadata: pf.metadata,
      hedgeFundName: hf.displayName,
      hedgeFundSlug: hf.slug,
    })
    .from(pensionInvestments)
    .innerJoin(pf, eq(pensionInvestments.pensionFundId, pf.id))
    .innerJoin(hf, eq(pensionInvestments.hedgeFundId, hf.id))
    .where(
      and(
        eq(pensionInvestments.isPublished, true),
        isNull(pensionInvestments.deletedAt),
      ),
    )
    .orderBy(desc(pensionInvestments.amountUsd));

  return rows.map((r) => ({
    id: r.id,
    amountDisplay: r.amountDisplay,
    amountUsd: r.amountUsd,
    fundName: r.fundName,
    pensionFundName: r.pensionFundName,
    pensionFundSlug: r.pensionFundSlug,
    pensionFundJurisdiction: r.pensionFundJurisdiction,
    pensionFundCategory:
      (r.pensionFundMetadata as { category?: string } | null)?.category ??
      "state",
    hedgeFundName: r.hedgeFundName,
    hedgeFundSlug: r.hedgeFundSlug,
  }));
}

export type EntityDetail = Awaited<ReturnType<typeof getEntityBySlug>>;

/**
 * One published entity by slug, with its related pension investments (from the
 * other side of the relationship) and, for hedge funds, its ERS bond claims.
 */
export async function getEntityBySlug(slug: string) {
  const [entity] = await db
    .select()
    .from(entities)
    .where(
      and(
        eq(entities.slug, slug),
        eq(entities.isPublished, true),
        isNull(entities.deletedAt),
      ),
    )
    .limit(1);

  if (!entity) return null;

  const pf = alias(entities, "pf");
  const hf = alias(entities, "hf");

  // Investments where this entity is either side.
  const investments = await db
    .select({
      id: pensionInvestments.id,
      amountDisplay: pensionInvestments.amountDisplay,
      fundName: pensionInvestments.fundName,
      sourceUrl: pensionInvestments.sourceUrl,
      sourceDescription: pensionInvestments.sourceDescription,
      pensionFundName: pf.displayName,
      pensionFundSlug: pf.slug,
      pensionFundJurisdiction: pf.jurisdiction,
      hedgeFundName: hf.displayName,
      hedgeFundSlug: hf.slug,
    })
    .from(pensionInvestments)
    .innerJoin(pf, eq(pensionInvestments.pensionFundId, pf.id))
    .innerJoin(hf, eq(pensionInvestments.hedgeFundId, hf.id))
    .where(
      and(
        eq(pensionInvestments.isPublished, true),
        isNull(pensionInvestments.deletedAt),
        or(
          eq(pensionInvestments.pensionFundId, entity.id),
          eq(pensionInvestments.hedgeFundId, entity.id),
        ),
      ),
    )
    .orderBy(desc(pensionInvestments.amountUsd));

  const bondClaims =
    entity.entityType === "hedge_fund"
      ? await db
          .select()
          .from(ersBondClaims)
          .where(
            and(
              eq(ersBondClaims.hedgeFundId, entity.id),
              eq(ersBondClaims.isPublished, true),
            ),
          )
      : [];

  return { entity, investments, bondClaims };
}

/** Published ERS bond claims (SPEC §9.0), joined to the hedge fund that filed them. */
export async function getErsBondClaims(): Promise<BondClaimRow[]> {
  const rows = await db
    .select({
      id: ersBondClaims.id,
      claimedAmountDisplay: ersBondClaims.claimedAmountDisplay,
      claimedAmountUsd: ersBondClaims.claimedAmountUsd,
      shellEntity: ersBondClaims.shellEntity,
      hedgeFundName: entities.displayName,
      hedgeFundSlug: entities.slug,
    })
    .from(ersBondClaims)
    .innerJoin(entities, eq(ersBondClaims.hedgeFundId, entities.id))
    .where(eq(ersBondClaims.isPublished, true))
    .orderBy(desc(ersBondClaims.claimedAmountUsd));
  return rows;
}

/** Slugs for static generation of entity detail pages. */
export async function getPublishedEntitySlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: entities.slug })
    .from(entities)
    .where(and(eq(entities.isPublished, true), isNull(entities.deletedAt)));
  return rows.map((r) => r.slug);
}
