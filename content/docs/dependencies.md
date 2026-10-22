+++
title = "Dependency Management"
description = "Lockfiles, SemVer, an automated upgrade cadence, vetting new dependencies, and supply-chain safeguards like provenance, SLSA, and SHA-pinned CI actions."
category = "Engineering Practice"
order = 12.4
tags = ["dependencies", "security", "supply-chain", "process"]
+++

Every dependency is code you ship without writing it. Most of the time that's a great trade. It stays a great trade only if you keep dependencies current, know what you pulled in, and can trust where it came from.

## Lockfiles

- **Always committed.** `package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `poetry.lock`. The lockfile is what actually ships.
- **CI installs from the lockfile only** (`npm ci`, `pnpm install --frozen-lockfile`). A build that resolves new versions on its own isn't reproducible.
- **Lockfile changes are reviewed** like code. An unexpected new transitive dependency is worth a question.

## Semantic Versioning

Libraries follow [SemVer 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`.

| Change | Bump |
| ------ | ---- |
| Breaking change to the public API | Major |
| New backward-compatible functionality | Minor |
| Backward-compatible bug fix | Patch |

Commit types map onto it directly: `fix` is a patch, `feat` a minor, and `!` or `BREAKING CHANGE` a major (see [Commits, PRs & Code Review](/docs/commits-and-reviews)). Public HTTP APIs version differently, by date, per [Versioning & Deprecation](/docs/versioning).

## Upgrade Cadence

Small, frequent upgrades are cheap. A two-year jump across three majors is a project.

- **Automate it.** [Renovate](https://docs.renovatebot.com/) or [Dependabot](https://docs.github.com/en/code-security/dependabot) opens upgrade PRs on a schedule.
- **Weekly batches** for patch and minor updates, grouped by ecosystem so it's one review, not forty.
- **Majors one at a time,** with the changelog read and linked in the PR.
- **Security updates immediately,** outside the schedule.
- **A minimum release age** (a few days) before adopting a new version, so a compromised or broken release is likely to be caught and yanked before it reaches you.
- **Tests gate everything.** Automerge is fine for patch updates only when the [test suite](/docs/testing) is trustworthy.

## Adding a Dependency

Before adding one, ask:

- **Do we need it?** A dependency for 20 lines of code costs more than the 20 lines.
- **Is it maintained?** Recent releases, responsive issues, more than one maintainer.
- **What does it pull in?** Count the transitive dependencies, not just the one you're adding.
- **Is the license compatible?** Checked automatically in CI.
- **Does it run code on install?** Install scripts are the most common supply-chain attack path. Disable them by default and allow them per package.

## Supply Chain

- **Pin CI actions to a full commit SHA,** not a tag. GitHub's [security hardening guide](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions) recommends it, since tags can be moved. Renovate and Dependabot keep the SHAs updated. Where GitHub's workflow dependency lockfile is available, it supersedes SHA pinning.
- **Least-privilege CI tokens.** Set `permissions:` explicitly on every workflow, read-only by default.
- **Provenance for what you publish.** Build artifacts on hosted CI and attach signed provenance (for example `npm publish --provenance`, or [artifact attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations)).
- **Aim for [SLSA](https://slsa.dev/spec/v1.0/levels) Build L2 or higher:** builds run on a hosted platform that generates signed provenance, so a consumer can verify what was built, from which source, by which workflow.
- **Scan continuously.** Vulnerability alerts on every repository, triaged like any other bug, with severity deciding the deadline.
