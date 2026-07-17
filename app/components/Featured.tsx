import { WA } from "../lib/whatsapp";
import PhotoPlaceholder from "./PhotoPlaceholder";

export default function Featured() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-8 sm:py-12">
      <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden bg-accent text-cream min-h-[360px]">
        <PhotoPlaceholder tone="dark" className="min-h-[300px]" />
        <div className="p-10 md:p-12 flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cream/70 mb-4">
            North Coast
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight max-w-sm text-balance">
            Your home on the Cabarete coast
          </h2>
          <p className="text-cream/80 leading-relaxed max-w-md mt-4">
            Beachfront condos, villas and land — matched to how you want to live, with
            honest local guidance in your language.
          </p>
          <a
            href={WA.general}
            target="_blank"
            rel="noopener"
            className="self-start mt-7 bg-cream text-ink text-sm font-bold px-7 py-3.5 rounded-full hover:bg-white transition-colors no-underline"
          >
            Contact now
          </a>
        </div>
      </div>
    </section>
  );
}
