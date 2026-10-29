+++
title = "Cannabis & Hemp"
description = "Cannabis and hemp commerce as of October 2026: seed-to-sale tracking with Metrc and BioTrack, dispensary limits, banking, rescheduling, the hemp redefinition."
category = "Commerce Industry"
order = 2349
part = "Regulated Goods"
tags = ["commerce", "cannabis", "hemp", "seed-to-sale", "compliance", "dispensaries"]
+++

Cannabis is the one product in this volume that is legal to sell in a state's stores and a federal crime everywhere at the same time. That contradiction shapes every system around it. States that allow it track every plant and package from seed to sale in a state-mandated system, so a dispensary's point of sale reports each sale to the state, often within hours. Federal law keeps banks and card networks at a distance, so dispensaries run on cash. And the line between legal hemp and controlled marijuana, which a 2018 law drew at the delta-9 THC content of the plant, moves on November 12, 2026, when a 2025 appropriations act redefines hemp and takes most intoxicating hemp-derived products off the federal market.

This chapter covers the federal status as of October 2026 (scheduling, the rescheduling process, tax and banking), state markets, seed-to-sale tracking with Metrc and BioTrack, the dispensary point of sale and purchase limits, banking and payments, and hemp before and after the redefinition. It extends `inventory_levels` and `orders` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model), the inventory ledger from [Inventory](/books/commerce/inventory#how-to-build-it), and the age checks from [Alcohol, Tobacco & Age-Restricted Goods](/books/commerce/age-restricted-goods#how-to-build-it). The register and its cash loop are [Point of Sale](/books/commerce/point-of-sale) and [Store Operations](/books/commerce/store-operations#cash-management-and-end-of-day). Federal and state cannabis law is moving faster than any other subject in this volume; every date below is as of October 28, 2026, and a seller needs counsel for each state it operates in.

## How the Platforms Do It

As of October 2026, from each company's public pages:

| System | Role | What it publishes |
| --- | --- | --- |
| **Metrc** | State-contracted seed-to-sale tracking | "Radio-frequency identification (RFID) technology ... to track and trace cannabis from seed to sale"; its partner menu lists 25 states plus DC, Guam and the US Virgin Islands, and a Colorado industrial hemp program; Colorado was first, in 2011 |
| **BioTrack** | Seed-to-sale software for governments and businesses | 12 government contracts; software active in 38 states plus Puerto Rico; more than 2,200 enterprise locations and $22 billion in processed sales |
| **Stripe** | Payments | Cannabis products, dispensaries and marijuana-marketed hydroponics prohibited; CBD with "only negligible amounts of THC, per local limits" restricted (approval needed); CBD over local limits and CBD edibles prohibited |
| **FDA** | Federal regulator of food and supplements | THC and CBD can't be added to food or sold as dietary supplements in interstate commerce |

Three patterns:

- **The state picks the tracking system.** A licensee doesn't choose Metrc; its state contracted it, and every licensed business in that state reports through it. A POS or ERP selling into cannabis integrates with whichever system each state chose, and in Metrc's case each state has its own API instance and its own rules on top.
- **The tracking system is the inventory of record.** A dispensary's own inventory count matters to it; the state's record of each tagged package is what the regulator audits. The two must agree, and when they don't, the state's is the one that matters.
- **Payments are the hard part.** Mainstream processors prohibit marijuana outright and restrict even hemp-derived CBD. A cannabis POS is built around cash, and its integrations are with tracking systems, not processors.

## Federal Status as of October 2026

**Marijuana is still in Schedule I.** The rescheduling process has moved in stages:

- **May 21, 2024:** DEA proposed moving marijuana from Schedule I to Schedule III, following HHS's finding that it has an accepted medical use. The proposal drew "nearly 43,000 public comments" and noted that marijuana would stay subject to the Controlled Substances Act's criminal prohibitions even in Schedule III.
- **December 18, 2025:** Executive Order 14370 directed the Attorney General to "take all necessary steps to complete the rulemaking process related to rescheduling marijuana to Schedule III of the CSA in the most expeditious manner in accordance with Federal law."
- **April 28, 2026:** DEA withdrew the 2024 hearing notice and noticed a new hearing beginning June 29, 2026. The same day, a final rule moved FDA-approved drug products containing marijuana to Schedule III and created an expedited DEA registration process for holders of state medical marijuana licenses.
- **May 4, 2026:** DEA separately listed hexahydrocannabinol (HHC) in Schedule I, noting it "was already controlled as a tetrahydrocannabinol."

As of October 28, 2026, no final rule moving marijuana generally to Schedule III has been published in the Federal Register. <!-- source-gap: rescheduling-hearing-outcome | status | the outcome of DEA's marijuana rescheduling hearing that began June 29, 2026, and any final rule (a Federal Register search of DEA documents on October 28, 2026 showed none) | closes with: a Federal Register final rule moving marijuana to Schedule III, or the administrative law judge's recommended decision on DEA's hearing docket | checked: 2026-10-28 -->

**Taxes follow the schedule.** Section 280E of the tax code allows "No deduction or credit" for amounts paid in a business trafficking in Schedule I or II controlled substances, so a state-licensed dispensary pays federal income tax on gross profit without deducting rent or wages. Moving marijuana to Schedule III would take it outside 280E; that's the largest financial consequence of rescheduling for a dispensary, and it won't apply until a final rule does.

**Banking runs on 2014 guidance.** FinCEN's guidance FIN-2014-G001 (February 14, 2014) lets banks serve marijuana-related businesses if they file suspicious activity reports labeled "Marijuana Limited," "Marijuana Priority" or "Marijuana Termination"; as of October 2026 it hasn't been rescinded. Federal legislation to protect banks serving state-legal cannabis businesses hasn't been enacted: in the 119th Congress it's the SAFE Banking Act of 2026 (S. 4942), introduced June 24, 2026 and referred to the Senate Banking Committee, with no further action as of October 2026.

## State Markets

States run cannabis as licensed markets with their own regulator, license types (cultivation, manufacturing, distribution, testing, retail, delivery), tracking system, testing rules, packaging and labeling rules, taxes and purchase limits. Executive Order 14370's findings count 40 states and DC with medical programs. California is a representative example of what a state asks of the software:

- **Ages.** Adult use at 21 and older; medicinal at 18 and older with a physician's recommendation.
- **Purchase limits per day.** An adult-use customer may buy at most 28.5 grams of non-concentrated cannabis, 8 grams of concentrate and six immature plants per day; a medicinal customer up to 8 ounces of dried flower and 12 immature plants, or more on a physician's recommendation; adult-use and medicinal limits can't be combined (4 CCR 15409).
- **Tracking within 24 hours.** Receipt, rejection, production, destruction, packaging, testing and sale "shall be recorded in the track and trace system within 24 hours of occurrence" (4 CCR 15049(b)).
- **Manifests for every transfer.** The shipping licensee prepares a manifest in the tracking system before the product moves, with estimated departure and arrival; the receiver records acceptance and must reject on a mismatch (4 CCR 15049.2).
- **Tags on everything.** Each harvest and manufactured batch gets a package tag recorded in the tracking system and affixed to the container, and other containers carry the unique ID (4 CCR 15048.5).

Other states' numbers differ, and the unit and the person matter. Illinois sets possession limits rather than a per-day purchase limit, different for residents (60 grams of flower, 10 grams of concentrate, 1,000 mg of THC in infused products) and nonresidents (30 grams, 5 grams, 500 mg), counts them cumulatively, and bars anyone from obtaining from a dispensary an amount that would put them over the limit (410 ILCS 705/10-10); so an Illinois point of sale needs the buyer's residency, not just their age. Reporting windows to state tracking systems differ too. The point for a system is that every one of those is a rule with a jurisdiction and an effective date, never a constant.

## Seed-to-Sale Tracking

Seed-to-sale tracking follows the product, not the order. A plant gets a tag when it's planted; a harvest becomes packages, each with a tag; packages are tested, transferred on manifests, repackaged and finally sold, and every step is an event the state records against the tag. Metrc's tags are RFID, so a package can be identified with a reader as well as by its printed ID.

Metrc's API (the California instance's documentation, version 2) shows the shape of what a licensee's systems exchange with the state: endpoint groups for Facilities, Employees, Items, Strains, Locations and Sublocations, Plants and Plant Batches, Harvests, Packages, Lab Tests, Processing Jobs, Transfers and Transporters, Patients and Patient Check Ins, Retail ID, Sales (receipts and deliveries), Tags, Units of Measure and Waste Methods. Authentication uses two keys: an "Integrator API Key" for the software vendor and a "User API Key" for the licensee, so every call is attributable to both the software and the business that made it.

What that means for a POS or ERP:

- **The package is the unit.** Retail inventory isn't "40 units of item X"; it's "package 1A4060300... with 40 units remaining," and a sale decrements a specific package. Two packages of the same product are tracked separately because they came from different harvests and tests.
- **Every sale is reported.** A sale goes to the state through the tracking system's sales endpoints (Metrc's Sales group covers receipts and deliveries) with the packages and quantities sold; the dispensary's own sale and the state's record are linked by the state's reference.
- **Reconcile against the state.** A daily job compares each package's quantity in the POS with Metrc's; a difference is an adjustment with a reason (waste, damage, a count error) that has to be reported too.
- **State bulletins change behavior.** Metrc publishes per-state bulletins that change workflows (California's 2025 and 2026 bulletins covered required lab test batches, auto-finalization, an industry sandbox and returning quantities to a source package). The integration has to track them; a sandbox is where to test before a change goes live.
- **The 24-hour clock is a deadline per event.** Where a state allows 24 hours, the sale must reach the tracking system within it even if the internet was down, so the POS queues reports locally and alerts on anything approaching the deadline.

BioTrack serves both as a business's software and as a state system in some jurisdictions; which states contract it as their system of record wasn't confirmed in the sources here, so integrations should be configured per state, not assumed.

## The Dispensary Point of Sale

A dispensary's register does everything a retail POS does and adds:

- **Check-in and ID.** A customer's government ID is checked at the door or the counter (and a patient's medical card or registry status), often scanned. Metrc's API has Patient Check Ins and Retail ID endpoint groups alongside sales.
- **Limits computed live.** The cart converts each product to its regulated category and equivalent weight (flower, concentrate, edibles by THC content, plants) and sums against the customer's limit for the period, including earlier purchases that day where the state counts per day. A cart that would exceed the limit can't be tendered.
- **Package selection.** Each line is sold from a specific tagged package, chosen by the budtender or by first-expiring rules.
- **Labels and packaging.** Products must already carry the state's required labels and packaging; the POS refuses a package whose item has no approved label on file.
- **Cash, mostly.** The tender mix is cash, sometimes debit through workarounds, rarely cards, and the drawer and safe loop is heavier than in any other retail ([Cash Management and End of Day](/books/commerce/store-operations#cash-management-and-end-of-day)).
- **Reporting.** Each sale is reported to the tracking system with its packages, and voids and returns are reported as adjustments.

Delivery, where states allow it, adds a manifest for the vehicle, an ID check at the door and limits on what a driver may carry, which makes it closer to the Field Operations volume's [Carrying Regulated Products](/books/field-operations/fleet-and-safety#carrying-regulated-products) than to a courier app.

## Banking and Payments

Without card networks, a dispensary's payments stack is cash plus whatever its bank and state allow. Cash in volume means safes, armored car pickups, deposit reconciliation and theft risk; it also means the business's records of cash are the only records. The design consequences:

- **The drawer ledger is the money ledger.** Every cash movement, drop and deposit is recorded with counts by denomination ([Store Operations](/books/commerce/store-operations#how-to-build-it)), because there's no processor settlement to reconcile against.
- **Bank reporting is the bank's, but the business supplies it.** A bank filing marijuana SARs under FinCEN's guidance asks its customers for detailed records of revenue, licenses and tracking data; a system that can export its tracking reconciliation and sales by day makes the account possible to keep.
- **Processors aren't interchangeable.** A cannabis merchant's payments integration is a specialist provider's, and the rest of the platform has to work without the usual card features (stored cards, online prepayment) where none is available.

## Hemp Before and After the Redefinition

**Until November 12, 2026,** hemp is cannabis with no more than 0.3% delta-9 THC on a dry weight basis, under the 2018 Farm Bill. That test counted only delta-9 THC, which let products made from hemp (delta-8 THC, THCA flower, hemp-derived delta-9 edibles under the dry weight limit) be sold outside state cannabis programs, in gas stations, smoke shops and online. FDA's position throughout has been that THC and CBD can't be added to food or sold as dietary supplements in interstate commerce: "it is a prohibited act to introduce or deliver for introduction into interstate commerce any food" with added THC or CBD.

**From November 12, 2026,** section 781 of Public Law 119-37 (the continuing appropriations act enacted November 12, 2025, effective "365 days after the enactment") rewrites the definition in 7 U.S.C. 1639o:

- **Total THC.** Hemp is cannabis "with a total tetrahydrocannabinols concentration (including tetrahydrocannabinolic acid) of not more than 0.3 percent on a dry weight basis." THCA now counts, which ends THCA flower as hemp.
- **No synthesized cannabinoids.** Products with cannabinoids "not capable of being naturally produced by a Cannabis sativa L. plant," or natural cannabinoids "synthesized or manufactured outside the plant," are excluded, which covers converted delta-8.
- **A per-container cap on final products.** A final hemp-derived cannabinoid product may contain no more than "0.4 milligrams combined total per container" of total THC (including THCA) and other cannabinoids with similar effects. "Container" means "the innermost wrapping, packaging, or vessel in direct contact with a final hemp-derived cannabinoid product," such as a jar, bottle, bag, packet, can or cartridge.
- **No intermediates to consumers.** Intermediate products "marketed or sold as a final product or directly to an end consumer" aren't hemp.
- **Industrial hemp** (stalk and fiber, grain and seed oil, microgreens, research) is a new category outside the limits.

The law directed FDA to publish, within 90 days, lists of naturally occurring cannabinoids, THC-class cannabinoids and similar-effect cannabinoids, and more detail on "container"; the Congressional Research Service reported that "as of September 28, 2026, such a list has not been published," and that bills to delay the new definition two more years (H.R. 7010, H.R. 7024, S. 3686) or repeal it (H.R. 6209) had been introduced, none enacted. Executive Order 14370 acknowledged that "some full-spectrum CBD products will once again be controlled as marijuana under the CSA when section 781 of Public Law 119-37 goes into effect," and asked for work with Congress on per-serving and per-container THC limits for full-spectrum CBD. <!-- source-gap: hemp-section-781-followups | status | whether FDA published the section 781 cannabinoid and container lists, or Congress delayed the November 12, 2026 effective date, after CRS's September 28, 2026 update | closes with: an FDA publication of the lists, or an enacted delay on congress.gov (H.R. 7010, H.R. 7024, S. 3686) | checked: 2026-10-28 -->

For a seller of hemp-derived products, November 12, 2026 is a catalog event: every product's total THC per container (from its certificate of analysis) is checked against 0.4 mg, products with synthesized cannabinoids are pulled, and listings, inventory and subscriptions for products that no longer qualify are ended before the date. States have their own hemp rules on top, and some are stricter. California's AB 8 (Chapter 248, Statutes of 2025) bars, from January 1, 2026, industrial hemp raw extract in food, beverages and dietary supplements unless it's more than 99% pure and contains no THC or synthetic cannabinoids, and from January 1, 2028 counts online sales to customers in the state as retail of industrial hemp under its rules; a seller shipping into California needs that state's rule in the same catalog check.

## How to Build It

This chapter adds tracking tags and packages, state reporting events with deadlines, purchase limits and their equivalence factors, and certificates of analysis:

```sql
CREATE TABLE compliance_tags (           -- a state-issued tag on a plant or package
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id        UUID NOT NULL REFERENCES locations (id),  -- the licensed premises
  tracking_system    TEXT NOT NULL,      -- 'metrc', 'biotrack', a state's own
  tag_number         TEXT NOT NULL,      -- the state's ID; RFID-encoded for Metrc
  kind               TEXT NOT NULL CHECK (kind IN ('plant', 'package')),
  item_id            UUID REFERENCES items (id),       -- the product, once packaged
  source_tag_ids     UUID[] NOT NULL DEFAULT '{}',     -- packages it was made from
  harvest_ref        TEXT,
  lab_result_ref     TEXT,               -- the test batch the package passed
  quantity           NUMERIC(14, 4),     -- remaining, in the state's unit
  unit               TEXT,               -- 'each', 'grams', 'ounces'
  status             TEXT NOT NULL CHECK (status IN ('active', 'in_transit', 'sold_out',
                       'destroyed', 'on_hold')),
  UNIQUE (tracking_system, tag_number)
);

ALTER TABLE order_lines
  ADD COLUMN compliance_tag_id UUID REFERENCES compliance_tags (id);  -- the package sold from

ALTER TABLE inventory_movements
  ADD COLUMN compliance_tag_id UUID REFERENCES compliance_tags (id);

CREATE TABLE state_reporting_events (    -- every event the state must receive
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),
  tracking_system  TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('sale', 'sale_void', 'return', 'adjustment',
                     'transfer_out', 'transfer_in', 'package_created', 'destruction',
                     'patient_check_in')),
  subject_kind     TEXT NOT NULL,        -- 'order', 'inventory_movement', 'manifest'
  subject_id       UUID NOT NULL,
  payload          JSONB NOT NULL,       -- the request as sent
  occurred_at      TIMESTAMPTZ NOT NULL, -- when it happened on the premises
  due_at           TIMESTAMPTZ NOT NULL, -- occurred_at plus the state's window
  sent_at          TIMESTAMPTZ,
  state_ref        TEXT,                 -- the tracking system's receipt or transaction ID
  status           TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'accepted', 'rejected',
                     'superseded')),
  error            TEXT,
  idempotency_key  TEXT NOT NULL UNIQUE
);

CREATE TABLE purchase_limits (           -- per jurisdiction, customer type and category
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction   TEXT NOT NULL,          -- 'US-CA'
  customer_type  TEXT NOT NULL CHECK (customer_type IN ('adult_use', 'medical')),
  limit_category TEXT NOT NULL,          -- 'flower', 'concentrate', 'immature_plants'
  max_quantity   NUMERIC(10, 3) NOT NULL,
  unit           TEXT NOT NULL,          -- 'grams', 'each'
  period         TEXT NOT NULL CHECK (period IN ('transaction', 'day', 'rolling_30_days')),
  combinable     BOOLEAN NOT NULL DEFAULT FALSE,  -- may adult-use and medical be combined
  rule_ref       TEXT NOT NULL,          -- e.g. '4 CCR 15409'
  valid_during   DATERANGE NOT NULL
);

CREATE TABLE item_limit_equivalents (    -- how much of a limit one unit of an item uses
  item_id        UUID NOT NULL REFERENCES items (id),
  jurisdiction   TEXT NOT NULL,
  limit_category TEXT NOT NULL,
  per_unit       NUMERIC(10, 4) NOT NULL,  -- grams of flower equivalent per unit, etc.
  PRIMARY KEY (item_id, jurisdiction, limit_category)
);

CREATE TABLE lab_certificates (          -- certificates of analysis for a batch
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES items (id),
  batch_ref        TEXT NOT NULL,
  lab_name         TEXT NOT NULL,
  tested_on        DATE NOT NULL,
  total_thc_pct    NUMERIC(7, 4),        -- including THCA, dry weight
  total_thc_mg_per_container NUMERIC(10, 4),  -- the post-November 2026 hemp test
  synthesized      BOOLEAN,              -- any synthesized cannabinoid present
  document_id      UUID NOT NULL REFERENCES documents (id),
  UNIQUE (item_id, batch_ref)
);

-- How much of today's limit a customer has used, by category (California counts per day).
SELECT e.limit_category, SUM(ol.quantity * e.per_unit) AS used
FROM orders o
JOIN order_lines ol ON ol.order_id = o.id
JOIN item_limit_equivalents e ON e.item_id = ol.item_id AND e.jurisdiction = $2
WHERE o.customer_id = $1
  AND o.status <> 'cancelled'
  AND (o.placed_at AT TIME ZONE $3)::date = (NOW() AT TIME ZONE $3)::date
GROUP BY e.limit_category;

-- Hemp items that fail the federal test from November 12, 2026.
SELECT i.id, i.sku, i.name, c.batch_ref, c.total_thc_mg_per_container, c.synthesized
FROM items i
JOIN lab_certificates c ON c.item_id = i.id
WHERE c.total_thc_mg_per_container > 0.4 OR c.synthesized IS TRUE;
```

Design notes:

- **The tag joins the two inventories.** `inventory_movements` and `order_lines` carry the package's tag, so every movement in the merchant's ledger has its counterpart in the state's system, and reconciliation is a join, not a guess.
- **Reporting is an outbox with a deadline.** Each event is queued with a `due_at` computed from the state's window and sent idempotently; a rejected event is fixed and resent, never dropped, and anything near its deadline pages someone ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox), [Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Limits are data with equivalence factors.** A pre-roll, a vape cartridge and an edible each use a defined amount of a limit category, by state; the limit check sums equivalents, so a new product needs its factors before it can be sold.
- **Time zone decides the day.** A per-day limit is a local business day, from the location's time zone ([Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays)).
- **Certificates are documents.** A certificate of analysis is kept as received and parsed into the fields the rules read; the hemp test from November 12, 2026 reads the per-container figure.
- **Integrator and user keys stay apart.** The software vendor's integrator key is a platform secret; each licensee's user key is theirs, stored encrypted per location and rotated when staff leave ([Envelope Encryption](/docs/security/encryption-at-rest#envelope-encryption)).

## Auditing

- **Every state reporting event,** with the payload as sent, the response, the state's reference and the time against its deadline.
- **Daily reconciliation** of every active package's quantity between the merchant's ledger and the tracking system, with every difference and its adjustment.
- **Every limit check at the register,** with the customer type, the equivalents used, the earlier purchases counted and the rule version.
- **ID and patient verification** for every sale, through the [age verification](/books/commerce/age-restricted-goods#how-to-build-it) records.
- **Every certificate of analysis** relied on to sell a product, and every product removed at the hemp effective date, with the date and the reason.

## What This Means for the System You Build

- **Integrate with each state's chosen tracking system** as the inventory of record, and carry its tag on every movement and sale.
- **Report every event through an idempotent outbox** with a computed deadline, and alert before it passes.
- **Compute purchase limits live from equivalence factors and rules** per jurisdiction, customer type and period.
- **Design for cash first** and keep the drawer ledger as the money ledger.
- **Track federal status as dated facts,** not assumptions: Schedule I and 280E today, rescheduling when a final rule exists.
- **Run the hemp catalog against the November 12, 2026 definition** from certificates of analysis, and end non-compliant listings before the date.

## References

**Federal law and actions**

- [Federal Register API: DEA marijuana rescheduling documents](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22Rescheduling%20of%20Marijuana%22&conditions[agencies][]=drug-enforcement-administration&conditions[type][]=PRORULE&conditions[type][]=RULE&conditions[type][]=NOTICE&order=relevance&per_page=15), the May 2024 proposed rule and the August 2024 hearing notice
- [Executive Order 14370 (90 FR 60541, December 23, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-12-23/pdf/2025-23846.pdf), the direction to complete rescheduling, the 43,000 comments, the 40 medical states and the CBD findings
- [Federal Register: DEA hearing notice (April 28, 2026)](https://www.federalregister.gov/api/v1/documents/2026-08177.json), the new hearing beginning June 29, 2026
- [Federal Register: DEA final rule on FDA-approved marijuana products (April 28, 2026)](https://www.federalregister.gov/api/v1/documents/2026-08176.json), Schedule III for FDA-approved products and expedited registration for state medical licensees
- [Federal Register: Specific listing for hexahydrocannabinol (May 4, 2026)](https://www.federalregister.gov/documents/2026/05/04/2026-08595/specific-listing-for-hexahydrocannabinol-a-currently-controlled-schedule-i-substance), HHC in Schedule I
- [26 U.S.C. 280E (Cornell LII)](https://www.law.cornell.edu/uscode/text/26/280E), no deductions for trafficking in Schedule I or II substances
- [FinCEN: BSA expectations regarding marijuana-related businesses (FIN-2014-G001)](https://www.fincen.gov/resources/statutes-regulations/guidance/bsa-expectations-regarding-marijuana-related-businesses), the three marijuana SAR types
- [Public Law 119-37 (govinfo)](https://www.govinfo.gov/content/pkg/PLAW-119publ37/html/PLAW-119publ37.htm), section 781's hemp redefinition, the 365-day effective date, the 0.4 mg per container limit and the container definition
- [FDA: Regulation of cannabis and cannabis-derived products, including CBD](https://www.fda.gov/news-events/public-health-focus/fda-regulation-cannabis-and-cannabis-derived-products-including-cannabidiol-cbd), THC and CBD excluded from food and supplements
- [S. 4942, SAFE Banking Act of 2026 (congress.gov)](https://www.congress.gov/bill/119th-congress/senate-bill/4942/all-actions), introduced and referred June 24, 2026
- [Congressional Research Service: Changes to the Statutory Definition of Hemp and Implications for Agricultural Policy (IF13136, updated September 28, 2026)](https://www.congress.gov/crs-product/IF13136), FDA's unpublished lists and the delay and repeal bills

**California**

- [4 CCR 15409 (Cornell LII)](https://www.law.cornell.edu/regulations/california/4-CCR-15409), daily purchase limits
- [4 CCR 15049 (Cornell LII)](https://www.law.cornell.edu/regulations/california/4-CCR-15049), recording activities in track and trace within 24 hours
- [4 CCR 15049.2 (Cornell LII)](https://www.law.cornell.edu/regulations/california/4-CCR-15049.2), shipping manifests through track and trace
- [4 CCR 15048.5 (Cornell LII)](https://www.law.cornell.edu/regulations/california/4-CCR-15048.5), package tags and unique IDs
- [California Department of Cannabis Control: What's legal](https://cannabis.ca.gov/consumers/whats-legal/), adult-use and medicinal ages
- [California AB 8 (2025), Chapter 248](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB8), hemp raw extract in food, beverages and supplements, and online hemp retail

**Other states**

- [410 ILCS 705/10-10](https://www.ilga.gov/Documents/legislation/ilcs/documents/041007050K10-10.htm), Illinois possession limits for residents and nonresidents

**Tracking systems and payments**

- [Metrc](https://www.metrc.com/), RFID seed-to-sale tracking and the state partner list
- [Metrc API documentation (California)](https://api-ca.metrc.com/Documentation), endpoint groups and the integrator and user keys
- [Metrc: California partner bulletins](https://www.metrc.com/partner/california/), 2025 and 2026 workflow bulletins
- [BioTrack](https://www.biotrack.com/), government contracts, states and processed sales
- [Stripe: Restricted businesses](https://stripe.com/legal/restricted-businesses), cannabis prohibited and CBD restricted
</content>
</invoke>
