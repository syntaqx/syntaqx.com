+++
title = "Customer Support Operations"
description = "Running support as a system: channels, tickets with states and context, classify and route, macros, bots that hand off, escalation, metrics and QA."
category = "Operations"
order = 1210
tags = ["operations", "support", "customer-service", "automation", "tickets"]
+++

Support is where every other system shows up when it fails. A charge that went through but didn't unlock anything, an account taken over, a decision the customer thinks was wrong, an outage that hit at dinner time: each one becomes a contact from someone who is usually frustrated and sometimes not who they say they are. Support has the volume of a consumer product, the spikes of every launch and incident, and staff who can change accounts and move money.

This chapter is support as an engineered system: the channels, the ticket and what it carries, how contacts are classified and routed, the automation that answers what can be answered and hands off the rest, how support escalates to engineering, and the numbers that say whether it works. The staff side of data access is [Support Access & Internal Tools](/docs/security/support-access); the rules for automated agents are in [AI Agents in the Product](/docs/architecture/ai-agents).

## Channels

Customers reach support through more doors than most teams plan for:

| Channel | Strengths | Costs |
| --- | --- | --- |
| Help center (web, and inside the product) | Answers common questions without a contact; searchable; localized once | Goes stale after every release unless someone owns it |
| Ticket form | Structured fields, attachments, asynchronous | Customers pick the wrong category; slow by design |
| In-product entry point | The product fills in context; no app switch | A surface to build, update and localize on every platform |
| Chat or messaging | Fast for simple cases | Staffing across time zones; long sessions for hard cases |
| Email | Universal, asynchronous | Unstructured, easy to spoof, hard to authenticate |
| Phone | Fastest for urgent and complex cases; required in some industries | The most expensive minute in support; recording and payment rules apply |
| Community (forums, social) | Scales through other customers; spots outages early | Never a channel for anything involving an account |
| Platform or partner support | App stores, marketplaces and resellers own their transactions | You don't control the outcome, and you still get the upset customer |

My default: an in-product entry point that deep-links to the right article or form, a public help center with the same articles for people who can't sign in, and a ticket form or messaging behind both. Phone where the business or the law needs it, with the same ticket underneath. Community channels for announcements and peer help, and a standing reply that moves any account question into a private channel.

Every channel feeds **one ticket model**. A customer who emails, then chats, then calls is one person with one problem, and an agent who can't see the email has to ask again.

## The Ticket

A ticket is a record of one problem for one customer, with a conversation attached. The conversation usually lives in a helpdesk product; the product's own database keeps the fields the business needs to route, act on and report on:

```sql
CREATE TABLE support_tickets (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  account_id        UUID REFERENCES accounts (id),   -- null when the customer can't sign in
  channel           TEXT NOT NULL CHECK (channel IN
                      ('in_product', 'web_form', 'messaging', 'email', 'phone', 'partner')),
  category          TEXT NOT NULL,
  category_source   TEXT NOT NULL CHECK (category_source IN ('customer', 'classifier', 'agent')),
  priority          TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  locale            TEXT NOT NULL,
  state             TEXT NOT NULL DEFAULT 'new' CHECK (state IN
                      ('new', 'waiting_on_agent', 'waiting_on_customer',
                       'waiting_on_third_party', 'solved', 'closed')),
  assignee          TEXT,                            -- typed actor: 'agent:<id>', 'bot:<flow>'
  helpdesk_xid      TEXT,                            -- the helpdesk's own ticket ID
  linked_incident_id UUID,                           -- set when the cause is a known incident
  opened_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  solved_at         TIMESTAMPTZ,
  reopened_count    INTEGER NOT NULL DEFAULT 0
);
```

`account_id` is nullable because the hardest tickets come from people who can't sign in. `category_source` keeps the customer's choice apart from the classifier's and the agent's correction, which is how you measure each.

### Ticket States

States exist to answer one question: whose move is it? Zendesk's defaults are a good public reference: **Pending** means the agent is "waiting on information from the requester", **On-hold** means waiting on "someone other than the requester", such as a supervisor or developer, and **Solved** gives the interaction a defined end ([Zendesk: About ticket fields](https://support.zendesk.com/hc/en-us/articles/4408843029658-About-Zendesk-Support-ticket-fields)). The machine I use maps onto that:

- `new` becomes `waiting_on_agent` once it's classified and routed.
- An agent's reply moves it to `waiting_on_customer`; the customer's reply moves it back.
- `waiting_on_third_party` is for escalations to engineering, a partner or a payment processor. The customer still sees it as open, and the clock on your promise keeps running.
- `solved` is set by whoever resolved it, and becomes `closed` after a quiet period with no reply. A reply inside that period reopens it to `waiting_on_agent` and increments `reopened_count`; a reply after closing starts a new ticket linked to the old one.

Tickets that become something else (a moderation report, a dispute, a security incident, a legal request) stay linked but leave this machine: their outcome is decided by that process, not by support.

### Context Comes With the Ticket

A ticket that says "it's not working" costs an agent ten minutes of questions. A ticket that arrives with the account, the plan, the platform, the version and the last few actions costs one. The product already knows most of what support needs, so send it:

- **Who:** the account, the signed-in identity, and any linked accounts, which matters when one person has several.
- **Where:** product, platform, app version or build, region, device and OS.
- **What just happened:** recent orders, payments and grants, recent errors with their request IDs ([Request IDs](/docs/observability/overview#request-ids)), active restrictions, and open incidents affecting this customer.
- **Locale and any age or vulnerability flags,** so the ticket reaches an agent who speaks the language and the handling that fits.

Collect it on the server wherever possible: the entry point passes an authenticated token and the support backend looks up the rest, rather than trusting fields the client fills in. Show agents a masked view by default and unmask on purpose with a reason ([Read-Only by Default](/docs/security/support-access#read-only-by-default)). And never ask for a password, and say so on the form: "support" asking for credentials is the classic phishing script, and customers who know real support never asks are harder to phish.

## Classify, Route, Answer

Customers choose the wrong category often enough to matter. Riot's public account of automating its player support is still the clearest published numbers: around 12,000 requests a day, players selecting the correct issue "about 80% of the time", responses taking up to 25 hours and resolution up to 3 days on average before automation ([Riot Games: Blitzcrank Bot](https://www.riotgames.com/en/news/blitzcrank-bot)). Routing on the customer's choice alone puts a fifth of tickets in the wrong queue, where they wait twice.

- **Classify first.** A classifier trained on solved tickets per language assigns a category and a confidence. Store both the customer's category and the classifier's, and measure how often agents correct each.
- **Route by category, language, priority and skill,** to queues with owners. Urgent categories (account takeover, safety threats, a payment taken twice) skip the line and page someone outside business hours.
- **Link to incidents.** When an incident is open, tickets matching its signature are linked to it, get the status page answer, and leave the queue together when it resolves. A spike in one category after a release is usually a bug report, not a staffing problem.
- **Deduplicate per customer.** Three contacts about the same problem in an hour are one ticket with three messages.

## Macros

A **macro** is a saved response plus the field changes that go with it: the reply text, the category, the state, sometimes a tag or an action. Macros make answers consistent and fast, and they're where policy meets the customer, so treat them as content with owners:

- **Versioned and owned.** Each macro has an owner, a last-reviewed date, and the policy or help article it reflects. A refund policy change ships with its macro changes, or agents keep promising the old policy.
- **Parameterized, not pasted.** Order numbers, dates and amounts come from the ticket's context, never retyped.
- **Localized** with the help center, by the same process.
- **Measured.** Reopen rate and satisfaction per macro show which answers don't actually answer.

A macro that performs an action (issue a credit, extend a trial) calls the same named operation an agent's button does, under the same caps.

## Bots and Deflection

Most contacts ask something the help center already answers or need an action the product could take on its own. Automation that handles those well is the best thing support can do for customers; automation that handles them badly moves work around and makes people angry.

The design from Riot's post is the one to copy:

- **Automate runbooks, not conversations.** Its example is a promotional item: check eligibility and reply if the player isn't eligible, escalate to an agent if they already own it, otherwise grant it and reply. Every branch is a rule over known data, and the odd case goes to a person. That's [Decide in Code](/docs/architecture/ai-agents#decide-in-code): the model classifies, the code acts.
- **A human one click away.** Riot added a "REQUEST A HUMAN" button "for maximum visibility" after satisfaction with bot answers lagged; handoff should work at any point, in any phrasing, with the transcript and everything the bot did attached ([Human Handoff Is a Product Feature](/docs/architecture/ai-agents#human-handoff-is-a-product-feature)).
- **Measure what the bot closes.** At the time of the post, the bot routed or answered 20% of tickets, "doing the daily work of about 50 agents". Vendors now claim far higher automation rates; treat those as marketing until measured on your own tickets, with satisfaction and reopen rate beside the automation rate. A bot that closes tickets customers reopen is moving work, not removing it.

### When a Person Must Decide

Some answers should come from a person even when a bot could produce them:

- **Denials.** Riot found satisfaction "about 20% lower" when the bot delivered a denial instead of a live agent. The answer was the same; who said it changed how it landed. Automate the yeses and the routing; let a person say no.
- **Money beyond a cap.** Refunds, credits and goodwill above a value a bot can grant, and anything that reverses a charge on a different instrument.
- **Account control.** Recovery, ownership disputes and changes to contact points; an agent verifies evidence against a written threshold and unlocks self-service, never sets a password or sign-in factor directly ([Recovery Is the Real Login](/docs/security/authentication#recovery-is-the-real-login)).
- **Safety.** Threats to life, self-harm, child safety and harassment follow the urgent path in [Trust & Safety](/docs/security/trust-and-safety), from any channel, at any hour.
- **Penalties and appeals.** Ban and suspension appeals go to the process that made the decision, reviewed by someone not involved in it; a support agent who reverses a penalty because the ticket was persuasive has bypassed that process ([Explanations and Appeals](/docs/architecture/risk-scoring#explanations-and-appeals)).

Voice agents on the phone follow the same rules, plus disclosure and recording rules that differ by jurisdiction ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)).

## Actions Are Operations

Support agents and bots act on accounts: grant, refund, credit, extend, restore, unlock. Every one of those is a **named operation** with a kind, a cap and an approval rule, called the same way by an agent's button, a macro and a bot's runbook:

```sql
CREATE TABLE support_operations (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  ticket_id       UUID NOT NULL REFERENCES support_tickets (id),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  kind            TEXT NOT NULL CHECK (kind IN
                    ('issue_credit', 'refund', 'extend_subscription', 'restore_item',
                     'unlock_recovery', 'escalate_to_engineering')),
  idempotency_key TEXT NOT NULL,          -- ticket + kind + target, so a double click acts once
  requested_by    TEXT NOT NULL,          -- 'agent:<id>', 'bot:<runbook>'
  value_minor     BIGINT,                 -- for caps and approvals
  approved_by     TEXT,                   -- required above the cap; never the requester
  status          TEXT NOT NULL CHECK (status IN ('pending_approval', 'applied', 'rejected')),
  result_ref      TEXT,                   -- the refund, ledger or entitlement record it produced
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key),
  CHECK (approved_by IS NULL OR approved_by <> requested_by)
);
```

- **The operation calls the owning service.** A refund goes through the payment service, a credit through the ledger; support never writes those tables itself ([Idempotency](/docs/payments/idempotency)).
- **Caps per actor and per day** live in configuration: a bot's runbook may grant one thing and nothing else, an agent may credit up to a value, a second person approves above it ([Approvals, and Nobody Approves Their Own](/docs/security/support-access#approvals-and-nobody-approves-their-own)).
- **Some things are deliberately not operations.** No `set_password`, no `set_email`, no `lift_ban`.

An agent with a general-purpose "edit account" screen is a support team waiting for its first insider incident. Start with a small catalog and add a kind only when a category of tickets has shown up often enough to write its runbook.

## Escalation to Engineering

Some tickets are bugs, and the path from support to engineering decides how fast they're fixed and whether the customer hears back.

- **Tiers with criteria.** Frontline support answers and acts; a specialist tier handles hard cases and reproduces bugs; engineering gets a ticket only with a reproduction or a clear trail ([what a good bug report contains](/docs/quality/defects#the-bug-report)) (account, time, request ID, steps, expected and actual). Written criteria for each hop, so escalation isn't a judgment call made under pressure.
- **One engineering ticket, many customer tickets.** The bug lives in the engineering tracker; every customer ticket it affects links to it and moves to `waiting_on_third_party`. When the fix ships, every linked customer gets an update, from a macro, the same day.
- **A severity path to incidents.** When tickets reveal something widespread (many customers, money moving wrongly, data exposed), support declares or joins an incident instead of filing a ticket ([Declare Early](/docs/operations/incident-response#declare-early)), and the incident's communications lead owns customer updates.
- **An agreed response clock.** Engineering commits to triage escalations within a stated time per priority, and support reports on it. Escalations that wait a week teach support to stop escalating.

## Complaints With Legal Clocks

Some contacts aren't just support tickets; they're complaints a regulator, a bank partner or a card network expects you to handle on a deadline. For consumer electronic fund transfers in the US, Regulation E gives the consumer 60 days after the statement to report an error, and the institution must determine whether an error occurred within 10 business days, or up to 45 days if it provisionally credits the account within those 10 business days ([12 CFR 1005.11](https://www.law.cornell.edu/cfr/text/12/1005.11)). Card complaints often become disputes, which have their own process; privacy requests, accessibility complaints and regulated-industry complaints have their own clocks.

- **Tag complaints as complaints,** with a category, an owner and an outcome, so patterns surface and the reports partners ask for write themselves.
- **Store the deadline on the ticket** when it's created, computed from the rule and its inputs, not recomputed on read ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Publish your own deadline** for everything the law doesn't cover, and keep it.

## Metrics

The useful numbers are few, and they all come from timestamps and states already on the ticket:

- **First response time,** opened to first human or substantive reply, as a distribution per category, channel and priority. The tail is what customers remember; Riot's "up to 25 hours" is the number that made its case for automation.
- **Resolution time,** opened to solved, the same way.
- **First-contact resolution:** the share of tickets solved by the first response without a reopen or a second contact. Riot reported that "70% of support requests were resolved within the first response" from an agent.
- **Satisfaction (CSAT):** a one-question survey after solving, reported per category, channel and resolver (bot, agent, macro). Response bias is real, so watch trends and differences between resolvers rather than the absolute number.
- **Reopen rate** per category and resolver: the check on answers, macros and bots that close without resolving.
- **Contacts per active user,** by category, over time, joined to releases and incidents. The goal of support isn't answering tickets fast; it's needing fewer of them. A category that grows after a release is a bug; one that stays high is a product problem support can describe better than anyone.

Never measure agents on handle time alone. It rewards closing over solving, and the reopen rate and repeat contacts are where that shows up.

## Quality Assurance and Recordings

Metrics say how fast; QA says whether the answers were right.

- **Sample and score.** A reviewer scores a random sample of solved tickets per agent, bot flow and category against a rubric: correct, complete, policy followed, actions justified, tone. Sample bot conversations at the same rate as human ones.
- **Calibrate the reviewers.** Reviewers score the same tickets periodically and compare, or the rubric means something different to each of them.
- **Close the loop.** QA findings update macros, help articles and runbooks, not only coaching notes.
- **Recordings and transcripts are personal data.** Call recordings, chat transcripts and screen recordings hold names, account details and sometimes health or payment information. Disclose recording at the start of calls as the law in each place requires ([Recording Calls](/docs/compliance/consumer-contact#recording-calls)), keep card numbers out of recordings by pausing or by taking payment through a link instead, set a retention period per record type, and restrict who can play them ([Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)).
- **Log access.** Every read of a customer's data from the support console is logged with the agent and the ticket, including transcripts opened during QA ([Logging Support Access](/docs/security/support-access#logging-support-access)).

## Checklist

- **Every channel into one ticket model,** with an in-product entry point, a public help center and a private channel for account questions.
- **Tickets with explicit states** that say whose move it is, a third-party state for escalations, and reopens counted.
- **Context from the server:** account, platform, version, recent actions and request IDs, masked by default; never a password request.
- **Classification per language,** customer and classifier categories both stored, routing by category, language, priority and skill, and tickets linked to incidents.
- **Macros versioned and owned,** parameterized, localized and measured by reopen rate.
- **Bots that run runbooks in code,** a human one click away, and denials, money above a cap, account control, safety and appeals left to people.
- **Every action a named, idempotent operation** calling the owning service, with caps, a second approver and no operation for credentials or penalties.
- **Escalation with written criteria,** one engineering ticket linked to many customer tickets, and an incident path for anything widespread.
- **Complaints with stored deadlines** for legal clocks, and published ones for the rest.
- **Metrics as distributions:** first response, resolution, first-contact resolution, CSAT, reopen rate and contacts per active user.
- **QA on humans and bots alike,** calibrated reviewers, recordings disclosed and retained by policy, and every read logged.

## References

**Specifications**

- [12 CFR 1005.11 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1005.11), Regulation E error resolution: 60 days to report, 10 business days to investigate, 45 days with provisional credit

**Reference**

- [Zendesk: About ticket fields](https://support.zendesk.com/hc/en-us/articles/4408843029658-About-Zendesk-Support-ticket-fields), the default New, Open, Pending, On-hold and Solved statuses and what each waits on

**In practice**

- [Riot Games: Blitzcrank Bot](https://www.riotgames.com/en/news/blitzcrank-bot), request volume, response and resolution times, first-touch resolution, category accuracy, the Request a Human button, the bot's share of tickets and lower satisfaction with bot-delivered denials
