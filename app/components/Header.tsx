import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavLink from "./NavLink";
import LanguageSwitcher from "./LanguageSwitcher";
import { DEFAULT_LOCALE, localePath, type Locale, isLocale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";
import { locale as rootLocale } from "next/root-params";

/*
  Every nav item lives here, including the highlighted first one.

  It used to be split: a hardcoded "Start" link pointing at "/" rendered before
  this array, and only the array was handed to MobileMenu. So the primary item
  existed on desktop and nowhere else — whatever sat in that slot was missing
  from the phone menu entirely. Marking it with `primary` instead keeps one
  source for both navs.
*/
/*
  Paths are stored unprefixed and localised on render — see localePath. Storing
  "/properties" once and prefixing per locale keeps one nav; storing both would
  be two lists to forget to update.
*/
const NAV = [
  { key: "properties", href: "/properties", primary: true },
  { key: "map", href: "/#areas" },
  { key: "services", href: "/#services" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/#about" },
  { key: "contact", href: "/#contact" },
] as const;

export default async function Header({
  /*
    Where this page lives in the other language, when it is not simply the same
    path under the other prefix.

    A blog post is the case that needs it: its Spanish slug is
    "donde-vivir-en-cabarete", not a prefixed copy of the English one, so the
    switcher's own path-swap builds a URL that 404s. Passing null hides the
    toggle, which is the right answer for a post with no translation — better
    than offering a link to a page that does not exist.

    Omitted everywhere else, where swapping the prefix is correct. The locale
    itself still comes from next/root-params, not a prop.
  */
  otherHref,
}: {
  otherHref?: string | null;
} = {}) {
  const raw = await rootLocale();
  const locale: Locale = raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale];
  const other: Locale = locale === "en" ? "es" : "en";
  const items = NAV.map((item) => ({
    label: t.nav[item.key],
    href: localePath(locale, item.href),
    primary: "primary" in item ? item.primary : undefined,
  }));
  // `relative` so the mobile menu can anchor to the header's full width rather
  // than to the padded max-w-7xl row inside it — a menu that stops short of the
  // screen edge is the thing that read as a floating card.
  return (
    <header className="sticky top-0 z-50 relative bg-cream/80 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <Link
          href={localePath(locale, "/")}
          aria-label={t.common.homeAria}
          className="text-ink no-underline shrink-0"
        >
          <Logo />
        </Link>

        {/* Desktop nav. The logo is already the way home, so the first slot
            carries the listings rather than a second link to "/". */}
        <nav className="hidden md:flex items-center gap-1">
          {items.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className={
                item.primary
                  ? "text-sm font-semibold px-4 py-2 rounded-full bg-accent hover:bg-accent-soft text-cream no-underline transition-colors"
                  : "text-sm font-medium px-4 py-2 rounded-full text-ink hover:bg-ink/5 transition-colors no-underline"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Both toggles take the same href. The mobile one used to omit it and
              fall back to swapping the path prefix, which is right on every page
              except the one that needs it most — a post, whose Spanish lives at a
              Spanish slug. The result was a toggle that worked in the header and
              404ed in the hamburger. */}
          <LanguageSwitcher
            locale={locale}
            otherLocale={other}
            href={otherHref}
            className="hidden sm:flex"
          />
          <MobileMenu items={items} switcher={
            <LanguageSwitcher locale={locale} otherLocale={other} href={otherHref} />
          } />
        </div>
      </div>
    </header>
  );
}
