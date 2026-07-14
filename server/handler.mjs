import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createEdgeHandler } from "vite-plugin-react-server/stream";
import { renderRouteToDocument } from "../dist/server-edge/render.js";
// The content-hashed name of the browser's bootstrap module, written out by
// scripts/emit-client-entry.mjs. Imported rather than read from Vite's
// dist/static/.vite/manifest.json, because a deploy has to ship whatever the
// server reads: Vercel copies neither the .vite/ dot-directory nor a JSON
// import, but it does trace a .js one.
import { clientEntry } from "../dist/client-entry.mjs";

// The route renderer, shared by both entrypoints that serve it: the local
// edge-server.mjs and the Vercel function in api/render.ts. What runs locally is
// what runs in production.
//
// It renders a route at request time out of the single-isolate bundle baked by
// `build.edge` — one isolate, no worker_threads, no runtime --conditions. The
// loader sees the Request, so a route's props can read the visitor's geo off the
// platform's headers and it lands in the server HTML on first paint.

// The render resolves a client reference by importing it, so it needs a file:
// URL to the built modules — dist/client, not dist/static. The browser needs
// dist/static's deduped, self-resolving chunks, but this import happens in Node,
// which can resolve the bare react specifier that dist/client leaves in place.
// Client references are keyed by filename, so one flight satisfies both.
//
// process.cwd() is the project root locally (`node edge-server.mjs`) and the
// task root in the Vercel function.
const moduleDir = join(process.cwd(), "dist", "client");

/** A Web fetch handler: (Request) => Promise<Response>. */
export const handler = createEdgeHandler({
  // The document producer bakes the built stylesheets into its default
  // globalCss, so the render comes out styled with no CSS wiring here.
  renderDocument: renderRouteToDocument,
  moduleBaseURL: pathToFileURL(moduleDir).href + "/",
  bootstrapModules: clientEntry ? ["/" + clientEntry] : [],
});
