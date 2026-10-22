+++
title = "Code Ownership"
description = "Every service and directory has an owning team: CODEOWNERS for reviews, a catalog entry for operations, and a README that gets anyone running in one command."
category = "Engineering Practice"
order = 12.6
tags = ["ownership", "process", "documentation", "codeowners"]
+++

Code without an owner decays. Nobody upgrades its dependencies, nobody answers its alerts, and the first person to touch it in a year inherits every surprise. Ownership is cheap to write down and expensive to reconstruct, so it's written down from the first commit.

## Every Path Has an Owner

Ownership is assigned to **teams, not individuals**. People change roles and go on vacation; a team's queue is always staffed.

- **Repository level:** a `CODEOWNERS` file maps paths to the teams that review changes to them.
- **Organization level:** a service catalog maps each deployable to the team that runs it.
- **No orphans.** A path with no owner is a bug, and a check in CI can fail on it.

## CODEOWNERS

GitHub reads `CODEOWNERS` from `.github/`, the repository root, or `docs/`, using the first it finds, and it must exist on the pull request's base branch.

```text
# Default owner for everything
*                       @acme/platform

# More specific paths override earlier lines: the last match wins
/services/payments/     @acme/payments
/services/payments/ui/  @acme/payments @acme/frontend
/.github/               @acme/platform
/.github/CODEOWNERS     @acme/platform @acme/eng-leads
```

- **Require code owner review** in branch protection or a ruleset. A listing that isn't required is a suggestion.
- **Own the file itself.** Whoever owns `CODEOWNERS` decides who owns everything else, so it gets a deliberately small owner list.
- **Order matters.** The last matching pattern takes precedence, so broad defaults go first and specific paths after.

## The Service Catalog

`CODEOWNERS` answers "who reviews this change?". The catalog answers "who do I call at 3 a.m.?". Every deployable service has an entry, usually a file in its repository that a catalog like [Backstage](https://backstage.io/docs/features/software-catalog/) indexes:

| Field | Why |
| --- | --- |
| Owning team | Who decides, who's accountable |
| On-call rotation | Who gets paged. See [On-Call & Runbooks](/docs/operations/on-call) |
| Runbook | What to do when it breaks |
| SLOs and dashboards | What "healthy" means. See [SLOs & Error Budgets](/docs/operations/slos) |
| Dependencies | What it calls, and what calls it |
| Repository and docs | Where the code, ADRs and design docs live |
| Lifecycle | Experimental, production, or deprecated |

An entry that's wrong is worse than none, so the catalog file lives next to the code and changes in the same pull request.

## What Every README Contains

A README is the front door. Someone new should go from clone to running in minutes, without asking anyone.

1. **What it is,** in two sentences, and who owns it.
2. **Run it locally, in one command,** with every dependency it needs (`docker compose up`, `npm run dev`). If it takes a wiki page, it's a bug.
3. **Test it,** in one command.
4. **How it deploys,** and how to roll back.
5. **Where the rest lives:** ADRs, design docs, runbook, dashboards.

Anything longer than a screen belongs in linked docs, not the README.

## Shared Code

Shared libraries are where ownership quietly disappears: everyone uses them, so nobody owns them.

- **Shared code still has one owning team.** Other teams contribute through pull requests that the owner reviews.
- **Prefer copying over premature sharing.** Two services with similar code can diverge freely; a shared library couples their release schedules.
- **A shared library is a product.** It has versions, a changelog and a deprecation policy, like any API. See [Versioning & Deprecation](/docs/operations/versioning).

## Changing Owners

Ownership changes are explicit handoffs, never drift:

- The receiving team accepts it, in writing, with the catalog and `CODEOWNERS` changed in the same pull request.
- The handoff includes the runbook, open incidents and action items, known debt, and on-call shadowing for at least one rotation.
- Nobody inherits a service in the middle of an incident.

Code no team will accept is a candidate for deletion, not for a "shared" label. See [Tech Debt](/docs/engineering/tech-debt).

## This Site

[syntaqx.com](https://github.com/syntaqx/syntaqx.com) has one owner, so it has no `CODEOWNERS` file. Its README covers what the site is, `npm run dev` to run it, `docker compose up -d` for the optional local Redis, and how it builds. It also lists the test commands and links the ADR index, so it meets the checklist above.

## References

**Reference**

- [GitHub: About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners), file locations, last-match precedence and required reviews
- [Backstage: Software Catalog](https://backstage.io/docs/features/software-catalog/), tracking ownership and metadata for every service

**In practice**

- [Google SRE Book: Being On-Call](https://sre.google/sre-book/being-on-call/), why operational ownership needs a staffed rotation
