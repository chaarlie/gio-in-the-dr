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

/** English lives at /blog, Spanish at /es/blog — see app/[locale]/blog. */
export function blogPath(locale: Locale, slug?: string): string {
  const base = locale === DEFAULT_LOCALE ? "/blog" : `/${locale}/blog`;
  return slug ? `${base}/${slug}` : base;
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
  inThisGuide: string;
  keepReading: string;
  ctaHeading: string;
  ctaBody: string;
  ctaWhatsApp: string;
  ctaEmail: string;
  emailSubject: string;
  indexEyebrow: string;
  indexHeading: string;
  indexIntro: string;
  minRead: (n: number) => string;
  readInOtherLanguage: (language: string) => string;
};

export const MESSAGES: Record<Locale, Messages> = {
  en: {
    inThisGuide: "In this guide",
    keepReading: "Keep reading",
    ctaHeading: "Questions this didn't answer?",
    ctaBody: "Gio works in English, Spanish and Italian, and usually replies the same day.",
    ctaWhatsApp: "Message Gio on WhatsApp",
    ctaEmail: "Email Gio",
    emailSubject: "Question about",
    indexEyebrow: "Guides & stories",
    indexHeading: "Buying on the north coast.",
    indexIntro:
      "Real answers to the questions people ask before moving or buying: from neighborhoods and property taxes to the cost of living and what everyday life in Cabarete is really like.",
    minRead: (n) => `${n} min read`,
    readInOtherLanguage: (language) => `Read this in ${language}`,
  },
  es: {
    inThisGuide: "En esta guía",
    keepReading: "Sigue leyendo",
    ctaHeading: "¿Te quedaron preguntas?",
    ctaBody: "Gio habla inglés, español e italiano, y normalmente responde el mismo día.",
    ctaWhatsApp: "Escríbele a Gio por WhatsApp",
    ctaEmail: "Escríbele por correo",
    emailSubject: "Pregunta sobre",
    indexEyebrow: "Guías e historias",
    indexHeading: "Comprar en la costa norte.",
    indexIntro:
      "Respuestas reales a las preguntas que la gente hace antes de mudarse o comprar: desde los barrios y los impuestos hasta el costo de vida y cómo es de verdad el día a día en Cabarete.",
    minRead: (n) => `${n} min de lectura`,
    readInOtherLanguage: (language) => `Léelo en ${language}`,
  },
};
