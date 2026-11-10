+++
title = "Death Claims & Unclaimed Benefits"
nav_title = "Death Claims"
description = "Contestability and suicide clauses, who gets paid, interest on delayed proceeds worked, Death Master File matching, the multistate settlements and escheat."
category = "Insurance Industry"
order = 2764
part = "Life and Annuities"
tags = ["insurance", "life-insurance", "claims", "death-master-file", "unclaimed-property", "escheat"]
+++

A life claim is the one claim the insured never files. Someone else has to know the policy exists, find the paperwork, prove the death and prove their right to the money, and the insurer has to decide quickly, because the law starts charging it interest. Many death claims are simple: a certified death certificate, a claimant statement, a beneficiary on record, a payment within days. The hard ones cluster around four questions. Was the policy obtained honestly, which the insurer may ask only during the contestable period? Is the cause of death excluded, most often by a suicide clause in the first one or two years? Who is the beneficiary, when a change was in flight or the named beneficiary died first? And what happens when nobody claims at all?

That last question became an industry-wide scandal in the 2010s. State treasurers' auditors and insurance regulators began asking whether insurers were using death records, above all the Social Security Administration's Death Master File, to find the deaths that made benefits payable, and the answer produced a wave of multistate examinations, regulatory settlement agreements, unclaimed property audits and state laws requiring every life insurer to compare its in-force book against the Death Master File and go looking for beneficiaries. This chapter covers the claim, the contestable period and suicide clauses, who gets paid, settlement and interest on proceeds with worked numbers, Death Master File matching, the settlements and escheat, with the `dmf_matches` and `escheatments` tables against the core model's `claims` and `party_roles`. Unclaimed property as a body of law is [Banking & Lending](/books/banking-and-lending/dormancy-and-escheat)'s; this chapter covers what life insurance adds.

## How the Platforms Do It

What the rules and the insurers' own filings show, as of November 2026:

| Source | What it sets or shows |
| --- | --- |
| **NCOIL Model Unclaimed Life Insurance Benefits Act** (readopted April 2024) | Compare in-force policies, annuity contracts and retained asset accounts against the Death Master File at least semi-annually; within 90 days of a match, confirm the death, determine whether benefits are due and locate beneficiaries; no fees to beneficiaries for searches; escheat with accrued contractual interest |
| **Florida, Fla. Stat. 717.107** | Comparison at least annually before August 31; a match creates a presumption of death; 120 days to confirm and act; proceeds presumed unclaimed 5 years after the date of death; no fees |
| **New York, Ins. Law 3214** | Interest on death proceeds from the date of death at the rate the insurer pays on proceeds left under its interest settlement option |
| **Texas, Ins. Code 1101.011 and 1103.104** | Settlement within two months after proof of death and of the claimant's right; interest from proof of loss until the insurer accepts the claim and offers to pay |
| **Protective Life**, 10-Q (August 2013) | Subsidiaries subject to a targeted multistate examination of claims practices and Death Master File use, with possible fees estimated at $0 to $3.5 million; notice of unclaimed property audits by two third-party auditors; other insurers' settlements required periodic DMF comparison, treating confirmed deaths as giving rise to death benefits, locating beneficiaries and paying benefits and interest, with escheat when beneficiaries can't be found |
| **Kemper**, 10-Q (August 2013) | Seven states' DMF statutes effective between January 1, 2013 and July 1, 2014; Kemper's suits in Kentucky and Maryland seeking prospective-only application; an audit firm retained by 38 state treasurers; a California State Controller suit filed in July 2013; a multistate market conduct examination joined by five more states |

Two patterns. **The obligation moved from the claimant to the insurer.** A death claim used to start when a beneficiary called; under the DMF laws and settlements, the insurer must find the death and the beneficiary. **Insurers fought over retroactivity, not the duty itself.** Kemper's filings show the dispute was whether the new search duty applied to policies issued before the laws, which is why a system has to know each policy's issue date against each state's effective date and scope.

## The Claim

A death claim is a `claims` row with `cause_of_loss = 'death'` against the policy term in force on the date of death ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)), with an exposure per beneficiary and coverage (base face, paid-up additions, riders such as accidental death), because each beneficiary is a separate payee with a separate share, release and tax reporting. The requirements are usually:

- **Proof of death**: a certified death certificate, or for a Death Master File match, the insurer's validation of the death against other records.
- **Claimant's statement**: identity, relationship, tax information, settlement election.
- **Policy information** and, for older or lost policies, an affidavit.
- **Additional evidence** when the claim is contestable, the cause is unclear or the beneficiary is disputed: medical records, police or coroner reports, court orders.

Once due proof and the claimant's right are in, the clocks run: Texas requires the policy to provide for settlement "not later than two months" after proof (1101.011); interest runs under each state's statute. Group life claims under an employer plan are ERISA claims, with the regulation's 90-day decision clock ([Group Life & Disability](/books/insurance/group-life-and-disability#erisa-claim-rules)).

## The Contestable Period

A life policy becomes **incontestable** after a period, after which the insurer can't void it for misstatements in the application:

- **New York**: incontestable after two years from issue, or from the effective date of any later increase or change for that increase or change, except for nonpayment of premium and certain military service conditions (Ins. Law 3203(a)(3)).
- **Texas**: a policy "in force for two years from its date of issue during the lifetime of the insured is incontestable," except for nonpayment; the insurer may reserve the right to contest for violation of military service conditions in wartime (Ins. Code 1101.006).
- **Florida**: incontestable "after it has been in force during the lifetime of the insured for a period of 2 years from its date of issue," except for nonpayment, and, at the insurer's option, provisions on disability benefits and additional accidental death benefits (Fla. Stat. 627.455).

"During the lifetime of the insured" matters: if the insured dies within the two years, the policy never becomes incontestable, so a claim on a death at 23 months can be contested even if it is filed at 26 months. During the period, the insurer reviews the application against what it can now learn (medical records, prescription history, MIB) for **material misrepresentation**, a misstatement that would have changed the underwriting decision. If it finds one, it **rescinds** the policy and returns the premiums instead of paying the face. The review is a set of evidence orders on the claim, and the decision record has to show what the underwriter would have done with the true facts ([Life Underwriting](/books/insurance/life-underwriting#rate-classes-and-ratings)), because rescission is litigated on materiality.

The system needs the right date for each coverage layer: the issue date for the base face, the effective date of each increase for that increase (New York), and the reinstatement date and application where the contract or state law ties contestability to reinstatement ([Reinstatement](/books/insurance/in-force-administration#reinstatement)). A death in the contestable period opens a review task automatically; a death after it closes that question.

## Suicide Clauses

Policies may exclude death by suicide for a limited period after issue, and states set the limit:

- **New York** permits excluding suicide within two years from issue (3203(b)(1)(B)); when an exclusion applies, the insurer pays the reserve plus paid-up additions and dividends less debt, or, if the policy has been in force two years or less, the gross premiums paid less dividends and debt (3203(b)(3)).
- **Missouri** permits excluding death by suicide, "while sane or insane," within one year of the issue date, and for added or increased death benefits within one year of the addition or increase for the added amount only; a policy with the exclusion must promptly refund the premiums paid for the excluded coverage (Mo. Rev. Stat. 376.620).

The suicide period and the contestable period are different clocks with different remedies (exclusion with a premium refund versus rescission), and replacement rules connect them: an affiliated replacement must credit time already elapsed under the old policy's incontestability and suicide periods, up to its face amount ([Replacements under Model 613](/books/insurance/annuity-best-interest#replacements-under-model-613)). Other exclusions states permit, such as New York's for aviation under stated conditions, hazardous occupations named in the policy within two years, and war (3203(b), (c)), work the same way: a cause-of-death test against a dated exclusion, with a defined payment when it applies.

## Who Gets Paid

The beneficiary is whoever the policy says on the date of death, which is harder to know than it sounds:

- **The designation as of death.** Primary beneficiaries share by their percentages; if a primary beneficiary died first, their share goes to the surviving primaries or, by the designation's terms, to that beneficiary's descendants (per stirpes) or to contingent beneficiaries. The `party_roles` history as of the date of death, not today's, is the answer.
- **Pending changes.** A change signed before death but received after it may govern, depending on the contract's effective date rule ([Beneficiary and Owner Changes](/books/insurance/in-force-administration#beneficiary-and-owner-changes)); the claim must look for in-flight requests.
- **No beneficiary.** If no named beneficiary survives, the contract's own fallback provision decides who takes, and the claim applies it as written.
- **Assignees.** A collateral assignee is paid first up to its debt; the beneficiaries get the rest.
- **Competing claims.** Divorce, a disputed change, a beneficiary implicated in the death: when the insurer can't safely pay anyone, it pays the money into court in an interpleader and lets the claimants litigate. New York's interest statute stops the insurer's statutory interest for any period in which interpleader law requires it to pay interest instead (3214(d)).
- **Annuities.** On an annuity owner's death, the beneficiary's election (lump sum, five-year, life expectancy, or spousal continuation) is constrained by 26 USC 72(s) ([Death of the Owner](/books/insurance/annuities#death-of-the-owner)).

Settlement options let a beneficiary take the proceeds as a lump sum, installments or a life income, or leave them with the insurer. A **retained asset account**, settling proceeds by "depositing the proceeds into an account with check or draft writing privileges" held by the insurer under a supplementary contract (NCOIL model 3G), is common and regulated in its own right, and the NCOIL model includes retained asset accounts in the Death Master File comparison.

## Interest on Proceeds

Every state requires interest on death proceeds paid late, but the start date and the rate vary, so the same claim earns different interest in different states:

| State | Interest runs from | Until | Rate |
| --- | --- | --- | --- |
| **New York** (3214) | The date of death | Payment (or verdict, if there is a suit) | The rate the insurer currently pays on proceeds left under its interest settlement option, computed daily |
| **Texas** (1103.104) | Receipt of due proof of loss | The insurer accepts the claim and offers to pay | The rate in the policy, or the rate on proceeds left on deposit |
| **Florida** (627.4615) | Receipt of written due proof of death | Payment | At least the Moody's Corporate Bond Yield Average (monthly average corporates) as of the day the claim was received; at least 8% if Moody's method has changed substantially since January 1, 1993 |

**Worked numbers: one claim, three states.** Mine, with illustrative rates: a $250,000 policy; the insured dies Tuesday, March 3, 2026; due proof arrives Monday, April 20; the insurer accepts and offers payment Tuesday, May 12, and pays Friday, May 15. Assume an interest settlement option rate and a deposit rate of 1.50%, and a Moody's average of 5.70% on April 20 (both assumptions, not published figures).

| State | Days | Calculation | Interest |
| --- | ---: | --- | ---: |
| New York | 73 (March 3 to May 15) | 250,000 × 1.50% × 73 / 365 | $750.00 |
| Texas | 22 (April 20 to May 12) | 250,000 × 1.50% × 22 / 365 | $226.03 |
| Florida | 25 (April 20 to May 15) | 250,000 × 5.70% × 25 / 365 | $976.03 |

The interest is taxable to the beneficiary (26 USC 101(c)) while the death benefit isn't, and interest on delayed death benefits of $600 or more goes on Form 1099-INT; the New York and Florida amounts here would be reported and the Texas amount wouldn't ([Death Benefits and Transfers for Value](/books/insurance/life-insurance-and-tax#death-benefits-and-transfers-for-value)). The engine needs, per claim: the governing state's rule, the date of death, the proof date, the acceptance date, the rate source and its value on the right date, and the day count, all stored with the payment. Which state's statute governs (the insured's residence, the policy's issue state, the beneficiary's state) is itself a rule the claim has to resolve and record.

## Death Master File Matching

The **Death Master File** is the Social Security Administration's file of reported deaths, and the NCOIL model lets insurers use it "or any other database or service that is at least as comprehensive" (3B). Under the model (Section 4A):

1. Compare in-force policies, annuity contracts and retained asset accounts against the DMF **at least semi-annually**, using the full file once and the update files after that.
2. Match on Social Security number, or on name and date of birth (3C), with procedures to account for common nicknames, initials, middle names used as first names, compound and interchanged first and middle names; compound, maiden, married and hyphenated last names and spacing or apostrophes; **transposed month and day** in dates of birth; and incomplete Social Security numbers (4A(3)).
3. **Within 90 days** of a match, make a documented good faith effort to confirm the death against other records, determine whether benefits are due, and if so make documented good faith efforts to locate the beneficiaries and give them claim forms and instructions (4A(1)).
4. For group life where the insurer keeps the individual records (SSN or name and DOB, beneficiary, eligibility, amount, premium status), confirm possible deaths the same way (4A(2)).
5. Charge beneficiaries nothing for the search or verification (4B).

The model excludes ERISA and federal employee benefit plan coverage, preneed funeral policies, credit life and accidental death, and group policies where the insurer doesn't keep the records (3E). Florida's statute differs in ways a multistate system has to carry: comparisons at least annually before August 31, a match that creates a presumption of death unless the insurer has "competent and substantial evidence" the person is alive, 120 days to follow up, and comparisons of all in-force policies for insurers under a regulatory settlement agreement or a qualifying targeted exam as of June 30, 2016 (717.107(8), (9)).

Access to the DMF is itself regulated: SSA's recent deaths are in the **Limited Access DMF**, available only to persons certified, under penalty of 18 USC 1001, to have a legitimate fraud prevention interest or a legitimate business purpose under a law, rule, regulation or fiduciary duty, with safeguards for the data and restrictions on redisclosure (15 CFR 1110.102). An insurer, or the vendor that runs its matches, holds that certification and must stay inside it.

Matching is record linkage, with all its failure modes ([Record Linkage](/docs/building-blocks/record-linkage#review-bands)): false positives (a living insured flagged as dead) cost goodwill and a confirmation effort; false negatives are what the settlements penalized. The model's variant rules are deterministic, so the matcher's job is to generate candidates under each rule, score them, and send each to confirmation with the rule that fired:

```go tab="Go"
import "strings"

// Person is a normalized identity from the policy file or the DMF.
type Person struct {
	SSN        string // digits only; may be partial
	First, Mid string
	Last       string
	DOB        string // YYYY-MM-DD
}

func norm(s string) string {
	s = strings.ToUpper(s)
	return strings.NewReplacer("-", "", " ", "", "'", "", ".", "").Replace(s)
}

// MatchRule returns the NCOIL rule a candidate pair satisfies, or "".
// nick maps a normalized nickname to its normalized formal name.
func MatchRule(p, d Person, nick map[string]string) string {
	if len(p.SSN) == 9 && p.SSN == d.SSN {
		return "ssn"
	}
	first := func(x Person) string {
		if f, ok := nick[norm(x.First)]; ok {
			return f
		}
		return norm(x.First)
	}
	sameLast := norm(p.Last) == norm(d.Last)
	sameFirst := first(p) == first(d) || norm(p.Mid) == norm(d.First) ||
		norm(p.First) == norm(d.Mid) // middle name used as first, or interchanged
	swapped := len(p.DOB) == 10 && len(d.DOB) == 10 && p.DOB[:4] == d.DOB[:4] &&
		p.DOB[5:7] == d.DOB[8:10] && p.DOB[8:10] == d.DOB[5:7]
	switch {
	case sameLast && sameFirst && p.DOB == d.DOB:
		return "name_dob"
	case sameLast && sameFirst && swapped:
		return "name_dob_transposed"
	case len(p.SSN) >= 5 && strings.HasSuffix(d.SSN, p.SSN) && sameLast && p.DOB == d.DOB:
		return "partial_ssn_last_dob"
	}
	return ""
}
```

```rust tab="Rust"
use std::collections::HashMap;

pub struct Person { pub ssn: String, pub first: String, pub mid: String, pub last: String, pub dob: String }

fn norm(s: &str) -> String {
    s.to_uppercase().chars().filter(|c| !matches!(c, '-' | ' ' | '\'' | '.')).collect()
}

/// The NCOIL rule a candidate pair satisfies, or None.
pub fn match_rule(p: &Person, d: &Person, nick: &HashMap<String, String>) -> Option<&'static str> {
    if p.ssn.len() == 9 && p.ssn == d.ssn { return Some("ssn"); }
    let first = |x: &Person| { let f = norm(&x.first); nick.get(&f).cloned().unwrap_or(f) };
    let same_last = norm(&p.last) == norm(&d.last);
    let same_first = first(p) == first(d) || norm(&p.mid) == norm(&d.first) || norm(&p.first) == norm(&d.mid);
    let swapped = p.dob.len() == 10 && d.dob.len() == 10 && p.dob[..4] == d.dob[..4]
        && p.dob[5..7] == d.dob[8..10] && p.dob[8..10] == d.dob[5..7];
    if same_last && same_first && p.dob == d.dob { return Some("name_dob"); }
    if same_last && same_first && swapped { return Some("name_dob_transposed"); }
    if p.ssn.len() >= 5 && d.ssn.ends_with(&p.ssn) && same_last && p.dob == d.dob {
        return Some("partial_ssn_last_dob");
    }
    None
}
```

A policy file with "Bill O'Neil, born 1951-04-07, SSN ending 4321" against a DMF record for "William ONeil, 1951-07-04" matches under `name_dob_transposed` with the nickname table mapping BILL to WILLIAM and the apostrophe normalized away. A match is a candidate, not a death: it starts the 90-day (or 120-day) confirmation clock, and the confirmation evidence and outcome are stored on the match.

## The Multistate Settlements

The DMF duty came out of enforcement before it came out of statute. In the early 2010s, state treasurers hired audit firms to examine life insurers for unreported deaths and unpaid benefits, and insurance regulators opened targeted multistate market conduct examinations of claims practices and DMF use; Kemper disclosed an audit firm "retained by the treasurers of thirty-eight states" and a California State Controller suit filed in 2013 for failing to produce information the firm requested, and Protective disclosed a targeted multistate examination and two third-party audits. Insurers that settled agreed, as Protective's 10-Q summarizes the agreements, to "implement procedures for periodically comparing their life insurance and annuity contracts" against a death database, to treat confirmed deaths as giving rise to a death benefit, to locate beneficiaries and pay benefits and interest, and to escheat benefits, interest and penalties when beneficiaries can't be found. <!-- source-gap: dmf-settlement-amounts | missing | names, dates and dollar amounts of the largest carriers' regulatory settlement agreements and global resolution agreements (2011-2016) | closes with: a state regulator's press release or the carriers' 10-K legal proceedings notes for 2012-2014 | checked: 2026-11-10 --> The individual settlements with the largest carriers, their dates and their amounts weren't reachable from a primary source in this review, so the chapter describes their common terms without figures.

The statutes followed: Kemper's 2013 filing lists Kentucky, Maryland, Montana, Nevada, New York, North Dakota and Vermont laws effective between January 1, 2013 and July 1, 2014, New Mexico's applying only to policies issued after July 1, 2013 for companies that hadn't used the DMF, and Alabama's limited to policies issued on or after January 1, 2016. The NCOIL model was first adopted by NCOIL's Executive Committee on November 20, 2011, updated on November 23, 2014, and readopted in March 2019 and on April 14, 2024. For a system, the history means the DMF duty's scope is per state and per policy cohort: which policies (all in force, or those issued after a date), how often, how fast, and whether the company is under a settlement that widens it.

## Unclaimed Property and Escheat

When the insurer knows of a death (a death certificate or a validated DMF match is "knowledge of death" under the NCOIL model, 3D) and can't find a beneficiary, the proceeds become unclaimed property:

- **First payable to beneficiaries.** The benefits plus accrued contractual interest are payable first to the beneficiaries or owners, and escheat to the state only if they can't be found (NCOIL 4C).
- **When.** Florida presumes funds under a matured or terminated policy or annuity abandoned if unclaimed "for more than 5 years after the date of death of the insured," and treats a policy as matured when the company knows of the death, when a DMF presumption isn't rebutted, at the maturity date, or when the insured has reached the mortality table's limiting age with no activity on the policy in the prior two years (717.107(1), (3)). Other states set their own periods.
- **Notice and remittance.** At the end of the period the insurer notifies the state's unclaimed property office that no claim was made and its good faith efforts failed, and remits the proceeds with accrued interest (NCOIL 4D, 4E). Statutory interest under the insurance code's late payment statute is not payable as unclaimed property under the model's drafting.
- **Due diligence and reporting.** The state's unclaimed property law sets the owner notice before reporting and the report format; [Banking & Lending](/books/banking-and-lending/dormancy-and-escheat#due-diligence-and-reporting) covers both for financial accounts, and the insurer's report runs the same way with life-specific property types.

Escheat isn't the end of the claim: a beneficiary who turns up later claims from the state, and the insurer's record of what it paid to which state, when, for whom, is what the state uses to pay them.

## How to Build It

Death claims use the core model's `claims` (cause `death`), `exposures` (one per beneficiary and coverage), `reserves`, `claim_payments` and `claim_tasks`, and the `party_roles` history for the designation as of the date of death. Contestability and suicide reviews are claim tasks with their rule references; interest is a computed component of each payment. This chapter adds the DMF match and the escheatment:

```sql
CREATE TABLE dmf_matches (                 -- a candidate death and what was done about it
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  run_id             UUID NOT NULL,         -- the comparison run (full or update file)
  source             TEXT NOT NULL CHECK (source IN ('ssa_ladmf', 'commercial_equivalent',
                       'state_vital_records')),
  file_as_of         DATE NOT NULL,
  policy_id          UUID NOT NULL REFERENCES policies (id),
  subject_party_id   UUID NOT NULL REFERENCES parties (id),  -- insured, owner, annuitant,
                                            -- or retained asset account holder
  match_rule         TEXT NOT NULL,         -- 'ssn', 'name_dob', 'name_dob_transposed', ...
  reported_death_date DATE,
  governing_rule     TEXT NOT NULL,         -- 'NCOIL 4A semiannual/90d', 'FL 717.107 120d'
  confirm_by         DATE NOT NULL,         -- 90 or 120 days from the match
  status             TEXT NOT NULL CHECK (status IN ('candidate', 'confirmed_dead',
                       'confirmed_alive', 'not_payable', 'claim_opened', 'escheat_pending')),
  evidence           JSONB NOT NULL DEFAULT '[]',  -- documented good faith efforts
  claim_id           UUID REFERENCES claims (id),
  resolved_at        TIMESTAMPTZ
);

CREATE TABLE escheatments (                -- proceeds remitted to a state
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID REFERENCES claims (id),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  owner_party_id     UUID REFERENCES parties (id),  -- beneficiary or owner of record
  state              TEXT NOT NULL,
  property_type      TEXT NOT NULL,         -- the state's code for matured life proceeds
  knowledge_of_death DATE NOT NULL,
  presumed_abandoned_on DATE NOT NULL,      -- e.g. 5 years after death in Florida
  due_diligence      JSONB NOT NULL,        -- notices sent, searches, results
  principal          BIGINT NOT NULL,
  contractual_interest BIGINT NOT NULL,
  report_ref         TEXT,                  -- the state report and line
  remitted_at        TIMESTAMPTZ,
  reclaimed_from_state_at TIMESTAMPTZ       -- if the beneficiary later claimed
);
```

A claim payment then carries its interest computation: state rule, start and end dates, rate source and value, day count and amount, which also decides whether a 1099-INT is due. The `confirm_by` date, the payment deadline and the escheat date are `claim_tasks` with their rules, so a missed one shows up on the same diary as every other claim clock ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## Auditing

- **The DMF program.** Every comparison run with its source file and date, the policies compared (scope by state and cohort), every candidate with the rule that matched, and every confirmation with its evidence and date against the 90 or 120 day deadline.
- **Claims decisions.** Contestability and suicide reviews with the dates that put the death inside or outside each period, the evidence, and the materiality analysis for any rescission.
- **The designation as of death.** The beneficiary record effective on the date of death, pending changes considered, and the reasoning for each payee and share.
- **Interest.** The rule, dates, rate and calculation on every payment, and the 1099-INT when due.
- **Escheat.** Knowledge of death, due diligence, the presumed-abandoned date, the report and remittance, so a later claimant can be traced to the state.
- **Retained asset accounts.** Included in the DMF comparison like policies, with their own escheat path.

## What This Means for the System You Build

- **Run DMF comparisons on schedule against every in-scope policy, annuity and retained asset account,** with the variant matching rules the law names and a confirmation clock per match.
- **Store the contestable and suicide dates per coverage layer,** including increases and reinstatements, and open reviews automatically for deaths inside them.
- **Resolve beneficiaries from the designation history as of the date of death,** with pending changes visible.
- **Compute interest per payment from the governing state's rule** and keep the inputs, and report it on 1099-INT when it reaches the threshold.
- **Treat escheat as a claim outcome with its own record,** not a write-off, so the money can be traced when someone comes looking.
- **Keep DMF access inside its certification:** the purpose, the safeguards and no redisclosure.

## References

**Law and regulation**

- [15 CFR 1110.102](https://www.law.cornell.edu/cfr/text/15/1110.102), certification for access to the Limited Access Death Master File: legitimate purpose, safeguards and redisclosure limits
- [26 USC 101](https://www.law.cornell.edu/uscode/text/26/101), the death benefit exclusion and the taxability of interest
- [26 USC 72](https://www.law.cornell.edu/uscode/text/26/72), distribution requirements on the death of an annuity holder
- [N.Y. Ins. Law 3203](https://www.nysenate.gov/legislation/laws/ISC/3203), incontestability after two years, the permitted suicide, aviation, hazardous occupation and war exclusions, and the payment when an exclusion applies
- [N.Y. Ins. Law 3214](https://www.nysenate.gov/legislation/laws/ISC/3214), interest on death proceeds from the date of death at the interest settlement option rate, and the interpleader exception
- [Tex. Ins. Code 1101.006 (Texas Public Law)](https://texas.public.law/statutes/tex._ins._code_section_1101.006), incontestability after two years
- [Tex. Ins. Code 1101.011 (Texas Public Law)](https://texas.public.law/statutes/tex._ins._code_section_1101.011), settlement within two months after proof
- [Tex. Ins. Code 1103.104 (Texas Public Law)](https://texas.public.law/statutes/tex._ins._code_section_1103.104), interest from proof of loss until acceptance and offer, at the policy or deposit rate
- [Fla. Stat. 627.455](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.455.html), incontestability after two years during the insured's lifetime and its exceptions
- [Fla. Stat. 627.4615](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.4615.html), interest from receipt of due proof of death at no less than the Moody's Corporate Bond Yield Average, or 8%
- [Fla. Stat. 717.107](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0717/Sections/0717.107.html), funds under life policies presumed unclaimed five years after death, maturity rules, annual DMF comparison, the presumption of death, the 120-day follow-up and the no-fee rule
- [Mo. Rev. Stat. 376.620](https://revisor.mo.gov/main/OneSection.aspx?section=376.620), suicide exclusions limited to one year from issue or from an increase, and the premium refund

**Regulators and guidance**

- [NCOIL: Model Unclaimed Life Insurance Benefits Act, April 2024 (PDF)](https://ncoil.org/wp-content/uploads/2025/12/NCOIL-Unclaimed-Benefits-Model-April-2024.pdf), definitions of Death Master File, match, knowledge of death and retained asset account, the semi-annual comparison, matching variants, the 90-day clock, the no-fee rule, escheat and exclusions

**Filings**

- [Protective Life: Form 10-Q for the quarter ended June 30, 2013 (XBRL note)](https://www.sec.gov/Archives/edgar/data/355429/000110465913059377/R17.xml), the targeted multistate examination, unclaimed property audits, and the terms of other insurers' settlement and consent agreements
- [Kemper: Form 10-Q for the quarter ended June 30, 2013 (XBRL note)](https://www.sec.gov/Archives/edgar/data/860748/000086074813000065/R19.xml), state DMF statutes and effective dates, the Kentucky and Maryland suits, the 38-state audit, the California Controller suit and the multistate examination
