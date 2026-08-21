import { formatPrice } from "./format";
import { monthlyHoa } from "./properties";
import { MESSAGES } from "./messages";
import type { Locale } from "./i18n";

/*
  The one-line summary under a listing's title, built from the structured fields
  rather than typed into one.

  It used to be a hand-written string:

    "$385,000 | 98 m² | 2 Bedrooms | 2 Bathrooms | … HOA $2.09/m² …"

  next to priceUsd 385000, areaM2 98, beds 2, baths 2, hoaAmount 230. Five
  values with two copies each, and changing the price meant editing three
  places — three once the Spanish translation added its own copy. It had already
  drifted: that listing's structured HOA is $230/month flat while its typed spec
  claims $2.09/m², which is $205. Two numbers, both published, both wrong for
  half the readers.

  Derived, there is one of each. And it translates for free — the numbers are
  numbers and only the labels come from the catalogue, so specEs stops existing.
*/

type SpecSource = {
  priceUsd?: number | null;
  areaM2?: number | null;
  beds?: number | null;
  baths?: number | null;
  hoaAmount?: number | null;
  hoaUnit?: string | null;
};

/** "$385K · 98 m² · 2 habitaciones · 2 baños · $230/mes" */
export function formatSpec(p: SpecSource, locale: Locale = "en"): string | null {
  const t = MESSAGES[locale].properties;
  const parts: string[] = [];

  const price = formatPrice(p.priceUsd ?? null);
  if (price) parts.push(price);
  if (p.areaM2) parts.push(`${p.areaM2} m²`);

  /*
    Zero is a real answer for a studio, so the check is on null rather than
    falsiness — `beds: 0` must still print, and land with no bedroom count
    must still be omitted.
  */
  if (p.beds !== null && p.beds !== undefined) {
    parts.push(`${p.beds} ${p.beds === 1 ? t.bedroom : t.bedroomsShort}`);
  }
  if (p.baths !== null && p.baths !== undefined) {
    parts.push(`${p.baths} ${p.baths === 1 ? t.bathroom : t.bathroomsShort}`);
  }

  // Through monthlyHoa, so the implausible-rate guard applies here too rather
  // than this becoming a second place that can print $70,414 a month.
  const hoa = monthlyHoa(p.hoaAmount ?? null, p.hoaUnit ?? null, p.areaM2 ?? null);
  if (hoa !== null) parts.push(`$${hoa.toLocaleString("en-US")}${t.perMonthShort}`);

  return parts.length ? parts.join(" · ") : null;
}
