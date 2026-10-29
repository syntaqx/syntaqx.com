+++
title = "Customers, Accounts & Privacy"
description = "Accounts and guests, identity merge, addresses, marketing consent, CCPA and the state privacy laws, deletion against retention, and customer segments."
category = "Commerce Industry"
nav_title = "Customers & Privacy"
order = 2314
part = "Storefront and Checkout"
tags = ["commerce", "customers", "accounts", "privacy", "consent"]
+++

A store's customer is a person it can recognize: by an email on a guest order, a signed-in account, a phone number on a text subscription, a loyalty card at the register, a wallet that filled the checkout. Most of them never create an account, and many exist several times over (a guest order last year, an account this year, a different email on a marketplace order the brand will never see). The customer record is what joins those into one person, holds what they agreed to receive, and answers the privacy law that gives them the right to see it, correct it and have it deleted, while the tax and accounting law requires keeping their orders for years.

This chapter covers accounts and guests and how platforms model them, identity and merging duplicates, addresses, marketing consent as a record, the US state privacy laws and CCPA in depth with GDPR where it binds, deletion against retention, and customer segments. Login and session security are the playbook's [Authentication](/docs/security/authentication); GDPR in general is [GDPR](/docs/compliance/gdpr); consent for analytics and cookies is [Consent & Privacy](/docs/telemetry/consent-and-privacy); the messages themselves are the later Email, SMS & Lifecycle Marketing chapter. The chapter extends `customers` in [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `customer_addresses`, `marketing_consents`, `customer_merges`, `privacy_requests` and `customer_segments`.

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Platform | Guest and account | Identity key | Sign-in | Marketing consent |
| --- | --- | --- | --- | --- |
| **Shopify** | A customer profile is created when someone signs up, places an order or abandons a checkout; guests and account holders are both profiles | "the order's email address is used as a unique identifier"; changing an order's email later doesn't relink it | New customer accounts: email plus a one-time 6-digit code, no password, with social sign-in, self-serve returns and store credit; legacy password accounts "are deprecated" | Per channel: `SUBSCRIBED`, `NOT_SUBSCRIBED`, `PENDING`, `UNSUBSCRIBED`, `INVALID`, `REDACTED`, with an opt-in level (`SINGLE_OPT_IN`, `CONFIRMED_OPT_IN`, `UNKNOWN`), a `consentUpdatedAt` and the source location |
| **commercetools** | Customers with or without passwords; anonymous carts and orders by an anonymous ID | Customers "unique across a Project," or per store when a project uses stores | Password or external authentication | Custom fields |
| **Medusa** | One Customer Module storing "guest and registered customers" | Email | The auth module, separate from the customer | Custom data |
| **Saleor** | Checkouts carry an email; a user is attached when signed in | Email | Saleor accounts or an external provider | Metadata and apps |

Two choices recur across them: **a guest is a customer record, not an absence of one**, and **the email is the join key until something better exists.** Both are right for consumer commerce and both have consequences the rest of this chapter deals with.

## Accounts and Guests

The core model's `customers` row is deliberately thin (merchant, kind, status); a person's identifiers and account state live on it or beside it, extended in [How to Build It](#how-to-build-it). The distinction that matters:

- **A guest** gave an email or phone at checkout and nothing else; they can't sign in, but their orders, addresses and consent belong to a customer row, so the next order from the same email is the same customer.
- **An account holder** can sign in and see their orders, addresses, subscriptions and returns. The trend is away from passwords: Shopify's new customer accounts sign in with a one-time code to the email, which also proves the email belongs to them. Passkeys are the stronger form of the same idea ([Passkeys First](/docs/security/authentication#passkeys-first)).
- **A business buyer** is a customer who acts for a `company`, with a role (the later B2B Commerce chapter); the person and the company are separate records.

The account is offered after checkout, not before it ([Guest Checkout](/books/commerce/cart-and-checkout#guest-checkout)), and becomes valuable through what it does: order status and tracking without a support ticket, returns, subscription changes, saved addresses and payment methods. Account takeover is the cost: a signed-in account with saved cards and store credit is worth stealing, and its defenses (rate limits, step-up for changing the email or adding an address at checkout) are the playbook's ([Credential Stuffing and Enumeration](/docs/security/authentication#credential-stuffing-and-enumeration)) and the later Commerce Fraud & Abuse chapter's.

## Identity and Merge

One person becomes several customers easily: a guest order with a work email, an account with a personal one, a phone-only text subscriber, a store purchase on a loyalty number. Joining them is record linkage ([Record Linkage](/docs/architecture/record-linkage)), and the commerce rules are:

- **Match before create.** At checkout, look up the customer by normalized email (lowercase, trimmed; don't strip dots or plus-suffixes, which are different mailboxes at some providers) and attach the order to the existing customer rather than creating a new one ([Match Before Create](/docs/architecture/record-linkage#match-before-create)).
- **Attach, don't expose.** A guest order matched to an account by email appears in that account only after the account holder has proven the email (a one-time code or a verified sign-up); otherwise anyone who types someone's email at checkout could plant or reveal orders.
- **Merge deliberately and reversibly.** Two customer rows for one person are merged by a rule (same verified email, or staff confirmation), with a surviving record, a list of what moved (orders, addresses, consent, loyalty balance, subscriptions) and the ability to undo it ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)). Consent is the delicate part: the merged record keeps the most recent explicit choice per channel, never the most permissive.
- **Merge within a merchant only.** Customers belong to a merchant (`customers.merchant_id`); a platform that hosts many merchants never merges a shopper across them without the shopper's own action, because each merchant is a separate controller of that person's data.
- **Marketplace buyers aren't yours.** An Amazon order gives the seller a shipping address and, often, a masked or no email; it creates a customer row for fulfillment and returns, kept apart from the brand's own customers and not used for marketing, under the marketplace's terms ([Customer Data](/books/commerce/selling-on-amazon#customer-data)).

Fraud linkage is a different question with similar machinery: [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#promotion-abuse) links devices, cards and addresses across accounts to stop promotion abuse, without merging the customers.

## Addresses

A customer's saved addresses are a convenience; an order's addresses are a record. The two are separate: `customer_addresses` holds the address book (with default shipping and billing, as commercetools and Shopify both model), and every order and fulfillment copies the address it used as a snapshot, so editing the address book never changes where a past order went. Capture, standardization and validation are the playbook's [Addresses](/docs/fundamentals/addresses); validation at checkout is [Address Validation](/books/commerce/cart-and-checkout#address-validation). An address is personal data in every privacy law in this chapter, including a gift recipient's address, which belongs to someone who isn't the customer.

## Marketing Consent

Consent to marketing is a record per channel, with its history, not a checkbox column. The models converge on the same fields: Shopify stores, per customer and channel, a state (subscribed, not subscribed, pending confirmation, unsubscribed, invalid, redacted), the opt-in level ("per M3AAWG best practices": single or confirmed opt-in), when it changed and where it was collected. What the law needs from the record:

- **What was agreed, where and when.** The channel (email, SMS, push, postal), the wording shown at the checkbox, the page or form, the timestamp and the source; an SMS consent under the TCPA needs the disclosure and the number it covers ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent)).
- **Separate from the transaction.** Order confirmations and shipping updates are transactional and need no marketing consent; a newsletter, a promotion or an abandoned-cart reminder is marketing in most readings. The checkbox at checkout is unchecked by default and optional.
- **The UK and EU soft opt-in.** Under the UK's PECR, a business may email an "existing customer who bought (or negotiated to buy) a similar product or service" about similar products without a fresh opt-in, if it gave "a simple way to opt out both when you first collected their details and in every message"; it doesn't cover bought-in lists. That makes "collected during a purchase, with an opt-out offered" a consent basis of its own, recorded as such.
- **Withdrawal wins immediately.** An unsubscribe from any source (a link, a reply STOP, a support request, a privacy opt-out) is a new row that every sending system honors, and the later Email, SMS & Lifecycle Marketing chapter's suppression lists are fed from it.

## Privacy Law

### The US State Laws

The US has no general federal privacy law for commerce; it has state laws, and a store that sells nationally is subject to most of them. As of October 2026, by Osano's tracker, comprehensive laws are in force in nineteen states: California (CCPA from 2020, amended by the CPRA from 2023), Virginia (January 1, 2023), Colorado and Connecticut (July 1, 2023), Utah (December 31, 2023), Texas and Oregon (July 1, 2024), Montana (October 1, 2024), Delaware, Iowa, Nebraska and New Hampshire (January 1, 2025), New Jersey (January 15, 2025), Tennessee (July 1, 2025), Minnesota (July 31, 2025), Maryland (October 1, 2025), and Indiana, Kentucky and Rhode Island (January 1, 2026). MultiState counts twenty by including Florida's narrower law. Osano lists further laws enacted for 2027 and 2028 (Louisiana, Oklahoma, Alabama and Vermont); trackers disagree on some of them, so a store should check each against the statute before relying on it. <!-- source-gap: state-privacy-2027 | secondary | Louisiana, Oklahoma, Alabama and Vermont comprehensive privacy laws and effective dates | closes with: each enacted bill on its legislature's site | checked: 2026-10-28 -->

The laws share a shape: they apply above a threshold of consumers in the state (100,000 is common; Indiana and Kentucky use 100,000, or 25,000 with half of revenue from selling data; Rhode Island 35,000, or 10,000 with more than 20% from sales), and give consumers rights to access, correct, delete and port their data and to opt out of its sale, of targeted advertising and of profiling. A DTC brand crosses most consumer thresholds as it grows, because every guest checkout, newsletter signup and pixel-tracked visitor is a consumer.

### CCPA in Practice

California's law is the most detailed and the most enforced, and building to it covers most of the rest. As of October 2026:

- **Who it covers.** A business with annual revenue over $26,625,000 (the CPI-adjusted figure from January 1, 2025), or that buys, sells or shares the personal information of 100,000 or more California consumers or households, or that earns half or more of its revenue from selling or sharing it. Fines run up to $2,663 per violation, or $7,988 for intentional violations or those involving minors under 16.
- **The rights.** To know, delete and correct; to opt out of the sale or sharing of personal information; to limit the use of sensitive personal information; and not to be discriminated against for using them.
- **The clocks.** Confirm receipt of a request within 10 business days and respond "no later than 45 calendar days," extendable once by 45 more "for a maximum total of 90 calendar days" with notice.
- **Global Privacy Control.** A business that sells or shares personal information "shall process any opt-out preference signal" that meets the regulations "as a valid request to opt-out of sale/sharing," for the browser or device and, if known, the consumer ([California: Opt-Out of Sale and Sharing](/docs/telemetry/consent-and-privacy#california-opt-out-of-sale-and-sharing)). For a store, the ad and analytics pixels on the storefront are usually what makes it "share."
- **Loyalty programs are financial incentives.** A program that gives discounts or points in exchange for personal information needs a notice "readily available where consumers will encounter it before opting-in," with the material terms, the right to withdraw "at any time," and "a good-faith estimate" of the value of the consumer's data and how it was calculated (the later Memberships & Loyalty chapter).
- **New regulations.** Rules on cybersecurity audits, risk assessments and automated decision-making technology took effect January 1, 2026, with ADMT compliance from January 1, 2027 and the first risk-assessment attestations and audit certifications (for businesses over $100 million in revenue) due April 1, 2028.

Enforcement has landed on retailers repeatedly, and the findings read like a checklist:

| Case | Year | Amount | What was wrong |
| --- | --- | --- | --- |
| Sephora (Attorney General) | 2022 | $1.2 million | Didn't disclose that it sold data through third-party tracking, didn't honor GPC |
| Honda (CPPA) | 2025 | $632,500 | Excessive verification for opt-outs, an asymmetric choice interface, barriers for authorized agents, missing contracts with ad-tech vendors |
| Todd Snyder (CPPA) | 2025 | $345,178 | Opt-out requests unprocessed for 40 days, more information collected than needed, verification required before an opt-out |
| Healthline (Attorney General) | 2025 | $1.55 million | Ignored opt-outs and GPC, shared article titles suggesting diagnoses, a deceptive consent banner |
| Tractor Supply (CPPA) | 2025 | $1.35 million | No notice of rights in its privacy policy, no notice to job applicants, no working opt-out including GPC, no contracts with recipients |

Every one is a system failure rather than a policy one: a pixel nobody inventoried, an opt-out queue nobody worked, a verification step that shouldn't exist, a contract that was never signed.

### GDPR and the UK

A store selling to people in the EU or UK is a controller under GDPR and the UK GDPR ([GDPR](/docs/compliance/gdpr)). The commerce specifics are the lawful basis per purpose (contract for fulfilling the order, legal obligation for tax records, consent or legitimate interest for marketing, per the soft opt-in above) and the response clock: one month for a data subject request, extendable by two further months ([Data Subject Rights](/docs/compliance/gdpr#data-subject-rights)).

## Deletion Against Retention

A deletion request meets records the merchant must keep. GDPR's right to erasure does not apply where processing is "necessary for compliance with a legal obligation," and the US laws have equivalent exceptions; the legal obligations in commerce are concrete:

- **Tax records.** The IRS's general period is 3 years from filing, 6 if more than 25% of gross income was omitted, 7 for bad debt claims; UK VAT records are kept "at least 6 years"; the EU VAT Directive leaves invoice retention to each member state; Texas exemption certificates are kept 4 years from the sale.
- **Disputes and fraud.** Records for a chargeback that can arrive months after the sale, and fraud signals needed to defend a refund decision.
- **Product safety and recalls.** Who bought a recalled product ([Recalls](/books/commerce/product-safety-and-recalls#recalls)).

So deletion in commerce is mostly **redaction**: the customer row's name, email, phone and saved addresses are erased or replaced with a token, marketing consent and segments are deleted, the account is closed, and orders keep what tax and accounting require (the amounts, the tax jurisdiction, the date) with personal fields redacted or held under a retention schedule that deletes them when the obligation ends. Shopify's `REDACTED` consent state, for a customer whose "personal data is erased," is this pattern in a platform's data model. The playbook covers the mechanics ([Erasure Requests](/docs/architecture/data-retention#erasure-requests), [Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)); the commerce rule is that **deletion must reach every system holding a copy**: the platform, the email and SMS tools, the reviews app, the subscription app, the helpdesk, the data warehouse and the ad platforms the pixels fed ([Deletion Reaches the Analytics Tools](/docs/telemetry/consent-and-privacy#deletion-reaches-the-analytics-tools)). The privacy request record tracks each one.

## Customer Segments

A segment is a definition over customer data ("bought twice in 90 days," "subscribers in Texas," "wholesale accounts on net 30"), used for marketing, for price lists and promotions, for support priority and for reporting. Three rules keep segments honest:

- **Store the definition, compute the members.** A segment is a rule with a version; membership is recomputed on a schedule or by event, with each run recorded, so "why did this customer get that offer" has an answer.
- **Consent gates use, not membership.** A customer can be in a segment and not be contactable; the sending system checks `marketing_consents` at send time, every time.
- **Sensitive inferences are sensitive data.** A segment that implies health, pregnancy or another sensitive category ("bought prenatal vitamins") is sensitive personal information under several state laws, and Healthline's settlement was in part about exactly that kind of inference shared with advertisers. Such segments need a purpose limit and never leave for ad platforms.

## How to Build It

Extending `customers` with its identifiers and account state, and adding the address book, consent ledger, merges, privacy requests and segments:

```sql
ALTER TABLE customers
  ADD COLUMN email             TEXT,       -- normalized: lowercase, trimmed
  ADD COLUMN email_verified_at TIMESTAMPTZ,
  ADD COLUMN phone             TEXT,       -- E.164
  ADD COLUMN given_name        TEXT,
  ADD COLUMN family_name       TEXT,
  ADD COLUMN has_account       BOOLEAN NOT NULL DEFAULT FALSE,  -- false: a guest
  ADD COLUMN merged_into       UUID REFERENCES customers (id),
  ADD COLUMN redacted_at       TIMESTAMPTZ;  -- personal fields erased for a privacy request

CREATE UNIQUE INDEX customers_merchant_email
  ON customers (merchant_id, email)
  WHERE email IS NOT NULL AND merged_into IS NULL AND redacted_at IS NULL;

CREATE TABLE customer_addresses (        -- the address book; orders keep their own snapshots
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id  UUID NOT NULL REFERENCES customers (id),
  address_id   UUID NOT NULL,            -- the playbook's addresses table
  label        TEXT,                     -- 'Home', 'Office'
  is_default_shipping BOOLEAN NOT NULL DEFAULT FALSE,
  is_default_billing  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE marketing_consents (        -- append-only; the latest row per channel wins
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id   UUID NOT NULL REFERENCES customers (id),
  channel       TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'postal', 'phone')),
  address       TEXT NOT NULL,           -- the email or number the consent covers
  state         TEXT NOT NULL CHECK (state IN ('subscribed', 'pending', 'unsubscribed',
                  'not_subscribed', 'invalid', 'redacted')),
  basis         TEXT NOT NULL CHECK (basis IN ('express_opt_in', 'confirmed_opt_in',
                  'soft_opt_in', 'withdrawal', 'privacy_opt_out', 'bounce', 'import')),
  wording_ref   TEXT,                    -- the disclosure text version shown
  source        TEXT NOT NULL,           -- 'checkout', 'footer_form', 'pos', 'sms_keyword', 'support'
  source_ref    TEXT,                    -- order, form submission or message ID
  ip_address    INET,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_merges (           -- reversible: what moved, and back
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  survivor_id    UUID NOT NULL REFERENCES customers (id),
  merged_id      UUID NOT NULL REFERENCES customers (id),
  rule           TEXT NOT NULL,          -- 'verified_email', 'staff_confirmed', 'account_claim'
  moved          JSONB NOT NULL,         -- {"orders": [...], "addresses": [...], "subscriptions": [...]}
  performed_by   TEXT NOT NULL,
  performed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reversed_at    TIMESTAMPTZ,
  CHECK (survivor_id <> merged_id)
);

CREATE TABLE privacy_requests (          -- one request, every system it must reach
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  customer_id    UUID REFERENCES customers (id),  -- null until matched
  kind           TEXT NOT NULL CHECK (kind IN ('access', 'delete', 'correct', 'portability',
                   'opt_out_sale_sharing', 'limit_sensitive', 'opt_out_signal')),
  law            TEXT NOT NULL,          -- 'ccpa', 'gdpr', 'uk_gdpr', 'tdpsa', 'vcdpa', ...
  channel        TEXT NOT NULL CHECK (channel IN ('web_form', 'email', 'gpc', 'agent', 'phone')),
  verified_at    TIMESTAMPTZ,            -- never required for an opt-out
  received_at    TIMESTAMPTZ NOT NULL,
  acknowledge_by TIMESTAMPTZ NOT NULL,   -- e.g. 10 business days under CCPA
  respond_by     TIMESTAMPTZ NOT NULL,   -- 45 days CCPA, one month GDPR; extended with notice
  systems        JSONB NOT NULL,         -- {"klaviyo": "done", "helpdesk": "pending", ...}
  status         TEXT NOT NULL CHECK (status IN ('received', 'verifying', 'in_progress',
                   'completed', 'denied', 'extended')),
  completed_at   TIMESTAMPTZ
);

CREATE TABLE customer_segments (         -- a definition, versioned; members computed
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  name          TEXT NOT NULL,
  version       INT NOT NULL,
  definition    JSONB NOT NULL,          -- the rule, in the segment engine's grammar
  sensitive     BOOLEAN NOT NULL DEFAULT FALSE,  -- implies a sensitive category: no export
  purpose       TEXT NOT NULL,           -- 'marketing', 'pricing', 'support', 'reporting'
  computed_at   TIMESTAMPTZ,
  member_count  INT,
  UNIQUE (merchant_id, name, version)
);

-- Current consent per customer and channel.
SELECT DISTINCT ON (customer_id, channel) customer_id, channel, address, state, basis, recorded_at
FROM marketing_consents
ORDER BY customer_id, channel, recorded_at DESC;
```

Design notes:

- **One active row per email per merchant.** The partial unique index lets merged and redacted customers keep their rows (orders still point at them) while guaranteeing that a lookup by email finds one live customer.
- **Consent is a ledger.** Appending rows and reading the latest per channel gives the history every TCPA or PECR complaint asks for; updating a column loses it ([Append-Only Records](/docs/payments/payment-states#append-only-records)).
- **Opt-outs skip verification.** `verified_at` is required for access, deletion and correction, never for opting out of sale or sharing: requiring it was one of the findings against Honda and Todd Snyder.
- **GPC is a request too.** A browser's opt-out signal creates a `privacy_requests` row (`channel = 'gpc'`) tied to the customer when known, so the opt-out persists beyond the session and reaches the pixels and the ad platforms.
- **Deadlines are computed from the law.** `acknowledge_by` and `respond_by` come from the rule for the request's `law`, held as data, so a new state's clock is a row, not a release ([Rules as Data](/docs/architecture/rules-as-data)).
- **Redaction, not deletion, for customers with orders.** Setting `redacted_at` and erasing the personal columns keeps foreign keys from orders intact; the retention schedule later redacts the order snapshots when the tax period ends.
- **Segments record their run.** `computed_at` and `member_count` per version, with members stored per run where a decision depends on them (an offer, a price list), so a pricing or discrimination question can be answered.
- **Emit events:** `customer.created`, `customer.merged`, `marketing_consent.changed` and `privacy_request.completed`, consumed by every system that holds a copy.

## Auditing

- **Consent history per channel,** with the wording, source and timestamp of each change, for TCPA, CAN-SPAM, PECR and state complaints.
- **Every privacy request** with its clock, verification, the systems it reached and when, and the reason for any denial.
- **Merges and their reversals,** with what moved and who decided.
- **What data went to which processor or third party,** under which contract, so a "sale or sharing" question can be answered by vendor.
- **Retention runs,** showing what was redacted when its obligation ended.

## What This Means for the System You Build

- **Make every guest a customer record,** matched by normalized email before a new one is created.
- **Attach guest orders to an account only after the email is proven.**
- **Merge within a merchant, reversibly,** keeping the most recent explicit consent, never the most permissive.
- **Keep the address book separate from order snapshots.**
- **Record consent per channel as an append-only ledger** with wording, source and time, and honor withdrawal everywhere at once.
- **Build to CCPA:** honor GPC, never verify an opt-out, inventory every pixel, sign contracts with every recipient, and meet the 10-day and 45-day clocks.
- **Delete by redaction where records must be kept,** and make deletion reach every app, tool and warehouse that holds a copy.
- **Define segments as versioned rules,** gate their use on consent, and keep sensitive inferences away from ad platforms.

## References

**Platform documentation**

- [Shopify Help Center: Managing customers](https://help.shopify.com/en/manual/customers/manage-customers), profile creation on sign-up, order or abandoned checkout, and email as the unique identifier
- [Shopify Help Center: Customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts), passwordless sign-in with a one-time code
- [Shopify Help Center: Legacy customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts/legacy-customer-accounts), deprecation and the features of new accounts
- [Shopify: CustomerEmailMarketingState](https://shopify.dev/docs/api/admin-graphql/latest/enums/CustomerEmailMarketingState), consent states including redacted
- [Shopify: CustomerMarketingOptInLevel](https://shopify.dev/docs/api/admin-graphql/latest/enums/CustomerMarketingOptInLevel), single and confirmed opt-in
- [Shopify: CustomerEmailMarketingConsentState](https://shopify.dev/docs/api/admin-graphql/latest/objects/CustomerEmailMarketingConsentState), the consent record's fields and M3AAWG opt-in levels
- [commercetools: Customers](https://docs.commercetools.com/api/projects/customers), uniqueness per project or store, groups and addresses
- [commercetools: My Customer profile](https://docs.commercetools.com/api/projects/me-profile), anonymous carts and orders assigned on sign-up
- [Medusa: Customer Module](https://docs.medusajs.com/resources/commerce-modules/customer), guest and registered customers and groups
- [Saleor: Checkout overview](https://docs.saleor.io/developer/checkout/overview), email and user fields on the checkout

**Law and regulators**

- [Osano: US data privacy laws](https://www.osano.com/us-data-privacy-laws), state laws in force and their effective dates, and laws enacted for 2027 and 2028
- [MultiState: Comprehensive privacy laws that take effect in 2026](https://multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026), the count of twenty including Florida
- [Koley Jessen: Indiana, Kentucky and Rhode Island privacy laws](https://www.koleyjessen.com/insights/publications/new-state-privacy-laws-effective-january-1-2026-indiana-kentucky-and-rhode-island), thresholds of the 2026 laws
- [California Attorney General: CCPA](https://oag.ca.gov/privacy/ccpa), consumer rights and applicability thresholds
- [CPPA: CPI adjustments](https://cppa.ca.gov/regulations/cpi_adjustment.html), the $26,625,000 threshold and per-violation fines from January 1, 2025
- [CPPA: CCPA statute and regulations (effective January 1, 2026)](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf), sections 7016 (financial incentives), 7021 (response timelines) and 7025 (opt-out preference signals)
- [CPPA: New regulations approved (September 23, 2025)](https://cppa.ca.gov/announcements/2025/20250923.html), cybersecurity audits, risk assessments and ADMT and their dates
- [California Attorney General: Sephora settlement](https://oag.ca.gov/news/press-releases/attorney-general-bonta-announces-settlement-sephora-part-ongoing-enforcement), $1.2 million, sale disclosure and GPC
- [CPPA: Honda decision (March 12, 2025)](https://cppa.ca.gov/announcements/2025/20250312.html), $632,500 and the findings
- [CPPA: Todd Snyder decision (May 6, 2025)](https://cppa.ca.gov/announcements/2025/20250506.html), $345,178 and the findings
- [California Attorney General: Healthline settlement](https://oag.ca.gov/news/press-releases/attorney-general-bonta-announces-largest-ccpa-settlement-date-secures-155), $1.55 million and the findings
- [CPPA: Tractor Supply decision (September 30, 2025)](https://cppa.ca.gov/announcements/2025/20250930.html), $1.35 million and the findings
- [EUR-Lex: Regulation (EU) 2016/679 (GDPR)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679), Article 17(3)(b) and Article 12(3)
- [EUR-Lex: VAT Directive 2006/112/EC, consolidated](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02006L0112-20250101), Article 247 on invoice storage periods set by member states
- [ICO: Electronic mail marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/), the soft opt-in conditions
- [GOV.UK: Record keeping for VAT (Notice 700/21)](https://www.gov.uk/guidance/record-keeping-for-vat-notice-70021), at least six years
- [IRS: How long should I keep records](https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records), periods of limitations for records
- [Texas Administrative Code: 34 TAC § 3.287](https://www.law.cornell.edu/regulations/texas/34-Tex-Admin-Code-SS-3-287), four-year retention of exemption certificates
