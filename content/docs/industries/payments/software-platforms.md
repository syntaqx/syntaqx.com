+++
title = "Payments for Software Platforms"
nav_title = "Software Platforms"
description = "Embedded payments for vertical software: referral, reseller, managed and registered payfac models, the tenant hierarchy, fund splits, 1099-K and support."
category = "Payments Industry"
order = 1414
tags = ["payments", "platforms", "payfac", "multi-tenancy", "embedded-payments"]
+++

A vertical software company, building for gyms, clinics, property managers or school districts, sits where its customers' money moves: invoices, memberships, rent, tuition. Adding payments to that software is the most common way such companies grow revenue without adding customers. The platform earns a share of every dollar processed. Customers who run their payments through the product rarely leave it, and the payment data makes the rest of the product better: who paid late, which locations grow, what to offer next.

It's also where a software company turns into a financial services company, partly or completely, depending on the model. This page is how I'd reason about that choice and what each model asks of engineering. [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider) is the far end of the road; most platforms should know where it leads and stop well short of it.

## Four Ways In

The question that separates the models is the same one that separates payment providers: when a merchant on your platform runs up chargebacks and disappears, who pays?

| Model | Underwrites merchants | Holds the loss | Owns the merchant relationship | Platform earns | Engineering surface |
| --- | --- | --- | --- | --- | --- |
| **Referral** | The processor | The processor | The processor | A referral fee or small share | A link and an integration |
| **Reseller (ISV as agent)** | The processor | The processor, unless the contract shifts it | Shared | A share of the margin, as residuals | Onboarding handoff, reporting |
| **Managed payfac** | The provider, often with the platform's input | The provider first, then the platform by contract | The platform, under its brand | A larger share; sometimes pricing control | Embedded onboarding, payments and payouts, support |
| **Registered payfac** | The platform | The platform, with its sponsor acquirer behind it | The platform | The most margin | All of it, plus risk, compliance and capital |

Each step down the table buys margin and control with risk and work. A referral partner never sees a chargeback. A registered payfac owns every sub-merchant's losses, its own PCI assessment as a service provider, its own underwriting team and the capital to absorb mistakes, with the requirements in [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider) and the rules in [The Payments Rulebook](/docs/industries/payments/payments-rulebook).

Managed payfac, sometimes called payfac-as-a-service, is where most vertical platforms land. The provider is the payment facilitator of record, registered with the networks and holding the sponsor relationship. The platform gets a white-labeled product, a revenue share, and as much of the experience as it wants to build. Stripe Connect's legacy account types show the dial plainly: on Express and Custom accounts the platform carries fraud and dispute liability, and on Standard accounts using direct charges the connected account does. The more the platform hides the provider, the more of the provider's job, and loss, it takes on.

My rule: go as far down as your risk team and balance sheet can actually support, not as far as the margin is tempting. The margin on a registered payfac only exists after underwriting, monitoring, chargeback losses and compliance are paid for, and a platform that's good at gym software isn't automatically good at any of those.

## The Hierarchy

Every embedded payments product is a tree. The provider at the top, then the platform, often an organization or partner level (a franchise, a management company, a reseller of the platform), then the merchants that actually take payments, sometimes with locations or terminals below them. In network terms, the merchants are sub-merchants: Mastercard's rules call them sponsored merchants of the payment facilitator, and require the acquirer to screen and monitor them like any other merchant.

![A tree of tenants: the payment provider at the top, which underwrites, settles and holds the risk; one software platform below it; two organizations below the platform; and four merchants below the organizations. Configuration such as pricing, fees and permissions inherits down the tree, reporting rolls up it, and the provider settles net funds directly to each merchant's bank.](/diagrams/software-platforms.svg "Configuration flows down, reporting flows up, and money skips the middle. The provider settles each merchant directly, so the platform and its organizations never hold the funds.")

Three things move through that tree, and each needs an explicit model:

- **Configuration inherits down.** Pricing, fee schedules, payout timing, allowed payment methods and risk limits are set at the platform or organization and overridden only where a merchant needs something different. Store overrides explicitly and resolve the effective value by walking up the tree, never by copying parent values into children. Copies drift: change the organization's pricing and half its merchants keep the old price.
- **Permissions are scoped to a node.** A franchise owner sees all their locations; a location manager sees one; platform support sees everything, with every access logged. This is [multi-tenancy](/docs/architecture/multi-tenancy) with the tenant boundary at every level of the tree, enforced in the data layer, not the UI.
- **Reporting rolls up.** Every report a merchant gets must sum exactly into its organization's report and the platform's. That only works if every number comes from the same ledger entries, never from a separate reporting pipeline that recomputes fees.

## Onboarding Inside the Product

The whole point of embedding is that a merchant gets payments without leaving the software, so [merchant onboarding](/docs/industries/payments/merchant-onboarding) happens in the platform's own interface. The platform already knows a lot about the merchant: name, address, industry, sometimes years of transaction history. Prefill everything it can, because each field a merchant types costs conversion.

What prefill can't do is decide. Underwriting belongs to whoever holds the risk, the provider in a managed model, and the merchant's state comes from them: pending, active, restricted, rejected, with the outstanding requirements listed. The platform's job is to surface what's due inside its own product, and its integration should treat "the provider says this merchant can't take payments" as authoritative, even when the platform's sales team just closed the deal.

## Components or the API

A platform chooses how card data reaches the provider, and with it its own [PCI scope](/docs/compliance/pci-dss):

- **Embedded components or hosted fields:** the provider's iframe collects the card, and the platform's servers only see tokens. The platform stays at the simplest SAQ, and the provider maintains the payment form as the networks change their rules.
- **Raw API with card numbers:** the platform's servers handle card data, and the platform is in scope for the whole standard.

There's almost never a reason for a software platform to touch card numbers. Use the components, style them to match, and spend the engineering on the workflow around the payment instead of the payment form itself.

## Where the Money Goes

The platform earns from payments in one of two ways, and they have different engineering shapes:

- **A fee taken per transaction.** An application or platform fee is deducted from each payment before the merchant's share settles. It's immediate and simple to explain, and it's a [separate ledger entry](/docs/industries/payments/payouts-and-settlement#fees-are-separate-entries), never netted silently into the merchant's amount.
- **A revenue share paid later.** The provider pays the platform a share of the margin it earned, monthly, as residuals. The platform has to reconcile that statement against its own records of volume and pricing, which it can only do if it records both.

The question underneath both is whether the platform ever **holds** the money. If customer payments land in the platform's own bank account and the platform then pays its merchants, it's receiving and transmitting other people's money, which is [money transmission](/docs/industries/payments/payments-rulebook) unless an exemption applies. The structure that avoids the question is the one in the diagram: the provider settles net funds directly to each merchant's bank, and the platform's cut arrives as a fee or a residual. Design the funds flow first, with counsel, and the ledger second.

## Pricing Per Merchant

Platforms price payments, and the pricing becomes data the system has to get exactly right:

- **Fee schedules are versioned, with effective dates.** A merchant's price on March 3 is whatever schedule was in force on March 3, so changing a price is adding a version, never editing one. Notice periods for price increases come from the merchant agreement, and the system enforces them.
- **Every model is a formula over the same inputs.** Flat rate, per-transaction plus percentage, and interchange-plus all compute a fee from the transaction's amount, card type and the network's cost. [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) covers what goes into each; the schedule decides which formula applies.
- **The fee shown is the fee charged.** A merchant who can't reproduce a fee from their own statement opens a support ticket, and then a dispute about pricing. Store the inputs alongside each fee so it can always be explained.

## Reconciliation for Two Audiences

A merchant reconciles its payouts to its sales: every payout traces to the payments, refunds, fees and disputes it nets. A platform reconciles its revenue: every residual or fee traces to the merchants and transactions that produced it. Both views come from the same ledger, and both have to tie to the provider's settlement reports to the cent. The mechanics are in [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#reconciliation); what platforms add is the second audience, who reads the same numbers for a different reason.

## 1099-K and Taxpayer Data

In the US, card payments to merchants are reported to the IRS on Form 1099-K by the payment settlement entity: the merchant acquiring entity for card transactions, with no minimum threshold. When a payment facilitator makes the settlement payments on the acquirer's behalf, the IRS instructions say the facilitator files the 1099-K in its place. Third-party network transactions, such as marketplaces and payment apps, are reportable above $20,000 and 200 transactions a year.

So whoever settles to the merchant needs a correct legal name and taxpayer ID for every merchant, collected in onboarding and matched against the IRS before the year ends. In a managed model the provider usually owns that filing; a registered payfac owns it outright. Either way, the platform's onboarding is where the data comes from.

## Events to the Platform

The platform's software needs to know what happened to its merchants' money as it happens: a merchant became active, a payment succeeded, a payout landed or failed, a dispute opened with a deadline attached. That's [webhooks](/docs/payments/webhooks), with one addition. Every event carries the merchant it belongs to, and one platform endpoint receives events for thousands of merchants. Route events by merchant before any business logic runs, and make every handler idempotent, because the provider will deliver some events twice.

## Support and Disputes Across Three Parties

When a cardholder disputes a charge, three parties have a stake. The cardholder sees the merchant's name on the statement. The merchant calls the platform, because that's the software they use. And the provider holds the dispute and its deadline. Who answers depends on the model: the platform owns it in a managed or registered model, so the platform's product needs the [dispute workflow](/docs/industries/payments/disputes-and-chargebacks) inside it, with deadlines visible, evidence uploads, and the outcome recorded.

The same goes for every support question about money. "Where's my payout?" has to be answerable by the platform's support team without escalating to the provider, which means the platform's tools show the same ledger states, return codes and settlement dates the provider sees. A support team that can only say "we'll ask our payments partner" is a platform that hasn't finished embedding payments.

## References

**Specifications**

- [IRS: Instructions for Form 1099-K](https://www.irs.gov/instructions/i1099k), payment settlement entities, electronic payment facilitators filing in their place, and the $20,000 and 200 transaction threshold for third-party network transactions

**Reference**

- [IRS: Understanding Your Form 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k), no threshold for card payments, and the threshold for payment apps and marketplaces
- [Mastercard: Security Rules and Procedures, Merchant Edition, August 2026 (archived PDF)](https://web.archive.org/web/20260919122811/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf), sponsored merchants of payment facilitators and the acquirer's duty to screen and monitor them

**In practice**

- [Stripe: Connected Account Types](https://docs.stripe.com/connect/accounts), how liability for fraud and disputes, onboarding and support shift between provider and platform by account type
