1. Don't assume. Don't hide confusion. Surface tradeoffs.
2. Minimum code that solves the problem. Nothing speculative.
3. Touch only what you must. Clean up only your own mess.
4. Define success criteria. Loop until verified.

There is no authentication, user identity, or database. That layer
(Better Auth, Neon, Drizzle) was intentionally removed; the site is
static content plus stateless API tools. Don't reintroduce auth or a
database without being asked.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Tailwind v4: prefer canonical utilities over typed arbitrary values

Tailwind v4 ships dedicated utilities for many properties that older docs
(and most LLMs) only knew as `[type:value]` arbitraries. The `tailwindcss`
language server flags these as `suggestCanonicalClasses`. Always use the
canonical form:

| Don't write              | Write instead         |
| ------------------------ | --------------------- |
| `bg-[length:8px_8px]`    | `bg-size-[8px_8px]`   |
| `bg-[position:center]`   | `bg-position-[center]` |
| `bg-[image:url(/x.png)]` | `bg-[url(/x.png)]`    |
| `text-[length:14px]`     | `text-[14px]`         |
| `border-[color:#abc]`    | `border-[#abc]`       |

Rule of thumb: if you find yourself typing `[type:` inside a Tailwind
class, stop and check whether v4 has a typed-utility shorthand
(`bg-size-*`, `bg-position-*`, etc.). The bare `[value]` form works when
the type is unambiguous; the `[type:value]` hint is only needed for true
edge cases.

