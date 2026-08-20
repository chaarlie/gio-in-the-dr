import { fold } from "./properties";

/*
  Anchors for the headings inside a post, and the list the table of contents
  renders from.

  Both come from one function on one input, deliberately. The obvious version —
  the renderer slugifies as it draws each heading, the contents list slugifies
  again as it draws each link — works right up until two sections share a title,
  and then both produce the same id: the document is invalid, and every link to
  the second one lands on the first. Building the map once means the dedupe is
  decided in a single place and both sides read the same answer.
*/

export type Heading = { id: string; text: string; level: 2 | 3 };

type Block = {
  _key?: string;
  _type?: string;
  style?: string;
  children?: { text?: string }[];
};

/** The plain text of a block — headings can carry marks, which are nodes, not text. */
export function blockText(block: Block): string {
  return (block.children ?? []).map((c) => c.text ?? "").join("").trim();
}

/*
  "1. Downtown Cabarete" -> "s-1-downtown-cabarete". Accents folded so anchors
  stay ASCII, and a leading digit gets an s- prefix.

  That prefix is not cosmetic. These guides number their sections, so most slugs
  would start with a digit — and while HTML accepts such an id and the browser
  scrolls to it, a CSS identifier cannot begin with one. querySelector("#3-...")
  throws outright, taking down any script that touches the heading and any
  :target rule with it.
*/
function slugify(text: string): string {
  const base = fold(text).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return /^[0-9]/.test(base) ? `s-${base}` : base;
}

function isHeading(block: Block): block is Block & { style: "h2" | "h3" } {
  return block._type === "block" && (block.style === "h2" || block.style === "h3");
}

/*
  Every heading's id, keyed by the block's Sanity _key.

  Duplicates get -2, -3 and so on in document order, which is stable as long as
  the sections stay in order — and if they are reordered the anchors move with
  the text, which is the behaviour someone following an old link would want
  anyway.
*/
export function headingIds(blocks: unknown): Map<string, string> {
  const ids = new Map<string, string>();
  if (!Array.isArray(blocks)) return ids;

  const used = new Map<string, number>();
  for (const block of blocks as Block[]) {
    if (!isHeading(block) || !block._key) continue;
    const base = slugify(blockText(block)) || `section-${ids.size + 1}`;
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    ids.set(block._key, seen === 0 ? base : `${base}-${seen + 1}`);
  }
  return ids;
}

/** The headings a contents list shows, in document order. */
export function extractHeadings(blocks: unknown): Heading[] {
  if (!Array.isArray(blocks)) return [];
  const ids = headingIds(blocks);

  return (blocks as Block[])
    .filter((b): b is Block & { style: "h2" | "h3"; _key: string } =>
      isHeading(b) && Boolean(b._key),
    )
    .map((b) => ({
      id: ids.get(b._key) as string,
      text: blockText(b),
      level: b.style === "h2" ? (2 as const) : (3 as const),
    }))
    .filter((h) => h.text.length > 0);
}
