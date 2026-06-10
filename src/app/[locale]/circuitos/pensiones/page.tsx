import { getTranslations, setRequestLocale } from "next-intl/server";

import { PensionLookup } from "@/components/circuits/pension-lookup";
import { Link } from "@/i18n/navigation";
import {
  getErsBondClaims,
  getPensionInvestments,
} from "@/lib/queries/pensiones";

// Reflects published data immediately (admin publish/reject at runtime).
export const dynamic = "force-dynamic";

export default async function PensionesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pensiones");

  const [rows, claims] = await Promise.all([
    getPensionInvestments(),
    getErsBondClaims(),
  ]);

  return (
    <main className="flex-1">
      {/* Header */}
      <section className="mx-auto max-w-[1240px] px-8 pb-12 pt-16 max-[720px]:px-5">
        <Link
          href="/#circuits"
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
          {t("dataWindow")}
        </p>
      </section>

      {/* Lookup */}
      <section className="border-y border-ink-line bg-celeste-mist">
        <div className="mx-auto max-w-[1240px] px-8 py-16 max-[720px]:px-5">
          <div className="overflow-hidden rounded-sm border border-ink-line-strong bg-cream">
            <div className="flex items-center justify-between bg-ink px-8 py-6 text-cream max-[720px]:px-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-celeste">
                00 / Pensiones
              </span>
              <span className="rounded-xs bg-rojo/20 px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-cream">
                {t("eyebrow")}
              </span>
            </div>
            <div className="p-9 max-[720px]:p-5">
              <PensionLookup rows={rows} />
            </div>
          </div>
        </div>
      </section>

      {/* What the vultures claimed */}
      <section className="mx-auto max-w-[1240px] px-8 py-20 max-[720px]:px-5 max-[720px]:py-14">
        <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em]">
          {t("claimsTitle")}
        </h2>
        <p className="mt-4 max-w-[620px] text-base leading-[1.6] text-ink-muted">
          {t("claimsIntro")}
        </p>
        <div className="mt-8 grid grid-cols-3 gap-px border border-ink-line bg-ink-line max-[1080px]:grid-cols-2 max-[720px]:grid-cols-1">
          {claims.map((c) => (
            <div key={c.id} className="bg-cream p-5">
              <Link
                href={`/circuitos/pensiones/${c.hedgeFundSlug}`}
                className="font-display text-lg font-medium text-ink no-underline hover:text-celeste-deep"
              >
                {c.hedgeFundName}
              </Link>
              <div className="mt-2 font-display text-[26px] font-semibold tracking-[-0.02em] text-rojo">
                {c.claimedAmountDisplay}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                {t("claimsClaimed")}
                {c.shellEntity ? ` · ${t("claimsShell")}: ${c.shellEntity}` : ""}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
