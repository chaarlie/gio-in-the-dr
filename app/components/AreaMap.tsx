import SectionHeading from "./SectionHeading";
import AreaExplorer from "./AreaExplorer";
import { AREA_TONES } from "../lib/neighborhoods";
import type { Area } from "../lib/areas";
import { DEFAULT_LOCALE, type Locale, isLocale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";
import { locale as rootLocale } from "next/root-params";

/*
  Explore by area.

  Server component: it awaits Sanity (falling back to the committed static data)
  and renders every area — and every listing inside it — as HTML. Nothing inside a
  map canvas is crawlable, so the map is navigation and this markup is the content
  meant to rank.

  Empty facts are omitted rather than printed as "To confirm". A card shows what's
  true and nothing else, so the section reads finished at every stage of data
  entry instead of looking broken until Gio has filled in 44 cells.
*/

/*
  Takes the areas as a promise rather than fetching them itself, so the home page
  can start this query at the same time as the listings query instead of after it.
  Awaiting a prop keeps this a normal server component — the parent never blocks
  on the promise, it just hands it over.
*/
/*
  The locale is read, not passed — and this component is why.

  It used to take it as a prop, and the sweep that added `locale={locale}` to
  every section on the home page matched on `areas=` and skipped this one,
  because its prop is spelled `areas={areasPromise}`. The heading stayed English
  on the Spanish page while everything around it translated, and nothing failed.
  There is no prop to miss now.
*/
export default async function AreaMap({ areas: areasPromise }: { areas: Promise<Area[]> }) {
  const raw = await rootLocale();
  const locale: Locale = raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].home;
  const areas = await areasPromise;

  return (
    <section
      id="areas"
      className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4"
    >
      <SectionHeading
        align="center"
        eyebrow={t.areasEyebrow}
        title={t.areasHeading}
        className="mb-8"
      >
        <p className="text-muted mt-3 max-w-2xl mx-auto"> {t.areasIntro}
          </p>
      </SectionHeading>

      <AreaExplorer areas={areas} />

      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-xs text-muted">
        <span className="font-semibold uppercase tracking-[0.18em]">{t.closerToSand}</span>
        <span
          className="flex rounded-full overflow-hidden border border-line"
          aria-hidden="true"
        >
          {AREA_TONES.map((c) => (
            <span key={c} className="w-7 h-3" style={{ background: c }} />
          ))}
        </span>
        <span className="font-semibold uppercase tracking-[0.18em]">{t.furtherInland}</span>
        <span className="ml-auto italic">{t.boundariesNote}</span>
      </p>
    </section>
  );
}
