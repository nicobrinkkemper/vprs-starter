"use client";
import "./globals.css";
import { startClient } from "vite-plugin-react-server/router/client";

// The whole client entry. startClient assembles the router, hydration (it picks
// up the flight payload inlined into the document, so there is no /index.rsc
// round-trip on first paint), client-side navigation and RSC HMR.
//
// moduleBaseURL and publicOrigin are not inferred. Pass them, or the client
// ships un-prefixed module URLs that 404 under a deploy base. The plugin defines
// both at build time from VITE_BASE_URL / VITE_PUBLIC_ORIGIN.
startClient({
  moduleBaseURL: import.meta.env.BASE_URL,
  publicOrigin: import.meta.env.PUBLIC_ORIGIN,
});
