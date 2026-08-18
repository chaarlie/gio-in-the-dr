import { defineArrayMember, defineField, defineType } from "sanity";
import { geopointInRange } from "../lib/geopoint";

/*
  A listing.

  Two deliberate splits, both learned from the existing data:

  - `priceUsd` (number) is separate from any display string. You can't filter or
    average "$1.2M".
  - `hoaAmount` carries a `hoaUnit`, because the real listings mix conventions:
    Coccoloba quotes $2.00/m²/month, Seawinds a flat $433/month. Without the unit
    they can't be compared.

  `neighborhood` is a plain reference and is the source of truth. Deriving it from
  the pin with geo::contains() looks tidier but fails silently — a pin five metres
  outside a boundary belongs nowhere, and nobody notices until an area page is
  short a listing. The pin drives the map; the reference decides membership.
*/
export const property = defineType({
  name: "property",
  title: "Property",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      description: "Becomes the page address: /properties/<slug>",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Reserved", value: "reserved" },
          { title: "Sold", value: "sold" },
        ],
        layout: "radio",
      },
      initialValue: "available",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "neighborhood",
      title: "Neighbourhood",
      type: "reference",
      to: [{ type: "neighborhood" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Map pin",
      type: "geopoint",
      description: "Drop the pin on the building. Shows as a dot on the area map.",
      validation: geopointInRange,
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: [
          "Beachfront Condos",
          "Villas",
          "Investment Properties",
          "Pre-Construction",
          "Luxury Properties",
          "Owner Financing Opportunities",
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "priceUsd",
      title: "Price (USD)",
      type: "number",
      description: "Just the number — 400000. Formatting happens on the site.",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "beds",
      title: "Bedrooms",
      type: "number",
      description: "Leave blank for land. Blank never matches a rooms filter.",
      validation: (Rule) => Rule.min(0).max(30),
    }),
    defineField({ name: "baths", title: "Bathrooms", type: "number" }),
    defineField({
      name: "areaM2",
      title: "Interior area (m²)",
      type: "number",
      description: "Drives price per m², which the area stats average.",
    }),
    defineField({
      name: "hoaAmount",
      title: "HOA amount",
      type: "number",
      description:
        'The number only. If you picked "per m² per month" this is a rate like 2.09, not the whole bill.',
      /*
        The two units differ by ~200x, so mixing them up is not a rounding error:
        433 filed as a rate against a 162 m² floor plan renders $70,414 a month.
        A warning rather than an error — it is a strong smell, not an
        impossibility, and blocking a save on a heuristic is how people learn to
        fight the Studio.
      */
      validation: (Rule) =>
        Rule.custom((amount, context) => {
          const unit = (context.document as { hoaUnit?: string } | undefined)?.hoaUnit;
          if (typeof amount !== "number" || unit !== "per-m2-month") return true;
          if (amount <= 25) return true;
          return (
            `${amount} per m² per month is about ${Math.round(amount / 2)}x the going rate ` +
            `on this coast (~$2.00–2.09). If ${amount} is the whole monthly bill, ` +
            'switch "HOA is charged" to "flat per month".'
          );
        }).warning(),
    }),
    defineField({
      name: "hoaUnit",
      title: "HOA is charged",
      type: "string",
      options: {
        list: [
          { title: "per m² per month", value: "per-m2-month" },
          { title: "flat per month", value: "flat-month" },
        ],
        layout: "radio",
      },
      initialValue: "flat-month",
    }),
    defineField({
      name: "walkToBeachMin",
      title: "Walk to the beach (minutes)",
      type: "number",
      description:
        "Your number, not a routing API's — you know which paths and gates are real.",
    }),
    defineField({
      name: "floors",
      title: "Floors in the building",
      type: "number",
      description: "Only used by the 3D map experiment. Safe to leave blank.",
    }),
    /*
      Photo gallery. `layout: "grid"` is what turns this from a stacked list into
      a thumbnail grid you can drag files onto and reorder — the list layout has
      no drop target of its own, which is most of why dropping several files at
      once behaved badly here.

      `alt` is deliberately optional. Making it required would mean every file
      dropped in a batch lands invalid, and a gallery that goes red the moment
      you fill it teaches people to ignore the warning.
    */
    defineField({
      name: "images",
      title: "Photos",
      type: "array",
      options: { layout: "grid" },
      description:
        "Drag several photos in at once, or use Add item ▸ Upload and multi-select. First photo is the one on the card.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description: "What the photo shows — for screen readers and image search.",
              validation: (Rule) =>
                Rule.warning("Worth adding: it's what image search reads."),
            }),
          ],
        }),
      ],
    }),
    /*
      Derived search fields. Hidden, never typed — rewritten from title, spec,
      category and neighbourhood whenever the document is published.

      searchText is the folded copy: accents stripped, lowercased. GROQ's match
      is accent-sensitive and takes one "*" per pattern, so "sosua" can never be
      made to match "Sosúa" from the query side alone — a prefix cannot skip a
      letter, and the single wildcard cannot be a prefix and a substitution at
      once. Fold both sides and it is a plain prefix match again.

      searchPhonetic is the Double Metaphone of the same tokens, used only when
      the folded query returns nothing. It catches the misspellings a Spanish
      speaker actually makes — cavarete, sozua — but "bath" and "bed" share a
      code, so it can never be the primary index on a property site.
    */
    defineField({
      name: "searchText",
      title: "Search text (generated)",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "searchPhonetic",
      title: "Search phonetics (generated)",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "spec",
      title: "Short spec line",
      type: "string",
      description: 'Shown on the card, e.g. "2 Bed · Beachfront · 40m to sand".',
    }),
    defineField({
      name: "body",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "sourceUrl",
      title: "Listing on the brokerage site",
      type: "url",
      description:
        "Link out rather than duplicating the copy — competing with your own brokerage for the same keywords loses.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "neighborhood.name", media: "images.0" },
  },
});
