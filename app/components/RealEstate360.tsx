import SectionHeading from "./SectionHeading";
import CheckItem from "./CheckItem";
import GuideDownload, { GuideDownloadCover, GuideDownloadButton } from "./GuideDownload";
import { getGuide, BUYERS_GUIDE_SLUG } from "../lib/guide.server";
import { DEFAULT_LOCALE, type Locale, isLocale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";
import { locale as rootLocale } from "next/root-params";

const POINTS = [
  "Real rental data from 10+ properties I manage in Cabarete Bay & Sosúa",
  "Realistic income projections",
  "Ownership costs & HOA fees",
  "Property management",
  "The unique pros and cons of each neighborhood & condominium",
];

export default async function RealEstate360() {
  /*
    The locale and the guide are independent, so they're awaited together rather
    than one after the other. The guide is fetched once and handed to both halves
    — the cover and the button describe the same document, so a single query keeps
    them from disagreeing about whether there's a guide to show.
  */
  const [raw, guide] = await Promise.all([rootLocale(), getGuide(BUYERS_GUIDE_SLUG)]);
  const locale: Locale = raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].home;
  // The plain asset URL, opened in a new tab so the browser shows the PDF inline.
  const fileUrl = guide?.url ?? null;

  const intro = (
    <div className="min-w-0">
      <SectionHeading eyebrow={t.r360Eyebrow} title={t.r360Heading}>
        <p className="text-muted text-lg leading-relaxed max-w-xl mt-5">
          {t.r360Body}
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
  );

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4">
      {/* The download is gated behind a name/email form now: both the cover and
          the button below open one shared dialog (see GuideDownload), so neither
          is a shortcut straight to the file. With no guide in Sanity there is
          nothing to gate, and the section is just its copy. */}
      {guide?.url && fileUrl ? (
        <GuideDownload fileUrl={fileUrl}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {intro}
            {/* The guide's first page takes the column the placeholder photo held. */}
            <GuideDownloadCover guide={guide} />
          </div>
          <GuideDownloadButton guide={guide} />
        </GuideDownload>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">{intro}</div>
      )}
    </section>
  );
}
