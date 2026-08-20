/*
  The two halves of blog translation: pulling strings out of a post, and putting
  translated ones back.

  The design rule is that nothing outside this file ever sees Portable Text. A
  post body is a tree of blocks with _key, style, marks and markDefs, and asking
  anything — a translator, a model, a person — to hand back "the same JSON but in
  Spanish" is how bold vanishes, links detach from their markDefs and _keys get
  invented. So extract() flattens to a map of plain strings, and rebuild() walks
  the *original* tree again and substitutes text. Structure is never authored
  twice, which makes breaking it impossible rather than unlikely.
*/

/** Fields translated as whole strings, outside the body. */
export const SCALAR_FIELDS = ["title", "excerpt", "slug"];

/**
 * A post's translatable strings, keyed so rebuild() can find its way home.
 * Body spans are "<blockKey>.<childIndex>"; image alts are "<blockKey>.alt".
 */
export function extract(post) {
  const out = {};
  for (const field of SCALAR_FIELDS) {
    const value = field === "slug" ? post.slug?.current : post[field];
    if (value) out[field] = value;
  }
  if (post.coverImage?.alt) out["coverImage.alt"] = post.coverImage.alt;

  for (const block of post.body ?? []) {
    if (!block._key) continue;
    if (block._type === "block") {
      (block.children ?? []).forEach((child, i) => {
        // Whitespace-only spans carry no meaning and round-trip badly.
        if (child._type === "span" && child.text?.trim()) {
          out[`${block._key}.${i}`] = child.text;
        }
      });
    } else if (block._type === "image" && block.alt) {
      out[`${block._key}.alt`] = block.alt;
    }
  }
  return out;
}

/*
  Link text is translated; link targets are not. A markDef href pointing at
  gob.do or a brokerage listing means the same thing in both languages, and
  "translating" a URL breaks it.
*/
export function rebuild(post, translated) {
  const body = (post.body ?? []).map((block) => {
    if (block._type === "block") {
      return {
        ...block,
        children: (block.children ?? []).map((child, i) => {
          const next = translated[`${block._key}.${i}`];
          return next === undefined ? child : { ...child, text: next };
        }),
      };
    }
    if (block._type === "image") {
      const alt = translated[`${block._key}.alt`];
      return alt === undefined ? block : { ...block, alt };
    }
    return block;
  });

  const doc = {
    _type: "post",
    language: "es",
    title: translated.title ?? post.title,
    excerpt: translated.excerpt ?? post.excerpt,
    slug: { _type: "slug", current: translated.slug ?? post.slug?.current },
    // Not translated, and deliberately: the date, the topic key and the image
    // asset are the same fact in both languages. Copying them keeps the pair
    // sorting and filtering identically on both sides of the site.
    publishedAt: post.publishedAt,
    topic: post.topic,
    body,
    translationOf: { _type: "reference", _ref: post._id },
    sourceRev: post._rev,
  };
  if (post.coverImage) {
    doc.coverImage = { ...post.coverImage };
    if (translated["coverImage.alt"]) doc.coverImage.alt = translated["coverImage.alt"];
  }
  return doc;
}

/** Sanity treats an id under `drafts.` as a draft — that is the whole mechanism. */
export function draftId(slug) {
  return `drafts.es-${slug}`;
}
