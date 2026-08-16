// Sized image URLs straight from Sanity's CDN.
//
// The originals are what came off a camera — the one photo in the dataset is
// 6000×4500 and 4 MB. Next's optimizer can resize it, but it has to fetch the
// whole 4 MB and re-encode before the first byte reaches the browser, and on
// Vercel each variant burns a transformation. Sanity's CDN does the same resize
// at the edge, pre-cached: 190 KB at 1024px, served immediately.
//
// Pure and client-safe — it only rewrites a URL we already have, so there's no
// builder to configure and no project ID to thread through.

/*
  One photo, in the shape every gallery surface needs.

  Listings (through AREAS_QUERY) and property pages (through PROPERTY_QUERY)
  project the same fields, and both feed the same carousel and lightbox — so the
  type lives here rather than being declared twice and drifting. It already had:
  PropertyImage was missing `alt` even though the query selected it, so the
  property page could only ever render empty alt text.
*/
export type GalleryImage = {
  /** Sanity's array-member key — unique even when the same asset repeats. */
  key: string | null;
  url: string | null;
  lqip: string | null;
  aspectRatio: number | null;
  alt: string | null;
};

/** Widths the lightbox offers. Covers phones through a 2x desktop display. */
export const LIGHTBOX_WIDTHS = [1024, 1600, 2400];

/**
 * Add Sanity's transform params to an asset URL.
 * `auto=format` negotiates WebP/AVIF; `fit=max` never upscales past the original.
 */
export function sizedImage(url: string, width: number, quality = 80): string {
  // Any existing query string means someone already shaped this URL — leave it be.
  if (url.includes("?")) return url;
  return `${url}?w=${width}&q=${quality}&auto=format&fit=max`;
}

/** srcSet across LIGHTBOX_WIDTHS, so the browser picks for the viewport it has. */
export function sizedSrcSet(url: string, quality = 80): string {
  return LIGHTBOX_WIDTHS.map((w) => `${sizedImage(url, w, quality)} ${w}w`).join(", ");
}

/*
  A next/image loader, for the places worth keeping next/image: it still handles
  the blur placeholder, the fill layout and srcSet generation, but the bytes come
  from Sanity's CDN instead of the Next optimizer. Same pictures, no 4 MB fetch
  and re-encode on the way, and no Vercel transformation spent per variant.
*/
export function sanityLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return sizedImage(src, width, quality ?? 80);
}
