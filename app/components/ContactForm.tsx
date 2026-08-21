"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeading from "./SectionHeading";
import WhatsAppIcon from "./WhatsAppIcon";
import { WA, WHATSAPP_DISPLAY } from "../lib/whatsapp";
import { useMessages } from "./LocaleProvider";

const INTERESTS = [
  "Buying a home",
  "Investment property",
  "Pre-construction",
  "Relocation & residency",
  "Just have a question",
];

type Field = "name" | "email";
type Errors = Partial<Record<Field, string>>;
type SubmitState = "idle" | "sending" | "success" | "error";

const INPUT_CLASS =
  "bg-cream border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-ink/40 transition-colors";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-[13px] text-[#b3261e]">
      {message}
    </span>
  );
}

/*
  A client component — it holds form state — so it reads the locale from context
  rather than next/root-params, whose getters run on the server only.
*/
export default function ContactForm() {
  const t = useMessages().contact;
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /*
    Return to the untouched state a few seconds after a successful send. Long
    enough to read the confirmation, short enough that the section doesn't sit
    there looking half-used — the fields are already cleared, so leaving the
    banner behind is the only thing that made it look different from a fresh load.

    Only success auto-clears: an error message has to stay until it's acted on.
  */
  useEffect(() => {
    if (submitState !== "success") return;
    const timer = window.setTimeout(() => {
      setSubmitState("idle");
      setStatusMessage(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [submitState]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Add your name so Gio knows who's writing.";
    if (!email) next.email = "Add an email address so Gio can reply.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      next.email = "That address looks incomplete — check for a typo.";
    }

    setErrors(next);

    const first = (["name", "email"] as Field[]).find((f) => next[f]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setSubmitState("sending");
    setStatusMessage(null);
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, interest, message }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitState("error");
        setStatusMessage(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitState("success");
      setStatusMessage("Message sent — Gio will be in touch soon.");
      formRef.current?.reset();
      setInterest(INTERESTS[0]);
    } catch (error) {
      console.error("Contact form submit failed", error);
      setSubmitState("error");
      setStatusMessage("Unable to send your message right now. Please try again later.");
    }
  }

  function clear(field: Field) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  return (
    <section id="contact" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-16 pb-4">
      <div className="grid lg:grid-cols-2 gap-10 items-start bg-card border border-line rounded-3xl p-8 md:p-12">
        <SectionHeading eyebrow={t.eyebrow} title={t.heading}>
          <p className="text-muted text-lg leading-relaxed max-w-md mt-5">
            {t.intro}
          </p>

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

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Name</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder={t.namePlaceholder}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                onInput={() => clear("name")}
                className={INPUT_CLASS}
              />
              <FieldError id="name-error" message={errors.name} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Email</span>
              <input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                placeholder={t.emailPlaceholder}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                onInput={() => clear("email")}
                className={INPUT_CLASS}
              />
              <FieldError id="email-error" message={errors.email} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t.interestedIn}</span>
            <div className="relative">
              <select
                name="interest"
                autoComplete="off"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                style={{ backgroundColor: "var(--color-cream)", color: "var(--color-ink)" }}
                className="w-full appearance-none border border-line rounded-xl px-4 pr-9 py-3 text-sm font-medium cursor-pointer outline-none focus:border-ink/40"
              >
                {INTERESTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
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
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t.message}</span>
            <textarea
              name="message"
              rows={4}
              autoComplete="off"
              placeholder={t.messagePlaceholder}
              className={`${INPUT_CLASS} resize-y`}
            />
          </label>

          {/* One live region for everything the form has to say — field errors and
              send status both land here, so a screen reader isn't told two things
              at once. `role="status"` announces without stealing focus. */}
          <div role="status" aria-live="polite">
            <span className="sr-only">
              {Object.values(errors).filter(Boolean).length > 0
                ? "The form has errors. Check the highlighted fields."
                : ""}
            </span>
            {statusMessage ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  submitState === "success"
                    ? "bg-[#e6f7ec] text-[#186a3b]"
                    : "bg-[#ffefef] text-[#b3261e]"
                }`}
              >
                {statusMessage}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submitState === "sending"}
            className="bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors self-start touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitState === "sending" ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
