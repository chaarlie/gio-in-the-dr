import { extractHeadings } from "../lib/headings";
import { MESSAGES, type Locale } from "../lib/i18n";
import type { PortableBlocks } from "./PortableBody";

/*
  The index for a long guide.

  These run to twenty-odd sections — "Where to live in Cabarete" alone has 22 —
  and a reader arriving from search usually wants one of them, not the whole
  thing from the top. Without this the only way to find it is to scroll and
  skim, which on a phone is most of the article.

  h2 only. Nesting the h3s doubles the length of the list to show sub-points
  like "I wouldn't choose it if you:", which mean nothing out of context and
  push the actual sections off the screen. The h3s still get ids, so a deep link
  to one works even though nothing here points at it.
*/

/** Below this a guide is short enough to skim, and a contents list is furniture. */
const MIN_SECTIONS = 4;

export default function TableOfContents({
  value,
  locale = "en",
}: {
  value: PortableBlocks;
  locale?: Locale;
}) {
  const headings = extractHeadings(value).filter((h) => h.level === 2);
  if (headings.length < MIN_SECTIONS) return null;

  return (
    <nav
      aria-labelledby="contents-heading"
      className="mt-10 bg-card border border-line rounded-2xl p-6"
    >
      <h2
        id="contents-heading"
        className="text-xs font-semibold uppercase tracking-[0.18em] text-muted"
      >
        {MESSAGES[locale].inThisGuide}
      </h2>
      {/*
        A real list, so a screen reader announces how many sections there are
        before reading them — the one thing this is for is deciding whether to
        jump, and that decision needs the count.
      */}
      <ol className="mt-4 space-y-2.5 list-none">
        {headings.map((h, i) => (
          <li key={h.id} className="flex gap-3">
            <span aria-hidden="true" className="text-muted text-sm tabular-nums shrink-0 w-5">
              {i + 1}
            </span>
            <a
              href={`#${h.id}`}
              className="text-ink text-[15px] leading-snug no-underline hover:text-accent hover:underline underline-offset-2 transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
