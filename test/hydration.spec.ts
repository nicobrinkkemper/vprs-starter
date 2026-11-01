import { test, expect, type Page } from "@playwright/test";

// A route can answer 200 with the right HTML and still be dead in the browser:
// the inline flight payload not adopted, or the decoder closing before React
// hydrates. Only a browser sees that. Every page here must hydrate with a
// clean console and read its payload from the document, not fetch it again.
//
// `/` comes from the edge server (rendered per request, payload streamed
// inline); /docs/routes/ comes from the static server (prerendered, payload
// inlined as one blob). See playwright.config.ts.

const watch = (page: Page) => {
  const errors: string[] = [];
  const flightRequests: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    const accept = r.headers()["accept"] ?? "";
    if (/\.rsc(\?|$)/.test(r.url()) || accept.includes("text/x-component")) {
      flightRequests.push(r.url());
    }
  });
  return { errors, flightRequests };
};

const reactAttached = (page: Page) =>
  page.evaluate(() => {
    const main = document.querySelector("main");
    return !!main && Object.keys(main).some((k) => k.startsWith("__react"));
  });

const expectHydrated = async (page: Page, seen: ReturnType<typeof watch>) => {
  // Wait until React has attached to <main>, or the page has reported an
  // error: that error is the failure to show, not a timeout.
  await expect
    .poll(async () => seen.errors.length > 0 || (await reactAttached(page)))
    .toBe(true);
  expect(seen.errors).toEqual([]);
  expect(await reactAttached(page)).toBe(true);
  expect(seen.flightRequests).toEqual([]);
};

// The flag set before the click survives only when the document is not
// reloaded, which is what a hydrated <Link> promises.
const expectClientNavigation = async (page: Page, link: RegExp, url: RegExp) => {
  await page.evaluate(() => ((window as any).__sameDocument = true));
  await page.getByRole("link", { name: link }).click();
  await expect(page).toHaveURL(url);
  expect(await page.evaluate(() => (window as any).__sameDocument)).toBe(true);
};

test("/ (rendered per request, streamed inline payload) hydrates", async ({ page }) => {
  const seen = watch(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "vprs" })).toBeVisible();
  await expectHydrated(page, seen);
});

test("/docs/routes/ (prerendered, inline payload) hydrates", async ({ page }) => {
  const seen = watch(page);
  const { staticOrigin } = test.info().config.metadata;
  await page.goto(`${staticOrigin}/docs/routes/`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectHydrated(page, seen);
});

test("a hydrated / navigates to /docs/ without a document load", async ({ page }) => {
  const seen = watch(page);
  await page.goto("/");
  await expectHydrated(page, seen);
  await expectClientNavigation(page, /read the guides/, /\/docs\/$/);
  await expect(page.getByRole("heading", { name: "guides" })).toBeVisible();
  expect(seen.errors).toEqual([]);
});
