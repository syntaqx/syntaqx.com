+++
title = "Product Safety, Compliance & Recalls"
nav_title = "Product Safety & Recalls"
description = "CPSC, CPSIA testing and certificates, eFiling, 15(b) reports, recalls and marketplaces, FDA cosmetics and supplements, and the EU GPSR, with the schema."
category = "Commerce Industry"
order = 2351
part = "Regulated Goods"
tags = ["commerce", "product-safety", "recalls", "cpsc", "compliance", "fda"]
+++

A product that hurts someone becomes a records problem within a day. The manufacturer, the importer, the distributor and the retailer each have a legal duty to tell the Consumer Product Safety Commission within 24 hours of learning enough to believe it could create a substantial hazard; then someone has to know who bought it, where the remaining units are, which lots are affected and how to reach every buyer; then the recall has to stop sales everywhere at once, on the website, in the stores, on Amazon and in the warehouse. Before any of that, a children's product can't have been imported or sold at all without third-party testing and a certificate, and since July 2026 the certificate data goes to customs electronically with the import entry.

This chapter covers the CPSC and who it reaches, CPSIA limits, testing and certificates, eFiling, product-specific rules, the duty to report, recalls and how marketplaces handle them, FDA-regulated consumer goods (cosmetics under MoCRA and dietary supplements), and the EU's General Product Safety Regulation. It extends `items` and `documents` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model), lots and quarantine from [Inventory](/books/commerce/inventory#lots-serials-expiry-and-kits), and the product-page warnings in [Required Disclosures](/books/commerce/product-information#required-disclosures). Hazmat and Prop 65 are [Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat); vehicle recalls are [Automotive Retail](/books/commerce/automotive-retail#disclosures-on-the-vehicle).

## How the Regulators Do It

As of October 2026:

| Regulator | Products | What it requires of sellers |
| --- | --- | --- |
| **CPSC** | Consumer products: toys, children's products, furniture, appliances, e-bikes, most household goods | Certificates of compliance, third-party testing for children's products, eFiling at import, reporting within 24 hours, recalls |
| **FDA (cosmetics)** | Cosmetics under the Modernization of Cosmetics Regulation Act of 2022 | Facility registration, product listing, adverse event reports within 15 business days, safety substantiation; FDA can order a recall |
| **FDA (supplements)** | Dietary supplements under DSHEA | No premarket approval; new dietary ingredient notices 75 days ahead; the structure/function disclaimer; serious adverse event reports within 15 business days; cGMP |
| **EU market surveillance authorities** | Consumer products in the EU and Northern Ireland under Regulation (EU) 2023/988 | A responsible economic operator in the EU, technical documentation for 10 years, accident notifications, marketplace registration with Safety Gate |

Three patterns:

- **Everyone in the chain is responsible.** CPSC's reporting duty applies to any "manufacturer, importer, distributor, and/or retailer of consumer products"; the EU names a fallback order of responsible operators. A retailer can't treat safety as the brand's problem.
- **The certificate travels with the goods.** A children's product certificate, an EU technical file and a cosmetics listing are documents attached to a product and a lot, and the seller must produce them on request.
- **Recalls are a data problem.** Every regime ends in finding buyers, stopping sales and accounting for units, which is what order, inventory and customer records are for.

## The CPSC and Who It Covers

The Consumer Product Safety Commission enforces the Consumer Product Safety Act and related laws, including the Consumer Product Safety Improvement Act of 2008 (CPSIA). Its rules reach anyone who makes, imports, distributes or sells a consumer product in the US, which is why a marketplace seller importing from overseas is an importer with the same duties as a large brand.

The agency itself changed in 2025 and 2026. In Trump v. Boyle (July 23, 2025) the Supreme Court stayed a district court order reinstating commissioners the President had removed, saying the case was controlled by Trump v. Wilcox and that the CPSC exercises executive power. In Trump v. Slaughter (June 29, 2026) the Court held 6 to 3 that the FTC commissioners' for-cause removal protection was unconstitutional and that Humphrey's Executor, to the extent anything of it remains, is overruled; the CPSC's protection is worded the same way. As of October 2026 the CPSC's commissioners page lists two commissioners appointed in 2026 and an acting chairman. None of this changed the rules sellers follow; it changes who decides how hard they're enforced.

## CPSIA: Limits and Testing

CPSIA set content limits for children's products and made testing mandatory:

- **Lead.** Children's products may contain no more than 100 parts per million of lead in accessible parts (since August 14, 2011); paint and surface coatings no more than 0.009% (90 ppm) (15 U.S.C. 1278a).
- **Phthalates.** Children's toys and child care articles may not contain more than 0.1% of any of eight phthalates (DEHP, DBP, BBP, DINP, DIBP, DPENP, DHEXP, DCHP) in plasticized components (16 CFR 1307.3).
- **Third-party testing.** A children's product subject to a children's product safety rule must be tested by a CPSC-accepted third-party laboratory before it's imported or distributed (15 U.S.C. 2063(a)(2)).
- **Tracking labels.** Children's products need permanent marks on the product and its packaging that identify the manufacturer, the location and date of production and the batch (2063(a)(5)), which is what makes a lot-level recall possible.

Other products subject to a CPSC rule need a certificate based on testing each product or "a reasonable testing program," but not necessarily a third-party lab (2063(a)(1)).

## Certificates and eFiling

Two certificates, and since 2026, electronic filing:

- **General Certificate of Conformity (GCC).** For non-children's products subject to a CPSC rule, issued by the manufacturer or importer.
- **Children's Product Certificate (CPC).** For children's products, by the domestic manufacturer or importer, in English, with seven elements: the product's identification, each rule it's certified to, the certifier's name, address and phone, the contact for test records, the date and place of manufacture, the date and place of testing, and the CPSC-accepted lab that tested it.
- **eFiling.** CPSC's certificates final rule (published January 8, 2025) revised 16 CFR part 1110 and requires certificate data to be filed electronically with CBP at entry: effective July 8, 2026 for most products and January 8, 2027 for products entered from a foreign trade zone. A September 2025 correction confirmed the dates; no delay had been published as of October 2026.

For an importer, eFiling turns the certificate from a PDF in a drawer into data that must exist before the goods clear customs: which rules apply to the product, which lab tested which lot, and when. That's a catalog and purchasing problem, not a shipping one: the certificate data has to be ready when the purchase order ships from the factory ([Customs Entry and Duties](/books/commerce/cross-border-commerce#customs-entry-and-duties)).

## Product-Specific Rules

Many products have their own mandatory standards, and a few recent ones show the range:

- **Button and coin batteries (Reese's Law).** Consumer products containing button or coin batteries must meet ANSI/UL 4200A, which covers securing the battery compartment and warnings, with packaging labeling requirements (16 CFR 1263).
- **Clothing storage units (STURDY Act).** Dressers and similar furniture must meet ASTM F2057-23 for tip-over stability, adopted by CPSC in May 2023.
- **Magnets.** Loose or separable magnets small enough to fit in the small parts cylinder are limited by flux index (final rule September 2022).
- **Micromobility batteries.** On June 24, 2026 CPSC proposed requiring e-bike and e-scooter electrical systems to meet "applicable voluntary standards, with modifications," and adding children's micromobility products to third-party testing; comments closed August 24, 2026.

The catalog consequence is that each item's applicable rules are data, attached to its product category and attributes (age grade, contains a button battery, is a clothing storage unit), and the certificate must cite each of them.

## Reporting: Section 15(b)

Section 15(b) of the Consumer Product Safety Act requires firms to report to CPSC when they obtain information that reasonably supports the conclusion that a product contains a defect that could create a substantial product hazard, creates an unreasonable risk of serious injury or death, or fails a mandatory standard. The timing is strict: "Immediately, that is, within 24 hours, after a subject firm has obtained information" supporting that conclusion, and an investigation to decide whether to report "should not exceed 10 days" unless a longer period is reasonable (16 CFR 1115.14). CPSC warns that "Failure to fully and immediately report this information may lead to substantial civil or criminal penalties"; the maximum civil penalties, last adjusted in December 2021, are $120,000 per violation and $17,150,000 for a related series.

For a retailer or a brand, the inputs to that decision arrive through ordinary channels: customer service tickets, returns with a reason like "overheated," product reviews, chargebacks and social posts. A system that routes safety-relevant reports into one queue, with the time each was received, is what lets a firm show when it knew (`safety_incidents` in [How to Build It](#how-to-build-it)).

## Recalls

A recall, usually negotiated with CPSC as a corrective action plan (often through its Fast Track program for firms that report and propose a remedy quickly), has the same steps for every seller:

1. **Scope.** Which products, which lots or date codes, which units: the tracking label data and inventory lots decide it ([Lots, Serials, Expiry and Kits](/books/commerce/inventory#lots-serials-expiry-and-kits)).
2. **Stop sale.** Every channel at once: listings suspended on the site and marketplaces, store POS blocking the items or lots at the register, warehouse and 3PL stock moved to an unsellable recall bucket, open orders held before they ship.
3. **Find the buyers.** Orders with the affected items, with contact details and ship-to addresses; store sales where a loyalty account or digital receipt links a customer ([Receipts and Privacy](/books/commerce/point-of-sale#receipts-and-privacy)).
4. **Notify.** Direct notice to every known buyer, the public recall notice, and notices to retail and marketplace partners, each send recorded.
5. **Remedy.** Refund, repair or replacement, with a return method that is lawful for the product (a recalled lithium battery can't go back by mail ([Lithium Batteries](/books/commerce/pesticides-chemicals-and-hazmat#lithium-batteries))).
6. **Account for units.** Units sold, returned, destroyed, repaired and unaccounted for, reported to CPSC in progress reports until the recall closes; returned units are destroyed or reworked, never restocked ([Disposition](/books/commerce/returns-and-exchanges#disposition)).

The customer data needed for step 3 is one of the few cases where a merchant needs purchase history it would otherwise minimize, so the retention schedule for orders of recall-prone categories should account for it ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type), [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts)).

## Marketplaces and Recalls

Who must run a recall when a marketplace's third-party seller sold the product is a live question. In 2024 CPSC decided that Amazon is a "distributor" under federal safety law for products sold by third parties through Fulfilled by Amazon and must take recall responsibilities for them; the decision's text and the status of Amazon's challenge weren't retrievable for this chapter. <!-- source-gap: cpsc-v-amazon | missing | the CPSC's 2024 final decision and order that Amazon is a distributor of FBA products, its required remedies, and the status of Amazon's court challenge as of 2026 | closes with: the decision and order on CPSC's docket and the court docket for Amazon's suit | checked: 2026-10-28 -->

In the EU, the obligation is written into the GPSR: online marketplaces must register with the Safety Gate portal with a single point of contact, designate a consumer contact point, and cooperate so that "consumers affected by a product recall are notified."

For a marketplace operator, that means the recall tooling has to work across sellers: matching recalled products to listings by identifiers and attributes, suspending them, and notifying the buyers it has on record, whether or not the seller cooperates. The later Running Your Own Marketplace chapter covers the operator's broader duties.

## FDA-Regulated Goods

### Cosmetics Under MoCRA

The Modernization of Cosmetics Regulation Act of 2022 gave FDA its first broad cosmetics powers:

- **Facility registration and product listing.** Due within a year of December 29, 2022 (FDA set a later enforcement date), with registration renewed every two years and listings updated annually, through FDA's Cosmetics Direct portal (21 U.S.C. 364c).
- **Adverse event reports.** A serious adverse event report to FDA "no later than 15 business days after the report is received," with records kept six years (three for certain small businesses); reports reach the company through "the domestic address, domestic telephone number, or electronic contact information included on the label" (21 U.S.C. 364a), so the label must carry a US contact.
- **Safety substantiation.** The responsible person must keep records substantiating safety; MoCRA doesn't require specific tests or animal testing.
- **Mandatory recall.** Where there's a "reasonable probability" that a cosmetic is adulterated or misbranded and use "will cause serious adverse health consequences or death," FDA can order a recall after giving the company a chance to "voluntarily cease distribution and recall" (21 U.S.C. 364g).
- **Still pending as of October 2026:** good manufacturing practice rules (draft guidance only), fragrance allergen labeling, and talc testing, per FDA's MoCRA page. Small businesses are exempt from GMP and registration and listing, except for products like eye-area, injected, internal-use or long-wear products.

<!-- source-gap: mocra-listing-enforcement-date | missing | FDA's enforcement date for MoCRA registration and listing (reported as July 1, 2024) | closes with: FDA's June 2024 announcement text | checked: 2026-10-28 -->

### Dietary Supplements

Supplements reach the market without FDA approval, under the Dietary Supplement Health and Education Act's framework:

- **New dietary ingredients.** An ingredient "not marketed in the United States before October 15, 1994" needs a notification to FDA "at least 75 days before being introduced or delivered for introduction into interstate commerce" (21 U.S.C. 350b).
- **Structure/function claims.** A claim about how a product affects the body's structure or function needs, "prominently displayed and in boldface type," the disclaimer "This statement has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease," and FDA must be notified within 30 days of first marketing the claim (21 U.S.C. 343(r)(6)). The disclaimer belongs on the product page wherever the claim appears, as a typed disclosure ([Required Disclosures](/books/commerce/product-information#required-disclosures)).
- **Serious adverse events.** Reported "no later than 15 business days after the report is received," with follow-up within 15 business days for a year and records kept six years (21 U.S.C. 379aa-1).
- **Manufacturing practice.** cGMP applies "if you manufacture, package, label, or hold a dietary supplement"; a retailer holding products only for direct sale to consumers is exempt, but a warehouse isn't (21 CFR 111.1), which brings a brand's 3PL into scope.

THC and CBD can't be sold as supplements at all ([Cannabis & Hemp](/books/commerce/cannabis-and-hemp#hemp-before-and-after-the-redefinition)).

## The EU General Product Safety Regulation

Regulation (EU) 2023/988 applies from December 13, 2024 to consumer products in the EU and Northern Ireland (Great Britain keeps its own 2005 regulations). Its main seller duties, per the UK government's guidance for Northern Ireland:

- **A responsible economic operator in the EU.** A product may be placed on the market only if "there is a responsible economic operator established in either NI or the EU," in the order: manufacturer, authorized representative, importer, fulfillment service provider. For a US brand selling direct to EU consumers, that's usually an authorized representative it appoints, or its fulfillment provider.
- **Documentation for 10 years.** Technical documentation kept "at the disposal of MSAs for a period of 10 years."
- **Accident and dangerous product notices.** Manufacturers that believe a product is dangerous inform the market surveillance authorities through the Safety Business Gateway.
- **Marketplace duties.** Registration with Safety Gate, a consumer contact point, and cooperation on recall notifications.
- **Information in the online offer.** The listing must show the manufacturer, the responsible person in the EU where relevant, product identification and warnings ([Required Disclosures](/books/commerce/product-information#required-disclosures) has the shape and its source gap).

## How to Build It

This chapter adds certificates and the rules they cite, recalls with their scope and progress, recall notifications, safety incidents, and regulatory listings:

```sql
CREATE TABLE safety_rules (              -- a mandatory standard or limit
  code          TEXT PRIMARY KEY,        -- '16 CFR 1307', '16 CFR 1263', 'ASTM F2057-23'
  regime        TEXT NOT NULL CHECK (regime IN ('cpsc', 'fda', 'eu_gpsr', 'other')),
  name          TEXT NOT NULL,
  third_party_testing BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE item_safety_rules (         -- which rules an item must meet
  item_id    UUID NOT NULL REFERENCES items (id),
  rule_code  TEXT NOT NULL REFERENCES safety_rules (code),
  reason     TEXT NOT NULL,              -- 'age_grade_under_12', 'contains_button_battery'
  PRIMARY KEY (item_id, rule_code)
);

CREATE TABLE certificates (              -- a GCC, CPC or EU declaration for an item and lot
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id           UUID NOT NULL REFERENCES items (id),
  kind              TEXT NOT NULL CHECK (kind IN ('gcc', 'cpc', 'eu_doc', 'test_report')),
  lot               TEXT,                -- the batch or date code it covers; null: all
  rules_cited       TEXT[] NOT NULL,     -- safety_rules codes
  certifier         JSONB NOT NULL,      -- name, address, phone
  records_contact   JSONB NOT NULL,
  manufactured      JSONB NOT NULL,      -- date and place
  tested            JSONB,               -- date, place and lab (CPSC lab ID for a CPC)
  efiling_ref       TEXT,                -- the registry or entry reference, once filed
  document_id       UUID NOT NULL REFERENCES documents (id),
  issued_on         DATE NOT NULL,
  superseded_by     UUID REFERENCES certificates (id)
);

CREATE TABLE regulatory_listings (       -- FDA cosmetics listings, facility registrations, EU RP
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id       UUID REFERENCES items (id),  -- null: a facility registration
  kind          TEXT NOT NULL CHECK (kind IN ('fda_cosmetic_listing', 'fda_facility_registration',
                  'fda_ndi_notification', 'fda_structure_function_notice',
                  'eu_responsible_person')),
  reference     TEXT NOT NULL,           -- the agency's number or the operator's details
  valid_during  DATERANGE NOT NULL,
  next_due_on   DATE                     -- renewal or annual update
);

CREATE TABLE safety_incidents (          -- a report that may bear on a product's safety
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID REFERENCES items (id),
  lot              TEXT,
  source           TEXT NOT NULL CHECK (source IN ('ticket', 'return', 'review',
                     'chargeback', 'retailer', 'regulator', 'social', 'lawsuit')),
  source_ref       TEXT NOT NULL,        -- the ticket, return or review ID
  injury           TEXT CHECK (injury IN ('none', 'minor', 'serious', 'death', 'unknown')),
  description      TEXT NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL, -- when the firm obtained it: the clock starts here
  assessed_at      TIMESTAMPTZ,
  decision         TEXT CHECK (decision IN ('not_reportable', 'report_15b',
                     'report_fda_adverse_event', 'report_eu', 'monitoring')),
  report_due_at    TIMESTAMPTZ,          -- 24 hours, or 15 business days for FDA
  reported_at      TIMESTAMPTZ,
  regulator_ref    TEXT
);

CREATE TABLE recalls (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  regulator       TEXT NOT NULL,         -- 'cpsc', 'fda', 'nhtsa', an EU MSA
  regulator_ref   TEXT,                  -- the recall number
  hazard          TEXT NOT NULL,
  remedy          TEXT NOT NULL CHECK (remedy IN ('refund', 'repair', 'replace',
                    'dispose')),
  return_method   TEXT,                  -- prepaid label, drop-off, destroy in place
  announced_at    TIMESTAMPTZ,
  status          TEXT NOT NULL CHECK (status IN ('draft', 'active', 'monitoring',
                    'closed'))
);

CREATE TABLE recall_items (              -- scope: items and lots
  recall_id   UUID NOT NULL REFERENCES recalls (id),
  item_id     UUID NOT NULL REFERENCES items (id),
  lots        TEXT[],                    -- null: every lot
  units_in_scope INT,
  PRIMARY KEY (recall_id, item_id)
);

CREATE TABLE recall_notifications (      -- each notice sent to a buyer or partner
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  recall_id     UUID NOT NULL REFERENCES recalls (id),
  order_line_id UUID REFERENCES order_lines (id),
  customer_id   UUID REFERENCES customers (id),
  partner       TEXT,                    -- a retailer or marketplace, for partner notices
  channel       TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'mail', 'phone', 'in_app',
                  'partner_portal')),
  sent_at       TIMESTAMPTZ NOT NULL,
  delivery_status TEXT,
  responded_at  TIMESTAMPTZ              -- the buyer claimed the remedy
);

-- Who bought a recalled item and lot, and hasn't been notified yet.
SELECT ol.id AS order_line_id, o.customer_id, o.placed_at, ol.quantity
FROM recall_items ri
JOIN order_lines ol ON ol.item_id = ri.item_id
JOIN orders o ON o.id = ol.order_id
LEFT JOIN fulfillment_lines fl ON fl.order_line_id = ol.id
LEFT JOIN inventory_movements m ON m.source_kind = 'fulfillment'
       AND m.source_id = fl.fulfillment_id AND m.item_id = ol.item_id
WHERE ri.recall_id = $1
  AND (ri.lots IS NULL OR m.lot = ANY (ri.lots))
  AND NOT EXISTS (SELECT 1 FROM recall_notifications n
                  WHERE n.recall_id = ri.recall_id AND n.order_line_id = ol.id);
```

Design notes:

- **Rules attach to items, certificates cite rules.** A certificate that doesn't cite every rule in `item_safety_rules` is incomplete, which is a check the purchasing flow runs before a shipment leaves the factory and eFiling needs the data.
- **Lots are what make recalls narrow.** Without the lot on the shipped movement, a recall's scope is every unit ever sold; with it, it's the affected lots ([Movements, Not Overwrites](/books/commerce/inventory#movements-not-overwrites)). Store lots on receipts and picks for any category that can be recalled.
- **The report clock starts at receipt.** `safety_incidents.received_at` is when the firm obtained the information, and `report_due_at` is computed from the regime (24 hours for CPSC once the conclusion is supported, 15 business days for FDA adverse events) ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Stop sale is one action across channels.** A recall's activation suspends listings through the channel integrations, pushes a POS block for the items and lots, moves on-hand units to the unsellable recall bucket and places holds on open orders, as one job with a result per channel ([Order Holds](/books/commerce/order-management)).
- **Notifications are per order line.** A buyer of two affected items gets one message, but each line records that it was covered, so the progress report's "notified" count is exact.

## Auditing

- **Every certificate and test report** per item and lot, with the rules cited and the eFiling reference, kept for as long as the regulator can ask.
- **Every safety incident** from receipt to decision, with the time it was received, who assessed it, the decision and, if reported, when, so the 24-hour question has an answer.
- **Every recall's progress:** scope, stop-sale results per channel, notices sent, remedies claimed, units returned, destroyed or unaccounted for.
- **FDA registrations, listings and notices** with their renewal dates.
- **Retention long enough for recalls:** order and customer contact records for recall-prone categories kept for the period the merchant's retention schedule sets for them ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Attach applicable safety rules to items** from their category and attributes, and require certificates that cite every rule before goods ship from the factory.
- **Record lots on receipt and on every shipped unit** for anything that can be recalled.
- **Route safety-relevant signals into one incident queue** with the time received and a computed reporting deadline.
- **Build stop-sale as one action** that reaches every channel, store and warehouse, with a result for each.
- **Notify every known buyer per order line** and track remedies and units to closure.
- **Keep FDA cosmetics and supplement obligations as listings and notices with due dates,** and the supplement disclaimer as a typed disclosure.
- **Name an EU responsible operator** before selling into the EU, and keep the technical file for 10 years.

## References

**CPSC**

- [15 U.S.C. 1278a (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/1278a), lead limits for children's products and paint
- [15 U.S.C. 2057c (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/2057c), the statutory phthalates ban
- [16 CFR 1307.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/16/1307.3), the eight phthalates at 0.1%
- [15 U.S.C. 2063 (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/2063), certificates, third-party testing and tracking labels
- [CPSC: Children's Product Certificate](https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/Childrens-Product-Certificate-CPC), the seven required elements
- [Federal Register: Certificates of compliance final rule (January 8, 2025)](https://www.federalregister.gov/api/v1/documents/2024-30826.json), eFiling and its July 8, 2026 and January 8, 2027 dates
- [Federal Register: Certificates of compliance correction (September 24, 2025)](https://www.federalregister.gov/api/v1/documents/2025-18521.json), the effective and applicability dates
- [16 CFR 1115.14 (Cornell LII)](https://www.law.cornell.edu/cfr/text/16/1115.14), reporting within 24 hours and the 10-day investigation
- [CPSC: Duty to report](https://www.cpsc.gov/Business--Manufacturing/Recall-Guidance/Duty-to-Report-to-the-CPSC-Your-Rights-and-Responsibilities), who must report, penalties and Fast Track
- [Federal Register: CPSC civil penalties, adjusted maximum amounts (December 1, 2021)](https://www.federalregister.gov/documents/2021/12/01/2021-26082/civil-penalties-notice-of-adjusted-maximum-amounts), $120,000 and $17,150,000
- [16 CFR 1263.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/16/1263.3), button and coin batteries and ANSI/UL 4200A
- [Federal Register API: CPSC rules listing](https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=consumer-product-safety-commission&conditions[term]=%22Certificates%20of%20Compliance%22&conditions[type][]=RULE&order=newest&per_page=10), the 2023 clothing storage unit rule and the 2022 magnets rule
- [Federal Register: CPSC micromobility proposed rule (June 24, 2026)](https://www.federalregister.gov/api/v1/documents/2026-12749.json), e-bike and e-scooter electrical systems
- [CPSC: Commissioners](https://www.cpsc.gov/About-CPSC/Commissioners), the commission as of October 2026
- [Trump v. Boyle, No. 25A11 (2025) (Cornell LII)](https://www.law.cornell.edu/supremecourt/text/25A11), the stay of the CPSC commissioners' reinstatement
- [Trump v. Slaughter, No. 25-332 (2026) (Cornell LII)](https://www.law.cornell.edu/supremecourt/text/25-332), removal protection for FTC commissioners held unconstitutional

**FDA**

- [21 U.S.C. 364c (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/364c), cosmetics facility registration and product listing
- [FDA: Registration and listing of cosmetic product facilities and products](https://www.fda.gov/cosmetics/registration-listing-cosmetic-product-facilities-and-products), Cosmetics Direct and biennial renewal
- [21 U.S.C. 364a (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/364a), cosmetics serious adverse event reports
- [21 U.S.C. 364g (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/364g), FDA's mandatory cosmetics recall authority
- [FDA: Modernization of Cosmetics Regulation Act of 2022](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/modernization-cosmetics-regulation-act-2022-mocra), safety substantiation, pending rules and small business exemptions
- [21 U.S.C. 350b (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/350b), new dietary ingredients and the 75-day notice
- [21 U.S.C. 343 (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/343), the structure/function disclaimer and 30-day notice in (r)(6)
- [21 U.S.C. 379aa-1 (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/379aa-1), supplement serious adverse event reports
- [21 CFR 111.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/111.1), who cGMP applies to

**EU and UK**

- [GOV.UK: General product safety regulations in Northern Ireland](https://www.gov.uk/api/content/government/publications/general-product-safety-regulations-northern-ireland), GPSR's application from December 13, 2024
- [GOV.UK: EU Regulation 2023/988 on general product safety, detailed guidance](https://www.gov.uk/government/publications/general-product-safety-regulations-northern-ireland/eu-regulation-2023988-on-general-product-safety-detailed-guidance), the responsible economic operator, 10-year documentation, notifications and marketplace duties
</content>
</invoke>
