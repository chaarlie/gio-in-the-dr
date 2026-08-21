import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import WhatsAppLauncher from "../../../components/WhatsAppLauncher";
import PortableBody from "../../../components/PortableBody";
import Badge from "../../../components/Badge";
import { formatExactPrice } from "../../../lib/format";
import { getProperty, getPropertySlugs } from "../../../lib/properties.server";
import { waLink } from "../../../lib/whatsapp";
import PropertyGallery from "../../../components/PropertyGallery";
import PropertyCalculators from "../../../components/PropertyCalculators";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "../../../lib/i18n";
import { MESSAGES } from "../../../lib/messages";

/*
  A listing's own page — the address the slug field has been promising all along.

  Prerendered per slug, and reserved/sold listings keep theirs even though they drop out
  of the search grid: a link Gio sent last month shouldn't 404 the week it sells, and a
  sold comp is the most persuasive page on the site for the next buyer.
*/

export async function generateStaticParams() {
  const slugs = await getPropertySlugs();
  // Listings are not translated yet, so both locales serve the same documents;
  // only the surrounding chrome differs.
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

type PageProps = { params: Promise<{ locale: string; slug: string }> };

const STATUS_LABEL: Record<string, string> = {
  reserved: "Reserved",
  sold: "Sold",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const property = await getProperty(slug, locale);
  if (!property) return { title: "Property not found — Gio In The DR" };

  const where = property.area?.name ?? "the Dominican Republic";
  const price = formatExactPrice(property.priceUsd);
  const description =
    property.spec ??
    `${property.category ?? "Property"} for sale in ${where}${price ? ` — ${price}` : ""}.`;
  const image = property.images?.[0]?.url;

  return {
    title: `${property.title} — ${where} | Gio In The DR`,
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title: property.title,
      description,
      type: "website",
      images: image ? [image] : undefined,
    },
  };
}

/** One row of the facts table. Renders nothing when the field is empty. */
function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="border-t border-line py-3.5 flex items-baseline justify-between gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-semibold text-ink text-right">{value}</dd>
    </div>
  );
}

export default async function PropertyPage({ params }: PageProps) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].properties;
  const property = await getProperty(slug, locale);
  if (!property) notFound();

  const price = formatExactPrice(property.priceUsd);
  const where = property.area?.name ?? null;
  const status = property.status ? STATUS_LABEL[property.status] : undefined;
  const image = property.images?.[0]?.url;

  const message = `Hi Gio, I'm interested in ${property.title}${
    where ? ` in ${where}` : ""
  }${price ? ` (${price})` : ""}.`;

  /*
    Product/Offer rather than a real-estate-specific type: this is the vocabulary Google
    actually reads prices out of, and these are the pages meant to rank.
  */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: property.spec ?? undefined,
    image: image ? [image] : undefined,
    category: property.category ?? undefined,
    offers: property.priceUsd
      ? {
          "@type": "Offer",
          price: property.priceUsd,
          priceCurrency: "USD",
          availability:
            property.status === "sold"
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
        }
      : undefined,
  };

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-5xl mx-auto px-6 md:px-8 py-10 md:py-14 w-full">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink no-underline transition-colors"
        >
          {t.allProperties}
        </Link>

        <div className="mt-6">
          {/* Same carousel the explorer panel uses — this page used to render a
              static grid, so clicking a photo here did nothing at all. */}
          <PropertyGallery
            images={property.images}
            title={property.title}
            sizes="(min-width: 1024px) 900px, 100vw"
            priority
            aspect="aspect-[16/9]"
            className="rounded-3xl"
          />
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-14 mt-8 lg:mt-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {property.category ? (
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {property.category}
                </span>
              ) : null}
              {status ? (
                <Badge variant="solid" className="!text-xs !py-1 border border-line">
                  {status}
                </Badge>
              ) : null}
            </div>
            <h1 className="font-display font-bold text-ink text-3xl md:text-5xl mt-2 text-balance">
              {property.title}
            </h1>
            {where ? (
              <p className="text-muted mt-2">
                <Link href="/#areas" className="text-muted hover:text-ink underline underline-offset-2">
                  {where}
                </Link>
                , Dominican Republic
              </p>
            ) : null}

            {property.body ? (
              <div className="mt-8">
                <PortableBody value={property.body} />
              </div>
            ) : property.spec ? (
              <p className="text-ink/85 leading-relaxed mt-8">{property.spec}</p>
            ) : null}

            {property.sourceUrl ? (
              <a
                href={property.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 text-sm font-semibold text-accent underline underline-offset-2"
              >
                {t.brokerageFull}
              </a>
            ) : null}
          </div>

          {/* Sticky on desktop: the price and the way to reach Gio should never scroll
              out of reach while someone reads the description. */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card border border-line rounded-3xl p-6">
              <p className="font-display text-3xl font-bold text-ink">
                {price ?? "Price on request"}
              </p>
              {property.spec ? (
                <p className="text-sm text-muted mt-1.5">{property.spec}</p>
              ) : null}

              <dl className="mt-5">
                <Fact label={t.bedrooms} value={property.beds !== null ? String(property.beds) : null} />
                <Fact label={t.bathrooms} value={property.baths !== null ? String(property.baths) : null} />
                <Fact label={t.interiorArea} value={property.areaM2 ? `${property.areaM2} m²` : null} />
                <Fact
                  label={t.pricePerM2}
                  value={
                    property.priceUsd && property.areaM2
                      ? `$${Math.round(property.priceUsd / property.areaM2).toLocaleString("en-US")}`
                      : null
                  }
                />
              </dl>

              {/* HOA and the walk to the sand are worked out, not read off — so
                  they get panels of their own rather than two table rows. Same
                  component the explorer panel uses. */}
              <PropertyCalculators
                hoaAmount={property.hoaAmount}
                hoaUnit={property.hoaUnit}
                areaM2={property.areaM2}
                location={property.location}
                beachPoint={property.area?.beachPoint ?? null}
                walkToBeachMin={property.walkToBeachMin}
                areaName={property.area?.name ?? null}
                className="mt-5 sm:grid-cols-1"
              />

              <a
                href={waLink(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center mt-6 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
              >
                {t.askAboutProperty}
              </a>
              <p className="text-xs text-muted text-center mt-3"> {t.repliesNote}
              </p>
            </div>
          </aside>
        </div>
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
