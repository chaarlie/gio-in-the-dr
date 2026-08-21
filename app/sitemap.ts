import type { MetadataRoute } from "next";
import { getPropertySlugs } from "./lib/properties.server";
import { getPostsIn } from "./lib/posts.server";
import {
  DEFAULT_LOCALE,
  HREFLANG,
  LOCALES,
  blogPath,
  localePath,
  propertyPath,
  type Locale,
} from "./lib/i18n";
import { absoluteUrl } from "./lib/site";

/*
  There was no sitemap at all, and /sitemap.xml served the home page under a 200
  — see the note in robots.ts for why.

  Both languages are listed, and every page that exists in both carries
  alternates so the XML says the same thing the <link rel="alternate"> tags do.
  Blog posts are the exception: a translated post is a separate document with
  its own slug, so a post appears once, under its own language, and the pairing
  is left to the tags in its head where the slug of the counterpart is known.
*/

/** A page that exists at the same path in every locale. */
function everywhere(
  path: (l: Locale) => string,
  lastModified?: Date,
): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: absoluteUrl(path(locale)),
    lastModified,
    alternates: {
      languages: {
        ...Object.fromEntries(
          LOCALES.map((l) => [HREFLANG[l], absoluteUrl(path(l))]),
        ),
        "x-default": absoluteUrl(path(DEFAULT_LOCALE)),
      },
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, ...postsByLocale] = await Promise.all([
    getPropertySlugs(),
    ...LOCALES.map((locale) => getPostsIn(locale)),
  ]);

  const posts = LOCALES.flatMap((locale, i) =>
    (postsByLocale[i] ?? []).map((post) => ({
      url: absoluteUrl(blogPath(locale, post.slug)),
      lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  );

  return [
    ...everywhere((l) => localePath(l, "/")).map((e) => ({
      ...e,
      changeFrequency: "weekly" as const,
      priority: 1,
    })),
    ...everywhere((l) => propertyPath(l)).map((e) => ({
      ...e,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...everywhere((l) => blogPath(l)).map((e) => ({
      ...e,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...slugs.flatMap((slug) =>
      everywhere((l) => propertyPath(l, slug)).map((e) => ({
        ...e,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ),
    ...posts,
  ];
}
