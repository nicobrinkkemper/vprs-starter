import type { CSSProperties } from "react";
import styles from "./atom-logo.module.css";

type AtomLogoProps = {
  /** Pixel width and height of the mark. */
  size?: number;
  className?: string;
};

type OrbitConfig = {
  orbitTransform: string;
  counterOrbitTransform: string;
  pathDuration: number;
  reverse?: boolean;
  equator?: boolean;
};

type ElectronProps = Pick<OrbitConfig, "counterOrbitTransform"> & {
  /** Counter the scene spin for electrons inside the rotating orbital group. */
  spinsWithScene?: boolean;
};

const SPIN_DURATION = 8;
const EQUATOR_PATH = 4.5;

const counterSpinnerClass = (spinsWithScene?: boolean) =>
  spinsWithScene ? styles.counterSpinnerBillboard : styles.counterSpinnerFace;

/** Billboard stack cancels path, orbit, and scene rotation so the ball faces the viewer. */
const Electron = ({ counterOrbitTransform, spinsWithScene }: ElectronProps) => (
  <div className={styles.electron}>
    <div className={styles.counterPath}>
      <div
        className={styles.counterOrbit}
        style={{ "--counter-orbit-transform": counterOrbitTransform } as CSSProperties}
      >
        <div className={counterSpinnerClass(spinsWithScene)}>
          <div className={styles.electronBall} />
        </div>
      </div>
    </div>
  </div>
);

/** Tilted rings inside the Y-spinning group. */
const SPINNER_ORBITS: OrbitConfig[] = [
  {
    orbitTransform: "rotateY(60deg)",
    counterOrbitTransform: "rotateY(-60deg)",
    pathDuration: 3.2,
  },
  {
    orbitTransform: "rotateY(-60deg)",
    counterOrbitTransform: "rotateY(60deg)",
    pathDuration: 4,
    reverse: true,
  },
  {
    orbitTransform: "rotateY(0deg)",
    counterOrbitTransform: "rotateY(0deg)",
    pathDuration: 3.6,
  },
  {
    orbitTransform: "rotateZ(90deg) rotateY(60deg)",
    counterOrbitTransform: "rotateY(-60deg) rotateZ(-90deg)",
    pathDuration: 4.4,
  },
  {
    orbitTransform: "rotateZ(90deg) rotateY(-60deg)",
    counterOrbitTransform: "rotateY(60deg) rotateZ(-90deg)",
    pathDuration: 3.8,
    reverse: true,
  },
];

const EQUATOR_ORBIT: OrbitConfig = {
  orbitTransform: "rotateX(90deg)",
  counterOrbitTransform: "rotateX(-90deg)",
  pathDuration: EQUATOR_PATH,
  equator: true,
};

type OrbitRingProps = OrbitConfig & {
  spinDuration?: number;
};

/** Single orbital ring with trace and electron. */
const OrbitRing = (orbit: OrbitRingProps) => {
  const {
    orbitTransform,
    counterOrbitTransform,
    pathDuration,
    reverse,
    equator,
    spinDuration = SPIN_DURATION,
  } = orbit;

  const traceAlt = !!reverse;

  return (
    <div
      className={styles.orbit}
      style={
        {
          "--orbit-transform": orbitTransform,
          "--path-duration": `${pathDuration}s`,
          "--path-direction": reverse ? "reverse" : "normal",
          "--depth-animation": equator ? "vprs-depth-equator" : "vprs-depth",
          "--spin-duration": `${spinDuration}s`,
        } as CSSProperties
      }
    >
      <div className={styles.path}>
        <div className={[styles.trace, traceAlt && styles.traceAlt].filter(Boolean).join(" ")} />
        <Electron counterOrbitTransform={counterOrbitTransform} spinsWithScene={!equator} />
      </div>
    </div>
  );
};

/** CSS-only 3D atom — partial arc traces, orbiting electrons, fixed spherical nucleus. */
export const AtomLogo = ({ size = 72, className }: AtomLogoProps) => (
  <div
    className={[styles.atom, className].filter(Boolean).join(" ")}
    style={
      {
        "--size": `${size}px`,
        "--spin-duration": `${SPIN_DURATION}s`,
      } as CSSProperties
    }
    role="img"
    aria-label="vprs"
  >
    <div className={styles.scene}>
      <div className={styles.nucleus} />
      <div className={styles.spinner}>
        {SPINNER_ORBITS.map((orbit, index) => (
          <OrbitRing key={index} {...orbit} />
        ))}
      </div>
      <div className={styles.equator}>
        <OrbitRing {...EQUATOR_ORBIT} />
      </div>
    </div>
  </div>
);
