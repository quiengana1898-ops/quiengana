/**
 * On-demand El Cable poll (GDELT -> news_articles + mentions). Useful for the
 * first backfill and re-runs while iterating. The Inngest cron runs the same job
 * daily. Run: npm run poll:cable  (env: MAX_RECORDS, TIMESPAN e.g. 30days)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { runCablePoll } = await import("../src/jobs/cable/poll");
  const maxRecords = Number(process.env.MAX_RECORDS ?? 75);
  const timespan = process.env.TIMESPAN ?? "14days";
  console.log(`polling El Cable sources (GDELT maxRecords=${maxRecords}, timespan=${timespan})…`);
  const result = await runCablePoll({ maxRecords, timespan });
  console.log("done:", result);
  process.exit(0);
}

main().catch((e) => {
  console.error("cable poll failed:", e);
  process.exit(1);
});
