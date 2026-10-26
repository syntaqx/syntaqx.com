+++
title = "Payments for Software Platforms"
nav_title = "Software Platforms"
description = "Embedded payments for vertical software: referral, reseller, managed and registered payfac models, the tenant hierarchy, fund splits, 1099-K and support."
category = "Payments Industry"
order = 1422
part = "Running a Provider"
tags = ["payments", "platforms", "payfac", "multi-tenancy", "embedded-payments"]
+++

The chapters so far describe a provider's machinery from the merchant's side. This part is about running it, and it starts with the customers most providers grow on: software companies that embed payments for their own merchants.

A vertical software company (an independent software vendor, or ISV), building for gyms, clinics, property managers or school districts, sits where its customers' money moves: invoices, memberships, rent, tuition. Adding payments to that software is the most common way such companies grow revenue without adding customers. The platform earns a share of every dollar processed. Customers who run their payments through the product rarely leave it, and the payment data makes the rest of the product better: who paid late, which locations grow, what to offer next.

It's also where a software company turns into a financial services company, partly or completely, depending on the model. This chapter is how I'd reason about that choice and what each model asks of engineering, from the platform's side and, at the end, from the side of the provider serving it. [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider) is the far end of the road; most platforms should know where it leads and stop well short of it.

## Four Ways In

The question that separates the models is the same one that separates payment providers: when a merchant on your platform runs up chargebacks and disappears, who pays?

| Model | Underwrites merchants | Holds the loss | Owns the merchant relationship | Platform earns | Engineering surface |
| --- | --- | --- | --- | --- | --- |
| **Referral** | The processor | The processor | The processor | A referral fee or small share | A link and an integration |
| **Reseller (ISV as agent)** | The processor | The processor, unless the contract shifts it | Shared | A share of the margin, as residuals | Onboarding handoff, reporting |
| **Managed payfac** | The provider, often with the platform's input | The provider first, then the platform by contract | The platform, under its brand | A larger share; sometimes pricing control | Embedded onboarding, payments and payouts, support |
| **Registered payfac** | The platform | The platform, with its sponsor acquirer behind it | The platform | The most margin | All of it, plus risk, compliance and capital |

Each step down the table buys margin and control with risk and work. A referral partner never sees a chargeback. A registered payfac owns every sub-merchant's losses, its own PCI assessment as a service provider, its own underwriting team and the capital to absorb mistakes, with the requirements in [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider) and the rules in [The Payments Rulebook](/docs/industries/payments/payments-rulebook).

Managed payfac, sometimes called payfac-as-a-service, is where most vertical platforms land. The provider is the payment facilitator of record, registered with the networks and holding the sponsor relationship. The platform gets a white-labeled product, a revenue share, and as much of the experience as it wants to build. Stripe Connect shows the dial plainly, in its legacy account types and in the controller properties that now replace them: on Express and Custom accounts the platform carries fraud and dispute liability, and on Standard accounts using direct charges the connected account does. The more the platform hides the provider, the more of the provider's job, and loss, it takes on.

My rule: go as far down as your risk team and balance sheet can actually support, not as far as the margin is tempting. The margin on a registered payfac only exists after underwriting, monitoring, chargeback losses and compliance are paid for, and a platform that's good at gym software isn't automatically good at any of those.

## Where the Money Goes

The platform earns from payments in one of two ways, and they have different engineering shapes:

- **A fee taken per transaction.** An application or platform fee is deducted from each payment before the merchant's share settles. It's immediate and simple to explain, and it's a [separate ledger entry](/docs/industries/payments/payouts-and-settlement#fees-are-separate-entries), never netted silently into the merchant's amount. Some merchants want gross settlement instead, with fees collected afterward ([Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#collecting-your-own-fees)).
- **A revenue share paid later.** The provider pays the platform a share of the margin it earned, monthly, as residuals. The platform has to reconcile that statement against its own records of volume and pricing, which it can only do if it records both.

The question underneath both is whether the platform ever **holds** the money. If customer payments land in the platform's own bank account and the platform then pays its merchants, it's receiving and transmitting other people's money, which is [money transmission](/docs/industries/payments/becoming-a-payment-provider#holding-other-people-s-money) unless an exemption applies. The structure that avoids the question is the one in the hierarchy diagram below: the provider settles net funds directly to each merchant's bank, and the platform's cut arrives as a fee or a residual. Design the funds flow first, with counsel, and the ledger second.

## The Hierarchy

Every embedded payments product is a tree. The provider at the top, then the platform, often an organization or partner level (a franchise, a management company, a reseller of the platform), then the merchants that actually take payments, sometimes with locations or terminals below them. In network terms, the merchants are sub-merchants: Mastercard's rules call them sponsored merchants of the payment facilitator, make the acquirer responsible for both, and require a sponsored merchant above $10 million a year in Mastercard volume to contract with the acquirer directly.

![A tree of tenants: the payment provider at the top, which underwrites, settles and holds the risk; one software platform below it; two organizations below the platform; and four merchants below the organizations. Configuration such as pricing, fees and permissions inherits down the tree, reporting rolls up it, and the provider settles net funds directly to each merchant's bank.](/diagrams/software-platforms.svg "Configuration flows down, reporting flows up, and money skips the middle. The provider settles each merchant directly, so the platform and its organizations never hold the funds.")

Configuration inherits down the tree with explicit overrides, permissions are scoped to a node and cover its subtree, and reporting rolls up from the same entries; the general model, with the query that resolves an inherited setting, is in [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies). What payments adds:

- **What inherits is money.** Pricing, fee schedules, payout timing, allowed payment methods and risk limits are set at the platform or organization and overridden only where a merchant needs something different. Providers expose the same shape: Payabli's organizations nest sub-organizations and merchants ("paypoints") without limit, and billing, risk and funding settings cascade down unless overridden. A copied parent value that drifts is a merchant charged the wrong price.
- **Reports roll up from ledger entries.** Every report a merchant gets must sum exactly into its organization's report and the platform's, which only works if every number comes from the same ledger entries, never from a separate reporting pipeline that recomputes fees.
- **Money skips the middle.** The provider settles each merchant directly, so neither the platform nor its organizations hold the funds on the way.

## One Merchant, Several Merchant Accounts

A merchant in the tree often needs more than one merchant account, because it collects for more than one kind of thing. A property manager collects rent, application fees and renters insurance premiums; a city collects taxes, utility bills and parking fines. Each of those can need its own merchant account.

- **The category code belongs to the account.** Visa's rules make the acquirer assign each merchant outlet the merchant category code (MCC) that "most accurately describes its business", and require separate codes when separate lines of business have separate merchant agreements, trade under different names, or sell through e-commerce sites that qualify for different codes. Otherwise the code of the highest-volume line covers everything. The codes that matter for bill payment: 6513 for real estate agents and managers (rent), 6300 for insurance premiums, 4900 for utilities, 9311 for tax payments.
- **The code changes the money and the rules.** Visa runs interchange programs specific to utilities, real estate, insurance and government payments ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing)); its service fee is open only to government, utility and education codes; and its Rent Payment Program is open only to 6513 merchants ([Surcharging & Fees](/docs/industries/payments/surcharging-and-fees)). Running insurance premiums through a rent merchant account isn't a shortcut, it's miscoding the transactions.
- **Model accounts as children of the merchant.** Each merchant account carries its code, processor credentials, statement descriptor, pricing and settlement bank account, and settles and reconciles on its own. A payment is routed to an account by what it pays for, the charge type, not by which merchant it belongs to, and reporting rolls the accounts back up to the merchant. Rent and security deposits often have to land in a trust account, separate from the operating account fees go to, so the settlement account per merchant account is a compliance requirement, not a preference.
- **Moving money between accounts is a real move.** A rent payment that landed in the insurance account, or one owner's trust account instead of another's, isn't fixed by relabeling. Before payout it's a ledger transfer plus a movement of funds between settlement accounts; after payout it's a clawback from one and a payout to the other. Trust-account rules may forbid netting the two, 1099-K reporting follows the account that keeps the money, and refunds and disputes still point at the original payment ([Payment States & Ledgers](/docs/payments/payment-states#append-only-records)).
- **A country is another account.** A merchant's Canadian locations need a Canadian merchant account and acquirer ([Payments in Canada](/docs/industries/payments/canada)).

## Onboarding Inside the Product

The whole point of embedding is that a merchant gets payments without leaving the software, so [merchant onboarding](/docs/industries/payments/merchant-onboarding) happens in the platform's own interface. The platform already knows a lot about the merchant: name, address, industry, sometimes years of transaction history. Prefill everything it can, because each field a merchant types costs conversion.

What prefill can't do is decide. Underwriting belongs to whoever holds the risk, the provider in a managed model, and the merchant's state comes from them: pending, active, restricted, rejected, with the outstanding requirements listed. The platform's job is to surface what's due inside its own product, and its integration should treat "the provider says this merchant can't take payments" as authoritative, even when the platform's sales team just closed the deal.

## Components or the API

A platform chooses how card data reaches the provider, and with it its own [PCI scope](/docs/compliance/pci-dss):

- **Embedded components or hosted fields:** the provider's iframe collects the card, and the platform's servers only see tokens. Its scope shrinks to the pages that embed the fields, but because those pages take payments for its merchants, the platform is usually a service provider to them and validates on SAQ D for Service Providers rather than a merchant's SAQ A ([PCI DSS](/docs/compliance/pci-dss#merchant-or-service-provider)): a long questionnaire over a small environment. The provider also maintains the payment form as the networks change their rules.
- **Raw API with card numbers:** the platform's servers handle card data, and the platform is in scope for the whole standard.

There's almost never a reason for a software platform to touch card numbers. Use the components, style them to match, and spend the engineering on the workflow around the payment instead of the payment form itself. Providers ship them in a few shapes: an embedded form for one payment method, a wallet button, a virtual terminal for staff, a hosted page reached by a link, and increasingly no-code builders for pages and reports; Payabli's embedded components, for example, run in an iframe authorized by a public token and report declines through the same callback as approvals, so the integration checks the result, not just the callback.

Ask before you sign who owns the stored cards if you leave. A provider's tokens stay with the provider unless the contract gives you an export to another PCI DSS Level 1 processor ([Processor Routing](/docs/industries/payments/processor-routing#tokens-decide-how-free-you-are)), and a platform with years of saved cards is only as portable as that clause.

## Pricing Per Merchant

Platforms price payments, and the pricing becomes data the system has to get exactly right:

- **Fee schedules are versioned, with effective dates.** A merchant's price on March 3 is whatever schedule was in force on March 3, so changing a price is adding a version, never editing one. Notice periods for price increases come from the merchant agreement, and the system enforces them.
- **Every model is a formula over the same inputs.** Flat rate, per-transaction plus percentage, and interchange-plus all compute a fee from the transaction's amount, card type and the network's cost. [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) covers what goes into each; the schedule decides which formula applies.
- **The fee shown is the fee charged.** A merchant who can't reproduce a fee from their own statement opens a support ticket, and then a dispute about pricing. Store the inputs alongside each fee so it can always be explained.

## Reconciliation for Two Audiences

A merchant reconciles its payouts to its sales: every payout traces to the payments, refunds, fees and disputes it nets. A platform reconciles its revenue: every residual or fee traces to the merchants and transactions that produced it. Both views come from the same ledger, and both have to tie to the provider's settlement reports to the cent. The mechanics are in [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#reconciliation); what platforms add is the second audience, who reads the same numbers for a different reason.

## 1099-K and Taxpayer Data

In the US, card payments to merchants are reported to the IRS on Form 1099-K by the payment settlement entity: the merchant acquiring entity for card transactions, with no minimum threshold. When a payment facilitator makes the settlement payments on the acquirer's behalf, the IRS instructions say the facilitator files the 1099-K in its place. Third-party network transactions, such as marketplaces and payment apps, are reportable above $20,000 and 200 transactions a year, the threshold the One Big Beautiful Bill Act restored in 2025.

So whoever settles to the merchant needs a correct legal name and taxpayer ID for every merchant, collected in onboarding and matched against the IRS before the year ends. In a managed model the provider usually owns that filing; a registered payfac owns it outright. Either way, the platform's onboarding is where the data comes from, and the filer's obligations run on a calendar:

- **Report gross.** Box 1a is the gross amount, without subtracting refunds, fees or chargebacks, which is why the ledger keeps gross volume ([Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#fees-are-separate-entries)).
- **Deadlines.** Copies to merchants by January 31, and to the IRS by February 28 on paper or March 31 electronically; filing 10 or more information returns of any kind requires filing electronically.
- **Backup withholding.** A merchant whose name and TIN don't match gets a B-notice when the IRS sends a CP2100 listing, and if a corrected Form W-9 doesn't come back within 30 business days, the filer withholds 24% of payouts until it does. A second mismatch within three years needs proof from the Social Security Administration or the IRS, not just a new form.
- **States** have their own thresholds, some as low as $600, and filing through the Combined Federal/State Filing program covers some of them.
- **Keep copies** for three years, or four if backup withholding applied.

## Events to the Platform

The platform's software needs to know what happened to its merchants' money as it happens: a merchant became active, a payment succeeded, a payout landed or failed, a dispute opened with a deadline attached. That's [webhooks](/docs/api-design/webhooks), with one addition. Every event carries the merchant it belongs to, and one platform endpoint receives events for thousands of merchants. Route events by merchant before any business logic runs, and make every handler idempotent, because the provider will deliver some events twice.

## Support and Disputes Across Three Parties

When a cardholder disputes a charge, three parties have a stake. The cardholder sees the merchant's name on the statement. The merchant calls the platform, because that's the software they use. And the provider holds the dispute and its deadline. Who answers depends on the model: the platform owns it in a managed or registered model, so the platform's product needs the [dispute workflow](/docs/industries/payments/disputes-and-chargebacks) inside it, with deadlines visible, evidence uploads, and the outcome recorded.

The same goes for every support question about money. "Where's my payout?" has to be answerable by the platform's support team without escalating to the provider, which means the platform's tools show the same ledger states, return codes and settlement dates the provider sees. A support team that can only say "we'll ask our payments partner" is a platform that hasn't finished embedding payments.

## What a Provider Builds for Platforms

Everything above is what a platform needs. A provider that wants platforms as customers builds the other half:

- **Connected accounts.** An API to create and manage merchants under a platform, with the platform's own key acting on behalf of any of them, and requirements, capabilities and status exposed per merchant ([Designing the Payments API](/docs/industries/payments/payments-api#acting-for-platforms)).
- **Embedded onboarding and dashboards,** as components a platform drops into its product, authorized by short-lived sessions, so the platform never handles identity documents or long-lived merchant credentials.
- **Liability and fee configuration per platform.** Who bears losses (provider or platform), who pays processing fees, and who collects requirements are settings on the platform's account, not separate products; Stripe's controller properties are one model of exactly this.
- **Application fees and splits** on each payment, posted as their own ledger entries, and **residual statements** for revenue-share platforms, each tracing to the merchants and transactions behind it.
- **Platform-scoped keys and reporting.** Keys and reports that cover a platform's whole subtree, and nothing outside it, with per-merchant reports that sum exactly into the platform's.
- **Events for the whole tree,** delivered to one platform endpoint with the merchant attached.

## What This Means for the System You Build

- **Choose the model your risk team and balance sheet can carry,** and design the funds flow with counsel before the ledger, so the platform never holds merchants' money by accident.
- **Model the tenant tree:** configuration resolved by walking up it, permissions scoped to a node in the data layer, every report summed from the same ledger entries.
- **One merchant account per line of business,** each with its own category code, credentials, descriptor, pricing and settlement account, with payments routed by charge type.
- **Treat the provider's merchant status as authoritative,** and show what's due inside your product.
- **Keep card numbers out with the provider's components,** and know who owns the stored cards if you leave.
- **Version fee schedules with effective dates,** and store every fee's inputs.
- **Route events by merchant before any logic runs,** and handle each one idempotently.
- **Give support the provider's view:** ledger states, payout dates, return codes and dispute deadlines.

## References

**Specifications**

- [IRS: Instructions for Form 1099-K](https://www.irs.gov/instructions/i1099k), payment settlement entities, electronic payment facilitators filing in their place, and the $20,000 and 200 transaction threshold for third-party network transactions

**Reference**

- [IRS: Understanding Your Form 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k), no threshold for card payments, and the threshold for payment apps and marketplaces
- [Mastercard: Security Rules and Procedures, Merchant Edition, August 2026 (archived PDF)](https://web.archive.org/web/20260919122811/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf), screening procedures the payment facilitator rules rely on, and the acquirer's duty to screen and monitor them

- [Visa: Merchant Data Standards Manual](https://usa.visa.com/dam/VCOM/download/merchants/visa-merchant-data-standards-manual.pdf), MCC definitions and assigning codes to merchants with several lines of business
- [IRS: Form 1099-K threshold under the One Big Beautiful Bill](https://irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000), the restored $20,000 and 200-transaction threshold
- [IRS: Publication 1099](https://www.irs.gov/publications/p1099), filing deadlines, electronic filing and retention
- [IRS: Publication 1281 (PDF)](https://www.irs.gov/pub/irs-pdf/p1281.pdf), backup withholding and the first and second B-notice

**In practice**

- [Stripe: Connected Account Types](https://docs.stripe.com/connect/accounts), how liability for fraud and disputes, onboarding and support shift between provider and platform by account type
- [Payabli: Organizations](https://docs.payabli.com/guides/pay-ops-organizations-overview.md), a nested organization and merchant hierarchy with settings that inherit unless overridden
- [Payabli: Embedded components](https://docs.payabli.com/guides/pay-in-components-overview.md), iframe components authorized by a public token
- [Stripe: Migrate to controller properties](https://docs.stripe.com/connect/migrate-to-controller-properties), who carries losses, collects requirements and pays fees, as settings instead of account types
- [Stripe: 1099-K for Connect platforms](https://docs.stripe.com/connect/1099-k), state thresholds and filing
