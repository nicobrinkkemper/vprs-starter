# Folders and files are the router

Point the plugin at a directory and the file tree **is** the URL tree. Under
`src/routes/`, three filenames mean something:

| file | role |
| --- | --- |
| `page.tsx` | the page rendered at this URL |
| `route.tsx` | a layout wrapping this segment's page and every descendant |
| `props.ts` | this segment's loader; its return value is the page's props |

A `props` export can also live in `page.tsx`, which is what this starter does.

## The map of this app

```
src/routes/
├── route.tsx          layout: the shared surface + footer
├── page.tsx           /            the hero (loader reads request headers)
└── docs/
    ├── page.tsx       /docs        lists the guides (loader reads a folder)
    └── $slug/
        └── page.tsx   /docs/…      one guide (loader reads a file)
```

## Dynamic params

A directory named `$name` is a dynamic param; the loader receives it typed:

```ts
export const props = (_url: string, { params }: { params: { slug: string } }) =>
  ({ slug: params.slug });
```

This page went through exactly that, at build time: the loader picked
`routes.md` out of an `import.meta.glob` of `src/content/` and the server
rendered the snapshot you are most likely reading now. Slugs enumerated with
`staticPaths` in `vite.config.ts` are prerendered like that; any other slug
renders per request on a server deploy, or 404s on a plain static host.
