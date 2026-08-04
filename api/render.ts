import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { handler } from "../server/handler.mjs";

// `vercel.json` rewrites every non-asset request here; the loader reads
// x-vercel-ip-* off the Request, so the visitor's geo is in the first paint.

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
 * The rewrite passes the original path as `?path=`; a rewritten request
 * arrives with the function's own path in `req.url`.
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

    // Forward the body so POSTed server actions survive the Node→Web bridge;
    // `duplex` is mandatory whenever a Request gets a stream body.
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const response: Response = await handler(
      new Request(routeUrl(req, origin), {
        method: req.method,
        headers: toWebHeaders(req),
        ...(hasBody
          ? { body: Readable.toWeb(req) as ReadableStream, duplex: "half" }
          : {}),
      } as RequestInit),
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
