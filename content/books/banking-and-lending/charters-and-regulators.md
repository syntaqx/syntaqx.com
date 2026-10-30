+++
title = "Charters & Regulators"
description = "National, state, savings, credit union, industrial loan and trust charters; the OCC, Fed, FDIC, NCUA, CFPB, FinCEN and states; who examines whom; preemption."
category = "Banking & Lending Industry"
order = 2404
part = "The Business"
tags = ["banking", "charters", "regulators", "occ", "fdic", "preemption"]
+++

A charter is the license to be a bank, and it decides almost everything else: which agency examines the institution, which state laws apply to its products, whether it can export its home state's interest rates, whether its parent company is supervised by the Federal Reserve, whether its deposits are insured and whether it can take them at all. The United States runs a dual banking system: the federal government and every state charter banks, each charter has a primary federal regulator, and several agencies with overlapping jurisdiction sit on top for insurance, consumer protection, anti-money laundering and the holding company.

For an engineer, the charter is configuration with legal weight. A program on a national bank and the same program on a state nonmember bank face different examiners, different state-law exposure and different enforcement histories, and a lender's rate on a loan to a borrower in another state may be lawful or void depending on which bank made it. This chapter maps the charters, the agencies and who examines whom, then preemption, the doctrine that decides which state rules a bank can ignore. Getting a charter is in [Starting a Bank](/books/banking-and-lending/starting-a-bank), and what the examiners do with it is in [Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision).

## The Charter Map

As of the FDIC's institution data refreshed October 23, 2026, there were 4,217 active FDIC-insured institutions, and NCUA counted 4,214 federally insured credit unions at June 30, 2026:

| Charter | Chartered by | Primary federal regulator | Deposit insurer | Count |
| --- | --- | --- | --- | --- |
| National bank | OCC | OCC | FDIC | 660 |
| Federal savings association | OCC | OCC | FDIC | Included in the OCC's 876 insured charters |
| State member bank | A state | Federal Reserve, with the state | FDIC | 698 |
| State nonmember bank | A state | FDIC, with the state | FDIC | 2,377 |
| State savings bank or association | A state | FDIC, with the state | FDIC | 242 |
| Industrial loan company (industrial bank) | A state, mostly Utah | FDIC, with the state | FDIC | Within the state nonmember counts |
| National trust bank | OCC | OCC | None: no insured deposits | Not in FDIC counts |
| Federal credit union | NCUA | NCUA | NCUSIF | 2,649 |
| Federally insured state credit union | A state | NCUA, with the state | NCUSIF | 1,565 |

Three-quarters of insured banks hold state charters (698 member, 2,377 nonmember and 242 savings institutions, about 3,300 of 4,217), though the national charters include the largest banks and most of the industry's assets. Those counts come from the FDIC's public BankFind API, which classifies each institution by charter class and chartering agent; [How to Build It](#how-to-build-it) uses the same identifiers.

The Federal Reserve's own summary of the division of labor: the OCC "has exclusive authority to issue a federal or 'national bank' charter," states charter state banks, the Fed approves state banks that want Fed membership and companies that want to control a bank, and the FDIC approves deposit insurance for new banks.

## National Banks and the OCC

The Office of the Comptroller of the Currency, a bureau of the Treasury, charters, regulates and examines national banks and federal savings associations, and since its 2021 licensing manual treats special purpose banks (trust banks, credit card banks, bankers' banks) under the same booklet. A national bank is automatically a member of the Federal Reserve System and buys Federal Reserve Bank stock; its deposits are insured by the FDIC unless it is an uninsured trust bank.

What the national charter buys:

- **One regulator for the bank itself, nationwide.** The OCC examines the bank wherever it operates.
- **Preemption of state laws** that prevent or significantly interfere with national bank powers ([Preemption](#preemption)), and the power to charge interest at the rate allowed in its home state to borrowers anywhere (12 USC 85; APR, Finance Charges & Rate Caps covers rate exportation).
- **A charter that fintechs, crypto firms and large banks share.** JPMorgan Chase Bank, N.A. is a national bank, and so are fintech-chartered banks such as SoFi Bank, N.A. and Varo Bank, N.A. ([Starting a Bank](/books/banking-and-lending/starting-a-bank#fintechs-that-chartered)).

## State Banks: Member and Nonmember

A state bank is chartered and examined by its state banking department and has a primary federal regulator decided by one choice: whether it joins the Federal Reserve System.

- **State member banks** are supervised by the Federal Reserve together with the state.
- **State nonmember banks**, the largest group, are supervised by the FDIC together with the state.

State and federal examiners usually alternate or join examinations. The Conference of State Bank Supervisors describes itself as "the only national organization dedicated to protecting and advancing the nation's dual-banking system," and the states also license most nonbank lenders and money transmitters (Lender Licensing & Bank Partnerships, and the Payments volume's [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#pick-a-model-pick-a-risk)).

Most sponsor banks in fintech are state-chartered, and their enforcement history shows the split: Evolve Bank & Trust's 2024 order came from the Federal Reserve and the Arkansas State Bank Department because it is a state member bank, while Sutton Bank's came from the FDIC and Ohio's Division of Financial Institutions ([Sponsor Banks Under Scrutiny](/books/payments/card-issuing#sponsor-banks-under-scrutiny)). State banks get the same interest exportation as national banks through 12 USC 1831d, enacted "to prevent discrimination against State-chartered insured depository institutions," with a statutory right for a state to opt its loans out.

## Savings Institutions

Savings associations and savings banks (thrifts) were built for mortgage lending and still carry a qualified thrift lender test. Federal savings associations are chartered and supervised by the OCC, which reviews whether a proposed one will operate as a qualified thrift lender under 12 USC 1467a(m) and within the Home Owners' Loan Act's lending limits; state savings institutions are supervised by the FDIC and their state. Their holding companies, savings and loan holding companies, file the Federal Reserve's FR Y-9C alongside bank holding companies once they reach $3 billion of assets.

## Credit Unions and NCUA

A credit union is a member-owned cooperative: members' deposits are "shares," the members elect the board, and earnings go to members or to net worth rather than shareholders. NCUA charters and supervises federal credit unions, supervises federally insured state-chartered credit unions with their states, and insures shares through the National Credit Union Share Insurance Fund. At June 30, 2026 there were 2,649 federal and 1,565 federally insured state-chartered credit unions with 146.1 million members.

The charter's distinctive constraint is the field of membership, which is an eligibility rule the account opening system enforces. Under 12 USC 1759(b) a federal credit union is one of three kinds:

- **Single common bond:** "One group that has a common bond of occupation or association."
- **Multiple common bond:** several such groups, each generally with "fewer than 3,000 members" when added.
- **Community:** "Persons or organizations within a well-defined local community, neighborhood, or rural district."

Credit unions report quarterly to NCUA on their own call report rather than the FFIEC's, and the comparison problem that follows is in [Bank Economics](/books/banking-and-lending/bank-economics#credit-unions-read-differently).

## Industrial Loan Companies

An industrial loan company (also called an industrial bank) is a state-chartered, FDIC-insured institution whose parent can be a commercial company without becoming a bank holding company. The Bank Holding Company Act defines a "bank" as an institution that both accepts demand deposits and makes commercial loans, and 12 USC 1841(c)(2)(H) excludes an ILC chartered in a state that required FDIC insurance on March 5, 1987, if it doesn't accept demand deposits withdrawable by check for third-party payments, or has under $100 million in assets, or hasn't changed control since August 10, 1987; it loses the exemption if it lets affiliates overdraw. In practice Utah charters most of them.

The result is the one route by which a retailer, an automaker or a fintech can own an insured bank without Federal Reserve supervision of the parent, which is why ILC applications are contested. The FDIC's rule for ILCs with parents outside Fed consolidated supervision (12 CFR Part 354) instead requires written agreements with the parent covering examinations, reports, records, an independent annual audit, a board less than half made up of parent-affiliated directors, capital and liquidity maintenance and, possibly, a contingency plan, plus FDIC approval of material business plan changes and of board and senior officer changes in the first three years.

As of October 2026:

- **Fintech ILCs:** Square Financial Services (Block's bank) and Nelnet Bank were approved in 2020 ([Neobanks & Consumer Fintech](/books/banking-and-lending/neobanks) covers what Block does with its bank).
- **Policy:** on July 15, 2025 the FDIC withdrew its August 2024 proposal to tighten Part 354 for ILC parents, said it no longer intends to finalize it, and opened a request for information on how it reviews ILC filings against the statutory factors.
- **The 2026 wave:** the FDIC conditionally approved Ford Credit Bank and GM Financial Bank in January 2026, both based in Salt Lake City to buy auto retail installment contracts and fund with online savings and time deposits, each to be established within 12 months. GM Financial Bank's conditions included $667 million of initial paid-in capital and a 15% leverage ratio, Ford Credit Bank's $1.5 billion, and conditional approvals followed for Stellantis Bank and Edward Jones Bank.

## Trust Banks and Novel Charters

A national trust bank is a national bank limited to fiduciary and related activities: it holds no insured deposits, so it needs no FDIC application and no CRA plan in the usual sense, but it is chartered, examined and, on its conditions, supervised by the OCC like any national bank. The charter is how crypto and payments firms entered the federal system in 2025 and 2026.

- **December 12, 2025:** the OCC conditionally approved First National Digital Currency Bank (Circle) and Ripple National Trust Bank as de novo national trust banks, and conversions of BitGo, Fidelity Digital Assets and Paxos from state trust companies. Comptroller Jonathan Gould: "New entrants into the federal banking sector are good for consumers, the banking industry and the economy."
- **July 10, 2026:** final approval for First National Digital Currency Bank, N.A. to open.
- **May 29, 2026:** preliminary conditional approval for Laser Digital National Trust Bank (Nomura), for digital asset, securities and fiat custody as a fiduciary, staking, and customer-directed spot trading for custody customers. The decision recites that uninsured national trust banks reported $7.0 trillion of assets under administration at the end of 2025.

A trust bank's limits matter to anyone building on one: no insured deposits means no pass-through insurance for customer balances, and whether it can get a Federal Reserve master account to settle payments directly is a separate question from its charter. Stablecoin issuance under federal law is in the Payments volume's [Stablecoins](/books/payments/stablecoins#the-law-in-the-united-states).

## Holding Companies

Most banks are owned by a holding company, and the Federal Reserve supervises bank holding companies and savings and loan holding companies whatever their subsidiary bank's charter. Controlling a bank (25% of a class of voting securities, or the power to direct management or policies) requires approval or notice before the purchase ([Starting a Bank](/books/banking-and-lending/starting-a-bank#buying-a-bank-instead)). A holding company that elects financial holding company status can own securities and insurance affiliates, and a bank with an unsatisfactory CRA record blocks that election ([Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#cra)).

## The Agencies Over Everyone

**The FDIC** insures deposits at every insured bank and savings institution, not only the state nonmember banks it supervises day to day, approves deposit insurance for every new bank, and is receiver when one fails ([When Banks Fail](/books/banking-and-lending/bank-failures)).

**The CFPB** has "exclusive authority to require reports and conduct examinations on a periodic basis" for federal consumer financial law at insured banks and credit unions with more than $10 billion in assets, and their affiliates (12 USC 5515), with primary enforcement authority over those laws. Below $10 billion, the prudential regulator examines consumer compliance. The statute requires the CFPB and the prudential regulator to coordinate schedules, conduct simultaneous examinations unless the institution asks otherwise, share draft reports with at least 30 days to comment, and gives the institution an appeal to a governing panel if their findings conflict. The $10 billion line therefore changes a bank's examiners as well as its debit interchange. The CFPB's own rules (Regulations E, Z, B, DD and the rest) apply to every bank regardless of size; what changes at $10 billion is who checks.

**FinCEN** holds "overall authority for enforcement and compliance" with the Bank Secrecy Act and delegates examination to the OCC, the Federal Reserve, the FDIC and NCUA for the institutions they examine (31 CFR 1010.810), which is why a bank's AML program is reviewed by its usual examiners and why FinCEN, the agency and sometimes the Justice Department each act in a large case (BSA/AML Programs).

**OFAC**, also at Treasury, administers sanctions, which apply to every US person, bank or not (Sanctions Screening).

**State attorneys general** can sue national banks in court to enforce applicable law; the National Bank Act's limits on state "visitorial powers" don't stop them (12 USC 25b(i)).

## Who Examines Whom

| Institution | Safety and soundness | Consumer compliance | BSA/AML | Holding company |
| --- | --- | --- | --- | --- |
| National bank, $10B or less | OCC | OCC | OCC | Federal Reserve |
| National bank, over $10B | OCC | CFPB for federal consumer financial law; OCC for the rest | OCC | Federal Reserve |
| State member bank | Federal Reserve and state | Federal Reserve (CFPB over $10B) | Federal Reserve and state | Federal Reserve |
| State nonmember bank and ILC | FDIC and state | FDIC (CFPB over $10B) | FDIC and state | Federal Reserve, or none for an exempt ILC parent under Part 354 agreements |
| Federal savings association | OCC | OCC (CFPB over $10B) | OCC | Federal Reserve |
| Federal credit union | NCUA | NCUA (CFPB over $10B) | NCUA | None |
| State credit union, federally insured | NCUA and state | NCUA and state (CFPB over $10B) | NCUA and state | None |
| National trust bank | OCC | OCC | OCC | Federal Reserve if a BHC owns it |

Examinations, ratings and their cycles are in [Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#the-exam-cycle).

## Preemption

Preemption decides when federal banking law displaces a state law, and it is the difference between one national product and fifty state variants. For national banks and federal savings associations, Dodd-Frank codified the standard in 12 USC 25b: a state consumer financial law is preempted only if it discriminates against national banks, if it "prevents or significantly interferes with the exercise by the national bank of its powers" (the Supreme Court's 1996 Barnett Bank test), or if another federal law preempts it. The determination is made by a court, or by the OCC by regulation or order case by case, after consulting the CFPB when extending it to another state's equivalent law, and the OCC must review each determination every five years.

Two limits shape program design:

- **Preemption stops at the bank.** It does not extend to a national bank's subsidiaries, affiliates or agents unless they are themselves national banks; a state consumer law applies to them "to the same extent" as to anyone else. A fintech marketing a national bank's product is not a national bank (Lender Licensing & Bank Partnerships covers the true lender question).
- **It is a comparison, not a category.** In Cantero v. Bank of America (May 30, 2024) the Supreme Court unanimously vacated a Second Circuit decision that had preempted New York's law requiring 2% interest on mortgage escrow balances, holding that courts must make "a practical assessment of the nature and degree of the interference" by comparing the law to the precedents.

The escrow question then became the test case. As of October 2026:

- **May 5, 2026:** on remand, the Second Circuit again held New York's escrow interest law preempted.
- **May 15, 2026:** the OCC issued a rule affirming national banks' flexibility over escrow account terms, including whether to pay interest, and a preemption determination covering New York's law and 13 substantively equivalent laws, both effective June 18, 2026.
- **Circuit split:** the First Circuit (Citizens Bank v. Conti, Rhode Island) and the Ninth Circuit (Flagstar Bank v. Kivett, California) held similar laws not preempted.
- **October 5, 2026:** the Supreme Court invited the Solicitor General's views in all three cases rather than granting review.

State banks don't get the National Bank Act's preemption; they get parity on interest rates through 12 USC 1831d, state "wild card" statutes that give them national bank powers, and their home state's law, and they remain subject to host states' consumer laws in ways national banks may not be. That difference is a reason fintechs pick sponsor banks carefully and a reason several sought national charters.

## How to Build It

These are deltas against the core model's `institutions` table ([The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model)) and the `institution_events` history in [The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it). The charter determines the supervisors and the state law that applies, both change over time, and both are data:

```sql
ALTER TABLE institutions
  ADD COLUMN fed_member        BOOLEAN NOT NULL DEFAULT FALSE,  -- national banks: always true
  ADD COLUMN holding_company   TEXT,                            -- the parent's name, if any
  ADD COLUMN holding_rssd_id   INT,
  ADD COLUMN total_assets      BIGINT,                          -- latest call report, minor units
  ADD COLUMN assets_as_of      DATE;

CREATE TABLE institution_supervisors (     -- who regulates what, effective-dated
  institution_id  UUID NOT NULL REFERENCES institutions (id),
  role            TEXT NOT NULL CHECK (role IN ('chartering', 'primary_federal',
                    'deposit_insurer', 'consumer_compliance', 'bsa_aml', 'holding_company',
                    'state')),
  agency          TEXT NOT NULL,             -- 'occ', 'frb', 'fdic', 'ncua', 'cfpb', 'ut_dfi', ...
  basis           TEXT NOT NULL,             -- '12 USC 5515 (assets > $10B)', 'charter', ...
  valid_during    DATERANGE NOT NULL,
  PRIMARY KEY (institution_id, role, agency, valid_during)
);

CREATE TABLE state_law_applicability (     -- does this state rule bind this charter?
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  state           CHAR(2) NOT NULL,
  law_ref         TEXT NOT NULL,             -- 'NY GOL 5-601', ...
  topic           TEXT NOT NULL,             -- 'escrow_interest', 'rate_cap', 'fee_limit', ...
  charter_types   TEXT[] NOT NULL,           -- the institutions.charter_type values it binds
  applies         BOOLEAN NOT NULL,
  authority       TEXT NOT NULL,             -- the statute, OCC determination or case relied on
  status_note     TEXT,                      -- 'circuit split; SCOTUS CVSG Oct 5, 2026'
  reviewed_at     DATE NOT NULL,
  valid_during    DATERANGE NOT NULL
);
```

Design notes:

- **Thresholds are derived, then recorded.** Crossing $10 billion moves consumer compliance examination to the CFPB and caps debit interchange; compute it from `total_assets` on each call report, then write the `institution_supervisors` change with its date, so a program can tell which examiner and which interchange schedule applied in any quarter.
- **The charter is a fact with history.** Charter conversions (state to national, thrift to bank) are `institution_events`; supervisors and state-law applicability are read as of the business date ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **Preemption is a reviewed opinion, not a constant.** Each `state_law_applicability` row names the authority relied on and when counsel last reviewed it; the escrow interest cases show a row can change with one appellate decision. Product rules read it as data ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Key on identifiers, not names.** FDIC certificate, RSSD ID and NCUA charter number are how the agencies' data, the FFIEC's call reports and enforcement releases name the institution.

## Auditing

- **Which supervisor applied when,** with the basis, so a finding or a complaint response can be routed to the right agency for its date.
- **Every state-law position with its authority and review date,** and the product versions that relied on it.
- **Charter and threshold changes as events** with their source documents: the approval letter, the call report that crossed the line.
- **The membership rule in force** for a credit union account opened under it.

## What This Means for the System You Build

- **Model the charter, not "the bank."** Charter type, Fed membership, primary regulator and asset size decide examiners, interchange and state-law exposure; store them and their history.
- **Treat state law as configuration with citations.** Fees, rates, escrow terms and disclosures vary by state for some charters and not others, and the answer can change with a court decision.
- **Know that preemption stops at the bank.** A program manager, servicer or marketer operating under a bank's charter is still subject to state law for its own conduct.
- **Expect more than one examiner.** A $10 billion bank answers to its prudential regulator and the CFPB, its AML program to its examiners and FinCEN, and its state to the state; evidence has to be producible for each.

## References

**Law and regulation**

- [12 USC 85: Rate of interest on loans, discounts and purchases](https://www.law.cornell.edu/uscode/text/12/85), the home-state rate a national bank may charge
- [12 USC 25b: State law preemption standards for national banks](https://www.law.cornell.edu/uscode/text/12/25b), the discrimination, Barnett Bank and other-federal-law tests, case-by-case determinations, subsidiaries and agents, visitorial powers and five-year review
- [12 USC 1759: Membership](https://www.law.cornell.edu/uscode/text/12/1759), federal credit union fields of membership and the 3,000-member limit for groups
- [12 USC 1817(j): Change in control of insured depository institutions](https://www.law.cornell.edu/uscode/text/12/1817), the 25% control definition
- [12 USC 1831d: State-chartered insured depository institutions and insured branches of foreign banks](https://www.law.cornell.edu/uscode/text/12/1831d), interest rate parity for state banks and the state opt-out
- [12 USC 1841: Bank Holding Company Act definitions](https://www.law.cornell.edu/uscode/text/12/1841), the "bank" definition and the industrial loan company exclusion
- [12 USC 2903: Financial institutions; evaluation](https://www.law.cornell.edu/uscode/text/12/2903), CRA in applications and the financial holding company election
- [12 USC 5515: Supervision of very large banks, savings associations, and credit unions](https://www.law.cornell.edu/uscode/text/12/5515), the CFPB's authority over institutions above $10 billion and coordination with prudential regulators
- [31 CFR 1010.810: Enforcement](https://www.law.cornell.edu/cfr/text/31/1010.810), FinCEN's overall BSA authority and delegation of examinations
- [Cantero v. Bank of America, N.A., 602 U.S. ___ (2024)](https://www.law.cornell.edu/supremecourt/text/22-529), the practical, comparative preemption analysis

**Regulators and guidance**

- [Federal Reserve: Who are the regulators of banks?](https://www.federalreserve.gov/faqs/banking_12779.htm), the OCC's national charter authority and the Fed's and FDIC's approval roles
- [OCC: Comptroller's Licensing Manual, Charters (December 2021)](https://www.occ.gov/publications-and-resources/publications/comptrollers-licensing-manual/files/charters.pdf), national banks, FSAs and special purpose banks, the qualified thrift lender review
- [OCC: Conditional approvals of national trust bank charters (NR 2025-125, December 12, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html), the five approvals and the Comptroller's statement
- [OCC: Conditional Approval No. 1377, Laser Digital National Trust Bank (May 29, 2026)](https://www.occ.treas.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/cd1377.pdf), permitted trust bank activities and trust bank assets under administration
- [FDIC: BankFind Suite API](https://api.fdic.gov/banks/docs), institution counts by charter class and chartering agent (dataset of October 23, 2026)
- [FDIC: Board approves request for information on industrial banks and ILCs (July 15, 2025)](https://www.fdic.gov/news/press-releases/2025/fdic-board-approves-request-information-industrial-banks-and-industrial), the RFI and the withdrawal of the August 12, 2024 Part 354 proposal
- [NCUA: Quarterly Credit Union Data Summary, 2026 Q2](https://www.ncua.gov/files/publications/analysis/quarterly-data-summary-2026-Q2.pdf), federal and state credit union counts and membership
- [Federal Reserve: FR Y-9C](https://www.federalreserve.gov/apps/reportingforms/Report/Index/FR_Y-9C), consolidated reports for bank and savings and loan holding companies of $3 billion or more
- [CSBS: About](https://www.csbs.org/about), the state supervisors' role in the dual banking system

**In practice**

- [Goodwin: FDIC approves deposit insurance applications for ILCs proposing specialty business models (June 2026)](https://www.goodwinlaw.com/en/insights/publications/2026/06/insights-technology-fs-fdic-approves-deposit-insurance-applications-ilcs-specialty-business-models), the 2026 ILC approvals, their capital and leverage conditions, and Part 354 commitments
- [ICBA Independent Banker: FDIC approves ILC applications for Ford, GM (January 23, 2026)](https://www.independentbanker.org/w/fdic-approves-icba-opposed-ilc-applications-for-ford-gm), business models, funding and the 12-month deadline
- [Davis Wright Tremaine: OCC signals digital asset charter momentum (August 2026)](https://www.dwt.com/blogs/financial-services-law-advisor/2026/08/occ-signals-digital-asset-charter-momentum), Circle's July 10, 2026 final approval
- [Ballard Spahr Consumer Finance Monitor: OCC finalizes rules confirming preemption of state mortgage interest-on-escrow laws (May 19, 2026)](https://www.consumerfinancemonitor.com/2026/05/19/occ-finalizes-rules-confirming-preemption-of-state-mortgage-interest-on-escrow-laws/), the Second Circuit's remand decision and the OCC's two rules
- [Legal 500: Supreme Court invites the Solicitor General's views in Cantero, Conti and Kivett (October 2026)](https://www.legal500.com/intelligence/united-states/corporate-commercial-law/supreme-court-takes-next-step-toward-resolving-national-bank-act-preemption-split-inviting-solicitor-generals-views-in-cantero-conti-and-kivett), the October 5, 2026 order and the circuit split
