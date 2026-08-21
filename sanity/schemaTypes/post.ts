import { defineArrayMember, defineField, defineType } from "sanity";

/*
  A blog post — the buyer's-guide content that answers the questions Gio gets on
  WhatsApp before anyone is ready to talk to an agent.

  No author field: one person writes this site, and a byline picker that only ever
  has one option is a field she'd have to fill in every time for no reader benefit.
  Reading time is derived from the body on the site rather than stored, for the same
  reason — a number that can silently disagree with the text is worse than no number.

  `excerpt` is required because it's doing two jobs: the card summary and the meta
  description. Left blank, Google writes its own, and it writes worse ones.
*/
export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    /*
      Translation. A Spanish post is its own document, not a second set of
      fields on the English one — a Spanish guide is a different article, not a
      field-by-field mirror, and it needs its own slug. "donde-vivir-en-cabarete"
      is what Spanish readers search for, and a shared slug throws that away.
    */
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "Español", value: "es" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "en",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "translationOf",
      title: "Translation of",
      type: "reference",
      to: [{ type: "post" }],
      description: "The English post this was translated from.",
      // Only meaningful on a translation; the English original has nothing above it.
      hidden: ({ document }) => document?.language === "en" || !document?.language,
    }),
    /*
      The revision of the English post this was translated from.

      Written by the translation script, never by hand. The site does not read it;
      it exists so the Studio can say "the English has changed since this was
      translated" — which is the one failure mode of keeping two documents in step.
      Without it a stale translation looks exactly like a current one.
    */
    defineField({
      name: "sourceRev",
      title: "Translated from revision",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      description: "Becomes the page address: /blog/<slug>",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Summary",
      type: "text",
      rows: 3,
      description:
        "One or two sentences. Shown on the blog index and used as the search-result description.",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "publishedAt",
      title: "Published",
      type: "datetime",
      description: "Sorts the index. Post-date it and it still shows — publishing is the switch.",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "topic",
      type: "string",
      options: {
        list: [
          "Buying process",
          "Areas",
          "Residency & taxes",
          "Investment",
          "Living here",
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "What the photo shows, for screen readers and image search.",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Post",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          // H1 is the post title, rendered by the page. Offering it here produces two
          // first-level headings and an outline no screen reader can follow.
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Subheading", value: "h3" },
            { title: "Small heading", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "byDate",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "topic", media: "coverImage" },
  },
});
