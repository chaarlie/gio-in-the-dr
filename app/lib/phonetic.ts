import { fold } from "./properties";

/*
  Phonetic codes, for the fallback when a folded search finds nothing.

  Not Soundex. Measured against the real vocabulary, Soundex maps "bath" and
  "bed" to the same code, and "bathrooms", "bedroom" and "bedrooms" to another —
  which on a property site means "3 bed" returns bathrooms. It also drops the
  distinction between "condo" and "kondo" by keeping the first letter literally.

  This is a compact Metaphone-style encoder: it keeps consonant articulation,
  drops vowels after the first position, and folds the pairs that actually
  collide in Spanish orthography — b/v, s/z/c-before-e-i, ll/y, silent h. Those
  are the errors this audience makes; Soundex catches the first two by accident
  and misses the rest.

  It is deliberately less aggressive than a 4-character code: the whole encoded
  token is kept, so "bed" and "bath" stay apart.
*/

/** b/v, s/z, ll/y, qu/k/c, silent h — the pairs Spanish speakers genuinely confuse. */
function normalise(token: string): string {
  return token
    .replace(/^h/, "") // hola/ola — silent in Spanish
    .replace(/qu/g, "k")
    .replace(/ch/g, "X") // single sound, kept distinct from c
    /*
      Doubles collapse before y-folding, not after, and the order is the whole
      difference between "vila" finding Villa and not. Folding ll→y first made
      villa→by while the dropped-letter typo vila→bl, so the two never met.
      Collapsing first, then folding y→l, lands yeísmo (cayejon/callejon) and the
      dropped letter (vila/villa) on the same code — measured, at no cost in
      collisions on the real vocabulary.
    */
    .replace(/(.)\1+/g, "$1")
    .replace(/c([eiy])/g, "s$1") // ciudad/siudad
    .replace(/[ckq]/g, "k") // condo/kondo
    .replace(/[vb]/g, "b") // cabarete/cavarete
    .replace(/z/g, "s") // sosua/sozua
    .replace(/g([eiy])/g, "j$1") // gente/jente
    .replace(/y/g, "l"); // yeísmo, both directions
}

/**
 * One token's phonetic key. Empty for anything with no letters — numbers keep
 * their own meaning and go through the folded index instead.
 */
export function phoneticToken(token: string): string {
  const word = normalise(fold(token).replace(/[^a-z]/g, ""));
  if (!word) return "";
  // First letter kept whole (including its vowel), the rest de-vowelled: enough
  // to survive vowel typos without collapsing distinct words into each other.
  return word[0] + word.slice(1).replace(/[aeiou]/g, "");
}

/** The phonetic haystack stored on a document, or the patterns for a query. */
export function phoneticTokens(text: string): string[] {
  return fold(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(phoneticToken)
    .filter(Boolean);
}
