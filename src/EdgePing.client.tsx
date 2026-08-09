"use client";
import { useState, useTransition } from "react";
import styles from "./styles.module.css";

export function EdgePing({ ping }: { ping: () => Promise<{ at: string }> }) {
  const [at, setAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
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
      {pending ? "pinging…" : at ? `live · ${at.slice(11, 19)} UTC` : "ping"}
    </button>
  );
}
