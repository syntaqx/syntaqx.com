# 0012. Docs grouped into section folders, with the section in the URL

Status: Accepted (2026-10-22)

## Context

The playbook grew to 44 docs in one flat `content/docs/` folder, each at `/docs/<slug>`. The category lived only in frontmatter, so neither the file tree nor the URL said where a doc belonged, and slugs carried their own prefixes to stay unique (`database-naming-conventions`, `api-design-principles`).

## Decision

- Each section is a folder, and the folder is part of the URL: `content/docs/payments/idempotency.md` is `/docs/payments/idempotency`. The Playbook overview stays at the root, `/docs/playbook`.
- Sections: `fundamentals`, `api-design`, `requests`, `operations`, `payments`, `architecture`, `database`, `delivery`, `engineering`.
- Slugs drop prefixes the folder now supplies: `api-design/principles`, `api-design/authentication`, `database/naming-conventions`.
- Every former URL is listed in the doc's `aliases` frontmatter and permanently redirects (`308`) from `next.config.ts`, before any page renders. A page-level redirect would stream as a `200` with a meta refresh, because the site has a root loading boundary.
- A bare section URL like `/docs/payments` redirects to that section on the docs index (`/docs#payments`).

## Consequences

- The URL tells readers and search engines where a doc sits, and the file tree matches the site.
- Links in ADRs, the README and other sites keep working through the redirects. `lib/docs.test.ts` checks that every alias redirects to a doc that exists, that aliases never shadow a real doc, that each folder holds one category, and that absolute links in the ADRs and README resolve.
- Moving a doc between sections is a file move plus an alias, not a broken link.
