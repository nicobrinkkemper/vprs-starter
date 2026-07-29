import { Link } from "../../../Link.client";
import { Markdown } from "../../../Markdown";
import styles from "../../../styles.module.css";

const GUIDES = import.meta.glob("../../../content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Slugs beyond vite.config.ts staticPaths still resolve per-request on a server.
export const props = (
  _url: string,
  { params }: { params: { slug: string } },
) => ({
  slug: params.slug,
  text:
    Object.entries(GUIDES).find(([path]) =>
      path.endsWith(`/${params.slug}.md`),
    )?.[1] ?? null,
});
export type Props = ReturnType<typeof props>;

export const Page = ({ slug, text }: Props) => (
  <>
    <title>{`vprs — ${slug}`}</title>
    <section className={styles.docs}>
      {text ? <Markdown text={text} /> : (
        <p className={styles.prose}>No guide named "{slug}".</p>
      )}
      <p className={styles.prose}>
        <Link to="/docs/" className={styles.link}>
          ← all guides
        </Link>
      </p>
    </section>
  </>
);
