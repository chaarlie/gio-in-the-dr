/*
  Pulling the boundary ring out of whatever geojson.io hands you.

  Its export is a FeatureCollection holding everything on the canvas, so the
  polygon is rarely the only feature and not reliably the first — a couple of
  dropped markers, or a line traced before the shape, and it sits at index 3.
  Reading features[0] rejected valid exports in the Studio and silently fell
  back to the built-in shape at runtime, so both callers scan instead.

  A bare Polygon or a single Feature also work; those are what you get from
  pasting a fragment by hand.
*/

type Geometry = { type?: string; coordinates?: unknown };

/** First Polygon/MultiPolygon anywhere in the input, or null. */
export function findPolygon(parsed: unknown): Geometry | null {
  if (!parsed || typeof parsed !== "object") return null;
  const node = parsed as { type?: string; geometry?: Geometry; features?: unknown[] };

  if (node.type === "Polygon" || node.type === "MultiPolygon") return node as Geometry;
  if (node.type === "Feature") return findPolygon(node.geometry);
  if (Array.isArray(node.features)) {
    for (const f of node.features) {
      const found = findPolygon(f);
      if (found) return found;
    }
  }
  return null;
}

/** The outer ring(s), in the shape mapbox wants: number[][][]. */
export function polygonRings(parsed: unknown): number[][][] | null {
  const geom = findPolygon(parsed);
  if (!geom) return null;
  // MultiPolygon nests one level deeper; the map draws a single area, so take
  // the first part rather than trying to render holes and islands.
  return geom.type === "MultiPolygon"
    ? ((geom.coordinates as number[][][][])[0] ?? null)
    : (geom.coordinates as number[][][]);
}
