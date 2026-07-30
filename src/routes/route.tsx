import type { ReactNode } from "react";
import { Footer } from "../Footer";
import styles from "../styles.module.css";

export const Layout = ({ children }: { children?: ReactNode }) => (
  <div className={styles.page}>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07070d" />
    <main className={styles.main}>{children}</main>
    <Footer />
  </div>
);
