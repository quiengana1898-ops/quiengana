import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/locale-switcher";

const NAV = [
  { href: "#thesis", key: "circuit" },
  { href: "#circuits", key: "investigations" },
  { href: "#infra", key: "infrastructure" },
  { href: "#about", key: "about" },
  { href: "#report", key: "report" },
] as const;

// Sticky translucent header with brand mark, anchor nav, and locale toggle (SPEC §7).
export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-[100] border-b border-ink-line bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-8 px-8 py-4 max-[720px]:px-5">
        <a href="#" className="flex items-center gap-3.5 text-ink no-underline">
          <span
            className="block h-[38px] w-[38px] bg-celeste"
            style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
            aria-hidden
          />
          <span className="flex flex-col">
            <span className="font-display text-[22px] font-bold italic leading-none tracking-[-0.02em]">
              Quién Gana
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              {t("brandSub")}
            </span>
          </span>
        </a>
        <nav className="flex items-center gap-6 text-[13px]">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="border-b border-transparent py-1 font-medium text-ink no-underline transition-colors hover:border-rojo max-[720px]:hidden"
            >
              {t(item.key)}
            </a>
          ))}
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
