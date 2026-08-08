import { waLink } from "../lib/whatsapp";
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

// Links to WhatsApp for now; becomes /properties/[slug] once the CMS drives the listings.
export default function PropertyCard({ property }: { property: Property }) {
  return (
    <a
      href={waLink(`Hi Gio, I'm interested in ${property.name} in ${property.city}.`)}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative rounded-2xl overflow-hidden aspect-[5/6] bg-accent no-underline flex flex-col justify-end p-5"
    >
      {CARD_GLYPH}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
        <Badge variant="glass">{property.category}</Badge>
        <Badge variant="solid">{property.price}</Badge>
      </div>
      <div className="relative text-cream">
        <div className="font-display text-xl font-semibold leading-snug">{property.name}</div>
        <div className="text-cream/80 text-sm mt-1">{property.city}, Dominican Republic</div>
        <div className="text-cream/60 text-xs mt-2 pt-2.5 border-t border-cream/20">
          {property.spec}
        </div>
      </div>
    </a>
  );
}
