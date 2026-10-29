+++
title = "Checkout, Invoices & Payment Links"
nav_title = "Checkout & Invoicing"
description = "Hosted pages, payment links, invoices, payer portals and virtual terminals: PCI scope, the invoice lifecycle, applying payments, and B2B receivables."
category = "Payments Industry"
order = 1418
part = "Taking Payments"
tags = ["payments", "invoicing", "checkout", "payment-links", "pci-dss", "receivables"]
+++

[Designing the Payments API](/books/payments/payments-api) describes the objects a developer integrates with. Most merchants never touch them directly. They take money through products a provider builds on top of the API: a hosted payment page, a form embedded in their own site, a link sent by text, an invoice with a pay button, a portal where a payer sees what they owe, and a virtual terminal where staff key in a card read over the phone. These receivables products are where a provider meets the merchants who can't, or shouldn't, write payment code, and for a provider selling to software platforms they're much of what the platform resells under its own name.

Each surface puts a different amount of the merchant inside PCI DSS, invites a different kind of abuse, and needs a different answer to the question every receivables product eventually faces: this money arrived, so what did it pay for? This chapter covers the surfaces and when each fits, the invoice as a state machine with numbering, credits, partial payments and overpayments, links that can't be tampered with, wallets and bank payments on hosted pages, accessibility and white-labeling, and the B2B features (terms, remittance, Level 3 data) that decide whether a business customer can pay you at all.

## Six Surfaces

A provider's receivables products come in six shapes. They overlap, and most merchants use several, but each has one job it does best:

| Surface | What the payer sees | When it fits | Merchant's PCI validation |
| --- | --- | --- | --- |
| **Hosted payment page** | The provider's page, reached by redirect, branded as the merchant | E-commerce without a payments team; anything where conversion matters less than scope | SAQ A, with no script criterion to meet for a pure redirect |
| **Embedded components and hosted fields** | The merchant's own page, with the card fields in the provider's iframes | A checkout the merchant designs, or a platform's product that must feel native | SAQ A, with the script criterion; SAQ A-EP if the merchant's own script builds any part of the form |
| **Payment link** | A provider page opened from a URL in an email, text, chat or QR code | No website at all, a one-off charge, a deposit, a donation, a payment taken out of a phone call | SAQ A |
| **Invoice** | A document with line items, terms and a pay button that opens a hosted page | Anything billed after the fact: services, B2B orders, balances | SAQ A for the payment page it links to |
| **Payer portal** | A signed-in page to view the balance, pay, save a method and enroll in autopay | Repeat payers: tenants, patients, members, business customers | SAQ A, if the payment parts are the provider's page or fields |
| **Virtual terminal** | Nothing: staff type the card into the provider's web form | Mail and phone orders, a business card read off a purchase order | SAQ C-VT, on an isolated computer |

The PCI column is the decision most merchants don't know they're making, so it's worth being exact. SAQ A is for merchants whose account data functions are "completely outsourced to PCI DSS validated and compliant third parties," and for e-commerce it requires that "all elements of the payment page(s)/form(s) delivered to the customer's browser originate only and directly from a PCI DSS compliant TPSP/payment processor." Since the January 2025 revision it also requires that "the merchant has confirmed that their site is not susceptible to attacks from scripts that could affect the merchant's e-commerce system(s)," which replaced requirements 6.4.3 (an inventory, authorization and integrity check for every payment page script) and 11.6.1 (tamper detection on payment page scripts and headers as the browser receives them) in that questionnaire. PCI SSC's FAQ 1588 limits that criterion to merchants whose page "includes a TPSP's/payment processor's embedded payment page/form," so a merchant that redirects to a hosted page doesn't have to meet it, and one that embeds hosted fields meets it either with its own 6.4.3 and 11.6.1 controls or with the provider's written confirmation. The details, and what 6.4.3 and 11.6.1 require in practice, are in [Payment Page Scripts](/docs/compliance/pci-dss#payment-page-scripts); what a provider promises when it ships the iframe is in [Getting the Card In](/books/payments/card-vault#getting-the-card-in).

SAQ A-EP is the cliff: it applies to an e-commerce merchant whose website "does not receive account data but controls how customers, or their account data, are redirected" to the provider, which in practice means the merchant's own JavaScript builds the form or posts the card. SAQ C-VT is the virtual terminal's questionnaire, for merchants that "manually enter a single transaction at a time via a keyboard into an Internet-based virtual payment terminal solution," and it requires the computer to be isolated, with no software that stores account data and no attached card reader. It explicitly "is not applicable to e-commerce channels," so a virtual terminal is not a way to take web payments.

The table describes the merchant. A software platform that embeds any of these surfaces for its own merchants is usually a service provider to them, and validates as one ([Components or the API](/books/payments/software-platforms#components-or-the-api)). A provider building the surfaces is in scope for all of it, and requirements 6.4.3 and 11.6.1 apply in full to its own hosted pages.

My default: a hosted page or payment link for anything a merchant sends, embedded components when the payer is already on the merchant's site, and a virtual terminal only as a fallback. Stripe says as much about its own: a virtual terminal is "not part of Stripe's out-of-the-box solutions," because it makes PCI adherence harder, and is "a useful but rare backup method." Sending a link is better in almost every phone case, for the reasons in [Send a Link Instead](/books/payments/phone-payments#send-a-link-instead).

## How the Platforms Do It

The four products below show the range, from an enterprise acquirer to a platform-focused payfac and two merchant-facing providers:

| | **Adyen** | **Payabli** | **Square** | **Stripe** |
| --- | --- | --- | --- | --- |
| **Hosted page** | Hosted Checkout: a `/sessions` request with `mode: hosted` returns a page URL; expires 1 hour after creation by default, or sooner after too many payment attempts | Hosted payment pages, no-code and branded, prefilled by query string or Base64 JSON in the URL; iframe embedding "not recommended" | Payment links from the Checkout API, quick pay (name and price) or a full order | Checkout, hosted or embedded; sessions expire after 24 hours by default, settable from 30 minutes to 24 hours |
| **Embedded components** | Drop-in and Components | EmbeddedMethod, PayMethod (save only), VirtualTerminal and ExpressCheckout (wallets), plus Creator no-code components | The Web Payments SDK | Elements, and Checkout's embedded form |
| **Payment links** | Single-use unless `reusable`; 24-hour default expiry, 70 days at most; statuses `active`, `completed`, `expired`, `paymentPending`; removed three months after creation | Generated from an invoice; links sent by text expire after 3 days | Created with `CreatePaymentLink` | Payment Links, reusable "with multiple customers," a purchase limit, and an option to let customers choose what to pay |
| **Invoices** | Not documented as a product; Pay by Link lists invoices as a use case | Native invoices with a catalog; statuses Draft, Active/Open, Partially Paid, Paid/Complete, Canceled | Ten statuses, including `SCHEDULED`, `PARTIALLY_PAID`, `PARTIALLY_REFUNDED` and `FAILED`; up to 12 installments | `draft`, `open`, `paid`, `void`, `uncollectible`; credit notes; partial payments and payment plans |
| **Text delivery** | Not documented | Pay by SMS, with an opt-in flow and STOP | SMS invoices, not settable through the API, and sent without reminders | The invoice or link URL, shared by the merchant |
| **Payer portal** | Not documented | Not documented | Not documented | Customer portal: billing details, payment methods, subscriptions, and paying current and past invoices; sessions expire after 5 minutes unused |
| **Virtual terminal** | In the Customer Area, behind a role; SAQ C-VT before going live | In the Portal, and as a component | Virtual Terminal, for keyed and card-on-file payments | Not standard; set up on request |
| **Apple Pay on your own domain** | Not documented | Every domain verified, cascading from an organization to its paypoints | Each domain registered in the Developer Console for the Web Payments SDK | Every domain registered for Elements and embedded Checkout, including for connected accounts |

Read across the rows and two designs emerge. Square and Stripe make the invoice the receivable and the page its view, with the invoice's status machine doing the work. Adyen makes the payment link the unit and leaves invoicing to the merchant's own systems. Payabli sits between: native invoices for platforms that want them, and a published decision guide comparing native invoices, a custom invoice with embedded components, and a custom invoice with a link, by design control, PCI scope and who tracks status. A provider serving software platforms needs the middle answer, because most of its platforms already have an invoice of their own and need only the payment underneath it.

## The Invoice Lifecycle

An invoice is a document with legal weight, a receivable on the merchant's books, and the thing a payer pays. Those three roles pull its state machine in different directions, and the vendors' status lists show the disagreement: Stripe has five statuses and keeps a partly paid invoice `open`, Square has ten, including refund states, and Payabli tracks partial payment as its own status.

![The invoice state machine. draft moves to open when finalized. From open, an invoice is paid in full, along the accented path to paid, or part paid into partially_paid, which moves to paid when the balance reaches zero. A returned payment, dashed, moves paid back to partially_paid. open is voided, dashed, into void, a terminal state; partially_paid is written off, dashed, into uncollectible, which moves to paid when it is paid late. A legend marks the path an invoice should take, a payment applied, an exit or reversal, and a terminal state.](/diagrams/pm-invoice-states.svg "Six stored states. Overdue and viewed are facts about an open invoice, not states, and a refund is a credit note, so paid stays paid. Only void is final: a returned ACH debit or a lost dispute reopens a paid invoice.")

My rule: store only states that change what the system may do next, and derive the rest:

- **`draft`** is editable, has no number and can be deleted. Nothing about it is a record yet.
- **`open`** is finalized: numbered, taxed, its lines frozen. Stripe's wording is the right contract: "You can no longer change most details of a finalized invoice," and for anything substantive, "create a new invoice and void the old one."
- **`partially_paid`** earns its place because it changes what's allowed: an invoice with money applied can't simply be voided, since the money has to go somewhere first.
- **`paid`** means the balance reached zero by payments, credits or both. It is not final: an ACH debit returned after the invoice showed paid ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)), or a dispute lost on the card payment, reverses the application and reopens the invoice. Stripe lets a paid invoice go back to open by unapplying payments, for the same reason.
- **`void`** cancels a finalized invoice and keeps it: Stripe notes that voiding "maintains a paper trail, which allows you to look up the invoice by number." A number once issued is never deleted. Void only invoices with nothing applied.
- **`uncollectible`** is a write-off decision with accounting consequences ([Write-Offs](/docs/payments/accounting#write-offs)). It isn't terminal either: the payer who pays a written-off invoice moves it to `paid`, and the recovery posts against the bad-debt expense.

Then the things that look like states and aren't:

- **Overdue** is `open` or `partially_paid` with a due date in the past. Stored as a status, it needs a nightly job to set it and every payment to clear it, and the two will disagree. Compute it; Stripe shows it as a "Past due" badge on an `open` invoice for the same reason.
- **Sent and viewed** are events on the invoice. An invoice can be viewed, partly paid and overdue at once; a status can't say that, an event log can. Viewed is worth recording, because "the payer opened it four times" is useful dispute evidence and a useful dunning signal.
- **Refunded** is a credit note against a paid invoice, with the refund it caused. Square stores `PARTIALLY_REFUNDED` and `REFUNDED` as statuses; Stripe issues a credit note, which can refund the payment, credit the customer's balance or record a credit settled outside Stripe. I prefer the credit note, because the refund needs its own document with its own tax lines anyway, and the invoice's status keeps answering one question: is anything still owed?
- **Scheduled** (Square's `SCHEDULED`) is an open invoice with a future send date. It's a delivery fact.

## Numbers, Lines and Tax

**Numbering.** The EU VAT Directive requires "a sequential number, based on one or more series, which uniquely identifies the invoice," and Stripe notes that EU and UK rules typically require one sequence across the account, which is why it defaults accounts there to account-level numbering and everyone else to a sequence per customer "because it doesn't expose the total number of invoices." Assign the number at finalization, not creation, inside the same transaction that changes the status, from a counter row locked for the update, so drafts that are deleted leave no gaps. Each merchant of record keeps its own sequence: on a platform, every sub-merchant's invoices are numbered in that sub-merchant's series, as Stripe does for invoices created on behalf of a connected account. Credit notes get a series of their own.

**Line items and a catalog.** A catalog of products and prices (Payabli's is a line-item catalog with SKUs; Stripe has products and prices, plus one-time items that exist only on one invoice) saves typing and keeps prices consistent. But a finalized invoice copies the description, quantity, unit price and tax code onto each line. A catalog edit next month must not change an invoice already sent. Each line computes its amount once, in integer minor units, with a written rule for rounding ([Money & Amounts](/docs/payments/money)).

**Tax lines.** Tax on a draft is a quote; at finalization it becomes a fact, stored per line and per jurisdiction with the engine's transaction ID, and never recomputed. The model and the reasons are in [Tax Is a Quote Until the Invoice Finalizes](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes). A credit note reverses tax at the original invoice's rates, not today's.

**Corrections.** Edits stop at finalization. A smaller amount owed is a credit note; a different invoice is a void and a reissue with a new number. Stripe's documentation adds the caution worth repeating to merchants: local law decides whether and how an invoice may be amended or canceled, and some jurisdictions require a credit note rather than a void.

## Applying Money to Invoices

A payment records money that moved. An **application** records what it paid for. The two separate the moment real payers arrive: one check pays three invoices, a payer pays half now and half next month, a B2B customer short-pays by a disputed line, a tenant pays $1,600 against a $1,500 balance. [Payments Are Applied, Not Assigned](/docs/payments/payment-states#payments-are-applied-not-assigned) sets out the principle; the receivables products are where it's built.

- **Partial payments.** A payment smaller than the balance is applied for its amount and leaves the invoice `partially_paid` with a remaining balance. Whether a payer may choose the amount is the merchant's setting, not the page's: Stripe lets merchants allow partial payments on the hosted invoice page, so the customer pays "a custom amount toward an invoice rather than the full balance at once." When allowed, set a minimum, so a $0.50 "partial payment" isn't a card test.
- **Overpayments.** Money beyond the balance never becomes revenue. It becomes a credit on the customer: unapplied cash if the payer meant it for something not yet billed, a credit balance if it should reduce the next invoice, or a refund if the payer asks. Stripe's model is a customer credit balance that later invoices draw down, and that a credit note on a paid invoice can feed.
- **Several invoices, one payment.** Apply by the payer's instructions first (a portal payment against one invoice, a remittance listing invoice numbers), then by the merchant's rule, commonly oldest first. Unmatched money waits in unapplied cash, visible, until someone matches it.
- **Reversals are new applications.** An ACH return or a lost chargeback posts a negative application against the same invoice, never deletes the old one, and the invoice reopens. Moving a payment from one invoice to another is a reversal and a new application, so the history shows both.

Where this posts matters. The invoice and its applications are the **merchant's** accounts receivable, which the provider keeps for it as a subledger. The provider's own ledger ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation)) records the payment as money it owes the merchant, exactly as it would without an invoice. A provider that books a merchant's receivables as its own assets has confused whose books it's keeping. The two meet at the payment: every captured payment that pays an invoice has applications summing to its amount, or a credit for the remainder, and a daily check proves it.

### Payment Plans and Installments

A payment plan splits one invoice into scheduled amounts, each with its own due date. Square's invoices support "up to 12 installment payments, either with or without an initial deposit," on its Invoices Plus plan; Stripe's invoices support payment plans; Payabli links an autopay to an invoice. Model installments as rows under the invoice, each with an amount and a due date that sum to the total, and apply payments to the earliest unpaid installment unless the payer says otherwise. Overdue then means an installment past due, not the whole invoice.

Charging installments from a saved card or bank account is a stored credential with a fixed schedule: the initial agreement, the installment flag on later charges, and the retry limits are in [Stored Cards & Recurring Billing](/books/payments/stored-credentials#the-first-transaction-carries-the-rest). A plan to pay whatever is owed, rather than fixed amounts, is [Autopay Against a Balance](/books/payments/stored-credentials#autopay-against-a-balance). Installments a merchant offers on its own invoices aren't buy now, pay later: no lender is involved, and the merchant carries the credit risk.

### Reminders, Dunning and Receipts

Reminders are scheduled relative to the due date (before, on, and after), stop the moment the balance reaches zero, and carry the same link as the invoice. Square sends reminders at 11:00 a.m. in the invoice's time zone and none at all for invoices delivered by text, which is a reasonable default: a text channel's consent and quiet rules are stricter than email's. After the due date, reminders become [dunning](/books/payments/stored-credentials#dunning), and a merchant collecting on someone else's behalf meets debt collection law ([Collection Agencies and the Law](/books/field-operations/collections-and-retention#collection-agencies-and-the-law)).

A **receipt** is a separate document from the invoice: it records a payment, its method and amount, and which invoices it was applied to, and it goes out when the payment succeeds, not when the invoice closes. A bank debit that later returns had a receipt that was true when sent; the reversal gets a notice of its own. Stripe's hosted invoice page offers PDFs of both the invoice and the receipt, the useful pairing.

## Links That Can't Be Tampered With

A payment link is a bearer token: whoever holds it can pay, and some links show a name and a balance. [Send a Link Instead](/books/payments/phone-payments#send-a-link-instead) covers the basics (single use, bound to one amount, expiring, no personal data in the URL). Building them for a provider adds three decisions.

**Where the amount comes from.** A link whose URL carries `?amount=150.00` lets anyone who edits the URL pay $1.50 against a $150 invoice. Payabli's hosted pages accept prefilled amounts by query string, and its documentation says query string values can't be edited by the payer on the page, with an `editamount` option to allow it. That stops typing in the field, not editing the URL. My rule: the amount on a link is a server-side record, created before the link is sent, and the URL carries only an unguessable token that looks it up. Stripe's design is the model: the hosted invoice URL "includes a secure, long, and random identifier," and Payment Links accept URL parameters only for tracking and prefilled details such as `client_reference_id`, never the price. When a static page must take parameters (a platform building links without an API call per payer), sign them: an HMAC over the canonical parameter string with the merchant's key and an expiry, verified by the server before the page renders, and the amount the server charges is the signed one.

**Three amount modes.** A link's amount is **fixed** (a deposit, a ticket), **the invoice's balance** at the moment the page loads (so a link sent before a partial payment doesn't overcharge), or **payer-entered** within a minimum and a maximum (donations, "pay what you owe" against an account). Stripe offers the last as letting "customers choose what to pay," and only on Payment Links, not invoices. Store the mode on the link and recompute the balance on every page load and again when the payment is created.

**Expiry and reuse.** Single-use links close after one successful payment; reusable links close at a payment limit or by hand. Expiry is a security control and a support cost at once, and providers land in different places: Adyen's links expire after 24 hours unless set up to 70 days out, Payabli's links sent by text after 3 days, Stripe's Checkout sessions within 24 hours, and Stripe's hosted invoice URLs 30 days after the due date, "never longer than 120 days," with a recovery page that emails the payer a fresh copy. That last design is what I'd copy: short-lived tokens, and an expired link that leads somewhere useful instead of a dead end.

### Card Testing on Public Pages

A reusable link or donation page with a payer-entered amount is the ideal card testing target: public, cheap, accepting any amount, and owned by a merchant who won't notice for days. The general defenses are in [Card Testing](/books/payments/fraud-and-risk#card-testing). On receivables surfaces:

- **Minimums on payer-entered amounts.** Card testers prefer tiny amounts; a minimum of a few dollars on a donation page costs real donors almost nothing.
- **Attempts per session and per link.** Adyen's Hosted Checkout page expires early "if Adyen detects too many payment attempts." Count declines per link, not just per IP, and deactivate a reusable link automatically when its decline rate spikes.
- **CAPTCHA on public pages,** by risk. Stripe lists CAPTCHAs as built into Checkout; whatever is used must stay accessible ([Accessibility](#accessibility)).
- **Single-use links bound to an invoice are poor targets,** because the amount is fixed and the link dies after one success. Prefer them to reusable links wherever there's a known payer.

### Sending by Text

Text delivery is the most effective channel and the most regulated. Automated texts need prior consent under the TCPA, carriers require 10DLC registration, and a STOP reply has to stop the messages ([The Rules for Texting](/books/payments/phone-payments#the-rules-for-texting)). Payabli builds the opt-in into the product: a customer who hasn't opted in gets an emailed invitation first, and STOP opts them out until the merchant opts them back in. Record which consent each send relied on, so the question "why did this person get a text?" has a row for an answer.

## Wallets, Bank Payments and Branding

**Apple Pay needs a verified domain.** Apple requires a verification file at `https://[DOMAIN_NAME]/.well-known/apple-developer-merchantid-domain-association` on each domain that shows the button, and a payment platform integrator distributes its file to every merchant before registering the merchant's domain. On a provider's hosted page the provider's domain is already registered; the work appears when the button runs on the merchant's domain, through embedded components. Stripe requires registering every domain and subdomain for Elements and embedded Checkout, and for connected accounts on the account that runs the charge. Payabli verifies domains per entity and lets an organization cascade a verified domain to every paypoint below it, so a platform serving merchants under paths on one domain verifies it once. Each subdomain is its own registration, and a platform offering custom domains to merchants takes on a registration per domain as part of onboarding. The wallet's card mechanics are in [Wallets Are Cards in Disguise](/books/payments/wallets-and-local-methods#wallets-are-cards-in-disguise).

**Pay by bank.** For a large invoice, a bank debit costs a fraction of a card payment, which is why B2B and rent payers are steered toward it. On a hosted page that means a WEB debit authorization captured on the page, account validation before the first debit ([Validating the Account](/books/payments/ach#validating-the-account)), and an invoice that shows `paid` only as long as the debit isn't returned. Show the payer that bank payments take days to settle, and don't release goods or close the invoice for good until the return window has passed for the amount at stake. Pay-by-bank methods that push money, and their tradeoffs against debits, are in [Bank Push and Bank Pull](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull).

**Branding and custom domains.** White-label platforms want their merchants' names on the page, and the payer needs to recognize who's charging them, because an unfamiliar name on a payment page is a phishing signal and on a statement a dispute. Stripe serves hosted Checkout on a merchant's subdomain as a paid feature, and applies brand settings across Checkout, Payment Links, the customer portal and the hosted invoice page. Whatever the branding, the page shows the merchant of record, the statement descriptor the payer will see, and a way to contact the merchant.

**Localization.** Language, currency and number formats follow the payer, not the merchant: Stripe's invoices support a per-customer preferred language across more than 40 languages, and its hosted pages follow the browser. Address forms, date formats on due dates, and the wording of legal notices are part of it. Currency is the exception: an invoice is issued in one currency and paid in it unless the merchant chooses conversion ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx)).

### Accessibility

Payment forms are where accessibility failures cost money directly, and law increasingly covers them. In the US, the Justice Department's ADA Title II rule adopts WCAG 2.1 Level AA for state and local governments, whose payment portals for utilities, courts and taxes are invoice payment surfaces; an interim final rule published April 20, 2026 moved the compliance dates to April 26, 2027 for entities serving 50,000 people or more and April 26, 2028 for the rest. In the EU, the European Accessibility Act has applied to e-commerce services since 28 June 2025. My rule: build to WCAG 2.2 Level AA, which includes 2.1, and the criteria that bite on payment pages are specific:

- **3.3.4 Error Prevention (Legal, Financial, Data), Level AA:** for pages that "cause legal commitments or financial transactions," a submission is reversible, checked for errors, or confirmed on a review step. A payer sees the amount, the merchant and the method before the button that charges them.
- **2.2.1 Timing Adjustable, Level A:** a payment session that times out is a time limit set by the content. Warn before it expires and let the payer extend it with a simple action; the criterion's exceptions include limits over 20 hours, which a 30-minute checkout isn't.
- **1.3.5 Identify Input Purpose, Level AA:** card and address fields carry their HTML `autocomplete` purposes (`cc-number`, `cc-exp`, `postal-code`), inside the provider's iframe too, so browsers and assistive tools can fill them.
- **3.3.7 Redundant Entry, Level A:** information already entered in the same process isn't asked for again; a billing address same as shipping is a checkbox, not a retype.
- **2.5.8 Target Size (Minimum), Level AA:** pointer targets at least 24 by 24 CSS pixels, which small wallet buttons and method toggles often miss.
- **3.3.8 Accessible Authentication (Minimum), Level AA:** no cognitive function test "such as remembering a password or solving a puzzle" to sign in to a payer portal without an alternative. A one-time link or code sent to the payer satisfies it.

A provider's hosted page and fields carry the merchant's accessibility as much as its PCI scope, and merchants subject to these laws will ask for the conformance report.

## B2B Receivables

Business payers pay differently, and a receivables product that treats them as consumers loses the volume:

- **Net terms.** Invoices are due a number of days after issue (net 30 means 30 days), sometimes with an early payment discount. Store the terms on the invoice and compute the due date from them at finalization; an early payment discount is a conditional credit applied when payment arrives in time, not a different price. The seller's side, terms and credit limits on a company account, is the Commerce volume's [Net Terms and Credit](/books/commerce/b2b-commerce#net-terms-and-credit).
- **Purchase orders and remittance.** A business pays against a purchase order and sends remittance data saying which invoices a payment covers. Capture the PO number on the invoice, and match incoming remittance to invoice numbers before any amount-based rule. On ACH, a CCD entry "can contain a single addenda record to relay payment-related information," and a CTX entry "supports up to 9,999 addenda records," enough for a full ANSI ASC X12 remittance; parse both into applications ([Files, Batches and SEC Codes](/books/payments/ach#files-batches-and-sec-codes)). The payer's side of the same data is in [Remittance and Reconciliation](/books/payments/vendor-payouts#remittance-and-reconciliation).
- **Virtual cards arriving.** Many business payers pay invoices with single-use virtual cards from their own payables provider, the other end of [Virtual Cards: Who Pays for the Rebate](/books/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate). They arrive as card-not-present commercial card payments, often keyed into a virtual terminal from an emailed card, and they carry the highest interchange.
- **Level 2 and Level 3 data at checkout.** Those commercial card payments cost less with line-item data, and an invoice already has it. Carry each line's commodity code, unit of measure, quantity, unit price and tax from the invoice into the authorization, and validate that the lines sum to the amount before the processor does ([Level 2 and Level 3 Data](/books/payments/interchange-and-pricing#level-2-and-level-3-data)). A payment against several invoices, or a partial payment, needs the line data scaled or summarized to match what's actually charged.
- **Surcharges.** Passing card fees to business payers is common and rule-bound by network and state ([Surcharging & Fees](/books/payments/surcharging-and-fees)); show the fee on the page before the payer confirms, and keep it as its own line, not a changed invoice total.
- **Checks and lockbox.** Business payers still mail checks. A lockbox file with check images and remittance slips feeds the same application engine ([Lockbox](/books/payments/checks#lockbox)), with the invoice number from the slip or coupon as the first match key.

## How to Build It

These are deltas against [the core data model](/books/payments/card-payments#the-core-data-model): a catalog, invoices with lines and installments, credit notes, customer credits, the applications that tie money to invoices, and payment links with their deliveries. Tax rows per line are `invoice_line_taxes` from [Sales Tax](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes), referencing `invoice_lines`.

```sql
CREATE TABLE catalog_items (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  sku             TEXT NOT NULL,
  name            TEXT NOT NULL,
  unit_amount     BIGINT NOT NULL CHECK (unit_amount >= 0),
  currency        CHAR(3) NOT NULL,
  tax_code        TEXT,                          -- the tax engine's product code
  commodity_code  TEXT,                          -- Level 3
  unit_of_measure TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, sku)
);

CREATE TABLE invoice_number_series (           -- locked FOR UPDATE at finalization
  merchant_id UUID NOT NULL REFERENCES merchants (id),   -- the merchant of record
  series      TEXT NOT NULL,                   -- 'INV', 'CN' for credit notes
  next_value  BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (merchant_id, series)
);

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  customer_id     UUID NOT NULL REFERENCES customers (id),
  number          TEXT,                        -- assigned at finalization, never reused
  status          TEXT NOT NULL CHECK (status IN ('draft', 'open', 'partially_paid', 'paid',
                    'void', 'uncollectible')), -- overdue is derived from due_on
  currency        CHAR(3) NOT NULL,
  subtotal        BIGINT NOT NULL DEFAULT 0,   -- minor units
  tax_amount      BIGINT NOT NULL DEFAULT 0,
  total           BIGINT NOT NULL DEFAULT 0,
  amount_applied  BIGINT NOT NULL DEFAULT 0,   -- convenience; applications are the truth
  amount_credited BIGINT NOT NULL DEFAULT 0,
  net_days        SMALLINT,                    -- 30 for net 30
  issued_on       DATE,
  due_on          DATE,
  purchase_order  TEXT,
  locale          TEXT,                        -- the payer's language for the document
  allow_partial   BOOLEAN NOT NULL DEFAULT FALSE,
  min_partial     BIGINT,
  finalized_at    TIMESTAMPTZ,
  idempotency_key TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, number),
  UNIQUE (merchant_id, idempotency_key),
  CHECK ((status = 'draft') = (finalized_at IS NULL)),
  CHECK (status = 'draft' OR number IS NOT NULL)
);

CREATE TABLE invoice_lines (                   -- copied from the catalog, frozen at finalization
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_id      UUID NOT NULL REFERENCES invoices (id),
  position        SMALLINT NOT NULL,
  catalog_item_id UUID REFERENCES catalog_items (id),    -- null for a one-off line
  description     TEXT NOT NULL,
  quantity        NUMERIC(12,4) NOT NULL CHECK (quantity > 0),
  unit_amount     BIGINT NOT NULL,
  discount_amount BIGINT NOT NULL DEFAULT 0,
  amount          BIGINT NOT NULL,             -- rounded once, by the written rule
  tax_code        TEXT,
  commodity_code  TEXT,
  unit_of_measure TEXT,
  UNIQUE (invoice_id, position)
);

CREATE TABLE invoice_installments (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_id        UUID NOT NULL REFERENCES invoices (id),
  seq               SMALLINT NOT NULL,
  due_on            DATE NOT NULL,
  amount            BIGINT NOT NULL CHECK (amount > 0),   -- installments sum to the total
  payment_method_id UUID REFERENCES payment_methods (id), -- set when charged automatically
  UNIQUE (invoice_id, seq)
);

CREATE TABLE invoice_events (                  -- facts that aren't states
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_id UUID NOT NULL REFERENCES invoices (id),
  type       TEXT NOT NULL CHECK (type IN ('sent', 'viewed', 'reminder_sent', 'finalized',
               'voided', 'marked_uncollectible', 'reopened')),
  actor      TEXT NOT NULL,                    -- user, 'system', or 'payer'
  detail     JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credit_notes (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_id UUID NOT NULL REFERENCES invoices (id),
  number     TEXT NOT NULL,                    -- from the credit note series
  amount     BIGINT NOT NULL CHECK (amount > 0),
  reason     TEXT NOT NULL,
  settlement TEXT NOT NULL CHECK (settlement IN ('reduce_balance', 'refund',
               'customer_credit', 'out_of_band')),
  refund_id  UUID REFERENCES refunds (id),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (settlement = 'refund' OR refund_id IS NULL)
);

CREATE TABLE customer_credits (                -- unapplied cash and granted credit; append-only
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id    UUID NOT NULL REFERENCES customers (id),
  source         TEXT NOT NULL CHECK (source IN ('overpayment', 'unapplied', 'credit_note',
                   'goodwill', 'applied', 'refunded')),
  payment_id     UUID REFERENCES payments (id),
  credit_note_id UUID REFERENCES credit_notes (id),
  amount         BIGINT NOT NULL CHECK (amount <> 0),  -- positive adds, negative consumes
  currency       CHAR(3) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_applications (            -- what each payment or credit paid for
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_id         UUID NOT NULL REFERENCES invoices (id),
  installment_id     UUID REFERENCES invoice_installments (id),
  payment_id         UUID REFERENCES payments (id),
  credit_note_id     UUID REFERENCES credit_notes (id),
  customer_credit_id UUID REFERENCES customer_credits (id),   -- spending a credit balance
  amount             BIGINT NOT NULL CHECK (amount <> 0),       -- negative reverses
  reverses_id        UUID REFERENCES invoice_applications (id),
  reason             TEXT NOT NULL,            -- 'payment', 'ach_return', 'dispute_lost', 'moved'
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(payment_id, credit_note_id, customer_credit_id) = 1),
  CHECK ((amount < 0) = (reverses_id IS NOT NULL))
);

CREATE TABLE payment_links (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  invoice_id      UUID REFERENCES invoices (id),
  token_hash      BYTEA NOT NULL UNIQUE,       -- the URL carries the token; store its hash
  usage           TEXT NOT NULL CHECK (usage IN ('single_use', 'reusable')),
  amount_mode     TEXT NOT NULL CHECK (amount_mode IN ('fixed', 'invoice_balance', 'payer_entered')),
  amount          BIGINT CHECK (amount > 0),
  min_amount      BIGINT,
  max_amount      BIGINT,
  currency        CHAR(3) NOT NULL,
  max_payments    INTEGER,
  payment_count   INTEGER NOT NULL DEFAULT 0,
  allowed_methods TEXT[] NOT NULL,             -- 'card', 'us_bank_account', 'apple_pay', ...
  expires_at      TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('active', 'completed', 'expired', 'deactivated')),
  created_by      TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((amount_mode = 'fixed') = (amount IS NOT NULL)),
  CHECK (amount_mode <> 'invoice_balance' OR invoice_id IS NOT NULL),
  CHECK (amount_mode <> 'payer_entered' OR (min_amount > 0 AND max_amount >= min_amount)),
  CHECK (usage <> 'single_use' OR max_payments = 1)
);

CREATE TABLE payment_link_deliveries (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_link_id     UUID NOT NULL REFERENCES payment_links (id),
  channel             TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  destination         TEXT NOT NULL,
  purpose             TEXT NOT NULL CHECK (purpose IN ('invoice', 'reminder', 'receipt')),
  consent_reference   TEXT,                    -- the consent record a text relied on
  provider_message_id TEXT,
  status              TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'failed',
                        'opted_out')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (channel <> 'sms' OR consent_reference IS NOT NULL)
);

ALTER TABLE payments
  ADD COLUMN surface         TEXT CHECK (surface IN ('api', 'hosted_page', 'embedded',
                               'payment_link', 'invoice', 'portal', 'virtual_terminal')),
  ADD COLUMN payment_link_id UUID REFERENCES payment_links (id);
```

How it runs:

1. **Finalize in one transaction.** Lock the number series row, assign the number, freeze lines, commit tax with the engine, set `open` and `finalized_at`, and write the `finalized` event. A failure anywhere leaves a draft, never a numbered invoice without tax.
2. **Apply on capture, not on authorization.** An application is written when the payment captures, in the same transaction that updates `amount_applied` and the status, and keyed by the payment, so a replayed webhook can't apply twice. For bank debits, apply on submission and reverse on return, so the payer sees the payment immediately and the reversal is visible when it happens.
3. **Compute the link's amount at page load and at payment.** For `invoice_balance`, read the balance in the transaction that creates the payment, and refuse if it's zero; a single-use link completes in the same transaction that records its payment.
4. **Overdue is a query.** `status IN ('open', 'partially_paid') AND due_on < current business date`, in the merchant's time zone ([Business Dates](/docs/fundamentals/time#business-dates-business-days-and-holidays)), and reminders are scheduled jobs that recheck the balance before sending.
5. **Every payment through a surface records the surface.** It's what scopes a card testing investigation to one link and what proves, in a PCI review, which payments went through which form.

## Auditing

Receivables products are audited by the merchants' accountants, by acquirers and sponsor banks looking at the payment surfaces, and by PCI assessors. The evidence:

- **Every finalized invoice is accounted for.** For each merchant and series, the numbers are continuous, every number maps to an invoice in some status, and voided invoices still exist. A gap is a finding.
- **Balances reconcile.** For each invoice, `total - amount_credited - sum(applications)` equals the open balance; for each payment, applications plus customer credits equal the amount captured. Run it nightly and send differences to the break queue ([A Matching Engine](/books/payments/ledger-and-reconciliation#a-matching-engine)).
- **Credit balances are explained.** Every customer credit traces to an overpayment, unapplied cash or a credit note, with its age. Old credits are either applied, refunded or reported; they don't drift into revenue.
- **Write-offs and reopenings are approved.** Each `uncollectible` and each reversal has an actor, a reason and, above a threshold, a second approver.
- **Payment pages are inventoried.** For each surface the provider hosts: the scripts on it and their justification (6.4.3), the tamper detection running against it as a browser sees it and its alerts (11.6.1), and for embedded fields the written confirmation the provider gives merchants for SAQ A's script criterion. A merchant's assessor will ask for that letter.
- **Virtual terminal access.** Who holds the role, when it was last reviewed, how many payments each user keyed, and refunds keyed by the same user who took the payment.
- **Links and texts.** For a sample of links: expiry set, amount from the server, single-use honored. For a sample of texts: the consent each relied on, and opt-outs honored from the next message on.
- **Accessibility.** A current WCAG 2.2 AA conformance report for the hosted page, fields and portal, since merchants under the ADA Title II rule or the European Accessibility Act will need it for their own compliance.

## What This Means for the System You Build

- **Offer the six surfaces on one engine,** with the PCI validation each implies spelled out to merchants: SAQ A for hosted pages and links, SAQ A with the script criterion for embedded fields, SAQ C-VT for the virtual terminal.
- **Store six invoice states and derive the rest.** Overdue is a date comparison, viewed is an event, refunded is a credit note; paid reopens when a payment is returned.
- **Number at finalization from a locked series per merchant of record,** never reuse a number, and correct with credit notes and reissues instead of edits.
- **Applications, not assignments.** Every payment and credit applies to invoices by explicit rows, overpayments become customer credits, and reversals are new negative rows.
- **Keep the merchant's receivables apart from your ledger.** The invoice subledger is the merchant's books; your ledger records the same payment as money owed to the merchant.
- **Amounts live on the server.** A link carries an opaque token; any URL parameter that affects money is signed and expiring.
- **Treat public pages as card testing targets:** minimums on payer-entered amounts, attempt limits per link, and automatic deactivation when declines spike.
- **Register wallet domains as part of onboarding,** cascading where the platform's tree allows it.
- **Build to WCAG 2.2 AA,** with confirmation before charge, extendable timeouts and `autocomplete` on every field, and publish the conformance report.
- **Carry B2B data end to end:** terms, PO numbers, remittance addenda into applications, and invoice lines into Level 3 data.

## References

**Specifications**

- [PCI SSC: SAQ A v4.0.1 Revision 1 (PDF, state treasurer's copy)](https://treasurer.nebraska.gov/tm/pci-dss/documents/PCI_DSS_v4_0_1_SAQ_A_r1.pdf), SAQ A eligibility: account data functions completely outsourced, all payment page elements from a compliant provider, the script-attack criterion, and the removal of 6.4.3, 11.6.1 and 12.3.1
- [PCI SSC: SAQ A-EP v4.0.1 (PDF, state treasurer's copy)](https://treasurer.nebraska.gov/tm/pci-dss/documents/PCI_DSS_v4_0_1_SAQ_A_EP.pdf), eligibility for e-commerce merchants whose site controls how account data reaches the provider
- [PCI SSC: SAQ C-VT v4.0.1 (PDF, state treasurer's copy)](https://treasurer.nebraska.gov/tm/pci-dss/documents/PCI_DSS_v4_0_1_SAQ_C_VT.pdf), virtual terminal eligibility: one keyed transaction at a time, an isolated device, no card readers, not for e-commerce
- [PCI SSC: FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/), the SAQ A script criterion applies only to merchants embedding a provider's payment form, and the two ways to meet it
- [W3C: Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), success criteria 1.3.5, 2.2.1 (including the 20-hour exception), 2.5.8 (24 by 24 CSS pixels), 3.3.4, 3.3.7 and 3.3.8, with their levels
- [Federal Register: Extension of Compliance Dates for the ADA Title II Web Accessibility Rule](https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web), published April 20, 2026: WCAG 2.1 AA, and compliance dates of April 26, 2027 and April 26, 2028
- [EUR-Lex: Directive (EU) 2019/882, the European Accessibility Act](https://eur-lex.europa.eu/eli/dir/2019/882/oj), accessibility requirements for e-commerce services
- [EUR-Lex: Council Directive 2006/112/EC (VAT Directive)](https://eur-lex.europa.eu/eli/dir/2006/112/oj), Article 226(2): "a sequential number, based on one or more series, which uniquely identifies the invoice"
- [Nacha: How ACH Works](https://achdevguide.nacha.org/how-ach-works), one addenda record on a CCD entry, up to 9,999 on CTX with full ANSI ASC X12 remittance, and B2B agreements
- [Apple: Preparing merchant domains for verification](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/preparing-merchant-domains-for-verification), the `.well-known/apple-developer-merchantid-domain-association` path and platform integrators distributing the file to merchants

**Reference**

- [PCI SSC Blog: Important Updates for Merchants Validating to SAQ A](https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a), the January 2025 SAQ A revision, effective March 31, 2025
- [Bird & Bird: Navigating the European Accessibility Act for online retailers](https://www.twobirds.com/en/insights/2025/a-guide-to-navigating-the-european-accessibility-act-for-online-retailers-service-providers-and-plat), the Act applying to e-commerce services from 28 June 2025

**In practice**

- [Adyen: Hosted Checkout](https://docs.adyen.com/standard/integration/hosted-checkout), `/sessions` with `mode: hosted`, the 1-hour default expiry, early expiry after too many attempts, and themes
- [Adyen: Create a payment link](https://docs.adyen.com/api-explorer/Checkout/latest/post/paymentLinks), single-use by default, 24-hour default expiry and a 70-day maximum
- [Adyen: Pay by Link with the API](https://docs.adyen.com/unified-commerce/pay-by-link/create-payment-links/api), reusable links and the `active`, `completed`, `expired` and `paymentPending` statuses
- [Adyen: Pay by Link](https://docs.adyen.com/unified-commerce/pay-by-link/), invoices as a use case, branding, and links removed three months after creation
- [Adyen: MOTO payments in the Customer Area](https://docs.adyen.com/unified-commerce/mail-order-telephone-order/customer-area), the Virtual Terminal, its user role, and SAQ C-VT before going live
- [Adyen Web (GitHub)](https://github.com/Adyen/adyen-web), Web Drop-in and Web Components for checkouts on the merchant's own page
- [Payabli: Hosted payment pages](https://docs.payabli.com/guides/pay-in-payment-page-overview), query string and JSON prefill, `amount` and `editamount`, payment method toggles, and the advice against iframes
- [Payabli: Invoicing delivery options](https://docs.payabli.com/guides/pay-in-invoicing-delivery-decision), native invoices against custom invoices with components or links, by design control, PCI scope and status tracking
- [Payabli: Status reference](https://docs.payabli.com/guides/pay-in-status-reference), invoice statuses 0 Draft, 1 Active/Open, 2 Partially Paid, 4 Paid/Complete and 99 Canceled
- [Payabli: Manage payment links](https://docs.payabli.com/guides/pay-in-developer-payment-links-manage), links generated from invoices and sent by email or text
- [Payabli: Pay by SMS](https://docs.payabli.com/guides/pay-in-developer-invoices-pay-by-sms), the opt-in flow, STOP, links only for invoices, and expiry after three days
- [Payabli: Embedded components](https://docs.payabli.com/guides/pay-in-components-overview), EmbeddedMethod, PayMethod, VirtualTerminal and ExpressCheckout
- [Payabli: Autopays](https://docs.payabli.com/guides/pay-in-autopays-overview), autopays linked to an invoice
- [Payabli: Creator](https://www.payabli.com/creator/), no-code embeddable payment, payout, reporting and boarding components
- [Payabli: Manage the catalog](https://docs.payabli.com/guides/platform-portal-catalog-manage), the line-item catalog
- [Payabli: Manage digital wallet domains](https://docs.payabli.com/guides/pay-in-portal-wallets-domains-manage), per-domain verification, cascading from organizations to paypoints, and the verification file
- [Square: Invoices API overview](https://developer.squareup.com/docs/invoices-api/overview), up to 12 installments on Invoices Plus, reminders at 11:00 a.m. and none for SMS invoices, and SMS not settable through the API
- [Square: InvoiceStatus](https://developer.squareup.com/reference/square/objects/InvoiceStatus), the ten invoice statuses
- [Square: Checkout API](https://developer.squareup.com/docs/checkout-api), payment links by quick pay or order
- [Square: Manually enter card payments](https://squareup.com/help/article/5176), keyed payments in Virtual Terminal
- [Square: Web Payments SDK, Apple Pay](https://developer.squareup.com/docs/web-payments/apple-pay), the SDK for payments on the merchant's page, and registering each domain for Apple Pay
- [Stripe: How invoicing works](https://docs.stripe.com/invoicing/overview), the five statuses, finalization, voiding with a paper trail, unapplying payments, credit notes, and the "Past due" badge
- [Stripe: Customize invoices](https://docs.stripe.com/invoicing/customize), account-level and customer-level numbering, EU and UK defaults, per-connected-account sequences, and preferred languages
- [Stripe: Hosted invoice page](https://docs.stripe.com/invoicing/hosted-invoice-page), the random URL identifier, expiry 30 days after the due date and never over 120 days, recovery, and partial payments
- [Stripe: Payment Links](https://docs.stripe.com/payment-links), reuse and purchase limits, customers choosing what to pay, and partial payments and payment plans on invoices only
- [Stripe: Track a payment link](https://docs.stripe.com/payment-links/url-parameters), URL parameters for tracking and `client_reference_id`
- [Stripe: How Checkout works](https://docs.stripe.com/payments/checkout/how-checkout-works?payment-ui=stripe-hosted), built-in CAPTCHAs, custom domains, and session expiry from 30 minutes to 24 hours
- [Stripe: Customer portal](https://docs.stripe.com/customer-management), what customers can do, 5-minute session expiry, and no iframes
- [Stripe: Register domains for payment methods](https://docs.stripe.com/payments/payment-methods/pmd-registration?dashboard-or-api=api), domain registration for Apple Pay in Elements and embedded Checkout, and for connected accounts
- [Stripe: What is a virtual terminal?](https://stripe.com/au/resources/more/what-is-a-virtual-terminal), not standard, harder for PCI, "a useful but rare backup method"
