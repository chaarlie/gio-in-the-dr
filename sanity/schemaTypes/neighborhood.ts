import { defineField, defineType } from "sanity";

/*
  A Cabarete micro-neighbourhood: Kite Beach, Cabarete Center, ProCab…

  `boundary` is the field that makes the map self-serve. Sanity has no polygon
  type, so the shape is pasted as GeoJSON — draw it at geojson.io, copy, paste,
  publish. The map re-reads it with no deploy. Until it's filled in, the site
  falls back to the approximate shapes committed in app/lib/area-shapes.json.
*/
export const neighborhood = defineType({
  name: "neighborhood",
  title: "Neighbourhood",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "blurb",
      title: "One-line character",
      type: "text",
      rows: 2,
      description: "What this area feels like. Shown under the name.",
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "pin",
      title: "Map pin",
      type: "geopoint",
      description: "Roughly the centre. Used to label and zoom the map.",
    }),
    defineField({
      name: "boundary",
      title: "Boundary (GeoJSON)",
      type: "text",
      rows: 4,
      description:
        "Draw the area at geojson.io, then paste the Polygon here. Leave blank to use the built-in approximate shape.",
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          try {
            const parsed = JSON.parse(value as string);
            // geojson.io hands you a FeatureCollection — accept that shape too,
            // otherwise the obvious copy-paste gets rejected.
            const g =
              parsed.type === "FeatureCollection"
                ? parsed.features?.[0]?.geometry
                : parsed.type === "Feature"
                  ? parsed.geometry
                  : parsed;
            if (g?.type !== "Polygon" && g?.type !== "MultiPolygon") {
              return "Needs a Polygon — paste the whole export from geojson.io.";
            }
            return true;
          } catch {
            return "That isn't valid JSON — copy the whole GeoJSON block.";
          }
        }),
    }),
    defineField({
      name: "color",
      title: "Map colour",
      type: "color",
      options: { disableAlpha: true },
      description:
        "Any colour you like — this overrides the built-in beach-to-inland ramp for this area. Leave blank to use the ramp.",
    }),
    defineField({
      name: "sortOrder",
      title: "Distance from the beach",
      type: "number",
      description:
        "0 = right on the sand, 5 = furthest inland. Drives the map's colour ramp.",
      validation: (Rule) => Rule.required().min(0).max(5).integer(),
      initialValue: 0,
    }),
    defineField({
      name: "marketPricePerM2",
      title: "Market price per m² (USD)",
      type: "number",
      description:
        "Your figure for the area, not an average of your listings. Leave blank rather than guessing — the site hides what's empty.",
    }),
    defineField({
      name: "walkToBeach",
      title: "Walk to the beach",
      type: "string",
      description: 'Free text, e.g. "Under 1 min", "6–8 min".',
    }),
    defineField({
      name: "driveToBeach",
      title: "Drive to the beach",
      type: "string",
    }),
    defineField({
      name: "hoaNote",
      title: "Typical HOA",
      type: "string",
      description: 'e.g. "$2.00–2.09 / m² / month".',
    }),
    defineField({
      name: "activities",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "body",
      title: "Area guide",
      type: "array",
      of: [{ type: "block" }],
      description: "The long-form guide. This is what ranks.",
    }),
  ],
  orderings: [
    {
      name: "byDistance",
      title: "Beach → inland",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "blurb" },
  },
});
