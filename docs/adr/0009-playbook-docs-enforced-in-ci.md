# 0009. Playbook docs as Markdown, checked in CI

Status: Accepted (2026-10-22)

## Context

The [playbook](https://www.syntaqx.com/docs/playbook) grew from a dozen API conventions to over forty docs in a day, written by several people and agents. Its value is consistency, and consistency rots without checks: a doc without sources, an em-dash that slips in, a link to a renamed slug, a description too long for search results. Review alone doesn't catch these reliably.

## Decision

- Playbook docs are Markdown files with TOML frontmatter in `content/docs/`, rendered by `app/docs/`. No CMS: they're versioned, reviewed and deployed with the code.
- Every doc ends with a `## References` section citing its specifications, reference docs and published practice.
- `lib/docs.test.ts` enforces the rules in CI (the `npm test` step in `.github/workflows/ci.yml`), so a pull request that breaks one fails:
  - a single `## References` section, last in the doc
  - no em-dashes
  - every internal `/docs/<slug>` link resolves
  - description lengths that fit search results (the existing SEO test caps them at 160 characters)

## Consequences

- The playbook practices "make the wrong thing hard" on itself.
- Contributors find out about a rule from a failing test, with the doc and the line, not from a reviewer.
- New rules are cheap to add as tests. Rules that can't be tested (tone, accuracy) still need review.
- Docs and code ship together, so a behavior change and its doc change land in one pull request.
