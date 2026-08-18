// Single source of truth for Gio's email, mirroring ./whatsapp.
// In the Sanity build this moves to a `siteSettings` field alongside the number.

export const EMAIL = "info@giointhedr.com";

/*
  A mailto with the subject already filled in.

  The subject is the point: a message that arrives as "Cost of living in
  Cabarete" is one Gio can answer without asking which page it came from, and
  it survives the trip through whatever client the sender uses.

  Body is left out deliberately — prefilled body text lands as a wall of quoted
  placeholder in most clients, and the sender has to delete it before writing.
*/
export function mailtoLink(subject: string): string {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/** The same interest-tailored set the WhatsApp links use. */
export const MAIL = {
  general: mailtoLink("A question about buying in the DR"),
  /** From the end of a guide — carries the title so the reply has context. */
  guide: (title: string) => mailtoLink(`Question about: ${title}`),
} as const;
