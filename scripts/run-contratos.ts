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
  // PUBLISH=1 ingests directly to public (USASpending is authoritative public record).
  const publish = process.env.PUBLISH === "1";
  console.log(`pulling PR contracts (maxPages=${maxPages}, publish=${publish})…`);
  const result = await pullUsaspending({ maxPages, publish });
  console.log("done:", result);
  process.exit(0);
}

main().catch((e) => {
  console.error("ingest failed:", e);
  process.exit(1);
});
