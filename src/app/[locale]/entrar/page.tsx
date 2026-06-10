import { getTranslations, setRequestLocale } from "next-intl/server";

import { SignInForm } from "@/components/auth/sign-in-form";

// Sign-in (magic link). Spanish slug `entrar` in both locales (CLAUDE.md §5).
export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">
          {t("title")}
        </h1>
        <p className="max-w-sm text-ink-muted">{t("subtitle")}</p>
      </div>
      <SignInForm />
    </main>
  );
}
