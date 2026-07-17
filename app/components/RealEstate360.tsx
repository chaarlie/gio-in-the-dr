import PhotoPlaceholder from "./PhotoPlaceholder";

const POINTS = [
  "Real rental data from 10+ properties I manage in Cabarete Bay & Sosúa",
  "Realistic income projections",
  "Ownership costs & HOA fees",
  "Property management",
  "The unique pros and cons of each neighborhood & condominium",
];

function Check() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 mt-0.5 text-accent"
    >
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="var(--color-cream)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RealEstate360() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted mb-4">
            Beyond the listing
          </p>
          <h2 className="font-display font-bold text-ink text-3xl md:text-5xl leading-tight text-balance">
            Real estate in 360°
          </h2>
          <p className="text-muted text-lg leading-relaxed max-w-xl mt-5">
            Buying a property is more than choosing a condo. I help you understand the full
            picture before you commit — so you know exactly what you&apos;re getting into.
          </p>
          <ul className="mt-7 flex flex-col gap-3.5">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-ink leading-snug">
                <Check />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-surface">
          <PhotoPlaceholder className="absolute inset-0" />
          <div className="absolute left-5 bottom-5 right-5 bg-accent/90 text-cream rounded-2xl px-5 py-4 backdrop-blur-sm">
            <div className="font-display text-3xl font-bold leading-none">10+</div>
            <div className="text-cream/80 text-sm mt-1.5">
              Properties I manage across Cabarete Bay & Sosúa — real numbers, not guesses.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
