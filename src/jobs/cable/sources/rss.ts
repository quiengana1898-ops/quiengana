// Curated RSS/Atom adapter — the local + investigative depth GDELT indexes poorly.
// Feeds carry a summary/description, which lifts entity-matching recall over
// GDELT's title-only rows. Per-feed failures are logged and skipped, never fatal.
import { XMLParser } from "fast-xml-parser";

import { httpGetText } from "../http";
import type { ArticleLang, RawArticle } from "../types";

export type Feed = {
  id: string;
  name: string;
  url: string;
  language: ArticleLang;
};

// High-signal Puerto Rico sources. WordPress sites expose /feed/ reliably; other
// outlets (El Nuevo Día/Arc, El Vocero) need their feed URLs validated before
// adding — the adapter skips any feed that 404s or doesn't parse, so it's safe to
// extend this list and let bad entries fall out at runtime.
export const PR_FEEDS: Feed[] = [
  {
    id: "cpi",
    name: "Centro de Periodismo Investigativo",
    url: "https://periodismoinvestigativo.com/feed/",
    language: "es",
  },
  {
    id: "latinorebels",
    name: "Latino Rebels",
    url: "https://www.latinorebels.com/feed/",
    language: "en",
  },
];

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

const arrayify = <T>(v: T | T[] | undefined): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const str = (v: unknown): string | null => {
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  // fast-xml-parser wraps some CDATA/text nodes as { "#text": "..." }.
  if (v && typeof v === "object" && "#text" in v) return str((v as { "#text": unknown })["#text"]);
  return null;
};

function stripHtml(s: string | null): string | null {
  if (!s) return null;
  const text = s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, 600) : null;
}

function parseDate(v: unknown): Date {
  const s = str(v);
  if (!s) return new Date();
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

/** Normalize one feed's XML (RSS 2.0 or Atom) into RawArticles. */
function parseFeed(xml: string, feed: Feed): RawArticle[] {
  const doc = parser.parse(xml);
  const out: RawArticle[] = [];

  // RSS 2.0
  for (const it of arrayify(doc?.rss?.channel?.item)) {
    const url = str(it.link);
    const title = str(it.title);
    if (!url || !title) continue;
    out.push({
      url,
      title,
      source: feed.name,
      publishedAt: parseDate(it.pubDate ?? it["dc:date"]),
      language: feed.language,
      summary: stripHtml(str(it["content:encoded"]) ?? str(it.description)),
      origin: `rss:${feed.id}`,
    });
  }

  // Atom
  for (const it of arrayify(doc?.feed?.entry)) {
    const link = arrayify(it.link).find(
      (l: unknown) =>
        l && typeof l === "object" && (l as { "@_rel"?: string })["@_rel"] !== "self",
    );
    const url =
      (link && typeof link === "object" && (link as { "@_href"?: string })["@_href"]) ||
      str(it.link);
    const title = str(it.title);
    if (!url || !title) continue;
    out.push({
      url,
      title,
      source: feed.name,
      publishedAt: parseDate(it.updated ?? it.published),
      language: feed.language,
      summary: stripHtml(str(it.summary) ?? str(it.content)),
      origin: `rss:${feed.id}`,
    });
  }

  return out;
}

export async function fetchRssFeeds(feeds: Feed[] = PR_FEEDS): Promise<RawArticle[]> {
  const out: RawArticle[] = [];
  for (const feed of feeds) {
    try {
      const { status, text } = await httpGetText(feed.url, { timeoutMs: 20000 });
      if (status < 200 || status >= 300) throw new Error(`HTTP ${status}`);
      if (!text.trimStart().startsWith("<")) throw new Error("not XML");
      out.push(...parseFeed(text, feed));
    } catch (err) {
      console.warn(
        `rss: feed failed — ${feed.id} (${feed.url}): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return out;
}
