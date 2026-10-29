+++
title = "Reviews & Ratings"
description = "Collecting, moderating and syndicating product reviews: the FTC reviews rule, incentives and gating, Amazon Vine, Google store ratings, EU and UK review law."
category = "Commerce Industry"
order = 2333
part = "Marketplaces"
tags = ["commerce", "reviews", "ratings", "ftc", "syndication", "ugc"]
+++

A product's star rating is the most persuasive number on its page, and the one the seller is most tempted to manage. A brand can ask every buyer for a review, or only the happy ones. It can give free product to reviewers, or a discount for five stars. It can show every review, or hide the one-star reviews. It can syndicate its reviews to forty retailers' sites, or buy reviews from a broker. The first of each pair is lawful practice; the second is, as of October 2026, a violation of a federal trade regulation rule with civil penalties, of EU and UK banned-practice lists, and of every marketplace's and Google's policies. What separates them is rarely the technology. It's whether sentiment decided who was asked, who was rewarded and what was shown, and whether the records can prove it didn't.

This chapter covers product reviews: collecting them, moderating them, syndicating them across retailers, the FTC's Consumer Reviews and Testimonials Rule and Endorsement Guides, incentivized reviews and sampling (Amazon Vine), review gating, Google's store and product ratings and review snippets, and the EU and UK fake review rules. Reviews on peer-to-peer marketplaces, where both sides review each other, are the User-Generated Platforms volume's [Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews#reviews), which covers simultaneous reveal, retaliation and seller feedback; its summary of the FTC rule is [The FTC Consumer Reviews and Testimonials Rule](/books/user-generated-platforms/messaging-and-reviews#the-ftc-consumer-reviews-and-testimonials-rule). Influencer endorsements and affiliate disclosures are the later Acquisition & Attribution chapter. The chapter extends `products` and `order_lines` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `review_requests`, `reviews`, `review_media` and `review_moderation_actions`.

## How the Platforms Do It

As of October 2026, from vendor and platform documentation:

| Platform | What it is | How reviews are collected | Integrity rules it publishes | Syndication |
| --- | --- | --- | --- | --- |
| **Amazon** | The marketplace's own reviews on each product page | The Request a Review button and Customer Reviews tool send Amazon's own request; Amazon Vine gives free units to invited reviewers | Sellers may not "attempt to influence customer ratings, feedback, and reviews," ask buyers to remove negative reviews or post positive ones, and may only report reviews, not edit them | None outward; Amazon reviews stay on Amazon |
| **Bazaarvoice** | A ratings and reviews network of "12,000+ brand and retail websites" | Post-purchase requests, sampling, imported content | "Consumer sentiment about a product should not dictate who is requested or allowed to submit a review"; clients can't moderate their own content; incentivized and employee reviews are badged | Brand reviews syndicated to retailers in its network; imported content without authenticity data "will not be eligible for syndication"; a syndication partnership with Google |
| **PowerReviews** | Ratings and reviews, sampling and UGC syndication for brands and retailers | Post-purchase requests and sampling | Published by the vendor | To retailer partners |
| **Google Customer Reviews** | Google's own post-purchase survey for merchants, feeding store ratings | A survey opt-in after checkout, which Google "requires that you display ... to all your users" | The all-users rule rules out choosing whom to ask | Into Google store ratings |
| **Shopify** | Reviews through third-party apps (Yotpo, Okendo, Judge.me and others) | Each app's request flows | Each app's | Several feed Google product ratings |

Shopify's own Product Reviews app shows as "not currently available on the Shopify App Store," which leaves reviews on Shopify to the app ecosystem.

Three patterns run through the table:

- **Collection is post-purchase and automated.** Every system sends a request after delivery to every buyer; the integrity question is whether "every" is true.
- **Moderation is the platform's, not the seller's.** Amazon reports-only, Bazaarvoice's no self-moderation and Google's all-users rule all take the decision to hide a review away from the party that benefits from hiding it.
- **Reviews travel.** A brand's reviews are syndicated to retailers and to Google, with authenticity data attached; content that can't show where it came from doesn't travel.

## Collecting Reviews

A review program starts with the request. The lawful default is simple: ask every buyer, after delivery, once or twice, with the same wording, wherever the review will appear. The records should show that:

- **Requests go to every eligible buyer.** The eligibility rule (delivered, not refunded, past a waiting period, one request per order line) is applied without reference to anything that predicts sentiment: not a satisfaction survey score, not a support ticket, not a return. The FTC's Endorsement Guides give the example directly: inviting only very satisfied buyers may be unfair, while inviting all recent purchasers is fine (16 CFR 255.2(d)).
- **Verified purchase is a fact, not a badge.** A review tied to an order line is from a buyer; the badge is computed from that link. Reviews not tied to a purchase (on a product page open to anyone) are labeled as such.
- **One review per buyer per product,** editable by its author, never by the seller.
- **Reviews of the item that was sold.** Reviews attach to the product the buyer bought; merging reviews across products is limited to variants of the same product (color, size), never to a different or newer product. The FTC's rule treats a review that materially misrepresents the reviewer's experience with the product as fake, and a review shown on a product it wasn't written about misrepresents exactly that.

**Review gating** is asking first ("How did we do?") and sending only the happy customers to the review site. The FTC's Q&A on its 2024 rule says the rule "does not contain a specific prohibition against such conduct," but that gating may still violate Section 5 of the FTC Act, and the Endorsement Guides call selective solicitation potentially unfair. Google's policies prohibit it outright: merchants may not "discourage or prohibit negative reviews, or selectively solicit positive reviews from customers." My rule: no step that reads sentiment ever sits before the review request.

## Incentives and Sampling

Incentives for reviewing are lawful; incentives for a particular rating are not:

- **The FTC rule** (16 CFR 465.4) bans providing compensation or other incentives "conditioned, expressly or implicitly," on a review expressing a particular sentiment, positive or negative. The FTC's Q&A: "The rule does not prohibit giving incentives for reviews" that aren't conditioned on sentiment.
- **The Endorsement Guides** treat paying for positive reviews as deceptive even when disclosed (16 CFR 255.2(d)), and require that a material connection (free product, payment, employment) be disclosed with the review.
- **Bazaarvoice badges incentivized reviews,** which is the industry's general shape: incentivized reviews are allowed when every recipient is asked, the reward doesn't depend on the rating, and the review says it was incentivized.

**Amazon Vine** is the marketplace's sanctioned sampling program. As of October 2026, from Amazon's program page: enrollment requires a Professional selling account and a Brand Registry role (or generic products), FBA products with "fewer than 30 reviews," excluding adult, digital and bundled products; a seller enrolls up to 30 units per parent product; reviewers, called Vine Voices, are "selected based on the insightfulness of the reviews that they've published." The fee per parent product is $0 for 1 to 2 units, $75 for 3 to 10 and $200 for 11 to 30, charged after the first review, and not at all if no review arrives within 90 days. Amazon chooses the reviewers and labels their reviews; the seller controls nothing about who reviews or what they write. That is what keeps sampling lawful: the brand provides product, the program provides independence.

## Moderation and Suppression

Every review program removes some reviews: spam, profanity, personal information, reviews of the wrong product. The FTC rule makes the line between moderation and suppression explicit (16 CFR 465.7):

- **Suppression by threat is banned:** using unfounded legal threats, physical threats, intimidation, or false public accusations to prevent or remove a review.
- **Suppression by display is banned:** representing that the reviews shown are all or most of the reviews when some have been withheld based on their rating or sentiment.
- **Moderation is allowed when it ignores sentiment.** Reviews may be withheld for containing trade secrets, defamatory, harassing, abusive, obscene or discriminatory content, personal information, clearly false content, content reasonably believed to be fake, or content unrelated to the product, provided the criteria are applied to all reviews regardless of sentiment.
- **Organizing is not suppressing.** The FTC's Q&A: "Organizing reviews is not suppressing reviews under the rule." Sorting and filters are fine; a default sort that puts a seller-chosen review on top as "most helpful" is not (the Endorsement Guides' example), and reviews under four stars may not be held back (another example in 16 CFR 255.2).

**Gag clauses are void.** The Consumer Review Fairness Act (15 U.S.C. 45b) makes form-contract terms that restrict buyers' reviews, penalize reviewers, or claim intellectual property in reviews beyond a non-exclusive license "void from the inception," and offering such a contract is itself unlawful.

**Seller responses** are allowed and useful: a public reply from the brand under a review, once, identified as the brand. A response that threatens the reviewer is suppression.

## Fake Reviews and the FTC Rule

The FTC's Trade Regulation Rule on the Use of Consumer Reviews and Testimonials (16 CFR Part 465) was announced August 14, 2024 and took effect October 21, 2024. Beyond incentives and suppression, it prohibits:

- **Fake or false reviews and testimonials (465.2):** writing, creating or selling reviews that materially misrepresent that the reviewer exists, used the product, or had the experience described, and buying or disseminating them when the business "knew or should have known." Generalized requests to past buyers and merely hosting reviews are exempt.
- **Undisclosed insider reviews (465.5):** reviews and testimonials by a company's own officers, managers, employees or agents that don't disclose the relationship.
- **Company-controlled review sites (465.6):** a review website or entity presented as independent while the business controls it.
- **Fake social media indicators (465.8):** buying or selling fake followers or views when the party knew or should have known they were fake and used them for a commercial purpose.

The rule allows civil penalties for knowing violations; the FTC's adjusted maximum is $53,088 per violation, the 2025 level, which the FTC said on September 15, 2026 would stay unchanged during 2026 because a missing month of inflation data prevented the annual adjustment. Enforcement as of October 2026:

- **Warning letters.** On December 22, 2025, FTC staff warned 10 unnamed companies about possible violations of the rule; the agency said the letters are not findings of violation.
- **Sitejabber.** The FTC's 2024 order against Sitejabber (GGL Projects) alleged it presented ratings as reflecting buyers' experiences when many came from people who "had not yet received" what they bought, made final January 3, 2025.
- **Rytr.** A 2024 order against an AI writing tool alleged to produce fake reviews was reopened and set aside by the FTC on December 22, 2025, citing the AI Action Plan.

**Marketplaces enforce their own rules at scale.** Amazon's 2025 Trustworthy Shopping Experience Report says it "proactively blocked hundreds of millions of suspected fake reviews" and that legal action led "over 40 fake review brokers and related websites" to cease activity in 2025.

## EU and UK Rules

**The EU** amended the Unfair Commercial Practices Directive with the Omnibus Directive (2019/2161). Where a trader "provides access to consumer reviews of products," information about "whether and how the trader ensures that the published reviews originate from consumers who have actually used or purchased the product" is material information (Article 7(6)): the store has to say what it checks. Two practices are always unfair (Annex I): "stating that reviews of a product are submitted by consumers who have actually used or purchased the product without taking reasonable and proportionate steps to check that they originate from such consumers" (point 23b), and "submitting or commissioning another legal or natural person to submit false consumer reviews or endorsements, or misrepresenting consumer reviews or social endorsements, in order to promote products" (point 23c).

**The UK's** Digital Markets, Competition and Consumers Act 2024, Schedule 20 paragraph 13, in force April 6, 2025, bans submitting or commissioning "a fake consumer review" or a concealed incentivised review, publishing reviews "in a misleading way," and publishing reviews without "such reasonable and proportionate steps as are necessary" to prevent and remove fake ones. A fake review "purports to be, but is not, based on a person's genuine experience." The CMA's guidance (CMA208, April 4, 2025) expects publishers to have a policy that clearly prohibits fake reviews, regular risk assessments, detection before publication, investigation with removal and sanctions, and publicly accessible reporting.

The common requirement across the US, EU and UK is the same: a store that shows reviews must be able to say how it knows they are real, and must act on fakes. Showing a "verified purchase" badge without the purchase link behind it is, in the EU, a banned practice.

## Google Seller and Product Ratings

Reviews leave the store through Google:

- **Store ratings** (formerly seller ratings) show a store's rating in Google Shopping and ads. As of October 2026 a store generally needs "at least 100 eligible, unique reviews," and to show with ads "at least 3.5 out of 5 stars"; sources are Google Customer Reviews, third-party review partners (Trustpilot, Yotpo and others), Google Search users and Google's shopping research, calculated per country.
- **Product ratings** come from a product reviews data source submitted to Merchant Center or through an approved aggregator; aggregators set their own minimums (several require 50 reviews), and matching to the catalog uses product identifiers such as GTINs.
- **Review snippets** in organic results come from `Review` and `AggregateRating` structured data on a `Product` page ([Structured Data](/books/commerce/storefronts#structured-data)); `AggregateRating` needs `ratingValue` and "at least one of ratingCount or reviewCount." Self-serving reviews are excluded for business pages: "If the entity that's being reviewed controls the reviews about itself, their pages that use LocalBusiness or any other type of Organization structured data are ineligible for star review feature." Product pages remain eligible.
- **Google's own review policies** ban fake engagement and incentivized or biased reviews on Maps and business profiles, and gating, as above.

## Syndication

Syndication sends a brand's reviews to the retailers that sell its products, so a new retailer listing launches with the brand's reviews already on it. Bazaarvoice's network and PowerReviews' partners are the main US routes, and Google's product ratings are syndication of a kind. The rules that make it honest:

- **Provenance travels with the review.** Each syndicated review carries its origin ("Originally posted on brand.com"), whether it was incentivized or from a sampling program, and its verified-purchase status at the source. Bazaarvoice won't syndicate imported content without authenticity data.
- **Matching is by product identifier.** Reviews attach to the retailer's listing through GTIN or the brand's product ID; a mismatched identifier puts reviews on the wrong product, which is a misrepresentation on someone else's site.
- **Removal propagates.** A review removed at the source (by its author or for policy) is removed everywhere it was syndicated; the syndication log is what makes that possible.
- **The EU disclosure applies to each display.** A retailer showing syndicated reviews must say how it ensures they come from buyers, which it can only do if the source's checks travel with them.

## How to Build It

Requests, reviews tied to order lines, media, and every moderation decision, extending `products` and `order_lines` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). These are one-sided product reviews; the User-Generated Platforms volume's `reviews` table is the two-sided marketplace version, with a review per side per booking sealed until reveal ([How to Build It](/books/user-generated-platforms/messaging-and-reviews#how-to-build-it)):

```sql
CREATE TABLE review_requests (             -- every ask, so "we asked everyone" is provable
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  order_line_id   UUID NOT NULL REFERENCES order_lines (id),
  customer_id     UUID NOT NULL REFERENCES customers (id),
  rule_version    TEXT NOT NULL,           -- the eligibility rule that selected this line
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'in_app', 'package_insert',
                    'marketplace')),
  incentive       TEXT,                    -- null, or the offer as shown; never rating-dependent
  sent_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (order_line_id, sent_at)
);

CREATE TABLE reviews (                     -- one buyer's review of one product
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id      UUID NOT NULL REFERENCES products (id),
  item_id         UUID REFERENCES items (id),          -- the variant bought, when known
  order_line_id   UUID REFERENCES order_lines (id),    -- null: not tied to a purchase
  customer_id     UUID REFERENCES customers (id),
  source          TEXT NOT NULL CHECK (source IN ('native', 'syndicated', 'imported',
                    'sampling', 'marketplace')),
  source_ref      TEXT,                    -- the origin site and its review ID
  material_connection TEXT CHECK (material_connection IN ('incentivized', 'free_product',
                    'employee', 'other')),  -- disclosed with the review when set
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           TEXT,
  body            TEXT,
  locale          TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('pending', 'published', 'withheld',
                    'removed_by_author')),
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  UNIQUE (product_id, customer_id)
);

CREATE TABLE review_media (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  review_id       UUID NOT NULL REFERENCES reviews (id),
  kind            TEXT NOT NULL CHECK (kind IN ('image', 'video')),
  object_key      TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('pending', 'published', 'withheld'))
);

CREATE TABLE review_moderation_actions (   -- every decision, with the clause that justified it
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  review_id       UUID NOT NULL REFERENCES reviews (id),
  action          TEXT NOT NULL CHECK (action IN ('publish', 'withhold', 'reinstate',
                    'flag_suspected_fake', 'respond')),
  reason          TEXT CHECK (reason IN ('trade_secret', 'defamatory', 'harassing', 'obscene',
                    'discriminatory', 'personal_information', 'clearly_false',
                    'suspected_fake', 'unrelated', 'spam', 'legal_order')),
  policy_version  TEXT NOT NULL,
  decided_by      TEXT NOT NULL,           -- a moderator, or a model and its version
  evidence        JSONB,                   -- signals behind a suspected-fake call
  decided_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (action NOT IN ('withhold', 'flag_suspected_fake') OR reason IS NOT NULL)
);

ALTER TABLE products
  ADD COLUMN rating_average NUMERIC(3, 2),  -- derived from published reviews, refreshed
  ADD COLUMN rating_count   INT NOT NULL DEFAULT 0;

-- Gating check: share of delivered lines in a period that got a request, by rule version.
SELECT r.rule_version, COUNT(DISTINCT r.order_line_id)::NUMERIC / NULLIF(d.lines, 0) AS asked
FROM review_requests r,
     (SELECT COUNT(*) AS lines FROM order_lines ol JOIN fulfillment_lines fl
        ON fl.order_line_id = ol.id JOIN fulfillments f ON f.id = fl.fulfillment_id
      WHERE f.status = 'delivered' AND f.created_at <@ $1) d
WHERE r.sent_at <@ $1
GROUP BY r.rule_version, d.lines;
```

Design notes:

- **The reason list is the rule's list.** `review_moderation_actions.reason` is the FTC rule's sentiment-neutral grounds (and spam and legal orders); there is no reason for "negative." A withheld review without a reason can't be written ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons)).
- **Verified purchase is a join.** The badge is `order_line_id IS NOT NULL` with the line delivered and not refunded at submission; it's never set by hand, and imported reviews keep their source's status in `source_ref` rather than gaining ours.
- **Ratings are derived.** `rating_average` and `rating_count` are computed from published reviews on a schedule or on change, never edited, and the same numbers go to the page, the structured data and the feed to Google.
- **Requests are logged even when nobody answers.** `review_requests` is what proves every buyer was asked; the gating query above should show the same coverage for every eligibility path, and a drop for one segment is a finding.
- **Detection proposes, policy decides.** Fake-review signals (linked accounts, bursts, text similarity, reviewers who never bought) feed a score that queues a review; the action records the model version and evidence ([Risk Scoring](/docs/architecture/risk-scoring), [The Decision Record](/docs/architecture/risk-scoring#the-decision-record)).
- **Syndication is an outbox.** Publication and removal events go to each syndication partner and are logged per partner, so a removal reaches every copy ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every review request,** with the eligibility rule version and any incentive offered, so a gating or incentive question has an answer.
- **Every review as submitted,** its purchase link and material connection, and every edit by its author.
- **Every moderation action** with its reason, policy version, decider and evidence; the FTC's suppression rule, the EU's verification duty and the CMA's guidance all look here.
- **Syndication in and out,** with provenance and removals per partner.
- **The store's published review policy, versioned,** which is the EU's Article 7(6) disclosure and the CMA's expected policy.

## What This Means for the System You Build

- **Ask every buyer the same way,** with no sentiment check before the request, and log every request.
- **Tie reviews to order lines,** and compute verified purchase from the link.
- **Reward reviewing, never ratings,** and disclose every material connection on the review.
- **Withhold only for sentiment-neutral reasons,** recorded per review; never hide low ratings or let sellers moderate their own reviews.
- **Say how you check reviews,** because EU law makes it material and UK law requires reasonable steps.
- **Derive ratings,** and send the same numbers to the page, structured data and Google.
- **Syndicate with provenance,** match by product identifier, and propagate removals.
- **Strike gag clauses** from terms of sale; under the Consumer Review Fairness Act they're void and offering them is unlawful.

## References

**Platform documentation**

- [Amazon: Customer Reviews tool](https://sell.amazon.com/tools/customer-reviews), Request a Review and what sellers may not do
- [Amazon: Vine](https://sell.amazon.com/programs/vine), eligibility, units, fees and how Vine Voices are chosen
- [Amazon: 2025 Trustworthy Shopping Experience Report](https://trustworthyshopping.aboutamazon.com/2025-trustworthy-shopping-experience-report), fake reviews blocked and brokers stopped
- [Bazaarvoice: About](https://www.bazaarvoice.com/about/), network size and Google syndication partnership
- [Bazaarvoice: Authenticity Policy](https://www.bazaarvoice.com/legal/authenticity-policy/), sentiment-neutral requests, no self-moderation, badges and syndication eligibility
- [PowerReviews](https://www.powerreviews.com/), ratings, sampling and syndication
- [Shopify App Store: Product Reviews](https://apps.shopify.com/product-reviews), the app's availability
- [Google: Store ratings overview](https://support.google.com/merchants/answer/190657), review minimums, the 3.5-star threshold and sources
- [Google: Google Customer Reviews opt-in](https://support.google.com/merchants/answer/7188525), showing the survey opt-in to all users
- [Google: How to submit product reviews data](https://support.google.com/merchants/answer/7045996), product reviews sources and aggregators
- [Google Search Central: Review snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet), required properties and self-serving reviews
- [Google Maps: Prohibited and restricted content](https://support.google.com/contributionpolicy/answer/7400114), fake engagement, incentivized reviews and selective solicitation

**Regulators and rules**

- [FTC: Final rule banning fake reviews and testimonials (August 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), the prohibited practices
- [16 CFR Part 465](https://www.law.cornell.edu/cfr/text/16/part-465), the rule's sections
- [16 CFR 465.2](https://www.law.cornell.edu/cfr/text/16/465.2), fake or false reviews and exemptions
- [16 CFR 465.4](https://www.law.cornell.edu/cfr/text/16/465.4), sentiment-conditioned incentives
- [16 CFR 465.7](https://www.law.cornell.edu/cfr/text/16/465.7), review suppression and sentiment-neutral grounds
- [16 CFR 465.8](https://www.law.cornell.edu/cfr/text/16/465.8), fake social media indicators
- [FTC: Consumer Reviews and Testimonials Rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers), effective date, gating, incentives and organizing reviews
- [FTC: Civil penalty inflation adjustments (September 2026)](https://public-inspection.federalregister.gov/2026-18853.pdf), 2025 levels unchanged in 2026
- [16 CFR 255.2](https://www.law.cornell.edu/cfr/text/16/255.2), the Endorsement Guides' review examples
- [FTC: Updated Endorsement Guides (June 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements), procuring, suppressing and organizing reviews
- [FTC: Warning letters to 10 companies (December 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-warns-10-companies-about-possible-violations-agencys-new-consumer-review-rule), first enforcement step under the rule
- [FTC: Sitejabber](https://www.ftc.gov/legal-library/browse/cases-proceedings/sitejabber), ratings from people who hadn't received the product
- [FTC: Rytr](https://www.ftc.gov/legal-library/browse/cases-proceedings/rytr), the 2024 order and its 2025 set-aside
- [15 U.S.C. 45b](https://www.law.cornell.edu/uscode/text/15/45b), the Consumer Review Fairness Act

**EU and UK**

- [Directive (EU) 2019/2161, Article 3](https://www.legislation.gov.uk/eudr/2019/2161/article/3), UCPD Article 7(6) and Annex I points 23b and 23c
- [UK Digital Markets, Competition and Consumers Act 2024, Schedule 20](https://www.legislation.gov.uk/ukpga/2024/13/schedule/20), paragraph 13 on fake reviews
- [UK DMCC Act 2024, section 225](https://www.legislation.gov.uk/ukpga/2024/13/section/225), commencement of the unfair practices provisions
- [CMA: Fake reviews guidance (CMA208)](https://www.gov.uk/government/publications/fake-reviews-cma208), the prohibition and publishers' steps
- [CMA: Short guide for businesses publishing consumer reviews](https://www.gov.uk/government/publications/fake-reviews/short-guide-for-businesses-publishing-consumer-reviews-and-complying-with-consumer-protection-law), policy, risk assessment, detection and sanctions
