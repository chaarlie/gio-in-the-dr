import { defineCliConfig } from "sanity/cli";

/*
  The Studio config sits at the repo root, next to the Next app. Studio builds on
  Vite, and Vite's default publicDir is "public" — which is the Next app's static
  folder. Left alone it copies the site's portrait, SVGs and the 1 MB standalone
  HTML export into the Studio build and publishes them to the .sanity.studio URL.
  Turning publicDir off keeps the Studio to just the Studio.
*/

export default defineCliConfig({
  api: { projectId: "fzowppzt", dataset: "production" },
  /** Where `npx sanity deploy` publishes → gio-in-the-dr.sanity.studio */
  studioHost: "gio-in-the-dr",
  /** Pinned so redeploys don't prompt for the application id. */
  deployment: { appId: "djoj78dd9fcv4qkbutqj6any" },
  vite: (config) => ({ ...config, publicDir: false }),
});
