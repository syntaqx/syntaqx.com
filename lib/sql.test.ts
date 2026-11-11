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

/** Functions that make a column default rewrite every row. */
const VOLATILE = new Set([
  "uuidv7",
  "uuidv4",
  "gen_random_uuid",
  "random",
  "clock_timestamp",
  "nextval",
]);

const contype = (k: Node) => (k.Constraint as Node).contype as string;
const notValid = (k: Node) => Boolean((k.Constraint as Node).skip_validation);
const name = (n: unknown) => String(((n as Node).String as Node).sval);

/**
 * DDL that fails or blocks on a table that already has rows, the hazards in
 * /docs/database/zero-downtime-migrations#lock-aware-ddl. Tables created
 * earlier on the same page are new and empty, so they're exempt. EXCLUDE has
 * no concurrent form and ALTER COLUMN TYPE is left to a comment in the text.
 */
function migrationHazards(blocks: SqlBlock[]): string[] {
  const created = new Set<string>();
  return blocks.flatMap((block) => {
    const sql = bindParams(block.sql);
    let parsed: Parsed;
    try {
      parsed = parseSync(sql) as Parsed;
    } catch {
      return []; // reported by the parse test
    }
    const bytes = Buffer.from(sql); // statement positions are UTF-8 byte offsets
    return (parsed.stmts ?? []).flatMap((s) => {
      const at = `${block.file}:${
        block.line +
        bytes
          .subarray(0, s.stmt_location ?? 0)
          .toString()
          .split("\n").length -
        1
      }`;
      const create = s.stmt.CreateStmt as Node | undefined;
      if (create) created.add(String((create.relation as Node).relname));
      const index = s.stmt.IndexStmt as Node | undefined;
      if (index) {
        const table = String((index.relation as Node).relname);
        return created.has(table) || index.concurrent
          ? []
          : [`${at}: CREATE INDEX on ${table} without CONCURRENTLY`];
      }
      const alter = s.stmt.AlterTableStmt as Node | undefined;
      if (!alter) return [];
      const table = String((alter.relation as Node).relname);
      if (created.has(table)) return [];
      return ((alter.cmds as Node[]) ?? []).flatMap((c) => {
        const cmd = c.AlterTableCmd as Node;
        const out: string[] = [];
        if (cmd?.subtype === "AT_AddColumn") {
          const column = (cmd.def as Node).ColumnDef as Node;
          const col = `${table}.${String(column.colname)}`;
          const cons = (column.constraints as Node[]) ?? [];
          const kinds = cons.map(contype);
          const filled = kinds.some((k) =>
            ["CONSTR_DEFAULT", "CONSTR_GENERATED", "CONSTR_IDENTITY"].includes(k),
          );
          if (kinds.includes("CONSTR_NOTNULL") && !filled)
            out.push(`${at}: ${col} is NOT NULL with no DEFAULT`);
          if (kinds.includes("CONSTR_CHECK"))
            out.push(`${at}: ${col} has an inline CHECK, which scans the table`);
          if (kinds.includes("CONSTR_UNIQUE") || kinds.includes("CONSTR_PRIMARY"))
            out.push(`${at}: ${col} is UNIQUE or a PRIMARY KEY, built under a lock`);
          for (const k of cons.filter((k) => contype(k) === "CONSTR_DEFAULT")) {
            const fn = (((k.Constraint as Node).raw_expr as Node)?.FuncCall as Node)
              ?.funcname as unknown[];
            if (fn && VOLATILE.has(name(fn.at(-1))))
              out.push(`${at}: ${col} has a volatile DEFAULT, which rewrites the table`);
          }
        }
        if (cmd?.subtype === "AT_AddConstraint") {
          const con = cmd.def as Node;
          const kind = contype(con);
          const label = String((con.Constraint as Node).conname ?? kind);
          if ((kind === "CONSTR_CHECK" || kind === "CONSTR_FOREIGN") && !notValid(con))
            out.push(`${at}: ${table} constraint ${label} without NOT VALID`);
          if (
            (kind === "CONSTR_UNIQUE" || kind === "CONSTR_PRIMARY") &&
            !(con.Constraint as Node).indexname
          )
            out.push(`${at}: ${table} constraint ${label} builds its index under a lock`);
        }
        return out;
      });
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

  it.each(files)("$file has DDL a table with rows accepts without blocking", ({ blocks }) => {
    const hazards = migrationHazards(blocks);
    const hint =
      "On a table that already exists: a NOT NULL column gets a DEFAULT or ADD CONSTRAINT <t>_<c>_not_null NOT NULL <c> NOT VALID; " +
      "a CHECK or FOREIGN KEY is ADD CONSTRAINT ... NOT VALID; an index is CREATE INDEX CONCURRENTLY; a UNIQUE is " +
      "CREATE UNIQUE INDEX CONCURRENTLY then ADD CONSTRAINT ... UNIQUE USING INDEX (/docs/database/zero-downtime-migrations).";
    expect(hazards, `${hazards.join("\n")}\n${hint}`).toEqual([]);
  });
});
