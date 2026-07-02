import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/brand-mark";

// Dark footer with brand blurb, link columns, and the bandera mark (SPEC §7).
export function Footer() {
  const t = useTranslations("footer");

  const columns = [
    { title: t("investigationsTitle"), items: t.raw("investigations") as string[] },
    {
      title: t("infrastructureTitle"),
      items: t.raw("infrastructure") as string[],
    },
    { title: t("connectTitle"), items: t.raw("connect") as string[] },
  ];

  return (
    <footer className="bg-ink px-8 pb-8 pt-18 text-cream max-[720px]:px-5">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-10 border-b border-cream/15 pb-12 max-[720px]:grid-cols-1">
          <div>
            <h4 className="mb-3 font-display text-[32px] font-medium italic">
              Quién Gana
            </h4>
            <p className="mb-5 max-w-[380px] text-sm leading-[1.65] text-cream/65">
              {t("brandDesc")}
            </p>
            <div className="border-l-2 border-rojo pl-3 font-display text-sm italic text-celeste">
              {t("tagline")}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-celeste">
                {col.title}
              </h5>
              <ul className="list-none">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="mb-2.5 cursor-pointer text-[13px] leading-[1.5] text-cream/70 transition-colors hover:text-celeste"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-7 font-mono text-[11px] uppercase tracking-[0.08em] text-cream/50 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
          <div>{t("bottom")}</div>
          <div className="inline-flex items-center gap-2">
            <span className="block h-3.5 w-[21px] overflow-hidden rounded-[2px] border border-cream/20">
              <BrandMark className="h-full w-full" />
            </span>
            <span>{t("flagLabel")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
