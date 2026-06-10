import { getTranslations, setRequestLocale } from "next-intl/server";

// Temporary placeholder to verify [locale] routing + next-intl. The faithful
// mockup render (SPEC §7) lands in Phase 1 item 6.
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
        {t("eyebrow")}
      </p>
      <h1 className="font-display text-5xl font-semibold text-ink">
        {t("title")}
      </h1>
      <p className="max-w-xl text-lg text-ink-muted">{t("tagline")}</p>
      <p className="font-mono text-xs text-ink-faint">{t("placeholder")}</p>
    </main>
  );
}
