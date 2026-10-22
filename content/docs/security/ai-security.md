+++
title = "AI & LLM Security"
description = "Building with LLMs and agents safely: the OWASP Top 10 for LLM Applications, why prompt injection is unsolved, and designing so it can't do damage."
category = "Security"
order = 9.4
tags = ["security", "ai", "llm", "agents"]
+++

A language model follows instructions, and it can't reliably tell your instructions from instructions hidden in the data it reads. That's not a bug to be patched. It's how the technology works today, so the job is designing systems where a manipulated model can't do much harm.

## Prompt Injection Is Unsolved

- **Direct injection:** a user types "ignore your previous instructions".
- **Indirect injection:** the instructions arrive inside content the model reads: a web page, an email, a PDF, a code comment, a tool's output, a support ticket. The user never sees them.

Filters and "please ignore malicious instructions" in the system prompt reduce it; nothing eliminates it. Plan as if any model that reads untrusted content can be turned against you.

## The Lethal Trifecta

Simon Willison's test for when injection becomes a data breach. An agent is dangerous when it has all three:

1. **Access to private data.**
2. **Exposure to untrusted content.**
3. **The ability to communicate externally.**

Remove any one and the worst case shrinks dramatically. If an agent needs all three, it needs a human in the loop.

## Design Rules

- **Model output is untrusted input.** Validate it against a schema, encode it before rendering (HTML, Markdown, SQL, shell), and never pass it to `eval`, a shell, or a query string.
- **Least-privilege tools.** Give each tool the narrowest permission that works: read-only where possible, scoped to the current user and tenant, never an admin token.
- **Humans confirm side effects.** Sending, paying, deleting, publishing and granting access require explicit confirmation of exactly what will happen.
- **No secrets in prompts.** Assume the system prompt and context will leak. Credentials live in the tool layer, never in text the model sees.
- **Block exfiltration channels.** A model that can render a Markdown image or link can leak data in the URL. Restrict which domains rendered links and images may load from (CSP helps, see [Security Headers & CSP](/docs/security/security-headers)).
- **Sandbox execution.** Code an agent writes runs in an isolated container with no credentials and restricted network egress.
- **Limit consumption.** Rate limits, token budgets and spend caps per user, so abuse costs you a bounded amount. See [Rate Limiting](/docs/operations/rate-limiting).
- **Log and evaluate.** Keep prompts, tool calls and outputs (redacted) with [request IDs](/docs/operations/observability), and run regression evals that include known injection attempts.

## The OWASP Top 10 for LLM Applications (2025)

| Risk | What it means | Primary defense |
| ---- | ------------- | --------------- |
| LLM01 Prompt Injection | Input changes the model's behavior | The design rules above; assume it will happen |
| LLM02 Sensitive Information Disclosure | The model reveals data it shouldn't | Only give it data the current user may see |
| LLM03 Supply Chain | Compromised models, datasets, plugins or MCP servers | Pin and review them like any dependency |
| LLM04 Data and Model Poisoning | Training or retrieval data is manipulated | Control and audit what goes into fine-tuning and indexes |
| LLM05 Improper Output Handling | Output is used without validation | Treat output as untrusted input |
| LLM06 Excessive Agency | The model can do too much | Least-privilege tools, confirmation for side effects |
| LLM07 System Prompt Leakage | The system prompt reveals secrets or logic | Keep secrets and authorization out of prompts |
| LLM08 Vector and Embedding Weaknesses | Retrieval leaks across users or is poisoned | Enforce access control in retrieval, per tenant |
| LLM09 Misinformation | Confident, wrong output is trusted | Ground answers in sources, show them, keep humans reviewing |
| LLM10 Unbounded Consumption | Requests run up unbounded cost | Rate limits, budgets and timeouts |

## Agents, Tools and MCP

Tools are where a model's words become actions, so tools get the strictest review.

- **Every tool and MCP server is a dependency,** with the same vetting, pinning and update discipline as any other. See [Dependency Management](/docs/engineering/dependencies).
- **Never pass a user's token through** to a downstream API. The MCP specification forbids token passthrough: a server only accepts tokens issued for it.
- **Ask for the smallest scopes** and elevate only when a privileged action is first attempted.
- **Run local tools sandboxed,** with the exact command shown to the user before it runs.
- **Re-threat-model** whenever an agent gains a new tool or data source. See [Threat Modeling](/docs/security/threat-modeling).

## AI on the Other Side

Attackers use the same models: to find vulnerabilities, write exploits faster, and personalize phishing. The response isn't AI-specific. It's patching quickly ([Vulnerability Management](/docs/security/vulnerability-management)), keeping authorization correct ([API Security](/docs/security/api-security)), and making sure the AI tools you build with are held to the same review as human-written code ([AI-Assisted Development](/docs/engineering/ai-assisted-development)).

## References

**Specifications**

- [OWASP: Top 10 for LLM Applications (2025)](https://genai.owasp.org/llm-top-10/), the ten risks and their names
- [Model Context Protocol: Security Best Practices](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices), token passthrough, confused deputy, SSRF and local server risks

**Reference**

- [OWASP: LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html), direct and indirect injection and mitigations
- [MITRE ATLAS](https://atlas.mitre.org/), adversary tactics and techniques against AI systems
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework), governing AI risk across an organization

**In practice**

- [Simon Willison: The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), private data, untrusted content and external communication
- [Google Project Zero: From Naptime to Big Sleep](https://projectzero.google/2024/10/from-naptime-to-big-sleep.html), AI finding real vulnerabilities
