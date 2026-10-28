+++
title = "Domain Disputes"
description = "The UDRP and URS, court orders and the ACPA, transfer disputes under the TDRP, and the locks, deadlines and implementations a registrar owes each one."
category = "Hosting & Cloud Industry"
order = 2167
part = "Domains and DNS"
tags = ["domains", "udrp", "urs", "trademarks", "courts", "icann"]
+++

A registrar doesn't decide who should own a domain name. Every gTLD registration agreement incorporates ICANN's Uniform Domain Name Dispute Resolution Policy, so a trademark owner who thinks a name was registered to exploit its mark files with a dispute provider, a panel decides, and the registrar implements: it locks the name, hands the provider the registration data, waits out the deadlines, and transfers or cancels the name when the decision says so. Courts reach the name the same way, through orders the registrar must obey without being a party; the URS reaches it through the registry; and when two registrars disagree about a transfer, the Transfer Dispute Resolution Policy decides between them.

The registrar's part is procedural and unforgiving. The UDRP Rules give it two business days to lock the name and answer the provider, forbid it to tip off the registrant before the lock is on, require it to wait ten business days after a decision for a court challenge, and expect it to implement on the eleventh. A US court can sue the name itself in the registrar's home district, and the statute that allows it forbids the registrar to transfer, suspend or modify the name while the case is pending. Getting these wrong isn't a policy debate; it's a compliance notice from ICANN or a sanctions motion from a court. This chapter covers how the dispute systems work, who uses them and how much, the four kinds of proceeding a registrar faces, and the records it needs to show it did what each one required.

## How the Providers Do It

Registrars publish their dispute handling as a short statement of neutrality plus an address for legal documents. As of October 2026, from each one's own pages:

| Provider | What it says it does | Court orders | Registration data in disputes |
| --- | --- | --- | --- |
| **GoDaddy** | Complaints can be filed under the UDRP; .BR and .IN names follow their registries' policies; when it's only the registrar it "may be unable to respond to an intellectual property complaint" | "Will comply with any order issued by a court of competent jurisdiction" about a domain, whether or not it's named; orders go to a dedicated court disputes address | Released without the customer's permission only under legal requirements, with a valid subpoena for civil or criminal matters |
| **Namecheap** | "Complies with the UDRP" and republishes the policy as part of its legal terms | All US court orders and subpoenas, at its legal address; non-US orders reviewed case by case and, where it isn't subject to the court, under its balancing test; English or a certified translation | Not needed to file a UDRP; provided once a case is filed, directly to the provider, on its request |
| **Tucows** | A separate page for UDRP complaint submissions | "Will comply with any Order issued by a court of competent jurisdiction"; need not be named; orders must name the domains and the action; accepts court documents from Canada, Denmark, Germany and the US, with translation rules | Through its subpoena and warrant policy |
| **Cloudflare Registrar** | "Will not intervene in domain name disputes" until "the dispute resolution expert" instructs it; points to the UDRP and, for new TLDs, the URS | Not covered on its abuse page | Not covered on its abuse page |
| **IONOS** | "Will not attempt to determine whether a particular domain name infringes on a trademark"; disputes go through the UDRP or other policies | Not covered on its dispute page | Not covered on its dispute page |
| **UDRP providers** | ADNDRC, CIIDRC, the Czech Arbitration Court, Forum (NAF) and WIPO are approved | Not applicable | Receive the full registration data from the registrar within two business days of their verification request |

The shared position is neutrality plus obedience: no registrar will judge a trademark claim, every one will implement a panel decision or a competent court's order, and the published pages exist mostly to route complainants away from the [abuse desk](/books/hosting-and-cloud/abuse-on-infrastructure) and toward a provider or a court. What they don't publish is the part that carries the risk: how fast they answer a verification request, how they keep a name from moving while it's locked, and who watches the ten-day window. That is the registrar's own system.

## How It Got Here

**1999: the UDRP and the ACPA.** ICANN adopted the UDRP on 26 August 1999 and approved its implementation documents on 24 October 1999, giving trademark owners a mandatory administrative proceeding against registrants that every accredited registrar's agreement would incorporate. It solved cybersquatting at internet speed and price, outside any one country's courts, and limited the remedy to cancellation or transfer. The same year, the US Anticybersquatting Consumer Protection Act (Pub. L. 106-113) added 15 U.S.C. § 1125(d): civil liability for registering, trafficking in or using a domain name with "a bad faith intent to profit" from a mark, and an in rem action against the name itself where the registrant can't be found or sued. Between them, trademark owners got a cheap forum and a court that could reach anonymous foreign registrants, and registrars got obligations to both.

**2004: transfers get their own dispute policy.** The Transfer Dispute Resolution Policy came with the Inter-Registrar Transfer Policy, in effect from 12 November 2004, with ADNDRC and the National Arbitration Forum approved as providers that November. It lets one registrar challenge another's handling of a transfer; it doesn't let a registrant file.

**2013: the URS.** The Uniform Rapid Suspension System, built for the new gTLD program, took effect with its procedure on 1 March 2013: a faster, cheaper route for "the most clear-cut cases of infringement", decided on clear and convincing evidence, with suspension as the only remedy.

**2015: the lock is defined.** Revised UDRP Rules, approved by ICANN's Board on 28 September 2013 and applying to complaints filed from 31 July 2015, defined the "Lock" and gave registrars two business days to apply it and confirm, so locking became a deadline the provider could hold a registrar to.

**2024 to 2025: rewritten for redacted data.** ICANN republished the UDRP, the Rules, the URS documents and the TDRP on 21 February 2024 to fit the Registration Data Policy (the registrar now supplies "full Registration Data" to the provider, and complainants may file against an unidentified respondent), with implementation required by 21 August 2025.

**2024 to 2026: record volume.** WIPO received 6,168 cases in 2024 from trademark owners in 133 countries, its second busiest year, and "over 6,200" in 2025, its highest annual caseload, bringing it past 80,000 cases in 25 years (over 70,000 gTLD and nearly 10,000 ccTLD). The ccTLDs most often in its 2025 filings were .co, .au, .ai, .cn, .io, .mx, .cc, .es, .nl and .se, and complainants came mostly from the US, France and the UK. The Transfer Policy Review, adopted by the Board on 7 June 2026, asked the GNSO to study opening the TDRP to registrants or creating a new mechanism for stolen names (Recommendation 33).

## The UDRP

**What a complainant must prove.** All three of paragraph 4(a): the domain name is "identical or confusingly similar to a trademark or service mark in which the complainant has rights"; the registrant has no rights or legitimate interests in it; and it "has been registered and is being used in bad faith". Paragraph 4(b) lists four circumstances that are evidence of bad faith (registering to sell to the mark owner or a competitor for more than documented out-of-pocket costs; a pattern of registering to block mark owners; registering to disrupt a competitor; using the name to attract users for commercial gain by confusion with the mark). Paragraph 4(c) lists three ways to show legitimate interests (bona fide use or preparations before notice of the dispute; being commonly known by the name; legitimate noncommercial or fair use).

**The remedies.** Cancellation or transfer to the complainant, nothing else (4(i)): no damages, no injunction, no costs. A complainant that wins doesn't get money, and a registrant that wins doesn't get the complainant's fees.

**The procedure and its clocks.** A complainant files with an approved provider and pays. The provider sends the registrar a verification request that includes a request to lock (Rules 4(a)); the registrar has two business days to provide the full registration data and confirm the lock (4(b)). The provider checks the complaint for administrative compliance and, if it complies, forwards it to the respondent within three calendar days of receiving the fees; a deficient complaint gets five calendar days to be fixed (4(c), 4(d)). The respondent has 20 days to respond (5(a)). The provider appoints a panel within five calendar days of the response or its deadline, and the panel decides within 14 days of appointment, absent exceptional circumstances (6, 15(b)). Within three business days of receiving the decision the provider sends it to the parties, the registrar and ICANN, and the registrar must communicate its implementation date within three business days of receiving it (16(a)).

**The wait.** If the decision orders cancellation or transfer, the registrar waits ten business days after the provider's notice, then implements unless, within that time, the registrant provides "official documentation" (such as a complaint "file-stamped by the clerk of the court") of a lawsuit against the complainant in a jurisdiction the complainant submitted to (Policy 4(k)). If it does, the registrar holds the decision until the parties resolve it, the suit is dismissed or withdrawn, or a court rules. ICANN Compliance accepts a complaint about non-implementation only after a decision exists and that ten-business-day window has passed.

**The freeze.** During a pending proceeding and for 15 business days after it concludes, the registrant may not transfer the registration to another holder (Policy 8(a)) or to another registrar (8(b)), and the Transfer Policy requires the registrar to deny a transfer for a UDRP proceeding it has been told about (I.A.3.8.1). During a court action or arbitration, a registrar change is allowed but the name stays subject to the proceeding; a holder change requires the new holder to agree in writing to be bound.

**Ending early.** A complaint the provider dismisses as deficient, or the complainant withdraws, releases the lock within one business day of the provider's notice (Rules 4(e)). A settlement suspends the proceeding, the parties file a standard settlement form, the provider tells the registrar what to do, and the registrar removes the lock within two business days of the provider's notice once the settlement is implemented (17(a)(v)).

## The URS

The URS runs through the registry, not the registrar, and its only remedy is suspension:

- **Lock.** Once a complaint passes administrative review, the provider notifies the registry, which must lock the name within 24 hours: all changes to the registration data, including transfer and deletion, are restricted, but "the name will continue to resolve" (URS Procedure 4.1). The provider notifies the registrant within 24 hours of the registry's notice of lock (4.2).
- **Response and standard.** The registrant has 14 calendar days to respond (5.1). The complainant must show the same three elements as the UDRP, and "the burden of proof shall be clear and convincing evidence" (8.2); any genuine contestable issue means the complaint is denied (8.5).
- **Determination.** Examination starts when the response arrives or the 14 days lapse, with a stated goal of a determination within three business days and no later than five days after the response, absent extraordinary circumstances (9.6). A registrant in default can still seek de novo review by filing a response up to six months after the notice of default (6.4).
- **Remedy.** The registry suspends the name "for the balance of the registration period", points its nameservers at the provider's informational page, and makes RDDS show that the name can't be transferred, deleted or modified for the life of the registration, while the registrant data stays as it was (10.2). The complainant may extend the registration for one additional year at commercial rates (10.3). "No other remedies" are available (10.4).
- **Appeal.** Either party may appeal de novo within 14 days of a determination; filing an appeal doesn't change whether the name resolves (12.3, 12.4).

ICANN lists ADNDRC, MFSD and Forum (NAF) as URS providers. For the registrar, the URS is mostly something that happens to its customer's name: the registry locks and suspends, the determination is sent to the registrar too (10.1), and the registrar's job is to show the customer why the name is frozen, deny any transfer while the URS is pending (Transfer Policy I.A.3.8.4), and process the complainant's one-year extension if it asks.

## Court Orders

A court can reach a domain name three ways, and the registrar's duty differs with each.

**An order against the registrant.** In an ordinary suit (an ACPA claim, a trademark or contract case), the court orders the registrant to transfer, or orders the registrar to act. The UDRP itself makes "an order from a court or arbitral tribunal, in each case of competent jurisdiction" one of the three things that changes a registration (Policy 3(b)), and the registrar must deny an inter-registrar transfer for a court order (Transfer Policy I.A.3.8.2). Registrars publish the practice: GoDaddy and Tucows comply with orders of courts of competent jurisdiction about a name without being named in the case, Tucows lists the countries whose courts it accepts documents from, and Namecheap complies with US orders and reviews others case by case.

**An in rem action against the name.** Under 15 U.S.C. § 1125(d)(2)(A), a mark owner may sue the domain name itself in the judicial district where the registrar, registry or other registration authority is located, if it can't get personal jurisdiction over a registrant or can't find one after notice to the registrant's listed address and publication. The name is deemed located there, or where the registrar deposits documents with the court ((d)(2)(C)). The remedies are forfeiture, cancellation or transfer ((d)(2)(D)(i)), and the registrar's duties start on receiving written notice of a filed, stamped complaint: it must expeditiously deposit with the court documents sufficient to establish the court's control and authority over the registration, and must "not transfer, suspend, or otherwise modify the domain name during the pendency of the action, except upon order of the court". A registrar is protected from damages and injunctions unless it acts in bad faith or with reckless disregard, including willful failure to comply with a court order ((d)(2)(D)(ii)).

The in rem freeze is where registrars get caught. In a pending District of Arizona in rem case over GreenbergGrossLLP.com, the judge found "ample evidence" that Namecheap violated its ACPA obligations after the name, under notice of the suit, expired on 31 July 2025 and was registered by a new customer on 9 September 2025 with privacy protection, and ordered Namecheap to show cause why it shouldn't be sanctioned, with responses due in October 2026, as reported by Domain Name Wire. The lesson is mechanical: "not modify" has to include not letting the name expire and drop, which means the registrar's lifecycle engine must know a name is under a court's control ([Grace Periods](/books/hosting-and-cloud/domain-lifecycle#grace-periods)).

**An order to the registry.** Because the registry is where the name actually lives, US courts in in rem cases also direct registries to transfer names, which is how a judgment reaches a name held at a foreign registrar that won't act. For the registrar, a registry-ordered transfer arrives as a change of sponsorship it didn't request, and its records should link it to the court's order rather than treat it as an anomaly. Orders that reach past the name to resolvers and CDNs are [Conduits, Caches & Blocking Orders](/books/hosting-and-cloud/conduits-caches-and-blocking-orders#blocking-orders-in-europe).

Court documents arrive at the legal team, not the abuse desk. Each is a `legal_notices` row from [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#legal-clocks) with its own clock, and each produces a `domain_disputes` row and a `domain_locks` row here. Orders to produce data rather than act on the name go to [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-operating-model).

## Transfer Disputes

The TDRP is a registrar-versus-registrar proceeding about whether a transfer followed the Transfer Policy. As of October 2026:

- **Who files.** Only the gaining or losing registrar (section 3.1.1). A registrant whose name was transferred without authority has to persuade its old registrar to file, or go to court.
- **When.** No later than 12 months after the alleged violation: from completion of the transfer for a losing registrar, from the registry's receipt of the denial for a gaining registrar (2.2).
- **Where.** An approved, independent provider: ADNDRC and Forum (NAF) are listed (1.4).
- **Remedies.** The panel approves or denies the transfer; a denial can return the name to the losing registrar, and an invalid transfer returns it to the registrar of record immediately before it (3.2.4). A decision waits 14 days before implementation, and a court filing in that window stops it (3.4); the registry must undo a transfer within 14 days of a dispute decision unless a court action is filed (Transfer Policy I.A.6.4).
- **During the dispute.** The losing registrar must deny any further transfer while a TDRP dispute is pending (Transfer Policy I.A.3.8.3).

The gap is the one the Transfer Policy Review named: a hijacker who takes over a registrant's account, changes its details and retrieves the code can produce a transfer that "may technically comply with the Transfer Policy", which the TDRP, focused on procedural violations, may not reach; ICANN Contractual Compliance "does not have the authority to reverse a transfer"; and court is expensive (Recommendation 33). In practice most wrongful transfers are fixed by the two registrars directly, through the emergency contact channel and an agreed transfer back, and the TDRP and courts are for the cases they can't settle. [Transfers, Locks & Registrar Security](/books/hosting-and-cloud/transfers-and-locks#the-transfer-flow) has the emergency channel and the registry undo.

## What the Registrar Must Do

| Proceeding | Trigger | Deadline | Registrar action | Release |
| --- | --- | --- | --- | --- |
| **UDRP** | Provider's verification request | Two business days (Rules 4(b)) | Apply the Lock (no change of registrant or registrar data; resolution and renewal unaffected); give the provider the full registration data; confirm; don't notify the respondent until locked | One business day after a withdrawal or dismissal (4(e)); two business days after a settlement notice (17(a)(v)); after implementation or a denial plus 15 business days for the freeze |
| **UDRP decision** | Provider sends the decision | Implementation date to parties within three business days (16(a)); implement after ten business days (Policy 4(k)) | Transfer or cancel, unless a file-stamped court complaint arrives in the window | When the court case resolves |
| **URS** | Registry's notice of lock (the registry acts within 24 hours) | None for the registrar | Deny transfers (Transfer Policy I.A.3.8.4); explain the frozen status to the customer; process a winning complainant's one-year extension | Registry, at the end of the registration period or on a successful appeal |
| **ACPA in rem** | Written notice of a filed, stamped complaint | "Expeditiously" | Deposit control documents with the court; do not transfer, suspend or otherwise modify the name, including by letting it expire | Court order |
| **Other court order** | Service of an order of a court of competent jurisdiction | As the order says | Act as ordered; deny inter-registrar transfers (I.A.3.8.2) | As the order says |
| **TDRP** | Notice of a pending dispute | Throughout | Deny further transfers (I.A.3.8.3); as a party, file or respond with the transfer records | Implement 14 days after the decision unless a court filing arrives (3.4) |

Four things make this work in practice:

- **A business-day calendar per proceeding.** The UDRP counts business days for the registrar and calendar days for the parties, the URS counts hours and calendar days, the TDRP calendar days. Deadlines are computed on receipt by a [rule with a version](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored) and stored, with the business-day calendar the provider and the registrar's own jurisdiction use.
- **The lock must hold against everything the registrar's own systems do.** The UDRP Lock prevents changes to registrant and registrar data; the in rem freeze prevents any modification. The Lock doesn't affect renewal, and letting a locked name lapse defeats the proceeding (the in rem case above), so a name under a UDRP or a court's control that is about to expire needs the lifecycle engine to hold it rather than drop it. Privacy reveals happen before the lock is confirmed, because the Rules let the panel address respondent data changes made after the two-day window.
- **Data goes to the provider, not the complainant.** Namecheap's statement is the policy: the full registration data goes to the provider on its request, and the complainant gets it through the proceeding. The version given is the one in force at the verification request, from `registrant_data` ([Registration Data & RDAP](/books/hosting-and-cloud/registration-data-and-rdap#how-to-build-it)).
- **Implementation is a transfer like any other.** Transferring to a complainant means moving the name into the complainant's account (a change of registrant made under the decision) or, if the complainant uses another registrar, releasing it for an inter-registrar transfer; cancelling means deleting it at the registry. Each is an EPP transaction linked to the decision, and ICANN's enforcement page is the backstop: a complainant whose decision wasn't implemented after the ten business days files a compliance complaint.

## The Alternatives: Which Route Reaches the Name

The routes side by side, from the complainant's side, as of October 2026:

| Route | Who files | Who decides | Standard | Remedy | Speed | Where it goes next |
| --- | --- | --- | --- | --- | --- | --- |
| **UDRP** | A mark owner | A panel at an approved provider | The three elements of paragraph 4(a) | Transfer or cancellation only | 20 days to respond, a decision 14 days after the panel is appointed, implementation after ten business days | A court, if the registrant files in the window |
| **URS** | A mark owner, in the new gTLDs | An examiner at a URS provider | The same three elements, by clear and convincing evidence; any genuine contestable issue defeats it | Suspension for the rest of the term, plus one optional year | Registry lock within 24 hours, 14 days to respond, a determination in about three to five business days | De novo appeal within 14 days |
| **ACPA in rem** | A mark owner that can't reach or find the registrant | A US district court where the registrar or registry sits | Bad faith intent to profit from the mark | Forfeiture, cancellation or transfer | A lawsuit's pace; the name is frozen while it runs | The ordinary appeal |
| **Other court order** | Any party with a claim a court will hear | The court | The claim's own law | Whatever the order says | A lawsuit's pace | The ordinary appeal |
| **TDRP** | The gaining or losing registrar only | An approved provider | Whether the transfer followed the Transfer Policy | Approve, deny or reverse the transfer | Filed within 12 months; implemented 14 days after the decision | A court, if filed in the 14 days |

The UDRP is the default because it moves the name at internet speed and price; the URS trades the transfer remedy for speed; the courts are for the cases the panels can't reach (an anonymous foreign registrant, liability beyond the name, a name a foreign registrar won't move); and the TDRP isn't a registrant's route at all, which is the gap the Transfer Policy Review asked the GNSO to study.

## My Default

My default is to treat every dispute notice as a legal clock with an owner and the lock as a system state, not a support task: a verification request opens a `domain_disputes` row, applies a `domain_locks` row of kind `udrp` that no customer or support agent can lift, answers the provider with the registrant version in force, and confirms, all within the same business day, well inside the two allowed. Decisions are implemented by a scheduled job on the first business day after the ten-day window unless a court filing is recorded, and in rem notices freeze the name against every mutation including expiry, with the renewal paid by the registrar if necessary. I wouldn't publish more opinion than GoDaddy or IONOS do about the merits of trademark claims; neutrality is the right posture for a registrar.

The tradeoff that would change it is volume. A registrar with a large portfolio of names held by domain investors will see many UDRPs that the registrant contests and many settlements, and there I'd add a customer-facing status page per proceeding and a settlement workflow (the parties' standard form, the provider's instruction, the two-day lock release) rather than handling each by email.

## How to Build It

The chapter adds `domain_disputes` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model): one row per proceeding against a name, whatever the forum. The lock it requires is a `domain_locks` row from [Transfers, Locks & Registrar Security](/books/hosting-and-cloud/transfers-and-locks#how-to-build-it), and court documents are UGP `legal_notices` rows.

```sql
CREATE TABLE domain_disputes (           -- one proceeding that constrains a name
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  domain_id              UUID NOT NULL REFERENCES domains (resource_id),
  kind                   TEXT NOT NULL CHECK (kind IN ('udrp', 'urs', 'acpa_in_rem',
                           'court_order', 'tdrp', 'cctld_policy')),
  forum                  TEXT NOT NULL,  -- 'wipo', 'forum', 'adndrc', 'ciidrc', 'cac', 'mfsd',
                                         -- or the court
  case_ref               TEXT NOT NULL,  -- provider case number or docket
  complainant            TEXT NOT NULL,
  our_role               TEXT NOT NULL CHECK (our_role IN ('registrar_of_record',
                           'losing_registrar', 'gaining_registrar')),  -- TDRP parties
  legal_notice_id        UUID REFERENCES legal_notices (id),  -- court documents as served
  received_at            TIMESTAMPTZ NOT NULL,  -- verification request, notice or service
  -- the registrar's first duties
  respond_due_at         TIMESTAMPTZ,    -- UDRP: two business days (Rules 4(b))
  lock_id                UUID REFERENCES domain_locks (id),
  lock_confirmed_at      TIMESTAMPTZ,
  registrant_data_id     UUID REFERENCES registrant_data (id),  -- the version given
  data_provided_at       TIMESTAMPTZ,
  deposit_filed_at       TIMESTAMPTZ,    -- ACPA (d)(2)(D)(i)(I): control documents
  registrant_notified_at TIMESTAMPTZ,    -- by the registrar; never before the lock is confirmed
  -- the outcome
  status                 TEXT NOT NULL CHECK (status IN ('open', 'suspended_for_settlement',
                           'decided', 'withdrawn', 'dismissed', 'settled', 'closed')),
  decision               TEXT CHECK (decision IN ('transfer', 'cancel', 'suspend',
                           'complaint_denied', 'transfer_approved', 'transfer_reversed',
                           'as_ordered')),
  decision_received_at   TIMESTAMPTZ,
  implementation_date_sent_at TIMESTAMPTZ,  -- UDRP: within three business days (16(a))
  hold_until             TIMESTAMPTZ,    -- ten business days (Policy 4(k)); 14 days (TDRP 3.4)
  court_challenge_ref    TEXT,           -- the file-stamped complaint that stops implementation
  court_challenge_received_at TIMESTAMPTZ,
  implemented_at         TIMESTAMPTZ,
  implementation_txn_id  UUID REFERENCES epp_transactions (id),
  transfer_id            UUID REFERENCES domain_transfers (id),  -- to the complainant
  freeze_until           TIMESTAMPTZ,    -- UDRP 8: 15 business days after the conclusion
  closed_at              TIMESTAMPTZ,
  clock_rule_version     TEXT NOT NULL,  -- the deadline rules and business-day calendar used
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (kind, forum, case_ref, domain_id),
  CHECK (registrant_notified_at IS NULL OR
         (lock_confirmed_at IS NOT NULL AND registrant_notified_at >= lock_confirmed_at)),
  CHECK ((court_challenge_ref IS NULL) = (court_challenge_received_at IS NULL)),
  CHECK (kind <> 'acpa_in_rem' OR legal_notice_id IS NOT NULL),
  CHECK (implemented_at IS NULL OR decision IS NOT NULL),
  CHECK (implemented_at IS NULL OR court_challenge_ref IS NULL OR status = 'closed')
);

CREATE INDEX domain_disputes_open ON domain_disputes (respond_due_at, hold_until)
  WHERE closed_at IS NULL;

ALTER TABLE domain_locks
  ADD COLUMN dispute_id UUID REFERENCES domain_disputes (id),
  ADD CONSTRAINT domain_locks_dispute_kinds
    CHECK ((kind IN ('udrp', 'urs', 'court_order', 'tdrp')) = (dispute_id IS NOT NULL));

ALTER TABLE domain_transfers
  ADD CONSTRAINT domain_transfers_reversed_by_dispute
    FOREIGN KEY (reversed_by_dispute_id) REFERENCES domain_disputes (id);
```

Notes on the sketch:

- **One table, five forums.** A UDRP, a URS, an in rem suit, any other court order and a TDRP dispute all have a forum, a case reference, a lock, a decision and an implementation; the columns that apply to only one (the in rem deposit, the TDRP role) are nullable and checked by kind. A ccTLD's own dispute policy (Nominet's, for example) fits as `cctld_policy` with the registry's rules in the clock rule.
- **The order of operations is a constraint.** The registrar may not notify the registrant before the lock is confirmed, so the table makes it impossible to record it any other way, and the in rem kind can't exist without the served documents.
- **Clocks are stored with the calendar.** `respond_due_at`, `hold_until` and `freeze_until` are computed on receipt and decision by the versioned rule for that forum and the business-day calendar it uses, so an audit can show the deadline that applied and a public holiday doesn't move it silently.
- **The lock makes everything else safe.** A `domain_locks` row of a dispute kind is not registrant-removable, blocks transfers and registrant changes, and for in rem and court kinds blocks deletion too; the lifecycle engine treats a name with such a lock as one it must renew rather than release ([Redemption and Pending Delete](/books/hosting-and-cloud/domain-lifecycle#redemption-and-pending-delete)), and the release is recorded with `release_verified_via = 'proceeding_closed'` or `'court_order'`.
- **Implementation is linked, not inferred.** The EPP transaction that transferred or deleted the name, and the `domain_transfers` row that moved it to the complainant, point back here, so a compliance complaint about non-implementation is answered with the transaction and its date.
- **Data given is a version.** `registrant_data_id` is the version supplied to the provider at verification, so a later change by the registrant can't blur what the panel saw.
- **Events:** `dispute.received`, `dispute.locked`, `dispute.data_provided`, `dispute.decided`, `dispute.court_challenge_received`, `dispute.implemented`, `dispute.settled` and `dispute.closed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the lock and lifecycle workers, the legal team's queue, customer notifications and the EPP worker that implements.

## Auditing

- **Every deadline met or missed.** For each proceeding: received, locked, confirmed, data provided, implementation date sent, implemented, and the deadline each was measured against, because a provider or ICANN Compliance will ask about exactly those ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **The lock's effect.** That no registrant, registrar, deletion or expiry change happened to the name while a dispute lock was in force, shown by the absence of `epp_transactions` on it other than renewals.
- **What the provider received.** The registrant data version given, when, and to whom, and any privacy reveal before confirmation.
- **Court documents and their handling.** The served order, who reviewed it for competence and jurisdiction, the deposit with the court for in rem actions, and the action taken.
- **Every court challenge.** The file-stamped complaint received in a UDRP's ten-day window, and how the decision was held until the case resolved.
- **Implementation records.** The EPP transaction and transfer that carried out each decision, matched to the decision's date.

## What This Means for the System You Build

- **Treat a dispute as a legal clock with an owner,** opened on receipt and computed with the right calendar.
- **Lock within the business day,** confirm to the provider, and never tell the registrant before the lock is on.
- **Make dispute locks absolute** against transfers, registrant changes, deletion and expiry, removable only by the proceeding's end or a court.
- **Give providers the registrant version in force,** not today's, and only providers, not complainants.
- **Implement decisions on schedule** after the ten-business-day window unless a file-stamped court complaint arrives.
- **Obey competent court orders without being named,** and freeze in rem names completely while the suit is pending.
- **Settle wrongful transfers registrar to registrar first,** with the TDRP and courts as the backstop.
- **Stay neutral on the merits;** publish the routes, not opinions.

## References

**Policies and rules**

- [ICANN: Uniform Domain Name Dispute Resolution Policy (updated 21 February 2024)](https://www.icann.org/resources/pages/policy-2024-02-21-en), adoption on 26 August 1999 and implementation documents on 24 October 1999, cancellation and transfer grounds (3), the three elements, bad faith and legitimate interests (4(a) to 4(c)), remedies (4(i)), the ten-business-day wait (4(k)), transfers during a dispute (8), implementation by 21 August 2025
- [ICANN: Rules for Uniform Domain Name Dispute Resolution Policy (updated 21 February 2024)](https://www.icann.org/resources/pages/udrp-rules-2024-02-21-en), the Lock, verification and two business days (4(a), 4(b)), forwarding and deficiencies (4(c), 4(d)), release after withdrawal (4(e)), the 20-day response, panel appointment and 14-day decision, communication of the decision and implementation date (16(a)), settlement and lock removal (17(a)(v)), the unidentified respondent
- [ICANN: Rules for UDRP (2015 version)](https://www.icann.org/resources/pages/udrp-rules-2015-03-11-en), Board approval on 28 September 2013, applying to complaints from 31 July 2015
- [ICANN: Uniform Rapid Suspension](https://www.icann.org/resources/pages/urs-2014-01-09-en), purpose, the 2013 effective dates, the 21 February 2024 update, ADNDRC, MFSD and NAF
- [ICANN: URS Procedure (21 February 2024)](https://newgtlds.icann.org/sites/default/files/procedure-21feb24-en.pdf), registry lock within 24 hours (4.1), notice (4.2), 14-day response (5.1), default and de novo review (6.4), clear and convincing evidence (8.2, 8.5), determination timing (9.6), suspension, extension and no other remedies (10), appeals (12)
- [ICANN: Transfer Dispute Resolution Policy (2016 version)](https://www.icann.org/resources/pages/tdrp-2016-06-01-en), registrar filers (3.1.1), 12-month limit (2.2), provider independence (1.4), remedies (3.2.4), 14-day implementation wait (3.4), the 21 February 2024 update
- [ICANN: Transfer Policy (2016 version)](https://www.icann.org/resources/pages/transfer-policy-2016-06-01-en), required denials for UDRP, court orders, TDRP and URS (I.A.3.8), registry undo after a dispute decision (I.A.6.4)
- [GNSO Council: Transfer Policy Review Recommendations Report (31 March 2025)](https://gnso.icann.org/sites/default/files/policy/2025/draft/gnso-council-recommendations-report-to-icann-board-tpr-wg-31mar25-en.pdf), the IRTP's 12 November 2004 start, Recommendation 33 on TDRP access and stolen names
- [ICANN: Approved UDRP providers](https://www.icann.org/resources/pages/providers-6d-2012-02-25-en), ADNDRC, CIIDRC, the Czech Arbitration Court, Forum and WIPO
- [ICANN: TDRP providers](https://www.icann.org/en/help/dndr/tdrp/providers), ADNDRC and NAF
- [ICANN: Approves dispute resolution providers for the TDRP (November 2004)](https://www.icann.org/en/announcements/details/icann-approves-dispute-resolution-providers-for-transfer-dispute-resolution-policy-8-11-2004-en), the 2004 approval
- [ICANN Contractual Compliance: Enforcing the UDRP](https://www.icann.org/en/resources/compliance/complaints/dndr/enforcing-udrp), the two conditions for a non-implementation complaint

**Courts and statutes**

- [15 U.S.C. § 1125](https://www.law.cornell.edu/uscode/text/15/1125), subsection (d): bad faith intent to profit, factors, remedies, in rem jurisdiction and situs, the registrar's deposit and no-modification duties and its liability limits; added by Pub. L. 106-113 (1999)
- [Domain Name Wire: Namecheap ordered to explain why it shouldn't pay $50,000 in ACPA case (29 September 2026)](https://domainnamewire.com/2026/09/29/namecheap-ordered-to-explain-why-it-shouldnt-pay-50000-in-acpa-case/), the District of Arizona order to show cause, the expiry and re-registration dates, the October 2026 deadlines
- [Revision Legal: Cybersquatting enforcement and in rem proceedings](https://revisionlegal.com/internet-law/internet-lawyer/cybersquatting-enforcement-rem-proceedings/), judgments directing registries to transfer names

**Reporting**

- [WIPO: Domain name case filings 2025 (14 January 2026)](https://www.wipo.int/amc/en/domains/news/2026/news_0001.html), over 6,200 cases in 2025, over 80,000 in 25 years with the gTLD and ccTLD split, the top ccTLDs and complainant countries
- [WIPO: Domain name case filings 2024 (15 January 2025)](https://www.wipo.int/amc/en/domains/news/2025/news_0001.html), 6,168 cases from 133 countries, the second busiest year

**Providers**

- [GoDaddy: Complaint Mechanisms](https://www.godaddy.com/help/godaddy-complaint-mechanisms-40875), UDRP, court orders of competent jurisdiction, registry-specific policies, data release
- [Namecheap: Domain Registration Data Disclosure Policy and Guide (Wayback Machine capture, 20 October 2026)](https://web.archive.org/web/20261020164901/https://www.namecheap.com/legal/general/domain-registration-data-disclosure-policy-guide/), UDRP data to the provider, US and non-US court orders
- [Namecheap: UDRP (Wayback Machine capture, 20 October 2026)](https://web.archive.org/web/20261020164859/https://www.namecheap.com/legal/domains/udrp/), the policy republished in its legal terms
- [Tucows: Submitting court and legal documents](https://tucowsdomains.com/help/legal-submissions/submitting-court-and-legal-documents-to-tucows-inc/), compliance with orders of competent courts, not needing to be named, accepted countries and translations
- [Cloudflare: Registrar abuse](https://www.cloudflare.com/products/registrar/abuse/), no intervention in disputes until a dispute resolution expert instructs, UDRP and URS
- [IONOS: Resolving a domain name dispute](https://www.ionos.com/help/my-account/legal-accordian/domain-name-disputes/resolving-a-domain-name-dispute/), no trademark determinations, the UDRP and other policies, discretionary account locks
