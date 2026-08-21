import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import WhatsAppLauncher from "../../../components/WhatsAppLauncher";
import PostView from "../../../components/blog/PostView";
import { getPost, getPostSlugsIn } from "../../../lib/posts.server";
import { HREFLANG, LOCALES, blogPath, isLocale, type Locale } from "../../../lib/i18n";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    inLanguage: HREFLANG[locale],
    image: post.cover?.url ? [post.cover.url] : undefined,
    author: { "@type": "Person", name: "Gio" },
    publisher: { "@type": "Organization", name: "Gio In The DR" },
    mainEntityOfPage: blogPath(locale, post.slug),
  };

  return (
    <>
      <Header />
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
