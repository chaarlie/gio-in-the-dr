"use client";

import { staticMapUrl } from "../../lib/static-map";
import type { Area } from "../../lib/areas";
import { useMessages } from "../LocaleProvider";

/*
  The small-screen stand-in for the map.

  A background-image, not an <img>, and that is deliberate: this sits inside a
  `lg:hidden` wrapper, and a background on a display:none element is specified as
  never fetched. `loading="lazy"` on a hidden <img> is only *usually* skipped —
  Chrome and Safari skip it, Firefox has historically not — so the background is
  the version with a guarantee that desktop never pays for it.
*/
export default function StaticMapPreview({
  areas,
  onOpen,
}: {
  areas: Area[];
  onOpen: () => void;
}) {
  const t = useMessages();
  /*
    Sized close to the box it renders in — 240px tall, full-bleed, so roughly a
    phone's width. `cover` crops whatever doesn't match, and the wider the
    request the more it takes off the sides: at 640 wide into a 390 box that was
    39% of the image gone, which cut areas off the edges.

    The generous padding in staticMapUrl's fit keeps the boundaries clear of the
    frame, so what cropping remains lands on empty ground rather than on an area.

    Over-requesting is also paid in full — Mapbox returns PNG with no format
    negotiation, and the same overlay is 311 KB at 720x420@2x against 67 KB here.
    A phone spending more on a picture of a map than it saved on mapbox-gl would
    defeat the point of this component.
  */
  const url = staticMapUrl(areas, { width: 430, height: 240, padding: 40 });

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t.map.openFullScreen}
      className="group relative block w-full h-[240px] overflow-hidden border-y border-line bg-surface text-left"
      style={url ? { backgroundImage: `url("${url}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {/* Scrim: the label sits over a pale map, and pale-on-pale is unreadable. */}
      <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/55 to-transparent" />

      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
        <span className="min-w-0">
          <span className="block text-cream font-semibold leading-tight">
            {t.map.exploreMap}
          </span>
          <span className="block text-cream/80 text-sm leading-tight mt-0.5">
            {t.map.areasAround(areas.length)}
          </span>
        </span>
        {/* The affordance has to look like a control — the whole card is the hit
            target, but a flat image with a caption reads as decoration. */}
        <span className="shrink-0 flex items-center gap-1.5 rounded-full bg-cream text-ink text-sm font-semibold px-4 h-11">
          {t.common.open}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 3H3v6M15 21h6v-6M21 3l-7 7M3 21l7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </button>
  );
}
