+++
title = "Open Banking in the UK & EU"
description = "UK and EU open banking on the data side: PSD2 account information, the CMA Order and UK standard, 90- and 180-day reauthentication, PSD3, the PSR and FIDA."
category = "Banking & Lending Industry"
order = 2431
part = "Fintech and BaaS"
tags = ["banking", "fintech", "open-banking", "psd2", "uk", "eu", "data-access"]
+++

In the UK and the EU, open banking is law first and market second, the reverse of the US. PSD2 made access to payment accounts a regulated service in 2018: an **account information service provider** (AISP) may read a customer's payment accounts with their consent, the bank (the **account servicing payment service provider**, ASPSP) must let it, and screen scraping gave way to dedicated interfaces. The UK added a competition remedy on top, ordering its nine largest banks to build one common standard. Both regimes then spent years discovering that the hard part wasn't the API but the consent life cycle, and both rewrote the rule that made customers reauthenticate at their bank every 90 days.

This chapter covers the data side only: account information, the interfaces banks must offer, reauthentication and its 2022-23 rewrites, the UK's standard and its future entity, PSD3 and the Payment Services Regulation as they bear on data access, and the Financial Data Access proposal (FIDA) that would extend sharing beyond payment accounts. Payment initiation, variable recurring payments, Confirmation of Payee, APP fraud reimbursement and who licenses whom are the Payments volume's: [Open Banking](/books/payments/eu-and-uk#open-banking) and [Who Regulates You](/books/payments/eu-and-uk#who-regulates-you) in Payments in the EU & UK, and [Bank Push and Bank Pull](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull) for VRP. The US regime, and the data model this chapter extends, are in [Open Banking in the US](/books/banking-and-lending/open-banking).

## How the Regimes Compare

As of October 2026:

| | UK | EU | US |
| --- | --- | --- | --- |
| **Legal basis** | Payment Services Regulations 2017 and the FCA's version of the SCA-RTS; the CMA's Retail Banking Market Investigation Order 2017 for the nine largest banks | PSD2 and its regulatory technical standards (Delegated Regulation 2018/389, amended by 2022/2360) | Section 1033 and 12 CFR part 1033, enjoined since October 29, 2025 |
| **Who may access** | Authorized or registered AISPs | Authorized or registered AISPs | Anyone the consumer authorizes, by contract with the bank or aggregator |
| **Common standard** | The Open Banking Standard (Read/Write API v4.0.1), mandatory for the CMA9 | No single mandated standard | FDX, by market adoption |
| **Reauthentication** | Bank applies SCA at first access only (Article 10A); the AISP reconfirms consent with the customer every 90 days | Bank must not apply SCA through an AISP (Article 10a), renewing at least every 180 days | Third party reauthorizes at least yearly under the rule as written; banks' own consents commonly 12 months |
| **Screen scraping** | An interface that relies on screen scraping isn't a dedicated interface | Dedicated interfaces under the RTS | Barred for covered banks under the rule as written; still in use |
| **Contract with the bank** | Not required: the bank may not require the AISP to enter into a contract first (PSRs 2017 reg. 70) | The same principle, from PSD2's access article that reg. 70 implements | The system runs on bilateral data access agreements; JPMorgan Chase charges per call |
| **What's next** | A long-term regulatory framework from the FCA, a successor to Open Banking Limited, open finance under the Data (Use and Access) Act 2025 | PSD3 and the Payment Services Regulation awaiting adoption; FIDA stalled in trilogue | A revised 1033 proposal under review |

The pattern is that the regimes converge on the same objects: a registered third party, a consent with a scope and a duration, a bank-side interface that performs, and a reauthentication clock. They differ in who holds the clock and how long it runs, which is why the US chapter's `data_authorizations` carries a `regime` column.

## Account Information Under PSD2

An **account information service** is an online service providing "consolidated information on one or more payment accounts" held with other providers (the UK's implementing regulations' wording, quoted in [Payments in the EU & UK](/books/payments/eu-and-uk#open-banking)). Budgeting apps, affordability checks, accounting feeds for small businesses and income verification are all AIS. The service covers **payment accounts**: current accounts and, in the UK's scope, credit card accounts and equivalent SME accounts. Savings, mortgages, investments, pensions and insurance are outside PSD2, which is what FIDA would change.

The bank's side has three duties that matter to engineering:

- **A dedicated interface** for AISPs, with the performance and availability the RTS require, and documentation. The FCA's position is direct: "We do not consider an interface that uses screen scraping to be a" dedicated interface.
- **Strong customer authentication** when the customer first connects, applied by the bank, not the AISP ([What SCA Requires](/books/payments/strong-customer-authentication#what-sca-requires)).
- **No contract as a condition, and no discrimination.** The bank must treat an AISP's data requests like the customer's own unless it has "objective reasons for treating the request differently", and must not "require the account information service provider to enter into a contract" first (PSRs 2017 reg. 70(2)). That is the opposite of the US, where bilateral agreements are the system.

The AISP's duties mirror them: no service without the customer's "explicit consent", no request for sensitive payment data, and no use, access or storage of information for any purpose other than the service the customer explicitly requested (reg. 70(3)), the UK's version of the US rule's "reasonably necessary" limit.

## Reauthentication: 90 Days, Then Two Answers

The original RTS let banks skip SCA for account information access, but only if SCA had been applied within the previous 90 days. In practice every connection broke every 90 days unless the customer went back through their bank's login, and many didn't. The FCA's PS21/19 reported respondents' evidence that AISPs saw **customer attrition of around 20 to 40%** at the 90-day mark when SCA was required.

**The UK's answer (PS21/19, November 2021).** A new **Article 10A** exemption: once SCA has been applied at the first access, the bank need not apply it again when the customer accesses, through an AISP, the balance and "payment transactions executed in the last 90 days" without sensitive payment data. In exchange, the **AISP must reconfirm the customer's explicit consent at least every 90 days** (Article 36(6)), and "where a customer fails to reconfirm consent after 90 days, TPPs must stop accessing the customer's account information", though access may restart if the customer reconfirms later. The FCA "strongly encourage[s]" banks to rely on the exemption, but they may still require SCA where they have proportionate, objective reasons such as suspected fraud. Articles 10A and 36(6) came into force on **26 March 2022**, and AISPs had four months after that to start reconfirming. The same policy statement required banks offering personal payment accounts, equivalent SME accounts and consumer or SME credit card accounts to have a dedicated interface within 18 months, the change to Article 31 coming into force on 26 May 2023.

**The EU's answer (Delegated Regulation 2022/2360).** The EBA's final report (April 2022) made the exemption **mandatory** when the customer goes through an AISP, a new Article 10a under which the bank must not apply SCA subject to conditions, and extended the renewal period **from 90 days to 180 days**, whether access is through an AISP or direct. It applies from **25 July 2023**.

So the same budgeting app, connected on the same day, runs two different clocks. In the UK the bank's SCA happens once and the app owes the customer a reconfirmation every 90 days; in the EU the bank's SCA renews at most every 180 days and the app has no separate reconfirmation duty under the RTS. In the UK the exemption covers balances and transactions from the last 90 days, so a request for older history goes back through SCA. Plaid reports EU and UK consents typically lasting 180 days at the connection layer, which is the aggregator's view of the bank's clock, not a substitute for the UK reconfirmation the AISP itself owes.

## The UK Standard

The UK's open banking began as a competition remedy. The CMA's Retail Banking Market Investigation Order, published 2 February 2017, required the nine largest banks in Great Britain and Northern Ireland to release read/write personal current account data sets by **13 January 2018**, through a common standard maintained by an implementation entity, now Open Banking Limited (OBL). On **12 January 2023** the CMA announced the roadmap was substantially complete, with six of the nine (Barclays, HSBC, Lloyds, Nationwide, NatWest and Santander) having implemented it.

As of October 2026:

- **The standard.** OBL maintains the Open Banking Standard, including the Read/Write API (v4.0.1), Customer Experience Guidelines (v4.0) and dynamic client registration. OBL says more than 18 million people and businesses actively use open banking-powered apps, and reported one billion open banking payments on 21 September 2026.
- **The future entity.** OBL is preparing to hand over to a successor, following the Joint Regulatory Oversight Committee's recommendations. The FCA said in June 2026 it supports industry efforts to set up an independent standards body and will consult on a long-term regulatory framework for open banking by the end of 2026, subject to legislation expected to give it new powers, and will publish an open finance roadmap.
- **The legal footing.** The Data (Use and Access) Act 2025 lets the Treasury require providers to use prescribed interfaces ([Payments in the EU & UK](/books/payments/eu-and-uk#open-banking) cites section 14), the basis for moving beyond the CMA Order's nine banks and beyond payment accounts.
- **Commercial VRP.** The UK Payments Initiative's scheme launched on 2 June 2026; it is a payments product ([Bank Push and Bank Pull](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull)), and its relevance here is that the same consent and dashboard machinery now carries payment mandates as well as data access.

## PSD3, the PSR and FIDA

**PSD3 and the Payment Services Regulation.** The Commission proposed both on 28 June 2023 alongside FIDA. The Council and Parliament reached a provisional agreement on 27 November 2025; the Council's General Secretariat put the final compromise text of the PSR to the member states' ambassadors on 17 April 2026 (Council document 8221/26), and Parliament's ECON committee approved the agreed text on 5 May 2026. As of October 2026 the Parliament's procedure file shows the plenary vote only as forecast (for 14 December 2026) and no Council adoption or Official Journal publication, so no application date is fixed. The [Payments Rulebook](/books/payments/payments-rulebook#outside-the-us) tracks the status. For data access the structural change is that the open banking rules move into the PSR, a directly applicable regulation, rather than a directive each member state transposes, and the compromise text makes them far more specific. Article numbers are the compromise text's:

- **A dedicated interface, with parity.** A bank with online accounts must have at least one dedicated interface (Article 35), whose availability and performance are at least equal to the interface it uses with its own customers (Article 38). Unavailability is presumed when five consecutive requests get server errors or no response within 30 seconds; planned downtime needs a month's notice and should normally fall between 00:00 and 06:00.
- **A permissions dashboard at the bank** (Article 43). For each consent: the provider, the account, the purpose, the validity period and date given, the data categories and the dates data was accessed; withdrawal per provider or for all; re-establishing a withdrawn consent within 48 hours; and a two-year record of withdrawn and expired consents. The dashboard must be neutral, and the bank may not prompt the customer to withdraw.
- **A list of prohibited obstacles** (Article 44), among them requiring the AISP to register again with the bank, checking the permission the customer gave the AISP, making the customer type their account identifier into the bank's domain, applying SCA more times than the bank does for its own customers, and an interface that doesn't support all of the bank's authentication methods. Fraud measures and GDPR compliance aren't obstacles when they are necessary.

**FIDA.** The Financial Data Access proposal would "establish clear rights and obligations to manage customer data sharing in the financial sector beyond payment accounts": the categories PSD2 leaves out, such as savings, investments, insurance and pensions. In February 2025 a leaked Commission document reported by POLITICO said FIDA would be withdrawn; the Commission's work programme kept it among pending proposals. A Commission non-paper circulated to the Council's working party on 6 April 2026 says there had been "no developments on FiDA in the European Parliament following the second trilogue meeting in June 2025", that the Council had yet to converge on whether gatekeepers under the Digital Markets Act should be excluded, and offers a phased entry into application over 48 months to unblock it. As of October 2026 the Parliament's procedure file records no agreement, so FIDA is still a pending proposal in trilogue.

For a builder, PSD2 and the 2022-23 RTS amendments are what bind today, in both jurisdictions. The PSR will replace the EU text on dates its final version sets, and FIDA, if it passes, adds data categories and a fee model to the same consent machinery.

## Worked Numbers: Three Clocks for One Connection

A customer connects a budgeting app to a current account on **10 January 2026**. The bank applies SCA at connection in every case.

| Regime | Who acts | Deadline | Date |
| --- | --- | --- | --- |
| UK (Article 36(6)) | The AISP reconfirms explicit consent with the customer | 90 days after connection | 10 April 2026, then every 90 days after each reconfirmation |
| UK (Article 10A) | The bank | SCA again only for history older than 90 days, or for an objective risk reason | As needed |
| EU (Article 10a) | The bank renews SCA | At most 180 days after the last SCA | 9 July 2026 |
| US (1033.421(b), as written and enjoined) | The third party obtains a new authorization | No later than the anniversary | 10 January 2027 |

If the UK customer doesn't reconfirm by 10 April, the app must stop reading the account that day, and its features that depend on the feed (a categorized spending view, an affordability check for a loan, an accounting sync) go stale until they do. An app that reconfirms in the app on 3 April resets the clock to 2 July. The design consequence is the same as in the US chapter: the reconfirmation prompt is scheduled from the stored due date, starts well before it, and the product has a defined behavior for the day after.

## How to Build It

These are deltas against the US chapter's [`data_authorizations`](/books/banking-and-lending/open-banking#how-to-build-it), which already carries `regime` (`uk_ais`, `eu_ais`) and `reauthorize_by`, and against `data_access_grants` on the bank side. The UK and EU add who owns each clock and a record of every reconfirmation and every SCA-exempt access:

```sql
ALTER TABLE data_authorizations
  ADD COLUMN aisp_reference       TEXT,           -- the provider's FCA or national register entry
  ADD COLUMN aspsp_sca_at         TIMESTAMPTZ,    -- last SCA at the bank, as reported back
  ADD COLUMN aspsp_sca_due_at     TIMESTAMPTZ,    -- EU: aspsp_sca_at + 180 days
  ADD COLUMN reconfirm_due_at     TIMESTAMPTZ,    -- UK: last confirmation + 90 days
  ADD CONSTRAINT uk_reconfirm CHECK (regime <> 'uk_ais' OR reconfirm_due_at IS NOT NULL),
  ADD CONSTRAINT eu_sca_clock CHECK (regime <> 'eu_ais' OR aspsp_sca_due_at IS NOT NULL);

CREATE TABLE consent_reconfirmations (       -- UK Article 36(6): the AISP's 90-day duty
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  data_authorization_id UUID NOT NULL REFERENCES data_authorizations (id),
  prompted_at           TIMESTAMPTZ NOT NULL,
  outcome               TEXT NOT NULL CHECK (outcome IN ('reconfirmed', 'declined', 'lapsed')),
  decided_at            TIMESTAMPTZ,        -- when the customer acted, or the due time for 'lapsed'
  screen_version        TEXT NOT NULL,      -- what the customer saw; consent must be explicit
  next_due_at           TIMESTAMPTZ         -- decided_at + 90 days when reconfirmed
);

CREATE TABLE ais_access_events (             -- bank side: each AISP access and the SCA basis
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  data_access_grant_id  UUID NOT NULL REFERENCES data_access_grants (id),
  accessed_at           TIMESTAMPTZ NOT NULL,
  data_scope            TEXT NOT NULL CHECK (data_scope IN ('balance', 'transactions_90d',
                          'transactions_older', 'account_details')),
  sca_basis             TEXT NOT NULL CHECK (sca_basis IN ('sca_performed', 'uk_art_10a',
                          'eu_art_10a', 'sca_required_risk')),
  risk_reason           TEXT,               -- required when the bank insists on SCA despite the exemption
  CHECK (sca_basis <> 'sca_required_risk' OR risk_reason IS NOT NULL),
  CHECK (data_scope <> 'transactions_older' OR sca_basis IN ('sca_performed', 'sca_required_risk'))
);
```

On the AISP side, a scheduled job reads `reconfirm_due_at` and prompts the customer ahead of it; at the deadline, a lapsed reconfirmation sets the connection's status and stops pulls in the same transaction, so the "must stop accessing" rule is enforced by the data path, not by a reminder email. On the bank side, `ais_access_events` lets the bank show both that it applied the exemption (the FCA's expectation) and, when it didn't, the objective reason; the last constraint encodes that older history isn't covered by the exemption. Registration with the regulator is a property of the third party on both sides (`third_party_registrations` at the bank, `aisp_reference` here). Personal data handling sits under the GDPR in both jurisdictions ([Mapping It onto a System](/docs/compliance/gdpr#mapping-it-onto-a-system)).

## Auditing

AISPs are supervised by the FCA or their national authority; banks are examined on their dedicated interfaces and SCA application; and the GDPR applies to the data throughout. Keep:

- **Every consent and reconfirmation,** with the screen shown, the outcome and the next due date, and evidence that access stopped on a lapse.
- **The bank's SCA record** per connection: when applied, the exemption relied on for each access, and the reason whenever SCA was required anyway.
- **Interface performance and availability,** the figures the RTS and the UK standard ask banks to report.
- **Third-party registration checks,** against the regulator's register, at onboarding and on change.
- **Retention and deletion** of account data after consent ends ([Retention Windows](/docs/architecture/data-retention#retention-windows)).

## What This Means for the System You Build

- **One consent model, several clocks:** the regime decides who reauthenticates or reconfirms, and when; store each due date, don't compute it from memory.
- **The UK clock is the app's,** every 90 days, and a lapse means stop reading that day.
- **The EU clock is the bank's,** 180 days, with SCA-free access mandatory through an AISP.
- **Older history needs SCA** under the UK exemption; design features around the 90-day window.
- **No contract as a condition under PSD2;** the US's bilateral agreements don't carry over.
- **Plan for PSD3, the PSR and FIDA by their final texts,** with scope and data categories as configuration; the PSR's dashboard fields map onto the consent rows above.

## References

**Law and regulation**

- [legislation.gov.uk: Payment Services Regulations 2017, regulation 70](https://www.legislation.gov.uk/uksi/2017/752/regulation/70), access to payment accounts for account information services: non-discrimination, no contract as a condition, explicit consent and the limits on the AISP's use of data
- [FCA: PS21/19, Changes to the SCA-RTS and to the guidance in Payment Services and Electronic Money, Our Approach (PDF)](https://www.fca.org.uk/publication/policy/ps21-19.pdf), the Article 10A exemption, 90-day reconfirmation under Article 36(6), the 20 to 40% attrition evidence, stopping access on a lapse, screen scraping, and the commencement dates
- [EBA: Final report on the amendment of the RTS on SCA and CSC](https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-final-report-amendment-its-technical-standards), April 5, 2022, the mandatory exemption and the 180-day renewal
- [GOV.UK: Retail banking market investigation order 2017](https://www.gov.uk/government/publications/retail-banking-market-investigation-order-2017), published 2 February 2017
- [GOV.UK: CMA case, review of banking for SMEs](https://www.gov.uk/cma-cases/review-of-banking-for-small-and-medium-sized-businesses-smes-in-the-uk), Article 14's 13 January 2018 deadline and the roadmap's substantial completion on 12 January 2023
- [Council of the EU: PSR final compromise text, document 8221/26 (17 April 2026)](https://data.consilium.europa.eu/doc/document/ST-8221-2026-INIT/en/pdf), Articles 35, 38, 43 and 44: the dedicated interface, availability and the 30-second test, the permissions dashboard and the prohibited obstacles
- [European Parliament: Legislative Observatory, 2023/0210(COD)](https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2023/0210(COD)), the PSR procedure: committee approval on 5 May 2026 and the forecast plenary date
- [Council of the EU: FiDA, Commission non-paper on options for finalising trilogue negotiations, WK 5041/2026 (6 April 2026)](https://data.consilium.europa.eu/doc/document/WK-5041-2026-INIT/en/pdf), no Parliament developments since June 2025, the gatekeeper question and phased application
- [European Parliament: Legislative Observatory, 2023/0205(COD)](https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2023/0205(COD)), the FIDA procedure, with no agreement recorded
- [European Commission: Financial data access and payments package](https://finance.ec.europa.eu/publications/financial-data-access-and-payments-package_en), the 28 June 2023 proposals and FIDA's scope beyond payment accounts

**Regulators and standard setters**

- [FCA: Launch of the UK Payments Initiative scheme](https://www.fca.org.uk/news/statements/open-banking-launch-uk-payments-initiative-scheme), 2 June 2026, the independent standards body, the long-term framework consultation and the open finance roadmap
- [Open Banking Limited: About us](https://www.openbanking.org.uk/about-us/), the standard's components and versions, active users, one billion payments and the future entity

**In practice**

- [Financial Institutions News: SCA amendments to apply from 25 July 2023](https://www.financialinstitutionsnews.com/2022/12/05/sca-amendments-to-apply-from-25-july-2023/), Delegated Regulation 2022/2360's application date and changes
- [The Paypers: European Commission to reportedly cancel FIDA bill](https://thepaypers.com/fintech/news/european-commission-to-reportedly-cancel-fida-bill), the February 2025 leak and the work programme listing
- [Plaid: OAuth guide](https://plaid.com/docs/link/oauth/), EU and UK consents typically lasting 180 days at the connection layer
