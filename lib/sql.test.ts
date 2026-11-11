import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadModule, parseSync } from "libpg-query";

// Every ```sql block in content/ must parse with PostgreSQL's own parser
// (libpg-query, PostgreSQL 18). Parsing catches the typos a reader would
// copy: a missing comma, an unbalanced parenthesis, a misspelled keyword. It
// doesn't check that tables or functions exist.
//
// Skipped, visibly in the source:
// - blocks for another engine, named by their tab (```sql tab="BigQuery")
//   or, for a block that isn't one of a set of tabs, by a dialect
//   (```sql dialect="ClickHouse"),
// - blocks marked as partial on purpose (```sql fragment), such as a lone
//   WHERE clause or a single column definition.
//
// Named placeholders (:customer_id, $customer) are how the docs write a
// value the application binds; they're read as $1 before parsing. Casts
// (::text) and dollar quoting ($$ ... $$, $body$ ... $body$) are untouched.

const ROOT = path.join(process.cwd(), "content");

type Block = { line: number; sql: string };

function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? markdownFiles(p) : e.name.endsWith(".md") ? [p] : [];
  });
}

/** PostgreSQL blocks in a Markdown file, with the line each starts on. */
function sqlBlocks(source: string): Block[] {
  const blocks: Block[] = [];
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
      blocks.push({ line: i + 2, sql: body.join("\n") });
    }
    i = end;
  }
  return blocks;
}

/** Named placeholders as positional parameters; line breaks are kept, so positions map back. */
const bindParams = (sql: string) =>
  sql.replace(/(?<![:\w]):[A-Za-z_]\w*/g, "$$1").replace(/\$[A-Za-z_]\w*(?!\w|\$)/g, "$$1");

/** The parser's message, located at a file line. */
function failure(file: string, block: Block): string | null {
  const sql = bindParams(block.sql);
  try {
    parseSync(sql);
    return null;
  } catch (e) {
    const err = e as { message: string; sqlDetails?: { cursorPosition?: number } };
    const pos = err.sqlDetails?.cursorPosition ?? 0;
    const offset = sql.slice(0, pos).split("\n").length - 1;
    const near = block.sql.split("\n")[offset]?.trim() ?? "";
    return `${file}:${block.line + offset}: ${err.message}\n    ${near}`;
  }
}

const files = markdownFiles(ROOT)
  .map((f) => ({
    file: path.relative(process.cwd(), f).replaceAll("\\", "/"),
    blocks: sqlBlocks(fs.readFileSync(f, "utf8")),
  }))
  .filter((f) => f.blocks.length);

describe("SQL in content", () => {
  beforeAll(async () => {
    await loadModule();
  });

  it("finds the blocks it checks", () => {
    expect(files.reduce((n, f) => n + f.blocks.length, 0)).toBeGreaterThan(500);
  });

  it.each(files)("$file parses", ({ file, blocks }) => {
    const failures = blocks.map((b) => failure(file, b)).filter(Boolean);
    const hint =
      'Fix the SQL, or mark the fence: ```sql fragment for a partial on purpose, ```sql dialect="ClickHouse" for another engine.';
    expect(failures, `${failures.join("\n")}\n${hint}`).toEqual([]);
  });
});
