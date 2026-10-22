+++
title = "Commits, PRs & Code Review"
description = "Conventional Commits, small squash-merged pull requests with a real description, and code reviews that are fast, labeled, and focused on what matters."
category = "Engineering Practice"
order = 12.1
tags = ["process", "git", "code-review", "commits"]
aliases = ["commits-and-reviews"]
+++

History is documentation. A good commit log explains why the code is the way it is, and good reviews keep it that way without becoming the bottleneck.

## Conventional Commits

Commit messages (and so PR titles, since PRs are squash merged) follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>(<optional scope>): <description>

<optional body>

<optional footer(s)>
```

| Type | Use for |
| ---- | ------- |
| `feat` | A new capability for users |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | A performance improvement |
| `test` | Adding or fixing tests |
| `build`, `ci` | Build system, dependencies, pipelines |
| `chore` | Everything else that doesn't touch behavior |

```text
feat(api): Api-Version header versioning per the versioning standard

fix(webhooks): verify signature before parsing the body

feat(payments)!: amounts are integer minor units

BREAKING CHANGE: `amount` is now an integer, see /docs/payments/money.
```

- **Imperative, lowercase, no period.** "add", not "added" or "Adds".
- **The body says why.** The diff already says what.
- **`!` or a `BREAKING CHANGE:` footer** for anything that breaks consumers. This maps straight onto [SemVer](/docs/engineering/dependencies) and [Versioning & Deprecation](/docs/operations/versioning).

## Pull Requests

- **Small.** Aim for under about 400 changed lines. Big changes ship as a stack of small PRs, or behind a [feature flag](/docs/engineering/feature-flags).
- **One concern per PR.** A refactor and a behavior change in one diff means nobody can review either.
- **[Squash merge](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests).** One PR is one commit on `main`, with the PR title as the message. `main` stays bisectable and readable.
- **Green before review.** Reviewers' time goes to design and correctness, not to finding what CI would have.

### Description Template

```markdown
## Why
The problem, and a link to the issue or design doc.

## What
The approach, and anything surprising in the diff.

## How it was verified
Tests added, manual steps, screenshots for UI.

## Risk and rollout
Migrations, flags, how to roll back.
```

Link the [design doc or ADR](/docs/engineering/design-docs) for anything significant. The PR explains the change; the doc explains the decision.

## Reviewing

- **Respond within one business day.** That's the maximum in [Google's code review guide](https://google.github.io/eng-practices/review/reviewer/speed.html), and it's about the first response, not the final approval.
- **Review the design first,** then correctness, tests and readability. Style is the linter's job.
- **Approve when it improves the codebase,** not when it's how you'd have written it. Approving with minor comments the author will address is fine.
- **Ask for a split** rather than reviewing a 2,000-line PR badly.

### Conventional Comments

Label comments with [Conventional Comments](https://conventionalcomments.org/) so the author knows what's blocking and what isn't:

```text
issue (blocking): this retries a POST without an idempotency key.
See /docs/operations/retries-and-timeouts.

suggestion (non-blocking): extract the backoff calculation so the
webhook worker can reuse it.

nitpick: `amt` → `amount`, per our naming conventions.

praise: the migration plan in the description is excellent.
```

| Label | Meaning |
| ----- | ------- |
| `praise` | Something done well. Use it |
| `issue` | A specific problem, ideally with a suggested fix |
| `suggestion` | A proposed improvement, with the why |
| `question` | A possible concern that needs an answer |
| `nitpick` | Trivial and preference-based. Never blocking |
| `thought` | An idea worth considering. Never blocking |

Decorations `(blocking)` and `(non-blocking)` remove the guesswork. Unlabeled comments are treated as non-blocking.

## References

**Specifications**

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), commit message format
- [SemVer 2.0.0](https://semver.org/), how commit types map to version bumps

**Reference**

- [GitHub: Configuring Commit Squashing](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests), squash merges
- [GitHub: Pull Request Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository), the PR description template

**In practice**

- [Google Engineering Practices: Speed of Code Reviews](https://google.github.io/eng-practices/review/reviewer/speed.html), the one-business-day turnaround
- [Google Engineering Practices: Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html), why PRs stay small
- [Google Engineering Practices: The Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html), approving changes that improve the code
- [Conventional Comments](https://conventionalcomments.org/), labeled review comments
