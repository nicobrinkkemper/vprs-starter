import { AtomLogo } from "./logo/atom-logo";
import { props } from "./props";
import styles from "./styles.module.css";

export const Page = ({ title, tagline } = props) => (
  <main className={styles.page}>
    <div className={styles.brand}>
      <div className={styles.lockup}>
        <AtomLogo size={80} />
        <h1 className={styles.wordmark}>{title}</h1>
      </div>
      <p className={styles.tagline}>{tagline}</p>
    </div>
  </main>
);
