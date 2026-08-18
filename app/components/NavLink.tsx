"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/*
  A nav item that reliably scrolls to its section.

  Almost every nav item is an in-page anchor, and clicking one whose hash was
  already in the URL did nothing at all: the router compares the target with the
  current URL, finds them identical, and skips the navigation — so no scroll
  happens either. Jump to #areas, scroll back up, press Map again, and the page
  sits still. That reads as the map failing to load rather than the link failing
  to move you, and it applied to every hash item in the nav.

  Doing the scroll here makes a repeat click behave like the first one. The
  sticky header is accounted for by each section's own scroll-mt-* class —
  scroll-margin-top is honoured by scrollIntoView, so the offset lives with the
  section rather than being duplicated as a magic number here.

  When the target isn't on this page — the same link pressed from /blog — the
  click falls through to an ordinary navigation.
*/
export default function NavLink({
  href,
  className,
  onNavigate,
  children,
}: {
  href: string;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const id = href.startsWith("/#") ? href.slice(2) : null;

  if (!id) {
    return (
      <Link href={href} className={className} onClick={onNavigate}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        onNavigate?.();
        const el = document.getElementById(id);
        // Not on this page: let the browser do a real navigation to /#id.
        if (!el) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        // replaceState, not pushState: the hash should be shareable without
        // every menu press adding a history entry to back out of.
        window.history.replaceState(null, "", href);
      }}
    >
      {children}
    </a>
  );
}
