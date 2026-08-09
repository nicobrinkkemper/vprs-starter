"use client";
import { useState, useTransition } from "react";
import styles from "./styles.module.css";

export function EdgePing({ ping }: { ping: () => Promise<{ at: string }> }) {
  const [at, setAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <button
        type="button"
        className={styles.ping}
        disabled={pending}
        data-testid="edge-ping"
        onClick={() =>
          startTransition(async () => {
            const result = await ping();
            setAt(result.at);
          })
        }
      >
        ping
      </button>
      <span className={styles.pong}>
        <span className={styles.pongSizer} aria-hidden="true">
          00:00:00 UTC
        </span>
        {at && <span className={styles.pongAt}>{at.slice(11, 19)} UTC</span>}
      </span>
    </>
  );
}
