+++
title = "Threat Modeling"
description = "A lightweight threat model for every new service or trust boundary: four questions, a data flow diagram, a STRIDE pass, and mitigations tracked as work."
category = "Security"
order = 9
tags = ["security", "threat-modeling", "stride", "design"]
+++

A threat model is a design review with an attacker in the room. Its value is timing: the flaws it finds cost a sentence to fix on a whiteboard and a migration to fix in production. A webhook receiver designed without signature verification is a one-line change in the design doc; the same receiver shipped, integrated with by partners and processing money is a breaking change, a coordination problem and possibly an incident.

It doesn't need a specialist or a week. It needs an hour with the people building the thing, at the moment the design is still cheap to change.

## When to Do One

Not every change needs one. Spending an hour modeling a copy change teaches the team that threat modeling is ceremony. Do one when a change:

- **Adds a way in:** a new service, a public endpoint, a webhook receiver, a queue consumer. Every entry point is something an attacker will try.
- **Creates or moves a trust boundary:** data crosses from a less trusted zone into a more trusted one. That's where assumptions break.
- **Touches authentication, authorization, money or personal data,** where a mistake is expensive by definition.
- **Adds a third party:** a vendor API, an SDK, an AI model, an MCP server. You're extending trust to code you don't control.

It lives in the [design doc](/docs/engineering/design-docs) as its own section and gets reviewed with the rest, so it happens before the code exists instead of after.

## Four Questions

The whole process fits in four questions, a framing from Adam Shostack that works because it's small enough that teams actually do it:

1. **What are we working on?** Draw it.
2. **What can go wrong?** Walk it, systematically.
3. **What are we going to do about it?** Mitigate, accept, or transfer each threat.
4. **Did we do a good job?** Check that the mitigations shipped, and revisit when the design changes.

Most failed threat models skip the first or the fourth. Without a drawing, people argue about a system they each imagine differently. Without a check, the model is a document nobody acts on.

## Draw the System

A data flow diagram, with four kinds of things:

| Element | Example |
| ------- | ------- |
| External entity | A browser, a partner's server, a payment processor |
| Process | The API, a worker, an AI agent |
| Data store | Postgres, Redis, an S3 bucket, a log index |
| Data flow | An HTTPS request, a queue message, a webhook |

Then draw the **trust boundaries**: a dashed line wherever trust changes. The internet and your edge. Your API and a vendor's. One tenant's data and another's. User-supplied text and the model that reads it.

The boundaries are the point of the drawing. Attacks happen where data crosses from something you don't control into something you do, so every flow crossing a dashed line gets examined, and flows that stay inside one zone mostly don't.

## What Can Go Wrong: STRIDE

Brainstorming threats finds the ones people already worry about and misses the rest. STRIDE turns it into a checklist: for every element and every flow across a boundary, ask six questions, one for each security property.

| Threat | Violates | Ask | Typical mitigation |
| ------ | -------- | --- | ------------------ |
| **S**poofing | Authentication | Can someone pretend to be a user, a service or a webhook sender? | [Authentication](/docs/api-design/authentication), signed [webhooks](/docs/payments/webhooks) |
| **T**ampering | Integrity | Can data be changed in transit or at rest? | TLS, signatures, append-only records |
| **R**epudiation | Non-repudiation | Can someone deny an action we can't prove they took? | Audit logs with [request IDs](/docs/operations/observability) |
| **I**nformation disclosure | Confidentiality | Can data reach someone who shouldn't see it? | Authorization, [redaction](/docs/payments/sensitive-data), encryption |
| **D**enial of service | Availability | Can someone exhaust a resource? | [Rate limits](/docs/operations/rate-limiting), size limits, timeouts |
| **E**levation of privilege | Authorization | Can someone do more than they're allowed? | Object-level checks, least privilege, [tenant isolation](/docs/architecture/multi-tenancy) |

Not every letter applies to every element. A data store can't spoof anyone, but it can be tampered with, leaked or filled up. Skipping the letters that don't apply is fine; skipping the ones that are uncomfortable is how breaches happen.

### A Worked Example

A webhook receiver that takes payment events from a processor:

- **Spoofing:** anyone can `POST` to a public URL. Without signature verification, a forged `payment.succeeded` ships goods for free. Mitigation: verify the HMAC on the raw body.
- **Tampering and replay:** a captured valid request, replayed a week later, double-credits an account. Mitigation: reject old timestamps and dedupe by event ID.
- **Denial of service:** a flood of junk requests ties up workers that verify signatures. Mitigation: cheap rejections first, rate limits, a queue in front of processing.
- **Information disclosure:** error responses that echo the payload leak card data into the sender's logs. Mitigation: return a bare status.

Four rows, an hour of discussion, and every one of them is far cheaper now than after launch.

## Rate and Decide

Score each threat by **likelihood times impact**, each from 1 (low) to 3 (high). Anything at 6 or above gets a mitigation before launch. A 3 or 4 gets a ticket. Below that, write down that you accept it and why.

The scale is deliberately coarse. The score exists to sort the list so the team spends its effort on the top, not to be precise, and a finer scale invites arguments about whether something is a 6.5 or a 7 instead of fixing it.

## The Output Is Work

A threat model that ends as a document has failed. It ends as work:

- Each mitigation becomes a tracked ticket, linked from the design doc, with an owner.
- Accepted risks are listed with the reason and a date to revisit, so "we accepted this" is a decision someone can find and question, not an accident.
- The launch checklist confirms the "before launch" mitigations actually shipped.

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

Revisit the model when the design changes, after a security incident (see [Postmortems](/docs/engineering/postmortems)), and whenever an [AI system](/docs/security/ai-security) gains a new tool or data source. A stale threat model is worse than none, because people trust it: the team believes a risk was handled when the design it was handled for no longer exists.

## References

**Reference**

- [OWASP: Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html), data flow diagrams, STRIDE and the process end to end
- [Microsoft: Threat Modeling Tool threats](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats), the STRIDE categories and the properties they violate

**In practice**

- [Adam Shostack: Four Question Framework](https://github.com/adamshostack/4QuestionFrame), the four questions this process is built on
- [Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/), values and principles for keeping threat modeling practical
