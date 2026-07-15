// Local stand-in for the Vercel deployment, running the SAME handler the
// function runs (server/handler.mjs): each route is rendered at request time
// from the single-isolate bundle, so the visitor's geo is in the server HTML on
// first paint — no client fetch, and no /index.rsc round-trip either (the
// document producer inlines the flight).
//
//   npm run edge          # build, then serve on http://localhost:4401
//
// Vercel sets the x-vercel-ip-* headers itself; here they are injected below so
// the loader has geo to render locally.
//
// The asset server is deliberately STRICT: it serves only files that exist under
// dist/static, and 404s otherwise. A lenient server that resolves the same
// module at more than one path makes the browser instantiate React twice, which
// produces a null-dispatcher error that looks like a plugin bug and isn't.

import { createServer } from "node:http";
import { Readable } from "node:stream";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, normalize, resolve } from "node:path";

// This stands in for the Vercel function, which runs in production — so React
// must resolve to its production build here too. React reads NODE_ENV when it is
// first imported, so set it BEFORE the handler is loaded; that is why the import
// below is dynamic. Without this the local runner uses React's dev build and
// logs keyless-list warnings on the flight-reconstructed tree that never occur
// on the real deploy.
process.env.NODE_ENV ??= "production";
const { handler } = await import("./server/handler.mjs");

const browserDir = resolve("dist", "static");

const EDGE_GEO = {
  "x-vercel-id": "ams1::local-edge",
  "x-vercel-ip-city": "Amsterdam",
  "x-vercel-ip-country": "NL",
};

const MIME = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".rsc": "text/x-component; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

/** A built asset under dist/static, or null when this is a route to render. */
function assetFor(pathname) {
  if (pathname === "/") return null;
  const path = normalize(join(browserDir, pathname));
  if (!path.startsWith(browserDir)) return null;
  if (!existsSync(path) || !statSync(path).isFile()) return null;
  return path;
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost:4401");

    const asset = assetFor(url.pathname);
    if (asset) {
      res.setHeader("content-type", MIME[extname(asset)] ?? "application/octet-stream");
      res.end(readFileSync(asset));
      return;
    }

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(key, value);
    }
    for (const [key, value] of Object.entries(EDGE_GEO)) headers.set(key, value);

    const response = await handler(new Request(url, { method: req.method, headers }));
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) Readable.fromWeb(response.body).pipe(res);
    else res.end(await response.text());
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}).listen(4401, () => {
  console.log("vprs-starter, rendering each route per request → http://localhost:4401");
});
