import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import WhatsAppLauncher from "../../../../components/WhatsAppLauncher";
import BlogIndex from "../../../../components/blog/BlogIndex";
import {
  DEFAULT_LOCALE,
  HREFLANG,
  LOCALES,
  blogPath,
  blogTopicPath,
  isLocale,
  localePath,
  type Locale,
} from "../../../../lib/i18n";
import { knownTopicFromSlug } from "../../../../lib/topics";
import { getBlogTopics } from "../../../../lib/posts.server";
import JsonLd from "../../../../components/JsonLd";
import { absoluteUrl } from "../../../../lib/site";
import { ORG_ID, breadcrumbSchema, graph } from "../../../../lib/schema";
import { MESSAGES } from "../../../../lib/messages";

/*
  A category archive: /blog/topic/<slug>, one topic's posts, paginated by ?page.

  The slug names a category the schema allows (knownTopicFromSlug) — an unknown
  one is a 404. A known category with no live posts yet, because its posts are
  scheduled or unwritten, is not a 404: it renders a "check back" page, so the
  menu's link to it always resolves and fills in the moment a post publishes.
  That page carries noindex, because an empty archive is nothing for Google to
  keep; hreflang and the sitemap list only the locales where it actually has
  posts, the same rule untranslated pages follow.
*/
type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pageInt(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** The locales whose live index carries this category — for hreflang and noindex. */
async function liveLocales(label: string): Promise<Record<Locale, boolean>> {
  const flags = await Promise.all(
    LOCALES.map(async (l) => [l, (await getBlogTopics(l)).includes(label)] as const),
  );
  return Object.fromEntries(flags) as Record<Locale, boolean>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const label = knownTopicFromSlug(slug);
  if (!label) return {};

  const t = MESSAGES[locale].blog;
  const page = pageInt((await searchParams).page);
  const suffix = page > 1 ? `?page=${page}` : "";
  const live = await liveLocales(label);

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    if (live[l]) languages[HREFLANG[l]] = blogTopicPath(l, slug) + suffix;
  }
  const xDefault = languages[HREFLANG[DEFAULT_LOCALE]] ?? blogTopicPath(locale, slug) + suffix;

  return {
    title: `${label} · Gio In The DR`,
    description: t.metaDescription,
    // An empty category is a real page but nothing to index yet — it flips to
    // indexable on its own once a post in it goes live.
    robots: live[locale] ? undefined : { index: false, follow: true },
    alternates: {
      canonical: blogTopicPath(locale, slug) + suffix,
      languages: { ...languages, "x-default": xDefault },
    },
    openGraph: {
      title: `${label} · Gio In The DR`,
      description: t.metaDescription,
      type: "website",
      locale: locale === "es" ? "es_DO" : "en_US",
      url: blogTopicPath(locale, slug) + suffix,
    },
  };
}

export default async function BlogTopicPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const label = knownTopicFromSlug(slug);
  if (!label) notFound();

  const t = MESSAGES[locale].blog;
  const page = pageInt((await searchParams).page);

  return (
    <>
      <JsonLd
        data={graph(locale, [
          {
            "@type": "CollectionPage",
            "@id": absoluteUrl(blogTopicPath(locale, slug)),
            url: absoluteUrl(blogTopicPath(locale, slug)),
            name: `${label} · Gio In The DR`,
            description: t.metaDescription,
            about: { "@id": ORG_ID },
            isPartOf: { "@id": absoluteUrl(blogPath(locale)) },
          },
          breadcrumbSchema(locale, [
            { name: "Gio In The DR", path: localePath(locale, "/") },
            { name: t.indexEyebrow, path: blogPath(locale) },
            { name: label, path: blogTopicPath(locale, slug) },
          ]),
        ])}
      />
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20"
      >
        <BlogIndex locale={locale} activeTopic={label} page={page} />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
