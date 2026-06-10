// NOTE: no `server-only` guard here — this module runs both in the Inngest route
// (server) and via the CLI runner (tsx). It is never imported by a client component.
import { eq, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { slugify } from "@/lib/slugify";

const { entities, federalContracts, jobRuns } = schema;

const JOB_NAME = "contratos/pull-usaspending";
const API = "https://api.usaspending.gov/api/v2/search/spending_by_award/";

// USASpending award record: keys match the requested field labels, plus the
// always-present generated_internal_id (globally unique; also the detail-URL id).
export type UsaspendingAward = Record<string, unknown> & {
  generated_internal_id?: string;
  "Award ID"?: string;
  "Recipient Name"?: string;
  "Awarding Agency"?: string;
  "Award Amount"?: number;
  "Start Date"?: string;
  "End Date"?: string;
  Description?: string;
};

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;
const toCents = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? Math.round(v * 100) : null;

export type FetchOpts = {
  /** earliest award start date (default Maria onward) */
  startDate?: string;
  endDate?: string;
  /** records per page (USASpending max 100) */
  pageSize?: number;
  /** max pages to pull in one run (politeness/bound) */
  maxPages?: number;
};

/**
 * Fetch PR place-of-performance contracts from USASpending, largest first.
 * Paginates politely (small delay between pages) to respect their edge WAF.
 */
export async function fetchPrContracts(
  opts: FetchOpts = {},
): Promise<UsaspendingAward[]> {
  const {
    startDate = "2017-09-01",
    endDate = "2025-12-31",
    pageSize = 100,
    maxPages = 5,
  } = opts;

  const all: UsaspendingAward[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: {
          place_of_performance_locations: [{ country: "USA", state: "PR" }],
          award_type_codes: ["A", "B", "C", "D"],
          time_period: [{ start_date: startDate, end_date: endDate }],
        },
        fields: [
          "Award ID",
          "Recipient Name",
          "Awarding Agency",
          "Award Amount",
          "Start Date",
          "End Date",
          "Description",
        ],
        sort: "Award Amount",
        order: "desc",
        limit: pageSize,
        page,
      }),
    });
    if (!res.ok) throw new Error(`USASpending ${res.status} on page ${page}`);
    const json = (await res.json()) as {
      results?: UsaspendingAward[];
      page_metadata?: { hasNext?: boolean };
    };
    all.push(...(json.results ?? []));
    if (!json.page_metadata?.hasNext) break;
    await new Promise((r) => setTimeout(r, 400)); // be polite
  }
  return all;
}

/**
 * Write awards to STAGING (is_published=false): upsert one contractor entity per
 * recipient, upsert the contract. Idempotent (entities by slug, contracts by
 * contract_id). Never auto-publishes — a human promotes via /admin.
 */
export async function ingestAwards(awards: UsaspendingAward[]) {
  let created = 0;
  let updated = 0;

  for (const a of awards) {
    const contractId = str(a.generated_internal_id) ?? str(a["Award ID"]);
    const recipient = str(a["Recipient Name"]);
    if (!contractId || !recipient) continue;

    // Contractor entity (staging). On conflict, keep existing publish state.
    const slug = slugify(recipient);
    const [ent] = await db
      .insert(entities)
      .values({
        entityType: "contractor",
        displayName: recipient,
        slug,
        isPublished: false,
      })
      .onConflictDoUpdate({
        target: entities.slug,
        set: { updatedAt: new Date() },
      })
      .returning({ id: entities.id });

    const cents = toCents(a["Award Amount"]);
    const values = {
      contractId,
      contractorId: ent.id,
      awardingAgency: str(a["Awarding Agency"]),
      obligatedAmountUsd: cents,
      currentAmountUsd: cents,
      awardDate: str(a["Start Date"]),
      periodOfPerformanceStart: str(a["Start Date"]),
      periodOfPerformanceEnd: str(a["End Date"]),
      placeOfPerformance: "Puerto Rico",
      description: str(a.Description),
      sourceUrl: `https://www.usaspending.gov/award/${contractId}`,
      rawData: a,
      isPublished: false,
    };

    const res = await db
      .insert(federalContracts)
      .values(values)
      .onConflictDoUpdate({
        target: federalContracts.contractId,
        set: {
          contractorId: values.contractorId,
          awardingAgency: values.awardingAgency,
          obligatedAmountUsd: values.obligatedAmountUsd,
          currentAmountUsd: values.currentAmountUsd,
          description: values.description,
          rawData: values.rawData,
        },
      })
      .returning({ inserted: sql<boolean>`(xmax = 0)` });

    if (res[0]?.inserted) created++;
    else updated++;
  }

  return { created, updated, processed: awards.length };
}

/** Full job: fetch + ingest, wrapped in a job_runs record for observability. */
export async function pullUsaspending(opts: FetchOpts = {}) {
  const [run] = await db
    .insert(jobRuns)
    .values({ jobName: JOB_NAME, status: "running", startedAt: new Date() })
    .returning({ id: jobRuns.id });

  try {
    const awards = await fetchPrContracts(opts);
    const { created, updated, processed } = await ingestAwards(awards);
    await db
      .update(jobRuns)
      .set({
        status: "success",
        recordsProcessed: processed,
        recordsCreated: created,
        recordsUpdated: updated,
        completedAt: new Date(),
      })
      .where(eq(jobRuns.id, run.id));
    return { created, updated, processed };
  } catch (err) {
    await db
      .update(jobRuns)
      .set({
        status: "failure",
        errorMessage: err instanceof Error ? err.message : String(err),
        completedAt: new Date(),
      })
      .where(eq(jobRuns.id, run.id));
    throw err;
  }
}
