import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { postgis } from "@electric-sql/pglite-postgis";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { ltree } from "@electric-sql/pglite/contrib/ltree";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { loadModule, parseSync } from "libpg-query";
import { bindParams, markdownFiles, sqlBlocks } from "./sql-blocks";

/**
 * Runs the documented PostgreSQL against a real PostgreSQL 18 with PostGIS
 * (PGlite, in process): DDL is executed, queries are PREPAREd, which checks
 * tables, columns, types and functions without running anything.
 *
 * A book is one schema built up chapter by chapter, because its chapters
 * extend one model: tables and their ALTERs first, then indexes, views and
 * the rest, then queries, so a query may use a column a later chapter adds.
 * A docs page or post is a schema of its own, run in reading order.
 *
 * What a page doesn't define can't be checked against it, so:
 * - a REFERENCES to a table defined on another page gets a stub with just
 *   the referenced key, typed like the referencing column,
 * - a table defined later in the same book is created when first needed,
 * - schemas and roles a statement names are created as environment,
 * - a statement over a table from another page, a helper function no page
 *   defines, or an extension PGlite lacks is "unverifiable", not a failure.
 */

type Tree = { [key: string]: unknown };
type Statement = {
  unit: string;
  file: string;
  line: number;
  kind: string;
  tree: Tree;
  text: string;
};
export type Finding = { file: string; line: number; code: string; message: string };
export type SqlCheck = {
  checked: number;
  failures: Finding[];
  unverifiable: Finding[];
  stubs: number;
};

const EXTENSIONS = { postgis, btree_gist, citext, ltree, pg_trgm };
/** SQL that needs PostGIS. */
const GEOSPATIAL = /\bST_\w+\s*\(|\bgeography\b|\bgeometry\b|\bpostgis\b/i;
/** Types that belong to extensions PGlite doesn't ship. */
const MISSING_EXTENSION_TYPES = ["vector", "halfvec", "sparsevec"];

const TABLES = new Set([
  "CreateExtensionStmt",
  "CreateSchemaStmt",
  "CreateEnumStmt",
  "AlterEnumStmt",
  "CreateDomainStmt",
  "CompositeTypeStmt",
  "CreateRangeStmt",
  "CreateSeqStmt",
  "DefineStmt",
  "CreateStmt",
  "AlterTableStmt",
]);
const QUERIES = new Set(["SelectStmt", "InsertStmt", "UpdateStmt", "DeleteStmt", "MergeStmt"]);
/** Not run: transaction control, COPY, EXPLAIN, CALL and session settings change nothing to check. */
const SKIPPED = new Set([
  "TransactionStmt",
  "CopyStmt",
  "ExplainStmt",
  "CallStmt",
  "VariableSetStmt",
  "VariableShowStmt",
  "DeallocateStmt",
  "PrepareStmt",
  "ExecuteStmt",
  "CheckPointStmt",
  "VacuumStmt",
  "LoadStmt",
]);
const phase = (kind: string) => (TABLES.has(kind) ? 0 : QUERIES.has(kind) ? 2 : 1);

const isTree = (v: unknown): v is Tree => typeof v === "object" && v !== null;
const str = (v: unknown) => (isTree(v) && isTree(v.String) ? String(v.String.sval) : "");

/** Every node of a kind in a tree, depth first. */
function nodes(tree: unknown, key: string, out: Tree[] = []): Tree[] {
  if (Array.isArray(tree)) tree.forEach((t) => nodes(t, key, out));
  else if (isTree(tree)) {
    if (isTree(tree[key])) out.push(tree[key] as Tree);
    Object.values(tree).forEach((v) => nodes(v, key, out));
  }
  return out;
}

/** Tables a statement names: in FROM and JOIN (RangeVar), and as its own target (relation). */
const relnames = (tree: Tree) =>
  new Set([...nodes(tree, "RangeVar"), ...nodes(tree, "relation")].map((r) => String(r.relname)));
const createdTable = (s: Statement) =>
  s.kind === "CreateStmt"
    ? String(
        (s.tree.CreateStmt as Tree).relation &&
          ((s.tree.CreateStmt as Tree).relation as Tree).relname,
      )
    : undefined;

/** A column's type as SQL. */
function typeOf(def: Tree | undefined): string {
  const typeName = def?.typeName as Tree | undefined;
  const names = ((typeName?.names as unknown[]) ?? []).map(str).filter((n) => n !== "pg_catalog");
  const type = names.join(".") || "uuid";
  return typeName?.arrayBounds ? `${type}[]` : type;
}

/** Foreign-key targets: the table and the key columns, typed like the referencing columns. */
function foreignKeys(tree: Tree): { table: string; columns: [string, string][] }[] {
  const types = new Map(nodes(tree, "ColumnDef").map((c) => [String(c.colname), typeOf(c)]));
  const out: { table: string; columns: [string, string][] }[] = [];
  const visit = (t: unknown, column?: Tree) => {
    if (Array.isArray(t)) return t.forEach((x) => visit(x, column));
    if (!isTree(t)) return;
    if (isTree(t.ColumnDef)) return visit(t.ColumnDef.constraints, t.ColumnDef);
    const c = t.Constraint;
    if (isTree(c) && c.contype === "CONSTR_FOREIGN") {
      const fk = ((c.fk_attrs as unknown[]) ?? []).map(str);
      const from = fk.length ? fk : column ? [String(column.colname)] : [];
      const pk = ((c.pk_attrs as unknown[]) ?? []).map(str);
      const to = pk.length ? pk : from.map(() => "id");
      const type = (i: number) =>
        column && from.length === 1 ? typeOf(column) : (types.get(from[i]) ?? "uuid");
      out.push({
        table: String((c.pktable as Tree).relname),
        columns: to.map((p, i) => [p, type(i)]),
      });
      return;
    }
    Object.values(t).forEach((v) => visit(v, column));
  };
  visit(tree);
  return out;
}

/** Every statement in content/, grouped by unit (a book, or a page) in reading order. */
function collect(root: string): Map<string, Statement[]> {
  const units = new Map<string, { file: string; order: number; source: string }[]>();
  for (const f of markdownFiles(path.join(root, "content"))) {
    const file = path.relative(root, f).replaceAll("\\", "/");
    const parts = file.split("/");
    const unit = parts[1] === "books" ? parts.slice(0, 3).join("/") : file;
    const source = fs.readFileSync(f, "utf8");
    const order = Number(/^order\s*=\s*(\d+)/m.exec(source)?.[1] ?? 0);
    units.set(unit, [...(units.get(unit) ?? []), { file, order, source }]);
  }
  const out = new Map<string, Statement[]>();
  for (const [unit, files] of units) {
    const statements: Statement[] = [];
    for (const { file, source } of files.sort((a, b) => a.order - b.order)) {
      for (const block of sqlBlocks(file, source)) {
        const sql = bindParams(block.sql);
        let parsed: { stmts?: { stmt: Tree; stmt_location?: number; stmt_len?: number }[] };
        try {
          parsed = parseSync(sql) as typeof parsed;
        } catch {
          continue; // lib/sql.test.ts reports it
        }
        const bytes = Buffer.from(sql); // statement positions are UTF-8 byte offsets
        for (const s of parsed.stmts ?? []) {
          const at = s.stmt_location ?? 0;
          const kind = Object.keys(s.stmt)[0];
          if (SKIPPED.has(kind)) continue;
          statements.push({
            unit,
            file,
            line: block.line + bytes.subarray(0, at).toString().split("\n").length - 1,
            kind,
            tree: s.stmt,
            text: bytes.subarray(at, s.stmt_len ? at + s.stmt_len : bytes.length).toString(),
          });
        }
      }
    }
    if (statements.length) out.set(unit, statements);
  }
  return out;
}

class Unverifiable extends Error {}

export async function checkSql(root = process.cwd()): Promise<SqlCheck> {
  await loadModule();
  const units = collect(root);
  const definedFunctions = new Set(
    [...units.values()]
      .flat()
      .flatMap((s) =>
        nodes(s.tree, "CreateFunctionStmt").map((f) => (f.funcname as unknown[]).map(str).at(-1)),
      ),
  );

  const pg = new PGlite({ extensions: EXTENSIONS });
  for (const name of Object.keys(EXTENSIONS).filter((e) => e !== "postgis"))
    await pg.exec(`CREATE EXTENSION IF NOT EXISTS ${name}`);
  const builtin = async (fn: string) =>
    (await pg.query("SELECT 1 FROM pg_proc WHERE proname = $1", [fn])).rows.length > 0;

  const result: SqlCheck = { checked: 0, failures: [], unverifiable: [], stubs: 0 };
  let n = 0;
  let postgisReady = false;

  for (const [unit, statements] of units) {
    // PostGIS takes seconds to create and a few pages use it, so it waits for the first.
    if (!postgisReady && statements.some((s) => GEOSPATIAL.test(s.text))) {
      await pg.exec("CREATE EXTENSION IF NOT EXISTS postgis");
      postgisReady = true;
    }
    // Each unit gets a fresh schema; the database is thrown away at the end, so none is dropped.
    const schema = `unit_${n++}`;
    await pg.exec(`CREATE SCHEMA ${schema}; SET search_path = ${schema}, public;`);
    const isBook = unit.startsWith("content/books/");
    const ordered = isBook
      ? [...statements].sort((a, b) => phase(a.kind) - phase(b.kind))
      : statements;
    const definitions = new Map(
      statements.filter((s) => createdTable(s)).map((s) => [createdTable(s)!, s]),
    );
    const done = new Set<Statement>();
    const created = new Set<string>(); // tables a statement of this unit created
    const stubs = new Set<string>(); // stand-ins for tables defined on other pages
    const outside = new Set<string>(); // tables this unit uses but can't build

    const run = async (s: Statement, depth = 0): Promise<void> => {
      done.add(s);
      // One round trip per query; the newline keeps a trailing comment from eating the semicolon.
      const sql = QUERIES.has(s.kind)
        ? `PREPARE checked AS ${s.text}\n;\nDEALLOCATE checked`
        : s.text;
      for (let attempt = 0; attempt < 16; attempt++) {
        try {
          await pg.exec(sql);
          const table = createdTable(s);
          if (table) created.add(table);
          return;
        } catch (e) {
          if (QUERIES.has(s.kind)) await pg.exec("DEALLOCATE ALL");
          const err = e as { code?: string; message: string };
          const name = /"([^"]+)"/.exec(err.message)?.[1] ?? "";
          const uses = relnames(s.tree);
          if (err.code === "42P18") return; // a placeholder's type can't be inferred out of context
          if (err.code === "42710" && /^Create(Extension|Role)Stmt$/.test(s.kind)) return;
          if (err.code === "3F000") {
            await pg.exec(`CREATE SCHEMA "${name}"`);
            continue;
          }
          if (err.code === "42704" && /^role /.test(err.message)) {
            await pg.exec(`CREATE ROLE "${name}"`);
            continue;
          }
          if (
            err.code === "42P07" &&
            s.kind === "CreateStmt" &&
            (stubs.has(name) || created.has(name))
          ) {
            await pg.exec(`DROP TABLE "${name}" CASCADE`); // the real definition, or a chapter redefining it
            stubs.delete(name);
            created.delete(name);
            continue;
          }
          if (err.code === "42P01") {
            // A table another chapter defines, or one above this statement on its page (when
            // this statement is itself being built early). Below it on the same page is a
            // real error: a reader runs a page top to bottom.
            const later = definitions.get(name);
            const above = later && (later.file !== s.file || later.line < s.line);
            if (later && above && !done.has(later) && depth < 8) {
              await check(later, depth + 1); // a failure is reported where it's written
              if (created.has(name)) continue;
            }
            const key = foreignKeys(s.tree).find((k) => k.table === name);
            if (key && !created.has(name) && !definitions.has(name)) {
              const columns = key.columns.map(([c, t]) => `"${c}" ${t}`).join(", ");
              const pk = key.columns.map(([c]) => `"${c}"`).join(", ");
              await pg.exec(`CREATE TABLE "${name}" (${columns}, PRIMARY KEY (${pk}))`);
              stubs.add(name);
              result.stubs++;
              continue;
            }
            if (!definitions.has(name) || outside.has(name)) throw new Unverifiable(err.message);
          }
          if (err.code === "0A000" && /extension/.test(err.message))
            throw new Unverifiable(err.message);
          if (err.code === "42704" && MISSING_EXTENSION_TYPES.includes(name))
            throw new Unverifiable(err.message);
          const fn = /^function ([\w.]+)\(/.exec(err.message)?.[1]?.split(".").at(-1);
          if (err.code === "42883" && fn && !definedFunctions.has(fn) && !(await builtin(fn)))
            throw new Unverifiable(err.message);
          if ([...uses].some((t) => stubs.has(t) || outside.has(t)))
            throw new Unverifiable(err.message);
          throw e;
        }
      }
    };

    /** Runs a statement and records the outcome against the line it's written on. */
    async function check(s: Statement, depth = 0) {
      result.checked++;
      try {
        await run(s, depth);
      } catch (e) {
        const err = e as { code?: string; message: string };
        const table = createdTable(s);
        if (table) outside.add(table); // what uses it can't be checked either
        const finding = { file: s.file, line: s.line, code: err.code ?? "", message: err.message };
        (e instanceof Unverifiable ? result.unverifiable : result.failures).push(finding);
      }
    }

    for (const s of ordered) if (!done.has(s)) await check(s);
  }
  await pg.close();
  return result;
}
