import { getTranslations, setRequestLocale } from "next-intl/server";

import { About } from "@/components/home/about";
import { Thesis } from "@/components/home/thesis";
import { Link } from "@/i18n/navigation";

export default async function SobrePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[1240px] px-8 pt-10 max-[720px]:px-5">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted no-underline hover:text-rojo"
        >
          ← {t("home")}
        </Link>
      </div>
      <Thesis />
      <About />
    </main>
  );
}
