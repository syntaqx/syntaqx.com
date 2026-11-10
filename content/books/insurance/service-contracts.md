+++
title = "Service Contracts & Warranties"
nav_title = "Service Contracts"
description = "What is and isn't insurance, the NAIC Service Contracts Model Act, Florida, New York and Texas regimes, obligors and reimbursement insurers, and Magnuson-Moss."
category = "Insurance Industry"
order = 2768
part = "Embedded Insurance and Service Contracts"
tags = ["insurance", "service-contracts", "warranties", "magnuson-moss", "naic-models", "consumer-protection"]
+++

A service contract is a promise, sold for a separate price, to repair or replace a product when it breaks. Economically it is insurance against mechanical failure: the buyer pays a fixed amount now, the provider pays for repairs it can't predict, and the provider's profit depends on pricing the failure rate correctly. Legally, in most states, it is not insurance. States carved service contracts out of their insurance codes and built separate regimes for them, with lighter licensing, no rate approval, and a financial security requirement in place of statutory capital. The carve-out is conditional. A contract that covers more than the law allows, or a provider that doesn't meet the security rules, is selling insurance without a license.

This chapter covers the line between a warranty, a service contract and insurance; the three or four parties behind every contract (the obligor, the administrator, the seller and the reimbursement insurer); the NAIC Service Contracts Model Act and the state regimes built on it, with Florida, New York and Texas worked; cancellation and refund rules; and Magnuson-Moss and the FTC's enforcement. Selling a protection plan at checkout is in Commerce's [Warranties](/books/commerce/online-consumer-protection#warranties) and in [Embedded Insurance](/books/insurance/embedded-insurance); vehicle service contracts and GAP are in [Vehicle Service Contracts & GAP](/books/insurance/vehicle-service-contracts-and-gap); home warranties and consumer protection plans at scale are in [Home Warranties & Product Protection](/books/insurance/home-warranties-and-protection-plans).

## How the Platforms Do It

As of November 2026, from each company's filings or its own pages:

| Company | Role | Public detail |
| --- | --- | --- |
| **Allstate Protection Plans** | Provider of consumer protection plans | "Consumer protection plans and related technical support for mobile phones, consumer electronics and major appliances," sold through retailers and mobile operators in store and online, in the US and Canada, with services in Europe and Asia (Allstate 10-K for 2025) |
| **Assurant** | Underwriter and administrator | Extended service contracts provide "coverage for repairing or replacing these consumer goods" after the manufacturer's warranty; they "may be regulated by regulatory bodies other than departments of insurance and may be subject to consumer protection laws" (10-K for 2025) |
| **Asurion** | Device protection and repair | Protection, repair, installation and support for phones, smart home devices and household appliances; partners including Verizon, AT&T and Samsung; "700+ locations"; its about page doesn't say which products are insurance and which are service contracts |
| **Extend** | Merchant-facing protection plans | Plans mapped to a merchant's products, contracts created on fulfillment, refunds and claims by API ([The API Shape](/books/insurance/embedded-insurance#the-api-shape)) |
| **frontdoor** | Home warranty provider | About 2.1 million active home warranties at December 31, 2025; regulated "in certain states" by insurance regulators, with a captive insurer for its Texas claims (10-K for 2025; [Home Warranties & Product Protection](/books/insurance/home-warranties-and-protection-plans)) |

The structural fact the table shows: the brand on the plan is rarely the whole story. A retailer sells it, a provider is obligated on it, an administrator runs its claims and records, and an insurer stands behind the provider. Assurant's 10-K is explicit that the regulator may not be the insurance department at all. A system that models "the warranty company" as one party can't answer who owes the customer when the brand goes out of business.

## Warranty, Service Contract or Insurance

Three promises look alike and are regulated differently.

**A warranty** is part of the product. Under Magnuson-Moss, a written warranty is part of the basis of the bargain, given at the time of sale, and "the consumer must not give any consideration beyond the purchase price of the consumer product" for it (16 CFR 700.11(b)). The NAIC model defines it the same way: made "solely by the manufacturer, importer or seller of property or services without charge," not negotiated or separated from the sale and "incidental to the sale of the product." A warranty is not insurance and not a service contract.

**A service contract** is a separate promise for separate money. The FTC's interpretation says an agreement that would otherwise be a written warranty but fails the basis-of-the-bargain test is a service contract: one that "calls for some consideration in addition to the purchase price," one entered into after the sale, or one covering only maintenance or inspection without promising a level of performance (700.11(c)). The NAIC model's definition: "a contract or agreement for a separately stated consideration or for a specific duration to perform the repair, replacement or maintenance of property or indemnification for repair, replacement or maintenance, for the operational or structural failure due to a defect in materials, workmanship or normal wear and tear," with incidental payments allowed "under limited circumstances, including, but not limited to, towing, rental and emergency road service."

**Insurance** is everything outside those definitions that transfers risk for a premium. The NAIC model draws the line itself: a service contract "does not include mechanical breakdown insurance," defined as a policy "issued by an authorized insurer" covering the same failures. The same promise can be either, depending on who issues it and under what regime. The model's drafting note says it "assumes that service contracts are exempt from the insurance code."

What pushes a promise over the line is coverage the service contract statute doesn't allow. The common edges:

| Coverage | Treatment |
| --- | --- |
| **Defects, wear and tear** | The core of every service contract definition |
| **Accidental damage from handling** (drops, spills) | Florida allows it in a service warranty only if covered by the contractual liability insurance policy (Fla. Stat. 634.401(13)(c), 634.414(5)); other states differ |
| **Theft and loss** | Not repair of a failure; generally insurance (portable electronics insurance is a Florida limited lines product, [Who May Sell It](/books/insurance/embedded-insurance#who-may-sell-it-four-licensing-models)) |
| **Consequential damages** | The model requires the contract to say whether it covers them; Florida's home warranty part bars indemnification for them |
| **Vehicle ancillary items** (tire and wheel road hazard, windshield chips, paintless dent repair, key replacement, excess lease wear) | New York lists them inside its service contract definition (N.Y. Ins. Law 7902(k)); elsewhere, state by state |

The NAIC model also scopes out warranties, maintenance agreements, commercial transactions, contracts sold to non-consumers, and (optionally) low-priced products bought with a separate charge at or within 60 days of the sale, below a dollar threshold each state fills in (Section 1).

## The Parties

The model's definitions name every role, and each becomes a party role in the data:

| Role | Model definition | What it does |
| --- | --- | --- |
| **Provider (obligor)** | "A person who administers, issues, makes, provides, sells or offers to sell a service contract, or who is contractually obligated to provide service under a service contract" | Owes the repair or replacement; must meet the financial security rule |
| **Administrator** | "The person who is responsible for the administration of the service contracts or the service contracts plan and who is responsible for any filings required by the Act" | Registers with the commissioner (Section 3B), keeps the books and records (Section 7), usually runs claims |
| **Seller** | Named in the contract (Section 5D) | The retailer or dealer that sold it; exempt from licensing when the provider complies (Section 3E) |
| **Reimbursement insurer** | Issues the "reimbursement insurance policy" to the provider, agreeing "for the benefit of the service contract holders, to discharge all of the obligations and liabilities of the provider" if the provider doesn't perform, including the return of the unearned provider fee | Stands behind the provider; may not terminate the policy without notice to the commissioner, and termination doesn't reduce its liability for contracts already sold (Section 8) |
| **Contract holder** | "The purchaser or holder of a service contract" | Claims against the provider; against the insurer directly if the provider fails |

New York's definitions track these (N.Y. Ins. Law 7902): a **provider** "markets, sells, offers for sale, issues, makes or proposes to make or administers a service contract" and is contractually obligated on it; an **administrator** is designated by a provider "to be responsible for administration of service contracts." The money has its own names: the **provider fee** is the consideration "in excess of the premium" (NAIC) or the total purchase price (New York), and the **premium** is what the provider pays the reimbursement insurer.

The model makes the provider "the agent of the insurer which issued the reimbursement insurance policy" for purposes of the law that obligates an insurer for its agents' acts, including money collected and not forwarded (Section 9A). So when a provider collects the contract price and fails, the insurer owes the holder as if it had collected the money itself, and may then pursue the provider (Section 9B). The contract has to say so: an insured contract states that "If the provider fails to pay or provide service on a claim within sixty (60) days after proof of loss has been filed, the contract holder is entitled to make a claim directly against the insurance company," with the insurer's name and address (Section 5B).

## Financial Security: the Three Options

The NAIC model's core is Section 3C: a provider obligated on service contracts must do one of three things. States adopted the structure with their own numbers.

| Option | NAIC #685 | New York (Ins. Law 7903(c)) | Texas (Occ. Code 1304.151) |
| --- | --- | --- | --- |
| **1. Reimbursement insurance** | All contracts insured by an authorized or surplus lines insurer | Same, with up to five policies; on lapse, meet option 2 or 3 within 45 days | Authorized or eligible surplus lines insurer |
| **2. Reserve plus deposit** | Funded reserve of at least 40% of gross consideration received, less claims paid, on in-force contracts; plus a deposit of at least 5% of the same, minimum $25,000 (surety bond, eligible securities, cash or letter of credit) | 40% reserve; 5% deposit, minimum $50,000 | 40% reserve; deposit generally at least $250,000; dealers selling only on their own vehicles $25,000, $50,000 or $75,000 by prior-year Texas service contract revenue; residential service contract providers at least $25,000 |
| **3. Net worth** | $100 million net worth, shown by a 10-K or audited statements; a parent's statements require the parent's guarantee | $100 million, standalone or consolidated, with parent guarantee; meet option 1 or 2 within 45 days of a shortfall | $100 million, own or parent's, with parent guarantee |

Florida regulates consumer product service contracts as **service warranties** under its own scheme (Fla. Stat. ch. 634, Part III), licensed by the Office of Insurance Regulation, with an unearned premium model instead of the 40% reserve: an unearned premium reserve of at least 25% of gross written premium on contracts in force plus a deposit equal to 10% of that premium; gross written premium in force may not exceed seven times net assets (higher for a company also licensed under Part I with $2.5 million of net assets and contractual liability insurance covering 100% of claims from an insurer with at least $100 million of surplus rated "A" or higher by A.M. Best, or with $750,000 of net assets under the conditions of subsection (6)); no reserve if contractual liability insurance covers 100% of claim exposure; and a $100 million net worth exemption, own or a parent's, with $750,000 of net assets kept when the parent's is used (634.406).

### Worked Numbers: One Provider, Four Rulebooks

My numbers. A provider has sold consumer electronics service contracts for $12,000,000 of gross consideration on contracts still in force, and has paid $2,000,000 of claims on them. It doesn't buy reimbursement insurance and isn't worth $100 million. Its net assets are $1,500,000.

| Rulebook | Reserve | Deposit | Other test |
| --- | --- | --- | --- |
| NAIC #685 | 40% × ($12.0M − $2.0M) = **$4,000,000** | 5% × $10.0M = **$500,000** (above the $25,000 floor) | None |
| New York | 40% × $10.0M = **$4,000,000** | 5% × $10.0M = **$500,000** (above the $50,000 floor) | None |
| Texas | 40% × $10.0M = **$4,000,000** | **$250,000** general minimum (the statute's floor; this provider isn't a dealer) | None |
| Florida service warranty | 25% × $12.0M = **$3,000,000** unearned premium reserve (on gross written premium, not net of claims) | 10% × $12.0M = **$1,200,000** | $12.0M ÷ $1.5M = 8 to 1, over the 7-to-1 limit: the provider needs $1,714,286 of net assets, or full contractual liability insurance |

The table shows why providers buy reimbursement insurance. The reserve option ties up a third or more of the money collected, the base differs by state (net of claims in three, gross in Florida), and the Florida ratio test caps growth on net assets. With a reimbursement policy, the provider pays a premium to an insurer, the insurer carries the reserve on its own balance sheet as unearned premium and loss reserves, and the provider's capital requirement drops to the state's licensing minimums. The obligation to the holder doesn't move; only who backs it.

## What the Contract Must Say

The model's Section 5 is a checklist that maps directly to template fields: clear language in at least ten-point type; the insured or uninsured statement (the uninsured version says the obligations "are backed only by the full faith and credit of the provider (issuer) and are not guaranteed under a service contract reimbursement insurance policy"); the administrator, provider, seller and holder; the total purchase price and terms; the prior approval procedure for repairs, with a toll-free claims number and how to get emergency repairs outside business hours; deductibles; what's covered, limitations and exclusions; when non-original parts may be used; transfer rules; termination terms, with written notice to the holder within 15 days of termination; the holder's own duties (such as preventing further damage and required maintenance); and whether consequential damages and preexisting conditions are covered.

Section 6 adds prohibitions: no "insurance," "casualty," "guaranty," "surety" or "mutual" in the provider's name (a grandfathered name must disclose "This agreement is not an insurance contract"), no misleading statements, and no requiring a service contract as a condition of a loan or sale. Section 7 sets records: copies of each contract type, holder names and addresses, the locations where contracts are sold, and claims files with the dates, amounts and descriptions of every receipt, claim and expenditure, kept at least three years after coverage expires.

State additions are the details a template engine needs per state. Florida requires a written disclosure that the contract's rate "is not regulated by the office" and delivery of the contract within 45 days of purchase, by mail or electronically with notice of the right to paper (634.414). New York requires the provider to file its provider fee with the superintendent at least 30 days before using it or changing it, open to public inspection, and the fee charged may not exceed the filed amount (7903(a)). The New York and NAIC rules on tax are the same: provider fees are not subject to premium tax; premiums for reimbursement insurance are (NAIC Section 3D, 7903(d)).

## Cancellation and Refunds

Two rules govern every refund: the free look, and cancellation after it.

**Free look.** The NAIC model and New York let the holder return the contract within at least 20 days of mailing, or 10 days if delivered at the time of sale (or longer if the contract allows); if no claim has been made, the contract is void and the full purchase price is refunded, and "A ten percent (10%) penalty per month shall be added to a refund that is not paid within thirty (30) days of return." The free look is for the original purchaser only.

**After the free look,** state law sets the floor. Florida's service warranty rule: if the holder cancels, the refund is "based upon no less than 90 percent of unearned pro rata premium," less claims paid; if the provider cancels, 100% of unearned pro rata premium, less claims paid; refunds may be by cash, check, store credit or gift card, but by check if the holder asks (634.414). The model requires the termination terms in the contract and the 15-day notice, and leaves the refund method to each state.

### Worked Numbers: A Cancelled Laptop Plan

My numbers. A three-year (1,095-day) laptop service contract bought for $299.00, cancelled by the holder on day 400, with one $120.00 repair already paid.

| Rule | Calculation | Refund |
| --- | --- | --- |
| Free look (NAIC, New York) | Day 400 is past 20 days | Not available |
| Florida, holder cancels | Unearned pro rata = $299.00 × 695 / 1,095 = $189.78; 90% = $170.80; less claims $120.00 | **$50.80** |
| Florida, provider cancels | 100% of $189.78, less $120.00 | **$69.78** |
| A contract that never paid a claim, holder cancels in Florida | 90% × $189.78 | **$170.80** |
| Same contract returned on day 8 after delivery at sale (New York) | Within 10 days, no claim: void | **$299.00**, plus 10% a month if paid late |

The refund engine needs, per contract: the purchase price, the term in days, the purchase and cancellation dates, who cancelled, claims paid to date, and the state's rule version. Claims paid have to come from the administrator's claim records, not the retailer's, so the refund is computed where the claims are.

```go tab="Go"
type RefundRule struct {
	HolderPct    float64 // FL: 0.90 of unearned pro rata when the holder cancels
	ProviderPct  float64 // FL: 1.00 when the provider cancels
	FreeLookDays int     // 10 at sale, 20 by mail (NAIC, NY)
}

// Refund returns the refund in cents for a cancellation on day `elapsed` of `term` days.
func Refund(r RefundRule, priceCents, claimsCents int64, elapsed, term int, byHolder bool) int64 {
	if elapsed <= r.FreeLookDays && claimsCents == 0 {
		return priceCents // void: full purchase price
	}
	pct := r.ProviderPct
	if byHolder {
		pct = r.HolderPct
	}
	unearned := float64(priceCents) * float64(term-elapsed) / float64(term)
	refund := int64(math.Round(unearned*pct)) - claimsCents
	if refund < 0 {
		return 0
	}
	return refund
}
```

```rust tab="Rust"
pub struct RefundRule {
    pub holder_pct: f64,     // FL: 0.90 of unearned pro rata when the holder cancels
    pub provider_pct: f64,   // FL: 1.00 when the provider cancels
    pub free_look_days: i64, // 10 at sale, 20 by mail (NAIC, NY)
}

/// Refund in cents for a cancellation on day `elapsed` of `term` days.
pub fn refund(r: &RefundRule, price: i64, claims: i64, elapsed: i64, term: i64, by_holder: bool) -> i64 {
    if elapsed <= r.free_look_days && claims == 0 {
        return price; // void: full purchase price
    }
    let pct = if by_holder { r.holder_pct } else { r.provider_pct };
    let unearned = price as f64 * (term - elapsed) as f64 / term as f64;
    ((unearned * pct).round() as i64 - claims).max(0)
}
```

With Florida's rule, $29,900 cents, $12,000 claims, day 400 of 1,095, by the holder: unearned 18,977.6 cents, 90% rounds to 17,080, less 12,000 is 5,080 cents, the $50.80 above.

## Magnuson-Moss and the FTC

Federal law doesn't license service contracts but shapes them in three ways.

**Disclosure.** The Act lets the FTC prescribe how service contract terms are disclosed, so that they are "fully, clearly, and conspicuously disclosed," and confirms a supplier or warrantor may offer a service contract alongside or instead of a written warranty if its terms are in simple, readily understood language (15 U.S.C. 2306).

**Implied warranties survive.** A supplier who gives a written warranty, or who "at the time of sale, or within 90 days thereafter," enters into a service contract with the consumer covering the product, may not disclaim or modify the implied warranties on it; a written warranty may limit their duration to its own if the limit is conscionable and in clear language, and a violating disclaimer has no effect (15 U.S.C. 2308). A retailer that sells its own service contract on a product it sold "as is" has, by selling the contract, given up the "as is."

**No tie-ins.** A warrantor may not condition a written warranty on using a particular brand of parts or service unless they are provided free or the FTC grants a waiver; "void if serviced by anyone other than an authorized dealer" is the rule's own example of a violation, though damage shown to be caused by unauthorized parts or service may be excluded (16 CFR 700.10, implementing 15 U.S.C. 2302(c)). The FTC sent warning letters on July 3, 2024 to eight companies: five (aeris Health, Blueair, Medify Air, Oransi and InMovement) for telling consumers they had to use specified parts or service providers to keep their warranties, and three (ASRock, Zotac and Gigabyte) for "warranty void if removed" stickers, with a staff review of their websites 30 days later. Service contracts frequently copy warranty language, and a service contract that conditions coverage on authorized service is close enough to the same problem that my rule is to keep tie-in terms out of both.

Commerce's [Warranties](/books/commerce/online-consumer-protection#warranties) covers the presale availability and "full" versus "limited" rules for the product warranty itself.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model), which says service contracts use `policies`: a service contract is a `policies` row with a legal form that says it isn't insurance, its covered product is a `risks` row of kind `covered_product`, its price is `premium_entries` (kind `premium` holds the provider fee; the reimbursement insurer's premium is a separate entry on the provider's reimbursement policy), and claims are `claims` and `exposures` as for any policy. The holder, seller and administrator are `party_roles`. The reimbursement policy is an ordinary `policies` row issued by an `insurers` row to the provider. This chapter adds the obligor and administrator and the security snapshot:

```sql
CREATE TABLE obligors (                    -- the provider contractually obligated to perform
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  kind               TEXT NOT NULL CHECK (kind IN ('manufacturer', 'retailer', 'dealer',
                       'third_party', 'insurer_affiliate')),
  parent_guarantor_id UUID REFERENCES parties (id)   -- net worth via parent, with guarantee
);

ALTER TABLE policies
  ADD COLUMN legal_form        TEXT NOT NULL DEFAULT 'insurance'
                               CHECK (legal_form IN ('insurance', 'service_contract',
                                 'home_warranty', 'vsc', 'debt_cancellation')),
  ADD COLUMN obligor_id        UUID REFERENCES obligors (id),  -- for non-insurance forms
  ADD COLUMN backing_policy_id UUID REFERENCES policies (id);  -- the reimbursement policy

CREATE TABLE obligor_authorities (         -- licensed or registered, per state, with its security basis
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  obligor_id         UUID NOT NULL REFERENCES obligors (id),
  state              TEXT NOT NULL,
  regime             TEXT NOT NULL,         -- 'FL 634 Part III', 'NY Ins 79', 'TX Occ 1304'
  license_ref        TEXT,
  security_basis     TEXT NOT NULL CHECK (security_basis IN ('reimbursement_insurance',
                       'reserve_and_deposit', 'net_worth', 'contractual_liability')),
  provider_fee_filed_at DATE,               -- NY: 30 days before use
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE administrators (              -- who runs the contracts and files for them
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  registrations      JSONB NOT NULL,        -- [{state, number, renews_on}]
  records_retention_years INT NOT NULL DEFAULT 3  -- after coverage expires (#685 s7)
);

CREATE TABLE obligor_security_snapshots (  -- the computed requirement, per state, as of a date
  obligor_id         UUID NOT NULL REFERENCES obligors (id),
  state              TEXT NOT NULL,
  as_of              DATE NOT NULL,
  gross_in_force     BIGINT NOT NULL,       -- consideration on in-force contracts
  claims_paid        BIGINT NOT NULL,
  reserve_required   BIGINT NOT NULL,
  deposit_required   BIGINT NOT NULL,
  net_assets         BIGINT,
  ratio_ok           BOOLEAN,               -- FL 7-to-1
  rule_ref           TEXT NOT NULL,         -- 'NY Ins 7903(c)(2)'
  PRIMARY KEY (obligor_id, state, as_of)
);
```

Design choices that matter:

- **The legal form is on the contract,** and every downstream rule (premium tax, producer commission, statistical reporting, the statutory statement) skips non-insurance forms. Only the reimbursement policy's premium is insurance premium.
- **The backing policy is a link,** so when an obligor fails the system can list every holder whose claims and refunds now go to the insurer, by contract and state.
- **Security is recomputed, not asserted.** The snapshot is a query over in-force contracts and paid claims per state, run on the regulator's schedule, so a provider near the edge of a ratio sees it before the examiner does.
- **Refunds and claims share data.** The refund engine reads claims paid from the claim records and the state rule version from the rulebook ([The Rulebook as Data](/books/insurance/the-state-system#the-rulebook-as-data)).
- **Templates are per state and per backing.** The insured or uninsured statement, the rate-not-regulated notice, and the insurer's name and address are template inputs, not free text.

## Auditing

- **Every contract names its obligor, administrator, seller and backing,** and the backing was in force on the sale date.
- **Security held,** per state and date: the snapshot shows the requirement and the reserve, deposit, net worth or contractual liability policy that met it.
- **Disclosures match backing:** insured contracts carry the insured statement and the insurer's name; uninsured ones the full-faith-and-credit statement.
- **Refunds computed by rule:** a sample of cancellations reproduces the free look, the pro rata percentage and the claims deduction, paid within 30 days of a free-look return.
- **Records kept:** claims files with dates, amounts and descriptions, held at least three years after coverage expires, and after a provider exits the state until its obligations are discharged.
- **No tie-in language** in contract or warranty templates.

## What This Means for the System You Build

- **Model the contract as a policy with a legal form,** an obligor and a backing policy, never as "the warranty company's" contract.
- **Compute financial security per state** from in-force contracts and paid claims, on each state's base.
- **Generate disclosures from the backing and the state,** including the 60-day direct claim against the insurer where insured.
- **Run refunds through one engine** with the free look, who cancelled, the pro rata percentage and claims paid.
- **Keep provider fees out of premium tax and producer commission,** and keep the reimbursement premium in them.
- **Treat Magnuson-Moss as template rules:** no implied warranty disclaimers on products with a service contract sold within 90 days, and no tie-ins.

## References

**Law and regulation**

- [15 U.S.C. 2306](https://www.law.cornell.edu/uscode/text/15/2306), FTC authority over service contract disclosure and service contracts alongside or instead of warranties
- [15 U.S.C. 2308](https://www.law.cornell.edu/uscode/text/15/2308), no disclaimer of implied warranties with a written warranty or a service contract within 90 days of sale
- [16 CFR 700.10](https://www.law.cornell.edu/cfr/text/16/700.10), the tie-in prohibition and its example
- [16 CFR 700.11](https://www.law.cornell.edu/cfr/text/16/700.11), written warranty versus service contract, the consideration test, and insurance under McCarran-Ferguson
- [Fla. Stat. ch. 634, Part III contents](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0634/0634PARTIIIContentsIndex.html), the service warranty association sections
- [Fla. Stat. 634.401](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0634/Sections/0634.401.html), service warranty, gross written premium, accidental damage from handling and exclusions
- [Fla. Stat. 634.406](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0634/Sections/0634.406.html), the 25% unearned premium reserve, 10% deposit, 7-to-1 ratio, contractual liability and $100 million alternatives
- [Fla. Stat. 634.414](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0634/Sections/0634.414.html), refunds at 90% or 100% of unearned pro rata premium, refund methods, the rate-not-regulated disclosure, 45-day delivery and accidental damage coverage
- [N.Y. Ins. Law 7902](https://www.nysenate.gov/legislation/laws/ISC/7902), service contract (with the vehicle items), provider, administrator, provider fee and maintenance agreement
- [N.Y. Ins. Law 7903](https://www.nysenate.gov/legislation/laws/ISC/7903), provider fee filing, the three security options with the $50,000 minimum, premium tax, and the free look with the 10% monthly penalty
- [Tex. Occ. Code 1304.151](https://texas.public.law/statutes/tex._occ._code_section_1304.151), Texas financial security options and deposit minimums
- [Tex. Occ. Code 1304.003](https://texas.public.law/statutes/tex._occ._code_section_1304.003), the Texas service contract definition

**Regulators and guidance**

- [FTC: FTC warns companies to stop warranty practices that harm consumers' right to repair, July 3, 2024](https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-warns-companies-stop-warranty-practices-harm-consumers-right-repair), the eight warning letters and the 30-day review

**NAIC**

- [NAIC: Service Contracts Model Act (#685) (PDF)](https://content.naic.org/sites/default/files/model-law-685.pdf), scope, definitions, administrator registration, the three security options, premium tax, required disclosures, prohibited acts, records, termination of reimbursement policies and insurer obligations; adopted 1995

**Filings**

- [Allstate: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/899051/000089905126000031/all-20251231.htm), Allstate Protection Plans' products, channels and markets
- [Assurant: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1267238/000126723826000010/aiz-20251231.htm), extended service contracts and their regulation outside insurance departments
- [Frontdoor: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1727263/000119312526076548/ftdr-20251231.htm), active home warranties and insurance regulation in certain states

**Vendor documentation**

- [Asurion: About](https://www.asurion.com/about/), products, partners and locations
- [Extend: API reference](https://docs.extend.com/), plan mapping, contracts and refunds
