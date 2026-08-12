import type { Metadata, Viewport } from "next";

import { Source_Serif_4, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

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
  metadataBase resolves the relative canonical and og:image URLs the property and
  blog pages set. Without it those stay relative, and a relative og:image is one
  no crawler or chat app can fetch — the link previews come out blank.

  Set NEXT_PUBLIC_SITE_URL on the deploy; the localhost default only matters in dev.
*/
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${hanken.variable} h-full antialiased`}
    >
      <head>
        {/* Property photos come from Sanity's CDN — warm the connection early. */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink font-body">
        {/* Skip link: first thing in the tab order, invisible until focused, so
            keyboard users aren't dragged through the whole header on every page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[300] focus:top-3 focus:left-3 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream focus:no-underline"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
