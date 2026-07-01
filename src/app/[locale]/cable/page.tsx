import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { entityHref, formatArticleDate } from "@/lib/cable";
import type { CableArticle } from "@/lib/cable";
import { getWireArticles } from "@/lib/queries/cable";

// Reflects new mentions as soon as the poll job writes them (no redeploy).
export const dynamic = "force-dynamic";

function ArticleRow({ a, locale }: { a: CableArticle; locale: string }) {
  return (
    <li className="py-6">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
        <span>{a.source}</span>
        <span aria-hidden>·</span>
        <span>{formatArticleDate(a.publishedAt, locale)}</span>
      </div>
      <h3 className="mt-2 font-display text-xl leading-[1.25] tracking-[-0.01em]">
        <a
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink no-underline hover:text-rojo"
        >
          {a.title}
        </a>
      </h3>
      {a.mentions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {a.mentions.map((m) => {
            const href = entityHref(m);
            const cls =
              "inline-block rounded-xs border border-ink-line bg-cream px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted";
            return href ? (
              <Link
                key={m.entityId}
                href={href}
                className={`${cls} no-underline hover:border-rojo hover:text-rojo`}
              >
                {m.name}
              </Link>
            ) : (
              <span key={m.entityId} className={cls}>
                {m.name}
              </span>
            );
          })}
        </div>
      )}
    </li>
  );
}

export default async function CablePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cable");

  const articles = await getWireArticles(80);
  const tracked = articles.filter((a) => a.mentions.length > 0);
  const wire = articles.filter((a) => a.mentions.length === 0);

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-[1240px] px-8 pb-12 pt-16 max-[720px]:px-5">
        <Link
          href="/#infra"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted no-underline hover:text-rojo"
        >
          ← {t("back")}
        </Link>
        <div className="mt-6 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-rojo before:block before:h-px before:w-6 before:bg-rojo before:content-['']">
          {t("eyebrow")}
        </div>
        <h1 className="mt-4 font-display text-[clamp(40px,5.5vw,72px)] font-medium leading-[1.0] tracking-[-0.03em]">
          {t("title")}
        </h1>
        <div className="mt-2 font-display text-xl italic text-ink-muted">
          {t("subtitle")}
        </div>
        <p className="mt-6 max-w-[680px] text-[18px] leading-[1.55] text-ink-muted">
          {t("intro")}
        </p>
        <p className="mt-5 inline-block rounded-xs border border-ink-line bg-celeste-mist px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
          {t("dataNote")}
        </p>
      </section>

      <section className="border-t border-ink-line bg-cream-deep">
        <div className="mx-auto max-w-[860px] px-8 py-16 max-[720px]:px-5">
          {articles.length === 0 ? (
            <p className="rounded-sm border border-dashed border-ink-line-strong bg-cream px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.1em] text-ink-faint">
              {t("empty")}
            </p>
          ) : (
            <>
              {/* Lane 1 — coverage naming a tracked actor */}
              <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                {t("trackedTitle")}
              </div>
              {tracked.length === 0 ? (
                <p className="mt-4 rounded-xs border border-dashed border-ink-line bg-cream px-5 py-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                  {t("trackedEmpty")}
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-ink-line border-y border-ink-line">
                  {tracked.map((a) => (
                    <ArticleRow key={a.id} a={a} locale={locale} />
                  ))}
                </ul>
              )}

              {/* Lane 2 — the broader Puerto Rico accountability wire */}
              {wire.length > 0 && (
                <>
                  <div className="mt-16 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    {t("wireTitle")}
                  </div>
                  <ul className="mt-2 divide-y divide-ink-line border-y border-ink-line">
                    {wire.map((a) => (
                      <ArticleRow key={a.id} a={a} locale={locale} />
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
