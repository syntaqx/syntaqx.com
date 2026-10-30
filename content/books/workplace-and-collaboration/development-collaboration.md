+++
title = "Development Collaboration"
description = "Code hosts as collaboration tools: pull requests and review rules, CODEOWNERS, merge queues, linking work items to commits and deploys, and inner source."
category = "Workplace & Collaboration Industry"
order = 2036
part = "Work Management"
tags = ["code-review", "pull-requests", "codeowners", "issue-tracking", "inner-source"]
+++

For software teams, the code host is the busiest collaboration tool in the company. GitHub reported "180 million-plus developers" and "43.2 million pull requests on average each month" in its October 2025 Octoverse report; GitLab reported $955.2 million of revenue for its fiscal year ended January 31, 2026. A pull request (a merge request in GitLab) is a document with an author, reviewers, threaded comments, required approvals and a status, wrapped around a diff; the review rules around it are a permission system the customer's admins configure; and the links from pull requests to work items are how a tracker learns what actually happened to the work.

What makes it hard is that the code host and the tracker are often different products, from different vendors, and each sees half the picture. The tracker knows what was asked for and why; the host knows what changed, who reviewed it and when it shipped. Joining them is done by convention (an issue key in a branch name), by apps that sync events across, and by rules that move statuses when code moves. And the review rules (who must approve which paths) encode an organization's ownership map in a file in the repository. The customer's admins decide those rules and which integrations may read the code; the vendors decide how links are inferred and what each side shows.

This chapter covers pull requests and review rules, code owners, merge queues, linking work to code and deploys, and inner source. CI and CD pipelines, runners and their supply-chain security belong to Hosting & Cloud: [The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#how-the-providers-do-it), [Continuous Delivery Platforms](/books/hosting-and-cloud/continuous-delivery-platforms#approvals-and-environment-protection) and [Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security#how-the-providers-do-it). Review practice is the playbook's [Commits and Reviews](/docs/engineering/commits-and-reviews#pull-requests) and ownership is [Code Ownership](/docs/engineering/code-ownership#codeowners).

## How the Platforms Do It

As of October 2026:

| Product | Review unit | Required approvals | Code owners | Serialized merging | Linking to work items |
| --- | --- | --- | --- | --- | --- |
| **GitHub** | Pull request; drafts can't merge | Branch protection or rulesets: approval count, dismiss stale approvals, code owner review, last push approved by someone else | `CODEOWNERS` in `.github/`, root or `docs/`; last match wins; under 3 MB | Merge queue with `merge_group` checks | Closing keywords to the default branch; sub-issues, issue types and Projects |
| **GitLab** | Merge request | Approval rules (Premium and Ultimate), up to 100 required approvals | `CODEOWNERS` with sections and per-section approval counts (Premium and Ultimate) | Merge trains, up to 20 parallel pipelines by default | Closing patterns on merge to the default branch |
| **Bitbucket with Jira** | Pull request | Not covered in the sources cited here | Not covered in the sources cited here | Not covered in the sources cited here | Work item keys in branches, commits and PR titles; Smart Commits; deployment gating |
| **Azure Repos and Boards** | Pull request | Branch policies (not covered in the sources cited here) | Not covered in the sources cited here | Not covered in the sources cited here | `AB#123` in commits and descriptions; `Fixes AB#123` on merge to the default branch |
| **Linear with GitHub or GitLab** | The host's pull request | The host's | The host's | The host's | Issue ID in branch names; magic words; status moves on PR open and merge |

Three patterns run through the table. **Review rules live on the target branch**, not on the pull request, so they can't be weakened by the author. **Linking is inferred from text**: an issue key in a branch name, commit message or title is the universal join, because it works across vendors without an API. **Closing happens on merge to the default branch**: GitHub, GitLab and Azure all ignore closing keywords that land elsewhere, which makes "merged to main" the definition of done that the tracker inherits.

## Pull Requests and Review Rules

"Pull requests are proposals to merge code changes into a project." On GitHub, "draft pull requests cannot be merged, and code owners are not automatically requested to review them"; marking one ready requests code owner reviews. GitLab's merge requests "provide a central location for your team to review code, have discussions, and track code changes."

The rules that gate a merge are configured by repository and organization admins, on branches. GitHub's branch protection covers required pull request reviews (an approval count, dismissing stale approvals when new commits arrive, requiring code owner review, and requiring that the most recent push be approved "by someone other than the person who pushed it"), required status checks, conversation resolution, signed commits, linear history, merge queues, deployments, branch locking, preventing bypass, and restrictions on who may push, force-push or delete. Rulesets layer on top: "Multiple rulesets can apply to the same branch at the same time, while only one branch protection rule applies"; "a ruleset does not have a priority," and "the most restrictive version of the rule applies," with up to 75 rulesets per repository and 75 organization-wide, on GitHub Team and Enterprise. GitLab's approval rules (Premium and Ultimate) allow up to 100 required approvals, and "if you don't define a default approval rule, any user can approve a merge request."

Three rules follow, and they match the environment approvals in [Continuous Delivery Platforms](/books/hosting-and-cloud/continuous-delivery-platforms#approvals-and-environment-protection):

- **Put the rule on the target**, outside anything the author can edit. A review requirement in a file the pull request can change is a requirement the pull request can remove.
- **Separate author and approver**, including the subtle case GitHub names: the last pusher can't be the only approver, or a reviewer could push after approval and merge their own change.
- **Combine rules by restriction, not priority.** GitHub's rulesets apply the most restrictive version of each rule; a system with priorities invites a low-priority permissive rule to win by accident.

## Code Owners

A `CODEOWNERS` file maps paths to the people or teams who must review changes to them. On GitHub, the file can live in `.github/`, the repository root or `docs/`, searched "in that order," using the first found; "the last matching pattern takes the most precedence"; files "must be under 3 MB"; approval from "any of the owners is sufficient"; and some gitignore syntax (escaped `#`, `!` negation, `[ ]` ranges) doesn't work. GitLab (Premium and Ultimate) searches `./CODEOWNERS`, `./docs/CODEOWNERS` and `./.gitlab/CODEOWNERS`, uses the first, applies the last matching entry, and adds sections: `[Section name]`, an optional section with `^[Section name]`, an approval count with `[Section name][5]`, and default owners on the header line, with "only the last matching entry in that section" used. Code owner approval is enforced only on protected branches with code owner approval required.

The file is an organization chart in the repository, which makes it easy to change and easy to let rot. Its failure modes are the ones the playbook's [Code Ownership](/docs/engineering/code-ownership#changing-owners) describes: owners who left, teams that were renamed, catch-all patterns that make one team review everything. A builder of a code host or a review tool should validate owners against the directory on every change to the file (an owner that doesn't resolve to a member or team with access is an error, not a silent skip), show which rule matched each path in the review UI, and let admins require that the `CODEOWNERS` file itself is owned.

## Merge Queues

When many pull requests target one busy branch, each passing its checks against an older base, merging them in sequence can break the branch even though every one was green. Merge queues fix that by testing each change on top of the ones ahead of it. GitHub's queue merges pull requests "in a first-in-first-out order where the required checks are always satisfied," building temporary `gh-readonly-queue/{base_branch}` branches; CI must run on the `merge_group` event; build concurrency and merge limits range from 1 to 100. GitLab's merge trains (Premium and Ultimate) run "a maximum of 20 pipelines in parallel" by default and remove a merge request whose pipeline fails, rebuilding pipelines for those behind it.

For collaboration, the queue changes what "approved" means: an approved pull request is not merged until the queue says so, and the tracker should not treat approval as done. The Linear integration's default (In Progress when a pull request opens, Done when it merges) and GitHub's closing keywords both key off the merge, which is the right event.

## Linking Work to Code

Every integration between a tracker and a code host rests on one convention: put the work item's key in the branch name, commit message or pull request title.

- **Jira** links development work when the key appears in "your commit message, branch name, or PR title," uppercase only ("JRA-123" works, "jra-123" does not), with keys of "two or more uppercase letters, followed by a hyphen" and a number. The GitHub for Atlassian app syncs branches, pull requests, commits, builds and deployments into Jira's development panel.
- **Smart Commits** go further: `JRA-123 #comment <text>`, `#time 2d 5h`, and `#<transition_name>` in a commit message comment on, log time against, or transition the item, provided "the committer's email address must match the email address of a single Jira user," the command stays on one line, and the transition's required fields are set (otherwise it "will silently fail").
- **GitHub** closes issues from pull requests with keywords (close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved), but only when the pull request targets the default branch; keywords "in commit messages close the issue on merge" too, without listing the pull request as linked; a pull request can link up to ten issues manually; cross-repository references use `owner/repository#number`.
- **GitLab** closes issues when "the commit or merge request is merged into the default branch," with a default pattern covering close, fix, resolve and implement forms.
- **Azure Boards** links with `AB#{ID}` in a commit message, pull request description or GitHub issue description (not titles or comments); `Fixes AB#123` moves the item to its first Resolved-category state (or Completed) when the pull request merges into the default branch; in `Fixes AB#123, AB#124`, only the first item transitions.
- **Linear** uses the issue ID in the branch name (copied with a shortcut), closing words (close, fix, resolve, complete, implement), non-closing words ("ref, refs, references, part of, contributes to, toward, towards"), "relates to" to link without changing status, and "skip" or "ignore" to prevent linking. "By default, we will move linked issues to "In Progress" when PRs are open and "Done" when PRs merge," with the status changing only when "the final linked PR" moves if there are several, and statuses configurable per team for draft, opened, review requested, ready for merge and merged.

The convergence is a small grammar the builder should copy: a key pattern, a set of verbs (close, reference, link, ignore), a scope (only merges to the default branch close), and per-team mapping from code events to statuses. Two failure modes recur. **Identity mismatch**: Smart Commits need the committer's email to match a tracker user, so commits from personal emails or bots don't act; the tracker should show unmatched commands rather than drop them. **Silent failures**: a transition blocked by a required field fails silently in Jira's Smart Commits; a tracker should record a failed code-driven transition on the item where the team will see it.

### Deployments on the Work Item

The development panel's last mile is deployment: which environment each item's changes have reached. The GitHub for Atlassian app scans "deployed branches for new commit messages that contain Jira work item keys" and maps workflow environments to development, testing, staging and production through `.jira/config.yml`, with "10 glob patterns for each of the four valid environments"; a Jira item shows deployments only if a deployed commit's message contains its key. Jira Service Management's deployment gating closes the loop the other way, letting a pipeline wait for a change request's approval ([Problems and Changes](/books/workplace-and-collaboration/service-management#problems-and-changes)).

Deployment data on the item is what makes cycle time end at "in production" rather than "merged" ([Flow Metrics and Their Misuse](/books/workplace-and-collaboration/boards-sprints-and-cycles#flow-metrics-and-their-misuse)), and it answers the question customers ask support: is the fix live? The tracker should store deployments as events on the item (environment, state, time, the commit range), not as a status, because one item can be in staging and production at once and roll back.

## Integrations and Who Can Read the Code

A tracker integration reads repository data: branch names, commit messages, pull request titles, sometimes diffs. That is source code access granted by the customer's admins to a third party, through an app installation with scopes ([Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces) covers the consent model). Three rules apply:

- **Request metadata scopes, not contents**, unless the feature needs the diff. Branch names, commit messages and pull request state are enough for linking.
- **Respect visibility on both sides.** A private repository's pull request linked to an item in a project with a wider audience shows its existence and state, not its title, to people who can't see the repository.
- **Make links survive the integration.** If the app is uninstalled, the item should keep a static record of what was linked, not lose its history.

## Inner Source

InnerSource "takes the lessons learned from developing open source software" and "applies them to the way companies develop software internally": any team can read another team's code, propose changes by pull request, and have them reviewed by the owners. The code host's part is visibility and process. GitHub's internal repositories, visible to every member of an enterprise, exist only "in organizations that use GitHub Enterprise Cloud and are owned by an enterprise account"; contribution rules, `CODEOWNERS` and a CONTRIBUTING file make outside contributions reviewable.

The admin's decision is the default: whether new repositories are internal (visible to everyone in the company) or private (visible to the owning team). Inner source argues for internal; confidentiality obligations (client code in a professional services firm, regulated systems, acquisitions in progress) argue for private, and a large customer usually needs both, set by policy per organization.

## Stacked Changes and Review Tooling

Large changes review badly, and a long-standing alternative to big pull requests is a stack of small dependent ones. Phabricator, an open-source code review tool, stopped being regularly updated when Phacility wound down operations on May 29, 2021 ("Phacility will nominally continue to maintain Phabricator, but it will no longer be regularly updated"). Graphite builds stacked pull requests "on top of GitHub's APIs," telling users to "split large tasks into small, incremental code changes." For a tracker, stacks mean several pull requests per item, each merged separately, which is why Linear waits for "the final linked PR" before moving an item to Done.

## How to Build It

The chapter adds the code-host connection and the links between work items and development objects, with their events. Connections ride on the [core](/books/workplace-and-collaboration/workplace-business#the-core-data-model) `app_installations`; each linked object is a row keyed by the provider's ID, with the item it points to.

```sql
CREATE TABLE dev_connections (            -- one installed code-host integration
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  app_installation_id UUID NOT NULL REFERENCES app_installations (id),
  provider       TEXT NOT NULL CHECK (provider IN ('github', 'gitlab', 'bitbucket', 'azure_repos')),
  external_org   TEXT NOT NULL,
  scopes         TEXT[] NOT NULL,          -- metadata scopes unless diffs are needed
  status_map     JSONB NOT NULL DEFAULT '{}',   -- {pr_opened: status_id, pr_merged: status_id}
  closes_on      TEXT NOT NULL DEFAULT 'default_branch_merge'
);

CREATE TABLE dev_objects (                -- branches, commits, PRs, builds, deployments
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  connection_id  UUID NOT NULL REFERENCES dev_connections (id),
  kind           TEXT NOT NULL CHECK (kind IN ('branch', 'commit', 'pull_request', 'build',
                   'deployment')),
  external_id    TEXT NOT NULL,            -- sha, PR number, deployment id
  repository     TEXT NOT NULL,
  repository_private BOOLEAN NOT NULL,
  title          TEXT,                     -- shown only to viewers who can see the repo
  url            TEXT NOT NULL,
  state          TEXT,                     -- open, draft, merged, closed; success, failed
  environment    TEXT CHECK (environment IN ('development', 'testing', 'staging', 'production')),
  author_external TEXT,
  author_member_id UUID REFERENCES members (id),   -- null when identity didn't match
  occurred_at    TIMESTAMPTZ NOT NULL,
  UNIQUE (connection_id, kind, repository, external_id)
);

CREATE TABLE dev_links (                  -- which work items a dev object refers to
  dev_object_id  UUID NOT NULL REFERENCES dev_objects (id),
  item_id        UUID NOT NULL REFERENCES work_items (item_id),
  verb           TEXT NOT NULL CHECK (verb IN ('closes', 'references', 'relates', 'command')),
  source         TEXT NOT NULL CHECK (source IN ('branch_name', 'title', 'description',
                   'commit_message', 'manual')),
  PRIMARY KEY (dev_object_id, item_id)
);
CREATE INDEX dev_links_item ON dev_links (item_id);

CREATE TABLE dev_commands (               -- Smart Commit-style commands and their outcome
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  dev_object_id  UUID NOT NULL REFERENCES dev_objects (id),
  item_id        UUID NOT NULL REFERENCES work_items (item_id),
  command        TEXT NOT NULL CHECK (command IN ('comment', 'time', 'transition')),
  argument       TEXT,
  outcome        TEXT NOT NULL CHECK (outcome IN ('applied', 'identity_unmatched',
                   'transition_blocked', 'not_allowed')),
  detail         TEXT
);
```

Key extraction is a pure function over text, run on every webhook from the host ([Consumer Expectations](/docs/api-design/webhooks#consumer-expectations)): find keys matching the workspace's project keys and aliases ([Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields#the-item-and-its-identifier)), classify the preceding word against the verb list, and upsert links. A status move is a transition through the item's workflow, run as the integration's actor, and recorded in `dev_commands` when it fails rather than dropped:

```sql
-- items whose linked PRs are all merged: move to the mapped status (Linear's "final linked PR")
SELECT l.item_id
FROM dev_links l
JOIN dev_objects o ON o.id = l.dev_object_id AND o.kind = 'pull_request'
WHERE l.verb = 'closes' AND l.item_id = ANY ($items_touched_by_event)
GROUP BY l.item_id
HAVING bool_and(o.state IN ('merged', 'closed')) AND bool_or(o.state = 'merged');
```

Deployments for an item are the latest deployment per environment among linked objects, which is what the development panel shows:

```sql
SELECT DISTINCT ON (o.environment) o.environment, o.state, o.occurred_at, o.url
FROM dev_links l JOIN dev_objects o ON o.id = l.dev_object_id
WHERE l.item_id = $1 AND o.kind = 'deployment'
ORDER BY o.environment, o.occurred_at DESC;
```

## Auditing

- **Integration installs, scope changes and removals**, as admin events, since they grant source access.
- **Code-driven transitions** with the dev object that caused them and the integration as actor.
- **Failed commands** (identity unmatched, transition blocked), visible on the item.
- **Branch protection, ruleset and `CODEOWNERS` changes** on the host side, which the host's own audit log carries; a tracker that mirrors review state should record which rules applied at merge.

## What This Means for the System You Build

- **Put review rules on the target branch,** combine them by restriction, and separate the last pusher from the approver.
- **Validate code owners against the directory** and show which rule matched.
- **Treat merge to the default branch as done** for closing, and deployment as delivered for flow metrics.
- **Adopt the key-in-text convention** with a small verb grammar and per-team status mapping.
- **Never fail silently**: record unmatched identities and blocked transitions on the item.
- **Store deployments as events per environment,** not as a status.
- **Ask for metadata scopes,** respect repository visibility on the tracker side, and keep links after an integration is removed.

## References

**Vendor documentation**

- [GitHub Docs: About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests), definition, drafts and code owner requests
- [GitHub Docs: About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners), file locations and order, precedence, size limit, any-owner approval and unsupported syntax
- [GitHub Docs: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), review, check, history, merge queue and push settings, last-push approval
- [GitHub Docs: About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets), layering, most restrictive rule, plans and the 75-ruleset limits
- [GitHub Docs: Managing a merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), FIFO with checks, temporary branches, merge_group and limits
- [GitHub Docs: Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue), keywords, default-branch rule, cross-repository syntax, ten manual links and commit messages
- [GitHub Docs: About repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories), internal visibility on Enterprise Cloud
- [GitLab Docs: Merge requests](https://docs.gitlab.com/user/project/merge_requests/), definition
- [GitLab Docs: Code Owners](https://docs.gitlab.com/user/project/codeowners/), tiers, file locations and order, last match and enforcement
- [GitLab Docs: Code Owners syntax](https://docs.gitlab.com/user/project/codeowners/reference/), sections, optional sections, approval counts and default owners
- [GitLab Docs: Approval rules](https://docs.gitlab.com/user/project/merge_requests/approvals/rules/), tiers, the 100-approval maximum and the no-default-rule case
- [GitLab Docs: Managing issues](https://docs.gitlab.com/user/project/issues/managing_issues/), default closing pattern and merge to the default branch
- [GitLab Docs: Merge trains](https://docs.gitlab.com/ci/pipelines/merge_trains/), tiers, 20 parallel pipelines and failure handling
- [Atlassian Support: Use Smart Commits](https://support.atlassian.com/bitbucket-cloud/docs/use-smart-commits/), syntax, one-line rule, email matching, key format and silent transition failures
- [Atlassian Support: Reference work items in your development work](https://support.atlassian.com/jira-software-cloud/docs/reference-issues-in-your-development-work/), keys in branches, commits and titles, case sensitivity and deployments
- [Atlassian Support: Use the GitHub for Jira app](https://support.atlassian.com/jira-cloud-administration/docs/use-the-github-for-jira-app/), linking and synced objects
- [Atlassian Support: Link GitHub workflows and deployments](https://support.atlassian.com/jira-cloud-administration/docs/link-github-workflows-and-deployments-to-jira-issues/), deployment scanning, environment types and glob patterns
- [Atlassian Support: Set up deployment gating](https://support.atlassian.com/jira-service-management-cloud/docs/set-up-deployment-gating/), pipelines waiting for change approval
- [Microsoft Learn: Link GitHub commits and pull requests to work items](https://learn.microsoft.com/en-us/azure/devops/boards/github/link-to-from-github), AB# syntax, where it works, Fixes transitions and the default-branch rule
- [Linear Docs: GitHub integration](https://linear.app/docs/github), branch names, magic words, default status moves, final linked PR and per-team status mapping
- [Graphite: Get started](https://graphite.com/docs/get-started), stacked pull requests on GitHub's APIs

**Engineering write-ups and announcements**

- [GitHub: Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/), developers, repositories and monthly pull requests
- [Phacility: Winding down operations](https://admin.phacility.com/phame/post/view/11/phacility_is_winding_down_operations/), May 29, 2021 and Phabricator maintenance
- [InnerSource Commons](https://innersourcecommons.org/), definition of InnerSource

**Filings**

- [GitLab: Fiscal 2026 Form 10-K](https://www.sec.gov/Archives/edgar/data/1653482/000162828026018731/gtlb-20260131.htm), revenue for the fiscal year ended January 31, 2026
