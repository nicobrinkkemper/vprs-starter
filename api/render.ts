import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { handler } from "../server/handler.mjs";

// Vercel Node function. `vercel.json` rewrites every non-asset request here, so
// each route is rendered on the server at request time instead of being served
// as prerendered HTML. That is what puts the visitor's geo in the first paint:
// the loader reads Vercel's x-vercel-ip-* headers off the Request during the
// render, with no client fetch.
//
// A Node function, not an edge one: the baked bundle reads the server manifest
// off disk, and Vercel's edge runtime has no filesystem. The geo headers are
// present on both runtimes, so the demo is unaffected.

/** Node's headers (values may repeat) -> Web Headers. */
function toWebHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) for (const v of value) headers.append(key, v);
    else if (value != null) headers.set(key, value);
  }
  return headers;
}

/**
 * The route url to render. The rewrite passes the original path as `?path=`,
 * because a request rewritten to a function arrives with the function's own
 * path in `req.url`. Falls back to the pathname when the function is hit
 * directly.
 */
function routeUrl(req: IncomingMessage, origin: string): URL {
  const incoming = new URL(req.url ?? "/", origin);
  const original = incoming.searchParams.get("path");
  return new URL(original || incoming.pathname, origin);
}

export default async function render(req: IncomingMessage, res: ServerResponse) {
  try {
    const host = (req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost") as string;
    const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
    const origin = `${proto}://${host}`;

    const response: Response = await handler(
      new Request(routeUrl(req, origin), {
        method: req.method,
        headers: toWebHeaders(req),
      }),
    );

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) Readable.fromWeb(response.body as never).pipe(res);
    else res.end(await response.text());
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
