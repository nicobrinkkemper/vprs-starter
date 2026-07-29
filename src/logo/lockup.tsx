import { AtomLogoSteer } from "./atom-logo-steer.client";
import styles from "./lockup.module.css";

export const Lockup = ({ title }: { title: string }) => (
  <div className={styles.lockup}>
    <h1 className={styles.wordmark}>{title}</h1>
    <AtomLogoSteer className={styles.logo} />
  </div>
);
