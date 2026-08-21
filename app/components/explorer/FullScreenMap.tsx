"use client";

import { useEffect, useRef } from "react";
import AreaMapbox from "../AreaMapbox";
import type { Area } from "../../lib/areas";
import { useMessages } from "../LocaleProvider";

/*
  The real map, full screen, on small screens only.

  This is where cooperativeGestures comes off. Inline, the map has to leave
  one-finger drag to the page or it swallows the scroll; here it owns the
  viewport, so one finger pans — which is the whole reason for the detour.

  Mounted only while open, so mapbox-gl is imported the first time someone asks
  for a map and never on a phone that just scrolls past.
*/
export default function FullScreenMap({
  areas,
  selected,
  onSelect,
  onOpenListing,
  onClose,
}: {
  areas: Area[];
  selected: string | null;
  onSelect: (slug: string) => void;
  onOpenListing: (slug: string) => void;
  onClose: () => void;
}) {
  const t = useMessages();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    // Remember what opened this so focus can go back to it, then take focus off
    // the page behind — otherwise the first Tab lands somewhere underneath.
    openerRef.current = document.activeElement;
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    /*
      Lock the page behind. Without this the body scrolls under the overlay on
      iOS as soon as a drag reaches the map's edge, and closing drops you
      somewhere else on the page.
    */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.map.mapAria}
      className="fixed inset-0 z-[200] bg-cream flex flex-col overscroll-contain"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-cream"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <p className="font-semibold text-ink truncate min-w-0">
          {areas.find((a) => a.slug === selected)?.name ?? t.home.areasHeading}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.map.closeMap}
          className="shrink-0 w-11 h-11 -mr-1 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* min-h-0 so the map takes the remaining height instead of overflowing the
          column — a flex child's default min-height is its content. */}
      <div className="flex-1 min-h-0">
        <AreaMapbox
          areas={areas}
          selected={selected}
          onSelect={onSelect}
          onOpenListing={onOpenListing}
          fullscreen
        />
      </div>
    </div>
  );
}
