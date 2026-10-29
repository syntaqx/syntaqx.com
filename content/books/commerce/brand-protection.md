+++
title = "Brand Protection"
description = "Brand Registry and marketplace IP programs, counterfeits and platform liability, unauthorized resellers and first sale, MAP enforcement, and INFORM disclosures."
category = "Commerce Industry"
order = 2331
part = "Marketplaces"
tags = ["commerce", "marketplaces", "brand-protection", "counterfeits", "trademark", "map"]
+++

A brand that sells on marketplaces doesn't control who else sells its products there. On a single listing page a screen protector brand can find its own offer, an authorized retailer's offer, a reseller who bought pallets at a liquidation auction, a gray-market importer selling a version made for another country, and a counterfeiter using the brand's photos. Each calls for a different response, and the law treats each differently. A counterfeit is infringement, and the marketplace will remove it when the brand proves its rights. A genuine product resold by someone the brand never authorized is usually lawful, whatever the brand's distribution agreements say. And a reseller undercutting the brand's advertised price is, at most, a reason to stop selling to whoever supplied them, never a trademark claim.

This chapter covers the marketplaces' brand programs (Amazon Brand Registry, Project Zero, Transparency and IP Accelerator, Walmart Brand Portal, eBay VeRO), counterfeits and the law of platform liability, unauthorized resellers under the first-sale doctrine and its "material differences" and quality control exceptions, enforcing a MAP policy without breaking antitrust law, and what the INFORM Consumers Act's seller disclosures give a brand. The MAP policy itself and resale price law are in [MAP and Resale Price Maintenance](/books/commerce/pricing#map-and-resale-price-maintenance). The marketplace's side of seller verification is the User-Generated Platforms volume's [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#the-inform-consumers-act), and a marketplace's own counterfeit and goods fraud defenses are its [Goods Fraud](/books/user-generated-platforms/marketplace-fraud#goods-fraud). Selling on Amazon itself (accounts, fees, the Buy Box) is the companion chapter Selling on Amazon. This chapter extends `brands` and `listings` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `trademarks`, `brand_registrations`, `authorized_resellers`, `infringement_reports` and `map_violations`.

## How the Platforms Do It

As of October 2026, from the marketplaces' brand program pages:

| Program | Who can enroll | What it gives the brand | Cost and limits |
| --- | --- | --- | --- |
| **Amazon Brand Registry** | The trademark owner (or users it adds) with "an active registered trademark or a pending trademark registration" from an office in a country with an Amazon store; the brand name must be permanently affixed to products or packaging | Report a Violation (IP, policy and regulatory reports), A+ Content, Brand Stores, Brand Analytics, experiments, Sponsored Brands, Vine; access to Project Zero and Transparency | Free; Report a Violation works without a selling account, A+ Content and Stores need one |
| **Amazon Project Zero** | Brand Registry rights owners with a registered trademark who used Report a Violation in the past 6 months with at least a 90% acceptance rate | Automated protections, self-service removal of counterfeit listings without Amazon review, serialization through Transparency | A 10-minute training; 99% accuracy required to keep removal access; 22 countries |
| **Amazon Transparency** | Brand Registry rights owners with an active registered trademark and a GTIN for each product | A unique serial code per unit, which shoppers can scan with Amazon's apps | No enrollment fee; $0.05 per code up to 1 million a year, $0.03 to 10 million, $0.01 above; Amazon-issued codes must go on every unit made, wherever sold |
| **Amazon IP Accelerator** | Sellers without a trademark | Introductions to vetted law firms at pre-negotiated fees, and Brand Registry protections "even if their trademark registration is still pending" | US trademark application $700 plus government fees; 22 countries or regions |
| **Walmart Brand Portal** | Brands with "an active trademark registration with the USPTO" for each brand | IP claims with status tracking, authorized users, brand content, assigning ownership or rights to an acting brand owner or authorized resellers | A registered US mark; a pending application isn't enough |
| **eBay VeRO** | Owners of trademarks, copyrights and other IP | Free VeRO profiles that describe the owner's rights, and a reporting route for infringing listings | The profile directory "isn't a complete list of all brands with IP rights on eBay" |

Three patterns run through the table:

- **The trademark is the key to every door.** Every program starts from a trademark registration (or, on Amazon, an application), and its number is what the brand types into each portal. A brand without one can't use any of them, which is why Amazon sells trademark filings through IP Accelerator.
- **Trust is earned with accuracy.** Project Zero hands a brand the power to delete listings itself, but only after six months of accurate reports, and takes it back below 99% accuracy. A brand's report history is an asset with a number attached.
- **The scale is the marketplace's, not the brand's.** Amazon's 2024 Brand Protection Report claims more than 99% of suspected infringing listings blocked before a brand reported them, more than 15 million counterfeits seized, and valid infringement notices down about 35% since 2020. Its April 2026 successor, renamed the Trustworthy Shopping Experience Report, gives similar figures for 2025 and more than 2.7 billion Transparency units verified since 2017. A brand's own enforcement catches what gets past those systems.

## Trademarks First

A brand protection program is only as strong as its registrations. What each registration needs to record:

- **Office and number.** Amazon accepts marks "issued by a government trademark office in a country with a corresponding Amazon store," pending or registered; Walmart requires a registered USPTO mark. A brand selling in five marketplace countries often needs registrations in several offices.
- **The mark as it appears.** Brand Registry accepts word marks and design marks containing "words, letters, or numbers," and the trademark text must match the brand name enrolled. A logo-only mark with no words won't enroll.
- **Classes and goods.** A registration covers goods in its classes; a report against a listing in an unregistered class is weaker.
- **Status and renewal.** A pending application gives Amazon access but not Project Zero, which needs a registered mark; a lapsed registration loses everything. Renewal dates are deadlines.

Copyright and design rights do separate work. A counterfeiter who copies a brand's product photos infringes the brand's copyright in the photos whether or not the goods are fake; marketplaces take copyright reports under notice-and-takedown procedures the User-Generated Platforms volume describes ([Notices](/books/user-generated-platforms/copyright#notices)). A design patent covers the shape of the product itself, which matters when the copy carries no logo at all.

## Counterfeits

A counterfeit is a fake: goods bearing a mark identical to or indistinguishable from a registered mark, made without the owner's authorization. Selling one is trademark infringement under Lanham Act section 32, which reaches any use of "a reproduction, counterfeit, copy, or colorable imitation of a registered mark" that "is likely to cause confusion, or to cause mistake, or to deceive" (15 U.S.C. 1114(1)). The hard question for marketplaces has been whether the platform is liable too.

**Contributory liability turns on specific knowledge.** In *Tiffany (NJ) Inc. v. eBay Inc.* (2d Cir. 2010), Tiffany argued that eBay knew counterfeit Tiffany jewelry was widely sold on its site. The court held that general knowledge isn't enough: "a service provider must have more than a general knowledge or reason to know that its service is being used to sell counterfeit goods. Some contemporary knowledge of which particular listings are infringing or will infringe in the future is necessary." It added that "a service provider is not, we think, permitted willful blindness." That standard is why marketplace brand protection runs on notices: a notice about a particular listing creates the knowledge, and removing the listing promptly ends the exposure.

**The SHOP SAFE Act would change the standard for some goods.** The bill introduced in the 117th Congress as H.R. 5374 (September 2021) would make a platform contributorily liable for a third-party seller's counterfeits of "goods that implicate health and safety" unless it followed a list of best practices: verifying seller identity and a US address or agent, requiring sellers to attest to authenticity, displaying the seller's identity, location and ship-from country, screening proactively, removing listings expeditiously after notice, and terminating repeat offenders (generally three infringing listings in a year). It would apply to platforms with $500,000 or more in prior-year sales, exempt low-volume sellers, and penalize bad-faith notices. It hasn't been enacted, and I couldn't confirm whether a version is pending in the current Congress. <!-- source-gap: shop-safe-119th | status | whether the SHOP SAFE Act was reintroduced in the 119th Congress, its bill number and status | closes with: the congress.gov bill page | checked: 2026-10-28 -->

What the marketplaces' programs do with a counterfeit report:

- **Report a Violation** on Amazon takes the brand's claim (counterfeit, trademark, copyright, patent) against a listing, with the registration number and evidence; Amazon reviews it and the listing comes down or doesn't. The acceptance rate of those reports is what qualifies the brand for Project Zero.
- **Self-service removal** in Project Zero skips Amazon's review: the brand deletes the listing directly, in each store where it holds a registered mark, and bears the accuracy requirement.
- **Serialization** in Transparency gives every unit its own code, so a unit without a valid one is identifiable as not the brand's; shoppers can scan the code themselves. Because Amazon-issued codes must go on every unit the brand makes, wherever it's sold, Transparency is a manufacturing decision as much as a marketplace one.
- **Test buys** produce the evidence. A brand that suspects a listing orders the product, inspects it against its own specifications, and records what arrived, from whom, and how it differs. The test buy's photos and inspection notes are what an infringement report, a cease-and-desist letter or a lawsuit relies on.
- **Referrals to law enforcement and lawsuits.** Amazon's Counterfeit Crimes Unit, launched in 2020, says it has pursued more than 32,000 bad actors through litigation and criminal referrals. A brand can join those cases with evidence; the marketplace's own litigation is its business.

Counterfeits shipped through a marketplace's fulfillment network can be commingled with genuine stock under the same identifier, which is the problem Transparency's per-unit codes solve; the companion Selling on Amazon chapter covers FBA from the seller's side.

## Unauthorized Resellers and First Sale

Most offers a brand didn't authorize aren't counterfeits. They are genuine products bought from a distributor that sold outside its agreement, from a retailer's overstock, from a liquidator or from a store's shelves, and resold. Here trademark law mostly sides with the reseller.

**The first-sale doctrine.** Since *Prestonettes v. Coty* (1924), courts have held that "the right of a producer to control distribution of its trademarked product does not extend beyond the first sale of the product. Resale by the first purchaser of the original article under the producer's trademark is neither trademark infringement nor unfair competition" (*Sebastian International v. Longs Drug Stores*, 9th Cir. 1995). In *Sebastian*, a salon-only hair care brand put a "Sebastian Collective Salon Member" mark on its bottles to stop drugstores reselling them; the court refused, holding that a purchaser "who does no more than stock, display, and resell a producer's product under the producer's trademark violates no right conferred upon the producer by the Lanham Act," even if shoppers wrongly assume the reseller is authorized. A brand's distribution agreement binds the distributor that signed it, not the stranger who bought from that distributor.

**The material differences exception.** First sale protects only genuine goods, and courts don't treat goods as genuine when they differ materially from what the brand sells in the market. In *Société des Produits Nestlé v. Casa Helvetia* (1st Cir. 1992), Venezuelan-made Perugina chocolates imported into Puerto Rico differed from the Italian ones in milk fat, ingredients, shapes, packaging and price, and the court set a low bar: "the existence of any difference between the registrant's product and the allegedly infringing gray good that consumers would likely consider to be relevant when purchasing a product creates a presumption of consumer confusion." It noted that the differences need not be physical: "differences in, say, warranty protection or service commitments" may make products non-identical. That footnote is why many brands' warranties are honored only for purchases from authorized sellers: a product without the brand's warranty is, arguably, a materially different product.

**The quality control exception.** Goods are also not genuine if they escape the brand's quality controls. The Second Circuit's test, from *Warner-Lambert v. Northside Development* (1996) as restated in *Zino Davidoff SA v. CVS Corp.* (2d Cir. 2009), is that a brand may stop sales that subvert its quality control upon showing that "(i) the asserted quality control procedures are established, legitimate, substantial, and nonpretextual, (ii) it abides by these procedures, and (iii) sales of products that fail to conform to these procedures will diminish the value of the mark." In *Davidoff*, CVS sold genuine Cool Water fragrance with the unique production codes cut, dissolved or ground off; the court enjoined it, because the codes let Davidoff detect counterfeits and run targeted recalls, and "the actual quality of the goods is irrelevant; it is the control of quality that a trademark holder is entitled to maintain." It also held damaged luxury packaging was itself a material difference. The court added a warning brands should read: "If the codes served only to help Davidoff exert control over the distribution and sales network, different questions would arise."

**Gray-market imports at the border.** Goods made abroad for another market are the classic gray market. For copyrighted goods, *Kirtsaeng v. John Wiley & Sons* (2013) held that "the 'first sale' doctrine applies to copies of a copyrighted work lawfully made abroad," so a copyright in the packaging or manual can't block resale of an imported genuine product. For trademarks, *K mart v. Cartier* (1988) upheld Customs' exception for goods made by a company under common control with the US mark owner, and CBP's Lever rule (19 CFR 133.23) restricts gray-market goods CBP has found "physically and materially different" from the US version unless they carry a label saying the product "is not a product authorized by the United States trademark owner for importation." 19 CFR 133.2(e) lists the differences that count: composition, formulation, construction, performance, and regulatory or certification differences.

What this means for a brand's program:

- **A report must name the right claim.** "Unauthorized seller" is not infringement. A report says counterfeit (with a test buy), materially different (naming the difference: no warranty, a different formulation, removed codes, damaged packaging), or a policy violation of the marketplace's own (a used item listed as new). Marketplaces reject reports that assert distribution rights as trademark rights, and every rejection counts against the brand's acceptance rate.
- **Material differences must be real and documented.** A warranty that excludes unauthorized purchases, a quality control process (lot codes, storage requirements, inspection) applied consistently, and what the brand's authorized sellers must do, written down before any dispute. *Davidoff* won because the codes were used for recalls; a process invented for enforcement is pretext.
- **Supply is the lever.** The durable fix for diversion is the distribution contract: authorized reseller agreements with marketplace terms, lot codes that trace a diverted unit to the account that sold it, and termination of the account. Enforcement against a stranger reseller rests on the exceptions above; enforcement against an authorized one rests on the contract.

## Authorized Reseller Programs

Most brands that sell on marketplaces run an authorized reseller program: a list of who may sell, where, under what terms. The program is a set of contracts and a published list:

- **The agreement** with each reseller: which channels and marketplaces it may sell on, whether it may sell to other resellers, condition and storage requirements, the brand's warranty and returns terms, and what happens on breach. Walmart's Brand Portal lets a brand assign rights to "authorized resellers," which is the marketplace-side record of the same list.
- **The public list.** Brands publish their authorized retailers so shoppers (and warranty claims) can tell the difference, and so a marketplace reviewing a material-differences claim can see it.
- **Lot and serial tracing.** A unit found with an unauthorized seller is traced, by its lot or serial number, back to the authorized account that sold it. Transparency codes do this on Amazon; the brand's own serials or lot codes do it elsewhere.
- **The MAP policy** is separate and unilateral ([MAP enforcement](#map-enforcement)); bundling it into the reseller agreement as an agreed price changes its legal character.

## MAP Enforcement

A minimum advertised price policy tells resellers the lowest price they may advertise; the law on it is in [MAP and Resale Price Maintenance](/books/commerce/pricing#map-and-resale-price-maintenance), and the policy itself lives in that chapter's `map_policies`. Enforcing it across marketplaces is where brands get into trouble, because the legal shelter is narrow. Under *United States v. Colgate*, a brand may announce a policy and decide unilaterally whom it deals with; once it negotiates, threatens or makes side deals with individual resellers, it looks like an agreement on price, judged under the rule of reason federally and per se illegal under some state laws.

Enforcement that stays inside the shelter:

- **Monitor, record, apply the policy's own steps.** A violation is an observed advertised price below MAP, on a listing, at a time, with a screenshot. The response is the step the published policy names (a notice, a period of suspended supply), applied the same way to every reseller.
- **Only against resellers you supply.** A MAP policy binds nothing on a stranger. A reseller who buys elsewhere and advertises below MAP has broken no agreement and infringed no mark; the remedy is finding which authorized account supplied them.
- **Never a trademark report for a price.** Reporting a below-MAP listing as infringing to get it removed is the wrong claim (a genuine product at a low price infringes nothing, *Sebastian*), and a false or bad-faith notice exposes the brand to the marketplace's own sanctions and, under bills like SHOP SAFE, to penalties.
- **No negotiation.** A reseller who asks for an exception gets the policy, not a deal. Records that show violations handled by the policy, never by agreement with one reseller, are the defense.

Marketplaces don't enforce a brand's MAP. Amazon, Walmart and eBay set their own pricing policies against prices that harm customers, which are their rules, not the brand's (the companion Selling on Amazon chapter covers Amazon's).

## INFORM Disclosures

The INFORM Consumers Act (15 U.S.C. 45f), effective June 27, 2023, makes marketplaces collect and verify identity, bank and tax information from high-volume third-party sellers (200 or more sales and $5,000 or more in any 12 months of the last 24), and disclose the full name, physical address and contact information of sellers with $20,000 or more in annual gross revenues on the marketplace, with a way to report suspicious activity on each listing. The marketplace's duties and their build are in [The INFORM Consumers Act](/books/user-generated-platforms/supply-onboarding#the-inform-consumers-act). For a brand, three things follow:

- **The seller has a name and address.** A brand that finds an unauthorized or counterfeit seller above the disclosure threshold can read who they are from the listing, which makes a cease-and-desist letter, a test buy's paper trail or a lawsuit possible without first subpoenaing the marketplace.
- **The reporting channel is for anyone.** Each high-volume seller's listings carry an electronic and telephone channel to report suspicious marketplace activity, a route in addition to the brand programs. The FTC's first INFORM action, *United States v. Whaleco Inc.* (Temu), filed September 5, 2025 with a $2 million civil penalty, alleged both undisclosed seller addresses and reporting mechanisms that weren't consistently electronic and telephonic.
- **Disclosure has limits.** Home-based sellers may show only country and state, and sales below the thresholds aren't covered, so the information isn't there for every seller.

In the EU, the Digital Services Act's trader traceability rules (Article 30) give the same kind of information for traders selling to EU consumers ([DSA Trader Traceability](/books/user-generated-platforms/supply-onboarding#dsa-trader-traceability)).

## How to Build It

Trademarks, marketplace registrations, the authorized reseller list, infringement reports with their evidence, and MAP violations, extending `brands` and `listings` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and pointing at `map_policies` from [Pricing & Price Lists](/books/commerce/pricing#how-to-build-it):

```sql
CREATE TABLE trademarks (                  -- the registrations every program asks for
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  brand_id            UUID NOT NULL REFERENCES brands (id),
  office              TEXT NOT NULL,       -- 'USPTO', 'EUIPO', 'UKIPO', 'JPO', ...
  mark_text           TEXT,                -- null for a design mark with no words
  mark_kind           TEXT NOT NULL CHECK (mark_kind IN ('word', 'design', 'combined')),
  classes             SMALLINT[] NOT NULL, -- Nice classes covered
  application_number  TEXT NOT NULL,
  registration_number TEXT,                -- null while pending
  status              TEXT NOT NULL CHECK (status IN ('pending', 'registered', 'abandoned',
                        'cancelled', 'expired')),
  registered_on       DATE,
  renewal_due_on      DATE,                -- a deadline, watched
  UNIQUE (office, application_number)
);

CREATE TABLE brand_registrations (         -- the brand enrolled in one marketplace program
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  brand_id        UUID NOT NULL REFERENCES brands (id),
  trademark_id    UUID NOT NULL REFERENCES trademarks (id),
  channel_id      TEXT NOT NULL REFERENCES sales_channels (id),  -- 'amazon_us', 'walmart', 'ebay'
  program         TEXT NOT NULL,           -- 'brand_registry', 'project_zero', 'transparency',
                                           -- 'brand_portal', 'vero'
  external_ref    TEXT,                    -- the program's brand or profile ID
  status          TEXT NOT NULL CHECK (status IN ('applied', 'active', 'suspended', 'ended')),
  enrolled_at     TIMESTAMPTZ,
  UNIQUE (brand_id, channel_id, program)
);

CREATE TABLE authorized_resellers (        -- who may sell, where, under which agreement
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  brand_id        UUID NOT NULL REFERENCES brands (id),
  company_id      UUID REFERENCES companies (id),  -- the reseller as a B2B buyer
  name            TEXT NOT NULL,
  channel_id      TEXT REFERENCES sales_channels (id),  -- null: every channel
  seller_ref      TEXT,                    -- their seller ID on that channel
  agreement_ref   TEXT NOT NULL,           -- the signed agreement, as signed
  valid_during    TSTZRANGE NOT NULL,
  published       BOOLEAN NOT NULL DEFAULT TRUE,  -- on the public authorized list
  UNIQUE (brand_id, channel_id, seller_ref)
);

CREATE TABLE infringement_reports (        -- one claim against one listing, with its evidence
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  brand_id        UUID NOT NULL REFERENCES brands (id),
  channel_id      TEXT NOT NULL REFERENCES sales_channels (id),
  listing_ref     TEXT NOT NULL,           -- the channel's listing or offer ID (an ASIN and seller)
  seller_ref      TEXT,
  seller_disclosed JSONB,                  -- the INFORM or DSA disclosure as shown, snapshot
  claim           TEXT NOT NULL CHECK (claim IN ('counterfeit', 'trademark', 'copyright',
                    'design_patent', 'utility_patent', 'material_difference',
                    'marketplace_policy')),
  basis_ref       UUID,                    -- the trademark, copyright or patent relied on
  difference      TEXT,                    -- for material_difference: what differs, specifically
  evidence        JSONB NOT NULL,          -- test buy order, inspection, photos, screenshots
  route           TEXT NOT NULL CHECK (route IN ('report_a_violation', 'self_service_removal',
                    'portal_claim', 'vero_notice', 'inform_report', 'legal_letter', 'lawsuit')),
  external_case_ref TEXT,                  -- the marketplace's case ID
  status          TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected',
                    'withdrawn', 'reinstated')),
  submitted_by    TEXT NOT NULL,           -- the person, or the monitoring rule version
  submitted_at    TIMESTAMPTZ,
  decided_at      TIMESTAMPTZ
);

CREATE TABLE map_violations (              -- an advertised price below MAP, as observed
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  map_policy_id   UUID NOT NULL REFERENCES map_policies (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  channel_id      TEXT NOT NULL REFERENCES sales_channels (id),
  seller_ref      TEXT NOT NULL,
  authorized_reseller_id UUID REFERENCES authorized_resellers (id),  -- null: a stranger
  advertised_price BIGINT NOT NULL,
  map_price       BIGINT NOT NULL,         -- snapshot from map_policy_items
  currency        CHAR(3) NOT NULL,
  observed_at     TIMESTAMPTZ NOT NULL,
  evidence_ref    TEXT NOT NULL,           -- the screenshot or page capture
  policy_step     TEXT,                    -- the step the published policy names, when applied
  step_applied_at TIMESTAMPTZ
);

-- Acceptance rate per channel and route over the last 6 months, the number Project Zero checks.
SELECT channel_id, route,
       COUNT(*) FILTER (WHERE status = 'accepted')::NUMERIC
         / NULLIF(COUNT(*) FILTER (WHERE status IN ('accepted', 'rejected')), 0) AS acceptance
FROM infringement_reports
WHERE brand_id = $1 AND submitted_at >= NOW() - INTERVAL '6 months'
GROUP BY channel_id, route;
```

Design notes:

- **The claim is a typed field, never free text.** A report's claim decides what evidence it needs and how the marketplace will treat it; a `material_difference` claim without a `difference` is not submitted. That is also what keeps price complaints out of infringement reports: there is no claim value for "below MAP."
- **Evidence is captured when observed.** Listings change and disappear; the page, the seller's disclosed identity and the test buy's photos are stored at the time, by reference to object storage, so a rejected report can be appealed and a lawsuit has its exhibits ([Audit Trails](/docs/architecture/audit-trails)).
- **Monitoring proposes, people submit.** A crawler or a vendor's monitoring tool can flag listings by price, image match or seller; a human (or a rule with a recorded version) decides each report, because acceptance rate is a qualification and false notices have costs ([Decide in Code](/docs/architecture/ai-agents#decide-in-code) for the same split with a model).
- **Violations resolve to an account.** `map_violations.authorized_reseller_id` and the lot or serial trace from a test buy are what turn an observed price into a step under the policy; a violation by a stranger stays a record with no step.
- **Renewals and acceptance rates are deadlines and thresholds.** Trademark renewal dates and the Project Zero accuracy floor are watched like any deadline ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Auditing

- **Every infringement report with its claim, basis, evidence and outcome,** and who or what submitted it; it answers a marketplace's accuracy review, a seller's counter-claim and a court.
- **Test buys** from order to inspection, with the units kept or photographed.
- **Authorized reseller agreements as signed,** with their channels and dates, so a material-differences or diversion claim can show who was authorized when.
- **MAP violations and the steps applied,** the same for every reseller under the policy version then in force.
- **Trademark registrations and their status history,** so each report can be tied to a mark that was live when it was filed.

## What This Means for the System You Build

- **Register the marks first,** in every office whose marketplaces you sell in, and track renewals as deadlines.
- **Type every report by claim:** counterfeit, trademark, copyright, patent, material difference or marketplace policy, with the evidence each needs.
- **Keep the acceptance rate high;** it is what earns self-service removal, and false reports cost it.
- **Don't call a reseller a counterfeiter.** Genuine goods resold are lawful under first sale; act only on real, documented material differences or quality control processes you actually use.
- **Fix diversion in contracts and supply:** authorized reseller agreements, lot or serial tracing, and termination of the account that leaked.
- **Run MAP as a unilateral policy,** enforced only against resellers you supply, by the policy's own steps, and never through an infringement notice.
- **Capture evidence when you see it,** including the seller's INFORM or DSA disclosure, because listings don't wait.

## References

**Marketplace programs**

- [Amazon: Brand Registry](https://sell.amazon.com/brand-registry), eligibility, benefits and Report a Violation
- [Amazon: Requirements and tips for enrolling a brand in Brand Registry](https://sell.amazon.com/blog/brand-registry-requirements), registered or pending marks, word and design marks, and what needs a selling account
- [Amazon: Project Zero](https://sell.amazon.com/brand-registry/project-zero), self-service removal, the 90% and 99% thresholds, training and countries
- [Amazon: Transparency](https://sell.amazon.com/brand-registry/transparency), per-unit codes, eligibility, per-code prices and volumes verified
- [Amazon: IP Accelerator](https://sell.amazon.com/programs/ip-accelerator), law firm network, pre-negotiated fees and protections while pending
- [Amazon: 2024 Brand Protection Report](https://trustworthyshopping.aboutamazon.com/2024-brand-protection-report), proactive blocking, counterfeits seized and the decline in notices
- [Amazon: 2025 Trustworthy Shopping Experience Report](https://trustworthyshopping.aboutamazon.com/2025-trustworthy-shopping-experience-report), the renamed report's 2025 figures
- [Amazon: Counterfeit Crimes Unit](https://trustworthyshopping.aboutamazon.com/counterfeitcrimesunit), launch and bad actors pursued
- [Walmart Marketplace: Brand Portal](https://marketplace.walmart.com/brand-portal/), USPTO registration requirement and portal features
- [eBay: Verified Rights Owner (VeRO) profiles](https://www.ebay.com/sellercenter/ebay-for-business/verified-rights-owner-program), rights owner profiles and the directory's limits

**Cases**

- [Tiffany (NJ) Inc. v. eBay Inc., 600 F.3d 93 (2d Cir. 2010)](https://cases.justia.com/federal/appellate-courts/ca2/08-3947/08-3947-cv_opn-2011-03-27.pdf), contemporary knowledge of particular listings and no willful blindness
- [Sebastian International v. Longs Drug Stores, 53 F.3d 1073 (9th Cir. 1995)](https://www.courtlistener.com/opinion/695240/sebastian-international-inc-v-longs-drug-stores-corporation/), the first-sale rule and resale by unauthorized retailers
- [Société des Produits Nestlé v. Casa Helvetia, 982 F.2d 633 (1st Cir. 1992)](https://www.courtlistener.com/opinion/597410/societe-des-produits-nestle-sa-v-casa-helvetia-inc/), the low materiality threshold and warranty differences
- [Zino Davidoff SA v. CVS Corp., 571 F.3d 238 (2d Cir. 2009)](https://www.courtlistener.com/opinion/1230533/zino-davidoff-sa-v-cvs-corp/), the Warner-Lambert quality control test, removed production codes and damaged packaging
- [Kirtsaeng v. John Wiley & Sons, 568 U.S. 519 (2013)](https://www.law.cornell.edu/supremecourt/text/11-697), copyright first sale for copies made abroad
- [K mart Corp. v. Cartier, 486 U.S. 281 (1988)](https://www.law.cornell.edu/supremecourt/text/486/281), the common-control exception for gray-market imports

**Statutes, regulations and bills**

- [15 U.S.C. 1114](https://www.law.cornell.edu/uscode/text/15/1114), trademark infringement
- [15 U.S.C. 45f](https://www.law.cornell.edu/uscode/text/15/45f), the INFORM Consumers Act thresholds, disclosure and reporting mechanism
- [19 CFR 133.23](https://www.law.cornell.edu/cfr/text/19/133.23), the Lever rule and its label
- [19 CFR 133.2](https://www.law.cornell.edu/cfr/text/19/133.2), physical and material differences
- [H.R. 5374 (117th Congress), SHOP SAFE Act of 2021](https://www.govinfo.gov/content/pkg/BILLS-117hr5374ih/html/BILLS-117hr5374ih.htm), the best practices, thresholds and bad-faith notice penalties

**Regulators**

- [FTC: Informing Businesses about the INFORM Consumers Act](https://www.ftc.gov/business-guidance/resources/informing-businesses-about-inform-consumers-act), effective date, home-based sellers and suspension
- [DOJ: Temu agrees to $2M civil penalty for alleged INFORM violations](https://www.justice.gov/opa/pr/temu-agrees-2m-civil-penalty-and-injunction-alleged-violations-inform-consumers-act), the first INFORM action
- [FTC: Whaleco Inc. (Temu), U.S. v.](https://www.ftc.gov/legal-library/browse/cases-proceedings/232-3096-whaleco-inc-dba-temu-us-v), case filings
