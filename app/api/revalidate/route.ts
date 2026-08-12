import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

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

type WebhookBody = { _type?: string };

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

  // "max" = stale-while-revalidate. Visitors get the cached page instantly and the
  // refresh happens behind them; the bare one-argument call is deprecated in 16.
  for (const tag of tags) revalidateTag(tag, "max");

  return NextResponse.json({ revalidated: true, type, tags, now: Date.now() });
}
