+++
title = "Dependency Management"
description = "Lockfiles, SemVer, an automated upgrade cadence, vetting new dependencies, and supply-chain safeguards like provenance, SLSA, and SHA-pinned CI actions."
category = "Engineering Practice"
order = 12.4
tags = ["dependencies", "security", "supply-chain", "process"]
aliases = ["dependencies"]
+++

Every dependency is code you ship without writing it. Most of the time that's a great trade: someone else wrote, tested and maintains it. It stays a great trade only if you keep dependencies current, know what you actually pulled in, and can trust where it came from. Each of those has failed loudly in recent years, and the practices below exist because of how.

## Lockfiles

A version range like `^4.2.0` means "whatever 4.x is newest today". Without a lockfile, two builds of the same commit a week apart can ship different code, and the one that breaks production is the one you can't reproduce.

- **Always committed.** `package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `poetry.lock`. The lockfile, not the manifest, is what actually ships.
- **CI installs from the lockfile only** (`npm ci`, `pnpm install --frozen-lockfile`). A build that resolves new versions on its own isn't reproducible, and isn't reviewed either.
- **Lockfile changes are reviewed** like code. A new transitive dependency appearing in a PR that "only bumped one package" is exactly how unexpected code arrives.

## Semantic Versioning

[SemVer](https://semver.org/) is a promise from a library author about what a version number means: `MAJOR.MINOR.PATCH`.

| Change | Bump |
| ------ | ---- |
| Breaking change to the public API | Major |
| New backward-compatible functionality | Minor |
| Backward-compatible bug fix | Patch |

The promise is what makes automation safe: patch and minor updates can flow through with tests as the gate, while majors get a human. It's only a promise, though. Plenty of "minor" releases break things, which is why the tests gate everything, not the version number.

Commit types map straight onto it: `fix` is a patch, `feat` a minor, and `!` or `BREAKING CHANGE` a major (see [Commits, PRs & Code Review](/docs/engineering/commits-and-reviews)). Public HTTP APIs version differently, by date, per [Versioning & Deprecation](/docs/operations/versioning).

## Upgrade Cadence

The cost of an upgrade grows faster than the distance. One minor release is a five-minute review. Three majors behind is a project: breaking changes stack, migration guides assume you're on the previous version, and the security fix you suddenly need only ships for the current one. See [Staying Current](/docs/delivery/staying-current).

- **Automate it.** [Renovate](https://docs.renovatebot.com/) or [Dependabot](https://docs.github.com/en/code-security/dependabot) opens upgrade PRs on a schedule, so staying current is the default rather than a task someone has to remember.
- **Weekly batches** for patch and minor updates, grouped by ecosystem, so it's one review rather than forty.
- **Majors one at a time,** with the changelog read and linked in the PR.
- **Security updates immediately,** outside the schedule. See [Vulnerability Management](/docs/security/vulnerability-management).
- **A minimum release age** of a few days before adopting a new version. Compromised releases are usually caught and pulled within days, so letting a new version sit means someone else finds the malware first.
- **Tests gate everything.** Automerge for patch updates is fine, but only when the [test suite](/docs/engineering/testing) is trustworthy enough to deploy on.

## Adding a Dependency

Every dependency is a permanent maintenance and security commitment, so adding one deserves a minute of thought:

- **Do we need it?** A dependency for 20 lines of code costs more than the 20 lines: upgrades forever, and someone else's bugs.
- **Is it maintained?** Recent releases, responsive issues, more than one maintainer. A single maintainer is a single account away from compromise.
- **What does it pull in?** Count the transitive dependencies, not just the one you're adding. Each is a separate trust decision you're making implicitly.
- **Is the license compatible?** Checked automatically in CI, so nobody discovers a copyleft obligation during due diligence.
- **Does it run code on install?** Install scripts are the favorite path for supply-chain attacks, because they run with your credentials before any of your code does. Disable them by default and allow them per package.

That last one isn't theoretical. In September 2025, the [Shai-Hulud worm](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem) compromised over 500 npm packages through install hooks: each infection stole the developer's npm token and used it to publish infected versions of that developer's other packages.

## Supply Chain

- **Pin CI actions to a full commit SHA,** not a tag. A tag is a mutable pointer the action's owner, or whoever compromises them, can move. In March 2025, attackers did exactly that to [`tj-actions/changed-files`](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-github-action-cve-2025-30066), repointing its release tags at a commit that dumped CI secrets into workflow logs. Every workflow using `@v45` ran it; workflows pinned to a SHA didn't. Renovate and Dependabot keep pinned SHAs updated, with the version in a comment. GitHub has announced [workflow-level dependency locking](https://github.blog/news-insights/product-news/whats-coming-to-our-github-actions-2026-security-roadmap/) that would cover transitive actions too; until it's available, SHA pinning is the practical answer.
- **Least-privilege CI tokens.** Set `permissions:` explicitly on every workflow, read-only by default. A compromised step can only leak what its token can do.
- **Provenance for what you publish.** Build artifacts on hosted CI and attach signed provenance (for example [`npm publish --provenance`](https://docs.npmjs.com/generating-provenance-statements), or [artifact attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations)), so consumers can verify a package came from your repository's workflow and not from a stolen laptop token.
- **Aim for [SLSA](https://slsa.dev/spec/v1.0/levels) Build L2 or higher:** builds run on a hosted platform that generates signed provenance, so anyone can check what was built, from which source, by which workflow.
- **Scan continuously.** Vulnerability alerts on every repository, triaged like any other bug, with severity setting the deadline.

## References

**Specifications**

- [SemVer 2.0.0](https://semver.org/), version numbers and what they promise
- [SLSA: Security Levels](https://slsa.dev/spec/v1.0/levels), Build L2 and signed provenance

**Reference**

- [npm: package-lock.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json), committed lockfiles
- [npm: Generating Provenance Statements](https://docs.npmjs.com/generating-provenance-statements), `npm publish --provenance`
- [GitHub: Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions), pinning actions to a full commit SHA
- [GitHub: Artifact Attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations), provenance for build artifacts
- [GitHub: Dependabot](https://docs.github.com/en/code-security/dependabot), automated upgrade PRs and alerts
- [Renovate Docs](https://docs.renovatebot.com/), scheduled, batched upgrades

**In practice**

- [CISA: tj-actions/changed-files compromise (CVE-2025-30066)](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-github-action-cve-2025-30066), retargeted action tags leaking CI secrets
- [CISA: Widespread supply chain compromise impacting npm](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem), the Shai-Hulud worm and install-time credential theft
- [GitHub: Actions 2026 security roadmap](https://github.blog/news-insights/product-news/whats-coming-to-our-github-actions-2026-security-roadmap/), workflow-level dependency locking
- [OpenSSF Scorecard](https://openssf.org/projects/scorecard/), signals for vetting a new dependency
