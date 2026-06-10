import { useTranslations } from "next-intl";

import { SectionHead } from "@/components/section-head";
import { richTags } from "@/i18n/rich";

// Presentational stub — the live pension lookup is wired in Phase 2.
export function DeepDive() {
  const t = useTranslations("deepDive");
  const chips = ["all", "state", "teacher", "former"] as const;

  return (
    <section id="deep-dive" className="border-y border-ink-line bg-celeste-mist">
      <div className="mx-auto max-w-[1240px] px-8 py-25 max-[720px]:px-5 max-[720px]:py-15">
        <SectionHead
          num="02"
          label={t("label")}
          title={t.rich("title", richTags)}
          intro={t("intro")}
          side={t("side")}
        />

        <div className="overflow-hidden rounded-sm border border-ink-line-strong bg-cream">
          <div className="flex items-center justify-between bg-ink px-8 py-6 text-cream max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3 max-[720px]:px-5">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-celeste">
                00 / Pensiones
              </span>
              <span className="font-display text-[22px] font-medium tracking-[-0.01em]">
                {t("shellTitle")}
              </span>
            </div>
            <span className="rounded-xs bg-rojo/20 px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-cream">
              {t("liveData")}
            </span>
          </div>

          <div className="p-9 max-[720px]:p-5">
            <div className="mb-5 flex gap-3">
              <input
                type="text"
                disabled
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-xs border-[1.5px] border-ink-line bg-cream-deep px-[18px] py-3.5 text-[15px] text-ink placeholder:text-ink-faint"
              />
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {chips.map((chip, i) => (
                <span
                  key={chip}
                  className={
                    i === 0
                      ? "rounded-xs border border-ink bg-ink px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-cream"
                      : "rounded-xs border border-ink-line-strong px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted"
                  }
                >
                  {t(`chips.${chip}`)}
                </span>
              ))}
            </div>
            <p className="rounded-xs border border-dashed border-ink-line-strong px-5 py-8 text-center font-mono text-xs uppercase tracking-[0.1em] text-ink-faint">
              {t("comingSoon")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
