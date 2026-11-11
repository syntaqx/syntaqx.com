import fs from "node:fs";
import path from "node:path";

/**
 * The PostgreSQL in content/: every ```sql block, minus the ones marked as
 * another engine (```sql tab="BigQuery", ```sql dialect="ClickHouse") or as a
 * partial on purpose (```sql fragment). Shared by the parse and execute tests.
 */

export type SqlBlock = { file: string; line: number; sql: string };

export function markdownFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? markdownFiles(p) : e.name.endsWith(".md") ? [p] : [];
    })
    .sort();
}

/** PostgreSQL blocks in a Markdown file, with the line each starts on. */
export function sqlBlocks(file: string, source: string): SqlBlock[] {
  const blocks: SqlBlock[] = [];
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\s*)```sql\b(.*)$/.exec(lines[i]);
    if (!open) continue;
    const [, indent, meta] = open;
    const end = lines.findIndex((l, j) => j > i && l.trimEnd() === `${indent}\`\`\``);
    if (end < 0) break;
    const engine = /\b(?:tab|dialect)="([^"]+)"/.exec(meta)?.[1];
    const skip = /\bfragment\b/.test(meta) || (engine !== undefined && !/postgres/i.test(engine));
    if (!skip) {
      const body = lines
        .slice(i + 1, end)
        .map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l));
      blocks.push({ file, line: i + 2, sql: body.join("\n") });
    }
    i = end;
  }
  return blocks;
}

/**
 * Named placeholders (:customer_id, $customer) are how the docs write a value
 * the application binds. Each name becomes its own positional parameter,
 * numbered after any $1, $2 already in the block, so the parser and a
 * PREPARE see what a driver would. Casts (::text) and dollar quoting
 * ($$ ... $$, $body$ ... $body$) are untouched; line breaks are kept.
 */
export function bindParams(sql: string): string {
  const taken = Math.max(0, ...[...sql.matchAll(/\$(\d+)/g)].map((m) => Number(m[1])));
  const names = new Map<string, number>();
  const id = (n: string) => {
    if (!names.has(n)) names.set(n, taken + names.size + 1);
    return `$${names.get(n)}`;
  };
  return sql
    .replace(/(?<![:\w]):([A-Za-z_]\w*)/g, (_, n: string) => id(n))
    .replace(/\$([A-Za-z_]\w*)(?!\w|\$)/g, (_, n: string) => id(n));
}
