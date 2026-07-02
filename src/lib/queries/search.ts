import "server-only";

import { and, eq, isNull, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { resultHref, type SearchResult } from "@/lib/search";

export type { SearchResult } from "@/lib/search";

const { entities } = schema;

/**
 * Universal actor search across every circuit: matches published, non-deleted
 * entities (contractors, vulture funds, pension funds, …) by name in either
 * language. Prefix matches rank first. Each hit carries a route to the right page.
 */
export async function searchActors(query: string, limit = 8): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const like = `%${q}%`;
  const prefix = `${q}%`;

  const rows = await db
    .select({
      name: entities.displayName,
      slug: entities.slug,
      entityType: entities.entityType,
    })
    .from(entities)
    .where(
      and(
        eq(entities.isPublished, true),
        isNull(entities.deletedAt),
        sql`(${entities.displayName} ilike ${like} or coalesce(${entities.displayNameEs}, '') ilike ${like})`,
      ),
    )
    // Prefix hits first, then alphabetical.
    .orderBy(
      sql`case when ${entities.displayName} ilike ${prefix} then 0 else 1 end`,
      entities.displayName,
    )
    .limit(limit);

  return rows.map<SearchResult>((r) => ({
    name: r.name,
    slug: r.slug,
    entityType: r.entityType,
    href: resultHref(r.entityType, r.slug, r.name),
  }));
}
