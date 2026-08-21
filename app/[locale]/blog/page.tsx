import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WhatsAppLauncher from "../../components/WhatsAppLauncher";
import PostCard from "../../components/PostCard";
import { getPostsIn } from "../../lib/posts.server";
import {
  DEFAULT_LOCALE,
  blogPath,
  isLocale,
  localeAlternates,
  localePath,
} from "../../lib/i18n";
import { MESSAGES } from "../../lib/messages";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].blog;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: localeAlternates(locale, (l) => blogPath(l)),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
      locale: locale === "es" ? "es_DO" : "en_US",
      url: blogPath(locale),
    },
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].blog;
  const posts = await getPostsIn(locale);

  return (
    <>
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20"
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted mb-4">
            {t.indexEyebrow}
          </p>
          {/* Two headlines for two states — the empty one is a real page, not a
              placeholder, so an unpublished blog never looks like a broken deploy. */}
          <h1 className="font-display font-bold text-ink text-4xl md:text-6xl text-balance">
            {posts.length === 0
              ? t.indexEmpty
              : t.indexHeading}
          </h1>
          <p className="text-muted text-lg leading-relaxed mt-5">
            {posts.length === 0 ? t.indexEmptyBody : t.indexIntro}
          </p>
          {posts.length === 0 ? (
            <Link
              href={localePath(locale, "/#contact")}
              className="inline-block mt-8 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
            >
              {t.getNotified}
            </Link>
          ) : null}
        </div>

        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 md:mt-16">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : null}
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
