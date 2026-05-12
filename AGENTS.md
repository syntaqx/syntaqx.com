1. Don't assume. Don't hide confusion. Surface tradeoffs.
2. Minimum code that solves the problem. Nothing speculative.
3. Touch only what you must. Clean up only your own mess.
4. Define success criteria. Loop until verified.

Before changing anything under `app/api/auth/`, `app/login/`,
`components/auth/`, or any code dealing with sessions, cookies, or PATs,
read [docs/architecture/auth.md](docs/architecture/auth.md). The
decisions there are deliberate and prior context should not be
relitigated without cause.

# Database schema changes

The `build` script runs `npm run db:migrate` before `next build`, so
every deploy (Vercel preview or prod) applies pending migrations
automatically. The contract this depends on:

1. Edit [`lib/db/schema.ts`](lib/db/schema.ts).
2. Run `npm run db:generate` (writes `lib/db/migrations/NNNN_*.sql`
   and updates `meta/_journal.json`).
3. **Commit both the SQL file and the journal update in the same PR
   as the schema edit.** Without the SQL file, the deploy migrates
   nothing; the app then runs against a stale schema and breaks at
   runtime, not at build time.
4. Never edit a migration file after it has merged. Write a new one.
5. `npm run db:push` is for local prototyping only. It bypasses the
   migration history. Don't run it against any deployed environment
   and don't commit changes that only work because you pushed.

There is no separate "production migration" step. Push to main, the
build migrates, the build deploys. If a migration fails, the deploy
fails — which is the right behavior.

See [docs/architecture/auth.md → Migrations](docs/architecture/auth.md#migrations).

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

