import type { Metadata } from "next";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppLauncher from "./WhatsAppLauncher";
import JsonLd from "./JsonLd";
import LegalDocument from "./LegalDocument";
import { LEGAL, LEGAL_UPDATED, type LegalSlug } from "../lib/legal";
import {
  DEFAULT_LOCALE,
  HREFLANG,
  isLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "../lib/i18n";
import { MESSAGES } from "../lib/messages";
import { ORG_ID, breadcrumbSchema, graph } from "../lib/schema";
import { absoluteUrl } from "../lib/site";

/*
  The shell both policy routes render, so /privacy and /cookies stay one page
  with two documents in it rather than two pages that have to be kept in step.

  Each route file keeps its own generateMetadata and default export — Next reads
  those per file, and a clever shared factory would be a worse trade than the
  five lines it saves.
*/

/** The date, written the way the reader's language writes dates. */
function updatedLine(locale: Locale): string {
  const formatted = new Intl.DateTimeFormat(HREFLANG[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    // Fixed, or the date shifts a day for anyone west of UTC — LEGAL_UPDATED is
    // a calendar date, not an instant.
    timeZone: "UTC",
  }).format(new Date(`${LEGAL_UPDATED}T00:00:00Z`));
  return LEGAL[locale].updatedLabel(formatted);
}

export function legalMetadata(locale: Locale, slug: LegalSlug): Metadata {
  const doc = LEGAL[locale].docs[slug];
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: localeAlternates(locale, (l) => localePath(l, `/${slug}`)),
    openGraph: {
      title: doc.metaTitle,
      description: doc.metaDescription,
      type: "article",
      locale: locale === "es" ? "es_DO" : "en_US",
      url: localePath(locale, `/${slug}`),
    },
    /*
      Indexable, deliberately. A policy is thin content and it will never rank,
      but it is one of the things both Google and a cautious buyer look for
      before believing a site belongs to a real business.
    */
  };
}

export default function LegalPage({
  locale: raw,
  slug,
}: {
  locale: string;
  slug: LegalSlug;
}) {
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const doc = LEGAL[locale].docs[slug];
  const m = MESSAGES[locale];

  return (
    <>
      <JsonLd
        data={graph(locale, [
          {
            "@type": "WebPage",
            "@id": absoluteUrl(localePath(locale, `/${slug}`)),
            url: absoluteUrl(localePath(locale, `/${slug}`)),
            name: doc.title,
            description: doc.metaDescription,
            dateModified: LEGAL_UPDATED,
            publisher: { "@id": ORG_ID },
          },
          breadcrumbSchema(locale, [
            { name: m.nav.properties, path: localePath(locale, "/") },
            { name: doc.title, path: localePath(locale, `/${slug}`) },
          ]),
        ])}
      />
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16"
      >
        <LegalDocument doc={doc} updated={updatedLine(locale)} />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
