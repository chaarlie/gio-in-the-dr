"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { formatPrice } from "../lib/format";
import type { Area } from "../lib/areas";

/*
  Real Mapbox map with the six areas drawn on it.

  Shapes follow the real OpenStreetMap coastline: each area is a band hugging the
  shore between two arc-lengths, offset inland and corner-cut (Chaikin) so the
  edges curve instead of reading as rectangles. Anchored on real OSM positions —
  Cabarete town, Kite Beach and Perla Marina each fall inside their own area.

  Still approximate: the inland edges are offsets, not surveyed boundaries.
  Replace app/lib/area-shapes.json once Gio confirms where each starts and stops.

  Fill colour is the validated single-hue ordinal ramp: lighter = closer to the
  sand. Identity comes from the labels, not the colour — six identity hues can't
  clear CVD separation on a map.
*/

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** Compass bearing that puts the NW-running shoreline across the frame. */
const COAST_BEARING = 241;

/*
  Which of the two map inks stays readable on a given fill.

  The ramp runs #b59a6e to #3c2611, so a fixed ink is wrong at one end whichever
  end you pick — and Gio can override any area's colour from the Studio, so the
  ramp isn't even the full set. Same two inks and the same intent as the
  AREA_LABEL_INK table, computed instead of hand-kept in step with the ramp.

  sRGB relative luminance, thresholded at the point where the two swap.
*/
function readableOn(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n) || full.length !== 6) return "#f4efe6";
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum =
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255);
  return lum > 0.36 ? "#2a1e10" : "#f4efe6";
}

function collection(areas: Area[]) {
  return {
    type: "FeatureCollection" as const,
    features: areas
      .filter((a) => a.boundary)
      .map((a) => ({
        type: "Feature" as const,
        id: a.slug,
        properties: {
          slug: a.slug,
          name: a.name,
          color: a.color,
          listings: a.listingCount,
        },
        geometry: { type: "Polygon" as const, coordinates: a.boundary as number[][][] },
      })),
  };
}

export default function AreaMapbox({
  areas,
  selected,
  onSelect,
}: {
  areas: Area[];
  selected?: string | null;
  onSelect?: (slug: string) => void;
}) {
  const mapRef = useRef<MapboxMap | null>(null);
  const holder = useRef<HTMLDivElement>(null);
  const made = useRef(false);
  const onSelectRef = useRef(onSelect);
  const glRef = useRef<typeof import("mapbox-gl")["default"] | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);

  /*
    The map is built asynchronously — the import is deferred until the section
    nears the viewport, then mapbox raises "load" later still. Everything that
    draws onto the map therefore has to wait for it.

    This is state, not a ref, because a ref changing does not re-run an effect:
    the markers effect would read a null mapRef on mount, bail, and never be
    asked again, so no pins appeared until something else happened to change
    `selected`. State re-renders, which re-runs the effects with the map in hand.
  */
  const [ready, setReady] = useState(false);

  // Keep the latest callback without re-running the map's init effect.
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!TOKEN || made.current || !holder.current) return;

    let map: MapboxMap | undefined;
    let cancelled = false;

    /*
      mapbox-gl is 1.8 MB of JavaScript for a map that sits well below the fold.
      Loading it on mount made every visitor pay for it — including the ones who
      read the hero and left. So the import waits until the map is near the
      viewport, which for anyone who actually scrolls here is indistinguishable
      from before: 200px of lead time covers the fetch.
    */
    function begin() {
      if (made.current || !holder.current) return;
      made.current = true;
      void init();
    }

    // Imported here rather than at module scope: mapbox-gl reaches for window on
    // import, which breaks the server render of this component.
    async function init() {
      const mapboxgl = (await import("mapbox-gl")).default;
      glRef.current = mapboxgl;
      if (cancelled || !holder.current) return;
      mapboxgl.accessToken = TOKEN;

    const data = collection(areas);

    /* Frame the bay cluster, not every area. Perla Marina sits ~7 km west, and
       fitting to it shrinks the five bay neighbourhoods to specks. It's still
       drawn — zoom out and it's there — but it doesn't get to set the viewport. */
    const bounds = new mapboxgl.LngLatBounds();
    data.features
      .filter((f) => f.properties.slug !== "perla-marina")
      .forEach((f) =>
        f.geometry.coordinates[0].forEach((c) => bounds.extend(c as [number, number])),
      );

    /* The shore runs northwest, so a north-up frame is half empty ocean and half
       empty hillside. Rotating to the coast bearing lays the shoreline across the
       frame and lets the areas fill it. */
    const m = new mapboxgl.Map({
      container: holder.current,
      style: "mapbox://styles/mapbox/light-v11",
      bearing: COAST_BEARING,
      bounds,
      fitBoundsOptions: { padding: 28, bearing: COAST_BEARING },
      cooperativeGestures: true,
    });
    map = m;
    mapRef.current = m;
    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    m.on("load", () => {
      m.fitBounds(bounds, { padding: 28, bearing: COAST_BEARING, duration: 0 });
      /* promoteId is required for feature-state on a GeoJSON source when the
         feature ids are strings — without it setFeatureState silently no-ops and
         hover never lights up. */
      m.addSource("areas", { type: "geojson", data, promoteId: "slug" });

      m.addLayer({
        id: "areas-fill",
        type: "fill",
        source: "areas",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false], 0.78,
            0.42,
          ],
        },
      });
      m.addLayer({
        id: "areas-line",
        type: "line",
        source: "areas",
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 2.4, 1.4],
          "line-opacity": 0.9,
          "line-blur": 0.6,
        },
      });
      m.addLayer({
        id: "areas-label",
        type: "symbol",
        source: "areas",
        layout: {
          "text-field": ["upcase", ["get", "name"]],
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 9.5, 15, 12.5],
          "text-letter-spacing": 0.18,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-max-width": 8,
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#2a1e10",
          "text-halo-color": "#f4efe6",
          "text-halo-width": 1.8,
          "text-halo-blur": 0.5,
        },
      });

      let hovered: string | null = null;
      const clear = () => {
        if (hovered) m.setFeatureState({ source: "areas", id: hovered }, { hover: false });
        hovered = null;
      };
      m.on("mousemove", "areas-fill", (e) => {
        const f = e.features?.[0] as { id?: string | number } | undefined;
        if (!f || String(f.id) === hovered) return;
        clear();
        hovered = String(f.id);
        m.setFeatureState({ source: "areas", id: hovered }, { hover: true });
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", "areas-fill", () => {
        clear();
        m.getCanvas().style.cursor = "";
      });
      m.on("click", "areas-fill", (e) => {
        const f = e.features?.[0] as { properties?: { slug?: string } } | undefined;
        if (f?.properties?.slug) onSelectRef.current?.(f.properties.slug);
      });

      // Last thing in the load handler, so anything keyed on `ready` can assume
      // the style and the area layers are both there.
      if (!cancelled) setReady(true);
    });

    }

    // No IntersectionObserver (old Safari, jsdom): build it now rather than never.
    if (typeof IntersectionObserver === "undefined") {
      begin();
      return () => {
        cancelled = true;
        setReady(false);
        mapRef.current = null;
        map?.remove();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        begin();
      },
      { rootMargin: "200px" },
    );
    observer.observe(holder.current);

    return () => {
      cancelled = true;
      observer.disconnect();
      // The next map starts unready; leaving this true would let the marker
      // effect attach to a map that has just been removed.
      setReady(false);
      mapRef.current = null;
      map?.remove();
    };
  }, [areas]);

  /* Selection drives the camera and the highlight — the panel and the map stay
     in step whichever one you clicked. */
  useEffect(() => {
    const m = mapRef.current;
    if (!ready || !m) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const area = areas.find((a) => a.slug === selected);
    if (area?.boundary) {
      const gl = glRef.current;
      if (!gl) return;
      const b = new gl.LngLatBounds();
      area.boundary[0].forEach((c) => b.extend(c as [number, number]));
      m.fitBounds(b, { padding: 60, bearing: COAST_BEARING, duration: reduced ? 0 : 700 });
    }
    m.setPaintProperty("areas-fill", "fill-opacity", [
      "case",
      ["boolean", ["feature-state", "hover"], false], 0.78,
      ["==", ["get", "slug"], selected ?? ""], 0.72,
      selected ? 0.2 : 0.42,
    ]);
  }, [selected, areas, ready]);

  /*
    Listings as thumbnails rather than dots — a price you can read beats a dot you
    have to hover. Properties sharing a building (Coccoloba's two units sit on the
    same coordinate) collapse into one marker with a count, instead of stacking
    invisibly on top of each other.
  */
  useEffect(() => {
    const m = mapRef.current;
    const gl = glRef.current;
    if (!ready || !m || !gl) return;

    markersRef.current.forEach((mk) => mk.remove());
    markersRef.current = [];

    type Pin = {
      lng: number;
      lat: number;
      color: string;
      slug: string;
      approx: boolean;
      items: typeof areas[number]["listings"];
    };
    const byPlace = new Map<string, Pin>();
    areas.forEach((a) =>
      a.listings.forEach((l) => {
        /*
          A listing with no coordinate of its own falls back to its
          neighbourhood's pin. Skipping it instead — which is what this used to
          do — drops the house off the map with nothing to show it is missing,
          so a half-filled dataset looks like a half-empty market.

          Only when the area has no pin either is there nothing to place.
        */
        const at = l.location ?? a.pin;
        if (!at) return;
        const approx = !l.location;
        // Approximate pins key separately, so a listing sitting on the area
        // centre never merges into an exact pin that happens to be nearby.
        const key = `${approx ? "~" : ""}${at.lng.toFixed(5)},${at.lat.toFixed(5)}`;
        const pin = byPlace.get(key);
        if (pin) pin.items.push(l);
        else byPlace.set(key, { lng: at.lng, lat: at.lat, color: a.color, slug: a.slug, approx, items: [l] });
      }),
    );

    byPlace.forEach((pin) => {
      const cheapest = pin.items.reduce((lo, c) =>
        (c.priceUsd ?? Infinity) < (lo.priceUsd ?? Infinity) ? c : lo, pin.items[0]);
      const price = formatPrice(cheapest.priceUsd);
      const dim = selected && selected !== pin.slug;

      const el = document.createElement("button");
      el.type = "button";
      // Say so out loud rather than only in the styling: an approximate pin that
      // reads as exact is worse than no pin, on a page where the walk to the
      // beach is the thing being sold.
      const where = pin.approx ? " — approximate location" : "";
      el.setAttribute(
        "aria-label",
        pin.items.length > 1
          ? `${pin.items.length} listings here, from ${price ?? "—"}${where}`
          : `${cheapest.title}${price ? `, ${price}` : ""}${where}`,
      );
      /*
        The price rides in the tooltip and the label rather than on the map. As
        a pill it was ~110px wide, and four of them around one bay overlapped
        into an unreadable stack that hid the very boundaries they sit on. A
        26px teardrop marks the spot; the price is one hover or one tap away.
      */
      const detail = pin.items.length > 1
        ? `${pin.items.length} listings, from ${price ?? "—"}`
        : `${cheapest.title}${price ? ` — ${price}` : ""}`;
      el.title = pin.approx ? `${detail}\nApproximate — shown at the centre of the area` : detail;
      el.className = pin.approx ? "gio-pin gio-pin--approx" : "gio-pin";
      el.style.opacity = dim ? "0.35" : "1";
      el.style.color = pin.color;
      el.style.setProperty("--pin-ink", readableOn(pin.color));

      /*
        A count still shows when units share a building — two listings that
        render as one unmarked pin read as one property for sale, which
        undercounts the inventory on the page meant to show it off.
      */
      el.innerHTML = `
        <svg width="26" height="34" viewBox="0 0 26 34" aria-hidden="true">
          <path class="gio-pin-body" d="M13 33C13 33 24.5 20.4 24.5 12.6A11.5 11.5 0 1 0 1.5 12.6C1.5 20.4 13 33 13 33Z" />
          ${pin.items.length > 1
            ? `<text class="gio-pin-count" x="13" y="12.6" text-anchor="middle" dominant-baseline="central">${pin.items.length}</text>`
            : `<circle class="gio-pin-dot" cx="13" cy="12.6" r="4" />`}
        </svg>`;

      el.onclick = () => onSelectRef.current?.(pin.slug);

      markersRef.current.push(
        new gl.Marker({ element: el, anchor: "bottom" }).setLngLat([pin.lng, pin.lat]).addTo(m),
      );
    });

    return () => {
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];
    };
  }, [areas, selected, ready]);

  if (!TOKEN) {
    return (
      <div className="border-y border-line bg-surface h-[calc(100svh-88px)] lg:rounded-3xl lg:border lg:h-[620px] flex items-center justify-center p-8 text-center">
        <p className="text-muted text-sm max-w-sm leading-relaxed">
          Map needs <code className="text-ink">NEXT_PUBLIC_MAPBOX_TOKEN</code> in{" "}
          <code className="text-ink">.env.local</code>. The area details below work without it.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={holder}
      className="overflow-hidden border-y border-line h-[calc(100svh-88px)] lg:rounded-3xl lg:border lg:h-[620px]"
    />
  );
}
