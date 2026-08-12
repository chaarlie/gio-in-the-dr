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
      <div className="bg-card border border-line rounded-3xl p-4 sm:p-5 flex flex-col min-h-0 h-[440px] lg:h-[620px]">
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

        {/* overscroll-contain stops the page scrolling on when this list bottoms out */}
        <div className="mt-3 -mx-1 px-1 overflow-y-auto overscroll-contain flex-1">
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

      <AreaMapbox areas={areas} selected={selected} onSelect={selectArea} />
    </div>
  );
}
