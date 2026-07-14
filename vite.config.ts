import { defineConfig, PluginOption } from "vite";
import { StreamPluginOptions, vitePluginReactServer } from "vite-plugin-react-server";
import { fileRouter } from "vite-plugin-react-server/router";

// File-based routing: fileRouter scans src/routes/** for page.tsx (+ sibling
// props.ts) and produces Page/props/build.pages. Two static routes here: "/"
// and "/about".
const router = fileRouter("src/routes");

export default defineConfig({
  plugins: [
    vitePluginReactServer({
      moduleBase: "src",
      Page: router.Page,
      props: router.props,
      routePatterns: router.routePatterns,
      build: {
        // Routes prerendered to dist/static (served by Vercel's CDN).
        pages: router.build.pages,
        // Inline each route's initial flight into its prerendered HTML, so the
        // first paint hydrates in place with zero /index.rsc round-trip.
        inlineFlight: true,
        // Also bake the single-isolate bundle (dist/server-edge/render.js): it
        // renders a route at request time from one isolate, with no
        // worker_threads and no runtime --conditions. `npm run edge` serves it.
        // Note it runs on Node, not on a true edge runtime — the bundle reads
        // the server manifest off disk, so it needs a filesystem.
        edge: true,
      },
    } satisfies StreamPluginOptions) as PluginOption,
  ],
  optimizeDeps: {
    include: ["react-server-dom-esm/client.browser"],
  },
});
