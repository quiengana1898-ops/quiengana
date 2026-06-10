"use client";

import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// EN/ES toggle. Switches locale while preserving the current (locale-stripped)
// path via next-intl navigation.
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex overflow-hidden rounded-xs border border-ink-line-strong font-mono max-[720px]:hidden">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale}
          className={cn(
            "cursor-pointer px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors",
            l === locale
              ? "bg-ink text-cream"
              : "text-ink-muted hover:bg-cream-deep hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
