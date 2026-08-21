import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import WhatsAppLauncher from "../../../components/WhatsAppLauncher";
import PostView from "../../../components/blog/PostView";
import { getPost, getPostSlugsIn } from "../../../lib/posts.server";
import {
  HREFLANG,
  LOCALES,
  blogPath,
  isLocale,
  localePath,
  type Locale,
} from "../../../lib/i18n";
import { MESSAGES } from "../../../lib/messages";
import { absoluteUrl } from "../../../lib/site";
import { ORG_ID, PERSON_ID, breadcrumbSchema, graph } from "../../../lib/schema";

/*
  One post, in whichever language the URL asked for.

  English is served without a prefix — middleware rewrites "/blog/x" to
  "/en/blog/x" — so this one file covers both /blog/<slug> and /es/blog/<slug>
  and the two cannot drift.
*/

export async function generateStaticParams() {
  const perLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const slugs = await getPostSlugsIn(locale);
      return slugs.map((slug) => ({ locale, slug }));
    }),
  );
  return perLocale.flat();
}

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const post = await getPost(slug, locale);
  if (!post) return { title: "Gio In The DR" };

  const other: Locale = locale === "en" ? "es" : "en";

  return {
    title: `${post.title} — Gio In The DR`,
    description: post.excerpt ?? undefined,
    alternates: {
      canonical: blogPath(locale, post.slug),
      /*
        Both directions. Without it Google reads a guide and its translation as
        two pages competing for the same queries rather than one page in two
        languages — the worst of both outcomes for the thing the blog exists for.
      */
      languages: post.translation
        ? {
            [HREFLANG[locale]]: blogPath(locale, post.slug),
            [HREFLANG[other]]: blogPath(other, post.translation.slug),
          }
        : undefined,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      locale: locale === "es" ? "es_DO" : "en_US",
      publishedTime: post.publishedAt ?? undefined,
      images: post.cover?.url ? [post.cover.url] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const post = await getPost(slug, locale);
  if (!post) notFound();

  const other: Locale = locale === "en" ? "es" : "en";

  /*
    author and publisher are references now, not fresh anonymous nodes.

    They used to be an inline Person named "Gio" and an inline Organization
    named "Gio In The DR" — correct as far as it went, but a different,
    unidentified pair on every post, so nothing tied the guides to the agent
    whose expertise is the reason to trust them. Pointing at the @ids the home
    page defines makes the whole site one author with one body of work, which is
    the signal E-E-A-T is actually asking for.

    mainEntityOfPage is absolute now: it was a bare path, which resolves against
    whatever origin the reader happens to be on.
  */
  const jsonLd = graph(locale, [
    {
      "@type": "BlogPosting",
      "@id": absoluteUrl(blogPath(locale, post.slug)),
      headline: post.title,
      description: post.excerpt ?? undefined,
      datePublished: post.publishedAt ?? undefined,
      image: post.cover?.url ? [post.cover.url] : undefined,
      author: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": absoluteUrl(blogPath(locale)) },
      mainEntityOfPage: absoluteUrl(blogPath(locale, post.slug)),
    },
    breadcrumbSchema(locale, [
      { name: "Gio In The DR", path: localePath(locale, "/") },
      { name: MESSAGES[locale].blog.indexEyebrow, path: blogPath(locale) },
      { name: post.title, path: blogPath(locale, post.slug) },
    ]),
  ]);

  return (
    <>
      {/*
        The post's own translation, not a prefix swap: a Spanish post has its
        own slug. Null when there is no translation, which hides the toggle
        rather than linking to a 404.
      */}
      <Header
        otherHref={post.translation ? blogPath(other, post.translation.slug) : null}
      />
      <main id="main" tabIndex={-1} className="flex-1 w-full">
        <PostView post={post} locale={locale} />
      </main>
      <Footer />
      <WhatsAppLauncher />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
