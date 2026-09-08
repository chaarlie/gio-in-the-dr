/*
  A blog topic, as a URL fragment.

  Topics are stored on a post as their English label ("Travel guides") and shown
  verbatim on the card, so there is no separate slug field to key against. This
  derives one — "travel-guides" — so the tab strip and the nav's deep link
  ("/blog#travel-guides") agree on the same hash without a second source to keep
  in step.

  Slugify the same way the guide schema does: fold to ASCII, drop apostrophes so
  "Buyer's" doesn't split, collapse the rest to single hyphens. "Residency &
  taxes" becomes "residency-taxes".
*/
export function topicSlug(topic: string): string {
  return topic
    .normalize("NFKD")
    .replace(/['’`]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The slug the "Travel guides" nav item points at — the one topic the menu links to. */
export const TRAVEL_GUIDES_SLUG = "travel-guides";

/*
  Every category the schema allows, in the Studio's order.

  A second copy of the list in sanity/schemaTypes/post.ts — kept deliberately, so
  a category archive can tell "no posts here yet" (a real, known category whose
  posts are scheduled or unwritten) from "no such category" (a 404). The live
  index derives its tabs from posts and never needs this; only the archive route,
  to resolve a slug the menu may link to before any post carries it, does.

  Keep in sync with the `topic` field's option list.
*/
export const TOPICS = [
  "Buying process",
  "Areas",
  "Residency & taxes",
  "Investment",
  "Living here",
  "Travel guides",
] as const;

/** The category label a slug names, if it's one the schema allows — else null. */
export function knownTopicFromSlug(slug: string): string | null {
  return TOPICS.find((label) => topicSlug(label) === slug) ?? null;
}
