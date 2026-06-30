// Vercel Edge Function. Runs on Vercel's edge runtime at request time, so it
// can read the visitor's approximate geo and the edge region that served them —
// data a static build can't know. This is the bit that only "lights up" once
// deployed: locally and on the plain static CDN there's no function here, and
// the page falls back gracefully. No build step and no config beyond this file;
// Vercel picks up anything under /api automatically.
export const config = { runtime: "edge" };

export default function handler(request: Request): Response {
  const h = request.headers;
  // x-vercel-id looks like "<edge-region>::<id>" or "<edge>:<compute>::<id>";
  // the segment before "::" is the region(s), take the compute one.
  const id = h.get("x-vercel-id") ?? "";
  const region = (id.split("::")[0] || "").split(":").pop() || null;
  const city = h.get("x-vercel-ip-city");

  return new Response(
    JSON.stringify({
      edge: true,
      region,
      city: city ? decodeURIComponent(city) : null,
      country: h.get("x-vercel-ip-country"),
      time: new Date().toISOString(),
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}
