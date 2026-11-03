import { createRequire } from "node:module";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwind from "eslint-plugin-better-tailwindcss";

const require = createRequire(import.meta.url);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-plugin-react's version "detect" calls context.getFilename(),
  // which ESLint 10 removed. An explicit version skips detection.
  {
    settings: {
      react: { version: require("react/package.json").version },
    },
  },
  // Tailwind's canonical form (max-h-240, not max-h-[60rem]); the same check
  // the editor shows as suggestCanonicalClasses, failing here instead.
  {
    plugins: { "better-tailwindcss": betterTailwind },
    settings: {
      "better-tailwindcss": { entryPoint: "app/globals.css" },
    },
    rules: {
      "better-tailwindcss/enforce-canonical-classes": [
        "error",
        { collapse: false, rootFontSize: 16 },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored static assets — not our code.
    "public/**",
    // Agent worktrees: separate checkouts with their own lint runs.
    ".claude/**",
  ]),
]);

export default eslintConfig;
