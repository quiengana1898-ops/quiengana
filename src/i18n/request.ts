import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

// Loads the message catalog for the active request locale. Catalogs live in
// src/translations/{es,en}.json (CLAUDE.md §5).
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../translations/${locale}.json`)).default,
  };
});
