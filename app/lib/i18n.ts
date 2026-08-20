/*
  Locales, and the strings the blog pages need in each.

  Deliberately small. This is not the site-wide translation layer — that is a
  next-intl refactor across ~25 files. This covers only the chrome around a blog
  post, because that is the one place translated content exists, and a Spanish
  guide framed by English headings reads as half-finished.

  When the full refactor lands these keys move into the message catalogue
  unchanged; the shape here is deliberately the shape next-intl uses.
*/

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/*
  Any path, under the right locale.

  English carries no prefix — middleware rewrites "/blog" to "/en/blog"
  internally — so this returns the path unchanged for English and prefixes
  everything else. Hash-only links ("/#areas") keep their fragment.
*/
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export function blogPath(locale: Locale, slug?: string): string {
  return localePath(locale, slug ? `/blog/${slug}` : "/blog");
}

/** The tag hreflang wants: the language, and for Spanish the market it is written for. */
export const HREFLANG: Record<Locale, string> = {
  en: "en",
  es: "es-DO",
};

/*
  A language's own name, for the chip on the toggle. Showing "Español" rather
  than "Spanish" is the convention every switcher follows, and for good reason:
  someone looking for their language recognises it written the way they write it.
*/
export const LANGUAGE_NAME: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

/*
  The same languages named *in* each language, for sentences.

  The endonym is right on a chip and wrong in a sentence — "Léelo en English"
  reads as a bug to a Spanish speaker, because the sentence is Spanish and the
  word inside it is not.
*/
export const LANGUAGE_NAME_IN: Record<Locale, Record<Locale, string>> = {
  en: { en: "English", es: "Spanish" },
  es: { en: "inglés", es: "español" },
};

type Messages = {
  nav: {
    properties: string;
    map: string;
    services: string;
    blog: string;
    about: string;
    contact: string;
  };
  home: {
    heroEyebrow: string;
    heroHeading: string;
    heroBody: string;
    heroRole: string;
    statsEyebrow: string;
    statsHeading: string;
    statYears: string;
    statLanguages: string;
    statGuidance: string;
    servicesEyebrow: string;
    servicesHeading: string;
    servicesMore: string;
    serviceListingsTitle: string;
    serviceListingsBody: string;
    serviceGuideTitle: string;
    serviceGuideBody: string;
    serviceRelocationTitle: string;
    serviceRelocationBody: string;
    aboutHeading: string;
    aboutBody1: string;
    aboutBody2: string;
    aboutCta: string;
    aboutStatYears: string;
    aboutStatLanguages: string;
    aboutStatService: string;
    aboutEyebrow: string;
    propertiesHeading: string;
    propertiesIntro: string;
    r360Eyebrow: string;
    r360Heading: string;
    areasEyebrow: string;
    areasHeading: string;
    boundariesNote: string;
    contactEyebrow: string;
    contactHeading: string;
  };
  footerEyebrow: string;
  footerHeading: string;
  chatOnWhatsApp: string;
  rights: string;
  inThisGuide: string;
  keepReading: string;
  ctaHeading: string;
  ctaBody: string;
  ctaWhatsApp: string;
  ctaEmail: string;
  emailSubject: string;
  indexEyebrow: string;
  indexEmpty: string;
  indexHeading: string;
  indexIntro: string;
  minRead: (n: number) => string;
  viewInOtherLanguage: (language: string) => string;
};

export const MESSAGES: Record<Locale, Messages> = {
  en: {
    nav: {
      properties: "Properties",
      map: "Map",
      services: "Services",
      blog: "Blog",
      about: "About",
      contact: "Contact",
    },
    home: {
      heroEyebrow: "Cabarete · Dominican Republic",
      heroHeading: "Buy property & build a life in the Dominican Republic.",
      heroBody:
        "I help you find your place on the north coast: homes, land & investments around Cabarete, guided from first viewing to closing, in your language.",
      heroRole: "Real estate agent · English · Español · Italiano",
      statsEyebrow: "Highlights",
      statsHeading:
        "A trilingual agent who moved here herself — helping foreigners buy with confidence.",
      statYears: "Years helping foreigners buy in the DR",
      statLanguages: "Languages spoken — English, Spanish, Italian",
      statGuidance: "Personal guidance from search to closing",
      servicesEyebrow: "Services",
      servicesHeading: "How I help you buy — and settle into — life in the DR.",
      servicesMore: "Explore more →",
      serviceListingsTitle: "Property Listings",
      serviceListingsBody:
        "Curated homes, land and commercial spaces around Cabarete and the north coast — vetted before you see them.",
      serviceGuideTitle: "Your Guide in Cabarete",
      serviceGuideBody:
        "Think of me as your local guide. I'll share honest advice, local insights, and help you navigate life here.",
      serviceRelocationTitle: "Relocation Support",
      serviceRelocationBody:
        "Residency, the buying process, taxes and financing — explained clearly in your language so you can decide with confidence.",
      aboutHeading: "An Italian who chose the Dominican Republic.",
      aboutBody1:
        "I moved to the Dominican Republic from Italy and made Cabarete home. For the past four years I've helped foreigners buy here.",
      aboutBody2:
        "Because I speak English, Spanish and Italian — and made the move myself — I understand exactly what you're weighing up.",
      aboutCta: "Work with Gio",
      aboutStatYears: "Years in DR real estate",
      aboutStatLanguages: "Languages — EN · ES · IT",
      aboutStatService: "Personal service, start to finish",
      aboutEyebrow: "About Gio",
      propertiesHeading: "Find your property",
      propertiesIntro:
        "Search beachfront condos, villas, investment and pre-construction across the north coast.",
      r360Eyebrow: "Beyond the listing",
      r360Heading: "Real estate in 360°",
      areasEyebrow: "North coast",
      areasHeading: "Explore by area",
      boundariesNote: "Boundaries approximate.",
      contactEyebrow: "Get in touch",
      contactHeading: "Tell me what you're looking for.",
    },
    footerEyebrow: "Let's talk",
    footerHeading: "Find your place in the Dominican Republic.",
    chatOnWhatsApp: "Chat on WhatsApp",
    rights: "© 2026 Gio In The DR. All rights reserved.",
    inThisGuide: "In this guide",
    keepReading: "Keep reading",
    ctaHeading: "Questions this didn't answer?",
    ctaBody: "Gio works in English, Spanish and Italian, and usually replies the same day.",
    ctaWhatsApp: "Message Gio on WhatsApp",
    ctaEmail: "Email Gio",
    emailSubject: "Question about",
    indexEyebrow: "Guides & stories",
    indexEmpty: "The blog is on the way.",
    indexHeading: "Buying on the north coast.",
    indexIntro:
      "Real answers to the questions people ask before moving or buying: from neighborhoods and property taxes to the cost of living and what everyday life in Cabarete is really like.",
    minRead: (n) => `${n} min read`,
    viewInOtherLanguage: (language) => `View this page in ${language}`,
  },
  es: {
    nav: {
      properties: "Propiedades",
      map: "Mapa",
      services: "Servicios",
      blog: "Blog",
      about: "Sobre mí",
      contact: "Contacto",
    },
    home: {
      heroEyebrow: "Cabarete · República Dominicana",
      heroHeading: "Compra tu propiedad y construye tu vida en República Dominicana.",
      heroBody:
        "Te ayudo a encontrar tu lugar en la costa norte: casas, terrenos e inversiones en la zona de Cabarete, acompañándote desde la primera visita hasta el cierre, en tu idioma.",
      heroRole: "Agente inmobiliaria · English · Español · Italiano",
      statsEyebrow: "En resumen",
      statsHeading:
        "Una agente trilingüe que también se mudó aquí — para que compres con confianza.",
      statYears: "Años ayudando a extranjeros a comprar en RD",
      statLanguages: "Idiomas — inglés, español, italiano",
      statGuidance: "Acompañamiento personal, de la búsqueda al cierre",
      servicesEyebrow: "Servicios",
      servicesHeading: "Cómo te ayudo a comprar — y a instalarte — en República Dominicana.",
      servicesMore: "Ver más →",
      serviceListingsTitle: "Propiedades",
      serviceListingsBody:
        "Casas, terrenos y locales seleccionados en Cabarete y la costa norte, revisados antes de que los veas.",
      serviceGuideTitle: "Tu guía en Cabarete",
      serviceGuideBody:
        "Piensa en mí como tu guía local. Te doy consejos honestos, información de primera mano y te ayudo a moverte por la vida de aquí.",
      serviceRelocationTitle: "Apoyo en la mudanza",
      serviceRelocationBody:
        "Residencia, el proceso de compra, impuestos y financiamiento — explicados con claridad en tu idioma para que decidas con confianza.",
      aboutHeading: "Una italiana que eligió República Dominicana.",
      aboutBody1:
        "Me mudé a República Dominicana desde Italia y convertí Cabarete en mi casa. Durante los últimos cuatro años he ayudado a extranjeros a comprar aquí.",
      aboutBody2:
        "Como hablo inglés, español e italiano — y di el paso yo misma — entiendo exactamente lo que estás sopesando.",
      aboutCta: "Trabaja con Gio",
      aboutStatYears: "Años en bienes raíces en RD",
      aboutStatLanguages: "Idiomas — EN · ES · IT",
      aboutStatService: "Trato personal, de principio a fin",
      aboutEyebrow: "Sobre Gio",
      propertiesHeading: "Encuentra tu propiedad",
      propertiesIntro:
        "Busca apartamentos frente al mar, villas, inversión y preconstrucción en toda la costa norte.",
      r360Eyebrow: "Más allá del anuncio",
      r360Heading: "Bienes raíces en 360°",
      areasEyebrow: "Costa norte",
      areasHeading: "Explora por zona",
      boundariesNote: "Los límites son aproximados.",
      contactEyebrow: "Hablemos",
      contactHeading: "Cuéntame qué estás buscando.",
    },
    footerEyebrow: "Hablemos",
    footerHeading: "Encuentra tu lugar en República Dominicana.",
    chatOnWhatsApp: "Escríbeme por WhatsApp",
    rights: "© 2026 Gio In The DR. Todos los derechos reservados.",
    inThisGuide: "En esta guía",
    keepReading: "Sigue leyendo",
    ctaHeading: "¿Te quedaron preguntas?",
    ctaBody: "Gio habla inglés, español e italiano, y normalmente responde el mismo día.",
    ctaWhatsApp: "Escríbele a Gio por WhatsApp",
    ctaEmail: "Escríbele por correo",
    emailSubject: "Pregunta sobre",
    indexEyebrow: "Guías e historias",
    indexEmpty: "El blog viene en camino.",
    indexHeading: "Comprar en la costa norte.",
    indexIntro:
      "Respuestas reales a las preguntas que la gente hace antes de mudarse o comprar: desde los barrios y los impuestos hasta el costo de vida y cómo es de verdad el día a día en Cabarete.",
    minRead: (n) => `${n} min de lectura`,
    viewInOtherLanguage: (language) => `Ver esta página en ${language}`,
  },
};
