import { Link } from "../../Link.client";
import styles from "../../styles.module.css";

// Eager glob, not fs reads: content must resolve on a filesystem-less edge runtime.
const GUIDES = import.meta.glob("../../content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const props = () => ({
  guides: Object.entries(GUIDES)
    .map(([path, text]) => ({
      slug: path.replace(/^.*\/([^/]+)\.md$/, "$1"),
      title: text.split("\n")[0].replace(/^#\s*/, ""),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug)),
});
export type Props = ReturnType<typeof props>;

export const Page = ({ guides }: Props) => (
  <>
    <title>vprs — guides</title>
    <section className={styles.docs}>
      <h1 className={styles.docTitle}>guides</h1>
      <p className={styles.prose}>
        Markdown files in <code>src/content/</code>, rendered by the server;
        none of it ships in the client bundle.
      </p>
      <ul className={styles.docList}>
        {guides.map(({ slug, title }) => (
          <li key={slug}>
            <Link to={`/docs/${slug}/`} className={styles.link}>
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  </>
);
