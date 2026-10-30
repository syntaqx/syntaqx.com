+++
title = "Clearinghouses"
description = "The switch between practices and payers: what clearinghouses do, payer IDs, EDI, ERA and EFT enrollment, pricing, APIs, dental, Change Healthcare, switching."
category = "Health Tech Industry"
order = 1922
part = "Revenue Cycle"
tags = ["health-tech", "clearinghouses", "edi", "enrollment", "change-healthcare", "dental", "data-model"]
+++

A small practice bills dozens of payers and a payer receives claims from hundreds of thousands of providers, and nobody wants a connection to each. A clearinghouse is the switch in the middle: the practice sends every claim and eligibility check to one place, and the clearinghouse routes each to the right payer, over connections it maintains, returning acknowledgments, claim status responses and remittances the same way. HIPAA gives the role a legal definition: an entity, including "a billing service, repricing company," and "value-added" networks and switches, that converts nonstandard data into a standard transaction or a standard transaction into nonstandard data for the receiver (45 CFR 160.103). That makes a clearinghouse a HIPAA covered entity in its own right, and a business associate of the practices it serves.

What makes clearinghouses interesting to build with, and against, is that the switch is not neutral plumbing. It decides which payers a practice can reach, how fast enrollment happens, what edits a claim must pass, whether a JSON API or only files are offered, and how the 835 arrives. It is also a concentration point: when Change Healthcare's systems were taken down in February 2024, a large share of the country's claims stopped moving, and practices learned how hard it is to switch a clearinghouse in a week. This chapter covers what clearinghouses do, payer IDs and connectivity, enrollment, pricing, the API generation, dental clearinghouses, the Change Healthcare attack and what it taught, and switching. Its records are `integrations` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model), the transaction log of [The Revenue Cycle](/books/health-tech/revenue-cycle#how-to-build-it), and the claims of [Claims](/books/health-tech/claims).

## How the Platforms Do It

As of October 2026, from each company's pages and filings:

| Clearinghouse | Who it serves | Interfaces | Published pricing | Notable |
| --- | --- | --- | --- | --- |
| **Change Healthcare (Optum)** | Providers, payers, pharmacies; part of UnitedHealth Group's Optum Insight | Files, portals, APIs | Not published | Systems taken down after the February 2024 cyberattack; UnitedHealth's 10-K estimated about 190 million people affected |
| **Waystar** | Hospitals, health systems, physician groups (NASDAQ: WAY) | Platform, files, integrations | Not published | 2025 10-K: "over 7.5 billion healthcare payments transactions," "over 30,000 clients"; more than 30,000 providers began adopting its solutions after a competitor's 2024 cyber incident |
| **Availity** | Providers and payers; Availity Essentials portal for providers | Portal, APIs, files | Not published on the Essentials page | Eligibility, claims, status, remittance, prior authorization with attachments, appeals |
| **Stedi** | Software companies and providers | JSON APIs, raw X12 APIs, SFTP | Per transaction, published: claims $0.30 down to $0.10, eligibility $0.30 to $0.08, ERAs $0.20 to $0.08 per adjudicated claim, 277CA free; free sandbox | Enrollment by API with statuses; webhooks for 277CA and 835 |
| **Claim.MD** | Small practices and billing services | Web, uploads, PMS integrations, API | Unlimited plan $120 a month (claims, ERAs, 1,000 eligibility checks); $60 for 100 transactions; $30 base | Paper claims $1.00, attachments $0.60 |
| **Office Ally** | Small practices | Web Service Center, uploads, integrations | "Start for Free*" with "Transactional fees may apply"; eligibility $10 a month for 100 | Attachments $0.55; an EHR at $44.95 a month per provider |
| **Vyne Dental** | Dental practices | PMS integrations | Not published | Claims, attachments, eligibility; claims 84,000+ practices |
| **DentalXChange** | Dental practices | ClaimConnect web, desktop tool, PMS integrations | Not published | Real-time eligibility, benefits and claim status; integrated with Denticon, Open Dental and others |

Three patterns:

- **Two business models.** Enterprise clearinghouses (Change, Waystar, Availity) sell to health systems and payers on contracts; small-practice and developer clearinghouses (Claim.MD, Office Ally, Stedi) publish prices, sometimes per transaction, sometimes as flat monthly plans.
- **Clearinghouses connect to clearinghouses.** No clearinghouse holds a direct connection to every payer; many routes pass through a second clearinghouse that has the payer relationship. The practice sees one vendor, but an outage or a rejection can come from a hop it never chose.
- **Dental is its own network.** Dental payers, codes and attachments are different enough that dental practices use dental clearinghouses, usually the one integrated with their PMS.

## What a Clearinghouse Does

Beyond routing, a clearinghouse does five jobs, and each is a place a product can choose to rely on it or do the work itself:

1. **Translation.** The legal definition is translation, and in practice it runs both ways: a PMS sends a proprietary format or JSON and the clearinghouse produces the 837; an 835 comes back and the clearinghouse produces a report or JSON. Stedi accepts claims as JSON shaped like the CMS-1500 or as raw X12; older clearinghouses accept print images of the paper form.
2. **Edits.** Clearinghouses run their own claim edits and payer-specific rules before forwarding, rejecting with a 277CA of their own ([Submission and Acknowledgments](/books/health-tech/claims#submission-and-acknowledgments)).
3. **Routing by payer ID.** Every payer has an identifier at each clearinghouse, and the IDs differ between clearinghouses. One insurer can have several (by line of business, state or claim type), and a third-party administrator pays claims for many employer plans under its own ID.
4. **Enrollment.** Setting up the provider with each payer for the transactions that need it ([Enrollment](#enrollment), below).
5. **Reporting and storage.** Acknowledgments, status, remittance files and a searchable history of every claim, which for many small practices is the only place that history lives.

## Payer IDs and Connectivity

A payer ID is how a claim finds its payer. My rules for handling them:

- **Store the payer ID per clearinghouse,** not on the payer. `Example Health Plan` might be `60054` at one clearinghouse and something else at another; a practice that switches clearinghouses needs a map, not a find-and-replace.
- **Route by transaction.** A payer may support claims but not real-time eligibility at a given clearinghouse, or require enrollment for one and not the other. Stedi's payer network marks each transaction type for each payer as supported, supported with enrollment required, or not supported; the payer list is data the product reads, not a constant.
- **Separate the card name from the route.** The name on a patient's card (a brand or network) often isn't the entity that adjudicates. The route comes from the plan's administrator, which the eligibility response or the card's claims address reveals ([Capturing the Card](/books/health-tech/eligibility-and-benefits#capturing-the-card)).
- **Keep a paper fallback.** Some payers take no electronic claims; the clearinghouse prints and mails them for a fee, or the practice does.

## Enrollment

Three different things are called enrollment, and confusing them stalls a practice's cash for weeks:

| Enrollment | With whom | What it enables | Typical evidence |
| --- | --- | --- | --- |
| **Payer enrollment and credentialing** | The payer's provider network | Being a participating provider at all, with an NPI and tax ID on file | Credentialing applications, CAQH profile; Part 7's Credentialing, Enrollment & Provider Data chapter |
| **EDI enrollment** | The payer, through the clearinghouse | Sending claims, eligibility or status electronically for that payer, where the payer requires it | A form or electronic agreement per payer |
| **ERA and EFT enrollment** | The payer (ERA through the clearinghouse; EFT with the payer or its payment vendor) | Receiving 835s, and receiving payment by ACH instead of check | ERA enrollment per payer; for Medicare, the CMS-588 EFT form |

What the vendors say about the electronic kind, as of October 2026:

- **ERAs always need enrollment.** Stedi: "For 835 ERAs, always yes." Other transactions depend on the payer.
- **ERAs go to one place.** "ERA enrollment is exclusive to one clearinghouse," so enrolling a provider's ERAs at a new clearinghouse stops them arriving at the old one. Switching is a cutover, not a parallel run.
- **It takes days, sometimes a month.** Most of Stedi's enrollments finish in 24 to 48 hours, and "some payers can take up to 30 days." Rejections are commonly incorrect data or a provider not yet credentialed with the payer.
- **Medicare requires EFT.** The CMS-588 form cites 42 CFR 424.510(e)(1): providers and suppliers "are required to receive electronic funds transfer (EFT) at the time of enrollment, revalidation, change of Medicare contractors or submission of an enrollment change request."

Enrollment is a workflow with statuses (Stedi's are draft, Stedi action required, provider action required, provisioning, live, rejected, canceled), documents, a payer on the other end and a practice that has to sign things. A product that hides it behind "connect your clearinghouse" will have customers who submit claims for weeks to payers that aren't set up to send back remittances.

## Pricing

Clearinghouse pricing takes four shapes, all visible in the published price lists above:

- **Per transaction:** a price per claim, eligibility check, status inquiry or remittance, often tiered by monthly volume. Stedi's tiers fall from $0.30 to $0.10 a claim as volume passes 10,000 a month.
- **Flat monthly:** unlimited claims and ERAs for a monthly fee per provider or practice, with eligibility checks capped (Claim.MD's $120 plan includes 1,000).
- **Free to the provider,** paid by payers or by add-ons: Office Ally's free Service Center, with fees for eligibility, attachments and other services.
- **Bundled** into an RCM platform or PMS subscription, or into a percentage-of-collections service.

Extras are where costs hide: paper claims, attachments, eligibility beyond a cap, enrollment fees for some payers, and connection fees for PMS integrations. For a software company embedding a clearinghouse, per-transaction pricing is easiest to pass through and reason about; for a small practice, flat monthly pricing is easiest to budget.

## The API Generation

Older clearinghouse integrations are file drops: the PMS writes an 837 to an SFTP folder (or uploads a print file) and polls a folder for reports. API-first clearinghouses changed three things for software builders:

- **JSON in, JSON out.** Claims and eligibility as JSON with the X12 built by the clearinghouse, and 835s returned as JSON keyed to the original claim's patient control number.
- **Events.** Stedi sends a `transaction.processed` event for each inbound 277CA or 835, as a thin event with IDs that the receiver uses to fetch the transaction; deliveries can repeat and failures are retried for up to 48 hours, so the receiver must process idempotently ([Webhooks: Delivery Guarantees](/docs/api-design/webhooks#delivery-guarantees)).
- **Enrollment and payer lists by API,** so onboarding a provider is a workflow the product can run.

The trade-off is control. A JSON shape that mirrors the CMS-1500 is easy to adopt and can't express everything the 837 can (Stedi's CMS-1500 JSON doesn't support secondary claims; its X12-shaped endpoints do). My default for a product that bills at volume is to build the claim model on the 837's structure, use whichever interface the clearinghouse offers, and keep the raw X12 of every transaction, so the clearinghouse is replaceable.

## Dental Clearinghouses

Dental practices mostly send claims through the clearinghouse their PMS integrates with: Vyne Dental (Trellis) and DentalXChange (ClaimConnect) are two dental-focused clearinghouses, alongside general clearinghouses that also route dental claims. What sets dental apart:

- **Attachments are the product.** X-rays, periodontal charts, intraoral photos and narratives travel with a large share of dental claims, and dental networks built attachment services years before the federal 275 standard ([Attachments](/books/health-tech/claims#attachments)).
- **Eligibility with breakdowns.** Dental clearinghouses sell benefit breakdowns (frequencies, history, category coinsurance) beyond the bare 271, because that's what dental front desks need ([Dental Benefits](/books/health-tech/eligibility-and-benefits#dental-benefits)).
- **The PMS integration is the channel.** DentalXChange lists integrations with Denticon, Dentimax, Dentisoft, Open Dental, Practice Web and The Digital Office; a dental clearinghouse without PMS integrations has little reach.

## The Change Healthcare Attack

On February 21, 2024, UnitedHealth Group "identified that cybercrime threat actors had gained access to certain Change Healthcare information technology systems." Change was one of the largest clearinghouses and payment processors in the country, and its systems were disconnected while they were rebuilt. What UnitedHealth's filings report:

- **Costs.** Direct response costs of $2.2 billion and $867 million of business disruption at Optum Insight in 2024.
- **Provider loans.** Interest-free loans to providers whose cash stopped, "more than $9 billion through December 31, 2024," and in the fourth quarter of 2025 an added $799 million to reserves for collecting provider loans and other customer balances.
- **People affected.** UnitedHealth estimated about 190 million people, with the final count for OCR's breach report to follow. The data breach side of the event (notification, HIPAA enforcement) belongs to Part 3's Security for Health Data chapter.

What the outage taught practices and the software they use:

- **A single clearinghouse is a single point of failure for cash.** Practices that couldn't submit claims or receive remittances had payroll problems within weeks. Waystar's 10-K reports that more than 30,000 providers began adopting its solutions after the incident, which is to say they switched or added a clearinghouse under pressure.
- **Switching is slow because of enrollment.** Claims can be rerouted in days; ERA enrollment and payer EDI enrollment at a new clearinghouse take days to weeks per payer ([Enrollment](#enrollment)).
- **The practice should own its history.** Practices whose claim and remittance history lived only in the clearinghouse lost access to it with the outage.

My rules from it: support at least two clearinghouse integrations; keep the payer ID map, enrollment state and raw transaction history in the product, not only at the clearinghouse; and design the claim pipeline so a payer's route can change from one clearinghouse to another with a configuration change and an enrollment, not a code change.

## Switching Clearinghouses

A planned switch, in order:

1. **Map payer IDs** from the old clearinghouse to the new, for every payer with claims in the last year, and flag payers the new one doesn't reach.
2. **Enroll** at the new clearinghouse for every transaction that requires it, ERAs first because they take longest and are exclusive.
3. **Cut over claims** per payer as its enrollment goes live; claims already submitted stay with the old clearinghouse until they're adjudicated.
4. **Watch ERAs move.** For each payer, the last ERA at the old clearinghouse and the first at the new one should leave no gap; a payer whose ERAs stop entirely is an enrollment that failed.
5. **Keep the old account** read-only until every claim submitted through it has a final remittance, then export the history.

## How to Build It

The core `integrations` table holds a practice's connection to an external system. This chapter adds the clearinghouse-specific records: payer routes per clearinghouse and transaction, and enrollments:

```sql
ALTER TABLE integrations                 -- system_kind = 'clearinghouse'
  ADD COLUMN clearinghouse_role TEXT CHECK (clearinghouse_role IN ('primary', 'secondary',
                                  'dental', 'standby'));

CREATE TABLE payer_connections (              -- how a transaction reaches a payer through one clearinghouse
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  payer_id         UUID NOT NULL REFERENCES payers (id),
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  transaction_set  TEXT NOT NULL CHECK (transaction_set IN ('270', '276', '278', '837P', '837I',
                     '837D', '275', '835')),
  clearinghouse_payer_id TEXT NOT NULL,   -- the ID at this clearinghouse
  support          TEXT NOT NULL CHECK (support IN ('supported', 'enrollment_required',
                     'not_supported', 'paper_only')),
  verified_at      TIMESTAMPTZ NOT NULL,  -- from the clearinghouse's payer list
  UNIQUE (payer_id, integration_id, transaction_set)
);

CREATE TABLE edi_enrollments (         -- EDI, ERA and EFT enrollment, per provider and payer
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  practitioner_id  UUID REFERENCES practitioners (id),  -- null for a group-level enrollment
  payer_id         UUID NOT NULL REFERENCES payers (id),
  integration_id   UUID REFERENCES integrations (id),   -- null for EFT set up with the payer
  kind             TEXT NOT NULL CHECK (kind IN ('edi_claims', 'edi_eligibility', 'era', 'eft')),
  npi              TEXT NOT NULL,
  tax_id_last4     TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'provider_action',
                     'payer_review', 'live', 'rejected', 'canceled', 'superseded')),
  status_note      TEXT,
  documents        UUID[],                -- signed forms, voided check, letters (documents)
  submitted_at     TIMESTAMPTZ,
  live_at          TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ            -- ERA moved to another clearinghouse
);
CREATE UNIQUE INDEX edi_enrollments_live_era_idx
  ON edi_enrollments (organization_id, payer_id, npi)
  WHERE kind = 'era' AND status = 'live';  -- ERA is exclusive to one clearinghouse
```

Routing a claim is then a lookup with a fallback:

```sql
SELECT r.integration_id, r.clearinghouse_payer_id
FROM payer_connections r
JOIN integrations i ON i.id = r.integration_id AND i.organization_id = $1
WHERE r.payer_id = $2
  AND r.transaction_set = $3
  AND r.support IN ('supported', 'enrollment_required')
  AND (r.support = 'supported' OR EXISTS (
        SELECT 1 FROM edi_enrollments e
        WHERE e.organization_id = $1 AND e.payer_id = $2 AND e.status = 'live'
          AND e.integration_id = r.integration_id
          AND e.kind = CASE WHEN $3 LIKE '837%' THEN 'edi_claims' ELSE 'edi_eligibility' END))
ORDER BY CASE i.clearinghouse_role WHEN 'primary' THEN 1 WHEN 'dental' THEN 1 ELSE 2 END
LIMIT 1;
```

Design notes:

- **Routes are data from the clearinghouse,** refreshed from its payer list, with the date verified, never hardcoded.
- **The unique live ERA index** encodes the exclusivity rule: a second live ERA enrollment for the same provider and payer is a mistake the database refuses.
- **Enrollment is a workflow with people in it.** Statuses, notes and documents are the screen; events (`enrollment.live`, `enrollment.rejected`) notify the practice and unblock held claims.
- **Clearinghouse credentials** are secrets per practice or per platform, stored and rotated as the playbook requires ([Secrets](/docs/payments/sensitive-data#secrets)).
- **Every byte through the clearinghouse is logged** in `edi_transactions`, which is what makes a switch survivable.

## Auditing

- **Business associate agreements** with every clearinghouse, and the chain beneath them ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)).
- **Enrollment history** per provider, payer and transaction, with documents and dates, since "when did ERAs start arriving here?" decides where missing remittances went.
- **Route changes,** who moved a payer to another clearinghouse and when.
- **The transaction log,** kept in the product, independent of the clearinghouse's portal.

## What This Means for the System You Build

- **Treat the clearinghouse as replaceable:** payer IDs per clearinghouse, routes per transaction, raw transactions kept in your product.
- **Model the three enrollments separately:** payer credentialing, EDI enrollment and ERA/EFT enrollment, with ERA exclusive to one clearinghouse.
- **Read payer support as data** from the clearinghouse's payer list, including enrollment requirements and paper-only payers.
- **Process clearinghouse events idempotently,** with polling as the fallback.
- **Plan for the clearinghouse to disappear for weeks:** a second integration, enrollment kept current, and claims that can be rerouted by configuration.
- **For dental, integrate with the dental networks** for attachments and benefit breakdowns.

## References

**Regulation**

- [45 CFR 160.103: Definitions](https://www.law.cornell.edu/cfr/text/45/160.103), health care clearinghouse
- [CMS-588: Electronic Funds Transfer authorization agreement](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms588.pdf), the EFT requirement under 42 CFR 424.510(e)(1)

**Filings**

- [UnitedHealth Group: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/731766/000073176625000063/unh-20241231.htm), the February 21, 2024 attack, response and disruption costs, provider loans, the estimate of people affected
- [UnitedHealth Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/731766/000073176626000062/unh-20251231.htm), the 2025 reserve for provider loans
- [Waystar Holding Corp.: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1990354/000199035426000011/way-20251231.htm), transaction and client counts, providers adopting after a competitor's 2024 incident

**Vendor documentation and pricing**

- [Stedi: Transaction enrollment](https://www.stedi.com/docs/healthcare/transaction-enrollment), which transactions need enrollment, timelines, ERA exclusivity, statuses
- [Stedi: Receive claim responses](https://www.stedi.com/docs/healthcare/receive-claim-responses), events, polling, duplicate deliveries and retries, matching 835s to claims
- [Stedi: Submit professional claims](https://www.stedi.com/docs/healthcare/submit-professional-claims), the CMS-1500 JSON shape and its secondary claim limit
- [Stedi: Pricing](https://www.stedi.com/pricing), per-transaction tiers
- [Claim.MD: Pricing](https://www.claim.md/pricing), monthly plans, paper and attachment fees
- [Office Ally: Pricing](https://cms.officeally.com/products/pricing), the free tier and add-on fees
- [Availity Essentials](https://www.availity.com/essentials), the provider portal's transactions
- [Vyne Dental: Vyne Trellis](https://vynedental.com/blog/unlock-the-potential-of-vyne-trellis/), dental claims, attachments, eligibility, practice count
- [DentalXChange: Real-Time](https://help.dentalxchange.com/DentalXChangeHelp/RealTime.htm), dental eligibility and claim status, PMS integrations
