import { useTranslations } from "next-intl";

import { SectionHead } from "@/components/section-head";
import { Link } from "@/i18n/navigation";
import { richTags } from "@/i18n/rich";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  className: "h-7 w-7",
} as const;

const ITEMS = [
  {
    id: "mapa",
    icon: (
      <svg {...iconProps}>
        <path d="M12 22s8-7 8-13a8 8 0 10-16 0c0 6 8 13 8 13z" />
        <circle cx="12" cy="9" r="3" />
      </svg>
    ),
  },
  {
    id: "cable",
    href: "/cable",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 14h6M7 17h4" />
        <circle cx="17" cy="15.5" r="1.5" />
      </svg>
    ),
  },
  {
    id: "herramientas",
    icon: (
      <svg {...iconProps}>
        <path d="M14 3l-4 8h6l-4 10M3 12h4M17 12h4" />
      </svg>
    ),
  },
  {
    id: "expediente",
    icon: (
      <svg {...iconProps}>
        <path d="M12 4v16M4 12h16" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
] as const;

export function Infrastructure() {
  const t = useTranslations("infra");

  return (
    <section id="infra" className="border-t border-ink-line bg-cream-deep">
      <div className="mx-auto max-w-[1240px] px-8 py-25 max-[720px]:px-5 max-[720px]:py-15">
        <SectionHead
          num="03"
          label={t("label")}
          title={t.rich("title", richTags)}
          intro={t("intro")}
        />

        <div className="grid grid-cols-2 gap-px border border-ink-line bg-ink-line max-[1080px]:grid-cols-1">
          {ITEMS.map((item) => {
            const href = "href" in item ? item.href : null;
            const inner = (
              <>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-ink text-celeste">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 font-display text-2xl font-medium tracking-[-0.015em]">
                    {t(`items.${item.id}.name`)}
                    {href && <span aria-hidden className="text-rojo">→</span>}
                  </h3>
                  <div className="mb-3 font-display text-[13px] italic text-ink-muted">
                    {t(`items.${item.id}.sub`)}
                  </div>
                  <p className="text-sm leading-[1.6] text-ink-muted">
                    {t(`items.${item.id}.body`)}
                  </p>
                </div>
              </>
            );
            const cls =
              "flex min-h-[200px] items-start gap-6 bg-cream p-10 max-[720px]:p-6";
            return href ? (
              <Link
                key={item.id}
                href={href}
                className={`${cls} text-ink no-underline transition-colors hover:bg-celeste-mist`}
              >
                {inner}
              </Link>
            ) : (
              <div key={item.id} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
