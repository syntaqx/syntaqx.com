+++
title = "Law Enforcement Requests & User Data"
nav_title = "Law Enforcement Requests"
description = "Subpoenas, court orders, warrants, emergency and preservation requests, user notice, the CLOUD Act and EU e-evidence, and requests versus privacy rights."
category = "User-Generated Platforms Industry"
order = 1848
part = "The Rules"
tags = ["user-generated-content", "law-enforcement", "privacy", "data-retention", "legal-process"]
+++

Every platform where people post, message and trade becomes a source of evidence. A threat posted in a community, a fraud run through a marketplace's messages, a missing teenager's last chat, an account that sold drugs: police ask for the account's email, its IP addresses, its messages, sometimes everything. The requests arrive by the thousand. Reddit received 1,223 standard requests for account information from government and law enforcement agencies in 32 countries in the second half of 2025 alone, plus 192 emergency requests and 597 preservation requests; Discord received 1,711 emergency requests and 5,665 preservation requests in a year.

The work is hard in three ways. **The law decides what each request can get,** and the answer depends on the type of process, the type of data, the country of the requester and the entity that holds the data, so a team that answers on instinct over-discloses (and breaks the law that protects users) or under-discloses (and stalls an investigation or misses an emergency). **Some requests are fake:** criminals send forged subpoenas and fake emergency requests from hacked police mailboxes, and Reddit caught 26 fraudulent government requests in one half-year. **The requests collide with the platform's other duties:** a preservation request freezes data a user has asked to erase, a nondisclosure order forbids telling them, and the transparency report must still count it all.

This chapter covers the US framework (the Stored Communications Act's tiers of process, preservation, emergency disclosure, nondisclosure orders and civil subpoenas), international requests (mutual legal assistance, CLOUD Act agreements, the EU's e-evidence regime applying from August 2026), what the platforms publish about how they handle requests, fraud and verification, privacy rights against evidence, and the operating model. It extends [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds), whose `legal_holds` table this chapter's preservations use, and adds tables for requests, the accounts they name and what was produced. Child sexual exploitation reports to NCMEC run on a separate statutory path ([Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#the-reporting-duty)); copyright subpoenas under 17 U.S.C. 512(h) are covered in [Copyright at Scale](/books/user-generated-platforms/copyright#subpoenas-to-identify-infringers). None of this is legal advice; every request is reviewed by counsel.

## How the Platforms Do It

| Platform | Intake | Preservation | Emergency | User notice | Latest published volume |
| --- | --- | --- | --- | --- | --- |
| **Discord** | Government Request Portal only; government email domain, identity and agency verification | 90 days under 2703(f), extendable by 90 | Under 2702(b)(8) and (c)(4); requester describes the emergency and the data needed | Notifies and provides a copy of process unless prohibited; 2705(b) orders must have a finite duration; no notice of preservations or emergency requests | March 2025 to March 2026: 1,711 emergency requests, 1,045 produced; 5,665 preservation requests, 4,467 complied; 2,127 international requests, 926 produced |
| **Google** | Each request reviewed; overbroad requests narrowed | Not covered here | May disclose to prevent death or serious physical harm | Emails the user before disclosure except where prohibited, in emergencies, or if the account is hijacked; notifies after a prohibition ends | Not covered here |
| **Pinterest** | Not covered here | Not covered here | 8 U.S. emergency requests in H2 2025 | 6 U.S. accounts notified in H2 2025 | H2 2025: 137 U.S. requests (101 with some information produced), 44 international (6 produced); national security requests reported as a range of 0 to 249 |
| **Reddit** | Legal process reviewed by a specialized team; requests must name the account and the information sought | Copies existing data only; purged when the period lapses unless extended; disclosed only with valid process | Good-faith belief of imminent death or serious bodily harm; identity of the official may be validated | Before production unless prohibited or counterproductive (emergencies, child safety); after a nondisclosure period ends | H2 2025: 1,223 standard requests, 70% with disclosure (U.S. 721, 82%); 192 emergency requests, 41% disclosed; 597 preservation requests; 241 users notified |

The patterns: **every platform maps process type to data type** (subpoena for subscriber data, court order for other records, warrant for content); **preservation and disclosure are separate steps**; **emergency requests are the riskiest door** because they skip court process; and **notice to the user is the default** with documented exceptions. The published volumes are themselves a duty under transparency regimes ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#what-the-voluntary-reports-count)).

## The US Framework

The Stored Communications Act (18 U.S.C. 2701 to 2713, part of the Electronic Communications Privacy Act) governs what a provider of electronic communication or remote computing services to the public may disclose and what the government can compel. Its structure is a ladder: the more revealing the data, the stronger the process the government needs.

| Data | Example on a platform | Minimum process to compel | Statute |
| --- | --- | --- | --- |
| **Basic subscriber information** | Name and address, session times and durations, length of service and types of service used, subscriber number or identity (including an assigned IP address), means and source of payment | Administrative, grand jury or trial subpoena | 2703(c)(2) |
| **Other non-content records** | Login history, account preferences, communication headers such as the participant list of a chat | Court order on "specific and articulable facts showing that there are reasonable grounds to believe" the records are "relevant and material to an ongoing criminal investigation" | 2703(c)(1), 2703(d) |
| **Contents** | Posts, comments, messages, chats, votes, uploaded files | Warrant (always for content in electronic storage 180 days or less, and in practice for all content) | 2703(a), (b) |
| **Ongoing collection** | Future IP logs and headers for a defined period | Pen register and trap and trace order; never content | Pen Register Act |

Reddit's report spells out how this lands on a community platform: subpoenas can compel email, IP addresses, phone number and payment information; court orders add non-content records like preferences and chat participant lists; warrants add posts, comments, chats and votes. Google's policy gives the same ladder (subpoena for subscriber information and certain IP addresses, court order for non-content records such as email headers, warrant for content). The ladder is why the request's legal type must be captured at intake and checked against the categories requested before anything is produced.

What a platform adds to the statute:

- **Voluntary disclosure is mostly forbidden.** Section 2702(a) bars a public provider from knowingly divulging contents, and records to a government entity, except under listed exceptions. A request "on letterhead" with no process is a request to break the law, unless it's an emergency or the user consented.
- **Emergencies are an exception, not a process.** A provider *may* disclose contents (2702(b)(8)) or records (2702(c)(4)) to a government entity if it "in good faith" believes an emergency involving "danger of death or serious physical injury to any person" requires disclosure without delay. It's discretionary, which means the platform owns the judgment and must record why it formed the belief.
- **Preservation is mandatory and narrow.** On a government request, a provider "shall take all necessary steps to preserve records and other evidence in its possession pending the issuance of a court order or other process," for 90 days, extendable by another 90 on a renewed request (2703(f)). As Reddit puts it, preservation copies what's in the account when the request arrives; it can't compel capture of future data, and nothing is disclosed until valid process follows.
- **Nondisclosure orders are court orders.** Under 2705(b) a court can order a provider not to notify anyone of a warrant, subpoena or order if notice would endanger life or safety, lead to flight, destruction of evidence or witness intimidation, or otherwise seriously jeopardize an investigation, "for such period as the court deems appropriate." A request that merely asks for confidentiality isn't an order; Discord requires U.S. authorities to cite the statute or submit a 2705(b) order "with a finite duration," and Reddit pushes back on orders with no expiration and once found the cited grounds rendered an order invalid.
- **Costs can be recovered.** A government entity obtaining information under 2702, 2703 or 2704 pays the provider's reasonable costs of searching, collecting and producing it (2706); Discord says it may seek reimbursement.
- **Data abroad is still reachable.** The CLOUD Act's 2713 requires providers to produce data in their possession, custody or control "regardless of whether such communication, record, or other information is located within or outside of the United States."
- **Civil litigants can't get content.** The SCA's bar on divulging contents has no civil discovery exception: *O'Grady v. Superior Court* (2006) held that "the Act makes no exception for civil discovery" and quashed civil subpoenas for a user's email. Private parties can subpoena non-content records, and platforms review those too: Reddit disclosed information in response to 9% of 35 private-party requests in the second half of 2025, and notified 17 users before producing.

National security letters and FISA orders exist on the same ladder (Google lists both), and the law allows reporting them only in ranges, which is why Pinterest reports national security requests as "0 to 249." Their handling is a counsel-only path and isn't covered further here.

## International Requests

A foreign police force that wants data held by a US platform has three routes:

1. **Mutual legal assistance.** The foreign government asks the US government under a treaty; US prosecutors obtain US process; the platform responds to US process. It's slow, and Reddit's report treats MLAT requests as US requests with the same scrutiny and notice. Four of Reddit's requests in the second half of 2025 cited an MLAT.
2. **Direct requests under local law.** Platforms decide case by case whether to answer a foreign request directly where US law permits; Discord says it may, at its discretion, answer valid requests authorized by the requesting country's law. Google answers foreign requests to Google LLC only where consistent with US law, the requesting country's due process, the Global Network Initiative principles and its own policies. Discord routes EEA users' data through Discord Netherlands B.V. and asks for a European Investigation Order where possible.
3. **CLOUD Act executive agreements.** The CLOUD Act (March 2018) lets the US conclude agreements under which a partner's authorities send orders directly to US providers for serious crime, and providers may answer without the US-law barrier. The US-UK agreement entered into force on October 3, 2022, and the US-Australia agreement at the end of January 2024 (announced in Washington on January 30). According to BSA's April 2025 review, the Australian agreement is limited to offenses punishable by at least three years' imprisonment, both agreements expire after five years unless renewed, and the UK had sent more than 20,000 orders to US companies, a figure it attributes to a Justice Department report to Congress. Reddit received its first order under the Australian agreement in December 2025, in a child sexual abuse material investigation, and disclosed.

### The EU's E-Evidence Regulation

From August 18, 2026, Regulation (EU) 2023/1543 lets a judicial authority in one member state send a European Production Order or European Preservation Order directly to a service provider's representative in another. It reaches providers that let people in a member state use the service and have a "substantial connection" to at least one member state (an establishment, a significant number of users, or targeting through language, currency, advertising or customer service), wherever the provider is based; Denmark doesn't apply it. The duties a platform builds for:

- **A designated addressee.** Providers offering services in the EU on February 18, 2026 had to designate an establishment, or appoint a legal representative if not established in the EU, by August 18, 2026, and notify it to the central authority of the member state concerned, whose details are published on a European Judicial Network page; a provider that starts later has six months (Directive (EU) 2023/1544).
- **Clocks.** A production order must be answered within **10 days**, and an emergency one "without undue delay and in any event within eight hours." A preservation order holds data for **60 days**, extendable by **30** to allow a production request to be issued, and longer once one has been.
- **Data categories.** Subscriber data, data requested only to identify the user (such as IP addresses), traffic data and content data, each with its own conditions.
- **Penalties.** Member states set penalties of up to 2% of worldwide annual turnover for breaches of production, preservation and confidentiality duties.

Eight hours is shorter than most platforms' on-call escalation path for anything that isn't an outage. A platform in scope needs an always-staffed legal response rota, the eight-hour and ten-day deadlines computed at receipt, and production tooling that a single reviewer can run without an engineer.

## Fraud and Verification

Fake requests are an industry-wide attack. The FBI warned US companies in November 2024 that criminals were using compromised US and foreign government email accounts to send fraudulent emergency data requests, and that criminal forums showed a rise in posts about the technique and in sales of stolen police credentials. Reddit identified nine fraudulent emergency requests in the second half of 2025 (five purporting to be US law enforcement), two inauthentic orders from abroad, and fake removal requests including three purporting to come from Italian law enforcement through a compromised email domain and one impersonating Australia's eSafety Commissioner with a forged court order; it rejected each and reported it. The emergency path is the target because, as Reddit says, emergency requests "neither follow a standard format nor include the same level of oversight as formal legal process."

The controls:

- **A portal with verified requesters.** Discord accepts requests only through its portal, with a government email domain and identity and agency verification. A portal turns "an email that looks official" into an account with history.
- **Out-of-band confirmation for emergencies.** Call the agency back on a number found independently (not the one in the request), and confirm the officer and the case. Reddit says it may validate the identity of the official seeking data.
- **Ask what the emergency is.** Discord asks the requester to describe the emergency, the data needed and how it will help; a request that can't answer is either not an emergency or not real.
- **Minimum disclosure.** Produce the least data that addresses the emergency (Reddit discloses "limited account information"), and require follow-up process for anything more.
- **Report fakes** to the impersonated agency and to authorities, and count them ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#what-the-voluntary-reports-count)).

## User Notice

Telling users that their data was requested is the default at every platform surveyed, because it lets them get a lawyer and challenge the request before production. The exceptions are the same everywhere: a court order prohibits notice (until it expires), an emergency (notify afterwards), child safety matters, and a hijacked or disabled account (Google). Reddit notified 241 account holders about government requests in the second half of 2025, and Pinterest notified 6 of 141 US accounts identified in requests.

The data model consequence, already set in [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds): a preservation or a request under a nondisclosure order must be invisible to the user it concerns, including in a data access export and in support tools, until the order lapses, and then notice is sent. Notice isn't a one-time decision at intake; it's a scheduled job keyed to the order's end date.

## Privacy Rights Against Evidence

A user's privacy rights and a request's holds meet in four places:

- **Erasure.** A user can ask for deletion while a preservation request or litigation hold covers their account. GDPR Article 17(3) excepts processing needed "for compliance with a legal obligation" and "for the establishment, exercise or defence of legal claims," and US preservation is a legal obligation. The erasure job skips records under a `legal_holds` row in force and erases the rest, as [Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records) describes; when the hold ends, it runs again.
- **Access.** A data access request returns the user's data; Article 23 lets EU or member state law restrict rights to protect the "prevention, investigation, detection or prosecution of criminal offences," and US nondisclosure orders forbid revealing the request. The export excludes holds and request records flagged for no notice ([Data Subject Rights](/docs/compliance/gdpr#data-subject-rights)). Reddit received 33,135 access requests in the second half of 2025, which shows the two flows run at comparable scale.
- **Retention limits.** Data the platform doesn't keep can't be produced: Reddit says it collects and retains limited information by default, and preservation can't recreate data already gone. A short retention period for IP logs is a privacy decision with law enforcement consequences, and the retention schedule should say so ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).
- **Who holds the data.** The entity that controls the data decides which law governs a request (Google LLC under US law, Google Ireland under Irish and EU law; Discord Netherlands B.V. for the EEA). The controller is a property of the account's data, recorded where the user is served from.

## The Operating Model

1. **Intake.** One channel (a portal, or a verified address for requesters without access), with the requester's identity, agency, jurisdiction, case number and the legal document as a non-editable file. Each request gets a reference the requester must quote on follow-ups (Discord's preserved-data reference is the pattern).
2. **Classify.** Process type (subpoena, 2703(d) order, warrant, pen register order, preservation, emergency, MLAT, CLOUD Act order, European Production or Preservation Order, civil subpoena, nondisclosure order), issuing country and authority, data categories requested, and deadlines computed and stored at receipt ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
3. **Verify.** The requester, and for emergencies the emergency.
4. **Resolve identifiers.** The request names a handle, an email, a phone number, a message link or a community; resolve each to account ids as of the date in question (handles change: [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#auditing) keeps every handle an account has held).
5. **Preserve first.** Place `legal_holds` on the named accounts' records before review completes, with notice suppressed if the requester or law requires.
6. **Legal review.** Is the process valid, issued by an authority with power over the platform, sufficient for the data categories requested, narrow enough? Object, narrow or reject where it isn't; Reddit objected to subpoenas aimed at protected speech and the requests were withdrawn.
7. **Produce.** Extract only the approved categories for the approved date range, from source systems, by a reviewed job rather than ad hoc queries; package with a manifest and SHA-256 hashes so the recipient can verify integrity; deliver through the portal; record exactly what was sent.
8. **Notify the user** unless prohibited, and schedule notice for when a prohibition ends.
9. **Close and count:** the request's outcome feeds the transparency report and cost recovery.

![The legal request operating model as nine steps in two rows. Row one: 1 intake, one channel with the document kept uneditable; 2 classify, process type and data categories, due in 8 hours or 10 days under the EU regime; 3 verify, the requester and, for emergencies, the emergency; 4 resolve identifiers to accounts as of the date; 5 preserve, accented, a hold before review of 90 days plus 90 in the US or 60 days plus 30 in the EU. A connector turns down to row two: 6 legal review, asking whether the process is valid, sufficient and narrow enough; 7 produce, approved categories with a hashed manifest; 8 notify the user unless prohibited, scheduled for later when it is; 9 close and count, the terminal step, for the transparency report and cost recovery. Footnotes say a request that fails verification closes as fraudulent, reported and counted, and review can object, narrow or reject, while a preservation discloses nothing until valid process follows.](/diagrams/ugp-law-enforcement-requests-pipeline.svg "Preservation comes before review because the clocks start at receipt: 90 days, extendable by 90, under 18 U.S.C. 2703(f), and 60 days, extendable once by 30, under the EU's e-evidence rules. Disclosure waits for valid process and legal review.")

The people who run this see the most sensitive data on the platform. Give them a dedicated tool with reasoned, logged access in the [Support Access & Internal Tools](/docs/security/support-access) model, and never production database credentials.

## How to Build It

The chapter adds legal requests, the identifiers they name, and productions, and uses `legal_holds` from [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it) for preservation. A legal request asks the platform to preserve or disclose data about users; an order to remove or disable content is a `legal_notices` row from [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#how-to-build-it), and a regulator's information request about the service itself is a `regulator_requests` row from [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#how-to-build-it). A court order that does both gets a row in each, linked.

```sql
CREATE TABLE legal_requests (            -- one request from an authority or a private party
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  reference          TEXT NOT NULL UNIQUE,  -- ours; requesters quote it
  requester_kind     TEXT NOT NULL CHECK (requester_kind IN ('law_enforcement', 'court',
                       'prosecutor', 'regulator', 'private_party')),
  requester_agency   TEXT NOT NULL,
  requester_contact  TEXT NOT NULL,      -- verified identity, not just the From address
  country            CHAR(2) NOT NULL,   -- issuing jurisdiction
  process_type       TEXT NOT NULL CHECK (process_type IN ('subpoena', 'court_order_2703d',
                       'search_warrant', 'pen_register', 'preservation_2703f', 'emergency',
                       'mlat', 'cloud_act_order', 'eu_production_order',
                       'eu_preservation_order', 'foreign_direct', 'civil_subpoena',
                       'national_security')),
  data_categories    TEXT[] NOT NULL,    -- 'subscriber', 'identification', 'non_content', 'content'
  responding_entity  TEXT NOT NULL,      -- which legal entity holds the data
  received_at        TIMESTAMPTZ NOT NULL,
  due_at             TIMESTAMPTZ,        -- 8 hours, 10 days, the date on the process
  verification       TEXT NOT NULL CHECK (verification IN ('portal_verified', 'callback',
                       'court_record', 'unverified', 'failed')),
  emergency_basis    TEXT,               -- why we believed death or serious injury was at risk
  nondisclosure_until TIMESTAMPTZ,       -- from a 2705(b) or equivalent order; null if none
  nondisclosure_indefinite BOOLEAN NOT NULL DEFAULT FALSE,  -- challenged, not accepted silently
  status             TEXT NOT NULL CHECK (status IN ('received', 'in_review', 'narrowed',
                       'produced', 'partially_produced', 'rejected', 'withdrawn',
                       'fraudulent')),
  legal_reviewer_id  UUID REFERENCES accounts (id),
  legal_notice_id    UUID REFERENCES legal_notices (id),  -- the same process also orders removal
  closed_at          TIMESTAMPTZ,
  CHECK (process_type <> 'emergency' OR emergency_basis IS NOT NULL OR status <> 'produced')
);

CREATE TABLE legal_request_subjects (    -- what the request named, and what it resolved to
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_request_id  UUID NOT NULL REFERENCES legal_requests (id),
  identifier_kind   TEXT NOT NULL CHECK (identifier_kind IN ('account_id', 'handle', 'email',
                      'phone', 'content_url', 'community', 'ip_address', 'payment_ref')),
  identifier        TEXT NOT NULL,       -- as written in the request
  as_of             TIMESTAMPTZ,         -- the date the request is about; handles change
  account_id        UUID REFERENCES accounts (id),  -- null: no match
  legal_hold_id     UUID REFERENCES legal_holds (id),
  user_notified_at  TIMESTAMPTZ,
  notice_due_at     TIMESTAMPTZ          -- when an order lapses; the notice job reads this
);

CREATE TABLE legal_request_productions ( -- exactly what left the platform
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_request_id  UUID NOT NULL REFERENCES legal_requests (id),
  subject_id        UUID NOT NULL REFERENCES legal_request_subjects (id),
  data_category     TEXT NOT NULL,
  date_range        TSTZRANGE NOT NULL,  -- the period the produced records cover
  manifest_sha256   BYTEA NOT NULL,      -- the package as delivered
  approved_by       UUID NOT NULL REFERENCES accounts (id),
  produced_by       UUID NOT NULL REFERENCES accounts (id),
  delivered_via     TEXT NOT NULL CHECK (delivered_via IN ('portal', 'secure_transfer',
                      'physical')),
  delivered_at      TIMESTAMPTZ NOT NULL,
  cost_recovered    BIGINT,              -- minor units, under 2706 or local law
  CHECK (approved_by <> produced_by)
);
```

Notes on the sketch:

- **Process type gates categories.** A check in the production job (and a constraint where practical) refuses `content` unless the process is a warrant, a CLOUD Act or European production order covering content, or an emergency with a recorded basis; `subscriber` alone for a subpoena. The ladder lives in data, keyed by country and process type, because it differs by jurisdiction ([Rules as Data](/docs/architecture/rules-as-data)).
- **Preservation is a hold.** A preservation request creates `legal_holds` rows with reason `preservation_request` for each resolved subject's records, with `valid_during` set to 90 days (or 60 under the EU regime) and extended on renewal; the erasure job skips them, and expiry releases them unless process arrived ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it)).
- **Notice is scheduled.** `nondisclosure_until` sets the hold's `notify_user = false` and each subject's `notice_due_at`; a [background job](/docs/architecture/background-jobs) sends notices when they come due, and indefinite orders are flagged for counsel to challenge, as Discord and Reddit do.
- **Identifiers resolve as of a date.** A handle in a request maps through `account_handles` history to the account that held it at the time, and an unmatched identifier is recorded, not dropped, so the response can say "no such account."
- **Two people per production.** The approver and the producer differ, and every package is hashed, so a court can confirm what was delivered and an internal review can see who decided.
- **Fraud is a status.** A request found fraudulent is closed as `fraudulent` with the verification that failed, reported, and counted.
- **Events:** `legal_request.received`, `legal_request.due_soon`, `legal_request.produced`, `legal_request.rejected` and `user_notice.due` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the legal team's queue, the hold service and the notification service.

## Auditing

- **Every request,** with its document, verification, classification, deadline and outcome, kept beyond the investigation because the platform may need to show why it disclosed or refused.
- **Every production,** exactly as delivered (categories, date range, manifest hash), with the approver and producer.
- **Every emergency disclosure's basis,** written at the time: the good-faith belief is the legal defense.
- **Every hold** created by a request, and when and why it was released.
- **Every user notice,** sent or suppressed, with the order that suppressed it and its end date.
- **Every access** by the legal response team to user data, logged as [Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes) requires.

## What This Means for the System You Build

- **Map process type to data category** and enforce it in the production tooling, per jurisdiction.
- **Preserve on receipt** with `legal_holds`, and let preservation lapse on schedule unless renewed or followed by process.
- **Treat emergency requests as the high-risk path:** verify the requester out of band, record the basis, disclose the minimum.
- **Accept requests through a verified portal** and count, report and reject fraudulent ones.
- **Notify users by default,** suppress only under an order with an end date, and schedule the notice for when it lapses.
- **Keep holds and requests out of the user's own exports** while a nondisclosure order runs.
- **Staff for eight hours** if the EU e-evidence regime reaches you, with a registered addressee and computed deadlines.
- **Know which legal entity controls each user's data,** because it decides whose law answers the request.
- **Produce from reviewed jobs with hashed manifests** and two people, never ad hoc queries.
- **Set retention for logs deliberately,** knowing it decides what can ever be produced.

## References

**Law**

- [18 U.S.C. 2702: Voluntary disclosure of customer communications or records](https://www.law.cornell.edu/uscode/text/18/2702), the prohibitions, emergency disclosure of contents and records, disclosure to NCMEC and to non-government persons
- [18 U.S.C. 2703: Required disclosure of customer communications or records](https://www.law.cornell.edu/uscode/text/18/2703), warrants for content, the subpoena list, the 2703(d) standard, 90-day preservation and extension
- [18 U.S.C. 2705: Delayed notice](https://www.law.cornell.edu/uscode/text/18/2705), 90-day delayed notice and preclusion of notice orders
- [18 U.S.C. 2706: Cost reimbursement](https://www.law.cornell.edu/uscode/text/18/2706), reasonable costs paid by the government entity
- [18 U.S.C. 2713: Required preservation and disclosure regardless of location](https://www.law.cornell.edu/uscode/text/18/2713), the CLOUD Act's extraterritorial reach
- [O'Grady v. Superior Court, 139 Cal. App. 4th 1423 (2006) (opinion text via FindLaw)](https://caselaw.findlaw.com/ca-court-of-appeal/1025400.html), no civil discovery exception in the Stored Communications Act and the quashed subpoenas
- [Regulation (EU) 2016/679 (GDPR)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679), Article 17(3) (the legal obligation and legal claims exceptions to erasure) and Article 23 (restrictions of rights for criminal investigations)

**International**

- [US Department of Justice: CLOUD Act resources](https://www.justice.gov/criminal/cloud-act-resources), enactment, purpose, the UK and Australia agreements and negotiations
- [US Department of Justice: Landmark US-UK Data Access Agreement enters into force](https://www.justice.gov/archives/opa/pr/landmark-us-uk-data-access-agreement-enters-force), the October 3, 2022 entry into force
- [US Department of Justice: Joint statement announcing entry into force of the US-Australia Data Access Agreement](https://www.justice.gov/archives/opa/pr/joint-statement-us-attorney-general-merrick-b-garland-and-australia-attorney-general-mark), January 30, 2024
- [BSA: Seven years of the CLOUD Act](https://techpost.bsa.org/2025/04/04/seven-years-of-the-cloud-act-how-its-modernizing-access-to-digital-evidence/), the serious crime threshold, five-year terms and UK order volume (reported)
- [Regulation (EU) 2023/1543 (e-evidence)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R1543), application from August 18, 2026, substantial connection, Denmark's non-participation, the 10-day and 8-hour deadlines, 60-day preservation and the 30-day extension, penalties up to 2% of worldwide turnover
- [Directive (EU) 2023/1544 (designated establishments and legal representatives)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023L1544), designation by August 18, 2026 for providers offering services on February 18, 2026, six months for later entrants, notification to central authorities

**Platform documentation**

- [Discord: Working with law enforcement](https://discord.com/safety/360044157931-working-with-law-enforcement), the portal and verification, emergency requests, 90-day preservation, user notice and 2705(b), EEA requests, cost reimbursement
- [Google: How Google handles government requests for user information](https://policies.google.com/terms/information-requests?hl=en), review and narrowing, user notice and exceptions, emergency disclosure, process types, requests from outside the US

**Transparency reports**

- [Reddit: Transparency Report, July to December 2025 (PDF, copy hosted by TorrentFreak)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), request volumes and disclosure rates, process types and data, user notice, MLAT and CLOUD Act requests, emergency, fraudulent, preservation, private-party and access requests
- [Discord: Transparency Report, March 2025 to March 2026 (PDF)](https://cdn.discordapp.com/assets/transparency-reports/Discord-Transparency-Report-2026-Updated.pdf), emergency, preservation and international requests by country
- [Pinterest: Transparency report, July to December 2025](https://policy.pinterest.com/en/transparency-report), US and international requests, process types, user notice, national security ranges

**In practice**

- [FBI: Private Industry Notification 20241104-001 (PDF)](https://www.ic3.gov/CSA/2024/241104.pdf), the November 4, 2024 alert on fraudulent emergency data requests from compromised government email accounts and criminal forum activity
