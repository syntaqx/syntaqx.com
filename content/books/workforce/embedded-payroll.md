+++
title = "Embedded Payroll"
description = "Payroll sold as an API to vertical software: Check, Gusto Embedded, Zeal and others, object models, onboarding, run states, webhooks and who carries the risk."
category = "Workforce Industry"
order = 2656
part = "Running the Platform"
tags = ["payroll", "embedded-payroll", "apis", "webhooks", "state-machines", "partners"]
+++

Embedded payroll is a payroll provider sold as a set of APIs and UI components to another software company, which puts payroll inside its own product under its own brand. A restaurant point of sale, a home services scheduler, a clinic management system or an accounting app already holds the employer, the workers and often the hours; the payroll partner supplies everything that makes those hours into paychecks: the gross-to-net engine, the tax registrations, the employer debit, the direct deposits, the deposits with the IRS and the states, the quarterly returns and the W-2s. The software company, the **platform** in this chapter, owns the customer relationship, the screens and much of the support. The **partner** owns the regulated work and, by contract, most of the liability, but not all of it.

The arrangement only works if the line between the two is drawn in data. Every embedded payroll API exposes the same handful of seams: a company that must finish onboarding before it can pay anyone, a payroll object that moves through states with deadlines, money that fails in ways the platform must surface, webhooks that tell the platform what changed, and pre-built components for the screens the platform doesn't want to build. This chapter covers why vertical software embeds payroll, the partners and their object models, onboarding as a state machine, the payroll state machine across Check, Gusto Embedded and Zeal, webhooks, components, and partner liability and risk: what the partner owns and what stays with the platform. The economics (revenue share against credit losses) are in [How Payroll Providers Make Money](/books/workforce/revenue-models#embedded-payroll-economics); the debit timing these APIs expose is in [Funding a Payroll](/books/workforce/funding-a-payroll); reading payroll data out of many providers at once is [Unified HR & Payroll APIs](/books/workforce/unified-hr-apis), the next chapter.

## Why Vertical Software Embeds Payroll

A vertical software company sells to one kind of business, and payroll is the largest recurring money flow most of those businesses run. Three reasons push it to embed:

- **It already has the inputs.** A point of sale knows clock-ins and tips, a scheduler knows shifts, a field service app knows jobs and hours. Without payroll, the customer exports those hours to a payroll provider and retypes corrections in two places; with payroll inside, approved time becomes a pay run without a file. Square Payroll is the public example of a platform doing this with its own engine: it imports timecards from its point of sale, tracks direct tips, and offers pay into its own wallet ([Square: Payroll pricing](https://squareup.com/us/en/payroll/pricing)).
- **It earns per worker, every month.** Payroll is priced per employee per month in most of the market ([Per Employee per Month](/books/workforce/revenue-models#per-employee-per-month)), and the partners pitch the adjacent lines (benefits, 401(k), workers' compensation, pay cards) as new revenue for the platform ([Embedded Payroll Economics](/books/workforce/revenue-models#embedded-payroll-economics)).
- **It keeps the customer.** Payroll is the hardest system for an employer to replace mid-year ([Changing Providers Mid-Year](/books/workforce/changing-providers) covers why), so a platform that runs payroll is a platform the customer stays on.

Building the engine instead means registering with every tax agency the customers touch, maintaining tax rules in thousands of jurisdictions, originating ACH as a third-party sender, filing returns under each employer's EIN, answering notices, and carrying the credit risk of paying before a debit clears. Embedded partners exist because that list is a business of its own; a platform that wants payroll in months rather than years buys it.

## How the Platforms Do It

The embedded payroll partners as their public documentation describes them, as of November 2026:

| Partner | What it exposes | Run and money mechanics | Components and events |
| --- | --- | --- | --- |
| **Check** | Companies, employees, contractors, workplaces, bank accounts, net pay splits, payrolls, payroll items, contractor payments, earning codes and rates, pay schedules, benefits, post-tax deductions, tax parameters and elections, tax deposits, company filings, corrections | Payroll statuses `draft`, `pending`, `processing`, `paid` and `partially_paid`, plus `failed` when the employer's debit returns; payrolls whose `approval_deadline` is that day are collected at 5pm PT, and the employer debit "will take up to 3 business days to complete"; a Tax Deposit is created at approval and paid only when `funded` | More than 30 Components ("pre-built payroll flows that you add to your application with a few lines of code"); 33 webhook topics, each request marked with a `Check-Topic` header and signed with HMAC-SHA-256 |
| **Everee** | Workers, payroll runs, payroll calendars, payables, early pay, tax documents and payroll tax reports | A Payables API for creating and paying out payable items, and an Early Pay API | Embeddable worker onboarding and pay card signup; company and partner webhook events |
| **Gusto Embedded** | Partner-managed companies (locations, bank accounts, federal tax details, tax requirements, signatories), employees with jobs, compensations and garnishments, contractors and payment groups, payrolls (off-cycle, calculate, submit, cancel), pay schedules, external payrolls, time off, general ledger reports | Statuses Unprocessed, Submitted, Pending and Paid around a 4:00pm PT `payroll_deadline`; next-day, 2-day and 4-day speeds; recovery cases for failed debits, transferred to the partner after 90 days | Flows ("ready-to-use UI components, built on top of Gusto Embedded's API") that expire after an hour idle; webhooks signed with `X-Gusto-Signature`, retried "up to 16 times over the course of 3 days"; an Events API |
| **Salsa** | Employers, workers and payroll runs through REST; a new payroll run "will have a status of PENDING" | Hosted employer and worker onboarding, a run payroll experience to "view and update any inputs, review the calculated results" before confirming, and employer tax setup and document signing to "pay and file payroll taxes" | Salsa.js pre-built UI elements; webhooks "used by Salsa to notify you of changes in your account" |
| **Zeal** | Companies, work locations, W-2 employees, 1099 contractors, employee checks and contractor payments | Employee checks with the same `check_date` are batched into one employer check at 2 PM PT two days before the check date; Zeal "automatically batches, processes, and settles funds on the pay date - and files taxes on the employer's behalf" | "White-label components and REST APIs"; webhook events for company, employee and contractor onboarding and job queue status, with a `Puzzl-Signature` header |

Three things the table shows. **The object model converges.** Every partner has a company that onboards, workers in two kinds (employees and contractors), a pay schedule, a payroll or check that is calculated and then committed, and payments that can fail. The names differ (a Zeal employee check is a Check payroll item is a Gusto employee compensation inside a payroll), and the core model in [The Workforce Business](/books/workforce/workforce-business#the-core-data-model) maps each one to `pay_runs` and `pay_statements`. **Deadlines are part of the API.** Every partner publishes a time of day after which a payroll can no longer change, and a speed that decides when the employer is debited; the platform's screens have to show both, because the employer experiences them as the product. **Risk is published as fields.** Funding strikes, recovery cases, payroll blockers and fast payment limits are API objects, so a platform can build the experience of a failed debit before it happens, and its contract tells it which of those losses become its own.

## The Object Model, Mapped

A platform integrating a partner keeps its own records of the same concepts, for its screens, its billing and the day it changes partners. The mapping to the volume's core tables:

| Core table | Check | Gusto Embedded | Zeal |
| --- | --- | --- | --- |
| `companies`, `employers` | Company (one per employer; `company_processing_status`, `company_terminated` topics) | Partner-managed company, with federal tax details and signatory | Company |
| `work_locations` | Workplace | Location | Work location |
| `workers` (`worker_type`) | Employee, contractor | Employee, contractor | Employee, contractor |
| `pay_schedules`, `pay_periods` | Pay schedule, with paydays carrying `approval_deadline` | Pay schedule and assignments | Check date on each employee check |
| `pay_runs` | Payroll | Payroll (regular or off-cycle) | The batch of employee checks with one `check_date` |
| `pay_statements` | Payroll item, contractor payment | Employee compensation within a payroll | Employee check, contractor payment |
| `pay_distributions` | Net pay split | Payment method | Worker bank details |
| `money_movements` | Payment (with `failure_code`, `can_retry`) | Debits and recovery cases | Bank transfers settled on the pay date |
| `liabilities`, `remittances` | Tax deposit | Tax liabilities and payments | Tax filing on the employer's behalf |
| `filings` | Company filing, tax package | Forms | Taxes filed in all 50 states |

My rule for the platform's side: keep the partner's identifiers on the platform's own rows (`partner_ref` beside the core `id`), mirror the partner's states as events rather than overwrite a status column, and never compute pay in two places. The platform owns inputs (hours, rates, tips, deductions its customers configure); the partner owns outputs (statements, taxes, liabilities). A platform that recomputes net pay to show a preview before calling the partner will eventually show a number the partner doesn't pay. Every partner offers a calculation endpoint (Gusto's payrolls have "prepare" and "calculate" steps; Check's payroll in `draft` returns calculated items), and the preview should be that response.

## Onboarding as a State Machine

A company can't run payroll until the partner has what the law and its own risk policy need: the legal entity and EIN, addresses, tax registrations in each state where people work, a verified funding account with authority to debit it, signed agency authorizations, and at least one worker ready to pay. Each partner models the gap as data the platform can show:

- **Check** reports an onboard status per company of `completed` ("onboarded and ready to process payroll"), `needs_attention` (payroll can run but "running payroll may produce different calculations than intended") or `blocking` ("missing critical information that will prevent us from running payroll"), by category: `bank_account` (link the account, verify it through Plaid, authorize the debit), `setup_parameters` (a jurisdiction's taxes not set up; marking a parameter as applied for moves it to `needs_attention`) and `filing_authorization` (required forms not submitted).
- **Gusto Embedded** sequences the steps: create the company and accept terms; in parallel add locations, a bank account, federal tax details, an industry and a pay schedule; create employees with work addresses and onboard at least one; complete state tax setup per state; verify the bank account by micro-deposits ("1-2 business days"); add a signatory and sign forms; call finish onboarding; then wait for Gusto's risk team, where "auto-approval can happen in as little as 15 minutes" but review can take up to two business days, signaled by the `company.approved` webhook. Afterwards, payroll blockers name what stops a run: `missing_bank_verification`, `missing_state_tax_setup`, `missing_signatory`, `geocode_error`, `pending_recovery_case`, `suspended` and others.
- **Zeal** has the platform create a company, verify its bank account by micro-deposits, collect authorization documents and mark it onboarded, then onboard workers with tax paperwork and bank details, with a `company_onboarding` webhook when it completes.

Three properties are common and worth copying. **Blocking and advisory are different states.** A missing state unemployment account number can be "applied for" and payroll can run while the agency issues it (the [registration](/books/workforce/state-and-local-tax) is the employer's either way); a missing debit authorization can't be worked around. **The partner's risk review is a state the platform doesn't control.** The platform shows "under review" and waits for an event. **Readiness is per run, not once.** A company that was ready last month can be blocked today by a recovery case, a suspension or a new state with no registration, so the platform calls the blockers endpoint, or listens for the event, before every run rather than trusting onboarding.

In the core model that is one row per company per requirement, with a status the partner sets and the platform reads (the `company_onboarding_states` table below). Gusto's blocker keys and Check's categories map onto one list of requirement keys, so a platform that changes partners doesn't rebuild its onboarding screens.

## The Payroll State Machine

A pay run in every embedded API moves from editable to committed to funded to paid, with a deadline between editable and committed and exceptions for a returned debit and a returned credit. The three partners' states, mapped to the core `pay_runs.status`:

| Core `pay_runs.status` | Check | Gusto Embedded | Zeal |
| --- | --- | --- | --- |
| `draft`, `calculated` | `draft` | Unprocessed (`processed: false`); "editable" and can be skipped | Employee checks created through the API, editable until batched |
| `approved` | `pending`: approved, "its status changes to `pending`"; can be reopened until the `reopen_deadline` | Submitted: "submitted to Gusto for processing but bank debits have not been initiated yet"; cancelable back to Unprocessed | Approved in the run payroll flow before the batch cutoff |
| `funding` | `processing`: after the `reopen_deadline` passes | Pending: "company bank debits have been initiated," from 4:00pm PT on the `payroll_deadline` | Batched "into one Employer Check" at 2 PM PT two days before the check date |
| `paid` | `paid`, when the transactions complete | Paid, on the `check_date`: "employee direct deposit payments have been initiated" | Funds settled on the pay date |
| `failed` | `failed`, when the employer's cash requirement debit is returned | A recovery case opens; the payroll was paid, and "Payroll will be blocked until the recovery case is resolved" | (not described in the pages I opened) |
| (exception) | `partially_paid`, when an employee or contractor payment fails | Handled per payment | (not described in the pages I opened) |

![A state machine for an embedded pay run. Draft moves to calculated on preview, calculated to approved on approve, approved to funding at the deadline, and funding to paid on the check date, all accented as the path a pay run should take. A back edge from approved to draft is labeled reopened before the deadline: inputs unlock. Dashed exception edges run from approved to canceled, from funding to failed when the client debit is returned, and from paid to partially_paid when a credit returns. A plain edge from failed back to funding is labeled wired. Canceled and paid have double outlines as terminal states.](/diagrams/wf-embedded-payroll-states.svg "The pay run state machine every embedded partner exposes in its own names. Check calls approved pending and funding processing; Gusto Embedded calls them Submitted and Pending. The deadline between approved and funding is where inputs stop changing.")

The deadlines are what the platform builds its calendar around. Worked for a Friday, November 20, 2026 check date, with the partners' published rules:

| Partner and speed | Last moment to change the payroll | Employer debit |
| --- | --- | --- |
| Gusto Embedded, 4-day | Submit by 4:00pm PT on Monday, November 16 | Monday; "successful or unsuccessful by Thursday" |
| Gusto Embedded, 2-day | 4:00pm PT on Wednesday, November 18 | Wednesday |
| Gusto Embedded, next-day | 4:00pm PT on Thursday, November 19 | Thursday |
| Check | The `reopen_deadline` on the approval deadline day: the later of 11am ET or one hour after approval, capped at the `approval_deadline`; collected at 5pm PT that day | Up to 3 business days |
| Zeal | 2 PM PT on Wednesday, November 18 (12:30 PM PT for one-day speed checks) | Gross total debited for payment by the check date |

Check's reopen window is worth working through, because it decides when a platform can still edit. If the payroll's `approval_deadline` is Monday, November 16 and the admin approves at 9:30am ET, the `reopen_deadline` is 11am ET (the later of 11am ET and 10:30am ET). Approved at 2:00pm ET, it is 3:00pm ET. Approved at 7:30pm ET, one hour later would be 8:30pm ET, past the deadline of 5pm PT (8pm ET), so the cap makes it 8:00pm ET. Until then the payroll can return to `draft`; after it, taxes and net pay are locked and the run is `processing`. Gusto has the same idea without a separate window: a Submitted payroll can be canceled back to Unprocessed until 4:00pm PT on the deadline, and after that only an off-cycle correction changes anything.

Speed is credit, not convenience. On Gusto's 2-day and next-day speeds, "Gusto is initiating the transfer of funds from Gusto to the employee before we have confirmed a cleared debit," and a `fast_payment_limit` pushes aggregate payrolls in 24 hours above the limit "from next-day or 2-day to 4-day." Check records "a funding strike against the company" for each failed funding, and active strikes "factor into Check's processing period demotion and termination decisions." [Funding a Payroll](/books/workforce/funding-a-payroll#debit-timing-four-day-to-same-day) works the underwriting and [When the Debit Fails](/books/workforce/failed-debits-and-recovery) the recovery; for the platform, the point is that the speed shown to a customer can change without the customer doing anything, and the screen must say why.

## Webhooks

Embedded payroll is asynchronous: approval returns immediately, the debit settles days later, a credit returns a week after that, an agency rejects a filing next quarter. Webhooks carry those changes to the platform, and the partners publish how theirs behave:

| Partner | Signature | Retries | Payload |
| --- | --- | --- | --- |
| Check | `Check-Signature`: a "base-16 (hex) encoded HMAC-SHA-256 hash of the raw request body" keyed with the webhook config's key | Exponential backoff for up to four days, starting at 10 seconds and capped at 6 hours; respond 2XX "within 5 seconds"; repeated failures may deactivate the config | `event` and `data` (the changed object, in the config's API version); `Check-Topic` and `Check-WebhookEvent-ID` headers |
| Gusto Embedded | `X-Gusto-Signature`: an HMAC with SHA256 keyed by the subscription's `verification_token` | "Up to 16 times over the course of 3 days"; respond 2xx "within 10 seconds" | `event_type`, `resource_type` (always Company), `resource_uuid`, `entity_type`, `entity_uuid`, `timestamp`, `uuid`; an Events API for everything |
| Zeal | `Puzzl-Signature` carrying the webhook secret, compared directly | May retry on a non-2xx response | `company_onboarding`, `employee_onboarding`, `contractor_onboarding`, `job_queue_status_change` |

The rules a platform's receiver follows are the playbook's ([Receiving Their Webhooks](/docs/building-blocks/integrations#receiving-their-webhooks), [Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)); the payroll-specific ones are four:

- **Store before acting, and acknowledge fast.** Check's five-second limit and Gusto's ten-second limit mean the receiver verifies, writes the raw delivery and its ID, returns 2xx, and processes from its own queue.
- **Deduplicate on the partner's event ID.** Check says "It is possible, though rare, that you may receive a webhook request that you've already successfully processed," and suggests storing processed IDs; Gusto retries 16 times. A `payment` status change applied twice must not notify an employee twice or reopen a resolved case.
- **Treat the event as a pointer, then read the object.** Gusto's payload names the entity and its UUID, not its new state; Check's carries the object, but ordering isn't promised in what I read. Fetch the current object and apply it if it is newer than what the platform holds, keyed on the object's own timestamps or version, never arrival order.
- **Reconcile with polling.** A deactivated config or a long outage loses events. Gusto's Events API and Check's list endpoints let a nightly job compare partner state with platform state for every run in flight; any difference is a missed event.

Verifying the signature is the one piece of code every platform writes. Check's scheme, hex HMAC-SHA-256 over the raw body, compared in constant time:

```go tab="Go"
// VerifyCheckSignature reports whether a webhook body was signed with key.
// The header is a hex-encoded HMAC-SHA-256 of the raw body, before any JSON parsing.
func VerifyCheckSignature(key, body []byte, header string) bool {
	got, err := hex.DecodeString(header)
	if err != nil {
		return false
	}
	mac := hmac.New(sha256.New, key)
	mac.Write(body)
	return hmac.Equal(got, mac.Sum(nil)) // constant time
}
```

```rust tab="Rust"
use hmac::{Hmac, Mac};
use sha2::Sha256;

/// Reports whether a webhook body was signed with `key`. The header is a
/// hex-encoded HMAC-SHA-256 of the raw body, before any JSON parsing.
pub fn verify_check_signature(key: &[u8], body: &[u8], header: &str) -> bool {
    let Ok(got) = hex::decode(header) else { return false };
    let mut mac = Hmac::<Sha256>::new_from_slice(key).expect("any key length");
    mac.update(body);
    mac.verify_slice(&got).is_ok() // constant time
}
```

## Components

Some screens are expensive to build and regulated in their content: the W-4 and state withholding forms, bank account linking, the employer's agency authorizations and signatures, year-to-date pay history, pay stubs and tax documents. Every partner offers them pre-built. Check's library has "over 30 components," grouped into setup (business details, connect bank account, signatory agreements, pay history, employee tax setup, rosters), a bundled Company Onboard (terms of service, tax setup, filing authorization, authorization documents), operations (tax documents, reports, Run Payroll, a filing preparation checklist) and employee and contractor self-service (profile, benefits, post-tax deductions, tax documents, paystubs). Gusto's Flows "can be hosted in a new tab or iframed into your application," report events to the parent through `postMessage`, and "expire after 1 hour of inactivity and automatically deactivate 24 hours from creation time." Zeal offers white-label employer and worker dashboards, Salsa its Salsa.js elements, Everee embeddable worker onboarding and pay card signup.

My default: use the partner's components for anything that is a government form, a signature or a bank link, and build the platform's own screens for the run itself, where the platform's data (hours, tips, jobs) is the point. A component that renders a W-4 is maintained by the partner when the IRS changes the form; a W-4 the platform built is maintained by nobody until it's wrong. The cost is a seam in the experience (an iframe, a link that expires), and the platform needs to handle the component's events (completed, closed, expired) as state changes like any webhook.

## Partner Liability and Risk

The partner is the payroll provider in law: it originates the ACH, deposits taxes under each employer's EIN as the employer's agent, and files the returns, so the [IRS's third-party arrangements](/books/workforce/who-runs-payroll#the-irs-s-five-arrangements) apply to it, not to the platform. The employer stays "ultimately responsible for the deposit and payment of federal tax liabilities" whoever makes them. The platform's exposure comes through the contract and the money, and the public docs show where it lands:

- **Credit losses on fast payroll.** On Gusto Embedded, a failed fast-payroll debit not collected from the company is "transferred to you (after 90 days)," and in a recovery case the partner "must initiate the redebit" within 90 days or "the liability will be transferred to the partner." A platform that offers next-day payroll to win customers is underwriting those customers. [Who Eats the Loss](/books/workforce/failed-debits-and-recovery#who-eats-the-loss) works the chain.
- **Approval before production.** Gusto requires "commercial, security, and implementation conversations/ reviews" before a partner moves to production. The partner is trusting the platform's identity checks, admin permissions and security, because a platform account takeover becomes a payroll fraud on the partner's rails.
- **Customer approval.** The partner's risk team approves each company (Gusto's `company.approved`), can suspend it (`suspended` blocker) and can demote its speed. The platform can't override any of it, and its sales promises can't either.
- **Support and errors.** When a platform passes wrong inputs (an hour code mapped to the wrong earning type, a rate in the wrong field), the partner calculates correctly from wrong data. Who pays for the correction, the penalty or the angry employee is the contract's question; the platform's defense is an input audit trail that shows what it sent.

What each side owns, as the public material divides it:

| The partner | The platform |
| --- | --- |
| Gross-to-net, tax rules and their updates | The inputs: hours, rates, tips, deductions it configures |
| Agency registrations it handles, deposits, returns, notices it receives as agent | Getting the employer through onboarding and keeping it unblocked |
| ACH origination, the debit, credits, returns | The experience of a failed debit, and credit losses its contract assigns to it |
| Pre-built forms and components | Its own screens, admin permissions and account security |
| Approving, demoting and suspending companies | Explaining those decisions to its customer |

The contract terms that set the split (revenue share, loss sharing, support tiers, termination and data portability) aren't public for any partner I could read.
<!-- source-gap: wf-embedded-contract-terms | missing | embedded payroll partner contract terms: loss sharing beyond Gusto's 90-day rule, support obligations, data portability on termination | closes with: a published partner agreement or a filing describing embedded payroll partner terms | checked: 2026-11-10 -->

## Versions and Change

A payroll API changes every year because the forms do. Gusto uses "date-based versioning" set with an `X-Gusto-API-Version` header, and "every API version receives 12 months of phased support" after deprecation: six months of full support, six of critical security fixes only, then `406 Not Acceptable`; responses carry `Deprecation`, `Link` and `Sunset` headers. Check's webhook payloads follow the config's `api_version`. Check's previous-provider component is "slated for deprecation" with its Embedded Setup, which ends January 1, 2027. A platform pins a version per integration, alerts on deprecation headers, and plans upgrades outside the January rush ([Payroll Platform Architecture](/books/workforce/payroll-architecture) covers peak periods).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model) for a platform that embeds a partner, and they also describe a partner's own model of the platforms it serves. `companies` and `pay_runs` exist; this chapter adds the partner platform record, the per-company onboarding requirements, and webhook subscriptions and deliveries. `pay_run_events` already records every state change; partner events become rows in it with the partner as actor.

```sql
-- The other side of the integration: a partner (seen from a platform) or a platform (seen from a partner).
CREATE TABLE partner_platforms (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  name                TEXT NOT NULL,
  role                TEXT NOT NULL CHECK (role IN ('payroll_partner', 'platform')),
  environment         TEXT NOT NULL CHECK (environment IN ('sandbox', 'production')),
  api_version         TEXT NOT NULL,         -- pinned, e.g. a date version
  api_version_sunset_on DATE,                -- from Sunset headers, for the upgrade plan
  approved_for_production_at TIMESTAMPTZ,
  loss_transfer_days  SMALLINT,              -- contract: when an uncollected debit becomes the platform's
  status              TEXT NOT NULL CHECK (status IN ('building', 'in_review', 'live', 'suspended',
                        'terminated')),
  UNIQUE (name, environment)
);

ALTER TABLE companies
  ADD COLUMN partner_platform_id UUID REFERENCES partner_platforms (id),
  ADD COLUMN partner_ref         TEXT;       -- the partner's company ID

ALTER TABLE pay_runs  ADD COLUMN partner_ref TEXT;    -- the partner's payroll ID
ALTER TABLE workers   ADD COLUMN partner_ref TEXT;

-- One row per company per requirement; the partner sets it, the platform reads it.
CREATE TABLE company_onboarding_states (
  company_id          UUID NOT NULL REFERENCES companies (id),
  employer_id         UUID REFERENCES employers (id),   -- most requirements are per EIN
  requirement         TEXT NOT NULL,         -- normalized: 'bank_account_verified', 'debit_authorized',
                                             -- 'federal_tax_setup', 'state_tax_setup:US-CA',
                                             -- 'filing_authorization', 'signatory', 'risk_review',
                                             -- 'geocode', 'recovery_case_open', 'suspended', ...
  severity            TEXT NOT NULL CHECK (severity IN ('blocking', 'needs_attention', 'complete')),
  partner_code        TEXT,                  -- 'missing_bank_verification', 'setup_parameters', ...
  detail              JSONB NOT NULL DEFAULT '{}',
  updated_from        TEXT NOT NULL CHECK (updated_from IN ('webhook', 'poll', 'platform')),
  updated_at          TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (company_id, requirement)
);

-- What the platform subscribed to, per partner.
CREATE TABLE webhook_subscriptions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_platform_id UUID NOT NULL REFERENCES partner_platforms (id),
  partner_subscription_ref TEXT NOT NULL,
  url                 TEXT NOT NULL,
  topics              TEXT[] NOT NULL,       -- 'payroll', 'payment', 'company', ...
  secret_ref          TEXT NOT NULL,         -- vaulted signing key or verification token
  api_version         TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('pending_verification', 'active', 'disabled')),
  verified_at         TIMESTAMPTZ
);

-- Every delivery as received, before it is processed.
CREATE TABLE webhook_deliveries (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  webhook_subscription_id UUID NOT NULL REFERENCES webhook_subscriptions (id),
  partner_event_id    TEXT NOT NULL,         -- Check-WebhookEvent-ID, the payload uuid, ...
  topic               TEXT NOT NULL,
  entity_type         TEXT,
  entity_ref          TEXT,                  -- the partner's ID of the changed object
  signature_valid     BOOLEAN NOT NULL,
  body                JSONB NOT NULL,        -- raw, as received
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ,
  outcome             TEXT CHECK (outcome IN ('applied', 'stale', 'duplicate', 'ignored', 'failed')),
  error               TEXT,
  UNIQUE (webhook_subscription_id, partner_event_id)
);

-- Runs in flight where the platform and partner disagree: the nightly reconciliation.
SELECT r.id, r.partner_ref, r.status AS platform_status, p.partner_status
FROM pay_runs r
JOIN partner_run_snapshot p ON p.partner_ref = r.partner_ref   -- loaded from the partner's list API
WHERE r.status NOT IN ('paid', 'canceled')
  AND r.status <> p.mapped_status;
```

Design notes:

- **Map partner codes to one requirement list.** `company_onboarding_states.requirement` is the platform's vocabulary; `partner_code` keeps the partner's. Gusto's `missing_state_tax_setup` and Check's `setup_parameters` both become `state_tax_setup:<state>`, so screens and alerts don't change with the partner.
- **Partner states arrive as events.** A webhook that moves a payroll to `processing` writes a `pay_run_events` row with the partner as actor and the delivery ID in `detail`, then updates `pay_runs.status`; the history survives even if the partner later corrects itself.
- **The unique delivery key is the idempotency guard.** `UNIQUE (webhook_subscription_id, partner_event_id)` turns a retried delivery into an insert conflict recorded as `duplicate`.
- **Stale is an outcome.** A delivery older than the object the platform already holds is stored and marked `stale`, not applied, which is how out-of-order delivery stays harmless.
- **Contract terms as data.** `loss_transfer_days` lets the credit-loss report know when a recovery case becomes the platform's balance sheet item, rather than learning it from an invoice.
- **Events out:** `company.onboarding_blocked`, `pay_run.deadline_approaching`, `pay_run.funding_failed` and `payment.returned` are what the platform's notifications and support queues subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

An embedded payroll has two record keepers, and a dispute (an employee paid wrong, an employer charged twice, a debit that failed after the platform said it wouldn't) needs both sides to agree. Keep:

- **Every input the platform sent,** with the request, the idempotency key and the partner's response, so "what did we tell the partner" is a lookup ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **Every webhook as received,** with its signature result and outcome, for as long as the pay records it touched.
- **Onboarding requirement history,** so a blocked payroll can be explained by the requirement and the time it changed.
- **Deadline and speed shown to the customer,** at approval, so a complaint about a late deposit is checked against what the screen promised.
- **The contract's loss terms and every recovery case** that reached them, for the platform's own auditors.

## What This Means for the System You Build

- **Own the inputs, not the outputs.** Send hours, rates and deductions; show the partner's calculation as the preview, never a recomputation of your own.
- **Map partner objects to the core model** and keep the partner's IDs beside your own, so a second partner is a mapping rather than a rewrite.
- **Model onboarding as requirements with severities,** checked before every run, not once.
- **Put the partner's deadlines and speed on the approval screen,** and treat a demotion as an event the customer is told about.
- **Store, verify and deduplicate every webhook before acting,** apply it only if it is newer than what you hold, and reconcile in-flight runs nightly.
- **Use the partner's components for forms, signatures and bank links;** build the run experience around your own data.
- **Read the loss terms as a credit policy.** Offering fast payroll on an embedded partner is lending, and the contract says how much is yours.

## References

**Agency guidance and forms**

- [IRS: Outsourcing payroll duties](https://www.irs.gov/businesses/small-businesses-self-employed/outsourcing-payroll-duties), the employer's ultimate responsibility for deposits made by a provider

**Vendor documentation**

- [Check: Life of a payroll](https://docs.checkhq.com/docs/life-of-a-payroll.md), payroll statuses, `reopen_deadline`, the 5pm PT collection, the up to 3 business day debit and the release of net pay
- [Check: Onboard status](https://docs.checkhq.com/docs/onboard-status.md), `completed`, `needs_attention` and `blocking`, and the bank account, setup parameter and filing authorization categories
- [Check: Webhook event types](https://docs.checkhq.com/docs/webhook-event-types.md), the 33 topics and the `Check-Topic` header
- [Check: The shape of your webhook endpoint](https://docs.checkhq.com/docs/the-shape-of-your-webhook-endpoint.md), `Check-Signature`, hex HMAC-SHA-256, the four-day retry schedule, the five-second limit and duplicate deliveries
- [Check: Handling failed payments](https://docs.checkhq.com/docs/handling-failed-payments.md), failure codes, retries and funding strikes
- [Check: Tax deposits](https://docs.checkhq.com/docs/tax-deposits.md), deposits created at approval and paid only when funded
- [Check: Components](https://docs.checkhq.com/docs/check-components.md), the component library and its groups
- [Check: Previous payroll provider access](https://docs.checkhq.com/reference/previous-payroll-provider-access.md), the component's deprecation with Embedded Setup on January 1, 2027
- [Gusto Embedded: Introduction](https://docs.gusto.com/embedded-payroll/docs/introduction.md), partner reviews before production
- [Gusto Embedded: Onboard a company](https://docs.gusto.com/embedded-payroll/docs/onboard-a-company.md), the onboarding sequence, micro-deposit timing, risk review and `company.approved`
- [Gusto Embedded: Payroll blockers](https://docs.gusto.com/embedded-payroll/docs/payroll-blockers.md), the blocker keys
- [Gusto Embedded: Payroll statuses](https://docs.gusto.com/embedded-payroll/docs/payroll-statuses.md), Unprocessed, Submitted, Pending and Paid and the 4:00pm PT deadline
- [Gusto Embedded: Payroll processing speeds](https://docs.gusto.com/embedded-payroll/docs/2-day-vs-4-day.md), speeds, debit days, paying before a cleared debit, the fast payment limit and the 90-day transfer
- [Gusto Embedded: Recovery cases](https://docs.gusto.com/embedded-payroll/docs/recovery-cases-1.md), R01 re-debit, blocked payroll, the 90-day transfer to the partner and five bank errors
- [Gusto Embedded: Webhooks](https://docs.gusto.com/embedded-payroll/docs/webhooks.md), verification tokens, `X-Gusto-Signature`, retries and payload fields
- [Gusto Embedded: Flows](https://docs.gusto.com/embedded-payroll/docs/gusto-flows-pre-built-ui.md), pre-built UI, iframes, `postMessage` and expiry
- [Gusto Embedded: API versioning](https://docs.gusto.com/embedded-payroll/docs/api-versioning.md), date versions, the version header and 12 months of phased support
- [Gusto Embedded: Documentation index](https://docs.gusto.com/embedded-payroll/llms.txt), the object families and events API
- [Zeal: Documentation](https://docs.zeal.com/), objects, company onboarding with micro-deposits and authorization documents, white-label components and settlement on the pay date
- [Zeal: Running payroll](https://docs.zeal.com/docs/employee-checks-guide.md), batching employee checks at 2 PM PT two days before the check date
- [Zeal: Webhook events](https://docs.zeal.com/reference/webhooks/webhook-events.md), event names and the `Puzzl-Signature` header
- [Salsa: Documentation](https://docs.salsa.dev/), hosted onboarding, run payroll, Salsa.js and webhooks
- [Everee: Developer documentation](https://developer.everee.com/), payroll infrastructure, payables, early pay, embedded onboarding and webhooks
- [Square: Payroll pricing](https://squareup.com/us/en/payroll/pricing), timecard import, tip tracking and pay into Square's wallet
