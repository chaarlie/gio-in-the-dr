import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theme preview — Gio In The DR",
};

const SWATCHES: { name: string; token: string; hex: string; note: string }[] = [
  { name: "cream", token: "bg-cream", hex: "#F1E8DF", note: "Base background" },
  { name: "surface", token: "bg-surface", hex: "#E8DFD3", note: "Cards on base" },
  { name: "panel", token: "bg-panel", hex: "#DAD0C4", note: "Feature panels / bars" },
  { name: "card", token: "bg-card", hex: "#FBF8F2", note: "Lightest card" },
  { name: "line", token: "bg-line", hex: "#E2D9CC", note: "Hairline borders" },
  { name: "ink", token: "bg-ink", hex: "#1B1917", note: "Primary text" },
  { name: "muted", token: "bg-muted", hex: "#8A8175", note: "Secondary text" },
  { name: "accent", token: "bg-accent", hex: "#141414", note: "Primary buttons / dark cards" },
  { name: "accent-soft", token: "bg-accent-soft", hex: "#2C2A27", note: "Accent hover" },
  { name: "whatsapp", token: "bg-whatsapp", hex: "#25D366", note: "Brand green" },
];

export default function ThemePreview() {
  return (
    <main className="min-h-screen bg-cream text-ink px-6 md:px-12 py-14 max-w-6xl mx-auto w-full">
      <header className="mb-12">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted">
          Cabarete · Dominican Republic
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mt-3">
          Theme preview
        </h1>
        <p className="text-muted mt-3 max-w-xl">
          Warm-neutral palette with a near-black accent. Base is{" "}
          <code className="bg-surface px-1.5 py-0.5 rounded">bg-cream</code>, accent is{" "}
          <code className="bg-surface px-1.5 py-0.5 rounded">bg-accent</code>.
        </p>
      </header>

      {/* Swatches */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
        {SWATCHES.map((s) => (
          <div key={s.name} className="rounded-2xl overflow-hidden border border-line bg-card">
            <div className={`${s.token} h-24 w-full`} />
            <div className="p-3">
              <div className="font-semibold text-sm">{s.name}</div>
              <div className="text-muted text-xs mt-0.5">{s.hex}</div>
              <div className="text-muted text-xs">{s.note}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Sample components */}
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Buttons */}
        <div className="rounded-3xl border border-line bg-card p-8">
          <h2 className="font-display text-2xl font-bold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <button className="bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-6 py-3 rounded-full transition-colors">
              Our portfolio
            </button>
            <button className="border border-ink/20 hover:border-ink text-ink text-sm font-semibold px-6 py-3 rounded-full transition-colors">
              Message Gio
            </button>
            <button className="bg-whatsapp text-white text-sm font-semibold px-6 py-3 rounded-full">
              Chat on WhatsApp
            </button>
          </div>
        </div>

        {/* Stat / dark card */}
        <div className="rounded-3xl bg-accent text-cream p-8 flex flex-col justify-center">
          <div className="font-display text-2xl font-semibold">Highlights</div>
          <p className="text-cream/70 text-sm mt-2 max-w-xs">
            A trilingual agent who moved here herself — helping foreigners buy with
            confidence.
          </p>
        </div>
      </section>

      {/* Card styling reference — deliberately unnamed placeholders, so nothing here
          reads as a listing. The real cards come from Sanity via PropertyCard. */}
      <section className="grid sm:grid-cols-3 gap-5">
        {["Sample villa", "Sample beachfront", "Sample land"].map((t, i) => (
          <div
            key={t}
            className="rounded-2xl overflow-hidden border border-line bg-surface aspect-[5/6] relative flex flex-col justify-end p-5"
          >
            <span className="absolute top-4 left-4 bg-accent text-cream text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full">
              {i === 2 ? "Land" : "Residential"}
            </span>
            <span className="absolute top-4 right-4 bg-card text-ink text-[13px] font-bold px-3 py-1.5 rounded-full">
              ${["1.2M", "850K", "290K"][i]}
            </span>
            <div className="font-display text-xl font-semibold">{t}</div>
            <div className="text-muted text-sm mt-1">Cabarete, Dominican Republic</div>
          </div>
        ))}
      </section>
    </main>
  );
}
