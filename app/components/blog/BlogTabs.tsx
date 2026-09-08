"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/*
  The blog index's category strip.

  These are real links now, not a client-side filter: each tab points at its
  archive (/blog or /blog/topic/<slug>), the active one is decided by the server
  from the URL, and the grid below is one page of posts filtered in GROQ. That is
  what lets the index scale to hundreds of posts — only a page's worth is ever
  fetched or shipped — where the old "render every card and hide most" approach
  did not.

  The sliding underline stays. Navigation re-renders the server component, so the
  active tab arrives as a prop and the underline settles under it; a click also
  sets the active tab optimistically, so the bar slides immediately rather than
  waiting for the new page. Its transition is flattened for reduced-motion by the
  global rule in globals.css.
*/
type Tab = { slug: string; href: string; label: string };

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function BlogTabs({
  tabs,
  activeSlug,
  ariaLabel,
}: {
  tabs: Tab[];
  /** Which tab the current URL resolves to ("all" for the unfiltered index). */
  activeSlug: string;
  ariaLabel: string;
}) {
  // Optimistic: seeded by the server's answer, nudged on click so the underline
  // moves at once. When the navigation lands, activeSlug changes and this resets
  // to match — the render-phase "adjust state when a prop changes" pattern, so no
  // effect and no cascading render.
  const [active, setActive] = useState(activeSlug);
  const [seenSlug, setSeenSlug] = useState(activeSlug);
  if (activeSlug !== seenSlug) {
    setSeenSlug(activeSlug);
    setActive(activeSlug);
  }

  const stripRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const btn = stripRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    const indicator = indicatorRef.current;
    if (btn && indicator) {
      indicator.style.width = `${btn.offsetWidth}px`;
      indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    btn?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest", inline: "nearest" });
  }, [active]);

  return (
    <nav
      ref={stripRef}
      aria-label={ariaLabel}
      className="relative flex gap-1 mt-10 md:mt-12 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const on = tab.slug === active;
        return (
          <Link
            key={tab.slug}
            href={tab.href}
            data-tab={tab.slug}
            // These navigate to separate archive URLs, so they are links with
            // aria-current — not the ARIA tabs pattern, which implies a panel and
            // arrow-key movement that don't exist here.
            aria-current={on ? "page" : undefined}
            onClick={() => setActive(tab.slug)}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors no-underline ${
              on ? "text-ink" : "text-muted hover:text-ink hover:bg-ink/5"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-accent transition-[transform,width] duration-300 ease-out"
      />
    </nav>
  );
}
