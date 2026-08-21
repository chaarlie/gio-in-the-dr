import { cache } from "react";
import { sanityFetch } from "../../sanity/lib/client";
import {
  PROPERTIES_QUERY,
  PROPERTIES_COUNT_QUERY,
  PROPERTIES_PAGE_QUERY,
  PROPERTY_FACETS_QUERY,
  PROPERTY_QUERY,
  PROPERTY_SLUGS_QUERY,
} from "../../sanity/lib/queries";
import { formatPrice } from "./format";
import { formatSpec } from "./spec";
import { searchTokens, type Property } from "./properties";
import { phoneticTokens } from "./phonetic";
import type { PortableBlocks } from "../components/PortableBody";
import type { GalleryImage } from "./sanity-image";
import type { Locale } from "./i18n";

/*
  Every read of the listings. Server-only by construction — it imports the Sanity
  client — which is why the shape and the filtering live in ./properties, where the
  client components can reach them without dragging the client along.

  The fallback is an empty list, never sample data. A listing that isn't in Sanity
  isn't for sale, and inventing one to fill the grid is the exact thing this file
  replaced.
*/

type PropertyRow = {
  slug: string;
  title: string;
  priceUsd: number | null;
  beds: number | null;
  /** Read by formatSpec, not rendered directly. */
  baths: number | null;
  areaM2: number | null;
  hoaAmount: number | null;
  hoaUnit: string | null;
  category: string | null;
  image: string | null;
  lqip: string | null;
  area: string | null;
  areaSlug: string | null;
};

export type PropertyImage = GalleryImage;

export type PropertyDetail = {
  slug: string;
  title: string;
  priceUsd: number | null;
  beds: number | null;
  baths: number | null;
  areaM2: number | null;
  spec: string | null;
  category: string | null;
  status: string | null;
  hoaAmount: number | null;
  hoaUnit: string | null;
  walkToBeachMin: number | null;
  location: { lat: number; lng: number } | null;
  body: PortableBlocks | null;
  sourceUrl: string | null;
  images: PropertyImage[] | null;
  area: { name: string; slug: string; beachPoint: { lat: number; lng: number } | null } | null;
};

/** Listings for the search grid, newest asking price first. */
export async function getProperties(language: Locale = "en"): Promise<Property[]> {
  const rows = await sanityFetch<PropertyRow[]>(PROPERTIES_QUERY, {}, [], "properties");

  return rows
    .filter((r) => r.slug && r.priceUsd !== null)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      area: r.area ?? "Dominican Republic",
      areaSlug: r.areaSlug ?? "",
      category: r.category ?? "Property",
      price: formatPrice(r.priceUsd),
      priceUsd: r.priceUsd as number,
      beds: r.beds,
      // Derived, not stored — see lib/spec. The typed field duplicated five
      // structured values and had already drifted from them.
      spec: formatSpec(r, language),
      image: r.image,
      lqip: r.lqip,
    }));
}

/** For generateStaticParams — includes sold and reserved, which keep their pages. */
export async function getPropertySlugs(): Promise<string[]> {
  return sanityFetch<string[]>(PROPERTY_SLUGS_QUERY, {}, [], "property-slugs");
}

/*
  Wrapped in React's cache(): generateMetadata and the page body both need the
  listing, and without this each render fetches the same document from Sanity
  twice. cache() dedupes within a single request — the CDN cache is a separate,
  slower layer that still costs a round trip on a miss.
*/
export const getProperty = cache(
  async (slug: string, language: Locale = "en"): Promise<PropertyDetail | null> => {
    const p = await sanityFetch<PropertyDetail | null>(
      PROPERTY_QUERY,
      { slug, language },
      null,
      "property",
    );
    // Derived here rather than in GROQ: the formatter has to reach the same
    // monthlyHoa guard the rest of the site uses, and that lives in TypeScript.
    return p ? { ...p, spec: formatSpec(p, language) } : null;
  },
);

/* ── The paginated index ──────────────────────────────────────────────────── */

/** Nine fills the 3-column grid exactly at lg — 3 rows of 3, matching the home page. */
export const PAGE_SIZE = 9;

export type PropertyFilters = {
  area: string;
  category: string;
  minBeds: number;
  maxPrice: number;
  q: string;
};

export const NO_FILTERS: PropertyFilters = {
  area: "",
  category: "",
  minBeds: 0,
  maxPrice: 0,
  q: "",
};

export type PropertyPage = {
  items: Property[];
  /** Matches across the whole set, not this page — the count has to survive paging. */
  total: number;
  page: number;
  pageCount: number;
  /** True when these results came from the phonetic retry, not the literal query. */
  fuzzy: boolean;
};

export type PropertyFacets = {
  areas: { name: string; slug: string }[];
  categories: string[];
  maxPrice: number | null;
};

/*
  One page of results, filtered by Sanity rather than by the browser.

  The predicate runs before the slice, which is the reason to do it here at all:
  filtering a page of 12 on the client silently drops every match that happens to
  live on another page, and the result count is then a count of the wrong thing.

  `q` gets its wildcard here rather than at the call site, so no caller can forget
  it and quietly turn prefix search into exact-token search. Empty stays empty —
  "*" alone would match everything and defeat the sentinel.
*/
export async function getPropertiesPage(
  filters: PropertyFilters,
  page: number,
  language: Locale = "en",
): Promise<PropertyPage> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * PAGE_SIZE;

  const run = (tokens: string[], phonetic: string[]) =>
    sanityFetch<{ items: PropertyRow[]; total: number }>(
      PROPERTIES_PAGE_QUERY,
      {
        area: filters.area,
        category: filters.category,
        minBeds: filters.minBeds,
        maxPrice: filters.maxPrice,
        tokens,
        phonetic,
        from,
        to: from + PAGE_SIZE,
      },
      { items: [], total: 0 },
      "properties",
    );

  const tokens = searchTokens(filters.q);
  let result = await run(tokens, []);

  /*
    Second pass only when the first found nothing and there was something to
    find. This is the "did you mean" shape: precise while it works, forgiving
    when it does not, and never both — phonetic codes collapse near-homophones,
    so ORing them in permanently would let "3 bed" return bathrooms.
  */
  let fuzzy = false;
  if (result.total === 0 && tokens.length > 0) {
    const phonetic = phoneticTokens(filters.q);
    if (phonetic.length > 0) {
      const retry = await run([], phonetic);
      if (retry.total > 0) {
        result = retry;
        fuzzy = true;
      }
    }
  }

  const items = result.items
    .filter((r) => r.slug && r.priceUsd !== null)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      area: r.area ?? "Dominican Republic",
      areaSlug: r.areaSlug ?? "",
      category: r.category ?? "Property",
      price: formatPrice(r.priceUsd),
      priceUsd: r.priceUsd as number,
      beds: r.beds,
      // Derived, not stored — see lib/spec. The typed field duplicated five
      // structured values and had already drifted from them.
      spec: formatSpec(r, language),
      image: r.image,
      lqip: r.lqip,
    }));

  return {
    items,
    total: result.total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(result.total / PAGE_SIZE)),
    fuzzy,
  };
}

/** Options for the filter form, counted from what is actually published. */
export const getPropertyFacets = cache(
  async (): Promise<PropertyFacets> =>
    sanityFetch<PropertyFacets>(
      PROPERTY_FACETS_QUERY,
      {},
      { areas: [], categories: [], maxPrice: null },
      "properties",
    ),
);

/*
  How many listings match, without fetching any of them.

  Used to validate a page number before the results stream, because notFound()
  inside a Suspense boundary arrives too late to set a status code.
*/
export async function countProperties(
  filters: PropertyFilters,
  language: Locale = "en",
): Promise<number> {
  return sanityFetch<number>(
    PROPERTIES_COUNT_QUERY,
    {
      area: filters.area,
      category: filters.category,
      minBeds: filters.minBeds,
      maxPrice: filters.maxPrice,
      tokens: searchTokens(filters.q),
      phonetic: [],
    },
    0,
    "properties",
  );
}
