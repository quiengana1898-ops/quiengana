import { setRequestLocale } from "next-intl/server";

import { About } from "@/components/home/about";
import { Circuits } from "@/components/home/circuits";
import { DeepDive } from "@/components/home/deep-dive";
import { Hero } from "@/components/home/hero";
import { Infrastructure } from "@/components/home/infrastructure";
import { Intake } from "@/components/home/intake";
import { Thesis } from "@/components/home/thesis";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex-1">
      <Hero />
      <Thesis />
      <Circuits />
      <DeepDive />
      <Infrastructure />
      <About />
      <Intake />
    </main>
  );
}
