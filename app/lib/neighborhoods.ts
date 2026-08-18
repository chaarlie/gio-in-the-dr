/*
  Areas too far out to share a frame with the bay. Perla Marina is ~7 km west and
  Casa Linda is over by Sosúa; fitting the map to either shrinks the Cabarete
  neighbourhoods to specks in the middle of a lot of sea. They are still drawn —
  zoom out and they are there — they just don't get to set the viewport.

  Lives here because both the live map and the static preview have to agree, and
  they did not: the interactive map excluded only Perla Marina, so adding Casa
  Linda silently pulled its centre halfway to Sosúa.
*/
export const MAP_FRAME_OUTLIERS = new Set(["perla-marina", "casa-linda"]);

/*
  What's left in this file is presentation, not content.

  The neighbourhood list, their blurbs and their boundary shapes all used to be
  committed here and in area-shapes.json, and getAreas() merged them field by
  field with whatever Sanity returned. That merge is gone: Sanity is the only
  source of neighbourhood data now, so an area Gio hasn't filled in reads as
  empty instead of quietly showing a value nobody in the Studio can see or edit.

  The ramp below stays because it isn't data — it's the colour scale the map and
  the legend both draw from, and it has to match between them.
*/

/**
 * Single-hue ordinal ramp, validated against the cream surface: monotone
 * lightness, adjacent ΔL ≥ 0.06, light end 2.22:1 vs surface, hue spread 17°.
 *
 * Indexed by sortOrder (0 = closest to the sand). Colour encodes distance from
 * the beach, not identity — six identity hues cannot pass CVD separation on a
 * map, so identity is carried by the label on each zone instead. A neighbourhood
 * with its own `color` in Sanity overrides this.
 */
export const AREA_TONES = [
  "#b59a6e",
  "#9f8154",
  "#88673d",
  "#6f4f2c",
  "#56391d",
  "#3c2611",
] as const;

/** Fill is dark enough from step 2 on that cream text is the readable choice. */
export const AREA_LABEL_INK = ["#2a1e10", "#2a1e10", "#f4efe6", "#f4efe6", "#f4efe6", "#f4efe6"] as const;
