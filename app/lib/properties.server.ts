import { cache } from "react";
import { sanityFetch } from "../../sanity/lib/client";
import {
  PROPERTIES_QUERY,
  PROPERTY_QUERY,
  PROPERTY_SLUGS_QUERY,
} from "../../sanity/lib/queries";
import { formatPrice } from "./format";
import type { Property } from "./properties";
import type { PortableBlocks } from "../components/PortableBody";
import type { GalleryImage } from "./sanity-image";

/*
  Every read of the listings. Server-only by construction — it imports the Sanity
  client — which is why the shape and the filtering live in ./properties, where the
  client components can reach them without dragging the client along.

  The fallback is an empty list, never sample data. A listing that isn't in Sanity
  isn't for sale, and inventing one to fill the grid is the exact thing this file
  replaced.
*/

type PropertyRow = {
  slug: string;
  title: string;
  priceUsd: number | null;
  beds: number | null;
  spec: string | null;
  category: string | null;
  image: string | null;
  lqip: string | null;
  area: string | null;
  areaSlug: string | null;
};

export type PropertyImage = GalleryImage;

export type PropertyDetail = {
  slug: string;
  title: string;
  priceUsd: number | null;
  beds: number | null;
  baths: number | null;
  areaM2: number | null;
  spec: string | null;
  category: string | null;
  status: string | null;
  hoaAmount: number | null;
  hoaUnit: string | null;
  walkToBeachMin: number | null;
  location: { lat: number; lng: number } | null;
  body: PortableBlocks | null;
  sourceUrl: string | null;
  images: PropertyImage[] | null;
  area: { name: string; slug: string } | null;
};

/** Listings for the search grid, newest asking price first. */
export async function getProperties(): Promise<Property[]> {
  const rows = await sanityFetch<PropertyRow[]>(PROPERTIES_QUERY, {}, [], "properties");

  return rows
    .filter((r) => r.slug && r.priceUsd !== null)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      area: r.area ?? "Dominican Republic",
      areaSlug: r.areaSlug ?? "",
      category: r.category ?? "Property",
      price: formatPrice(r.priceUsd),
      priceUsd: r.priceUsd as number,
      beds: r.beds,
      spec: r.spec,
      image: r.image,
      lqip: r.lqip,
    }));
}

/** For generateStaticParams — includes sold and reserved, which keep their pages. */
export async function getPropertySlugs(): Promise<string[]> {
  return sanityFetch<string[]>(PROPERTY_SLUGS_QUERY, {}, [], "property-slugs");
}

/*
  Wrapped in React's cache(): generateMetadata and the page body both need the
  listing, and without this each render fetches the same document from Sanity
  twice. cache() dedupes within a single request — the CDN cache is a separate,
  slower layer that still costs a round trip on a miss.
*/
export const getProperty = cache(
  async (slug: string): Promise<PropertyDetail | null> =>
    sanityFetch<PropertyDetail | null>(PROPERTY_QUERY, { slug }, null, "property"),
);
