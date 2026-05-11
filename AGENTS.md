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
