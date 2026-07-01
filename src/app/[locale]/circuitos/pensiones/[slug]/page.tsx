import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { formatArticleDate } from "@/lib/cable";
import { getCoverageForEntity } from "@/lib/queries/cable";
import { getEntityBySlug, jurisdictionLabel } from "@/lib/queries/pensiones";

// Reflects live DB state — admin-published investments + El Cable coverage that
// the daily poll adds — with no redeploy (matches the circuit list pages).
export const dynamic = "force-dynamic";

export default async function EntityPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = await getEntityBySlug(slug);
  if (!data) notFound();

  const t = await getTranslations("pensiones.entity");
  const { entity, investments, bondClaims } = data;
  const isHedge = entity.entityType === "hedge_fund";
  const coverage = await getCoverageForEntity(entity.id);

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-[860px] px-8 py-16 max-[720px]:px-5">
        <Link
          href="/circuitos/pensiones"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted no-underline hover:text-rojo"
        >
          ← {t("back")}
        </Link>

        <div className="mt-6 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-rojo before:block before:h-px before:w-6 before:bg-rojo before:content-['']">
          {isHedge ? t("hedgeFund") : t("pensionFund")}
        </div>
        <h1 className="mt-4 font-display text-[clamp(34px,4.5vw,56px)] font-medium leading-[1.02] tracking-[-0.03em]">
          {entity.displayName}
        </h1>
        {entity.jurisdiction && (
          <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            {t("jurisdiction")}: {jurisdictionLabel(entity.jurisdiction)}
          </div>
        )}

        {/* Investments */}
        <h2 className="mt-12 font-display text-2xl font-medium tracking-[-0.02em]">
          {isHedge ? t("investmentsHF") : t("investmentsPF")}
        </h2>
        {investments.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">{t("none")}</p>
        ) : (
          <ul className="mt-5 divide-y divide-ink-line border-y border-ink-line">
            {investments.map((inv) => {
              const otherName = isHedge ? inv.pensionFundName : inv.hedgeFundName;
              const otherSlug = isHedge ? inv.pensionFundSlug : inv.hedgeFundSlug;
              return (
                <li
                  key={inv.id}
                  className="flex items-baseline justify-between gap-4 py-4"
                >
                  <div>
                    <Link
                      href={`/circuitos/pensiones/${otherSlug}`}
                      className="font-display text-lg text-ink no-underline hover:text-celeste-deep"
                    >
                      {otherName}
                    </Link>
                    {inv.fundName && (
                      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                        {inv.fundName}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 font-display text-xl font-semibold tracking-[-0.02em] text-rojo">
                    {inv.amountDisplay}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Bond claims (hedge funds only) */}
        {isHedge && bondClaims.length > 0 && (
          <>
            <h2 className="mt-12 font-display text-2xl font-medium tracking-[-0.02em]">
              {t("claimsTitle")}
            </h2>
            <ul className="mt-5 divide-y divide-ink-line border-y border-ink-line">
              {bondClaims.map((c) => (
                <li
                  key={c.id}
                  className="flex items-baseline justify-between gap-4 py-4"
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {c.shellEntity
                      ? `${t("via")} ${t("shell")}: ${c.shellEntity}`
                      : "ERS"}
                  </div>
                  <div className="shrink-0 font-display text-xl font-semibold tracking-[-0.02em] text-rojo">
                    {c.claimedAmountDisplay}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Recent coverage (El Cable) */}
        {coverage.length > 0 && (
          <>
            <h2 className="mt-12 font-display text-2xl font-medium tracking-[-0.02em]">
              {t("coverage")}
            </h2>
            <ul className="mt-5 divide-y divide-ink-line border-y border-ink-line">
              {coverage.map((a) => (
                <li key={a.id} className="py-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    {a.source} · {formatArticleDate(a.publishedAt, locale)}
                  </div>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block font-display text-lg leading-[1.3] text-ink no-underline hover:text-rojo"
                  >
                    {a.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Source */}
        {investments[0]?.sourceUrl && (
          <p className="mt-12 border-t border-ink-line pt-5 text-xs leading-[1.6] text-ink-faint">
            {t("source")}:{" "}
            <a
              href={investments[0].sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-rojo"
            >
              {investments[0].sourceDescription ?? investments[0].sourceUrl}
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
