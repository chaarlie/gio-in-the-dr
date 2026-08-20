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
