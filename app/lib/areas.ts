import { sanityFetch } from "../../sanity/lib/client";
import { polygonRings } from "../../sanity/lib/geojson";
import { AREAS_QUERY } from "../../sanity/lib/queries";
import { AREA_TONES } from "./neighborhoods";
import { formatSpec } from "./spec";
import type { GalleryImage } from "./sanity-image";

/*
  One shape for the area section. Sanity is the only source.

  This used to merge field by field against a committed copy of the
  neighbourhoods — a NEIGHBORHOODS array and hand-traced rings in
  area-shapes.json — so a blank field in the Studio quietly rendered the built-in
  value instead. That made the section impossible to reason about: boundaries
  nobody had drawn still appeared on the map, and editing the document changed
  nothing visible. Both are in Sanity now and the fallback is gone, so what the
  Studio shows is what the site renders — including showing nothing.
*/

export type ListingImage = GalleryImage;

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
  /** The area's beach access, carried down so a listing can measure its own distance. */
  beachPoint: { lat: number; lng: number } | null;
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
  /** Where people in this area reach the sand. Distances measure to here. */
  beachPoint: { lat: number; lng: number } | null;
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
  beachPoint: { lat: number; lng: number } | null;
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
  A geopoint Sanity stores happily but the map cannot plot.

  Sanity's geopoint takes two numbers and does not range-check them, so a
  coordinate typed with the decimal point missing (-70403404) or pasted as
  degrees-minutes-seconds with the separators stripped (194544.7 for 19°45'44.7")
  saves without complaint. Mapbox then throws on the first marker it builds, and
  because that happens during render, one mistyped field in the Studio takes out
  the entire page rather than one pin.

  Dropping the point degrades instead: the listing falls back to its area, or the
  area simply has no pin. The warning names the culprit so it can be found in the
  Studio, since a silently missing pin is its own kind of confusing.
*/
function validPoint(
  point: { lat: number; lng: number } | null | undefined,
  label: string,
): { lat: number; lng: number } | null {
  if (!point) return null;
  const { lat, lng } = point;
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    console.warn(
      `[areas] ${label}: coordinate out of range (lat ${lat}, lng ${lng}) — ignored. ` +
        `Expected decimal degrees, e.g. 19.762417 / -70.488999.`,
    );
    return null;
  }
  return { lat, lng };
}

export async function getAreas(): Promise<Area[]> {
  const rows = await sanityFetch<SanityArea[]>(AREAS_QUERY, {}, [], "areas");

  return rows.map((r) => {
    const tone = r.sortOrder ?? 0;
    return {
      slug: r.slug,
      name: r.name,
      blurb: r.blurb ?? "",
      tone,
      boundary: parseBoundary(r.boundary),
      pin: validPoint(r.pin, `neighbourhood "${r.name}"`),
      beachPoint: validPoint(r.beachPoint, `beach access for "${r.name}"`),
      // Gio's colour wins when set; the validated ramp is the default. The ramp
      // is a scale, not content — see ./neighborhoods.
      color: r.color ?? AREA_TONES[Math.min(tone, AREA_TONES.length - 1)],
      listingCount: r.listingCount ?? 0,
      priceFrom: r.priceFrom ?? null,
      avgPricePerM2: r.avgPricePerM2 ?? null,
      marketPricePerM2: r.marketPricePerM2 ?? null,
      walkToBeach: r.walkToBeach ?? null,
      driveToBeach: r.driveToBeach ?? null,
      hoa: r.hoaNote ?? null,
      activities: r.activities ?? [],
      // Same check on every listing: a bad coordinate here drops that one pin to
      // its area's, rather than throwing while the map builds its markers.
      listings: (r.listings ?? []).map((l) => ({
        ...l,
        // Same derivation as the property pages — one definition of the summary
        // line, so the explorer and the listing page cannot disagree.
        spec: formatSpec(l),
        location: validPoint(l.location, `listing "${l.title}"`),
        beachPoint: validPoint(l.beachPoint, `beach access near "${l.title}"`),
      })),
    };
  });
}

// formatPrice used to live here, but this module imports the Sanity client — see
// ./format for why the client components take it from there instead.
