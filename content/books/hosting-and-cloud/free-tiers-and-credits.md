+++
title = "Free Tiers, Credits & Startup Programs"
nav_title = "Free Tiers & Credits"
description = "Always-free tiers, trials and credit plans across clouds and hosts, startup credit programs, spending limits as hard caps, credit accounting and fraud exposure."
category = "Hosting & Cloud Industry"
order = 2190
part = "Metering and Billing"
tags = ["free-tier", "credits", "startup-programs", "spending-limits", "billing"]
+++

Every provider gives something away, and the shape of the gift decides what the billing system has to do. An always-free allowance is a negative price on the first units of a meter, every month, forever. A trial is a clock: free until a date or a balance runs out, then a decision. A credit is money the provider has promised and the customer can spend, with an expiry, a list of things it can't buy, and terms that void it if it was obtained by fraud. A startup program is a credit with a sponsor, often an investor, and a size that can run to six figures. The three models look alike on a pricing page and behave differently on the bill: allowances are applied when usage is rated, credits after commitments and before tax, and trials end in an account state change that has to stop resources, not just stop billing.

The gift is also the provider's largest fraud surface. A free account with a fresh card or none is the cheapest way to get compute that someone else pays for, and cryptomining on free capacity is common enough that the credit terms of AWS, Google Cloud and DigitalOcean each name it. This chapter surveys how providers give capacity away, traces how the model got here, covers startup programs and the competition questions they raise, spending limits as the only true hard cap, the accounting and fraud sides, and how credits are applied to a month of usage. It extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)'s `credit_grants` with `credit_programs` and `spending_limits`, and it fills step 5 of [the bill pipeline](/books/hosting-and-cloud/metering-and-rating#the-bill-pipeline).

## How the Providers Do It

| Provider | Free model, as of October 2026 | What happens at the edge |
| --- | --- | --- |
| **AWS** | Since July 15, 2025, new accounts choose a free plan or a paid plan; both get $100 in credits at sign-up and up to $100 more, $20 for each of five onboarding activities. The free plan includes over 30 always-free services and blocks some services | The free plan "expires after 6 months or when you exhaust your credits, whichever comes first"; the account then has 90 days to reopen by upgrading. On the paid plan, usage beyond credits bills at on-demand rates. Accounts created before July 15, 2025 keep the legacy tier of short-term trials, 12-month trials and always-free services |
| **Azure** | Free account: $200 of credit to use within 30 days, select services free for 12 months | A spending limit equal to the credit is on by default; when it is reached, resources are disabled for the period, VMs stopped and deallocated, storage read-only. Continuing means upgrading to pay-as-you-go, which removes the limit |
| **Google Cloud** | Free Trial: $300 of credit for 90 days for accounts that have never paid; Free Tier: monthly always-free limits such as one e2-micro VM in three US regions and 5 GB-months of regional storage | No automatic conversion: "You aren't billed" during the trial. At credit exhaustion or day 90, billing is disabled and resources stop, followed by a 30-day grace period before deletion. During the trial: no GPUs, no Marketplace, no quota increases, no Windows Server VMs, and cryptocurrency mining is prohibited |
| **Oracle Cloud** | Free Trial: $300 of credit for up to 30 days; Always Free resources that "never expire" | At trial end, paid resources are reclaimed unless upgraded; Always Free resources keep running. Ampere A1 usage above the Always Free allowance at trial end disables, then deletes after 30 days, every A1 instance |
| **DigitalOcean** | A $5 signup credit, applied automatically on the first team, expiring 90 days after signup; promotional and referral credits through codes | A valid payment method is required before creating resources; credits are usable on all products except SaaS add-ons |
| **Hetzner** | No trial in its published terms; services provided "free of charge" may be discontinued or charged after notice | Paid from the first order; the 14-day right to cancel after contract conclusion is a cancellation right, not a trial |
| **Vercel** | Hobby: free, non-commercial personal use only, with monthly included usage (4 Active CPU hours, 360 GB-hours of provisioned memory, 1 million function invocations, 100 GB of Fast Data Transfer) | No billing: a Hobby team that exceeds a limit usually waits 30 days before it can use the feature again |
| **Netlify** | Credit-based plans for accounts created since September 4, 2025: Free is 300 credits a month, consumed at published rates (20 credits per GB of bandwidth, 15 per production deploy, 10 per GB-hour of compute) | Free is a hard limit with no auto recharge; paid plans can buy credit packs. A team that exhausts its credits has all projects paused |
| **Cloudflare** | Free plan for zones (DNS, CDN, unmetered DDoS protection, universal SSL, a WAF managed ruleset); Workers Free at 100,000 requests a day and 10 ms of CPU per invocation | Free limits are never billed: Workers KV and Hyperdrive operations past their daily Free limits "fail with an error" until the 00:00 UTC reset; paid Workers starts at a $5 monthly minimum |
| **Fly.io** | No free tier for new organizations: a trial of 2 hours of Machine runtime or 7 days, whichever comes first, without a card | A card is required to keep using billable resources; a few allowances stay free (shared IPv4, IPv6, inbound transfer, the first 10 GB of volume snapshots) |
| **Railway** | A one-time $5 trial credit for up to 30 days, then a Free plan with $1 of credit a month | Unverified accounts stay on a Limited Trial with restricted outbound network; verification is automated from the GitHub account's age and activity. Trial volumes are deleted 30 days after credits expire |
| **Twilio** | Trial accounts get product-specific free units (100 SMS, 3,000 emails, 75 voice minutes), not a dollar balance | Messages and calls only to up to 5 verified numbers in the sign-up country, Twilio templates only; the trial expires 30 days after sign-up and upgrading is required for 10DLC registration |
| **GitHub Actions** | Free for public repositories on standard hosted runners; 2,000 minutes a month for private repositories on the Free plan | Open source as acquisition, the subject of The CI/CD Platform Business |

Four patterns run through the table:

- **The hyperscalers converged on credit-plus-clock.** AWS's 2025 model, Azure's free account and Google's trial each give a dollar balance with an expiry, and each ends in a state change rather than a bill. Only the always-free allowances survive the clock, and they are per-meter monthly allowances, the same mechanism as a paid plan's included usage ([Allowances, Tiers and Monthly Caps](/books/hosting-and-cloud/metering-and-rating#allowances-tiers-and-monthly-caps)).
- **Developer platforms meter the free plan in their own unit and stop at the limit.** Netlify's credits, Vercel's Hobby limits, Cloudflare's daily request cap and Railway's $1 a month never produce an invoice; they pause or fail requests, which is the opposite of the hyperscaler paid plan's "alerts only" default ([Spend Caps and Pauses](/books/hosting-and-cloud/finops-and-surprise-bills#spend-caps-and-pauses)).
- **The free tier keeps shrinking where abuse is cheapest.** Heroku ended free dynos in 2022 over fraud; Fly.io dropped its free allowances for new organizations; Railway gates network access on verification; Twilio limits trial traffic to verified numbers. Compute and outbound network are what attackers want, so those are what get gated.
- **The terms read the same everywhere.** AWS and DigitalOcean promotional credit terms are near-identical in structure: no cash value, non-transferable, applied to eligible charges in or after the cycle the code is applied, void for fraud or for accounts "created solely" to obtain them, and not usable for marketplace purchases, support plans, upfront fees or cryptocurrency mining.

## Always Free, Trial and Credit

The three models differ in what is tracked and what ends:

| Model | What it is | What the system tracks | How it ends |
| --- | --- | --- | --- |
| **Always free** | A monthly allowance per meter (Google's e2-micro, Workers' 100,000 requests a day, Netlify's 300 credits) | `plan_versions.included` allowances, reset each period; usage against them | Never, but the provider may change it on notice: Google reserves the right to change Free Tier limits with 30 days' notice |
| **Trial** | Full or restricted access for a period, sometimes with free units (Twilio, Fly.io) | A trial subscription with `status = 'trialing'`, its end and its restrictions as quotas | A clock: convert, or stop and later delete |
| **Credit** | A balance in money that eligible charges draw down (AWS, Azure and Google sign-up credits, startup programs, referrals) | A `credit_grants` row with amount, scope, exclusions and expiry; drawdowns as invoice lines | Exhaustion or expiry, and possibly a state change if the account has no paid plan |

The hyperscalers combine them: AWS's free plan is a credit grant, a trial clock and a set of always-free allowances on one account, with the clock ending at the earlier of six months or a zero balance. That is why the model needs the three pieces separately: the allowance is a plan term, the clock is a subscription period, and the balance is a grant. A design that keeps one "free tier" flag on the account can't express "the trial ended but the always-free VM keeps running," which Oracle and Google both promise.

Trials also carry restrictions, and the restrictions are where the fraud controls live. Google's trial forbids GPUs, Marketplace purchases, quota increases and Windows Server VMs; Azure's free account requires a pay-as-you-go upgrade before quota increases; AWS's free plan blocks "some services that large enterprises typically use"; Railway restricts outbound network until verification. Each is a quota or a permission ceiling that the conversion lifts, so in the model they are `quotas` rows with `source = 'risk'` that end when the plan changes, not code paths that check a flag.

How a trial converts is a separate legal question. Google states that there are no automatic charges; Azure and AWS require an explicit upgrade; Railway and Fly.io require a card to continue. A trial that converts to a paid subscription without a new affirmative act is an automatic renewal under state law, and Subscriptions, Renewals & Cancellation Law owns the rules ([The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal)).

## How We Got Here

- **2010: the free usage tier.** AWS announced on October 21, 2010 that from November 1, new customers could run a free EC2 instance for a year: 750 hours a month of a Linux micro instance, 10 GB of EBS, 5 GB of S3 and 30 GB of data transfer, with SimpleDB, SQS and SNS allowances free indefinitely. The twelve-month free tier for new accounts, plus a few perpetual allowances, became the template for a decade.
- **2010s: trial credits with a clock.** Google's and Azure's credits (today $300 for 90 days and $200 for 30 days) and Oracle's $300 for 30 days put a dollar balance and an expiry on a new account, and pair it with a perpetual free tier. The trial solved a problem the free tier didn't: letting a new customer try expensive services without the provider giving them away forever.
- **August 25, 2022: Heroku ends free plans.** Heroku announced that free dynos, Postgres and Redis would stop on November 28, 2022, and that inactive accounts would be deleted from October 26, saying it was "spending an extraordinary amount of effort to manage fraud and abuse of the Heroku free product plans." It is the clearest public statement that a free compute tier can cost more in abuse than it earns in acquisition.
- **October 2024: Fly.io discontinues its plans.** Organizations on the plans discontinued that month keep the free allowances that came with them; new organizations get no free tier, only a two-hour or seven-day trial, and pay as they go.
- **July 15, 2025: AWS's free plan.** AWS replaced the 12-month tier for new accounts with up to $200 in credits and a choice of a free plan or a paid plan, keeping the legacy tier for older accounts. The free plan can't incur charges at all until it is upgraded, which makes it AWS's first hard cap for new accounts, and the activity credits (launch and terminate an instance, set a budget) turn the credit into onboarding.
- **September 4, 2025: Netlify's credit-based plans.** New accounts get a monthly credit allowance consumed at published per-unit rates, with Free as a hard limit and paid plans able to buy more; the switch from legacy plans is irreversible.

The direction is consistent: from free capacity to free money, and from a free tier that bills when crossed to one that stops. Credits are easier to bound than allowances (a balance can't be exceeded), easier to account for, and easier to void when fraud is found.

## Startup Programs

Startup credits are the largest grants in the market and the ones with a sponsor. As of October 2026:

| Program | Amount | Who qualifies | Notes |
| --- | --- | --- | --- |
| **AWS Activate Founders** | Up to $5,000, starting at $1,000 | Self-funded, pre-Series B, founded in the last 10 years, on a paid account | Subject to the AWS Promotional Credit Terms |
| **AWS Activate Portfolio** | Up to $200,000 | Requires an Org ID from an Activate Provider: an accelerator, angel investor or venture firm | The investor is the channel |
| **AWS Credits for AI Startups** | $200,000 and more | Invite-only, after Portfolio | Through the account manager |
| **Google for Startups Cloud Program** | Up to $200,000 over two years, up to $350,000 for AI startups: year one 100% coverage up to $100,000 ($250,000 for AI-first), year two 20% up to a further $100,000 | Pre-Seed to Series A, founded within the last five years, no more than $5,000 of prior Google Cloud credits | Covers Google's own models; third-party models are billed directly |
| **Microsoft for Startups** | "Up to $150,000 in credits" | Through the Microsoft for Startups portal | Applies to Azure consumption on a sponsored subscription; non-Azure products, support plans and Marketplace purchases "might not be covered"; at exhaustion the subscription "automatically transitions to pay-as-you-go" |

Google's second year is a coverage percentage, not a balance: 20% of eligible usage is credited until $100,000 is reached, which means the credit is computed per line rather than drawn down until empty. A model that only has a balance can't express it, so `credit_programs` carries the coverage rate as a term.

Three design consequences follow:

- **The sponsor is data.** A Portfolio credit exists because an investor's Org ID was presented. Who sponsored a grant matters for fraud (a provider org issuing many codes), for reporting and for the competition question below, so the program records its sponsor and the grant records the reference.
- **Startup credits are scoped and excluded like any other.** AWS's terms exclude Marketplace, several support plans, Route 53 domain registrations, upfront fees for Savings Plans and Reserved Instances, and mining; Microsoft's exclude third-party models such as Anthropic's sold through its marketplace. The exclusions belong on the program and are enforced at application time.
- **The cliff is the product decision.** When the credit ends, Azure's sponsored subscription moves to pay-as-you-go "so applications can keep running," AWS bills at on-demand rates, and the customer's first real invoice can be large. The budgets and alerts that make the cliff a forecast are the playbook's [Free Tiers and Their Cliffs](/docs/operations/cost-and-finops#free-tiers-and-their-cliffs) applied to a balance.

### Investor credits and lock-in

The FTC's November 16, 2023 summary of its cloud computing request for information (102 public comments) records commenters' argument that "cloud credits as a form of investment" could lock in startups, in arrangements where an investor provides money that can only be spent on its own cloud. The FTC made no finding on credits; the post says it is watching generative AI markets. The concern is the same as for committed spend discounts ([Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#the-cma-and-committed-spend)): credits that are only usable on one provider steer architecture toward that provider while they last, and the cost of leaving rises with every service adopted. Competition Cases follows the regulators' side. For the billing system, the duty is narrow and concrete: record the program, the sponsor and the expiry, show the customer the balance and the date, and never let a credit's exclusions surprise them.

## Spending Limits: the Hard Cap

A budget alerts; a spending limit stops. Of everything in this part, only a spending limit guarantees a customer can't be billed more than a stated amount, and only a few providers offer one:

- **Azure's spending limit** is on by default for free accounts and for subscriptions with credits over multiple months (Visual Studio subscriptions), equals the credit amount and can't be changed, only removed. It isn't available on pay-as-you-go or commitment plans. When reached, deployed services "are disabled for the rest of that billing period," VMs stopped and deallocated, storage read-only; multi-month credit subscriptions re-enable at the next period. It doesn't stop everything: some Marketplace services "can incur separate charges even when your spending limit is set," and deallocation loses settings like virtual IP addresses.
- **AWS's free plan** can't incur charges until upgraded, so the credit balance is the cap.
- **Netlify Free and Vercel Hobby** can't be billed at all; their caps are pauses.
- **Google's trial** disables billing when the credit runs out, stopping resources.

Everyone else alerts. That is why [Budgets and Alerts](/books/hosting-and-cloud/finops-and-surprise-bills#budgets-and-alerts) owns budgets, which notify or trigger actions, and this chapter owns `spending_limits`, which enforce. A spending limit has four properties the model needs: its amount (fixed, or equal to the credit balance), its period, the action taken when it's reached (stop resources, make storage read-only, pause projects, block new resources), and the charges it can't stop. The action is an `account_holds` row, so the cap uses the same standing machinery as non-payment ([Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing)), and lifting it is lifting a hold.

The hard part is latency. Usage is rated minutes to hours after it happens, so a cap evaluated on rated usage always overshoots; Azure's documentation doesn't promise the cap is never exceeded, only that services are disabled when charges exhaust it. A provider offering a cap has to decide who pays for the overshoot, and the only honest answer is the provider: a limit the customer was told is hard can't produce a bill above it. My rule is to evaluate the cap on the fastest meter available (provisional usage, not invoiced usage), act at a margin below the limit for meters that can spike, and absorb anything over it as a credit.

## Credits on the Books

Credits are money for accounting even when they aren't cash for the customer. DigitalOcean's 10-K describes the common treatment: credits earned with a purchase are "recorded as contract liabilities when earned" and "recognized at the earlier of redemption or expiration"; its promotional and referral credits "typically expire in two months or less if not used." Unused credit that expires is breakage, and the playbook's [Breakage](/docs/payments/accounting#breakage) section covers when it is recognized and why the product must keep the redemption history that lets finance estimate it.

Hosting adds four twists:

- **Expiry is part of the terms, and it is long.** AWS credits "can't be redeemed after the expiration date," apply to eligible charges "for the entire billing cycle in which they expire," and unused credits on an upgraded free-plan account remain usable for up to 12 months from sign-up; AWS's nonprofit and research credits expire one year after receipt. Startup credits run one to two years, so a provider's credit liability is a long tail, not a monthly float.
- **Expiry order changes breakage.** When an account holds a short-lived promotional credit and a long-lived startup credit, which one draws first decides whether the short one expires unused. The worked example below shows the difference; the order is a stated rule, not an accident of query order.
- **Credits don't pay tax.** AWS's terms exclude "sales, use, and similar transaction taxes," and DigitalOcean's the same. Whether a promotional credit reduces the taxable base or is a payment toward a taxed charge depends on the jurisdiction and the credit's nature, which Tax on Hosting & Cloud owns; the billing system must apply credits as lines the tax engine can classify.
- **Credits can be clawed back.** Both AWS's and DigitalOcean's terms void credits for fraud, misuse, sale for cash, or accounts created solely to obtain them, and require reimbursement of credits used in violation. A void is a dated event on the grant, not a deletion, because the drawdowns already on invoices are the evidence.

Microsoft's online services SLA adds a cross-chapter rule: its service levels don't apply "to purchases made using Microsoft subscription credits." A credit-funded workload has no SLA claim, which [SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits#claims-and-deadlines) has to check before granting one.

## Fraud Exposure

A free account is a bet that the person behind it will become a customer, and the people least likely to are the ones who signed up to take the credit. The terms show what providers have learned:

- **Mining is named in the terms.** AWS's promotional credit terms exclude "any Services for mining for cryptocurrency," DigitalOcean's exclude mining, and Google's trial prohibits it outright.
- **One account per person, enforced through payment.** Google requires never having been a paying customer and never having had a trial, a card or other payment method, and an authorization hold of $0 to $1; Azure requires a phone number, a non-prepaid card and one free account per customer; DigitalOcean requires a payment method before resources; Railway verifies through GitHub account history.
- **Restrict what free capacity can reach.** No GPUs on Google's trial, verified recipients only on Twilio, restricted outbound network on Railway's Limited Trial, no quota increases until upgrade on Azure and Google.
- **Make the gift smaller or remove it.** Heroku's 2022 shutdown, Fly.io's 2024 move to a trial, and the hyperscalers' shift to bounded credits all shrink the prize.

Free-Tier Fraud & Stolen Keys covers the detection side: account farming, cryptomining signatures, stolen keys that run up a paying account's bill, and the quarantine policies providers attach to leaked credentials. The billing model's part is to make fraud cheap to act on: every grant knows its program and sponsor, every program knows its exclusions and stacking rule, a void is one row, and trial restrictions are quotas that risk scoring can tighten without a deploy.

## Applying Credits: a Worked Month

Credits apply at step 5 of [the bill pipeline](/books/hosting-and-cloud/metering-and-rating#the-bill-pipeline): after rating, allowances and commitment benefits, and before tax. Take one account in October 2026, priced at AWS US East (N. Virginia) list prices as of October 2026, with two grants:

- Grant A: a promotional credit with $40.00 remaining, any eligible service, expiring at the end of October.
- Grant B: a startup program credit with $1,000.00 remaining, compute only, expiring October 31, 2027.

Usage after allowances and commitments:

| Line | Usage | Price | Charge |
| --- | --- | --- | --- |
| VM | One m7i.large Linux instance for 720 hours | $0.1008 an hour | $72.576 |
| Object storage | 500 GB-months of S3 Standard | $0.023 per GB-month | $11.500 |
| Egress | 200 GB to the internet, of which the first 100 GB a month is free across AWS services | $0.09 per GB beyond the free 100 GB | $9.000 |
| Marketplace SaaS | A third-party subscription | Vendor's price | $50.000 |
| **Total** | | | **$143.076** |

Two orders give two different results:

| Step | Rule: soonest-expiring first, scope-aware | Naive: largest grant first |
| --- | --- | --- |
| 1 | Grant A (expires first) covers the lines only it can cover: storage $11.50 and egress $9.00, then $19.50 of the VM | Grant B covers the VM: $72.576 |
| 2 | Grant B covers the VM's remaining $53.076 | Grant A covers storage and egress: $20.50 |
| 3 | Marketplace $50.00 is ineligible for both and bills | Marketplace $50.00 bills |
| Credits applied | $93.076 | $93.076 |
| Grant A at month end | $0.00, nothing expires | $19.50 expires unused: breakage, and a customer who lost money the rule could have used |
| Grant B carried forward | $946.924 | $927.424 |
| Billed before tax | $50.00 | $50.00 |

The invoice is the same this month and the customer is $19.50 worse off under the naive order, because the expiring grant was left with charges only the long grant could cover. My rule: apply grants in order of expiry, soonest first; within a grant, take first the lines no other active grant can cover; break remaining ties by the narrowest scope. Tax is then calculated on what remains, by the jurisdiction's rule for credits.

## The Alternatives

| Model | Strengths | Failure modes | Cost to the provider | Who uses it |
| --- | --- | --- | --- | --- |
| **Always-free allowances only** | Simple; no expiry to account for; a real long-term free product | Abuse at scale on compute and egress; the cliff from free to billed surprises customers | Ongoing, unbounded per account count | Google Free Tier, Oracle Always Free, Cloudflare Free, legacy AWS always-free |
| **Time-boxed trial with full access** | Customers try the real product | Fraud concentrates in the trial; conversion can trigger renewal law | Bounded by the clock, not by spend | Fly.io, Twilio, Railway |
| **Credit balance with expiry** | Bounded by amount; easy to void; accounting is a liability with breakage | Expiry order and exclusions confuse customers; a large first invoice when it ends | Bounded by the grant | AWS 2025 plan, Azure, Google trial, DigitalOcean, startup programs |
| **Free plan with hard pause** | No surprise bill possible | Pauses take sites down; a viral spike looks like an outage | Bounded by plan limits | Vercel Hobby, Netlify Free |
| **No free tier** | No free-tier fraud; every account has a payment relationship | Higher acquisition cost; developers try competitors first | None | Hetzner, Heroku since 2022 |

## My Default

My default for a new provider is a small credit balance with a short expiry and a hard cap, plus monthly always-free allowances only on meters that are cheap to serve and expensive to abuse at scale (DNS queries, static requests, a little storage), never on general-purpose compute or unmetered egress. The credit gives a new customer room to try real services; the cap means a stolen card or a farmed account can never cost more than the grant; the allowances keep hobby projects alive past the trial, which is where the long-term customers come from. Startup credits go through a program with a sponsor, exclusions and an expiry of one to two years, applied soonest-expiring first, and voidable.

What would change it: a provider whose product is compute that attackers can monetize directly (GPUs, unrestricted egress, open SMTP) shouldn't give free capacity at all, only a trial gated on verified payment, which is where Fly.io, Railway and Twilio landed. A platform that hosts sites for non-developers should prefer a pause over a bill, and should accept that pauses take sites down.

## How to Build It

The chapter adds credit programs and spending limits to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), links each grant to its program, records voids, links invoice credit lines to the grant they draw, and adds a hold reason for the cap.

```sql
CREATE TABLE credit_programs (           -- the offer a grant comes from: terms as data
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  code             TEXT NOT NULL UNIQUE, -- 'signup_2026', 'startup_portfolio', 'referral'
  kind             TEXT NOT NULL CHECK (kind IN ('promotional', 'startup_program', 'referral',
                     'migration')),      -- the credit_grants.kind it issues
  sponsor          TEXT NOT NULL CHECK (sponsor IN ('provider', 'investor', 'partner')),
  currency         CHAR(3) NOT NULL,
  default_amount   BIGINT,               -- minor units; null when set per grant
  max_amount       BIGINT,               -- the program's ceiling per account
  coverage_rate    NUMERIC(5,4),         -- e.g. 0.20: credits 20% of each eligible line,
                                         -- for programs that cover a share, not a balance
  validity         INTERVAL NOT NULL,    -- grant expiry from issue: '90 days', '2 years'
  applies_to       TEXT[],               -- product or SKU codes; null: any eligible
  excluded         TEXT[] NOT NULL DEFAULT '{}',  -- 'marketplace', 'support', 'domains',
                                         -- 'upfront_fee', 'tax', 'mining'
  stacking         TEXT NOT NULL CHECK (stacking IN ('exclusive', 'stackable')),
  requires_payment_method BOOLEAN NOT NULL,
  eligibility      JSONB NOT NULL DEFAULT '{}',   -- never paid, founded within N years, stage
  available_during TSTZRANGE NOT NULL,   -- when it can be granted; terms change by new row
  terms_url        TEXT NOT NULL         -- the terms the customer accepted
);

ALTER TABLE credit_grants
  ADD COLUMN program_id     UUID REFERENCES credit_programs (id),  -- null: SLA, goodwill
  ADD COLUMN sponsor_ref    TEXT,        -- the investor's or partner's org id, when sponsored
  ADD COLUMN voided_at      TIMESTAMPTZ, -- fraud, sale, account created to obtain it
  ADD COLUMN voided_reason  TEXT CHECK (voided_reason IN ('fraud', 'misuse', 'sold',
                              'duplicate_account', 'program_terms')),
  ADD CONSTRAINT credit_grants_void_check
    CHECK ((voided_at IS NULL) = (voided_reason IS NULL));

ALTER TABLE invoice_lines
  ADD COLUMN credit_grant_id UUID REFERENCES credit_grants (id),  -- set on line_kind 'credit'
  ADD CONSTRAINT invoice_lines_credit_grant_check
    CHECK ((line_kind = 'credit') = (credit_grant_id IS NOT NULL));

CREATE TABLE spending_limits (           -- the hard cap; budgets only alert
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  project_id    UUID REFERENCES projects (id),     -- null: the whole account
  basis         TEXT NOT NULL CHECK (basis IN ('credit_balance', 'fixed_amount')),
  currency      CHAR(3) NOT NULL,
  amount        BIGINT,                  -- minor units; null when basis = 'credit_balance'
  period        TEXT NOT NULL CHECK (period IN ('billing_period', 'lifetime')),
  action        TEXT NOT NULL CHECK (action IN ('no_new_resources', 'read_only',
                  'stop_resources', 'full_suspension')),  -- the account_holds effect
  margin_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,  -- act this far below the limit
  not_covered   TEXT[] NOT NULL DEFAULT '{}',     -- charges it can't stop: 'marketplace',
                                                  -- 'storage_at_rest'
  removable     TEXT NOT NULL CHECK (removable IN ('customer', 'upgrade_only')),
  valid_during  TSTZRANGE NOT NULL,
  created_by    TEXT NOT NULL,           -- typed actor: 'system:free_plan', a user
  CHECK ((basis = 'fixed_amount') = (amount IS NOT NULL)),
  EXCLUDE USING GIST (account_id WITH =, (COALESCE(project_id::text, '')) WITH =,
    valid_during WITH &&)
);

ALTER TABLE account_holds
  DROP CONSTRAINT account_holds_reason_check,
  ADD CONSTRAINT account_holds_reason_check CHECK (reason IN ('non_payment', 'abuse',
    'fraud', 'verification', 'sanctions', 'legal_order', 'customer_request',
    'spending_limit'));
```

A grant's remaining balance is its amount less its drawdowns, never a column:

```sql
CREATE VIEW credit_grant_balances AS
SELECT g.id AS credit_grant_id, g.account_id, g.currency, g.valid_during,
       g.amount + COALESCE(SUM(il.amount), 0) AS remaining   -- credit lines are negative
FROM credit_grants g
LEFT JOIN invoice_lines il ON il.credit_grant_id = g.id
WHERE g.voided_at IS NULL
GROUP BY g.id;
```

Credits are applied inside the invoice run, after commitment benefits and before tax, by one function that both the run and the balance preview call. It walks grants in expiry order and, within each grant, takes first the lines no other active grant can cover:

```sql
CREATE FUNCTION credit_allocations(p_account UUID, p_period TSTZRANGE)
RETURNS TABLE (credit_grant_id UUID, rated_usage_id UUID, amount NUMERIC)
LANGUAGE plpgsql AS $$
DECLARE
  g RECORD; l RECORD; take NUMERIC;
BEGIN
  -- Chargeable amount per rated line: rated amount less commitment benefit (step 4).
  CREATE TEMP TABLE open_lines ON COMMIT DROP AS
  SELECT ru.id, s.code AS sku_code, p.code AS product_code, ru.currency,
         ru.amount - COALESCE((SELECT SUM(cd.benefit_amount) FROM commitment_drawdowns cd
                               WHERE cd.rated_usage_id = ru.id), 0) AS remaining
  FROM rated_usage ru
  JOIN skus s ON s.id = ru.sku_id
  JOIN products p ON p.id = s.product_id
  WHERE ru.account_id = p_account AND ru.rated_during <@ p_period
    AND s.pass_through IS DISTINCT FROM 'marketplace_vendor';  -- excluded everywhere here

  CREATE TEMP TABLE open_grants ON COMMIT DROP AS
  SELECT b.credit_grant_id AS id, b.remaining, b.currency, cg.applies_to,
         COALESCE(cp.excluded, '{}') AS excluded, upper(b.valid_during) AS expires_at
  FROM credit_grant_balances b
  JOIN credit_grants cg ON cg.id = b.credit_grant_id
  LEFT JOIN credit_programs cp ON cp.id = cg.program_id
  WHERE b.account_id = p_account AND b.remaining > 0
    AND b.valid_during && p_period;      -- usable for the cycle in which it expires

  FOR g IN SELECT * FROM open_grants
           ORDER BY expires_at, (applies_to IS NULL), cardinality(applies_to), id LOOP
                                         -- soonest expiry, then narrowest scope
    FOR l IN
      SELECT ol.*,
             (SELECT COUNT(*) FROM open_grants o2       -- other grants that could take it
              WHERE o2.id <> g.id AND o2.remaining > 0 AND o2.currency = ol.currency
                AND (o2.applies_to IS NULL OR ol.product_code = ANY (o2.applies_to)
                     OR ol.sku_code = ANY (o2.applies_to))
                AND NOT (ol.product_code = ANY (o2.excluded))) AS alternatives
      FROM open_lines ol
      WHERE ol.remaining > 0 AND ol.currency = g.currency
        AND (g.applies_to IS NULL OR ol.product_code = ANY (g.applies_to)
             OR ol.sku_code = ANY (g.applies_to))
        AND NOT (ol.product_code = ANY (g.excluded))
      ORDER BY alternatives, ol.remaining DESC, ol.id
    LOOP
      EXIT WHEN g.remaining <= 0;
      take := LEAST(g.remaining, l.remaining);
      credit_grant_id := g.id; rated_usage_id := l.id; amount := take;
      RETURN NEXT;
      g.remaining := g.remaining - take;
      UPDATE open_lines SET remaining = remaining - take WHERE id = l.id;
    END LOOP;
    UPDATE open_grants SET remaining = g.remaining WHERE id = g.id;
  END LOOP;
END $$;
```

Notes on the sketch:

- **A program is versioned by new rows.** Changing a program's amount, exclusions or validity creates a new `credit_programs` row with its own `available_during`; grants keep pointing at the terms the customer accepted.
- **Allowances aren't credits.** Always-free limits are `plan_versions.included` and are consumed during rating ([Allowances, Tiers and Monthly Caps](/books/hosting-and-cloud/metering-and-rating#allowances-tiers-and-monthly-caps)); only money goes through `credit_grants`. A coverage-rate program (Google's second year) is applied per line at its rate, capped by the grant, in the same function.
- **The invoice run writes the allocations** as `invoice_lines` with `line_kind = 'credit'`, a negative amount and `credit_grant_id`, rounded once by the written rule ([Rounding](/docs/payments/money#rounding)); the preview runs the same function without writing, so the balance a customer sees mid-month is the one the invoice will produce.
- **Trial restrictions are quotas.** No GPUs, no quota increases and restricted egress are `quotas` rows with `source = 'risk'` and the trial period as their range; conversion ends them.
- **The cap is a hold.** When provisional spend reaches `amount` less `margin_pct` (or the credit balance reaches zero), the limit's `action` becomes an `account_holds` row with `reason = 'spending_limit'`; removing or raising the limit lifts it. Overshoot past a hard limit becomes a `credit_grants` row of kind `goodwill`.
- **Breakage is computed, not posted by the product.** Expired remaining balances are reported to finance by cohort with their issue and redemption history; the product never edits a balance to recognize them ([Breakage](/docs/payments/accounting#breakage)).
- **Events:** `credit.granted`, `credit.applied`, `credit.expiring` (at the thresholds the program sets: AWS sends 50%, 25% and 10% remaining, and 15, 7 and 2 days left), `credit.expired`, `credit.voided`, `trial.ending`, `trial.ended`, `spending_limit.reached` and `spending_limit.removed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, billing and risk.

## Auditing

- **Every grant's origin and terms.** The program and its version, the sponsor and its reference, the amount, scope, exclusions and expiry, and the terms URL the customer accepted, because a disputed expiry or an investor's question is answered from them.
- **Every drawdown.** Which grant paid which line in which invoice, so a balance can be rebuilt and the expiry order shown to have been followed.
- **Every void and why.** The fraud case or terms violation behind it, and the drawdowns already made, which the terms say can be reclaimed.
- **Every trial and limit transition.** When a trial ended, which restrictions lifted, when a spending limit was reached and what it stopped, and whether anything billed above a hard limit was credited back.
- **Breakage by cohort.** Issue date, amount, redemptions and expiry per program, for finance's estimate and for unclaimed property rules where they reach credits ([Breakage](/docs/payments/accounting#breakage)).

## What This Means for the System You Build

- **Model allowances, trials and credits separately:** allowances on the plan, the clock on a subscription period, money in a grant.
- **Put credit terms on a program,** with sponsor, scope, exclusions, stacking, expiry and terms URL, and version programs by new rows.
- **Apply credits after commitments and before tax,** soonest-expiring first, scope-aware, as invoice lines that point at their grant.
- **Make the remaining balance a sum** of drawdowns, and show the customer the same number the invoice will use.
- **Offer a hard cap only if it's hard:** evaluate on provisional usage, act below the limit, and credit back any overshoot.
- **Express trial restrictions as quotas** that risk scoring can tighten and conversion lifts.
- **Exclude what attackers want** (mining, GPUs, marketplace resale, unrestricted egress) from free money, and make a void one row.
- **Keep the redemption history** finance needs for breakage, and never expire a balance in the product to recognize revenue.

## References

**Provider documentation**

- [AWS News Blog: AWS Free Tier update, up to $200 in credits](https://aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/), the July 15, 2025 free and paid plans, credits and activities, expiry, the 90-day reopening window, alert thresholds and the legacy tier
- [AWS Promotional Credit Terms and Conditions](https://aws.amazon.com/awscredits/), ineligible services, expiry, no cash value, voiding for fraud and accounts created to obtain credits, taxes excluded
- [AWS: Startup credits](https://aws.amazon.com/startups/credits), Activate Founders, Portfolio and AI Startups amounts and eligibility
- [AWS: EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/), m7i.large at $0.1008 an hour in US East (N. Virginia) and the 100 GB monthly free data transfer out
- [AWS Price List: Amazon S3, US East (N. Virginia), published October 15, 2026](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json), S3 Standard at $0.023 per GB-month for the first 50 TB
- [AWS Price List: AWS Data Transfer, US East (N. Virginia), published September 16, 2026](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/us-east-1/index.json), $0.09 per GB for the first 10 TB a month beyond the free tier
- [Microsoft Learn: Azure spending limit](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/spending-limit), default-on limit equal to the credit, what is disabled, removal, and charges it doesn't stop
- [Azure: Free account offer](https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0044p), $200 for 30 days, 12 months of free services, one account per customer and payment requirements
- [Microsoft Learn: Best ways to use your startup credits](https://learn.microsoft.com/en-us/startups/build/getting-started/use-startup-credits), coverage of sponsored subscriptions, exclusions for third-party models and Marketplace, and the transition to pay-as-you-go
- [Microsoft for Startups](https://www.microsoft.com/en-us/startups), up to $150,000 in credits
- [Google Cloud: Free Trial and Free Tier](https://docs.cloud.google.com/free/docs/free-cloud-features), $300 for 90 days, eligibility, trial restrictions including mining, the 30-day grace period and Free Tier limits
- [Google Cloud: AI startup program](https://cloud.google.com/startup/ai), up to $350,000 over two years, year-one and year-two coverage, eligibility
- [Google for Startups Cloud Program](https://cloud.google.com/startup), program stages and criteria
- [Oracle Cloud Infrastructure: Free Tier](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm), $300 for 30 days, Always Free resources and what happens at trial end
- [DigitalOcean: Signup credit](https://docs.digitalocean.com/platform/billing/promo-codes/), the $5 credit, its 90-day expiry and exclusions
- [DigitalOcean: Promotional Credit and Discount Terms](https://www.digitalocean.com/legal/promotional-credit-terms), expiry, voiding and ineligible uses including mining
- [Hetzner: Terms and conditions](https://www.hetzner.com/legal/terms-and-conditions/), services offered free of charge and their discontinuation
- [Vercel: Hobby plan](https://vercel.com/docs/plans/hobby), included usage, the 30-day wait after exceeding a limit and non-commercial use
- [Netlify: Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/), plan credits, consumption rates, the Free hard limit and the September 4, 2025 start
- [Netlify: Resume paused projects](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/), pausing every project when credits run out
- [Cloudflare: Plans](https://www.cloudflare.com/plans/network-cdn/), what the Free plan includes
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), Workers Free limits and the Paid minimum
- [Fly.io: Pricing](https://docs.fly.io/about/pricing), the trial, the absence of a free tier for new organizations and plans discontinued in October 2024
- [Railway: Free trial](https://docs.railway.com/reference/pricing/free-trial), the $5 trial credit, the Free plan, verification and Limited Trial restrictions
- [Twilio: How to use your free trial account](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account), free units, verified recipients and expiry
- [GitHub: Billing for GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions), free public-repository usage and private-repository minutes
- [Heroku: Heroku's next chapter](https://www.heroku.com/blog/next-chapter), ending free plans over fraud and abuse, with dates
- [Amazon: AWS to launch free usage tier (October 21, 2010)](https://press.aboutamazon.com/2010/10/amazon-web-services-to-launch-free-usage-tier), the original 12-month free tier and its limits

**Filings and contracts**

- [DigitalOcean: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1582961/000158296126000019/docn-20251231.htm), credits as contract liabilities recognized at redemption or expiry, typical expiry, credits as acquisition incentives and fraudulent registrations as a risk
- [Microsoft: Service Level Agreements for Online Services (October 2026)](https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services), service levels not applying to purchases made with subscription credits

**Regulation**

- [FTC: Cloud computing RFI, what we heard and learned (November 16, 2023)](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2023/11/cloud-computing-rfi-what-we-heard-learned), 102 comments and the concern about cloud credits as investment
