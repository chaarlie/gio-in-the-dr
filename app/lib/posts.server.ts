import { cache } from "react";
import { toPlainText } from "next-sanity";
import { sanityFetch } from "../../sanity/lib/client";
import {
  POSTS_QUERY,
  POSTS_IN_QUERY,
  POST_QUERY,
  POST_SLUGS_QUERY,
  POST_SLUGS_IN_QUERY,
} from "../../sanity/lib/queries";
import type { Locale } from "./i18n";
import type { PortableBlocks } from "../components/PortableBody";

/*
  Blog reads. Server-only for the same reason as properties.server: it imports the
  Sanity client. Empty list / null fallbacks — an unreachable CMS renders the "no posts
  yet" page, which is honest, rather than taking the route down.
*/

export type PostImage = {
  url: string | null;
  lqip: string | null;
  aspectRatio: number | null;
  alt: string | null;
};

export type PostCard = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  topic: string | null;
  cover: PostImage | null;
};

export type Post = PostCard & {
  body: PortableBlocks | null;
  related: PostCard[] | null;
  /** The same post in the other language, when one exists. Null hides the flag toggle. */
  translation: { slug: string; language: string } | null;
};

export async function getPosts(): Promise<PostCard[]> {
  return sanityFetch<PostCard[]>(POSTS_QUERY, {}, [], "posts");
}

export async function getPostSlugs(): Promise<string[]> {
  return sanityFetch<string[]>(POST_SLUGS_QUERY, {}, [], "post-slugs");
}

/** cache()d for the same reason as getProperty: generateMetadata + page body. */
export const getPost = cache(
  async (slug: string, language: Locale = "en"): Promise<Post | null> =>
    sanityFetch<Post | null>(POST_QUERY, { slug, language }, null, "post"),
);

/** Posts in one language for that language's index. */
export const getPostsIn = cache(
  async (language: Locale): Promise<PostCard[]> =>
    sanityFetch<PostCard[]>(POSTS_IN_QUERY, { language }, [], "posts"),
);

/** Slugs for one language, for generateStaticParams. */
export async function getPostSlugsIn(language: Locale): Promise<string[]> {
  return sanityFetch<string[]>(POST_SLUGS_IN_QUERY, { language }, [], "post-slugs");
}

/*
  Minutes to read — 200 wpm, rounded up, floor of 1.

  Returns the number, not the phrase. It used to return "6 min read", which is a
  sentence, and a sentence cannot be translated by whoever displays it — the
  Spanish page said "10 min read" under a Spanish headline.
*/
export function readingTime(body: PortableBlocks | null): number | null {
  if (!body) return null;
  // <PortableText value> accepts a wider type than toPlainText's parameter — both
  // describe the same blocks, so the cast bridges the two rather than papering over
  // a mismatch.
  const blocks = body as Parameters<typeof toPlainText>[0];
  const words = toPlainText(blocks).trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return null;
  return Math.max(1, Math.round(words / 200));
}

/** "12 August 2026" — spelled out, since these are read worldwide and 08/12 isn't. */
/*
  "17 August 2026" / "17 de agosto de 2026".

  en-GB rather than en-US deliberately — day-first reads unambiguously to the
  European and Latin American audience this site is written for, where 8/17
  would be read as a broken date rather than a month.
*/
export function formatDate(iso: string | null, locale: string = "en"): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale === "es" ? "es-DO" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
