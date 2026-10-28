+++
title = "The Web PKI & Certificate Transparency"
nav_title = "The Web PKI & CT"
description = "Who decides which certificates browsers trust: root programs, the CA/B Forum, domain validation, CAA, multi-perspective checks and Certificate Transparency."
category = "Hosting & Cloud Industry"
order = 2170
part = "Certificates"
tags = ["certificates", "tls", "web-pki", "ca-browser-forum", "certificate-transparency", "caa"]
+++

A hosting provider doesn't decide whether its customers' sites are trusted. Four browser and operating system vendors do, through their root programs: Google's Chrome Root Program, Mozilla's root store, Apple and Microsoft. Each one ships a list of certificate authorities whose signatures it accepts, and each one can remove a CA from that list. Every certificate a host installs is only as good as the CA that signed it, the rules that CA followed when it checked the customer's domain, and the public logs that recorded the issuance. A host that issues certificates for millions of sites is one of the largest customers of that system, and it carries every change in the rules into its renewal jobs, its DNS defaults and its support queue.

The rules are written in three places. The **root programs** set the policy for their own trust stores and enforce it by removing CAs. The **CA/Browser Forum** writes the shared floor, the TLS Baseline Requirements (BRs), which issuers and browsers vote on together. And the **IETF** publishes the protocols underneath: CAA records, Certificate Transparency, and ACME. A rule usually appears first as a root program requirement, becomes a Forum ballot with a phased schedule, and ends as a line in the BRs that every CA is audited against.

This chapter covers who the parties are, how the Web PKI got its present shape, how a CA proves a customer controls a domain, how CAA and multi-perspective corroboration narrow who can issue, and how Certificate Transparency makes every issuance public. It extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with the CAs and their certificates, the names on each certificate, the logs and the `ct_submissions` that prove a certificate was logged. Ordering and renewing certificates by the million is [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale); lifetimes, revocation and what happens when a CA is distrusted is [Shorter Lifetimes, Revocation & Distrust](/books/hosting-and-cloud/certificate-lifetimes-and-distrust). Terminating TLS at an edge network, origin certificates and protocol choices belong to [TLS & Protocols at the Edge](/books/hosting-and-cloud/tls-and-protocols); DNSSEC, which CAA now depends on, belongs to [DNS Hosting & DNSSEC](/books/hosting-and-cloud/dns-hosting-and-dnssec#dnssec-operations). HSTS and the response headers a site sends once it has a certificate are the playbook's [Security Headers](/docs/security/security-headers#hsts-and-preload).

## How the Providers Do It

The CAs a host can order from, as of October 2026:

| CA | Model | ACME and account binding | Validity offered | Notes |
| --- | --- | --- | --- | --- |
| **Let's Encrypt** (ISRG, a nonprofit) | Free DV | ACME, no external account needed | `classic` 90 days, `tlsserver` 45 days, `shortlived` 160 hours | First trusted certificate 14 Sep 2015; OCSP turned off 6 Aug 2025; operates Static CT API logs |
| **Google Trust Services** | Free DV through Google Cloud's Public CA | ACME with External Account Binding; an EAB secret must be used within 7 days and registers one account | 14, 30 or 90 days (as listed by Cloudflare) | One of Cloudflare's issuing CAs |
| **ZeroSSL** | Free DV over ACME, paid certificates through its API | ACME with EAB credentials from the dashboard or API | 90 days | Wildcards and multi-domain supported; Caddy's default fallback issuer |
| **Sectigo** | Commercial DV, OV, EV | Commercial accounts | Commercial terms | Endorsed SC-081; announced on 25 Sep 2025 that it had completed the migration of Entrust's public certificates (Entrust dates its own transition 18 Sep 2025); Cloudflare's backup CA |
| **DigiCert** | Commercial DV, OV, EV | ACME with EAB credentials created per certificate type in CertCentral | Commercial terms | Acquired Symantec's CA business while Symantec's distrust was under way |
| **Amazon Trust Services** (through ACM) | Free DV for use on AWS services | Managed by ACM; ACME issuance also offered | 198 days | DNS, email, or HTTP validation (HTTP only through CloudFront) |
| **Buypass** | Free DV (Go SSL) over ACME, until 2025 | Discontinued | None | Stopped orders, renewals and replacements on 16 Oct 2025 |
| **Entrust** (historical) | Commercial OV, EV, DV | | None for public TLS | Distrusted by Chrome, Mozilla and Apple for new issuance in late 2024; public business moved to Sectigo |

Three patterns run through the table:

- **DV is free and automated; identity is what's sold.** Every CA that a host can call at volume issues domain-validated certificates through ACME at no charge. The commercial CAs sell organization and extended validation, enterprise account management and support, and reach the same ACME protocol through an account binding.
- **The CA list moves.** In two years one large CA was distrusted (Entrust), one free ACME CA stopped issuing (Buypass), and Let's Encrypt changed its revocation model. A host that hardcodes one CA has hardcoded its exposure to all three kinds of event.
- **Lifetimes differ by CA and are shrinking everywhere.** The same week a host can be renewing 160-hour, 45-day, 90-day and 198-day certificates, which is why renewal can't be a fixed interval ([ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale#renewal-scheduling)).

## How the Web PKI Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 2005 | CA/Browser Forum begins | CAs and browser vendors had no shared venue for issuance rules | A voluntary body whose rules bind only through root programs and audits |
| Jun 2007 | EV Guidelines 1.0 | A higher identity standard for certificates | Manual vetting, priced accordingly |
| 29 Aug 2011 | Mozilla revokes trust in DigiNotar after a fraudulent `*.google.com` certificate | A CA issuing for a name its owner never requested | Sites on DigiNotar certificates lost trust in Firefox |
| 22 Nov 2011 | Baseline Requirements 1.0 adopted, effective 1 Jul 2012 | No common floor for how any certificate was validated | Every publicly trusted CA now audited against one document |
| Jan 2013 | RFC 6844, CAA | A domain owner couldn't say which CAs may issue for it | One more DNS lookup per issuance |
| Jun 2013 | RFC 6962, Certificate Transparency (Experimental) | Misissuance was invisible unless the victim happened to see the certificate | Public, append-only logs that someone has to run |
| 1 Jan 2015 | Chrome requires CT for EV certificates | EV status could be granted without public record | CAs logged EV certificates or lost the EV indicator |
| 14 Sep 2015 | Let's Encrypt issues its first certificate | Certificates cost money and took manual steps | A nonprofit CA funded by sponsors |
| 8 Sep 2017 | CAA checking mandatory (Ballot 187) | CAA had been optional for CAs to honor | Issuance blocked by stale or misconfigured records |
| May to Oct 2018 | Firefox 60 and 63 distrust Symantec's PKI in two stages, on a consensus plan discussed with Chromium | A large, old CA with a documented set of issues | All Symantec brands (GeoTrust, RapidSSL, Thawte, VeriSign) replaced |
| 30 Apr 2018 | Chrome requires CT for every new publicly trusted certificate | Non-EV misissuance was still unlogged | Uncompliant certificates fail in Chrome |
| Mar 2019 | RFC 8555, ACME | Validation and issuance as an API | Hosts rebuilt their certificate pipelines around it |
| 2019 | RFC 8659 replaces RFC 6844; RFC 8657 adds `accounturi` and `validationmethods` | CNAME tree-climbing applied a host's policy to customers' names; CAA couldn't pin an account | CAs updated resolvers and parsers |
| 2021 | RFC 9162, CT version 2.0 (Experimental) | Protocol cleanups to RFC 6962 | Browsers kept RFC 6962 logs in production |
| 2022 | Chrome Root Program launches | A root store and policy under Chrome's own control | A fourth independent policy owner for CAs to satisfy |
| 2024 to 2026 | MPIC (SC-067), Entrust distrust, SC-081 shrinking lifetimes, end of OCSP at Let's Encrypt, Static CT logs | BGP hijacks of validation, a CA's long compliance record, revocation that doesn't work | Covered in this part's next two chapters |

The 2011 DigiNotar removal and the 2018 Symantec distrust are the precedents: in each, root programs lost confidence in a CA and every customer of that CA had to move, at once for DigiNotar and in announced stages for Symantec. [Shorter Lifetimes, Revocation & Distrust](/books/hosting-and-cloud/certificate-lifetimes-and-distrust#ca-distrust) walks the 2024 Entrust case and a host's playbook for it.

## Root Programs and the CA/B Forum

A **root program** is a trust store with a policy attached. The Chrome Root Program, launched in 2022, "determines which website certificates Chrome trusts by default." Its policy (version 1.8, updated 5 Feb 2026) shows how far a root program now reaches into a CA's operations:

- **Automation is becoming mandatory.** PKI hierarchies "SHOULD support" ACME, and those that do must support the CAA extensions of RFC 8657 and ACME Renewal Information. From 15 Mar 2027 every subordinate CA trusted in Chrome must be integrated with an automation solution.
- **Roots age out.** "Any root CA certificate with corresponding key material generated more than 15 years ago will be removed," on a schedule that removes roots with keys from 2006 to 2007 on 15 Apr 2026 and steps forward a year at a time.
- **Server authentication only.** Subordinate CAs disclosed on or after 15 Jun 2026 must assert only the `serverAuth` purpose, and subscriber certificates issued on or after 15 Mar 2027 must too. Let's Encrypt retired its `tlsclient` profile, the one that added client authentication, on 8 Jul 2026.
- **Incidents are public.** Participants disclose and respond to incident reports in Bugzilla, in the format the Common CA Database (CCADB) sets, regardless of perceived impact.

Mozilla's Root Store Policy (version 3.1, effective 1 Jul 2026) runs parallel: the websites trust bit is removed once a CA's key material is more than 15 years old, new root inclusion requests are accepted only for keys generated no more than five years earlier, audits under WebTrust or ETSI are required before inclusion and every year after, and end-entity CRLs must be reissued at least every seven days. Apple publishes its own Certificate Transparency policy and its own distrust notices. Microsoft is the fourth certificate consumer that votes in the Forum.

The **CA/Browser Forum** began in 2005 and adopted the first Baseline Requirements on 22 Nov 2011, effective 1 Jul 2012. Its members are certificate issuers and certificate consumers (the browser and platform vendors), and a ballot needs a two-thirds majority of issuers and a majority of consumers. The BRs are now at version 2.3.1 (Ballot SC104, effective 4 Oct 2026), and they change often: twelve versions shipped between November 2025 and September 2026. A host doesn't vote, but every one of those versions can change what a CA will issue to it, so the BR changelog is a feed worth reading.

The split of power matters for planning. The Forum sets the floor everyone must meet; a root program can always go further for its own store, and the dates that hit a host first are often a root program's. Chrome's automation requirement and its `serverAuth`-only rule both take effect before the BRs require the same.

## Validation: Proving Control of a Name

A DV certificate asserts one thing: whoever requested it controlled each name on it, at a time recent enough to count. BR section 3.2.2.4 lists the methods a CA may use, and the list in version 2.3.1 is short:

| Method | BR section | What the CA checks | Wildcards and parent domains |
| --- | --- | --- | --- |
| **DNS Change** | 3.2.2.4.7 | A random value in a CNAME, TXT or CAA record at the name or an underscore-prefixed label (ACME's `dns-01` is this method) | Yes: the validated name can be a parent of the requested one |
| **Agreed-Upon Change to Website v2** | 3.2.2.4.18 | A file under `/.well-known/pki-validation` on an authorized port, 2xx response, HTTP-layer redirects only | No |
| **Agreed-Upon Change to Website, ACME** | 3.2.2.4.19 | ACME's `http-01` | No |
| **TLS Using ALPN** | 3.2.2.4.20 | ACME's `tls-alpn-01`, per RFC 8737 | No |
| **DNS Labeled with Account ID** | 3.2.2.4.21 | ACME's `dns-account-01` draft | Yes |
| **DNS TXT Record with Persistent Value** | 3.2.2.4.22 | A standing TXT record at `_validation-persist.<name>` naming the CA and an `accounturi`, optionally with `persistUntil` | Yes; reuse capped at 10 days |
| Email, phone and contact methods | 3.2.2.4.4, .12 to .17 | A random value sent to a domain contact | Being retired, below |

Everything else is gone or going. Methods 3.2.2.4.1, .2, .3, .5, .6, .8, .9, .10, .11 and .15 "MUST NOT" be used; the method that sent a random value to a domain contact by email, fax, SMS or post (.2) and the phone method (.15) stopped on 15 Jul 2025; the IP address method (.8) stopped on 15 Mar 2026. The phone methods that use DNS-published contacts (.16, .17) end on 15 Mar 2027, and the email methods (.4, .13, .14) end on 15 Mar 2028, with earlier validations by them no longer reusable. The direction is plain: validation is becoming something software does over HTTP, TLS or DNS, not something a person clicks in an email.

Two rules in the methods matter most to a host:

- **Reuse is shrinking with lifetimes.** A completed validation can be reused for later certificates for a period that was 398 days before 15 Mar 2026, is 200 days now, falls to 100 days on 15 Mar 2027 and to 10 days on 15 Mar 2029. A random value itself is good for at most 30 days. The schedule is the subject of [Shorter Lifetimes, Revocation & Distrust](/books/hosting-and-cloud/certificate-lifetimes-and-distrust#the-sc-081-schedule).
- **Only DNS methods cover a parent domain.** The HTTP and TLS methods validate exactly the name requested; a wildcard needs a DNS method. That single rule decides whether a host can issue wildcards for a customer, which depends on whether the host runs the customer's DNS ([ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale#wildcards-and-dns-01)).

The validation record a CA keeps is the evidence a certificate rests on. When it turns out to be wrong, the BRs give the CA 24 hours to revoke ([Revocation](/books/hosting-and-cloud/certificate-lifetimes-and-distrust#revocation)).

## CAA: The Domain's Say

A CAA record lets the holder of a domain name the CAs allowed to issue for it. RFC 8659 (2019, replacing RFC 6844 of January 2013) defines three property tags every CA must process: `issue` (the CAs that may issue; `";"` means none), `issuewild` (the same for wildcards, overriding `issue` when present) and `iodef` (where to report a refused request). A record with the critical flag set and a tag the CA doesn't recognize forbids issuance. The CA looks for a CAA record set at the requested name and, if there is none, at each parent in turn until it finds one; the first set found applies.

The BRs made CAA checking mandatory on 8 Sep 2017 (Ballot 187) and have tightened it since:

- **Timing.** After checking CAA the CA must issue within the record's TTL or 8 hours, whichever is greater.
- **Lookup failures.** A failed lookup may be treated as permission only if the failure is outside the CA's infrastructure, was retried at least once, and the domain is provably unsigned under DNSSEC.
- **DNSSEC.** From 15 Mar 2026 the CA's primary network perspective must DNSSEC-validate its CAA lookups, and local policy may not turn that off.
- **Account and method pinning.** RFC 8657 adds two parameters: `accounturi` limits issuance to one ACME account at the CA, and `validationmethods` limits the methods it may use (`dns-01`, `http-01`, or CA-specific labels starting `ca-`). CAs must process both by 15 Mar 2027.

For a host, CAA cuts both ways. A customer who set `0 issue "digicert.com"` years ago, or a security team that added CAA for the corporate CA, blocks the host's free certificates, and the failure arrives as a refused order, not a clear message. Vercel lists CAA records that don't authorize Let's Encrypt among its common certificate problems. In the other direction, a host that runs the customer's DNS can publish CAA on the customer's behalf; Cloudflare adds CAA records for its CAs when it is the DNS provider, and Netlify documents a record that pins Let's Encrypt to Netlify's own account:

```
petsofnetlify.com  300  IN  CAA  0 issue "letsencrypt.org;accounturi=https://acme-v02.api.letsencrypt.org/acme/acct/54403714"
```

With `accounturi`, a domain on such a record can get a certificate only through that one account. The cost is lock-in by DNS: moving to another host or CA means editing CAA first, and a host that publishes `accounturi` records has to tell the customer how to undo them on the way out. The RFC 8659 change to CNAME handling matters to hosts specifically: RFC 6844 climbed the tree for every CNAME, which could apply a host's CAA policy to every customer name that pointed at it; RFC 8659 climbs only from the requested name and leaves CNAMEs to the resolver.

## Multi-Perspective Issuance Corroboration

Domain validation trusts the network path between the CA and the domain. If an attacker can hijack the route to a domain's web server or nameservers from where the CA sits, it can answer the CA's challenge itself. Ballot SC-067v3, proposed by Google's Chrome Root Program and endorsed by Let's Encrypt and Fastly, passed 22 to 0 among issuers in July 2024 to make that harder: the CA must repeat each validation and CAA check from several remote network perspectives and issue only if enough of them agree. The BRs' own reason is that "this process can improve protection against equally-specific prefix Border Gateway Protocol (BGP) attacks or hijacks."

The phased schedule, from BR section 3.2.2.9:

| From | Remote perspectives | Effect of disagreement |
| --- | --- | --- |
| 15 Sep 2024 | 2 (SHOULD) | Advisory |
| 15 Mar 2025 | 2 (MUST) | The CA may still issue when too many perspectives disagree |
| 15 Sep 2025 | 2 | Issuance blocked when the quorum fails |
| 15 Mar 2026 | 3 | Blocked; corroborating perspectives must span two Regional Internet Registry regions |
| 15 Jun 2026 | 4 | Same |
| 15 Dec 2026 | 5 | Same |

The quorum allows one disagreeing perspective with two to five perspectives, and two with six or more. Perspectives count as distinct only if they are at least 500 km apart, and each perspective's DNS resolver must sit in the same RIR region as the perspective.

The host-side consequence is that a site has to answer the same way from everywhere. A domain behind geo-routed DNS that sends some regions to a different origin, a firewall that admits only the CA's known validation addresses, an anycast origin where one location hasn't received the challenge file yet, or a DNS provider whose secondaries lag the primary can all fail corroboration while passing from any single place. In October 2026 the CA needs four perspectives to agree, minus one; from 15 Dec 2026, five. The design rule for a host: publish the challenge (file, TLS response or TXT record) everywhere before telling the CA it's ready, and don't geo-restrict the paths a CA validates.

## Certificate Transparency

Certificate Transparency makes every publicly trusted certificate public. RFC 6962 (June 2013, Laurie, Langley and Kasper of Google) defines "publicly auditable, append-only, untrusted logs." The logs don't stop misissuance; they make it impossible to hide.

How it works, in the RFC's terms:

- **A log is a Merkle tree.** Entries are certificates or precertificates; the log periodically signs a **Signed Tree Head** with the tree's size and root hash. Inclusion proofs show an entry is in the tree; consistency proofs show a newer tree only appended to an older one.
- **A submission returns a promise.** When a CA submits, the log immediately returns a **Signed Certificate Timestamp (SCT)**: its log ID (the SHA-256 hash of its public key), a timestamp and a signature, promising to include the entry within the log's **Maximum Merge Delay**.
- **Precertificates make embedding possible.** Before issuing, the CA logs a precertificate carrying a poison extension so no client accepts it, collects SCTs, and embeds them in the final certificate's SCT list extension. SCTs can also be delivered in a TLS extension or a stapled OCSP response; servers must provide at least one.
- **Monitors and auditors close the loop.** Monitors read every new entry and watch for certificates on names they care about; auditors check that a certificate's SCT appears in the log and that the log's views are consistent. Two conflicting tree heads from one log are cryptographic proof it misbehaved.

The RFC 6962 API is a set of JSON endpoints under `/ct/v1/`: `add-chain` and `add-pre-chain` to submit, `get-sth` for the latest tree head, `get-sth-consistency` and `get-proof-by-hash` for proofs, and `get-entries` to read ranges.

### What browsers require

Chrome required CT for EV certificates from 1 Jan 2015 and for every publicly trusted certificate issued after 30 Apr 2018; a non-compliant one fails with `net::ERR_CERTIFICATE_TRANSPARENCY_REQUIRED`. The current policies, as of October 2026:

| | Chrome | Apple |
| --- | --- | --- |
| Certificates valid 180 days or less | Embedded SCTs from 2 distinct logs | 2 SCTs from distinct logs, at most 1 per operator counted |
| Longer certificates | 3 distinct logs | 3 (181 to 398 days), at most 2 per operator counted |
| Operator diversity | At least 2 distinct log operators | Via the per-operator caps |
| Log type | RFC 6962 or Static CT API | At least one SCT from an RFC 6962 log |
| Other | SCTs in stapled OCSP accepted only before Chrome 148; enforcement off if Chrome's log list is more than 70 days old | Non-compliant certificates fail TLS connections |

A host rarely submits to logs itself: the CA logs the precertificate and embeds the SCTs. What a host must do is read them. The earliest SCT timestamp on a certificate is the clock some root programs use for distrust (Chrome keyed its Entrust cutoff on it), and a certificate whose SCTs come from logs a browser has since retired or doesn't recognize will fail in that browser. A host that imports customer certificates has to check SCTs at import, because it is the one that will serve them.

### Static CT and the cost of logging

An RFC 6962 log computes inclusion and consistency proofs on request for any client that asks. The Static CT API (a C2SP specification) serves the log as flat "tiles" that can be cached by a CDN, with a single server handling writes. Filippo Valsorda's single-server Sunlight log is estimated at "around $10,000 per year," and Let's Encrypt says its own production Static CT logs, while dearer than that, cost "far less" than its RFC 6962 logs. Chrome's log policy now accepts logs that conform to "either RFC 6962 or to the static-ct-api v1.1.0 C2SP specification," with a Maximum Merge Delay of at most one minute for static logs against four hours for RFC 6962 logs. Let's Encrypt made its RFC 6962 logs read-only on 30 Nov 2025 and shut them down on 28 Feb 2026, dates it moved so its Static CT logs would be trusted by browsers first.

Logs are **temporally sharded**: each accepts only certificates expiring within a range of at most one calendar year, so a log can be retired once everything in it has expired. Chrome requires 99% availability per endpoint over a rolling 90 days, and a log that drops below 95% typically faces removal.

## The Alternatives

What a site can present, side by side:

| Option | Model | Strengths | Failure modes | Ownership | Cost |
| --- | --- | --- | --- | --- | --- |
| **DV from a free ACME CA** | Domain control only, automated | Free, fast, every host supports it | One CA's outage, policy change or distrust hits every site on it | Nonprofit (Let's Encrypt) or a large company's CA | Free |
| **DV from a commercial CA** | Same assertion, sold with an account and support | Contractual support, EAB-bound accounts, a second source | Same trust risks as any CA; price | Commercial | Per certificate or contract |
| **OV and EV** | Domain control plus vetted organization identity (EV Guidelines since 2007) | Identity in the certificate for those who check it | Manual vetting doesn't scale to shrinking reuse periods; replacing one fast is slow | Commercial CAs | Highest |
| **Cloud-managed DV** (ACM, a CDN's certificates) | The platform's CA issues and renews for its own services | No renewal work for the customer | Usable only on that platform; the key may not leave it | The platform | Free with the service |
| **Private CA** | The organization's own root, trusted only by its devices | Any lifetime or name, internal names, no CT | Not trusted by browsers; the organization runs the PKI | The organization | Staff and tooling |

## My Default

My default for a hosting provider is DV certificates from a free ACME CA for every customer hostname, with a second ACME CA configured and tested as a fallback, CT and CAA checked by the provider's own code rather than assumed, and OV or EV sold only as an upload of a certificate the customer bought. DV is what browsers actually require for the padlock, it is the only validation level that can keep up with 47-day lifetimes and 10-day reuse, and two independent CAs turn a CA outage or distrust into a configuration change instead of an incident.

I'd treat CAA as part of the product: check it before ordering, explain a blocking record to the customer in words, and publish `accounturi` pins only for customers who ask for them and with the exit path documented, because a pin that outlives the customer's stay is a support case on the way out. The tradeoff that would change this is the customer base: a host selling mostly to regulated enterprises that require organization identity would keep a commercial CA as primary and budget for the manual validation that comes with it, knowing that reuse periods are shrinking for organization data too.

## How to Build It

The core model has one `certificates` side table with the issuer as text. This chapter adds the CAs as rows, the roots and intermediates they issue from, the names each certificate covers, the CT logs, and the `ct_submissions` that prove logging. Orders and challenges are [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale#how-to-build-it)'s `certificate_orders` and `dcv_challenges`; revocations and distrust events are [Shorter Lifetimes, Revocation & Distrust](/books/hosting-and-cloud/certificate-lifetimes-and-distrust#how-to-build-it)'s.

```sql
CREATE TABLE certificate_authorities (   -- a CA the provider orders from or recognizes
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  code                TEXT NOT NULL UNIQUE,   -- 'letsencrypt', 'gts', 'sectigo'
  name                TEXT NOT NULL,
  caa_identities      TEXT[] NOT NULL,        -- issuer domain names for CAA: '{letsencrypt.org}'
  acme_directory_url  TEXT,                   -- null: not orderable over ACME
  eab_required        BOOLEAN NOT NULL DEFAULT false,
  ari_supported       BOOLEAN NOT NULL DEFAULT false,
  role                TEXT NOT NULL CHECK (role IN ('primary', 'fallback', 'import_only')),
  status              TEXT NOT NULL CHECK (status IN ('active', 'distrust_announced',
                        'distrusted', 'discontinued')),
  status_changed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ca_certificates (           -- roots, intermediates and cross-signs, as published
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ca_id               UUID NOT NULL REFERENCES certificate_authorities (id),
  parent_id           UUID REFERENCES ca_certificates (id),  -- the issuer; null for a root
  role                TEXT NOT NULL CHECK (role IN ('root', 'intermediate', 'cross_sign')),
  subject             TEXT NOT NULL,
  subject_key_id      BYTEA NOT NULL,         -- a leaf's AKI points here; ARI ids start with it
  sha256_fingerprint  BYTEA NOT NULL UNIQUE,
  key_generated_at    TIMESTAMPTZ,            -- root programs count 15-year terms from here
  not_after           TIMESTAMPTZ NOT NULL,
  CHECK ((role = 'root') = (parent_id IS NULL))
);

ALTER TABLE certificates                 -- the core side table, kind = 'certificate'
  ADD COLUMN ca_id               UUID REFERENCES certificate_authorities (id),
  ADD COLUMN issuer_cert_id      UUID REFERENCES ca_certificates (id),  -- the intermediate
  ADD COLUMN source              TEXT NOT NULL DEFAULT 'issued'
                                   CHECK (source IN ('issued', 'imported')),
  ADD COLUMN validation_level    TEXT NOT NULL DEFAULT 'dv'
                                   CHECK (validation_level IN ('dv', 'ov', 'ev')),
  ADD COLUMN authority_key_id    BYTEA,      -- with serial, the certificate's ARI identifier
  ADD COLUMN sha256_fingerprint  BYTEA UNIQUE;

CREATE TABLE certificate_names (         -- what a certificate covers; not a held identifier
  certificate_id  UUID NOT NULL REFERENCES certificates (resource_id),
  name            TEXT NOT NULL,          -- A-label, lowercase; '*.example.com'; an IP literal
  kind            TEXT NOT NULL CHECK (kind IN ('dns', 'wildcard', 'ip')),
  PRIMARY KEY (certificate_id, name)
);
CREATE INDEX certificate_names_name_idx ON certificate_names (name);

CREATE TABLE ct_logs (                   -- mirrored from the browsers' published log lists
  log_id          BYTEA PRIMARY KEY,      -- SHA-256 of the log's key, as it appears in an SCT
  operator        TEXT NOT NULL,
  description     TEXT NOT NULL,
  api             TEXT NOT NULL CHECK (api IN ('rfc6962', 'static_ct')),
  url             TEXT NOT NULL,
  expiry_range    TSTZRANGE NOT NULL,     -- the temporal shard it accepts
  chrome_state    TEXT CHECK (chrome_state IN ('pending', 'qualified', 'usable',
                    'readonly', 'retired', 'rejected')),
  apple_state     TEXT CHECK (apple_state IN ('pending', 'qualified', 'usable',
                    'readonly', 'retired', 'rejected')),
  retired_at      TIMESTAMPTZ,            -- SCTs after this don't count
  lists_read_at   TIMESTAMPTZ NOT NULL    -- when the log lists were last fetched
);

CREATE TABLE ct_submissions (            -- each SCT a certificate carries or was given
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  certificate_id  UUID NOT NULL REFERENCES certificates (resource_id),
  log_id          BYTEA NOT NULL REFERENCES ct_logs (log_id),
  entry_type      TEXT NOT NULL CHECK (entry_type IN ('precert', 'final')),
  delivery        TEXT NOT NULL CHECK (delivery IN ('embedded', 'tls_extension',
                    'ocsp_staple')),
  sct_timestamp   TIMESTAMPTZ NOT NULL,   -- the log's clock; distrust cutoffs key on the earliest
  sct             BYTEA NOT NULL,         -- the SCT as serialized, for re-verification
  recorded_from   TEXT NOT NULL CHECK (recorded_from IN ('parsed_at_issuance',
                    'parsed_at_import', 'self_submitted')),
  UNIQUE (certificate_id, log_id, entry_type)
);
```

Every certificate the provider holds, issued or imported, gets its SCTs parsed into `ct_submissions` before it is deployed. The check that it satisfies Chrome's policy is a query, run at issuance and again whenever the log lists change:

```sql
-- Active certificates that don't meet Chrome's embedded-SCT rule today:
-- 2 distinct logs at <= 180 days validity, 3 above, at least 2 operators,
-- counting only logs Chrome lists as qualified, usable or readonly.
WITH counted AS (
  SELECT c.resource_id,
         c.not_after - c.not_before AS lifetime,
         COUNT(DISTINCT s.log_id)   AS logs,
         COUNT(DISTINCT l.operator) AS operators
  FROM certificates c
  JOIN resources r ON r.id = c.resource_id AND r.state = 'active'
  LEFT JOIN ct_submissions s ON s.certificate_id = c.resource_id
                            AND s.delivery = 'embedded'
  LEFT JOIN ct_logs l ON l.log_id = s.log_id
                     AND l.chrome_state IN ('qualified', 'usable', 'readonly')
                     AND (l.retired_at IS NULL OR s.sct_timestamp < l.retired_at)
  GROUP BY c.resource_id, c.not_after, c.not_before
)
SELECT resource_id, logs, operators
FROM counted
WHERE logs < CASE WHEN lifetime <= INTERVAL '180 days' THEN 2 ELSE 3 END
   OR operators < 2;
```

Notes on the sketch:

- **Certificate names are not held identifiers.** The core's `resource_identifiers` allows one holder of a hostname at a time, which is right for a site. Two certificates legitimately cover the same name at once (the old one during renewal, a fallback CA's, a customer's imported one), so a certificate's SANs go to `certificate_names`, and the site that serves them holds the hostname in `resource_identifiers`. The certificate's `parent_id` in `resources` is the site or hosting account it serves.
- **The CA is a row, not a string.** Distrust, a discontinued CA, a change of default and a CAA preflight all need the CA's identities and status; `certificates.issuer` stays as the display name.
- **The issuing intermediate is recorded.** Root programs act on roots and sometimes on specific intermediates, and the chain up from `issuer_cert_id` answers "which of our certificates chain to this root" in one recursive query.
- **Log lists are data, refreshed.** Chrome turns CT enforcement off on a client whose list is more than 70 days old; a provider whose own mirror is stale will misjudge which SCTs count. `lists_read_at` makes staleness visible.
- **Events:** `certificate.issued`, `certificate.imported`, `certificate.ct_noncompliant`, `ca.status_changed` and `ct_log.state_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to renewal, deployment and the customer notice pipeline.

## Auditing

- **Which CA vouched for each name, and through which chain.** Every certificate with its CA, issuing intermediate, names and validity, kept past expiry, so a distrust or a misissuance report can be answered with the exact certificates affected.
- **The SCTs each certificate carried.** Parsed and stored, with the log list state at the time, because a distrust cutoff keyed on SCT time is decided from them.
- **What the provider published in customers' DNS.** CAA records the provider added or changed on a customer's zone, with the actor and time, since they decide who else can issue for that customer ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Imported certificates and who uploaded them.** A customer's own certificate on the provider's servers is still the provider's to serve; the upload, its checks and its owner are a record.

## What This Means for the System You Build

- **Treat root programs as your regulators** and read their policy changes and the BR changelog as you would a statute's amendments: Chrome's automation and `serverAuth` rules arrive before the BRs require them.
- **Make the CA a row with a status,** and keep a second ACME CA tested, so a CA event is a configuration change.
- **Validate over HTTP, TLS or DNS only;** the email and phone methods are being retired by date.
- **Check CAA before you order** and translate a blocking record into an instruction the customer can follow.
- **Serve the same answer from every network,** because the CA now checks from four places and, from 15 Dec 2026, five.
- **Parse and store every certificate's SCTs,** and check them against current log lists, especially for imported certificates.
- **Keep certificate names separate from held identifiers,** so overlapping certificates for one name are normal, not a constraint violation.

## References

**Standards and RFCs**

- [RFC 6962: Certificate Transparency](https://www.rfc-editor.org/rfc/rfc6962), June 2013, Experimental; Merkle trees, SCTs, precertificates and the poison extension, Maximum Merge Delay, the `/ct/v1/` API, monitors and auditors
- [RFC 9162: Certificate Transparency Version 2.0](https://www.rfc-editor.org/info/rfc9162), 2021, Experimental
- [RFC 8659: DNS Certification Authority Authorization (CAA) Resource Record](https://www.rfc-editor.org/rfc/rfc8659), `issue`, `issuewild`, `iodef`, the critical flag, tree climbing, the CNAME change from RFC 6844 (January 2013)
- [RFC 8657: CAA Record Extensions for Account URI and ACME Method Binding](https://www.rfc-editor.org/rfc/rfc8657), `accounturi` and `validationmethods` with example records
- [RFC 8555: Automatic Certificate Management Environment (ACME)](https://www.rfc-editor.org/rfc/rfc8555), March 2019

**CA/Browser Forum**

- [Baseline Requirements, current text (v2.3.1)](https://github.com/cabforum/servercert/blob/main/docs/BR.md), the validation methods and their retirement dates, `_validation-persist`, reuse periods, CAA processing and DNSSEC, MPIC quorum and the 500 km rule, revocation timelines
- [Baseline Requirements v2.1.2](https://github.com/cabforum/servercert/blob/BRs/v2.1.2/docs/BR.md), the MPIC phased implementation timeline and its BGP rationale
- [Baseline Requirements documents](https://cabforum.org/working-groups/server/baseline-requirements/documents/), version 1.0 adopted 22 Nov 2011 and effective 1 Jul 2012, the version history to 2.3.1
- [CA/Browser Forum: Welcome](https://cabforum.org/2013/09/02/welcome-to-the-ca/browser-forum), the Forum's 2005 start and EV Guidelines 1.0 in June 2007
- [CA/Browser Forum: About](https://cabforum.org/about/), certificate issuers and consumers, bylaws
- [Ballot 187: Make CAA checking mandatory](https://cabforum.org/2017/03/08/ballot-187-make-caa-checking-mandatory/), effective 8 Sep 2017 and the TTL-or-8-hours rule
- [Ballot SC-063v4: Make OCSP optional, require CRLs](https://cabforum.org/2023/07/14/ballot-sc063v4-make-ocsp-optional-require-crls-and-incentivize-automation/), the two-thirds issuer and majority consumer thresholds
- [Ballot SC-081v3: Schedule of reducing validity and data reuse periods](https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/), the four certificate consumers voting (Apple, Google, Microsoft, Mozilla)
- [Ballot SC-067v3: Multi-perspective corroboration](https://cabforum.org/2024/08/05/ballot-sc067v3-require-domain-validation-and-caa-checks-to-be-performed-from-multiple-network-perspectives-corroboration/), proposers, endorsers, the 22-0 issuer vote and the equally-specific prefix attack rationale

**Root programs and browser policy**

- [Chrome Root Program](https://googlechrome.github.io/chromerootprogram/), launched in 2022
- [Chrome Root Program Policy](https://googlechrome.github.io/chromerootprogram/crp/policy), v1.8: ACME and ARI, automation from 15 Mar 2027, the 15-year root term, `serverAuth`-only dates, Bugzilla incident reporting, CCADB
- [Mozilla Root Store Policy](https://www.mozilla.org/en-US/about/governance/policies/security-group/certs/policy/), v3.1: 15-year trust bit removal, five-year key age for inclusion, audits, CRL reissue and partitioned CRLs in CCADB, revocation reasons
- [Chrome Certificate Transparency Policy](https://googlechrome.github.io/CertificateTransparency/ct_policy.html), SCT counts by lifetime, operator diversity, OCSP-delivered SCTs before Chrome 148, the 70-day log list rule
- [Chrome CT Log Policy](https://googlechrome.github.io/CertificateTransparency/log_policy.html), RFC 6962 or static-ct-api v1.1.0, MMD limits, 99% uptime, temporal sharding
- [Apple's Certificate Transparency policy](https://support.apple.com/en-us/103214), SCT counts and per-operator caps, the RFC 6962 log requirement
- [Chromium: Certificate Transparency](https://chromium.googlesource.com/chromium/src/+/3876bf6f5d1152a40333fbd3d2153c92b43bb03b/net/docs/certificate-transparency.md), EV certificates from 1 Jan 2015 and all certificates after 30 Apr 2018, the error shown
- [Chromium ct-policy: Certificate Transparency Enforcement in Google Chrome](https://groups.google.com/a/chromium.org/g/ct-policy/c/wHILiYf31DE/m/iMFmpMEkAQAJ), the 6 Feb 2018 notice to CAs

**History**

- [Mozilla Security Blog: Fraudulent *.google.com certificate](https://blog.mozilla.org/security/2011/08/29/fraudulent-google-com-certificate/), DigiNotar and the removal of its root, 29 Aug 2011
- [Mozilla Security Blog: Distrust of Symantec TLS certificates](https://blog.mozilla.org/security/2018/03/12/distrust-symantec-tls-certificates/), Firefox 60 and 63 stages, the brands affected, DigiCert's acquisition
- [Let's Encrypt: Our first certificate](https://letsencrypt.org/2015/09/14/our-first-cert/), 14 Sep 2015

**Providers**

- [Let's Encrypt: Profiles](https://letsencrypt.org/docs/profiles/), `classic`, `tlsserver`, `shortlived`, the retired `tlsclient`
- [Let's Encrypt: Introducing DNS-PERSIST-01](https://letsencrypt.org/2026/02/18/dns-persist-01), the persistent record format
- [Let's Encrypt: Reflections on a year of Sunlight](https://letsencrypt.org/2025/06/11/reflections-on-a-year-of-sunlight), tiles behind a CDN, the $10,000 a year estimate, browser acceptance
- [Let's Encrypt: RFC 6962 logs end of life](https://letsencrypt.org/2025/08/14/rfc-6962-logs-eol), read-only 30 Nov 2025 and shutdown 28 Feb 2026
- [Let's Encrypt: Ending OCSP support in 2025](https://letsencrypt.org/2024/12/05/ending-ocsp/), responders off 6 Aug 2025
- [Google Cloud: Request a certificate using Public CA and an ACME client](https://docs.cloud.google.com/certificate-manager/docs/public-ca-tutorial), EAB keys used within 7 days, one account per secret, no charge
- [ZeroSSL: ACME documentation](https://zerossl.com/documentation/acme/), EAB credentials, 90-day free certificates, wildcards
- [DigiCert: Third-party ACME client integration](https://docs.digicert.com/en/certcentral/certificate-tools/certificate-lifecycle-automation-guides/third-party-acme-integration.html), per-type ACME credentials with EAB
- [Sectigo: Sectigo completes Entrust migration](https://www.sectigo.com/resource-library/sectigo-completes-entrust-migration), 25 Sep 2025, more than half a million certificates
- [Buypass: Go SSL](http://www.buypass.com/products/tls-ssl-certificates/go-ssl), orders, renewals and replacements ended 16 Oct 2025
- [AWS Certificate Manager: public certificate characteristics](https://docs.aws.amazon.com/acm/latest/userguide/acm-certificate-characteristics.html), Amazon Trust Services, 198-day validity, DNS, email and CloudFront HTTP validation
- [Cloudflare: Certificate authorities](https://developers.cloudflare.com/ssl/reference/certificate-authorities/), the CAs per certificate type, validity options, CAA values and records added by Cloudflare DNS
- [Netlify: HTTPS (SSL)](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/), the `accounturi` CAA example
- [Vercel: Working with SSL certificates](https://vercel.com/docs/domains/working-with-ssl), CAA records that don't authorize Let's Encrypt as a renewal failure
- [Caddy: Automatic HTTPS](https://caddyserver.com/docs/automatic-https), Let's Encrypt with ZeroSSL as fallback issuer
