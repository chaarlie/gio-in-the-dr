import { defineCliConfig } from "sanity/cli";

/*
  The Studio config sits at the repo root, next to the Next app. Studio builds on
  Vite, and Vite's default publicDir is "public" — which is the Next app's static
  folder. Left alone it copies the site's portrait, SVGs and the 1 MB standalone
  HTML export into the Studio build and publishes them to the .sanity.studio URL.
  Turning publicDir off keeps the Studio to just the Studio.
*/

export default defineCliConfig({
  api: { projectId: "walmnvd1", dataset: "production" },
  /*
    Where `npx sanity deploy` publishes → giointhedr.sanity.studio

    Not "gio-in-the-dr": a studio host belongs to exactly one project, and that
    name is still held by the old project (fzowppzt) under a different account.
    Releasing it needs that account, so this deploys under the domain spelling
    instead. To switch later: release the name there, change this line, redeploy
    — the old URL stops resolving, so tell Gio before doing it.
  */
  studioHost: "giointhedr",
  /*
    Pinned so redeploys don't prompt for the application id. This is the app
    created under walmnvd1 — the previous id belonged to fzowppzt's Studio and
    did not carry over, since an application belongs to one project.
  */
  deployment: { appId: "v3woxhe0h4tre9bqwphfe97k" },
  vite: (config) => ({ ...config, publicDir: false }),
});
