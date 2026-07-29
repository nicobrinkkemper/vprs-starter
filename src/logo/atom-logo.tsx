import type { CSSProperties } from "react";
import styles from "./atom-logo.module.css";

type AtomLogoProps = {
  size?: number;
  /** Stay frozen until the mark (or its wrapping link) is hovered. */
  hoverToPlay?: boolean;
  /** Extra electron PAIRS beyond the base ones, spread round-robin over the rings. */
  extraElectrons?: number;
  className?: string;
};

type OrbitConfig = {
  orbitTransform: string;
  counterOrbitTransform: string;
  pathDuration: number;
  reverse?: boolean;
};

/** Billboard stack cancels path, orbit, and scene rotation so the ball faces the viewer. */
const Electron = ({
  counterOrbitTransform,
  opposite,
}: Pick<OrbitConfig, "counterOrbitTransform"> & { opposite?: boolean }) => (
  <div className={[styles.electron, opposite && styles.electronOpposite].filter(Boolean).join(" ")}>
    <div className={styles.counterPath}>
      <div
        className={styles.counterOrbit}
        style={{ "--counter-orbit-transform": counterOrbitTransform } as CSSProperties}
      >
        <div className={styles.counterSpinnerBillboard}>
          <div className={styles.counterSteer}>
            <div className={styles.electronBall} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SPIN_DURATION = 12;

/** Rest pose = classic React atom: rings 60° apart, tipped 67.5°
    (cos 67.5° ≈ 4.2/11, the logo's axis ratio). */
const RING_TIP = "rotateX(67.5deg)";
const RING_TIP_INVERSE = "rotateX(-67.5deg)";

const SPINNER_ORBITS: OrbitConfig[] = [
  {
    orbitTransform: `rotateZ(0deg) ${RING_TIP}`,
    counterOrbitTransform: `${RING_TIP_INVERSE} rotateZ(0deg)`,
    pathDuration: 9.6,
  },
  {
    orbitTransform: `rotateZ(60deg) ${RING_TIP}`,
    counterOrbitTransform: `${RING_TIP_INVERSE} rotateZ(-60deg)`,
    pathDuration: 12,
    reverse: true,
  },
  {
    orbitTransform: `rotateZ(120deg) ${RING_TIP}`,
    counterOrbitTransform: `${RING_TIP_INVERSE} rotateZ(-120deg)`,
    pathDuration: 10.8,
  },
];

const EXTRA_PAIR_ANGLES = [90, 45, 135];

type OrbitRingProps = OrbitConfig & {
  spinDuration?: number;
  extras?: number[];
};

const OrbitRing = (orbit: OrbitRingProps) => {
  const {
    orbitTransform,
    counterOrbitTransform,
    pathDuration,
    reverse,
    spinDuration = SPIN_DURATION,
    extras = [],
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
          "--spin-duration": `${spinDuration}s`,
        } as CSSProperties
      }
    >
      <div className={styles.ring} />
      <div className={styles.ringBand}>
        {[-3, -2, -1, 1, 2, 3].map((layer) => (
          <div
            key={layer}
            className={styles.ringLayer}
            style={{ "--layer": layer } as CSSProperties}
          />
        ))}
      </div>
      <div className={styles.path}>
        <div className={[styles.trace, traceAlt && styles.traceAlt].filter(Boolean).join(" ")} />
        <div
          className={[styles.trace, styles.traceOpposite, traceAlt && styles.traceAlt]
            .filter(Boolean)
            .join(" ")}
        />
        <Electron counterOrbitTransform={counterOrbitTransform} />
        <Electron counterOrbitTransform={counterOrbitTransform} opposite />
        {extras.flatMap((angle) => [angle, angle + 180]).map((angle) => (
          <div
            key={angle}
            className={styles.electronSlot}
            style={
              {
                "--slot-angle": `${angle}deg`,
                "--phase": `${angle / 360 - 1}`,
              } as CSSProperties
            }
          >
            <Electron
              counterOrbitTransform={`rotateZ(${-angle}deg) ${counterOrbitTransform}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/** The logo's DOM survives client navigation, so a per-route size would
    visibly resize the mark mid-spin — share this constant. */
export const LOGO_SIZE = 180;

/** CSS-only 3D atom — partial arc traces, orbiting electrons, fixed spherical nucleus. */
export const AtomLogo = ({
  size = LOGO_SIZE,
  hoverToPlay,
  extraElectrons = 0,
  className,
}: AtomLogoProps) => {
  const extrasPerRing: number[][] = [[], [], []];
  for (let k = 0; k < Math.min(extraElectrons, EXTRA_PAIR_ANGLES.length * 3); k++) {
    extrasPerRing[k % 3].push(EXTRA_PAIR_ANGLES[Math.floor(k / 3)]);
  }
  return (
  <div
    className={[styles.atom, hoverToPlay && styles.hoverToPlay, className]
      .filter(Boolean)
      .join(" ")}
    style={
      {
        "--size": `${size}px`,
        "--spin-duration": `${SPIN_DURATION}s`,
        "--extra": extraElectrons,
      } as CSSProperties
    }
    role="img"
    aria-label="vprs"
  >
    <div className={styles.scene}>
      <div className={styles.nucleus} />
      <div className={styles.spinner}>
        {SPINNER_ORBITS.map((orbit, index) => (
          <OrbitRing key={index} {...orbit} extras={extrasPerRing[index]} />
        ))}
      </div>
    </div>
  </div>
  );
};
