import Link from "next/link";
import type { PropertyFacets, PropertyFilters as Filters } from "../lib/properties.server";

/*
  The filter bar for /properties.

  A plain GET form, not a client component. Submitting navigates to the same
  route with the filters in the query string, the server re-runs the query and
  renders the matching page — which means it works with JavaScript disabled, the
  result is a real URL you can share or bookmark, and Back returns to the
  previous set of filters without a single line of history handling.

  The trade against the home page's instant client-side search is a round trip
  per change. That is the price of a filter that stays correct once the results
  are paginated: filtering a page of 12 in the browser hides every match sitting
  on another page.
*/

const ANY = "";

function Field({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block bg-card px-5 py-3.5">
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value}
        /* Explicit background and colour: a native select left to the UA renders
           white-on-white in Windows dark mode. */
        className="mt-1.5 w-full appearance-none bg-card text-ink text-[15px] font-semibold cursor-pointer outline-none"
      >
        {children}
      </select>
    </label>
  );
}

/** Round steps up to whatever is actually listed — no option that matches nothing. */
function priceSteps(max: number | null): number[] {
  const ladder = [
    150_000, 200_000, 300_000, 400_000, 500_000, 750_000, 1_000_000, 1_500_000,
    2_000_000, 3_000_000, 5_000_000,
  ];
  if (!max) return [];
  const under = ladder.filter((v) => v < max);
  // Always offer a step that clears the most expensive listing, or the top of
  // the range can never be selected.
  return [...under, ladder.find((v) => v >= max) ?? Math.ceil(max / 100_000) * 100_000];
}

export default function PropertyFiltersBar({
  facets,
  filters,
}: {
  facets: PropertyFacets;
  filters: Filters;
}) {
  const steps = priceSteps(facets.maxPrice);

  return (
    <form
      method="get"
      action="/properties"
      role="search"
      aria-label="Filter properties"
      className="bg-card border border-line rounded-3xl overflow-hidden"
    >
      {/*
        Submitting resets to page one. Without this the old page number rides
        along and a narrower filter lands on an empty page 4.
      */}
      <input type="hidden" name="page" value="1" />

      <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-muted shrink-0">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Beachfront, penthouse, Kite Beach…"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent py-1.5 text-base text-ink outline-none placeholder:text-muted min-w-0"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
        <Field label="Location" name="area" value={filters.area}>
          <option value={ANY}>All areas</option>
          {facets.areas.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.name}
            </option>
          ))}
        </Field>

        <Field label="Property type" name="category" value={filters.category}>
          <option value={ANY}>All types</option>
          {facets.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Field>

        <Field label="Bedrooms" name="minBeds" value={String(filters.minBeds || "")}>
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </Field>

        <Field label="Max price" name="maxPrice" value={String(filters.maxPrice || "")}>
          <option value="">No maximum</option>
          {steps.map((v) => (
            <option key={v} value={v}>
              {v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${v / 1_000}K`}
            </option>
          ))}
        </Field>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <Link
          href="/properties"
          className="text-sm font-semibold text-muted hover:text-ink transition-colors no-underline"
        >
          Clear
        </Link>
        <button
          type="submit"
          className="bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-3 rounded-full transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
