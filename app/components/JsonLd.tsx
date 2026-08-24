/*
  One JSON-LD block.

  Kept as a component so the escaping decision is made once. The `<` replacement
  is not decoration: a JSON string containing "</script>" — which any Sanity
  field could — ends the script element early and puts the rest of the payload
  into the document as markup.
*/
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
