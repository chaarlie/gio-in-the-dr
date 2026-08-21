"use client";

import SectionHeading from "./SectionHeading";
import PropertyCard from "./PropertyCard";
import Pagination from "./properties/Pagination";
import { usePropertySearch } from "./PropertySearchProvider";
import { SearchFieldGrid, SearchQueryRow, SearchActionsRow } from "./PropertySearchFields";
import { WA } from "../lib/whatsapp";
import { useMessages } from "./LocaleProvider";

/*
  The in-page search, over whatever is published in Sanity.

  Two different empty states, because they mean different things: no listings at all is
  Gio between listings, and the only useful thing to offer is a conversation. No matches
  is the visitor's filters, and the only useful thing to offer is clearing them. Showing
  "clear your filters" to someone who never set one is the version that reads broken.
*/
export default function Properties() {
  const t = useMessages();
  const { state, actions } = usePropertySearch();

  function scrollToResults() {
    const target = document.getElementById("property-results");
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <section id="properties" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4">
      <SectionHeading align="center" title={t.properties.heading} className="mb-8">
        <p className="text-muted mt-3">
          {t.properties.intro}
        </p>
      </SectionHeading>

      <form
        role="search"
        aria-label={t.properties.heading}
        onSubmit={(e) => {
          e.preventDefault();
          scrollToResults();
        }}
        className="bg-card border border-line rounded-3xl overflow-hidden"
      >
        <SearchQueryRow />
        <SearchFieldGrid />
        <SearchActionsRow onSubmit={scrollToResults} />
      </form>

      <div id="property-results" className="scroll-mt-28 mt-6" />

      {/* Reserve a row's worth of height so filtering to nothing doesn't collapse
          the grid and yank the rest of the page — including the map below — up by
          the better part of a screen. */}
      <div className="min-h-[420px] sm:min-h-[520px]">
      {state.all.length === 0 ? (
        <div className="min-h-[420px] sm:min-h-[520px] flex flex-col items-center justify-center text-center text-muted">
          <p className="max-w-sm"> {t.properties.nothingListed}
          </p>
          <a
            href={WA.general}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-3.5 rounded-full transition-colors no-underline"
          >
            {t.properties.askAvailable}
          </a>
        </div>
      ) : state.results.length === 0 ? (
        <div className="min-h-[420px] sm:min-h-[520px] flex flex-col items-center justify-center text-center text-muted">
          <p>{t.properties.noMatch}</p>
          <button
            type="button"
            onClick={actions.reset}
            className="mt-4 border border-line rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 transition-colors"
          >
            {t.properties.clearFilters}
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {state.pageItems.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>

          {/*
            Paged in the browser, because the filter runs over the whole set here
            too — both halves see every listing, so nothing can hide on a page the
            filter never looked at. That is exactly what is not true on
            /properties, which is why that one filters server-side.

            Scrolls back to the top of the results: changing page while looking at
            the ninth card otherwise leaves you mid-grid on new content.
          */}
          <Pagination
            page={state.page}
            pageCount={state.pageCount}
            hrefFor={(p) => `?page=${p}`}
            labels={t.common}
            onSelect={(p) => {
              actions.setPage(p);
              scrollToResults();
            }}
          />
        </>
      )}
      </div>
    </section>
  );
}
