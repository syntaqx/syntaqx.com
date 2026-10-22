+++
title = "AI-Assisted Development"
description = "Working with AI coding agents: a human owns every change, standards live in the repo, CI enforces them, and nothing ships until it's been run and verified."
category = "Engineering Practice"
order = 12.8
tags = ["ai", "agents", "process", "security"]
+++

Coding agents write a lot of code, fast, and most of it is plausible. Plausible isn't correct. The practices that make agents productive are the same ones that make any team productive, held to a higher standard because the agent never gets tired of producing confident output.

## A Human Owns Every Change

The agent proposes; a person ships. The engineer who merges a change owns it exactly as if they'd typed it:

- **Review every diff like a teammate's.** Read it, question it, and reject what you don't understand. "The AI wrote it" is not an explanation in a postmortem.
- **Keep changes small enough to review.** An agent will happily produce a 3,000-line diff. Ask for the same work in steps instead. See [Commits, PRs & Code Review](/docs/engineering/commits-and-reviews).
- **Decisions stay human.** Agents can draft a [design doc or ADR](/docs/engineering/design-docs) and lay out the tradeoffs; people choose.

## Standards Live in the Repo

An agent only follows rules it can read. Write them down where it looks:

- **An agent instructions file** ([`AGENTS.md`](https://agents.md/), or a tool-specific one like `CLAUDE.md`) with the project's commands, conventions and hard constraints: what not to reintroduce, what needs a human, how to verify.
- **The playbook and ADRs** in or linked from the repository, so "how we do things here" is a file, not tribal knowledge.
- **Correct the instructions, not just the output.** When an agent gets something wrong twice, the fix is a sentence in the instructions file, so every future session gets it right.

## CI Enforces, Review Confirms

Don't rely on the agent remembering the rules. Make the build fail when they're broken:

- Tests, lint and typechecks on every change. See [CI Pipelines](/docs/delivery/ci-pipelines).
- **Checks for your own conventions,** not just the language's: a test that every doc has references, that links resolve, that no response wraps data in an envelope. Rules that can be tested are rules an agent can't drift from.
- Required checks in branch protection, so a green build is a precondition, not a suggestion.

## Run It Before You Believe It

The most common agent failure is claiming success without checking. Every change is verified by running it:

- **Tests that fail first.** A test that passes before the fix proves nothing.
- **Real requests** against a running server: status codes, headers, response bodies.
- **The browser** for anything visual, in each theme and at phone width.
- **Prove the mechanism, not just the result.** A rate-limit test that passes because both instances fell back to the same in-memory counter is a false positive. Assert the state where it should be (the key in Redis), not just the number you expected.

## Plausible but Wrong

Models produce code that looks right and isn't. The usual suspects:

- **APIs that don't exist,** or existed two versions ago. Check the docs for the version you actually have installed.
- **Packages that don't exist.** Attackers register package names that models commonly invent and wait for someone to install them, an attack known as [slopsquatting](https://www.socket.dev/blog/slopsquatting-how-ai-hallucinations-are-fueling-a-new-class-of-supply-chain-attacks). Every new dependency is vetted by a person. See [Dependency Management](/docs/engineering/dependencies).
- **Insecure defaults:** string-built SQL, disabled certificate checks, secrets in code, permissive CORS. The [OWASP Top 10 for LLM applications](https://genai.owasp.org/llmrisk/llm092025-misinformation/) lists unsafe code generation among the risks of over-relying on model output.
- **Licensing and provenance.** Generated code that closely mirrors an existing project carries that project's license. Treat long verbatim-looking blocks with suspicion.

## Least Privilege for Agents

An agent with your credentials can do anything you can, at machine speed, steered by any text it reads.

- **No production secrets** in the agent's environment. Development credentials, scoped tokens, sandboxes.
- **Confirm outward actions:** pushes to shared branches, deploys, messages, anything that spends money or deletes data. Read-only work can run freely.
- **Never paste secrets into prompts.** Prompts are logged, cached and sometimes used for training. Rotate anything that slips.
- **Treat what the agent reads as untrusted.** Web pages, issues and files can contain instructions aimed at the agent. See [AI Security](/docs/security/ai-security).

## Parallel Agents, One Integrator

Independent work parallelizes well: several agents writing separate docs, or separate modules, at once. Give each a clear scope and a list of files it owns, and have one integrator (a person, or a lead agent with a person reviewing) merge the results and check them against each other. Agents working on the same files at once produce conflicts, not speed.

## Attackers Have Agents Too

The same tools that speed up development speed up vulnerability discovery. Assume known vulnerabilities in your dependencies get exploited faster than they used to, and patch accordingly. See [Vulnerability Management](/docs/security/vulnerability-management).

## This Site

Much of [syntaqx.com](https://github.com/syntaqx/syntaqx.com) was built with an AI coding agent under exactly these rules, including this playbook, the ADRs and the CI docs checks. The repository's [`AGENTS.md`](https://github.com/syntaqx/syntaqx.com/blob/main/AGENTS.md) holds its standing instructions, every change went through a pull request with required checks, and `lib/docs.test.ts` fails the build when a doc drops its references, links to a page that doesn't exist, or uses an em-dash.

## References

**Specifications**

- [AGENTS.md](https://agents.md/), the open format for instructions to coding agents

**In practice**

- [OWASP: LLM09:2025 Misinformation](https://genai.owasp.org/llmrisk/llm092025-misinformation/), hallucinated packages and unsafe code suggestions
- [OWASP: Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/), the wider set of risks when building with models
- [Socket: Slopsquatting](https://www.socket.dev/blog/slopsquatting-how-ai-hallucinations-are-fueling-a-new-class-of-supply-chain-attacks), registering package names that AI assistants invent
