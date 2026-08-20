import Link from "next/link";
import { LANGUAGE_NAME, LANGUAGE_NAME_IN, MESSAGES, type Locale } from "../lib/i18n";

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
  href,
  className = "",
}: {
  /** The language currently on screen. */
  locale: Locale;
  otherLocale: Locale;
  /** Where the other language lives. Null when this post has no translation. */
  href: string | null;
  className?: string;
}) {
  // No translation, nothing to switch to. A toggle that leads nowhere is worse
  // than no toggle: it says a Spanish version exists.
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
        aria-label={MESSAGES[locale].readInOtherLanguage(LANGUAGE_NAME_IN[locale][otherLocale])}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 h-9 text-xs font-semibold text-muted hover:text-ink hover:border-ink/30 transition-colors no-underline"
      >
        <Other />
        <span aria-hidden="true">{otherLocale.toUpperCase()}</span>
      </Link>
    </div>
  );
}
