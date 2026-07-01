export type ArticleLang = "en" | "es" | "other";

/**
 * The normalized article shape every El Cable source adapter emits. The ingest
 * step is source-agnostic: it dedupes, upserts, and matches against entities
 * without knowing whether a row came from GDELT, Google News, or an RSS feed.
 */
export type RawArticle = {
  url: string;
  title: string;
  source: string; // outlet/domain shown in the UI
  publishedAt: Date;
  language: ArticleLang;
  summary: string | null; // RSS gives us body text; GDELT/Google News usually don't
  origin: string; // adapter id for per-source stats: 'gdelt' | 'google-news' | 'rss:<id>'
};
