+++
title = "Commits, PRs & Code Review"
description = "Conventional Commits, small squash-merged pull requests with a real description, and code reviews that are fast, labeled, and focused on what matters."
category = "Engineering Practice"
order = 12.1
tags = ["process", "git", "code-review", "commits"]
aliases = ["commits-and-reviews"]
+++

History is documentation. Six months from now, `git blame` is how someone finds out why a line exists, and the commit message is the only answer they'll get. Reviews are how that history stays good, but a slow review process costs more than the bugs it catches. The goal is both: a log that explains itself, and reviews that keep pace with the work.

## Conventional Commits

Commit messages, and so PR titles since PRs are squash merged, follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>(<optional scope>): <description>

<optional body>

<optional footer(s)>
```

The format is a small tax on every commit, and it pays for itself in three places. A reader scanning the log can skip every `docs` and `chore` line to find the behavior change that broke something. Release tooling can derive the next version and the changelog from the types instead of someone writing them by hand. And a `!` makes a breaking change impossible to miss in review.

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

- **Imperative, lowercase, no period.** "add", not "added" or "Adds". It reads as what the commit does when applied, which is how the log is read.
- **The body says why.** The diff already says what. "Retry on 503 because the processor sheds load during settlement" is worth more than any amount of "update retry logic".
- **`!` or a `BREAKING CHANGE:` footer** for anything that breaks consumers. It maps straight onto a major version bump under [SemVer](/docs/engineering/dependencies), and onto a new version under [Versioning & Deprecation](/docs/operations/versioning).

## Pull Requests

- **Small.** Aim for under about 400 changed lines. Past that, reviewers stop reading and start skimming, and approval becomes a formality. Big changes ship as a stack of small PRs, or land dark behind a [feature flag](/docs/engineering/feature-flags) so each step is reviewable and deployable on its own.
- **One concern per PR.** A refactor and a behavior change in one diff means nobody can tell which lines change behavior, so neither gets a real review. Land the refactor first, then the change on top of it.
- **Squash merge.** One PR becomes one commit on `main`, with the PR title as its message. `main` stays readable, and `git bisect` lands on a change that was reviewed as a unit rather than a "fix typo" halfway through someone's branch. The cost is losing the branch's intermediate commits, which small PRs make cheap to lose.
- **Green before review.** A reviewer's attention is the scarcest thing in the process. Spending it on something CI would have flagged in five minutes wastes it twice: once now, and again after the fix.

### Description Template

The [PR template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository) asks four questions, because a reviewer who knows why the change exists and how it was checked reviews twice as fast:

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

Link the [design doc](/docs/engineering/design-docs) for anything significant, and the ADR if the change departs from the playbook. The PR explains the change; the doc explains the decision.

## Reviewing

- **First response within one business day.** A PR waiting on review is work in progress that can't ship, and the author has already moved on to something else and has to page it back in. Most of the delay in a review process is waiting, not reviewing. One business day is the maximum [Google uses](https://google.github.io/eng-practices/review/reviewer/speed.html), and it's for the first response, not the final approval.
- **Design first,** then correctness, tests and readability. If the approach is wrong, line comments are wasted effort. Style is the linter's job; a human arguing about formatting is a missing lint rule.
- **Approve when it improves the codebase,** not when it's how you'd have written it. Holding out for perfection teaches authors to batch changes to make each review worth the wait, which makes reviews worse. Approving with small comments the author will address is fine.
- **Ask for a split** rather than reviewing a 2,000-line PR badly. A rubber-stamped big PR is worse than no review, because everyone believes it was reviewed.

### Conventional Comments

Unlabeled comments leave the author guessing which ones block the merge, so they treat all of them as blocking and the review drags. Label them with [Conventional Comments](https://conventionalcomments.org/):

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
| `praise` | Something done well. Use it; reviews that only find fault teach people to dread them |
| `issue` | A specific problem, ideally with a suggested fix |
| `suggestion` | A proposed improvement, with the why |
| `question` | A possible concern that needs an answer |
| `nitpick` | Trivial and preference-based. Never blocking |
| `thought` | An idea worth considering. Never blocking |

The `(blocking)` and `(non-blocking)` decorations remove the remaining guesswork. Anything unlabeled is non-blocking.

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
