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

type Node = { [key: string]: unknown };
type Parsed = { stmts?: { stmt: Node; stmt_location?: number }[] };

/**
 * Columns an ALTER adds as NOT NULL with nothing to fill existing rows: on a
 * table that has rows, the ALTER fails. A column with a natural value gets a
 * DEFAULT; one that needs a backfill is added nullable with
 * ADD CONSTRAINT <table>_<column>_not_null NOT NULL <column> NOT VALID
 * (/docs/database/zero-downtime-migrations#lock-aware-ddl).
 */
function unsafeColumns(block: SqlBlock): string[] {
  const sql = bindParams(block.sql);
  let parsed: Parsed;
  try {
    parsed = parseSync(sql) as Parsed;
  } catch {
    return []; // reported by the parse test
  }
  const bytes = Buffer.from(sql); // statement positions are UTF-8 byte offsets
  return (parsed.stmts ?? []).flatMap((s) => {
    const alter = s.stmt.AlterTableStmt as Node | undefined;
    if (!alter) return [];
    const line =
      block.line +
      bytes
        .subarray(0, s.stmt_location ?? 0)
        .toString()
        .split("\n").length -
      1;
    const table = (alter.relation as Node).relname;
    return ((alter.cmds as Node[]) ?? []).flatMap((c) => {
      const cmd = c.AlterTableCmd as Node;
      if (cmd?.subtype !== "AT_AddColumn") return [];
      const column = (cmd.def as Node).ColumnDef as Node;
      const kinds = ((column.constraints as Node[]) ?? []).map(
        (k) => (k.Constraint as Node).contype,
      );
      const required = kinds.includes("CONSTR_NOTNULL") || kinds.includes("CONSTR_PRIMARY");
      const filled = kinds.some(
        (k) => k === "CONSTR_DEFAULT" || k === "CONSTR_GENERATED" || k === "CONSTR_IDENTITY",
      );
      return required && !filled
        ? [`${block.file}:${line}: ${table}.${column.colname} is NOT NULL with no DEFAULT`]
        : [];
    });
  });
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

  it.each(files)("$file adds columns a table with rows accepts", ({ blocks }) => {
    const unsafe = blocks.flatMap(unsafeColumns);
    const hint =
      "Give the column a DEFAULT if one is true for existing rows; otherwise add it nullable with " +
      "ADD CONSTRAINT <table>_<column>_not_null NOT NULL <column> NOT VALID, validated after the backfill.";
    expect(unsafe, `${unsafe.join("\n")}\n${hint}`).toEqual([]);
  });
});
