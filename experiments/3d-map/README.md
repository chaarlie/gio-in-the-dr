# 3D neighbourhood map — parked for v2

Spike exploring a 3D Cabarete map for the property/neighbourhood section. **Not wired into
the site.** Nothing here is imported by `app/`, so it has no effect on the build.

Each page is standalone: open it over HTTP and paste a Mapbox **public** token (`pk.…`) when
prompted. Tokens are held in memory only — none are stored in these files.

```bash
cd experiments/3d-map && python3 -m http.server 8899
# then http://localhost:8899/<page>.html
```

`file://` will not work — Chrome blocks it and the pages fetch sibling `.js` files.

## The pages

| Page | What it does |
|---|---|
| `coccoloba-painted.html` | Coccoloba as 11 coloured volumes + signage marker + canvas facade texture. The most finished piece. |
| `cabarete-3d.html` | All 1,055 OSM building footprints in town, extruded at once. Four colour modes. |
| `building-editor.html` | Trace footprints over satellite; set floors/base per volume; exports GeoJSON. |

Data files: `coccoloba-styled.js` (the painted massing), `coccoloba-guess.js` (footprint
estimated from drone photos), `town.js` (all town footprints), `candidates.js` (the 20 OSM
footprints near Coccoloba's pin).

## What we established

- **OSM has footprints but not heights.** 1,055 building footprints inside
  `19.735,-70.45,19.765,-70.38`; **7** carry `building:levels` or `height` — 0.66%. So
  Mapbox's built-in `building` layer is useless here: it would extrude 7 buildings correctly
  and flatten the rest. You must supply your own heights.
- **You don't hand-model a town.** `cabarete-3d.html` extrudes all 1,055 with a heuristic
  (>600 m² → 3 floors, >250 m² → 2, houses → 1). Only the listings need hand-refining.
- **Stepping is what kills the cardboard look**, more than colour. Splitting Coccoloba into
  wings + projecting core + parapets + rooftop volumes did more than any paint setting.
  `fill-extrusion-vertical-gradient` and `-ambient-occlusion-*` do the rest.
- **Colour is per-feature**: put `color` on the GeoJSON feature and use
  `"fill-extrusion-color": ["get","color"]`. Same trick will paint by price/m² once listings
  are in Sanity.
- **`fill-extrusion-pattern` replaces colour** — you can have a facade texture or per-volume
  paint, not both. Real projects bake the colours into the texture.
- **Coccoloba is not in OSM** — no name match, and its footprint is not among the 20 near the
  pin. The geometry in `coccoloba-styled.js` is **estimated from drone photos**, centred on
  19.750918, -70.413289 with the long axis at 30° east of north. Shape and proportion are
  reasonable (882 m² footprint, ~3,528 m² over 4 floors ≈ 20 units, which matches the 108 m²
  and 165 m² unit sizes). **Absolute position and rotation are unverified.**
- **Esri World Imagery has no tiles at z19 for Cabarete** ("Map data not yet available"), and
  its `export` endpoint refused. Mapbox satellite does have imagery — use `building-editor.html`
  to correct the footprint.
- **Overpass**: the main endpoint rate-limits aggressively. `https://overpass.kumi.systems`
  worked reliably.

## Open items for v2

1. **Correct Coccoloba's footprint** in `building-editor.html` over Mapbox satellite, then
   replace the geometry in `coccoloba-styled.js`.
2. **Decide the fidelity tier.** Extruded blocks (done) → drone photogrammetry → hand-modelled
   glTF via a `model` layer. Photogrammetry is the strongest option since the listing shoots
   already fly a DJI; Polycam / RealityScan / DroneDeploy will produce a mesh from an orbit.
3. **Move `floors`/`levels` onto the Sanity property document** so Gio maintains heights the
   same way she types a price.
4. **Keep the facts in HTML.** Nothing inside the map canvas is crawlable, and the
   neighbourhood data (price, HOA, walk time) is the content meant to rank. The map is
   navigation and flair, not the content.

## Regenerating the OSM data

```bash
# every building footprint in town  -> town.js
curl -s -X POST https://overpass.kumi.systems/api/interpreter \
  --data-urlencode 'data=[out:json][timeout:120];way["building"](19.735,-70.45,19.765,-70.38);out geom tags;' \
  -o town.json
```

`town.js` and `candidates.js` are committed so the pages work without refetching; both are
derived and safe to regenerate.

## Source photos

Not committed (they're large originals). The footprint estimate came from
`DJI_20250915121357_0708_D_1.JPEG` (oblique) and `pathway.JPEG` (near-nadir, and it also has
the walk-to-beach route drawn in red — worth tracing as a `LineString` for a real walking
distance without a routing API).
