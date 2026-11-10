+++
title = "When Payroll Providers Fail"
nav_title = "When Providers Fail"
description = "When a payroll provider fails: MyPayrollHR and Cachet, diverted tax impounds, the liability that stays with the employer, and the controls that prevent it."
category = "Workforce Industry"
order = 2626
part = "Moving the Money"
tags = ["payroll", "provider-failure", "fraud", "eftps", "controls", "reconciliation"]
+++

On Wednesday, September 4, 2019, a payroll company in Clifton Park, New York sent its usual biweekly file to the processor that paid its clients' employees, with one change. For more than twelve years MyPayrollHR's file had told Cachet Financial Services which employee accounts to credit, while clients' payroll money was debited into a Cachet settlement account. This file sent the client debits to an account MyPayrollHR controlled at Pioneer Savings Bank instead, while still instructing about $26 million of credits to employees out of Cachet's account. Pioneer had frozen MyPayrollHR's account. Cachet tried to pull the money back from employees with reversal files, some banks processed both a malformed and a corrected one, and employees at more than 1,000 companies lost one or two pay periods of salary from their checking accounts before Cachet canceled the reversals and absorbed the loss. The firm that handled the clients' tax withholdings was owed more than $9 million. About 4,000 clients were told the company was shutting down, and nearly $35 million of payroll and tax payments was left in limbo.

Provider failure is rare, and when it happens the cost lands on parties who did nothing wrong: employees, the processor behind the provider, and the employers, who remain liable for taxes they already paid to someone else. This chapter covers the mechanics of the public cases (MyPayrollHR and Cachet, and the earlier Pinnacle case), the slower failure of diverted tax impounds, what an employer can verify for itself, the liability that stays with the employer, and the design lessons: segregation, reconciliation and independent verification of taxes. Who is allowed to deposit and file for an employer, and who stays liable under each arrangement, is [Who Runs Payroll: Agents & Liability](/books/workforce/who-runs-payroll); how client money should be held is [Client Funds & Impound Accounts](/books/workforce/client-funds-and-impounds).

## The Public Record

What public sources describe about payroll provider failures, as of November 2026:

| Case | When | What failed | Public figures |
| --- | --- | --- | --- |
| **MyPayrollHR** (Clifton Park, New York) | September 2019 | The provider rerouted client debits to an account it controlled while instructing employee credits from its processor's account | About $26 million of employee credits; more than $9 million owed to the tax withholding processor; nearly $35 million in limbo; about 4,000 clients notified |
| **Cachet Financial Services**, MyPayrollHR's processor | September to October 2019 | Absorbed the $26 million; its own bank then required wire prefunding and it stopped processing files | About $150 billion a year of payroll payments for more than 110,000 employers before the event |
| **Pinnacle Workforce Solutions** (Monterey, California) | September 2016 | Court filings alleged the provider altered a coded funding file so client collections went to Pinnacle instead of the ACH account | Cachet left with more than $1 million in losses |

The common thread is the file. In each case a payroll company that originated entries through a processor controlled the instructions saying where client money went, and changed them. The ODFI and the processor saw a valid file; the employers saw nothing until pay and taxes failed. A provider that sends entries for others through its own bank relationship is a third-party sender in Nacha's terms, with its own monitoring duties and its bank's exposure limits ([How It Moves](/books/payments/ach#how-it-moves)), and these cases are why those duties exist.

The slower failure, a provider that collects tax impounds and doesn't deposit them, has a public record in criminal prosecutions and IRS warnings rather than in one famous case; the IRS's own guidance to employers is built around it ([What the Employer Can Verify](#what-the-employer-can-verify)).
<!-- source-gap: wf-impound-embezzlement-cases | missing | Public prosecutions of payroll service owners who diverted clients' tax impounds (defendant, amount, sentence) beyond MyPayrollHR | closes with: DOJ or IRS Criminal Investigation press releases for specific payroll service provider cases | checked: 2026-11-09 -->

## MyPayrollHR, Step by Step

The mechanics, from the reporting at the time, map onto the flows in this part:

1. **The normal flow.** Each pay cycle MyPayrollHR sent Cachet a file. The client debits (the cash requirement) settled into Cachet's holding account, and the employee credits were paid out of it. Taxes ran through a separate processor, National Payment Corporation (NatPay). This is a provider using two third parties, one for wages and one for taxes, without holding the money itself.
2. **The change.** The September 4 file asked that client payroll funds go to MyPayrollHR's own account at Pioneer Savings Bank instead of Cachet's holding account, which Cachet said had never happened before, while still instructing Cachet to pay about $26 million of employee credits.
3. **The freeze.** Pioneer told Cachet that MyPayrollHR's account was frozen. The employees had been paid from Cachet's money, and the employers' money was in a frozen account Cachet couldn't reach.
4. **The reversal.** Cachet sent a reversal to pull back the credits. The first file was improperly formatted, so it sent a corrected one; several receiving banks processed both, and affected employees were debited about a month's wages. Cachet then canceled the reversals, asked more than 100 receiving banks to reject both, and absorbed the $26 million.
5. **The taxes.** MyPayrollHR owed NatPay more than $9 million meant for clients' tax withholdings.
6. **The cause.** MyPayrollHR's CEO was arrested and charged with bank fraud for alleged check kiting between Bank of America and Pioneer from August 1 to August 30, 2019, and admitted, according to the reporting, that he had obtained about $70 million under false pretenses since 2010 or 2011. Pioneer had sued over a $42 million loan.

Three lessons are specific. **The reversal was improper and made it worse:** Nacha permits reversals for errors, and an Originator's failure to fund isn't one ([Reversals](/books/payments/ach#reversals)); the malformed first file that banks processed anyway doubled the harm. **Wages and taxes failed differently:** the employees were paid (and then briefly unpaid), while the taxes simply never arrived, which employers discover only from the IRS. **The provider's insolvency started long before the file.** A provider borrowing against client money or kiting checks has been out of balance for months; a daily reconciliation of funds held to obligations, performed by someone other than the person moving the money, is the control that finds it.

## Cachet: When the Processor Fails Next

The damage spread up the chain. Cachet processed about $150 billion of payroll payments a year for more than 110,000 employers through many payroll bureaus. On October 23, 2019, its bank required "pre-funding via Direct Wire for all batches that were uploaded this week," announced less than a day before a weekly payroll rush, and Cachet then said files uploaded that day "will not be processed." Payroll providers that relied on Cachet were left "scrambling to cut and mail or courier paper checks." The lessons for a payroll platform are about concentration: a provider that depends on one processor or one bank has a single point of failure, and a bank that becomes nervous about a processor can turn ACH funding into wire prefunding overnight. The fallback (a second processor or bank relationship, the ability to print checks, a wire-funding path for clients) has to exist before it is needed.

## Diverted Tax Impounds

The commonest provider failure isn't a dramatic file change but a slow leak: a provider collects clients' tax impounds and doesn't deposit them, or deposits late using later clients' money, the same pattern as a bank's lapping fraud. It can run for months because the client sees its payroll paid and its statement show the taxes withheld, while the IRS sees deposits missing from the client's account. What reveals it:

- **IRS notices to the employer's address of record.** The IRS writes to the employer, which is why it "strongly suggests that the employer does not change their address of record to that of the payroll service provider."
- **Missing EFTPS payments** that the employer can see only with its own EFTPS enrollment.
- **A provider-side reconciliation that doesn't balance:** impounded liabilities whose due dates have passed without a remittance, or a pool whose balance is less than its obligations.

Once found, the cost is the employer's. "The employer is ultimately responsible for the deposit and payment of federal tax liabilities," whether the provider is a payroll service provider or a reporting agent filing under the employer's EIN. A certified PEO is the exception the law built: for wages it pays to worksite employees a CPEO is treated as the employer "and no other person" for employment taxes and is bonded under the certification rules ([CPEO Certification](/books/workforce/peos-and-co-employment#cpeo-certification)).

### Worked Numbers: The Liability That Stays

An invented employer's provider collected its third-quarter 2026 federal taxes and never deposited them. The quarter's figures: $150,000 of wages, federal income tax withheld of $22,000, Social Security of $9,300 each from the employee and the employer (6.2%), and Medicare of $2,175 each (1.45%).

| Item | Computation | Amount |
| --- | --- | --- |
| Total undeposited federal taxes | $22,000 + $9,300 x 2 + $2,175 x 2 | $44,950 |
| Trust fund portion (withheld from employees) | $22,000 + $9,300 + $2,175 | $33,475 |
| Failure-to-deposit penalty, deposits 16 or more days late | 10% x $44,950 | $4,495 |
| If still unpaid 10 days after the first IRS notice | 15% x $44,950 | $6,742.50 |
| Trust fund recovery penalty exposure for each responsible person who acted willfully | 100% of the trust fund portion | up to $33,475 |

The employer already paid this money once, to the provider. It owes it again to the IRS, with penalties and interest, and the trust fund portion can follow the owners and officers responsible for paying it personally ([Failure-to-Deposit Penalties](/books/workforce/deposits-and-returns#failure-to-deposit-penalties)). Abatement for reasonable cause is possible, and [Tax Notices, Amendments & Agency Accounts](/books/workforce/tax-notices-and-agency-accounts) covers the request ([Penalty Relief](/books/workforce/tax-notices-and-agency-accounts#penalty-relief)), but the tax itself isn't abated, and the employer's recourse is a claim against a provider that may be insolvent. That is why the IRS tells employers to watch, and why a well-built provider makes watching easy.

## What the Employer Can Verify

The IRS's guidance to employers who outsource payroll is a checklist:

- **Enroll in EFTPS with your own PIN.** "Employers should register on the EFTPS system to get their own PIN and use this PIN to periodically verify payments," with "on-line access to their payment history for 16 months." A deposit made by a provider under the employer's EIN appears there with its date and amount.
- **Treat the first miss as an alarm.** "A red flag should go up the first time a service provider misses a payment or makes a late payment."
- **Keep your own address on file.** IRS correspondence about the account goes "to the employer at the address of record."
- **Act on any bill promptly** by "calling the number on the bill."

The same logic applies to every agency: state withholding and unemployment accounts have their own online access, and an employer that can log in to its state accounts can see whether the quarterly returns and payments arrived. The provider's side of this is in [The Employer's Own EFTPS](/books/workforce/who-runs-payroll#the-employer-s-own-eftps): prompt enrollment at onboarding, record that it happened, and show each deposit's EFT acknowledgment so the employer can match it.

## Design Lessons

The public failures and the IRS guidance point to three disciplines, each of which a provider can build and an employer can ask about:

- **Segregation.** Client money in accounts titled for clients, apart from operating cash, with trust or custodial structures ([Trust Accounts and Trust Banks](/books/workforce/client-funds-and-impounds#trust-accounts-and-trust-banks)); bank files that move client money changed only under dual control, with any change to a settlement or collection account in a file treated as an exception the bank and processor confirm out of band; and no ability for one person to both change where money goes and approve the change.
- **Reconciliation.** Funds held equal obligations, every day, per employer, with breaks aged and owned by someone independent of the people who move the money ([Reconciling Funds Held to Obligations](/books/workforce/client-funds-and-impounds#reconciling-funds-held-to-obligations)); every impounded liability past its due date without a remittance is an incident, not a report line.
- **Independent verification of taxes.** The employer should be able to see each deposit at the agency, not just on the provider's screen: EFT trace numbers on every remittance, matched against the employer's own EFTPS history; where the provider holds a Form 8821 authorization, a periodic comparison of the IRS account transcript with what the provider thinks it deposited ([Seeing and Speaking for the Account](/books/workforce/who-runs-payroll#seeing-and-speaking-for-the-account-forms-8821-and-2848)); and alerts to the employer, not just to the provider's operations team, when a deposit is late.

Two more follow from Cachet. **Know your concentration:** a provider should be able to name every bank and processor its money flows through and what it would do if each disappeared tomorrow. **Practice the fallback:** printing checks for a whole client base, or moving clients to wire funding, is a procedure that fails the first time it is tried under pressure.

A provider's SOC 1 report is where an employer's auditor sees whether these controls exist and were tested ([Controls, Audits & SOC 1](/books/workforce/controls-audits-and-soc1)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `remittances` already carries the EFT confirmation number; this chapter adds the employer's own verification of deposits and an independent comparison with the agency's records.

```sql
-- The employer's (or an independent party's) confirmation that a deposit reached the agency.
CREATE TABLE deposit_verifications (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  remittance_id       UUID NOT NULL REFERENCES remittances (id),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  source              TEXT NOT NULL CHECK (source IN ('employer_eftps', 'irs_transcript',
                        'state_portal', 'agency_notice')),
  observed_amount     BIGINT,
  observed_date       DATE,
  observed_reference  TEXT,                  -- the EFT number as the agency shows it
  result              TEXT NOT NULL CHECK (result IN ('matched', 'amount_differs', 'date_differs',
                        'not_found')),
  verified_by         TEXT NOT NULL,         -- the employer user, an integration
  verified_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A periodic comparison of the agency's account with the provider's records.
CREATE TABLE independent_tax_checks (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  tax_type            TEXT NOT NULL,         -- 'federal_941', 'sui', 'state_withholding', ...
  period              DATERANGE NOT NULL,
  provider_deposited  BIGINT NOT NULL,       -- sum of remittances the provider recorded
  agency_shows        BIGINT,                -- from a transcript, portal or notice
  difference          BIGINT GENERATED ALWAYS AS (provider_deposited - COALESCE(agency_shows, 0)) STORED,
  authority_ref       UUID,                  -- the Form 8821 or portal access used (agent_authorizations)
  checked_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status              TEXT NOT NULL CHECK (status IN ('clean', 'break', 'pending_agency',
                        'escalated'))
);

-- Impounded liabilities past due with no remittance: an incident queue, never a report.
SELECT li.employer_id, li.id AS liability_id, li.tax_type, li.amount, li.due_on,
       CURRENT_DATE - li.due_on AS days_late
FROM liabilities li
WHERE li.status = 'impounded'
  AND li.payee_type = 'agency'
  AND li.due_on < CURRENT_DATE
ORDER BY li.due_on;
```

Design notes:

- **Every deposit carries the agency's reference.** The EFT trace number on `remittances` is what the employer matches in EFTPS; a remittance without one isn't confirmed.
- **Invite the employer into the check.** A screen that lists each deposit with its EFT number and asks the employer to confirm it in their own EFTPS account turns the IRS's advice into a workflow; `deposit_verifications` records the answer.
- **Compare with the agency, not with yourself.** `independent_tax_checks` reads what the agency shows (a transcript under an 8821, a state portal, a notice) and compares it with what the provider recorded; agreement with the provider's own ledger proves nothing about the agency's.
- **Past-due impounds page someone.** The query above is an alert with an owner, run daily, and an employer whose deposit is late hears from the provider before the IRS ([Reconciliation](/docs/money/payment-states#reconciliation)).
- **Changes to where money goes are audited and dual-controlled.** Settlement accounts, collection accounts and processor routing are configuration with an approval trail, and a file whose settlement instructions differ from the configured ones doesn't leave the building ([Audit Trails](/docs/building-blocks/audit-trails#make-it-tamper-evident)).

## Auditing

- **Every remittance with its agency reference,** and every verification of it by the employer or an independent source.
- **Periodic agency comparisons** per employer, jurisdiction and period, with breaks and their resolution.
- **The past-due impound queue** with each incident, its cause and the employer notice.
- **Changes to bank, settlement and processor configuration** with who requested, who approved and when.
- **Concentration and fallback records:** the processors and banks in use, and the tests of the fallback procedures.

## What This Means for the System You Build

- **Assume the employer will be asked to prove its taxes were paid,** and give it the EFT numbers and the prompt to check them in its own EFTPS account.
- **Reconcile funds held to obligations daily** with someone independent of money movement, and treat a past-due impound as an incident.
- **Compare what agencies show with what you deposited,** using the access the employer has granted.
- **Put dual control on anything that changes where client money goes,** and reject files whose settlement instructions differ from the configured ones.
- **Never reverse workers' pay to cover a funding failure;** reversals are for errors.
- **Know your banks and processors as single points of failure,** and keep a tested fallback for each.
- **Keep the employer's address of record theirs,** so agency notices reach the party that owes the tax.

## References

**Law and regulation**

- [26 USC 3511](https://www.law.cornell.edu/uscode/text/26/3511), a certified PEO treated as the employer of its work site employees for employment taxes

**Agency guidance and forms**

- [IRS: Outsourcing payroll duties](https://www.irs.gov/businesses/small-businesses-self-employed/outsourcing-payroll-duties), the employer's ultimate responsibility, EFTPS enrollment with its own PIN, 16 months of payment history, the red flag of a missed payment, the address of record and acting on bills
- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), Social Security and Medicare rates, the failure-to-deposit penalty tiers and the trust fund recovery penalty

**In practice**

- [Krebs on Security: NY Payroll Company Vanishes With $35 Million (September 2019)](https://krebsonsecurity.com/2019/09/ny-payroll-company-vanishes-with-35-million/), MyPayrollHR's file flow with Cachet, the September 4 change, Pioneer Savings Bank, the $26 million of credits, the reversal files, NatPay's $9 million, nearly $35 million in limbo and about 4,000 clients
- [Krebs on Security: MyPayrollHR CEO Arrested, Admits to $70M Fraud (September 2019)](https://krebsonsecurity.com/2019/09/mypayrollhr-ceo-arrested-admits-to-70m-fraud/), the bank fraud charge, check kiting from August 1 to 30, 2019, the admitted $70 million, the tax money owed to NatPay and the reversal from employees at more than 1,000 companies
- [Krebs on Security: Cachet Financial Reeling from MyPayrollHR Fraud (October 2019)](https://krebsonsecurity.com/2019/10/cachet-financial-reeling-from-mypayrollhr-fraud/), Cachet's volume, the bank's wire prefunding requirement on October 23, 2019, the halt in processing, the fallback to paper checks, the Pinnacle Workforce Solutions file alteration in 2016 and the Pioneer loan suit
