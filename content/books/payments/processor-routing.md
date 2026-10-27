+++
title = "Processor Routing"
description = "Running payments over several processors: orchestration, routing by card and cost, US debit, safe failover, cascading within retry rules, and tokens."
category = "Payments Industry"
order = 1427
part = "Running a Provider"
tags = ["payments", "routing", "processors", "debit", "architecture"]
+++

[Payments for Software Platforms](/books/payments/software-platforms) ended with what a provider builds for its platforms; the next thing a growing provider adds is a second processor.

A platform's first processor is a vendor. Its second is an architecture decision. Once payments run through two, every charge needs a decision about where it goes, every failure needs a decision about whether it may go somewhere else, and every dollar needs reconciling against two sets of books. Done well, routing buys resilience, lower costs and better approval rates. Done casually, it buys duplicate charges and a reconciliation team.

I treat the second processor as something you earn. Start with one, build the abstractions that make a second possible (your own payment model, your own tokens, your own ledger), and add it when one of the reasons below is real.

## Why More Than One

- **Resilience.** A processor outage is your outage, for every merchant on the platform at once. A second route keeps checkout up.
- **Cost.** Processors price differently, by card type, region and volume, and the cheapest path for a domestic debit card isn't the cheapest for a corporate card from abroad. [Interchange & Pricing](/books/payments/interchange-and-pricing) covers what makes up the price.
- **Approval rates.** Issuers approve the same card at different rates through different acquirers, especially across borders, where a local acquirer tends to do better.
- **Coverage.** Some processors don't support a currency, a country, a payment method or a merchant category you need.
- **Leverage.** A platform that can move volume negotiates differently from one that can't.

## What It Costs

The bill is real, and it's paid forever, not once:

- **Two integrations,** each with its own API, error model, webhooks, sandbox quirks and release schedule.
- **Two settlement and reconciliation flows,** with different file formats, timing and fee structures, all landing in one ledger.
- **Split operations.** [Disputes](/books/payments/disputes-and-chargebacks) arrive from each processor separately, against the processor that took the original payment. Refunds must go back through the processor that captured the charge, which is why every payment records its route.
- **Tokens.** A card saved through one processor is often unusable through another. This is the constraint that decides how free you really are, below.
- **Merchant boarding.** Each processor underwrites each merchant ([Merchant Onboarding](/books/payments/merchant-onboarding)), so "route this merchant's payments to processor B" can mean onboarding the merchant there first.

## Tokens Decide How Free You Are

The deepest lock-in in payments isn't the API. It's the cards. If customers' cards are stored as processor tokens, they exist only inside that processor, and moving them means the processor exporting card numbers to another PCI-compliant provider, on its terms and its timeline. How that export works, what it leaves behind and why to settle the export clause before signing are general rules of leaving any vendor, covered in [Payment Credentials](/docs/architecture/replacing-systems#payment-credentials), [Vendor Exports and Lock-In](/docs/architecture/replacing-systems#vendor-exports-and-lock-in) and [Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter). For routing the point is narrower: a card only one processor can charge is a card the router can't route.

The alternative is owning the credential layer:

- **A processor-agnostic vault,** your own or a vault provider's, holding card numbers and handing your systems tokens that any route can use. It's the design that makes routing real, and it puts the vault in [PCI scope](/docs/compliance/pci-dss), as a service provider if it holds cards for other merchants, whoever runs it. [Sensitive Data](/docs/payments/sensitive-data) is the case for keeping that vault small, and [Running a Card Vault](/books/payments/card-vault) is how to build and operate it.
- **Network tokens** you provision as the token requestor, or through a vault that does, can travel with you between processors that support them. Provisioned by a processor on your behalf, they may stay with that processor.

**Network-token portability in practice** comes down to who the [token requestor](/books/payments/stored-credentials#keeping-the-card-alive) is and who can get a cryptogram. Every network-token payment carries a fresh cryptogram from the network's token service, so whoever holds the requestor relationship sits in the path of every charge, whichever processor receives it. Vault and orchestration providers sell exactly that: Gr4vy's vault forwarding provisions a network token on first use if none exists, generates a new cryptogram for each forwarded request, and can fall back to the card number when no token is available. The fallback matters, because not every route accepts a network token from a third-party requestor, and a router that assumes it does will decline cards it could have charged. Store the network token, its requestor and its status beside the vault token, and make "can this route take our network token?" a routing input.

Decide this before you have a million stored cards, not after. The cost of the decision grows with every card saved.

## How the Platforms Do It

Payment orchestration is the market built on this chapter: vendors that sit between a merchant and several processors, hold the cards in their own vault, and route, retry and fail over by configuration. They differ in the details that matter most:

- **Spreedly** routes from a no-code workflow builder: one static gateway, a percentage split between gateways to compare approval rates and costs, or conditional branches on transaction, customer and card data where the first match wins. Failure handling is a separate, paid feature that retries soft declines and gateway outages on up to two failover gateways, and routing on card attributes needs a BIN lookup step first.
- **Primer** sets a fallback processor on a workflow's authorize step and normalizes every processor's response into standard fields first. A fallback fires only on a short list: a gateway rejection, an application error, or an issuer soft decline with a generic reason (declined, do not honor, refer to issuer, issuer temporarily unavailable). It doesn't work when the processor runs 3-D Secure itself, because the authentication belongs to the first route.
- **Gr4vy** routes through a rules engine with per-processor retry and timeout settings, and forwards stored cards, processor tokens or network tokens to whichever endpoint the rule picks.
- **Stripe,** one processor rather than an orchestrator, does a version of the same inside its own connections: it may retry an eligible US debit decline on a PINless debit network, reformats requests to issuers' preferences, and blocks attempts that would incur network retry fees.

What every one of them separates is the lesson: routing (where the first attempt goes), recovery (whether a failed attempt may go somewhere else) and the vault (whether any route can charge the card at all). Buying orchestration buys those three; building means building the same three, under the same rules about which failures may be retried.

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
- **Resolve the unknown first.** Query processor A for the payment by its [idempotency key](/docs/payments/idempotency), and if the result is an approval you no longer want, reverse it. Only then is the payment free to try elsewhere. Until it's resolved, it's `authorizing` (in flight, outcome unknown; [Payment States & Ledgers](/docs/payments/payment-states#in-flight-states)), as [Retries & Timeouts](/docs/architecture/retries-and-timeouts) describes.
- **Fail over the route, not the request.** When a processor's health score drops (error rate up, latency up), a circuit breaker stops sending *new* payments there and routes them to the next healthy option. In-flight payments stay where they were and get resolved, not duplicated.
- **Never fail over a hard decline.** An issuer that declined through processor A will usually decline through B. A decline is an answer, not an outage, and resending one is governed by the networks' retry rules, below.

## Cascading and Smart Retries

**Cascading** is sending a declined payment to a second processor in the hope of a different answer. Orchestrators sell it, and it does recover some payments: a generic soft decline through one acquirer can be an approval through another, especially across borders. It's also where routing meets the networks' rules hardest.

- **Every attempt counts against the card, not the route.** Visa's decline categories and per-card reattempt limits, and Mastercard's merchant advice codes and retry thresholds, apply to the card across every processor you send it to ([Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying) has the codes and limits). A cascade through three processors is three attempts, and no single processor sees all of them, so the counter per card lives on your side.
- **Never change the transaction to change the answer.** Visa's rules forbid intentionally manipulating data elements from the original authorization request when reattempting after a decline, and the list names the acquiring identifier, the acquirer and merchant country, and the MCC. Retrying a decline through a different acquirer changes the first of those by definition. My rule: cascade for availability and for the soft declines your acquirers agree are recoverable, write that agreement down, and never cascade a payment into another country or category to get it approved.
- **Honor the advice the decline carries.** A Visa Category 1 decline or a Mastercard "do not try again" ends the payment on every route, and a "retry after" code sets the earliest next attempt everywhere.
- **Authentication may not travel.** A payment authenticated with 3-D Secure through one processor's integration can't always carry that result to another, which is why Primer's fallback refuses processor-run 3-D Secure. Plan the cascade so the authentication result travels with it, or so the second route asks again ([Strong Customer Authentication](/books/payments/strong-customer-authentication#how-3-d-secure-works)).

**Smart retries** are the time-shifted version: retrying a soft decline later, on a schedule the decline code and the card's history suggest. They belong to recurring billing more than to checkout, and [Dunning](/books/payments/stored-credentials#dunning) covers the schedule. What routing adds is that a later retry may take a different route than the first attempt, and both still count.

## Raising the Approval Rate

Routing is one lever on approvals among several, and the others are usually cheaper:

- **Keep the card current.** Expired and reissued cards are the most avoidable declines. Account updater services refresh stored numbers and expiry dates from issuers, and network tokens stay current on their own ([Keeping the Card Alive](/books/payments/stored-credentials#keeping-the-card-alive)). Stripe reports that a network-token payment is significantly likelier to succeed when the card behind it had changed, and lists Mastercard's fee on attempts with outdated credentials among the costs tokens avoid.
- **Send network tokens wherever the route accepts them.** Beyond freshness, some networks price token transactions lower in some markets and merchant categories.
- **Read the advice codes.** A Mastercard advice code saying new account information is available is a prompt to run the updater, not to retry the same card.
- **Authenticate when it helps.** 3-D Secure shifts fraud liability and is required in Europe; a frictionless or data-only exchange shares more data with the issuer without challenging the customer ([Strong Customer Authentication](/books/payments/strong-customer-authentication)).
- **Route by BIN.** Send cards to an acquirer in the issuer's country where you have one, since a local acquirer tends to approve more and cost less than a cross-border one, and send US debit over the network the merchant chooses (above).
- **Send complete, consistent data.** The fields that qualify a transaction for its interchange ([Interchange & Pricing](/books/payments/interchange-and-pricing#downgrades)) also feed the issuer's fraud model: billing address, stored-credential flags, an accurate MCC and descriptor.

Measure each lever by slice (BIN range, issuer country, card type, route) against its own history, as [Operating the Platform](/books/payments/operating-the-platform#watching-approval-rates-and-latency) describes, and count a payment's final outcome as well as each attempt, or every retry looks like a decline.

## One Ledger, Many Settlement Files

Each processor pays out on its own schedule, nets its own fees, and reports in its own settlement and fee files. The routing-specific work is one importer per processor that turns those files into ledger entries attributed to the route each payment took. The matching itself, ledger against processor report against bank deposit every day, is the same discipline as any bank reconciliation ([Bank Reconciliation Is Its Own Discipline](/books/payments/treasury#bank-reconciliation-is-its-own-discipline)). A routing decision that saved a few basis points is worth nothing if nobody can prove where the money went.

## How to Build It

Routing adds a versioned rule set, each stored card's standing on each route, and the attempt history that retry limits are counted from, as deltas on [the core data model](/books/payments/card-payments#the-core-data-model):

```sql
CREATE TABLE routing_rule_sets (
  id           uuid PRIMARY KEY,
  version      int NOT NULL UNIQUE,
  rules        jsonb NOT NULL,          -- ordered rules on BIN data, amount, currency, merchant
  approved_by  text NOT NULL,
  effective_at timestamptz NOT NULL
);

CREATE TABLE payment_method_routes (
  payment_method_id uuid NOT NULL REFERENCES payment_methods (id),
  processor         text NOT NULL,
  processor_token   text,               -- null when the vault forwards the card number
  network_token_ok  boolean NOT NULL,   -- this route accepts our network token
  PRIMARY KEY (payment_method_id, processor)
);

ALTER TABLE payment_attempts
  ADD COLUMN routing_rule_set_id  uuid REFERENCES routing_rule_sets (id),
  ADD COLUMN routing_rule         text,  -- which rule chose this route
  ADD COLUMN attempt_kind         text,  -- first, failover, cascade, retry
  ADD COLUMN previous_attempt_id  uuid REFERENCES payment_attempts (id),
  ADD COLUMN merchant_advice_code text;
```

Count reattempts per card from `payment_attempts` joined through `payment_methods.fingerprint`, across every processor, and check the count before each cascade or retry.

## What This Means for the System You Build

- **Earn the second processor:** own the payment model, the tokens and the ledger first.
- **A deterministic router whose rules are versioned data,** with the rule that chose each route recorded on the payment.
- **Captures, refunds and disputes follow the recorded route.**
- **Fail over only on a known outcome;** resolve timeouts by query or reversal, and never resend a hard decline.
- **Cascade within the networks' retry rules,** counted per card across every route, never changing the data to change the answer.
- **Own the credential layer,** a processor-agnostic vault and network tokens you requested, before a million stored cards decide for you.
- **Pull the cheaper approval levers first:** account updater, network tokens, advice codes, authentication and complete data.
- **Route US debit over unaffiliated networks** where your processor supports them.
- **Normalize responses at the edge, and keep the raw codes.**
- **One importer per processor, reconciled daily into one ledger.**

## References

**Specifications**

- [Federal Reserve: Final rule on debit card routing (October 3, 2022)](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20221003a.htm), at least two unaffiliated networks for card-not-present debit, effective July 1, 2023
- [Federal Reserve: Regulation II FAQs](https://www.federalreserve.gov/paymentsystems/regii-faqs.htm), the network exclusivity prohibition and the merchant's ability to direct routing under 235.7
- [Visa Core Rules and Visa Product and Service Rules (April 2026)](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), no manipulating the acquiring identifier, country, MCC or POS data when reattempting after a decline (1.7.2.1), and decline categories with reattempt limits (Table 7-2)

**Reference**

- [Mastercard Developers: MDES for Merchants](https://developer.mastercard.com/mdes-digital-enablement/documentation/use-cases/mdes-for-merchants-use-cases/), merchants and token requestors provisioning network tokens
- [Primer: Advised actions](https://www.primer.io/docs/concepts/advised-actions), Mastercard merchant advice codes and Visa decline categories mapped to retry decisions

**In practice**

- [Spreedly: Transaction routing](https://developer.spreedly.com/docs/routing-rules-1), static, split and conditional routing, and Recover retrying soft declines and outages on up to two failover gateways
- [Primer: Fallbacks](https://www.primer.io/docs/payment-services/fallbacks), the standardized declines and errors that trigger a fallback processor, and the processor 3-D Secure limitation
- [Gr4vy: Network tokens in vault forwarding](https://docs.gr4vy.com/guides/features/vault-forwarding/network-tokens), provisioning on first use, a new cryptogram per request and falling back to the card number
- [Gr4vy: Payment optimization](https://gr4vy.com/payment-optimization/), rules-based routing with per-processor retry and timeout settings
- [Stripe: Payments optimization](https://docs.stripe.com/payments/analytics/optimization), PINless debit retries, excessive retry prevention, card account updater and network tokens as approval and cost levers
- [Martin Fowler: CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html), the closed, open and half-open states behind health-based failover
