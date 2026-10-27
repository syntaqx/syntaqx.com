+++
title = "Payments for Software Platforms"
nav_title = "Software Platforms"
description = "Embedded payments for vertical software: referral, reseller, managed and registered payfac models, the tenant hierarchy, fund splits, 1099-K and support."
category = "Payments Industry"
order = 1426
part = "Running a Provider"
tags = ["payments", "platforms", "payfac", "multi-tenancy", "embedded-payments"]
+++

The chapters so far describe a provider's machinery from the merchant's side. This part is about running it, and it starts with the customers most providers grow on: software companies that embed payments for their own merchants.

A vertical software company (an independent software vendor, or ISV), building for gyms, clinics, restaurants or schools, sits where its customers' money moves: memberships, appointments, orders, tuition. Adding payments to that software is the most common way such companies grow revenue without adding customers. The platform earns a share of every dollar processed. Customers who run their payments through the product rarely leave it, and the payment data makes the rest of the product better: who paid late, which locations grow, what to offer next.

It's also where a software company turns into a financial services company, partly or completely, depending on the model. This chapter is how I'd reason about that choice and what each model asks of engineering, from the platform's side and, at the end, from the side of the provider serving it. [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider) is the far end of the road; most platforms should know where it leads and stop well short of it.

## Four Ways In

The question that separates the models is the same one that separates payment providers: when a merchant on your platform runs up chargebacks and disappears, who pays? The full ladder, from referral partner to acquirer, with who holds the risk at each rung, is in [Pick a Model, Pick a Risk](/books/payments/becoming-a-payment-provider#pick-a-model-pick-a-risk). Here is what the four rungs a software company usually chooses between mean for the software company itself:

- **Referral.** A link and an integration; the processor owns the merchant, the risk and the support. The platform earns a referral fee or small share and builds almost nothing.
- **Reseller (ISV as agent).** The platform hands onboarding off to the processor and receives residuals, so it builds the handoff and the reporting to check the residual statement. Losses stay with the processor unless the contract shifts them.
- **Managed payfac.** The provider is the payment facilitator of record; the platform owns the merchant relationship under its own brand. It builds embedded onboarding, payments, payouts and support, and carries losses the contract assigns it.
- **Registered payfac.** The platform underwrites, holds every sub-merchant's losses, and carries its own PCI assessment, risk team and capital. It builds all of it.

Managed payfac, sometimes called payfac-as-a-service, is where most vertical platforms land: a white-labeled product, a revenue share, and as much of the experience as the platform wants to build. Stripe Connect shows the dial plainly, in its legacy account types and in the controller properties that now replace them: on Express and Custom accounts the platform carries fraud and dispute liability, and on Standard accounts using direct charges the connected account does. The more the platform hides the provider, the more of the provider's job, and loss, it takes on.

My rule: go as far down as your risk team and balance sheet can actually support, not as far as the margin is tempting. The margin on a registered payfac only exists after underwriting, monitoring, chargeback losses and compliance are paid for, and a platform that's good at gym software isn't automatically good at any of those.

## Where the Money Goes

The platform earns from payments in one of two ways, and they have different engineering shapes:

- **A fee taken per transaction.** An application or platform fee is deducted from each payment before the merchant's share settles. It's immediate and simple to explain, and it's a [separate ledger entry](/books/payments/payouts-and-settlement#fees-are-separate-entries), never netted silently into the merchant's amount. Some merchants want gross settlement instead, with fees collected afterward ([Payouts & Settlement](/books/payments/payouts-and-settlement#collecting-your-own-fees)).
- **A revenue share paid later.** The provider pays the platform a share of the margin it earned, monthly, as residuals. The platform has to reconcile that statement against its own records of volume and pricing, which it can only do if it records both.

A fee the platform charges its merchants is the platform's own sale of a service, and whether it's taxable depends on where the merchant is and how the fee is described ([Sales Tax](/docs/payments/sales-tax#taxability-varies-by-place)).

The question underneath both is whether the platform ever **holds** the money. If customer payments land in the platform's own bank account and the platform then pays its merchants, it's receiving and transmitting other people's money, which is [money transmission](/books/payments/becoming-a-payment-provider#holding-other-people-s-money) unless an exemption applies. The structure that avoids the question is the one in the hierarchy diagram below: the provider settles net funds directly to each merchant's bank, and the platform's cut arrives as a fee or a residual. Design the funds flow first, with counsel, and the ledger second.

## The Hierarchy

Every embedded payments product is a tree. The provider at the top, then the platform, often an organization or partner level (a franchise group, a management company, a reseller of the platform), then the merchants that actually take payments, usually with locations and terminals below them. In network terms, the merchants are sub-merchants: Mastercard's rules call them sponsored merchants of the payment facilitator, make the acquirer ensure its payment facilitator meets every obligation, and require a sponsored merchant above $10 million a year in combined Mastercard and Maestro volume to sign a merchant agreement directly with an acquirer, unless the facilitator meets the rules' exception conditions.

![A tree of tenants: the payment provider at the top, which underwrites, settles and holds the risk; one software platform below it; two organizations below the platform; and four merchants below the organizations. Configuration such as pricing, fees and permissions inherits down the tree, reporting rolls up it, and the provider settles net funds directly to each merchant's bank.](/diagrams/software-platforms.svg "Configuration flows down, reporting flows up, and money skips the middle. The provider settles each merchant directly, so the platform and its organizations never hold the funds.")

Providers draw the tree with different nouns and the same shape:

- **Stripe Connect** is flat at the account level: a platform and its connected accounts. Below an account, Terminal **locations** group card readers by physical site, and zones group locations into regions or sub-brands.
- **Adyen for Platforms** separates who a user is from where its money sits: a **legal entity** per country for KYC, an **account holder** per country for capabilities, one or more **balance accounts** that hold funds and pay out, and a **store** per physical location under the merchant account for that country.
- **Finix** puts the platform's **Application** at the root, an **Identity** for each business (where KYC happens), and **Merchants** under the Identity for each payment capability it enables, online and in person for example.

Whatever the vendor calls them, the platform's own model needs the same levels: platform, organization, merchant (the legal entity that's underwritten and paid), merchant account (below), and location. Configuration inherits down the tree with explicit overrides, permissions are scoped to a node and cover its subtree, and reporting rolls up from the same entries; the general model, with the query that resolves an inherited setting, is in [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies). What payments adds:

- **What inherits is money.** Pricing, fee schedules, payout timing, allowed payment methods and risk limits are set at the platform or organization and overridden only where a merchant needs something different. Providers differ on whether a child inherits or copies: Finix creates each new merchant's fee and risk profiles as copies of the Application's, so a later change to the defaults doesn't reach existing merchants. Either can be right, but it's a choice to make on purpose, because a copied parent value that drifts is a merchant charged the wrong price.
- **Reports roll up from ledger entries.** Every report a merchant gets must sum exactly into its organization's report and the platform's, which only works if every number comes from the same ledger entries, never from a separate reporting pipeline that recomputes fees.
- **Money skips the middle.** The provider settles each merchant directly, so neither the platform nor its organizations hold the funds on the way.

## One Merchant, Several Merchant Accounts

A merchant in the tree often needs more than one merchant account, because it collects for more than one kind of thing. A fitness club sells memberships, spa services and food at its café; a university collects tuition and runs a bookstore. Each of those can need its own merchant account.

- **The category code belongs to the account.** Visa's rules make the acquirer assign each merchant outlet the merchant category code (MCC) that "most accurately describes its business", and require separate codes when separate lines of business have separate merchant agreements, trade under different names, or sell through e-commerce sites that qualify for different codes. Otherwise the code of the highest-volume line covers everything. The fitness club's lines are 7997 (membership clubs), 7298 (health and beauty spas) and 5814 (fast food restaurants); the university's are 8220 (colleges and universities) and 5942 (book stores).
- **The code changes the money and the rules.** Interchange categories differ by code ([Interchange & Pricing](/books/payments/interchange-and-pricing)), and some fee programs are open only to certain codes: Visa's service fee is limited to specific codes, colleges and schools among them ([Surcharging & Fees](/books/payments/surcharging-and-fees#convenience-and-service-fees)), so the university can use it on tuition and not in its bookstore. Running bookstore sales through the tuition account isn't a shortcut, it's miscoding the transactions.
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

There's almost never a reason for a software platform to touch card numbers. Use the components, style them to match, and spend the engineering on the workflow around the payment instead of the payment form itself. Providers ship them in a few shapes: an embedded form for one payment method, a wallet button, a virtual terminal for staff, a hosted page reached by a link, and increasingly no-code builders for pages and reports. Whatever the shape, a component's completion callback reports a result, not a success, so the integration checks whether the payment was approved before it moves on.

Ask before you sign who owns the stored cards if you leave. A provider's tokens stay with the provider unless the contract gives you an export to another PCI DSS Level 1 processor ([Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are)), and a platform with years of saved cards is only as portable as that clause.

## Pricing Per Merchant

Fee schedules are versioned rules over the same inputs, and the engine that computes them, with effective dates and every fee's inputs stored, is in [A Pricing Engine](/books/payments/interchange-and-pricing#a-pricing-engine). What a platform adds is two layers on top of it:

- **Schedules inherit down the tree.** A platform sets a default schedule, an organization negotiates its own for all its merchants, and a merchant overrides it only by contract. The fee on a payment is computed from the schedule resolved for that merchant on that date, and the merchant's statement says where the schedule came from.
- **Two prices per payment.** In a managed model the provider charges the platform its price, and the platform charges the merchant its own. The platform's markup is the difference, and it's only visible if both are stored per payment: the merchant's fee as the merchant was charged, and the provider's cost as the provider's statement shows it.
- **Notice before increases.** Notice periods for price increases come from the merchant agreement, and the system enforces them by refusing a new version that takes effect sooner.

## Reconciliation for Two Audiences

The matching itself, ledger to processor report to bank, is in [Bank Reconciliation Is Its Own Discipline](/books/payments/treasury#bank-reconciliation-is-its-own-discipline). What platforms add is a second audience reading the same numbers for a different reason: a merchant reconciles its payouts to its sales, and a platform reconciles its revenue, every residual or fee tracing to the merchants and transactions that produced it. Both views come from the same ledger and both tie to the provider's settlement reports to the cent; a residual statement the platform can't recompute from its own records is one it can only take on trust.

## 1099-K and Taxpayer Data

In the US, card payments to merchants are reported to the IRS on Form 1099-K by the payment settlement entity: the merchant acquiring entity for card transactions, with no minimum threshold. When a payment facilitator makes the settlement payments on the acquirer's behalf, the IRS instructions say the facilitator files the 1099-K in its place. Third-party network transactions, such as marketplaces and payment apps, are reportable above $20,000 and 200 transactions a year, the threshold the One Big Beautiful Bill Act restored in 2025.

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
- **Liability and fee configuration per platform.** Who bears losses (provider or platform), who pays processing fees, and who collects requirements are settings on the platform's account, not separate products; Stripe's controller properties are one model of exactly this.
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
  key            TEXT NOT NULL,                -- 'fee_schedule_id', 'payout_delay_days', ...
  value          JSONB NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  set_by         TEXT NOT NULL,
  PRIMARY KEY (merchant_id, key, effective_from)
);

ALTER TABLE payments ADD COLUMN merchant_account_id UUID REFERENCES merchant_accounts (id);
ALTER TABLE payments ADD COLUMN location_id UUID REFERENCES locations (id);
ALTER TABLE payments ADD COLUMN charge_type TEXT;  -- what it pays for; picks the account
```

The platform's fee and the provider's cost are ledger entries on the payment's ledger transaction, to `platform_revenue` and `processing_costs`, so the markup per merchant is a query over entries rather than a column anyone maintains.

## What This Means for the System You Build

- **Choose the model your risk team and balance sheet can carry,** and design the funds flow with counsel before the ledger, so the platform never holds merchants' money by accident.
- **Model the tenant tree:** configuration resolved by walking up it, permissions scoped to a node in the data layer, every report summed from the same ledger entries.
- **One merchant account per line of business,** each with its own category code, credentials, descriptor, pricing and settlement account, with payments routed by charge type.
- **Treat the provider's merchant status as authoritative,** and show what's due inside your product.
- **Keep card numbers out with the provider's components,** and know who owns the stored cards if you leave.
- **Fee schedules that inherit down the tree,** with the provider's cost and the merchant's price both stored per payment.
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
