import type { ReactNode } from "react";
import { Footer } from "../Footer";
import styles from "../styles.module.css";

export const Layout = ({ children }: { children?: ReactNode }) => (
  <div className={styles.page}>
    <main className={styles.main}>{children}</main>
    <Footer />
  </div>
);
