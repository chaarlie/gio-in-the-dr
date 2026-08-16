"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import Image from "next/image";
import Lightbox from "./explorer/Lightbox";
import {
  sanityLoader,
  sizedImage,
  sizedSrcSet,
  type GalleryImage,
} from "../lib/sanity-image";

/*
  One property's photos, as a swipeable carousel that opens a lightbox.

  Shared by both places a property is shown: the explorer panel a map pin opens,
  and the standalone /properties/<slug> page. They had drifted — the panel got a
  carousel and a lightbox, the page kept a static grid where the photos did
  nothing at all when clicked. Same photos, same query fields, two behaviours,
  and the page is the canonical one.

  Built on scroll-snap rather than a transform track: swipe, trackpad, shift-
  wheel and the scrollbar all work for free, momentum feels native on iOS, and
  there is no drag maths to get wrong. The arrows just scroll the container.
*/

/** Rounded to the nearest slide — clientWidth is one slide, since each is w-full. */
function slideIndex(el: HTMLElement) {
  return el.clientWidth > 0 ? Math.round(el.scrollLeft / el.clientWidth) : 0;
}

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={back ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PropertyGallery({
  images,
  title,
  sizes = "100vw",
  priority = false,
  aspect = "aspect-[4/3]",
  fallbackColor,
  className = "",
}: {
  images: GalleryImage[] | null;
  title: string;
  /** next/image `sizes` for the main slide — the two surfaces are very different widths. */
  sizes?: string;
  /** Set on the canonical page, where the lead photo is the LCP element. */
  priority?: boolean;
  aspect?: string;
  /** Tint for the empty state, so a listing with no photos still looks finished. */
  fallbackColor?: string;
  className?: string;
}) {
  const photos = (images ?? []).filter((i) => i.url);
  const count = photos.length;

  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);

  /*
    Fetch every photo at full-screen size as soon as the gallery mounts, rather
    than when someone taps one. Arriving at a property is the strong signal the
    photos are about to be wanted, and by the time a hand reaches the image the
    bytes are already cached, so the lightbox paints instantly.

    `preload` emits the same srcSet the lightbox's <img> uses, so the browser
    picks one candidate and reuses it — a preload of a URL the img never requests
    is only wasted bandwidth, which is why both go through sizedSrcSet.
  */
  const urls = photos.map((p) => p.url).join("|");
  useEffect(() => {
    for (const url of urls.split("|")) {
      if (!url) continue;
      preload(sizedImage(url, 1600), {
        as: "image",
        imageSrcSet: sizedSrcSet(url),
        imageSizes: "100vw",
      });
    }
  }, [urls]);

  const goTo = useCallback((to: number) => {
    const el = scroller.current;
    if (!el) return;
    const target = Math.max(0, Math.min(el.children.length - 1, to));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
  }, []);

  /*
    Index follows the scroll position rather than being driven by the buttons, so
    a swipe, a trackpad flick and an arrow tap all agree on where we are. rAF-
    gated because scroll fires far more often than the counter can change.
  */
  const ticking = useRef(false);
  function onScroll() {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const el = scroller.current;
      if (el) setIndex(slideIndex(el));
    });
  }

  if (count === 0) {
    return (
      /* No photos yet — a tinted tile with the house glyph, not an empty box
         that reads as a failed image. Most listings start here. */
      <div
        className={`${aspect} w-full rounded-2xl flex items-center justify-center opacity-55 ${className}`}
        style={{ background: fallbackColor ?? "var(--color-panel)" }}
        aria-hidden="true"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-cream">
          <path
            d="M4 9.5 12 4l8 5.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={scroller}
          onScroll={onScroll}
          /* snap-mandatory keeps a slide edge-aligned after a flick;
             overscroll-x-contain stops a swipe past the last photo turning into
             a browser back-gesture on iOS. */
          className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain scrollbar-none rounded-2xl"
        >
          {photos.map((photo, i) => (
            <button
              key={photo.key ?? `${photo.url}-${i}`}
              type="button"
              onClick={() => setLightboxAt(i)}
              aria-label={`View photo ${i + 1} of ${count} of ${title} full screen`}
              className={`relative ${aspect} w-full shrink-0 snap-start bg-accent cursor-zoom-in`}
            >
              <Image
                loader={sanityLoader}
                src={photo.url as string}
                alt={photo.alt ?? (i === 0 ? title : "")}
                fill
                sizes={sizes}
                // Only the first photo of the canonical page is the LCP candidate;
                // the rest stay lazy so a 23-photo gallery isn't 23 eager requests.
                priority={priority && i === 0}
                placeholder={photo.lqip ? "blur" : undefined}
                blurDataURL={photo.lqip ?? undefined}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {count > 1 ? (
          <>
            {/* Arrows are pointer affordances; touch users swipe. Kept in the tab
                order so the carousel is reachable without a pointer at all. */}
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/90 text-ink flex items-center justify-center shadow-md transition-opacity disabled:opacity-0 hover:bg-cream"
            >
              <Chevron back />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === count - 1}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/90 text-ink flex items-center justify-center shadow-md transition-opacity disabled:opacity-0 hover:bg-cream"
            >
              <Chevron />
            </button>

            {/* aria-live so the count is announced as you move, not just seen. */}
            <p
              aria-live="polite"
              className="absolute bottom-2 right-2 rounded-full bg-ink/70 text-cream text-xs font-semibold px-2.5 py-1 tabular-nums"
            >
              {index + 1} / {count}
            </p>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="flex gap-2 mt-2 overflow-x-auto overscroll-x-contain -mx-1 px-1 pb-1 scrollbar-none">
          {photos.map((photo, i) => (
            <button
              key={photo.key ?? `${photo.url}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index}
              className={`relative w-20 h-16 shrink-0 rounded-xl overflow-hidden bg-accent transition-opacity ${
                i === index ? "opacity-100 ring-2 ring-ink" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                loader={sanityLoader}
                src={photo.url as string}
                alt=""
                fill
                sizes="80px"
                placeholder={photo.lqip ? "blur" : undefined}
                blurDataURL={photo.lqip ?? undefined}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxAt !== null ? (
        <Lightbox
          images={photos}
          startIndex={lightboxAt}
          title={title}
          onClose={() => setLightboxAt(null)}
        />
      ) : null}
    </div>
  );
}
