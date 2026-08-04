"use client";

import { startTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { waLink } from "../lib/whatsapp";
import SectionHeading from "./SectionHeading";
import Badge from "./Badge";
import PropertySearch, { type SearchOption } from "./PropertySearch";

type Property = {
  id: string;
  name: string;
  city: string;
  category: string;
  price: string;
  /** Numeric USD asking price — drives the min/max price filters. `price` stays the display string. */
  priceUsd: number;
  spec: string;
};

// Static sample data — replaced by a Sanity query in the CMS build.
const PROPERTIES: Property[] = [
  { id: "p1", name: "Sunrise Villa", city: "Cabarete", category: "Villas", price: "$1.2M", priceUsd: 1_200_000, spec: "4 Bed · 5 Bath · Private Pool" },
  { id: "p2", name: "Kite Beach Condo", city: "Cabarete", category: "Beachfront Condos", price: "$395K", priceUsd: 395_000, spec: "2 Bed · Beachfront · 40m to sand" },
  { id: "p3", name: "Sosúa Ocean Villa", city: "Sosúa", category: "Luxury Properties", price: "$680K", priceUsd: 680_000, spec: "3 Bed · Ocean view" },
  { id: "p4", name: "Cabrera Ocean-View Land", city: "Cabrera", category: "Investment Properties", price: "$290K", priceUsd: 290_000, spec: "2,400 m² · Building lot" },
  { id: "p5", name: "Encuentro Pre-Sale Condo", city: "Cabarete", category: "Pre-Construction", price: "$310K", priceUsd: 310_000, spec: "2 Bed · Delivery 2027" },
  { id: "p6", name: "Sosúa Financed Condo", city: "Sosúa", category: "Owner Financing Opportunities", price: "$225K", priceUsd: 225_000, spec: "Owner financing · 30% down" },
];

const CITIES = ["All", "Cabarete", "Sosúa", "Cabrera", "Puerto Plata"];
const CATEGORIES = [
  "All",
  "Beachfront Condos",
  "Villas",
  "Investment Properties",
  "Pre-Construction",
  "Luxury Properties",
  "Owner Financing Opportunities",
];

// Price steps for the min/max selects. "Any" is the unset sentinel; values are USD.
const PRICE_STEPS = [200_000, 300_000, 400_000, 500_000, 750_000, 1_000_000, 2_000_000];
const ANY = "Any";

function priceOptions(anyLabel: string): SearchOption[] {
  return [
    { value: ANY, label: anyLabel },
    ...PRICE_STEPS.map((amount) => ({
      value: String(amount),
      label: amount >= 1_000_000 ? `$${amount / 1_000_000}M` : `$${amount / 1_000}K`,
    })),
  ];
}

/** Turn a select value into a number, or null when left at "Any". */
function toAmount(value: string): number | null {
  return value === ANY ? null : Number(value);
}

/** Build options for a plain string list, relabelling the "All" sentinel. */
function listOptions(values: string[], allLabel: string): SearchOption[] {
  return values.map((value) => ({
    value,
    label: value === "All" ? allLabel : value,
  }));
}

const DIACRITICS = /\p{Diacritic}/gu;

/** Fold accents + case so "sosua" matches "Sosúa" — buyers here type without accents. */
function fold(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

// Built once at module scope. Without it the filter rebuilds a haystack string for every
// property on every keystroke; with a CMS-sized list that's the hot path.
const SEARCH_INDEX = new Map(
  PROPERTIES.map((p) => [p.id, fold(`${p.name} ${p.city} ${p.category} ${p.spec}`)]),
);

// Hoisted: identical for every card, and the grid re-renders on every filter change.
// No React Compiler in this project, so static JSX isn't hoisted automatically.
const CARD_GLYPH = (
  <div className="absolute inset-0 flex items-center justify-center text-cream/10">
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5 12 4l8 5.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function Properties() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Seed filters from the URL once (?q=&city=&category=) so shared links land pre-filtered;
  // after that, local state is the source of truth and we push changes back to the URL.
  const [city, setCity] = useState(() => searchParams.get("city") ?? "All");
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "All");
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("min") ?? ANY);
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("max") ?? ANY);

  // Push the current filters back to the URL (shareable / SEO-friendly) without scrolling.
  function syncUrl(next: {
    q?: string;
    city?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }) {
    const state = { q, city, category, minPrice, maxPrice, ...next };
    const params = new URLSearchParams();
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.city !== "All") params.set("city", state.city);
    if (state.category !== "All") params.set("category", state.category);
    if (state.minPrice !== ANY) params.set("min", state.minPrice);
    if (state.maxPrice !== ANY) params.set("max", state.maxPrice);
    const query = params.toString();
    // Non-urgent: the filter state has already updated the grid. Keeping the navigation
    // out of the urgent lane stops a router.replace per keystroke from blocking typing.
    startTransition(() => {
      router.replace(`/${query ? `?${query}` : ""}#properties`, { scroll: false });
    });
  }

  const query = fold(q.trim());
  const min = toAmount(minPrice);
  const max = toAmount(maxPrice);
  const filtered = PROPERTIES.filter((p) => {
    const matchesCity = city === "All" || p.city === city;
    const matchesCategory = category === "All" || p.category === category;
    const matchesQuery = query === "" || (SEARCH_INDEX.get(p.id) ?? "").includes(query);
    const matchesPrice =
      (min === null || p.priceUsd >= min) && (max === null || p.priceUsd <= max);
    return matchesCity && matchesCategory && matchesQuery && matchesPrice;
  });

  const hasFilters =
    city !== "All" ||
    category !== "All" ||
    q.trim() !== "" ||
    minPrice !== ANY ||
    maxPrice !== ANY;

  function reset() {
    setCity("All");
    setCategory("All");
    setQ("");
    setMinPrice(ANY);
    setMaxPrice(ANY);
    router.replace("/#properties", { scroll: false });
  }

  // The grid filters live, so Search is an affordance: it jumps you to the results.
  function scrollToResults() {
    const target = document.getElementById("property-results");
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <section id="properties" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4">
      <SectionHeading align="center" title="Find your property" className="mb-8">
        <p className="text-muted mt-3">
          Search beachfront condos, villas, investment and pre-construction across the north coast.
        </p>
      </SectionHeading>

      <PropertySearch
        query={q}
        onQueryChange={(value) => {
          setQ(value);
          syncUrl({ q: value });
        }}
        fields={[
          {
            label: "Location",
            value: city,
            options: listOptions(CITIES, "Any location"),
            onChange: (value) => {
              setCity(value);
              syncUrl({ city: value });
            },
          },
          {
            label: "Property type",
            value: category,
            options: listOptions(CATEGORIES, "Any type"),
            onChange: (value) => {
              setCategory(value);
              syncUrl({ category: value });
            },
          },
          {
            label: "Min price",
            value: minPrice,
            options: priceOptions("No minimum"),
            onChange: (value) => {
              setMinPrice(value);
              syncUrl({ minPrice: value });
            },
          },
          {
            label: "Max price",
            value: maxPrice,
            options: priceOptions("No maximum"),
            onChange: (value) => {
              setMaxPrice(value);
              syncUrl({ maxPrice: value });
            },
          },
        ]}
        resultLabel={`${filtered.length} ${filtered.length === 1 ? "property" : "properties"}${
          hasFilters ? (filtered.length === 1 ? " matches your search" : " match your search") : ""
        }`}
        hasFilters={hasFilters}
        onReset={reset}
        onSubmit={scrollToResults}
      />

      <div id="property-results" className="scroll-mt-28 mt-6" />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <p>No properties match your search.</p>
          <button
            onClick={reset}
            className="mt-4 border border-line rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <a
              key={p.id}
              href={waLink(`Hi Gio, I'm interested in ${p.name} in ${p.city}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl overflow-hidden aspect-[5/6] bg-accent no-underline flex flex-col justify-end p-5"
            >
              {CARD_GLYPH}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                <Badge variant="glass">{p.category}</Badge>
                <Badge variant="solid">{p.price}</Badge>
              </div>
              <div className="relative text-cream">
                <div className="font-display text-xl font-semibold leading-snug">{p.name}</div>
                <div className="text-cream/80 text-sm mt-1">{p.city}, Dominican Republic</div>
                <div className="text-cream/60 text-xs mt-2 pt-2.5 border-t border-cream/20">
                  {p.spec}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
