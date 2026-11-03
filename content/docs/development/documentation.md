+++
title = "Documentation"
description = "Docs as code in the repository, reviewed and checked in CI, sorted by Diátaxis, API reference generated from OpenAPI, and every page owned and kept fresh."
category = "Development"
order = 125
tags = ["documentation", "process", "openapi", "diataxis", "agents"]
+++

Documentation fails in two ways, and they look nothing alike. Missing docs are obvious: someone asks a question in chat, someone else answers it, and the answer disappears. Wrong docs are worse, because they look authoritative: a setup guide that skips a step, a reference page for a parameter that was renamed a year ago, a diagram of an architecture that no longer exists. Readers can't tell the stale page from the current one, so after being burned once, they stop trusting all of it and go back to asking. The practice here is aimed at both failures: docs live with the code, change with the code, are checked like the code, and have an owner who deletes them when they stop being true.

It's worth the effort. [DORA's research on documentation quality](https://dora.dev/capabilities/documentation-quality/) found a clear link between documentation quality and organizational performance, and found that good documentation amplified the benefit of every technical practice it studied: trunk-based development, for one, showed a far larger lift for teams with above-average documentation than for teams below it.

## Docs as Code

Documentation is written, reviewed and shipped with the same tools as the code. [Write the Docs](https://www.writethedocs.org/guide/docs-as-code/) describes the approach as issue trackers, Git, plain-text markup, peer review and automated checks, and notes the payoff: teams can require docs before a feature merges, while the details are fresh.

- **In the repository.** Markdown files next to the code they describe: the README at the root, longer docs under `docs/`, package docs in code comments. A wiki is a second system with its own permissions, no review and no link to the change that made it wrong.
- **In the same pull request.** Google's documentation guide says it in one line: ["Change your documentation in the same CL as the code change."](https://google.github.io/styleguide/docguide/best_practices.html) A reviewer who sees a behavior change without a doc change asks for one, the same way they'd ask for a test.
- **Built in CI.** The docs site builds on every pull request, so a broken page fails before it merges, and the preview deploy lets reviewers read the rendered result.
- **Checked in CI.** Broken links are the most common rot and the easiest to catch: a link checker like [lychee](https://lychee.cli.rs/) runs over every Markdown file. A prose linter like [Vale](https://vale.sh/) turns the style guide (terminology, banned words, heading case) into rules, so reviewers stop leaving the same comment. Project-specific rules belong in the same place: every page has an owner, every code fence has a language.

The exception is content that non-engineers own and edit (support articles, sales material). That lives where its authors work. Anything an engineer changes when the code changes lives in the repository.

## Four Kinds of Docs

Most bad documentation is a good document of the wrong kind: a tutorial that stops every paragraph to explain design history, a reference page that tries to teach, a how-to that assumes the reader wants to understand everything first. [Diátaxis](https://diataxis.fr/) names four distinct needs and four forms of documentation that serve them, sorted by [two questions](https://diataxis.fr/compass/): is the content about action or cognition, and is the reader acquiring a skill or applying one?

![The Diátaxis map as a two by two grid: columns are studying (acquiring skill) and working (applying skill); rows are action (practical steps) and cognition (theoretical knowledge). Tutorials sit at action and studying, how-to guides at action and working, explanation at cognition and studying, reference at cognition and working.](/diagrams/diataxis-quadrant.svg "Diátaxis sorts documentation by what the reader needs. Each page serves one quadrant; mixing them is what makes docs hard to use.")

| Kind | The reader | Looks like | Example |
| ---- | ---------- | ---------- | ------- |
| Tutorial | New, learning by doing | A lesson with a result they're certain to reach | "Build and deploy your first service" |
| How-to guide | Competent, with a goal | Numbered steps, no detours | "Rotate the webhook signing secret" |
| Reference | Working, looking something up | Complete, consistent, dry | The API reference, config options, CLI flags |
| Explanation | Studying, wanting to understand | Prose: context, history, trade-offs | "Why payments are idempotent by key" |

My rule is **one kind per page**, with links between them. When a how-to needs a paragraph of explanation, link to the explanation page; when a tutorial needs every option, link to the reference. The [Diátaxis guidance](https://diataxis.fr/start-here/) is to apply it in small steps, improving one thing at a time, not by restructuring everything at once, and that's the right way to bring an existing pile of docs into shape.

This playbook is mostly explanation with opinions; the runbooks, READMEs and API reference around it cover the other three.

## READMEs

The README is a landing page, not a manual. GitHub's guidance lists what one [typically covers](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes): what the project does, why it's useful, how to get started, where to get help and who maintains it. Google's [README guide](https://google.github.io/styleguide/docguide/READMEs.html) adds the status (is it deprecated?) and, at a minimum, a link to the fuller docs.

The concrete checklist, with one command to run and one to test, is in [Code Ownership](/docs/development/code-ownership#what-every-readme-contains), and the setup that one command runs is in [Repositories & Local Development](/docs/development/repositories). The test of a README is a new engineer on a clean machine: if they need to ask anyone anything to get it running, the README is wrong, and they're the one who fixes it (see [Onboarding](/docs/leadership/onboarding#the-docs-are-the-onboarding-path)).

## API Reference from OpenAPI

API reference is the one kind of documentation that should never be written by hand. The [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) defines a language-agnostic description of an HTTP API that lets "both humans and computers" understand what a service does without reading its source. One description generates the reference pages, the [SDKs](/docs/api-design/sdk-design), mock servers and contract tests, so all of them agree because they share a source.

- **The description lives in the repository** of the service it describes, reviewed in the same pull request as the handler change. Whether it's written first or generated from annotated code matters less than that CI fails when the implementation and the description disagree.
- **Lint it.** [Spectral](https://github.com/stoplightio/spectral) validates OpenAPI 2 and 3 documents against its built-in `spectral:oas` ruleset, and takes custom rules for the house style: naming, required descriptions, error shapes and the headers the [API principles](/docs/api-design/principles) require. A style guide that a linter enforces is a style guide that holds.
- **Every operation has a description and an example.** The reference is the descriptions; an endpoint documented only by its schema tells the reader the shape but not the meaning.
- **Examples are tested.** Spectral's recommended rules [`oas3-valid-media-example` and `oas3-valid-schema-example`](https://raw.githubusercontent.com/stoplightio/spectral/develop/docs/reference/openapi-rules.md) fail when an example doesn't match its schema. Matching the schema isn't the same as working against the server, so a contract test sends the examples to a running instance too: [Schemathesis](https://schemathesis.readthedocs.io/en/stable/explanations/examples/) has an examples phase that builds requests from them (and skips any that fail validation against their own schema, which is why the lint runs first).

```yaml
# .spectral.yaml
extends: ["spectral:oas"]
rules:
  operation-description: error
  oas3-valid-media-example: error
  paths-kebab-case:
    description: Paths use kebab-case.
    severity: error
    given: $.paths[*]~
    then:
      function: pattern
      functionOptions:
        match: "^(/[a-z0-9-{}]+)+$"
```

```yaml
# .github/workflows/api.yml
name: api
on: [pull_request]
permissions:
  contents: read
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: npx @stoplight/spectral-cli lint openapi.yaml --fail-severity=warn
```

### Examples That Run

The same rule applies to code examples in package docs: an example that isn't executed eventually stops working, and nobody notices until a reader copies it. Both Go and Rust make examples into tests. A Go [example function](https://pkg.go.dev/testing#hdr-Examples) with an `// Output:` comment runs under `go test` and fails when the output changes, and, by [naming convention](https://go.dev/blog/examples), it's shown in the package docs under the function it names. Rust's [documentation tests](https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html) compile and run every code block in a doc comment under `cargo test`.

```go tab="Go"
// example_test.go
package money_test

import (
	"fmt"

	"example.com/money"
)

// ExampleFormat appears in the package docs under Format,
// and go test fails if the output stops matching.
func ExampleFormat() {
	fmt.Println(money.Format(1999, "USD"))
	// Output: $19.99
}
```

```rust tab="Rust"
/// Formats an amount held in minor units (cents) for display.
///
/// # Examples
///
/// ```
/// assert_eq!(money::format(1999, "USD"), "$19.99");
/// ```
pub fn format(minor: i64, currency: &str) -> String {
    let symbol = match currency {
        "USD" => "$",
        "EUR" => "€",
        _ => "",
    };
    format!("{symbol}{}.{:02}", minor / 100, minor % 100)
}
```

For Markdown docs, the cheapest equivalent is to keep runnable snippets as real files in the repository, compiled or executed in CI, and include them into the page rather than pasting them.

## Architecture Docs and Diagrams

Architecture docs are explanation: how the system is shaped and why. They live in the repository they describe, under `docs/`, and get the same review as the code. A short `docs/architecture.md` that names the components, what each owns, how a request flows through them and where the boundaries are is worth more than a long one; [Service Boundaries](/docs/architecture/service-boundaries) covers what those boundaries should be.

- **Diagrams as text.** A diagram in a drawing tool's private format is edited by whoever has the file, which is to say nobody. Text formats change in pull requests and diff like code. [Mermaid](https://mermaid.js.org/intro/) exists precisely to help "documentation catch up with development", and [GitHub renders it](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) in Markdown directly.
- **Levels, not one giant picture.** The [C4 model](https://c4model.com/) draws a system at increasing zoom (system context, containers, components, code). Most teams need the first two and should stop there: below that, the code is the diagram, and a hand-drawn component diagram is out of date by the next refactor.
- **Date anything that will drift.** A diagram of a migration in progress says which state it shows.

Design docs and ADRs sit next to these, and the rules for them (when to write one, what goes in it, why ADRs record departures) are in [Decisions & Design Docs](/docs/development/design-docs). Runbooks live with the service and link from its alerts; their shape is in [On-Call & Runbooks](/docs/operations/on-call#runbooks). Neither is repeated here.

## Ownership and Freshness

The Software Engineering at Google book puts the problem bluntly: ["Documents without owners become stale and difficult to maintain."](https://abseil.io/resources/swe-book/html/ch10.html) Ownership is what turns "someone should update this" into a name.

- **Every doc has an owning team,** through `CODEOWNERS` for the paths it lives in. Docs changes route to the people who know whether they're true. See [Code Ownership](/docs/development/code-ownership).
- **A reviewed date on every page that can drift.** How-to guides, runbooks, architecture docs and onboarding pages carry an owner and a last-reviewed date in their frontmatter, a practice the same chapter describes as freshness metadata that triggers reminders. A scheduled job opens an issue for the owner when a page passes its review window: my default is six months for how-to and runbooks, a year for explanation. Reference generated from code needs no date; it can't drift.
- **Review means re-verify.** Bumping the date without following the steps is worse than leaving it, because it launders a stale page into a trusted one.
- **Delete dead docs.** Google's guide is plain about it: ["Dead docs are bad."](https://google.github.io/styleguide/docguide/best_practices.html) A wrong page costs more than a missing one, because the missing one sends people to ask. When a page is obsolete, delete it, or replace its content with a pointer to what superseded it. Git keeps the history for anyone who needs it.
- **Link, don't duplicate.** Two pages that explain the same thing will disagree within months. The same guide: ["Do not write your own guide to a common Google technology or process. Link to it instead."](https://google.github.io/styleguide/docguide/best_practices.html) Each fact has one home; everywhere else links to it.

```yaml
---
title: Rotate the webhook signing secret
owner: "@acme/payments"
reviewed: 2026-09-14
---
```

## Internal and Public Docs

Internal and public docs differ in audience, review and risk, so they're separate sites, even when built by the same tooling.

| | Internal | Public |
| - | -------- | ------ |
| Reader | Engineers, support, on-call | Customers, integrators, the public |
| Assumes | Access to the code and the team | Nothing but the product |
| Review | Owning team | Owning team, plus a technical writer or developer relations, plus a security pass |
| Versioning | Always current | Matches the released API and SDK versions |
| Failure mode | Stale | Wrong in public, or leaking internals |

- **Public API reference comes from the same OpenAPI description** as the internal one, with internal-only operations and fields marked and filtered out at build time, never maintained as a second copy.
- **Nothing internal leaks.** Internal hostnames, ticket links, customer names and on-call details stay out of anything that publishes externally; a build check that greps public pages for internal domains is cheap insurance.
- **Public docs are versioned with the product.** A customer pinned to an older API version reads the docs for that version, per [Versioning & Deprecation](/docs/api-design/versioning).

## Docs for Coding Agents

Coding agents are now a regular reader of a repository's documentation, and an unforgiving one: an agent doesn't ask a colleague when the README is wrong, it guesses. [AGENTS.md](https://agents.md/) is the convention for their entry point, described as "a README for agents": the setup, build and test commands, conventions and constraints an agent needs, which would clutter a README written for people. Agents read the nearest one in the directory tree, so a subproject can carry its own, and the format is now maintained by the Agentic AI Foundation under the Linux Foundation.

- **Keep it short and imperative.** Commands that work, conventions that aren't obvious from the code, things never to do, and how to verify a change. Long explanation belongs in the docs it links to.
- **Same rules as every other doc:** in the repository, reviewed, owned, and corrected when it's wrong. When an agent makes the same mistake twice, the fix is a line in this file.
- **Good human docs are good agent docs.** Explicit commands, one home per fact and no tribal knowledge help both readers. The difference is that an agent exposes a gap immediately, which makes it a useful test of the docs.

What goes in the file, and how it fits with CI checks and escalation rules, is in [AI-Assisted Development](/docs/development/ai-assisted-development#standards-live-in-the-repo).

## Measuring Usefulness

Page views measure traffic, not usefulness: the most-read page may be the one people return to because it never answers the question. DORA measured documentation quality through survey questions about attributes like clarity, findability and reliability, and the same questions work as a periodic team survey. Day to day, I watch signals that point at specific pages:

- **Repeated questions.** A question asked twice in chat is a missing or unfindable doc. The person who answers it writes or links the doc and answers with the link.
- **Searches with no results** on the docs site, which list exactly what readers expected to find.
- **Onboarding time:** clone to running and time to first merged pull request for new engineers, and the list of things they had to ask. See [Onboarding](/docs/leadership/onboarding).
- **Page feedback:** a "was this helpful?" control with a free-text box, routed to the page's owner.
- **Incidents that cite a doc,** a runbook step that was wrong or missing, recorded as an action item against that page.

Each signal ends in a change to a specific page, or it isn't worth collecting.

## References

**Specifications**

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html), the standard description of HTTP APIs that reference docs and SDKs are generated from
- [AGENTS.md](https://agents.md/), the open format for instructions to coding agents, and its precedence rules
- [Development Container Specification](https://containers.dev/), for docs whose setup step is "open the folder"

**Reference**

- [Diátaxis](https://diataxis.fr/), the four kinds of documentation; see also [the compass](https://diataxis.fr/compass/) and [getting started](https://diataxis.fr/start-here/)
- [Spectral](https://github.com/stoplightio/spectral), linting OpenAPI documents with built-in and custom rulesets
- [Spectral: OpenAPI rules](https://raw.githubusercontent.com/stoplightio/spectral/develop/docs/reference/openapi-rules.md), including the example-validation rules
- [Schemathesis: Examples](https://schemathesis.readthedocs.io/en/stable/explanations/examples/), sending schema examples to a running API
- [Go testing: Examples](https://pkg.go.dev/testing#hdr-Examples), example functions verified by `go test`
- [The Go Blog: Testable Examples in Go](https://go.dev/blog/examples), how examples attach to the identifiers they document
- [rustdoc: Documentation tests](https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html), doc comment code run by `cargo test`
- [lychee](https://lychee.cli.rs/), a fast link checker for Markdown and HTML
- [Vale](https://vale.sh/), a prose linter for style guides
- [Mermaid](https://mermaid.js.org/intro/), diagrams written as text
- [GitHub: Creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams), Mermaid rendered in Markdown
- [C4 model](https://c4model.com/), architecture diagrams at four levels of zoom
- [GitHub: About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes), what a README covers and where GitHub looks for one
- [Backstage: TechDocs](https://backstage.io/docs/features/techdocs/), docs-like-code published into a developer portal

**In practice**

- [Write the Docs: Docs as Code](https://www.writethedocs.org/guide/docs-as-code/), writing docs with the same tools and workflow as code
- [Google: Documentation Best Practices](https://google.github.io/styleguide/docguide/best_practices.html), docs in the same change, deleting dead docs, linking over duplicating
- [Google: READMEs](https://google.github.io/styleguide/docguide/READMEs.html), what a package README must contain
- [Software Engineering at Google, Chapter 10: Documentation](https://abseil.io/resources/swe-book/html/ch10.html), owners, freshness dates and document types
- [DORA: Documentation quality](https://dora.dev/capabilities/documentation-quality/), the link between documentation and delivery performance
