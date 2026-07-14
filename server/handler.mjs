import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createEdgeHandler } from "vite-plugin-react-server/stream";
import { renderRouteToDocument } from "../dist/server-edge/render.js";

// The route renderer, shared by both entrypoints that serve it: the local
// `edge-server.mjs` and the Vercel function in `api/render.ts`. Whatever runs
// here is what runs in production.
//
// It renders a route at request time out of the single-isolate bundle baked by
// `build.edge` — one isolate, no worker_threads, no runtime --conditions. The
// loader sees the Request, so a route's props can read the visitor's geo off
// the platform's headers and it lands in the server HTML on first paint.
//
// This needs a filesystem (the bundle reads the server manifest off disk), so
// it is a Node function, not a true edge-runtime one.

// Both entrypoints run from the project root: `node edge-server.mjs` locally,
// and the Vercel function, whose working directory is the task root where
// `includeFiles` places dist/.
const root = process.cwd();

// Hydrate from the STATIC client build rather than dist/client: dist/client
// leaves react as a bare specifier the browser can't resolve, while dist/static
// ships deduped, self-resolving chunks. Client-reference ids are shared by
// filename, so the flight resolves against either.
const browserDir = join(root, "dist", "static");
// The in-process render resolves client references by importing them, so it
// needs a file: URL to the built modules.
const moduleDir = join(root, "dist", "client");

const clientManifest = JSON.parse(
  readFileSync(join(browserDir, ".vite", "manifest.json"), "utf8"),
);
// The static build keys the browser bootstrap under the HTML input — that entry
// is the bundled src/client.tsx, i.e. startClient.
const clientEntry = clientManifest["index.html"]?.file;

/** A Web fetch handler: (Request) => Promise<Response>. */
export const handler = createEdgeHandler({
  // The document producer bakes the built stylesheets into its default
  // globalCss, so the render comes out styled with no CSS wiring here.
  renderDocument: renderRouteToDocument,
  moduleBaseURL: pathToFileURL(moduleDir).href + "/",
  bootstrapModules: clientEntry ? ["/" + clientEntry] : [],
});
