import styles from "./styles.module.css";

export type EdgeInfo = {
  region: string | null;
  city: string | null;
  country: string | null;
} | null;

// Server component: no "use client", no fetch. The geo comes from props (the
// loader read it off the request headers during the edge render), so it's in
// the server-rendered HTML on first paint - no client round-trip to /api/edge.
export function EdgeBadge({ edge }: { edge: EdgeInfo }) {
  if (!edge) {
    return (
      <span className={styles.edge} data-state="offline">
        prerendered statically - serve on the edge to see live geo
      </span>
    );
  }
  const place = [edge.city, edge.country].filter(Boolean).join(", ");
  return (
    <span className={styles.edge} data-state="live">
      rendered at the edge
      {edge.region ? ` - ${edge.region}` : ""}
      {place ? ` - near ${place}` : ""}
    </span>
  );
}
