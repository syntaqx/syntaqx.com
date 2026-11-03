+++
title = "Release Stages"
description = "Internal, alpha, beta and general availability as gates: who gets access at each stage, what each one promises, and what must be true before the next."
category = "Product"
order = 1004
tags = ["product", "releases", "beta", "launch"]
+++

A release stage is a promise to the people using it: how stable it is, whether it might change under them, and what support they get. Vendors publish these promises because customers make real decisions on them. GitHub's are typical: a private preview is "under heavy development and often has changing requirements and scope", with "no service level agreements (SLAs)" and "no technical support obligations", while general availability means "fully tested and open publicly to all users", with SLA and support obligations applying ([GitHub release phases](https://docs.github.com/en/get-started/using-github/exploring-early-access-releases-with-feature-preview)).

## The Stages

| Stage | Who gets it | What it promises | Leaves when |
| --- | --- | --- | --- |
| **Internal** | The team and the company | Nothing beyond "it runs" | It works end to end for real internal use, with telemetry and a kill switch in place |
| **Alpha** (private preview) | A few invited customers who've agreed to rough edges | It will change, may break, and may be withdrawn. No SLA | The core flows hold up, and the feedback has stopped finding problems with the problem statement itself |
| **Beta** (public preview) | Anyone who opts in | Documented, mostly stable, still no SLA, breaking changes announced | It meets its SLO for several weeks at real load, and the work below is done |
| **General availability** | Everyone | Production use, the SLA, full support, and changes under the [versioning](/docs/api-design/versioning) rules | Only by deprecation, with a dated sunset |

Internal use comes first because it's the cheapest feedback there is. GitLab's handbook puts it simply: "The best way to understand how GitLab works is to use it for as much of your job as possible", with dogfooding starting during validation and moving toward using the feature "exclusively" ([Dogfooding for R&D](https://handbook.gitlab.com/handbook/product/product-processes/dogfooding-for-r-d/)).

## Names Vary, Promises Don't

GitHub says private and public preview. AWS treats anything "labeled "beta", "preview", "pre-release", or "experimental"" as a beta service, and states that "Service Level Agreements do not apply to Beta Services" ([AWS Service Terms](https://aws.amazon.com/service-terms/), section 2). Azure runs private, limited and public previews, all "excluded from the service-level agreements (SLAs)", with support plans that don't cover private or limited previews ([Azure support FAQ](https://azure.microsoft.com/en-us/support/faq/)).

Pick one vocabulary, write down what each stage promises, and publish it where customers will find it. The names matter less than everyone meaning the same thing by them, inside the company and out.

## Gates Between Stages

Each move is a gate with exit criteria decided when the work is planned, not on the day someone wants to announce it. The criteria per risk tier come from [Release Readiness](/docs/quality/release-readiness#done-by-risk-tier); the stage adds what has to be true for the next group of people.

- **Into alpha:** real internal use, events instrumented, errors visible, a [kill switch](/docs/delivery/feature-flags#kill-switches), and a named owner for alpha feedback.
- **Into beta:** the core flows stable, docs written, support briefed with a known-issues list, and a way for beta users to report problems that reaches the team.
- **Into GA:** the [SLO](/docs/operations/slos) met for several weeks at real traffic, [load tested](/docs/quality/load-testing) beyond expected peak, a security review, support runbooks, billing ready if it's paid, and a migration path for anything beta users built on.

## Flags Do the Gating

Stages are cohorts, and cohorts are [feature flags](/docs/delivery/feature-flags#progressive-rollout). Internal is a flag on for employees, alpha a list of accounts, beta an opt-in setting, GA the flag on for everyone and then removed. Nothing about moving between stages needs a deploy, and nothing about it should.

## Don't Live in Beta

A beta with no path to GA becomes the permanent state: customers depend on it in production, but there's no SLA and no support commitment, and every incident lands on a feature nobody has promised anything about. Give every beta a target date for the GA decision. When that date comes, the feature graduates, gets another fixed round, or is withdrawn. All three are fine. Drifting isn't.

## Ask the Right Questions at Each Stage

Early users are the best source of problems you'll get, and still a poor source of solutions ([Customers Name Problems, Not Solutions](/docs/product/problem-statements#customers-name-problems-not-solutions)). Ask alpha users whether it solves the problem at all. Ask beta users where it breaks, what's confusing, and what they still do some other way. By GA, the questions belong to [product analytics](/docs/telemetry/product-analytics): who uses it, how often, and whether the outcome the problem statement promised actually moved.

## References

- [Exploring early access releases with feature preview](https://docs.github.com/en/get-started/using-github/exploring-early-access-releases-with-feature-preview), GitHub Docs: release phases
- [AWS Service Terms](https://aws.amazon.com/service-terms/), Amazon Web Services: section 2, Betas and Previews
- [Azure support FAQ](https://azure.microsoft.com/en-us/support/faq/), Microsoft: preview types and SLAs
- [Dogfooding for R&D](https://handbook.gitlab.com/handbook/product/product-processes/dogfooding-for-r-d/), GitLab Handbook
