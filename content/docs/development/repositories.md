+++
title = "Repositories & Local Development"
nav_title = "Repos & Local Dev"
description = "One repository per product, trunk-based development with short branches, one command from clone to running, and formatters and linters CI enforces."
category = "Development"
order = 1022
tags = ["process", "git", "monorepo", "local-development", "tooling"]
+++

A repository is where every engineer starts every day, so its friction is paid on every change. A setup that takes a day costs one day per new hire; a branch that lives for three weeks costs a merge nobody wants to do; a formatting argument in review costs a reviewer's attention that should have gone to the design. None of this is glamorous, and all of it compounds. The defaults here keep the daily loop short: one repository per product, one long-lived branch, one command to a running system, and machines arguing about style instead of people.

## One Repository per Product

My default is **one repository per product or team boundary**, holding every service, library, job and piece of infrastructure code that ships together. Not one repository per service, and not one repository for the whole company until there's a team whose job is making that work.

The case for keeping things together:

- **Atomic changes.** A change to a shared library and every caller lands in one pull request, reviewed and tested as a unit. Across repositories, the same change is a release, a version bump and a series of follow-up PRs, and the period in between is where things break.
- **One version of everything.** One lockfile per language means two services can't quietly depend on different versions of the same library and disagree about how it behaves. Upgrades happen once (see [Dependencies & Upgrades](/docs/development/dependencies)).
- **Refactoring is cheap.** Renaming a function across the codebase is a search and a PR, not a migration plan.
- **One place to look.** Search, onboarding, CI configuration and conventions exist once. A new engineer clones one thing.

Google's own account of its single repository ([Potvin and Levenberg, 2016](https://research.google/pubs/why-google-stores-billions-of-lines-of-code-in-a-single-repository/)) describes it as a "common source of truth" for tens of thousands of developers, and reviews the trade-offs alongside the advantages. The trade-offs are real, and they're the subject of the next section.

### What Makes One Repository Work

A monorepo without tooling becomes a slow monorepo: every change builds and tests everything, CI takes an hour, and people start asking to split it. The tooling is what keeps it fast.

- **Workspaces** so each language treats the repository as one project. A [Cargo workspace](https://doc.rust-lang.org/cargo/reference/workspaces.html) shares one `Cargo.lock` and one `target` directory across its crates; npm, pnpm and Yarn workspaces do the same for JavaScript. For Go, my default is a single module at the root (one `go.mod`, one `go.sum`), which needs nothing else. A [`go.work` file](https://go.dev/doc/tutorial/workspaces) lets you edit several modules together, but the Go reference calls committing one ["generally inadvisable"](https://go.dev/ref/mod#workspaces), because CI then tests a combination of versions no consumer will use.
- **Build only what changed.** Tools like [Nx's affected command](https://nx.dev/docs/features/ci-features/affected) compare the branch to its base in Git and run only the tasks whose inputs changed. Graph-based build systems like Bazel get the same effect from their dependency graphs and caches.
- **Cache by content, share the cache.** [Bazel's remote cache](https://bazel.build/remote/caching) keys each action by a hash of its inputs, command and environment, so a developer can reuse outputs CI or a teammate already built. [Turborepo](https://turborepo.dev/docs/crafting-your-repository/caching) does the same at the task level, hashing inputs into a fingerprint and replaying outputs and logs on a hit. Both assume tasks are deterministic; a build that embeds the time or reads the network poisons the cache.
- **Ownership by path.** A `CODEOWNERS` file routes each directory's reviews to the team that owns it, so a shared repository doesn't mean shared, diluted responsibility. See [Code Ownership](/docs/development/code-ownership).

Start with the language's native workspaces and path filters in CI. Reach for Bazel-class tooling when CI time is the bottleneck and the native tools can't express the graph, not before: it's a build system the team then has to own.

### When to Split

Separate repositories earn their cost when the boundary is real:

- **Different access.** Code that a contractor, a partner or the public can see (an open-source SDK, a client library) lives on its own, because repository permissions are coarse. The same goes for code under a stricter compliance scope, where the audit boundary is easier to defend as a repository.
- **Different release rhythm and consumers.** A library published for outside consumers, versioned with [SemVer](/docs/development/dependencies#semantic-versioning) and released on its own schedule, is a product, not internal code.
- **Different organizations.** Teams that never change code together, in different reporting lines, with nothing shared but an API, gain little from one history and pay for one CI.

Splitting because the repository "feels big" is the wrong reason. Big is a tooling problem; split is a coordination problem, and coordination is the more expensive of the two.

## Layout

Consistency beats cleverness: every repository in the organization looks the same at the top, so nobody has to learn where things live twice.

```text
.
  README.md            what it is, how to run it, where the rest lives
  AGENTS.md            commands and constraints for coding agents
  Makefile             the entry points: setup, dev, test, lint, fmt
  compose.yml          local dependencies: database, cache, queues
  .editorconfig
  .gitignore
  .github/
    CODEOWNERS
    workflows/
  .devcontainer/
    devcontainer.json
  cmd/                 one directory per binary (Go)
    api/
    worker/
  internal/            code no other module may import
  crates/              Rust workspace members
  web/                 frontend
  migrations/
  scripts/             bootstrap and seed scripts the Makefile calls
  docs/
    adr/
```

For Go, the layout follows the official [module layout guide](https://go.dev/doc/modules/layout): commands under `cmd/`, and a server's logic under `internal/`, which the compiler stops other modules from importing, so it can be refactored freely. Resist the urge to invent a `pkg/` or deep nesting the language doesn't ask for. Docs, ADRs and the agent instructions live in the repository, next to the code they describe; see [Documentation](/docs/development/documentation).

## Trunk-Based Development

Everyone integrates into one branch, `main`, at least daily. [trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/) defines it as developers collaborating "in a single branch called 'trunk'", avoiding other long-lived branches. Short-lived branches still exist, for review and CI, but each is one person's or one pair's work and lives for hours to a day or two.

[DORA's capability guide](https://dora.dev/capabilities/trunk-based-development/) states the practice in three rules: three or fewer active branches, merges to trunk at least once a day, and no code freezes or integration phases. Its research associates teams following them with higher delivery and operational performance. The mechanism is simple: merge pain grows faster than branch age. Martin Fowler's [branching patterns essay](https://martinfowler.com/articles/branching-patterns.html) puts it as "the problem with big merges is not so much the work involved with them, it's the uncertainty of that work", and teams burned by a few bad merges integrate less often, which makes the next merge worse.

What makes daily integration possible when features take weeks:

- **Small pull requests,** squash merged. See [Commits, PRs & Code Review](/docs/development/commits-and-reviews).
- **Feature flags** decouple merging from releasing: unfinished work lands on `main` dark, and turns on when it's ready. See [Feature Flags](/docs/delivery/feature-flags).
- **Branch by abstraction** for large replacements: introduce an interface, move callers to it, build the new implementation behind it, switch over, delete the old one. Each step is a normal, shippable PR.
- **A main that is always releasable.** Required checks on every PR and a [fast pipeline](/docs/delivery/ci-pipelines) are what make it safe to merge often; a red `main` is everyone's top priority.

Long-lived release branches are the exception, for software customers install and run (mobile apps, on-premises products), where old versions need patches. Even then, fixes land on `main` first and are cherry-picked back.

## One Command to a Running System

A fresh clone should reach a running system, with data, by one command. If setup is a wiki page of steps, every new hire runs a slightly different version of it, and the differences become "works on my machine".

### The Entry Points

Every repository exposes the same verbs, whatever the language underneath. GitHub's [scripts-to-rule-them-all](https://github.com/github/scripts-to-rule-them-all) pattern names them `script/bootstrap`, `script/setup`, `script/server`, `script/test`, so a contributor can work in any project without learning its internals. A `Makefile` is the common front door for the same idea:

```makefile
.PHONY: setup dev test lint fmt

setup: ## install tools, start dependencies, migrate and seed
	./scripts/bootstrap
	docker compose up --wait
	go run ./cmd/migrate up
	go run ./cmd/seed

dev: ## run the app with reload
	go run ./cmd/api

test:
	go test ./...
	cargo test --workspace

lint:
	golangci-lint run
	cargo clippy --workspace --all-targets -- -D warnings

fmt:
	gofmt -w .
	cargo fmt --all
```

The bootstrap script installs pinned tool versions (through a version manager like mise or asdf, or the language's own toolchain file such as `rust-toolchain.toml`), so the linter on a laptop is the linter in CI. CI calls the same targets, so local and CI can't drift apart.

### Dependencies in Compose

Databases, caches and queues run in containers from a `compose.yml` in the repository, the same images [CI runs as service containers](/docs/delivery/ci-pipelines#trustworthy). Healthchecks make startup order explicit, and [`docker compose up --wait`](https://docs.docker.com/reference/cli/docker/compose/up/) returns only once services are running or healthy, so the next step in `setup` doesn't race the database:

```yaml
services:
  postgres:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 2s
      retries: 30
  redis:
    image: redis:8
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 2s
      retries: 30
```

The application itself usually runs on the host, not in Compose, because a native process gives the fastest reload and the simplest debugger. Local passwords like the one above are fine because they protect nothing; anything real comes from the secrets manager, per [Environments & Configuration](/docs/operations/environments#secrets).

### Dev Containers

The [Development Container Specification](https://containers.dev/) describes a development environment as a container: base image, tools, editor extensions and setup commands in a `devcontainer.json`. Supporting editors and cloud workspaces open the repository inside it, so "install Go, Rust, Node and the right linter versions" becomes "open the folder".

```json
{
  "name": "app",
  "dockerComposeFile": ["../compose.yml", "compose.devcontainer.yml"],
  "service": "workspace",
  "workspaceFolder": "/workspace",
  "features": {
    "ghcr.io/devcontainers/features/go:1": {},
    "ghcr.io/devcontainers/features/rust:1": {}
  },
  "forwardPorts": [8080],
  "postCreateCommand": "make setup"
}
```

[`dockerComposeFile` and `service`](https://containers.dev/implementors/json_reference/) attach the workspace to the same Compose stack the host setup uses, and `postCreateCommand` runs the same `make setup`. I treat the dev container as an option alongside the host setup, not a replacement: it's the fastest path for a new hire or a cloud workspace, and a slower one for people whose editor and tools already work. One definition of setup, two ways to run it.

### Seeded Data

An empty database teaches nothing and tests nothing. `make setup` ends with a seed that creates a realistic baseline: a few tenants, users in each role, records in every interesting state, so a developer can open the app and click into a refunded order without building one by hand. The seed script, its determinism and how it scales to production volumes are covered in [Test Data & Environments](/docs/quality/test-data#seeding).

### Fast Feedback

The inner loop (edit, see the result) should take seconds:

- **Reload on save** for servers and frontends.
- **Tests that run per package,** so changing one package runs its tests in seconds, not the whole suite in minutes.
- **The same checks locally as in CI,** runnable with one target, so a push isn't the first time anyone finds out.
- **Time it.** Clone to running and edit to reload are numbers worth tracking; when they creep up, they get fixed like any other regression.

## Formatting and Linting

Style is settled once, by a tool, and never discussed again. Prettier's docs give the reason plainly: "By far the biggest reason for adopting Prettier is to stop all the on-going debates over styles." The [Go proverb](https://go-proverbs.github.io/) makes the same point: "Gofmt's style is no one's favorite, yet gofmt is everyone's favorite."

| Language | Format | Lint |
| -------- | ------ | ---- |
| Go | `gofmt` | [golangci-lint](https://golangci-lint.run/), one runner for over a hundred linters |
| Rust | [rustfmt](https://github.com/rust-lang/rustfmt) (`cargo fmt`) | [Clippy](https://doc.rust-lang.org/clippy/), with warnings denied |
| TypeScript, CSS, Markdown | [Prettier](https://prettier.io/docs/why-prettier) | ESLint |
| Everything | [EditorConfig](https://editorconfig.org/) for indentation, line endings, final newline | |

- **Defaults, barely configured.** Every option argued about is an option someone has to remember. Take the tool's defaults and change one only with a reason written next to it.
- **CI enforces, in check mode.** `gofmt -l` (fail if it lists files), `cargo fmt --all -- --check`, `cargo clippy -- -D warnings`, `prettier --check`. A rule that isn't a required check is a suggestion.
- **Pre-commit hooks for speed, not enforcement.** [pre-commit](https://pre-commit.com/) runs the same formatters before each commit so mistakes never reach CI, but hooks are local and skippable. CI runs `pre-commit run --all-files` (or the same make target) and is the actual gate.
- **Format the whole repository once,** in a single commit, when adopting a formatter, and add that commit to a [`.git-blame-ignore-revs`](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-and-understanding-files#ignore-commits-in-the-blame-view) file at the repository root so blame views skip it.
- **A review comment about style is a missing lint rule.** Add the rule; don't repeat the comment.

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.go]
indent_style = tab

[Makefile]
indent_style = tab
```

```yaml
# .github/workflows/lint.yml
name: lint
on: [pull_request]
permissions:
  contents: read
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version-file: go.mod
      - run: test -z "$(gofmt -l .)"
      - uses: golangci/golangci-lint-action@v9
      - run: cargo fmt --all -- --check
      - run: cargo clippy --workspace --all-targets -- -D warnings
```

## What Never Gets Committed

`.gitignore` covers build output, dependencies, local environment files and editor state. Editor and OS clutter (`.DS_Store`, swap files) belongs in each developer's global ignore file ([`core.excludesFile`](https://git-scm.com/docs/gitignore)), not in every repository. Two details matter:

- **Ignoring doesn't untrack.** `.gitignore` has no effect on files Git already tracks; `git rm --cached` removes one from the index first.
- **Commit the example, not the file.** `.env.example` with every variable and safe placeholder values is committed; `.env` is ignored.

Secrets never enter the repository, not even briefly, because history keeps them. [Push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection) blocks pushes containing recognizable credentials before they land, and every bypass leaves an alert and an audit entry. [Secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) covers what got through, across the entire history of every branch. Both run on every repository. When a secret does land, the fix is to revoke and rotate it immediately; GitHub's own guidance treats rewriting history as optional once the credential is dead, because a copy may already exist anywhere the repository was cloned. Where secrets do live is covered in [Environments & Configuration](/docs/operations/environments#secrets).

## The README Is the Front Door

The README is the first file anyone opens, so it does one job: get them oriented and running. What it is, who owns it, the one command to run it and the one to test it, and links to everything else. The full checklist is in [Code Ownership](/docs/development/code-ownership#what-every-readme-contains); how it fits with the rest of a repository's docs is in [Documentation](/docs/development/documentation).

## References

**Specifications**

- [Development Container Specification](https://containers.dev/), the open spec behind `devcontainer.json`
- [Dev Container metadata reference](https://containers.dev/implementors/json_reference/), `dockerComposeFile`, `service`, `features` and lifecycle commands
- [EditorConfig](https://editorconfig.org/), shared indentation, charset and line-ending rules across editors

**Reference**

- [Cargo: Workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html), one lockfile and output directory for many crates
- [Go: Tutorial, multi-module workspaces](https://go.dev/doc/tutorial/workspaces), `go.work` for editing modules together
- [Go Modules Reference: Workspaces](https://go.dev/ref/mod#workspaces), why committing `go.work` is generally inadvisable
- [Go: Organizing a Go module](https://go.dev/doc/modules/layout), `cmd/` and `internal/` layout
- [Bazel: Remote Caching](https://bazel.build/remote/caching), sharing build outputs keyed by action hash
- [Turborepo: Caching](https://turborepo.dev/docs/crafting-your-repository/caching), task fingerprints and a shared remote cache
- [Nx: Affected](https://nx.dev/docs/features/ci-features/affected), running only the tasks a change touches
- [Docker Compose: Control startup order](https://docs.docker.com/compose/how-tos/startup-order/), healthchecks and `service_healthy`
- [Docker Compose: up](https://docs.docker.com/reference/cli/docker/compose/up/), the `--wait` flag
- [golangci-lint](https://golangci-lint.run/), Go linters run in parallel with caching
- [rustfmt](https://github.com/rust-lang/rustfmt), Rust formatting and `--check` in CI
- [Clippy](https://doc.rust-lang.org/clippy/), Rust lints
- [Prettier: Why Prettier?](https://prettier.io/docs/why-prettier), ending style debates
- [pre-commit](https://pre-commit.com/), multi-language Git hooks, and running them in CI
- [Git: gitignore](https://git-scm.com/docs/gitignore), ignore rules, tracked files and `core.excludesFile`
- [GitHub: Ignore commits in the blame view](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-and-understanding-files#ignore-commits-in-the-blame-view), `.git-blame-ignore-revs` for formatting commits
- [GitHub: About push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection), blocking secrets at push time
- [GitHub: About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning), scanning full history, and revoking leaked credentials

**In practice**

- [Trunk Based Development](https://trunkbaseddevelopment.com/), the branching model, short-lived branches and branch by abstraction
- [DORA: Trunk-based development](https://dora.dev/capabilities/trunk-based-development/), the three practices and their link to delivery performance
- [Martin Fowler: Patterns for Managing Source Code Branches](https://martinfowler.com/articles/branching-patterns.html), integration frequency and merge fear
- [Potvin and Levenberg: Why Google Stores Billions of Lines of Code in a Single Repository](https://research.google/pubs/why-google-stores-billions-of-lines-of-code-in-a-single-repository/), the monorepo's advantages and trade-offs at scale
- [GitHub: Scripts to Rule Them All](https://github.com/github/scripts-to-rule-them-all), normalized bootstrap, setup, server and test scripts
- [Go Proverbs](https://go-proverbs.github.io/), "gofmt's style is no one's favorite"
