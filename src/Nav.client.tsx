"use client";
import { useEffect, useState } from "react";
import { Link } from "vite-plugin-react-server/router/client";
import styles from "./styles.module.css";

// Client-side nav: Link intercepts internal clicks and fetches the next route's
// flight without a full reload. Active state is read from window.location on
// mount (SSR-safe: useLocation() needs the RouterProvider that only exists
// after hydration, and this component also renders server-side for the shell).
// Nav re-mounts per route, so the mount-time read stays correct across nav.
const ROUTES = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
];

export function Nav() {
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => setPath(window.location.pathname), []);
  return (
    <nav className={styles.nav}>
      {ROUTES.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={styles.navLink}
          data-active={path === to}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
