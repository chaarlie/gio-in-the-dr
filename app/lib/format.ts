// Display formatting, kept in its own module because client components need it.
// Importing it from areas.ts pulled the Sanity client — which calls createClient()
// at module scope — into the browser bundle for the sake of one pure function.

/** "$1.2M" / "$395K" — the display string, derived rather than stored. */
export function formatPrice(usd: number | null): string | null {
  if (usd === null || Number.isNaN(usd)) return null;
  if (usd >= 1_000_000) {
    const m = usd / 1_000_000;
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  return `$${Math.round(usd / 1000)}K`;
}

/** "$590,000" — the exact figure, for detail pages where rounding would be wrong. */
export function formatExactPrice(usd: number | null): string | null {
  if (usd === null || Number.isNaN(usd)) return null;
  return `$${usd.toLocaleString("en-US")}`;
}
