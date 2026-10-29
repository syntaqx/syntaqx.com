+++
title = "AI Agents in the Product"
description = "Agents that act for customers and operators: narrow tools, typed results, decisions in code, identity checks, handoff, evals, auditing and the law."
category = "Architecture"
order = 411
tags = ["architecture", "ai", "agents", "llm", "audit"]
aliases = ["ai-agents"]
+++

An agent that only chats is a content feature. One that books the appointment, refunds the subscription, freezes the card or mutes the player is a new kind of actor in your system, and it needs everything a new actor needs: limited permissions, checks it can't talk its way around, a record of what it did and a way to hand the work to a person. The model is the easy part; the layer around it is ordinary engineering.

The shape every serious implementation converges on: **the model holds the conversation and proposes actions through a small set of tools; your code decides whether each action happens; every step lands in an audit record.** This chapter covers that shape for customer-facing agents (support, booking, billing) and operator-facing ones (moderation queues, dispatch suggestions), in any industry. Defending the model against manipulation is in [AI & LLM Security](/docs/security/ai-security), which this chapter assumes rather than repeats.

## Tools, Not Database Access

Give the agent the same API your own customer-facing UI uses, then narrow it further. Not a SQL connection, not an admin token, not "the internal API, it's easier." The customer UI's API already scopes every request to one account and enforces the business rules; the agent inherits all of it for free.

A SaaS billing support agent might get four tools:

```json
[
  { "name": "get_subscription", "input": { } },
  { "name": "list_invoices", "input": { "limit": "integer" } },
  { "name": "request_plan_change", "input": { "plan_id": "string", "effective": "now | period_end" } },
  { "name": "hand_off", "input": { "reason": "refund_request | dispute | cancel_request | other", "summary": "string" } }
]
```

Notice what's missing:

- **No account ID.** The account comes from the authenticated session, not from the model. A tool that accepts `account_id` lets a confused or manipulated model act on someone else's account, which is the [object-level authorization](/docs/security/authorization#where-checks-belong) bug in a new costume.
- **No free-form amounts or dates.** The agent picks a plan from the catalog; it can't invent a price, a discount or a refund amount.
- **No refund tool at all.** Refunds go to a person through `hand_off`. You add the tool later, with a cap, once evals and audit records show the agent handles the simpler actions well.
- **Choices come from the system.** A home-services booking agent gets `list_slots`, which returns only slots the availability engine already accepts, and `request_booking` takes a `slot_id` from that list. The model chooses among valid options instead of composing one.

My rule: **every tool is reviewed like a new endpoint,** because it changes what the agent can do to customers.

## Typed Results

Each tool returns a typed result the model must relay, not prose it can paraphrase into something else. Distinguish the outcomes the customer needs to hear differently:

```go tab="Go"
// One of Booked, SlotTaken, Denied or Failed; the unexported method seals the set.
type BookingResult interface{ bookingResult() }

type Booked struct {
	BookingID string    `json:"booking_id"`
	StartsAt  time.Time `json:"starts_at"`
	EndsAt    time.Time `json:"ends_at"`
}
type SlotTaken struct {
	Alternatives []Slot `json:"alternatives"`
}
type Denied struct {
	Rule string `json:"rule"` // outside_service_area, requires_staff or value_cap
}
type Failed struct {
	Retryable bool `json:"retryable"`
}

func (Booked) bookingResult()    {}
func (SlotTaken) bookingResult() {}
func (Denied) bookingResult()    {}
func (Failed) bookingResult()    {}
```

```rust tab="Rust"
#[derive(Serialize)]
#[serde(tag = "status", rename_all = "snake_case")]
enum BookingResult {
    Booked { booking_id: String, starts_at: String, ends_at: String },
    SlotTaken { alternatives: Vec<Slot> },
    Denied { rule: DenialRule },
    Failed { retryable: bool },
}

#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
enum DenialRule { OutsideServiceArea, RequiresStaff, ValueCap }
```

```ts tab="TypeScript"
type BookingResult =
  | { status: "booked"; booking_id: string; starts_at: string; ends_at: string }
  | { status: "slot_taken"; alternatives: Slot[] }
  | { status: "denied"; rule: "outside_service_area" | "requires_staff" | "value_cap" }
  | { status: "failed"; retryable: boolean };
```

- **Re-check at write time.** The slot offered thirty seconds ago may be gone; `request_booking` validates again and says so, rather than trusting what the model remembers.
- **Denied isn't failed.** A denial is a policy working as intended, and the agent should explain it or hand off. A failure is your bug or an outage, and the agent should say it couldn't complete the action, never that it did.
- **The confirmation comes from the result.** "You're booked for Tuesday, 9 to 11" is read from `starts_at` and `ends_at` (formatted in the customer's zone, per [Time & Date Formats](/docs/fundamentals/time)), not from what the model believes it requested. Validate model output against a schema before acting on it, as you would any [untrusted input](/docs/security/ai-security#design-rules).

## Decide in Code

The model decides what to propose. Deterministic code decides what happens. Everything that is a rule lives outside the prompt, because a prompt is a suggestion the model usually follows and a policy check is not.

- **Permissions per action, off by default.** Booking, rescheduling, cancelling and changing payment details are separate switches, each enabled deliberately and scoped further (per service type, per plan, per region). [AI in Field Operations](/books/field-operations/ai-in-field-operations) shows one industry's version, with toggles per capability and per job type.
- **Caps.** Maximum order or refund value, maximum credit a game support agent may grant, no same-day emergency slots, no actions on accounts flagged for fraud review. Caps are configuration with an owner, not numbers in a prompt.
- **One policy function.** The tool handler calls the same policy layer every other caller goes through, with the agent as the actor: `can(actor, action, resource)`. That's the [Authorization](/docs/security/authorization) chapter's rule, and it means a policy change applies to the UI, the API and the agent at once.
- **Reversible actions can be automatic; irreversible ones get a person.** A moderation agent can hide a reported chat message pending review or apply a short mute, because both undo cleanly. A permanent ban, a forfeited balance or a cancelled contract goes to a human queue with the agent's reasoning attached.
- **Policies, not prompts.** "Offer to pause before cancelling" is a step in the cancellation flow your code enforces, not a sentence in the system prompt you hope survives the next model upgrade.

## Identity Before Account Actions

An agent on a phone line or an anonymous chat widget doesn't know who it's talking to. Match the verification to what the action can do:

| Action | Verification |
| --- | --- |
| Store hours, outage status, game patch notes | None |
| Booking an appointment for the number on file | Caller ID or a logged-in session, re-confirmed by name or address |
| Reading balances, order history, recent transactions | A logged-in session, or a one-time code to the contact on file |
| Changing payment methods, cancelling a contract, freezing or replacing a card | Step-up: a fresh one-time code or an in-app confirmation |

Caller ID is spoofable and chat is anonymous, so the strong checks happen through a channel the account already owns. A bank's card-freeze agent sends a push to the bank's app ("Freeze card ending 4417?") and freezes only when the customer approves there, so the decision is authenticated by the app, not by how convincing the caller sounded. Prefer actions whose worst case is mild for the weak tiers: a freeze is safe to make easy, an unfreeze is not.

Never let the model hear, read or repeat card numbers, bank details or one-time codes. Send a payment link or route the customer to a secure capture step outside the conversation, so those values never reach transcripts ([Phone Payments](/books/payments/phone-payments), [Sensitive Data](/docs/payments/sensitive-data)).

## Emergencies Skip the Model

Some conversations must never wait on a model's judgment: a gas smell or flooding for a home-services company, a lost card being used right now for a bank, a player describing self-harm or a threat for a game studio. These go to a person or a fixed procedure immediately.

- **Detect with deterministic triggers first** (keywords, a menu option, a dedicated number), and a classifier second as an additional net, not the only one.
- **The trigger acts outside the model.** It transfers the call, opens the incident, or blocks the card through the same safe path a customer's app button uses. The model's next turn isn't consulted.
- **Test these first in every eval run,** because a regression here is the one that hurts someone.

## Human Handoff Is a Product Feature

A handoff isn't the agent failing; it's the agent doing its job, and the customer judges you by it. A good one has three properties:

- **The human gets context.** The summary, the transcript, the verified identity and every tool call the agent made, including denials. The customer never repeats themselves.
- **It's available whenever asked.** "Talk to a person" works at any point, in any phrasing, without a gauntlet of retention offers. When no one is staffed, the agent says when someone will respond and creates the ticket.
- **It's measurable.** Handoff reasons are an enum (`refund_request`, `dispute`, `emergency`, `customer_asked`, `low_confidence`), so you can see which ones grow and which tools would remove them.

Operator-facing agents invert the direction. A dispatch assistant or a moderation triage agent proposes, and a person accepts, edits or dismisses each proposal from a queue. Record which: an accepted proposal is the operator's decision, an edited one is evidence of where the agent is wrong, and a stream of dismissals is a signal to fix or remove the feature.

## Evals

A prompt, model or tool change is a release, and it needs tests like any other. Evaluations are those tests, run before launch and before every change.

- **Scenario sets from real conversations.** Pull them from support transcripts (with consent, and redacted) plus scripted cases: new customer, existing customer, wrong region, angry customer, emergency, a second language, "am I talking to a bot?", and the edge cases Anthropic's eval guidance names: irrelevant input, overly long input and ambiguous cases "where even humans would find it hard" to agree. Its advice to favor volume, "more questions with slightly lower signal automated grading" over fewer hand-graded ones, applies here.
- **Grade in code where you can.** Did the booking land in a valid slot for the right customer? Did the plan change match the request? Did it hand off on the emergency? Did it disclose it was AI? These are exact checks against the system's state after the conversation, not opinions.
- **Grade tone and helpfulness with a model or a person,** and sample live conversations for human review every week.
- **Use the right denominator.** Measure booking rate over conversations that could have booked, resolution rate over conversations the agent was allowed to resolve. Otherwise a wave of wrong numbers or out-of-scope requests looks like a collapse, and a policy that hands off more looks like a failure.
- **Track cost per conversation.** Model tokens, telephony minutes and vendor fees per conversation, next to its outcome, because a cheaper model that hands off twice as often isn't cheaper. [Cost & FinOps](/docs/operations/cost-and-finops) covers putting it on a dashboard.
- **Include attacks.** Known injection attempts belong in the regression set ([AI & LLM Security](/docs/security/ai-security#design-rules)).

Ship changes behind a [feature flag](/docs/delivery/feature-flags) to a slice of traffic, and compare the same metrics against the old version before rolling out.

## Auditing AI Actions

When a customer says "your bot cancelled my subscription," "the AI did it" has to be the start of an answer, not the end. Record every AI-initiated action with the agent as its own actor type:

```json
{
  "id": "019a2b7c-5e10-7d3a-9f2e-6c1d8a4b0e57",
  "actor": { "type": "ai_agent", "agent": "billing-support", "model": "provider/model-2026-09", "prompt_version": "2026-10-20.3" },
  "conversation_id": "019a2b7a-1c44-7b90-8e3d-2f5a9c7e1b08",
  "channel": "web_chat",
  "is_ai_disclosed": true,
  "verification": "session",
  "tool_call": { "name": "request_plan_change", "input": { "plan_id": "team_annual", "effective": "period_end" }, "result": "changed" },
  "policy_checks": [ { "rule": "plan_change_enabled", "is_passed": true }, { "rule": "downgrade_requires_staff", "is_passed": true } ],
  "approved_by_id": null,
  "subject": { "type": "subscription", "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a" },
  "occurred_at": "2026-10-26T15:42:10Z"
}
```

- **Who acted, as what.** An actor type distinct from users, staff and integrations, carrying the model and prompt version, so a behavior change can be traced to the release that caused it.
- **What it tried, including what was refused.** Every tool call with inputs and results, denials and handoffs included. A cluster of denials is how you find a bad prompt or a missing permission.
- **Who approved.** When a person accepted a draft or a proposal, record that person, the time and whether they edited it. An unreviewed AI draft and a confirmed record are different evidence.
- **What it saw and said.** The transcript (and recording, if any), linked from every record the conversation touched.
- **Before and after,** through the same field-level history any user write gets.

Write each record to the audit store in the same transaction as the action it describes, as [Audit Trails](/docs/architecture/audit-trails#not-logs-not-events) requires for any audited write. The outbox is a delivery queue, not evidence: if analytics or evals need to react, the same transaction can also write an [event](/docs/architecture/events), shaped for its consumers. The audit records answer disputes (what was promised), attribution (who made the sale), regulators, and debugging (which prompt version started cancelling instead of pausing).

## The AI's Promises Are the Business's Promises

What the agent tells a customer binds you the way an employee's statement would. In a 2024 British Columbia Civil Resolution Tribunal case, an airline argued it shouldn't be liable for its website chatbot's description of a bereavement refund policy; the tribunal found the airline "did not take reasonable care to ensure its chatbot was accurate" and ordered it to pay.

- **Constrain the agent to what you'd put in writing.** Prices, policies and deadlines come from tools that read the current catalog or policy, not from the model's memory or a stale knowledge base.
- **Ground policy answers in a source** the agent cites, and keep that source versioned, so you can show what the policy said on the day.
- **Keep the transcript** for as long as the commitment could be disputed.

## Recordings and Transcripts Are Personal Data

A transcript holds names, addresses, account details and whatever else customers say, and a recording holds their voice. Treat both as personal data from the start.

- **Classify and redact.** Transcripts get a [classification](/docs/payments/sensitive-data#classify-every-field), and card numbers, codes and government IDs are redacted before storage (better: never collected, per the identity section above).
- **Retention and erasure.** Give transcripts and recordings a retention window tied to the records they support, and include them, plus every copy in eval sets and analytics, in the [erasure pipeline](/docs/architecture/data-retention#erasure-requests).
- **Know where they go.** Your model provider and voice vendor are processors: check what they retain, for how long, and whether they may train on it, and put it in the contract ([GDPR & Privacy](/docs/compliance/gdpr#controllers-processors-and-the-dpa)).

## The Law, at a Pointer Level

This is not legal advice, and the rules change quickly. [Consumer Contact](/docs/compliance/consumer-contact) covers them properly, and the state chatbot disclosure laws as they reach a store's support agent are in [Disclosure Laws](/books/commerce/customer-service#disclosure-laws); the engineering consequences are:

- **AI voice on outbound calls is an artificial voice.** In February 2024 the FCC ruled that AI-generated voices are "artificial" under the Telephone Consumer Protection Act, so AI outbound calls need the called party's prior express consent, which for telemarketing means prior express written consent, plus identification and, for telemarketing, an opt-out. Check consent in code before the call is placed.
- **Recording consent is state law.** Federal law permits recording with the consent of one party, but states including California, Florida and Washington require every party's consent. Announce recording on every call, everywhere, and you don't need a state table to get it right.
- **AI disclosure is spreading.** The EU AI Act's Article 50 requires systems that interact with people to tell them they're dealing with an AI; under Article 113, its transparency obligations apply from 2 August 2026. The Digital Omnibus amendments (Regulation (EU) 2026/1744) kept that date, and gave generative systems already on the market until 2 December 2026 to mark their synthetic output. Several US states have their own disclosure rules. The single behavior that satisfies them all: the agent says it's AI at the start, answers honestly when asked, and you log that it did.

## Checklist

- **Expose tools, not data:** the customer-facing API, narrowed, scoped by the session, returning only valid choices.
- **Return typed results** that distinguish done, denied, taken and failed, and confirm from the result.
- **Decide in code:** per-action permissions off by default, caps, one policy layer, humans for irreversible actions.
- **Verify identity in proportion to the action,** through a channel the account owns, and keep secrets out of the conversation.
- **Route emergencies around the model** with deterministic triggers, and test them first.
- **Design the handoff** with full context, on request at any time, with reasons as an enum.
- **Run evals before every prompt, model or tool change,** graded in code where possible, on the right denominator, with cost per conversation.
- **Audit the agent as its own actor:** model, prompt version, tool calls including denials, approver, before and after.
- **Treat what it says as binding** and transcripts as personal data with retention and erasure.
- **Disclose AI, announce recording and check outbound consent** on every conversation.

## References

**Specifications**

- [EU AI Act: Article 50](https://artificialintelligenceact.eu/article/50/), informing people they are interacting with an AI system
- [EU AI Act: Article 113](https://artificialintelligenceact.eu/article/113/), the 2 August 2026 application date
- [47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), prior express written consent for telemarketing calls with an artificial or prerecorded voice
- [18 U.S.C. 2511](https://www.law.cornell.edu/uscode/text/18/2511), the federal one-party consent rule for intercepting communications

**Reference**

- [Mayer Brown: FCC declares authority and intent to regulate AI-generated calls under the TCPA](https://www.mayerbrown.com/en/insights/publications/2024/02/fcc-declares-authority-and-intent-to-regulate-ai-generated-calls-under-the-tcpa), AI voices as "artificial," prior express consent, identification and opt-out
- [Digital Media Law Project: Recording phone calls and conversations](https://www.dmlp.org/legal-guide/recording-phone-calls-and-conversations), one-party and all-party consent states
- [Anthropic: Create strong empirical evaluations](https://platform.claude.com/docs/en/docs/test-and-evaluate/develop-tests), task-specific evals, edge cases, automated grading and volume over quality
- [Goodwin: EU AI Act transparency obligations now in force](https://goodwinlaw.com/en/insights/publications/2026/08/alerts-technology-dpc-eu-ai-act-transparency-obligations-now-in-force), Article 50 applying from 2 August 2026 and the Digital Omnibus grace period to 2 December 2026 for marking synthetic output
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework), governing AI risk, and its Generative AI Profile

**In practice**

- [Manatt: AI Gone Wild: Airline Has to Honor a Refund Policy Its Chatbot Fabricated](https://manatt.com/insights/newsletters/advertising-law/ai-gone-wild-airline-has-to-honor-a-refund-policy), a tribunal holding a business to its chatbot's statements
