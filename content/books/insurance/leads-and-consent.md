+++
title = "Leads, Aggregators & Consent"
nav_title = "Leads & Consent"
description = "Insurance lead markets, TCPA prior express written consent, the vacated one-to-one rule, consent evidence, state mini-TCPA laws and quote-request privacy."
category = "Insurance Industry"
order = 2718
part = "Distribution"
tags = ["insurance", "distribution", "lead-generation", "tcpa", "consent"]
+++

Personal lines insurance is bought by comparison, and a large part of the comparing happens on sites that don't sell insurance. A driver fills in a quote form on a comparison site; the site auctions the request, in milliseconds, as a click to a carrier's quote page, as a lead to several agents, or as a live call transferred to a licensed agent; the buyers then call and text the driver, often within the minute. The economics favor speed and volume, and the law that limits both is the Telephone Consumer Protection Act: autodialed or prerecorded telemarketing calls and texts to a cell phone need the consumer's prior express written consent, and statutory damages of $500 a call, trebled if willful, make every lead a potential liability for whoever dialed it.

Insurance is where the federal rules on lead consent were most recently fought over. The FCC's 2023 "one-to-one" consent rule was aimed at comparison sites that collected one consent for dozens of sellers, and the petitioner that got it vacated in 2025 was the Insurance Marketing Coalition. This chapter covers the lead markets as their filings describe them, who may sell a lead without an insurance license, prior express written consent and the one-to-one rule's history to its current status, consent evidence, the state laws that go further, and the privacy of quote requests. The general law of calls and texts is in [Calls, Texts & Email](/docs/compliance/consumer-contact) and the carrier registration layer for texts in [Texting Registration](/books/hosting-and-cloud/texting-registration#10dlc-brands-and-campaigns); this chapter covers what insurance adds. It extends `parties` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `leads` and `consents`.

## How the Platforms Do It

As of November 2026, from 2025 filings and vendor pages:

| Company | What it sells | Scale | What the filing says about consent and regulation |
| --- | --- | --- | --- |
| **EverQuote** | Consumer referrals to carriers and agents as "clicks, data, and calls" | $692.5M revenue in 2025 (up 38.5%), 91% from automotive; about 60 carriers and about 6,000 enrolled agencies | The TCPA "requires prior express written consent"; cites the Eleventh Circuit's January 24, 2025 vacatur of one-to-one consent; revenue recognized at delivery |
| **MediaAlpha** | Programmatic marketplace for clicks (90.1% of transaction value), leads (5.7%) and calls (4.2%) | $2.2B transaction value (up 44.5%), $1.9B of it P&C; $1.1B revenue; 700+ demand partners | An FTC consent order, agreed July 3, 2025 and effective October 16, 2025, with a $45.0M payment; it must not collect, transfer or disclose consumer information without express informed consent |
| **ActiveProspect (TrustedForm)** | Consent certification for lead sellers and buyers | Bought Verisk Marketing Solutions on December 31, 2025 | A TrustedForm certificate records a "time stamp, session replay, event log, page URL, consent language," retained up to five years |
| **Jornaya** | Lead event tracking | Site now under ActiveProspect | (What a Jornaya record contains couldn't be confirmed from its current site) |

MediaAlpha's structure shows the two ways a lead market makes money. In its **open marketplace** it buys from supply partners (the sites where consumers fill in forms) and sells to demand partners (carriers and agents), paying the supply side a revenue share; in its **private marketplace** it charges a fee on transaction value for running auctions between parties that contract with each other. EverQuote sells its own referrals, and notes that some carriers subsidize their agents' referral costs. Either way the buyer pays per click, lead or call delivered, not per policy sold.

## Lead Markets

The three products carry different consent and licensing risk:

- **Clicks.** The consumer is sent to the buyer's own quote page. The buyer collects its own data and consent there, so the click itself carries little TCPA exposure; it is most of the dollar volume (90.1% of MediaAlpha's transaction value).
- **Leads.** The consumer's details and a consent record are delivered to one or more buyers, who call and text. The consent was collected by someone else, on a page the buyer didn't control, and the buyer's exposure depends entirely on it.
- **Calls.** A live call transferred to a licensed agent. The transfer is a call the consumer is already on, but the outbound call or text that set it up, and any follow-up, need consent.

Lead economics, worked with numbers of my own: an auto lead at $28.00, contacted 70% of the time, quoted on 40% of contacts and bound on 25% of quotes, binds 0.70 × 0.40 × 0.25 = 7% of the time, a cost per bound policy of 28.00 / 0.07 = **$400.00**. A $1,200.00 annual premium at a 12% commission earns the agent $144.00 in the first year, so the lead pays back only if the customer renews about twice; a carrier buying the same lead for its direct channel compares $400.00 against what an agent would cost over the policy's life ([Channel Economics](/books/insurance/agents-brokers-and-channels#channel-economics)). Every rate in the funnel is a query over `leads`, contacts, quotes and policies, by source, and the buyer that can't run it is buying blind.

## Who May Sell a Lead

Selling a lead isn't selling insurance, if it's done carefully. The NAIC Producer Licensing Model Act requires a license to sell, solicit or negotiate, and excepts a person "whose activities in this state are limited to advertising without the intent to solicit insurance in this state through communications in printed publications or other forms of electronic mass media whose distribution is not limited to residents of the state," as long as the person doesn't sell, solicit or negotiate insurance on risks there ([Who Must Be Licensed](/books/insurance/producer-licensing#who-must-be-licensed)). It also bars paying a commission to an unlicensed person "for selling, soliciting or negotiating insurance," while allowing payments to "persons who do not sell, solicit or negotiate insurance in this state, unless the payment would violate" an anti-rebating law.

Lead markets are built around that line. A comparison site that collects details and passes them on, paid per delivered lead regardless of whether anything is sold, is positioned as advertising; a site that recommends a carrier's coverage, quotes a binding price or is paid per policy sold looks like soliciting or negotiating, and needs a license. Where the line falls is each state's question, and the design consequence is that payment terms (per lead or per sale) and what the site says to the consumer are compliance inputs, stored with the source agreement.

## Prior Express Written Consent

Under the TCPA, it is unlawful to make a call using an automatic telephone dialing system or an artificial or prerecorded voice to a cell phone without the called party's prior express consent (47 USC 227(b)(1)(A)(iii)), or an artificial or prerecorded call to a residential line without it (227(b)(1)(B)). The FCC's rules require **prior express written consent** for such calls when they include or introduce an advertisement or constitute telemarketing (47 CFR 64.1200(a)(2) and (a)(3)), and the FCC treats texts as calls. The definition, as restored in 2025, is "an agreement, in writing, bearing the signature of the person called" that clearly authorizes the seller to deliver such calls to a designated number, with the disclosure that agreeing isn't a condition of purchase ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent) has the full split between informational and marketing consent).

The remedies make consent the most expensive record in the funnel. A person may recover actual loss or $500 for each violation, whichever is greater, trebled if the violation was willful or knowing (227(b)(3)); for do-not-call violations, more than one call in twelve months in violation of the rules supports up to $500 per violation, with a defense for reasonable, implemented procedures (227(c)(5)). Worked, mine: an agency that texts 2,000 purchased leads three times each on a consent that turns out not to name it faces 6,000 potential violations, $3,000,000 at $500 and $9,000,000 if a court trebles, before defense costs.

Two things frame how courts read the rules. The statute defines an autodialer by the capacity "to store or produce telephone numbers to be called, using a random or sequential number generator," which the Supreme Court read narrowly in 2021 ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent) covers the decision). And *McLaughlin Chiropractic v. McKesson* (June 20, 2025) held that "the Hobbs Act does not bind district courts in civil enforcement proceedings to an agency's interpretation of a statute"; "district courts must independently determine the law's meaning," giving the FCC's reading appropriate respect. Neither narrows the prerecorded and artificial voice rules, and state laws define their own dialing systems ([State Telemarketing and Mini-TCPA Laws](#state-telemarketing-and-mini-tcpa-laws)).

## The One-to-One Rule and Its Vacatur

The sequence, with current status as of November 2026:

1. **December 2023: the rule.** The FCC's Second Report and Order (38 FCC Rcd 12247) revised the definition of prior express written consent in 64.1200(f)(9) to require consent to one seller at a time ("one-to-one") and calls "logically and topically associated" with the interaction where consent was given. Aimed at comparison sites listing many "marketing partners" under one checkbox, it would have stopped one insurance quote form from consenting a consumer to calls from a list of carriers and agents.
2. **January 24, 2025: vacated.** In *Insurance Marketing Coalition Ltd. v. FCC*, 127 F.4th 303 (11th Cir. 2025), the Eleventh Circuit held that the FCC exceeded its statutory authority and vacated that part of the order; the mandate issued April 30, 2025. The rule never took effect.
3. **July 14, 2025: repealed.** The FCC's Consumer and Governmental Affairs Bureau order DA 25-621, in the "Delete, Delete, Delete" proceeding, removed the revised 64.1200(f)(9) and reinstated the prior text, which is the definition in force today.
4. **Revocation rules, still moving.** The FCC's 2024 order let consumers revoke consent by any reasonable method, honored within ten business days. Its "revoke all" provision was delayed, and FCC 26-67 (adopted September 30, 2026, published October 26, 2026) replaces it **effective November 25, 2026**: a revocation in response to a telemarketing call or text revokes all future telemarketing robocalls from that caller, a revocation of an informational message may be scoped to that category, and callers may designate an exclusive revocation method (key-press, the standard words by text, or a designated website or number) if they disclose it clearly ([Revoking Consent](/docs/compliance/consumer-contact#revoking-consent) tracks the details).

The vacatur restored the older rule; it didn't make consent to "partners" safe. The definition still requires that the agreement authorize **the seller** making the call to deliver telemarketing to that number. A consent listing one hundred "marketing partners" in a hyperlink is still a question of whether the person called is clearly authorized, and a court deciding it now reads the statute for itself.

## Consent Evidence

A lead buyer's defense is the consent record, so the buyer needs more than a flag that says "consented." What to receive and keep with every lead:

- **The consent language as displayed,** verbatim, with the list of sellers it named or linked, and whether your name was on it.
- **Where and when:** the page URL, the timestamp, the consumer's IP and user agent, and the form's version.
- **What the consumer did:** the click or checkbox, and ideally a replay of the session; TrustedForm certificates record a "time stamp, session replay, event log, page URL, consent language," retained up to five years.
- **The number consented,** matched to the number dialed, and any reassignment check before dialing it later ([Reassigned Numbers](/docs/compliance/consumer-contact#reassigned-numbers)).
- **The chain of custody:** which supply partner collected it, which marketplace sold it, and the price paid.

Retention has its own rules. The FTC's Telemarketing Sales Rule requires telemarketers and sellers to keep records, including consent records and do-not-call requests, for five years after amendments published April 16, 2024 (16 CFR 310.5), though the FTC notes the rule reaches insurance only "to the extent that such business is not regulated by state law." My default is to keep the whole consent record at least five years after the last contact it supported, and never to delete it while the lead is still being contacted.

MediaAlpha's FTC order shows the regulator's view of the supply side: a lead marketplace may not collect, transfer or disclose consumer information without the consumer's express informed consent. For a buyer, "the marketplace said it had consent" is not evidence; the certificate is.

## State Telemarketing and Mini-TCPA Laws

States regulate the same calls more strictly, and the stricter rule governs:

| State | Law | What it adds |
| --- | --- | --- |
| **Florida** | Telephone Solicitation Act, Fla. Stat. 501.059 (2026) | Prior express written consent for sales calls and texts made with "an automated system for the selection and dialing of telephone numbers" (a phrase, not the federal autodialer test); for texts, the called party must first reply "STOP" and the seller has 15 days to stop before a suit; damages of actual loss or $500, whichever is greater, up to treble if willful |
| **Florida** | Fla. Stat. 501.616(6) | No commercial solicitation calls before 8 a.m. or after 8 p.m. local time, and no more than 3 calls "from any number to a person over a 24-hour period" on the same subject |
| **Maryland** | Stop the Spam Calls Act, Md. Com. Law 14-4502 and 14-4503 | Prior express written consent for automated selection or dialing systems and recorded messages; no calls between 8 p.m. and 8 a.m.; no more than 3 calls in 24 hours on the same subject "regardless of the telephone numbers used"; damages up to $500 or actual damages, trebled if willful or knowing |
| **Texas** | SB 140 (89th Legislature), effective September 1, 2025 | "Telephone solicitation" now includes "a transmission of a text or graphic message or of an image," pulling texts into the state's telemarketing chapter, with violations actionable under the Deceptive Trade Practices Act |

Two insurance-specific points. Licensing exemptions don't reach these laws: Florida's Telemarketing Act exempts "any licensed insurance broker, agent, customer representative, or solicitor" soliciting within the scope of the license from its separate commercial telephone seller licensing (Fla. Stat. 501.604(8)), but nothing in that exemption reaches the consent and calling-hour rules in 501.059 and 501.616. And the stricter calling window wins: a Florida lead can be called from 8 a.m. to 8 p.m. in the consumer's time zone, not 9 p.m. as federal rules allow, and a Maryland lead gets three attempts a day across all of the buyer's numbers. These rules are dated data by state with their citations, checked by the same outbound gate as everything else ([Calling Hours and Do-Not-Call](/docs/compliance/consumer-contact#calling-hours-and-do-not-call)).

## Quote-Request Privacy

A quote request is already a privacy relationship. Under the NAIC's privacy regulation implementing the Gramm-Leach-Bliley Act (Model 672), "an applicant for insurance prior to the inception of insurance coverage is a licensee's consumer," so the driver who submits a quote form to an agency or carrier is a consumer whose nonpublic personal information is covered from that moment, before any policy. A lead seller that isn't a licensee sits outside that regulation, which is why the FTC acts against marketplaces directly. For a carrier or agency buying leads, the data received becomes nonpublic personal information in its hands, subject to its privacy notice and to the rules on disclosing it to nonaffiliated third parties; reselling a lead it bought, or sharing it with another carrier, is a disclosure. Data, AI & Privacy Rules covers the notices and opt-outs.

## How to Build It

A lead is a party in a role with a source; a consent is its own record with evidence, scoped to a seller, a channel and a purpose, revocable:

```sql
CREATE TABLE lead_sources (                -- a supply partner or marketplace agreement
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  name               TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('marketplace', 'publisher', 'aggregator',
                       'partner', 'own_site')),
  product            TEXT NOT NULL CHECK (product IN ('click', 'lead', 'call')),
  pays_on            TEXT NOT NULL CHECK (pays_on IN ('delivery', 'contact', 'bind')),
  licensed_npn       TEXT,                  -- if the source holds a producer license
  agreement_doc_id   UUID NOT NULL
);

CREATE TABLE leads (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  source_id          UUID NOT NULL REFERENCES lead_sources (id),
  external_ref       TEXT NOT NULL,         -- the source's lead ID
  party_id           UUID NOT NULL REFERENCES parties (id),
  line               TEXT NOT NULL,         -- 'personal_auto', 'homeowners', ...
  state              TEXT NOT NULL,         -- the consumer's state, for calling rules
  time_zone          TEXT NOT NULL,
  price              BIGINT NOT NULL,       -- minor units paid for it
  received_at        TIMESTAMPTZ NOT NULL,
  submission_id      UUID,                  -- the quote it became, if any
  UNIQUE (source_id, external_ref)
);

CREATE TABLE consents (                    -- one grant, by seller, number, channel, purpose
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  lead_id            UUID REFERENCES leads (id),
  seller_names       TEXT[] NOT NULL,       -- as displayed in the consent language
  names_us           BOOLEAN NOT NULL,      -- our seller name appeared, verified
  phone_e164         TEXT NOT NULL,
  channels           TEXT[] NOT NULL,       -- 'autodialed_call', 'prerecorded', 'sms'
  purpose            TEXT NOT NULL CHECK (purpose IN ('telemarketing', 'informational')),
  kind               TEXT NOT NULL CHECK (kind IN ('prior_express_written', 'prior_express')),
  language           TEXT NOT NULL,         -- verbatim
  page_url           TEXT NOT NULL,
  captured_at        TIMESTAMPTZ NOT NULL,
  ip_address         INET,
  certificate_ref    TEXT,                  -- TrustedForm or similar
  certificate_expires_at TIMESTAMPTZ,       -- claim it into your own retention before this
  revoked_at         TIMESTAMPTZ,
  revocation_scope   TEXT CHECK (revocation_scope IN ('all_telemarketing', 'category')),
  revocation_channel TEXT
);

CREATE TABLE contact_rules (               -- federal and state windows and caps, dated
  jurisdiction       TEXT NOT NULL,         -- 'US', 'US-FL', 'US-MD', 'US-TX'
  earliest_local     TIME NOT NULL,         -- 08:00
  latest_local       TIME NOT NULL,         -- 21:00 federal, 20:00 Florida
  max_attempts_24h   INT,                   -- 3 in Florida and Maryland
  cap_scope          TEXT CHECK (cap_scope IN ('per_number', 'all_numbers')),
  rule_ref           TEXT NOT NULL,
  valid_during       DATERANGE NOT NULL,
  PRIMARY KEY (jurisdiction, valid_during)
);
```

And the gate every automated attempt passes, the strictest of federal and state rules:

```go tab="Go"
type Consent struct {
	Kind      string // "prior_express_written" or "prior_express"
	NamesUs   bool
	RevokedAt *time.Time
}

type Attempt struct {
	Purpose   string    // "telemarketing" or "informational"
	Automated bool      // autodialed, prerecorded or AI voice, or an automated text
	Local     time.Time // in the consumer's time zone
	PriorIn24 int       // attempts on the same subject in the last 24 hours
}

type Rule struct {
	EarliestMin, LatestMin int // minutes past local midnight
	MaxPer24               int // 0 = no cap
}

// MayContact applies consent first, then every jurisdiction's window and cap.
func MayContact(c Consent, a Attempt, rules []Rule) (bool, string) {
	if a.Automated && a.Purpose == "telemarketing" &&
		(c.Kind != "prior_express_written" || !c.NamesUs) {
		return false, "no prior express written consent naming us"
	}
	if c.RevokedAt != nil && !a.Local.Before(*c.RevokedAt) {
		return false, "consent revoked"
	}
	minute := a.Local.Hour()*60 + a.Local.Minute()
	for _, r := range rules {
		if minute < r.EarliestMin || minute >= r.LatestMin {
			return false, "outside calling hours"
		}
		if r.MaxPer24 > 0 && a.PriorIn24 >= r.MaxPer24 {
			return false, "24-hour attempt cap reached"
		}
	}
	return true, ""
}
```

```rust tab="Rust"
use chrono::{DateTime, FixedOffset, Timelike};

pub struct Consent { pub kind: String, pub names_us: bool, pub revoked_at: Option<DateTime<FixedOffset>> }
pub struct Attempt { pub purpose: String, pub automated: bool, pub local: DateTime<FixedOffset>, pub prior_in_24: u32 }
pub struct Rule { pub earliest_min: u32, pub latest_min: u32, pub max_per_24: u32 } // minutes past local midnight

/// Consent first, then every jurisdiction's window and cap.
pub fn may_contact(c: &Consent, a: &Attempt, rules: &[Rule]) -> Result<(), &'static str> {
    if a.automated && a.purpose == "telemarketing" && (c.kind != "prior_express_written" || !c.names_us) {
        return Err("no prior express written consent naming us");
    }
    if c.revoked_at.is_some_and(|r| a.local >= r) {
        return Err("consent revoked");
    }
    let minute = a.local.hour() * 60 + a.local.minute();
    for r in rules {
        if minute < r.earliest_min || minute >= r.latest_min {
            return Err("outside calling hours");
        }
        if r.max_per_24 > 0 && a.prior_in_24 >= r.max_per_24 {
            return Err("24-hour attempt cap reached");
        }
    }
    Ok(())
}
```

The local time is the consumer's, from the lead's time zone, never the caller's; the rules passed in are the federal rule plus the consumer's state's, valid on the attempt date; and the do-not-call and reassigned-number checks run in the same gate before any of this ([One Outbound Gate](/docs/building-blocks/notifications#one-outbound-gate)).

Design notes:

- **Consent is per seller, not per lead.** One lead can carry consent for several named sellers; `names_us` is verified against the displayed language when the lead arrives, and a lead without it is routed to manual, non-automated contact or rejected.
- **Certificates expire at the vendor.** Claim or copy the evidence into your own retention before the vendor's window ends, because a suit can arrive years after the call.
- **Revocations are scoped by what they answered.** From November 25, 2026, a revocation replying to a telemarketing message revokes all telemarketing; store the scope with the revocation, not a single flag.
- **Lead price and outcome are on the lead,** so funnel economics by source are queries.

## Auditing

- **For every automated attempt, the consent that allowed it.** Attempt time in the consumer's zone, the consent row, its evidence certificate, the rules applied and the gate's result, retained at least five years.
- **For every lead, where it came from and what was paid.** Source agreement, payment basis, price and the consent chain of custody.
- **For every revocation, when and how it was honored,** within ten business days, with its scope.
- **For every source, its licensing position:** whether it is licensed, how it is paid and what it shows consumers, because that decides whether payments to it are commissions.

## What This Means for the System You Build

- **Store consent as evidence, per seller and per number,** with the displayed language, page, time and certificate, and verify your name is on it before dialing.
- **Gate every automated call and text** on consent, revocation, do-not-call, reassigned numbers and the strictest applicable calling window and attempt cap, in the consumer's time zone.
- **Keep state rules as dated data:** Florida's 8 p.m. limit, Maryland's three attempts across all numbers, Texas's inclusion of texts.
- **Pay lead sources per delivery, not per sale, unless they're licensed,** and keep the agreement that says which.
- **Treat a quote request as consumer data under the privacy rules** from the moment it arrives.
- **Measure cost per bound policy by source,** from lead price through contact, quote and bind.

## References

**Law and regulation**

- [47 USC 227](https://www.law.cornell.edu/uscode/text/47/227), the autodialer definition, the cell phone and residential prerecorded call prohibitions, $500 per violation trebled if willful, and the do-not-call private action
- [47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), prior express written consent for telemarketing in (a)(2) and (a)(3), revocation in (a)(10), calling hours in (c)(1), the national do-not-call registry in (c)(2), and the definition in (f)(9)
- [Federal Register: FCC 26-67, revocation of consent (October 26, 2026)](https://www.govinfo.gov/link/fr/91/67219), the scoped informational revocation, telemarketing revocation of all telemarketing, exclusive revocation methods, effective November 25, 2026
- [16 CFR 310.5](https://www.law.cornell.edu/cfr/text/16/310.5), Telemarketing Sales Rule recordkeeping, including consent records, for five years after the 2024 amendment
- [Fla. Stat. 501.059](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.059.html), the Florida Telephone Solicitation Act: prior express written consent, the automated dialing phrase, the STOP and 15-day text rule, and damages
- [Fla. Stat. 501.616](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.616.html), Florida calling hours of 8 a.m. to 8 p.m. and three calls in 24 hours
- [Fla. Stat. 501.604](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.604.html), the Telemarketing Act exemption for licensed insurance agents and brokers soliciting within their license
- [Md. Code, Com. Law 14-4502](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gcl&section=14-4502&enactments=false), Maryland's Stop the Spam Calls Act: consent, calling hours and the three-call cap across numbers
- [Texas Legislature: SB 140 (89R)](https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB140), texts and images as telephone solicitation from September 1, 2025, and DTPA remedies

**Regulators and guidance**

- [FCC: Order DA 25-621 (July 14, 2025) (PDF)](https://docs.fcc.gov/public/attachments/DA-25-621A1.pdf), the repeal of the revised one-to-one definition and the reinstated prior text, with the Second Report and Order's citation and the Eleventh Circuit's mandate
- [FTC: Complying with the Telemarketing Sales Rule](https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule), the rule's reach to insurance only where not regulated by state law

**NAIC**

- [NAIC: Producer Licensing Model Act (Model 218) (PDF)](https://content.naic.org/sites/default/files/model-law-218.pdf), the advertising exception and the bar on commissions to unlicensed persons
- [NAIC: Privacy of Consumer Financial and Health Information Regulation (Model 672) (PDF)](https://content.naic.org/sites/default/files/model-law-672.pdf), an applicant before coverage begins is a consumer

**Courts**

- [McLaughlin Chiropractic Associates v. McKesson Corp., No. 23-1226 (U.S. June 20, 2025)](https://www.law.cornell.edu/supremecourt/text/23-1226), district courts not bound by the FCC's interpretation under the Hobbs Act

**Filings**

- [EverQuote: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1640428/000119312526066957/ever-20251231.htm), revenue, verticals, clicks, data and calls, carriers and agencies, recognition at delivery, and its TCPA risk discussion citing the 2025 vacatur
- [MediaAlpha: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1818383/000181838326000049/max-20251231.htm), transaction value and its mix, open and private marketplaces, partners and the FTC consent order
- [Verisk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1442145/000143774926004452/vrsk20251231_10k.htm), the sale of Verisk Marketing Solutions to ActiveProspect

**Vendor documentation**

- [ActiveProspect: TrustedForm](https://activeprospect.com/trustedform/), what a certificate records and five-year retention
