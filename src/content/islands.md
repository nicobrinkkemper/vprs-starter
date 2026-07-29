# Server-first, islands second

Every component in this starter renders on the server unless it says
otherwise. The escape hatch is one directive:

```tsx
"use client";
```

That file, and only that file, ships to the browser as an island. Everything
else stays server-side: its code never reaches the client bundle, and it can
read files, secrets, and request headers directly.

## The islands on this site

- **the atom**: it steers toward your pointer and a click adds an electron
  pair. The pointer also drives the page's light: the island writes
  `--vprs-*` CSS variables on `<html>` and every surface shades itself from
  them.
- **every `Link`**: the router's navigation island — it intercepts internal
  clicks and fetches the next route's flight instead of reloading the page.
- that's it. The hero copy, the badge, these guides: all server components.

## Rule of thumb

Start server-side. Reach for `"use client"` only when something must respond
**between** navigations: pointer tracking, optimistic form state, a toggle.
The file-name suffix `.client.tsx` used here is just an IDE convention; the
directive is what decides.
