// GIO wordmark + the hand-drawn sun, cut in half.
//
// The supplied artwork (files (3): potrace trace of the hand-drawn sun) is a full
// 12-ray sun. The viewBox crops it to the top half.
//
// The cut is at the centre of the sun's hollow middle (157.6, 148.9 — the second
// subpath in the trace), not the bounding-box centre. Those differ, because the
// rays are hand-drawn and uneven: cutting on the bbox left the mark sitting low
// and reading as tilted. The viewBox is also widened symmetrically about that
// centre so the two sides balance.
//
// Inlined with currentColor rather than shipping the cream/dark variants, so one
// component is correct on the cream header and on the dark footer.

const SUN_PATH =
  "M1660 2780 c-13 -9 -13 -11 0 -20 13 -9 13 -11 0 -20 -20 -13 -30 -12 -30 2 0 9 -3 9 -11 1 -7 -7 -11 -44 -10 -93 1 -74 0 -82 -19 -87 -25 -7 -25 -12 -3 -28 16 -12 16 -14 -4 -32 -22 -18 -22 -18 -3 -56 20 -40 18 -62 -5 -71 -9 -3 -12 -22 -9 -71 4 -60 2 -67 -16 -72 -13 -3 -20 -14 -20 -29 0 -42 -44 -25 -102 41 -30 34 -41 60 -68 165 -17 69 -35 145 -40 170 -24 126 -65 175 -156 184 l-60 6 -21 -37 c-14 -25 -18 -45 -13 -58 4 -11 10 -51 14 -90 4 -38 11 -72 15 -75 5 -3 23 -42 40 -87 18 -44 47 -101 65 -125 61 -79 54 -192 -12 -221 -15 -6 -30 -15 -33 -20 -3 -4 -14 2 -24 13 -10 11 -28 20 -41 20 -13 0 -49 25 -90 62 -244 220 -264 236 -312 244 -29 5 -52 2 -76 -10 -37 -17 -86 -69 -86 -91 0 -36 35 -104 69 -135 45 -41 97 -80 108 -81 4 0 28 -16 53 -34 25 -19 75 -52 112 -75 37 -22 74 -53 81 -67 14 -25 13 -30 -9 -110 -2 -9 -11 -10 -32 -2 -20 7 -44 6 -83 -4 -40 -11 -105 -13 -258 -11 -157 3 -215 1 -253 -11 -64 -19 -89 -37 -77 -55 5 -8 9 -27 9 -42 0 -17 8 -31 20 -38 27 -14 28 -54 1 -45 -11 3 -22 2 -25 -3 -7 -11 128 -25 249 -26 50 -1 95 -4 101 -8 6 -4 31 -8 55 -8 24 0 82 -1 129 -1 51 0 91 -5 100 -13 8 -7 27 -17 43 -24 20 -9 27 -19 27 -40 0 -33 -25 -72 -46 -72 -9 0 -30 -11 -48 -25 -18 -14 -41 -25 -51 -25 -23 0 -76 -17 -131 -42 -50 -22 -104 -24 -104 -3 0 24 -17 17 -24 -10 -5 -21 -12 -25 -42 -25 -38 0 -104 -24 -104 -37 0 -5 -20 -19 -45 -31 -30 -15 -45 -28 -45 -41 0 -11 -9 -23 -20 -26 -16 -5 -20 -15 -20 -56 0 -43 5 -55 33 -84 28 -29 40 -34 99 -39 43 -4 69 -3 73 4 4 6 18 16 32 21 14 5 27 18 30 29 3 11 14 20 24 20 18 0 39 9 79 32 8 5 23 11 33 14 9 4 17 14 17 24 0 28 22 39 73 38 36 0 55 6 80 25 39 30 133 45 166 28 18 -10 20 -19 17 -73 -3 -58 -5 -64 -44 -97 -22 -20 -42 -44 -44 -54 -1 -10 -7 -18 -11 -17 -4 0 -30 -28 -58 -62 -28 -35 -61 -69 -75 -76 -51 -27 -90 -58 -87 -69 2 -6 -1 -14 -6 -18 -6 -3 -11 -16 -11 -28 0 -12 -17 -38 -36 -57 -33 -33 -35 -38 -29 -80 11 -73 39 -89 88 -50 14 11 39 20 56 20 17 0 31 3 31 8 0 13 61 42 91 42 16 0 29 3 29 8 0 4 21 28 46 55 45 46 46 47 20 47 -14 0 -26 4 -26 8 0 16 35 38 63 40 40 3 45 7 59 53 6 23 18 43 25 46 7 3 13 11 13 19 0 7 9 19 21 28 13 9 19 21 15 33 -8 27 84 67 119 51 24 -11 34 -28 16 -28 -5 0 -11 -11 -13 -25 -4 -17 -1 -25 8 -25 8 0 14 -11 14 -25 0 -14 -4 -25 -9 -25 -13 0 -23 -32 -13 -39 5 -3 -5 -35 -21 -71 -17 -36 -32 -81 -32 -100 -5 -88 -18 -140 -35 -140 -14 0 -19 -11 -22 -51 -5 -47 -1 -72 22 -134 8 -21 99 -75 126 -75 7 0 16 11 20 25 3 14 10 25 14 25 17 0 70 92 70 121 0 17 6 32 15 35 10 4 14 21 13 58 -1 35 4 61 15 77 20 27 22 61 6 91 -9 17 -8 23 5 30 9 5 16 16 16 24 0 8 6 23 12 34 10 16 10 24 0 41 -11 17 -11 23 0 36 14 18 33 49 47 80 15 33 31 37 57 12 16 -15 24 -33 24 -55 0 -19 9 -51 21 -74 17 -32 20 -50 15 -92 -3 -29 -7 -67 -9 -85 -1 -17 -5 -34 -8 -37 -8 -9 1 -55 12 -62 5 -3 9 -40 9 -83 0 -86 16 -131 57 -158 29 -19 80 -24 108 -9 11 6 23 9 27 8 14 -4 46 65 57 123 12 62 11 151 -3 173 -4 7 -2 19 4 27 9 11 9 27 1 62 -6 27 -13 69 -17 95 -3 26 -12 49 -20 52 -21 8 -10 115 13 131 14 10 15 16 5 28 -10 12 -10 16 2 20 19 8 82 -62 107 -118 10 -23 26 -48 34 -55 8 -7 15 -23 15 -35 0 -12 7 -28 15 -35 8 -7 15 -20 15 -30 0 -9 9 -29 20 -43 11 -14 20 -30 20 -35 0 -12 56 -85 96 -125 44 -44 99 -68 145 -64 53 5 105 63 94 105 -3 15 -8 41 -11 57 -7 41 -53 133 -82 164 -13 14 -40 51 -59 81 -20 30 -38 57 -42 60 -18 15 -117 136 -128 157 -7 14 -13 34 -13 45 0 19 4 20 48 14 109 -14 128 -19 158 -42 43 -31 227 -124 248 -124 16 0 27 -4 74 -29 25 -13 77 -7 100 12 7 5 30 11 50 12 34 2 38 6 51 44 11 36 11 44 -1 59 -8 9 -19 29 -26 44 -6 15 -30 37 -54 50 -57 29 -169 65 -194 62 -10 -2 -29 4 -41 12 -13 8 -55 21 -95 29 -40 9 -77 20 -82 25 -6 6 -21 10 -33 10 -51 0 -123 50 -123 86 0 12 -5 24 -12 26 -7 3 -8 10 -3 17 6 10 26 12 82 8 54 -4 75 -2 79 7 4 9 41 12 147 10 103 -2 153 2 184 12 24 8 49 14 56 12 6 -1 32 8 56 20 25 12 56 22 70 22 18 1 32 11 46 33 11 18 30 33 43 35 27 4 30 32 3 32 -11 0 -23 9 -26 20 -3 11 -21 31 -38 44 -30 23 -38 24 -159 21 -76 -1 -133 -7 -141 -13 -8 -7 -38 -11 -68 -10 -30 0 -72 -2 -94 -6 -22 -3 -89 -8 -150 -10 -115 -4 -155 6 -155 40 0 26 43 64 73 64 15 0 27 4 27 9 0 6 17 11 38 13 29 2 36 7 34 21 -2 14 5 17 35 18 88 1 98 4 183 54 10 6 25 16 33 23 8 7 27 11 42 8 34 -6 55 2 48 20 -3 8 -1 14 4 14 6 0 22 10 36 23 22 18 27 31 27 68 0 62 -29 88 -107 98 -32 5 -62 10 -68 12 -5 2 -26 -6 -45 -17 -43 -26 -87 -37 -95 -24 -15 23 -155 -17 -155 -45 0 -8 -14 -17 -33 -20 -31 -6 -87 -46 -87 -63 0 -4 -11 -7 -25 -7 -31 0 -55 46 -35 70 6 8 9 23 5 35 -4 14 -1 22 10 26 9 4 36 25 59 48 67 66 119 106 137 106 10 0 29 14 42 30 14 17 30 30 34 30 5 0 22 13 37 29 25 26 29 38 28 87 0 62 -7 74 -45 78 -14 1 -32 8 -40 15 -12 9 -18 9 -28 -1 -8 -7 -23 -15 -34 -16 -26 -5 -78 -34 -88 -50 -4 -6 -26 -21 -48 -32 -21 -11 -39 -27 -39 -34 0 -20 -67 -76 -91 -76 -15 0 -26 -14 -42 -50 -12 -27 -28 -50 -34 -50 -7 0 -13 -4 -13 -10 0 -5 -7 -10 -15 -10 -8 0 -15 -6 -15 -14 0 -9 -13 -13 -44 -12 -24 0 -47 4 -51 8 -10 10 -13 158 -3 164 5 4 7 23 3 44 -6 33 -4 38 16 43 17 5 20 11 15 31 -3 14 -2 28 4 31 15 10 13 221 -3 237 -7 7 -23 28 -36 46 -19 27 -28 32 -64 32 -23 0 -49 -5 -57 -10z m-35 -839 c56 -4 101 -12 120 -23 17 -9 46 -24 65 -33 37 -17 80 -66 133 -150 25 -40 32 -62 33 -110 1 -33 5 -92 9 -131 7 -68 6 -72 -15 -79 -18 -6 -21 -12 -16 -36 5 -24 -2 -40 -31 -79 -21 -28 -44 -52 -53 -55 -8 -3 -23 -18 -32 -35 -18 -31 -45 -39 -66 -18 -9 9 -12 7 -12 -10 0 -20 -5 -22 -60 -22 -33 0 -60 -4 -60 -9 0 -9 -85 -26 -110 -22 -8 2 -22 9 -31 17 -8 8 -29 14 -46 14 -17 0 -36 6 -42 14 -7 8 -22 17 -34 20 -28 7 -147 120 -147 140 0 8 -4 25 -9 38 -5 13 -15 49 -22 81 -7 32 -16 60 -21 63 -19 12 -7 45 20 55 26 11 26 11 6 19 -25 10 -36 34 -22 48 5 5 14 29 19 53 6 24 15 50 22 57 6 8 12 22 12 31 0 8 13 22 28 29 21 10 27 19 24 33 -3 11 0 19 8 19 7 0 15 9 18 20 3 13 14 20 29 20 12 0 34 9 48 20 14 11 39 20 55 20 17 0 37 5 45 10 8 5 22 7 30 3 8 -3 56 -9 105 -12z";

export function SunMark({
  size = 26,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * (124.9 / 282.5)}
      viewBox="16.3 24.0 282.5 124.9"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* No clipPath needed: the viewBox is already the artwork's top half, and an
          SVG viewport clips its overflow. A clip-path here would be resolved in the
          flipped, 10x-scaled space of the transform below and land off-canvas. */}
      <g transform="translate(0,303) scale(0.1,-0.1)">
        <path d={SUN_PATH} />
      </g>
    </svg>
  );
}

/*
  One number scales the whole lockup. The sun, the subtitle and the row gap are
  ratios of it, taken from the proportions we settled on at 21px: sun 33/21,
  subtitle 10/21, gap 5/21. Change SCALE and everything moves together instead of
  four pixel values drifting apart.

  The tracking, the 0.275em nudge and the -mr correction stay in em, so they
  follow their own font size with no arithmetic here.
*/
const SCALE = 1.5;
const BASE = 21 * SCALE;
const SUN = BASE * (33 / 21);
const SUB = BASE * (10 / 21);
const GAP = BASE * (5 / 21);

export default function Logo() {
  return (
    <div className="inline-block leading-none">
      {/* items-baseline, not items-end with a hand-tuned margin.

          A replaced element like <svg> takes its bottom edge as its baseline, and
          the viewBox is cropped exactly at the sun's cut — so the cut edge lands on
          the wordmark's baseline with no magic number. The previous mb-[5px] was my
          estimate of the descender depth; the browser knows the real value.

          gap-0: tracking-[0.24em] already leaves ~5px of trailing space after the
          final O, and that is the optical gap. */}
      <div className="flex items-baseline gap-0">
        <span style={{ fontSize: BASE }}
          className="font-display font-bold leading-none tracking-[0.24em]">
          GIO
        </span>
        <SunMark size={SUN} className="shrink-0" />
      </div>
      {/* Tracking 0.47em (~92px wide), nudged 0.275em right — 3% of the line's own
          width, so the offset stays proportional if the type size changes.

          -mr equal to the tracking reclaims the space letter-spacing adds after the
          final R, which would otherwise run the box past the row above. */}
      <div style={{ marginTop: GAP }}>
        <span style={{ fontSize: SUB }}
          className="inline-block ml-[0.275em] font-semibold tracking-[0.47em] -mr-[0.47em]">
          IN THE DR
        </span>
      </div>
    </div>
  );
}
