+++
title = "Errors & Disputes on Deposit Accounts"
nav_title = "Errors & Disputes"
description = "Reg E error resolution as a workflow engine: notices, clocks, provisional credit and liability tiers, Reg CC recredit claims, check claims and complaints."
category = "Banking & Lending Industry"
order = 2417
part = "Deposits"
tags = ["banking", "deposits", "regulation-e", "error-resolution", "disputes", "complaints"]
+++

A customer who says "I didn't make this transfer" has started a legal clock, whatever channel they used and whatever the bank's systems call it. For consumer accounts the Electronic Fund Transfer Act and Regulation E (12 CFR 1005) decide what counts as an error, how long the institution has to investigate, when it must put the money back provisionally, what it must say and when, and how much of an unauthorized transfer the consumer can be made to bear. Regulation CC adds a narrower claim for substitute checks, the UCC sets the rules for checks generally, and every complaint, whether it arrives in the app, by phone or through the CFPB, has its own clock. None of these wait for a card network, a merchant, a sponsor bank or a fraud model.

This chapter is the account holder's institution's side: the error claim as a case with deadlines, money and notices, run by software that can't miss a date. How a card chargeback works between issuer and acquirer is in [Cardholder Disputes](/books/payments/issuer-processing#cardholder-disputes) and [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks); how an unauthorized ACH debit is returned is in [Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours). Scams, account takeover and P2P fraud claims are the subject of Account Takeover & Scams; they arrive through the same intake and run on the same clocks.

## How the Platforms Do It

What platforms publish about running Regulation E claims on deposit and card programs, as of October 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **Marqeta** | Card issuer processor | A Reg E case API: `POST /cases` with `original_transaction_token`, `dispute_reason` and `cardholder_contact_date`, `regulation_type = REG_E` for debit and prepaid; provisional credit due within 10 business days of contact, granted automatically or flagged by webhook "on or before business day 9"; milestones `PC_PENDING`, `PC_GRANTED`, `PC_PERM`, `PENDING_PC_REVERSAL`; who investigates is set by the program agreement |
| **Synctera** | BaaS platform | The fintech, "under the supervision of its Partner Bank, is responsible for front-line customer support"; the clock starts at the initial customer contact; customers need give only merchant, amount, date and a description; merchandise and service disputes, business transactions and claims after 60 days fall outside Reg E |
| **Unit** | BaaS platform | Card (unauthorized and authorized) and received-ACH dispute types; provisional credit "within 5-10 business days" after an initial review, funded from the client's reserve account; statuses `Investigation Started`, `Provisionally Credited`, `Resolved Won`, `Resolved Lost`, `Denied`; webhooks `dispute.created` and `dispute.status.change` |
| **Stripe Issuing** | Card issuing platform | Regulation E "might require Stripe to issue provisional credit", depending on whether the investigation runs 45 or 90 days, and "if the dispute isn't resolved within the required timeframe, the provisional credit becomes permanent"; a dispute can be submitted to the network once and not amended ([Debit and Prepaid: Regulation E](/books/payments/issuer-processing#debit-and-prepaid-regulation-e)) |

Three things stand out. **The regulation's clock is the platform's clock:** each one starts it at the customer's first contact and computes provisional credit from there, not from when a form arrives or a network file posts. **Who does the work is a contract, the obligation is not:** Marqeta tells programs to "refer to your agreement to confirm which party is responsible", Synctera puts intake on the fintech and investigation behind the bank's policy, and Unit funds credit from the client's reserve. The account holder's institution owes the consumer the result either way. **A card claim runs two processes at once,** the regulation's and the network's, and a platform that waits for the chargeback to decide the Reg E case has failed the regulation; that is what the CFPB found against Block in January 2025, below.

## What Counts as an Error

Regulation E's error list is short and specific (12 CFR 1005.11(a)):

- an **unauthorized** electronic fund transfer;
- an **incorrect** transfer to or from the account;
- a transfer **omitted** from a periodic statement;
- the institution's own **computational or bookkeeping** error;
- the consumer receiving an **incorrect amount from an ATM**;
- a transfer **not identified** as the rules require;
- the consumer's **request for documentation** the regulation requires, or for clarification about a transfer, including a request to decide whether there was an error.

It excludes routine balance inquiries, requests for tax or recordkeeping information and requests for duplicate documentation. And it only covers what is an electronic fund transfer in the first place: checks, Fedwire and similar wire transfers, most securities transfers, the institution's own automatic transfers between a consumer's accounts and transfers initiated by an ordinary phone call to the bank are all outside it (12 CFR 1005.3(c)), as are business accounts. A dispute about goods not received or not as described is a merchant dispute the card network may handle, not a Reg E error; Unit and Synctera both draw that line, with Unit noting exceptions for ATM dispense errors, small transactions and processing errors.

Two CFPB answers settle the arguments that come up most. A transfer made by someone who tricked the consumer into sharing their credentials "is an unauthorized EFT under Regulation E", and "negligence by the consumer cannot be used as the basis for imposing greater liability" than the regulation allows. A consumer who sends money themselves to a scammer is a different case, the subject of Account Takeover & Scams.

## The Notice and the Clock

The consumer has **60 days after the institution sent the periodic statement** first showing the error to give notice; for a documentation request, 60 days from when the institution sent the information. The notice need only let the institution identify the consumer and the account and say why the consumer believes there's an error (12 CFR 1005.11(b)). It can be oral. The institution may require written confirmation within 10 business days of an oral notice, but only if it says so, and gives the address, when the oral notice is made; the clock still starts at the oral notice, and Federal Reserve examiners cite institutions that wait for the letter.

What the institution may not do is add conditions. It may not delay starting or finishing the investigation while it waits for information from the consumer, such as an affidavit or a police report, and it may not send the consumer to the merchant first; the CFPB's FAQs say so in terms, and private network rules that are less protective "do not change a financial institution's Regulation E obligations". Synctera's guide makes the same point operationally: merchant, amount, date and a description are all a customer has to give.

The deadlines, from 12 CFR 1005.11(c) and (d):

| Step | Deadline |
| --- | --- |
| Investigate and decide | 10 business days after notice (20 for a transfer within 30 days after the account's first deposit) |
| Or credit provisionally and investigate longer | Provisional credit within those 10 (or 20) business days allows up to 45 calendar days; 90 for point-of-sale debit card transactions, transfers not initiated in a state, and new accounts |
| Tell the consumer about the provisional credit | Within 2 business days after crediting, with the amount and date |
| Correct a found error | Within 1 business day after determining it |
| Report the results | Within 3 business days after completing the investigation |
| No error: explain, and reverse provisional credit | A written explanation with the right to request the documents relied on; notice of the debit's date and amount; honor checks, drafts and preauthorized transfers for 5 business days without overdraft fees, for items it would have paid had the credit stayed |

Provisional credit is the alleged amount, plus interest where applicable, and the consumer gets full use of it during the investigation. For a claimed unauthorized transfer the institution may withhold up to $50 if it has a reasonable basis to believe the transfer was unauthorized and the consumer's liability conditions are met; it need not credit at all if it required written confirmation of an oral notice and didn't receive it within 10 business days. An institution that fully complied has no further duty if the consumer later reasserts the same error, except after a documentation request.

A **reasonable investigation** can be a review of the institution's own records when the transfer was to or from a third party with whom the institution has no agreement for that kind of transfer (12 CFR 1005.11(c)(4)). Where there is an agreement, as with a card network or a P2P network, the institution looks further. And the investigation is the institution's own: a won chargeback does not satisfy it and a lost one does not excuse it ([Cardholder Disputes](/books/payments/issuer-processing#cardholder-disputes)).

Prepaid accounts have their own start date and an identity-verification condition under 12 CFR 1005.18(e), covered in [Debit and Prepaid: Regulation E](/books/payments/issuer-processing#debit-and-prepaid-regulation-e). Institutions with $100 million or less in assets are excluded only for preauthorized transfers (12 CFR 1005.3(c)(7)); error resolution reaches them for everything else.

## Liability for Unauthorized Transfers

How much the consumer bears depends on when they told the institution (12 CFR 1005.6(b)), and only if the institution gave the required disclosures and, where an access device was used, it was an accepted device with a means of identifying its holder:

- **Notice within 2 business days of learning of a lost or stolen access device:** the lesser of $50 or the unauthorized transfers before notice.
- **Later notice:** the lesser of $500 or the sum of up to $50 for transfers in those first two business days and the transfers after them and before notice that the institution shows would not have happened with timely notice.
- **Unauthorized transfers on a statement not reported within 60 days of its transmittal:** the consumer bears the transfers after the 60 days and before notice that the institution shows timely notice would have prevented, plus the amounts above if an access device was involved.

Notice counts as given when the consumer takes the steps reasonably necessary to tell the institution, in person, by phone or in writing, even if a particular employee never sees it, and it is constructively given when the institution learns of circumstances suggesting an unauthorized transfer. Extenuating circumstances (a hospital stay, extended travel) extend the time limits to a reasonable period. State law or the account agreement may impose less liability, and card network zero-liability policies usually do for card transactions (Unit notes card disputes also follow the processor's zero-liability policy), which is why a program's disclosed policy, not the regulation's tiers, is often what the system must apply.

## Worked Numbers: A Stolen Card

A consumer's debit card is stolen on Saturday, October 3, 2026, and they notice that day. Unauthorized purchases: $300 on Saturday, October 3, $400 on Monday, October 5, and $700 on Friday, October 9. They call the bank on Tuesday, October 13 (Monday the 12th is Columbus Day, not a business day).

**Liability.** Two business days after learning of the loss run through Tuesday, October 6 (Saturday isn't a business day; Monday the 5th and Tuesday the 6th are). Transfers in that window: $300 + $400 = $700, of which the consumer can bear at most $50. The $700 on October 9 came after the window and before notice; if the bank shows a call by October 6 would have stopped it, it counts. The consumer's liability is the lesser of $500 and $50 + $700 = $750, so **$500**; the bank absorbs $900 of the $1,400. Had they called by October 6, it would have been $50. Under a card zero-liability policy, it would be nothing.

**The clock.** The claim was received by phone on Tuesday, October 13. Counting business days from the day after notice:

| Deadline | Date |
| --- | --- |
| Decide, or provisionally credit (10 business days) | Tuesday, October 27, 2026 |
| Notice of provisional credit, if credited on October 27 (2 business days) | Thursday, October 29 |
| Investigation limit for point-of-sale debit (90 days) | Monday, January 11, 2027 |

If the bank provisionally credits on October 27, it may withhold $50 of the $1,400 only if it has a reasonable basis to believe the transfers were unauthorized and the liability conditions are met; whatever liability it finally assesses comes out of the final determination, not the provisional credit. The claim needed no police report and could not wait for one.

## Regulation CC and Check Claims

Checks aren't electronic fund transfers, so a check that was forged, altered or paid twice is a different claim under different law.

**Substitute check recredit.** A consumer who received a substitute check (the paper reproduction that replaced originals after Check 21) can claim an expedited recredit under 12 CFR 229.54 when they assert in good faith that the account was improperly charged or they have a warranty claim, that they lost money, and that the original or a sufficient copy is needed to tell. The claim must arrive by the 40th calendar day after the later of the statement or the substitute check being delivered, extended for extenuating circumstances; a written claim, if required, by the 10th business day after an oral one. If the bank hasn't decided by the end of the 10th business day after receiving the claim, it recredits the lesser of the check amount or **$2,500** that day and the rest by the 45th calendar day. It may delay availability of that recredit for new accounts (claims within 30 calendar days of opening), repeatedly overdrawn accounts (six or more business days negative in six months, or two days by $5,000 or more) and reasonable cause to suspect fraud, until the business day after it decides or the 45th day. Notices go out the next business day after each action. A $4,000 claim received on Tuesday, October 13, 2026 and still undecided gets $2,500 by Tuesday, October 27 and $1,500 by Friday, November 27.

**Unauthorized signatures and alterations.** Outside the substitute check rule, the bank's statement duties and the customer's duty to examine it are in UCC 4-406. The customer must review statements with reasonable promptness and report unauthorized signatures or alterations; failing that, they are precluded from asserting them where the bank shows a loss, and from asserting the same wrongdoer's later items paid after a reasonable period "not exceeding 30 days." Comparative fault applies when the bank failed to exercise ordinary care, and a customer who doesn't report within **one year** after the statement or items are made available is barred regardless of care. The same section requires whoever keeps items that aren't returned to be able to produce legible copies for seven years. Business accounts live mostly here and in UCC 4A for wires, under the account agreement's notice periods, which is why commercial deposit agreements and positive pay ([Check Fraud](/books/payments/checks#check-fraud)) matter so much.

## Complaints

A complaint is a customer's expression of dissatisfaction, and most institutions and sponsor banks define it broadly in their policies; an error notice is a specific legal event. The two overlap. A complaint that identifies the account and says why the customer thinks a transfer is wrong is a notice of error under 12 CFR 1005.11(b), and its Reg E clock started when it arrived, whichever queue it landed in. My rule is that every complaint intake runs an error check and opens the error case alongside, rather than leaving support staff to recognize one.

Complaints filed with the CFPB come back to the company through its portal. Companies generally respond within **15 days**, can mark a response "in progress" and give a final one within **60 days**, and the CFPB publishes the complaint, without direct identifiers, in its public Consumer Complaint Database. For a fintech program, the sponsor bank expects to see its complaint log: Synctera's guide puts logging complaints received directly or through regulators on the fintech and suggests searching the CFPB database for the company's name. Complaint data is also how examiners and sponsor banks find a broken error process before they sample it ([Complaints and Error Resolution](/books/payments/operating-the-platform#complaints-and-error-resolution) covers a provider's version).

## What Goes Wrong

The enforcement record is consistent about where error resolution fails:

- **Using the network as the investigation.** In January 2025 the CFPB found that Block "used the card network chargeback process as a substitute" for timely Reg E resolution of unauthorized-transaction disputes on Cash App, and ordered at least $75 million in redress and a $55 million penalty.
- **Letting a model decide alone.** In July 2022 the CFPB found that Bank of America, administering state unemployment benefit prepaid cards, chose to "solely rely on an automated fraud filter" for error notices from fall 2020 to mid-2021, denied claims and froze accounts on its results, and applied it to claims already paid; the CFPB imposed a $100 million penalty and the OCC a separate $125 million.
- **The routine misses.** The Federal Reserve's 2024 violation review lists institutions that waited for written confirmation of oral notices, didn't provide provisional credit, restricted access to provisionally credited funds, sent late or incomplete notices (often through a vendor's generic templates), didn't correct errors within one business day, wrote explanations that said only "no error", and reversed provisional credit without telling the consumer.

Every one of these is a workflow defect, not a judgment call, and each is preventable by making the deadline, the money and the notice outputs of the case rather than tasks for a person to remember.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). A claim is a `cases` row (`kind` `'reg_e_error'`, `'reg_cc_claim'` or `'complaint'`) with `opened_at` at first contact, and its detail, its several deadlines, its money and its notices hang off it. The deadline tables are generic; Levies, Garnishments & Legal Process uses the same ones.

```sql
-- One row per claimed transaction: what was alleged and what the rule needs to know.
CREATE TABLE error_claims (
  case_id               UUID NOT NULL REFERENCES cases (id),
  transaction_id        UUID REFERENCES transactions (id),   -- null for an omitted transfer
  error_type            TEXT NOT NULL CHECK (error_type IN ('unauthorized', 'incorrect_amount',
                          'omitted', 'bookkeeping', 'atm_shortfall', 'not_identified',
                          'documentation_request', 'substitute_check', 'unauthorized_signature')),
  claimed_amount        BIGINT NOT NULL CHECK (claimed_amount >= 0),
  notice_channel        TEXT NOT NULL CHECK (notice_channel IN ('phone', 'chat', 'app', 'branch',
                          'mail', 'email', 'regulator_portal')),
  statement_id          UUID REFERENCES statements (id),     -- the statement that first showed it
  learned_of_loss_on    DATE,                                -- the consumer's statement, for 1005.6
  written_confirmation_required BOOLEAN NOT NULL DEFAULT FALSE,
  written_confirmation_due_at   TIMESTAMPTZ,
  written_confirmation_received_at TIMESTAMPTZ,
  new_account           BOOLEAN NOT NULL,                    -- within 30 days of first deposit
  pos_debit             BOOLEAN NOT NULL,
  foreign_initiated     BOOLEAN NOT NULL,
  determination         TEXT CHECK (determination IN ('error', 'no_error', 'different_error')),
  consumer_liability    BIGINT,                              -- set with the determination
  network_case_ref      TEXT,                                -- the chargeback, tracked separately
  PRIMARY KEY (case_id, transaction_id)
);

-- Every deadline a case carries, computed once at the triggering event with its inputs.
CREATE TABLE case_deadlines (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id           UUID NOT NULL REFERENCES cases (id),
  kind              TEXT NOT NULL,         -- 'decide_or_credit', 'credit_notice', 'investigation_limit',
                                           -- 'correct', 'report_results', 'cc_partial_recredit', ...
  due_at            TIMESTAMPTZ NOT NULL,
  rule_ref          TEXT NOT NULL,         -- '12 CFR 1005.11(c)(2)(i)@2026-10'
  inputs            JSONB NOT NULL,        -- trigger time, business days, calendar version, flags
  met_at            TIMESTAMPTZ,
  met_by_ref        TEXT,                  -- the credit, notice or decision that satisfied it
  superseded_by     UUID REFERENCES case_deadlines (id),  -- e.g. 10 days replaced by 45 on credit
  UNIQUE (case_id, kind, due_at)
);

-- Provisional credit and its reversal: money the institution owes under the rule, not the network.
CREATE TABLE provisional_credits (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id               UUID NOT NULL REFERENCES cases (id),
  amount                BIGINT NOT NULL CHECK (amount > 0),
  withheld_amount       BIGINT NOT NULL DEFAULT 0,           -- up to $50 for unauthorized claims
  credit_transaction_id UUID NOT NULL REFERENCES transactions (id),
  credited_at           TIMESTAMPTZ NOT NULL,
  final                 BOOLEAN NOT NULL DEFAULT FALSE,      -- error found, or recredit made final
  reversal_transaction_id UUID REFERENCES transactions (id),
  reversal_noticed_at   TIMESTAMPTZ,
  honor_until           DATE,                                -- 5 business days after the reversal notice
  CHECK (withheld_amount BETWEEN 0 AND 5000),                -- minor units
  CHECK (reversal_transaction_id IS NULL OR reversal_noticed_at IS NOT NULL)
);

-- Notices the case sent are disclosures, so "what was this customer told" stays one query.
ALTER TABLE disclosures
  ADD COLUMN case_id UUID REFERENCES cases (id);
```

How it runs:

1. **Intake opens the case at first contact,** in any channel, and a complaint intake checks for an error and opens the error case beside it. The `opened_at` is the contact time, never the time a form was completed.
2. **The rule engine computes the deadlines** from the claim's flags (new account, point of sale, foreign) and the institution's business-day calendar, and writes them to `case_deadlines` with their inputs ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). The calendar is the one Posting, Holds & Balances defines for the business date.
3. **Provisional credit is automatic unless decided first:** a job credits every case whose `decide_or_credit` deadline is a business day away with no determination, posts the credit as a transaction with its journal entry against a dispute suspense GL account, writes the notice as a `disclosures` row, and supersedes the 10-day deadline with the 45- or 90-day one. Whoever funds it under the program agreement (a reserve, a program account) is a second entry, not a reason to wait.
4. **The investigation records its evidence and decision** with who decided and why ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)); a fraud score is evidence, never the decision by itself.
5. **The outcome posts and notifies.** An error found makes the credit final (or credits within one business day); no error writes the explanation, schedules the reversal with its notice, and sets `honor_until` so the overdraft engine pays and doesn't fee items it would otherwise have paid.
6. **The network case runs beside it,** linked by `network_case_ref`, with its own ledger events ([Disputes in the Ledger](/books/payments/disputes-and-chargebacks#disputes-in-the-ledger)).

The control query that should return nothing every morning:

```sql
SELECT d.case_id, d.kind, d.due_at
FROM case_deadlines d
JOIN cases c ON c.id = d.case_id
WHERE d.met_at IS NULL
  AND d.superseded_by IS NULL
  AND d.due_at < NOW() + INTERVAL '1 day'
  AND c.status <> 'closed'
ORDER BY d.due_at;
```

## Auditing

Error resolution is sampled in every consumer compliance exam and every sponsor bank review. Regulation E requires evidence of compliance to be kept for at least two years from when the disclosure or action was required, and until final disposition once the institution knows of an investigation or proceeding (12 CFR 1005.13). Per case, keep:

- **When notice arrived and how,** with the recording or transcript for oral notices and the date shown, since undated oral notices are a finding.
- **Every deadline with its inputs,** when it was met and by what, and any superseded deadline.
- **The money:** provisional credit, any amount withheld and why, finality or reversal, and the journal entries behind each.
- **Every notice as sent,** from the provisional credit notice to the explanation and the reversal notice, as `disclosures` rows with their templates, so a vendor's generic template is visible before an examiner finds it.
- **The investigation:** the evidence considered, the decision, the decider (person or model, with version) and the liability computation.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Start every clock at first contact,** in any channel, and never at a form, a letter or a network file.
- **Compute and store every deadline** with its inputs, and run a daily control that finds any unmet one.
- **Make provisional credit an automatic consequence of a missed decision date,** posted, noticed and funded without a human remembering.
- **Keep the regulation's case and the network's case separate,** with separate money, so a chargeback outcome never decides the consumer's claim.
- **Never condition an investigation** on a police report, an affidavit or a call to the merchant.
- **Treat models as evidence,** with a person accountable for the determination and a reason the consumer can read.
- **Run complaint intake through the error check,** and log complaints where the sponsor bank and an examiner can see them.
- **Send every notice from the case, as a recorded disclosure,** with templates the institution has reviewed.

## References

**Law and regulation**

- [12 CFR 1005.3: Coverage](https://www.law.cornell.edu/cfr/text/12/1005.3), the exclusions for checks, wire transfers, securities, automatic transfers, telephone-initiated transfers and small institutions' preauthorized transfers
- [12 CFR 1005.6: Liability of consumer for unauthorized transfers](https://www.law.cornell.edu/cfr/text/12/1005.6), the $50, $500 and 60-day tiers, extenuating circumstances, how notice is given and more favorable state law
- [12 CFR 1005.11: Procedures for resolving errors](https://www.law.cornell.edu/cfr/text/12/1005.11), errors, notice, the 10, 20, 45 and 90-day clocks, provisional credit, the $50 withholding, notices, reversal and the five-business-day honoring rule
- [12 CFR 1005.13: Record retention](https://www.law.cornell.edu/cfr/text/12/1005.13), two years and until final disposition
- [12 CFR 229.54: Expedited recredit for consumers](https://www.law.cornell.edu/cfr/text/12/229.54), the 40-day claim period, the $2,500 recredit by the 10th business day, the 45th day and delayed availability
- [UCC 4-406: Customer's duty to discover and report unauthorized signature or alteration](https://www.law.cornell.edu/ucc/4/4-406), statement duties, the 30-day same-wrongdoer rule, comparative fault, the one-year bar and seven-year copies

**Regulators and guidance**

- [CFPB: Electronic Fund Transfers FAQs](https://www.consumerfinance.gov/compliance/compliance-resources/deposit-accounts-resources/electronic-fund-transfers/electronic-fund-transfers-faqs/), fraudulently induced credentials, negligence, no delay for information or the merchant, and network rules
- [Federal Reserve, Consumer Compliance Outlook: Top Federal Reserve System Violations in 2024: Regulation E Error Resolution Requirements (April 6, 2026)](https://www.consumercomplianceoutlook.org/articles/2026/first-issue-2026/top-federal-reserve-system-violations-in-2024-regulation-e-error-resolution-requirements), the violations examiners cited and their root causes
- [CFPB: Learn how the complaint process works](https://www.consumerfinance.gov/complaint/process/), 15-day and 60-day company responses and the public database

**Enforcement**

- [CFPB: Block, Inc. (January 16, 2025)](https://www.consumerfinance.gov/enforcement/actions/block-inc/), chargebacks as a substitute for Reg E resolution, at least $75 million redress and a $55 million penalty
- [CFPB: Bank of America, N.A. (2022-CFPB-0004, July 14, 2022)](https://www.consumerfinance.gov/enforcement/actions/bank-of-america-na-2/), the automated fraud filter, frozen accounts, the $100 million penalty and the OCC's $125 million

**Vendor documentation**

- [Marqeta: Disputes, Regulation E](https://www.marqeta.com/docs/developer-guides/disputes-regulation-e), the case API, provisional credit by business day 10, milestones and webhooks
- [Synctera: Customer support and complaints](https://docs.synctera.com/docs/customer-support-and-complaints), front-line support under the partner bank, the initial customer contact, what a customer must provide and complaint logging
- [Stripe: Issuing disputes](https://docs.stripe.com/issuing/purchases/disputes), Regulation E provisional credit, 45 or 90 days, and credit becoming permanent
- [Unit: Disputes overview](https://unit.co/docs/disputes-overview/), dispute types, provisional credit timing and funding from the reserve, statuses and webhooks
