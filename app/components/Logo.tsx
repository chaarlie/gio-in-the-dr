// GIO wordmark + the hand-drawn sun.
//
// Artwork: gio-sun-stamp (potrace trace of Gio's hand-drawn sun), the full
// 12-ray stamp. An earlier version cropped this to the top half; it is whole
// now, at half the width, so it occupies the same slot in the lockup.
//
// The supplied cream and dark files are identical apart from their fill
// (#f3eee3 / #14120f), so neither is shipped — the path is inlined once with
// currentColor, which is correct on the cream header and the dark footer from a
// single component.
//
// Two subpaths: the outer star and the hollow centre. potrace emits them with
// opposite winding, so the default nonzero fill-rule punches the hole for free;
// do not add fillRule="evenodd" thinking it is needed.

import type { CSSProperties } from "react";

const SUN_PATH =
  "M1560 2681 c0 -14 -8 -21 -27 -23 l-28 -3 -7 -114 c-3 -62 -11 -116 -16 -120 -6 -3 -13 -66 -17 -140 -7 -118 -10 -134 -26 -138 -11 -3 -19 -12 -19 -19 0 -9 -11 -14 -32 -14 -50 1 -101 66 -123 156 -9 38 -23 92 -31 119 -8 28 -19 77 -24 109 -5 33 -14 64 -20 70 -5 5 -10 17 -10 26 0 36 -62 78 -125 85 -59 6 -60 6 -78 -24 -17 -29 -17 -40 -7 -129 7 -53 16 -99 20 -102 4 -3 22 -42 39 -87 18 -44 48 -102 67 -128 35 -45 36 -49 32 -115 -5 -93 -16 -104 -96 -97 -77 8 -72 4 -292 207 -136 126 -196 139 -282 61 -50 -44 -35 -130 31 -191 41 -37 97 -80 105 -80 3 0 26 -15 52 -32 25 -18 78 -53 118 -78 l71 -46 3 -62 3 -62 -35 0 c-19 0 -60 -6 -90 -14 -43 -12 -101 -14 -258 -10 -177 4 -210 3 -258 -13 l-55 -18 -3 -52 c-3 -44 0 -53 17 -63 12 -6 21 -21 21 -33 0 -21 7 -24 88 -35 122 -16 259 -24 380 -22 79 1 108 -2 120 -13 9 -8 27 -18 40 -21 40 -13 27 -116 -16 -116 -7 0 -28 -11 -46 -25 -18 -14 -41 -25 -51 -25 -23 0 -76 -17 -131 -42 -22 -10 -61 -18 -87 -18 -26 0 -47 -4 -47 -10 0 -5 -16 -10 -35 -10 -39 0 -105 -24 -105 -37 0 -5 -20 -19 -45 -31 -30 -15 -45 -28 -45 -41 0 -11 -9 -23 -20 -26 -36 -12 -28 -103 12 -142 40 -37 155 -56 178 -28 7 8 19 15 26 15 7 0 21 11 30 25 9 14 23 25 30 25 13 0 37 10 74 32 8 5 23 11 32 14 9 3 18 16 20 28 3 18 12 22 66 29 47 6 71 14 90 33 25 22 34 24 102 22 l75 -3 3 -59 c3 -58 3 -59 -42 -101 -26 -23 -46 -47 -46 -53 0 -6 -6 -15 -13 -19 -6 -4 -32 -33 -57 -64 -25 -31 -69 -71 -98 -90 -50 -32 -82 -73 -82 -108 0 -9 -14 -29 -31 -46 -27 -26 -30 -34 -27 -84 4 -68 23 -85 69 -59 17 10 44 18 59 18 16 0 33 6 37 13 14 22 61 47 88 47 37 0 74 46 75 92 0 41 8 48 65 63 35 10 42 17 56 55 9 24 21 46 28 48 6 2 11 9 11 17 0 7 7 18 15 25 8 7 15 22 15 34 0 27 46 46 110 46 l43 0 -6 -77 c-4 -55 -14 -96 -33 -138 -26 -57 -37 -101 -50 -207 -5 -39 -10 -48 -27 -48 -19 0 -20 -5 -15 -83 7 -103 14 -117 78 -150 64 -33 78 -34 86 -2 3 14 10 25 14 25 17 0 70 92 70 121 0 17 6 32 15 35 11 5 15 22 15 63 0 32 5 62 12 69 7 7 16 41 19 75 23 216 46 271 111 265 31 -3 33 -6 39 -48 3 -25 14 -61 24 -80 17 -31 18 -43 6 -144 -8 -76 -9 -112 -1 -120 5 -5 10 -44 10 -86 0 -113 44 -180 118 -180 111 0 149 97 132 341 -11 170 -16 199 -38 216 -11 9 -13 24 -8 63 10 74 14 80 52 80 30 0 38 -6 64 -47 17 -26 30 -52 30 -58 0 -7 9 -20 20 -30 11 -10 20 -28 20 -40 0 -13 7 -28 15 -35 8 -7 15 -20 15 -30 0 -9 9 -29 20 -43 11 -14 20 -30 20 -35 0 -29 110 -147 162 -173 103 -52 176 0 163 118 -7 68 -42 148 -84 193 -13 14 -39 50 -58 80 -20 30 -38 57 -42 60 -3 3 -32 35 -63 72 -48 55 -58 72 -58 103 l0 38 77 -7 c59 -6 85 -13 109 -31 42 -32 226 -125 248 -125 16 0 26 -4 74 -29 24 -12 88 -6 98 10 3 5 22 9 43 9 46 0 61 14 61 60 0 58 -34 116 -83 142 -54 28 -174 68 -207 68 -15 0 -30 4 -36 10 -5 5 -43 16 -84 25 -41 9 -79 20 -84 25 -6 6 -21 10 -33 10 -63 0 -123 51 -123 103 l0 40 70 -6 c39 -3 72 -2 75 4 4 5 65 9 137 9 152 0 233 12 303 46 28 13 61 24 75 25 18 0 32 10 48 35 32 51 29 81 -15 121 l-36 35 -126 -6 c-69 -3 -160 -10 -201 -15 -41 -6 -146 -14 -232 -17 l-158 -7 0 32 c0 48 16 71 50 71 17 0 30 5 30 10 0 6 16 10 35 10 28 0 35 4 35 20 0 18 7 20 58 20 56 0 99 15 167 59 17 11 47 20 68 20 30 1 40 6 44 21 3 11 10 20 17 20 53 1 76 117 32 159 -37 35 -158 48 -200 22 -23 -15 -49 -19 -103 -19 -77 1 -143 -21 -143 -47 0 -8 -14 -17 -33 -20 -19 -4 -46 -18 -60 -31 -16 -14 -38 -24 -57 -24 -30 0 -30 0 -30 55 0 42 4 57 16 62 9 3 35 24 59 47 73 70 119 106 136 106 10 0 29 14 42 30 14 17 30 30 34 30 5 0 22 13 37 29 25 26 27 34 24 92 l-3 64 -51 13 c-49 14 -53 13 -110 -14 -32 -15 -63 -33 -67 -40 -4 -7 -24 -21 -43 -30 -20 -9 -39 -27 -44 -38 -11 -30 -53 -66 -86 -75 -20 -5 -35 -20 -49 -48 -22 -44 -47 -73 -64 -73 -6 0 -11 -4 -11 -10 0 -5 -22 -10 -49 -10 -47 0 -50 1 -56 31 -12 53 4 219 21 219 9 0 14 11 14 29 0 17 5 33 10 36 15 10 13 221 -3 237 -7 7 -23 28 -36 46 -28 40 -111 49 -111 13z m80 -857 c25 -13 50 -24 57 -24 18 0 89 -79 127 -142 27 -45 35 -71 40 -130 4 -40 9 -100 12 -132 5 -48 3 -61 -10 -68 -9 -5 -16 -22 -16 -39 0 -33 -63 -125 -92 -135 -9 -3 -20 -14 -23 -25 -5 -14 -15 -19 -46 -19 -32 0 -39 -3 -39 -20 0 -18 -7 -20 -59 -20 -33 0 -61 -4 -63 -10 -6 -19 -122 -24 -137 -6 -7 9 -28 16 -46 16 -18 0 -38 6 -44 14 -7 8 -22 17 -34 20 -28 7 -147 120 -147 140 0 8 -4 25 -9 38 -48 125 -49 288 -2 376 5 9 12 25 15 35 3 11 15 21 26 24 13 3 20 14 20 29 0 14 6 24 14 24 7 0 16 9 19 20 3 12 14 20 27 20 12 0 34 9 49 19 53 38 285 34 361 -5z";

/*
  The viewBox is the artwork's own bounding box, not the 296x284 canvas potrace
  exported. That canvas carries ~14 units of uneven whitespace on each side,
  which would show up as a lopsided gap next to the wordmark that no flex gap
  could correct. Cropping to the ink means `size` is the visible sun.
*/
const ART = { x: 14.2, y: 15.9, w: 266.6, h: 253.1 };

export function SunMark({
  size = 26,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size * (ART.h / ART.w)}
      viewBox={`${ART.x} ${ART.y} ${ART.w} ${ART.h}`}
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* potrace works bottom-up in tenths of a unit; this flips and scales its
          output into the viewBox above. Straight from the exported file. */}
      <g transform="translate(0,284) scale(0.1,-0.1)">
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

  SUN_RATIO shrinks the sun from that 33/21. At full width the whole circle
  stands about 47px tall against a 22px cap height — it swamps the wordmark and
  forces the header row taller. At 0.65 it reads as a stamp beside the caps
  rather than a second word.

  SUN_DROP is a transform, not a margin, so the sun moves without reflowing the
  row — the header keeps its height and the wordmark does not shift. The
  percentage resolves against the sun's own height, so the nudge stays
  proportional at any SCALE.

  The tracking, the 0.275em nudge and the -mr correction stay in em, so they
  follow their own font size with no arithmetic here.
*/
const SCALE = 1.5;
const BASE = 21 * SCALE;
const SUN_RATIO = 0.65;
const SUN_DROP = "15%";
const SUN = BASE * (33 / 21) * SUN_RATIO;
const SUB = BASE * (10 / 21);
const GAP = BASE * (5 / 21);

export default function Logo() {
  return (
    <div className="inline-block leading-none">
      {/* items-baseline: a replaced element like <svg> takes its bottom edge as
          its baseline, so the stamp sits on the wordmark's baseline the way the
          cropped sun's cut edge used to — no magic number, and it stays put if
          the type size changes.

          gap-0: tracking-[0.24em] already leaves ~5px of trailing space after the
          final O, and that is the optical gap. */}
      <div className="flex items-baseline gap-0">
        <span
          style={{ fontSize: BASE }}
          className="font-display font-bold leading-none tracking-[0.24em]"
        >
          GIO
        </span>
        <SunMark
          size={SUN}
          className="shrink-0"
          style={{ transform: `translateY(${SUN_DROP})` }}
        />
      </div>
      {/* Tracking 0.47em (~92px wide), nudged 0.275em right — 3% of the line's own
          width, so the offset stays proportional if the type size changes.

          -mr equal to the tracking reclaims the space letter-spacing adds after the
          final R, which would otherwise run the box past the row above. */}
      <div style={{ marginTop: GAP }}>
        <span
          style={{ fontSize: SUB }}
          className="inline-block ml-[0.15em] font-semibold tracking-[0.33em] -mr-[0.47em]"
        >
          IN THE DR
        </span>
      </div>
    </div>
  );
}
