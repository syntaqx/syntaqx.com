# syntaqx.com

Personal site for [Chase Pierce](https://syntaqx.com) — built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and deployed on [Vercel](https://vercel.com).

## Stack

- **Framework** — Next.js 16 (App Router, static export)
- **Styling** — Tailwind CSS v4, `@tailwindcss/typography`
- **Search** — [Pagefind](https://pagefind.app) (built at build time, client-side)
- **Syntax Highlighting** — [Shiki](https://shiki.style) via `@shikijs/rehype`
- **Analytics** — Vercel Analytics
- **Icons** — [Lucide](https://lucide.dev), [Simple Icons](https://simpleicons.org)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

This runs the Next.js build and then generates the Pagefind search index from the static output.

## Project Structure

```
app/            → Pages and layouts (App Router)
components/     → React components
content/posts/  → Blog posts (Markdown with TOML frontmatter)
lib/            → Utilities (post parsing, constants)
public/         → Static assets
```

## License

MIT
