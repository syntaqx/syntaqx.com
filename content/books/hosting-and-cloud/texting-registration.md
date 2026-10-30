+++
title = "Business Texting Registration"
nav_title = "Texting Registration"
description = "US business texting registration from the platform's side: 10DLC brands and campaigns, vetting, throughput, ISVs, toll-free verification, short codes, RCS."
category = "Hosting & Cloud Industry"
order = 2181
part = "Communications Platforms"
tags = ["10dlc", "toll-free", "short-codes", "rcs", "messaging", "registration"]
+++

In the United States, a business can't simply send texts from a number it leases. The mobile carriers decide which application-to-person (A2P) traffic reaches their subscribers, and since 2020 they have required every sender to be registered: the business itself as a brand, each use as a campaign, each number tied to a campaign, each toll-free number verified, each short code leased and certified. None of this is law. It is a private regime run by the carriers, The Campaign Registry and the short code registry, written down in CTIA's guidelines and enforced by filtering, throughput caps and fines. For a CPaaS it is also a product: the platform collects the registration data, submits it through registries and reviewers it doesn't control, waits days or weeks for answers, passes the fees through, and keeps every number's traffic within what its campaign says. A store sending marketing texts meets the regime from the other side, in the Commerce volume's [SMS Law for a Store](/books/commerce/email-sms-and-lifecycle#sms-law-for-a-store).

This chapter covers registration from the platform's side: how the regime grew, the 10DLC brand and campaign model with its vetting and throughput, registering a platform's own customers as an ISV, toll-free verification, short codes, RCS business messaging, what each costs, and how to model it. The carrier rules a sender must follow when writing messages (message types, opt-in and opt-out wording) are the playbook's [Texting: The Carrier Layer](/docs/compliance/consumer-contact#texting-the-carrier-layer), and what per-tenant registration means for an application is [Multi-Tenant Senders](/docs/architecture/notifications#multi-tenant-senders). Sending and enforcement once a campaign is approved is [Sending a Text](/books/hosting-and-cloud/sending-a-text).

## How the Providers Do It

Every US CPaaS runs the same registrations through the same registries; they differ in how much they automate, whether they mark up the fees, and what they publish. As of October 2026:

| Provider | Registration surfaces | Fees | What it publishes |
| --- | --- | --- | --- |
| **Twilio** | Brand and campaign registration by console and API; an ISV API with primary and secondary customer profiles and a brand per customer in that customer's subaccount; toll-free verification API with statuses | Pass-through registry fees | Brand types and their daily limits, use-case types, toll-free verification fields and error codes, MMS rate limits by trust score |
| **Bandwidth** | 10DLC registration, toll-free verification submitted to the toll-free messaging aggregator, short code program management | Its own prices: $9 per brand, $25 for Authentication+, $20 a month for a standard campaign (its 10DLC fees page, September 16, 2026) | Short code process timelines; Authentication+ for all brands after January 21, 2027 |
| **Telnyx** | Brand, campaign and toll-free verification by API | Registry fees passed through "at cost," campaign fees billed three months up front and then monthly | The fullest public tables of fees, carrier throughput by vetting score, and pass-through fines |
| **Plivo** | 10DLC, toll-free and short code registration | Lists RCS prices alongside SMS | Short code and RCS list prices |
| **Microsoft (Azure Communication Services)** | Toll-free verification with a program brief "automatically sent to the toll-free messaging aggregator for review" | Its own | Review "can typically take between five to six weeks" |

The common pattern: the platform is registered with The Campaign Registry as a Campaign Service Provider (CSP), every customer brand goes through it, and the platform's dashboard is a front end for external review queues it can't speed up.

## How It Got Here

The regime grew in layers, each one the carriers' answer to spam on a different kind of number:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| October 2003 | Twelve carriers launch common short codes, administered by CTIA with NeuStar as code registrar | One five- or six-digit code reachable on every carrier | A lease, a program brief and carrier certification for every code |
| July 22, 2015 | Somos launches the TSS Registry for text-enabling toll-free numbers | A record of which provider may text on a toll-free number | Text enablement becomes a registry authorization |
| November 16, 2016 | GSMA publishes RCS Universal Profile 1.0 | A common rich messaging profile for operators and handset makers | Years of uneven adoption before business messaging scaled |
| October 22, 2019 | Campaign Registry, Inc. is incorporated, "to promote a systems initiative to reduce spam by collecting robotically driven campaign information" | A central registry of business texting campaigns | Every brand and campaign becomes a paid registration |
| January 2020 | Verizon's 10DLC routes go live with per-message fees ($0.0025 per SMS and $0.005 per MMS at the time, per Twilio) | A sanctioned path for A2P on ordinary numbers | The first carrier surcharges on ten-digit traffic |
| 2021 | AT&T and T-Mobile add 10DLC registration and fees; Telnyx dates 10DLC's introduction to 2021 | Registration becomes the norm across carriers | Brand and campaign fees, vetting, trust scores |
| September 2023 | Twilio blocks unregistered 10DLC traffic on its platform | Platform-level enforcement | Customers who hadn't registered stopped sending |
| October 5, 2023 | Tata Communications completes its acquisition of Kaleyra, whose subsidiaries include Campaign Registry, Inc. | An ownership change, not a rule change | The registry sits inside a CPaaS group |
| November 8, 2023 and January 31, 2024 | Unverified toll-free traffic is blocked, then traffic from toll-free numbers still pending verification | Toll-free stops being the unregistered alternative | Every toll-free sender goes through verification |
| September 16, 2024 | iOS 18 ships with RCS in Messages | RCS reaches iPhones | Agents render differently on Apple and Google devices |
| October 17, 2024 | TCR introduces Authentication+, mandatory for public for-profit brands | Brand impersonation by companies claiming a listed parent | A verification email to the brand's own domain |
| February 1 and 3, 2025 | Unregistered 10DLC traffic is blocked industry-wide (Bandwidth and Telnyx dates) | The last unregistered path closes | Registration is a precondition of sending |
| August 1 and 7, 2025 | TCR raises brand registration to $4.50 and adds a $12.50 Authentication+ fee; Authentication+ 2.0 becomes mandatory for public and nonprofit brands | Stronger brand verification | Higher fees and a second verification step |
| February 17, 2026 | Toll-free verification requires a business registration number for new submissions (except sole proprietors) | Verification tied to a legal entity | Fewer fast approvals |
| March 18, 2026 | Twilio starts rolling out MMS rate limits tied to trust score, replacing a fixed account cap | MMS throughput by brand quality | Another dimension of throughput |
| September 15, 2026 | Toll-free verification requires privacy policy and terms URLs on new submissions (Twilio) | Disclosures reviewers can check | More rejections for incomplete submissions |

What the table shows is a steady move from "send, and the carriers will filter" to "register first, or nothing is delivered." Each step closed the path the previous one left open: short codes were vetted from the start, ten-digit numbers were the unvetted alternative until 10DLC, toll-free was the alternative until verification, and brand verification tightened once brands began claiming identities they didn't own.

## 10DLC: Brands and Campaigns

A2P 10DLC (application-to-person, ten-digit long code) is registration for texting from ordinary local numbers. It has two objects, held in The Campaign Registry and referenced by every carrier:

- **The brand** says who is sending. It is tied to a tax identity (an EIN in the US), the legal name, address, website and entity type (private, public, nonprofit, government, sole proprietor). Up to five Standard or Low-Volume Standard brands can share one tax ID, per Twilio.
- **The campaign** says what is sent: the use case, a description, sample messages, how recipients opt in, the opt-out and help keywords and replies, and whether messages carry links, phone numbers or age-gated content. Numbers are assigned to a campaign, and traffic on a number must match it.

Twilio's documentation describes three brand types with different ceilings:

| Brand type | Requires | Campaigns | Daily limit on T-Mobile |
| --- | --- | --- | --- |
| **Sole Proprietor** | No tax ID; for individuals | 1 | 1,000 segments (about 3,000 across carriers) |
| **Low-Volume Standard** | Tax ID | Up to 5 | Up to 2,000 segments |
| **Standard** | Tax ID, secondary vetting for higher limits | Multiple | 2,000 to unlimited, by trust score |

Use cases split into Standard (two-factor authentication, account notifications, customer care, marketing, mixed and others), Low-Volume Mixed (under 2,000 segments a day on T-Mobile) and Special (nonprofit, emergency, political, agents and franchises, platform free trial, with their own fees and reviews).

### Vetting and Trust Scores

A brand's identity is checked when it registers; a brand that wants more throughput buys secondary vetting from a vetting partner, which returns a score from 1 to 100. The score sets throughput on two carriers, which publish different shapes of limit. Telnyx's tables, as of October 2026:

| Vetting score | AT&T, per campaign (SMS messages per minute) | T-Mobile, per brand (segments per day) |
| --- | --- | --- |
| 75 to 100 | 4,500 (MMS 2,400) | 200,000 |
| 50 to 74 | 2,400 | 40,000 |
| 25 to 49 | 240 | 10,000 |
| 1 to 24, or unvetted | 240 | 2,000 |
| Low-Volume Mixed | 75 | Within the brand cap |
| Sole Proprietor | 15 | 1,000 |

AT&T also lists fixed rates for some special use cases (Social at 9,000 a minute, Political at 4,500). Verizon publishes no 10DLC throughput numbers and filters on content. T-Mobile's caps count segments, not messages, so a long or emoji-laden message uses several ([Sending a Text](/books/hosting-and-cloud/sending-a-text#segments-and-encoding)). A brand that needs more than 200,000 a day on T-Mobile applies for a Special Business Review, which Telnyx lists at $5,000 and "currently waived". Twilio added MMS limits by trust score in March 2026: on each major carrier, a score of 75 or more allows up to 40 MMS a second, 50 to 74 up to 20, under 50 up to 5, and Sole Proprietor 0.5 a second per number.

Throughput is therefore an output of registration. The platform stores the score and the limits each carrier derived from it, and its sender enforces them; a brand rescored after a vetting appeal gets new limits from a date.

### Authentication+

Authentication+ is TCR's check that the person registering a brand controls it. Introduced on October 17, 2024 and mandatory for public for-profit brands, it sends a verification email to an address on the brand's own domain. A reseller notice of the August 2025 changes describes Authentication+ 2.0: mandatory for public and new nonprofit brands from August 7, 2025, generic mailbox domains not accepted, the link valid for seven days, the process to be finished within 30 days, and failed or expired attempts charged. Bandwidth says Authentication+ will apply to all brands after January 21, 2027. For the platform, it is another asynchronous step with a human on the other end, and the most common reason a brand sits in "pending" for weeks.

### Registering Your Customers: the ISV Model

A software platform that texts on its customers' behalf is an ISV in the carriers' vocabulary, and the carriers' rule is that each of its customers is a brand of its own. Twilio's ISV design uses a primary customer profile for the ISV's own brands and a secondary customer profile and brand per customer, in that customer's subaccount. The playbook states the rule for the application ([Multi-Tenant Senders](/docs/architecture/notifications#multi-tenant-senders)); the reseller model in this volume is [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label). For the CPaaS, the consequences are:

- **Many brands per account.** One ISV account can hold thousands of brands, each with its own tax identity, vetting score and campaigns, each billed its own registration and monthly fees.
- **The ISV attests for its customers.** It collects their legal details and opt-in practices and submits them truthfully; a false registration is the ISV's violation as well as the customer's.
- **Shared numbers are a registration problem.** A number belongs to one campaign of one brand. An ISV can't put two customers on one number, which is why platforms that give each customer "a texting number" provision one per customer.
- **One bad tenant stays one bad tenant.** Because limits, filtering and fines attach to brands and campaigns, registering each customer separately is also the isolation boundary. Health care senders add a layer on top, from the TCPA's healthcare exemption to what a practice may put in a text under HIPAA ([Two-Way Texting & Messaging](/books/health-tech/patient-texting)).

## What Registration Costs

TCR publishes its fees to CSPs. Its "Fees and Pricing General Guide," last updated August 13, 2026:

| Fee | TCR price |
| --- | --- |
| CSP registration (one time) | $200.00 |
| Brand registration (government, nonprofit, private, public) | $4.50 |
| Brand registration (sole proprietor) | $4.00 |
| Brand identity resubmission | $4.50 |
| Brand identity appeal | $11.00 |
| Standard vet (Aegis or WMC) | $41.50 |
| Enhanced vet (Aegis) | $101.50 |
| Authentication+ vet, successful or failed | $12.50 |
| RCS vet | $50.00 |
| Political vet | $66.00 |
| Monthly campaign fee, most standard use cases | $10.00 |
| Monthly, Low-Volume Mixed / Sole Proprietor / Charity / Emergency | $1.50 / $2.00 / $3.00 / $5.00 |
| Monthly, Agents and Franchises | $30.00 |
| Monthly, Platform Free Trial | $0.00 |

Telnyx's table matches the brand and campaign fees and adds $15 per campaign vetting review (the carriers' review, separate from brand vetting) and a $50 Number Pool request for campaigns with 50 or more numbers. Providers decide whether to pass these through at cost, as Telnyx says it does, or to price them, as Bandwidth does ($9 per brand and $20 a month for a standard campaign). Either way they are pass-through or regulatory SKUs in the platform's catalog, effective-dated, because TCR has changed them at least twice since launch.

## Toll-Free Verification

Toll-free numbers can text, and until late 2023 they were the easy alternative to 10DLC. Verification closed that: a toll-free number must be verified for its business and use case before US carriers deliver its messages. Twilio's changelog dates the blocks: from November 8, 2023, messages from toll-free numbers neither verified nor pending were blocked (error 30032, or 30007 when filtered as spam on a verified number), and from January 31, 2024 numbers still pending verification were blocked too. Blocked messages are still billed.

A verification submission carries the business name and address, a contact, the use case and sample messages, the opt-in flow with proof (a screenshot or URL), expected monthly volume, and since 2026:

- **A business registration number** for new submissions from February 17, 2026, for every business type except sole proprietors. Telnyx's API takes `businessRegistrationNumber`, `businessRegistrationType` (EIN, CRA, Companies House, ABN, VAT, or SSN for sole proprietors) and `businessRegistrationCountry` (ISO alpha-2), and optional fields for age-gated content and opt-in keywords. (Telnyx's own page gives both February 1 and February 17.)
- **Privacy policy and terms URLs,** required on new submissions from September 15, 2026 per Twilio's changelog; a terms page that doesn't state message rates, frequency and opt-out instructions is rejected (Twilio error 30493).

Review goes to the toll-free messaging aggregator, which the providers' public pages don't name: Bandwidth submits the brief "to the Toll-Free Messaging Aggregator on your behalf," and Microsoft's documentation says the same. Telnyx says review typically takes one to two weeks; Microsoft says five to six. A verified toll-free number gets up to 20 messages a second on Telnyx. Text enablement itself (which provider may send on the number) is a separate record in Somos's TSS Registry.

## Short Codes

Short codes are five- and six-digit numbers leased from the Common Short Code Administration (CSCA, "The Short Code Registry is a service mark of CTIA"). They carry the highest throughput and the heaviest process. CSCA's leasing page says random codes are "less expensive" than Select codes (the registry's term for a code the lessee chooses) and that leases are "typically three, six, nine, or 12 months"; its FAQ gives the lease rates as $1,000 a month for a Select code and $500 a month for a Random one, for three, six or 12 months, paid in full before activation and non-refundable (as of October 2026). Setup and per-message costs come from the provider on top. CSCA recommends the CTIA Short Code Monitoring Handbook (version 1.9) when preparing a use case.

Bandwidth publishes its process, which matches the shape across providers:

- An internal risk review of one to two business days.
- A campaign brief compliance review of up to three weeks.
- Carrier submission and certification of up to eight weeks (new codes six to eight, migrations four to six), with no formal expedite.
- Shared short codes "can no longer be submitted": every code belongs to one program.
- Recurring programs must remind subscribers of the opt-out monthly.
- Migration from another provider needs the CSCA lease receipt, a letter from the provider and an AT&T letter on brand letterhead dated within 30 days.

Carriers audit live short code programs against the handbook, and a failed audit can suspend the code. For a platform, a short code is a resource with a lease term that renews (a subscription in the core model) and a program brief that is the source of truth for what it may send.

## RCS Business Messaging

RCS (Rich Communication Services) gives business messages branding, rich cards, suggested replies and read receipts, sent to the phone's default messaging app, falling back to SMS where RCS isn't available. A business sends through an RBM agent, which has its own launch process: third-party brand vetting (a verification email from Aegis, per Vibes's FAQ), carrier review of the program, and Google's own "review, vetting, and certification." Vibes likens it to the US short code process and says carrier compliance rules are the same as for short codes. TCR lists a $50 RCS vet.

Billing follows Google's categories. On November 20, 2025 Google combined the legacy "Basic Message" (an A2P message with "only text with 160 characters or less") and "Single Message" categories into one Non-conversational category, leaving Conversational and Non-conversational; existing agents migrate from March 16, 2026. Providers then price per segment or per message: Plivo lists RCS Rich at $0.0077 a segment and RCS Rich Media at $0.018 a message, as of October 2026. Apple added RCS to Messages in iOS 18 (September 16, 2024), and Vibes notes that agents render differently on Apple and Google devices.

## The Alternatives

A sender in the US chooses among four channels, and a platform offers all of them:

| Channel | Throughput | Time to launch | Cost shape | Strengths | Failure modes | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **10DLC** | By trust score: from 15 a minute on AT&T for a sole proprietor to 4,500; T-Mobile from 1,000 to 200,000 segments a day per brand | Days to weeks, depending on vetting and Authentication+ | Brand and vetting fees, monthly campaign fees, carrier surcharges | Local presence, two-way conversation, cheap numbers | Throughput caps; one campaign per number; Verizon content filtering | Appointment reminders, customer care, most ISVs |
| **Toll-free** | Up to 20 a second once verified (Telnyx) | One to six weeks of verification | Number fee, verification, carrier surcharges | No brand registration; national number | Verification queue; blocked while pending; error 30032 | Notifications, national businesses, quick starts |
| **Short code** | Highest | Weeks to months | Lease (quarterly or longer), setup, per-message | Throughput and recognition | Long certification, audits, no shared codes, lease renewals | Large-volume alerts, one-time passcodes at scale, marketing |
| **RCS** | Per agent | Weeks, with brand vetting and carrier review | Per message by category | Branding and rich content | Uneven reach; fallback to SMS; per-device rendering | Brands that want rich messages, with SMS fallback |

My default for a platform's customers is 10DLC for anything conversational or local, a verified toll-free number for national notifications and for customers whose 10DLC vetting will take too long, and a short code only when a customer's volume or passcode traffic outgrows both. I'd add RCS as an upgrade on top of whichever SMS channel is registered, never as a replacement, because the fallback is still SMS and the SMS registration still has to exist.

## How to Build It

The chapter adds brands, campaigns, campaign number assignments, toll-free verifications, short code programs and the external review trail to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Each registration is a `resources` row of kind `sender_identity` with a `sender_identities` side row whose `channel` says what it is (`sms_brand`, `sms_campaign`, `toll_free_verification`, and for short code programs and RCS agents `short_code_program` and `rcs_agent`), so holds, abuse cases and audit attach to it like any other resource:

```sql
CREATE TABLE sms_brands (                -- side table: sender_identities.channel = 'sms_brand'
  resource_id       UUID PRIMARY KEY REFERENCES resources (id),
  registry_brand_id TEXT UNIQUE,         -- TCR's id, once registered
  entity_type       TEXT NOT NULL CHECK (entity_type IN ('private', 'public', 'nonprofit',
                      'government', 'sole_proprietor')),
  legal_name        TEXT NOT NULL,
  tax_id_country    CHAR(2),
  tax_id            TEXT,                -- a business EIN; null for a sole proprietor
  website           TEXT,
  stock_symbol      TEXT,                -- public brands
  brand_type        TEXT NOT NULL CHECK (brand_type IN ('sole_proprietor',
                      'low_volume_standard', 'standard')),
  identity_status   TEXT NOT NULL CHECK (identity_status IN ('pending', 'verified',
                      'unverified', 'vetted_verified', 'suspended')),
  auth_plus_status  TEXT CHECK (auth_plus_status IN ('not_required', 'pending', 'verified',
                      'failed', 'expired')),
  vetting_provider  TEXT,                -- 'aegis', 'wmc'
  vetting_score     SMALLINT CHECK (vetting_score BETWEEN 1 AND 100),
  vetted_at         TIMESTAMPTZ,
  registered_for_account UUID NOT NULL REFERENCES accounts (id)  -- the ISV's customer
);

CREATE TABLE sms_campaigns (             -- side table: sender_identities.channel = 'sms_campaign'
  resource_id          UUID PRIMARY KEY REFERENCES resources (id),
  brand_resource_id    UUID NOT NULL REFERENCES sms_brands (resource_id),
  registry_campaign_id TEXT UNIQUE,
  use_case             TEXT NOT NULL,    -- the registry's code: '2FA', 'ACCOUNT_NOTIFICATION', ...
  sub_use_cases        TEXT[] NOT NULL DEFAULT '{}',
  description          TEXT NOT NULL,
  message_samples      TEXT[] NOT NULL,
  opt_in_description   TEXT NOT NULL,
  opt_in_proof_ref     TEXT,             -- screenshot or URL of the opt-in flow
  opt_out_keywords     TEXT[] NOT NULL DEFAULT '{STOP}',
  help_reply           TEXT NOT NULL,
  has_links            BOOLEAN NOT NULL,
  has_phone_numbers    BOOLEAN NOT NULL,
  age_gated            BOOLEAN NOT NULL DEFAULT FALSE,
  monthly_fee_sku_id   UUID REFERENCES skus (id),  -- pass_through = 'carrier' or 'regulatory'
  carrier_limits       JSONB NOT NULL DEFAULT '{}' -- as granted: {"us.att": {"tpm": 4500},
                                                   --  "us.tmobile": {"brand_daily": 200000}}
);

CREATE TABLE campaign_numbers (          -- a number belongs to one campaign at a time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  campaign_resource_id UUID NOT NULL REFERENCES sms_campaigns (resource_id),
  number_resource_id  UUID NOT NULL REFERENCES resources (id),  -- kind = 'phone_number'
  status              TEXT NOT NULL CHECK (status IN ('pending', 'active', 'failed',
                        'removed')),
  assigned_during     TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (number_resource_id WITH =, assigned_during WITH &&)
);

CREATE TABLE toll_free_verifications (   -- side table: channel = 'toll_free_verification'
  resource_id          UUID PRIMARY KEY REFERENCES resources (id),
  number_resource_id   UUID NOT NULL REFERENCES resources (id),
  business_name        TEXT NOT NULL,
  registration_number  TEXT,             -- required for new submissions from 2026-02-17
  registration_type    TEXT,             -- 'EIN', 'CRA', 'COMPANIES_HOUSE', 'ABN', 'VAT', 'SSN'
  registration_country CHAR(2),
  use_case             TEXT NOT NULL,
  message_samples      TEXT[] NOT NULL,
  opt_in_description   TEXT NOT NULL,
  opt_in_proof_ref     TEXT NOT NULL,
  privacy_policy_url   TEXT,             -- required on new submissions from 2026-09-15
  terms_url            TEXT,
  monthly_volume       INT
);

CREATE TABLE short_code_programs (       -- side table: channel = 'short_code_program'
  resource_id          UUID PRIMARY KEY REFERENCES resources (id),
  number_resource_id   UUID NOT NULL REFERENCES resources (id),  -- the short code
  code_type            TEXT NOT NULL CHECK (code_type IN ('random', 'select')),
  lease_subscription_id UUID REFERENCES subscriptions (id),       -- the CSCA lease term
  program_brief_ref    TEXT NOT NULL,    -- the brief carriers certified
  carriers_live        TEXT[] NOT NULL DEFAULT '{}',              -- carriers.id
  last_audit_at        TIMESTAMPTZ
);

CREATE TABLE registration_reviews (      -- every submission to an external reviewer
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  sender_identity_id UUID NOT NULL REFERENCES resources (id),
  reviewer           TEXT NOT NULL,      -- 'tcr', 'aegis', 'us.tmobile', 'tf_aggregator',
                                         -- 'csca', 'google_rbm', 'meta', 'in.dlt'
  kind               TEXT NOT NULL CHECK (kind IN ('brand_registration', 'auth_plus',
                       'secondary_vetting', 'campaign_review', 'tf_verification',
                       'short_code_certification', 'rcs_launch', 'business_verification',
                       'display_name_review', 'sender_id_registration', 'appeal')),
  submitted_payload  JSONB NOT NULL,     -- exactly what was sent
  submitted_at       TIMESTAMPTZ NOT NULL,
  outcome            TEXT CHECK (outcome IN ('approved', 'rejected', 'expired',
                       'withdrawn')),
  outcome_codes      TEXT[],             -- the reviewer's rejection codes
  outcome_at         TIMESTAMPTZ,
  fee_rated_usage_id UUID REFERENCES rated_usage (id)  -- the fee this attempt incurred
);
```

Notes on the sketch:

- **Registrations are resources.** A brand, a campaign, a toll-free verification and a short code program each have an owner, a lifecycle, a cost and a reputation, and can be suspended. Making them `resources` gives them holds, abuse cases and audit for free.
- **The brand records whose it is.** `registered_for_account` is the ISV's customer: the account that answers for the brand, even when the ISV's account pays.
- **Numbers belong to one campaign at a time,** enforced by the exclusion constraint; moving a number between campaigns closes one range and opens another, so a message can always be traced to the campaign it was sent under.
- **Limits are stored as granted.** `carrier_limits` holds what each carrier derived from the score at approval, because the sender enforces those numbers, not the score ([Sending a Text](/books/hosting-and-cloud/sending-a-text#throughput)).
- **Every submission is kept exactly as sent.** `registration_reviews` is append-only: the payload, the reviewer, the result and its codes. Resubmissions are new rows. "Why was this campaign rejected three times?" and "what did we tell the carrier?" are queries, and the most common rejection codes become validation in the registration form.
- **Fees are usage of a SKU.** Registration, vetting, Authentication+ attempts (successful or failed) and monthly campaign fees rate against pass-through SKUs, so a customer's invoice shows what the registries charged.
- **Events:** `brand.submitted`, `brand.verified`, `brand.vetted`, `campaign.approved`, `campaign.rejected`, `campaign_number.assigned`, `tf_verification.approved`, `tf_verification.rejected` and `short_code.certified` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the sender (which may now send on the number), billing and the customer's webhooks.

## Auditing

- **What was registered, as submitted.** Every brand and campaign payload, sample messages and opt-in proof, because a carrier complaint or a fine is judged against the registration.
- **Which campaign each number belonged to, when,** so every message maps to a registration.
- **Every review and its outcome,** with codes and dates, to show diligence and to answer customers asking why approval took weeks.
- **Fees incurred per attempt,** including failed Authentication+ and vetting attempts.
- **ISV attestations:** which customer a brand represents and what the ISV collected to register it ([Auditing](/books/hosting-and-cloud/accounts-and-resellers#auditing)).

## What This Means for the System You Build

- **Build registration as a set of external review workflows,** with payloads kept exactly as sent and outcomes as append-only rows.
- **Make every brand, campaign, verification and short code program a resource,** so holds, abuse cases and audit attach to it.
- **Register each customer as its own brand** if you are an ISV, and provision numbers per customer, because a number belongs to one campaign.
- **Store the carrier limits granted,** not just the score, and feed them to the sender.
- **Price registration fees as effective-dated pass-through SKUs,** including the failed attempts.
- **Validate submissions against the reviewers' known rejections** (missing business registration numbers, terms pages without rates and opt-out, opt-in proof that doesn't show consent) before they leave the platform.
- **Treat RCS as an upgrade path** on top of a registered SMS channel, never a substitute for one.

## References

**Registries and carriers**

- [The Campaign Registry](https://www.campaignregistry.com/), Campaign Registry, Inc. as operator
- [The Campaign Registry: Fees and Pricing General Guide (PDF)](https://www.campaignregistry.com/Assets/TCR%20Fees%20and%20Pricing.pdf), CSP, brand, vetting, Authentication+, RCS and campaign fees, last updated August 13, 2026
- [The Campaign Registry: Authentication+](https://www.campaignregistry.com/authentication-enhances-a2p-10dlc-security/), introduced October 17, 2024 and mandatory for public for-profit brands
- [Kaleyra: Form 10-K for 2022](https://www.sec.gov/Archives/edgar/data/1719489/000095017023008497/klr-20221231.htm), Campaign Registry, Inc. incorporated October 22, 2019 and its purpose
- [Kaleyra: Subsidiaries (Exhibit 21.1)](https://www.sec.gov/Archives/edgar/data/1719489/000095017023008497/klr-ex21_1.htm), Campaign Registry, Inc. as a subsidiary
- [Tata Communications completes acquisition of Kaleyra (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1719489/000119312523253538/d915044dex991.htm), completion on October 5, 2023
- [CSCA: Finding and leasing a short code](https://www.usshortcodes.com/finding-and-leasing-a-short-code/), random and select codes, lease terms, the monitoring handbook
- [CSCA: FAQs](https://www.usshortcodes.com/learn-more/faqs/), $1,000 a month for a Select code and $500 for a Random code, three, six or 12 month terms paid upfront, non-refundable
- [RCR Wireless: Carriers come together on common short code service (2003)](https://rcrwireless.com/20031017/archived-articles/carriers-come-together-on-common-short-code-service), the October 2003 launch with CTIA and NeuStar
- [Somos: Launch of the TSS Registry](https://www.somos.com/insights/somos-launches-texting-and-smart-services-tss-registry), toll-free text enablement from July 22, 2015
- [GSMA: RCS Universal Profile 1.0 (PDF)](https://www.gsma.com/futurenetworks/wp-content/uploads/2017/07/RCC.71_v1.0.pdf), version 1.0 of November 16, 2016
- [Google: RBM billing FAQ](https://developers.google.com/business-communications/rcs-business-messaging/guides/learn/rbm-billing-faq), the Non-conversational category and the March 16, 2026 migration
- [Apple: iOS 18 is available today](https://www.apple.com/newsroom/2024/09/ios-18-is-available-today-making-iphone-more-personal-and-capable-than-ever/), RCS in Messages from September 16, 2024

**Provider documentation**

- [Twilio: A2P 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc), brands, campaigns, brand types and limits, use-case types, brands per tax ID
- [Twilio: A2P 10DLC onboarding for ISVs](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/onboarding-isv), primary and secondary customer profiles and a brand per customer
- [Twilio: What's new with A2P 10DLC (December 2020)](https://www.twilio.com/en-us/blog/company/news/whats-new-a2p-10dlc), Verizon routes live since January 2020 and its fees, AT&T and T-Mobile plans
- [Twilio: Increased MMS rate limits for A2P 10DLC](https://www.twilio.com/en-us/changelog/increased-mms-rate-limits-for-a2p-10dlc-phone-numbers-in-the-u-s0), MMS limits by trust score from March 2026
- [Twilio: Messaging on unverified toll-free numbers fully blocked](https://www.twilio.com/en-us/changelog/messaging-on-unverified-u-s--toll-free-phone-numbers-now-fully-b), the November 8, 2023 block
- [Twilio: Messaging on toll-free numbers pending verification](https://twilio.com/en-us/changelog/messaging-on-u-s--toll-free-phone-numbers-pending-verification-i), the January 31, 2024 block and error codes
- [Twilio: Business registration numbers required for toll-free messaging](https://www.twilio.com/en-us/changelog/business-registration-numbers-required-for-toll-free-messaging-p), from February 17, 2026
- [Twilio changelog via releases.sh mirror](https://releases.sh/twilio/twilio-changelog.md?cursor=2026-09-25T04%3A00%3A00.000Z%7C2026-09-26T06%3A08%3A05.039Z%7Crel__vHsIQbC1_rs_zcJaDAnN&limit=20), privacy policy and terms URLs required from September 15, 2026
- [Twilio: Error 30493](https://www.twilio.com/docs/api/errors/30493), terms pages must state rates, frequency and opt-out
- [Twilio: Toll-free message verification](https://www.twilio.com/docs/messaging/compliance/toll-free-message-verification), verification statuses
- [Telnyx: 10DLC fees and charges](https://support.telnyx.com/en/articles/5634625-10dlc-fees-and-charges), at-cost pass-through, campaign vetting, monthly fees, Special Business Review, Number Pool
- [Telnyx: 10DLC throughput](https://telnyx.com/resources/10dlc-throughput), AT&T and T-Mobile limits by vetting score
- [Telnyx: Frequently asked questions about 10DLC](https://support.telnyx.com/en/articles/3679260-frequently-asked-questions-about-10dlc), introduced in 2021 and the February 3, 2025 block
- [Telnyx: Toll-free verification](https://developers.telnyx.com/docs/messaging/toll-free-verification), fields, business registration types, review time and throughput
- [Bandwidth: 10DLC FAQ](https://www.bandwidth.com/support/en/articles/12823085-10dlc-faq), the industry block from February 1, 2025
- [Bandwidth: 10DLC fees](https://www.bandwidth.com/support/en/articles/12823086), its brand, Authentication+ and campaign prices and the January 21, 2027 date
- [Bandwidth: Toll-free verification 411](https://www.bandwidth.com/blog/toll-free-verification-411-video/), submission to the toll-free messaging aggregator
- [Bandwidth: Short code process](https://www.bandwidth.com/support/en/articles/12823236), review and certification timelines, shared codes, migrations
- [Microsoft Learn: Apply for toll-free verification](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/sms/apply-for-toll-free-verification), the aggregator review and five to six weeks
- [Plivo: SMS pricing for the United States](https://www.plivo.com/sms/pricing/us/), RCS prices
- [Vibes: RBM Q&A (PDF)](https://cdn.vibes.com/rcs-services/Vibes+Connect+RBM+Q%26A+V2.pdf), RBM agent launch, vetting and carrier review, rendering on iOS

**In practice**

- [Zoho: Changes to 10DLC TCR pricing and new authentication requirements](https://help.zoho.com/portal/en/community/topic/attention-changes-to-10dlc-tcr-pricing-and-new-authentication-requirements), the August 2025 fee change and Authentication+ 2.0 (reseller notice)
- [Twilio: Shutdown of unregistered 10DLC messaging](https://support.twilio.com/hc/en-us/articles/14910496447771-Shutdown-of-Unregistered-10DLC-Messaging), Twilio's platform block from September 2023
