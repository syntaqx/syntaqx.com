# Architecture Decision Records

This site follows its own [playbook](https://www.syntaqx.com/docs/playbook). Where it does, the playbook is the explanation, and there's nothing to record.

An ADR here records a **departure**: a place where the site deliberately does something other than what the playbook says, why, and what it costs. If you find yourself writing an ADR for a choice the playbook already makes, link the doc instead. If a departure turns out to be the better default, change the playbook and retire the ADR; git keeps the history.

They follow [Design Docs & ADRs](https://www.syntaqx.com/docs/engineering/design-docs): numbered, about a page, and added in the same pull request as the change.

| # | Decision | Departs from | Date |
| - | -------- | ------------ | ---- |
| [0001](0001-no-authentication-or-user-identity.md) | No authentication or user identity | The playbook's account-based practices (auth, tenancy, user data) | 2026-09-16 |
| [0002](0002-header-only-api-versioning.md) | Header-only API versioning, no URL version | [Versioning](https://www.syntaqx.com/docs/api-design/versioning): the URL path fallback | 2026-10-22 |
| [0003](0003-breaking-changes-before-consumers.md) | Breaking changes without a deprecation window, while there are no consumers | [Versioning](https://www.syntaqx.com/docs/api-design/versioning): new versions and 30-day deprecations | 2026-10-22 |
| [0004](0004-csp-allows-inline-scripts.md) | Content-Security-Policy allows inline scripts, for now | [Security Headers & CSP](https://www.syntaqx.com/docs/security/security-headers): nonces and `strict-dynamic` | 2026-10-22 |
