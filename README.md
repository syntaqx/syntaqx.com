# syntaqx.com

Personal site for [Chase Pierce](https://www.syntaqx.com), built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and deployed on [Vercel](https://vercel.com).

## Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4, `@tailwindcss/typography`
- **Search**: [Pagefind](https://pagefind.app) (built at build time, client-side)
- **Syntax Highlighting**: [Shiki](https://shiki.style) via `@shikijs/rehype`
- **Analytics**: Vercel Analytics, Speed Insights
- **Errors**: [Sentry](https://sentry.io)
- **Rate limiting**: [Upstash Redis](https://upstash.com)
- **Icons**: [Lucide](https://lucide.dev), [Simple Icons](https://simpleicons.org)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Nothing else is required: without Redis, the API's rate limiter sends its headers but never blocks. To run the real limiter (see [Rate Limiting](https://www.syntaqx.com/docs/requests/rate-limiting)), start Redis and its Upstash-compatible REST proxy, then point `.env.local` at it (see [.env.example](.env.example)):

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

```bash
npm run links      # check every URL cited in content/docs and docs/adr
```

[.github/workflows/doc-links.yml](.github/workflows/doc-links.yml) runs the same check every Monday: dead links open (or update) one issue, and a clean run closes it.

## Build

```bash
npm run build
```

This fetches full git history when the checkout is shallow (so each doc's "last updated" date is real), runs the Next.js build, and then generates the Pagefind search index from the output.

## Deploy

Every merge to `main` deploys to production on Vercel, and every pull request gets a preview deployment first ([Continuous Deployment](https://www.syntaqx.com/docs/delivery/ci-pipelines)). There's no release step.

To roll back, use Vercel's instant rollback to the previous production deployment, then revert the commit on `main` so the next deploy doesn't bring it back.

## Decisions

The site follows its own [playbook](https://www.syntaqx.com/docs/playbook). Where it deliberately doesn't, the reason is an [Architecture Decision Record](docs/adr/README.md).

## Project Structure

```sh
app/            → Pages, layouts and the API (App Router)
components/     → React components
content/posts/  → Blog posts (Markdown with TOML frontmatter)
content/docs/   → The playbook, one folder per section (/docs/<section>/<slug>)
content/books/  → Industry books, one folder per book (/books/<book>/<chapter>)
docs/adr/       → Architecture Decision Records
lib/            → Utilities: docs and posts, API helpers, rate limiting, QUERY
proxy.ts        → API headers, rate limiting, HTTP QUERY routing
public/         → Static assets
scripts/        → Build steps and the link checker
compose.yml     → Optional local Redis for the rate limiter
```

## License

MIT
