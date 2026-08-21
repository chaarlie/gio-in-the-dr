"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { formatPrice } from "../lib/format";
import { MAP_FRAME_OUTLIERS } from "../lib/neighborhoods";
import type { Area } from "../lib/areas";
import { useMessages } from "./LocaleProvider";

/*
  Real Mapbox map with the six areas drawn on it.

  Shapes follow the real OpenStreetMap coastline: each area is a band hugging the
  shore between two arc-lengths, offset inland and corner-cut (Chaikin) so the
  edges curve instead of reading as rectangles. Anchored on real OSM positions —
  Cabarete town, Kite Beach and Perla Marina each fall inside their own area.

  Still approximate: the inland edges are offsets, not surveyed boundaries. They
  now live in each neighbourhood's `boundary` field in Sanity, so Gio can redraw
  any of them at geojson.io without a deploy.

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
/** #abc or #aabbcc to [r,g,b], or null if it's neither. */
function rgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (full.length !== 6) return null;
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]) {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function hex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function readableOn(color: string) {
  const c = rgb(color);
  if (!c) return "#f4efe6";
  return luminance(c) > 0.36 ? "#2a1e10" : "#f4efe6";
}

/*
  Two markers closer together than the marker is wide collide, and whichever one
  mapbox happens to append last takes every click — the other is on the map and
  unreachable. Coccoloba's units are 3.2 m apart, Seawinds and Oceanfront 34 m;
  at the zoom the map opens at, all of them land on the same few pixels.

  So "same place" is a question about the screen, not about the coordinates. The
  previous rule keyed on the coordinate rounded to five decimals, which is ~1.1 m
  — it only ever merged listings typed at literally the same point, and the data
  drifted off that the moment anyone geocoded a unit separately.
*/
const MERGE_PX = 26;

/*
  Metres one pixel covers in Web Mercator. Depends on zoom and latitude only, not
  on where the map is panned to, so the grouping is stable while someone drags
  and changes only when they zoom.
*/
function metresPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

function metresBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const midLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  return Math.hypot(
    (a.lat - b.lat) * 111_320,
    (a.lng - b.lng) * 111_320 * Math.cos(midLat),
  );
}

/*
  The fill a marker actually gets: the area's colour with a floor under its
  lightness.

  A 26px teardrop is not a 200px polygon. The ramp's inland end (#56391d,
  #3c2611) reads as a warm brown across a whole neighbourhood and as a black blob
  at pin size, so every bay marker looked identical and only Kite Point — which
  Gio gave a custom blue — showed any colour at all.

  Clamping lightness in HSL rather than mixing toward cream. Mixing inverts the
  ramp — the darker the input the harder it gets pushed, so #3c2611 came out
  visibly lighter than #88673d. Clamping raises a colour to the floor and never
  past it, so the inland end cannot overtake the beach end.

  Everything below the floor lands on the same lightness, so ordering within the
  dark half is gone. That is the honest trade: a six-step single-hue scale was
  never readable in a 26px shape. Hue and saturation are untouched, which is what
  still carries at this size — a brown pin against a blue one.
*/
const PIN_MIN_LIGHTNESS = 0.42;

function pinFill(color: string) {
  const c = rgb(color);
  if (!c) return color;

  const [r, g, b] = c.map((v) => v / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (l >= PIN_MIN_LIGHTNESS) return color;

  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  // Back to RGB at the floor lightness.
  const L = PIN_MIN_LIGHTNESS;
  const chroma = (1 - Math.abs(2 * L - 1)) * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = L - chroma / 2;
  const [r1, g1, b1] =
    h < 60 ? [chroma, x, 0]
    : h < 120 ? [x, chroma, 0]
    : h < 180 ? [0, chroma, x]
    : h < 240 ? [0, x, chroma]
    : h < 300 ? [x, 0, chroma]
    : [chroma, 0, x];
  return hex([(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255]);
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
  onOpenListing,
  fullscreen = false,
}: {
  areas: Area[];
  selected?: string | null;
  onSelect?: (slug: string) => void;
  /** Called with a listing slug when a pin resolves to exactly one property. */
  onOpenListing?: (slug: string) => void;
  /**
   * Filling the viewport rather than sitting in the page. Turns off
   * cooperativeGestures — inline, the map must leave one-finger drag to the page
   * or it swallows the scroll; owning the screen, one finger should pan.
   */
  fullscreen?: boolean;
}) {
  const t = useMessages();
  const mapRef = useRef<MapboxMap | null>(null);
  const holder = useRef<HTMLDivElement>(null);
  const made = useRef(false);
  const onSelectRef = useRef(onSelect);
  const onOpenListingRef = useRef(onOpenListing);
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

  /*
    Drives the pin grouping, which is a screen-space question. zoomend rather
    than zoom: regrouping mid-gesture rebuilds every marker on each animation
    frame, and it closes any popup the pinch happened to start from.
  */
  const [zoom, setZoom] = useState(0);

  // Keep the latest callbacks without re-running the map's init effect.
  useEffect(() => {
    onSelectRef.current = onSelect;
    onOpenListingRef.current = onOpenListing;
  }, [onSelect, onOpenListing]);

  useEffect(() => {
    if (!TOKEN || made.current || !holder.current) return;

    let map: MapboxMap | undefined;
    let cancelled = false;
    let resizer: ResizeObserver | undefined;
    let fitted = false;

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

    /* Frame the bay cluster, not every area — see MAP_FRAME_OUTLIERS. */
    const bounds = new mapboxgl.LngLatBounds();
    data.features
      .filter((f) => !MAP_FRAME_OUTLIERS.has(f.properties.slug))
      .forEach((f) =>
        f.geometry.coordinates[0].forEach((c) => bounds.extend(c as [number, number])),
      );

    /*
      And the pins themselves, which the boundaries do not necessarily contain.
      Mareal sits 16 m past the west edge of the Kite Beach shape, so the map
      opened with its marker just off-frame — the listing was on the map and
      invisible until you panned, which reads as "it has no pin".

      The shapes are approximate offsets rather than surveyed lines (see the note
      at the top of this file), so a real address falling outside one is expected
      and will happen again. Framing what is actually plotted fixes the class of
      bug, not just this listing.

      Same fallback the markers use, and the same outlier list, so the frame and
      the pins always agree about what is on screen.
    */
    areas
      .filter((a) => !MAP_FRAME_OUTLIERS.has(a.slug))
      .forEach((a) =>
        a.listings.forEach((l) => {
          const at = l.location ?? a.pin;
          if (at) bounds.extend([at.lng, at.lat]);
        }),
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
      cooperativeGestures: !fullscreen,
    });
    map = m;
    mapRef.current = m;
    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    /*
      Mapbox measures its container once, at construction, and afterwards only
      listens to window resize. That is not enough here: opening inside a dialog
      gives the container its real height a frame later, so the map is built
      against the wrong box — the canvas renders torn and fitBounds frames to a
      size that no longer exists. Orientation changes and the mobile URL bar
      collapsing have the same problem and do not reliably fire window resize.

      Only the first non-zero size refits. Refitting on every change would throw
      away the pan and zoom someone just did, every time the URL bar slid away.
    */
    resizer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      m.resize();
      if (fitted) return;
      fitted = true;
      m.fitBounds(bounds, { padding: 28, bearing: COAST_BEARING, duration: 0 });
    });
    resizer.observe(holder.current);

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
        resizer?.disconnect();
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
      resizer?.disconnect();
      // The next map starts unready; leaving this true would let the marker
      // effect attach to a map that has just been removed.
      setReady(false);
      mapRef.current = null;
      map?.remove();
    };
    // `fullscreen` is fixed for the life of an instance — the inline pane and the
    // dialog are separate mounts — so this never actually rebuilds on it.
  }, [areas, fullscreen]);

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

  useEffect(() => {
    const m = mapRef.current;
    if (!ready || !m) return;
    const sync = () => setZoom(m.getZoom());
    sync(); // the fitBounds on load has already run by the time ready flips
    m.on("zoomend", sync);
    return () => {
      m.off("zoomend", sync);
    };
  }, [ready]);

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
    const placed: (Omit<Pin, "items"> & { item: Pin["items"][number] })[] = [];
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
        placed.push({
          lng: at.lng,
          lat: at.lat,
          color: a.color,
          slug: a.slug,
          approx: !l.location,
          item: l,
        });
      }),
    );

    /*
      Greedy single-pass clustering: the first listing at a place fixes the pin,
      and anything landing within a marker's width of it joins. Order-dependent
      by nature, but with a threshold this small the alternatives only disagree
      about pins that are already a pixel apart, and it stays O(n²) on a set that
      is ten listings today and would be a few hundred at its worst.
    */
    const tolerance = MERGE_PX * metresPerPixel(placed[0]?.lat ?? 19.75, zoom);
    const pins: Pin[] = [];
    for (const p of placed) {
      // Approximate pins never merge into exact ones, so a listing sitting on
      // the area centre cannot absorb a house that really is nearby.
      const home = pins.find(
        (pin) => pin.approx === p.approx && metresBetween(pin, p) <= tolerance,
      );
      if (home) {
        home.items.push(p.item);
        continue;
      }
      // Destructured rather than spread wholesale: `item` is scaffolding for the
      // clustering pass and has no business on the pin it produces.
      const { item, ...place } = p;
      pins.push({ ...place, items: [item] });
    }

    pins.forEach((pin) => {
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
      // readableOn takes the lifted fill, not the area's colour — the inner mark
      // has to contrast with what is actually painted behind it.
      const fill = pinFill(pin.color);
      el.style.color = fill;
      el.style.setProperty("--pin-ink", readableOn(fill));

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

      /*
        A pin is a property, so tapping one opens that property.

        This used to pass `pin.slug` — the *area's* slug — so every pin click
        selected the neighbourhood and the listing itself was unreachable: no
        price, no HOA, no photos, which is the bug this fixes.

        Pins that stack (Coccoloba's two units share a coordinate) can't resolve
        to one property, so those still select the area and let the panel list
        them — picking one arbitrarily would hide the other.
      */
      const only = pin.items.length === 1 ? pin.items[0] : null;

      /*
        Built as DOM rather than an HTML string so the handlers can be attached
        directly — setHTML would need delegation or a re-query on every open, and
        one of those quietly breaks the first time someone adds a second button.
      */
      const card = document.createElement("div");
      card.className = "gio-popup";

      for (const item of pin.items) {
        const row = document.createElement("div");
        row.className = "gio-popup-row";

        const name = document.createElement("p");
        name.className = "gio-popup-title";
        name.textContent = item.title;
        row.append(name);

        const sub = formatPrice(item.priceUsd);
        if (sub) {
          const p = document.createElement("p");
          p.className = "gio-popup-price";
          p.textContent = sub;
          row.append(p);
        }

        /*
          A real anchor, not a button that calls the router. It is the whole
          point of the request — and it means cmd-click, middle-click and "copy
          link address" all behave, which a click handler silently breaks.
        */
        if (item.slug) {
          const view = document.createElement("a");
          view.className = "gio-popup-cta";
          view.href = `/properties/${item.slug}`;
          view.textContent = "View property →";
          row.append(view);
        }

        card.append(row);
      }

      /*
        Second way in, kept because it is cheaper than a page load: the panel
        shows the same property without leaving the map. Stacked pins have no
        single property to open, so they select the area and let the panel list
        what is there — picking one arbitrarily would hide the other.
      */
      const inPanel = document.createElement("button");
      inPanel.type = "button";
      inPanel.className = "gio-popup-secondary";
      inPanel.textContent = only ? "Quick look" : `Show all ${pin.items.length} in the list`;
      inPanel.onclick = () =>
        only?.slug
          ? onOpenListingRef.current?.(only.slug)
          : onSelectRef.current?.(pin.slug);
      card.append(inPanel);

      const popup = new gl.Popup({
        offset: 34, // clears the 34px teardrop, which is anchored at its point
        closeButton: true,
        className: "gio-popup-shell",
        maxWidth: "260px",
      }).setDOMContent(card);

      markersRef.current.push(
        new gl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([pin.lng, pin.lat])
          .setPopup(popup)
          .addTo(m),
      );
    });

    return () => {
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];
    };
  }, [areas, selected, ready, zoom]);

  /* Fullscreen fills whatever the dialog gives it; inline keeps the desktop
     pane's fixed height and rounded card. */
  const box = fullscreen
    ? "w-full h-full"
    : "border-y border-line lg:rounded-3xl lg:border lg:h-[620px] h-[calc(100svh-88px)]";

  if (!TOKEN) {
    return (
      <div className={`${box} bg-surface flex items-center justify-center p-8 text-center`}>
        <p className="text-muted text-sm max-w-sm leading-relaxed"> {t.map.tokenMissing}
        </p>
      </div>
    );
  }

  return <div ref={holder} className={`overflow-hidden ${box}`} />;
}
