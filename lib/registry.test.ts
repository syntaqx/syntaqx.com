import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, it, expect } from "vitest";
import { patterns } from "./ui";

/*
 * Components in registry.json install into other people's shadcn apps, so
 * they may lean only on what every such app has: React, the npm packages
 * the item declares, `cn` from @/lib/utils, and other registry items it
 * declares. They style themselves with shadcn's tokens alone, so the
 * installing app's theme decides how they look, the way this site's does.
 */

interface Item {
  name: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: { path: string }[];
}

const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: Item[] };
const ITEM_URL = /^https:\/\/www\.syntaqx\.com\/r\/([a-z0-9-]+)\.json$/;

// This site's own tokens, and Tailwind's palette: neither exists, or means
// the same thing, in someone else's theme.
const SITE_TOKENS = ["subtle", "border-hover", "pink", "jwt-purple", "jwt-cyan", "mauve"];
const COLOR_UTILITY =
  "(?:bg|text|border(?:-[trblxy])?|ring|outline|fill|stroke|decoration|divide|from|via|to|shadow|caret|placeholder|accent)";
const PALETTE =
  "(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}";
const OFF_THEME = new RegExp(
  `(?:^|:)${COLOR_UTILITY}-(?:${SITE_TOKENS.join("|")}|${PALETTE}|\\[#[^\\]]*\\])(?:/\\d+)?$`,
);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name).replaceAll("\\", "/")],
  );
}

function parse(path: string) {
  return ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function imports(sf: ts.SourceFile): string[] {
  return sf.statements.flatMap((s) =>
    (ts.isImportDeclaration(s) || ts.isExportDeclaration(s)) &&
    s.moduleSpecifier &&
    ts.isStringLiteral(s.moduleSpecifier)
      ? [s.moduleSpecifier.text]
      : [],
  );
}

function classTokens(sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      out.push(...n.text.split(/\s+/).filter(Boolean));
    }
    n.forEachChild(visit);
  };
  visit(sf);
  return out;
}

function exportsOf(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  for (const s of sf.statements) {
    if (ts.isExportDeclaration(s) && s.exportClause && ts.isNamedExports(s.exportClause)) {
      for (const e of s.exportClause.elements) names.add(e.name.text);
    }
    const mods = ts.canHaveModifiers(s) ? ts.getModifiers(s) : undefined;
    if (!mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if ((ts.isFunctionDeclaration(s) || ts.isInterfaceDeclaration(s)) && s.name) {
      names.add(s.name.text);
    }
    if (ts.isVariableStatement(s)) {
      for (const d of s.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) names.add(d.name.text);
      }
    }
  }
  return names;
}

/** Every cva() call's variant options, as "group.option". */
function variantsOf(sf: ts.SourceFile): Set<string> {
  const out = new Set<string>();
  const visit = (n: ts.Node) => {
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      n.expression.text === "cva" &&
      n.arguments[1] &&
      ts.isObjectLiteralExpression(n.arguments[1])
    ) {
      const variants = n.arguments[1].properties.find(
        (p): p is ts.PropertyAssignment =>
          ts.isPropertyAssignment(p) && p.name.getText(sf) === "variants",
      );
      if (variants && ts.isObjectLiteralExpression(variants.initializer)) {
        for (const group of variants.initializer.properties) {
          if (!ts.isPropertyAssignment(group) || !ts.isObjectLiteralExpression(group.initializer))
            continue;
          for (const option of group.initializer.properties) {
            if (option.name) {
              out.add(`${group.name.getText(sf)}.${option.name.getText(sf).replace(/"/g, "")}`);
            }
          }
        }
      }
    }
    n.forEachChild(visit);
  };
  visit(sf);
  return out;
}

/** Every data-slot="..." the components put on their elements. */
function slotsOf(sf: ts.SourceFile): Set<string> {
  const out = new Set<string>();
  const visit = (n: ts.Node) => {
    if (
      ts.isJsxAttribute(n) &&
      n.name.getText(sf) === "data-slot" &&
      n.initializer &&
      ts.isStringLiteral(n.initializer)
    ) {
      out.add(n.initializer.text);
    }
    n.forEachChild(visit);
  };
  visit(sf);
  return out;
}

const missing = (upstream: Set<string>, ours: Set<string>) =>
  [...upstream].filter((x) => !ours.has(x));

/*
 * Forks of shadcn components install over the originals, so an app's
 * existing code has to keep working: every export, every variant option and
 * every data-slot (apps style through them) that shadcn's version has.
 * registry-upstream/ holds shadcn's source, from `npm run registry:upstream`.
 */
describe("forks of shadcn components are drop-in replacements", () => {
  const forks = existsSync("registry-upstream")
    ? readdirSync("registry-upstream").map((f) => f.replace(/\.tsx$/, ""))
    : [];

  it("has upstream snapshots to compare against", () => {
    expect(forks.length).toBeGreaterThan(0);
  });

  for (const name of forks) {
    const item = registry.items.find((i) => i.name === name);
    if (!item) continue;
    const upstream = parse(`registry-upstream/${name}.tsx`);
    const ours = parse(item.files[0].path);

    it(`${name} keeps shadcn's exports`, () => {
      expect(missing(exportsOf(upstream), exportsOf(ours))).toEqual([]);
    });
    it(`${name} keeps shadcn's variants`, () => {
      expect(missing(variantsOf(upstream), variantsOf(ours))).toEqual([]);
    });
    it(`${name} keeps shadcn's data-slots`, () => {
      expect(missing(slotsOf(upstream), slotsOf(ours))).toEqual([]);
    });
  }
});

const packageName = (spec: string) =>
  spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];

describe("registry.json", () => {
  const names = new Set(registry.items.map((i) => i.name));
  const listed = new Set(registry.items.flatMap((i) => i.files.map((f) => f.path)));

  it("lists every file under registry/", () => {
    expect(walk("registry").filter((f) => !listed.has(f))).toEqual([]);
  });

  it("has an example for every item, for its /ui/components page", () => {
    const files = readdirSync("app/ui/components/_examples");
    const index = readFileSync("app/ui/components/_examples/index.ts", "utf8");
    const without = registry.items.filter(
      (i) =>
        !files.some((f) => f.startsWith(`${i.name}-`)) ||
        !new RegExp(`^\\s*"?${i.name}"?: \\[`, "m").test(index),
    );
    expect(without.map((i) => i.name)).toEqual([]);
  });

  it("has every item a /ui page names", () => {
    const named = patterns.flatMap((p) => p.components ?? []);
    expect(named.filter((n) => !names.has(n))).toEqual([]);
  });

  for (const item of registry.items) {
    describe(item.name, () => {
      const deps = new Set(item.dependencies ?? []);
      const regDeps = new Set(
        (item.registryDependencies ?? []).map((d) => ITEM_URL.exec(d)?.[1] ?? d),
      );

      it("depends only on items in this registry", () => {
        expect([...regDeps].filter((d) => !names.has(d))).toEqual([]);
      });

      for (const { path } of item.files) {
        it(`${path} exists`, () => expect(existsSync(path)).toBe(true));
        if (!existsSync(path)) continue;
        const sf = parse(path);

        it(`${path} imports only what it declares`, () => {
          const stray = imports(sf).filter((spec) => {
            if (spec === "react" || spec.startsWith("react/") || spec === "@/lib/utils") {
              return false;
            }
            const own = /^@\/registry\/syntaqx\/[a-z]+\/([a-z0-9-]+)$/.exec(spec);
            if (own) return !regDeps.has(own[1]) && own[1] !== item.name;
            return spec.startsWith("@/") || !deps.has(packageName(spec));
          });
          expect(stray).toEqual([]);
        });

        it(`${path} colors itself with shadcn tokens only`, () => {
          expect(classTokens(sf).filter((t) => OFF_THEME.test(t))).toEqual([]);
        });
      }
    });
  }
});
