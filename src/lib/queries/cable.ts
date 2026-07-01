import "server-only";

import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import type { CableArticle, CableMention } from "@/lib/cable";

export type { CableArticle, CableMention } from "@/lib/cable";

const { entities, newsArticles, newsArticleMentions } = schema;

const num = (v: string | null): number | null => (v == null ? null : Number(v));

/**
 * The full wire: recent PR-relevant articles (news_articles is already gated to
 * PR context at ingest), newest first, each with its PUBLISHED-entity mentions
 * attached (empty array when none). The page splits these into two lanes —
 * "tracked actors" (mentions.length > 0) and the broader accountability wire.
 */
export async function getWireArticles(limit = 80): Promise<CableArticle[]> {
  // 1. Recent articles (the wire itself — no entity join, so unmatched ones show too).
  const arts = await db
    .select({
      id: newsArticles.id,
      url: newsArticles.url,
      title: newsArticles.title,
      source: newsArticles.source,
      publishedAt: newsArticles.publishedAt,
      language: newsArticles.language,
    })
    .from(newsArticles)
    .orderBy(desc(newsArticles.publishedAt))
    .limit(limit);

  if (arts.length === 0) return [];

  // 2. Fetch the published-entity mentions for those articles.
  const ids = arts.map((a) => a.id);
  const rows = await db
    .select({
      articleId: newsArticleMentions.articleId,
      confidence: newsArticleMentions.confidence,
      entityId: entities.id,
      name: entities.displayName,
      slug: entities.slug,
      entityType: entities.entityType,
    })
    .from(newsArticleMentions)
    .innerJoin(entities, eq(entities.id, newsArticleMentions.entityId))
    .where(
      and(
        inArray(newsArticleMentions.articleId, ids),
        eq(entities.isPublished, true),
        isNull(entities.deletedAt),
      ),
    )
    .orderBy(desc(newsArticleMentions.confidence));

  const byArticle = new Map<string, CableMention[]>();
  for (const r of rows) {
    const list = byArticle.get(r.articleId) ?? [];
    list.push({
      entityId: r.entityId,
      name: r.name,
      slug: r.slug,
      entityType: r.entityType,
      confidence: num(r.confidence),
    });
    byArticle.set(r.articleId, list);
  }

  return arts.map((a) => ({ ...a, mentions: byArticle.get(a.id) ?? [] }));
}

/** Recent articles mentioning one entity (for the "recent coverage" panel). */
export async function getCoverageForEntity(
  entityId: string,
  limit = 6,
): Promise<CableArticle[]> {
  const rows = await db
    .select({
      id: newsArticles.id,
      url: newsArticles.url,
      title: newsArticles.title,
      source: newsArticles.source,
      publishedAt: newsArticles.publishedAt,
      language: newsArticles.language,
    })
    .from(newsArticleMentions)
    .innerJoin(newsArticles, eq(newsArticles.id, newsArticleMentions.articleId))
    .where(eq(newsArticleMentions.entityId, entityId))
    .orderBy(desc(newsArticles.publishedAt))
    .limit(limit);

  return rows.map((r) => ({ ...r, mentions: [] }));
}
