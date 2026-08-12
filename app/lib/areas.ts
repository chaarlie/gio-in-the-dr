import { sanityFetch } from "../../sanity/lib/client";
import { AREAS_QUERY } from "../../sanity/lib/queries";
import SHAPES from "./area-shapes.json";
import { AREA_TONES, NEIGHBORHOODS } from "./neighborhoods";

/*
  One shape for the area section, whether the data came from Sanity or the static
  fallback. Sanity wins field by field — so a neighbourhood Gio has filled in
  shows her numbers while the rest still render, rather than the section flipping
  wholesale between two sources.
*/

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
  image: string | null;
};

export type Area = {
  slug: string;
  name: string;
  blurb: string;
  tone: number;
  /** GeoJSON ring, from Sanity's boundary when drawn, else the built-in shape. */
  boundary: number[][][] | null;
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

/** Accepts a bare Polygon, or a Feature/FeatureCollection wrapping one. */
function parseBoundary(raw: string | null): number[][][] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const geom =
      parsed.type === "FeatureCollection"
        ? parsed.features?.[0]?.geometry
        : parsed.type === "Feature"
          ? parsed.geometry
          : parsed;
    if (geom?.type === "Polygon") return geom.coordinates;
    if (geom?.type === "MultiPolygon") return geom.coordinates[0];
    return null;
  } catch {
    return null;
  }
}

/** The committed fallback — used until a neighbourhood exists in Sanity. */
function staticAreas(): Area[] {
  return NEIGHBORHOODS.map((n) => ({
    slug: n.slug,
    name: n.name,
    blurb: n.blurb,
    tone: n.tone,
    boundary: (SHAPES as Record<string, number[][][]>)[n.slug] ?? null,
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
