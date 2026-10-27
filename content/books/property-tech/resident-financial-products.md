+++
title = "Resident Financial Products & Ancillary Revenue"
nav_title = "Resident Financial Products"
description = "Rent reporting and credit repair law, rewards, resident marketplaces, bulk internet deals, and disclosing who earns what when residents buy in the portal."
category = "Property Tech Industry"
order = 1716
part = "Rent and Resident Money"
tags = ["property-tech", "rent-reporting", "fcra", "ancillary-revenue", "bulk-internet", "rewards"]
+++

A resident portal is a storefront with a captive audience. Every household logs in monthly to pay rent, and the platform, the operator and their partners have learned to sell into that moment: credit building from rent payments, points for paying on time, internet and energy plans at move-in, home services, identity theft protection, and the building's own managed Wi-Fi. Some of it is genuinely useful; all of it is money, and much of it is regulated as something other than housing. Rent reporting can make a vendor a credit repair organization and a furnisher under the Fair Credit Reporting Act; enrollment by default has drawn a nationwide class action; bulk internet contracts are governed by FCC rules on exclusivity and revenue sharing; and every mandatory add-on is a fee transparency question after the FTC's 2025 action against Greystar. This chapter covers resident financial products and ancillary revenue as the platform has to model them: who sells what, who pays, who consented and how, and who earns what. Insurance and deposit alternatives, the largest of these products, have their own chapter, [Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees); flexible rent is in [Collecting Rent](/books/property-tech/collecting-rent#split-and-flexible-rent).

## How the Platforms Do It

The large suites all run resident commerce, under their own brands, with partners behind them:

- **Entrata** sells rent reporting (from its 2023 acquisition of Rent Dynamics) and participates in Freddie Mac's rent reporting initiative, which since August 2024 gives residents of eligible Freddie Mac-financed properties 24 months of credit-building services reporting on-time payments to the three bureaus. Its rewards program lets properties choose which actions earn points (signing, renewing early, paying on time, autopay), with redemption for rent, travel, gift cards or prepaid debit cards, and Entrata paying for redemptions with no monthly fee. Its marketplace, launched with Red Ventures (Bankrate, MyMove, Allconnect) in May 2024, offers internet, energy and utilities, financial services and moving support.
- **RealPage** sells rent reporting as an optional $4.99-a-month subscription per leaseholder, billed in advance, reporting to Equifax, Experian and TransUnion, cancelled automatically if the property moves off its property management system. Its loyalty program funds points for online rent payments itself; a paid tier lets clients buy points for referrals, renewals and reviews, and adds client-funded "digital concessions". It sells managed Wi-Fi, describing it as recurring revenue of "$50–70 per unit per month" in one place and "$50 to $79" in another.
- **Third-party products sit inside the portals too:** flexible rent lenders, credit builders, home services, moving and utility connection services, identity protection. Their contracts with the platform or the operator decide who is the seller.

Entrata's S-1 shows the legal exposure that comes with this line of business: it describes rent credit reporting as subject to the federal Credit Repair Organizations Act, and a putative class action in Colorado federal court alleging it isn't properly registered under Colorado's credit services law. A separate nationwide class action, filed May 31, 2026 by Towards Justice and Kelly Guzzo PLC, alleges that residents were enrolled in a paid rent reporting product as part of signing their leases, had to opt out to avoid being charged, and that landlords were paid for enrolling residents; those are allegations, not findings, as of October 2026. The rest of the chapter is how to build these products so that the same questions have good answers.

## Rent Reporting

Rent reporting sends a resident's rent payment history to one or more consumer reporting agencies, so it can count in credit scores that use it. Design decisions come in four pairs.

**Positive-only or full-file.** Positive-only reporting sends on-time payments and nothing else; full-file reporting sends late and missed payments too. California's rent reporting statute (Civil Code 1954.07) defines "positive rental payment information" as complete, timely payments only. Full-file reporting helps lenders and can hurt residents, and it raises the stakes of every ledger error, because a disputed late fee becomes a disputed tradeline.

**Opt-in or opt-out.** Opt-in waits for the resident to choose; opt-out enrolls them and charges until they stop it. California requires an offer with a written election form saying reporting is optional, naming the agencies and the fee, made at lease signing for leases from April 1, 2025 and at least once a year after, and lets the tenant stop by written request. RealPage's subscription is per leaseholder and opt-in. The pending Towards Justice complaint targets an opt-out design. My rule: opt-in, per person, with the price shown before consent, and a recorded consent the resident can see and revoke from the portal.

**Who pays.** The resident, the operator, a lender program (Freddie Mac's covers eligible residents of properties it finances), or nobody. California caps the landlord's fee at the lesser of actual cost or $10 a month (nothing if there's no cost), forbids applying rent payments to the fee, and forbids treating an unpaid fee as grounds for termination or a deposit deduction; after 30 days unpaid, reporting may stop, and re-enrollment waits six months. The fee never touches rent, which means the ledger keeps the reporting charge on its own code with `counts_as_rent` false, and the [application rule](/books/property-tech/charges-and-resident-ledgers#payment-application-order) never routes a rent payment to it.

**Who furnishes.** Someone sends the data to the bureaus, and that someone is a furnisher under the FCRA: they may not report information they know or have reasonable cause to believe is inaccurate; must correct and update what they've sent; must note a dispute when reporting disputed information; must investigate disputes made directly or through a bureau and report the results by the bureau's deadline; and, for accounts in collection or charged off, must report the date of first delinquency within 90 days (15 U.S.C. 1681s-2). The platform's rent ledger is therefore the source for a regulated data feed. The furnisher is usually the reporting vendor, but the data is the operator's, so the agreement between them says who investigates, and the platform has to answer a dispute with the ledger lines behind each month reported.

**Credit repair law.** The Credit Repair Organizations Act defines a credit repair organization as anyone who sells, for money, a service for "improving any consumer's credit record, credit history, or credit rating", excluding nonprofits, depository institutions and creditors restructuring their own debts, and forbids charging "any money" for such a service before it is fully performed (15 U.S.C. 1679a, 1679b). A monthly fee for "building credit" billed in advance sits uncomfortably close to that text, which is why CROA appears in Entrata's S-1 and in the Towards Justice complaint, and why states' own credit services organization acts (Colorado's among them) are part of the same analysis. That's a question for counsel; the platform's part is to make billing timing, the service description and the enrollment flow configurable per product and jurisdiction, not fixed.

The data model follows: a product enrollment per person with its consent evidence, and a monthly furnishing record per person per bureau, with what was sent, what the ledger said, and any dispute.

## Rewards and Loyalty

Rewards give residents points for actions the operator values: on-time payment, autopay, an early renewal, a review, a referral. Two funding models exist side by side. **Vendor-funded** points (Entrata's program, RealPage's free tier for online rent payments) cost the operator nothing; the vendor pays for redemptions, which it recovers from payments revenue or partners. **Client-funded** points (RealPage's paid tier, and its digital concessions) are the operator's marketing spend.

What the platform has to get right:

- **Points are a ledger,** append-only, per person: earned, redeemed, expired, reversed, each with the event that caused it and who funded it. Never a balance column ([Append-Only Records](/docs/payments/payment-states#append-only-records)).
- **Redemption against rent is a payment,** not a concession: when points pay rent, the funder pays the property, and the resident ledger shows a payment from a third party. A digital concession redeemed at a retailer never touches the resident ledger at all ([Concessions](/books/property-tech/charges-and-resident-ledgers#concessions)).
- **Unredeemed value is money somebody owes.** Points and gift-card-like concessions create liabilities until used or expired, with accounting policy for breakage set by finance ([Breakage](/docs/payments/accounting#breakage)), and expiry and unclaimed-property rules that vary by state.
- **Rewards that depend on behavior aren't neutral.** Rewarding reviews runs into the FTC's rules on incentivized reviews (Leads, CRM, Tours & the Leasing Center covers them); rewarding autopay excludes residents who pay by the methods the law protects; and points that depend on screening or income would be a fair housing problem.

## Resident Marketplaces and Referral Revenue

Move-in is when a household chooses internet, energy (in deregulated markets), movers, insurance and a dozen services, and portals now sell all of them. Entrata's marketplace launch named internet, energy and utilities, financial tools and moving support; portals add home services (cleaning, handyman, pet care), identity theft protection and storage.

The model is referral commerce. The partner sells to the resident; the platform (and sometimes the operator) earns a referral or affiliate fee. Three design points follow:

- **The resident's relationship is with the partner.** Their contract, their bill and their support; the platform passes a lead or an enrollment, with consent to share the data it sends ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)). A move-in checklist that pre-fills a partner's form with the lease's data is sharing personal information with a third party, which state privacy laws and Records, Privacy & Audits govern.
- **Recommendations are advertising.** A "recommended" provider that pays the platform is a paid placement, and saying so plainly is the low-cost answer to every unfair-practices theory.
- **Some services become lease charges.** When the operator buys a service in bulk (valet trash, pest control, a package locker program, a "resident benefit package") and charges every household, it's no longer a marketplace product: it's a mandatory fee in the [charge catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog), with all-in pricing consequences.

## Bulk Internet and Managed Wi-Fi

Internet is the largest ancillary line. The structures:

- **Bulk agreements.** The owner contracts with a provider to serve every unit, pays a discounted bulk rate, and charges residents a monthly technology fee, often below retail. The margin is ancillary income.
- **Managed Wi-Fi.** The property owns or leases building-wide network gear and a managed provider runs it, so residents are online on move-in day and devices like smart locks share the network (Access, Smart Buildings & Parking covers the devices). RealPage markets this as $50 to $70 or $79 per unit per month of recurring revenue.
- **Marketing and access agreements.** A provider gets the right to market in the building, or access to wiring, and pays the owner a door fee or a revenue share on subscriptions.

The FCC regulates the provider side of these deals, and its rules shape what the owner can sign. Since 2008 cable operators may not enforce or enter exclusive access clauses for multiple dwelling units. In 2010 the FCC decided that bulk billing and marketing exclusivity, on balance, benefit residents, and allowed both to continue. In 2022 it barred telecommunications carriers and covered video providers from certain revenue-sharing agreements with building owners that keep competing providers out, required providers to disclose exclusive marketing arrangements to tenants in plain language, and declared that sale-and-leaseback arrangements of inside wiring that block competitors violate its existing rules (effective April 27, 2022). As of October 2026, those are the latest final FCC rules in the Federal Register on these arrangements; check the current docket before signing a long agreement, because the FCC has reconsidered bulk billing before.

For the platform, a bulk agreement is three records: the **agreement** with the provider (term, exclusivity, per-unit cost, revenue share, the FCC disclosure the provider gives), the **charge** to residents (a mandatory recurring fee, in the advertised price, with an opt-out only if the agreement allows one), and the **revenue** owed back (door fees, shares, credits). The charge reaches the resident's ledger; the agreement and the revenue reach the owner's statements, and the management agreement decides whether the manager earns a fee on them (the Bell Partners agreement in [The Property Business](/books/property-tech/property-business#the-manager-s-money) pays the manager 10% of upfront payments it negotiates for cable, internet and laundry).

## Disclosure and Revenue Share

Every product in this chapter answers four questions, and the platform should be able to show them to a resident, an owner or a regulator from data:

1. **Who sells it?** The platform, the operator, or a third party.
2. **Who pays, and is it optional?** The resident by choice, the resident as a mandatory fee, the operator, or a vendor.
3. **Who earns from it?** Revenue shares, referral fees, door fees, commissions, contingent commissions, and to whom.
4. **What did the resident agree to?** The offer shown, the price, the consent method, the date, and how to stop.

The law presses on each. Mandatory charges belong in the advertised total under the FTC's December 2025 order against Greystar and state laws like Colorado's HB25-1090 ([The Charge Catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog)). Payments to landlords for enrolling residents are at the center of the pending rent reporting litigation. Revenue shares to a manager on an owner's property are a management agreement term, disclosed to the owner. Undisclosed compensation can turn an ordinary recommendation into a deceptive one.

My rule: model every flow as an **ancillary agreement** (who the counterparty is, what's sold, who pays, the revenue terms, exclusivity, the disclosure text), every resident's participation as an **enrollment** with consent evidence, and every dollar earned as a **revenue share entry** tied to the agreement and the property, so the owner's statement and the resident's disclosure come from the same rows. A product whose economics can't be written down that way shouldn't be in the portal.

## How to Build It

The core model's `charge_codes` and `charges` carry any amount a resident is billed through the lease ([Charges & Resident Ledgers](/books/property-tech/charges-and-resident-ledgers#how-to-build-it)); this chapter adds the agreements, enrollments, furnishing and points:

```sql
CREATE TABLE ancillary_agreements (      -- every product line's contract and economics
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  counterparty       TEXT NOT NULL,       -- the provider, lender, agency or vendor
  vendor_id          UUID REFERENCES vendors (id),
  product_line       TEXT NOT NULL CHECK (product_line IN ('rent_reporting', 'rewards',
                       'bulk_internet', 'managed_wifi', 'marketplace_referral', 'insurance',
                       'deposit_alternative', 'flexible_rent', 'resident_services', 'other')),
  scope              TEXT NOT NULL CHECK (scope IN ('tenant', 'portfolio', 'property')),
  property_id        UUID REFERENCES properties (id),
  seller_of_record   TEXT NOT NULL CHECK (seller_of_record IN ('platform', 'operator', 'counterparty')),
  is_exclusive       BOOLEAN NOT NULL DEFAULT FALSE,
  revenue_terms      JSONB NOT NULL,      -- {"type": "per_unit", "amount": 500} or a percent of sales
  revenue_recipient  TEXT NOT NULL CHECK (revenue_recipient IN ('owner', 'manager', 'platform', 'none')),
  resident_disclosure TEXT,               -- the text residents are shown
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE resident_product_enrollments (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  agreement_id     UUID NOT NULL REFERENCES ancillary_agreements (id),
  lease_id         UUID REFERENCES leases (id),
  person_id        UUID NOT NULL REFERENCES people (id),
  consent_method   TEXT NOT NULL CHECK (consent_method IN ('opt_in', 'opt_out', 'mandatory')),
  consent_evidence JSONB NOT NULL,        -- offer version, price shown, channel, signature or click
  price            BIGINT,               -- minor units per period; null if free to the resident
  payer            TEXT NOT NULL CHECK (payer IN ('resident', 'operator', 'counterparty', 'program')),
  charge_code_id   UUID REFERENCES charge_codes (id),  -- if billed through the lease
  valid_during     DATERANGE NOT NULL,
  ended_reason     TEXT                  -- 'resident_request', 'move_out', 'nonpayment', 'pms_change'
);

CREATE TABLE rent_reporting_furnishings ( -- one month, one person, one bureau
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  enrollment_id      UUID NOT NULL REFERENCES resident_product_enrollments (id),
  bureau             TEXT NOT NULL,
  period             DATERANGE NOT NULL,
  reported_status    TEXT NOT NULL CHECK (reported_status IN ('paid_on_time', 'paid_late',
                       'unpaid', 'not_reported')),
  amount_due         BIGINT NOT NULL,
  ledger_snapshot    JSONB NOT NULL,      -- the charges and applications the status came from
  dispute_status     TEXT CHECK (dispute_status IN ('open', 'verified', 'corrected', 'deleted')),
  first_delinquency_on DATE,
  furnished_at       TIMESTAMPTZ NOT NULL,
  UNIQUE (enrollment_id, bureau, period)
);

CREATE TABLE reward_point_entries (       -- append-only points ledger
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  person_id    UUID NOT NULL REFERENCES people (id),
  agreement_id UUID NOT NULL REFERENCES ancillary_agreements (id),
  kind         TEXT NOT NULL CHECK (kind IN ('earned', 'redeemed', 'expired', 'reversed')),
  points       BIGINT NOT NULL,           -- negative for redemptions, expiries and reversals
  funded_by    TEXT NOT NULL CHECK (funded_by IN ('platform', 'operator', 'partner')),
  source_event TEXT NOT NULL,             -- 'payment.applied:...', 'lease.renewed:...'
  payment_id   UUID REFERENCES payments (id),  -- when points paid rent
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE revenue_share_entries (      -- what each agreement earned, for whom, when
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  agreement_id  UUID NOT NULL REFERENCES ancillary_agreements (id),
  property_id   UUID REFERENCES properties (id),
  recipient     TEXT NOT NULL CHECK (recipient IN ('owner', 'manager', 'platform')),
  period        DATERANGE NOT NULL,
  amount        BIGINT NOT NULL,
  currency      CHAR(3) NOT NULL,
  basis         JSONB NOT NULL,           -- units, enrollments or sales it was computed from
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Decisions behind it:

- **One agreement table for every product line,** including insurance agency and deposit alternative contracts, so "who earns from this property" is one query across products.
- **Consent is evidence, not a flag.** The enrollment stores the offer version and price shown, the channel and the act of consent; a mandatory enrollment says so, and has a matching mandatory charge code.
- **Furnishing records the ledger it came from,** so a dispute is answered from the month's charges and applications, and a corrected ledger produces a correction to the bureau.
- **Points never become rent until redeemed,** and a redemption against rent is a payment with a funder.
- **Revenue is computed from its basis** (units, enrollments, sales) and recorded per property and period, so owner statements, management fee runs and disclosures agree.

## Auditing

- **Every enrollment's consent,** with the exact offer and price shown, and every cancellation with its date and reason; for opt-out designs, the notice and the opportunity to opt out.
- **Every bureau submission** and every dispute's investigation and outcome, retained for the period the FCRA and the furnishing agreement require.
- **Every revenue dollar** tied to an agreement, a property and a recipient, reconcilable to the counterparty's statements.
- **Every disclosure version** residents were shown, so the platform can prove what a resident saw on the day they enrolled ([Audit Trails](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).

## What This Means for the System You Build

- **Default to opt-in** for anything a resident pays for, with the price shown before consent and a one-click stop in the portal.
- **Treat rent reporting as a regulated data feed:** furnisher duties, dispute handling from the ledger, positive-only where the law or the product says so, and fees that never touch rent.
- **Keep rewards in an append-only points ledger** with the funder of every point, and book redemptions against rent as third-party payments.
- **Model every ancillary product as an agreement, an enrollment and revenue entries,** so who sells, who pays and who earns can be shown to owners and residents.
- **Treat bulk services as mandatory charges** in the advertised price, and keep the provider agreement's FCC-relevant terms (exclusivity, revenue share, disclosure) on record.
- **Label paid recommendations as paid** and share resident data with partners only on recorded consent.

## References

**Statutes and rules**

- [15 U.S.C. 1679a](https://www.law.cornell.edu/uscode/text/15/1679a), the Credit Repair Organizations Act's definition and exclusions
- [15 U.S.C. 1679b](https://www.law.cornell.edu/uscode/text/15/1679b), no payment before a credit repair service is fully performed
- [15 U.S.C. 1681s-2](https://www.law.cornell.edu/uscode/text/15/1681s-2), furnisher duties: accuracy, corrections, disputes, date of first delinquency
- [California Civil Code 1954.07](https://california.public.law/codes/ca_civ_code_section_1954.07), landlords' duty to offer positive rent reporting, the election form, the fee cap, exemptions
- [FCC: Exclusive Service Contracts in Multiple Dwelling Units (2008)](https://www.federalregister.gov/documents/2008/01/07/E7-25349/exclusive-service-contracts-for-provision-of-video-services-in-multiple-dwelling-units-and-other), the ban on enforcing or entering exclusive access clauses
- [FCC: Second Report and Order on bulk billing and marketing exclusivity (2010)](https://www.federalregister.gov/documents/2010/03/16/2010-5718/exclusive-service-contracts-for-provision-of-video-services-in-multiple-dwelling-units-and-other), both practices allowed to continue
- [FCC: Improving Competitive Broadband Access to Multiple Tenant Environments (2022)](https://www.federalregister.gov/documents/2022/03/28/2022-05862/improving-competitive-broadband-access-to-multiple-tenant-environments), revenue-sharing limits, exclusive marketing disclosure, sale-and-leaseback ruling, effective April 27, 2022

**Filings and litigation**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), rent credit reporting subject to CROA, the Colorado credit services class action
- [Towards Justice: Class action over RentPlus](https://towardsjustice.org/2026/06/01/rentplus/), allegations of enrollment at lease signing, opt-out charging and payments to landlords (filed May 31, 2026)

**In practice**

- [RealPage: Rent reporting](https://www.realpage.com/apartment-marketing/rent-reporting/), opt-in, $4.99 a month per leaseholder, three bureaus, cancellation on a system change
- [RealPage: LOFT Loyalty](https://www.realpage.com/resident-portal/loyalty-rewards/), vendor-funded points for rent payments, client-funded points and digital concessions
- [RealPage: Smart Building](https://www.realpage.com/smart-building/), managed Wi-Fi described as $50 to $70, or $50 to $79, per unit per month
- [Entrata and Freddie Mac collaboration](https://www.entrata.com/press/entrata-and-freddie-mac-announce-collaboration-to-increase-residents-financial-stability), 24 months of credit building for residents of eligible Freddie Mac-financed properties (August 2024)
- [Entrata: Homebody Rewards](https://www.entrata.com/products/homebody-rewards), property-chosen earning actions, redemption options, vendor-funded redemptions
- [Entrata: Homebody Marketplace launch with Red Ventures](https://www.entrata.com/press/entrata-partners-with-red-ventures-to-launch-homebody-marketplace), internet, energy, financial services and moving categories (May 2024)
