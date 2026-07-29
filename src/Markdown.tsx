import type { ReactNode } from "react";
import styles from "./styles.module.css";

// Zero-dependency server renderer; covers only what the guides in src/content use.

const inline = (text: string): ReactNode[] => {
  const out: ReactNode[] = [];
  const re = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] != null) out.push(<code key={k++}>{m[1]}</code>);
    else if (m[2] != null)
      out.push(
        <a key={k++} href={m[3]} target="_blank" rel="noopener noreferrer">
          {m[2]}
        </a>,
      );
    else out.push(<strong key={k++}>{m[4]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

export const Markdown = ({ text }: { text: string }) => {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let k = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith("```")) {
      const code: string[] = [];
      while (++i < lines.length && !lines[i].startsWith("```")) code.push(lines[i]);
      out.push(
        <pre key={k++} className={styles.block}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
    } else if (line.startsWith("|")) {
      const rows: string[][] = [];
      let j = i;
      for (; j < lines.length && lines[j].startsWith("|"); j++) {
        if (/^\|[\s:-]+\|/.test(lines[j]) && /-/.test(lines[j])) continue;
        rows.push(lines[j].split("|").slice(1, -1).map((c) => c.trim()));
      }
      i = j - 1;
      const [head, ...body] = rows;
      out.push(
        <table key={k++} className={styles.table}>
          <thead>
            <tr>{head.map((c, n) => <th key={n}>{inline(c)}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, n) => (
              <tr key={n}>{r.map((c, m2) => <td key={m2}>{inline(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      );
    } else if (/^#{1,3} /.test(line)) {
      const level = line.indexOf(" ");
      const text2 = line.slice(level + 1);
      out.push(
        level === 1 ? (
          <h1 key={k++} className={styles.docTitle}>{inline(text2)}</h1>
        ) : (
          <h2 key={k++} className={styles.docHeading}>{inline(text2)}</h2>
        ),
      );
    } else if (line.startsWith("- ")) {
      // Wrapped items absorb continuation lines, else a multi-line bullet
      // splits the list.
      const items: string[] = [line.slice(2)];
      while (i + 1 < lines.length) {
        const next = lines[i + 1];
        if (next.startsWith("- ")) items.push(lines[++i].slice(2));
        else if (next.trim() && !/^(#|```|\|)/.test(next))
          items[items.length - 1] += " " + lines[++i].trim();
        else break;
      }
      out.push(
        <ul key={k++} className={styles.docList}>
          {items.map((it, n) => <li key={n}>{inline(it)}</li>)}
        </ul>,
      );
    } else {
      const para: string[] = [line];
      while (
        i + 1 < lines.length &&
        lines[i + 1].trim() &&
        !/^(#|```|\||- )/.test(lines[i + 1])
      )
        para.push(lines[++i]);
      out.push(
        <p key={k++} className={styles.prose}>{inline(para.join(" "))}</p>,
      );
    }
  }
  return <>{out}</>;
};
