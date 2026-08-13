import Image from "next/image";
import { formatPrice } from "../../lib/format";
import type { AreaListing } from "../../lib/areas";

/** Photo when Sanity has one, otherwise a tinted tile in the area's colour. */
function ListingThumb({ listing, color }: { listing: AreaListing; color: string }) {
  if (listing.image) {
    return (
      <Image
        src={listing.image}
        alt=""
        width={48}
        height={48}
        sizes="48px"
        className="w-12 h-12 rounded-xl object-cover shrink-0"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center opacity-55"
      style={{ background: color }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-cream">
        <path
          d="M4 9.5 12 4l8 5.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ListingCard({
  listing,
  color,
  areaName,
  showArea = false,
}: {
  listing: AreaListing;
  color: string;
  areaName: string;
  showArea?: boolean;
}) {
  const price = formatPrice(listing.priceUsd);
  const external = Boolean(listing.sourceUrl);

  return (
    <li>
      <a
        href={listing.sourceUrl ?? "#areas"}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="flex items-center gap-3 rounded-2xl bg-surface hover:bg-panel transition-colors p-2.5 no-underline touch-manipulation"
      >
        <ListingThumb listing={listing} color={color} />
        {/* min-w-0 is what lets the long titles actually truncate inside flex */}
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-ink truncate">{listing.title}</span>
            <span className="text-sm font-bold text-ink shrink-0 tabular-nums">
              {price ?? "—"}
            </span>
          </span>
          {listing.spec ? (
            <span className="block text-xs text-muted mt-1 truncate">{listing.spec}</span>
          ) : null}
          {showArea ? (
            <span className="flex items-center gap-1.5 mt-1.5">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-[2px] shrink-0"
                style={{ background: color }}
              />
              <span className="text-xs text-muted truncate">{areaName}</span>
            </span>
          ) : null}
        </span>
      </a>
    </li>
  );
}
