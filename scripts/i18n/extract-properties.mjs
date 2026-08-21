/*
  Pull the translatable strings out of every property that has no Spanish yet.

  Usage:  node scripts/i18n/extract-properties.mjs [slug]
*/
import fs from "node:fs";
import path from "node:path";
import { extractProperty } from "./lib.mjs";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "walmnvd1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const OUT = path.join(import.meta.dirname, "pending-properties");

const only = process.argv[2];
const query = `
  *[_type == "property" && defined(slug.current) ${only ? `&& slug.current == "${only}"` : ""}]{
    _id, _rev, title, spec, body, titleEs, "slug": slug.current
  }
`;

const url = `https://${PROJECT}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
const { result } = await (await fetch(url)).json();

fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const prop of result ?? []) {
  if (prop.titleEs && !only) {
    console.log(`  ✓ ${prop.slug.slice(0, 52)} — already translated`);
    continue;
  }
  const strings = extractProperty(prop);
  fs.writeFileSync(
    path.join(OUT, `${prop.slug}.json`),
    JSON.stringify({ _id: prop._id, _rev: prop._rev, strings }, null, 2) + "\n",
  );
  n++;
  console.log(`  + ${prop.slug.slice(0, 52)} — ${Object.keys(strings).length} strings`);
}
console.log(`\n${n} file(s) in scripts/i18n/pending-properties/`);
