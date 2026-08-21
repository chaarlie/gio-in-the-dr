import type { MetadataRoute } from "next";
import { absoluteUrl } from "./lib/site";

/*
  There was no robots.ts and no robots.txt, and the absence was louder than it
  looks: /robots.txt fell through to the [locale] segment, which matched
  "robots.txt" as if it were a language and served 240KB of home page HTML under
  a 200. A crawler asking what it may crawl was handed a web page.

  Nothing here is disallowed except the API routes, which have nothing to index
  and one — /api/contact — that should not be fetched by anything that isn't the
  form. AI crawlers are deliberately not blocked: Gio's buyers ask assistants
  where to buy in Cabarete, and a listing that cannot be read cannot be cited.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
