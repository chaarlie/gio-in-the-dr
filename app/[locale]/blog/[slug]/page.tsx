import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import WhatsAppLauncher from "../../../components/WhatsAppLauncher";
import PostView from "../../../components/blog/PostView";
import { getPost, getPostSlugsIn } from "../../../lib/posts.server";
import { HREFLANG, blogPath, isLocale, type Locale } from "../../../lib/i18n";

/*
  A post in a non-default language. English stays at /blog; Spanish is /es/blog.

  The static /blog segment wins over this dynamic one, so the two coexist without
  a middleware or a redirect. When the whole site moves under [locale], English
  joins this tree and app/blog is deleted — the shape here is already the shape
  it will keep.
*/

/** Only the locales that actually have posts. Anything else 404s below. */
export async function generateStaticParams() {
  const slugs = await getPostSlugsIn("es");
  return slugs.map((slug) => ({ locale: "es", slug }));
}

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === "en") return {};

  const post = await getPost(slug, locale as Locale);
  if (!post) return { title: "Página no encontrada — Gio In The DR" };

  return {
    title: `${post.title} — Gio In The DR`,
    description: post.excerpt ?? undefined,
    alternates: {
      canonical: blogPath(locale, post.slug),
      // Both directions, so Google reads them as one guide in two languages
      // rather than two pages competing for the same queries.
      languages: post.translation
        ? {
            [HREFLANG.es]: blogPath("es", post.slug),
            [HREFLANG.en]: blogPath("en", post.translation.slug),
          }
        : undefined,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      locale: "es_DO",
      publishedTime: post.publishedAt ?? undefined,
      images: post.cover?.url ? [post.cover.url] : undefined,
    },
  };
}

export default async function LocalisedPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  // "en" is served by /blog, so /en/blog would be a second URL for one page.
  if (!isLocale(locale) || locale === "en") notFound();

  const post = await getPost(slug, locale as Locale);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 w-full">
        <PostView post={post} locale={locale as Locale} />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
