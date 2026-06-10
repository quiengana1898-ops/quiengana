import "server-only";

import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db, schema } from "@/lib/db";

const { entities, federalContracts, jobRuns } = schema;

/** Staged (unpublished) contracts awaiting review, joined to their contractor. */
export async function getStagedContracts(limit = 100) {
  return db
    .select({
      id: federalContracts.id,
      contractId: federalContracts.contractId,
      amountUsd: federalContracts.obligatedAmountUsd,
      awardingAgency: federalContracts.awardingAgency,
      description: federalContracts.description,
      sourceUrl: federalContracts.sourceUrl,
      contractorId: federalContracts.contractorId,
      contractorName: entities.displayName,
      contractorPublished: entities.isPublished,
    })
    .from(federalContracts)
    .innerJoin(entities, eq(federalContracts.contractorId, entities.id))
    .where(eq(federalContracts.isPublished, false))
    .orderBy(desc(federalContracts.obligatedAmountUsd))
    .limit(limit);
}

export async function getStagedContractCount() {
  const [row] = await db
    .select({ n: count() })
    .from(federalContracts)
    .where(eq(federalContracts.isPublished, false));
  return row?.n ?? 0;
}

/** Staged (unpublished, not deleted) entities awaiting review. */
export async function getStagedEntities(limit = 100) {
  return db
    .select({
      id: entities.id,
      displayName: entities.displayName,
      entityType: entities.entityType,
      slug: entities.slug,
    })
    .from(entities)
    .where(and(eq(entities.isPublished, false), isNull(entities.deletedAt)))
    .orderBy(desc(entities.createdAt))
    .limit(limit);
}

export async function getRecentJobRuns(limit = 10) {
  return db
    .select()
    .from(jobRuns)
    .orderBy(desc(jobRuns.startedAt))
    .limit(limit);
}
