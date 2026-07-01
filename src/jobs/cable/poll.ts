// El Cable orchestrator. Runs every source adapter concurrently (a failing source
// can't sink the others), merges into one batch, and hands off to the shared
// source-agnostic ingest. Wrapped in a job_runs record for observability.
//
// NOTE: no `server-only` guard — runs in the Inngest route (server) and the CLI
// runner (tsx). Never imported by a client component.
import { and, eq, isNull } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { ingestArticles } from "./ingest";
import { fetchGdelt } from "./sources/gdelt";
import { fetchGoogleNews } from "./sources/google-news";
import { fetchRssFeeds, PR_FEEDS } from "./sources/rss";
import type { RawArticle } from "./types";

const { entities, jobRuns } = schema;
const JOB_NAME = "cable/poll";

/** Names to drive per-entity Google News search — the newsworthy vulture funds. */
async function hedgeFundNames(): Promise<string[]> {
  const rows = await db
    .select({ name: entities.displayName })
    .from(entities)
    .where(
      and(
        eq(entities.entityType, "hedge_fund"),
        eq(entities.isPublished, true),
        isNull(entities.deletedAt),
      ),
    );
  return rows.map((r) => r.name);
}

export type CablePollOpts = {
  maxRecords?: number;
  timespan?: string;
  sources?: { gdelt?: boolean; googleNews?: boolean; rss?: boolean };
};

export async function runCablePoll(opts: CablePollOpts = {}) {
  const enabled = {
    gdelt: opts.sources?.gdelt ?? true,
    googleNews: opts.sources?.googleNews ?? true,
    rss: opts.sources?.rss ?? true,
  };

  const [run] = await db
    .insert(jobRuns)
    .values({ jobName: JOB_NAME, status: "running", startedAt: new Date() })
    .returning({ id: jobRuns.id });

  try {
    const funds = enabled.googleNews ? await hedgeFundNames() : [];

    // Different hosts → run in parallel; allSettled isolates per-source failure.
    const tasks: { name: string; run: () => Promise<RawArticle[]> }[] = [];
    if (enabled.gdelt)
      tasks.push({
        name: "gdelt",
        run: () => fetchGdelt({ maxRecords: opts.maxRecords, timespan: opts.timespan }),
      });
    if (enabled.googleNews && funds.length)
      tasks.push({ name: "google-news", run: () => fetchGoogleNews(funds) });
    if (enabled.rss)
      tasks.push({ name: "rss", run: () => fetchRssFeeds(PR_FEEDS) });

    const settled = await Promise.allSettled(tasks.map((t) => t.run()));

    const raw: RawArticle[] = [];
    const perSource: Record<string, number | string> = {};
    const failedSources: string[] = [];
    settled.forEach((res, i) => {
      const name = tasks[i].name;
      if (res.status === "fulfilled") {
        raw.push(...res.value);
        perSource[name] = res.value.length;
      } else {
        failedSources.push(name);
        perSource[name] = `failed: ${res.reason instanceof Error ? res.reason.message : String(res.reason)}`;
        console.warn(`cable: source '${name}' failed — ${perSource[name]}`);
      }
    });

    if (raw.length === 0) {
      throw new Error(
        `cable: no articles from any source (failed: ${failedSources.join(", ") || "none"})`,
      );
    }

    const stats = await ingestArticles(raw);

    await db
      .update(jobRuns)
      .set({
        status: failedSources.length ? "partial" : "success",
        recordsProcessed: stats.processed,
        recordsCreated: stats.created,
        recordsUpdated: stats.updated,
        completedAt: new Date(),
        metadata: {
          mentions: stats.mentions,
          deduped: stats.deduped,
          offTopic: stats.offTopic,
          perSource,
          failedSources,
        },
      })
      .where(eq(jobRuns.id, run.id));

    return { ...stats, perSource, failedSources };
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
