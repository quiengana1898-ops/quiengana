// Google News RSS adapter — per-entity search. This inverts the matching problem:
// instead of pulling broad news and hoping a tracked fund appears, we ask Google
// News directly for "<fund>" + "Puerto Rico". Free, no API key, RSS (no hard rate
// limit). Best fit for the ~handful of newsworthy hedge/vulture funds; contractors
// are too many/generic to query this way. Item links are Google redirect URLs;
// cross-source dedup (by normalized title) collapses them against direct-outlet copies.
import { XMLParser } from "fast-xml-parser";

import { httpGetText, sleep } from "../http";
import type { RawArticle } from "../types";

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

const arrayify = <T>(v: T | T[] | undefined): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const str = (v: unknown): string | null => {
  if (typeof v === "string") return v.trim() || null;
  if (v && typeof v === "object" && "#text" in v)
    return str((v as { "#text": unknown })["#text"]);
  return null;
};

function searchUrl(name: string): string {
  const q = `"${name}" "Puerto Rico"`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
}

function parseDate(v: unknown): Date {
  const s = str(v);
  if (!s) return new Date();
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

export async function fetchGoogleNews(
  entityNames: string[],
  opts: { perQueryDelayMs?: number } = {},
): Promise<RawArticle[]> {
  const { perQueryDelayMs = 1500 } = opts;
  const out: RawArticle[] = [];

  for (let i = 0; i < entityNames.length; i++) {
    const name = entityNames[i];
    try {
      const { status, text } = await httpGetText(searchUrl(name), {
        timeoutMs: 20000,
      });
      if (status >= 200 && status < 300 && text.trimStart().startsWith("<")) {
        const doc = parser.parse(text);
        for (const it of arrayify(doc?.rss?.channel?.item)) {
          const url = str(it.link);
          // Google News titles read "Headline - Outlet"; drop the suffix for a
          // clean title (helps cross-source dedup + matching).
          const rawTitle = str(it.title);
          const title = rawTitle?.replace(/\s+-\s+[^-]+$/, "") ?? null;
          if (!url || !title) continue;
          out.push({
            url,
            title,
            source: str((it.source as { "#text"?: string })?.["#text"] ?? it.source) ?? "Google News",
            publishedAt: parseDate(it.pubDate),
            language: "en",
            summary: null,
            origin: "google-news",
          });
        }
      }
    } catch (err) {
      console.warn(
        `google-news: query failed — ${name}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    if (i < entityNames.length - 1) await sleep(perQueryDelayMs);
  }
  return out;
}
