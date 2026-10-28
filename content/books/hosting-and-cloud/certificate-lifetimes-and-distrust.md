+++
title = "Shorter Lifetimes, Revocation & Distrust"
nav_title = "Lifetimes & Distrust"
description = "The SC-081 schedule to 47-day certificates, the end of OCSP, CRLs and short-lived certificates, the 2024 Entrust distrust, and a host's migration playbook."
category = "Hosting & Cloud Industry"
order = 2172
part = "Certificates"
tags = ["certificates", "revocation", "ocsp", "crl", "distrust", "entrust", "sc-081"]
+++

A certificate is a promise that lasts until its expiry date, and the Web PKI has spent a decade learning that the only reliable way to take a promise back is to make it short. Revocation was supposed to handle the cases where a certificate had to die early: a stolen key, a validation that turned out wrong, a customer who left. In practice revocation reached few clients in time, the checks leaked which sites people visited, and the CAs paid to answer them. The CA/Browser Forum's answer, adopted in April 2025 as Ballot SC-081v3, is a schedule that cuts the maximum lifetime of a TLS certificate from 398 days to 47 by March 2029 and the reuse of a domain validation from 398 days to 10. Its stated reasoning includes that revocation is unreliable and doesn't scale.

The other way a certificate dies early is that its CA does. When a root program loses confidence in a CA, it stops trusting that CA's new certificates from a cutoff date, and every customer of that CA has to move. In 2024 Chrome, Mozilla and Apple each did that to Entrust, on three different dates keyed on three different clocks. A hosting provider meets both events at scale: it holds the certificates, it schedules their replacement, and its customers ask it what happened.

This chapter covers the lifetime schedule and how the CAs and hosts are implementing it, revocation as it now works (CRLs, the end of OCSP, short-lived certificates, browser-pushed revocation data), CA distrust with Entrust as the dated example, a host's playbook for moving customers off a distrusted CA, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `validity_schedule`, `certificate_revocations`, `ca_distrust_events` and `ca_migrations`. How CAs validate and log is [The Web PKI & Certificate Transparency](/books/hosting-and-cloud/web-pki); ordering and renewing is [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale).

## How the Providers Do It

Lifetimes and revocation across CAs and platforms, as of October 2026:

| CA or platform | Lifetimes offered | Revocation data | Lifetime plans and history |
| --- | --- | --- | --- |
| **Let's Encrypt** | 90 days (`classic`), 45 days (`tlsserver`), 160 hours (`shortlived`) | CRLs only; OCSP responders off since 6 Aug 2025 | `classic` to 64 days on 10 Feb 2027 and 45 days on 16 Feb 2028; ARI recommended |
| **Google Trust Services** | 14, 30 or 90 days (as offered through Cloudflare) | | Short options already offered |
| **Amazon Trust Services (ACM)** | 198 days | OCSP and CRLs | Already under the 200-day limit in force since 15 Mar 2026 |
| **Buypass** | None since 16 Oct 2025 | CRL and OCSP kept for certificates still valid | Left the TLS market |
| **Entrust** | None for new public TLS | | Distrusted for new issuance by Chrome, Mozilla and Apple in November and December 2024; public certificate business transitioned to Sectigo, completed 18 Sep 2025 per Entrust |
| **Vercel** | Let's Encrypt's | | Renews 14 to 30 days before expiry |
| **Cloudflare** | Per CA: Let's Encrypt 90 days; Google Trust Services and SSL.com 14, 30 or 90 | | Sectigo kept for backup certificates |

The column that will converge first is lifetimes: every CA must be at 100 days or less from 15 Mar 2027 and 47 from 15 Mar 2029. The column that already converged is revocation: OCSP is optional under the Baseline Requirements and gone at the largest CA.

## How We Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| Jul 2023 | Ballot SC-063v4 makes OCSP optional, requires CRLs, defines short-lived certificates (10 days, 7 from 15 Mar 2026) | OCSP's privacy and cost; a revocation-free option for automated issuers | CAs publish full or partitioned CRLs within 24 hours of a revocation |
| 27 Jun 2024 | Google announces Chrome will distrust Entrust's new certificates | "A pattern of compliance failures, unmet improvement commitments" over six years | Entrust's customers had to move |
| Jul 2024 | DigiCert finds about 0.4% of its applicable domain validations lacked a required underscore prefix and says the certificates must be revoked within 24 hours | A validation defect | Mass replacement on a one-day clock |
| Nov to Dec 2024 | Entrust distrust takes effect: Chrome (12 Nov), Apple (15 Nov), Mozilla (1 Dec) | | Three dates, keyed differently |
| 11 Apr 2025 | SC-081v3 passes: 47-day certificates and 10-day validation reuse by 2029 | Stale validation data, unreliable revocation, slow algorithm changes | Every manual renewal process |
| 7 May 2025 | Let's Encrypt drops OCSP URLs from certificates | | Must-Staple requests fail |
| 6 Aug 2025 | Let's Encrypt turns off its OCSP responders | Privacy and cost | |
| 2025 | Firefox 137 enables CRLite for all desktop users | Comprehensive revocation checking without contacting a CA | Firefox downloads about 300 kB of revocation data a day |
| 18 and 25 Sep 2025 | Entrust says it completed the transition of its public certificate business to Sectigo (18 Sep); Sectigo announces the migration complete, more than half a million certificates (25 Sep) | | |
| 15 Jan 2026 | Let's Encrypt short-lived and IP certificates generally available | Revocation that doesn't protect anyone | Renewal every few days |
| 15 Mar 2026 | 200-day maximum, 200-day validation reuse; short-lived means 7 days or less | | First SC-081 step |

## The SC-081 Schedule

Ballot SC-081v3 was proposed by Clint Wilson of Apple and endorsed by Sectigo, Google Chrome and Mozilla. It passed on 11 Apr 2025 with 25 issuers in favor, none against and five abstaining (Entrust, IdenTrust, Japan Registry Services, SECOM Trust Systems and TWCA), and all four certificate consumers (Apple, Google, Microsoft, Mozilla) in favor. The steps are in the Baseline Requirements' Relevant Dates table (version 2.3.1):

| Issued on or after | Maximum validity | Domain and IP validation reuse | Subject identity reuse |
| --- | --- | --- | --- |
| Before 15 Mar 2026 | 398 days | 398 days | 825 days |
| 15 Mar 2026 | 200 days | 200 days | 398 days |
| 15 Mar 2027 | 100 days | 100 days | 398 days |
| 15 Mar 2029 | 47 days | 10 days | 398 days |

The ballot's reasons, in its own framing: certificate data becomes less accurate over time; shorter validity limits how long stale ownership data and misissued certificates stay usable; shorter lifetimes push automation; revocation is unreliable and doesn't scale; and short validity makes it faster to retire an algorithm. The phased timeline is meant to let problems surface before the next step.

For a host, the reuse column matters more than the validity column. At 10 days of reuse from 2029 (and, at Let's Encrypt, 7 hours on the newer profiles today and on `classic` from February 2028), nearly every renewal is a fresh validation, so a domain whose DNS drifted since the last issuance fails at renewal instead of lingering. The DNS and CAA preflight in [When DNS Isn't Pointed Yet](/books/hosting-and-cloud/acme-at-scale#when-dns-isn-t-pointed-yet) stops being a nicety. Organization identity reuse stays at 398 days, so OV and EV certificates keep a yearly vetting cycle but need DV-style revalidation of the names inside them every few weeks.

The CAs are moving ahead of the floor. Let's Encrypt's `tlsserver` profile has been 45 days since 13 May 2026, and its default goes to 64 days on 10 Feb 2027 (a month before the 100-day step) and 45 days on 16 Feb 2028 (a year before 47 is required). ACM's 198-day certificates already fit the 200-day step. A host that sells uploaded commercial certificates should expect customers to arrive with 200-day, then 100-day certificates, and the manual renewal reminder that worked yearly becomes a quarterly one, then monthly.

## Revocation

Revocation is the CA marking a certificate invalid before it expires. The BRs fix the deadlines (section 4.9.1.1): within **24 hours** for a subscriber's written request, a report that the original request wasn't authorized, evidence of key compromise, a demonstrated way to compute the private key, or evidence that the domain or IP validation can't be relied on; within **5 days** for misuse, material changes to the certificate's information, a certificate not issued in line with the requirements, and the other listed cases. Short-lived certificates are exempt. Since 1 Dec 2025 a CA must state its mass revocation plan in its practice statement.

Over ACME, revocation is a `revokeCert` request with the certificate and an optional RFC 5280 reason code, signed either by the issuing account or by the certificate's own key; an account holding valid authorizations for every name on the certificate may also revoke it. Mozilla's policy limits the reasons a TLS certificate may carry to `keyCompromise`, `privilegeWithdrawn`, `cessationOfOperation`, `affiliationChanged` and `superseded` (or no reason), and allows `keyCompromise`, `superseded` and `privilegeWithdrawn` only in the situations the BRs assign to them.

A host's revocation triggers, mapped to those rules:

- **Key exposure.** A server compromise that could have read private keys: revoke every certificate whose key was on it, within the 24-hour window the CA works to, and issue replacements with new keys first so revocation doesn't take the site down.
- **The customer leaves.** A domain moved to another provider while the host still holds a valid certificate for it. With 47-day certificates the exposure is weeks; with 398-day certificates it was a year, which is part of why lifetimes are shrinking.
- **Replacement.** A certificate superseded by a reissue for a name change; revoking is optional and mostly noise.
- **The CA revokes.** A CA incident like DigiCert's July 2024 underscore defect gives the host a day to replace every affected certificate. ARI exists partly for this: a CA preparing to revoke can move every affected certificate's renewal window to now ([Renewal information](/books/hosting-and-cloud/acme-at-scale#renewal-information)).

### The end of OCSP

OCSP let a browser ask the CA, per certificate, whether it was still good. Ballot SC-063v4 (July 2023) made it optional and required CRLs instead; CAs that keep OCSP follow the existing rules. Let's Encrypt ended it in three steps: from 30 Jan 2025 new requests for the OCSP Must-Staple extension failed (except for accounts that had used it before); on 7 May 2025 OCSP URLs were dropped from certificates, after CRL URLs had been added, and all Must-Staple requests failed; on 6 Aug 2025 the responders were turned off. Its reasons were privacy (an OCSP responder learns which sites an IP address visits, and a CA could be compelled to record it), the "considerable resources" the service consumed, and Must-Staple, which never gained wide browser support while server stapling implementations "carry serious downtime risks." Chrome's CT policy has the matching footnote: SCTs delivered inside stapled OCSP responses count only before Chrome 148.

For a host, the change is mostly removal: OCSP stapling configuration on web servers, Must-Staple options in the control panel, and firewall rules for OCSP responders become dead weight for certificates from CRL-only CAs. ACM still publishes both OCSP and CRL endpoints for its certificates, so the change is per CA, not universal.

### CRLs and how browsers use them

The BRs require a CA to publish a new CRL within 24 hours of recording a revocation, and otherwise at least every seven days if every certificate carries an OCSP pointer, or every four days if not; the CRL may be one full list or a set of partitioned CRLs equivalent to one. Mozilla adds that end-entity CRLs must be reissued at least every seven days with `nextUpdate` no more than ten days after `thisUpdate`, and that partitioned CRLs are listed in the CCADB as a JSON array.

Partitioning is a scale decision. When Let's Encrypt started publishing CRLs in September 2022 it had "over 200 million" active certificates a day, enough that a single CRL listing every certificate if all were revoked would be "over 8 gigabytes"; it split them into 128 shards with a worst case of 70 MB each, with certificates staying in the same shard each time the CRLs are reissued, and at first disclosed the shard URLs only in the CCADB so the root programs could consume them without the internet downloading them.

Browsers don't fetch CRLs on each connection; they aggregate them and push the result. Firefox's **CRLite**, on for all desktop users since Firefox 137, downloads a compact encoding of every revoked certificate, refreshed every 12 hours, about 300 kB a day on average, and checks it locally on each new connection; Mozilla said Firefox 142 would disable OCSP for DV certificates. Chrome's **CRLSets** are, by Mozilla's comparison, about 600 kB a day covering roughly 1% of revocations. The practical result is that a revocation reaches Firefox users within hours and may never reach Chrome's for an ordinary DV certificate, which is the gap short lifetimes close.

### Short-lived certificates

A short-lived subscriber certificate, in the BRs' definition, is one valid for 10 days or less if issued between 15 Mar 2024 and 15 Mar 2026, and 7 days or less (604,800 seconds) after that. It needs no CRL or OCSP pointer and the CA doesn't have to revoke it: expiry is the revocation. Let's Encrypt's `shortlived` profile issues 160-hour certificates, opt-in, with "no plan to make them the default"; its reasoning is that revocation is unreliable, so relying parties stay exposed until expiry, up to 90 days for a `classic` certificate. Its IP address certificates are short-lived only, because IP addresses change hands more often than domain names. The cost is renewal every few days, which puts the whole pipeline in [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale#renewal-scheduling) on a three-day failure budget.

## CA Distrust

A root program can remove a CA's root outright, as Mozilla did with DigiNotar in August 2011; distrust it in stages, as Firefox did with Symantec in 2018 (certificates issued before 1 Jun 2016 in Firefox 60 in May, everything in Firefox 63 in October); or refuse only certificates issued after a cutoff while existing ones live out their term. The 2024 Entrust case was the third kind, and it is the one a host's playbook is written against, because the three browsers used different dates and different clocks:

| Root program | Announced | Rule | Existing certificates |
| --- | --- | --- | --- |
| **Chrome** | 27 Jun 2024 (Google security blog) | Certificates chaining to Entrust or AffirmTrust roots whose **earliest SCT** is after 31 Oct 2024, later moved to after 11 Nov 2024 (distrust from 12 Nov), not trusted by default from Chrome 127; enterprises can override for internal use | Trusted until expiry; a modified, rekeyed or renewed certificate is new and distrusted |
| **Mozilla** | | Certificates with an SCT on or before 30 Nov 2024 stay valid; new issuance distrusted from 1 Dec 2024 | Trusted until expiry |
| **Apple** | | 15 Nov 2024: TLS, S/MIME and timestamping on five Entrust roots; TLS and timestamping on four AffirmTrust roots | Certificates issued on or before then keep working until they expire |

Google's stated reason was "a pattern of compliance failures, unmet improvement commitments, and the absence of tangible, measurable progress" over six years. Entrust says that on 18 Sep 2025 it "completed the transition of its public certificate business to Sectigo"; Sectigo announced on 25 Sep 2025 that it had migrated "more than half a million certificates."

Three lessons for a host come out of that table:

- **The clock is the SCT, not `notBefore`.** Chrome keyed on the earliest SCT, which the CA controls and the certificate carries; a host can only know which of its certificates are affected if it stored their SCTs ([Certificate Transparency](/books/hosting-and-cloud/web-pki#certificate-transparency)).
- **Dates move.** Chrome's cutoff moved by eleven days after it was announced. A distrust event is a record with a source and a successor, not a constant in code.
- **Existing certificates aren't the emergency; renewals are.** Everything issued before the cutoff kept working to expiry. What failed was a renewal or reissue from the same CA after the cutoff, which is exactly what an automated pipeline does by default.

## A Host's Migration Playbook

When a root program announces the distrust of a CA the host uses or whose certificates its customers upload, the work runs in this order. The general incident discipline (one owner, one timeline, communication on a clock) is the playbook's [Incident Response](/docs/operations/incident-response#communicate-on-a-clock); what follows is the certificate-specific part.

1. **Record the event.** One `ca_distrust_events` row per root program: the roots covered, the basis (earliest SCT, issuance date), the cutoff, the effective date and the source URL. When a program moves its date, add a successor row and keep the old one.
2. **Inventory by issuer.** Every active certificate that chains to an affected root, through `issuer_cert_id` and the CA's certificate tree, with its earliest SCT, `not_after`, source (issued by the host or imported by the customer), validation level and the account that holds it. This is a query, not a crawl, if the data model kept the chain and the SCTs.
3. **Classify each certificate.** Per program: distrusted now (basis time after the cutoff), trusted until expiry, or unaffected. The earliest cutoff across programs governs, because the host's customers use all the browsers.
4. **Stop new issuance from the CA before the earliest cutoff.** Switch the default CA for new orders and renewals to the target CA, with margin. A renewal that runs at the old CA after the cutoff produces a certificate that is distrusted from birth.
5. **Check the target CA can issue.** Customers' CAA records that name only the old CA will block the new one; find them in the preflight, and tell those customers what to change, or publish the change where the host runs their DNS ([CAA](/books/hosting-and-cloud/web-pki#caa-the-domain-s-say)).
6. **Reissue ahead of expiry, in batches.** Host-issued DV certificates that are trusted until expiry don't need replacing at once; replace them at their normal renewal time from the new CA, or earlier in small batches if the fleet is large, inside the rate limits of the new CA. Any certificate already distrusted somewhere is replaced first.
7. **Notify customers who must act.** Imported certificates and OV or EV certificates bought from the distrusted CA can't be replaced by the host. Those customers need a notice that names the certificate, the browsers affected, the date, and what to do, re-checked before sending so a customer who already replaced it isn't told again ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)).
8. **Verify and close.** Count certificates by CA and by distrust classification until no active certificate is distrusted in any program, then mark the CA `distrusted` and remove it from the list a customer can choose.

The same playbook covers a CA that stops issuing (Buypass in October 2025), with no browser cutoff but the same switch-and-reissue steps, and a CA that is simply being replaced for commercial reasons.

## The Alternatives

How a relying party learns that a certificate is no longer good, side by side:

| Mechanism | How it works | Strengths | Failure modes | Status, October 2026 |
| --- | --- | --- | --- | --- |
| **CRLs, fetched by the client** | The CA publishes lists of revoked serials; the client downloads them | No per-site query to the CA | Size and freshness; clients rarely fetch them per connection | Required of every CA under the BRs |
| **CRLs aggregated by the browser** (CRLite, CRLSets) | The browser vendor builds and pushes a compact set | Private, fast, no CA dependency at connection time | Coverage depends on the vendor; CRLSets cover a small share | CRLite on for Firefox desktop since 137 |
| **OCSP** | The client asks the CA about one certificate | Fresh answers | Leaks browsing to the CA; soft-fail when unreachable; CA cost | Optional; turned off at Let's Encrypt |
| **OCSP stapling and Must-Staple** | The server attaches a CA-signed OCSP response; Must-Staple makes it mandatory | Removes the privacy leak | Fragile server implementations; Must-Staple never widely supported | Must-Staple rejected at Let's Encrypt since May 2025 |
| **Short-lived certificates** | Expiry within 7 days replaces revocation | Nothing to check; works even if every other mechanism fails | Renewal every few days; a pipeline outage is a site outage within days | Opt-in at Let's Encrypt (160 hours) |
| **Short lifetimes for everyone** | 47 days by 2029 | Bounds every failure of revocation to weeks | Manual processes stop being possible | The SC-081 schedule |

## My Default

My default is to treat expiry as the revocation mechanism and plan for 47 days now: renewal driven by ARI with a lifetime-fraction fallback, CRL-only CAs accepted without complaint, OCSP stapling and Must-Staple removed from the defaults, and revocation reserved for key exposure, where the host replaces first and revokes second. For distrust, my default is a data model that can answer "which of our certificates chain to this root and what is their earliest SCT" in one query, a second CA that is already live, and a written playbook that switches new issuance a week before the earliest announced cutoff, because the Entrust distrust spared existing certificates and punished renewals, and a pipeline that renews by default walks straight into that.

I'd move a hostname to short-lived certificates only where the host controls everything the renewal depends on (its own DNS, its own edge) and has watched the pipeline run at that cadence for months, because a three-day failure budget turns every pipeline outage into a customer outage. The tradeoff that would change this is a customer base built on uploaded OV and EV certificates: there the host can't automate the replacement, and the distrust playbook is mostly notices and support capacity, sized before the next announcement rather than after.

## How to Build It

The chapter adds the BR schedule as data, revocations, distrust events and CA migrations. CAs, their certificate tree and `ct_submissions` are [The Web PKI & Certificate Transparency](/books/hosting-and-cloud/web-pki#how-to-build-it)'s; `certificate_orders` is [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale#how-to-build-it)'s, and a migration's reissues are orders with `reason = 'ca_migration'`.

```sql
CREATE TABLE validity_schedule (         -- the BRs' relevant dates, as rules with dates
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  effective_during  TSTZRANGE NOT NULL,   -- by issuance time
  max_validity      INTERVAL NOT NULL,    -- 200, 100, 47 days
  dcv_reuse         INTERVAL NOT NULL,    -- 200, 100, 10 days
  sii_reuse         INTERVAL NOT NULL,    -- 398 days
  short_lived_max   INTERVAL NOT NULL,    -- 10 days, then 7
  source_ref        TEXT NOT NULL,        -- 'BR 2.3.1 Relevant Dates', the ballot
  EXCLUDE USING GIST (effective_during WITH &&)
);

CREATE TABLE certificate_revocations (   -- a request to revoke, and what the CA did
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  certificate_id      UUID NOT NULL REFERENCES certificates (resource_id),
  trigger             TEXT NOT NULL CHECK (trigger IN ('key_exposure', 'customer_request',
                        'domain_left_provider', 'superseded', 'ca_initiated', 'abuse')),
  reason_code         TEXT CHECK (reason_code IN ('keyCompromise', 'privilegeWithdrawn',
                        'cessationOfOperation', 'affiliationChanged', 'superseded')),
                                          -- null: no reason given
  requested_by        TEXT NOT NULL,      -- typed actor: a user, 'system:security', the CA
  requested_at        TIMESTAMPTZ NOT NULL,
  deadline_at         TIMESTAMPTZ,        -- 24 hours or 5 days, when the CA's clock applies
  replacement_order_id UUID REFERENCES certificate_orders (id),  -- replace first
  revoked_at          TIMESTAMPTZ,        -- confirmed by the CA's response
  error_detail        TEXT,
  UNIQUE (certificate_id)                 -- a certificate is revoked once
);

CREATE TABLE ca_distrust_events (        -- one root program's decision about a CA
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  ca_id           UUID NOT NULL REFERENCES certificate_authorities (id),
  program         TEXT NOT NULL CHECK (program IN ('chrome', 'mozilla', 'apple',
                    'microsoft')),
  roots           UUID[] NOT NULL,        -- ca_certificates ids of the roots covered
  basis           TEXT NOT NULL CHECK (basis IN ('earliest_sct', 'not_before')),
  cutoff_at       TIMESTAMPTZ NOT NULL,   -- certificates whose basis time is after this fail
  effective_at    TIMESTAMPTZ NOT NULL,   -- when clients start enforcing it
  announced_at    TIMESTAMPTZ NOT NULL,
  source_url      TEXT NOT NULL,
  superseded_by   UUID REFERENCES ca_distrust_events (id)  -- the program moved its date
);

CREATE TABLE ca_migrations (             -- moving customers from one CA to another
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  from_ca_id          UUID NOT NULL REFERENCES certificate_authorities (id),
  to_ca_id            UUID NOT NULL REFERENCES certificate_authorities (id),
  reason              TEXT NOT NULL CHECK (reason IN ('distrust', 'discontinued',
                        'commercial')),
  issuance_switch_at  TIMESTAMPTZ NOT NULL,  -- new orders go to to_ca_id from here
  complete_by         TIMESTAMPTZ NOT NULL,  -- the earliest effective distrust, or expiry
  status              TEXT NOT NULL CHECK (status IN ('planned', 'switching',
                        'reissuing', 'complete')),
  created_by          TEXT NOT NULL,
  CHECK (from_ca_id <> to_ca_id),
  CHECK (issuance_switch_at <= complete_by)
);

ALTER TABLE certificate_orders
  ADD CONSTRAINT certificate_orders_ca_migration_fk
  FOREIGN KEY (ca_migration_id) REFERENCES ca_migrations (id);
```

The inventory in step 2 of the playbook, classified per program, is one recursive query over the CA certificate tree and the stored SCTs:

```sql
-- Every active certificate under the roots a distrust event covers, with its
-- earliest SCT and whether that program trusts it now or only until expiry.
WITH RECURSIVE tree AS (
  SELECT cc.id, e.id AS event_id
  FROM ca_distrust_events e
  JOIN ca_certificates cc ON cc.id = ANY (e.roots)
  WHERE e.ca_id = $1 AND e.superseded_by IS NULL
  UNION
  SELECT child.id, tree.event_id
  FROM ca_certificates child
  JOIN tree ON child.parent_id = tree.id
),
affected AS (
  SELECT c.resource_id, r.account_id, c.source, c.validation_level, c.not_after,
         tree.event_id,
         (SELECT MIN(s.sct_timestamp) FROM ct_submissions s
          WHERE s.certificate_id = c.resource_id) AS earliest_sct
  FROM certificates c
  JOIN resources r ON r.id = c.resource_id AND r.state = 'active'
  JOIN tree ON tree.id = c.issuer_cert_id
)
SELECT a.resource_id, a.account_id, a.source, a.validation_level, a.not_after,
       e.program, a.earliest_sct,
       CASE
         WHEN e.basis = 'earliest_sct' AND a.earliest_sct IS NULL THEN 'unknown_sct'
         WHEN e.basis = 'earliest_sct' AND a.earliest_sct > e.cutoff_at THEN 'distrusted'
         WHEN e.basis = 'not_before'
              AND (SELECT not_before FROM certificates WHERE resource_id = a.resource_id)
                  > e.cutoff_at THEN 'distrusted'
         ELSE 'trusted_until_expiry'
       END AS status
FROM affected a
JOIN ca_distrust_events e ON e.id = a.event_id
ORDER BY status, a.not_after;
```

The `source` and `validation_level` columns split the result into the two halves of the playbook: `issued` DV certificates become `certificate_orders` with `reason = 'ca_migration'` and the migration's id, scheduled at their normal renewal time against the new CA; `imported` and OV or EV certificates become customer notices.

Notes on the sketch:

- **The schedule is data, checked at issuance.** A requested or imported certificate whose validity exceeds `validity_schedule.max_validity` for its issuance time is rejected before deployment; the same rows tell the renewal planner how long validations can be reused ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Replace, then revoke.** `replacement_order_id` makes the order explicit: for a key exposure the new certificate is deployed before the revocation is sent, so the 24-hour clock doesn't become an outage.
- **Distrust events are versioned, never edited.** Chrome's Entrust cutoff moved after it was announced; `superseded_by` keeps both, and the inventory uses only the current one.
- **`unknown_sct` is a finding.** A certificate whose SCTs were never parsed can't be classified against an SCT-keyed rule; the fix is to parse it, and the count of such certificates should be zero before a distrust ever happens.
- **Events:** `certificate.revocation_requested`, `certificate.revoked`, `ca.distrust_announced`, `ca_migration.switched` and `ca_migration.completed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to issuance, notifications, support and the status page.

## Auditing

- **Every revocation, its trigger and its clock.** Who asked, why, which reason code was sent, when the CA confirmed, and whether it met the 24-hour or 5-day deadline, because a CA's incident report or a customer's dispute asks.
- **Every distrust event as announced, and every change to it.** With the source URL, since the decision of which certificates to replace and when rests on it.
- **The migration's progress, certificate by certificate.** Which certificates were reissued from which CA, when, and which customers were notified to replace their own, until the count of distrusted active certificates is zero ([What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds)).
- **The schedule rows and when they changed.** The validity and reuse limits in force at each issuance, so a certificate rejected or accepted can be explained later.

## What This Means for the System You Build

- **Plan for 47-day certificates and 10-day validation reuse now;** the first two steps are dates on a published table, and the largest CA is ahead of them.
- **Store the BR schedule as data** and check every issued and imported certificate against it.
- **Treat expiry as revocation,** keep revocation for key exposure, and replace before you revoke.
- **Drop OCSP stapling and Must-Staple from defaults** for CRL-only CAs; keep the firewall and server configuration per CA.
- **Store every certificate's chain and SCTs** so a distrust inventory is one query.
- **Switch new issuance off a distrusted CA before the earliest cutoff;** renewals, not existing certificates, are what fail.
- **Keep a second CA live and a written migration playbook,** with customer notices for the certificates you can't replace yourself.

## References

**CA/Browser Forum**

- [Ballot SC-081v3: Introduce schedule of reducing validity and data reuse periods](https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/), proposer and endorsers, the 11 Apr 2025 vote and abstainers, end states, rationale
- [Baseline Requirements, current text (v2.3.1)](https://github.com/cabforum/servercert/blob/main/docs/BR.md), the Relevant Dates steps for validity, validation reuse and identity reuse; short-lived certificate definition; revocation deadlines; CRL frequency; mass revocation plans
- [Ballot SC-063v4: Make OCSP optional, require CRLs, and incentivize automation](https://cabforum.org/2023/07/14/ballot-sc063v4-make-ocsp-optional-require-crls-and-incentivize-automation/), the July 2023 vote, CRL rules, partitioned CRLs, short-lived certificates

**Root programs and browsers**

- [Mozilla Root Store Policy](https://www.mozilla.org/en-US/about/governance/policies/security-group/certs/policy/), CRL reissue and `nextUpdate` limits, partitioned CRLs in CCADB, permitted revocation reasons
- [Mozilla Hacks: CRLite in Firefox](https://hacks.mozilla.org/2025/08/crlite-fast-private-and-comprehensive-certificate-revocation-checking-in-firefox/), Firefox 137, 12-hour updates, 300 kB a day, OCSP for DV in Firefox 142, the CRLSets comparison
- [Chrome Certificate Transparency Policy](https://googlechrome.github.io/CertificateTransparency/ct_policy.html), SCTs in stapled OCSP only before Chrome 148
- [Google Security Blog: Sustaining digital certificate security](https://security.googleblog.com/2024/06/sustaining-digital-certificate-security.html), the 27 Jun 2024 Entrust announcement
- [The Register: Google axes Entrust](https://www.theregister.com/2024/06/28/google_axes_entrust_over_six), Google's stated reason, the original 31 Oct 2024 SCT cutoff, Chrome 127, the enterprise override
- [DigiCert: Entrust certificate distrust FAQ](https://www.digicert.com/campaigns/entrust-certificate-distrust/faq), Chrome's 11 Nov 2024 SCT rule, Mozilla's 30 Nov and 1 Dec 2024 rule, renewals and rekeys treated as new
- [Apple: Entrust root distrust](https://support.apple.com/en-us/121668), 15 Nov 2024, the roots and uses covered
- [Mozilla Security Blog: Distrust of Symantec TLS certificates](https://blog.mozilla.org/security/2018/03/12/distrust-symantec-tls-certificates/), the 2018 two-stage precedent
- [Mozilla Security Blog: Fraudulent *.google.com certificate](https://blog.mozilla.org/security/2011/08/29/fraudulent-google-com-certificate/), the 2011 DigiNotar precedent

**CAs**

- [Let's Encrypt: Ending OCSP support in 2025](https://letsencrypt.org/2024/12/05/ending-ocsp/), the three dates and the reasons
- [Let's Encrypt: A new life for certificate revocation lists](https://letsencrypt.org/2022/09/07/new-life-for-crls), 200 million active certificates, 128 shards, the 8 GB and 70 MB figures, CCADB-only disclosure
- [Let's Encrypt: Decreasing certificate lifetimes to 45 days](https://letsencrypt.org/2025/12/02/from-90-to-45), the `tlsserver` and `classic` dates
- [Let's Encrypt: Short-lived and IP address certificates generally available](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability), 160 hours, opt-in, IP certificates short-lived only, the revocation rationale
- [Let's Encrypt: Profiles](https://letsencrypt.org/docs/profiles/), current validity and reuse per profile
- [RFC 8555: ACME](https://www.rfc-editor.org/rfc/rfc8555), `revokeCert`, reason codes and who may revoke
- [DigiCert: Certificate revocation incident](https://www.digicert.com/support/certificate-revocation-incident), the underscore defect, 0.4% of validations, the 24-hour rule
- [Entrust: TLS certificate information center](https://www.entrust.com/tls-certificate-information-center), "September 18, 2025: Entrust completed the transition of its public certificate business to Sectigo"
- [Sectigo: Sectigo completes Entrust migration](https://www.sectigo.com/resource-library/sectigo-completes-entrust-migration), 25 Sep 2025, more than half a million certificates
- [Buypass: Go SSL](http://www.buypass.com/products/tls-ssl-certificates/go-ssl), issuance ended 16 Oct 2025, CRL and OCSP kept for valid certificates
- [AWS Certificate Manager: public certificate characteristics](https://docs.aws.amazon.com/acm/latest/userguide/acm-certificate-characteristics.html), 198-day validity, OCSP and CRL endpoints

**Platforms**

- [Cloudflare: Certificate authorities](https://developers.cloudflare.com/ssl/reference/certificate-authorities/), validity options per CA, Sectigo for backup certificates
- [Vercel: Working with SSL certificates](https://vercel.com/docs/domains/working-with-ssl), renewal 14 to 30 days before expiry
