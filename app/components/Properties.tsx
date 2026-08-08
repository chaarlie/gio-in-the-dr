"use client";

import SectionHeading from "./SectionHeading";
import PropertyCard from "./PropertyCard";
import { usePropertySearch } from "./PropertySearchProvider";
import { SearchFieldGrid, SearchQueryRow, SearchActionsRow } from "./PropertySearchFields";

/*
  The in-page search. Same fields as the overlay and the same state — change something
  here and the hero bar's summary updates too, because both read one provider.
*/
export default function Properties() {
  const { state, actions } = usePropertySearch();

  function scrollToResults() {
    const target = document.getElementById("property-results");
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <section id="properties" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4">
      <SectionHeading align="center" title="Find your property" className="mb-8">
        <p className="text-muted mt-3">
          Search beachfront condos, villas, investment and pre-construction across the north coast.
        </p>
      </SectionHeading>

      <form
        role="search"
        aria-label="Filter properties"
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

      {state.results.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <p>No properties match your search.</p>
          <button
            type="button"
            onClick={actions.reset}
            className="mt-4 border border-line rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.results.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
}
