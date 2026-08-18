import { NextResponse, type NextRequest } from "next/server";
import { sanityFetch } from "../../../../../sanity/lib/client";
import { LISTING_IMAGES_QUERY } from "../../../../../sanity/lib/queries";
import type { GalleryImage } from "../../../../lib/sanity-image";

/*
  One listing's photos, on demand.

  The explorer list carries a single thumbnail per listing; opening one asks for
  the rest here. That split is the whole point — every photo of every listing
  travelled with the page before, 12.5 KB a listing, which is 289 KB of HTML for
  seven and roughly 4 MB for a hundred.

  A route rather than a client-side Sanity call, so the Sanity client stays out
  of the browser bundle — the same reason the read helpers live in *.server.ts.
*/

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ images: [] }, { status: 400 });

  const images = await sanityFetch<GalleryImage[] | null>(
    LISTING_IMAGES_QUERY,
    { slug },
    null,
    "properties",
  );

  return NextResponse.json(
    { images: (images ?? []).filter((i) => i.url) },
    {
      headers: {
        /*
          Same 300s window the pages use, and stale-while-revalidate so a second
          visitor never waits on the refresh. Publishing drops it early through
          the "properties" tag on the revalidate webhook.
        */
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}
