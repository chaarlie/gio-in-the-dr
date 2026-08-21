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

  English carries no prefix: /blog, not /en/blog. Both spellings resolve — the
  [locale] segment matches "en" directly, and rootParams serves the unprefixed
  path from the same tree — so the choice here is which one we *emit*, and
  emitting one form consistently is what keeps the canonicals honest.
  Hash-only links ("/#areas") keep their fragment.
*/
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export function blogPath(locale: Locale, slug?: string): string {
  return localePath(locale, slug ? `/blog/${slug}` : "/blog");
}

export function propertyPath(locale: Locale, slug?: string): string {
  return localePath(locale, slug ? `/properties/${slug}` : "/properties");
}

/*
  canonical + hreflang for a page that exists in every locale at the same slug —
  which is every page except a blog post, whose translation is a separate
  document with its own slug (see blog/[slug]/page.tsx).

  The canonical has to carry the locale prefix. It did not, and a hardcoded
  "/properties/<slug>" on the Spanish page told Google the Spanish catalogue was
  a duplicate of the English one — the whole translated half of the site asking
  not to be indexed. Building both tags from one function is what stops the two
  from drifting apart again.

  x-default points at English: it is what someone whose language we don't
  publish should land on.
*/
export function localeAlternates(locale: Locale, path: (l: Locale) => string) {
  return {
    canonical: path(locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], path(l)])),
      "x-default": path(DEFAULT_LOCALE),
    },
  };
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
