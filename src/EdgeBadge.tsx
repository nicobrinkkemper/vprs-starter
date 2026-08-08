import styles from "./styles.module.css";
import { EdgePing } from "./EdgePing.client.js";
import { pingEdge } from "./edgePing.js";

export type EdgeInfo = {
  region: string | null;
  city: string | null;
  country: string | null;
} | null;

export function EdgeBadge({ edge }: { edge: EdgeInfo }) {
  if (!edge) {
    return (
      <span className={styles.edge} data-state="offline">
        Running on your local machine
      </span>
    );
  }
  const place = [edge.city, edge.country].filter(Boolean).join(", ");
  return (
    <span className={styles.edge} data-state="live">
      rendered at the edge
      {edge.region ? ` - ${edge.region}` : ""}
      {place ? ` - near ${place}` : ""} <EdgePing ping={pingEdge} />
    </span>
  );
}
