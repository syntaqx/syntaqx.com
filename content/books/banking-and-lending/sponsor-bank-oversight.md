+++
title = "Sponsor Bank Oversight"
description = "How a sponsor bank supervises programs: the 2023 third-party guidance, its 2026 replacement proposal, the consent orders, compliance management and exits."
category = "Banking & Lending Industry"
order = 2427
part = "Fintech and BaaS"
tags = ["banking", "baas", "sponsor-banks", "third-party-risk", "consent-orders", "compliance"]
+++

A sponsor bank is examined for everything its programs do. Its regulators don't supervise the fintechs directly (except where the CFPB or a state reaches them in their own right); they supervise the bank, and they judge it by whether it knows, for every program, who its customers are, where their money is, which tasks someone else performs on its behalf, and whether those tasks get done. Between 2023 and 2025 a run of consent orders against sponsor banks spelled out what the regulators found when the answer was no, and in September 2026 the agencies proposed to replace the guidance those orders leaned on with a lighter, risk-tiered version.

This chapter is the bank's operating view: the guidance as of October 2026 and where it's heading, what the orders required and what that does to a program, the compliance management system a sponsor runs across its programs, and the exit to a charter some programs are taking. The card-side summary of the same orders is in [Sponsor Banks Under Scrutiny](/books/payments/card-issuing#sponsor-banks-under-scrutiny); the roles and the compliance task matrix are in [Banking as a Service](/books/banking-and-lending/banking-as-a-service#who-owns-which-obligation); the enforcement process and its records are in [Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#enforcement).

## How the Platforms Do It

The public orders against sponsor banks, and their status as of October 2026:

| Bank | Regulator and date | What the order required of its fintech business | Status |
| --- | --- | --- | --- |
| **Cross River Bank** | FDIC, March 2023, published April 2023 | Fair lending: an inventory of credit products and the third parties offering them; FDIC non-objection before a new third party or credit product; independent review of whether its systems can monitor products, partners and credit models; independent fair lending reviews of partners; annual partner assessments | No termination found |
| **Blue Ridge, Lineage, Sutton** | OCC (Blue Ridge, January 2024); FDIC (Lineage, January 2024); FDIC and Ohio (Sutton, February 2024) | Exit plans, prior approval of new lines of business, the Sutton inventory of who performs each AML task and its CIP lookback ([Sponsor Banks Under Scrutiny](/books/payments/card-issuing#sponsor-banks-under-scrutiny)) | Blue Ridge's terminated, announced November 2025 |
| **Piermont Bank** | FDIC, February 26, 2024 | Review all transactions since September 2022 for unreported suspicious activity; review EFTA disputes back to August 2020; within 90 days review its records on third-party relationships, within 120 days review its third-party program (due diligence, agreements, monitoring, data and reporting, approvals), then an action plan | No termination found |
| **Thread Bank** | FDIC, effective May 21, 2024, published June 28, 2024 | Names "banking-as-a-service" outright: oversight and due diligence of fintech partners, beneficial ownership records, AML/CFT, liquidity, an exit plan for fintech partners, monitoring of third, fourth and fifth parties, a plan to notify customers and regulators of a disruption | Terminated in December 2025 |
| **Evolve Bank & Trust** | Federal Reserve and Arkansas, June 14, 2024 | Improve AML, risk management and consumer compliance; strengthen risk management of current fintech partnerships, "including compliance and fraud risks"; oversight and monitoring with better recordkeeping | No termination found |

<!-- source-gap: sponsor-order-terminations | status | whether the Cross River (2023), Piermont, Sutton, Lineage and Evolve (2024) orders have been terminated | closes with: the FDIC enforcement decisions database and the Federal Reserve's enforcement action search, queried by bank | checked: 2026-10-29 -->

Choice Financial Group, one of Mercury's and Current's banks, has been reported to be under an FDIC order on BSA/AML and fintech oversight since late 2023; I couldn't open the order itself, so its terms are left out here.

<!-- source-gap: choice-order | missing | Choice Financial Group's December 2023 FDIC consent order, its terms and status | closes with: the order in the FDIC enforcement decisions database | checked: 2026-10-29 -->

Three things stand out. **The orders converge on the same articles:** an inventory of programs, prior approval before new partners or products, a lookback years into customer files, and a written plan to exit partners in an orderly way. **The lookbacks are where the cost is:** Piermont's EFTA review ran back to August 2020, Sutton's CIP review to July 2020, and each depends on records a program kept, or didn't, years earlier. **Orders end:** Thread's, the one that named BaaS outright, was terminated in December 2025, about 19 months after it took effect. Coastal Financial's 10-K summarizes the climate without naming names: "a significant number of banks that provide BaaS have become subject to enforcement actions relating to their partners' activities."

## The Guidance

### The 2023 interagency guidance

The Federal Reserve, FDIC and OCC finalized their Interagency Guidance on Third-Party Relationships: Risk Management on June 6, 2023 (88 FR 37920, June 9, 2023), rescinding and replacing each agency's older guidance. It organizes a relationship as a life cycle (planning; due diligence and third-party selection; contract negotiation; ongoing monitoring; and termination), with governance (oversight, independent reviews, documentation and reporting) over all of it, and expects more rigor for relationships that support **critical activities**: those that could cause significant risk if the third party fails, have significant customer impact, or significantly affect the bank's financial condition or operations. It applies the same principles "to all third-party relationships, including those with fintech companies", and treats a third party's reliance on subcontractors as part of due diligence and contracting.

### The 2024 joint statement and request for information

On July 25, 2024 the three agencies issued a joint statement on arrangements with third parties to deliver deposit products, which "does not establish new supervisory expectations" but lists the risks they had seen:

- **Operational and compliance:** a third party performing significant deposit operations, fragmented operations across several third parties, and a "lack of sufficient access by a bank to the deposit and transaction system of record", which "can impair the bank's ability to determine its deposit obligations" and delay end users' access.
- **Growth:** misaligned incentives, operations lagging growth, funding concentrations, liquidity risk when much of a bank's deposits or revenue come from one third party, and balance sheet growth "without commensurate capital formation."
- **Deposit insurance misrepresentation** under 12 CFR 328 subpart B, and end users' confusion about what is insured ([How the Platforms Do It](/books/banking-and-lending/deposit-insurance#how-the-platforms-do-it) in Deposit Insurance has the disclosures).

And the practices it had seen work: risk assessments per arrangement, due diligence deep enough to decide whether the bank can rely on each party, contracts defining roles, an assessment of parties the bank has no contract with, a clear understanding of any management information system the third party runs, contingency plans for a third party's failure with contract terms to transfer accounts, data or activities, dual control and clear error resolution, concentration limits and exit strategies, and analysis of whether any party is a deposit broker. The same day the agencies published a request for information on bank-fintech arrangements (89 FR 61577, July 31, 2024), whose comment period they later extended.

### The 2026 replacement proposal

On September 15, 2026 the OCC, the Federal Reserve, the FDIC and the NCUA proposed new Third-Party Risk Management Guidance (91 FR 58536; dockets OCC-2026-0793, OP-1881 and NCUA-2026-1684), with comments due November 16, 2026. As proposed, it would:

- **Tier by risk, not by activity.** It distinguishes higher-risk and lower-risk relationships by the magnitude and likelihood of harm (a non-trivial legal violation, material financial harm, or significant operational disruption), and criticizes the 2023 guidance for heightened practices applied "without regard to the magnitude and likelihood" of risk.
- **Reorganize the work** into risk identification and assessment, risk oversight (due diligence and selection, contract negotiation, ongoing monitoring, termination), residual risk acceptance, and governance.
- **Loosen the contract expectations.** There are "no generally applicable expected contract terms," even for higher-risk relationships, and a missing term isn't by itself a basis for an adverse finding; standard-form contracts may do for lower-risk relationships.
- **Treat subcontractors as the third party's business:** "The use of subcontractors alone does not typically create an independent third-party relationship," though the bank remains responsible.
- **Accept shared evidence:** credible certifications, consortium assessments and auditors' results "may be adequate" for due diligence.
- **Tailor for community banks,** with a companion Federal Reserve guide for traditional community banking organizations.
- **Rescind and replace** the 2023 guidance and its supplements, including the 2024 joint statement on deposit arrangements and the 2024 community bank guide.

As of October 2026 it is a proposal: the 2023 guidance and the 2024 statement remain in force until a final version replaces them. My reading for a builder: the proposal changes how much an examiner may demand of a lower-risk vendor, not what a sponsor bank needs to know about a deposit program. A program holding customers' money is a higher-risk relationship on any tiering, and the records that the orders required (who performs each task, the customer files, the per-owner balances) are the bank's own deposit obligations, which no guidance rewrite removes.

### Reputation risk

Separately, the OCC and FDIC adopted a final rule in 2026, effective June 6, 2026, that bars them from criticizing or taking adverse action against an institution on the basis of reputation risk, and from requiring or encouraging account closures based on a customer's political, social, cultural or religious views, protected speech, or lawful business activity perceived as a reputation risk. It followed the August 7, 2025 executive order "Guaranteeing Fair Banking for All Americans"; the Federal Reserve removed reputation risk from its exam programs in June 2025 and proposed a rule of its own. For sponsor banks, a program can no longer be criticized as an embarrassment; it can still be criticized for the compliance, credit, liquidity and operational risks it brings, which are what the orders above were about. The account-closing side is in [Dormancy, Escheat & Closing Accounts](/books/banking-and-lending/dormancy-and-escheat).

## Compliance Management Across a Program

A sponsor bank's compliance management system is the bank's own (board oversight, a compliance officer, policies, training, monitoring and testing, complaint response, audit), extended to every program as if each were a branch run by someone else. In practice it is a set of recurring jobs per program:

- **Onboarding a program.** Due diligence on the company (ownership, financial condition, management, its own compliance staff, its vendors and their contracts), on the product (every fee, disclosure and customer flow), and on the money flow; then a decision with conditions, recorded. Cross River's order made every new partner and credit product need the FDIC's non-objection as well, and Lineage's did the same for new lines of business.
- **Change control.** New products, fees, customer segments, states, vendors or marketing channels go back through approval, because each is a change to the bank's own product set ([Living With a Sponsor Bank](/books/payments/becoming-a-payment-provider#living-with-a-sponsor-bank)).
- **Monitoring.** Daily per-owner reconciliation ([Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers#daily-reconciliation)), reserve levels ([Reserves and Credit Enhancement](/books/banking-and-lending/banking-as-a-service#reserves-and-credit-enhancement)), growth in accounts and balances against limits, fraud and dispute rates, alert volumes and dispositions, SAR referrals, complaints, and the program's own financial condition.
- **Testing.** Each delegated obligation in the matrix is tested on a schedule: a sample of CIP files against the bank's procedure, a sample of Reg E claims against their clocks, a sample of disclosures against the approved versions, a sample of marketing against the bank's approvals. A test produces findings with owners and dates, the same shape as an examiner's ([Findings: MRAs and Violations](/books/banking-and-lending/exams-and-supervision#findings-mras-and-violations)).
- **Complaints.** Every complaint about a program is the bank's complaint, logged with category and outcome, and trends feed monitoring; examiners look there first.
- **Limits and intervention.** The bank can cap a program's growth, stop new account opening, restrict a product or require more reserves, and it needs the technical means to do so the same day, not by asking.
- **Exit planning.** For each program, the plan to move or close its accounts if the program fails, the bank exits, or a regulator requires it: the data the bank needs, who services the accounts in between, and how customers are paid ([Moving Between Sponsor Banks](/books/banking-and-lending/banking-as-a-service#moving-between-sponsor-banks)).

The consumer law each program brings is the bank's: Reg E error resolution, Reg DD disclosures, Reg CC availability, ECOA and fair lending for credit programs, UDAP and UDAAP in marketing and fees, and the FDIC's deposit insurance misrepresentation rule. The BSA program is the bank's too, and SARs are the bank's to decide and file, with their confidentiality kept from the program's customer-facing systems ([BSA/AML Programs](/books/banking-and-lending/bsa-aml) covers the program).

## What an Order Does to a Program

When a sponsor bank enters an order, its programs feel it within weeks:

- **New programs and products stop** until the regulator approves each, which can take months, so roadmaps freeze.
- **Lookbacks reach into the program's records.** A CIP lookback samples every customer onboarded since a date, against the procedures then in force; an EFTA lookback reconstructs every dispute's clock. A program whose records hold the inputs, results and timestamps can answer from a query; one that kept only outcomes reconstructs by hand.
- **Inventories and matrices become formal.** The Sutton and Thread orders required the bank to document each partner's role, and fourth and fifth parties, in a form the regulator reviews.
- **Exit plans get written,** naming which programs the bank would drop and how. Some programs leave first: Dave began moving new customers from Evolve to Coastal Community Bank in 2025 ([Moving Between Sponsor Banks](/books/banking-and-lending/banking-as-a-service#moving-between-sponsor-banks)).

My rule for a program: assume the bank will be asked, for any date in the last five years, who performed each obligation, what the customer record showed, and what the money was; build so the answer is a report.

## Exits to Charters

The other way out of sponsor oversight is to become the bank. In 2026 the OCC conditionally approved full-service national banks for Nubank (January), Mercury (April 27), Upstart (July 23) and others, and Revolut in September ([Fintechs That Chartered](/books/banking-and-lending/starting-a-bank#fintechs-that-chartered)). Mercury's still needs final OCC approval and FDIC and Federal Reserve approvals, and until then it runs on Choice Financial Group, Column and, for cards, Patriot Bank. A charter replaces the sponsor's oversight with direct supervision, an approved business plan, capital requirements and, above $10 billion, the debit interchange cap ([Program Manager or Charter](/books/banking-and-lending/neobanks#program-manager-or-charter)). The records a sponsor demanded don't go away; the program becomes the institution that has to keep them.

## How to Build It

These are deltas against `programs` and `cases` in [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model), on top of `program_participants` and `program_obligations` from [Banking as a Service](/books/banking-and-lending/banking-as-a-service#how-to-build-it) and `supervisory_findings` (which already carries `program_id`) and `enforcement_actions` from [Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#how-to-build-it). Complaints about a program are `cases` of kind `complaint` on its accounts. The bank's oversight adds reviews, tests and limits:

```sql
CREATE TABLE program_reviews (             -- due diligence, periodic reviews, change requests, exits
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  kind                TEXT NOT NULL CHECK (kind IN ('initial_due_diligence', 'periodic',
                        'change_request', 'incident', 'termination')),
  subject             TEXT,                  -- the product, fee, vendor or segment for a change request
  risk_tier           TEXT CHECK (risk_tier IN ('higher', 'lower')),  -- under the bank's tiering policy
  guidance_ref        TEXT NOT NULL,         -- the guidance version applied: 'tprm-2023', or a successor
  decision            TEXT CHECK (decision IN ('approved', 'approved_with_conditions', 'declined',
                        'deferred_to_regulator')),
  conditions          JSONB,
  regulator_nonobjection_ref TEXT,           -- where an order requires it
  decided_by          UUID,
  decided_at          TIMESTAMPTZ
);

CREATE TABLE obligation_tests (            -- the bank testing what it delegated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_obligation_id UUID NOT NULL REFERENCES program_obligations (id),
  period              DATERANGE NOT NULL,    -- the activity sampled
  procedure_ref       TEXT NOT NULL,         -- the procedure version tested against
  population          INT NOT NULL,
  sample_size         INT NOT NULL,
  exceptions          INT NOT NULL,
  result              TEXT NOT NULL CHECK (result IN ('effective', 'needs_improvement', 'ineffective')),
  finding_id          UUID REFERENCES supervisory_findings (id),  -- kind 'internal_audit' or 'self_identified'
  workpapers_ref      TEXT NOT NULL,
  tested_at           TIMESTAMPTZ NOT NULL
);

CREATE TABLE program_limits (              -- what the bank lets a program do, enforced by the system
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  kind                TEXT NOT NULL CHECK (kind IN ('max_accounts', 'max_deposits', 'max_loans',
                        'daily_outbound', 'new_accounts_paused', 'product_restricted')),
  value               BIGINT,                -- a count or minor units; null for a pause
  reason              TEXT NOT NULL CHECK (reason IN ('policy', 'review_condition', 'order_article',
                        'incident', 'exit')),
  source_ref          UUID,                  -- the review, finding or enforcement action behind it
  valid_during        TSTZRANGE NOT NULL
);
```

Design notes:

- **Limits are enforced where accounts open and money moves.** A `new_accounts_paused` row is read by account opening for the program's products; a `daily_outbound` limit is read by the payment path; an order article that freezes growth becomes a row, not an email to the program.
- **Tests sample from the records, not from the program's reports.** The population for a CIP test is the `party_identities` and `applications` rows for the period, and the sample is drawn by the bank ([Producing Records](/docs/architecture/audit-trails#producing-records)).
- **Order articles are findings.** Each article of an order against the bank is a `supervisory_findings` row of kind `order_article` linked to the `enforcement_actions` row, with `program_id` set where a program is in scope, so a program sees the work assigned to it without the confidential text.
- **Guidance is versioned like a rule.** Reviews record which guidance and tiering policy applied, so a review done under the 2023 guidance is judged by it after a replacement takes effect ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Ingest partners' public actions.** A scheduled job reads the agencies' enforcement releases for every bank a program uses, keyed by FDIC certificate or RSSD ID, and opens a review when one appears ([Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#how-to-build-it)).

## Auditing

- **Every review and its decision,** with the guidance version, the risk tier, the conditions, and any regulator non-objection.
- **Every test of a delegated obligation,** with the population, the sample, the exceptions, the workpapers and the finding it produced.
- **Every limit on a program,** what imposed it and when it lifted, and evidence that the system enforced it.
- **The obligation matrix as of any date,** joined to the tests that covered it, so a lookback can show who did what under which procedure.
- **Each exit plan,** tested, with the data extract it depends on.

## What This Means for the System You Build

- **Build for the lookback:** keep the inputs, results and timestamps of every delegated obligation, under the procedure version in force, for years.
- **Make the bank's controls executable:** pauses, caps and restrictions as data the system enforces the same day.
- **Test what you delegate,** by sampling the records, and turn exceptions into findings with owners.
- **Version the guidance** as you version rules; the 2026 proposal changes tiering and contracts, not the deposit obligations.
- **Watch every partner bank's public enforcement record** and treat a new order as an incident for every program on it.
- **Treat a charter as more of the same oversight,** owned directly.

## References

**Regulators and guidance**

- [Federal Register: Interagency Guidance on Third-Party Relationships: Risk Management (88 FR 37920, June 9, 2023)](https://www.federalregister.gov/documents/full_text/html/2023/06/09/2023-12340.html), the life cycle, critical activities, fintech relationships and subcontractors
- [Federal Reserve, FDIC and OCC: Joint statement on banks' arrangements with third parties to deliver bank deposit products and services (July 25, 2024)](https://www.federalreserve.gov/newsevents/pressreleases/files/bcreg20240725c1.pdf), the risks and the effective practices
- [Federal Reserve: SR 24-5](https://www.federalreserve.gov/supervisionreg/srletters/SR2405.htm), the joint statement establishes no new supervisory expectations
- [Federal Register: Request for Information on Bank-Fintech Arrangements (July 31, 2024)](https://www.federalregister.gov/documents/2024/07/31/2024-16838/request-for-information-on-bank-fintech-arrangements-involving-banking-products-and-services), the agencies' RFI and its later extension
- [Federal Register: Proposed Third-Party Risk Management Guidance (91 FR 58536, September 15, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/09/15/2026-18859.html), risk tiering, contract terms, subcontractors, shared assessments, community banks and the guidance it would rescind
- [Federal Register: Proposed Third-Party Risk Management Guidance, document record](https://www.federalregister.gov/api/v1/documents/2026-18859.json), the agencies, dockets and November 16, 2026 comment date
- [Federal Reserve: Enforcement action against Evolve Bancorp and Evolve Bank & Trust (June 14, 2024)](https://www.federalreserve.gov/newsevents/pressreleases/enforcement20240614a.htm), the deficiencies and requirements
- [FDIC: Enforcement orders for December 2025](https://content.govdelivery.com/accounts/USFDIC/bulletins/406ad43), the termination of Thread Bank's consent order

**Filings**

- [Coastal Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1437958/000143795826000013/ck1437958-20251231.htm), enforcement actions across BaaS banks

**In practice**

- [Consumer Finance Monitor: FDIC consent order with Cross River Bank (May 4, 2023)](https://www.consumerfinancemonitor.com/2023/05/04/fdic-consent-order-with-cross-river-bank-indicates-heightened-scrutiny-of-bank-fintech-partnerships/), the fair lending order's requirements
- [Banking Dive: Piermont and Sutton consent orders (April 1, 2024)](https://www.bankingdive.com/news/piermont-sutton-bank-fdic-consent-orders-baas-fintech/711815/), Piermont's lookbacks and third-party program review
- [American Banker: Thread Bank's regulatory action calls out its BaaS business](https://www.americanbanker.com/news/thread-bank-regulatory-action-calls-out-its-baas-business), the order's requirements and effective date
- [Consumer Finance Monitor: FDIC and OCC adopt debanking final rule (April 15, 2026)](https://www.consumerfinancemonitor.com/2026/04/15/fdic-occ-adopt-debanking-final-rule/), the reputation risk prohibitions, the June 6 effective date, the executive order and the Federal Reserve's status
- [Davis Wright Tremaine: OCC signals digital asset charter momentum (August 2026)](https://www.dwt.com/blogs/financial-services-law-advisor/2026/08/occ-signals-digital-asset-charter-momentum), the 2026 conditional approvals
- [Payments Dive: Mercury nabs conditional OCC charter (April 29, 2026)](https://www.paymentsdive.com/news/mercury-fintech-nabs-conditional-occ-charter/818722/), the approvals still needed and its partner banks
- [Current](https://current.com/), banking services from Choice Financial Group and/or Cross River Bank
