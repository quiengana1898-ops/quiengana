import { useLocale, useTranslations } from "next-intl";

import { SectionHead } from "@/components/section-head";
import { Link } from "@/i18n/navigation";
import { circuits, type CircuitStatus } from "@/lib/circuits";
import { richTags } from "@/i18n/rich";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<CircuitStatus, string> = {
  live: "bg-rojo-pale text-rojo-deep",
  building: "bg-celeste-pale text-celeste-deep",
  urgent: "bg-rojo text-cream",
  research: "bg-cream-deep text-ink-muted",
};

export function Circuits() {
  const t = useTranslations("circuits");
  const locale = useLocale();

  return (
    <section id="circuits" className="mx-auto max-w-[1240px] px-8 py-25 max-[720px]:px-5 max-[720px]:py-15">
      <SectionHead
        label={t("label")}
        title={t.rich("title", richTags)}
        intro={t("intro")}
        side={`${t("sideLabel")}\n${t("sideValue")}`}
      />

      <div className="grid grid-cols-3 gap-px border border-ink-line bg-ink-line max-[1080px]:grid-cols-2 max-[720px]:grid-cols-1">
        {circuits.map((c) => {
          const featured = !!c.featured;
          const main = locale === "es" ? c.nameEs : c.nameEn;
          const other = locale === "es" ? c.nameEn : c.nameEs;
          // Pensiones (featured) is live — link to its circuit page; others inert for now.
          const className = cn(
            "group flex min-h-[320px] flex-col gap-4 p-8 no-underline transition-colors",
            featured
              ? "col-span-2 bg-ink text-cream hover:bg-[#1a2228] max-[720px]:col-span-1"
              : "bg-cream text-ink hover:bg-celeste-mist",
          );
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
                    featured ? "text-celeste" : "text-rojo",
                  )}
                >
                  {c.num} / {c.code}
                </span>
                <span
                  className={cn(
                    "rounded-xs px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em]",
                    featured && c.status === "live"
                      ? "bg-rojo/20 text-cream"
                      : STATUS_STYLES[c.status],
                  )}
                >
                  {t(`status.${c.status}`)}
                </span>
              </div>

              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center",
                  featured ? "text-celeste" : "text-rojo",
                )}
              >
                {c.icon}
              </div>

              <div>
                <div
                  className={cn(
                    "font-display font-medium leading-[1.05] tracking-[-0.02em]",
                    featured ? "text-4xl" : "text-[26px]",
                  )}
                >
                  {main}
                </div>
                <div
                  className={cn(
                    "mt-1 font-display italic",
                    featured ? "text-base text-cream/60" : "text-sm text-ink-muted",
                  )}
                >
                  {other}
                </div>
              </div>

              <div
                className={cn(
                  "flex-1 leading-[1.55]",
                  featured ? "text-base text-cream/75" : "text-sm text-ink-muted",
                )}
              >
                {t(`items.${c.id}.mechanism`)}
              </div>

              <div
                className={cn(
                  "mt-auto flex items-center justify-between border-t pt-4",
                  featured ? "border-cream/15" : "border-ink-line",
                )}
              >
                <div>
                  <div
                    className={cn(
                      "font-display font-semibold tracking-[-0.02em]",
                      featured ? "text-[32px] text-celeste" : "text-2xl text-ink",
                    )}
                  >
                    {c.stat}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                      featured ? "text-cream/50" : "text-ink-faint",
                    )}
                  >
                    {t(`items.${c.id}.statLabel`)}
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-all group-hover:gap-3",
                    featured ? "text-cream" : "text-ink",
                  )}
                >
                  {c.href ? t("ctaFeatured") : t("ctaDefault")} →
                </span>
              </div>
            </>
          );

          return c.href ? (
            <Link key={c.id} href={c.href} className={className}>
              {inner}
            </Link>
          ) : (
            <div key={c.id} className={className}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
