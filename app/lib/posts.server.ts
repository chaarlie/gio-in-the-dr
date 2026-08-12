import { cache } from "react";
import { toPlainText } from "next-sanity";
import { sanityFetch } from "../../sanity/lib/client";
import { POSTS_QUERY, POST_QUERY, POST_SLUGS_QUERY } from "../../sanity/lib/queries";
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
};

export async function getPosts(): Promise<PostCard[]> {
  return sanityFetch<PostCard[]>(POSTS_QUERY, {}, [], "posts");
}

export async function getPostSlugs(): Promise<string[]> {
  return sanityFetch<string[]>(POST_SLUGS_QUERY, {}, [], "post-slugs");
}

/** cache()d for the same reason as getProperty: generateMetadata + page body. */
export const getPost = cache(
  async (slug: string): Promise<Post | null> =>
    sanityFetch<Post | null>(POST_QUERY, { slug }, null, "post"),
);

/** "6 min read" — 200 wpm, rounded up, floor of 1. */
export function readingTime(body: PortableBlocks | null): string | null {
  if (!body) return null;
  // <PortableText value> accepts a wider type than toPlainText's parameter — both
  // describe the same blocks, so the cast bridges the two rather than papering over
  // a mismatch.
  const blocks = body as Parameters<typeof toPlainText>[0];
  const words = toPlainText(blocks).trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return null;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** "12 August 2026" — spelled out, since these are read worldwide and 08/12 isn't. */
export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
