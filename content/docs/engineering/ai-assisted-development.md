+++
title = "AI-Assisted Development"
description = "Working with AI coding agents: a human owns every change, standards live in the repo, CI enforces them, and nothing ships until it's been run and verified."
category = "Engineering Practice"
order = 1007
tags = ["ai", "agents", "process", "security"]
+++

Coding agents write a lot of code, fast, and most of it is plausible. Plausible isn't correct. The danger isn't that an agent makes mistakes; people do too. It's that its mistakes look exactly like its successes: same confidence, same tidy formatting, same "done". The practices that make agents productive are the ones the rest of this section already describes, held to a higher standard, because review fatigue sets in long before the agent's output slows down.

## A Human Owns Every Change

The agent proposes; a person ships. The engineer who merges a change owns it exactly as if they'd typed it:

- **Review every diff like a teammate's.** Read it, question it, and reject what you don't understand. "The AI wrote it" is not an explanation in a postmortem.
- **Keep changes small enough to review.** An agent will happily produce a 3,000-line diff. Ask for the same work in steps instead. See [Commits, PRs & Code Review](/docs/engineering/commits-and-reviews).
- **Decisions stay human.** Agents can draft a [design doc or ADR](/docs/engineering/design-docs) and lay out the tradeoffs; people choose.

## Standards Live in the Repo

An agent only follows rules it can read. Write them down where it looks:

- **An agent instructions file** ([`AGENTS.md`](https://agents.md/), or a tool-specific one like `CLAUDE.md`) with the project's commands, conventions and hard constraints: what not to reintroduce, what needs a human, how to verify.
- **The playbook and ADRs** in or linked from the repository. A written playbook pays off twice: the agent follows the defaults without being told, and the short list of ADRs tells it exactly where this codebase departs from them.
- **Correct the instructions, not just the output.** When an agent gets something wrong twice, the fix is a sentence in the instructions file, so every future session gets it right.

## CI Enforces, Review Confirms

Don't rely on the agent remembering the rules; make the build fail when they're broken. Beyond tests, lint and typechecks as [required checks](/docs/delivery/ci-pipelines), add **checks for your own conventions**: that every doc has references, that links resolve, that no response wraps data in an envelope. Rules that can be tested are rules an agent can't drift from.

## Run It Before You Believe It

The most common agent failure is claiming success without checking. Every change is verified by running it:

- **Tests that fail first.** A test that passes before the fix proves nothing.
- **Real requests** against a running server: status codes, headers, response bodies.
- **The browser** for anything visual, in each theme and at phone width.
- **Prove the mechanism, not just the result.** A rate-limit test that passes because both instances fell back to the same in-memory counter is a false positive. Assert the state where it should be (the key in Redis), not just the number you expected.

## Plausible but Wrong

Models produce code that looks right and isn't. The usual suspects:

- **APIs that don't exist,** or existed two versions ago. Check the docs for the version you actually have installed.
- **Packages that don't exist.** This happens often enough to be an attack surface. A [USENIX Security 2025 study](https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen) of 16 code models found hallucinated package names in at least 5.2% of commercial models' suggestions and 21.7% of open-source models', over 200,000 unique fake names in all. Because models repeat the same inventions, attackers can register those names with malicious code and wait, an attack known as [slopsquatting](https://www.socket.dev/blog/slopsquatting-how-ai-hallucinations-are-fueling-a-new-class-of-supply-chain-attacks). Every new dependency is [vetted by a person](/docs/engineering/dependencies#adding-a-dependency).
- **Insecure defaults:** string-built SQL, disabled certificate checks, secrets in code, permissive CORS. Public code is full of these, so the most common pattern in training isn't the safe one. [OWASP](https://genai.owasp.org/llmrisk/llm092025-misinformation/) lists unsafe code generation as a consequence of over-relying on model output.
- **Licensing and provenance.** Generated code that closely mirrors an existing project carries that project's license. Treat long verbatim-looking blocks with suspicion.

## Least Privilege for Agents

An agent with your credentials can do anything you can, at machine speed, steered by any text it reads.

- **No production secrets** in the agent's environment. Development credentials, scoped tokens, sandboxes.
- **Confirm outward actions:** pushes to shared branches, deploys, messages, anything that spends money or deletes data. Read-only work can run freely.
- **Never paste secrets into prompts.** Prompts are logged, cached and sometimes used for training. Rotate anything that slips.
- **Treat what the agent reads as untrusted.** Web pages, issues and files can contain instructions aimed at the agent. See [AI Security](/docs/security/ai-security).

## Parallel Agents, One Integrator

Independent work parallelizes well: several agents writing separate docs or modules at once. Give each a clear scope and the files it owns, and have one integrator (a person, or a lead agent with a person reviewing) merge the results and check them against each other. Agents on the same files produce conflicts, not speed.

## Attackers Have Agents Too

The same tools that speed up development speed up vulnerability discovery. Assume known vulnerabilities in your dependencies get exploited faster than they used to, and patch accordingly. See [Vulnerability Management](/docs/security/vulnerability-management).

## References

**Specifications**

- [AGENTS.md](https://agents.md/), the open format for instructions to coding agents

**In practice**

- [Spracklen et al.: We Have a Package for You! (USENIX Security 2025)](https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen), how often code models invent package names
- [OWASP: LLM09:2025 Misinformation](https://genai.owasp.org/llmrisk/llm092025-misinformation/), hallucinated packages and unsafe code suggestions
- [OWASP: Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications), the wider set of risks when building with models
- [Socket: Slopsquatting](https://www.socket.dev/blog/slopsquatting-how-ai-hallucinations-are-fueling-a-new-class-of-supply-chain-attacks), registering package names that AI assistants invent
