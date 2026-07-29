# Deploy

```
npm run dev            # develop with HMR
npm run build          # prerendered snapshots + server bundle for every route
npm run edge           # serve the built output locally, rendering per request
```

One `npm run build` gives every route two forms: a prerendered snapshot in
`dist/static`, and a live render from the server bundle with a real
`Request` in its loader. Publish `dist/static` on **any static host** and
the site works as-is; put a server in front and you choose **per route**
which form answers. The home page's badge shows the difference: rendered on a server, its
loader reads the request headers; in the prerendered form there is no
request, and the badge shows that state.

## The hosted demo

This demo happens to be hosted on Vercel. **We are not affiliated with
Vercel**; it's simply where the demo runs. `npm run build:vercel` emits the
static output for their CDN plus a Node function (`api/render.ts`) for the
routes that render per request; `scripts/prepare-vercel.mjs` chooses which.

Want the same setup? Use their deploy link with this repo:

[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnicobrinkkemper%2Fvprs-starter)

Prefer somewhere else? Delete `api/`, `vercel.json`, and
`scripts/prepare-vercel.mjs`; the plain `npm run build` output has no Vercel
in it at all.
