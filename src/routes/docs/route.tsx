import type { ReactNode } from "react";
import { AtomLogo } from "../../logo/atom-logo";
import { Link } from "../../Link.client";
import styles from "../../styles.module.css";

export const Layout = ({ children }: { children?: ReactNode }) => (
  <>
    <header className={styles.docsHeader}>
      <Link to="/" className={styles.brandLink}>
        <span className={styles.brandLogo}>
          <AtomLogo size={26} hoverToPlay />
        </span>
        <span className={styles.brandMark}>vite-plugin-react-server</span>
      </Link>
    </header>
    {children}
  </>
);
