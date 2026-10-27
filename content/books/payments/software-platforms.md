+++
title = "Payments for Software Platforms"
nav_title = "Software Platforms"
description = "Embedded payments for vertical software: payfac models, the tenant tree, fee overrides at scale, wrong fees and their fixes, fund splits, 1099-K and support."
category = "Payments Industry"
order = 1430
part = "Running a Provider"
tags = ["payments", "platforms", "payfac", "multi-tenancy", "embedded-payments"]
+++

The chapters so far describe a provider's machinery from the merchant's side. This part is about running it, and it starts with the customers most providers grow on: software companies that embed payments for their own merchants.

A vertical software company (an independent software vendor, or ISV), building for [gyms, clinics, restaurants or schools](/books/payments/payments-by-vertical), sits where its customers' money moves: memberships, appointments, orders, tuition. Adding payments to that software is the most common way such companies grow revenue without adding customers. The platform earns a share of every dollar processed. Customers who run their payments through the product rarely leave it, and the payment data makes the rest of the product better: who paid late, which locations grow, what to offer next.

It's also where a software company turns into a financial services company, partly or completely, depending on the model. This chapter is how I'd reason about that choice and what each model asks of engineering, from the platform's side and, at the end, from the side of the provider serving it. [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider) is the far end of the road; most platforms should know where it leads and stop well short of it.

## Four Ways In

The question that separates the models is the same one that separates payment providers: when a merchant on your platform runs up chargebacks and disappears, who pays? The full ladder, from referral partner to acquirer, with who holds the risk at each rung, is in [Pick a Model, Pick a Risk](/books/payments/becoming-a-payment-provider#pick-a-model-pick-a-risk). Here is what the four rungs a software company usually chooses between mean for the software company itself; the vendors who sell the middle rungs are compared in [Embedded Payments: How the Platforms Do It](/books/payments/payments-landscape#embedded-payments-how-the-platforms-do-it):

- **Referral.** A link and an integration; the processor owns the merchant, the risk and the support. The platform earns a referral fee or small share and builds almost nothing.
- **Reseller (ISV as agent).** The platform hands onboarding off to the processor and receives residuals ([Partners, ISOs & Residuals](/books/payments/partners-and-residuals)), so it builds the handoff and the reporting to check the residual statement. Losses stay with the processor unless the contract shifts them.
- **Managed payfac.** The provider is the payment facilitator of record; the platform owns the merchant relationship under its own brand. It builds embedded onboarding, payments, payouts and support, and carries losses the contract assigns it.
- **Registered payfac.** The platform underwrites, holds every sub-merchant's losses, and carries its own PCI assessment, risk team and capital. It builds all of it.

Managed payfac, sometimes called payfac-as-a-service, is where most vertical platforms land: a white-labeled product, a revenue share, and as much of the experience as the platform wants to build. Stripe Connect shows the dial plainly, in its legacy account types and in the controller properties that now replace them: on Express and Custom accounts the platform carries fraud and dispute liability, and on Standard accounts using direct charges the connected account does. The more the platform hides the provider, the more of the provider's job, and loss, it takes on.

My rule: go as far down as your risk team and balance sheet can actually support, not as far as the margin is tempting. The margin on a registered payfac only exists after underwriting, monitoring, chargeback losses and compliance are paid for, and a platform that's good at gym software isn't automatically good at any of those.

Acceptance isn't the only embedded product. A platform can also issue cards to the businesses it serves, and the same question decides it: issuing on connected accounts usually puts the platform on the hook for their verification and their losses ([What Gets Built on Issuing](/books/payments/card-issuing#what-gets-built-on-issuing)).

## Where the Money Goes

The platform earns from payments in one of two ways, and they have different engineering shapes:

- **A fee taken per transaction.** An application or platform fee is deducted from each payment before the merchant's share settles. It's immediate and simple to explain, and it's a [separate ledger entry](/books/payments/payouts-and-settlement#fees-are-separate-entries), never netted silently into the merchant's amount. Some merchants want gross settlement instead, with fees collected afterward ([Payouts & Settlement](/books/payments/payouts-and-settlement#collecting-your-own-fees)).
- **A revenue share paid later.** The provider pays the platform a share of the margin it earned, monthly, as residuals. The platform has to reconcile that statement against its own records of volume and pricing, which it can only do if it records both.

A fee the platform charges its merchants is the platform's own sale of a service, and whether it's taxable depends on where the merchant is and how the fee is described ([Sales Tax](/docs/payments/sales-tax#taxability-varies-by-place)).

Some platforms also split the payment itself. A school's tuition payment funds the school and a partner; a homeowners association's dues fund the association and a maintenance fund. Payabli's split funding is a worked example. The transaction request carries split instructions that send shares to other paypoints or to other bank accounts of the same paypoint, and the amounts "must add up to match the transaction net total *exactly*, or the request will fail". The unwinding is defined as carefully as the split:

- **A full refund** reverses the original split instructions, taking each share back from the account it went to.
- **A partial refund** must carry its own split instructions: how much comes back from which account, only from accounts on the original payment, and never more from an account than it received.
- **A chargeback or ACH return** comes off the originating merchant's ledger in full; Payabli then reverses the split, pulling the other accounts' shares back to the originating merchant. Fees aren't returned in either case.

My rule for splits: a split is entries on one payment, never several payments, and each leg records the share it received, so a refund or dispute reverses leg by leg against the original. Decide before launch who carries the loss when a recipient's balance can't cover the reclaim. The originating merchant is the natural default, because, as in Payabli's flow, the dispute or return lands on it first, and the reclaim from the other legs is a receivable it may not collect.

The question underneath all of these is whether the platform ever **holds** the money. If customer payments land in the platform's own bank account and the platform then pays its merchants, it's receiving and transmitting other people's money, which is [money transmission](/books/payments/becoming-a-payment-provider#holding-other-people-s-money) unless an exemption applies. The structure that avoids the question is the one in the hierarchy diagram below: the provider settles net funds directly to each merchant's bank, and the platform's cut arrives as a fee or a residual. Design the funds flow first, with counsel, and the ledger second. Marketplaces between guests and hosts or buyers and sellers face the same question with a fee that can fall on either side or both, and their fee models and merchant-of-record choices are in [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#merchant-of-record-and-the-money-path).

## The Hierarchy

Every embedded payments product is a tree. The provider at the top, then the platform, often an organization or partner level (a franchise group, a management company, a reseller of the platform), then the merchants that actually take payments, usually with locations and terminals below them. In network terms, the merchants are sub-merchants: Mastercard's rules call them sponsored merchants of the payment facilitator, make the acquirer ensure its payment facilitator meets every obligation, and require a sponsored merchant above $10 million a year in combined Mastercard and Maestro volume to sign a merchant agreement directly with an acquirer, unless the facilitator meets the rules' exception conditions.

![A tree of tenants: the payment provider at the top, which underwrites, settles and holds the risk; one software platform below it; two organizations below the platform; and four merchants below the organizations. Configuration such as pricing, fees and permissions inherits down the tree, reporting rolls up it, and the provider settles net funds directly to each merchant's bank.](/diagrams/software-platforms.svg "Configuration flows down, reporting flows up, and money skips the middle. The provider settles each merchant directly, so the platform and its organizations never hold the funds.")

Providers draw the tree with different nouns and the same shape:

- **Adyen for Platforms** separates who a user is from where its money sits: a **legal entity** per country for KYC, an **account holder** per country for capabilities, one or more **balance accounts** that hold funds and pay out, and a **store** per physical location under the merchant account for that country.
- **Finix** puts the platform's **Application** at the root, an **Identity** for each business (where KYC happens), and **Merchants** under the Identity for each payment capability it enables, online and in person for example.
- **Global Payments for Platforms** (formerly Payrix) runs up to five levels, **facilitator**, **partner** (or referrer), **partition**, **division** and **merchant**, plus **groups** that share fee, billing and risk configuration across their members; a division's workflow settings override its partition's.
- **Moov** is flat: the platform is the **partner**, with **business** and **individual accounts** linked to it through shared scopes, which Moov calls connected accounts.
- **NMI** nests **affiliates** and **sub-affiliates** under a **partner**, with **merchants** below; asking for the list without a parent returns "the full tree".
- **Payabli** nests **sub-organizations** under an **organization** to any depth, with a **paypoint** for each merchant account, created through boarding once underwriting approves it.
- **Rainforest** keeps two levels: the **platform** and its **merchants**, with **users** under each.
- **Stripe Connect** is flat at the account level: a platform and its connected accounts. Below an account, Terminal **locations** group card readers by physical site, and zones group locations into regions or sub-brands.
- **Tilled** has three: a **reseller**, a **partner** (the software platform) and a **merchant**, each a connected account linked to its parent.

Whatever the vendor calls them, the platform's own model needs the same levels: platform, organization, merchant (the legal entity that's underwritten and paid), merchant account (below), and location. Configuration inherits down the tree with explicit overrides, permissions are scoped to a node and cover its subtree, and reporting rolls up from the same entries; the general model, with the query that resolves an inherited setting, is in [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies). What payments adds:

- **What inherits is money.** Pricing, fee schedules, payout timing, allowed payment methods and risk limits are set at the platform or organization and overridden only where a merchant needs something different. Providers differ on whether a child inherits or copies: Finix creates each new merchant's fee and risk profiles as copies of the Application's, so a later change to the defaults doesn't reach existing merchants. Either can be right, but it's a choice to make on purpose, because a copied parent value that drifts is a merchant charged the wrong price.
- **Reports roll up from ledger entries.** Every report a merchant gets must sum exactly into its organization's report and the platform's, which only works if every number comes from the same ledger entries, never from a separate reporting pipeline that recomputes fees.
- **Money skips the middle.** The provider settles each merchant directly, so neither the platform nor its organizations hold the funds on the way.

## One Merchant, Several Merchant Accounts

A merchant in the tree often needs more than one merchant account, because it collects for more than one kind of thing. A fitness club sells memberships, spa services and food at its café; a university collects tuition and runs a bookstore. Each of those can need its own merchant account.

- **The category code belongs to the account.** Visa's rules make the acquirer assign each merchant outlet the merchant category code (MCC) that "most accurately describes its business", and require separate codes when separate lines of business have separate merchant agreements, trade under different names, or sell through e-commerce sites that qualify for different codes. Otherwise the code of the highest-volume line covers everything. The fitness club's lines are 7997 (membership clubs), 7298 (health and beauty spas) and 5814 (fast food restaurants); the university's are 8220 (colleges and universities) and 5942 (book stores).
- **The code changes the money and the rules.** Interchange categories differ by code ([Interchange & Pricing](/books/payments/interchange-and-pricing)), and some fee programs are open only to certain codes: Visa's service fee is limited to specific codes, colleges and schools among them ([Surcharging & Fees](/books/payments/surcharging-and-fees#convenience-and-service-fees)), so the university can use it on tuition and not in its bookstore. Running bookstore sales through the tuition account isn't a shortcut, it's miscoding the transactions. What each vertical's code unlocks is in [Payments by Vertical](/books/payments/payments-by-vertical#the-verticals-at-a-glance).
- **Model accounts as children of the merchant.** Each merchant account carries its code, processor credentials, statement descriptor, pricing and settlement bank account, and settles and reconciles on its own. A payment is routed to an account by what it pays for, the charge type, not by which merchant it belongs to, and reporting rolls the accounts back up to the merchant. Some money must land in a segregated account by law or contract (a law firm's client retainers in its trust account, for one), so the settlement account per merchant account can be a compliance requirement, not a preference.
- **Moving money between accounts is a real move.** A café sale that landed in the membership account, or a client retainer in the operating account, isn't fixed by relabeling. Before payout it's a ledger transfer plus a movement of funds between settlement accounts; after payout it's a clawback from one and a payout to the other. Trust-account rules may forbid netting the two, 1099-K reporting follows the account that keeps the money, and refunds and disputes still point at the original payment ([Payment States & Ledgers](/docs/payments/payment-states#append-only-records)).
- **A country is another account.** A merchant's Canadian locations need a Canadian merchant account and acquirer ([Payments in Canada](/books/payments/canada)), the same split Adyen makes with an account holder and merchant account per country.

## Onboarding Inside the Product

The whole point of embedding is that a merchant gets payments without leaving the software, so [merchant onboarding](/books/payments/merchant-onboarding) happens in the platform's own interface. The platform already knows a lot about the merchant: name, address, industry, sometimes years of transaction history. Prefill everything it can, because each field a merchant types costs conversion.

What prefill can't do is decide. Underwriting belongs to whoever holds the risk, the provider in a managed model, and the merchant's state comes from them: pending, active, restricted, rejected, with the outstanding requirements listed. The platform's job is to surface what's due inside its own product, and its integration should treat "the provider says this merchant can't take payments" as authoritative, even when the platform's sales team just closed the deal.

## Components or the API

A platform chooses how card data reaches the provider, and with it its own [PCI scope](/docs/compliance/pci-dss):

- **Embedded components or hosted fields:** the provider's iframe collects the card, and the platform's servers only see tokens. Its scope shrinks to the pages that embed the fields, but because those pages take payments for its merchants, the platform is usually a service provider to them and validates on SAQ D for Service Providers rather than a merchant's SAQ A ([PCI DSS](/docs/compliance/pci-dss#merchant-or-service-provider)): a long questionnaire over a small environment. The provider also maintains the payment form as the networks change their rules.
- **Raw API with card numbers:** the platform's servers handle card data, and the platform is in scope for the whole standard.

There's almost never a reason for a software platform to touch card numbers. Use the components, style them to match, and spend the engineering on the workflow around the payment instead of the payment form itself. Providers ship them in a few shapes: an embedded form for one payment method, a wallet button, a virtual terminal for staff, [a hosted page reached by a link](/books/payments/checkout-and-invoicing#six-surfaces), and increasingly no-code builders for pages and reports. Whatever the shape, a component's completion callback reports a result, not a success, so the integration checks whether the payment was approved before it moves on.

Ask before you sign who owns the stored cards if you leave. A provider's tokens stay with the provider unless the contract gives you an export to another PCI DSS Level 1 processor ([Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are)), and a platform with years of saved cards is only as portable as that clause.

## Pricing Per Merchant

Fee schedules are versioned rules over the same inputs, and the engine that computes them, with effective dates and every fee's inputs stored, is in [A Pricing Engine](/books/payments/interchange-and-pricing#a-pricing-engine). What a platform adds is the tree on top of it: prices set at one level, overridden at another, and charged at the bottom, on every payment every merchant account takes.

![An indented tree of five levels with three fee columns: card discount, ACH fee and chargeback fee, with illustrative values. The platform sets all three: 2.90%, $0.50 and $25.00. The organization overrides only the card discount, at 2.60%; the sub-organization only the ACH fee, at $0.30; and merchant A, the accented one, only the chargeback fee, at $15.00. Merchant B inherits all three. Below the table, merchant A's resolved schedule is 2.60% from the organization, $0.30 from the sub-organization and $15.00 from merchant A, frozen as one version and stamped on every payment it prices.](/diagrams/pm-fee-overrides.svg "Each level overrides single lines, and a merchant account's schedule resolves line by line from the nearest level that sets each. A sibling with no overrides of its own inherits everything.")

### Overrides Down the Tree

- **Schedules inherit down the tree.** A platform sets a default schedule, an organization negotiates its own for all its merchants, a sub-organization (a region, a franchise group, a product line) adjusts it again, and a merchant account overrides it only by contract. Payabli's hierarchy is this shape: organizations nest sub-organizations without a fixed depth, each paypoint (its merchant account) belongs to exactly one organization, and billing, risk and funding settings cascade down, each level inheriting from the one above unless an override is in place. The fee on a payment is computed from the schedule resolved for that merchant account on that date, and the merchant's statement says where each line came from.
- **Override a line, not the schedule.** A negotiated price is almost never a new schedule; it's one rate. An organization that negotiated its card discount should still pick up the platform's next change to the ACH fee. So an override is a single fee line at a node (the card discount, the ACH fee, the chargeback fee, a monthly minimum), and the schedule resolves line by line, each line from the nearest level that sets it. Copying a whole schedule to change one number is how a merchant ends up on last year's ACH price without anyone having decided that.
- **Every level has a cost and a price.** In a tree deeper than platform and merchant, each level's price to the levels below is the next level's cost: a reseller organization buys at the platform's rate and sells to its merchants at its own. The margin at every level is a subtraction, and only if the resolved schedule keeps every level's price for each line, not just the bottom one. The guardrail follows: a level can't price a line below its own cost without an approved exception, because a price under cost is a loss on every payment, and someone in the tree pays it.
- **Moving a node is a pricing event.** A merchant moved to another organization, or a sub-organization moved under another parent, changes every line it inherits. Payabli doesn't make either move self-service, and a moved paypoint may get a new configuration profile to preserve its effective settings when the new parent's differ. Whatever the mechanism, the decision is explicit: pin the moved node's effective lines as its own overrides, recorded as a change with a reason, or adopt the new parent's prices, which for an increase is a new version that respects the notice period. A move must never reprice silently.
- **Two prices per payment.** In a managed model the provider charges the platform its price, and the platform charges the merchant its own. The platform's markup is the difference, and it's only visible if both are stored per payment: the merchant's fee as the merchant was charged, and the provider's cost as the provider's statement shows it.
- **Notice before increases.** Notice periods for price increases come from the merchant agreement, and the system enforces them by refusing a new version that takes effect sooner.

### How the Platforms Do It

Providers that sell to platforms answer the same five questions differently: where fees are set, whether a child follows its parent's later changes or keeps a copy, how one merchant gets a different price, whether one payment can, and what record of past pricing survives.

| Provider | Where fees are set | Inherit live or copy | Merchant override | Per-transaction override | Pricing history |
| --- | --- | --- | --- | --- | --- |
| **Adyen for Platforms** | Split configuration profiles linked to a store, with `commission` and `additionalCommission` | Sharing a profile across stores not documented; an edit made after authorization applies at capture | Link the store to a different profile | `splits` on the request: "Request-level instructions override profile instructions" | Accounting, balance and statement reports, and a monthly invoice |
| **Finix** | A fee profile on the Application's profile, with `fee_profiles` in the API | Copy on create: each merchant profile gets "a copy of the profiles in the Application Profile". A fee profile can also be assigned to many merchants, and a change to it affects "all merchants that profile is applied to", for new transactions only | Assign the merchant its own fee profile | Not documented; one-off fees are separate `POST /fees` objects | A residual-by-merchant report; the merchant fee profile report shows active profiles only |
| **Global Payments for Platforms** | Three levels: entity, group and transaction, with fee schedules, fee modifiers and fee rules | Not documented; a group configures fee settings for all its members at once | Entity-level fees | A transaction-level fee listener | Fee modifiers record the entity they came from; billing and revenue summary reports |
| **Moov** | Fee plans "configured by Moov", assigned to one account or reused across many, accepted by the account holder | Neither: a plan is an agreement, and a change is a new agreement referencing `priorAgreementID` (in development in the v2026.10.00 changelog) | A different agreement for that account | `facilitatorFee` on the transfer | The `priorAgreementID` chain, a residuals API, partner statements and merchant statement PDFs |
| **NMI** | Fee schedules, filterable by `parentAffiliateId`, with `isDefault` and `isCustom`, assigned to a merchant | Not documented | Not documented (`isCustom` is undefined in the reference) | Not documented | Commission reports API; residuals management with "Built-in fee verification" |
| **Payabli** | Billing profiles per entity; billing settings at the organization | Live cascade: settings "cascade from organizations down through any sub-organizations to paypoints", each level inheriting "unless an override is in place" | Override at the paypoint | The payer's `serviceFee`, when per-transaction override is enabled | Monthly processing-fee statements; residuals in the portal |
| **Rainforest** | A billing profile per merchant, with a default assigned automatically | Not documented; reassigning a profile "will take effect immediately" | Assign a different billing profile | Dynamic billing fees "will override the merchant's billing profile" | Residuals paid to the platform as a monthly billing deposit |
| **Stripe Connect** | Platform pricing schemes and pricing groups | Groups follow the scheme live; overrides are copies: "any updates to your platform pricing scheme don't affect the pricing scheme of overridden connected accounts" | An override scheme per account, with "Revert to platform pricing" | An explicit application fee or `transfer_data[amount]` takes precedence over the scheme | A "historical pricing scheme" snapshot per payment, exportable as CSV, and a collected fees view |
| **Tilled** | Pricing templates per payment method | Neither: templates are immutable, and "only the nickname of a pricing template can be edited" | Changing an existing merchant's pricing means emailing Tilled | Not documented | Monthly commission statements with transaction details "for auditing" |

Read across the columns and the design space is three answers to the copy question. Payabli and Global Payments resolve through the tree, so a parent's change reaches every child that hasn't overridden it. Stripe's overrides and Finix's creation-time copies stop following the parent, which is the drift [Where It Breaks](#where-it-breaks) warns about. Moov and Tilled make a price immutable and replace it, which keeps history by construction and makes every change a migration. Only Stripe documents a pricing snapshot on each payment, the stamped version that [Resolving at Scale](#resolving-at-scale) recommends; with the others, the platform keeps that record itself.

### Who Pays the Fee

The schedule decides how much. Who pays, and when, is a separate setting that inherits down the same tree:

- **The merchant absorbs it,** netted from each day's funding or billed in bulk at month end ([Collecting Your Own Fees](/books/payments/payouts-and-settlement#collecting-your-own-fees)). Payabli offers both.
- **The payer pays it,** as a service fee, convenience fee or surcharge on top of the amount, within the limits in [Surcharging & Fees](/books/payments/surcharging-and-fees). Payabli carries every payer fee type in one `serviceFee` field and checks it against the configured amount to two decimals, accepting a difference of one cent either way. Two settings decide what happens beyond that: absorb a lower fee, with the merchant covering the difference (otherwise the payment is rejected with return code 5005), and accept a higher one (otherwise 5006). Overriding the configured fee on individual transactions is a further setting it enables case by case.
- **A parent pays it.** Payabli calls this bill to parent: the merchant and its customers pay no fees, and the partner above them does, usually to make signing up easier. In the ledger the fee still belongs to the merchant's payment; it posts to the parent's receivable instead of netting from the merchant's funding, so the merchant's statement and the parent's invoice trace to the same entries.

My default: who pays, the payer fee tolerance and the per-transaction override are permissions as much as configuration. An API key that can override the fee on a payment can charge a payer anything up to the legal cap, so the override is granted per merchant, and every overridden payment stores the configured fee beside the one charged.

### Resolving at Scale

Walking up the tree with a recursive query, as [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies) shows, is right for an admin screen and wrong for pricing millions of payments a day. It repeats the same walk for every payment, its cost grows with a depth the provider may not cap, and two payments a second apart can resolve differently if a change commits between their reads.

- **Resolve when prices change, not when payments happen.** When an override is written, recompute the resolved schedule for every merchant account under that node, and store each as an immutable version: every line with its value, the node it came from, and every level's price for it. Pricing a payment is one indexed lookup (the account's version in force at the payment's timestamp), and since versions never change, they cache by id indefinitely.
- **Fan-out is a job with a deadline.** A platform-level change touches every account in the tree. Changes are effective-dated, so the job runs ahead of the effective time and writes versions whose `valid_during` starts then; at the effective instant nothing recomputes, and lookups simply land in the new rows ([Scheduling Future Changes](/docs/database/temporal-data#scheduling-future-changes)). A change effective immediately is the dangerous one: hold it until the fan-out completes, or let pricing resolve live for any account whose version isn't written yet, and alert on how many did.
- **Stamp the version on the payment.** Each payment records the resolved schedule that priced it, and each fee entry its line and inputs ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). "Where did this price come from" on a statement is then a join, never a recomputation.
- **Reprice a sample every night.** Recompute a sample of the day's payments, and every payment for an account whose prices changed that day, from the stamped version and stored inputs, and compare with the posted fees. Any difference is a defect in the engine, found the next morning instead of at month end.

### Changing Prices Without Losing the Record

A price change is money, so it's handled like money: attributed, approved, and never rewritten.

- **Change sets, not edits.** Every change, one line for one merchant or a new ACH price for ten thousand, is a change set: who made it, why, the contract or ticket it implements, who approved it, and the override rows it writes. A bulk repricing is one change set with one approval, previewed before approval as a diff of every affected account's effective lines and the revenue effect at last month's volume.
- **Approval scaled to risk.** A change inside a merchant's contract can go straight through. A price below cost, a retroactive change, or an increase inside the notice period needs a second person, and never the person who benefits from it ([Auditing Metric Definitions](/books/payments/payments-metrics#auditing-metric-definitions) applies the same rule to overrides of metrics).
- **Two kinds of time.** Each override keeps when it takes effect (`valid_during`) and when the system recorded it (`recorded_during`), as [Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections) describes. "What was this merchant account's ACH fee on March 3" and "what did the system record it as on March 3" are different questions, and a disputed fee needs both answers.
- **Rollback is another change set.** Undoing a change writes the old values as new overrides with their own record. Nothing deletes the mistaken one; it's the evidence of what was charged in between. The change record itself belongs in the [audit trail](/docs/architecture/audit-trails), with the before and after effective lines.

### Where It Breaks

The fee arithmetic is rarely what fails. The failures sit where configuration, time and the tree meet, and each one needs a check that runs without anyone remembering to:

- **Copies drift.** A schedule copied to a child at creation, or lines pinned during a move, stop receiving the parent's changes. That can be correct, but it must be visible: report every pinned line with its age and whether it differs from what it would inherit, and have someone review the list.
- **The payment doesn't carry what the line keys on.** A line priced by card type when the BIN table is stale, by channel when an integration misreports it, or by category on a payment routed to the wrong merchant account. The schedule is right and the fee is wrong. Track fees by input, and let the processor's files true up the estimate ([A Pricing Engine](/books/payments/interchange-and-pricing#a-pricing-engine)).
- **Effective dates in the wrong zone.** A price effective November 1 applied at midnight UTC reprices the evening of October 31 across the US. Resolve business dates in the merchant's zone and test the boundary ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **A fan-out that didn't finish.** A job that failed halfway leaves part of a subtree on the old version. After every change set, count the accounts under its node whose version at the effective time doesn't include it; anything above zero pages someone.
- **Rounding in two places.** A percentage fee rounded per payment and the same fee rounded on the monthly total differ by cents per merchant per month. Write the rule down once and use it in the engine, the statement and the reconciliation ([Rounding](/docs/payments/money#rounding)).
- **The same fee computed twice.** Billing computes from the schedule, a dashboard recomputes for display, a residual statement computes again, and they disagree. Every fee shown anywhere is read from posted entries.
- **A checkout that computes its own payer fee.** A client that calculates the service fee with its own rounding or a stale rate gets rejected, or, with absorb turned on, quietly costs the merchant the difference on every payment. Have the checkout ask the pricing engine for the fee, and alert on absorbed differences.
- **Overrides nobody owns.** An exception granted for one quarter that's still in force three years later. Give exceptions an end date or a review date, and list the ones past it.

### When a Fee Is Wrong

A wrong fee is found by the merchant, by the nightly repricing, or by reconciliation against the processor's statement. However it's found, fixing it takes the same steps:

1. **Stop it.** Write the corrected line as a change set effective now, so new payments price correctly while the rest is worked out.
2. **Scope it.** Because every payment stamps the version that priced it, the affected payments are a query: every payment priced by a version containing the bad line, per merchant account, with the fee charged and the fee the corrected schedule gives. That list is the remediation, and its total is the number finance books.
3. **Correct in the ledger, never in place.** Post an adjustment per merchant account, usually per period with the payment list attached, referencing the original fee entries. The originals stay, because the merchant was funded net of them and their bank statement shows it ([Append-Only Records](/docs/payments/payment-states#append-only-records)). An overcharge comes back as a credit on the next funding or a payout of its own. An undercharge is a decision: the contract may allow collecting it, but collecting a fee the platform got wrong can cost more in trust than it recovers, so set the threshold in advance rather than per incident.
4. **Tell the merchant.** The statement shows the adjustment as its own line, with the period and the reason, never folded into the month's fees.
5. **Fix the cause, and add the check.** A wrong fee from any of the failures above gets the check that would have caught it.

Two variations. An overcharged **payer** fee is refunded to the payer, not credited to the merchant, and an excessive surcharge can break network rules or state law, not just the merchant agreement ([Surcharging & Fees](/books/payments/surcharging-and-fees#what-state-law-allows)). A wrong **cost**, a processor fee you didn't contract, runs the same scope query in the other direction, and its output is the claim you send the processor.

## Reconciliation for Two Audiences

A platform reads the same numbers as its merchants for a different reason: the merchant reconciles payouts to sales, the platform reconciles its revenue to the merchants and transactions that produced it, and both views are queries over one ledger, as [Two Audiences for the Same Numbers](/books/payments/ledger-and-reconciliation#two-audiences-for-the-same-numbers) describes.

## 1099-K and Taxpayer Data

In the US, card payments to merchants are reported to the IRS on Form 1099-K by the payment settlement entity: the merchant acquiring entity for card transactions, with no minimum threshold. When a payment facilitator makes the settlement payments on the acquirer's behalf, the IRS instructions say the facilitator files the 1099-K in its place. Third-party network transactions, such as marketplaces and payment apps, are reportable above $20,000 and 200 transactions a year, the threshold the One Big Beautiful Bill Act restored in 2025. Creator and seller platforms add the forms for payees who aren't merchants (1099-MISC, 1042-S for foreign payees, and the EU's DAC7), covered in [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#information-returns-1099-k-1099-misc-and-1042-s).

So whoever settles to the merchant needs a correct legal name and taxpayer ID for every merchant, collected in onboarding and matched against the IRS before the year ends. The taxpayer ID is a field to classify and protect like a bank account number: encrypted, masked in support tools, never logged ([Sensitive Data](/docs/payments/sensitive-data#classify-every-field)). In a managed model the provider usually owns the filing; a registered payfac owns it outright. Either way, the platform's onboarding is where the data comes from, and the filer's obligations run on a calendar:

- **Report gross.** Box 1a is the gross amount, without subtracting refunds, fees or chargebacks, which is why the ledger keeps gross volume ([Payouts & Settlement](/books/payments/payouts-and-settlement#fees-are-separate-entries)).
- **Deadlines.** Copies to merchants by January 31, and to the IRS by February 28 on paper or March 31 electronically; filing 10 or more information returns of any kind requires filing electronically.
- **Backup withholding.** A merchant whose name and TIN don't match gets a B-notice when the IRS sends a CP2100 listing, and if a corrected Form W-9 doesn't come back within 30 business days, the filer withholds 24% of payouts until it does. A second mismatch within three years needs proof from the Social Security Administration or the IRS, not just a new form.
- **States** have their own thresholds, some as low as $600, and filing through the Combined Federal/State Filing program covers some of them.
- **Keep copies** for three years, or four if backup withholding applied.

## Events to the Platform

The platform's software needs to know what happened to its merchants' money as it happens: a merchant became active, a payment succeeded, a payout landed or failed, a dispute opened with a deadline attached. That's [webhooks](/docs/api-design/webhooks), with one addition. Every event carries the merchant it belongs to, and one platform endpoint receives events for thousands of merchants. Route events by merchant before any business logic runs, and make every handler idempotent, because the provider will deliver some events twice.

## Support and Disputes Across Three Parties

When a cardholder disputes a charge, three parties have a stake. The cardholder sees the merchant's name on the statement. The merchant calls the platform, because that's the software they use. And the provider holds the dispute and its deadline. Who answers depends on the model: the platform owns it in a managed or registered model, so the platform's product needs the [dispute workflow](/books/payments/disputes-and-chargebacks) inside it, with deadlines visible, evidence uploads, and the outcome recorded.

The same goes for every support question about money. "Where's my payout?" has to be answerable by the platform's support team without escalating to the provider, which means the platform's tools show the same ledger states, return codes and settlement dates the provider sees. A support team that can only say "we'll ask our payments partner" is a platform that hasn't finished embedding payments.

## What a Provider Builds for Platforms

Everything above is what a platform needs. A provider that wants platforms as customers builds the other half:

- **Connected accounts.** An API to create and manage merchants under a platform, with the platform's own key acting on behalf of any of them, and requirements, capabilities and status exposed per merchant ([Designing the Payments API](/books/payments/payments-api#acting-for-platforms)).
- **Embedded onboarding and dashboards,** as components a platform drops into its product, authorized by short-lived sessions, so the platform never handles identity documents or long-lived merchant credentials.
- **Liability and fee configuration per platform.** Who bears losses (provider or platform), who pays processing fees, and who collects requirements are settings on the platform's account, not separate products. Stripe's controller properties are one model of exactly this; Adyen's split instructions, which deduct fees from the platform's liable account or from a chosen balance account, are another.
- **Application fees and splits** on each payment, posted as their own ledger entries, and **residual statements** for revenue-share platforms, each tracing to the merchants and transactions behind it.
- **Platform-scoped keys and reporting.** Keys and reports that cover a platform's whole subtree, and nothing outside it, with per-merchant reports that sum exactly into the platform's.
- **Events for the whole tree,** delivered to one platform endpoint with the merchant attached.

## How to Build It

These are deltas against [the core data model](/books/payments/card-payments#the-core-data-model). The tree itself is already there: `merchants.parent_id` nests organizations and sub-merchants under a platform. What a platform adds is the merchant account below the merchant, the location below that, and settings that inherit down the tree.

```sql
CREATE TABLE merchant_accounts (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id           UUID NOT NULL REFERENCES merchants (id),
  mcc                   TEXT NOT NULL,           -- per line of business, not per merchant
  country               TEXT NOT NULL,
  processor             TEXT NOT NULL,
  processor_merchant_id TEXT NOT NULL,           -- the MID
  statement_descriptor  TEXT NOT NULL,
  settlement_bank_token TEXT NOT NULL,           -- vaulted, never the account number
  status                TEXT NOT NULL CHECK (status IN ('pending', 'active', 'restricted', 'closed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (processor, processor_merchant_id)
);

CREATE TABLE locations (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts (id),
  name                TEXT NOT NULL,
  address             JSONB NOT NULL
);

CREATE TABLE merchant_settings (               -- overrides only; resolve by walking up parent_id
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  key            TEXT NOT NULL,                -- 'fee_payer', 'payout_delay_days', ...
  value          JSONB NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  set_by         TEXT NOT NULL,
  PRIMARY KEY (merchant_id, key, effective_from)
);

CREATE TABLE fee_change_sets (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  reason      TEXT NOT NULL,
  reference   TEXT,                            -- contract, ticket
  created_by  TEXT NOT NULL,
  approved_by TEXT,                            -- required by policy for below cost, retroactive, inside notice
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (approved_by IS NULL OR approved_by <> created_by)
);

CREATE TABLE fee_overrides (                   -- one line at one node; append-only
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id         UUID REFERENCES merchants (id),          -- any level of the tree
  merchant_account_id UUID REFERENCES merchant_accounts (id),  -- or one merchant account
  fee_line            TEXT NOT NULL,           -- 'card.discount', 'ach.fixed', 'chargeback.fixed', ...
  value               JSONB NOT NULL,          -- {"bps": 260} or {"fixed": 30}, never floats
  valid_during        TSTZRANGE NOT NULL,
  recorded_during     TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  change_set_id       UUID NOT NULL REFERENCES fee_change_sets (id),
  CHECK (num_nonnulls(merchant_id, merchant_account_id) = 1)
);

CREATE TABLE resolved_fee_schedules (          -- immutable; written ahead of valid_during
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts (id),
  valid_during        TSTZRANGE NOT NULL,
  lines               JSONB NOT NULL,          -- per line: value, source node, each level's price
  change_set_id       UUID NOT NULL REFERENCES fee_change_sets (id),
  EXCLUDE USING GIST (merchant_account_id WITH =, valid_during WITH &&)
);

ALTER TABLE payments ADD COLUMN merchant_account_id UUID REFERENCES merchant_accounts (id);
ALTER TABLE payments ADD COLUMN location_id UUID REFERENCES locations (id);
ALTER TABLE payments ADD COLUMN charge_type TEXT;  -- what it pays for; picks the account
ALTER TABLE payments ADD COLUMN resolved_fee_schedule_id UUID REFERENCES resolved_fee_schedules (id);
```

The platform's fee and the provider's cost are ledger entries on the payment's ledger transaction, to `platform_revenue` and `processing_costs`, so the markup per merchant is a query over entries rather than a column anyone maintains. A corrected fee is another entry referencing the original, and a level's margin on any payment is its own price minus its parent's, both read from the stamped schedule.

## Auditing

Pricing in a tree is audited from the records the sections above require, and each check should be a query, not a project:

- **Every price traces to a change set.** Sample resolved schedule versions and walk each line back to its override row, its change set, the contract or ticket it implements, and an approver other than its author wherever policy demanded one. A line that traces to nothing is a finding, however correct its value.
- **Overrides are listed and owned.** Every override and pinned line, with its node, age, end or review date, and how it differs from what it would inherit. Exceptions past their review date are findings, and so are copies nobody can explain.
- **Payments reprice from their stamp.** For a sample of payments, the posted fee equals the fee computed from the stamped schedule and the stored inputs. Keep the nightly repricing results as the evidence, with every difference and how it was closed.
- **Splits sum to the payment.** Each split payment's legs add up to its net, and each refund or dispute on it reverses legs that existed, for no more than each received.
- **Residual statements tie out.** Reconcile the provider's residual or commission statement each month against the platform's own volume and both prices per payment, and send differences to the break queue ([Breaks](/books/payments/ledger-and-reconciliation#breaks)). Providers publish the inputs differently: Finix defines "Merchant Fees - Finix Costs = Residuals" and reports residuals by merchant, NMI sells residuals management with built-in fee verification, Moov offers a residuals API and partner statements, and Stripe exports the pricing scheme in force on each payment. Whatever the provider gives, the platform's own records are what the statement is checked against.
- **What a sponsor bank or an auditor asks.** Who can change a merchant's price, and when that access was last reviewed. Which increases went out, with the notice given and evidence the system refused anything sooner. Whether payer fees stayed within network rules and state law, with the configured fee stored beside the charged one. Whether every sub-merchant was settled directly, so the platform never held the funds. How complete the 1099-K data is, and how many merchants fail TIN matching. Each answer should come from the same ledger entries, change sets and stamped versions the platform runs on.

## What This Means for the System You Build

- **Choose the model your risk team and balance sheet can carry,** and design the funds flow with counsel before the ledger, so the platform never holds merchants' money by accident.
- **Model the tenant tree:** configuration resolved by walking up it, permissions scoped to a node in the data layer, every report summed from the same ledger entries.
- **One merchant account per line of business,** each with its own category code, credentials, descriptor, pricing and settlement account, with payments routed by charge type.
- **Treat the provider's merchant status as authoritative,** and show what's due inside your product.
- **Keep card numbers out with the provider's components,** and know who owns the stored cards if you leave.
- **Fee schedules that inherit down the tree line by line,** with every level's price, the provider's cost and the merchant's price stored per payment.
- **Resolve schedules when prices change,** stamp the version on each payment, and reprice a sample nightly against posted fees.
- **Price changes as approved change sets** with both kinds of time; moves and exceptions are explicit, and wrong fees are corrected by adjusting entries scoped from the stamped versions.
- **Split a payment into legs on one payment,** summing to its net, so refunds and disputes reverse leg by leg.
- **Route events by merchant before any logic runs,** and handle each one idempotently.
- **Give support the provider's view:** ledger states, payout dates, return codes and dispute deadlines.

## References

**Specifications**

- [IRS: Instructions for Form 1099-K](https://www.irs.gov/instructions/i1099k), payment settlement entities, electronic payment facilitators filing in their place, and the $20,000 and 200 transaction threshold for third-party network transactions
- [Mastercard Rules, 2 June 2026 (archived PDF)](https://web.archive.org/web/20260928113643/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/mastercard-rules.pdf), Rule 7.8 Payment Facilitator Obligations: the acquirer's responsibility for its payment facilitators, and the USD 10,000,000 sponsored merchant threshold and its exception conditions

**Reference**

- [IRS: Understanding Your Form 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k), no threshold for card payments, and the threshold for payment apps and marketplaces
- [Visa: Merchant Data Standards Manual](https://usa.visa.com/dam/VCOM/download/merchants/visa-merchant-data-standards-manual.pdf), MCC definitions (7997, 7298, 5814, 8220, 5942) and assigning codes to merchants with several lines of business
- [IRS: Form 1099-K threshold under the One Big Beautiful Bill](https://irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000), the restored $20,000 and 200-transaction threshold
- [IRS: Publication 1099](https://www.irs.gov/publications/p1099), filing deadlines, electronic filing and retention
- [IRS: Publication 1281 (PDF)](https://www.irs.gov/pub/irs-pdf/p1281.pdf), backup withholding and the first and second B-notice

**In practice**

- [Stripe: Connected Account Types](https://docs.stripe.com/connect/accounts), how liability for fraud and disputes, onboarding and support shift between provider and platform by account type
- [Stripe: Migrate to controller properties](https://docs.stripe.com/connect/migrate-to-controller-properties), who carries losses, collects requirements and pays fees, as settings instead of account types
- [Stripe: Manage locations](https://docs.stripe.com/terminal/fleet/locations-and-zones), Terminal locations per physical site, zones above them, and locations under connected accounts
- [Stripe: 1099-K for Connect platforms](https://docs.stripe.com/connect/1099-k), state thresholds and filing
- [Adyen: Platform account structure](https://docs.adyen.com/platforms/account-structure-resources/platform-structure), legal entities and account holders per country, balance accounts, and a store per physical location
- [Adyen: Account structure for platforms](https://docs.adyen.com/platforms/account-structure-resources/), merchant accounts, balance accounts for funds, and stores for routing and reconciliation
- [Finix: Key resources](https://docs.finix.com/additional-resources/developers/resources-and-payment-flows/key-resources), Application, Identity and Merchant, and fee and risk profiles copied from the Application at creation
- [Payabli: Organizations overview](https://docs.payabli.com/guides/pay-ops-organizations-overview), sub-organizations, one organization per paypoint, settings cascading with overrides, and moving a paypoint
- [Payabli: Entities overview](https://docs.payabli.com/guides/platform-entities-overview), unlimited nesting of sub-organizations and paypoints, and paypoints created through boarding
- [Payabli: Billing and fees](https://docs.payabli.com/guides/pay-ops-billing-and-fees-overview), fee structures, who pays (absorb, service fee, bill to parent), and daily or monthly collection
- [Payabli: Payor fees](https://docs.payabli.com/guides/pay-in-payor-fees-overview), the `serviceFee` field, the one-cent tolerance, absorb and accept-greater settings, return codes 5005 and 5006, and per-transaction overrides
- [Payabli: Split funds from a transaction](https://docs.payabli.com/guides/pay-in-developer-routing-split-funds), split instructions to other paypoints or bank accounts, which must sum exactly to the net total
- [Payabli: Refund a split funded transaction](https://docs.payabli.com/guides/pay-in-developer-routing-refund-split), full refunds reversing the split, and the rules for partial refunds with split instructions
- [Payabli: Split payment chargebacks and returns](https://docs.payabli.com/guides/pay-in-split-disputes-overview), the full amount debited from the originating merchant, the split reversed back to it, and fees not returned
- [Payabli: Fees and statements](https://docs.payabli.com/guides/pay-ops-fees-statements-overview), monthly processing-fee statements
- [Payabli: Portal overview](https://docs.payabli.com/guides/platform-portal-overview), residuals in the partner portal
- [Payabli: Billing profiles](https://docs.payabli.com/guides/pay-ops-developer-billing-profiles-retrieve), pricing per entity
- [Adyen: Split configuration profiles (Management API)](https://docs.adyen.com/api-explorer/Management/latest/post/merchants/(merchantId)/splitConfigurations), profiles with `commission` and `additionalCommission`, and fees deducted from the liable account or one balance account
- [Adyen: Automatic split configuration](https://docs.adyen.com/platforms/automatic-split-configuration), profiles linked to stores, and edits after authorization applying at capture
- [Adyen: Split transactions](https://docs.adyen.com/platforms/online-payments/split-transactions), request-level split instructions overriding the profile
- [Adyen: Reports and fees](https://docs.adyen.com/platforms/reports-and-fees), accounting, balance and statement reports, and the monthly invoice
- [Finix: Merchant fee profiles](https://docs.finix.com/guides/platform-payments/monetizing-payments/merchant-fee-profiles), shared fee profile changes affecting every merchant they apply to
- [Finix: Fees API](https://docs.finix.com/api/fees), one-off fees
- [Finix: Platform residuals](https://docs.finix.com/guides/platform-payments/monetizing-payments/platform-residuals), "Merchant Fees - Finix Costs = Residuals" and the residual-by-merchant report
- [Finix: Reports](https://docs.finix.com/guides/managing-operations/insights-reports/reports), the merchant fee profile report showing active profiles only
- [Global Payments for Platforms: Overview of entities](https://resource.payrix.com/docs/overview-of-entities), facilitator, partner, partition, division and merchant levels, and groups sharing fee, billing and risk configuration
- [Global Payments for Platforms: Understanding divisions](https://resource.payrix.com/docs/understanding-divisions), division workflow settings overriding partition settings
- [Global Payments for Platforms: Set up fees](https://resource.payrix.com/docs/set-up-fees), entity, group and transaction-level fees, and groups configuring fees for all members
- [Global Payments for Platforms: Fees](https://resource.payrix.com/resources/fees), fee schedules and fee modifiers recording the entity they came from
- [Global Payments for Platforms: Billing and revenue reports](https://resource.payrix.com/docs/billing-and-revenue-reports.md), billing and revenue summaries
- [Moov: Account types](https://docs.moov.io/guides/accounts/account-types/index.md), business and individual accounts, and connected accounts through shared scopes
- [Moov: Fee plans](https://docs.moov.io/guides/fee-plans/plan-options/), plans configured by Moov, reusable across accounts and accepted by the account holder
- [Moov: Changelog, August 21, 2026](https://docs.moov.io/changelog/2026-08-21/), fee plan changes as new agreements with `priorAgreementID`, in development for v2026.10.00
- [Moov: Create a transfer](https://docs.moov.io/api/money-movement/transfers/create/), `facilitatorFee` on a transfer
- [Moov: Merchant billing](https://docs.moov.io/guides/billing/merchant-billling/), merchant statements and the residuals API
- [Moov: Partner billing](https://docs.moov.io/guides/billing/partner/), partner statements
- [NMI: Get sub-affiliate list](https://docs.nmi.com/reference/get-sub-affiliate-list), partner, affiliates and sub-affiliates, and the full tree
- [NMI: Pull all fee schedules](https://docs.nmi.com/reference/pull-all-fee-schedules), fee schedules with `parentAffiliateId`, `isDefault` and `isCustom`
- [NMI: See your commission](https://docs.nmi.com/reference/see-your-commission), the commission reports API
- [NMI: Residuals management](https://www.nmi.com/products/merchant-central/residuals-management/), residuals with built-in fee verification
- [Rainforest: Overview](https://docs.rainforestpay.com/docs/overview), platform, merchants and users
- [Rainforest: Merchant billing profiles](https://docs.rainforestpay.com/docs/merchant-billing-profiles), a billing profile per merchant, reassignment taking effect immediately
- [Rainforest: Configure a default billing profile](https://docs.rainforestpay.com/docs/configure-default-billing-profile), the default profile assigned to new merchants
- [Rainforest: Dynamic payment billing fees](https://docs.rainforestpay.com/docs/dynamic-payment-billing-fees), per-payment fees overriding the billing profile
- [Rainforest: Understanding deposits](https://docs.rainforestpay.com/docs/understanding-deposits), residuals deposited to the platform monthly
- [Stripe: Pricing schemes](https://docs.stripe.com/connect/platform-pricing-tools/pricing-schemes), groups following the scheme, overrides as copies, reverting to platform pricing, explicit fees taking precedence, and the historical pricing scheme per payment
- [Stripe: Pricing groups](https://docs.stripe.com/connect/platform-pricing-tools/pricing-groups), assigning connected accounts to groups
- [Tilled: Glossary](https://docs.tilled.com/docs/resources/glossary), reseller, partner and merchant as connected accounts linked to a parent
- [Tilled: Merchant pricing](https://docs.tilled.com/docs/merchants/merchant-pricing), immutable pricing templates and changing an existing merchant's pricing
- [Tilled: Commissions](https://docs.tilled.com/docs/commissions), monthly commission statements with transaction details for auditing
