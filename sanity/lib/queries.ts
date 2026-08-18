import { defineQuery } from "next-sanity";

/*
  Neighbourhoods, each with its listings and the stats derived from them.

  The counts and "from" prices compute themselves as Gio adds listings — which is
  what fills the empty cells on the area cards. `marketPricePerM2` stays her own
  figure and sits alongside `avgPricePerM2`: an average of three listings is not a
  market average, and labelling it as one would be a claim buyers act on.

  math::avg / math::min and geo::* are confirmed against the GROQ function
  reference; aggregates ignore nulls, so listings without areaM2 drop out of the
  per-m² average rather than skewing it to zero.
*/
export const AREAS_QUERY = defineQuery(`
  *[_type == "neighborhood"] | order(sortOrder asc) {
    "slug": slug.current,
    name,
    blurb,
    sortOrder,
    "color": color.hex,
    boundary,
    pin,
    beachPoint,
    marketPricePerM2,
    walkToBeach,
    driveToBeach,
    hoaNote,
    activities,
    "listingCount": count(*[_type == "property" && neighborhood._ref == ^._id && status == "available"]),
    "priceFrom": math::min(*[_type == "property" && neighborhood._ref == ^._id && status == "available"].priceUsd),
    "avgPricePerM2": round(math::avg(
      *[_type == "property" && neighborhood._ref == ^._id && status == "available" && defined(areaM2) && areaM2 > 0]{
        "perM2": priceUsd / areaM2
      }.perM2
    )),
    "listings": *[_type == "property" && neighborhood._ref == ^._id && status == "available"]
      | order(priceUsd asc) {
        "slug": slug.current,
        title,
        priceUsd,
        beds,
        baths,
        areaM2,
        spec,
        category,
        location,
        sourceUrl,
        hoaAmount,
        hoaUnit,
        walkToBeachMin,
        "beachPoint": ^.beachPoint,
        // Every image, not just the first: the explorer panel opens these
        // full-bleed, and a lightbox that can only show one photo isn't one.
        // (GROQ has line comments only — a /* */ block here is a syntax error.)
        "images": images[]{
          // _key, not the asset URL, identifies a photo in React's list: the
          // same image can legitimately appear twice in a gallery, and Sanity
          // gives every array member its own key even when the asset repeats.
          "key": _key,
          "url": asset->url,
          "lqip": asset->metadata.lqip,
          "aspectRatio": asset->metadata.dimensions.aspectRatio,
          alt
        }
      }
  }
`);

/*
  The search grid.

  Only what's actually for sale: reserved and sold listings keep their detail page
  (a sold comp is still worth reading) but drop out of the grid, so the result
  count never promises something that isn't available.
*/
export const PROPERTIES_QUERY = defineQuery(`
  *[_type == "property" && status == "available" && defined(slug.current)]
    | order(priceUsd desc) {
      "slug": slug.current,
      title,
      priceUsd,
      beds,
      baths,
      areaM2,
      spec,
      category,
      "image": images[0].asset->url,
      "lqip": images[0].asset->metadata.lqip,
      "area": neighborhood->name,
      "areaSlug": neighborhood->slug.current
    }
`);

/** Every published property slug — for generateStaticParams on detail pages. */
export const PROPERTY_SLUGS_QUERY = defineQuery(`
  *[_type == "property" && defined(slug.current)].slug.current
`);

/*
  A single listing. Images come back with their dimensions and LQIP so next/image
  can reserve the right box and blur into it — asset->url alone gives neither, and
  a gallery that reflows as it loads is the worst possible CLS on the page a buyer
  actually reads.
*/
export const PROPERTY_QUERY = defineQuery(`
  *[_type == "property" && slug.current == $slug][0]{
    "slug": slug.current,
    title, priceUsd, beds, baths, areaM2, spec, category, status,
    hoaAmount, hoaUnit, walkToBeachMin, location, body, sourceUrl,
    "images": images[]{
      "key": _key,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "aspectRatio": asset->metadata.dimensions.aspectRatio,
      alt
    },
    "area": neighborhood->{ name, "slug": slug.current, beachPoint }
  }
`);

/*
  Blog.

  `publishedAt <= now()` alongside the published perspective, so a post dated next
  Monday can be published today and still appear on Monday — the date is a schedule,
  not a label. Inline body images resolve their asset here rather than in the
  component, so the renderer stays a pure function of the data.
*/
const POST_CARD_FIELDS = `
  "slug": slug.current,
  title,
  excerpt,
  publishedAt,
  topic,
  "cover": coverImage{
    "url": asset->url,
    "lqip": asset->metadata.lqip,
    "aspectRatio": asset->metadata.dimensions.aspectRatio,
    alt
  }
`;

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt <= now()]
    | order(publishedAt desc) {
      ${POST_CARD_FIELDS}
    }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)].slug.current
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    ${POST_CARD_FIELDS},
    body[]{
      ...,
      _type == "image" => {
        "url": asset->url,
        "lqip": asset->metadata.lqip,
        "aspectRatio": asset->metadata.dimensions.aspectRatio,
        alt
      }
    },
    "related": *[_type == "post" && slug.current != $slug && publishedAt <= now()]
      | order(publishedAt desc)[0...3] {
        ${POST_CARD_FIELDS}
      }
  }
`);

/*
  Cross-check, not a lookup: which neighbourhood does a pin actually sit in?
  Run it against the reference to catch a pin dropped in the wrong place. Only
  works for areas that have a boundary drawn.
*/
export const PIN_CHECK_QUERY = defineQuery(`
  *[_type == "property" && defined(location)]{
    title,
    "declared": neighborhood->name,
    "geographic": *[_type == "neighborhood" && defined(boundary) && geo::contains(geo(boundary), ^.location)][0].name
  }[declared != geographic && defined(geographic)]
`);

/*
  One downloadable guide, preferring the requested slug.

  Deliberately not `slug.current == $slug` alone. The slug is generated from the
  title in the Studio, and "Buyer's Guide" slugifies to `buyer-s-guide` — the
  apostrophe becomes a separator — so an exact match silently emptied the home
  page twice: the upload was fine, the lookup just missed. The schema now strips
  apostrophes, but regenerating a slug is one click and the failure is invisible,
  so ordering exact matches first and falling back to the newest guide degrades
  to the right document instead of to nothing.

  `defined(file.asset)` keeps a half-filled draft from winning that fallback.

  `size` comes back in bytes and is rendered on the card: a 2.8 MB download on
  Dominican mobile data is worth stating before someone taps. `extension` labels
  the link rather than being assumed — a link that says PDF about a file that
  isn't one is worse than no label.
*/
export const GUIDE_QUERY = defineQuery(`
  *[_type == "guide" && defined(file.asset)]
    | order(select(slug.current == $slug => 0, 1) asc, _updatedAt desc)[0]{
    title,
    description,
    pages,
    "url": file.asset->url,
    "size": file.asset->size,
    "extension": file.asset->extension,
    "filename": file.asset->originalFilename,
    "cover": {
      "url": cover.asset->url,
      "lqip": cover.asset->metadata.lqip,
      "aspectRatio": cover.asset->metadata.dimensions.aspectRatio,
      "alt": cover.alt
    }
  }
`);
