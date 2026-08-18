import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppLauncher from "../components/WhatsAppLauncher";
import SectionHeading from "../components/SectionHeading";
import PropertyCard from "../components/PropertyCard";
import PropertyFiltersBar from "./PropertyFilters";
import Pagination from "./Pagination";
import { WA } from "../lib/whatsapp";
import {
  getPropertiesPage,
  getPropertyFacets,
  NO_FILTERS,
  PAGE_SIZE,
  type PropertyFilters,
} from "../lib/properties.server";

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

export const metadata: Metadata = {
  title: "Properties for sale in Cabarete & the north coast — Gio In The DR",
  description:
    "Every listing Gio has published: beachfront condos, villas, land and pre-construction around Cabarete, Sosúa and the Dominican north coast.",
  alternates: { canonical: "/properties" },
};

/** Next 16 hands searchParams in as a promise. */
type PageProps = {
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

export default async function PropertiesIndex({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = readFilters(params);
  const page = toInt(params.page) || 1;

  // Facets don't depend on the filters, so both start together rather than
  // the page waiting on a list of areas it already knows it needs.
  const facetsPromise = getPropertyFacets();
  const result = await getPropertiesPage(filters, page);
  const facets = await facetsPromise;

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
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14 w-full">
        <SectionHeading title="Properties for sale" className="mb-8">
          <p className="text-muted mt-3 max-w-2xl">
            Beachfront condos, villas, land and pre-construction across Cabarete, Sosúa and
            the north coast.
          </p>
        </SectionHeading>

        <PropertyFiltersBar facets={facets} filters={filters} />

        {/* aria-live so a screen reader hears the count change after a search,
            which is otherwise the one part of the result that is invisible. */}
        <p aria-live="polite" className="text-sm text-muted mt-6 tabular-nums">
          {result.total === 0
            ? "No properties match"
            : `${first}–${last} of ${result.total} ${result.total === 1 ? "property" : "properties"}`}
        </p>

        {result.total === 0 ? (
          <div className="min-h-[320px] flex flex-col items-center justify-center text-center text-muted">
            {/* Two empty states, because they mean different things: no matches is
                the visitor's filters, nothing published at all is Gio between
                listings and the only useful thing to offer is a conversation. */}
            {filtered ? (
              <>
                <p>Nothing matches those filters.</p>
                <Link
                  href="/properties"
                  className="mt-4 border border-line rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 transition-colors no-underline"
                >
                  Clear filters
                </Link>
              </>
            ) : (
              <>
                <p className="max-w-sm">
                  Nothing is listed publicly right now — a lot of what Gio sells never gets
                  that far. Message her and she&apos;ll tell you what&apos;s actually available.
                </p>
                <a
                  href={WA.general}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-3.5 rounded-full transition-colors no-underline"
                >
                  Ask Gio what&apos;s available
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
        />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
