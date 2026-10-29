+++
title = "One-Time Services & Upsells"
description = "One-time work beside recurring plans: when it needs its own agreement, member pricing on a shared route, converting customers to plans, and upselling."
category = "Field Operations Industry"
order = 1524
part = "Selling"
tags = ["field-operations", "sales", "one-time-services", "upselling", "conversion", "agreements"]
+++

Most field businesses sell two things to the same people: a plan, and everything the plan doesn't cover. A quarterly pest customer brings bed bugs home from a trip. A lawn customer wants aeration in September. A pool owner needs an acid wash after a green-out. An HVAC member's blower motor fails in July. A recurring cleaning client moves out. A furniture buyer pays for assembly. Some of that work comes from strangers who might become plan customers; some comes from plan customers who might buy more. The pieces already have homes in this volume: the agreement in [Service Agreements & Plans](/books/field-operations/service-agreements), prices in [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules), the signing packet in [Signing the Agreement](/books/field-operations/signing-the-agreement), pay in [Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions) and invoices in [Billing Recurring Service](/books/field-operations/billing-recurring-service).

This chapter owns the joins between them: when one-time work needs a signed agreement of its own, how it shares an account and a route with a plan, how a one-time customer becomes a plan customer, and how upselling runs as a system with records instead of as one technician's habit. The product version, a one-time add-on riding on a subscription's next shipment, is the Commerce volume's [Skip, Pause, Swap and Upgrade](/books/commerce/subscription-commerce#skip-pause-swap-and-upgrade), and its discounts are [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards).

## What One-Time Work Looks Like

Every trade has work that happens once, and most of it leads somewhere:

| Trade | Typical one-time work | Where it often leads |
| --- | --- | --- |
| Pest | Bed bug treatment, wildlife removal and exclusion, a one-time general treatment, a wasp nest, a termite treatment | A quarterly plan; a termite warranty renewal |
| HVAC and plumbing | A repair, a diagnostic, a replacement | A maintenance membership |
| Cleaning | A deep clean, a move-in or move-out clean | Recurring cleaning, with the deep clean as the first visit |
| Lawn | Aeration, overseeding, a cleanup | A round-based program |
| Pool | Opening, closing, an acid wash, an equipment repair | Weekly service |
| Delivery | Each order; assembly, room-of-choice placement, haul-away | Nothing recurring: the order is the unit |

The platforms model it in two ways. **Jobber** has two kinds of job: one-off jobs, single visits or multi-visit projects invoiced at the end, and recurring jobs ("For work that repeats on a regular schedule, create a recurring job instead"). **FieldRoutes** puts a "One Time" choice in a subscription's frequency list, so a one-time pest service is a subscription with one service, priced, attributed and reported like any plan. **Skimmer** keeps pool repairs and one-off jobs as work orders that stay unscheduled until a technician and date are assigned, at which point they appear on the route. **FarEye** carries delivery extras as value-added service codes on the order (`INSTALLATION`, `ASSEMBLY`, `HAUL_AWAY_OLD`) with extended dwell time at the stop. In this volume's model, one-off work is a work order with a null `agreement_id` ([The Core Data Model](/books/field-operations/field-operations-business#the-core-data-model)), which is right until the work needs signed terms, covered below.

**The initial service is the bridge.** A heavier, higher-priced first visit starts many plans: a pest clean-out, a pool startup, a deep clean before maid service. It isn't one-time work. It belongs to the agreement, priced from the plan version's initial amount, and it's the reason one-time customers convert well: a customer who just paid for a one-time treatment has already received something close to the plan's first visit. FieldRoutes prices it from an initial invoice template ("The standard cost of a single service") and lets the business choose when it bills: after initial completion (the default), after the agreement is signed, on an initial billing date or on a custom schedule. Its contract value counts the initial charge minus any discount plus the recurring charge minus any discount times the number of services, so the initial visit is part of what the sale is worth.

## When One-Time Work Needs an Agreement

A no-heat call booked by phone and approved on an estimate needs no agreement: the approved estimate is the authorization, and the work order carries the price ([Options at the Door](/books/field-operations/repair-and-installation#options-at-the-door)). Plenty of one-time work needs more than a price approval:

- **Authority to enter and work.** A tenant can let a technician in for a wasp nest, but sealing a roofline against squirrels or replacing a water heater usually needs the owner or the property manager. Authority is a role attribute on the contact ([People, Roles and Preferences](/books/field-operations/customers-and-properties#people-roles-and-preferences)), so the record has to say who authorized the work and in which role, not just that someone signed.
- **Notice or consent for chemical applications.** Some states require notice before an application, to the customer, to occupants or to registered neighbors. The obligations and how to schedule around them are in [Regulated Materials](/books/field-operations/regulated-materials#weather-location-and-sensitive-places); the agreement's job is to capture the customer's acknowledgment and the occupants who need to be told.
- **Preparation, scope and waivers.** A bed bug treatment only works if the customer launders, bags and moves furniture first, and pest trade guidance suggests having customers sign the prep sheet "so there is no confusion." An exclusion job states which openings get sealed; an acid wash states the risk to an old plaster surface. Liability limits are worth writing down, and whether a given waiver holds is a state-law question for counsel.
- **The right to cancel.** A one-time job sold in the home is a home-solicitation sale like any plan. A technician selling a rodent exclusion in the kitchen makes a door-to-door sale, and the cancellation window, notice and refund deadline apply ([The Sale at the Door](/books/field-operations/consumer-protection#the-sale-at-the-door)). The handwritten emergency waiver from [Repair, Install & Commercial Work](/books/field-operations/repair-and-installation#options-at-the-door) is a document in this packet.
- **Warranty terms that outlive the visit.** A termite treatment happens once and is guaranteed for years. Florida requires the first page of a wood-destroying organism contract to say in bold whether it's offered for repair and retreatment, retreatment only, or with no warranty, and bars "full" or "unlimited" next to "guarantee" or "warranty" when there are limits. The renewal that follows is a renewal agreement ([Warranties and Guarantees](/books/field-operations/service-agreements#warranties-and-guarantees)).
- **Contracts with deposits and permits.** An install is a one-time sale with a contract, a payment schedule, often financing and a permit ([Installs and Projects](/books/field-operations/repair-and-installation#installs-and-projects)).

### The Model: An Agreement Kind

My choice is to make the one-time agreement a kind of agreement, not a new table: `agreements.kind` is `recurring` or `one_time`. Everything a signed one-time sale needs already hangs off `agreements`: the signing packet (`agreement_documents`), the sale facts that decide which cancellation rule applies (`sold_via`, `sale_location_kind`, the computed deadline), the state machine in which `signed` isn't `active`, cancellation with a refund deadline, and the `agreement.signed` and `agreement.activated` events commissions read. A separate work authorization table would need its own copy of every one of those, and the cooling-off logic would fork into two implementations that drift. The alternative, a lightweight authorization row with no state machine, is simpler for a business that never sells at the door; it breaks on the first exclusion job sold in a kitchen.

Two questions then stay separate:

- **Has an agreement:** `work_orders.agreement_id` is set. True for plan visits, for work riding a plan, and for one-time work under a one-time agreement.
- **Generates recurring occurrences:** the agreement owns `recurrences`. Only a `recurring` agreement may, and the schema enforces it (below), so a one-time agreement can never wake the generator.

A one-time agreement uses the same states as any agreement ([The Core Data Model](/books/field-operations/field-operations-business#the-core-data-model)), and this chapter is where `fulfilled` gets its meaning. Its `term_during` covers the work plus any guarantee period, and when the work is complete and the term has ended it moves to `fulfilled`, a terminal state the schema allows only for `one_time`. Without it a finished bed bug job would end `terminated` and count as churn. Dispatch reads the agreement's status: a work order under a one-time agreement that's still `signed` isn't dispatched unless the customer asked for service inside the window and the request is recorded ([Charging Inside the Window](/books/field-operations/consumer-protection#charging-inside-the-window)).

My rule for which record a sale needs: a one-time agreement whenever the sale needs a signing packet (a home-solicitation sale the cancellation rule covers, a guarantee that outlives the visit, an authorization beyond price, or a contract with deposits or permits). Everything else, such as a phone-booked service priced in advance, a delivery order, or an extra line on a member's visit that the plan's terms already allow, is a work order with an approved estimate and no new agreement.

## One-Off Work for Plan Customers

A plan customer asking for something extra raises five questions, and the answers differ by trade:

| Case | Covered by the plan? | Record | When it happens |
| --- | --- | --- | --- |
| Pest: wasp nest, quarterly customer | Often included as a free re-service; otherwise extra | Line on the plan's work order, or a re-service work order | Own trip if it's over the door; otherwise the next visit |
| Pest: rodent exclusion | Extra, at member price where the plan grants one | One-time agreement (scope, owner authorization) | Own trip: a crew, materials, hours on site |
| Pest: bed bug treatment | Extra | One-time agreement (preparation, chemical notice, guarantee) | Own trips, usually several |
| Lawn: aeration or overseeding | Extra or an optional program service | Amendment if it recurs each season; one-time work order if not | Usually its own trip: different machine, often a different crew |
| Pool: acid wash | Extra | One-time agreement (draining, surface risk) | Own trip |
| Pool: equipment repair | Extra; parts may be under the manufacturer's warranty | Approved estimate on its own work order | The next weekly visit if the part is on the truck; otherwise its own trip |
| HVAC: repair for a member | Discounted, with priority scheduling | Approved estimate; packet if sold in the home and the rule applies | Its own call, or the same visit if found at a tune-up |
| Cleaning: move-out deep clean | Extra | One-time work order; owner or landlord access if the client is a tenant | Its own date, after the furniture leaves, often a larger crew |
| Delivery: assembly or white-glove | Extra on the order | A service on the order's work order | Same stop, longer dwell |

The rules behind the table:

**Coverage is read from the terms, never remembered.** Each line on a plan customer's work order resolves to one of three outcomes: included (a benefit such as free re-service between visits), discounted (member pricing) or extra. The work order line records which benefit applied and from which terms version, as [Maintenance Agreements in the Repair Trades](/books/field-operations/repair-and-installation#maintenance-agreements-in-the-repair-trades) requires for member discounts, so a lapsed member isn't charged member prices and a member's discount survives a dispute.

**Member pricing resolves from the agreement's state on the pricing date.** It's the member or contract stage of the price waterfall ([Rules Engines](/books/field-operations/pricing-and-sales-rules#rules-engines-pricing-as-configuration)), and only an `active` agreement grants it: not `signed`, not `paused` or `on_hold`, not one that terminated last month. How the vendors set member prices is in [Recurring Prices](/books/field-operations/pricing-and-sales-rules#recurring-prices). Whichever shape, the price records the agreement it used, and the invoice can show it: ServiceTitan shows members a Member Discount section and non-members a Potential Savings section "showing how much they could save by becoming a member."

**Extra work rides the plan only when the plan already authorizes it.** If the terms say additional services are available at member price on approval, an approved estimate is enough and the work is a line on the occurrence's work order or a separate work order under the same agreement. If the work needs authority the plan doesn't carry (a landlord's consent, a chemical notice, a preparation agreement, a guarantee), it gets a one-time agreement of its own. Whether a sale in the home triggers the cancellation window is decided per sale by the rule in [Consumer Protection](/books/field-operations/consumer-protection), whichever record the sale lands on.

**Fold it into the next visit only when everything fits.** The extra rides the next scheduled visit when it can wait until that visit's window, the assigned technician has the skill and license, the materials are on the truck, and the route can absorb the added service time ([Territories & Capacity](/books/field-operations/territories-and-capacity)). A line under the plan is added to the occurrence's work order. Work with its own agreement or invoice keeps its own work order and gets a visit pinned next to the plan visit, same resource and stop, so the optimizer sees one stop with no drive between. Otherwise it's booked into a slot where a route already passes ([Offer Times Where the Routes Already Are](/books/field-operations/booking-appointments#offer-times-where-the-routes-already-are)). Two plans at one property (pest and mosquito, say) follow the merging rule in [Recurring Schedules](/books/field-operations/recurring-schedules#how-to-build-it).

**Bill it on the same account, on its own line.** One-time work invoices per work order to the property's payer on the work date, beside the plan's billing plans ([Service-Driven or Calendar-Driven](/books/field-operations/billing-recurring-service#service-driven-or-calendar-driven-and-the-gap-between-them) covers mixed plans). The trap is autopay: the customer authorized the stored card for the plan's recurring charge, and an unscheduled charge for an exclusion job is a different standing instruction. Charge it only under an authorization that covers unscheduled charges, or take the payment with the customer present ([Who Started the Payment](/books/payments/stored-credentials#who-started-the-payment)).

## Converting One-Time Customers to Plans

A one-time customer is the warmest lead a field business has: the property is known and the problem is fresh. There are three moments to offer a plan:

- **At the visit.** The technician has just solved the problem and can say what prevents it. The Potential Savings line on a non-member's invoice is the written version of the same pitch.
- **After the visit.** An open offer with an expiry and a follow-up date. ServiceTitan's mobile app now prompts the technician to set a custom follow-up date when completing a job with unsold estimates; before that change, the follow-up was created in the background and its date couldn't be changed.
- **When the problem comes back.** A second request for the same service type at the same property within a configured number of days, or a callback, is the moment the plan's value is obvious. Make it a rule that opens an opportunity, not something the office notices.

A renewal is not a conversion. It's retention, and counting it here inflates the metric ([Operating Metrics](/books/field-operations/operating-metrics#sales-and-memberships) makes the same call for memberships).

**The offer is a priced estimate,** in the same `estimates` record as any other sale ([Good-Better-Best and Proposals](/books/field-operations/pricing-and-sales-rules#good-better-best-and-proposals)), with plan options and their initial and recurring prices; ServiceTitan sells a membership the same way, by adding its new-sale task "to any invoice or estimate." What makes it a conversion offer is the **credit**: the one-time price already paid counts toward the plan's initial charge. My rules for it:

- **The credit is a priced line with a reason code,** pointing at the one-time invoice it credits, so pricing, commissions and finance all see the net. It never exceeds the plan's initial price, applies once per invoice, and expires after a configured window.
- **The one-time visit becomes the initial service** when the credit applies and the service types match, so the plan doesn't schedule a second clean-out the customer already had.
- **The credit posts on activation,** with the rest of the initial charge, under the rule in [Charging Inside the Window](/books/field-operations/consumer-protection#charging-inside-the-window); if the customer cancels inside the window, the credit is void and the one-time invoice stands.

![A dimensional drawing of one customer's first term as a plan-view timeline. A one-time treatment at day 0 is followed by a conversion offer; the customer signs at day 7, the cooling-off window runs to day 10, and the plan becomes active with the one-time price credited against the initial charge. Quarterly visits fall at days 90, 180, 270 and 360, and a mosquito add-on joins as an amendment at day 150, prorated over the 225 days left in the 365-day term. A detail view enlarges the offer, signature and cooling-off window, and two variable tables, in days and in dollars, define every code and sum first-term revenue to 986.92 dollars.](/diagrams/fo-one-time-and-upsells-first-term.svg "Illustrative values. The one-time price becomes a credit, nothing bills before the plan is active, and the add-on joins as a new terms version prorated by day.")

**Signing is a full signing.** A conversion creates a `recurring` agreement with its whole packet: the terms, consent to automatic renewal, the payment authorization and, for a sale in the home, the cancellation notice ([What Gets Signed](/books/field-operations/signing-the-agreement#what-gets-signed); the renewal law is in [Renewal and Cancellation in the Field](/books/field-operations/consumer-protection#renewal-and-cancellation-in-the-field)). A technician's conversion at the kitchen table is `sold_via = 'technician'` and `buyer_home`, a door-to-door sale like any other.

**Attribution is a chain.** The opportunity points at the one-time work order it came from and the visit where the offer was made; it records who found it and who sold it; the agreement points back at the opportunity. With that chain, conversion is computed rather than claimed, a technician lead that a salesperson closed pays both people under the plan's rules, and the time from one-time visit to signature is measurable.

## Upselling as a System

An upsell is an opportunity found, priced, decided and either performed or let go. Every step leaves a record, and the records are what make it a system.

### Capturing the Opportunity

The technician sees the cracked heat exchanger, the gnawed soffit, the failing pool pump bearing, the thin turf. In the app that becomes an **opportunity**: the property, the visit, the asset if there is one, a recommended service from the pricebook, a note, and a photo or reading, captured offline like everything else on the device ([The Technician App](/books/field-operations/technician-app#selling-from-the-pricebook)). ServiceTitan names the repair-trade version: when a service technician persuades a customer to get replacement estimates, "a technician-generated lead is set, and a sales technician is dispatched to offer estimates," and the resulting sales opportunity stays open in Follow Ups until an estimate sells.

An opportunity has a short life: `open` when captured, `quoted` when an estimate is sent, then `won`, `lost` (with a reason) or `expired` when its date passes. It is not an estimate. Many opportunities never get priced (the customer says "not this year"), and those are next season's campaign list.

### Quoting From the Field

A quoted opportunity is an estimate with options, built from the same engine and bands as any other ([Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules)). Jobber's optional line items show the add-on mechanics: the client checks or unchecks optional items and the total updates; the business can pre-select a recommended item, which the client can deselect; when the quote becomes a job, selected items become regular lines and unselected ones are removed. Pre-selection is where I'd draw a line. My rule: an add-on is selected by the customer, never by default, because a line the customer didn't notice is a refund and a complaint waiting to happen. ServiceTitan's mobile app now asks for confirmation before marking an estimate sold, for a related reason.

### Adding an Add-On to a Live Agreement

A recurring add-on on a running plan (mosquito service on a pest plan, a second system on an HVAC membership, a fall aeration that repeats every year) changes the contract. The vendors show the hard parts:

- **Aspire** handles contract changes as revisions within the same contract, each with its own number. While a change is pending, "you can still schedule and complete active tickets based on the existing contract version." A revision's start date has to sit within the contract's dates, new prices apply "to existing tickets, starting with the ticket you selected," fixed-payment contracts must update their payment schedule before the change is won, and to change the number of occurrences Aspire recommends cancelling the contract and creating a new one.
- **Housecall Pro** won't change an active plan's billing frequency: "you'll need to cancel the customer's current service plan and create a new one," then send the new plan for acceptance. It also divides an add-on's price by the plan's months, so it recommends prices that divide evenly.

In this volume's model an add-on is an **amendment**: a new immutable `agreement_terms` version ([Upgrades, Downgrades and Changes](/books/field-operations/service-agreements#upgrades-downgrades-and-changes)), not a new agreement. The decisions it carries:

- **Amendment or new agreement.** Amend when the add-on shares the agreement's property, payer, term and renewal. Start a new agreement when any of those differ, or when the product is separately regulated and separately cancellable, like a termite warranty. Cancelling and recreating to change a frequency, as Aspire and Housecall Pro advise, is a workaround for their tools; here a frequency change is a new recurrence version under the same agreement ([Recurring Schedules](/books/field-operations/recurring-schedules#how-to-build-it)).
- **Effective date.** The first added visit, not the moment the change is entered, as [Billing Recurring Service](/books/field-operations/billing-recurring-service#how-to-build-it) sets for upgrades.
- **Proration.** In days, through the service balance, following [Plan Changes and Proration](/docs/payments/subscriptions#plan-changes-and-proration). The drawing above prorates a $360 add-on over the 225 days left in a 365-day term to $221.92.
- **Occurrences.** The added service gets its own recurrence series from the effective date, and every occurrence it generates is stamped with the new terms version.
- **Signature.** An amendment that adds a recurring charge or changes renewal terms needs the customer's signature on the new version, because consent to automatic renewal covers only the terms the customer agreed to ([The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal)). A one-time extra billed once under terms that already allow it needs an approved estimate only. An amendment sold in the home goes through the same cancellation rule as any sale, with its documents attached to the terms version.

**Upgrading a tier** is the same mechanism: the new terms version points at a different plan version (good to better). Downgrades apply at the next period, as billing already specifies, and commission on an upgrade is computed on the change in contract value, not the whole value again.

### Outreach Campaigns

Open, lost and expired opportunities, declined estimate options and seasonal services (aeration in fall, pool closing in October) feed campaigns. A campaign is an opportunity source, and its messages are `marketing` by purpose: a reminder that ends with an add-on offer is a marketing message and needs marketing consent ([What the Rules Mean for Each Message](/books/field-operations/customer-communications#what-the-rules-mean-for-each-message)). Suppress customers with an open quote for the same service, and cap how often one property hears an offer. Campaigns to existing customers in general (suppression, and reporting them as retention rather than acquisition) are in [Marketing to Existing Customers](/books/field-operations/marketing-and-lead-sources#marketing-to-existing-customers).

### Commissions and Guardrails

Who gets paid for an upsell is in [Technician Sales and Upsells](/books/field-operations/sales-teams-and-commissions#technician-sales-and-upsells): commission on completed, invoiced work, item-level spiffs, splits recorded on the invoice. This chapter's contribution is the opportunity, which records the person who found it and the person who sold it, so both can be paid without either claiming it.

Upselling also invites the pushy version, and the guardrails belong in the system:

- **No commission on unperformed work.** An upsell earns when its first visit completes and the invoice posts; an amendment earns on the first added visit, through the [commission ledger](/books/field-operations/sales-teams-and-commissions#the-commission-ledger).
- **Evidence before a recommendation.** A recommended repair needs a photo or a reading on the opportunity, the same standard as [Proof of Service](/books/field-operations/proof-of-service).
- **Audit rates against peers.** Recommendation rate, close rate and the share of upsells refunded or cancelled shortly after, per technician, compared with the median for the same service types, the method [Operating Metrics](/books/field-operations/operating-metrics#sales-and-memberships) uses for replacement rate.
- **Easy reversal.** Cancelling an add-on uses the ordinary cancellation flow ([Cancellations](/books/field-operations/collections-and-retention#cancellations)) and produces a new terms version, never a deleted line; refunds follow the service balance.

## Metrics

Attach rate, one-time-to-plan conversion and revenue per visit are defined in [Sales and Memberships](/books/field-operations/operating-metrics#sales-and-memberships), with the rest of the sales numbers. This chapter's job is to keep their inputs: add-on lines tagged on each terms version, the opportunity chain from one-time work order to activated agreement, and conversion credits that point at the invoice they credit.

## How to Build It

This extends the core model in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model), the agreement columns in [Service Agreements & Plans](/books/field-operations/service-agreements#how-to-build-it) and the documents in [Signing the Agreement](/books/field-operations/signing-the-agreement); `estimates`, `invoices` and `invoice_lines` are used as defined there and in billing.

```sql
ALTER TABLE agreements
  ADD COLUMN kind                  TEXT NOT NULL DEFAULT 'recurring'
    CHECK (kind IN ('recurring', 'one_time')),
  ADD COLUMN source_opportunity_id UUID,             -- FK added below
  ADD CONSTRAINT agreements_id_kind_key UNIQUE (id, kind),
  -- 'fulfilled' is in the core status CHECK; only one-time agreements may use it
  ADD CONSTRAINT agreements_fulfilled_kind_check
    CHECK (status <> 'fulfilled' OR kind = 'one_time');

-- Only a recurring agreement can own a recurrence
ALTER TABLE recurrences
  ADD COLUMN agreement_kind TEXT NOT NULL DEFAULT 'recurring'
    CHECK (agreement_kind = 'recurring'),
  ADD CONSTRAINT recurrences_agreement_kind_fkey
    FOREIGN KEY (agreement_id, agreement_kind) REFERENCES agreements (id, kind);

CREATE TABLE agreement_authorizations (             -- what the packet authorizes, queryable
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  agreement_id        UUID NOT NULL REFERENCES agreements (id),
  kind                TEXT NOT NULL CHECK (kind IN ('entry', 'chemical_notice',
                        'preparation', 'waiver', 'scope')),
  document_id         UUID NOT NULL REFERENCES agreement_documents (id),
  signed_by_person_id UUID NOT NULL REFERENCES people (id),
  signed_as_role      TEXT NOT NULL CHECK (signed_as_role IN ('owner', 'tenant',
                        'manager')),
  valid_during        DATERANGE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE opportunities (
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                UUID NOT NULL,
  account_id               UUID NOT NULL REFERENCES accounts (id),
  property_id              UUID NOT NULL REFERENCES properties (id),
  kind                     TEXT NOT NULL CHECK (kind IN ('one_time', 'add_on',
                             'upgrade', 'plan_conversion')),
  source                   TEXT NOT NULL CHECK (source IN ('technician', 'office',
                             'campaign', 'customer', 'rule')),
  found_on_visit_id        UUID REFERENCES visits (id),
  origin_work_order_id     UUID REFERENCES work_orders (id),  -- the one-time work it came from
  found_by_staff_member_id UUID REFERENCES staff_members (id),
  sold_by_staff_member_id  UUID REFERENCES staff_members (id),
  service_type_id          UUID REFERENCES service_types (id),
  asset_id                 UUID REFERENCES assets (id),
  agreement_id             UUID REFERENCES agreements (id),   -- the live agreement it would amend
  estimate_id              UUID REFERENCES estimates (id),    -- set when quoted
  note                     TEXT,
  evidence_ids             UUID[] NOT NULL DEFAULT '{}',      -- photos and readings
  status                   TEXT NOT NULL CHECK (status IN ('open', 'quoted', 'won',
                             'lost', 'expired')),
  status_reason            TEXT,                              -- required for lost and expired
  expires_on               DATE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at                TIMESTAMPTZ,
  CHECK (status NOT IN ('lost', 'expired') OR status_reason IS NOT NULL),
  CHECK (status <> 'quoted' OR estimate_id IS NOT NULL)
);

ALTER TABLE agreements
  ADD CONSTRAINT agreements_source_opportunity_fkey
    FOREIGN KEY (source_opportunity_id) REFERENCES opportunities (id);

ALTER TABLE agreement_terms                         -- an amendment is a terms version
  ADD COLUMN source_estimate_id    UUID REFERENCES estimates (id),
  ADD COLUMN signed_document_id    UUID REFERENCES agreement_documents (id),  -- null if approval sufficed
  ADD COLUMN proration_amount      BIGINT,           -- minor units, computed at the effective date
  ADD COLUMN currency              TEXT;

ALTER TABLE invoice_lines                           -- a conversion credit names what it credits
  ADD COLUMN credited_invoice_id   UUID REFERENCES invoices (id);

CREATE UNIQUE INDEX invoice_lines_credited_invoice_once
  ON invoice_lines (credited_invoice_id) WHERE credited_invoice_id IS NOT NULL;
```

The composite foreign key on `recurrences` makes "only recurring agreements generate occurrences" a database fact rather than a generator convention. The unique index credits a one-time invoice once, however many offers were made. The chapter adds outbox events `opportunity.created`, `opportunity.quoted`, `opportunity.won`, `opportunity.lost` and `agreement.amended` (with the terms version), and `agreement.fulfilled` for one-time agreements, in the envelope from [Events & Async Messaging](/docs/architecture/events); commissions and campaigns subscribe to them.

## Auditing

Upsells and conversions produce familiar disputes: "the technician said I needed it," "I never approved that line." The field records:

- **The opportunity as captured:** who found it, on which visit, the photos and readings, the recommended service, and every status change with its reason.
- **The estimate as presented,** including options the customer declined and which lines were pre-selected or chosen, with the approver's name and role.
- **Authorizations:** each signed authorization with the signer, the role they signed in and the document hash, so a landlord dispute about an exclusion job has an answer.
- **Amendments:** each terms version with its effective date, the proration inputs and result, and whether a signature or an approved estimate authorized it.
- **Credits:** the one-time invoice credited, the rule version and window that allowed it, and the activation that posted it.

Record shape and capture are in [Audit Trails](/docs/architecture/audit-trails); retention for field records is in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Model one-time sales that need signed terms as `one_time` agreements,** with the same packet, cancellation rules and events as plans, a `fulfilled` end state, and no recurrences, enforced in the schema.
- **Keep "has an agreement" and "generates occurrences" separate,** and leave plain one-off work as a work order with an approved estimate.
- **Resolve coverage and member pricing from the active terms on the pricing date,** and record which benefit and agreement each line used.
- **Decide per extra whether it folds into the next visit,** from window, skill, materials and route capacity, and pin it beside the plan visit when it keeps its own work order.
- **Bill one-time work on the same account, line by line,** and charge stored cards only under an authorization that covers unscheduled charges.
- **Make conversion a priced offer with a credit,** posted only when the plan is active and void if the customer cancels in the window.
- **Treat opportunities as records** with evidence, a finder, a seller, a status and an expiry.
- **Add recurring add-ons as amendments:** a new terms version, effective on the first added visit, prorated by day, generating its own occurrences, signed when it adds a recurring charge.
- **Gate campaigns on marketing consent,** and build guardrails into pay, evidence and reversal rather than into training alone.
- **Keep the inputs for attach rate, conversion and revenue per visit,** whose definitions live in Operating Metrics.

## References

**Specifications**

- [Cornell LII: 16 CFR 429.1, The Cooling-Off Rule](https://www.law.cornell.edu/cfr/text/16/429.1), the buyer's right to cancel a home-solicitation sale until midnight of the third business day
- [Florida Statutes 482.227: Guarantees and warranties](https://www.flsenate.gov/Laws/Statutes/2024/482.227), first-page bold disclosure of repair and retreatment terms and the bar on "full" or "unlimited" with limits

**In practice**

- [ServiceTitan: Understanding sales vocabulary](https://help.servicetitan.com/docs/understanding-sales-vocabulary), technician-generated leads and sales opportunities open in Follow Ups until sold
- [Jobber: Create a one-off job](https://help.getjobber.com/en/articles/create-a-one-off-job/), one-off and recurring jobs as separate kinds and invoicing at the end
- [Jobber: Optional line items on quotes](https://help.getjobber.com/en/articles/optional-line-items-on-quotes/), client-selected add-ons, recommended pre-selection, and selected items becoming job lines
- [FieldRoutes: Adding a service type subscription](https://knowledgebase.fieldroutes.com/docs/adding-a-service-type-subscription.md), the One Time frequency, initial invoice timing and template, contract value and add-on services
- [Skimmer: Create, edit or delete a work order](https://thepooldeck.getskimmer.com/create-and-schedule-work-orders-76/create-edit-or-delete-a-work-order-app-skimmer-help-center-270), unscheduled work orders that join the route once a technician and date are set
- [FarEye: API self-guide](https://developer.fareyeconnect.com/self-guide.html), value-added service codes for installation, assembly and haul-away with extended dwell time
- [ServiceTitan: Apply membership discounts](https://help.servicetitan.com/docs/apply-membership-discounts), Member Discount and Potential Savings sections on invoices
- [ServiceTitan: Basic memberships workflows](https://help.servicetitan.com/docs/basic-memberships-workflows), selling memberships and add-ons on invoices and estimates
- [ServiceTitan: Act on follow-up opportunities with fewer steps](https://help.servicetitan.com/release-hub/docs/act-on-follow-up-opportunities-with-fewer-steps-and-fewer-missed-sales), custom follow-up dates for unsold estimates and confirmation before marking sold
- [Housecall Pro: Service plans FAQs](https://help.housecallpro.com/en/articles/5485025-service-plans-faqs), locked billing frequency, cancel and recreate, and add-on prices divided by months
- [Aspire: How to change contracts in Aspire](https://guide.youraspire.com/docs/how-to-change-contracts-in-aspire), revisions, pending changes, revision start dates, repricing from a selected ticket, and new contracts for occurrence changes
- [PMP: Achieve bed bug control with customer cooperation](https://www.mypmp.net/achieve-bed-bug-control-with-customer-cooperation/), preparation sheets customers sign before treatment
