import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "./app/lib/i18n";

/*
  English has no prefix; every other language does.

  Every route lives under app/[locale], so "/blog" has no file to match. This
  rewrites it to "/en/blog" internally — the URL in the address bar is untouched,
  the page renders with locale "en". One set of route files, and English URLs
  that never grew an /en/ they did not have before.

  A rewrite rather than a redirect, deliberately: a redirect would change the URL
  and make /en/blog the real address, which is a second URL for a page that
  already has one — duplicate content a crawler has to reconcile.
*/

const PREFIXED = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export function middleware(request: NextRequest) {
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

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  /*
    Everything except Next's own assets, the API routes and files with an
    extension. Rewriting /favicon.ico to /en/favicon.ico would 404 it.
  */
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
