import { createServer } from "node:http";
import {
  createRequestHandler,
  toNodeListener,
} from "vite-plugin-react-server/request-handler";

process.env.NODE_ENV ??= "production";

const { renderHook, action } = await import("./server/handler.mjs");

const EDGE_GEO = {
  "x-vercel-id": "ams1::local-edge",
  "x-vercel-ip-city": "Amsterdam",
  "x-vercel-ip-country": "NL",
};

const app = createRequestHandler({
  staticDir: "dist/static",
  render: renderHook,
  action,
});

const withEdgeGeo = (request) => {
  const headers = new Headers(request.headers);
  for (const [key, value] of Object.entries(EDGE_GEO)) headers.set(key, value);
  return app(new Request(request, { headers }));
};

createServer(toNodeListener(withEdgeGeo)).listen(4401, () => {
  console.log(
    "vprs-starter, rendering each route per request → http://localhost:4401"
  );
});
