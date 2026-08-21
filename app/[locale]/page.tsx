import Header from "../components/Header";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import RealEstate360 from "../components/RealEstate360";
import AreaMap from "../components/AreaMap";
import Services from "../components/Services";
import Properties from "../components/Properties";
import PropertySearchProvider from "../components/PropertySearchProvider";
import About from "../components/About";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import WhatsAppLauncher from "../components/WhatsAppLauncher";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAreas } from "../lib/areas";
import { getProperties } from "../lib/properties.server";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeAlternates,
  localePath,
} from "../lib/i18n";
import { MESSAGES } from "../lib/messages";

/*
  The home page had no canonical and no hreflang at all, so "/" and "/es" were
  two unlinked pages and "/" and "/en" were two copies of one. Both are settled
  here rather than in the layout: a canonical set on the layout is inherited by
  every page under it, which is the wrong answer everywhere except this one.
*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].home;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: localeAlternates(locale, (l) => localePath(l, "/")),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
      locale: locale === "es" ? "es_DO" : "en_US",
      url: localePath(locale, "/"),
      /*
        No `images` here on purpose. Setting one overrides the opengraph-image
        route next to this file, and the raw portrait is 1120x1400 — a tall
        crop that unfurlers letterbox or centre-crop to a sliver. The generated
        card is 1200x630, which is the shape they actually want.
      */
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  /*
    A segment that isn't a locale is a 404, not English.

    Falling back silently meant [locale] matched anything with a dot in it —
    /robots.txt, /sitemap.xml, /anything.xml — and served this page under a 200.
    That is an unbounded set of URLs all returning the home page, which is the
    textbook soft-404 duplicate-content shape.

    The empty case is not a mistake: the unprefixed path "/" reaches this route
    with no segment at all, and that is English by design.
  */
  if (raw && !isLocale(raw)) notFound();
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  /*
    Both Sanity queries start before either is awaited. Fetching the listings and
    then letting <AreaMap> fetch the areas ran them back to back — two round trips
    where one wall-clock is enough, since neither depends on the other.

    The listings are awaited here because the client provider needs the array
    itself; the areas travel on as a promise for AreaMap to await further down.
  */
  const areasPromise = getAreas();
  const properties = await getProperties(locale);

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1">
        <Hero />
        {/* The only page with the search on it, so the provider sits here rather than in
            the layout. Everything inside it stays a server component — they're passed
            through as children. */}
        <PropertySearchProvider properties={properties}>
          <Properties />
        </PropertySearchProvider>
        <RealEstate360 />
        <AreaMap areas={areasPromise} />
        <Services />
        <Stats />
        <About />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
