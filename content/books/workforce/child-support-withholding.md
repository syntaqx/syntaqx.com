+++
title = "Child Support Withholding"
nav_title = "Child Support"
description = "Income withholding for child support: the IWO and e-IWO, timing, priority, the 50 to 65% limits, disbursement units, multiple orders, terminations and NMSNs."
category = "Workforce Industry"
order = 2624
part = "Moving the Money"
tags = ["payroll", "child-support", "garnishment", "income-withholding", "nmsn", "compliance"]
+++

Child support is the order payroll sees most and the one with the strongest claim on a paycheck. Federal law requires every state to collect support by income withholding, makes the employer the collector, and gives the order "priority over any other legal process under State law." The employer withholds the amount the order states, up to a federal ceiling of 50% to 65% of disposable earnings, sends it to the state's disbursement unit within seven business days of payday, and is "liable to the State for any amount which such employer fails to withhold." A new hire report is often what brings the order: state child support agencies match new hire data against open cases, so an employer that hired someone in November can receive an income withholding order for them before Thanksgiving. A payroll system handles thousands of these orders, from every state, each on the same federal form, with the details (start dates, fees, limits, how multiple orders share a paycheck) set by the law of the state where the worker principally works.

This chapter covers the employer's side: the income withholding order and its electronic version, the employer's duties and clocks, priority over other orders, the federal limits and how state limits sit under them, remitting to state disbursement units, multiple orders and proration, terminations and lump sums, and medical support notices. Other wage garnishments, tax levies and the stacking of all of them on one paycheck are [Garnishments & Levies](/books/workforce/garnishments-and-levies); the bank account side of child support enforcement (the quarterly data match and liens on deposits) is Banking & Lending's [Child Support](/books/banking-and-lending/legal-process#child-support).

## How the Platforms Do It

What embedded payroll APIs publish about child support, as of November 2026:

| Platform | What it publishes |
| --- | --- |
| **Check** | Child support is a post-tax deduction type with required fields taken from the order: `external_id` ("the case number listed on the order"), `agency` ("the two-letter abbreviation for the state or territory child support disbursement unit"), `issue_date`, `amount` per pay period and `max_percent` ("the maximum percentage of disposable to garnish"); "Child Support garnishments are always processed before miscellaneous garnishments"; multiple child support orders are "partially applied according to Administration for Children and Families rules" when they exceed the limit; with `managed` true (the default), Check includes the amount in the cash requirement and remits it "to the appropriate agency on behalf of the employer"; a child support payments report |
| **Gusto Embedded** | A child support data endpoint returning each state agency's name, FIPS codes and required case attributes ("Most states use a state-level FIPS code, while some require county-level FIPS codes (e.g. FL, IL, NY)"; Ohio requires `case_number` and `order_number`; North Dakota a `remittance_number` instead of a case number); child support garnishments must be `court_ordered: true` and `deduct_as_percentage: true`, with `amount` as the maximum percentage and `pay_period_maximum` as the dollars; "For almost all states, Gusto automatically remits garnished wages to the appropriate agency," but it "cannot automatically pay garnishments if the garnishment was collected on an off-cycle payroll," and South Carolina requires manual payment |

Two things stand out. **The order is two numbers.** Both APIs store a dollar amount per pay period and a maximum percentage of disposable earnings, and withhold the lesser, which is exactly how the law works: the order says what is owed, federal and state law say how much of this paycheck may go to it. **Remittance is data-driven by state.** Each state's disbursement unit wants different identifiers (a FIPS code at state or county level, a case number, an order number, a remittance number), and the payroll system's reference table of agencies is as important as its calculation. My rule: store the order as served, the limit that applies as computed for the worker's principal place of employment, and the per-period amounts as a derived plan, so each can be explained separately.

## The Income Withholding Order

Every state must use income withholding, and the notice to the employer must be "in a standard format prescribed by the Secretary": the federal **Income Withholding for Support** form (IWO), OMB control number 0970-0154, which the federal child support office calls "the required, standard form used to order and notify employers and income providers." A July 2026 Federal Register notice sought to extend the form for three years with changes, stating that "The current OMB approval expires August 31, 2026." The form carries:

- **The parties and the case:** the issuing state, tribe or court, the employee, the custodial party, the children, and the case or order identifiers the disbursement unit needs to apply the payment.
- **The amounts:** current support, past-due support (and whether arrears are more than 12 weeks old), medical support, and other amounts, each per a stated period, with the total per pay period.
- **The limits:** the percentage of disposable earnings the employer may not exceed, which by law follows the state where the employee principally works.
- **Where to send it:** the state disbursement unit and the remittance identifier.
- **The employer's instructions:** when to start, how to report terminations and lump sums, and what to do with multiple orders.
<!-- source-gap: wf-iwo-instructions | missing | The IWO form's employer instructions: the start rule, lump sum reporting, pay frequency conversion and multiple-order text | closes with: the current IWO form and instructions from the federal child support office (acf.gov), or a state agency's copy | checked: 2026-11-09 -->

**Who can send it.** A state child support agency issues most orders administratively; a court, a tribe, or a private party with a court order can issue one too. Federal rules require employers to honor an order from any state: a notice from another state's agency is binding as if issued locally, and for an order sent directly by another state the law of the employee's "principal place of employment" governs the fee, the limits, the timing and the priorities.

**How it arrives.** On paper, by fax, or electronically. The **e-IWO** program lets employers receive orders and send acknowledgments through the federal child support office's electronic exchange instead of mail; the same Federal Register notice's burden table lists 1,214,289 employers at 5.23 responses each and 48,978 e-IWO employers at 41.56, and says "more employers using electronic IWO (e-IWO) has decreased the burden." For a provider receiving orders on behalf of thousands of employers, e-IWO means structured data instead of transcription, and acknowledgments that tell the state immediately whether the employee works there.

## The Employer's Duties and Clocks

Federal law and its regulations set these; state law adds detail:

| Duty | Rule | Source |
| --- | --- | --- |
| Withhold the amount stated | "withhold... the amount specified by such notice" up to the federal maximum, including arrears, plus the employer fee | 42 USC 666(b)(1), (b)(6)(A)(i) |
| Start | As the notice and the principal-employment state's law say; New York, for example, requires withholding "no later than the first pay period that occurs fourteen days after service" | 45 CFR 303.100(f); NY CPLR 5241 |
| Remit | To the state disbursement unit "within 7 business days" after the date the employee is paid, and report the date of withholding | 42 USC 666(b)(6)(A)(i); 45 CFR 303.100(e)(1)(ii) |
| Combine payments | States must let an employer "combine all withheld amounts into a single payment" to each disbursement unit, with each employee's share identified | 42 USC 666(b)(6)(B) |
| Keep going | The notice is binding "until further notice by the State" | 45 CFR 303.100(e)(1)(iv) |
| Report a termination | "the employer must notify the State promptly when the noncustodial parent terminates employment," with the last known address and new employer if known | 45 CFR 303.100(e)(1)(x) |
| Don't retaliate | States must fine employers that discharge, refuse to hire or discipline an employee because of withholding | 42 USC 666(b)(6)(D) |
| Pay what you didn't withhold | "The employer must be held liable to the State for any amount which such employer fails to withhold" | 42 USC 666(b)(6)(C) |

### Remitting to the State Disbursement Unit

The seven business days run from the payday, and "business day" is the state's: a provider remitting for one employer to many states needs each state's holiday calendar. Worked for a Friday, November 20, 2026 payday under the federal holiday calendar, my example: Monday 23 (1), Tuesday 24 (2), Wednesday 25 (3), Thanksgiving Thursday 26 skipped, Friday 27 (4), Monday 30 (5), Tuesday, December 1 (6), Wednesday, December 2 (7). The deadline is Wednesday, December 2, and in a state that also closes the Friday after Thanksgiving it is Thursday, December 3. A provider that remits the next business day after payday, as most automated ones do, never comes near the edge; one that batches weekly needs the calendar.

The payment is an ACH credit (CCD+ with a child support addenda record is the industry's format) or a check, combined per disbursement unit with each employee's case identifier and amount. That record is how the state credits the right parent; a payment without the identifiers the agency requires is money the state can't apply. Gusto's per-state required attributes and Check's `agency` field are the same reference data.
<!-- source-gap: wf-cs-edi | missing | The child support payment addenda format (the DED application banking convention used with CCD+) and its fields | closes with: the federal child support office's EFT/EDI guide for employers or a state disbursement unit's employer EFT instructions | checked: 2026-11-09 -->

**Employer fees.** Federal law lets the state set a fee "to be paid to the employer unless waived." Washington, for example, allows up to $10 for the first disbursement and $1 for each one after. The fee is taken from the employee's pay, not the support, and it is per state, so it belongs in the same reference table as the remittance identifiers.

## Priority

Support "must be given priority over any other legal process under State law against the same income." In practice that means support is calculated first among orders: Check processes child support "always... before miscellaneous garnishments," and California's employer's return ranks a wage and earnings assignment order for support and an earnings withholding order for support ahead of a tax order, an elder abuse order and an ordinary creditor's order. Two federal priority rules interlock with it:

- **Federal student loan and agency garnishments yield to support.** Treasury's administrative wage garnishment rule says "family support shall have priority" ([Garnishments & Levies](/books/workforce/garnishments-and-levies#federal-agency-and-student-loan-garnishment)).
- **IRS levies exempt prior support.** Child support ordered before an IRS levy is exempt from the levy, but "The taxpayer is not entitled to the support exemption unless the support is being paid" ([IRS Levies](/books/workforce/garnishments-and-levies#irs-levies)).

## The Limits: 50 to 65 Percent

The Consumer Credit Protection Act caps support withholding at a higher share of disposable earnings than any other garnishment:

| The employee | Arrears more than 12 weeks old? | Maximum of disposable earnings |
| --- | --- | --- |
| Supports another spouse or dependent child | No | 50% |
| Supports another spouse or dependent child | Yes | 55% |
| Doesn't | No | 60% |
| Doesn't | Yes | 65% |

The statute's arrears test is support "with respect to a period which is prior to the twelve-week period which ends with the beginning of such workweek." **Disposable earnings** are what is left "after the deduction... of any amounts required by law to be withheld": federal, state and local income taxes, the employee's Social Security and Medicare, state unemployment and disability contributions, and legally required retirement. Voluntary deductions (health premiums, 401(k) deferrals, union dues) are not subtracted, so a worker can't shelter wages from support by increasing a deferral ([Gross-to-Net, Step by Step](/books/workforce/gross-to-net#the-calculation-order)).

**State limits sit under the federal ones.** Federal law sets the maximum; a state may set less, and the CCPA leaves "more limited" state garnishment laws in force. Washington's withholding, for example, "shall not exceed 50 percent of the responsible parent's disposable earnings," whatever the federal table allows. The order's percentage, the federal table and the principal-employment state's cap are three numbers; the lowest wins.

### Worked Numbers: One Order

An invented employee in Washington is paid $2,000.00 biweekly. Legally required deductions: federal income tax $140.00, Social Security $124.00, Medicare $29.00 and Washington paid family and medical leave premiums $16.00, so disposable earnings are $2,000.00 − $309.00 = **$1,691.00**. Voluntary deductions ($100.00 to a 401(k), $80.00 for medical) are taken but not subtracted. The order: current support $550.00 and past-due $120.00 per biweekly period; the employee supports a second family, and the arrears are more than 12 weeks old.

| Test | Computation | Amount |
| --- | --- | --- |
| Ordered | $550.00 + $120.00 | $670.00 |
| Federal maximum | 55% x $1,691.00 | $930.05 |
| Washington maximum | 50% x $1,691.00 | $845.50 |
| Withheld | lesser of the three | **$670.00** |
| Employer fee | Washington: first disbursement up to $10, then $1 | $10.00, then $1.00 |

The order fits, so the whole $670.00 goes to the Washington disbursement unit within seven business days, with the case identifiers.

## Multiple Orders and Proration

When an employee has more than one support order and their total exceeds the limit, the state allocates, and federal rules bound the allocation: states must allocate "giving priority to current support but in no case shall the allocation result in a withholding for one of the support obligations not being implemented." New York's rule shows a common method: withhold "the maximum amount permitted" and pay each creditor "that proportion" of it, with current support satisfied before health premiums and arrears.

### Worked Numbers: Two Orders

The same employee receives a second order for another child: current support $400.00 biweekly, no arrears. Total ordered: $550.00 + $120.00 + $400.00 = $1,070.00, against Washington's $845.50 maximum.

| Step | Computation | Order A | Order B |
| --- | --- | --- | --- |
| Current support first | $550.00 + $400.00 = $950.00, more than $845.50 | | |
| Prorate current support | $845.50 x 550 / 950 and x 400 / 950 | $489.50 | $356.00 |
| Arrears | Nothing left under the limit | $0.00 | |
| **Withheld** | | **$489.50** | **$356.00** |

Proration rounds per order and the pennies must reconcile to the limit ($489.50 + $356.00 = $845.50); neither order goes unimplemented, and the arrears simply accrue. Check says its engine applies multiple orders "according to Administration for Children and Families rules"; a system serving many states still needs each state's allocation rule as data, because states differ on whether arrears share pro rata with current support or wait.

## Terminations, Lump Sums and Changes

- **The employee leaves.** Notify the issuing agency "promptly," with the last known address and the new employer if known. The order stays on file for a rehire only if the agency says so; a rehired worker who still owes support is matched again through new hire reporting.
- **Lump sums.** Bonuses, commissions and severance are earnings for the CCPA ("whether denominated as wages, salary, commission, bonus, or otherwise"), so the order and its limit apply to them; many states also require the employer to report a lump sum before paying it so the agency can claim more of it. The rule is state law and the IWO's instructions; the system needs a hook that holds a large off-cycle payment to an employee with an open order until the state's rule is applied. Gusto's note that it can't auto-remit garnishments collected on off-cycle payrolls is a reason to treat these runs as manual exceptions.
- **The order changes or ends.** An amended order replaces the old one from its effective date; a termination notice from the agency stops withholding. Both are new versions of the order, never edits to the old one, so a later dispute can see what applied to each paycheck.

## Medical Support: The NMSN

An order that requires the parent to provide health coverage comes with a **National Medical Support Notice**. The employer forwards Part B to the plan administrator "within twenty business days after the date of the NMSN," unless the employee isn't eligible or has left; the plan administrator then has "within 40 business days after the date of the Notice" to tell the state whether coverage is available, and a valid notice "shall be deemed to be a qualified medical child support order." Once the child is enrolled, "Employers must withhold any obligation of the employee for employee contributions," and the employer must tell the state promptly when employment ends. In the data model the NMSN is a support order component that produces a benefit enrollment and a pre-tax premium deduction: enrollment, life events and the dependent records are [Enrollment & Life Events](/books/workforce/enrollment-and-life-events). Its premium sits inside the support limit with the cash support, and New York's order of allocation puts current support before health premiums before arrears.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). A child support order is a `garnishment_orders` row with `order_type = 'child_support'` and a `deduction_elections` row pointing at it; this chapter adds the IWO's details, the per-payday remittances to disbursement units, and the medical support notice.

```sql
-- The federal IWO as received, beyond the generic order row.
CREATE TABLE income_withholding_orders (
  garnishment_order_id UUID PRIMARY KEY REFERENCES garnishment_orders (id),
  version             SMALLINT NOT NULL,     -- amended orders are new versions
  supersedes_id       UUID REFERENCES income_withholding_orders (garnishment_order_id),
  issuer_kind         TEXT NOT NULL CHECK (issuer_kind IN ('state_agency', 'court', 'tribe',
                        'private_party')),
  issuing_state       CHAR(2) NOT NULL,
  received_via        TEXT NOT NULL CHECK (received_via IN ('e_iwo', 'mail', 'fax', 'portal')),
  form_omb_number     TEXT NOT NULL DEFAULT '0970-0154',
  case_identifiers    JSONB NOT NULL,        -- case, order, remittance numbers, FIPS as the SDU needs
  current_support     BIGINT NOT NULL,       -- cents per stated period
  past_due_support    BIGINT NOT NULL DEFAULT 0,
  arrears_over_12_weeks BOOLEAN NOT NULL DEFAULT FALSE,
  medical_support     BIGINT NOT NULL DEFAULT 0,
  stated_period       TEXT NOT NULL CHECK (stated_period IN ('weekly', 'biweekly',
                        'semimonthly', 'monthly')),
  order_max_percent   NUMERIC(5, 2),         -- as written on the order
  principal_employment_state CHAR(2) NOT NULL,   -- whose limits, fees and timing apply
  supports_other_family BOOLEAN,             -- the 50% vs 60% test; null if unknown
  sdu_ref             TEXT NOT NULL,         -- the disbursement unit
  acknowledged_at     TIMESTAMPTZ,           -- e-IWO acknowledgment sent
  start_by            DATE NOT NULL,         -- computed from service date and state rule
  lump_sum_rule       TEXT                   -- 'report_before_paying', 'withhold_limit', ...
);

-- One payment per disbursement unit per payday, with each employee's share.
CREATE TABLE sdu_remittances (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  sdu_ref             TEXT NOT NULL,
  pay_date            DATE NOT NULL,
  due_by              DATE NOT NULL,         -- 7 business days on the state's calendar
  remittance_id       UUID REFERENCES remittances (id),
  total_amount        BIGINT NOT NULL,
  lines               JSONB NOT NULL,        -- [{order_id, case_identifiers, amount, withheld_on}]
  status              TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'accepted',
                        'rejected', 'returned')),
  UNIQUE (employer_id, sdu_ref, pay_date)
);

-- The medical support notice and its two clocks.
CREATE TABLE medical_support_notices (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  garnishment_order_id UUID REFERENCES garnishment_orders (id),
  notice_date         DATE NOT NULL,
  received_on         DATE NOT NULL,
  forward_by          DATE NOT NULL,         -- 20 business days after notice_date
  forwarded_on        DATE,
  employer_response   TEXT CHECK (employer_response IN ('forwarded', 'not_eligible',
                        'terminated', 'no_plan')),
  plan_response_by    DATE,                  -- 40 business days after notice_date
  benefit_enrollment_id UUID REFERENCES benefit_enrollments (id),
  status              TEXT NOT NULL CHECK (status IN ('received', 'forwarded', 'enrolled',
                        'not_available', 'closed'))
);
```

```go tab="Go"
// SupportLimit returns the most that may be withheld for support this period:
// the lesser of the ordered total, the federal CCPA cap and the state cap.
func SupportLimit(disposable, ordered int64, otherFamily, arrearsOver12Weeks bool,
	stateCapPct float64) int64 {
	pct := 0.60
	if otherFamily {
		pct = 0.50
	}
	if arrearsOver12Weeks {
		pct += 0.05
	}
	if stateCapPct > 0 && stateCapPct < pct {
		pct = stateCapPct
	}
	limit := int64(math.Floor(float64(disposable) * pct)) // cents, never round up
	return min(ordered, limit)
}

// Prorate splits a limit across current support orders by their ordered amounts,
// assigning the rounding remainder to the largest order so the parts sum exactly.
func Prorate(limit int64, current []int64) []int64 {
	var total int64
	for _, c := range current {
		total += c
	}
	out := make([]int64, len(current))
	if total <= limit {
		copy(out, current)
		return out
	}
	var used int64
	largest := 0
	for i, c := range current {
		out[i] = limit * c / total
		used += out[i]
		if c > current[largest] {
			largest = i
		}
	}
	out[largest] += limit - used
	return out
}
```

```rust tab="Rust"
/// The most that may be withheld for support this period: the lesser of the
/// ordered total, the federal CCPA cap and the state cap.
pub fn support_limit(disposable: i64, ordered: i64, other_family: bool,
                     arrears_over_12_weeks: bool, state_cap_pct: f64) -> i64 {
    let mut pct = if other_family { 0.50 } else { 0.60 };
    if arrears_over_12_weeks {
        pct += 0.05;
    }
    if state_cap_pct > 0.0 && state_cap_pct < pct {
        pct = state_cap_pct;
    }
    let limit = (disposable as f64 * pct).floor() as i64; // cents, never round up
    ordered.min(limit)
}

/// Split a limit across current support orders by their ordered amounts,
/// assigning the rounding remainder to the largest order so the parts sum exactly.
pub fn prorate(limit: i64, current: &[i64]) -> Vec<i64> {
    let total: i64 = current.iter().sum();
    if total <= limit {
        return current.to_vec();
    }
    let mut out: Vec<i64> = current.iter().map(|c| limit * c / total).collect();
    let used: i64 = out.iter().sum();
    let largest = (0..current.len()).max_by_key(|&i| current[i]).unwrap_or(0);
    out[largest] += limit - used;
    out
}
```

Design notes:

- **The limit's inputs are facts about the worker,** not the order: whether they support another family and how old the arrears are come from the order or the agency, and an unknown answer takes the lower percentage.
- **Compute in cents and never round up a limit.** Proration with integer division assigns the remainder to one order so the total equals the limit exactly; with the worked example, 84,550 x 550 / 950 = 48,950 and 84,550 x 400 / 950 = 35,600, and the parts sum.
- **Versions, not edits.** An amended IWO is a new `income_withholding_orders` row superseding the old one from its effective date, so each pay statement's withholding can be traced to the order version it applied ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **The disbursement unit table is reference data,** effective-dated: identifiers required, FIPS level, payment method, holiday calendar and fee rule per state ([Rules as Data](/docs/building-blocks/rules-as-data#the-shape-of-a-rule)).
- **One remittance per unit per payday,** with lines per order, as a `remittances` row satisfying the support liabilities, so a rejected payment can be traced to the cases in it.
- **Map the bank-side twin.** A support lien on an account is Banking & Lending's `legal_orders` row with `process_type = 'child_support'`; the issuer and case identifiers are the same, so an agency's case can be found on both sides ([How to Build It](/books/banking-and-lending/legal-process#how-to-build-it)).

## Auditing

Child support records are what an agency asks for when a parent says payments stopped, and what decides whether the employer owes what it didn't withhold:

- **Every order version as received,** with how and when it arrived, the acknowledgment, and the computed start date.
- **Every paycheck's support calculation:** disposable earnings, the percentages and caps considered, the ordered amount, the amount withheld, and any proration across orders.
- **Every remittance** with its lines, due date, settlement and the agency's acceptance or rejection.
- **Termination notices** with the date sent and the address given.
- **NMSNs** with their two clocks and the enrollment they produced.
- **Fees** taken, per state rule.

## What This Means for the System You Build

- **Withhold the lesser of the order, the federal 50 to 65% cap and the state cap,** computed on disposable earnings that subtract only legally required deductions.
- **Process support before every other order,** and let IRS and federal agency rules yield to it as they require.
- **Remit within 7 business days on each state's calendar,** combined per disbursement unit with every case identifier the state needs.
- **Prorate multiple orders by state rule,** current support first, never leaving an order unimplemented, in cents that sum to the limit.
- **Hold lump sums and off-cycle payments** to employees with open orders until the state's rule is applied.
- **Report terminations promptly** with the last known address, and keep orders versioned, not edited.
- **Forward NMSNs within 20 business days** and turn them into enrollments and premium deductions inside the support limit.
- **Take orders by e-IWO** wherever possible, and acknowledge them.

## References

**Law and regulation**

- [42 USC 666](https://www.law.cornell.edu/uscode/text/42/666), income withholding: the amount up to the federal maximum, the employer fee, 7 business days to the disbursement unit, the standard format, combined payments, employer liability, fines, priority, termination and interstate orders, and the medical support notice's 20 business days
- [45 CFR 303.100](https://www.law.cornell.edu/cfr/text/45/303.100), the OMB-approved IWO form, remittance and reporting the withholding date, employer fees, binding until further notice, priority, prompt termination notice, allocation among multiple orders and orders from other states
- [45 CFR 303.32](https://www.law.cornell.edu/cfr/text/45/303.32), the National Medical Support Notice: forwarding within 20 business days, withholding employee contributions and notice when employment ends
- [29 USC 1169](https://www.law.cornell.edu/uscode/text/29/1169), the plan administrator's 40 business days and the NMSN as a qualified medical child support order
- [15 USC 1672](https://www.law.cornell.edu/uscode/text/15/1672), earnings (including bonus and commission) and disposable earnings
- [15 USC 1673](https://www.law.cornell.edu/uscode/text/15/1673), the support limits of 50% and 60%, plus 5% for arrears older than 12 weeks
- [15 USC 1677](https://www.law.cornell.edu/uscode/text/15/1677), state laws providing more limited garnishment stay in force
- [31 CFR 285.11](https://www.law.cornell.edu/cfr/text/31/285.11), family support's priority over Treasury administrative wage garnishment
- [Washington RCW 26.23.060](https://app.leg.wa.gov/RCW/default.aspx?cite=26.23.060), the 50% cap, remittance and the employer fee of up to $10 then $1
- [New York CPLR 5241](https://www.nysenate.gov/legislation/laws/CVP/5241), the 14-day start, 7 business day remittance, termination notice and proportional allocation with current support first

**Agency guidance and forms**

- [Federal Register: Income Withholding for Support (OMB 0970-0154), July 10, 2026](https://www.federalregister.gov/documents/full_text/text/2026/07/10/2026-13910.txt), the form's role, the August 31, 2026 expiration and proposed extension, and e-IWO employer counts
- [DOL WHD: Fact Sheet #30, the Federal Wage Garnishment Law](https://www.dol.gov/agencies/whd/fact-sheets/30-cppa), disposable earnings and the deductions that are and aren't subtracted
- [IRS: Internal Revenue Manual 5.11.5](https://www.irs.gov/irm/part5/irm_05-011-005), the levy exemption for support ordered before the levy and only while it is paid
- [Judicial Council of California: Employer's Return (WG-005)](https://www.courts.ca.gov/documents/wg005.pdf), the ranking of support, tax, elder abuse and ordinary orders

**Vendor documentation**

- [Check: Post-tax deductions](https://docs.checkhq.com/docs/post-tax-deductions.md), child support fields, maximum percent of disposable, processing before other garnishments, partial application of multiple orders and managed remittance
- [Gusto Embedded: Create a child support garnishment](https://docs.gusto.com/embedded-payroll/docs/create-a-child-support-garnishment.md), per-state agency attributes and FIPS codes, percentage and dollar maximums, automatic remittance and its off-cycle and South Carolina exceptions
