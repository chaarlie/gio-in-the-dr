"use client";

import { useEffect, useState } from "react";
import { preload } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import Lightbox from "./Lightbox";
import { sanityLoader, sizedImage, sizedSrcSet } from "../../lib/sanity-image";
import { formatExactPrice } from "../../lib/format";
import { monthlyHoa } from "../../lib/properties";
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
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);

  const photos = (listing.images ?? []).filter((i) => i.url);

  /*
    Fetch every photo at full-screen size as soon as the property opens, rather
    than when someone taps one. Opening a listing is the strong signal that the
    photos are about to be wanted, and by the time a hand reaches the image the
    bytes are already in the browser cache — so the lightbox paints instantly
    instead of showing the delay you noticed.

    `preload` emits the same srcSet the lightbox's <img> uses, so the browser
    picks one candidate and reuses it. A preload of a URL the img never requests
    is just wasted bandwidth, which is why both go through sizedSrcSet.

    Keyed on the slug: switching properties preloads the new set, and React
    dedupes repeat calls for a URL it has already seen.
  */
  useEffect(() => {
    for (const photo of photos) {
      if (!photo.url) continue;
      preload(sizedImage(photo.url, 1600), {
        as: "image",
        imageSrcSet: sizedSrcSet(photo.url),
        imageSizes: "100vw",
      });
    }
    // photos is rebuilt each render; the slug is what actually identifies the set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.slug]);
  const price = formatExactPrice(listing.priceUsd);
  const hoa = monthlyHoa(listing.hoaAmount, listing.hoaUnit, listing.areaM2);
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

      {photos.length > 0 ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setLightboxAt(0)}
            aria-label={`View photos of ${listing.title} full screen`}
            className="relative block w-full aspect-[4/3] rounded-2xl overflow-hidden bg-accent cursor-zoom-in group"
          >
            <Image
              loader={sanityLoader}
              src={photos[0].url as string}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 390px, 100vw"
              placeholder={photos[0].lqip ? "blur" : undefined}
              blurDataURL={photos[0].lqip ?? undefined}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {photos.length > 1 ? (
              <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 text-cream text-xs font-semibold px-2.5 py-1">
                {photos.length} photos
              </span>
            ) : null}
          </button>

          {photos.length > 1 ? (
            <div className="flex gap-2 mt-2 overflow-x-auto -mx-1 px-1 pb-1">
              {photos.slice(1).map((photo, i) => (
                <button
                  key={photo.url}
                  type="button"
                  onClick={() => setLightboxAt(i + 1)}
                  aria-label={`View photo ${i + 2} of ${listing.title} full screen`}
                  className="relative w-20 h-16 shrink-0 rounded-xl overflow-hidden bg-accent cursor-zoom-in"
                >
                  <Image
                    loader={sanityLoader}
                    src={photo.url as string}
                    alt=""
                    fill
                    sizes="80px"
                    placeholder={photo.lqip ? "blur" : undefined}
                    blurDataURL={photo.lqip ?? undefined}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        /* No photos yet — the same tinted tile the cards use, rather than an
           empty box that reads as a failed image. */
        <div
          className="mt-3 w-full aspect-[4/3] rounded-2xl flex items-center justify-center opacity-55"
          style={{ background: color }}
          aria-hidden="true"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-cream">
            <path
              d="M4 9.5 12 4l8 5.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

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
            {/* Resolved to a monthly figure — the listings quote HOA per m² and
                flat, and $2.09 next to $433 compares nothing. */}
            <Fact
              label="HOA"
              value={hoa !== null ? `$${hoa.toLocaleString("en-US")} / month` : null}
            />
            <Fact
              label="Walk to beach"
              value={listing.walkToBeachMin ? `${listing.walkToBeachMin} min` : null}
            />
          </tbody>
        </table>
      </div>

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

      {lightboxAt !== null ? (
        <Lightbox
          images={photos}
          startIndex={lightboxAt}
          title={listing.title}
          onClose={() => setLightboxAt(null)}
        />
      ) : null}
    </div>
  );
}
