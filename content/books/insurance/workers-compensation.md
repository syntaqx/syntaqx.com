+++
title = "Workers' Compensation"
description = "Statutory coverage and employers liability, NCCI and independent bureaus, monopolistic and competitive state funds, Texas opt-out, self-insurance, PEOs."
category = "Insurance Industry"
order = 2754
part = "Workers' Compensation"
tags = ["insurance", "workers-compensation", "state-funds", "peo", "self-insurance", "rating-bureaus"]
+++

Workers' compensation is insurance whose coverage is written by legislatures. Every state has a statute that makes employers pay medical care and wage replacement for employees injured on the job, regardless of fault, in exchange for immunity from most negligence suits by those employees (the "exclusive remedy"). The policy doesn't define the benefits; it promises to pay whatever the law of each covered state requires, which is why it is called statutory coverage. What varies by state is almost everything else: who must carry it, whether it can be bought from a private insurer at all, who sets the rates, how injuries are reported, what the benefits are and how medical bills are priced.

It is also a line with a single rating language. Premium is payroll by class code times a rate, adjusted by an experience modification computed by a rating bureau from the employer's own losses, and settled by an audit of actual payroll after the policy ends. That makes it more like a utility than a negotiated commercial line, and it gives the system a dense set of external parties: the bureau that publishes classes and rates and computes mods, the state agency that receives injury reports electronically, the state fund that competes with private insurers or excludes them, and the PEO that may hold the policy for thousands of client employers. This chapter covers the coverage, the bureaus, the state funds, Texas's opt-out, self-insurance and PEOs, and the market. Pricing and audit are in [Rating Workers' Comp & Premium Audit](/books/insurance/rating-workers-comp), claims in [Workers' Comp Claims](/books/insurance/workers-comp-claims). Payroll data itself (how wages are computed, taxed and reported) is the Workforce volume's: [Gross to Net](/books/workforce/gross-to-net) and [PEOs & Co-Employment](/books/workforce/peos-and-co-employment). This chapter extends `policies` and `risks` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `wc_state_coverage`.

## How the Platforms Do It

As of November 2026, from 2025 statutory data, filings and the funds' pages:

| Insurer | Kind | What the public record says |
| --- | --- | --- |
| **The Hartford** | Private, national | Largest workers' compensation group in 2025 at 6.65% of $56.1 billion of US direct premium |
| **Travelers** | Private, national | Second at 6.58% |
| **AmTrust** | Private, small business | Third at 6.27% |
| **New York State Insurance Fund** | Competitive state fund | Listed as State Insurance Fund Workers' Compensation at 2.85%, among the ten largest writers |
| **State Compensation Insurance Fund** | Competitive state fund (California) | 1.71% of US premium |
| **Texas Mutual** | Mutual | 1.68%; paid $300 million of general dividends in 2026 to nearly 74,000 policyholders, its 28th consecutive year, nearly $5.1 billion in total |
| **Employers Holdings** | Private, small low-hazard employers | 1.33%; 133,605 policies averaging $5,459; California 46.1% of its premium; writes in every state except the four served only by state funds |
| **Workforce Safety & Insurance** | Monopolistic state fund (North Dakota) | "the sole provider and administrator of the workers' compensation system in North Dakota" |

The top 25 groups wrote 67.71% of the line. Two of the largest writers are government or government-born funds, and four states (North Dakota, Ohio, Washington and Wyoming) let no private insurer write the primary coverage at all.

## The Line in Numbers

NCCI's State of the Line, updated October 13, 2026 with final figures, puts the 2025 calendar year net combined ratio at 90.6%, the twelfth consecutive year of underwriting gains, on net written premium of about $41.6 billion, down 0.2% from 2024. Accident year 2025 lost-time claim frequency fell 2% from 2024, while indemnity and medical lost-time severity each rose about 4%. The investment gain on insurance transactions was 8.8% of net earned premium. NCCI's May 2026 presentation described the industry's reserve position as redundant by about $14 billion. The $41.6 billion is NCCI's net premium for private carriers and state funds in its data, smaller than the NAIC's $56.1 billion of direct premium, which counts all statutory filers before reinsurance; the two series answer different questions and shouldn't be compared directly.

The shape of those numbers matters for the system: fewer claims each costing more means each lost-time claim's reserve and medical bill review carry more of the result.

## The Policy

The standard workers' compensation and employers liability policy, written on NCCI's or a bureau's form in nearly every competitive state, has three insuring parts:

- **Part One, workers' compensation.** The insurer pays the benefits the workers' compensation law of each state listed on the policy requires. There is no dollar limit: the limit is the statute.
- **Part Two, employers liability.** Covers suits against the employer for employee injuries the comp law doesn't take out of the courts: third-party-over actions (an injured employee sues a manufacturer, which sues the employer), consequential claims by family members, dual capacity suits, and claims in states or situations outside the exclusive remedy. It has limits per accident, per employee for disease and a policy limit for disease, shown on the information page.
- **Part Three, other states insurance.** Extends Part One to states listed for it, so an employee hurt while temporarily working in a state where the employer has no exposure listed is still covered under that state's law.

<!-- source-gap: wc-policy-form | missing | the text of the WC & EL policy WC 00 00 00 (Parts One to Three) | closes with: a public copy of the NCCI policy form on a state DOI or bureau site | checked: 2026-11-10 --> I couldn't open a public copy of the policy form itself. The standard employers liability limits are set in the bureau manuals; Pennsylvania's, for example, sets Part Two at $100,000 each accident for bodily injury by accident, $100,000 each employee and $500,000 policy limit for bodily injury by disease ([PCRB Workers Compensation Manual, Rule VIII](https://pcrb.com/manuals/workers-compensation-manual/section-1-underwriting-rules/rule-viii-limits-of-liability/)), and the policy's information page shows the limits that apply.

Two consequences for the record. The policy's coverage is a list of states, each with its own law, benefits, rates and reporting rules, so the state is a first-class dimension of every risk, premium entry and claim. And the employer is covered for every employee in its covered operations, whether or not it reported them: an unreported class or a new location is still covered, and the premium for it is collected at audit.

## Rating Bureaus

Workers' compensation classifications, statistical reporting and experience rating are run by rating bureaus. NCCI (the National Council on Compensation Insurance) is the bureau or statistical agent in most states; the others run their own. From NCCI's own description of where its experience rating plan applies:

| Arrangement | States |
| --- | --- |
| NCCI's experience rating plan approved and applied | 39 jurisdictions |
| Independent bureaus that combine with NCCI for interstate rating | Minnesota and Wisconsin, when the employer has exposure in two or more participating states |
| NCCI's plan, intrastate mods produced by the local bureau | Indiana, Massachusetts, North Carolina |
| NCCI's plan doesn't apply: own bureau and plan | California, Delaware, Michigan, New Jersey, New York, Pennsylvania |
| Monopolistic state funds with their own plans and rates | North Dakota, Ohio, Washington, Wyoming |

The bureau publishes the classification manual, files advisory loss costs (or, in administered pricing states, rates) with each state, collects every policy's unit statistical report of payroll and losses, and computes each employer's mod. Employers Holdings' 10-K describes the result: rates are based on state-specific actuarial analysis, except in administered pricing states, where "premium rates are set by state insurance regulators." For the insurer's system, the bureau is a counterparty with its own data formats and deadlines: policy declarations to the bureau, unit stat reports, mods received, and in many states proof of coverage filings.

## State Funds

**Monopolistic.** In North Dakota, Ohio, Washington and Wyoming, employers buy primary coverage only from the state fund (or self-insure where allowed). Private insurers can't write Part One there; multistate employers buy employers liability for those states separately ("stop gap" coverage), and a private policy lists those states as excluded from Part One. The NRRA expressly preserves state laws restricting placement of workers' compensation with nonadmitted insurers (15 USC 8202(d)), so surplus lines can't fill the gap either.

**Competitive.** Many states have a state fund that competes with private insurers and serves as the insurer of last resort; California's State Compensation Insurance Fund and the New York State Insurance Fund are among the largest workers' compensation writers in the country. Texas Mutual, a mutual, pays dividends that "are based on performance, are not guaranteed and must comply with Texas Department of Insurance rules."

**Residual markets.** In other states, employers that can't buy coverage voluntarily go to an assigned risk plan, with servicing carriers issuing the policies; NCCI's experience rating guide lists the assigned risk adjustment programs (ARAP, Florida's FLARAP, SARAP and Massachusetts's MAARAP) that surcharge residual market employers by their experience. Residual markets in general are covered in [Stressed & Residual Markets](/books/insurance/stressed-markets) in the Regulation part.

## Texas Non-Subscription

Texas is the only state where most private employers may choose not to carry workers' compensation at all: "Except for public employers and as otherwise provided by law, an employer may elect to obtain workers' compensation insurance coverage" (Labor Code 406.002). The election has costs. An employer without coverage loses the common law defenses in an employee's negligence suit: it is no defense that the employee was contributorily negligent, assumed the risk, or was hurt by a fellow employee's negligence, though the employee must still prove the employer's negligence (406.033). Employers must tell new hires whether they have coverage, post notice where employees will see it, and notify employees of a change in coverage within 15 days (406.005). Non-subscribers file a notice of no coverage with the Division of Workers' Compensation each year between February 1 and April 30 through Employer E-File, post Notice 5 in English and Spanish, and, if they have five or more employees, report injuries with more than one day of lost time.

TDI's research group estimated the employer subscription rate at 75% in 2022, up three points, with 83% of employees working for subscribers, the highest in twelve years. Non-subscription is concentrated in the smallest employers (31% of employers with one to four employees) and, at the other end, the largest (20% of those with 500 or more).

For the system: a Texas employer's coverage status is a fact to record with its filings and notices, and an insurer writing occupational accident or employer liability coverage for non-subscribers is writing a different product, not workers' compensation.

## Self-Insurance

Large employers in most states may self-insure with the state's permission, posting security and usually buying excess coverage. California's Labor Code 3700 gives the three ways to secure compensation: insurance "by one or more insurers," a "certificate of consent to self-insure" from the Director of Industrial Relations (individually or as a group), or, for public entities, self-insurance under their own authority; DIR's Office of Self Insurance Plans regulates self-insurers and makes sure security deposits are posted. Self-insured employers and group self-insurance funds buy specific and aggregate excess workers' compensation from insurers, a commercial excess product with its own retention and limits, and they use third-party administrators for claims, which then report to the state like an insurer.

Large deductible programs are the insured alternative: the insurer issues a standard policy and is liable for every claim, and the employer reimburses losses up to a per-claim deductible, secured by collateral. The Workforce volume describes PEOs carrying that risk themselves: ADP retains workers' compensation risk through "deductible reimbursement insurance protection" up to $1 million per occurrence, and TriNet assumes losses up to $1 million per claim in its deductible layer ([Revenue Models](/books/workforce/revenue-models)). How deductibles price is in [Rating Workers' Comp & Premium Audit](/books/insurance/rating-workers-comp#retrospective-rating-and-deductible-plans).

## PEOs and Master Policies

A professional employer organization co-employs its clients' workers, and workers' compensation is one of the duties it can take on, by one of a few structures that states regulate differently. North Carolina's statute lets the carrier elect one of two methods: a **multiple coordinated policy**, where "the licensee shall secure a separate policy for each client company," with the PEO as named insured and the client designated on it, so each client keeps its own experience; or a **single policy**, where "the insurer shall issue to the licensee a single policy covering all assigned employees in this State," with a certificate for each client (G.S. 58-89A-110). Florida makes the employee leasing company "responsible for providing workers' compensation coverage pursuant to chapter 440" (s. 468.529(1)). Texas lets "a license holder or client" elect who provides it (Labor Code 91.042, as the Workforce volume's [PEOs & Co-Employment](/books/workforce/peos-and-co-employment) covers). Under a master policy the PEO's own experience usually drives the mod; under a multiple coordinated policy, each client's.

For the insurer, a PEO master policy is one policy with thousands of employer locations and class exposures, payroll reported by client every pay period, certificates issued per client, and the hard problem of a client leaving mid-term: its exposure comes off the PEO's policy, and its own policy must bind the same day, with its experience following it.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). A workers' compensation policy is a `policies` row whose coverage is a set of states, each with its own law and bureau; class exposures are `risks` of kind `class_exposure` per state, location and class; PEO clients are parties with their own exposures on the PEO's policy.

```sql
CREATE TABLE wc_state_coverage (           -- what the policy says about each state
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_version_id  UUID NOT NULL REFERENCES policy_versions (id),
  state              TEXT NOT NULL,
  part               TEXT NOT NULL CHECK (part IN ('part_one', 'part_three', 'excluded',
                       'stop_gap_el')),       -- 'excluded' for monopolistic states
  bureau             TEXT NOT NULL,         -- 'NCCI', 'WCIRB', 'NYCIRB', 'PCRB', 'NCRB', ...
  pricing            TEXT NOT NULL CHECK (pricing IN ('loss_cost', 'administered')),
  bureau_risk_id     TEXT,                  -- the employer's risk id at the bureau
  proof_of_coverage_ref TEXT,               -- the state filing accepting the policy
  proof_filed_at     TIMESTAMPTZ,
  UNIQUE (policy_version_id, state, part)
);

CREATE TABLE employer_coverage_elections ( -- Texas and other opt-in or opt-out facts
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_party_id  UUID NOT NULL REFERENCES parties (id),
  state              TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('insured', 'self_insured',
                       'group_self_insured', 'non_subscriber', 'state_fund')),
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  certificate_ref    TEXT,                  -- self-insurance certificate of consent
  annual_notice_filed_at TIMESTAMPTZ,       -- Texas notice of no coverage, Feb 1 to Apr 30
  employee_notice_doc_id UUID               -- the posted notice
);

CREATE TABLE peo_client_assignments (      -- a PEO client's exposure on a master policy
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),  -- the PEO's policy
  client_party_id    UUID NOT NULL REFERENCES parties (id),
  structure          TEXT NOT NULL CHECK (structure IN ('master', 'multiple_coordinated',
                       'client_own')),
  client_policy_id   UUID REFERENCES policies (id),  -- the MCP policy, when separate
  effective_from     DATE NOT NULL,
  effective_to       DATE,                  -- termination: the client's own policy binds here
  client_certificate_doc_id UUID,
  experience_follows TEXT NOT NULL CHECK (experience_follows IN ('peo', 'client')),
  rule_ref           TEXT                   -- 'N.C. Gen. Stat. 58-89A-110', 'Fla. Stat. 468.529'
);
```

Design notes:

- **State is a dimension of everything.** Every class exposure, premium entry, unit stat report and claim carries the state whose law applies, because rates, benefits, reporting and bureau differ by state.
- **Monopolistic states are explicit exclusions.** A multistate policy lists them as excluded from Part One and may add stop gap employers liability; an employee hurt there is a fund claim, not ours, and the system routes it.
- **Bureau and state filings are integrations with deadlines.** Proof of coverage, unit statistical reports and mods have their own formats and due dates per bureau and state, recorded as tasks.
- **PEO client exposure is dated.** A client's assignment to a master policy has its own effective range, and its termination creates the task to confirm the client's replacement coverage the same day.

## Auditing

- **Coverage by state on every date:** which states were Part One, Part Three or excluded on each policy version, and the proof of coverage filings the states accepted.
- **Every employer election,** with its filings and notices, for Texas non-subscribers and self-insurers.
- **PEO client histories:** when each client was on the master policy, under which structure, whose experience followed, and the coverage that replaced it.
- **Bureau exchanges:** every report sent and mod received, with dates.

## What This Means for the System You Build

- **Make the state a key on every workers' compensation record,** with the bureau and pricing regime that applies.
- **Exclude monopolistic states from Part One explicitly** and route those claims to the state fund.
- **Record employer coverage elections and notices** for opt-out and self-insured employers.
- **Model PEO client assignments as dated rows** on the PEO's policy, with the structure, the certificate and whose experience follows.
- **Treat the bureau and the state agency as integration partners** with tracked deliveries and deadlines.
- **Link payroll data to the Workforce side** rather than recomputing it, and keep the insurance records (exposures, premium, mods, claims) here.

## References

**Law and regulation**

- [Tex. Labor Code 406.002](https://texas.public.law/statutes/tex._labor_code_section_406.002), private employers' election to carry coverage
- [Tex. Labor Code 406.005](https://texas.public.law/statutes/tex._labor_code_section_406.005), notice to employees of coverage and of changes within 15 days
- [Tex. Labor Code 406.033](https://texas.public.law/statutes/tex._labor_code_section_406.033), the lost common law defenses of non-subscribers and the employee's burden to prove negligence
- [Cal. Labor Code 3700 (FindLaw)](https://codes.findlaw.com/ca/labor-code/lab-sect-3700/), the three ways to secure compensation: insurance, a certificate of consent to self-insure, and public entity self-insurance
- [N.C. Gen. Stat. 58-89A-110](https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_58/GS_58-89A-110.html), PEO workers' compensation by multiple coordinated policy or single policy
- [Fla. Stat. 468.529](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0468/Sections/0468.529.html), the employee leasing company's responsibility for coverage under chapter 440
- [15 USC 8202](https://www.law.cornell.edu/uscode/text/15/8202), the NRRA's preservation of state limits on placing workers' compensation with nonadmitted insurers

**Regulators and guidance**

- [Texas Department of Insurance: Non-subscribers](https://www.tdi.texas.gov/wc/nonsubscriber.html), the annual notice of no coverage, Notice 5 and injury reporting by non-subscribers with five or more employees
- [Texas Department of Insurance: Employer participation estimates, 2022](https://www.tdi.texas.gov/wc/reg/nonsub2022.html), the 75% subscription rate, the 83% employee share and non-subscription by employer size
- [California DIR: Office of Self Insurance Plans](https://www.dir.ca.gov/osip/sip.html), oversight of self-insurance and security deposits
- [North Dakota Workforce Safety & Insurance: About us](https://www.workforcesafety.com/about-us), the sole provider of workers' compensation in North Dakota

**NAIC**

- [NAIC: 2025 Property and Casualty Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-property-casualty-market-share.pdf), workers' compensation direct premium of $56.1 billion and the top 25 groups' shares

**Standards**

- [NCCI: State of the Line update, October 13, 2026](https://www.ncci.com/Articles/Pages/Insights-State-of-the-Line-Update-The-Latest-Results.aspx), the 90.6% combined ratio, net written premium, frequency, severity and investment gain
- [NCCI: State of the Line report, May 12, 2026](https://www.ncci.com/Articles/Pages/Insights-AIS2026-SOTL-Report.aspx), the preliminary results and the redundant reserve position of about $14 billion
- [NCCI: ABCs of Experience Rating (PDF)](https://www.ncci.com/Articles/Documents/UW_ABC_Exp_Rating.pdf), where NCCI's plan applies, the independent bureau states, the monopolistic states and the assigned risk adjustment programs

**Filings**

- [Employers Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1379041/000137904126000011/eig-20251231.htm), policies in force, average policy size, California share, the monopolistic state exclusion and administered pricing states

**In practice**

- [Texas Mutual: Dividends](https://www.texasmutual.com/employers/dividends), the 2026 general dividend, 28 consecutive years and the TDI rules on dividends
