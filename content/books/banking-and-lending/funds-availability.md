+++
title = "Funds Availability"
description = "Regulation CC on the account: the next-day and second-day schedule, the 2025 amounts, exception holds and notices, new accounts, and how a core computes holds."
category = "Banking & Lending Industry"
order = 2415
part = "Deposits"
tags = ["banking", "deposits", "regulation-cc", "funds-availability", "holds", "checks"]
+++

A deposit is credited when it arrives and spendable when the law says so, and the gap between the two is the bank's credit risk on every check it hasn't collected yet. The Expedited Funds Availability Act and Regulation CC (12 CFR 229, Subpart B) cap that gap: they tell a bank the latest moment each kind of deposit must be available, the few circumstances in which it may hold longer, and what it must tell the customer when it does. A bank can always release money sooner. It can't release it later than the schedule without an exception it can name and a notice it sent.

This chapter is the depositary bank's side: the schedule as a set of rules a core executes on every deposit. How a check clears, how it's returned, and why availability isn't finality for a platform that credits merchants from checks are in [Accepting Checks](/books/payments/checks#when-the-money-is-available); the balances and holds the schedule produces are the subject of Posting, Holds & Balances.

## How the Platforms Do It

What institutions and platforms publish about deposit availability, as of October 2026:

| Platform | Channel | What it publishes |
| --- | --- | --- |
| **Navy Federal Credit Union** | Mobile deposit | Before 6 p.m. ET on a weekday: first $275 the next business day, the rest the second business day after approval; after 6 p.m., weekends and holidays, each a day later. Worked example: $2,500 on Monday, $275 Tuesday, $2,225 Wednesday. $50,000 aggregate a day; 10 checks a day on personal accounts |
| **U.S. Bank** | Mobile deposit | "The first $275 of your total daily deposits is normally available right away"; deposits before 10 p.m. CT usually available the next business day; later ones take longer, with the date on the confirmation screen |
| **Unit** (BaaS platform) | Check deposit API | Statuses `Pending`, `PendingReview`, `Rejected`, then clearing once sent; "typically five days" in a special purpose clearing account before release; daily and per-check limits; returns mostly within 24 hours, some up to 60 days, duplicate presentment up to a year, forged endorsement or alteration up to three |
| **Increase** (bank-direct API) | Check deposit API | A pending transaction for the full amount on submission; an `inbound_funds_hold` object with `amount`, `automatically_releases_at`, `released_at` and status `held` or `complete`; statuses `pending`, `submitted`, `rejected`, `returned` |
| **Mambu** (core) | Holds on deposit accounts | Holds reduce the available balance only, with "no impact on the ledger or the total balance"; non-card holds placed by account never expire on their own |
| **Jack Henry** (core) | Remote deposit posting | Memo posting updates the available balance intraday and needs the posting file to hard post; real-time hard posting gives more flexibility in funds availability at the cost of handling more status events |

Three things stand out. **Banks publish faster than the floor:** both institutions above match or beat the regulation's schedule for mobile deposits, which treats them like any check deposit not made in person. **Platforms publish the mechanism, not the schedule:** Unit and Increase expose a clearing period or a hold with a release time, and the schedule behind it is the bank's. Where the end customer's account is a deposit account at that bank, Regulation CC binds the bank whatever a platform's default is, so a standard hold longer than the schedule needs a basis in one of the exceptions below and a notice, which makes it a question for the sponsor bank's compliance team, not a product setting. **A hold is an available-balance object,** separate from the ledger, which is how every core models it.

## What the Schedule Covers

Regulation CC's availability rules apply to an **account** in its own sense: a deposit that is a transaction account under Regulation D. Checking accounts, consumer and business alike, are covered; savings and time deposits aren't, even if they allow some third-party transfers ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#the-four-shapes)). Two clocks run underneath it:

- **A business day** is any calendar day other than a Saturday, Sunday or a specified federal holiday. Availability deadlines count business days.
- **A banking day** is the part of a business day when a bank office is open to the public for substantially all of its banking functions. A deposit is received on a banking day; one made on a non-banking day or after the cutoff counts as received on the next banking day.

The cutoff is the bank's choice within limits: no earlier than 2:00 p.m. local time at a staffed branch, and no earlier than noon at ATMs, contractual branches and off-premises facilities. Mail deposits are received the day the bank receives them; night depository and lockbox deposits the day they're removed and ready for processing; deposits at an off-premises ATM more than 50 feet from the bank, emptied no more than twice a week, the day they're removed, and the ATM has to say which days those are. Funds due on a business day must be available by the later of 9:00 a.m. local time or when the bank's tellers or ATMs open for withdrawals.

## The Schedule

The amounts were adjusted for inflation on July 1, 2025, from the change in CPI-W between July 2018 and July 2023; the agencies adjust them every five years, so the next set is due in 2030.

**By the next business day:**

- **Cash** deposited in person to an employee. Cash deposited any other way (a proprietary ATM, say) is due by the second business day.
- **Electronic payments,** the day after the bank receives them, and "received" means the bank has both collected the funds and has the account and amount information.
- **US Treasury checks** deposited to the payee's account.
- **On-us checks,** drawn on the same bank, if the branches are in the same state or check processing region.
- **Official items deposited in person** to the payee's account: US Postal Service money orders, Federal Reserve Bank and Federal Home Loan Bank checks, state and local government checks deposited in the issuing state, and cashier's, certified and teller's checks. The bank may require a special deposit slip as the condition. Deposited any other way, including by mobile, the same items are due by the second business day.
- **The first $275** of the day's other check deposits.

**By the second business day:** every other check. The schedule still has a fifth-business-day tier for nonlocal checks, but since the Federal Reserve consolidated check processing into a single region in 2010 there are no nonlocal checks, so the second business day is the rule for all of them.

**By the fifth business day:** deposits at a **nonproprietary ATM** (one the bank doesn't own or operate), cash and checks alike, without the $275 next-day amount.

**Two adjustments:** a bank may make check funds available for cash withdrawal one business day later than the schedule, but must make **$550** available for cash or similar means by 5:00 p.m. on the day they'd otherwise be due, on top of the $275. And deposits at branches in Alaska, Hawaii, Puerto Rico and the territories of checks drawn on banks in other states get one more business day.

## Exception Holds

Six exceptions let a bank hold beyond the schedule, each with a defined trigger:

| Exception | Trigger | What may be held |
| --- | --- | --- |
| **New account** | The first 30 calendar days after opening, unless every customer on it has had another account at the bank for at least 30 days | Cash and electronic payments stay next-day. Official items (Treasury, government, cashier's and similar) are next-day for the first **$6,725** a day, the rest by the ninth business day. Ordinary checks fall outside the schedule for the 30 days |
| **Large deposit** | Check deposits over **$6,725** in aggregate on one banking day, which may be aggregated across a customer's accounts | Only the amount over $6,725 |
| **Redeposited check** | A check returned unpaid and deposited again | The check, unless it was returned for a missing endorsement now supplied, or as post-dated and no longer is |
| **Repeated overdrafts** | Negative (or would be, with pending items paid) on six or more banking days in the last six months, or by $6,725 or more on two or more | Check deposits, for up to six months after the last overdraft |
| **Reasonable cause** | Facts that would give a reasonable person a well-grounded belief the check won't be paid; never the class of check or of depositor | The check |
| **Emergency** | Communications or equipment failure, another bank's suspension, war, or another emergency beyond the bank's control | Whatever the emergency affects, released a reasonable time after it ends |

When an exception applies, the bank may extend availability by a **reasonable period**, presumed to be up to one business day for on-us checks and up to five business days for other checks (six for the obsolete nonlocal category and nonproprietary ATM deposits). Longer has to be justified. The exception never lets a bank hold the part of a deposit it doesn't reach: a large deposit hold covers the excess over $6,725, and the first $6,725 keeps the normal schedule.

### The Notice

An exception hold without a notice is just a late release. The notice gives an account identifier of no more than four digits, the date of the deposit, the amount delayed, the reason the exception was invoked, and when the funds will be available. It's due at the time of deposit; if the deposit wasn't made in person to an employee, or the facts came to light later, it goes out no later than the first business day after the deposit or the discovery, whichever is later. Business accounts that hit the large deposit or redeposited check exception on most deposits can get one notice covering all of them, and repeated overdraft notices go once per period the exception is in effect. Notices of reasonable-cause holds and the reasons for them are kept as records.

The fee consequence is the part systems miss. If a bank holds a check under the reasonable-cause exception, or case by case beyond its own policy, without giving the written notice at the time of deposit, it can't charge overdraft or returned-item fees that the hold caused, if the check is then paid, unless its notice told the customer about the fees and it refunds them on request. The availability engine and the fee engine in [Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees) have to share that fact.

## Disclosures and Policy Changes

Separately from hold notices, a bank publishes its availability policy and keeps it in front of customers:

- **The specific availability policy disclosure** summarizes the policy: the categories of deposits it uses and when each is available, its business days and when a deposit counts as received, which exceptions it may invoke and that it will notify the customer when it does, any case-by-case policy with the latest time funds will be available, and how to tell a proprietary ATM from a nonproprietary one if that matters.
- **Case-by-case holds,** a bank's choice to hold some deposits longer than its own stated policy (but within the regulation), need a written notice like an exception's: the account, the date, the amount delayed and the day funds will be available.
- **Notices in place:** preprinted deposit slips say deposits may not be available for immediate withdrawal; a notice is posted wherever employees take consumer deposits, and at each ATM.
- **On request,** to anyone, the specific policy disclosure.
- **Changes** go to consumer account holders at least 30 days in advance; a change that makes funds available sooner may be disclosed up to 30 days after it takes effect.

A bank may not use a check deposit as a reason to freeze other money: when a customer deposits or cashes a check (other than one drawn on the bank), the bank can't hold more of the customer's funds than the check's amount, or longer than the check could be held.

## Worked Numbers: A Reg CC Timeline

An established consumer checking account. On Monday, November 9, 2026, at 11:00 a.m., the customer deposits $500 in cash and a $9,000 ordinary check at a teller. The bank's branch cutoff is 2:00 p.m. Wednesday, November 11 is Veterans Day, a federal holiday, so it isn't a business day.

**Without an exception:**

| When | Available | Rule |
| --- | --- | --- |
| Tuesday, Nov 10 | $500 cash + $275 of the check | Cash in person and the $275 next-day amount |
| Thursday, Nov 12 | The other $8,725 | Second business day; Wednesday doesn't count |
| Thursday, Nov 12, by 5:00 p.m. | At least $550 of it for cash withdrawal | If the bank uses the one-day cash withdrawal extension, the rest is available for cash Friday, Nov 13 |

**With the large deposit exception,** because the check deposit is over $6,725:

| When | Available | Rule |
| --- | --- | --- |
| Tuesday, Nov 10 | $500 cash + $275 | Unchanged |
| Thursday, Nov 12 | $6,450 more ($6,725 in total from the check) | The first $6,725 keeps the normal schedule |
| Thursday, Nov 19 | The last $2,275 | Up to five business days after Nov 12: Nov 13, 16, 17, 18, 19 |

The notice is handed over at the teller window, or sent by Tuesday, November 10 if the decision is made after the deposit.

**Three variations,** to show which input moves which date:

- **Deposited at 3:15 p.m. the same day,** after the cutoff: received Tuesday, November 10. The next business day is Thursday the 12th ($275), the second is Friday the 13th (the rest), and the large deposit excess moves to Friday, November 20.
- **A $9,000 cashier's check into an account opened November 2,** in person: the account is new until December 2. The first $6,725 is available Tuesday, November 10; the remaining $2,275 by the ninth business day, Monday, November 23 (counting Nov 10, 12, 13, 16, 17, 18, 19, 20, 23).
- **The cashier's check by mobile deposit** into the established account: not in person, so it's a second-business-day item, Thursday, November 12, with $275 on Tuesday. Whether the large deposit exception can reach an official item is a reading of the regulation and its commentary the bank's compliance team makes once, as policy.

Every one of those dates depends on the calendar, and Veterans Day is the kind of holiday that catches systems built on "add two weekdays": it's a Federal Reserve holiday, not a holiday for most retailers or many employers.

## Availability Isn't Finality

The schedule releases money before the bank knows the check will be paid. The paying bank's return, the warranty claims and the forgery claims follow their own clocks ([Returns, Fast and Slow](/books/payments/checks#returns-fast-and-slow)), and when one arrives, the bank charges the item back to the customer's account, which Regulation CC expressly preserves. Most returns arrive within days, often just after the funds were released. For a bank this is the credit risk the exceptions exist for: the new account, the large deposit, the redeposit and the repeatedly overdrawn account are the cases where releasing on schedule and then charging back is most likely to leave a negative balance. Fraud models can't hold a deposit on their own say-so; they can feed the reasonable-cause exception, with facts recorded and a notice sent ([Check Fraud](/books/payments/checks#check-fraud)).

## How the Core Implements It

An availability engine runs on every deposit and produces holds. Its steps:

1. **Classify each item** in the deposit: cash, electronic, Treasury check, on-us, official item and whether it was deposited in person, ordinary check. The check's routing number and type come from the MICR line and image ([The Image and the MICR Line](/books/payments/checks#the-image-and-the-micr-line)); the channel comes from the deposit.
2. **Fix the banking day of deposit** from the channel's cutoff and the bank's calendar. The calendar is data, loaded years ahead, shared with every other job that counts banking days ([Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays); [The Banking Calendar](/books/payments/treasury#the-banking-calendar)).
3. **Compute the schedule** for each item, including the $275 and $550 amounts from the regulation version in force on the deposit date, and the bank's own faster policy where it has one.
4. **Evaluate exceptions:** new account status, the day's aggregate check deposits across the customer's accounts, redeposit flags from returned items, the overdraft history, reasonable-cause referrals from fraud review. Each exception that applies extends only the part of the deposit it reaches.
5. **Create the holds,** one per tranche with its release time, and the notice if any exception or case-by-case extension applies.
6. **Release on time,** by a job that releases due holds at the start of each business day before 9:00 a.m. local time, and on read, so a late job never makes money unavailable that the law says is available ([Expiry Is Enforced on Read](/docs/architecture/reservations-and-holds#expiry-is-enforced-on-read)).

In a batch core this runs partly as memo posting during the day, with the deposit hard posted overnight; in a real-time core the deposit posts at once and the holds carry the availability. Either way the ledger balance includes the deposit and the available balance excludes the held amounts, and a return reverses the deposit with its own journal entry, never by editing the hold.

## How to Build It

These are deltas against the core data model in The Banking & Lending Business. A deposit is a `transactions` row with its journal entry; `holds` already carries amount, reason and expiry. Availability adds the items in the deposit, the decision for each, and the regulation's numbers as versioned data:

```sql
CREATE TABLE availability_rules (            -- the regulation's amounts and the bank's policy, effective-dated
  version            TEXT PRIMARY KEY,         -- e.g. 'reg-cc:2025-07-01'
  effective_on       DATE NOT NULL,
  next_day_amount    BIGINT NOT NULL,          -- 27500 (minor units)
  cash_withdrawal    BIGINT NOT NULL,          -- 55000
  exception_amount   BIGINT NOT NULL,          -- 672500: new account and large deposit thresholds
  policy             JSONB NOT NULL            -- the bank's own schedule where faster, cutoffs per channel
);

CREATE TABLE deposit_items (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  transaction_id     UUID NOT NULL REFERENCES transactions (id),   -- the deposit
  account_id         UUID NOT NULL REFERENCES accounts (id),
  item_class         TEXT NOT NULL CHECK (item_class IN ('cash', 'electronic', 'treasury_check', 'on_us',
                                         'official_item', 'check', 'nonproprietary_atm')),
  channel            TEXT NOT NULL CHECK (channel IN ('teller', 'proprietary_atm', 'nonproprietary_atm',
                                         'mobile', 'scanner', 'mail', 'night_drop', 'lockbox', 'electronic')),
  in_person          BOOLEAN NOT NULL,
  amount             BIGINT NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL,
  banking_day        DATE NOT NULL,             -- after cutoff and calendar
  check_item_ref     TEXT                       -- the item's capture record, for checks
);

CREATE TABLE availability_decisions (         -- one per item: the schedule and any extension
  deposit_item_id    UUID PRIMARY KEY REFERENCES deposit_items (id),
  rules_version      TEXT NOT NULL REFERENCES availability_rules (version),
  scheduled_on       DATE NOT NULL,             -- what the schedule required
  exception          TEXT CHECK (exception IN ('new_account', 'large_deposit', 'redeposit',
                                  'repeated_overdraft', 'reasonable_cause', 'emergency', 'case_by_case')),
  exception_basis    JSONB,                     -- the facts: aggregate amount, overdraft days, referral id
  extended_to        DATE,
  notice_id          UUID REFERENCES disclosures (id),
  notice_due_by      DATE,
  CHECK ((exception IS NULL) = (extended_to IS NULL))
);

ALTER TABLE holds
  ADD COLUMN deposit_item_id  UUID REFERENCES deposit_items (id),
  ADD COLUMN releases_at      TIMESTAMPTZ,      -- start of the business day the funds are due
  ADD COLUMN cash_only        BOOLEAN NOT NULL DEFAULT FALSE;  -- the one-day cash withdrawal extension
```

A $9,000 check under the large deposit exception produces three holds on the deposit: $8,725 releasing Thursday, $2,275 releasing a week later, and the cash-only tranche if the bank uses it. The fee engine checks `availability_decisions` before assessing an overdraft or returned-item fee during a hold, and suppresses it where the notice wasn't given at deposit. Release times are stored, so a regulator's question about a specific deposit is answered from rows, and the rules are data so the 2030 adjustment is a new `availability_rules` row, not a deployment ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## Auditing

Examiners test funds availability by sampling deposits and checking each against the schedule, the exceptions and the notices. Keep, per deposit:

- **The inputs to the decision:** item classes, channel, time received, cutoff applied, banking day, the calendar version, the rules version, and the account's new-account and overdraft status at the time.
- **Every exception with its facts,** and for reasonable cause the specific reason, which the regulation requires a bank to retain with the notice.
- **The notice as sent,** with its delivery channel and time, against its due date.
- **The release:** when each hold actually released against when it was due, so a late release is visible as a breach and not a mystery.
- **Disclosure versions:** the availability policy in force for each account, the posted notices by location and date, and every change with its 30-day consumer notice.

## What This Means for the System You Build

- **Availability is computed per item, not per deposit,** with each exception reaching only the part of the deposit it covers.
- **The calendar and the regulation's amounts are versioned data,** shared by every job that counts business days; Veterans Day and the 2030 adjustment are test cases.
- **Holds release on time by construction,** by a start-of-day job and on read, because the deadline is the law's.
- **No hold beyond the schedule without an exception, its facts and a notice,** and the fee engine knows when the notice was late.
- **Availability and finality are separate states,** with returns posted as their own reversing entries whenever they arrive.

## References

**Law and regulation**

- [12 CFR 229.2: Definitions](https://www.law.cornell.edu/cfr/text/12/229.2), account as a transaction account, business day and banking day
- [12 CFR 229.10: Next-day availability](https://www.law.cornell.edu/cfr/text/12/229.10), cash, electronic payments, Treasury, on-us and official items, and the $275 amount
- [12 CFR 229.12: Availability schedule](https://www.law.cornell.edu/cfr/text/12/229.12), second and fifth business days, the $550 cash withdrawal rule and the Alaska, Hawaii and territories extension
- [12 CFR 229.13: Exceptions](https://www.law.cornell.edu/cfr/text/12/229.13), new accounts, large deposits, redeposits, repeated overdrafts, reasonable cause, emergencies, notices and reasonable periods, and the $6,725 amount
- [12 CFR 229.16: Specific availability policy disclosure](https://www.law.cornell.edu/cfr/text/12/229.16), contents, case-by-case holds, notice timing and the fee consequence
- [12 CFR 229.18: Additional disclosure requirements](https://www.law.cornell.edu/cfr/text/12/229.18), deposit slips, posted notices, ATMs, requests and 30-day change notices
- [12 CFR 229.19: Miscellaneous](https://www.law.cornell.edu/cfr/text/12/229.19), when deposits are received, cutoff hours, 9:00 a.m. availability, chargeback rights and holds on other funds

**Regulators and guidance**

- [CFPB: Agencies announce inflation-adjusted thresholds for Regulation CC](https://www.consumerfinance.gov/about-us/newsroom/agencies-announce-inflation-adjusted-dollar-thresholds-for-regulation-cc-funds-availability), CPI-W from July 2018 to July 2023, every five years, compliance July 1, 2025
- [Federal Reserve: Reg CC amounts adjusted for inflation](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20240513a.htm), the joint adjustment and the July 1, 2025 compliance date
- [Federal Reserve: Applying funds availability rules](https://www.federalreserve.gov/Pubs/RegCC/examples.htm), worked examples including a $10,000 check under an exception hold
- [Federal Register: Availability of Funds and Collection of Checks (January 5, 2010)](https://www.govinfo.gov/content/pkg/FR-2010-01-05/html/E9-31254.htm), the final Appendix A amendment leaving a single check processing region
- [Federal Reserve: Holiday schedules](https://www.federalreserve.gov/aboutthefed/k8.htm), the holidays that aren't business days

**Vendor documentation**

- [Navy Federal Credit Union: Mobile deposits](https://www.navyfederal.org/services/mobile-online-banking/mobile-deposits.html), cutoff, $275 next day, the remainder, worked example and limits
- [U.S. Bank: Mobile check deposit availability](https://www.usbank.com/customer-service/knowledge-base/KB0218929.html), $275 right away and the 10 p.m. CT cutoff
- [Unit: Check deposits](https://www.unit.co/docs/check-deposits/), statuses, the clearing period, limits and return windows
- [Increase: Check deposits](https://increase.com/documentation/check-deposits) and [API reference](https://increase.com/documentation/api/check-deposits), statuses and the inbound funds hold
- [Mambu: Authorization holds](https://docs.mambu.com/md/docs/authorization-holds.txt), holds against the available balance only, and non-card holds without expiry
- [Jack Henry: Remote deposit posting](https://api.payments.jackhenry.com/docs/smart-alerts/APIReference/Posting/), memo posting and real-time hard posting
