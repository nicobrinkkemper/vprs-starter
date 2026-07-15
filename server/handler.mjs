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

/** Serves the full flash-free HTML document for a route. */
const documentHandler = createEdgeHandler({
  // The document producer bakes the built stylesheets into its default
  // globalCss, so the render comes out styled with no CSS wiring here.
  renderDocument: renderRouteToDocument,
  moduleBaseURL: pathToFileURL(moduleDir).href + "/",
  bootstrapModules: clientEntry ? ["/" + clientEntry] : [],
});

// The client router fetches a route's flight at "<route>/index.rsc" for
// client-side navigation (the same path the static build used to prerender). On
// this per-request deploy those snapshots are dropped (see prepare-vercel), so
// serve the flight live from the same producer instead — the `headless`
// (Root-only) payload the document render also inlines, byte-compatible with what
// the client already consumes on first paint. Navigation then reads the visitor's
// geo per request too, not a frozen build-time value.
const FLIGHT_SUFFIX = "/index.rsc";
const UNKNOWN_ROUTE_MARKER = "[edge] unknown route:";

/** A Web fetch handler: (Request) => Promise<Response>. */
export async function handler(request) {
  const { pathname } = new URL(request.url);
  if (!pathname.endsWith(FLIGHT_SUFFIX)) return documentHandler(request);

  const route = pathname.slice(0, -FLIGHT_SUFFIX.length) || "/";
  try {
    const { headless } = await renderRouteToDocument(route, { request });
    return new Response(headless, {
      headers: { "content-type": "text/x-component; charset=utf-8" },
    });
  } catch (error) {
    // The producer 404s an unbaked route by throwing the unknown-route marker.
    if (error instanceof Error && error.message.includes(UNKNOWN_ROUTE_MARKER)) {
      return new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    throw error;
  }
}
