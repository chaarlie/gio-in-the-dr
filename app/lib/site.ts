/*
  The site's own origin, in one place.

  Every absolute URL the site emits — canonicals, hreflang, og:image, the
  sitemap — resolves against this. It was inlined in the root layout, which was
  fine while the layout was the only thing that needed it; the sitemap needs the
  same value, and two copies of an origin is how a sitemap ends up advertising a
  different host than the canonicals do.

  The localhost default is a development convenience and nothing else. Set
  NEXT_PUBLIC_SITE_URL on the deploy: unset, every canonical and every og:image
  on the live site points at localhost, which is worse than emitting nothing.
*/
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** SITE_URL + a locale-prefixed path, for the places that need it absolute. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
