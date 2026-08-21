import { ImageResponse } from "next/og";
import { SUN_PATH, SUN_ART } from "../components/Logo";

/*
  The browser-tab and share-fallback icon.

  This replaces app/favicon.ico, which was the untouched create-next-app default
  — the Vercel triangle. It is what WhatsApp was putting next to Gio's listings
  whenever a page had no og:image of its own.

  The sun is imported from Logo, not copied, for the same reason the share card
  imports it: one artwork, one source.
*/

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1e8df",
        }}
      >
        <svg
          width={58}
          height={58 * (SUN_ART.h / SUN_ART.w)}
          viewBox={`${SUN_ART.x} ${SUN_ART.y} ${SUN_ART.w} ${SUN_ART.h}`}
          fill="#1b1917"
        >
          <g transform="translate(0,284) scale(0.1,-0.1)">
            <path d={SUN_PATH} />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
