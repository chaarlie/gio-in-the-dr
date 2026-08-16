/*
  Distances between two points on the ground.

  Client-safe and dependency-free: the listings need this in the browser, where a
  slider recomputes a walk time as you drag it.
*/

export type Point = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_000;

/*
  Haversine. Over the couple of kilometres this site deals in, a flat
  approximation would be within a metre or two — but haversine is four lines and
  doesn't quietly stop being true if Gio ever lists somewhere further afield.
*/
export function distanceMetres(a: Point, b: Point): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/*
  Walking paces, metres per minute.

  Preferred walking speed is around 1.4 m/s — 84 m/min — and these bracket it.
  The point of offering the range is that "5 minutes to the beach" means
  different things to a jogger and to someone carrying a toddler and a cool box,
  and a buyer knows which one they are.
*/
export const PACES = [
  { id: "stroll", label: "Strolling", metresPerMinute: 60 },
  { id: "walk", label: "Walking", metresPerMinute: 84 },
  { id: "brisk", label: "Brisk", metresPerMinute: 110 },
] as const;

export type PaceId = (typeof PACES)[number]["id"];

/** Minutes to cover a distance, never rounded below 1 — "0 min" reads as broken. */
export function walkMinutes(metres: number, metresPerMinute: number): number {
  return Math.max(1, Math.round(metres / metresPerMinute));
}

/** "310 m" or "1.2 km" — metres are what people picture at this range. */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}
