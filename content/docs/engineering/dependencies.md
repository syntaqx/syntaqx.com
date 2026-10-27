+++
title = "Dependencies & Upgrades"
description = "Lockfiles, SemVer, small continuous upgrades, an LTS runtime policy, vetting new dependencies, and supply-chain safeguards like provenance and pinned CI."
category = "Engineering Practice"
order = 1005
tags = ["dependencies", "security", "supply-chain", "process", "upgrades", "maintenance"]
aliases = ["dependencies", "delivery/staying-current"]
+++

Every dependency is code you ship without writing it. That's usually a great trade, and it stays one only if you know exactly what you pulled in, can trust where it came from, and keep it current. Software rots by standing still: the runtime reaches end of life, the framework moves two majors ahead, a security fix ships only for versions you can't reach, and one day "upgrade" means a quarter-long project nobody wants to fund. The cure is boring: pin everything, and upgrade a little, all the time.

## Lockfiles

A range like `^4.2.0` means "whatever 4.x is newest today", so without a lockfile two builds of the same commit a week apart can ship different code, and the one that breaks production is the one you can't reproduce.

- **Always committed.** `package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `poetry.lock`. The lockfile, not the manifest, is what ships.
- **CI installs from the lockfile only** (`npm ci`, `pnpm install --frozen-lockfile`).
- **Lockfile changes are reviewed** like code. A new transitive dependency in a PR that "only bumped one package" is exactly how unexpected code arrives.

## Semantic Versioning

[SemVer](https://semver.org/) is a library author's promise about `MAJOR.MINOR.PATCH`: a breaking change bumps major, new backward-compatible functionality bumps minor, a backward-compatible fix bumps patch. Commit types map straight onto it (`fix`, `feat`, and `!` for breaking; see [Commits, PRs & Code Review](/docs/engineering/commits-and-reviews)). Public HTTP APIs version by date instead, per [Versioning & Deprecation](/docs/api-design/versioning).

The promise is what makes automation safe: patch and minor updates flow through with tests as the gate, majors get a human. It's only a promise, though; plenty of "minor" releases break things, which is why the tests gate everything, not the version number.

## Small and Continuous

The cost of an upgrade grows much faster than the distance you're behind. One major is a changelog and an afternoon. Three majors is a migration, and worse than three afternoons: breaking changes stack, the upgrade guides assume you're coming from the previous major, the plugins you rely on dropped your version long ago, and the engineers who knew why the workarounds exist have moved on. A small upgrade fits into normal work; a big one needs a project and a budget, competes with features, and loses until something forces it.

- **Automate it.** [Renovate](https://docs.renovatebot.com/) or [Dependabot](https://docs.github.com/en/code-security/dependabot) opens upgrade PRs weekly, merged the same week.
- **Group what moves together** (a framework and its plugins, React and its types), so each PR is one coherent change.
- **Auto-merge green patch and minor updates.** A human skimming a lockfile diff catches almost nothing the [test suite](/docs/engineering/testing) doesn't, and if the tests can't catch a bad patch release, that's a test gap to fix. Save reviewer attention for majors.
- **Majors one at a time,** with the changelog read, published codemods run, and the upgrade in its own PR.
- **Security updates immediately,** outside the schedule. See [Vulnerability Management](/docs/security/vulnerability-management).
- **A minimum release age** of a few days before adopting a new version. Compromised releases are usually caught and pulled within days, so letting one sit means someone else finds the malware first.
- **Make deprecations loud.** Today's deprecation warning is next major's breaking change: surface warnings in CI and logs, then ratchet them into errors, fixing the existing ones and failing the build on new ones.

Upkeep that isn't scheduled doesn't happen, so reserve a fixed share of every sprint for it and protect it when deadlines press (see [Tech Debt](/docs/engineering/tech-debt)). [Containers](/docs/delivery/containers) make it cheaper: with every deploy rebuilt from a pinned base image, a runtime upgrade is a one-line change and a normal deploy.

## Runtime Policy

Run a supported long-term release in production, and move before it ends, not after. An end-of-life runtime stops getting security fixes, so its next vulnerability is permanent unless you upgrade under pressure, the worst time to do it.

- **Node.js:** production runs an LTS line. Through Node.js 26, even-numbered majors become LTS and odd ones are short-lived; from Node.js 27, releases are annual and every major becomes LTS after its Current phase. An LTS line gets critical fixes for about 30 months in total ([release schedule](https://nodejs.org/en/about/previous-releases)). Move to the next LTS within a few months of it becoming LTS.
- **Pin the version in the repository** (`.nvmrc`, `engines`, the base image), so local, CI and production can't disagree.
- **Track end-of-life dates** for every runtime, database and OS, with [endoflife.date](https://endoflife.date/nodejs), and put upgrades on the roadmap before they're emergencies.

## Adding a Dependency

Each new dependency is a permanent maintenance and security commitment:

- **Do we need it?** A dependency for 20 lines of code costs more than the 20 lines.
- **Is it maintained?** Recent releases, responsive issues, more than one maintainer. A single maintainer is a single account away from compromise.
- **What does it pull in?** Every transitive dependency is a trust decision you're making implicitly.
- **Is the license compatible?** Checked automatically in CI.
- **Does it run code on install?** Install scripts run with your credentials before any of your code does. Disable them by default and allow them per package. In September 2025 the [Shai-Hulud worm](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem) compromised over 500 npm packages this way: each infection stole the developer's npm token and published infected versions of their other packages.

Prefer boring technology. Every new tool carries costs its demo doesn't show: unknown failure modes, thin documentation, a small hiring pool. Dan McKinley's [Choose Boring Technology](https://mcfunley.com/choose-boring-technology) gives each team a few "innovation tokens" to spend on what makes the product different. A [tech radar](https://www.thoughtworks.com/radar) (Adopt, Trial, Assess, Hold) records what the defaults are. Boring and current aren't opposites: Postgres is boring, Postgres three majors behind is a liability.

## Supply Chain

- **Pin CI actions to a full commit SHA,** not a tag. A tag is a mutable pointer its owner, or whoever compromises them, can move. In March 2025 attackers did exactly that to [`tj-actions/changed-files`](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-github-action-cve-2025-30066), repointing its tags at a commit that dumped CI secrets into workflow logs; workflows pinned to a SHA were unaffected. Renovate and Dependabot keep pinned SHAs updated, with the version in a comment. GitHub has announced [workflow-level dependency locking](https://github.blog/news-insights/product-news/whats-coming-to-our-github-actions-2026-security-roadmap/) for transitive actions; until it exists, SHA pinning is the practical answer.
- **Least-privilege CI tokens.** Set `permissions:` on every workflow, read-only by default.
- **Provenance for what you publish.** Build on hosted CI and attach signed provenance ([`npm publish --provenance`](https://docs.npmjs.com/generating-provenance-statements), [artifact attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations)), aiming for [SLSA](https://slsa.dev/spec/v1.0/levels) Build L2 or higher, so consumers can verify a package came from your workflow and not a stolen laptop token.
- **Scan continuously,** with alerts triaged like any other bug.

## References

**Specifications**

- [SemVer 2.0.0](https://semver.org/), version numbers and what they promise
- [SLSA: Security Levels](https://slsa.dev/spec/v1.0/levels), Build L2 and signed provenance

**Reference**

- [npm: package-lock.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json), committed lockfiles
- [npm: Generating Provenance Statements](https://docs.npmjs.com/generating-provenance-statements), `npm publish --provenance`
- [GitHub: Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions), pinning actions to a full commit SHA
- [GitHub: Artifact Attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations), provenance for build artifacts
- [GitHub: Configuring Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates), scheduled, grouped update pull requests
- [Renovate: automerge](https://docs.renovatebot.com/configuration-options/#automerge), auto-merging patch and minor updates
- [Node.js: Releases](https://nodejs.org/en/about/previous-releases), LTS and Current lines, and the release schedule
- [endoflife.date: Node.js](https://endoflife.date/nodejs), support and end-of-life dates by version

**In practice**

- [CISA: tj-actions/changed-files compromise (CVE-2025-30066)](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-github-action-cve-2025-30066), retargeted action tags leaking CI secrets
- [CISA: Widespread supply chain compromise impacting npm](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem), the Shai-Hulud worm and install-time credential theft
- [GitHub: Actions 2026 security roadmap](https://github.blog/news-insights/product-news/whats-coming-to-our-github-actions-2026-security-roadmap/), workflow-level dependency locking
- [Dan McKinley: Choose Boring Technology](https://mcfunley.com/choose-boring-technology), innovation tokens and well-understood tools
- [Thoughtworks: Technology Radar](https://www.thoughtworks.com/radar), Adopt, Trial, Assess and Hold
- [OpenSSF Scorecard](https://openssf.org/projects/scorecard/), signals for vetting a new dependency
