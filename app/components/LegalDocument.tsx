import type { LegalBlock, LegalDoc } from "../lib/legal";
import SectionHeading from "./SectionHeading";

/*
  One renderer for both policies.

  Two near-identical page files was the alternative, and near-identical is how
  the privacy page ends up with a table style the cookies page never got. The
  documents differ in their words, not in how they look.
*/

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return <p className="text-ink/85 leading-relaxed mt-4 first:mt-0">{block.text}</p>;
    case "list":
      return (
        <ul className="mt-4 flex flex-col gap-2.5 list-none pl-0">
          {block.items.map((item) => (
            /*
              A drawn marker rather than list-disc: the bullet has to sit on the
              first line of a three-line item, and a default marker on a flex row
              centres itself against the whole block.
            */
            <li key={item} className="flex gap-3 text-ink/85 leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        /*
          The wrapper scrolls, not the page. A three-column table with a
          sentence in the middle column does not fit a phone, and the usual
          result is a body that scrolls sideways for the whole document.
        */
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-card">
                {block.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-3 font-semibold text-ink border-b border-line"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="align-top">
                  {row.map((cell, i) => (
                    <td
                      key={block.columns[i]}
                      className={`px-4 py-3.5 text-ink/85 leading-relaxed ${
                        i === 0 ? "font-mono text-[13px] text-ink whitespace-nowrap" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default function LegalDocument({
  doc,
  updated,
}: {
  doc: LegalDoc;
  updated: string;
}) {
  return (
    /*
      Narrower than the 7xl the rest of the site uses. This is the one place on
      the site that is read a paragraph at a time rather than scanned, and a
      measure that wide is what makes a policy feel unreadable before anyone has
      read a word of it.
    */
    <article className="max-w-3xl mx-auto">
      <SectionHeading as="h1" eyebrow={doc.eyebrow} title={doc.title} />
      <p className="text-muted text-sm mt-4">{updated}</p>
      <p className="text-ink/85 text-lg leading-relaxed mt-6">{doc.intro}</p>

      {doc.sections.map((section) => (
        <section key={section.id} className="mt-12">
          {/* scroll-mt clears the sticky header, so a link to #rights lands on
              the heading rather than underneath it. */}
          <h2
            id={section.id}
            className="font-display font-bold text-ink text-2xl md:text-3xl mb-3 text-balance scroll-mt-28"
          >
            {section.heading}
          </h2>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}
    </article>
  );
}
