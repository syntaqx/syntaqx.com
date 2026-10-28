+++
title = "Messaging, Reviews & Reputation"
nav_title = "Messaging & Reviews"
description = "Messaging as the transaction record, off-platform leakage and contact detection, simultaneous-reveal reviews, the FTC reviews rule and host status programs."
category = "User-Generated Platforms Industry"
order = 1835
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "messaging", "reviews", "reputation", "off-platform"]
+++

Strangers transact on a marketplace because of two things it keeps: the conversation and the reputation. The conversation is how a guest asks whether the RV has a generator, how a host explains the propane valve, how both agree that the late return is fine; when something goes wrong it's the only record of what was promised. The reputation is the accumulated answer to "did this go well last time," written by people who were there, and it decides who gets booked next. Both are user-generated content with the problems of any: abuse, spam, fakes, coercion and moderation. Both also carry the marketplace's biggest commercial threat, because the easiest way for two people who trust each other to skip the platform's fee is to exchange phone numbers in a message.

This chapter covers in-platform messaging as the transaction's system of record, contact-detail and link detection, off-platform policies and their enforcement, scam warnings, two-sided reviews with simultaneous reveal, review integrity and the FTC's reviews rule, and host and seller status programs. It extends `bookings` and `listings` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Chat infrastructure in general (gateways, presence, storage at scale) is [Real-Time Chat](/books/user-generated-platforms/real-time-chat#the-gateway); the moderation machinery is the playbook's [Trust & Safety](/docs/security/trust-and-safety).

## How the Platforms Do It

| Platform | Messaging rules | Reviews | Status program |
| --- | --- | --- | --- |
| **Airbnb** | All pre-booking communication on Airbnb; messages reviewed, and those containing contact details or external links blocked; paying off-platform loses AirCover | Both sides have 14 days after checkout; published when both submit or the window closes; listing rating shown after three reviews; sub-ratings and private notes visible only to the host | Superhost: 4.8+ rating, 90% response within 24 hours, under 1% cancellations, 10 stays (or 3 totalling 100 nights), assessed quarterly over 12 months |
| **eBay** | Only checkout payment methods; direct contact details exchanged only after checkout | Feedback; automated removal of violating feedback; removal requests within 90 days; negative or neutral feedback doesn't affect seller performance standards | Seller performance standards |
| **Etsy** | Off-platform transactions prohibited | Buyer reviews | Not covered here |
| **Outdoorsy** | Messaging as a "digital paper trail"; never pay outside Outdoorsy; report fake-site links; off-platform payment loses terms, cancellation and insurance protection | Both sides have 14 days; overall stars, sub-ratings (host communication, cleanliness, mechanical performance, value, listing accuracy), recommend yes or no, photos; hosts respond once, no edits | Superhost: 90% of requests answered within 24 hours, 4.85+ with 3+ reviews, under 3% cancellations, 6+ departed bookings in 12 months, quarterly |
| **RVshare** | Off-platform payment requests breach the terms and should be reported | Not published | Not published |

The patterns:

- **Messages are evidence, so they stay on the platform.** Every rental marketplace frames messaging as the record that protects both sides, and ties protection to it: pay or agree off-platform and the guarantee doesn't apply.
- **Contact details are detected and blocked before delivery,** at least before a booking exists. eBay draws the line at checkout; Airbnb at booking.
- **Reviews are simultaneous and time-boxed.** Fourteen days, revealed together, so neither side can retaliate against what the other wrote.
- **Status is computed from behavior.** Response rate, rating, cancellations and volume, evaluated on a schedule, with the thresholds published.

## Messaging as the Transaction Record

A marketplace thread runs from the first inquiry about a listing, through the booking, the trip and the claim. It's the record of every promise that isn't in the listing: early pickup agreed, pets allowed this time, the awning stuck before the trip started. Outdoorsy calls it a digital paper trail; Airbnb ties pre-booking communication to its platform by policy.

That changes how messaging is built compared to social chat:

- **The thread belongs to a transaction,** keyed to a listing and, once it exists, a booking, with both parties fixed. A pre-booking inquiry becomes the booking's thread when the guest books, so the promise and the contract are in one place.
- **Messages are immutable.** Edits and deletions are hidden from view but kept: a message the sender deleted is still evidence of what the other party read ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Staff can read the thread when a case needs it,** under logged, reasoned access ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)), because claims, disputes and safety reports are decided on it.
- **Retention follows the transaction,** not the chat's retention policy: messages about a booking are kept with its transaction and tax records (Outdoorsy archives message histories after account deletion) and are held while a claim or dispute is open ([Deletion, Claims and Legal Holds](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds)).
- **Delivery matters to deadlines.** A host's 24-hour response window and a claim's response deadline both start from delivery, so the thread records sent, delivered and read times, and notifications go out by email and push when the app isn't open ([Notifications & Consent](/docs/architecture/notifications)).

Automated messages (booking confirmations, check-in instructions, the claim notice, the review reminder) live in the same thread as system messages, so the record shows what the platform told each side and when.

## Off-Platform Leakage

Leakage is a guest and host who meet on the platform and transact without it. It costs the take rate, and it costs the guest every protection the platform sells. Airbnb's Off-Platform and Fee Transparency Policy is the most complete published rule set: all pre-booking communication on Airbnb, no off-platform payments, discounts, rebooking or collection of mandatory fees, and enforcement ranging from education to account removal. eBay allows only checkout payment methods and bans exchanging direct contact details before checkout; Etsy prohibits off-platform transactions; RVshare and Outdoorsy tell users that off-platform payment requests breach their terms and lose protection.

Policy is enforced in three places:

- **In the message.** Airbnb blocks messages containing contact details or external links. Detection covers phone numbers and emails written plainly and obfuscated ("five five five, oh one..."), links and handles for other services, and the same content inside images (a photo of a business card), which needs text recognition on attachments.
- **In the listing.** Contact details in titles, descriptions and photos are a listing content policy violation ([Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking)).
- **In the pattern.** A conversation that ends abruptly after a detected attempt, a host whose inquiries convert far less than their views would predict, a guest who books one night and then messages about a "longer stay directly": signals for review, not automatic penalties.

What to do on detection is a policy choice with a cost on each side: block the message and tell the sender why, deliver it with the details masked, or deliver it and flag it for review. Blocking before a booking and masking after is a common middle, because after booking the parties legitimately need to coordinate a pickup. My rule: **tell the sender, every time,** with the policy and the reason; a silently dropped message breaks the trust messaging exists to build, and silent masking makes the conversation evidence less clear.

Leakage enforcement is a ladder like any other ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)): a warning and education first, then messaging restrictions on the role that abused it, then removal for repeat or payment-diversion cases, each with a notice.

### Scam Warnings and Reporting

The same detection protects users from fraud. Off-platform payment requests and links to fake checkout sites are the common marketplace scams ([Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud)); Outdoorsy asks users to report fake-site links. Messaging is where warnings land at the right moment: an interstitial when a message contains a payment request or a link, a banner reminding the recipient that payment outside the platform loses protection, and a report button on every message that opens a case with the message attached ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)). For high-volume sellers, the INFORM Consumers Act requires a suspicious-activity reporting channel on listings anyway ([Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding)).

## Reviews

Marketplace reviews are two-sided: guests review hosts and listings, hosts review guests. That makes them different from product reviews, where only the buyer speaks, in two ways. Each side can hurt the other, so timing and visibility rules exist to stop retaliation; and each side depends on the other's goodwill, so coercion ("five stars and I'll return your deposit") is a real risk.

### Windows and Simultaneous Reveal

Airbnb and Outdoorsy publish the same core rule: each side has 14 days after the trip, and Airbnb publishes reviews when both have submitted or when the window closes, whichever comes first, so neither can read the other's review before writing their own. Airbnb doesn't allow reviews on reservations cancelled before check-in.

The mechanics:

- **The window opens on completion** (the return handoff or checkout) and its close is a stored deadline.
- **A submitted review is sealed** until the other side submits or the window closes; the author may edit it until then, or never (Outdoorsy allows no edits).
- **Publication is a job,** not a read-time check, so both reviews appear at once and notifications go out together.
- **Late is never.** After the window closes, no review can be written for that booking; this is what makes the reveal meaningful.

### What a Review Holds

Published review structures share a shape: an overall star rating, sub-ratings for the dimensions that matter in the category (Outdoorsy's host communication, cleanliness, mechanical performance, value and listing accuracy; Airbnb's sub-ratings), a recommend-or-not, text, photos, and a private note for the host only. Sub-ratings and private notes visible only to the host (Airbnb) are feedback, not reputation.

Display rules matter as much as collection: Airbnb shows a listing's rating only after three reviews, and Outdoorsy's status program requires at least three reviews before the rating counts, because one review is an anecdote. A host may respond once, publicly (Outdoorsy), which gives them a voice without turning the review into a thread.

### Goods Marketplaces

Goods marketplaces run reputation on the seller and lean on the platform's own metrics. eBay's Feedback is the oldest system in the industry; its current policy has eBay remove feedback used to extort another member (a buyer demanding a free upgrade for positive feedback, for example), remove personal attacks, personal information and feedback about a different item, remove negative or neutral feedback in some cases (when the buyer asked to cancel after committing to buy, or the issue was disclosed in the listing), and states that negative or neutral feedback doesn't affect seller performance standards, which are computed from transaction defects instead. Removal requests must come within 90 days of the transaction, and eBay removes violating feedback automatically where it can.

The lesson generalizes: **separate what users say from what the platform measures.** Reviews carry opinion and are open to abuse; defect rates (cancellations, late shipment, not-as-described cases) are facts the platform already holds. Status and ranking should lean on the measured facts and use ratings as one input.

## Review Integrity

Reviews attract every kind of manipulation: hosts reviewing themselves from second accounts, paid review rings, competitors leaving negative reviews, coerced reviews tied to deposits or refunds, retaliation, and businesses burying bad reviews. Airbnb's review policy bans reviews that are irrelevant, fake, coerced, competitive or retaliatory; a disagreement with the star rating alone is not grounds for removal, and authors may remove their own review within 30 days.

### The FTC Consumer Reviews and Testimonials Rule

The FTC's rule (16 CFR Part 465), effective October 21, 2024, prohibits, among other things:

- **Fake or false reviews and testimonials** (writing, selling or buying them, including brokering).
- **Buying reviews conditioned on sentiment:** incentives for reviews that must be positive or negative. Incentives for reviews as such aren't banned.
- **Undisclosed insider reviews** from employees, executives and others with a material relationship.
- **Company-controlled review sites** presented as independent.
- **Review suppression** through false accusations, intimidation or unfounded legal threats.
- **Fake social media indicators** such as bot followers, where the business knew or should have known.

For a marketplace two parts matter most. The rule has a hosting exception: a business that merely hosts consumer reviews isn't liable for them unless it wrote them or bought reviews it knew or should have known were fake, and the exception doesn't require screening; but reviews the platform features in its marketing become testimonials and lose it. And the rule reaches the platform's users who are businesses: a host or seller who pays for positive reviews, conditions a refund on a good one, or threatens a reviewer is a violator, and the platform's own records (messages, reviews, refunds) are where it shows. Courts may impose civil penalties for knowing violations; the rule creates no private right of action.

The system consequences:

- **Coercion is detectable in messages.** A message tying a deposit, refund or discount to a review's content is both a policy violation and potentially a rule violation by the host; detection runs on the thread like contact detection.
- **Removal needs a policy and a record.** Every removed review records the policy clause, who decided (a model, an agent), the evidence and the appeal; a review removed because a host complained without a policy reason is suppression ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons)).
- **Only transacting accounts review.** A review exists only for a completed booking or purchase, by its two parties, once each; that alone removes most fake-review vectors, leaving linked accounts (a host booking their own listing from a second account), which [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud) detects.
- **Incentives are disclosed or absent.** If the platform rewards reviewing (credits, status), the reward can't depend on the sentiment.
- **Status programs watch removals.** Airbnb may withhold Superhost status for a high rate of review removals, which closes the loop on hosts who report every bad review.

## Status Programs

Status programs reward hosts and sellers whose behavior the platform wants more of, with a badge, better ranking and perks. The published criteria cover the same four things:

| Criterion | Airbnb | Outdoorsy |
| --- | --- | --- |
| **Responsiveness** | Respond to 90% of new messages and accept or decline requests within 24 hours | 90% of requests approved or declined within 24 hours |
| **Rating** | 4.8 or higher overall | 4.85 or higher with at least 3 reviews |
| **Reliability** | Cancellation rate under 1%, excluding major disruptive events and other valid reasons | Host cancellation rate under 3% |
| **Volume** | 10 reservations, or 3 totalling at least 100 nights | 6 or more departed bookings in 12 months |
| **Assessment** | Quarterly, looking back 12 months; awarded only four times a year | Quarterly |

Airbnb's program is open only to the owner of a home listing in good standing (not co-hosts), counts a review in a period once both sides have reviewed or the window has closed, and may suspend or withhold status for high review-removal or host-cancellation rates. eBay and Etsy run equivalent programs for sellers, computed from defect rates and shipping.

My rules for status programs:

- **Compute from facts on a schedule,** with the metrics snapshotted for each period, so a host who lost status can see exactly which number fell short and in which window.
- **Status is derived, like standing.** It's a period's evaluation, not a flag hosts keep; the badge is a query over the current period ([Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing) uses the same rule).
- **Exclusions are rules.** Cancellations for major disruptive events, reviews removed for policy and guest-caused issues are excluded by stated rules, versioned with the program.
- **Ranking may use status; it shouldn't double count it.** If status already summarizes response, rating and cancellations, a ranker that uses both status and the raw metrics weighs them twice ([Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking)).

## How to Build It

```sql
CREATE TABLE marketplace_threads (       -- one conversation per listing, guest and host
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id       UUID NOT NULL REFERENCES listings (content_item_id),
  booking_id       UUID REFERENCES bookings (id),   -- set when the inquiry books
  guest_account_id UUID NOT NULL REFERENCES accounts (id),
  host_account_id  UUID NOT NULL REFERENCES accounts (id),
  state            TEXT NOT NULL CHECK (state IN ('inquiry', 'booked', 'archived', 'locked')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id)
);

CREATE TABLE marketplace_messages (      -- immutable; edits and deletions hide, never erase
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  thread_id        UUID NOT NULL REFERENCES marketplace_threads (id),
  sender_kind      TEXT NOT NULL CHECK (sender_kind IN ('guest', 'host', 'co_host',
                     'platform', 'support')),
  sender_account_id UUID REFERENCES accounts (id),  -- null for platform messages
  body             TEXT,                 -- as written
  delivered_body   TEXT,                 -- as delivered, if masked
  template_code    TEXT,                 -- system messages
  status           TEXT NOT NULL CHECK (status IN ('sent', 'blocked', 'masked',
                     'held_for_review', 'hidden_by_sender', 'removed')),
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at     TIMESTAMPTZ,
  read_at          TIMESTAMPTZ
);

CREATE TABLE message_attachments (
  message_id     UUID NOT NULL REFERENCES marketplace_messages (id),
  position       SMALLINT NOT NULL,
  media_asset_id UUID NOT NULL REFERENCES media_assets (id),
  PRIMARY KEY (message_id, position)
);

CREATE TABLE message_detections (        -- what the detectors found, and what was done
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  message_id    UUID NOT NULL REFERENCES marketplace_messages (id),
  detector      TEXT NOT NULL,           -- 'contact_detail', 'external_link', 'payment_request',
                                         -- 'review_coercion', 'ocr_contact'
  detector_version TEXT NOT NULL,
  matched       TEXT,                    -- the span or category, not more than needed
  action        TEXT NOT NULL CHECK (action IN ('blocked', 'masked', 'warned', 'flagged',
                  'none')),
  case_id       UUID REFERENCES moderation_cases (id),
  detected_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings
  ADD COLUMN review_window_closes_at TIMESTAMPTZ;  -- set at completion

CREATE TABLE reviews (                   -- one per side per booking, sealed until reveal
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id       UUID NOT NULL REFERENCES bookings (id),
  author_account_id UUID NOT NULL REFERENCES accounts (id),
  author_role      TEXT NOT NULL CHECK (author_role IN ('guest', 'host', 'buyer', 'seller')),
  subject_account_id UUID NOT NULL REFERENCES accounts (id),
  listing_id       UUID REFERENCES listings (content_item_id),  -- guest reviews of a listing
  overall          SMALLINT NOT NULL CHECK (overall BETWEEN 1 AND 5),
  sub_ratings      JSONB NOT NULL DEFAULT '{}',  -- {"cleanliness": 5, "listing_accuracy": 4}
  recommends       BOOLEAN,
  body             TEXT,
  private_note     TEXT,                 -- to the subject only, never public
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at     TIMESTAMPTZ,          -- set by the reveal job
  state            TEXT NOT NULL CHECK (state IN ('sealed', 'published', 'removed',
                     'withdrawn')),
  UNIQUE (booking_id, author_role)
);

CREATE TABLE review_responses (          -- one public response per review
  review_id         UUID PRIMARY KEY REFERENCES reviews (id),
  author_account_id UUID NOT NULL REFERENCES accounts (id),
  body              TEXT NOT NULL,
  published_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE review_removals (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  review_id      UUID NOT NULL REFERENCES reviews (id),
  requested_by   TEXT NOT NULL CHECK (requested_by IN ('author', 'subject', 'platform',
                   'legal')),
  policy_clause  TEXT NOT NULL,          -- 'fake', 'coerced', 'competitive', 'retaliatory',
                                         -- 'irrelevant', 'personal_info', 'extortion'
  decision_id    UUID REFERENCES moderation_decisions (id),
  decided_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE status_programs (           -- the rules, versioned
  code          TEXT NOT NULL,           -- 'host_status', 'seller_status'
  version       INT NOT NULL,
  criteria      JSONB NOT NULL,          -- thresholds, lookback, exclusions
  valid_during  TSTZRANGE NOT NULL,
  PRIMARY KEY (code, version)
);

CREATE TABLE host_status_periods (       -- each evaluation, with the numbers behind it
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  program_code    TEXT NOT NULL,
  program_version INT NOT NULL,
  evaluated_at    TIMESTAMPTZ NOT NULL,
  lookback        TSTZRANGE NOT NULL,
  metrics         JSONB NOT NULL,        -- response rate, rating, cancellations, volume
  awarded         BOOLEAN NOT NULL,
  shortfalls      TEXT[] NOT NULL DEFAULT '{}',
  valid_during    TSTZRANGE NOT NULL,    -- until the next evaluation
  FOREIGN KEY (program_code, program_version) REFERENCES status_programs (code, version),
  UNIQUE (account_id, program_code, evaluated_at)
);
```

Design decisions behind it:

- **Threads belong to transactions,** not to people: `marketplace_threads` ties guest, host, listing and booking, and becomes the booking's record when the inquiry books. The table names avoid the general messaging tables of [Real-Time Chat](/books/user-generated-platforms/real-time-chat#how-to-build-it) because the retention, access and evidence rules differ.
- **Messages keep what was written and what was delivered.** Blocked and masked messages keep the original for review and evidence; the recipient's view is `delivered_body`. Edits and deletions change `status`, never the row.
- **Detections are records with versions,** linked to a case when they open one, so a host who asks why a message was blocked gets the detector and the reason, and the detectors can be measured.
- **Reviews are one per side, sealed, then revealed by a job.** The unique constraint stops duplicates; `review_window_closes_at` and the reveal job implement simultaneous reveal; a review exists only for a booking, which keeps non-transacting accounts out.
- **Removals cite a policy and a decision.** `review_removals` points at a moderation decision with its notice and appeal, so removals can be counted, audited and defended under the FTC rule's suppression clause.
- **Status is an evaluation per period** against a versioned program, with the metrics and shortfalls stored, so badges are queries and disputes have numbers.
- **Events:** `thread.created`, `message.sent`, `message.blocked`, `review.submitted`, `review.published`, `review.removed` and `host_status.evaluated` feed notifications, ranking, quality scores and moderation.

## Auditing

- **Every thread as the parties saw it,** including blocked and masked messages, deliveries and reads, and every staff access with its reason.
- **Detections and enforcement:** each detection, its action and any case or penalty, to show leakage enforcement is consistent and to answer users who contest it.
- **Reviews and their timing:** submission, reveal and publication times, so simultaneous reveal can be shown to have held.
- **Removals:** each with policy clause, decider, notice and appeal; removal rates by requester, because suppression is a regulatory risk.
- **Status evaluations:** every period's metrics, thresholds and outcome per host.

## What This Means for the System You Build

- **Tie every thread to a listing and, once booked, a booking,** and keep messages immutable with delivery and read times.
- **Retain booking messages with the transaction** and hold them while claims and disputes are open.
- **Detect contact details, links and payment requests,** including in images, and tell the sender what was blocked or masked and why.
- **Enforce off-platform policy on a ladder** scoped to the role, and put scam warnings and a report button on every message.
- **Run reviews in a fixed window with simultaneous reveal,** one per side per completed booking, published by a job.
- **Separate opinion from measured defects,** and lean on the facts for status and ranking.
- **Remove reviews only under a stated policy** with a decision, notice and appeal; watch for coercion in messages; never condition incentives on sentiment.
- **Evaluate status programs on a schedule** against versioned criteria, storing the metrics and shortfalls.

## References

**Law and regulation**

- [FTC: Consumer Reviews and Testimonials Rule, questions and answers](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers), the October 21, 2024 effective date, the prohibited practices, the hosting exception and its limits, civil penalties, no private right of action
- [15 U.S.C. 45f: INFORM Consumers Act](https://www.law.cornell.edu/uscode/text/15/45f), the suspicious-activity reporting channel on high-volume sellers' listings

**Platform documentation**

- [Airbnb: Off-Platform and Fee Transparency Policy](https://www.airbnb.com/help/article/2799), pre-booking communication on Airbnb, no off-platform payments or fees, enforcement range
- [Airbnb: Paying and communicating through Airbnb](https://www.airbnb.com/help/article/209), message review, blocking contact details and links, losing AirCover off-platform
- [Airbnb: How reviews work](https://www.airbnb.com/help/article/13), the 14-day window, simultaneous publication, three-review threshold, sub-ratings and private notes, no reviews on pre-check-in cancellations
- [Airbnb: Reviews Policy](https://www.airbnb.com/help/article/2673), prohibited reviews, star-rating disagreement, author removal within 30 days
- [Airbnb: How to become a Superhost](https://www.airbnb.com/help/article/829), criteria, eligibility, assessment periods and withholding for removals and cancellations
- [Outdoorsy: Why should I pay and communicate through Outdoorsy](https://support.outdoorsy.com/hc/en-us/articles/37462880150683-Why-should-I-pay-and-communicate-through-Outdoorsy-directly), off-platform payment, fake-site links, lost protection
- [Outdoorsy: How to communicate on Outdoorsy](https://support.outdoorsy.com/hc/en-us/articles/49203796129307-How-to-Communicate-on-Outdoorsy), messaging as a digital paper trail
- [Outdoorsy: How do I leave a review as a guest](https://support.outdoorsy.com/hc/en-us/articles/49326452845339-How-do-I-leave-a-Review-as-a-Guest), overall and sub-ratings, recommend, photos
- [Outdoorsy: How do I review a guest and respond to reviews](https://support.outdoorsy.com/hc/en-us/articles/37430481515931-How-do-I-review-a-Guest-and-respond-to-Guest-reviews), 14 days for both sides, one response, no edits
- [Outdoorsy: Superhost program FAQs](https://support.outdoorsy.com/hc/en-us/articles/37419024607899-Outdoorsy-s-Superhost-Program-FAQs), criteria and quarterly evaluation
- [Outdoorsy: How do I delete my Outdoorsy account](https://support.outdoorsy.com/hc/en-us/articles/57132723095195-How-do-I-delete-my-Outdoorsy-account), message histories archived after deletion
- [RVshare: Renter FAQ](https://rvshare.com/blog/?p=168613), off-platform payment requests breach the terms
- [eBay: Offers to buy or sell outside of eBay policy](https://www.ebay.com/help/policies/member-behavior-policies/offers-buy-sell-outside-ebay-policy?id=4269), checkout payment methods only, contact details after checkout, enforcement actions
- [eBay: Feedback policies](https://www.ebay.com/help/policies/feedback-policies/feedback-policies?id=4208), extortion, automated removal, removable content, the 90-day request window, feedback and seller performance
- [Etsy: Fees & Payments Policy](https://www.etsy.com/legal/fees/), off-platform transactions prohibited
