import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { searchableText } from "../../lib/properties";
import { phoneticTokens } from "../../lib/phonetic";

/*
  Sanity publishes here; this drops the matching cache tags.

  Without it, an edit in the Studio takes up to the 300s revalidate window to
  appear — fine for a typo, wrong when Gio marks a property sold and it keeps
  showing as available. The revalidate window stays as the safety net for
  anything the webhook misses.

  Signed with SANITY_REVALIDATE_SECRET, checked against the request signature
  rather than a query string, so the endpoint can't be used to hammer
  revalidation from outside.
*/

/** Which tags each document type feeds. Keep in step with the tags in *.server.ts. */
const TAGS: Record<string, string[]> = {
  property: ["properties", "property", "property-slugs", "areas"],
  neighborhood: ["areas"],
  post: ["posts", "post", "post-slugs"],
};

type WebhookBody = { _type?: string; _id?: string };

/*
  Rebuild a property's derived search fields when it is published.

  searchText and searchPhonetic are folded copies of the title, spec, category
  and neighbourhood — they exist because GROQ's match is accent-sensitive, so
  "sosua" cannot be made to match "Sosúa" from the query side. Being derived,
  something has to rewrite them, and publish is the moment the source changed.

  Guarded three ways. It needs a write token, so it is inert until one is
  configured rather than failing every webhook. It only patches when the value
  actually differs, which stops the patch retriggering this webhook forever. And
  it never blocks revalidation: a failed patch leaves stale search text, which is
  worse than fresh but far better than a listing that stays sold-out on the site.
*/
async function refreshSearchFields(id: string): Promise<void> {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!token || !projectId || !dataset) return;

  const base = `https://${projectId}.api.sanity.io/v2024-10-01/data`;
  const query = encodeURIComponent(
    `*[_id == "${id}"][0]{title, spec, category, searchText, searchPhonetic, "area": neighborhood->name}`,
  );

  const read = await fetch(`${base}/query/${dataset}?query=${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!read.ok) return;

  const doc = (await read.json()).result as
    | {
        title?: string;
        spec?: string;
        category?: string;
        area?: string;
        searchText?: string;
        searchPhonetic?: string;
      }
    | null;
  if (!doc) return;

  const raw = [doc.title, doc.spec, doc.category, doc.area].filter(Boolean).join(" ");
  const searchText = searchableText([raw]);
  const searchPhonetic = phoneticTokens(raw).join(" ");
  if (doc.searchText === searchText && doc.searchPhonetic === searchPhonetic) return;

  await fetch(`${base}/mutate/${dataset}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: [{ patch: { id, set: { searchText, searchPhonetic } } }] }),
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let body: WebhookBody | null;
  let isValidSignature: boolean | null;
  try {
    ({ body, isValidSignature } = await parseBody<WebhookBody>(request, secret));
  } catch (error) {
    console.error("[revalidate] could not read webhook body", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const type = body?._type;
  const tags = type ? TAGS[type] : undefined;
  if (!tags) {
    // A type we don't render. Acknowledge it — a 4xx here would show up in
    // Sanity's webhook log as a failure and train everyone to ignore the log.
    return NextResponse.json({ revalidated: false, reason: `Untracked type: ${type}` });
  }

  /*
    Derived search fields first, so the tag drop that follows publishes a page
    built from the new values rather than one that has to wait for the next
    revalidation to pick them up.
  */
  if (type === "property" && body?._id) {
    try {
      await refreshSearchFields(body._id);
    } catch (error) {
      console.error("[revalidate] could not refresh search fields", error);
    }
  }

  // "max" = stale-while-revalidate. Visitors get the cached page instantly and the
  // refresh happens behind them; the bare one-argument call is deprecated in 16.
  for (const tag of tags) revalidateTag(tag, "max");

  return NextResponse.json({ revalidated: true, type, tags, now: Date.now() });
}
