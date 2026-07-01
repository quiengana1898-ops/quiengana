// Source-agnostic ingest for El Cable: dedupe a mixed batch of RawArticles
// (GDELT + Google News + RSS), upsert into news_articles, and match each against
// PUBLISHED entities to build news_article_mentions. Recall depends on entity
// `aliases`; precision comes from word-boundary matching + a min term length.
import { and, eq, isNull, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import type { RawArticle } from "./types";

const { entities, newsArticles, newsArticleMentions } = schema;

const MIN_TERM_LEN = 5;
// Corporate suffixes stripped to derive a "core" name (titles rarely print "LLC").
const SUFFIX_RE =
  /\b(llc|l\.l\.c\.|inc|inc\.|incorporated|corp|corp\.|corporation|company|co|lp|l\.p\.|llp|ltd|ltd\.|holdings|group|partners|capital|management|advisors|associates)\b\.?/gi;

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

// ---- URL / title normalization for cross-source dedup ------------------------

const TRACKING_RE = /^(utm_|mc_|mkt_|_hs|gclid|fbclid|igshid|ref$|cmpid$)/i;

/** Strip fragments + tracking params + trailing slash so the same story dedupes. */
export function canonicalUrl(u: string): string {
  try {
    const url = new URL(u);
    url.hash = "";
    for (const k of [...url.searchParams.keys()]) {
      if (TRACKING_RE.test(k)) url.searchParams.delete(k);
    }
    url.host = url.host.toLowerCase();
    return url.toString().replace(/\/$/, "");
  } catch {
    return u;
  }
}

/** Loose title key: lowercased, punctuation-stripped, collapsed. Catches the same
 *  headline arriving from two sources under different URLs. */
export function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// A real outlet URL beats a Google News redirect; richer summary/title breaks ties.
function preferBetter(a: RawArticle, b: RawArticle): RawArticle {
  const aGoogle = a.origin === "google-news";
  const bGoogle = b.origin === "google-news";
  if (aGoogle !== bGoogle) return aGoogle ? b : a;
  if (!!a.summary !== !!b.summary) return a.summary ? a : b;
  return b.title.length > a.title.length ? b : a;
}

/** Dedupe by canonical URL, then by normalized title, keeping the best copy. */
export function dedupe(raw: RawArticle[]): RawArticle[] {
  const byUrl = new Map<string, RawArticle>();
  for (const a of raw) {
    const key = canonicalUrl(a.url);
    const norm = { ...a, url: key };
    const prev = byUrl.get(key);
    byUrl.set(key, prev ? preferBetter(prev, norm) : norm);
  }
  const byTitle = new Map<string, RawArticle>();
  for (const a of byUrl.values()) {
    const key = normalizeTitle(a.title);
    if (!key) continue;
    const prev = byTitle.get(key);
    byTitle.set(key, prev ? preferBetter(prev, a) : a);
  }
  return [...byTitle.values()];
}

// ---- entity matching ---------------------------------------------------------

type MatchTerm = { term: string; confidence: number };

// Single-word terms that are too generic to match on (esp. after suffix stripping,
// e.g. "Capital Services LLC" -> "Services" matching "...water services").
const GENERIC_WORDS = new Set([
  "services",
  "solutions",
  "group",
  "partners",
  "holdings",
  "company",
  "enterprises",
  "international",
  "construction",
  "associates",
  "consulting",
  "systems",
  "industries",
  "management",
  "capital",
  "national",
  "american",
  "general",
]);

function termsForEntity(e: {
  displayName: string;
  displayNameEs: string | null;
  aliases: string[] | null;
}): MatchTerm[] {
  const out: MatchTerm[] = [];
  const seen = new Set<string>();
  const add = (raw: string | null | undefined, base: number) => {
    const term = str(raw);
    if (!term || term.length < MIN_TERM_LEN) return;
    const key = term.toLowerCase();
    if (seen.has(key)) return;
    // A bare generic word (no distinguishing token) is all noise.
    if (!term.includes(" ") && GENERIC_WORDS.has(key)) return;
    seen.add(key);
    out.push({
      term,
      // Multi-word names collide far less than single common words.
      confidence: Math.min(0.95, term.includes(" ") ? base : base - 0.25),
    });
  };
  add(e.displayName, 0.9);
  add(e.displayNameEs, 0.9);
  for (const a of e.aliases ?? []) add(a, 0.8);
  // Only use the suffix-stripped core if it's still multi-word (a single leftover
  // word like "Services" or "Partners" is too generic and false-matches).
  const core = e.displayName.replace(SUFFIX_RE, " ").replace(/\s+/g, " ").trim();
  if (core.includes(" ") && core.toLowerCase() !== e.displayName.toLowerCase()) {
    add(core, 0.75);
  }
  return out;
}

// El Cable is a Puerto Rico accountability wire: a tracked fund is only news here
// when the coverage has a PR nexus. Google News per-fund search also returns a
// fund's general industry news, so we gate every article on PR context to keep the
// feed on-mission. Cost: a genuine PR story whose title omits a PR term is dropped
// (GDELT/RSS give a second path, and PR headlines usually name it). Loose substring
// is fine — precision comes from the word-boundary entity match downstream.
const PR_CONTEXT = [
  "puerto rico",
  "puertorrique",
  "boricua",
  "promesa",
  "cofina",
  "prepa",
  "luma",
  "oversight board",
  "fiscal control",
  "junta de supervis",
  "title iii",
  "act 60",
  "ley 60",
];

function hasPrContext(hay: string): boolean {
  return PR_CONTEXT.some((t) => hay.includes(t));
}

// The PR gate lets through sports/culture that merely mention Puerto Rico. El Cable
// is an accountability wire, so drop unambiguous sports noise. Kept deliberately
// narrow (sports only) to avoid filtering real political/cultural coverage.
const OFF_TOPIC = [
  "basketball",
  "baloncesto",
  "baseball",
  "béisbol",
  "beisbol",
  "volleyball",
  "voleibol",
  "boxing",
  "boxeo",
];
function isOffTopic(hay: string): boolean {
  return OFF_TOPIC.some((t) => hay.includes(t));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-"word" match allowing accented letters (not anchored to ASCII \b). */
function mentions(haystack: string, term: string): boolean {
  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escapeRe(term)}(?:[^\\p{L}\\p{N}]|$)`,
    "iu",
  ).test(haystack);
}

// ---- ingest ------------------------------------------------------------------

export async function ingestArticles(raw: RawArticle[]) {
  const deduped = dedupe(raw);
  // Keep PR-relevant coverage (drops off-topic per-fund industry news) and drop
  // unambiguous sports noise.
  const articles = deduped.filter((a) => {
    const hay = `${a.title} ${a.summary ?? ""}`.toLowerCase();
    return hasPrContext(hay) && !isOffTopic(hay);
  });

  const ents = await db
    .select({
      id: entities.id,
      displayName: entities.displayName,
      displayNameEs: entities.displayNameEs,
      aliases: entities.aliases,
    })
    .from(entities)
    .where(and(eq(entities.isPublished, true), isNull(entities.deletedAt)));
  const entityTerms = ents.map((e) => ({ id: e.id, terms: termsForEntity(e) }));

  let created = 0;
  let updated = 0;
  let mentionCount = 0;

  for (const a of articles) {
    const url = str(a.url);
    const title = str(a.title);
    if (!url || !title) continue;
    const summary = str(a.summary);

    const [row] = await db
      .insert(newsArticles)
      .values({
        url,
        title,
        source: a.source || "unknown",
        publishedAt: a.publishedAt,
        language: a.language,
        summary,
      })
      .onConflictDoUpdate({
        target: newsArticles.url,
        set: {
          title,
          source: a.source || "unknown",
          publishedAt: a.publishedAt,
          language: a.language,
          summary,
          pulledAt: new Date(),
        },
      })
      .returning({ id: newsArticles.id, inserted: sql<boolean>`(xmax = 0)` });

    if (row.inserted) created++;
    else updated++;

    // Match on title + summary — RSS summaries meaningfully lift recall.
    const hay = `${title} ${summary ?? ""}`.toLowerCase();
    for (const { id, terms } of entityTerms) {
      let best = 0;
      for (const { term, confidence } of terms) {
        if (confidence > best && mentions(hay, term.toLowerCase())) best = confidence;
      }
      if (best > 0) {
        await db
          .insert(newsArticleMentions)
          .values({
            articleId: row.id,
            entityId: id,
            confidence: best.toFixed(2),
            contextExcerpt: title.slice(0, 280),
          })
          .onConflictDoUpdate({
            target: [newsArticleMentions.articleId, newsArticleMentions.entityId],
            set: {
              confidence: sql`greatest(${newsArticleMentions.confidence}, ${best.toFixed(2)})`,
            },
          });
        mentionCount++;
      }
    }
  }

  return {
    processed: articles.length,
    deduped: raw.length - deduped.length,
    offTopic: deduped.length - articles.length,
    created,
    updated,
    mentions: mentionCount,
  };
}
