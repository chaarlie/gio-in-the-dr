// Property data + filter logic, shared by the search fields and the results grid so the
// two can never disagree. Replaced by a Sanity query in the CMS build — keep the shape
// (numeric priceUsd and beds, separate from the display strings) when that lands.

export type Property = {
  id: string;
  name: string;
  city: string;
  category: string;
  /** Display string, e.g. "$1.2M". */
  price: string;
  /** Numeric USD asking price — drives the max-price filter. */
  priceUsd: number;
  /**
   * Bedroom count, driving the rooms filter. `null` means not applicable (land) or not
   * yet recorded — those never match an "N+ rooms" filter rather than being counted as 0.
   */
  beds: number | null;
  spec: string;
};

export const PROPERTIES: Property[] = [
  { id: "p1", name: "Sunrise Villa", city: "Cabarete", category: "Villas", price: "$1.2M", priceUsd: 1_200_000, beds: 4, spec: "4 Bed · 5 Bath · Private Pool" },
  { id: "p2", name: "Kite Beach Condo", city: "Cabarete", category: "Beachfront Condos", price: "$395K", priceUsd: 395_000, beds: 2, spec: "2 Bed · Beachfront · 40m to sand" },
  { id: "p3", name: "Sosúa Ocean Villa", city: "Sosúa", category: "Luxury Properties", price: "$680K", priceUsd: 680_000, beds: 3, spec: "3 Bed · Ocean view" },
  // Land — no bedrooms by definition.
  { id: "p4", name: "Cabrera Ocean-View Land", city: "Cabrera", category: "Investment Properties", price: "$290K", priceUsd: 290_000, beds: null, spec: "2,400 m² · Building lot" },
  { id: "p5", name: "Encuentro Pre-Sale Condo", city: "Cabarete", category: "Pre-Construction", price: "$310K", priceUsd: 310_000, beds: 2, spec: "2 Bed · Delivery 2027" },
  // TODO: bedroom count unknown — the sample spec never stated one. Fill in with real data.
  { id: "p6", name: "Sosúa Financed Condo", city: "Sosúa", category: "Owner Financing Opportunities", price: "$225K", priceUsd: 225_000, beds: null, spec: "Owner financing · 30% down" },
];

export const CITIES = ["All", "Cabarete", "Sosúa", "Cabrera", "Puerto Plata"];

export const CATEGORIES = [
  "All",
  "Beachfront Condos",
  "Villas",
  "Investment Properties",
  "Pre-Construction",
  "Luxury Properties",
  "Owner Financing Opportunities",
];

/** Unset sentinel for the rooms and price selects. */
export const ANY = "Any";

const ROOM_STEPS = [1, 2, 3, 4, 5];

/** "Any rooms / 1+ rooms / 2+ rooms …" — a minimum, so it widens rather than excludes. */
export function roomOptions(): SearchOption[] {
  return [
    { value: ANY, label: "Any rooms" },
    ...ROOM_STEPS.map((n) => ({ value: String(n), label: `${n}+ rooms` })),
  ];
}

const PRICE_STEPS = [200_000, 300_000, 400_000, 500_000, 750_000, 1_000_000, 2_000_000];

export type SearchOption = { value: string; label: string };

export function priceOptions(anyLabel: string): SearchOption[] {
  return [
    { value: ANY, label: anyLabel },
    ...PRICE_STEPS.map((amount) => ({
      value: String(amount),
      label: amount >= 1_000_000 ? `$${amount / 1_000_000}M` : `$${amount / 1_000}K`,
    })),
  ];
}

/** Build options for a plain string list, relabelling the "All" sentinel. */
export function listOptions(values: string[], allLabel: string): SearchOption[] {
  return values.map((value) => ({ value, label: value === "All" ? allLabel : value }));
}

const DIACRITICS = /\p{Diacritic}/gu;

/** Fold accents + case so "sosua" matches "Sosúa" — buyers here type without accents. */
export function fold(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

// Built once at module scope. Without it the filter rebuilds a haystack string for every
// property on every keystroke; with a CMS-sized list that's the hot path.
const SEARCH_INDEX = new Map(
  PROPERTIES.map((p) => [p.id, fold(`${p.name} ${p.city} ${p.category} ${p.spec}`)]),
);

export type Filters = {
  q: string;
  city: string;
  category: string;
  /** Minimum bedrooms. Kept a string so it shares the select plumbing. ANY = unset. */
  rooms: string;
  maxPrice: string;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  city: "All",
  category: "All",
  rooms: ANY,
  maxPrice: ANY,
};

function toAmount(value: string): number | null {
  return value === ANY ? null : Number(value);
}

export function filterProperties(filters: Filters): Property[] {
  const query = fold(filters.q.trim());
  const minRooms = toAmount(filters.rooms);
  const max = toAmount(filters.maxPrice);

  return PROPERTIES.filter((p) => {
    if (filters.city !== "All" && p.city !== filters.city) return false;
    if (filters.category !== "All" && p.category !== filters.category) return false;
    // Unknown/not-applicable bed counts drop out of any rooms filter rather than
    // pretending to be zero-bedroom listings.
    if (minRooms !== null && (p.beds === null || p.beds < minRooms)) return false;
    if (max !== null && p.priceUsd > max) return false;
    if (query !== "" && !(SEARCH_INDEX.get(p.id) ?? "").includes(query)) return false;
    return true;
  });
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.q.trim() !== "" ||
    filters.city !== "All" ||
    filters.category !== "All" ||
    filters.rooms !== ANY ||
    filters.maxPrice !== ANY
  );
}

export function countLabel(count: number, filtered: boolean): string {
  const noun = count === 1 ? "property" : "properties";
  if (!filtered) return `${count} ${noun}`;
  return `${count} ${noun} ${count === 1 ? "matches" : "match"} your search`;
}
