+++
title = "DNS Abuse at the Registrar"
description = "ICANN's 2024 DNS abuse amendments for registrars and registries, the path from report to clientHold, enforcement numbers, and the policy work still coming."
category = "Hosting & Cloud Industry"
order = 2166
part = "Domains and DNS"
tags = ["domains", "dns-abuse", "icann", "registrars", "phishing", "abuse-desk"]
+++

A registrar can't take down a page. It holds a name in a registry on a customer's behalf, and the only levers it has are the ones the registry protocol gives it: tell the registry to stop publishing the name in the DNS, change the name servers, lock the name so it can't move, or delete it. Every one of those acts on the whole name, every subdomain under it and every mailbox on it. That is why registrars spent a decade insisting that most abuse belongs to the host, and why the 2024 contract amendments that finally gave them a duty to act are narrow: five kinds of abuse, a standard of "actionable evidence", and a duty to act "promptly" with no clock.

The abuse desk machinery (intake channels, acknowledgments, evidence by category, compromised versus malicious, the layer table from content to network) is in [Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks#dns-abuse-duties), which also summarizes the amendments. This chapter is the registrar and registry view on top of it: how the duty came about, what the contract text says section by section, what a registrar actually does between a report and a `clientHold`, what ICANN Compliance has enforced so far, and the policy work under way as of October 2026. It builds on [ICANN, Registries & Registrars](/books/hosting-and-cloud/icann-registries-and-registrars#the-contracts) for the contracts and on [The Domain Data Model & EPP](/books/hosting-and-cloud/epp-and-domain-data#statuses) for the statuses. None of this is legal advice.

## How the Providers Do It

Registrars publish their abuse channels and scopes, and as of October 2026 they agree on the shape: a categorized form or mailbox, action only at the domain level, and content complaints sent to the host.

| Registrar | Intake | Scope as registrar | What it says it does |
| --- | --- | --- | --- |
| **GoDaddy** | A legal portal with separate forms for phishing, malware, child safety (CSAM), intellectual property, UK/EU complaints, and public safety and illegal content | The forms don't separate registrar from hosting reports | Category forms route to separate queues; the portal states no timelines or actions |
| **Namecheap** | Separate mailboxes for domains it registers and sites it hosts, plus DMCA, Whois inaccuracy, UDRP and law enforcement addresses; API reporting for security firms | When it is only the registrar it "will not take restrictive action in order to avoid false-positive cases" for copyright, spam, fraud and malware on third-party servers, and sends reporters to the host | General target of 72 hours, law enforcement within 24; a name in `clientHold` or `serverHold` "has been suspended" |
| **Cloudflare Registrar** | Cloudflare's abuse form | "Registrars can only take action as to entire domains"; acts on "technical abuse like phishing" consistent with ICANN requirements | Puts an interstitial warning page in front of phishing on domains that also use its proxy, and suspends the domain only when it can't place one: 3,310 registrar actions in H2 2025, 2,567 in H1 |
| **Porkbun** | A form hosted by CleanDNS, with a report ID for status checks | Acts only on DNS-related abuse under its ICANN contract; "cannot arbitrate content disputes or trademark issues" | Confirmation within 24 hours; complaints need "definitive and verifiable proof"; follow-up only if it needs more information |
| **Squarespace** | Separate forms for malware, phishing and pharming, and spam on domains it registers | When it doesn't host the site, "Squarespace does not control the content" and the reporter must go to the owner or host | Before filing, confirm the domain is registered and managed through Squarespace |
| **Tucows** (OpenSRS, Enom, Ascio, EPAG) | One form across its registrars, with an acknowledgment and case number, tracked in Freshdesk | "Domain name registrars are not responsible for the content of the sites those domain names point to"; reporters should try the registrant, then the host | For phishing, pharming and malware, resets the name servers so the domain doesn't resolve, or works with the registrant on a compromised site; OpenSRS lists suspension, forwarding to the host and registrant notice with time to fix |
| **Network Solutions** (Newfold Digital) | One web form across more than twenty Newfold brands, with 14 inquiry types including phishing, malware and spam | Acts on confirmed terms violations, or where ICANN or registry policy requires it | Creates a case ID; any response is "at our sole discretion" and updates may be withheld "due to privacy reasons" |
| **IONOS** | An abuse mailbox, with evidence requirements per type and current WHOIS or RDAP data | As a registrar it may be unable to verify complaints about content it can't access; unless the name itself shows abuse, "only the host" can resolve the case quickly | Automatic case creation when the domain or IP maps to a customer; some services suspended immediately, others given time to fix; no replies to complainants |

Four patterns run through the table:

- **Domain-level action only.** Every registrar that states a scope says it acts on the whole name and sends content complaints to the host. The ones that also host (Namecheap, IONOS, Squarespace, GoDaddy, Newfold's brands) split the queues by which role they play for the reported name.
- **Registrar-only abuse means suspension or nothing.** A registrar with no other service on the name has `clientHold` and a name-server change; Cloudflare's interstitial is available only because most of its registrar customers also run traffic through its proxy, which is a hosting-or-proxy layer action, not a registrar one.
- **Intake is increasingly outsourced.** Porkbun's form runs on CleanDNS; NetBeacon, below, routes standardized reports to registrars that opt in. The registrar still owns the receipt and the decision.
- **Outcomes are rarely reported back.** Porkbun, Newfold and IONOS say they may not answer the reporter. The amendments require a receipt, not an outcome.

## How We Got Here

**The 2013 contracts: a contact, not a duty (2013).** The 2013 Registrar Accreditation Agreement put an abuse contact and a duty to "investigate and respond" in section 3.18, plus a 24/7 contact for law enforcement whose well-founded reports of illegal activity must be reviewed within 24 hours. The 2013 base registry agreement's Specification 11, section 3(b), had registries analyze their TLDs for "security threats" (pharming, phishing, malware, botnets) and keep statistics. It solved reachability; it cost nothing to comply with on paper, because "respond" could mean a form letter, and that gap is what the next decade argued about.

**The voluntary Framework to Address Abuse (October 2019).** Eleven registries and registrars (Public Interest Registry, GoDaddy, Donuts, Tucows, Amazon's registry and registrar, Blacknight, Afilias, Name.com, Neustar and Nominet UK) signed a framework ahead of ICANN66 that said they "must" act on five forms of DNS abuse: malware, phishing, botnets, pharming, and spam only when it delivers one of the others. It drew the line that later became contract language: no action on website content generally, with exceptions where they "should" act (child sexual abuse material, illegal online opioid sales, human trafficking, and specific and credible incitements to violence). It solved the definition problem for the signatories; it bound nobody else.

**SAC115 (19 March 2021).** ICANN's Security and Stability Advisory Committee proposed an "interoperable approach" to abuse handling: standard definitions, notifier programs, evidentiary standards, escalation paths, reasonable timeframes and a single point of contact. Its allocation of responsibility is the one the contracts now follow: the registry is the primary point of responsibility for the TLD, the registrar "holding the contract with the registrant" for an individual name, and the registrar "should be the first to take action" barring urgent circumstances, with the host often the most effective party for content. The amendments' DNS Abuse definition cites SAC115's section 2.1.

**Shared reporting tools (2021 to 2024).** Public Interest Registry founded the DNS Abuse Institute in 2021 and launched NetBeacon on 8 June 2022: a free, centralized reporting service that standardizes reports, enriches them for registrars, and routes them, through its own site, forms embedded on registrar sites, or an API for approved reporters. The institute was renamed the NetBeacon Institute in May 2024. Tools like this solved the quality problem the registrars complained about (reports with no evidence, sent to the wrong party); they don't change who must decide.

**The amendments (2022 to April 2024).** The Contracted Parties House proposed negotiating DNS abuse obligations on 4 November 2022; ICANN formally started the amendment process on 15 January 2023 and opened public comment on 29 May 2023. Voting ran from 9 October to 8 December 2023, and every threshold was met on 7 November 2023. Registrars approved with 94.01% of domains under management against a 90% threshold; registries with 80.57% of fees against 66.67% and 76.39% of operators against a simple majority, where abstaining counted as "no". The Board approved on 21 January 2024, ICANN issued notices and its advisory on 5 February 2024, and the amendments took effect on **5 April 2024**. They turned the voluntary framework's five categories into an enforceable duty; the cost was the narrowness the contracted parties negotiated in exchange: no fixed deadline, no duty to look beyond the reported name, and no coverage of content abuse.

**Enforcement and the next policy round (2024 to 2026).** ICANN Contractual Compliance began enforcing on the effective date and has published figures and monthly dashboards since ([ICANN Enforcement](#icann-enforcement)). The GNSO Council requested an issue report on further DNS abuse policy on 14 August 2025 and started two policy development processes on 11 December 2025 ([What Comes Next](#what-comes-next)), the first time the community has moved to make abuse duties binding through consensus policy rather than contract negotiation.

## What the Amendments Require

The obligations sit in different places in the two contracts, and the registry's duty is mostly to refer:

| | Registrar (2013 RAA as amended) | Registry (base gTLD Registry Agreement as amended) |
| --- | --- | --- |
| **Definition** | Section 3.18.1: "DNS Abuse" means malware, botnets, phishing, pharming, and spam when spam is a delivery mechanism for the others, as defined in SAC115 section 2.1 | The same definition, used in Specifications 6 and 11 |
| **Abuse contact** | 3.18.1: an email address or web form on or easily reached from the homepage; forms must not require a login | Specification 6, 4.1: an email address or web form, a mailing address, and a primary contact |
| **Receipt** | 3.18.1: confirm receipt; the advisory says the confirmation names the registrar, the reported names and the submission date | 4.1: confirm receipt to the reporter |
| **Investigate** | 3.18.1: "promptly take reasonable steps to investigate and respond" to abuse reports, DNS Abuse or illegal activity | Section 2.8 of the agreement: reasonable steps on reports from law enforcement and governmental agencies |
| **Mitigate** | 3.18.2: with actionable evidence, "promptly take the appropriate mitigation action(s) that are reasonably necessary" to stop or disrupt DNS Abuse, varying with cause, severity and collateral risk | Specification 6, 4.2: with actionable evidence, prompt mitigation that "at a minimum" refers the domain and evidence to the sponsoring registrar or takes direct action; 4.3: remove orphan glue tied to malicious conduct on written evidence |
| **Law enforcement** | 3.18.3: a dedicated 24/7 contact; well-founded reports of illegal activity reviewed within 24 hours | Section 2.8 |
| **Monitoring** | Encouraged, not required: the advisory encourages proactive monitoring of sponsored names | Specification 11, 3(b): periodic technical analysis for DNS Abuse, statistical reports of what was found and done, kept for the agreement's term and provided to ICANN on request |
| **Downstream terms** | Registration agreements must carry the registry's required terms | Specification 11, 3(a): require registrars to prohibit malware, phishing, botnets and similar abuse in their registration agreements, with consequences including suspension |
| **Records** | 3.18.4: publish abuse handling procedures, document receipt and response, keep the records for the shorter of two years or the longest period the law permits, and give them to ICANN on reasonable notice | 3(b) statistics, plus whatever Compliance asks for in an investigation |

Three things in the text matter more than they look:

- **"Actionable evidence" is the registrar's own determination.** The advisory defines it as information readily available to the registrar that is "sufficient to enable the registrar to make a reasonable determination." An incomplete report doesn't end the duty: the registrar reviews what it can reasonably see itself, such as name servers, account data and the content of the reported page. Evidence can come from a report or from the registrar's own analysis.
- **"Promptly" has no number.** ICANN calls it "impossible to prescribe a fixed amount of time"; the advisory's examples of two business days or three hours are illustrations, and the registrar has to be able to explain its timing when asked.
- **The duty survives delegation.** A registrar that lets resellers handle abuse still has to explain and document what was done, because the advisory says delegating to a reseller doesn't remove the duty, the same rule [Registrar Resellers](/books/hosting-and-cloud/icann-registries-and-registrars#registrar-resellers) applies to everything else under RAA 3.12.

## From Intake to Mitigation

The desk mechanics are [Intake](/books/user-generated-platforms/abuse-desks#intake). For a registrar, a report becomes a decision in roughly this order.

**1. Does the registrar sponsor the name, and for whom?** Resolve the reported name to the sponsoring registrar through RDAP ([RDAP](/books/hosting-and-cloud/registration-data-and-rdap#rdap)); if another registrar sponsors it, the disposition is a forward, recorded with the recipient. If the registrar sponsors it, find the account and, for a reseller sale, the reseller and its end customer ([Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label)). A report about a hosted site on a name another registrar sponsors belongs to the hosting desk, not this path.

**2. Is it DNS Abuse?** Map the report to the five categories. Phishing dominates: in September 2026, 513 of 905 registrar complaints received by ICANN Compliance named phishing. A report that isn't DNS Abuse (copyright, fraud with no phishing, content) can still be acted on under the registration agreement's acceptable use terms, but it is outside the contract duty, and most registrars in the table above forward it to the host.

**3. Gather the evidence the registrar can see.** The registrar's view is the domain object, not the page: creation date and registrar of record, statuses, name servers and their recent changes, the account's other names, payment and sign-up signals, and a capture of the reported URL as served (kits cloak by geography and device, so record where and how it was fetched). ICANN's own review uses the same inputs: when Compliance opens an investigation it looks at public registration data (creation date, EPP status, name servers), DNS lookups and whatever the contracted party submits.

**4. Decide whether the registration is malicious or compromised.** The advisory's two registrar scenarios are the pattern. A five-day-old domain hosting a bank-impersonation login page was suspended with `clientHold` within two business days, with a transfer lock as an option. A phishing page on a franchisee's subdomain of a three-year-old corporate domain was not suspended: the registrar asked the registrant to remove the content within three business days. Suspending a compromised name takes down the legitimate owner's website and email, and because a registrar acts only at the second level, every subdomain with it. [Phishing and Malware](/books/user-generated-platforms/abuse-desks#phishing-and-malware) has the signals that separate the two.

**5. Take the action through the registry.** The registrar's actions are EPP commands ([Commands and Responses](/books/hosting-and-cloud/epp-and-domain-data#commands-and-responses)):

| Action | EPP mechanics | Effect | When |
| --- | --- | --- | --- |
| **`clientHold`** | `<domain:update>` adding the `clientHold` status | The registry stops publishing the name in the DNS; nothing below it resolves | The default for a malicious registration |
| **Name-server reset** | `<domain:update>` replacing the host objects with the registrar's own | Resolution moves to servers the registrar controls; Tucows describes resetting name servers so the domain doesn't resolve | When the registrar wants to serve a notice page or sinkhole from its own servers |
| **Transfer lock** | `clientTransferProhibited` | Stops the name moving to another registrar to evade action; the Transfer Policy lets a registrar of record deny a transfer for "evidence of fraud" (section I.A.3.7.1) | With a hold on a malicious name |
| **Update lock** | `clientUpdateProhibited` | Stops the registrant from changing name servers or contacts while the case is open | When the account itself may still be under the abuser's control |
| **Notice and deadline** | No EPP change | The registrant or host removes the content | A compromised name |
| **Delete** | `<domain:delete>` | The name enters redemption and eventually returns to the pool ([Redemption and Pending Delete](/books/hosting-and-cloud/domain-lifecycle#redemption-and-pending-delete)) | Rarely: a hold keeps the name out of the abuser's hands and out of the drop-catch market |

A registry acts with the server-side equivalents (`serverHold`, `serverTransferProhibited`), and the advisory steers it to refer single names and compromised systems to the registrar first, warning that a hold of either kind "can cause collateral damage"; direct registry action is for cases like domain-generation algorithms, where its scenario has the registry redirect name servers and create not-yet-registered names on law enforcement evidence, which can need a Security Response Waiver.

**6. Sweep the related registrations.** One actor rarely holds one name. The account's other names, names registered in the same session or bulk order, names sharing unusual name servers, naming patterns and payment instruments are where the next attack comes from. [Phishing and Malware](/books/user-generated-platforms/abuse-desks#phishing-and-malware) has Interisle's figures on bulk registration and its recommendation to suspend all related registrations. As of October 2026 the contract requires none of this; the first DNS abuse policy process is drafting exactly that duty ([What Comes Next](#what-comes-next)). Bulk and API registration is where sweeps pay off most, and it is the subject of the second, deferred process.

**7. Record it as evidence, not as a ticket.** Section 3.18.4 requires documentation of receipt and response, kept for up to two years. Compliance asks for what was done, when, why it was prompt and reasonably necessary, and any collateral or proportionality analysis, and where a report was judged not actionable, how that determination was reached. That is a structured record per action, not a thread of emails.

**8. Lift with a reason.** A hold comes off when a compromised site is cleaned, a dispute is upheld or the evidence was wrong, as a recorded decision ([Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown)). Resolution returns as resolvers' caches expire.

## ICANN Enforcement

ICANN has published three sets of headline figures since the amendments took effect, each from Contractual Compliance:

| Period | Investigations | Domains | Other | Source |
| --- | --- | --- | --- | --- |
| 5 April to 5 December 2024 | 204 DNS Abuse investigations resolved | More than 2,900 malicious domains suspended; more than 365 phishing websites disabled | As of 5 March 2025: 46 ongoing investigations with more than 5,400 domains already mitigated, more than 89% of cases phishing; Notices of Breach to one registry operator and two registrars | ICANN82 GAC presentation, 11 March 2025 |
| 5 April 2024 to 5 August 2025 | 400 | "Nearly 20,000" malicious domains mitigated directly, plus "hundreds of thousands" through systems contracted parties built in response | 4 formal Notices of Breach; 31 remediation plans completed; targeted audits | ICANN blog, 20 October 2025 |
| 5 April 2024 to 5 April 2026 | Nearly 530 opened, more than 480 resolved; about 66% ended with direct action on domains such as suspension, about 8% with disruption steps (typically for compromised names) | More than 25,000 mitigated directly, plus hundreds of thousands through contracted parties' new processes | Four DNS Abuse Notices of Breach, and a fifth for failing to investigate a report covering thousands of domains used for cryptocurrency scams (not DNS Abuse); one registry audit completed (report dated 28 January 2026); a second audit started, of registrars with the highest concentration of reported DNS Abuse over 13 months | ICANN blog, 2 June 2026 |

The monthly dashboard shows the flow underneath. The edition covering October 2025 to September 2026 reports 905 DNS Abuse complaints against registrars in September 2026 against a 12-month monthly average of 1,290; 346 invalid or unactionable registrar complaints that month (average 864.8); and 35 registrar cases resolved (average 17.3), all 35 maliciously registered names, with suspension or deactivation the most common resolution reason. Complaints against registries were 44 that month (average 174).

Read the dashboard with its own caveat: complaint counts include every complaint where the complainant ticked a DNS Abuse type, and ICANN says they "do not equal the number of complaints received with validated and actionable allegations of DNS Abuse." Its two tables also count resolutions differently (35 resolved cases by malicious-versus-compromised, 46 by resolution reason, in the same month). The ratio that matters to a registrar is the other one: invalid complaints run at a similar scale to valid ones, and ICANN's two-year post names a high volume of complaints outside its scope or lacking information. The other number worth noticing is that a Notice of Breach has been rare (four in two years, against hundreds of investigations), because Compliance resolves most cases informally once the names are suspended; the Notice is what follows when that stage is exhausted.

The direction is toward proactive enforcement: ICANN's June 2026 post describes a framework that selects contracted parties by data-driven DNS Abuse indicators (high concentrations of reported abuse, long mitigation times), requires mitigation of well-evidenced abuse and measures that address root causes, and publishes KPIs, with an initial concept shown at the 2026 Contracted Parties Summit. A registrar's own mitigation times and abuse concentration are therefore the inputs to whether it gets audited, not only its answers to complaints. [Compliance and Enforcement](/books/hosting-and-cloud/icann-registries-and-registrars#compliance-and-enforcement) covers the Compliance process generally.

## What Comes Next

As of October 2026 the obligations in force are the 2024 amendments; nothing newer binds a registrar yet. The work under way:

- **The issue report (2025).** The GNSO Council requested a Preliminary Issue Report on 14 August 2025, from its DNS Abuse small team's work; ICANN published it for comment on 8 September 2025 (comments closed 18 October, 27 received). Staff recommended a narrowly scoped process on two issues: associated domain checks, and unrestricted API access for high-volume registration.
- **Two processes, one active (December 2025).** On 11 December 2025 the Council started two policy development processes: PDP 1 on associated domain checks, convened immediately, and PDP 2 on safeguards for unrestricted API access, to convene when the Council decides. It adopted the PDP 1 charter on 15 January 2026; the working group met four times at ICANN86 in Seville (8 to 11 June 2026).
- **The PDP 1 Initial Report (18 August 2026).** Eight preliminary recommendations. The core: when a registrar has actionable evidence that a name is used for DNS Abuse, it "MUST perform an Associated Domain Check", which doesn't extend to compromised names; it must make a reasonable investigation of information "reasonably accessible to the registrar in the normal course of its operations"; association indicators may include the same account, customer or registrant, shared infrastructure such as name servers, naming conventions and campaign characteristics; checks stay within the registrar's own portfolio, with no cross-registrar coordination; the check must comply with data protection law and use the minimum data needed; and it must start "promptly", aligned with the advisory rather than a fixed deadline. A registrar may rely on a reseller to run the checks but stays responsible under RAA 3.12. The report goes out for 40 days of public comment, then a Final Report to the Council, then the Board and implementation, so an enforceable duty is still at least one implementation cycle away.

What to build for now: the sweep the report describes is the one a careful desk already runs, so recording which associated names were checked, on what basis, and what was found is cheap today and is the evidence the policy will ask for.

## Who Acts: The Alternatives

A report about a phishing domain can land on five different parties, each with a different lever:

| Party | Lever | Scope of effect | Basis | Failure mode |
| --- | --- | --- | --- | --- |
| **Host** | Remove or quarantine the files, suspend the site | The page or site | Its terms; hosting law ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown)) | The abuser moves the kit to another host and keeps the name |
| **CDN or proxy** | Interstitial warning, stop proxying | The proxied hostnames | Its terms | The origin keeps serving to anyone who bypasses the proxy |
| **Registrar** | `clientHold`, name-server reset, transfer lock | The whole name, every subdomain and mailbox | RAA 3.18.2 for DNS Abuse; the registration agreement otherwise | Collateral on compromised names; the abuser registers another name, possibly elsewhere |
| **Registry** | Referral, `serverHold`, name-server redirect, creating names to pre-empt a DGA | Any name in the TLD | Specification 6, 4.2; its anti-abuse policy | No relationship with the registrant; collateral if it skips the registrar |
| **Recursive resolver** | Refuse or rewrite answers | Every user of that resolver | Its own policy, or a court or agency order | A public resolver's block applies worldwide: Cloudflare treats any order to block through 1.1.1.1 as a global block, has "pursued legal remedies before complying", and as of its H2 2025 report had not blocked content through it |

SAC115's allocation still describes the right default: the party that provisioned the abused resource to the abuser acts first (the registrar for a maliciously registered name, the host for a kit on a hacked site), and the registry and resolver come in when the closer party won't or can't. Court-ordered blocking at resolvers and CDNs is the subject of Conduits, Caches & Blocking Orders; abuse on hosted infrastructure generally is Abuse on Infrastructure.

## My Default

My default for a registrar is to treat the five ICANN categories as a fast lane with a written standard of evidence, and everything else as a forward. For a name that is plainly maliciously registered (new, impersonating a brand, on an account with other fresh names), I'd apply `clientHold` and `clientTransferProhibited` as soon as the evidence is captured, sweep the account and the registration session for associated names the same day, and keep the names held rather than deleted. For a name with history and a real owner, I'd notify the registrant and the host with a short deadline and only then hold, because the collateral of suspending a business's email is the failure ICANN's advisory warns about and the one customers remember.

I'd measure myself on time from actionable evidence to action, not time from report to receipt, because that is what Compliance asks about and what its proactive framework will select on. What would change this is the registrar's other businesses: a registrar that is also the host or proxy for most of its names (Cloudflare's model) should act at the content or proxy layer first and keep the hold for the cases it can't reach, which costs less collateral for the same disruption.

## How to Build It

The abuse case model is the UGP one, pointed at resources by the foundation ([The Core Data Model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)): a report is a `reports` row, a case is `moderation_cases`, an action is `abuse_mitigations`. DNS Abuse is a category, not a table. The registrar's additions are the classification, the evidence ICANN asks for, and the link from each mitigation to the EPP command that carried it out and the status it set.

```sql
-- Which reports are DNS Abuse under RAA 3.18.1, and how they reached the registrar.
ALTER TABLE reports
  ADD COLUMN dns_abuse_type      TEXT CHECK (dns_abuse_type IN ('phishing', 'malware',
                                   'botnet', 'pharming', 'spam_delivery')),
                                 -- null: not DNS Abuse; handled under the agreement's terms
  ADD COLUMN reported_domain_id  UUID REFERENCES domains (resource_id),  -- resolved at intake
  ADD COLUMN sponsor_role        TEXT CHECK (sponsor_role IN ('registrar', 'reseller',
                                   'other_registrar', 'unregistered')),
  ADD COLUMN referred_by         TEXT CHECK (referred_by IN ('reporter', 'registry',
                                   'icann_compliance', 'reporting_service',
                                   'internal_monitoring')),
  ADD COLUMN icann_complaint_ref TEXT,   -- Compliance's ticket, when the report came that way
  ADD CONSTRAINT reports_dns_abuse_has_domain
    CHECK (dns_abuse_type IS NULL OR reported_domain_id IS NOT NULL
           OR sponsor_role IN ('other_registrar', 'unregistered'));

-- What the registrar or registry did, on what evidence, through which EPP command.
ALTER TABLE abuse_mitigations
  DROP CONSTRAINT abuse_mitigations_action_check,
  ADD CONSTRAINT abuse_mitigations_action_check CHECK (action IN ('file_quarantined',
    'path_blocked', 'site_suspended', 'capability_disabled', 'account_suspended',
    'account_terminated', 'client_hold', 'server_hold', 'transfer_lock', 'update_lock',
    'nameservers_reset', 'interstitial', 'registrant_notified', 'host_notified',
    'referred_to_registrar', 'domain_deleted', 'dns_record_changed', 'port_blocked',
    'null_routed')),
  ADD COLUMN acting_party          TEXT NOT NULL DEFAULT 'host' CHECK (acting_party IN
                                     ('host', 'proxy', 'registrar', 'reseller', 'registry')),
  ADD COLUMN determination         TEXT CHECK (determination IN ('malicious_registration',
                                     'compromised', 'not_dns_abuse', 'not_actionable')),
  ADD COLUMN evidence_actionable_at TIMESTAMPTZ,  -- when a reasonable determination was
                                     -- possible; promptness is measured from here
  ADD COLUMN evidence_reviewed     TEXT[] NOT NULL DEFAULT '{}',  -- 'registration_data',
                                     -- 'nameservers', 'account', 'primary_page', 'url',
                                     -- 'external_feed', 'payment'
  ADD COLUMN collateral_analysis   TEXT,  -- the proportionality note Compliance asks for
  ADD COLUMN epp_transaction_id    UUID REFERENCES epp_transactions (id),  -- the update that
                                     -- set the hold, lock or name servers
  ADD COLUMN swept_from_id         UUID REFERENCES abuse_mitigations (id),  -- the triggering
                                     -- action, for an associated-domain check
  ADD COLUMN association_basis     TEXT[] CHECK (association_basis <@ ARRAY['same_account',
                                     'same_registrant', 'same_order', 'shared_nameservers',
                                     'naming_pattern', 'payment_instrument',
                                     'external_report']::TEXT[]),
  ADD CONSTRAINT abuse_mitigations_epp_for_registry_actions
    CHECK (action NOT IN ('client_hold', 'server_hold', 'transfer_lock', 'update_lock',
                          'nameservers_reset', 'domain_deleted')
           OR epp_transaction_id IS NOT NULL OR acting_party = 'registry'),
  ADD CONSTRAINT abuse_mitigations_sweep_has_basis
    CHECK (swept_from_id IS NULL OR cardinality(association_basis) > 0);

-- The evidence pack for one ICANN investigation: receipt, evidence, action, timing.
CREATE VIEW dns_abuse_evidence AS
SELECT r.id                       AS report_id,
       r.icann_complaint_ref,
       r.dns_abuse_type,
       d.name                     AS domain,
       r.reported_at              AS received_at,
       r.acknowledged_at,
       m.determination,
       m.evidence_reviewed,
       m.evidence_actionable_at,
       m.action,
       m.applied_at,
       m.applied_at - m.evidence_actionable_at AS time_to_action,
       m.collateral_analysis,
       e.cl_trid, e.sv_trid, e.result_code
FROM reports r
JOIN domains d                ON d.resource_id = r.reported_domain_id
JOIN moderation_cases c       ON c.id = r.case_id
LEFT JOIN abuse_mitigations m ON m.case_id = c.id
LEFT JOIN epp_transactions e  ON e.id = m.epp_transaction_id
WHERE r.dns_abuse_type IS NOT NULL;
```

Notes on the sketch:

- **The category list stays data.** The five ICANN types are a `CHECK` here for readability; in a real policy they are rows in the category list kept as [rules as data](/docs/architecture/rules-as-data#what-belongs-in-data), with a flag for "DNS Abuse under the RAA", so a definition change from a future consensus policy is a new rule version, not a migration.
- **Promptness has a start time.** `evidence_actionable_at` is the moment the registrar could reasonably decide, which is not the report's arrival (the evidence may arrive later, or come from the registrar's own monitoring). `time_to_action` in the view is the number Compliance and the proactive framework care about.
- **Every registry-side action has an EPP receipt.** A hold, lock, name-server reset or delete is an `epp_transactions` row with its client and server transaction IDs, and the status it created is a `domain_statuses` row whose `set_by_transaction_id` points at the same transaction ([The Domain Data Model & EPP](/books/hosting-and-cloud/epp-and-domain-data#how-to-build-it)). The constraint stops a mitigation from claiming a `clientHold` the registry never acknowledged; a registry acting directly records its own server-side change instead.
- **A transfer lock for abuse is a lock row too.** `transfer_lock` here is the abuse decision; the lock itself, with its reason and release, is a `domain_locks` row from [Transfers, Locks & Registrar Security](/books/hosting-and-cloud/transfers-and-locks#how-to-build-it), so a customer asking why their transfer was denied sees one answer.
- **Sweeps link to their trigger.** An associated-domain check produces mitigations with `swept_from_id` and the basis for association, so "how many names did one report take down, and why each" is a query, and the measures of effectiveness the PDP proposes can be produced from history.
- **Not actionable is a decision too.** A report judged not actionable gets a mitigation-less case closed with `determination = 'not_actionable'` and the evidence reviewed, because Compliance asks how that determination was reached.
- **Registries count from the same rows.** Specification 11 3(b) statistics are a group-by over reports and mitigations in the TLD, by type and action, kept for the agreement's term.
- **Retention follows the contract.** RAA 3.18.4 sets two years or the legal maximum, whichever is shorter, for records of receipt and response; the evidence store keeps captures with access logging ([Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type)).
- **Events:** `dns_abuse.report_classified`, `dns_abuse.evidence_actionable`, `abuse_mitigation.applied` (with `epp_transaction_id`), `abuse_mitigation.sweep_started`, `abuse_mitigation.lifted` and `dns_abuse.forwarded` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the EPP client, the lock service, the customer notice service, the reseller's webhook and the compliance reporting job.

## Auditing

- **Receipt to action, per report.** Received, acknowledged (with the registrar name, reported names and submission date), evidence actionable, action applied, registry acknowledgment, and lifted, with each timestamp, because that is what an ICANN investigation reconstructs.
- **The evidence as it was.** The capture of the page, the registration data and name servers at decision time, and the external feeds consulted, held in an evidence store with access logging ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Determinations, including "no".** Malicious, compromised, not DNS Abuse or not actionable, with who decided and the reasoning, including the collateral analysis for every hold on a name with history.
- **Associated names.** For each triggering name, which other names were checked, on what basis, and what was done, so a sweep can be shown to be proportionate and its misses found.
- **Reseller handling.** Where a reseller acted, what it did and when, since the registrar answers for it.
- **Registry referrals.** For a registry, which names were referred to which registrar, when, with what deadline, and what the registrar did; for a registrar, which referrals arrived and how fast they were closed.
- **Lifted holds.** Who lifted each hold and why, and any re-suspension of the same name.

## What This Means for the System You Build

- **Classify at intake:** mark whether a report is DNS Abuse under RAA 3.18.1 and resolve it to a name, an account and any reseller before anyone reads it.
- **Measure from actionable evidence:** record when a reasonable determination became possible and report time to action from there.
- **Act through EPP and keep the receipt:** every hold, lock and name-server reset is a registry transaction linked to the decision that caused it.
- **Hold, don't delete:** a held name stays out of the abuser's hands and out of the drop-catch market.
- **Separate malicious from compromised:** hold the first, notify and set a deadline for the second, and write down the collateral analysis either way.
- **Sweep associated names now:** the account, the order and shared name servers, recorded with the basis, ahead of the duty the PDP is drafting.
- **Forward the rest with a record:** content and non-DNS-Abuse complaints go to the host, with the recipient and time.
- **Answer for your resellers:** their abuse handling is your contract compliance.
- **Watch your own indicators:** abuse concentration and mitigation times are what ICANN's proactive framework will select on.

## References

**Contracts and policies**

- [ICANN: 2013 Registrar Accreditation Agreement (as amended, 21 January 2024)](https://itp.cdn.icann.org/en/files/accredited-registrars/registrar-accreditation-agreement-21jan24-en.htm), section 3.18.1 to 3.18.4: the DNS Abuse definition, abuse contact, investigation, mitigation, the 24-hour law enforcement review, published procedures and two-year records
- [ICANN: 2013 Registrar Accreditation Agreement](https://www.icann.org/resources/pages/approved-with-specs-2013-09-17-en), the original section 3.18 abuse contact and 24-hour law enforcement review
- [ICANN: Base gTLD Registry Agreement (as amended, 21 January 2024)](https://itp.cdn.icann.org/en/files/registry-agreements/base-registry-agreement-21-01-2024-en.html), section 2.8 law enforcement reports; Specification 6 sections 4.1 to 4.3 abuse contact, mitigation and orphan glue; Specification 11 sections 3(a) and 3(b)
- [ICANN: 2024 Global Amendments to the Base gTLD Registry Agreement and Registrar Accreditation Agreement](https://www.icann.org/resources/pages/global-amendment-2024-en), the negotiation and voting timeline, voting results and thresholds, Board approval, the 5 April 2024 effective date
- [ICANN: Advisory, Compliance with DNS Abuse Obligations in the RAA and RA](https://www.icann.org/resources/pages/advisory-compliance-dns-abuse-obligations-raa-ra-2024-02-05-en), actionable evidence, timing, compromised domains, the registrar and registry scenarios, referral, collateral damage, DGAs and Security Response Waivers, what Compliance asks for, reseller delegation
- [ICANN: Transfer Policy](https://www.icann.org/resources/pages/transfer-policy-2016-06-01-en), section I.A.3.7.1 denial for evidence of fraud and I.A.3.8 mandatory denials
- [ICANN: EPP Status Codes](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en), `clientHold`, `serverHold`, transfer and update prohibitions and their effect on resolution

**History and policy work**

- [Domain Incite: report on the Framework to Address Abuse (21 October 2019)](https://domainincite.com/?p=24852), the eleven signatories, the five categories, the content exceptions
- [SSAC: SAC115, an Interoperable Approach to Addressing Abuse Handling in the DNS (19 March 2021)](https://itp.cdn.icann.org/en/files/security-and-stability-advisory-committee-ssac-reports/sac-115-en.pdf), the framework elements, the primary point of responsibility for registries and registrars, the host's role, Recommendation 1
- [Public Interest Registry: DNS Abuse Institute launches NetBeacon (8 June 2022)](https://pir.org/?p=11174), the institute's 2021 founding and NetBeacon's centralized, standardized, free reporting
- [NetBeacon Institute: Introducing the NetBeacon Institute (May 2024)](https://www.aap.com.au/aapreleases/cision20240506ae06091/), the rename from the DNS Abuse Institute
- [ICANN: Preliminary Issue Report on a PDP on DNS Abuse Mitigation, public comment proceeding](https://www.icann.org/en/public-comment/proceeding/preliminary-issue-report-on-a-policy-development-process-on-dns-abuse-mitigation-08-09-2025), the 14 August 2025 request, the 8 September to 18 October 2025 comment period, the two recommended issues
- [GNSO: DNS Abuse Mitigation PDP 1 Initial Report (18 August 2026)](https://gnso.icann.org/sites/default/files/policy/2026/draft/dnsam-pdp-initial-report-18aug26-en.pdf), the 11 December 2025 initiation of two PDPs, the 15 January 2026 charter, the eight preliminary recommendations, the 40-day comment period
- [OpenSRS: ICANN86 policy recap](https://opensrs.com/blog/icann86-policy-recap/), the PDP 1 working group's sessions in Seville, 8 to 11 June 2026

**Enforcement and reporting**

- [ICANN Contractual Compliance: GAC Discussion on DNS Abuse, ICANN82 (11 March 2025)](https://gac.icann.org/presentations/public/ICANN%20Compliance%20Presentation%20-%20ICANN82%20GAC%20DNS%20Abuse%20Disscussion.pdf), 204 investigations resolved, more than 2,900 domains suspended and 365 phishing sites disabled to 5 December 2024; 46 ongoing investigations and 5,400 domains as of 5 March 2025; Notices of Breach; the October 2024 registry audit
- [ICANN: Progress and next steps in enforcing DNS Abuse mitigation requirements (20 October 2025)](https://www.icann.org/en/blogs/details/icanns-progress-and-next-steps-in-enforcing-dns-abuse-mitigation-requirements-20-10-2025-en), 400 investigations, four Notices of Breach, 31 remediation plans and nearly 20,000 domains to 5 August 2025
- [ICANN: Two years of enforcing DNS Abuse mitigation requirements (2 June 2026)](https://www.icann.org/en/blogs/details/two-years-of-enforcing-dns-abuse-mitigation-requirements-progress-next-steps-02-06-2026-en), nearly 530 opened and more than 480 resolved, outcome shares, Notices of Breach, more than 25,000 domains, audits, the proactive enforcement framework
- [ICANN Contractual Compliance: DNS Abuse Report, October 2025 to September 2026](https://compliance-reports.icann.org/dnsabuse/dashboard/2026/0926/dns-abuse-report.html), September 2026 complaints, invalid complaints, resolved cases and resolution reasons, the counting caveat
- [ICANN Contractual Compliance: DNS Abuse report list](https://compliance-reports.icann.org/dnsabuse/dashboard/trends-list.html), the monthly editions and the latest period covered

**Providers**

- [GoDaddy: Report Abuse](https://legalportal.godaddy.com/abuse), report categories
- [Namecheap: How and where can I file abuse complaints?](https://www.namecheap.com/support/knowledgebase/article.aspx/9196/5/how-and-where-can-i-file-abuse-complaints/), registrar and hosting mailboxes, registrar-only limits, processing times, holds, API reporting
- [Cloudflare: Our approach to abuse](https://www.cloudflare.com/trust-hub/abuse-approach/), registrar scope at the domain level, action on technical abuse consistent with ICANN requirements
- [Cloudflare: Transparency Report, Abuse, H2 2025](https://cfl.re/h2-2025-transparency-report-abuse), interstitials versus registrar suspension, 3,310 and 2,567 registrar actions, the 1.1.1.1 resolver position
- [Porkbun: Abuse](https://porkbun.com/abuse), the CleanDNS-hosted form, DNS-related scope, proof requirement, 24-hour confirmation
- [Squarespace Help: Submit an abuse report](https://support.squarespace.com/hc/en-us/articles/11580957865869-Reporting-abuse), domain abuse forms and the registrar-only content limit
- [Tucows: Abuse form](https://tucowsdomains.com/abuse-form/), registrars covered, acknowledgment and case number, name-server reset, registrant-first guidance
- [OpenSRS: Report an abusive website](https://support.opensrs.com/support/solutions/articles/201000063050), accepted abuse types and actions after review
- [Newfold Digital: Report Abuse](https://www.newfold.com/abuse), brands including Network Solutions, inquiry types, case IDs, discretion and privacy statements
- [IONOS: Abuse terms](https://www.ionos.com/terms-gtc/domain/terms-abuse), evidence requirements, registrar limits, automatic case creation, no replies to complainants
