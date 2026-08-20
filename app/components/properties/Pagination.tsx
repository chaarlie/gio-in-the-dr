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
  onSelect,
  labels,
}: {
  page: number;
  pageCount: number;
  /** Builds a URL for a page while preserving the active filters. */
  hrefFor: (page: number) => string;
  /*
    Present when the pager drives client state instead of navigating — the home
    page holds every listing already, so changing page there is a slice, not a
    request. The href stays on the element regardless, so the URL is still
    shareable and middle-click still opens a real page.
  */
  onSelect?: (page: number) => void;
  /*
    Labels as a prop, not a hook.

    This renders from both sides — the server /properties page and the client
    home grid — so it cannot call useMessages (server) and cannot be marked
    "use client" either, because the server page passes hrefFor, and a function
    cannot cross the server/client boundary. Taking strings as props is the only
    shape that works from either parent.
  */
  labels: { previous: string; next: string; pagination: string };
}) {
  if (pageCount <= 1) return null;

  const slots = pageNumbers(page, pageCount);

  return (
    <nav aria-label={labels.pagination} className="flex items-center justify-center gap-1.5 mt-10">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          onClick={onSelect ? (e) => { e.preventDefault(); onSelect(page - 1); } : undefined}
          rel="prev"
          aria-label={labels.previous}
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
            onClick={onSelect ? (e) => { e.preventDefault(); onSelect(slot); } : undefined}
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
          onClick={onSelect ? (e) => { e.preventDefault(); onSelect(page + 1); } : undefined}
          rel="next"
          aria-label={labels.next}
          className="flex items-center justify-center min-w-11 h-11 px-4 rounded-full border border-line text-sm font-semibold text-ink hover:bg-ink/5 transition-colors no-underline"
        >
          →
        </Link>
      ) : null}
    </nav>
  );
}
