import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SUN_PATH, SUN_ART } from "../components/Logo";
import { DEFAULT_LOCALE, isLocale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";

/*
  The share card.

  There was none, so WhatsApp, iMessage and every other unfurler fell back to
  the only image the site offered: app/favicon.ico, which was still the untouched
  create-next-app default — the Vercel triangle. Gio was sending links to her own
  listings and they arrived branded as someone else's deploy platform.

  Built rather than drawn so the wordmark stays the wordmark: the sun is the same
  traced path the header renders, imported from Logo rather than copied, so the
  stamp on a shared link can never drift from the stamp on the site.

  Applies to every page under [locale]. Listings and posts override it with their
  own photo, which is what you want — a specific villa beats a logo. This is the
  fallback for the pages that have no single photograph to speak for them.
*/

export const alt = "Gio In The DR — property in Cabarete, Dominican Republic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#f1e8df";
const INK = "#1b1917";
const MUTED = "#8a8175";
const LINE = "#e2d9cc";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].home;

  /*
    Satori reads ttf/otf/woff but not woff2, and next/font only leaves woff2 in
    the build — hence @fontsource for the same family the site already sets.
  */
  const dir = join(
    process.cwd(),
    "node_modules/@fontsource/source-serif-4/files",
  );
  const [regular, bold, portrait] = await Promise.all([
    readFile(join(dir, "source-serif-4-latin-400-normal.woff")),
    readFile(join(dir, "source-serif-4-latin-700-normal.woff")),
    readFile(join(process.cwd(), "assets/og-portrait.jpg")),
  ]);

  const photo = `data:image/jpeg;base64,${portrait.toString("base64")}`;
  const tagline =
    locale === "es"
      ? "Cabarete · Sosúa · Costa norte dominicana"
      : "Cabarete · Sosúa · Dominican north coast";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: CREAM,
          fontFamily: "Source Serif 4",
        }}
      >
        {/* Left: the lockup and what the site is for. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 760,
            padding: "64px 56px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <span
                style={{
                  fontSize: 76,
                  fontWeight: 700,
                  color: INK,
                  letterSpacing: "0.24em",
                  lineHeight: 1,
                }}
              >
                GIO
              </span>
              <svg
                width={72}
                height={72 * (SUN_ART.h / SUN_ART.w)}
                viewBox={`${SUN_ART.x} ${SUN_ART.y} ${SUN_ART.w} ${SUN_ART.h}`}
                fill={INK}
              >
                <g transform="translate(0,284) scale(0.1,-0.1)">
                  <path d={SUN_PATH} />
                </g>
              </svg>
            </div>
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: INK,
                letterSpacing: "0.33em",
                marginTop: 10,
              }}
            >
              IN THE DR
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 46,
                fontWeight: 700,
                color: INK,
                lineHeight: 1.15,
              }}
            >
              {t.metaTitle.split("—")[1]?.trim() ?? t.metaTitle}
            </span>
            <div
              style={{
                display: "flex",
                width: 96,
                height: 3,
                background: INK,
                margin: "26px 0",
              }}
            />
            <span style={{ fontSize: 26, color: MUTED, letterSpacing: "0.02em" }}>
              {tagline}
            </span>
          </div>
        </div>

        {/* Right: Gio. A face outperforms a wordmark in a chat thread. */}
        <div style={{ display: "flex", width: 440, borderLeft: `1px solid ${LINE}` }}>
          <img src={photo} width={440} height={630} style={{ objectFit: "cover" }} alt="" />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Source Serif 4", data: regular, weight: 400, style: "normal" },
        { name: "Source Serif 4", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
