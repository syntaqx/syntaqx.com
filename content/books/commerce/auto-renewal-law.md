+++
title = "Auto-Renewal & Cancellation Law"
nav_title = "Auto-Renewal Law"
description = "ROSCA and the FTC's cases (Amazon Prime, Instacart, Adobe), the vacated rule, California, New York and other state laws, and EU and UK rules for goods."
category = "Commerce Industry"
order = 2326
part = "Subscriptions and Memberships"
tags = ["commerce", "subscriptions", "auto-renewal", "cancellation", "consumer-protection", "law"]
+++

A subscription that renews by itself is a negative option: the customer's silence is treated as consent to the next charge. That is lawful in every US state and in Europe, on conditions that have tightened every few years since California's first automatic renewal law took effect in December 2010. The conditions are the same everywhere in outline (tell the customer the terms before taking their card, get their express consent, remind them before certain renewals, let them cancel as easily as they joined), and they differ in the details a system has to get exactly right: which notice is due how many days before what, whether a save offer may be shown, how long consent records are kept, what happens to goods shipped without consent.

This chapter is the law as it applies to selling goods and memberships online: replenishment subscriptions, subscription boxes, subscribe-and-save, prepaid plans and paid memberships. It owns the state laws in depth, the FTC's enforcement against retailers (above all the 2025 Prime settlement), the cancellation flows subscription apps build, and the EU and UK rules for goods. The Hosting & Cloud volume's [Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law) covers the same federal ground from the side of long prepaid hosting terms and domain renewals, and its timeline of the FTC's rulemaking ([How It Got Here](/books/hosting-and-cloud/renewals-and-cancellation-law#how-it-got-here)) is the one this chapter relies on. The delivery memberships case, FTC v. Uber, is in [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#cancellation-law); door-to-door service plans and the Cooling-Off Rule are Field Operations' [Renewal and Cancellation in the Field](/books/field-operations/consumer-protection#renewal-and-cancellation-in-the-field); lease renewals are Property Tech's [Renewals](/books/property-tech/the-lease#renewals); and game subscriptions are Gaming's [Subscriptions](/books/gaming/monetization#subscriptions). The system side (consent and reminder records, cancellation as a request) is the playbook's [Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data). This isn't legal advice; it is what the rules say and how a system that follows them is built.

## The Rules at a Glance

As of October 2026, from the statutes, regulations and agency pages:

| Jurisdiction | Instrument | Distinctive requirements for an online goods subscription |
| --- | --- | --- |
| **United States** | ROSCA, 15 U.S.C. 8403; FTC Act section 5 | Material terms before billing information is collected; express informed consent before charging; "simple mechanisms" to stop recurring charges. No federal click-to-cancel rule in force |
| **California** | Bus. & Prof. Code 17600 to 17606, as amended by AB 2863 (from July 1, 2025) | Express affirmative consent; consent records kept 3 years or 1 year after termination; click-to-cancel; save offers only beside a visible cancel option; notices before trials, long-term renewals and price changes; annual reminder; goods sent without consent are an unconditional gift |
| **New York** | General Business Law 527-a | Consent before charging; acknowledgment with the cancellation deadline; cancellation in the same medium; notice before renewals of six months or more and before material changes; pro rata refund option after a price increase |
| **Colorado** | C.R.S. 6-1-732 (from January 1, 2022) | Notice 25 to 40 days before the first renewal and each later one; renewal terms over one year need express written consent; enforced by the attorney general and district attorneys |
| **Delaware** | 6 Del. C. 2731 to 2737 (from January 1, 2022) | Covers merchandise; notice 30 to 60 days before the cancellation deadline when a renewal extends a contract past 12 months; online cancellation for online sign-ups; treble damages |
| **District of Columbia** | D.C. Code 28A-203 | For initial terms of 12 months or more, notice 30 to 60 days before the cancellation deadline; trial notice 15 to 30 days before it ends; a violating renewal is void |
| **Minnesota** | Minn. Stat. 325G.56 to 325G.62 | Annual notice for continuous service; trial notice 5 to 30 days for trials over 30 days; a termination election on the account page; retention offers only with the consumer's permission |
| **North Dakota** | N.D.C.C. chapter 51-37 | Renewal terms capped at 12 months; notice 30 to 60 days for renewals over six months; goods sent in violation are an unconditional gift; private right of action |
| **Oregon** | ORS 646A.293 to 646A.295 | California-style disclosure, consent and acknowledgment; cancellation by toll-free number, email or another easy mechanism; goods sent without consent are a gift |
| **Utah** | Utah Code 13-70 (from January 1, 2025) | Notice-only: 30 to 60 days before renewal of terms over 45 days; trial notice at least 3 days before it ends; fines up to $2,500 per violation |
| **Vermont** | 9 V.S.A. 2454a | For initial terms of a year or more, a separate opt-in to renewal; notice 30 to 60 days before; online cancellation for online sign-ups |
| **Virginia** | Va. Code 59.1-207.46 | Cancellation at least as easy as sign-up, through each method used to sign up; no forced live agent; trial notice for trials over 30 days |
| **European Union** | Consumer Rights Directive 2011/83/EU, amended by Directive 2023/2673 | 14-day withdrawal for distance contracts; an online withdrawal function from June 19, 2026; a Digital Fairness Act proposal expected |
| **Germany** | BGB sections 309 and 312k | Limits on initial terms and tacit extensions; a mandatory cancellation button ([EU, Germany and the UK](/books/hosting-and-cloud/renewals-and-cancellation-law#eu-germany-and-the-uk)) |
| **United Kingdom** | Consumer Contracts Regulations 2013; DMCC Act 2024 Part 4 Chapter 2 | 14-day cancellation, from first delivery for regular deliveries; a subscription regime with reminders, cooling-off after renewals and online exit, announced to come into force in January 2027 |

Three patterns:

- **California is the design target, not the ceiling.** Its law is the most detailed and the most litigated, but Colorado's 25-to-40-day window, Delaware's and the District's 30-to-60-day windows, Vermont's separate opt-in and Minnesota's permission before retention offers are each stricter on one point. A national merchant builds to the union.
- **The windows don't line up.** A yearly prepaid box sold in California, Colorado and Delaware owes a notice 15 to 45, 25 to 40 and 30 to 60 days before different anchors (renewal, renewal, cancellation deadline); only a computed intersection, per subscriber, satisfies all three with one message.
- **Goods carry a penalty services don't.** California, North Dakota and Oregon treat goods shipped under an automatic renewal without the required consent as an unconditional gift: the customer keeps them and owes nothing. For a product subscription, a consent defect refunds the whole run, not one month.

## ROSCA and What the FTC Enforces

The Restore Online Shoppers' Confidence Act (15 U.S.C. 8403) applies to any sale over the internet with a negative option feature. Before obtaining billing information, the seller must disclose all material terms clearly and conspicuously; it must obtain the consumer's express informed consent before charging; and it must provide "simple mechanisms" to stop recurring charges. The statute doesn't define "simple," and the FTC's complaints and orders are where its meaning has been worked out. A violation "shall be treated as a violation of a rule under section 18 of the Federal Trade Commission Act" (15 U.S.C. 8404), which is what makes civil penalties available.

The FTC's own rule that would have spelled this out was vacated in July 2025, and as of October 2026 the FTC is at the advance-notice stage of starting again ([The vacated rule and the 2026 advance notice](/books/hosting-and-cloud/renewals-and-cancellation-law#the-vacated-rule-and-the-2026-advance-notice)). Enforcement didn't wait. The cases since 2023, as the agencies describe them:

| Case | Filed or announced | Alleged | Outcome as of October 2026 |
| --- | --- | --- | --- |
| **FTC v. Amazon (Prime)** | Complaint June 21, 2023 (W.D. Wash.) | Enrolling consumers in Prime without consent through manipulative checkout flows, and a cancellation flow designed to deter | Stipulated order September 25, 2025: $1 billion civil penalty and up to $1.5 billion in redress (below) |
| **FTC v. Uber** | April 21, 2025 (N.D. Cal.) | Uber One billing without consent and a cancellation of up to 23 screens | Pending; states joined ([Cancellation Law](/books/commerce/delivery-subscriptions#cancellation-law)) |
| **FTC v. Instacart** | Announced December 18, 2025 | Instacart+ trial conversions charged without adequate disclosure or express informed consent | $60 million in refunds; clear disclosure and express informed consent required |
| **United States v. Adobe** | June 2024 (N.D. Cal.), DOJ on the FTC's referral, with two executives | A hidden early termination fee and a cancellation flow full of steps, delays and offers | Proposed stipulated order filed March 13, 2026: $75 million civil penalty and $75 million in free services, early termination fee disclosure and easy cancellation; entry by the court not confirmed as of October 2026 |
| **FTC v. Cleo AI** | Announced March 27, 2025 | Subscriptions hard to cancel, charges after repeated requests | $17 million; disclosure, consent and simple cancellation required |
| **FTC v. Care.com** | August 2024 (W.D. Tex.) | A hard-to-find cancel link and users steered to pause | $8.5 million judgment and simple cancellation required |
| **FTC v. LA Fitness** | August 20, 2025 (C.D. Cal.) | Cancellation only in person through one manager or by certified mail; add-ons not disclosed as separately cancellable | Pending, amended complaint January 26, 2026 |

The common thread for a commerce system: every case turns on a screen the system rendered (the button wording, the order of options, the number of steps to cancel) and on records the system kept or didn't (what was disclosed, when consent was given, when a cancel request arrived). Adobe adds a point for any commitment plan: an early termination fee is a material term, and the order requires its calculation to be disclosed before enrollment and a reminder before a trial longer than seven days converts into the committed plan.

### FTC v. Amazon (Prime)

The FTC's complaint against Amazon (No. 2:23-cv-0932, W.D. Wash.) alleged that Amazon enrolled consumers in Prime without their consent through checkout designs that made declining hard, and made cancelling hard on purpose. The complaint named Amazon's cancellation flow "Iliad," after the epic about the long siege of Troy; it required the customer to confirm across three pages. An amended complaint in September 2023 added senior executives, and the court denied motions to dismiss in May 2024.

The stipulated order of September 25, 2025, approved 3-0, has three parts:

- **Money.** A $1 billion civil penalty, which the FTC calls the largest ever in a case about an FTC rule violation, and up to $1.5 billion in redress to about 35 million consumers, administered under an independent supervisor Amazon pays for.
- **Enrollment.** A clear and conspicuous button to decline Prime; Amazon may no longer use a decline option worded "No, I don't want Free Shipping." Before enrollment, disclosure of the cost, the charge dates and frequency, that the membership auto-renews, and how to cancel.
- **Cancellation.** Available through the same method used to sign up, and not difficult, costly or time-consuming.

Redress went to people enrolled through a challenged flow, or who tried and failed to cancel, between June 23, 2019 and June 23, 2025. A stipulated order of September 14, 2026 revised the redress: eligibility widened to members who used 11 to 20 Prime benefits in a year, with automatic payments to them from October 1, 2026; if accepted payments fall short of the required total by February 2027, earlier recipients get up to $149 more, for up to $200 each; payments are automatic, by Venmo, PayPal or check, and expire 60 days after issue. Amazon had paid more than $845 million by September 2026.

What the order asks of a membership system, read as requirements:

- **The decline is as visible as the accept,** worded neutrally, on every enrollment surface (checkout upsells included). An A/B test of enrollment wording is a test of a legal disclosure and is versioned like one.
- **The enrollment screen carries price, dates, renewal and how to cancel,** and the consent record points at that exact screen version ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)).
- **Cancellation takes no more effort than enrollment,** measured in steps, in the same channel.
- **Redress needs history.** Paying 35 million people by eligibility rules (enrollment flow, cancellation attempts, benefits used per year) was possible only because enrollment path, cancel attempts and benefit use were recorded per member. A system that can't answer those questions for a regulator can't comply with an order like this one either.

## The Vacated Rule, as a Design Reference

The FTC's 2024 amendments to the Negative Option Rule (89 FR 90476, November 15, 2024, 16 CFR part 425) were vacated by the Eighth Circuit on July 8, 2025, and the February 2026 final rule restored the old text ([How It Got Here](/books/hosting-and-cloud/renewals-and-cancellation-law#how-it-got-here)). Its content is still the clearest statement of what the FTC thinks ROSCA's "simple" means, and the 2026 advance notice asks whether to revive pieces of it:

- **Section 425.3:** no misrepresentation of any material fact in marketing a negative option.
- **Section 425.4:** all material terms disclosed before billing information is obtained.
- **Section 425.5:** "unambiguously affirmative consent to the Negative Option Feature offer separately" from the rest of the transaction.
- **Section 425.6:** a cancellation method "at least as easy to use as the mechanism the consumer used to consent," through the same medium, with phone cancellations promptly effected.

The final rule dropped the proposed limits on save offers, saying it "removes the proposed save provision from the final Rule." My default is to build to the vacated rule's shape anyway: separate consent, same-medium cancellation at least as easy as sign-up. State laws already require most of it, and a revived federal rule is likely to look like it.

## State Laws

### California

California's automatic renewal law (Bus. & Prof. Code 17600 to 17606) is the oldest and most detailed. SB 340 added it in 2009, operative December 1, 2010; SB 313 (approved September 28, 2017, operative July 1, 2018) required that a consumer who signs up online be allowed to cancel "exclusively online" and that trial offers explain the price charged after the trial; AB 390 (approved October 4, 2021, operative July 1, 2022) added a notice before a free trial of 31 days or more, or a promotional price lasting more than 31 days, ends; and AB 2863 (2024) rewrote much of it for contracts entered into, amended or extended on or after July 1, 2025.

Its definitions reach every product subscription. An "automatic renewal" is a free-to-paid conversion or a paid term "automatically renewed at the end of a definite term"; "continuous service" is a subscription that "continues until the consumer cancels" (section 17601). A monthly replenishment plan is continuous service; a yearly prepaid box that renews is an automatic renewal; both are covered.

Section 17602, as amended:

- **Disclosure and consent.** The automatic renewal offer terms, clearly and conspicuously, before the subscription is fulfilled, and the consumer's express affirmative consent to them before any charge; an acknowledgment the consumer can keep, with how to cancel.
- **Consent records.** Verification of consent kept for at least three years, or one year after the contract ends, whichever is longer (subdivision (a)(6)).
- **Notices.** 3 to 21 days before a free trial or promotional price lasting more than 31 days ends ((b)(1)(A)); 15 to 45 days before renewal when the term is a year or longer ((b)(2)); 7 to 30 days before a price change takes effect ((g)(2)); and an annual reminder for plans of a year or more, with the product, the frequency and amount of charges and how to cancel ((h)).
- **Cancellation.** Online for online sign-ups, through a "prominently located direct link or button" ((d)(1)(A)), with authentication allowed first ((d)(3)).
- **Save offers.** By phone, only after telling the consumer they can cancel at any time by saying "cancel" ((e)(1)); online, only if a "click to cancel" link or button is shown at the same time ((e)(2)).

Section 17603 is the goods rule: products sent under an automatic renewal or continuous service without the consent the law requires are an unconditional gift, which the consumer may use or dispose of without obligation. Section 17604 makes "all available civil remedies" available and removes criminal liability, and a business that complies in good faith is protected from those remedies.

### New York

New York's General Business Law 527-a is California's near twin with its own clocks. Its requirements, as the Hosting & Cloud volume reads them from the statute ([State automatic renewal laws](/books/hosting-and-cloud/renewals-and-cancellation-law#state-automatic-renewal-laws)): material terms near the consent request, including the deadline to act; affirmative consent before charging, including for promotional terms; an acknowledgment with terms, costs, frequency, the cancellation deadline and mechanism; cancellation as easy as consent, in every medium used to consent; notice 15 to 45 days before the cancellation deadline for terms renewing for six months or more; notice 3 to 21 days before the cancellation deadline of a free period longer than a month; and notice of a material change 5 business days to 30 days before it, after which the business either obtains affirmative consent to the new price or lets the consumer cancel within at least 14 days of the charge for a pro rata refund. The attorney general enforces it with civil penalties.

For product subscriptions the pro rata refund is the hard part: a prepaid box plan whose price rises must be able to compute and refund the unshipped share after a charge, which is the `prepaid_periods` arithmetic in [Subscription Commerce](/books/commerce/subscription-commerce#prepaid-plans-and-their-accounting).

### Colorado

Colorado's law (C.R.S. 6-1-732, effective January 1, 2022) moves the notice later and applies it more often: 25 to 40 days before the first automatic renewal and each one after it, not only for long terms. It caps automatic renewal terms at one year without the consumer's express written consent, and it is enforced only by the attorney general and district attorneys. A quarterly prepaid plan sold into Colorado owes a notice every quarter under that reading, which is a schedule a system can only send if notices are generated per renewal from rules, not per plan from a template.

### Other States

The rest of the table above, in the details a system encodes:

- **Notice windows by anchor.** Delaware and the District count 30 to 60 days back from the cancellation deadline; Utah, North Dakota and Vermont count 30 to 60 days back from renewal; Minnesota requires a trial notice 5 to 30 days before a trial over 30 days ends and an annual notice for continuous service.
- **Consent shape.** Vermont requires a separate opt-in to renewal for initial terms of a year or more, so a single "subscribe" checkbox isn't enough there; Colorado requires express written consent for renewal terms over a year.
- **Cancellation shape.** Virginia requires cancellation through each method used to sign up, no forced live agent and free phone cancellation; Minnesota requires a termination election on sites with account management and bars retention offers unless the consumer gives permission, which may be asked once per attempt; Connecticut's amendments effective July 1, 2026 require an annual reminder, bar in-person-only or mail-only cancellation and require voicemail cancellations to be honored within one business day; Massachusetts' attorney general regulations (940 CMR 38.00, effective September 2, 2025) require a trial offer to state the calendar date to cancel and cancellation at least as easy as sign-up.
- **Remedies.** Delaware allows treble damages, North Dakota a private right of action, the District voids a non-compliant renewal, Utah fines up to $2,500 per violation.

Illinois's Automatic Contract Renewal Act (815 ILCS 601/10, as amended through P.A. 103-919, effective January 1, 2025) requires clear and conspicuous disclosure of the renewal terms near the consent request, consent before charging, and a retainable acknowledgment with the cancellation policy; a notice no less than 3 days before the cancellation deadline of a free trial or promotional period of 15 days or longer; for terms of 12 months or more that renew for more than a month, written notice 30 to 60 days before the cancellation deadline; and, for offers accepted online, cancellation "exclusively online." A seller with written compliance procedures that refunds an error isn't liable.

Because these change every year (Virginia amended its law in 2022, 2023, 2024 and 2026), each requirement is a dated row, not code ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## Notices and Reminders

The notices a goods subscription can owe, and when:

| Notice | Trigger | Typical windows | Applies to |
| --- | --- | --- | --- |
| **Acknowledgment** | Sign-up | Promptly, retainable | Every subscription (California, New York, Oregon and others) |
| **Trial or promo ending** | A free or discounted period over about a month converting to paid | 3 to 21 days before (California, New York); 5 to 30 (Minnesota); 15 to 30 (District) | Free first box, discounted first months |
| **Pre-renewal** | A term renewing | 15 to 45 days before (California, terms of a year or more; New York, six months or more); 25 to 40 (Colorado, every renewal); 30 to 60 (Delaware, District, Utah, Vermont, North Dakota) | Prepaid plans and annual memberships; monthly plans mostly not, except in Colorado |
| **Price or material change** | A higher price or changed terms | 7 to 30 days before (California); 5 business days to 30 days (New York) | Floating-price subscriptions, plan migrations |
| **Annual reminder** | Each year of an annual or continuous plan | Yearly (California for annual plans; Minnesota for continuous service; Connecticut) | Annual memberships; long-running replenishment in Minnesota |
| **Cancellation confirmation** | A cancel request | Promptly, in the channel used | Every cancellation |

Three rules make these reliable:

- **Count from the charge, not the shipment.** A product subscription charged three days before it ships has its renewal on the charge date; every "before renewal" window counts back from the charge ([Count every window from the charge date](/books/hosting-and-cloud/renewals-and-cancellation-law#domains-auto-renew-and-the-errp-clock) is the same lesson for domains).
- **Compute the intersection, send once.** For a subscriber covered by several rules, the scheduler computes each window and sends one notice inside their overlap, marking the others satisfied; where the windows don't overlap, it sends two.
- **Reminders are transactional.** They go on the transactional stream, so a marketing unsubscribe never suppresses them, and a bounce is a fact to act on ([Purpose Decides Everything](/docs/architecture/notifications#purpose-decides-everything)). The card networks require their own reminder before a trial converts, at least seven days ahead for Visa ([Trials and Cancellation](/books/payments/stored-credentials#trials-and-cancellation)).

## Cancellation Flows in Subscription Apps

Every subscription app sells a cancellation flow: Skio's "Multi-Step Cancel Flow Builder," Stay AI's "self-optimizing cancellation surveys," Ordergroove's workflows tested on a slice of traffic, Stripe's configurable portal ([How the Platforms Do It](/books/commerce/subscription-commerce#how-the-platforms-do-it)). A flow is a sequence of screens between "cancel" and "cancelled": ask why, offer something (skip a cycle, pause, swap, change frequency, a discount), and confirm. The law permits that sequence on conditions, and the conditions are where flows go wrong:

- **The cancel option stays visible on every screen.** California allows an online save offer only with a "click to cancel" shown at the same time; a flow that hides the cancel button behind "See your options" fails that test on the first screen.
- **One action declines each offer.** An offer that takes two clicks to refuse is a step added to cancellation, which is what the Uber complaint counted ("23 screens") and the Amazon order bars.
- **Ask before offering, where required.** Minnesota bars retention offers unless the consumer gives permission, so a Minnesota subscriber's flow asks "would you like to hear options?" once, and goes straight to confirmation on "no."
- **No forced human.** Virginia bars requiring a live agent; California requires a phone line that answers if phone is offered; Connecticut requires voicemail cancellations honored within one business day.
- **Skip and pause are offers, not substitutes.** A customer who clicks cancel and is shown "pause instead" has not cancelled until they choose; a customer who chooses cancel must not end the flow paused. Care.com's complaint alleged exactly the steering to pause.
- **Confirmation states the facts.** The effective date, whether an already-charged renewal ships or is refunded, any prepaid refund and its amount, and that no further charges will be made.
- **Every channel lands in the same record.** An email reply, a support chat, a text "STOP my subscription" and the portal button each create a cancellation request stamped with when the customer asked ([Cancellation](/docs/payments/subscriptions#cancellation)).

The flow's configuration is per jurisdiction: the same merchant shows a California subscriber a flow with an always-visible cancel button, a Minnesota subscriber a permission question first, and a German subscriber the statutory cancellation button. That is data keyed by the customer's location, not branches in the front end.

A cancellation received after a renewal was charged but before it shipped needs a written rule: ship it and end after, or cancel and refund the order. Either is defensible; the rule is a plan term shown at sign-up, and the support agent doesn't decide it case by case.

## EU and UK

For goods sold to consumers at a distance in the EU, the Consumer Rights Directive gives a 14-day right of withdrawal without reason. For goods it runs from physical possession; for a contract for regular delivery of goods, the UK's equivalent (Consumer Contracts Regulations 2013, regulation 30) runs it from the first delivery. A subscription box sold to an EU or UK consumer can therefore be withdrawn from after the first box arrives, and the system has to process a withdrawal (refund within the statutory time, return of goods) distinctly from a cancellation of future renewals.

Two changes are arriving:

- **The withdrawal function.** Directive (EU) 2023/2673 inserted Article 11a into the Consumer Rights Directive, and member states apply it from June 19, 2026. For a distance contract concluded through an online interface, the trader must offer a withdrawal function labelled "withdraw from contract here" or an unambiguous equivalent, "continuously available throughout the withdrawal period" and prominently displayed; it opens an online withdrawal statement where the consumer gives or confirms their name, the contract and where the confirmation should go; a confirmation function labelled "confirm withdrawal" submits it; and the trader then sends, without undue delay, an acknowledgement of receipt on a durable medium with the statement's content and the date and time it was submitted. Submitting it within the period counts as exercising the right. It is Germany's cancellation button ([EU, Germany and the UK](/books/hosting-and-cloud/renewals-and-cancellation-law#eu-germany-and-the-uk)) applied to withdrawal across the EU. The withdrawal right's clock, refund and exceptions for any online order are [The EU Right of Withdrawal](/books/commerce/online-consumer-protection#the-eu-right-of-withdrawal); this chapter adds only how it meets a subscription.
- **The Digital Fairness Act.** The Commission's 2026 work programme lists a Digital Fairness Act for the fourth quarter of 2026, and the European Parliament's research service reported in October 2026 that it was scheduled for mid-November; its consultation found 69% of respondents reported difficulty cancelling online and 62% had renewals without a reminder. As of October 2026 no proposal has been published.

In the UK, Part 4 Chapter 2 of the Digital Markets, Competition and Consumers Act 2024 (sections 253 to 281) creates a subscription contracts regime: pre-contract information, reminder notices, exit arrangements and cooling-off periods, including a new 14-day cooling-off period after a trial converts or a renewal. Most of it isn't in force; the government's April 2026 consultation response anticipated spring 2027, and a Prime Minister's announcement of August 9, 2026 said the rules "will now come into force in January 2027."

## How to Build It

The playbook's `disclosures` and `renewal_consents` record what was shown and agreed ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)); the Hosting & Cloud volume's `renewal_law_rules` holds jurisdiction rules as dated rows, and Commerce uses its shape unchanged ([How to Build It](/books/hosting-and-cloud/renewals-and-cancellation-law#how-to-build-it)). This chapter points consent and notices at Commerce's subscriptions and memberships, and adds cancellation requests for product subscriptions alongside the delivery volume's `membership_cancellations`:

```sql
CREATE TABLE renewal_law_rules (         -- one row per notice, consent or cancellation duty, dated
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction      TEXT NOT NULL,       -- 'US', 'US-CA', 'US-CO', 'EU', 'DE', 'GB'
  rule_code         TEXT NOT NULL,       -- 'ca_17602_b2', 'co_6_1_732_notice', 'mn_retention_permission'
  applies_when      JSONB NOT NULL,      -- {"min_term_months": 12}, {"trial_days_over": 31}, {"goods": true}
  duty              TEXT NOT NULL CHECK (duty IN ('acknowledgment', 'trial_end', 'pre_renewal',
                      'price_change', 'annual_reminder', 'cancellation_confirmation',
                      'separate_opt_in', 'retention_permission', 'cancel_visible',
                      'no_live_agent', 'withdrawal_function')),
  anchor            TEXT CHECK (anchor IN ('renewal_charge', 'cancel_deadline', 'trial_end',
                      'change_effective', 'consent', 'received')),
  window_min_days   SMALLINT,
  window_max_days   SMALLINT,
  business_days     BOOLEAN NOT NULL DEFAULT FALSE,
  source_ref        TEXT NOT NULL,       -- statute section
  valid_during      TSTZRANGE NOT NULL,
  UNIQUE (jurisdiction, rule_code, valid_during)
);

ALTER TABLE renewal_consents             -- the playbook's table, pointed at either promise
  ADD COLUMN membership_id UUID REFERENCES memberships (id),
  ADD COLUMN surface       TEXT NOT NULL DEFAULT 'checkout' CHECK (surface IN ('checkout',
                             'upsell', 'portal', 'app', 'phone', 'in_store')),
  ADD COLUMN decline_shown TEXT,         -- the decline option's wording, as rendered
  ADD COLUMN rule_ids      UUID[] NOT NULL DEFAULT '{}';  -- separate opt-in and other rules met

CREATE TABLE renewal_notices (           -- every notice owed, sent or not
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id  UUID REFERENCES subscriptions (id),
  membership_id    UUID REFERENCES memberships (id),
  cycle            INT,                  -- the renewal it warns of
  rule_id          UUID NOT NULL REFERENCES renewal_law_rules (id),
  anchor_at        TIMESTAMPTZ NOT NULL, -- the charge, deadline or change it counts from
  send_window      TSTZRANGE NOT NULL,
  quoted_amount    BIGINT,
  currency         CHAR(3),
  channel          TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'in_app', 'mail')),
  status           TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'delivered',
                     'bounced', 'superseded', 'not_required')),
  satisfied_by_id  UUID REFERENCES renewal_notices (id),  -- one send meeting several rules
  message_ref      TEXT,
  sent_at          TIMESTAMPTZ,
  CHECK ((subscription_id IS NULL) <> (membership_id IS NULL)),
  UNIQUE (subscription_id, membership_id, cycle, rule_id)
);

CREATE TABLE subscription_cancellations ( -- a product subscription's cancel or withdrawal request
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id  UUID NOT NULL REFERENCES subscriptions (id),
  kind             TEXT NOT NULL CHECK (kind IN ('cancel', 'withdrawal', 'renewal_cooling_off')),
  received_at      TIMESTAMPTZ NOT NULL, -- when the customer asked: the legal clock
  channel          TEXT NOT NULL CHECK (channel IN ('portal', 'app', 'email', 'sms', 'chat',
                     'phone', 'voicemail', 'mail', 'marketplace')),
  actor            TEXT NOT NULL,
  flow_version     TEXT,                 -- the cancellation flow configuration shown
  steps            SMALLINT,             -- screens between start and confirmation
  offers_shown     TEXT[] NOT NULL DEFAULT '{}',
  offer_accepted   TEXT,                 -- a pause, skip or discount, if chosen
  permission_asked BOOLEAN,              -- Minnesota-style retention permission
  outcome          TEXT NOT NULL CHECK (outcome IN ('pending', 'cancelled', 'saved',
                     'withdrawn_by_customer')),
  effective_at     TIMESTAMPTZ,
  charged_renewal  TEXT CHECK (charged_renewal IN ('ships', 'refunded', 'none')),
  refund_amount    BIGINT,
  currency         CHAR(3),
  reason_code      TEXT,
  confirmed_at     TIMESTAMPTZ,
  CHECK (outcome = 'pending' OR confirmed_at IS NOT NULL)
);
CREATE INDEX subscription_cancellations_sub_idx ON subscription_cancellations (subscription_id);

ALTER TABLE membership_cancellations
  ADD COLUMN flow_version TEXT,
  ADD COLUMN offers_shown TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN permission_asked BOOLEAN;
```

Notes on the sketch:

- **Rules pick by consent date and by renewal date.** AB 2863 applies to contracts entered into, amended or extended from July 1, 2025, so the consent's date picks the disclosure rules and each renewal's date picks the notice rules; `valid_during` makes both answerable later.
- **Jurisdiction comes from the customer, recorded.** The ship-to state for a goods subscription is the natural key, stored on the consent and on each notice, because a subscriber who moves changes which rules apply to the next renewal, not to the consent they gave.
- **Notices are generated per renewal row.** The scheduler joins `subscription_renewals` from [Subscription Commerce](/books/commerce/subscription-commerce#how-to-build-it) to the rules in force for the subscriber's state, computes each window from the charge date, and writes one row per rule; one send inside an overlap marks the others `satisfied_by`.
- **The flow is configuration with a version.** `flow_version` and `steps` let the merchant show, for any cancellation, exactly which screens the customer saw: the evidence an enforcement complaint is built from.
- **A cancellation writes once, effects follow.** The request sets `subscriptions.cancel_at`, cancels later notices and future renewal rows, decides the charged renewal by the plan's rule, and emits `subscription.cancel_requested` and `subscription.cancelled`; an accepted save offer is a `subscription_changes` row, never an edit of the request.

## Auditing

- **Consent per subscription and membership.** The disclosure version, the enrollment surface, the decline option as rendered, the consent's time and channel, and any separate opt-in, kept at least California's three years or one year after the end.
- **Every notice owed.** The rule, the window, the send, the channel, delivery or bounce, and the amount quoted against the amount later charged; a renewal charged without its notice sent inside the window is a finding.
- **Every cancellation.** Received, confirmed and effective times, channel, flow version, steps, offers shown and declined, and the refund; voicemail requests acted on within a business day.
- **Goods shipped after a cancel or without consent.** A report of renewal orders created after a cancellation's receipt or without a consent row, because in California, North Dakota and Oregon those goods are gifts and must not be billed.
- **Rule versions in force on each date,** with sources ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Build to the union of state laws,** with California as the base and each stricter rule (Colorado's every-renewal notice, Vermont's separate opt-in, Minnesota's retention permission) as a dated row.
- **Record consent against the exact screen,** including the decline option's wording, for subscriptions and memberships alike; the Prime order is about those pixels.
- **Generate notices per renewal from rules,** counted from the charge date, sent once inside overlapping windows, on the transactional stream.
- **Keep the cancel option visible and every offer declinable in one action,** ask permission first where required, and never force a live agent.
- **Version the cancellation flow and count its steps,** and land every channel in one cancellation request stamped with receipt time.
- **Never bill goods shipped without consent or after a cancellation;** in several states they are gifts.
- **Handle EU and UK withdrawal separately from cancellation,** from first delivery for regular deliveries, with the online withdrawal function from June 19, 2026.
- **Track the pending items as dated facts:** the FTC's rulemaking, the Digital Fairness Act proposal and the UK regime's January 2027 start.

## References

**Federal law and enforcement**

- [15 U.S.C. 8403](https://www.law.cornell.edu/uscode/text/15/8403), ROSCA's disclosure, express informed consent and simple mechanism requirements
- [15 U.S.C. 8404](https://www.law.cornell.edu/uscode/text/15/8404), violations treated as violations of an FTC rule
- [Federal Register: Negative Option Rule (89 FR 90476, November 15, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-11-15/html/2024-25534.htm), sections 425.3 to 425.6 and the removal of the save provision
- [FTC: Amazon.com, Inc. (ROSCA), FTC v. case page](https://search.ftc.gov/legal-library/browse/cases-proceedings/2123050-amazoncom-inc-rosca-ftc-v), case number, court, complaint, amended complaint, the September 25, 2025 order and the September 14, 2026 redress order
- [FTC: Amazon to pay $2.5 billion (September 25, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-secures-historic-25-billion-settlement-against-amazon), the penalty, redress, decline button, disclosures, cancellation terms and the vote
- [FTC: Additional payments from the Amazon Prime settlement (September 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/09/ftc-announces-additional-payments-consumers-stemming-ftcs-amazon-prime-settlement), widened eligibility, the $200 cap, payment methods and amounts paid
- [FTC: Amazon refunds](https://www.ftc.gov/enforcement/refunds/amazon-refunds), the eligibility period and payment process
- [WTTW (AP): Amazon to pay $2.5 billion](https://news.wttw.com/2025/09/25/amazon-pay-25-billion-settle-ftc-allegations-company-duped-customers-enrolling-prime), the "Iliad" cancellation flow named in the complaint
- [FTC: Instacart to pay $60 million (December 18, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/12/instacart-pay-60-million-consumer-refunds-settle-ftc-lawsuit-over-allegations-it-engaged-deceptive), trial conversions and the order's disclosure and consent terms
- [DOJ: Adobe agrees to $150 million settlement](https://www.justice.gov/opa/pr/adobe-agrees-150-million-settlement-and-injunction-resolve-alleged-violations-restore-online), the proposed order's penalty, services, early termination fee disclosure and trial reminder
- [FTC: Cleo AI to pay $17 million (March 27, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/03/cash-advance-company-cleo-ai-agrees-pay-17-million-result-ftc-lawsuit-charging-it-deceives-consumers), cancellation obstacles and the order
- [FTC: Refunds to Care.com consumers (June 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/06/ftc-sends-more-81-million-consumers-harmed-carecoms-deceptive-claims-about-earnings-job-listings), the case, the judgment and cancellation terms
- [FTC: LA Fitness case page](https://www.ftc.gov/legal-library/browse/cases-proceedings/la-fitness), the cancellation allegations and the amended complaint

**State law**

- [Cal. Bus. & Prof. Code 17601](https://california.public.law/codes/business_and_professions_code_section_17601), definitions of automatic renewal and continuous service
- [Cal. Bus. & Prof. Code 17602](https://california.public.law/codes/business_and_professions_code_section_17602), consent and records, notices, click to cancel, save offers, price changes and the annual reminder
- [Cal. Bus. & Prof. Code 17603](https://california.public.law/codes/business_and_professions_code_section_17603), goods sent without consent as an unconditional gift
- [Cal. Bus. & Prof. Code 17604](https://california.public.law/codes/business_and_professions_code_section_17604), civil remedies, no criminal liability, good-faith compliance
- [California Legislature: SB 313 (2017)](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201720180SB313), online cancellation for online sign-ups, operative July 1, 2018
- [California Legislature: AB 390 (2021)](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220AB390), the trial and promotional-price notice, operative July 1, 2022
- [California Legislature: Business and Professions Code, Article 9](https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=BPC&division=7.&title=&part=3.&chapter=1.&article=9.), SB 340 history notes and the December 1, 2010 operative date
- [Kilpatrick: California automatic renewal law amendments](https://ktslaw.com/en/insights/alert/2024/10/california-latest-automatic-renewal-law-amendments-take-effect-in-july-2025), AB 2863 and its July 1, 2025 applicability
- [New York General Business Law 527-a](https://www.nysenate.gov/legislation/laws/GBS/527-A), consent, acknowledgment, cancellation in the same medium, notice windows, price-increase options
- [C.R.S. 6-1-732](https://colorado.public.law/statutes/crs_6-1-732), Colorado's 25-to-40-day notice, renewal term limit and enforcement
- [Delaware Code title 6, chapter 27, subchapter IV](https://delcode.delaware.gov/title6/c027/sc04/index.html), merchandise, the 30-to-60-day notice, online cancellation, treble damages
- [D.C. Code 28A-203](https://code.dccouncil.gov/us/dc/council/code/sections/28A-203), notice windows, trial notice and void renewals
- [Minn. Stat. 325G.58](https://www.revisor.mn.gov/statutes/cite/325G.58), annual and trial notices
- [Minn. Stat. 325G.60](https://www.revisor.mn.gov/statutes/cite/325G.60), the termination election and retention offers with permission
- [N.D.C.C. chapter 51-37](https://ndlegis.gov/cencode/t51c37.pdf), the 12-month cap, notice, unconditional gift and private right of action
- [ORS chapter 646A](https://www.oregonlegislature.gov/bills_laws/ors/ors646A.html), sections 646A.293 to 646A.295 on automatic renewal
- [Utah H.B. 174 (2024)](https://le.utah.gov/~2024/bills/hbillenr/HB0174.pdf), the notice-only law, its windows and fines
- [9 V.S.A. 2454a](https://legislature.vermont.gov/statutes/section/09/063/02454a), the separate opt-in, notice and online cancellation
- [Va. Code 59.1-207.46](https://law.lis.virginia.gov/vacode/title59.1/chapter17.8/section59.1-207.46/), cancellation through each sign-up method, no forced live agent, trial notice
- [Connecticut Attorney General: new click-to-cancel protections (July 16, 2026)](https://portal.ct.gov/ag/press-releases/2026-press-releases/attorney-general-tong-highlights-new-click-to-cancel-consumer-protections), the annual reminder, cancellation channels and voicemail handling
- [815 ILCS 601/10](https://www.ilga.gov/Documents/legislation/ilcs/documents/081506010K10.htm), Illinois's disclosures, trial and renewal notices, online cancellation and safe harbor
- [Kelley Drye: Auto-renewal laws 2025 round-up](https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/auto-renewal-laws-2025-round-up), Massachusetts 940 CMR 38.00 and its effective date

**EU and UK**

- [EUR-Lex: Directive (EU) 2023/2673](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023L2673), Article 11a's withdrawal and confirmation functions, the acknowledgement, and application from June 19, 2026
- [EUR-Lex: Commission work programme 2026 (COM(2025) 870)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A52025DC0870), the Digital Fairness Act listed for the fourth quarter of 2026
- [European Parliament Research Service: Digital Fairness Act briefing (October 2026)](https://eprs.europarl.europa.eu/contents/publications/EPRS/2026/10/EPRS_BRI(2026)791529.html), the expected timing and consultation findings on cancellation and reminders
- [UK Consumer Contracts Regulations 2013, regulation 30](https://www.legislation.gov.uk/uksi/2013/3134/regulation/30), the 14-day period for goods and for regular deliveries from the first delivery
- [Digital Markets, Competition and Consumers Act 2024, Part 4 Chapter 2](https://www.legislation.gov.uk/ukpga/2024/13/part/4/chapter/2), the subscription contracts regime and its sections
- [GOV.UK: PM starts roll-out of everyday fixes (August 9, 2026)](https://www.gov.uk/government/news/pm-starts-roll-out-of-everyday-fixes-on-the-cost-of-living-ending-rip-off-discounts-and-subscription-traps), the January 2027 commencement
