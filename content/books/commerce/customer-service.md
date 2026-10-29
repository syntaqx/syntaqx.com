+++
title = "Customer Service"
description = "WISMO and self-service tracking, helpdesks and order actions, returns and refunds through support, AI agents and disclosure laws, metrics and help-desk fraud."
category = "Commerce Industry"
order = 2355
part = "Marketing and Customers"
tags = ["commerce", "customer-service", "support", "helpdesk", "ai-agents", "fraud"]
+++

A store's support inbox is its order book read aloud. "Where is my order?" "Can I change the address?" "It arrived broken." "I meant to order the large." "Cancel my subscription." "I never got it." Almost every contact is about one order, and almost every answer is a lookup or an action on that order: read the tracking, edit the shipment before it leaves, start a return, issue a refund or a replacement, skip a renewal. That makes commerce support unusually automatable and unusually dangerous: the same buttons that fix a customer's problem in one click send a replacement to a fraudster's address in one click.

The shape of the work is set by the rest of the volume. Carriers' scans decide whether "where is my order" has an answer before the customer asks; the order manager decides what can still be changed; the return policy decides what support may promise; the Mail Order Rule decides when a late order requires the store to ask the customer's consent to the delay. A good support system is mostly those systems made visible: to the customer, so they never have to ask, and to the agent or AI that answers when they do.

This chapter covers where contacts come from and how self-service removes them, the helpdesks and how they connect to the store, order actions and their limits, returns and refunds through support, chat and AI agents and the laws that require disclosing them, marketplace messages, SLAs and metrics, and the fraud and social engineering aimed at the help desk. Support as an engineered system in general (ticket states, routing, macros, bots, escalation, QA) is the playbook's [Customer Support Operations](/docs/operations/customer-support); staff access is [Support Access & Internal Tools](/docs/security/support-access); the rules for AI agents are [AI Agents in the Product](/docs/architecture/ai-agents). Phone-heavy service businesses run contact centers with booking rates and dispatch handoffs, which Field Operations' [Contact Center](/books/field-operations/contact-center) owns. The chapter extends `orders` and `order_issues` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#how-to-build-it), and adds `tickets`, `ticket_messages`, `ticket_orders` and `ticket_actions`.

## How the Platforms Do It

As of October 2026, from each vendor's pricing page, product pages and help center:

| Helpdesk | Built around | How it bills | Order actions | AI |
| --- | --- | --- | --- | --- |
| **Gorgias** | Ecommerce, Shopify first | By billable ticket ("a conversation started on any Gorgias channel"): Starter $10 a month for 50, Basic $60 monthly for 300, Pro $360 monthly for 2,000, Advanced $900 monthly for 5,000; overage $0.36 to $0.40 a ticket | Refund with restock, cancel with a reason, create or duplicate orders, macros that trigger Shopify refunds or cancellations | AI Agent billed per automated interaction ("a customer request that's fully resolved without a human agent"), $0.90 to $1.00, and billed as a ticket instead if an agent replies within 72 hours |
| **Zendesk** | General customer service | Per agent seat: Support Team $25 monthly, Suite Team $69, Suite Professional $149 | Through apps and integrations | AI agents billed per "automated resolution," with 5 or 10 included per agent a month and $1.50 to $2.00 each beyond |
| **Gladly** | The customer rather than the ticket: "Lifelong Customer Memory," "a single AI across the entire relationship" | By quote | Through integrations | Built in |
| **Kustomer** | A customer data platform with custom objects | By quote, after an assessment of agents and monthly conversation volume; voice and WhatsApp pay as you go | Through custom objects and integrations | Several AI features "Included" |
| **Shopify (native)** | The order status page and customer accounts | Part of the platform | Self-service: track, return, manage subscriptions in accounts | Through apps |

Three patterns:

- **The ticket has become the conversation, or the customer.** Gorgias and Zendesk count tickets; Gladly and Kustomer organize around one customer's continuous history. Either way, an ecommerce helpdesk is judged by whether the order, its tracking and the customer's history appear beside the message without a search.
- **AI is billed per resolution.** Gorgias's automated interactions and Zendesk's automated resolutions both charge only when no person had to step in, which aligns the vendor with deflection and makes "resolved" a billing definition worth reading: Gorgias rebills an AI resolution as a ticket if an agent replies within 72 hours.
- **The helpdesk acts on the platform.** Refunds, cancellations and order edits happen from the ticket through the platform's API, so the helpdesk inherits the platform's rules (a refund needs a captured payment; a cancellation needs an unfulfilled order) and the store needs those rules enforced on the platform side, not in the helpdesk's settings.

## Where Contacts Come From

Commerce contacts fall into a short list, each with an owner elsewhere in the volume:

| Contact | What the customer wants | What answers it | The owning chapter |
| --- | --- | --- | --- |
| **Where is my order (WISMO)** | Status and a date | Tracking, the promise made at checkout | [Tracking Events](/books/commerce/shipping-and-carriers#tracking-events) |
| **Change or cancel** | A different address, size, quantity; no order | The order's state and what has shipped | [Edits and Cancellations](/books/commerce/order-management#edits-and-cancellations) |
| **Damaged, wrong or missing** | A replacement or refund | Photos, the shipment, the carrier claim | [Carrier Liability and Claims](/books/commerce/shipping-and-carriers#carrier-liability-and-claims), [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#refunds-and-credits) |
| **Delivered but not received** | The parcel or the money | The carrier's scan, proof of delivery, the customer's history | [Customer Refund Abuse](/books/commerce/refunds-and-delivery-fraud#customer-refund-abuse) |
| **Return or exchange** | A label, a refund, the right size | The return policy and portal | [The Return Lifecycle](/books/commerce/returns-and-exchanges#the-return-lifecycle) |
| **Subscription** | Skip, swap, pause, cancel | The subscription's schedule and the cancellation law | Subscription Commerce; Auto-Renewal & Cancellation Law |
| **Promotion and price** | A code that failed, a price that dropped | Discount rules, price-adjustment policy | [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards) |
| **Product questions** | Fit, compatibility, use | Product content | [Product Information & Content](/books/commerce/product-information) |
| **Account and privacy** | Sign-in, email change, deletion | Account recovery, the privacy request process | [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts) |

WISMO is commonly the largest category, and the most avoidable, because every fact needed to answer it already exists in the carrier's events. <!-- source-gap: wismo-share | missing | WISMO's share of ecommerce support contacts | closes with: a helpdesk vendor's or research firm's published benchmark with its method | checked: 2026-10-28 -->

## WISMO and Self-Service

The best WISMO ticket is the one the customer never opens. Three things prevent it:

- **A status page that answers.** Shopify's order status page is where customers "track their orders and view shipping updates," "check the status of their shipment" once tracking is added, and for supported carriers see "real-time updates on the location of their shipment." A guest reaches it later by verifying "their email address or phone number along with the order number." Every platform has an equivalent, and branded tracking pages from post-purchase vendors extend it.
- **Proactive messages at the moments people worry.** Shipped, out for delivery, delivered, and above all *exception*: a delay, an address problem, a parcel that stopped scanning. These are transactional messages on the transactional stream ([Frequency, Transactional and Marketing](/books/commerce/email-sms-and-lifecycle#frequency-transactional-and-marketing)), and the exception message is the one that prevents the most contacts. "Stalled is an event too": a parcel that hasn't scanned for days needs a message the carrier won't trigger.
- **Honest states.** A label printed but not scanned is "packed," not "shipped" ([Tracking Events](/books/commerce/shipping-and-carriers#tracking-events)); a delivery promise missed is a fact to tell the customer, not to wait for them to discover.

When the store can't ship within the time it stated (or 30 days if it stated none), the FTC's Mail Order Rule requires a delay notice that offers the customer the choice to consent to the new date or cancel for a prompt refund ([Shipping Promises: the Mail Order Rule](/books/commerce/online-consumer-protection#shipping-promises-the-mail-order-rule)). That makes a delayed-order flow a legal process, not a courtesy: the support system, or the order manager behind it, must detect the late order, send the notice and record the answer.

A WISMO contact that arrives anyway is the easiest to automate, and the first one AI agents and order bots take: identify the order (from the signed-in account, the email on the ticket or the order number with a verifying detail), read the tracking, answer with the date, and hand off to a person when the shipment is in exception or the customer says it was delivered and they don't have it.

## Helpdesks and the Order Sidebar

Whichever helpdesk a store uses, the agent's screen should show, beside the message, the customer's orders, each order's lines, payments, fulfillments and tracking, open returns and issues, subscriptions, consent and the customer's contact and refund history. Gorgias's customer sidebar shows order history "to inform refund decisions"; Zendesk, Gladly and Kustomer reach the same data through integrations and custom objects. The playbook's rule is that context comes with the ticket ([Context Comes With the Ticket](/docs/operations/customer-support#context-comes-with-the-ticket)); the commerce specifics:

- **Match the customer, then the order.** A ticket from an email matches a customer by the same normalized email the store uses at checkout ([Identity and Merge](/books/commerce/customers-and-accounts#identity-and-merge)); an order number in the message links the ticket to that order, but only after the sender is shown to own it.
- **Link tickets to orders explicitly.** A ticket can concern several orders and an order several tickets; the link is a row, so "contacts per order" and "which orders generated the most contacts" are queries.
- **Show what the agent may do, not only what happened.** Whether the order can still be edited (not yet released to the warehouse), refunded (captured), cancelled (unfulfilled), or returned (inside the window), computed by the systems that own those states.

## Order Actions

Support agents act on orders: cancel, edit an address or a line, refund all or part, refund shipping, reship or send a replacement, issue store credit, generate a return label, apply a discount to a future order, skip or cancel a subscription. The playbook's rule is that every action is a **named operation** with a cap and an approval rule, called the same way by an agent's button, a macro and a bot ([Actions Are Operations](/docs/operations/customer-support#actions-are-operations)). In commerce, each one calls the owning chapter's process:

| Action | Owner | Constraint the action must respect |
| --- | --- | --- |
| **Cancel** | Order management | Only lines not yet released to fulfillment; a released line becomes a return or an intercept ([Edits and Cancellations](/books/commerce/order-management#edits-and-cancellations)) |
| **Change address** | Order management | Before release; after it, a carrier intercept or redirect at a fee, and a fraud check ([Account Takeover](/books/commerce/refunds-and-delivery-fraud#account-takeover)) |
| **Refund** | Payments | Against a captured payment, to the original tender; an uncaptured authorization is reduced or voided instead ([Taking Payment in Commerce](/books/commerce/taking-payment)) |
| **Replacement or reship** | Order management | A new zero-priced order linked to the original, so inventory, cost and fraud history see it |
| **Store credit or goodwill** | Promotions and gift cards | A liability booked as credit, under a cap ([Store credit](/books/commerce/promotions-and-gift-cards#store-credit)) |
| **Return label** | Returns | The policy's window and exclusions ([The Return Lifecycle](/books/commerce/returns-and-exchanges#the-return-lifecycle)) |
| **Subscription change** | Subscriptions | The schedule and the cancellation law's requirements |

Gorgias's order management lets agents "issue refunds" choosing whether to restock, "cancel orders" with a reason, and create or duplicate orders, and its macros can trigger Shopify refunds and cancellations. The commerce rules on top:

- **Refunds go through the order, not the processor.** A refund issued in the payment processor's dashboard leaves the order showing paid and the return unreconciled; the helpdesk's refund calls the platform, which calls the processor ([Refunds and Disputes Are Their Own Objects](/docs/payments/payment-states#refunds-and-disputes-are-their-own-objects)).
- **Original tender first.** Refunding to a different card or to a gift card on request is a classic fraud path and, for chargebacks, a way to pay twice ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).
- **Caps per actor, per customer, per day.** An agent's goodwill credit up to a value, a second person above it, and a per-customer limit across all agents, so a persistent customer can't collect the cap from each of five agents.
- **A reason on every action.** The reason code on a refund or a replacement (damaged, carrier lost, wrong item, goodwill) is what links support's spend to the warehouse's, carrier's and catalog's mistakes.

## Returns and Refunds Through Support

Self-service return portals handle the standard return; support handles the rest: outside the window, a damaged item that shouldn't come back, a missing item from a multi-box order, a refund that didn't arrive, a chargeback threat. Four practices:

- **The policy is data, and support's exceptions are rows.** An agent extending a window or waiving a fee records it as an exception against the policy, which is the only way to know how often the stated policy isn't the real one ([Return Policies and the Law](/books/commerce/returns-and-exchanges#return-policies-and-the-law)).
- **Returnless refunds need a rule, not a mood.** Below a value and a customer-history threshold, refunding without the item comes back cheaper than shipping it; above it, the item comes back ([Returnless Refunds](/books/commerce/returns-and-exchanges#returnless-refunds)).
- **Answer before the chargeback.** A customer who can't reach support files a dispute, which costs a fee and counts against the store's dispute ratio; a fast refund of an undeliverable order is cheaper than winning the dispute. Pre-dispute alerts and collaboration networks route some disputes to the merchant first ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).
- **"Delivered, not received" is a fraud decision.** The carrier's scan, the customer's history, the address and the device are inputs to a risk decision that support applies, not makes up per ticket ([Customer Refund Abuse](/books/commerce/refunds-and-delivery-fraud#customer-refund-abuse); [Proof When Nobody Signs](/books/field-operations/last-mile-delivery#proof-when-nobody-signs) for delivery evidence).

## Chat and AI Agents

Commerce was early to AI support because its questions are narrow and its answers sit in the order book. An AI agent that answers WISMO, explains the return policy, starts a return, edits an address before release and recommends a size is answering from data the store holds. The design is the playbook's ([AI Agents in the Product](/docs/architecture/ai-agents)): tools rather than database access, decisions in code, identity before account actions, a human one click away. The commerce specifics:

- **Identity scales with the action.** Reading an order's status needs a signed-in session or a one-time code to the email or phone on the order; changing the address or refunding needs step-up through a channel the account owns ([Identity Before Account Actions](/docs/architecture/ai-agents#identity-before-account-actions)). An order number and a zip code are printed on the packing slip and the box.
- **The agent's tools are the same named operations,** with lower caps: it may start a return inside the policy and refund below a value; it hands off denials, exceptions and anything above the cap ([When a Person Must Decide](/docs/operations/customer-support#when-a-person-must-decide)).
- **Its promises bind the store.** In a 2024 British Columbia Civil Resolution Tribunal decision, an airline was held liable for its website chatbot's wrong description of a refund policy ([The AI's Promises Are the Business's Promises](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises)). Policies, prices and dates come from tools reading the current policy and catalog, and the transcript is kept as long as the promise could be disputed.
- **A sales agent is a marketer.** An AI that recommends products, offers discounts or texts customers proactively is doing marketing, under the consent rules of [Email, SMS & Lifecycle Marketing](/books/commerce/email-sms-and-lifecycle#sms-law-for-a-store) and, for anything presented as a review or endorsement, the FTC's ([Affiliates and Influencers](/books/commerce/acquisition-and-attribution#affiliates-and-influencers)).

### Disclosure Laws

The disclosure laws differ in trigger and agree on the fix:

- **California's** bot law (B&P Code 17941) makes it unlawful to use a bot to communicate with a person in California online with intent to mislead them about its artificial identity in order to incentivize a sale; clear disclosure is a complete defense ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)). A shopping assistant is the case it was written for.
- **Utah's** law requires disclosure when a consumer asks, and up front only in high-risk interactions, with a safe harbor for disclosing at the outset (same section).
- **Maine's** LD 1727 (Public Law 2025, chapter 294, approved June 12, 2025, 10 MRSA §1500-Y) says a person "may not use an artificial intelligence chatbot or any other computer technology to engage in trade and commerce with a consumer in a manner that may mislead or deceive a reasonable consumer into believing that the consumer is engaging with a human being unless the consumer is notified in a clear and conspicuous manner that the consumer is not engaging with a human being," and makes a violation a violation of the Maine Unfair Trade Practices Act. It defines a chatbot as software that "simulates human conversation and interaction through textual or aural communications," which reaches voice agents too.
- **The EU AI Act's** Article 50 transparency obligations apply from August 2, 2026 ([The Law, at a Pointer Level](/docs/architecture/ai-agents#the-law-at-a-pointer-level)).

The design that satisfies all of them: the agent says it is an AI at the start of every conversation, answers honestly when asked, never takes a human name and persona without the disclosure, and the system records which greeting version each conversation used. Recording and transcripts are personal data under the privacy laws, and deletion requests reach the helpdesk ([Deletion Against Retention](/books/commerce/customers-and-accounts#deletion-against-retention)).

## Marketplace Messages

Marketplace buyers contact sellers through the marketplace, under its rules and clocks, with masked addresses the seller may use only for the order ([Customer Data](/books/commerce/selling-on-amazon#customer-data)). Response times count toward the seller's performance standards, so marketplace messages need their own queue and SLA in the helpdesk, and an agent must never move the buyer to the brand's own email or marketing ([Account Health](/books/commerce/selling-on-amazon#account-health)). A delivery app's customer contacts the app, which decides refunds and charges the merchant for errors ([Who Pays for an Error](/books/commerce/refunds-and-delivery-fraud#who-pays-for-an-error)).

## SLAs and Metrics

Helpdesks measure the clock in several ways. Zendesk's SLA metrics are representative: "first reply time is the time between ticket creation and the first public comment from an agent (or autoreply)," next reply time from "the oldest unanswered customer comment" to the next agent comment, periodic updates, "requester wait time" (time in new, open and on-hold), and "agent work time," each with calendar or business hours per priority. The playbook's set (first response, resolution, first-contact resolution, CSAT, reopen rate, contacts per active user) applies unchanged ([Metrics](/docs/operations/customer-support#metrics)); commerce adds:

- **Contacts per order,** by category, channel, warehouse, carrier and SKU: the number that says whether support is fixing problems or absorbing them. A rise in WISMO for one carrier or "damaged" for one SKU is a supply chain finding.
- **Self-service rate** for tracking, returns and subscription changes: the share handled without a ticket.
- **Cost of resolutions:** refunds, credits, replacements and reship postage by reason, joined to contribution ([The Unit Economics](/books/commerce/business-models#the-unit-economics)).
- **Peak readiness:** contacts trail orders by the days it takes to ship and deliver, and return contacts trail them by weeks, so support's peak comes after the sales peak; staffing and SLAs plan for it (the later Peak Season & Drops chapter).
- **AI and human outcomes on the same definitions,** including reopen and repeat contact within a week, since a per-resolution bill rewards the vendor for closing.

## Fraud and Social Engineering at the Help Desk

Support can change where goods go and where money goes, so it is attacked. The patterns in commerce:

- **Refund and replacement fraud.** "Item not received," "empty box" and "wrong item" claims, alone or through paid refund services that coach customers through the script ([Customer Refund Abuse](/books/commerce/refunds-and-delivery-fraud#customer-refund-abuse), [Return Fraud and Abuse](/books/commerce/returns-and-exchanges#return-fraud-and-abuse)).
- **Account takeover through support.** An attacker asks support to change the email or the address on an account, then orders on its saved card or redirects an order in transit. Changes to contact points and addresses after an order are the step-up actions, and support never sets a sign-in factor ([Recovery Is the Real Login](/docs/security/authentication#recovery-is-the-real-login)).
- **Address change after order.** A request to redirect a high-value order, especially to a new address or a freight forwarder, is a fraud signal and goes back through the risk check the order passed at checkout.
- **Insider abuse.** Agents with broad access can be bribed. Coinbase disclosed in a May 2025 8-K that a threat actor obtained customer data "by paying multiple contractors or employees working in support roles outside the United States," estimating $180 million to $400 million in costs, and warned of its use in "social-engineering attempts." A store's support agents see names, addresses, order histories and partial card details, and can issue refunds: read-only by default, least access per role, every lookup logged and reviewed ([Support Access & Internal Tools](/docs/security/support-access)).
- **Impersonating the store.** Fraudsters contact customers posing as the store's support, often after a data leak, to collect payment details or one-time codes. Telling customers in every message what support will never ask for is cheap insurance, and support should never ask a customer to read a one-time code aloud.

The control is the same everywhere: the decision is a rule over data with a risk score, applied by the agent or the bot, with caps that no single person can exceed and a log reviewed after the fact ([Risk Scoring](/docs/architecture/risk-scoring)).

## How to Build It

A store using Gorgias or Zendesk keeps tickets in the vendor; the store's own system still needs the links between tickets and orders, every action support took on an order, and the AI disclosure record. The tables follow the playbook's `support_tickets` and `support_operations` ([Customer Support Operations](/docs/operations/customer-support)) under the names this volume planned:

```sql
ALTER TABLE order_issues
  ADD COLUMN ticket_id UUID;               -- the support conversation that raised it

CREATE TABLE tickets (                   -- a support conversation, mirrored from the helpdesk
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id       UUID NOT NULL REFERENCES merchants (id),
  customer_id       UUID REFERENCES customers (id),  -- null until matched
  channel           TEXT NOT NULL CHECK (channel IN ('email', 'chat', 'sms', 'phone', 'social',
                      'marketplace', 'web_form')),
  sales_channel_id  UUID REFERENCES sales_channels (id),  -- the marketplace, for its SLA
  category          TEXT NOT NULL CHECK (category IN ('wismo', 'change_cancel', 'damaged_wrong',
                      'not_received', 'return_exchange', 'subscription', 'promotion',
                      'product_question', 'account_privacy', 'other')),
  category_source   TEXT NOT NULL CHECK (category_source IN ('customer', 'classifier', 'agent')),
  state             TEXT NOT NULL CHECK (state IN ('new', 'open', 'pending', 'on_hold',
                      'solved', 'closed')),
  resolver          TEXT CHECK (resolver IN ('self_service', 'ai_agent', 'human', 'macro')),
  helpdesk_ref      TEXT,                   -- the helpdesk's ticket ID
  opened_at         TIMESTAMPTZ NOT NULL,
  first_reply_at    TIMESTAMPTZ,
  reply_due_at      TIMESTAMPTZ,            -- from the SLA policy, marketplaces stricter
  solved_at         TIMESTAMPTZ,
  reopened_count    INT NOT NULL DEFAULT 0
);

ALTER TABLE order_issues
  ADD CONSTRAINT order_issues_ticket_fk FOREIGN KEY (ticket_id) REFERENCES tickets (id);

CREATE TABLE ticket_messages (           -- what was said, by whom, including the AI
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  ticket_id      UUID NOT NULL REFERENCES tickets (id),
  author         TEXT NOT NULL,           -- 'customer', 'agent:<id>', 'ai:<agent>@<version>'
  visibility     TEXT NOT NULL CHECK (visibility IN ('public', 'internal')),
  body_ref       TEXT NOT NULL,           -- stored in the helpdesk or the store's archive
  ai_disclosure  TEXT,                    -- greeting version shown, on the AI's first message
  sent_at        TIMESTAMPTZ NOT NULL
);

CREATE TABLE ticket_orders (             -- which orders a ticket concerns
  ticket_id     UUID NOT NULL REFERENCES tickets (id),
  order_id      UUID NOT NULL REFERENCES orders (id),
  ownership     TEXT NOT NULL CHECK (ownership IN ('signed_in', 'code_verified',
                  'email_match', 'claimed')),  -- how the contact was shown to own the order
  linked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ticket_id, order_id)
);

CREATE TABLE ticket_actions (            -- every action support took on an order
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  ticket_id       UUID NOT NULL REFERENCES tickets (id),
  order_id        UUID REFERENCES orders (id),
  kind            TEXT NOT NULL CHECK (kind IN ('cancel_lines', 'change_address', 'refund',
                    'refund_shipping', 'replacement_order', 'store_credit', 'return_label',
                    'future_discount', 'subscription_change', 'carrier_claim')),
  reason          TEXT NOT NULL,          -- 'damaged', 'carrier_lost', 'wrong_item', 'goodwill'
  amount          BIGINT,                 -- minor units, for caps
  currency        CHAR(3),
  requested_by    TEXT NOT NULL,          -- 'agent:<id>', 'ai:<agent>', 'macro:<id>'
  approved_by     TEXT,                   -- required above the actor's cap
  risk_decision_id UUID,                  -- for not-received, address change, reship
  policy_exception TEXT,                  -- the rule waived, if any
  idempotency_key TEXT NOT NULL,          -- ticket + kind + target
  result_ref      TEXT,                   -- refund ID, replacement order ID, credit ID
  status          TEXT NOT NULL CHECK (status IN ('pending_approval', 'applied', 'rejected',
                    'failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idempotency_key),
  CHECK (approved_by IS NULL OR approved_by <> requested_by)
);
```

Contacts per order by category and carrier, the number that turns support into findings:

```sql
SELECT s.carrier, t.category, date_trunc('week', o.placed_at) AS week,
       COUNT(DISTINCT t.id)::numeric / NULLIF(COUNT(DISTINCT o.id), 0) AS contacts_per_order
FROM orders o
JOIN locations l    ON l.id = o.location_id
JOIN fulfillments f ON f.order_id = o.id
JOIN shipments s    ON s.fulfillment_id = f.id
LEFT JOIN ticket_orders tor ON tor.order_id = o.id
LEFT JOIN tickets t ON t.id = tor.ticket_id
WHERE l.merchant_id = $1
GROUP BY 1, 2, 3;
```

Design notes:

- **The helpdesk holds the conversation; the store holds the consequences.** Mirroring tickets is optional, but `ticket_orders` and `ticket_actions` are not: they are how refunds and replacements reconcile to reasons, and how a fraud review sees every agent action on an account.
- **Actions call the owner.** A `ticket_actions` row records the request; the order manager, payments and returns services perform it and return `result_ref`. Support never writes `order_payments` or `inventory_levels` itself.
- **Ownership is recorded per link.** `ownership = 'claimed'` (an order number typed into chat) allows reading status only; refunds and address changes require a stronger value, enforced in the action service.
- **Caps are checked per customer as well as per actor,** by summing `ticket_actions` for the customer over a window before applying a new one.
- **Disclosure is logged per conversation,** so a Maine or California complaint can be answered with the greeting the customer saw.
- **Retention follows the strictest need:** transcripts as long as a promise in them could be disputed, then redacted on the privacy schedule.
- **Emit events:** `ticket.opened`, `ticket.solved`, `ticket_action.applied`, consumed by analytics, fraud and the order timeline.

## Auditing

- **Every action support took on an order,** with the actor, the reason, the cap and approver, the risk decision and the result.
- **Refunds and replacements by reason,** reconciled to the order book and carrier claims.
- **AI conversations** with the disclosure shown, the tools called, the actions taken and the handoffs.
- **Delay notices** under the Mail Order Rule, with the customer's answer.
- **Staff access to customer records,** reviewed for unusual volume or patterns.

## What This Means for the System You Build

- **Answer WISMO before it's asked,** with a status page, honest states and an exception message for every stalled or delayed shipment.
- **Detect late orders and send the delay notice** the Mail Order Rule requires.
- **Put the order beside the message,** with what can still be changed.
- **Make every support action a named operation** that calls the owning system, with a reason, a cap per actor and per customer, and a second approver above it.
- **Refund through the order, to the original tender.**
- **Verify ownership before acting on an order,** more strongly for address changes and refunds than for status.
- **Have AI agents disclose at the start,** log the greeting, and hand denials and exceptions to people.
- **Measure contacts per order by cause,** and treat a rising category as a defect upstream.
- **Give agents least access and log every lookup.**

## References

**Platform documentation**

- [Gorgias: Pricing](https://www.gorgias.com/pricing), plans, billable tickets, automated interactions and AI Agent rates
- [Gorgias: Order management](https://www.gorgias.com/product/order-management), refunds, cancellations, created and duplicated orders, macros and the customer sidebar
- [Zendesk: Pricing](https://www.zendesk.com/pricing/), seat prices and automated resolutions
- [Zendesk: AI agents](https://www.zendesk.com/service/ai/ai-agents/), actions across systems and handoff
- [Zendesk Help: SLA metrics](https://support.zendesk.com/hc/en-us/articles/4408829459866), first reply, next reply, periodic update, requester wait and agent work time
- [Gladly: Pricing](https://www.gladly.ai/pricing/), lifelong customer memory and quote-based pricing
- [Kustomer: Pricing](https://www.kustomer.com/pricing/), assessment-based pricing, pay-as-you-go voice and included AI features
- [Shopify Help Center: Order status page](https://help.shopify.com/en/manual/fulfillment/setup/order-status-page), tracking, shipment status and guest verification

**Law and filings**

- [Maine Legislature: LD 1727 (HP 1154), status](https://legislature.maine.gov/LawMakerWeb/summary.asp?paper=HP1154&SessionID=16), enacted as Public Law 2025, chapter 294, signed June 12, 2025
- [Maine Legislature: Public Law 2025, chapter 294 (PDF)](https://legislature.maine.gov/legis/bills/getPDF.asp?paper=HP1154&item=3&snum=132), 10 MRSA §1500-Y, the chatbot definition, the disclosure requirement and enforcement
- [Coinbase Global: Form 8-K (May 15, 2025)](https://www.sec.gov/Archives/edgar/data/1679788/000167978825000094/coin-20250514.htm), support contractors paid for customer data, the cost estimate and social-engineering risk
