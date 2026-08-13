"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ListingImage } from "../../lib/areas";

/*
  Full-bleed photo viewer.

  A property photo is the thing a buyer actually wants to look at, and the
  explorer panel is 390px wide — so the images get the whole viewport instead.

  Behaves like a dialog because it is one: Escape closes, arrows move, focus is
  trapped inside while open and returned to whatever opened it on close, and the
  page behind doesn't scroll. Rendered inline rather than through a portal — it's
  `fixed inset-0` at a high z-index, so it covers the viewport regardless of where
  it sits in the tree, and staying in the tree keeps focus restoration simple.
*/

export default function Lightbox({
  images,
  startIndex,
  title,
  onClose,
}: {
  images: ListingImage[];
  startIndex: number;
  title: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Whatever had focus when we opened — focus goes back there on close.
  const openerRef = useRef<HTMLElement | null>(null);

  const count = images.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    // Lock the page. Compensating for the scrollbar's width stops the layout
    // behind from jumping sideways as it disappears.
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      openerRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        return;
      }
      // Focus trap: keep Tab inside the dialog rather than letting it walk the
      // page underneath, which a screen reader user can't see is still there.
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, onClose]);

  // Horizontal swipe on touch. Threshold is generous enough that a vertical
  // scroll attempt doesn't register as a swipe.
  const touchX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  }

  const current = images[index];
  if (!current?.url) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photo ${index + 1} of ${count}`}
      className="fixed inset-0 z-[200] bg-ink/95 flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between gap-4 p-4 sm:p-5 text-cream shrink-0">
        <p className="text-sm font-semibold truncate min-w-0">{title}</p>
        <div className="flex items-center gap-4 shrink-0">
          {count > 1 ? (
            <span className="text-sm tabular-nums text-cream/70">
              {index + 1} / {count}
            </span>
          ) : null}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close photo viewer"
            className="rounded-full w-10 h-10 flex items-center justify-center bg-cream/10 hover:bg-cream/20 transition-colors text-lg"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Backdrop click closes. The image sits in its own element above it so
          clicking the photo itself doesn't dismiss what you're looking at. */}
      <button
        type="button"
        aria-label="Close photo viewer"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out"
      />

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          <Image
            key={current.url}
            src={current.url}
            alt={`${title} — photo ${index + 1}`}
            fill
            sizes="100vw"
            placeholder={current.lqip ? "blur" : undefined}
            blurDataURL={current.lqip ?? undefined}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-xl flex items-center justify-center transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-xl flex items-center justify-center transition-colors"
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
