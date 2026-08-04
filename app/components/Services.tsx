import Link from "next/link";
import { WA } from "../lib/whatsapp";
import SectionHeading from "./SectionHeading";

const SERVICES = [
  {
    title: "Property Listings",
    body: "Curated homes, land and commercial spaces around Cabarete and the north coast — vetted before you ever see them.",
    href: "#properties",
    dark: false,
  },
  {
    title: "Investment Consult",
    body: "Data-driven guidance on yield, location and timing so your capital works as hard as you do.",
    href: WA.invest,
    dark: true,
  },
  {
    title: "Relocation Support",
    body: "Residency, the buying process, taxes and financing — explained clearly in your language so you can settle with ease.",
    href: WA.relocate,
    dark: false,
  },
];

export default function Services() {
  return (
    <section id="services" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4">
      <SectionHeading align="center" title="Our services" className="mb-11">
        <p className="text-muted mt-3">How I help you buy — and settle into — life in the DR.</p>
      </SectionHeading>
      <div className="grid md:grid-cols-3 gap-5">
        {SERVICES.map((s) => {
          const external = s.href.startsWith("http");
          const cls = s.dark ? "bg-accent text-cream" : "bg-card border border-line text-ink";
          return (
            <div key={s.title} className={`rounded-3xl p-8 ${cls}`}>
              <div className="font-display text-2xl font-semibold">{s.title}</div>
              <p className={`mt-3.5 leading-relaxed ${s.dark ? "text-cream/80" : "text-muted"}`}>
                {s.body}
              </p>
              {external ? (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  className={`inline-block mt-6 text-sm font-semibold no-underline ${
                    s.dark ? "text-cream" : "text-ink"
                  }`}
                >
                  Explore more →
                </a>
              ) : (
                <Link
                  href={s.href}
                  className="inline-block mt-6 text-sm font-semibold text-ink no-underline"
                >
                  Explore more →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
