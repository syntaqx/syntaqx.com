+++
title = "Workforce Glossary"
nav_title = "Glossary"
description = "Payroll and HR terms by part: the business, gross to net, payroll tax, money movement, wage-hour, HR records, leave, benefits, contractors and global payroll."
category = "Workforce Industry"
order = 2699
part = "Reference"
tags = ["payroll", "hr", "payroll-tax", "glossary", "reference"]
+++

Payroll borrows its words from tax law, wage-hour law, benefits law and a century of service bureau operations, so the same word shifts with context: a liability is an amount a pay run owes a tax agency on one screen and a balance sheet line on a provider's 10-K on another, an employer is a legal entity with an EIN to the IRS and a company with one contract to a provider's sales team, a deposit is a federal tax payment through EFTPS and a direct deposit of net pay into a worker's bank, and wages are a different number for income tax, Social Security, unemployment and a garnishment's disposable earnings. Entries are grouped by the part of the volume that explains them, alphabetized within each group, and each is one line and a link to the chapter that owns the idea; a word with two meanings appears once per meaning, qualified. Terms the [Payments](/books/payments/glossary), [Banking & Lending](/books/banking-and-lending/glossary), [Health Tech](/books/health-tech/glossary) and [Investing & Digital Assets](/books/investing-and-digital-assets/glossary) glossaries already define keep their definitions. The volume's own names for the core records (company, employer, tax jurisdiction, work location, tax registration, person, worker, employment, job assignment, pay rate, pay schedule, pay period, tax election, worker tax location, bank account, pay distribution, time entry, timesheet, pay item type, earning code, deduction code, taxability rule, deduction election, pay run, pay statement, pay statement line, accumulator, liability, remittance, money movement, filing, garnishment order, leave ledger, leave case, benefit enrollment, life event, document, notice, audit event) are the ones in [The Core Data Model](/books/workforce/workforce-business#the-core-data-model).

## The Business

- **Accumulator:** a quarter-to-date or year-to-date total per worker, employer and key (a pay item, a tax, a jurisdiction), derived from paid statement lines and never the source of truth ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Certified professional employer organization (CPEO):** a PEO certified by the IRS that is treated as the employer of its worksite employees for federal employment taxes and files aggregate returns under its own EIN ([The Workforce Business](/books/workforce/workforce-business#who-s-who)).
- **Client funds obligation:** a provider's liability to pay clients' employees, agencies and other payees from the funds it has collected and holds for them ([The Workforce Business](/books/workforce/workforce-business#interest-on-client-funds)).
- **Company:** the provider's customer, one account and one contract, with one or more employers under it ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Deduction election:** a worker's deduction, as an amount or percent with any goal, limit and arrears rule and the enrollment or order behind it, effective-dated ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Embedded payroll:** a payroll engine sold as an API and components to other software, which owns the customer relationship while the payroll partner calculates, moves the money and files ([The Workforce Business](/books/workforce/workforce-business#who-s-who)).
- **Employer:** a legal entity with an EIN that employs people and files returns; a company with three EINs is three employers ([The Workforce Business](/books/workforce/workforce-business#who-s-who)).
- **Employer of record (EOR):** a provider that is the legal employer of a client's worker in a country where the client has no entity, while the client directs the work ([The Workforce Business](/books/workforce/workforce-business#employer-of-record-fees)).
- **Employment:** one stint of a worker at an employer, from hire to termination; a rehire is a new employment on the same worker ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Float:** interest a provider earns on client funds between collecting a payroll and paying it out, the average balance times the yield ([The Workforce Business](/books/workforce/workforce-business#interest-on-client-funds)).
- **Gross billings:** everything a PEO bills its clients, wages, payroll taxes, benefits, workers' compensation and its fee, of which only the markup over payroll cost is revenue ([The Workforce Business](/books/workforce/workforce-business#peo-gross-billings-and-net-revenue)).
- **Impound:** collecting a client's taxes and net pay ahead of the dates they are owed and holding them in a client trust account until paid ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Job assignment:** what an employment is over time: title, department, manager, work location, FLSA status, pay basis and standard hours, effective-dated ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Liability (payroll):** an amount a pay run owes a third party (an agency, carrier, plan, order payee or employee), with its due date computed from a rule ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-pay-run)).
- **Money movement:** one movement of funds on one rail (a client debit, a net pay credit, a tax payment, a garnishment, a benefit remittance, a refund), with its status, return code and trace number ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Pay item type:** an entry in the volume's catalog of what a pay item is (regular pay, overtime, tips, imputed income, a pre-tax deferral, a garnishment), to which every company code maps and from which taxability is decided ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Pay run:** one run of one employer's payroll for one period and type (regular, off-cycle, bonus, correction, void, reversal), from draft to paid ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-pay-run)).
- **Pay statement:** one worker's statement for one pay run, with gross, net and its lines; never edited once paid, only reversed or adjusted by a new statement ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Pay statement line:** one earning, deduction, employee tax, employer tax, reimbursement or memo on a pay statement, with its hours, rate, amount and subject and taxable wages ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Per employee per month (PEPM):** pricing by the number of workers each month, the base of most payroll and HR software fees ([The Workforce Business](/books/workforce/workforce-business#per-employee-per-month)).
- **Professional employer organization (PEO):** a firm that co-employs a client's workers, running payroll, benefits and HR under its own plans and allocating employer duties by contract ([The Workforce Business](/books/workforce/workforce-business#who-s-who)).
- **Remittance:** a payment to an agency, carrier, plan or order payee that satisfies one or more liabilities, with its method, confirmation number and settlement date ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Taxability rule:** whether a pay item type is subject to, exempt from or only reported for one tax in one jurisdiction, effective-dated; the heart of gross-to-net ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Tax registration:** an employer's account with one jurisdiction for one tax, with its account number, rate, deposit frequency, dates and status ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Worker:** a person working for one employer, as an employee or a contractor ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)).
- **Worksite employee (WSE, WSEE):** a worker co-employed by a PEO at a client's business, the unit PEOs count and price ([The Workforce Business](/books/workforce/workforce-business#peo-gross-billings-and-net-revenue)).
- **Zero-margin benefits pass-through:** benefit costs a PEO reports in revenue and in cost at the same amount, earning nothing on them ([The Workforce Business](/books/workforce/workforce-business#peo-gross-billings-and-net-revenue)).

## Payroll Tax

- **Combined Annual Wage Reporting (CAWR):** the IRS and SSA program that compares income tax withheld and Social Security and Medicare wages on Forms 94X with the W-2 totals sent to SSA ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **EFTPS:** the Treasury's Electronic Federal Tax Payment System, through which employers and their providers make federal tax deposits, and where an employer can verify its provider's deposits with its own PIN ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Failure-to-deposit penalty:** the IRS penalty on a late or improper deposit, 2%, 5%, 10% or 15% by how late it is ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Letter 99C:** the IRS letter telling an employer that its employment tax returns and W-2s disagree after CAWR review, with 45 days to respond ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Lookback period:** for Form 941 filers, the four quarters from July 1 two years back to June 30 of the prior year, whose total taxes set the deposit schedule ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Monthly depositor:** an employer that reported $50,000 or less of taxes in its lookback period and deposits by the 15th of the following month ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Next-day deposit rule:** the rule that $100,000 or more of taxes accumulated on any day must be deposited by the next business day, making a monthly depositor semiweekly ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Schedule B (Form 941):** the report of tax liability by day that semiweekly depositors file with Form 941 ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Semiweekly depositor:** an employer above $50,000 in its lookback period, depositing taxes on Wednesday to Friday paydays by the following Wednesday and on Saturday to Tuesday paydays by the following Friday ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Trust fund recovery penalty:** a penalty of 100% of unpaid trust fund taxes, assessable against the people responsible for paying them over who acted willfully ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).
- **Trust fund taxes:** income tax withheld and the employee's share of Social Security and Medicare, held by the employer for the government ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)).

## References

**Reference**

- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), deposit schedules, the lookback period, penalties and trust fund taxes
- [IRS: Third party arrangement chart](https://www.irs.gov/businesses/small-businesses-self-employed/third-party-arrangement-chart), CPEOs and other third-party payroll arrangements
- [IRS: Combined annual wage reporting employment tax problem inquiries](https://www.irs.gov/businesses/small-businesses-self-employed/combined-annual-wage-reporting-employment-tax-problem-inquiries), CAWR and Letter 99C
- [Insperity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1000753/000100075326000011/nsp-20251231.htm), gross billings and revenue as the markup
- [ADP: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/8670/000000867026000030/adp-20260630.htm), interest on funds held for clients, client funds obligations and zero-margin benefits pass-throughs
