+++
title = "Virtual Cards & Spend Controls"
description = "Spend controls as a product: cards per employee, vendor or purpose, spend programs and requests, hard and soft budgets, locks, and who may change a limit."
category = "Banking & Lending Industry"
order = 2464
part = "Spend Management"
tags = ["banking", "spend-management", "virtual-cards", "spend-controls", "budgets"]
+++

A spend management customer doesn't buy a card; it buys the answer to "who may spend what, where, and from whose budget." The card network's authorization is where that answer is enforced, and the Payments volume covers it from the issuer's side: merchant category, amount, velocity and merchant-lock rules evaluated at the processor or in the program's webhook, inside a two- to six-second budget ([Spend Controls](/books/payments/issuer-processing#spend-controls), [Real-Time Decisions](/books/payments/issuer-processing#real-time-decisions-webhooks-and-jit-funding)). This chapter is the layer above it: the policy objects a finance team actually configures, and how they turn into those rules.

The objects are few and recur across platforms: a **spend program** (a template of limits, categories and who may use it), a **budget** (an amount over a period for a department, team or project), a **card** issued to a person, a vendor or a purpose, a **request** that mints a card or raises a limit after approval, and a **lock** that stops a card on a date or when its holder falls behind on receipts. Virtual cards make the model practical: when a card costs nothing to issue, every subscription, trip and vendor can have its own, and the card becomes the unit of control. What happens after a purchase (receipts, policy review, approvals) is [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management); the credit line all of it draws on is [Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards).

## How the Platforms Do It

What the platforms' API references and help centers document, as of October 2026:

| Platform | Policy object | How cards relate to it | Periods | Hard or soft | Other controls |
| --- | --- | --- | --- | --- | --- |
| **Brex** | Spend limits (`/v2/spend_limits`, replacing `/v1/budgets`), within budgets and budget programs | Cards with `limit_type = USER` draw on the person's limits; vendor cards have `limit_type = CARD`, must be virtual and carry their own spend controls; a spend limit can auto-create cards for all members, and can restrict spending to the cards it provisioned | `PER_WEEK`, `PER_MONTH`, `PER_QUARTER`, `PER_YEAR`, `ONE_TIME`; card controls `MONTHLY`, `QUARTERLY`, `YEARLY`, `ONE_TIME` ("does not refresh") | `authorization_type` `HARD` or `SOFT` ("whether authorizations will decline based on available balance"), with a `limit_buffer_percentage` | Merchant category controls, a per-transaction limit, an expense policy, a department for attribution, start and end dates, members' limit increase requests, `lock_after_date`, allowed and blocked merchants; up to 10 active physical cards per user |
| **Ramp** | Spend programs: "the template," encoding amount, interval, allowed categories and permitted spend types | Each fund ("an instance of the template, scoped to a specific user, team, or cycle") "issues a virtual card automatically"; a fund can be shareable | `TOTAL` (a lifetime cap), `MONTHLY`, `ANNUAL` | Not documented in the guides I read | Allowed categories, merchants and countries; a fund can permit card spend, reimbursements or both; Plus can "auto-lock cards when compliance is unmet" |
| **Stripe Issuing** | `spending_controls` on a card or a cardholder | A cardholder's limits apply across all of their cards; a card's limits carry across the cards that replace it | Per authorization, daily, weekly, monthly, yearly, all time | Overlaps resolve to the most restrictive control | Allowed or blocked categories, merchant countries and card presence; a default of $500 per day on a new card without limits and a non-configurable $10,000 per authorization; aggregation best effort with up to 30 seconds of delay |
| **Expensify** | Smart Limits | A limit per employee | Not stated in the 10-K | The company sets "the maximum exposure they will accept for each employee" | Daily or monthly settlement of the card |

Three things stand out. **The template and the instance are separate objects:** Ramp's spend program and fund, and Brex's budget program, budget and spend limit, both split the policy from each place it's used, so changing a policy updates every card it governs instead of every card being edited. **Cards are cheap and scoped:** a vendor card at Brex carries its own limit and must be virtual, and a Ramp fund comes with its own virtual card, which makes "one card per purpose" the default rather than a discipline. **"Hard" is a setting, not a given:** Brex documents soft limits with a buffer next to hard ones, and Stripe warns that tips and fees posted later can push spend past a limit, so the product has to say which limits can be exceeded and by how much.

## Cards Per Person, Vendor or Purpose

Each scope answers a different question and fails differently:

- **Employee cards.** A card in a person's name drawing on that person's limits, for everyday spend. Brex models it as `limit_type = USER`; Stripe's cardholder-level controls apply across all of a cardholder's cards. The risk is the person: misuse, a lost card, a departure. A card must lock when its holder leaves the company, so the employee directory is an input to the card system ([Provisioning and Deprovisioning](/docs/security/sso-and-federation#provisioning-and-deprovisioning)).
- **Vendor cards.** One virtual card per supplier or SaaS subscription, with the limit on the card. Cancelling a subscription becomes locking a card, a vendor that raises its price is declined at the next renewal, and a leaked number exposes one vendor's limit. Brex requires vendor cards to be virtual; merchant lock (the card works only where it was first used) is the processor-side rule that makes them safe ([Spend Controls](/books/payments/issuer-processing#spend-controls)).
- **Purpose cards.** A card for a trip, an event, a project or a one-off purchase, with a total limit and an end date: a Ramp fund with a `TOTAL` cap, a Brex card with a `ONE_TIME` duration and a `lock_after_date`. When the purpose ends the card should end, and an expiry is the only reliable way that happens.
- **Single-use cards.** One authorization, often for an exact amount, the payables pattern in [Single-Use and Multi-Use Cards](/books/payments/vendor-payouts#single-use-and-multi-use-cards).

Physical cards are the exception. They cost money to produce and ship, they're the ones used at a restaurant or a hotel desk, and Brex caps them at 10 active per user. Their life (production, activation, replacement) is [The Card Lifecycle](/books/payments/card-issuing#the-card-lifecycle).

## Spend Programs and Requests

The workflow that makes cards cheap to govern is **request, approve, mint**:

1. An employee asks for a card or more limit, stating the purpose, amount and vendor or trip. Brex exposes whether members may request limit increases as a setting on each spend limit.
2. The request routes to approvers by amount, department and vendor type, the same routing engine that approves expenses and bills ([Approvals](/books/banking-and-lending/expense-management#approvals)).
3. On approval the system issues the card or raises the limit with the program's controls already attached, and the request is the card's reason for existing.

**Programs make it scale.** A finance team defines "Software subscriptions: $500 a month per vendor, software categories only, receipts required, owned by IT" once, and every card created under it inherits the controls. Brex's `auto_create_limit_cards_setting` of `ALL_MEMBERS` and Ramp's per-user funds both issue a card to each member of a program automatically. When the program changes, its cards change with it, which only works if each card's rules record which program produced them.

## Budgets: Hard and Soft

A **budget** is an amount over a period, for a department, team, project or program, that several cards draw on. It's the control finance teams think in, and the hardest one to enforce at authorization, because it aggregates spend across cards and the processor's own aggregates are approximate: Stripe aggregates on a best-effort basis with up to 30 seconds of delay ([Spend Controls](/books/payments/issuer-processing#spend-controls)).

- **Hard budgets decline** when an authorization would take available budget below zero. Enforcing that exactly means the program checks the budget itself, in its authorization webhook, against a counter it updates in the same transaction as its decision.
- **Soft budgets allow and flag.** Brex's `SOFT` authorization type doesn't decline on available balance; its `limit_buffer_percentage` allows a defined overrun. Overruns become alerts and approval items rather than declines, which suits travel, where a declined hotel card costs more than the overrun.
- **What counts against the budget.** Pending authorizations as well as cleared spend, so the budget's available amount is budget minus cleared minus active holds, the same shape as an available balance ([Partial Approvals, Holds and Changing Amounts](/books/payments/issuer-processing#partial-approvals-holds-and-changing-amounts)). Refunds return budget in the period they post. Tips and incremental authorizations can push past a hard limit after approval, so hard budgets need a policy for overages they couldn't prevent.
- **Periods and rollover.** Weekly to yearly or one-time. Whether unused budget rolls over is a finance policy; the system needs to know which.

## Worked Numbers: One Budget, Two Authorizations

A marketing team's monthly budget is **$20,000**. With 3 days left, cleared spend is $18,700 and active holds are $500, so available is $20,000 - $18,700 - $500 = **$800**. Two authorizations arrive four seconds apart on different cards: **$600** (an ad platform) and **$700** (a conference ticket).

- **Processor-side aggregate only** (best effort, up to 30 seconds behind): both may be checked against $800 available and approved, leaving the budget at **-$500**.
- **Hard budget, checked by the program with the budget row locked:** the first authorization takes available to $200; the second would take it to -$500 and is declined, with a reason that names the budget.
- **Soft budget with a 10% buffer:** the ceiling is $22,000, so available against the ceiling is $2,800. Both are approved, the budget shows **-$500 against $20,000**, and an alert goes to the budget owner.

The ad platform's charge later clears at $640 (an increment the merchant was allowed to send): the overage is $40 more in every case, and only a rule written for overages decides whether the next authorization on a hard budget is declined to absorb it. My default is processor-side controls as the floor on every card (category, per-transaction amount, merchant lock), and budgets checked by the program, serialized per budget, with the processor's fallback set to decline on timeout for cards on hard budgets ([Real-Time Decisions](/books/payments/issuer-processing#real-time-decisions-webhooks-and-jit-funding)).

## Locks, Expiry and Compliance

Cards stop for reasons that aren't fraud:

- **Dates.** Brex's `lock_after_date` and a fund's end date stop a purpose card when its purpose ends.
- **One-time limits.** A `ONE_TIME` or `TOTAL` limit doesn't refresh, so the card is spent out rather than expired.
- **Missing receipts.** Ramp's Plus plan can "auto-lock cards when compliance is unmet," tying the card to the expense process: a cardholder with unreceipted transactions past the policy's window loses the card until they catch up ([Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management#capturing-receipts)).
- **People leaving.** Offboarding locks every card the person holds and reassigns vendor cards they owned, because a subscription on a departed employee's card still renews.
- **Credit.** When the company's limit falls or its account is restricted, every card on it is affected at once; the company-level decision is [Limits From Cash](/books/banking-and-lending/corporate-cards#limits-from-cash).

A lock is a card status change with a reason and an actor, written as a lifecycle event in the issuing model ([How to Build It](/books/payments/card-issuing#how-to-build-it)), so "why was my card declined" has an answer.

## Who May Change a Control

Controls are only as good as the permission to change them. The roles recur: an **admin** who defines programs and budgets, a **budget owner** who approves requests against a budget, a **card holder** who spends and may request more, and an **approver** in the routing chain. Two rules I treat as fixed: nobody approves their own limit increase, and every change to a program, budget or card control records who made it, under which role and why. Role design in general is [Authorization](/docs/security/authorization#least-privilege); the spend twist is that a role is scoped to a budget or department, not only to the company.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). Cards, card accounts, authorizations and the authorization-time rules stay in the Payments volume: `cards` and `card_lifecycle_events` from [Card Issuing](/books/payments/card-issuing#how-to-build-it), and `issuer_authorizations`, `auth_holds`, `clearing_records`, `spend_control_rules` and `auth_decisions` from [Issuer Processing](/books/payments/issuer-processing#how-to-build-it). This chapter adds the policy objects and the link from each card to the policy that produced it; a spend program compiles into `spend_control_rules` rows scoped to its cards, and budgets are checked by the program's authorization handler, recorded as an `auth_decisions` stage.

```sql
CREATE TABLE spend_programs (                -- the template: versioned policy for a kind of spend
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES credit_lines (account_id),  -- the company's card line
  program_key         TEXT NOT NULL,         -- stable across versions
  version             INT NOT NULL,
  name                TEXT NOT NULL,         -- 'Software subscriptions', 'Team travel'
  card_scope          TEXT NOT NULL CHECK (card_scope IN ('employee', 'vendor', 'purpose', 'single_use')),
  card_form           TEXT NOT NULL CHECK (card_form IN ('virtual', 'physical', 'either')),
  limit_amount        BIGINT NOT NULL CHECK (limit_amount > 0),
  limit_period        TEXT NOT NULL CHECK (limit_period IN ('per_authorization', 'weekly',
                        'monthly', 'quarterly', 'yearly', 'one_time')),
  controls            JSONB NOT NULL,        -- categories, merchants, countries, per-transaction cap
  receipt_policy_ref  TEXT,                  -- the expense policy its spend is reviewed under
  auto_issue          TEXT NOT NULL CHECK (auto_issue IN ('none', 'all_members')),
  lock_when_noncompliant BOOLEAN NOT NULL DEFAULT false,
  valid_during        TSTZRANGE NOT NULL,
  created_by          TEXT NOT NULL,
  UNIQUE (account_id, program_key, version)
);

CREATE TABLE spend_budgets (                 -- an amount over a period that several cards draw on
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES credit_lines (account_id),
  parent_id           UUID REFERENCES spend_budgets (id),   -- department > team > project
  name                TEXT NOT NULL,
  owner_ref           TEXT NOT NULL,         -- the budget owner who approves against it
  department_ref      TEXT,                  -- the accounting dimension spend is attributed to
  amount              BIGINT NOT NULL CHECK (amount > 0),
  period              TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'quarterly',
                        'yearly', 'one_time')),
  enforcement         TEXT NOT NULL CHECK (enforcement IN ('hard', 'soft')),
  buffer_bps          INT NOT NULL DEFAULT 0 CHECK (buffer_bps BETWEEN 0 AND 10000),  -- soft only
  rollover            BOOLEAN NOT NULL DEFAULT false,
  valid_during        TSTZRANGE NOT NULL,
  CHECK (enforcement = 'soft' OR buffer_bps = 0)
);

CREATE TABLE budget_periods (                -- the counter the authorization handler locks
  budget_id           UUID NOT NULL REFERENCES spend_budgets (id),
  period              DATERANGE NOT NULL,
  amount              BIGINT NOT NULL,       -- budget for the period, with rollover applied
  cleared             BIGINT NOT NULL DEFAULT 0,
  held                BIGINT NOT NULL DEFAULT 0,  -- active authorization holds
  PRIMARY KEY (budget_id, period)
);

CREATE TABLE budget_entries (                -- append-only: what moved each counter, and why
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  budget_id           UUID NOT NULL REFERENCES spend_budgets (id),
  period              DATERANGE NOT NULL,
  authorization_id    UUID REFERENCES issuer_authorizations (id),
  clearing_record_id  UUID REFERENCES clearing_records (id),
  kind                TEXT NOT NULL CHECK (kind IN ('hold', 'hold_release', 'clear', 'refund',
                        'overage', 'adjustment')),
  amount              BIGINT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_scopes (                   -- why each card exists and what governs it
  card_id             UUID PRIMARY KEY REFERENCES cards (id),
  spend_program_id    UUID REFERENCES spend_programs (id),  -- the exact version it was issued under
  budget_id           UUID REFERENCES spend_budgets (id),
  scope               TEXT NOT NULL CHECK (scope IN ('employee', 'vendor', 'purpose', 'single_use')),
  holder_ref          TEXT,                  -- the employee, from the directory
  vendor_ref          TEXT,                  -- the supplier a vendor card is for
  purpose             TEXT,
  lock_after          TIMESTAMPTZ,
  spend_request_id    UUID,                  -- spend_requests, below
  CHECK (scope <> 'vendor' OR vendor_ref IS NOT NULL),
  CHECK (scope <> 'employee' OR holder_ref IS NOT NULL)
);

CREATE TABLE spend_program_rules (           -- which compiled rules each program version produced
  spend_program_id    UUID NOT NULL REFERENCES spend_programs (id),
  spend_control_rule_id UUID NOT NULL REFERENCES spend_control_rules (id),
  PRIMARY KEY (spend_program_id, spend_control_rule_id)
);

CREATE TABLE spend_requests (                -- request, approve, mint
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES credit_lines (account_id),
  kind                TEXT NOT NULL CHECK (kind IN ('new_card', 'limit_increase', 'budget_increase')),
  requester_ref       TEXT NOT NULL,
  spend_program_id    UUID REFERENCES spend_programs (id),
  budget_id           UUID REFERENCES spend_budgets (id),
  amount              BIGINT NOT NULL CHECK (amount > 0),
  purpose             TEXT NOT NULL,
  vendor_ref          TEXT,
  status              TEXT NOT NULL CHECK (status IN ('submitted', 'approved', 'rejected',
                        'fulfilled', 'withdrawn')),
  decided_by          TEXT,
  decided_at          TIMESTAMPTZ,
  fulfilled_card_id   UUID REFERENCES cards (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (decided_by IS NULL OR decided_by <> requester_ref)   -- nobody approves their own request
);
```

Design notes:

- **Programs compile, cards inherit.** Publishing a program version writes `spend_control_rules` rows (scope `card`, one set per card it governs) and records them in `spend_program_rules`; a new version supersedes the old rows with an `effective_to` instead of editing them, so every past authorization still points at the rule version that decided it ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Budgets are counters with a ledger behind them.** The authorization handler locks the `budget_periods` row, checks `amount - cleared - held` (plus the buffer for a soft budget), writes a `budget_entries` hold and updates `held` in the same transaction as its `auth_decisions` row; clearing moves the amount from held to cleared, and the counters can always be rebuilt from the entries. Locking one row per budget serializes only that budget's authorizations, which is what the worked numbers need ([Preventing Double-Booking](/docs/architecture/reservations-and-holds#preventing-double-booking)).
- **The handler stays inside its deadline.** The budget check is one indexed row lock, not a query over the month's transactions; if it can't finish within the program's internal deadline, the handler answers with the fallback the budget's enforcement implies.
- **Every card has a reason.** `card_scopes` makes "which program, which budget, which request, which vendor" a join, which is what an admin needs to clean up cards and what an auditor needs to see that each card was approved.

## Auditing

Customers' finance teams and auditors, and the issuing bank, read these records. The general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Every program and budget version,** who created or changed it, and the rules it compiled to.
- **Every card's reason:** its program version, budget, request and approver, and its holder or vendor.
- **Every budget movement:** holds, releases, clears, refunds and overages, with the authorization or clearing record behind each.
- **Every decline and soft-limit overrun** with the rule or budget that caused it.
- **Every lock and unlock,** with the reason (date, noncompliance, offboarding, credit) and the actor.
- **Every request** with its approver, and proof that no one approved their own.

## What This Means for the System You Build

- **Separate the template from the instance:** programs and budgets as versioned policy, cards inheriting from them.
- **Issue a card per purpose,** with virtual cards for vendors and subscriptions and an end date on purpose cards.
- **Run request, approve, mint** through the same approval engine as expenses and bills.
- **Enforce hard budgets in your own handler,** serialized per budget, counting holds as well as cleared spend; let soft budgets overrun by a stated buffer and alert.
- **Keep processor-side controls as the floor** on every card, so a webhook outage never removes them.
- **Lock cards for non-fraud reasons** (dates, missing receipts, departures, credit) as lifecycle events with reasons.
- **Scope roles to budgets** and never let anyone approve their own limit.

## References

**Vendor documentation**

- [Brex: Team API](https://developer.brex.com/openapi/team_api.md), card endpoints, spend controls required when `limit_type = CARD`, and up to 10 active physical cards per user
- [Brex: Team API specification](https://developer.brex.com/_bundle/openapi/team_api.yaml), `limit_type` `USER` and `CARD` with vendor cards virtual, spend control fields including `lock_after_date` and merchant lists, durations including `ONE_TIME`, and card statuses
- [Brex: Budgets API](https://developer.brex.com/openapi/budgets_api.md), `/v1/budgets` to be deprecated in favor of `/v2/spend_limits`, and budget programs
- [Brex: Budgets API specification](https://developer.brex.com/_bundle/openapi/budgets_api.yaml), spend limit periods, spend type, hard and soft authorization, the buffer percentage, limit increase and auto-create settings, merchant category controls, transaction limit, expense policy, department and dates
- [Ramp: Spend programs guide](https://docs.ramp.com/llms-guides/spend-programs.txt), spend programs as templates, funds as instances that issue a virtual card automatically, permitted spend types, and `TOTAL`, `MONTHLY` and `ANNUAL` intervals
- [Ramp: Pricing](https://ramp.com/pricing), auto-locking cards when compliance is unmet on Plus
- [Stripe: Issuing spending controls](https://docs.stripe.com/issuing/controls/spending-controls), card and cardholder controls, categories, countries and card presence, limit intervals, the $500 daily default and $10,000 per-authorization limit, best-effort aggregation with up to 30 seconds of delay, limits across replacements, the most restrictive control applying, and later tips exceeding limits

**Filings**

- [Expensify: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1476840/000147684026000009/exfy-20251231.htm), Smart Limits per employee and daily or monthly settlement
