import { defineField, defineType } from "sanity";

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
    defineField({
      name: "images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
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
