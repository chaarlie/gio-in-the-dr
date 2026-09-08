"use client";

import Image from "next/image";
import { createContext, use, useCallback, useId, useMemo, useRef, useState } from "react";
import { sizedImage } from "../lib/sanity-image";
import { guideMeta } from "../lib/guide-download";
import { useMessages } from "./LocaleProvider";
import type { Guide } from "../lib/guide.server";

/*
  The gated buyer's-guide download.

  A compound component: <GuideDownload> holds the dialog and the form, and its
  two triggers — the cover image and the call-to-action button — open it through
  context. They sit in different parts of the section's layout, so sharing one
  dialog between them is exactly what context is for, and it keeps a single
  source of truth for "is the form open" rather than a dialog per trigger.

  The download itself is unchanged in spirit: the same Sanity `?dl=` URL that
  sends Content-Disposition: attachment. What's new is that it only fires after a
  name and a valid email are posted.
*/
type GuideCtx = { open: (trigger: HTMLElement | null) => void };
const Ctx = createContext<GuideCtx | null>(null);

function useGuideDialog(): GuideCtx {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("GuideDownload.Cover / .Button must be inside <GuideDownload>");
  return ctx;
}

type Errors = { name?: string; email?: string };

export default function GuideDownload({
  fileUrl,
  children,
}: {
  /** The PDF's URL, built on the server so this stays a dumb consumer. */
  fileUrl: string;
  children: React.ReactNode;
}) {
  const t = useMessages().guide;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  /*
    The dialog is opened and closed imperatively from the handlers, not through a
    state flag and an effect: showModal()/close() are the native API — a focus
    trap, Escape and a real ::backdrop for free — and calling them where the
    interaction happens keeps them in step without a render in between. It also
    means the two triggers don't re-render when the form's own state changes,
    because the context value below stays stable.
  */
  const open = useCallback((trigger: HTMLElement | null) => {
    triggerRef.current = trigger;
    setErrors({});
    setStatusMessage(null);
    dialogRef.current?.showModal();
    firstFieldRef.current?.focus();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  const ctxValue = useMemo(() => ({ open }), [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = t.nameRequired;
    if (!email) next.email = t.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = t.emailInvalid;

    setErrors(next);
    const firstBad = (["name", "email"] as const).find((f) => next[f]);
    if (firstBad) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }

    /*
      Open the tab now, synchronously inside the click, or the pop-up blocker
      eats it: a window.open that happens after the awaited POST is no longer
      tied to the user gesture. It starts blank, then points at the PDF once the
      lead is recorded — or closes if that failed. The PDF has no attachment
      header, so the new tab shows it in the browser's viewer rather than
      downloading it.
    */
    const win = window.open("about:blank", "_blank");
    if (win) win.opener = null;

    setSending(true);
    setStatusMessage(null);

    fetch("/api/buyers-guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })
      .then(async (res) => {
        if (!res.ok) {
          win?.close();
          const result = await res.json().catch(() => ({}));
          setSending(false);
          setStatusMessage(result.error ?? t.error);
          return;
        }
        if (win) win.location.href = fileUrl;
        else window.location.href = fileUrl;
        setSending(false);
        formRef.current?.reset();
        close();
      })
      .catch(() => {
        win?.close();
        setSending(false);
        setStatusMessage(t.error);
      });
  }

  function clear(field: keyof Errors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  const inputClass =
    "bg-cream border border-line rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-ink/40 transition-colors";

  return (
    <Ctx.Provider value={ctxValue}>
      {children}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // Fires however the dialog closed (Escape, backdrop, close()): hand focus
        // back to whatever opened it.
        onClose={() => triggerRef.current?.focus()}
        // A click that lands on the <dialog> itself is the backdrop — the form
        // fills the rest, so its clicks never reach here.
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-line bg-card p-0 text-ink shadow-xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-display text-2xl font-bold leading-tight text-balance">
              {t.title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="-mr-2 -mt-1 shrink-0 rounded-full w-9 h-9 flex items-center justify-center text-muted hover:bg-ink/5 hover:text-ink transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <p className="text-muted text-sm leading-relaxed -mt-1">{t.intro}</p>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">{t.nameLabel}</span>
            <input
              ref={firstFieldRef}
              name="name"
              type="text"
              autoComplete="name"
              placeholder={t.namePlaceholder}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "guide-name-error" : undefined}
              onInput={() => clear("name")}
              className={inputClass}
            />
            {errors.name ? (
              <span id="guide-name-error" className="text-[13px] text-[#b3261e]">
                {errors.name}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">{t.emailLabel}</span>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              placeholder={t.emailPlaceholder}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "guide-email-error" : undefined}
              onInput={() => clear("email")}
              className={inputClass}
            />
            {errors.email ? (
              <span id="guide-email-error" className="text-[13px] text-[#b3261e]">
                {errors.email}
              </span>
            ) : null}
          </label>

          {/* The consent notice: pressing Download is the agreement, stated here
              right above the button so it can't be missed. */}
          <p className="text-muted text-xs leading-relaxed">{t.consent}</p>

          <div role="status" aria-live="polite">
            {statusMessage ? (
              <div className="rounded-2xl bg-[#ffefef] px-4 py-3 text-sm text-[#b3261e]">
                {statusMessage}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4v11m0 0 3.4-3.4M12 15l-3.4-3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {sending ? t.preparing : t.download}
          </button>
        </form>
      </dialog>
    </Ctx.Provider>
  );
}

/*
  The cover: the guide's first page, opening the form on click. It is a real
  button now, not the decorative aria-hidden image it was — with a gate, it can't
  be a shortcut straight to the file — so it carries its own label.
*/
export function GuideDownloadCover({ guide }: { guide: Guide }) {
  const { open } = useGuideDialog();
  const t = useMessages().guide;
  const cover = guide.cover?.url ? guide.cover : null;

  return (
    <button
      type="button"
      onClick={(e) => open(e.currentTarget)}
      aria-label={t.openAria(guide.title)}
      className="group relative block w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-panel to-surface cursor-pointer"
    >
      {cover ? (
        <Image
          src={sizedImage(cover.url as string, 1200)}
          alt=""
          fill
          sizes="(min-width: 1024px) 620px, 100vw"
          placeholder={cover.lqip ? "blur" : undefined}
          blurDataURL={cover.lqip ?? undefined}
          unoptimized
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-muted/40">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

/* The primary call to action, centred beneath both columns. Opens the same form. */
export function GuideDownloadButton({ guide }: { guide: Guide }) {
  const { open } = useGuideDialog();
  const meta = guideMeta(guide);

  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={(e) => open(e.currentTarget)}
        className="group inline-flex items-center gap-4 bg-accent hover:bg-accent-soft text-cream rounded-2xl px-6 py-4 sm:px-7 sm:py-5 transition-colors touch-manipulation max-w-full cursor-pointer text-left"
      >
        <span aria-hidden="true" className="shrink-0">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v11m0 0 3.4-3.4M12 15l-3.4-3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block font-display text-xl font-bold leading-tight">{guide.title}</span>
          <span className="block text-cream/80 text-sm mt-0.5 text-pretty">
            {guide.description ?? "Free download"}
            {meta ? ` — ${meta}` : ""}
          </span>
        </span>
      </button>
    </div>
  );
}
