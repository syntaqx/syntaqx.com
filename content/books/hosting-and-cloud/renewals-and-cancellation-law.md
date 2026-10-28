+++
title = "Subscriptions, Renewals & Cancellation Law"
nav_title = "Renewals & Cancellation Law"
description = "Hosting and domain terms, intro prices that renew at list, auto-renew, ROSCA, the vacated FTC rule and 2026 ANPRM, state and EU renewal laws, cancellation."
category = "Hosting & Cloud Industry"
order = 2193
part = "Metering and Billing"
tags = ["subscriptions", "auto-renewal", "cancellation", "consumer-law", "domains"]
+++

Two businesses in this volume live on renewals, and they renew differently. A [web host](/books/hosting-and-cloud/web-hosting-business#the-intro-term-and-the-renewal) sells a term: one to four years prepaid at an introductory price, renewing automatically at a list price that is often four to six times higher. A registrar sells a name-year on a registry's behalf, renewing every year unless the holder stops it, with [ICANN](/books/hosting-and-cloud/icann-registries-and-registrars#the-contracts) dictating the reminders. Clouds mostly don't renew anything: the customer agreement runs until someone ends it and usage is billed monthly, but the things a cloud customer holds on a term (a domain in its DNS product, a support plan, a reservation) renew like any subscription. The money that keeps a host profitable is the renewal charge, and the renewal charge is exactly what consumer protection law targets: undisclosed terms, charges without consent, reminders that never arrive, and cancellation paths that are harder than the sign-up.

The general engineering of renewals, the US federal and California rules, consent records and reminders as data are the playbook's ([The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal), [Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data), [Cancellation](/docs/payments/subscriptions#cancellation)), and the card networks' trial rules are the Payments volume's ([Trials and Cancellation](/books/payments/stored-credentials#trials-and-cancellation)). This chapter covers what hosting and domains add: long prepaid terms with a price jump at renewal, renewals charged weeks before expiry, a domain's renewal clock that ICANN sets, the state of US federal law as of October 2026, the state, German and UK rules a host selling to consumers meets, and the tables that make each rule a scheduled, provable job. The money side of a failed renewal is [Invoices, Dunning & Suspension](/books/hosting-and-cloud/invoices-dunning-and-suspension); tax on the renewal is [Tax on Hosting & Cloud](/books/hosting-and-cloud/tax). This isn't legal advice; it is what the rules say and how the systems that follow them are built.

## How the Providers Do It

Published renewal mechanics across hosts, registrars and clouds, as of October 2026:

| Provider | What renews | Renewal price shown | When it charges, and reminders | Ending it online |
| --- | --- | --- | --- | --- |
| **Hostinger** | Prepaid hosting terms (Premium: 48 months) | "Renews at" $10.99 a month "for the same term" | Not stated on the pages opened | A toggle under Billing, Subscriptions; the service stays active to its expiration date, and a pending monthly invoice is voided |
| **SiteGround** | Prepaid hosting (12 months for the intro price) | StartUp renews at $17.99 a month | Plans of 12 months or more auto-renew 15 days before expiry, monthly plans 5 days before; "early reminders" (knowledge base updated February 1, 2022) | Not stated on the pages opened |
| **Bluehost** | Hosting (36 months for the intro price); the free first-year domain | Starter renews at $9.99 a month; the domain "will automatically renew at the then current rate" | Not stated on the pages opened | 30-day full refund on hosting; a non-refundable domain fee when a free domain is cancelled |
| **IONOS** | Hosting, intro price for one year | Essential: $4 a month the first year, $8 after the first term | Not stated on the pages opened | Some packages bill monthly with a one-month cancellation period; 30-day money-back |
| **GoDaddy** | Hosting, domains and add-ons, terms up to ten years | Help and legal pages blocked to the fetcher | Not verified | Not verified; its 10-K names "automatic renewal laws" among the laws "particularly relevant" to its business |
| **Namecheap** | Domains; hosting | Per product | Domains charged 30 days before expiry; hosting invoiced 7 days before the billing date and charged on it, retried 2 and 5 days after | Auto-renew per product |
| **Cloudflare Registrar** | Domains, auto-renew on by default | Registry list price, no markup | First attempt about 30 days before expiry, retries to the day before; reminders monthly from 45 and 60 to 90 days out to the account, weekly in the last month, daily in the last week, then 1 and 20 days after expiry to the registrant | Turn auto-renew off at least 30 days before expiry; renewals are non-refundable |
| **AWS** | The Customer Agreement has no fixed term and no auto-renewal; Route 53 domains renew automatically | Route 53 price list per TLD | Domains renewed 35 days before expiry (30 for .com.ar and .com.br), with an email 45 days out; with auto-renew off, ICANN's 30-day and 7-day emails | Terminate by notice and closing the account (section 5.2) |
| **Azure** | Subscriptions run until cancelled; support plans auto-renew | Price sheet | Final bill within 72 hours of cancelling the last subscription | Cancel in the portal with a reason, a toggle to stop the support plan's auto-renewal, and a step that turns off running resources |
| **DigitalOcean** | Nothing on a term: usage billed monthly | Pricing pages | Monthly | Deactivate from My Account; charges stop, with an option to purge data |
| **Hetzner** | Contracts "continue and automatically renew themselves until terminated" | Price list | Monthly, quarterly or annual invoices | 30 days' notice to the end of the month; a 14-day right of withdrawal |
| **Netlify** | Self-serve subscriptions renew "for successive periods of the same duration" | Pricing page | Paid in advance for each term | Cancel in the admin panel at least one day before the term ends, or by written notice ten days before |

Three patterns run through the table:

- **The intro price buys a long prepaid term, and the renewal is at list.** Hostinger's, SiteGround's and Bluehost's lowest prices need 48, 12 and 36 months paid upfront. The disclosure is on the pricing card ("Renews at"); the charge comes years later, which is why the law cares about reminders more than about the checkout. [How the Money Is Made](/books/hosting-and-cloud/hosting-and-cloud-business#how-the-money-is-made) shows why hosts build on this shape.
- **Renewals are charged before expiry, not on it.** SiteGround's 15 days, Route 53's 35 days and Namecheap's and Cloudflare's 30 days put the charge ahead of the term's end so a failed card can be fixed before a site or name goes dark. That moves the customer's real deadline to stop a renewal forward by the same amount, and every reminder rule that counts back from a "cancellation deadline" has to count from the charge date, not the expiry.
- **Clouds renew less and cancel more mechanically.** With no term to renew, cancellation at AWS, Azure and DigitalOcean is account or subscription closure, and the questions that matter are what happens to running resources, the last bill and the data, which is [Data After Termination](/books/hosting-and-cloud/invoices-dunning-and-suspension#data-after-termination).

## How It Got Here

Renewal law grew from mail-order book clubs to web hosting checkouts, each step answering a complaint the last one left open:

- **1973: the Negative Option Rule.** The FTC's original rule covered prenotification plans, the book-club model where a seller ships unless the member declines. It is the rule the FTC's 2024 amendments rewrote and the 2026 advance notice now proposes to extend, under the title "Rule Concerning the Use of Prenotification Negative Option Plans."
- **December 29, 2010: ROSCA.** The Restore Online Shoppers' Confidence Act (Pub. L. 111-345, section 4, codified at 15 U.S.C. 8403) made online negative options lawful only with clear disclosure of material terms before billing information is collected, express informed consent before the charge, and "simple mechanisms" to stop recurring charges. It applies to any online sale with a negative option feature, which every auto-renewing hosting plan has.
- **August 31, 2013: ICANN's Expired Registration Recovery Policy.** Registrars had to comply from that date: two notices before a name expires, one after, a period when DNS stops resolving so the holder notices, and a 30-day redemption period. ICANN published an updated text on February 21, 2024, to align with the Registration Data Policy; registrars had to implement it by August 21, 2025.
- **2023 to 2024: the "click-to-cancel" amendments.** The FTC proposed amending the 1973 rule in 2023 and adopted the amendments in 2024: a rule that reached every negative option, including automatic renewals, with consent, disclosure and cancellation requirements of its own.
- **July 1, 2025: California AB 2863.** California's amended automatic renewal law took effect for contracts entered into, amended or extended from that date, adding consent records, save-offer conditions and price-change notice to the reminder windows it already had.
- **July 8, 2025: the vacatur.** In *Custom Communications, Inc. v. FTC* (No. 24-3137) the Eighth Circuit set the amended rule aside before its July 14 compliance date, holding that the FTC had skipped the preliminary regulatory analysis section 22 of the FTC Act requires once its administrative law judge found the rule's annual effect would exceed $100 million.
- **September 25, 2025: Amazon.** The FTC announced a $2.5 billion settlement under the FTC Act and ROSCA over Prime enrollment and cancellation: a $1 billion civil penalty and $1.5 billion in refunds, a reminder that the statute does much of the work the vacated rule would have.
- **February 12, 2026: the old text restored.** A final rule (91 FR 6507), effective on publication, removed the 2024 amendments from the Code of Federal Regulations and restored the pre-2024 Negative Option Rule.
- **March 13, 2026: the advance notice.** The FTC published an advance notice of proposed rulemaking (91 FR 12318, docket FTC-2026-0265) asking whether to amend the rule so consumers can avoid recurring payments they didn't intend and cancel "without unwarranted obstacles." Comments closed April 13, 2026. As of October 2026 the Federal Register shows no proposed rule after it.
- **April 2, 2026: the UK response.** The UK government published its response to the consultation on the subscription contracts regime of the Digital Markets, Competition and Consumers Act 2024 and said it anticipates the regime "will commence in spring 2027."

## Terms, Intro Prices and the Renewal

A hosting plan in this volume is a `plan_versions` row with `intro_amount`, `renewal_amount` and `term_months`, and each `subscription_periods` row records `pricing_phase` ([the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)). The renewal law turns those columns into obligations:

- **The renewal price is a material term, disclosed before billing.** ROSCA requires material terms before billing information is collected; New York's General Business Law 527-a spells out that a free or temporary price must say "how and when" the price changes and what the consumer will pay; California requires the amount and frequency of charges before billing information is confirmed. "Renews at $10.99 a month for the same term" next to the intro price is the shape every host in the table uses. Storing the disclosure text as a versioned document the consent row points at is what proves it later.
- **The renewal term length is a term too.** Hostinger's renewal is "for the same term", so a 48-month intro renews for 48 months at list. A host that renews for a shorter term than the intro (monthly or yearly after a multi-year intro) has to say so as clearly, and the system has to know which applies: the renewal term belongs on the plan version, not inferred from the intro term.
- **A price change during the term is a separate rule.** A list price that rises between sign-up and renewal is a fee change under an existing agreement: California requires notice 7 to 30 days before it takes effect, New York 5 business days to 30 days before, both with cancellation instructions; New York also lets the business either get affirmative consent to the new price or let the consumer cancel within at least 14 days of the charge for a pro rata refund. [Price Changes and Notice](/books/hosting-and-cloud/pricing-catalogs#price-changes-and-notice) owns the catalog side; this chapter schedules the notice.
- **Bundled free items renew on their own clock.** Bluehost's free domain renews after year one "at the then current rate," on a 12-month cycle inside a 36-month hosting term. Email trials and backup add-ons do the same. Each is its own subscription with its own consent, notice schedule and price, or the first year's free domain renews without the notice the law requires.
- **Refund windows carve out pass-through items.** Bluehost refunds hosting cancelled within 30 days but charges a non-refundable domain fee on a "free" domain; Cloudflare's renewals are final. The carve-out exists because the registry fee is already paid ([The Life of a Domain](/books/hosting-and-cloud/hosting-and-cloud-business#the-life-of-a-domain)), and it is a term that must be disclosed like the price.

## Domains: Auto-Renew and the ERRP Clock

A domain renewal answers to two rulebooks at once: consumer renewal law, because the registrant pays automatically, and ICANN's Expired Registration Recovery Policy, because the registrar's accreditation depends on it. The ERRP's requirements, unchanged in substance by the 2024 text:

| Requirement | What the ERRP says |
| --- | --- |
| Pre-expiry notices | At least two: about one month and about one week before expiry. ICANN's notes treat 26 to 35 days and 4 to 10 days as compliant |
| Post-expiry notice | At least one more within five days after expiry, with renewal instructions, if the name wasn't renewed or deleted |
| DNS interruption | For at least the last eight consecutive days the registrant can still renew, or from expiry to deletion if the name is deleted sooner; any page shown must say the name expired and how to renew |
| Redemption | A 30-day Redemption Grace Period after deletion for non-sponsored gTLDs, in which the registrant can redeem |
| Fee disclosure | Renewal, post-expiry renewal and restore fees reasonably available at registration, on the website and linked from the registration agreement, including resellers' sites |
| Notice method | How notices are sent (channels, sender address) described on the website and in the agreement |

The ERRP's notices are minimums for names that are about to lapse; they say nothing about consent to the charge itself, which is the consumer law's job. Providers stack the two differently. Route 53 sends its own email 45 days out, renews at 35 days, and sends ICANN's 30-day and 7-day notices only when auto-renew is off, because a name that renewed at day 35 isn't expiring. Cloudflare goes well past the minimum with monthly, weekly and daily reminders and two after expiry. Namecheap charges 30 days out and says names are normally released 80 to 85 days after expiration.

Two interactions catch registrars:

- **The charge date is the cancellation deadline.** A registrar that charges at day 35 and sends its only pre-renewal reminder at day 30 has sent it after the customer could stop the charge. California's 15-to-45-day window for terms of a year or more counts back from the renewal; New York's counts back from the deadline to act. For a name charged 35 days early, the reminder belongs between 50 and 80 days before expiry to satisfy New York's reading, or the charge moves later.
- **The free domain's year one is a trial-like promotional period.** A domain given free with hosting and renewed at list after a year is a free gift that converts to paid. California requires notice 3 to 21 days before a free gift or promotional price of more than 31 days ends, New York 3 to 21 days before the cancellation deadline of a free period longer than a month, except that California sends only the renewal notice where both apply. Which rule applies to a "free domain" is counsel's call; the system has to be able to send either.

The domain's lifecycle itself (grace periods, redemption, pending delete, drop catching) is [The Domain Lifecycle](/books/hosting-and-cloud/domain-lifecycle#grace-periods)'s; this chapter only schedules the renewal notices and records the consent.

## The Law in Force

### ROSCA and the FTC

As of October 2026 the federal floor for an online auto-renewing sale is ROSCA (15 U.S.C. 8403) and section 5 of the FTC Act, plus the 1973 Negative Option Rule for prenotification plans. The FTC enforces ROSCA without the vacated rule: besides Amazon, Holland & Knight lists Match ($14 million to consumers) and Chegg ($7.5 million) among its 2025 subscription actions. No published FTC case I found targets a web host or registrar for auto-renewal; GoDaddy's 10-K lists automatic renewal laws among the laws particularly relevant to it all the same.

ROSCA's three requirements map to three records: the disclosure shown (a versioned document), the consent captured (a `renewal_consents` row with evidence), and the cancellation mechanism (a `cancellation_requests` row per request, below). "Simple mechanisms" is undefined in the statute, which is why the state laws and the vacated rule's details still shape what "simple" is taken to mean.

### The vacated rule and the 2026 advance notice

The 2024 amendments would have made a federal click-to-cancel standard. The Eighth Circuit's July 8, 2025 opinion vacated them on procedure, not substance, and the FTC's February 12, 2026 final rule put the 1973 text back. The March 13, 2026 advance notice asks again whether to extend the rule beyond prenotification plans; the FTC had also published, on December 3, 2025, a petition for rulemaking from the Consumer Federation of America and the American Economic Liberties Project (90 FR 55701). As of October 2026 there is no proposed rule. The design consequence: build to the strictest state rule you are subject to and to the vacated rule's shape where it is stricter still, because a future federal rule is likely to resemble one of them, and retrofitting cancellation and consent records is harder than keeping them from the start.

### State automatic renewal laws

The states that matter most for hosts are those with detailed, enforced laws. Two, read from the statute text as of October 2026:

| Requirement | California, Bus. & Prof. Code 17602 (as amended by AB 2863, from July 1, 2025) | New York, General Business Law 527-a |
| --- | --- | --- |
| Disclosure | Auto-renewal, its length, charge amounts and frequency, how to cancel, contact information, before billing information is confirmed | Material terms near the consent request, including the deadline to act to stop charges |
| Consent | Express affirmative consent to the renewal terms before any charge | Affirmative consent before charging, including for promotional terms |
| Consent records | At least three years, or one year after termination, whichever is longer | No retention period in the section |
| Acknowledgment | One the consumer can retain | Promptly after consent, with terms, costs, frequency, cancellation deadline and mechanism |
| Cancellation | Online for online sign-ups, at will, by a prominent link or button or a termination email; phone lines answered promptly, voicemail handled within one business day | As easy as the consent mechanism, in the same medium, and in every medium used to obtain consent |
| Save offers | Allowed if a continuously visible "click to cancel" sits alongside online; by phone, after telling the consumer they can say "cancel" | Allowed, but may not obstruct cancellation |
| Pre-renewal notice, term of a year or more | 15 to 45 days before renewal | 15 to 45 days before the cancellation deadline, for terms renewing for six months or more |
| Trial or promotional price over a month | 3 to 21 days before it ends | 3 to 21 days before the cancellation deadline |
| Price change | 7 to 30 days before it takes effect | 5 business days to 30 days before |
| Annual reminder | For annual agreements, with the service, the amount and frequency, and how to cancel | No separate requirement |
| Enforcement | Unconditional gift rule for goods (17603) and the state's remedies | Attorney General; civil penalties up to $100 per violation, $500 for multiple violations from one act, more if knowing |

New York has a second statute aimed at business customers too: General Obligations Law 5-903 makes an automatic renewal clause in a contract for service, maintenance or repair of real or personal property unenforceable unless the provider gives written notice, personally or by certified mail, 15 to 30 days before the date the customer must give notice to terminate; it doesn't apply to renewal periods of a month or less. Whether a given hosting contract falls within it is for counsel; the system's job is being able to send a dated, delivered notice to a business account on that schedule. Other states have their own laws and windows, which is why the rules are rows, not code ([Rules as Data](/docs/architecture/rules-as-data)).

### EU, Germany and the UK

- **Withdrawal.** Distance contracts with consumers carry a right to withdraw: Hetzner's terms give 14 days from conclusion of the contract, and the UK government describes its planned initial 14-day cooling-off period as largely mirroring the existing Consumer Contracts Regulations right. A host that starts service at once has to handle a withdrawal inside a prepaid term.
- **Germany's term limits and cancellation button.** In standard terms with consumers, Germany's Civil Code (section 309 no. 9 BGB) voids an initial term binding the consumer for more than two years, a tacit extension unless it is for an indefinite period terminable at any time on at most a month's notice, and a notice period longer than one month before the end of the term. Section 312k BGB requires a website that sells continuing paid services to consumers to offer a cancellation button labelled "Verträge hier kündigen" or equivalent, leading to a confirmation page with a "jetzt kündigen" button, a confirmation of receipt in text form with the date and time and the end date, and the right to cancel at any time without notice if the button is missing. A 48-month intro term sold to German consumers meets section 309 before it meets any renewal rule.
- **The UK's coming regime.** The government's April 2, 2026 response describes reminders "before trials or 12 month+ contracts auto-renew" in writing on a durable medium, a 14-day cooling-off period after entering a contract and another after a trial or a 12-month-plus contract auto-renews (with a full or proportionate refund), and online exit for online sign-ups, with offers that must not frustrate it. It anticipates commencement in spring 2027.

## Cancellation Online

The playbook's [Cancellation](/docs/payments/subscriptions#cancellation) section sets the design: cancel in the medium of sign-up, stamp `received_at`, store `effective_on`, confirm in the channel used, save offers as configuration. Hosting adds four decisions:

- **"Turn off auto-renew" is a cancellation.** Hostinger, Cloudflare and Route 53 frame ending a plan as a toggle; the service runs to the end of the paid term. Legally and in the data it is a cancellation request with an effective date at term end, and it gets the same receipt, confirmation and record as a "cancel now" button.
- **Cancelling a plan doesn't cancel what it bundled.** A hosting plan's free domain, email and backups are separate subscriptions. The cancellation flow shows each, with its own effective date, and asks; a domain left to renew silently after the hosting was cancelled is the complaint this flow exists to prevent.
- **What happens to the data is part of the confirmation.** Azure's flow makes the customer turn off running resources and says data is kept 30 to 90 days; DigitalOcean offers a purge; Hostinger says the service stays active to expiry. The confirmation states the date service stops and the date data is deleted, from the clocks in [Suspension and Deletion Clocks](/books/hosting-and-cloud/invoices-dunning-and-suspension#suspension-and-deletion-clocks).
- **A refund is computed from the plan version.** A 30-day money-back window, a pro rata refund after a price increase (New York), a proportionate refund in the UK renewal cooling-off period, and non-refundable registry fees are all rules on the plan version and the jurisdiction, computed when the request is received.

Germany's button and California's "click to cancel" both require the path to be reachable and continuously visible, so a save offer is a step the customer can skip in one action, recorded with the request ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)).

## Worked Examples

Prices from the providers' pages as of October 2026, US dollars, before tax.

**A 48-month shared hosting term.** Hostinger Premium: $2.49 a month on a 48-month prepay is $119.52 upfront. It renews "for the same term" at $10.99 a month, which is $527.52 for the next 48 months, 4.4 times the first term. The disclosure duty is at checkout; the cost of getting it wrong arrives four years later, so the consent row and the disclosure text it points to have to survive four years of releases. A California customer gets a renewal notice 15 to 45 days before renewal; a German consumer couldn't be bound to the 48 months in standard terms at all.

**A 12-month term charged 15 days early.** SiteGround StartUp: $2.99 a month for 12 months is $35.88; renewal at $17.99 is $215.88 a year, six times more. SiteGround renews plans of 12 months or more 15 days before expiry. For a term expiring on July 1, the charge runs on June 16, so a New York notice "15 to 45 days before the cancellation deadline" falls between May 2 and June 1, and a California notice "15 to 45 days before renewal" falls in the same window only if "renewal" is read as the charge date. The scheduler computes both from the charge date and sends once, inside the intersection.

**A 36-month term with a free domain.** Bluehost Starter: $3.99 a month for 36 months is $143.64; renewal at $9.99 is $359.64 for 36 months. The free domain renews after 12 months "at the then current rate," so in month 12 the account owes a domain renewal while the hosting has 24 months to run. That domain needs its own ERRP notices (26 to 35 and 4 to 10 days before its expiry if it is about to lapse), its own consumer renewal notice, and its own line in any cancellation flow. Cancelling within 30 days refunds the hosting but not the domain fee.

**A domain at a registrar that charges early.** Route 53 emails at 45 days, renews at 35 days and confirms. Cloudflare's first attempt is about 30 days out, and turning auto-renew off has to happen at least 30 days before expiry. A reminder sent at day 30 by either would be after the charge: the pre-renewal reminder for an auto-renewing name belongs before the first charge attempt.

## The Alternatives

| Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- |
| **Long prepaid intro term, auto-renew at list** | Cash upfront, low churn during the term, high renewal revenue | Price shock at renewal, refund disputes and chargebacks, the strictest notice rules apply, German term limits | Notice and consent infrastructure; refund reserve | Hostinger, SiteGround, Bluehost |
| **One-year intro, then a lower renewal than list** | A smaller jump, monthly options | Same notice duties; more renewals to schedule | Same | IONOS (first-year price, then a "price after first term") |
| **Month-to-month with no term** | No renewal notices beyond price changes; cancellation is closure | No float; involuntary churn is the main loss | Dunning instead of reminders | DigitalOcean, AWS, Azure pay-as-you-go |
| **Auto-renew on by default for domains, at cost** | Names don't lapse; no margin to defend | Charges the customer may not expect; non-refundable renewals | Registry fee float | Cloudflare Registrar, Route 53 |
| **Auto-renew off by default, manual renewal** | No unconsented charges at all | Names and sites lapse; ERRP notices carry all the weight | Support load from lapsed names | Some registrars and hosts as an option |
| **Contracts that continue until terminated, with notice** | Simple for business customers; a month's notice is predictable | Consumer rules on tacit extension; notice periods counted wrong | Low | Hetzner, Netlify self-serve |

## My Default

My default for a host or registrar selling to consumers is auto-renewal with the renewal price and term disclosed at checkout, explicit consent captured as its own record, and a reminder schedule built to the strictest rule that applies to the account's jurisdiction, counted from the charge date rather than the expiry. I'd charge renewals no earlier than the reminder window allows, offer a "turn off auto-renew" control and a "cancel now" control in the same place and record both as cancellation requests, and show every bundled subscription in the cancellation flow. For domains, I'd keep auto-renew on by default and send the ERRP notices whatever the setting, because a lapsed name is worse for the customer than a disclosed charge.

I'd keep intro terms at two years or less where German consumers are served, and I'd offer renewal terms no longer than the intro term without a separate disclosure. What would change this: selling only to business customers under negotiated contracts, where a continuing contract with a stated notice period (Hetzner's 30 days to the end of the month) is simpler and the consumer windows don't apply, though New York's General Obligations Law 5-903 is a reason to keep the notice machinery anyway.

## How to Build It

The playbook's `renewal_consents` table, unchanged, records consent ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)); this chapter adds the rules, the notices they schedule and the cancellation requests, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model).

```sql
-- Jurisdiction rules as data ------------------------------------------------

CREATE TABLE renewal_law_rules (         -- one row per notice or cancellation duty, dated
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction      TEXT NOT NULL,       -- 'US-CA', 'US-NY', 'DE', 'GB', 'ICANN', 'US'
  rule_code         TEXT NOT NULL,       -- 'ca_17602_b2', 'ny_527a_1f', 'errp_2_1_1', ...
  customer_scope    TEXT NOT NULL CHECK (customer_scope IN ('consumer', 'business', 'any')),
  applies_when      JSONB NOT NULL,      -- {"min_term_months": 12} or {"promo_days_over": 31}
  notice_kind       TEXT CHECK (notice_kind IN ('acknowledgment', 'pre_renewal',
                      'promo_end', 'price_change', 'annual_reminder', 'pre_expiry',
                      'post_expiry', 'cancellation_confirmation')),
  anchor            TEXT CHECK (anchor IN ('renewal_charge', 'term_end', 'cancel_deadline',
                      'change_effective', 'expiry', 'consent', 'received')),
  window_min_days   SMALLINT,            -- e.g. 15
  window_max_days   SMALLINT,            -- e.g. 45; null when "promptly"
  business_days     BOOLEAN NOT NULL DEFAULT FALSE,  -- New York's 5 business days
  required_medium   TEXT CHECK (required_medium IN ('same_as_signup', 'durable_medium',
                      'certified_mail', 'any')),
  cancellation_reqs JSONB,               -- {"online": true, "button_label": "Verträge hier kündigen"}
  source_ref        TEXT NOT NULL,       -- the statute or policy section
  valid_during      TSTZRANGE NOT NULL,  -- AB 2863 rows start 2025-07-01
  UNIQUE (jurisdiction, rule_code, valid_during)
);

-- Notices the rules schedule ------------------------------------------------

CREATE TABLE renewal_notices (           -- every reminder owed, sent or not
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  subscription_id       UUID NOT NULL REFERENCES subscriptions (id),
  subscription_period_id UUID REFERENCES subscription_periods (id),  -- the period it warns of
  resource_id           UUID REFERENCES resources (id),   -- the domain, for ERRP notices
  rule_id               UUID NOT NULL REFERENCES renewal_law_rules (id),
  notice_kind           TEXT NOT NULL,
  anchor_at             TIMESTAMPTZ NOT NULL,  -- the charge, expiry or change it counts from
  send_window           TSTZRANGE NOT NULL,    -- computed from the rule; the deadline is stored
  quoted_amount         BIGINT,                -- the renewal amount stated, minor units
  currency              CHAR(3),
  plan_version_id       UUID REFERENCES plan_versions (id),  -- whose price it quotes
  channel               TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'sms', 'mail',
                          'certified_mail')),
  status                TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'delivered',
                          'bounced', 'superseded', 'not_required')),
  message_id            UUID,                  -- the notifications log entry
  sent_at               TIMESTAMPTZ,
  superseded_by_id      UUID REFERENCES renewal_notices (id),  -- one notice satisfying two rules
  UNIQUE (subscription_id, subscription_period_id, rule_id),
  CHECK ((status IN ('sent', 'delivered', 'bounced')) = (sent_at IS NOT NULL))
);

-- Cancellation requests: defined here; the playbook names them ---------------

CREATE TABLE cancellation_requests (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  subscription_id    UUID NOT NULL REFERENCES subscriptions (id),
  received_at        TIMESTAMPTZ NOT NULL,      -- when the customer asked; the legal clock
  channel            TEXT NOT NULL CHECK (channel IN ('web', 'api', 'app', 'phone', 'voicemail',
                       'email', 'chat', 'mail', 'reseller')),
  actor              TEXT NOT NULL,             -- typed actor: member, reseller, staff, system
  kind               TEXT NOT NULL CHECK (kind IN ('auto_renew_off', 'cancel_at_term_end',
                       'cancel_now', 'withdrawal', 'renewal_cooling_off')),
  rule_id            UUID REFERENCES renewal_law_rules (id),  -- the right it was exercised under
  offer_shown        TEXT,                      -- save offer code, if any
  offer_accepted     BOOLEAN,
  outcome            TEXT NOT NULL CHECK (outcome IN ('pending', 'cancelled', 'saved',
                       'withdrawn_by_customer')),
  effective_at       TIMESTAMPTZ,               -- term end, or now
  refund_amount      BIGINT,                    -- computed from the plan version and the rule
  currency           CHAR(3),
  data_delete_after  TIMESTAMPTZ,               -- stated in the confirmation
  confirmed_at       TIMESTAMPTZ,               -- confirmation sent in the same channel
  reason_code        TEXT,
  CHECK (outcome = 'pending' OR confirmed_at IS NOT NULL)
);
CREATE INDEX cancellation_requests_subscription_idx ON cancellation_requests (subscription_id);

-- Consumer or business decides which rules apply here and which tax treatment applies
-- in Tax on Hosting & Cloud; it is a recorded determination, not inferred from a name:
ALTER TABLE accounts
  ADD COLUMN customer_type TEXT NOT NULL DEFAULT 'consumer'
    CHECK (customer_type IN ('consumer', 'business'));

-- Plan versions carry the renewal term, not just the renewal price:
ALTER TABLE plan_versions
  ADD COLUMN renewal_term_months SMALLINT,      -- null: same as term_months
  ADD COLUMN charge_lead_days   SMALLINT NOT NULL DEFAULT 0;  -- 15 at a host, 35 for a domain
```

The scheduler computes notices for each period that will renew. It finds the rules in force for the account's jurisdiction and customer type, anchors each on the charge date (term end minus `charge_lead_days`), and writes one row per rule; where two windows overlap, one sent notice satisfies both and the other row is `superseded`:

```sql
INSERT INTO renewal_notices (account_id, subscription_id, subscription_period_id, rule_id,
  notice_kind, anchor_at, send_window, quoted_amount, currency, plan_version_id,
  channel, status)
SELECT s.account_id, s.id, p.id, r.id, r.notice_kind,
       upper(s.current_term) - make_interval(days => pv.charge_lead_days),
       tstzrange(upper(s.current_term) - make_interval(days => pv.charge_lead_days)
                   - make_interval(days => r.window_max_days),
                 upper(s.current_term) - make_interval(days => pv.charge_lead_days)
                   - make_interval(days => r.window_min_days)),
       pv.renewal_amount, pv.currency, pv.id, 'email', 'scheduled'
FROM subscriptions s
JOIN plan_versions pv ON pv.id = s.plan_version_id
JOIN subscription_periods p ON p.subscription_id = s.id
  AND lower(p.valid_during) = upper(s.current_term)   -- the period about to start
JOIN accounts a ON a.id = s.account_id
JOIN renewal_law_rules r
  ON r.jurisdiction IN (a.subdivision, a.country)   -- 'US-CA' and 'US'; ISO 3166-2 and -1
 AND r.notice_kind = 'pre_renewal'
 AND r.valid_during @> upper(s.current_term)
 AND COALESCE((r.applies_when->>'min_term_months')::int, 0) <= pv.term_months
 AND r.customer_scope IN ('any', a.customer_type)
WHERE s.auto_renew AND s.status = 'active'
  AND r.window_min_days IS NOT NULL               -- business-day rules run in a second pass
ON CONFLICT (subscription_id, subscription_period_id, rule_id) DO NOTHING;
```

Notes on the sketch:

- **Rules are versioned like prices.** AB 2863's rows start on July 1, 2025 and apply to contracts "entered into, amended, or extended" from then, so the consent date, not today, picks the rule set for the disclosure, and the renewal date picks it for notices. `valid_during` and `source_ref` let an auditor see which text governed ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions); [Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Anchor on the charge, not the expiry.** `charge_lead_days` on the plan version makes the early charge explicit, and every window is computed from it. Moving the charge earlier is a plan change that reschedules notices.
- **Domains get two rule sets.** ERRP rows (`jurisdiction = 'ICANN'`) generate pre-expiry and post-expiry notices for the domain resource whether or not auto-renew is on, and are marked `not_required` once the name has renewed; consumer rows generate the renewal reminder. Both point at the same subscription.
- **Reminders go on the transactional stream.** A marketing unsubscribe never suppresses them, and a bounced reminder is a fact to act on (a second channel), per [Purpose Decides Everything](/docs/architecture/notifications#purpose-decides-everything).
- **Cancellation writes once, effects follow.** A `cancellation_requests` row sets `subscriptions.cancel_at` (or ends it), cancels scheduled notices for later periods, and starts the data clock; the request is never edited, and an accepted save offer is a new plan version with its own consent.
- **Events:** `renewal_notice.scheduled`, `renewal_notice.sent`, `renewal_notice.bounced`, `cancellation.received`, `cancellation.confirmed`, `subscription.auto_renew_disabled` and `subscription.renewed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, billing and the support console.

## Auditing

- **What was disclosed and agreed.** For every renewal charged, the plan version, the disclosure text and the consent row with its evidence, kept for at least California's three years or one year after the contract ends, whichever is longer.
- **Every notice owed and its fate.** For each renewal, which rules applied, the window computed, when the notice was sent, through which channel, whether it bounced, and the amount it quoted against the amount charged. A renewal charged without a sent notice inside its window is a finding.
- **Every cancellation and how long it took.** `received_at` against `confirmed_at` and `effective_at`, the channel, any save offer shown and declined, and the refund computed. Voicemail requests answered within a business day, per California.
- **ERRP compliance per name.** Pre-expiry notices inside 26 to 35 and 4 to 10 days, the post-expiry notice within five days, and the DNS interruption period, because ICANN Compliance asks registrars for exactly these.
- **Rule versions.** Which `renewal_law_rules` rows were in force on each date, with their sources ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Store the renewal price, the renewal term and the charge lead on the plan version,** and quote them from there in every disclosure and notice.
- **Record consent as its own row** pointing at the exact disclosure text, and keep it as long as the strictest rule requires.
- **Model jurisdiction rules as dated rows** with windows, anchors and media, and compute notices from them per period.
- **Count every window from the charge date,** because hosts and registrars charge renewals before expiry.
- **Give domains both rule sets:** ERRP notices for the name and consumer reminders for the payment.
- **Treat "auto-renew off" as a cancellation request,** with a receipt, a confirmation and an effective date.
- **Show bundled subscriptions in the cancellation flow,** each with its own date and refund.
- **Keep save offers skippable in one action,** and record them with the request.
- **Track the FTC's rulemaking and the UK regime as dated items,** and design to the strictest rule now rather than retrofit later.

## References

**Law and regulation**

- [15 U.S.C. 8403](https://www.law.cornell.edu/uscode/text/15/8403), ROSCA's disclosure, express informed consent and simple cancellation requirements, enacted by Pub. L. 111-345 on December 29, 2010
- [Custom Communications, Inc. v. FTC, No. 24-3137 (8th Cir. July 8, 2025)](https://ecf.ca8.uscourts.gov/opndir/25/07/243137P.pdf), the vacatur of the amended Negative Option Rule for the missing preliminary regulatory analysis and the $100 million finding
- [Federal Register: Revision of the Negative Option Rule (91 FR 6507, February 12, 2026)](https://www.federalregister.gov/documents/2026/02/12/2026-02866/revision-of-the-negative-option-rule-withdrawal-of-the-cars-rule-removal-of-the-non-compete-rule-to), the final rule restoring the pre-2024 text, effective on publication
- [Federal Register: Rule Concerning the Use of Prenotification Negative Option Plans (91 FR 12318, March 13, 2026)](https://www.federalregister.gov/documents/2026/03/13/2026-04952/rule-concerning-the-use-of-prenotification-negative-option-plans), the advance notice, docket FTC-2026-0265, comments due April 13, 2026
- [Federal Register: Petition for Rulemaking of the Consumer Federation of America and the American Economic Liberties Project (90 FR 55701)](https://www.federalregister.gov/api/v1/documents/2025-21887.json), the December 3, 2025 petition
- [Federal Register: FTC documents matching "negative option", newest first](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22negative%20option%22&conditions[agencies][]=federal-trade-commission&order=newest&per_page=10), no proposed rule after the advance notice as of October 2026
- [Cal. Bus. & Prof. Code 17602](https://california.public.law/codes/business_and_professions_code_section_17602), disclosure, consent and records, online cancellation, save offers, price-change notice, annual reminder, the 3-to-21 and 15-to-45-day windows, and the July 1, 2025 applicability
- [New York General Business Law 527-a](https://www.nysenate.gov/legislation/laws/GBS/527-A), disclosure, consent, acknowledgment, cancellation in the same medium, price-increase options, material-change and pre-renewal notice windows, penalties
- [New York General Obligations Law 5-903](https://www.nysenate.gov/legislation/laws/GOB/5-903), the 15-to-30-day written notice for automatic renewal of service contracts
- [German Civil Code section 309](https://www.gesetze-im-internet.de/bgb/__309.html), no. 9: the two-year initial term, tacit extension and one-month notice limits in standard terms
- [German Civil Code section 312k](https://www.gesetze-im-internet.de/bgb/__312k.html), the cancellation button, confirmation page, receipt and the consequence of omitting them
- [GOV.UK: Government response to the consultation on the subscription contracts regime](https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime/outcome/government-response-to-consultation-on-the-implementation-of-the-new-subscription-contracts-regime-web-accessible-version), reminders, the two 14-day cooling-off periods, online exit and spring 2027 commencement
- [GOV.UK: Consultation on the implementation of the new subscription contracts regime](https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime), the consultation dates and the April 2, 2026 outcome
- [FTC: Amazon to pay $2.5 billion](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-secures-historic-25-billion-settlement-against-amazon), the September 25, 2025 settlement under the FTC Act and ROSCA
- [Holland & Knight: FTC steps up subscription enforcement](https://www.hklaw.com/en/insights/publications/2025/09/ftc-steps-up-subscription-enforcement-after-click-to-cancel-rule-struck-down), Match and Chegg amounts and enforcement under ROSCA and section 5

**Policy**

- [ICANN: Expired Registration Recovery Policy (2024 text)](https://www.icann.org/en/contracted-parties/consensus-policies/expired-registration-recovery-policy/expired-registration-recovery-policy-21-02-2024-en), notices, DNS interruption, the 30-day RGP, the February 21, 2024 update, the August 21, 2025 deadline and compliance from August 31, 2013
- [ICANN: Expired Registration Recovery Policy (2013 text)](https://www.icann.org/resources/pages/errp-2013-02-28-en), the compliant notice windows, fee disclosure and notice-method disclosure

**Provider documentation and terms**

- [Hostinger: Pricing](https://www.hostinger.com/pricing), Premium's intro price, 48-month term, upfront total and same-term renewal price
- [Hostinger: How to disable auto-renewal](https://www.hostinger.com/support/1583234-how-to-stop-auto-renewal/), the toggle, service active to expiry, voided monthly invoice
- [SiteGround: Web hosting plans](https://world.siteground.com/web-hosting.htm), StartUp's intro and renewal price and the 12-month prepay
- [SiteGround: When will I be billed for renewal](https://www.siteground.com/kb/will-billed-renewal), auto-renewal 15 days before expiry for 12-month-plus plans and 5 days for monthly plans
- [Bluehost: Shared hosting](https://www.bluehost.com/hosting/shared), Starter's intro and renewal price, the 36-month term, the free domain's renewal and refund terms
- [IONOS: Web hosting](https://www.ionos.com/hosting/web-hosting), first-year and after-first-term prices, monthly cancellation periods, the money-back guarantee
- [GoDaddy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), automatic renewal laws among the laws particularly relevant to its business
- [Namecheap: Invoicing policies](https://www.namecheap.com/support/knowledgebase/article.aspx/9165/21/invoicing--suspension), hosting invoices 7 days before the billing date and retries 2 and 5 days after
- [Namecheap: Why is the redemption fee so high](https://www.namecheap.com/support/knowledgebase/article.aspx/1420/2207/why-is-the-redemption-fee-so-high/), domain renewal 30 days before expiry and release 80 to 85 days after
- [Cloudflare: Renew domains](https://developers.cloudflare.com/registrar/account-options/renew-domains/), auto-renew by default at registry price, attempt timing, the reminder schedule, non-refundable renewals
- [AWS: Renewing registration for a domain](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-renew.html), the 45-day email, renewal 35 days out, ICANN's 30-day and 7-day emails
- [AWS: Enabling or disabling automatic renewal for a domain](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-enable-disable-auto-renewal.html), turning off auto-renew before closing an account
- [AWS Customer Agreement](https://aws.amazon.com/agreement/), no fixed term and termination by notice and account closure (section 5)
- [Microsoft Learn: Cancel and delete your Azure subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/cancel-azure-subscription), the cancellation flow, the support plan toggle, the final bill and data kept 30 to 90 days
- [DigitalOcean: Deactivate accounts and purge account data](https://docs.digitalocean.com/platform/accounts/deactivate/), deactivation stopping charges and the purge option
- [Hetzner: Terms and conditions](https://www.hetzner.com/legal/terms-and-conditions/), automatic continuation, 30 days' notice to the end of the month, the 14-day withdrawal right
- [Netlify: Self-Serve Subscription Agreement](https://www.netlify.com/legal/self-serve-subscription-agreement/), renewal for the same duration and the cancellation deadlines
