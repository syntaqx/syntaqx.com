+++
title = "Changing Providers Mid-Year"
nav_title = "Changing Providers"
description = "Switching payroll mid-year: Rev. Proc. 2004-53 standard vs alternate, successor wage bases, YTD loading at quarter boundaries, parallel runs, PEOs and go-live."
category = "Workforce Industry"
order = 2659
part = "Running the Platform"
tags = ["payroll", "migrations", "successor-employer", "wage-bases", "year-to-date", "go-live"]
+++

Payroll is the one system an employer can't simply turn off and on again. Every number a paycheck depends on accumulates over the calendar year: Social Security wages toward the $184,500 base, FUTA wages toward $7,000, state unemployment wages toward the state's base, Additional Medicare wages toward $200,000, 401(k) deferrals toward the annual limit, the quarter's liabilities toward Form 941 and the year's toward the W-2. A new provider that starts in July without January through June will over-withhold, over-deposit, file a third-quarter 941 that's missing half the quarter, and issue W-2s the employee can't reconcile. That's why most switches happen on January 1, and Paylocity's 10-K says it directly: "many clients switch solutions during the first calendar quarter of the year."

But businesses change providers mid-year anyway, and they are acquired, merged and moved into and out of PEOs on dates nobody chose for payroll. This chapter separates the three events that look alike and aren't (a provider change under the same EIN, an acquisition that creates a successor employer, and entry into or exit from a PEO), works Rev. Proc. 2004-53's standard and alternate procedures and the successor wage base rules with numbers, works year-to-date loading at and between quarter boundaries, and covers parallel runs, data mapping and the go-live calendar. The rules for successor wages per tax are in [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#successor-employers-and-wage-base-transfers); the view from the provider being left is in [The Payroll & HR Landscape](/books/workforce/workforce-landscape#switching-seen-from-the-provider-being-left); the generic migration patterns are in [Replacing Systems](/docs/architecture/replacing-systems) and, for SaaS switching, in Workplace & Collaboration's [Migrations & Switching](/books/workplace-and-collaboration/migrations-and-switching#when-the-customer-switches).

## Three Events That Look Alike

| Event | Employer (EIN) | Wage bases | Who files the quarter | What the new system needs |
| --- | --- | --- | --- | --- |
| **Provider change** | The same | Continue: it's the same employer all year | One 941 per quarter for the EIN, so whoever files the quarter needs all of it | Year-to-date and quarter-to-date by worker and tax, and the old provider's deposits |
| **Acquisition (successor employer)** | A different EIN takes over the workers | Restart, unless the acquisition qualifies under the successor rules, in which case the predecessor's wages count | Each EIN files its own 941s; Schedule D explains the differences under the alternate procedure | Predecessor wages per worker and tax for the successor rules; under the alternate procedure, predecessor withholding for the W-2 |
| **PEO entry or exit** | A CPEO reports under its own EIN; a non-certified PEO under its own; the client under its own after exit | Continue under a CPEO (IRC 3511 successor rule); restart under a non-certified PEO | The CPEO's aggregate return, then the client's own | Wages and taxes split by the EIN they were reported under |

The trap is treating the first as the third or the second as the first. A provider change is not an acquisition: the employer didn't change, so there is no predecessor and no Schedule D, and the wage bases never restarted. An acquisition is not a provider change: the new EIN can't file the old EIN's returns, and without the successor rules it starts every base at zero.

## How the Platforms Do It

What providers and embedded APIs publish about switching in, as of November 2026:

| Vendor | Published mechanism |
| --- | --- |
| **Check** | A Company Pay History component that "allows an employer to input their year-to-date pay history as part of the Embedded Setup process," emitting an event "when a user successfully submits a historical payroll"; a previous-provider access component "to gain access to a company's previous provider for migration," slated for deprecation with Embedded Setup on January 1, 2027 |
| **Finch** | An initial sync that pulls "2 full years of historical data" plus year to date from a connected payroll system, the read side of a migration ([Unified HR & Payroll APIs](/books/workforce/unified-hr-apis#sync-cadence-and-freshness)) |
| **Gusto Embedded** | External payrolls ("Creates a new external payroll for a company") with a check date, a payment period and tax liabilities, `unprocessed` until the liabilities are entered and finalized, then `processed` and locked; a separate migration of an existing Gusto company into a partner's product, with a readiness check whose `errors` are blocking and `warnings` are not; and, on the leaving side, suspensions with `reason`, `leaving_for` and a `reconcile_tax_method` that must be `refund_taxes` when switching |
| **Paylocity** | Switching concentrated in the first calendar quarter, which drives its new client counts in January to March |

Two patterns. **History arrives as payrolls, not totals.** Check's component submits "a historical payroll"; Gusto's object is an external payroll with a check date and liabilities. Loading per check date rather than one year-to-date number is what lets the new provider build a correct Schedule B, split quarters and compute wage bases at each date. **Leaving is a tax decision.** The suspension's `refund_taxes` setting is the old provider deciding what to do with taxes it collected for periods it won't file; the new provider needs to know which way that went.

## Rev. Proc. 2004-53: Standard and Alternate Procedures

When a business is sold, the predecessor and the successor have to decide who reports the year's wages on the W-2. Rev. Proc. 2004-53 (2004-34 I.R.B. 320, superseding Rev. Proc. 96-60) applies when "an employer (successor) acquires substantially all the property" "used in a trade or business of another employer (predecessor), or ... used in a separate unit of a trade or business of a predecessor," and, "in connection with or immediately after the acquisition (but during the same calendar year), the successor employs individuals who immediately prior to the acquisition were employed in the trade or business of the predecessor."

**Standard procedure (section 4).** "The predecessor performs all the reporting duties for the wages and other compensation it pays," and the successor does the same for what it pays. Each furnishes its own W-2s and files its own Copy A; a predecessor that stops paying wages files a final 941 for the quarter of the acquisition and furnishes W-2s on an expedited basis. The successor must "secure new Forms W-4 from the transferred employees" (Pub 15). No Schedule D: for the standard procedure the instructions say "Do not file Schedule D (Form 941)."

**Alternate procedure (section 5).** "If ... the predecessor and successor so agree, the predecessor will be relieved from furnishing Forms W-2 to any employees who will be employed in the same calendar year by the successor (acquired employees)," and "The predecessor's entire Form W-2 reporting obligations for the acquired employees will be assumed by the successor." The successor's W-2 then includes the wages and withholding of both employers. Because the predecessor's 941s report wages that no predecessor W-2 shows, and the successor's W-2s show wages its 941s never reported, both file Schedule D (Form 941), "Report of Discrepancies Caused by Acquisitions, Statutory Mergers, or Consolidations." The predecessor "must transfer to the successor all current Forms W-4 that were provided to the predecessor by the acquired employees," along with IRS lock-in notices, and may do so electronically.

**Statutory mergers and consolidations** (section 6) are different again: the surviving corporation is treated as the same employer as the absorbed one, and the Schedule D instructions cover the reporting differences that follow.

The successor wage rules and the reporting procedure are separate questions. Whether the successor may count the predecessor's wages toward the bases is decided by the regulations below; the procedure decides only whose W-2 shows them.

## Successor Wage Bases

**Social Security.** 26 CFR 31.3121(a)(1)-1(b) treats wages paid by the predecessor "during such calendar year and prior to such acquisition" as "having been paid by the successor" for the annual wage limitation, when three conditions all hold: "(i) The successor during a calendar year acquired substantially all the property used in a trade or business, or used in a separate unit of a trade or business, of the predecessor; (ii) Such employee was employed in the trade or business of the predecessor immediately prior to the acquisition and is employed by the successor in his trade or business immediately after the acquisition; and (iii) Such wages were paid during the calendar year in which the acquisition occurred and prior to such acquisition." The method of acquisition doesn't matter.

**Additional Medicare.** Pub 15 applies the same treatment to the "Additional Medicare Tax withholding threshold (that is, $200,000 in a calendar year)."

**FUTA.** IRC 3306(b)(1) has the same structure for the $7,000 base: remuneration paid "by such predecessor during such calendar year and prior to such acquisition shall be considered as having been paid by such successor employer." Pub 15's FUTA section puts it as "you may be able to count the wages that employer paid to the employees who continue to work for you," and [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#successor-employers-and-wage-base-transfers) notes the condition that the predecessor was required to file Form 940.

**State unemployment.** Each state has its own rule. California's EDD says that when you acquire a business, "wages previously paid by the former employer in the current calendar year are applied to the" taxable wage limits for UI and the employment training tax, that the buyer can apply to receive "all or part of the seller's reserve account balance," which "may immediately reduce or increase your unemployment insurance tax rate," and that a buyer "may be held responsible for the previous owner's liability with the EDD" unless it obtains a certificate of release. California's UI taxable wage limit is "$7,000 per employee, per calendar year." Federal law requires states to transfer experience between employers under common ownership and to deny it to buyers acquiring a business mainly for its rate ([42 USC 503(k)](/books/workforce/fica-futa-and-suta#successor-employers-and-wage-base-transfers)).

### Worked Numbers: An Acquisition on July 1

Invented: an employee is paid $20,000.00 a month. The predecessor pays January through June, $120,000.00; on July 1, 2026 a successor acquires substantially all of the business's property and employs the employee immediately, paying July through December, $120,000.00. No pre-tax deductions, for simplicity. Rates: Social Security 6.2% to the $184,500 base, Additional Medicare 0.9% withheld on wages over $200,000.

**If the acquisition qualifies** under 31.3121(a)(1)-1(b):

| | Predecessor (Jan to Jun) | Successor (Jul to Dec) | Year |
| --- | --- | --- | --- |
| Wages paid | $120,000.00 | $120,000.00 | $240,000.00 |
| Social Security wages | $120,000.00 | $184,500 − $120,000 = $64,500.00 | $184,500.00 |
| Employee Social Security, 6.2% | $7,440.00 | $3,999.00 | $11,439.00 |
| Additional Medicare withheld, 0.9% over $200,000 | $0 | 0.9% x ($240,000 − $200,000) = $360.00 | $360.00 |
| FUTA wages | $7,000.00 | $0 | $7,000.00 |

The successor's payroll has to know the $120,000.00 before its first July paycheck: its engine stops Social Security in the October payroll, when its own $64,500.00 is reached ($20,000 in each of July, August and September, $4,500 in October), and starts withholding Additional Medicare when the combined wages pass $200,000 in November.

**If it doesn't qualify** (the successor bought only some assets, or hired the employee weeks later), the successor starts at zero: Social Security on all $120,000.00, $7,440.00 more from the employee and $7,440.00 from the successor, so $3,441.00 more each than the qualifying case; no Additional Medicare withheld by either, because neither employer pays more than $200,000; and FUTA on another $7,000.00. The bases are per employer, and the successor rule is the only general way across that line.

**How the W-2s look** under each procedure, in the qualifying case:

| Procedure | Predecessor W-2 | Successor W-2 | Schedule D |
| --- | --- | --- | --- |
| Standard | Box 1 $120,000.00; box 3 $120,000.00; box 4 $7,440.00 | Box 1 $120,000.00; box 3 $64,500.00; box 4 $3,999.00 | Not filed |
| Alternate | None for this employee | Box 1 $240,000.00; box 3 $184,500.00; box 4 $11,439.00; box 2 includes both employers' income tax withheld | Filed by both |

Under the standard procedure the employee gets two W-2s whose box 3 amounts add to the base; under the alternate procedure one W-2 shows the year. The successor's systems differ accordingly: the standard procedure needs the predecessor's wages only as base inputs (a [`successor_wage_transfers`](/books/workforce/fica-futa-and-suta#how-to-build-it) row per worker and tax), while the alternate procedure needs the predecessor's full W-2 detail (every box, including income tax withheld and box 12 amounts) loaded as reportable history, plus the Schedule D reconciliation.

## Year-to-Date Loading and Quarter Boundaries

A provider change under the same EIN is the common case, and the rules are simpler and stricter: the employer is one taxpayer all year, so everything the new provider files for the year must include what the old provider paid. Three facts set the plan:

- **The 941 is per EIN per quarter.** Whoever files a quarter's 941 reports all of that quarter's wages, taxes and deposits, including Schedule B's liability by day for a semiweekly depositor ([The Returns](/books/workforce/deposits-and-returns#the-returns)).
- **The W-2 is per EIN per year.** The new provider's W-2s, if it files them, include January through December.
- **Wage bases and limits are per employer per year,** so the new provider's engine needs each worker's year-to-date for every capped key from its first check date.

### Worked Numbers: A Switch Between Quarters, and One Inside a Quarter

The invented employer from [The Life of a Pay Run](/books/workforce/workforce-business#the-life-of-a-pay-run): 40 employees paid biweekly on Fridays, each run $160,000.00 gross, $155,200.00 Social Security and Medicare wages, $14,880.00 federal income tax withheld, federal liability $38,625.60 per run (withholding plus both halves of FICA). Its 2026 check dates fall on January 2 and every other Friday through December 18: seven in the first quarter, six in the second, seven in the third (July 3, 17 and 31, August 14 and 28, September 11 and 25) and six in the fourth (October 9 and 23, November 6 and 20, December 4 and 18).

**Switch at the quarter boundary,** first new-provider check date October 9. The old provider files the third-quarter 941 and the state third-quarter returns. The new provider loads year-to-date only, but per check date: 20 historical payrolls (January 2 through September 25), $3,200,000.00 of wages, $3,104,000.00 of Social Security and Medicare wages, $297,600.00 of federal income tax withheld, all deposited by the old provider. Quarter-to-date for the fourth quarter starts at zero. Each employee averages $80,000.00 of year-to-date wages, under the Social Security base, so no worker's tax changes; but the year-to-date drives the W-2s, the FUTA and SUI bases and the 401(k) limits.

**Switch inside the quarter,** first new-provider check date August 28. The old provider paid four third-quarter runs (July 3, 17 and 31 and August 14) and should not file the third-quarter 941, because the new provider will file it for the whole quarter. The new provider loads, in addition to the first and second quarters:

| Third quarter loaded from the old provider | Amount |
| --- | --- |
| Wages, 4 runs x $160,000.00 | $640,000.00 |
| Federal income tax withheld, 4 x $14,880.00 | $59,520.00 |
| Social Security and Medicare wages, 4 x $155,200.00 | $620,800.00 |
| Federal liability, 4 x $38,625.60 | $154,502.40 |
| Deposits made by the old provider | $154,502.40, on four dates |
| Schedule B daily liabilities | $38,625.60 on each of July 3, 17 and 31 and August 14 |

The new provider's third-quarter 941 then reports 7 runs: wages $1,120,000.00; income tax withheld $104,160.00; Social Security tax 12.4% x $1,086,400.00 = $134,713.60; Medicare tax 2.9% x $1,086,400.00 = $31,505.60; total $270,379.20, which is 7 x $38,625.60. Deposits on line 13 are the old provider's $154,502.40 plus its own three runs' $115,876.80. Without the four loaded runs, the 941 would show $115,876.80 of liability against deposits the IRS has recorded at $270,379.20, and the employer would receive a notice for a quarter it paid correctly ([Tax Notices, Amendments & Agency Accounts](/books/workforce/tax-notices-and-agency-accounts)).

**State unemployment wages, with or without the load.** With an invented state base of $7,000.00 and an invented employer rate of 3.4%, each employee earning $4,000.00 a run passed the base on January 16. A new provider that starts without year-to-date taxes the first $7,000.00 again: 3.4% x $7,000.00 = $238.00 per employee, $9,520.00 for the 40, every dollar of it an overpayment the employer then has to claim back from the state. The same failure on the federal side over-withholds Social Security from anyone who crossed the base before the switch.

My rule: switch on a quarter boundary when the employer can choose, on January 1 when it can choose more, and when it can't, load every historical payroll per check date and reconcile the loaded quarter to the old provider's own register before the first live run.

## Parallel Runs

A parallel run computes one or two real pay periods on both systems and compares, before the new one pays anyone ([Big Bang, Phased or Parallel](/docs/architecture/replacing-systems#big-bang-phased-or-parallel)). For payroll the comparison is per worker and per line, and the expected differences have to be classified before anyone decides the new system is wrong:

- **Rounding and method.** One engine rounds each period's Social Security; another computes it cumulatively and trues up, so a cent can differ on a given check and not over the year ([Rounding](/books/workforce/gross-to-net#rounding)). Withholding under the percentage method and the wage bracket method differ by design.
- **Inputs mapped differently.** An earning code mapped to the wrong pay item type shows up as a tax difference on that one code: a bonus treated as regular wages is withheld at the aggregate rate instead of 22%.
- **Elections not carried.** A W-4 with Step 4(c) extra withholding, a state exemption certificate or a lock-in letter missing on the new side.
- **Year-to-date wrong.** A deferral that stops early because the loaded year-to-date double-counted a correction; Social Security that continues past the base because a predecessor's wages weren't loaded.
- **Genuine bugs** on either side.

The output of a parallel run is a list of differences, each with a class and an owner, and a go or no-go rule decided in advance: for example, zero unexplained differences in net pay, and every tax difference explained by a known method difference. Two periods are better than one when the first crosses a boundary (a quarter, a holiday, a bonus).

## Data Mapping

A migration is a crosswalk from the old provider's identifiers and codes to the new one's, held as data and checked, never as a script someone ran once ([Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping)). The objects and what goes wrong with each:

| Object | Map to | What goes wrong |
| --- | --- | --- |
| Employees and employee numbers | `persons`, `workers`, `employments` | Rehires and transfers between EINs collapse or split; terminated employees paid this year are left out and have no W-2 |
| Earning and deduction codes | `earning_codes`, `deduction_codes`, each to a [`pay_item_types`](/books/workforce/workforce-business#the-core-data-model) row | A code mapped by name rather than taxability: "Bonus" that was really a nontaxable reimbursement |
| Year-to-date per tax key | Historical payrolls (statement lines per check date) | Totals loaded as one number can't split quarters or build Schedule B; corrections and voids in the old system double-counted |
| Tax elections | `tax_elections` with the source form | Legacy pre-2020 W-4s mapped as 2020 forms; state forms lost; exempt claims carried past their expiry |
| Bank accounts and splits | `bank_accounts`, `pay_distributions` | Account numbers re-entered by hand; a split order reversed; prenote status lost so the first deposit goes untested |
| Garnishment orders | `garnishment_orders` with arrears and amounts paid to date | An order's balance or the amount already withheld this period lost, overpaying or underpaying the payee |
| Deductions with goals and limits | `deduction_elections` with goal and annual limit | A loan's remaining balance or a deferral's year-to-date not carried, so the limit or goal is missed |
| Leave balances | `leave_ledger` as an opening `adjustment` entry | Balances carried without the accrual history the state's rules need for caps and carryover |
| Tax registrations and rates | `tax_registrations` | SUI rates, local account numbers and deposit frequencies left at defaults |

Load with side effects off: no welcome emails, no prenotes fired at every account, no new hire reports filed for employees hired years ago ([Load With Side Effects Off](/docs/architecture/replacing-systems#load-with-side-effects-off)). Then reconcile the load to the old provider's own reports: year-to-date by worker and tax, quarter-to-date, and the prior quarters' 941 totals, with every difference explained before the first parallel run ([Reconciliation](/docs/architecture/replacing-systems#reconciliation)).

## PEO Entry and Exit

A PEO move is the third event, and the CPEO rules make it a successor case in both directions. Under IRC 3511, a certified PEO "is treated as the employer" of its work site employees for employment taxes on the wages it pays, and it is treated as the successor of its customer when the contract starts and the customer as successor when it ends, so wage bases continue across both moves. A non-certified PEO reporting under its own EIN gets no such rule, and the bases restart: [Wage Base Restarts](/books/workforce/peos-and-co-employment#wage-base-restarts) works the cost for one employee and forty. On exit, the CPEO files Form 8973 within 30 days, the client deposits under its own EIN on its own lookback history, and its unemployment account comes back on each state's terms ([Leaving a PEO](/books/workforce/peos-and-co-employment#leaving-a-peo)).

For the new system the data rule is the same as a provider change, with one more dimension: load the year's history split by the EIN it was reported under. A W-2 for a client employee who left a CPEO on July 1 may come from the CPEO for January to June and from the client for July to December, and the client's provider has to know which wages it may count toward its bases (all of them, under 3511) and which it reports (only its own).

## The Go-Live Calendar

A switch is a project with legal deadlines inside it. Worked for an invented provider change with a first new-provider check date of Friday, October 9, 2026, the quarter-boundary case above:

| When | Task | Why |
| --- | --- | --- |
| By early August | Sign the new provider's agreements; the employer authorizes it as reporting agent on Form 8655 and signs state powers of attorney and agency authorizations | The new provider needs authority before it can deposit or file ([Reporting Agent](/books/workforce/who-runs-payroll#reporting-agent)) |
| August | Funding account verified and debit authorized; employees, codes, elections, bank accounts and registrations loaded with side effects off | Verification takes days; nothing should email or prenote yet |
| Early September | Load historical payrolls for January through August and reconcile to the old provider's registers and second-quarter 941 | The year-to-date is the hardest data |
| Paydays September 11 and 25 | Parallel runs on the new provider against the old provider's live payrolls | Two periods, the second loaded as history after the old provider pays it |
| By October 1 | September 25 payroll loaded as history; old provider told which filings it keeps: the third-quarter 941 and state returns (due November 2, since October 31 is a Saturday), and the September 25 deposit (due Wednesday, September 30) | The old provider's last obligations, and the suspension settings that decide refunds of collected taxes |
| Monday, October 5 | First live approval on a 4-day speed | Debit Monday for Friday |
| Friday, October 9 | First live check date | |
| November and after | Check the old provider's third-quarter filings in the employer's agency accounts and the EFTPS deposit history | The employer is liable whoever filed ([The Employer's Own EFTPS](/books/workforce/who-runs-payroll#the-employer-s-own-eftps)) |
| January 2027 | New provider files fourth-quarter returns, Form 940 and every 2026 W-2 for January through December | It loaded the whole year |

The same calendar for a January 1 switch is shorter in the middle: no third- or fourth-quarter history to load, only the prior year's records for amendments and W-2c requests, which stay with the old provider. Paylocity's first-quarter switching is the market voting for that version.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `accumulators` is a view over paid statement lines; [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#how-to-build-it) added `successor_wage_transfers` for acquisitions. This chapter loads history as payrolls so the view and every report work unchanged, and adds the load batch, parallel runs and the mapping crosswalk.

```sql
-- History from a previous provider arrives as paid runs of their own type, per check date.
ALTER TABLE pay_runs                     -- one statement: no moment without the check
  DROP CONSTRAINT pay_runs_run_type_check,
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT pay_runs_run_type_check CHECK (run_type IN ('regular', 'off_cycle', 'bonus',
    'correction', 'void', 'reversal', 'third_party_sick', 'historical')) NOT VALID;
ALTER TABLE pay_runs ADD COLUMN ytd_load_id UUID;   -- set on historical runs

-- One load of history from one source, with its reconciliation.
CREATE TABLE ytd_loads (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  source              TEXT NOT NULL,         -- the previous provider, a CPEO, a predecessor
  source_ein          CHAR(9) NOT NULL,      -- the EIN the wages were reported under
  event               TEXT NOT NULL CHECK (event IN ('provider_change', 'acquisition_standard',
                        'acquisition_alternate', 'cpeo_entry', 'cpeo_exit', 'peo_exit')),
  tax_year            SMALLINT NOT NULL,
  through_check_date  DATE NOT NULL,         -- the last historical check date loaded
  granularity         TEXT NOT NULL CHECK (granularity IN ('per_check_date', 'per_quarter',
                        'year_to_date')),
  files_quarter_from  DATE,                  -- first quarter start this provider files
  reconciled_to       JSONB,                 -- control totals per quarter from the source's 941s
  differences         JSONB,                 -- unexplained differences; empty to go live
  status              TEXT NOT NULL CHECK (status IN ('loading', 'loaded', 'reconciled',
                        'approved', 'reversed')),
  approved_by         TEXT,
  approved_at         TIMESTAMPTZ
);

ALTER TABLE pay_runs ADD FOREIGN KEY (ytd_load_id) REFERENCES ytd_loads (id) NOT VALID;

-- A period computed on both systems, compared worker by worker.
CREATE TABLE parallel_runs (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pay_period_id       UUID NOT NULL REFERENCES pay_periods (id),
  shadow_pay_run_id   UUID NOT NULL REFERENCES pay_runs (id),   -- computed, never approved
  source_register_ref TEXT NOT NULL,         -- the old provider's register, stored
  workers_compared    INT NOT NULL,
  differences         JSONB NOT NULL,        -- [{worker, line, ours, theirs, class, owner}]
  unexplained_count   INT NOT NULL,
  go_rule             TEXT NOT NULL,         -- decided in advance
  decision            TEXT CHECK (decision IN ('go', 'no_go', 'repeat')),
  decided_by          TEXT,
  decided_at          TIMESTAMPTZ
);

-- The crosswalk from the old system's identifiers to ours, kept for the year and beyond.
CREATE TABLE migration_mappings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ytd_load_id         UUID NOT NULL REFERENCES ytd_loads (id),
  object_kind         TEXT NOT NULL CHECK (object_kind IN ('worker', 'earning_code',
                        'deduction_code', 'tax_code', 'location', 'department', 'bank_account',
                        'garnishment', 'leave_policy', 'benefit_plan')),
  source_ref          TEXT NOT NULL,         -- the old system's ID or code
  source_label        TEXT,
  target_table        TEXT NOT NULL,
  target_id           UUID,                  -- null: deliberately not migrated
  rationale           TEXT,                  -- why this mapping, for codes especially
  mapped_by           TEXT NOT NULL,
  UNIQUE (ytd_load_id, object_kind, source_ref)
);

-- The load per quarter, against the control totals from the source's registers and 941s.
SELECT date_trunc('quarter', r.check_date)::DATE AS quarter,
       SUM(l.amount) FILTER (WHERE l.line_type = 'earning')                AS wages,
       SUM(l.amount) FILTER (WHERE l.tax_type = 'fit')                     AS fit_withheld,
       SUM(l.amount) FILTER (WHERE l.line_type IN ('employee_tax', 'employer_tax')
                               AND l.jurisdiction_id = :federal
                               AND l.tax_type <> 'futa')                AS federal_941_liability
FROM pay_runs r
JOIN pay_statements s ON s.pay_run_id = r.id
JOIN pay_statement_lines l ON l.pay_statement_id = s.id
WHERE r.ytd_load_id = :load AND r.run_type = 'historical'
GROUP BY 1
ORDER BY 1;
```

Design notes:

- **Historical runs are paid runs with no money.** They carry `status = 'paid'` so the accumulators view includes them, no `money_movements`, and liabilities created as `remitted` with remittances recorded from the old provider's deposit history, so the 941's deposit line and Schedule B come from rows.
- **Loads are reversible as a batch.** A load reconciled wrong is reversed by `ytd_load_id` before any live run reads it; once a live run has, corrections go through the ordinary corrections process.
- **The source EIN travels with the history.** For acquisitions and PEO moves, `ytd_loads.source_ein` keeps predecessor or CPEO wages separate from the employer's own: counted toward bases through `successor_wage_transfers`, reported on the employer's W-2 only under the alternate procedure.
- **The crosswalk outlives the migration.** A W-2c request, a garnishment payee's question or an amended return a year later needs the old ID ([Keep the Old System as a Read-Only Archive](/docs/architecture/replacing-systems#keep-the-old-system-as-a-read-only-archive)).
- **The parallel run never reaches money.** Its shadow run can't be approved; a constraint or a run type that the approval path refuses keeps it that way.

## Auditing

A mid-year change leaves two record keepers for one year, and the agencies see only the employer. Keep:

- **The load and its reconciliation:** source reports as received, control totals per quarter, and the approval to go live.
- **Who filed what:** for each quarter and the year, which provider filed each return and made each deposit, from the authorization records and the agencies' acknowledgments.
- **The successor determination** for an acquisition: the purchase agreement facts that make it qualify, the procedure chosen, the predecessor's wage detail and both Schedule Ds.
- **The crosswalk and every code mapping's rationale,** so a taxability question about an old code can be answered.
- **Parallel run results and the go decision,** with the differences and their classes.

## What This Means for the System You Build

- **Classify the event first:** provider change, acquisition or PEO move decide whether bases continue, who files and what history is needed.
- **Load history as payrolls per check date,** with liabilities and deposits, not as year-to-date totals.
- **Whoever files a quarter's 941 needs the whole quarter,** including Schedule B by day; prefer quarter boundaries, and January 1 above all.
- **Compute successor bases from the regulation's three conditions** and record the predecessor's wages per worker and tax; choose the W-2 procedure separately.
- **Reconcile the load to the old provider's registers and returns** before the first parallel run, and decide go or no-go by a rule set in advance.
- **Keep the crosswalk and the source EIN** for as long as the year's records.
- **Tell the old provider what it still files,** and verify those filings in the employer's own agency accounts afterwards.

## References

**Law and regulation**

- [26 CFR 31.3121(a)(1)-1](https://www.law.cornell.edu/cfr/text/26/31.3121(a)(1)-1), the successor employer rule for the Social Security wage base and its three conditions
- [26 USC 3306](https://www.law.cornell.edu/uscode/text/26/3306), the $7,000 FUTA wage base and the successor employer rule in (b)(1)
- [26 USC 3511](https://www.law.cornell.edu/uscode/text/26/3511), a certified PEO treated as the employer and as successor at the start and end of a contract

**Agency guidance and forms**

- [IRS: Internal Revenue Bulletin 2004-34](https://www.irs.gov/irb/2004-34_IRB), Rev. Proc. 2004-53: scope, the standard procedure, the alternate procedure, Schedule D, Form W-4 transfer and statutory mergers
- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), the $184,500 wage base, the successor employer rule for the wage base and Additional Medicare threshold, new W-4s from transferred employees, Schedule D, and FUTA successor wages
- [IRS: Instructions for Schedule D (Form 941)](https://www.irs.gov/instructions/i941sd), when to file under the standard and alternate procedures, qualifying acquisitions and statutory mergers
- [California EDD: Changes to your business](https://edd.ca.gov/en/payroll_taxes/Changes_to_Your_Business/), predecessor wages applied to the taxable wage limits, reserve account transfers and successor liability
- [California EDD: Rates and withholding](https://edd.ca.gov/en/payroll_taxes/rates_and_withholding/), the $7,000 UI taxable wage limit and keeping the previous owner's rate

**Filings**

- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), clients switching solutions in the first calendar quarter

**Vendor documentation**

- [Check: Company pay history](https://docs.checkhq.com/reference/company-pay-history.md), the component for year-to-date pay history and historical payroll events
- [Check: Previous payroll provider access](https://docs.checkhq.com/reference/previous-payroll-provider-access.md), access to a previous provider for migration and its deprecation
- [Gusto Embedded: Create an external payroll](https://docs.gusto.com/embedded-payroll/reference/post-v1-external-payroll.md), external payrolls with check dates, payment periods and tax liabilities, and their statuses
- [Gusto Embedded: Migrate an existing company](https://docs.gusto.com/embedded-payroll/docs/migrate-existing-company.md), the migration steps and the readiness check's blocking errors and warnings
- [Finch: Data syncs](https://developer.tryfinch.com/developer-resources/Data-Syncs.md), the initial sync of two years of history and year to date
