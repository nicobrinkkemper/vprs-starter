# vprs-starter

A minimal [`vite-plugin-react-server`](https://github.com/nicobrinkkemper/vite-plugin-react-server) app deployed on **Vercel**, growing into a Supabase-backed CMS. Built small on purpose.

Two file-based routes (`/` and `/about`), a one-call client entry, and every route rendered on the server at request time.

## Status

- **Step 1 (done): static deploy.** Routes prerender to `dist/static` and hydrate in place — each page's initial flight is inlined into its HTML, so there's no `/index.rsc` round-trip on first paint.
- **Step 2 (done): server-rendered routes.** A Vercel Node function renders each route per request out of the single-isolate bundle, so a route's loader can read the live request. That's what the geo badge on the home page shows.
- **Step 3 (next): CMS.** A route reads content from Supabase and renders it per request.

## Develop

```bash
npm install
npm run dev      # vite dev server
npm run build    # → dist/static (+ dist/client, dist/server, dist/server-edge)
npm run preview  # serve the prerendered dist/static
npm run edge     # build, then render every route per request on :4401
```

`npm run preview` shows the **static** path (prerendered HTML, geo badge idle). `npm run edge` shows the **dynamic** path — the same code Vercel runs, with the geo headers Vercel would set simulated locally.

## Routing

`fileRouter("src/routes")` scans `src/routes/**` for a `page.tsx` and its sibling `props.ts`, and hands the plugin the pages, props and route patterns. Adding a route means adding a folder.

A route's `props.ts` is its loader, and **it runs wherever the route renders**. Prerendered at build time there is no request, so it takes the static path; rendered per request it receives the `Request` and can read headers, cookies or a database.

## The client entry

`src/client.tsx` is the whole thing:

```tsx
startClient({
  moduleBaseURL: import.meta.env.BASE_URL,
  publicOrigin: import.meta.env.PUBLIC_ORIGIN,
});
```

`startClient` assembles the router, hydration, client-side navigation and RSC HMR. Pass `moduleBaseURL` and `publicOrigin` — they are not inferred, and without them the client ships un-prefixed module URLs that 404 under a deploy base. The plugin defines both at build time from `VITE_BASE_URL` / `VITE_PUBLIC_ORIGIN` (note the `VITE_` prefix: the unprefixed names are not read).

## The geo badge

The home page shows where it was rendered. It is a plain **server** component with no `"use client"` and no fetch: the loader reads Vercel's `x-vercel-ip-*` headers off the request during the render, so the answer is in the server HTML on first paint. Prerendered, there is no request, and the badge says so instead.

That is the point of the demo — the same route is static or live depending only on where it renders.

## How the Vercel deploy works

`vercel.json` builds with `npm run build:vercel` and serves `dist/static`, with every non-asset request rewritten to `api/render.ts`.

Two things are worth knowing:

- **Vercel serves a matching static file before it applies a rewrite.** The prerendered `index.html` would therefore answer `/` and the render function would never run — the deploy would look static and the badge would stay dark. So `scripts/prepare-vercel.mjs` drops the prerendered page HTML from the dynamic deploy, and the client chunks, CSS and manifests stay. `npm run build` still emits that HTML for `npm run preview` and for a plain CDN deploy.
- **It's a Node function, not an edge-runtime one.** `build.edge` bakes a *single-isolate* bundle (`dist/server-edge/render.js`): one isolate, no `worker_threads`, no runtime `--conditions`. It still reads the server manifest off disk, and Vercel's edge runtime has no filesystem. Vercel sets the geo headers on both runtimes, so nothing about the demo depends on the distinction.

`api/render.ts` and `edge-server.mjs` both call the same handler (`server/handler.mjs`), so what runs locally is what runs in production.
