import SectionHeading from "./SectionHeading";
import CheckItem from "./CheckItem";
import { GuideCover, GuideButton } from "./Guide";
import { getGuide, BUYERS_GUIDE_SLUG } from "../lib/guide.server";

const POINTS = [
  "Real rental data from 10+ properties I manage in Cabarete Bay & Sosúa",
  "Realistic income projections",
  "Ownership costs & HOA fees",
  "Property management",
  "The unique pros and cons of each neighborhood & condominium",
];

export default async function RealEstate360() {
  /*
    Fetched once here and handed to both halves. The cover and the download
    button are in different places in the layout but describe the same document,
    so a single query keeps them from ever disagreeing about whether there's a
    guide to show.
  */
  const guide = await getGuide(BUYERS_GUIDE_SLUG);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="min-w-0">
          <SectionHeading eyebrow="Beyond the listing" title="Real estate in 360°">
            <p className="text-muted text-lg leading-relaxed max-w-xl mt-5">
              Buying a property is more than choosing a condo. I help you understand the
              full picture before you commit — so you know exactly what you&apos;re getting
              into.
            </p>
          </SectionHeading>
          <ul className="mt-7 flex flex-col gap-3.5">
            {POINTS.map((p) => (
              <CheckItem key={p}>{p}</CheckItem>
            ))}
          </ul>
        </div>

        {/* The guide's first page takes the column the placeholder photo held.
            That tile was a stock glyph over a "10+ properties" stat, which the
            first checklist item beside it already says word for word. */}
        <GuideCover guide={guide} slug={BUYERS_GUIDE_SLUG} />
      </div>

      {/* Centred under both columns rather than sitting on the page image, so
          the first page stays fully visible and the download reads as the
          section's call to action rather than the picture's caption. */}
      <GuideButton guide={guide} slug={BUYERS_GUIDE_SLUG} />
    </section>
  );
}
