import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";

// Route-based nav so it works from any page (the old anchor-only nav broke off
// the homepage). Investigations jumps to the homepage grid.
const NAV = [
  { href: "/#investigations", key: "investigations" },
  { href: "/cable", key: "cable" },
  { href: "/reportar", key: "report" },
  { href: "/sobre", key: "about" },
] as const;

// Sticky translucent header with brand mark, nav, and locale toggle (SPEC §7).
export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-[100] border-b border-ink-line bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-8 px-8 py-4 max-[720px]:px-5">
        <Link href="/" className="flex items-center gap-3.5 text-ink no-underline">
          <span className="block h-[30px] w-[45px] overflow-hidden rounded-xs border border-ink-line">
            <BrandMark className="h-full w-full" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-[22px] font-bold italic leading-none tracking-[-0.02em]">
              Quién Gana
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              {t("brandSub")}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-[13px]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-transparent py-1 font-medium text-ink no-underline transition-colors hover:border-rojo max-[720px]:hidden"
            >
              {t(item.key)}
            </Link>
          ))}
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
