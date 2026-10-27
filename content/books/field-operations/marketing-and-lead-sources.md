+++
title = "Marketing & Lead Sources"
description = "Where field work comes from: Local Services Ads, marketplaces, mail and referrals, call tracking, attribution to jobs and plans, lead credits and consent."
category = "Field Operations Industry"
order = 1521
part = "Selling"
aliases = []
tags = ["field-operations", "marketing", "lead-sources", "attribution", "call-tracking", "tcpa"]
+++

A field business buys most of its new customers one lead at a time. A plumber pays Google for a phone call from someone with a backed-up drain, an HVAC company pays a marketplace for a homeowner's request for a quote, a lawn company mails every house on three carrier routes, and a pest company knocks doors on the streets its routes already run. The phone rings, a CSR books the job, a technician sells a repair and a maintenance plan, and the plan renews for four years. Which of those dollars did the postcard earn? Answering that, per source and per campaign, is what decides where next month's budget goes, and it depends on facts recorded at the first call that nobody can reconstruct later.

This chapter covers where leads come from in the trades, how calls and forms are tied to the campaign that produced them, how booked jobs and agreements are attributed back, what each source costs and how to dispute a bad lead, the consent rules for leads you buy, and marketing to the customers you already have. The canvassing channel is its own chapter ([Door-to-Door Sales](/books/field-operations/door-to-door-sales)); answering and booking the call is [The Contact Center](/books/field-operations/contact-center); review requests are in [Reviews and Surveys](/books/field-operations/customer-communications#reviews-and-surveys); and what happens after the sale is in [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules) and [Signing the Agreement](/books/field-operations/signing-the-agreement). Attribution in general is in [Attribution Basics](/docs/telemetry/product-analytics#attribution-basics).

## Where Leads Come From

| Source | How it's bought | What arrives | Typical trades |
| --- | --- | --- | --- |
| **Google Local Services Ads** | Per valid lead | A call, message, voicemail or booking request, with Google's lead ID | Every residential trade Google lists |
| **Google Business Profile** | Free; the map listing | A call or website click from the listing | All |
| **Search and social ads** | Per click or impression | A web visit, then a form or call | All, especially replacement and install work |
| **Marketplaces** (Angi, HomeAdvisor under Angi, Thumbtack) | Per lead, or by subscription | A request with the customer's contact details and job description | Repair, cleaning, handyman, lawn |
| **Review and community sites** (Yelp, Nextdoor) | Per click, or a business page | A call, a message or a quote request | Repair, cleaning, pest |
| **Direct mail** | Per piece | A call to a printed number, a visit to a printed URL, or a code | Lawn, pest, HVAC tune-ups, pool openings |
| **Door-to-door** | Commission per sale | A signed agreement at the door | Pest, lawn, solar, security |
| **Referrals** | A credit or reward per converted referral | A new customer naming an existing one | All |
| **Technician-generated** | A spiff or commission | An opportunity found on a visit | Repair and replacement |
| **Existing customers** | The cost of the message | A renewal, an add-on, a repeat call | All |

Two kinds of source behave differently in data. **Paid-per-lead sources** (Local Services Ads, Angi, Thumbtack) charge per contact and issue credits for bad ones, so each lead carries a charge, a credit status and a dispute deadline. **Paid-for-exposure sources** (clicks, mail, a listing) charge regardless of outcome, so their cost is spend per period divided over whatever they produced. Both end in the same record: a lead with a source and a campaign.

## How the Platforms Do It

The field suites all record a lead source; they differ in whether the source arrives by itself and how far the money is followed.

| Platform | How the source gets there | What's reported |
| --- | --- | --- |
| ServiceTitan | Campaigns grouped by campaign categories; "Phone integration is required to automatically track the source of incoming leads," and ServiceTitan says to "attach a unique tracking number to each of your campaigns" | Campaign Summary report; a campaign without a business unit is associated "with all business units by default" |
| Housecall Pro | A lead source on customers, jobs and estimates, with bulk "Update lead source" | Marketing dashboard ROI table, one row per lead source ("Google, Thumbtack, Angi, or referrals"); "Marketing spend is recorded by month"; "A large No lead source total usually means the applicable lead-source field was not completed" |
| Jobber | A lead source on the client | Lead Source Report on "which marketing channels are bringing in the most valuable leads," valuing each by "the first invoice linked to the lead" |
| Workiz | Lead sources on jobs, with marketplace integrations (Angi) | "reports on your marketing spend and the lead source of your booked jobs" |
| PestPac | Campaigns with "unique URLs and phone numbers" so "every lead" traces "back to its source" | Cost per lead, acquisition cost, conversion rates and ROI |

The pattern across them: a **source** (the channel), a **campaign** (a specific spend inside it), a tracking number or URL per campaign so the source is captured without asking, monthly spend entered by hand, and an ROI report that divides revenue by spend. The weaknesses are just as consistent. A source typed by a CSR is often blank (Housecall Pro's own help says so). Jobber values a lead by its first invoice, so a lead that became a four-year maintenance plan looks like a $150 diagnostic. And a source on the customer can't tell a new customer's first job from their fifth.

## Google Local Services Ads

Local Services Ads are the most important paid source in many residential trades, and they're priced unlike search ads: "you pay for valid leads," not clicks. The charged lead types are:

- **Phone calls** that "You answer," or where "you call the customer back and speak with the customer."
- **Missed calls** during business hours where "the customer stays on the line for more than 20 seconds."
- **Messages and voicemails.**
- **Booking requests,** "United States and Canada only," which partner FSMs receive directly ([AI Voice Agents and Lead Sources](/books/field-operations/booking-appointments#ai-voice-agents-and-lead-sources) covers booking them against real availability).

Three things have changed recently, and older guides are wrong about each:

- **Credits are mostly automatic.** Google says "leads determined to be invalid or low quality are not charged," charged leads "may be issued credits automatically if later determined to be low quality," and "In most cases, credits will be applied to your account balance within 30 days." Feedback goes through rating the lead (`LocalServicesLeadService.ProvideLeadFeedback` in the Google Ads API). Google no longer credits leads for a job type or area the business doesn't serve, so keep the service area and job types in the ad accurate rather than counting on disputes.
- **The badge changed.** Google is "launching a single badge for all advertisers," existing advertisers "will automatically earn the new Google Verified badge," and Google is "discontinuing the Money Back Guarantee associated with the Google Guarantee badge."
- **The product is moving into Performance Max.** Google's migration notice says "August 2026: The first phase of the migration begins for select home and storefront service advertisers," that advertisers "still only pay for valid leads (such as phone calls and messages) rather than ad clicks," and that "manual bidding and industry-level Target CPA are being deprecated." Expect the reporting and API surface to keep moving through 2027.

The API exposes each lead as `local_services_lead`, with conversations under it ("one lead can have many conversations") and contact details that become null once the lead's status is `WIPED_OUT`. That last detail matters for the data model: copy the contact details into your own lead record when the lead arrives, under your own retention rules, because the source will erase them.

## Marketplaces and Other Pay-Per-Lead Sources

Marketplaces sell the same homeowner's request to one or several businesses, and each sets its own credit rules. Angi's are typical of the strict end:

- **Credit reasons:** invalid contact information, a project outside your ZIP codes, a service mismatch, a duplicate "within 45 days," and a charge while paused.
- **Conditions:** "The lead must be less than 45 days old," and "You should have attempted to call the homeowner within 24 hours of being sent the lead."
- **Exceptions and expiry:** on an annual subscription "you can report leads, but credits are not offered," and credits "expire if not used within six months."

Thumbtack's direct leads arrive pre-matched to the business's targeting preferences and are billed automatically (ServiceTitan's Thumbtack integration books from them; Jobber creates a client and a request for each). Yelp Ads charge per click ("You'll only pay when someone clicks on your ad") within a monthly maximum, with the daily budget "a daily average, not a daily cap."

What the system needs from all of them is the same:

- **The source's lead ID as an idempotency key,** because marketplace webhooks arrive twice ([Idempotency and Double-Booking](/books/field-operations/booking-appointments#idempotency-and-double-booking)).
- **The charge and the credit as fields on the lead,** with the dispute deadline computed from that source's rules (Angi's 45 days, its 24-hour contact attempt) when the lead arrives.
- **Evidence for disputes captured as it happens:** the first contact attempt's time, the call recording or message thread, and the reason the lead was unserviceable (outside the territory per [Territories & Capacity](/books/field-operations/territories-and-capacity), a trade the branch doesn't offer, a duplicate of an existing customer).
- **A reconciliation** of the source's invoice against your leads each month, because the source's count and yours will differ.

## Call Tracking and Dynamic Number Insertion

Most trade leads are phone calls, and a phone call carries no UTM parameters. **Call tracking** puts the campaign into the phone number:

- **Source tracking** gives each campaign its own number. CallRail "assigns a unique number to campaigns or promotions" and "forwards all calls to your main business phone number." The number on the postcard, the van wrap, the Business Profile and each marketplace profile is different, so a call to it is attributed before anyone says hello.
- **Visitor tracking** (dynamic number insertion) swaps the number on the website per visitor: CallRail "assigns a unique phone number to each individual who visits your website after an online search," and the number "follows them click by click, from page to page and visit to visit." The call then inherits the visit's referrer, landing page, ad click and keyword. Invoca sells the same capability to larger advertisers, with "attribution down to the keyword."

The FSM side is where calls meet jobs: ServiceTitan requires phone integration to track a lead's source, with a tracking number per campaign, so the campaign lands on the customer and the job without anyone typing it. My rule: the tracking number decides the campaign when there is one, and the CSR's "how did you hear about us?" is recorded beside it as a separate field, not instead of it. The two disagree often (a customer who saw the truck, then searched the company name, then called from the site), and both answers are data. Self-reported source is the only way to see word of mouth and the van wrap at all.

Google Business Profile adds a caution. Its **Calls** metric is "The number of times a customer clicked on the call button," a tap, not a connected call, and "As of July 31, 2024, the chat and call history features are no longer available in your Business Profile." A tracking number on the profile is the only way to see what those taps became.

## Attribution: From Lead to Job to Agreement

A lead is worth what it eventually produced, and in this industry that can be a $89 diagnostic, a $12,000 system replacement, or a plan that renews for years. Attribution is the chain that connects them:

1. **Touch.** Each contact with a campaign: an ad click with its click ID, a call to a tracking number, a form submission with UTM parameters, a mail code typed into a web form.
2. **Lead.** The first contact that the business treats as a prospect, with its source and campaign, matched to an existing account if there is one.
3. **Work order or estimate.** The job booked from the lead, which points back at it.
4. **Revenue.** Invoices on that work order, and any agreement sold from it ([Converting One-Time Customers to Plans](/books/field-operations/one-time-services-and-upsells#converting-one-time-customers-to-plans) has the opportunity chain from one-time work to a plan).

Four decisions make the numbers honest:

- **New customers and existing ones are separate questions.** A lead from an existing customer who called the number on last year's invoice is not marketing's acquisition. My default: attribute a work order to a campaign only if the lead was new or the customer had been inactive for a configured period; existing customers' repeat work is reported under its own source. Without that rule, the campaign that happens to own the main phone number takes credit for the whole customer base.
- **Choose the revenue horizon explicitly.** First invoice (Jobber's choice) undervalues plans; lifetime revenue rewards old campaigns forever. A fixed window (revenue in the first 12 months, with agreement value counted at its first-year contract value) compares campaigns fairly across months.
- **One model, recorded with the result.** First touch, last touch or a split are all defensible; changing models silently isn't. Store the raw touches, the model that produced each attribution, and its version ([Attribution Basics](/docs/telemetry/product-analytics#attribution-basics)).
- **Send outcomes back to the ad platforms.** Ad bidding optimizes toward whatever conversion it's told about. Google's offline conversion import lets a business report "how your online ads affect offline sales" with the GCLID "that led to the offline conversion," and "Enhanced conversions for leads" is its newer, recommended form, matching on "user-provided data in addition to" the click ID. Meta's Conversions API takes offline events with `action_source` set to `physical_store`. A booked job and a sold replacement, sent back with their value, teach the bidder to buy the leads that book rather than the leads that call.

## Cost per Lead, per Booked Job and ROI

The definitions, so dashboards and budgets agree ([One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric)):

```text
cost_per_lead        = spend(campaign, period) / count(leads from campaign in period)
                       -- leads net of duplicates; credited leads excluded from both terms
lead_booking_rate    = count(leads with a booked work order) / count(leads)
cost_per_booked_job  = spend(campaign, period) / count(leads that booked a work order)
attributed_revenue   = sum(invoiced revenue within the horizon on work orders attributed
                         to the campaign) + first-year value of agreements sold from them
roi                  = (attributed_revenue - spend) / spend
customer_acq_cost    = spend(source, period) / count(new accounts from source in period)
```

Housecall Pro's formula, "ROI = (Selected earnings − Marketing spend) ÷ Marketing spend," is the same shape. Two cautions. Spend for pay-per-lead sources is the sum of lead charges net of credits, by the lead's date, not the source's invoice date. And ROI on revenue overstates return for any trade with real material costs; a replacement-heavy HVAC business should compute it on gross margin.

For orientation only: LocaliQ's sample of 3,211 US search advertising campaigns (April 2024 to March 2025, medians it calls averages) put median cost per lead on search ads at $127.74 for HVAC, $129.02 for plumbing, $93.69 for electricians and $46.99 for cleaning and maid services. That's one vendor's customer base and one channel. Benchmarks don't replace measuring cost per booked job yourself, because two sources with the same cost per lead can differ several times over in how many leads book.

## Purchased Leads and Consent

A lead bought from a marketplace or a lead generator comes with whatever consent the generator collected, and calling or texting it is the business's legal exposure, not the generator's. The law is in [Calls, Texts & Email](/docs/compliance/consumer-contact); the field twist is the history of one rule.

In December 2023 the FCC adopted a **one-to-one consent** rule: prior express written consent would have had to name a single seller and cover only calls "logically and topically associated" with the website where it was given, aimed squarely at comparison sites that sold one homeowner's form to many contractors. On January 24, 2025, the Eleventh Circuit vacated it in *Insurance Marketing Coalition v. FCC*: "the FCC exceeded its statutory authority," and the statute requires prior express consent, nothing more. The court noted the FCC's own concession that a consumer could consent to a home repair business's calls on a mortgage form. On July 14, 2025, the FCC formally repealed the revised rule text and reinstated the prior definition (DA 25-621).

So the prior definition stands: telemarketing by autodialer or artificial voice needs prior express written consent, signed, authorizing **that seller** to call that number, with the "not a condition of purchase" disclosure. What the system should do with a purchased lead:

- **Store the consent evidence with the lead:** the consent text as shown, the seller names it listed, the timestamp, the page and the generator's reference. A lead without it is a lead you call by hand, if at all.
- **Check that your business is named,** not just "partners." The vacatur removed the one-seller rule; it didn't remove the requirement that consent authorize the seller calling.
- **Run purchased leads through the same outbound gate** as everything else (do-not-call, quiet hours in the customer's zone, state rules), with the inquiry's date for the three-month established business relationship exemption ([Calling Hours and Do-Not-Call](/docs/compliance/consumer-contact#calling-hours-and-do-not-call)).
- **Keep a live person on the first callback** when consent is thin. A person dialing by hand is outside the TCPA's autodialer and artificial-voice consent rules, though do-not-call and calling hours still apply; an AI voice is not ([Artificial and AI Voices](/docs/compliance/consumer-contact#artificial-and-ai-voices)).

## Direct Mail, Referrals and Reputation

**Direct mail** remains a staple for lawn, pest, HVAC tune-up and pool opening campaigns, because it reaches every house on a route the business already drives. USPS Every Door Direct Mail delivers "to every address on your selected routes," at "$0.26 per piece" for retail flats (as low as $0.259 through a business mail entry unit), in batches of "at least 200 and up to 5,000 pieces per day per ZIP Code." A carrier route is the mail equivalent of a canvass area, so pick routes from route density and the service area rather than by ZIP code ([Territories & Capacity](/books/field-operations/territories-and-capacity)). Attribute mail with a tracking number and a short URL or code per drop, as PestPac's campaigns do. Mover and household lists come with license limits on use in mail ([Property and Consumer Data](/books/field-operations/door-to-door-sales#property-and-consumer-data)).

**Referrals** are a credit or reward per converted referral. Jobber's referral feature gives the referring client "a discount either as a fixed amount or percentage," awarded "when a referred client makes their payment," with "only one credit can be applied per invoice." Model a referral as a lead source whose campaign is the referring account, and the reward as a priced credit line that posts only when the referred customer's first payment clears, so a referral that cancels in the cooling-off window earns nothing ([Charging Inside the Window](/books/field-operations/consumer-protection#charging-inside-the-window)). Technician-generated leads are a referral from inside; they're tracked as opportunities in [Upselling as a System](/books/field-operations/one-time-services-and-upsells#upselling-as-a-system).

**Reviews** are a lead source in their own right, because the map listing's rating decides who gets the call. How and when to ask, and the FTC's rule on review incentives and suppression, are in [Reviews and Surveys](/books/field-operations/customer-communications#reviews-and-surveys). One platform rule to add: Google's policy forbids businesses to "Discourage or prohibit negative reviews, or selectively solicit positive reviews from customers," so a flow that sends only happy customers to Google risks the listing as well as the FTC.

## Marketing to Existing Customers

The cheapest lead is a customer the business already serves. The campaigns are familiar: tune-up season for HVAC members, pool opening and closing, aeration in the fall, renewal reminders, membership offers to repair customers, and win-back for those who left ([Win-Back](/books/field-operations/collections-and-retention#win-back)). The lists come from the platform's own records: ServiceTitan's Follow Ups screen keeps tabs for unsold estimates and expiring memberships, and declined estimate options and lost opportunities feed campaigns in [Outreach Campaigns](/books/field-operations/one-time-services-and-upsells#outreach-campaigns).

Three rules keep them from going wrong:

- **Consent by purpose.** A service reminder that adds an offer is marketing and needs marketing consent; the rule and the outbound gate are in [Contacting Customers From the Field](/books/field-operations/consumer-protection#contacting-customers-from-the-field), and the ledger in [The Consent Ledger](/docs/architecture/notifications#the-consent-ledger).
- **Suppression.** Don't send a membership offer to a member, a tune-up offer to a property with a tune-up already booked, or anything promotional to an account in collections or with an open complaint.
- **Attribution as its own source.** Revenue from existing-customer campaigns is reported as retention and expansion, not acquisition, so acquisition ROI stays honest.

## How to Build It

The chapter adds sources, campaigns, spend, leads, touches and attributions to [The Core Data Model](/books/field-operations/field-operations-business#the-core-data-model). Accounts, people and properties are the existing tables; a lead may exist before any of them.

```sql
CREATE TABLE lead_sources (               -- the channel
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  name                TEXT NOT NULL,             -- 'Google LSA', 'Angi', 'Direct mail'
  kind                TEXT NOT NULL CHECK (kind IN ('pay_per_lead', 'pay_per_click',
                        'pay_per_piece', 'organic', 'referral', 'door_to_door',
                        'technician', 'existing_customer')),
  credit_rules        JSONB,                     -- dispute window, reasons, contact deadline
  UNIQUE (tenant_id, name)
);

CREATE TABLE campaigns (                  -- one spend inside a channel
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  lead_source_id      UUID NOT NULL REFERENCES lead_sources (id),
  org_unit_id         UUID REFERENCES org_units (id),  -- brand or branch; null for all
  name                TEXT NOT NULL,
  tracking_numbers    TEXT[] NOT NULL DEFAULT '{}',    -- E.164, unique across live campaigns
  tracking_code       TEXT,                      -- URL slug or mail code
  active_during       DATERANGE NOT NULL
);

CREATE TABLE campaign_spend (             -- exposure spend; per-lead charges live on leads
  campaign_id         UUID NOT NULL REFERENCES campaigns (id),
  month_on            DATE NOT NULL,             -- first of the month
  amount_minor        BIGINT NOT NULL,
  currency            CHAR(3) NOT NULL,
  PRIMARY KEY (campaign_id, month_on)
);

CREATE TABLE leads (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  campaign_id         UUID REFERENCES campaigns (id),  -- null when only self-reported
  lead_source_id      UUID NOT NULL REFERENCES lead_sources (id),
  self_reported_source TEXT,                     -- "how did you hear about us", as said
  external_lead_id    TEXT,                      -- the source's ID; idempotency key
  account_id          UUID REFERENCES accounts (id),   -- matched or created
  property_id         UUID REFERENCES properties (id),
  is_existing_customer BOOLEAN NOT NULL,         -- decided at arrival, by rule
  received_at         TIMESTAMPTZ NOT NULL,
  first_contacted_at  TIMESTAMPTZ,               -- evidence for credit rules
  status              TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'booked',
                        'won', 'lost', 'disqualified')),
  status_reason       TEXT,                      -- out_of_area, trade_not_offered, duplicate, ...
  charge_minor        BIGINT,                    -- pay-per-lead only
  credit_status       TEXT CHECK (credit_status IN ('none', 'requested', 'credited',
                        'denied')),
  credit_deadline_at  TIMESTAMPTZ,               -- from the source's rules at arrival
  consent_evidence_id UUID,                      -- purchased leads: the consent as captured
  UNIQUE (tenant_id, lead_source_id, external_lead_id),
  CHECK (status NOT IN ('lost', 'disqualified') OR status_reason IS NOT NULL)
);

CREATE TABLE touches (                    -- raw, append-only
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  lead_id             UUID REFERENCES leads (id),
  account_id          UUID REFERENCES accounts (id),
  campaign_id         UUID REFERENCES campaigns (id),
  kind                TEXT NOT NULL CHECK (kind IN ('call', 'form', 'click', 'message',
                        'mail_code', 'booking_request', 'referral')),
  occurred_at         TIMESTAMPTZ NOT NULL,
  tracking_number     TEXT,
  click_ids           JSONB,                     -- gclid and others, as received
  utm                 JSONB,
  call_id             UUID                       -- the contact center's call record
);

CREATE TABLE attributions (               -- computed; one row per credited record and model
  tenant_id           UUID NOT NULL,
  lead_id             UUID NOT NULL REFERENCES leads (id),
  work_order_id       UUID REFERENCES work_orders (id),
  agreement_id        UUID REFERENCES agreements (id),
  model               TEXT NOT NULL,             -- 'last_touch.v2', 'first_touch.v1'
  credit_share        NUMERIC(5, 4) NOT NULL CHECK (credit_share > 0 AND credit_share <= 1),
  CHECK (num_nonnulls(work_order_id, agreement_id) = 1)
);

ALTER TABLE work_orders ADD COLUMN lead_id UUID REFERENCES leads (id);
ALTER TABLE estimates   ADD COLUMN lead_id UUID REFERENCES leads (id);
```

The choices in it:

- **The source's lead ID is unique per source,** so a twice-delivered webhook produces one lead, and every credit request can name the source's record.
- **Pay-per-lead charges live on the lead,** exposure spend on the campaign by month. Cost per lead for either reads both.
- **`is_existing_customer` is decided once, at arrival,** by a rule with a dormancy window, so acquisition reports don't change when someone later edits an account.
- **Touches are raw and append-only,** and attributions are a derived table with the model named per row, so a new model is a recompute, not a migration.
- **The work order carries its lead.** The CSR who books from a lead links it in the booking flow ([The Contact Center](/books/field-operations/contact-center)), and nothing downstream has to guess.

Events: `lead.received`, `lead.status_changed`, `lead.credit_requested` and `lead.credited`, consumed by the contact center queue, the dispute workflow and the conversion upload to ad platforms ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

Marketing records are asked for by finance (where did the money go), by a lead source (prove this lead was bad), and in a TCPA suit (prove this person consented). Keep:

- **Consent evidence for every purchased or web lead,** as shown and as captured, linked from the consent ledger, for as long as you rely on it.
- **Each lead's credit history:** the request, its reason and evidence, the source's answer and the amount credited.
- **Campaign and tracking number history:** which number belonged to which campaign on which dates, because numbers are recycled and a call is attributed by the mapping in force when it rang.
- **Source edits:** who changed a lead's or customer's source, from what to what. Re-sourcing a customer moves credit, and sometimes pay ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions)).
- **Attribution model versions** and the outputs they produced for each closed month.

The record mechanics are in [Audit Trails](/docs/architecture/audit-trails); retention is in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Record a source and a campaign on every lead,** captured by tracking number, URL or source ID, with the self-reported answer stored beside it.
- **Make the lead its own record,** linked to the work order, estimate and agreement it produced, and keyed by the source's lead ID.
- **Put charges, credits and dispute deadlines on pay-per-lead leads,** with evidence captured as the lead is worked and a monthly reconciliation against the source's bill.
- **Separate new customers from existing ones at arrival,** so acquisition ROI isn't inflated by repeat work.
- **Attribute revenue over a fixed horizon** that counts agreements sold, from raw touches, with the model versioned.
- **Report cost per booked job beside cost per lead,** and ROI on margin for material-heavy work.
- **Send booked and sold outcomes back to the ad platforms** with their click IDs.
- **Store consent evidence on purchased leads** and run every outbound contact through the same gate.
- **Gate campaigns to existing customers on marketing consent and suppression rules,** and report them as retention.

## References

**Specifications**

- [U.S. Court of Appeals for the Eleventh Circuit: Insurance Marketing Coalition v. FCC, No. 24-10277 (PDF)](https://media.ca11.uscourts.gov/opinions/pub/files/202410277.pdf), vacating the one-to-one consent and topically associated requirements, January 24, 2025
- [FCC: DA 25-621, Order repealing the revised 47 CFR 64.1200(f)(9)](https://docs.fcc.gov/public/attachments/DA-25-621A1.txt), reinstating the prior written consent definition, July 14, 2025
- [16 CFR 465.2: Fake or false consumer reviews](https://www.law.cornell.edu/cfr/text/16/465.2), reviews misrepresenting the author or their experience
- [16 CFR 465.7: Review suppression](https://www.law.cornell.edu/cfr/text/16/465.7), suppressing reviews and misrepresenting displayed reviews

**Reference**

- [Google Ads Help: Local Services Ads charges](https://support.google.com/adwords/answer/7195435), pay per valid lead and the charged lead types
- [Google Local Services Ads Help: Lead credits](https://support.google.com/localservices/troubleshooter/11390630), automatic credits, the 30-day timing and reasons no longer credited
- [Google Local Services Ads Help: Google Verified badge](https://support.google.com/localservices/answer/16498018), one badge for all advertisers and the end of the Money Back Guarantee
- [Google Ads Help: Local Services Ads migration](https://support.google.com/google-ads/answer/17213585), the August 2026 migration, pay per valid lead and deprecated bidding options
- [Google Ads API: Local Services campaigns](https://developers.google.com/google-ads/api/docs/campaigns/local-service-campaigns), `local_services_lead`, conversations, wiped-out contact details and lead feedback
- [Google Business Profile Help: Chat and call history](https://support.google.com/business/answer/14919056), the features removed July 31, 2024
- [Google Business Profile Help: Performance metrics](https://support.google.com/business/answer/7689763), calls counted as button clicks
- [Google Ads Help: Offline conversion imports](https://support.google.com/google-ads/answer/7014069), GCLID-based imports and enhanced conversions for leads
- [Google Ads Help: Enhanced conversions for leads](https://support.google.com/google-ads/answer/11021502), user-provided data with the click ID
- [Meta for Developers: Conversions API for offline events](https://developers.facebook.com/docs/marketing-api/conversions-api/offline-events), offline events with `action_source` set to `physical_store`
- [Google: Maps user contributed content policy, prohibited and restricted content](https://support.google.com/contributionpolicy/answer/7400114), no discouraging negative reviews or selectively soliciting positive ones
- [FTC: Consumer Reviews and Testimonials Rule, questions and answers](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers), the October 21, 2024 effective date and civil penalties
- [USPS: Every Door Direct Mail](https://www.usps.com/business/every-door-direct-mail.htm), delivery to every address on a route, per-piece prices and the 200 to 5,000 per day per ZIP limit
- [LocaliQ: Home services search advertising benchmarks](https://localiq.com/blog/home-services-search-advertising-benchmarks/), median cost per lead by trade from 3,211 campaigns (vendor data)

**In practice**

- [ServiceTitan: Add marketing campaigns](https://help.servicetitan.com/docs/add-marketing-campaigns-in-servicetitan), phone integration for source tracking, a tracking number per campaign, categories and business units
- [ServiceTitan: Book a job from a Thumbtack lead](https://help.servicetitan.com/how-to/book-a-job-from-a-thumbtack-lead), direct leads matched to targeting preferences and billed automatically
- [ServiceTitan: Use the Follow Up screen](https://help.servicetitan.com/residential-s-r/docs/use-the-follow-up-screen), unsold estimates and expiring memberships as follow-up lists
- [Housecall Pro: How to use lead sources](https://help.housecallpro.com/en/articles/5434315-how-to-use-lead-sources), lead sources on customers, jobs and estimates
- [Housecall Pro: Marketing dashboard ROI table](https://help.housecallpro.com/en/articles/14890593-marketing-dashboard-roi-table), ROI per lead source, monthly spend and missing sources
- [Jobber: Lead Source Report](https://help.getjobber.com/en/articles/lead-source-report/), channels valued by the first invoice linked to the lead
- [Jobber: Referrals](https://help.getjobber.com/hc/en-us/articles/25316299579799-Referrals-Marketing-Tools), referral credits on payment, one per invoice
- [Workiz: Angi Leads integration](https://www.workiz.com/integrations/angi-leads/), marketing spend and lead source of booked jobs
- [WorkWave PestPac: Lead management data sheet (PDF)](https://documents.workwave.com/pestpac/resources/data-sheet/pestpac-lead-management.pdf), unique URLs and phone numbers per campaign, cost per lead and ROI
- [Angi: Lead credit requests](https://intercom.help/angi/en/articles/11403440), credit reasons, the 45-day and 24-hour conditions and credit expiry
- [Yelp for Business: Getting started with Yelp Ads](https://business.yelp.com/resources/articles/getting-started-with-yelp-ads/?domain=local-business), pay per click within a monthly maximum
- [CallRail: Dynamic number insertion](https://www.callrail.com/call-tracking/dynamic-number-insertion), source tracking per campaign and visitor tracking per website visitor
- [Invoca: Call tracking and analytics](https://www.invoca.com/platform/call-tracking-analytics), keyword-level attribution of phone conversions
