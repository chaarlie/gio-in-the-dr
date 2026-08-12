import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-02-19";

/** True once Gio's project ID is in .env.local. Everything degrades until then. */
export const sanityReady = Boolean(projectId);

export const client = sanityReady
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

/*
  Fetch that never takes the site down.

  No project ID yet, or the query fails, and callers get `fallback` — the static
  data committed in app/lib. That keeps the build green and the page rendered
  while the CMS is still being set up, instead of turning a missing env var into
  a broken deploy.
*/
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T,
  tag: string,
): Promise<T> {
  if (!client) return fallback;
  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: 300, tags: [tag] },
    });
  } catch (error) {
    console.error(`[sanity] ${tag} query failed, using fallback:`, error);
    return fallback;
  }
}
