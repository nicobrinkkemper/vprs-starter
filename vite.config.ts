import { readdirSync } from "node:fs";
import { defineConfig, PluginOption } from "vite";
import { StreamPluginOptions, vitePluginReactServer } from "vite-plugin-react-server";

// Every markdown file in src/content is a prerendered guide page.
const guides = readdirSync(new URL("./src/content", import.meta.url))
  .filter((f) => f.endsWith(".md"))
  .map((f) => ({ slug: f.replace(/\.md$/, "") }));

export default defineConfig({
  plugins: [
    vitePluginReactServer({
      moduleBase: "src",
      routes: {
        dir: "routes",
        staticPaths: { "/docs/$slug": () => guides },
      },
      transport: "webpack",
    } satisfies StreamPluginOptions) as PluginOption,
  ],
});
