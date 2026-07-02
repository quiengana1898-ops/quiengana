import { setRequestLocale } from "next-intl/server";

import { Chyron } from "@/components/home/chyron";
import { Circuits } from "@/components/home/circuits";
import { Hero } from "@/components/home/hero";
import { Involved } from "@/components/home/involved";

// The chyron reads the live wire, so render on demand.
export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Chyron />
      <main className="flex-1">
        <Hero />
        <Circuits />
        <Involved />
      </main>
    </>
  );
}
