import { EMAIL } from "./email";
import { WHATSAPP_DISPLAY } from "./whatsapp";
import { HREFLANG, localePath, type Locale } from "./i18n";
import { absoluteUrl } from "./site";

/*
  The site's identity, as structured data.

  The home page, /properties and /blog emitted no JSON-LD at all — the three
  pages most likely to be a first result, and the three with nothing to say
  about who is behind them. Listings and posts already had Product and
  BlogPosting; what was missing was the entity they all belong to.

  This matters more than the usual rich-result argument. A single agent
  competing against portals wins on being a named, locatable person rather than
  a listings database, and an assistant asked "who helps foreigners buy in
  Cabarete" can only answer with a name it can find. That name was nowhere in
  the markup.

  @id everywhere so the graph is one entity referenced repeatedly, rather than a
  fresh anonymous organisation on every page.
*/

export const ORG_ID = absoluteUrl("/#organization");
export const PERSON_ID = absoluteUrl("/#gio");

/** Gio herself. The author of every guide and the agent behind every listing. */
export function personSchema(locale: Locale) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Gio",
    jobTitle: locale === "es" ? "Agente inmobiliaria" : "Real estate agent",
    description:
      locale === "es"
        ? "Agente trilingüe en Cabarete que acompaña a extranjeros a comprar en la costa norte dominicana."
        : "Trilingual agent in Cabarete guiding foreign buyers through property purchase on the Dominican north coast.",
    knowsLanguage: ["en", "es", "it"],
    image: absoluteUrl("/gio-portrait-4x5.jpg"),
    url: absoluteUrl(localePath(locale, "/")),
    worksFor: { "@id": ORG_ID },
  };
}

/*
  RealEstateAgent rather than the bare Organization that was already named
  inside BlogPosting's publisher: it is the specific type for this business, and
  it is what carries areaServed and the contact details.
*/
export function organizationSchema(locale: Locale) {
  return {
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: "Gio In The DR",
    url: absoluteUrl(localePath(locale, "/")),
    image: absoluteUrl("/gio-portrait-4x5.jpg"),
    logo: absoluteUrl("/gio-avatar-1x1.jpg"),
    telephone: WHATSAPP_DISPLAY,
    email: EMAIL,
    founder: { "@id": PERSON_ID },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cabarete",
      addressRegion: "Puerto Plata",
      addressCountry: "DO",
    },
    areaServed: ["Cabarete", "Sosúa", "Puerto Plata", "Dominican Republic"].map(
      (name) => ({ "@type": "Place", name }),
    ),
    availableLanguage: ["en", "es", "it"],
    sameAs: [] as string[],
  };
}

/*
  Breadcrumbs.

  Google renders these in place of the raw URL, which on a slug like
  "4-bedroom-villa-for-sale-in-casa-linda-sosua-dominican-republic" is the
  difference between a readable result and a line of hyphens.
*/
export function breadcrumbSchema(
  locale: Locale,
  trail: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}

/** Wraps a set of nodes as one @graph, which is how they reference each other. */
export function graph(locale: Locale, nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.map((n) => ({ inLanguage: HREFLANG[locale], ...n })),
  };
}
