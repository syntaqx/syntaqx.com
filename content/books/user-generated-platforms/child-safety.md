+++
title = "Child Safety: Detection & Reporting"
nav_title = "Child Safety"
description = "How platforms detect, report and preserve child sexual abuse material: 2258A, CyberTipline reports, hash lists, the IWF, AI imagery, EU and UK rules."
category = "User-Generated Platforms Industry"
order = 1836
part = "Trust and Safety"
tags = ["trust-and-safety", "child-safety", "csam", "hash-matching", "ncmec", "compliance"]
+++

Every platform that accepts uploads, messages or streams from strangers will receive child sexual abuse material (CSAM), grooming attempts and sextortion, whatever its size and whatever its audience. This is the one harm where the law hands the platform a duty with a deadline, a fixed recipient and a preservation clock, and where the industry has built shared infrastructure (hash lists, hotlines, a reporting API, signal-sharing programs) that no single company could build alone. The platform's job is narrow and unforgiving: find known material before anyone sees it, route new material and grooming to trained people fast, report what it knows to the right body with enough detail that a child can be found, keep the evidence safe for exactly as long as the law says, and never expose its own staff to more of it than the decision needs.

The playbook's [Trust & Safety](/docs/security/trust-and-safety#child-safety) doc holds the general rule in a few paragraphs: a dedicated queue, hash matching before content is visible, restricted evidence, immediate account action and grooming signals. This chapter is the industry detail behind it: the US reporting duty as the REPORT Act rewrote it, what a CyberTipline report actually contains and how NCMEC handles it, preservation, the hash technologies and the lists they match against, the Internet Watch Foundation, the law on AI-generated material, the EU's on-again, off-again legal basis for scanning messages, Ofcom's measures and the UK's new reporting duty, grooming and sextortion as operations, and how to review these cases without harming the reviewers. It describes law, reporting mechanics, hashing technology and operations only. Statuses are as of October 2026, and none of this is legal advice: the reporting duties carry criminal and civil exposure, and counsel should own the policy that the system implements.

## How the Platforms Do It

Every published child-safety program has the same three layers: hash matching against lists of known material, classifiers that rank unknown material for human review, and specialist people who confirm, report and act. What differs is where the layers run and how much each platform says about them.

| Platform or program | What it publishes about child safety |
| --- | --- |
| **Bluesky** | Hash matching for known CSAM through Thorn's Safer, with matched content diverted before moderators or users see it; 12,647 pieces of content diverted for specialist review and 5,238 reports to NCMEC in 2025, each after human assessment |
| **Twitch** | Machine detection on live and recorded video for high-severity harms including CSAM, every report human-reviewed, edge cases enforced first and reviewed more deeply on appeal; NCMEC reports rose from 959 in the first half of 2025 to 1,409 in the second, which Twitch attributes to better classification and escalation |
| **Discord** | Joined the IWF to use its URL List, Keywords List, Non-Photographic URL List and Hash List; shares signals through the Tech Coalition's Lantern program; Teen Safety Assist (built with Thorn) alerts teens on first DMs from strangers and filters sensitive media by default; zero tolerance explicitly covers AI-generated photorealistic CSAM |
| **YouTube and Google** | Built CSAI Match for video and the Content Safety API classifier, and offers both free to qualifying partners; Google contributes about 74% of the hashes on NCMEC's industry list |
| **Mastodon servers (IFTAS pilot)** | A 26-week pilot hashed 1.86 million media files from eight servers with about 450,000 accounts, found 4.29 matches per 100,000 files and filed 53 NCMEC reports covering 80 files; it shut down for lack of funding, and its advice to small servers is to ask their host or CDN for scanning |
| **Infrastructure** | Cloudflare scans cached content against child-safety lists for free on every plan; the IWF's Image Intercept offers lightweight hash matching to small platforms |

Two facts from NCMEC's 2025 data frame the market. Reporting is concentrated: just over 300 companies submitted CyberTipline reports in 2025, and five of them accounted for more than 75% of reports. And registration is broad: more than 2,000 electronic service providers are registered with NCMEC, 23% of them outside the United States and registered voluntarily. A platform with a few thousand users is almost certainly not one of the five, and almost certainly does receive this material; the IFTAS pilot's match rate on small federated servers is the clearest public evidence that small and decentralized services are not exempt from the problem.

The vendors fall into the same layers. [The Platform Landscape](/books/user-generated-platforms/platform-landscape#trust-and-safety) lists them with access terms; [Hash Matching](#hash-matching) below covers what each does, and Moderation at Scale's [Vendors](/books/user-generated-platforms/moderation-at-scale#vendors) covers buying classifiers and review capacity in general.

## The Reporting Duty

The US duty is in 18 U.S.C. § 2258A. A provider must report to NCMEC's CyberTipline "as soon as reasonably possible after obtaining actual knowledge" of facts or circumstances indicating an apparent violation of the covered offenses. The duty falls on providers of electronic communication and remote computing services, which covers every platform in this book and the hosts and CDNs beneath them ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks#cdn-scanning) covers the host's position).

- **Covered offenses.** The child pornography offenses in sections 2251, 2251A, 2252, 2252A, 2252B and 2260; section 1591 (sex trafficking) where a minor is involved; and section 2422(b) (enticement of a minor). The last two were added by the REPORT Act, which is why reports of enticement and trafficking now go through the same pipeline as imagery.
- **Planned or imminent violations.** A provider "may" report facts indicating a child pornography violation is planned or imminent. It's permitted, not required; my default is to report, because the imminent case is the one where a report can prevent abuse rather than document it.
- **No duty to scan.** Subsection (f) says nothing in the section requires a provider to monitor users or communications, or to "affirmatively search, screen, or scan" for these facts. The duty is triggered by knowledge, however it arrives: a user report, a moderator's review, a hash match a person looks at, a customer support ticket. [Knowledge Is the Trigger](/books/user-generated-platforms/hosting-liability#knowledge-is-the-trigger) covers why that trigger shapes everything.
- **Penalties.** A knowing and willful failure to report is fined up to $850,000 for a first failure and $1,000,000 for later ones for providers with at least 100 million monthly active users, and up to $600,000 and $850,000 for smaller providers.

### What the REPORT Act Changed

The Revising Existing Procedures On Reporting via Technology Act (Pub. L. 118-59, approved May 7, 2024) is the largest change to the regime since it was written:

| Area | Before | After the REPORT Act |
| --- | --- | --- |
| Offenses reported | Child pornography offenses | Adds § 1591 where a minor is involved and § 2422(b) enticement |
| Preservation | 90 days | 1 year, with voluntary longer preservation "for the purpose of reducing the proliferation of online child sexual exploitation" |
| Preservation security | Not specified | Consistent with the most recent NIST Cybersecurity Framework, within one year of enactment |
| Fines | $150,000 first, $300,000 later | $600,000 or $850,000 first, $850,000 or $1,000,000 later, by size |
| Vendors | No specific protection | NCMEC's contracted vendors shielded from liability if they secure imagery under the NIST CSF, minimize employee access, use end-to-end encryption or equivalent, and pass an independent annual cybersecurity audit (§ 2258B(d)) |
| Victims | No specific protection | A person depicted as a minor, or their representative, is shielded from liability for reporting the imagery to the CyberTipline, and NCMEC must minimize access and delete appropriately (§ 2258B(e)) |
| Guidance | None | NCMEC may issue guidelines on identifiers for trafficking and enticement content |

The effects show in NCMEC's numbers: child sex trafficking reports rose 323% in 2025 over 2024, which NCMEC attributes largely to the REPORT Act's requirements. For a platform, the change means the child-safety category in the policy enum covers solicitation, enticement and trafficking indicators as reportable conduct, not just imagery, and the report pipeline handles text-only incidents.

### Beyond the United States

The US duty is the one most platforms build for first because NCMEC is the clearinghouse most other countries receive reports from, but it isn't the only one:

- **United Kingdom.** Since April 7, 2026, regulated user-to-user services must report detected and unreported CSEA content to the National Crime Agency (NCA) under the Online Safety Act and the Online Safety (CSEA Content Reporting by Regulated User-to-User Service Providers) Regulations 2026. UK-based providers report everything; providers outside the UK report UK-linked content. Content already reported to an equivalent foreign body such as NCMEC is not "unreported", and Ofcom tells services not to send the same content to both, because NCMEC passes UK-linked reports to the NCA. [Ofcom's Measures](#ofcom-s-measures) has the detail.
- **European Union.** The EU has no general reporting duty for platforms today. The interim derogation that lets messaging services scan voluntarily requires every "reasoned and verified suspicion" found under it to be reported without delay to law enforcement or an organization acting in the public interest against child sexual abuse ([The EU Derogation and the CSA Regulation](#the-eu-derogation-and-the-csa-regulation)).
- **Elsewhere.** Other countries have their own regimes. The system should support a report per recipient, with the recipient as data, rather than hard-coding NCMEC.

## What a CyberTipline Report Contains

Section 2258A(b) lists what a report may include, "at the sole discretion of the provider" and to the extent the information is in its custody or control. NCMEC's CyberTipline Reporting API turns those categories into a schema, and reading the two side by side is the fastest way to see what a platform must be able to produce on demand:

| § 2258A(b) element | Where it lands in the API | What the platform must have kept |
| --- | --- | --- |
| Identifying information about the individual: email, IP address, URL, non-personal payment information | `personOrUserReported`: screen name, the platform's own identifier, IP capture events, device IDs, whether the account was disabled | Account identifiers, verified contact points, login and upload IPs with timestamps, device signals |
| Historical reference: when and how content was uploaded, transmitted, received or discovered, with date, time stamp and time zone | `incidentSummary` (incident type and date-time) and per-file `uploadedToEspTimestamp`; timestamps must be ISO 8601 with a zone | Upload and discovery times on every asset and message, in UTC with offset |
| Geographic location: IP address or verified address | IP capture events with an event name (Login, Registration, Purchase, Upload, Other, Unknown) and an optional possible-proxy flag | IP history per account, kept long enough to be useful |
| The visual depictions | Uploaded files, each with an MD5 or SHA-1 original-file hash, original file name, EXIF and hash metadata | The original file, not just a transcoded rendition |
| The complete communication, including transmission data and attached files | The incident container (web page, chat or instant message, email, peer-to-peer and others), intended recipients, victims | The conversation around a message, not just the message |

The API's workflow is a small state machine: submit the report document and receive a report ID; upload each file; optionally send per-file details; then finish, after which no files can be added and the report can't be retracted. An unfinished report can be retracted, and NCMEC deletes unfinished reports automatically 24 hours after opening or one hour after the last change, whichever is later. Credentials are issued by NCMEC on request, and a separate test environment exists, so the integration can be built and tested before the first real report.

A few fields carry decisions the platform has to make deliberately:

- **Incident type.** One of eight values: child pornography (possession, manufacture and distribution), child sex trafficking, child sex tourism, child sexual molestation, misleading domain name, misleading words or digital images on the internet, online enticement of children for sexual acts, and unsolicited obscene material sent to a child.
- **Whether a person viewed the file.** Each file carries `fileViewedByEsp` and `exifViewedByEsp` (the schema requires the first to be true whenever the second is) and `publiclyAvailable`. These aren't trivia. In *United States v. Wilson* (9th Cir. 2021), Google's system matched four images by hash, no Google employee viewed them, and the agent who opened them after NCMEC forwarded the report did so without a warrant; the Ninth Circuit held the agent's viewing exceeded the private search and needed one. Whether a human at the platform looked at a file before reporting changes what law enforcement can do with the report without further process, so the platform records it truthfully per file and sets its viewing policy with counsel ([Reviewing Child Safety Cases](#reviewing-child-safety-cases)).
- **Annotations.** File annotations include `generativeAi` ("believed to be Generative Artificial Intelligence"), `possibleSelfProduction`, `viral`, `potentialMeme`, `liveStreaming`, `infant` and others; report annotations include `sextortion`, `csamSolicitation`, `minorToMinorInteraction`, `sadisticOnlineExploitation` and `informational`. They're how NCMEC triages, so they belong in the platform's own case labels, set by the reviewer and copied into the report rather than inferred at submission.
- **Industry classification.** An optional A1, A2, B1 or B2 value on NCMEC's ESP categorization scale, which the API documentation lists without defining; a platform that uses it should take the definitions from NCMEC directly.
- **Escalation.** `escalateToHighPriority` marks a report NCMEC should look at first. The platform's rule for setting it (a child in apparent ongoing danger, an offender's stated plan to meet a child) should be written down, not left to a reviewer's mood.

### Bundling

A viral image shared by thousands of accounts produces thousands of reports that all describe the same picture. NCMEC added a feature in 2024 that lets large platforms "bundle" related reports of a widespread incident; bundled reports "still contain information on every reported user and incident." In the API this is a `batchedReport` element with a reason, and the only documented reason, a meme with viral potential, comes with restrictions such as a single uploaded file. NCMEC's 2024 figures show what bundling does to counts: reports fell from 36.2 million in 2023 to 20.5 million in 2024, and NCMEC named bundling as one cause alongside weaker reporting by some providers and the spread of end-to-end encryption.

My rule: a CyberTipline report is per incident, not per file. Files from one user in one session go in one report; a viral file shared by many users goes in a bundle if NCMEC has enabled it for the platform, and otherwise in one report per sharing user; a grooming conversation is one report with the conversation attached. The grouping rule is policy, versioned like any other, because it changes the platform's reported numbers and [Transparency Reporting](/docs/security/trust-and-safety#transparency-reporting) has to explain them.

### Reports That Can Be Acted On

NCMEC's 2025 data is blunt about what makes a report useful. More than 10% of industry reports lacked enough information to tell where the offense occurred, and among companies with at least 100 reports, NCMEC lists twelve where more than half lacked jurisdictional information. Without a location NCMEC can't refer the report to the agency where the incident happened. The fields that make a report actionable are the ones platforms tend not to keep: upload IPs with timestamps, login IPs over time, verified contact points, and the conversation around the file. Retention for those records is a child-safety decision as much as a privacy one, and the two have to be made together ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).

## Preservation

A completed CyberTipline report is treated as a request to preserve the reported contents "for 1 year after the submission" (§ 2258A(h)(1)). The details matter:

- **Scope.** The provider preserves the reported contents and other reasonably accessible visual depictions, data and files that may provide context about the reported material or person ((h)(2)). The conversation, the account's other uploads, the IP and device history all qualify.
- **Security.** Preserved materials are kept in a secure location with access limited to what's needed to comply ((h)(3)), and, since one year after the REPORT Act's enactment, in a manner consistent with the most recent NIST Cybersecurity Framework ((h)(6)).
- **Longer, voluntarily.** A provider may preserve the contents for longer than a year to reduce the proliferation of online child sexual exploitation ((h)(5)). Keeping hashes for future matching is the obvious use; keeping the files themselves longer needs a reason and a decision on record.
- **Law enforcement requests on top.** A preservation letter or legal process received after the report extends what's kept and for how long; [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework) covers those.

The UK regulations have their own retention rule for reports to the NCA: the report reference number for five years from issue, and the detected content and related information for one year from the date the report was sent. The EU derogation pulls the other way for messaging services that scan under it: data processed and found to be suspected abuse may be stored only for the listed purposes and "no longer than 12 months from the date of the identification", without prejudice to any legal obligation to preserve. A platform operating in all three places needs a hold per record and per legal basis, not one global retention rule.

In the data model, preservation is a row in [`legal_holds`](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds) with reason `cybertipline_preservation`, created when the report is finished, covering every asset, revision, message and account record attached to the report, with `notify_user = false`. The account's deletion request, the platform's storage purge and a user's GDPR erasure request all skip held records until the hold ends ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)). Removal from public view happens immediately and is separate: the content item is removed and the media asset quarantined, while the original file moves to the restricted evidence store under the hold. Purging the file because the post was deleted is the classic failure, and it destroys exactly the evidence the statute says to keep.

![A state machine of one report to the national clearinghouse. Along the accented path, draft (case confirmed, knowledge time) leads to submitted (report id issued, files uploaded), then to finished (no files added, no retraction), and on finish to a preservation hold of the contents and context for 1 year from finish, longer voluntarily. Two dashed exits leave submitted: retract, to the terminal state retracted, and not finished, to a dashed terminal state deleted unfinished, 24 hours after opening or 1 hour after the last change, whichever is later. A legend marks the report's path, the exits, terminal states and a hold every purge skips, and a footnote says removal from public view is immediate and separate, with the original moved to the restricted evidence store.](/diagrams/ugp-child-safety-report-states.svg "Finishing a CyberTipline report is the step that matters: it ends retraction, and under 18 U.S.C. 2258A(h) it starts the one-year preservation that every deletion and purge path must respect. An unfinished report is deleted by NCMEC on its own clock.")

## After a Report

What NCMEC does with a report explains what the platform should put in it. By NCMEC's own description:

1. **Review and labeling.** Analysts label files by content type, estimated age range and other details. Hash matching then identifies repeat files in future reports; NCMEC labeled more than 14.6 million files in 2025 and holds more than 77.1 million labeled files in total.
2. **Referral or informational.** A report is referred to a specific law enforcement agency when the company provided enough information (user details, imagery, a possible location for the child or offender) to do so. It's designated informational when the information is insufficient or the imagery is viral and has been reported many times. In 2025 more than 18.8 million reports were referred and more than 4.5 million designated informational. All reports remain available to US federal law enforcement.
3. **Forwarding.** Section 2258A(c) lets NCMEC make reports available to federal agencies investigating child sexual exploitation, kidnapping or enticement; state and local agencies investigating child sexual exploitation; and foreign agencies designated by the Attorney General or with an established relationship with the FBI, ICE or INTERPOL. In 2025, 77% of reports involved uploads by users outside the United States, 9% were US-based and 14% unknown; NCMEC has law enforcement partnerships in 170 countries and territories.
4. **Notices back to platforms.** For confirmed CSAM, exploitative content or predatory text that's still online, NCMEC notifies the hosting provider and keeps sending follow-up notices until it's addressed. It issued more than 172,000 removal notices in 2025 with an average takedown time of 2.6 days, and shared more than 12.1 million hashes with 78 providers.

The platform's side of this is a set of inbound flows: NCMEC notices that need the same urgency as any [legal notice](/books/user-generated-platforms/hosting-liability#legal-clocks), law enforcement legal process that follows a referral ([Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework)), and hash list updates that flow into matching. A report is not the end of the case. The case stays open until removal is confirmed, the account action is in place and the hold is recorded.

The scale, from NCMEC's 2025 data:

| Measure | 2025 |
| --- | --- |
| CyberTipline reports | 21.3 million (21,181,300 from providers, 170,193 from the public) |
| Reports directly from victims | 5,700, more than double 2024 |
| Files in reports | 61.8 million: 29.4 million images, 26.3 million videos, 6.1 million other |
| Unique files | 13.9 million images (48%), 7.3 million videos (28%) |
| Online enticement | 1.4 million reports (up 158%), including more than 80,000 concerning sextortion |
| Financial sextortion | An average of 137 reports a day, up 37% |
| Child sex trafficking | Up 323% |
| Sadistic online exploitation | More than 3,000 reports, up more than 125% |
| Generative AI nexus | More than 400,000 reports; more than 182,000 involved possessing, generating or attempting to generate AI-generated CSAM |
| Take It Down | More than 130,000 submissions, leading to requests to remove more than 273,000 images and videos |

The generative AI line needs care. NCMEC's data page gives the figures above, lists Amazon AI Services among the companies whose reports often lacked jurisdictional information, and notes reporting improvements from Amazon AI Services, Grindr and X.AI in early 2026. Other summaries of the same year circulate larger AI totals; I cite only what the data page says.

## Hash Matching

A hash is a short fingerprint computed from a file. Matching a new upload's fingerprint against a list of fingerprints of material already judged illegal finds copies without anyone having to look at the upload. There are two kinds, and Ofcom's guidance to file-sharing services explains the difference plainly: **cryptographic** hashes (MD5, SHA-1, SHA-256) "can only detect identical images", while **perceptual** hashes are "more likely to detect slightly altered or similar content to known CSAM." A cryptographic hash changes completely when one pixel changes; a perceptual hash changes a little when the image changes a little, so two perceptual hashes can be compared as a distance.

That distance makes the threshold a policy decision, not a technical constant. Cloudflare's launch post for its scanning tool says it directly: a strict threshold misses altered copies (false negatives), a loose one flags innocent images (false positives) that can overwhelm the people reviewing them, and "one size does not fit all," which is why it lets site owners choose. The same post explains why the internals are "intentionally a bit of a mystery": if people knew exactly how matching worked, they could alter images to defeat it. This chapter follows the same rule and stays at the level of concepts.

The tools in use, as their owners describe them:

| Tool | Owner | What it does | Access |
| --- | --- | --- | --- |
| **PhotoDNA** | Microsoft | Creates a hash of an image and compares it to hashes of known illegal images; "not facial recognition software", and the hash "is not reversible"; offered as an Azure cloud service since 2015 | Free to qualified organizations, law enforcement and tool providers |
| **PDQ** | Meta | Open-source photo hash, "built from the ground up as a distinct algorithm" with "much inspiration" from pHash; released August 2019 | Open source (ThreatExchange repository) |
| **TMK+PDQF** | Meta, with the University of Modena and Reggio Emilia | Open-source video hash released with PDQ, designed so hash-sharing systems "talk to each other" | Open source |
| **CSAI Match** | YouTube | The partner fingerprints a video at upload and sends the fingerprint; the API returns match or no match, the matching portion of the video and a standardized content category; the partner reviews matches before acting | Free to qualifying industry and NGO partners |
| **Content Safety API** | Google | A classifier for previously unseen images and video that returns a priority value; Google recommends placing it "right before the manual review process" and says "Partners must conduct their own review" | Free, by application |
| **Safer** | Thorn | Perceptual hashing for images (SaferHash) and video (scene-sensitive SSVH), predictive classifiers for novel CSAM, and a text classifier for child exploitation including sextortion; self-hosted or API | Commercial |
| **Hive CSAM Detection API** | Hive (whose site now says it "is now Deploy") | Built on Safer: hash matching, classifier scores in three classes for human review, Thorn's text classifier, and a tool for preparing CyberTipline reports | Commercial |
| **CSAM Scanning Tool** | Cloudflare | Compares content served through Cloudflare's cache to child-safety lists such as NCMEC's, blocks matches where possible, emails the customer daily with matched paths; launched December 2019 | Free on all plans |
| **Image Intercept** | IWF | A lightweight tool combining PhotoDNA, cryptographic matching and other methods against the IWF's list, blocking a match "before it is uploaded, stored, or shared"; aimed at small platforms | IWF program |

Thorn's own figures for Safer in 2025 (marketing figures, not audited) give a sense of the volumes: 415.4 billion files processed for more than 80 platforms, 1,458,545 files matched to known CSAM, more than 3.84 million flagged by classifiers as potential novel CSAM, and 318.5 million lines of text processed with about 1.3 million flagged.

How the pieces fit in a pipeline:

- **Exact hashes first, perceptual second.** The SHA-256 the platform already computes for deduplication ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) keeps it on `media_assets`) is checked against exact lists for free; perceptual matching (PhotoDNA, PDQ or a vendor hash for images, a video hash for video) runs in the upload path before the asset is visible. The upload path's states (`scanning` before `ready`, `quarantined` on a hit) are what make "before visible" real; [The Upload Path](/books/user-generated-platforms/upload-path#scanning-before-publish) covers placing the scan.
- **Classifiers rank, people decide.** A hash match finds a copy of something already judged; a classifier finds something new and returns a score. Google's Content Safety API returns a priority, not a verdict, and the EU derogation makes the same rule law for messaging services: material not previously identified as CSAM may not be reported without "prior human confirmation." Classifier hits go to the specialist queue ordered by score; they're never auto-reported. [Classifiers as Prioritizers](/books/user-generated-platforms/moderation-at-scale#classifiers-as-prioritizers) covers banding in general.
- **Video and live are harder.** Video needs a video hash, and live streams need sampling of frames or segments while live; Twitch notes that ephemeral live content is a harder environment for machine detection than uploads. The stream's recording is scanned again after the fact. [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding) covers ingest, and [Livestreams](/books/user-generated-platforms/violent-extremism-and-graphic-content#livestreams) covers live incident response.
- **Messages and encryption.** Hash matching needs the content. On unencrypted messages it runs like any upload (in the EU, only under the derogation's conditions); end-to-end encrypted messages are outside what the server can match, and the EU's 2026 derogation explicitly excludes them. NCMEC names the spread of end-to-end encryption as one reason reports fell in 2024.
- **Edge scanning complements, never replaces.** A CDN can block a URL it serves; it can't remove the file, close the account or file the report with the context only the platform has. Cloudflare's documentation puts the reporting obligation on the site owner ([CDN Scanning](/books/user-generated-platforms/abuse-desks#cdn-scanning)).

![Hash matching on the upload path. An upload in the scanning state passes an exact hash check against exact lists, then a perceptual check within a threshold, then a classifier that returns a score; with no hit at each step it reaches ready, the terminal visible state. Each kind of hit drops to its own handling: a vetted list match is acted on unviewed (remove, quarantine, restrict the account); a near match gets a minimal view where a person confirms it; a classifier hit goes to a specialist queue ordered by score. All three lead, in the accent, to the confirmed case where the report is filed, the classifier path only after a person confirms, with the list, version, algorithm and distance on every match and whether anyone viewed each file. A footnote says a classifier hit is never reported without a person's confirmation.](/diagrams/ugp-child-safety-hash-matching.svg "Hashes find copies of what is already judged; classifiers find new material and only order the queue. Every path ends in a confirmed case whose report says truthfully which list matched and whether anyone looked.")

The same machinery serves other harms with other lists: terrorist content ([GIFCT and Hash Sharing](/books/user-generated-platforms/violent-extremism-and-graphic-content#gifct-and-hash-sharing)) and intimate image abuse ([Hash-Based Prevention](/books/user-generated-platforms/intimate-image-abuse#hash-based-prevention)). One matching service with one `hash_matches` table and a list per source is the right shape; a separate pipeline per harm is the wrong one.

## The Hash Lists

The hash is only as good as the list behind it, and the lists are run by different organizations under different terms:

| List | Run by | What's on it | Access |
| --- | --- | --- | --- |
| **NCMEC NGO hash list** | NCMEC | "More than five million hash values of confirmed, triple-vetted CSAM", with other child-serving NGOs able to contribute | Interested technology companies |
| **NCMEC industry hash sharing** | NCMEC, contributed by companies | Companies' own CSAM hashes shared with each other; Google supplies about 74% | Select companies |
| **IWF Hash List** | Internet Watch Foundation | 3,224,085 hashes at the end of 2025 (3,049,074 images and 175,011 videos); every item assessed by at least two people; PhotoDNA, MD5, SHA-1 and SHA-256; contextual metadata compatible with UK, US, Canadian, Australian and New Zealand classifications and the INTERPOL baseline | IWF members, under licence |
| **IWF URL List** | Internet Watch Foundation | Webpages with confirmed CSAM, updated twice a day | IWF members, under licence |
| **Vendor databases** | Thorn and others | Safer's 6.3 million image and 64 million video hashes at the end of 2025 (Thorn's figures), drawn from partners such as NCMEC | Vendor customers |
| **The platform's own list** | The platform | Hashes of material the platform has itself confirmed and reported | Internal |

NCMEC shared more than 12.1 million hashes with 78 providers in 2025, and the IWF added 317,101 newly identified items to its list in 2025 after assessing 514,831. The lists overlap but aren't the same, which is why platforms subscribe to more than one: the IFTAS pilot found hotline-run databases (NCMEC's and Arachnid) matched better than commercial ones on its traffic.

List hygiene is where the operational risk sits:

- **Record which list and which version matched.** A match is evidence; "it matched something" isn't. Every match row carries the list, the list's version at match time, the algorithm and the distance.
- **Honor removals.** Ofcom's safeguards for hash matching say hashes should be "correctly identified before being added to databases, and removed if they are not CSAM." When a list provider withdraws a hash, past matches against it need review, and a block that rested only on it may need lifting.
- **Refresh on the provider's cadence.** The IWF asks members to refresh the URL List at least once every 24 hours; a list synced monthly is a list that misses a month of new material.
- **Keep the access agreement with the list.** Each list has a licence, membership or information-sharing agreement with terms on use, storage and onward sharing. The agreement's reference and expiry belong on the list record, because an expired agreement is a list the platform should stop using.
- **Separate policy by label.** IWF hashes carry category metadata and NCMEC files carry labels; GIFCT labels hashes by entity and behavior. Store labels on the match so the action policy can differ by label (block and report, block and review, review only) without a code change.

**Contributing back.** A platform that confirms new material should hash it and add it to its own list at once, so the next copy is caught before anyone sees it. Contributing to NCMEC's industry list or a hotline's database comes with the program's own vetting and access agreement; the EU derogation explicitly allows "creating a unique, non-reconvertible digital signature ('hash') of data reliably identified" as abuse material. My rule: only human-confirmed material goes into any list the platform contributes to, with the confirming decision linked, because a false positive on a shared list spreads to every member.

## The IWF

The Internet Watch Foundation is the UK's hotline for online child sexual abuse imagery: an independent registered charity, founded in 1996, funded by member companies, other companies and the public. It's the reference body for UK law the way NCMEC is for US reporting, and for most platforms it matters in three ways: as a source of lists, as a reporting route, and as Ofcom's partner.

**Reporting.** Members of the public report suspected imagery anonymously through the IWF's UK reporting page, and analysts assess it against UK law and work with hosts and police to remove it. The IWF also runs "over 50" Reporting Portals, scaled-down versions of its form for countries without their own hotline, which feed its analysts in the UK. In 2025 it assessed 451,210 reports and confirmed 311,610 as containing or leading to CSAM; the UK hosted 951 of the URLs it actioned, 0.30% of the total. Its Report Remove service lets young people in the UK report their own images for removal: 1,894 submissions in 2025, leading to 1,175 actioned reports. A platform's help pages should send UK users to the IWF (and UK under-18s to Report Remove) the way US pages send people to NCMEC and Take It Down.

**The network.** The IWF is a founding member of INHOPE, the international network that, by its own count, connects 58 member hotlines in 53 countries and exchanges reports across borders through its ICCAM tool. When a hotline finds material hosted in another country, it passes the report to that country's hotline. The IWF also sends "Simultaneous Alerts" about material hosted on US networks.

**Services.** The IWF lists these member services: the Image Hash List, the URL List (with a domain-level flag for sites dedicated to the material), a Keywords List, a Non-Photographic Imagery URL List (computer-generated, drawn or animated abuse imagery), Takedown Notices to UK organizations, Domain Alerts for registries, Virtual Currency Alerts and Payment Brand Alerts for financial services, and Newsgroup Services. The URL List in 2025 held 260,699 unique URLs over the year, with an average of 1,212 added each day; the IWF removes a URL once the content is taken down, asks members to block only at the level each entry specifies, and recommends a splash page for blocked pages (it says splash pages have sent 26,000 people to the Stop It Now! support site since 2015). A platform uses the URL List to stop users posting links to listed pages, not just to block its own network.

**Membership.** Lists are licensed to members: hosting and file-sharing services, social and chat services, data centres, search engines, ISPs, filtering and security companies, registrars. The fee structure is set by the IWF's board with its members and isn't published as a public price list, so budget for it as a negotiated cost.

**Ofcom.** The IWF is the only non-law-enforcement body with access to the UK Government's Child Abuse Image Database, from which it has assessed and graded more than two million images. Ofcom and the IWF signed a memorandum of understanding in November 2025 setting out how the IWF supports Ofcom's online safety work, and Ofcom's CSAM URL measure points services to listed URLs of exactly the kind the URL List provides.

## AI-Generated Abuse Material

Generative models create two problems for platforms: users uploading AI-generated or AI-altered abuse imagery, and users trying to make the platform's own generation tools produce it. NCMEC's 2025 figures cover both: more than 400,000 reports with a generative AI nexus, more than 182,000 of them involving possessing, generating or attempting to generate it. The IWF found 3,443 AI-generated child sexual abuse videos in 2025, more than 260 times its 2024 figure.

**United States.** The federal definition of child pornography in 18 U.S.C. § 2256(8) already reaches some synthetic material: it covers a "computer-generated image that is, or is indistinguishable from," that of a minor engaging in sexually explicit conduct, and a depiction "created, adapted, or modified to appear that an identifiable minor" is engaging in it. "Indistinguishable" means an ordinary person would conclude the depiction is of an actual minor, and the definition excludes drawings, cartoons, sculptures and paintings. Separately, 18 U.S.C. § 1466A covers obscene visual depictions "of any kind, including a drawing, cartoon, sculpture, or painting," and says it is "not a required element of any offense under this section that the minor depicted actually exist." Thorn summarizes the practice: material depicting a real child, AI-modified or not, is prosecuted under the CSAM statutes, and wholly generated material under the obscenity laws, with penalties that "can differ significantly."

The ENFORCE Act would close that gap: it would make penalties consistent whichever statute is charged (pretrial detention presumption, sex offender registration, supervised release, no statute of limitations) and treat AI-generated material like authentic CSAM in proceedings. As of October 2026, the Senate bill (S. 3021) passed the Senate by unanimous consent on December 16, 2025 and has been held at the desk in the House since December 17, 2025; the House companion (H.R. 4831) was introduced August 1, 2025. It is not law.

For the reporting duty, none of this changes the operational rule: the platform reports apparent violations, and photorealistic AI-generated imagery of minors in sexually explicit conduct is apparent violation material on its face. Reviewers are not asked to decide whether a child is real; they mark the file `generativeAi` when they believe it's generated and report it. State laws add their own offenses; their inventory belongs to counsel and isn't attempted here.

**United Kingdom.** The Crime and Policing Act 2026 (dated April 29, 2026) creates an offence of making or adapting a "CSA image-generator" (a program, information or service made or adapted for creating CSA images), or possessing, supplying or offering to supply one, punishable by up to five years on indictment, with defences for crime prevention and investigation, the security services, Ofcom, and internet service providers that merely transmit, cache or host and act when aware (s. 72 for England and Wales, ss. 73 and 74 for Northern Ireland and Scotland). Section 77 creates an offence of providing, maintaining, moderating or otherwise running an internet service "with the intention of facilitating child sexual exploitation and abuse," up to ten years. As of October 2026, legislation.gov.uk shows ss. 72 and 77 as prospective (not in force at Royal Assent, awaiting commencement regulations). For a platform that offers image generation, s. 72's intent-free structure (a thing "made or adapted for" creating CSA images) is the reason to treat model safety work and abuse reporting as one program.

**European Union.** In the CSA Regulation negotiations, the co-legislators provisionally agreed in May 2026 that handbooks giving advice on how to find, groom and abuse children fall within the definition of child sexual abuse material ([The EU Derogation and the CSA Regulation](#the-eu-derogation-and-the-csa-regulation)).

**What changes in the system.** Hash lists only catch generated material that has already been confirmed and hashed, so novel generated imagery reaches people through classifiers, which is the Content Safety API's and Safer's classifiers' job. The IWF's Non-Photographic Imagery URL List covers computer-generated, drawn and animated abuse imagery. A platform that runs generation models also keeps the prompt, the model version and the output for a refused or flagged request as case evidence, reports attempts that amount to apparent violations, and feeds confirmed outputs into its own hash list so they can't be reposted. [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms) covers generation safety in general.

## The EU Derogation and the CSA Regulation

Most EU child-safety law that matters to platforms is about messaging, and it has spent 2026 in turmoil. Public posts and uploads on a hosting service are governed by the DSA and the GDPR like any other moderation ([DSA Hosting Liability](/books/user-generated-platforms/hosting-liability#dsa-hosting-liability)); the fight is over private messages.

**The interim derogation.** Since December 2020, webmail, messaging and other "number-independent interpersonal communications services" have been subject to the ePrivacy Directive's confidentiality rules, which on their face forbid scanning message content. Regulation (EU) 2021/1232 created a temporary derogation letting those services keep detecting, removing and reporting CSAM and solicitation voluntarily, under conditions: technology that's state of the art and least privacy-intrusive; text scanning limited to detecting patterns, "not able to deduce the substance of the content"; solicitation detection limited to "relevant key indicators and objectively identified risk factors such as age difference"; a prior data protection impact assessment and consultation; human oversight, and human confirmation before reporting material not previously identified; user information, complaints and redress; storage capped at 12 months; and annual reports to the data protection authority and the Commission, including error rates. It never covered audio. Regulation (EU) 2024/1307 extended it to April 3, 2026.

**The lapse and the revival.** The Commission proposed a further two-year extension on December 19, 2025 (procedure 2025/0429(COD)). Parliament voted at first reading on March 26, 2026, rejecting the extension by 228 votes to 311 as eucrim reports it, and the derogation expired. EUR-Lex marks Regulation 2021/1232 as no longer in force, with April 3, 2026 as its end of validity. The procedure then continued: the Council adopted its first-reading position on July 2, Parliament's second-reading decision followed on July 9, the Council approved the act at second reading, and the regulation was signed on July 24, 2026. **Regulation (EU) 2026/1881** was published in the Official Journal on July 28, 2026 and is in force as of October 2026. Its recitals confirm that 2021/1232 "has expired" because the co-legislators couldn't agree by April 3, 2026.

What the new regulation changes, against the old one:

- **It applies until April 3, 2028,** or until the long-term framework replaces it.
- **It excludes end-to-end encrypted communications.** It "does not apply to interpersonal communications to which end-to-end encryption is, has been or will be applied," and processing may not be applied to them.
- **New deadlines.** Providers must publish their first report under it by February 1, 2027, then by January 31 each year, in a standard form the Commission is to set by implementing act by November 1, 2026. Providers using technology before July 31, 2026 without a completed prior consultation had to start one before September 1, 2026, and have until April 1, 2027 to complete it.
- **A gap.** It entered into force on the third day after publication. Between the old regulation's expiry on April 3 and the new one's entry into force, EU messaging services had no derogation to rely on; whether and how they kept scanning in that window is a question for each provider's counsel and its data protection authority, and the politics around the revival remain contested.

**The CSA Regulation.** The long-term framework is the Commission's proposal of May 11, 2022 for a regulation to prevent and combat child sexual abuse (2022/0155(COD)), which originally included mandatory detection orders. Parliament adopted its negotiating mandate in November 2023. The Council reached its position on November 26, 2025, dropping mandatory detection orders (including for encrypted services) in favor of risk assessment and mitigation, removal and blocking orders, an EU Centre on Child Sexual Abuse with a database of verified indicators, and a permanent version of the voluntary regime. Trilogues began on December 9, 2025. Council notes report that the fourth trilogue (May 11, 2026) provisionally agreed on scope points, including the handbooks definition, and that the fifth (June 29, 2026) reached provisional agreement on "almost all the provisions" except detection: scope, risk assessment and mitigation (with compulsory mitigation for services with an identified grooming risk), removal orders aligned with the Terrorist Content Online Regulation, blocking and delisting orders, and the deletion of age verification from the text. As of October 2026, Parliament's Legislative Observatory still lists the file as awaiting Parliament's first-reading position, and no final text has been adopted.

What to build for now: if the platform offers EU messaging and scans it, it follows 2026/1881's conditions (no E2EE content, DPIA and consultation, human confirmation for novel material, user information, 12-month storage cap, annual report with error rates, the Commission's list of organizations it reports to). The CSA Regulation's risk assessment, removal orders and EU Centre reporting are worth designing toward, but not building against a text that isn't final.

## Ofcom's Measures

The UK Online Safety Act's illegal content duties have been enforceable since March 17, 2025 (the dates and the default settings for child users are in the gaming book's [The Online Safety Act](/books/gaming/player-behavior#the-online-safety-act)). For child safety, Ofcom's Illegal Content Codes of Practice for user-to-user services add two detection measures, and the Act adds a reporting duty.

**Perceptual hash matching.** The codes recommend perceptual hash matching to detect and remove image-based CSAM. As the IWF summarized the December 2024 codes when they took effect, the measure applies to large user-to-user services at medium or high risk of image-based CSAM, to services at high risk with more than 700,000 monthly UK users, and to file-storage and file-sharing services at high risk regardless of size. Ofcom's guidance to file services says it would normally expect a service to be high risk where it is a file-storage or file-sharing service that lets images or videos be generated, uploaded or shared, or where there's evidence of image-based CSAM on it to a significant extent; a provider that assesses itself lower "need[s] to record strong reasons." The measure applies only to content communicated publicly, and Ofcom's safeguards require hashes correctly identified before inclusion and removed if not CSAM, configuration to manage false positives, human review and an appeals process for wrongful takedowns.

**CSAM URL detection.** The codes also include detecting and removing content that matches listed CSAM URLs, which in practice means matching links posted on the service against a list such as the IWF's URL List.

**Enforcement so far.** Ofcom opened an enforcement program on file-sharing services as soon as the duties took effect, working with law enforcement and the IWF to identify the services at highest risk; it reports that some deployed perceptual hash matching in response and others blocked UK users. Fines and the enforcement record are in [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#the-uk-online-safety-act).

**The CSEA reporting duty.** Since April 7, 2026, regulated user-to-user services must report all detected and unreported CSEA content to the NCA through its CSEA Industry Reporting Portal, unless they report it to an equivalent foreign body. Ofcom's guidance is specific:

- **It applies regardless of size or risk level,** and doesn't require detection: "detected" means however the service became aware, including user reports, hash matching and proactive detection.
- **CSEA content means Schedule 6 offences,** covering known and unknown CSAM and grooming offences, including content that may be legal elsewhere but is a UK offence when UK-linked.
- **UK-linked** means evidence linking the content to the UK, such as where it was uploaded, the offender's nationality or location, or the location of a suspected victim.
- **No duplicates.** A service reporting all of it to NCMEC already meets the duty; one reporting only some of it must report the gap to the NCA.
- **Registration and format.** Providers register with the NCA before their first report; the regulations set report contents (reporter contact, the content, the detection method, user information and a declaration that all available information is included) and formats.
- **Three priority levels and clocks.** Level 1 (an immediate threat to a child's life or immediate risk of serious harm) is reported "immediately"; Level 2 (a risk of serious harm in the near future, or urgent safeguarding might be required) "as soon as reasonably practicable"; Level 3, everything else, "without undue delay." The NCA's requests for information get a response within 7 days.
- **Penalties.** Up to 10% of qualifying worldwide revenue or £18 million, whichever is greater, plus a criminal offence for reporting false information.

The design consequence is that the report record needs a recipient, a UK priority level and a UK-link flag, and the case workflow needs a step that decides, per detected item, whether NCMEC's report already covers it.

## Grooming and Sextortion

Imagery is half the problem. NCMEC received 1.4 million online enticement reports in 2025, more than 80,000 of them about sextortion, with financial sextortion averaging 137 reports a day; it says at least three dozen US teenage boys have died by suicide after being victimized this way. These harms happen in conversation, so detection works on behavior and text, and the response protects a child in real time rather than removing a file.

**Behavioral signals.** The signals the industry shares are public at the category level. The Tech Coalition's Lantern program lists incident-based signals such as repeated unsolicited contact with minors, attempts to move conversations off-platform, and payment requests or extortion language targeting minors. The EU derogation limits solicitation detection to "relevant key indicators and objectively identified risk factors such as age difference and the likely involvement of a child." In system terms these are features the platform already has: account age and age band, contact graph and who initiated contact, message velocity to accounts in younger age bands, links and payment handles shared in messages, and reports. They belong in a risk score that routes conversations to specialist review, not in an automatic ban; the [risk scoring](/docs/architecture/risk-scoring) machinery is the same as fraud's.

**Text classifiers.** Thorn's Safer includes a text classifier for child exploitation, grooming and sextortion, which it says processed 318.5 million lines and flagged about 1.3 million in 2025; Hive offers it as its CSE Text Classifier. Like image classifiers, these produce a score for review, and in the EU messaging context they fall under the derogation's conditions, including that text scanning must not be able to deduce the substance of the communication.

**Signal sharing.** Lantern, launched in 2023 and hosted on Meta's ThreatExchange, lets 41 participating companies (including Discord, Google, Meta, Microsoft, Reddit, Roblox, Snap, Twitch and others) share hashes, URLs and incident signals about offenders who move between platforms; payment companies can join on a receive-only basis. It reports 2,047,982 signals shared and 353,806 enforcement actions from 2023 to 2025, including 164,575 accounts. Lantern "does not facilitate automated enforcement actions": a participant reviews an incoming signal against its own policies and law before acting. That's the right rule for any shared signal, and it means a `hash_lists` row (for shared hashes) or a case created from an external signal, never a direct ban.

**Defaults are detection's partner.** Most grooming starts with contact, so the settings that limit who can contact young users do work no classifier can: Ofcom's codes include defaults that keep children off suggested-connection lists and block direct messages to them from non-connected accounts ([The Online Safety Act](/books/gaming/player-behavior#the-online-safety-act)); Discord's Teen Safety Assist alerts teens on first direct messages from someone new and blurs sensitive media by default. Age signals and teen defaults are [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#defaults-by-age).

**The response.** A grooming or sextortion case has a different shape from an imagery case:

- **Protect the child first.** Limit the suspect's ability to contact the child (and other minors) immediately; the account action happens without notice text that could tip off the suspect where counsel says not to ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)).
- **Keep the conversation.** NCMEC's advice to victims is to block the suspect without deleting the profile or messages; the platform's side is to preserve the whole conversation and the suspect's other contacts with minors under a hold.
- **Report it.** Enticement is a covered offense; the report uses the online enticement incident type and the `sextortion`, `csamSolicitation` or `minorToMinorInteraction` annotations as they apply, and goes to NCMEC or the NCA as above. A child in immediate danger is an emergency call to police, not a queue item.
- **Follow the money.** Financial sextortion runs through payment handles and gift cards; the payment signals, and the payment companies' side of Lantern, connect to [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud) and [Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews#off-platform-leakage).
- **Help the victim remove images.** Point minors and their parents to NCMEC's Take It Down (US) and the IWF's Report Remove (UK), and ingest Take It Down hashes as a list ([Hash-Based Prevention](/books/user-generated-platforms/intimate-image-abuse#hash-based-prevention)).

## Reviewing Child Safety Cases

The design goal is that people see as little of this material as the decision needs, and that every time they do, it's logged. Moderation at Scale's [Reviewer Wellbeing](/books/user-generated-platforms/moderation-at-scale#reviewer-wellbeing) covers the general tooling (grayscale, muted audio, blur, exposure limits, counseling, outsourced review); what's specific to child safety:

- **Hash-first means no-view actioning where policy allows it.** A match against a vetted list (NCMEC's triple-vetted list, the IWF's two-person-assessed list, the platform's own confirmed list) can remove content, quarantine the asset and restrict the account without anyone opening the file. Whether a person then views the file before the report is a separate decision with legal weight: the `fileViewedByEsp` field and *Wilson* mean the report must say truthfully whether anyone looked, and counsel sets the policy on when a human view is required. My default: exact matches on vetted lists are actioned without viewing, near matches above the policy threshold get a minimal confirming view, and every file's viewed state is recorded.
- **Novel material always gets a human.** Classifier hits and user reports of unknown material are confirmed by a trained reviewer before reporting, as the EU derogation requires and good practice suggests everywhere.
- **Designated reviewers only.** Child-safety cases route to a named, trained and cleared group, never to a general queue's next available reviewer; the queue is separate from the general moderation tool. Hive's dashboard, for example, never displays suspected CSAM inline in its review feed: the media opens in a separate tab only on a deliberate click.
- **The least content needed.** Blurred and grayscale by default, audio muted, the minimum frames from a video, metadata and context before pixels. IFTAS's post-mortem asks for exactly these in moderation dashboards.
- **Restricted evidence.** The evidence store is separate from production storage, access is limited to the designated group and counsel, every view, export and hold change is written to an access log with a reason, and nothing can be downloaded or forwarded through ordinary tools ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)). Exports go only to the report or to law enforcement through legal process.
- **Err toward enforcement, review on appeal.** Twitch's published approach for youth safety is to enforce on edge cases and do a deeper review on appeal. A wrongful restriction is recoverable; a missed grooming case may not be.

## How to Build It

The chapter's additions to the core model: the hash lists and matches every harm shares, the report to NCMEC or the NCA with its items, and the evidence access log. Preservation reuses [`legal_holds`](/books/user-generated-platforms/accounts-and-identity#how-to-build-it); cases, decisions and penalties are the playbook's tables as the core model extends them.

```sql
CREATE TABLE hash_lists (                -- one list, from one source, under one agreement
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  source               TEXT NOT NULL CHECK (source IN ('ncmec_ngo', 'ncmec_industry', 'iwf',
                         'gifct', 'stopncii', 'take_it_down', 'vendor', 'platform')),
  name                 TEXT NOT NULL,          -- 'IWF Image Hash List', 'Safer', 'own confirmed'
  harm_category        TEXT NOT NULL,          -- the policy enum: 'child_safety', 'violent_extremism', ...
  kind                 TEXT NOT NULL CHECK (kind IN ('image', 'video', 'url')),
  algorithm            TEXT NOT NULL,          -- 'photodna', 'pdq', 'tmk_pdqf', 'md5', 'sha256',
                                               -- 'vendor', 'url_exact', 'url_domain'
  version              TEXT NOT NULL,          -- provider's release or sync token in use now
  synced_at            TIMESTAMPTZ,
  sync_interval        INTERVAL,               -- e.g. 24 hours for the IWF URL List
  held_locally         BOOLEAN NOT NULL,       -- false: matched through the provider's API
  max_distance         INT,                    -- perceptual threshold; null for exact lists
  default_action       TEXT NOT NULL CHECK (default_action IN ('block_and_report',
                         'block_and_review', 'review_only', 'label_only')),
  access_agreement_ref TEXT,                   -- licence, membership or sharing agreement
  agreement_expires_at TIMESTAMPTZ,
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (source, name, kind, algorithm)
);

CREATE TABLE hash_list_entries (         -- entries the platform holds, including its own
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  hash_list_id        UUID NOT NULL REFERENCES hash_lists (id),
  hash                BYTEA,                   -- null for URL lists
  url                 TEXT,                    -- normalized; null for hash lists
  external_ref        TEXT,                    -- the provider's id for the entry
  labels              TEXT[] NOT NULL DEFAULT '{}',  -- provider categories, kept as given
  confirmed_by_decision_id UUID REFERENCES moderation_decisions (id), -- own entries only
  added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at          TIMESTAMPTZ,             -- provider withdrew it, or ours was wrong
  removal_reason      TEXT,
  CHECK ((hash IS NULL) <> (url IS NULL))
);

CREATE TABLE hash_matches (              -- every hit, against which list and version
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  media_asset_id  UUID REFERENCES media_assets (id),
  content_item_id UUID REFERENCES content_items (id),  -- for URL matches in posts and messages
  url             TEXT,                    -- the matched link, for URL lists
  hash_list_id    UUID NOT NULL REFERENCES hash_lists (id),
  list_version    TEXT NOT NULL,           -- as of the match, not as of today
  entry_id        UUID REFERENCES hash_list_entries (id),  -- null when matched by API
  algorithm       TEXT NOT NULL,
  distance        INT NOT NULL DEFAULT 0,  -- 0 for exact; below max_distance for perceptual
  labels          TEXT[] NOT NULL DEFAULT '{}',
  disposition     TEXT NOT NULL DEFAULT 'pending' CHECK (disposition IN ('pending',
                    'confirmed', 'false_positive', 'entry_withdrawn')),
  case_id         UUID REFERENCES moderation_cases (id),
  matched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (media_asset_id IS NOT NULL OR url IS NOT NULL)
);

CREATE TABLE cybertipline_reports (      -- one report to a child-safety recipient
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id              UUID NOT NULL REFERENCES moderation_cases (id),
  recipient            TEXT NOT NULL CHECK (recipient IN ('ncmec_cybertipline',
                         'uk_nca_csea_irp', 'other_hotline')),
  incident_type        TEXT NOT NULL CHECK (incident_type IN ('child_pornography',
                         'child_sex_trafficking', 'child_sex_tourism',
                         'child_sexual_molestation', 'misleading_domain_name',
                         'misleading_words_or_images', 'online_enticement',
                         'unsolicited_obscene_material_to_child')),
  subject_account_id   UUID REFERENCES accounts (id),
  report_annotations   TEXT[] NOT NULL DEFAULT '{}',  -- 'sextortion', 'csam_solicitation', ...
  escalate_high_priority BOOLEAN NOT NULL DEFAULT FALSE,
  uk_priority_level    SMALLINT CHECK (uk_priority_level BETWEEN 1 AND 3),
  uk_linked            BOOLEAN,            -- why an NCA report is owed, or isn't
  batched_reason       TEXT,               -- the recipient's bundling reason, when bundled
  grouping_rule_version TEXT NOT NULL,     -- the bundling and grouping policy applied
  knowledge_at         TIMESTAMPTZ NOT NULL,  -- when the platform obtained actual knowledge
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted',
                         'finished', 'retracted', 'failed')),
  external_report_id   TEXT,               -- the recipient's report id
  submitted_at         TIMESTAMPTZ,
  finished_at          TIMESTAMPTZ,        -- the preservation clock starts here
  prepared_by          UUID NOT NULL,      -- the designated reviewer
  CHECK (recipient <> 'uk_nca_csea_irp' OR uk_priority_level IS NOT NULL),
  CHECK ((status = 'finished') = (finished_at IS NOT NULL))
);

CREATE TABLE cybertipline_report_items (  -- each file or message in a report
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  report_id           UUID NOT NULL REFERENCES cybertipline_reports (id),
  media_asset_id      UUID REFERENCES media_assets (id),
  content_revision_id UUID REFERENCES content_revisions (id),  -- the text, as judged
  hash_match_id       UUID REFERENCES hash_matches (id),        -- how it was found
  relevance           TEXT NOT NULL CHECK (relevance IN ('reported', 'supplemental')),
  file_viewed_by_provider BOOLEAN NOT NULL,  -- truthfully: did a person here view it
  exif_viewed_by_provider BOOLEAN NOT NULL DEFAULT FALSE,
  publicly_available  BOOLEAN NOT NULL,
  file_annotations    TEXT[] NOT NULL DEFAULT '{}',  -- 'generative_ai', 'viral', ...
  industry_classification TEXT CHECK (industry_classification IN ('A1', 'A2', 'B1', 'B2')),
  original_md5        BYTEA,               -- of the original file as uploaded
  external_file_id    TEXT,                -- the recipient's file id
  uploaded_at         TIMESTAMPTZ,         -- to the recipient
  CHECK (media_asset_id IS NOT NULL OR content_revision_id IS NOT NULL),
  CHECK (file_viewed_by_provider OR NOT exif_viewed_by_provider)
);

CREATE TABLE evidence_access_log (       -- append-only: every touch of child-safety evidence
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id        UUID NOT NULL REFERENCES moderation_cases (id),
  media_asset_id UUID REFERENCES media_assets (id),
  actor_id       UUID NOT NULL,            -- staff identity, never a shared account
  action         TEXT NOT NULL CHECK (action IN ('view_metadata', 'view_blurred', 'view_full',
                   'export_to_report', 'export_to_legal_process', 'hold_created',
                   'hold_extended', 'hold_released', 'purge')),
  reason         TEXT NOT NULL,
  review_assignment_id UUID,               -- Moderation at Scale's review_assignments
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Preservation: a finished report holds everything attached to it for one year,
-- in the accounts chapter's legal_holds (hold per record, never shown to the user).
INSERT INTO legal_holds (account_id, subject_type, subject_id, reason, source_ref,
                         notify_user, valid_during)
SELECT r.subject_account_id, 'media_asset', i.media_asset_id, 'cybertipline_preservation',
       r.id::TEXT, FALSE, tstzrange(r.finished_at, r.finished_at + INTERVAL '1 year')
FROM cybertipline_reports r
JOIN cybertipline_report_items i ON i.report_id = r.id
WHERE r.id = $1 AND i.media_asset_id IS NOT NULL;
```

Notes on the sketch:

- **One matching service for every harm.** `hash_lists.source` covers the child-safety lists here and the GIFCT, StopNCII and Take It Down lists the sibling chapters use; `harm_category` decides which queue a match opens a case in. Lists matched through a provider's API (PhotoDNA Cloud, CSAI Match, Safer's hosted API) have `held_locally = false` and no entries, but every match still records the list and its version.
- **The threshold is a column, versioned with the list.** `max_distance` is a policy choice per list and algorithm; changing it is a recorded change with an owner, never a code edit. Matches keep their own `distance`, so a tightened threshold can be replayed against history.
- **A match opens a case; a confirmed case files a report.** `hash_matches.case_id` links to a `moderation_cases` row with category `child_safety` and source `proactive`; the confirming `moderation_decisions` row removes content, quarantines the asset and applies the zero-tolerance penalty. The report is assembled from the case, and its `knowledge_at` is the earliest moment the platform had actual knowledge (the confirming decision, or a human view of a match), which is what "as soon as reasonably possible" is measured from.
- **The report table is the recipient's schema, normalized.** Incident types, annotations, viewed flags, bundling and industry classification mirror the CyberTipline API; `uk_priority_level` and `uk_linked` carry the NCA's rules. The table keeps the platform's name `cybertipline_reports` for both recipients because the shape is the same; an `other_hotline` row carries the recipient in `external_report_id`'s system.
- **The submission is a job, not a request.** Submit, upload each file, send file details, then finish, with retries and a dead-letter queue ([Background Jobs](/docs/architecture/background-jobs)). An unfinished report expires on NCMEC's side, so the job alerts if a report sits in `submitted` past an hour without progress.
- **Own entries come only from confirmed decisions.** `confirmed_by_decision_id` is required in practice for `source = 'platform'`; contributions to shared lists are exported from these entries under the program's agreement.
- **Withdrawals propagate.** When a provider removes an entry, matches against it move to `entry_withdrawn` and their cases reopen for review.
- **Evidence is never in the live store.** The original file moves to the restricted evidence store with its own encryption and access policy (NIST CSF aligned, per § 2258A(h)(6)); `evidence_access_log` is append-only and reviewed.
- **Events:** `hash.matched`, `hash_list.synced`, `hash_list.entry_withdrawn`, `cybertip.submitted`, `cybertip.finished`, `cybertip.failed` and `evidence.hold_extended` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the moderation queue, the hold manager, alerting and transparency counts. None carries file content or hashes of it beyond the match id.

## Auditing

- **Every match,** with list, list version, algorithm, distance, labels and disposition, so a regulator, a court or the list provider can see why content was blocked, and a withdrawn hash can be traced to every block it caused.
- **Every report,** with the knowledge time, submission and finish times, recipient, incident type, annotations, items and their viewed flags, and the grouping rule version, so "as soon as reasonably possible" is a measurable interval and the transparency report's NCMEC count is a query.
- **Every hold,** created at finish, extended voluntarily with a reason, released at the end of the period, and the purge that followed.
- **Every touch of evidence,** by named staff, with a reason, reviewed for access outside assigned cases.
- **Every list's agreement and sync,** with expiry dates and the last successful sync, so a stale or unlicensed list is visible before it's a finding.
- **The annual numbers regulators ask for:** under the EU derogation, cases by type, complaints and outcomes, false positive rates per technology and the organizations reported to; under the OSA, the risk assessment's record of why the service is or isn't high risk of image-based CSAM. [Transparency Reporting](/books/user-generated-platforms/transparency-reporting) covers publishing them.

## What This Means for the System You Build

- **Treat knowledge as the trigger and the clock.** Record when the platform first knew, and measure the time to a finished report from that moment.
- **Match before anything is visible,** with exact hashes for free and perceptual hashes on the upload path, and quarantine on a hit.
- **Subscribe to more than one list,** record which list and version matched, refresh on the provider's cadence and honor withdrawals.
- **Set thresholds as policy,** per list, with an owner and a change record; never publish or log how matching works internally.
- **Let classifiers rank and people decide;** never auto-report novel material.
- **Build the CyberTipline integration before the first report,** in NCMEC's test environment, with the report as a job and every field the API takes kept in your own records.
- **Report per incident with a written grouping rule,** and use bundling where NCMEC has enabled it.
- **Keep what makes a report actionable:** upload and login IPs with zones, verified contacts, the conversation around a file.
- **Preserve for a year from the finished report** through legal holds that every deletion and purge path respects, and keep evidence out of the live store.
- **Record truthfully whether anyone viewed each file,** and let counsel set when a human view is required.
- **Report UK-linked content to the NCA** unless NCMEC already has it, with the UK priority levels and their clocks.
- **Scan EU messages only under 2026/1881's conditions,** never end-to-end encrypted content, and track the CSA Regulation without building to a draft.
- **Treat grooming and sextortion as conversations to interrupt:** restrict contact first, preserve the thread, report enticement, and point victims to Take It Down and Report Remove.
- **Route child-safety cases to designated reviewers** with blurred, minimal, logged access, and action exact matches on vetted lists without viewing.

## References

**Statutes and regulations**

- [18 U.S.C. § 2258A](https://www.law.cornell.edu/uscode/text/18/2258A), the reporting duty, covered offenses, report contents, NCMEC forwarding, fines, no duty to scan, one-year preservation, voluntary extension and NIST CSF
- [Public Law 118-59 (REPORT Act)](https://www.congress.gov/118/plaws/publ59/PLAW-118publ59.htm), approval date, vendor and victim liability protections in § 2258B(d) and (e), preservation and fine changes, added offenses, NCMEC guidelines
- [18 U.S.C. § 2256](https://www.law.cornell.edu/uscode/text/18/2256), the definition of child pornography including computer-generated and modified images, and "indistinguishable"
- [18 U.S.C. § 1466A](https://www.law.cornell.edu/uscode/text/18/1466A), obscene visual representations of the sexual abuse of children, any kind of depiction, the minor need not exist
- [Congress.gov: S. 3021, ENFORCE Act, all actions](https://www.congress.gov/bill/119th-congress/senate-bill/3021/all-actions), introduction, Senate passage by unanimous consent and House status
- [Crime and Policing Act 2026, contents](https://www.legislation.gov.uk/ukpga/2026/20/contents), Part 5 child sexual abuse sections and the Act's date
- [Crime and Policing Act 2026, section 72](https://www.legislation.gov.uk/ukpga/2026/20/section/72), the CSA image-generator offence, penalties, defences and prospective status
- [Crime and Policing Act 2026, section 77](https://www.legislation.gov.uk/ukpga/2026/20/section/77), online facilitation of child sexual exploitation and abuse, penalties and prospective status
- [Crime and Policing Act 2026, section 255](https://www.legislation.gov.uk/ukpga/2026/20/section/255), commencement
- [Online Safety (CSEA Content Reporting by Regulated User-to-User Service Providers) Regulations 2026](https://www.legislation.gov.uk/uksi/2026/268/made), commencement on 7 April 2026, registration, priority levels and clocks, retention periods, report contents
- [Regulation (EU) 2021/1232](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32021R1232), the interim derogation's conditions, extension by 2024/1307 and end of validity on 3 April 2026
- [Regulation (EU) 2026/1881](https://eur-lex.europa.eu/eli/reg/2026/1881/oj/eng), the revived derogation: expiry of 2021/1232, end-to-end encryption exclusion, deadlines and application until 3 April 2028

**Regulators, legislatures and courts**

- [European Parliament Legislative Observatory: 2025/0429(COD)](https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2025/0429(COD)), the extension procedure's key events through publication of Regulation 2026/1881
- [European Parliament Legislative Observatory: 2022/0155(COD)](https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2022/0155(COD)), the CSA Regulation's procedure and current stage
- [Council of the EU: outcome of the trilogue on 11 May 2026 (ST 9139/26)](https://data.consilium.europa.eu/doc/document/ST-9139-2026-INIT/en/pdf), provisional agreement on handbooks and scope
- [Council of the EU: outcome of the trilogue on 29 June 2026 (ST 11501/26)](https://data.consilium.europa.eu/doc/document/ST-11501-2026-INIT/en/pdf), provisional agreement on all but detection, age verification removed
- [eucrim: CSA Regulation, Council position reached](https://eucrim.eu/news/csa-regulation-council-position-reached/), the Council's November 2025 position, trilogue start and the March 2026 extension vote
- [Ofcom: File-storage and file-sharing, the online safety risks, the rules and how to comply](https://www.ofcom.org.uk/online-safety/protecting-children/file-sharing-and-file-storage-know-the-online-safety-risks-the-rules-and-how-to-comply), perceptual versus cryptographic hashing, high-risk presumptions, public content only, safeguards
- [Ofcom: Duty to report CSEA content](https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/duty-to-report-child-sexual-exploitation-and-abuse-csea-content-know-the-rules-and-how-to-comply), scope, detected and unreported content, UK link, no duplicate reports, penalties
- [Ofcom: Ofcom and IWF reinforce partnership](https://www.ofcom.org.uk/online-safety/protecting-children/ofcom-and-iwf-reinforce-partnership-in-fight-against-online-child-sexual-abuse), the November 2025 memorandum, CAID access, file-sharing enforcement outcomes
- [EFF: US v. Wilson, Ninth Circuit reaffirms Fourth Amendment protection](https://www.eff.org/deeplinks/2021/09/us-v-wilson-ninth-circuit-reaffirms-fourth-amendment-protection-electronic), the holding on unviewed hash-matched files

**NCMEC, hotlines and programs**

- [NCMEC: CyberTipline data](https://www.missingkids.org/cybertiplinedata), 2025 volumes, referral and informational reports, international share, generative AI figures, removal notices and hash sharing
- [NCMEC: 2024 in numbers](https://www.missingkids.org/blog/2025/ncmec-releases-new-data-2024-in-numbers), bundling and the 2024 decline
- [NCMEC: CyberTipline Reporting API documentation](https://report.cybertip.org/ispws/documentation/), the submission workflow, report and file schema, incident types, annotations, bundling and the test environment
- [NCMEC: Sextortion](https://www.missingkids.org/theissues/sextortion), definitions and advice to victims
- [Google: Hash matching to help NCMEC](https://safety.google/stories/hash-matching-to-help-ncmec/), the NGO hash list, industry hash sharing and Google's contribution
- [IWF: About us](https://www.iwf.org.uk/about-us/), charity status, anonymous reporting, Reporting Portals, funding
- [IWF: Our services](https://www.iwf.org.uk/our-technology/our-services/), the list of member services
- [IWF: Image Hash List](https://www.iwf.org.uk/our-technology/our-services/image-hash-list/), hash types, two-person assessment, metadata, delivery and licensing
- [IWF: URL List](https://www.iwf.org.uk/our-technology/our-services/url-list/), update cadence, 2025 volumes, users, refresh and blocking rules
- [IWF: All-time hash data, 2025](https://www.iwf.org.uk/annual-data-insights-report-2025/hashing-insights/all-time-hash-data/), list size and 2025 additions
- [IWF: Annual Data and Insights Report 2025, executive summary](https://www.iwf.org.uk/annual-data-insights-report-2025/executive-summary/), reports assessed and confirmed, AI-generated videos, Report Remove, UK hosting
- [IWF: Online Safety Act duties take effect](https://iwf.org.uk/news-media/news/online-safety-act-uk-tech-companies-must-now-tackle-illegal-harms-including-child-sexual-abuse-imagery/), who the CSAM hash matching and URL measures apply to
- [INHOPE: Our story](https://www.inhope.org/EN/our-story), member hotlines, ICCAM and the IWF's founding membership
- [Tech Coalition: Lantern](https://www.technologycoalition.org/lantern), signal types, participants, safeguards and 2023 to 2025 figures
- [Thorn: The ENFORCE Act](https://www.thorn.org/blog/the-enforce-act-addressing-ai-generated-csam-offenses/), how AI-generated CSAM is prosecuted today and what the bill would change

**Vendors and tools**

- [Microsoft: PhotoDNA](https://www.microsoft.com/en-us/photodna), image hashing, non-reversible hashes, cloud service and access
- [Meta: Open-sourcing photo and video matching technology](https://about.fb.com/news/2019/08/open-source-photo-video-matching/), PDQ and TMK+PDQF
- [Google: Child safety toolkit for partners](https://protectingchildren.google/tools-for-partners/), CSAI Match and the Content Safety API, placement and human review
- [Safer by Thorn](https://safer.io/), detection categories and deployment options
- [Thorn: Safer impact report](https://www.thorn.org/blog/safer-impact-report-2026/), 2025 volumes, hash database sizes and text classifier figures
- [Hive: CSAM Detection API](https://thehive.ai/apis/csam-detection), Safer-based detection, text classifier and reporting tool, the Deploy rebrand
- [Hive: NCMEC integration in Moderation Dashboard](https://thehive.ai/blog/streamline-csam-reports-with-moderation-dashboards-ncmec-integration), review feed that never shows suspected CSAM inline, report workflow
- [Cloudflare: CSAM Scanning Tool](https://developers.cloudflare.com/cache/reference/csam-scanning/), matching cached content, blocks, daily notices, review requests and the owner's reporting duty
- [Cloudflare: The CSAM Scanning Tool](https://blog.cloudflare.com/the-csam-scanning-tool/), fuzzy hashing as distance, thresholds as a policy choice, undisclosed internals, launch

**Platforms**

- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), hash matching with Safer, diverted content and NCMEC reports
- [Twitch: H2 2025 Transparency Report](https://safety.twitch.tv/s/article/H2-2025-Transparency-Report?language=en_US), machine detection on live content, youth safety enforcement and NCMEC report counts
- [Discord: Upholding our commitment to safety](https://discord.com/safety/upholding-our-commitment-to-safety-2023-beyond), IWF services, Lantern, Teen Safety Assist and AI-generated CSAM policy
- [IFTAS: Content Classification System post-mortem](https://about.iftas.org/2025/03/27/content-classification-system-post-mortem/), the fediverse hash-matching pilot's volumes, match rate, reports and lessons
- [IFTAS: IWF offers the fediverse a way to block CSAM](https://about.iftas.org/2025/07/29/iwf-offers-fediverse-a-way-to-block-csam), Image Intercept for small platforms
