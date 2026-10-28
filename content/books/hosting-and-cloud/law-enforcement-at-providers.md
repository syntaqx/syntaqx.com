+++
title = "Law Enforcement at Infrastructure Providers"
nav_title = "Law Enforcement at Providers"
description = "What police and courts ask infrastructure providers for, the published volumes, and resolving an IP and timestamp to the customer who held it."
category = "Hosting & Cloud Industry"
order = 2202
part = "Abuse, Trust and the Law"
tags = ["law-enforcement", "transparency", "ecpa", "cloud-act", "data-requests"]
+++

A platform that hosts user posts gets law enforcement requests that name accounts and handles. An infrastructure provider gets requests that name an IP address and a time, a domain, a server, or a company that is itself the provider's customer. The legal framework is the same (the Stored Communications Act's ladder of subpoena, court order and warrant, preservation, emergency disclosure, nondisclosure orders, the CLOUD Act and mutual legal assistance), and the [UGP volume's chapter](/books/user-generated-platforms/law-enforcement-requests) owns it and the nine-step operating model. What renting infrastructure adds is three things: the identifier in the request has to be resolved to whoever held it at that instant; much of what the provider holds belongs to a business customer, which can be asked directly; and the provider often can't see the content at all, because it sits inside a customer's virtual machine or encrypted volume.

This chapter surveys the published request volumes at infrastructure providers, then the three twists, and extends the UGP `legal_requests` tables to resolve requests against `resources` and `resource_identifiers` in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Volumes are the latest each provider published, as of October 2026.

## How the Providers Do It

| Provider | Period | Requests | What was disclosed | Notes |
| --- | --- | --- | --- | --- |
| **AWS** (Amazon Information Request Report) | January to June 2025 | 1,619 requests processed: India 502, US 501, Germany 215 | Content in 11 (0.7%); non-content in 1,608 | National security requests reported as 0 to 249 for all of Amazon; no enterprise or government content stored outside the US disclosed to the US government. Amazon excluding AWS: 31,957 requests, content in 283 |
| **Microsoft** (enterprise and public sector requests) | July to December 2025 | 190 requests involving enterprise customers | 96 (51%) rejected, withdrawn, no data found or redirected to the customer; 94 compelled: 45 content (31 to US law enforcement), 49 non-content | "None of these disclosures involved Azure content data belonging to a commercial, public sector, or educational customer." Microsoft receives more than 55,000 demands a year, and "less than 0.7%" seek enterprise data |
| **Cloudflare** | July to December 2025 | US criminal subpoenas 336 (H1 2025: 354); US criminal court orders 70 (46); emergency disclosure requests 44 (48), with data produced in 7% (0%) | Some data produced for 54% of subpoenas (565 accounts, 5,193 domains affected) and 76% of court orders (184 accounts, 2,374 domains); emergency disclosures "typically" only basic subscriber information | National security letters and FISA orders in the 0 to 249 band; no CLOUD Act requests to report |
| **DigitalOcean** | 2025 (annual, updated June 2, 2026) | 1,104 requests: US 540, international 296, EU 268. By country: US 48.91%, India 20.92%, Germany 15.13%, Netherlands 4.8%, UK 1.18% | Non-content: 581 complied, 207 not. Content: 83 complied, 6 not. Preservation: 180 complied, 14 not. Imminent harm: 9 complied, 1 not. Pen register and trap and trace: 21 complied, 2 not | National security 0 to 249; preservation never produces data |
| **Akamai and Linode** | No counts published | Intake forms for preservation, subpoena, search and seizure warrant, nondisclosure order and emergency requests | | The emergency form says "An IP address that belongs to Linode is required" |

Three things stand out. **Content is rare.** AWS disclosed content in under 1% of requests, and Microsoft says none of its enterprise disclosures in the period touched Azure customers' content. Most of what infrastructure providers hand over is who held an account or an address and when. **The volumes are small and international.** AWS's and DigitalOcean's books are a few thousand requests a year, with India and Germany close behind the US, so international routes are a large share of the work, not an edge case. **Redirection is a disposition.** Microsoft counts requests sent back to the enterprise customer as one of its outcomes, which only an infrastructure provider can do.

## Resolving the Identifier

A request to a host or cloud usually reads like "the subscriber assigned 203.0.113.7 on March 3 at 14:02 UTC," or "the account behind example.com," or "the customer running the server at this address." Every one of those is a question about a `resource_identifiers` row: the core model's exclusion constraint guarantees one holder per address at any instant, and the range answers who it was ([Identifiers are held, not owned](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)). The work is in the details:

- **Time zones and clock skew.** A request's timestamp is in the requester's zone and their logs' accuracy. Normalize to UTC at intake, and where an assignment changed near the named instant, say so in the response rather than picking one.
- **Shared addresses.** A shared hosting IP serves hundreds of sites; a CDN's anycast address serves millions; a NAT gateway's egress address carries many customers' traffic. The honest answer for a shared IP is the list of resources on it, or "this address is shared and can't identify one customer without a hostname"; a hostname or a source port narrows it.
- **Pass-through services.** A CDN's address in a request isn't its customer's origin. The provider can say which customer's zone the hostname belonged to and, under process, the origin it was configured to reach.
- **Resellers.** If the address belonged to a reseller's sub-account, the provider knows the sub-account and, if the reseller collected it, the end customer; otherwise the answer is the reseller, who is asked next. Whether a reseller collects end-customer identity is a column in [the reseller agreement](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it), because this request is when it matters.
- **Deleted resources.** The request often arrives after the VM is gone and the IP reassigned. The identifier history and the account's records outlive the resource for exactly this reason ([Auditing](/books/hosting-and-cloud/hosting-and-cloud-business#auditing)).

## Customers Who Are Companies

When the data belongs to an enterprise customer, the provider is in the position of a records custodian for someone who can answer directly. Microsoft's report counts redirecting requests to the enterprise customer as an outcome, and its numbers show how often it happens: of 190 enterprise requests in the second half of 2025, 96 ended without Microsoft producing data. The practice rests on the customer being able to answer for its own data. Two limits apply. A nondisclosure order under 18 U.S.C. 2705(b) can forbid notice, and the provider has to decide whether to challenge it ([The US Framework](/books/user-generated-platforms/law-enforcement-requests#the-us-framework)). And the CLOUD Act's 2713 requires production of data in the provider's possession, custody or control regardless of where it is stored, so a data center in another country doesn't by itself move the request elsewhere; AWS and Microsoft both report specifically on content stored outside the US.

## What the Provider Can See

On IaaS the content usually isn't the provider's to read. The customer's files sit on volumes attached to the customer's VMs, possibly encrypted with keys the customer controls, and the provider's own records are the account, billing, access logs to its APIs, network flow metadata if it keeps any, and the identifier history. A warrant for "the contents of the server" is executed as an image of the volume or object store as stored, which the provider can produce without decrypting, or redirected to the customer who can read it. Managed services sit in between: a managed database's contents are readable by the provider's operations tooling, so the provider should be explicit, per product, about what it can produce. The design point is to make the answer a property of the product, recorded once, rather than a judgment call each time.

Preservation on infrastructure means a snapshot. A 2703(f) request for a server's contents is met by snapshotting the named volumes and buckets into a legal-hold store and not touching the customer's running resources, so the customer isn't tipped off and the evidence doesn't change. The snapshot is held for the 90 days the statute allows, extendable by 90, and released if no process follows ([Preservation is mandatory and narrow](/books/user-generated-platforms/law-enforcement-requests#the-us-framework)).

## The Alternatives

| Approach | Model | Strengths | Failure modes | Who does it |
| --- | --- | --- | --- | --- |
| **Produce what is asked** | Answer valid process directly from the provider's records and the customer's data | Fast | Produces enterprise data the customer could have answered for; erodes enterprise trust | Small providers without counsel |
| **Redirect to the enterprise customer** | Ask the government to serve the customer; produce only if compelled | Keeps the provider out of its customers' disputes; customers notified | Slower; not possible under nondisclosure orders | Microsoft, by its report |
| **Subscriber data only, content to the customer** | Produce account and identifier records; route content requests to the customer unless compelled | Matches what IaaS providers actually hold | Managed services blur the line | The pattern in AWS's and DigitalOcean's published volumes |
| **Publish volumes** | Semiannual or annual transparency reports | Accountability; shows content disclosure is rare | Counts without context mislead | AWS, Microsoft, Cloudflare, DigitalOcean |
| **Intake forms without counts** | Publish how to send requests, not how many come | Low effort | No accountability | Akamai and Linode |

## My Default

My default is the UGP operating model with four infrastructure additions: resolve every IP and hostname against identifier history at the named instant and say when an address is shared; redirect requests for an enterprise customer's data to that customer unless a nondisclosure order or exigency prevents it; produce subscriber and identifier records under the matching process, and content only under a warrant (or the equivalent order abroad), from snapshots, never from live resources; and publish the counts twice a year, split by process type and country, with content disclosures broken out. Every product records what the provider can see of the customer's data, so legal review starts from a fact.

What would change this: a provider whose customers are mostly individuals (shared hosting, consumer VPS) has no enterprise customer to redirect to and runs the UGP model as is; one serving governments may have contracts that require notice to the customer agency in every case.

## How to Build It

Requests, subjects and productions are the UGP [`legal_requests`, `legal_request_subjects` and `legal_request_productions`](/books/user-generated-platforms/law-enforcement-requests#how-to-build-it) tables; preservation is `legal_holds`. This chapter resolves subjects to resources and identifiers, records redirection, and adds per-product visibility.

```sql
ALTER TABLE legal_request_subjects
  DROP CONSTRAINT legal_request_subjects_identifier_kind_check,
  ADD CONSTRAINT legal_request_subjects_identifier_kind_check CHECK (identifier_kind IN
    ('account_id', 'handle', 'email', 'phone', 'content_url', 'community', 'ip_address',
     'payment_ref', 'ipv6_prefix', 'hostname', 'domain', 'resource_ref')),
  ADD COLUMN resource_id            UUID REFERENCES resources (id),
  ADD COLUMN resource_identifier_id UUID REFERENCES resource_identifiers (id),
  ADD COLUMN shared_identifier      BOOLEAN NOT NULL DEFAULT FALSE,  -- many holders behind it
  ADD COLUMN reseller_account_id    UUID REFERENCES accounts (id);   -- when held via a reseller

ALTER TABLE legal_requests
  ADD COLUMN redirected_to_customer_at TIMESTAMPTZ,  -- told the requester to serve the customer
  ADD COLUMN customer_notified_at      TIMESTAMPTZ;

ALTER TABLE products
  ADD COLUMN provider_visibility TEXT NOT NULL DEFAULT 'metadata_only'
    CHECK (provider_visibility IN ('metadata_only', 'stored_encrypted_customer_keys',
      'stored_readable', 'managed_readable'));
    -- what the provider could produce under a content warrant, decided once per product
```

The lookup that answers "who held this address at this instant," run with the requester's timestamp normalized to UTC:

```sql
SELECT ri.value, r.id AS resource_id, r.kind, r.account_id, a.parent_account_id,
       ri.held_during,
       (SELECT count(*) FROM resources s
         WHERE s.parent_id = r.id AND s.exists_during @> $2::timestamptz) AS hosted_on_it
FROM resource_identifiers ri
JOIN resources r ON r.id = ri.resource_id
JOIN accounts a ON a.id = r.account_id
WHERE ri.kind = 'ipv4'
  AND ri.value = $1
  AND ri.held_during @> $2::timestamptz;
-- No row: the address wasn't assigned at that instant. A row with hosted_on_it > 1 is a
-- shared address: the response names the resources only if the request names a hostname.
```

Notes on the sketch:

- **Assignments near the instant are reported.** A second query over `held_during` within a margin of the timestamp (minutes, set by policy) flags a handover so the response can state both holders and the boundary.
- **Resellers are a subject field.** When the holder is a sub-account, `reseller_account_id` records the reseller, and the response follows the agreement's `end_customer_identity` column.
- **Visibility is per product.** A content warrant against a `metadata_only` or `stored_encrypted_customer_keys` product produces a snapshot or a statement, never a decrypted copy; the production job reads `provider_visibility` before running.
- **Preservation is a snapshot plus a hold.** The job snapshots the named volumes and buckets into a restricted store and creates `legal_holds` rows over the snapshots and the account records, without changing the customer's resources.
- **Redirection is an outcome.** `redirected_to_customer_at` closes the provider's part unless the requester returns with process compelling it, and the transparency count reports redirections separately.
- **Events:** `legal_request.identifier_resolved`, `legal_request.redirected`, `legal_hold.snapshot_created` and the UGP request events go through the [outbox](/docs/architecture/events#the-transactional-outbox) to legal, the snapshot service and the transparency job.

## Auditing

- **Every resolution with the timestamp used and the assignment found,** including near-boundary handovers and shared-address answers, because a wrong attribution sends police to the wrong person.
- **Every snapshot taken for preservation,** its hold, its expiry and its release.
- **Redirections, customer notices and nondisclosure orders,** with challenges to indefinite orders.
- **Transparency counts as queries** over these rows, split by process type, country and content versus non-content, the split AWS, Microsoft, Cloudflare and DigitalOcean publish.

## What This Means for the System You Build

- **Answer IP and hostname requests from identifier history,** at the named instant in UTC, and say when an address is shared.
- **Know who sits behind reseller sub-accounts** before a request asks.
- **Redirect enterprise data requests to the customer** where the law allows, and count it.
- **Record per product what you can see** of customer data, so a content warrant has a known answer.
- **Preserve by snapshot into a hold,** never by touching the customer's resources.
- **Publish volumes** with content disclosures broken out.

## References

**Transparency reports**

- [Amazon: Information Request Report, H1 2025](https://d1.awsstatic.com/Security/pdfs/Amazon_AWS_Information_Request_Report_H1_2025.pdf), AWS requests by country, content and non-content disclosures, national security band, content outside the US
- [Microsoft: Enterprise and public sector demands, H2 2025](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/Microsoft-Enterprise-Demands-H2-2025.pdf), outcomes, content disclosures, Azure customer content and annual volume
- [Cloudflare: Transparency report H2 2025, legal requests](https://cf-assets.www.cloudflare.com/slt3lc6tev37/zItVXCvbb4LZpYG4Uh10R/7b27bba39755f0a4344acb946977704d/2H_2025_Cloudflare_s_Transparency_Report_Legal-v2.pdf), subpoenas, court orders, emergency requests with the share producing data and the accounts and domains affected, national security band and CLOUD Act
- [DigitalOcean: Transparency report 2025](https://digitalocean-legal.nyc3.cdn.digitaloceanspaces.com/Transparency%20Report%202025-%20Updated.pdf), requests by type, region and country, compliance counts
- [DigitalOcean: Transparency report page](https://www.digitalocean.com/legal/transparency-report), the report's publication

**Intake**

- [Akamai: Law enforcement request forms](https://www.akamai.com/legal/lera), request types and the Linode IP requirement for emergencies
