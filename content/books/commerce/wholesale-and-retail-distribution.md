+++
title = "Wholesale & Retail Distribution"
nav_title = "Wholesale & Distribution"
description = "Selling to Walmart, Target, Best Buy and carriers: vendor onboarding, item setup, routing guides, chargebacks, OTIF, deductions, co-op and MDF, sell-through."
category = "Commerce Industry"
order = 2335
part = "Wholesale and B2B"
tags = ["commerce", "wholesale", "retail", "chargebacks", "deductions", "data-model"]
+++

A brand that sells through big-box retail stops selling to shoppers and starts selling to buyers. Best Buy, Walmart, Target and the wireless carriers don't check out on a website; they send purchase orders for thousands of units at the brand's wholesale cost, tell the brand when, how and by which carrier to deliver to which distribution center, measure whether it did, and pay on terms, short by whatever the brand owes them for getting it wrong. ZAGG's last annual report shows how much of a brand this can be: $453.7 million of its $521.9 million 2019 net sales went through the indirect channel, with Verizon Wireless at 17% and Best Buy at 10% ([Omnichannel Brands](/books/commerce/business-models#omnichannel-brands)).

The work is mostly compliance. The retailer writes the rules (a vendor agreement, a supplier manual, a routing guide, an EDI implementation guide) and enforces them with money: a chargeback for an unscannable label, a fine for a late truck, a deduction for a shortage. Margin in wholesale is lost a few hundred dollars at a time, on remittances the brand has to reconcile line by line and dispute inside windows the retailer sets. This chapter covers selling to retailers: vendor onboarding and item setup, the order-to-cash loop, routing guides, compliance chargebacks, on-time in-full programs, deductions and disputes, co-op and market development funds, and sell-through data. It extends `companies`, `orders` and `documents` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The documents themselves (850, 855, 856, 810 and the rest) are [EDI](/books/commerce/edi); selling to businesses that buy for their own use is [B2B Commerce](/books/commerce/b2b-commerce); shipping a retailer's online orders direct to its customers is [Drop Ship & Print on Demand](/books/commerce/drop-ship-and-print-on-demand); receiving from your own suppliers is [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment).

## How the Retailers Do It

Most retailers' supplier manuals sit behind supplier portals (Walmart's Retail Link and Supplier One, Target's Partners Online), so what is public is uneven. As of October 2026:

| Retailer | Supplier portal and data | Delivery program, as published | Compliance charges, as published |
| --- | --- | --- | --- |
| **Walmart** | Retail Link; Supplier One for help; Walmart Luminate (brand Scintilla since February 2025) for sales data, Basic free and Charter paid | On-time in-full (OTIF), measured in cases; policy in Retail Link | 3% of cost of goods on cases that miss the goal, per third-party guides; the policy itself is behind the login |
| **Target** | Partners Online (POL); Greenfield analytics | On-time ship, on-time arrival and fill rate, plus EDI 856 availability and accuracy | 5% of cost of goods on units measured late or not received, per a third-party guide to Target's policy |
| **Best Buy** | Partner portal; a public inbound shipping guide for its direct distribution centers | Routing requests 7 business days before the PO delivery date; an ASN for every shipment | $200 plus excess freight for routing violations; $10 per package for parcel violations; $200 per master bill of lading missing data; $25 plus the invoice for a non-approved carrier |
| **Foot Locker** | Vendor manual published on its investor site | Late shipment by days late | $6.25 a carton (minimum $250) for label and ASN violations; 2% to 5% of PO cost for late shipments; $250 to $500 for appointment violations |
| **Amazon (1P vendor)** | Vendor Central | Not public | Not public ([A 1P sale to Amazon](/books/commerce/commerce-business#a-1p-sale-to-amazon)) |

Three patterns:

- **The rules are public only where the retailer chooses.** Best Buy and Foot Locker publish their manuals; Walmart and Target put theirs behind supplier logins, and what is known comes from the EDI and analytics vendors who read them for clients. A system built for one retailer's rules has to hold another's as data, because they differ in every number.
- **Charges are per carton, per occurrence or per percent.** A label violation costs per carton, a missed appointment per occurrence, a late or short shipment a percent of cost. The charge model is a rule shape, not one fee table.
- **Schedules change.** Manuals are reissued with new amounts and new programs (Best Buy's guide announces an ASN accuracy program it doesn't charge for yet), so every chargeback has to be checked against the rule version in force on the shipment date, not today's.

## Becoming a Vendor

Walmart's public supplier page describes two steps: review its supplier checklist, then create an account in Retail Link to "begin the qualification process," which "does not guarantee you will be extended an agreement." What follows, at Walmart and every other big-box retailer, is the same shape:

1. **The vendor agreement.** Payment terms, allowances, the supplier manual and routing guide by reference, insurance, indemnity, product liability and recall duties. The agreement is what every later deduction cites.
2. **Vendor setup.** Legal entity, tax forms, remit-to bank account, contacts by role (EDI, logistics, accounts receivable, the buyer's counterpart).
3. **EDI certification.** Connecting and testing every document the retailer requires before the first purchase order. Best Buy requires the 850, 860, 810, 824, 856 and 997 to "be in production prior to the first PO being cut" ([Partner Testing](/books/commerce/edi#partner-testing)).
4. **Item setup.** Each item the retailer will buy, with its attributes (next section).
5. **First PO.** Usually small, measured hard.

**Carriers and wireless retail** follow the same path with their own twist: a carrier buys accessories for its stores and sells them alongside phones, often through a distributor that handles the carrier's stores (ZAGG's 2019 report put Superior Communications, a distributor, at 23% of its 2018 net sales). The brand may sell to the carrier, to the distributor, or both, and the same item then has two trading partners with two price lists and two sets of rules.

**Sales reps, brokers and distributors.** Many brands reach retailers through independent sales reps or brokers paid a commission on shipments, and through distributors who buy and resell. Commission plans as data, clawbacks on returns and deductions, and statements reps can reproduce are owned elsewhere: Field Operations' [Commission Plans as Data](/books/field-operations/sales-teams-and-commissions#commission-plans-as-data) and the Payments volume's [Clawbacks for Merchant Losses](/books/payments/partners-and-residuals#clawbacks-for-merchant-losses) apply directly, with deductions as one more clawback input.

## Item Setup

A retailer sets up each item in its own system before it can order it, and the data it asks for is more than a storefront needs:

- **Identifiers.** The consumer unit's GTIN (UPC), the inner pack's and the case's GTINs, the brand's SKU and the retailer's own item number ([Identifiers: GTIN, UPC and GS1](/books/commerce/products-and-variants#identifiers-gtin-upc-and-gs1)). GS1 US licenses company prefixes by capacity, from a single GTIN for $30 to a 100,000-GTIN prefix for $10,500 plus $2,100 a year ([GS1-128 Labels and SSCC](/books/commerce/edi#gs1-128-labels-and-sscc)).
- **Pack hierarchy.** Each, inner pack, case, layer, pallet: units per level, dimensions and weights at each, and the case pack the retailer will order in ([Units and Pack Sizes](/books/commerce/products-and-variants#units-and-pack-sizes) owns `pack_sizes`). A case pack that doesn't match the item record is a receiving discrepancy on every shipment.
- **Cost and terms.** The wholesale cost per unit, allowances off invoice, payment terms, and the FOB point (the retailer's freight or the brand's).
- **Compliance attributes.** Country of origin, hazmat classification (a power bank's lithium battery), Prop 65, age restrictions, recall contacts.
- **Content for the retailer's site.** Titles, images and attributes in the retailer's own taxonomy, which is syndication ([Channel Content and Syndication](/books/commerce/product-information#channel-content-and-syndication)).

The item as the retailer knows it is a `listings` row on the retailer's channel with the retailer's item number, and its trading terms are a `price_lists` row of kind `wholesale` for that trading partner. Changing a cost is a price list version with an effective date the retailer has agreed to, often sent as an EDI 832 or through the portal, never an edit.

## The Order-to-Cash Loop

A retailer purchase order runs a loop with a document at each step, and the brand's systems must hold each one ([EDI](/books/commerce/edi#the-transactions)):

1. **850 Purchase Order** arrives: items, quantities, cost, ship-to distribution center, ship window or must-arrive-by date. It becomes an `orders` row with `channel = 'wholesale'` and the PO number as `external_ref` ([Channel Orders](/books/commerce/order-management#channel-orders-marketplaces-and-purchase-orders)).
2. **855 Acknowledgment** goes back, accepting, changing or rejecting each line.
3. **860 Change** from the buyer may follow: a quantity cut, a date moved, a line cancelled. It is a change request against the order, recorded beside the original.
4. **Routing.** For collect shipments (the retailer pays freight), the brand requests routing (a portal request or an EDI 753) and the retailer assigns a carrier and appointment (a 754). Best Buy wants the request "no later than 12:00 PM CST 7 business days prior to the PO delivery date."
5. **Ship.** Cartons labeled with GS1-128 labels, a bill of lading with the retailer's load ID, and an **856 Ship Notice** sent before the truck arrives.
6. **810 Invoice** for what shipped.
7. **820 Remittance** with the payment on terms, net of deductions, each with a code.
8. **Deductions** worked: accepted, disputed with evidence, recovered or written off.

The loop's evidence is the brand's defense: the 855 shows what was accepted, the 856 and bill of lading what shipped and when, the carrier's proof of delivery when it arrived. Each is a `documents` row, kept as exchanged ([Documents Are Kept as Exchanged](/books/commerce/commerce-business#the-core-data-model)).

## Routing Guides

A routing guide tells the vendor how to ship to the retailer: which carriers, which service by weight and destination, how to request routing, how to build pallets, how to label, what goes on the bill of lading, when to book appointments. Best Buy's US inbound shipping guide for its direct distribution centers, dated October 2026, is a public example of the contents:

- **EDI is mandatory** under the vendor master agreement; the 850 "must not accept verbal POs," and "Vendors must send an EDI997 within 24 hours."
- **An ASN for every shipment,** on X12 4030, one per pallet for LTL and one per package for parcel, arriving before the truck enters the yard.
- **SSCC rules:** one SKU per SSCC for these shipments, and "An SSCC number cannot be reused within a rolling 18-month period," stricter than GS1's one-year minimum.
- **Routing timing:** the request by noon Central seven business days before the PO delivery date, with the goods ready to ship five business days before.
- **Shipping compliance charges:** not following routing instructions, failing to consolidate and unauthorized air freight each cost the excess freight plus $200; UPS direct-to-store violations $10.00 per package plus incremental freight; a master bill of lading without the load ID or PO delivery date "$200.00 per master BOL"; a non-approved carrier, the freight invoice deducted "plus an additional fee of $25.00."
- **A future program:** ASN accuracy isn't charged yet ("in the future there may be a chargeback program"), the kind of dated change a vendor's rule table has to accept.

A routing guide is a document with a version and an effective date. The brand's shipping system reads the current version's rules (carrier by weight band, pallet limits, label layout) per trading partner, and every shipment records the guide version it was built to, because the chargeback will cite one.

## Compliance Chargebacks

A compliance chargeback is a fee the retailer charges the vendor for breaking a rule, deducted from payment. Foot Locker's published vendor compliance section (September 2024) is the most complete public schedule:

| Violation | Charge |
| --- | --- |
| Ticketing (price tickets and labels on units) | $1.25 per unit, minimum $250, not over 25% of unit cost where marked |
| GS1-128 carton label missing, wrong or unscannable | $6.25 per carton or $250, whichever is greater |
| Missing, incorrect or late ASN | $6.25 per carton or $250, whichever is greater |
| Product substitution | 5% of the receipt, up to $1,250 |
| Packing slip | $125 per occurrence |
| Bill of lading | $250 per occurrence |
| Late shipment | 2% of PO cost at 30 to 59 days late, 5% at 60 or more |
| Late for appointment / no-show / no appointment | $250 / $500 / $250 |
| Unauthorized carrier, invalid freight terms and other routing violations | 100% of the freight, plus a $40 administrative fee |
| Routing request not sent 72 hours ahead | $250 |

It also sets the dispute window: disputes in writing, and Foot Locker "will not research inquiries for receipts over 6 months old." Dollar General, by a vendor-facing summary, accepts disputes within 24 months of the deduction date.

What a brand's system needs from this:

- **Every chargeback maps to a rule.** The deduction's code resolves to a row in the retailer's charge schedule for the shipment date, with its formula (per carton with a minimum, percent of PO cost, per occurrence), so the amount can be recomputed and checked.
- **Every rule maps to evidence.** A label chargeback is disputed with the label image and scan log; an ASN chargeback with the 856's transmission time against the truck's arrival; a late shipment with the routing confirmation and carrier pickup scan.
- **Root causes are counted.** Chargebacks by rule, by distribution center, by warehouse and by carrier tell the operations team which mistake costs most. A brand that pays label chargebacks every month has a label printer problem, not a finance problem.

## OTIF Programs

On-time in-full programs measure whether the vendor delivered the whole order inside the retailer's window, and fine the miss. Walmart's is the best known; its policy lives in Retail Link, and what is public comes from third parties:

- **History.** Walmart introduced OTIF fines in 2017 with a 75% target and a 3% fine; raised the bar to 98% from September 15, 2020; and eased it from February 1, 2024 to 90% on time for prepaid shipments and 95% in full, by trade press reports of the Retail Link announcement.
- **Targets and fine, as of March 2024 per a third-party guide.** Prepaid suppliers 90% on time and 95% in full; collect suppliers 98% on time and 95% in full; "fined 3% cost of goods on all cases that did not meet the goal." Measured in cases, cumulative by month, charged monthly and billed quarterly, with monthly penalties under $1,000 waived.
- **The window.** On time means arriving inside a window around the must-arrive-by date (MABD), not merely before it; early deliveries can fail too.
- **Who is fined.** Walmart fines the supplier, not its carrier or 3PL; recovering from them is the supplier's contract problem.

<!-- source-gap: walmart-otif-policy | secondary | Walmart's OTIF targets, fine, measurement window and any change after February 2024 | closes with: a Walmart-published OTIF policy readable without a Retail Link login, or a filing or court record quoting it | checked: 2026-10-28 -->

Target's program, per a third-party guide to its compliance policy (updated October 2022, with changes effective August 4, 2024), measures fill rate, on-time ship, on-time arrival and the 856's availability and accuracy, and charges 5% of cost of goods on units measured late or not received; collect shipments must be booked "by 11:00 AM Central Time two business days before the pickup date," and each charge is disputed separately in POL.

The arithmetic decides behavior. At 3% of cost on failing cases, a 1,200-unit PO at $20 cost that arrives a day early costs $720, about what the brand might net on the PO. An OTIF system therefore schedules ship dates backward from the MABD using the carrier's transit time to that distribution center, holds goods that are ready too early, and records the actual delivery time from the carrier or the retailer's receiving data for every PO.

## Deductions and Disputes

A deduction is any amount the retailer subtracts from a payment, coded on the remittance. The types:

- **Shortage.** The retailer received fewer units than invoiced (including concealed shortage found after unloading).
- **Pricing.** The retailer paid a lower cost than invoiced, citing the PO or the current price list.
- **Compliance and OTIF.** The chargebacks above.
- **Promotional and co-op.** Allowances the brand agreed to fund, taken as deductions instead of invoiced (next section).
- **Returns and defective allowances.** Goods returned to the vendor, or a percentage allowance in lieu of returns.
- **Duplicates and errors.** Charged twice, or charged against the wrong PO.

Each retailer has a dispute channel and a clock. Walmart's Accounts Payable Dispute Portal gives a vendor 7 days to answer a request for more information, and return center deductions must be disputed within 90 days, by vendor-side guides; Amazon's vendor shortage claims, by the same kind of guide, must be disputed within 30 days of the invoice due date; Foot Locker's window is six months and Dollar General's 24. Specialist software (iNymbus, HighRadius, Glimpse and others) pulls remittances from retailer portals, matches deductions to evidence and files disputes, often priced on what it recovers.

The work is reconciliation. Every remittance line is matched to an invoice; every short amount becomes a deduction row with its code; each is classified as valid (accept and book), invalid (dispute with evidence before the window closes), or uncertain (investigate). Deductions are a receivable until resolved and a cost when accepted, and finance needs them by type and retailer to reserve against them. The receivable side is the Payments volume's [B2B Receivables](/books/payments/checkout-and-invoicing#b2b-receivables).

## Co-op, MDF and Promotional Allowances

Retailers charge brands for marketing and placement in several forms:

- **Co-op advertising.** An accrual earned as a percentage of the brand's sales to the retailer (commonly cited at 2% to 5%), spent on advertising the brand's products with proof of performance, and reimbursed or deducted.
- **Market development funds (MDF).** A discretionary budget the brand allocates to a retailer or channel partner for specific programs, approved in advance.
- **Promotional allowances.** Off-invoice or billback discounts funding a retailer's price promotion, scan-based allowances per unit sold during a promotion, markdown support when goods don't sell, and slotting or new-item fees.

The Robinson-Patman Act governs these in the US. Section 2(d) (15 U.S.C. 13(d)) makes payment for promotional services or facilities unlawful "unless such payment or consideration is available on proportionally equal terms to all other customers competing in the distribution of such products," and section 2(e) bars furnishing services or facilities on terms not accorded to all competing purchasers on proportionally equal terms. The FTC's Fred Meyer Guides (16 CFR part 240, "Guides for Advertising Allowances and Other Merchandising Payments and Services") describe how: a plan, proportionally equal terms, availability to all competing customers, and checking that payments are used as intended. The Act went largely unenforced for decades and returned: the FTC sued Southern Glazer's Wine and Spirits in December 2024 (the court denied its motion to dismiss in April 2025) and PepsiCo in January 2025 over promotional payments to a large retailer not offered to competitors on proportionally equal terms, a case it dismissed in May 2025. Price discrimination itself (section 2(a)) and the October 2026 Southern Glazer's settlement are in [Business buyers: Robinson-Patman](/books/commerce/pricing#business-buyers-robinson-patman).

For the system, the Fred Meyer Guides' points become records: each program as an agreement with its terms and eligible customers, accruals computed from shipments, claims and proof of performance, and payments or deductions matched to them. A brand that can show the same program was offered on proportional terms to every competing retailer has its defense in its data.

## Sell-Through and POS Data

A wholesale sale is final for the brand only when the shopper buys it; until then, the retailer can return it, mark it down at the brand's expense or stop reordering. Retailers share what sold:

- **Walmart** retired the Decision Support System inside Retail Link on March 1, 2024, replacing it with Walmart Luminate (renamed Scintilla from February 5, 2025): a free Basic tier and a paid Charter tier, priced supplier by supplier as a share of Walmart's sales of the supplier's products, by third-party accounts.
- **Target** provides point-of-sale and inventory data through Partners Online and Greenfield.
- **EDI 852 Product Activity Data** carries units sold and on hand by store and week from retailers that send it, and an **846** carries inventory ([EDI](/books/commerce/edi#the-transactions)).

The brand loads these into `sell_through_reports` by retailer, item, store or distribution center, and week, and computes:

- **Sell-through rate:** units sold over units received in a period.
- **Weeks of supply:** on hand over average weekly sales, by store, which predicts the next PO and the stores about to run out.
- **In-stock rate:** stores with stock over stores carrying the item, which is what the retailer's buyer will raise at the next review.

Sell-through is also the input to vendor-managed inventory, where the brand proposes or creates the retailer's orders from the retailer's own data, and to forecasting in [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#forecasting).

## How to Build It

A retailer is a `companies` row (the business buyer) and a trading partner; its POs are `orders` with `channel = 'wholesale'`; its documents are `documents`. This chapter adds the partner, its rule versions, deductions, programs and sell-through:

```sql
CREATE TABLE trading_partners (          -- a retailer, carrier or distributor the brand sells to
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  company_id      UUID NOT NULL REFERENCES companies (id),
  kind            TEXT NOT NULL CHECK (kind IN ('retailer', 'carrier', 'distributor', 'marketplace_1p')),
  vendor_number   TEXT NOT NULL,         -- the brand's ID in the retailer's systems
  price_list_id   UUID REFERENCES price_lists (id),  -- wholesale cost list
  payment_terms   TEXT NOT NULL,         -- 'net_60'
  freight_terms   TEXT NOT NULL CHECK (freight_terms IN ('collect', 'prepaid', 'mixed')),
  agreement_ref   TEXT NOT NULL,         -- the vendor agreement document; EDI maps hang off this row
  status          TEXT NOT NULL CHECK (status IN ('onboarding', 'certifying', 'active',
                    'suspended', 'ended')),
  UNIQUE (merchant_id, company_id)
);

CREATE TABLE routing_guides (            -- a partner's supplier manual or routing guide, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  trading_partner_id UUID NOT NULL REFERENCES trading_partners (id),
  version          TEXT NOT NULL,
  document_ref     TEXT NOT NULL,        -- the PDF as published
  rules            JSONB NOT NULL,       -- carriers by weight band, routing lead days, pallet and label specs
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (trading_partner_id, version)
);

CREATE TABLE compliance_charge_rules (   -- the partner's charge schedule, versioned with its guide
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  routing_guide_id UUID NOT NULL REFERENCES routing_guides (id),
  code             TEXT NOT NULL,        -- the retailer's violation code
  description      TEXT NOT NULL,
  basis            TEXT NOT NULL CHECK (basis IN ('per_unit', 'per_carton', 'per_occurrence',
                     'percent_of_cost', 'freight_plus_fee')),
  rate             BIGINT,               -- minor units or basis points, by basis
  minimum          BIGINT,
  maximum          BIGINT,
  evidence_kinds   TEXT[] NOT NULL,      -- 'label_image', 'asn_timestamp', 'pod', 'routing_confirmation'
  UNIQUE (routing_guide_id, code)
);

CREATE TABLE po_delivery_measures (      -- what OTIF and on-time programs measure, per PO
  order_id         UUID PRIMARY KEY REFERENCES orders (id),
  must_arrive_by   DATE,
  window           TSTZRANGE,            -- the on-time window the program applies
  routing_guide_id UUID REFERENCES routing_guides (id),
  arrived_at       TIMESTAMPTZ,          -- from carrier POD or retailer receiving
  units_ordered    INT NOT NULL,
  units_received   INT,
  cases_on_time    INT,
  cases_in_full    INT,
  source           TEXT                  -- 'carrier_pod', 'retailer_scorecard', '944'
);

CREATE TABLE remittances (               -- a payment from a partner, as received
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  trading_partner_id UUID NOT NULL REFERENCES trading_partners (id),
  document_id      UUID REFERENCES documents (id),  -- the 820 or portal export
  paid_amount      BIGINT NOT NULL,
  currency         CHAR(3) NOT NULL,
  paid_on          DATE NOT NULL,
  payment_ref      TEXT NOT NULL
);

CREATE TABLE deductions (                -- every short amount on a remittance
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  remittance_id    UUID NOT NULL REFERENCES remittances (id),
  trading_partner_id UUID NOT NULL REFERENCES trading_partners (id),
  order_id         UUID REFERENCES orders (id),
  invoice_number   TEXT,
  partner_code     TEXT NOT NULL,        -- as on the remittance
  kind             TEXT NOT NULL CHECK (kind IN ('shortage', 'pricing', 'compliance', 'otif',
                     'promotional', 'coop', 'returns', 'defective_allowance', 'duplicate', 'other')),
  charge_rule_id   UUID REFERENCES compliance_charge_rules (id),  -- resolved for compliance
  amount           BIGINT NOT NULL CHECK (amount > 0),
  recomputed_amount BIGINT,              -- what the rule says it should be
  status           TEXT NOT NULL CHECK (status IN ('open', 'valid', 'disputed', 'recovered',
                     'written_off')),
  dispute_deadline DATE,                 -- from the partner's window
  taken_on         DATE NOT NULL
);
CREATE INDEX deductions_open_idx ON deductions (trading_partner_id, dispute_deadline)
  WHERE status IN ('open', 'disputed');

CREATE TABLE deduction_disputes (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  deduction_id     UUID NOT NULL REFERENCES deductions (id),
  filed_at         TIMESTAMPTZ NOT NULL,
  channel          TEXT NOT NULL,        -- the partner's portal, email, a recovery vendor
  partner_ref      TEXT,                 -- the dispute's ID in the partner's portal
  evidence         TEXT[] NOT NULL,      -- document IDs: 856, BOL, POD, label images
  outcome          TEXT CHECK (outcome IN ('approved', 'partial', 'denied')),
  recovered_amount BIGINT,
  resolved_at      TIMESTAMPTZ
);

CREATE TABLE coop_agreements (           -- co-op, MDF and promotional programs per partner
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  trading_partner_id UUID NOT NULL REFERENCES trading_partners (id),
  program          TEXT NOT NULL,        -- the program offered to all competing customers
  kind             TEXT NOT NULL CHECK (kind IN ('coop_accrual', 'mdf', 'off_invoice',
                     'billback', 'scan_based', 'markdown', 'new_item_fee')),
  accrual_bps      INT,                  -- co-op: basis points of shipments
  budget           BIGINT,               -- MDF
  terms_ref        TEXT NOT NULL,
  valid_during     TSTZRANGE NOT NULL
);

CREATE TABLE coop_claims (               -- a use of a program, with proof of performance
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  agreement_id     UUID NOT NULL REFERENCES coop_agreements (id),
  amount           BIGINT NOT NULL,
  proof_ref        TEXT,                 -- the ad, the display photo, the scan data
  settled_by       TEXT CHECK (settled_by IN ('deduction', 'check', 'credit_memo')),
  deduction_id     UUID REFERENCES deductions (id),
  status           TEXT NOT NULL CHECK (status IN ('claimed', 'approved', 'rejected', 'settled'))
);

CREATE TABLE sell_through_reports (      -- a partner's sales and stock by item, place and week
  trading_partner_id UUID NOT NULL REFERENCES trading_partners (id),
  item_id          UUID NOT NULL REFERENCES items (id),
  partner_location TEXT NOT NULL,        -- store or DC number in the partner's system
  week_ending      DATE NOT NULL,
  units_sold       INT NOT NULL,
  units_on_hand    INT,
  sales_amount     BIGINT,
  source           TEXT NOT NULL CHECK (source IN ('edi_852', 'portal_export', 'api')),
  document_id      UUID REFERENCES documents (id),
  PRIMARY KEY (trading_partner_id, item_id, partner_location, week_ending)
);
```

Design notes:

- **Rules are versioned with the guide.** A chargeback is recomputed against the `compliance_charge_rules` row of the guide in force on the ship date; a difference between `amount` and `recomputed_amount` is a dispute on its face.
- **Deadlines are stored, not remembered.** `dispute_deadline` is computed from the partner's window when the deduction is created ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), and an open deduction past it is written off by rule, not forgotten.
- **Delivery facts per PO.** `po_delivery_measures` lets the brand compute its own OTIF from carrier proof of delivery and compare it to the retailer's scorecard before the fine arrives.
- **Programs are offered, then claimed.** `coop_agreements` holds the program per partner with the program code shared across competing partners, which is the proportional-terms evidence; claims settle by deduction, check or credit memo.
- **Events:** `wholesale_po.received`, `wholesale_po.acknowledged`, `routing.requested`, `routing.assigned`, `asn.sent`, `invoice.sent`, `remittance.received`, `deduction.created`, `deduction.disputed` and `deduction.resolved` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the ERP, the warehouse and the deductions team.

## Auditing

- **Every partner rule version.** Vendor agreements, routing guides and charge schedules as published, with their effective dates.
- **Every PO's evidence.** The 850, 855, 860s, routing confirmation, 856, bill of lading, carrier proof of delivery and 810, as exchanged.
- **Every deduction and its fate.** Code, amount, recomputed amount, the rule it resolved to, the dispute and evidence filed, the outcome and recovery.
- **Every promotional program and claim,** with the partners it was offered to and the proof of performance, against Robinson-Patman's proportional-terms requirement.
- **Sell-through as received,** with its source document.

## What This Means for the System You Build

- **Treat each retailer as a trading partner with versioned rules:** agreement, routing guide, charge schedule, EDI guide, each with effective dates.
- **Run the order-to-cash loop on documents:** 850, 855, 860, routing, 856, 810, 820, each stored as exchanged and linked to the order.
- **Schedule shipments backward from the must-arrive-by date** and measure delivery per PO, so OTIF is known before the scorecard.
- **Recompute every chargeback** from the rule in force on the ship date, and dispute differences with the evidence the rule names.
- **Store dispute deadlines** and work deductions before them; report deductions by type, partner and root cause.
- **Record promotional programs as offers and claims,** offered on proportional terms to competing customers.
- **Load sell-through by partner, item, location and week,** and use it for in-stock, weeks of supply and replenishment.
- **Link reps' and brokers' commissions** to shipments net of deductions, using the commission and clawback models the other volumes own.

## References

**Retailer documents**

- [Walmart: Apply to be a supplier](https://corporate.walmart.com/suppliers/apply-to-be-a-supplier), the supplier checklist, creating a Retail Link account, no guarantee of an agreement
- [Best Buy: US DDC Inbound Shipping Guide (October 2026)](https://partners.bestbuy.com/documents/20126/70924/US-DDC-Inbound-Shipping-Guide.pdf/ed16b9de-fcca-db75-fdf4-f223fe706d9b), mandatory EDI documents, the 997 in 24 hours, the 4030 ASN, SSCC rules, routing timing and shipping compliance charges
- [Foot Locker: Vendor Compliance Program, Chargebacks and Policies (Section 9)](https://www.footlocker-inc.com/content/dam/flincfoundation/footlockerinc_documents/vms/Section%2009%20-%20Vendor%20Compliance%20Program%20Chargebacks%20and%20Policies.pdf), the chargeback schedule and the six-month dispute window
- [Target: Suppliers](https://corporate.target.com/about/products-services/suppliers), supplier programs and Target Plus by invitation

**Program guides (secondary)**

- [8th & Walton: Walmart OTIF](https://www.8thandwalton.com/blog/walmart-otif), targets for prepaid and collect suppliers, the 3% fine, monthly measurement and quarterly billing
- [Talk Business & Politics: Walmart demands 98% OTIF (September 2020)](https://talkbusiness.net/2020/09/walmart-demands-all-suppliers-comply-with-98-on-time-in-full-shipment-rule/), the 2020 target and the program's 2017 start
- [Logistics Viewpoints: Walmart lowers its shipping requirements (February 2024)](https://logisticsviewpoints.com/2024/02/05/walmart-lowers-their-shipping-requirements-but-their-suppliers-still-struggle), the February 1, 2024 change
- [Mulder Brothers: Walmart OTIF vs. MABD](https://mulderbrothers.com/walmart-otif-vs-mabd-differences/), the must-arrive-by date and early deliveries
- [SPS Commerce: Holding third parties accountable for OTIF fines](https://www.spscommerce.com/community/articles/holding-3rd-parties-accountable-for-otif-fines), fines charged to the supplier
- [SPS Commerce: A supplier's guide to Target's compliance policy](https://www.spscommerce.com/community/articles/a-suppliers-guide-to-targets-compliance-policy), the 2024 changes, booking deadlines and disputes in POL
- [SPS Commerce: Target compliance deductions](https://www.spscommerce.com/community/articles/target-compliance-deductions), the measured metrics and the 5% charge
- [SPS Commerce: Walmart's APDP](https://www.spscommerce.com/community/articles/walmarts-apdp-a-clear-guide-to-the-accounts-payable-dispute-portal), the dispute portal and response times
- [SupplyPike: Disputing return center deductions](https://help.supplypike.com/en/articles/12769694-disputing-return-center-deductions-last-90-days-in-supplier-help), the 90-day window
- [SPS Commerce: Amazon dispute timeliness](https://www.spscommerce.com/community/articles/amazon-dispute-timeliness), the 30-day shortage claim window
- [SPS Commerce: Dollar General accounts payable procedures](https://www.spscommerce.com/community/articles/dollar-general-accounts-payable-procedures-for-vendors), the 24-month dispute window
- [Talk Business & Politics: Walmart requiring suppliers to move to Luminate (October 2023)](https://talkbusiness.net/2023/10/walmart-requiring-all-suppliers-to-move-to-luminate-data-service/), the end of DSS on March 1, 2024 and the Basic and Charter tiers
- [Talk Business & Politics: Walmart to rebrand Data Ventures to Scintilla (October 2024)](https://talkbusiness.net/2024/10/walmart-to-rebrand-data-ventures-to-scintilla/), the rebrand effective February 5, 2025
- [SPS Commerce: Guide to Walmart's Luminate Charter](https://www.spscommerce.com/community/articles/guide-to-walmarts-luminate-charter), Charter priced as a share of the supplier's sales at Walmart
- [Unifyr: Co-op advertising](https://www.unifyr.com/atlas/co-op-advertising/), co-op as an accrual on purchases and typical accrual rates
- [ZINFI: What are co-op funds](https://www.zinfi.com/glossary/what-are-co-op-funds/), co-op versus MDF
- [G2: Deduction management software](https://g2.com/categories/deduction-management), the deduction recovery vendors

**Law**

- [15 U.S.C. 13](https://www.law.cornell.edu/uscode/text/15/13), Robinson-Patman sections 2(d) and 2(e) on proportionally equal terms
- [16 CFR part 240](https://www.law.cornell.edu/cfr/text/16/part-240), the Guides for Advertising Allowances and Other Merchandising Payments and Services
- [FTC v. Southern Glazer's: Order denying motion to dismiss (April 2025)](https://www.ftc.gov/system/files/ftc_gov/pdf/FTCvSGWS-OrderDenyingMotiontoDismiss%28Dkt72%29.pdf), the Robinson-Patman case against a distributor
- [K&L Gates: FTC's Robinson-Patman enforcement sees mixed results (June 2025)](https://www.klgates.com/thought-leadership/Uneven-Pour-FTCs-Robinson-Patman-Enforcement-Sees-Mixed-Results-as-Pepsi-Case-Goes-Flat-and-Southern-Glazers-Orders-Another-Round-6-18-2025), the PepsiCo filing in January 2025 and its dismissal in May 2025

**Filings and standards**

- [ZAGG Inc: Form 10-K for 2019](https://www.sec.gov/Archives/edgar/data/1296205/000129620520000040/zagg-20191231.htm), indirect channel sales and customers over 10% of net sales
- [GS1 US: Get UPC barcodes](https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode/get-upc-barcodes), company prefix and single GTIN fees
