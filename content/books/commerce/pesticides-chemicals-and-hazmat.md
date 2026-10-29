+++
title = "Pesticides, Chemicals & Hazmat"
description = "Selling and shipping pesticides and hazmat: FIFRA seller duties, 25(b) products, state registration, marketplaces, DOT rules, lithium batteries, SDS, Prop 65."
category = "Commerce Industry"
order = 2350
part = "Regulated Goods"
tags = ["commerce", "pesticides", "hazmat", "lithium-batteries", "prop-65", "compliance"]
+++

A DIY pest control subscription ships a box every three months: a concentrate, a sprayer the first time, gloves and a guide. A phone accessory brand ships a power bank. A home goods store ships a can of spray paint and a bottle of drain cleaner. All three are selling things the law cares about before the customer ever opens them. The pesticide can't be sold anywhere unless EPA has registered it, and in most states not unless that state has registered it too, and every claim on the product page has to match the label. The power bank is a lithium battery, which is a hazardous material that can't fly on a passenger plane as a standalone item and must be packed, marked and declared a particular way on the ground. The paint and the drain cleaner are hazmat too, often shippable as a limited quantity, and in California they may need a warning on the product page before the customer can buy them.

This chapter covers selling and shipping: FIFRA as it applies to a seller and distributor, minimum-risk and treated-article exemptions, state product registration, online and marketplace sales, DIY pesticide subscriptions, DOT hazardous materials rules for parcels, lithium batteries, safety data sheets and California's Proposition 65. It extends `items`, `shipments` and `documents` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The product-page disclosures themselves are [Required Disclosures](/books/commerce/product-information#required-disclosures); restricted goods across borders, including lithium batteries by international post, are [Cross-Border Commerce](/books/commerce/cross-border-commerce#restricted-goods); buying labels and choosing carrier services are [Shipping & Carriers](/books/commerce/shipping-and-carriers).

## Selling Versus Applying

Pesticides appear in two volumes, and the line between them is the customer's doorstep:

| | This chapter (Commerce) | Field Operations, [Regulated Materials](/books/field-operations/regulated-materials) |
| --- | --- | --- |
| **The business** | Sells and ships products: a DIY subscription, a garden retailer, a marketplace seller, a distributor | Applies products as a service: a pest control or lawn company's technicians |
| **The law's question** | May this product be distributed or sold here, with these claims, packed and shipped this way? | Was this product applied according to its label, by a certified person, and recorded? |
| **Key rules** | FIFRA registration and the sale prohibitions, state product registration, restricted use sales, DOT hazmat, Prop 65 | [The label is the law](/books/field-operations/regulated-materials#the-label-is-the-law), [certified applicators](/books/field-operations/regulated-materials#restricted-use-and-certified-applicators), [state use records](/books/field-operations/regulated-materials#what-states-want-recorded) |
| **The record** | Which registered product was sold to whom, where it shipped, under which state registration, how it was packed | Which product was applied where, at what rate, by whom, in what weather |
| **Transport** | Parcels by carrier under the hazmat rules in this chapter | Product on the service vehicle under [materials of trade](/books/field-operations/fleet-and-safety#carrying-regulated-products) |

The two share their product facts. A Commerce item that is a pesticide carries its EPA registration number and state registrations ([How to Build It](#how-to-build-it)); a Field Operations `chemical_items` row carries the same registration number and the label version in force for each application. A merchant that both sells products and applies them keeps one product record with both sets of attributes. The difference is what happens after the sale: a DIY customer applies the product themselves under the label's directions, and no applicator license or use record is involved, which is exactly why the product must be one the label allows the general public to use.

## How the Platforms Do It

As of October 2026, from public pages:

| Company | What it publishes |
| --- | --- |
| **Pestie** | A DIY subscription with a plan built from the home's ZIP code; ships "pro-grade, EPA registered, ultra-concentrated" products with a sprayer on the first shipment, mixing bags, gloves and a guide; "Every pesticide/treatment that we send out is fully registered with the EPA and applicable state agencies," and each shipment includes the original EPA-approved label; reapply about every three months |
| **EPA** | The Pesticide Product Label System (PPLS) for looking up registrations and labels; the minimum-risk exemption and its enforcement |
| **Stripe** | Prohibits "Pesticides requiring application by a certified professional" and "Toxic, flammable, combustible, or radioactive materials" |
| **USPS** | Hazardous materials by mail only within Publication 52's packaging instructions, including lithium batteries; hazmat packages need their own service codes since 2023 |
| **Amazon** | A seller policy for pesticides, behind Seller Central's login; its terms weren't retrievable for this chapter |

<!-- source-gap: amazon-pesticide-policy | missing | Amazon's seller policy for pesticides and pesticide devices (EPA registration number, 25(b) disclosures, state restrictions) | closes with: the public text of Amazon's pesticide policy page | checked: 2026-10-28 -->

Three patterns:

- **Registration is the product's passport.** Pestie's statement that every product is registered with EPA and "applicable state agencies" is the whole compliance posture of a DIY pesticide seller in one line: the products are registered, the label goes in the box, and the customer follows it.
- **Payment providers draw the restricted use line.** Stripe's prohibition on products requiring a certified applicator matches FIFRA's: restricted use pesticides aren't consumer products, and a checkout that sells them to anyone is a problem before it's a payments problem.
- **The carrier decides the packaging.** USPS's packaging instructions and the private carriers' hazmat contracts decide what can ship by which service, so a hazmat item's shipping options are a property of the item.

## FIFRA for Sellers

The Federal Insecticide, Fungicide, and Rodenticide Act's central rule is a sales rule: "no person in any State may distribute or sell to any person any pesticide that is not registered under this subchapter" (7 U.S.C. 136a(a)). Three definitions make it reach every seller:

- **"To distribute or sell"** means "to distribute, sell, offer for sale, hold for distribution, hold for sale, hold for shipment, ship, deliver for shipment, release for shipment, or receive and (having so received) deliver or offer to deliver" (7 U.S.C. 136(gg)). A product page is an offer for sale; a warehouse shelf is holding for shipment. A marketplace seller, a 3PL and a distributor are all in it.
- **"Pesticide"** is "any substance or mixture of substances intended for preventing, destroying, repelling, or mitigating any pest" (136(u)). "Intended" is read from the claims: a cleaner that says it kills germs, a bracelet that says it repels mosquitoes and a trap that says it kills ants are making pesticidal claims, whatever the product is.
- **"Establishment"** is "any place where a pesticide or device or active ingredient used in producing a pesticide is produced, or held, for distribution or sale" (136(dd)); producers must register their establishments with EPA, which assigns the establishment number on the label, and report production annually (7 U.S.C. 136e).

FIFRA's unlawful acts (7 U.S.C. 136j) turn into the seller's duties:

- **Only registered products.** Distributing or selling a pesticide that isn't registered, or whose registration was canceled or suspended, is unlawful.
- **Claims must match the registration.** Claims that "substantially differ" from those made for registration are unlawful, which puts the product page, the listing title, the ad and the email under the same rule as the label.
- **No misbranded or adulterated products.** A product whose label doesn't meet the rules, or that was repackaged or relabeled outside a registrant's control, is misbranded.
- **Restricted use stays with certified applicators.** A restricted use pesticide may be distributed, sold or made available only as the regulations allow: to a certified applicator or for use under one's supervision ([Restricted Use and Certified Applicators](/books/field-operations/regulated-materials#restricted-use-and-certified-applicators)).

The label carries the facts a catalog needs (40 CFR 156.10): the product name, the producer's name and address (or "Distributed by" for a distributor), net contents, the "EPA Registration No." or "EPA Reg. No.," the "EPA Est." number, the ingredient statement with each active ingredient by name and percentage, hazard and precautionary statements, "Directions for Use," and "Restricted Use Pesticide" at the top of the front panel for restricted products. A seller validating a listing checks the registration number in PPLS and keys the catalog on it, not on the establishment number, which identifies the factory ([The Label Is the Law](/books/field-operations/regulated-materials#the-label-is-the-law)).

Penalties scale with the role. Under 7 U.S.C. 136l, a civil penalty against a registrant, wholesaler, dealer, retailer or other distributor is "not more than $5,000 for each offense" in the statute's original figure (the current amount is adjusted for inflation), and knowing violations are criminal: up to $50,000 and a year for registrants and producers, $25,000 and a year for other distributors and sellers. <!-- source-gap: fifra-civil-penalty-current | missing | the current inflation-adjusted FIFRA civil penalty per violation | closes with: the 40 CFR 19.4 penalty table | checked: 2026-10-28 -->

Imported pesticides add a step: the importer must submit a Notice of Arrival to EPA "prior to the arrival of the shipment in the United States," on EPA Form 3540-1 or electronically through CBP's systems with the entry (19 CFR 12.112), and CBP can hold a shipment that lacks one ([Customs Entry and Duties](/books/commerce/cross-border-commerce#customs-entry-and-duties)).

## Minimum-Risk Products and Treated Articles

Two exemptions cover a large share of what consumer brands sell, and both are narrower than they look:

- **Minimum-risk pesticides (the "25(b)" exemption).** Products that contain only the active ingredients on EPA's Table 1 (examples include cedarwood oil, citric acid, garlic oil, sodium chloride and zinc) and only permitted inert ingredients are exempt from federal registration, provided the label gives each active ingredient's name and weight percentage, lists inerts by their Table 2 names, gives the producer's name, street address, ZIP code and phone number, makes no false or misleading claims, and makes no claim to control microorganisms that threaten human health or pests that carry disease, such as Lyme disease ticks (40 CFR 152.25(f)). EPA says these products "pose little to no risk." The exemption is federal only: "Each state has its own statutes and regulations concerning pesticide regulation, including registration, sales and use," and states may require minimum-risk products to be registered anyway. A product that doesn't meet every condition is an unregistered pesticide, and EPA's options include warning notices, stop sale, use or removal orders and civil or criminal penalties.
- **Treated articles.** An article treated with a pesticide "to protect the article or substance itself" (paint with a mildewcide, treated lumber) is exempt "if the pesticide is registered for such use" (40 CFR 152.25(a)). The exemption covers protecting the article, not protecting the user: a cutting board that claims to kill germs on food is making a claim the exemption doesn't cover.

For the catalog, the exemption is an attribute with its basis (`fifra_status = 'exempt_25b'` or `'treated_article'`), not the absence of a registration number, and the claims rule applies to exempt products as strongly as to registered ones.

## State Registration and Licensing

States register pesticide products separately, and a product shipped into a state is being distributed there. California is the most demanding example: "DPR must register any pesticide before it can be sold or used in California," including adjuvants; minimum-risk products are exempt only if they meet both the federal criteria and California's own rules; the annual renewal fee is $2,300 per product ($2,760 late), and certificates expire December 31 with renewals due by January 31. California's Department of Pesticide Regulation also licenses pesticide brokers and businesses that sell pesticides; which sellers need a broker license and pay the mill assessment on sales into the state wasn't confirmed in the sources here. <!-- source-gap: ca-pesticide-broker | missing | which out-of-state and online sellers need a California pesticide broker license and owe the mill assessment on sales into California | closes with: DPR's Pesticide Broker License Packet and Cal. Food & Agric. Code 12250-12251 | checked: 2026-10-28 -->

The pattern across states is consistent even where the details aren't: each state keeps its own list of registered products with its own renewal cycle and fees, some states license dealers or distributors, and restricted use products may have state-specific additions. For a seller shipping nationally, that means:

- **A registration per product per state,** with an effective period, a renewal deadline and a fee, held by the registrant (often the manufacturer, not the seller).
- **A ship-to check.** A product not registered in the destination state can't be sold there, so the cart checks the ship-to state against the product's state registrations, the same eligibility pattern as alcohol ([How to Build It](/books/commerce/age-restricted-goods#how-to-build-it)).
- **Renewal is a catalog event.** A registration that lapses at year end without renewal makes every listing for that state unlawful on January 1.

## Marketplaces and Online Enforcement

The definitions reach online sellers squarely: listing a pesticide is offering it for sale, and holding it in a fulfillment center is holding it for shipment. EPA has pursued online sales of unregistered and misbranded pesticides, including against Amazon; the record of those actions wasn't retrievable for this chapter. <!-- source-gap: epa-online-pesticide-enforcement | missing | EPA's enforcement actions against online and marketplace sales of unregistered pesticides (Amazon's 2018 settlement and later stop-sale orders and agreements) | closes with: the EPA news releases or the consent agreements on EPA's dockets | checked: 2026-10-28 -->

What a seller or marketplace does about it is the same either way:

- **Screen claims, not just categories.** Listings that say "kills," "repels," "disinfects," "antimicrobial" or "antibacterial" are pesticide claims; a listing pipeline that flags them and requires a registration number (or a documented exemption) before the listing goes live catches the most common violation, the unregistered product with a pesticidal claim.
- **Verify the registration number.** Check it against PPLS and against the label image; a number that belongs to a different product is a red flag for counterfeit or relabeled goods (counterfeits are the later Brand Protection chapter's subject).
- **Respect state registrations at checkout,** as above.
- **Keep the label with the listing.** The label image and its version date are the evidence that the page's claims match the registration ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## DIY Pesticide Subscriptions

A DIY pest control subscription is a product subscription, not a service agreement: it ships products on a schedule and the customer applies them. Commerce models it as a `subscriptions` row with lines and a cadence ([Subscription DTC](/books/commerce/business-models#subscription-dtc), [Subscription Commerce](/books/commerce/subscription-commerce#how-a-subscription-maps-to-a-service-agreement)); the professional equivalent, where a technician visits on a schedule and applies the product, is a Field Operations [service agreement](/books/field-operations/service-agreements) with visits and application records. Both are a recurring promise with a schedule and a renewal; what each renewal produces differs, a box or a visit.

The pesticide adds four things to the subscription:

- **The plan depends on where the customer is.** Pestie builds the plan from the ZIP code (pests and climate), and the products in it must be registered in that state. A customer who moves to a state where a product isn't registered gets a different product or a pause, not the same box.
- **Every renewal re-checks eligibility.** A state registration that lapsed, a product the registrant discontinued or a label change applies to the next shipment, so the renewal job runs the same checks as a first order.
- **Each shipment carries the label.** Pestie includes the original EPA-approved label in every shipment; the label is what tells a DIY customer how to apply the product lawfully, and the packing slip process includes it.
- **Hazmat shipping.** Concentrates are often shippable as limited quantities by ground; the subscription's ship method comes from the items' hazmat classification, below.

## Hazmat Shipping

Many consumer products are hazardous materials under the Department of Transportation's Hazardous Materials Regulations (49 CFR parts 171-180): flammable liquids, aerosols, corrosives, some pesticides, oxidizers like pool chlorine, and lithium batteries. For a parcel shipper, four rules matter most:

- **Classification comes first.** Each product's proper shipping name, UN number, hazard class and packing group come from the 49 CFR 172.101 table (and the product's SDS, section 14). Everything downstream (packaging, marking, carrier service) reads the classification.
- **Limited quantity.** Many consumer products in small inner containers can ship as a **limited quantity** where the 172.101 table references it, with a 30 kg (66 lb) gross weight limit per package and the limited quantity mark (49 CFR 173.156). Limited quantity relieves most labeling and documentation, not the classification or the training. The older ORM-D consumer commodity marking was phased out in favor of the limited quantity mark. <!-- source-gap: orm-d-end-date | missing | the date ORM-D consumer commodity marking ended for ground shipments | closes with: the PHMSA final rule (76 FR 3308) or 49 CFR 171.14 transition text | checked: 2026-10-28 -->
- **Aerosols.** An aerosol in a metal container "must not exceed 1 L (61.0 cubic inches)," with internal pressure limits, and limited quantity packages carry the mark and the statement "INSIDE CONTAINERS COMPLY WITH PRESCRIBED REGULATIONS" (49 CFR 173.306).
- **Training.** Every hazmat employee (anyone who classifies, packs, marks or prepares hazmat for shipment, including warehouse staff) needs general awareness, function-specific, safety and security awareness training "within 90 days after employment or a change in job function" and recurrent training "at least once every three years," with records kept for the preceding three years (49 CFR 172.704). A 3PL that packs hazmat for a brand needs trained staff too ([Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls)).

The carriers layer their own rules on the regulations: USPS accepts hazardous materials only within Publication 52, and since an April 2023 rule mailers must use dedicated service codes for hazmat packages so they're identifiable in the label data; UPS and FedEx accept hazmat under contracts and service-specific rules not covered in the sources here. <!-- source-gap: private-carrier-hazmat | missing | UPS and FedEx hazardous materials shipping contracts and ground limited quantity rules | closes with: the UPS and FedEx hazmat program pages | checked: 2026-10-28 --> A label purchase for a hazmat item must therefore carry the hazmat indicators in the request and choose only services that accept the class ([Labels](/books/commerce/shipping-and-carriers#labels)). Small amounts carried in a technician's van for their own work fall under the lighter materials of trade exception instead ([Carrying Regulated Products](/books/field-operations/fleet-and-safety#carrying-regulated-products)); a parcel to a customer never does.

## Lithium Batteries

A power bank, a battery case, a wireless speaker and a phone in a box all contain lithium-ion cells, and each falls into one of three categories that ship differently:

| Category | UN number | Examples |
| --- | --- | --- |
| **Batteries alone** | UN3480 | Power banks, spare batteries |
| **Packed with equipment** | UN3481 | A device in a box with a separate battery |
| **Contained in equipment** | UN3481 | A phone, a speaker, a battery case with built-in cells |

Power banks are batteries, not devices: IATA's guidance says they "are to be classified as batteries and must be assigned to UN 3480," which is the strictest category. For a phone accessory brand that sells power banks alongside cases and cables, this is the hazmat line in the catalog.

The ground rules for small cells and batteries (49 CFR 173.185(c)) set limits of 20 Wh per lithium-ion cell and 100 Wh per battery; packages carry the lithium battery mark showing "UN3480" or "UN3481," at least 100 by 100 mm; since May 10, 2024 each lithium-ion battery must show its watt-hour rating on its case; and batteries shipped alone carry a marking that lithium ion batteries are forbidden for transport aboard passenger aircraft, or a Cargo Aircraft Only label.

Air is stricter:

- **Batteries alone can't go on passenger aircraft** (Packing Instruction 965) and "must be shipped at a state of charge (SoC) not exceeding 30% of their rated capacity," per IATA.
- **From January 1, 2026,** lithium-ion batteries packed with equipment must also ship by air at reduced state of charge; for batteries contained in equipment, 30% is "strongly recommended" but not mandatory.

USPS's domestic rules (Publication 52, packaging instruction 9D) let batteries installed in or packed with equipment go by air or surface, at most eight cells or two batteries per mailpiece, within the 20 Wh and 100 Wh limits; batteries alone go by surface only, at most 5 pounds per mailpiece, marked with the UN number and "Surface Mail Only, Lithium-ion Batteries - Forbidden for Transportation Aboard Passenger Aircraft"; damaged, defective or recalled batteries are prohibited.

For the system, the battery category and watt-hours are item attributes, and they decide the services: a power bank's cart can't offer an air service, and an expedited promise that depends on air is false for it. A recalled battery can't be shipped back by mail either, which shapes the recall's return method ([Recalls](/books/commerce/product-safety-and-recalls#recalls)).

## Safety Data Sheets

A **safety data sheet (SDS)** is the manufacturer's standardized document of a chemical's hazards: 16 sections in a fixed order, from identification and hazards to transport information (section 14) and "Section 16, Other information, including date of preparation or last revision" (29 CFR 1910.1200). For a seller, two duties apply:

- **Distributors pass it on.** Manufacturers, importers and distributors must provide an SDS with the initial shipment of a hazardous chemical to a customer and with the first shipment after an SDS is updated. That applies when selling to businesses (a distributor shipping to a pest control company or a retailer), and for every seller the SDS is where the hazmat classification comes from.
- **Keep the current version.** OSHA's 2024 update to the standard has staggered compliance dates; the CFR text as of October 2026 gives manufacturers, importers and distributors until May 19, 2026 for substances and November 19, 2027 for mixtures to update their SDSs and labels. <!-- source-gap: hazcom-extension-rule | missing | the OSHA rule that extended the 2024 HazCom update's compliance dates to May 19, 2026 and November 19, 2027 | closes with: the Federal Register extension notice | checked: 2026-10-28 -->

The catalog keeps each item's SDS as a versioned document, and a B2B order's packing documents include it when the customer hasn't received the current version. Field technicians' access to SDSs is the Field Operations volume's [Safety Data Sheets](/books/field-operations/regulated-materials#safety-data-sheets).

## California Proposition 65

Proposition 65 requires businesses to warn Californians before "significant exposures" to chemicals on the state's list, which "must be updated at least once a year" and holds about 900 chemicals; penalties can be "as high as $2,500 per violation per day," and the law is enforced by the attorney general, district attorneys, certain city attorneys and "any individual acting in the public interest," which is why most enforcement starts with a private notice letter.

For online sales, the safe harbor warning (27 CCR 25602(b)) must be provided by one of three methods: "a warning on the product display page," "a clearly marked hyperlink using the word 'WARNING'" (or "CA WARNING" or "CALIFORNIA WARNING") on the product display page, or "an otherwise prominently displayed warning provided to the purchaser prior to completing the purchase." A warning the buyer must search for isn't prominent. Catalogs must place the warning so it "clearly associates it with the item being purchased" (25602(c)).

The short-form warning changed: the amended rule (27 CCR 25603) requires the short form to name at least one chemical ("Can expose you to [name of chemical], a carcinogen. See www.P65Warnings.ca.gov."), and products "manufactured and labeled prior to January 1, 2028" may keep the old chemical-free short form. A court-ordered settlement's warning terms are deemed "clear and reasonable" for the party to it (27 CCR 25600), which is why some products carry warnings in words other than the regulation's.

What this means for a catalog:

- **A warning is per item, per chemical, per endpoint** (cancer, reproductive harm), with the warning text version and its legal basis (the regulation or a specific settlement).
- **The online warning appears before purchase,** on the product page or in checkout, for California ship-to addresses at least; many sellers show it everywhere rather than branch on the address, but the checkout must not let a California order complete without it ([Required Disclosures](/books/commerce/product-information#required-disclosures)).
- **Manufactured date matters.** Which short form is allowed depends on when the unit was manufactured and labeled, so inventory lots carry the label version they were packed with.

## How to Build It

This chapter adds product registrations (federal and state), hazmat classifications, Prop 65 warnings and safety data sheets, and a hazmat block on shipments:

```sql
CREATE TABLE product_registrations (     -- an item's standing with a regulator
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id         UUID NOT NULL REFERENCES items (id),
  regime          TEXT NOT NULL CHECK (regime IN ('fifra', 'state_pesticide', 'cpsc', 'fda',
                    'other')),
  jurisdiction    TEXT NOT NULL,         -- 'US', 'US-CA'
  status          TEXT NOT NULL CHECK (status IN ('registered', 'exempt_25b',
                    'treated_article', 'pending', 'lapsed', 'canceled', 'not_registered')),
  registration_no TEXT,                  -- 'EPA Reg. No. 1234-56' or the state's number
  establishment_no TEXT,                 -- 'EPA Est.'; identifies the factory, never the key
  registrant      TEXT,                  -- usually the manufacturer
  restricted_use  BOOLEAN NOT NULL DEFAULT FALSE,
  label_document_id UUID REFERENCES documents (id),  -- the label image as approved
  label_version_date DATE,
  valid_during    DATERANGE NOT NULL,
  renewal_due_on  DATE,
  verified_at     TIMESTAMPTZ,           -- checked against PPLS or the state's list
  EXCLUDE USING gist (item_id WITH =, regime WITH =, jurisdiction WITH =,
                      valid_during WITH &&)
);

CREATE TABLE hazmat_classifications (    -- how an item ships
  item_id            UUID PRIMARY KEY REFERENCES items (id),
  un_number          TEXT,               -- 'UN1950', 'UN3480'
  proper_shipping_name TEXT,
  hazard_class       TEXT,               -- '2.1', '3', '8', '9'
  packing_group      TEXT CHECK (packing_group IN ('I', 'II', 'III')),
  limited_quantity   BOOLEAN NOT NULL DEFAULT FALSE,
  lithium_category   TEXT CHECK (lithium_category IN ('alone', 'packed_with',
                       'contained_in')),
  lithium_wh         NUMERIC(8, 2),      -- per battery; the 100 Wh limit
  air_allowed        BOOLEAN NOT NULL,   -- false for UN3480 by passenger air and USPS air
  usps_mailable      BOOLEAN NOT NULL,
  sds_document_id    UUID REFERENCES documents (id),  -- section 14 is the source
  classified_by      TEXT NOT NULL,      -- a trained person, with their training record
  classified_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE prop65_warnings (           -- one warning, per item, per chemical
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id            UUID NOT NULL REFERENCES items (id),
  chemical           TEXT NOT NULL,      -- as listed by OEHHA
  endpoint           TEXT NOT NULL CHECK (endpoint IN ('cancer', 'reproductive', 'both')),
  basis              TEXT NOT NULL CHECK (basis IN ('safe_harbor', 'settlement')),
  settlement_ref     TEXT,               -- the court-approved settlement, if any
  warning_text       TEXT NOT NULL,      -- the words shown online and on the label
  short_form         BOOLEAN NOT NULL,
  manufactured_before DATE,              -- old short form allowed for units made before this
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE safety_data_sheets (        -- versioned SDS per item
  item_id       UUID NOT NULL REFERENCES items (id),
  version_date  DATE NOT NULL,           -- section 16's date of preparation or revision
  document_id   UUID NOT NULL REFERENCES documents (id),
  supersedes    DATE,
  PRIMARY KEY (item_id, version_date)
);

CREATE TABLE sds_deliveries (            -- which B2B customer got which version, when
  company_id    UUID NOT NULL REFERENCES companies (id),
  item_id       UUID NOT NULL,
  version_date  DATE NOT NULL,
  order_id      UUID REFERENCES orders (id),
  delivered_at  TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (company_id, item_id, version_date),
  FOREIGN KEY (item_id, version_date) REFERENCES safety_data_sheets (item_id, version_date)
);

ALTER TABLE shipments
  ADD COLUMN hazmat         JSONB,       -- UN numbers, classes, limited quantity, lithium marks
  ADD COLUMN hazmat_service_code TEXT;   -- the carrier's hazmat indicator sent with the label

-- Can this cart's pesticides ship to this state? Each pesticide line needs federal
-- standing and a state registration (or a state-recognized exemption) today.
SELECT cl.item_id,
       f.status AS federal, s.status AS state
FROM cart_lines cl
JOIN product_registrations f
  ON f.item_id = cl.item_id AND f.regime = 'fifra' AND f.valid_during @> CURRENT_DATE
LEFT JOIN product_registrations s
  ON s.item_id = cl.item_id AND s.regime = 'state_pesticide'
 AND s.jurisdiction = $2 AND s.valid_during @> CURRENT_DATE
WHERE cl.cart_id = $1
  AND (f.status NOT IN ('registered', 'exempt_25b', 'treated_article')
       OR f.restricted_use
       OR s.status IS NULL OR s.status NOT IN ('registered', 'exempt_25b'));
```

Design notes:

- **One product record across both volumes.** `product_registrations` with `regime = 'fifra'` holds the same EPA registration number as Field Operations' `chemical_items.epa_reg_no`, and its label document corresponds to a Field Operations `label_versions` row. A merchant that sells and applies the same products links the two by registration number; the Commerce side decides whether it may be sold and shipped, the Field Operations side whether it was applied correctly.
- **Restricted use never reaches a consumer cart.** A restricted use registration blocks a consumer sale outright; a B2B order for one needs the buyer's certified applicator license on file, in the [Licenses & Permits](/books/field-operations/licensing-and-permits) shape.
- **Registrations are versioned facts.** The exclusion constraint keeps one standing per item, regime and jurisdiction at a time; a lapse is a new row with `status = 'lapsed'`, so "was this product registered in Ohio on the day it shipped" is a query ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Classification feeds shipping.** The label purchase reads `hazmat_classifications` for every line in the package, refuses services that don't accept the class, sends the hazmat indicators and prints the marks; rate shopping filters on `air_allowed` before comparing prices ([Rate Shopping](/books/commerce/shipping-and-carriers#rate-shopping)).
- **Hazmat packages ship separately.** A power bank and a phone case in the same order may need two packages, because the case could go by air and the power bank can't; sourcing and packing read the classification ([Order Management](/books/commerce/order-management)).
- **Warnings render from data.** The product page, the cart, the checkout and the feed render `prop65_warnings` by the rule's placement, and the order records which warning text was shown before purchase.
- **SDS delivery is tracked per customer.** The B2B packing process compares the customer's last delivered version with the current one and includes the new SDS when it changed.

## Auditing

- **Registration status at the time of each sale:** for every pesticide line, the federal and state registration (or exemption) relied on, its verification date and the destination state.
- **Every listing's claims review:** the pesticidal claims detected, the registration or exemption attached, and who approved the listing.
- **Every hazmat shipment:** the classification used, the carrier service and hazmat code, the marks printed and the trained person who classified the item ([Audit Trails](/docs/architecture/audit-trails)).
- **Hazmat training records** for every employee who packs or prepares hazmat, for the preceding three years.
- **Every Prop 65 warning shown before purchase** on California orders, with the text version.
- **SDS versions and deliveries** to business customers.

## What This Means for the System You Build

- **Treat "pesticide" as a claims question,** screen listings for pesticidal claims, and require a registration or a documented exemption before they go live.
- **Hold federal and state registrations as dated records** per item and jurisdiction, check them at checkout, at every subscription renewal and at shipment, and treat renewals as catalog deadlines.
- **Never sell restricted use products to consumers,** and gate B2B sales on the buyer's applicator license.
- **Keep one product record shared with Field Operations,** keyed on the EPA registration number, with the label as a versioned document.
- **Classify every hazmat item once,** by a trained person from the SDS, and let the classification drive packaging, packages, services and promises.
- **Model lithium batteries by category and watt-hours,** keep power banks off air services, and plan recall returns that don't use the mail for damaged batteries.
- **Render Prop 65 warnings from data** before purchase, and record which text each California order saw.

## References

**Pesticide law**

- [7 U.S.C. 136 (Cornell LII)](https://www.law.cornell.edu/uscode/text/7/136), the definitions of pesticide, distribute or sell, establishment and producer
- [7 U.S.C. 136a (Cornell LII)](https://www.law.cornell.edu/uscode/text/7/136a), the registration requirement for distribution and sale
- [7 U.S.C. 136e (Cornell LII)](https://www.law.cornell.edu/uscode/text/7/136e), establishment registration and production reports
- [7 U.S.C. 136j (Cornell LII)](https://www.law.cornell.edu/uscode/text/7/136j), unlawful acts including unregistered sales, differing claims, misbranding and restricted use
- [7 U.S.C. 136l (Cornell LII)](https://www.law.cornell.edu/uscode/text/7/136l), civil and criminal penalties by role
- [40 CFR 156.10 (Cornell LII)](https://www.law.cornell.edu/cfr/text/40/156.10), required label elements
- [40 CFR 152.25 (Cornell LII)](https://www.law.cornell.edu/cfr/text/40/152.25), the treated article and minimum-risk exemptions and their conditions
- [EPA: Minimum risk pesticides](https://www.epa.gov/minimum-risk-pesticides), the exemption and "little to no risk"
- [EPA: State regulation of minimum risk pesticides](https://www.epa.gov/minimum-risk-pesticides/state-regulation-minimum-risk-pesticides), states' own registration and sales rules
- [EPA: Enforcement related to minimum risk pesticides](https://www.epa.gov/minimum-risk-pesticides/enforcement-related-minimum-risk-pesticides), warning notices, stop sale orders and penalties
- [19 CFR 12.112 (Cornell LII)](https://www.law.cornell.edu/cfr/text/19/12.112), the Notice of Arrival for imported pesticides
- [California DPR: Product registration](https://www.cdpr.ca.gov/docs/registration/regmenu.htm), state registration before sale, the $2,300 renewal fee and deadlines
- [California DPR: Pesticide brokers](https://www.cdpr.ca.gov/docs/license/brokers.htm), broker and seller licensing

**Hazardous materials**

- [49 CFR 172.704 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/172.704), hazmat employee training and records
- [49 CFR 173.156 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/173.156), limited quantity and the 30 kg limit
- [49 CFR 173.306 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/173.306), aerosol limits and markings
- [49 CFR 173.185 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/173.185), small lithium cells and batteries, the marks and the watt-hour rating
- [IATA: Lithium Battery Guidance Document](https://www.iata.org/contentassets/05e6d8742b0047259bf3a700bc9d42b9/lithium-battery-guidance-document.pdf), power banks as UN3480, 30% state of charge and the January 2026 change for batteries packed with equipment
- [IATA: Lithium batteries](https://www.iata.org/en/programs/cargo/dgr/lithium-batteries/), current Dangerous Goods Regulations changes
- [USPS Publication 52, packaging instruction 9D](https://pe.usps.com/text/pub52/pub52apxc_032.htm), domestic mailing of lithium-ion batteries
- [Federal Register API: USPS hazardous materials service codes rule (April 2023)](https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=postal-service&conditions[term]=electronic%20nicotine%20delivery%20systems%20mailability&order=oldest&per_page=5), dedicated codes for hazmat mailpieces
- [29 CFR 1910.1200 (Cornell LII)](https://www.law.cornell.edu/cfr/text/29/1910.1200), SDS sections, distributor duties and compliance dates

**Proposition 65**

- [OEHHA: About Proposition 65](https://oehha.ca.gov/proposition-65/about-proposition-65), significant exposures, the list, penalties and enforcement
- [27 CCR 25602 (Cornell LII)](https://www.law.cornell.edu/regulations/california/27-CCR-25602), internet and catalog warning methods
- [27 CCR 25603 (Cornell LII)](https://www.law.cornell.edu/regulations/california/27-CCR-25603), the amended short-form warning and the 2028 transition
- [27 CCR 25600 (Cornell LII)](https://www.law.cornell.edu/regulations/california/27-CCR-25600), the safe harbor and court-ordered settlement warnings

**Companies**

- [Pestie](https://pestie.com/), the ZIP-based plan, EPA and state registration, the label in every shipment and the three-month cadence
- [Stripe: Restricted businesses](https://stripe.com/legal/restricted-businesses), the prohibition on pesticides requiring a certified applicator and on hazardous materials
</content>
</invoke>
