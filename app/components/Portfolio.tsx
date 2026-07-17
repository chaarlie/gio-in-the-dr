"use client";

import { useState } from "react";
import { waLink } from "../lib/whatsapp";

type Property = {
  id: string;
  name: string;
  city: string;
  type: string;
  price: string;
  spec: string;
};

// Static sample data — replaced by a Sanity query in the CMS build.
const PROPERTIES: Property[] = [
  { id: "p1", name: "Sunrise Villa", city: "Cabarete", type: "Residential", price: "$1.2M", spec: "4 Bed · 5 Bath · Private Pool" },
  { id: "p2", name: "Kite Beach Condo", city: "Cabarete", type: "Residential", price: "$395K", spec: "2 Bed · Beachfront · 40m to sand" },
  { id: "p3", name: "Sosúa Ocean Villa", city: "Sosúa", type: "Residential", price: "$680K", spec: "3 Bed · Ocean view" },
  { id: "p4", name: "Cabrera Ocean-View Land", city: "Cabrera", type: "Land", price: "$290K", spec: "2,400 m² · Building lot" },
  { id: "p5", name: "Encuentro Surf House", city: "Cabarete", type: "Residential", price: "$540K", spec: "3 Bed · Steps from the break" },
  { id: "p6", name: "Downtown Retail Space", city: "Puerto Plata", type: "Commercial", price: "$430K", spec: "320 m² · High-traffic" },
];

const CITIES = ["All", "Cabarete", "Sosúa", "Cabrera", "Puerto Plata"];
const TYPES = ["All", "Residential", "Commercial", "Land"];

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-card border border-line rounded-full pl-4 pr-9 py-2.5 text-sm font-semibold text-ink cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted text-[10px]"
      >
        ▼
      </span>
    </div>
  );
}

export default function Portfolio() {
  const [city, setCity] = useState("All");
  const [type, setType] = useState("All");

  const filtered = PROPERTIES.filter(
    (p) => (city === "All" || p.city === city) && (type === "All" || p.type === type),
  );

  return (
    <section id="portfolio" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-ink text-3xl md:text-5xl">Property portfolio</h2>
        <p className="text-muted mt-3">
          A selection of homes, land and commercial spaces across the north coast.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-6">
        <Select label="Filter by city" value={city} onChange={setCity} options={CITIES} />
        <Select label="Filter by property type" value={type} onChange={setType} options={TYPES} />
        <button
          onClick={() => {
            setCity("All");
            setType("All");
          }}
          className="border border-line rounded-full px-5 py-2.5 text-sm font-semibold text-muted hover:bg-ink/5 transition-colors"
        >
          Reset filters ✕
        </button>
        <div className="ml-auto text-sm text-muted">{filtered.length} properties</div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted">No properties match those filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <a
              key={p.id}
              href={waLink(`Hi Gio, I'm interested in ${p.name} in ${p.city}.`)}
              target="_blank"
              rel="noopener"
              className="group relative rounded-2xl overflow-hidden aspect-[5/6] bg-accent no-underline flex flex-col justify-end p-5"
            >
              <div className="absolute inset-0 flex items-center justify-center text-cream/10">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 9.5 12 4l8 5.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                <span className="bg-cream/15 text-cream text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {p.type}
                </span>
                <span className="bg-cream text-ink text-[13px] font-bold px-3 py-1.5 rounded-full">
                  {p.price}
                </span>
              </div>
              <div className="relative text-cream">
                <div className="font-display text-xl font-semibold leading-snug">{p.name}</div>
                <div className="text-cream/80 text-sm mt-1">{p.city}, Dominican Republic</div>
                <div className="text-cream/60 text-xs mt-2 pt-2.5 border-t border-cream/20">
                  {p.spec}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
