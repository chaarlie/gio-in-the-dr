/*
  What is not translated yet, and what has gone stale.

  Two different problems, and only the first is obvious. A document with no
  Spanish is visibly missing. A Spanish document translated from an older
  revision of the English looks finished and is quietly wrong — that is what
  sourceRev exists to catch, and it needs something to actually compare it.

  Reports; never writes. Safe to run in CI or before a deploy.
*/
import { execSync } from "node:child_process";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "walmnvd1";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/*
  Reads drafts as well as published documents, which needs a token.

  Without one this reports a translation that exists but is waiting for review
  as "not translated" — the two are very different states, and conflating them
  would send someone to re-translate work already done.
*/
function token() {
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN;
  try {
    return execSync("npx sanity debug --secrets 2>/dev/null | grep -i 'Auth token:' | awk '{print $3}'")
      .toString().trim();
  } catch {
    return "";
  }
}
const AUTH = token();

async function q(query) {
  const url = `https://${PROJECT}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const { result } = await (await fetch(url, {
    headers: AUTH ? { Authorization: `Bearer ${AUTH}` } : {},
  })).json();
  return result ?? [];
}

/* Posts translate into their own document, so the pair is linked by translationOf. */
const posts = await q(`
  *[_type == "post" && language == "en" && defined(slug.current)]{
    "slug": slug.current, _rev,
    "es": *[_type == "post" && language == "es" && translationOf._ref == ^._id][0]{ sourceRev }
  }
`);

/* Properties translate in place, so the Spanish is a field on the same document. */
const properties = await q(`
  *[_type == "property" && defined(slug.current) && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    "translated": defined(titleEs),
    // A translation waiting for review lives on the draft, not here.
    "inDraft": defined(*[_id == "drafts." + ^._id][0].titleEs)
  }
`);

const untranslatedPosts = posts.filter((p) => !p.es);
const stalePosts = posts.filter((p) => p.es && p.es.sourceRev !== p._rev);
const untranslatedProps = properties.filter((p) => !p.translated && !p.inDraft);
const propsInReview = properties.filter((p) => !p.translated && p.inDraft);

console.log(`\nSpanish coverage`);
console.log(`  posts       ${posts.length - untranslatedPosts.length}/${posts.length}`);
console.log(
  `  properties  ${properties.length - untranslatedProps.length - propsInReview.length}/${properties.length}` +
    // Distinguished on purpose: a translation waiting for Gio is done work,
    // and reporting it as missing sends someone to redo it.
    (propsInReview.length ? `  (+${propsInReview.length} awaiting review)` : ""),
);

if (untranslatedPosts.length) {
  console.log(`\n  no Spanish yet (${untranslatedPosts.length} posts):`);
  untranslatedPosts.forEach((p) => console.log(`    ${p.slug}`));
}
if (untranslatedProps.length) {
  console.log(`\n  no Spanish yet (${untranslatedProps.length} properties):`);
  untranslatedProps.forEach((p) => console.log(`    ${p.slug}`));
}
if (stalePosts.length) {
  console.log(`\n  ⚠ English changed since translating (${stalePosts.length}):`);
  stalePosts.forEach((p) => console.log(`    ${p.slug}`));
  console.log(`\n  Re-extract these — the Spanish is describing an older version.`);
}
console.log();
