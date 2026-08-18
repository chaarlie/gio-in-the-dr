"use client";

import {
  createContext,
  startTransition,
  use,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ALL,
  ANY,
  EMPTY_FILTERS,
  countLabel,
  facetOptions,
  filterProperties,
  hasActiveFilters,
  priceOptions,
  roomOptions,
  type Filters,
  type Property,
  type SearchOption,
} from "../lib/properties";

/*
  Filter state for the property search, lifted out of the section that renders it so the
  fields, the result count and the grid can each read it without prop-threading.

  Mounted on the home page, which fetches the listings from Sanity on the server and hands
  them down — the only page that renders the search. Its children stay server components:
  they're passed through as `children`, which the RSC payload renders on the server even
  though this provider is a client component.
*/

type SearchField = { key: keyof Filters; label: string; options: SearchOption[] };

type PropertySearchValue = {
  state: {
    filters: Filters;
    /** Everything Sanity returned, before filtering — an empty grid needs to know why. */
    all: Property[];
    /** Every match, across all pages — the count and the pager both need the whole set. */
    results: Property[];
    /** Just the current page of `results`, which is what the grid renders. */
    pageItems: Property[];
    page: number;
    pageCount: number;
    fields: SearchField[];
    hasFilters: boolean;
    resultLabel: string;
  };
  actions: {
    setFilter: (key: keyof Filters, value: string) => void;
    setPage: (page: number) => void;
    reset: () => void;
  };
};

/** Nine fills the 3-column grid exactly at lg, and 3 rows of 3 reads as a set. */
const HOME_PAGE_SIZE = 9;

const PropertySearchContext = createContext<PropertySearchValue | null>(null);

export function usePropertySearch(): PropertySearchValue {
  const value = use(PropertySearchContext);
  if (!value) {
    throw new Error("usePropertySearch must be used inside <PropertySearchProvider>");
  }
  return value;
}

export default function PropertySearchProvider({
  properties,
  children,
}: {
  properties: Property[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPageState] = useState(1);

  /*
    Location and Property type are built from the listings, so the option lists can't
    offer a value that matches nothing. Memoised on `properties`, which is a stable
    reference for the life of the page: the fields re-render on every keystroke, and
    rebuilding four option arrays each time is exactly what the hoisted const this
    replaced was avoiding.
  */
  const fields = useMemo<SearchField[]>(() => {
    const facets = facetOptions(properties);
    return [
      { key: "area", label: "Location", options: facets.area },
      { key: "category", label: "Property type", options: facets.category },
      { key: "rooms", label: "Bedrooms", options: roomOptions() },
      { key: "maxPrice", label: "Max price", options: priceOptions(properties, "No maximum") },
    ];
  }, [properties]);

  /*
    Subscribe to the URL — deliberately not with useSearchParams().

    Reading search params during render forces Next's static-generation bailout: every
    client component under the boundary is dropped from the prerendered HTML. That took
    the whole Properties grid — all six listings — out of index.html, which is exactly
    the content that needs to be crawlable on a real-estate site. Doing it here instead,
    the page prerenders complete and unfiltered, then a shared ?q=… link applies on
    hydration. No mismatch, because this runs after it.

    Listening for popstate also makes Back and Forward restore the previous filters,
    which the render-time version never did.
  */
  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const next: Filters = {
        q: params.get("q") ?? EMPTY_FILTERS.q,
        area: params.get("area") ?? EMPTY_FILTERS.area,
        category: params.get("category") ?? EMPTY_FILTERS.category,
        rooms: params.get("rooms") ?? EMPTY_FILTERS.rooms,
        maxPrice: params.get("max") ?? EMPTY_FILTERS.maxPrice,
      };
      // Bail when nothing changed so this can't cascade renders.
      setFilters((prev) =>
        (Object.keys(next) as (keyof Filters)[]).every((k) => prev[k] === next[k])
          ? prev
          : next,
      );
      // The page rides in the URL too, so a shared ?page=2 link opens on page 2
      // and Back restores the page you came from rather than the first one.
      const fromUrl = Number.parseInt(params.get("page") ?? "1", 10);
      setPageState(Number.isFinite(fromUrl) && fromUrl > 0 ? fromUrl : 1);
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  /*
    `replace` for filters, `push` for pages.

    Typing is not navigation: a history entry per keystroke would make Back walk
    letter by letter out of a search, which is why the filters have always
    replaced. Changing page is navigation — someone who pages forward and hits
    Back means "the previous page of results", and replace would take them off
    the site instead.
  */
  function syncUrl(next: Filters, nextPage = 1, mode: "replace" | "push" = "replace") {
    const params = new URLSearchParams();
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.area !== ALL) params.set("area", next.area);
    if (next.category !== ALL) params.set("category", next.category);
    if (next.rooms !== ANY) params.set("rooms", next.rooms);
    if (next.maxPrice !== ANY) params.set("max", next.maxPrice);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    // Stay on the current path rather than hardcoding "/", so this can't bounce anyone
    // off the page they're on. Non-urgent: the results already updated, and keeping the
    // navigation out of the urgent lane stops a router.replace per keystroke from
    // blocking typing.
    const href = `${pathname}${query ? `?${query}` : ""}`;
    startTransition(() => {
      if (mode === "push") router.push(href, { scroll: false });
      else router.replace(href, { scroll: false });
    });
  }

  function setFilter(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    // Back to page one whenever the set changes, or narrowing a filter strands
    // you on a page that no longer exists.
    setPageState(1);
    syncUrl(next, 1);
  }

  function setPage(next: number) {
    setPageState(next);
    syncUrl(filters, next, "push");
  }

  function reset() {
    setFilters(EMPTY_FILTERS);
    setPageState(1);
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  // Derived during render — no effects, no state drift.
  const results = filterProperties(properties, filters);
  const hasFilters = hasActiveFilters(filters);

  /*
    Paginated in the browser, not on the server, and that is safe here for the
    one reason it is not safe on /properties: the filter runs over the whole set
    too. Both halves see all the listings, so a match can never hide on a page
    the filter did not look at.

    Clamped rather than trusted — a stale ?page=9 from a wider filter should show
    the last page, not an empty grid.
  */
  const pageCount = Math.max(1, Math.ceil(results.length / HOME_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pageItems = results.slice((safePage - 1) * HOME_PAGE_SIZE, safePage * HOME_PAGE_SIZE);

  return (
    <PropertySearchContext
      value={{
        state: {
          filters,
          all: properties,
          results,
          pageItems,
          page: safePage,
          pageCount,
          fields,
          hasFilters,
          resultLabel: countLabel(results.length, hasFilters),
        },
        actions: {
          setFilter,
          setPage,
          reset,
        },
      }}
    >
      {children}
    </PropertySearchContext>
  );
}
