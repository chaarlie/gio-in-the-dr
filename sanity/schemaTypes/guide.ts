import { defineField, defineType } from "sanity";

/*
  A downloadable document — the buyer's guide, and whatever follows it.

  A document type rather than a single settings field, because this site speaks
  three languages and the guide already carries "English · Español · Italiano" on
  every page. When the translations exist they're three uploads, not three new
  fields and a deploy.

  The site asks for one by `slug`, so which file appears where is decided in the
  Studio and never depends on document order. Upload a new PDF over the old one
  and the download changes on the next revalidate — the URL the site links to is
  the asset's, so no deploy is involved.
*/
export const guide = defineType({
  name: "guide",
  title: "Downloadable guide",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "Shown on the download link, e.g. “Buyer’s Guide”.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        /*
          Drop apostrophes before slugifying rather than letting them become a
          separator. Sanity's default turned "Buyer's Guide" into "buyer-s-guide",
          which silently didn't match the "buyers-guide" the home page asks for —
          the upload worked and nothing appeared on the page.
        */
        slugify: (input) =>
          input
            .normalize("NFKD")
            .replace(/['’`]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
      },
      description:
        "How the site finds this file. The home page's download link looks for “buyers-guide”.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Summary",
      type: "text",
      rows: 2,
      description:
        "One line, shown under the download link. Say what's inside, not that it's a PDF — the link states that itself.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "file",
      title: "PDF",
      type: "file",
      options: { accept: "application/pdf" },
      description: "The file people download. Replacing it here replaces it on the site.",
      validation: (Rule) => Rule.required(),
    }),
    /*
      A separate image, because nothing here can rasterise a PDF. Sanity's image
      pipeline transforms images only, and rendering page one in the browser would
      mean shipping a PDF engine and downloading all 2.8 MB just to draw a
      thumbnail. Exporting the first page once is cheaper than either.
    */
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      description:
        "The guide's first page, exported as PNG or JPG. Shown on the home page; without it the card falls back to a plain panel.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "What the page shows, for screen readers.",
        }),
      ],
    }),
    defineField({
      name: "pages",
      title: "Page count",
      type: "number",
      description: "Shown on the card, e.g. “18 pages”. Leave blank to hide it.",
      validation: (Rule) => Rule.min(1).integer(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "file.asset.originalFilename" },
  },
});
