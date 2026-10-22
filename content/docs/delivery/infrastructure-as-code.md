+++
title = "Infrastructure as Code"
description = "Infrastructure declared in code and changed by review: remote locked state, plan and apply from CI, drift detection, modules, and secrets kept out of state."
category = "Delivery"
order = 1105
tags = ["iac", "terraform", "opentofu", "delivery"]
+++

Infrastructure built by clicking through a cloud console has the same problem as a [server patched by hand](/docs/delivery/containers): it works, and nobody can say exactly why, or build another one like it. The security group widened during an incident, the database parameter tuned last year, the DNS record added for a vendor trial: none of it is written down anywhere except in the live system. [Infrastructure as code](https://martinfowler.com/bliki/InfrastructureAsCode.html) applies the discipline the rest of this playbook applies to software: it lives in version control, changes go through review, and the running system is built from the repository.

## Declarative Beats Imperative

A script says *what to do*: create this bucket, then attach this policy. A declarative definition says *what should exist*, and a tool works out the steps. Declarative wins for long-lived infrastructure because it handles the case scripts can't: the world already partly matches. A script run twice tries to create the bucket again; a declarative tool compares the definition to reality and changes only the difference. That comparison, the **plan**, is also the most valuable artifact in the whole process: a reviewable list of exactly what will be created, changed and destroyed.

## Terraform and OpenTofu

Terraform is the most widely used declarative tool, and [OpenTofu](https://opentofu.org/) is its open-source fork. In August 2023 HashiCorp moved Terraform from the Mozilla Public License to the Business Source License, which isn't open source; the community forked the last MPL version as OpenTofu, [announced by the Linux Foundation](https://www.linuxfoundation.org/press/announcing-opentofu) in September 2023, with its first stable release, 1.6.0, in January 2024. OpenTofu remains [MPL-2.0](https://github.com/opentofu/opentofu) and describes itself as a drop-in replacement. The choice is about licensing and governance, not features; what follows applies to both.

## State: Remote, Locked, Never Edited by Hand

The tool records what it created in a **state** file, which maps your definitions to real resource IDs. State is the most dangerous file in the system.

- **Keep it remote,** in a backend shared by everyone and by CI ([remote state](https://developer.hashicorp.com/terraform/language/state/remote)). State on a laptop means the next person to apply works from a different picture of reality.
- **Lock it.** Two applies at once can corrupt state. Supported backends [lock automatically](https://developer.hashicorp.com/terraform/language/state/locking) on every operation that could write it. `force-unlock` exists for a lock left behind by a crash, and the docs warn to be very careful with it: unlocking while someone else holds the lock means two writers.
- **Never edit it by hand.** Moving a resource, importing one, or forgetting one are all commands. A hand-edited state file is a lie the next plan will act on.
- **Treat it as secret.** State stores attribute values in plain text, [including secrets](https://developer.hashicorp.com/terraform/language/state/sensitive-data); marking a variable `sensitive` hides it from output but still writes it to state. Encrypt state at rest, restrict who can read it, and prefer ephemeral values and write-only arguments so secrets never land in state at all.

## Plan in CI, Apply from CI

The workflow that makes infrastructure reviewable is the same one used for code ([CI & Continuous Deployment](/docs/delivery/ci-pipelines)):

1. A pull request changes the definitions.
2. CI runs `plan` and posts the result on the pull request.
3. A reviewer reads **the plan, not just the diff**. A one-line change to a name can plan as "destroy and recreate the database"; only the plan shows it.
4. After merge, CI applies exactly that plan.

**Nobody applies from a laptop.** A local apply bypasses review, uses whatever tool and provider versions that machine has, and leaves no record where everyone looks. Tools like [Atlantis](https://www.runatlantis.io/) run this loop from pull-request comments. Either way, the credentials that can change production belong to CI, not to people.

## Detect Drift

Drift is the gap between the definitions and reality: a change made in the console during an incident, a resource another tool modified. It's inevitable, and it's dangerous because the next apply will "fix" it, possibly undoing an emergency change nobody wrote down.

Run a scheduled plan against production. `plan -detailed-exitcode` [exits with code 2](https://developer.hashicorp.com/terraform/cli/commands/plan) when changes are present, so a nightly job can alert on drift without parsing output. Then resolve each case deliberately: codify the change if it was right, or let the apply revert it if it wasn't.

## Modules, Versioned

Modules package a pattern (a service's standard database, a bucket with the right encryption and lifecycle rules) so teams reuse a reviewed design instead of copying configuration.

- **Version modules like libraries,** and pin consumers to a version. A module change that silently applies to every environment on the next run is a fleet-wide change nobody reviewed as one.
- **Keep them small and boring.** A module that takes forty parameters to cover every case is harder to review than the resources it wraps.

## Environments as Code

Each environment is the same definitions with different inputs: sizes, counts, domains. That's what makes [environment parity](/docs/operations/environments) real, and what makes recreating an environment, or a whole region during [disaster recovery](/docs/operations/disaster-recovery), a matter of running the code rather than following a wiki page.

Infrastructure code creates the place a secret lives (a secrets-manager entry and the permission to read it) and never contains its value, which goes in through the secrets manager, so it's never in the repository or, with ephemeral values, in state.

## Policy as Code

Some rules shouldn't depend on a reviewer noticing: storage buckets aren't public, every resource has an owner tag (which [Cost & FinOps](/docs/operations/cost-and-finops) depends on), databases are encrypted. Express them as policies that run against the plan in CI, with a tool like [Open Policy Agent](https://www.openpolicyagent.org/), and the pull request fails before anything is created.

## What Isn't Infrastructure as Code

Data isn't infrastructure. The state backend and the CI identity that runs everything have to exist first, so they're bootstrapped once, carefully, and documented. Secrets' values stay out, and third-party settings without a provider stay manual. The honest goal isn't "everything in code"; it's that everything is either in code or explicitly listed as not, so nobody discovers a hand-made dependency during an outage.

## This Site

[syntaqx.com](https://github.com/syntaqx/syntaqx.com) is small enough that it doesn't need Terraform, and is honest about which parts are code and which aren't:

- **In code:** the build and headers (`next.config.ts`, including the [Content-Security-Policy](/docs/security/security-headers) and redirects), CI (`.github/workflows`), dependency automation (`.github/dependabot.yml`) and local services (`compose.yml`).
- **Not in code:** the Vercel project's environment variables (the Upstash credentials arrive through the Vercel Marketplace integration), domains, and the GitHub branch protection rules, all set in dashboards. The environment variables are at least documented, in the README and `.env.example`; the domains and branch protection live only in their dashboards, which is the gap a larger system would close with code.

## References

**Reference**

- [Terraform: Remote state](https://developer.hashicorp.com/terraform/language/state/remote), sharing state through a backend
- [Terraform: State locking](https://developer.hashicorp.com/terraform/language/state/locking), automatic locking and the force-unlock warning
- [Terraform: Sensitive data in state](https://developer.hashicorp.com/terraform/language/state/sensitive-data), why state holds secrets in plain text, and ephemeral values
- [Terraform: plan command](https://developer.hashicorp.com/terraform/cli/commands/plan), `-detailed-exitcode` for drift detection
- [OpenTofu](https://opentofu.org/), the open-source, drop-in Terraform fork under the Linux Foundation
- [OpenTofu on GitHub](https://github.com/opentofu/opentofu), licensed MPL-2.0
- [Open Policy Agent](https://www.openpolicyagent.org/), policy as code evaluated against plans

**In practice**

- [Martin Fowler: Infrastructure As Code](https://martinfowler.com/bliki/InfrastructureAsCode.html), defining infrastructure in source and treating it like software
- [Linux Foundation: Announcing OpenTofu](https://www.linuxfoundation.org/press/announcing-opentofu), the fork after Terraform's move to the Business Source License
- [OpenTofu Manifesto](https://opentofu.org/manifesto/), the August 2023 license change and the reasons for the fork
- [Atlantis](https://www.runatlantis.io/), running plan and apply from pull requests
