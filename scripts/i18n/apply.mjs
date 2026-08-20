/*
  Turn a filled-in pending file into a Spanish draft in Sanity.

  Usage:  node scripts/i18n/apply.mjs <slug> [--publish]

  A draft, not a published document, and that is the point: the translation is a
  first pass. Gio opens it in the Studio, fixes what reads stiff, and publishes.
  Machine-assisted Spanish going live unread on a site that makes tax and
  residency claims is the failure this design exists to prevent.
*/
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { rebuild, draftId } from "./lib.mjs";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "walmnvd1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: node scripts/i18n/apply.mjs <slug>");
  process.exit(1);
}

const file = path.join(import.meta.dirname, "pending", `${slug}.json`);
if (!fs.existsSync(file)) {
  console.error(`no pending file for "${slug}" — run extract.mjs first`);
  process.exit(1);
}

const { _id, _rev, strings } = JSON.parse(fs.readFileSync(file, "utf8"));

/*
  Refuse rather than half-translate. A document where two paragraphs are still
  English reads as broken, and it is far harder to spot in the Studio than an
  error here.
*/
const untranslated = Object.entries(strings).filter(([, v]) => !v || !String(v).trim());
if (untranslated.length) {
  console.error(`${untranslated.length} string(s) still empty — fill them in first:`);
  untranslated.slice(0, 5).forEach(([k]) => console.error(`   ${k}`));
  process.exit(1);
}

const token = process.env.SANITY_API_WRITE_TOKEN
  ?? execSync("npx sanity debug --secrets 2>/dev/null | grep -i 'Auth token:' | awk '{print $3}'")
      .toString().trim();
if (!token) {
  console.error("no write token — set SANITY_API_WRITE_TOKEN or run `npx sanity login`");
  process.exit(1);
}

// Fetch the English fresh rather than trusting the pending file: it may be
// hours old, and rebuild() copies structure straight off this document.
const query = `*[_id == "${_id}"][0]{_id, _rev, title, excerpt, slug, publishedAt, topic, coverImage, body}`;
const url = `https://${PROJECT}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
const { result: source } = await (await fetch(url)).json();
if (!source) {
  console.error(`English post ${_id} not found`);
  process.exit(1);
}
if (source._rev !== _rev) {
  console.warn(`  ! English changed since extract (${_rev} -> ${source._rev}).`);
  console.warn("    Re-run extract.mjs to pick up the new text, or continue knowing this is behind.");
}

const doc = { ...rebuild(source, strings), _id: draftId(strings.slug ?? slug) };

const res = await fetch(`https://${PROJECT}.api.sanity.io/v2024-10-01/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: [{ createOrReplace: doc }] }),
});
const out = await res.json();

if (out.error) {
  console.error("failed:", JSON.stringify(out.error).slice(0, 300));
  process.exit(1);
}
console.log(`  draft created: ${doc._id}`);
console.log(`  slug: /es/blog/${doc.slug.current}`);
console.log(`  ${doc.body.length} blocks, structure copied from ${source._rev}`);
