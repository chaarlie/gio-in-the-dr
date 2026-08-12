import Image from "next/image";
import Link from "next/link";
import Badge from "./Badge";
import type { Property } from "../lib/properties";

// Hoisted: identical for every card, and the grid re-renders on every filter change.
// No React Compiler in this project, so static JSX isn't hoisted automatically.
const CARD_GLYPH = (
  <div className="absolute inset-0 flex items-center justify-center text-cream/10">
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5 12 4l8 5.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group relative rounded-2xl overflow-hidden aspect-[5/6] bg-accent no-underline flex flex-col justify-end p-5"
    >
      {/* The glyph is the normal case, not the edge case — most listings have no photo
          yet, and a tinted tile reads better than a broken frame. */}
      {property.image ? (
        <Image
          src={property.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          placeholder={property.lqip ? "blur" : undefined}
          blurDataURL={property.lqip ?? undefined}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        CARD_GLYPH
      )}
      {/* Scrim only when there's a photo underneath the text to fight. */}
      {property.image ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-ink/25"
        />
      ) : null}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
        <Badge variant="glass">{property.category}</Badge>
        <Badge variant="solid">{property.price ?? "Price on request"}</Badge>
      </div>
      <div className="relative text-cream">
        <div className="font-display text-xl font-semibold leading-snug">{property.title}</div>
        <div className="text-cream/80 text-sm mt-1">{property.area}, Dominican Republic</div>
        {property.spec ? (
          <div className="text-cream/60 text-xs mt-2 pt-2.5 border-t border-cream/20">
            {property.spec}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
