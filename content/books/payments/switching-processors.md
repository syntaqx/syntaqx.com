+++
title = "Switching Processors"
description = "Moving to a new processor: contracts, card and bank mandate migration, network tokens, recurring and dunning state, cohort cutover, declines and an exit plan."
category = "Payments Industry"
order = 1428
part = "Running a Provider"
aliases = []
tags = ["payments", "migration", "processors", "tokens", "cutover", "data-portability"]
+++

[Processor Routing](/books/payments/processor-routing) is about running two processors at once; this chapter is about leaving one. A merchant, a platform or a payment provider that switches processors is moving the one asset it can't recreate: the customers' stored credentials, and the permission to charge them. The card numbers live in the old processor's vault, the network tokens may belong to the old processor's token requestor ID, the ACH authorizations name someone, the subscriptions have billing anchors and retry counters, and every issuer has learned to trust the old merchant ID. None of that moves by API. It moves by an encrypted file between two PCI-compliant companies, on a timeline the old processor partly controls, followed by weeks of watching declines.

The generic patterns for replacing a live system (transitional architecture, dark launches, canary cohorts, rollback windows) are in [Replacing Systems](/docs/architecture/replacing-systems). What payments adds is the credential transfer itself, the network rules around it, the money that keeps moving through both processors during the overlap, and an exit plan written before the contract is signed. The same procedure serves a software platform moving its merchants' cards, which is why [Switching Platforms](/books/field-operations/switching-platforms) in the Field Operations volume points here.

## Why Merchants and Providers Switch

- **Price.** The processor's markup, a blended rate that was fine at a smaller volume, or fees that appeared after signing ([Interchange & Pricing](/books/payments/interchange-and-pricing)).
- **Approval rates and coverage.** A processor without local acquiring in a new market, a missing payment method, or approval rates that lag in a segment that matters ([Payments Metrics](/books/payments/payments-metrics#acceptance)).
- **Moving up the ladder.** A software platform that outgrows referral or managed payfac and becomes a facilitator itself, or a provider adding its own processing ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#the-realistic-path)).
- **The processor changed.** An acquisition, a new risk policy, a product sunset, or a processor that terminates the merchant ([The Payments Landscape](/books/payments/payments-landscape#recent-moves-as-of-october-2026)).
- **Consolidation.** Two acquired businesses on two processors, or a platform with merchants scattered across several, moving onto one.

Only the last two are forced, and the forced ones are the most dangerous, because the timeline belongs to someone else. That's the argument for the exit plan at the end of this chapter: a migration you rehearsed is a project; one you didn't is an incident.

## Read the Contract First

The contract decides how expensive leaving is, and the terms that matter are rarely on the pricing page.

- **Term and termination fees.** Merchant processing agreements commonly run for a fixed term with a fee for leaving early, and the FTC has acted when that fee was hidden. In July 2022 it settled with First American Payment Systems for $4.9 million, alleging that salespeople promised no cancellation fee while the contract carried a three-year term and a $495 cancellation fee, and that withdrawals continued after merchants revoked consent; the order requires an easy-to-find cancellation procedure. Know your term, your notice period, whether renewal is automatic, and the fee formula.
- **Equipment.** Leased terminals often carry their own lease, separate from the processing agreement, with its own term.
- **Data release.** Stripe's import guide notes that a previous processor "might be contractually obligated to release your data on request," and that processors "differ in how they handle export requests: some charge a fee, and some require specific forms." The clause you want says the processor will export stored card data and network transaction IDs to a PCI DSS compliant recipient on request, within a stated time, at a stated price.
- **Limits on exports.** Braintree allows a maximum of two exports (and two imports), so a bulk transfer plus one cutover delta; plan the migration around that count.
- **Reserves and the dispute tail.** The old processor will keep a reserve against refunds and disputes on what it processed, and release it on its own schedule. The release terms decide how much cash is locked during the switch ([Payouts & Settlement](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)).
- **No extra data agreements unless required.** Stripe says no separate Data Transfer Agreement is needed for an import, and that a previous processor insisting on one "significantly lengthens the migration timeline."

## How the Platforms Do It

Every large processor publishes an import procedure, and they agree more than they differ: the old processor encrypts a file to the new processor's key and uploads it to a server the new processor runs, the new processor validates and imports it, and returns a file mapping old references to new ones.

| Processor | Transfer | What comes back | Stated time and cost | Notable limits |
| --- | --- | --- | --- | --- |
| **Stripe** (import) | Previous processor encrypts with Stripe's PGP key (RSA 4096) and uploads to a dedicated SFTP server per migration | Validation summary for the merchant to approve, then a mapping file (CSV or JSON) | Old processor's export "a few days to several months"; import "typically within 10 business days" | No CVC, subscriptions or invoices; Apple Pay device numbers on request, other wallet cards not |
| **Stripe** (export) | Encrypted JSON to a PCI DSS Level 1 processor, to a 4,096-bit or larger PGP key hosted on a domain in the recipient's AOC or Visa registry listing | Cards, emails and metadata | Not stated | No payment history, subscriptions or other objects |
| **Adyen** (import) | Previous provider encrypts with Adyen's PGP key; CSV of up to 1,000,000 lines or 1 GB | An output file with a `recurringDetailReference` per stored contract | "Usually takes 10 days or more"; Adyen doesn't charge | Missing Visa transaction IDs "might result in soft declines and non-compliance assessment fees" |
| **Braintree** (import and export) | Encrypted SFTP; exports as GPG-encrypted CSV over SFTP, SCP or FTP over SSL, to a provider with an attestation of PCI compliance | A log file mapping customer IDs to payment method tokens | Timeline after intake; no fee for migrations | Two imports and two exports at most; no subscriptions or transactions |
| **Checkout.com** (import) | Usually SFTP hosted by Checkout.com; files encrypted with its PGP key | A file mapping old tokens to new ones | "A minimum of 14 business days" | Scheme transaction ID required for merchant-initiated use, and Mastercard's Trace Link ID from October 23, 2026 |

Read the table for what it implies. **The transfer is processor to processor;** no procedure lets the merchant or the platform hold the card file, which is what keeps them out of PCI scope during the move. **Only credentials move:** no processor exports payment history, subscriptions or invoices, so those come from your own records. And **the network transaction ID is now a required field,** not an optional one, because without it the new processor can't prove that a merchant-initiated charge belongs to an agreement the cardholder made ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#the-first-transaction-carries-the-rest)).

## Moving Card Numbers

The procedure, in the order it runs:

1. **Request the export first.** The old processor's export is the long pole, from days to months, so file the request the day the decision is made, and ask for the field list (card number, expiry, cardholder name, billing address, customer reference, network transaction ID, and Mastercard's Trace Link ID where Checkout.com's requirement applies).
2. **Agree the customer reference.** Adyen's guide starts here: pick the internal reference each stored card will carry on the new processor (its `shopperReference`) and confirm the old provider can map to it. Use your own customer ID, not the old processor's, so the mapping file joins straight to your records.
3. **Transfer under the receiver's key.** The recipient publishes a PGP key; the sender encrypts to it and uploads to the recipient's SFTP server. PCI DSS requires strong cryptography for card numbers sent over open, public networks (requirement 4.2.1), and the encrypted file is how both sides meet it.
4. **No card security codes.** PCI DSS forbids keeping sensitive authentication data after authorization, the card verification code included (3.3.1 and 3.3.1.2), and the PCI SSC's FAQ says the code isn't needed for card-on-file or recurring transactions and storing it for them is prohibited. A migrated card is charged without it; Stripe's guide says the same.
5. **Validate before import.** Stripe sends a validation summary and may ask the merchant to confirm the last four digits for two customer IDs, then imports only on explicit approval. Do the same on your side: counts by brand and expiry year against your own records of who has a card on file, before anything is imported.
6. **Decide about expired cards.** Processor files often contain them. Stripe lets you import or skip them and runs its card account updater on what it imports, possibly for a fee per updated card; its adoption guide recommends running account updates with the existing provider before migrating, so the file is as fresh as possible.
7. **Load the mapping file.** The new processor returns old reference, new reference, and enough of the card (brand, last four, expiry) to verify. Your platform updates each payment method from it, and keeps the old reference in a crosswalk (below), never overwritten.
8. **Run a delta at cutover.** Cards saved on the old processor after the bulk export need a second, smaller transfer at cutover. Braintree's limit of two imports is exactly that: a bulk and a cutover file.

**Wallets.** Device tokens are their own case. Stripe can migrate Apple Pay device numbers on request, given the device number, expiry and network transaction ID, and can't migrate other wallet cards such as Google Pay; Braintree's imports accept Google Pay device numbers but its exports exclude Apple Pay and Google Pay. Expect to ask some wallet customers to add the wallet again.

## Network Tokens and Account Updater After the Move

A network token belongs to a **token requestor**, the party registered with the network's token service ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#keeping-the-card-alive)). Who that was decides whether tokens move.

- **If the old processor was the requestor,** the tokens are its, and the new processor provisions fresh tokens from the migrated card numbers. Adyen's documentation makes the rule explicit for its own forwarding feature: "To forward network tokens, you must create a token with Adyen for the same payment details."
- **If you (or your independent vault) were the requestor,** the tokens can follow you. IXOPAY's guidance says network tokens "can be seamlessly transitioned" between token service providers given the business's token requestor IDs; PCI Proxy's says a network token "can follow the customer to a new acquirer" but the receiving provider "has to be a certified Token Requestor with that scheme," and re-linking takes time measured in weeks.

**Account updater enrollment is per merchant ID.** Visa enrolls merchants in Visa Account Updater through their acquirers ("acquirers can only enroll merchants who have been individually evaluated and qualified by Visa"), and Mastercard's Automatic Billing Updater registers merchants and sub-merchants by the merchant ID in the authorization message. A new processor means a new merchant ID, so updater coverage starts over on the new side; enroll before the first recurring run, not after the first wave of expiry declines. Adyen's real-time account updater, for example, has to be enabled by its support team and runs only on refused merchant-initiated payments without a CVC.

The practical sequence: run a last updater pass on the old processor, export, import, provision network tokens on the new side (or transfer your requestor IDs), enroll the new merchant IDs in both networks' updaters, and only then move recurring volume.

## Bank Mandates

ACH debits move differently, because the asset isn't only the account number; it's the customer's authorization to debit it.

- **The authorization names the originator.** Nacha's guidance on authorizations uses language such as "I authorize Company A to debit my account," naming the company (the originator), and requires the originator to keep it for two years after it terminates or is revoked ([ACH & Bank Transfers](/books/payments/ach)). An authorization that names your business, not your processor, is the one that survives a change of processor.
- **The receiving processor relies on your mandates.** Stripe's import asks the merchant to confirm it holds mandates for the bank accounts it imports, says the merchant "as the Originator" is "solely responsible for collecting and retaining ACH Debit authorizations," and that where they don't meet the Nacha rules "you must collect new authorizations." When accounts are imported as payment methods with email addresses, Stripe emails customers to confirm the mandate.
- **Some processors write themselves into the mandate.** Braintree's migration overview says that for ACH "the customer enters an explicit agreement to be charged only by that processor." Read the authorization text your customers agreed to before assuming it moves.
- **Other schemes differ.** SEPA imports to Stripe keep the same mandate reference and customers "don't need to give permission again"; Bacs needs a bulk change process with sponsor bank approval and takes weeks. Canadian pre-authorized debits have their own agreement rules ([Payments in Canada](/books/payments/canada#pre-authorized-debits-rule-h1)).

Migrate the signed authorization with the account, as a document linked to the payment method, with its text version and acceptance evidence ([Electronic Signatures](/docs/compliance/electronic-signatures)).

## Recurring Schedules and Dunning State

No processor exports subscriptions, so recurring billing moves from your own records. Two rules decide whether customers notice.

**Keep the billing anchor.** Stripe's subscription migration guide says a customer with six months left on a yearly subscription must keep that term, with `billing_cycle_anchor` and `start_date` reflecting it; its toolkit says to "cancel old subscriptions before they charge so you don't double-bill," and if a billing date is close, to "schedule the new Stripe subscription to start after the last charge from the old subscription." The same rule holds on any processor: an imported subscription carries its original start date, current period, next billing date and price version ([Periods and Anchors](/docs/payments/subscriptions#periods-and-anchors)), and starts in the future so it can be reviewed before it bills.

**Carry the dunning state.** A subscription in the middle of dunning has a history the new processor doesn't know:

- **Retry counts belong to the card,** and the networks count them. Visa limits reattempts per card over 30 days and Mastercard charges for excessive retries ([Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying)), so a card retried three times on the old processor is not a fresh card on the new one. Persist attempts per credential, across processors.
- **Stop codes carry over.** A Mastercard merchant advice code `03` ("do not try again") or `21` (payment cancellation) received on the old processor still applies; a credential revoked there is revoked everywhere.
- **Grace periods and service state carry over.** A customer in a grace period keeps its end date; a suspended account doesn't reactivate because its subscription was re-created ([Dunning](/docs/payments/subscriptions#dunning)).

Never let both processors bill the same subscription. The rule is mechanical: one system owns each subscription at a time, recorded as data, and the cutover flips ownership in one transaction.

## Dual-Running and Cutover by Cohort

Both Stripe and Adyen describe running the processors side by side. Adyen's guide has three stages: send new sign-ups and new stored cards to the new processor while the old one keeps charging existing customers, import the old processor's export, then move existing customers' recurring charges. Stripe's says "you can start accepting and charging new customers on Stripe while continuing to charge existing customers through your current processor."

The routing rule during the overlap: **each credential is charged by the processor that holds it.** A card saved before the export is charged on the old processor until its cohort cuts over; a card saved after cutover begins exists only on the new one. Captures, refunds and disputes follow the processor of the original payment, as in [Processor Routing](/books/payments/processor-routing#what-it-costs), so the old integration stays alive, refund-only, until the dispute tail of its last payment has closed.

The order in which volume moves matters because issuers don't know the new merchant ID. Stripe's import guide recommends "ramping up your volume rather than switching everything at once," sending "one-time and customer-initiated payments before recurring ones, and domestic before international." Its adoption guide is more specific: ramp from 1% to 10% of volume over the first four weeks, then about 5% a week, reaching full volume over about six months, with performance typically stabilizing in the first six weeks. My cohort order follows from that:

1. **New customer-initiated payments,** domestic first. They carry the CVC and often 3-D Secure, which gives issuers the most signal about the new merchant ID.
2. **Existing customers paying on-session,** with migrated cards.
3. **Recurring and other merchant-initiated charges,** smallest cohort first, each with its network transaction ID, after the updater is enrolled.
4. **International and high-value cohorts** last.

Each cohort follows the phases in [Replacing Systems](/docs/architecture/replacing-systems): load, compare, cut over with a rollback window, retire. The rollback path for payments is narrow: you can route new attempts back to the old processor while it still holds the card, but a payment authorized on the new processor is captured, refunded and disputed there.

## Watching Declines After Cutover

A new merchant ID declines more at first, and ramping volume while issuers learn it is what the industry calls **MID warming**. The job is to tell that expected bump from a real problem.

- **Expect it.** Stripe lists the codes the bump shows up as: `generic_decline`, `do_not_honor`, `transaction_not_allowed` and `try_again_later`. The Merchant Risk Council describes issuer rules disrupted when "there's no chargeback performance history," with a rise in security and do-not-honor declines "for the first 90 to 120 days," and recommends having the provider tell issuers about the new processing relationship.
- **Baseline before you leave.** Stripe recommends keeping one to two years of authorization-rate data from the old processor. Compare each cohort with its own history on the old processor, sliced by brand, issuer or BIN range, card type, country and initiation type, since a platform-wide average hides a single issuer declining everything ([Payments Metrics](/books/payments/payments-metrics#acceptance)).
- **Separate data problems from trust problems.** A rise in `incorrect_number`, expired-card or invalid-transaction declines means the migration lost or garbled data (a missing network transaction ID, a stale expiry); a rise in generic declines that fades over weeks is the new merchant ID earning trust. The first is a bug to fix before the next cohort; the second is a ramp to slow.
- **Watch duplicate-charge signals.** Refunds for duplicate charges and "why was I charged" contacts in the first billing cycle after each cohort's cutover are the post-cutover signals that two systems billed one customer.

Set a stop rule before each cohort: if its authorization rate falls more than an agreed margin below its baseline for a set number of days, pause the next cohort and investigate.

## Reconciling the Overlap

For weeks or months, money moves through both processors, and the ledger has to explain all of it ([Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger)).

- **Two settlement files, one ledger.** Each processor's payouts and fees import as ledger entries attributed to their route, reconciled daily, as in [One Ledger, Many Settlement Files](/books/payments/processor-routing#one-ledger-many-settlement-files).
- **Refunds and disputes on the old route.** A refund for a payment taken before cutover goes back through the old processor; a dispute arrives there too. Keep the old integration's credentials, webhooks and dispute workflow alive until the longest dispute window on its last payment has passed.
- **The reserve release.** Track the old processor's reserve as a receivable, with its release schedule from the contract, until it lands.
- **The last invoice.** The old processor's final fee invoice, including any termination fee, reconciles against what the ledger expected.
- **Counts that must match.** Cards on file before and after, by customer: every customer with a default payment method on the old side has one on the new side, with matching brand, last four and expiry, or a recorded reason why not.

## The Exit Plan

Every processor contract should come with an exit plan written at signing, because the moment you need one is the moment you have least leverage. It covers:

- **The clauses:** export on request to a PCI-compliant recipient, network transaction IDs included, a stated timeline and price, no automatic renewal you can't escape, and the reserve release schedule.
- **The identifiers:** your own customer and payment method IDs used as the processor's references, so a mapping file joins to your records directly.
- **The tokens:** a vault you control or an export right for the cards, and network tokens under a requestor ID you control where you can ([Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are), [Running a Card Vault](/books/payments/card-vault)).
- **The evidence:** network transaction IDs, consent records and mandate text stored on your side for every stored credential ([The Credential Record](/books/payments/stored-credentials#the-credential-record)), so nothing that proves an agreement exists only at the processor.
- **The schedules:** subscriptions, retry counts and dunning state in your own database, never only in the processor's billing product.
- **A rehearsal:** an annual test export of a small sample to a staging recipient, if the processor will do it, or at least a dry run of your import and crosswalk code.

If you are the provider, the same plan is a product feature. A merchant that knows it can leave with its cards is easier to sign, and the large processors above already export to PCI-compliant recipients on request; [Offboarding a Merchant](/books/payments/operating-the-platform#offboarding-a-merchant) covers the outbound side.

## How to Build It

The [core data model](/books/payments/card-payments#the-core-data-model) has payment methods, payments and their attempts, and [Stored Cards & Recurring Billing](/books/payments/stored-credentials#how-to-build-it) adds the agreement behind each stored method (with its initial network transaction ID) and the token requestor. A migration adds a crosswalk from each processor's references to yours, the batch that created each link, the processor that holds each credential, and the cohort that decides who charges it. The crosswalk follows the general shape in [Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids):

```sql
CREATE TABLE migration_batches (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  source          TEXT NOT NULL,        -- 'old-processor'
  target          TEXT NOT NULL,        -- 'new-processor'
  kind            TEXT NOT NULL,        -- bulk | delta
  file_sha256     TEXT NOT NULL,        -- checksum of the mapping file received
  record_count    INTEGER NOT NULL,
  approved_by     UUID NOT NULL,        -- who approved the import
  approved_at     TIMESTAMPTZ NOT NULL,
  imported_at     TIMESTAMPTZ
);

CREATE TABLE payment_method_external_ids (
  payment_method_id UUID NOT NULL REFERENCES payment_methods (id),
  processor         TEXT NOT NULL,
  external_id       TEXT NOT NULL,      -- the processor's token or reference, as written
  batch_id          UUID REFERENCES migration_batches (id),
  linked_at         TIMESTAMPTZ NOT NULL,
  unlinked_at       TIMESTAMPTZ,
  PRIMARY KEY (processor, external_id, linked_at)
);

-- Which processor charges a credential, and since when
ALTER TABLE payment_methods
  ADD COLUMN charging_processor TEXT NOT NULL,
  ADD COLUMN charging_since     TIMESTAMPTZ NOT NULL,
  ADD COLUMN cohort             TEXT;          -- migration cohort, null once settled

-- Retry attempts belong to the card, across processors
CREATE INDEX payment_attempts_payment_method_id_requested_at_idx
  ON payment_attempts (payment_method_id, requested_at);
```

- **`charging_processor` is the switch.** The renewal job and checkout read it to choose a route; a cohort's cutover is one update to it, logged, with the rollback being the reverse update while the old processor still holds the card.
- **Old references are kept, not overwritten.** A dispute on a pre-cutover payment arrives with the old processor's references; the crosswalk resolves it.
- **Retry counters read `payment_attempts` by payment method across processors** (with the `merchant_advice_code` [Processor Routing](/books/payments/processor-routing#how-to-build-it) adds), so a cutover never resets them below the network limits.
- **Payments record their processor,** as they already must for routing; captures, refunds and disputes follow it.

## Auditing

A migration rewrites who can charge every customer at once, so it's the event most likely to be questioned later: a disputed renewal the month of the switch, a sponsor bank's review, a customer charged twice.

- **The batch record.** Each transfer's batch: who requested and approved it, the file checksum, counts received, imported and rejected, and the rejected rows with reasons. Card data itself never lands in your systems; the mapping file does.
- **The approvals.** Who approved each cohort's cutover, with the reconciliation that justified it, and who paused one and why.
- **The routing change.** Every change to `charging_processor`, by cohort, with actor and time, so "which processor charged this customer on March 3" is a query.
- **The mandate trail.** For each migrated bank account, the authorization text and acceptance evidence, and any re-confirmation sent during migration.
- **The old processor's records, exported before access ends.** Transaction history, dispute history and reports the new processor will never have, archived for the longest retention period that applies ([How Long to Keep What](/books/payments/operating-the-platform#how-long-to-keep-what)).

The audit record itself is in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **An exit plan at signing:** export clause, network transaction IDs, timeline and price, reserve release, and your own IDs as the processor's references.
- **Credential evidence on your side:** network transaction IDs, consent and mandate text for every stored credential.
- **A crosswalk per processor,** with the batch that created each link, and old references never overwritten.
- **A charging processor per credential,** switched by cohort, with captures, refunds and disputes following the original payment.
- **Network tokens re-provisioned or transferred,** and account updater enrolled for the new merchant IDs before recurring volume moves.
- **Subscriptions and dunning state carried over,** with billing anchors kept and retry counts persisted per card across processors.
- **Volume ramped by cohort,** customer-initiated and domestic first, recurring and international last, with stop rules against each cohort's own baseline.
- **Both processors reconciled into one ledger** until the old one's dispute tail and reserve are closed.

## References

**Specifications**

- [PCI SSC: SAQ D for Service Providers v4.0.1 (PDF, state treasurer's copy)](https://treasurer.nebraska.gov/tm/pci-dss/documents/PCI_DSS_v4_0_1_SAQ_D_Service_Provider_r2.pdf), sensitive authentication data and the card verification code not stored after authorization (3.3.1, 3.3.1.2), strong cryptography for PAN over public networks (4.2.1)
- [PCI SSC FAQ: Can CVC be stored for card-on-file or recurring transactions?](https://blog.pcisecuritystandards.org/faq-can-cvc-be-stored-for-card-on-file-or-recurring-transactions), not needed for those transactions and storage prohibited
- [Nacha: Proof of authorization industry practices for WEB debits (PDF)](https://www.nacha.org/system/files/2022-11/WEB_Proof_of_Authorization_Industry_Practices.pdf), authorization language naming the originator and two-year retention after termination
- [Visa: Account Updater merchant flyer (PDF)](https://usa.visa.com/dam/VCOM/global/support-legal/documents/merchant-flyer-vau-and-rtvau-20170615.pdf), merchant enrollment through qualified acquirers and real-time updates
- [Mastercard Developers: Automatic Billing Updater support](https://developer.mastercard.com/automatic-billing-updater/documentation/support/), merchant and sub-merchant registration by merchant ID

**Reference**

- [FTC: Action against First American Payment Systems (July 2022)](https://www.ftc.gov/news-events/news/press-releases/2022/07/ftc-takes-action-stop-payment-processor-first-american-trapping-small-businesses-surprise-exit-fees), the $4.9 million settlement, the three-year term and $495 cancellation fee, and the required cancellation procedure

**In practice**

- [Stripe: Import payment data](https://docs.stripe.com/get-started/data-migrations/pan-import), PGP and SFTP transfer, validation and approval, mapping file, timelines, export fees and forms, no DTA, new merchant ID decline codes and ramp-up
- [Stripe: Payment method imports](https://docs.stripe.com/get-started/data-migrations/payment-method-imports), expired cards and account updater, Apple Pay device numbers, ACH mandates and Nacha responsibility, SEPA and Bacs
- [Stripe: Request a payment data export](https://docs.stripe.com/get-started/data-migrations/pan-export), PCI DSS Level 1 recipients, AOC or Visa registry listing, 4,096-bit PGP key, what isn't exported
- [Stripe: Migrate subscriptions using the APIs](https://docs.stripe.com/billing/subscriptions/import-subscriptions), billing cycle anchors and start dates for mid-term customers
- [Stripe: Billing migration toolkit](https://docs.stripe.com/billing/subscriptions/import-subscriptions-toolkit), cancelling old subscriptions before they charge
- [Stripe: Maintaining payments performance when adopting Stripe](https://stripe.com/guides/maintaining-payments-performance-when-adopting-stripe), the ramp schedule, stabilization, baseline data and running account updates before migrating
- [Adyen: Migrating payment data](https://docs.adyen.com/development-resources/migrating-payment-data), shopper reference, PGP encryption, the three-stage parallel plan, no charge and timing
- [Adyen: Import payment details for recurring payments](https://docs.adyen.com/development-resources/migrating-payment-data/import-payment-details-for-recurring-payments), file format and limits, Visa transaction ID and Mastercard Trace Link ID, output references
- [Adyen: Forward payment details](https://docs.adyen.com/online-payments/tokenization/forward-payment-details), forwarding to a PCI-compliant third party and creating an Adyen token to forward network tokens
- [Adyen: Real-time account updater](https://docs.adyen.com/online-payments/account-updater/real-time-account-updater), conditions for updating refused merchant-initiated payments
- [Braintree: Data migration overview](https://developer.paypal.com/braintree/articles/get-started/data-migration/overview), no fees, no subscriptions or transactions, and ACH agreements tied to the processor
- [Braintree: Imports](https://developer.paypal.com/braintree/articles/get-started/data-migration/imports), encrypted SFTP, the mapping log file, two imports and supported methods
- [Braintree: Exports](https://developer.paypal.com/braintree/articles/get-started/data-migration/exports), PCI attestation of the recipient, GPG-encrypted CSV and two exports
- [Checkout.com: Token migration guide](https://www.checkout.com/docs/developer-resources/token-migration-guide), SFTP and PGP, required fields, the Trace Link ID date and the 14-business-day minimum
- [IXOPAY: Migrating tokens between token service providers](https://www.ixopay.com/blog/how-to-migrate-tokens-when-switching-token-service-providers-tsps), network tokens move with the token requestor IDs
- [PCI Proxy: What happens to stored cards when you switch PSP](https://www.pci-proxy.com/blog-posts/what-happens-to-stored-cards-when-you-switch-psp), the receiving provider as certified token requestor and re-linking time
- [Merchant Risk Council: The challenges of MID warming](https://merchantriskcouncil.org/news-and-press/mrc-blog/2022/the-challenges-of-mid-warming), security and do-not-honor declines for 90 to 120 days and notifying issuers
