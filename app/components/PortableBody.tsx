import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";

/*
  One renderer for every rich-text field in the CMS — property descriptions and blog
  posts both. Styling rich text twice is how the two drift apart, and a buyer reading a
  listing shouldn't be able to tell they've crossed into a different template.

  Types are derived from the component rather than imported from @portabletext/types,
  which is only a transitive dependency here.
*/

export type PortableBlocks = ComponentProps<typeof PortableText>["value"];
type Components = ComponentProps<typeof PortableText>["components"];

type ImageValue = {
  url?: string;
  lqip?: string | null;
  aspectRatio?: number | null;
  alt?: string;
};

const components: Components = {
  block: {
    normal: ({ children }) => (
      <p className="text-ink/85 leading-relaxed mt-4 first:mt-0">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display font-bold text-ink text-2xl md:text-3xl mt-10 mb-3 text-balance">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display font-semibold text-ink text-xl mt-8 mb-2">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-semibold text-ink text-base mt-6 mb-2">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent pl-5 my-6 text-ink/75 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 space-y-2 list-disc pl-5 marker:text-accent">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 space-y-2 list-decimal pl-5 marker:text-muted">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-ink/85 leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="text-ink/85 leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    link: ({ children, value }) => {
      const href = String(value?.href ?? "");
      // Internal links go through next/link so they don't cost a full page load; the rest
      // open in a new tab, since they're brokerage and government sites a buyer will
      // cross-reference rather than leave for.
      if (href.startsWith("/")) {
        return (
          <Link href={href} className="text-accent underline underline-offset-2">
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: ImageValue }) => {
      if (!value?.url) return null;
      // Real dimensions from the asset metadata, so the figure reserves its box before
      // the bytes land instead of shoving the paragraph below it down the page.
      const ratio = value.aspectRatio ?? 3 / 2;
      const width = 1400;
      return (
        <figure className="my-8">
          <Image
            src={value.url}
            alt={value.alt ?? ""}
            width={width}
            height={Math.round(width / ratio)}
            sizes="(min-width: 768px) 720px, 100vw"
            placeholder={value.lqip ? "blur" : undefined}
            blurDataURL={value.lqip ?? undefined}
            className="w-full h-auto rounded-2xl"
          />
          {value.alt ? (
            <figcaption className="text-xs text-muted mt-2">{value.alt}</figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export default function PortableBody({ value }: { value: PortableBlocks }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
