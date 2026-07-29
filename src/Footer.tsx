import { LINKS } from "./constants"
import styles from "./styles.module.css";

export const Footer = () => (
    <footer className={styles.footer}>
        {LINKS.map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>{label}</a>
        ))}
    </footer>
);
