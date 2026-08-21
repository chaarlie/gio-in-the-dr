/*
  Translate the extracted strings with Claude, into the same pending files a
  person would fill in by hand.

  Deliberately not part of the build. Three reasons, all learned the hard way
  elsewhere: a build should be deterministic and an LLM call is not; a build
  runs on every deploy and would re-spend on text that has not changed; and a
  build cannot wait for a human, which is the one thing this pipeline is built
  around. The output is still a draft, and Gio still publishes it.

  Usage:
    node scripts/i18n/translate.mjs posts            all pending posts
    node scripts/i18n/translate.mjs properties       all pending properties
    node scripts/i18n/translate.mjs properties <slug>

  Needs ANTHROPIC_API_KEY in the environment — .env.local is gitignored.
*/
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const KIND = process.argv[2];
const ONLY = process.argv[3];
if (!["posts", "properties"].includes(KIND)) {
  console.error("usage: node scripts/i18n/translate.mjs posts|properties [slug]");
  process.exit(1);
}

const DIR = path.join(import.meta.dirname, KIND === "posts" ? "pending" : "pending-properties");

/*
  The glossary is most of what separates a usable draft from a generic one.

  Without it the same term comes back three different ways across three posts —
  "closing costs" as gastos de cierre, costos de cierre and gastos del cierre —
  and place names get helpfully translated into things nobody searches for.
*/
const SYSTEM = `You translate real-estate copy from English into Spanish for a Dominican Republic audience.

VOICE
- The author is Gio: an Italian woman living in Cabarete, writing in the first person. Warm, direct, personal. Not corporate.
- Use "tú", never "usted". Latin American Spanish, never Peninsular ("acá/aquí", never "vosotros").

NEVER TRANSLATE
- Place names: Cabarete, Sosúa, Kite Beach, Encuentro, Perla Marina, ProCab, Casa Linda, Coccoloba, Seawinds, Ultravioleta, Mareal, Playa Encuentro, Santiago, Santo Domingo.
- Brand and development names, and anything inside a URL.
- "kitesurf", "kite", "padel", "WhatsApp".

GLOSSARY (use these consistently)
- HOA / maintenance fee → mantenimiento
- closing costs → gastos de cierre
- title deed → título de propiedad
- residency → residencia
- down payment → inicial
- condo / apartment → apartamento
- parking space → parqueo
- fully furnished → totalmente amueblado
- brand new → a estrenar
- beachfront → frente al mar
- bedroom → habitación · bathroom → baño

RULES
- Return a JSON object with EXACTLY the same keys you were given, and nothing else.
- Translate the value of every key. Never merge, split, reorder or drop keys.
- Keys look like "b7f2a1.0" — these are fragments of one sentence split across formatting marks. Translate each fragment so that concatenating them in order reads as natural Spanish.
- Preserve leading and trailing spaces exactly as they appear in the source; they are what keeps the fragments apart.
- Keep numbers, prices, measurements and dates exactly as they are. Never convert currencies or units.
- A key whose value is only punctuation or a number comes back unchanged.`;

const client = new Anthropic();

async function translate(strings) {
  /*
    Streamed because a long post runs to ~8k output tokens, and a non-streaming
    request that size risks the SDK's HTTP timeout.

    Server-side fallbacks are on: if a safety classifier declines the request,
    the API re-runs it on a fallback model inside the same call rather than
    handing back a refusal and losing the work.
  */
  const stream = client.beta.messages.stream({
    model: "claude-opus-5",
    max_tokens: 32000,
    system: SYSTEM,
    thinking: { type: "adaptive" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [
      {
        role: "user",
        content: `Translate every value in this JSON object into Spanish. Return only the JSON object.\n\n${JSON.stringify(strings, null, 1)}`,
      },
    ],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error(`declined: ${message.stop_details?.category ?? "unknown"}`);
  }

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // The model is asked for bare JSON, but a stray fence is cheap to survive.
  const json = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  return JSON.parse(json);
}

/*
  Whitespace is re-applied from the source rather than trusted from the model.

  These fragments concatenate around bold and links, so one dropped leading
  space silently glues two words together — and it is invisible in a diff of the
  translation. It corrected 20-36 strings on every document translated by hand.
*/
function restoreWhitespace(src, out) {
  const ws = /^(\s*)([\s\S]*?)(\s*)$/;
  const fixed = {};
  for (const [k, v] of Object.entries(src)) {
    const [, lead, , trail] = v.match(ws);
    const [, , body] = String(out[k] ?? "").match(ws);
    fixed[k] = `${lead}${body}${trail}`;
  }
  return fixed;
}

const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => !ONLY || f === `${ONLY}.json`);

if (!files.length) {
  console.log(`nothing pending in ${DIR}`);
  process.exit(0);
}

let spent = { input: 0, output: 0 };

for (const file of files) {
  const full = path.join(DIR, file);
  const doc = JSON.parse(fs.readFileSync(full, "utf8"));
  const src = doc.strings;

  process.stdout.write(`  ${file.replace(".json", "").slice(0, 52)} — ${Object.keys(src).length} strings … `);
  try {
    const out = await translate(src);

    // Refuse a partial result rather than write a half-Spanish document: two
    // English paragraphs in the middle of a Spanish page are far harder to
    // spot in the Studio than an error here.
    const missing = Object.keys(src).filter((k) => !(k in out) || !String(out[k]).trim());
    if (missing.length) {
      console.log(`✗ ${missing.length} keys missing (${missing.slice(0, 3).join(", ")}…)`);
      continue;
    }

    doc.strings = restoreWhitespace(src, out);
    fs.writeFileSync(full, JSON.stringify(doc, null, 2) + "\n");
    console.log("✓");
  } catch (error) {
    console.log(`✗ ${error instanceof Error ? error.message.slice(0, 70) : error}`);
  }
}

console.log(`\nNow review and apply:`);
console.log(`  node scripts/i18n/apply${KIND === "properties" ? "-properties" : ""}.mjs <slug>`);
