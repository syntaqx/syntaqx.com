+++
title = "Staying Current"
description = "Keeping runtimes, frameworks and dependencies modern without big-bang rewrites: small continuous upgrades, an LTS policy, EOL tracking and boring defaults."
category = "Delivery"
order = 11.3
tags = ["delivery", "dependencies", "upgrades", "maintenance"]
+++

Software rots by standing still. The runtime reaches end of life, the framework moves two majors ahead, a security fix ships only for versions you can't reach, and one day "upgrade" means a quarter-long project nobody wants to fund. The cure is boring: upgrade a little, all the time.

## Small and Continuous

The cost of an upgrade grows much faster than the distance you're behind. One major version is a changelog and an afternoon. Three majors is a migration, and it's worse than three afternoons for reasons that compound:

- **Breaking changes stack.** Version 4 changed an API that version 5 removed and version 6 replaced. The upgrade guides assume you're coming from the previous major, so you're translating between guides written for someone else.
- **Dependencies move without you.** The plugin you rely on dropped support for your version two majors ago, so the framework upgrade now drags a plugin upgrade with it, which drags its own.
- **Nobody remembers the old code.** The engineers who knew why the workaround exists have moved on, so every change needs archaeology first.
- **It can't be done in passing.** A small upgrade fits into normal work. A big one needs a project, a budget and a decision, which means it competes with features and loses until something forces it.

Small and frequent turns upgrades from projects back into chores.

- **Upgrade continuously.** Automated dependency pull requests every week, merged the same week. See [Dependency Management](/docs/engineering/dependencies).
- **Group what moves together** (a framework and its plugins, React and its types) so each pull request is one coherent change.
- **Auto-merge patch and minor updates when CI is green.** A human skimming a lockfile diff catches almost nothing that tests don't. If your tests can't catch a bad patch release, that's a test gap to fix, not a reason to spend reviewer attention on every bump; save it for majors, where reading the changelog genuinely matters.
- **Read the changelog for majors,** run the published codemods, and land the upgrade in its own pull request.

## Runtime Policy

Run a supported, long-term release in production, and move before it ends, not after. An end-of-life runtime stops getting security fixes, so the next vulnerability in it is permanent unless you upgrade under pressure, which is the worst time to do it.

- **Node.js:** production runs an LTS line. Through Node.js 26, even-numbered majors become LTS and odd-numbered ones are short-lived; from Node.js 27, releases are annual and every major becomes LTS after its Current phase. An LTS line gets critical fixes for about 30 months in total. See the [Node.js release schedule](https://nodejs.org/en/about/previous-releases).
- **Upgrade to the next LTS within a few months of it becoming LTS,** not in the last month before the old one's end of life.
- **Pin the version in the repository** (`.nvmrc`, `engines`, the base image), so local, CI and production can't disagree.
- **Track end-of-life dates** for every runtime, database and OS you depend on, with [endoflife.date](https://endoflife.date/nodejs) or its API, and put upgrades on the roadmap before they're emergencies.

## Make Deprecations Loud

Today's deprecation warning is next major's breaking change.

- **Surface deprecation warnings** in CI output and logs, not just local consoles.
- **Ratchet them into errors** over time: fix the existing ones, then fail the build on new ones.
- **Treat a deprecation in your own API** the same way you ask clients to. See [Versioning & Deprecation](/docs/operations/versioning).

## What Counts as Modern

Staying current isn't chasing whatever launched this week.

- **Choose boring technology by default.** Every new technology carries costs that don't show up in its demo: unknown failure modes, thin documentation for your edge cases, a small hiring pool, operational knowledge nobody has yet. Dan McKinley's [Choose Boring Technology](https://mcfunley.com/choose-boring-technology) frames this as a few "innovation tokens" per team: spend them on what makes your product different, not on a new database for a CRUD app.
- **Keep a tech radar.** [Thoughtworks' Technology Radar](https://www.thoughtworks.com/radar) sorts technologies into Adopt, Trial, Assess and Hold. Keep your own: what's the default, what's being tried on a real project, what's being looked at, and what new work should stop using.
- **Boring and current aren't opposites.** Postgres is boring; Postgres three majors behind is a liability. Pick established tools and keep them up to date.

## Budget the Time

Upkeep that isn't scheduled doesn't happen. Reserve a fixed share of every sprint or quarter for upgrades, deprecations and cleanup, track it like any other work, and protect it when deadlines press. See [Tech Debt](/docs/engineering/tech-debt).

Containers make this cheaper: when every deploy rebuilds from a pinned base image, upgrading the OS or runtime is a one-line change and a normal deploy. See [Containers & Immutable Infrastructure](/docs/delivery/containers). Upgrades are also how security fixes reach you; see [Vulnerability Management](/docs/security/vulnerability-management).

## This Site

`.nvmrc` pins Node.js 24, an LTS line, for local development, CI and Vercel. Dependabot opens grouped pull requests weekly: Next.js with its config, React with its types, and GitHub Actions together. Actions are pinned to commit SHAs, and Dependabot bumps the SHA with its version comment. Every update runs the full CI and gets a preview deployment before it merges. Updates are still merged by hand; auto-merging green patch and minor updates is the next step.

## References

**Reference**

- [Node.js: Releases](https://nodejs.org/en/about/previous-releases), LTS and Current lines, and the release schedule
- [endoflife.date: Node.js](https://endoflife.date/nodejs), support and end-of-life dates by version
- [GitHub: Configuring Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates), scheduled, grouped update pull requests
- [GitHub: Automating Dependabot with GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions), auto-merging updates when CI passes
- [Renovate: automerge](https://docs.renovatebot.com/configuration-options/#automerge), auto-merging patch and minor updates

**In practice**

- [Dan McKinley: Choose Boring Technology](https://mcfunley.com/choose-boring-technology), innovation tokens and well-understood tools
- [Thoughtworks: Technology Radar](https://www.thoughtworks.com/radar), Adopt, Trial, Assess and Hold
