import { readdirSync } from "node:fs";
import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { StreamPluginOptions, vitePluginReactServer } from "vite-plugin-react-server";

// Every markdown file in src/content is a prerendered guide page.
const guides = readdirSync(new URL("./src/content", import.meta.url))
  .filter((f) => f.endsWith(".md"))
  .map((f) => ({ slug: f.replace(/\.md$/, "") }));

export default defineConfig({
  plugins: [
    react(),
    vitePluginReactServer({
      // The baked pair is the serving artifact (vprs 4.1): a failed bake
      // fails the build, and the snapshots render through the pair. Dev
      // still runs the isolated worker shape; no --conditions anywhere.
      runner: "edge",
      moduleBase: "src",
      routes: {
        dir: "routes",
        staticPaths: { "/docs/$slug": () => guides },
      },
      transport: "webpack",
      build: { inlineFlight: "stream" },
    } satisfies StreamPluginOptions) as PluginOption,
  ],
});
