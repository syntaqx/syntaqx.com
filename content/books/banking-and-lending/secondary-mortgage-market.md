+++
title = "The Secondary Mortgage Market"
description = "How US mortgages are funded: Fannie Mae, Freddie Mac and Ginnie Mae, cash and swap execution, UMBS, guarantee fees, pooling, servicing rights and advances."
category = "Banking & Lending Industry"
order = 2457
part = "Funding and Licensing"
tags = ["banking", "lending", "mortgages", "mbs", "fannie-mae", "ginnie-mae", "servicing"]
+++

Most US mortgages are made to be sold. A lender closes a 30-year fixed-rate loan, funds it on a warehouse line, and within weeks delivers it to Fannie Mae or Freddie Mac for cash or for a mortgage-backed security, or pools it with other FHA and VA loans into a security Ginnie Mae guarantees. The investor who buys the security gets the borrower's interest less two strips: a guarantee fee to the agency that promised timely payment, and a servicing fee to whoever bills and collects the loan. That structure is why a nonbank with no deposits can be the country's largest lender, why a 30-year fixed rate exists at all, and why the right to service a loan is an asset that trades separately from the loan.

For the system, the secondary market turns each mortgage into three records that outlive the closing: a delivery (which agency, which execution, which pool, at what price and fees), a security (the pool and its coupon), and a servicing right (who earns the strip and owes the advances). This chapter covers the three agencies, cash and swap execution, the Uniform Mortgage-Backed Security, guarantee fees with a worked loan, delivery and pooling, and servicing rights and advances. The loan products, rate locks and channels are in [Mortgages & Home Equity](/books/banking-and-lending/mortgages); escrow, Regulation X and loss mitigation are in [Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing); the warehouse line that carries the loan until delivery is in [Funding the Book](/books/banking-and-lending/funding-the-book#warehouse-lines).

## How the Platforms Do It

As of October 2026, from the agencies' guides, FHFA and CRS:

| | **Fannie Mae** | **Freddie Mac** | **Ginnie Mae** |
| --- | --- | --- | --- |
| What it is | Government-sponsored enterprise in conservatorship since 2008 | Government-sponsored enterprise in conservatorship since 2008 | A government corporation within HUD |
| What it buys or guarantees | Conforming conventional loans, bought for cash or swapped for MBS | Conforming conventional loans, bought for cash or swapped for securities | Guarantees securities that lenders (issuers) create from FHA, VA and USDA loans; buys nothing |
| Who carries the credit risk | Fannie Mae | Freddie Mac | FHA, VA and USDA insure or guarantee the loans; Ginnie stands behind the issuer |
| Security | UMBS and Supers | UMBS and Supers (45-day Gold PCs ended in 2019) | Ginnie I (single issuer, paid on the 15th) and Ginnie II (single or multiple issuer, paid on the 20th) |
| Guarantee behind it | The enterprise, in conservatorship | The enterprise, in conservatorship | The full faith and credit of the United States |
| Minimum servicing fee | 25 bps on fixed-rate loans in MBS (maximum 50), 25 bps on most ARMs | 25 bps minimum contract servicing spread (maximum 50) | 19 bps on Ginnie II pools (maximum 69), plus a 6 bp guaranty fee |
| Advances while a borrower doesn't pay | Servicer remits scheduled principal and interest on MBS loans until the loan leaves the pool or, under the special servicing option, four consecutive months delinquent | Set by its Seller/Servicer Guide | Issuer advances from its own funds for as long as the loan is in the pool |

Three things the table shows. **Credit risk and timely payment are separate promises.** Fannie and Freddie take the credit risk of the loans they buy; Ginnie takes only the risk that an issuer fails to pass the money through, because FHA, VA and USDA already carry the borrower's default risk. **Investors take the rate risk.** A mortgage-backed security pays principal back as borrowers prepay, so the investor carries prepayment and interest rate risk the agencies don't. **The servicer is the agencies' operating arm,** and in the Ginnie program it is also the first source of cash when borrowers stop paying.

## The Three Agencies

Fannie Mae and Freddie Mac have been in conservatorship under the Federal Housing Finance Agency since September 2008. As of the Congressional Research Service's August 25, 2026 update, FHFA "currently has the powers of management, boards, and shareholders," the enterprises' estimated capital at the end of the second quarter of 2026 was 2.84% (Fannie) and 2.36% (Freddie) of assets, below their requirements, and Treasury's warrants run to September 7, 2028. Bills to prepare an exit have been introduced, not enacted. Press reports since 2025 have described a possible share sale; as of October 2026 I found no source that one has happened, and the chapter treats conservatorship as the status. <!-- source-gap: gse-share-sale-status | status | whether Fannie Mae or Freddie Mac shares have been sold or an exit from conservatorship has begun | closes with: an FHFA or Treasury release, or an S-1 filed by either enterprise (rechecked: the latest FHFA and Treasury action found is the January 2025 PSPA amendment requiring Treasury consent to any release) | checked: 2026-10-30 -->

The enterprises buy conforming loans: conventional mortgages that meet their selling guides and the loan limit FHFA sets each year. For 2026 the baseline limit for a one-unit property is $832,750, and $1,249,125 in Alaska, Hawaii, Guam and the US Virgin Islands; Ginnie Mae uses the same figures for its high-balance pools. Larger loans are jumbo loans that banks hold or that private-label securities fund.

Ginnie Mae guarantees "the timely repayment of principal and interest" on securities backed by government-insured loans. The issuer (the lender that pools the loans and services them) promises to pay security holders whether or not borrowers pay; Ginnie's guaranty steps in only when the issuer can't. The guaranty is "backed by the full faith and credit of the United States."

## Cash Window or Swap

A seller can deliver a conventional loan two ways, and the choice sets everything downstream:

- **Cash.** The enterprise "may pay cash (directly from its cash window) to a loan originator for delivery of a small number of mortgages." The enterprise owns the loan and later pools it into its own securities. Cash is how small lenders sell, and how any lender sells a loan that doesn't fit a pool it's building. Cash loans may use any of Fannie's remittance types.
- **Swap.** The seller delivers a pool of loans and receives the security backed by them, under "a swap agreement ... to purchase a large number (or pool) of mortgages." The lender then holds the security or, usually, sells it (Fannie's guide notes lenders can hold the MBS they receive in a swap or sell them). Freddie's MultiLender Swap lets smaller sellers contribute loans to a pool with others and receive "a pro-rata share of Freddie Mac securities." For MBS loans the only remittance type is scheduled/scheduled: the servicer remits "scheduled interest (net of servicing fees) and scheduled principal due," whatever the borrower paid.

A Ginnie Mae issuer has no cash option: it pools its own FHA, VA and USDA loans and issues the security itself, as a single-issuer Ginnie I or Ginnie II custom pool or into a Ginnie II multiple-issuer pool, with one consolidated payment through Ginnie's central paying and transfer agent.

Lenders hedge between lock and delivery by selling agency securities forward in the to-be-announced (TBA) market, before the pools that will fill the trade exist; the locks themselves are in [Mortgages & Home Equity](/books/banking-and-lending/mortgages#rate-locks), and the hedge is the reason a lock pipeline is reported to the capital markets desk every morning.

## UMBS

On June 3, 2019, under FHFA's Single Security Initiative, Fannie Mae and Freddie Mac began issuing one common security, the Uniform Mortgage-Backed Security. Freddie stopped issuing its 45-day Gold PCs and moved to 55-day UMBS and Supers (re-securitizations of UMBS, which may combine Fannie-issued and Freddie-issued pools). The securities are issued through the Common Securitization Platform, operated by Common Securitization Solutions, the enterprises' joint venture. The point was one market for both enterprises' securities instead of two.

For the system, UMBS made the enterprise a property of the pool, not of the security type: a lender's pipeline sold forward as UMBS can be delivered to either enterprise, and the delivery record has to say which one issued the pool, because the servicing guide, remittance and reporting follow the issuing enterprise.

## Guarantee Fees

The guarantee fee pays the enterprise for credit risk and its costs. It has two parts, and FHFA reports both each year:

- **Ongoing fee,** a strip of the loan's interest rate (in basis points a year) deducted from the interest before it passes to investors, "based primarily on product type."
- **Upfront fee,** a one-time payment at delivery, mostly loan-level price adjustments (LLPAs) by credit score, loan-to-value and other attributes, and "the main form of risk-based pricing." FHFA annualizes it to compare with the ongoing fee by dividing by a present value multiplier (its example: "60/4 = 15 basis points").

FHFA's report for 2024, published in December 2025, put the average total guarantee fee on single-family loans the enterprises acquired at 65.2 basis points (65.5 in 2023): 49.1 basis points ongoing and 16.1 upfront, annualized. Thirty-year fixed-rate loans, 94% of the study population, averaged 66 basis points and 15-year loans 47, both unchanged; the enterprises acquired more than $650 billion of loans in 2024. Ten basis points of every fee go to the Treasury under the Temporary Payroll Tax Cut Continuation Act of 2011, a charge in effect since December 1, 2012 and extended to 2032 by the Infrastructure Investment and Jobs Act. FHFA's January 2023 LLPA changes meant, in CRS's words, that "most prospective borrowers pay higher LLPAs." The LLPA grids are published reference data and change by announcement, so the delivery record stores the adjustments applied, not a lookup.

## Worked Numbers: G-Fee and Servicing Strip

A worked example of my own: a $400,000 30-year fixed-rate conforming loan at 6.50%, swapped into a Fannie Mae MBS with a 5.50% coupon. I assume an ongoing guarantee fee of 50 basis points (close to FHFA's 2024 average of 49.1) and LLPAs of 1.00% of the loan amount.

| Strip | Rate | First month | Who gets it |
| --- | --- | --- | --- |
| Borrower's interest | 6.50% | $2,166.67 | |
| Base servicing fee | 0.25% | $83.33 | The servicer: Fannie's minimum for a fixed-rate MBS loan |
| Excess servicing | 0.25% | $83.33 | The servicer, or whoever buys the excess strip |
| Guarantee fee | 0.50% | $166.67 | Fannie Mae, 10 bps of it passed to the Treasury |
| **Pass-through to investors** | **5.50%** | **$1,833.33** | The MBS holders |

The monthly payment is $2,528.27, so the first payment carries $361.60 of principal, which passes to investors in full. The strips sum to the note rate: 0.25 + 0.25 + 0.50 + 5.50 = 6.50. Three constraints shape the choice of coupon:

- **The servicing fee has a floor and a ceiling.** Fannie's minimum for fixed-rate loans is 25 basis points and the maximum 50; Freddie's minimum contract servicing spread is 25 and may not exceed 50. Here the 75 basis points left after the guarantee fee is more than 25, so the extra 25 is excess servicing; a 6.00% coupon would leave 0 and break the floor.
- **The note rate must be within range of the coupon.** For Freddie's swaps, note rates must be "no less than 25 bps and no greater than 112.5 bps over the pool coupon rate"; 6.50% over 5.50% is 100 bps, inside it.
- **The upfront fee is paid in cash or price.** $4,000 of LLPAs is charged at delivery, by netting against the purchase price or by trading it for a higher ongoing fee, and the borrower usually paid it through the rate or points.

Over the first year the 50 basis points of total servicing earns about $1,990 on the declining balance, and the right to that stream for the life of the loan is what the lender books as a mortgage servicing right. As a scale: UWM's MSRs were carried at $4.07 billion against $240.8 billion of unpaid principal it serviced at December 31, 2025, about 169 basis points of principal (my arithmetic, on a portfolio with its own fee mix).

## Delivery and Pooling

Delivery is a data exchange before it is a sale. The seller takes a commitment (a cash contract at a price, or a guarantor or swap contract for a coupon and an amount, with a delivery window), then delivers each loan's data in the Uniform Loan Delivery Dataset (Freddie's sellers deliver ULDD files through Loan Selling Advisor), its note and the collateral documents to a custodian, and settles. The enterprise checks each loan against its eligibility rules and the commitment; a loan that fails is rejected or must be repurchased later if a defect is found. After settlement:

- **The loan is in a pool** with a pool number, an issue date, a coupon and an original balance, and the security carries a CUSIP; Ginnie pools are named for the issuer.
- **The servicer reports and remits on the agency's calendar,** loan by loan, scheduled/scheduled for MBS loans.
- **The servicer keeps its strip** and owes the agency's servicing guide its standards: escrow, loss mitigation, investor reporting and, in the end, foreclosure or modification under the agency's rules ([Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing) covers them).

For the lender, the pool is where three systems meet: the loan origination system's file (ULDD is built from the same MISMO data the LOS keeps; [Loan Origination](/books/banking-and-lending/loan-origination) covers the data model), the warehouse line that is repaid from the sale proceeds, and the servicing system that boards the loan with its investor and remittance type.

## Servicing Rights and Advances

A **mortgage servicing right** (MSR) is the contractual right to service a loan and keep the servicing strip, net of the cost of servicing. The lender recognizes it as an asset when it sells a loan servicing retained, measures it (UWM, for one, at fair value, so its value swings with rates: when rates fall, borrowers refinance, and the strip disappears with the loan), and can sell it. UWM's full-year 2025 change in fair value of MSRs was a loss of $1,055.4 million against $724.7 million of servicing income. An MSR sale is a servicing transfer for the borrower, with notices and a 60-day window ([Loan Servicing](/books/banking-and-lending/loan-servicing#servicing-transfers) covers transfers); the buyer often hires the seller as subservicer, so the owner of the right and the company that answers the phone differ. Servicers borrow against MSRs (UWM refers to its "warehouse and MSR facilities"), which makes the MSR a funding vehicle in its own right.

The servicing right comes with **advances**, the servicer's duty to pay investors when borrowers don't:

- **Fannie Mae.** The servicer must remit "P&I to Fannie Mae on scheduled/scheduled remittance type MBS mortgage loans regardless of whether" it collected from the borrower. Under the special servicing option that runs until the loan "becomes four consecutive months delinquent," when Fannie "will suspend drafting scheduled P&I amounts"; under the regular option, until the loan is removed from the pool.
- **Ginnie Mae.** "If a borrower fails to make a timely payment on a mortgage, the Issuer must use its own funds to ensure that the security holders receive timely payment," "regardless of whether the Issuer receives mortgage payments on time or receives them at all." An issuer that can't pay defaults; default can cross to all of its pools and its affiliates', and on extinguishment the issuer "forfeits and waives any and all rights to reimbursement or recovery of any advances," and Ginnie "becomes the absolute owner" of the servicing.
- **Taxes, insurance and costs.** Servicers also advance escrow shortfalls and the costs of protecting the property, recovered later from the borrower, the insurer or liquidation proceeds ([Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing) covers escrow).

Advances are why mortgage servicing needs liquidity even when it's profitable: in a wave of forbearance or delinquency, a Ginnie issuer pays investors from its own cash for months before FHA or VA claims repay it. The system has to know, every day, how much it has advanced, on which loans, of which kind, and what it expects to recover and from whom.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model) (`loans` with `owner` and `servicer`, `collateral` for the property, `journal_entries`) and the funding records in [Funding the Book](/books/banking-and-lending/funding-the-book#how-to-build-it): an agency is a `funding_vehicles` row of kind `agency`, a delivery moves the loan with a `loan_transfers` row (a sale, servicing retained) and a new `loan_funding_allocations` range, and the warehouse allocation closes the same day. [Mortgages & Home Equity](/books/banking-and-lending/mortgages) records the loan program, the intended investor and the rate lock. This chapter adds the commitment, the delivery, the pool, the servicing right and the advances:

```sql
CREATE TABLE agency_commitments (          -- what the seller agreed to deliver, and at what price
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  agency              TEXT NOT NULL CHECK (agency IN ('fannie_mae', 'freddie_mac', 'ginnie_mae')),
  execution           TEXT NOT NULL CHECK (execution IN ('cash', 'swap', 'multilender_swap',
                        'ginnie_i', 'ginnie_ii_custom', 'ginnie_ii_multiple')),
  agency_ref          TEXT NOT NULL,         -- the agency's commitment or contract number
  product             TEXT NOT NULL,         -- '30yr_fixed', '15yr_fixed', 'arm_5_6', ...
  coupon              NUMERIC(6, 3),         -- swaps: the security's pass-through rate
  price               NUMERIC(10, 6),        -- cash: price per 100 of principal
  amount              BIGINT NOT NULL,       -- principal committed, minor units
  delivery_window     DATERANGE NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('open', 'filled', 'paired_off', 'expired')),
  UNIQUE (agency, agency_ref)
);

CREATE TABLE mbs_pools (                   -- the security a loan sits in
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  agency              TEXT NOT NULL CHECK (agency IN ('fannie_mae', 'freddie_mac', 'ginnie_mae')),
  security_type       TEXT NOT NULL CHECK (security_type IN ('umbs', 'super', 'ginnie_i',
                        'ginnie_ii')),
  pool_number         TEXT NOT NULL,
  cusip               CHAR(9) NOT NULL UNIQUE,
  coupon              NUMERIC(6, 3) NOT NULL,
  issue_date          DATE NOT NULL,
  original_principal  BIGINT NOT NULL,
  issuer              TEXT,                  -- Ginnie: the issuing lender
  funding_vehicle_id  UUID NOT NULL REFERENCES funding_vehicles (id),
  UNIQUE (agency, pool_number)
);

CREATE TABLE agency_deliveries (           -- one loan's sale to an agency or into a pool
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  commitment_id       UUID NOT NULL REFERENCES agency_commitments (id),
  pool_id             UUID REFERENCES mbs_pools (id),  -- null for cash until the agency pools it
  loan_transfer_id    UUID REFERENCES loan_transfers (id),
  uldd_ref            TEXT NOT NULL,         -- the delivered data file, as sent
  note_rate           NUMERIC(6, 3) NOT NULL,
  guarantee_fee_bps   INT NOT NULL,          -- ongoing, as contracted
  upfront_fees        JSONB NOT NULL,        -- each LLPA or upfront charge: code, bps, amount
  base_servicing_bps  INT NOT NULL,
  excess_servicing_bps INT NOT NULL DEFAULT 0,
  remittance_type     TEXT NOT NULL CHECK (remittance_type IN ('scheduled_scheduled',
                        'scheduled_actual', 'actual_actual')),
  purchase_proceeds   BIGINT,
  status              TEXT NOT NULL CHECK (status IN ('submitted', 'rejected', 'certified',
                        'purchased', 'repurchased')),
  delivered_at        TIMESTAMPTZ NOT NULL,
  settled_on          DATE
);

CREATE TABLE servicing_rights (            -- the right to service and keep the strip
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  owner               TEXT NOT NULL,         -- who owns the MSR
  subservicer         TEXT,                  -- who does the work, if different
  base_fee_bps        INT NOT NULL,
  excess_fee_bps      INT NOT NULL DEFAULT 0,
  excess_owner        TEXT,                  -- an excess strip can be sold separately
  acquired_via        TEXT NOT NULL CHECK (acquired_via IN ('origination', 'purchase',
                        'extinguishment')),
  pledged_to          UUID REFERENCES funding_vehicles (id),  -- an MSR facility
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING gist (account_id WITH =, valid_during WITH &&)
);

CREATE TABLE servicer_advances (           -- money paid to investors or for the property
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  kind                TEXT NOT NULL CHECK (kind IN ('principal_interest', 'taxes_insurance',
                        'corporate')),     -- corporate: inspections, preservation, legal
  for_period          DATE,                  -- the installment advanced, for P&I
  amount              BIGINT NOT NULL CHECK (amount > 0),
  advanced_on         DATE NOT NULL,
  recovery_source     TEXT CHECK (recovery_source IN ('borrower', 'insurer_claim', 'agency',
                        'liquidation', 'none')),
  recovered_amount    BIGINT NOT NULL DEFAULT 0,
  recovered_on        DATE,
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id)
);
```

The delivery service checks, before it submits, that the pool coupon plus the guarantee fee plus base and excess servicing equals the note rate, and that base servicing is within the agency's minimum and maximum; PostgreSQL can't express a check across two tables in `CHECK`, so it lives in the service or a trigger. The daily advance exposure is a query a Ginnie issuer watches the way a bank watches liquidity:

```sql
SELECT p.agency, a.kind,
       SUM(a.amount - a.recovered_amount) AS outstanding,
       COUNT(DISTINCT a.account_id)       AS loans
FROM servicer_advances a
JOIN agency_deliveries d ON d.account_id = a.account_id AND d.status = 'purchased'
JOIN mbs_pools p         ON p.id = d.pool_id
WHERE a.recovered_amount < a.amount
GROUP BY p.agency, a.kind;
```

Design notes:

- **The strips are terms of the delivery.** Guarantee fee, base and excess servicing and the upfront fees are stored as contracted per loan, because the LLPA grid and the agencies' fee schedules change by announcement and the remittance must use what applied when the loan was delivered ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Scheduled/scheduled means remitting the schedule, not the receipts.** For MBS loans the remittance job reads `schedule_installments`, not `loan_payments`; any shortfall becomes a `principal_interest` advance row in the same posting, and a later borrower payment recovers it.
- **The servicing right is not the loan.** `loans.owner` is the agency or trust; `servicing_rights.owner` is who earns the strip; the subservicer is who works it. Selling an MSR changes only the right and starts a servicing transfer.
- **Pools are funding vehicles.** Every pool points at a `funding_vehicles` row, so the funding allocation for a delivered loan names the pool and the same investor reporting design applies ([Investor Reporting and Remittance](/books/banking-and-lending/funding-the-book#investor-reporting-and-remittance)).
- **Repurchases reverse the delivery.** A defect found after purchase is a `loan_transfers` row of kind `repurchase` back to the lender, a new funding allocation (often to the balance sheet or a scratch-and-dent buyer) and `status = 'repurchased'` on the delivery, with the defect recorded.
- **Delivery files are kept as sent.** `uldd_ref` is the file the agency certified against; a later correction to the loan doesn't change what was delivered.

## Auditing

The agencies, Ginnie Mae, FHFA, warehouse lenders and auditors each test a different part:

- **Every delivery as made:** commitment, pool, ULDD file, strips, upfront fees, proceeds and settlement, tying the loan to its security.
- **Every remittance and its source:** scheduled principal and interest per loan per month, what was collected, what was advanced, and when each advance was recovered.
- **Servicing rights over time:** owner, subservicer, excess strip owner and pledges, with each sale and the servicing transfer it started.
- **Repurchases and defects:** each demand, the defect, the price and the loan's next funding.
- **Advance exposure by agency and kind,** daily, because a Ginnie issuer's ability to keep paying is what its regulator watches.

The general record design is in [Audit Trails](/docs/architecture/audit-trails#producing-records).

## What This Means for the System You Build

- **Record each delivery with its strips,** guarantee fee, base and excess servicing and upfront fees, as contracted, and check they sum to the note rate.
- **Keep pools as funding vehicles** so every delivered loan's investor, coupon and reporting come from one place.
- **Remit the schedule for MBS loans** and write the shortfall as an advance in the same posting.
- **Track advances by kind and recovery source,** daily, as the liquidity risk they are.
- **Model the servicing right separately from the loan,** with owner, subservicer and excess strip owner effective-dated.
- **Store delivered data as sent,** and treat repurchases as new transfers with their defect.

## References

**Agency guides**

- [Fannie Mae Selling Guide C3-1-01: General information about Fannie Mae's MBS program](https://selling-guide.fanniemae.com/sel/c3-1-01/general-information-about-fannie-maes-mbs-program), the 25 bp minimum and 50 bp maximum servicing fee on fixed-rate loans, the ARM minimum, the monthly guaranty fee remittance, and holding or selling swapped MBS
- [Fannie Mae Selling Guide C1-3-01: Remittance types](https://selling-guide.fanniemae.com/sel/c1-3-01/general-information-remittance-types), actual/actual, scheduled/actual and scheduled/scheduled, the only type for MBS loans
- [Fannie Mae Servicing Guide A2-3-02: Servicing fees](https://servicing-guide.fanniemae.com/svc/a2-3-02/servicing-fees-portfolio-and-mbs-mortgage-loans), the servicing fee as the difference between the note rate and the pass-through, reduced by the guaranty fee
- [Fannie Mae Servicing Guide F-2-08: Servicing fees for MBS mortgage loans](https://servicing-guide.fanniemae.com/svc/f-2-08/servicing-fees-mbs-mortgage-loans), minimum fees by product
- [Fannie Mae Servicing Guide C-3-01: Remitting P&I funds](https://servicing-guide.fanniemae.com/svc/c-3-01/responsibilities-related-remitting-pi-funds-fannie-mae), remitting scheduled P&I regardless of collection, the special servicing option's four-month limit and the regular option
- [Freddie Mac: Single-Security at a glance](https://sf.freddiemac.com/docs/pdf/other/ss_at_a_glance.pdf), the end of 45-day Gold PCs and the move to 55-day UMBS and Supers on June 3, 2019, the note rate range over the pool coupon, the 25 to 50 bp contract servicing spread and ULDD delivery through Loan Selling Advisor
- [Freddie Mac: MultiLender Swap](https://sf.freddiemac.com/working-with-us/selling-delivery/delivery-options-pricing/multilender-swap-execution), a pro-rata share of securities and the servicing spread limits
- [Ginnie Mae MBS Guide, Chapter 1](https://www.ginniemae.gov/s3/sites/default/files/mbs_guides/Chapter_01_0.pdf), the issuer's duty to pay from its own funds, the full faith and credit guaranty, and Ginnie I and II payment dates and structures
- [Ginnie Mae MBS Guide, Chapter 5](https://www.ginniemae.gov/s3/sites/default/files/mbs_guides/Chapter_05.pdf), payment regardless of collection, cross-default and extinguishment of advance and servicing rights
- [Ginnie Mae MBS Guide, Chapter 9](https://www.ginniemae.gov/s3/sites/default/files/mbs_guides/Chapter_09.pdf), the 2026 high-balance thresholds following FHFA's conforming limits
- [Ginnie Mae MBS Guide, Chapter 24](https://www.ginniemae.gov/s3/sites/default/files/mbs_guides/Chapter_24.pdf), the Ginnie II 19 to 69 bp servicing fee and 6 bp guaranty fee, and the Ginnie I note rate spread

**Regulators and government**

- [FHFA: Fannie Mae and Freddie Mac Single-Family Guarantee Fees in 2024 (December 2025)](https://www.fhfa.gov/reports/single-family-guarantee-fees/2024), average total, ongoing and upfront fees, fees by product, acquisition volume, the annualization method and the TCCA fee's extension to 2032
- [FHFA: June 2019 implementation of the Uniform Mortgage-Backed Security (March 28, 2018)](https://www.fhfa.gov/news/news-release/fhfa-announces-june-2019-implementation-of-the-new-uniform-mortgage-backed-security), the launch date, the Common Securitization Platform and Common Securitization Solutions
- [FHFA: Moving forward on UMBS implementation](https://www.fhfa.gov/blog/insights/moving-forward-on-umbs-implementation), CSS as the enterprises' joint venture and the platform's history
- [CRS: Fannie Mae and Freddie Mac in Conservatorship (R46746, updated August 25, 2026)](https://www.everycrsreport.com/reports/R46746.html), conservatorship status, estimated capital, the warrants, exit bills, cash window and swap execution, the TCCA fee from December 1, 2012, the 2023 LLPA changes and Ginnie Mae's guarantee

**Filings**

- [UWM Holdings: Fourth quarter and full year 2025 results](https://investors.uwm.com/news/financial-news/news-details/2026/UWM-Holdings-Corporation-Announces-Fourth-Quarter--Full-Year-2025-Results/default.aspx), MSRs of $4.07 billion, servicing principal of $240.8 billion, servicing income, the change in fair value of MSRs and its warehouse and MSR facilities
