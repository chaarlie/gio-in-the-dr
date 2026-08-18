import { sanityFetch } from "../../sanity/lib/client";
import { GUIDE_QUERY } from "../../sanity/lib/queries";

/*
  The downloadable guides. Server-only — it imports the Sanity client.

  The fallback is null, never a committed file. Nothing is bundled into the repo
  for this: if the document isn't in Sanity the link doesn't render, which is the
  honest state and keeps a 2.7 MB binary out of git history.
*/

export type Guide = {
  title: string;
  description: string | null;
  pages: number | null;
  url: string | null;
  size: number | null;
  extension: string | null;
  filename: string | null;
  cover: {
    url: string | null;
    lqip: string | null;
    aspectRatio: number | null;
    alt: string | null;
  } | null;
};

/** The slug the home page's download link looks for. */
export const BUYERS_GUIDE_SLUG = "buyers-guide";

export async function getGuide(slug: string): Promise<Guide | null> {
  return sanityFetch<Guide | null>(GUIDE_QUERY, { slug }, null, "guide");
}
