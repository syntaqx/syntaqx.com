+++
title = "Payments in the EU & UK"
nav_title = "EU & UK"
description = "Europe for a US platform: interchange caps, SEPA and SEPA Instant, direct debits, Faster Payments, Bacs, CHAPS, payee checks, APP fraud and licensing."
category = "Payments Industry"
order = 1414
part = "The Rules"
tags = ["payments", "eu", "uk", "sepa", "bacs", "faster-payments", "psd2"]
+++

Europe is where a US platform finds out how much of its design was US law in disguise. Interchange is capped by regulation rather than set by networks, surcharging consumer cards is banned rather than capped, bank transfers are instant and nearly free, direct debits come with refund rights a US consumer would envy, and the receiving bank shares the bill when a customer is tricked into paying a fraudster. The EU and the UK started from the same rulebook and have been diverging since 2021, so a platform that serves both builds two of most things. This chapter is what changes, with [Payments in Canada](/books/payments/canada) as the nearest comparison, [ACH & Bank Transfers](/books/payments/ach) as the US baseline, and [Cross-Border Payments & FX](/books/payments/cross-border-and-fx) for what happens between currencies. Strong customer authentication has its own chapter, [SCA & 3-D Secure](/books/payments/strong-customer-authentication), and isn't repeated here.

## The Rails

| System | Where | What moves on it | Timing | Final? |
| --- | --- | --- | --- | --- |
| **SEPA Credit Transfer** (SCT) | Euro payments across the SEPA countries | Push payments, payouts, payroll | By the end of the next business day | Yes, once credited |
| **SEPA Instant** (SCT Inst) | Same | Push payments at any hour | Within 10 seconds | Yes |
| **SEPA Direct Debit** (SDD Core, B2B) | Same | Pull payments under a mandate | Collected on the due date | No: refunds for 8 weeks, 13 months if unauthorized (Core) |
| **Faster Payments** | UK, sterling | Push payments, payouts, open banking payments | Near real time, at any hour | Yes, except APP fraud reimbursement |
| **Bacs** | UK, sterling | Direct Debits and bulk Direct Credits | A three-day cycle | Direct Debits refundable under the Guarantee |
| **CHAPS** | UK, sterling | High-value same-day payments | Settled gross in real time, business days | Yes |

The volumes say which rails matter. In 2025 Faster Payments processed 5.55 billion payments worth £4.84 trillion, and Bacs 6.86 billion worth £6.05 trillion, 5.0 billion of them Direct Debits. Payment schemes in the UK are run by **Pay.UK** (Faster Payments, Bacs, the overlay services), CHAPS by the **Bank of England**, and the **Payment Systems Regulator** (PSR) regulates them, for now: the government announced in March 2025 that the PSR's functions will be consolidated, mainly into the FCA, which needs primary legislation, and as of September 2026 the FCA says nothing about the PSR's remit or work has changed yet.

## Card Rules

**Interchange is law in the EU.** The Interchange Fee Regulation (EU) 2015/751 caps consumer debit interchange at 0.2% of the transaction and consumer credit at 0.3%, and lets member states allow a per-transaction alternative of up to €0.05 for domestic debit. It doesn't cover commercial cards, ATM withdrawals, or cards from three-party schemes, though a three-party scheme that licenses other issuers or acquirers, or issues through a co-brand partner or agent, is treated as four-party and capped. The regulation reaches further than the caps, and the rest is engineering:

- **Unblended pricing.** Acquirers must offer and charge merchant service charges "individually specified for different categories and different brands", and the merchant agreement must state the interchange fees and scheme fees for each category and brand (Article 9).
- **Per-transaction information.** After each transaction the acquirer gives the merchant the merchant service charge and the interchange fee separately (Article 12). That's a statement and reporting requirement, built into the pricing engine of [Interchange & Pricing](/books/payments/interchange-and-pricing#a-pricing-engine).
- **Co-badging and choice.** Schemes can't stop issuers putting two brands on one card (Article 8), and nothing may automatically limit which brand or application pays; a merchant may set a priority, but the payer can override it. A checkout or terminal that silently picks the brand breaks the rule.
- **Honour All Cards, narrowed.** A merchant accepting one issuer's cards can't be forced to accept every other card of the scheme (Article 10), only consumer cards of the same brand and category, which are the capped ones.

**The UK kept the caps for domestic payments.** The UK's retained version of the regulation applies the same 0.2% and 0.3% caps, but only to domestic consumer transactions where the issuer, acquirer and point of sale are all in the UK. Payments between the UK and the EEA stopped being intra-regional at Brexit, and the networks raised them: Visa set its default fees for UK-EEA card-not-present payments at 1.15% (debit) and 1.5% (credit) in October 2021, and Mastercard followed in April 2022, a fivefold rise the PSR estimated costs UK businesses £150 to 200 million a year.

**The cap on those fees is still coming.** The PSR proposed a cap in December 2024, paused the work in March 2025 when Visa and Mastercard sought judicial review, and in October 2025 dropped its interim cap in favour of setting one with a firmer methodology (its consultation on that closed in November 2025). The High Court dismissed the networks' challenge on 15 January 2026, confirming the PSR's power to impose caps. Its 2026/27 plan commits only to "next steps", and as of October 2026 no cap level has been set. Price UK-EEA card-not-present transactions at the networks' rates, as effective-dated data, until a decision says otherwise.

**Scheme fees are under the same regulator.** The PSR found in March 2025 that Visa and Mastercard raised core scheme and processing fees by more than 25% in real terms between 2017 and 2023, costing UK businesses at least £170 million a year. Its July 2026 decision directs both networks on pricing governance (fee decisions compliant from November 2026) and on information, transparency and complexity (from July 2027). For a provider, the practical effect is more detailed fee data from the networks to reconcile against, and more questions from merchants about the network lines on their statements.

**Surcharging consumer cards is banned.** In the UK a payee must not charge any fee for paying with a consumer card covered by the interchange regulation, or for SEPA credit transfers and direct debits, a rule in force since 13 January 2018 when the UK implemented PSD2, whose surcharging ban for the EU it mirrors. Commercial cards fall outside the ban. [Surcharging & Fees](/books/payments/surcharging-and-fees) holds the rules per country; in the EU and UK the consumer answer is no.

## SEPA Credit Transfer and SEPA Instant

A SEPA Credit Transfer is the euro area's default bank transfer: an IBAN, a name, an amount and a reference, credited by the end of the business day after the payer's bank receives the order (the payment services rules set that execution time, and the UK's version carries the same one for sterling).

**SEPA Instant** is now universal, by law. The Instant Payments Regulation (EU) 2024/886 requires banks and payment providers that offer credit transfers to offer instant ones, available at any hour, with the payee's provider making funds available within 10 seconds of the payer's provider receiving the order, and charging no more than for a standard transfer. The deadlines were staged:

| Requirement | Euro area | Outside the euro area | Payment and e-money institutions |
| --- | --- | --- | --- |
| Receive instant payments | 9 January 2025 | 9 January 2027 | 9 April 2027 |
| Send instant payments | 9 October 2025 | 9 July 2027 | 9 April 2027 (euro area), 9 July 2027 (outside) |
| Charge no more than a standard transfer | 9 January 2025 | 9 January 2027 | |
| Verification of payee | 9 October 2025 | 9 July 2027 | |

Payers may set a daily or per-transaction limit that applies across all channels, so a large instant payment can be refused by the payer's own limit rather than by any scheme maximum.

**Verification of Payee** (VoP) is the part that touches every platform. Before a payer authorizes a transfer, their bank checks the payee's name against the IBAN and reports a match, a close match (with the correct name), no match, or that the check wasn't possible, free of charge to the payer. For a provider that means:

- **Payouts are checked against your recipients' names.** A merchant whose bank account is held in a legal name different from the trading name it registered with you will get "close match" or "no match" results on payouts you send. Collect and verify the account holder's legal name at onboarding, as [Merchant Onboarding](/books/payments/merchant-onboarding) collects it for KYB.
- **Collection accounts are checked against your name.** Customers paying into a provider's collection account (a virtual IBAN per merchant, say) see the name on that account. If it's the provider's name rather than the merchant's, the customer sees a mismatch at the moment of payment, and some will stop. Decide how account names appear before issuing collection accounts at scale.
- **The result is an input to fraud checks,** on payouts as much as on collections ([Fraud & Risk](/books/payments/fraud-and-risk)).

## SEPA Direct Debit

SEPA Direct Debit is Europe's ACH debit, under the European Payments Council's rulebooks and the SEPA Regulation (EU) 260/2012, which requires ISO 20022 XML for interoperability. There are two schemes: **Core** for consumers and businesses, and **B2B** for businesses only, with stronger protection for the payee.

**The mandate** carries what the regulation lists, most importantly the **unique mandate reference**, the payee's **creditor identifier**, and the sequence type (first, recurrent, one-off, final). Under B2B, the debtor's bank also checks the mandate information against each collection before debiting. Consumers can tell their bank to cap collections by amount or frequency, or block direct debits entirely, so a valid mandate isn't a promise the debit will go through.

**Timing.** The creditor tells the debtor about each collection in advance, two weeks unless a shorter period is agreed with the debtor, and submits a collection under an existing mandate to its bank one interbank business day before the due date, for Core and B2B alike. Returns from the debtor's bank, for reasons like insufficient funds or a closed account, settle within 5 interbank business days of the due date for Core and 2 for B2B.

**Refunds are the long tail.** Under Core, the payer can get an authorized collection refunded within 8 weeks of the debit, no questions asked, and an unauthorized one (no valid mandate) within 13 months. B2B removes the 8-week right: an authorized B2B collection can't be returned. So a Core collection is probably good after the return window and final for an authorized debit only after 8 weeks; size reserves and availability to that, as [Payouts & Settlement](/books/payments/payouts-and-settlement) does for every pull method.

**The files are ISO 20022.** Collections go to the bank as `pain.008` (direct debit initiation), credit transfers as `pain.001`, and the bank answers with `pain.002` status reports, and books entries you read in `camt.053` statements and `camt.054` notifications ([Bank Files](/books/payments/treasury#bank-files)). Every rejection, return, refund and reversal comes back as a message against the original's end-to-end reference, so put your own collection ID there.

## UK: Faster Payments, Bacs and CHAPS

**Faster Payments** carries real-time sterling payments of up to £1 million at the scheme level, day and night, every day of the year, though each bank sets its own lower limits. It's what UK payouts, open banking payments and person-to-person transfers run on, and it's final, apart from the fraud reimbursement below.

**Bacs** is batch, on a **three-day cycle** of English bank working days: the service user submits on day 1 (input day), Bacs processes on day 2 (processing day), and the payee is credited or the payer debited on day 3 (entry day). It carries Bacs Direct Credit (payroll, supplier payments, refunds) and Direct Debit.

- **You need a sponsor and a service user number.** An organization collecting by Direct Debit gets a service user number (SUN) through a sponsoring bank or payment provider, and most submit indirectly, through that provider or a commercial bureau. Pay.UK is retiring the paper-based variant: no new non-AUDDIS SUNs will be created after 1 July 2027, so new collections set up mandates electronically through AUDDIS.
- **The Direct Debit Guarantee** is what the payer sees and what the payee signs up to: notice of each collection's amount and date, normally 10 working days in advance unless agreed otherwise, and "a full and immediate refund" from the payer's bank if an error is made. The payer's bank refunds first and the payee finds out after. A Direct Debit is never final in the way a card payment eventually is.

**CHAPS** is the Bank of England's same-day, high-value sterling system, settled gross in its RTGS service, usually open 6am to 6pm on business days, with customer payments submitted by 5.40pm. It moved to ISO 20022 on 19 June 2023 and is adding data requirements in stages: purpose codes and legal entity identifiers for payments between financial institutions from May 2025, and purpose codes for all CHAPS payments from November 2027. The Bank has decided to open CHAPS settlement from 01:30 starting September 2027. For a provider, CHAPS is for prefunding, collateral and the occasional large payout, as Fedwire is in the US ([Moving Money Safely](/books/payments/treasury#moving-money-safely)).

## Confirmation of Payee

The UK's name check came first. **Confirmation of Payee** (CoP) is a Pay.UK service that checks the name a payer enters against the account before a payment is sent. The PSR made it mandatory in two groups, the second by 31 October 2024, for both sending checks and responding to them, and in October 2026 removed the direction's expiry date so it stays in force. More than 320 organizations offer checks, and Pay.UK reports more than 2 million a day.

Its consequences are the same as VoP's: payouts to your merchants are checked against their account names, and payers into your collection accounts see your account name. A provider that holds accounts for merchants (virtual accounts, e-money accounts) also has to respond to CoP requests about them, which means the name on each account in your ledger is data another bank queries in real time.

## APP Scam Reimbursement

An **authorized push payment** (APP) scam is a customer tricked into sending money to a fraudster themselves: a fake invoice, an impersonated bank, a romance scam. Since 7 October 2024, UK payment providers must reimburse victims of APP scams made over Faster Payments, and the Bank of England applies the same to CHAPS:

- **The sending provider reimburses** within five business days, and the **receiving provider pays it 50%.** The provider whose account received the scam payment shares the loss, whether or not it did anything wrong.
- **The maximum is £85,000** per claim on both Faster Payments and CHAPS. The sending provider may apply an excess of up to £100.
- **Claims are made within 13 months** of the final payment.
- **The exception is gross negligence,** the "consumer standard of caution", which, like the excess, can't be applied to vulnerable consumers.

The PSR's July 2026 review found reimbursement rates rose from 54% to 65% of claims and APP fraud losses fell by an estimated £73 million a year, and it announced a consultation on improving consistency before the end of 2026.

For a platform the second bullet is the one that matters. A provider whose merchants or users receive Faster Payments is a receiving provider, liable for half of any reimbursement on scam money paid into an account it holds. That makes onboarding, monitoring of incoming payments, and the speed of freezing a mule account a direct cost, which is why receiving banks now question who a platform pays out to as well ([Fraud & Risk](/books/payments/fraud-and-risk)).

## Open Banking

**PSD2** created two regulated services that let a third party reach a customer's bank account with their consent. In the UK's implementing regulations, a **payment initiation service** is "an online service to initiate a payment order at the request of the payment service user with respect to a payment account held at another payment service provider", and an **account information service** is an online service providing "consolidated information on one or more payment accounts". Pay-by-bank checkout is a payment initiation over Faster Payments or SEPA Instant; account verification at onboarding is account information.

In the UK, the largest banks were required to build standard APIs under the CMA's Order, implemented through Open Banking Limited, which the CMA declared complete in January 2023; OBL is preparing to hand over to a successor entity. UK open banking passed one billion payments in July 2026. The Data (Use and Access) Act 2025 gives the Treasury power to require providers to use prescribed interfaces, the legal footing for the next phase. **Variable recurring payments**, open banking's answer to direct debit, are covered in [Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull).

PSD2's successors, the PSD3 directive and the Payment Services Regulation, were politically agreed in November 2025 and change open banking, fraud liability and licensing. The [Payments Rulebook](/books/payments/payments-rulebook#outside-the-us) owns their status; build against PSD2 as it applies today and plan for the transition on the dates the final texts set.

## Who Regulates You

**Licensing** comes in two main kinds, the same in the EU and the UK because the UK copied the EU's: a **payment institution** (PI) and an **electronic money institution** (EMI). The initial capital depends on what you do: €125,000 for most payment services, €50,000 for payment initiation only, €20,000 for money remittance, none for account information alone (which needs professional indemnity insurance instead), and €350,000 for an e-money institution. Above certain volumes the UK requires full authorization rather than registration as a small institution ([Holding Other People's Money](/books/payments/becoming-a-payment-provider#holding-other-people-s-money) has the thresholds and the path).

**Passporting** lets an institution authorized in one EU member state serve the others. The UK left that system at the end of the Brexit transition period on 31 December 2020: EEA firms can no longer passport into the UK, the temporary permissions regime that bridged them ran to the end of 2023, and the run-off for EEA payment and e-money institutions ended on 31 December 2025. In the other direction, a UK firm serving EU customers needs its own authorization in a member state. A platform serving both markets therefore runs two regulated entities, two sets of safeguarded funds, and two sets of reporting.

**Safeguarding** is how a PI or EMI protects customers' money instead of deposit insurance, and the UK's rules got stricter in May 2026: daily reconciliation, a resolution pack, a monthly return and an annual audit ([Safeguarding Outside the US](/books/payments/treasury#safeguarding-outside-the-us)). The reconciliation itself is the one in [Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation#proving-it-to-auditors-and-sponsor-banks).

**The rest of the stack** carries over with local versions: [SCA](/books/payments/strong-customer-authentication) on customer-initiated electronic payments, [GDPR](/docs/compliance/gdpr) on personal data, sanctions lists per regime ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#sanctions-and-data-on-cross-border-flows)), and the TARGET calendar for euro payments next to the UK's bank holidays ([The Banking Calendar](/books/payments/treasury#the-banking-calendar)).

## How to Build It

The changes below extend the core `merchants`, `payments`, `payouts` and `payment_methods` tables from [How Card Payments Work](/books/payments/card-payments), alongside the US ACH tables in [ACH & Bank Transfers](/books/payments/ach).

```sql
-- SEPA and Bacs mandates, one row per mandate, never edited in place.
CREATE TABLE debit_mandates (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  scheme             TEXT NOT NULL CHECK (scheme IN ('sepa_core', 'sepa_b2b', 'bacs')),
  merchant_id        UUID NOT NULL REFERENCES merchants (id),
  payment_method_id  UUID NOT NULL REFERENCES payment_methods (id),
  mandate_reference  TEXT NOT NULL,          -- UMR for SEPA, the Bacs reference
  creditor_id        TEXT NOT NULL,          -- SEPA creditor identifier, or the Bacs SUN
  signed_at          TIMESTAMPTZ NOT NULL,
  notice_days        SMALLINT NOT NULL,      -- two weeks by default for SEPA, 10 working days for Bacs
  status             TEXT NOT NULL CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
  evidence_id        UUID NOT NULL,          -- the signed mandate document
  CONSTRAINT debit_mandates_ref_key UNIQUE (creditor_id, mandate_reference)
);

ALTER TABLE payments
  ADD COLUMN mandate_id        UUID REFERENCES debit_mandates (id),
  ADD COLUMN sequence_type     TEXT CHECK (sequence_type IN ('first', 'recurrent', 'one_off', 'final')),
  ADD COLUMN end_to_end_id     TEXT,         -- our ID, echoed on every R-message
  ADD COLUMN refundable_until  DATE,         -- 8 weeks (Core), NULL for B2B, 13 months if unauthorized
  ADD COLUMN interchange_fee   BIGINT,       -- per transaction, for the Article 12 information
  ADD COLUMN scheme_fee        BIGINT;

-- Every name check, sent or answered.
CREATE TABLE payee_checks (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  scheme             TEXT NOT NULL CHECK (scheme IN ('uk_cop', 'eu_vop')),
  direction          TEXT NOT NULL CHECK (direction IN ('sent', 'answered')),
  payout_id          UUID REFERENCES payouts (id),
  account_identifier TEXT NOT NULL,          -- IBAN, or sort code and account number
  name_checked       TEXT NOT NULL,
  result             TEXT NOT NULL CHECK (result IN ('match', 'close_match', 'no_match', 'not_possible')),
  name_returned      TEXT,                   -- the correct name on a close match
  checked_at         TIMESTAMPTZ NOT NULL
);

-- APP fraud claims, as sending or receiving provider.
CREATE TABLE app_fraud_claims (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  role               TEXT NOT NULL CHECK (role IN ('sending', 'receiving')),
  counterparty_psp   TEXT NOT NULL,
  rail               TEXT NOT NULL CHECK (rail IN ('faster_payments', 'chaps')),
  payment_refs       TEXT[] NOT NULL,        -- every payment in the scam
  claimed_amount     BIGINT NOT NULL,
  reimbursed_amount  BIGINT,
  our_share          BIGINT,                 -- 50% when receiving
  received_at        TIMESTAMPTZ NOT NULL,
  decision_due_at    TIMESTAMPTZ NOT NULL,   -- five business days, by the business calendar
  status             TEXT NOT NULL CHECK (status IN ('open', 'reimbursed', 'declined', 'stopped_clock')),
  ledger_transaction_id UUID REFERENCES ledger_transactions (id)
);
```

How it runs:

1. **A mandate before a debit,** with the notice scheduled from `notice_days` and submitted one interbank business day before the due date (SEPA) or on the Bacs input day.
2. **Availability from the scheme,** with `refundable_until` set per payment and reserves sized to it.
3. **Every payout to a new or changed account gets a name check** first, and a no-match holds the payout for review, as a changed bank account does in [Vendor Payouts](/books/payments/vendor-payouts#stopping-the-changed-bank-account).
4. **Per-transaction interchange and scheme fees** come from the processor's files and feed the merchant's statement, as the regulation requires.
5. **APP claims are cases with clocks:** the reimbursement deadline, the 50% settlement between providers, and a ledger entry for the loss.

## Auditing

European regulators and schemes expect records they can examine, and the FCA expects to be able to reconstruct who owned what. The general design is in [Audit Trails](/docs/architecture/audit-trails); specifically keep:

- **Every mandate and its evidence,** the notices sent with their dates, and each collection linked to the mandate it ran under, for as long as an unauthorized-refund claim can arrive and beyond.
- **Every name check and its result,** sent or answered, with what the payer or your staff did next.
- **APP claims:** the payments, the decision, the evidence for any exception applied, whether the customer was treated as vulnerable, and the inter-provider settlement.
- **The per-transaction fee information** given to merchants, so a merchant's question about a past month is answered from records, not recomputed.
- **Safeguarding reconciliations,** daily, with the evidence of each, kept for the auditor's annual review.

## What This Means for the System You Build

- **Interchange and scheme fees per transaction, unblended,** with the UK's domestic caps, the networks' UK-EEA rates, and the EU caps as effective-dated data.
- **No consumer card surcharges** in the EU or UK, enforced by the fee engine per country.
- **ISO 20022 throughout:** `pain.001`, `pain.008`, `pain.002`, `camt.053` and `camt.054`, with your own end-to-end ID on every message.
- **SEPA Instant and Faster Payments as payout rails,** with name checks on every new or changed account.
- **Mandates as records** for SEPA and Bacs, with notice periods scheduled, the right submission timing, and refund windows (8 weeks, 13 months, the Bacs Guarantee) in the ledger.
- **APP fraud as a receiving-provider liability,** with monitoring and fast freezing on accounts that receive push payments.
- **Two regulated entities, two safeguarding regimes,** and the PSD3 transition planned from the rulebook's status, not assumed.

## References

**Specifications**

- [Regulation (EU) 2015/751 on interchange fees, as adopted](https://www.legislation.gov.uk/eur/2015/751/adopted), the 0.2% and 0.3% caps, scope and three-party schemes, co-badging and brand choice, unblending, Honour All Cards and per-transaction information
- [Regulation (EU) No 260/2012 (SEPA Regulation), as adopted](https://www.legislation.gov.uk/eur/2012/260/adopted), mandate data, the payer's right to limit or block debits, and ISO 20022 XML
- [ECB: Instant Payments Regulation](https://www.ecb.europa.eu/paym/retail/instant_payments/html/instant_payments_regulation.en.html), the staged deadlines, equal charges and verification of payee results
- [European Commission: Instant payments implementation Q&A (PDF)](https://finance.ec.europa.eu/document/download/f597b1a5-2a7b-481d-882c-80fb1c5cc3d5_en?filename=instant-payments-implementation-questions-answers_en.pdf), the 10-second rule and payer-set limits
- [legislation.gov.uk: Payment Services Regulations 2017, regulation 2](https://www.legislation.gov.uk/uksi/2017/752/regulation/2), payment initiation and account information services defined
- [legislation.gov.uk: Payment Services Regulations 2017, regulation 86](https://www.legislation.gov.uk/uksi/2017/752/regulation/86), crediting by the end of the next business day
- [legislation.gov.uk: Payment Services Regulations 2017, regulations 79 and 80](https://www.legislation.gov.uk/uksi/2017/752/regulation/80), the 8-week unconditional direct debit refund
- [legislation.gov.uk: Payment Services Regulations 2017, regulation 74](https://www.legislation.gov.uk/uksi/2017/752/regulation/74), 13 months to notify unauthorized transactions
- [legislation.gov.uk: Payment Services Regulations 2017, Schedule 3](https://www.legislation.gov.uk/uksi/2017/752/schedule/3), payment institutions' initial capital
- [legislation.gov.uk: Payment Services Regulations 2017, regulation 18](https://www.legislation.gov.uk/uksi/2017/752/regulation/18), professional indemnity insurance for account information services
- [legislation.gov.uk: Electronic Money Regulations 2011, Schedule 2](https://www.legislation.gov.uk/uksi/2011/99/schedule/2), €350,000 initial capital for e-money institutions
- [legislation.gov.uk: Consumer Rights (Payment Surcharges) Regulations 2012, regulation 6A](https://www.legislation.gov.uk/uksi/2012/3110/regulation/6A), no surcharges on consumer cards or SEPA payments, from 13 January 2018
- [legislation.gov.uk: Data (Use and Access) Act 2025, section 14](https://www.legislation.gov.uk/ukpga/2025/18/section/14), regulations requiring prescribed interfaces
- [PSR: PS25/5, APP scams reimbursement consolidated policy statement (PDF)](https://www.psr.org.uk/media/rhelv4op/ps25-5-app-scams-reimbursement-consolidated-policy-statement-may-2025.pdf), the 50% split, five business days, £100 excess, £85,000 maximum, 13 months and the consumer standard of caution
- [PSR: Confirmation of Payee requirements under Specific Direction 17](https://www.psr.org.uk/our-work/app-scams/confirmation-of-payee/confirmation-of-payee-requirements-under-specific-direction-17/), the two groups and their deadlines
- [PSR: PS26/1, final decision on scheme and processing fees (PDF)](https://www.psr.org.uk/media/kajnh5wc/ps26-1-final-decision-itc-and-pg-jul-2026-v3.pdf), pricing governance from November 2026 and transparency from July 2027

**Reference**

- [High Court: Mastercard Europe SA v Payment Systems Regulator [2026] EWHC 64 (Admin)](https://www.judiciary.uk/wp-content/uploads/2026/01/Mastercard-Europe-SA-v-Payment-Systems-Regulator.pdf), the UK's domestic caps, the post-Brexit UK-EEA fees, and the dismissed challenge
- [PSR: Proposed cap on cross-border card fees (December 2024)](https://www.psr.org.uk/news-and-updates/latest-news/news/psr-confirms-competition-concerns-about-cross-border-card-fees-and-proposes-price-cap-to-protect-uk-businesses/), the rise from 0.2% and 0.3% and its £150 to 200 million annual cost
- [PSR: Decision not to proceed with an interim cap (MR22/2.9)](https://www.psr.org.uk/publications/market-reviews/mr2229-decision-not-to-proceed-with-interim-cap-on-cross-border-interchange-fees-statement-of-reasons/), October 2025
- [PSR: Cross-border interchange price cap factsheet, October 2025 (PDF)](https://www.psr.org.uk/media/idudyz2f/mr22-28-xbif-price-cap-factsheeet-oct-2025.pdf), the methodology consultation and the remaining steps
- [PSR: Plans for 2026/27](https://www.psr.org.uk/news-and-updates/latest-news/news/psr-to-press-ahead-on-card-fees-fraud-and-payments-reform-in-202627/), next steps on cross-border interchange
- [PSR: Card scheme and processing services market review findings (March 2025)](https://www.psr.org.uk/news-and-updates/latest-news/news/psr-finds-market-isn-t-working-well-for-card-scheme-and-processing-services/), the 25% real-terms rise and its £170 million annual cost
- [PSR: Payment fraud falls following the reimbursement scheme (July 2026)](https://www.psr.org.uk/news-and-updates/latest-news/news/payment-fraud-falls-by-73m-following-psr-reimbursement-scheme/), reimbursement rates and the consultation to come
- [PSR: PS26/2, removing the expiry date of Specific Direction 17](https://www.psr.org.uk/publications/policy-statements/ps262-specific-direction-17-confirmation-of-payee-removing-the-expiry-date/), October 2026 and more than 320 organizations offering checks
- [PSR: APP fraud reimbursement protections](https://www.psr.org.uk/information-for-consumers/app-fraud-reimbursement-protections/), payments on or after 7 October 2024
- [FCA: Roles and responsibilities in payments regulation](https://www.fca.org.uk/firms/roles-responsibilities-payments-regulation), consolidating the PSR into the FCA, no immediate change to its work
- [HM Treasury: A streamlined approach to payment systems regulation, consultation response](https://www.gov.uk/government/consultations/a-streamlined-approach-to-payment-systems-regulation-consultation/outcome/a-streamlined-approach-to-payment-systems-regulation-consultation-response), primary legislation required
- [FCA: Temporary permissions regime](https://www.fca.org.uk/brexit/temporary-permissions-regime-tpr), the end of passporting into the UK and the run-off dates
- [European Commission: Payment services](https://finance.ec.europa.eu/consumer-finance-and-payments/payment-services/payment-services_en), the November 2025 political agreement on PSD3 and the PSR
- [European Commission: New EU rules make instant euro payments faster and safer](https://finance.ec.europa.eu/news/new-eu-rules-make-instant-euro-payments-faster-and-safer-2025-10-10_en), no higher charge for instant payments
- [Deutsche Bundesbank: TIPS](https://www.bundesbank.de/en/tasks/payment-systems/tips/useful-information--937372), SCT Inst's ten-second target and 24/7/365 operation
- [Deutsche Bundesbank: SEPA Direct Debit](https://www.bundesbank.de/en/tasks/payment-systems/services/sepa/content/sepa-direct-debit-626654), the 8-week and 13-month refund rights, no return of authorized B2B debits, and mandate references
- [Pay.UK: Faster Payment System](https://www.wearepay.uk/what-we-do/payment-systems/faster-payment-system/), the £1 million limit, availability and 2025 volumes
- [Pay.UK: Bacs Payment System](https://www.wearepay.uk/what-we-do/payment-systems/bacs-payment-system/), 2025 volumes and Direct Debits
- [Pay.UK: Confirmation of Payee](https://www.wearepay.uk/what-we-do/overlay-services/confirmation-of-payee/), adoption and daily checks
- [Bacs: Glossary](https://www.bacs.co.uk/resources/glossary/), the three-day cycle of input, processing and entry days
- [Bacs: Indirect submitters](https://www.bacs.co.uk/bacs-schemes/getting-started/indirect-submitters/), submitting through a sponsoring provider or bureau
- [Bacs: No new non-AUDDIS service user numbers after 1 July 2027](https://www.bacs.co.uk/no-new-non-auddis-service-user-numbers-to-be-created-after-1-july-2027/), the retirement of paper-based setup
- [Direct Debit: The Direct Debit Guarantee](https://www.directdebit.co.uk/direct-debit-explained/direct-debit-guarantee/), 10 working days' notice and the full and immediate refund
- [Bank of England: CHAPS](https://www.bankofengland.co.uk/payments/chaps), operating hours, the 5.40pm customer cutoff and gross settlement in RTGS
- [Bank of England: RTGS future roadmap](https://www.bankofengland.co.uk/payments/rtgs-future-roadmap), CHAPS settlement from 01:30 from September 2027
- [Bank of England: ISO 20022](https://www.bankofengland.co.uk/payments/rtgs-renewal-programme/iso-20022), the June 2023 migration and the enhanced data requirements
- [Open Banking Limited: About us](https://www.openbanking.org.uk/about-us/), the CMA Order, completion of the roadmap and one billion payments

**In practice**

- [GoCardless: SEPA Direct Debit timings](https://gocardless.com/guides/sepa/timings/), two weeks' notice, submission one interbank day before collection, return windows and B2B refund rights
