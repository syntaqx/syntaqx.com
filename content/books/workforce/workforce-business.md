+++
title = "The Workforce Business"
description = "How payroll providers, PEOs, EORs and HR systems pay people: the parties, the money, the life of a pay run, a tax dollar and a hire, and the data model."
category = "Workforce Industry"
order = 2601
part = "The Business"
tags = ["payroll", "hr", "peo", "employer-of-record", "business-models", "data-model"]
+++

Payroll is a promise with a date on it. An employer promises a worker a wage for hours or a salary for a period, and the law adds a list of promises the employer didn't choose: to withhold income tax by the government's tables, to pay Social Security, Medicare and unemployment tax on top, to deposit all of it on a schedule the IRS sets from the employer's own history, to honor a child support order or a tax levy before the worker sees a dollar, to pay overtime at a rate that includes last month's bonus, to hand over a final paycheck by a deadline that differs by state, and to report every dollar to the worker, the IRS, the Social Security Administration, the state and sometimes the city. A payroll provider makes those promises on the employer's behalf, a PEO makes some of them as a co-employer, an employer of record makes all of them as the legal employer in a country the client has never registered in, and an embedded payroll API makes them inside someone else's software. Each is regulated, or liable, for the part it does.

The software is hard because every number is a function of dates. Which W-4 applied, which rate the worker earned, which state they lived and worked in, which pay period the hours fell in, which deposit schedule the employer was on that year and which wage base the worker had already crossed are all answered as of a date, and a correction three months later must reproduce the old answer before it computes the new one. The same dollar of wages is recorded in a time record, a pay statement line, a quarter-to-date accumulator, a tax liability, a deposit, a quarterly return, a W-2 and the SSA's earnings record, and the IRS and SSA compare the last few with each other every year. When MyPayrollHR shut down in September 2019, it left nearly $35 million of its roughly 4,000 clients' payroll and tax payments in limbo, more than $9 million of it owed to the firm that handled their tax withholdings, and the IRS's position is that the employer stays responsible for its deposits whoever was supposed to make them. This chapter is the map the rest of the volume uses: how to read it, the parties, how the money is made, the life of a pay run, a payroll tax dollar and a hire, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/workforce/glossary).

## How to Read This Volume

The volume follows a worker's pay from the business that runs payroll to the calculation, the taxes, the money, the hours behind it, the HR record, leave, benefits, contractors and workers abroad, and the platform that runs it all, in ten parts plus a reference:

- **The Business.** This chapter; The Payroll & HR Landscape (providers by clients, workers paid and revenue from filings, private players by what they publish, the segments from small business to enterprise HCM, PEO, EOR and embedded, the consolidation, the buying cycle and switching); How Payroll Providers Make Money (per employee per month and per run pricing, modules, interest on client funds worked from 10-Ks, rate sensitivity, PEO gross billings and net revenue, insurance margins, EOR fees, embedded revenue share, float against credit losses); Who Runs Payroll: Agents & Liability (in-house, payroll service providers, reporting agents, Section 3504 agents, CPEOs and other PEOs, ASOs and EORs, who files under which EIN, who stays liable, and EFTPS verification); and PEOs & Co-Employment (the client service agreement, worksite employees, master health plans, CPEO certification and bonds, state PEO licensing, wage base restarts, ASO and EOR contrasts, leaving a PEO).
- **Gross to Net.** Gross-to-Net, Step by Step (the calculation order, the taxability matrix, wage bases, rounding, gross-up and net-to-gross, negative net and arrears, a worked statement end to end); Federal Withholding & the W-4 (the 2020 and later W-4 and legacy forms, Pub 15-T methods worked, annualization, exempt claims, nonresident aliens, lock-in letters, the 2026 changes); Supplemental Wages & Imputed Income (flat and aggregate methods, the $1 million rule, group-term life over $50,000, vehicles and other fringes, stock compensation in payroll); Pre-Tax & Post-Tax Deductions (Section 125, 401(k) and Roth deferrals on the calculation side, HSA and FSA, commuter benefits, state quirks, ordering, arrears, employer contributions as memo lines); Tips & the 2025 Tax Law (tip reporting and allocation, FICA on tips and the 45B credit, the qualified tips and overtime deductions in P.L. 119-21, the 2026 W-2 codes and occupation codes); Retro Pay, Voids & Corrections (off-cycle runs, retro rate changes and retro overtime, voids, reversals and adjustments, overpayment recovery, corrections across a quarter or a year); and Payroll by Industry (restaurants, construction and certified payroll, agriculture, household employers, nonprofits and clergy, schools, healthcare, staffing, seasonal and union shops).
- **Payroll Tax.** FICA, FUTA & SUTA (rates and the 2026 wage base, Additional Medicare, the FUTA credit and credit reduction states, SUTA wage bases, rate notices, voluntary contributions, successor rules, SUI localization); Deposits, Returns & the Tax Calendar (the lookback period, monthly and semiweekly schedules, the $100,000 next-day rule, EFTPS, Forms 941, 944, 943 and 940, Schedule B, penalties, state schedules, the calendar as data); State & Local Payroll Taxes (state withholding methods, local income taxes from Pennsylvania to Oregon, registrations, the jurisdiction lookup from an address); Multi-State, Reciprocity & Remote Work (resident and work states, reciprocity, credits, the convenience-of-the-employer rule, mobile workforce thresholds, remote employees in a new state); Tax Notices, Amendments & Agency Accounts (agency registration, IRS and state notices, penalty abatement, Form 941-X, powers of attorney, the notice inbox as a workflow); Tax Engines & Filing Services (the calculation layer and the file-and-remit layer, location codes, rate table updates, testing, bulk filing formats, rejects); and Year-End, W-2s & Wage Reporting (W-2 box by box, the 2026 changes, SSA's EFW2 format, state reconciliations, W-2c, penalties, the January rush).
- **Moving the Money.** Funding a Payroll (client debits from four-day to same-day, wire prefunding, credit limits and underwriting, risk tiers, the provider as a lender, holidays and check date math); When the Debit Fails (return codes that matter, retries, blocked payrolls, partial pay, recovery, who eats the loss, fraud patterns); Client Funds & Impound Accounts (trust accounts and trust banks, impounding, investment policy and ladders, liquidity, client funds obligations, reconciliation of funds held to obligations); Direct Deposit, Pay Cards & Checks (direct deposit as payroll does it, Reg E's compulsory use rule, payroll cards under Reg E and state law, paper checks and positive pay, early pay hooks, unclaimed wages); Child Support Withholding (the income withholding order, e-IWO, timing, priority, CCPA limits, state disbursement units, medical support notices); Garnishments & Levies (CCPA Title III and disposable earnings, creditor garnishments, IRS levies with exempt amounts worked, state tax levies, student loan garnishment, bankruptcy orders, stacking, fees); and When Payroll Providers Fail (MyPayrollHR and Cachet, other public cases, embezzled impounds, what employers can verify, design lessons).
- **Time and Wage-Hour.** The Workweek & the Time Record (FLSA basics, the fixed 168-hour workweek, hours worked, 29 CFR 516 records, raw punches and rounding, edits and approvals); Clocks, Kiosks, Geofences & Biometrics (capture methods, mobile and geofenced punches, buddy punching, biometric laws and consent); Overtime & the Regular Rate (40-hour overtime, the regular rate and its exclusions, bonuses and retro overtime, multiple rates, state daily overtime, exemptions and the salary threshold); Minimum Wage as Data (federal, state, county and city rates with effective dates, tipped and youth wages, indexed increases, remote workers, change management); Breaks, Premiums & Attestations (California meal and rest premiums, attestations, other states, lactation breaks, premiums in the regular rate); Tipped Employees (tip credit and state bans, tip pools, service charges, dual jobs, card fee deductions, tip payouts); Fair Workweek & Scheduling Laws (advance notice, predictability pay, clopening rest, access to hours, minor labor hours, on-call); and Pay Frequency, Pay Statements & Final Pay (payday frequency laws, pay statement contents, electronic statements, final pay timing and waiting time penalties, PTO payout, deductions from final pay).
- **Hiring and HR Records.** The HRIS as Record of Truth (the employee record and its history, effective dating, position management, joiner, mover and leaver events, HRIS-to-payroll integrations); Recruiting, ATS & AI in Hiring (requisitions, candidates, offers, EEO self-identification, ATS vendors and APIs, AI in hiring laws, candidate data retention); Background Checks, Fair Chance & Drug Testing (FCRA disclosure and adverse action, consumer reporting agencies, fair chance sequencing, drug testing and cannabis protections, continuous monitoring); Onboarding: I-9, E-Verify & New Hire Reporting (Form I-9 timing, the remote alternative procedure, reverification, retention, E-Verify cases, state new hire reporting, onboarding packets); Pay Transparency, Pay Equity & EEO-1 (salary range posting laws as a rules table, salary history bans, pay data reporting, EEO-1 and its proposed rescission, the EU Pay Transparency Directive, pay equity analysis); Terminations, Offboarding & WARN (the separation fan-out, WARN and state mini-WARN counting, severance and release payments, unemployment claims, rehire); and Employee Records, Privacy & Retention (personnel file access, retention schedules by record, medical record separation, employee data under the CCPA, SSN handling, employee data requests).
- **Leave.** FMLA Administration (eligibility, the 12-week entitlement and leave year methods, notices, certification, intermittent leave, military leave, interplay with the ADA and paid leave); State Paid Family & Medical Leave (program by program: 2026 contribution rates and wage bases, splits, small employer rules, private plans, wage reporting, benefit coordination and job protection); and Sick Leave & PTO Engines (state and city sick leave laws as rules, PTO policies, California vacation as wages, payout at separation, the accrual ledger).
- **Benefits Administration.** Enrollment & Life Events (open enrollment, new hire windows, Section 125 changes in status, HIPAA special enrollment, evidence of insurability, dependent verification, benefit deductions to payroll); Carrier Connections & the 834 (the 834 from the employer side, full and change files, acknowledgments, carrier setup and testing, API carriers, invoice reconciliation); The ACA Employer Mandate & 1095-C (ALE status, full-time determination and look-back measurement, affordability safe harbors, 4980H penalties worked, 1094-C and 1095-C codes, Letter 226-J); COBRA & State Continuation (qualifying events, notice clocks, premiums up to 102%, administrators, state mini-COBRA laws); 401(k) Deferrals & Remittance (2026 limits, catch-ups and the Roth catch-up rule, auto-enrollment, matches and true-ups, plan compensation, remittance timing, late deposits, the recordkeeper file); HSAs, FSAs & HRAs (2026 limits, HDHP rules, payroll contributions, carryover and grace periods, dependent care, QSEHRA and ICHRA); and Benefits Administration Platforms (the vendor landscape, brokers, carrier APIs, the plan, rate and eligibility data model, integration with payroll).
- **Contractors and Global.** Contractors & 1099s (W-9, TIN Matching, backup withholding and B-notices, Forms 1099-NEC and 1099-MISC at the $2,000 threshold, IRIS and the FIRE retirement, state filing, contractor portals); Worker Classification (the IRS common-law test and Form SS-8, Section 530, the DOL economic reality test and its 2026 proposal, ABC tests, misclassification costs and VCSP, what payroll records); Employer of Record & Global Employment (EOR mechanics, owned entities and partners, contractor of record, permanent establishment risk, benefits and terminations abroad, pricing, when to open an entity); and International Payroll (aggregators and in-country partners, country basics for the UK, Canada, Germany, India, Mexico and Brazil at a high level, EU directives, currencies and rails, data residency).
- **Running the Platform.** Embedded Payroll (why vertical software embeds payroll, object models, onboarding states, payroll state machines, webhooks, components, partner liability); Unified HR & Payroll APIs (read and write scopes, assisted and automated connections, sync cadence, deduction write-back, freshness, consent); Payroll Platform Architecture (the deterministic pay run engine, versioned rules, as-of queries, idempotent money movement, schedulers for liabilities and the tax calendar, multi-tenancy, peak loads, GL exports, testing gross-to-net); Changing Providers Mid-Year (Rev. Proc. 2004-53, successor wage bases, YTD loading, parallel runs, PEO entry and exit, the go-live calendar); Controls, Audits & SOC 1 (what a payroll SOC 1 Type 2 covers, complementary user entity controls, internal controls over payroll, DOL, IRS and state UI audits); Payroll Fraud & Security (direct deposit change fraud, W-2 phishing, ghost employees, portal takeover, insider risk, SSN and bank data protection); and Payroll & HR Metrics (clients, worksite employees, retention, PEPM, float and yield, workers paid as filings define each, operational and HR metrics).
- **Reference.** A [Glossary](/books/workforce/glossary) of every term the volume defines, grouped by part.

The volume covers what payroll and HR add. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Money & Amounts](/docs/money/amounts), [Payment States & Ledgers](/docs/money/payment-states), [Accounting](/docs/money/accounting), [Idempotency](/docs/requests/idempotency), [Temporal Data](/docs/database/temporal-data), [Rules as Data](/docs/building-blocks/rules-as-data), [Events & Async Messaging](/docs/architecture/events), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Sensitive Data](/docs/security/sensitive-data), [Data Retention](/docs/building-blocks/data-retention) and [Audit Trails](/docs/building-blocks/audit-trails). Other volumes own topics this one leans on. [Payments](/books/payments/ach) owns ACH as a rail (files, SEC codes, returns, Regulation E), [checks](/books/payments/checks), [card issuing programs](/books/payments/card-issuing), [vendor payouts and the vendor side of W-9s and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s) and [cross-border money movement](/books/payments/cross-border-and-fx). [Banking & Lending](/books/banking-and-lending/earned-wage-access) owns earned wage access, [expense reimbursement and per diem](/books/banking-and-lending/reimbursements-and-per-diem), [garnishment and levy of deposit accounts](/books/banking-and-lending/legal-process) and [unclaimed property](/books/banking-and-lending/dormancy-and-escheat). [Investing & Digital Assets](/books/investing-and-digital-assets/retirement-accounts#401-k-recordkeeping-in-brief) owns 401(k) recordkeeping and IRAs, [Health Tech](/books/health-tech/payer-operations#enrollment-and-membership) owns the payer side of enrollment, [Field Operations](/books/field-operations/technician-workforce) owns technician pay, piece rate and prevailing wage in the field, [User-Generated Platforms](/books/user-generated-platforms/gig-work-and-worker-law) owns gig worker classification and minimum pay standards for platforms, and [Workplace & Collaboration](/books/workplace-and-collaboration/provisioning-and-scim) owns SCIM provisioning, [employee monitoring](/books/workplace-and-collaboration/employee-monitoring-and-privacy) and [frontline scheduling apps](/books/workplace-and-collaboration/frontline-workers). The Insurance volume owns workers' compensation policies and premium audits, group life and disability products, and EPLI. This volume owns the pay itself: how it is calculated, taxed, funded, paid, withheld from, reported and corrected, and the HR records the law requires around it.

The volume is US-centric, with global payroll and the EU where they bind or teach. No single company is the model: the vocabulary and tables are the industry's, benchmarked across payroll and HCM providers (ADP, Dayforce, Gusto, isolved, Paychex, Paycom, Paylocity, Rippling, UKG, Workday and others), PEOs (ADP TotalSource, Insperity, Justworks, TriNet and others), EOR and global providers (Deel, Globalization Partners, Oyster, Papaya Global, Remote, Velocity Global and others), embedded and unified APIs (Check, Finch, Gusto Embedded, Merge, Zeal), tax engines and time, HRIS and benefits vendors, and a company's own product name appears only where the chapter is describing that company.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Workers** | Employees (hourly and salaried, full-time, part-time, seasonal, temporary, union) and independent contractors; some are both at different times for the same business | The right net pay on the right day, a statement they can read, taxes withheld so April holds no surprise, benefits that start when promised, and a W-2 or 1099 that matches |
| **Employers** | Legal entities with an EIN that hire, pay and file; one business is often several employers, each with its own returns and registrations | Payroll approved on time, every liability funded and deposited, every return filed, and no notice they can't explain |
| **Payroll providers** | Software and service bureaus that calculate pay, move the money and, usually, deposit taxes and file returns under the employer's EIN; from small-business tools to enterprise HCM suites | Clean employee and time data by the cutoff, a funded debit before the money leaves, and the authority to file and pay on the employer's behalf |
| **PEOs and CPEOs** | Professional employer organizations that co-employ a client's workers, run payroll and benefits under their own plans and, for a certified PEO, file federal employment taxes under the PEO's own EIN and take on the liability for them | A client service agreement that allocates every employer duty, payroll funded no later than the pay date, and the worksite employee records the IRS certification requires |
| **Employers of record** | Providers that are the legal employer in a country where the client has no entity, through entities they own or through partners, while the client directs the work | Country-correct contracts, payroll, benefits and terminations, and a monthly fee per worker that covers the risk |
| **HRIS, time, ATS and benefits vendors** | Systems of record for the employee file, hours worked, candidates and benefit elections, either inside an HCM suite or separate and integrated | Effective-dated changes delivered to payroll before the cutoff, and deductions and hours that match what payroll paid |
| **Embedded payroll and unified APIs** | Payroll engines sold as APIs and components to vertical software (Check, Gusto Embedded, Zeal), and read and write connectors to many payroll systems at once (Finch, Merge) | Partners who own the customer relationship and the risk they agreed to, and connections that stay authorized and in sync |
| **Tax engines and filing services** | Calculation engines that turn an address, wages and elections into taxes, and services that deposit, file and answer notices across thousands of jurisdictions | Addresses resolved to jurisdictions, year-to-date totals supplied by the caller, and liabilities handed over in time to pay them |
| **Federal tax agencies** | The IRS for income tax withholding, FICA and FUTA deposits and returns; the Social Security Administration for W-2 processing and workers' earnings records | Deposits on schedule by electronic funds transfer, returns that agree with each other, and W-2s that agree with the returns |
| **State and local agencies** | State revenue departments for income tax withholding, state workforce agencies for unemployment insurance and new hire reports, paid leave programs, and counties, cities, school districts and transit districts that tax wages | A registration before the first payroll, the employer's own account number on every payment, and wage reports by worker |
| **Order issuers** | State child support agencies and their disbursement units, courts, the IRS and state tax agencies with levies, the Department of Education and other federal agencies with administrative wage garnishment, bankruptcy trustees | The order honored from the right pay date, the amount within the legal limits, the money sent on time, and an answer when asked |
| **Carriers, plans and recordkeepers** | Insurance carriers and benefits administrators for health, dental, vision, life and disability; 401(k) recordkeepers; HSA and FSA administrators; COBRA administrators | Enrollment and termination files that match deductions, contributions remitted on time with a file that says whose they are |
| **Banks and ODFIs** | The originating depository financial institutions that send the provider's debits and credits, the trust banks that hold client funds, and the workers' banks that receive direct deposits | Files that balance, returns handled within the network's windows, and a third-party sender relationship the bank can supervise |

Three splits shape the data model. **Company versus employer.** The provider's customer is a company: one account, one contract, one bill. The employer is a legal entity with an EIN that files returns. A company with three EINs is one company and three employers, and every registration, return, deposit schedule and W-2 belongs to exactly one employer; the IRS sees three taxpayers no matter how the provider's screens group them. **Person versus worker versus employment.** One person can work for two employers in the same company, can be a contractor before they're hired and can leave and come back. The person carries identity (the SSN and the date of birth); the worker is the person at one employer; the employment is one stint, from hire to termination, and a rehire is a new employment on the same worker so wage bases and year-to-date totals continue. **Calculation versus money versus filing.** A pay run calculates statements, which create liabilities, which are satisfied by money movements and remittances, which are reported on filings. Each has its own clock and its own failure, and a system that collapses them can't answer the questions that matter: what was owed, what was paid, and what was reported.

## How the Money Works

A payroll provider earns money four ways, and the economics of each explain a design choice later in the volume. The figures below are from 10-Ks and vendor pricing pages, dated; the worked examples are illustrations, labeled as mine. How Payroll Providers Make Money covers each line in depth.

### Per Employee per Month

The base fee is charged per worker. Paylocity's recurring fees are "charged and collected based on a per-employee-per-month fee" for its 44,400 or so clients (fiscal year ended June 30, 2026). Small-business pricing pages publish the same shape with a base: Square Payroll lists $35 a month plus $6 a month for each person paid, and a contractor-only plan at $6 per person, as of November 2026. A worked example of my own: an employer with 40 employees pays $35 + 40 x $6 = $275 a month, or $3,300 a year. Modules (time, benefits administration, HR, recruiting, learning) are priced the same way and stacked, which is why providers chase attach rates: the payroll engine is the entry point, and the per-worker modules are the growth.

### Interest on Client Funds

Between the day a provider collects a payroll from the employer and the day it pays the employees, the agencies and the other payees, it holds the money and earns interest on it. ADP's 10-K for the fiscal year ended June 30, 2026 reports interest on funds held for clients of $1,354.8 million (against $1,189.1 million the year before), on an average client funds balance of $40.4 billion at an average yield of 3.4%. A check of my own: $40.4 billion at 3.4% is about $1.37 billion, close to the reported figure. At June 30, 2026 ADP held $43,957.8 million of funds held for clients against $44,415.5 million of client funds obligations, and it says it uses "the daily collection of funds from our clients to satisfy other unrelated client funds obligations" rather than selling the securities it has already invested in. Paychex, for the fiscal year ended May 31, 2026, reports $210.9 million of interest on funds held for clients on an average balance of $5,768.2 million at 3.5%; my product of those two is about $202 million, and the filing states the rate excludes net realized gains and losses, so the two don't reconcile to the dollar. Paylocity reports $120.0 million for its fiscal 2026.

The balance is the product of how much moves and how long it is held. ADP says it moved more than $3.5 trillion of client funds to employees, tax authorities and other payees in fiscal 2026; Paychex says about $1.3 trillion. A worked example of my own for one invented run, from [The Life of a Pay Run](#the-life-of-a-pay-run) below: $38,625.60 of federal employment taxes collected on Monday, November 16, 2026 and deposited on Wednesday, November 25 is held nine days, worth $38,625.60 x 3.4% x 9 / 365 = about $32.38 at ADP's yield, or about $842 over 26 biweekly runs. Rates move this line directly: 25 basis points on ADP's $40.4 billion is about $101 million a year and on Paychex's $5.77 billion about $14 million (my arithmetic, before the lag of a laddered portfolio). Client Funds & Impound Accounts covers how the money is held and invested; Funding a Payroll covers the other side of the same float, the provider paying out before a debit is final.

### PEO Gross Billings and Net Revenue

A PEO bills the client for the whole cost of its worksite employees (wages, payroll taxes, benefits, workers' compensation) plus its fee, and the accounting question is how much of that is revenue. Insperity's 2025 10-K shows the arithmetic: gross billings of $45,565 million, less worksite employee payroll cost of $38,753 million, equals revenues of $6,812 million, "Revenues, which exclude the payroll cost component of gross billings, and therefore, consist solely of the markup." On an average of 310,089 worksite employees paid per month, that is $1,831 of revenue and $242 of gross profit per worksite employee per month, down from $285 in 2024 (Insperity's figures). By my arithmetic the markup is about 15% of gross billings and the gross profit about $2,904 per worksite employee per year. ADP reports the same treatment for ADP TotalSource: "PEO revenues are net of direct pass-through costs, primarily consisting of payroll wages and payroll taxes," which were $81,123.2 million in fiscal 2026 against PEO Services revenue of $7,128.1 million, and the revenue it keeps includes $4,607.3 million of zero-margin benefits pass-throughs, leaving $2,520.8 million of PEO revenue excluding them. So most of a PEO's revenue line is benefits and insurance cost, and its margin is in pricing those, which is why PEO revenue moves with health costs and workers' compensation claims as much as with headcount. PEOs & Co-Employment and How Payroll Providers Make Money cover the principal and agent judgment behind it.

### Employer of Record Fees

An EOR charges a flat monthly fee per worker on top of the worker's full employment cost. Remote lists EOR "Starting at $599 employee per month, for annual contracts," plus $39 per employee per month for equity recipients, as of November 2026; by my arithmetic that is $7,188 a year per worker before the salary, the employer taxes and benefits of the country, which the client also pays. The fee is high relative to domestic PEPM because the EOR is the legal employer: it holds the entity, the registrations, the termination risk and the local compliance. Employer of Record & Global Employment covers the mechanics and when an entity of your own becomes cheaper.

### One Rule for All of Them

Each line rewards a different discipline. PEPM rewards accurate worker counts, so a terminated worker who stays active is overbilled and an unpaid contractor is underbilled. Float rewards collecting early and paying on the due date, never late, so the liability's due date has to be computed from the rule rather than guessed. PEO margin rewards knowing the cost of every worksite employee by line, so gross billings must be traceable to wages, taxes and premiums. EOR fees reward country-correct calculation in many countries at once. My rule: every amount a provider collects, holds or pays on a client's behalf is a liability with a payee and a due date before it is a money movement, and every money movement names the liabilities it satisfies, so float income, the client's bill and the client's tax account all read from the same rows.

## The Life of a Pay Run

The example is invented: a company in a state with no income tax runs one employer, with 40 employees paid biweekly, and its provider debits four business days before the check date. The pay period runs Sunday, November 1 through Saturday, November 14, 2026, and the check date is Friday, November 20.

**Time capture.** Hourly employees punch in and out through the period; each punch becomes a time entry with its source device and location, and any edit keeps the original ([Temporal Data](/docs/database/temporal-data#recorded-time-and-corrections)). Salaried employees have no entries unless they take leave. At period end, managers approve timesheets; an approved timesheet locks the hours for the run. The Workweek & the Time Record covers what counts as hours worked.

**Preview and approval.** On Monday, November 16, the payroll administrator opens a draft pay run, reviews the preview (new hires, terminations, rate changes, unusual hours, negative nets) and approves it before the provider's cutoff. Approval locks the inputs; after it, a change is a correction or an off-cycle run, not an edit. Providers publish their deadlines as part of the product: Gusto's payroll speeds ask partners to "Run payroll by 4pm PT," and for a Friday check date a 4-day payroll debits the company on Monday, a 2-day payroll on Wednesday and a next-day payroll on Thursday. Check collects every payroll whose `approval_deadline` is that day at 5pm PT and starts the employer debit, which can take up to three business days to clear.

**Calculation.** The engine computes each statement in a fixed order: earnings (regular, overtime at the regular rate, bonuses, imputed income), pre-tax deductions, taxes by jurisdiction, post-tax deductions, garnishments limited by disposable earnings, then net pay and how it is split across accounts. For the run, totals of my own invention: gross pay $160,000.00; pre-tax 401(k) deferrals of $6,400.00 and Section 125 medical premiums of $4,800.00. A 401(k) deferral is excluded from income tax withholding and box 1 wages but "included as wages subject to withholding for Social Security and Medicare taxes," while most cafeteria plan benefits aren't subject to income tax withholding, Social Security or Medicare. So Social Security and Medicare wages are $155,200.00, income tax wages $148,800.00, and with federal income tax withheld from the Pub 15-T tables of, say, $14,880.00:

| Line | Employee | Employer |
| --- | --- | --- |
| Social Security, 6.2% of $155,200.00 | $9,622.40 | $9,622.40 |
| Medicare, 1.45% of $155,200.00 | $2,250.40 | $2,250.40 |
| Federal income tax withheld | $14,880.00 | |
| 401(k) and Section 125 deductions | $11,200.00 | |
| Net pay | $122,047.20 | |

FUTA adds nothing this late in the year: it applies to the first $7,000 paid to each employee, which every one of them passed months ago. Gross-to-Net, Step by Step works one statement through every step.

**Funding.** The provider debits the employer for what it will pay out on the employer's behalf: net pay of $122,047.20, federal taxes of $38,625.60 (the withholding plus both halves of FICA) and the 401(k) deferrals of $6,400.00, $167,072.80 in all, on Monday for a Friday check date. The Section 125 premiums stay with the employer, which pays its carrier's invoice. The 4-day schedule exists so the provider sees most debit returns before it pays out; on faster schedules the provider pays employees against a debit that hasn't cleared, which Gusto describes as "initiating the transfer of funds from Gusto to the employee before we have confirmed a cleared debit," and which makes speed a credit decision. Funding a Payroll and When the Debit Fails cover the underwriting and the recovery; [Payments](/books/payments/ach#returns-when-money-is-really-yours) covers return windows as the rail defines them.

**Net pay.** Once the employer's funds are in, the provider sends direct deposit credits on Thursday, November 19 to settle on the check date; Check, for example, says "Once Check has the employer's cash requirement, we submit ACH transactions to send net pay." Pay statements are published on Friday, November 20. A returned credit (a closed account, a typo in a new account number) comes back days later, and the payroll becomes partially paid until the worker is paid another way. Direct Deposit, Pay Cards & Checks covers splits, prenotes and pay cards.

**Liabilities.** Approval created a liability for every third party the run owes: the IRS for $38,625.60, due on the employer's deposit schedule; the state unemployment agency for the quarter's contributions, due with its quarterly report; the 401(k) plan for $6,400.00, due under the DOL's timing rule for participant contributions (401(k) Deferrals & Remittance covers it); and any child support order's disbursement unit, which must receive the withheld amount "within 7 business days after the date the amount would (but for this subsection) have been paid or credited to the employee."

**Deposits.** The employer is a semiweekly depositor (see [The Life of a Payroll Tax Dollar](#the-life-of-a-payroll-tax-dollar)), so taxes on wages paid on a Friday are due by the following Wednesday: November 25, the day before Thanksgiving. The provider pays through EFTPS under the employer's EIN, and the payment's confirmation number goes on the remittance.

**Quarterly and annual filings.** After the quarter, the provider files Form 941 for October through December, due by the last day of the month after the quarter; January 31, 2027 is a Sunday, so the return is due February 1, 2027. A semiweekly depositor attaches Schedule B with each day's liability. The state quarterly wage report and contribution return list every employee's wages. After the year, the 2026 W-2s and the W-3 are due to employees and the SSA on February 1, 2027, with Form 940 for FUTA due the same day.

Across the life, one pay run is a set of approved timesheets, a draft and an approval, a statement per worker with its lines, an employer debit, a credit per account, a set of liabilities with due dates, a deposit per agency, a line on four quarterly returns, and a box on every W-2.

## The Life of a Payroll Tax Dollar

**Withheld.** Take one dollar of federal income tax withheld from an employee's pay on November 20, 2026. It is the employee's money, held by the employer for the government: income tax withheld and the employee's share of Social Security and Medicare are trust fund taxes, and if they aren't withheld, deposited or paid, the trust fund recovery penalty "is 100% of the unpaid trust fund tax," assessable against the people responsible for paying it over who acted willfully. That is why a business owner can be personally liable for a payroll provider's failure to deposit, and why the dollar is never the provider's to lend.

**Impounded.** The provider collected the dollar with the employer's debit on November 16 and holds it in a client trust account. ADP describes ADP Trust Bank as "the sole trustee of ADP Client Trust, our grantor trust which holds U.S. client funds." The dollar earns interest for the provider until it is deposited (Client Funds & Impound Accounts).

**Scheduled.** When the dollar is due depends on the employer's history, not this payroll. The deposit schedule for 2026 comes from the lookback period, July 1, 2024 through June 30, 2025: an employer that reported "$50,000 or less of taxes for the lookback period" deposits monthly, by the 15th of the following month; above that, it deposits semiweekly. Our invented employer's federal taxes run about $38,600 a run, about $250,000 a quarter, so it is semiweekly. A semiweekly depositor deposits taxes "for payments made on Wednesday, Thursday, and/or Friday by the following Wednesday" and "for payments made on Saturday, Sunday, Monday, and/or Tuesday by the following Friday." Any day on which accumulated taxes reach $100,000 forces a deposit "by the next business day," and a monthly depositor that hits it becomes semiweekly. A due date on a weekend or legal holiday is timely "by the close of the next business day." [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns) covers the rules as data.

**Deposited.** "You must use EFT to make all federal tax deposits," and in practice that means EFTPS. On Wednesday, November 25, 2026 the dollar leaves the trust account in the employer's deposit. A late deposit costs 2% if 1 to 5 days late, 5% at 6 to 15 days, 10% at 16 or more days and 15% for amounts still unpaid more than 10 days after the first notice. The IRS tells employers who outsource to "register on the EFTPS system to get their own PIN and use this PIN to periodically verify payments," because "The employer is ultimately responsible for the deposit and payment of federal tax liabilities," and "A red flag should go up the first time a service provider misses a payment." When Payroll Providers Fail covers what happens when nobody checks.

**Reported quarterly.** The dollar appears on the fourth-quarter Form 941 as part of the federal income tax withheld, and on Schedule B in the November 20 liability, due February 1, 2027.

**Reported annually.** It appears again in box 2 of the employee's 2026 W-2, filed with the SSA with the W-3 transmittal by February 1, 2027 and furnished to the employee the same day. The W-2 instructions say the amounts on the W-3 and on related employment tax forms such as Form 941 should agree, and "If there are differences, you may be contacted by the IRS and SSA."

**Reconciled.** The IRS and SSA run that comparison as the Combined Annual Wage Reporting program, which "compares the Federal Income Tax (FIT) withheld" and the "Medicare wages, Social Security wages, and Social Security tips" reported on Forms 94X with "the processed totals of the Forms W-2" sent to SSA. When a difference survives review, the IRS sends Letter 99C, and the employer has 45 days to answer before the case closes with the additional tax. Meanwhile the SSA posts the Social Security wages to the worker's earnings record, and the employee claims the dollar as a payment on their own return. [Year-End, W-2s & Wage Reporting](/books/workforce/year-end-and-w2s) and [Tax Notices, Amendments & Agency Accounts](/books/workforce/tax-notices-and-agency-accounts) cover the reconciliation and the letters.

Across the life, one tax dollar is a pay statement line, a liability with a computed due date, an impounded balance, an EFTPS deposit with a confirmation number, a Schedule B day, a 941 line, a W-2 box, a CAWR match and a credit on someone's tax return. If any two of those disagree, a notice follows.

## The Life of a Hire

**Offer.** A candidate accepts an offer on Wednesday, October 28, 2026 to start on Monday, November 2 as an hourly, nonexempt employee at the invented employer above. The offer letter is a document with a version and a signature; the job assignment it implies (title, manager, work location, FLSA status, pay basis, standard hours) is effective-dated from November 2. Recruiting, ATS & AI in Hiring covers the steps before the offer.

**Form I-9.** "The employee must complete Section 1 no later than the employee's first day of employment," Monday, November 2, and the employer completes Section 2, examining the documents, within three business days of the first day, by Thursday, November 5. The current edition is dated 01/20/25. If the employer uses E-Verify, it must create the case "no later than the third business day after the employee starts work for pay," also November 5, and close it whatever the result (Employment Authorized, Tentative Nonconfirmation and the rest). The I-9 must be kept "for three years after the date of hire" or "for one year after employment is terminated, whichever is later." Onboarding: I-9, E-Verify & New Hire Reporting covers the steps.

**Form W-4.** Employers "Ask all new employees to give you a signed Form W-4 when they start work"; a new hire who doesn't furnish one is withheld as if they checked single or married filing separately with nothing in Steps 2 through 4. The W-4 becomes a tax election effective from its receipt, with the form kept as its source document. Federal Withholding & the W-4 covers the calculation.

**New hire report.** The employer, or its provider, reports the employee's name, address, SSN and start date with the employer's name, address and EIN to the state directory of new hires "not later than 20 days after the date the employer hires the employee," by November 22 at the latest and sooner where the state sets a shorter deadline. An employer reporting electronically in two or more states may designate one. Child support agencies match these reports against open cases, which is how an income withholding order finds a new employer weeks after a hire (Child Support Withholding).

**Direct deposit and first pay.** The employee adds a bank account, which is verified before the first credit. The first paycheck, on Friday, November 20, covers the hours worked from November 2 to 14.

**Benefits window.** The plan's new hire window (plan-defined; say 30 days) opens on the first day, with coverage on the first of the month after the waiting period; a group health plan "must not apply any waiting period that exceeds 90 days." The employee's elections become benefit enrollments with coverage tiers and dependents, and the premiums become pre-tax deductions on the next pay run. Enrollment & Life Events covers the rules; [Health Tech](/books/health-tech/payer-operations#enrollment-and-membership) covers what the carrier does with the enrollment.

**Changes.** Over the following year the employee gets a raise (a new pay rate from its effective date, retro pay if the change is backdated), moves to a new home address (a new resident jurisdiction for state and local tax), and has a child in March 2027. The birth is a life event: HIPAA special enrollment gives "a period of at least 30 days after the date of the marriage, birth, adoption, or placement for adoption" to enroll, and coverage for a birth begins "on the date of birth," so the deduction change may reach back to a past pay period.

**Termination and final pay.** The employer discharges the employee on Friday, August 13, 2027. Federal law doesn't require immediate final pay, and the DOL says "Employers are not required by federal law to give former employees their final paycheck immediately," but states do: had the employee worked in California, a discharged employee "must be paid all of his or her wages, including accrued vacation, immediately at the time of termination," with a waiting time penalty of a day's wages for each day late, up to 30 days. The separation fans out: final pay and any PTO payout, benefit end dates, access removal (Workplace & Collaboration covers [joiner, mover and leaver](/books/workplace-and-collaboration/provisioning-and-scim#joiner-mover-leaver) in identity), and COBRA. Pay Frequency, Pay Statements & Final Pay and Terminations, Offboarding & WARN cover both.

**COBRA.** With 40 employees, the employer is above COBRA's threshold of 20 employees "on more than 50 percent of their typical business days in the previous calendar year." It "must notify the plan within 30 days" of the termination; the plan sends an election notice "within 14 days" of receiving it; the former employee has "at least 60 days" to elect, at least 45 days after electing to pay the first premium, and a premium of no more than "102 percent of the total cost to the plan," for up to 18 months after a termination. COBRA & State Continuation covers the clocks.

**W-2 and retention.** The 2027 W-2 reflects the year's wages up to the final paycheck and is furnished by the January 31 deadline in 2028 (the 2026 forms fall on February 1, 2027 only because January 31 is a Sunday). The I-9 is kept until the later of three years after hire (November 2, 2029) and one year after termination (August 13, 2028): November 2, 2029. If the employee is rehired, a new employment starts on the same worker, and the year's Social Security wage base and accumulators continue.

Across the life, one hire is a person, a worker, an employment, a job assignment with its history, an I-9 and an E-Verify case, a W-4, a new hire report, a bank account, benefit enrollments and life events, dozens of pay statements, a separation with its final pay, a COBRA event, a W-2 and a set of documents each with its retention date.

## The Core Data Model

Every company in this volume converges on the same concepts under different names: a provider's client, account or company is the company; a legal entity, FEIN or tax entity is the employer; an employee, team member or worksite employee is a worker; a payroll, check run or pay cycle is a pay run; a pay stub, check or earnings statement is a pay statement. The volume uses one set of names, and every later chapter's How to Build It extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **company** | `companies` | The provider's customer: one account and one contract, with one or more employers under it |
| **employer** | `employers` | A legal entity with an EIN that employs people and files returns, with its deposit schedule, return type and PEO relationship |
| **tax jurisdiction** | `tax_jurisdictions` | Federal, state, county, city, school district or transit district, with its code scheme |
| **work location** | `work_locations` | An address where people work (an office, a site, a remote employee's home) and the jurisdictions it falls in, by date |
| **tax registration** | `tax_registrations` | An employer's account with one jurisdiction for one tax: number, rate, deposit frequency, dates and status |
| **person and address** | `persons`, `person_addresses` | A human being with a tokenized SSN or ITIN, date of birth, and home address history |
| **worker** | `workers` | A person working for one employer, as an employee or a contractor |
| **employment** | `employments` | One stint from hire to termination; a rehire is a new row on the same worker |
| **job assignment** | `job_assignments` | Title, department, manager, work location, FLSA status, pay basis and standard hours, effective-dated |
| **pay rate** | `pay_rates` | An effective-dated rate for an assignment and earning code |
| **pay schedule and period** | `pay_schedules`, `pay_periods` | The frequency, anchor and check date rule, and each period with its check date |
| **tax election** | `tax_elections` | A W-4 or state form's elections, effective-dated, with the source document |
| **worker tax location** | `worker_tax_locations` | Resident and work jurisdictions by date, with reciprocity and nonresident certificates |
| **bank account and distribution** | `bank_accounts`, `pay_distributions` | A tokenized account with its verification status, and how net pay splits across accounts |
| **time entry and timesheet** | `time_entries`, `timesheets` | Punches and hours, and the period's approval |
| **pay item type and codes** | `pay_item_types`, `earning_codes`, `deduction_codes` | The volume's catalog of pay items, and each company's codes mapped to it |
| **taxability rule** | `taxability_rules` | Pay item type by tax by jurisdiction: subject, exempt or reported only, effective-dated |
| **deduction election** | `deduction_elections` | A worker's deduction: amount or percent, goal or limit, arrears rule, dates, and the enrollment or order behind it |
| **pay run and event** | `pay_runs`, `pay_run_events` | One run of one employer's payroll for one period and type, and every state change it went through |
| **pay statement and line** | `pay_statements`, `pay_statement_lines` | One statement per worker per run, and each earning, deduction, tax and memo on it |
| **accumulator** | `accumulators` | Quarter-to-date and year-to-date totals per worker, employer and key, derived from statement lines |
| **liability and remittance** | `liabilities`, `remittances` | What a run owes each third party and when, and the payments that satisfy it |
| **money movement** | `money_movements` | Every movement of funds: client debit, net pay, tax payment, garnishment, benefit, refund |
| **filing and line** | `filings`, `filing_lines` | A return or report for one form, jurisdiction and period, and the per-worker records in it |
| **garnishment order** | `garnishment_orders` | A child support order, levy, administrative wage garnishment or creditor order, with its limits and payee |
| **leave** | `leave_policies`, `leave_ledger`, `leave_cases` | Policies, the accrual and usage ledger, and FMLA and state program cases |
| **benefits** | `benefit_plans`, `benefit_enrollments`, `dependents`, `life_events` | Plans, a worker's enrollments by tier and dependents, and the events that open changes |
| **document and notice** | `documents`, `notices` | Forms, letters and statements with their versions and retention, and agency and carrier notices received |
| **audit event** | `audit_events` | Who changed what and when, with before and after, on every effective-dated table |

Seven splits matter in every chapter:

- **Employer on every row that files or pays.** Registrations, pay runs, liabilities, remittances and filings carry `employer_id`, because each EIN is its own taxpayer with its own deposit schedule and returns. A company is a billing and permissions boundary; the employer is the legal one.
- **Effective dates on everything a past calculation read.** Job assignments, pay rates, tax elections, tax locations, registrations, taxability rules, deduction elections and enrollments are `valid_during` ranges, closed-open, never overwritten ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)). A retro calculation reads them as of the old period; a future-dated raise sits in the table until its date.
- **Statement lines are the truth; accumulators are a view.** Year-to-date wages, wage base crossings, deferral limits and W-2 boxes are sums over `pay_statement_lines`. A correction is a new statement that reverses or adjusts, never an edit to a paid one.
- **Integer cents for amounts, decimals for rates.** Every amount is a `BIGINT` count of cents ([Integer Minor Units](/docs/money/amounts#integer-minor-units)); hourly rates, tax rates and percentages carry their own precision and every product is rounded once, at the line, by a stated rule ([Rounding](/docs/money/amounts#rounding)).
- **Calculation, liability, money and filing are separate records.** A pay run computes; a liability says what is owed, to whom, by when; a money movement moves cash; a remittance pays an agency; a filing reports. Each has its own status, so a run can be paid while a deposit is late and a return is rejected.
- **Pay item type, not company code, drives tax.** Companies name their codes as they like; each maps to one `pay_item_types` row, and `taxability_rules` decide its treatment for each tax and jurisdiction from the type. A new company never needs a new tax rule.
- **Person versus worker versus employment.** Identity and the SSN live on the person, employer-specific state on the worker, and each stint on the employment, so a rehire, a transfer between employers in one company and a contractor who becomes an employee are rows, not migrations.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer cents; columns each chapter owns are added there:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE companies (                   -- the provider's customer: one account, one contract
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  name                TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'suspended',
                        'terminated')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employers (                   -- a legal entity with an EIN that files returns
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  legal_name          TEXT NOT NULL,
  trade_name          TEXT,
  ein                 CHAR(9) NOT NULL UNIQUE,
  entity_type         TEXT NOT NULL CHECK (entity_type IN ('sole_proprietorship', 'partnership',
                        'llc', 'c_corporation', 's_corporation', 'nonprofit', 'government',
                        'household', 'other')),
  federal_return      TEXT NOT NULL CHECK (federal_return IN ('941', '944', '943')),
  deposit_schedule    TEXT NOT NULL CHECK (deposit_schedule IN ('monthly', 'semiweekly')),
  deposit_schedule_year SMALLINT NOT NULL,   -- the year the lookback determination applies to
  peo_relationship    TEXT NOT NULL DEFAULT 'none' CHECK (peo_relationship IN ('none',
                        'cpeo_customer', 'peo_client', 'section_3504_client')),
  status              TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'inactive',
                        'closed'))
);

CREATE TABLE tax_jurisdictions (           -- every level that taxes wages or takes reports
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  level               TEXT NOT NULL CHECK (level IN ('federal', 'state', 'county', 'city',
                        'school_district', 'transit_district', 'other_local')),
  code                TEXT NOT NULL,         -- 'US', 'US-PA', a PSD code, a GNIS ID, ...
  code_scheme         TEXT NOT NULL CHECK (code_scheme IN ('iso_3166_2', 'fips', 'gnis', 'psd',
                        'vendor')),
  name                TEXT NOT NULL,
  parent_id           UUID REFERENCES tax_jurisdictions (id),
  UNIQUE (code_scheme, code)
);

CREATE TABLE work_locations (              -- an office, site or remote employee's home
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('office', 'site', 'remote_home', 'client_site')),
  address             JSONB NOT NULL,        -- normalized street, city, state, ZIP+4
  jurisdiction_ids    UUID[] NOT NULL,       -- every tax_jurisdictions row the address falls in
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE tax_registrations (           -- employer x jurisdiction x tax type
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  tax_type            TEXT NOT NULL CHECK (tax_type IN ('income_withholding', 'fica', 'futa',
                        'sui', 'sdi', 'paid_leave', 'local_income', 'transit', 'other')),
  account_number      TEXT,                  -- null while pending
  rate                NUMERIC(8, 6),         -- employer rate where the agency assigns one
  deposit_frequency   TEXT,                  -- 'semiweekly', 'monthly', 'quarterly', ...
  status              TEXT NOT NULL CHECK (status IN ('pending', 'active', 'closed')),
  source_notice_id    UUID,                  -- the rate notice that set it (notices)
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (employer_id WITH =, jurisdiction_id WITH =, tax_type WITH =,
    valid_during WITH &&)
);

CREATE TABLE persons (                     -- a human being, across employers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name          TEXT NOT NULL,         -- as on the Social Security card
  tin_kind            TEXT NOT NULL CHECK (tin_kind IN ('ssn', 'itin', 'none')),
  tin_token           TEXT,                  -- vaulted; never the number itself
  tin_last4           CHAR(4),
  date_of_birth       DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((tin_kind = 'none') = (tin_token IS NULL))
);

CREATE TABLE person_addresses (            -- home address history: residence drives tax
  person_id           UUID NOT NULL REFERENCES persons (id),
  address             JSONB NOT NULL,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (person_id WITH =, valid_during WITH &&)
);

CREATE TABLE workers (                     -- a person working for one employer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  person_id           UUID NOT NULL REFERENCES persons (id),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_type         TEXT NOT NULL CHECK (worker_type IN ('employee', 'contractor')),
  worker_number       TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'on_leave',
                        'terminated')),
  UNIQUE (employer_id, worker_number),
  UNIQUE (employer_id, person_id, worker_type)
);

CREATE TABLE employments (                 -- one stint, hire to termination
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  hire_date           DATE NOT NULL,
  original_hire_date  DATE NOT NULL,         -- the first hire, for service and benefits
  termination_date    DATE,
  termination_reason  TEXT CHECK (termination_reason IN ('voluntary', 'involuntary', 'layoff',
                        'retirement', 'death', 'end_of_assignment', 'other')),
  employment_type     TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time',
                        'seasonal', 'temporary')),
  union_code          TEXT,
  CHECK (termination_date IS NULL OR termination_date >= hire_date)
);

CREATE TABLE job_assignments (             -- what the employment is, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employment_id       UUID NOT NULL REFERENCES employments (id),
  title               TEXT NOT NULL,
  department          TEXT,
  manager_worker_id   UUID REFERENCES workers (id),
  work_location_id    UUID NOT NULL REFERENCES work_locations (id),
  flsa_status         TEXT NOT NULL CHECK (flsa_status IN ('exempt', 'nonexempt')),
  pay_basis           TEXT NOT NULL CHECK (pay_basis IN ('hourly', 'salary', 'piece',
                        'commission')),
  standard_hours      NUMERIC(5, 2),         -- per week
  is_primary          BOOLEAN NOT NULL DEFAULT TRUE,
  valid_during        DATERANGE NOT NULL     -- effective_from and effective_to as one range
);

CREATE TABLE pay_schedules (               -- how often an employer pays, and when
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  frequency           TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'semimonthly',
                        'monthly')),
  anchor_period_start DATE NOT NULL,         -- the first period's start; the rest follow
  check_date_offset   SMALLINT NOT NULL,     -- business days after period end
  holiday_rule        TEXT NOT NULL CHECK (holiday_rule IN ('previous_business_day',
                        'next_business_day'))
);

CREATE TABLE pay_periods (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_schedule_id     UUID NOT NULL REFERENCES pay_schedules (id),
  period              DATERANGE NOT NULL,
  check_date          DATE NOT NULL,
  EXCLUDE USING GIST (pay_schedule_id WITH =, period WITH &&)
);

CREATE TABLE pay_item_types (              -- the volume's catalog: what a pay item is
  code                TEXT PRIMARY KEY,      -- 'regular', 'overtime', 'bonus', 'tips_cash',
                                             -- 'gtl_imputed', 'pretax_401k', 'roth_401k',
                                             -- 'section125_medical', 'child_support', ...
  kind                TEXT NOT NULL CHECK (kind IN ('earning', 'deduction', 'employee_tax',
                        'employer_tax', 'reimbursement', 'memo')),
  supplemental        BOOLEAN NOT NULL DEFAULT FALSE,
  description         TEXT NOT NULL
);

CREATE TABLE earning_codes (               -- a company's names, mapped to the catalog
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  code                TEXT NOT NULL,
  name                TEXT NOT NULL,
  pay_item_type       TEXT NOT NULL REFERENCES pay_item_types (code),
  UNIQUE (company_id, code)
);

CREATE TABLE deduction_codes (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  code                TEXT NOT NULL,
  name                TEXT NOT NULL,
  pay_item_type       TEXT NOT NULL REFERENCES pay_item_types (code),
  payee_kind          TEXT NOT NULL CHECK (payee_kind IN ('employer', 'carrier', 'plan',
                        'garnishment_payee', 'union', 'other')),
  UNIQUE (company_id, code)
);

CREATE TABLE pay_rates (                   -- effective-dated rates per assignment and code
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  job_assignment_id   UUID NOT NULL REFERENCES job_assignments (id),
  earning_code_id     UUID NOT NULL REFERENCES earning_codes (id),
  rate_unit           TEXT NOT NULL CHECK (rate_unit IN ('hour', 'year', 'period', 'piece',
                        'percent')),
  rate                NUMERIC(14, 4) NOT NULL,  -- dollars; rates may carry fractions of a cent
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (job_assignment_id WITH =, earning_code_id WITH =, valid_during WITH &&)
);

CREATE TABLE tax_elections (               -- a W-4 or state form, as the worker completed it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  form                TEXT NOT NULL,         -- 'w4_2020_plus', 'w4_legacy', 'state_form', ...
  filing_status       TEXT,                  -- 'single_or_mfs', 'mfj', 'head_of_household', ...
  multiple_jobs       BOOLEAN NOT NULL DEFAULT FALSE,   -- 2020+ Step 2 checkbox
  dependents_amount   BIGINT NOT NULL DEFAULT 0,        -- Step 3
  other_income        BIGINT NOT NULL DEFAULT 0,        -- Step 4(a), annual
  deductions          BIGINT NOT NULL DEFAULT 0,        -- Step 4(b), annual
  extra_withholding   BIGINT NOT NULL DEFAULT 0,        -- Step 4(c), per period
  allowances          SMALLINT,              -- legacy and state forms
  exempt              BOOLEAN NOT NULL DEFAULT FALSE,
  nonresident_alien   BOOLEAN NOT NULL DEFAULT FALSE,
  document_id         UUID,                  -- the signed form (documents)
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (worker_id WITH =, jurisdiction_id WITH =, valid_during WITH &&)
);

CREATE TABLE worker_tax_locations (        -- where the worker lives and works, for tax
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  role                TEXT NOT NULL CHECK (role IN ('resident', 'work')),
  certificate_document_id UUID,              -- reciprocity or nonresident certificate
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE bank_accounts (               -- an employer's funding account or a worker's deposit account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID REFERENCES employers (id),
  worker_id           UUID REFERENCES workers (id),
  routing_number      CHAR(9) NOT NULL,
  account_token       TEXT NOT NULL,         -- vaulted; never the account number
  account_last4       CHAR(4) NOT NULL,
  account_type        TEXT NOT NULL CHECK (account_type IN ('checking', 'savings')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('unverified', 'prenote_sent',
                        'verified', 'failed', 'closed')),
  verification_method TEXT,                  -- 'prenote', 'microdeposits', 'instant', ...
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((employer_id IS NULL) <> (worker_id IS NULL))
);

CREATE TABLE pay_distributions (           -- how net pay splits
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  method              TEXT NOT NULL CHECK (method IN ('direct_deposit', 'pay_card', 'check')),
  bank_account_id     UUID REFERENCES bank_accounts (id),
  split_kind          TEXT NOT NULL CHECK (split_kind IN ('fixed', 'percent', 'remainder')),
  amount              BIGINT,                -- for 'fixed'
  percent             NUMERIC(5, 2),         -- for 'percent'
  priority            SMALLINT NOT NULL,     -- applied in order; 'remainder' last
  prenote_status      TEXT CHECK (prenote_status IN ('pending', 'cleared', 'returned')),
  valid_during        DATERANGE NOT NULL,
  CHECK ((method = 'check') = (bank_account_id IS NULL))
);

CREATE TABLE time_entries (                -- punches and hours as recorded
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  job_assignment_id   UUID NOT NULL REFERENCES job_assignments (id),
  earning_code_id     UUID NOT NULL REFERENCES earning_codes (id),
  work_location_id    UUID REFERENCES work_locations (id),
  started_at          TIMESTAMPTZ,
  ended_at            TIMESTAMPTZ,
  hours               NUMERIC(7, 2) NOT NULL,
  workweek_start      DATE NOT NULL,         -- the fixed workweek this entry counts toward
  source              TEXT NOT NULL CHECK (source IN ('clock', 'mobile', 'kiosk', 'web',
                        'manual', 'import')),
  source_device       TEXT,
  replaces_entry_id   UUID REFERENCES time_entries (id),  -- an edit is a new row
  created_by          TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ended_at IS NULL OR ended_at > started_at)
);

CREATE TABLE timesheets (                  -- the period's approval
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  pay_period_id       UUID NOT NULL REFERENCES pay_periods (id),
  status              TEXT NOT NULL CHECK (status IN ('open', 'submitted', 'approved',
                        'rejected', 'locked')),
  approved_by         TEXT,
  approved_at         TIMESTAMPTZ,
  UNIQUE (worker_id, pay_period_id)
);

CREATE TABLE taxability_rules (            -- the heart of gross-to-net
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_item_type       TEXT NOT NULL REFERENCES pay_item_types (code),
  tax_type            TEXT NOT NULL,         -- 'fit', 'social_security', 'medicare', 'futa',
                                             -- 'sit', 'sui', 'sdi', 'local_income', ...
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  treatment           TEXT NOT NULL CHECK (treatment IN ('subject', 'exempt', 'reported_only')),
  source_ref          TEXT NOT NULL,         -- the publication, statute or notice
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (pay_item_type WITH =, tax_type WITH =, jurisdiction_id WITH =,
    valid_during WITH &&)
);

CREATE TABLE deduction_elections (         -- a worker's deduction and what's behind it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  deduction_code_id   UUID NOT NULL REFERENCES deduction_codes (id),
  amount              BIGINT,                -- per period
  percent             NUMERIC(6, 3),         -- of a stated base
  pre_tax             BOOLEAN NOT NULL,      -- as elected; taxability_rules decide per tax
  goal_amount         BIGINT,                -- stop when reached (a loan, an advance)
  annual_limit        BIGINT,                -- a plan or statutory cap enforced per year
  arrears_rule        TEXT NOT NULL DEFAULT 'none' CHECK (arrears_rule IN ('none',
                        'next_period', 'spread')),
  benefit_enrollment_id UUID,                -- benefit_enrollments
  garnishment_order_id  UUID,                -- garnishment_orders
  valid_during        DATERANGE NOT NULL,
  CHECK ((amount IS NULL) <> (percent IS NULL))
);

CREATE TABLE pay_runs (                    -- one run of one employer's payroll
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pay_period_id       UUID REFERENCES pay_periods (id),   -- null for some off-cycle runs
  run_type            TEXT NOT NULL CHECK (run_type IN ('regular', 'off_cycle', 'bonus',
                        'correction', 'void', 'reversal', 'third_party_sick')),
  check_date          DATE NOT NULL,
  approval_deadline_at TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'calculating', 'calculated',
                        'approved', 'funding', 'funded', 'paying', 'paid', 'canceled', 'failed')),
  approved_by         TEXT,
  approved_at         TIMESTAMPTZ,
  idempotency_key     TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employer_id, idempotency_key),
  CHECK ((status IN ('draft', 'calculating', 'calculated', 'canceled')) OR approved_at IS NOT NULL)
);

CREATE TABLE pay_run_events (              -- every state change, append-only
  pay_run_id          UUID NOT NULL REFERENCES pay_runs (id),
  seq                 INT NOT NULL,
  from_status         TEXT,
  to_status           TEXT NOT NULL,
  actor               TEXT NOT NULL,         -- a user, the scheduler, a bank file, a webhook
  detail              JSONB NOT NULL DEFAULT '{}',
  occurred_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (pay_run_id, seq)
);

CREATE TABLE pay_statements (              -- one per worker per run; never edited once paid
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_run_id          UUID NOT NULL REFERENCES pay_runs (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  employment_id       UUID NOT NULL REFERENCES employments (id),
  statement_number    TEXT NOT NULL,
  check_date          DATE NOT NULL,
  gross               BIGINT NOT NULL,
  net                 BIGINT NOT NULL,
  reverses_statement_id UUID REFERENCES pay_statements (id),
  UNIQUE (pay_run_id, worker_id),
  UNIQUE (statement_number)
);

CREATE TABLE liabilities (                 -- what a run owes a third party, and by when
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pay_run_id          UUID NOT NULL REFERENCES pay_runs (id),
  payee_type          TEXT NOT NULL CHECK (payee_type IN ('agency', 'carrier', 'plan',
                        'garnishment_payee', 'employee')),
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),   -- for agencies
  payee_ref           TEXT,                  -- a carrier, plan, SDU or order payee
  tax_type            TEXT,                  -- for agencies: 'federal_941', 'futa', 'sui', ...
  amount              BIGINT NOT NULL,
  due_on              DATE NOT NULL,         -- computed from the deposit rule, never typed
  rule_ref            TEXT NOT NULL,         -- which rule set the date
  status              TEXT NOT NULL CHECK (status IN ('open', 'impounded', 'remitted',
                        'reconciled', 'canceled')),
  remittance_id       UUID                   -- set when paid (remittances)
);

CREATE TABLE pay_statement_lines (         -- every earning, deduction, tax and memo
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_statement_id    UUID NOT NULL REFERENCES pay_statements (id),
  line_type           TEXT NOT NULL CHECK (line_type IN ('earning', 'deduction', 'employee_tax',
                        'employer_tax', 'reimbursement', 'memo')),
  pay_item_type       TEXT NOT NULL REFERENCES pay_item_types (code),
  earning_code_id     UUID REFERENCES earning_codes (id),
  deduction_code_id   UUID REFERENCES deduction_codes (id),
  tax_type            TEXT,                  -- for tax lines
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),
  hours               NUMERIC(7, 2),
  rate                NUMERIC(14, 4),
  amount              BIGINT NOT NULL,       -- cents; negative on a reversal
  subject_wages       BIGINT,                -- tax lines: wages subject before limits
  taxable_wages       BIGINT,                -- tax lines: wages taxed after the wage base
  liability_id        UUID REFERENCES liabilities (id),
  work_period         DATERANGE              -- the dates the line was earned, for retro
);

CREATE MATERIALIZED VIEW accumulators AS   -- QTD and YTD, derived; never the source of truth
SELECT s.worker_id,
       r.employer_id,
       l.pay_item_type || ':' || COALESCE(l.tax_type, '') || ':'
         || COALESCE(l.jurisdiction_id::TEXT, '')            AS key,
       date_trunc('quarter', s.check_date)::DATE             AS quarter_start,
       EXTRACT(YEAR FROM s.check_date)::INT                  AS tax_year,
       SUM(l.amount)                                         AS amount,
       SUM(l.taxable_wages)                                  AS taxable_wages,
       SUM(l.subject_wages)                                  AS subject_wages
FROM pay_statement_lines l
JOIN pay_statements s ON s.id = l.pay_statement_id
JOIN pay_runs r ON r.id = s.pay_run_id
WHERE r.status = 'paid'
GROUP BY 1, 2, 3, 4, 5;

CREATE TABLE remittances (                 -- a payment to an agency, carrier, plan or payee
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  payee_type          TEXT NOT NULL,
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),
  payee_ref           TEXT,
  method              TEXT NOT NULL CHECK (method IN ('eftps', 'state_ach_credit',
                        'state_ach_debit', 'ach', 'check', 'wire')),
  amount              BIGINT NOT NULL,
  initiated_on        DATE NOT NULL,
  settlement_date     DATE,
  confirmation_number TEXT,                  -- the EFTPS EFT number or agency reference
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'accepted',
                        'rejected', 'returned')),
  idempotency_key     TEXT NOT NULL UNIQUE
);

ALTER TABLE liabilities ADD FOREIGN KEY (remittance_id) REFERENCES remittances (id);

CREATE TABLE money_movements (             -- every movement of funds
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pay_run_id          UUID REFERENCES pay_runs (id),
  remittance_id       UUID REFERENCES remittances (id),
  pay_statement_id    UUID REFERENCES pay_statements (id),  -- for a net pay credit
  purpose             TEXT NOT NULL CHECK (purpose IN ('client_debit', 'net_pay', 'tax_payment',
                        'garnishment', 'benefit', 'refund', 'recovery')),
  rail                TEXT NOT NULL CHECK (rail IN ('ach', 'same_day_ach', 'wire', 'rtp',
                        'check', 'card')),
  direction           TEXT NOT NULL CHECK (direction IN ('debit', 'credit')),
  bank_account_id     UUID REFERENCES bank_accounts (id),
  amount              BIGINT NOT NULL CHECK (amount > 0),
  effective_date      DATE NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'settled', 'returned',
                        'failed', 'canceled')),
  return_code         TEXT,                  -- 'R01', 'R02', ... as Payments defines them
  trace_number        TEXT,
  idempotency_key     TEXT NOT NULL UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE filings (                     -- one return or report for one form and period
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  form                TEXT NOT NULL,         -- '941', '940', 'w2_w3', 'state_withholding',
                                             -- 'sui_wage_report', '1094c', 'new_hire', ...
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  period              DATERANGE NOT NULL,
  due_on              DATE NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'accepted', 'rejected',
                        'amended')),
  amends_filing_id    UUID REFERENCES filings (id),
  totals              JSONB NOT NULL DEFAULT '{}',   -- the return's lines as filed
  submitted_at        TIMESTAMPTZ,
  acknowledgment      TEXT
);

CREATE TABLE filing_lines (                -- per-worker records inside a filing
  filing_id           UUID NOT NULL REFERENCES filings (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  record              JSONB NOT NULL,        -- the worker's boxes or fields as filed
  PRIMARY KEY (filing_id, worker_id)
);

CREATE TABLE garnishment_orders (          -- an order to withhold from wages
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  order_type          TEXT NOT NULL CHECK (order_type IN ('child_support', 'tax_levy',
                        'student_loan', 'federal_agency', 'creditor', 'bankruptcy',
                        'state_tax')),
  issuer              TEXT NOT NULL,         -- the agency, court or trustee
  case_number         TEXT NOT NULL,
  received_on         DATE NOT NULL,
  priority            SMALLINT NOT NULL,     -- computed from the order type and date served
  amount_rule         JSONB NOT NULL,        -- fixed per period, percent, arrears, exempt table
  limit_rule          TEXT NOT NULL,         -- 'ccpa_25', 'support_50', 'support_65', 'irs_1494', ...
  payee               TEXT NOT NULL,         -- an SDU, the IRS, a creditor's attorney
  starts_on           DATE NOT NULL,
  stops_on            DATE,
  document_id         UUID                   -- the order as served (documents)
);

CREATE TABLE leave_policies (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('sick', 'vacation', 'pto', 'holiday',
                        'bereavement', 'other')),
  rules               JSONB NOT NULL,        -- accrual rate, caps, carryover, waiting period
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE leave_ledger (                -- balances are sums, never a stored number
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  leave_policy_id     UUID NOT NULL REFERENCES leave_policies (id),
  entry_type          TEXT NOT NULL CHECK (entry_type IN ('accrual', 'usage', 'payout',
                        'adjustment', 'carryover', 'forfeiture')),
  hours               NUMERIC(8, 2) NOT NULL,  -- positive adds, negative uses
  occurred_on         DATE NOT NULL,
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id),
  reason              TEXT
);

CREATE TABLE leave_cases (                 -- FMLA, state program and other protected leave
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  program             TEXT NOT NULL CHECK (program IN ('fmla', 'state_pfml', 'state_disability',
                        'ada_accommodation', 'military', 'company')),
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),
  requested_period    DATERANGE NOT NULL,
  approved_period     DATERANGE,
  intermittent        BOOLEAN NOT NULL DEFAULT FALSE,
  notice_received_on  DATE NOT NULL,         -- the clocks start here
  certification_document_id UUID,
  status              TEXT NOT NULL CHECK (status IN ('requested', 'pending_certification',
                        'approved', 'denied', 'closed'))
);

CREATE TABLE benefit_plans (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('medical', 'dental', 'vision', 'life',
                        'std', 'ltd', 'hsa', 'fsa', 'dependent_care', 'commuter', 'retirement',
                        'other')),
  carrier             TEXT,
  name                TEXT NOT NULL,
  plan_year           DATERANGE NOT NULL
);

CREATE TABLE dependents (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  person_id           UUID NOT NULL REFERENCES persons (id),
  relationship        TEXT NOT NULL CHECK (relationship IN ('spouse', 'domestic_partner',
                        'child', 'other')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE life_events (                 -- what opens a mid-year change
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('new_hire', 'open_enrollment', 'marriage',
                        'divorce', 'birth', 'adoption', 'loss_of_coverage', 'status_change',
                        'termination', 'reduction_in_hours', 'death', 'other')),
  event_date          DATE NOT NULL,
  reported_on         DATE NOT NULL,
  window_closes_on    DATE NOT NULL,         -- computed from the plan and the rule
  status              TEXT NOT NULL CHECK (status IN ('open', 'elected', 'expired', 'denied'))
);

CREATE TABLE benefit_enrollments (         -- worker x plan x tier x dependents, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  benefit_plan_id     UUID NOT NULL REFERENCES benefit_plans (id),
  election            TEXT NOT NULL CHECK (election IN ('enrolled', 'waived')),
  coverage_tier       TEXT,                  -- 'employee', 'employee_spouse', 'family', ...
  dependent_ids       UUID[] NOT NULL DEFAULT '{}',
  employee_cost       BIGINT NOT NULL DEFAULT 0,   -- per pay period
  employer_cost       BIGINT NOT NULL DEFAULT 0,   -- per pay period
  life_event_id       UUID REFERENCES life_events (id),
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (worker_id WITH =, benefit_plan_id WITH =, valid_during WITH &&)
);

ALTER TABLE deduction_elections
  ADD FOREIGN KEY (benefit_enrollment_id) REFERENCES benefit_enrollments (id),
  ADD FOREIGN KEY (garnishment_order_id) REFERENCES garnishment_orders (id);

CREATE TABLE documents (                   -- forms, letters and statements, with retention
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID REFERENCES workers (id),
  kind                TEXT NOT NULL,         -- 'i9', 'w4', 'state_w4', 'offer_letter',
                                             -- 'pay_statement', 'garnishment_order', 'notice', ...
  form_version        TEXT,                  -- '01/20/25' for an I-9, the form year for a W-4
  storage_ref         TEXT NOT NULL,
  sha256              CHAR(64) NOT NULL,
  signed_at           TIMESTAMPTZ,
  retention_until     DATE NOT NULL,         -- computed from the record's rule
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notices (                     -- agency and carrier notices received
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  kind                TEXT NOT NULL,         -- 'rate_notice', 'penalty', 'balance_due',
                                             -- 'cawr_letter', 'levy', 'carrier_notice', ...
  agency              TEXT NOT NULL,
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),
  period              DATERANGE,
  amount              BIGINT,
  received_on         DATE NOT NULL,
  respond_by          DATE,
  document_id         UUID REFERENCES documents (id),
  status              TEXT NOT NULL CHECK (status IN ('new', 'in_review', 'responded',
                        'resolved', 'escalated'))
);

ALTER TABLE tax_registrations ADD FOREIGN KEY (source_notice_id) REFERENCES notices (id);

CREATE TABLE audit_events (                -- who changed what, on every effective-dated table
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  table_name          TEXT NOT NULL,
  row_id              UUID NOT NULL,
  action              TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  actor               TEXT NOT NULL,         -- a user, an integration, the engine
  reason              TEXT,
  before              JSONB,
  after               JSONB,
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design notes:

- **A run computes from an as-of snapshot.** Calculation reads every effective-dated table as of the period (and the check date for tax rules), so the same inputs always produce the same statements. A correction reads the old period the same way, computes the difference and writes new statements with `reverses_statement_id`, so what the worker was shown survives ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).
- **Wage bases come from the accumulators, with the rehire rule.** The 2026 Social Security wage base is $184,500; `taxable_wages` on a Social Security line is the part of `subject_wages` below what the worker's year-to-date for that employer has left. Keying the accumulator on the worker, not the employment, is what makes a rehire continue the base instead of restarting it.
- **Due dates are computed and stored with their rule.** `liabilities.due_on` comes from the employer's deposit schedule for the year, the check date and the business-day calendar, and `rule_ref` names the rule, so a late deposit can be explained and a schedule change re-dates only the open liabilities ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Every money movement has one idempotency key.** A client debit is keyed to its pay run, a net pay credit to its statement and distribution, a tax payment to its remittance, so a retried file or a replayed job never pays twice ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **Funds held equal liabilities open.** For each employer, collected client debits less money paid out must equal liabilities in `impounded` status plus net pay in flight; the query runs every day and its differences are breaks to work ([Reconciliation](/docs/money/payment-states#reconciliation)).
- **Map, don't rebuild, the neighbors' records.** A `money_movements` row on the ACH rail is one entry in Payments' `ach_entries`, and its returns are Payments' `ach_returns` ([How to Build It](/books/payments/ach#how-to-build-it)); a worker's `bank_accounts` row is the payee side of that model, and the provider's own trust and operating accounts are Payments' treasury `bank_accounts`. A `garnishment_orders` row is the wage-side twin of Banking & Lending's `legal_orders`: the same issuer, case number and served date, with the CCPA limit in place of the bank's protected amount ([How to Build It](/books/banking-and-lending/legal-process#how-to-build-it)). A contractor's payment is the same concept as a Payments payout to a vendor.
- **Emit life-cycle events.** `pay_run.approved`, `pay_run.funded`, `pay_run.paid`, `money_movement.returned`, `liability.due_soon`, `remittance.accepted`, `filing.rejected`, `worker.hired`, `employment.terminated`, `life_event.opened` and `notice.received` are what notifications, the tax calendar, benefits, identity and the client's general ledger subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

### Extended By

Each later chapter extends a defined part of this spine. The chapters, the core tables each one builds on or alters, and the tables it is expected to add in its How to Build It, are below; a table is defined once, by the chapter named here, and later chapters reference it:

| Chapter | Extends |
| --- | --- |
| The Payroll & HR Landscape | `companies`, `employers`; adds `provider_profiles`, `provider_metrics`, `provider_transactions` |
| How Payroll Providers Make Money | `companies`, `pay_runs`, `money_movements`; adds `price_plans`, `company_subscriptions`, `pepm_invoices`, `float_income_accruals`, `peo_billing_lines` |
| Who Runs Payroll: Agents & Liability | `employers` (`filing_arrangement`), `filings`, `remittances`; adds `agent_authorizations`, `eftps_enrollments` |
| PEOs & Co-Employment | `employers`, `workers`, `tax_registrations`, `benefit_plans`; adds `client_service_agreements`, `duty_allocations`, `worksite_employee_assignments`, `master_plan_participations` |
| Gross-to-Net, Step by Step | `pay_statement_lines`, `taxability_rules`, `pay_item_types`, `accumulators`; adds `calculation_runs`, `calculation_steps`, `wage_bases`, `deduction_arrears` |
| Federal Withholding & the W-4 | `tax_elections` (`exempt_expires_on`, `lock_in`); adds `withholding_tables`, `withholding_brackets`, `lock_in_letters` |
| Supplemental Wages & Imputed Income | `earning_codes`, `pay_statement_lines`, `pay_item_types`; adds `imputed_income_items`, `gtl_premium_rates`, `equity_events`, `fringe_valuations` |
| Pre-Tax & Post-Tax Deductions | `deduction_codes`, `deduction_elections`, `taxability_rules`; adds `deduction_order_rules`, `deduction_limits`, `employee_loans` |
| Tips & the 2025 Tax Law | `time_entries`, `pay_statement_lines`, `job_assignments` (`tipped_occupation_code`); adds `tip_reports`, `tip_allocations`, `tipped_occupation_codes`, `qualified_overtime_amounts` |
| Retro Pay, Voids & Corrections | `pay_runs`, `pay_statements`, `liabilities`; adds `retro_calculations`, `overpayments`, `overpayment_recoveries`, `manual_checks` |
| Payroll by Industry | `employers`, `job_assignments`, `deduction_codes`; adds `certified_payroll_reports`, `union_fringe_remittances`, `household_employer_profiles`, `clergy_elections` |
| FICA, FUTA & SUTA | `tax_registrations`, `accumulators`, `notices`; adds `tax_rates`, `credit_reduction_states`, `sui_rate_notices`, `successor_wage_transfers` |
| Deposits, Returns & the Tax Calendar | `employers`, `liabilities`, `remittances`, `filings`; adds `deposit_schedule_determinations`, `tax_calendar_events`, `deposit_penalties` |
| State & Local Payroll Taxes | `tax_jurisdictions`, `work_locations`, `tax_registrations`; adds `jurisdiction_boundaries`, `address_geocodes`, `local_tax_rates` |
| Multi-State, Reciprocity & Remote Work | `worker_tax_locations`, `time_entries`; adds `reciprocity_agreements`, `work_day_allocations`, `nexus_thresholds` |
| Tax Notices, Amendments & Agency Accounts | `notices`, `tax_registrations`, `filings`; adds `notice_cases`, `notice_responses`, `penalty_abatements` |
| Tax Engines & Filing Services | `taxability_rules`, `tax_jurisdictions`, `filings`; adds `tax_engine_versions`, `tax_rate_updates`, `filing_submissions`, `filing_rejects` |
| Year-End, W-2s & Wage Reporting | `filings`, `filing_lines`, `accumulators`, `documents`; adds `w2_records`, `w2_box12_amounts`, `w2_corrections`, `delivery_consents` |
| Funding a Payroll | `money_movements`, `pay_runs`, `bank_accounts`; adds `funding_profiles`, `credit_limits`, `funding_speed_changes`, `bank_holidays` |
| When the Debit Fails | `money_movements`, `pay_runs`; adds `recovery_cases`, `funding_strikes`, `collection_actions` |
| Client Funds & Impound Accounts | `money_movements`, `liabilities`, `remittances`; adds `trust_accounts`, `client_fund_positions`, `investment_holdings`, `funds_reconciliations` |
| Direct Deposit, Pay Cards & Checks | `pay_distributions`, `bank_accounts`, `money_movements`; adds `prenotes`, `pay_card_consents`, `paychecks`, `positive_pay_files`, `unclaimed_wages` |
| Child Support Withholding | `garnishment_orders`, `deduction_elections`, `remittances`; adds `income_withholding_orders`, `sdu_remittances`, `medical_support_notices` |
| Garnishments & Levies | `garnishment_orders`, `deduction_elections`, `notices`; adds `garnishment_calculations`, `levy_exempt_amounts`, `garnishment_answers`, `garnishment_fees` |
| When Payroll Providers Fail | `remittances`, `money_movements`, `liabilities`; adds `deposit_verifications`, `independent_tax_checks` |
| The Workweek & the Time Record | `time_entries`, `timesheets`, `employers`; adds `raw_punches`, `time_edits`, `rounding_rules`, `workweek_definitions` |
| Clocks, Kiosks, Geofences & Biometrics | `time_entries`, `work_locations`, `documents`; adds `clock_devices`, `geofences`, `biometric_consents`, `biometric_templates` |
| Overtime & the Regular Rate | `time_entries`, `pay_statement_lines`, `job_assignments`; adds `overtime_rules`, `regular_rate_calculations`, `bonus_allocations` |
| Minimum Wage as Data | `work_locations`, `tax_jurisdictions`, `pay_rates`; adds `minimum_wage_rates`, `minimum_wage_checks` |
| Breaks, Premiums & Attestations | `time_entries`, `pay_statement_lines`; adds `break_rules`, `break_records`, `break_attestations`, `premium_pay_events` |
| Tipped Employees | `pay_statement_lines`, `job_assignments`; adds `tip_credit_rules`, `tip_pools`, `tip_pool_shares`, `service_charge_allocations` |
| Fair Workweek & Scheduling Laws | `time_entries`, `work_locations`, `persons`; adds `shifts`, `schedule_postings`, `schedule_changes`, `predictability_pay_events`, `minor_hour_limits` |
| Pay Frequency, Pay Statements & Final Pay | `pay_schedules`, `pay_statements`, `employments`; adds `payday_rules`, `pay_statement_requirements`, `final_pay_rules`, `final_pay_deadlines` |
| The HRIS as Record of Truth | `workers`, `employments`, `job_assignments`, `audit_events`; adds `positions`, `org_units`, `worker_change_events`, `downstream_syncs` |
| Recruiting, ATS & AI in Hiring | `persons`, `documents`; adds `requisitions`, `candidates`, `applications`, `offers`, `eeo_self_ids`, `hiring_tool_audits` |
| Background Checks, Fair Chance & Drug Testing | `persons`, `documents`; adds `background_checks`, `fcra_authorizations`, `adverse_action_notices`, `drug_tests` |
| Onboarding: I-9, E-Verify & New Hire Reporting | `documents`, `tax_elections`, `pay_distributions`, `filings`; adds `i9_records`, `everify_cases`, `new_hire_reports`, `onboarding_tasks` |
| Pay Transparency, Pay Equity & EEO-1 | `job_assignments`, `pay_rates`, `filings`; adds `pay_ranges`, `job_postings`, `pay_data_reports`, `pay_equity_analyses` |
| Terminations, Offboarding & WARN | `employments`, `life_events`, `notices`; adds `separations`, `separation_tasks`, `warn_events`, `severance_agreements`, `ui_claims` |
| Employee Records, Privacy & Retention | `documents`, `audit_events`, `persons`; adds `retention_schedules`, `legal_holds`, `data_subject_requests`, `personnel_file_requests` |
| FMLA Administration | `leave_cases`, `time_entries`; adds `fmla_eligibility_checks`, `leave_notices`, `leave_certifications`, `intermittent_leave_usage` |
| State Paid Family & Medical Leave | `tax_registrations`, `leave_cases`, `deduction_codes`; adds `pfml_programs`, `pfml_rates`, `private_plan_approvals`, `pfml_wage_reports` |
| Sick Leave & PTO Engines | `leave_policies`, `leave_ledger`; adds `accrual_rules`, `sick_leave_laws`, `leave_payouts` |
| Enrollment & Life Events | `benefit_enrollments`, `life_events`, `dependents`, `deduction_elections`; adds `enrollment_windows`, `eoi_requests`, `dependent_verifications`, `benefit_rates` |
| Carrier Connections & the 834 | `benefit_enrollments`, `benefit_plans`; adds `carrier_connections`, `edi_834_files`, `edi_acknowledgments`, `carrier_invoice_reconciliations` |
| The ACA Employer Mandate & 1095-C | `filings`, `filing_lines`, `benefit_enrollments`, `time_entries`, `notices`; adds `ale_determinations`, `measurement_periods`, `aca_status_results`, `form_1095c_lines`, `esrp_assessments` |
| COBRA & State Continuation | `life_events`, `benefit_enrollments`, `documents`; adds `cobra_events`, `cobra_notices`, `cobra_elections`, `cobra_premiums` |
| 401(k) Deferrals & Remittance | `deduction_elections`, `accumulators`, `liabilities`, `remittances`; adds `retirement_plans`, `deferral_limits`, `match_formulas`, `recordkeeper_files`, `late_deposit_corrections` |
| HSAs, FSAs & HRAs | `deduction_elections`, `benefit_plans`; adds `spending_account_plans`, `spending_account_elections`, `hra_allowances` |
| Benefits Administration Platforms | `benefit_plans`, `benefit_enrollments`; adds `eligibility_rules`, `plan_rate_tables`, `broker_assignments` |
| Contractors & 1099s | `workers`, `persons`, `filings`, `money_movements`; adds `w9_certifications`, `tin_match_results`, `backup_withholding_cases`, `contractor_payments`, `form_1099_records` |
| Worker Classification | `workers`, `documents`; adds `classification_assessments`, `ss8_requests`, `vcsp_applications` |
| Employer of Record & Global Employment | `employers`, `workers`, `companies`; adds `eor_entities`, `eor_engagements`, `country_partners` |
| International Payroll | `tax_jurisdictions`, `pay_runs`, `money_movements`; adds `country_payroll_profiles`, `partner_payroll_imports`, `fx_conversions` |
| Embedded Payroll | `companies`, `pay_runs`, `pay_run_events`; adds `partner_platforms`, `company_onboarding_states`, `webhook_subscriptions`, `webhook_deliveries` |
| Unified HR & Payroll APIs | `workers`, `deduction_elections`; adds `connections`, `sync_jobs`, `deduction_writebacks` |
| Payroll Platform Architecture | `pay_runs`, `accumulators`, `audit_events`, `liabilities`; adds `rule_versions`, `calculation_snapshots`, `gl_exports`, `scheduler_jobs` |
| Changing Providers Mid-Year | `accumulators`, `filings`, `employers`; adds `ytd_loads`, `parallel_runs`, `migration_mappings` |
| Controls, Audits & SOC 1 | `audit_events`, `pay_runs`; adds `control_tests`, `user_access_reviews`, `audit_requests`, `cuec_mappings` |
| Payroll Fraud & Security | `bank_accounts`, `pay_distributions`, `workers`; adds `account_change_holds`, `fraud_signals`, `security_events` |
| Payroll & HR Metrics | `companies`, `employers`; adds `metric_definitions`, `metric_values` |

Three decisions keep the map one model rather than several:

- **One statement line table for every kind of pay.** Regular wages, overtime, tips, imputed income, deferrals, garnishments, employer taxes and memo lines are all `pay_statement_lines` rows with a pay item type. W-2 boxes, wage bases, deferral limits, regular rate inputs and garnishment disposable earnings are queries over them, so a new benefit or tax is a catalog row and a rule, not a new pipeline.
- **One liability table for everyone a run owes.** The IRS, a state, a city, a carrier, a 401(k) plan, a disbursement unit and an employee with a returned deposit differ in their payee and due date rule, not their shape. Each chapter adds a detail table keyed by `liabilities.id` instead of a parallel ledger.
- **One effective-dated pattern for every rule and election.** Rates, elections, registrations, taxability, minimum wages, leave policies and plan rules all carry `valid_during`, so "what applied on that date" has one answer and one query shape across the volume.

## Auditing

The records in this chapter are the ones the IRS, the SSA, state agencies, the DOL, plan auditors, SOC 1 auditors and courts ask about later:

- **Every statement, reproducible.** Every pay statement with its lines and the inputs it read as of the period, so a DOL investigator, a 941-X or a wage claim gets the same answer years later; corrections are new statements that point at the old ones.
- **Every liability to its payment.** Every liability with its computed due date and rule, every remittance with its confirmation number and settlement date, and every money movement with its trace number and return code, so "were the taxes paid, on time, and from what money" is a query.
- **Returns that agree.** Every filing with its lines as filed and its acknowledgment, tied to the statements behind it, so the 941s agree with the W-2s before CAWR asks.
- **Every change with its actor.** Every change to a rate, election, bank account, assignment or deduction, with who made it and when; bank account changes in particular are where payroll fraud lives (Payroll Fraud & Security).
- **Documents on their clocks.** Every I-9, W-4, order and notice as received, with its version and computed retention date, purged on schedule and held when a hold applies ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Put an employer on every row that files or pays,** and treat the company as a billing and permissions boundary above several taxpayers.
- **Effective-date every input a calculation reads,** and compute every run from an as-of snapshot so corrections reproduce the original.
- **Make statement lines the only source of totals,** with accumulators, wage bases, limits and W-2 boxes derived from them.
- **Drive taxability from a catalog of pay item types,** never from a company's own codes.
- **Keep calculation, liabilities, money and filings as separate records** with separate states, and reconcile funds held to liabilities open every day.
- **Compute every due date from its rule and store the rule,** for deposits, remittances, notices, filings and enrollment windows.
- **Give every debit, credit and deposit one idempotency key** so retries never move money twice.
- **Keep the person, the worker and the employment apart,** so rehires and transfers continue the year instead of restarting it.
- **Tell employers to verify their own tax deposits,** and build the reconciliation that would survive a provider that doesn't make them.

## References

**Law and regulation**

- [42 USC 653a](https://www.law.cornell.edu/uscode/text/42/653a), new hire reporting: the data elements, the 20-day limit, the two monthly transmissions, multistate designation and penalties
- [42 USC 666](https://www.law.cornell.edu/uscode/text/42/666), income withholding for child support: remittance to the state disbursement unit within 7 business days, priority over other legal process, employer liability and combined payments
- [26 USC 3511](https://www.law.cornell.edu/uscode/text/26/3511), a certified PEO treated as the employer of its work site employees, and the successor employer rule
- [29 CFR 2590.701-6](https://www.law.cornell.edu/cfr/text/29/2590.701-6), HIPAA special enrollment: at least 30 days, and effective dates for marriage and birth
- [29 CFR 2590.715-2708](https://www.law.cornell.edu/cfr/text/29/2590.715-2708), the 90-day limit on group health plan waiting periods

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), 2026 Social Security and Medicare rates and wage base, Additional Medicare, FUTA, the lookback period, monthly and semiweekly schedules, the $100,000 next-day rule, business-day rule, EFT, Schedule B, Form 941 due dates, failure-to-deposit penalties, the trust fund recovery penalty and new employee W-4s
- [IRS: Publication 15-B (2026), Employer's Tax Guide to Fringe Benefits](https://www.irs.gov/publications/p15b), excluded benefits and Social Security and Medicare, and the group-term life exclusion
- [IRS: Topic no. 424, 401(k) plans](https://www.irs.gov/taxtopics/tc424), elective deferrals excluded from income tax withholding and box 1 but included in Social Security, Medicare and FUTA wages
- [IRS: 2026 General Instructions for Forms W-2 and W-3](https://www.irs.gov/instructions/iw2w3), the February 1, 2027 due dates, the 10-return e-file rule, the W-3 as transmittal, box 12 codes and agreement with Forms 941
- [IRS: Third party arrangement chart](https://www.irs.gov/businesses/small-businesses-self-employed/third-party-arrangement-chart), authorization forms, EINs and liability for payroll service providers, reporting agents, Section 3504 agents and CPEOs
- [IRS: Outsourcing payroll duties](https://www.irs.gov/businesses/small-businesses-self-employed/outsourcing-payroll-duties), the employer's ultimate responsibility, EFTPS verification and the red flag of a missed payment
- [IRS: Combined annual wage reporting employment tax problem inquiries](https://www.irs.gov/businesses/small-businesses-self-employed/combined-annual-wage-reporting-employment-tax-problem-inquiries), the IRS and SSA comparison of Forms 94X with W-2 totals and Letter 99C
- [USCIS: Form I-9](https://www.uscis.gov/i-9), the 01/20/25 edition, the acceptable 08/01/23 editions and the retention rule
- [USCIS: Handbook for Employers M-274, Completing Section 1 of Form I-9](https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/30-completing-section-1-of-form-i-9), Section 1 by the first day of employment and Section 2 within three business days
- [E-Verify: Verification process](https://www.e-verify.gov/employers/verification-process), the case by the third business day and the case results
- [DOL: Last paycheck](https://www.dol.gov/general/topic/wages/lastpaycheck), no federal requirement of immediate final pay
- [DOL EBSA: An Employer's Guide to Group Health Continuation Coverage Under COBRA](https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/publications/an-employers-guide-to-group-health-continuation-coverage-under-cobra), the 20-employee threshold and the 30, 14, 60, 45 and 30-day clocks, 18 and 36 months and 102%
- [California DLSE: Paydays, pay periods, and the final payment of wages](https://www.dir.ca.gov/dlse/faq_paydays.htm), final pay on discharge and on quitting, and waiting time penalties

**Filings**

- [ADP: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/8670/000000867026000030/adp-20260630.htm), clients and workers paid, ADP TotalSource, client funds moved, ADP Trust Bank, revenues, PEO revenue net of pass-throughs, zero-margin benefits pass-throughs, interest on funds held for clients, average balance and yield, funds held and client funds obligations
- [Paychex: Form 10-K for the fiscal year ended May 31, 2026](https://www.sec.gov/Archives/edgar/data/723531/000119312526307785/payx-20260531.htm), customers, payroll volume, interest on funds held for clients, average balance and rate, and liability for client shortfalls
- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), per-employee-per-month fees, clients, interest on funds held for clients, and paying before client transfers settle
- [Insperity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1000753/000100075326000011/nsp-20251231.htm), gross billings, worksite employee payroll cost, revenues as the markup, per-WSEE revenue and gross profit, CPEO subsidiaries and same-day service fee remittance

**Vendor documentation**

- [Check: Life of a payroll](https://docs.checkhq.com/docs/life-of-a-payroll.md), payroll statuses, the 5pm PT collection of payrolls at their approval deadline, debit timing and the release of net pay
- [Gusto Embedded: 2-day vs 4-day payroll](https://docs.gusto.com/embedded-payroll/docs/2-day-vs-4-day.md), payroll speeds, the 4pm PT deadline, debit days for a Friday check date, paying before the debit clears and the 90-day liability transfer
- [Square: Payroll pricing](https://squareup.com/us/en/payroll/pricing), $35 a month plus $6 per person paid, and the contractor-only plan
- [Remote: Employer of Record](https://remote.com/employer-of-record), EOR from $599 per employee per month on annual contracts, the equity add-on, and Remote's role as legal employer

**In practice**

- [Krebs on Security: NY Payroll Company Vanishes With $35 Million (September 11, 2019)](https://krebsonsecurity.com/2019/09/ny-payroll-company-vanishes-with-35-million/), MyPayrollHR's shutdown, the roughly 4,000 clients notified and the money owed to its tax withholding processor
