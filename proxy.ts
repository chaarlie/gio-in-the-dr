import { NextResponse, type NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "./app/lib/i18n";

/*
  English has no prefix; every other language does.

  Named proxy.ts, not middleware.ts: Next 16 deprecated the middleware file
  convention and renamed it — "the term 'middleware' can often be confused with
  Express.js middleware". Same API, same NextRequest/NextResponse.

  Every route lives under app/[locale], so "/blog" has no file to match. This
  rewrites it to "/en/blog" internally — the URL in the address bar is untouched,
  the page renders with locale "en". One set of route files, and English URLs
  that never grew an /en/ they did not have before.

  A rewrite rather than a redirect, deliberately: a redirect would change the URL
  and make /en/blog the real address, which is a second URL for a page that
  already has one — duplicate content a crawler has to reconcile.
*/

const PREFIXED = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already asking for a prefixed locale — nothing to do.
  if (PREFIXED.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }

  /*
    "/en/blog" is not an address this site has. Redirecting rather than serving it
    keeps one URL per page: without this, every English page would answer on two.
  */
  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || "/";
    return NextResponse.redirect(url);
  }

  /*
    Unprefixed. Serve English at this URL, but send a Spanish speaker to /es
    once — the first visit only, remembered in a cookie.

    A redirect rather than a rewrite here, unlike the English case below: the
    address bar has to change, or the flag would say ES while the URL says /
    and Back would have nowhere to go. Redirecting only when the cookie is
    absent means anyone who then clicks EN stays in English — the toggle sets
    the cookie, so the negotiation never overrules a deliberate choice.
  */
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  const preferred = chosen && isLocale(chosen) ? chosen : negotiate(request);
  if (preferred !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

/** Remembers a deliberate choice, so negotiation never overrules the toggle. */
export const LOCALE_COOKIE = "locale";

/*
  The best match between what the browser asks for and what the site has.

  Negotiator reads the quality values in Accept-Language properly — "es-419,
  es;q=0.9, en;q=0.8" is a ranking, not a list — and intl-localematcher does the
  lookup, so es-DO and es-419 both resolve to es rather than falling through to
  the default because they are not string-equal.
*/
function negotiate(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return DEFAULT_LOCALE;
  try {
    const languages = new Negotiator({ headers: { "accept-language": header } }).languages();
    return match(languages, [...LOCALES], DEFAULT_LOCALE);
  } catch {
    // A malformed header is a reason to serve the default, not to 500 the site.
    return DEFAULT_LOCALE;
  }
}

export const config = {
  /*
    Everything except Next's own assets, the API routes and files with an
    extension. Rewriting /favicon.ico to /en/favicon.ico would 404 it.
  */
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
