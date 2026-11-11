import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadModule, parseSync } from "libpg-query";
import { bindParams, markdownFiles, sqlBlocks, type SqlBlock } from "./sql-blocks";

// Every ```sql block in content/ must parse with PostgreSQL's own parser
// (libpg-query, PostgreSQL 18). Parsing catches the typos a reader would
// copy: a missing comma, an unbalanced parenthesis, a misspelled keyword.
// lib/sql-exec.test.ts then runs the blocks against a real database. Which
// blocks count, and how placeholders are read, is in lib/sql-blocks.ts.

/** The parser's message, located at a file line. */
function failure(block: SqlBlock): string | null {
  const sql = bindParams(block.sql);
  try {
    parseSync(sql);
    return null;
  } catch (e) {
    const err = e as { message: string; sqlDetails?: { cursorPosition?: number } };
    const pos = err.sqlDetails?.cursorPosition ?? 0;
    const offset = sql.slice(0, pos).split("\n").length - 1;
    const near = block.sql.split("\n")[offset]?.trim() ?? "";
    return `${block.file}:${block.line + offset}: ${err.message}\n    ${near}`;
  }
}

const files = markdownFiles(path.join(process.cwd(), "content"))
  .map((f) => {
    const file = path.relative(process.cwd(), f).replaceAll("\\", "/");
    return { file, blocks: sqlBlocks(file, fs.readFileSync(f, "utf8")) };
  })
  .filter((f) => f.blocks.length);

describe("SQL in content", () => {
  beforeAll(async () => {
    await loadModule();
  });

  it("finds the blocks it checks", () => {
    expect(files.reduce((n, f) => n + f.blocks.length, 0)).toBeGreaterThan(500);
  });

  it.each(files)("$file parses", ({ blocks }) => {
    const failures = blocks.map(failure).filter(Boolean);
    const hint =
      'Fix the SQL, or mark the fence: ```sql fragment for a partial on purpose, ```sql dialect="ClickHouse" for another engine.';
    expect(failures, `${failures.join("\n")}\n${hint}`).toEqual([]);
  });
});
