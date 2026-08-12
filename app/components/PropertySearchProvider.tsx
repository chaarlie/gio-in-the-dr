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
    results: Property[];
    fields: SearchField[];
    hasFilters: boolean;
    resultLabel: string;
  };
  actions: {
    setFilter: (key: keyof Filters, value: string) => void;
    reset: () => void;
  };
};

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
      { key: "maxPrice", label: "Max price", options: priceOptions("No maximum") },
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
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  function syncUrl(next: Filters) {
    const params = new URLSearchParams();
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.area !== ALL) params.set("area", next.area);
    if (next.category !== ALL) params.set("category", next.category);
    if (next.rooms !== ANY) params.set("rooms", next.rooms);
    if (next.maxPrice !== ANY) params.set("max", next.maxPrice);
    const query = params.toString();
    // Stay on the current path rather than hardcoding "/", so this can't bounce anyone
    // off the page they're on. Non-urgent: the results already updated, and keeping the
    // navigation out of the urgent lane stops a router.replace per keystroke from
    // blocking typing.
    startTransition(() => {
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    });
  }

  function setFilter(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    syncUrl(next);
  }

  function reset() {
    setFilters(EMPTY_FILTERS);
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  // Derived during render — no effects, no state drift.
  const results = filterProperties(properties, filters);
  const hasFilters = hasActiveFilters(filters);

  return (
    <PropertySearchContext
      value={{
        state: {
          filters,
          all: properties,
          results,
          fields,
          hasFilters,
          resultLabel: countLabel(results.length, hasFilters),
        },
        actions: {
          setFilter,
          reset,
        },
      }}
    >
      {children}
    </PropertySearchContext>
  );
}
