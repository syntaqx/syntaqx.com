+++
title = "Reviews & Reputation"
description = "Practice reviews: asking every patient, gating and private feedback, the FTC review rule, replies without PHI, gag clauses, listings and directories."
category = "Health Tech Industry"
order = 1935
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "reviews", "reputation", "hipaa", "ftc", "listings", "data-model"]
+++

A new patient choosing a dentist, an optometrist or a vet usually starts with a map search, and the practices with more and better reviews get the call. So review requests are a standard feature of patient engagement platforms, and the review count and star rating on a practice's Google listing are numbers office managers watch weekly. Health care makes reviews harder than in other local businesses in two ways. Asking is governed by the same rules as any business (the FTC's rule on consumer reviews, Google's and Yelp's policies), with health care's extra caution about texting patients. And answering is constrained by HIPAA in a way no restaurant faces: a practice that replies to a one-star review with "as we discussed at your appointment, you declined the treatment we recommended" has just disclosed that the reviewer is its patient and something about their care, and the Office for Civil Rights has fined practices for exactly that.

This chapter covers reviews for practices: how the platforms do it, asking for reviews, gating and private feedback, the FTC rule as it applies to a practice, replying without disclosing, gag clauses and the Consumer Review Fairness Act, and listings and health directories. It extends `communications` and `locations` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The FTC rule in full, review moderation, suppression and syndication are the Commerce volume's [Reviews & Ratings](/books/commerce/reviews-and-ratings); review requests in field service are the Field Operations volume's [Reviews and Surveys](/books/field-operations/customer-communications#reviews-and-surveys); the texting rules review requests travel under are [Two-Way Texting & Messaging](/books/health-tech/patient-texting).

## How the Platforms Do It

As of October 2026, from public product pages:

| Vendor | How it asks | Where reviews go | Notable mechanics |
| --- | --- | --- | --- |
| **Weave Reviews** | Automated invite by text a chosen number of hours after the appointment; manual link sent while the patient is in the office or on the phone, overriding a pending automatic one | Google, Facebook and Healthgrades, in a configurable order | A "Private Review" option lets patients send feedback by form or email directly to the business, so it can "address their complaints offline and have a chance to make things right" |
| **Podium** | "Textable review invites" automated by its AI Employee | Consolidates review sites including Google and Facebook | An "AI Reputation Specialist" that "intelligently crafts review invites and replies" |
| **Birdeye** | Email or SMS requests timed from engagement history or service context, with automatic reminders and variant testing | Routed across locations, providers and review sites | A review generation agent |
| **Solutionreach** | "Reputation Management" | Not detailed publicly | Bundled with reminders and texting |
| **Yapi** | Online reviews as a feature | Not detailed publicly | Practice marketing through DoctorLogic |

Every vendor sends the request by text shortly after the visit, because that's when patients are most likely to respond, and most offer a private feedback path. The two places they differ are how that private path interacts with the public one, and how much of the reply they let a model write. Both are where health care's rules bite.

## Asking for Reviews

The request is a message with its own purpose. It isn't an appointment message: it falls outside the TCPA health care exemption's listed purposes ([The TCPA Healthcare Exemption](/books/health-tech/patient-texting#the-tcpa-healthcare-exemption)), it promotes the practice on a public site, and the core model gives it its own `communications.purpose` of `review_request`. My rules:

- **Send under consent, not the exemption.** A review request goes to patients whose texting consent covers it, from a template marked as a review request, never appended to a reminder or a receipt.
- **Ask everyone eligible, the same way.** Eligibility is about the visit (a completed appointment, not a no-show, not a patient with an open complaint or a balance dispute), never about how the patient is expected to rate it. The FTC rule's ban on incentives conditioned on sentiment and Google's ban on selective solicitation (below) both turn on this.
- **Cap frequency.** A recall patient seen twice a year can be asked once a year; a physical therapy patient on a twelve-visit plan of care shouldn't be asked after every session. The Field Operations volume's cap of one request per customer per period carries over ([Reviews and Surveys](/books/field-operations/customer-communications#reviews-and-surveys)).
- **No pressure in the office.** Google's policy says merchants should not "require or pressure users to leave ratings or write reviews while on the premises," which rules out the tablet at checkout that won't let the patient leave until they've rated the visit. A link sent while the patient is still there is fine; standing over them isn't.
- **Respect sensitive practices.** A review request from a psychiatric, addiction or fertility practice is itself a reminder that the patient was there; some patients will want none, and a neutral sender name helps ([Minimum Necessary in a Text](/books/health-tech/patient-texting#minimum-necessary-in-a-text)).
- **Yelp is different.** Yelp asks businesses not to solicit reviews at all (not from customers, mailing lists or friends, and not after surveys), may label solicited reviews "not recommended," and can post a Consumer Alert on a business's page. A review request flow should leave Yelp out of the site list.

## Gating and Private Feedback

**Review gating** is asking patients first how they'd rate the visit, then sending only happy ones to a public review site and routing unhappy ones to a private form. It is the most common reputation tactic and the riskiest:

- **Google prohibits it.** Its policy for merchants says they may not "discourage or prohibit negative reviews, or selectively solicit positive reviews from customers." A flow that sends the Google link only to patients who rated 4 or 5 stars is selective solicitation.
- **The FTC rule reaches the practice's own site.** 16 CFR 465.7(b) prohibits misrepresenting that the reviews a business displays are all or most of the reviews submitted when some are suppressed by rating or sentiment; a "testimonials" page fed only by the happy branch of a gate is that misrepresentation, unless the page says how it's selected.
- **Incentives can't depend on sentiment.** 465.4 prohibits compensation or incentives "conditioned expressly or by implication on, the writing or creation of consumer reviews expressing a particular sentiment," and Google prohibits incentives for reviews at all.

A **private feedback channel** is not gating when it's offered to everyone alongside the public link, rather than instead of it. Weave's Private Review option lets patients send feedback directly so the practice can "address their complaints offline"; built so every patient sees both choices, it's a complaint channel; built so only unhappy patients see the private form, it's gating. My rule: every patient who gets a request gets the public link, the private option is beside it, and no answer to a rating question changes which links appear.

The commercial temptation is real, because a practice's rating moves visibly when gated, and the vendor's product looks better. The design that survives a policy review is still to ask everyone and make the private channel a way to reach the practice, not a filter.

## The FTC Rule in a Practice

The rule itself (16 CFR part 465, effective October 21, 2024) is summarized in the Commerce volume's [Fake Reviews and the FTC Rule](/books/commerce/reviews-and-ratings#fake-reviews-and-the-ftc-rule); civil penalties for knowing violations reach $53,088 per violation, the level the FTC cited in its December 22, 2025 warning letters to ten companies. What it means for a practice:

| Section | What it prohibits | The practice version |
| --- | --- | --- |
| **465.2** | Fake or false reviews and testimonials, including AI-generated | A practice writing reviews for itself, or a marketing agency "seeding" its listing |
| **465.4** | Buying reviews: incentives conditioned on sentiment | "Leave us a five-star review for a free whitening"; any incentive offered only to happy patients |
| **465.5** | Undisclosed insider reviews; managers soliciting reviews from staff and family without disclosure | Hygienists, the office manager's relatives and the dentist's friends reviewing the practice without saying so |
| **465.6** | Company-controlled review sites presented as independent | A "best dentists in town" site the practice or its marketing vendor runs |
| **465.7** | Suppression through legal threats, intimidation or false accusations; misrepresenting displayed reviews as all or most | Threatening a patient with a lawsuit to take down a review; a curated testimonials page presented as complete |

Two health care notes. The rule's neutral criteria for withholding reviews from a business's own site include reviews that contain "the personal information or likeness of another individual" (465.7(b)(1)(iii)), which gives a practice hosting reviews a lawful reason to withhold a review in which a patient names another patient. And patient testimonials on a practice's own site raise HIPAA as well: using a patient's name, photo or story to promote the practice is a use of PHI outside treatment, payment and operations, which takes the patient's written authorization ([Signatures and Consent](/books/health-tech/digital-intake-and-forms#signatures-and-consent)).

## Replying Without Disclosing

A review is the patient's own disclosure; a reply is the practice's. HIPAA lets a patient say whatever they like about their care and doesn't let the practice confirm or add to it, and OCR has enforced that against practices replying to reviews:

| Practice | What happened | Outcome |
| --- | --- | --- |
| **Elite Dental Associates** (Dallas, Texas) | Disclosed patients' PHI in replies on its Yelp page | $10,000 settlement and a corrective action plan (announced October 2, 2019) |
| **Dr. U. Phillip Igbinadolor, D.M.D. & Associates** (North Carolina) | Posted a patient's PHI on a webpage in response to a negative online review; didn't respond to OCR's data request or subpoena | $50,000 civil money penalty |
| **New Vision Dental** (California) | Disclosed PHI in responses to online reviews | $23,000 settlement and a corrective action plan |
| **Manasa Health Center** (New Jersey psychiatric practice) | Disclosed a patient's PHI in reply to a negative review (complaint April 2020); OCR also found missing Privacy Rule policies | $30,000 settlement and a corrective action plan |

Three of the four are dental practices and the fourth a psychiatric practice. The rule a reply has to follow:

- **Don't confirm the reviewer is a patient.** "We're sorry you had a bad experience at your appointment" confirms it. "We take every concern seriously; please call our office manager at (555) 123-4567" doesn't.
- **Never mention care, scheduling, billing or anything from the record,** even to correct a false statement. The patient's version stands; the practice's remedy is a private conversation.
- **Same rules for positive reviews.** "Thanks, Maria, glad your implant healed well!" is a disclosure too.
- **Take it offline,** to a phone call or a secure message initiated by the patient.

**AI-drafted replies** make this worse, not better. A model with access to the practice's records will helpfully mention the appointment; a model without access will still echo the patient's own details back ("sorry your crown came loose"), which reads as confirmation. Podium's AI Reputation Specialist "intelligently crafts" replies; any such tool in a practice should draft from a short set of approved, non-confirming templates, run a check for names, dates, procedures and care words before posting, and require a person to approve every reply. The review reply is a disclosure decision, and a covered entity has to be able to say who made it.

## Gag Clauses and the Consumer Review Fairness Act

Some practices once put clauses in new-patient paperwork prohibiting negative reviews or assigning the patient's copyright in any review to the practice so it could demand takedowns. The Consumer Review Fairness Act (15 USC 45b, enacted December 14, 2016) voids form-contract provisions that restrict a consumer's reviews, impose penalties or fees for them, or require transferring intellectual property in review content (a non-exclusive license is allowed), and makes offering such a contract unlawful, enforceable by the FTC and state attorneys general. The act keeps the business's ability to bar or remove content that discloses "personnel and medical files" and similar private information, trade secrets and unlawful content. For a forms product: no template in the intake packet should contain a review restriction, and a template library is where one would hide ([The Intake Packet](/books/health-tech/digital-intake-and-forms#the-intake-packet)). State dental and medical boards also have rules on testimonials and advertising, which vary by state and which I haven't surveyed here. <!-- source-gap: state-board-testimonial-rules | missing | state dental, medical and veterinary board rules on patient testimonials and reviews in advertising | closes with: a survey of state board advertising rules or the boards' own regulations | checked: 2026-10-30 -->

## Listings and Health Directories

A practice's reputation lives on listings it partly controls:

- **Google Business Profile,** one per location, and in health care often one per practitioner too, so a group's ratings split across practice and provider profiles. The listing carries hours, phone numbers and booking links ([Directories and Marketplaces](/books/health-tech/scheduling-and-online-booking#directories-and-marketplaces)), and inconsistent hours or numbers across listings send patients to a closed office or a dead line.
- **Health directories** (Healthgrades, Vitals, WebMD, Zocdoc's own reviews, RateMDs) list practitioners and practices and collect reviews of their own; Weave includes Healthgrades among the sites it sends patients to. Their published rules, as of October 2026, differ in ways a reputation product has to respect. Healthgrades lets a patient review "a practice you or a family member has had contact with," confirms each submission by an automated email or text before processing it, says a review "must pass all verification steps" before it's published, lets live reviews be flagged for another look, allows anonymous reviews, and says "Doctors can NOT pay for good reviews, nor pay to remove negative ones." Vitals requires the reviewer's "own experience with the provider" and bars any information about the reviewer's "symptoms, any medical diagnosis or any prescriptions," removing reviews that break its rules. WebMD Care says its reviews "are provided by users," that "Providers are not able to remove or modify reviews on their own," and that removal happens "only after an internal review by our customer service team." The practice's levers are the platform's flag or complaint route and a reply; the product should link to each one rather than promise removal. Zocdoc's and RateMDs' review policies weren't readable for this chapter. <!-- source-gap: health-directory-review-collection | missing | how Zocdoc and RateMDs collect, verify and moderate reviews | closes with: each directory's own review policy pages (zocdoc.com returned 403 to fetching; ratemds.com redirects fetchers to a paywall) | checked: 2026-10-30 -->
- **Payer directories** list in-network providers, with accuracy duties on the payer, covered in this volume's [Credentialing, Enrollment & Provider Data](/books/health-tech/credentialing-and-enrollment#provider-directories) chapter.
- **Social pages** (Facebook) carry reviews and recommendations too.

The engineering problem is keeping one set of facts (name, address, phone, hours, practitioners, booking link) consistent across all of them, and noticing when a directory's copy drifts. The listing data belongs to locations and practitioner roles in the core model; the listing profile records each external listing, its ID, its last sync and what it currently says.

## How to Build It

Review requests are `communications` with `purpose = 'review_request'`; the chapter adds the request record, the reviews themselves, replies with their approval and the external listings:

```sql
CREATE TABLE listing_profiles (                  -- one external listing
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  location_id         UUID REFERENCES locations (id),
  practitioner_role_id UUID REFERENCES practitioner_roles (id),  -- provider listings
  site                TEXT NOT NULL,             -- 'google', 'facebook', 'healthgrades', 'yelp', 'zocdoc'
  external_id         TEXT NOT NULL,
  claimed             BOOLEAN NOT NULL DEFAULT FALSE,
  solicit_reviews     BOOLEAN NOT NULL,          -- false for sites that forbid asking (Yelp)
  listed_facts        JSONB,                     -- name, address, phone, hours as the site shows them
  facts_checked_at    TIMESTAMPTZ,
  UNIQUE (site, external_id),
  CHECK (location_id IS NOT NULL OR practitioner_role_id IS NOT NULL)
);

CREATE TABLE review_requests (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  patient_id          UUID NOT NULL REFERENCES patients (id),
  appointment_id      UUID REFERENCES appointments (id),
  communication_id    UUID REFERENCES communications (id),  -- the text or email sent
  trigger             TEXT NOT NULL CHECK (trigger IN ('automatic', 'manual')),
  eligibility_rule_version INT NOT NULL,         -- visit-based rules only; never sentiment
  sites_offered       UUID[] NOT NULL,           -- listing_profiles, identical for every patient
  private_option_offered BOOLEAN NOT NULL,
  rating_asked_first  BOOLEAN NOT NULL DEFAULT FALSE,  -- if true, links must not depend on the answer
  clicked_listing_id  UUID REFERENCES listing_profiles (id),
  private_feedback_communication_id UUID REFERENCES communications (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (                           -- reviews as they appear on external sites
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  listing_profile_id  UUID NOT NULL REFERENCES listing_profiles (id),
  external_review_id  TEXT NOT NULL,
  rating              SMALLINT,
  body                TEXT,
  reviewer_display_name TEXT,
  posted_at           TIMESTAMPTZ NOT NULL,
  removed_at_source   TIMESTAMPTZ,
  internal_patient_id UUID REFERENCES patients (id),  -- staff-only link; never shown or used in replies
  UNIQUE (listing_profile_id, external_review_id)
);

CREATE TABLE review_replies (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  review_id           UUID NOT NULL REFERENCES reviews (id),
  body                TEXT NOT NULL,
  drafted_by          TEXT NOT NULL CHECK (drafted_by IN ('staff', 'template', 'model')),
  template_id         UUID,                      -- an approved non-confirming reply template
  phi_check           JSONB NOT NULL,            -- what the check looked for and found
  status              TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'posted', 'rejected',
                        'withdrawn')),
  approved_by         UUID,
  posted_at           TIMESTAMPTZ,
  CHECK (status NOT IN ('approved', 'posted') OR approved_by IS NOT NULL)
);
```

Notes on the sketch:

- **The request records what was offered,** to whom and under which eligibility rule, so the practice can show that every patient got the same sites and that no link depended on a rating answer. `rating_asked_first` exists so a flow that asks first can be audited for exactly that.
- **Eligibility is visit-based.** Rules look at the appointment (completed, not disputed, not too recent a request), versioned, never at a predicted or asked sentiment.
- **The patient link on a review is internal.** Staff may want to know who wrote a review to follow up privately; `internal_patient_id` is PHI kept inside the practice's system, never fed to a reply drafter and never shown in any public surface.
- **Replies need a named approver.** Every posted reply has `approved_by`, and the PHI check (names, dates, procedures, conditions, appointment and billing words, anything from the patient's record) runs before approval; a model may draft, but only a person posts.
- **Listings are facts to reconcile.** `listed_facts` against the location's own record shows drift, and `solicit_reviews` keeps request flows away from sites that forbid asking.
- **Events:** `review_request.sent`, `review.received`, `review.low_rating`, `review_reply.approved` and `listing.drift_detected` feed the inbox, the office manager's queue and analytics.

## Auditing

- **Every review request, with the sites and options offered** and the eligibility rule version, to answer a gating complaint, a Google policy question or an FTC inquiry.
- **Every reply as drafted and as posted,** who drafted it, what the PHI check found and who approved it. An OCR complaint about a reply is answered from this record.
- **Private feedback received and how it was handled,** since a complaint channel the practice ignores is a complaint channel in name only.
- **Incentives offered for reviews,** if any, with the terms showing they didn't depend on sentiment.
- **Testimonials used in marketing,** each with the authorization that permits it.

## What This Means for the System You Build

- **Treat a review request as its own purpose,** sent under consent, never under the TCPA health care exemption or inside a reminder.
- **Ask every eligible patient the same way,** with eligibility defined by the visit and requests capped per period.
- **Offer the public link to everyone** and the private feedback option beside it; never let a rating answer decide which links appear.
- **Leave Yelp out of request flows** and keep incentives, if any, independent of sentiment.
- **Make replies non-confirming by construction:** approved templates, a PHI check, and a named person approving every reply, including the positive ones.
- **Keep review restrictions out of every form template,** and get written authorization for any testimonial.
- **Keep listings consistent** from the location's own record, per location and per practitioner, and watch for drift.

## References

**Regulation and enforcement**

- [Cornell LII: 16 CFR part 465](https://www.law.cornell.edu/cfr/text/16/part-465), the FTC's rule on consumer reviews and testimonials, by section
- [Cornell LII: 16 CFR 465.4](https://www.law.cornell.edu/cfr/text/16/465.4), incentives conditioned on review sentiment
- [Cornell LII: 16 CFR 465.5](https://www.law.cornell.edu/cfr/text/16/465.5), insider reviews and solicitation from employees and relatives
- [Cornell LII: 16 CFR 465.7](https://www.law.cornell.edu/cfr/text/16/465.7), review suppression, displayed-review misrepresentation and the neutral criteria
- [FTC: Final rule banning fake reviews and testimonials (August 14, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), the rule's announcement
- [FTC: Warning letters to ten businesses (December 2025)](https://ftc.gov/business-guidance/blog/2025/12/warning-letter-or-ten-businesses-comply-ftcs-consumer-review-rule), the December 22, 2025 letters and the $53,088 penalty level
- [Cornell LII: 15 USC 45b](https://www.law.cornell.edu/uscode/text/15/45b), the Consumer Review Fairness Act and its exceptions
- [HHS OCR: Elite Dental Associates](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/elite/index.html), $10,000 for disclosures in replies on Yelp, announced October 2, 2019
- [HHS OCR: Dr. U. Phillip Igbinadolor, D.M.D. & Associates](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/upi/index.html), a $50,000 civil money penalty for PHI posted in response to a negative review
- [HHS OCR: New Vision Dental](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/new-vision/index.html), $23,000 for PHI disclosed in responses to online reviews
- [HHS OCR: Manasa Health Center](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/manasa/index.html), $30,000 for PHI disclosed in reply to a negative review and missing policies

**Platform policies**

- [Google: Maps user contributed content policy](https://support.google.com/contributionpolicy/answer/7400114), no incentives, no discouraging negative reviews or selectively soliciting positive ones, no pressure on premises
- [Yelp: Don't ask for reviews](https://www.yelp-support.com/article/Don-t-Ask-for-Reviews), no solicitation, "not recommended" reviews and Consumer Alerts

- [Healthgrades: Community review guidelines](https://www.healthgrades.com/content/community-review-guidelines), who may review, prohibited content, email or text confirmation and verification before publication, flagging and removal
- [Healthgrades: Patient reviews](https://www.healthgrades.com/about/patient-reviews), flagging live reviews, no paying for good reviews or removal, anonymous reviews
- [Vitals: Review guidelines](https://www.vitals.com/review-guidelines), own experience only, no health condition details or personal information, removal at Vitals' discretion
- [WebMD Care: Awards methodology](https://doctor.webmd.com/awards/methodology), reviews from users, providers can't remove or modify them, removal only after customer service review

**Vendors**

- [Weave: Reviews](https://www.getweave.com/reviews/), automated and manual invites, Google, Facebook and Healthgrades, the Private Review option
- [Podium: Reviews](https://www.podium.com/reviews/), textable invites and AI-crafted invites and replies
- [Birdeye: Review generation](https://www.birdeye.com/review-generation/), timed requests, variant tests and routing across sites
- [Solutionreach](https://www.solutionreach.com/), reputation management
- [Yapi](https://yapiapp.com/), online reviews and DoctorLogic marketing
