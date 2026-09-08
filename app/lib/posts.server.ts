import { cache } from "react";
import { toPlainText } from "next-sanity";
import { sanityFetch } from "../../sanity/lib/client";
import {
  POSTS_QUERY,
  POSTS_IN_QUERY,
  POSTS_PAGE_QUERY,
  POSTS_COUNT_QUERY,
  POST_TOPICS_QUERY,
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

/* ── The paginated / category-filtered index ──────────────────────────────── */

/** Nine to a page — three rows of three at lg, matching the properties grid. */
export const BLOG_PAGE_SIZE = 9;

export type PostPage = {
  items: PostCard[];
  /** Matches across the whole category, not this page — the count has to survive paging. */
  total: number;
  page: number;
  pageCount: number;
};

/*
  One page of the index, filtered by Sanity rather than the browser — the shape
  that scales past a couple of dozen posts, where shipping every card and hiding
  most in the client stops being free. `topic` is "" for the unfiltered index or
  a topic label for a category archive; the predicate lives in POST_FILTER so the
  slice and the total can't disagree.
*/
export async function getPostsPage(
  language: Locale,
  topic: string,
  page: number,
): Promise<PostPage> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * BLOG_PAGE_SIZE;
  const to = from + BLOG_PAGE_SIZE;

  const { items, total } = await sanityFetch<{ items: PostCard[]; total: number }>(
    POSTS_PAGE_QUERY,
    { language, topic, from, to },
    { items: [], total: 0 },
    "posts",
  );

  return {
    items,
    total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)),
  };
}

/** Count first, before anything streams — see the note in the blog page. */
export async function countPosts(language: Locale, topic: string): Promise<number> {
  return sanityFetch<number>(POSTS_COUNT_QUERY, { language, topic }, 0, "posts");
}

/*
  The category labels that have live posts in this language, newest first.

  cache()d because both the tab strip and the archive route's slug→label lookup
  ask for it within one request. The labels are what a post stores in `topic`;
  the URL slug is derived from them with topicSlug (see lib/topics).
*/
export const getBlogTopics = cache(
  async (language: Locale): Promise<string[]> =>
    sanityFetch<string[]>(POST_TOPICS_QUERY, { language }, [], "posts"),
);

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
