+++
title = "Processor Routing"
description = "Running payments over more than one processor: when it pays, routing by card, cost and approval rate, US debit, safe failover, tokens and reconciliation."
category = "Payments Industry"
order = 1421
part = "Running a Provider"
tags = ["payments", "routing", "processors", "debit", "architecture"]
+++

A platform's first processor is a vendor. Its second is an architecture decision. Once payments run through two, every charge needs a decision about where it goes, every failure needs a decision about whether it may go somewhere else, and every dollar needs reconciling against two sets of books. Done well, routing buys resilience, lower costs and better approval rates. Done casually, it buys duplicate charges and a reconciliation team.

I treat the second processor as something you earn. Start with one, build the abstractions that make a second possible (your own payment model, your own tokens, your own ledger), and add it when one of the reasons below is real.

## Why More Than One

- **Resilience.** A processor outage is your outage, for every merchant on the platform at once. A second route keeps checkout up.
- **Cost.** Processors price differently, by card type, region and volume, and the cheapest path for a domestic debit card isn't the cheapest for a corporate card from abroad. [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) covers what makes up the price.
- **Approval rates.** Issuers approve the same card at different rates through different acquirers, especially across borders, where a local acquirer tends to do better.
- **Coverage.** Some processors don't support a currency, a country, a payment method or a merchant category you need.
- **Leverage.** A platform that can move volume negotiates differently from one that can't.

## What It Costs

The bill is real, and it's paid forever, not once:

- **Two integrations,** each with its own API, error model, webhooks, sandbox quirks and release schedule.
- **Two settlement and reconciliation flows,** with different file formats, timing and fee structures, all landing in one ledger.
- **Split operations.** [Disputes](/docs/industries/payments/disputes-and-chargebacks) arrive from each processor separately, against the processor that took the original payment. Refunds must go back through the processor that captured the charge, which is why every payment records its route.
- **Tokens.** A card saved through one processor is often unusable through another. This is the constraint that decides how free you really are, below.
- **Merchant boarding.** Each processor underwrites each merchant ([Merchant Onboarding](/docs/industries/payments/merchant-onboarding)), so "route this merchant's payments to processor B" can mean onboarding the merchant there first.

## Tokens Decide How Free You Are

The deepest lock-in in payments isn't the API. It's the cards. If customers' cards are stored as processor tokens, they exist only inside that processor, and moving them means asking it to export the card numbers to another PCI-compliant provider. Stripe, for example, will do that only to a processor that's PCI DSS Level 1, verified by its Attestation of Compliance or its listing on Visa's registry of service providers, with the file encrypted to the recipient's published key. It works, and it's a project, not a toggle.

The alternative is owning the credential layer:

- **A processor-agnostic vault,** your own or a vault provider's, holding card numbers and handing your systems tokens that any route can use. It's the design that makes routing real, and it puts the vault in [PCI scope](/docs/compliance/pci-dss), as a service provider if it holds cards for other merchants, whoever runs it. [Sensitive Data](/docs/payments/sensitive-data) is the case for keeping that vault small, and [Running a Card Vault](/docs/industries/payments/card-vault) is how to build and operate it.
- **Network tokens** you provision as the token requestor, or through a vault that does, can travel with you between processors that support them. Provisioned by a processor on your behalf, they may stay with that processor.

Decide this before you have a million stored cards, not after. The cost of the decision grows with every card saved.

## One Response Model

Every processor reports results differently: its own status fields, its own error codes, its own mapping of the issuer's response. Normalize them at the edge into one model your platform reasons about:

- **An outcome:** approved, declined, or error (and for an error, whether the payment reached the issuer at all).
- **For declines, a class:** hard or soft, and fraud-related or not, which drives retries, dunning and risk.
- **The raw values, kept:** the processor's code, the issuer's response code, and Mastercard's merchant advice code or Visa's decline category when present. You'll want them for every dispute, every retry decision and every conversation with the processor's support team.

The normalized model is what the rest of the platform depends on; the raw values are what you debug with. Losing either costs you later.

## How to Route

A router is a function from a payment to a route, and I keep it exactly that: deterministic, explainable, and logged with its reasons, so every payment can say why it went where it went.

| Strategy | Signal | Watch out for |
| -------- | ------ | ------------- |
| **Card type** | The BIN: brand, debit or credit, consumer or commercial, issuing country | BIN tables go stale; refresh them on a schedule |
| **Cost** | Estimated interchange, network fees and processor markup for this card on each route | Markup you negotiated is only a forecast until the settlement file proves it |
| **Approval rate** | Recent approval rate per route for similar cards | Compare like with like (same BIN range, same amount band), or noise wins |
| **Currency and region** | Presentment currency, merchant and card country | Cross-border fees and local acquiring rules |
| **Contract** | Volume commitments, a merchant boarded only on one processor | Commitments are a constraint first, an optimization second |
| **Health** | Error rate and latency per route, right now | Feeds failover and shedding, not cost decisions |

Make the router configuration data, versioned and reviewed like code, and record on each payment which rule chose its route. "Why did this payment go to processor B?" should be a query, not an investigation.

![A processor router: checkout sends a payment to the router, which holds routing rules, health scores and a vault of network tokens; the primary route goes to processor A, failover to processor B only after A's outcome is known, debit can go over an unaffiliated network the merchant chooses, and every processor's settlement file reconciles into one ledger.](/diagrams/processor-routing.svg "The router owns the decision, the tokens and the books. Teal is the primary route; failover is dashed because it's only safe once the first attempt's outcome is known, and every route reconciles into one ledger.")

## US Debit: The Merchant Chooses

Debit cards in the US come with a routing right most platforms don't use. Regulation II, the Federal Reserve's rule implementing the Durbin Amendment, prohibits network exclusivity: an issuer must enable at least two unaffiliated networks on every debit card, and it protects the merchant's ability to direct which network a transaction goes over. In October 2022 the Fed clarified that this applies to card-not-present payments too, effective July 1, 2023, after finding that the market had built ways to route online debit across more than one network.

In practice that means an online debit transaction on a Visa or Mastercard debit card can often go over an unaffiliated PIN-less debit network instead, at a different cost. Whether you can use that depends on your processor supporting those networks and on the networks the issuer enabled, so it's a routing rule like any other: identify debit by BIN, compare the routes available for it, choose. For a platform with real debit volume it's one of the largest cost levers there is, and it's the merchant's right, not the network's favor.

## Failover Without Double Charging

The dangerous moment in routing is the timeout. A processor that returns an error has told you the payment didn't happen. A processor that doesn't answer has told you nothing: the authorization may have been approved at the issuer and the response lost on the way back. Send the same payment to processor B then, and the customer may be charged twice, by two processors that each think they did the right thing.

So failover follows rules:

- **Fail over only on a known outcome.** A connection that was refused before anything was sent, or an explicit "not processed" response, is safe to route elsewhere. A timeout after the request was sent is not.
- **Resolve the unknown first.** Query processor A for the payment by its [idempotency key](/docs/payments/idempotency), and if the result is an approval you no longer want, reverse it. Only then is the payment free to try elsewhere. Until it's resolved, it's `pending`, as [Retries & Timeouts](/docs/architecture/retries-and-timeouts) describes.
- **Fail over the route, not the request.** When a processor's health score drops (error rate up, latency up), a circuit breaker stops sending *new* payments there and routes them to the next healthy option. In-flight payments stay where they were and get resolved, not duplicated.
- **Never fail over a decline.** An issuer that declined through processor A will usually decline through B, and resending it counts against the networks' retry limits ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials)). A decline is an answer, not an outage.

## One Ledger, Many Settlement Files

Each processor pays out on its own schedule, nets its own fees, and reports in its own settlement and fee files. None of that changes what the [ledger](/docs/payments/payment-states) must say: every payment, refund, dispute and fee, attributed to its route, balancing to the cent against each processor's deposits. Build one importer per processor that turns its files into ledger entries, and reconcile every processor every day, as [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement) describes for one. A routing decision that saved a few basis points is worth nothing if nobody can prove where the money went.

## What This Means for the System You Build

- **Earn the second processor:** own the payment model, the tokens and the ledger first.
- **A deterministic router whose rules are versioned data,** with the rule that chose each route recorded on the payment.
- **Captures, refunds and disputes follow the recorded route.**
- **Fail over only on a known outcome;** resolve timeouts by query or reversal, and never resend a decline.
- **Own the credential layer,** a processor-agnostic vault and network tokens you requested, before a million stored cards decide for you.
- **Route US debit over unaffiliated networks** where your processor supports them.
- **Normalize responses at the edge, and keep the raw codes.**
- **One importer per processor, reconciled daily into one ledger.**

## References

**Specifications**

- [Federal Reserve: Final rule on debit card routing (October 3, 2022)](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20221003a.htm), at least two unaffiliated networks for card-not-present debit, effective July 1, 2023
- [Federal Reserve: Regulation II FAQs](https://www.federalreserve.gov/paymentsystems/regii-faqs.htm), the network exclusivity prohibition and the merchant's ability to direct routing under 235.7

**Reference**

- [Stripe: Request a payment data export](https://docs.stripe.com/get-started/data-migrations/pan-export), exporting stored card numbers only to a PCI DSS Level 1 processor, with an AOC or Visa registry listing and an encrypted transfer
- [Mastercard Developers: MDES for Merchants](https://developer.mastercard.com/mdes-digital-enablement/documentation/use-cases/mdes-for-merchants-use-cases/), merchants and token requestors provisioning network tokens

**In practice**

- [Martin Fowler: CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html), the closed, open and half-open states behind health-based failover
