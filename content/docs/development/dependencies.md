+++
title = "Dependencies & Upgrades"
description = "Lockfiles, SemVer, small continuous upgrades, an LTS runtime policy, vetting new dependencies, and supply-chain safeguards like provenance and pinned CI."
category = "Development"
order = 126
tags = ["dependencies", "security", "supply-chain", "process", "upgrades", "maintenance"]
aliases = ["engineering/dependencies", "dependencies", "delivery/staying-current"]
+++

Every dependency is code you ship without writing it. That's usually a great trade, and it stays one only if you know exactly what you pulled in, can trust where it came from, and keep it current. Software rots by standing still: the runtime reaches end of life, the framework moves two majors ahead, a security fix ships only for versions you can't reach, and one day "upgrade" means a quarter-long project nobody wants to fund. The cure is boring: pin everything, and upgrade a little, all the time.

## Lockfiles

A range like `^4.2.0` means "whatever 4.x is newest today", so without a lockfile two builds of the same commit a week apart can ship different code, and the one that breaks production is the one you can't reproduce.

- **Always committed.** `package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `poetry.lock`. The lockfile, not the manifest, is what ships.
- **CI installs from the lockfile only** (`npm ci`, `pnpm install --frozen-lockfile`).
- **Lockfile changes are reviewed** like code. A new transitive dependency in a PR that "only bumped one package" is exactly how unexpected code arrives.

## Semantic Versioning

[SemVer](https://semver.org/) is a library author's promise about `MAJOR.MINOR.PATCH`: a breaking change bumps major, new backward-compatible functionality bumps minor, a backward-compatible fix bumps patch. Commit types map straight onto it (`fix`, `feat`, and `!` for breaking; see [Commits, PRs & Code Review](/docs/development/commits-and-reviews)). Public HTTP APIs version by date instead, per [Versioning & Deprecation](/docs/api-design/versioning).

The promise is what makes automation safe: patch and minor updates flow through with tests as the gate, majors get a human. It's only a promise, though; plenty of "minor" releases break things, which is why the tests gate everything, not the version number.

## How Tightly to Pin

Every reference to a dependency says how much it's allowed to move on its own, and the right answer depends on what a surprise update could break.

| Pin | Example | What can change without a commit | Use it for |
| --- | --- | --- | --- |
| **Major** | `^7.1.0`, `actions/checkout@v7` | New features and fixes in 7.x | Anything with a lockfile in front of it; libraries you publish |
| **Minor** | `~7.1.0`, `@v7.1` | Fixes in 7.1.x | Rarely worth it: it blocks features without blocking risk |
| **Full version** | `7.0.1`, `@v7.0.1` | Nothing, unless the publisher moves the tag | No lockfile, or the reference itself has to show what runs |
| **Commit or digest** | `@<40-char SHA>`, `image@sha256:...` | Nothing at all | The fallback where no lockfile exists and the blast radius is real |

In npm's ranges, `^7.1.0` accepts anything below 8.0.0 and `~7.1.0` anything below 7.2.0, with the caret tightening below 1.0.0 (`^0.2.3` stops before 0.3.0) because a 0.x minor is allowed to break ([node-semver](https://github.com/npm/node-semver#advanced-range-syntax)). Cargo reads a bare `"7.1.0"` as the same caret requirement ([The Cargo Book](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html)). Go has no ranges at all: `go.mod` names a minimum version and `go.sum` locks its contents.

**The lockfile is the pin; the manifest is a policy.** Once a lockfile exists, the range in the manifest only says which updates a bot may propose, and what runs is whatever the lockfile recorded. That's when it's fine to chill: application dependencies take caret ranges, the lockfile holds exact versions, and Renovate or Dependabot move both in a reviewed pull request. Pinning exact versions in the manifest on top of a lockfile buys nothing but noisier upgrade PRs.

Libraries go the other way. A library pinned to exact versions forces its consumers to install duplicate copies or fight resolution conflicts, so a published package declares the widest range it actually supports and leaves pinning to the application.

Match how tightly you pin to how much damage a bad update can do:

- **Relax** where a bad update costs a red build: dev tooling, linters, a docs site, a prototype, read-only CI jobs that hold no secrets. A major tag or a caret range is plenty, and the time saved goes to work that matters.
- **Tighten** where it costs production or credentials: anything without a lockfile that ships to customers, CI jobs that hold deploy keys or publish packages, base images, and the toolchain that builds what you release. Use a full version at minimum, and a lockfile or digest on top.

## Small and Continuous

The cost of an upgrade grows much faster than the distance you're behind. One major is a changelog and an afternoon. Three majors is a migration, and worse than three afternoons: breaking changes stack, the upgrade guides assume you're coming from the previous major, the plugins you rely on dropped your version long ago, and the engineers who knew why the workarounds exist have moved on. A small upgrade fits into normal work; a big one needs a project and a budget, competes with features, and loses until something forces it.

- **Automate it.** [Renovate](https://docs.renovatebot.com/) or [Dependabot](https://docs.github.com/en/code-security/dependabot) opens upgrade PRs weekly, merged the same week.
- **Group what moves together** (a framework and its plugins, React and its types), so each PR is one coherent change.
- **Auto-merge green patch and minor updates.** A human skimming a lockfile diff catches almost nothing the [test suite](/docs/quality/testing) doesn't, and if the tests can't catch a bad patch release, that's a test gap to fix. Save reviewer attention for majors.
- **Majors one at a time,** with the changelog read, published codemods run, and the upgrade in its own PR.
- **Security updates immediately,** outside the schedule. See [Vulnerability Management](/docs/security/vulnerability-management).
- **A minimum release age** of a few days before adopting a new version. Compromised releases are usually caught and pulled within days, so letting one sit means someone else finds the malware first.
- **Make deprecations loud.** Today's deprecation warning is next major's breaking change: surface warnings in CI and logs, then ratchet them into errors, fixing the existing ones and failing the build on new ones.

Upkeep that isn't scheduled doesn't happen, so reserve a fixed share of every sprint for it and protect it when deadlines press (see [Tech Debt](/docs/development/tech-debt)). [Containers](/docs/delivery/containers) make it cheaper: with every deploy rebuilt from a pinned base image, a runtime upgrade is a one-line change and a normal deploy.

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
- **Is the [license](/docs/compliance/open-source-licenses) compatible?** Checked automatically in CI.
- **Does it run code on install?** Install scripts run with your credentials before any of your code does. Disable them by default and allow them per package. In September 2025 the [Shai-Hulud worm](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem) compromised over 500 npm packages this way: each infection stole the developer's npm token and published infected versions of their other packages.

Prefer boring technology. Every new tool carries costs its demo doesn't show: unknown failure modes, thin documentation, a small hiring pool. Dan McKinley's [Choose Boring Technology](https://mcfunley.com/choose-boring-technology) gives each team a few "innovation tokens" to spend on what makes the product different. A [tech radar](https://www.thoughtworks.com/radar) (Adopt, Trial, Assess, Hold) records what the defaults are. Boring and current aren't opposites: Postgres is boring, Postgres three majors behind is a liability.

## Supply Chain

- **Reference CI actions by full version, and lock what they resolve to.** I write actions by their full release version (`actions/checkout@v7.0.1`), not a bare commit SHA: the version says exactly what's running, a bump reads cleanly in review, and Renovate or Dependabot raise it as a pull request. Behind a lockfile, a major tag (`@v7`) is fine too, by the rules in [How Tightly to Pin](#how-tightly-to-pin). A version is still a tag, a mutable pointer its owner, or whoever compromises them, can move. In March 2025 attackers did exactly that to [`tj-actions/changed-files`](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-github-action-cve-2025-30066), repointing its tags at a commit that dumped CI secrets into workflow logs. GitHub's [workflow dependency lockfile](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles), generally available since October 28, 2026 ([changelog](https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available)), closes that gap without giving up the readable version: `gh actions-lock` writes `.github/workflows/actions.lock`, which "pins a commit SHA to every action your workflows depend on, including transitive dependencies," and a run uses the recorded commit "even if a tag or branch moves." With it, GitHub's docs say SHA pinning in workflow files is "no longer necessary," and the Require lockfile policy makes it mandatory. It doesn't pin reusable workflows called with `jobs.<job_id>.uses`, and locking doesn't make an action safe, so keep third-party actions few and allowed by name. Where there's no lockfile (another forge, or a platform the feature hasn't reached), pin to a full commit SHA with the version in a comment, and let the same bots keep it current.
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
- [node-semver: Advanced range syntax](https://github.com/npm/node-semver#advanced-range-syntax), what caret and tilde ranges accept, and the tighter caret below 1.0.0
- [The Cargo Book: Specifying dependencies](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html), caret requirements as the default, `"1.2.3"` equivalent to `"^1.2.3"`
- [GitHub Docs: Workflow dependency lockfiles](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles), what the lockfile pins, onboarding, and the Require lockfile policy
- [GitHub Changelog: Workflow lockfiles are generally available](https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available), October 28, 2026
- [GitHub: Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions), least privilege and the risks of third-party actions
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
