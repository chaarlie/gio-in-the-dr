import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";
import { schemaTypes } from "./sanity/schemaTypes";

/*
  Studio config, kept standalone rather than mounted at /studio in the Next app.

  The schemas live in this repo so they're versioned with the code, but the Studio
  builds and deploys separately (`npx sanity deploy` → <name>.sanity.studio). That
  keeps the marketing site's dependency tree free of the whole Studio, which
  matters on a site whose case rests on being fast.

  Local: npx sanity dev      → http://localhost:3333
  Ship:  npx sanity deploy
  Schema: npx sanity schema deploy   (required before MCP tools see the types)
*/
export default defineConfig({
  name: "gio-in-the-dr",
  title: "Gio In The DR",
  // Gio's own project (org oIn2rIz17). The site previously read fzowppzt, which
  // was mine — the content there has to be migrated across, it does not follow
  // the ID change.
  projectId: "walmnvd1",
  dataset: "production",
  plugins: [structureTool(), colorInput()],
  schema: { types: schemaTypes },
});
