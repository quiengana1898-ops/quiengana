import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContractBrowser } from "@/components/circuits/contract-browser";
import { Link } from "@/i18n/navigation";
import { getPublishedContracts } from "@/lib/queries/contratos";

// Reflects published data immediately (admins publish at runtime via /admin).
export const dynamic = "force-dynamic";

export default async function ContratosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contratos");

  const rows = await getPublishedContracts(200);

  return (
    <main className="flex-1">
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
          {t("dataNote")}
        </p>
      </section>

      <section className="border-t border-ink-line bg-cream-deep">
        <div className="mx-auto max-w-[1240px] px-8 py-16 max-[720px]:px-5">
          {rows.length === 0 ? (
            <p className="rounded-sm border border-dashed border-ink-line-strong bg-cream px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.1em] text-ink-faint">
              {t("empty")}
            </p>
          ) : (
            <ContractBrowser rows={rows} />
          )}
        </div>
      </section>
    </main>
  );
}
