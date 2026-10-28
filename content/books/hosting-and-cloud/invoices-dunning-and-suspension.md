+++
title = "Invoices, Dunning & Suspension"
nav_title = "Invoices & Dunning"
description = "Invoice runs from rated usage, payment terms and late interest, threshold charges, failed payments, suspension and deletion clocks, and data after termination."
category = "Hosting & Cloud Industry"
order = 2194
part = "Metering and Billing"
tags = ["invoicing", "dunning", "suspension", "data-retention", "billing"]
+++

A provider's invoice is the last step of a pipeline and the first step of a collection. Upstream, usage events have been rated, allowances netted, commitments and credits applied ([The Bill Pipeline](/books/hosting-and-cloud/metering-and-rating#the-bill-pipeline)); the invoice run turns that into numbered, taxed documents for every account at once. Downstream, the payment either arrives or doesn't, and if it doesn't, the provider is in an unusual position for a creditor: it is still supplying the service, by the second, to a customer who isn't paying, and the resources it would stop are the customer's running business. A shop that isn't paid stops shipping. A cloud that isn't paid has to decide when to stop a database, and when to delete it.

So the shapes differ from other subscription businesses. Usage is billed in arrears, prepaid hosting terms in advance and enterprise contracts on net terms, sometimes all on one account. New or risky accounts are charged mid-cycle when their balance crosses a threshold, because a month of unbilled GPU time is a fraud loss before it is a receivable. And the end of dunning is not a lapsed subscription but a sequence of holds with clocks: no new resources, then stopped resources, then termination, then deletion, each of which the customer should be able to see coming. This chapter covers the invoice run, payment terms, thresholds, failed payments, the clocks providers publish, data after termination and the reseller cascade. The invoice document itself, numbering, applications and receipts are the Payments volume's ([Checkout, Invoicing & Payment Links](/books/payments/checkout-and-invoicing#the-invoice-lifecycle)); card retries and updaters are [Stored Cards & Recurring Billing](/books/payments/stored-credentials#declines-and-the-rules-on-retrying); the standing ladder is [Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing). This chapter adds what infrastructure does to them.

## How the Providers Do It

Published billing and collection mechanics, as of October 2026:

| Provider | Invoice cadence | Terms and late interest | Mid-cycle charges | Failed payment and the clocks published |
| --- | --- | --- | --- | --- |
| **AWS** | Monthly; the default payment method is charged automatically "at the beginning of each month"; ACH debits initiated within 10 days of the month's start | 1.5% a month (or the lawful maximum) on late payments; payment without setoff (Customer Agreement 3.1) | AWS may bill more often than monthly if it suspects fraud or non-payment risk (3.1) | Suspension for payment default (4.1); fees accrue during suspension and no SLA credits (4.2); 30 days after termination before content is removed, retrievable only once paid (5.3) |
| **Azure** (pay-as-you-go) | Monthly | Pay by card in the portal's Settle balance, or by wire for invoice payers | Not published | Email and portal alert, then Past Due (all operations work), Warned (read and delete only), Disabled (VMs deallocated, storage read-only) for 1 to 90 days by type, then deletion; unpaid service is canceled and data deleted 90 days after it ends |
| **Google Cloud** | Self-serve monthly billing collected on the 2nd; invoiced billing by the 5th business day of the next month | Payment Due Date from the order form, or 30 days from invoice; 1.5% a month on late payments; collection costs (Terms 2.4, 14.19) | Threshold billing: charged on the 1st and whenever the balance reaches the threshold (a $100 example for new accounts), raised automatically for accounts in good standing | Backup card tried on decline; without a valid payment method the billing account is suspended and services stop in every linked project; suspension for late payment (2.4) |
| **DigitalOcean** | Invoiced and charged on the 1st for the prior month | Due on the 1st | Auto-charge when the balance reaches the tier amount: $25 (tier 1, no prepay) up to $4,000 (tier 5) | Past due: account on hold, no new resources; then suspended, resources powered down; then resources may be permanently deleted. "DigitalOcean does not publish fixed timelines" |
| **Hetzner** | In arrears for the previous month; no invoice until the amount exceeds €10 (or after three months) | "Due immediately", 10 days to settle before a reminder; interest from the due date at the statutory rate | Not published | Reminders and warnings, then locking, cancellation or account deletion "on a case-by-case basis", earlier for new customers; restored data not guaranteed |
| **Vercel** (Pro) | Charged at the start of each cycle: seats and add-ons for the next 30 days, usage for the last 30 | "Payments must be made upon invoice issuance"; no extensions | Partial invoices when on-demand usage crosses an unpublished threshold or spikes unusually, since June 10, 2026 | Overdue: no new projects, members or redeploys; a renewal unpaid for 14 days pauses all deployments; a new subscription's first payment must succeed within 24 hours |
| **Netlify** | Subscription paid in advance for each term | Self-serve agreement | Credit packs and auto recharge on paid plans | Customer data available for retrieval for 30 days after termination, then may be deleted |
| **Cloudflare** | Monthly or annual plan renewals | Card on file | Not published | Failed renewal retried five times over five days, then the account is downgraded to Free after the 5-day grace; the website isn't suspended, paid features stop; an overdue balance blocks purchases and upgrades |
| **Twilio** | Prepaid balance by card; invoicing by approval | Invoices due within 30 days; after 15 days' uncured notice, the lesser of 1.5% a month or the lawful maximum (3.3.2) | Auto-recharge triggers on the prepaid balance | Suspension when funds run out or a charge is declined (3.3.1), messages failing with error 30002; no suspension for a good-faith dispute raised within 60 days (3.3.3) |
| **Namecheap** | Hosting invoiced 7 days before the billing date | Due on the billing date | Not published | Charged on the billing date, retried 2 and 5 days later; unpaid hosting suspended and cancelled 7 days after the billing date (23 days for reseller packages) |

GoDaddy's help and legal pages refused the fetcher, so I state nothing about its invoice or suspension clocks.

Three patterns:

- **Arrears for usage, advance for terms, and a lever to bill early.** Every cloud bills the month's usage after the month; Vercel and Netlify bill the subscription part in advance; AWS reserves the right to bill more often on risk, and Google, DigitalOcean and Vercel do it automatically by threshold. The threshold is a credit limit expressed as a billing rule.
- **The first rung stops new spending, not running things.** DigitalOcean's hold, Azure's Past Due, Vercel's overdue restrictions and Cloudflare's overdue balance all block purchases or new resources while leaving the customer's sites up. Stopping what runs comes later, and deleting later still.
- **Clocks are published by some and withheld by others.** Namecheap, Vercel, Cloudflare and Azure give numbers; DigitalOcean and Hetzner say explicitly that they don't. The customers who need the numbers most are the ones about to lose data.

## How It Got Here

Billing moved from the hosting invoice to the usage statement as the unit of sale shrank:

- **Prepaid terms.** Shared hosting has sold months and years upfront from the start, so an unpaid renewal simply wasn't renewed and the account suspended; the intro-term model in [Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law#terms-intro-prices-and-the-renewal) is that shape today.
- **Arrears by the hour, then by the second.** Clouds billed instance-hours after the month. On October 2, 2017 AWS moved Linux EC2 instances and EBS volumes to per-second billing with a 60-second minimum, "effective immediately" for running instances too. The finer the unit, the larger the share of revenue that is unbilled at any moment, and the more the provider extends credit to every account it doesn't charge in advance.
- **Thresholds as credit control.** Google Cloud's threshold billing charges new self-serve accounts whenever the balance reaches a threshold and raises it as payment history builds; DigitalOcean ties its mid-month auto-charge to a tier with a prepayment; Vercel added partial invoices for Pro teams on June 10, 2026, triggered by a threshold or by usage that "does not match your normal pattern." Each answers the same loss: usage run up on a card that will fail, or a key that was stolen ([Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#stolen-keys)).
- **Invoiced billing for the large accounts.** Above a size, card billing stops working: Twilio refuses cards once fees exceed $8,000 in a month and Google Cloud's invoiced billing expects at least $40,000 a year of spend. Those accounts pay on net terms with contractual late interest, and AWS, Google and Twilio all write 1.5% a month.
- **Published deletion clocks.** Azure's 90-day deletion, Google's 30-day recovery plus at most 180 days under its data processing addendum, Netlify's 30-day retrieval and AWS's 30-day post-termination period are contract or documentation terms. Where they exist they let the customer plan an exit; where they don't, the customer learns them by losing data.

## Invoice Runs and Cadence

An invoice run is a batch job with a period, a cutoff and a seller: for every account billed by one selling entity ([Seller Entities](/books/hosting-and-cloud/tax#seller-entities)) whose cycle ends, it gathers what the pipeline produced for the period and drafts an invoice. Four kinds of run share one engine:

| Run | What it bills | When |
| --- | --- | --- |
| **Cycle** | Usage in arrears for the period, plus recurring charges in advance for the next period where the plan bills that way | On the cycle date (the 1st for DigitalOcean, the start of the cycle for Vercel) |
| **Threshold (partial)** | Usage accrued so far, when it crosses the account's threshold | Whenever crossed, possibly several times a month |
| **Prepaid term** | A hosting or domain term upfront at renewal | `charge_lead_days` before the term ends ([How to Build It](/books/hosting-and-cloud/renewals-and-cancellation-law#how-to-build-it) in the renewal chapter) |
| **Final** | Everything outstanding at cancellation or closure | Azure closes the billing cycle within 72 hours of the last subscription's cancellation |

The rules that keep runs correct:

- **A run has a usage cutoff.** Usage received after the cutoff for the period goes to the next run as an adjustment line, never into an issued invoice ([Late, Duplicate and Corrected Usage](/books/hosting-and-cloud/metering-and-rating#late-duplicate-and-corrected-usage)). Cost data in consoles lags too, which is why a final invoice arrives days after the last usage.
- **One line per SKU and price version, not per event.** A month of per-second VM usage is one line with its quantity and unit price; a price change mid-month splits it into two lines, each at its own price ([Price Changes and Notice](/books/hosting-and-cloud/pricing-catalogs#price-changes-and-notice)). The line amount is rounded once from the unrounded rated amounts ([Rounding](/docs/payments/money#rounding)).
- **Lines are tagged by kind.** Usage, recurring charge, pass-through fee ([Pass-Through Fees](/books/hosting-and-cloud/metering-and-rating#pass-through-fees)), commitment benefit, credit, commitment shortfall, adjustment and tax are `invoice_lines.line_kind` values from the foundation, so the invoice shows the order of the pipeline: what was used, what the commitment and credits took off, what is owed.
- **Partial invoices never double bill.** Vercel states the rule: partial invoices and the end-of-cycle invoice add up to the total. In the data, rated usage is marked with the invoice line that billed it, and the cycle run skips anything already marked.
- **Tax is computed per line at finalization,** by the seller entity's registrations ([Tax on Hosting & Cloud](/books/hosting-and-cloud/tax)), and the invoice is immutable after that ([Tax Is a Quote Until the Invoice Finalizes](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes)). Vercel says the same of billing details: changes apply to future invoices only.
- **Runs are idempotent and resumable.** A run keyed by seller, kind and period that dies halfway resumes; an account already drafted in the run is skipped. Running the whole customer base on one day is a load spike, which is why Hetzner changed its customers' invoice dates on October 1, 2026, to spread the work across the month.

## Payment Terms and Late Interest

How an account pays is a contract fact on the account, set by billing mode: `self_serve` accounts are charged automatically, `invoiced` accounts get an invoice with net terms, `billed_by_parent` accounts are their reseller's problem ([Payer, Scope and Person](/books/hosting-and-cloud/accounts-and-resellers#payer-scope-and-person)).

- **Net terms come from the contract.** Google's default is 30 days from the invoice when the order form says nothing; Twilio's invoices are due in 30 days; Hetzner's are due immediately, with 10 days before a reminder; Vercel allows no delay at all. The due date is computed at finalization and stored ([B2B Receivables](/books/payments/checkout-and-invoicing#b2b-receivables)).
- **Late interest is a rate and a trigger.** AWS and Google charge up to 1.5% a month from the due date, Twilio only after 15 days' uncured written notice, Hetzner at the statutory rate under section 288 BGB, without a reminder. Interest is an adjustment line on a later invoice, never a change to the late one, and it is a rule per contract version.
- **Disputes stop the clock.** Google excludes amounts under a good-faith dispute submitted before the due date from late payment; Twilio won't suspend for disputed fees raised in writing within 60 days. A dispute is a record against invoice lines that pauses interest and dunning for those lines only; a card chargeback is the Payments volume's ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)), and an account with an open chargeback is not dunned for the same money.
- **No setoff.** AWS requires payment "without setoff or counterclaim": an SLA credit the customer believes it is owed is claimed through the SLA process ([SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits)) and arrives as a credit, not as a short payment.

## Thresholds and Mid-Cycle Charges

A threshold charge is the provider choosing not to extend a month of credit. The design questions:

- **Per-account, earned, and stored.** Google starts new accounts at a low threshold and raises it automatically as threshold payments succeed; DigitalOcean's tier sets both a prepayment and an auto-charge amount ($25 at tier 1 with no prepay, up to $4,000 at tier 5). Either way the threshold is a dated value on the account with its reason, not a constant.
- **Usage triggers, not the calendar.** The rating pipeline checks accrued unbilled amounts against the threshold as it rates, and a crossing enqueues a threshold run for that account. Vercel also triggers on usage that doesn't match the account's pattern, which is anomaly detection feeding billing ([Anomaly Detection](/books/hosting-and-cloud/finops-and-surprise-bills#anomaly-detection)).
- **A failed threshold charge is an early warning.** Vercel pauses new deployments and some billable features after multiple unpaid partial invoices. A new account that can't pay $25 in the middle of its first month is either a broken card or a fraudster, and the hold that follows is `no_new_resources`, cheap to lift.
- **Thresholds are not spend caps.** A threshold collects money; a cap stops usage ([Spend Caps and Pauses](/books/hosting-and-cloud/finops-and-surprise-bills#spend-caps-and-pauses); [Free Tiers, Credits & Startup Programs](/books/hosting-and-cloud/free-tiers-and-credits)). A customer asking "why was I charged twice this month" needs the partial invoice to say which usage it covers.

## Failed Payments and Dunning

The general shape, retries, notices and grace, is the playbook's ([Dunning](/docs/payments/subscriptions#dunning)), and the card rules (Visa's reattempt limits, Mastercard's Merchant Advice Codes, account updaters and network tokens) are the Payments volume's ([Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying), [Keeping the Card Alive](/books/payments/stored-credentials#keeping-the-card-alive)). What infrastructure adds:

- **A schedule per billing mode.** A self-serve card account dunned by retries (Namecheap at days 2 and 5, Cloudflare five times over five days) and an invoiced enterprise account dunned by statements and calls (Twilio's 15-day notice before interest and suspension) need different schedules, both stored as rows with offsets from the due date.
- **The backup method before the hold.** Google tries the backup card on a decline; DigitalOcean's auto-reload tries the backup method second. A second payment method is cheaper than any notice.
- **Each step names an effect and a clock.** A dunning step either retries, notifies, or adds an `account_holds` row with an effect from the foundation (`no_new_resources`, `read_only`, `stop_resources`, `full_suspension`), and every notice says what the next step is and when. Vercel's "within 14 days ... all deployments on your account will be paused" is the model sentence.
- **Partial service beats total suspension.** Cloudflare's downgrade to Free keeps the website up and removes paid features; Azure's Past Due keeps everything running; DigitalOcean's hold blocks only new resources. Every notch between "fine" and "off" is time for the customer to pay without an outage.
- **Payment restores at once.** AWS, DigitalOcean and Hetzner reactivate on payment; Hetzner's caveat that a termination notice can't be revoked once issued is the reason termination is a separate, later step. A payment event lifts every non-payment hold on the account and closes the case in one transaction.
- **Involuntary churn is its own metric,** reported apart from cancellations ([Operating Metrics](/books/hosting-and-cloud/operating-metrics#customers-churn-and-renewal)), because its fix is billing, not product.

### Worked examples

As of October 2026, from the providers' pages:

- **A hosting renewal at Namecheap.** Invoice generated on day -7; card charged on the billing date, day 0; retries on days 2 and 5; unpaid, the account is suspended and cancelled on day 7. A reseller package gets 23 days.
- **A plan renewal at Cloudflare.** The charge fails on day 0 and is retried five times over five days; on day 5 the account drops to Free. The zone keeps serving; paid features stop, and the customer resubscribes to each product to get them back.
- **A Vercel Pro renewal.** The start-of-cycle charge fails; the team immediately can't create projects, add members or redeploy; on day 14 every deployment pauses.
- **A $10,000 invoice paid a month late under the AWS or Google terms.** 1.5% a month is $150 of interest for the month, billed as an adjustment line on the next invoice. Under Twilio's terms the same interest starts only after a written notice and 15 days without a cure.
- **A new DigitalOcean team at tier 1.** Its balance reaches $25 mid-month and the card is charged; if that charge fails, the account goes on hold before the month ends, with no new resources until it pays.

## Suspension and Deletion Clocks

[Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing) has the ladder and the clocks AWS, Azure, Google Cloud and DigitalOcean publish; the rows above add Hetzner, Vercel, Netlify, Cloudflare, Twilio and Namecheap. Read together, the published clocks fall into a few shapes:

| Shape | Who | What the customer can count on |
| --- | --- | --- |
| **Fixed days, published** | Namecheap (suspend and cancel 7 days after the billing date), Vercel (14 days to pause), Cloudflare (5-day grace), Azure (disabled 1 to 90 days by type, deletion at 90 days) | A date |
| **Contractual minimum after termination** | AWS (30 days, content retrievable once paid), Netlify (30 days' retrieval), Google (30-day recovery, deletion within 180 days after it) | A floor for data, not for service |
| **Stages without dates** | DigitalOcean, Hetzner | An order of events and a promise of email, no dates |

Two rules make the clocks safe:

- **Suspension clocks and deletion clocks are different clocks.** Stopping resources ends the outage risk to the provider's money; deleting data ends the customer's ability to recover. A provider that runs them on one timer deletes data a customer would have paid to retrieve. AWS keeps them separate: fees accrue during suspension, content survives 30 days past termination.
- **Every clock is stored on the hold.** The hold that stops resources carries when termination will happen and when data will be deleted, so the notice, the console banner and the support agent read the same dates, and changing the policy doesn't silently change the date a customer was told. Billing state is not the only input: holds for abuse, fraud and legal orders carry their own clocks ([Abuse on Infrastructure](/books/hosting-and-cloud/abuse-on-infrastructure#three-tiers-of-service)).

## Data After Termination

What survives the end of a contract is a term (a product the provider shuts down has its own export window: [Data Export and Getting Out](/books/hosting-and-cloud/migrations-and-end-of-life#data-export-and-getting-out)), and the published ones, as of October 2026:

- **AWS:** for 30 days after termination (unless AWS terminated for cause under 5.2(b)) AWS won't delete content as a result of termination, and retrieval requires all amounts paid; a closed account has a 90-day post-closure period before content is deleted ([Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing)).
- **Azure:** a cancelled subscription's data is kept 30 to 90 days, without charge, and the subscription is deleted automatically 90 days after cancellation; an unpaid subscription's data is deleted 90 days after the service ends.
- **Google Cloud:** customer data is to be retrieved during the term; after a recovery period of up to 30 days, Google deletes it "as soon as reasonably practicable and within a maximum period of 180 days," subject to legal holds.
- **Netlify:** 30 days of electronic retrieval, then deletion is allowed.
- **Hetzner:** "We do not guarantee that you will be able to restore your data" after a lock or cancellation, and customers are responsible for their own backups.
- **DigitalOcean:** deleted resources "cannot be recovered"; an account deactivated without a purge can be reactivated with its history.
- **Vercel:** deleting a team removes its invoice history, so the customer has to download invoices first.

Design consequences:

- **A retrieval window means read access, not service.** During it the account is `read_only`: the customer can download, snapshot or export, and nothing new runs. Egress during the window is the switching question ([Egress & Switching](/books/hosting-and-cloud/egress-and-switching)); Azure, for instance, credits egress for customers who give notice and leave.
- **Unpaid and retrievable can conflict.** AWS conditions retrieval on payment. A provider that does the same should say so in the termination notice, with the amount, because a customer who can't get their data won't pay to see whether they can.
- **Deletion is a job with evidence.** The deletion run records what was deleted and when, against the hold's `delete_data_after`, and backups age out on their own schedule, stated separately ([Backups](/docs/architecture/data-retention#backups); [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations#retention-and-placement)).
- **Billing and tax records outlive the data.** Invoices, consent and identifier history are kept for their own retention periods after the customer's content is gone ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).

## Resellers and the Cascade

A reseller's unpaid invoice is the provider's receivable, and its customers' resources are the provider's only lever. The rules from [Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing) (holds cascade down, never up; the narrowest hold first) become a billing workflow:

- **Dun the payer, warn the users.** The reseller gets the dunning notices; its sub-accounts' users get a notice before anything of theirs stops, naming the reseller as the party to contact. A white-label end customer who discovers the reseller didn't pay only when the site goes down calls the provider anyway.
- **Cascade on the strong effects only.** A `no_new_resources` hold on a reseller can cascade at once; `stop_resources` on its customers should wait for a longer clock than a direct account gets, because the people harmed haven't been asked to pay. Namecheap's 23 days for reseller packages against 7 for its own hosting is that idea expressed as a number.
- **The reseller's own collection is separate.** A reseller dunning its customers in its own billing system (or from the pro forma data AWS Billing Conductor produces for channel partners) doesn't drive the provider's holds; a sub-account the reseller asks the provider to suspend is a `customer_request` hold by the reseller, recorded as such. Twilio's terms let it suspend services when the customer doesn't pay its reseller, and Azure lets partners suspend or cancel for non-payment: in both, the partner's instruction is the evidence.
- **Pass-through stays owed.** Registry and carrier fees already paid for a reseller's customers are owed whatever the reseller's dispute with its own customers, which is why domain renewals under a reseller are charged to the reseller before the registry is paid.

## The Alternatives

| Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- |
| **Postpaid monthly in arrears, card on file** | Low friction; pay for what was used | A month of credit to every account; fraud and bad debt from stolen cards and keys | Bad-debt and fraud losses | AWS, Azure pay-as-you-go, Google monthly billing, Hetzner |
| **Postpaid with thresholds** | Caps exposure for new and risky accounts; earns trust with history | Surprise mid-month charges; more invoices to explain | Extra payment fees and support | Google threshold billing, DigitalOcean tiers, Vercel partial invoices |
| **Prepaid balance** | No credit risk; instant suspension when empty | Outages when the balance hits zero; customers must watch it | Auto-recharge machinery | Twilio, Netlify credit packs |
| **Prepaid term** | Cash upfront, no collection during the term | Renewal law; refunds; failure concentrated at renewal | Notice infrastructure | Shared hosting, domains |
| **Invoiced net terms** | Fits enterprise procurement; large accounts | Receivables, late payers, collections, disputes | Credit checks, AR staff, interest terms | Google invoiced billing, Twilio invoicing, enterprise contracts at every cloud |

## My Default

My default for a developer cloud is postpaid monthly billing in arrears for usage with a per-account threshold that starts low and rises with payment history, recurring charges billed in advance on the same invoice, and invoiced net-30 terms only by contract above a spend floor. I'd dun self-serve accounts with a backup method first, then a small number of retries spaced over days, then holds that escalate on published clocks: `no_new_resources` on the first failure, `stop_resources` after notices and a stated grace period of about two weeks, termination after another stated period, and deletion no sooner than 30 days after termination with read-only retrieval in between. Every notice names the next step and its date; every hold stores its clocks.

I'd publish those clocks in the docs, as Namecheap, Vercel and Azure do. What would change this: a product whose usage can run up faster than any threshold can collect, such as GPU instances or SMS to premium destinations, where prepaid balances or hard caps (Twilio's model) are worth the outage risk; or a hosting business on prepaid terms, where dunning is concentrated at renewal and the clocks are the renewal chapter's.

## How to Build It

The chapter adds invoice runs, dunning schedules, steps and cases, and clock columns on holds to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), using the Payments volume's invoices, lines, credit notes and applications ([How to Build It](/books/payments/checkout-and-invoicing#how-to-build-it)).

```sql
-- Invoice runs --------------------------------------------------------------

CREATE TABLE invoice_runs (              -- one batch: a seller, a kind, a period
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_merchant_id UUID NOT NULL REFERENCES merchants (id),  -- the selling entity
  run_kind           TEXT NOT NULL CHECK (run_kind IN ('cycle', 'threshold', 'prepaid_term',
                       'final', 'adjustment')),
  billing_period     TSTZRANGE NOT NULL,
  account_id         UUID REFERENCES accounts (id),   -- set for threshold and final runs
  usage_cutoff_at    TIMESTAMPTZ NOT NULL,  -- usage received later goes to the next run
  status             TEXT NOT NULL CHECK (status IN ('building', 'built', 'finalizing',
                       'finalized', 'failed')),
  invoices_built     INT NOT NULL DEFAULT 0,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at        TIMESTAMPTZ,
  idempotency_key    TEXT NOT NULL UNIQUE   -- seller + kind + period (+ account)
);

ALTER TABLE invoices
  ADD COLUMN invoice_run_id    UUID REFERENCES invoice_runs (id),
  ADD COLUMN invoice_kind      TEXT NOT NULL DEFAULT 'cycle' CHECK (invoice_kind IN ('cycle',
                                 'partial', 'prepaid_term', 'final', 'adjustment')),
  ADD COLUMN collection_method TEXT NOT NULL DEFAULT 'charge_automatically'
                                 CHECK (collection_method IN ('charge_automatically',
                                 'send_invoice', 'billed_by_parent')),
  ADD COLUMN late_interest_monthly NUMERIC(6,4),   -- 0.0150 under the contract version
  ADD CONSTRAINT invoices_one_per_run UNIQUE (account_id, invoice_run_id);

ALTER TABLE invoice_lines                 -- usage lines need fractional unit prices
  ADD COLUMN usage_quantity   NUMERIC,              -- billable units, after the allowance
  ADD COLUMN unit_price       NUMERIC(24,12),       -- minor units per unit, from the price version
  ADD COLUMN price_version_id UUID REFERENCES price_versions (id);
-- invoice_lines.credit_grant_id, which ties a credit line to its grant, is added by
-- Free Tiers, Credits & Startup Programs.

ALTER TABLE accounts
  ADD COLUMN net_days               SMALLINT,       -- invoiced accounts; null: due on issue
  ADD COLUMN auto_charge_threshold  BIGINT,         -- minor units; raised with payment history
  ADD COLUMN threshold_currency     CHAR(3);

-- Dunning -------------------------------------------------------------------

CREATE TABLE dunning_schedules (         -- a named, dated ladder per billing mode
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT NOT NULL,           -- 'self_serve_card', 'invoiced_net30', 'reseller'
  billing_mode  TEXT NOT NULL CHECK (billing_mode IN ('self_serve', 'invoiced',
                  'billed_by_parent')),
  valid_during  TSTZRANGE NOT NULL,      -- policy changes are new versions
  UNIQUE (code, valid_during)
);

CREATE TABLE dunning_steps (
  schedule_id   UUID NOT NULL REFERENCES dunning_schedules (id),
  step_no       SMALLINT NOT NULL,
  after_days    SMALLINT NOT NULL,       -- from the due date
  action        TEXT NOT NULL CHECK (action IN ('retry', 'retry_backup_method', 'notify',
                  'hold', 'terminate', 'delete_data', 'collections', 'write_off')),
  hold_effect   TEXT CHECK (hold_effect IN ('no_new_resources', 'read_only',
                  'stop_resources', 'full_suspension')),
  notify_template TEXT,                  -- states the next step and its date
  PRIMARY KEY (schedule_id, step_no),
  CHECK ((action = 'hold') = (hold_effect IS NOT NULL))
);

CREATE TABLE dunning_cases (             -- one per unpaid invoice
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_id     UUID NOT NULL UNIQUE REFERENCES invoices (id),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  schedule_id    UUID NOT NULL REFERENCES dunning_schedules (id),
  due_at         TIMESTAMPTZ NOT NULL,   -- the anchor every step counts from
  next_step_no   SMALLINT NOT NULL DEFAULT 1,
  next_action_at TIMESTAMPTZ,            -- null when closed or paused
  status         TEXT NOT NULL CHECK (status IN ('open', 'paused_dispute', 'paid',
                   'written_off', 'closed')),
  closed_at      TIMESTAMPTZ
);
CREATE INDEX dunning_cases_due_idx ON dunning_cases (next_action_at) WHERE status = 'open';

CREATE TABLE dunning_events (            -- what each step did; a replay is a no-op
  case_id        UUID NOT NULL REFERENCES dunning_cases (id),
  step_no        SMALLINT NOT NULL,
  action         TEXT NOT NULL,
  result         TEXT NOT NULL CHECK (result IN ('succeeded', 'declined', 'sent',
                   'hold_added', 'skipped')),
  payment_id     UUID REFERENCES payments (id),
  hold_id        UUID REFERENCES account_holds (id),
  performed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (case_id, step_no)
);

-- Clocks on holds: what happens next, and when, as the customer was told ----
ALTER TABLE account_holds
  ADD COLUMN dunning_case_id   UUID REFERENCES dunning_cases (id),
  ADD COLUMN stop_resources_at TIMESTAMPTZ,  -- when running resources stop, if unpaid
  ADD COLUMN terminate_at      TIMESTAMPTZ,  -- when the contract or resources are terminated
  ADD COLUMN retrieval_until   TIMESTAMPTZ,  -- read-only access for export ends
  ADD COLUMN delete_data_after TIMESTAMPTZ,  -- earliest deletion; never before retrieval_until
  ADD COLUMN last_notice_at    TIMESTAMPTZ,
  ADD CONSTRAINT account_holds_clock_order CHECK (delete_data_after IS NULL
    OR retrieval_until IS NULL OR delete_data_after >= retrieval_until);
```

A cycle run drafts one invoice per account with unbilled rated usage in the period, then builds usage lines from `rated_usage` at step 6 of the pipeline. Steps 3 to 5 (allowances, commitments, credits) have already run: `rated_usage.amount` is the unrounded charge for the quantity beyond `included_quantity`, commitment benefits are in [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#how-to-build-it)' `commitment_drawdowns`, and credits are drawn from `credit_grants` here.

```sql
-- 1. Draft invoices for the run ($1 = run id) -----------------------------------
INSERT INTO invoices (merchant_id, customer_id, account_id, invoice_run_id, invoice_kind,
                      status, currency, billing_period, collection_method, net_days,
                      idempotency_key)
SELECT r.seller_merchant_id, a.payments_customer_id, a.id, r.id, 'cycle', 'draft',
       ru.currency, r.billing_period,
       CASE a.billing_mode WHEN 'invoiced' THEN 'send_invoice'
                           WHEN 'billed_by_parent' THEN 'billed_by_parent'
                           ELSE 'charge_automatically' END,
       a.net_days, r.idempotency_key || ':' || a.id
FROM invoice_runs r
JOIN accounts a ON a.seller_merchant_id = r.seller_merchant_id
JOIN rated_usage ru ON ru.account_id = a.id
 AND ru.invoice_line_id IS NULL
 AND r.billing_period @> lower(ru.rated_during)
WHERE r.id = $1
GROUP BY r.seller_merchant_id, a.payments_customer_id, a.id, r.id, ru.currency,
         r.billing_period, a.billing_mode, a.net_days, r.idempotency_key
ON CONFLICT (account_id, invoice_run_id) DO NOTHING;   -- a resumed run skips drafted ones

-- 2. Usage lines: one per account, SKU and price version, rounded once ----------
INSERT INTO invoice_lines (invoice_id, position, description, quantity, unit_amount, amount,
                           line_kind, sku_id, price_version_id, usage_quantity, unit_price,
                           service_period, tax_code)
SELECT i.id,
       ROW_NUMBER() OVER (PARTITION BY i.id ORDER BY s.code, pv.id),
       s.code || ' (' || to_char(lower(i.billing_period), 'YYYY-MM') || ')',
       1, ROUND(SUM(ru.amount))::bigint, ROUND(SUM(ru.amount))::bigint,
       CASE WHEN s.pass_through IS NULL THEN 'usage' ELSE 'pass_through' END,
       s.id, pv.id, SUM(ru.quantity - ru.included_quantity), pv.unit_price,
       i.billing_period, p.tax_code
FROM invoices i
JOIN rated_usage ru ON ru.account_id = i.account_id
 AND ru.invoice_line_id IS NULL AND ru.currency = i.currency
 AND i.billing_period @> lower(ru.rated_during)
JOIN skus s ON s.id = ru.sku_id
JOIN products p ON p.id = s.product_id
JOIN price_versions pv ON pv.id = ru.price_version_id
WHERE i.invoice_run_id = $1 AND i.status = 'draft'
GROUP BY i.id, i.billing_period, s.id, s.code, s.pass_through, pv.id, pv.unit_price, p.tax_code
HAVING ROUND(SUM(ru.amount)) <> 0;

-- 3. Mark the usage billed, so partial and cycle runs never bill it twice ------
UPDATE rated_usage ru SET invoice_line_id = il.id
FROM invoice_lines il
JOIN invoices i ON i.id = il.invoice_id AND i.invoice_run_id = $1
WHERE ru.account_id = i.account_id AND ru.sku_id = il.sku_id
  AND ru.price_version_id = il.price_version_id AND ru.invoice_line_id IS NULL
  AND i.billing_period @> lower(ru.rated_during);

-- 4. Commitment benefits as negative lines (Commitments, Discounts & Marketplaces)
INSERT INTO invoice_lines (invoice_id, position, description, quantity, unit_amount, amount,
                           line_kind, service_period)
SELECT il.invoice_id, 1000 + ROW_NUMBER() OVER (PARTITION BY il.invoice_id ORDER BY cd.commitment_id),
       'Commitment benefit', 1, -ROUND(SUM(cd.benefit_amount))::bigint,
       -ROUND(SUM(cd.benefit_amount))::bigint, 'credit', MAX(il.service_period)
FROM commitment_drawdowns cd
JOIN rated_usage ru ON ru.id = cd.rated_usage_id
JOIN invoice_lines il ON il.id = ru.invoice_line_id
JOIN invoices i ON i.id = il.invoice_id AND i.invoice_run_id = $1
GROUP BY il.invoice_id, cd.commitment_id;

-- 5. Credits: Free Tiers, Credits & Startup Programs' allocation, one line per grant --
INSERT INTO invoice_lines (invoice_id, position, description, quantity, unit_amount, amount,
                           line_kind, credit_grant_id)
SELECT i.id, 2000 + ROW_NUMBER() OVER (PARTITION BY i.id ORDER BY ca.credit_grant_id),
       'Credit applied', 1, -ROUND(SUM(ca.amount))::bigint, -ROUND(SUM(ca.amount))::bigint,
       'credit', ca.credit_grant_id
FROM invoices i
CROSS JOIN LATERAL credit_allocations(i.account_id, i.billing_period) ca
WHERE i.invoice_run_id = $1
GROUP BY i.id, ca.credit_grant_id
HAVING ROUND(SUM(ca.amount)) > 0;
-- credit_allocations walks grants soonest-expiring first, respects each grant's scope and
-- exclusions, and works on amounts after commitment benefits, so step 4 must run first.
-- Then tax per line (Tax on Hosting & Cloud), totals, a number and status 'open'
-- in the finalization transaction (Payments volume), and the run moves to 'finalized'.
```

The dunning job claims due cases, performs the step once, and schedules the next. A hold step writes a new `account_holds` row with every later clock computed from the schedule, so the customer's notice and the hold agree:

```sql
WITH due AS (
  SELECT c.id, c.account_id, c.invoice_id, c.due_at, c.schedule_id, s.step_no, s.action,
         s.hold_effect
  FROM dunning_cases c
  JOIN dunning_steps s ON s.schedule_id = c.schedule_id AND s.step_no = c.next_step_no
  WHERE c.status = 'open' AND c.next_action_at <= NOW()
  ORDER BY c.next_action_at
  LIMIT 500
  FOR UPDATE OF c SKIP LOCKED
), held AS (
  INSERT INTO account_holds (account_id, reason, effect, invoice_id, dunning_case_id,
                             valid_during, created_by, cascade_to_sub_accounts,
                             stop_resources_at, terminate_at, retrieval_until,
                             delete_data_after)
  SELECT d.account_id, 'non_payment', d.hold_effect, d.invoice_id, d.id,
         tstzrange(NOW(), NULL), 'system:dunning', a.kind = 'reseller',
         d.due_at + make_interval(days => (SELECT after_days FROM dunning_steps
           WHERE schedule_id = d.schedule_id AND hold_effect = 'stop_resources')),
         d.due_at + make_interval(days => (SELECT after_days FROM dunning_steps
           WHERE schedule_id = d.schedule_id AND action = 'terminate')),
         d.due_at + make_interval(days => (SELECT after_days FROM dunning_steps
           WHERE schedule_id = d.schedule_id AND action = 'delete_data')),
         d.due_at + make_interval(days => (SELECT after_days FROM dunning_steps
           WHERE schedule_id = d.schedule_id AND action = 'delete_data'))
  FROM due d JOIN accounts a ON a.id = d.account_id
  WHERE d.action = 'hold'
  RETURNING id, dunning_case_id
), logged AS (
  INSERT INTO dunning_events (case_id, step_no, action, result, hold_id)
  SELECT d.id, d.step_no, d.action,
         CASE WHEN h.id IS NOT NULL THEN 'hold_added' ELSE 'sent' END, h.id
  FROM due d LEFT JOIN held h ON h.dunning_case_id = d.id
  WHERE d.action IN ('hold', 'notify')        -- retries log their payment result on completion
  ON CONFLICT (case_id, step_no) DO NOTHING
)
UPDATE dunning_cases c
SET next_step_no   = d.step_no + 1,
    next_action_at = (SELECT c.due_at + make_interval(days => n.after_days)
                      FROM dunning_steps n
                      WHERE n.schedule_id = c.schedule_id AND n.step_no = d.step_no + 1)
FROM due d
WHERE c.id = d.id;                             -- null next_action_at: the ladder is done
```

Notes on the sketch:

- **Runs are batches with keys.** `invoice_runs.idempotency_key` and the one-invoice-per-account-per-run constraint make a crashed run resumable; usage lines are built only from rated usage not yet marked, so a threshold run and a cycle run can't bill the same usage ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
- **One rounding, per line.** Unrounded `rated_usage.amount` is summed and rounded once per SKU and price version; the line carries the fractional `unit_price` and the billable `usage_quantity` for display, because the Payments volume's `unit_amount` is integer minor units.
- **The pipeline's order shows on the invoice.** Usage and pass-through lines, then commitment benefits, then credits (SLA credits arrive as `credit_grants` of kind `sla` from [SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits)), then tax. Credits never take an invoice below zero; what's left stays on the grant.
- **Holds escalate by adding rows.** A later step adds a stronger hold rather than editing the first; standing is the strongest hold in force, and payment closes them all with `lifted_reason = 'paid'`. The clocks on the hold are the dates the notice quoted.
- **Disputes pause, they don't close.** A dispute or an open chargeback sets the case to `paused_dispute` with a null `next_action_at`; resolution resumes it from the same step.
- **Closed periods stay closed.** Late usage and interest go on the next invoice as adjustment lines; a correction to an issued invoice is a credit note ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)), and an uncollectible balance is a write-off ([Write-Offs](/docs/payments/accounting#write-offs)).
- **Events:** `invoice_run.started`, `invoice_run.finalized`, `invoice.finalized`, `invoice.partial_issued`, `payment.failed`, `dunning.step_performed`, `account.held` (with its clocks), `account.released`, `resource.stopped_for_non_payment` and `account.data_deletion_scheduled` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to provisioning, notifications, the console banner and cost exports.

## Auditing

- **Every invoice traced to usage.** Each usage line's rated usage, price version and rating run, each credit line's grant, each commitment line's drawdowns, so a disputed bill is rebuilt from facts.
- **Every run.** Its period, cutoff, seller, the accounts it billed, the ones it skipped and why, and the usage it left for the next run.
- **Every step of every case.** Retries with their payment results and decline codes, notices with their send times and the dates they quoted, holds with their effects and clocks, pauses for disputes, and the payment that closed the case.
- **Clocks against actions.** Resources stopped no earlier than `stop_resources_at`, data deleted no earlier than `delete_data_after`, retrieval available until `retrieval_until`: a deletion before the stated date is the finding that matters most ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **The cascade.** Which sub-account holds came from a reseller's case, and the notices their users got before anything stopped.

## What This Means for the System You Build

- **Run invoices as keyed, resumable batches** per seller, kind and period, with a usage cutoff.
- **Build usage lines per SKU and price version from rated usage,** round once, and mark the usage billed.
- **Show the pipeline on the invoice:** usage, pass-through, commitment benefits, credits, then tax.
- **Store payment terms, thresholds and late interest as account and contract facts,** never constants.
- **Charge mid-cycle by threshold for new and risky accounts,** raising thresholds with payment history.
- **Dun by schedule rows,** with the backup method before any hold and every notice naming the next step and its date.
- **Escalate holds by adding rows with clocks,** stopping new spending first and running things later.
- **Keep suspension and deletion clocks separate,** with read-only retrieval in between.
- **Publish the clocks,** and give a reseller's customers notice before their resources stop.

## References

**Provider documentation and terms**

- [AWS Customer Agreement](https://aws.amazon.com/agreement/), monthly billing or more often on risk, 1.5% monthly late interest and no setoff (3.1), indirect taxes and withholding (3.2), suspension and its effect (4.1, 4.2), termination and the 30-day retrieval period (5.2, 5.3)
- [AWS: Making payments](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-making-a-payment.html), the automatic charge at the beginning of each month and ACH debits within 10 days
- [AWS: Announcing Amazon EC2 per-second billing](https://aws.amazon.com/about-aws/whats-new/2017/10/announcing-amazon-ec2-per-second-billing/), October 2, 2017, Linux instances and EBS volumes with a 60-second minimum
- [Microsoft Learn: Resolve a past-due balance](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/resolve-past-due-balance), past-due notices, settling the balance and deletion 90 days after unpaid service ends
- [Microsoft Learn: Azure subscription states](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/subscription-states), Past Due, Warned and Disabled for 1 to 90 days before deletion
- [Microsoft Learn: Cancel and delete your Azure subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/cancel-azure-subscription), the final bill within 72 hours, data kept 30 to 90 days, automatic deletion at 90 days, egress credit on exit, partners suspending for non-payment
- [Google Cloud: Billing cycle](https://docs.cloud.google.com/billing/docs/how-to/billing-cycle), monthly collection on the 2nd and threshold billing
- [Google Cloud: Payment methods](https://docs.cloud.google.com/billing/docs/how-to/payment-methods), backup methods and suspension of the billing account
- [Google Cloud: Invoiced billing](https://docs.cloud.google.com/billing/docs/how-to/invoiced-billing), eligibility including $40,000 a year of expected spend and invoice timing
- [Google Cloud Terms of Service](https://cloud.google.com/terms), invoices and the Payment Due Date (2.1, 14.19), late interest, collection costs and suspension (2.4), effect of termination (8.7)
- [Google Cloud: Data Processing Addendum](https://cloud.google.com/terms/data-processing-addendum), retrieval during the term, the 30-day recovery period and deletion within 180 days (6.2)
- [DigitalOcean: Billing](https://docs.digitalocean.com/platform/billing/), invoicing on the first of the month and auto-charge
- [DigitalOcean: Paying your bill](https://docs.digitalocean.com/platform/billing/pay-bills/), tier prepayments and auto-charge amounts
- [DigitalOcean: Late payments](https://docs.digitalocean.com/platform/billing/late-payments/), past due, suspension and deletion without published timelines
- [DigitalOcean: Deactivate accounts and purge account data](https://docs.digitalocean.com/platform/accounts/deactivate/), deactivation, purge and reactivation
- [Hetzner: Billing system](https://docs.hetzner.com/general/billing-and-account-management/billing-at-hetzner/billing-system-hetzner/), billing after use, the €10 minimum and the October 1, 2026 invoice date change
- [Hetzner: Late payments](https://docs.hetzner.com/general/others/late-payments-faqs), invoices due immediately, reminders, locking, cancellation, deletion and data not guaranteed
- [Hetzner: Terms and conditions](https://www.hetzner.com/legal/terms-and-conditions/), invoice frequency, interest from the due date and locking for non-payment
- [Vercel: Billing FAQ for the Pro plan](https://vercel.com/docs/plans/pro-plan/billing), charges at the start of the cycle, overdue restrictions, the 14-day and 24-hour deadlines, invoices deleted with a team
- [Vercel: Billing and invoices](https://vercel.com/docs/pricing/understanding-my-invoice), partial invoices, their triggers, payment and unpaid partials
- [Vercel: Threshold billing is now enabled for Pro teams](https://vercel.com/changelog/threshold-billing-is-now-enabled-for-pro-teams), June 10, 2026
- [Netlify: Self-Serve Subscription Agreement](https://www.netlify.com/legal/self-serve-subscription-agreement/), payment in advance and 30 days of data retrieval after termination
- [Cloudflare: Troubleshoot failed payments](https://developers.cloudflare.com/billing/troubleshoot/troubleshoot-failed-payments/), five retries over five days and the downgrade to Free after the grace period
- [Twilio: Terms of Service](https://www.twilio.com/en-us/legal/tos), prepaid and invoiced payment, no cards above $8,000 of fees a month, net 30, late interest after notice, suspension, disputes and reseller non-payment (3.3, 3.4)
- [Twilio: Error 30002, account suspended](https://www.twilio.com/docs/api/errors/30002), suspension for a negative balance, overdue payments or unavailable auto-recharge
- [Namecheap: Invoicing policies](https://www.namecheap.com/support/knowledgebase/article.aspx/9165/21/invoicing--suspension), invoice timing, retries and suspension and cancellation days for hosting and reseller packages
