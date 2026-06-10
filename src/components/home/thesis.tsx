import { useTranslations } from "next-intl";

import { CircuitDiagram } from "@/components/home/circuit-diagram";
import { richTags } from "@/i18n/rich";

export function Thesis() {
  const t = useTranslations("thesis");

  return (
    <section id="thesis" className="relative overflow-hidden bg-ink px-8 py-20 text-cream max-[720px]:px-5">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-[1fr_1.2fr] items-center gap-15 max-[1080px]:grid-cols-1 max-[1080px]:gap-10">
          <div>
            <div className="mb-5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-celeste before:block before:h-px before:w-6 before:bg-celeste before:content-['']">
              {t("label")}
            </div>
            <h2 className="mb-7 font-display text-[clamp(32px,4vw,52px)] font-medium leading-[1.05] tracking-[-0.03em] [&_em]:italic [&_em]:text-celeste">
              {t.rich("title", richTags)}
            </h2>
            <div className="text-base leading-[1.7] text-cream/[0.78] [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-cream">
              <p>{t.rich("p1", richTags)}</p>
              <p>{t.rich("p2", richTags)}</p>
              <p>{t.rich("p3", richTags)}</p>
            </div>
            <div className="mt-7 border-l-[3px] border-rojo pl-5 font-display text-[22px] italic leading-[1.4] text-celeste">
              {t("quote")}
            </div>
          </div>
          <CircuitDiagram />
        </div>
      </div>
    </section>
  );
}
