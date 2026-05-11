1. Don't assume. Don't hide confusion. Surface tradeoffs.
2. Minimum code that solves the problem. Nothing speculative.
3. Touch only what you must. Clean up only your own mess.
4. Define success criteria. Loop until verified.

Before changing anything under `app/api/auth/`, `app/login/`,
`components/auth/`, or any code dealing with sessions, cookies, or PATs,
read [docs/architecture/auth.md](docs/architecture/auth.md). The
decisions there are deliberate and prior context should not be
relitigated without cause.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
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

