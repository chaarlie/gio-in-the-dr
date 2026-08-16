import type { Area } from "./areas";
import { MAP_FRAME_OUTLIERS } from "./neighborhoods";

/*
  A picture of the map, from Mapbox's Static Images API.

  On a phone the interactive map costs 1.78 MB of JavaScript for something you
  cannot pan anyway — cooperativeGestures reserves one-finger drag for scrolling
  the page, which a full-bleed map has to do or it traps you. So small screens
  get an image and mapbox-gl loads only if someone opens the real map.

  Same framing as the live map on purpose — the coast bearing, the bay rather
  than the whole shoreline. Opening the real one should feel like the picture
  came alive, not like arriving somewhere else.
*/

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** Matches COAST_BEARING in AreaMapbox — the shoreline laid across the frame. */
const COAST_BEARING = 241;

/** Mapbox serves 512px tiles; the world is TILE * 2^zoom pixels across. */
const TILE = 512;

/*
  Mapbox rejects a request over 8192 characters with a 414, and six hand-traced
  rings run to ~40 points each. Full detail currently lands near 7.2 KB, so the
  overlay is built at decreasing detail and the first version that fits is used
  — the preview degrades to plain pins rather than to a broken image when Gio
  draws a more detailed boundary.
*/
const MAX_URL = 8192;

/** Web Mercator, normalised to a unit square. x and y share a scale, so it rotates cleanly. */
function project([lng, lat]: number[]): [number, number] {
  const phi = (lat * Math.PI) / 180;
  return [
    (lng + 180) / 360,
    (1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2,
  ];
}

function unproject([x, y]: [number, number]): { lng: number; lat: number } {
  return {
    lng: x * 360 - 180,
    lat: (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI,
  };
}

function rotate([x, y]: [number, number], radians: number): [number, number] {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [x * cos - y * sin, x * sin + y * cos];
}

/*
  Centre and zoom that fit the areas, measured in the rotated frame.

  The frame is turned to the coast bearing, so the box that has to fit is the
  bounding box *after* rotation — fitting the north-up box overflows the sides
  once it turns. Rotating the points, measuring there, then rotating the centre
  back is the whole trick.
*/
function fit(
  areas: Area[],
  width: number,
  height: number,
  padding: number,
): { lng: number; lat: number; zoom: number } | null {
  const points = areas.flatMap((a) => a.boundary?.[0] ?? (a.pin ? [[a.pin.lng, a.pin.lat]] : []));
  if (points.length < 2) return null;

  const radians = (-COAST_BEARING * Math.PI) / 180;
  const rotated = points.map((p) => rotate(project(p), radians));
  const xs = rotated.map((p) => p[0]);
  const ys = rotated.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  if (spanX <= 0 || spanY <= 0) return null;

  const zoom = Math.min(
    Math.log2((width - 2 * padding) / (spanX * TILE)),
    Math.log2((height - 2 * padding) / (spanY * TILE)),
  );

  const centre = unproject(rotate([(minX + maxX) / 2, (minY + maxY) / 2], -radians));
  // Mapbox caps at 22; the floor stops a single tiny area zooming into the weeds.
  return { ...centre, zoom: Math.max(1, Math.min(22, zoom)) };
}

/** Every nth point of a ring, first and last always kept so it stays closed. */
function thin(ring: number[][], step: number): number[][] {
  if (step <= 1) return ring;
  const out = ring.filter((_, i) => i % step === 0);
  const last = ring[ring.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/** Rounded to ~1 m. Precision no one can see at preview size costs URL budget. */
function round(ring: number[][]): number[][] {
  return ring.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
}

function polygonOverlay(areas: Area[], step: number): string | null {
  const features = areas
    .filter((a) => a.boundary?.[0]?.length)
    .map((a) => ({
      type: "Feature" as const,
      // simplestyle-spec — what the Static API reads off a GeoJSON overlay.
      properties: {
        fill: a.color,
        "fill-opacity": 0.45,
        stroke: a.color,
        "stroke-width": 1.5,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [round(thin(a.boundary![0], step))],
      },
    }));
  if (!features.length) return null;
  return `geojson(${encodeURIComponent(
    JSON.stringify({ type: "FeatureCollection", features }),
  )})`;
}

function pinOverlay(areas: Area[]): string | null {
  const pins = areas
    .filter((a) => a.pin)
    .map(
      (a) =>
        `pin-s+${a.color.replace("#", "")}(${a.pin!.lng.toFixed(5)},${a.pin!.lat.toFixed(5)})`,
    );
  return pins.length ? pins.join(",") : null;
}

/** Null when there's no token or nothing mappable — callers fall back to the live map. */
export function staticMapUrl(
  areas: Area[],
  { width = 720, height = 440, padding = 24, retina = true } = {},
): string | null {
  if (!TOKEN) return null;

  const framed = areas.filter((a) => !MAP_FRAME_OUTLIERS.has(a.slug));
  const view = fit(framed.length ? framed : areas, width, height, padding);
  if (!view) return null;

  const size = `${Math.round(width)}x${Math.round(height)}${retina ? "@2x" : ""}`;
  const camera = `${view.lng.toFixed(5)},${view.lat.toFixed(5)},${view.zoom.toFixed(2)},${COAST_BEARING}`;

  const build = (overlay: string | null) =>
    `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
    `${overlay ? `${overlay}/` : ""}${camera}/${size}` +
    `?access_token=${TOKEN}&logo=false&attribution=false`;

  // Most detail first; take the first that fits under Mapbox's URL limit.
  for (const step of [1, 2, 3, 5, 8]) {
    const url = build(polygonOverlay(framed, step));
    if (url.length <= MAX_URL) return url;
  }
  const pins = build(pinOverlay(framed));
  return pins.length <= MAX_URL ? pins : build(null);
}
