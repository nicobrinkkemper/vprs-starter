import { defineConfig, devices } from "@playwright/test";

// Browser smoke test against the Vercel-shaped build (`npm test` runs
// build:vercel first). Two servers stand in for the two halves of a deploy:
//   edge    node edge-server.mjs — renders every route per request, the way
//           api/render.ts does for a route without prerendered files (`/`)
//   static  vite preview over dist/static — the prerendered pages, the way
//           the CDN serves /docs/<slug>/
const edgePort = process.env.PORT ?? "4401";
const staticPort = process.env.STATIC_PORT ?? "4173";

export default defineConfig({
  testDir: "./test",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${edgePort}`,
    trace: "on-first-retry",
  },
  metadata: { staticOrigin: `http://localhost:${staticPort}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node edge-server.mjs",
      url: `http://localhost:${edgePort}/docs/`,
      // The edge server loads dist/server-edge once at start, so one left
      // over from an older build tests that build. CI never reuses a server.
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npx vite preview --outDir dist/static --port ${staticPort} --strictPort`,
      url: `http://localhost:${staticPort}/docs/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
