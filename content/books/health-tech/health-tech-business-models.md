+++
title = "Business Models for Health Software"
nav_title = "Business Models"
description = "How health software charges: per location and provider, payments, per transaction, percentage of collections, API fees, pharma-funded and consumer models."
category = "Health Tech Industry"
order = 1904
part = "The Business"
tags = ["health-tech", "business-models", "saas", "pricing", "revenue-cycle"]
+++

Health software is paid for by whoever benefits, and in health care that is often not the user. A dental office pays a monthly fee per location for reminders and texting, and the vendor earns again on every card payment the office takes through it; a clearinghouse charges per claim, or charges the practice nothing and the payer something; a revenue cycle company takes a percentage of what it collects; an intake vendor is paid partly by drug manufacturers for messages shown to patients in the waiting room; an employer pays a telehealth company per member per month whether anyone calls; a consumer pays a subscription for medication delivered to the door. The model decides what the vendor must measure, what it must prove to the customer, and which laws it touches: a fee tied to referrals or to a drug manufacturer's sales sits close to the federal Anti-Kickback Statute, which [Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation#anti-kickback-and-stark-for-software) covers.

This chapter compares the models with public companies' own descriptions as examples, none of them the template. [The Health Tech Landscape](/books/health-tech/health-tech-landscape) sizes the segments.

## How the Platforms Do It

The models in public filings and price pages, as of October 2026:

| Model | Who pays | Public examples | What's metered |
| --- | --- | --- | --- |
| **Subscription per location or provider** | The practice | Weave (per location), Waystar (monthly provider count), Office Ally's EHR ($44.95 per provider per month) | Locations, providers, users |
| **Payments** | The practice, as a share of card volume | Weave Payments, Phreesia payment solutions | Payment volume and transactions |
| **Per transaction** | The practice or its billing company | Stedi ($0.30 to $0.10 per claim), Claim.MD (flat monthly tiers), Waystar's volume component | Claims, eligibility checks, remittances |
| **Percentage of collections** | The practice or hospital | athenahealth historically, R1 RCM's operating and incentive fees | Dollars collected |
| **Platform and API access** | App vendors | EHR app programs; Epic publishes over 750 no-cost APIs and interfaces | Connections, calls, listings |
| **Pharma- and PBM-funded** | Manufacturers, PBMs | Phreesia network solutions, OptimizeRx, GoodRx | Messages delivered, prescriptions filled |
| **Enterprise per member** | Employers and health plans | Teladoc access fees | Members per month |
| **Consumer subscription** | Patients | Hims & Hers | Subscribers |

Most vendors combine several. The combination matters more than any one: a vendor with subscription and payments revenue grows with its customers' patient volume, one with only subscriptions grows only with seats.

## Subscriptions Per Location and Provider

The practice software default is a monthly subscription per location, sometimes per provider. Weave counts a customer location only "if they have entered into subscription agreements for each location", and its "subscription and phone hardware fees are prepaid and customers may elect to be billed monthly or annually"; "the majority of these subscription arrangements have contractual month-to-month terms," with about 27% of locations prepaying annually in 2025 (34% in 2024). It also collects installation fees for onboarding and leases phones, which it reports as embedded lease revenue: $3.5 million of onboarding and $6.8 million of phone hardware revenue in 2025, against $228.8 million of subscription and payment processing. Recurring revenue was 91% of the total.

Per-location pricing fits practices because a location is what the owner understands (one office, one phone system, one schedule) and because cost scales with it: each location has its own PMS server or database, its own numbers and its own integration to maintain. Per-provider pricing fits EHRs and billing, whose work scales with clinicians. Either way, month-to-month terms make retention the number that matters: Weave reported net revenue retention of 93% and gross revenue retention of 89% for 2025. Enterprise customers (DSOs, health systems) negotiate multi-year contracts with volume tiers instead; Waystar's "contracts with clients generally include a subscription fee component as well as a volume-based component", "typically two or three years ... with automatic renewals for successive one-year terms," billed monthly.

## Payments as Revenue

Once software carries the practice's patient payments, the vendor earns on volume. Weave's payments fees are "based on usage" and its payments revenue "is recorded net of transaction processing fees"; Phreesia's payment fees are "generally calculated as a percentage of the total transaction dollar value processed" and/or a per-transaction fee, and its payment solutions revenue was $121.5 million of $480.6 million in fiscal 2026. The model is the software platform as payment facilitator or partner that the [Payments](/books/payments/software-platforms#where-the-money-goes) volume describes; the health twist is in [Payments in the Practice](/books/health-tech/patient-payments): HSA and FSA cards, posting each payment back to the PMS ledger, surcharging where the practice passes card fees to patients, and payment plans and financing. A practice that switches its payments to the engagement vendor is also less likely to leave it, which is part of why the vendors push it.

## Per-Transaction Pricing

Clearinghouses and data networks price per transaction, and the public price pages show the range:

| Vendor | Published pricing |
| --- | --- |
| **Stedi** | No monthly minimum, per-provider or per-payer fees; claims $0.30 each for the first 500 falling to $0.10 above 10,000; eligibility checks $0.30 falling to $0.08; ERAs $0.20 falling to $0.08; claim acknowledgments free; some payer fees passed through |
| **Claim.MD** | No per-provider fee; $120 a month for unlimited claims and ERAs with 1,000 eligibility checks, $60 for 100 transactions, $30 pay as you go |
| **Office Ally** | Claims submission "Start for Free" with transactional fees that may apply; eligibility $10 a month for the first 100 checks then $0.10 each; attachments $0.55 |

Enterprise clearinghouses don't publish rates; Waystar's 10-K describes a subscription component of "recurring monthly provider count fees and minimum amounts owed" and a volume component of "recurring fees associated with transaction count or dollar volumes in excess of minimums," and reported $558.4 million of subscription and $534.8 million of volume-based revenue in 2025. Per-transaction pricing makes the vendor's revenue follow claims volume, which is why a clearinghouse outage or a customer moving volume to a second clearinghouse shows up directly in revenue ([Clearinghouses](/books/health-tech/clearinghouses#switching-clearinghouses)).

## Percentage of Collections and Outsourced RCM

Revenue cycle services are often priced on the money they bring in. athenahealth's last annual report as a public company, for 2017, said that "in most cases, we charge clients a percentage of payments collected by us on behalf of our clients," on revenue of $1,220.3 million from about 111,000 providers on its network. R1 RCM, which runs revenue cycles for hospitals and health systems, earned "net operating fees and incentive fees" on its end-to-end contracts, where "incentive fees are performance-based fees related to agreed-upon improvements," contracted modular work "using a contingency-based model," and priced outsourced staffing at a fixed fee "correlated to a transaction volume metric": $1,455.9 million of net operating fees, $108.4 million of incentive fees and $689.9 million of modular and other revenue in 2023.

The model aligns the vendor with the practice's cash, and it ties the vendor's revenue to definitions that must be written down: which payments count (patient payments as well as insurance? payments on claims submitted before the contract started?), when they count (posting date or deposit date), and what happens with refunds and recoupments. Those definitions are a contract term and a reporting obligation; the vendor computes the fee from the same ledger the practice reconciles, or the two will argue every month. Billing companies that are paid a percentage of collections also raise fraud and abuse questions in some programs, which [Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation#anti-kickback-and-stark-for-software) covers.

## Platform and API Fees

EHR and PMS vendors charge app developers to connect, or decline to, and the terms vary from free to a gate. Epic publishes "over 750 no-cost APIs and interfaces" on open.epic, while its Vendor Services, Showroom listing and enterprise connections have terms that aren't public. In dental and veterinary software, where the PMS vendor often sells its own patient engagement product, integration fees and access rules are a competitive lever ([Integrating with Practice Management Systems](/books/health-tech/pms-integration#gatekeeping-fees-and-the-law) covers partner programs and their history). Open Dental is the rare vendor that publishes its API price list: as of October 2026, monthly per-location tiers run from free (read-only, throttled to one request per five seconds) through $15 and $30 to $35 for everything except its special permissions, last changed in September 2020. I couldn't find a price list on Henry Schein One's (Dentrix) or IDEXX's (ezyVet) own pages; their terms come under partner agreements. <!-- source-gap: pms-api-fees | missing | published per-location API or integration fees for Dentrix (Dentrix Developer Program, Dentrix Ascend API) and ezyVet; third-party aggregators quote figures but the vendors' own pages don't | closes with: Henry Schein One's or IDEXX's own published API pricing (rechecked 2026-10-30: ezyVet's integrations and custom integration pages publish no fees; Dentrix developer program URLs return 404; neither vendor publishes amounts, which come under partner agreements) | checked: 2026-10-30 --> For the app vendor, an integration fee is a cost of goods per location, and a PMS that changes its fee or its access terms changes the app's margin overnight.

## Pharma- and PBM-Funded Models

Some health software is paid by the life sciences industry rather than the provider. Phreesia's network solutions segment "provides a channel for life sciences companies ... to deliver compliant, personalized engagement" to patients during intake, on annual and per-engagement contracts: $139.7 million of fiscal 2026 revenue. OptimizeRx delivers manufacturers' messages to clinicians inside EHR and e-prescribing workflows, reached "over two million U.S. healthcare providers", and paid most of its cost of revenue as "revenue-share expense paid to our channel partners" (the EHRs carrying the messages), on $109.4 million of 2025 revenue. GoodRx earns from pharmacy benefit managers when a consumer uses a GoodRx code: "we receive a percentage of this amount or a fixed payment from the PBM," and prescription transactions were 68% of its 2025 revenue.

The model funds free or cheap software for providers and patients, and it puts the vendor in the federal and state law on drug promotion, on remuneration tied to prescriptions, and on using health data for advertising: the FTC's first Health Breach Notification Rule case was against GoodRx, for sharing health data with advertising platforms ([Pharma Commercial & Patient Support](/books/health-tech/pharma-commercial#direct-to-consumer-advertising) and [Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#the-ftc-health-breach-notification-rule)).

## Enterprise and Consumer Telehealth

Telehealth shows the two ends. Teladoc sells mostly to employers and health plans: "clients pay monthly access fees on a per-member-per-month ('PMPM') model," with visit fees charged per visit in other revenue; access fees were 83% of its 2025 revenue, from about 102 million US members. The model pays whether members use it, so the vendor's margin grows when members don't call, and its sales pitch is that they will. Hims & Hers sells to consumers: "the majority of our Online Revenue is subscription-based," with 2.5 million subscribers at the end of 2025 and $81 of monthly online revenue per average subscriber for the year. The consumer model pays for acquisition with advertising, which is where the FTC's health privacy cases against consumer health companies such as BetterHelp came from ([Telehealth](/books/health-tech/telehealth#advertising-and-privacy-enforcement)).

## How to Build It

The vendor's own billing of its customers is a model of its own, separate from the practice's patient billing in [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). It extends `organizations` (the customer), `locations` (the billable unit) and `payments` (the payment volume a fee is computed on):

```sql
CREATE TABLE vendor_contracts (          -- the vendor's agreement with a customer organization
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),  -- the practice, group or DSO
  term             TEXT NOT NULL CHECK (term IN ('month_to_month', 'annual', 'multi_year')),
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'annual')),
  valid_during     DATERANGE NOT NULL,
  auto_renews      BOOLEAN NOT NULL DEFAULT TRUE,
  document_id      UUID REFERENCES documents (id),  -- the signed order form
  status           TEXT NOT NULL CHECK (status IN ('draft', 'active', 'cancelled', 'ended'))
);

CREATE TABLE contract_fees (             -- each priced component of a contract
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor_contract_id UUID NOT NULL REFERENCES vendor_contracts (id),
  kind              TEXT NOT NULL CHECK (kind IN ('per_location', 'per_provider', 'per_user',
                      'onboarding', 'hardware_lease', 'per_transaction', 'payment_volume',
                      'percent_of_collections', 'minimum')),
  unit              TEXT,                -- 'location', 'provider', 'claim', 'eligibility_check'
  unit_price        BIGINT,              -- cents per unit, for unit-priced kinds
  rate_bps          INT,                 -- basis points, for payment volume or collections
  fixed_amount      BIGINT,              -- per-transaction fixed part, or a monthly minimum
  tiers             JSONB,               -- [{"from": 1, "to": 500, "unit_price": 30}]
  base_definition   TEXT,                -- what counts as collections: written down, versioned
  valid_during      DATERANGE NOT NULL
);

CREATE TABLE usage_records (             -- what was metered, per period, with its source
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  contract_fee_id   UUID NOT NULL REFERENCES contract_fees (id),
  location_id       UUID REFERENCES locations (id),
  period            DATERANGE NOT NULL,
  quantity          NUMERIC(14, 2) NOT NULL,  -- locations, claims, or a dollar base in cents
  source_query      TEXT NOT NULL,       -- the metric definition version that produced it
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (contract_fee_id, location_id, period)
);

-- A percentage-of-collections base for September, from the practice's own ledger
SELECT -SUM(amount) AS collections_base
FROM ledger_entries
WHERE organization_id = $1
  AND kind IN ('patient_payment', 'insurance_payment', 'refund', 'recoupment')
  AND posted_on >= DATE '2026-09-01' AND posted_on < DATE '2026-10-01';
```

- **Meter from the customer's records.** A per-location fee counts active locations; a per-transaction fee counts claims submitted; a collections fee sums the same ledger entries the practice sees. A usage figure the customer can't reproduce is a dispute.
- **Write the base down.** `base_definition` and `source_query` say which entries count, by posting date, with refunds and recoupments netted; a definition change is a new version from a date, never a silent edit.
- **Keep vendor billing out of the PHI path.** Usage is counts and sums per location; the invoice to the practice needs no patient names, so the billing system can sit outside the BAA boundary ([Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#how-to-build-it)).
- **Subscriptions are the Commerce model.** Renewal, proration, dunning and cancellation follow [Subscription Commerce](/books/commerce/subscription-commerce); payments revenue is the [Payments](/books/payments/software-platforms#pricing-per-merchant) volume's pricing per merchant.

## What This Means for the System You Build

- **Pick the meter that tracks the value** your customer sees, and combine a subscription with a volume component if your cost scales with patients.
- **Treat payments as a product,** with posting back to the practice's ledger, not just a processor link.
- **Publish per-transaction prices** if you sell to small practices; enterprise customers will negotiate anyway.
- **Define a collections base in the contract and the code,** and compute it from the ledger the practice reconciles.
- **Count integration fees as cost of goods** per location, and expect the PMS vendor's terms to change.
- **Get counsel before taking money from manufacturers, PBMs or referrals,** and keep health data out of advertising.

## References

**Filings**

- [Weave Communications: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609151/000160915126000016/weav-20251231.htm), per-location subscriptions, terms, onboarding and phone revenue, payments pricing, retention
- [Phreesia: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm), subscription, payment solutions and network solutions revenue and pricing
- [Waystar: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1990354/000199035426000011/way-20251231.htm), subscription and volume-based components, contract terms and revenue
- [athenahealth: Form 10-K for 2017](https://www.sec.gov/Archives/edgar/data/1131096/000113109618000022/athn-20171231x10k.htm), the percentage of payments collected, revenue and providers
- [R1 RCM: Form 10-K for 2023](https://www.sec.gov/Archives/edgar/data/1910851/000162828024007062/ah-20231231.htm), net operating, incentive and contingency fees and revenue by type
- [OptimizeRx: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1448431/000144843126000005/oprx-20251231.htm), revenue, reach and revenue share to channel partners
- [GoodRx: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1809519/000180951926000031/gdrx-20251231.htm), PBM-paid prescription transactions and their share of revenue
- [Teladoc Health: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477449/000147744926000012/tdoc-20251231.htm), per-member-per-month access fees, visit fees and members
- [Hims & Hers Health: Full year 2025 results](https://www.sec.gov/Archives/edgar/data/1773751/000177375126000019/hims-20251231x8xkearningsr.htm), subscription revenue, subscribers and monthly revenue per subscriber

**FTC**

- [FTC: Enforcement action against GoodRx](https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising), the first Health Breach Notification Rule case
- [FTC: Final order banning BetterHelp from sharing health data for advertising](https://www.ftc.gov/news-events/news/press-releases/2023/07/ftc-gives-final-approval-order-banning-betterhelp-sharing-sensitive-health-data-advertising), a telehealth company's health data shared for advertising

**Published prices**

- [Stedi: Pricing](https://www.stedi.com/pricing), per-transaction prices for claims, eligibility and ERAs
- [Claim.MD: Pricing](https://www.claim.md/pricing), monthly plans without per-provider fees
- [Office Ally: Pricing](https://cms.officeally.com/products/pricing), free claims submission, eligibility, attachments and EHR pricing
- [Epic: open.epic](https://open.epic.com/), over 750 no-cost APIs and interfaces
- [Open Dental: API permissions](https://www.opendental.com/site/apipermissions.html), monthly per-location pricing tiers (free, $15, $30, $35), last changed September 2020
