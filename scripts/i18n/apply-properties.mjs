/*
  Patch a property's Spanish fields into its Sanity draft.

  Usage:  node scripts/i18n/apply-properties.mjs <slug>

  A draft, like the blog: this writes drafts.<id>, so the published listing is
  untouched until Gio opens it, reads the Spanish and hits Publish. Machine-
  assisted copy going live unread on a page quoting prices is the failure the
  whole flow exists to prevent.

  Only titleEs and bodyEs are written. Price, beds, coordinates and
  photos are shared, so there is no second copy of them to drift.
*/
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { rebuildProperty } from "./lib.mjs";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "walmnvd1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const slug = process.argv[2];
if (!slug) { console.error("usage: node scripts/i18n/apply-properties.mjs <slug>"); process.exit(1); }

const file = path.join(import.meta.dirname, "pending-properties", `${slug}.json`);
if (!fs.existsSync(file)) { console.error(`no pending file for "${slug}"`); process.exit(1); }

const { _id, strings } = JSON.parse(fs.readFileSync(file, "utf8"));
const empty = Object.entries(strings).filter(([, v]) => !v || !String(v).trim());
if (empty.length) {
  console.error(`${empty.length} string(s) still empty — fill them in first`);
  process.exit(1);
}

const token = process.env.SANITY_API_WRITE_TOKEN
  ?? execSync("npx sanity debug --secrets 2>/dev/null | grep -i 'Auth token:' | awk '{print $3}'").toString().trim();
if (!token) { console.error("no write token"); process.exit(1); }

const q = `*[_id == "${_id}"][0]`;
const url = `https://${PROJECT}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${encodeURIComponent(q)}`;
const { result: source } = await (await fetch(url)).json();
if (!source) { console.error(`property ${_id} not found`); process.exit(1); }

const spanish = rebuildProperty(source, strings);

/*
  createIfNotExists then patch, rather than createOrReplace: the draft may
  already exist with edits of Gio's in it, and replacing it wholesale would throw
  those away. This adds the Spanish fields and leaves everything else alone.
*/
const draftId = `drafts.${_id}`;
const res = await fetch(`https://${PROJECT}.api.sanity.io/v2024-10-01/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    mutations: [
      { createIfNotExists: { ...source, _id: draftId } },
      { patch: { id: draftId, set: spanish } },
    ],
  }),
});
const out = await res.json();
if (out.error) { console.error("failed:", JSON.stringify(out.error).slice(0, 300)); process.exit(1); }

console.log(`  draft updated: ${draftId}`);
console.log(`  titleEs: ${spanish.titleEs}`);
console.log(`  bodyEs : ${spanish.bodyEs.length} blocks`);
