+++
title = "The Law of Hosting User Content"
nav_title = "Hosting Liability Law"
description = "Section 230, the DMCA safe harbors and the DSA hosting exemption, why knowledge is the trigger, the cases reshaping them, and the legal clocks platforms run on."
category = "User-Generated Platforms Industry"
order = 1838
part = "Trust and Safety"
tags = ["trust-and-safety", "section-230", "dmca", "digital-services-act", "litigation", "legal-notices"]
+++

A platform publishes millions of things a day that it didn't write, and the law has to decide when the platform answers for them. Three regimes do most of that work for the platforms in this volume. In the United States, Section 230 says a service isn't the publisher of what its users post, almost regardless of what it knows; the DMCA gives copyright its own bargain, a safe harbor for services that take infringing material down when told; and in the European Union, the Digital Services Act keeps the old e-commerce rule that a host isn't liable for what it stores until it knows, then adds the procedures that turn "knows" into a timestamp. Around them sit narrower laws with their own triggers and deadlines: the child sexual abuse reporting duty, the TAKE IT DOWN Act's 48-hour removals, the EU's one-hour terrorist content orders.

The engineering consequence is that legal exposure is a function of records. When did a notice arrive, was it complete, which items did it name, what did the platform do and when, and which rule set the deadline. A platform that can answer those questions from data keeps its safe harbors and defends its decisions; one that answers from inboxes and memory loses both. This chapter covers the law of hosting liability (Section 230, the DMCA structure, the DSA's exemption), why knowledge is the trigger nearly everywhere, the litigation that is reshaping the US rules as of October 2026, the legal clocks a platform runs on, and the `legal_notices` record every other Trust and Safety chapter extends. The general moderation machinery (policy, reports and queues, ladders, notices, appeals, audit) is in the playbook's [Trust & Safety](/docs/security/trust-and-safety); the copyright mechanics are in [Copyright at Scale](/books/user-generated-platforms/copyright); regulators and their enforcement are in [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement). None of this is legal advice.

## How the Platforms Do It

Every platform in this market publishes the same few legal surfaces: a copyright agent and notice form, a counter-notice path, a repeat-infringer statement, a channel for government and court requests, and (for EU users) a notice form open to anyone. What differs is how much of the handling they disclose. As of October 2026:

| Platform | What its public pages say about legal notices |
| --- | --- |
| **Discord** | A DMCA form and a copyright agent by email or post; restores content "10 to 14 business days or more" after a valid counter-notice unless told of a court action; warns that false or duplicate reports can draw penalties |
| **Imgur** | A DMCA agent address in its terms; asks claimants for a copyright registration number or application and reserves the right to ignore notices about unregistered works, citing the share of invalid notices it receives |
| **Kick** | A DMCA policy with notice and counter-notice elements; suspends or terminates repeat infringers and may act on blatant infringement without repeats |
| **Pinterest** | A form or the designated agent; reinstates after a valid counter-notice unless the reporter shows a court or Copyright Claims Board action, a process that "can take up to 14 business days"; counts strikes toward its repeat-infringer policy |
| **Reddit** | Its H2 2025 transparency report counts copyright notices (69,154, with a 71% notice actionability rate), invalid notices rejected (28%), counter-notices and withdrawals, government removal requests, private-party legal removal requests, and fraudulent requests caught: 26 fraudulent legal requests in the half (15 to remove content, 11 for account information) and 36 in 2025, rejected and reported to the authorities |
| **Tumblr** | A DMCA policy in its terms with a designated agent and counter-notice path; terminates repeat infringers "under appropriate circumstances" |
| **Twitch** | Describes its role in DMCA disputes as a "go-between" that doesn't decide who is right; takes notices through an online form or its designated agent; terminates accounts at three copyright strikes; doesn't count disputed notices as strikes until the dispute is resolved |
| **YouTube** | Separates copyright removal requests (which can strike a channel) from Content ID claims (which usually don't); three strikes in 90 days subjects a channel and its linked channels to termination |

Three patterns run through these pages. **The platform positions itself as a conduit for the dispute,** not its judge: it checks that a notice is complete, acts, forwards, and restores on the statutory schedule, leaving the merits to the parties and the courts. **Validity checking is real work:** Reddit rejected 28% of copyright notices in one half-year as invalid, for missing elements, for being privacy or harassment complaints dressed as copyright, or for targeting fair use. **Some legal requests are forged:** Reddit's report describes fake court orders and impersonated regulators, covered in [Fraudulent Legal Requests](#fraudulent-legal-requests) below. The vendors that sell detection and hash lists ([The Platform Landscape](/books/user-generated-platforms/platform-landscape#trust-and-safety)) change what a platform can find; they don't change these legal structures, which turn on what the platform knows and when.

## Section 230

Section 230 of the Communications Act (47 U.S.C. § 230) is two sentences of immunity and a list of exceptions. The first sentence, (c)(1):

> No provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider.

The second, (c)(2), protects moderation itself: no civil liability for "any action voluntarily taken in good faith to restrict access to or availability of material" the provider considers "obscene, lewd, lascivious, filthy, excessively violent, harassing, or otherwise objectionable, whether or not such material is constitutionally protected" ((c)(2)(A)), or for giving users and others the technical means to restrict access to such material ((c)(2)(B)). The definitions decide who gets it: an **interactive computer service** is "any information service, system, or access software provider that provides or enables computer access by multiple users to a computer server" ((f)(2)), and an **access software provider** includes software that can "filter, screen, allow, or disallow content", "pick, choose, analyze, or digest content", or "organize, reorganize" it ((f)(4)). The line that limits it is the **information content provider**: anyone "responsible, in whole or in part, for the creation or development of information" ((f)(3)). A platform is protected for what others created and exposed for what it created or developed itself.

What makes (c)(1) different from every other regime in this chapter is that **knowledge doesn't remove it.** In *Zeran v. America Online* (4th Cir. 1997), AOL was sued for failing to remove defamatory posts after it was told about them; the court held that distributor liability (liability once on notice) is a form of publisher liability, so (c)(1) bars it. That reading has held for almost three decades, which is why a US platform's notice-and-takedown duties come from other statutes, not from Section 230. Judge Matey's partial concurrence in *Anderson v. TikTok* (below) argued that (c)(1) doesn't immunize a platform's "knowing distribution" after notice; it is a separate opinion, not the law of the circuit.

The exceptions in (e) are where the other laws in this volume come from:

| Subsection | Text, in substance | What it leaves standing |
| --- | --- | --- |
| (e)(1) | No effect on federal criminal law, including the obscenity and child sexual exploitation chapters of Title 18 | 18 U.S.C. § 2258A reporting, federal prosecutions ([Child Safety](/books/user-generated-platforms/child-safety#the-reporting-duty)) |
| (e)(2) | Nothing in 230 "shall be construed to limit or expand any law pertaining to intellectual property" | Copyright (so the DMCA) and federal trademark claims |
| (e)(3) | States may enforce laws "consistent with this section"; no liability under inconsistent state or local law | State laws that regulate the platform's own conduct (see the Georgia ruling below) |
| (e)(4) | No effect on the Electronic Communications Privacy Act or similar state law | [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework) |
| (e)(5) | Added by FOSTA in 2018: nothing in 230 other than (c)(2)(A) impairs civil claims under 18 U.S.C. § 1595 where the conduct violates § 1591 (sex trafficking), or state prosecutions for conduct that would violate § 1591 or § 2421A (promoting prostitution) | Sex-trafficking claims against platforms; moderation in good faith keeps (c)(2)(A) protection even here |

Two consequences shape systems. **Moderating doesn't forfeit the immunity.** (c)(2) exists so that removing some content doesn't make a platform the publisher of everything it left up; a platform can run classifiers, ban users and write strict policies without increasing its (c)(1) exposure. **The platform's own words and design are its own.** Labels, warnings, summaries and ranking explanations the platform writes, AI-generated text it produces ([AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#ai-answers-over-community-content)), and, under the theories now being litigated, product design itself, may be first-party conduct outside (c)(1). [The Litigation](#the-litigation) tracks where that line is moving.

## DMCA Safe Harbors

Copyright sits outside Section 230 by (e)(2), so for US platforms it has its own regime: 17 U.S.C. § 512, from the Digital Millennium Copyright Act of 1998. It creates four safe harbors by function, each limiting monetary liability for copyright infringement:

| Safe harbor | Function | Who uses it |
| --- | --- | --- |
| 512(a) | Transitory digital network communications | Access networks, transit, some messaging transport |
| 512(b) | System caching | Caches and CDNs storing copies automatically |
| 512(c) | Information residing on systems or networks at the direction of users | Every platform that stores user posts, files, streams and listings |
| 512(d) | Information location tools | Search, link directories, link-sharing features |

For a user-generated platform, 512(c) is the one that matters. It applies only if the platform (A) doesn't have actual knowledge of the infringement or awareness of facts from which it is apparent, or acts "expeditiously" to remove the material once it does; (B) receives no financial benefit directly attributable to the infringement where it has the right and ability to control it; (C) removes material expeditiously on a valid notice; and has a designated agent registered with the Copyright Office. All the safe harbors also require a reasonably implemented repeat-infringer policy and accommodation of standard technical measures (512(i)), and none requires monitoring (512(m)). [Copyright at Scale](/books/user-generated-platforms/copyright) owns the mechanics: [the agent](/books/user-generated-platforms/copyright#the-dmca-agent), [notices](/books/user-generated-platforms/copyright#notices), [counter-notices](/books/user-generated-platforms/copyright#counter-notices), [repeat infringers](/books/user-generated-platforms/copyright#repeat-infringers) and the EU's [Article 17](/books/user-generated-platforms/copyright#article-17); [DMCA for Hosts](/books/user-generated-platforms/abuse-desks#dmca-for-hosts) covers the web host's version.

The structural point for this chapter is that the DMCA is a **conditional** shield, unlike Section 230. Each condition is a process a platform has to run and prove: an agent on file and current, notices received and acted on, counter-notices forwarded and restored on schedule, a strike count that actually terminates. Lose a condition and the safe harbor is gone for that claim; the platform then defends on the merits of secondary liability, which [Cox v. Sony](#cox-v-sony-2026) narrowed in March 2026.

## DSA Hosting Liability

The EU's Digital Services Act (Regulation (EU) 2022/2065) carries over the e-commerce Directive's liability exemptions for mere conduit (Article 4), caching (Article 5) and hosting (Article 6), and then adds due-diligence duties that apply separately. Its recitals are explicit that the two are independent: the exemption rules say only when a provider "cannot be held liable", not when it can (Recital 17), and the due-diligence obligations "are independent from the question of liability" (Recital 41). A platform can keep the exemption and still be fined for, say, a missing statement of reasons.

**Article 6(1), the hosting exemption.** A provider storing information at a user's request is not liable for it "on condition that the provider: (a) does not have actual knowledge of illegal activity or illegal content and, as regards claims for damages, is not aware of facts or circumstances from which the illegal activity or illegal content is apparent; or (b) upon obtaining such knowledge or awareness, acts expeditiously to remove or to disable access to the illegal content." The remaining paragraphs bound it: the exemption doesn't apply where the user acts under the provider's "authority or the control" (6(2)); online marketplaces lose it under consumer protection law where they present an item or transaction so that an average consumer would believe the platform, or a trader under its control, provides it (6(3)); and it never stops a court or authority from ordering the provider to end or prevent an infringement (6(4)). Recital 18 adds the active-role limit: a provider that goes beyond "merely technical and automatic processing" and plays "an active role of such a kind as to give it knowledge of, or control over" the information loses the exemption for it, including for content developed "under the editorial responsibility" of the provider.

**Article 7, the good Samaritan clause.** Providers aren't ineligible for the exemptions "solely because they, in good faith and in a diligent manner, carry out voluntary own-initiative investigations into, or take other measures aimed at detecting, identifying and removing, or disabling access to, illegal content", or comply with the law. Recital 26 reads "good faith and in a diligent manner" as objective, non-discriminatory and proportionate, with safeguards against removing legal content and reasonably reliable automated tools. This is the EU's counterpart to Section 230(c)(2), with a condition attached: careless proactive moderation isn't protected the same way.

**Article 8, no general monitoring.** "No general obligation to monitor the information which providers of intermediary services transmit or store, nor actively to seek facts or circumstances indicating illegal activity shall be imposed on those providers." Recital 30 confirms this covers monitoring "de jure" and "de facto", without affecting specific orders.

**What gives knowledge.** Article 16(3) settles it for notices: a notice submitted through the Article 16 mechanism gives rise to actual knowledge or awareness "in respect of the specific item of information concerned where they allow a diligent provider of hosting services to identify the illegality of the relevant activity or information without a detailed legal examination." Recital 22 limits it from the other side: knowledge isn't obtained "solely on the ground that that provider is aware, in a general sense" that its service is used for illegal content, and the fact that a provider "automatically indexes information", has search, or recommends content based on profiles "is not a sufficient ground" for specific knowledge. A recommendation engine doesn't, by itself, know what it recommends.

**Orders and threats to life.** Article 9 orders to act against specific illegal content must be given effect and the provider must inform the issuing authority "without undue delay"; recitals 35 and 36 require orders to identify the issuing authority, enable verification of their authenticity, and in principle limit their territorial effect. Article 18 requires a host that becomes aware of information giving rise to a suspicion of a criminal offence "involving a threat to the life or safety of a person or persons" to "promptly inform" the law enforcement or judicial authorities of the Member State concerned.

**Copyright is carved out.** Recital 11 says the DSA is "without prejudice" to EU copyright law, including the DSM Directive (EU) 2019/790, so [Article 17](/books/user-generated-platforms/copyright#article-17)'s direct-liability regime for content-sharing services governs uploads of protected works.

The DSA's diligence duties on hosts and platforms (notice and action, statements of reasons, internal complaints, the Transparency Database, the SME exemption) are tabled in the Gaming volume's [The Digital Services Act](/books/gaming/player-behavior#the-digital-services-act); the playbook covers [statements of reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons) and [appeals](/docs/security/trust-and-safety#appeals); very large platforms, trusted flaggers and fines are in [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#the-digital-services-act).

## Knowledge Is the Trigger

Read side by side, nearly every regime makes the platform answerable from the moment it knows, and nearly every one says it doesn't have to go looking. Section 230 is the exception:

| Regime | What counts as knowledge | What knowledge obliges | Duty to monitor |
| --- | --- | --- | --- |
| **Section 230(c)(1)** | Irrelevant: notice doesn't make a platform the publisher (*Zeran*) | Nothing under 230; duties come from the (e) exceptions | None |
| **DMCA 512(c)** | Actual knowledge, or "red flag" awareness of facts that make infringement apparent; the Second Circuit in *Viacom v. YouTube* (2012) asked whether YouTube had "actual knowledge or awareness of specific infringing activity"; a notice that fails to substantially comply can't be used to show either (512(c)(3)(B)(i)) | Remove or disable "expeditiously" | None (512(m)), beyond standard technical measures |
| **DSA Article 6** | Actual knowledge or (for damages) awareness of apparent illegality; an Article 16 notice that lets a diligent provider see illegality "without a detailed legal examination" (Art. 16(3)); not general awareness, not indexing or recommending (Recital 22) | Remove or disable "expeditiously" | None (Art. 8) |
| **18 U.S.C. § 2258A** | "Actual knowledge" of facts or circumstances indicating an apparent violation | Report to the CyberTipline "as soon as reasonably possible"; preservation follows | None: no duty to "affirmatively search, screen, or scan" (2258A(f)) |
| **TAKE IT DOWN Act** | A valid removal request | Remove within 48 hours and make reasonable efforts on known identical copies | None stated |
| **TCO Regulation (EU) 2021/784** | A removal order from a competent authority | Remove or disable in all Member States within one hour | Specific measures only for providers found exposed |
| **DSM Directive Article 17** | Not the trigger: content-sharing services are directly liable for unauthorised uploads unless they show best efforts, including against works rightholders identified in advance | License, filter on rightholder information, act on notices and prevent re-uploads | None in general (17(8)) |

![One knowledge event fanning out to six regimes. On the left, in the accent, knowledge is timestamped at the earliest provable arrival: a notice, an order or the platform's own finding. Each regime box gives what counts as knowledge, with an arrow to what it obliges: US publisher immunity, where notice changes nothing, leads by a dashed path to nothing under it, since duties come from its exceptions; the US copyright safe harbor, on a valid notice or red-flag awareness, obliges removal or disabling expeditiously with no fixed hours; the EU hosting exemption, on a notice a diligent host can judge, obliges removal or disabling expeditiously; US child-safety reporting, on actual knowledge of an apparent violation, obliges a report and then preservation as soon as reasonably possible; US intimate image removal, on a valid removal request, obliges removal and a sweep of identical copies within 48 hours; EU terrorist content rules, on a removal order from an authority, oblige removal in all member states within one hour. A footnote says no regime here requires scanning and knowledge is per item.](/diagrams/ugp-hosting-liability-knowledge.svg "Section 230 is the one regime where notice changes nothing; under the DMCA, the DSA, 18 U.S.C. 2258A, the TAKE IT DOWN Act and the TCO Regulation, knowledge starts the obligation. Its timestamp is the earliest receipt the platform can prove.")

Four rules follow for the system:

- **Knowledge has a timestamp, and it's the arrival time.** A notice "received" is a notice that reached any channel the platform controls: the designated agent's mailbox, the web form, the abuse desk, a support ticket. My rule is to start every clock at the earliest receipt the platform can prove, and to route misdirected notices into the notices pipeline rather than close them as "wrong channel"; [DMCA for Hosts](/books/user-generated-platforms/abuse-desks#dmca-for-hosts) makes the same point for hosts.
- **Completeness decides whether knowledge exists.** The DMCA's substantial-compliance rule and the DSA's "without a detailed legal examination" test both make the validity check legally meaningful. Record it element by element, with who checked and when; a notice judged deficient (and the attempt to cure it) is the evidence that the platform didn't have knowledge.
- **Proactive detection is protected but not neutral.** Section 230(c)(2) and DSA Article 7 protect good-faith own-initiative moderation, and no regime here requires scanning. But what a classifier or reviewer finds is knowledge: an apparent child sexual abuse image a moderator has seen triggers § 2258A whether a user reported it or a hash matched it ([Child Safety](/books/user-generated-platforms/child-safety#the-reporting-duty)). Design detection with the reporting path already attached.
- **Knowledge is per item.** Article 16(3) speaks of "the specific item of information concerned"; DMCA knowledge is of "specific infringing activity". A notice naming 40 URLs is 40 knowledge events, resolved one by one to the items they name, which is why the notice record in [How to Build It](#how-to-build-it) keeps items separately.

## The Litigation

US courts have spent 2023 to 2026 deciding how far these rules reach when the claim is about a platform's recommendations, design or business choices rather than a single post. As of October 2026, in date order:

| Case | Court and date | Holding or status |
| --- | --- | --- |
| *Twitter v. Taamneh* | Supreme Court, 18 May 2023, unanimous | No aiding-and-abetting liability under the Anti-Terrorism Act for hosting and recommending ISIS content |
| *Gonzalez v. Google* | Supreme Court, 18 May 2023, per curiam | Vacated and remanded in light of *Taamneh*; declined to address Section 230 |
| *Moody v. NetChoice* | Supreme Court, 1 July 2024 | Compiling and curating others' speech in a feed is protected expression; facial challenges vacated and remanded |
| *Anderson v. TikTok* | Third Circuit, 27 August 2024 | Section 230 didn't bar claims over TikTok's algorithmic recommendation of a challenge video, as the recommendation was TikTok's own expressive activity |
| *Cox v. Sony* | Supreme Court, 25 March 2026; seven Justices joined the opinion, two concurred in the judgment | Contributory copyright liability requires inducement or a service tailored to infringement; knowledge isn't enough |
| *K.G.M.* (California JCCP) | Los Angeles Superior Court, verdict 25 March 2026 | First social media addiction jury verdict: $6 million against Meta and YouTube; post-trial motions denied in June 2026 |
| MDL 3047 | N.D. Cal. | No federal bellwether verdict; a school-district bellwether settled in May 2026 before its June trial |
| *NetChoice v. Attorney General* (Georgia SB 351) | Eleventh Circuit, 15 October 2026 | Facial challenge failed; the law's restriction on ads targeted to minors isn't preempted by Section 230 |

### Gonzalez and Taamneh (2023)

The Supreme Court took two cases in its 2022 term that were expected to decide whether recommendations fall outside Section 230. It decided neither on that ground. In *Twitter v. Taamneh*, Justice Thomas for a unanimous Court held that the plaintiffs hadn't stated a claim that Twitter, Facebook and Google aided and abetted the 2017 Reina nightclub attack, because aiding and abetting requires conscious, culpable participation in the wrongful act; the platforms' recommendation algorithms "appear agnostic as to the nature of the content" and were "merely part of that infrastructure" through which all content is filtered. In *Gonzalez v. Google*, the Court, per curiam, found that much of the complaint seemed to fail under *Taamneh* and declined "to address the application of § 230 to a complaint that appears to state little, if any, plausible claim for relief," vacating and remanding. The practical result: a platform that runs content-agnostic ranking over everything isn't a culpable participant in what a user does with it, and the 230 question was left for later courts.

### Moody v. NetChoice (2024)

*Moody v. NetChoice* (with *NetChoice v. Paxton*) concerned Florida and Texas laws restricting how large platforms moderate. Justice Kagan's opinion vacated both appellate decisions because neither had done the analysis a facial challenge requires (whether "a substantial number of [the law's] applications are unconstitutional"), and held that the First Amendment protects an entity "engaging in expressive activity, including compiling and curating others' speech": ranking, labeling and removing posts in a main feed are editorial choices. That holding cut both ways almost immediately: if curation is the platform's expression, it may also be the platform's own conduct for Section 230 purposes.

### Anderson v. TikTok (2024)

The Third Circuit drew that conclusion. A ten-year-old died attempting the "Blackout Challenge" after TikTok's For You Page recommended a video of it; the district court dismissed under Section 230. The Third Circuit reversed in part, vacated in part and remanded on 27 August 2024: Section 230 immunizes a service "only if they are sued for someone else's expressive activity or content (i.e., third-party speech)", not for "their own expressive activity or content (i.e., first-party speech)", and, relying on *Moody*, TikTok's algorithmic curation of the feed was its own expressive activity. Claims about the videos' mere presence remain barred; claims about the recommendation can proceed. The ruling binds only the Third Circuit, so a platform's exposure for recommendations depends on where it is sued.

### Cox v. Sony (2026)

*Cox Communications v. Sony Music Entertainment* reached the Supreme Court after a jury found the internet provider Cox contributorily and willfully liable for subscribers' music piracy and awarded $1 billion in statutory damages; the Fourth Circuit had held that supplying a service with knowledge it will likely be used to infringe was enough. On 25 March 2026 the Court reversed and remanded. Justice Thomas, for seven Justices, held that a provider is contributorily liable only if it intended its service to be used for infringement, which "can be shown only if the party induced the infringement or the provided service is tailored to that infringement". Inducement requires that a provider "actively encourages infringement through specific acts"; a service is tailored to infringement if it isn't capable of "substantial" or "commercially significant" noninfringing uses. Mere knowledge, even combined with not doing enough to stop it, is insufficient, and holding Cox liable merely for failing to terminate infringing accounts "would expand secondary copyright liability beyond our precedents". The Court also rejected the argument that the DMCA's safe harbors imply liability for those outside them: the DMCA "merely creates new defenses". Justice Sotomayor, joined by Justice Jackson, concurred in the judgment, agreeing Cox wasn't liable for lack of intent but declining to close off other common-law routes such as aiding and abetting. The decision addresses contributory liability only.

For platforms, the holding takes the "knew and kept serving them" theory off the table for contributory infringement, while the DMCA conditions, including the repeat-infringer policy, remain the price of the safe harbor. [Repeat Infringers](/books/user-generated-platforms/copyright#repeat-infringers) covers what that means for strike practice.

### The Addiction Cases

The most consequential litigation for platform design isn't about any post. Thousands of suits by young people, families and school districts claim that features such as infinite scroll, autoplay, algorithmic recommendations and notifications were negligently designed to be addictive. They proceed in two coordinated tracks:

- **California JCCP** (Los Angeles Superior Court, Judge Carolyn Kuhl). Bloomberg Law reported in November 2025 that the court had rejected Meta's, ByteDance's, Alphabet's and Snap's last bid to avoid trial on claims that they designed their platforms to addict young users. On 25 March 2026 the jury in the first bellwether, *K.G.M.*, found Meta and YouTube negligent and awarded $3 million in compensatory damages (70% Meta, 30% YouTube) and $3 million in punitive damages, the first jury verdict in a social media addiction case; TikTok and Snap had settled before trial, according to press reports. Judgment was entered on 7 April 2026; in June Judge Kuhl denied the defendants' motions for judgment notwithstanding the verdict, finding, as MLex reported, that neither the First Amendment nor Section 230 shielded them; both companies filed notices of appeal in July 2026.
- **MDL 3047** (N.D. Cal., Judge Yvonne Gonzalez Rogers, No. 4:22-md-03047). A bellwether brought by Breathitt County School District in Kentucky was set for trial in Oakland in June 2026; the AP reported that Snap, TikTok and YouTube settled, and Meta settled on 21 May 2026, with terms undisclosed. As of October 2026 there is no federal bellwether verdict.

The design theory is why these cases matter to engineering: the evidence is product decisions. What a feed optimized for, when autoplay or a notification cadence changed, which experiments ran on minors and what they measured, and what the company knew from them are discoverable records. [How to Build It](#how-to-build-it) covers keeping them.

### Sunset Bills and State Laws

Congress has repeatedly proposed ending Section 230 to force a rewrite. As of October 2026 the live proposals are bills, not law. The **Sunset Section 230 Act** (S. 3546, introduced 17 December 2025 by Senator Graham with nine cosponsors including Senator Durbin) would repeal Section 230 two years after enactment; its only action is referral to the Commerce Committee. The **Sunset To Reform Section 230 Act** (H.R. 6746, introduced 16 December 2025 by Representative Hageman) would add a subsection stating that Section 230 "shall have no force or effect after December 31, 2026"; it has been referred to Energy and Commerce with no further action.

States regulate around Section 230 instead, and courts are sorting which laws it preempts. On 15 October 2026 the Eleventh Circuit rejected NetChoice's facial challenge to Georgia's SB 351 (which restricts under-16 social media accounts) for want of evidence under *Moody*'s standard, held that the district court erred in enjoining the law on a vagueness theory NetChoice never pleaded, and held that Section 230 doesn't preempt the law's ban on targeting minors with ads based on their personal information, because that provision "doesn't treat social-media platforms as publishers or speakers of information provided by others". The broader state-law landscape, and the court status of each law, is in [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#us-state-laws-and-their-court-status).

The direction across all of it is the same: Section 230 still protects hosting and moderating other people's posts, but courts increasingly treat recommendation, design and the platform's own conduct as outside it.

## Fraudulent Legal Requests

A legal notice is an instruction to remove speech, disclose data or both, so it attracts forgery. Reddit's transparency report for July to December 2025 describes the range: ten fraudulent government and law enforcement removal requests, including one impersonating Australia's eSafety Commissioner with a fraudulent court order, a fraudulent order claiming to come from the UK High Court of Justice, requests from a compromised Italian law enforcement email domain, and impersonations of Thai police, a Kenyan government fund and the Paraguayan Congress, mostly targeting negative business reviews; five private-party removal requests, allegedly from a US law firm, seeking removal and de-indexing of a thread about a suspected scam, each accompanied by "falsified legal documents (e.g., fake Temporary Restraining Orders)"; two inauthentic information requests; and nine fraudulent emergency disclosure requests. All were rejected and reported.

The defenses are verification steps, recorded on the notice:

- **Verify the issuer through a channel you found yourself.** Check a court order against the court's own docket; confirm an authority's request through contact details from its official site, not the ones in the message. The DSA expects orders to carry what lets a provider "verify the authenticity of the order" (Recital 35), and TCO removal orders use a fixed template; anything that doesn't match is suspect.
- **Check the domain and the channel.** A compromised government mailbox is still a compromised mailbox: requests that arrive at an unusual address, from a domain whose records changed recently, or outside the channel the authority normally uses, get the second check.
- **Watch for the pattern.** Forged orders cluster on a few targets (reviews, criticism of businesses, allegations of fraud) and ask for de-indexing as well as removal. Several requests about one thread from one claimed firm are a signal, not a coincidence.
- **Know what a DMCA notice is not.** A copyright notice isn't a court order; its deterrent is 512(f) liability for knowing material misrepresentation ([Notices](/books/user-generated-platforms/copyright#notices)). Abusive copyright notices are a validity problem, not an authenticity one.
- **Hold the clock honestly.** Verification doesn't stop a genuine deadline. My default is to verify court and regulator orders before acting unless the order's own clock (a one-hour TCO order, a threat to life) makes that impossible, in which case act on the item, verify in parallel, and reverse if the order proves false.
- **Count and report forgeries** separately in the transparency report and to the impersonated authority; Reddit does both, and [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#fraud-and-verification) covers emergency disclosure requests.

## Legal Clocks

Each regime turns knowledge into a deadline. These are the clocks a platform in this volume runs on, as of October 2026; the chapter that owns each explains it, and [How to Build It](#how-to-build-it) stores each deadline on the notice:

| Clock | Trigger | Deadline | Source | Owning chapter |
| --- | --- | --- | --- | --- |
| EU terrorist content removal | Receipt of a removal order | Remove or disable in all Member States "as soon as possible and in any event within one hour" | Reg. (EU) 2021/784 Art. 3(3) | [EU Removal Orders](/books/user-generated-platforms/violent-extremism-and-graphic-content#eu-removal-orders) |
| First TCO order notice | An authority's first order to a provider | Authority gives procedures and deadlines at least 12 hours before, except in emergencies | Reg. (EU) 2021/784 Art. 3(2) | [EU Removal Orders](/books/user-generated-platforms/violent-extremism-and-graphic-content#eu-removal-orders) |
| TCO preservation | Removal under an order or specific measures | Preserve the content and related data for six months, longer on request for review | Reg. (EU) 2021/784 Art. 6(2) | [EU Removal Orders](/books/user-generated-platforms/violent-extremism-and-graphic-content#eu-removal-orders) |
| TAKE IT DOWN Act removal | A valid removal request | "As soon as possible, but not later than 48 hours"; reasonable efforts on known identical copies | Pub. L. 119-12 § 3(a)(3) | [The TAKE IT DOWN Act](/books/user-generated-platforms/intimate-image-abuse#the-take-it-down-act) |
| CyberTipline report | Actual knowledge of an apparent violation | "As soon as reasonably possible" | 18 U.S.C. § 2258A(a)(1) | [The Reporting Duty](/books/user-generated-platforms/child-safety#the-reporting-duty) |
| CyberTipline preservation | Submission of a completed report | Preserve the reported contents for one year; longer voluntarily | 18 U.S.C. § 2258A(h) | [Preservation](/books/user-generated-platforms/child-safety#preservation) |
| DMCA takedown | Valid notice, or knowledge or red-flag awareness | "Expeditiously"; no fixed hours | 17 U.S.C. § 512(c)(1) | [Notices](/books/user-generated-platforms/copyright#notices) |
| DMCA counter-notice restore | Receipt of a valid counter-notice | Restore "not less than 10, nor more than 14, business days" after receipt, unless the claimant reports a court action | 17 U.S.C. § 512(g)(2)(C) | [Counter-Notices](/books/user-generated-platforms/copyright#counter-notices) |
| DMCA agent designation | Registration or last amendment | Expires after three years unless amended or resubmitted | 37 CFR 201.38(c)(4) | [The DMCA Agent](/books/user-generated-platforms/copyright#the-dmca-agent) |
| DSA notice handling | Receipt of an Article 16 notice | Confirm receipt and notify the decision "without undue delay"; decide in a timely, diligent manner | DSA Art. 16(4) to (6) | Gaming's [The Digital Services Act](/books/gaming/player-behavior#the-digital-services-act) |
| DSA order to act | Receipt of an Article 9 order | Inform the authority of the effect given "without undue delay" | DSA Art. 9(1) | [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#regulator-requests-and-their-clocks) |
| DSA threat to life | Awareness of information suggesting a threat to life or safety | "Promptly inform" law enforcement or judicial authorities | DSA Art. 18(1) | [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests) |
| DSA internal complaint window | A moderation decision on an online platform | Complaints accepted for at least six months after the decision | DSA Art. 20(1) | Playbook [Appeals](/docs/security/trust-and-safety#appeals) |
| Article 17 complaints | A user complaint about a disabled or removed upload | Processed "without undue delay", with human review | Directive (EU) 2019/790 Art. 17(9) | [Article 17](/books/user-generated-platforms/copyright#article-17) |

Some practical points about running them:

- **"Expeditiously" and "without undue delay" are deadlines too,** just unstated. Set an internal target per kind and record it as the clock, so the record shows what the platform held itself to; regulators and courts compare the actual time against something.
- **Business days need a calendar.** The DMCA's 10-to-14 window counts business days, which means a holiday calendar, a time zone and a rule about receipt after hours, all stored with the computed window ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Some clocks are windows, not deadlines.** A DMCA restore can't happen before day 10 or after day 14 without risk; a TCO preservation can't end before six months. Store the earliest and latest moments, not one timestamp.
- **Hours clocks need people.** A one-hour order arriving at 3 a.m. local time needs an on-call rotation and a pre-authorized action, not a queue that opens at nine. The 48-hour TIDA clock spans weekends.
- **Platform clocks are separate.** YouTube's 30-day window for a claimant to answer a Content ID dispute, or a seven-day window to remove a video before a scheduled strike, are product rules, not law; they belong in the owning chapter's data, not this table.

## How to Build It

The chapter adds one record to the core model in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model): the **legal notice**, every notice or order that carries a legal clock, whatever law it comes under. Other chapters add side tables keyed to it (copyright's notice details and claims, a sweep job per TAKE IT DOWN request, CyberTipline submissions) and never a second notices table. A notice names items; each item resolves to something on the platform and gets an outcome; the moderation case that decides each item points back at the notice.

```sql
CREATE TABLE legal_notices (             -- every notice or order that starts a legal clock
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                  TEXT NOT NULL CHECK (kind IN ('dmca_takedown', 'dmca_counter',
                          'tida_removal', 'dsa_notice', 'tco_removal_order', 'court_order',
                          'regulator_order', 'other')),
  responds_to_notice_id UUID REFERENCES legal_notices (id),  -- a counter-notice's takedown,
                                         -- an appeal of an order, a withdrawal
  notifier_type         TEXT NOT NULL CHECK (notifier_type IN ('rights_holder', 'agent',
                          'individual', 'trusted_flagger', 'authority', 'court',
                          'regulator', 'uploader')),
  notifier_name         TEXT NOT NULL,
  notifier_contact      JSONB NOT NULL,  -- as given: email, address, phone
  on_behalf_of          TEXT,            -- the rights holder or depicted person, if not the notifier
  issuer_reference      TEXT,            -- docket, order number, authority reference
  jurisdiction          TEXT NOT NULL,   -- ISO 3166-1 alpha-2, or 'EU'
  legal_basis           TEXT NOT NULL,   -- '17 USC 512(c)(3)', 'DSA Art 16', 'Reg 2021/784 Art 3'
  channel               TEXT NOT NULL CHECK (channel IN ('web_form', 'designated_agent',
                          'abuse_desk', 'support', 'authority_portal', 'api', 'postal')),
  received_at           TIMESTAMPTZ NOT NULL,  -- earliest provable receipt on any channel
  clock_rule_id         UUID,            -- the rules-as-data rule that computed the clock
  clock_rule_version    INT,
  clock_inputs          JSONB,           -- time zone, business-day calendar, extensions granted
  earliest_action_at    TIMESTAMPTZ,     -- windows: a DMCA restore can't happen before day 10
  due_at                TIMESTAMPTZ,     -- latest compliant moment; internal target if the law
                                         -- says only "expeditiously"
  validity              TEXT NOT NULL DEFAULT 'pending' CHECK (validity IN ('pending',
                          'valid', 'deficient', 'invalid', 'not_actionable')),
  validity_checks       JSONB,           -- element by element; kind side tables add detail
  authenticity          TEXT NOT NULL DEFAULT 'not_required' CHECK (authenticity IN
                          ('not_required', 'pending', 'verified', 'failed')),
  authenticity_method   TEXT,            -- 'docket_lookup', 'callback_official_contact', ...
  validated_by          UUID REFERENCES accounts (id),  -- staff account
  validated_at          TIMESTAMPTZ,
  status                TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received',
                          'awaiting_information', 'actioned', 'partially_actioned',
                          'declined', 'withdrawn', 'closed')),
  actioned_at           TIMESTAMPTZ,     -- when the duty was met; compared with due_at
  notify_uploader       BOOLEAN NOT NULL DEFAULT TRUE,  -- false under a nondisclosure order
  nondisclosure_until   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind <> 'dmca_counter' OR responds_to_notice_id IS NOT NULL),
  CHECK (validated_at IS NULL OR validity <> 'pending'),
  CHECK (authenticity <> 'failed' OR status IN ('declined', 'closed')),
  CHECK (kind NOT IN ('court_order', 'regulator_order', 'tco_removal_order')
         OR authenticity <> 'not_required'),
  CHECK ((actioned_at IS NULL) OR status IN ('actioned', 'partially_actioned', 'closed')),
  CHECK (earliest_action_at IS NULL OR due_at IS NULL OR earliest_action_at <= due_at)
);

CREATE TABLE legal_notice_items (        -- each thing a notice names, as given and as found
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_notice_id  UUID NOT NULL REFERENCES legal_notices (id),
  locator          TEXT NOT NULL,        -- the URL or identifier exactly as written
  subject_type     TEXT CHECK (subject_type IN ('account', 'profile', 'community',
                     'content_item', 'media_asset', 'message')),
  subject_id       UUID,
  content_revision_id UUID REFERENCES content_revisions (id),  -- the version that was named
  resolution       TEXT NOT NULL DEFAULT 'pending' CHECK (resolution IN ('pending',
                     'resolved', 'not_found', 'not_hosted_here', 'ambiguous')),
  case_id          UUID REFERENCES moderation_cases (id),
  outcome          TEXT CHECK (outcome IN ('removed', 'disabled_in_territories',
                     'restored', 'no_action', 'already_removed')),
  territories      CHAR(2)[],            -- where access was disabled, when not everywhere
  outcome_at       TIMESTAMPTZ,
  CHECK ((resolution = 'resolved') = (subject_id IS NOT NULL)),
  CHECK ((outcome IS NULL) = (outcome_at IS NULL)),
  CHECK (outcome <> 'disabled_in_territories' OR territories IS NOT NULL)
);

CREATE INDEX legal_notices_open_by_due
  ON legal_notices (due_at) WHERE status IN ('received', 'awaiting_information');

ALTER TABLE moderation_cases
  ADD COLUMN legal_notice_id UUID REFERENCES legal_notices (id),
  ADD CONSTRAINT moderation_cases_legal_request_has_notice
    CHECK (source <> 'legal_request' OR legal_notice_id IS NOT NULL);
```

Notes on the sketch:

- **One table, many laws.** `kind` and `legal_basis` say which regime a notice is under; the clock rule, validity checks and side tables follow from them. A DSA notice of illegal hate speech, a TAKE IT DOWN Act request and a DMCA takedown share intake, item resolution, case linking, clocks and reporting, and differ only in what makes them valid and how fast they're due. [Copyright at Scale](/books/user-generated-platforms/copyright#how-to-build-it) adds `copyright_notice_details`, the [TAKE IT DOWN Act](/books/user-generated-platforms/intimate-image-abuse#how-to-build-it) chapter adds an identical-copy sweep per request, and [EU Removal Orders](/books/user-generated-platforms/violent-extremism-and-graphic-content#how-to-build-it) are `tco_removal_order` rows.
- **Responses are notices.** A counter-notice is a `dmca_counter` row with `responds_to_notice_id` pointing at the takedown; its own clock is the 10-to-14 business-day restore window (`earliest_action_at`, `due_at`). A claimant's notice that it has sued, a withdrawal, or an authority's reconsideration is recorded against the notice it answers, so the chain is a query.
- **Clocks are computed once and stored.** On receipt, the clock rule for the kind and jurisdiction computes `due_at` (and `earliest_action_at` for windows) from `received_at`, a time zone and a business-day calendar, and the rule's ID, version and inputs are stored beside it ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). Example rules: `tco_removal_order` is receipt plus one hour; `tida_removal` is receipt of a valid request plus 48 hours; `dmca_counter` is receipt plus 10 and 14 US business days; `dsa_notice` and `dmca_takedown` carry an internal target per category. A correction to a holiday calendar doesn't move a deadline already promised; a deliberate migration does, with a record.
- **Validity is separate from the decision.** A notice can be valid and the item still not removed (it's lawful, or it isn't there), or deficient and the platform still act on its own policy. `validity` records what the law cares about (could this notice confer knowledge); the case's `moderation_decisions` row records what the platform decided and why ([Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions)).
- **Authenticity is required for orders.** Court, regulator and TCO orders can't be closed as valid without an authenticity result and method; a failed check declines the notice and goes into the fraud count. A private claimant's notice doesn't need authentication, only validity.
- **Items resolve to revisions.** The locator is kept exactly as written; the resolved subject points at the revision that was live when the notice arrived, so an edit after receipt doesn't erase what was named ([Revisions are facts](/books/user-generated-platforms/platform-business#the-core-data-model)). Items not found or hosted elsewhere get an outcome too, because a notice is closed only when every item has one.
- **Cases point at notices.** Each item that needs a decision opens or joins a `moderation_cases` row with `source = 'legal_request'` (or `trusted_flagger` for a trusted flagger's DSA notice) and `legal_notice_id` set; reports and proactive detections about the same item group into the same case ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)), so the platform doesn't decide one item twice. Demands for user data are not notices: subpoenas, warrants and preservation requests are `legal_requests` in [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#how-to-build-it), linked to a notice when one order asks for both.
- **Territory is an outcome.** An order limited to one country, or content illegal in one jurisdiction only, is disabled there and nowhere else; the item records where, and delivery enforces it on the request ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#geoblocking-withholding-and-withdrawal) covers geoblocking).
- **Nondisclosure is a field, not a habit.** Some orders forbid telling the uploader; `notify_uploader = false` with an end date suppresses the notice to the user and the statement of reasons until it lapses, and the reason is recorded. Everything else gets the normal notice.
- **Litigation readiness uses records that already exist.** The addiction cases put product design into evidence, so the design has to be reconstructable: ranking, notification and autoplay rules as versioned [rules as data](/docs/architecture/rules-as-data#effective-dates-and-versions) with effective dates, experiment assignments and results, and the decision records above. When a suit or a credible threat of one arrives, counsel's hold becomes `legal_holds` rows with `reason = 'litigation'` over the rule versions, experiments, cases and accounts named ([Deletion, Claims and Legal Holds](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds)), and erasure and retention jobs skip them until release.
- **Events:** `legal_notice.received`, `legal_notice.validated`, `legal_notice.authenticity_failed`, `legal_notice.due_soon`, `legal_notice.overdue`, `legal_notice.actioned`, `legal_notice.item_restored` and `legal_notice.closed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the on-call pager, the moderation console, notices to uploaders and claimants, and transparency counts. A job ([Background Jobs](/docs/architecture/background-jobs#scheduling)) emits `due_soon` and `overdue` from the `due_at` index.

## Auditing

- **Every notice's timeline.** Received (where, when, by which channel), validated (by whom, element by element), authenticated (how), each item resolved and decided, actioned, forwarded, countered, restored and closed, with the clock rule and its inputs. "Expeditiously" is argued from this record.
- **Time to action against the clock,** per kind, jurisdiction and notifier type. A platform that meets a one-hour clock 99% of the time needs to know which 1% missed and why.
- **Declines with reasons.** Deficient and invalid notices, fair-use declines, forged orders and notices about content not hosted here, each with the reason code, because a decline is the decision most likely to be litigated or complained about.
- **Notifier behavior.** Notices, validity and decline rates per notifier, which shows both trusted flaggers worth prioritizing and claimants abusing the process ([Notices](/books/user-generated-platforms/copyright#notices) covers 512(f)).
- **Holds tied to litigation,** with the subjects held, the date, counsel's reference and the release, so a deletion that happened before a hold is distinguishable from one that happened after.

Transparency reporting (Reddit's counts of notices, actionability rates and fraudulent requests are the template) is a query over these rows; [Transparency Reporting](/books/user-generated-platforms/transparency-reporting#making-the-report-a-query) covers the formats. The mechanics of append-only history are in [Audit Trails](/docs/architecture/audit-trails#amend-don-t-overwrite).

## What This Means for the System You Build

- **Know which shield covers each claim:** Section 230 for most claims about others' content in the US, the DMCA for copyright, the DSA's conditional exemption in the EU, and none for your own design, words and recommendations where courts have started to say so.
- **Treat knowledge as a timestamp.** Record the earliest provable receipt of every notice on every channel, and route misdirected notices into the notices pipeline.
- **Validate notices element by element** and keep the result, because a deficient notice is the evidence that knowledge didn't arise.
- **Resolve notices to items and revisions,** and close a notice only when every item has an outcome.
- **Compute every legal clock once, from a versioned rule,** with its time zone and business-day calendar, and staff the hours-scale clocks around the clock.
- **Verify court and regulator orders independently** before acting where the clock allows, and count forgeries.
- **Moderate proactively without fear of losing the safe harbors,** and attach the reporting path to whatever detection finds.
- **Keep design decisions reconstructable:** versioned ranking and notification rules, experiment records, and legal holds over them when litigation starts.
- **Date every legal status.** The litigation in this chapter is moving; re-check it before relying on it.

## References

**Statutes and regulations**

- [47 U.S.C. § 230](https://www.law.cornell.edu/uscode/text/47/230), the text of (c)(1) and (c)(2), the definitions in (f)(2) to (f)(4), the (e) exceptions including the FOSTA amendment in (e)(5)
- [17 U.S.C. § 512](https://www.law.cornell.edu/uscode/text/17/512), the four safe harbors, the 512(c) conditions, substantial compliance in (c)(3)(B), the counter-notice schedule in (g)(2)(C), 512(f), 512(i) and 512(m)
- [37 CFR 201.38](https://www.law.cornell.edu/cfr/text/37/201.38), designated agent contents and three-year expiry
- [18 U.S.C. § 2258A](https://www.law.cornell.edu/uscode/text/18/2258A), the actual-knowledge trigger, no duty to scan, one-year preservation and voluntary extension
- [TAKE IT DOWN Act, Pub. L. 119-12](https://www.govinfo.gov/content/pkg/PLAW-119publ12/html/PLAW-119publ12.htm), the 48-hour removal deadline and the one-year deadline to establish a process (approved 19 May 2025)
- [Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065), Articles 6, 7, 8, 9, 16, 18 and 20; Recitals 11, 17, 18, 22, 26, 30, 35, 36 and 41
- [Regulation (EU) 2021/784 (Terrorist Content Online)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32021R0784), the one-hour removal in Article 3(3), the 12-hour first-order notice in Article 3(2), six-month preservation in Article 6(2)
- [Directive (EU) 2019/790 (DSM Directive)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790), Article 17 liability for content-sharing services and complaint handling in Article 17(9)

**Courts**

- [Twitter, Inc. v. Taamneh, 598 U.S. 471 (2023)](https://www.law.cornell.edu/supremecourt/text/21-1496), unanimous; aiding and abetting standard; algorithms "agnostic as to the nature of the content"
- [Gonzalez v. Google LLC (2023), per curiam](https://www.supremecourt.gov/opinions/22pdf/21-1333_6j7a.pdf), vacated and remanded without addressing Section 230 (18 May 2023)
- [Moody v. NetChoice, LLC (2024)](https://www.law.cornell.edu/supremecourt/text/22-277), curating others' speech as protected expression; the facial-challenge standard (1 July 2024)
- [Anderson v. TikTok, Inc., No. 22-3061 (3d Cir. 2024)](https://www2.ca3.uscourts.gov/opinarch/223061p.pdf), first-party versus third-party speech, reversed in part, vacated in part and remanded; Judge Matey's partial concurrence on distributor liability (27 August 2024)
- [Cox Communications, Inc. v. Sony Music Entertainment, No. 24-171 (2026)](https://www.law.cornell.edu/supremecourt/text/24-171), the inducement-or-tailored test, knowledge insufficient, the DMCA as defenses only, reversed and remanded (25 March 2026); the $1 billion verdict and the Fourth Circuit's knowledge standard; Justice Thomas for seven Justices; Justice Sotomayor, joined by Justice Jackson, concurring in the judgment and leaving aiding and abetting open
- [Zeran v. America Online, Inc., 129 F.3d 327 (4th Cir. 1997)](https://law.resource.org/pub/us/case/reporter/F3/129/129.F3d.327.97-1523.html), distributor liability "merely a subset, or a species, of publisher liability" and barred by § 230 (12 November 1997)
- [Viacom International, Inc. v. YouTube, Inc., 676 F.3d 19 (2d Cir. 2012)](https://static.case.law/f3d/676/cases/0019-01.json), whether YouTube had "actual knowledge or awareness of specific infringing activity" (5 April 2012; Caselaw Access Project text)
- [NetChoice v. Attorney General, State of Georgia, No. 25-12436 (11th Cir. 2026)](https://media.ca11.uscourts.gov/opinions/pub/files/202512436.pdf), the facial challenge under *Moody*, the vagueness theory the district court raised on its own, the advertising provision not preempted by § 230, preliminary injunction vacated (15 October 2026)

**The addiction cases**

- [In re Social Media Adolescent Addiction, MDL No. 3047, joint statement of 22 May 2026 (ECF 3066)](https://storage.courtlistener.com/recap/gov.uscourts.cand.401490/gov.uscourts.cand.401490.3066.0_1.pdf), Meta's JCCP update: judgment entered against Meta and YouTube in *K.G.M.* on 7 April 2026, bonds, motions for judgment notwithstanding the verdict and new trial, Judge Kuhl
- [Bloomberg Law: Social media giants must stand trial on addiction claims](https://news.bloomberglaw.com/ip-law/social-media-giants-must-stand-trial-on-youth-addiction-claims), the November 2025 ruling sending the design claims to trial (reported; the order itself not opened)
- [Al Jazeera: Jury finds Meta, YouTube liable for social media addiction](https://www.aljazeera.com/news/2026/3/26/jury-finds-meta-youtube-liable-for-social-media-addiction-what-we-know), the 25 March 2026 verdict, damages and split, TikTok and Snap settlements (reported)
- [MLex: California judge declines to overturn social media addiction verdict](https://www.mlex.com/mlex/articles/2487807/california-judge-declines-to-overturn-social-media-addiction-verdict), post-trial motions denied, Section 230 and First Amendment rejected (reported 9 June 2026)
- [NY1 (AP): YouTube joins Meta in appealing a jury verdict](https://ny1.com/nyc/all-boroughs/ap-top-news/2026/07/15/youtube-joins-meta-in-appealing-a-jury-verdict-that-faulted-them-for-users-social-media-addiction), both companies' notices of appeal in Los Angeles County Superior Court (reported 15 July 2026)
- [WTOP (AP): Meta settles social media addiction case brought by rural Kentucky school district](https://wtop.com/news/2026/05/meta-settles-social-media-addiction-case-brought-by-rural-kentucky-school-district/), the Breathitt County bellwether, other defendants' settlements, undisclosed terms (reported 21 May 2026)

**Congress**

- [S. 3546, Sunset Section 230 Act: text](https://www.congress.gov/119/bills/s3546/BILLS-119s3546is.htm), repeal effective two years after enactment, sponsors (introduced 17 December 2025)
- [S. 3546: all actions](https://www.congress.gov/bill/119th-congress/senate-bill/3546/all-actions), referral to Commerce as the only action
- [H.R. 6746, Sunset To Reform Section 230 Act: text](https://www.congress.gov/119/bills/hr6746/BILLS-119hr6746ih.htm), no force or effect after 31 December 2026 (introduced 16 December 2025)
- [H.R. 6746: all actions](https://www.congress.gov/bill/119th-congress/house-bill/6746/all-actions), referral to Energy and Commerce as the only action

**Platforms**

- [Reddit: Transparency Report, July to December 2025](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), copyright notices and actionability, invalid notices, fraudulent government, private-party and emergency requests, fake TROs (Reddit's own PDF; copy hosted by TorrentFreak, as redditinc.com blocks automated access)
- [Twitch: DMCA Guidelines](https://legal.twitch.com/en/legal/dmca-guidelines/), the go-between role, three-strike repeat infringer policy, disputed notices not counted
- [YouTube Help: Copyright strike basics](https://support.google.com/youtube/answer/2814000?hl=en), three strikes in 90 days, scheduled removals, claims versus strikes
- [Discord: Copyright & IP Policy](https://support.discord.com/hc/en-us/articles/4410339349655), notice elements, counter-notice restoration "10 to 14 business days or more", false reports
- [Pinterest: Copyright](https://policy.pinterest.com/en/copyright), reinstatement unless a court or Copyright Claims Board action, up to 14 business days, strikes
- [Tumblr: Terms of Service](https://www.tumblr.com/policy/en/terms-of-service), DMCA policy, counter-notification, repeat infringer termination
- [Kick: DMCA Policy](https://kick.com/dmca-policy), notice and counter-notice elements, repeat infringers
- [Imgur: Terms of Service](https://imgur.com/tos), DMCA agent, registration number request, unregistered works

**Reference**

- [Rules as Data: Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored), storing computed deadlines with their inputs
- [Trust & Safety](/docs/security/trust-and-safety), cases, decisions, notices and appeals
