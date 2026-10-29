+++
title = "Pricing & Sales Rules"
description = "Pricing field service: flat-rate pricebooks and markup, good-better-best proposals, recurring prices, discount bands, pricing rules, promotions and financing."
category = "Field Operations Industry"
order = 1523
part = "Selling"
tags = ["field-operations", "sales", "pricing", "pricebook", "rules-engine", "financing"]
+++

A price in field service is rarely a number someone typed. A water heater replacement is a flat-rate task built from parts, labor hours and overhead, marked up on a margin matrix, discounted for members, maybe discounted again by the technician, shown as one of three options with a monthly payment underneath, and taxed by rules that differ between the county where the work happens and the next one over. A pest control plan has a one-time initial price and a recurring price, both depending on the size of the property, with a summer promotion in one market and a floor below which the rep can't go without a manager. The price changes weekly; supplier costs change daily. Pricing is a policy, and the system's job is to apply it the same way in the office, on a tablet in a driveway with no signal, and in the customer portal, then prove later what price was offered and why.

## Pricebooks: Where Prices Come From

A **pricebook** is the catalog of everything a company sells, with the rules that price it. In the trades it is the center of the system: Successware's documentation calls it "what everything in the platform connects to." Product pricing, with price lists per market, channel and company, is the Commerce volume's [Pricing & Price Lists](/books/commerce/pricing#price-lists-price-books-and-b2b-prices).

| Platform | Structure | How prices are computed | Notable |
| --- | --- | --- | --- |
| FieldPulse | Categories of flat-rate jobs; each job is a labor line plus material lines | Labor cost and overhead cost per hour, default markup percent, Markup Categories | Markup Categories override by labor rate, supply price band or material type; upsell option lists |
| FieldRoutes | Service types with initial and recurring charges | Dynamic Pricing by measurement: square feet, linear feet or count, in intervals | Separate tables for initial and recurring prices |
| Profit Rhino | A prebuilt flat-rate book for HVAC, plumbing, drain cleaning and electrical | National average prices, adjusted by your labor rate and material markups | Optional, typically quarterly updates; sold through FSM platforms |
| ServiceTitan | Services, materials, equipment, plus discounts and fees, in categories | Dynamic Pricing: billable rate, markups and optional surcharges per category | Markup by cost range as gross margin, percent, dollar or multiplier; member prices; supplier cost sync |
| Successware | Parts, labor, overhead, miscellaneous items and flat-rate tasks | Group markup formulas; a Profit Margin Matrix sets markup by cost tier | Separate "Our Price" and "Retail Price" per task; imports third-party books |

Three pricing methods coexist:

- **Flat rate.** The customer sees one price for a task ("replace a 50-gallon water heater"), computed from standard hours, parts and markup. ServiceTitan's Dynamic Pricing recalculates service prices from linked material costs through markup tables by cost range, and supplier-integrated materials update those costs automatically, so the flat-rate prices move with them. Third-party books (Profit Rhino, FieldEdge Flat Rate, the New Flat Rate) supply task libraries that Successware and Housecall Pro import.
- **Measured.** Lawn, pest and cleaning price by size. FieldRoutes' tables define intervals with a minimum, a maximum, a unit (square feet, linear feet or a count) and a premium per interval over the minimum, with separate tables for the initial and recurring price. A residential cleaning company does the same by bedrooms and bathrooms. Briostack's bid calculator prices by square foot or flat rate.
- **Cost-plus from a budget.** Landscape estimating works from the company's annual budget: LMN gives each new estimate "the overhead recovery markups, and the default profit margin" of the selected budget, and Real Green marks up so "every labor hour recoups a percentage for overhead."

A worked flat-rate task shows the mechanism (the numbers are illustrative). An HVAC company prices "replace run capacitor" from a standard time of 0.5 hours at a $180 billable hour, which already carries overhead, so $90 of labor; the capacitor costs $18 and the margin matrix marks parts in that cost tier up three times, so $54; the task is $144, rounded by the book's rule to $149. A plumbing company prices "replace wax ring and reset toilet" the same way. The technician doesn't add time if the job runs long, and the customer doesn't get a refund if it runs short: the company carries the variance, which is why standard times are tuned from completed jobs and why flat rate needs a diagnostic step that decides which task applies. Diagnostics, parts on the truck and warranty work are in [Repair & Installation](/books/field-operations/repair-and-installation).

**Margin and markup aren't the same number,** and pricebooks offer both. A 50% markup on a $100 cost gives $150, a 33% margin; a 50% gross margin gives $200. ServiceTitan lets each cost range use gross margin, percent markup, dollar markup or a multiplier. Store the method with the rule and compute in minor units with a written rounding rule ([Money & Amounts](/docs/payments/money)).

**Visibility is part of the pricebook.** ServiceTitan suggests office-only categories, hidden from the mobile app, for items such as manager discounts; FieldPulse sets visibility per role.

Version the pricebook. A price is computed from a pricebook version, a cost snapshot and a rule version, and the estimate stores all three references plus the computed amounts ([Temporal Data](/docs/database/temporal-data#versioned-entities)). ServiceTitan notes that editing a Dynamic Pricing rule updates pricing on all new estimates; existing estimates must keep the price they showed the customer. My rule for supplier cost feeds: a change beyond a set percentage goes to a review queue instead of the book, because a bad feed can reprice the whole book overnight.

## Good-Better-Best and Proposals

Field sales rarely offers one price. The **good-better-best** proposal shows three options side by side so the customer chooses between options instead of between yes and no.

- **ServiceTitan** groups estimate templates into proposal templates that technicians present in the mobile app; proposal types label the tiers (for example Basic, Premium, Premium Plus) with names and colors, and each proposal type is set to Progressive or Additive selling.
- **Housecall Pro's** Sales Proposal Tool shows options side by side, lets customers approve more than one option, sets expiration dates, runs automated follow-ups, and presents financing.
- **Jobber** lets clients approve quotes in its client hub, with optional line items they can toggle on some plans, and deposits; **FieldPulse** variant proposals put choosing, signing and a deposit or financing in the same visit.

The data model is an estimate with options, each option with its own lines:

```json
{
  "id": "0194c3b1-7a20-7d4e-9b61-3f0a8c2e5d17",
  "pricebook_version": "2026-10-01",
  "expires_on": "2026-11-25",
  "currency": "USD",
  "options": [
    { "tier": "good",   "lines": [{ "item": "water_heater_40", "quantity": 1, "unit_amount": 189900 }], "total_amount": 189900 },
    { "tier": "better", "lines": [{ "item": "water_heater_50", "quantity": 1, "unit_amount": 239900 }], "total_amount": 239900 },
    { "tier": "best",   "lines": [{ "item": "water_heater_tankless", "quantity": 1, "unit_amount": 489900 }], "total_amount": 489900 }
  ],
  "selected_tier": null
}
```

Snapshot every line: item name, description, unit price, cost and tax code as presented, not as references alone. The pricebook will change; the estimate the customer signed must not. Store the selected and declined options (declined options drive follow-ups and tier tuning), and an expiry that protects margin when costs move.

## Recurring Prices

A recurring service has at least two prices: an initial price for a heavier first visit (a pest clean-out, a first lawn application, a green pool brought back, a first deep clean) and the recurring price retention depends on. Platforms model the pair in different places. FieldRoutes' subscription model, for one, carries an `initialQuote` for the first service, a `recurringCharge`, a `billingFrequency` (including billed after each service), an `agreementLength` in months, and `soldBy` "used in commissions and sales reporting"; membership-led trades put the recurring price on the plan and the first visit's work on a separate estimate.

Membership pricing is the other recurring pattern. ServiceTitan's pricebook gives each service a static member price and a member add-on price, used when a customer has an active membership; a member price of $0.00 falls back to the standard price, and a toggle controls whether an item allows membership discounts. Housecall Pro service plans can apply a discount "to all jobs" for plan customers. Launch27 lets each cleaning frequency carry its own percent or dollar discount.

Renewal is where recurring pricing gets hard. Aspire's renewal settings show the real choices: keep the previous prices, recalculate from current catalog costs with the original markups, or recalculate with current system markups, with price overrides winning in every case. Build all three as policies and record which applied. Price increases on existing agreements are also a consumer protection question: whether you can raise a recurring price depends on the agreement's terms and state law ([Service Agreements & Plans](/books/field-operations/service-agreements), [Subscriptions](/docs/payments/subscriptions#plan-changes-and-proration)).

## Discounts and Approval Rules

In a sales-led business the rep negotiates, so discounts need bounds. ServiceTitan keeps discounts as pricebook items, with office-only categories for the ones technicians shouldn't apply. FieldRoutes' discount setup is a more detailed example: a discount is a percentage or a fixed amount, can be restricted to certain services, can be capped at a maximum number of invoices, can be editable within a minimum and maximum, can require a code, and has display start and end dates. Discounts can't be deleted, only hidden, and creating or editing them needs specific access controls. PestPac's sales CRM advertises a "baked-in approval process." Salesforce CPQ's Advanced Approvals is the enterprise version, and two of its ideas transfer: an approval rule can look at a summary of the whole quote (the largest discount on any line), and tracked fields record the values each approver saw.

![State diagram of a priced estimate: a draft is priced; a price inside the rep's band goes straight to presented, a price below the band goes to pending approval, which is approved and presented or rejected back to draft; presented ends in accepted, declined or expired, and any edit after approval returns the estimate to priced.](/diagrams/fo-pricing-and-sales-rules-approval.svg "Approval belongs to a specific price. Any edit after approval re-prices the estimate and, if it falls below the band again, asks again.")

My default design:

- **A band per item and role.** Each sellable item resolves to a list price and a **floor**; each role has a maximum discount. Inside the band, the rep sells. Below it, the estimate goes to approval.
- **Approval binds to a hash of the priced estimate.** If anything changes after approval (a line, a quantity, a discount), the approval is void. Salesforce's tracked fields exist for the same reason: an approver must see what they approved.
- **Approvals must work at the door.** A rep offline in a driveway can't wait for an email. Offer a synchronous approval the approver can grant from their phone, and a queued approval that lets the rep sign the customer conditionally only where the agreement allows it. The alternative, no discounts below the band offline at all, is simpler and loses some sales; pick one deliberately.
- **Discount reason codes are required,** because "why was this discounted?" is the question finance, commissions and fraud review all ask. FieldRoutes publishes an article on making technicians' commissions ignore a discount, which shows how quickly discounts reach pay ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions)).

## Rules Engines: Pricing as Configuration

Once a business has markets, member tiers, promotions and rep bands, pricing becomes a rules problem: the same mechanism with different numbers by market, plan and date. A **market** here is a pricing zone: a named group of territories that share a price list, resolved from the property's service territory on the pricing date ([Territories & Capacity](/books/field-operations/territories-and-capacity)), never typed on the estimate. I'd store it as `pricing_zone_id` on the territory, effective-dated like the rest of territory membership, and stamp the resolved zone on each priced estimate. The general design (rules as versioned rows with a source, fixed stages, declared stacking, final checks in code, and a decision record per price) is in [Rules as Data](/docs/architecture/rules-as-data). What follows is how it maps onto field pricing.

**The price waterfall.** Salesforce CPQ describes a sequence where each price feeds the next, from list price through contracted, regular and customer prices to the **net price**, "what we actually ask the customer to pay." Field service needs the same idea with its own steps.

![The field service price waterfall from left to right: costs and markup produce the pricebook price, then member or contracted price, then promotions, then the rep's discount inside the band, with a branch to approval when it falls below the band, producing the net price; final checks run last, tax is computed on the net price by item tax code and service location, and financing is presented from the final total.](/diagrams/fo-pricing-and-sales-rules-waterfall.svg "Each step reads the previous step's output and records its own adjustment. Final checks run on the net price; tax and financing come last, from the final price.")

The rules that transfer from CPQ to any field build:

- **Fixed stages, ordered rules within a stage.** The stages are the waterfall (base, member or contract, promotion, rep discount, final checks). CPQ's own trap is the reason for the second half: within an evaluation event "every condition is evaluated before any actions are taken," so a rule that depends on a value another rule sets in the same stage may never fire. No rule reads what its own stage writes ([Rules as Data](/docs/architecture/rules-as-data#stages-and-ordered-rules)).
- **Quantity tiers are a declared choice.** CPQ distinguishes range schedules (one tier's rate for every unit) from slab schedules (each portion at its own tier's rate). Commercial work meets this: per-unit pricing for a 40-unit apartment complex or a 12-site restaurant chain's hood cleaning differs materially between the two, so the schedule says which.
- **Final checks run last** and no rule can override them. CPQ's nearest equivalent is the validation product rule, which "shows a message to your sales reps about a problem they must fix before they're allowed to save the configuration or quote." What they check is the business's to define. They live in code, because they protect against bad rule data ([Rules as Data](/docs/architecture/rules-as-data#final-checks)).
- **Effective-dated, versioned rules,** with each priced line recording the rule IDs and versions that touched it, and a **price trace** per line, so "why is this price $129?" is a lookup.

A promotion rule in that shape, with its scope as conditions:

```json
{
  "id": "0194c3b4-0e5f-7a81-b2c9-6d1e4f7a3b08",
  "version": 3,
  "conditions": [
    { "field": "item", "op": "in", "value": ["lawn_plan_monthly"] },
    { "field": "property.market", "op": "eq", "value": "market_a" }
  ],
  "valid_during": "[2026-04-01,2026-06-01)",
  "stage": "promotion",
  "action": { "type": "amount_off", "applies_to": "initial", "amount": 5000, "currency": "USD" },
  "stacking": "exclusive_within_stage",
  "order": 20
}
```

One field-specific point the general chapter doesn't cover: **the same engine everywhere.** The office, the offline mobile app and the portal must compute identical prices, so ship the engine and the rule set to the device and version both ([Mobile Releases](/docs/delivery/mobile-releases), [Offline Sync](/docs/architecture/offline-sync)). If the device and server disagree at sync, my rule is that the server's result wins for new prices but the signed price stands, and the difference is flagged for review.

## Promotions

A **promotion** is a discount with a campaign around it: eligibility, dates, a code, a redemption cap and a duration. Stripe's coupon model is a clean reference. A coupon is a percentage or amount off with a duration of `once`, `repeating` for a number of months, or `forever`, a `max_redemptions` cap and a `redeem_by` date; a **promotion code** is a customer-facing string that wraps a coupon and can be limited to one customer, first-time orders, a minimum amount and an expiry. Stripe notes that when discounts stack, order matters ("20% off *then* 5 USD off" differs from the reverse), and that negative invoice items record more detail about why a discount was created. BookingKoala's coupons show what recurring service adds: a coupon can apply to one-time bookings, recurring bookings or both; for recurring, to all bookings, the first only, or the next N (up to 12); with a choice of whether it stacks with the frequency discount and how a cancellation claws it back. Product promotions (stacking, codes, tiered and free-shipping offers) and gift cards are the Commerce volume's [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards).

Decide for every promotion: does it apply to the initial price, the recurring price or both; for how many cycles; does it stack with member and rep discounts; and what happens on early cancellation. My rule is that the agreement carries the promotion's terms, not just its effect on the first invoice: a "first service free" promotion on a 12-month agreement is a different contract from one on a month-to-month plan, and the cancellation terms must say how the promotion is treated.

## Financing Presentment

Large tickets (a furnace, a water heater, a pool heater, a termite treatment, a roof) sell on monthly payments. Many FSMs embed a lender: Wisetack through Jobber and JobNimbus, Service Finance and Affirm through ServiceTitan, Klarna through Housecall Pro, and WorkWave's Pay Over Time through PestPac. Others, such as Hearth and GreenSky, sell to contractors directly. The shape is the same across them: the lender sets eligibility, amount limits, APR and term ranges and a fee to the business, and the customer applies in the lender's flow on their own phone, which keeps a Social Security number and income off the rep's tablet. Wisetack's customer "gets a text with a link to apply," and the contractor is paid after "your customer confirms the work has been completed and releases the funds"; Hearth's pitch to contractors is that "Homeowners apply for financing directly, not you." GreenSky's site notes that GreenSky is not a lender: loans are made by federally insured or chartered financial institutions.

The proposal shows an **"as low as"** monthly payment under each option: JobNimbus computes one per estimate option and notes that "All monthly payment amounts shown before signing are estimates." That number is a **trigger term** under Regulation Z. In an advertisement, stating the amount of any payment, the number of payments or the repayment period, the down payment or the finance charge requires also stating the down payment, the terms of repayment and the "annual percentage rate," using that term. The CFPB's official interpretation draws a line that matters for proposals: "cost estimates for individual consumers" and communication "relating to the negotiation of a specific transaction" are not advertisements. A proposal for one customer's job is likely on the negotiation side; the same "as low as $99/month" on a website, door hanger, truck wrap or email blast is an advertisement. Lenders impose their own rules on both: Wisetack requires merchants to copy its approved disclosure verbatim, beginning "All financing is subject to credit approval. Your terms may vary," with a sample payment and the APR and term ranges, and prohibits telling customers they'll be approved or get a particular rate.

What the system does:

- **Get the payment from the lender, not your own math.** Lenders publish calculators or APIs; their rates change, and state rate caps apply. Label it as an estimate, with the APR and term it assumes.
- **Disclosures are content with versions.** Store the lender's approved disclosure text as a versioned template and record the version shown with each proposal and each marketing asset.
- **Keep the credit decision with the lender.** The application and its data go to the lender's flow; the sales app and your system store that an application was sent, its ID, status and approved terms, not the customer's financial details ([Sensitive Data](/docs/payments/sensitive-data)). Once the loan funds, the lender is the payer on the invoice ([Billing Recurring Service](/books/field-operations/billing-recurring-service)).
- **Purchase money loans carry the Holder Rule notice.** A seller can't accept proceeds of a purchase money loan unless the credit contract carries the FTC's notice that any holder is subject to the buyer's claims and defenses against the seller. The lender's contract normally includes it; verify that it does.

## Taxes on Services

Which services are taxable, and how the platforms wire the tax engine, is in [Billing Recurring Service](/books/field-operations/billing-recurring-service#sales-tax-on-services); pricing's part is a tax category on every item, so a mixed ticket splits into lines the engine can tax, and tax is computed on the net price after the waterfall.

## How to Build It

Everything above prices one catalog. A service, a part, a material, a piece of equipment and a chemical are all **items**: one table the pricebook, estimates, van stock and work orders share, so a capacitor sold on a flat-rate task and the same capacitor pulled from a truck are one row. This chapter owns that table; other chapters extend it rather than redefine it.

```sql
CREATE TABLE items (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  kind         TEXT NOT NULL
    CHECK (kind IN ('service', 'part', 'material', 'equipment', 'chemical')),
  sku          TEXT,                 -- the tenant's or supplier's code
  name         TEXT NOT NULL,
  unit         TEXT NOT NULL,        -- 'each', 'hour', 'sq_ft', 'linear_ft', 'gallon', 'oz'
  is_stocked   BOOLEAN NOT NULL DEFAULT FALSE,  -- tracked in warehouse and van stock
  tax_category TEXT NOT NULL,        -- the tax engine's code for this item
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, sku)
);

CREATE TABLE item_components (       -- a flat-rate task built from parts and labor
  parent_item_id    UUID NOT NULL REFERENCES items (id),
  component_item_id UUID NOT NULL REFERENCES items (id),
  quantity          NUMERIC(10, 3) NOT NULL,
  PRIMARY KEY (parent_item_id, component_item_id)
);

CREATE TABLE pricebook_versions (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  pricebook_id UUID NOT NULL,
  version      INTEGER NOT NULL,
  effective_on DATE NOT NULL,
  published_at TIMESTAMPTZ,          -- null while a draft
  UNIQUE (pricebook_id, version)
);

CREATE TABLE pricebook_prices (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  pricebook_version_id UUID NOT NULL REFERENCES pricebook_versions (id),
  item_id              UUID NOT NULL REFERENCES items (id),
  pricing_zone_id      UUID,         -- null: every zone
  price_kind           TEXT NOT NULL
    CHECK (price_kind IN ('one_time', 'initial', 'recurring', 'member', 'member_add_on')),
  method               TEXT NOT NULL CHECK (method IN ('fixed', 'measured', 'cost_plus')),
  unit_amount          BIGINT,       -- minor units; null when computed from the rule
  currency             CHAR(3) NOT NULL,
  standard_hours       NUMERIC(6, 2), -- flat-rate labor
  floor_amount         BIGINT,       -- the bottom of the discount band
  rule_id              UUID,         -- markup, margin matrix or measurement rule
  rule_version         INTEGER,
  UNIQUE NULLS NOT DISTINCT (pricebook_version_id, item_id, pricing_zone_id, price_kind)
);
```

- **Prices live on the pricebook version, not the item.** The item says what something is; `pricebook_prices` says what it costs in a zone, as which kind of price, from which rule. A new version is a new set of rows, so an estimate that stored its `pricebook_version_id` can always be explained.
- **Estimate lines reference `items (id)` and snapshot the rest** (name, unit price, cost and tax category as presented), as in the proposal above.
- **Extensions hang off `items`.** Chemical attributes (EPA registration, label versions, signal words) are a `chemical_items` table keyed by `item_id` in [Regulated Materials](/books/field-operations/regulated-materials); parts used on a job are `work_order_parts.item_id` in [Repair, Install & Commercial Work](/books/field-operations/repair-and-installation); van and warehouse stock reference the same items in [Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety). None of them adds its own catalog.

## Auditing

Prices produce disputes: a customer who was quoted less, a rep who says the system allowed the discount, a manager who approved something different, a regulator asking how a payment was advertised. The field-specific records:

- **The priced estimate as presented**: every option and line, the pricebook, cost snapshot and rule versions, and the price trace, immutable once shown, including declined options.
- **Discounts and approvals**: who applied each discount and why, who approved, what they saw, from which device (online, push or manager code), and whether a later edit voided the approval.
- **Financing presentment**: the disclosure template version shown and the lender's estimate inputs and outputs, per proposal and per marketing asset.

Record structure, actors and retention follow [Audit Trails](/docs/architecture/audit-trails); the volume's field records are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Version the pricebook, costs and rules.** Every price references the versions it was computed from; existing estimates never reprice silently.
- **Support flat-rate, measured and cost-plus pricing** with explicit markup or margin methods, standard times tuned from completed work, and minor-unit rounding.
- **Snapshot estimates and options in full**, including declined options and expiry.
- **Model initial and recurring prices separately**, with renewal policies that record which applied.
- **Enforce bands per item and role**, with approvals bound to the exact priced estimate and usable offline.
- **Run pricing as staged, ordered, effective-dated rules** with final checks in code and a stored price trace.
- **Ship one pricing engine to every surface**, including the offline mobile app, and reconcile on sync.
- **Treat promotions as contracts**: scope, duration in cycles, stacking order, cancellation treatment.
- **Present financing from the lender's numbers** with versioned disclosures, and keep the credit decision with the lender.
- **One item catalog** that pricebook prices, estimates, stock and work orders all reference, with chemical and part attributes as extension tables.
- **Attach a tax category to every item** and leave rates and sourcing to the tax engine.

## References

**Specifications**

- [CFPB: Regulation Z 1026.24, Advertising](https://www.consumerfinance.gov/rules-policy/regulations/1026/24/), trigger terms and the disclosures they require, including the annual percentage rate
- [CFPB: Official Interpretation of 1026.2](https://www.consumerfinance.gov/rules-policy/regulations/1026/interp-2/), cost estimates for individual consumers and negotiation of a specific transaction are not advertisements
- [CFPB: Regulation Z 1026.18, Content of Disclosures](https://www.consumerfinance.gov/rules-policy/regulations/1026/18/), closed-end credit disclosures the lender provides
- [PostgreSQL: Unique Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS), `NULLS NOT DISTINCT` treating null zones as equal
- [Cornell LII: 16 CFR 433.2](https://www.law.cornell.edu/cfr/text/16/433.2), the FTC Holder Rule notice in purchase money loans

**In practice**

- [ServiceTitan: Pricebook](https://help.servicetitan.com/docs/pricebook), services, materials, equipment, discounts and fees, categories and dynamic pricing
- [ServiceTitan: Pricebook Setup Guide in ServiceTitan Max](https://help.servicetitan.com/residential-s-r/docs/pricebook-pro-setup-guide-in-servicetitan-max), markup types by cost range, one rule per category, member prices, supplier costs and office-only categories
- [ServiceTitan: Proposal Templates](https://help.servicetitan.com/docs/proposal-templates), good-better-best options and proposal types
- [FieldPulse: Pricebook](https://help.fieldpulse.com/en/articles/8729090-pricebook), labor and overhead costs, markup categories and option lists
- [FieldPulse: Variant Proposals](https://help.fieldpulse.com/en/articles/5722036-variant-proposal), choosing, signing and financing in one visit
- [Successware: Price Book](https://www.successware.com/blog/2021/november/did-you-know-price-book/), markup formulas, the Profit Margin Matrix and Our Price versus Retail Price
- [Successware: FAQs](https://www.successware.com/faqs), imports of Profit Rhino, NSPG and New Flat Rate books
- [Housecall Pro: Profit Rhino Overview](https://help.housecallpro.com/en/articles/8754493-profit-rhino-overview), a prebuilt flat-rate book, labor rate setup and quarterly updates
- [Housecall Pro: Sales Proposal Tool](https://help.housecallpro.com/en/articles/7216553-sales-proposal-tool), side-by-side options, multiple approvals, expiry and financing
- [FieldEdge: Flat Rate Pricing Software](https://fieldedge.com/flat-rate-pricing-software/), a flat-rate price book with a repairs database
- [Jobber: Client Hub](https://help.getjobber.com/en/articles/what-do-your-clients-see-in-client-hub/), quote approval with optional line items and deposits
- [FieldRoutes: Dynamic Pricing by Measurement](https://knowledgebase.fieldroutes.com/docs/dynamic-pricing-pricing-by-measurement.md), interval pricing for initial and recurring charges
- [FieldRoutes: Discounts](https://knowledgebase.fieldroutes.com/docs/discounts.md), discount types, limits, editable ranges, codes and access controls
- [FieldRoutes API: Subscriptions](https://knowledgebase.fieldroutes.com/apidocs/subscriptions.md), `initialQuote`, `recurringCharge`, `billingFrequency`, `agreementLength` and `soldBy`
- [FieldRoutes: Adding a Service Type Subscription](https://knowledgebase.fieldroutes.com/docs/adding-a-service-type-subscription.md), initial and recurring pricing, contract length and sold-by reps
- [FieldRoutes: Commissions on Discounted Services](https://knowledgebase.fieldroutes.com/docs/how-do-i-make-sure-technicians-get-full-commission-when-service-discounted.md), how discounts reach commissions
- [Housecall Pro: Create Service Plans](https://help.housecallpro.com/en/articles/2369524-create-service-plans), a plan discount applied to all jobs
- [PestPac: Fintech](https://www.pestpac.com/fintech), WorkWave Pay Over Time financing
- [Launch27: Frequencies Overview](https://intercom.help/Launch27/en/articles/4259417-frequencies-overview), a discount per recurring frequency
- [Aspire: Contract Renewal Settings](https://guide.youraspire.com/docs/understanding-contract-renewal-settings), renewal pricing choices and overrides
- [LMN: Estimate Settings](https://intercom.help/lmn/en/articles/15939711-estimate-settings), overhead recovery and profit margin from the budget
- [Briostack: Bids and Diagramming](https://www.briostack.com/pest-control-software/bids-diagramming-software/), square foot and flat-rate bid pricing
- [PestPac: CRM Software](https://www.pestpac.com/features/pest-control-crm-software), the sales approval process
- [Salesforce Trailhead: Identify Exceptions to Standard Pricing](https://trailhead.salesforce.com/content/learn/modules/pricing-methods-for-salesforce-cpq/identify-exceptions-to-standard-pricing), the CPQ price waterfall to net price
- [Salesforce Trailhead: Override Volume-Based Discounts](https://trailhead.salesforce.com/content/learn/modules/discounting-tools-in-salesforce-cpq/override-volume-based-discounts), range and slab schedules, override behavior and compound discounts
- [Salesforce Trailhead: Sequence Price Rules](https://trailhead.salesforce.com/content/learn/modules/price-rules-in-salesforce-cpq/sequence-price-rules-for-correct-calculations), evaluation events and condition-before-action ordering
- [Salesforce Trailhead: Get Started with Product Rules](https://trailhead.salesforce.com/content/learn/modules/product-rules-in-salesforce-cpq/get-started-with-product-rules), validation rules that block saving a quote until a problem is fixed
- [Salesforce Trailhead: Approval Rules, Conditions and Variables](https://trailhead.salesforce.com/content/learn/modules/advanced-approvals-for-admins/manage-approval-logic-with-approval-rules-conditions-and-variables), approval variables summarizing quote lines and tracked fields
- [Stripe: Coupons and Promotion Codes](https://docs.stripe.com/billing/subscriptions/coupons#stackable-coupons-and-promotion-codes), durations, redemption limits, promotion code restrictions, and stacked discounts applying in order
- [BookingKoala: Coupons](https://help.bookingkoala.com/help/coupons), coupons for one-time and recurring bookings, stacking and clawback
- [Wisetack: Marketing Compliance](https://www.wisetack.com/marketing-toolkit/hs/compliance), trigger terms, the required disclosure and prohibited claims
- [Wisetack: How to use](https://www.wisetack.com/resources/hs-how-to-use), customer applications by text link and funds released after the customer confirms completion
- [Hearth](https://www.gethearth.com/), homeowners applying for financing directly
- [Jobber: Wisetack Consumer Financing](https://help.getjobber.com/hc/en-us/articles/360056100954), eligibility, amount, APR and term ranges and the merchant fee
- [JobNimbus: Add Financing to an Estimate](https://support.jobnimbus.com/how-do-i-add-financing-to-an-estimate), Wisetack applications from an estimate and an "as low as" payment per option, shown as an estimate
- [Housecall Pro: Klarna](https://www.housecallpro.com/resources/how-to-offer-and-market-klarna-to-customers/), residential invoice eligibility and the fee
- [GreenSky](https://www.greensky.com/), loans made by chartered financial institutions with GreenSky as servicer
- [ServiceTitan: Service Finance Integration](https://www.servicetitan.com/service-finance-integration), a sales finance company integrated with the FSM
- [ServiceTitan: Affirm in the Customer Portal](https://help.servicetitan.com/release-hub/docs/offer-affirm-financing-in-the-customer-portal-to-help-homeowners-pay-for-jobs), pay-over-time in the portal
