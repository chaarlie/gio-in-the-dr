import type { Guide } from "./guide.server";

/*
  Pure helper for the buyer's-guide control, in its own module so both the server
  section (RealEstate360) and the client dialog (GuideDownload) can import it
  without either dragging in the other's dependencies — guide.server pulls the
  Sanity client, which must not reach the browser bundle.
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
