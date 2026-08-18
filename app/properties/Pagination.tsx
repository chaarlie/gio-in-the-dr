import Link from "next/link";

/*
  Page links, as links.

  Real <a>s carrying the current filters, so cmd-click and middle-click open a
  page in a tab, the address bar always describes what is on screen, and a
  crawler can walk the whole inventory — which a button that mutates client state
  gives none of. rel prev/next tells it which direction it is walking.
*/

/** 1 … 4 5 6 … 12 — a window around the current page, never more than 7 slots. */
function pageNumbers(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const around = [page - 1, page, page + 1].filter((n) => n > 1 && n < count);
  const out: (number | "gap")[] = [1];
  if (around[0] > 2) out.push("gap");
  out.push(...around);
  if (around[around.length - 1] < count - 1) out.push("gap");
  out.push(count);
  return out;
}

export default function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  /** Builds a URL for a page while preserving the active filters. */
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const slots = pageNumbers(page, pageCount);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-10">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className="flex items-center justify-center min-w-11 h-11 px-4 rounded-full border border-line text-sm font-semibold text-ink hover:bg-ink/5 transition-colors no-underline"
        >
          ←
        </Link>
      ) : null}

      {slots.map((slot, i) =>
        slot === "gap" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={slot}
            href={hrefFor(slot)}
            aria-label={`Page ${slot}`}
            // aria-current tells a screen reader which page it is on; the ring
            // is only the sighted half of the same fact.
            aria-current={slot === page ? "page" : undefined}
            className={`flex items-center justify-center min-w-11 h-11 px-3 rounded-full text-sm font-semibold tabular-nums transition-colors no-underline ${
              slot === page
                ? "bg-accent text-cream"
                : "border border-line text-ink hover:bg-ink/5"
            }`}
          >
            {slot}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          aria-label="Next page"
          className="flex items-center justify-center min-w-11 h-11 px-4 rounded-full border border-line text-sm font-semibold text-ink hover:bg-ink/5 transition-colors no-underline"
        >
          →
        </Link>
      ) : null}
    </nav>
  );
}
