"use client";

import { useEffect, useState } from "react";
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

  /*
    The list ships one thumbnail per listing; the rest arrive when a listing is
    opened, which is one at a time. Starting from the thumbnail means the
    gallery paints immediately with the photo the card already showed, and the
    others slot in behind it — no spinner, no layout jump.

    Keyed on the slug so switching listings drops the previous set rather than
    showing the last property's photos under the new one's title. `ignore`
    covers the race where a fast second click resolves before the first.
  */
  const [gallery, setGallery] = useState<{ slug: string; images: typeof listing.images } | null>(
    null,
  );
  const slug = listing.slug;
  /*
    Tagged with the slug it was fetched for, rather than cleared when the slug
    changes. Resetting state from inside the effect renders once with the
    previous property's photos before the reset lands — deriving it instead means
    the stale set is simply never the one that gets read.
  */
  const loaded = gallery && gallery.slug === slug ? gallery.images : null;

  useEffect(() => {
    if (!slug) return;
    let ignore = false;
    fetch(`/api/listings/${encodeURIComponent(slug)}/images`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!ignore && data?.images?.length) setGallery({ slug, images: data.images });
      })
      .catch(() => {
        // The thumbnail is already on screen; a failed gallery fetch should
        // leave the listing readable rather than blanking it.
      });
    return () => {
      ignore = true;
    };
  }, [slug]);

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
      {/*
        Two ways out, because they read differently. The back link says where you
        land; the ✕ is the shape people reach for to dismiss something that took
        over the panel, and it sits where a close control is expected — top
        right, on its own, not at the end of a sentence.
      */}
      {/*
        Sticky from lg up, because that is where the panel gets its own
        scrollport (lg:overflow-y-auto on a 620px box). The exit control lived
        inside that scroller, so scrolling down the listing took it off the top
        and left no way back to the list without scrolling up again to find one.

        Not sticky below lg: there the panel has no scroller of its own, so this
        would pin against the page viewport and collide with the site header,
        which is already sticky and already covers that corner.

        -mx/px pair lets the background reach the panel's edges while the row's
        contents stay aligned with everything below it.
      */}
      <div className="lg:sticky lg:top-0 lg:z-10 bg-card lg:-mx-1 lg:px-1 lg:pb-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink transition-colors touch-manipulation"
        >
          ← Back to list
        </button>
        <button
          type="button"
          onClick={onBack}
          aria-label={`Close ${listing.title}`}
          className="shrink-0 -mr-1 w-11 h-11 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 transition-colors touch-manipulation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Shared with /properties/<slug> — same carousel, same lightbox, so the
          two views of a property cannot drift apart again. */}
      <PropertyGallery
        images={loaded ?? listing.images}
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
