// Loader runs where the route renders. On the edge it receives the request, so
// it reads the visitor's geo straight off Vercel's edge headers - the data ends
// up in the server-rendered HTML, no client fetch. When a route is prerendered
// at build time there's no request, so `edge` is null (static fallback).
export const props = (_url: string, { request }: { request?: Request }) => {
  const h = request?.headers;
  const id = h?.get("x-vercel-id") ?? "";
  const city = h?.get("x-vercel-ip-city");
  return {
    title: "VPRS",
    tagline: "React Server Components, minimal by design.",
    edge: request
      ? {
          region: (id.split("::")[0] || "").split(":").pop() || null,
          city: city ? decodeURIComponent(city) : null,
          country: h?.get("x-vercel-ip-country") ?? null,
        }
      : null,
  };
};
export type Props = ReturnType<typeof props>;
