"use client";

import { useState } from "react";
import AreaMapbox from "./AreaMapbox";
import ExplorerTabs, { type ExplorerView } from "./explorer/ExplorerTabs";
import AreaRow from "./explorer/AreaRow";
import AreaDetail from "./explorer/AreaDetail";
import ListingCard from "./explorer/ListingCard";
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

  const current = areas.find((a) => a.slug === selected) ?? null;
  const visible = current ? [current] : areas;
  const listings = visible.flatMap((a) => a.listings.map((l) => ({ listing: l, area: a })));

  function selectArea(slug: string | null) {
    setSelected(slug);
    if (slug) setView("listings");
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
        On mobile this is a sheet: it overlaps the bottom of the full-height map
        by a little so part of it is always visible as an affordance, then rides
        up over the pinned map as you scroll. relative z-10 puts it above the
        map's z-0; the -mx/-mt pair is undone at lg, where the two go back to
        being side-by-side panes.
      */}
      <div className="order-2 lg:order-none min-w-0 relative z-10 -mx-6 md:-mx-8 lg:mx-0 -mt-10 lg:mt-0 bg-card border-t border-line rounded-t-3xl shadow-[0_-10px_30px_rgb(0_0_0_/_0.10)] lg:border lg:rounded-3xl lg:shadow-none p-6 lg:p-5 flex flex-col min-h-0 h-auto lg:h-[620px]">
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
      </div>

      {/*
        Sticky on mobile only. Selecting an area moves the map — pans, zooms,
        highlights — and all of that was happening off-screen above a list you
        had scrolled down into, so the feature was invisible on a phone. Pinned
        under the header, the map answers every tap while you keep browsing.

        top offset clears the sticky header (~88px at the mobile type scale).
      */}
      {/*
        Full-bleed on mobile: the negative margins cancel the section's px-6 /
        md:px-8 gutter so the map runs to both screen edges, and it is pinned
        under the header at nearly full height. A map is a thing you read by
        panning, and at 46svh in a padded box there was never enough of the bay
        on screen to pan around.

        z-0 against the list's z-10 — the list slides up over the pinned map.
      */}
      <div className="order-1 lg:order-none min-w-0 -mx-6 md:-mx-8 lg:mx-0 sticky top-[88px] z-0 lg:static lg:z-auto">
        <AreaMapbox areas={areas} selected={selected} onSelect={selectArea} />
      </div>
    </div>
  );
}
