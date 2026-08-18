// Single source of truth for Gio's Instagram, mirroring ./whatsapp and ./email.
// In the Sanity build this moves to a `siteSettings` field alongside the others.

/** Handle as it's written and displayed, leading @ included. */
export const INSTAGRAM_HANDLE = "@giointhedr";

/** The profile URL. Derived from the handle so the two can't drift apart. */
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE.replace("@", "")}`;
