import { sanityFetch } from "../../sanity/lib/client";
import { polygonRings } from "../../sanity/lib/geojson";
import { AREAS_QUERY } from "../../sanity/lib/queries";
import SHAPES from "./area-shapes.json";
import { AREA_TONES, NEIGHBORHOODS } from "./neighborhoods";

/*
  One shape for the area section, whether the data came from Sanity or the static
  fallback. Sanity wins field by field — so a neighbourhood Gio has filled in
  shows her numbers while the rest still render, rather than the section flipping
  wholesale between two sources.
*/

export type ListingImage = {
  url: string | null;
  lqip: string | null;
  aspectRatio: number | null;
};

export type AreaListing = {
  slug: string | null;
  title: string;
  priceUsd: number | null;
  beds: number | null;
  baths: number | null;
  areaM2: number | null;
  spec: string | null;
  category: string | null;
  location: { lat: number; lng: number } | null;
  sourceUrl: string | null;
  hoaAmount: number | null;
  hoaUnit: string | null;
  walkToBeachMin: number | null;
  images: ListingImage[] | null;
};

export type Area = {
  slug: string;
  name: string;
  blurb: string;
  tone: number;
  /** GeoJSON ring, from Sanity's boundary when drawn, else the built-in shape. */
  boundary: number[][][] | null;
  /*
    Roughly the centre of the area. Doubles as the map position for a listing
    that has no coordinate of its own — better an approximate pin in the right
    neighbourhood than a house that silently isn't on the map at all.
  */
  pin: { lat: number; lng: number } | null;
  color: string;
  listingCount: number;
  priceFrom: number | null;
  avgPricePerM2: number | null;
  marketPricePerM2: number | null;
  walkToBeach: string | null;
  driveToBeach: string | null;
  hoa: string | null;
  activities: string[];
  listings: AreaListing[];
};

type SanityArea = {
  slug: string;
  name: string;
  blurb: string | null;
  sortOrder: number | null;
  color: string | null;
  boundary: string | null;
  pin: { lat: number; lng: number } | null;
  marketPricePerM2: number | null;
  walkToBeach: string | null;
  driveToBeach: string | null;
  hoaNote: string | null;
  activities: string[] | null;
  listingCount: number | null;
  priceFrom: number | null;
  avgPricePerM2: number | null;
  listings: AreaListing[] | null;
};

/** Accepts a bare Polygon, or a Feature/FeatureCollection containing one. */
function parseBoundary(raw: string | null): number[][][] | null {
  if (!raw) return null;
  try {
    return polygonRings(JSON.parse(raw));
  } catch {
    return null;
  }
}

/*
  Centroid of a ring, so the static fallback has a pin too. Area-weighted
  (the shoelace formula), not an average of the vertices: the shapes are traced
  by hand and their points bunch up along the coast, which drags a plain mean
  off toward whichever edge was clicked most.
*/
function ringCentre(boundary: number[][][] | undefined): { lat: number; lng: number } | null {
  const ring = boundary?.[0];
  if (!ring || ring.length < 3) return null;
  let twiceArea = 0;
  let lng = 0;
  let lat = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    twiceArea += cross;
    lng += (x0 + x1) * cross;
    lat += (y0 + y1) * cross;
  }
  // Degenerate ring (zero area) — fall back to the first point rather than
  // dividing by zero and pinning the area at NaN, which mapbox renders nowhere.
  if (twiceArea === 0) return { lng: ring[0][0], lat: ring[0][1] };
  return { lng: lng / (3 * twiceArea), lat: lat / (3 * twiceArea) };
}

/** The committed fallback — used until a neighbourhood exists in Sanity. */
function staticAreas(): Area[] {
  return NEIGHBORHOODS.map((n) => ({
    slug: n.slug,
    name: n.name,
    blurb: n.blurb,
    tone: n.tone,
    boundary: (SHAPES as Record<string, number[][][]>)[n.slug] ?? null,
    // No pin in the committed data; the ring's centre is the same idea.
    pin: ringCentre((SHAPES as Record<string, number[][][]>)[n.slug]),
    color: AREA_TONES[n.tone],
    listingCount: 0,
    priceFrom: null,
    avgPricePerM2: null,
    marketPricePerM2: null,
    walkToBeach: n.walkToBeach,
    driveToBeach: n.driveToBeach,
    hoa: n.hoa,
    activities: n.activities,
    listings: [],
  }));
}

export async function getAreas(): Promise<Area[]> {
  const fallback = staticAreas();
  const rows = await sanityFetch<SanityArea[]>(AREAS_QUERY, {}, [], "areas");
  if (!rows.length) return fallback;

  const builtIn = new Map(fallback.map((a) => [a.slug, a]));

  return rows.map((r) => {
    const base = builtIn.get(r.slug);
    const tone = r.sortOrder ?? base?.tone ?? 0;
    return {
      slug: r.slug,
      name: r.name,
      blurb: r.blurb ?? base?.blurb ?? "",
      tone,
      boundary: parseBoundary(r.boundary) ?? base?.boundary ?? null,
      pin: r.pin ?? base?.pin ?? null,
      // Gio's colour wins when set; the validated ramp is the default.
      color: r.color ?? AREA_TONES[Math.min(tone, AREA_TONES.length - 1)],
      listingCount: r.listingCount ?? 0,
      priceFrom: r.priceFrom ?? null,
      avgPricePerM2: r.avgPricePerM2 ?? null,
      marketPricePerM2: r.marketPricePerM2 ?? null,
      walkToBeach: r.walkToBeach ?? base?.walkToBeach ?? null,
      driveToBeach: r.driveToBeach ?? base?.driveToBeach ?? null,
      hoa: r.hoaNote ?? base?.hoa ?? null,
      activities: r.activities?.length ? r.activities : (base?.activities ?? []),
      listings: r.listings ?? [],
    };
  });
}

// formatPrice used to live here, but this module imports the Sanity client — see
// ./format for why the client components take it from there instead.
