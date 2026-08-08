"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";
import WhatsAppIcon from "./WhatsAppIcon";
import { WA, WHATSAPP_DISPLAY } from "../lib/whatsapp";

const INTERESTS = [
  "Buying a home",
  "Investment property",
  "Pre-construction",
  "Relocation & residency",
  "Just have a question",
];

// MVP: composes an email to Gio (works with no backend). Upgrade path: POST to a
// route handler + Resend/Supabase to capture leads. WhatsApp stays as the instant channel.
export default function ContactForm() {
  const [interest, setInterest] = useState(INTERESTS[0]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const body = `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`;
    window.location.href = `mailto:hello@giointhedr.com?subject=${encodeURIComponent(
      `Website enquiry — ${interest}`,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section id="contact" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-16 pb-4">
      <div className="grid lg:grid-cols-2 gap-10 items-start bg-card border border-line rounded-3xl p-8 md:p-12">
        <SectionHeading eyebrow="Get in touch" title="Tell me what you're looking for.">
          <p className="text-muted text-lg leading-relaxed max-w-md mt-5">
            Share a few details and I&apos;ll get back to you — in English, Spanish or
            Italian. Prefer to chat now? Message me on WhatsApp any time.
          </p>

          {/* The one place the design system allows a vivid colour: WhatsApp green,
              contact-only. Serif + display scale so it reads at heading weight. */}
          <a
            href={WA.general}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Message Gio on WhatsApp at ${WHATSAPP_DISPLAY}`}
            className="group inline-flex items-center gap-3 mt-6 text-whatsapp no-underline"
          >
            <WhatsAppIcon size={28} className="shrink-0" />
            <span className="font-display text-2xl md:text-3xl font-bold tracking-tight border-b-2 border-transparent group-hover:border-whatsapp transition-colors">
              {WHATSAPP_DISPLAY}
            </span>
          </a>
        </SectionHeading>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Name</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Your name"
                className="bg-cream border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-ink/40 transition-colors"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                className="bg-cream border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-ink/40 transition-colors"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">I&apos;m interested in</span>
            <div className="relative">
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full appearance-none bg-cream border border-line rounded-xl px-4 pr-9 py-3 text-sm font-medium text-ink cursor-pointer outline-none focus:border-ink/40"
              >
                {INTERESTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted text-[10px]">
                ▼
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Message</span>
            <textarea
              name="message"
              rows={4}
              placeholder="Budget, area, timeline — whatever helps…"
              className="bg-cream border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-ink/40 transition-colors resize-y"
            />
          </label>

          <button
            type="submit"
            className="bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors self-start"
          >
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}
