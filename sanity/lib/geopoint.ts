import type { GeopointRule, GeopointValue, RuleDef } from "sanity";

/*
  Sanity's geopoint takes two numbers and does not range-check them, so the two
  ways people actually mistype a coordinate both save without complaint:

    -70403404    the decimal point dropped
    194544.7     19°45'44.7" pasted with the separators stripped

  Neither is plottable, and mapbox throws while building its markers — during
  render, so one bad field in the Studio blanks the whole page rather than one
  pin. The site guards against it too (app/lib/areas.ts), but a value that can
  never be right is better refused at the point it is typed.

  The DMS case is worth naming in the message: it comes from Google Maps, which
  shows DMS by default, and the fix is not obvious if you don't know the reading
  is 19°45'44.7" rather than the number 194544.7.
*/
export function geopointInRange(rule: RuleDef<GeopointRule, GeopointValue>) {
  return rule.custom((point) => {
    if (!point) return true;

    const { lat, lng } = point;
    if (typeof lat !== "number" || typeof lng !== "number") return true;

    const bad: string[] = [];
    if (!Number.isFinite(lat) || Math.abs(lat) > 90) bad.push(`latitude ${lat}`);
    if (!Number.isFinite(lng) || Math.abs(lng) > 180) bad.push(`longitude ${lng}`);
    if (bad.length === 0) return true;

    return (
      `Out of range: ${bad.join(" and ")}. Use decimal degrees — around ` +
      `19.76 / -70.42 here. Google Maps shows 19°45'44.7" N 70°29'20.4" W; ` +
      `that is 19.762417 / -70.488999, not 194544.7 / -702920.4.`
    );
  });
}
