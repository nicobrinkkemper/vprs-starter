"use client";
import { useState, useTransition } from "react";

export function EdgePing({ ping }: { ping: () => Promise<{ at: string }> }) {
  const [at, setAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
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
