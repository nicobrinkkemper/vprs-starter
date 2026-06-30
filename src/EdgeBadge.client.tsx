"use client";
import React from "react";
import styles from "./styles.module.css";

type EdgeInfo = {
  edge: boolean;
  region: string | null;
  city: string | null;
  country: string | null;
  time: string;
};

// Asks the Vercel Edge Function (api/edge) where it's being served from. On the
// deployed site this fills in with the real edge region + visitor geo; locally
// or on a plain static host the function isn't there, so it shows a hint that
// the feature lights up once deployed.
export function EdgeBadge() {
  const [info, setInfo] = React.useState<EdgeInfo | null>(null);
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/edge", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: EdgeInfo) => alive && setInfo(data))
      .catch(() => alive && setOffline(true));
    return () => {
      alive = false;
    };
  }, []);

  if (offline) {
    return (
      <span className={styles.edge} data-state="offline">
        ⚡ edge function idle — deploy to Vercel to see it live
      </span>
    );
  }
  if (!info) {
    return (
      <span className={styles.edge} data-state="loading">
        ⚡ asking the edge…
      </span>
    );
  }

  const place = [info.city, info.country].filter(Boolean).join(", ");
  return (
    <span className={styles.edge} data-state="live">
      ⚡ rendered at the edge
      {info.region ? ` · ${info.region}` : ""}
      {place ? ` · near ${place}` : ""}
    </span>
  );
}
