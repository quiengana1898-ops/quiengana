import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { FlagBar } from "@/components/flag-bar";
import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";

import "../globals.css";

// SPEC §7 typography: Fraunces (display, incl. italic for political voice),
// Manrope (body), JetBrains Mono (data labels / eyebrows).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quien-gana.vercel.app"),
  title: "Quién Gana · Boricuas Antifascistas",
  description:
    "A public-accountability platform tracing the colonial circuits extracting wealth from Puerto Rico.",
  openGraph: {
    title: "Quién Gana",
    description:
      "A public-record search across the colonial circuits extracting wealth from Puerto Rico.",
    siteName: "Quién Gana",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quién Gana",
    description:
      "A public-record search across the colonial circuits extracting wealth from Puerto Rico.",
  },
};

// Pre-render both locales at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <FlagBar />
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
