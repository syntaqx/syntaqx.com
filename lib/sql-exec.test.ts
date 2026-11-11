import { beforeAll, describe, expect, it } from "vitest";
import { checkSql, type SqlCheck } from "./sql-check";

// Every documented PostgreSQL statement runs against PostgreSQL 18 with
// PostGIS (PGlite, in process): DDL executes, queries are PREPAREd. This
// catches what parsing can't: a column a query names that the table doesn't
// have, a foreign key to a key that doesn't exist or has another type, a
// reserved word, an ambiguous placeholder. How books, pages and cross-page
// references are handled is in lib/sql-check.ts.

let result: SqlCheck;

describe("documented SQL against PostgreSQL", () => {
  beforeAll(async () => {
    result = await checkSql();
  }, 180_000);

  it("checks the statements", () => {
    expect(result.checked).toBeGreaterThan(4000);
  });

  it("runs every statement it can check", () => {
    const lines = result.failures.map((f) => `${f.file}:${f.line}: [${f.code}] ${f.message}`);
    const hint =
      "Fix the SQL so it runs in order on its page (a book builds on earlier chapters). " +
      'A partial on purpose is ```sql fragment; another engine is ```sql dialect="...".';
    expect(result.failures, `${lines.join("\n")}\n${hint}`).toEqual([]);
  });

  // Statements over tables other pages own can't be checked; if their share
  // grows, a harness change has started hiding things it should check.
  it("leaves only a small share unverifiable", () => {
    expect(result.unverifiable.length / result.checked).toBeLessThan(0.05);
  });
});
