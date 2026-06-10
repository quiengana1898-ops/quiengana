import { defineRouting } from "next-intl/routing";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

/**
 * Default locale is a SINGLE configurable value (CLAUDE.md §5, overriding
 * SPEC §8's hard `es` default). For now it's `en`; an env override is honored
 * so the planned geo-based default (PR → es, everyone else → en) is a one-line
 * swap rather than a refactor.
 */
const envDefault = process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale | undefined;
export const defaultLocale: Locale =
  envDefault && locales.includes(envDefault) ? envDefault : "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Both /es and /en are always prefixed; `/` redirects to the default (SPEC §8).
  localePrefix: "always",
});
