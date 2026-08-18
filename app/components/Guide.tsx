import Image from "next/image";
import { sizedImage } from "../lib/sanity-image";
import type { Guide } from "../lib/guide.server";

/*
  The buyer's guide, in two pieces: the first page as the section's image, and
  the download itself as a centred control below both columns.

  They're split rather than combined because the download used to sit on top of
  the page image, covering the bottom third of it. Underneath and centred, the
  page is fully visible and the call to action reads as belonging to the whole
  section rather than to the picture.

  Both take the already-fetched document instead of fetching their own, so the
  two halves can't disagree about whether there's a guide to show, and the
  section makes one query rather than two.
*/

/** Bytes to the size shown on the control. */
function readableSize(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / 1_000_000;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

/** Format · size · page count, as shown under the title. */
export function guideMeta(guide: Guide): string {
  return [
    guide.pages ? `${guide.pages} pages` : null,
    guide.extension ? guide.extension.toUpperCase() : null,
    readableSize(guide.size),
  ]
    .filter(Boolean)
    .join(" · ");
}

/*
  Sanity's `?dl=` parameter, not HTML's `download` attribute: the asset is on
  cdn.sanity.io, and browsers ignore `download` on a cross-origin href — the PDF
  would open in a tab instead. `?dl=` makes Sanity send
  Content-Disposition: attachment, which actually downloads it.
*/
function downloadHref(guide: Guide, slug: string): string {
  const filename = guide.filename ?? `${slug}.${guide.extension ?? "pdf"}`;
  return `${guide.url}?dl=${encodeURIComponent(filename)}`;
}

/** The first page, filling the section's image column. */
export function GuideCover({ guide, slug }: { guide: Guide | null; slug: string }) {
  if (!guide?.url) return null;
  const cover = guide.cover?.url ? guide.cover : null;

  return (
    <a
      href={downloadHref(guide, slug)}
      tabIndex={-1}
      aria-hidden="true"
      className="group relative block rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-panel to-surface no-underline"
    >
      {cover ? (
        /*
          object-cover anchored to the top, not contain. The page is portrait
          (1130×1600) and this frame is 4:3, so containing it left a band of dead
          background down both sides — a small picture in a big empty box.

          Covering crops the bottom: roughly the first 53% survives, which is the
          masthead, the headline and the coastline photo. What's cut is body copy
          too small to read at this size anyway.

          The URL is sized here rather than through `loader`. This is a server
          component, and a loader is a function — passing one to next/image,
          which is a client component, fails the build outright. `unoptimized`
          then keeps the bytes coming from Sanity's edge, already resized and
          cached, rather than routing a 793 KB PNG through Next's optimizer. The
          blur placeholder still works; it renders from the LQIP data URI.
        */
        <Image
          src={sizedImage(cover.url as string, 1200)}
          alt={cover.alt ?? `First page of ${guide.title}`}
          fill
          sizes="(min-width: 1024px) 620px, 100vw"
          placeholder={cover.lqip ? "blur" : undefined}
          blurDataURL={cover.lqip ?? undefined}
          unoptimized
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        /* No cover uploaded — a document mark rather than a house glyph, which
           reads as a photo that failed to load. */
        <span className="absolute inset-0 flex items-center justify-center text-muted/40">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </a>
  );
}

/*
  The download control, centred beneath both columns.

  This is the section's only real link — the cover above is aria-hidden and
  removed from the tab order, so the same destination isn't announced twice to a
  screen reader or stopped at twice on the way through the page.
*/
export function GuideButton({ guide, slug }: { guide: Guide | null; slug: string }) {
  if (!guide?.url) return null;
  const meta = guideMeta(guide);

  return (
    <div className="mt-10 flex justify-center">
      <a
        href={downloadHref(guide, slug)}
        className="group inline-flex items-center gap-4 bg-accent hover:bg-accent-soft text-cream rounded-2xl px-6 py-4 sm:px-7 sm:py-5 transition-colors no-underline touch-manipulation max-w-full"
      >
        <span aria-hidden="true" className="shrink-0">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4v11m0 0 3.4-3.4M12 15l-3.4-3.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <span className="min-w-0 text-left">
          <span className="block font-display text-xl font-bold leading-tight">
            {guide.title}
          </span>
          {/* Format and weight before the tap, not after — a 2.8 MB download on
              Dominican mobile data is worth stating up front. */}
          <span className="block text-cream/80 text-sm mt-0.5 text-pretty">
            {guide.description ?? "Free download"}
            {meta ? ` — ${meta}` : ""}
          </span>
        </span>
      </a>
    </div>
  );
}
