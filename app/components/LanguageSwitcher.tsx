"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, LANGUAGE_NAME, LANGUAGE_NAME_IN, type Locale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";

/*
  The language toggle on a post that has a translation.

  Drawn as SVG, not flag emoji. 🇺🇸 and 🇩🇴 render as flags on macOS and iOS and
  as the bare letters "US" and "DO" on Windows, which has no flag glyphs in its
  emoji font — so the one control whose whole job is to be recognised at a glance
  would be two grey letter-boxes for a large share of visitors.

  A caveat worth knowing: a flag names a country, not a language. English here is
  not only American and Spanish is not only Dominican — but this is Gio's market,
  and for a Cabarete audience these two read instantly. The accessible name is
  the language, not the country, so a screen reader hears "Español" rather than
  "Dominican Republic".
*/

function FlagUS() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" className="rounded-[2px] shrink-0">
      <rect width="20" height="14" fill="#f4f5f6" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y} width="20" height="1.08" fill="#c8102e" />
      ))}
      <rect width="9" height="7.5" fill="#20326c" />
    </svg>
  );
}

function FlagDO() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" className="rounded-[2px] shrink-0">
      <rect width="20" height="14" fill="#f4f5f6" />
      <rect width="8.4" height="5.6" fill="#002d62" />
      <rect x="11.6" width="8.4" height="5.6" fill="#ce1126" />
      <rect y="8.4" width="8.4" height="5.6" fill="#ce1126" />
      <rect x="11.6" y="8.4" width="8.4" height="5.6" fill="#002d62" />
    </svg>
  );
}

const FLAGS: Record<Locale, () => React.ReactElement> = { en: FlagUS, es: FlagDO };

export default function LanguageSwitcher({
  locale,
  otherLocale,
  href: explicitHref,
  className = "",
}: {
  /** The language currently on screen. */
  locale: Locale;
  otherLocale: Locale;
  /*
    Where the other language lives.

    Omitted on most pages: the same path under the other prefix, worked out from
    the current URL, which is why this is a client component. Pages whose address
    changes with the language — a blog post, whose Spanish slug is
    "donde-vivir-en-cabarete" and not a prefixed copy of the English — pass it
    explicitly. Null means no translation exists and the toggle is hidden.
  */
  href?: string | null;
  className?: string;
}) {
  const pathname = usePathname();

  /*
    Strip whatever locale prefix is on the path, then add the other one.

    Both must be stripped, not just the prefixed ones. Middleware rewrites
    "/blog" to "/en/blog" internally, and on a prerendered page usePathname
    reports that rewritten form rather than the address bar — so a switcher that
    only stripped "/es" built "/es/en/blog" and shipped it in the HTML, then
    quietly corrected itself on hydration. Wrong for crawlers, and wrong for
    anyone who clicks before the JS lands.
  */
  const bare = pathname.replace(new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`), "") || "/";
  const href =
    explicitHref === undefined
      ? otherLocale === DEFAULT_LOCALE
        ? bare
        : `/${otherLocale}${bare === "/" ? "" : bare}`
      : explicitHref;

  // Explicitly null means this page has no counterpart — a blog post without a
  // translation. A toggle leading nowhere is worse than none: it claims one exists.
  if (!href) return null;

  const Current = FLAGS[locale];
  const Other = FLAGS[otherLocale];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span
        aria-current="true"
        title={LANGUAGE_NAME[locale]}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-card px-2.5 h-9 text-xs font-semibold text-ink"
      >
        <Current />
        <span className="sr-only">{LANGUAGE_NAME[locale]}</span>
        <span aria-hidden="true">{locale.toUpperCase()}</span>
      </span>

      <Link
        href={href}
        hrefLang={otherLocale}
        // Named in the reader's language, not its own — the label is a sentence.
        aria-label={MESSAGES[locale].switcher.viewIn(LANGUAGE_NAME_IN[locale][otherLocale])}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 h-9 text-xs font-semibold text-muted hover:text-ink hover:border-ink/30 transition-colors no-underline"
      >
        <Other />
        <span aria-hidden="true">{otherLocale.toUpperCase()}</span>
      </Link>
    </div>
  );
}
