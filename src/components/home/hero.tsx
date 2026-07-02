import { useTranslations } from "next-intl";

import { Eyebrow } from "@/components/eyebrow";
import { ActorSearch } from "@/components/home/actor-search";
import { richTags } from "@/i18n/rich";

export function Hero() {
  const t = useTranslations("hero");
  const stats = t.raw("stats") as { n: string; k: string }[];

  return (
    <section className="relative overflow-hidden">
      {/* Hero radial blur — the single permitted gradient (SPEC §7). */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-40px] top-[-30px] h-[380px] w-[380px] rounded-full bg-celeste opacity-[0.14] blur-[110px]"
      />
      <div className="relative mx-auto max-w-[1180px] px-8 pb-10 pt-16 max-[720px]:px-5 max-[720px]:pt-12">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="mt-5 max-w-[15ch] font-display text-[clamp(40px,6.4vw,78px)] font-medium leading-[0.99] tracking-[-0.03em] [&_em]:italic [&_em]:text-rojo">
          {t.rich("title", richTags)}
        </h1>
        <p className="mt-5 max-w-[56ch] text-[19px] leading-[1.5] text-ink-muted [&_strong]:font-semibold [&_strong]:text-ink">
          {t.rich("sub", richTags)}
        </p>

        <div className="mt-7">
          <ActorSearch />
        </div>

        <div className="mt-9 flex flex-wrap border-t border-ink-line">
          {stats.map((s) => (
            <div
              key={s.k}
              className="mr-[34px] border-r border-ink-line py-5 pr-[34px] last:mr-0 last:border-r-0 max-[600px]:mr-5 max-[600px]:pr-5"
            >
              <div className="font-display text-[34px] font-semibold leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums] max-[600px]:text-[27px]">
                {s.n}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                {s.k}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
