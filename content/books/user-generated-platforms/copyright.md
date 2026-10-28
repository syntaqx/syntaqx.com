+++
title = "Copyright at Scale"
description = "The DMCA agent, notices, counter-notices and repeat infringers; fingerprinting and Content ID; music in live streams; and the EU Article 17 regime."
category = "User-Generated Platforms Industry"
order = 1846
part = "Trust and Safety"
tags = ["trust-and-safety", "copyright", "dmca", "content-id", "music-licensing", "article-17"]
+++

Copyright is the trust and safety problem with the most volume, the most paperwork and the most money attached. YouTube's 2024 copyright report counted more than 2.2 billion Content ID claims in a year; Reddit received 69,154 DMCA notices naming 425,471 items in six months; Twitch went from fewer than 50 music notices a year to thousands a week in 2020. Unlike most harms in this part, the complainant is usually a business with lawyers and automation, the uploader often thinks the use is fine, and the platform's job is less to judge than to run a statutory process precisely: receive, validate, remove, forward, restore, count, terminate. Get the process wrong and the safe harbor goes with it.

Two systems sit on top of each other. The **legal** system is notice and takedown: the US DMCA's § 512 and its equivalents, a designated agent, notices with required elements, counter-notices on a fixed schedule, and a repeat-infringer policy. The **commercial** system is fingerprinting: rights holders give the platform reference files, the platform matches uploads against them, and the rights holder chooses per territory whether to block, monetize or just track each match, with disputes handled by the platform's own rules rather than the statute. In the EU a third layer, Article 17 of the DSM Directive, makes large content-sharing services directly liable for uploads unless they license or filter with safeguards. This chapter covers the agent, notices, counter-notices, repeat infringers, fingerprinting and Content ID, music in live streams, Article 17, and the tables behind them. The hosting liability structure (why § 512 exists beside Section 230, and Cox v. Sony's holding) is in [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#dmca-safe-harbors); the web host's version is in [DMCA for Hosts](/books/user-generated-platforms/abuse-desks#dmca-for-hosts). None of this is legal advice.

## How the Platforms Do It

Every platform here runs DMCA notice and takedown; the differences are in strike rules, how much matching they do before a notice arrives, and what they publish. As of October 2026:

| Platform | Notices and counter-notices | Repeat infringers | Matching and licensing |
| --- | --- | --- | --- |
| **Discord** | Form, email or post; restores "10 to 14 business days or more" after a valid counter-notice; rejects defective counter-notices and asks for a corrected one | "It's our policy to terminate account holders who we determine to be repeat copyright infringers" | None published |
| **Imgur** | Agent by email or post; asks for a registration number or application and reserves the right to ignore notices on unregistered works | Not stated in the notice section | None published |
| **Kick** | Notice and counter-notice by email, with consent to US federal jurisdiction | Suspends or terminates repeat infringers; may act on blatant infringement without repeats | None published |
| **Pinterest** | Form or agent; reinstates after a valid counter-notice unless the reporter shows a court or Copyright Claims Board action, which "can take up to 14 business days" | Strikes toward a repeat-infringer policy; strikes can be appealed without a counter-notice | Removes "identical copies" of a reported image on request; a Content Claiming Portal lets exclusive owners upload originals and choose what happens to existing and future matches |
| **Reddit** | 69,154 notices in H2 2025 (+17%), 71% actioned in whole or part, 51% of named items removed, 28% of notices rejected as invalid, including fair-use declines | 1,595 accounts and 563 subreddits banned for repeat violations in H2 2025 | None published |
| **Tumblr** | Notice form and agent; counter-notice by URL | Terminates repeat infringers "under appropriate circumstances" and may terminate for "actual or apparent" infringement | None published |
| **Twitch** | Online form or designated agent; disputed notices generally don't count as strikes until resolved | Terminated at three strikes; strikes "are not permanent" | Audible Magic audio recognition on VODs since 2014; a separate Music Reporting Process with participating labels; the DJ Program licenses label catalogs for live DJ sets |
| **YouTube** | Webform removal requests; in 2024, 308,556 users filed just over 3 million webform claims | Each removal is a copyright strike; three strikes in 90 days subjects the channel and linked channels to termination; a strike expires after 90 days with Copyright School; a scheduled request gives seven days to remove the video first | Content ID: rights holders with exclusive rights to a substantial, frequently uploaded body of material provide references; 99.43% of copyright actions in 2024 came through it |

The fingerprinting vendors sit behind several of these. **Audible Magic** sells automated content identification and lists Twitch, SoundCloud, Dailymotion and major labels among its partners (its catalog figures of 100 million songs are its own marketing). **Pex**, which marketed music and video identification against a registry it describes as more than 120 million recordings, was acquired by Vobile in April 2025 and now sells as Vobile's music team. YouTube's Content ID and Pinterest's Content Claiming Portal are built in-house. The [T&S vendor table](/books/user-generated-platforms/platform-landscape#trust-and-safety) covers the safety-side vendors; copyright matching is a separate market with its own suppliers.

## The DMCA Agent

The 512(c) safe harbor applies only if the platform has designated an agent to receive notices, published the agent's details on its service, and filed them with the Copyright Office (512(c)(2)). The rules for the filing are in 37 CFR 201.38:

- **What's filed.** The service provider's full legal name and physical street address (a post office box only with a waiver for safety reasons); alternate names the public might search for, including trade names, website addresses and app names; and the agent's name, organization, mailing address, phone and email. Separate legal entities aren't alternate names: each affiliate that operates a service files its own designation.
- **One agent per provider,** which can be a person, a position (a compliance manager), a department, or a third-party service.
- **Published and current.** The same information must be available through the service, including in a publicly accessible area of the website, and amended when it changes.
- **Electronic only.** Designations are filed through the Copyright Office's online system and appear in its public directory; paper filings aren't accepted, and old paper designations expired if not refiled by 31 December 2017.
- **Three-year expiry.** A designation "expires three years after registration" unless amended or resubmitted, and either action starts a new three-year period (201.38(c)(4)).
- **Fee.** $6 to designate, amend or resubmit (37 CFR 201.3).

The failure mode is mundane: a designation filed at launch, a rebrand or reorganization that changes the legal entity or the domains, and an expiry nobody watched. The safe harbor is conditioned on the designation, so a lapsed one is a lapsed defense for notices that arrive meanwhile. My rule: treat the designation as a record with an expiry date and an owner, check it against the live terms page and every domain and app the entity operates, and renew on any change or at least a quarter before expiry. [How to Build It](#how-to-build-it) has the table.

## Notices

A notice of claimed infringement under 512(c)(3)(A) is a written communication to the designated agent that includes:

1. A physical or electronic signature of a person authorized to act for the owner.
2. Identification of the copyrighted work, or a representative list if many works at one site are covered.
3. Identification of the infringing material and information "reasonably sufficient" to locate it.
4. Contact information for the complaining party.
5. A statement of good-faith belief that the use isn't authorized by the owner, its agent or the law.
6. A statement that the notice is accurate and, under penalty of perjury, that the complainant is authorized to act.

**Substantial compliance decides knowledge.** A notice that doesn't substantially comply can't be used to show the platform had actual knowledge or red-flag awareness (512(c)(3)(B)(i)). But if it substantially complies with elements 2, 3 and 4 (the work, the material, the contact), that protection holds only if the platform "promptly attempts to contact" the complainant or takes other reasonable steps to get a compliant notice (512(c)(3)(B)(ii)). So validation has three outcomes, not two: valid (act), deficient but curable (contact the sender, and record that you did), and invalid (decline). The statute's list doesn't include copyright registration; some platforms ask for it anyway, as Imgur's terms do, and that is a platform policy layered on the statute, not a statutory element.

**What gets declined.** Reddit's H2 2025 report lists the reasons it rejected 19,525 notices (28%) and took no action on 101,538 items: missing required elements, complaints that are really about privacy or harassment, and requests targeting uses allowed by copyright law such as commentary, education or parody. It gives two fair-use declines from the period: an AI animation of a religious leader's photo used for criticism, and a screenshot of an app's source code posted to show that it shared user data. Misfiled privacy and harassment complaints aren't ignored; they go to the queue where they belong.

**Fair use and 512(f).** Anyone who "knowingly materially misrepresents" that material is infringing is liable for the damages, costs and attorneys' fees that result (512(f)). In *Lenz v. Universal Music* (9th Cir. 2015, amended 2016), the court held that the statute "requires copyright holders to consider fair use before sending a takedown notification", judged by the sender's subjective good faith; the March 2016 amended opinion dropped earlier language suggesting the consideration need not be "searching or intensive" and that a computer program could perform it, which leaves automated notice senders with an open question. The obligation is the sender's, not the platform's; a platform that removes on a facially valid notice keeps its safe harbor and its 512(g)(1) protection for good-faith removal. Platforms that decline obvious fair use, as Reddit reports doing, are making a choice the statute allows, and should record the reasoning on the notice.

**Acting on a valid notice.** Remove or disable access "expeditiously" (no statutory hours; set an internal target and measure it), notify the uploader promptly (512(g)(2)(A) makes that a condition of the platform's protection against the uploader's claims), and tell the uploader how to counter-notify. Most platforms forward a copy of the notice; Pinterest says the copy includes the reporter's name and contact information. Removal is per item and per revision: the notice names locations, which resolve to items and to the version that was live ([How to Build It](/books/user-generated-platforms/hosting-liability#how-to-build-it) in The Law of Hosting User Content).

**Identical copies.** A notice names specific locations; the platform isn't obliged to find others (512(m)). Some platforms offer more on request: Pinterest will remove "all Pins that contain the image" but only identical copies, so resized or altered versions may survive. Exact-hash removal of identical files is cheap and precise; perceptual matching finds altered copies and also finds lawful ones, which is why it belongs in a fingerprinting system with a dispute path rather than in a statutory takedown.

### Subpoenas to Identify Infringers

Section 512(h) lets a copyright owner obtain a subpoena from a federal district court clerk ordering the platform to identify an alleged infringer. The request must include a copy of the notice, the proposed subpoena and a sworn declaration that the information will be used only to protect rights under Title 17; the clerk issues it if it's in proper form, without a judge's review, and the platform must "expeditiously disclose" information sufficient to identify the infringer "to the extent such information is available". Platforms do push back on breadth: Discord resisted a 2024 Nexon subpoena after disclosing basic subscriber information for 64 user IDs under an earlier compromise, objecting that the demands were overly burdensome and that it respects users' anonymity, and in October 2024 Nexon moved to compel in the Northern District of Texas. Handle 512(h) subpoenas in the same legal-request pipeline as other subpoenas (scope check, user notice where allowed, minimal disclosure), which [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework) covers.

## Counter-Notices

A user whose material was removed can file a counter-notice with the designated agent (512(g)(3)) containing:

- A physical or electronic signature.
- Identification of the material removed and where it appeared before removal.
- A statement under penalty of perjury of good-faith belief that it was removed "as a result of mistake or misidentification".
- The user's name, address and phone number, consent to the jurisdiction of the federal district court for their address (or, outside the US, any judicial district where the provider may be found), and agreement to accept service of process from the complainant.

On a valid counter-notice the platform must promptly forward a copy to the original complainant, tell it the material will be restored in 10 business days, and restore it "not less than 10, nor more than 14, business days following receipt of the counter notice", unless the agent first receives notice that the complainant has filed an action seeking a court order against the user (512(g)(2)(B) and (C)). Doing that keeps the platform protected both against the user (for the removal) and against the claimant (for the restoration, 512(g)(4)).

![A dimensional drawing of one counter-notice on a business-day timeline. In the material lane, the material is removed on a takedown with its media kept, through day 0 (T0, receipt of a valid counter-notice) and on to day 10; the restore window from day 10 to day 14 is accented as W1, and the material is up after it. Dimensions R1 and R2 run from T0 to the earliest restore at 10 business days and the latest at 14. In the claimant lane, a copy is forwarded at T0, saying the material will be restored in 10 business days. A dashed court action lane from T0 to day 14 shows that the claimant's notice of suit stops the restore. Notes say business days need a holiday calendar and a time zone, and a variable table gives T0, R1, R2 and W1.](/diagrams/ugp-copyright-counter-notice.svg "Under 17 U.S.C. 512(g), restoration is a window, not a date: not before 10 business days after a valid counter-notice and not after 14, unless the claimant reports a court action first. Store both edges, and keep the media so there is something to restore.")

How platforms implement it varies at the edges:

- **Discord** restores "10 to 14 business days or more" after receipt, at its discretion, and returns defective counter-notices with the missing elements listed.
- **Pinterest** treats a Copyright Claims Board action like a court action for stopping reinstatement, and says the process "can take up to 14 business days".
- **Twitch** generally doesn't count a disputed notice as a strike until the parties resolve it, and warns that some material can't be reinstated "due to factors such as the passage of time or the format in which the material was broadcast or stored", which is a reminder that restoration needs the removed content kept, not purged.
- **YouTube** lets a user resolve a strike by counter-notification, by retraction from the claimant, or by Copyright School and 90 days.
- **Reddit** received 430 appeals including counter-notices in H2 2025; 34 were valid and restored 116 items, and five withdrawals restored five more.

Three design rules come from the statute. **The window is business days,** so it needs a holiday calendar and a time zone, stored with the computed earliest and latest restore moments (the clock rule in [Legal Clocks](/books/user-generated-platforms/hosting-liability#legal-clocks)). **Restoration needs the content,** so removal for a notice is a state change with the media kept, not a purge, until the window and any suit are resolved ([Data Retention & Deletion](/docs/architecture/data-retention#retention-windows)). **The counter-notice is a notice,** with its own validity check and clock, linked to the takedown it answers.

## Repeat Infringers

Every § 512 safe harbor is conditioned on a policy, adopted, "reasonably implemented" and communicated to subscribers and account holders, that "provides for the termination in appropriate circumstances" of repeat infringers (512(i)(1)(A)), and on accommodating "standard technical measures", meaning identification and protection measures developed by a broad multi-industry consensus, available on reasonable and nondiscriminatory terms, and not imposing substantial costs (512(i)(1)(B), (i)(2)). The statute doesn't define "repeat infringer" or "appropriate circumstances"; platforms define them in their policies and the policy has to work in practice.

The published policies converge on strikes with expiry:

| Platform | Strike rule |
| --- | --- |
| Discord, Tumblr, Kick | Termination of repeat infringers, with no published count |
| Pinterest | Removals count as strikes; too many can remove the ability to save Pins or disable the account; strikes can be appealed |
| Reddit | Account bans "in appropriate circumstances"; subreddits banned after multiple removals or when "dedicated to sharing violative content" |
| Twitch | Three strikes is a repeat infringer; a strike accrues on a complete notice with no complete counter-notice or retraction; strikes last only as long as needed to judge repeat infringement |
| YouTube | One strike per valid removal (at most one per video); three strikes in 90 days subjects the channel and its linked channels to termination; a strike expires after 90 days with Copyright School; a live stream removed for copyright also restricts live streaming for seven days, 14 on a second strike |

**User and community level.** Community platforms have a second unit to count. Reddit bans subreddits for repeat infringement as well as accounts (563 subreddits and 1,595 accounts in H2 2025, which the report puts at 25% fewer subreddits and 90% more accounts than the half before). A community that exists to share infringing material is the infringing activity; banning its members one by one misses the point. Count strikes against both the uploader and the community where the material was posted, with a separate threshold for communities that weighs the share of its content removed, not just the count.

**What Cox v. Sony changed.** On 25 March 2026 the Supreme Court held that a provider is contributorily liable only if it induced infringement or offered a service tailored to it, that knowledge isn't enough, and that holding Cox liable "merely for failing to terminate infringing accounts" would expand secondary liability beyond precedent; it also said the DMCA "merely creates new defenses" ([Cox v. Sony](/books/user-generated-platforms/hosting-liability#cox-v-sony-2026)). Two consequences for practice:

- **The repeat-infringer policy is a safe-harbor condition, not the liability line.** A platform that terminates too slowly no longer faces contributory liability for that alone, but 512(i) still conditions the safe harbor on a reasonably implemented policy, and the safe harbor is the cheap defense. The strike count stays.
- **Inducement is the risk to manage.** After Cox, a platform's exposure turns on its own acts: marketing that encourages uploading others' work, features designed around infringement, or a business tailored to it. Product copy, onboarding and growth campaigns are evidence; review them like policy.

What "reasonably implemented" means in records: notices counted only when valid, strikes withdrawn when a counter-notice or retraction resolves them, expiry applied consistently, termination when the threshold is crossed with documented exceptions, and terminated users prevented from returning under new accounts ([Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing) covers evasion).

## Fingerprinting and Content ID

Notice and takedown is reactive and per item. Fingerprinting moves copyright enforcement to upload time, at the rights holder's request: the rights holder supplies reference files, the platform (or a vendor) computes fingerprints, every upload is matched against them, and each match produces a claim with an action the rights holder chose in advance. It's the same pipeline shape as hash matching for safety ([Hash Matching](/books/user-generated-platforms/child-safety#hash-matching)), with two differences: the references belong to a private party with commercial interests, and the action is usually money, not removal.

**YouTube's Content ID** is the reference design, and its help pages describe the parts:

- **Eligibility.** Copyright owners "must own exclusive rights to a substantial body of original material that is frequently uploaded to YouTube" and give evidence of the content they control. Non-exclusive material can't be a reference: mashups, compilations, gameplay, trailers, unlicensed or non-exclusively licensed music, recordings of performances. Approved owners sign an agreement limiting references to exclusive content and naming territories where their rights aren't worldwide.
- **Actions.** Each match becomes a claim, and the owner's settings decide whether the video is blocked, monetized (ads run, sometimes shared with the uploader) or tracked for statistics, and any of these "can vary by country or region": a video can be monetized in one territory and blocked in another.
- **Disputes.** An uploader can dispute a claim for having the rights, a copyright exception such as fair use, or misidentification (not for giving credit or owning a copy). The claimant has 30 days to respond: release the claim, reinstate it, or file a copyright removal request, which if valid removes the video with a strike. No response in 30 days releases the claim. A rejected dispute may be appealed, with seven days for the claimant; for claims that block a video, the uploader can escalate straight to appeal. A Content ID claim normally doesn't strike; a removal request does.
- **Misuse.** Claimants who "repeatedly make erroneous Content ID claims can have their Content ID access disabled".

**The scale,** from YouTube's 2024 Copyright Transparency Report as reported by TorrentFreak: more than 2.2 billion Content ID claims (up from nearly 2 billion in 2023); 7,703 rights holders with access, 4,564 actively using it; 99.43% of copyright actions through Content ID; manual claims by Content ID users about 0.31% (roughly 6.9 million); fewer than 1% of claims disputed (about 22 million), with manual claims disputed at 1.13% against 0.54% for automated ones; more than 65% of disputes resolved in the uploader's favor; more than 90% of claims monetized rather than blocked; and $12 billion paid to rights holders since launch. The figures make the economic point: for most matches the rights holder wants the revenue, not the removal, so the system is a licensing market as much as an enforcement tool.

**Other models.** Pinterest's Content Claiming Portal lets exclusive owners upload originals and choose an enforcement that applies "to both existing matches and future matches". Twitch uses Audible Magic to scan VOD audio. Platforms without an in-house matcher can buy identification from vendors such as Audible Magic or Vobile.

What to build, whatever the vendor:

- **Rights references are records with owners, territories and attestations.** Who supplied it, what work it is, where the supplier holds exclusive rights, what policy it carries per territory, and what the supplier attested about exclusivity. A reference claiming public-domain or someone else's material is the most common abuse, so references can be suspended, and overlapping references from two claimants are a conflict to resolve, not two claims to honor.
- **A claim is not a takedown.** Claims live in their own table with their own lifecycle; they turn into a legal notice only when the claimant files a removal request. Keep them apart so transparency reports, strikes and 512 obligations count only the legal ones.
- **Match segments, not just items.** A claim on 20 seconds of a two-hour video should say which 20 seconds, so the action can be muting that segment or splitting revenue, and so a dispute can be judged.
- **Disputes need clocks and a human.** The claimant's response window, automatic release on silence, and an escalation path that ends in a statutory notice or a release.
- **Measure claimant accuracy.** Disputes won by uploaders, per claimant and per reference, are the signal for suspending access.

Music matched inside short-video uploads, and what a lapsed label deal does to every post using a sound, are in [Sounds, Remix & Duets](/books/user-generated-platforms/sounds-remix-and-duets#matching-music-in-uploads).

## Music in Streams

Live streaming is where copyright and product collide hardest. A streamer plays music in the background for hours; the live audience never triggers a notice; the archive (VODs, clips, highlights) is what rights holders find later, and one notice can cover hundreds of old clips.

**Twitch, VOD muting (2014).** As Game Informer reported Twitch's announcement, Twitch began scanning archived broadcasts and highlights with Audible Magic in August 2014, in 30-minute blocks: if third-party audio was found anywhere in a block, the whole block was muted, with an appeal button for creators; live streams weren't scanned. The design trades precision for simplicity: a few seconds of detected audio silences half an hour.

**Twitch, the 2020 wave.** Twitch's November 2020 post says it had received fewer than 50 music-related DMCA notifications a year before May 2020, then "thousands of DMCA notifications each week", mostly against snippets of music in old Clips, and more than 99% of notices from May to mid-October involved tracks playing in the background of streams. It admitted it had not built adequate tools for managing VOD and Clip libraries, gave creators three days to use a delete-all-Clips tool, and sent warning emails without key DMCA details; it kept removing content as the law required but paused strikes for the batched notices, and promised counter-notification tools, wider audio detection and finer control over which audio is recorded. The lesson is a capacity one: a platform's notice pipeline, notification templates and bulk tools must handle a rights holder deciding to enforce a back catalog at once.

**Soundtrack.** Twitch's rights-cleared music tool, Soundtrack by Twitch, was withdrawn in 2023: a developer notice on 10 June 2023 said it would soon shut down, and its API endpoints returned 410 Gone from 17 July 2023.

**The DJ Program (2024).** In June 2024 Twitch announced licenses with Universal Music Group, Warner Music Group, Sony Music and independents through Merlin for DJ streams, with licensing costs split 50/50 between Twitch and DJs in the program and one year of help covering costs for existing DJs. Its **Music Reporting Process**, separate from the DMCA process, sets out what participating rights holders can report and what happens:

- **VODs.** Participating rights holders can report VODs, highlights, uploads and clips containing their music; Twitch may remove or mute them.
- **DJ channels.** Pre-released or unreleased music, audio-only or rebroadcast sets, music outside the DJ catalog, sponsored content implying an artist's endorsement, and on-demand recordings (VODs and clips) containing DJ-catalog music each carry a penalty ladder, from ending the stream with a 24- or 48-hour suspension to permanent suspension at the third or fourth report, depending on the activity.
- **Other channels.** A channel that mirrors a radio station is permanently suspended on the first report; DJ sets outside the program, concert rebroadcasts, whole albums, music-centered streams, karaoke and request playback carry their own ladders.
- **Appeals and the DMCA.** Creators can appeal, and the process covers only rights holders who opted in; others can still send DMCA notices.

The structure is worth copying even without Twitch's licenses: the contract with rights holders distinguishes **incidental** use (background, in-game) from **flagrant** use (radio, rebroadcast, pre-release) and assigns each a different action, instead of one strike per notice.

**YouTube live.** A live stream removed for copyright gives the channel a strike and restricts live streaming for seven days, 14 on a second strike, on top of the ordinary strike consequences.

What this means for a streaming platform's design:

- **Separate live, recording and clip rights.** A license for live performance doesn't cover the VOD or the clip; the DJ Program's ban on keeping DJ-catalog music in on-demand recordings is the industry stating it. Store which rights cover which surface, and gate recording and clipping on them.
- **Let creators control the archive.** Bulk delete, per-segment muting, and an audio track excluded from recordings (the tools Twitch said it lacked in 2020) are compliance features.
- **Scan recordings, not just uploads,** because that is where notices land; [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#from-live-to-vod) covers the recording pipeline.

## Article 17

In the EU, uploads of protected works to large sharing services aren't governed by the DSA's hosting exemption: the DSA is "without prejudice" to copyright law (Recital 11). Article 17 of the DSM Directive (Directive (EU) 2019/790, transposition deadline 7 June 2021 under Article 29) governs them instead.

**Who it covers.** An **online content-sharing service provider** is a service whose main or one of its main purposes is "to store and give the public access to a large amount of copyright-protected works or other protected subject matter uploaded by its users, which it organises and promotes for profit-making purposes" (Article 2(6)); the definition excludes not-for-profit encyclopedias and educational and scientific repositories, open source development platforms, electronic communications services, online marketplaces and business-to-business cloud services, among others.

**Direct liability.** Such a provider "performs an act of communication to the public" when it gives access to users' uploads and so must obtain authorization, for instance by licensing (17(1)); a license it obtains also covers users who aren't acting commercially (17(2)). Without authorization it is liable unless it demonstrates that it has (17(4)):

- (a) made best efforts to obtain an authorization;
- (b) made, "in accordance with high industry standards of professional diligence", best efforts to ensure the unavailability of specific works for which rightholders provided "the relevant and necessary information"; and in any event
- (c) acted expeditiously on a sufficiently substantiated notice to disable or remove the notified works, and made best efforts to prevent their future uploads in accordance with (b).

Point (c) is **notice and stay down**: after a valid notice, the same work shouldn't come back.

**The small-service regime (17(6)).** For new services available in the EU for less than three years with annual turnover below €10 million, the conditions are limited to point (a) and acting expeditiously on a sufficiently substantiated notice. If such a service's average monthly unique visitors exceed 5 million, calculated on the previous calendar year, it must also show best efforts to prevent further uploads of notified works for which rightholders provided relevant and necessary information.

**The safeguards.** Cooperation between services and rightholders "shall not result in the prevention of the availability" of non-infringing uploads, including those covered by an exception, and users must be able to rely on quotation, criticism and review, and on caricature, parody and pastiche (17(7)). Article 17 "shall not lead to any general monitoring obligation", and services must give rightholders, on request, adequate information on how their practices work (17(8)). Services must provide "an effective and expeditious complaint and redress mechanism" for users whose uploads are disabled or removed; rightholders requesting removal must "duly justify" it; complaints are processed "without undue delay", and decisions to disable or remove "shall be subject to human review"; out-of-court redress and access to courts must be available; and services must tell users in their terms that they can use works under exceptions (17(9)).

**The CJEU's reading.** Poland asked the Court of Justice to annul 17(4)(b) and (c) as a mandate for upload filters that would censor lawful expression. In *Poland v Parliament and Council* (C-401/19, Grand Chamber, 26 April 2022) the Court dismissed the action, but on terms that bind implementation. It recalled that "a filtering system which might not distinguish adequately between unlawful content and lawful content" would be incompatible with freedom of expression (paragraph 86), and read 17(8)'s no-general-monitoring rule to mean services "cannot be required to prevent the uploading and making available to the public of content which, in order to be found unlawful, would require an independent assessment of the content by them in the light of the information provided by the rightholders and of any exceptions and limitations to copyright" (paragraph 90). Automatic blocking is permissible only where infringement is apparent from the rightholders' information without that assessment; everything else waits for a human or a complaint.

What Article 17 adds to the system:

- **Rightholder information is an input with provenance.** "Relevant and necessary information" is the rights reference: without one, there's no 17(4)(b) duty for that work; with one, the matching duty applies. The reference table is the compliance record.
- **Two thresholds, not one.** Block at upload only where the match is close to identical and long enough that no exception plausibly applies; route partial, short or transformed matches to keep-up-pending-review or to a claim that doesn't block. That is the line *C-401/19* drew.
- **Stay-down is a fingerprint, not a URL.** A notified work becomes a reference so re-uploads match; for a small service under 17(6), that duty starts when it crosses 5 million monthly visitors.
- **Complaints with human review,** and a statement of the outcome, sharing the appeal machinery in the playbook's [Appeals](/docs/security/trust-and-safety#appeals).
- **Licensing is part of compliance.** Best efforts to obtain authorization is a record of whom the platform approached and what it signed; [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#ads-on-user-content) and [Creator Monetization](/books/user-generated-platforms/creator-monetization#music-costs-shared-with-creators) cover the revenue side of licensed music and claims.

## How to Build It

The chapter adds four tables to the notices model in [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#how-to-build-it). DMCA takedowns and counter-notices are `legal_notices` rows (`kind` 'dmca_takedown' and 'dmca_counter', the counter linked by `responds_to_notice_id`), their named items are `legal_notice_items`, and the decisions are the playbook's `moderation_decisions` with category 'copyright'. Here are the agent, the copyright-specific notice detail, the rights references and the claims.

```sql
CREATE TABLE dmca_agent_designations (   -- one in force per legal entity; renewed by a new row
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity     TEXT NOT NULL,        -- full legal name of the service provider
  street_address   TEXT NOT NULL,
  alternate_names  TEXT[] NOT NULL DEFAULT '{}',  -- trade names, domains, app names
  agent_name       TEXT NOT NULL,        -- a person, a title or a department
  agent_organization TEXT,               -- a third-party service, if used
  agent_address    TEXT NOT NULL,
  agent_phone      TEXT NOT NULL,
  agent_email      TEXT NOT NULL,
  directory_ref    TEXT,                 -- the Copyright Office designation number
  published_url    TEXT NOT NULL,        -- where the service shows it
  filed_on         DATE NOT NULL,        -- registration, amendment or resubmission
  expires_on       DATE NOT NULL,        -- three years later
  superseded_on    DATE,                 -- the next filing for this entity
  CHECK (expires_on = (filed_on + INTERVAL '3 years')::date),
  CHECK (superseded_on IS NULL OR superseded_on >= filed_on),
  EXCLUDE USING GIST (legal_entity WITH =,
    daterange(filed_on, COALESCE(superseded_on, expires_on)) WITH &&)
);

CREATE TABLE copyright_notice_details (  -- the copyright side of a DMCA notice or counter
  legal_notice_id        UUID PRIMARY KEY REFERENCES legal_notices (id),
  works                  JSONB NOT NULL, -- each work: title, type, owner, registration if given
  representative_list    BOOLEAN NOT NULL DEFAULT FALSE,  -- many works at one site
  -- 512(c)(3)(A) elements, as checked; null on a counter-notice
  has_signature          BOOLEAN NOT NULL,
  identifies_work        BOOLEAN,
  locates_material       BOOLEAN NOT NULL,
  has_contact            BOOLEAN NOT NULL,
  good_faith_statement   BOOLEAN,
  perjury_authority_statement BOOLEAN,
  -- 512(g)(3) elements; null on a takedown
  mistake_statement      BOOLEAN,
  consents_to_jurisdiction BOOLEAN,
  accepts_service        BOOLEAN,
  cure_requested_at      TIMESTAMPTZ,    -- (c)(3)(B)(ii): asked the sender to complete it
  fair_use_review        TEXT NOT NULL DEFAULT 'not_reviewed' CHECK (fair_use_review IN
                           ('not_reviewed', 'not_applicable', 'likely_fair_use',
                            'referred_to_counsel')),
  fair_use_notes         TEXT,
  suit_notice_received_at TIMESTAMPTZ,   -- on a counter: the claimant says it sued; no restore
  uploader_notified_at   TIMESTAMPTZ,    -- 512(g)(2)(A)
  claimant_forwarded_at  TIMESTAMPTZ,    -- 512(g)(2)(B): counter forwarded to the claimant
  CHECK ((mistake_statement IS NULL) = (consents_to_jurisdiction IS NULL)),
  CHECK (fair_use_review <> 'likely_fair_use' OR fair_use_notes IS NOT NULL)
);

CREATE TABLE rights_references (         -- a rights holder's reference file and its policy
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_account_id    UUID NOT NULL REFERENCES accounts (id),  -- the rights holder
  media_asset_id      UUID REFERENCES media_assets (id),        -- the reference, if kept
  kind                TEXT NOT NULL CHECK (kind IN ('audio', 'video', 'image', 'melody')),
  work_title          TEXT NOT NULL,
  identifiers         JSONB,             -- ISRC, ISWC, catalog numbers
  matcher             TEXT NOT NULL,     -- 'in_house' or the vendor
  matcher_ref         TEXT NOT NULL,     -- the fingerprint's id in the matcher's index
  rights_territories  CHAR(2)[],         -- where rights are exclusive; null: worldwide
  policy              JSONB NOT NULL,    -- per territory: block, monetize, track
  exclusive_rights_attested_at TIMESTAMPTZ NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('rights_holder_upload',
                        'notice_stay_down', 'vendor_registry')),  -- how it got here
  source_notice_id    UUID REFERENCES legal_notices (id),  -- stay-down from a notice
  status              TEXT NOT NULL CHECK (status IN ('active', 'in_conflict',
                        'suspended', 'retired')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (matcher, matcher_ref),
  CHECK (source <> 'notice_stay_down' OR source_notice_id IS NOT NULL)
);

CREATE TABLE content_claims (            -- one reference matched in one item
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  content_item_id     UUID NOT NULL REFERENCES content_items (id),
  media_asset_id      UUID NOT NULL REFERENCES media_assets (id),
  rights_reference_id UUID REFERENCES rights_references (id),   -- null: a manual claim
  claimant_account_id UUID NOT NULL REFERENCES accounts (id),
  origin              TEXT NOT NULL CHECK (origin IN ('automated_match', 'manual')),
  match_span_ms       INT8RANGE,         -- where in the asset the match is
  match_score         NUMERIC(5, 4),
  action              TEXT NOT NULL CHECK (action IN ('block', 'monetize', 'track',
                        'mute_segment')),
  territories         CHAR(2)[],         -- where the action applies; null: everywhere
  dispute_state       TEXT NOT NULL DEFAULT 'none' CHECK (dispute_state IN ('none',
                        'disputed', 'appealed', 'released', 'upheld', 'expired',
                        'escalated_to_notice')),
  dispute_reason      TEXT CHECK (dispute_reason IN ('licensed', 'exception',
                        'public_domain', 'original', 'misidentified')),
  disputed_at         TIMESTAMPTZ,
  claimant_due_at     TIMESTAMPTZ,       -- the platform's response window
  takedown_notice_id  UUID REFERENCES legal_notices (id),  -- when escalated to a DMCA notice
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active',
                        'released', 'expired')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at         TIMESTAMPTZ,
  CHECK ((origin = 'automated_match') = (rights_reference_id IS NOT NULL)),
  CHECK ((dispute_state = 'none') = (disputed_at IS NULL)),
  CHECK ((dispute_state = 'escalated_to_notice') = (takedown_notice_id IS NOT NULL)),
  CHECK ((status = 'active') = (released_at IS NULL))
);

CREATE INDEX content_claims_open_disputes
  ON content_claims (claimant_due_at) WHERE dispute_state IN ('disputed', 'appealed');
```

Repeat infringers are a query over the playbook's tables, not a counter:

```sql
-- Accounts at or over a three-strike threshold: copyright penalties in force
SELECT p.account_id, count(*) AS strikes_in_force
FROM penalties p
JOIN moderation_decisions d ON d.id = p.decision_id
WHERE d.category = 'copyright'
  AND p.revoked_at IS NULL
  AND p.valid_during @> NOW()
GROUP BY p.account_id
HAVING count(*) >= 3;
```

Notes on the sketch:

- **Strikes are penalties.** A valid takedown that removes an item produces a `moderation_decisions` row with category 'copyright' and a `penalties` row (a warning or strike with a `valid_during` matching the policy's expiry) against the uploader. A valid counter-notice that isn't answered by a suit, or a retraction, revokes it (`revoked_at`, `revoked_reason`), so the query above counts only strikes that stand. A community's strike count is the same query grouped by the case's `community_id`, and banning a community is a case with `subject_type = 'community'`. The threshold, window and expiry are rules as data with versions, so a termination can show the rule it applied.
- **The counter-notice's clock is a window.** The restore job runs between `earliest_action_at` and `due_at` on the `dmca_counter` row, checks `suit_notice_received_at` first, restores the items and revokes the strike; Twitch's warning that some material can't be reinstated is why removal keeps the media (`media_assets.state` stays recoverable) until the window closes.
- **Claims aren't notices.** `content_claims` never touches `legal_notices` unless the claimant escalates; then a `dmca_takedown` row is created and linked, and the statutory process takes over. Claims don't strike; notices do. Transparency counts and the 512(i) policy read notices and penalties only.
- **References carry their legal weight.** Under Article 17 a reference is the "relevant and necessary information"; `source = 'notice_stay_down'` records references created from a notice for stay-down, and `in_conflict` holds a reference two claimants assert until it is resolved, so neither gets the revenue.
- **Territory everywhere.** References hold where rights exist; claims hold where an action applies; delivery enforces it per request, and monetization splits are per territory ([Creator Monetization](/books/user-generated-platforms/creator-monetization#ad-revenue-share) covers who gets paid).
- **The agent is a scheduled check.** A job ([Background Jobs](/docs/architecture/background-jobs#scheduling)) alerts 90 days before `expires_on`, compares `alternate_names` against the domains and apps in service, and checks that `published_url` still shows the current agent.
- **Matching runs in the upload path and on recordings.** New uploads and new VODs and clips are fingerprinted and matched before or just after publish ([The Upload Path](/books/user-generated-platforms/upload-path#scanning-before-publish); [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#from-live-to-vod)), and a new reference is matched against the back catalog as a background sweep, which is the moment claims spike.
- **Events:** `copyright.notice_validated`, `copyright.item_removed`, `copyright.counter_received`, `copyright.restore_due`, `copyright.item_restored`, `copyright.strike_issued`, `copyright.strike_revoked`, `copyright.account_terminated`, `content_claim.created`, `content_claim.disputed` and `content_claim.released` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to notices, monetization, search and the transparency counts.

## Auditing

- **The agent's history:** every designation with its filing date, expiry, supersession and published location, so the platform can show a designation was in force on the day a notice arrived.
- **Every notice and counter-notice** with its element checks, cure requests, fair-use review, uploader notice, forwarding and restore dates against the statutory window.
- **Every strike** with the notice behind it, its expiry, and any revocation and why; every termination with the rule version and the strikes counted.
- **Every claim and dispute,** with the reference, match span, action per territory, dispute reason, claimant response and outcome, and the claimant's dispute loss rate.
- **Reference provenance:** who supplied each reference, the exclusivity attestation, conflicts and suspensions.
- **Revenue moved by claims,** reconciled to the ledger, because a wrong claim is also a wrong payment ([Payment States & Ledgers](/docs/payments/payment-states)).

Reddit's published set (notices, items, actionability rates, invalid notices, counter-notices, withdrawals, repeat-infringer bans for accounts and communities) and YouTube's (claims, disputes, outcomes, active claimants) are the templates for the public report; [Transparency Reporting](/books/user-generated-platforms/transparency-reporting#what-the-voluntary-reports-count) covers the formats.

## What This Means for the System You Build

- **Keep the DMCA agent current** for every legal entity, renewed on any change and before the three-year expiry, and published where users can find it.
- **Validate notices element by element,** ask for cures on substantially compliant ones, decline invalid ones with reasons, and route misfiled privacy and harassment complaints to their own queue.
- **Remove expeditiously and keep the media,** so a counter-notice can restore it inside the 10-to-14 business-day window.
- **Count strikes as penalties with expiry,** revoke them on valid counters and retractions, and count communities as well as accounts.
- **Treat inducement as the post-Cox risk,** and review product copy and features for it.
- **Run fingerprinting as a licensing system** with references, per-territory policies, segment-level claims and a dispute path with clocks, separate from statutory notices.
- **Separate live, recording and clip rights** for music, and give creators bulk and per-segment control of their archives.
- **For EU content-sharing services, block only on manifest matches,** send everything ambiguous to human review, and run stay-down on references created from notices.

## References

**Statutes and regulations**

- [17 U.S.C. § 512](https://www.law.cornell.edu/uscode/text/17/512), designated agent (c)(2), notice elements and substantial compliance (c)(3), counter-notices and the 10-to-14 business-day restore (g), misrepresentation (f), subpoenas (h), repeat infringers and standard technical measures (i), no monitoring (m)
- [37 CFR 201.38](https://www.law.cornell.edu/cfr/text/37/201.38), designation contents, alternate names, one agent per provider, website posting, electronic filing, three-year expiry, the 2017 transition
- [37 CFR 201.3](https://www.law.cornell.edu/cfr/text/37/201.3), the $6 fee to designate, amend or resubmit
- [U.S. Copyright Office: DMCA Designated Agent Directory](https://www.copyright.gov/dmca-directory/), the online directory and registration system
- [Directive (EU) 2019/790 (DSM Directive)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790), the Article 2(6) definition, Article 17(1), (2), (4), (6), (7), (8) and (9), and the 7 June 2021 transposition deadline in Article 29
- [Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065), Recital 11, copyright law left unaffected

**Courts**

- [Cox Communications, Inc. v. Sony Music Entertainment, No. 24-171 (2026)](https://www.law.cornell.edu/supremecourt/text/24-171), contributory liability only for inducement or a tailored service; failing to terminate not enough; the DMCA as defenses (25 March 2026)
- [Lenz v. Universal Music Corp., Nos. 13-16106 and 13-16107 (9th Cir. 2015)](https://cdn.ca9.uscourts.gov/datastore/opinions/2015/09/14/13-16106.pdf), the original opinion of 14 September 2015, including the statements that fair-use consideration "need not be searching or intensive" and that computer programs could perform it
- [Lenz v. Universal Music Corp., order and amended opinion (9th Cir. 2016)](https://cdn.ca9.uscourts.gov/datastore/opinions/2016/03/17/13-16106.pdf), 17 March 2016: the statute "requires copyright holders to consider fair use before sending a takedown notification"; subjective good faith; both earlier statements absent
- [Poland v Parliament and Council, C-401/19 (CJEU, 26 April 2022)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:62019CJ0401), action dismissed; filtering that can't distinguish lawful content (para. 86); no independent assessment required (para. 90)
- [In re DMCA Section 512(h) Subpoena to Discord, Inc., No. 3:24-mc-00059-S (N.D. Tex.), Nexon's motion to compel](https://storage.courtlistener.com/recap/gov.uscourts.txnd.395421/gov.uscourts.txnd.395421.2.0.pdf), the 2023 compromise on 64 user IDs, the May 2024 subpoena, Discord's objections (overly burdensome, users' anonymity, no temporal limit), filed 11 October 2024

**Platforms**

- [YouTube Help: How Content ID works](https://support.google.com/youtube/answer/2797370?hl=en), eligibility, reference database, block, monetize and track by territory, loss of access for erroneous claims
- [YouTube Help: Qualify for Content ID](https://support.google.com/youtube/answer/1311402?hl=en), exclusive rights evidence, non-qualifying material, territory agreements
- [YouTube Help: Dispute a Content ID claim](https://support.google.com/youtube/answer/2797454?hl=en), dispute reasons, 30-day response, expiry, appeals and the seven-day window
- [YouTube Help: Copyright strike basics](https://support.google.com/youtube/answer/2814000?hl=en), three strikes in 90 days, Copyright School, scheduled removals, live stream restrictions of seven and 14 days, one strike per video
- [TorrentFreak: YouTube processed 2.2 billion Content ID copyright claims in 2024](https://torrentfreak.com/?p=267513), the 2024 copyright transparency figures (reported 22 May 2025; I couldn't load Google's own report page)
- [Twitch: DMCA Guidelines](https://legal.twitch.com/en/legal/dmca-guidelines/), three-strike repeat infringer policy, strikes not permanent, disputed notices, limits on reinstatement
- [Twitch: Reporting Process for Participating Music Rights Holders](https://legal.twitch.com/legal/dmca-guidelines/music-reporting-process), VOD reports, DJ Program and other-channel penalty ladders, appeals
- [Twitch Blog: Music-related copyright claims and Twitch](https://blog.twitch.tv/en/2020/11/11/music-related-copyright-claims-and-twitch/), the 2020 notice wave, admitted mistakes, paused strikes, planned tools (11 November 2020)
- [Game Informer: Twitch details changes to stream archiving, audio content ID policies](https://www.gameinformer.com/b/news/archive/2014/08/08/twitch-details-changes-to-stream-archiving-audio-content-id-policies.aspx), Audible Magic, 30-minute muting blocks, live not scanned, appeals (reported 8 August 2014; Twitch's own 2014 post is no longer online)
- [Twitch Developer Forums: Withdrawal of Twitch API endpoints for Soundtrack](https://discuss.dev.twitch.com/t/withdrawal-of-twitch-api-endpoints-for-soundtrack/46021), the June 2023 notice and 410 responses from 17 July 2023
- [Twitch Blog: Introducing the Twitch DJ Program](https://blog.twitch.tv/en/2024/06/06/introducing-the-twitch-dj-program/), the labels and Merlin, the 50/50 cost split for most streamers and the one-year subsidy (6 June 2024)
- [Reddit: Transparency Report, July to December 2025](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), copyright notices, actionability, invalid notices, fair-use declines, counter-notices, withdrawals, account and subreddit bans and their change on the prior half (Reddit's own PDF; copy hosted by TorrentFreak, as redditinc.com blocks automated access)
- [Pinterest: Copyright](https://policy.pinterest.com/en/copyright), identical-copy removal, counter-notices and the Copyright Claims Board, strikes and appeals, the Content Claiming Portal
- [Discord: Copyright & IP Policy](https://support.discord.com/hc/en-us/articles/4410339349655), notice and counter-notice elements, restoration timing, repeat infringer termination
- [Tumblr: Terms of Service](https://www.tumblr.com/policy/en/terms-of-service), DMCA policy, counter-notification, repeat infringer termination
- [Kick: DMCA Policy](https://kick.com/dmca-policy), notice and counter-notice elements, repeat and blatant infringement
- [Imgur: Terms of Service](https://imgur.com/tos), DMCA agent, registration number request

**Vendors**

- [Audible Magic](https://www.audiblemagic.com/), identification and fulfillment products, listed partners, self-reported catalog figures
- [Pex](https://pex.com/), music recognition and registry claims, the April 2025 acquisition by Vobile

**Reference**

- [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability), the `legal_notices` model and the legal clocks
