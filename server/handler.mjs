import {
  createEdgeRequestHandler,
  createEdgeRenderHook,
} from "vite-plugin-react-server/edge";
import * as bundle from "../dist/server-edge/render.js";
import { renderFlightToHtml } from "../dist/server-edge/consumer.js";

// The per-request renderer, shared by both entries (api/render.ts,
// edge-server.mjs) — see README "The baked pair". The imports must stay
// STATIC: Vercel's file tracer only bundles what it can see, and a path
// resolved at runtime would leave the pair out of the function.

/** A Web fetch handler: (Request) => Promise<Response>. */
export const handler = createEdgeRequestHandler(bundle, { renderFlightToHtml });

/**
 * The same renderer as a hook, for composing into a server that also serves
 * files from disk (edge-server.mjs): returns null for anything it does not
 * render, so the caller stays in charge of the fallback.
 */
export const renderHook = createEdgeRenderHook(bundle, { renderFlightToHtml });

/** The bundle's baked "use server" action gate. */
export const action = bundle.handleRouteAction;
