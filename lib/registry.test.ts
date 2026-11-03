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

const packageName = (spec: string) =>
  spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];

describe("registry.json", () => {
  const names = new Set(registry.items.map((i) => i.name));
  const listed = new Set(registry.items.flatMap((i) => i.files.map((f) => f.path)));

  it("lists every file under registry/", () => {
    expect(walk("registry").filter((f) => !listed.has(f))).toEqual([]);
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
