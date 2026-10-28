+++
title = "Sanctions, Exports & Bulletproof Hosts"
nav_title = "Sanctions & Bulletproof Hosts"
description = "OFAC and EU sanctions on infrastructure, the 2022 Russia exits, bulletproof host designations, AI-chip export rules and the withdrawn IaaS KYC rule."
category = "Hosting & Cloud Industry"
order = 2200
part = "Abuse, Trust and the Law"
tags = ["sanctions", "ofac", "export-controls", "kyc", "bulletproof-hosting"]
+++

Sanctions turn a customer's identity into a legal question. A US provider may not provide services to a person on the Treasury Department's Specially Designated Nationals list, or to entities they own, and may not serve comprehensively embargoed regions except under licenses; an EU provider is bound by the Council's regulations; and both sets of rules have reached deep into cloud since 2022, from bans on IT services to Russia to rules about who may rent an AI accelerator. At the same time, the US government has started sanctioning hosting companies themselves: bulletproof hosts, the providers that market their indifference to abuse reports and law enforcement. And for two years the US considered, then dropped, a rule that would have required every infrastructure-as-a-service provider to verify its foreign customers.

This chapter covers what the sanctions regimes require of a provider, how providers responded to the 2022 invasion of Ukraine, the bulletproof hosting designations of 2025, the AI-chip export rules as they touch hosted capacity, and the IaaS customer identification rule's fate. It adds `sanctions_lists`, `sanctions_screenings` and `country_restrictions` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), whose `account_holds` already carry the reason `sanctions`. Legal status throughout is as of October 2026.

## How the Providers Do It

| Provider | What it did after February 2022 | Source |
| --- | --- | --- |
| **Cloudflare** | Kept serving Russia ("Russia needs more Internet access, not less"), terminated sanctioned customers, cut paid access in newly sanctioned regions, and described a sanctions program with outside counsel and screening tools that match on ownership | Blog, March 7, 2022 |
| **Microsoft** | Suspended new sales of products and services in Russia | Blog, March 4, 2022 |
| **AWS** | Stopped new sign-ups from Russia and Belarus; existing customers not affected | GeekWire, March 8, 2022 |
| **Google Cloud** | "Not accepting new Google Cloud customers in Russia at this time" | TechCrunch, March 10, 2022 |

Two strategies sit in that table. The hyperscalers stopped new business in the country and kept the legal minimum running; Cloudflare kept the country and enforced against sanctioned parties within it. Either is lawful as long as screening works, and the screening is the hard part: the lists name people and companies, not accounts, and ownership by a listed person passes the restriction to entities that aren't on any list. In June 2025 the direction reversed: Cloudflare reported that from June 9, Russian ISPs (Rostelecom, Megafon, Vimpelcom, MTS, MGTS) let only the first 16 KB of assets load from its network across HTTP/1.1, HTTP/2 and HTTP/3, without formal notice and with no lawful fix it could make.

## How It Got Here

- **March 2022:** after the invasion of Ukraine, Microsoft, AWS and Google Cloud stopped new business in Russia; Cloudflare stayed and screened.
- **December 18, 2023:** the EU's ban on enterprise-management and design software for Russian entities took effect, cloud delivery included.
- **January 29, 2024:** BIS proposed the IaaS customer identification rule.
- **June 12, 2024:** OFAC barred IT support and cloud-based enterprise software services to Russia, effective September 12, 2024.
- **2025:** OFAC designated Zservers (February 11), Aeza Group (July 1) and Media Land with Aeza's successors (November 19); BIS dropped the AI Diffusion Rule (May 13); Russian ISPs began throttling Cloudflare (June 9); the EU added AI and high-performance computing to Article 5n from November 25; the IaaS rule was withdrawn on December 16.
- **2026:** BIS's case-by-case rule for H200-class chips took effect January 15, with IaaS screening conditions, and the UAE moved to Country Group A:5 in July.

## What the Rules Require

**United States.** OFAC's programs prohibit US persons from providing services to blocked persons (the SDN list, and, under OFAC's 50 Percent Rule, entities "owned 50 percent or more" by them; control without that ownership doesn't block an entity automatically) and, for comprehensive embargoes, to anyone in the embargoed region, unless a general or specific license applies. Two determinations matter most for cloud:

- **Russia: IT and software services.** Under Executive Order 14071, OFAC determined on June 12, 2024, effective September 12, 2024, that US persons may not provide to any person in Russia IT consultancy and design services, IT support services, and cloud-based services for enterprise management software and design and manufacturing software (OFAC FAQ 1128). General cloud hosting isn't in the list by name; enterprise applications delivered as a service are.
- **Iran: communications.** General License D-2, issued September 23, 2022, authorizes certain services, software and hardware incident to communications, which is the license that lets consumer communications and the cloud services they depend on reach people in Iran.

**European Union.** Article 5n of Council Regulation 833/2014 bars providing listed services to the Russian government and to entities established in Russia. IT consultancy came first (2022); from December 18, 2023, Article 5n(2b) added enterprise-management and design software, including software delivered by download from a cloud and, per the Commission's FAQ, "software updates." The 19th package added two prohibitions that apply from November 25, 2025: Article 5n(1)(g) on artificial intelligence, which the Commission's FAQ of January 22, 2026 says "prohibits providing the Russian Government and Russian entities with both the use of hosted AI models and the infrastructure to build, modify or run their own," and 5n(1)(h) on high-performance computing, where the FAQ says "GPU-as-a-Service is covered," including GPU virtual machines and bare metal. The same FAQ says cloud services are "in general not covered" by the IT consultancy prohibition, but that Article 5n(3) catches listed software delivered as SaaS.

The practical result: a US or EU cloud can still host a Russian individual's website in many cases, but not run enterprise software for a Russian company, not sell GPU capacity or hosted models to one, and not touch a listed person anywhere. A provider's systems have to know the customer's country, its ownership where it is an entity, and which products each restriction covers.

## Bulletproof Hosts

A bulletproof host is a provider whose product is non-enforcement. OFAC's definition, in its November 19, 2025 action, is servers and infrastructure "built to avoid detection and withstand law enforcement takedown efforts." Three designations in 2025 brought the category under sanctions:

| Date | Target | What OFAC said | Partners |
| --- | --- | --- | --- |
| February 11, 2025 | Zservers (Barnaul, Russia) and administrators Alexander Mishin and Aleksandr Bolshakov | Provided bulletproof hosting to LockBit affiliates | Australia DFAT, UK FCDO |
| July 1, 2025 | Aeza Group, Aeza International Ltd. (UK), Aeza Logistic LLC, Cloud Solutions LLC, and leaders Penzev, Bozoyan, Gast and Knyazev | A bulletproof hosting service "enabling cybercriminals and technology theft" | |
| November 19, 2025 | Media Land LLC, ML Cloud, Media Land Technology, Data Center Kirishi, and officers Volosovik, Zatolokin and Pankova; plus Aeza follow-ons Hypercore Ltd., Makarov, Zakirov, Smart Digital Ideas DOO (Serbia) and Datavice MCHJ (Uzbekistan) for evading the July sanctions by rebranding and front companies | Media Land served ransomware groups including LockBit, BlackSuit and Play; authority E.O. 13694 as amended by E.O. 13757, 14144 and 14306 | UK FCDO, Australia DFAT; FBI coordination |

The November action is the lesson for everyone else: a designated host rebrands and moves its infrastructure to new companies in other countries. For a legitimate provider, that shows up in three places. Upstream: a bulletproof host buys transit, colocation, IP space and servers from someone, and a provider selling those must screen its own wholesale customers. Downstream: a provider's customers include resellers whose customers may be the designated host under a new name ([Know-your-customer reaches through resellers](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label)). And in abuse data: a reseller account whose sub-accounts generate abuse reports at many times the provider's base rate and ignore them is the operational signature, before any designation.

## AI Chips and Hosted Capacity

Export controls on advanced accelerators reach cloud providers when foreign customers rent the chips rather than buy them. GPU & AI Clouds owns the detail; the status as of October 2026, in brief:

- **The AI Diffusion Rule** was rescinded before it took effect: BIS announced on May 13, 2025 that it wouldn't enforce the rule due to take effect on May 15 and would issue a replacement, and the Federal Register showed no replacement or formal rescission rule by October 27, 2026.
- **H200-class chips to China** moved from a presumption of denial to case-by-case review under 91 FR 1684 (January 15, 2026), with conditions that include customer screening to prevent unauthorized remote access and a list of intended IaaS end users in countries of concern, and an aggregate cap of 50% of the compute shipped to US customers.
- **Remote access** by Chinese firms to accelerators in third countries is the open gap: a Commerce draft rule was reported in August 2026 with nothing in the Federal Register, and the Remote Access Security Act (H.R. 2683) passed the House 369 to 22 on January 12, 2026 and sits in the Senate Banking Committee.
- **The UAE** moved to Country Group A:5 under 91 FR 43034 (effective July 10, 2026), giving approved users license-free access to advanced computing items.

For a provider renting GPUs, these rules make the customer's nationality and headquarters, not only its billing country, a provisioning input, which is the same data sanctions screening needs.

## The IaaS Customer Identification Rule

Executive Order 13984 directed Commerce to require US IaaS providers to verify the identity of foreign customers, and Executive Order 14110 added reporting of large AI training runs by foreign persons. BIS published the proposed rule, "Taking Additional Steps To Address the National Emergency With Respect to Significant Malicious Cyber-Enabled Activities" (RIN 0694-AJ35, 89 FR 5698), on January 29, 2024, with comments due April 29, 2024. It would have required each US IaaS provider to run a Customer Identification Program for foreign customers, to deal with foreign resellers only if they ran programs of their own, to report on them, and to report foreign AI training.

E.O. 14110 was revoked by E.O. 14148 on January 20, 2025; E.O. 13984 was not in that list and remains in force. The Fall 2025 Unified Agenda lists RIN 0694-AJ35 under completed actions with a timetable of NPRM January 29, 2024, comment period end April 29, 2024, and "Withdrawn 12/16/2025," with no Federal Register citation for the withdrawal; no final rule was published. As of October 2026, then, the rule was proposed in January 2024 and withdrawn in December 2025, and no US rule requires IaaS customer identification, while the executive order that asked for one still stands.

> [!NOTE]
> The withdrawal removes a compliance deadline, not the problem. Sanctions screening already requires knowing who the customer is and who owns it, and the H200 licensing conditions require screening IaaS users for remote access. A provider that collects identity only where a rule forces it will rebuild the same pipeline the next time one does.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Who uses it |
| --- | --- | --- | --- | --- |
| **Country exit** | Stop new business in a sanctioned country | Simple; low ongoing screening load there | Cuts off ordinary users; doesn't catch listed persons elsewhere | AWS, Microsoft, Google Cloud in Russia (2022) |
| **Stay and screen** | Serve the country, block listed persons and restricted products | Keeps access for ordinary users | Needs good ownership data and product-level rules | Cloudflare in Russia (2022) |
| **Name screening at sign-up only** | Check the account name against the lists once | Cheap | Misses later designations, owners and resellers' customers | Small providers |
| **Continuous screening** | Rescreen every account on each list update, and on changes to account data | Catches new designations within a day | False positives need review capacity | Providers with sanctions programs |
| **Identity verification for risky products** | Verify identity and ownership before GPUs, models or enterprise software | Meets the export and 5n conditions | Friction for legitimate foreign customers | Required in effect by the H200 conditions |

## My Default

My default is to stay and screen: screen every account and every reseller's sub-account at sign-up and again on every list update, against OFAC's SDN and consolidated lists, the EU consolidated list and the UK list, with ownership for entities; restrict by product and country in a rules table, so a Russian entity can't buy enterprise software, GPUs or hosted models while an individual's website stays up where the law allows; and require identity and ownership verification before GPU or model access for anyone outside a short list of countries. A confirmed match gets a `sanctions` hold with `full_suspension`, frozen data (nothing deleted or exported until counsel decides how blocked property must be handled) and counsel's review. Wholesale customers (transit, colocation, IP space, reseller accounts) get the deepest checks, because that's how a bulletproof host reaches the rest of the internet.

What would change this: a provider without the volume to staff review of false positives may be better off exiting a high-risk country than screening badly in it, and a provider selling only to US government customers already verifies everyone.

## How to Build It

Three tables: the lists as versioned data, every screening and its outcome, and product restrictions by country. A match adds an `account_holds` row with reason `sanctions`, which the core model already allows.

```sql
CREATE TABLE sanctions_lists (           -- each list version the provider screened against
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  authority     TEXT NOT NULL CHECK (authority IN ('ofac_sdn', 'ofac_consolidated',
                  'eu_consolidated', 'uk_sanctions_list', 'bis_entity_list', 'other')),
  published_at  TIMESTAMPTZ NOT NULL,    -- the authority's publication of this version
  loaded_at     TIMESTAMPTZ NOT NULL,
  source_hash   BYTEA NOT NULL,          -- of the file as downloaded
  UNIQUE (authority, published_at)
);

CREATE TABLE sanctions_screenings (      -- one account (or owner, or sub-account) against one list
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  screened_party    TEXT NOT NULL CHECK (screened_party IN ('account', 'beneficial_owner',
                      'billing_contact', 'reseller_end_customer')),
  party_name        TEXT NOT NULL,
  party_country     CHAR(2),
  list_id           UUID NOT NULL REFERENCES sanctions_lists (id),
  trigger           TEXT NOT NULL CHECK (trigger IN ('signup', 'list_update', 'account_change',
                      'product_request', 'periodic')),
  result            TEXT NOT NULL CHECK (result IN ('clear', 'potential_match', 'confirmed_match',
                      'false_positive')),
  matched_entry_ref TEXT,                -- the list's entry id
  reviewed_by       TEXT,                -- typed actor; required for any match outcome
  reviewed_at       TIMESTAMPTZ,
  hold_id           UUID REFERENCES account_holds (id),
  screened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (result IN ('clear', 'potential_match') OR reviewed_by IS NOT NULL),
  CHECK (result <> 'confirmed_match' OR hold_id IS NOT NULL)
);

CREATE TABLE country_restrictions (      -- which products may be sold to whom, where
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  country         CHAR(2) NOT NULL,      -- customer country, or headquarters for entities
  party_kind      TEXT NOT NULL CHECK (party_kind IN ('any', 'entity', 'government')),
  product_code    TEXT,                  -- null: every product
  effect          TEXT NOT NULL CHECK (effect IN ('blocked', 'verification_required',
                    'no_new_accounts')),
  legal_basis     TEXT NOT NULL,         -- 'EU 833/2014 Art 5n(1)(h)', 'OFAC FAQ 1128', '91 FR 1684'
  valid_during    TSTZRANGE NOT NULL
);
```

The check at provisioning time, run before a GPU or enterprise-software resource is created:

```sql
SELECT r.effect, r.legal_basis
FROM country_restrictions r
JOIN accounts a ON a.id = $1
WHERE r.country = a.country
  AND (r.product_code IS NULL OR r.product_code = $2)
  AND (r.party_kind = 'any'
       OR (r.party_kind = 'entity' AND a.legal_name IS NOT NULL))
  AND r.valid_during @> now();
```

Notes on the sketch:

- **Lists are versions.** Each screening names the list version it used, so "were we screening against the list in force that day" has an answer.
- **Rescreen on every list update.** A job screens all active accounts against each new version; only potential matches reach a reviewer.
- **Owners and end customers are screened parties.** Entities are screened with their beneficial owners; reseller sub-accounts with `end_customer_identity = 'collected'` are screened like direct customers, and resellers that don't collect identities are barred from restricted products.
- **A confirmed match holds and freezes.** The hold is `full_suspension`; deletion and data-return jobs skip the account until counsel releases it.
- **Restrictions are product rules.** The 5n, OFAC and export rules differ by product and party, so they live in data with their legal basis ([Rules as Data](/docs/architecture/rules-as-data#what-belongs-in-data)).
- **Events:** `sanctions_list.loaded`, `sanctions_screening.potential_match`, `sanctions_screening.confirmed` and `country_restriction.changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to compliance review, provisioning and billing.

## Auditing

- **Every screening, list version and reviewer decision,** kept for as long as counsel's retention rule for sanctions records requires.
- **Every confirmed match, its hold and its data freeze,** with when counsel released it.
- **Restriction changes with their legal basis,** and the provisioning requests they refused.
- **Reseller book coverage:** which sub-accounts were screened, which weren't and why.

## What This Means for the System You Build

- **Know the customer's country and, for entities, its owners,** before selling restricted products.
- **Screen continuously,** at sign-up and on every list update, including reseller sub-accounts and wholesale customers.
- **Put product restrictions by country in data** with the legal basis cited.
- **Treat GPU and hosted-model access as export-controlled,** with identity verification first.
- **Hold and freeze on a confirmed match,** and let counsel lift it.
- **Watch for rebranded bulletproof hosts** in wholesale and reseller accounts with outsized, ignored abuse.
- **Build customer identification once,** whether or not the IaaS rule returns.

## References

**Sanctions actions and rules**

- [Treasury: Sanctions on Media Land and Aeza follow-ons](https://home.treasury.gov/news/press-releases/sb0319), November 19, 2025, the bulletproof hosting definition, targets, authorities and partners
- [Treasury: Sanctions on Aeza Group](https://home.treasury.gov/news/press-releases/sb0185), July 1, 2025
- [Treasury: Sanctions on Zservers](https://home.treasury.gov/news/press-releases/sb0018), February 11, 2025
- [OFAC: FAQ 398](https://ofac.treasury.gov/faqs/398), the 50 Percent Rule speaks to ownership, not control
- [OFAC: FAQ 1128](https://ofac.treasury.gov/faqs/1128), the June 12, 2024 IT and software services determination, effective September 12, 2024
- [OFAC: Recent actions, September 23, 2022](https://ofac.treasury.gov/recent-actions/20220923), Iran General License D-2
- [European Commission: FAQ on Russia sanctions, software (February 6, 2024)](https://finance.ec.europa.eu/system/files/2024-02/faqs-sanctions-russia-software_en%2C.pdf), Article 5n(2b) from December 18, 2023, including cloud downloads and updates
- [European Commission: FAQ on Russia sanctions, provision of services (January 22, 2026)](https://finance.ec.europa.eu/system/files/2023-07/faqs-sanctions-russia-services-provision_en.pdf), Article 5n(1)(g) and (h), GPU-as-a-Service, cloud and SaaS

**Provider responses**

- [Cloudflare: Steps taken around Cloudflare's services in Ukraine, Belarus and Russia](https://blog.cloudflare.com/steps-taken-around-cloudflares-services-in-ukraine-belarus-and-russia/), March 7, 2022
- [Microsoft: Microsoft suspends new sales in Russia](https://blogs.microsoft.com/on-the-issues/2022/03/04/microsoft-suspends-russia-sales-ukraine-conflict/), March 4, 2022
- [GeekWire (archived): Amazon halts AWS sign-ups in Russia and Belarus](http://web.archive.org/web/2022/https://www.geekwire.com/2022/amazon-halts-aws-cloud-signups-in-russia-and-belarus-existing-customers-not-impacted/), March 8, 2022
- [TechCrunch: Amazon, Microsoft and Google have suspended cloud sales in Russia](https://techcrunch.com/2022/03/10/amazon-microsoft-and-google-have-suspended-cloud-sales-in-russia), March 10, 2022, Google Cloud's statement
- [Cloudflare: Russian Internet users are unable to access the open Internet](https://blog.cloudflare.com/russian-internet-users-are-unable-to-access-the-open-internet/), throttling from June 9, 2025

**Export controls and the IaaS rule**

- [BIS: Department of Commerce rescinds the AI Diffusion Rule](https://www.bis.gov/press-release/department-commerce-rescinds-biden-era-artificial-intelligence-diffusion-rule-strengthens-chip-related), May 13, 2025
- [Federal Register: BIS final rules January to October 2026](https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=industry-and-security-bureau&conditions[publication_date][gte]=2026-01-16&conditions[type][]=RULE), no diffusion replacement as of October 27, 2026
- [Federal Register: Revision to license review policy for advanced computing commodities](https://www.federalregister.gov/documents/2026/01/15/2026-00789/revision-to-license-review-policy-for-advanced-computing-commodities), 91 FR 1684, January 15, 2026, the case-by-case policy and its conditions
- [AI Weekly: Commerce drafts rule on remote AI chip access](https://aiweekly.co/alerts/commerce-drafts-rule-to-shut-chinas-remote-ai-chip-access), August 30, 2026, press report of the draft
- [House Clerk: Roll call 13, January 12, 2026](https://clerk.house.gov/evs/2026/roll013.xml), H.R. 2683 passed 369 to 22
- [Federal Register: Enhanced favorable treatment for the United Arab Emirates](https://www.federalregister.gov/api/v1/documents/2026-14132.json), 91 FR 43034
- [Federal Register: Taking additional steps to address the national emergency (NPRM metadata)](https://www.federalregister.gov/api/v1/documents/2024-01580.json), 89 FR 5698, January 29, 2024, RIN 0694-AJ35, comments to April 29, 2024, the E.O. 13984 and 14110 basis and what the proposal would have required
- [Reginfo.gov: Fall 2025 Unified Agenda, RIN 0694-AJ35](https://www.reginfo.gov/public/do/eAgendaViewRule?pubId=202510&RIN=0694-AJ35), completed actions, "Withdrawn 12/16/2025"
- [GovInfo: Executive Order 14148](https://www.govinfo.gov/content/pkg/FR-2025-01-28/html/2025-01901.htm), January 20, 2025, revocation of E.O. 14110
