import type { Metadata, Viewport } from "next";

import { Source_Serif_4, Hanken_Grotesk } from "next/font/google";
import "../globals.css";
import { DEFAULT_LOCALE, HREFLANG, LOCALES, isLocale } from "../lib/i18n";
import { SITE_URL } from "../lib/site";
import LocaleProvider from "../components/LocaleProvider";
import { MESSAGES } from "../lib/messages";

// Heading serif — simpler / lower-contrast than Playfair ("menos fairy, mas simple").
const heading = Source_Serif_4({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

/*
  metadataBase resolves the relative canonical and og:image URLs the pages below
  set. Without it those stay relative, and a relative og:image is one no crawler
  or chat app can fetch — the link previews come out blank.

  Set NEXT_PUBLIC_SITE_URL on the deploy; the localhost default only matters in
  dev. The origin itself now lives in lib/site so the sitemap resolves against
  the same value these tags do.

  Title and description are defaults only — every page sets its own, in its own
  language. No `alternates` here on purpose: a canonical on the root layout is
  inherited by every page beneath it, which would point the whole site at one URL.
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Gio In The DR — Buy Property in Cabarete, Dominican Republic",
  description:
    "Trilingual agent in Cabarete helping foreigners buy homes, land & investment property on the DR's north coast — guidance in English, Spanish & Italian.",
};

/* Matches --color-cream, so mobile browser chrome blends with the page instead of
   framing it in white. */
export const viewport: Viewport = {
  themeColor: "#f1e8df",
  colorScheme: "light",
};

/*
  The root layout lives under [locale] so <html lang> can be the actual language.
  There is no app/layout.tsx: rootParams serves the unprefixed path from this
  same tree, so nothing renders outside it and this is the only root there is.

  (An earlier version of this comment credited middleware for the unprefixed
  path. There is no middleware.ts in this repo and there never was one here.)
*/
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const lang = isLocale(locale) ? HREFLANG[locale] : HREFLANG[DEFAULT_LOCALE];
  return (
    <html
      lang={lang}
      className={`${heading.variable} ${hanken.variable} h-full antialiased`}
    >
      <head>
        {/* Property photos come from Sanity's CDN — warm the connection early. */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink font-body">
        {/* Every client component below reads its strings from here. */}
        <LocaleProvider locale={isLocale(locale) ? locale : DEFAULT_LOCALE}>
        {/* Skip link: first thing in the tab order, invisible until focused, so
            keyboard users aren't dragged through the whole header on every page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[300] focus:top-3 focus:left-3 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream focus:no-underline"
        >
          {MESSAGES[isLocale(locale) ? locale : DEFAULT_LOCALE].common.skipToContent}
        </a>
        {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
