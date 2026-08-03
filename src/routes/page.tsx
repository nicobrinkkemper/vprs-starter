import type { ReactNode } from "react";
import { Lockup } from "../logo/lockup";
import { Link } from "../Link.client";
import styles from "../styles.module.css";
import { EdgeBadge } from "../EdgeBadge";

export const props = (_url: string, { request }: { request?: Request }) => {
  const h = request?.headers;
  const city = h?.get("x-vercel-ip-city");
  const decodedCity = city ? decodeURIComponent(city) : null;
  const country = h?.get("x-vercel-ip-country") ?? null;
  const vercelId = h?.get("x-vercel-id");
  const edge = vercelId ? { region: vercelId.split("::")[0] ?? null, city: decodedCity, country } : null;
  return {
    title: "vprs",
    tagline: <EdgeBadge edge={edge} />,
  };
};
export type Props = ReturnType<typeof props>;

export const Page = ({
  title,
  tagline
}: {
  title: string;
  tagline: ReactNode;
}) => (
  <>
    <meta charSet="utf-8" />
    <title>vprs</title>
    <link
      rel="icon"
      type="image/svg+xml"
      href={`${import.meta.env.BASE_URL}favicon.svg`}
    />

    <section className={styles.hero}>
      <Lockup title={title} />
      <p className={styles.tagline}>{tagline}</p>
      <Link to="/docs/" className={styles.link}>
        read the guides →
      </Link>
    </section>
  </>
);
