import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WhatsAppLauncher from "../../components/WhatsAppLauncher";
import SectionHeading from "../../components/SectionHeading";
import PropertyCard from "../../components/PropertyCard";
import PropertyFiltersBar from "../../components/properties/PropertyFilters";
import Pagination from "../../components/properties/Pagination";
import { WA } from "../../lib/whatsapp";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeAlternates,
  localePath,
  propertyPath,
} from "../../lib/i18n";
import JsonLd from "../../components/JsonLd";
import { absoluteUrl } from "../../lib/site";
import { ORG_ID, breadcrumbSchema, graph } from "../../lib/schema";
import { MESSAGES } from "../../lib/messages";
import {
  countProperties,
  getPropertiesPage,
  getPropertyFacets,
  NO_FILTERS,
  PAGE_SIZE,
  type PropertyFilters,
} from "../../lib/properties.server";
import type { Locale } from "../../lib/i18n";

/*
  The property index: filtered and paginated by Sanity, not by the browser.

  Why this is its own route rather than the home page's search section. Reading
  searchParams opts a route into dynamic rendering, and "/" is prerendered
  static — trading that away for a filter bar would slow the page the site is
  actually judged on. A separate route also gives crawlers something the anchor
  never could: a real, linkable index whose every page is a URL, which is what
  "← All properties" on a listing should have pointed at all along.

  Filtering happens before the slice, so the count is a count of matches and not
  of what happened to land on this page.
*/

/*
  generateMetadata, not a `metadata` const: a constant cannot see the locale, so
  /es/properties served the English title and a canonical pointing at the English
  URL — telling Google the Spanish index was a duplicate of it.
*/
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].properties;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: localeAlternates(locale, (l) => propertyPath(l)),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
      locale: locale === "es" ? "es_DO" : "en_US",
      url: propertyPath(locale),
    },
  };
}

/** Next 16 hands searchParams in as a promise. */
type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** First value only — ?area=a&area=b is a malformed URL, not two filters. */
function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/** Non-negative integer or 0. Anything else in the URL is treated as absent. */
function toInt(value: string | string[] | undefined): number {
  const n = Number.parseInt(one(value), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function readFilters(params: Record<string, string | string[] | undefined>): PropertyFilters {
  return {
    ...NO_FILTERS,
    area: one(params.area),
    category: one(params.category),
    minBeds: toInt(params.minBeds),
    maxPrice: toInt(params.maxPrice),
    q: one(params.q),
  };
}

/** Only the filters that are set, so a shared URL stays readable. */
function hrefFor(filters: PropertyFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.area) params.set("area", filters.area);
  if (filters.category) params.set("category", filters.category);
  if (filters.minBeds) params.set("minBeds", String(filters.minBeds));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/properties?${qs}` : "/properties";
}

/*
  The shell renders immediately; the two queries stream in behind it.

  This route reads searchParams, so it is dynamic — and with the fetches inline
  nothing reached the browser until Sanity answered both. Measured at 320-570 ms
  to first byte against 6-10 ms for the prerendered routes, which is the whole
  page waiting on data most of it does not need.

  Two boundaries because the two queries are independent: the facets are the
  same whatever you searched for, and the results are the only part that has to
  wait for the filter.
*/
export default async function PropertiesIndex({ searchParams, params: routeParams }: PageProps) {
  const { locale: raw } = await routeParams;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].properties;
  const params = await searchParams;
  const filters = readFilters(params);
  const page = toInt(params.page) || 1;

  /*
    Page numbers are validated before anything streams, because notFound()
    inside a Suspense boundary arrives after the headers and renders a 404 body
    with a 200 status — which is exactly the duplicate content the 404 exists to
    prevent.

    Only for page 2 and beyond: page one is always valid, so the common request
    pays nothing and keeps its ~8 ms to first byte.
  */
  if (page > 1) {
    const total = await countProperties(filters);
    if (total === 0 || page > Math.ceil(total / PAGE_SIZE)) notFound();
  }

  return (
    <>
      <JsonLd
        data={graph(locale, [
          {
            "@type": "CollectionPage",
            "@id": absoluteUrl(propertyPath(locale)),
            url: absoluteUrl(propertyPath(locale)),
            name: t.metaTitle,
            description: t.metaDescription,
            about: { "@id": ORG_ID },
            isPartOf: { "@id": absoluteUrl("/#website") },
          },
          breadcrumbSchema(locale, [
            { name: "Gio In The DR", path: localePath(locale, "/") },
            { name: t.heading, path: propertyPath(locale) },
          ]),
        ])}
      />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14 w-full">
        {/* as="h1": this is a page in its own right, not a section of one, and
            it was shipping with no h1 at all. */}
        <SectionHeading as="h1" title={t.heading} className="mb-8">
          <p className="text-muted mt-3 max-w-2xl">{t.indexIntro}</p>
        </SectionHeading>

        <Suspense fallback={<FiltersSkeleton />}>
          <Filters filters={filters} locale={locale} />
        </Suspense>

        {/*
          Keyed on the query, so changing a filter shows the skeleton again
          rather than leaving the previous results on screen looking current.
        */}
        <Suspense key={`${JSON.stringify(filters)}:${page}`} fallback={<ResultsSkeleton />}>
          <Results filters={filters} page={page} locale={locale} />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}

/** Reserves the filter bar's height so the results below do not jump when it lands. */
function FiltersSkeleton() {
  return <div className="bg-card border border-line rounded-3xl h-[188px] animate-pulse" />;
}

function ResultsSkeleton() {
  return (
    <>
      <p className="text-sm text-muted mt-6">&nbsp;</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl bg-card border border-line aspect-[4/3] animate-pulse" />
        ))}
      </div>
    </>
  );
}

async function Filters({ filters, locale }: { filters: PropertyFilters; locale: Locale }) {
  const facets = await getPropertyFacets();
  return <PropertyFiltersBar facets={facets} filters={filters} locale={locale} />;
}

async function Results({
  filters,
  page,
  locale,
}: {
  filters: PropertyFilters;
  page: number;
  locale: Locale;
}) {
  const t = MESSAGES[locale].properties;
  const result = await getPropertiesPage(filters, page, locale);

  /*
    A page past the end is not a page. Clamping would silently serve page 1 at a
    dozen different URLs, which is duplicate content a crawler has to work out;
    404 says the obvious thing. Only when there are results at all — an empty
    filter legitimately has one empty page to show its own empty state.
  */
  if (result.total > 0 && result.page > result.pageCount) notFound();

  const filtered =
    Boolean(filters.q || filters.area || filters.category || filters.minBeds || filters.maxPrice);
  const first = (result.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(result.page * PAGE_SIZE, result.total);

  return (
    <>
        {/* aria-live so a screen reader hears the count change after a search,
            which is otherwise the one part of the result that is invisible. */}
        <p aria-live="polite" className="text-sm text-muted mt-6 tabular-nums">
          {result.total === 0
            ? t.noMatch
            : t.count(first, last, result.total)}
        </p>

        {/* Say when the results are approximate. These came from the phonetic
            retry because nothing matched literally, and presenting a guess as an
            exact answer is how someone concludes the search is broken. */}
        {result.fuzzy ? (
          <p className="text-sm text-muted mt-1">
            {t.noExactMatch} <span className="text-ink font-semibold">{filters.q}</span> {t.showingClosest}
          </p>
        ) : null}

        {result.total === 0 ? (
          <div className="min-h-[320px] flex flex-col items-center justify-center text-center text-muted">
            {/* Two empty states, because they mean different things: no matches is
                the visitor's filters, nothing published at all is Gio between
                listings and the only useful thing to offer is a conversation. */}
            {filtered ? (
              <>
                <p>{t.noMatchFilters}</p>
                <Link
                  href="/properties"
                  className="mt-4 border border-line rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 transition-colors no-underline"
                >
                  {t.clearFilters}
                </Link>
              </>
            ) : (
              <>
                <p className="max-w-sm"> {t.nothingListed}
                </p>
                <a
                  href={WA.general}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-3.5 rounded-full transition-colors no-underline"
                >
                  {t.askAvailable}
                </a>
              </>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {result.items.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        )}

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          hrefFor={(p) => hrefFor(filters, p)}
          labels={MESSAGES[locale].common}
        />
    </>
  );
}
