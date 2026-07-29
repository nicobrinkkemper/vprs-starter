"use client";
import { useEffect, useRef, useState } from "react";
import { AtomLogo } from "./atom-logo";
import styles from "./atom-logo.module.css";

const MAX_EXTRA = 6;

// 6 base electrons = Carbon; every click adds a PAIR (electron + its
// opposite, protons to match), stepping two elements at a time to Argon.
const ELEMENTS = [
  "Carbon", "Oxygen", "Neon", "Magnesium", "Silicon", "Sulfur", "Argon",
];

// Global light rest pose, set on <html>. globals.css registers/eases these
// vars; atom-logo.module.css falls back to the same values. Keep in sync.
const LIGHT_REST: Record<string, string> = {
  "--vprs-light-x": "30%",
  "--vprs-light-y": "24%",
  "--vprs-light-dx": "-0.59",
  "--vprs-light-dy": "-0.87",
  "--vprs-light-ang": "-34deg",
  "--vprs-pointer-x": "50%",
  "--vprs-pointer-y": "35%",
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function AtomLogoSteer({ size, className }: { size?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [extra, setExtra] = useState(0);

  // Newly mounted electrons start fresh animations mid-cycle, cancelling
  // against the wrong phase and wobble. Align each animation's startTime
  // to the first running one with the same name.
  useEffect(() => {
    const el = ref.current;
    if (!el || extra === 0) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const reference = new Map<string, number>();
        const anims = el.getAnimations({ subtree: true });
        for (const a of anims) {
          if (a instanceof CSSAnimation && a.startTime != null && !reference.has(a.animationName)) {
            reference.set(a.animationName, a.startTime as number);
          }
        }
        for (const a of anims) {
          if (!(a instanceof CSSAnimation)) continue;
          const t0 = reference.get(a.animationName);
          if (t0 != null && a.startTime !== t0) a.startTime = t0;
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [extra]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement.style;
    const setLight = (vars: Record<string, string>) => {
      for (const k in vars) root.setProperty(k, vars[k]);
    };
    // Unwrap the angle (previous + shortest signed delta) so the eased var
    // never takes the long way around.
    let lastAng = -34;
    const toNearest = (target: number) => {
      lastAng += ((target - lastAng + 540) % 360 + 360) % 360 - 180;
      return lastAng;
    };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // The wrapper is display:contents (no box, all-zero rect); measure
        // the atom itself or every vector anchors to the viewport corner.
        const r = (el.firstElementChild ?? el).getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        el.style.setProperty("--steer-y", `${(dx * 44).toFixed(2)}deg`);
        el.style.setProperty("--steer-x", `${(-dy * 44).toFixed(2)}deg`);
        // nx/ny point TOWARD the light (mouse→atom, saturating at viewport
        // edges); clamped amplitudes keep the hotspot inside the rim so the
        // shading never flips.
        const nx = clamp(dx * 2, -1, 1);
        const ny = clamp(dy * 2, -1, 1);
        setLight({
          "--vprs-light-x": `${(50 + nx * 34).toFixed(2)}%`,
          "--vprs-light-y": `${(50 + ny * 30).toFixed(2)}%`,
          "--vprs-light-dx": nx.toFixed(3),
          "--vprs-light-dy": ny.toFixed(3),
          "--vprs-light-ang": `${toNearest(Math.atan2(nx, -ny) * (180 / Math.PI)).toFixed(1)}deg`,
          "--vprs-pointer-x": `${((e.clientX / window.innerWidth) * 100).toFixed(2)}%`,
          "--vprs-pointer-y": `${((e.clientY / window.innerHeight) * 100).toFixed(2)}%`,
        });
      });
    };
    const onLeave = () => {
      el.style.setProperty("--steer-y", "0deg");
      el.style.setProperty("--steer-x", "0deg");
      setLight({ ...LIGHT_REST, "--vprs-light-ang": `${toNearest(-34).toFixed(1)}deg` });
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      // Drop the vars so consumers fall back to the registered rest-pose initials.
      for (const k in LIGHT_REST) root.removeProperty(k);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ display: "contents" }}
      title={`${ELEMENTS[extra]} — click for the next element`}
      onClick={() => setExtra((n) => (n >= MAX_EXTRA ? 0 : n + 1))}
    >
      <AtomLogo
        size={size}
        className={[styles.clickable, className].filter(Boolean).join(" ")}
        extraElectrons={extra}
      />
    </div>
  );
}
