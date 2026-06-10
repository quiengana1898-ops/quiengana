/**
 * Seed: Pensiones circuit (SPEC §9.0 / Appendix A) — the In These Times 2018
 * investigation data. Idempotent: upserts entities by slug and replaces the
 * seed's investment/claim rows (matched by source_url) on each run.
 *
 * Run: npm run seed:pensiones
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";

const SOURCE_URL =
  "https://inthesetimes.com/article/is-your-pension-fund-plundering-puerto-rico";
const SOURCE_DESC =
  "In These Times investigation by Ethan Corey, January 2018, based on public ERS bankruptcy filings and SEC disclosures.";
const WINDOW_START = "2017-01-01";
const WINDOW_END = "2018-12-31";

// millions (USD) -> cents (bigint-safe: 600 -> 60,000,000,000)
const toCents = (millions: number) => millions * 100_000_000;

const pensionFunds = [
  { slug: "wa-state-board-investment", name: "Washington State Board of Investment", jur: "US-WA", category: "state" },
  { slug: "or-pers", name: "Oregon Public Employees Retirement Fund", jur: "US-OR", category: "state" },
  { slug: "ny-state-local", name: "New York State and Local Retirement System", jur: "US-NY", category: "state" },
  { slug: "fl-sba", name: "Florida State Board of Administration", jur: "US-FL", category: "state" },
  { slug: "nc-retirement", name: "North Carolina Retirement System", jur: "US-NC", category: "state" },
  { slug: "ma-prim", name: "Massachusetts PRIM Board", jur: "US-MA", category: "state" },
  { slug: "ca-calstrs", name: "CalSTRS — California State Teachers Retirement", jur: "US-CA", category: "teacher" },
  { slug: "il-trs", name: "Illinois Teachers' Retirement System", jur: "US-IL", category: "teacher" },
  { slug: "nj-pers", name: "New Jersey Public Employee Retirement System", jur: "US-NJ", category: "state" },
];

const hedgeFunds = [
  { slug: "oaktree", name: "Oaktree Capital Management", jur: "US-CA", metadata: { hq_city: "Los Angeles", funds_involved: 7 } },
  { slug: "centerbridge", name: "Centerbridge Partners", jur: "US-NY", metadata: { hq_city: "New York", shell_entity: "SV Credit" } },
  { slug: "king-street", name: "King Street Capital", jur: "US-NY", metadata: { hq_city: "New York", shell_entity: "Ocher Rose" } },
  { slug: "stone-lion", name: "Stone Lion Capital", jur: "US-NY", metadata: { hq_city: "New York" } },
  { slug: "mason-capital", name: "Mason Capital Management", jur: "US-NY", metadata: { hq_city: "New York" } },
  { slug: "glendon", name: "Glendon Capital Management", jur: "INTL", metadata: { hq_city: "Cayman Islands" } },
];

// [pensionFundSlug, hedgeFundSlug, millions, fundName]
const investments: [string, string, number, string][] = [
  ["wa-state-board-investment", "oaktree", 600, "Oaktree Opportunities (2 funds)"],
  ["or-pers", "centerbridge", 500, "Centerbridge Special Credit Partners III"],
  ["or-pers", "oaktree", 125, "Oaktree Opportunities IX"],
  ["ny-state-local", "king-street", 249, "King Street Capital"],
  ["fl-sba", "king-street", 200, "King Street Capital"],
  ["nc-retirement", "oaktree", 190, "Oaktree Opportunities"],
  ["ma-prim", "oaktree", 175, "Oaktree Opportunities"],
  ["ca-calstrs", "centerbridge", 125, "Centerbridge Special Credit Partners III"],
  ["il-trs", "oaktree", 100, "Oaktree Opportunities"],
  ["nj-pers", "glendon", 100, "Glendon Opportunities Fund"],
];

// [hedgeFundSlug, millions, shellEntity]
const bondClaims: [string, number, string | null][] = [
  ["oaktree", 410, null],
  ["centerbridge", 390, "SV Credit"],
  ["stone-lion", 325, null],
  ["king-street", 197, "Ocher Rose"],
  ["mason-capital", 141, null],
  ["glendon", 34, null],
];

async function main() {
  const { db, schema } = await import("../src/lib/db/index");
  const { entities, pensionInvestments, ersBondClaims } = schema;

  // 1) Upsert entities by slug (published seed data).
  const idBySlug = new Map<string, string>();
  for (const f of pensionFunds) {
    const [row] = await db
      .insert(entities)
      .values({
        entityType: "pension_fund",
        displayName: f.name,
        slug: f.slug,
        jurisdiction: f.jur,
        metadata: { category: f.category },
        isPublished: true,
      })
      .onConflictDoUpdate({
        target: entities.slug,
        set: { displayName: f.name, jurisdiction: f.jur, metadata: { category: f.category }, isPublished: true, updatedAt: new Date() },
      })
      .returning({ id: entities.id, slug: entities.slug });
    idBySlug.set(row.slug, row.id);
  }
  for (const f of hedgeFunds) {
    const [row] = await db
      .insert(entities)
      .values({
        entityType: "hedge_fund",
        displayName: f.name,
        slug: f.slug,
        jurisdiction: f.jur,
        metadata: f.metadata,
        isPublished: true,
      })
      .onConflictDoUpdate({
        target: entities.slug,
        set: { displayName: f.name, jurisdiction: f.jur, metadata: f.metadata, isPublished: true, updatedAt: new Date() },
      })
      .returning({ id: entities.id, slug: entities.slug });
    idBySlug.set(row.slug, row.id);
  }

  // 2) Replace this seed's investment + claim rows (idempotent by source_url).
  await db.delete(pensionInvestments).where(eq(pensionInvestments.sourceUrl, SOURCE_URL));
  await db.delete(ersBondClaims).where(eq(ersBondClaims.sourceUrl, SOURCE_URL));

  for (const [pfSlug, hfSlug, millions, fundName] of investments) {
    await db.insert(pensionInvestments).values({
      pensionFundId: idBySlug.get(pfSlug)!,
      hedgeFundId: idBySlug.get(hfSlug)!,
      amountUsd: toCents(millions),
      amountDisplay: `$${millions}M`,
      fundName,
      dataWindowStart: WINDOW_START,
      dataWindowEnd: WINDOW_END,
      sourceUrl: SOURCE_URL,
      sourceDescription: SOURCE_DESC,
      isPublished: true,
    });
  }

  for (const [hfSlug, millions, shell] of bondClaims) {
    await db.insert(ersBondClaims).values({
      hedgeFundId: idBySlug.get(hfSlug)!,
      claimedAmountUsd: toCents(millions),
      claimedAmountDisplay: `$${millions}M`,
      shellEntity: shell,
      sourceUrl: SOURCE_URL,
      isPublished: true,
    });
  }

  console.log(
    `seeded: ${pensionFunds.length} pension funds, ${hedgeFunds.length} hedge funds, ${investments.length} investments, ${bondClaims.length} bond claims`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("seed failed:", e);
  process.exit(1);
});
