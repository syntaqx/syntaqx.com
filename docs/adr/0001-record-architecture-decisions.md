# 0001. Record architecture decisions

Status: Accepted (2026-10-22)

## Context

This site publishes an [architectural playbook](https://www.syntaqx.com/docs/playbook) that tells teams to write decisions down. The site itself had no record of why it's built the way it is: why there's no database, why `QUERY` is handled in the proxy, why some headers keep an `X-` prefix. That reasoning lived in commit messages and in one person's head.

## Decision

Significant decisions about this site are recorded as Architecture Decision Records in `docs/adr/`, in [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), as described in [Design Docs & ADRs](https://www.syntaqx.com/docs/design-docs).

- One decision per file, numbered, about a page.
- `Status`, then Context, Decision, Consequences.
- Accepted ADRs are never edited. A changed decision is a new ADR that supersedes the old one, and the old one gets a forward link.
- ADRs are reviewed in the same pull request as the change they describe.

## Consequences

- New contributors (and agents) can answer "why is it like this?" without archaeology.
- The playbook's advice has a working example in its own repository.
- Writing an ADR adds a few minutes to significant changes. Small, easily reversed changes don't need one.
