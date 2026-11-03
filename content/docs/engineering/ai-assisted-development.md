+++
title = "AI-Assisted Development"
description = "Working with AI coding agents: a person owns every change, review follows measured risk, standards live in the repo, CI enforces them, nothing ships unverified."
category = "Engineering Practice"
order = 1026
tags = ["ai", "agents", "process", "security"]
+++

Coding agents write a lot of code, fast, and most of it is plausible. Plausible isn't correct. The danger isn't that an agent makes mistakes; people do too. It's that its mistakes look exactly like its successes: same confidence, same tidy formatting, same "done". The practices that make agents productive are the ones the rest of this section already describes, held to a higher standard, because review fatigue sets in long before the agent's output slows down.

## A Human Owns Every Change

Ownership never moves to the agent. Every change has a person who owns it exactly as if they'd typed it: the engineer who merged it, or, when it merged on its own, whoever set the policy that let it. "The AI wrote it" is not an explanation in a postmortem. Owning a change doesn't mean reading every line of it; it means the depth of review matches the risk, and the risk is measured rather than guessed:

- **Read the diff where it matters.** Anything on the one-way-door list (billing, auth, data deletion, migrations, public APIs) and any area where agent changes fail often gets a person's review like a teammate's: read it, question it, reject what you don't understand.
- **Let low-risk changes merge on green, once the numbers say so.** A dependency patch, or a small fix with a test that failed before and passes after, can merge on an independent review by a different model in a different session and a green pipeline. That permission is earned per area, from the track record below.
- **Keep changes small enough to review.** An agent will happily produce a 3,000-line diff. Ask for the same work in steps instead. See [Commits, PRs & Code Review](/docs/engineering/commits-and-reviews).
- **Decisions stay human.** Agents can draft a [design doc or ADR](/docs/engineering/design-docs) and lay out the tradeoffs; people choose. A change that alters what a customer sees waits for a person, with a [preview environment](/docs/operations/environments), before it merges.

## Measure Agents Like Any Contributor

Trust in a contributor is a track record you can calibrate against, and an agent's track record only exists if you keep one.

- **Tag authorship.** Every commit records who or what wrote it (a co-author trailer) and which model reviewed it.
- **Slice the numbers you already collect** by author and by area of the codebase: change failure rate, reverts, escaped defects, review rounds before merge, and how often a person caught something both agents missed. The delivery numbers are the [DORA set](/docs/quality/metrics#delivery-stability-dora); put them on a dashboard that updates itself.
- **Turn them into policy.** Per area, write down what may merge unattended and what needs a person. Widen it one category at a time while the numbers hold, and tighten it automatically when they turn.
- **Re-baseline after every model upgrade.** A new model fixes old mistakes and makes new ones. The track record belongs to the model version, not the tool.

## Agents Review Agents

- **The reviewer is a different model, in a different session.** Two instances of the same model share the same blind spots, and a reviewer that shares the writer's context has already been talked into the change, for the same reason nobody approves their own pull request.
- **Review the tests harder than the code.** The assertions are the spec. An agent will mock the function under test or edit an assertion to match a bug; [mutation testing](/docs/quality/metrics#mutation-testing-measuring-the-tests) shows whether the tests catch anything.
- **A loop that doesn't converge is a signal.** When the reviewer keeps finding new problems after each fix, stop the loop and hand it to a person. It usually means nobody defined what done looks like.

## Standards Live in the Repo

An agent only follows rules it can read. Write them down where it looks:

- **An agent instructions file** ([`AGENTS.md`](https://agents.md/), or a tool-specific one like `CLAUDE.md`) with the project's commands, conventions and hard constraints: what not to reintroduce, what needs a human, how to verify.
- **The playbook and ADRs** in or linked from the repository. A written playbook pays off twice: the agent follows the defaults without being told, and the short list of ADRs tells it exactly where this codebase departs from them.
- **Escalation rules.** Which paths (the `CODEOWNERS` file), which kinds of change and which [one-way doors](/docs/engineering/design-docs) need a person, and what counts as customer-visible. A rule that lives in someone's head as a vague sense of unease doesn't reach the agent.
- **The architecture.** Module boundaries, where new code goes, and the rule that a new service, datastore or deployment target starts with a design doc. Left alone, an agent will build a feature as its own app with its own database, or give every handler its own function; see [Service Boundaries](/docs/architecture/service-boundaries).
- **Correct the instructions, not just the output.** When an agent gets something wrong twice, the fix is a sentence in the instructions file, so every future session gets it right. When the mistake matters, the fix is a check that makes it impossible.

## CI Enforces, Review Confirms

Don't rely on the agent remembering the rules, any more than you'd rely on engineers remembering the coding standards: people forget them too, which is why linters exist. Make the build fail when they're broken. Beyond tests, lint and typechecks as [required checks](/docs/delivery/ci-pipelines), add **checks for your own conventions**: that every doc has references, that links resolve, that no response wraps data in an envelope. Rules that can be tested are rules an agent can't drift from.

## Run It Before You Believe It

The most common agent failure is claiming success without checking. Every change is verified by running it:

- **Tests that fail first.** A test that passes before the fix proves nothing.
- **Real requests** against a running server: status codes, headers, response bodies.
- **The browser** for anything visual, in each theme and at phone width. An agent with a browser can look for itself; see [AI-Assisted Testing](/docs/quality/ai-assisted-testing).
- **Prove the mechanism, not just the result.** A rate-limit test that passes because both instances fell back to the same in-memory counter is a false positive. Assert the state where it should be (the key in Redis), not just the number you expected.
- **Evidence in the pull request,** the same as from any engineer: the commands it ran and their output, screenshots of anything visual, and for a user-facing flow a recording of the agent clicking through it. "Tests pass" is a claim; the evidence is what a reviewer checks.
- **A scheduled walk.** A browser agent works through the product every night the way a new customer would and reports what broke, what confused it and what it thinks is missing. Each failure becomes a test. Its feature suggestions are signals of where the product hurts, not a roadmap.

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

## Work Nobody Started

Agents can take work off a queue with nobody prompting them: a bug filed by support, a ticket an alert opened, a Dependabot pull request whose breaking changes need fixing. That's an [on-call rotation](/docs/operations/on-call) that doesn't sleep, and it needs the same structure one does:

- **An allowlist** of the ticket types an agent may take on its own, widened only by the track record above.
- **An owner for every queue** it pulls from, so work nobody asked for always has someone responsible for it.
- **A ticket for every run,** so what was asked, what shipped and whether it stuck land on the same ledger as everyone else's work. Work that starts in a chat session opens one too.
- **Product decisions wait.** A ticket that turns out to change what a customer sees gets a written plan approved before the work starts, or a preview environment and a question before it merges.

## Builders Outside Engineering

Product managers and designers ship real software with agents now, and that's a good thing. The tools produce a working artifact; they don't supply the judgment to see when it's wrong in a way the demo can't show: an invented package, a second database beside the real one, a service boundary crossed. Keep an engineer in that loop: a reviewer who owns the boundaries, dependencies vetted like any other, and a real escalation path for when the agent gets stuck or production breaks. Asking the agent again is not an escalation path.

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
