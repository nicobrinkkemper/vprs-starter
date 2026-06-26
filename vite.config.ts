import { defineConfig, PluginOption } from "vite";
import { StreamPluginOptions, vitePluginReactServer } from "vite-plugin-react-server";

export default defineConfig({
  plugins: [vitePluginReactServer({
    moduleBase: "src",
    Page: "src/page.tsx",
    props: "src/props.ts",
    build: {
      // Routes prerendered to dist/static (served by Vercel's CDN).
      pages: ["/"],
      // Step 1 is a static deploy, so skip the single-isolate edge bundle. Step 2
      // (live/CMS routes via a Vercel Node function) flips this back on — it's the
      // default — and marks those routes `dynamic` in createEdgeRequestHandler.
      edge: false,
    },
  } satisfies StreamPluginOptions) as PluginOption],
  optimizeDeps: {
    include: ["react-server-dom-esm/client.browser"],
  },
});
