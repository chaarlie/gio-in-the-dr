import Image from "next/image";
import { WA } from "../lib/whatsapp";
import SectionHeading from "./SectionHeading";

const STATS = [
  { big: "4+", label: "Years in DR real estate" },
  { big: "3", label: "Languages — EN · ES · IT" },
  { big: "1:1", label: "Personal service, start to finish" },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-14 sm:pt-20 pb-4">
      <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
        <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-accent">
          <Image
            src="/gio-portrait.jpg"
            alt="Gio, real estate agent in Cabarete, Dominican Republic"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-[center_20%]"
          />
        </div>
        <div>
          <SectionHeading
            eyebrow="About Gio"
            title="An Italian who chose the Dominican Republic."
          />
          <p className="text-muted text-lg leading-relaxed max-w-xl mt-5">
            I moved to the Dominican Republic from Italy and made Cabarete home. For the
            past four years I&apos;ve helped foreigners buy property here — from first
            questions to the day they get the keys.
          </p>
          <p className="text-muted text-lg leading-relaxed max-w-xl mt-4">
            Because I speak English, Spanish and Italian — and made the move myself — I
            understand exactly what you&apos;re navigating, from choosing the right area to
            residency and closing.
          </p>
          <div className="flex flex-wrap gap-10 mt-8">
            {STATS.map((s) => (
              <div key={s.big}>
                <div className="font-display text-3xl font-bold text-ink">{s.big}</div>
                <div className="text-muted text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <a
            href={WA.general}
            target="_blank"
            rel="noopener"
            className="inline-block mt-9 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
          >
            Work with Gio
          </a>
        </div>
      </div>
    </section>
  );
}
