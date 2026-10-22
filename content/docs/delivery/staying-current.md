+++
title = "Staying Current"
description = "Keeping runtimes, frameworks and dependencies modern without big-bang rewrites: small continuous upgrades, an LTS policy, EOL tracking and boring defaults."
category = "Delivery"
order = 11.3
tags = ["delivery", "dependencies", "upgrades", "maintenance"]
+++

Software rots by standing still. The runtime reaches end of life, the framework moves two majors ahead, a security fix ships only for versions you can't reach, and one day "upgrade" means a quarter-long project nobody wants to fund. The cure is boring: upgrade a little, all the time.

## Small and Continuous

The cost of an upgrade grows much faster than the distance you're behind. One major version is a changelog and an afternoon. Three majors is a migration: breaking changes stacked on each other, guides written for the version you skipped, and dependencies that moved on without you.

- **Upgrade continuously.** Automated dependency pull requests every week, merged the same week. See [Dependency Management](/docs/engineering/dependencies).
- **Group what moves together** (a framework and its plugins, React and its types) so each pull request is one coherent change.
- **Auto-merge patch and minor updates when CI is green.** If your tests can't catch a bad patch release, that's a test gap to fix, not a reason to review every bump by hand.
- **Read the changelog for majors,** run the published codemods, and land the upgrade in its own pull request.

## Runtime Policy

Run a supported, long-term release in production, and move before it ends, not after.

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

- **Choose boring technology by default.** Dan McKinley's [Choose Boring Technology](https://mcfunley.com/choose-boring-technology) gives every team a few "innovation tokens": spend them on what makes your product different, not on a new database for a CRUD app. Well-understood tools have known failure modes.
- **Keep a tech radar.** [Thoughtworks' Technology Radar](https://www.thoughtworks.com/radar) sorts technologies into Adopt, Trial, Assess and Hold. Keep your own: what's the default, what's being tried on a real project, what's being looked at, and what new work should stop using.
- **Boring and current aren't opposites.** Postgres is boring; Postgres three majors behind is a liability. Pick established tools and keep them up to date.

## Budget the Time

Upkeep that isn't scheduled doesn't happen. Reserve a fixed share of every sprint or quarter for upgrades, deprecations and cleanup, track it like any other work, and protect it when deadlines press. See [Tech Debt](/docs/engineering/tech-debt).

Containers make this cheaper: when every deploy rebuilds from a pinned base image, upgrading the OS or runtime is a one-line change and a normal deploy. See [Containers & Immutable Infrastructure](/docs/delivery/containers). Upgrades are also how security fixes reach you; see [Vulnerability Management](/docs/security/vulnerability-management).

## This Site

`.nvmrc` pins Node.js 24, an LTS line, for local development, CI and Vercel. Dependabot opens grouped pull requests weekly: Next.js with its config, React with its types, and GitHub Actions together. Actions are pinned to commit SHAs, and Dependabot bumps the SHA with its version comment. Every update runs the full CI and gets a preview deployment before it merges.

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
