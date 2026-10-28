+++
title = "How Web Hosting Makes Money"
description = "How shared hosting earns: intro prices on long prepaid terms, renewals at list, free-domain bundles, trial add-ons, retention and ratable revenue."
category = "Hosting & Cloud Industry"
order = 2155
part = "Web Hosting"
tags = ["web-hosting", "pricing", "renewals", "bundles", "upsells", "retention", "revenue-recognition"]
+++

Shared web hosting is sold at a loss and renewed at a profit. The plan on the pricing page costs two to four dollars a month, but only if the customer prepays one to four years; the same plan renews at two to six times that price for the same term, with a domain, a mailbox and sometimes a backup product that were free in year one now renewing beside it. The customer who stays three years is worth many times the customer who leaves after one, so the business is built around the first renewal: who reaches it, what they pay, what else they've attached by then, and what the law requires the host to say before it charges them.

The accounting follows the same shape. The cash for a 48-month term arrives on day one, and the revenue arrives one month at a time over four years. A host that grows bookings reports revenue that lags them; a host whose renewals slow sees it in deferred revenue before it sees it in revenue. The two public filers in the segment, GoDaddy and IONOS, and the private hosts that publish results, Hostinger among them, all describe a subscription business whose most important number is how many customers come back.

This chapter covers how the providers price, how the segment consolidated, the intro term and the renewal, the bundle, upsells and attach, retention, ratable revenue, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with bundle and upsell rows on `plan_versions`. The control panel each account runs under, and the license fee it costs per account, are [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm) and [Control Panel Licensing & the Alternatives](/books/hosting-and-cloud/control-panel-licensing). The law of automatic renewal is the Billing part's [Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law); here it appears only where it shapes the product.

## How the Providers Do It

Entry shared hosting plans, as of October 2026, from each provider's own pricing page:

| Provider | Entry plan, intro | Renews at | Ratio | Term needed for the intro price | Free in year one | Refund window |
| --- | --- | --- | --- | --- | --- | --- |
| **Hostinger** | Premium $2.49/mo, $119.52 upfront | $10.99/mo "for the same term" | 4.4x | 48 months, "All plans are paid upfront" | Domain for 1 year; 2 mailboxes per site for 1 year | 30 days |
| **SiteGround** | StartUp $2.99/mo | $17.99/mo | 6.0x | "Prepaid for 12 months" | Domain for one year (.com, .org or .net); SSL, CDN, daily backups, email | 30 days |
| **DreamHost** | Web Hosting Launch $2.89/mo | $10.99/mo, "Auto-renews ... after 1 year" | 3.8x | Yearly; promotional pricing "applies only to the first term" | Domain with private registration on annual plans; 3-month Professional Email trial | Not stated on the page |
| **IONOS** | Essential $4/mo; Plus $1/mo | Essential "Then only $8/month"; Plus $14 | 2.0x; 14x | "with a 1-year term" | Domain for 1 year, wildcard DV certificate, 1 to 5 email accounts | 30 days |
| **Bluehost** | Starter $3.99/mo | $9.99/mo | 2.5x | 36 months | Domain for one year on 12- or 36-month plans, redeemed within 90 days; Let's Encrypt SSL, CDN, weekly backups; 1-month Pro Email trial renewing at $2.50/mo | 30 days, less "a non-refundable domain fee ... at the regular cost of your domain" |
| **HostGator** | Prices not rendered in the page text | "regular rate found in your control panel" | | 12, 24 or 36 months for the free domain | Domain for the first year; 1-month Pro Email trial renewing at $2.99/mo | 30 days, excluding domain fees, add-ons and renewals |
| **WP Engine** | Essential $28/mo billed annually, "Pay $336.00 today" | Not shown: "Product renewal pricing subject to change" | | Annual | (Managed WordPress; see [Managed WordPress](/books/hosting-and-cloud/managed-wordpress#how-the-providers-do-it)) | |

GoDaddy's hosting pages refused automated access, so no GoDaddy list prices appear here; its FY2025 Form 10-K describes shared hosting built on "industry standard cPanel or Plesk Obsidian control panels" alongside VPS, security and SSL products.

What the table shows:

- **The intro price is a term discount.** Every general host ties its headline price to a prepaid term, from one year (SiteGround, DreamHost, IONOS) to three (Bluehost) to four (Hostinger). The monthly figure is the term total divided by its months; Hostinger states it outright. A customer comparing $2.49 and $3.99 is comparing $119.52 for four years with $143.64 for three.
- **The renewal ratio varies more than the intro price.** Intro prices cluster between $2.49 and $4; renewals run from $8 to $17.99, and the ratio from 2.0x to 6.0x on entry plans. IONOS's Plus plan, at $1 in its first year and $14 after, is the extreme case on these pages. Hosts that compete on the first bill can price the second one very differently.
- **The free year is a list of things that will renew.** A domain, mailboxes, a trial of a paid email product. Bluehost's domain "will automatically renew at the then current rate"; its Pro Email trial and HostGator's convert to paid after a month unless cancelled. Each is a second subscription started by the first.
- **Refunds carve out what was bundled.** Bluehost deducts the domain at its regular cost from a refund; HostGator excludes domain fees and add-ons from its money-back guarantee. The free domain is free only if the customer keeps the plan.
- **Specialists don't play the intro game.** WP Engine prices annually with no stated renewal uplift and meters visits instead ([Visit Limits](/books/hosting-and-cloud/managed-wordpress#visit-limits)); its revenue model is usage overage and plan upgrades, not the renewal step.

The companies behind the pages, from their filings and releases:

| Company | Revenue | Customers | Retention and revenue quality | Status of the figures |
| --- | --- | --- | --- | --- |
| **GoDaddy** | $4,951.1M in 2025, up 8.3%; bookings $5,400.0M, up 7.2% | 20.4M; average revenue per user $242 (2024: $220) | Customer retention about 85% in each of the last five years except 2024 (about 84%); about 90% for customers with it over three years; more than 89% of 2025 revenue from customers of the prior year | Audited, Form 10-K |
| **IONOS** | €1,316.9M in 2025, up 5.5% (6.1% currency-adjusted); adjusted EBITDA €485.2M, 36.8% margin | 6.63M, up about 310,000 | Not stated in the release | Company results release; AdTech (Sedo) reported as discontinued |
| **Hostinger** | €275.4M in 2025, up 51%, its fourth year above 50% | 4.6M, up 35%, in more than 150 countries | Its AI agent handled 81% of support interactions by year end | Company-reported, unaudited |
| **Newfold Digital** (Bluehost, HostGator, Network Solutions, others) | Not published | "nearly 7 million customers globally" | Not published | Company statement; private, owned by Clearlake Capital and Siris Capital |

Dividing revenue by year-end customers gives a rough revenue per customer: about €199 at IONOS and about €60 at Hostinger, against GoDaddy's reported $242. The spread is product mix more than price: GoDaddy and IONOS sell domains, commerce, productivity and cloud to the same customer, and Hostinger is growing fast enough that much of its base is in its first, cheapest term.

## How Web Hosting Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 24 Oct 2013 | Endurance International Group's IPO prospectus: $12.00 a share on NASDAQ (EIGI), about 3.4 million subscribers, brands including Bluehost, HostGator, Domain.com, FatCow and iPage; "Our subscriptions require payment in advance, providing significant cash flow benefits and revenue visibility" | Capital to keep buying hosting brands | A portfolio of brands to run, migrate and eventually retire |
| 31 Mar 2015 | GoDaddy prices its IPO: 23 million Class A shares at $20.00 on the NYSE (GDDY), trading from 1 Apr 2015 | A public market for a domains-and-hosting subscription business | Public reporting of retention, bookings and deferred revenue, which is why the segment has numbers at all |
| 11 Oct 2018 | An affiliate of Siris Capital completes its acquisition of Web.com Group, about $2 billion; Web.com leaves NASDAQ | | |
| 27 Jun 2019 | cPanel announces account-based pricing | | The panel license becomes a cost per hosting account ([Control Panel Licensing](/books/hosting-and-cloud/control-panel-licensing#how-panel-licensing-got-here)) |
| 10 Feb 2021 | Clearlake completes its acquisition of Endurance, about $3.0 billion including debt, and with Siris forms Newfold Digital from Endurance Web Presence and Web.com; about 6.7 million customers | Scale across brands | Endurance delisted from NASDAQ; one owner for Bluehost, HostGator, Network Solutions, Register.com and others |
| 29 Jan to 29 Apr 2025 | World Host Group acquires A2 Hosting (reported 29 Jan), which rebrands as hosting.com (announced 29 Apr) | | A brand retired into a new one |
| June 2025 | Web.com's combination into Network Solutions announced (press); Register.com "is becoming Network Solutions" with "no changes to your pricing or billing" | Fewer platforms to run | A migration of every account and renewal |
| 31 Dec 2025 | Newfold closes the sale of Markmonitor to Com Laude; its CEO says the sale lets it "simplify our portfolio" and focus on Bluehost and Network Solutions | | |
| 23 Feb and 19 Mar 2026 | Hostinger reports 2025 revenue of €275.4M; IONOS reports €1,316.9M | | |

The thread is consolidation by acquisition and then consolidation of platforms. Buying brands buys their renewal books; running many brands costs a platform each, so the acquirer migrates customers onto fewer systems and retires names. GoDaddy's 10-K attributes its one weaker retention year, 2024, to "divestitures, migrations and end of life of certain products." A migration is where a renewal book leaks.

## The Intro Term and the Renewal

The mechanics are the same on every general host's page:

- **The term is charged upfront.** Hostinger: "All plans are paid upfront." DreamHost charges the full term plus taxes at checkout. The longer the term, the lower the headline monthly price.
- **The renewal price is shown at sign-up.** Every page in the table above prints the renewal price next to the intro price, as "Renews at", "Then only" or "Auto-renews at". Automatic renewal laws, which GoDaddy's 10-K lists among the rules it operates under, make that disclosure a requirement rather than a courtesy.
- **Renewal is automatic by default.** Hostinger's terms: "all Services include an auto-renewal feature, unless otherwise specified," charged "from 30 (thirty) to 0 (zero) calendar days before" the period ends, at "then-current fees" that "may be higher or lower than the fees for the initial subscription period." Bluehost's free domain and its Pro Email trial, and HostGator's plan and Pro Email trial, say the same in their own words.
- **The renewal keeps the term.** Hostinger renews "for the same term"; a 48-month buyer is charged 48 months at the renewal rate. The customer's second bill can be the largest single charge they ever see from the host: on SiteGround's entry plan, $35.88 for the first year and $215.88 for the second at the listed prices.

The design consequence is that the renewal is a separate sale the host makes to someone who has stopped looking. Everything the customer was told at checkout (renewal price, term, what auto-renews, how to turn it off) must be reproducible at renewal time from records, and the notice before the charge is where most of the law and most of the complaints sit. The disclosure, consent, reminder and cancellation rules are [Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law#terms-intro-prices-and-the-renewal)'s, and the generic version is the playbook's [The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal) and [Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data).

The renewal price itself is a pricing decision with a long tail. A plan version's renewal amount is a promise made to every customer who bought under it, so a later increase is a new price version with notice ([Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs#price-changes-and-notice) covers the notices), and the renewal job must charge the version the customer agreed to, not today's list.

## The Bundle

The free year makes a cheap plan look complete: a domain, a certificate, mail, a CDN, backups. Across the hosts above:

| Item | Who includes it | What happens after the free period |
| --- | --- | --- |
| **Domain registration** | Hostinger, SiteGround, DreamHost, IONOS, Bluehost, HostGator (year one) | Renews at the registrar's list price; Bluehost "until cancelled". The registry and ICANN fees are pass-through costs the host paid for the free year |
| **Domain privacy** | DreamHost (on annual plans), HostGator Business and Pro (first year) | Included or renewed as an add-on |
| **TLS certificate** | All of them (Let's Encrypt at Bluehost; a wildcard DV certificate at IONOS) | Free for the life of the plan; issuance is automated ([ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale)) |
| **Mailboxes** | Hostinger (free for one year), IONOS (1 to 5 accounts), SiteGround (included) | Hostinger's mailboxes are a one-year trial; trials of paid products at DreamHost (3 months), Bluehost and HostGator (1 month) convert to paid ([Pro Email](/books/hosting-and-cloud/email-hosting#pro-email)) |
| **Backups and CDN** | SiteGround (daily), Bluehost (weekly), others | Included; more frequent or longer-kept backups are an upsell ([Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations#how-the-providers-do-it)) |

Three properties of bundled items matter for the system:

- **Each bundled item has its own clock.** The plan renews in 12, 36 or 48 months; the domain renews in 12; an email trial converts in one or three. A customer on a 36-month plan sees a domain renewal in month 13 and a mailbox charge in month 2, each a separate consent and a separate notice.
- **Each has its own standalone price.** A free domain still has a regular price (Bluehost deducts it from refunds "at the regular cost of your domain"). Revenue standards allocate the bundle's price across its components by standalone selling price, so the host has to record what each component would cost alone, even when the customer paid nothing extra for it ([ASC 606 and IFRS 15 in Five Steps](/docs/payments/accounting#asc-606-and-ifrs-15-in-five-steps)).
- **Some cost the host real money.** The domain's registry and ICANN fees are paid out on day one; the certificate and the CDN cost the host almost nothing at the margin. The bundle's true cost is mostly the domain, and the refund carve-outs exist to recover it.

## Upsells and Attach

The intro plan is the cheapest thing the customer will buy. The rest is attach: products sold to an existing customer at checkout, after purchase, in the dashboard, or at renewal.

- **Email.** A paid mailbox product with its own intro and renewal prices, often white-labeled from one vendor across hosts ([Pro Email](/books/hosting-and-cloud/email-hosting#pro-email)).
- **Backups, security and malware scanning.** Weekly or daily backups are included; restore points kept longer, more frequent copies and malware clean-up are sold on top.
- **Site builders and AI tools.** Builders and assistants sold to customers who bought hosting but don't want to run WordPress.
- **Plan upgrades and the VPS path.** The same panel account moved to a larger shared plan, a VPS or a dedicated server; on a cPanel VPS the panel license itself becomes a visible line on the customer's bill ([Control Panel Licensing](/books/hosting-and-cloud/control-panel-licensing#how-panel-cost-flows-into-plan-prices)).
- **Managed WordPress.** A step up from shared hosting into a platform priced by visits ([Managed WordPress](/books/hosting-and-cloud/managed-wordpress)).

GoDaddy's 10-K describes the economics the upsell rests on: "Our costs associated with renewals are lower than costs associated with acquiring new customers." An attached product inherits the customer the host already paid to acquire, and it renews on its own schedule, so attach rate raises both revenue per customer and the number of things holding the customer in place.

The upsell has its own disclosure duty. A trial that converts to paid is a new automatic renewal with its own terms, and the checkbox that started it is the consent the host will have to produce later. An offer that is pre-selected, buried, or reappears after it was declined is where hosting checkouts most often draw complaints; the rule I'd hold to is that every attached product has its own visible price, its own renewal price, its own off switch, and its own consent record.

## Retention

GoDaddy publishes the segment's clearest retention figures: about 85% of customers retained in each of the last five years (84% in 2024), about 90% among customers who had been with it for over three years, and more than 89% of 2025 revenue from customers it had the year before. Two things follow from those numbers.

**Retention rises with tenure.** A customer who survives the first renewal is more likely to survive the next. That makes the first renewal the point the business is designed around: the reminder before it, the renewal price it reveals, the value the customer has attached by then, and the save offer if they try to leave.

**Revenue is mostly last year's customers.** With 89% of revenue from prior-year customers, new sales mostly replace churn and add to next year's base. A pricing change that raises first-term conversion but lowers first-renewal retention can shrink the business while the sales dashboard improves.

What a host should measure, per cohort of first purchase month and term length: share that reach the first renewal, share that renew, renewal amount over intro amount actually paid (the realized uplift, after save offers and downgrades), attached products per customer at renewal, and revenue per customer by tenure year. These are definitions, and definitions drift; [Operating Metrics](/books/hosting-and-cloud/operating-metrics#customers-churn-and-renewal) owns them. Brand migrations show up here first: GoDaddy's 2024 dip was attributed partly to migrations and product end-of-life, and Network Solutions' Register.com FAQ promises "no changes to your pricing or billing", "the same renewal dates, contract terms, and communication timing" because a migrated renewal is the easiest one to lose.

Support is the other side of retention, and the largest cost per customer after acquisition. Hostinger's release is the one public operating figure on automating it: its agent handled 81% of support interactions by the end of 2025, up from 50% at the start of the year, which it says saved about €9 million.

## Ratable Revenue

Hosting revenue is recognized as the service is delivered, not when the cash arrives. GoDaddy's 10-K: "we generally recognize revenue from our customers ratably over the respective terms of their subscriptions," which "can range from monthly terms to multi-annual terms of up to ten years," so "a substantial portion of the revenue we recognize during a quarter is derived from deferred revenue." Endurance's 2013 prospectus made the same point from the cash side: payment in advance provides "significant cash flow benefits and revenue visibility."

A worked case at Hostinger's listed Premium price: the customer pays $119.52 on day one for 48 months. The host records a contract liability of $119.52 and recognizes about $2.49 a month for 48 months. If the free domain is a separate performance obligation, part of the $119.52 is allocated to the domain by relative standalone selling price and recognized over the domain's 12 months, and the rest over the hosting term. At the first renewal the customer pays 48 times $10.99, $527.52, and the same schedule starts again. The general mechanics (contract liability on prepayment, a recognition schedule per line, allocation within a bundle) are the playbook's [Accounting & Revenue Recognition](/docs/payments/accounting#recognition-schedules); what's particular to hosting is the length of the terms and the number of bundled items with their own clocks.

Three consequences for the business:

- **Bookings lead revenue.** GoDaddy reported $5,400.0M of bookings against $4,951.1M of revenue in 2025. Long prepaid terms make bookings a leading indicator and revenue a trailing one; a host that shortens its terms sees bookings fall before anything else changes.
- **Refunds reverse deferred revenue first.** A refund in the 30-day window mostly unwinds a liability, with the bundled domain's cost (already paid to the registry) the part that doesn't come back, which is why refund policies deduct it.
- **Price changes take years to show.** A renewal price raised today applies at each customer's next renewal, up to four years out on a 48-month term, and is recognized over the term after that.

## The Alternatives

| Pricing model | Model | Strengths | Failure modes | Ownership and rules | Cost to the customer | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Intro price on a long prepaid term** | Low first term, list-price renewals, bundled free year | Lowest acquisition price; cash upfront; long customer lives | Renewal shock; complaints and regulatory exposure at renewal; churn concentrated at the first renewal | The host's pricing and the auto-renewal law of each market | $1 to $4 a month in term one, $8 to $18 after (entry plans above) | Hostinger, SiteGround, DreamHost, IONOS, Bluehost, HostGator |
| **Flat price, monthly or annual, no intro step** | One price that renews unchanged | No renewal shock; easy to compare; fewer disclosures to get wrong | Higher first bill loses price-sorted shoppers | The host | The renewal price from day one | Managed and VPS tiers; WP Engine's annual plans state no intro step |
| **Usage-metered plans** | An allowance with overage by visits, bandwidth or compute | Revenue tracks cost; customers pay for growth | Bills that surprise; a meter to explain and defend | The host's meter definition | From about $25 a month plus overage | Managed WordPress specialists ([Visit Limits](/books/hosting-and-cloud/managed-wordpress#visit-limits)) |
| **Bundled product suite** | Hosting as one line in a suite with domains, email, commerce and marketing | Higher revenue per customer; more attached products holding the customer | Complex bills; each attached product a separate renewal and consent | The suite's owner | Varies by attach | GoDaddy, IONOS |
| **Wholesale and reseller** | Hosting sold to resellers who set their own retail price | The provider's acquisition cost is the reseller's | Margin squeezed by reseller pricing; abuse from resellers' customers ([Resellers and White Label](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label)) | The reseller agreement | Reseller plans per account cap | Reseller hosting at many hosts |

## My Default

My default for a host selling to small businesses is the intro-term model with two constraints: a renewal ratio the host is willing to print in the same size as the intro price, and a term no longer than three years. The model exists because it works: it lowers the price that wins the sale and pays for acquisition with renewals that cost less to win. What breaks it is a renewal so far above the intro price that the first renewal becomes the customer's reason to leave and the regulator's reason to call. A ratio around 2x to 3x on the entry plan, as several hosts above run, keeps the renewal defensible; 6x or more depends on customers not reading the bill.

On bundles, my default is to include the certificate and the CDN for the life of the plan (they cost nearly nothing) and to treat the free domain and every trial as what they are: separate subscriptions with their own renewal price, consent, notice and off switch, created at checkout and visible in the account from day one.

The tradeoff that would change it is the customer mix. A host whose customers are developers and agencies should price flat or by usage, because they compare total cost of ownership and resent the renewal step; a host whose renewal book is acquired in a migration should freeze the renewal terms it inherits until the migration is complete, as Network Solutions' FAQ promises, because a migration plus a price change is two reasons to leave at once.

## How to Build It

The core model already holds the intro and renewal amounts on `plan_versions` and the phase on `subscription_periods`. This chapter adds what the plan version bundles and what is offered on top of it: `plan_bundle_items` for the free year, `upsell_offers` for what is offered where, and `upsell_attaches` for each offer's outcome. Mailbox products are [Email Hosting](/books/hosting-and-cloud/email-hosting#how-to-build-it)'s, backups [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations#how-to-build-it)'s, and domains the Domains part's; here they appear only as SKUs and plan versions that a bundle points at.

```sql
CREATE TABLE plan_bundle_items (         -- what a plan version includes, and for how long
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_version_id       UUID NOT NULL REFERENCES plan_versions (id),
  item_kind             TEXT NOT NULL CHECK (item_kind IN ('domain_registration',
                          'domain_privacy', 'certificate', 'mailbox', 'backups', 'cdn',
                          'site_builder', 'security')),
  sku_id                UUID NOT NULL REFERENCES skus (id),  -- what it is billed as alone
  quantity              NUMERIC NOT NULL DEFAULT 1,          -- e.g. 2 mailboxes per site
  free_months           SMALLINT,          -- null: for the life of the plan
  after_free            TEXT NOT NULL CHECK (after_free IN ('included', 'auto_renews',
                          'expires', 'offer_to_renew')),
  then_plan_version_id  UUID REFERENCES plan_versions (id),  -- the add-on's own terms,
                                           -- with its renewal_amount, when it auto-renews
  standalone_amount     BIGINT NOT NULL,   -- standalone selling price, minor units, for
                                           -- revenue allocation and refund deductions
  refund_deduction      BIGINT,            -- kept from a refund in the window, if any
  requires_term_months  SMALLINT[],        -- e.g. {12, 36}: only on these terms
  redeem_within         INTERVAL,          -- e.g. 90 days to claim the free domain
  CHECK ((free_months IS NULL) = (after_free = 'included')),
  CHECK ((after_free = 'auto_renews') = (then_plan_version_id IS NOT NULL))
);

CREATE TABLE upsell_offers (             -- an add-on offered at a placement, over time
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  code                     TEXT NOT NULL UNIQUE,  -- 'pro_email.checkout.2026q4'
  offered_plan_version_id  UUID NOT NULL REFERENCES plan_versions (id),
  placement                TEXT NOT NULL CHECK (placement IN ('checkout', 'post_purchase',
                             'dashboard', 'renewal_notice', 'cancellation', 'support')),
  eligibility              JSONB NOT NULL DEFAULT '{}',  -- plans, terms, markets: a rule
  trial_months             SMALLINT,              -- null: paid from the start
  preselected              BOOLEAN NOT NULL DEFAULT false,
  disclosure_id            UUID NOT NULL REFERENCES disclosures (id),  -- the playbook's versioned terms text
  valid_during             TSTZRANGE NOT NULL
);

CREATE TABLE upsell_attaches (           -- every time an offer was shown, and what happened
  id                        UUID PRIMARY KEY DEFAULT uuidv7(),
  offer_id                  UUID NOT NULL REFERENCES upsell_offers (id),
  account_id                UUID NOT NULL REFERENCES accounts (id),
  source_subscription_id    UUID REFERENCES subscriptions (id),  -- what it was attached to
  outcome                   TEXT NOT NULL CHECK (outcome IN ('accepted', 'declined',
                              'dismissed')),
  attached_subscription_id  UUID REFERENCES subscriptions (id),  -- the add-on's own
  renewal_consent_id        UUID REFERENCES renewal_consents (id),
  shown_at                  TIMESTAMPTZ NOT NULL,
  decided_at                TIMESTAMPTZ,
  CHECK ((outcome = 'accepted') = (attached_subscription_id IS NOT NULL)),
  CHECK (outcome <> 'accepted' OR renewal_consent_id IS NOT NULL)
);
```

Notes on the shape:

- **A bundled item becomes a subscription when it starts its own clock.** At checkout, every `plan_bundle_items` row with `after_free = 'auto_renews'` creates a subscription on `then_plan_version_id`, with a first period whose amount is zero and `pricing_phase = 'intro'`, and its own `renewal_consents` row pointing at the disclosure that named its renewal price. The domain's subscription renews a `domains` resource; the mailbox trial's renews a `mailboxes` resource. Each gets its own notices, which is what the law asks for and what customers expect.
- **Eligibility is a rule, not code.** Which plans and terms an offer applies to, in which markets, and whether it may be pre-selected are rows with effective dates, per [Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions).
- **Declines are data.** A declined offer is a row, so the same offer isn't shown again at the next step and the cancellation flow can prove it didn't loop a customer through save offers.
- **Standalone prices feed revenue.** `standalone_amount` is what the revenue schedule allocates by and what a refund deducts; it is recorded on the plan version so the allocation for a 2026 sale is computed from 2026's terms.

The listed renewal uplift of each plan version, normalized to a month, and what the first renewal bill will include:

```sql
SELECT p.code, pv.version, pv.term_months, pv.currency,
       ROUND(pv.intro_amount::numeric   / pv.term_months) AS intro_monthly,
       ROUND(pv.renewal_amount::numeric / pv.term_months) AS renewal_monthly,
       ROUND(pv.renewal_amount::numeric / NULLIF(pv.intro_amount, 0), 2) AS uplift_ratio,
       COALESCE(SUM(addon.renewal_amount) FILTER (WHERE bi.after_free = 'auto_renews'), 0)
         AS bundled_renewals_per_addon_term     -- domain, mailbox: on their own clocks
FROM plan_versions pv
JOIN plans p ON p.id = pv.plan_id
LEFT JOIN plan_bundle_items bi ON bi.plan_version_id = pv.id
LEFT JOIN plan_versions addon ON addon.id = bi.then_plan_version_id
WHERE pv.valid_during @> NOW() AND pv.intro_amount IS NOT NULL
GROUP BY p.code, pv.version, pv.term_months, pv.currency, pv.intro_amount, pv.renewal_amount
ORDER BY uplift_ratio DESC;
```

The realized uplift and renewal rate per cohort, from what customers actually paid:

```sql
WITH intro AS (
  SELECT sp.subscription_id, sp.plan_version_id, sp.currency, sp.amount AS intro_paid,
         lower(sp.valid_during) AS started, upper(sp.valid_during) AS intro_end
  FROM subscription_periods sp
  WHERE sp.pricing_phase = 'intro' AND sp.status = 'paid'
),
first_renewal AS (
  SELECT sp.subscription_id, lower(sp.valid_during) AS renewed_at, sp.amount AS renewal_paid
  FROM subscription_periods sp
  WHERE sp.pricing_phase = 'renewal' AND sp.status = 'paid'
)
SELECT date_trunc('quarter', i.started) AS cohort,
       pv.term_months, i.currency,
       COUNT(*)                                   AS reached_renewal,
       COUNT(r.subscription_id)                   AS renewed,
       ROUND(COUNT(r.subscription_id)::numeric / COUNT(*), 3) AS renewal_rate,
       ROUND(SUM(r.renewal_paid)::numeric
             / NULLIF(SUM(i.intro_paid) FILTER (WHERE r.subscription_id IS NOT NULL), 0), 2)
                                                  AS realized_uplift
FROM intro i
JOIN plan_versions pv ON pv.id = i.plan_version_id
LEFT JOIN first_renewal r ON r.subscription_id = i.subscription_id
                         AND r.renewed_at = i.intro_end
WHERE i.intro_end < NOW()
GROUP BY 1, 2, 3
ORDER BY 1, 2;
```

The gap between `uplift_ratio` and `realized_uplift` is what save offers, downgrades and term changes gave back; the gap between cohorts in `renewal_rate` is what a price change, a migration or a renewal-notice change did. Revenue recognition reads the same periods: each paid `subscription_periods` row, split across bundle components by `standalone_amount`, becomes a recognition schedule over its `valid_during` in the ledger the [Accounting](/docs/payments/accounting#recognition-schedules) doc describes; the hosting side never writes revenue, only the facts it is computed from.

Events: `bundle.item_started`, `bundle.item_converted` (a trial became paid), `upsell.shown`, `upsell.accepted`, `upsell.declined` and `subscription.renewed` with its pricing phase, through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, notifications and metrics.

## Auditing

- **What the customer was shown.** For each sale and each attach, the disclosure version, the intro and renewal prices and terms displayed, whether anything was pre-selected, and the consent record, kept for as long as the strictest renewal law the host sells under requires (the retention periods are [Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law)'s).
- **Every bundled item's conversion.** When a free domain renewed or a trial became paid, the subscription it came from, the notice sent before the charge, and the amount charged.
- **Offers and declines.** Which offers were shown at which placement and what the customer chose, so a complaint that a checkout or a cancellation flow pushed an add-on can be answered from records.
- **Renewal prices by version.** That each renewal charged the renewal amount of the plan version the customer agreed to, or a later price version with recorded notice.
- **Refund deductions.** Every refund that kept a bundled item's cost, with the standalone price it used and the policy text in force.

## What This Means for the System You Build

- **Store the renewal price with the sale.** Intro and renewal amounts and the term live on the plan version the customer bought; a price change is a new version with notice.
- **Model every free item as a subscription with its own clock.** Domain, mailbox, privacy and trials each get a plan version, a consent, a notice schedule and an off switch.
- **Record standalone prices** for every bundled component, for revenue allocation and refund deductions.
- **Make offers and declines rows,** with eligibility as effective-dated rules and the disclosure each offer showed.
- **Measure the first renewal by cohort:** renewal rate, realized uplift, attached products, and the effect of each price or notice change.
- **Keep bookings, deferred revenue and recognized revenue separate,** and expect long terms to delay every change by years.
- **Protect renewals through migrations.** A platform or brand consolidation should carry renewal dates, prices and notice timing across unchanged.

## References

**Filings and company results**

- [GoDaddy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), revenue, bookings, customers, ARPU, retention by tenure, share of revenue from prior-year customers, ratable recognition over terms up to ten years, renewal versus acquisition cost, cPanel and Plesk on shared hosting, automatic renewal laws
- [IONOS: FY2025 results](https://www.ionos-group.com/investor-relations/publications/announcements/ionos-reports-successful-2025-fiscal-year-profitability-at-record-levels.html), 19 Mar 2026, revenue, customers, adjusted EBITDA, AdTech as discontinued
- [Hostinger: 2025 results](https://www.hostinger.com/blog/?p=8625), 23 Feb 2026, company-reported revenue, customers, countries, AI agent support share
- [Clearlake: Newfold completes sale of Markmonitor](https://clearlake.com/news/newfold-digital-completes-sale-of-markmonitor-to-com-laude/), 31 Dec 2025, brands, customer count, owners, portfolio focus
- [Endurance International Group: IPO prospectus](https://www.sec.gov/Archives/edgar/data/0001237746/000119312513410787/d555515d424b4.htm), 24 Oct 2013, price, listing, subscribers, brands, payment in advance
- [GoDaddy announces pricing of initial public offering](https://aboutus.godaddy.net/newsroom/news-releases/press-release-details/2015/GoDaddy-Announces-Pricing-of-Initial-Public-Offering/default.aspx), 31 Mar 2015, shares, price, NYSE listing
- [Web.com: completion of acquisition by an affiliate of Siris](https://www.sec.gov/Archives/edgar/data/0001095291/000114420418053323/tv504565_ex99-1.htm), 11 Oct 2018, about $2 billion, NASDAQ delisting
- [Siris: Clearlake completes acquisition of Endurance and forms Newfold Digital](https://siris.com/news/clearlake-completes-acquisition-of-endurance-international-group-and-strategic-investment-transactions-with-web-com-and-affiliates-of-siris-announces-formation-of-newfold-digital), 10 Feb 2021, deal value, combination, customers, brands

**Pricing pages and terms (as of October 2026)**

- [Hostinger: pricing](https://www.hostinger.com/pricing), intro and renewal prices, 48-month terms, paid upfront, free domain and mailboxes for a year, fair use
- [Hostinger: universal terms of service](https://www.hostinger.com/legal/universal-terms-of-service-agreement), auto-renewal by default, charge timing, renewal at then-current fees, 30-day refund requests
- [SiteGround: web hosting](https://world.siteground.com/web-hosting.htm), intro and renewal prices, 12-month prepay, included domain, SSL, CDN, backups, email, 30-day guarantee
- [DreamHost: shared hosting](https://www.dreamhost.com/hosting/shared/), first-year and renewal prices, auto-renew wording, free domain and privacy, Professional Email trial
- [IONOS: web hosting](https://www.ionos.com/hosting/web-hosting), 1-year intro and renewal prices, included domain, certificate and email, 30-day guarantee
- [Bluehost: shared hosting](https://www.bluehost.com/hosting/shared), intro and renewal prices, 36-month term, free domain terms and auto-renewal, refund domain deduction, Pro Email trial renewal, included SSL, CDN and weekly backups
- [HostGator: web hosting](https://www.hostgator.com/web-hosting), renewal at regular rate, free domain terms, Pro Email trial renewal, refund exclusions
- [WP Engine: plans](https://wpengine.com/plans/), Essential billed annually, renewal pricing subject to change
- [Network Solutions: Register.com is becoming Network Solutions](https://www.networksolutions.com/help/article/ns-faqs-registerdotcom-becoming-network-solutions), pricing, billing, renewal dates and terms unchanged in the consolidation

**Press**

- [Yes Press: Newfold Digital](https://yespress.io/newfold-digital), formation in February 2021, identity in May 2021, Web.com combining into Network Solutions (June 2025)
- [webhosting.today: A2 Hosting has officially rebranded as hosting.com](https://webhosting.today/2025/05/02/a2-hosting-has-officially-rebranded-as-hosting-com/), acquisition by World Host Group and the rebrand

**Playbook**

- [Subscriptions](/docs/payments/subscriptions#the-law-of-automatic-renewal), the law of automatic renewal, consent and reminders as data
- [Accounting & Revenue Recognition](/docs/payments/accounting#asc-606-and-ifrs-15-in-five-steps), contract liabilities, allocation by standalone selling price, recognition schedules
- [Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions), offer eligibility as effective-dated rules
