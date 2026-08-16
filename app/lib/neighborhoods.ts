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
  Cabarete micro-neighbourhoods.

  Moves to Sanity so Gio maintains it — average price and walk times go stale, and
  she's the one who knows them. Anything she hasn't confirmed is `null` and renders
  as "To confirm" rather than a made-up number: these are claims buyers act on.

  `tone` indexes the ordinal ramp below (0 = closest to the sand). Colour encodes
  distance from the beach, not identity — six identity hues cannot pass CVD
  separation on a map, so identity is carried by the label on each zone instead.
*/

export type Neighborhood = {
  slug: string;
  name: string;
  blurb: string;
  /** Ordinal ramp index, 0-5. Lower = closer to the water. */
  tone: number;
  /** Display strings. null = not yet confirmed by Gio. */
  avgPrice: string | null;
  walkToBeach: string | null;
  driveToBeach: string | null;
  hoa: string | null;
  activities: string[];
};

/**
 * Single-hue ordinal ramp, validated against the cream surface: monotone
 * lightness, adjacent ΔL ≥ 0.06, light end 2.22:1 vs surface, hue spread 17°.
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

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    slug: "kite-beach",
    name: "Kite Beach",
    blurb: "The kite and wing-foil end of the bay. Low-rise condos right on the sand.",
    tone: 0,
    avgPrice: null,
    walkToBeach: null,
    driveToBeach: null,
    hoa: null,
    activities: ["Kitesurfing", "Wing foiling", "Beach bars"],
  },
  {
    slug: "kite-point",
    name: "Kite Point",
    blurb: "The point at the western end — quieter, and the launch everyone walks to.",
    tone: 1,
    avgPrice: null,
    walkToBeach: null,
    driveToBeach: null,
    hoa: null,
    activities: ["Kitesurfing", "Sunset walks"],
  },
  {
    slug: "cabarete-center",
    name: "Cabarete Center",
    blurb:
      "Cabarete Bay itself. Restaurants, cafés and supermarkets on foot; the most walkable address on the coast.",
    tone: 2,
    avgPrice: null,
    walkToBeach: "Under 1 min",
    driveToBeach: null,
    // From Gio's own listings: Coccoloba quotes per-m², Seawinds a flat monthly fee.
    hoa: "$2.00–2.09 / m² / month",
    activities: ["Restaurants", "Nightlife", "Water sports", "Supermarkets"],
  },
  {
    slug: "callejon",
    name: "Callejón",
    blurb: "The lane running back off the bay — walkable to town, a step quieter.",
    tone: 3,
    avgPrice: null,
    walkToBeach: null,
    driveToBeach: null,
    hoa: null,
    activities: ["Local dining", "Walk to town"],
  },
  {
    slug: "perla-marina",
    name: "Perla Marina",
    blurb: "Residential and green, east toward Sosúa. Villas and gated lots.",
    tone: 4,
    avgPrice: null,
    walkToBeach: null,
    driveToBeach: null,
    hoa: null,
    activities: ["Villas", "Quiet beaches", "Gated living"],
  },
  {
    slug: "procab",
    name: "ProCab",
    blurb: "Inland from the bay. More space and more house for the money.",
    tone: 5,
    avgPrice: null,
    walkToBeach: null,
    driveToBeach: null,
    hoa: null,
    activities: ["Family homes", "Larger lots"],
  },
];
