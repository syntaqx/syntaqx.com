+++
title = "Abuse Desks for Hosts & Registrars"
nav_title = "Abuse Desks"
description = "The web host, CDN and registrar view of abuse: intake, phishing and malware, DMCA for hosts, ICANN DNS abuse duties, CDN scanning, suspension versus takedown."
category = "User-Generated Platforms Industry"
order = 1840
part = "Trust and Safety"
tags = ["trust-and-safety", "hosting", "dns-abuse", "phishing", "copyright", "abuse-desk"]
+++

A web host stores what its customers build, not what their visitors post. The thing someone reports isn't a comment or an image in a feed; it's a phishing kit on a WordPress install, a malware download on a storage bucket, a domain registered an hour ago to impersonate a bank, or an IP address sending scans. The host usually can't edit the offending page, often can't see it as the victim saw it (phishing kits geo-block and cloak), and may not be the only party involved: the same report can concern a registrar that holds the domain, a CDN that proxies it, a host that stores it and a customer whose site was hacked. So the unit of action is coarser than on a social platform. It's a path, a site, an account, a domain or an IP, and every one of those can be shared with people who did nothing wrong.

This chapter covers the infrastructure side of trust and safety, for anyone who runs web hosting, cloud servers, storage, a CDN or a domain registrar, and for platforms that let users publish whole sites, pages or files under their own domains: how reports arrive, why phishing and malware dominate the queue, what the DMCA asks of a host, the duties ICANN's 2024 contract amendments put on registrars and registries, scanning at the CDN edge, and how to choose the narrowest action that stops the harm. The general machinery (reports grouped into cases, priority by harm, ladders, notices, appeals, audit) is the playbook's [Trust & Safety](/docs/security/trust-and-safety); the law of hosting liability is [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability). None of this is legal advice.

## How the Platforms Do It

Every large host and registrar publishes an abuse channel, and their public pages agree on more than they differ: a categorized form or role mailbox, an acknowledgment with a case number, evidence requirements per category, notice to the customer with time to fix it, and the least disruptive action that stops the abuse. As of October 2026:

| Provider | Intake | What it says it does |
| --- | --- | --- |
| **AWS** | A web form or a Trust & Safety mailbox; anyone can report; no reporting API | Automated confirmation, notice to the customer, a resolution email to the reporter; never discloses customer information; suspends the specific resource rather than the account where it can |
| **Cloudflare** | An abuse form by category | For proxied sites, forwards the complaint to the website operator and the hosting provider and gives the host the origin IP; for content it stores (Pages, Workers, Stream, Images), removes or disables it; as a registrar, acts on domain-level issues and technical abuse such as phishing |
| **DigitalOcean** | A web form to its security operations team with an abuse type | Its acceptable use policy reserves removing or disabling content, blocking traffic, and suspension or termination |
| **GoDaddy** | A legal portal with separate reports for phishing, malware, child safety and exploitation (CSAM), intellectual property, UK/EU complaints, and public safety and illegal content (terrorism, non-consensual intimate imagery); a status check | Category-specific forms route to separate queues |
| **Hetzner** | An abuse mailbox and form | Its terms let it ask the customer to remove content and lock access, and lock a server without notice for denial-of-service attacks or open relays |
| **Namecheap** | Separate mailboxes for domains registered with it and sites hosted with it, plus dedicated addresses for DMCA notices, Whois inaccuracy, disclosure requests, TAKE IT DOWN Act removal requests and law enforcement; an API for security organizations that report in volume | General processing time of 72 hours, law enforcement reports within 24 hours; may not report results back; as a registrar only, it won't act on copyright, spam, fraud or malware served from third-party servers and tells reporters to go to the host |
| **Newfold Digital** (Bluehost, HostGator, Network Solutions, Register.com, Domain.com, Web.com and others) | One web form across more than twenty brands, with 14 inquiry types including phishing, malware, spam, copyright, "Adult Content or CSAM", invalid Whois data and subpoena requests; one attachment up to 1 MB | Creates a case ID used in later correspondence; acts when a Terms of Service violation is confirmed or ICANN or registry policy requires it; any response is at its "sole discretion" and it may not give updates "due to privacy reasons" |
| **OVHcloud** | An abuse form "for reporting of illegal content or activities" and an abuse mailbox | Tells reporters of imminent threats to contact the authorities first |

The shared practice has a written baseline. The M3AAWG and Internet Infrastructure Coalition **Anti-Abuse Best Common Practices for Hosting and Cloud Service Providers** (March 2015) asks hosts to vet new customers, set up RFC 2142 role mailboxes (`abuse@`, `postmaster@`, `hostmaster@`) for every domain they provision, keep their regional internet registry records accurate with working abuse contacts, acknowledge every complaint with a ticket number and the original complaint, offer a "quiet" address or API for bulk reporters, designate trusted reporters for a priority lane, and work complaints in a fixed order. Its priority chart puts child exploitation at the top (critical), botnet command-and-control, DDoS and data theft next, then malware drops and phishing, spam below that, defacement and port scans near the bottom, and notes that copyright, otherwise very low, tends to be high in North America because of the DMCA safe harbor. Its handling steps are the ones the providers above publish: confirm the complaint, notify the customer with instructions, cite the terms breached, give time to fix it, confirm the fix, close the case and, where needed, tell the reporter.

## Intake

An abuse desk receives reports from people who aren't its customers, about customers it may not be allowed to name, through channels it has to publish in several places at once.

**Where reporters look.** The oldest convention is the `abuse@` mailbox: RFC 2142 (May 1997) lists ABUSE under customer relations for "inappropriate public behaviour", beside NOC, SECURITY, POSTMASTER and HOSTMASTER. For domains, the registrar's abuse contact is in the registration data: RDAP, which defines an `abuse` entity role that "handles network abuse issues on behalf of the registrant" (RFC 9083), became the definitive source for generic top-level domain registration data on 28 January 2025, when the contractual duty for registrars and most registries to run WHOIS was removed. For IP addresses, the host's regional internet registry records carry the abuse contact, which is why M3AAWG asks hosts to keep them accurate, including sub-allocations to customers. Namecheap's own instructions show how reporters triangulate: look up the domain's registrar, resolve its A record, then look up who holds that IP to find the host.

**What a good report carries.** Each category needs different evidence, and the providers spell it out. AWS asks for network abuse with dates, times and time zone, source and target IPs and ports, and log extracts, and for content abuse with the specific URLs and why they break its policy; for many IPs, a CSV with the IP, an ISO 8601 timestamp and log lines. Namecheap asks phishing reporters for the targeted brand, the country they viewed it from and their user agent, because kits cloak by geography and device, and asks for de-fanged URLs, headers and sandbox reports rather than live malware samples. Hosting attribution depends on time: the same IP belonged to someone else last week, which is why timestamps to the minute matter more than screenshots.

**Machine-readable reports.** Volume reporters (blocklist operators, CERTs, brand-protection vendors, other networks) send structured reports. The M3AAWG practices point automated reporters to the Abuse Reporting Format (RFC 5965) for email abuse feedback. XARF, developed by Abusix with abuse reporters and network operators, is a set of JSON schemas for abuse incidents (phishing, malware, copyright, DDoS, port scans, child exploitation and more) that can travel by email, API or stream. Parse them into the same report records as web-form submissions; a desk that reads XARF in one inbox and forms in another has two queues for one problem.

**Acknowledge, then triage.** ICANN now requires registrars to confirm receipt of abuse reports, and its advisory says the confirmation must identify the registrar, the reported names and the submission date; M3AAWG asks hosts for the same. An acknowledgment isn't a promise to share the outcome: Newfold, Namecheap and AWS each say they may not tell the reporter what was done to a customer, and AWS says it never discloses customer information. Group reports into cases by resource, prioritize by harm with a separate staffed path for child safety ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)), and give trusted reporters a priority lane, the infrastructure counterpart of a platform's trusted flaggers.

**What isn't abuse.** A large share of what arrives is misrouted: a reporter writing to a registrar about content on another company's server, to a CDN about a site it only proxies, or to an abuse desk about a billing dispute. Cloudflare's policy is the clearest version of the answer: it "cannot remove from the Internet content that it does not host", so it forwards the complaint to the operator and the host and gives the host the origin IP. Namecheap tells reporters to escalate to the host when it's only the registrar. My rule: every report gets a disposition, and "forwarded to the party that can act" is a disposition with a timestamp and a recipient, not a silent close.

Subpoenas, preservation letters and emergency requests arrive at the same desks (Newfold's form has a "Subpoena Request" category; Namecheap has a law enforcement address); they follow [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-operating-model), not the abuse workflow.

![An abuse desk from intake to mitigation. A report arrives by web form, role mailbox, API, structured feed or blocklist, is acknowledged with a receipt and a case number, and is triaged by grouping it by resource and ranking it by harm. Triage fans out to four dispositions: not ours, forwarded to the operator or host with the recipient and time recorded; child safety, a dashed box for its own separate staffed path, never the general tool; compromised site, accented, where the desk blocks paths, notifies the owner with a deadline, then suspends the site if nothing changes; and malicious registration, where it suspends the account or domain with minimal notice and looks for related registrations. Footnotes say every report gets a disposition, each mitigation takes the narrowest layer that stops the harm, and a mitigation is lifted when the site is remediated or a dispute is upheld, with an actor and a reason.](/diagrams/ugp-abuse-desks-intake.svg "Every report ends in a recorded disposition, including a forward to the party that can act. Compromised sites get a ladder that aims at a cleaned site; malicious registrations get suspended outright.")

## Phishing and Malware

Phishing and malware are most of an infrastructure abuse queue, and the volume is still rising. APWG counted 425,808 phishing attacks in June 2026, the highest monthly total since April 2023, with attacks up 10.1% in the second quarter of 2026. Interisle's Phishing Landscape 2025, covering May 2024 to April 2025, counted 1.96 million phishing attacks a year (up 182% since 2021) on more than 1.5 million domain names, found that over half of phishing sites were hosted by US-based companies, for the fifth year running, and that 37% of phishing domains came through bulk registration services.

**Compromised or malicious.** The response depends on whose site it is. A compromised site belongs to a real customer: a small business whose outdated CMS was exploited, with a phishing kit dropped in a subdirectory. M3AAWG's 2015 practices said phishing "happens primarily" this way, and most hacked accounts come from out-of-date Joomla or WordPress installs. A maliciously registered domain belongs to the criminal: registered for the attack, often in bulk, and worthless once burned. Interisle found that 77% of domains used in phishing were maliciously registered, a 36% rise in such registrations year on year. The two call for opposite actions:

| | Compromised site | Malicious registration or account |
| --- | --- | --- |
| **Who's harmed by a suspension** | The legitimate owner and their customers | Nobody legitimate |
| **Right first action** | Remove or block the specific paths; notify the owner with clean-up instructions; set a deadline | Suspend the domain or account outright; look for related registrations and accounts |
| **Registrar's role** | Usually notify the registrant or host; ICANN's advisory gives asking the registrant to remove the content by a deadline as an alternative to suspension | `clientHold` suspension and a transfer lock to stop the domain moving away |
| **Notice** | Full, with evidence, so the owner can fix the hole | Minimal or none; M3AAWG says fraudulent accounts shouldn't retrieve their data and shouldn't be alerted |
| **Recurrence** | Re-compromise if the vulnerability isn't patched; recheck after clean-up | New registrations by the same actor; Interisle recommends suspending "all related accounts and registrations" once a phisher is found |

Signals that separate them: the domain's age and registration path (new, bulk, freshly paid), whether the rest of the site is a real business with history, whether the account has other legitimate sites, and the payment and sign-up data of the account. [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#account-farms) covers the account-farm side; account farms that buy hosting and domains in bulk are the same problem one layer down. Interisle's recommendations aim at prevention rather than takedown: verify customer data at sign-up, vet and rate-limit access to high-volume registration, and monitor registrations before services activate.

**Clean-up versus suspension.** For a compromised site, the host's best outcome is a cleaned site and a patched install, not a dark one. The ladder is: block the malicious paths (or quarantine the files), notify the owner with what was found and how to fix it, give a deadline, then suspend the site if nothing changes. M3AAWG describes the step short of termination as "a suspended webpage that requires the owner to contact the hosting provider", or turning off one capability, such as outbound mail for a repeat spam source. AWS describes the same restraint: it endeavors to take "the least invasive suspension action possible" by disabling only the specific resource. If you sell clean-up services, keep the abuse decision independent of whether the customer buys one.

**Why the browser warnings matter.** Most site owners learn they were compromised from someone else's warning. Google Safe Browsing and Microsoft's unsafe-site reporting both take reports from the public (Microsoft lets corporate accounts report many URLs in one submission), and the browsers then show interstitials on the flagged site. Google's Search Console groups the findings as hacked content, malware and unwanted software, and social engineering; the owner fixes every listed issue and requests a review, which "can take from a few days to a few weeks". The host's abuse desk sees the result as a support ticket: the customer's site is red in Chrome and they want it fixed now.

**Why blocklists make hosts act.** Reputation lists turn one customer's abuse into everyone's problem. The Spamhaus Blocklist lists IPs seen sending spam, hosting malicious content or acting as bulletproof hosting, emails the responsible network or hosting company, accepts removal requests only from that network, and may escalate a listing to wider ranges or the network's whole ASN; Spamhaus says removal never costs money. SURBL lists domains and URLs found in message bodies, with separate lists for phishing, malware and "cracked" sites (often compromised sites redirecting to spam), which mail filters such as SpamAssassin check. On shared hosting, one phishing kit can get a shared IP listed and bounce mail for every other customer on it, so a listing is a ticket with a deadline even when no person has complained.

## DMCA for Hosts

A host that stores customer sites is a 17 U.S.C. § 512(c) service provider, for "information residing on systems or networks at direction of users"; a network that only transmits traffic is a § 512(a) conduit, and a cache sits under § 512(b). [Copyright at Scale](/books/user-generated-platforms/copyright) covers the mechanics ([the agent](/books/user-generated-platforms/copyright#the-dmca-agent), [notices](/books/user-generated-platforms/copyright#notices), [counter-notices](/books/user-generated-platforms/copyright#counter-notices)); the host's version differs in three ways.

**The host can't edit the work.** A social platform removes the post; a host usually can't remove one image from a customer's site without breaking it or editing the customer's code. The common practice is to forward the notice to the customer and set a deadline before the host acts at a coarser level. Bluehost's public help article describes an email to the customer with the complaint and 48 hours to remove the material, after which it "may take action to disable access to the content". Cloudflare follows notice and takedown for content it stores and forwards notices for sites it only proxies. Namecheap, when it is only the registrar, won't act on copyright at all and sends reporters to the host. Disabling a whole site over one infringing file is the collateral problem in [Suspension Versus Takedown](#suspension-versus-takedown); keep the disabled scope as close to the identified material as the platform allows, and record what was disabled.

**The repeat infringer is the customer.** Section 512(i) requires a policy for terminating repeat infringers among "subscribers and account holders", which for a host means the account that pays for the hosting, not the visitors to its sites. A customer running a forum or an image board is itself a service provider for its own users and needs its own agent and policy; the host counts notices against the customer account. Cloudflare says it has a termination policy for repeat infringers under the DMCA. The scope of a host's or network's exposure for customers it keeps serving changed with Cox v. Sony (decided 25 March 2026), which held that a provider is contributorily liable only if it induced the infringement or offered a service tailored to it, and that knowledge alone isn't enough; [The Litigation](/books/user-generated-platforms/hosting-liability#the-litigation) has the holding and [Repeat Infringers](/books/user-generated-platforms/copyright#repeat-infringers) its effect on termination practice. The safe harbor still needs the policy reasonably implemented, so the strike count stays.

**Notices arrive through the abuse desk.** Reporters send copyright complaints to abuse forms whatever the published agent says; Newfold's form has a "Copyright Infringement" category, and Namecheap publishes a separate DMCA address. A notice that lands at the abuse desk is still a notice: it becomes a `legal_notices` row with its clock ([Legal Clocks](/books/user-generated-platforms/hosting-liability#legal-clocks)), not an abuse report closed as "wrong channel". M3AAWG's footnote that copyright jumps in priority in North America is this point in practice.

## DNS Abuse Duties

Registrars and registries have had contractual DNS abuse duties since ICANN's 2024 global amendments to the 2013 Registrar Accreditation Agreement and the base generic TLD Registry Agreement took effect on **5 April 2024**. Registrars voted for them with 94.01% of domains under management against a 90% threshold, and the ICANN Board approved them on 21 January 2024. They apply to generic TLDs under ICANN contract; country-code TLDs set their own rules.

**What counts.** The amendments define DNS Abuse as malware, botnets, phishing, pharming, and spam only "when spam is used as a delivery mechanism" for one of the other four, following SSAC's SAC 115. Unsolicited bulk email on its own, and website content unrelated to those five, are outside the definition; a registrar can still act on them under its own terms, but ICANN won't enforce it.

**Registrar duties.**

- **A reachable abuse contact.** An email address or web form "readily accessible on the homepage"; web forms "must not require a login".
- **Confirmation of receipt** to the reporter, identifying the registrar, the reported names and the date the report was submitted.
- **Mitigation on actionable evidence.** Where it has evidence "sufficient to enable the registrar to make a reasonable determination" that a name is used for DNS Abuse, the registrar must "promptly take the appropriate mitigation action(s) that are reasonably necessary" to stop or disrupt it. An incomplete report still has to be investigated with what the registrar can reasonably see: name servers, account activity, and "the contents of at least the primary webpage or specific URL in the abuse report".
- **Discretion over the action, weighed against collateral damage.** The advisory's examples are suspension with the `clientHold` status, a transfer lock to stop evasion, and, for a compromised site, asking the registrant (or notifying the web host) to remove the content by a deadline instead of suspending.
- **No fixed clock.** ICANN calls it "impossible to prescribe a fixed amount of time" for prompt action; the advisory's examples of hours and business days are illustrative, and a registrar has to explain its timing when Compliance asks.

**Registry duties.** Registry operators must publish an abuse contact (email or form, mailing address and a primary contact), run periodic technical analysis and keep statistical reports on DNS Abuse in the TLD (Specification 11, section 3(b), now worded around DNS Abuse rather than "security threats"), and mitigate: at minimum, refer the domain and evidence to the sponsoring registrar, or act directly where appropriate. The advisory steers compromised-site cases to the registrar first, warns that `clientHold` or `serverHold` "can cause collateral damage", and reserves direct registry action for cases like botnets' domain-generation algorithms.

**Enforcement.** ICANN Contractual Compliance reported that in the first six months (5 April to 5 October 2024) it opened 192 investigations, which led to the suspension of more than 2,700 abusive domain names and the takedown of more than 350 phishing websites. It now publishes monthly DNS Abuse reports (complaints by abuse type, investigations, and resolution reasons such as a registrar suspending the name); as of October 2026 the latest covers October 2025 to September 2026. Contracted parties must produce evidence of compliance whenever Compliance opens an investigation, which is the case for keeping the receipt, the evidence reviewed, the action and its timestamps as records rather than in a ticket thread.

## CDN Scanning

A CDN or reverse proxy sits between visitors and content it doesn't store, which gives it a point to block and no way to delete. Cloudflare's CSAM Scanning Tool is the public example of scanning at that point: launched for all customers on 18 December 2019 at no cost on any plan, it compares content served through Cloudflare's cache for a customer's site against known lists of child sexual abuse material from child-safety organizations such as NCMEC, blocks matches (the launch post says with a 451 status), and emails the customer once a day with the file paths matched in the past 24 hours. Users with the Admin, Super Admin or Trust & Safety role can request review of a block with a representation that the content isn't CSAM or has been removed. The documentation places the reporting obligation on the website owner, through NCMEC's CyberTipline or the INHOPE portal for its jurisdiction. Cloudflare keeps the matching method undisclosed so that it can't be studied for evasion. The hashing technology, the lists and their access agreements belong to [Hash Matching](/books/user-generated-platforms/child-safety#hash-matching); here the point is the operating model: scan at the edge you control, block at the narrowest scope (the path), tell the customer, and leave removal to the party that stores the file.

**The status code.** RFC 7725 (February 2016) defines HTTP 451, "Unavailable For Legal Reasons", for access denied because of a legal demand. The blocking entity "SHOULD" send a `Link` header with `rel="blocked-by"` identifying itself (the party implementing the block, not the one demanding it), and the body should explain the demand, who made it and under what law. A 451 is cacheable by default. My default: 451 with a `blocked-by` link for blocks made under a legal duty or order, a plain 403 or a suspension page for blocks made under the provider's own terms, so that a 451 means what the RFC says.

**Knowledge triggers the duty.** The reporting duty in 18 U.S.C. § 2258A falls on a "provider", which § 2258E defines as an electronic communication service provider or remote computing service. Hosts, storage services and CDNs qualify, and the duty attaches when the provider obtains actual knowledge, whoever the customer is. The statute doesn't require monitoring or scanning, but a match the provider sees, a report it reads, or a customer's ticket that shows the material is knowledge. [The Reporting Duty](/books/user-generated-platforms/child-safety#the-reporting-duty) and [Preservation](/books/user-generated-platforms/child-safety#preservation) cover what follows.

**Other illegal content reaching hosts.** Child sexual abuse material, terrorist content and non-consensual intimate imagery all arrive at host abuse desks, through categories like Newfold's "Adult Content or CSAM", GoDaddy's child safety and public safety forms, Namecheap's TAKE IT DOWN Act address and AWS's image-based sexual abuse reports (which it accepts when the reporter can't identify the host or the host hasn't acted). Route them to the owning paths: [Child Safety](/books/user-generated-platforms/child-safety), [Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content) and [Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse). Reviewers shouldn't open CSAM reports in the general abuse tool; M3AAWG ranks child exploitation as critical and points to its separate CSAM disposition practice, and reviewer exposure controls are [Reviewer Wellbeing](/books/user-generated-platforms/moderation-at-scale#reviewer-wellbeing).

## Suspension Versus Takedown

An infrastructure provider's actions come in layers, and each wider layer stops more abuse and hurts more bystanders. The question for every case is the narrowest layer that actually stops the harm:

| Layer | Actions | Who can do it | Collateral | Reversal |
| --- | --- | --- | --- | --- |
| **Content** | Remove or quarantine a file; block a path at the edge | Host, CDN, storage service | The rest of the site keeps working | Restore the file or lift the block |
| **Site** | Replace the site with a suspension page; disable one capability (outbound mail, scripts) | Host | Every page and user of that site | Re-enable; the customer's data is intact |
| **Account** | Suspend or terminate the customer account and all its sites | Host, cloud provider | Every site and service the customer runs, including clean ones | Re-enable on suspension; termination needs a data retrieval window |
| **Domain** | `clientHold` (registrar) or `serverHold` (registry); transfer lock | Registrar, registry | Every subdomain, website and mailbox on the name | Remove the hold; resolution returns as caches expire |
| **DNS** | Remove or change records on hosted DNS | DNS provider | Whatever the record served | Restore the records |
| **Network** | Block a port; null-route an IP; cut a server's uplink | Host, network | Every site on a shared IP; every customer on a blocked range | Remove the route or rule |

**Collateral on shared infrastructure.** Shared hosting puts hundreds of customers on one server and often one IP; null-routing that IP to stop one phishing site takes them all down, and a blocklist listing of it bounces all their mail. M3AAWG's answer for IPv6 is to give each customer its own /64 so that abuse can be traced and blocked without "blocking everyone else on the same host". ICANN's advisory asks registrars to weigh "the possibility of associated collateral damage", and warns registries that holds on compromised domains cause it. Prefer the content and site layers for compromised sites, the account and domain layers for malicious ones, and the network layer for live attacks (DDoS, active botnet command-and-control) where minutes matter more than precision; Hetzner's terms, for example, allow locking a server without notice for denial-of-service attacks.

**Reversibility and evidence.** Suspension preserves; deletion doesn't. Quarantine malicious files rather than deleting them, because they're evidence for the customer, the reporter, a court and sometimes a mandatory report, and put a [legal hold](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds) on anything a report or request must preserve. Termination of a legitimate customer comes with a window to retrieve data (M3AAWG: set the timeframe, then verify removal); termination of a fraudulent account doesn't.

**Notice to the customer.** The providers converge on notice with a deadline and a way to dispute. AWS sends the customer the abuse report (including any logs the reporter submitted), may act on the resource if a stated response deadline passes, accepts extension requests and disputes, and, if it has already disabled a resource, tells the customer to reply that it will remediate once access is restored. Hetzner's terms let it ask for removal and lock access. M3AAWG asks hosts to cite the specific term breached, which keeps the contract intact and the decision defensible. Notice is withheld where it would tip off a fraudster, a CSAM investigation or a law enforcement request that forbids it; record the reason, as the playbook's [Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons) does for platforms. A host serving EU customers is a hosting service under the DSA, with notice-and-action and statement-of-reasons duties of its own ([DSA Hosting Liability](/books/user-generated-platforms/hosting-liability#dsa-hosting-liability)).

**The customer's appeal.** Every mitigation needs a path back: the customer fixes the problem and asks for re-enablement, or disputes the report. AWS reviews disputes and "work[s] with all relevant parties"; Google's Search Console reviews take days to weeks. Lifting is a decision with an actor and a reason, recorded like the action, and a re-compromised site that comes back next week should show up as the same resource with a history.

## How to Build It

The chapter adds the resources a host, CDN or registrar can act on, and the actions it takes against them, to the case model in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Abuse reports are `reports` rows; DMCA and other notices with legal clocks are `legal_notices` rows from [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#how-to-build-it), linked to the case through `moderation_cases.legal_notice_id`.

```sql
CREATE TABLE hosted_resources (          -- what an infrastructure provider can act on
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),  -- the paying customer
  kind             TEXT NOT NULL CHECK (kind IN ('site', 'domain', 'ip_address',
                     'server', 'bucket', 'dns_zone')),
  service          TEXT NOT NULL CHECK (service IN ('hosting', 'registration', 'dns',
                     'cdn_proxy', 'storage', 'compute')),  -- what this provider does for it
  identifier       TEXT NOT NULL,        -- hostname or domain (A-label), IP or prefix, bucket
  parent_id        UUID REFERENCES hosted_resources (id),  -- a site on a server, a zone's domain
  tenancy          TEXT NOT NULL CHECK (tenancy IN ('dedicated', 'shared')),
  status           TEXT NOT NULL CHECK (status IN ('active', 'restricted', 'suspended',
                     'terminated')),     -- cache of mitigations in force
  provisioned_during TSTZRANGE NOT NULL, -- who held this IP or name, when
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING GIST (kind WITH =, service WITH =, identifier WITH =,
    provisioned_during WITH &&)          -- one holder of a name or address at a time
);

ALTER TABLE moderation_cases
  DROP CONSTRAINT moderation_cases_subject_type_check,
  ADD CONSTRAINT moderation_cases_subject_type_check CHECK (subject_type IN ('account',
    'profile', 'community', 'content_item', 'media_asset', 'message', 'hosted_resource'));

ALTER TABLE reports                      -- reporters here are rarely account holders
  ALTER COLUMN reporter_id DROP NOT NULL,
  ADD COLUMN reporter_contact   TEXT,    -- email or form contact when not an account
  ADD COLUMN trusted_reporter   BOOLEAN NOT NULL DEFAULT FALSE,  -- the desk's own program;
                                         -- DSA trusted flaggers are notifier_kind, added in
                                         -- Regulators & Enforcement
  ADD COLUMN intake_channel     TEXT NOT NULL DEFAULT 'in_product' CHECK (intake_channel IN
                                  ('in_product', 'web_form', 'role_mailbox', 'api',
                                   'structured_feed', 'blocklist', 'internal_scan')),
  ADD COLUMN external_ref       TEXT,    -- reporter's ticket, XARF report id, blocklist ticket
  ADD COLUMN reported_locator   TEXT,    -- URL, domain, IP, as reported
  ADD COLUMN observed_at        TIMESTAMPTZ,  -- when the reporter saw it; drives attribution
  ADD COLUMN acknowledged_at    TIMESTAMPTZ,  -- receipt sent; ICANN requires it of registrars
  ADD COLUMN forwarded_to       TEXT,    -- the operator or host it was passed to
  ADD COLUMN forwarded_at       TIMESTAMPTZ,
  ADD CONSTRAINT reports_reporter_known
    CHECK (reporter_id IS NOT NULL OR reporter_contact IS NOT NULL
           OR intake_channel IN ('blocklist', 'internal_scan')),
  ADD CONSTRAINT reports_forward_complete
    CHECK ((forwarded_to IS NULL) = (forwarded_at IS NULL));

CREATE TABLE abuse_mitigations (         -- one action against one resource, with its scope
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id             UUID NOT NULL REFERENCES moderation_cases (id),
  decision_id         UUID NOT NULL REFERENCES moderation_decisions (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),  -- the customer affected
  hosted_resource_id  UUID REFERENCES hosted_resources (id),   -- null: the whole account
  layer               TEXT NOT NULL CHECK (layer IN ('content', 'site', 'account', 'domain',
                        'dns', 'network')),
  action              TEXT NOT NULL CHECK (action IN ('file_quarantined', 'path_blocked',
                        'site_suspended', 'capability_disabled', 'account_suspended',
                        'account_terminated', 'client_hold', 'server_hold', 'transfer_lock',
                        'dns_record_changed', 'port_blocked', 'null_routed')),
  target_detail       TEXT,              -- the path, capability, record or prefix
  status_code         SMALLINT,          -- 451 under a legal duty, 403 or a page under terms
  reversible          BOOLEAN NOT NULL,
  affected_resources  INT NOT NULL DEFAULT 1,  -- others on a shared IP, server or name
  evidence_ref        TEXT NOT NULL,     -- the evidence store, never the live site
  customer_notified_at TIMESTAMPTZ,
  notice_withheld_reason TEXT CHECK (notice_withheld_reason IN ('fraudulent_account',
                        'child_safety', 'law_enforcement_request', 'active_attack')),
  remediation_due_at  TIMESTAMPTZ,       -- the customer's deadline before a wider action
  applied_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lifted_at           TIMESTAMPTZ,
  lift_reason         TEXT,              -- 'remediated', 'dispute_upheld', 'expired', ...
  CHECK (layer = 'account' OR hosted_resource_id IS NOT NULL),
  CHECK (customer_notified_at IS NULL OR notice_withheld_reason IS NULL),
  CHECK ((lifted_at IS NULL) = (lift_reason IS NULL))
);

CREATE INDEX abuse_mitigations_in_force
  ON abuse_mitigations (hosted_resource_id) WHERE lifted_at IS NULL;
```

Notes on the sketch:

- **The resource is held over time.** IPs and domain names change hands; `provisioned_during` with the exclusion constraint answers "who held 203.0.113.7 at 14:02 UTC last Tuesday", which is how a report with a timestamp resolves to a customer. Attribute by `reports.observed_at`, not by when the report arrived.
- **One case, one resource.** A case's subject is a `hosted_resource`; reports about the same site, domain or IP group into it ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)). A compromised site and a malicious domain are different cases even when one report names both, because the actions and the people harmed differ.
- **External reporters.** Most reporters to a host aren't account holders, so `reporter_id` becomes optional and a contact, channel and external reference carry the rest. Structured reports (XARF, blocklist tickets, internal scans) land in the same table with their own channel, so trusted-reporter weighting and upheld rates work across all of them.
- **Forwarding is a disposition.** A CDN or a registrar-only provider records who it forwarded to and when; the case closes as forwarded with that evidence, and a later report about the same resource reopens it.
- **Mitigations are rows, not statuses.** `hosted_resources.status` is a cache of the mitigations in force, recomputed when one is applied or lifted, the same rule the core model uses for penalties. Each row carries its layer, its blast radius (`affected_resources`), whether it can be undone, and the evidence behind it, so the narrowest-action rule can be audited.
- **The ladder is time-bound.** A compromised-site case starts with `path_blocked` or `file_quarantined` and a `remediation_due_at`; a job ([Background Jobs](/docs/architecture/background-jobs#scheduling)) escalates to `site_suspended` when the deadline passes without a fix, and re-checks the site after the customer says it's clean.
- **Copyright counts on the customer.** DMCA notices are `legal_notices` rows; a decision in category 'copyright' that disables material adds a `penalties` row against the customer account, which [Repeat Infringers](/books/user-generated-platforms/copyright#repeat-infringers) counts, so the strike belongs to the subscriber and not to the site's visitors.
- **DNS abuse is a category, not a table.** The policy's category list, kept as [rules as data](/docs/architecture/rules-as-data#what-belongs-in-data), marks which categories are DNS Abuse under ICANN's definition (phishing, malware, botnets, pharming, spam as delivery), so a registrar can produce ICANN's evidence (receipt, evidence reviewed, action, timestamps) and a registry can produce its periodic statistics as queries.
- **Child safety leaves this table.** A CSAM report or match opens a child-safety case under [Child Safety](/books/user-generated-platforms/child-safety#how-to-build-it) and its restricted evidence store; this chapter records only the path block or account action.
- **Events:** `abuse_report.acknowledged`, `abuse_report.forwarded`, `abuse_mitigation.applied`, `abuse_mitigation.lifted`, `hosted_resource.suspended` and `hosted_resource.restored` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the edge, DNS and network control planes, billing, support and the customer notice service.

## Auditing

- **Every report's timeline.** Received, acknowledged, forwarded (to whom), decided and closed, with the channel and external reference. ICANN asks registrars to show receipt and prompt action with evidence; the same timeline answers a reporter, a customer and a court.
- **Attribution.** Which customer held the IP or name at the observed time, and the provisioning record that shows it. A mitigation against the wrong customer is the worst error a host can make, and the record is the only defense.
- **Every mitigation with its scope.** Layer, action, target, the number of other resources affected, notice sent or withheld (and why), the deadline given, and who lifted it and why ([Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions)).
- **Evidence as it was.** The phishing page as served, the malware sample hash, the logs the reporter sent, kept in an evidence store with access logging ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)), and under a legal hold where a report or request requires preservation.
- **Blocklist and browser listings.** Which IPs and domains were listed where, when the host learned, what it did and when it requested delisting or review; these are a host's external error budget.
- **Copyright counts per customer.** Notices, actions, counter-notices and terminations, so the repeat-infringer policy can be shown to be "reasonably implemented".

## What This Means for the System You Build

- **Publish abuse contacts everywhere reporters look:** an `abuse@` mailbox, a login-free web form, RDAP and registry records, with categories that ask for the evidence each abuse type needs.
- **Acknowledge every report** with a case number, and record forwarding as a disposition with a recipient and a time.
- **Accept structured reports** (XARF, blocklist tickets, bulk CSVs) into the same report table as forms, and give trusted reporters a priority lane.
- **Attribute by time:** keep who held each IP, domain and site over time, and resolve reports by when the abuse was observed.
- **Separate compromised from malicious:** clean up and notify for the first, suspend and sweep related accounts for the second.
- **Choose the narrowest layer that stops the harm,** and record each mitigation's scope, collateral, reversibility and evidence.
- **Give customers notice, a deadline and a dispute path,** and withhold notice only for a recorded reason.
- **Count copyright notices against the customer account** and keep DMCA notices on their legal clocks, wherever they arrive.
- **Meet ICANN's duties as records:** receipt, actionable evidence, prompt mitigation and, for registries, periodic statistics.
- **Treat a match or report of CSAM as knowledge:** block at the edge, route to the child-safety path, and preserve.
- **Watch blocklists and browser warnings** as abuse signals, because they arrive before most complaints do.

## References

**Statutes and standards**

- [17 U.S.C. § 512](https://www.law.cornell.edu/uscode/text/17/512), the conduit (512(a)) and hosting (512(c)) safe harbors, the designated agent (512(c)(2)), the repeat-infringer policy for "subscribers and account holders" (512(i))
- [18 U.S.C. § 2258A](https://www.law.cornell.edu/uscode/text/18/2258A), the duty to report on actual knowledge, no duty to monitor or search
- [18 U.S.C. § 2258E](https://www.law.cornell.edu/uscode/text/18/2258E), "provider" defined as an electronic communication service provider or remote computing service
- [RFC 2142: Mailbox Names for Common Services, Roles and Functions](https://www.rfc-editor.org/rfc/rfc2142.html), the ABUSE mailbox and its siblings (May 1997)
- [RFC 7725: An HTTP Status Code to Report Legal Obstacles](https://www.rfc-editor.org/rfc/rfc7725.html), status 451, the `blocked-by` link relation, response body contents, cacheability (February 2016)
- [RFC 9083: JSON Responses for RDAP](https://www.rfc-editor.org/rfc/rfc9083.html), the `abuse` entity role (June 2021)

**ICANN and the DNS**

- [ICANN: 2024 Global Amendments to the Base gTLD Registry Agreement and Registrar Accreditation Agreement](https://www.icann.org/resources/pages/global-amendment-2024-en), the 5 April 2024 effective date, voting results, Board approval, registrar and registry obligations
- [ICANN: Advisory, Compliance with DNS Abuse Obligations in the RAA and RA](https://www.icann.org/resources/pages/advisory-compliance-dns-abuse-obligations-raa-ra-2024-02-05-en), the DNS Abuse definition and SAC 115, abuse contact and receipt requirements, actionable evidence, mitigation examples, collateral damage, timing, registry referral
- [ICANN: DNS Abuse Mitigation Program, key updates from 2024](https://www.icann.org/en/blogs/details/icanns-dns-abuse-mitigation-program-key-updates-from-2024-10-12-2024-en), 192 investigations, 2,700+ domains suspended, 350+ phishing sites taken down in the first six months
- [ICANN Contractual Compliance: DNS Abuse reports](https://compliance-reports.icann.org/dnsabuse.html), monthly reports on DNS Abuse complaints, investigations and resolutions
- [ICANN Contractual Compliance: DNS Abuse report list](https://compliance-reports.icann.org/dnsabuse/dashboard/trends-list.html), report metrics and the latest period covered
- [IETF: The current state of RDAP](https://www.ietf.org/blog/current-state-of-rdap/), the WHOIS sunset on 28 January 2025 and RDAP adoption

**Hosts, CDNs and registrars**

- [Newfold Digital: Report Abuse](https://www.newfold.com/abuse), brands covered, inquiry types, attachment limit, case IDs, discretion and privacy statements
- [GoDaddy: Report Abuse](https://legalportal.godaddy.com/abuse), report categories including CSAM, UK/EU complaints and public safety
- [Namecheap: How and where can I file abuse complaints?](https://www.namecheap.com/support/knowledgebase/article.aspx/9196/5/how-and-where-can-i-file-abuse-complaints/), separate registrar and hosting mailboxes, evidence per category, registrar-only limits, 72-hour processing, 24-hour law enforcement channel, reporting API, clientHold and serverHold
- [Cloudflare: Our approach to abuse](https://www.cloudflare.com/trust-hub/abuse-approach/), forwarding to operator and host with the origin IP, action on hosted products, registrar scope, repeat infringer termination
- [Cloudflare: Report abuse](https://developers.cloudflare.com/fundamentals/reference/report-abuse/), the abuse form and complaint types
- [Cloudflare: CSAM Scanning Tool](https://developers.cloudflare.com/cache/reference/csam-scanning/), matching cached content against known lists, daily notifications, role-gated review requests, the owner's reporting obligation
- [Cloudflare: The CSAM Scanning Tool](https://blog.cloudflare.com/the-csam-scanning-tool/), the 451 response, free on all plans, undisclosed internals (18 December 2019)
- [AWS: Abuse reporting FAQs](https://repost.aws/articles/ARDaJQbZSdSdKpFjrFMNmgzQ/abuse-reporting-faqs), evidence per abuse type, bulk CSV format, confirmation and resolution emails, no customer disclosure, least invasive suspension, image-based sexual abuse reports
- [AWS: Abuse notice FAQs](https://repost.aws/articles/ARi420OrIGR0y_9pOOker1QQ/abuse-notice-faqs), customer notices, response deadlines, extensions, disputes, remediation after a resource is disabled
- [AWS: Acceptable Use Policy](https://aws.amazon.com/aup/), removing or disabling violating content or resources
- [DigitalOcean: Report abuse](https://www.digitalocean.com/company/contact/abuse), the security operations abuse form
- [DigitalOcean: Acceptable Use Policy](https://www.digitalocean.com/legal/acceptable-use-policy), removal, traffic blocking, suspension and termination
- [Hetzner: Terms and Conditions](https://www.hetzner.com/legal/terms-and-conditions/), locking servers for DDoS and open relays, removal requests and locking access for illegal content
- [OVHcloud: Abuse](https://www.ovhcloud.com/en/abuse/), the abuse form and mailbox, imminent threats to the authorities
- [Bluehost: Protecting copyrights](https://www.bluehost.com/help/article/protecting-copyrights), customer notice and 48 hours to remove before access is disabled

**Industry bodies, lists and browsers**

- [M3AAWG and i2Coalition: Anti-Abuse Best Common Practices for Hosting and Cloud Service Providers](https://www.m3aawg.org/sites/maawg/files/news/M3AAWG_Hosting_Abuse_BCPs-2015-03.pdf), vetting, role mailboxes, RIR records, acknowledgments, trusted reporters, the complaint priority chart, the handling steps, suspension short of termination, fraudulent accounts, IPv6 per-customer addressing, ARF for automated reports (March 2015)
- [M3AAWG: Hosting service providers best practices press release](https://www.m3aawg.org/news/new-m3aawg-hosting-service-providers-best-practices-backed-by-i2c-aim-to-reduce-end-user), publication date and joint authorship (17 March 2015)
- [APWG: Phishing Activity Trends Reports](https://apwg.org/trendreports/), the second quarter 2026 summary: 425,808 attacks in June 2026, up 10.1% in the quarter
- [Interisle: Phishing Landscape 2025](https://interisle.net/insights/phishing-landscape-2025-an-annual-study-of-the-scope-and-distribution-of-phishing), 1.96 million attacks, 1.5 million domains, 77% malicious registrations, 37% bulk registrations, US hosting share, recommendations
- [Spamhaus: Spamhaus Blocklist (SBL)](https://www.spamhaus.org/sbl/), what is listed, notice to the responsible network, escalation to wider ranges and ASNs, removal by the network only, no fees
- [SURBL: Lists](https://www.surbl.org/lists), domain and URL lists for phishing, malware and cracked sites, use in mail filters
- [Abusix: XARF overview](https://docs.abusix.com/docs/abuse-reporting/xarf/xarf-overview), JSON abuse reporting schemas, transports, incident types
- [Google Safe Browsing: Report a page](https://safebrowsing.google.com/safebrowsing/report_phish/), public phishing reports
- [Microsoft: Report an unsafe site](https://www.microsoft.com/en-us/wdsi/support/report-unsafe-site), public reports and multi-URL submissions for corporate accounts
- [Google Search Console Help: Security Issues report](https://support.google.com/webmasters/answer/9044101), hacked content, malware and social engineering categories, review requests and timing

**Courts**

- [Cox Communications, Inc. v. Sony Music Entertainment, No. 24-171 (2026)](https://www.law.cornell.edu/supremecourt/text/24-171), decided 25 March 2026, contributory liability requires inducement or a service tailored to infringement; knowledge alone insufficient
