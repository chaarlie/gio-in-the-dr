// Single source of truth for Gio's WhatsApp contact.
// In the Sanity build this number moves to a `siteSettings` field.
export const WHATSAPP_NUMBER = "18092994917";

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Interest-tailored deep links (used by the hero CTA + the floating launcher).
export const WA = {
  general: waLink("Hi Gio, I'd love to talk about a property in the DR."),
  home: waLink("Hi Gio, I'd like to know about buying a home around Cabarete."),
  invest: waLink("Hi Gio, I'm interested in investment properties on the north coast."),
  relocate: waLink(
    "Hi Gio, I'd like help relocating to the DR — residency and the buying process.",
  ),
} as const;
