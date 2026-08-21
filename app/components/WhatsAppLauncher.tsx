import { WA } from "../lib/whatsapp";
import WhatsAppIcon from "./WhatsAppIcon";
import { DEFAULT_LOCALE, type Locale, isLocale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";
import { locale as rootLocale } from "next/root-params";

// Native <details> popover — zero JS, no motion animation. Maps to a useState toggle later if needed.
const CHIPS = [
  { href: WA.home, label: "🏠 Buying a home" },
  { href: WA.invest, label: "📈 Investing on the north coast" },
  { href: WA.relocate, label: "🛂 Relocating & residency" },
];

/*
  A native <details> popover — deliberately zero JavaScript. Its strings come in
  as a prop rather than from useMessages, because reading the hook would make
  this a client component and ship a bundle for a widget built to need none.
*/
export default async function WhatsAppLauncher() {
  const raw = await rootLocale();
  const locale: Locale = raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale];
  return (
    <details
      className="fixed z-[150]"
      style={{
        right: "calc(1.5rem + env(safe-area-inset-right))",
        bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
      }}
    >
      <summary
        aria-label={t.launcher.open}
        title={t.launcher.open}
        className="list-none [&::-webkit-details-marker]:hidden ml-auto w-[62px] h-[62px] rounded-full bg-whatsapp text-white flex items-center justify-center shadow-[0_10px_28px_rgba(37,211,102,0.45)] cursor-pointer [touch-action:manipulation] hover:shadow-[0_14px_34px_rgba(37,211,102,0.55)] transition-shadow"
      >
        <WhatsAppIcon size={34} />
      </summary>

      <div className="absolute right-0 bottom-[76px] w-[308px] max-w-[calc(100vw-40px)] bg-card rounded-[18px] overflow-hidden border border-line shadow-2xl">
        <div className="bg-accent text-cream px-5 py-4">
          <div className="font-display text-lg font-semibold">{t.launcher.greeting}</div>
          <div className="text-cream/70 text-[13px] mt-1">{t.launcher.prompt}</div>
        </div>
        <div className="p-3.5">
          {CHIPS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2.5 px-3.5 py-3 mb-2 rounded-xl bg-surface border border-line text-ink text-sm font-semibold no-underline hover:border-ink/30 transition-colors"
            >
              {c.label}
            </a>
          ))}
          <a
            href={WA.general}
            target="_blank"
            rel="noopener"
            className="mt-1 flex items-center justify-center gap-2 bg-whatsapp text-white text-sm font-bold px-4 py-3 rounded-xl no-underline"
          >
            <WhatsAppIcon size={18} />
            {t.launcher.chat}
          </a>
          <p className="text-muted text-[11.5px] leading-snug mt-2.5 text-center"> {t.launcher.note}
          </p>
        </div>
      </div>
    </details>
  );
}
