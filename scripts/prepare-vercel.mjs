import { readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

// Vercel serves a matching static file BEFORE it applies a rewrite, and it
// resolves a directory request to an index file inside it. dist/static holds the
// prerendered page snapshots — index.html AND index.rsc (plus about/index.*) —
// so "/" and "/about" resolve to one of those on the filesystem and the render
// function is never reached.
//
// The .html half was the obvious trap; the .rsc half is the subtle one: with the
// .html gone, Vercel indexes "/" to index.rsc and serves the raw flight as
// application/octet-stream, which the browser DOWNLOADS instead of rendering.
//
// So for the dynamic deploy, drop BOTH prerendered snapshots (.html and .rsc) and
// keep everything else (the client chunks, CSS and the manifest the function
// needs). Every route then falls through the rewrite to api/render.ts and is
// rendered per request — the whole point of this deploy, and what keeps the geo
// live on every navigation rather than frozen at build time.
//
// `npm run build` still emits both: they're what `npm run preview` serves and
// what a plain static/CDN deploy would ship.

const staticDir = resolve("dist", "static");
const DROP = [".html", ".rsc"];

function dropSnapshots(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) dropSnapshots(path);
    else if (DROP.some((ext) => entry.name.endsWith(ext))) {
      rmSync(path);
      console.log(`[prepare-vercel] dropped prerendered ${path.slice(staticDir.length + 1)}`);
    }
  }
}

dropSnapshots(staticDir);
