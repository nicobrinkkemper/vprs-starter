import { AtomLogo } from "../../logo/atom-logo";
import { Nav } from "../../Nav.client";
import styles from "../../styles.module.css";

export const Page = ({ title }: { title: string }) => (
  <main className={styles.page}>
    <Nav />
    <div className={styles.brand}>
      <AtomLogo size={110} className={styles.logo} />
      <h1 className={styles.wordmark}>{title}</h1>
      <p className={styles.prose}>
        This route is prerendered to static HTML and its initial flight is
        inlined into the page, so it hydrates in place with no <code>/index.rsc</code>{" "}
        round-trip. The nav above uses client-side <code>Link</code> navigation
        between <code>/</code> and <code>/about</code>, fetching only the next
        route's flight.
      </p>
    </div>
    <footer className={styles.footer}>
      <a
        className={styles.link}
        href="https://github.com/nicobrinkkemper/vite-plugin-react-server"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </footer>
  </main>
);
