+++
title = "Paying Creators & Sellers"
description = "Getting money out to creators, hosts and sellers: eligibility gates, payee KYC, payout triggers, holds, tax interviews, withholding, 1099-K and DAC7."
category = "User-Generated Platforms Industry"
order = 1823
part = "Creators and Money"
aliases = []
tags = ["payouts", "creators", "marketplaces", "kyc", "tax", "1099-k", "dac7"]
+++

Every creator program and every marketplace ends in the same act: the platform sends money it collected from someone else to a person it has to know, at a time it chose, minus what it kept, withheld or held back. A creator's month of ad share, a streamer's subscriptions, a host's weekend booking and a seller's jacket all become a balance the platform owes, and the balance becomes a payout only after a chain of conditions: the payee is admitted to the program, is who they say they are, has given tax information, isn't under a hold, has passed the event that releases the money, and has reached the minimum. Each condition exists because without it the platform pays the wrong person, pays too early, pays a fraudster, or owes the tax itself.

This chapter is that chain for user-generated platforms: eligibility gates and how they close, who the payee is, what triggers a payout on each kind of platform, schedules, minimums and instant payouts, risk holds and clawbacks, tax interviews and withholding, the US information returns, and the EU's DAC7 and the UK's platform reporting rules. The payment mechanics are the [Payments](/books/payments/payouts-and-settlement) volume's: [Payouts & Settlement](/books/payments/payouts-and-settlement) owns balances, holds, reserves, negative balances and payout failures; [Vendor Payouts](/books/payments/vendor-payouts) owns paying many small payees, W-9s and TIN matching; [Payments for Software Platforms](/books/payments/software-platforms) owns the sub-merchant hierarchy and the 1099-K; [Merchant Onboarding](/books/payments/merchant-onboarding) owns KYC. Here is what's particular to creators, hosts and sellers. How earnings accrue is in [Creator Monetization](/books/user-generated-platforms/creator-monetization); the models behind them, and float, in [Monetization Strategies](/books/user-generated-platforms/monetization-strategies).

## How the Platforms Do It

As of October 2026, from each platform's help pages and filings:

| Platform | Gate before earning or listing | What releases the money | Schedule and speed | Holds and withholding |
| --- | --- | --- | --- | --- |
| **YouTube** | Partner Program: 1,000 subscribers plus 4,000 watch hours in 12 months or 10 million Shorts views in 90 days; 2-Step Verification, no active strikes, one AdSense account; decision in about a month | Month close: finalized earnings added between the 7th and 12th | Paid between the 21st and 26th if the balance reached the threshold by the 20th | US tax info required from every creator; withholding on US-viewer earnings for non-US creators by treaty rate; up to 24% of worldwide earnings if no tax info |
| **Discord** | Server Subscriptions for eligible US server owners | Monthly | Paid through Stripe | |
| **Airbnb** | Identity verification for hosts and co-hosts | Check-in: payout process starts after it, generally paid the business day after | Fast Pay or pay to card in 30 minutes where available; bank 3 to 5 business days; wire 3 to 7 | Transaction review can delay funds up to 45 days after check-in; Italian withholding on host payouts since 2024 |
| **Outdoorsy** | Bank account, tax information and identity verification before a listing publishes | 48 hours after the scheduled trip start | Payout jobs daily including weekends; 3 to 5 business days to land; no instant payouts | 24% backup withholding without tax information; delays when the key exchange or driver verification is unfinished |
| **eBay** | Seller registration and payout account | Buyer's payment confirmed; available 1 to 2 days later | Daily by default, or weekly, biweekly, monthly; Express payout for $2.00 in about 30 minutes; on-demand eBay balance from 4 November 2026 | Registration, compliance, performance, payment-method and unvalidated W-9 holds; funds held while a claim is open |
| **Etsy** | Seller account with payment account | Sale | Deposits to the seller's bank; instant transfer for US sellers | Disbursement holds against fraud |
| **Vinted** | Seller account | Buyer confirms the order, or 2 calendar days pass after delivery without a report | Released to the seller | Refund window before release |

Three trigger families come out of it. **Creator platforms pay after the month closes,** because ad revenue, pool allocations and subscription renewals are only final once the month's invalid traffic, refunds and chargebacks are counted. **Rental marketplaces pay after the service starts,** because before check-in or pickup the guest can still cancel and the platform owes a refund. **Goods marketplaces pay after delivery or a short buyer window,** because "item not received" and "not as described" claims arrive then. In every family the money waits until the event that makes a reversal unlikely, and the wait is the platform's float.

## Eligibility Gates

A gate decides who can earn at all, before any money is involved. The platforms use three kinds:

- **Audience thresholds.** YouTube's Partner Program requires 1,000 subscribers plus either 4,000 public watch hours from long-form videos in the last 12 months or 10 million Shorts views in the last 90 days, and Shorts Feed views don't count toward watch hours. Twitch's Affiliate and Partner levels gate monetization the same way; Twitch had over 1 million Affiliates in 2025. Thresholds keep the payout population (and its KYC, tax and support cost) proportionate to the money, and they make faking an audience the first step of creator fraud, which is why the threshold counts only "qualified" views.
- **Account integrity.** YouTube adds 2-Step Verification, no active Community Guidelines strikes, advanced features access and a single linked AdSense account. Reddit's Contributor Program tied payout rates to karma tiers. These say the account is controlled by its owner and in good standing, which protects the payout from takeover and the program from banned users returning.
- **Identity and tax before supply.** Rental marketplaces gate the listing, not the earning: Outdoorsy requires a linked bank account, tax information and an identity check (a document and a live selfie) before a listing can publish, and Airbnb verifies primary hosts and co-hosts. The money hasn't moved yet, but the platform will be holding a guest's payment for this person within days.

**Review is a queue with a clock.** YouTube decides applications "typically in about 1 month"; after a first rejection a channel can appeal within 21 days or reapply after 30 days, and after later rejections it waits 90 days. A gate needs the same machinery as a moderation decision: the criteria the reviewer applied, a reason, a notice and an appeal ([Appeals](/docs/security/trust-and-safety#appeals)), because a rejected creator is a user who lost income.

### Gates That Close

Admission isn't permanent. Earnings stop or freeze when the payee stops meeting the program's terms:

- **Demonetization.** A video or channel loses ad eligibility under advertiser-friendly rules ([Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#demonetization-the-creator-side)); the creator stays in the program but earns less or nothing on that content.
- **Suspension from a program.** Strikes, invalid traffic or policy violations suspend the enrollment. The earnings already accrued may be paid, withheld pending review, or forfeited, depending on the terms; YouTube withholds or offsets earnings from invalid traffic ([Fraud on Creator Money](/books/user-generated-platforms/creator-monetization#fraud-on-creator-money)).
- **Account penalties.** A sitewide suspension ([Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing)) blocks payouts while it lasts; termination ends enrollment and starts the question of what happens to the remaining balance.

My rule: suspending a program and holding a balance are separate decisions with separate records. Freezing earned money because content was demonetized punishes the payee twice; paying out a balance built on invalid traffic pays the fraud. The program terms say which earnings survive which ending, the platform publishes them, and the decision cites them.

## Who the Payee Is

The payee is a sub-merchant under the platform: a person or a business whose identity, bank account and tax status the platform (or its payments provider) must establish before money leaves ([The Hierarchy](/books/payments/software-platforms#the-hierarchy); [Know Who You're Paying](/books/payments/merchant-onboarding#know-who-you-re-paying)). What user-generated platforms add:

- **The payee isn't the profile.** A creator's channel, a community's owner, a host's listing and a shop are public faces; the payee is the legal person or entity behind them, and one account can earn under several profiles into one payee ([One Login, Many Roles](/books/user-generated-platforms/accounts-and-identity#one-login-many-roles)). A channel run by a company pays the company; a community subscription pays the owner the platform recognizes, which matters when ownership transfers.
- **Progressive onboarding fits the earnings curve.** Most creators earn nothing; a few earn a lot. Collect the minimum to accrue (accept terms, tax country), require identity, bank and tax form before the first payout, and step up to business verification when the payee crosses a volume line ([Progressive Onboarding](/books/payments/merchant-onboarding#progressive-onboarding)). Twitch's 2025 change letting pre-Affiliate streamers earn but spend only on gifts and Bits is the same idea: accrue before KYC, pay out only after.
- **Changing the bank account is the attack.** A takeover that changes the payout account steals a month of earnings; the change triggers step-up authentication, a notice to the old contact and a hold ([Changing the Settlement Account](/books/payments/merchant-onboarding#changing-the-settlement-account); [Takeover Defense](/books/user-generated-platforms/accounts-and-identity#takeover-defense)).
- **Sanctions screening.** Payees are screened against sanctions lists at onboarding and on list updates; Airbnb's 10-K says it screens users against sanctions watch lists and calls the checks "not exhaustive," and Etsy relies on third parties for sanctions screening ([Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud#sanctions-screening-and-background-checks)).
- **Minors.** Platforms that let minors create (and many do) pay them only through a parent or guardian payee, or not at all; Gaming's [Creator Identity, KYC and Tax](/books/gaming/creator-economies#creator-identity-kyc-and-tax) covers the patterns.

[Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#private-individuals-and-traders) covers host and seller identity as marketplace law (INFORM, DSA trader traceability); this chapter covers the payee as a payment counterparty.

## Payout Triggers

The trigger is the event after which the platform considers the money earned by the payee and safe enough to send. It's set per business, and the choice is a trade between payee experience, refund exposure and float:

| Business | Trigger | Why there |
| --- | --- | --- |
| Ad share and pools | Month close plus finalization (YouTube adds the prior month's finalized earnings between the 7th and 12th) | Invalid traffic and advertiser refunds are known only after the month |
| Subscriptions, tips, currency | Period end, then a delay | Chargebacks on card-funded purchases arrive later; store refunds come through the store's notifications |
| Stays | Check-in, paid the business day after (Airbnb) | Before check-in the guest can cancel under the policy; after it, the service has begun |
| Vehicle and RV rentals | Trip start plus 48 hours (Outdoorsy), with the handoff completed | The handoff evidence is in, the trip is under way, and a no-show has surfaced |
| Goods | Payment confirmed (eBay, available in 1 to 2 days) or buyer confirmation or a short window after delivery (Vinted, 2 calendar days) | Non-delivery and not-as-described claims surface around delivery |

Two details recur. **The trigger is an event the platform records, not a date it computes.** Outdoorsy's payout waits on the digital key exchange; a late or missing handoff holds it. A trigger computed from the booking's start date pays out on trips that never started. **The trigger isn't the end of exposure.** Damage claims (Outdoorsy's claims are due within 48 hours after the booking ends), late chargebacks and guarantee programs reach past the payout, so a marketplace either holds a reserve, recovers from the payee's next earnings, or accepts the loss; [Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection#the-protection-stack) and [Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims#claims) cover the claim side.

## Schedules, Minimums and Instant Payouts

After the trigger, the schedule decides when money moves. Creator platforms batch monthly; marketplaces pay daily or let the seller choose. eBay pays daily by default with weekly, biweekly (every second Tuesday) and monthly (first Tuesday) options; Outdoorsy runs payout jobs every day including weekends and holidays, though banks post only on business days. YouTube pays only when the balance reaches the payment threshold by the 20th, and a balance below it rolls over.

**Minimums** exist because each payout costs a fee and a support ticket when it fails; they also leave small balances owed indefinitely, which the platform must still track and, eventually, either pay or treat under unclaimed-property law.

**Instant payouts are a product.** eBay sells an Express payout for $2.00 that typically arrives in about 30 minutes; Airbnb's Fast Pay and pay-to-card arrive in 30 minutes or less where available; Outdoorsy offers none. Instant payout to a debit card or real-time rail is a prefunded advance of money that isn't settled yet, priced to cover the rail's cost and the risk ([Instant Payouts From a Prefunded Balance](/books/payments/vendor-payouts#instant-payouts-from-a-prefunded-balance); [Push to Card](/books/payments/vendor-payouts#push-to-card)).

**Balances that stay on the platform.** From 4 November 2026 eBay rolls out an eBay balance for eligible US private sellers and sole proprietors: payouts become on-demand by default, and a balance with no activity for 330 days is paid to the seller's bank automatically. A balance the payee holds and spends on the platform is stored value, which brings its own licensing and safeguarding questions ([Treasury](/books/payments/treasury)); the sweep after inactivity is what keeps it from becoming abandoned property.

## Risk Holds, Negative Balances and Clawbacks

A hold delays a payout the trigger already released. The platforms publish the categories:

- **Review holds.** Airbnb may review any transaction, which can delay funds up to 45 days after check-in, pause them, or rarely remove them, and may ask the host to verify identity.
- **Account holds.** eBay lists registration holds (discrepancies in registration information), compliance holds, performance holds (unusual activity such as increased claims or negative feedback), invalid payment method holds (no way to collect fees) and tax information holds when a W-9 can't be validated.
- **Fraud holds.** Etsy's 10-K says it uses, and may expand, disbursement holds to prevent and mitigate fraud losses, and acknowledges they "may impact our value proposition for sellers."
- **Claim holds.** eBay may hold seller funds while a Money Back Guarantee claim is open and recover refunds it paid on the seller's behalf.
- **New-payee holds.** A first payout delayed until the payee has history, the `first_payout_delay` the Payments model already carries.

Each hold is a dated ledger entry with a reason, who set it and a release date ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)). The user-generated twist is that **holds are often moderation outcomes.** A creator under investigation for view fraud, a seller with a spike of counterfeit reports, a host under a safety review: the trust and safety case and the payout hold are the same decision, and the hold should point at the case so that closing one reviews the other.

**Negative balances and clawbacks.** A refund, chargeback or claim after payout leaves the payee owing the platform. Etsy says it may reimburse buyers itself to protect its reputation and does "not always recover the funds reimbursed"; eBay recovers refunds paid on the seller's behalf. A creator's balance goes negative when a subscription is charged back after the month was paid. The recovery order (next earnings, then the payout account, then collections or write-off) is published in the terms and applied the same way to everyone ([Negative Balances](/books/payments/payouts-and-settlement#negative-balances); [Clawbacks](/books/payments/payouts-and-settlement#clawbacks)).

## Tax Interviews and Withholding

Before the first payout, the payee answers a tax interview that ends in a form: a W-9 for US persons (name and taxpayer identification number), a W-8BEN for foreign individuals, a W-8BEN-E for foreign entities. The W-8BEN is a "Certificate of Foreign Status of Beneficial Owner for United States Tax Withholding and Reporting," given to the withholding agent or payer, whether or not the payee claims a reduced rate.

**What the form decides.** For a US marketplace paying US hosts, the form gives the TIN for the 1099 and avoids backup withholding: Outdoorsy withholds at least 24% of payouts from hosts who haven't given tax information, and eBay holds payouts when it can't validate a W-9 ([Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s)). For a creator platform paying creators worldwide, the form decides US withholding on US-source income. YouTube requires US tax information from every Partner Program creator wherever they live; for non-US creators, only earnings from US viewers (ads, YouTube Premium, Super Chat, Super Stickers, Super Thanks and memberships) are subject to withholding, at 0% to 30% depending on the creator's country's tax treaty (15% for India in YouTube's example). Without tax information, Google may withhold up to 24% of an individual's total worldwide earnings, or 30% of US earnings for a non-US business account, and it sets a December 10 deadline each year.

Three design consequences:

- **Earnings need a source country.** Withholding applies to US-viewer earnings only, so every ad share, membership and tip carries the viewer's country, and the payout computes withholding per source. That's a column on the earning, decided when it accrues, not a guess at payout time.
- **The form expires and changes.** W-8 forms lapse and claims change when a payee moves; a payee whose form lapses falls back to the default rate until they re-certify. The tax profile is effective-dated, and each withholding records which profile applied.
- **Withholding is a ledger movement.** The withheld amount moves to a tax liability account and is remitted on the tax calendar; the payee's statement and the year-end form show it.

Other countries withhold too. Italy's 2017 law requires short-term rental platforms that process payments to withhold and remit host income tax, and Airbnb Ireland began withholding on host payments for Italian listings in 2024 after settling audits for 2017 to 2023. A withholding regime is a rule keyed by the listing's or payee's jurisdiction, resolved like any other ([Rules as Data](/docs/architecture/rules-as-data)).

## Information Returns: 1099-K, 1099-MISC and 1042-S

Which US form a payee gets depends on how the platform pays them:

- **Form 1099-K** for payments the platform settles as a third-party settlement organization for goods or services (marketplace sales and bookings). The IRS confirmed on 23 October 2025 that the One Big Beautiful Bill Act retroactively reinstated the threshold: no filing unless gross payments to a payee exceed $20,000 and the number of transactions exceeds 200. Outdoorsy applied it for 2025: a host gets a 1099-K above $20,000 and 200 bookings, or if Outdoorsy withheld tax. Card transactions settled by a payment settlement entity have no minimum, and states set their own thresholds ([1099-K and Taxpayer Data](/books/payments/software-platforms#1099-k-and-taxpayer-data)).
- **Form 1099-MISC or 1099-NEC** for amounts the platform pays a US creator as its own payer (an ad revenue share, a pool allocation, an incentive) rather than settling a third party's payment. YouTube lists 1099-MISC and 1099-K among the year-end documents creators may receive.
- **Form 1042-S** for US-source income paid to foreign persons, reporting the gross and the tax withheld; YouTube issues it to non-US creators.

So one creator can get two forms from one platform: a 1099-K for fans' payments the platform settled and a 1099-MISC for its ad share. That's why each earning records which program paid it and in which capacity, and why the tax report is built per payee, per year, per form type, from the earnings and the withholdings, never from the payouts (payouts net refunds and holds; the forms report gross).

## DAC7 and UK Platform Reporting

Outside the US, platforms report sellers to tax authorities on their own regime:

- **DAC7** (Council Directive (EU) 2021/514) requires platform operators to collect, verify and report data on sellers of four relevant activities: rental of immovable property, personal services, sale of goods and rental of means of transport. The Dutch tax administration's guidance lists the data: name, primary address, date of birth, VAT number, financial account identifier, tax ID, business registration number, any EU permanent establishment, the property's address and land registration number for rentals, consideration per quarter, number of activities, and fees or taxes withheld. Reports are due by 31 January for the prior calendar year (the first by 31 January 2024, for 2023), and sellers must be told what was reported by the same date. Excluded are government entities, listed companies and their affiliates, property sellers with more than 2,000 rentals of the same address, and goods sellers with fewer than 30 sales worth under €2,000.
- **The UK** runs its own reporting rules for digital platforms, with the same small-seller exclusion for goods (fewer than 30 sales and €2,000 or less, about £1,700), not extended to services, transport rental or property rental; operators register with HMRC as reporting platform operators.

The design point is that **DAC7 data is collected from sellers who may never pass a US-style threshold**: a host with one rental is reportable, and a goods seller with 31 sales of €5 each is reportable. The collection happens in onboarding, the verification (TIN format and existence checks, address) runs before the first report, and the per-quarter consideration comes from the ledger. A seller who doesn't provide the data is one the platform can't report correctly; my default is to withhold payouts until it arrives, which makes DAC7 another gate that can close.

## How to Build It

These are deltas against the [core data model](/books/user-generated-platforms/platform-business#the-core-data-model), the Payments volume's `merchants`, `payouts`, `payout_items` and `balance_holds` ([Payouts & Settlement](/books/payments/payouts-and-settlement#how-to-build-it)), [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#how-to-build-it)'s `revenue_programs` and `revenue_program_terms`, and [Creator Monetization](/books/user-generated-platforms/creator-monetization#how-to-build-it)'s `earnings`. This chapter owns admission to programs, the payee's tax profile, withholdings, information returns and the rules that release payouts.

```sql
-- Admission to a revenue program: who may earn under it, decided and appealable.
CREATE TABLE program_enrollments (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id         UUID NOT NULL REFERENCES revenue_programs (id),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  profile_id         UUID REFERENCES profiles (id),       -- the channel or shop enrolled
  community_id       UUID REFERENCES communities (id),    -- a community's subscriptions
  merchant_id        UUID REFERENCES merchants (id),      -- the payee; set before payout
  status             TEXT NOT NULL CHECK (status IN ('applied', 'under_review', 'active',
                       'rejected', 'suspended', 'terminated')),
  criteria_snapshot  JSONB NOT NULL,   -- thresholds and the facts measured at decision
  decided_by         TEXT CHECK (decided_by IN ('automatic', 'staff')),
  decided_by_account UUID REFERENCES accounts (id),
  reason             TEXT,
  moderation_case_id UUID REFERENCES moderation_cases (id),  -- suspensions from a case
  earnings_on_exit   TEXT CHECK (earnings_on_exit IN ('pay', 'hold_for_review',
                       'forfeit')),                      -- from the terms, recorded
  appeal_until       TIMESTAMPTZ,
  reapply_after      TIMESTAMPTZ,
  valid_during       TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (program_id WITH =, account_id WITH =,
    (COALESCE(profile_id, account_id)) WITH =, valid_during WITH &&)
);

-- The payee's tax status, effective-dated; one current profile per payee.
CREATE TABLE tax_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id         UUID NOT NULL REFERENCES merchants (id),
  form                TEXT NOT NULL CHECK (form IN ('w9', 'w8ben', 'w8ben_e', 'dac7_self',
                        'none')),
  legal_name          TEXT NOT NULL,
  tax_residence       CHAR(2),
  tin_token           TEXT,            -- vaulted; never the number itself
  tin_match_status    TEXT CHECK (tin_match_status IN ('pending', 'matched', 'mismatched',
                        'not_applicable')),
  treaty_country      CHAR(2),
  treaty_rate_bps     INT CHECK (treaty_rate_bps BETWEEN 0 AND 10000),
  backup_withholding  BOOLEAN NOT NULL DEFAULT FALSE,
  date_of_birth       DATE,            -- DAC7 data for individuals
  vat_number          TEXT,
  business_reg_number TEXT,
  signed_at           TIMESTAMPTZ,
  valid_during        TSTZRANGE NOT NULL,  -- W-8s lapse; a move ends one and starts one
  EXCLUDE USING GIST (merchant_id WITH =, valid_during WITH &&)
);

-- Every amount withheld, against the earning it came from.
CREATE TABLE tax_withholdings (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id           UUID NOT NULL REFERENCES merchants (id),
  earning_id            UUID REFERENCES earnings (id),
  booking_id            UUID REFERENCES bookings (id),
  regime                TEXT NOT NULL CHECK (regime IN ('us_nra', 'us_backup', 'it_str',
                          'other')),
  source_country        CHAR(2),         -- where the income arose (the viewer's country)
  tax_profile_id        UUID REFERENCES tax_profiles (id),  -- null: default rate applied
  rate_bps              INT NOT NULL CHECK (rate_bps BETWEEN 0 AND 10000),
  base_amount           BIGINT NOT NULL,
  withheld_amount       BIGINT NOT NULL,
  currency              CHAR(3) NOT NULL,
  ledger_transaction_id UUID NOT NULL REFERENCES ledger_transactions (id),
  remitted_at           TIMESTAMPTZ,
  CHECK (earning_id IS NOT NULL OR booking_id IS NOT NULL)
);

-- Information returns and platform reports, per payee, year and regime.
CREATE TABLE tax_reports (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  tax_year         SMALLINT NOT NULL,
  regime           TEXT NOT NULL CHECK (regime IN ('1099_k', '1099_misc', '1099_nec',
                     '1042_s', 'dac7', 'uk_drp', 'state')),
  jurisdiction     TEXT NOT NULL,       -- 'US', 'US-MA', 'NL', 'GB' ...
  gross_amount     BIGINT NOT NULL,
  withheld_amount  BIGINT NOT NULL DEFAULT 0,
  transactions     INT,
  amounts_by_period JSONB NOT NULL,     -- monthly for 1099-K, quarterly for DAC7
  fees_amount      BIGINT,              -- DAC7 reports the platform's fees
  currency         CHAR(3) NOT NULL,
  tax_profile_id   UUID REFERENCES tax_profiles (id),  -- the identity data reported
  status           TEXT NOT NULL CHECK (status IN ('draft', 'final', 'filed',
                     'furnished', 'corrected', 'void')),
  corrects_id      UUID REFERENCES tax_reports (id),
  filed_at         TIMESTAMPTZ,
  furnished_at     TIMESTAMPTZ,         -- copy given to the payee
  UNIQUE NULLS NOT DISTINCT (merchant_id, tax_year, regime, jurisdiction, corrects_id)
);

-- What releases money for each program or listing category, as data.
CREATE TABLE payout_release_rules (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id      UUID REFERENCES revenue_programs (id),
  listing_category TEXT,                -- 'stay', 'rv', 'vehicle', 'goods' ...
  trigger_event   TEXT NOT NULL CHECK (trigger_event IN ('period_closed',
                    'booking_checked_in', 'trip_started', 'handoff_completed',
                    'payment_confirmed', 'delivery_confirmed', 'buyer_window_closed')),
  offset_interval INTERVAL NOT NULL DEFAULT '0',  -- e.g. '48 hours' after trip start
  schedule        TEXT NOT NULL CHECK (schedule IN ('daily', 'weekly', 'biweekly',
                    'monthly', 'on_demand')),
  minimum_amount  BIGINT,
  currency        CHAR(3),
  valid_during    TSTZRANGE NOT NULL,
  CHECK ((program_id IS NULL) <> (listing_category IS NULL))
);

ALTER TABLE balance_holds
  DROP CONSTRAINT balance_holds_kind_check,
  ADD CONSTRAINT balance_holds_kind_check CHECK (kind IN ('hold', 'rolling_reserve',
    'fixed_reserve', 'first_payout_delay', 'trigger_wait', 'risk_review', 'claim_window',
    'tax_info_missing', 'enforcement', 'program_suspension')),
  ADD COLUMN moderation_case_id UUID REFERENCES moderation_cases (id),
  ADD COLUMN enrollment_id      UUID REFERENCES program_enrollments (id);

ALTER TABLE merchants
  ADD COLUMN payout_status TEXT NOT NULL DEFAULT 'not_ready' CHECK (payout_status IN
    ('not_ready', 'ready', 'paused', 'closed')),  -- derived from requirements, stored for speed
  ADD COLUMN payout_schedule TEXT CHECK (payout_schedule IN ('daily', 'weekly', 'biweekly',
    'monthly', 'on_demand'));
```

What can be paid is a query: earnings past their release rule's trigger and offset, less unreleased holds, less withholding computed from the tax profile in force when each earning accrued:

```sql
SELECT e.merchant_id, e.currency, SUM(e.payee_amount) AS releasable
FROM earnings e
JOIN merchants m ON m.id = e.merchant_id AND m.payout_status = 'ready'
WHERE e.status = 'available'
  AND NOT EXISTS (
    SELECT 1 FROM balance_holds h
    WHERE h.merchant_id = e.merchant_id
      AND h.released_at IS NULL
      AND h.kind IN ('risk_review', 'tax_info_missing', 'enforcement',
                     'program_suspension'))     -- account-wide holds block everything
GROUP BY e.merchant_id, e.currency;
```

Design decisions behind it:

- **Enrollment is a decision with a record.** Admission, rejection, suspension and termination carry the criteria measured, who decided, the reason, the appeal deadline and the reapply date, and a suspension that came from a trust and safety case points at it. What happens to accrued earnings on exit is copied from the program terms onto the enrollment when it ends.
- **The trigger is data, the event is a fact.** A release rule names the event (`handoff_completed`, `buyer_window_closed`) and an offset; the payout job listens for the event and never computes eligibility from scheduled dates alone. Changing the rule is a new row, and payouts already released stay released.
- **Tax profiles are effective-dated, withholding points at one.** Each withholding records the regime, source country, rate and the profile used (or none, meaning the default rate), so a corrected W-8 can be applied forward and a 1042-S can be reconciled to the withholdings that make it up.
- **Reports are built from earnings and bookings, not payouts.** The 1099-K reports gross settled amounts by month; DAC7 reports consideration and fees by quarter; both are queries over the ledger with the payee's tax profile snapshotted into the report, and a correction is a new report pointing at the one it corrects.
- **Holds name their cause.** A hold from a moderation case or a program suspension carries the case or enrollment, so closing the case prompts review of the hold and a hold with no live cause is visible.
- **Payout readiness is derived.** `payout_status` is computed from the merchant's requirements (identity verified, bank account active, tax profile current, no DAC7 data outstanding) and stored for the payout job, recomputed on every requirement change ([An API That Says What's Due](/books/payments/merchant-onboarding#an-api-that-says-what-s-due)).

Events: `enrollment.decided`, `enrollment.suspended`, `tax_profile.certified`, `tax_profile.lapsed`, `payout.released`, `balance_hold.placed`, `balance_hold.released` and `tax_report.furnished`, consumed by notifications, support tools and the payee's dashboard.

## Auditing

Payee records are what tax authorities, payees and courts ask for:

- **Every enrollment decision.** The criteria and facts measured, the decider, the reason, the notice and the appeal outcome, because a rejected or suspended creator disputes lost income.
- **Every hold.** Kind, reason, who set it, the case or enrollment behind it, and the release date and releaser ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)).
- **Tax profiles and their history.** Which form was certified when, TIN match results, treaty claims, and the period each profile governed, kept for the retention period the tax rules set after the last return that relied on it.
- **Withholdings to remittances.** Each withheld amount, its base, rate and profile, and the remittance that carried it, reconciled to 1042-S and backup withholding filings.
- **Reports and corrections.** Every 1099, 1042-S, DAC7 and UK report as filed and furnished, with corrections linked to what they corrected, and the seller notices DAC7 requires.
- **Payout account changes.** Who changed the bank account, the verification and the hold it triggered.

The mechanics (append-only history, typed actors, snapshots) are in [Audit Trails](/docs/architecture/audit-trails); retention against deletion requests in [Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records).

## What This Means for the System You Build

- **Gate earning with enrollments** that record criteria, decider, reason, appeal and reapply dates, and close them with the same rigor.
- **Separate program suspension from balance holds,** and publish which earnings survive each kind of exit.
- **Treat the payee as a sub-merchant,** distinct from the profiles that earn into it, with progressive KYC: accrue first, verify before the first payout.
- **Release money on recorded events** (month close, check-in, trip start, delivery) with offsets as data, never on scheduled dates alone.
- **Put every hold in the ledger with its cause,** linking holds that come from trust and safety cases to the case.
- **Run a tax interview before the first payout,** keep tax profiles effective-dated, and withhold per earning by source country and regime.
- **Build 1099-K, 1099-MISC, 1042-S, DAC7 and UK reports from earnings and bookings,** with the identity data snapshotted and corrections linked.
- **Collect DAC7 data in onboarding** for every EU seller, since the thresholds are low and the deadline is fixed.
- **Sell instant payouts as a priced product,** and sweep idle on-platform balances before they become abandoned property.

## References

**Regulation**

- [IRS: FAQs on the Form 1099-K threshold under the One Big Beautiful Bill](https://www.irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000), 23 October 2025, the $20,000 and 200 transaction threshold for third party settlement organizations, retroactively reinstated
- [IRS: About Form W-8BEN](https://www.irs.gov/forms-pubs/about-form-w-8-ben), the certificate of foreign status given to the withholding agent or payer, and the related W-8BEN-E and W-9
- [Belastingdienst: Information about DAC7 for platform operators](https://belastingdienst.nl/wps/wcm/connect/en/business/content/information-for-platform-operators-dac7), Directive (EU) 2021/514: relevant activities, excluded sellers, data to collect, the 31 January deadline, the first reporting year and informing sellers
- [GOV.UK: Reporting rules for digital platforms](https://www.gov.uk/guidance/reporting-rules-for-digital-platforms), registering as a reporting platform operator and the excluded-seller threshold for goods

**Filings**

- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), funds held until check-in and remitted generally the business day after, sanctions screening, Italian withholding on host payouts from 2024 and the settled audits
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), disbursement holds against fraud, reimbursing buyers without always recovering funds, third parties for disbursing and sanctions screening

**Platform terms**

- [YouTube: YouTube Partner Program overview and eligibility](https://support.google.com/youtube/answer/72851?hl=en), thresholds, account requirements, review time, appeal and reapply windows
- [YouTube: US tax requirements for YouTube earnings](https://support.google.com/youtube/answer/10391362?hl=en), withholding on US-viewer earnings, treaty rates, the default rates without tax information, the December 10 deadline and year-end forms
- [Google AdSense: Payment timelines for YouTube](https://support.google.com/adsense/answer/7164703?hl=en), earnings added between the 7th and 12th, the threshold by the 20th and payment between the 21st and 26th
- [YouTube: Invalid traffic on your videos](https://support.google.com/youtube/answer/10285842?hl=en), withheld or offset earnings from invalid traffic
- [Twitch: Ten years of TwitchCon, Rotterdam](https://blog.twitch.tv/en/2025/05/31/ten-years-of-twitchcon-here-s-what-we-announced-in-rotterdam), over 1 million Affiliates and pre-Affiliate earnings spendable on gifts and Bits
- [Discord: Creator Revenue FAQ](https://creator-support.discord.com/hc/en-us/articles/10424143128343-Creator-Revenue-FAQ), Server Subscriptions eligibility, US availability and monthly payouts through Stripe
- [Airbnb: How payouts work](https://www.airbnb.com/help/article/425), payout methods and speeds and transaction review delaying funds up to 45 days after check-in
- [Outdoorsy: Fee structure and how hosts get paid](https://support.outdoorsy.com/hc/en-us/articles/37916164272283-What-is-your-fee-structure-And-how-do-I-get-paid), payouts 48 hours after trip start, daily jobs, 3 to 5 business days, no instant payouts, delay causes
- [Outdoorsy: Should I expect to receive a tax form](https://support.outdoorsy.com/hc/en-us/articles/37952556855451-U-S-Hosts-Should-I-expect-to-receive-a-tax-form-from-Outdoorsy), the 1099-K above $20,000 and 200 bookings and backup withholding of at least 24%
- [Outdoorsy: Why does Outdoorsy need to verify my identity before listing](https://support.outdoorsy.com/hc/en-us/articles/40350047391515-Why-does-Outdoorsy-need-to-verify-my-identity-before-listing-a-vehicle), bank account, tax information and identity verification before a listing publishes
- [eBay: Payouts for sellers](https://www.ebay.com/help/selling/getting-paid/payouts-sellers?id=4814), schedules, availability, hold types including W-9 validation, the $2.00 Express payout and the eBay balance from 4 November 2026
- [eBay: Money Back Guarantee policy](https://www.ebay.com/help/policies/ebay-money-back-guarantee-policy/ebay-money-back-guarantee-policy?id=4210), seller funds held while a claim is open and recovery of refunds paid
- [Airbnb: Verifying your identity](https://www.airbnb.com/help/article/1237), verification required for primary hosts, co-hosts and booking guests
- [Outdoorsy: What happens if my RV is returned with damage](https://support.outdoorsy.com/hc/en-us/articles/37607412541723-What-happens-if-my-RV-is-returned-with-damage), claims within 48 hours after the booking ends
- [Etsy: Fees & Payments Policy](https://www.etsy.com/legal/fees/), payment accounts, instant transfer for US sellers and 1099-K issuance
- [Vinted: Refund policy](https://www.vinted.co.uk/help/465-the-vinted-refund-policy), the 2-day window after delivery and payment to the seller on acceptance or expiry

**In practice**

- [Social Media Today: Reddit launches new Reddit Gold program](https://www.socialmediatoday.com/news/reddit-launches-new-reddit-gold-program-will-see-top-contributors-paid/694665/), the Contributor Program's karma tiers (September 2023)
