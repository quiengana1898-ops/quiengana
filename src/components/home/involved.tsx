import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { richTags } from "@/i18n/rich";

// Compact get-involved — replaces the long inert intake form on the homepage.
// Both CTAs route to /reportar, which hosts the full report form.
export function Involved() {
  const t = useTranslations("involved");

  return (
    <section id="involved" className="border-t border-ink-line">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-8 px-8 py-14 max-[720px]:px-5 max-[720px]:py-12">
        <div>
          <h2 className="font-display text-[clamp(24px,2.6vw,30px)] font-medium leading-[1.1] tracking-[-0.02em] [&_em]:italic [&_em]:text-rojo">
            {t.rich("title", richTags)}
          </h2>
          <p className="mt-2.5 max-w-[46ch] text-[15px] leading-[1.55] text-ink-muted">
            {t("intro")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/reportar"
            className="inline-flex items-center gap-2 rounded-xs bg-rojo px-[22px] py-3.5 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-cream no-underline hover:bg-rojo-deep"
          >
            {t("report")} <span aria-hidden>→</span>
          </Link>
          <Link
            href="/reportar"
            className="inline-flex items-center rounded-xs border-[1.5px] border-ink px-[22px] py-3.5 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-ink no-underline hover:bg-ink hover:text-cream"
          >
            {t("join")}
          </Link>
        </div>
      </div>
    </section>
  );
}
