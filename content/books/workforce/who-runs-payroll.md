+++
title = "Who Runs Payroll: Agents & Liability"
nav_title = "Who Runs Payroll"
description = "In-house, payroll service providers, reporting agents, Section 3504 agents, CPEOs, ASOs and EORs: who files under which EIN, who stays liable, and EFTPS."
category = "Workforce Industry"
order = 2604
part = "The Business"
tags = ["payroll", "payroll-tax", "reporting-agent", "peo", "eftps", "liability"]
+++

Every payroll has two questions under it that the software answers whether or not anyone asked: whose return is this, and who pays if the money doesn't arrive. The IRS gives a small number of answers, each with its own form. An employer can run payroll itself. It can hire a payroll service provider that prepares returns under the employer's EIN and signs nothing. It can authorize a reporting agent on Form 8655 to sign and e-file those returns and make the deposits, still under the employer's EIN and still at the employer's risk. It can appoint a Section 3504 agent on Form 2678 that files one aggregate return under the agent's own EIN, with the agent and the employer both liable. Or it can contract with a certified professional employer organization (CPEO), which tells the IRS about the contract on Form 8973 and becomes, for federal employment taxes on its worksite employees' wages, the employer and "no other person." A professional employer organization that isn't certified sits in a fifth slot the regulations created in 2014: a payer designated under section 3504, filing under its own EIN, jointly liable with its client.

The arrangement decides the EIN on every return, the signature on it, the deposit schedule the money follows, which party a notice goes to and who a revenue officer can collect from. It is a column on the employer, not a feature of the product, and it can change at a quarter boundary when a client moves from one provider to another. This chapter works through each arrangement as the IRS defines it, the deposit and liability math that differs between them, the authorizations that let a provider see and talk about an employer's account (Forms 8821 and 2848), the employer's own EFTPS enrollment and why the IRS asks every employer to keep one, and the state equivalents, with California as the worked case. [PEOs & Co-Employment](/books/workforce/peos-and-co-employment) covers the PEO contract itself, and [How the Money Works](/books/workforce/workforce-business#how-the-money-works) in the opening chapter covers what each arrangement earns.

## How the Platforms Do It

As of November 2026, from filings, developer documentation and the IRS's public list of certified PEOs:

| Provider type | Examples | IRS arrangement | Whose EIN on the 941 | Who is liable for the tax |
| --- | --- | --- | --- | --- |
| **Small business payroll software** | Gusto, OnPay, QuickBooks Payroll, Square Payroll, RUN Powered by ADP | Payroll service provider that files and deposits for the client; a provider that signs and e-files does it as a reporting agent on Form 8655 | The employer's | The employer |
| **Mid-market and enterprise HCM** | ADP Workforce Now, Dayforce, Paycom, Paylocity, Paychex, UKG, Workday | Reporting agent for clients that outsource tax filing; software only for clients that file themselves | The employer's | The employer |
| **Tax filing services for other payroll systems** | ADP SmartCompliance, MasterTax | Reporting agent filing and depositing for payroll calculated elsewhere | The employer's | The employer |
| **Embedded payroll** | Check, Gusto Embedded, Zeal | The payroll partner is the reporting agent: Check's onboarding has the employer sign Form 8655 and "any required state authorization form," and Gusto Embedded requires "the Direct Deposit Authorization and Form 8655 at minimum"; the software platform the employer signs up through is not on the return | The employer's | The employer; partner agreements decide who absorbs a failed debit |
| **Certified PEOs** | ADP TotalSource, Insperity, Justworks, Paychex PEO, TriNet (entities on the IRS list "as of August 2026") | CPEO, Form 8973 per customer | The CPEO's, aggregate with Schedule R | Generally the CPEO alone, for worksite employees' wages |
| **PEOs without certification** | PEOs not on the IRS list | Payer designated under section 3504 | The PEO's, aggregate | The PEO and the client, jointly |
| **Section 3504 agents** | Fiscal agents for home care service recipients in government programs, and agents for other employers | Form 2678 | The agent's, aggregate with Schedule R | The agent and the employer, jointly |
| **ASO** | TriNet's ASO, PEO vendors' administrative services only products | Payroll service provider or reporting agent | The employer's | The employer |

Three patterns run through the table:

- **Most of the industry files under the client's EIN.** Payroll software, HCM suites, filing services and embedded APIs all prepare, sign or e-file returns that name the employer. They change who does the work, not whose return it is, and the IRS says of all of them: "You remain responsible if the third party fails to perform any required action."
- **Only aggregate filers change the taxpayer on the return.** A Section 3504 agent, a designated payer and a CPEO file one return under their own EIN for many clients and allocate it on Schedule R. Their deposit schedule is computed from their own totals, and the liability rules differ by which of the three they are.
- **Certification is the only path that moves liability away from the client.** A CPEO is "generally solely liable" for worksite employees' wages; every other arrangement leaves the employer liable alone or jointly. That is the product a CPEO sells, and why the IRS demands a bond, audited financials and quarterly attestations for it (PEOs & Co-Employment covers the requirements).

## The IRS's Five Arrangements

The IRS publishes a third-party arrangement chart and Publication 15's Section 16 for the same comparison. Read together, with the revenue procedures behind them:

| | In-house | Payroll service provider | Reporting agent | Section 3504 agent | CPEO |
| --- | --- | --- | --- | --- | --- |
| **Authorization** | None | None | Form 8655 | Form 2678 | Form 8973 |
| **Governing guidance** | Pub 15 | Pub 15 | Rev. Proc. 2012-32, Pub 1474 | Rev. Proc. 2013-39, Treas. Reg. 31.3504-1 | IRC 3511 and 7705, Rev. Proc. 2023-18 |
| **Returns** | Employer files under its EIN | PSP prepares returns under each client's EIN; the client signs | Agent signs and generally e-files separate returns under each client's EIN | One aggregate return under the agent's EIN, Schedule R allocating it | One aggregate return under the CPEO's EIN, Schedule R, e-filed |
| **Deposits** | Employer's EFTPS | Under the client's EIN | Under the client's EIN, through EFTPS | Under the agent's EIN, on the agent's aggregate schedule | Under the CPEO's EIN, on its aggregate schedule |
| **Form 940 (FUTA)** | Employer | Under the client's EIN | Generally e-filed under the client's EIN | Not allowed: clients file their own 940, except for home care service recipients | Aggregate 940 with Schedule R under the CPEO's EIN |
| **Liability** | Employer | Client | Client | Agent and client, jointly | Generally the CPEO alone for worksite employees; both may be liable for others |

The rows are the data model. An arrangement is a set of answers (whose EIN, who signs, who deposits, whether 940 can follow, who is liable) that every return and every deposit inherits, and a provider that stores those answers per employer and per period can explain every return it ever filed.

### Payroll Service Provider

A PSP "helps administer payroll and payroll-related tax duties on behalf of the employer": it can prepare paychecks, file employment tax returns and Forms W-2 and make federal tax deposits using the employer's EIN, and it is not liable for the employer's employment taxes. No IRS form creates the relationship, which is both its convenience and its limit. A PSP without a Form 8655 can't sign the employer's return, so the employer signs paper returns or an e-file the PSP transmits under the employer's own signature authority, and the IRS sends the employer, not the PSP, every notice.

### Reporting Agent

A reporting agent is a PSP with an authorization. Form 8655 authorizes the agent to sign and file certain returns, make deposits and payments for them, receive duplicate tax information and notices, and provide information for penalty relief determinations. Rev. Proc. 2012-32 sets the rules, and its mechanics are what a provider's agent operations team runs every day:

- **Who.** A reporting agent is "an accounting service, franchiser, bank, service bureau, or other entity" authorized under the procedure (section 4.01).
- **What.** The authorization covers Forms 940 and 941 and related series returns, including amended and successor forms (sections 4.02 and 5.01), and the agent signs and files them electronically; paper is allowed only in listed circumstances, such as when timely electronic filing is jeopardized (section 5.06).
- **How the money moves.** An agent making deposits or payments "must do so through the EFTPS or FTA," whatever method the taxpayer used before (section 5.02(3)).
- **The Agent's List.** The agent submits a list of every taxpayer it will file or deposit for, with a separate authorization for each one (section 4.03), and the IRS must accept the authorization and the list before the agent files for the taxpayer (section 5.03(1)). Publication 1474 is the technical specification for the list and the authorization files.
- **The disclosure statement.** The agent gives each client a written statement at the start of the contract and at least quarterly afterward saying the client remains responsible and recommending EFTPS enrollment to verify payments; the sample text includes "you are responsible for the timely filing of employment tax returns" (section 5.05).
- **When it starts and stops.** An authorization "becomes effective for the tax period(s) designated" and stays in effect until revoked or terminated (section 5.03). A new agent's authorization ends the prior agent's authority for tax periods beginning on or after its effective date, while earlier periods stay with the prior agent unless the taxpayer revokes them explicitly, and any increase or decrease in authority needs a new authorization (section 5.04).
- **Who signs.** The taxpayer, or a representative with a power of attorney that specifically allows signing returns (section 6.02), on a Form 8655 revised May 2005 or later (section 6.01); the current revision is January 2024.

The overlap rule in section 5.04 is the one software gets wrong. When a client switches providers effective July 1, the old agent still owns the second quarter: it files the Q2 941 in July and answers notices for periods before July, and the new agent owns Q3 forward. Two agents are authorized for the same employer at the same time, for different periods, and the authorization table needs a period range, not a flag.

### Section 3504 Agent

Section 3504 lets "a fiduciary, agent, or other person" who has "the control, receipt, custody, or disposal of" an employer's wages perform the employer's acts, and when it does, "all provisions of law (including penalties) and of the regulations applicable to an employer with respect to such acts shall be applicable to the agent," while each employer "shall remain subject to all provisions of law" as well (Treas. Reg. 31.3504-1). The application is Form 2678, "signed by the agent and the employer." Rev. Proc. 2013-39, effective December 12, 2013, sets out how it works:

- **Scope.** Income tax withholding, FICA and RRTA (section 2.03). FUTA only for home care service recipients receiving services through a federal, state or local program, and only if the agent is also authorized for withholding and FICA (sections 10.01 and 10.02); otherwise the clients file their own Forms 940.
- **Approval.** The employer gives the form to the agent, the agent files it, and the authorization is effective on the date in the IRS's approval letter (sections 3.01 to 3.03); processing is generally 30 days, and the agent isn't liable until the IRS approves.
- **The aggregate return.** The agent files one return per period covering its own employees and those of every employer it serves (section 4.01), with Schedule R allocating wages and taxes to each employer (section 4.03), and generally furnishes one W-2 per employee marked as agent for the employer (section 4.05).
- **Deposits.** Deposits follow "the agent's total accumulated taxes," and the employer's own deposit rules don't apply to the agent (section 5).
- **Liability and revocation.** Agent and employer are both liable for the taxes and penalties tied to the obligations the agent took on (section 2.02); either can revoke on Form 2678, effective on the date in the IRS letter (section 9.01), and an agent whose authority ends stays liable for wages paid while it was authorized (section 9.04).

### Designated Payer: the Non-Certified PEO

Since quarters beginning on or after March 31, 2014, Treas. Reg. 31.3504-2 designates a "payor" that pays wages to individuals performing services for a client under a service agreement, without any form. A service agreement for this purpose is one in which the payor asserts it is the employer or "co-employer" of the workers, pays them for the client's work, and takes on responsibility or liability for the taxes. Designation doesn't apply when wages are reported under the client's EIN, when the payor is a common paymaster, or when the payor is the employer itself. A designated payor performs the employer's acts for the wages it pays, "All provisions of law (including penalties)" apply to it, and the client stays subject to the same rules: the two are jointly liable, and the payor files under its own EIN. This is where a PEO without IRS certification lands, and Publication 15 notes that such third-party payers "must file Schedule R if their clients claim an employment tax credit."

### Certified Professional Employer Organization

For employment taxes, a CPEO "is treated as the employer" of its worksite employees for remuneration it remits, "and no other person shall be treated as the employer" (IRC 3511(a)). It files Form 8973 "within 30 days of starting or ending a service contract with a customer," with six months for existing customers after a new certification. The form names the customer's EIN, the employment tax forms the CPEO will file for the customer's workers, whether it reports only some of the wages, and whether the customer is a related party; the customer signs Part 5, and the CPEO signs a consent to disclose tax information to the customer for no more than three years or 12 quarters, renewed while the contract continues. CPEOs "must generally file Form 941 or Form 943 and the applicable Schedule R electronically," and Form 940 with its Schedule R likewise; a waiver request goes through the IRS Online Registration System at least 45 days before the return's due date.

Two limits keep a customer on the hook. Liability shifts only for worksite employees, so the customer and the CPEO may both be liable for people the CPEO pays who aren't worksite employees (IRC 3511(c)). And a customer related to the CPEO under a 10% ownership test isn't covered at all (IRC 3511(e)). Credits such as the research credit and the work opportunity credit stay with the customer, which needs the CPEO's information to claim them (IRC 3511(d)).

### ASO and EOR

**Administrative services only (ASO)** is a PEO vendor's product without co-employment: the provider runs payroll, HR administration and often benefits enrollment, while the client stays the only employer, files under its own EIN and buys its own plans. For tax purposes an ASO provider is a PSP or a reporting agent, and TriNet, for one, reports about 39,700 ASO users separately from its 323,200 worksite employees at the end of 2025.

**An employer of record** is the legal employer under its own registrations, with the client directing the work. Abroad it is the only way to employ someone without an entity; in the US the same structure is a PEO or staffing arrangement and falls into one of the rows above. [Employer of Record & Global Employment](/books/workforce/employer-of-record) covers it.

## Who Stays Liable, Worked

Liability isn't abstract when a provider fails; it decides who gets the bill. Take an invented client with 20 employees, $40,000 of federal employment taxes per quarter, and a provider that collects the taxes and never deposits them for the third quarter of 2026:

| Arrangement | Who the IRS assesses for the $40,000 | What the client can do |
| --- | --- | --- |
| In-house | The client | Nothing to recover from; the client made the mistake |
| PSP or reporting agent | The client, with penalties and interest; the trust fund recovery penalty can reach the client's responsible people personally | Pay, then pursue the provider; ask for penalty relief |
| Section 3504 agent or designated payer | The agent or payer and the client, jointly | The IRS can collect from either |
| CPEO, worksite employees | The CPEO | The customer is generally not liable for those wages |

The failure-to-deposit penalty alone on $40,000 paid more than 15 days late is 10%, $4,000, before interest, and 15% for amounts still unpaid more than 10 days after the first notice (Pub 15's tiers, cited in [The Life of a Payroll Tax Dollar](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)). The trust fund recovery penalty "is 100% of the unpaid trust fund tax": the withheld income tax and the employee half of FICA, not the employer half. If $14,000 of the $40,000 is employer FICA, the penalty that can follow the client's officers is on the other $26,000. When Payroll Providers Fail covers what happens next.

## Deposit Schedules for Aggregate Filers, Worked

An aggregate filer deposits on its own schedule, computed from its own totals. The rules are Pub 15's: monthly for an employer that reported "$50,000 or less of taxes for the lookback period," semiweekly above it, and a next-business-day deposit on any day accumulated taxes reach $100,000.

An invented example: a Section 3504 agent serves 50 home care service recipients, each with $1,200 of federal employment taxes a quarter, and pays them all on the same Friday every two weeks.

- **Each client alone.** $1,200 a quarter is $4,800 for a lookback year, far under $50,000: a monthly depositor, with taxes due by the 15th of the following month.
- **The agent.** 50 x $1,200 = $60,000 a quarter, $240,000 for the lookback year: a semiweekly depositor, with Friday's taxes due the following Wednesday.
- **The $100,000 day.** If the agent also serves 30 larger employers and one Friday's combined liability reaches $100,000, the whole amount is due the next business day, though no single client came near it.

The same dollars change due dates when an employer moves into or out of an aggregate arrangement, which is why the deposit schedule belongs to the filer of record for the period, not the employer row, and why a client leaving a CPEO in the middle of a year starts depositing on its own lookback history again.

## Seeing and Speaking for the Account: Forms 8821 and 2848

Filing and depositing are one kind of authority; seeing the account and talking to the IRS about it are others, and providers need all three:

- **Form 8821, tax information authorization,** lets a designee "inspect and/or receive your confidential information verbally or in writing" for the tax types and periods listed. It doesn't let the designee speak for the taxpayer, advocate a position or sign waivers, consents or closing agreements. Future periods are limited: the IRS won't record periods that "exceed 3 years" from December 31 of the year it receives the form. A new 8821 revokes prior ones unless copies are attached.
- **Form 2848, power of attorney,** authorizes a representative to represent the taxpayer before the IRS, which is what answering a penalty notice or requesting abatement on the client's behalf requires.
- **Form 8655** carries its own disclosure authority: duplicate notices and the information needed for penalty relief, for the forms and periods it covers.

A provider's notice team works through the 8655 for the forms it files and needs an 8821 or 2848 for anything else (a prior provider's quarters, an income tax question, a period before the contract). Each authorization has its own forms, periods and expiry, and a notice for a period no authorization covers is one the provider has to route back to the client. Tax Notices, Amendments & Agency Accounts covers the notice workflow.

## The Employer's Own EFTPS

Every arrangement in which deposits go under the employer's EIN shares a weakness: the employer can't see whether they happened unless it looks. The IRS's guidance is direct: "The employer is ultimately responsible for the deposit and payment of federal tax liabilities," and employers "should register on the EFTPS system to get their own PIN and use this PIN to periodically verify payments." Registered employers see 16 months of payment history, and "A red flag should go up the first time a service provider misses a payment or makes a late payment." The same page warns employers not to change their address of record to the provider's, because "the IRS will send correspondence to the employer at the address of record."

EFTPS enrollment validates the business with the IRS and mails a PIN "via U.S. Mail in five to seven business days"; payments must be scheduled "by 8 p.m. ET the day before the due date" to be timely. The provider, as a reporting agent, deposits through its own EFTPS batch access under the client's EIN (Rev. Proc. 2012-32 requires EFTPS for agents), so the employer's enrollment is a second, independent window onto the same account. Rev. Proc. 2012-32's quarterly disclosure statement exists to tell the client so.

A provider that takes this seriously builds the employer's verification into onboarding: prompt the employer to enroll, record that it did, and show each deposit's EFT acknowledgment number in the client's own portal so the employer can match it against EFTPS. When Payroll Providers Fail covers why the check matters.

## State Equivalents

States run their own authorization schemes for withholding, unemployment and paid leave accounts, and a provider files with each under its own rules. California's Employment Development Department is a full example:

- **Power of attorney.** The Power of Attorney Declaration (DE 48) is the employer's "written authorization for an individual or other entity to act on your behalf in tax and/or benefit reporting matters," and "remains in effect until it is revoked or a new one is received." It can grant all authority (represent the employer and receive mailings for all state tax matters) or a specific declaration for tax reporting, benefit reporting or both, for stated periods. The signature date must be within 30 days of submission, by an owner, partner, member or corporate officer, and an employer can file it through e-Services for Business.
- **Payroll reporting agent.** A Payroll Reporting Agent prepares and files returns under each employer's account. Instead of a POA per client, the agent keeps a Memorandum of Understanding: Certification of Payroll Agent (DE 972) on file, "renewable every two years," registers with the Payroll Reporting Agent Registration Form (DE 973B), keeps each client's POA itself, and each month submits a list of clients to add and delete, with name, payroll tax account number and mailing address, by mail or electronically through the Federal State Employment Tax (FSET) program.
- **Counseling service agent.** A separate role for agents who respond to unemployment insurance claims (DE 231CSA), which a provider that only files returns doesn't hold.

California's structure (an agent registration, a periodic client list, authority per employer account) mirrors the IRS's Agent's List, and most states that accept bulk filing ask for something similar. The state account itself (registration, the account number, rate notices) is State & Local Payroll Taxes' subject, and PEOs & Co-Employment covers how states treat a PEO's unemployment account.

## How to Build It

The employer row says which arrangement files its federal returns; the authorization table says who may act for it, for what, and when:

```sql
ALTER TABLE employers
  ADD COLUMN filing_arrangement TEXT NOT NULL DEFAULT 'in_house'
    CHECK (filing_arrangement IN ('in_house', 'psp', 'reporting_agent', 'section_3504_agent',
      'designated_payer', 'cpeo'));
-- filing_arrangement is the current value; the history lives in agent_authorizations,
-- and every filing and remittance records the arrangement in force for its period.

CREATE TABLE agent_authorizations (        -- who may file, deposit, see or speak for an employer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),   -- 'US', 'US-CA', ...
  kind                TEXT NOT NULL CHECK (kind IN ('form_8655', 'form_2678', 'form_8973',
                        'designated_payer', 'form_8821', 'form_2848', 'state_poa',
                        'state_agent_listing')),
  agent_name          TEXT NOT NULL,
  agent_ein           CHAR(9),                -- the agent's own EIN, for aggregate filers
  forms               TEXT[] NOT NULL,        -- '941', '940', 'w2', 'state_withholding', ...
  powers              TEXT[] NOT NULL,        -- 'sign', 'file', 'deposit', 'receive_notices',
                                              -- 'inspect', 'represent'
  periods             DATERANGE NOT NULL,     -- tax periods covered, closed-open
  status              TEXT NOT NULL CHECK (status IN ('drafted', 'signed', 'submitted',
                        'accepted', 'rejected', 'superseded', 'revoked', 'expired')),
  signed_by           TEXT,                   -- the client signer and title
  signed_on           DATE,
  submitted_on        DATE,
  accepted_on         DATE,                   -- IRS acceptance or approval letter date
  ends_reason         TEXT CHECK (ends_reason IN ('new_agent', 'client_revoked',
                        'agent_revoked', 'irs_revoked', 'contract_ended', 'expired')),
  document_id         UUID NOT NULL REFERENCES documents (id),
  EXCLUDE USING GIST (employer_id WITH =, jurisdiction_id WITH =, kind WITH =,
    periods WITH &&) WHERE (status = 'accepted')
);

CREATE TABLE eftps_enrollments (           -- the employer's own window onto its deposits
  employer_id         UUID PRIMARY KEY REFERENCES employers (id),
  enrolled            BOOLEAN NOT NULL,
  enrolled_on         DATE,
  attested_by         TEXT,                   -- who at the employer confirmed it
  last_prompted_at    TIMESTAMPTZ,
  last_verified_on    DATE                    -- when the employer last confirmed a deposit
);

ALTER TABLE filings
  ADD COLUMN filed_under_ein        CHAR(9),  -- the client's or the aggregate filer's
  ADD COLUMN filing_arrangement     TEXT,     -- copied from the arrangement in force for the period
  ADD COLUMN agent_authorization_id UUID REFERENCES agent_authorizations (id),
  ADD COLUMN aggregate_parent_id    UUID REFERENCES filings (id);   -- a client's Schedule R line
                                                                    -- points at the aggregate return

ALTER TABLE remittances
  ADD COLUMN paid_under_ein         CHAR(9),
  ADD COLUMN agent_authorization_id UUID REFERENCES agent_authorizations (id);

-- Which authorization covers a filing: the accepted one whose periods contain the period.
CREATE VIEW filing_authority AS
SELECT f.id AS filing_id, f.employer_id, f.form, f.period, a.id AS authorization_id, a.kind
FROM filings f
LEFT JOIN agent_authorizations a
  ON a.employer_id = f.employer_id
 AND a.jurisdiction_id = f.jurisdiction_id
 AND a.status = 'accepted'
 AND f.form = ANY (a.forms)
 AND 'file' = ANY (a.powers)
 AND a.periods @> lower(f.period);
```

Design notes:

- **Periods, not flags.** Rev. Proc. 2012-32 hands later periods to a new agent while the old one keeps earlier ones, so an authorization covers a range of tax periods, and two accepted authorizations for one employer can coexist for different ranges. The exclusion constraint stops two accepted authorizations of the same kind covering the same period ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **Block filing without authority.** A 941 whose `filing_authority` row has no authorization can't be signed by the provider; the pay run can still compute and deposit under an arrangement that allows it, but the return goes to the client for signature or waits for the 8655 to be accepted.
- **Copy the arrangement onto the record.** Each filing and remittance stores the EIN it went under and the arrangement in force, because the employer row's current `filing_arrangement` will change and the old returns won't ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Aggregate returns are parents.** A CPEO's or 3504 agent's 941 is one filing under its own EIN, and each client's Schedule R allocation is a child filing pointing at it, so a client's quarter has one answer to "what was reported for us" whichever arrangement it was in.
- **Deposit schedules follow the filer.** The schedule determination for an aggregate filer runs over the aggregate's lookback totals; a client's own determination runs over the periods it filed itself. Deposits, Returns & the Tax Calendar owns the determination table; this chapter only says which EIN's history it reads.
- **Authorizations are documents with lifecycles.** A signed 8655 is a `documents` row with its form revision, and the authorization's state (drafted, signed, submitted, accepted, superseded) drives onboarding: a company can't go live for tax filing until its federal authorization is accepted and its state agent listings are submitted ([Workflows](/docs/building-blocks/workflows)).

## Auditing

- **Every return to its authority.** For each filing: the EIN it went under, the arrangement, the authorization and its signed document, and the acceptance date, so "who was allowed to sign this" has an answer years later.
- **Every deposit to its filer.** For each remittance: the EIN, the EFTPS acknowledgment, and the arrangement, reconciled to the return's liability for the period.
- **The disclosure statement trail.** For reporting agents, each quarterly statement sent to each client (Rev. Proc. 2012-32 section 5.05), with its date and delivery.
- **The client's own verification.** Whether the employer enrolled in EFTPS and when it last confirmed a deposit, the evidence that the provider told it to look.
- **Changes in arrangement.** Every move between arrangements (joining or leaving a CPEO, a new agent) with the effective period, the Form 8973 or new 8655, and the returns each party filed for the transition quarters ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Store the filing arrangement per employer and per period,** and copy the EIN and arrangement onto every filing and remittance.
- **Model authorizations as period ranges with states,** so a new agent and an old one can each own their quarters during a switch.
- **Refuse to sign what you aren't authorized to sign;** route the return to the client or wait for acceptance.
- **Compute deposit schedules from the filer of record's history,** which changes when a client enters or leaves an aggregate arrangement.
- **Treat Forms 8821, 2848 and state POAs as their own authorizations** with their own forms, periods and expiry, separate from the authority to file.
- **Prompt every employer to enroll in EFTPS and show deposit confirmations in its portal,** because the IRS holds the employer responsible either way.
- **Keep one model for federal and state authorizations,** since states mirror the IRS with agent registrations, client lists and per-account powers.

## References

**Law and regulation**

- [26 USC 3511](https://www.law.cornell.edu/uscode/text/26/3511), a CPEO treated as the employer "and no other person," the successor rule, liability for non-worksite employees, credits staying with the customer, the 10% related-party rule and reporting
- [26 USC 7705](https://www.law.cornell.edu/uscode/text/26/7705), the definition and certification of CPEOs and the public list
- [26 CFR 31.3504-1](https://www.law.cornell.edu/cfr/text/26/31.3504-1), designation of an agent by application, the agent subject to the employer's provisions and the employer remaining subject
- [26 CFR 31.3504-2](https://www.law.cornell.edu/cfr/text/26/31.3504-2), the designated payor under a service agreement, its exceptions, joint liability and the effective date for quarters beginning on or after March 31, 2014

**Agency guidance and forms**

- [IRS: Third party arrangement chart](https://www.irs.gov/businesses/small-businesses-self-employed/third-party-arrangement-chart), forms, EINs, filing, deposits, Form 940 and liability for PSPs, reporting agents, 3504 agents and CPEOs, and the guidance list
- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), outsourcing and continuing responsibility, aggregate filers and Schedule R, CPEO e-filing and the 45-day waiver request, EFTPS, Section 16 on third-party payer arrangements, deposit schedules and the $100,000 rule
- [IRS: Rev. Proc. 2012-32, in Internal Revenue Bulletin 2012-34](https://www.irs.gov/irb/2012-34_IRB), reporting agents: definition, forms, EFTPS, the Agent's List, the disclosure statement, effective periods, a new agent's authority and signatures
- [IRS: Rev. Proc. 2013-39, in Internal Revenue Bulletin 2013-52](https://www.irs.gov/irb/2013-52_IRB), Section 3504 agents: scope, approval, aggregate returns and Schedule R, W-2s, deposits on the agent's totals, FUTA for home care service recipients, joint liability, revocation and the effective date
- [IRS: About Form 8655, Reporting Agent Authorization](https://www.irs.gov/forms-pubs/about-form-8655), the four purposes, the January 2024 revision and Publication 1474
- [IRS: Instructions for Form 2678](https://www.irs.gov/instructions/i2678), the appointment, FUTA limits, Schedule R, shared liability, 30-day processing and revocation
- [IRS: Instructions for Form 8973](https://www.irs.gov/instructions/i8973), the 30-day notice, the six-month rule for new CPEOs, the forms reported, the customer's signature and the disclosure consent
- [IRS: Instructions for Form 8821](https://www.irs.gov/instructions/i8821), what a tax information authorization allows and doesn't, the three-year limit on future periods, Form 2848 for representation, and revocation
- [IRS: Outsourcing payroll duties](https://www.irs.gov/businesses/small-businesses-self-employed/outsourcing-payroll-duties), the employer's ultimate responsibility, EFTPS with the employer's own PIN, 16 months of history, the red flag and the address of record
- [EFTPS: Electronic Federal Tax Payment System](https://www.eftps.gov/eftps/), enrollment, the PIN by mail in five to seven business days and the 8 p.m. ET cutoff
- [IRS: CPEO public listings](https://www.irs.gov/tax-professionals/cpeo-public-listings), the active list and its quarterly update
- [California EDD: Power of Attorney Declaration (DE 48)](https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de48.pdf), authority granted, duration until revoked, general and specific declarations, signers and the 30-day signature rule
- [California EDD: Information Sheet, Payroll Reporting Agent (DE 231PRA)](https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de231pra.pdf), filing under each employer account, the DE 972 renewable every two years in place of a POA per client, the DE 973B and monthly client lists through FSET

**Filings**

- [TriNet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/937098/000093709826000010/tnet-20251231.htm), worksite employees and ASO users

**Vendor documentation**

- [Check: Company Filing Authorization](https://docs.checkhq.com/reference/company-filing-authorization.md), the employer signing Form 8655 and state authorization forms during onboarding so Check can file and remit
- [Gusto Embedded: Company forms](https://docs.gusto.com/embedded-payroll/docs/company-form.md), Form 8655 and the direct deposit authorization as the minimum onboarding forms, signed by the company signatory
