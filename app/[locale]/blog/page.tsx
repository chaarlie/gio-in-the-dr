import type { Metadata } from "next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WhatsAppLauncher from "../../components/WhatsAppLauncher";
import BlogIndex from "../../components/blog/BlogIndex";
import {
  DEFAULT_LOCALE,
  blogPath,
  isLocale,
  localeAlternates,
  localePath,
} from "../../lib/i18n";
import JsonLd from "../../components/JsonLd";
import { absoluteUrl } from "../../lib/site";
import { ORG_ID, PERSON_ID, breadcrumbSchema, graph } from "../../lib/schema";
import { MESSAGES } from "../../lib/messages";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** ?page=N → N, or 1 for anything that isn't a page number. */
function pageInt(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].blog;
  const page = pageInt((await searchParams).page);
  // Page two onward self-canonicals with its ?page, so each paginated view owns
  // its URL rather than all collapsing onto /blog (which would ask Google to
  // drop every page but the first).
  const suffix = page > 1 ? `?page=${page}` : "";

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: localeAlternates(locale, (l) => blogPath(l) + suffix),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
      locale: locale === "es" ? "es_DO" : "en_US",
      url: blogPath(locale) + suffix,
    },
  };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].blog;
  const page = pageInt((await searchParams).page);

  return (
    <>
      <JsonLd
        data={graph(locale, [
          {
            "@type": "Blog",
            "@id": absoluteUrl(blogPath(locale)),
            url: absoluteUrl(blogPath(locale)),
            name: t.metaTitle,
            description: t.metaDescription,
            author: { "@id": PERSON_ID },
            publisher: { "@id": ORG_ID },
          },
          breadcrumbSchema(locale, [
            { name: "Gio In The DR", path: localePath(locale, "/") },
            { name: t.indexEyebrow, path: blogPath(locale) },
          ]),
        ])}
      />
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20"
      >
        <BlogIndex locale={locale} activeTopic={null} page={page} />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
