/*
  The same share card as the segment above.

  Metadata merges shallowly: a page that sets `openGraph` replaces its parent's
  `openGraph` wholesale, and the image the file convention attaches to [locale]
  goes with it. Re-exporting puts the card back on this segment so the index
  pages unfurl with the lockup instead of with nothing.
*/
export { default, alt, size, contentType } from "../opengraph-image";
