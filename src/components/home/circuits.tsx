import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { circuits, type CircuitStatus } from "@/lib/circuits";
import { cn } from "@/lib/utils";

// Live circuits first, then urgent, then the rest.
const ORDER: Record<CircuitStatus, number> = {
  live: 0,
  urgent: 1,
  building: 2,
  research: 3,
};
const PILL: Record<CircuitStatus, string> = {
  live: "border-celeste text-celeste-deep",
  urgent: "border-rojo text-rojo",
  building: "border-ink-line-strong text-ink-muted",
  research: "border-ink-line-strong text-ink-muted",
};

export function Circuits() {
  const t = useTranslations("circuits");
  const locale = useLocale();
  const items = [...circuits].sort((a, b) => ORDER[a.status] - ORDER[b.status]);

  return (
    <section id="investigations" className="border-t border-ink-line bg-cream-deep">
      <div className="mx-auto max-w-[1180px] px-8 py-16 max-[720px]:px-5 max-[720px]:py-12">
        <div className="mb-7">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {t("label")}
          </div>
          <h2 className="mt-2 font-display text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.02em]">
            {t("heading")}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-px border border-ink-line bg-ink-line max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
          {items.map((c) => {
            const main = locale === "es" ? c.nameEs : c.nameEn;
            const other = locale === "es" ? c.nameEn : c.nameEs;
            const live = !!c.href;
            const cls = cn(
              "group flex min-h-[150px] flex-col p-5 no-underline text-ink",
              live && "transition-colors hover:bg-celeste-mist",
              !live && "bg-cream",
              live && "bg-cream",
            );
            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.1em] text-ink-faint">
                    {c.num}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xs border px-2 py-[3px] font-mono text-[9px] font-medium uppercase tracking-[0.12em]",
                      PILL[c.status],
                    )}
                  >
                    {c.status === "live" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-celeste" />
                    )}
                    {t(`status.${c.status}`)}
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="font-display text-[20px] font-medium leading-[1.1] tracking-[-0.01em]">
                    {main}
                  </h3>
                  <div className="font-display text-[13px] italic text-ink-muted">
                    {other}
                  </div>
                </div>
                <div className="mt-auto flex items-baseline justify-between pt-3">
                  <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-rojo [font-variant-numeric:tabular-nums]">
                    {c.stat}
                  </span>
                  {live && (
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-celeste-deep opacity-0 transition-opacity group-hover:opacity-100">
                      {c.id === "pensiones" ? t("lookup") : t("browse")}
                    </span>
                  )}
                </div>
              </>
            );
            return live ? (
              <Link key={c.id} href={c.href!} className={cls}>
                {inner}
              </Link>
            ) : (
              <div key={c.id} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
