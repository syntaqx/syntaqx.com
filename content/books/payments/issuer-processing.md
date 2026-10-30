+++
title = "Issuer Processing"
nav_title = "Issuer Processing"
description = "The issuer's side of a card payment: the authorization decision and its webhook, spend controls, holds and clearing, fraud, and disputes under Reg E and Z."
category = "Payments Industry"
order = 1429
part = "Issuing Cards"
tags = ["payments", "issuing", "authorization", "spend-controls", "disputes", "regulation-e"]
+++

Every chapter so far has sat on the merchant's side of the network, sending an authorization and waiting for an answer. This one sits on the other side, where the answer is made. An issuer, or the issuer processor and program manager acting for it, receives the request, decides in a few seconds whether this card may spend this amount at this merchant, places a hold, and then lives with the consequences for weeks: clearing that doesn't match the hold, settlement with the network, fraud reports, and a cardholder who says the charge wasn't theirs and has a federal regulation behind the claim.

[Card Issuing](/books/payments/card-issuing) covers who the parties are, how issuer processors and sponsor banks divide the work, program types and their economics, and the card lifecycle. This chapter is the runtime: the authorization decision in order, the real-time webhooks issuer processors expose so a program can make that decision itself, spend controls as data, the issuer's ledger from hold to settlement, issuer-side fraud, the cardholder dispute with its Regulation E and Regulation Z clocks, and the operations that keep all of it answering.

## The Authorization From the Issuer's Side

The request that left a merchant as JSON reaches the issuer as an ISO 8583 message ([ISO 8583: What's on the Wire](/books/payments/card-payments#iso-8583-what-s-on-the-wire)), usually terminated by the issuer processor, which hands the program a JSON version of it. Either way the issuer sees more kinds of message than a merchant sends:

| Message | What the issuer does with it |
| --- | --- |
| Authorization request (`0100`) | Decide, place a hold, expect clearing later (dual message) |
| Financial request (`0200`) | Decide and post at once; no clearing follows (single message, typical of PIN debit) |
| Account verification (zero amount) | Validate the card without holding money |
| Incremental authorization | Decide on an increase to an earlier estimated hold, linked to it by transaction identifier |
| Reversal (`0400`, `0420`) | Release all or part of a hold; an advice is acknowledged, not decided |
| Advice of a stand-in decision | Record what the network or processor decided on the issuer's behalf, and hold to match |
| Refund authorization | Usually approve; a credit to a closed card is the case to think about |

[Inside a Processor](/books/payments/inside-a-processor#one-authorization-end-to-end) follows one request through the acquirer's systems and the network to the issuer. From here on the issuer's clock is running: Visa answers for a US issuer that doesn't respond in time and requires US issuers, stand-in included, to average no more than 5 seconds per authorization over each calendar month.

### The Checks, in Order

The order is cheap and certain first, expensive and probabilistic last, so most declines cost almost nothing to compute and the slow steps only run on requests that could be approved:

1. **Find the card.** Map the card number or network token to a card and account. An unknown number is a hard decline.
2. **Card status.** Active, not frozen, not reported lost or stolen, cardholder not blocked. Visa requires issuers to add a card number to its Visa Account Screen immediately when the card is reported lost, stolen, compromised or closed, so the network's stand-in declines it too.
3. **Expiry,** as encoded on the card or sent by the merchant.
4. **Card verification and cryptograms.** The CVV2 for card-not-present, the chip cryptogram for card-present, the network token's cryptogram, and the 3-D Secure (3DS) authentication value. Much of this is done for the issuer: Visa's Card Verification Service validates a card verification value on the issuer's behalf, the network's token service checks the token cryptogram before swapping in the card number, and an issuer in Visa Secure must verify the CAVV, because one that neither the issuer nor Visa verifies during authorization is assumed to be valid (10.15.2.3). Visa also forbids declining solely because a CVV2 is missing on a token transaction.
5. **PIN,** when one was entered, verified by the processor's hardware security modules ([HSMs & Key Management](/books/payments/key-management#dukpt-and-pin-blocks)).
6. **Spend controls.** Merchant category, country, channel, merchant lock, amount limits ([Spend Controls](#spend-controls)).
7. **Velocity.** Counts and sums over windows, per card, account or cardholder.
8. **Funds.** Available balance for debit and prepaid, open-to-buy for credit, or a real-time funding decision ([Real-Time Decisions](#real-time-decisions-webhooks-and-jit-funding)).
9. **Fraud score.** The network's score from the request, the processor's model, the program's own model.
10. **Decide and hold.** Choose an approved amount and a response code, place the hold, answer.

The issuer processors document the same shape. Galileo (now documented under SoFi) runs its validation checks and sends its own calculated response code in the webhook as a proposal the program can accept or override. Lithic runs default security rules, its Authorization Rules and balance checks before calling a program's endpoint. Marqeta applies spend controls before forwarding a request to a program's gateway. Stripe Issuing checks the Issuing balance, card status and spending controls before it sends its real-time webhook, and declines without calling it if any fails.

**My rule:** the program's own logic runs after everything the processor can decide for certain, and its result is one of the inputs to the final step rather than a replacement for the earlier ones. A program that re-implements card status in its webhook has two sources of truth for whether a card is frozen.

### Response Codes Mean Something to the Merchant

An issuer's code is an instruction to the merchant's retry logic ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)). Visa requires the decline code that most accurately reflects the reason and sorts codes into four categories with different retry rights:

| Category | Examples | What the merchant may do |
| --- | --- | --- |
| 1: issuer will never approve | `14` invalid account number, `41` lost card, `43` stolen card, `46` closed account, `57` not permitted to cardholder, `R0` stop payment | Never resubmit for that credential |
| 2: cannot approve at this time | `51` insufficient funds, `59` suspected fraud, `61` exceeds approval amount limit, `65` exceeds frequency limit, `91` issuer or switch inoperative | Retry, up to 20 attempts in 30 days |
| 3: data quality | `54` expired card, `55` PIN incorrect, `82` bad CVV or cryptogram result, `N7` CVV2 failure | Fix the data, then retry within the same cap |
| 4: generic | Everything else, `05` do not honor among them | Retry within the cap; use only when no other code applies |

Two consequences for the issuer. A category 1 code must be sent consistently once sent, so a card the program has closed answers `46` every time, not `46` once and `05` after. And `05` is the code of last resort: a program that answers "do not honor" for a spend-control decline invites twenty retries that will all fail, where `57` stops them on the first. Approved for a partial amount is `10`.

My default is a mapping table from internal decline reasons to network codes, versioned like any rule ([Spend Controls](#spend-controls)), with the internal reason stored beside the code sent. The cardholder's support agent needs "blocked by the MCC rule on this card", not "57".

### Partial Approvals, Holds and Changing Amounts

- **Partial approval.** When the request says the terminal supports it, the issuer can approve less than requested and answer `10` with the approved amount; the merchant collects the rest another way. Visa requires issuers to participate in its Partial Authorization Service for some products and transaction types, prepaid cards in the US among them. Every issuer processor exposes it: Galileo sends `partial_supported` with the request, Lithic takes an `approved_amount`, Marqeta lets a gateway approve less when the request is `partial_approval_capable`, and Stripe lets the webhook response set `amount` when `is_amount_controllable` is true.
- **Estimated and incremental authorizations.** A hotel or car rental holds an estimate, then asks for increments under the same transaction identifier; Visa forbids an increment that covers potential damage, theft or insurance. Stripe sends each increment as another real-time request against the original authorization, and approving one extends the authorization's expiry. Declining an increment leaves the original approval standing.
- **Fuel.** A US Visa automated fuel dispenser transaction can arrive as a status check, which Visa treats as an authorization for up to $175 ($1,000 for a Visa Fleet card) or the partial amount approved, with the completion message due within 2 hours. Stripe's documentation shows the issuer's view: a $1 request, a default hold of $100, then an update with the pumped amount.
- **Reversals.** A full or partial reversal releases the hold immediately; on Stripe the surplus returns to the available balance at once. A reversal for an authorization the issuer never saw is logged and ignored, never turned into a credit.

### Stand-In and Offline

When the issuer doesn't answer, someone else does, and the issuer is liable either way. Visa's rules make the issuer responsible for any transaction approved or declined by Stand-In Processing (STIP), which uses parameters the issuer sets; [When the Issuer Doesn't Answer](/books/payments/inside-a-processor#when-the-issuer-doesn-t-answer) has the network side. Offline chip approvals at the terminal arrive later as clearing with no authorization behind them ([The Ledger for an Issuer](#the-ledger-for-an-issuer)).

The issuer's job is to make stand-in decide the way it would have: current Account Screen entries, stand-in limits per product that are tight enough to cap the damage of an outage, and the keys stand-in needs (in the US, Visa requires issuers in Visa Secure to provide their CAVV keys for stand-in). Visa's Smarter STIP lets a participating issuer set parameters that override its other STIP parameters. Every stand-in decision arrives later as an advice, which the issuer posts exactly as if it had made the decision.

## Real-Time Decisions: Webhooks and JIT Funding

An issuer processor makes most programs' decisions with rules the program configures. Programs that need their own logic, a ledger the processor doesn't hold, or funding moved only when a card is used get a synchronous hook inside the authorization: the processor calls the program's endpoint and waits. **Just-in-time (JIT) funding** is the version where the answer also moves money: the card account holds nothing, and each approval draws funds from the program's account at that moment, which lets corporate and expense card programs avoid prefunding every card.

The hook runs inside the network's clock, so each processor sets a budget and a fallback:

| | Hook | Time limit | On timeout | Retries and duplicates | Before the hook | Partial approval |
| --- | --- | --- | --- | --- | --- | --- |
| Galileo | Auth API webhook carrying Galileo's proposed response | 2 seconds from the message's timestamp | With fallback enabled, Galileo's calculated response; otherwise `51` if the program holds the ledger, `05` if Galileo does | No retry mechanism | Galileo's validation; a setting sends all transactions or only those passing its checks | `partial_amount` when the merchant supports it |
| Lithic | Auth Stream Access (ASA) | 6 seconds; responding within 3 recommended | Declined | Immediate retry on network failures and 5xx; the same request can arrive twice | Security rules, Authorization Rules, balance checks | `approved_amount` with `APPROVED` |
| Marqeta | Gateway JIT Funding | 3 seconds | Declined, or decided by Commando Mode rules when configured to engage on timeouts and errors | Not documented | Spend controls | When `partial_approval_capable` is true |
| Stripe Issuing | `issuing_authorization.request` synchronous webhook | 2 seconds | Approved or declined per the account's timeout settings, or by Autopilot (public preview) | Not documented | Issuing balance, card status, spending controls | `amount` when `is_amount_controllable` is true |

Four engineering rules follow from the table.

- **The budget is the processor's, not the network's.** Two to six seconds sounds generous until the endpoint's p99 includes a cold start, a database lock and a call to a fraud vendor. My rule is a hard internal deadline at half the processor's limit, after which the handler answers with its own pre-decided default rather than letting the processor's fallback decide ([Every Call Has a Timeout](/docs/architecture/retries-and-timeouts#every-call-has-a-timeout)).
- **The fallback is configured before it's needed.** Galileo's fallback parameter, Marqeta's Commando Mode control sets and Stripe's timeout setting all decide what happens when the program is down, and each is a risk decision: approve-on-timeout for a fleet card at a pump, decline-on-timeout for a card with a large line. Choose per product and write down why.
- **Idempotent by authorization identifier.** Lithic warns that the same request can arrive twice, so the handler keys on the processor's authorization token, stores its decision before answering, and returns the stored decision on a repeat ([Idempotency](/docs/payments/idempotency)). An increment is a new request on the same authorization, so the key is the token plus the request's sequence.
- **A late answer is a wrong ledger.** Marqeta's own example: the gateway approves and debits $100 after the timeout, Marqeta has already declined, and the program's balance is wrong until it notices and reverses. Treat the processor's after-the-fact event (Marqeta's transaction webhook with its `timed_out` flag, Stripe's `issuing_authorization.created`) as the truth and reconcile the handler's decision to it. Stripe's documentation makes the monitoring point explicitly: an authorization approved with `request_history.reason` of `webhook_timeout` or `webhook_error` means the program isn't answering, even though the cardholder noticed nothing.

The diagram puts the pieces in order: the processor's certain checks, the program's hook with its own budget, and the two fallbacks.

![The issuer's authorization decision path as six stages from left to right: the network's request (ISO 8583 or processor JSON); card checks by the processor (status, expiry, PIN, CVV and cryptograms); spend rules by the processor (MCC, country, limits, velocity); the program's auth webhook, accented (JIT funding, own rules); funds and risk by the processor (balance or line, fraud score); and the issuer's response (code, approved amount, hold). A dashed path drops from the webhook, labeled no answer in budget, to a configured fallback set before the timeout, which continues dashed to the response. A dashed path drops from the request, labeled issuer silent past the limit, to network stand-in using the issuer's parameters. Underneath, an accented span marks the webhook budget, set by the processor, and a longer span marks the whole issuer answer, inside the network's time limit.](/diagrams/pm-issuer-auth-path.svg "The program's webhook is one stage inside the issuer's answer, with its own shorter budget: 2 seconds at Galileo and Stripe, 3 at Marqeta, 6 at Lithic. Dashed paths are the fallbacks, decided in advance: the processor's when the webhook is late, the network's stand-in when the issuer is.")

## Spend Controls

Spend controls are the rules that turn a general-purpose card into a purpose-built one, and they're most of what commercial, expense and vendor-payment card programs sell. The common set:

- **Merchant category allow and block lists,** by MCC or by the processor's named categories; Stripe's `allowed_categories` blocks everything else, `blocked_categories` allows everything else.
- **Amount limits** per authorization and per interval: Stripe offers per-authorization, daily, weekly, monthly, yearly and all-time limits, optionally per category.
- **Velocity:** a count or sum over a window, per card, account or cardholder.
- **Merchant lock:** the card works only at the merchant that first used it, or at a named merchant ID (Stripe's merchant ID controls are in private preview).
- **Single-use and exact-amount cards:** one authorization, often for one amount, then closed. Payabli's single-use virtual cards for vendor payments work this way, and its multi-use ghost cards carry an expense limit, a maximum number of uses, daily count and amount limits, a per-transaction limit and optional MCC restrictions, with one active card per vendor per paypoint ([Single-Use and Multi-Use Cards](/books/payments/vendor-payouts#single-use-and-multi-use-cards)).
- **Country and channel:** allowed or blocked merchant countries, card-present or card-not-present, ATM and cash.

**Where they run decides how fast and how exact they are.** At the processor, before any webhook, they're cheap and survive the program's outages, but they're only as expressive as the processor's model. In the program's webhook they can be anything, and they're gone when the webhook is. Aggregates are the hard part: Stripe aggregates spending on a best-effort basis with up to 30 seconds of delay, so two fast authorizations can both pass a limit that only one should, and later tips or fees can push spend past a limit after the fact. My default is processor-side controls as the floor that always applies, with program logic adding to them, and limits held a little below the true ceiling where a burst of concurrent authorizations matters.

**Rules as data.** A spend control is a rule with a scope, a condition, an action and a version ([Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule)): stored as rows, evaluated in a fixed order of stages ([Stages and Ordered Rules](/docs/architecture/rules-as-data#stages-and-ordered-rules)), effective from a timestamp, and recorded on every decision it touched ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). Overlaps resolve to the most restrictive, which is Stripe's documented behavior. And rules get tested against history before they go live: Lithic lets a program backtest draft and active Authorization Rules against past transactions (conditional rules fully, velocity rules generally not), which is the pattern worth copying ([Testing Rules](/docs/architecture/rules-as-data#testing-rules)). A shadow mode that evaluates a new rule on live traffic and records what it would have done, without acting, covers what a backtest can't. The policy layer a finance team configures above these rules (cards per employee, vendor or purpose, budgets, who may change a limit) is in the Banking & Lending volume's [Virtual Cards & Spend Controls](/books/banking-and-lending/card-controls).

## The Ledger for an Issuer

An acquirer's ledger tracks money owed to merchants; an issuer's tracks money its cardholders owe or own. The difference that shapes everything is that **authorization and clearing are separate events that don't agree**, and the issuer has no say over the second one.

**A hold is a pending entry.** An approval reduces the available balance (or open-to-buy) without touching the posted balance: in the [core model](/books/payments/card-payments#the-core-data-model), a `pending` ledger transaction keyed to the authorization. Stripe models it the same way, as an `issuing_authorization_hold` balance transaction released when the authorization closes, with a separate transaction for the capture. A bank holding funds on a deposit account works the same way, against its available and ledger balances, in the Banking & Lending volume's [Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances).

**Clearing differs from authorization, routinely:**

- **Tips and over-capture.** Restaurants, ground transportation and vehicle rentals clear for more than they authorized. Stripe says plainly that over-captures can't be blocked because they're often legitimate; the remedy for an abusive one is a dispute.
- **Fuel.** The hold was an estimate; the completion carries the real amount.
- **Currency conversion.** A purchase in another currency is held at a rate on authorization day and cleared at the rate on clearing day; Stripe holds at the network's daily rate and treats the amount as not final until capture.
- **Partial and multiple clearing.** One authorization, several presentments (split shipments, airlines), each its own clearing record, with the hold shrinking by each.
- **Force posts.** Clearing with no authorization, or after a decline: in-flight purchases from terminals that were offline, chip offline approvals, merchants ignoring a decline. Stripe deducts them from the Issuing balance and lets the program dispute the illegitimate ones; they can't be refused at clearing.
- **Late clearing after expiry.** Holds expire on the issuer's schedule, and merchants can still clear afterward.
- **Refunds and their reversals,** which may or may not link to the original authorization; Stripe calls linking them "an inexact science".

Stripe's documentation states the principle under all of this: spending controls, real-time decisions and card status apply to authorizations, but captures for approved authorizations always succeed. The issuer's controls are at authorization; after that, the ledger posts what the network presents.

**Holds expire on the issuer's rules.** The network says how long a merchant may take to clear ([Five Events, Not One Payment](/books/payments/card-payments#five-events-not-one-payment)); the issuer decides how long to keep the cardholder's money held. Lithic's published schedule, as an example: 1 day for fuel pre-authorizations without a final amount, 30 days for Visa extended authorizations and Mastercard car rental pre-authorizations, 14 days for other Mastercard pre-authorizations, and 7 days for most others. Expiring a hold doesn't stop a later clearing, so expiry posts a release and a later clearing posts a new debit against the posted balance.

**Settlement with the network.** The issuer pays the network each day for what was presented, net of refunds and of the interchange it earns, through its settlement bank ([Settlement](/books/payments/inside-a-processor#settlement)). Credits have deadlines too: in the US, Visa requires an issuer to post a refund to the cardholder's account within 3 business days of settlement for credit cards and 1 business day for Visa debit cards.

**Three-way reconciliation.** Authorizations to clearing (by network transaction identifier and amount, with tolerance for the differences above), clearing to the network's settlement report (by cycle and currency), and settlement to the cash that left the settlement account ([Three Sources of Truth](/books/payments/ledger-and-reconciliation#three-sources-of-truth), [A Matching Engine](/books/payments/ledger-and-reconciliation#a-matching-engine)). The issuer-specific breaks are holds that never cleared and expired, clearing with no authorization, clearing for more than the hold beyond what the merchant category explains, and stand-in approvals the program never saw until the advice arrived ([Breaks](/books/payments/ledger-and-reconciliation#breaks)).

## Issuer-Side Fraud

Merchants score transactions they're about to send; issuers score transactions they're about to pay for. The signals overlap ([Fraud & Risk](/books/payments/fraud-and-risk)), and the issuer adds three of its own.

- **Network risk scores in the request.** Visa Advanced Authorization scores transactions in flight, and in the US Visa provides its data to all issuers and charges for it whether or not the issuer uses it; Visa says it analyzes up to 400 attributes per transaction in under a millisecond. Mastercard's Decision Intelligence scores transactions for issuers in real time, and Mastercard said in February 2024 that its generative AI version, Decision Intelligence Pro, would assess a transaction in under 50 milliseconds. Lithic includes risk scores in the ASA request; a program on any processor should ask where the network score lands in its payload and log it with every decision. [What the Networks Know](/books/payments/fraud-and-risk#what-the-networks-know) has the merchant's view of the same scores.
- **3-D Secure from the issuer's side.** The issuer runs the **Access Control Server** (ACS) that decides frictionless or challenge ([The Three Domains](/books/payments/strong-customer-authentication#the-three-domains)). Visa requires an issuer that doesn't operate its own ACS to use the Visa Consumer Authentication Service or a registered ACS provider, to include a CAVV in authentication confirmations and attempts, to keep a log of authentication requests for arbitration, and to verify the CAVV at authorization. If an issuer doesn't support Visa Secure, Visa answers for it with an attempt response and a CAVV, which shifts fraud liability to the issuer without the issuer ever deciding. The ACS's risk-based decision is the issuer's fraud model run one step earlier, so the two should share features and labels: a frictionless approval followed by a fraud claim is a training example for both.
- **Token-level signals.** A network token tells the issuer which wallet or merchant requested it, on which device, and when it was provisioned. A token provisioned an hour ago into a new device, followed by a large purchase, is a stronger signal than anything about the merchant. Token provisioning itself is an authorization-like decision ([Tokenization on the Issuer Side](/books/payments/card-issuing#tokenization-on-the-issuer-side)).

**Fraud reporting is an obligation, with a deadline.** Visa requires an issuer to report fraud activity through VisaNet upon detection, whatever the transaction's status (approved, declined or not settled), and for approved fraudulent transactions no later than 60 calendar days from the transaction date, or 30 days after a cardholder's dispute notice that arrives after that window; at least 90% of rejected reports must be resubmitted and accepted. Mastercard's equivalent is the Fraud and Loss Database ([Exceptions](/books/payments/inside-a-processor#exceptions)). These reports feed the merchants' [monitoring programs](/books/payments/disputes-and-chargebacks#monitoring-programs-the-threshold-that-ends-accounts), so they're someone else's evidence too.

**The first fraud claim closes the card.** Visa's rules make a card-absent fraud dispute invalid for a transaction approved on a credential for which the issuer had already reported fraud, and for an account number on which the issuer has initiated more than 35 disputes in the previous 120 calendar days. Stripe surfaces both as reasons it rejects dispute submissions. The operational rule: a confirmed fraud claim reissues the card in the same workflow, because every approval after the report is a loss the issuer can't recover.

## Cardholder Disputes

On the merchant side a dispute is something that happens to you ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)). On the issuer side it starts with a cardholder's claim, and two clocks begin at once: the law's, which governs what the issuer owes the cardholder, and the network's, which governs whether the issuer can recover the money from the merchant's side. They're independent. Winning the chargeback doesn't satisfy Regulation E, and losing it doesn't excuse it.

### Taking the Claim

The claim can arrive by phone, chat, app or letter, and for debit and prepaid an oral notice counts: Regulation E lets the institution require written confirmation within 10 business days of an oral notice, but the clock starts at the oral one. My rule is that intake creates the dispute record with its deadlines computed at that moment, whatever channel it came through ([Complaints and Error Resolution](/books/payments/operating-the-platform#complaints-and-error-resolution)). Visa adds its own floor: an issuer must extend to cardholders every legal protection available on any Visa card, resolve disputes the same way regardless of card type, and must not process invalid disputes.

### Debit and Prepaid: Regulation E

12 CFR 1005.11 covers errors on electronic fund transfers, debit card purchases included:

| Step | Deadline |
| --- | --- |
| Cardholder's notice | Within 60 days after the statement showing the error was sent |
| Investigate and decide | 10 business days from the notice (20 for transfers within 30 days of the account's first deposit) |
| Or provisionally credit, and investigate longer | Provisional credit within those 10 business days allows up to 45 days; 90 days for point-of-sale debit card transactions, transfers not initiated within a state, and new accounts |
| Tell the cardholder about the provisional credit | Within 2 business days of crediting |
| Report the results | Within 3 business days of finishing the investigation |
| If no error: reverse the provisional credit | Notify the date and amount, and keep honoring checks and preauthorized transfers up to that amount for 5 business days without overdraft fees |

Point-of-sale debit card purchases get the 90-day window, which is most of what a debit issuer investigates. Liability for unauthorized use is capped separately, by how quickly the cardholder reported ([Consumer Law: Regulation E](/books/payments/ach#consumer-law-regulation-e)). A bank runs the same clock on every electronic transfer to or from a deposit account, in the Banking & Lending volume's [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes).

**Prepaid accounts** follow 12 CFR 1005.18(e). An issuer that provides transaction history instead of periodic statements starts the 60-day window from when the cardholder first accesses history showing the error, or may instead accept any claim within 120 days of the transaction posting. And for prepaid accounts other than payroll and government benefit accounts, the liability limits and error resolution duties don't apply until the issuer has verified the cardholder's identity, provided it disclosed that risk; once verified, errors occurring after verification get the full treatment.

### Credit: Regulation Z

12 CFR 1026.13 covers billing errors on credit cards, including charges by someone without authority and goods not accepted or not delivered as agreed. The cardholder's notice must arrive within 60 days of the first statement showing the error; the issuer acknowledges in writing within 30 days unless it resolves first, and resolves within two complete billing cycles and never more than 90 days. Meanwhile it may not collect the disputed amount, report it as delinquent, or close the account for exercising the right. Stripe notes that Regulation Z generally caps a cardholder's liability for unauthorized use at $50, and that this protection reaches even business-purpose cards that most of Regulation Z doesn't cover. The rest of Regulation Z's hold on a card account (balance segments, interest, minimum payments, the CARD Act rules) is in the Banking & Lending volume's [Credit Cards as Credit](/books/banking-and-lending/credit-cards).

### Filing the Network Dispute

In parallel, the issuer decides whether the claim has chargeback rights and files through Visa Resolve Online or Mastercom, under the reason codes and evidence rules [Reason Codes Decide the Evidence](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence) describes from the other side. The windows are counted from the processing date: 120 calendar days for a Visa card-absent fraud dispute, for example. Issuer processors set their own earlier cutoffs; Stripe requires most Visa fraud and processing-error disputes within 110 days of the transaction and authorization disputes within 65, and a dispute can be submitted once and not amended. Any credit the merchant already issued has to be netted from the dispute amount.

**Provisional credit and the network outcome are separate ledger events.** Provisional credit is the issuer's money paid to the cardholder under the regulation; the chargeback is the issuer's attempt to recover it. If the issuer loses the chargeback and the investigation still finds an error, the cardholder keeps the credit and the issuer takes the loss. If the investigation finds no error, the provisional credit is reversed under the notice rules above regardless of how the chargeback went.

### First-Party Fraud and Compelling Evidence

Some cardholders dispute purchases they made. The merchant's tool against this is Compelling Evidence 3.0 ([Prevention Beats Winning](/books/payments/disputes-and-chargebacks#prevention-beats-winning)): prior undisputed transactions sharing device or IP and another identifier. From the issuer's seat, when an acquirer's pre-arbitration attempt carries compelling evidence, Visa requires the issuer to certify either that the contact details in the evidence don't match its cardholder's records, or that it contacted the cardholder to review the evidence and has the cardholder's explanation for continuing the dispute. That certification is a step the dispute workflow has to make someone do, with the contact recorded.

For the Regulation E or Z investigation, the issuer's own records are evidence too: the device and IP the cardholder logs in from, prior purchases at the same merchant, a token provisioned to the cardholder's own phone. A claim of unauthorized use contradicted by the issuer's own data can be resolved as no error, with the reasons explained to the cardholder as the regulations require.

## Operations

- **Authorization uptime is the product.** Visa requires members to provide authorization 24 hours a day, 7 days a week. For a program, my design goal is that the processor-side controls and the configured fallback make any outage of the program's own systems invisible to cardholders, and that the program's webhook is engineered and monitored like the payment path it is ([What Has to Be Synchronous](/books/payments/architecture-at-scale#what-has-to-be-synchronous)).
- **Stand-in parameters are reviewed, not set once.** Limits per product, Account Screen entries for every blocked card, and the processor's fallback rules, each with an owner and a review date, and checked after every incident in which they decided anything ([When a Processor, Network or Bank Is Down](/books/payments/operating-the-platform#when-a-processor-network-or-bank-is-down)).
- **Watch who decided.** The share of authorizations decided by the program, by the processor's fallback and by network stand-in, per minute. A rise in fallback decisions is an outage even when approval rates look normal.
- **Decline rates by reason, not in total.** Per internal reason and response code, per product, per merchant category: a jump in `57` after a rule change, in `51` on payday-adjacent days, in CVV failures at one merchant (card testing aimed at your BIN range). [Watching Approval Rates and Latency](/books/payments/operating-the-platform#watching-approval-rates-and-latency) has the acquirer's version; the issuer watches the same signals from the opposite side.
- **Webhook latency at p99 against the budget,** with an alert well below the processor's limit.
- **Cardholder notifications.** A push for every authorization, decline reasons the cardholder can act on ("blocked: this card only works at fuel merchants"), and a challenge for suspicious ones: Lithic's ASA accepts a `CHALLENGE` result, and Stripe's fraud challenges send an SMS so a cardholder can retry a transaction that would otherwise be blocked. A cardholder who sees a charge within seconds reports fraud before the second one.

## How to Build It

The issuer side gets its own tables rather than reusing `payments` and `payment_attempts`, which model a merchant's intent to collect. They extend the [core data model](/books/payments/card-payments#the-core-data-model)'s ledger and reference the card and account tables from [Card Issuing](/books/payments/card-issuing#how-to-build-it):

```sql
CREATE TABLE issuer_authorizations (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  card_id                UUID NOT NULL REFERENCES cards (id),
  parent_id              UUID REFERENCES issuer_authorizations (id),  -- an increment's original
  processor_reference    TEXT NOT NULL,          -- the processor's token; the webhook's idempotency key
  request_sequence       INT NOT NULL DEFAULT 0, -- 0 for the original, n for the nth increment
  network                TEXT NOT NULL,
  network_transaction_id TEXT,
  kind                   TEXT NOT NULL CHECK (kind IN ('purchase', 'verification', 'incremental',
                           'status_check', 'cash', 'refund')),
  message_class          TEXT NOT NULL CHECK (message_class IN ('dual', 'single')),
  requested_amount       BIGINT NOT NULL CHECK (requested_amount >= 0),
  approved_amount        BIGINT NOT NULL DEFAULT 0 CHECK (approved_amount >= 0),
  currency               CHAR(3) NOT NULL,       -- the card's currency
  merchant_amount        BIGINT NOT NULL,
  merchant_currency      CHAR(3) NOT NULL,
  mcc                    CHAR(4),
  merchant_network_id    TEXT,
  merchant_country       CHAR(2),
  channel                TEXT NOT NULL CHECK (channel IN ('card_present', 'card_not_present')),
  partial_supported      BOOLEAN NOT NULL DEFAULT false,
  decided_by             TEXT NOT NULL CHECK (decided_by IN ('program', 'processor',
                           'processor_fallback', 'network_stand_in')),
  response_code          TEXT NOT NULL,          -- raw network code sent
  decline_reason         TEXT,                   -- internal reason, mapped to the code
  status                 TEXT NOT NULL CHECK (status IN ('declined', 'pending', 'closed',
                           'reversed', 'expired')),
  received_at            TIMESTAMPTZ NOT NULL,
  responded_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT issuer_authorizations_processor_reference_request_sequence_key
    UNIQUE (processor_reference, request_sequence),
  CHECK (approved_amount <= requested_amount OR kind = 'status_check')
);

CREATE TABLE auth_holds (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  authorization_id      UUID NOT NULL REFERENCES issuer_authorizations (id),
  card_account_id       UUID NOT NULL REFERENCES card_accounts (id),
  amount                BIGINT NOT NULL CHECK (amount >= 0),  -- still held; shrinks with clearing and reversals
  currency              CHAR(3) NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('active', 'released')),
  expires_at            TIMESTAMPTZ NOT NULL,                 -- the issuer's own schedule, by network and MCC
  released_at           TIMESTAMPTZ,
  release_reason        TEXT CHECK (release_reason IN ('cleared', 'reversed', 'expired', 'manual')),
  ledger_transaction_id UUID NOT NULL REFERENCES ledger_transactions (id),  -- the pending entry
  CHECK ((status = 'released') = (released_at IS NOT NULL))
);

CREATE TABLE clearing_records (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  card_id                UUID NOT NULL REFERENCES cards (id),
  authorization_id       UUID REFERENCES issuer_authorizations (id),  -- null for a force post
  kind                   TEXT NOT NULL CHECK (kind IN ('capture', 'refund', 'refund_reversal')),
  amount                 BIGINT NOT NULL,          -- card currency, as presented
  currency               CHAR(3) NOT NULL,
  merchant_amount        BIGINT NOT NULL,
  merchant_currency      CHAR(3) NOT NULL,
  network                TEXT NOT NULL,
  acquirer_reference     TEXT,                     -- the ARN; disputes cite it
  network_transaction_id TEXT,
  is_final               BOOLEAN NOT NULL DEFAULT true,  -- false while more presentments may follow
  settlement_date        DATE NOT NULL,
  match_status           TEXT NOT NULL CHECK (match_status IN ('matched', 'over_hold',
                           'no_authorization', 'after_expiry')),
  ledger_transaction_id  UUID NOT NULL REFERENCES ledger_transactions (id),
  received_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT clearing_records_network_acquirer_reference_kind_key
    UNIQUE (network, acquirer_reference, kind)
);

CREATE TABLE spend_control_rules (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  rule_key       TEXT NOT NULL,                  -- stable across versions
  version        INT NOT NULL,
  scope          TEXT NOT NULL CHECK (scope IN ('program', 'card_account', 'cardholder', 'card')),
  scope_id       UUID,                           -- null for program scope
  kind           TEXT NOT NULL CHECK (kind IN ('mcc_allow', 'mcc_block', 'country_allow',
                   'country_block', 'channel_block', 'merchant_lock', 'amount_limit',
                   'velocity', 'single_use')),
  parameters     JSONB NOT NULL,                 -- codes, amounts, window, counts
  window_period  TEXT CHECK (window_period IN ('per_authorization', 'daily', 'weekly',
                   'monthly', 'yearly', 'all_time')),
  decline_code   TEXT NOT NULL,                  -- the network code this rule answers with
  mode           TEXT NOT NULL CHECK (mode IN ('active', 'shadow')),
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to   TIMESTAMPTZ,
  created_by     TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT spend_control_rules_rule_key_version_key UNIQUE (rule_key, version)
);

CREATE TABLE auth_decisions (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  authorization_id   UUID NOT NULL REFERENCES issuer_authorizations (id),
  stage              TEXT NOT NULL CHECK (stage IN ('card_checks', 'spend_controls', 'webhook',
                       'funds', 'risk', 'fallback', 'stand_in')),
  outcome            TEXT NOT NULL CHECK (outcome IN ('pass', 'decline', 'approve_partial',
                       'challenge', 'shadow_decline', 'timeout')),
  rule_ids           UUID[] NOT NULL DEFAULT '{}',  -- the exact rule versions evaluated
  inputs             JSONB NOT NULL,                -- balance, open-to-buy, velocity counters as read
  network_risk_score SMALLINT,                      -- from the request, when present
  model_score        NUMERIC(5, 4),
  model_version      TEXT,
  latency_ms         INT,
  decided_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cardholder_disputes (
  id                          UUID PRIMARY KEY DEFAULT uuidv7(),
  clearing_record_id          UUID NOT NULL REFERENCES clearing_records (id),
  card_account_id             UUID NOT NULL REFERENCES card_accounts (id),
  regime                      TEXT NOT NULL CHECK (regime IN ('reg_e', 'reg_e_prepaid',
                                'reg_e_prepaid_unverified', 'reg_z', 'network_only')),
  reason                      TEXT NOT NULL CHECK (reason IN ('unauthorized', 'not_received',
                                'not_as_described', 'incorrect_amount', 'duplicate',
                                'credit_not_processed', 'canceled', 'other')),
  amount                      BIGINT NOT NULL CHECK (amount > 0),
  currency                    CHAR(3) NOT NULL,
  notice_received_at          TIMESTAMPTZ NOT NULL,  -- oral or written; the clocks start here
  notice_channel              TEXT NOT NULL CHECK (notice_channel IN ('phone', 'chat', 'app',
                                'letter', 'email')),
  -- computed at intake from the regime and a business-day calendar, never recomputed
  written_confirmation_due_at TIMESTAMPTZ,           -- Reg E: 10 business days after an oral notice
  acknowledge_by              TIMESTAMPTZ,           -- Reg Z: 30 days
  investigate_by              TIMESTAMPTZ,           -- Reg E: 10 or 20 business days
  resolve_by                  TIMESTAMPTZ NOT NULL,  -- Reg E: 45 or 90 days; Reg Z: two cycles, at most 90 days
  provisional_credit_amount   BIGINT,
  provisional_credited_at     TIMESTAMPTZ,
  network_filing_due_at       TIMESTAMPTZ,           -- the network's window, less the processor's margin
  network_dispute_reference   TEXT,
  network_filed_at            TIMESTAMPTZ,
  network_outcome             TEXT CHECK (network_outcome IN ('won', 'lost', 'not_filed')),
  determination               TEXT CHECK (determination IN ('error', 'no_error', 'different_error',
                                'withdrawn')),
  determined_at               TIMESTAMPTZ,
  results_sent_at             TIMESTAMPTZ,           -- Reg E: within 3 business days of determination
  status                      TEXT NOT NULL CHECK (status IN ('open', 'provisionally_credited',
                                'resolved', 'withdrawn')),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (regime <> 'reg_z' OR acknowledge_by IS NOT NULL),
  CHECK (regime NOT IN ('reg_e', 'reg_e_prepaid') OR investigate_by IS NOT NULL),
  CHECK ((provisional_credited_at IS NULL) = (provisional_credit_amount IS NULL))
);
```

Notes on the shape:

- **Every hold, release, clearing and provisional credit posts a ledger transaction** keyed to its row, with `pending` for holds and `posted` for clearing ([Payment States & Ledgers](/docs/payments/payment-states#holds-that-change-size)). Available balance is posted balance minus active holds, both from the ledger.
- **`auth_decisions` has one row per stage,** so a decline can be traced to the exact rule version and the inputs it read, and a shadow rule's would-be declines are queryable beside the live ones ([Auditable Decisions](/books/payments/fraud-and-risk#auditable-decisions)).
- **Deadlines are computed once and stored** ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), from a business-day calendar that is itself versioned data. A regulation change gets new rows; existing disputes keep the deadlines they were promised.
- **Increments are rows, not updates.** The original authorization and each increment are separate `issuer_authorizations` rows sharing a `processor_reference`, so the webhook's idempotency and the decision history both fall out of the unique key.

## Auditing

An issuer program is examined by its sponsor bank, the bank's regulators and the networks, and the questions are specific.

- **Regulation E and Z deadline compliance.** For a sample of disputes: when notice was received and through which channel, each computed deadline, when each step happened, and the letters sent. Regulation E requires evidence of compliance to be kept for at least two years ([How Long to Keep What](/books/payments/operating-the-platform#how-long-to-keep-what)). The query that finds every dispute where `provisional_credited_at > investigate_by` or `determined_at > resolve_by` should return nothing, and the report that proves it runs monthly.
- **Decision records.** For any authorization: what arrived, which stage decided, the rule versions and inputs, the scores, the response code and how long it took. For any rule: who changed it, when, what it would have declined in shadow and backtest, and who approved the change.
- **Fallback and stand-in decisions,** listed separately, with the parameters in force at the time and the liability each carried.
- **Fraud reporting timeliness:** each confirmed fraud with its transaction date, report date and the network's acceptance, against the 60-day rule.
- **Sponsor bank reviews.** The bank owns the regulatory obligations and delegates the work; it will ask for complaint and dispute logs, the program's decline and fraud rates, evidence that controls in the program agreement are configured as written, and the change log for anything that alters who gets approved ([Sponsor Banks Under Scrutiny](/books/payments/card-issuing#sponsor-banks-under-scrutiny)).
- **Reconciliation:** holds expired without clearing, force posts, over-hold clearing and their dispositions, with the daily three-way match signed off ([Proving It to Auditors and Sponsor Banks](/books/payments/ledger-and-reconciliation#proving-it-to-auditors-and-sponsor-banks)).

## What This Means for the System You Build

- **The authorization path in a fixed order,** certain checks before probabilistic ones, with the program's webhook as one stage among them.
- **A webhook engineered to half the processor's budget,** idempotent by authorization and request sequence, with a fallback chosen per product and written down.
- **Response codes chosen deliberately,** from a versioned mapping of internal reasons, so merchants retry what can succeed and stop on what can't.
- **Spend controls as versioned rules,** processor-side as the floor, tested by backtest and shadow mode before they decline anyone.
- **Holds as pending ledger entries,** released on the issuer's own expiry schedule, and clearing posted as presented, including force posts.
- **Three-way reconciliation** of authorizations to clearing to settlement, with issuer-specific breaks named and owned.
- **Network scores and 3DS results logged with every decision,** and a confirmed fraud claim that reports to the network and reissues the card in one workflow.
- **Cardholder disputes with both clocks stored:** the regulation's and the network's, computed at intake from the moment the claim arrived.
- **Monitoring by who decided and why declined,** not only approval rate.

## References

**Specifications**

- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), 18 April 2026 edition: issuer liability for STIP (1.4.4.3), credit posting within 3 or 1 business days in the US (1.4.4.4), fraud reporting within 60 days or 30 after a later dispute notice and 90% resubmission (1.9.4.3), incremental authorization (5.7.2.5), fuel dispenser status checks of USD 175 or USD 1,000 for Visa Fleet and completion within 2 hours (5.7.2.6, Table 5-10), Smarter STIP (7.3.2.2), 24-hour authorization and the 5-second US monthly average (7.3.3.1), stand-in on no response (7.3.4.1), Visa Account Screen updates (7.3.5.1), no decline solely for missing CVV2 on tokens (7.3.6.1), decline code categories and the 20-attempts-in-30-days limit (7.3.6.3, Table 7-2), issuer participation in partial authorization (7.3.9.3, Table 7-4), Advanced Authorization data and fees in the US (10.12.1.1), ACS and CAVV requirements and CAVV keys for stand-in (10.15.2.2, 10.15.2.3), issuer responsibilities for cardholder disputes (11.1.2), the issuer's certification on compelling evidence (Table 11-1), invalid fraud disputes after a fraud report or more than 35 disputes in 120 days (11.7.5.3), and the 120-day card-absent fraud window (11.7.5.4)
- [12 CFR 1005.11 (CFPB)](https://www.consumerfinance.gov/rules-policy/regulations/1005/11/), Regulation E error resolution: 60-day notice, written confirmation, 10 and 20 business days, 45 and 90 days, provisional credit notices and the 5-business-day honoring period
- [12 CFR 1005.13 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1005.13), Regulation E's retention of evidence of compliance for at least two years
- [12 CFR 1005.18 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1005.18), prepaid accounts: the modified 60-day and 120-day error windows and unverified accounts (paragraph (e))
- [12 CFR 1026.13 (CFPB)](https://www.consumerfinance.gov/rules-policy/regulations/1026/13/), Regulation Z billing errors: 60-day notice, 30-day acknowledgment, two billing cycles and no more than 90 days, and the creditor's limits during resolution
- [ISO 8583 (Wikipedia)](https://en.wikipedia.org/wiki/ISO_8583), the 1987 response code table, including `10` approved for partial amount

**Reference**

- [Visa: Secure card payments](https://www.visa.com/en-us/solutions/secure-card-payments), Visa Advanced Authorization's real-time risk score, up to 400 attributes in under a millisecond, and Visa Risk Manager
- [Electronic Payments International: Mastercard deploys gen AI to enhance Decision Intelligence (February 1, 2024)](https://www.electronicpaymentsinternational.com/news/mastercard-deploys-gen-ai-to-enhance-decision-intelligence-offering), Decision Intelligence scoring 125 billion transactions a year for banks and Decision Intelligence Pro's under-50-millisecond assessment

**In practice**

- [Galileo (SoFi): Authorization Controller API](https://docs.tech.sofi.com/pro/docs/authorization-controller-api), the Auth API's 2-second limit from the message timestamp, the APIFB fallback and its `51` or `05` defaults, no retries, the proposed response and override rules, and partial authorization
- [Lithic: Auth Stream Access (ASA)](https://docs.lithic.com/docs/auth-stream-access-asa), the 6-second limit and 3-second recommendation, decline on timeout, retries and duplicate requests, checks before ASA, `approved_amount` and `CHALLENGE`
- [Lithic: Backtesting Authorization Rules](https://docs.lithic.com/docs/backtesting-authorization-rules), backtesting draft and active rules, with velocity rules generally unsupported
- [Lithic: Expiring Authorizations](https://docs.lithic.com/docs/expiring-authorizations), hold expiry windows by network and merchant category, and clearing after expiry
- [Marqeta: About Just-in-Time Funding](https://www.marqeta.com/docs/developer-guides/about-jit-funding), Managed and Gateway JIT Funding, spend controls before the gateway, partial approval, network STIP and Commando Mode
- [Marqeta: Managing Timeouts](https://www.marqeta.com/docs/developer-guides/managing-timeouts), the 3-second gateway limit, decline on timeout, the out-of-sync $100 example and the `timed_out` flag
- [Marqeta: Commando Mode](https://www.marqeta.com/docs/core-api/commando-mode), automatic and manual stand-in by business rules and the `standin_approved_by` values
- [Payabli: Manage ghost cards](https://docs.payabli.com/guides/pay-out-developer-ghost-cards-manage), multi-use vendor cards with expense, use-count, daily and per-transaction limits, MCC restrictions and one active card per vendor per paypoint
- [Stripe: Issuing real-time authorizations](https://docs.stripe.com/issuing/controls/real-time-authorizations), the 2-second limit, timeout settings and Autopilot, the response body, and monitoring `webhook_timeout` and `webhook_error`
- [Stripe: Issuing authorizations](https://docs.stripe.com/issuing/purchases/authorizations), check order before the webhook, partial and incremental authorizations, fuel status checks, partial reversals, currency conversion and authorization outcomes
- [Stripe: Issuing spending controls](https://docs.stripe.com/issuing/controls/spending-controls), control types and intervals, evaluation before the webhook, most-restrictive overlap, and up to 30 seconds of aggregation delay
- [Stripe: Issuing transactions](https://docs.stripe.com/issuing/purchases/transactions), hold and release balance transactions, over-capture, multi-capture, force capture and refund linking
- [Stripe: Issuing disputes](https://docs.stripe.com/issuing/purchases/disputes), filing windows of 110 and 65 days, single submission, rejection reasons, provisional credit under Regulation E and the $50 Regulation Z cap
