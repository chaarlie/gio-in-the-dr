// Property shape + filter logic, shared by the search fields and the results grid so the
// two can never disagree. Deliberately pure — no Sanity import: the provider, the fields
// and the card are all client components, and pulling the client in here would ship it to
// the browser. The fetch lives in ./properties.server.

export type Property = {
  /** Sanity slug — the React key and the /properties/<slug> address. */
  slug: string;
  title: string;
  /** Neighbourhood name. The schema has no city: every area is a Cabarete micro-area. */
  area: string;
  areaSlug: string;
  category: string;
  /** Display string, e.g. "$1.2M". Null when the price is missing. */
  price: string | null;
  /** Numeric USD asking price — drives the max-price filter. */
  priceUsd: number;
  /**
   * Bedroom count, driving the bedrooms filter. `null` means not applicable (land) or
   * not yet recorded — those never match an "N+ bedrooms" filter rather than reading as 0.
   */
  beds: number | null;
  spec: string | null;
  image: string | null;
  lqip: string | null;
};

/** Unset sentinel for the rooms and price selects. */
export const ANY = "Any";

/** Unset sentinel for the list selects. */
export const ALL = "All";

const ROOM_STEPS = [1, 2, 3, 4, 5];

/** "Any bedrooms / 1+ bedrooms / …" — a minimum, so it widens rather than excludes. */
export function roomOptions(): SearchOption[] {
  return [
    { value: ANY, label: "Any bedrooms" },
    ...ROOM_STEPS.map((n) => ({ value: String(n), label: `${n}+ ${n === 1 ? "bedroom" : "bedrooms"}` })),
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
  return values.map((value) => ({ value, label: value === ALL ? allLabel : value }));
}

/*
  Location and Property type come from the listings themselves rather than a hardcoded
  list. Two reasons: the neighbourhoods live in Sanity and Gio can add one without a
  deploy, and a select that offers "Sosúa" when nothing in Sosúa is for sale sends every
  buyer who picks it straight to an empty grid.
*/
export function facetOptions(properties: Property[]): {
  area: SearchOption[];
  category: SearchOption[];
} {
  const unique = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) =>
      a.localeCompare(b),
    );

  return {
    area: listOptions([ALL, ...unique(properties.map((p) => p.area))], "Any location"),
    category: listOptions([ALL, ...unique(properties.map((p) => p.category))], "Any type"),
  };
}

const DIACRITICS = /\p{Diacritic}/gu;

/** Fold accents + case so "sosua" matches "Sosúa" — buyers here type without accents. */
export function fold(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

/*
  Search haystacks, built once per listing set rather than per keystroke — without this
  the filter rebuilds a folded string for every property on every character typed.

  Keyed on the array itself: the listings arrive once from the server and keep that
  identity for the life of the page, so the cache is hit on every subsequent render, and
  a WeakMap lets the whole index fall away with the array instead of leaking.
*/
const INDEX_CACHE = new WeakMap<Property[], Map<string, string>>();

function searchIndex(properties: Property[]): Map<string, string> {
  const cached = INDEX_CACHE.get(properties);
  if (cached) return cached;
  const index = new Map(
    properties.map((p) => [
      p.slug,
      fold(`${p.title} ${p.area} ${p.category} ${p.spec ?? ""}`),
    ]),
  );
  INDEX_CACHE.set(properties, index);
  return index;
}

export type Filters = {
  q: string;
  /** Neighbourhood name, labelled "Location" in the UI. ALL = unset. */
  area: string;
  category: string;
  /** Minimum bedrooms. Kept a string so it shares the select plumbing. ANY = unset. */
  rooms: string;
  maxPrice: string;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  area: ALL,
  category: ALL,
  rooms: ANY,
  maxPrice: ANY,
};

function toAmount(value: string): number | null {
  return value === ANY ? null : Number(value);
}

export function filterProperties(properties: Property[], filters: Filters): Property[] {
  const query = fold(filters.q.trim());
  const minRooms = toAmount(filters.rooms);
  const max = toAmount(filters.maxPrice);
  const index = query === "" ? null : searchIndex(properties);

  return properties.filter((p) => {
    if (filters.area !== ALL && p.area !== filters.area) return false;
    if (filters.category !== ALL && p.category !== filters.category) return false;
    // Unknown/not-applicable bed counts drop out of any rooms filter rather than
    // pretending to be zero-bedroom listings.
    if (minRooms !== null && (p.beds === null || p.beds < minRooms)) return false;
    if (max !== null && p.priceUsd > max) return false;
    if (index && !(index.get(p.slug) ?? "").includes(query)) return false;
    return true;
  });
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.q.trim() !== "" ||
    filters.area !== ALL ||
    filters.category !== ALL ||
    filters.rooms !== ANY ||
    filters.maxPrice !== ANY
  );
}

export function countLabel(count: number, filtered: boolean): string {
  const noun = count === 1 ? "property" : "properties";
  if (!filtered) return `${count} ${noun}`;
  return `${count} ${noun} ${count === 1 ? "matches" : "match"} your search`;
}

/*
  HOA quoted two ways in the real listings — Coccoloba at $2.09/m²/month, Seawinds at a
  flat $433/month — so the unit has to be resolved before the two can be compared. Returns
  the monthly dollar figure, or null when there's nothing to compute from.
*/
export function monthlyHoa(
  amount: number | null,
  unit: string | null,
  areaM2: number | null,
): number | null {
  if (amount === null) return null;
  if (unit === "per-m2-month") {
    return areaM2 ? Math.round(amount * areaM2) : null;
  }
  return Math.round(amount);
}
