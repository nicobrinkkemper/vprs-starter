import { AtomLogo } from "./logo/atom-logo";
import { EdgeBadge } from "./EdgeBadge.client";
import { props } from "./props";
import styles from "./styles.module.css";

const LINKS = [
  { href: "https://github.com/nicobrinkkemper/vite-plugin-react-server", label: "GitHub" },
  { href: "https://www.npmjs.com/package/vite-plugin-react-server", label: "npm" },
  { href: "https://github.com/nicobrinkkemper/vite-plugin-react-server#readme", label: "Docs" },
];

export const Page = ({ title, tagline } = props) => (
  <main className={styles.page}>
    <div className={styles.brand}>
      <AtomLogo size={180} className={styles.logo} />
      <h1 className={styles.wordmark}>{title}</h1>
      <p className={styles.tagline}>{tagline}</p>
      <EdgeBadge />
    </div>
    <footer className={styles.footer}>
      {LINKS.map(({ href, label }) => (
        <a
          key={href}
          className={styles.link}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ))}
    </footer>
  </main>
);
