+++
title = "Inbox Rules"
description = "Gmail, Yahoo and Outlook sender rules and how they are enforced, feedback loops, BIMI, blocklists, and how an email platform enforces them on its own customers."
category = "Hosting & Cloud Industry"
order = 2187
part = "Communications Platforms"
tags = ["email", "deliverability", "dmarc", "bimi", "feedback-loops", "enforcement"]
+++

Mailbox providers are to email what carriers are to texting: private gatekeepers whose rules bind harder than the law. Since February 2024, Gmail and Yahoo have required bulk senders to authenticate with SPF, DKIM and DMARC, offer one-click unsubscribe and keep complaint rates below 0.3%; Outlook.com followed in May 2025 and rejects non-compliant bulk mail outright. Gmail began ramping enforcement in November 2025 with temporary and permanent rejections. For an email sending platform, these rules apply twice. Its own infrastructure (IPs, shared domains, return paths) must comply, and so must every customer it sends for, because a customer whose complaint rate crosses Gmail's line damages the shared pool the platform's other customers rely on. So the platform enforces the mailbox providers' rules on its customers before the mailbox providers enforce them on the platform.

This chapter covers the rules from the platform's side: how they came to be mandatory, what each mailbox provider requires and how it enforces, feedback loops, BIMI, blocklists, and how an ESP measures and enforces on its own customers. The mechanics of SPF, DKIM, DMARC and RFC 8058 one-click unsubscribe, and why a sender separates its streams, are the playbook's [Email: Authentication and Streams](/docs/architecture/notifications#email-authentication-and-streams); the platforms and their IP pools are [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms).

## How the Mailbox Providers Do It

The three largest consumer mailbox providers now publish requirements of the same shape, with differences in thresholds, enforcement and tooling. As of October 2026:

| Mailbox provider | Who the bulk rules cover | Requirements for bulk senders | Enforcement | Sender tools |
| --- | --- | --- | --- | --- |
| **Gmail** | More than 5,000 messages to Gmail addresses in one day | SPF and DKIM and DMARC (at least `p=none`), From aligned with SPF or DKIM, one-click unsubscribe (RFC 8058 headers plus a visible link), unsubscribes processed within two days, spam rate below 0.3% (target under 0.1%) | From November 2025, "temporary and permanent rejections" of non-compliant traffic; senders above 0.3% are ineligible for mitigation since June 2024 | Postmaster Tools v2 with a compliance status dashboard and an API; Feedback-ID feedback loop |
| **Yahoo** | Bulk senders | SPF and DKIM, DMARC at least `p=none` that passes, relaxed alignment, one-click unsubscribe "highly recommended" (mailto accepted), unsubscribes honored within 2 days, spam rate below 0.3% | Enforcement from February 2024 | Complaint Feedback Loop for DKIM domains |
| **Outlook.com** | Domains sending more than 5,000 messages a day | SPF pass, DKIM pass, DMARC at least `p=none` aligned with SPF or DKIM | From May 5, 2025, rejection with "550; 5.7.515 Access denied, sending domain [SenderDomain] does meet the required authentication level" | SNDS with the Junk Email Reporting Program, on a new portal |

Every sender, bulk or not, must at least pass SPF or DKIM at Gmail, have valid forward and reverse DNS for its sending IPs, use TLS, keep its spam rate under 0.3%, format messages to RFC 5322 and not impersonate Gmail in the From header.

## How We Got Here

Authentication standards existed for nearly two decades before mailbox providers made them mandatory:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| April 2006 to March 2015 | SPF, DKIM and DMARC are published (RFCs 4408, 4871 and 7489) | Domain authentication and a policy for failures | Optional, so unevenly deployed |
| August 2010 | RFC 5965 defines the Abuse Reporting Format for feedback reports | A standard way for mailbox providers to report complaints | Feedback loops are separate programs per provider |
| July 2020 and July 12, 2021 | Gmail pilots BIMI, then makes it generally available, with logos validated by a Verified Mark Certificate | A visible reward for strong authentication | A trademark and a certificate |
| October 3, 2023 | Google announces that "by February 2024, Gmail will start to require" bulk senders to authenticate, offer one-click unsubscribe and stay under a spam threshold; Yahoo publishes matching requirements | Authentication becomes a condition of delivery | Every ESP must bring its customers into compliance |
| February 2024 | Gmail and Yahoo enforcement begins | The requirements take effect | Non-compliant mail deferred or rejected |
| June 2024 | Gmail makes bulk senders above 0.3% spam rate ineligible for mitigation | No help for the worst senders | A sender over the line must fix its own reputation |
| 2024 | Gmail launches Postmaster Tools v2, with a compliance status dashboard | Senders can see whether they comply | Old reputation dashboards to be retired |
| September 24, 2024 | Gmail accepts Common Mark Certificates for BIMI | Logos for senders without a registered trademark | No verified checkmark with a CMC |
| May 5, 2025 | Outlook.com enforces authentication for domains sending over 5,000 a day, rejecting rather than junking non-compliant mail (a change from its first plan, per Spam Resource) | The third major consumer provider joins | Hard rejections for misconfigured senders |
| November 2025 | Gmail ramps up enforcement with temporary and permanent rejections | Rules that were warnings become failures | Misconfigured senders lose mail outright |
| February 3, 2026 | The Gmail Postmaster Tools API v2 becomes generally available | Compliance data by API | Platforms are expected to monitor every customer domain |
| May 2026 | DMARC is republished on the standards track (RFC 9989, with aggregate reporting in RFC 9990) | DMARC as a Proposed Standard | New RFC numbers to cite and implement |
| June 2026 | Microsoft moves SNDS to a new portal (June 8, per a vendor's account) | A replacement for the old SNDS site | Network access that expires and must be renewed |

The later steps mostly turned the earlier ones from guidance into enforcement.

## What the Rules Require, as a Platform Sees Them

For the platform, the requirements split into what it controls and what its customers control:

| Requirement | Who satisfies it | What the platform does |
| --- | --- | --- |
| Valid forward and reverse DNS, TLS | The platform | PTR records on every sending IP matching an A or AAAA record; TLS on every connection |
| SPF | Shared: the platform's return-path domain or the customer's | An SPF include customers add, or a custom return path on the customer's domain |
| DKIM | Shared | Keys per customer domain, published by the customer or delegated to the platform |
| DMARC with alignment | The customer's domain | Checks the customer's DMARC record and alignment before allowing bulk sending from it |
| One-click unsubscribe | Shared | Adds `List-Unsubscribe` and `List-Unsubscribe-Post` headers on broadcast streams, signed by DKIM, and processes the POST |
| Unsubscribes honored within 2 days | Shared | Suppresses immediately on the stream and forwards to the customer |
| Spam rate below 0.3% | The customer's sending practices | Measures complaints per customer and enforces its own lower thresholds |

The DMARC alignment requirement is the one that most changed ESPs. Before 2024, many customers sent with the ESP's own domain in the DKIM signature and return path; aligned DMARC means the customer's own domain must authenticate, so the ESP's onboarding now includes domain verification, DNS records the customer must publish, and a check that they stay published.

## How Mailbox Providers Enforce

Enforcement is a ladder at each provider, and the platform sees it in SMTP replies:

- **Deferrals** (4yz) slow a sender down: retry later. A rising deferral rate at one mailbox provider is the earliest sign of a reputation problem on an IP or domain.
- **Rejections** (5yz) refuse the message. Gmail's November 2025 ramp added both "temporary and permanent rejections" for non-compliant traffic; Outlook.com's 5.7.515 is a rejection for failed authentication.
- **Spam folder placement** is invisible in SMTP and visible only in the provider's tools and in engagement.
- **Ineligibility for mitigation:** since June 2024 Gmail won't help bulk senders above 0.3% spam rate fix delivery problems.

Gmail's Postmaster Tools v2 reports compliance per domain in three states, "Compliant," "Needs work" and "No data found," covering authentication, DNS, formatting, encryption and spam rate for all senders, plus DMARC and one-click unsubscribe for bulk senders. Its API (generally available February 3, 2026, with compliance status verdicts since June 24, 2026) lets a platform poll every customer domain's status instead of asking customers to check by hand. The older domain and IP reputation dashboards are being retired.

## Feedback Loops

A complaint (the recipient clicking "report spam") is the strongest negative signal a sender gets, and feedback loops are how it reaches the sender:

- **Gmail** doesn't send per-message complaints. It aggregates them in Postmaster Tools by a `Feedback-ID` header the sender sets, in the form `a:b:c:SenderId`: a sender ID of 5 to 15 characters plus up to three identifiers, DKIM-signed by a domain verified in Postmaster Tools, one header per message, without per-message values, and covering @gmail.com recipients only. An ESP puts its customer and campaign identifiers in those fields, so complaint spikes can be traced to a customer. SES sets a `Feedback-ID` automatically and lets senders add two custom identifiers.
- **Yahoo's Complaint Feedback Loop** "only supports DKIM-signed email and is a domain based service": a sender creates a profile, verifies its domain and enrolls it, and receives complaints in ARF at the enrolled address. Yahoo requires it for bulk senders' DKIM domains.
- **Microsoft's Junk Email Reporting Program** (JMRP) is part of SNDS, which Microsoft says "gives you the data you need to understand and improve your reputation" and "includes our Junk Email Reporting Program, which lets you receive reports when users junk your messages." The new portal replaces the old SNDS site, and network access "expires 10 months after approval or migration," so enrollment needs renewal.

Complaints arrive in the Abuse Reporting Format (RFC 5965), which the platform parses into a complaint event on the original message, suppresses the recipient for that stream, and counts against the customer's complaint rate. Because Gmail reports only aggregates, the platform's complaint rate per customer at Gmail is computed from Postmaster data keyed by Feedback-ID, not from individual reports.

## BIMI

Brand Indicators for Message Identification (BIMI) shows the sender's logo next to authenticated mail. It is a reward for strong authentication, not a requirement, and the rules are strict:

- **DMARC at enforcement.** The BIMI Group's FAQ: "Enforcement means your DMARC policy is p=quarantine or p=reject." Gmail also requires `pct=100`; `p=none` isn't supported.
- **A certificate.** "Certificates used with BIMI come in two forms: a VMC (Verified Mark Certificate) or a CMC (Common Mark Certificate)," and "providers choose which certificate types they accept." A VMC requires a registered trademark; a CMC, introduced for logos "protected under prior use – rather than registered trademarks" (DigiCert, October 3, 2024), is accepted by Gmail since September 24, 2024, without the verified checkmark Gmail shows for VMCs.
- **The logo format.** SVG Tiny PS, embedded in the certificate's PEM for Gmail (a standalone SVG isn't supported there), with Google recommending at least 96 by 96 pixels and no more than 32 KB; it can take up to 48 hours to appear.
- **Support varies by provider.** Apple Mail supports BIMI on iOS 16, iPadOS 16 and macOS Ventura and later and on iCloud.com, with Apple's own verification of the evidence document; Yahoo Mail displays BIMI logos for senders that meet its requirements; the BIMI Group lists Apple, Comcast, Fastmail, Google, La Poste, Yahoo, Zoho Mail and others as supporting it.

For a platform, BIMI is a customer domain feature: check DMARC enforcement, host or reference the customer's logo and certificate in its BIMI DNS record, and report whether the domain qualifies. It can't be granted to a shared domain.

## Blocklists

Blocklists are the other gatekeepers: lists of IPs and domains that many receivers consult. Spamhaus's are the most used: the SBL ("Malicious Network Ranges"), XBL ("Compromised IPs"), CSS ("Email Spam IPs"), PBL ("Non-mail Emitting IPs"), the combined ZEN list, and the DBL ("Low Reputation Domains"). A listing of a shared IP blocks every customer on it, which is why ESPs tier their shared pools ([Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms#how-to-build-it)) and why "who held this IP on this date" must be answerable.

Querying blocklists has rules of its own. Spamhaus's public mirror "is provided free of charge for non-commercial use by small and medium sized organisations," and "the network originating the DNS Query must be identifiable." Queries through large public or cloud resolvers get an error code instead of an answer: from October 18, 2022 for queries via AWS's DNS, and from April 15, 2026 via Oracle's, with Spamhaus directing those users to its free Data Query Service. A platform that checks blocklists for its own IPs or inbound mail from a cloud needs its own query service account, not the public mirror.

## Enforcing on Your Own Customers

An ESP can't wait for Gmail to act: by the time a mailbox provider rejects a shared IP, every customer on it is affected. So every ESP publishes thresholds of its own, below the mailbox providers', and enforces them on its customers. As of October 2026:

| ESP | Bounce threshold | Complaint threshold | What happens |
| --- | --- | --- | --- |
| **Amazon SES** | Under review at 5%, may pause at 10% (only hard bounces to domains the sender hasn't verified count) | Under review at 0.1%, may pause at 0.5% | Review, then sending pause; rates computed over a "representative volume," not a fixed window; spamtrap thresholds undisclosed |
| **Postmark** | "Lower than 10% of all emails sent" | "Lower than 1 in 1,000 emails (0.1%)" | Existing customers: "your account might get paused while we work with you"; new customers: "we reserve the right to cancel" |
| **Resend** | "Under 4%" | "Under 0.08%" | "May result in a temporary pause in sending"; its acceptable use policy also allows shutting down an account "without warning" |
| **Mailgun** | 5% or less | 0.08% or less (plus unsubscribes at or under 1.4%, and blocks under 20%) | "We may limit, suspend, or terminate your account" |
| **Twilio SendGrid** | Recommends hard bounces from fewer than 5% of attempted messages | Calls 0.1% or more at any single mailbox provider "a potential deliverability risk" | Violations judged "on a case-by-case basis," including "an unreasonable number of complaints" and "excessive block listings"; no published numeric cutoff |

Three design points from the providers' documentation:

- **Measure over representative volume.** SES computes rates over a per-account "representative volume" rather than a fixed window, so a small sender's one bad day doesn't trip a pause and a large sender's bad hour does.
- **Count what is the sender's fault.** SES counts only hard bounces to unverified domains; blocks (the sender's authentication) are a different problem from bounces (the sender's list).
- **Pause the smallest unit that contains the problem.** SES's tenant policies pause a tenant ("Standard ... pauses sending for high-impact findings," "Strict ... for any reputation finding") without pausing the account, while an account-level pause doesn't emit an EventBridge event and must be detected by polling `GetAccount` for its `EnforcementStatus`. A platform that sends for many customers through one ESP account needs tenant-level enforcement, or one customer's list takes everyone down.

The ladder I'd build follows the abuse desk pattern ([Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown)): measure per customer and stream, warn at a review threshold with the data, move the sender to a quarantine pool or throttle it at a higher one, pause the stream (not the account) at the pause threshold, and require a remediation plan to resume. A customer pausing for complaints keeps its transactional stream running whenever the complaints came from broadcast. Every step is a dated hold with its evidence.

## The Alternatives

| Approach | Model | Strengths | Failure modes |
| --- | --- | --- | --- |
| **Rely on the mailbox providers** | Send, and react to deferrals and rejections | No enforcement to build | Shared IPs are blocked before the platform notices; every customer suffers |
| **Account-level thresholds** | Pause the whole customer account | Simple | A broadcast problem stops password resets |
| **Stream- and tenant-level thresholds** | Pause the stream or tenant that caused it | Contains damage; keeps transactional mail flowing | More state to measure and more holds to manage |
| **Pre-send gating** | Block bulk sending from domains without aligned DMARC and one-click unsubscribe | Prevents rejections instead of reacting | Onboarding friction; needs DNS checks that rerun |
| **Pool tiering** | Place senders in shared pools by reputation | Bad senders don't drag good ones | Placement decisions need evidence and an appeal path |

My default is all of the last three: pre-send gating on authentication for bulk streams, per-stream and per-tenant thresholds set at or below the strictest published ESP figures (a complaint rate of 0.08% to 0.1% for review, bounces at 4% to 5%), and tiered shared pools, with Postmaster Tools compliance polled daily for every customer domain.

## How to Build It

The chapter adds reputation samples, sender holds, domain policy checks and feedback loop enrollments to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), on top of [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms#how-to-build-it)' streams and events. Holds on a sender identity or stream are to email what `account_holds` are to the account: dated rows with an effect and a reason, so standing is never a status someone edited.

```sql
CREATE TABLE sender_reputation_samples ( -- measured rates per sender, provider and window
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  stream_id          UUID REFERENCES email_streams (id),
  domain_id          UUID REFERENCES resources (id),   -- sender_identity, channel 'email_domain'
  ip_resource_id     UUID REFERENCES resources (id),
  mailbox_provider   TEXT NOT NULL,      -- 'gmail', 'yahoo', 'outlook', 'all'
  source             TEXT NOT NULL CHECK (source IN ('own_events', 'postmaster_api',
                       'yahoo_cfl', 'snds', 'blocklist')),
  measured_during    TSTZRANGE NOT NULL,
  sent               BIGINT,
  hard_bounce_rate   NUMERIC(7,6),
  complaint_rate     NUMERIC(7,6),
  block_rate         NUMERIC(7,6),
  compliance_status  TEXT CHECK (compliance_status IN ('compliant', 'needs_work',
                       'no_data')),        -- Postmaster Tools v2
  blocklist          TEXT,               -- a listing, when source = 'blocklist'
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sender_holds (              -- enforcement on a sender identity or stream
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  sender_identity_id UUID REFERENCES resources (id),   -- a domain, a brand, a campaign
  stream_id          UUID REFERENCES email_streams (id),
  reason             TEXT NOT NULL CHECK (reason IN ('bounce_rate', 'complaint_rate',
                       'spamtrap', 'blocklisting', 'authentication', 'provider_rejection',
                       'carrier_complaint', 'content')),
  effect             TEXT NOT NULL CHECK (effect IN ('review', 'throttle',
                       'quarantine_pool', 'pause', 'terminate')),
  sample_ids         UUID[] NOT NULL DEFAULT '{}',     -- the evidence
  case_id            UUID REFERENCES moderation_cases (id),
  valid_during       TSTZRANGE NOT NULL,
  lifted_reason      TEXT,
  created_by         TEXT NOT NULL,      -- 'system:reputation', staff
  CHECK (num_nonnulls(sender_identity_id, stream_id) >= 1)
);

CREATE TABLE email_domain_checks (       -- what a customer domain publishes, checked over time
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  domain_id        UUID NOT NULL REFERENCES resources (id),
  spf_pass         BOOLEAN NOT NULL,
  dkim_selectors   TEXT[] NOT NULL,      -- selectors found and valid
  dmarc_policy     TEXT CHECK (dmarc_policy IN ('none', 'quarantine', 'reject')),
  dmarc_pct        SMALLINT,
  dmarc_aligned    BOOLEAN NOT NULL,
  bimi_record      TEXT,
  bimi_certificate TEXT CHECK (bimi_certificate IN ('vmc', 'cmc')),
  bimi_eligible    BOOLEAN NOT NULL,     -- enforcement policy plus a certificate
  bulk_allowed     BOOLEAN NOT NULL,     -- the pre-send gate's verdict
  checked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feedback_loop_enrollments ( -- where complaints come from
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  program       TEXT NOT NULL CHECK (program IN ('gmail_postmaster', 'yahoo_cfl',
                  'microsoft_snds_jmrp')),
  subject       TEXT NOT NULL,           -- the domain or IP range enrolled
  feedback_id_sender TEXT,               -- Gmail: the SenderId in Feedback-ID
  enrolled_at   TIMESTAMPTZ NOT NULL,
  expires_at    TIMESTAMPTZ              -- SNDS access expires 10 months after approval
);
```

The enforcement job is a function of samples and thresholds:

```sql
-- Streams over their review or pause thresholds in the last representative window
SELECT s.account_id, s.stream_id, s.complaint_rate, s.hard_bounce_rate,
       CASE WHEN s.complaint_rate >= 0.005 OR s.hard_bounce_rate >= 0.10 THEN 'pause'
            WHEN s.complaint_rate >= 0.001 OR s.hard_bounce_rate >= 0.05 THEN 'review'
       END AS action
FROM sender_reputation_samples s
WHERE s.source = 'own_events' AND s.mailbox_provider = 'all'
  AND upper(s.measured_during) > now() - interval '1 day'
  AND (s.complaint_rate >= 0.001 OR s.hard_bounce_rate >= 0.05)
  AND NOT EXISTS (SELECT 1 FROM sender_holds h
                  WHERE h.stream_id = s.stream_id AND h.valid_during @> now()
                    AND h.effect IN ('pause', 'terminate'));
```

The thresholds in the sketch are SES's published ones; set your own as rows in a rules table ([Rules as Data](/docs/architecture/rules-as-data)), not constants.

Notes on the sketch:

- **Samples come from several sources.** The platform's own events give bounces and blocks; Postmaster Tools gives Gmail's spam rate and compliance; the Yahoo CFL and JMRP give complaints; blocklist checks give listings. Each is a sample with its source and measurement range, so a decision can cite the data it used.
- **Holds attach to the smallest unit.** A stream, a domain or a tenant's sender identity, never the account by default; an account-level hold is the abuse desk's decision, with its own `account_holds` row.
- **Domain checks rerun.** Customers change DNS; a domain that was aligned at onboarding can break next month. The pre-send gate reads the latest check, and a domain that stops passing moves its bulk stream to `review`.
- **Enrollments expire,** so a feedback loop that silently stops reporting complaints (an SNDS access lapse) becomes a dated alert instead of a sudden blind spot.
- **Events:** `sender.hold_placed`, `sender.hold_lifted`, `domain.check_failed`, `domain.bimi_eligible` and `feedback_loop.expiring` go to the customer and the abuse desk through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Every hold with its evidence:** the samples, their sources and windows, and the threshold applied, because a paused customer will ask why, and a mailbox provider asking about a shared IP will ask what the platform did.
- **Domain authentication over time,** to show a customer's domain was compliant when its mail was sent.
- **Feedback loop enrollments** and their renewals.
- **Pool placements and their reasons** ([Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms#auditing)).
- **Thresholds in force on each date,** as rules with effective ranges.

## What This Means for the System You Build

- **Gate bulk sending on authentication:** aligned DMARC, DKIM on the customer's domain, one-click unsubscribe on broadcast streams, rechecked continuously.
- **Enroll in every feedback loop** and put customer and campaign identifiers in Gmail's Feedback-ID.
- **Poll Postmaster Tools compliance** for every customer domain through the API.
- **Set your thresholds below the mailbox providers'** and at or near the strictest published ESP figures, measured over representative volume.
- **Enforce on the smallest unit** (stream, domain, tenant) with dated holds and evidence, and keep transactional mail flowing when broadcast causes the problem.
- **Use a blocklist query service** you are entitled to, not the public mirror through a cloud resolver.
- **Offer BIMI** to customers whose domains reach DMARC enforcement, with the certificate type each mailbox provider accepts.

## References

**Mailbox providers**

- [Google: Email sender guidelines](https://support.google.com/a/answer/81126), requirements for all senders and bulk senders, the 5,000-a-day line and spam rate thresholds
- [Google: Email sender guidelines FAQ](https://support.google.com/a/answer/14229414), the November 2025 enforcement ramp and ineligibility for mitigation above 0.3% since June 2024
- [Google: New Gmail protections for a safer, less spammy inbox](https://blog.google/products/gmail/gmail-security-authentication-spam-protection/), the October 3, 2023 announcement
- [Google: Postmaster Tools compliance status](https://support.google.com/mail/answer/14668346?hl=en), the checks and the three status values
- [Google: Postmaster Tools v2](https://support.google.com/mail/answer/16594218?hl=en), launched in 2024 and the retirement of the reputation dashboards
- [Google: Gmail API release notes](https://developers.google.com/workspace/gmail/release-notes), Postmaster Tools API v2beta, general availability on February 3, 2026, and compliance verdicts
- [Google: Feedback loop](https://support.google.com/mail/answer/6254652), the Feedback-ID format and rules
- [Google Workspace: Set up BIMI](https://knowledge.workspace.google.com/admin/security/set-up-bimi), DMARC enforcement, certificates, logo format and timing
- [Google Workspace Updates: BIMI generally available in Gmail](https://workspaceupdates.googleblog.com/2021/07/BIMI-support-across-gmail.html), the July 2020 pilot and July 12, 2021 availability
- [Google Workspace Updates: Additional BIMI protections](https://workspaceupdates.googleblog.com/2024/09/gmail-additional-bimi-protections.html), Common Mark Certificates and the checkmark
- [Yahoo: Sender best practices](https://senders.yahooinc.com/best-practices/), bulk sender requirements and the February 2024 enforcement
- [Yahoo: Complaint Feedback Loop](https://senders.yahooinc.com/complaint-feedback-loop), the domain-based, DKIM-only program and enrollment
- [Yahoo: BIMI in Yahoo Mail](https://help.yahoo.com/kb/SLN36219.html), eligibility for logo display
- [Microsoft: Outlook.com Postmaster](https://substrate.office.com/ip-domain-management-snds/Postmaster), enforcement for domains over 5,000 a day from May 5, 2025
- [Microsoft: SNDS](https://substrate.office.com/ip-domain-management-snds/snds), the new portal, JMRP and access expiry
- [Twilio: Outlook's new email sender requirements](https://www.twilio.com/en-us/blog/insights/outlook-new-email-sender-requirements), the 550 5.7.515 rejection text
- [Apple: BIMI in Apple Mail](https://support.apple.com/en-us/108340), supported platforms
- [Apple Developer: BIMI](https://developer.apple.com/support/bimi/), requirements for mail providers and evidence documents

**Standards and industry**

- [RFC 5965: An Extensible Format for Email Feedback Reports](https://www.rfc-editor.org/info/rfc5965), August 2010
- [RFC 4408: SPF](https://www.rfc-editor.org/info/rfc4408), April 2006
- [RFC 4871: DKIM](https://www.rfc-editor.org/info/rfc4871), May 2007
- [RFC 7489: DMARC](https://www.rfc-editor.org/info/rfc7489), March 2015
- [RFC 9989: DMARC](https://datatracker.ietf.org/doc/rfc9989/), May 2026
- [RFC 9990: DMARC Aggregate Reporting](https://datatracker.ietf.org/doc/rfc9990/), May 2026
- [BIMI Group](https://bimigroup.org/), the AuthIndicators Working Group
- [BIMI Group: FAQs for senders and ESPs](https://bimigroup.org/faqs-for-senders-esps/), VMC and CMC, provider choice and DMARC enforcement
- [BIMI Group: Supporting mailbox providers](https://bimigroup.org/bimi-infographic/), the providers that display BIMI
- [DigiCert: Common Mark Certificates now available](https://www.digicert.com/news/common-mark-certificates-now-available-from-digicert), October 3, 2024, for logos protected by prior use
- [Spamhaus: Blocklists](https://www.spamhaus.org/blocklists/), the SBL, XBL, CSS, PBL, ZEN and DBL
- [Spamhaus: DNSBL fair use policy](https://www.spamhaus.org/blocklists/dnsbl-fair-use-policy/), the free public mirror's terms
- [Spamhaus: Queries via AWS DNS](https://www.spamhaus.org/resource-hub/email-security/if-you-query-the-legacy-dnsbls-via-amazon-web-services-dns-move-to-spamhaus-technologys-free-data-query-service/), the error code from October 18, 2022
- [Spamhaus: Queries via Oracle](https://www.spamhaus.com/resource-center/if-you-query-the-spamhaus-projects-dnsbls-via-oracle-move-to-the-free-data-query-service/), from April 15, 2026

**ESP enforcement**

- [Amazon SES: Enforcement FAQ](https://docs.aws.amazon.com/ses/latest/dg/faqs-enforcement.html), review and pause thresholds, representative volume, Feedback-ID and account pause detection
- [AWS: SES tenant isolation with automated reputation policies](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-ses-tenant-isolation-automated-reputation-policies/), Standard, Strict and None
- [Postmark: Terms of service](https://postmarkapp.com/terms-of-service), complaint and bounce limits and their consequences
- [Resend: Account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits), bounce and spam rate limits
- [Resend: Acceptable use policy](https://resend.com/legal/acceptable-use), shutdown without warning
- [Mailgun: Acceptable use policy](https://www.mailgun.com/legal/aup/), bounce, unsubscribe, complaint and block thresholds
- [Twilio SendGrid: Bounce and block classifications](https://www.twilio.com/docs/sendgrid/ui/analytics-and-reporting/bounce-and-block-classifications), the 5% hard bounce recommendation
- [Twilio SendGrid: Deliverability insights](https://www.twilio.com/docs/sendgrid/ui/analytics-and-reporting/deliverability-insights), 0.1% spam reports as a risk
- [Twilio: Email policy](https://twilio.com/legal/service-country-specific-terms/email), case-by-case enforcement

**In practice**

- [Spam Resource: Google warns about sender requirements](https://www.spamresource.com/2025/11/google-warns-sender-requirements.html), the November 2025 FAQ addition
- [Spam Resource: Microsoft joins the club](https://www.spamresource.com/2025/04/microsoft-joins-club-top-four-b2c-mbps.html), the May 5, 2025 requirements
- [Spam Resource: New Microsoft sender requirements](https://www.spamresource.com/2025/04/new-microsoft-sender-requirements-link.html), the change from junking to rejecting
- [Suped: Microsoft SNDS 2026 changes](https://www.suped.com/blog/microsoft-snds-2026-changes-what-senders-need-to-know-before-june-8), the June 8, 2026 portal move (vendor account)
