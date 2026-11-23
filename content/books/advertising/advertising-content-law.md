+++
title = "Advertising Content Law"
nav_title = "Ad Content Law"
description = "FTC deception and substantiation, clear disclosures, the Lanham Act and NAD, and the rules for alcohol, drugs, gambling, crypto, credit and cannabis ads."
category = "Advertising Industry"
order = 2962
part = "Privacy and Law"
tags = ["advertising", "ftc", "false-advertising", "substantiation", "regulated-categories", "ad-policy", "data-model"]
+++

Privacy law governs whom an ad reaches; content law governs what the ad says. In the US the base layer is the FTC Act: an ad may not be deceptive, every objective claim needs a reasonable basis before it runs, and any qualification needed to keep it from misleading has to be clear and conspicuous where the claim is. Over that sit competitors, who can sue under the Lanham Act or challenge a claim before the advertising industry's self-regulatory body, and a set of category rules written by other regulators: TTB for alcohol, FDA for prescription drugs, state gaming commissions for gambling, the CFPB's regulations for credit and deposit ads, the FCA in the UK for crypto, and state cannabis regulators. Above all of it, in practice, sit the ad platforms, whose certification programs and policies decide what runs long before any regulator sees it.

The content belongs to the advertiser, so why is it an engineering problem for the platform? Because the platform is where the rules are enforced at scale. A self-serve platform takes millions of ads from advertisers it has never met, in categories whose rules differ by state and country, and has to decide before the first impression whether this advertiser may advertise this product to this audience in this place, with this claim and this disclosure. That decision needs the category, the advertiser's licenses and certifications, the audience's age and location, the jurisdiction's rules on the date, and for some categories proof that the audience composition met an industry standard. And the advertiser's side has its own record to keep: the substantiation for each claim, tied to the creative version that made it, because the FTC asks for it after the fact and expects it to have existed before.

This chapter covers the FTC Act's deception and substantiation standards and the disclosure guidance, competitor and self-regulatory challenges, the regulated categories (alcohol, prescription drugs, gambling, crypto and investments, consumer credit, cannabis, AI-generated content), and platforms as the de facto regulator, then the records: claims and their substantiation per creative version, category rules per jurisdiction, and audience composition checks. It extends `creatives` and `advertisers` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), reuses `advertiser_verifications` ([Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms)) with more program values, and adds content-law reason codes to `creative_reviews` ([Creative Production, Review & DCO](/books/advertising/creative-production-and-dco)); the review machinery itself, policy taxonomies and malvertising are [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising). Endorsements and influencer disclosure are Commerce's [The Endorsement Guides](/books/commerce/acquisition-and-attribution#the-endorsement-guides); fake reviews are its [Fake Reviews and the FTC Rule](/books/commerce/reviews-and-ratings#fake-reviews-and-the-ftc-rule); dark patterns, drip pricing and "Made in USA" are its [Online Consumer Protection](/books/commerce/online-consumer-protection#the-rules-at-a-glance); children's advertising rules are [Children, Teens & Advertising](/books/advertising/children-and-teens).

## How the Platforms Do It

As of November 2026, how Google and Meta gate the regulated categories, against the law each gate tracks:

| Category | Google | Meta | Law the gate tracks |
| --- | --- | --- | --- |
| **Alcohol** | Sensitive interest category in personalized ads (no advertiser-curated audiences) | Never under 18; in the US 21 or older; banned in listed countries | State drinking ages; TTB rules; DISCUS and Beer Institute codes |
| **Cannabis and CBD** | Recreational drugs prohibited; topical hemp-derived CBD at 0.3% THC or less, by application, only in California, Colorado and Puerto Rico | THC products prohibited; CBD in the US only with LegitScript certification and written permission, no health claims, 18 or older; hemp in Canada, Mexico and the US | Federal scheduling; state cannabis ad rules |
| **Crypto** | Certification against local licenses (UGP's Verifying Financial Advertisers has the countries) | Prior written permission and a regulatory license or registration | FCA financial promotion rules (UK); MiCA (EU); state and federal registration (US) |
| **Financial products** | Consumer finance in the US and Canada can't target by gender, age, parental or marital status or ZIP code; financial services verification by country | Credit card, loan and insurance ads only to 18 or older; financial products are a special ad category in the US | Regulation Z, Regulation DD, FINRA 2210, fair lending |
| **Gambling** | Certification per country, a valid license for every region targeted; in the US licensed by the state, never under 21 or outside licensed states; responsible gambling content on the landing page; social casino games certified separately | Prior written permission | State gaming law and regulators |
| **Prescription drugs** | Prescription drug terms restricted; manufacturers in select countries and online pharmacies by country, certified by Google (LegitScript or NABP, depending on the country, for pharmacies and telemedicine) | LegitScript certification and authorization (manufacturers may use Meta's own review instead); the US, Canada or New Zealand only; 18 or older | FDA 21 CFR 202.1 |

What the table shows:

- **Certification is per category and per jurisdiction.** Google's gambling certification needs a separate application per country and "a valid local license for every region you intend to target"; Meta's permissions are by country. A certification is a row with a program and a jurisdiction, not a flag on the advertiser.
- **Third-party certifiers are part of the stack.** LegitScript certifies pharmacies, telehealth and CBD sellers for Meta; the platform checks the certifier's status, not the advertiser's paperwork.
- **The platforms are stricter than the law.** Meta bans THC ads even where cannabis is legal; Google limits CBD to three jurisdictions. A legal product can still be unadvertisable on the largest platforms.

## The FTC Act

Section 5 of the FTC Act declares "unfair or deceptive acts or practices in or affecting commerce" unlawful (15 U.S.C. 45(a)(1)). Section 12 makes it unlawful to disseminate a false advertisement to induce the purchase of food, drugs, devices, services or cosmetics, and says that doing so is an unfair or deceptive act under Section 5 (15 U.S.C. 52).

**Deception.** The FTC's Policy Statement on Deception (October 14, 1983) sets out the elements every deception case shares: "there must be a representation, omission or practice that is likely to mislead the consumer"; the practice is examined "from the perspective of a consumer acting reasonably in the circumstances" (or of the group it targets); and it must be material, likely to affect the consumer's conduct or decision. Four parts of the statement shape how an ad is reviewed:

- **The net impression governs.** The Commission considers "the entire advertisement," the entire mosaic rather than each tile; accurate text may not cure a false headline, and "written disclosures or fine print may be insufficient to correct a misleading representation."
- **Implied claims count.** Where an ad conveys more than one reasonable meaning and one is false, the advertiser is liable for the false one, so review asks what the ad says to its audience, not only what its words literally state.
- **Express claims are presumed material,** and so are claims that significantly involve health or safety.
- **The audience matters.** An ad aimed at children, the elderly or the terminally ill is judged from that group's point of view, which is one reason children's advertising has its own rules.

**Substantiation.** The Policy Statement Regarding Advertising Substantiation (November 23, 1984) holds that making an objective claim without "a reasonable basis" for it is itself unfair and deceptive. When an ad claims a specific level of support ("tests prove", "clinically shown"), the advertiser must have at least that level; otherwise the reasonable basis depends on the type of claim, the product, the consequences of a false claim, the benefits of a truthful one, the cost of developing substantiation, and the amount of substantiation experts in the field would agree is reasonable. The advertiser must have, and rely on, that basis when the claim is made, so the evidence belongs in a file before the ad runs, not in a reply to the FTC afterwards.

**Health claims.** The FTC's Health Products Compliance Guidance (December 2022) replaced its 1998 guide for dietary supplements and covers foods, supplements, over-the-counter drugs, homeopathic products, health equipment, diagnostic tests and health apps. Health benefit and safety claims need "competent and reliable scientific evidence," which for health benefits generally means randomized, controlled human clinical trials; animal and in vitro studies, testimonials and public health recommendations are not enough on their own. FDA has primary responsibility for labeling; the FTC for advertising.

**Clear and conspicuous.** The FTC staff's ".com Disclosures" guidance (March 2013) applies the deception standard to digital ads. Required disclosures must be clear and conspicuous, placed near the claim they qualify ("the closer the disclosure is to the claim to which it relates, the better"); a disclosure that is integral to a claim "should not be communicated through a hyperlink" but placed next to the claim; a space-constrained ad should incorporate the disclosure if possible, and only "under some circumstances" may it be made on the page the ad links to instead; and if a necessary disclosure can't be made clearly and conspicuously, "either the claim should be modified so the disclosure is not necessary or the ad should not be disseminated." That last rule is the one that binds ad formats: a 320x50 banner, a six-second video or a voice ad that can't carry an integral disclosure (one that can't go behind a link) can't carry the claim.

Related FTC rules owned elsewhere, each in a sentence: endorsements must reflect the endorser's honest views and material connections must be disclosed clearly ([The Endorsement Guides](/books/commerce/acquisition-and-attribution#the-endorsement-guides)); the FTC's fake reviews rule bans fake reviews, paying for reviews that must express a particular sentiment, and suppressing reviews ([Fake Reviews and the FTC Rule](/books/commerce/reviews-and-ratings#fake-reviews-and-the-ftc-rule)); an unqualified "Made in USA" claim means all or virtually all ([Made in USA](/books/commerce/online-consumer-protection#made-in-usa)); and an advertised price must include mandatory fees where the fees rules and state laws apply ([Fees and Drip Pricing](/books/commerce/online-consumer-protection#fees-and-drip-pricing)).

## Competitors and Self-Regulation

**The Lanham Act.** Section 43(a) makes liable anyone who, "in commercial advertising or promotion, misrepresents the nature, characteristics, qualities, or geographic origin" of their own or another's goods or services, to any person who believes they are likely to be damaged (15 U.S.C. 1125(a)(1)(B)). In *Lexmark International v. Static Control Components* (March 25, 2014) the Supreme Court set the test for who may sue: a plaintiff "must allege an injury to a commercial interest in reputation or sales," and must show "economic or reputational injury flowing directly from the deception wrought by the defendant's advertising"; consumers deceived into buying are outside it. In practice that makes competitors the private enforcers of advertising claims, and comparative claims ("faster than", "#1 rated") the claims they challenge.

**NAD and NARB.** BBB National Programs' National Advertising Division, founded by the advertising industry in 1971, reviews national advertising in all media for truth and accuracy, on challenges from competitors, trade associations, consumers and NGOs and on its own monitoring (about 20 to 25% of its cases). Participation is voluntary, but an advertiser that refuses to participate or to comply is referred to the FTC, and the advertiser can appeal (a challenger only if its request to appeal is granted) to the National Advertising Review Board. NAD applies the FTC's standards, so its decisions are a public body of reasoning on what substantiation a given claim needs.

**CARU.** The Children's Advertising Review Unit (1974) monitors child-directed advertising and applies its guidelines for children under 13; it was the first FTC-approved COPPA safe harbor. How its guidelines and COPPA apply to ad systems is [Children, Teens & Advertising](/books/advertising/children-and-teens).

For a platform, NAD decisions and Lanham Act suits matter less as risks than as signals: a claim a competitor has successfully challenged is a claim review should look for.

## Regulated Categories

### Alcohol

The Alcohol and Tobacco Tax and Trade Bureau regulates alcohol advertising under the Federal Alcohol Administration Act, with rules for wine, distilled spirits and malt beverages; its definition of an advertisement reaches "any other media" ([Alcohol: The Three-Tier System](/books/commerce/age-restricted-goods#alcohol-the-three-tier-system) has the definition). The prohibited practices for spirits ads (27 CFR 5.235) include false or misleading statements, disparagement of competitors, misleading claims about tests or guarantees, statements inconsistent with the label, age claims not on the label, misleading health-related statements and claims of origin, and "organic" claims that don't meet USDA rules.

The industry codes set the placement rule that matters to an ad system. The Distilled Spirits Council's Code of Responsible Practices (2025 edition) says digital marketing communications "should be placed only in media where at least 73.8% of the audience is reasonably expected to be of the legal purchase age," measured with reliable, up-to-date audience composition data (for digital, syndicated "2+" data such as comScore or Nielsen, averaged over three months), or where a platform is used to target an audience of legal purchase age directly; it requires age affirmation with full date of birth before direct engagement, and semi-annual random post-audits of placements against the standard. The Beer Institute publishes its own Advertising and Marketing Code. On the platforms, Meta requires 21 or older for alcohol ads in the US, and Google treats alcohol as a sensitive interest category, closed to advertiser-curated audiences.

### Prescription Drugs and Devices

FDA regulates prescription drug advertising under 21 CFR 202.1. Every ad must present a true brief summary of side effects, contraindications and effectiveness; an ad that "fails to present a fair balance between information relating to side effects and contraindications" and effectiveness is false or misleading; broadcast ads must include the "major statement" of the major side effects and contraindications, and for direct-to-consumer TV and radio ads the major statement must be "clear, conspicuous, and neutral," in consumer-friendly language and, on TV, in audio and text together. The 2023 rule that added that standard, its compliance dates and FDA's September 2025 enforcement push are the Health Tech volume's [Direct-to-Consumer Advertising](/books/health-tech/pharma-commercial#direct-to-consumer-advertising). For an ad platform the rule shapes formats: a fair balance and a major statement need room, so short video and small display units carry reminder ads (which name the drug without claims) or nothing. Meta allows prescription drug ads only from LegitScript-certified advertisers (or manufacturers that pass its own review), in the US, Canada or New Zealand, to people 18 or older.

### Gambling

Gambling advertising law is state law in the US: each state that licenses sports betting, online casinos or lotteries sets its own advertising rules through its gaming regulator, and I have not tabulated them here. The platforms translate the patchwork into certification. Google requires certification to run gambling and gambling-promoting content, a separate application per country and a valid local license for every region targeted; in the US lotteries must be state-run, horse racing, lottery courier, sports betting and online casino advertisers must be licensed by the state where legal, ads must "not target users under 21 or users outside of the state(s) where they are licensed," and the ad or landing page must carry "a warning against the dangers of addictive and compulsive gambling," with assistance information, responsible gambling information, an age warning and terms on the destination. From November 19, 2026, online gambling certification applications are submitted through the Google Ads account. Social casino games (simulated gambling with "no opportunity to win something of value") need their own certification and a separate account. Meta allows online gambling and gaming ads only with prior written permission.

The system consequence is geographic precision: a sports betting ad licensed in one state must not serve across the state line, so the line item's geography is the license's, and the location used to enforce it must be accurate enough to place the person in a state.

### Crypto and Investments

In the UK, crypto promotions to consumers have been inside the FCA's financial promotion regime since October 8, 2023. A promotion is lawful only if an authorised person communicates it, an authorised person approves it, a cryptoasset firm registered under the Money Laundering Regulations communicates it, or it meets an exemption; the rules require risk warnings, ban incentives to invest, and add a 24-hour cooling-off period, client categorisation and appropriateness checks (which firms could defer to January 8, 2024 by modification). The Investing & Digital Assets volume covers the UK and EU regimes ([The United Kingdom](/books/investing-and-digital-assets/beyond-the-us#the-united-kingdom)) and broker-dealer communications under FINRA Rule 2210 ([FINRA Rule 2210 for Broker Communications](/books/investing-and-digital-assets/advice-and-conduct#finra-rule-2210-for-broker-communications)); paid finfluencers are its [Finfluencers](/books/investing-and-digital-assets/advice-and-conduct#finfluencers). How platforms verify financial and crypto advertisers against regulators' registers, by country, is the UGP volume's [Verifying Financial Advertisers](/books/user-generated-platforms/crypto-investment-scams#verifying-financial-advertisers).

### Consumer Credit and Deposits

Credit ads in the US have trigger rules. Under Regulation Z, an ad for closed-end credit that states the amount or percentage of a down payment, the number of payments or period of repayment, the amount of any payment, or the amount of any finance charge must also state the down payment, the terms of repayment over the full term, and the annual percentage rate, "using that term," with any possible increase (12 CFR 1026.24(d)); any rate stated must be stated as an APR, with the fact that it may increase if it can (1026.24(c)); the commentary allows the abbreviation "APR." Open-end credit ads have a parallel set of triggers, such as a finance charge, a periodic rate expressed as an APR or a membership fee (12 CFR 1026.16(b)). Deposit ads have Regulation DD's: a stated rate is an APY, "free" only if no fee can apply, and a bonus triggers its conditions ([Advertising](/books/banking-and-lending/deposit-accounts#advertising) in the Banking & Lending volume). Fair lending rules on who sees credit ads are [Sensitive Data and Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting#discriminatory-targeting).

Triggers are a good fit for software because they are structural: whether the creative shows a payment amount is a fact about the creative, and the required disclosures follow from it mechanically (below).

### Cannabis

Cannabis is legal in many states and not federally ([Federal Status as of October 2026](/books/commerce/cannabis-and-hemp#federal-status-as-of-october-2026) in the Commerce volume), so its advertising rules are state rules, and they borrow the alcohol industry's audience composition idea with thresholds of their own (California's sits just below the spirits code's 73.8%, Maryland's well above it). California allows broadcast, cable, radio, print and digital advertising only where at least 71.6% of the audience is reasonably expected to be 21 or older, shown with reliable, up-to-date audience composition data (census data and county estimates don't qualify), produced to the regulator immediately on request, with the placement pulled if the data is missing or short (4 CCR 15040). Maryland's cannabis regulator requires at least 85% of the audience to be reasonably expected to be 21 or older for television, radio, internet, mobile app, social media and print. Neither threshold matters on Meta or Google, which don't accept THC product ads at all (Meta's drugs policy; Google's dangerous products policy), so cannabis advertising has to find inventory elsewhere, and there the audience composition evidence is the buyer's and seller's to keep.

### AI-Generated Content

In the US, where disclosure of AI-generated content in ads is law today, it is mostly in political advertising ([DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads#us-political-ad-law)); elsewhere, an AI-generated image is judged by the same deception standard as any other, so a synthetic "before and after" or a fabricated testimonial is deceptive whatever made it. AI disclosure rules beyond political ads, and generative creative tools, are [AI in Advertising](/books/advertising/ai-in-advertising), in Running the Platform.

## Platforms as the De Facto Regulator

For most advertisers the rules that decide whether an ad runs are the platform's, not the law's, and they are enforced by machinery the law doesn't have: certification before the first ad, automated review of every creative and landing page, re-review when a landing page changes, account-level strikes and suspensions. The platforms' policies track the law (Google's gambling rules follow state licensing; Meta's alcohol ages follow national drinking ages) and then go further (THC bans, CBD limits, social casino separation). The review pipeline, policy taxonomies, landing page crawling and cloaking detection are [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising); the user-generated platform's ad moderation is UGP's [Moderating the Ads](/books/user-generated-platforms/ads-and-data-licensing#moderating-the-ads).

What content law adds to that pipeline is three kinds of input:

- **Category rules per jurisdiction,** versioned: who may advertise, with which certification, to whom (minimum age, audience composition), with which disclosures, and which targeting is forbidden.
- **Claim rules:** which claims need substantiation on file before approval (health, efficacy, comparative superiority, "clinically proven"), which trigger disclosures (credit terms, APYs, gambling warnings), and which are never allowed (cure claims for disease in supplements, guaranteed returns).
- **Format rules:** whether a format can carry a required disclosure clearly and conspicuously. If it can't, the claim can't run in it.

## How to Build It

Four records: the rules per category and jurisdiction, the claims each creative version makes and the evidence behind them, and audience composition checks for categories that require them. Verification reuses `advertiser_verifications` with more programs; review outcomes reuse `creative_reviews.reasons` with content-law codes.

```sql
-- More verification programs, for the categories platforms certify separately.
ALTER TABLE advertiser_verifications DROP CONSTRAINT advertiser_verifications_program_check;
ALTER TABLE advertiser_verifications ADD CONSTRAINT advertiser_verifications_program_check
  CHECK (program IN ('identity', 'business_operations', 'election', 'financial_services',
         'gambling', 'healthcare', 'alcohol', 'cannabis', 'crypto', 'pharmacy',
         'social_casino', 'other')) NOT VALID;
ALTER TABLE advertiser_verifications
  ADD COLUMN license_ref TEXT,            -- the regulator's license or registration number
  ADD COLUMN certifier TEXT,              -- 'self', or a third party such as 'legitscript'
  ADD COLUMN last_register_check_at TIMESTAMPTZ;  -- last confirmed against the public register

-- What a category requires in a jurisdiction, effective-dated.
CREATE TABLE regulated_category_rules (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  category               TEXT NOT NULL,     -- 'alcohol', 'cannabis', 'gambling.sports', 'credit.closed_end', ...
  jurisdiction           TEXT NOT NULL,     -- 'US', 'US-CA', 'US-MD', 'GB', or a platform policy key
  source_kind            TEXT NOT NULL CHECK (source_kind IN ('statute', 'regulation',
                           'industry_code', 'platform_policy')),
  authority              TEXT NOT NULL,     -- '4 CCR 15040', 'DISCUS Code 2025', '12 CFR 1026.24'
  allowed                BOOLEAN NOT NULL,  -- false: the category may not be advertised here
  required_programs      TEXT[] NOT NULL DEFAULT '{}',  -- advertiser_verifications.program values
  min_age                SMALLINT,          -- e.g. 21
  audience_composition_min_bp INT CHECK (audience_composition_min_bp BETWEEN 0 AND 10000),
                                            -- 7380 DISCUS, 7160 California, 8500 Maryland
  composition_age        SMALLINT,          -- the age the composition is measured at
  composition_data_rule  TEXT,              -- e.g. 'syndicated_2plus_3mo_avg'
  geo_must_match_license BOOLEAN NOT NULL DEFAULT FALSE,
  required_disclosures   TEXT[] NOT NULL DEFAULT '{}',  -- 'responsible_gambling', 'apr', 'license_number', ...
  forbidden_targeting    TEXT[] NOT NULL DEFAULT '{}',  -- targeting dimensions not allowed
  forbidden_claims       TEXT[] NOT NULL DEFAULT '{}',  -- claim kinds never allowed
  effective              DATERANGE NOT NULL,
  UNIQUE (category, jurisdiction, authority, effective)
);
CREATE INDEX regulated_category_rules_lookup_idx
  ON regulated_category_rules (category, jurisdiction);

-- Evidence an advertiser holds for its claims, reusable across creatives.
CREATE TABLE substantiation_files (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id   UUID NOT NULL REFERENCES advertisers (id),
  kind            TEXT NOT NULL CHECK (kind IN ('rct', 'clinical_study', 'lab_test',
                    'consumer_survey', 'market_data', 'expert_opinion', 'certificate',
                    'license', 'other')),
  title           TEXT NOT NULL,
  document_ref    TEXT NOT NULL,          -- pointer to stored evidence, with its checksum
  obtained_at     DATE NOT NULL,          -- substantiation must predate the claim
  valid_until     DATE,                   -- market data and "#1" claims go stale
  reviewed_by     TEXT,                   -- the advertiser's legal or the platform's reviewer
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each claim a creative version makes, as reviewed.
CREATE TABLE ad_claims (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  creative_version_id   UUID NOT NULL REFERENCES creative_versions (id),
  claim_text            TEXT NOT NULL,     -- as it appears, or the reviewer's statement of an implied claim
  expressness           TEXT NOT NULL CHECK (expressness IN ('express', 'implied')),
  kind                  TEXT NOT NULL CHECK (kind IN ('health', 'safety', 'efficacy',
                          'establishment', 'comparative', 'superiority', 'price', 'origin',
                          'environmental', 'financial_terms', 'endorsement', 'other')),
  establishment_level   TEXT,              -- "clinically proven": the level the ad itself claims
  disclosure_text       TEXT,              -- the qualifying disclosure, if any
  disclosure_placement  TEXT CHECK (disclosure_placement IN ('adjacent', 'same_screen',
                          'audio', 'landing_page', 'none')),
  status                TEXT NOT NULL CHECK (status IN ('pending', 'substantiated',
                          'unsubstantiated', 'withdrawn')),
  decided_by            TEXT,
  decided_at            TIMESTAMPTZ,
  CHECK ((status IN ('substantiated', 'unsubstantiated')) = (decided_at IS NOT NULL))
);

CREATE TABLE ad_claim_evidence (
  ad_claim_id           UUID NOT NULL REFERENCES ad_claims (id),
  substantiation_file_id UUID NOT NULL REFERENCES substantiation_files (id),
  relied_on_at          TIMESTAMPTZ NOT NULL,  -- when the claim was approved on it
  PRIMARY KEY (ad_claim_id, substantiation_file_id)
);

-- Audience composition evidence for placements in categories that require it.
CREATE TABLE audience_composition_checks (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  rule_id               UUID NOT NULL REFERENCES regulated_category_rules (id),
  property_id           UUID REFERENCES properties (id),
  ad_unit_id            UUID REFERENCES ad_units (id),
  line_item_id          UUID REFERENCES line_items (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('pre_buy', 'post_audit')),
  data_source           TEXT NOT NULL,     -- 'comscore', 'nielsen', 'platform_age_targeting', 'survey'
  data_period           DATERANGE NOT NULL,
  measured_share_bp     INT NOT NULL CHECK (measured_share_bp BETWEEN 0 AND 10000),
  required_share_bp     INT NOT NULL,      -- copied from the rule when checked
  passed                BOOLEAN NOT NULL,
  checked_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (passed = (measured_share_bp >= required_share_bp)),
  CHECK (property_id IS NOT NULL OR ad_unit_id IS NOT NULL OR line_item_id IS NOT NULL)
);
```

Review outcomes go in the existing `creative_reviews.reasons` array, with codes from [Ad Review](/books/advertising/ad-review-and-malvertising)'s taxonomy; the content-law codes this chapter needs are `claim_unsubstantiated`, `establishment_claim_unsupported`, `disclosure_missing`, `disclosure_not_clear_conspicuous`, `format_cannot_carry_disclosure`, `category_not_allowed`, `certification_missing`, `audience_composition_unmet`, `fair_balance_missing`, `credit_trigger_disclosures_missing` and `license_geo_mismatch`, and a `limited` decision's `scope` names the jurisdictions where the ad may still run.

Credit trigger terms are the clearest case of a rule a reviewer shouldn't have to remember. Given the structured terms a credit creative displays (from the offer the creative was built from, not from reading pixels), the required disclosures follow from Regulation Z:

```go tab="Go"
package creditads

// Shown is what a closed-end credit ad states, from the offer it was built from.
type Shown struct {
	DownPayment   bool // amount or percentage of any down payment
	NumPayments   bool // number of payments or period of repayment
	PaymentAmount bool // amount of any payment
	FinanceCharge bool // amount of any finance charge
	Rate          bool // any finance charge rate
}

// Disclosures in an ad's copy, as the review found them.
type Disclosures struct {
	DownPayment     bool
	RepaymentTerms  bool // over the full term, including any balloon payment
	APR             bool // "annual percentage rate", or "APR"
	APRMayIncrease  bool
	RateIsAPR       bool // every stated rate is stated as an APR
}

// Missing returns the reason codes for what 12 CFR 1026.24(c) and (d) require and the copy lacks.
// aprCanIncrease says whether the offer's APR may increase after consummation.
func Missing(s Shown, d Disclosures, aprCanIncrease bool) []string {
	var out []string
	if s.Rate && !d.RateIsAPR {
		out = append(out, "rate_not_stated_as_apr")
	}
	triggered := s.DownPayment || s.NumPayments || s.PaymentAmount || s.FinanceCharge
	if triggered {
		if !d.DownPayment {
			out = append(out, "trigger_down_payment_missing")
		}
		if !d.RepaymentTerms {
			out = append(out, "trigger_repayment_terms_missing")
		}
		if !d.APR {
			out = append(out, "trigger_apr_missing")
		}
	}
	// A stated rate or a triggered APR must say if the rate may increase (24(c), 24(d)(2)(iii)).
	if (s.Rate || triggered) && aprCanIncrease && !d.APRMayIncrease {
		out = append(out, "apr_increase_missing")
	}
	return out
}
```

```rust tab="Rust"
/// What a closed-end credit ad states, from the offer it was built from.
pub struct Shown {
    pub down_payment: bool,   // amount or percentage of any down payment
    pub num_payments: bool,   // number of payments or period of repayment
    pub payment_amount: bool, // amount of any payment
    pub finance_charge: bool, // amount of any finance charge
    pub rate: bool,           // any finance charge rate
}

/// Disclosures in an ad's copy, as the review found them.
pub struct Disclosures {
    pub down_payment: bool,
    pub repayment_terms: bool, // over the full term, including any balloon payment
    pub apr: bool,             // "annual percentage rate", or "APR"
    pub apr_may_increase: bool,
    pub rate_is_apr: bool,     // every stated rate is stated as an APR
}

/// Reason codes for what 12 CFR 1026.24(c) and (d) require and the copy lacks.
/// `apr_can_increase` says whether the offer's APR may increase after consummation.
pub fn missing(s: &Shown, d: &Disclosures, apr_can_increase: bool) -> Vec<&'static str> {
    let mut out = Vec::new();
    if s.rate && !d.rate_is_apr {
        out.push("rate_not_stated_as_apr");
    }
    let triggered = s.down_payment || s.num_payments || s.payment_amount || s.finance_charge;
    if triggered {
        if !d.down_payment {
            out.push("trigger_down_payment_missing");
        }
        if !d.repayment_terms {
            out.push("trigger_repayment_terms_missing");
        }
        if !d.apr {
            out.push("trigger_apr_missing");
        }
    }
    // A stated rate or a triggered APR must say if the rate may increase (24(c), 24(d)(2)(iii)).
    if (s.rate || triggered) && apr_can_increase && !d.apr_may_increase {
        out.push("apr_increase_missing");
    }
    out
}
```

An auto loan banner saying "$299 a month" shows a payment amount, so it triggers all three disclosures; one saying "low monthly payments" states no amount and triggers nothing (though "low" is still a claim the deception standard reaches). The codes the function returns roll up to `credit_trigger_disclosures_missing` in the review.

Design notes:

- **Rules are data, keyed by category and jurisdiction.** A line item's eligibility is the intersection of every rule whose category matches its advertiser's product and whose jurisdiction overlaps its geography, on the serving date ([When Rules Overlap](/docs/building-blocks/rules-as-data#when-rules-overlap)); the strictest minimum age and the highest composition threshold win. Platform policies are rows too, with `source_kind = 'platform_policy'`, so "the law allows it, the platform doesn't" is visible.
- **Certification is checked at serving, not only at approval.** `required_programs` joins to the advertiser's current `advertiser_verifications` for each jurisdiction; an expired license stops delivery in that jurisdiction the day it expires, and `last_register_check_at` shows when someone last confirmed it against the regulator's register.
- **Claims belong to versions.** A claim is reviewed on the `creative_versions` row that makes it, which is immutable once served; a new headline is a new version and a new review, so the substantiation on file is always the substantiation for what ran.
- **Evidence must predate the claim.** `substantiation_files.obtained_at` before `ad_claim_evidence.relied_on_at` is the record that the advertiser had a reasonable basis when the claim was made, which is what the substantiation statement asks.
- **Format capacity is a rule input.** A claim with `disclosure_placement = 'landing_page'` for an integral disclosure is rejected, and a format that can't show a disclosure adjacent to its claim is excluded for that claim, the ".com Disclosures" rule in code.
- **Composition checks are both pre-buy and audit.** A pre-buy check with the required data source gates the placement; semi-annual post-audits sample past placements against the same rule, as the DISCUS code requires; a failed audit opens a corrective review of the property or line item.
- **Geography must be as good as the license.** For `geo_must_match_license` categories, the line item's targeting is limited to the licensed states, and delivery on IP-derived location near a state line is suppressed rather than guessed ([Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies) covers location quality).

## Auditing

What the FTC, a state attorney general, a gaming or cannabis regulator, NAD, a competitor's lawyers or a platform's own policy team asks for:

- **Every claim in every creative version that ran,** with its substantiation, the date the evidence was obtained and the date the claim was approved.
- **Disclosures as rendered,** per format and placement, and the review decision that found them adequate.
- **Category rules in force on each date** with their authority, and which rule versions each line item was evaluated against.
- **Certifications and licenses** per advertiser, program and jurisdiction, with register checks and the date delivery stopped when one lapsed.
- **Audience composition evidence** for each regulated placement, pre-buy and post-audit, with data source and period.
- **Review decisions and reason codes** for rejected and limited ads, by category and jurisdiction, and appeals.
- **Geographic delivery** for licensed categories against the licensed states.

Typed actors and append-only history are in [Audit Trails](/docs/building-blocks/audit-trails); recording which rule version decided is [Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided).

## What This Means for the System You Build

- **Review the net impression,** including implied claims, from the point of view of the audience the ad targets.
- **Require substantiation on file before approving objective claims,** at the level the ad itself claims, and tie it to the creative version.
- **Treat a format that can't carry a required disclosure as unable to carry the claim.**
- **Model regulated categories as effective-dated rules per jurisdiction,** including platform policies, and evaluate them at serving time.
- **Check certifications and licenses per program and jurisdiction at serving,** against public registers on a schedule.
- **Keep audience composition evidence** for categories that require it, before the buy and in periodic audits.
- **Derive mechanical disclosures from structured offer terms,** such as credit triggers, rather than from a reviewer's memory.
- **Restrict licensed categories to licensed geography,** with location accurate enough to enforce it.

## References

**Regulation**

- [15 U.S.C. 45 (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/45), Section 5's prohibition of unfair or deceptive acts or practices
- [15 U.S.C. 52 (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/52), Section 12 on false advertisements for food, drugs, devices, services and cosmetics
- [15 U.S.C. 1125 (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/1125), Lanham Act section 43(a)(1)(B) false advertising
- [27 CFR 5.235 (Cornell LII)](https://www.law.cornell.edu/cfr/text/27/5.235), prohibited practices in distilled spirits advertising
- [21 CFR 202.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/202.1), the brief summary, fair balance and the major statement for broadcast and DTC TV and radio ads
- [CFPB: Regulation Z 1026.24, advertising (closed-end credit)](https://www.consumerfinance.gov/rules-policy/regulations/1026/24/), the triggering terms and required disclosures, rates stated as APRs with any increase, and the commentary allowing "APR"
- [CFPB: Regulation Z 1026.16, advertising (open-end credit)](https://www.consumerfinance.gov/rules-policy/regulations/1026/16/), the open-end triggering terms
- [California 4 CCR 15040 (Cornell LII)](https://law.cornell.edu/regulations/california/4-CCR-15040), the 71.6% audience composition rule, the data requirements and removal

**Regulators**

- [FTC: Policy Statement on Deception (October 14, 1983)](https://www.ftc.gov/system/files/documents/public_statements/410531/831014deceptionstmt.pdf), the elements of deception, the entire advertisement, fine print, implied meanings and the materiality presumptions
- [FTC: Policy Statement Regarding Advertising Substantiation (November 23, 1984)](https://www.ftc.gov/legal-library/browse/ftc-policy-statement-regarding-advertising-substantiation), the reasonable basis requirement, establishment claims and the factors
- [FTC: Health Products Compliance Guidance (December 2022)](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance), scope, the replaced 1998 guide and competent and reliable scientific evidence
- [FTC: .com Disclosures (March 2013)](https://www.ftc.gov/sites/default/files/attachments/press-releases/ftc-staff-revises-online-advertising-disclosure-guidelines/130312dotcomdisclosures.pdf), clear and conspicuous, proximity, hyperlinks for integral disclosures, space-constrained ads and the landing page exception, and when an ad should not be disseminated
- [FCA: FCA sets expectations ahead of incoming crypto marketing rules (September 7, 2023)](https://www.fca.org.uk/news/press-releases/fca-sets-expectations-ahead-incoming-crypto-marketing-rules), the October 8, 2023 start, the four routes and the January 8, 2024 modification
- [FCA: PS23/6 Financial promotion rules for cryptoassets](https://www.fca.org.uk/publications/policy-statements/ps23-6-financial-promotion-rules-cryptoassets), risk warnings, the incentive ban, positive frictions, categorisation and appropriateness
- [Maryland Cannabis Administration: Advertising restrictions (updated March 21, 2024)](https://cannabis.maryland.gov:443/Documents/2024%20Industry%20Licensees/10.2.23%20Version%20of%20Advertising%20Restrictions%20UPDATED%20March.21.24.pdf), the 85% audience composition requirement by medium

**Court records**

- [Lexmark International, Inc. v. Static Control Components, Inc., 572 U.S. 118 (2014) (Cornell LII)](https://www.law.cornell.edu/supremecourt/text/12-873), the zone of interests and proximate cause test for Lanham Act false advertising

**Self-regulation**

- [BBB National Programs: National Advertising Division](https://bbbprograms.org/programs/all-programs/national-advertising-division), founding in 1971, sources of cases, monitoring share, tracks, referral to the FTC and NARB appeals
- [BBB National Programs: Children's Advertising Review Unit](https://bbbprograms.org/programs/children/caru), 1974 founding, children under 13 and the first FTC-approved COPPA safe harbor
- [Distilled Spirits Council: Code of Responsible Practices (2025)](https://distilledspirits.org/wp-content/uploads/2025/09/Final-2025-DISCUS-Code.pdf), the 73.8% legal purchase age standard, syndicated data, age affirmation and semi-annual post audits
- [Beer Institute: Advertising and Marketing Code](https://www.beerinstitute.org/responsibility/advertising-marketing-code/), the brewers' code and its reasonable adult consumer perspective

**In practice**

- [Google: Gambling and games policy](https://support.google.com/adspolicy/answer/6018017), certification per country, US state licensing, the under-21 and out-of-state targeting ban, landing page requirements, the November 19, 2026 move into Google Ads and social casino games
- [Google: Personalized advertising policy](https://support.google.com/adspolicy/answer/143465), alcohol and gambling as sensitive interest categories without advertiser-curated audiences, and consumer finance's targeting limits in the US and Canada
- [Google: Dangerous products or services policy](https://support.google.com/adspolicy/answer/6014299), recreational drugs and the topical CBD exception in California, Colorado and Puerto Rico
- [Google: Healthcare and medicines policy](https://support.google.com/adspolicy/answer/176031), prescription drug terms, manufacturers and online pharmacies by country, Google certification, LegitScript and NABP by country
- [Meta: Advertising Standards](https://transparency.meta.com/policies/ad-standards/), restricted goods and services: gambling with prior written permission, financial products to 18 and older, special ad categories
- [Meta: Cryptocurrency products and services ad policy](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/cryptocurrency-products-and-services/), prior written permission and a recognized regulatory license or registration
- [Meta: Alcohol ad policy](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/alcohol/), the 18 minimum, 21 or older in the US and the country bans
- [Meta: Drugs and pharmaceuticals ad policy](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/drugs-pharmaceuticals/), THC prohibited, CBD with LegitScript in the US, hemp, and prescription drugs with LegitScript certification or, for manufacturers, Meta's own review
