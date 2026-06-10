/**
 * On-demand Contratos ingestion (USASpending → staging). Useful for the first
 * backfill and for re-runs while iterating. The Inngest cron runs the same job
 * weekly. Run: npm run ingest:contratos
 */
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { pullUsaspending } = await import(
    "../src/jobs/contratos/pull-usaspending"
  );
  const maxPages = Number(process.env.MAX_PAGES ?? 5);
  console.log(`pulling PR contracts (maxPages=${maxPages})…`);
  const result = await pullUsaspending({ maxPages });
  console.log("done:", result);
  process.exit(0);
}

main().catch((e) => {
  console.error("ingest failed:", e);
  process.exit(1);
});
