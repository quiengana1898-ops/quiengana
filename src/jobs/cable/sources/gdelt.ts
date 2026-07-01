// GDELT DOC 2.0 adapter — broad global net + historical backfill. Title-only
// (ArtList gives no body), rate-limited to 1 req/5s (returns plaintext, not JSON,
// when throttled). One flaky/rate-limited query doesn't sink the batch.
import { httpGetText, sleep } from "../http";
import type { ArticleLang, RawArticle } from "../types";

const API = "https://api.gdeltproject.org/api/v2/doc/doc";
const REQUEST_SPACING_MS = 5200;

const GDELT_QUERIES = [
  '"Puerto Rico" pension',
  '"Puerto Rico" bondholders',
  '"Puerto Rico" PROMESA',
  '"Puerto Rico" hedge fund',
  '"Puerto Rico" "oversight board"',
  '"Puerto Rico" FEMA contract',
  '"Puerto Rico" disaster contractor',
  '"Puerto Rico" "Act 60"',
  '"Puerto Rico" LUMA',
] as const;

type GdeltRow = {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
  language?: string;
};

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

function parseSeenDate(v: unknown): Date {
  const m = str(v)?.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (!m) return new Date();
  const [, y, mo, d, h, mi, se] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +se));
}

function mapLanguage(v: unknown): ArticleLang {
  const s = (str(v) ?? "").toLowerCase();
  if (s === "english") return "en";
  if (s === "spanish") return "es";
  return "other";
}

async function fetchQuery(
  query: string,
  opts: { maxRecords: number; timespan: string; attempts: number; retryDelayMs: number },
): Promise<GdeltRow[]> {
  const params = new URLSearchParams({
    query,
    mode: "ArtList",
    format: "json",
    sort: "DateDesc",
    maxrecords: String(opts.maxRecords),
    timespan: opts.timespan,
  });
  const url = `${API}?${params}`;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    try {
      const { status, text } = await httpGetText(url, { timeoutMs: 30000 });
      if (status < 200 || status >= 300) throw new Error(`GDELT ${status}`);
      const trimmed = text.trimStart();
      if (!trimmed.startsWith("{")) {
        throw new Error(`rate-limited/non-JSON: ${trimmed.slice(0, 80)}`);
      }
      return (JSON.parse(trimmed).articles ?? []) as GdeltRow[];
    } catch (err) {
      lastErr = err;
      if (attempt < opts.attempts) await sleep(opts.retryDelayMs);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function fetchGdelt(
  opts: { maxRecords?: number; timespan?: string } = {},
): Promise<RawArticle[]> {
  const { maxRecords = 60, timespan = "14days" } = opts;
  const q = { maxRecords, timespan, attempts: 3, retryDelayMs: 8000 };

  const out: RawArticle[] = [];
  const failed: string[] = [];
  for (let i = 0; i < GDELT_QUERIES.length; i++) {
    try {
      const rows = await fetchQuery(GDELT_QUERIES[i], q);
      for (const r of rows) {
        const url = str(r.url);
        const title = str(r.title);
        if (!url || !title) continue;
        out.push({
          url,
          title,
          source: str(r.domain) ?? "unknown",
          publishedAt: parseSeenDate(r.seendate),
          language: mapLanguage(r.language),
          summary: null,
          origin: "gdelt",
        });
      }
    } catch (err) {
      failed.push(GDELT_QUERIES[i]);
      console.warn(
        `gdelt: query failed — ${GDELT_QUERIES[i]}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    if (i < GDELT_QUERIES.length - 1) await sleep(REQUEST_SPACING_MS);
  }
  if (out.length === 0 && failed.length > 0) {
    throw new Error(`gdelt: all ${failed.length} queries failed`);
  }
  return out;
}
