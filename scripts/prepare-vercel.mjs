import { rmSync } from "node:fs";
import { join, resolve } from "node:path";

// Vercel answers a route from dist/static while its prerendered files exist;
// dropping BOTH halves makes the route fall through the rewrite and render
// per request. Mechanism and traps: README "How the Vercel deploy works".

const staticDir = resolve("dist", "static");

// Everything not listed serves its prerendered snapshots from the CDN.
const PER_REQUEST = ["/"];

for (const route of PER_REQUEST) {
  const dir = join(staticDir, ...route.split("/").filter(Boolean));
  for (const name of ["index.html", "index.rsc"]) {
    rmSync(join(dir, name), { force: true });
    const shown =
      route === "/" ? name : `${route.replace(/^\//, "")}/${name}`;
    console.log(
      `[prepare-vercel] dropped prerendered ${shown} (per-request route)`,
    );
  }
}
