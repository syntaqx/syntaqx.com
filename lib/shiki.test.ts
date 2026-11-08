import { describe, it, expect } from "vitest";
import { codeToHtml } from "shiki";
import { CODE_BACKGROUNDS, shikiOptions } from "@/lib/shiki";

const rgb = (h: string) => {
  const s = h.replace("#", "");
  const n = s.length <= 4 ? [...s].map((c) => c + c).join("") : s;
  return [0, 2, 4, 6].map((i) => (i < n.length ? parseInt(n.slice(i, i + 2), 16) : 255));
};
const lum = (c: number[]) =>
  c
    .slice(0, 3)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
/** WCAG contrast of a (possibly translucent) color over a background. */
const contrast = (fg: string, bg: string) => {
  const [f, b] = [rgb(fg), rgb(bg)];
  const k = f[3] / 255;
  const solid = [0, 1, 2].map((i) => f[i] * k + b[i] * (1 - k));
  const [x, y] = [lum(solid), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// Code in the languages the site's examples use, touching comments, strings,
// punctuation, keywords, types and markup.
const SAMPLES: [string, string][] = [
  [
    "ts",
    `// a comment\nconst x: Record<string, number> = { "a": 1, b: [2, 3] }; /* block */\nexport async function f(a?: string) { return \`t \${a}\` ?? null; }`,
  ],
  [
    "go",
    `// Package x\npackage x\n\nimport "fmt"\n\nfunc F(s string) (int, error) { return fmt.Println(s, 1.5, true) }`,
  ],
  [
    "rust",
    `/// Doc\nfn f<'a>(s: &'a str) -> Result<u8, String> { let v = vec![1u8]; Ok(v[0]) } // end`,
  ],
  ["json", `{ "id": "x", "n": 1, "ok": true, "none": null, "list": [1, 2] }`],
  ["bash", `# comment\nexport A="b" && curl -s https://x | jq '.a' > out.txt`],
  ["sql", `-- comment\nSELECT id, COUNT(*) FROM t WHERE a = 'x' AND b > 2 GROUP BY id;`],
  ["yaml", `# comment\non: { push: { branches: [main] } }\nkey: "value" # trailing`],
  ["md", `# Title\n\n- **bold** and _em_ with \`code\` and [link](https://x)`],
  ["diff", `- removed line\n+ added line\n  context`],
  ["html", `<!-- c --><a href="/x" class="y">text</a>`],
];

describe("code token contrast", () => {
  it.each(SAMPLES)("%s meets 4.5:1 in both themes on every code background", async (lang, code) => {
    const html = await codeToHtml(code, { lang, ...shikiOptions });
    const failures: string[] = [];
    for (const theme of ["dark", "light"] as const) {
      const colors = new Set(
        [...html.matchAll(new RegExp(`--shiki-${theme}:(#[0-9a-fA-F]{3,8})`, "g"))].map(
          (m) => m[1],
        ),
      );
      for (const c of colors)
        for (const bg of CODE_BACKGROUNDS[theme]) {
          const r = contrast(c, bg);
          if (r < 4.5) failures.push(`${theme} ${c} on ${bg}: ${r.toFixed(2)}`);
        }
    }
    expect(failures).toEqual([]);
  });
});
