+++
title = "Sales Tax & VAT"
description = "Indirect tax as data: a tax code per item, tax as a quote until the invoice finalizes, engines, exemptions, sourcing, US nexus and VAT on digital sales."
category = "Payments"
order = 808
tags = ["payments", "tax", "vat", "invoicing"]
+++

Sales tax, VAT and GST look like a percentage applied at checkout, and the first version of every system treats them that way: a `tax_rate` column and a multiplication. Then the business sells into a second state or country, or adds a product one state taxes and its neighbor doesn't, and the column turns out to have been answering four questions at once, each with its own data.

This is the engineering of indirect tax, not tax advice: which taxes apply to your products is a question for an adviser, and the answers change. The system's job is to make the answers configurable and the history permanent. Amounts follow [Money & Amounts](/docs/payments/money), and multi-currency invoices follow [Multi-Currency & FX](/docs/payments/multi-currency).

## Four Questions, Four Kinds of Data

| Question | Depends on | Lives in |
| -------- | ---------- | -------- |
| **Must you collect here?** | Where you're registered, your sales into each place | Registrations, with effective dates |
| **Is this item taxable here?** | What the item is, where it's delivered, sometimes who buys it | A tax code on the item, plus the engine's rules |
| **At what rate, for which jurisdictions?** | The sourcing rule, the address, the date | The engine's result |
| **What was charged?** | Everything above, at the moment of finalization | A snapshot on the invoice |

The first three change; the fourth never does. Most tax bugs come from recomputing the fourth from the current state of the first three.

## A Tax Code Per Item

Every sellable item carries a **tax code**, not an `is_taxable` boolean. A boolean asks "taxable or not?" with no location, and the honest answer is always "depends where". A code says what the item *is* (software as a service, a downloadable game, a pair of shoes, a repair service, shipping), and the engine decides what that means in each place. Stripe Tax's model is the clearest reference: its product tax codes "are always the same across different jurisdictions", while the product's treatment differs by location, and a price separately carries a **tax behavior**, exclusive (added on top) or inclusive (already in the price).

- **One code per line, not per order.** An invoice with a taxable item and a non-taxable one is two lines with two codes. Lumping them together can make the whole charge taxable (Texas, below, is a worked example).
- **Codes come from the engine's catalog,** chosen by someone who understands the product, and are never inferred from a product name. A product that fits two codes (SaaS sold to consumers and to businesses) is two products.
- **Tax behavior is a market decision.** Exclusive prices are the US and Canadian convention; with an inclusive price the customer's total stays fixed and your net revenue moves instead. Set it per price before the first sale: Stripe doesn't let you change it once set.
- **Shipping and fees are lines too,** with their own codes, or the engine can't tax them correctly.

## Tax Is a Quote Until the Invoice Finalizes

A tax amount shown on a cart, an estimate or a draft invoice is a **quote**. It can change before the sale completes, because the rate, the address or the item mix can. Avalara's developer guide makes the distinction part of the API: a `SalesOrder` transaction gives an estimate and records nothing, and when the customer completes the purchase you call again as a `SalesInvoice` with `commit` set, which records it for filing. The second call exists because "the customer may have waited long enough that the tax rates might have changed, or their address may have changed" ([Avalara: Should I Commit?](https://developer.avalara.com/avatax/dev-guide/transactions/should-i-commit/)). Stripe applies the same principle on invoices: it calculates tax "at the published rate at the time of invoice finalization", so a draft created on December 20 and finalized on January 15 uses a rate that took effect on January 1.

At finalization, tax becomes a **fact**, and the invoice keeps the engine's whole answer, not just a total:

```sql
CREATE TABLE invoice_line_taxes (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_line_id        UUID NOT NULL REFERENCES invoice_lines (id),
  jurisdiction           TEXT NOT NULL,       -- 'US-TX', 'US-TX-AUSTIN', 'DE'
  tax_type               TEXT NOT NULL CHECK (tax_type IN ('sales', 'use', 'vat', 'gst')),
  rate                   NUMERIC(9,6) NOT NULL,
  taxable_amount         BIGINT NOT NULL,     -- minor units
  tax_amount             BIGINT NOT NULL,
  currency               TEXT NOT NULL,       -- ISO 4217
  taxability_reason      TEXT NOT NULL CHECK (taxability_reason IN
                           ('taxable', 'customer_exempt', 'product_exempt', 'zero_rated',
                            'reverse_charge', 'not_registered')),
  engine                 TEXT NOT NULL CHECK (engine IN ('avalara', 'stripe_tax', 'manual')),
  engine_transaction_xid TEXT,                -- the engine's own ID for the committed transaction
  calculated_at          TIMESTAMPTZ NOT NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX invoice_line_taxes_invoice_line_id_idx ON invoice_line_taxes (invoice_line_id);
```

- **Snapshot, never recompute.** The invoice shows what was charged, and a report six months later reads these rows. Recomputing from today's rates produces a different number, which is the one thing a tax record can't do. It's the [append-only rule](/docs/payments/payment-states#append-only-records) applied to tax.
- **Corrections are new documents.** A finalized invoice isn't edited; a credit note reduces it, or it's voided and reissued, as in Stripe's invoicing model. Each credit note carries its own tax lines, reversing tax with the same jurisdictions and rates as the original, not today's.
- **Offline quotes are labeled.** A device offline (a point-of-sale terminal, a field app, a game client) can show an estimate from cached rates, marked as an estimate; the number the customer is charged comes from the server at finalization.
- **Decide when to call.** Calling on every draft edit is accurate and costly; checkout plus finalization is usually enough. The finalization call is mandatory.

## Tax Engines

Rates, boundaries, taxability rules and filing calendars across thousands of jurisdictions are a product, and almost nobody should build it. **Buy the engine; own the data model around it.** Avalara AvaTax and Stripe Tax are common choices, Vertex is another, and there are more; pick by where you sell, what you sell, and whether the engine also files returns.

What stays yours, whichever you choose:

- **Registrations.** An engine calculates where you've told it you're registered and returns zero tax elsewhere. Stripe says so plainly: without a registration in the customer's location, the calculation returns zero tax, and its `not_collecting` reason can mean either "not registered" or "the item's code is non-taxable". A zero you didn't expect is a configuration bug until proven otherwise; alert on it.
- **The reason, not just the amount.** Store the engine's taxability reason with every line (`customer_exempt`, `reverse_charge`, `zero_rated`). A zero tax line that says why is auditable; a bare zero is a question.
- **An adapter.** Call the engine through one interface of your own, so the engine can change (or a second one can cover a country the first doesn't) without touching invoicing.
- **A fallback.** Engines go down. Decide in advance whether checkout waits, uses a cached estimate and reconciles later, or refuses, and make that a policy you chose rather than whatever the timeout does ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)).

The alternative to an engine is a **merchant of record**: a reseller that sells to your customer in its own name and takes on tax calculation, collection and remittance, such as Paddle. If you sell through an app store or another marketplace, check what its terms already make it responsible for before building your own. A merchant of record trades margin and control of the customer relationship for not having a tax function, which for a small SaaS or game studio selling worldwide is often the right trade.

## Sourcing Is Data

Even when an item is taxable, the question of *which* jurisdiction's tax applies has its own rule, the **sourcing** rule. Broadly, destination sourcing taxes at the customer's location and origin sourcing at the seller's, and the rule differs by place and by what's sold. The system can't assume either.

Texas pest control is a worked example of a rule that isn't destination-based: the Comptroller's publication says "Local taxes are based on your place of business in Texas", while separately applying local use tax in some cases when the service is performed in other local jurisdictions. Taxing every Texas job at the customer's local rate would be wrong for that business.

- **Send both addresses.** Every engine call carries ship-from (the warehouse, store or branch the sale or service came from) and ship-to (the delivery address, the service location, or the customer's country for a digital sale). The engine applies the sourcing rule; you supply the facts.
- **The sourcing rule is configuration, not code.** Where you handle it yourself (a manual fallback, a country the engine doesn't cover), store it per jurisdiction and item type with effective dates, the way [Rules as Data](/docs/architecture/rules-as-data) stores any policy that varies by place and date.
- **The location you used is evidence.** For digital sales, the customer's location is a determination, not a field the customer typed. The UK requires sellers of digital services to "get and keep 2 pieces of information as evidence of where a consumer normally lives", such as, for a small business using a payment provider, the billing address and the provider's country code, and to resolve them when they conflict. Store the evidence with the snapshot.

## US Economic Nexus

Until 2018, a US state could require a seller to collect sales tax only if the seller had a physical presence there. In *South Dakota v. Wayfair* the Supreme Court held that rule "unsound and incorrect" and overruled it, upholding a South Dakota law that applied to sellers delivering more than $100,000 of goods or services into the state, or 200 or more separate transactions, a year ([Cornell LII: South Dakota v. Wayfair](https://www.law.cornell.edu/supremecourt/text/17-494)). States now set their own economic thresholds, so an obligation can arise "from a physical presence in the jurisdiction or from reaching a threshold of sales into the jurisdiction", in Stripe's words.

For the system, that means:

- **Measure sales by destination state,** continuously. Engines offer threshold monitoring; whatever does it, someone is told before a threshold is crossed, not after a year of uncollected tax.
- **Registrations are records with dates.** A registration has a jurisdiction, an ID, an effective date and a filing frequency, and the engine's configuration follows from those rows. Tax collected depends on whether you were registered *on the invoice date*.
- **Don't hard-code thresholds.** Each state's numbers, and what counts toward them, are its own and change.

## Taxability Varies by Place

States differ on what is taxable at all, and the differences reach every kind of business:

- **A service.** Texas requires tax on structural pest control "even when pests are not found". If taxable and nontaxable services are billed together without being stated separately, and the taxable part is more than 5 percent of the total, tax applies to the entire charge. The rate is 6.25 percent state tax and up to 2 percent local ([Texas Comptroller, Publication 94-114](https://comptroller.texas.gov/taxes/publications/94-114.php)).
- **Software as a service.** Washington's Department of Revenue classifies remote access software, prewritten software the buyer uses on the seller's or a third party's servers, as a retail sale "subject to sales or use tax". States don't agree on this, so the same subscription can be taxable for one customer and not the next.
- **Retail goods.** New York exempts clothing and footwear sold for less than $110 per item or pair from state sales tax, but not from local sales tax unless the county or city imposing it elects to provide the exemption. The same pair of shoes is taxed differently in neighboring counties, and a pair at $110 is taxable everywhere.

Two lessons generalize. Taxability depends on the item *and* the place, and sometimes on the price, so never ship a hard-coded taxability table. And how you *bill* can change the tax: the Texas rule rewards separately stated lines, so invoice structure is a tax decision. [Billing Recurring Service](/books/field-operations/billing-recurring-service) covers how this plays out in one industry.

## Exemptions Are Documents

Some customers can buy without tax; Stripe's common examples are non-profit organizations and government entities, and a business buying goods to resell is another. The exemption isn't a checkbox on the customer; it's a **certificate**, issued under a specific jurisdiction's rules, for a reason, and often with an expiry, and it's the seller's evidence if an auditor asks why tax wasn't collected. Engines don't carry that burden for you: Stripe Tax "doesn't validate required documentation for supporting an exemption, such as customer exemption certificates".

- **Store the certificate as a document,** with the jurisdictions it covers, the exemption reason, its number, `issued_on` and `expires_on`, and who accepted it and when.
- **Exempt status is derived from valid certificates,** per jurisdiction and date, not set by hand. An expired certificate means tax is collected from that day, with an alert to renew beforehand.
- **Every exempt line points to the certificate** that justified it, so the audit question "why no tax on this invoice?" is a join.
- **Reverse charge is different.** In cross-border B2B sales, the customer often accounts for the VAT instead of the seller, triggered by the customer's tax ID. Store and validate the tax ID, and record `reverse_charge` as the reason; the invoice says so.

## VAT and GST on Digital Goods

Games, SaaS and apps meet VAT first, because digital sales cross borders on day one. In the EU and UK, consumer sales of digital services are taxed where the customer is.

- **EU.** The place of supply for business-to-consumer telecommunications, broadcasting and electronic services is the member state where the customer is established or usually resides. The **One Stop Shop** (OSS), in place since 1 July 2021, lets a seller declare and pay the VAT due across member states through one return in a single member state, with a Union scheme for EU-established sellers and a non-Union scheme for those outside the EU. An EU-established seller under an annual €10,000 of such cross-border sales can apply its home rules instead.
- **UK.** HMRC lists games (including games of chance), software and software updates among digital services, places the supply where the consumer is, and requires sellers based outside the UK to register when their supplies are liable to UK VAT, without describing a threshold for them ([HMRC: VAT rules for digital services](https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers)).

What that means for a game or SaaS system:

- **Location evidence on every sale,** as above: billing country, payment card country, IP country, stored with the tax snapshot.
- **Inclusive prices are a product decision.** A €9.99 battle pass that stays €9.99 across countries means the net revenue differs by each country's VAT rate. Regional pricing ([Rules as Data](/docs/architecture/rules-as-data) covers storing it) and tax behavior are decided together.
- **Business customers are a separate path.** A tax ID changes the treatment (often to reverse charge); collect it at checkout, validate it, and record it with the invoice.
- **Consider a merchant of record** for consumer digital sales worldwide, before building VAT registrations in dozens of countries.

## Checklist

- **A tax code on every item and fee,** from the engine's catalog, and a deliberate tax behavior on every price.
- **Lines split by tax code,** so mixed invoices don't make everything taxable.
- **Tax as a quote on carts, estimates and drafts;** a committed engine call at finalization.
- **A snapshot per line** with jurisdictions, rates, taxable and tax amounts, the reason, the engine and its transaction ID, never recomputed.
- **Credit notes with their own tax lines** for corrections, mirroring the original.
- **Ship-from and ship-to on every call,** and sourcing rules as configuration where you handle them yourself.
- **Registrations as dated records,** sales tracked by destination against thresholds, and alerts on unexpected zero tax.
- **Exemption certificates as documents** with jurisdictions and expiry, linked from every exempt line.
- **Customer location evidence** for digital sales, and validated tax IDs for business customers.
- **An adapter around the engine,** a decided fallback when it's down, and a look at a merchant of record before building global VAT yourself.

## References

**Specifications**

- [Cornell LII: South Dakota v. Wayfair (2018)](https://www.law.cornell.edu/supremecourt/text/17-494), the end of the physical-presence rule and South Dakota's $100,000 and 200-transaction thresholds
- [Texas Comptroller: Pest Control Services (Publication 94-114)](https://comptroller.texas.gov/taxes/publications/94-114.php), pest control taxable even when no pests are found, separately stated charges, rates, and local tax by place of business
- [Washington DOR: Digital products including digital goods](https://dor.wa.gov/forms-publications/publications-subject/tax-topics/digital-products-including-digital-goods), remote access software as a retail sale subject to sales or use tax
- [New York: Clothing and footwear exemption](https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/clothing_and_footwear.htm), the under-$110 exemption from state tax and the local election
- [European Commission: One Stop Shop](https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en), the OSS schemes since 1 July 2021, customer-location place of supply and the €10,000 threshold
- [HMRC: VAT rules if you supply digital services to private consumers](https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers), games and software as digital services, consumer location and the two pieces of evidence

**Reference**

- [Avalara: Should I Commit?](https://developer.avalara.com/avatax/dev-guide/transactions/should-i-commit/), estimates as `SalesOrder`, recorded sales as committed `SalesInvoice`, and why tax is recalculated at purchase
- [Stripe: Product tax codes and tax behavior](https://docs.stripe.com/tax/products-prices-tax-codes-tax-behavior), codes constant across jurisdictions, exclusive and inclusive prices
- [Stripe: Automatically collect tax on invoices](https://docs.stripe.com/tax/invoicing), tax calculated at the rate published at finalization
- [Stripe: Zero tax amounts and reverse charges](https://docs.stripe.com/tax/zero-tax), taxability reasons, registrations and thresholds, reverse charge, and exemption certificates left to the seller
- [Stripe: How invoicing works](https://docs.stripe.com/invoicing/overview), finalized invoices, voiding and credit notes
- [Vertex](https://www.vertexinc.com/), an indirect tax and compliance provider
- [Paddle: What is a merchant of record?](https://www.paddle.com/blog/what-is-merchant-of-record), a reseller that calculates, collects and remits sales tax and VAT
