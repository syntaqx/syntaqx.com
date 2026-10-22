+++
title = "Threat Modeling"
description = "A lightweight threat model for every new service or trust boundary: four questions, a data flow diagram, a STRIDE pass, and mitigations tracked as work."
category = "Security"
order = 9
tags = ["security", "threat-modeling", "stride", "design"]
+++

A threat model is a design review with an attacker in the room. It finds the problems that are cheap to fix on a whiteboard and expensive to fix in production. It doesn't need a specialist or a week: an hour with the people building the thing, once, at the right time.

## When to Do One

Write a threat model when a change:

- Adds a new service, or a new way into an existing one (a public endpoint, a webhook receiver, a queue consumer).
- Creates or moves a **trust boundary**: data crosses from a less trusted zone into a more trusted one.
- Touches authentication, authorization, money, or personal data.
- Adds a third party: a vendor API, an SDK, an AI model, an MCP server.

It belongs in the [design doc](/docs/engineering/design-docs), as its own section, reviewed with the rest.

## The Four Questions

Adam Shostack's framing keeps it small enough to actually happen:

1. **What are we working on?** Draw it.
2. **What can go wrong?** Walk it with STRIDE.
3. **What are we going to do about it?** Mitigate, accept, or transfer each threat.
4. **Did we do a good job?** Check the mitigations shipped, and revisit when the design changes.

## Draw the System

A data flow diagram with four kinds of things:

| Element | Example |
| ------- | ------- |
| External entity | A browser, a partner's server, a payment processor |
| Process | The API, a worker, the AI agent |
| Data store | Postgres, Redis, an S3 bucket, a log index |
| Data flow | An HTTPS request, a queue message, a webhook |

Then draw the **trust boundaries**: dashed lines wherever trust changes. The internet and your edge. Your API and a vendor. A tenant's data and another tenant's. User-supplied text and the model that reads it. Every flow that crosses a boundary is where the threats are.

## What Can Go Wrong: STRIDE

For each element and each flow across a boundary, ask the six questions:

| Threat | Violates | Ask | Typical mitigation |
| ------ | -------- | --- | ------------------ |
| **S**poofing | Authentication | Can someone pretend to be a user, a service, or a webhook sender? | [Authentication](/docs/api-design/authentication), signed [webhooks](/docs/payments/webhooks) |
| **T**ampering | Integrity | Can data be changed in transit or at rest? | TLS, signatures, append-only records |
| **R**epudiation | Non-repudiation | Can someone deny doing something we can't prove? | Audit logs with [request IDs](/docs/operations/observability) |
| **I**nformation disclosure | Confidentiality | Can data leak to someone who shouldn't see it? | Authorization, [redaction](/docs/payments/sensitive-data), encryption |
| **D**enial of service | Availability | Can someone exhaust a resource? | [Rate limits](/docs/operations/rate-limiting), size limits, timeouts |
| **E**levation of privilege | Authorization | Can someone do more than they're allowed? | Object-level checks, least privilege, [tenant isolation](/docs/architecture/multi-tenancy) |

Not every letter applies to every element. A data store can't be spoofed, but it can be tampered with, leaked, or filled up.

## Rate and Decide

Score each threat by **likelihood times impact**, each from 1 (low) to 3 (high). Anything at 6 or above gets a mitigation before launch. A 3 or 4 gets a ticket. Below that, write down that you accept it and why.

Don't argue about decimal points. The scoring exists to sort the list, not to be precise.

## The Output

A threat model that ends as a document has failed. It ends as **work**:

- Each mitigation becomes a tracked ticket, linked from the design doc, with an owner.
- Accepted risks are listed with the reason and a date to revisit.
- Launch checks that the "before launch" mitigations shipped.

## Template

```markdown
## Threat Model

**System:** one sentence. **Diagram:** link or embed.
**Trust boundaries:** list each, and what crosses it.

| # | Element / flow | STRIDE | Threat | L | I | Score | Decision | Ticket |
| - | -------------- | ------ | ------ | - | - | ----- | -------- | ------ |
| 1 | Webhook receiver | S | Forged events | 3 | 3 | 9 | Verify signatures | #123 |

**Accepted risks:** threat, reason, revisit date.
**Reviewed by:** names, date.
```

## Keep It Alive

Revisit the model when the design changes, after a security incident (see [Postmortems](/docs/engineering/postmortems)), and when an [AI system](/docs/security/ai-security) gains a new tool or data source. A stale threat model is worse than none, because people trust it.

## References

**Reference**

- [OWASP: Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html), data flow diagrams, STRIDE and the process end to end
- [Microsoft: Threat Modeling Tool threats](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats), the STRIDE categories and the properties they violate

**In practice**

- [Adam Shostack: Four Question Framework](https://github.com/adamshostack/4QuestionFrame), the four questions this process is built on
- [Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/), values and principles for keeping threat modeling practical
