/*
  Warn when the local schema no longer matches the one the Studio is running.

  This exists because of a real failure: titleEs, bodyEs, language,
  translationOf, sourceRev, beachPoint, searchText and searchPhonetic were all
  added to the schema files and committed, and none of them were deployed. Gio's
  Studio showed "Unknown fields found" on documents the scripts had already
  written to, and nobody noticed for days — the site was fine, because the site
  reads the dataset, not the Studio's schema.

  Comparing field names rather than a hash of the whole manifest: the manifest
  carries titles, descriptions and validation shapes that change harmlessly, and
  a check that cries wolf gets ignored. A missing or extra *field* is the thing
  that actually breaks the Studio.
*/
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "walmnvd1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

function token() {
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN;
  try {
    return execSync("npx sanity debug --secrets 2>/dev/null | grep -i 'Auth token:' | awk '{print $3}'")
      .toString().trim();
  } catch {
    return "";
  }
}

/** Field names per document type, from the schema on disk. */
/*
  Everything below can fail for reasons that have nothing to do with the schema:
  no network, no token, devDependencies pruned, `npx sanity` unavailable. This
  runs as postbuild, so an uncaught throw here fails `npm run build` and takes a
  deploy with it — a check whose whole point is that it must never do that.

  So the work is wrapped, and any failure reports itself as a skip.
*/
function local() {
  // `sanity schema extract` writes ./schema.json and ignores --path, so the file
  // is produced in the project root and removed again rather than left behind.
  const out = path.join(process.cwd(), "schema.json");
  const existed = fs.existsSync(out);
  execSync("npx sanity schema extract", { stdio: "pipe" });
  const types = JSON.parse(fs.readFileSync(out, "utf8"));
  if (!existed) fs.unlinkSync(out);
  // The extract format nests fields under `attributes`; the deployed manifest
  // uses `fields`. Same information, different key — this cost me a wrong
  // conclusion once already.
  return Object.fromEntries(
    types
      // sanity.imageAsset and friends are built in — they appear in the extract
      // and not in the manifest, and neither side is wrong about them.
      .filter((t) => t.type === "document" && !t.name.startsWith("sanity."))
      .map((t) => [t.name, Object.keys(t.attributes ?? {}).filter((n) => !n.startsWith("_"))]),
  );
}

/** Field names per document type, from the manifest the Studio deployed. */
async function deployed() {
  const query = encodeURIComponent(`*[_type == "system.schema"][0]`);
  const res = await fetch(
    `https://${PROJECT}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${query}`,
    { headers: { Authorization: `Bearer ${token()}` } },
  );
  const { result } = await res.json();
  if (!result?.schema) return null;
  const types = JSON.parse(result.schema);
  return Object.fromEntries(
    types
      .filter((t) => t.type === "document")
      .map((t) => [t.name, (t.fields ?? []).map((f) => f.name)]),
  );
}

let here;
let there;
try {
  here = local();
  there = await deployed();
} catch (error) {
  console.warn("\n⚠ Schema check SKIPPED — " + (error instanceof Error ? error.message.split("\n")[0].slice(0, 90) : error));
  console.warn("  This is not a pass: the Studio may be running a different schema.\n");
  process.exit(0);
}

if (!there) {
  /*
    Loud about being unable to check, because a silent skip reads exactly like a
    pass. Reading the deployed manifest needs a token, and CI has no `sanity
    login` to fall back on — so without SANITY_API_WRITE_TOKEN in the deploy
    environment this check only ever protects a developer's laptop, which is the
    one place the mistake it catches is easiest to notice anyway.
  */
  console.warn("\n⚠ Schema check SKIPPED — could not read the deployed manifest.");
  console.warn("  Set SANITY_API_WRITE_TOKEN so this runs in CI too.");
  console.warn("  This is not a pass: the Studio may be running a different schema.\n");
  process.exit(0);
}

const problems = [];
for (const [type, fields] of Object.entries(here)) {
  const live = there[type];
  if (!live) {
    problems.push(`  ${type} — document type not deployed`);
    continue;
  }
  const missing = fields.filter((f) => !live.includes(f));
  const extra = live.filter((f) => !fields.includes(f));
  for (const f of missing) problems.push(`  ${type}.${f} — in the code, not in the Studio`);
  for (const f of extra) problems.push(`  ${type}.${f} — in the Studio, removed from the code`);
}

if (!problems.length) {
  console.log("· schema matches the deployed Studio");
  process.exit(0);
}

console.warn("\n⚠ The Studio is running a different schema to this code:\n");
problems.forEach((p) => console.warn(p));
console.warn("\n  Editors will see \"Unknown fields found\" on affected documents.");
console.warn("  Fix with: npx sanity deploy\n");
// A warning, not a failure: the site reads the dataset and is unaffected, so
// blocking a build on this would punish the wrong thing.
process.exit(0);
