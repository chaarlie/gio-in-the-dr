"use client";

import { createContext, use, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";

/*
  The locale, for client components.

  A server component reads MESSAGES[locale] straight from its route params. A
  client component has no params — so without this, every one of the twelve that
  contain copy would need `locale` threaded down to it through whatever server
  component happens to render it, including through props of components that
  have no other reason to know about languages.

  Set once in the root layout. The value is the locale, not the messages: the
  catalogue is a module constant, so passing the whole object through context
  would put a few hundred strings into the serialised payload of every page for
  no benefit.
*/

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export default function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return use(LocaleContext);
}

/** The strings for the current locale. The client-side twin of MESSAGES[locale]. */
export function useMessages() {
  return MESSAGES[use(LocaleContext)];
}
