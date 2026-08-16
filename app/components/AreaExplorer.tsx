"use client";

import { useEffect, useRef, useState } from "react";
import AreaMapbox from "./AreaMapbox";
import ExplorerTabs, { type ExplorerView } from "./explorer/ExplorerTabs";
import AreaRow from "./explorer/AreaRow";
import AreaDetail from "./explorer/AreaDetail";
import ListingCard from "./explorer/ListingCard";
import ListingDetail from "./explorer/ListingDetail";
import StaticMapPreview from "./explorer/StaticMapPreview";
import FullScreenMap from "./explorer/FullScreenMap";
import type { Area } from "../lib/areas";

/*
  Two panes sharing one selection: a toggleable list on one side, the map on the
  other.

  Responsive: single column on small screens with the map underneath at a fixed
  aspect, two columns from lg up with both panes the same height.

  Selecting an area from the Areas tab flips to Properties filtered to it — the
  question "which area?" is nearly always followed by "so what's in it?", and
  making that one tap instead of two is the point of the toggle.

  Both lists stay mounted (the inactive one is `hidden`) so every area and every
  listing is in the server-rendered HTML for crawlers.
*/
export default function AreaExplorer({ areas }: { areas: Area[] }) {
  const [view, setView] = useState<ExplorerView>("listings");
  const [selected, setSelected] = useState<string | null>(null);
  /** Slug of the listing whose details fill the panel. Null = browsing the lists. */
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const current = areas.find((a) => a.slug === selected) ?? null;
  const visible = current ? [current] : areas;
  const listings = visible.flatMap((a) => a.listings.map((l) => ({ listing: l, area: a })));

  // Searched across every area, not just the visible ones: a map pin can open a
  // listing in an area the list is currently filtered away from.
  const opened =
    openSlug === null
      ? null
      : areas
          .flatMap((a) => a.listings.map((l) => ({ listing: l, area: a })))
          .find(({ listing }) => listing.slug === openSlug) ?? null;

  /*
    The full-screen map lives in the URL, so the phone Back button closes it
    instead of leaving the page — the gesture people actually use to dismiss
    something full-screen. Reading window.location rather than useSearchParams
    is deliberate and for the same reason as PropertySearchProvider: touching
    search params during render drops every client component under the boundary
    out of the prerendered HTML, and this section's areas and listings are the
    content that has to be crawlable.
  */
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    const sync = () => setMapOpen(new URLSearchParams(window.location.search).has("map"));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  function openMap() {
    const params = new URLSearchParams(window.location.search);
    params.set("map", "1");
    window.history.pushState(null, "", `${window.location.pathname}?${params}#areas`);
    setMapOpen(true);
  }

  function closeMap() {
    // back() rather than another push, so opening and closing doesn't stack
    // history entries that need pressing Back through one at a time.
    if (new URLSearchParams(window.location.search).has("map")) window.history.back();
    setMapOpen(false);
  }

  function selectArea(slug: string | null) {
    setSelected(slug);
    setOpenSlug(null);
    if (slug) setView("listings");
  }

  function openListing(slug: string) {
    setOpenSlug(slug);
    /*
      A pin tap comes from the full-screen map, which closes onto a page scrolled
      wherever it was — usually not at the listing that just opened. Pull the
      panel into view. Harmless on desktop, where the panel already sits beside
      the map and this resolves to no movement.
    */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="grid lg:grid-cols-[minmax(320px,390px)_1fr] gap-4 lg:gap-5 items-stretch">
      {/*
        order-2 on mobile, first column again from lg. The list stays ahead of
        the map in the DOM so crawlers still read every area and listing before
        the canvas, but on a phone the map is what you want under your thumb.
      */}
      {/*
        min-w-0 is load-bearing, not defensive. A grid item's default
        `min-width: auto` refuses to shrink below its content's min-content
        width, so the longest listing title was holding this panel at 433px
        inside a 390px phone and pushing the whole page 69px wide — which is
        what put the header's menu button off-screen. The truncate classes
        inside cannot engage until this is set.
      */}
      {/*
        Full-bleed on mobile so it reads as one surface with the map preview
        above it. No negative top margin any more — that overlap was sized for a
        full-height map, and against a 240px preview it swallowed the label and
        the Open button sitting along its bottom edge.
      */}
      <div
        ref={panelRef}
        className="order-2 lg:order-none min-w-0 relative z-10 -mx-6 md:-mx-8 lg:mx-0 bg-card border-t border-line rounded-t-3xl shadow-[0_-10px_30px_rgb(0_0_0_/_0.10)] lg:border lg:rounded-3xl lg:shadow-none p-6 lg:p-5 flex flex-col min-h-0 h-auto lg:h-[620px] scroll-mt-[88px] lg:scroll-mt-0"
      >
        {/*
          One listing takes over the whole panel rather than expanding in place.
          At 390px there isn't room for a gallery, a facts table and a list of
          other properties at once, and the half-and-half version made both
          halves too small to use.
        */}
        {opened ? (
          <div className="lg:overflow-y-auto lg:overscroll-contain flex-1 -mx-1 px-1">
            <ListingDetail
              listing={opened.listing}
              color={opened.area.color}
              areaName={opened.area.name}
              onBack={() => setOpenSlug(null)}
            />
          </div>
        ) : (
        <>
        <ExplorerTabs
          view={view}
          onChange={setView}
          counts={{ areas: areas.length, listings: listings.length }}
        />

        {current ? (
          <div className="flex items-center gap-2 mt-3">
            <span
              aria-hidden="true"
              className="w-3 h-3 rounded-[3px] shrink-0"
              style={{ background: current.color }}
            />
            <p className="text-sm font-semibold text-ink truncate min-w-0 flex-1">
              {current.name}
            </p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs font-semibold text-muted hover:text-ink transition-colors shrink-0 touch-manipulation"
            >
              Clear ✕
            </button>
          </div>
        ) : null}

        {/*
          The inner scroller is a desktop device: it keeps the two panes the same
          height side by side. On a phone it made a scrollport inside a scrollport
          — and it pinned the section to 440px, so the sticky map below had
          nothing to stay put against. Here the panel just grows and the page
          scrolls.

          overscroll-contain stops the page scrolling on when this list bottoms out.
        */}
        <div className="mt-3 -mx-1 px-1 lg:overflow-y-auto lg:overscroll-contain flex-1">
          <div
            role="tabpanel"
            id="explorer-panel-areas"
            aria-labelledby="explorer-tab-areas"
            hidden={view !== "areas"}
          >
            <ul className="flex flex-col">
              {areas.map((a) => (
                <AreaRow
                  key={a.slug}
                  area={a}
                  selected={a.slug === selected}
                  onSelect={selectArea}
                />
              ))}
            </ul>
            {current ? <AreaDetail area={current} /> : null}
          </div>

          <div
            role="tabpanel"
            id="explorer-panel-listings"
            aria-labelledby="explorer-tab-listings"
            hidden={view !== "listings"}
          >
            {current ? <AreaDetail area={current} /> : null}

            {listings.length > 0 ? (
              <ul className="flex flex-col gap-2 mt-3">
                {listings.map(({ listing, area }) => (
                  <ListingCard
                    key={`${area.slug}-${listing.slug ?? listing.title}`}
                    listing={listing}
                    color={area.color}
                    areaName={area.name}
                    showArea={!current}
                    onOpen={openListing}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted mt-3">
                {current
                  ? `Nothing listed in ${current.name} right now.`
                  : "No listings yet."}
              </p>
            )}
          </div>
        </div>
        </>
        )}
      </div>

      {/*
        Small screens: a picture of the map, full-bleed, with the real one behind
        a tap. The interactive map used to be pinned here at viewport height —
        but cooperativeGestures reserves one-finger drag for scrolling the page,
        which a full-bleed map has to do or it traps you. So it filled the screen
        and could not be panned by the gesture everyone reaches for first.

        Because this branch is CSS, the desktop pane below is display:none here,
        and its IntersectionObserver never fires against a zero-sized box — so
        mapbox-gl's 1.78 MB is not fetched on a phone at all until the map opens.
      */}
      <div className="order-1 lg:hidden min-w-0 -mx-6 md:-mx-8">
        <StaticMapPreview areas={areas} onOpen={openMap} />
      </div>

      {mapOpen ? (
        <FullScreenMap
          areas={areas}
          selected={selected}
          onSelect={(slug) => {
            selectArea(slug);
            closeMap();
          }}
          onOpenListing={(slug) => {
            openListing(slug);
            closeMap();
          }}
          onClose={closeMap}
        />
      ) : null}

      {/* Desktop: the live pane, side by side with the list as before. */}
      <div className="hidden lg:block order-1 lg:order-none min-w-0">
        <AreaMapbox
          areas={areas}
          selected={selected}
          onSelect={selectArea}
          onOpenListing={openListing}
        />
      </div>
    </div>
  );
}
