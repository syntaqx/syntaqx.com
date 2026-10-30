+++
title = "Core Modernization & Conversions"
nav_title = "Core Modernization"
description = "Why cores are hard to replace: TSB 2018, Commonwealth Bank, JPMorgan on Thought Machine, big bang or progressive, conversion weekends, outsourcing risk."
category = "Banking & Lending Industry"
order = 2412
part = "The Core"
tags = ["banking", "core-banking", "migration", "vendors", "resilience"]
+++

Replacing a bank's core is the riskiest routine project in banking. Every account, every balance, every day of history, every product's behavior and every integration move from one system of record to another, and on the morning after, every customer's money must be exactly where it was, spendable exactly as before. Banks do it more often than outsiders think: every merger ends with one bank's accounts converted onto the other's core, every bank that outgrows its core converts, and every large bank is somewhere in a multi-year program to modernize the core it has. Most conversions are invisible to customers. The ones that aren't become regulatory case studies.

This chapter is why cores are hard to replace, the public cases (TSB's 2018 failure, Commonwealth Bank's two programs, JPMorgan Chase's move to Thought Machine, Chase UK's greenfield build), the choice between a big-bang conversion and a progressive one, how a conversion weekend actually runs, and the outsourcing rules that make the core vendor the bank's problem. The general method for replacing any system (strangler, crosswalks, shadow reads, reconciliation, rollback windows) is in [Replacing Systems](/docs/architecture/replacing-systems); this chapter is what changes when the system holds deposits. [Core Banking Systems](/books/banking-and-lending/core-banking-systems) describes what's being replaced.

## Why Cores Are Hard to Replace

A core is hard to replace for reasons that compound:

- **Behavior is the product.** Interest computed to the cent by a specific day count and rounding rule, fees triggered in a specific order, posting order, dormancy timing, statement cycles: the old core's behavior is what customers were told and what their past statements show. A new core that computes a different penny is a different product, and a disclosure problem ([Interest, APY & Statements](/books/banking-and-lending/interest-and-statements)).
- **History has to come along.** Statements, tax figures for the current year, open disputes and error claims with running clocks, legal holds, maturity dates, CD terms set years ago, and whatever retention requires. A conversion moves not just balances but obligations in flight.
- **Everything integrates to it.** Digital banking, card processing, payments hubs, origination, fraud, AML monitoring, the warehouse, regulatory reporting: each reads from or writes to the core, often through files whose formats encode the old core's assumptions ([The Systems Around the Core](/books/banking-and-lending/core-banking-systems#the-systems-around-the-core)).
- **Product sprawl.** Decades of grandfathered product versions, each a live product until its last account leaves ([Grandfathering](/books/banking-and-lending/product-configuration#grandfathering)).
- **Contracts are long.** Banking software contracts run for years (Q2 says the initial term of its digital banking agreements "averages over five years"; Alkami reports an average contract life of about 70 months), and the FDIC has warned that long-term and automatically renewing technology contracts carry higher risk of coverage gaps. The exit terms are often the weakest part.
- **The downside is asymmetric.** A conversion that goes well looks like nothing happened. One that goes badly locks customers out of their money, which is a supervisory, legal and reputational event at once.

## How the Platforms Do It

The public record of core changes, as of October 2026:

| Case | Approach | What is public |
| --- | --- | --- |
| **TSB (UK), April 2018** | One migration onto a new platform, outsourced to a critical third-party supplier | Platform failed immediately after migration; "a significant proportion" of 5.2 million customers affected; business as usual not restored until December 2018; £32.7 million redress; £48.65 million in FCA and PRA fines (December 2022) |
| **Commonwealth Bank of Australia** | First a multi-year replacement onto SAP; then, around sixteen years later, a move of that core to the cloud | The cloud move: target cutover of eight hours or less against 30+ for comparable firms, fully offline for three hours, five dress rehearsals (three planned), 54 test crews, 16 million active customer accounts |
| **JPMorgan Chase and Thought Machine** | Progressive migration of the US consumer bank onto Vault Core | Multi-year program across Consumer & Community Banking, more than 66 million households (Thought Machine, October 2022); JPMorgan invested in Thought Machine's 2021 Series C |
| **Chase UK on 10x** | Greenfield: a new bank on a cloud-native core on AWS | Vendor-reported: more than two years of build, over 2.5 million customers by February 2025 |
| **Jack Henry Platform** | Vendor-led progressive replacement, component by component, beside its legacy cores | Real-time Ledger and Deposit Servicing in closed beta; SilverLake in the Platform with two banks since July 2026 |
| **PNC and BBVA USA, October 2021** | Merger conversion in one event | 2.6 million customers, about 600 branches in seven states converted simultaneously; "largest conversion in bank's history" |

## TSB, 2018

TSB is the case every bank's board now asks about, because it failed in the ways a conversion is most likely to.

In April 2018 TSB migrated its customers' data onto a new IT platform. The data moved; in the FCA's words, the platform "failed immediately". All of TSB's branches and "a significant proportion of TSB's 5.2 million customers" were affected, it took until December 2018 to return to business as usual, and TSB paid £32.7 million in redress. On December 20, 2022 the FCA and PRA fined TSB £29.75 million and £18.9 million respectively, £48.65 million in total after a 30% settlement discount (£69.5 million before it), for failing "to organise and control the IT migration programme adequately" and to manage the operational risk of outsourcing to its critical third-party supplier.

Two later records sharpen the lesson. The independent review TSB's board commissioned from Slaughter and May, published November 19, 2019, raised questions about how testing was carried out and the need for stronger oversight of suppliers; TSB's own analysis found that its two data centres, specified as identical, were configured inconsistently in some areas. And on April 13, 2023 the PRA fined TSB's former CIO £81,620 under the Senior Managers regime for failing to take reasonable steps to ensure the outsourcing was adequately managed, having assured the board of the key supplier's readiness without first confirming that TSB had sufficient evidence from that supplier.

The engineering lessons are specific:

- **Readiness is evidence, not assurance.** A go/no-go decision rests on test results, rehearsal metrics and reconciliations the bank has seen, not on a supplier's statement that it is ready.
- **Test the production you will run.** Environments specified as identical drift; test and rehearse on infrastructure configured as production is, and diff the configuration itself.
- **Big bang concentrates risk in one event.** When everything moves at once, a platform problem is an every-customer problem.
- **The supplier's failure is the bank's failure.** Regulators fined the bank and its executive, not the vendor.

## Commonwealth Bank

Commonwealth Bank of Australia is the case of a bank replacing its core twice, with very different shapes.

<!-- source-gap: cba-2008-core-cost | secondary | CBA's original 2008 SAP core replacement began as a roughly A$580M four-year program and grew to about A$1.1B | closes with: a CBA annual report, results presentation or ASX release stating the program cost and timeline | checked: 2026-10-29 -->
The first replaced CBA's legacy core with SAP over several years. Press reports at the time dated its start to 2008 and put its starting budget at roughly A$580 million over four years and its eventual cost at around A$1.1 billion; I could not open a CBA primary source for those figures, so treat them as secondary.

The second is better documented by the bank itself. In a March 2026 case study, CBA described moving that SAP core, which it had put in "16 years ago", to the cloud with AWS, SAP, SAP Fioneer, Accenture and Red Hat. It set a cutover target of eight hours or less where comparable organizations had taken more than 30, and was "only fully offline for three hours". It planned three dress rehearsals and ran five, with 54 crews involved in testing, for a platform serving 16 million active customer accounts.

What carries over to any conversion:

- **Rehearse until the rehearsal is boring.** Each dress rehearsal is a full run of the cutover on production-like data with the real runbook, timed, and the plan adds rehearsals when one surprises anyone.
- **Budget the outage in hours, then shrink it.** A cutover plan states how long customers are offline and what still works meanwhile, and every step on the critical path is a candidate for doing earlier or in parallel.
- **Keep the front door open.** Keeping channels up (with balances shown as of a time, and some actions queued) during the offline window turns an outage into a degraded mode.

## JPMorgan Chase and Chase UK

The largest US bank chose the progressive route for its domestic consumer bank and the greenfield route abroad.

In the US, Chase is moving its consumer bank onto Thought Machine's Vault Core. Thought Machine described it in October 2022 as a multi-year program to deploy Vault Core across Consumer & Community Banking, serving "more than 66 million households in the United States", quoting the division's CIO on helping "modernize the core banking technology that powers a variety of products ... as we migrate to their cloud-native core banking platform at scale." JPMorgan also invested in Thought Machine's 2021 funding round.
<!-- source-gap: jpm-core-migration-status | missing | JPMorgan Chase's progress migrating US consumer accounts to Vault Core after 2022 | closes with: a JPMorgan 10-K, investor day presentation or shareholder letter stating migration milestones | checked: 2026-10-29 -->
I found no public statement from JPMorgan, as of October 2026, of how far that migration has gone.

In the UK, Chase didn't migrate anything: it built a new bank. 10x Banking's case study describes a cloud-native core on AWS, more than two years of build, and, in its own figures, over 2.5 million customers by February 2025. A greenfield bank avoids conversion entirely and pays for it later in a different way: when a parent eventually wants one platform, the conversion it skipped is still waiting.

## Big Bang or Progressive

Every core replacement is a choice between moving everything at once and moving it in pieces. The general trade-offs are in [Big Bang, Phased or Parallel](/docs/architecture/replacing-systems#big-bang-phased-or-parallel); for a core they look like this.

**Big bang** converts every account on one date. It's the only practical option for a merger, where two banks must become one legal entity with one set of books, and it's how most community bank conversions run: the vendor has a conversion methodology, a team that has done hundreds, and a fixed weekend. It concentrates all risk in one cutover, so everything depends on rehearsal and the rollback decision.

**Progressive** replacement moves the bank to the new core in slices, and the slices come in three common shapes:

- **By product or segment.** New products launch on the new core while existing ones stay; then existing products migrate one at a time. Chase's program is this shape.
- **By component.** The vendor replaces the old core's functions one at a time behind the same accounts: Jack Henry's Platform adds a real-time ledger, wires, ACH and authorizations as services around SilverLake and Symitar rather than converting the bank ([How the Platforms Do It](/books/banking-and-lending/core-banking-systems#how-the-platforms-do-it)). It's the [strangler](/docs/architecture/replacing-systems#strangle-instead-of-rewriting) applied by the vendor.
- **Greenfield beside the legacy bank.** A new brand or digital bank on a new core, with the legacy bank left alone, as Chase UK.

Progressive migration trades one large risk for a long period of smaller ones: two systems of record, integrations that must route by account, customers whose checking is on one core and savings on another, and a reconciliation between the two every day. It works only if the bank actually finishes; a progressive migration that stalls leaves the bank paying for two cores indefinitely.

My default for a single bank with a vendor core is big bang onto a mature core with the vendor's conversion methodology, rehearsed past the point of comfort. For a large bank, or any bank moving to a fundamentally different core (batch to real-time, parameter products to programmable ones), it's progressive by product, with the system of record held as data from the first account.

## Coexistence and the System of Record

When two cores run at once, every account has exactly one system of record, and every system around the core has to know which.

- **Route by account, not by guess.** A routing table (in this volume's model, `accounts.system_of_record` from [Core Banking Systems](/books/banking-and-lending/core-banking-systems#how-to-build-it)) tells the payments hub, the card processor and digital banking where to post and where to read. An account moves by changing that row at a defined moment, after its balances have moved.
- **One customer, one view.** Digital banking must show accounts from both cores together, with consistent balance definitions; a customer shouldn't be able to tell which core holds which account.
- **Transfers between cores are payments.** Moving money from a checking account on one core to a savings account on the other is an internal transfer with two postings in two systems, and needs the same idempotency and in-flight tracking as any payment ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
- **One GL.** Both cores summarize into the same general ledger, each with its own subledger proofs, so the bank's books stay whole while its subledgers are split.
- **Shadow before switch.** Before an account's system of record moves, the new core can run it in shadow, computing interest, fees and balances from the same inputs, and the bank compares them day by day ([Dark Launch and Shadow Reads](/docs/architecture/replacing-systems#dark-launch-and-shadow-reads)). A cent of difference on interest is a product mapping bug found before a customer finds it.

## Product Mapping

A conversion maps every product version on the old core to a product version on the new one, and the mapping is where most customer-visible errors start.

- **Exact mapping first.** For each old version, a new version with the same rate source and tiers, tier method, balance basis, day count, compounding and crediting, fees and waivers, posting class, dormancy and statement cycle. Where the new core can't express a term, that's a decision, not a default.
- **Remapping is a change in terms.** If an old product's terms can't be reproduced and the bank moves accounts to a different product, any adverse difference needs the same notice as any other change ([Changing Terms on Existing Accounts](/books/banking-and-lending/product-configuration#changing-terms-on-existing-accounts)), which sets a deadline months before the conversion weekend.
- **Grandfathered versions surface here.** The conversion inventory is often the first complete count of live product versions a bank has done; it's also the cheapest moment to sunset some of them, with notice.
- **Test the mapping by recomputation.** For a sample of accounts per version, compute a past month's interest, fees and APY earned on the new core from the old core's inputs and compare to what the old core produced.

## Conversion Weekends

A merger or vendor conversion usually happens over a weekend, and the customer-facing shape is consistent enough to describe. Branches of the acquired bank close Friday afternoon; online, mobile and telephone banking stop Friday evening; cards keep working against a stand-in balance; branches reopen under the new name on Monday or, with a holiday, Tuesday. A local news report on KeyBank's conversion of First Niagara branches described exactly that: branches closed at 3 p.m. on Friday, mobile and phone banking off from 6 p.m., card purchases and ATM withdrawals still working, converted branches opening the following Tuesday. PNC's conversion of BBVA USA in October 2021 moved 2.6 million customers and about 600 branches in seven states at once.

Behind the weekend is a timeline that starts months earlier:

1. **Mapping and data extraction** of products, parties, accounts, history and every in-flight item, with the crosswalk from old identifiers to new ([Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping)).
2. **Customer notices** for anything that changes: account numbers, routing numbers, cards, checks, online banking credentials, statement dates, and any product term (with Regulation DD and Regulation Z notice periods).
3. **Mock conversions,** each a full extract, transform and load with the real runbook, reconciled and timed; CBA's five dress rehearsals are the pattern.
4. **Freeze** of product changes, new integrations and nonessential changes on both sides.
5. **The weekend:** final business day closes on the old core, final extract, load, reconciliation, go/no-go, routing switch, files and integrations repointed, smoke tests on real accounts.
6. **Rollback window:** the point after which reverting costs more than fixing forward is decided in advance, with the old core kept able to resume until then ([Cutover and the Rollback Window](/docs/architecture/replacing-systems#cutover-and-the-rollback-window)).
7. **Post-conversion:** heightened monitoring, a daily reconciliation between what the old core said and what the new one shows, customer support staffing, and the old core kept as a read-only archive ([Keep the Old System as a Read-Only Archive](/docs/architecture/replacing-systems#keep-the-old-system-as-a-read-only-archive)).

What has to reconcile before go, per product and in total, to the cent:

| Control | Old core | New core |
| --- | --- | --- |
| Account count by product version and status | Final extract | After load |
| Ledger, available and collected balances | Final business day snapshot | Opening snapshot |
| Accrued but uncredited interest | Final accrual | Opening accrual balance |
| Holds and blocks, by kind | Live holds | Loaded holds, with original expiries |
| Loan principal, interest and escrow, by loan | Final servicing balances | Opening servicing balances |
| Scheduled items: standing transfers, maturities, loan due dates | Schedule extract | Loaded schedule |
| Year-to-date interest paid and collected, by party | Tax figures | Loaded tax figures |
| Open cases: disputes, Reg E claims, legal process, with clock start dates | Case extract | Loaded cases |
| GL control accounts | Final GL | Opening GL |

Items in flight are the hardest part: card authorizations approved Friday and cleared Monday, ACH files received for Monday settlement, checks deposited Friday on Saturday's float, a Reg E claim whose 10-business-day clock started on the old core. Each needs an explicit owner and rule (who posts it, against which core, with which hold), decided and rehearsed before the weekend.

## Outsourcing Risk

Most banks don't run their core; they contract for it. The law and supervisory guidance make that contract the bank's risk to manage.

- **The vendor is examined as part of the bank.** Under the Bank Service Company Act, services performed for a bank by contract are subject to examination "to the same extent as if such services were being performed by the depository institution itself on its own premises", and the bank must notify its regulator of the relationship within thirty days (12 USC 1867(c)).
- **Third-party risk management guidance.** The 2023 interagency guidance (Fed, FDIC and OCC, 88 FR 37920, June 9, 2023) sets a life cycle (planning, due diligence and selection, contract negotiation, ongoing monitoring, termination) with more rigor for "critical activities", those that could cause significant risk if the third party fails, have significant customer impacts, or significantly affect the bank's financial condition or operations. A core is critical by any reading. Its contract considerations include the bank's ability to access its data "in an appropriate and timely manner", the right to audit, continuation of the activity if problems arise, transfer of accounts, data or activities to another third party without penalty, termination with "reasonable time frames to allow for the orderly transition", the timely return or destruction of data, and termination without penalty if a regulator directs it.
- **Its proposed replacement.** On September 11, 2026 the OCC, with the Fed, FDIC and NCUA, proposed guidance "revising and replacing existing guidance on third-party risk management" (OCC Bulletin 2026-46): risk-based, prioritizing oversight by the magnitude and likelihood of harm, avoiding approaches that treat every third party as higher risk, and setting no enforceable standards. Comments are due 60 days after Federal Register publication; as of October 2026 it is a proposal, and the 2023 guidance remains in effect.
- **Contracts in practice.** The FDIC's FIL-19-2019 reported examiners finding technology service provider contracts that didn't require business continuity plans or recovery standards, didn't define remedies, and didn't detail incident notification duties, and advised compensating controls where contracts leave gaps.
- **Incident notice from the vendor.** A bank service provider must notify its bank customers as soon as possible when an incident disrupts or degrades covered services for four or more hours (12 CFR 53.4); the bank's own notice obligations and resilience planning are in Security, Resilience & Incident Notice.

For a conversion, outsourcing risk shows up on both ends: the outgoing vendor's deconversion obligations (data in a usable format, on a schedule, at a stated price, with cooperation through cutover) and the incoming vendor's readiness, which TSB shows must be evidenced, not asserted. The [exit plan](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter) for a core belongs in the contract signed for it, years before anyone needs it.

## How to Build It

These tables support a conversion or a coexistence period, extending `accounts` (with `system_of_record` from [Core Banking Systems](/books/banking-and-lending/core-banking-systems#how-to-build-it)), `product_versions` from [Products & Product Configuration](/books/banking-and-lending/product-configuration#how-to-build-it), and `cases` from the core data model.

```sql
CREATE TABLE conversions (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id   UUID NOT NULL REFERENCES institutions (id),
  kind             TEXT NOT NULL CHECK (kind IN ('merger', 'vendor_change', 'platform_upgrade', 'progressive_slice')),
  source_system    TEXT NOT NULL,
  target_system    TEXT NOT NULL,
  scheduled_for    DATE NOT NULL,           -- the conversion business date
  rollback_deadline TIMESTAMPTZ NOT NULL,   -- decided in advance
  status           TEXT NOT NULL CHECK (status IN ('planning', 'rehearsing', 'frozen', 'cutting_over', 'converted', 'rolled_back'))
);

-- Every run, rehearsal or real, with its timings.
CREATE TABLE conversion_runs (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  conversion_id  UUID NOT NULL REFERENCES conversions (id),
  kind           TEXT NOT NULL CHECK (kind IN ('mock', 'dress_rehearsal', 'production')),
  started_at     TIMESTAMPTZ NOT NULL,
  offline_from   TIMESTAMPTZ,
  offline_until  TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ,
  go_decision    TEXT CHECK (go_decision IN ('go', 'no_go', 'rollback')),
  decided_by     UUID,
  evidence       JSONB                      -- what the decision rested on
);

-- Old identifiers to new, for accounts, parties, cards and cases.
CREATE TABLE conversion_crosswalk (
  conversion_id  UUID NOT NULL REFERENCES conversions (id),
  entity         TEXT NOT NULL,             -- 'account', 'party', 'card', 'case', 'standing_order'
  source_ref     TEXT NOT NULL,             -- the old core's key
  target_id      UUID NOT NULL,
  PRIMARY KEY (conversion_id, entity, source_ref),
  UNIQUE (conversion_id, entity, target_id)
);

-- Product version mapping, with the decision when terms differ.
CREATE TABLE conversion_product_mappings (
  conversion_id     UUID NOT NULL REFERENCES conversions (id),
  source_product_ref TEXT NOT NULL,         -- old core's product and version
  target_version_id UUID NOT NULL REFERENCES product_versions (id),
  exact             BOOLEAN NOT NULL,
  differences       JSONB,                  -- required when exact = false
  term_change_id    UUID,                   -- the noticed change when a difference is adverse
  approved_by       UUID NOT NULL,
  PRIMARY KEY (conversion_id, source_product_ref)
);

-- Control totals per run, per control and product, old against new.
CREATE TABLE conversion_controls (
  run_id          UUID NOT NULL REFERENCES conversion_runs (id),
  control         TEXT NOT NULL,            -- 'account_count', 'ledger_balance', 'accrued_interest', 'holds', 'ytd_interest', 'open_cases', ...
  product_ref     TEXT NOT NULL DEFAULT '*',
  source_value    BIGINT NOT NULL,
  target_value    BIGINT NOT NULL,
  difference      BIGINT GENERATED ALWAYS AS (target_value - source_value) STORED,
  explained_by    TEXT,
  PRIMARY KEY (run_id, control, product_ref)
);

-- Items in flight across the cutover and who handles each.
CREATE TABLE conversion_in_flight (
  run_id        UUID NOT NULL REFERENCES conversion_runs (id),
  item_type     TEXT NOT NULL,              -- 'card_authorization', 'ach_entry', 'deposit_item', 'reg_e_claim', ...
  source_ref    TEXT NOT NULL,
  rule          TEXT NOT NULL,              -- the rehearsed handling rule
  posted_on     TEXT CHECK (posted_on IN ('source', 'target')),
  resolved_at   TIMESTAMPTZ,
  PRIMARY KEY (run_id, item_type, source_ref)
);

-- Converted cases keep their original clock start.
ALTER TABLE cases
  ADD COLUMN converted_from_ref TEXT,
  ADD COLUMN clock_started_at   TIMESTAMPTZ;
```

The go/no-go gate is a query, not a meeting's impression:

```sql
SELECT c.control, c.product_ref, c.difference
FROM conversion_controls c
WHERE c.run_id = :run_id
  AND c.difference <> 0
  AND c.explained_by IS NULL;
-- any row blocks 'go'
```

How it runs:

1. **Every mock and rehearsal is a `conversion_runs` row** with the same controls as production, so the production night is the nth run of a measured process.
2. **Product mappings are approved before the freeze,** with any inexact mapping tied to a noticed change in terms.
3. **The crosswalk is loaded first** and every other load resolves through it, so no record arrives without a known origin.
4. **Controls run after load,** per product and in total, and the go decision records the run's evidence and who decided.
5. **Routing flips per account** (`accounts.system_of_record`) only after that account's controls pass; in a progressive migration this is the unit of the slice.
6. **In-flight items** are worked to resolution after cutover, each by its rehearsed rule.

## Auditing

A conversion is an examination topic before and after the weekend, and its records answer the customer complaints that follow. Beyond [Audit Trails](/docs/architecture/audit-trails):

- **Each run's controls and differences,** with explanations, and the go/no-go decision with its evidence and decision-maker, retained as they were on the night.
- **The crosswalk,** permanently, so any old account number, card or case reference resolves to the new record years later.
- **Product mappings and their approvals,** and the change-in-terms notices for any inexact mapping.
- **The old core's final state:** the last statements, balances, tax figures and history, as a read-only archive with access logging.
- **Vendor management records:** due diligence, the contract and its exit terms, the Bank Service Company Act notice, service-provider incident notices, and the evidence of supplier readiness the board relied on.

## What This Means for the System You Build

- **Hold the system of record per account as data** from day one, and route every integration by it.
- **Treat product behavior as the thing being migrated:** map every version exactly or notice the change, and prove the mapping by recomputing interest and fees.
- **Reconcile by control totals per product and in total, to the cent,** across counts, balances, accrued interest, holds, schedules, tax figures and open cases, and block go on any unexplained difference.
- **Rehearse the full cutover repeatedly on production-like infrastructure,** time it, and keep channels in a degraded mode instead of dark.
- **Decide the rollback deadline and in-flight rules before the weekend,** and keep the old core as a read-only archive afterward.
- **Write the exit into the core contract:** data format, timing, cooperation and price, because the next conversion starts the day this one ends.

## References

**Law and regulation**

- [12 USC 1867: Regulation and examination of bank service companies](https://www.law.cornell.edu/uscode/text/12/1867), examination of contracted services as if performed by the bank, and notice within thirty days
- [12 CFR 53.4: Bank service provider notification](https://www.law.cornell.edu/cfr/text/12/53.4), notice to bank customers for incidents disrupting covered services for four or more hours

**Regulators and guidance**

- [Interagency Guidance on Third-Party Relationships: Risk Management (88 FR 37920, June 9, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-06-09/html/2023-12340.htm), the life cycle, critical activities, and contract terms on data access, audit, continuity, transfer, termination and data return
- [OCC Bulletin 2026-46: Third-Party Risk Management, Proposed Guidance and Request for Comment](https://occ.gov/news-issuances/bulletins/2026/bulletin-2026-46.html), the September 11, 2026 proposal to revise and replace third-party risk management guidance
- [FDIC FIL-19-2019: Technology Service Provider Contracts](https://www.fdic.gov/news/financial-institution-letters/2019/fil19019.html), gaps in continuity, recovery and incident terms, and risks of long-term and auto-renewing contracts
- [FCA: TSB fined £48.65m for operational resilience failings](https://www.fca.org.uk/news/press-releases/tsb-fined-48m-operational-resilience-failings), the April 2018 migration, customers affected, redress, the fines and the findings
- [Bank of England: PRA fines the former Chief Information Officer of TSB Bank plc](https://www.bankofengland.co.uk/news/2023/april/pra-fines-former-cio-of-tsb-bank-plc-for-breach-of-pra-senior-manager-conduct-rules), the April 2023 fine and the readiness assurance given without sufficient evidence

**Filings**

- [Q2 Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1410384/000141038426000006/qtwo-20251231.htm), initial digital banking agreement terms averaging over five years
- [Alkami Technology: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1529274/000152927426000009/alk-20251231.htm), average contract life of about 70 months

**In practice**

- [TSB: Board publishes independent review of 2018 IT migration](https://www.tsb.co.uk/news-releases/slaughter-and-may/), the Slaughter and May review on testing and supplier oversight, and the inconsistently configured data centres
- [Commonwealth Bank: Lessons from Commonwealth Bank's core banking transformation](https://www.commbank.com.au/articles/newsroom/2026/03/commonwealth-bank-core-banking-cloud-migration-case-study.html), the cloud cutover target and outcome, dress rehearsals, test crews and accounts
- [Thought Machine: Inducted into JPMorgan Chase's 2022 Hall of Innovation](https://thoughtmachine.net/press-releases/jpmorgan-chase-hall-of-innovation), the multi-year Vault Core program across Consumer & Community Banking
- [10x Banking: How Chase UK built a next-gen digital bank](https://www.10xbanking.com/chase-uk-launches-new-retail-banking-proposition-in-uk), the AWS-based core, build time and vendor-reported customer figures
- [Jack Henry: State of Jack Henry Platform](https://knowledge.banno.com/platform/state-of-the-platform/), component-by-component replacement status
- [Thought Machine: Vault Core](https://www.thoughtmachine.net/vault-core), deployment flexibility and the single ledger
- [PNC: PNC achieves national expansion with conversion of BBVA USA](https://pnc.mediaroom.com/2021-10-12-PNC-Achieves-National-Expansion-With-Conversion-Of-BBVA-USA), 2.6 million customers and about 600 branches converted at once
- [WKBW: KeyBank announces conversion weekend services](https://www.wkbw.com/news/keybank-announces-conversion-weekend-services), branch and channel cutoffs and what kept working during a conversion weekend
