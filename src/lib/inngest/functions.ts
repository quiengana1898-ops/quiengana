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
    return step.run("pull", () => pullUsaspending({ maxPages: 10 }));
  },
);

// Registry of all Inngest functions (served at /api/inngest).
export const functions = [contratosPull];
