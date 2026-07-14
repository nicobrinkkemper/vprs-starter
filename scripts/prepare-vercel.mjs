import { readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

// Vercel serves a matching static file BEFORE it applies a rewrite. dist/static
// holds the prerendered index.html and about/index.html, so those would answer
// "/" and "/about" and the render function would never be reached — the deploy
// would look static and the geo badge would stay dark.
//
// So for the dynamic deploy, drop the prerendered page HTML and keep everything
// else (the client chunks, CSS and the manifest the function needs). Every route
// then falls through the rewrite to api/render.ts and is rendered per request.
//
// `npm run build` still emits the HTML: it's what `npm run preview` serves, and
// what a plain CDN deploy would ship.

const staticDir = resolve("dist", "static");

function removeHtml(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) removeHtml(path);
    else if (entry.name.endsWith(".html")) {
      rmSync(path);
      console.log(`[prepare-vercel] dropped prerendered ${path.slice(staticDir.length + 1)}`);
    }
  }
}

removeHtml(staticDir);
