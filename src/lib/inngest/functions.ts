import { runCablePoll } from "@/jobs/cable/poll";
import { pullUsaspending } from "@/jobs/contratos/pull-usaspending";

import { inngest } from "./client";

// Contratos ingestion — weekly, Mon 06:00 UTC (SPEC §9.4). Writes to staging;
// a human promotes via /admin. Inngest retries handle transient API failures.
const contratosPull = inngest.createFunction(
  {
    id: "contratos-pull-usaspending",
    name: "Contratos: pull USASpending",
    triggers: [{ cron: "0 6 * * 1" }],
  },
  async ({ step }) => {
    // Authoritative public-record source → publish on ingest.
    return step.run("pull", () => pullUsaspending({ maxPages: 20, publish: true }));
  },
);

// El Cable news wire — daily, 07:00 UTC. Polls all sources (GDELT + Google News
// per-fund + curated RSS); each is a public news index (every row is its own
// citation), so this publishes on ingest and the public feed filters to
// published-entity mentions. Inngest retries handle transient rate-limit/API blips.
const cablePoll = inngest.createFunction(
  {
    id: "cable-poll",
    name: "El Cable: poll sources",
    triggers: [{ cron: "0 7 * * *" }],
  },
  async ({ step }) => {
    return step.run("poll", () => runCablePoll({ timespan: "14days" }));
  },
);

// Registry of all Inngest functions (served at /api/inngest).
export const functions = [contratosPull, cablePoll];
