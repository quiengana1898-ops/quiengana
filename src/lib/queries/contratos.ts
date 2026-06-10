import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import type { ContractRow } from "@/lib/contratos";

export type { ContractRow } from "@/lib/contratos";

const { entities, federalContracts } = schema;

/** Published contracts joined to their (published, non-deleted) contractor. */
export async function getPublishedContracts(limit = 200): Promise<ContractRow[]> {
  return db
    .select({
      id: federalContracts.id,
      amountUsd: federalContracts.obligatedAmountUsd,
      awardingAgency: federalContracts.awardingAgency,
      description: federalContracts.description,
      sourceUrl: federalContracts.sourceUrl,
      contractorName: entities.displayName,
      contractorSlug: entities.slug,
    })
    .from(federalContracts)
    .innerJoin(entities, eq(federalContracts.contractorId, entities.id))
    .where(
      and(
        eq(federalContracts.isPublished, true),
        eq(entities.isPublished, true),
        isNull(entities.deletedAt),
      ),
    )
    .orderBy(desc(federalContracts.obligatedAmountUsd))
    .limit(limit);
}
