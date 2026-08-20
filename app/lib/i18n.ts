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
