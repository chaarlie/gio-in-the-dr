/*
  Pull the strings out of every post that still needs a Spanish version.

  Writes one file per post to scripts/i18n/pending/. Each is a flat map of
  plain strings: fill in the right-hand side, then run apply.mjs.

  Usage:  node scripts/i18n/extract.mjs [slug]
*/
import fs from "node:fs";
import path from "node:path";
import { extract } from "./lib.mjs";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "walmnvd1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const OUT = path.join(import.meta.dirname, "pending");

const only = process.argv[2];

/*
  Untranslated, or translated from an older revision of the English. The second
  case is the one that matters over time: Gio edits a published post and the
  Spanish silently stops matching. Comparing sourceRev against the current _rev
  is what turns that into something visible.
*/
const query = `
  *[_type == "post" && language != "es" ${only ? `&& slug.current == "${only}"` : ""}]{
    _id, _rev, title, excerpt, slug, publishedAt, topic, coverImage, body,
    "translation": *[_type == "post" && language == "es" && translationOf._ref == ^._id][0]{ _id, sourceRev }
  }
`;

const url = `https://${PROJECT}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
const { result } = await (await fetch(url)).json();

fs.mkdirSync(OUT, { recursive: true });
let written = 0;

for (const post of result ?? []) {
  const slug = post.slug?.current;
  if (!slug) continue;

  const existing = post.translation;
  const stale = existing && existing.sourceRev !== post._rev;
  if (existing && !stale) {
    console.log(`  ✓ ${slug} — already translated, English unchanged`);
    continue;
  }

  const strings = extract(post);
  // The slug is a string like any other, and translating it is the entire SEO
  // point: Spanish readers search "donde vivir en cabarete", not the English.
  const file = path.join(OUT, `${slug}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify({ _id: post._id, _rev: post._rev, strings }, null, 2) + "\n",
  );
  written++;
  console.log(
    `  ${stale ? "↻" : "+"} ${slug} — ${Object.keys(strings).length} strings` +
      (stale ? " (English changed since last translation)" : ""),
  );
}

console.log(`\n${written} file(s) in scripts/i18n/pending/`);
