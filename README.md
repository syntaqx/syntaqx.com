# syntaqx.com

Personal site for [Chase Pierce](https://www.syntaqx.com), built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and deployed on [Vercel](https://vercel.com).

## Stack

- **Framework**: Next.js 16 (App Router, static export)
- **Styling**: Tailwind CSS v4, `@tailwindcss/typography`
- **Search**: [Pagefind](https://pagefind.app) (built at build time, client-side)
- **Syntax Highlighting**: [Shiki](https://shiki.style) via `@shikijs/rehype`
- **Analytics**: Vercel Analytics
- **Icons**: [Lucide](https://lucide.dev), [Simple Icons](https://simpleicons.org)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Nothing else is required: without Redis, the API's rate limiter sends its headers but never blocks. To run the real limiter ([ADR 0011](docs/adr/0011-rate-limiting-in-upstash-redis.md)), start Redis and its Upstash-compatible REST proxy, then point `.env.local` at it (see [.env.example](.env.example)):

```bash
docker compose up -d
```

```bash
UPSTASH_REDIS_REST_URL=http://localhost:8079
UPSTASH_REDIS_REST_TOKEN=local_dev_token
```

The Redis integration tests in `lib/ratelimit.test.ts` run whenever this stack is up, and always in CI.

## Test

```bash
npm test           # unit, integration and docs checks (Vitest)
npm run lint
npm run typecheck
```

CI runs all three in parallel on every pull request; see [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Build

```bash
npm run build
```

This runs the Next.js build and then generates the Pagefind search index from the static output.

## Decisions

Why the site is built the way it is lives in [Architecture Decision Records](docs/adr/README.md).

## Project Structure

```sh
app/            → Pages, layouts and the API (App Router)
components/     → React components
content/posts/  → Blog posts (Markdown with TOML frontmatter)
content/docs/   → The playbook, one folder per section (/docs/<section>/<slug>)
docs/adr/       → Architecture Decision Records
lib/            → Utilities: docs and posts, API helpers, rate limiting, QUERY
proxy.ts        → API headers, rate limiting, HTTP QUERY routing
public/         → Static assets
compose.yml     → Optional local Redis for the rate limiter
```

## License

MIT
