"use client";

import Link from "next/link";
import PropertyGallery from "../PropertyGallery";
import PropertyCalculators from "../PropertyCalculators";
import { formatExactPrice } from "../../lib/format";
import { waLink } from "../../lib/whatsapp";
import type { AreaListing } from "../../lib/areas";

/*
  One listing's full details, inside the explorer panel.

  This is the view a map pin now opens. Before, a pin selected the neighbourhood
  and the property itself was unreachable — the price, the HOA and the photos
  existed in Sanity and had nowhere to surface short of the standalone page.

  The standalone /properties/<slug> page is still the canonical, indexable one;
  this is the browse-without-leaving-the-map version, and it links there.
*/

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <tr className="border-b border-line/60 last:border-0">
      <th scope="row" className="text-left font-normal text-muted py-2 pr-3 whitespace-nowrap">
        {label}
      </th>
      <td className="text-right font-semibold text-ink tabular-nums py-2">{value}</td>
    </tr>
  );
}

export default function ListingDetail({
  listing,
  color,
  areaName,
  onBack,
}: {
  listing: AreaListing;
  color: string;
  areaName: string;
  onBack: () => void;
}) {

  const price = formatExactPrice(listing.priceUsd);
  const perM2 =
    listing.priceUsd && listing.areaM2
      ? `$${Math.round(listing.priceUsd / listing.areaM2).toLocaleString("en-US")}`
      : null;

  const message = `Hi Gio, I'm interested in ${listing.title} in ${areaName}${
    price ? ` (${price})` : ""
  }.`;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink transition-colors touch-manipulation"
      >
        ← Back to list
      </button>

      {/* Shared with /properties/<slug> — same carousel, same lightbox, so the
          two views of a property cannot drift apart again. */}
      <PropertyGallery
        images={listing.images}
        title={listing.title}
        sizes="(min-width: 1024px) 390px, 100vw"
        fallbackColor={color}
        className="mt-3"
      />

      <div className="mt-4">
        {listing.category ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {listing.category}
          </p>
        ) : null}
        <h3 className="font-display text-xl font-semibold text-ink leading-snug mt-1 text-pretty">
          {listing.title}
        </h3>
        <p className="flex items-center gap-1.5 mt-1.5">
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-[2px] shrink-0"
            style={{ background: color }}
          />
          <span className="text-xs text-muted">{areaName}</span>
        </p>
        <p className="font-display text-2xl font-bold text-ink mt-3">
          {price ?? "Price on request"}
        </p>
        {listing.spec ? (
          <p className="text-sm text-muted mt-1.5 text-pretty">{listing.spec}</p>
        ) : null}
      </div>

      <div className="mt-3 -mx-1 px-1 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">Key facts for {listing.title}</caption>
          <tbody>
            <Fact label="Bedrooms" value={listing.beds !== null ? String(listing.beds) : null} />
            <Fact label="Bathrooms" value={listing.baths !== null ? String(listing.baths) : null} />
            <Fact label="Interior area" value={listing.areaM2 ? `${listing.areaM2} m²` : null} />
            <Fact label="Price per m²" value={perM2} />
          </tbody>
        </table>
      </div>

      {/* HOA and the walk to the sand moved out of the table and into their own
          panels: both are things a buyer works out rather than reads off. */}
      <PropertyCalculators
        hoaAmount={listing.hoaAmount}
        hoaUnit={listing.hoaUnit}
        areaM2={listing.areaM2}
        location={listing.location}
        beachPoint={listing.beachPoint}
        walkToBeachMin={listing.walkToBeachMin}
        areaName={areaName}
        className="mt-4 sm:grid-cols-1"
      />

      <div className="flex flex-col gap-2 mt-4">
        <a
          href={waLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-6 py-3.5 rounded-full transition-colors no-underline"
        >
          Ask Gio about this
        </a>
        {listing.slug ? (
          <Link
            href={`/properties/${listing.slug}`}
            className="text-center border border-ink/20 hover:border-ink text-ink text-sm font-semibold px-6 py-3.5 rounded-full transition-colors no-underline"
          >
            Full details page
          </Link>
        ) : null}
        {listing.sourceUrl ? (
          <a
            href={listing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-xs font-semibold text-muted hover:text-ink transition-colors mt-1"
          >
            Listing on the brokerage site ↗
          </a>
        ) : null}
      </div>

    </div>
  );
}
