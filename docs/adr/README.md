# Architecture Decision Records

Why this site is built the way it is. Each record captures one significant decision: the context, what was decided, and what it costs. They follow [Design Docs & ADRs](https://www.syntaqx.com/docs/engineering/design-docs): numbered, about a page, and never edited once accepted. A changed decision gets a new record that supersedes the old one. Add an ADR in the same pull request as the change it describes.

| # | Decision | Status | Date |
| - | -------- | ------ | ---- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted | 2026-10-22 |
| [0002](0002-no-auth-no-database.md) | No authentication, user identity, or database | Superseded by [0010](0010-datastores-allowed-no-user-identity.md) | 2026-09-16 |
| [0003](0003-standards-first-api-conventions.md) | Standards-first API conventions | Accepted | 2026-05-10 |
| [0004](0004-header-based-dated-versioning.md) | Header-based dated versioning | Accepted | 2026-10-22 |
| [0005](0005-request-id-uuid-v7-with-legacy-aliases.md) | Request-Id as UUID v7, with legacy X- aliases | Accepted | 2026-10-22 |
| [0006](0006-http-query-in-the-proxy.md) | Serve HTTP QUERY in the proxy layer | Accepted | 2026-10-22 |
| [0007](0007-uuid-v7-default-identifier.md) | UUID v7 as the default identifier | Accepted | 2026-05-10 |
| [0008](0008-400-malformed-422-validation.md) | 400 for malformed requests, 422 for validation failures | Accepted | 2026-10-22 |
| [0009](0009-playbook-docs-enforced-in-ci.md) | Playbook docs as Markdown, checked in CI | Accepted | 2026-10-22 |
| [0010](0010-datastores-allowed-no-user-identity.md) | Datastores are allowed; still no authentication or user identity | Accepted | 2026-10-22 |
| [0011](0011-rate-limiting-in-upstash-redis.md) | Rate limiting in Upstash Redis, with memory and noop stores | Accepted | 2026-10-22 |
| [0012](0012-docs-in-section-folders.md) | Docs grouped into section folders, with the section in the URL | Accepted | 2026-10-22 |
