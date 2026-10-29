+++
title = "Automotive Retail"
description = "How cars are sold: dealer management systems, F&I and lending law, the vacated CARS Rule, window stickers and disclosures, titling, online car retail."
category = "Commerce Industry"
order = 2352
part = "Regulated Goods"
tags = ["commerce", "automotive", "dealers", "f-and-i", "titling", "compliance"]
+++

A car is the most regulated thing most people buy at retail. Each one has a unique identity (its VIN), a legal title that a state issues and a lender holds a lien on, a federally required window sticker if it's new and a federally required Buyers Guide if it's used, an odometer reading the seller must certify under penalty of law, and possibly an open safety recall that makes it illegal to sell new. The deal is rarely just a price: there's a trade-in, a loan or lease the dealer arranges and is paid for arranging, and a menu of add-on products (service contracts, GAP, protection packages) that generate much of the dealer's profit and most of the regulator's complaints. All of it runs through a dealer management system that, as one June 2024 outage showed, an entire industry can depend on at once.

This chapter covers the dealer and the deal, dealer management systems, finance and insurance (F&I), the FTC's CARS Rule and what has governed since a court vacated it, the disclosures on the vehicle, titling and registration, and online car retail. It extends `items` and `orders` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model): a vehicle is an item sold once, and a deal is an order with a structure no other order has. Consumer protection online in general is [Consumer Protection Online](/books/commerce/online-consumer-protection); lending and payments are the Payments volume's; general product recalls are [Product Safety, Compliance & Recalls](/books/commerce/product-safety-and-recalls#recalls).

## How the Platforms Do It

As of October 2026, from filings and company pages:

| Company | Role | Scale and facts |
| --- | --- | --- |
| **CDK Global** | Dealer management system | Taken private by Brookfield affiliates on July 6, 2022 at $54.87 a share; then served "over 15,000 retail locations in North America"; a June 2024 cyber incident took its systems down across its dealer base |
| **Reynolds and Reynolds** | Dealer management system | Privately held; details not in the sources here |
| **Tekion** | Cloud dealer platform | Says it powers "3,000+ dealerships" and has processed "$43B+ in transactions" (vendor claims); clouds for retailers, OEMs and partners |
| **Cox Automotive** | Dealer software and marketplaces | Owns Autotrader, Kelley Blue Book, Manheim, Dealertrack, vAuto, VinSolutions and Xtime; part of privately held Cox Enterprises |
| **Carvana** | Online used car retailer | 596,641 retail units in 2025, up 43.3%; $20,322 million revenue; 39 vending machines; logistics in 316 metropolitan areas |
| **CarMax** | Omnichannel used car retailer | 780,684 retail units in fiscal 2026 from 256 stores; about 94% of buyers first visited online; its finance arm funded 42.4% of retail units |

Three patterns:

- **The DMS is the dealer's ERP.** Inventory, deals, F&I, accounting, parts, service and payroll live in one system, with dozens of integrations reading from it. When CDK's systems went down after the June 19, 2024 incident, AutoNation reported that its locations stayed open and sold "through manual and alternative means and processes, albeit with lower productivity," and estimated the outage would cut its second-quarter earnings by about $1.50 a share before recoveries.
- **Consolidation and private ownership.** The two largest DMS vendors are private, as is Cox; the newer entrant, Tekion, sells cloud replacement. Dealers switch rarely and painfully, which is the replatforming problem at its hardest ([Choosing & Hosting a Store](/books/commerce/choosing-a-platform#lock-in-and-the-way-out)).
- **Online retail is a logistics business.** Carvana's filing describes reconditioning centers, a logistics network covering over 80% of the US population and loans sold through securitizations; CarMax reports that about 81% of customers used some of its digital capabilities. Selling a car online is easy; inspecting, reconditioning, titling and delivering it is the work.

## The Dealer and the Deal

A franchised dealer sells new vehicles of the brands it holds franchises for, plus used vehicles; an independent dealer sells used only. A deal has more parts than any other order in this volume:

| Part | What it is | Where it goes |
| --- | --- | --- |
| **Vehicle** | One VIN, at a selling price | The order line |
| **Trade-in** | The customer's car, at an allowance, with its loan payoff | A purchase from the customer, netted against the sale |
| **Fees** | Documentation fee, title and registration fees, taxes | Order charges, some passed to the state |
| **Add-ons** | Service contracts, GAP, maintenance plans, protection products, accessories | F&I products, each optional |
| **Financing or lease** | A retail installment contract or lease the dealer arranges and assigns to a lender | A contract with its own disclosures, often a dealer reserve |
| **Down payment** | Cash, card or rebate | Tenders |

The amount financed is the vehicle plus fees, taxes and add-ons, minus the down payment and the trade's net equity (or plus its negative equity). Every figure in that equation is something a regulator has examined, because the monthly payment can hide changes to any of them.

## Dealer Management Systems

A DMS holds the dealer's:

- **Vehicle inventory:** each VIN with its acquisition cost, reconditioning, days in stock and floor plan financing.
- **Deals and desking:** the sales worksheet, trade appraisals, rebates and payment quotes.
- **F&I:** the menu of products, credit applications sent to lenders through credit networks such as Cox Automotive's Dealertrack, contracts and e-signing.
- **Accounting:** a full general ledger with vehicle-level schedules.
- **Service and parts:** repair orders, technicians' time, parts inventory and warranty claims to the manufacturer.
- **Integrations:** the manufacturer's systems, lenders, state DMV and electronic titling, CRM and marketing, websites and marketplaces.

What it means for anyone building around one:

- **The DMS is the system of record** for the vehicle and the deal; a website, a digital retailing tool or a marketplace listing reads from it and writes deals back, with one system of record per object as in [The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it).
- **Integration access is controlled by the DMS vendor,** through certified interfaces with fees. That's a design constraint for any product a dealer wants to plug in.
- **Plan for its absence.** The 2024 outage showed that a dealer whose DMS is down still sells; the integration layer should queue and reconcile rather than fail, and the dealer needs a way to work deals manually and enter them later ([Offline Sync](/docs/architecture/offline-sync)).

## F&I: Financing, Leases and Add-Ons

The finance and insurance office converts the sale into a contract. Three bodies of law apply most:

- **Truth in Lending (Regulation Z).** A retail installment contract must disclose the amount financed with its itemization, the finance charge ("the dollar amount the credit will cost you"), the APR ("the cost of your credit as a yearly rate"), the total of payments and, for a credit sale, the total sale price (12 CFR 1026.18).
- **Consumer Leasing (Regulation M).** A consumer lease is one "for a period exceeding four months and for a total contractual obligation not exceeding the applicable threshold amount," $73,400 for 2026, adjusted annually (12 CFR 1013.2(e)); auto leases are the standard example, with their own disclosures.
- **Who regulates dealers.** Under Dodd-Frank section 1029, the CFPB may not exercise rulemaking, supervisory or enforcement authority over a dealer "predominantly engaged in the sale and servicing of motor vehicles, the leasing and servicing of motor vehicles, or both" (12 U.S.C. 5519), except for dealers that extend credit themselves without routinely assigning contracts to an unaffiliated lender (buy-here-pay-here) and for unrelated financial products. The FTC is the federal regulator for most dealers, and state attorneys general and motor vehicle boards enforce state law.

The dealer's compensation for arranging financing is usually a **dealer reserve**: the lender buys the contract at a rate, and the dealer earns part of the difference between that rate and the contract rate. Add-on products are sold at a markup over their cost. Both are lawful and both are where pricing discrimination and "payment packing" (adding products into a payment without clear consent) allegations arise. The specific reserve caps lenders set aren't public in the sources here. <!-- source-gap: dealer-reserve-practice | missing | public documentation of dealer reserve (markup) mechanics and typical caps | closes with: CFPB or FTC materials on dealer markup, or a lender's published dealer program terms | checked: 2026-10-28 -->

## The CARS Rule and What Replaced It

On December 12, 2023, the FTC announced the **CARS Rule** (Combating Auto Retail Scams): it banned bait-and-switch claims about price, financing and availability; required dealers to disclose an "offering price" (the full price a buyer would pay, excluding only government fees), to state that optional add-ons aren't required, and to disclose the total of payments when discussing monthly payments; banned add-ons that provide no benefit (duplicate warranties, oil change contracts for electric vehicles); and required "express, informed consent" before any charge. It was to take effect July 30, 2024.

It never did. On January 27, 2025, the Fifth Circuit, in National Automobile Dealers Association v. FTC (No. 24-60013), held that "the FTC failed to issue an advance notice of proposed rulemaking in violation of its own regulations" and vacated the rule. The decision was procedural; the conduct it described is still policed under section 5 of the FTC Act. The FTC's pricing transparency FAQ for the industry (September 2026) says "The FTC Act and Section 5's requirements have been in effect for decades" and "If anyone is misleading consumers about price, they are risking FTC action." Recent matters show the shape of enforcement:

- **Leader Automotive Group** (FTC and Illinois, filed December 2024): add-ons, junk fees and fake reviews at ten dealerships; a proposed $20 million settlement the FTC described as its largest against an auto dealer, with offering-price disclosure and consent requirements much like the vacated rule's.
- **Asbury Automotive Group** (administrative complaint, August 2024): alleged unauthorized add-ons, payment packing and discrimination against Black and Latino buyers at three Texas stores; the Commission dismissed the complaint on October 5, 2026.
- **Others** on the FTC's docket as of October 2026 include Lindsay Chevrolet (with Maryland, settled March 2026), Coulter Motor (with Arizona), Rhinelander Auto, Vroom, Passport and Napleton.

States are writing the rule's substance into their own law; California's SB 766 (the California Combating Auto Retail Scams Act) is the most prominent, and its final text and operative date weren't retrievable for this chapter. <!-- source-gap: ca-sb-766 | missing | California SB 766 (2025) chapter number, requirements and operative date | closes with: the leginfo bill page | checked: 2026-10-28 -->

For the system, the vacated rule is still the best specification of what regulators expect, and building to it costs little:

- **An offering price on every advertised vehicle,** computed from the deal model, including every non-government fee.
- **Add-ons offered after the price, each with its own price and its own consent,** recorded with who presented it and how the customer agreed.
- **Total of payments shown whenever a monthly payment is,** from the same calculation the contract uses.
- **No product the customer can't benefit from:** rules that block a product given the vehicle (no oil change plan on an electric vehicle, no GAP when the loan-to-value makes it worthless).

## Disclosures on the Vehicle

Federal law puts specific documents on or with each vehicle:

- **The Monroney label (new vehicles).** The window sticker must show the make, model and VIN, the final assembly point, the dealer to which it was delivered, the method of transport, the manufacturer's suggested retail price, optional equipment and transportation charges with the total, and the NCAP safety ratings or a statement that the vehicle wasn't rated, affixed to a side window or the windshield (15 U.S.C. 1232). Fuel economy labeling comes from a separate law.
- **The Buyers Guide (used vehicles).** A dealer (anyone who sold or offered five or more used vehicles in the previous twelve months, 16 CFR 455.1) must display a Buyers Guide "prominently and conspicuously" on each used vehicle before offering it for sale (455.2), in one of two versions ("As Is - No Dealer Warranty" or "Implied Warranties Only," the latter where state law bars as-is sales) with a Spanish version if the sale is conducted in Spanish; the contract must say the guide's terms are part of it and override contrary provisions. The FTC's guide cites civil penalties up to $53,088 per violation as of October 2026.
- **Odometer disclosure.** "A person transferring ownership of a motor vehicle shall give the transferee the following written disclosure": the cumulative mileage, or that the actual mileage is unknown (49 U.S.C. 32705). The 2019 rule permitting electronic odometer disclosure requires electronic titles to be "maintained in a secure environment" and systems to log document creation, the signing of odometer disclosures, access and attempts at unauthorized alteration (49 CFR 580.4).
- **Open recalls.** A dealer may sell or lease a new vehicle with an open safety recall "only if" the defect has been remedied (49 U.S.C. 30120(i)). The rule covers new vehicles, not used ones (rental companies have their own rule), so used vehicle recall checks are a dealer's policy and a disclosure question rather than a federal sale ban.

Each is a document generated from the vehicle record, with a version: a Buyers Guide changes when the warranty changes, and the one displayed is the one that binds.

## Titling and Registration

A vehicle's ownership is a state record. Selling one means:

- **The title.** The seller signs over the title (paper or electronic), with the odometer disclosure; a lender's lien is released when the payoff clears, and the new lender's lien is recorded.
- **Registration and plates.** The dealer usually collects the state's taxes and fees, issues a temporary tag, and submits the title and registration application to the state, sometimes through a licensed third-party registration service.
- **Electronic lien and title (ELT).** Many states hold titles with liens electronically and exchange lien releases and title transfers with lenders through ELT providers; state-by-state program details weren't covered in the sources here. <!-- source-gap: elt-and-etitle-programs | missing | state electronic lien and title and e-title programs (e.g., California, Florida, Arizona) and temporary tag systems | closes with: the state DMV program pages | checked: 2026-10-28 -->
- **Title history.** The National Motor Vehicle Title Information System (NMVTIS) "is designed to protect consumers from fraud" and helps states and law enforcement deter title fraud, and consumers can buy NMVTIS vehicle history reports. A dealer or marketplace checks a vehicle's title history before buying or listing it.

For the system, titling is a fulfillment with its own lifecycle (documents collected, submitted, accepted, title issued) and its own deadlines set by each state, and a deal isn't finished until it completes ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Online Car Sales

Online car retail is an omnichannel problem with a 4,000-pound item:

- **Pure online.** Carvana sells online with home delivery or pickup at its vending machines and hubs, reconditions at inspection and reconditioning centers (including 16 built out on the ADESA auction sites it bought in 2022, which added 56 locations), and sells most of the loans it originates. Since 2012 it has sold 2.8 million retail vehicles.
- **Omnichannel.** CarMax lets customers do any part of the purchase online or in a store; in fiscal 2026 about 94% of buyers first visited online and about 81% used some digital capability.
- **Dealers' digital retailing.** Franchised dealers sell online through their websites and tools that let a buyer build a deal (trade-in, payments, add-ons) and complete it in the store or at home, with the DMS as the back end.
- **Manufacturers selling direct.** State franchise laws in many states bar or limit manufacturers from selling new vehicles directly to consumers, which is why some electric vehicle makers that sell direct operate differently by state and have litigated access; the state-by-state map wasn't retrievable for this chapter. <!-- source-gap: direct-sales-laws | missing | state motor vehicle franchise laws on manufacturer direct sales and the status of Tesla and Rivian litigation and settlements | closes with: the state statutes and court records | checked: 2026-10-28 -->

What online sale changes in the model: the deal is built over days across channels, the e-signed contract is the only signature (with the electronic odometer rule's security and logging), delivery is a fulfillment with an inspection and a return window if the seller offers one, and title and registration are done for a customer who may never visit the state's office ([Electronic Signatures](/docs/compliance/electronic-signatures)).

## How to Build It

This chapter adds vehicles as serialized items, deals with trade-ins, F&I products and their consents, vehicle documents and title work:

```sql
CREATE TABLE vehicles (                  -- one VIN in the dealer's inventory; not a fleet van
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id            UUID NOT NULL UNIQUE REFERENCES items (id),  -- each vehicle is its own item
  location_id        UUID NOT NULL REFERENCES locations (id),
  vin                CHAR(17) NOT NULL UNIQUE,
  condition          TEXT NOT NULL CHECK (condition IN ('new', 'used', 'certified')),
  year               SMALLINT NOT NULL,
  make               TEXT NOT NULL,
  model              TEXT NOT NULL,
  trim               TEXT,
  odometer           INT,
  odometer_status    TEXT CHECK (odometer_status IN ('actual', 'exceeds_mechanical',
                       'not_actual', 'exempt')),
  msrp               BIGINT,             -- new: from the Monroney label
  acquisition_cost   BIGINT,
  acquired_at        DATE,
  open_recalls       JSONB NOT NULL DEFAULT '[]',  -- campaign numbers, checked_at
  title_brand        TEXT,               -- 'clean', 'salvage', 'flood', from NMVTIS
  nmvtis_checked_at  TIMESTAMPTZ,
  status             TEXT NOT NULL CHECK (status IN ('in_transit', 'reconditioning',
                       'available', 'on_hold', 'sold', 'delivered', 'wholesaled'))
);

CREATE TABLE deals (                     -- the deal structure around one order
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id         UUID NOT NULL UNIQUE REFERENCES orders (id),
  vehicle_id       UUID NOT NULL REFERENCES vehicles (id),
  kind             TEXT NOT NULL CHECK (kind IN ('cash', 'finance', 'lease')),
  offering_price   BIGINT NOT NULL,      -- every non-government charge included
  offering_price_disclosed_at TIMESTAMPTZ,  -- when the customer was shown it
  selling_price    BIGINT NOT NULL,
  down_payment     BIGINT NOT NULL DEFAULT 0,
  amount_financed  BIGINT,
  apr              NUMERIC(6, 4),
  term_months      SMALLINT,
  monthly_payment  BIGINT,
  total_of_payments BIGINT,              -- shown whenever a monthly payment is
  lender           TEXT,
  buy_rate         NUMERIC(6, 4),        -- the lender's rate; reserve is the spread
  salesperson_id   UUID,
  fi_manager_id    UUID,
  status           TEXT NOT NULL CHECK (status IN ('worksheet', 'credit_pending',
                     'approved', 'contracted', 'funded', 'unwound', 'cancelled')),
  CHECK (kind = 'cash' OR (amount_financed IS NOT NULL AND term_months IS NOT NULL)),
  CHECK (monthly_payment IS NULL OR total_of_payments IS NOT NULL)
);

CREATE TABLE trade_ins (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  deal_id         UUID NOT NULL REFERENCES deals (id),
  vin             CHAR(17) NOT NULL,
  odometer        INT NOT NULL,
  allowance       BIGINT NOT NULL,       -- credited to the deal
  payoff          BIGINT NOT NULL DEFAULT 0,  -- owed to the customer's lender
  payoff_lender   TEXT,
  vehicle_id      UUID REFERENCES vehicles (id)  -- once it enters inventory
);

CREATE TABLE fi_products (               -- the menu
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  kind          TEXT NOT NULL CHECK (kind IN ('service_contract', 'gap', 'maintenance',
                  'tire_wheel', 'appearance', 'theft', 'other')),
  provider      TEXT NOT NULL,
  name          TEXT NOT NULL,
  eligibility   JSONB NOT NULL,          -- e.g. {"powertrain": ["ice", "hybrid"], "max_ltv": 1.25}
  status        TEXT NOT NULL CHECK (status IN ('active', 'retired'))
);

CREATE TABLE deal_fi_products (          -- each add-on sold, with its consent
  deal_id        UUID NOT NULL REFERENCES deals (id),
  fi_product_id  UUID NOT NULL REFERENCES fi_products (id),
  price          BIGINT NOT NULL,
  cost           BIGINT NOT NULL,        -- confidential; the markup is price minus cost
  presented_by   UUID NOT NULL,          -- staff
  presented_at   TIMESTAMPTZ NOT NULL,   -- after the offering price was disclosed
  consent        JSONB NOT NULL,         -- method, signature reference, the text shown
  financed       BOOLEAN NOT NULL,
  PRIMARY KEY (deal_id, fi_product_id)
);

CREATE TABLE vehicle_documents (         -- Monroney, Buyers Guide, odometer statement, contract
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles (id),
  deal_id      UUID REFERENCES deals (id),
  kind         TEXT NOT NULL CHECK (kind IN ('monroney', 'buyers_guide', 'buyers_guide_es',
                 'odometer_disclosure', 'retail_installment_contract', 'lease_agreement',
                 'bill_of_sale', 'recall_disclosure')),
  version      INT NOT NULL,
  document_id  UUID NOT NULL REFERENCES documents (id),
  displayed_from TIMESTAMPTZ,            -- a Buyers Guide on the window from this moment
  signed_at    TIMESTAMPTZ,
  UNIQUE (vehicle_id, kind, version)
);

CREATE TABLE title_registrations (       -- the state work after the sale
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  deal_id          UUID NOT NULL REFERENCES deals (id),
  state            TEXT NOT NULL,        -- 'US-TX'
  temp_tag_number  TEXT,
  temp_tag_expires_on DATE,
  lienholder       TEXT,
  submitted_via    TEXT CHECK (submitted_via IN ('state_portal', 'elt', 'registration_service',
                     'paper')),
  submitted_at     TIMESTAMPTZ,
  due_on           DATE NOT NULL,        -- the state's deadline from the sale date
  title_number     TEXT,
  status           TEXT NOT NULL CHECK (status IN ('collecting', 'submitted', 'rejected',
                     'issued', 'lien_recorded'))
);

-- Deals where a monthly payment was shown without the total, or an add-on was
-- presented before the offering price: the CARS-style checks, run nightly.
SELECT d.id, d.order_id
FROM deals d
LEFT JOIN deal_fi_products p ON p.deal_id = d.id
WHERE (d.monthly_payment IS NOT NULL AND d.total_of_payments IS NULL)
   OR d.offering_price_disclosed_at IS NULL
   OR p.presented_at < d.offering_price_disclosed_at;
```

Design notes:

- **A vehicle is an item with a VIN.** Each vehicle is its own `items` row (quantity one) and a `vehicles` row with the VIN and condition, so the catalog, listings and orders work as everywhere else. It's retail inventory, unrelated to the Field Operations volume's fleet [`vehicles`](/books/field-operations/fleet-and-safety#how-to-build-it); a platform hosting both namespaces them.
- **The deal holds the arithmetic.** Offering price, selling price, amount financed, APR, term, payment and total of payments are stored together, computed by one function the worksheet, the website and the contract all call, so a payment can never be shown without the total it implies.
- **Every add-on has its own consent.** `deal_fi_products` records who presented it, when (relative to the price disclosure) and how the customer agreed, which is the evidence an FTC or state inquiry asks for.
- **Eligibility rules block useless products.** A product's eligibility is data (powertrain, loan-to-value, mileage), checked before it can be added to a deal ([Rules as Data](/docs/architecture/rules-as-data)).
- **Documents are versioned and timed.** The Buyers Guide displayed on the vehicle and the one in the deal jacket must match; the odometer disclosure is signed electronically with the creation, signing and access logging the federal rule requires ([Electronic Signatures](/docs/compliance/electronic-signatures), [Audit Trails](/docs/architecture/audit-trails)).
- **Title work is a fulfillment with a deadline.** `due_on` comes from the state's rule and temporary tags expire; both are monitored.

## Auditing

- **Every deal's full structure** at contract: prices, fees, trade, financing terms, each add-on with its consent, and every earlier worksheet version shown to the customer.
- **Every F&I presentation:** what was offered, in what order, at what price, and what was declined.
- **Every vehicle document** with its version, display time and signature, including Buyers Guides and odometer disclosures.
- **Recall and NMVTIS checks** per vehicle, with the time and result, before listing and before sale.
- **Title and registration progress** per deal against the state deadline, and every temporary tag issued.
- **Advertised prices** against offering prices, for every vehicle listing ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).

## What This Means for the System You Build

- **Model each vehicle as a serialized item with a VIN,** condition, odometer, title brand and open recalls.
- **Keep the deal's arithmetic in one function** and store offering price, payment and total of payments together.
- **Record every add-on's presentation and consent separately,** and block products the vehicle or loan makes useless.
- **Treat the vacated CARS Rule as the working specification,** because section 5 and state law still reach the same conduct.
- **Generate the Monroney label, Buyers Guide and odometer disclosure from the vehicle record** as versioned, signed documents.
- **Track title and registration as a fulfillment** with state deadlines.
- **Treat the DMS as the system of record** and design integrations to survive it being down.

## References

**Filings and companies**

- [CDK Global: Form 8-K on completion of the Brookfield acquisition (July 2022)](https://www.sec.gov/Archives/edgar/data/1609702/000110465922077726/tm2220236d3_8k.htm), the merger and $54.87 per share
- [CDK Global: Press release, Exhibit 99.1 (May 2022)](https://www.sec.gov/Archives/edgar/data/1609702/000110465922055574/tm2213228d3_ex99-1.htm), over 15,000 retail locations in North America
- [AutoNation: Form 8-K (June 19, 2024 event)](https://www.sec.gov/Archives/edgar/data/350698/000035069824000078/an-20240619.htm), the CDK cyber incident and manual operations
- [AutoNation: Form 8-K (July 15, 2024)](https://www.sec.gov/Archives/edgar/data/350698/000035069824000085/an-20240715.htm), the estimated $1.50 per share impact and restoration
- [Tekion](https://tekion.com/), its product clouds and dealership and transaction claims
- [Cox Automotive: About us](https://www.coxautoinc.com/about-us/), its brands including Dealertrack, vAuto, VinSolutions and Xtime
- [Carvana: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1690820/000169082026000009/cvna-20251231.htm), retail units, revenue, vending machines, logistics reach, ADESA and loan sales
- [CarMax: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1170010/000117001026000021/kmx-20260228.htm), stores, retail units, digital usage and CAF's share

**FTC and courts**

- [FTC: FTC announces CARS Rule (December 12, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/12/ftc-announces-cars-rule-fight-scams-vehicle-shopping), the rule's requirements and July 30, 2024 effective date
- [National Automobile Dealers Association v. FTC, No. 24-60013 (5th Cir. 2025)](https://www.ca5.uscourts.gov/opinions/pub/24/24-60013-CV0.pdf), the vacatur for failing to issue an advance notice
- [FTC: Automobile industry pricing transparency FAQs](https://www.ftc.gov/business-guidance/resources/automobile-industry-pricing-transparency-faqs), section 5 after the vacatur
- [FTC: Leader Automotive Group case page](https://www.ftc.gov/legal-library/browse/cases-proceedings/2323004-leader-automotive-group-et-al-ftc-state-illinois-v), the allegations and $20 million settlement
- [FTC: Asbury Automotive Group case page](https://www.ftc.gov/legal-library/browse/cases-proceedings/222-3135-asbury-automotive-group-inc-et-al-matter), the complaint and the October 5, 2026 dismissal
- [FTC: Auto cases and proceedings](https://www.ftc.gov/legal-library/browse/cases-proceedings?sort_by=field_date&field_industry=1382), the docket of recent dealer matters
- [FTC: Dealer's guide to the Used Car Rule](https://www.ftc.gov/business-guidance/resources/dealers-guide-used-car-rule), Buyers Guide versions, the Spanish guide, contract terms and penalties

**Law**

- [12 U.S.C. 5519 (Cornell LII)](https://www.law.cornell.edu/uscode/text/12/5519), the CFPB's exclusion for motor vehicle dealers and its exceptions
- [12 CFR 1026.18 (CFPB)](https://www.consumerfinance.gov/rules-policy/regulations/1026/18/), closed-end credit disclosures
- [12 CFR 1013.2 (CFPB)](https://www.consumerfinance.gov/rules-policy/regulations/1013/2/), the consumer lease definition and the 2026 threshold
- [16 CFR 455.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/16/455.1), the used car dealer definition
- [16 CFR 455.2 (Cornell LII)](https://www.law.cornell.edu/cfr/text/16/455.2), displaying the Buyers Guide
- [49 U.S.C. 32705 (Cornell LII)](https://www.law.cornell.edu/uscode/text/49/32705), odometer disclosure on transfer and electronic disclosure
- [49 CFR 580.4 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/580.4), security and logging for electronic titles and odometer disclosures
- [15 U.S.C. 1232 (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/1232), the Monroney label contents
- [49 U.S.C. 30120 (Cornell LII)](https://www.law.cornell.edu/uscode/text/49/30120), the ban on selling new vehicles with open recalls in subsection (i)
- [NMVTIS: Vehicle history](https://vehiclehistory.bja.ojp.gov/), the National Motor Vehicle Title Information System
</content>
</invoke>
