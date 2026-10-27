+++
title = "Vendor Payouts"
description = "Paying vendors and suppliers: ACH, virtual cards, push to card, checks and instant rails, enablement, stopping redirect fraud, funding, 1099s."
category = "Payments Industry"
order = 1427
part = "Paying Out"
tags = ["payments", "payouts", "accounts-payable", "fraud", "tax"]
+++

[Settlement](/books/payments/payouts-and-settlement) pays a merchant the money its own customers paid it. A vendor payout is the other direction: a business paying the people it owes, its suppliers, contractors and landlords, out of its own money. In this chapter the **payer** is that business, the one sending money to its vendors, which is the opposite seat from the payer in the card chapters; the platform is whoever runs the payables product for it. It looks like the same "send money to a bank account" problem, and the differences are where the work is. The payer chooses the recipient, so the main fraud is getting the payer to choose the wrong one. The vendor chooses how it wants to be paid, so one payable can leave by any of six methods with six different timelines and failure modes. And the payer owes the IRS a record of who got paid what.

## Bills Before Payouts

A payout starts as a **bill**: what a vendor says it's owed, entered by hand, imported, or read from an invoice. The bill has its own lifecycle before any money moves: entered, sent for approval, partially approved, then approved or rejected. Approval is where the controls live. Thresholds add approvers as amounts grow, the person who entered a bill can't approve it, and a bill to a vendor whose bank details changed recently waits for the checks in [Stopping the Changed Bank Account](#stopping-the-changed-bank-account). Only an approved bill becomes a payable, and only a payable becomes a payout, so every dollar out traces back through an approval to an invoice.

## Managed or Self-Serve

A payables product runs in one of two modes, and most of the differences in this chapter follow from which one the payer chose. Payabli sells both, and its documentation is the clearest public comparison:

| | Managed payables | On-demand payouts |
| --- | --- | --- |
| **Who enrolls vendors** | The provider's team calls each vendor and picks the method with it | The platform or payer, through its own product and the provider's tools |
| **Funding** | Good funds only, collected two to four days ahead | Good funds, or credit for virtual cards once the payer is underwritten |
| **ACH batch close** | 4:30 PM Eastern | 9:00 PM Eastern |
| **Virtual cards** | Offered first during enablement | Single-use only: one full-amount charge, expiring after 90 days |
| **Checks** | Undeposited checks canceled after 190 days | Remittance address validated when the payout is authorized |
| **Descriptors** | Provider defaults | Custom templates available |

**Managed** is outsourced accounts payable: the payer approves a bill and the provider's team does the rest, including chasing vendors, reconciling and handling exceptions, which drives more vendors onto electronic methods and gives the payer less control over timing. **Self-serve** puts timing and method in the payer's hands and makes vendor enablement the platform's job. The data model is the same either way; what changes is who works the queue of vendors without a method, and how much money must be in hand before a payout can leave.

## Enrollment and Method Choice

Vendor onboarding is a small version of [merchant onboarding](/books/payments/merchant-onboarding): collect the legal name and taxpayer ID on a W-9, the payment method and its details, and a remittance contact. Screen vendors against sanctions lists like any other payee ([The Payments Rulebook](/books/payments/payments-rulebook)).

Let vendors choose their method, with the payer able to set defaults and restrictions. Each vendor has a primary method and a fallback, and a payable records which method actually paid it. Two ways in are common:

- **A vendor link.** The payer sends a link to a hosted page where the vendor picks from the methods the payer offers (ACH, virtual card or check) and enters its details. In Payabli's version, completing the page captures the waiting payout and stores the method for next time, with micro-deposits as a fallback for verifying the bank account.
- **Outreach.** Someone calls the vendor's receivables department. Payabli's managed program calls within 36 business hours of a payout being captured and works down a fixed order: offer a virtual card first; if the vendor declines, or would charge a card fee above 1.2%, offer ACH; and if the vendor won't enroll, doesn't return the form within two days, or returns it incomplete, mail a check and try again on the next payment. ACH enrollment needs evidence of the account in the vendor's name: a voided check, a letter on the bank's letterhead or the first page of a statement, reviewed in one to three days.

The order is the economics in miniature: card first because it pays the platform ([Who Earns What](#who-earns-what)), ACH when the card would cost the vendor too much, and a check because a vendor who never answers still has to be paid. Whatever the channel, the enrollment page or call is the most valuable thing an attacker can reach, which is why any change made through it gets the controls in [Stopping the Changed Bank Account](#stopping-the-changed-bank-account).

### Finding Out How a Vendor Wants to Be Paid

Most of enablement is research: does this vendor take cards, at what fee, and who in its office answers? Payabli's vendor enrichment automates it in up to three stages: read the vendor's invoice for its contact details, payment portal and accepted methods; search the web and business directories for the same; and, when both come up short, have an AI agent call the vendor and ask. The call stage is opt-in and in beta, and its guardrails are the useful part: calls go out on business days between 9 AM and 6 PM in the vendor's time zone, retry three times by default (at most five), are skipped when the bill is due in fewer than three days, and stop at a daily cap per organization; when retries run out, the vendor gets the fallback method. Results can be written only into empty fields, or returned for a person to review first.

Two rules keep a tool like that safe. **Enrichment fills gaps; it never changes payment details.** A bank account found by a crawler or heard on a call is a new destination, and it gets the same out-of-band verification as any other change. And **every enriched field records its source** (invoice, web, call, an already-enriched vendor elsewhere on the network, or a person), so a wrong remittance address can be traced to how it got there.

## The Methods

Every method trades cost, speed and finality differently, and the vendor's preferences count as much as the payer's:

| Method | Arrives | Final when | Costs the payer | Costs the vendor |
| --- | --- | --- | --- | --- |
| **ACH credit** | Next banking day, or same day | Settled, though it can still return as undeliverable | Cents | Nothing |
| **Virtual card** | When the vendor charges it | Card settlement | Nothing; often earns a rebate | Card acceptance fees |
| **Check** | Days, through the mail | Cleared, which can take weeks | Printing, postage, handling | Depositing it |
| **Wire** | Same day | Immediately; irrevocable | Bank wire fees | Sometimes an incoming fee |
| **RTP or FedNow** | Seconds | Immediately; irrevocable | Network and bank fees | Usually nothing |
| **Push to card** | Seconds to 30 minutes | Immediately; reversible only for processing errors | Per-payout fees | Usually nothing |

![One approved payable fans out to five of its payment methods: ACH credit arrives next day and can still return; a virtual card settles when the vendor charges it and expires if unused; a check takes days and must be voided before reissue; a wire and an instant payment (RTP or FedNow) arrive the same day and are final with no return path. ACH credit, the accented branch, is the default: cheap, universal, and it carries remittance data.](/diagrams/vendor-payouts.svg "One payable, one successful disbursement. Each rail has its own timing and its own way to fail, and a new attempt starts only after the last one is definitively dead.")

My default is ACH: cheap, universal and carrying remittance data, with the mechanics in [ACH & Bank Transfers](/books/payments/ach). Virtual cards come next, where the vendor accepts them at a fee it can live with, then checks as the fallback for vendors who won't enroll, and instant rails for the payments where speed is worth paying for. Wires are for the rare large or urgent payment, and they get the strictest controls, because a wire sent to a fraudster is gone.

Instant rails changed the calculation for urgent payouts. RTP and FedNow both allow up to $10 million per payment ([ACH & Bank Transfers](/books/payments/ach#the-alternatives) has the details), but they share the wire's property that matters most here: there's no return path. The speed that pays a contractor tonight also pays an impostor tonight.

### Rails by Provider

Providers that pay vendors on a platform's behalf cover different subsets of these rails. What each documents publicly, as of October 2026:

| Provider | ACH | Virtual card | Check | Push to card | Instant or wire |
| --- | --- | --- | --- | --- | --- |
| **Adyen** | Bank transfers at `regular` or `fast` priority | Not documented | Not documented | Transfers to third-party cards | `instant` priority in the US and SEPA; `wire` |
| **BILL** | Yes, about two to five days | Single-use, no fee to the payer, expires after 20 days and is reissued as check or ACH | Printed and mailed; expires after 90 days | Not documented | Vendor-paid instant transfer to speed up a check or ACH; international wire |
| **Moov** | Standard and same-day | Not documented | Not documented | Up to $50,000 per transfer | RTP and FedNow, up to $100,000, final once sent |
| **Nuvei** | Yes | Not documented | Collection only, not payouts | Visa Direct and Mastercard Send | RTP and FedNow |
| **Payabli** | Standard and Same Day | Single-use and multi-use (ghost) cards | Mailed, with Positive Pay data | Marketed as coming soon | Wire and RTP from a prefunded balance |
| **Repay** | Same-day ACH | Single-use cards to suppliers | Not documented | Instant funding to debit and prepaid cards | Not documented |
| **Stripe** | Treasury outbound payments | Issuing cards with spending controls | Not documented | Instant Payouts to debit cards | Treasury outbound wires |

No row covers everything, and the gaps follow the business: the providers with accounts payable products (BILL, Payabli, Repay) issue cards to vendors, and the ones built around marketplaces and platform balances (Adyen, Moov, Nuvei, Stripe) lead with bank transfers and pushes to cards. Paying abroad in stablecoins is a newer rail with its own controls ([Stablecoins & Crypto Rails](/books/payments/stablecoins#payouts-to-contractors-and-sellers-abroad)).

## Virtual Cards: Who Pays for the Rebate

A virtual card for payables is a card number issued for one payment. Visa describes it as single-use, so each payment corresponds to a specific invoice, with controls on the amount, the dates it's valid and the merchant categories it can be used at. The payer gets reconciliation for free (one card, one invoice) and usually a rebate.

The rebate isn't free money. It comes out of [interchange](/books/payments/interchange-and-pricing), which the vendor pays as its card acceptance cost. That's the whole tension of card-based payables: the payer's incentive is the vendor's expense. Some vendors accept it for faster payment; some decline cards; some add a [surcharge or fee](/books/payments/surcharging-and-fees) to card payments, which can cancel the rebate. Product design follows from that:

- **Ask, don't assume.** Enrollment records whether a vendor accepts card, and at what price, with a threshold above which it's offered ACH instead (Payabli's managed program uses 1.2%). Sending a card to a vendor that runs it with a 3% fee is worse for the payer than ACH.
- **Deliver the card number like the card number it is.** It's cardholder data. Either the vendor retrieves it from a portal run by the issuer, or the issuer charges the vendor's terminal directly, and your systems hold a token, never the number ([Sensitive Data](/docs/payments/sensitive-data)). Showing card details inside your own product brings that screen into PCI scope, a cost Payabli flags for platforms that want to.
- **Charge once, for the full amount.** A single-use card is meant to be charged once for the invoice total. Payabli's on-demand cards require a full-amount charge, and in its managed program a card charged for only part of the amount can't be used again, so a partial charge leaves an open balance that needs a new payment.
- **Expire and fall back.** A card the vendor never charges is an unpaid invoice. Track issued, authorized, settled and expired, and when it expires, pay by another method rather than letting the invoice age. The windows vary: BILL's cards expire after 20 days and are reissued as a check or ACH, and Payabli's on-demand cards after 90.

### Single-Use and Multi-Use Cards

A vendor paid every month (a software subscription, a linen service, a freight carrier) can justify a standing, multi-use card instead, kept on file at the vendor and bounded by its controls. Payabli calls these **ghost cards**: one active card per vendor per merchant, in US dollars, with a required spending limit, a maximum number of uses, daily caps on the count and amount of charges, a per-charge limit, and optional merchant category restrictions; setting the card to an exact amount forces it to a single use. Corpay offers multi-use cards with limits, expiration dates, allowed vendors and usage frequency; Marqeta's supplier payments cover recurring payouts with limits by amount, merchant, category and time; and Stripe Issuing sets per-authorization and per-interval spending limits and allowed merchant categories on any card.

A standing card loses the one-card-one-invoice match, so two things change. **Every charge is a payout record,** approved or declined, which is how Payabli reports ghost card activity, so the payer sees attempts as well as payments. And **each charge is matched to an open bill** by amount and date; an unmatched charge is a question for the vendor, and a declined one usually means a limit is doing its job.

### Who Earns What

Payout methods have their own economics, and a platform that sells payables sets them per method:

- **Virtual cards pay the platform.** The vendor's processor keeps a percentage of each card payment (Payabli's example: on a $100 payment at 1%, the vendor receives $99), and part of the interchange flows back through the card program. Payabli, as program manager with the issuing bank, charges the platform nothing for virtual cards and shares that revenue with it; BILL charges payers no fee for sending virtual cards.
- **ACH and checks cost the platform,** which can pass the fee through at cost, mark it up, absorb it, or fold it into a subscription. Payabli's example is a check it charges the platform $2 for and the platform charges $4.
- **Some speed is vendor-paid.** BILL's instant transfer lets a vendor accelerate a check or ACH payment and pay the fee itself.

The card revenue is why card-first enablement is the norm, and why the vendor's acceptance fee belongs in the decision. A platform that pushes vendors onto cards they pay 3% to accept earns its share and loses the vendor's goodwill, so the threshold in enrollment is a business decision with a number, recorded per vendor. The ledger records each fee, who it was charged to and the method it priced, so the platform's margin per method is a query.

## Push to Card

A payout can also go to a debit card: Visa Direct and Mastercard Send move money onto a card as an **original credit transaction** (OCT), a card payment running backward. It reaches people who won't give you bank details but will type a card number, and it's how most "instant payout" buttons work.

- **Speed depends on the card's issuer.** Visa requires issuers to post an OCT within two business days, but issuers in its Fast Funds program must make the money available within 30 minutes, and in the US within 60 seconds for a domestic OCT. Check eligibility before promising speed: Visa's account attributes inquiry and Mastercard's account information API say whether a card can receive a push and how fast. Debit and reloadable prepaid cards are the usual targets; an OCT to a credit card posts as a payment on it.
- **It doesn't come back.** Visa forbids reversing an OCT sent as an online financial transaction, and allows other reversals only within one business day, for a wrong card, a wrong amount, a duplicate or a wrong transaction code; anything else needs the issuer's agreement. That makes it final like an instant bank payment, with the same exposure to paying an impostor, so the controls in [Stopping the Changed Bank Account](#stopping-the-changed-bank-account) apply to a changed card too.
- **The card number is cardholder data.** Collect it through your [card vault](/books/payments/card-vault) and hold a token; the payout goes out through the vault like any card payment.
- **Pulling from a card is a different transaction.** Loading a wallet or funding a transfer from a card is a Visa **account funding transaction** (AFT), flagged as such, not a purchase. The networks keep changing how those are priced and processed: from October 1, 2026, for example, Visa added a Consumer Funding Fee on AFTs in Europe (EUR 0.01 on consumer debit and prepaid cards) alongside a separate interchange program for them. A product that pulls from cards to fund payouts needs its processor's current requirements.

Providers wrap it with their own limits. Stripe's US instant payouts run from $0.50 to $9,999 per payout, at most ten a day, typically arriving within 30 minutes; Moov caps a push-to-card transfer at $50,000, adds velocity limits per card, and reports whether each card supports fast funds, standard timing or neither.

## Instant Payouts From a Prefunded Balance

A wire or an instant bank payment can't be pulled back, so it can't be paid from money that might not arrive. Providers that offer them require the money first. Payabli's wire and RTP payouts draw on a balance the merchant prefunds: deposited funds stay pending until they're confirmed through reconciliation of the custodial account, the available balance is checked when the payout is authorized, and a payout larger than the balance is rejected then, not discovered later. Once captured, the payout can't be canceled or reissued; before capture it can still be canceled. Batching groups instant payouts for reporting but doesn't delay them. Moov's instant bank credits over RTP and FedNow work the same way, from a funded wallet, and its documentation is plain that a sent transfer "is final and cannot be reversed."

The pattern for any instant rail: a **confirmed, available balance** per payer, checked inside the same transaction that reserves the amount, so two payouts can't both spend the last dollar ([A Provider's Chart of Accounts](/books/payments/ledger-and-reconciliation#a-provider-s-chart-of-accounts) has the pending and posted split this depends on). Expected funding isn't balance, and an instant payout against it is a loan with no way to collect.

## Checks Are Still Here

Many vendors still get paid by check, often because nobody ever enrolled them in anything else. Checks are slow and expensive, and they fail in ways electronic payments don't:

- **Print and mail is a vendor, and a file.** Most platforms don't print checks; they send an issue file to a print-and-mail service or their bank's outsourcing program, which prints, mails and tracks each piece (by the Postal Service's Intelligent Mail barcode) and reports back what it mailed. The check still clears against an account, so the issued-check record, the positive pay file and the mailing confirmation all have to agree. Validate the remittance address before printing: Payabli's on-demand checks validate it when the payout is authorized.
- **Positive pay.** Send the bank a file of every check issued, with number, date and amount, and the payee where the bank supports matching it. The bank flags any presented check that doesn't match, and the issuer decides whether to pay it, which stops altered and counterfeit checks; matching the payee name also catches a washed check with a new payee written in. Positive pay is the account holder's service with its bank, so a provider that prints checks drawn on the payer's own account can only supply the data: Payabli's documentation maps its payout fields (check number, date on the check, amount, payee) to the file and leaves the bank's format, the submission and the follow-up on exceptions to the payer. A check program without positive pay is relying on the forger making a mistake.
- **Voids and reissues are a two-step state change.** A lost check is stopped at the bank first, confirmed, and only then reissued. Reissuing before the stop lands is how a vendor gets paid twice. Wait long enough before calling it lost: Payabli asks for two weeks from mailing before requesting a replacement, because the mail is slow.
- **Uncashed checks need a policy, then the state's rules.** Set how long a check may stay outstanding before it's canceled and the money returned to the payer, and say so on the check program's terms: Payabli cancels a managed-payables check left undeposited for 190 days and reviews checks deposited more than 180 days after issue; BILL's checks expire after 90 days. Canceling the check doesn't end the obligation, since the vendor is still owed. After a dormancy period with no activity, unclaimed property must be turned over to the state, and uncashed checks are a classic form of it. The holder owes outreach to the payee and a report to each state on its schedule. An outstanding check is therefore a ledger state with an aging clock, not a dead record.

## Stopping the Changed Bank Account

The defining fraud in payables is business email compromise: an email, apparently from a vendor or an executive, asking to send the next payment somewhere new. The FBI's 2025 Internet Crime Report counts 24,768 BEC complaints and $3.05 billion in reported losses, second only to investment fraud. The attacker doesn't need to break anything. They only need the payer to update a bank account.

So bank detail changes are the most carefully controlled operation in the system:

- **Verify out of band.** Confirm any change of payment details by calling a contact already on file, never one supplied in the request. Email alone is never enough.
- **Validate the account.** Check that the account exists and belongs to the vendor, with an account validation service, a prenote or micro-deposits ([Validating the Account](/books/payments/ach#validating-the-account)). Nacha requires validation for consumer web debits, not for credits to vendors; do it anyway.
- **Hold the first payment.** The first payment to new details waits, or needs a second approval, and the old contact gets a notice that the details changed. A legitimate vendor shrugs at a short delay; a fraud gets caught while the money is still home.
- **Separate duties.** The person who changes vendor details can't approve payments to that vendor, and large payments need two approvers.

The ACH network now pushes the same way. Nacha's 2026 fraud monitoring rules require ODFIs and non-consumer originators to monitor their entries, credits included, for payments sent under false pretenses, which is exactly what a redirected vendor payment is. All ODFIs and the largest originators came under the rule on March 20, 2026, and everyone else on June 22, 2026 (the rule's June 19 date was a federal holiday) ([ACH & Bank Transfers](/books/payments/ach#the-rules-you-inherit)).

## Funding: Whose Money, and When

Someone has to fund a payout before it leaves, and each model moves risk somewhere different:

- **Pull, then pay** (a **good funds** model). Debit the payer's account, wait for the money to settle, then pay the vendor. The trap is timing: an ACH debit can come back as a [return](/books/payments/ach#returns-when-money-is-really-yours) after you've paid the vendor, and then you've funded the payable yourself. Wait for the return window, or limit how much you pay ahead of it based on the payer's history. In practice that means pulling days ahead of the due date: Payabli's good funds model pulls two to three days ahead, its managed program two to four, and a managed payout captured before 3:30 PM Eastern is drawn by the next business day and held two days before it's sent.
- **Pre-funded balance.** The payer funds a balance, and payouts draw it down. No timing risk, and the only safe source for instant rails (above), but you're now holding the payer's money until it's paid out.
- **Pay first, collect later** (a **credit** model). Pay the vendor now and debit the payer in parallel. That's lending, with credit risk and its own regulation, so the payer is underwritten for a credit line first; Payabli offers it only for virtual cards, through its partner banks.

Holding funds for others between payer and payee is where [money transmission](/books/payments/becoming-a-payment-provider#holding-other-people-s-money) comes in. Whether a payables product needs licenses, or fits an exemption such as acting as the payer's agent with funds in accounts its bank controls, depends on the actual flow of funds and the state. That's a question for counsel, decided before the ledger is designed, because the answer decides which accounts the money sits in.

Whatever the model, the ledger enforces one rule: never disburse more than the payer has funded and you've reserved, or, in a credit model, more than its approved line. A payable moves from **approved** to **funded** to **in transit** to **paid** (or **partially paid** when only some of it has gone), and the funding is a ledger entry, not an assumption.

Batch close times decide which day a payout funds and leaves, and they differ by program and rail: Payabli closes managed-payables ACH batches at 4:30 PM Eastern and on-demand ones at 9:00 PM. Show the payer the cutoff next to the approve button, so a bill approved at 4:45 PM isn't a surprise a day later.

## A Payout Is a State Machine

The payable is the business object; each attempt to pay it is a disbursement on one rail, with that rail's own states:

- **ACH:** submitted, settled, and possibly returned.
- **Check:** printed, mailed, cleared, stopped, stale, escheated.
- **Virtual card:** issued, authorized, settled, expired.
- **Instant and wire:** sent, then accepted or rejected, with no later return.

The payable is paid when one disbursement succeeds and stays successful, and the rules from [Payment States & Ledgers](/docs/payments/payment-states) apply: explicit transitions, terminal states that don't move, corrections as new entries.

The rule that matters most is that **a payable is paid once**. Every disbursement is created with an [idempotency key](/docs/payments/idempotency) derived from the payable and the attempt, so a retry after a timeout finds the original instead of creating a second. A new attempt on a different method is allowed only after the previous one is definitively dead: the ACH returned, the card expired unused, the check's stop confirmed by the bank. "We haven't heard back" is not dead.

### Reissuing

A **reissue** is that new attempt, and each rail sets when one is possible. Payabli's rules are a good template:

- **A virtual card** that expired unused can be reissued as a new card, ACH or a check.
- **A check** can be reissued as any method, but only after the original is stopped; the reissue call doesn't stop it.
- **ACH** can be reissued before its hold period ends, or after it returns.
- **Same Day ACH** can be canceled, not reissued, and **wires and instant payments** can be neither once they've gone.

A reissue doesn't erase the original: Payabli marks it reissued and links the two through their event histories, which is the audit trail an investigator needs. The fee is part of the rule too. Payabli always charges a replacement payout the configured fee and deducts it from what the vendor receives, so whether a reissue is free to the vendor is a pricing decision to make before the first one.

## Remittance and Reconciliation

A vendor receiving $12,480 needs to know which invoices it covers, or its accounts receivable team calls yours. Send remittance data with the payment where the rail carries it: an ACH CCD entry carries one addenda record, and a CTX entry up to 9,999, enough for a full remittance document ([ACH & Bank Transfers](/books/payments/ach#files-batches-and-sec-codes)); the receiving side is in [B2B Receivables](/books/payments/checkout-and-invoicing#b2b-receivables). Otherwise send a remittance advice by email or the portal, keyed to the payment's reference.

**Descriptors** are the remittance everyone sees. A payout has two sides on two bank statements: the debit that funds it from the payer, and the credit that reaches the vendor, and each needs text its reader recognizes. Payabli builds both from templates with placeholders, by default `Debit for {{VendorName1}} for bill(s): {{BillNumberList}}` on the payer's side and `Credit from {{PaypointDbaName}} for bill(s): {{BillNumberList}}` on the vendor's, with optional separate templates for Same Day ACH. A payer who can see which vendor and bills a debit paid doesn't call support about it, and a vendor who sees invoice numbers applies the payment without asking.

Reconciliation runs per rail against each rail's own source of truth, as [Three Sources of Truth](/books/payments/ledger-and-reconciliation#three-sources-of-truth) describes. What payables add is two more matches: each disbursement back through its payable to the approved bill, and the vendor's side, where an unapplied payment on the vendor's books usually means the remittance didn't arrive, not the money.

## Tax: W-9s, TIN Matching and 1099s

Paying vendors in the US makes the payer an information reporter, and the payment method decides which form:

- **Collect a W-9 at enrollment.** It gives you the legal name and taxpayer ID, a field classified and protected like a bank account number, masked in support tools and never logged ([Sensitive Data](/docs/payments/sensitive-data#classify-every-field)). The IRS TIN Matching service lets payers check name and TIN combinations before they file, which catches the typo now instead of as an IRS notice later.
- **Backup withholding.** If a vendor doesn't provide a correct TIN, the payer withholds 24% of payments and sends it to the IRS. The system has to support withholding as a ledger entry, not a manual adjustment.
- **1099-NEC and 1099-MISC.** Nonemployee compensation, rents and similar payments are reported by the payer. For tax years beginning after 2025, the threshold is $2,000, up from $600, and may be adjusted for inflation from 2027. Flag which vendors are reportable when they're created, not in January. Residuals and commissions paid to sales partners follow the same rules ([Paying Partners and Reporting to the IRS](/books/payments/partners-and-residuals#paying-partners-and-reporting-to-the-irs)).
- **1099-K, not 1099-NEC, for card payments.** Payments made by credit or payment card, and third-party network transactions, are reported on Form 1099-K by the payment settlement entity, and not by the payer on 1099-NEC or 1099-MISC.

That last rule means the tax totals depend on the method, so track totals per vendor, per year, per method. A vendor paid partly by ACH and partly by virtual card gets a 1099-NEC for the ACH portion only.

## How to Build It

These are deltas against [the core data model](/books/payments/card-payments#the-core-data-model). The core `payouts` table pays a merchant its own balance; payables are a different object with a different source of money, so they get their own tables, and every money movement still posts to the ledger.

```sql
CREATE TABLE vendors (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  payer_id         UUID NOT NULL REFERENCES merchants (id),  -- the business paying
  legal_name       TEXT NOT NULL,
  tin_token        TEXT,                    -- vaulted; TIN match result below
  tin_match_status TEXT,
  reports_1099     BOOLEAN NOT NULL DEFAULT false,
  primary_method   TEXT NOT NULL,           -- 'ach', 'virtual_card', 'check', 'wire', 'rtp', 'push_to_card'
  fallback_method  TEXT,
  accepts_card_fee_bps INTEGER,             -- what the vendor charges to take a card, if anything
  enrichment_status TEXT NOT NULL DEFAULT 'not_enriched',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vendor_field_sources (         -- where each enriched or entered value came from
  vendor_id   UUID NOT NULL REFERENCES vendors (id),
  field       TEXT NOT NULL,                -- 'remit_address', 'accepts_card', 'ar_contact_email', ...
  source      TEXT NOT NULL CHECK (source IN ('invoice_scan', 'web_search', 'outreach_call', 'network', 'manual', 'vendor_link')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (vendor_id, field, recorded_at)
);

CREATE TABLE vendor_payment_details (       -- append-only: a change is a new row
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor_id         UUID NOT NULL REFERENCES vendors (id),
  method            TEXT NOT NULL,
  destination_token TEXT NOT NULL,          -- vaulted bank account or card
  evidence          TEXT,                   -- 'voided_check', 'bank_letter', 'statement', 'micro_deposits'
  verified_by       TEXT,                   -- who called the contact on file
  verified_at       TIMESTAMPTZ,
  first_payment_hold_until TIMESTAMPTZ,
  superseded_at     TIMESTAMPTZ
);

CREATE TABLE vendor_cards (                 -- multi-use cards, with their controls
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor_id        UUID NOT NULL REFERENCES vendors (id),
  card_token       TEXT NOT NULL,           -- the issuer's token, never the number
  spend_limit      BIGINT NOT NULL CHECK (spend_limit > 0),
  max_uses         INTEGER NOT NULL,
  daily_count_limit INTEGER,
  daily_amount_limit BIGINT,
  per_charge_limit BIGINT,
  allowed_mccs     TEXT[],
  status           TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
  expires_on       DATE
);

CREATE UNIQUE INDEX one_active_card_per_vendor ON vendor_cards (vendor_id) WHERE status = 'active';

CREATE TABLE bills (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor_id    UUID NOT NULL REFERENCES vendors (id),
  invoice_number TEXT NOT NULL,
  amount       BIGINT NOT NULL,
  currency     CHAR(3) NOT NULL,
  due_on       DATE,
  status       TEXT NOT NULL CHECK (status IN ('entered', 'pending_approval', 'approved', 'rejected', 'funded', 'in_transit', 'partially_paid', 'paid')),
  entered_by   TEXT NOT NULL,
  UNIQUE (vendor_id, invoice_number)        -- the same invoice entered twice is caught here
);

CREATE TABLE bill_approvals (
  bill_id     UUID NOT NULL REFERENCES bills (id),
  approver    TEXT NOT NULL,
  decision    TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  decided_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (bill_id, approver)
);

CREATE TABLE disbursements (                -- one attempt on one rail
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  bill_id           UUID NOT NULL REFERENCES bills (id),
  details_id        UUID NOT NULL REFERENCES vendor_payment_details (id),
  method            TEXT NOT NULL,
  attempt           SMALLINT NOT NULL,
  reissue_of        UUID REFERENCES disbursements (id),  -- the dead attempt this one replaces
  amount            BIGINT NOT NULL,
  fee               BIGINT NOT NULL DEFAULT 0,
  fee_paid_by       TEXT NOT NULL DEFAULT 'platform' CHECK (fee_paid_by IN ('platform', 'payer', 'vendor')),
  funding_model     TEXT NOT NULL CHECK (funding_model IN ('good_funds', 'prefunded', 'credit')),
  status            TEXT NOT NULL,          -- per rail: submitted/settled/returned, issued/settled/expired, printed/mailed/cleared/stopped/escheated
  payer_descriptor  TEXT,                   -- as rendered on the funding debit
  vendor_descriptor TEXT,                   -- as rendered on the credit
  external_reference TEXT,                  -- trace number, check number, card token, end-to-end ID
  tax_form          TEXT,                   -- '1099-NEC', '1099-MISC', or NULL when the 1099-K belongs to someone else
  idempotency_key   TEXT NOT NULL UNIQUE,   -- bill and attempt
  UNIQUE (bill_id, attempt)
);

CREATE UNIQUE INDEX one_live_disbursement ON disbursements (bill_id)
  WHERE status NOT IN ('returned', 'expired', 'stopped', 'rejected', 'canceled');
```

The partial unique index is the "paid once" rule in the database: a second attempt can't be created while the first is still alive, and `reissue_of` links the new attempt to the one it replaces. The approver check (not the person who entered the bill, not the person who changed the vendor's details) runs in the approval transaction. An instant disbursement reserves its amount against the payer's available balance in the same transaction that creates it, and is refused if the balance is short. Each charge on a `vendor_cards` card becomes its own disbursement against the bill it's matched to, and 1099 totals are a sum over `disbursements` by vendor, year and `tax_form`.

## Auditing

Payables records are evidence in a business email compromise investigation, a vendor's claim it was never paid, an IRS notice and an unclaimed property audit. The general design is in [Audit Trails](/docs/architecture/audit-trails); for vendor payouts, make sure the record shows:

- **Every change of payment details,** who requested it and through what channel, who verified it out of band and how, and the hold it triggered ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Where each vendor detail came from,** including what an enrichment stage or outreach call found, and who accepted it.
- **The approval chain for each bill,** with the thresholds in force when it was approved, so separation of duties can be shown rather than asserted.
- **Every disbursement attempt and why the last one died:** the return, the expiry, the bank's stop confirmation, and the link from each reissue to the attempt it replaced.
- **Escheatment outreach:** the notices sent to the payee for each outstanding check, and the report to the state.
- **Who viewed a vendor's bank details, card or TIN,** because a fraudster's first step is often reading them ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Bills, approvals and payables as separate records,** so every payout traces to an approved invoice.
- **Vendor enablement as a workflow,** card first where the vendor's fee allows, ACH with evidence of the account, check as the fallback, and every enriched field tagged with its source.
- **One payable, one successful disbursement,** with a new attempt only after the last is definitively dead, and each reissue linked to the attempt it replaces.
- **Out-of-band verification and a first-payment hold** on any changed bank account or card.
- **Separation of duties** between entering, approving and releasing.
- **Funding recorded as a ledger entry before disbursement,** good funds, prefunded or credit, and instant rails only against a confirmed balance.
- **Multi-use cards bounded by limits,** with every charge recorded and matched to a bill.
- **Fees per method and who pays them,** so the economics of each rail are a query.
- **Positive pay, stop-before-reissue,** and outstanding checks aging toward cancellation and escheatment.
- **Remittance data on the rail** and descriptors both sides recognize, and 1099 totals per vendor, year and method.

## References

**Specifications**

- [IRS: Instructions for Forms 1099-MISC and 1099-NEC](https://www.irs.gov/instructions/i1099mec), the $2,000 threshold for tax years beginning after 2025, and card and third-party network payments reported on 1099-K instead
- [IRS: Instructions for Form 1099-K](https://www.irs.gov/instructions/i1099k), payment settlement entities and third-party network reporting

**Reference**

- [IRS: Backup Withholding](https://www.irs.gov/businesses/small-businesses-self-employed/backup-withholding), the 24% rate when a correct TIN isn't provided
- [IRS: Taxpayer Identification Number Matching](https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching), validating name and TIN before filing
- [Visa: Virtual Card for Business](https://www.visa.com/en-us/business/cards/virtual-card), single-use cards tied to an invoice, with controls on amount, time and merchant category
- [NAUPA: What Is Unclaimed Property](https://www.unclaimed.org/what-is-unclaimed-property/), dormancy periods, uncashed checks, and turning property over to the state
- [Nacha: Fraud Monitoring Phase 1](https://www.nacha.org/rules/risk-management-topics-fraud-monitoring-phase-1), monitoring credit entries for payments sent under false pretenses
- [Nacha: Fraud Monitoring Phase 2](https://www.nacha.org/rules/risk-management-topics-fraud-monitoring-phase-2), all other non-consumer originators, third parties and RDFIs from June 19, 2026, in practice June 22
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), original credit transactions, Fast Funds timing, OCT reversals and account funding transactions
- [Mastercard Send: At a glance](https://developer.mastercard.com/mastercard-send/documentation/send-at-a-glance/), funding and payment transactions and the account information API

**In practice**

- [Adyen: Transfers API](https://docs.adyen.com/api-explorer/transfers/latest/post/transfers), bank transfer priorities (`regular`, `fast`, `instant`, `wire`) and transfers to third-party cards
- [BILL: AP payment disbursement methods](https://developer.bill.com/docs/ap-payment-disbursement-methods.md), ACH, virtual cards with no fee to the payer and a 20-day expiry, checks expiring after 90 days, international payments, and vendor-paid instant transfer
- [Braintree: Fall 2026 network updates](https://developer.paypal.com/braintree/articles/risk-and-security/compliance/network-updates/fall/2026), Visa's Consumer Funding Fee on AFTs in Europe from October 1, 2026 and the AFT interchange program
- [Corpay: Virtual cards](https://corpay.com/commercial-cards/virtual-cards), single-use and multi-use cards for vendor payments, with limits, expiration dates, allowed vendors and usage frequency
- [FBI: 2025 Internet Crime Report (PDF)](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf), 24,768 business email compromise complaints and $3.05 billion in reported losses
- [Lob: Tracking your mail](https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail), print-and-mail tracking events by Intelligent Mail barcode
- [Marqeta: Supplier payments](https://www.marqeta.com/payment-solutions/supplier-payments), virtual cards for one-time and recurring payouts with controls by amount, merchant, category and time
- [Moov: Push to card](https://docs.moov.io/guides/money-movement/send-payments/push-to-card/index.md), the $50,000 per-transfer limit, velocity limits and card eligibility for fast funds
- [Moov: Instant payments](https://docs.moov.io/guides/money-movement/send-payments/instant-payments/index.md), instant bank credits over RTP and FedNow up to $100,000, final once sent
- [Moov: Payout fees](https://docs.moov.io/guides/money-movement/send-payments/payout-fees/index.md), standard and same-day ACH payouts and which side pays the fee
- [Nuvei: Payout solutions](https://www.nuvei.com/payout-solutions), ACH, RTP and FedNow, Visa Direct and Mastercard Send
- [Payabli: Understanding payables](https://docs.payabli.com/guides/pay-out-payables-overview), managed payables and on-demand payouts compared, good funds and credit models, batch close times, check cancellation at 190 days, and virtual card, ACH and check economics
- [Payabli: Understanding managed payables](https://docs.payabli.com/guides/pay-out-managed-payables-overview), the enablement call within 36 business hours, card first with ACH above a 1.2% vendor fee, ACH enrollment evidence, the check fallback, the 3:30 PM cutoff and two-day hold, and undeposited checks
- [Payabli: Cards overview](https://docs.payabli.com/guides/pay-out-cards-overview), single-use virtual cards and multi-use ghost cards
- [Payabli: Manage ghost cards](https://docs.payabli.com/guides/pay-out-developer-ghost-cards-manage), one active card per vendor, spending, use, daily and per-charge limits, and every charge recorded as a payout
- [Payabli: Send instant payouts](https://docs.payabli.com/guides/pay-out-developer-instant-payouts), wire and RTP from a prefunded balance, checked at authorization and irrevocable after capture
- [Payabli: Reissue payouts](https://docs.payabli.com/guides/pay-out-developer-payouts-reissue), which methods can be reissued as which, linked event histories, and the fee on a replacement
- [Payabli: Vendor links](https://docs.payabli.com/guides/pay-out-developer-payment-links-manage), the hosted page where a vendor picks its method, captures the payout and stores the method
- [Payabli: Vendor enrichment](https://docs.payabli.com/guides/pay-out-vendor-enrichment-overview), invoice scan, web search and AI outreach calls, calling hours, retries, the due-date skip, the daily cap and the source of each result
- [Payabli: Payment descriptors](https://docs.payabli.com/guides/pay-out-payment-descriptors-overview), funding and vendor descriptor templates, placeholders and Same Day ACH descriptors
- [Payabli: Integrate Positive Pay](https://docs.payabli.com/guides/pay-out-checks-positive-pay), the payout fields that feed a positive pay file and what the payer owns
- [Repay: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1720592/000119312526098518/rpay-20251231.htm), same-day ACH, single-use virtual cards to suppliers and instant funding to debit and prepaid cards
- [Stripe: Instant Payouts](https://docs.stripe.com/payouts/instant-payouts), limits and timing for payouts to debit cards
- [Stripe: Issuing spending controls](https://docs.stripe.com/issuing/controls/spending-controls), per-authorization and per-interval spending limits and allowed or blocked merchant categories on a card
- [Stripe: Outbound payments](https://docs.stripe.com/treasury/moving-money/financial-accounts/out-of/outbound-payments), ACH and wire payments from a Treasury financial account
