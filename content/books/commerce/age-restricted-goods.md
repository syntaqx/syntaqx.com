+++
title = "Alcohol, Tobacco & Age-Restricted Goods"
nav_title = "Age-Restricted Goods"
description = "Selling alcohol, tobacco, vapes, firearms and other age-gated goods: three-tier law, DTC shipping, the PACT Act, FFL transfers and age checks."
category = "Commerce Industry"
order = 2348
part = "Regulated Goods"
tags = ["commerce", "alcohol", "tobacco", "firearms", "age-verification", "compliance"]
+++

Most products can be sold to anyone, shipped anywhere and handed to whoever opens the door. A short list can't. Wine can be shipped from a winery to a consumer in most states but from a retailer in far fewer, and by most carriers only under contract, with an adult signature. Cigarettes and vapes can't go in the mail at all, and a seller who ships them by private carrier has to register with the federal government and every destination state and report every shipment monthly. A rifle bought online ships to a licensed dealer, not to the buyer. Each of those rules turns into the same three questions for the software: may this item be sold to this person, may it be sent to this address by this method, and was the buyer's age checked at the moments the law requires.

This chapter covers alcohol (the three-tier system, direct-to-consumer shipping and the cases that shaped it, federal permits, carriers), tobacco and vapes (the PACT Act, the mail ban, Tobacco 21 and FDA's rules), firearms and ammunition, other age-gated goods, and age verification at checkout and at delivery. It extends `items`, `orders` and `fulfillments` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Age assurance as a general problem (estimation, vendors, the state laws on minors online) is the User-Generated Platforms volume's [Minors & Age Assurance](/books/user-generated-platforms/minors-and-age-assurance); cannabis and hemp are [Cannabis & Hemp](/books/commerce/cannabis-and-hemp); shipping hazardous goods (an e-liquid's battery, an aerosol) is [Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat). This chapter states the general shape of US law; the rules are state by state, change often, and every seller needs counsel for the states it ships to.

## How the Platforms Do It

As of October 2026, the carriers and payment providers set the practical limits, from their public pages:

| Company | Alcohol | Tobacco and vapes | Firearms and weapons |
| --- | --- | --- | --- |
| **USPS** | Nonmailable: "All spirituous, vinous, malted, fermented, or other intoxicating liquors of any kind" (18 U.S.C. 1716(f)), "including those obtained under a prescription or as a collector's item" | Cigarettes, smokeless tobacco and vapes nonmailable except narrow exceptions (18 U.S.C. 1716E, Publication 52 §472) | Handguns and other concealable firearms nonmailable except to listed officials and between licensed dealers (18 U.S.C. 1715) |
| **FedEx** | Only approved shippers under an agreement; "Individuals (consumers) cannot ship alcohol via FedEx"; adult signature (21+, ID) required; wine licensee-to-consumer only to states in its guide, beer and spirits licensee-to-licensee | Not in the sources here | Not in the sources here |
| **UPS** | Licensed shippers under a UPS alcohol agreement; adult signature required for wine and spirits; approved destination states listed in the agreement | Not in the sources here | Not in the sources here |
| **Stripe** | Prohibited only in India and Thailand; restricted in Indonesia and Canada | Restricted: "sold in accordance with applicable law"; in the US only FDA-authorized products | Firearms, regulated parts and weapons like stun guns and pepper spray need approval; illegal weapons prohibited |
| **Shopify** | Per the merchant's law and Shopify Payments' supported categories | Same | Same; unsupported categories must use a third-party processor |

<!-- source-gap: ups-alcohol-program | secondary | UPS's alcohol shipping agreement, adult-signature requirement and approved states (described from UPS help-page snippets; the pages returned 403 to retrieval) | closes with: the UPS alcohol and wine shipping pages opened directly | checked: 2026-10-28 -->

Three patterns:

- **The carrier is a regulator.** A carrier's contract is narrower than the law in most places: FedEx's alcohol program limits beer and spirits to shipments between licensees even where a state would allow them to reach consumers. A seller's eligible destinations are the intersection of state law, its own licenses and its carrier's rules.
- **Payments are gated by category.** Stripe's restricted list and Shopify Payments' supported categories mean a merchant selling vapes or firearm parts may need a different processor than the rest of the catalog, which affects checkout design, not just paperwork.
- **The adult signature is the control at the door.** Every carrier program that accepts alcohol requires a signature from someone 21 or older with ID. Shipping alcohol without it isn't an option to price, it's a breach of the carrier contract.

## Alcohol: The Three-Tier System

After Prohibition, the Twenty-first Amendment gave states control over alcohol coming into them: section 2 bars "The transportation or importation into any state, territory, or possession of the United States" of intoxicating liquors in violation of its laws. Most states used that power to build a **three-tier system**: producers (brewers, wineries, distillers and importers) sell to wholesalers, wholesalers sell to retailers (stores, bars, restaurants), and retailers sell to consumers, with each tier separately licensed and generally barred from owning the others. Some states run the wholesale or retail tier themselves (control states).

Federal law licenses the top tiers. The Federal Alcohol Administration Act requires a **basic permit** from the Alcohol and Tobacco Tax and Trade Bureau (TTB) to engage in business as an importer, a distiller, winery, rectifier, bottler or warehouseman, or a wholesaler "purchasing for resale at wholesale" (27 U.S.C. 203). Retailers aren't on that list; retail licensing is state and often local. TTB also regulates alcohol advertising: its wine rules define an advertisement as "any written or verbal statement, illustration, or depiction" aimed at interstate sales, across print, broadcast "or in any other media" (27 CFR 4.61), which is how product pages and social posts are treated in practice.

For a commerce system, the tiers decide who may sell to whom: a brand that is a winery sells to a wholesaler on a purchase order in most states and directly to consumers only where a DTC permit allows it; a retailer sells to consumers in its own state and ships out of state only where that state permits it.

## Direct-to-Consumer Shipping

Two Supreme Court cases set the limits on how states may treat out-of-state sellers:

- **Granholm v. Heald (2005).** Michigan and New York let in-state wineries ship directly to consumers while barring or burdening out-of-state wineries. The Court struck both down, 5 to 4: section 2 "did not give States the authority to pass nonuniform laws" that discriminate against out-of-state goods. States could ban winery shipping for everyone or allow it for everyone, and most chose to allow it under a permit.
- **Tennessee Wine & Spirits Retailers Ass'n v. Thomas (2019).** Tennessee required two years of state residency for a retail liquor license. The Court struck it down, 7 to 2: section 2 "does not license the States to adopt protectionist measures with no demonstrable connection to those interests."

Retailer shipping went the other way after Tennessee Wine. The courts of appeals have upheld state laws that let in-state retailers deliver but bar out-of-state retailers from shipping in: the Sixth Circuit for Michigan (Lebamoff Enterprises v. Whitmer, 2020), the Eighth Circuit for Missouri (Sarasota Wine Market v. Schmitt, 2021) and the Fourth Circuit for North Carolina (B-21 Wines v. Bauer, 2022), which held that even though North Carolina's bar "discriminates against interstate commerce -- it is authorized by Section 2 of the Twenty-first Amendment," because an out-of-state retailer shipping in would bypass the state's wholesalers entirely.

The result is three different maps. Winery-to-consumer shipping is allowed in most states under a state permit; retailer-to-consumer shipping across state lines in far fewer; spirits and beer shipping to consumers in only a handful. Current counts change every legislative session and come from industry trackers rather than any one statute. <!-- source-gap: dtc-shipping-state-counts | missing | the number of states allowing winery, out-of-state retailer and spirits direct-to-consumer shipping as of 2026 | closes with: the Sovos ShipCompliance/WineBusiness Analytics DTC Wine Shipping Report or an NCSL table | checked: 2026-10-28 -->

Where shipping is allowed, the state permit usually brings the same kinds of conditions, which the system has to enforce per destination state:

- **A permit per destination state,** held by the shipper, with a number that may have to appear on the package or the invoice.
- **Volume caps** per consumer per month or year, which means counting a customer's prior shipments into that state, across orders.
- **Tax collection and reporting:** state excise and sales tax on each shipment, and periodic reports of every shipment (recipient, volume, product).
- **Labels** stating that the package contains alcohol and requires an adult signature.
- **Approved carriers,** sometimes named by the state, always constrained by the carrier's own program.

## Tobacco and Vapes

Tobacco sold online is governed by the **PACT Act** (Prevent All Cigarette Trafficking Act), which the Preventing Online Sales of E-Cigarettes to Children Act extended to vapes in December 2020. "Cigarette" in the Act includes roll-your-own tobacco and "an electronic nicotine delivery system," defined as "any electronic device that, through an aerosolized solution, delivers nicotine, flavor, or any other substance," with its components and accessories (15 U.S.C. 375). For a seller making delivery sales, the Act requires:

- **Registration.** Before shipping or advertising, file with the US Attorney General and with the tobacco tax administrator of every state shipped into: names, trade names, addresses, websites, email and an in-state agent (15 U.S.C. 376(a)(1)).
- **Monthly reports.** By the 10th of each month, report every shipment into each state from the prior month (recipient name and address, brand, quantity, carrier), organized by city or town and ZIP code, to that state's tobacco tax administrator, with copies to local and tribal taxing jurisdictions (376(a)(2)).
- **Taxes first.** Confirm state and local excise taxes are paid and stamps affixed before handing the package to the carrier (376a(d)).
- **The package.** An outer label on the same surface as the address stating the contents' tax and licensing obligations; at most 10 pounds per sale or delivery (376a(b)).
- **Age verification twice.** Before accepting the order, verify the buyer's "full name, birth date, and residential address" against a commercially available database the seller doesn't control (376a(b)(4)); at delivery, use a method that requires the signature of the purchaser or another adult of legal age showing government photo ID.
- **Records** of every delivery sale kept until the end of the fourth full calendar year after it (376a(c)).

**The mail is closed.** Cigarettes and smokeless tobacco are nonmailable under 18 U.S.C. 1716E, and the 2020 law extended that to vapes; USPS's Publication 52 makes them nonmailable unless a narrow exception applies (intra-Alaska and intra-Hawaii, business-to-business among licensed companies, limited noncommercial adult-to-adult mailings, manufacturer consumer testing), and a mailing that fails any condition of the exception is nonmailable. Cigars aren't covered by 1716E. Penalties include prison, a civil penalty of ten times the retail value including taxes, and forfeiture.

**FDA sets the age and the product list.** Since Tobacco 21 (signed December 20, 2019, effective immediately), the federal minimum age for all tobacco products is 21. FDA's rule requires retailers to check photo ID with the bearer's date of birth for anyone under 30 (since September 30, 2024; "No such verification is required for any person over the age of 29"), and bars vending machines and self-service displays unless the facility ensures no one under 21 is present (21 CFR 1140.14). A vape is a "new tobacco product" that needs FDA marketing authorization; as of October 2026, FDA's list of authorized e-cigarettes runs from Vuse Solo (October 2021) through JUUL2 and its tobacco and menthol pods (August 28, 2026), and includes no fruit or sweet flavors. Unauthorized products "cannot be legally introduced into interstate commerce" and their sale "is subject to administrative, civil, and criminal enforcement." The Supreme Court upheld FDA's denials of flavored vape applications in FDA v. Wages and White Lion Investments (April 2, 2025, unanimous). States add flavor bans and registries of products allowed for sale; those vary and aren't covered in the sources here.

For the catalog, this means a vape item carries its FDA authorization status as data, and an item without it can't be listed for US sale; for checkout, a tobacco order needs a database age check before the order is accepted and an adult-signature delivery service after.

## Firearms and Ammunition

Federal firearms law routes online sales through licensees:

- **Through a dealer in the buyer's state.** A person who isn't a licensee may not receive in their state of residence a firearm acquired outside it (18 U.S.C. 922(a)(3)), and a licensee may not sell to an out-of-state resident except rifles and shotguns where the buyer "meets in person with the transferor" and the sale is lawful in both states (922(b)(3)). The practical result is the **FFL transfer**: the online seller ships to a federal firearms licensee in the buyer's state, and the buyer collects it there after the dealer runs the checks.
- **Background check and ID at transfer.** Before transferring to a non-licensee, the licensee must contact the National Instant Criminal Background Check System (NICS), verify photo ID, and may proceed on approval or if three business days pass without a denial (up to ten for buyers under 21 while juvenile records are checked) (922(t)).
- **Ages.** A licensee may not sell a firearm or ammunition to anyone under 18, or a handgun or its ammunition to anyone under 21 (922(b)(1)); 922(x) separately bars transferring a handgun or handgun-only ammunition to anyone under 18.
- **Carriers.** A shipper must give the carrier written notice of a package containing firearms or ammunition (922(e)); concealable firearms are nonmailable except between licensed dealers and to listed officials (18 U.S.C. 1715).
- **Who must be licensed.** ATF's 2024 rule defining "engaged in the business" as a dealer added presumptions about who must hold a license; on May 6, 2026 ATF proposed removing those presumptions, and as of October 2026 no final rule has been published.

States add their own rules, most visibly on ammunition (background checks at purchase, delivery only through licensed vendors), and those weren't retrievable when this was checked. <!-- source-gap: state-ammo-laws | missing | state ammunition sales and delivery rules (e.g., California Penal Code 30312 and 30370, New York Penal Law 400.03) | closes with: the state statute pages | checked: 2026-10-28 -->

For the system, a firearm order has a second ship-to: the buyer's address for the record and the receiving FFL's licensed premises for the shipment, with the FFL's license number verified before the order ships. The sale isn't complete until the dealer transfers it, and a denial at the counter is a return to the seller, not a delivery.

## Other Age-Gated Goods

Beyond alcohol, tobacco and firearms, states and localities restrict sales to minors of a varied list (knives, spray paint, some cough medicines, nitrous oxide, lottery tickets among them), and marketplaces and payment providers add their own restrictions on top. The federal government is also moving on kratom-derived products: on October 14, 2026 DEA gave notice that it will temporarily place 7-hydroxymitragynine and mitragynine pseudoindoxyl in Schedule I above a threshold recommended by HHS, a level that "would permit certain products to remain in the marketplace without being subject to schedule I controls." The specific state statutes for the other categories weren't covered in the sources here. <!-- source-gap: other-age-gated-statutes | missing | state statutes restricting sales of knives, spray paint, dextromethorphan, nitrous oxide and similar goods to minors | closes with: the state statute pages (e.g., Cal. Health & Safety Code 11110, Cal. Penal Code 594.1) | checked: 2026-10-28 -->

The design consequence is the same for all of them: the restriction is a property of a **category** with rules per jurisdiction (minimum age, whether shipping is allowed, what verification is needed when), and an item belongs to categories. Hard-coding "alcohol" into the checkout leaves the next category to a code change.

## Age Verification at Checkout and at Delivery

The law asks for age checks at specific moments, and each moment has its own method:

| Moment | Method | Required by |
| --- | --- | --- |
| **Account or checkout** | Date of birth attestation, then a database match of name, birth date and address | PACT Act for tobacco and vapes (database match before accepting the order); carrier and state programs for alcohol in practice |
| **Store counter** | Photo ID with date of birth | FDA for tobacco under 30; state law for alcohol |
| **Pickup** | Photo ID at handover | The same rules as the counter ([Pickup](/books/commerce/omnichannel-fulfillment#pickup)) |
| **Parcel delivery** | Adult signature service (21+, ID) | Carrier alcohol programs; PACT Act for tobacco |
| **Local delivery** | Courier scans or checks ID at the door, refuses and returns if it fails | State alcohol delivery rules and platform policies ([The Handoff](/books/commerce/orders-dispatch-and-batching#the-handoff)) |
| **Firearm transfer** | Photo ID and NICS check by the receiving FFL | 18 U.S.C. 922(t) |

Rules for the system:

- **The check at the door is the one that counts.** A checkout check proves who ordered; only the delivery check proves who received. For alcohol by carrier and tobacco, the shipment must use the adult-signature service, chosen by the system from the items, never left to the warehouse.
- **A failed check has a path.** A courier who can't verify age returns the order; a parcel carrier that can't get an adult signature holds or returns it. The return has its own reason code, and the customer may owe a fee under the store's terms ([Return Fees and Restocking](/books/commerce/returns-and-exchanges#return-fees-and-restocking)).
- **Store the result, not the document.** A verification record says which method, which vendor, the outcome, a reference and when; an ID image is sensitive personal data with a short retention, if it's kept at all ([Vendor Risk](/books/user-generated-platforms/minors-and-age-assurance#vendor-risk), [Retention Windows](/docs/architecture/data-retention#retention-windows)).
- **Express checkouts can't skip the rule.** Accelerated checkout buttons start a checkout that bypasses the storefront's steps, so the age and eligibility checks must run in the checkout itself ([Cart & Checkout](/books/commerce/cart-and-checkout)).

## How to Build It

This chapter adds restricted categories and their rules per jurisdiction, item assignments, shipping eligibility, seller licenses and permits, age verifications, firearm transfers and PACT reports:

```sql
CREATE TABLE restricted_categories (     -- alcohol.wine, alcohol.spirits, tobacco.ends, firearm.long_gun
  code         TEXT PRIMARY KEY,
  parent_code  TEXT REFERENCES restricted_categories (code),
  name         TEXT NOT NULL
);

CREATE TABLE item_restricted_categories (
  item_id       UUID NOT NULL REFERENCES items (id),
  category_code TEXT NOT NULL REFERENCES restricted_categories (code),
  attributes    JSONB NOT NULL DEFAULT '{}',  -- ABV, volume in mL, FDA marketing order, caliber
  PRIMARY KEY (item_id, category_code)
);

CREATE TABLE seller_licenses (           -- permits the merchant holds, per jurisdiction
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  kind           TEXT NOT NULL,          -- 'ttb_basic_permit', 'state_dtc_wine', 'pact_registration',
                                         -- 'state_tobacco_retail', 'ffl'
  jurisdiction   TEXT NOT NULL,          -- 'US', 'US-CA', a county or city code
  number         TEXT NOT NULL,
  valid_during   DATERANGE NOT NULL,
  document_id    UUID REFERENCES documents (id),
  status         TEXT NOT NULL CHECK (status IN ('active', 'pending', 'expired', 'revoked'))
);

CREATE TABLE shipping_eligibility_rules (  -- may this category go to this place, and how
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  category_code    TEXT NOT NULL REFERENCES restricted_categories (code),
  destination      TEXT NOT NULL,        -- 'US-NC', or a ZIP prefix for dry counties
  seller_kind      TEXT NOT NULL CHECK (seller_kind IN ('producer', 'retailer', 'any')),
  allowed          BOOLEAN NOT NULL,
  minimum_age      SMALLINT,
  required_license TEXT,                 -- the seller_licenses.kind needed
  checkout_check   TEXT CHECK (checkout_check IN ('none', 'attestation', 'database_match')),
  delivery_check   TEXT CHECK (delivery_check IN ('none', 'adult_signature', 'id_scan',
                     'ffl_transfer')),
  volume_cap       JSONB,                -- {"unit": "liters", "max": 9, "per": "month"}
  allowed_carriers TEXT[],
  rule_ref         TEXT NOT NULL,        -- the statute, regulation or carrier agreement
  valid_during     DATERANGE NOT NULL,
  EXCLUDE USING gist (category_code WITH =, destination WITH =, seller_kind WITH =,
                      valid_during WITH &&)
);

CREATE TABLE age_verifications (         -- a check, at a moment, with a result
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id      UUID REFERENCES orders (id),
  fulfillment_id UUID REFERENCES fulfillments (id),
  customer_id   UUID REFERENCES customers (id),
  moment        TEXT NOT NULL CHECK (moment IN ('account', 'checkout', 'counter', 'pickup',
                  'delivery', 'ffl_transfer')),
  method        TEXT NOT NULL CHECK (method IN ('attestation', 'database_match', 'id_scan',
                  'visual_id', 'adult_signature', 'nics')),
  vendor        TEXT,                    -- the verification provider or the carrier
  vendor_ref    TEXT,
  result        TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'inconclusive',
                  'refused')),
  verified_by   UUID,                    -- staff or courier, for in-person checks
  minimum_age   SMALLINT NOT NULL,
  rule_ref      TEXT NOT NULL,
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fulfillments
  ADD COLUMN delivery_check        TEXT,   -- copied from the rule when the fulfillment is created
  ADD COLUMN receiving_ffl_license TEXT,   -- firearm orders: the transferring dealer
  ADD COLUMN receiving_ffl_address JSONB;

CREATE TABLE pact_shipment_reports (     -- one month, one state, as filed
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  destination   TEXT NOT NULL,           -- 'US-TX'
  period        DATERANGE NOT NULL,      -- the prior calendar month
  due_on        DATE NOT NULL,           -- the 10th of the following month
  document_id   UUID REFERENCES documents (id),  -- the filing as sent
  filed_at      TIMESTAMPTZ,
  UNIQUE (merchant_id, destination, period)
);

-- Can this cart ship to this state? Every restricted line must have an allowing rule
-- and the merchant must hold the license that rule requires.
SELECT ol.item_id, irc.category_code, r.allowed, r.required_license,
       (sl.id IS NOT NULL) AS license_held
FROM cart_lines ol
JOIN item_restricted_categories irc ON irc.item_id = ol.item_id
LEFT JOIN shipping_eligibility_rules r
  ON r.category_code = irc.category_code AND r.destination = $2
 AND r.seller_kind IN ($3, 'any') AND r.valid_during @> CURRENT_DATE
LEFT JOIN seller_licenses sl
  ON sl.merchant_id = $4 AND sl.kind = r.required_license AND sl.status = 'active'
 AND sl.jurisdiction IN ('US', $2) AND sl.valid_during @> CURRENT_DATE
WHERE ol.cart_id = $1;
```

Design notes:

- **Categories, not flags.** An item can be wine and a gift set; a vape kit can be a tobacco product and contain a lithium battery. Categories with a hierarchy and attributes (ABV, volume, FDA marketing order) let rules match at the right level ([Rules as Data](/docs/architecture/rules-as-data)).
- **A missing rule means no.** The eligibility query treats a restricted line with no allowing rule as ineligible; a new state or category is closed until someone adds the rule with its source.
- **Volume caps count history.** A cap per consumer per period is a sum over that customer's prior shipments of that category into that state, computed at checkout and again at shipment; identity merges across accounts matter here ([Customers, Accounts & Privacy](/books/commerce/customers-and-accounts)).
- **The delivery check is copied onto the fulfillment.** The rule in force when the fulfillment was created decides the carrier service, and the label purchase refuses a service that doesn't provide it ([Labels](/books/commerce/shipping-and-carriers#labels)).
- **Reports are generated from shipments.** The PACT report for a state and month is a query over delivered and shipped fulfillments with tobacco lines, stored as filed, with its due date computed and tracked ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Order holds for compliance.** An order that needs a person (an FFL license not yet verified, a failed database match) goes on a compliance hold rather than failing silently ([Order Management](/books/commerce/order-management)).

## Auditing

- **Every age verification,** with the moment, method, vendor reference, result and rule, for every order with a restricted line.
- **The eligibility decision for each restricted order:** the destination, the rule that allowed it and its version, and the license relied on ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Every shipment of tobacco or vapes** with the PACT fields (recipient, brand, quantity, carrier) and the monthly report it went into.
- **Every firearm order's transfer:** the receiving FFL, its license verification and the outcome at the counter.
- **License and permit history** per jurisdiction, with expiry alerts, because shipping on an expired permit is shipping without one.
- **Volume cap calculations** per customer and state, so a regulator's question about one consumer's shipments has a direct answer.

## What This Means for the System You Build

- **Model restrictions as categories with per-jurisdiction rules,** each with a source and an effective period, and treat a missing rule as a prohibition.
- **Check eligibility in the checkout itself,** including express checkouts, and again at fulfillment.
- **Hold licenses and permits as records** with jurisdictions and expiry, and require the right one for each rule.
- **Verify age at every moment the law names,** store the result and reference rather than the ID, and choose the adult-signature service automatically.
- **Give firearm orders a receiving FFL** and treat the transfer as the completion of the sale.
- **Generate PACT and state shipment reports from fulfillment data** and track their deadlines.
- **Keep carrier programs in the rules,** because a carrier's contract can be stricter than the state.

## References

**Constitution and cases**

- [Twenty-first Amendment (Cornell LII)](https://www.law.cornell.edu/constitution/amendmentxxi), section 2 on transportation or importation in violation of state law
- [Granholm v. Heald, 544 U.S. 460 (2005) (Cornell LII)](https://www.law.cornell.edu/supremecourt/text/544/460), discriminatory winery shipping laws struck down
- [Tennessee Wine & Spirits Retailers Ass'n v. Thomas, 588 U.S. 504 (2019) (Cornell LII)](https://www.law.cornell.edu/supremecourt/text/18-96), durational residency for retail licenses struck down
- [B-21 Wines, Inc. v. Bauer, No. 21-1906 (4th Cir. 2022)](https://www.ca4.uscourts.gov/opinions/211906.P.pdf), North Carolina's out-of-state retailer shipping bar upheld, citing Lebamoff v. Whitmer (6th Cir. 2020) and Sarasota Wine Market v. Schmitt (8th Cir. 2021)
- [FDA v. Wages and White Lion Investments, LLC, No. 23-1038 (2025) (Cornell LII)](https://www.law.cornell.edu/supremecourt/text/23-1038), FDA's flavored vape denials upheld

**Alcohol**

- [27 U.S.C. 203 (Cornell LII)](https://www.law.cornell.edu/uscode/text/27/203), the FAA Act basic permit requirement
- [27 CFR 4.61 (Cornell LII)](https://www.law.cornell.edu/cfr/text/27/4.61), the definition of a wine advertisement
- [18 U.S.C. 1716 (Cornell LII)](https://www.law.cornell.edu/uscode/text/18/1716), intoxicating liquors nonmailable in subsection (f)
- [USPS Publication 52, §424: Intoxicating liquors](https://pe.usps.com/text/pub52/pub52c4_008.htm), alcohol nonmailable including by prescription or as a collectible
- [FedEx: Shipping alcohol](https://www.fedex.com/en-us/shipping/alcohol.html), approved shippers, no consumer shipping, adult signature and licensee rules

**Tobacco and vapes**

- [15 U.S.C. 375 (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/375), PACT Act definitions including electronic nicotine delivery systems
- [15 U.S.C. 376 (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/376), registration and monthly reports
- [15 U.S.C. 376a (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/376a), delivery sale labels, weight limit, age verification, records and taxes
- [18 U.S.C. 1716E (Cornell LII)](https://www.law.cornell.edu/uscode/text/18/1716E), cigarettes, smokeless tobacco and vapes nonmailable, exceptions and penalties
- [USPS Publication 52, §472: Cigarettes, smokeless tobacco and ENDS](https://pe.usps.com/text/pub52/pub52c4_027.htm), the mailability rules and exceptions
- [FDA: Tobacco 21](https://www.fda.gov/tobacco-products/retail-sales-tobacco-products/tobacco-21), the federal minimum age and the under-30 photo ID rule from September 30, 2024
- [21 CFR 1140.14 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1140.14), retailer age verification and self-service limits
- [FDA: Tobacco products marketing orders](https://www.fda.gov/tobacco-products/market-and-distribute-tobacco-product/tobacco-products-marketing-orders), the authorized e-cigarette list and enforcement against unauthorized products

**Firearms and other goods**

- [18 U.S.C. 922 (Cornell LII)](https://www.law.cornell.edu/uscode/text/18/922), interstate transfer limits, age limits, carrier notice and NICS
- [18 U.S.C. 1715 (Cornell LII)](https://www.law.cornell.edu/uscode/text/18/1715), concealable firearms nonmailable
- [Federal Register: Definition of "engaged in the business" as a dealer in firearms (April 19, 2024)](https://www.federalregister.gov/documents/2024/04/19/2024-07838/definition-of-engaged-in-the-business-as-a-dealer-in-firearms), the 2024 rule
- [Federal Register: Revising regulations defining "engaged in the business" (May 6, 2026)](https://www.federalregister.gov/documents/2026/05/06/2026-08919/revising-regulations-defining-engaged-in-the-business-as-a-dealer-in-firearms), the proposal to remove the presumptions
- [Federal Register: DEA notice on 7-hydroxymitragynine (October 14, 2026)](https://www.federalregister.gov/api/v1/documents/2026-20943.json), temporary scheduling above an HHS threshold

**Payments**

- [Stripe: Restricted businesses](https://stripe.com/legal/restricted-businesses), alcohol, tobacco and weapons restrictions
- [Shopify Help: Shopify Payments requirements](https://help.shopify.com/en/manual/payments/shopify-payments/shopify-payments-requirements), unsupported categories needing a third-party processor
</content>
</invoke>
