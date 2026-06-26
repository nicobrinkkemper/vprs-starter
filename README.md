# vprs-starter

A minimal [`vite-plugin-react-server`](https://github.com/nicobrinkkemper/vite-plugin-react-server) app set up to deploy on **Vercel**, growing into a Supabase-backed CMS. Built small on purpose — one static page now, live routes next.

## Status

- **Step 1 (now): static deploy.** Routes in `build.pages` prerender to `dist/static`, served by Vercel's CDN. No server function, no `--conditions`, no moving parts. `edge: false` in `vite.config.ts`.
- **Step 2 (next): live routes.** Flip `edge` back on (it's the default) and add a Vercel **Node serverless function** (`api/`) running `createEdgeRequestHandler` for routes marked `dynamic`. Needs vite-plugin-react-server with the `/edge` export (≥ the release after 2.10.0).
- **Step 3: CMS.** A `dynamic` route reads content from Supabase and renders it flash-free per request.

## Develop

```bash
npm install
npm run dev      # vite dev server
npm run build    # → dist/static (+ dist/client, dist/server)
npm run preview  # serve the built dist/static locally
```

## Deploy to Vercel (step 1, static)

`vercel.json` already points Vercel at the right build:

```json
{
  "framework": null,
  "buildCommand": "vite build --app",
  "outputDirectory": "dist/static"
}
```

So a connected Vercel project (or `vercel` / `vercel --prod` from the CLI) builds the app and serves `dist/static` from the CDN. Nothing else to configure for the static step.

## Roadmap (step 2: the Vercel adapter)

The dynamic path will follow the standard "Node server on Vercel" shape — vprs's `toNodeListener(handler)` is already a `(req, res)` Node function, so it maps onto a Vercel Node function directly:

```jsonc
// vercel.json (step 2 sketch)
{
  "functions": { "api/index.ts": { "includeFiles": "dist/**" } },
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

```ts
// api/index.ts (step 2 sketch)
import { createEdgeRequestHandler } from "vite-plugin-react-server/edge";
import { toNodeListener } from "vite-plugin-react-server/request-handler";

const ready = createEdgeRequestHandler({ buildDir: "dist", dynamic: ["/cms"] }).then(toNodeListener);
export default async (req, res) => (await ready)(req, res);
```

Node runtime (`nodejs22.x`) with `supportsResponseStreaming` for vprs's streaming HTML. A proper `.vercel/output` Build Output API adapter (CDN static + function, like SvelteKit/Astro) is the grown-up version of this, for later.
