import { useTranslations } from "next-intl";

import { richTags } from "@/i18n/rich";

type Principle = { title: string; body: string };

export function About() {
  const t = useTranslations("about");
  const principles = t.raw("principles") as Principle[];

  return (
    <section id="about" className="relative overflow-hidden bg-ink px-8 py-25 text-cream max-[720px]:px-5 max-[720px]:py-15">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-25 -top-25 h-[380px] w-[380px] rounded-full bg-rojo opacity-[0.14] blur-[80px]"
      />
      <div className="relative mx-auto grid max-w-[1240px] grid-cols-[1fr_1.3fr] items-start gap-20 max-[1080px]:grid-cols-1 max-[1080px]:gap-10">
        <div>
          <div className="mb-5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-celeste before:block before:h-px before:w-6 before:bg-celeste before:content-['']">
            {t("label")}
          </div>
          <h2 className="font-display text-[clamp(36px,4.5vw,56px)] font-medium leading-[1.02] tracking-[-0.03em] [&_em]:italic [&_em]:text-celeste">
            {t.rich("title", richTags)}
          </h2>
        </div>
        <div>
          <div className="text-base leading-[1.75] text-cream/80 [&_p]:mb-[18px] [&_strong]:font-semibold [&_strong]:text-cream">
            <p>{t.rich("p1", richTags)}</p>
            <p>{t.rich("p2", richTags)}</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-cream/15 pt-8 max-[720px]:grid-cols-1">
            {principles.map((p, i) => (
              <div key={p.title}>
                <div className="mb-2 font-display text-[32px] font-semibold leading-none text-celeste">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-[13px] leading-[1.6] text-cream/75">
                  <strong className="mb-1 block font-semibold text-cream">
                    {p.title}
                  </strong>
                  <span>{p.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
