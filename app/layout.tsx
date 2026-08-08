import type { Metadata } from "next";

import { Source_Serif_4, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import PropertySearchProvider from "./components/PropertySearchProvider";

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

export const metadata: Metadata = {
  title: "Gio In The DR — Buy Property in Cabarete, Dominican Republic",
  description:
    "Trilingual agent in Cabarete helping foreigners buy homes, land & investment property on the DR's north coast — guidance in English, Spanish & Italian.",
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
      <body className="min-h-full flex flex-col bg-cream text-ink font-body">
        {/*
          The search lives in the Header, which every page renders itself — so the provider
          has to sit above all of them. Pages stay server components: they're passed through
          as `children`. No Suspense needed: the provider deliberately avoids
          useSearchParams so the pages still prerender in full (see the comment there).
        */}
        <PropertySearchProvider>{children}</PropertySearchProvider>
      </body>
    </html>
  );
}
