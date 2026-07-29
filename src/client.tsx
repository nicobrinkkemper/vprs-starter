"use client";
import "./globals.css";
import { startClient } from "vite-plugin-react-server/router/client";

startClient({
  moduleBaseURL: import.meta.env.BASE_URL,
  publicOrigin: import.meta.env.PUBLIC_ORIGIN,
});
