import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { createTailwindMerge, getDefaultConfig, twMerge } from "tailwind-merge";
import { describe, it, expect } from "vitest";

/*
 * cn() drops a class when a later one overrides it. Within one property
 * (bg-surface then bg-accent) that's the point. Across properties it can
 * change what renders: tailwind-merge counts text-lg as also setting
 * line height, so cn("leading-snug", "text-lg") drops leading-snug, though
 * in the stylesheet leading-snug comes later and would have won.
 *
 * This walks every cn() call in app/ and components/, resolves its
 * arguments (literals, both sides of conditionals, and same-file consts,
 * lookup maps and class helpers), merges every combination, and fails on
 * any class dropped by a different property's class.
 */

const sameGroupOnly = createTailwindMerge(() => ({
  ...getDefaultConfig(),
  conflictingClassGroups: {},
  conflictingClassGroupModifiers: {},
}));

const ROOTS = ["app", "components"];
// Combinations per call before giving up on enumerating them.
const MAX_COMBOS = 512;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.tsx?$/.test(e.name) && !e.name.endsWith(".test.ts") ? [p] : [];
  });
}

type Alternatives = string[] | null; // null: not statically known

function analyze(file: string) {
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // Same-file `const x = ...` initializers, by name.
  const consts = new Map<string, ts.Expression>();
  const collect = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const list = n.parent;
      if (ts.isVariableDeclarationList(list) && list.flags & ts.NodeFlags.Const) consts.set(n.name.text, n.initializer);
    }
    ts.forEachChild(n, collect);
  };
  collect(sf);

  const unwrap = (e: ts.Expression): ts.Expression =>
    ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) ? unwrap(e.expression) : e;

  // Every class string an expression can produce.
  const resolve = (expr: ts.Expression, seen = new Set<string>()): Alternatives => {
    const e = unwrap(expr);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
    if (e.kind === ts.SyntaxKind.FalseKeyword || e.kind === ts.SyntaxKind.NullKeyword) return [""];
    if (ts.isIdentifier(e) && e.text === "undefined") return [""];
    if (ts.isConditionalExpression(e)) return union(resolve(e.whenTrue, seen), resolve(e.whenFalse, seen));
    if (ts.isBinaryExpression(e)) {
      if (e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return union([""], resolve(e.right, seen));
      if (
        e.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
      )
        return union(resolve(e.left, seen), resolve(e.right, seen));
      return null;
    }
    if (ts.isIdentifier(e)) {
      const init = consts.get(e.text);
      if (!init || seen.has(e.text)) return null;
      return resolve(init, new Set(seen).add(e.text));
    }
    // MAP[key] / MAP.key on a same-file object literal: any of its values.
    if (ts.isElementAccessExpression(e) || ts.isPropertyAccessExpression(e)) {
      const target = unwrap(e.expression);
      if (!ts.isIdentifier(target)) return null;
      const init = consts.get(target.text);
      const obj = init && unwrap(init);
      if (!obj || !ts.isObjectLiteralExpression(obj)) return null;
      const name = ts.isPropertyAccessExpression(e) ? e.name.text : null;
      let out: Alternatives = [];
      for (const p of obj.properties) {
        if (!ts.isPropertyAssignment(p)) return null;
        if (name !== null && p.name.getText(sf) !== name) continue;
        out = union(out, resolve(p.initializer, seen));
      }
      return out;
    }
    if (ts.isCallExpression(e)) {
      const callee = e.expression.getText(sf);
      if (callee === "cn") return combos(e.arguments.map((a) => resolve(a, seen)))?.map((c) => twMerge(c)) ?? null;
      // A same-file class helper with an expression body, e.g. rowClass(active).
      const fn = consts.get(callee);
      const f = fn && unwrap(fn);
      if (f && ts.isArrowFunction(f) && !ts.isBlock(f.body)) return resolve(f.body, new Set(seen).add(callee));
      return null;
    }
    return null;
  };

  const issues: string[] = [];
  let checked = 0;
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) && n.expression.getText(sf) === "cn") {
      const line = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
      const all = combos(n.arguments.map((a) => resolve(a)));
      for (const classes of all ?? []) {
        checked++;
        const kept = new Set(twMerge(classes).split(" "));
        const keptBySameGroup = new Set(sameGroupOnly(classes).split(" "));
        const lost = [...keptBySameGroup].filter((c) => c && !kept.has(c));
        if (lost.length) issues.push(`${file}:${line} drops ${lost.join(" ")} from "${classes}"`);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { issues: [...new Set(issues)], checked };
}

function union(a: Alternatives, b: Alternatives): Alternatives {
  return a && b ? [...new Set([...a, ...b])] : null;
}

// Every joined class list the arguments can make. Unknown arguments (a
// caller's className) are left out: the call's own classes still get checked.
function combos(args: Alternatives[]): string[] | null {
  let out = [""];
  for (const alts of args) {
    if (!alts) continue;
    out = out.flatMap((c) => alts.map((a) => `${c} ${a}`.trim()));
    if (out.length > MAX_COMBOS) return null;
  }
  return out.map((c) => c.replace(/\s+/g, " ").trim());
}

describe("cn() call sites", () => {
  const files = ROOTS.flatMap(sourceFiles);
  const results = files.map(analyze);

  it("finds the calls", () => {
    expect(results.reduce((n, r) => n + r.checked, 0)).toBeGreaterThan(100);
  });

  it("never drops a class to one for a different property", () => {
    expect(results.flatMap((r) => r.issues)).toEqual([]);
  });
});
