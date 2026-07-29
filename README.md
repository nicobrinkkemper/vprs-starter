# vprs-starter

A minimal [`vite-plugin-react-server`](https://github.com/nicobrinkkemper/vite-plugin-react-server) app. Built small on purpose.

File-based routes, a one-call client entry, an interactive hero island (the atom follows the pointer and is the page's light source), and a per-route choice between CDN snapshots and per-request rendering. The `/docs` guides are markdown in `src/content/`, rendered by the server.

The hosted demo runs on Vercel (not affiliated, just where the demo lives). The build is host-agnostic; the Vercel-specific files are `api/`, `vercel.json`, and `scripts/prepare-vercel.mjs`, all deletable.

## One build, three ways to serve it

| target | entry | serves |
| ------ | ----- | ------ |
| **Static CDN** | none, host `dist/static` | prerendered HTML with the flight inlined. `npm run preview`; geo badge idle. |
| **Vercel** | `api/render.ts` → `server/handler.mjs` | snapshots from the CDN; per-request routes (`/`) fall through the rewrite to a live render. |
| **Local server** | `edge-server.mjs` → `server/handler.mjs` | the Vercel renderer plus asset serving, geo headers simulated. `npm run edge` → `:4401`. |

Both per-request targets import `server/handler.mjs`, so local and production cannot drift.

## Develop

```bash
npm install
npm run dev      # vite dev server
npm run build    # → dist/static (+ dist/client, dist/server, dist/server-edge)
npm run preview  # serve the prerendered dist/static
npm run edge     # render every route per request on :4401
```

## Routing

`routes: { dir: "routes" }` scans `src/routes/**` and derives pages, loaders, patterns, the prerender list and the layout chain. Adding a route means adding a folder.

| file | role |
| ---- | ---- |
| `page.tsx` | the route's server component |
| `route.tsx` | layout for its segment and everything below |
| `props` | the loader: a sibling `props.ts`, or an export in `page.tsx` |

A loader runs wherever the route renders: prerendered there is no request; per request it can read headers, cookies, a database. The home page's badge is that fact on screen: a server component whose loader reads Vercel's `x-vercel-ip-*` headers, no client fetch.

## The client entry

`src/client.tsx`:

```tsx
startClient({
  moduleBaseURL: import.meta.env.BASE_URL,
  publicOrigin: import.meta.env.PUBLIC_ORIGIN,
});
```

Both options are required, not inferred; without them module URLs 404 under a deploy base. The plugin defines them from `VITE_BASE_URL` / `VITE_PUBLIC_ORIGIN` (unprefixed names are not read).

## One transport everywhere

`transport: "webpack"` in `vite.config.ts` makes every surface (CDN snapshot, function render, inline flight, fetched `.rsc`, dev) carry the same flight flavor. That is what lets the browser hydrate on a CDN document and client-navigate to a function-rendered route (or the reverse) without switching decoders.

## The baked pair (`dist/server-edge`)

- `render.js`: flight producer, server React and every route baked in.
- `consumer.js`: flight to HTML, client React and client modules behind a closed registry.

The request path resolves no modules at runtime, so the same pair runs on filesystem-less runtimes:

```js
import * as bundle from "./dist/server-edge/render.js";
import { renderFlightToHtml } from "./dist/server-edge/consumer.js";
import { createEdgeRequestHandler } from "vite-plugin-react-server/edge/web";

export default { fetch: createEdgeRequestHandler(bundle, { renderFlightToHtml }) };
```

## The Vercel deploy

`vercel.json` builds with `npm run build:vercel`, serves `dist/static`, and rewrites every non-asset request to `api/render.ts`. **Vercel serves a matching static file before applying a rewrite.** A route with snapshots is answered by the CDN; a route without falls through and renders live. `scripts/prepare-vercel.mjs` drops the snapshots for per-request routes (`/`); `npm run build` still emits every snapshot for `npm run preview` and plain CDN deploys.

Two traps it guards: drop the `.rsc` half together with the `.html` half (else Vercel serves raw flight as `application/octet-stream` and the browser downloads it), and mixing CDN with function responses is only safe under the single transport above (two flight flavors in one deploy break client navigation).
