import type { ReactNode } from "react";
import { Lockup } from "../logo/lockup";
import { Link } from "../Link.client";
import styles from "../styles.module.css";
import { EdgeBadge } from "../EdgeBadge";

type Host = "dev" | "preview" | "vercel" | "static";

export const props = (_url: string, { request }: { request?: Request }) => {
  const h = request?.headers;
  const city = h?.get("x-vercel-ip-city");
  const decodedCity = city ? decodeURIComponent(city) : null;
  const country = h?.get("x-vercel-ip-country") ?? null;
  const vercelId = h?.get("x-vercel-id");
  // The SSG freeze pass renders with a synthetic empty-headers Request, so
  // liveness must key on host/user-agent, not request presence.
  const live = Boolean(h?.get("host") ?? h?.get("user-agent"));
  const host: Host = import.meta.env.DEV
    ? "dev"
    : vercelId
      ? "vercel"
      : live
        ? "preview"
        : "static";
  // Per-request origin; import.meta.env.PUBLIC_ORIGIN is baked at build time.
  const hostHeader = h?.get("host");
  const proto = h?.get("x-forwarded-proto") ?? "http";
  const edge = vercelId ? { region: vercelId.split("::")[0] ?? null, city: decodedCity, country } : null;
  return {
    title: "vprs",
    tagline: <EdgeBadge edge={edge} />,
    host,
    place: decodedCity,
    origin: hostHeader ? `${proto}://${hostHeader}` : null,
  };
};
export type Props = ReturnType<typeof props>;

export const Page = ({
  title,
  tagline,
  host,
  place,
  origin,
}: {
  title: string;
  tagline: ReactNode;
  host: Host;
  place: string | null;
  origin: string | null;
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
