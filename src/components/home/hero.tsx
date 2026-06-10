import { useTranslations } from "next-intl";

import { Eyebrow } from "@/components/eyebrow";
import { richTags } from "@/i18n/rich";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative mx-auto max-w-[1240px] px-8 pb-10 pt-20 max-[720px]:px-5 max-[720px]:pt-15">
      {/* Hero radial blur — the single permitted gradient (SPEC §7). */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-15 top-15 h-80 w-80 rounded-full bg-celeste opacity-[0.16] blur-[100px]"
      />
      <div className="relative">
        <Eyebrow className="mb-7">{t("eyebrow")}</Eyebrow>
        <h1 className="mb-8 max-w-[1100px] font-display text-[clamp(48px,6.5vw,88px)] font-medium leading-[0.98] tracking-[-0.04em] [&_em]:italic [&_em]:text-rojo">
          {t.rich("title", richTags)}
        </h1>
        <p className="mb-10 max-w-[720px] text-[19px] leading-[1.55] text-ink-muted [&_strong]:font-semibold [&_strong]:text-ink">
          {t.rich("lede", richTags)}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#circuits"
            className="inline-flex items-center gap-2 rounded-xs bg-rojo px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-cream no-underline transition-colors hover:bg-rojo-deep"
          >
            {t("ctaPrimary")} <span className="text-base">→</span>
          </a>
          <a
            href="#thesis"
            className="inline-flex items-center gap-2 rounded-xs border-[1.5px] border-ink px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink no-underline transition-colors hover:bg-ink hover:text-cream"
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
