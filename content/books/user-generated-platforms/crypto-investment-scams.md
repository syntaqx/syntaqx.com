+++
title = "Crypto Investment Scams & Impersonation"
nav_title = "Crypto Investment Scams"
description = "Relationship investment scams across platforms, scam centers, celebrity-bait ads and fake support, the law on fraudulent ads, signals, warnings and referral."
category = "User-Generated Platforms Industry"
order = 1848
part = "Trust and Safety"
tags = ["trust-and-safety", "fraud", "scams", "crypto", "impersonation", "advertising"]
+++

The scam that costs Americans the most money doesn't happen on any one platform. It starts with a wrong-number text, a dating match, a LinkedIn connection or a friendly comment; it moves to an encrypted messenger; it ends on a trading site the scammer controls, with the victim's savings converted to cryptocurrency and sent to an address nobody can reverse. Cryptocurrency investment fraud was the largest source of reported losses in the FBI's 2025 Internet Crime Report, and the victims' side of that money (buying crypto by card on instruction, and the disputes that follow) is in the Payments volume's [Crypto Purchases](/books/payments/payments-by-vertical#crypto-purchases). This chapter is the platform's side: the account that made first contact, the ad that carried a celebrity's face, the conversation that moved off the platform, and the report that came in too late.

Two kinds of abuse share the chapter because they share the money and the defenses. **Relationship investment scams** (widely called "pig butchering") build trust over weeks before any pitch, so no single message looks like fraud. **Crypto impersonation** (fake celebrity endorsements in ads and posts, fake support accounts, fake giveaways and fake recovery services) borrows trust instead of building it. Both are run at industrial scale by organized groups, many from compounds in Southeast Asia staffed by trafficked workers, which is why the platform's adversary behaves like a business with a sales funnel rather than a lone fraudster. This chapter covers how the scam runs and where each platform sees it, the industry behind it, impersonation, the law on fraudulent ads and scams, signals, friction, verifying financial advertisers, reporting and referral, and the cost of getting it wrong. It extends the spam machinery of [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots) (account farms, linked accounts, clusters), the stranger controls of [Real-Time Chat](/books/user-generated-platforms/real-time-chat#direct-messages-and-the-stranger-problem), and ad review from [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#moderating-the-ads). Payment diversion on marketplaces is [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud#fake-listings-and-payment-diversion).

## How the Platforms Do It

| Platform | What it has published | Controls it describes |
| --- | --- | --- |
| **Meta** (Facebook, Instagram, Messenger, WhatsApp) | Over two million accounts linked to scam centers taken down in 2024; over 6.8 million WhatsApp accounts linked to scam centers banned in the first half of 2025; over 159 million scam ads removed in 2025, 92% before anyone reported them, and 10.9 million Facebook and Instagram accounts associated with criminal scam centers | Facial recognition against celebrity-bait ads; a safety overview when a stranger adds you to a WhatsApp group; warnings on screen sharing with unknown contacts; AI scam review of Messenger chats; a target of 90% of ad revenue from verified advertisers by the end of 2026 |
| **Google** (Ads, YouTube) | Over 700,000 advertiser accounts permanently suspended for public figure impersonation in 2024; 602 million ads and 4 million accounts associated with scams in 2025 | Public figure impersonation as an "unacceptable business practice" with suspension "upon detection and without prior warning"; financial services verification by country; certification for crypto advertisers |
| **LinkedIn** | 99.7% of fake accounts stopped before a member report (July to December 2025) | A message warning: "This sender appears to be trying to move the conversation off LinkedIn"; Report moves the conversation to spam at once |
| **Match Group** (Tinder, Hinge) | Nearly 5 million spam and bot accounts blocked in the first quarter of 2023 at sign-up or before a user saw them | Pop-up safety tips when certain language is detected; Hinge's in-app message never to "take investment advice from someone they've never met"; a cofounder of the Tech Against Scams coalition |
| **Telegram** | 28,770,897 groups and channels blocked in 2026 as of October, with no scam category broken out | A public SCAM or FAKE label on accounts, bots and communities that impersonate or defraud; @NoToScam for impersonation reports |
| **YouTube** | Hijacked creator channels "rebranded for cryptocurrency scam live-streaming" (Google TAG, 2021), over 99% detected and auto-recovered | Impersonation policy covering AI-generated likeness; 2-Step Verification required for monetizing creators |

What these have in common is that every platform sees one stage of a scam that runs across several. Meta's own description is that these scams "can start on dating apps, text message, email, social media or messaging apps, then ultimately move to scammer-controlled accounts on crypto apps or scam websites." The ad platform sees the lure, the social network sees the persona, the messenger sees the grooming and the exchange sees the money; no one sees the whole, which is why cross-platform signal sharing and law enforcement referral are part of the design rather than an afterthought.

## How the Scam Runs

FinCEN's 2023 alert (FIN-2023-Alert005) is the standard description, and its 2026 follow-ups confirm the shape across 33,904 suspicious activity reports filed between September 2023 and December 2025, involving about $12.7 billion. The stages, and where a platform sees each:

| Stage | What happens | Who sees it |
| --- | --- | --- |
| **Contact** | Initial contact "through text messages, direct messages on social media, or other communication tools and platforms, usually under the guise of accidentally reaching a wrong number or trying to re-establish a connection with an old friend"; FinCEN's list adds professional networking and dating sites | Social networks, dating apps, SMS, professional networks |
| **Persona** | A profile "which showcases wealth and an enviable lifestyle"; weeks of friendly or romantic conversation with no pitch | The platform hosting the profile |
| **Migration** | Scammers "frequently used one method to make initial contact with the victim, and then shifted to another method of communication, typically an encrypted messaging service" (FinCEN, 2026) | The first platform sees the request to move; the second sees everything after |
| **Pitch** | Investment "advice" from the contact, an "investment club" from a social media ad (IC3, July 2025), or a group chat of fake fellow investors | Messengers, groups, ads |
| **Platform** | Investment sites or apps "designed to appear legitimate, but which are fraudulent and ultimately controlled or manipulated by the scammer," sometimes sideloaded rather than from an app store | Hosts, CDNs, registrars, app stores ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks)) |
| **Escalation** | Fabricated "extraordinary returns"; a small withdrawal allowed "to further build the victim's confidence"; loans offered to invest more (IC3) | Exchanges and banks, which see deposits grow |
| **Exit** | Withdrawing triggers "purported taxes or early withdrawal fees," then the scammer "will abruptly cease communication" | The victim, often reporting only now |
| **Recovery** | A second scam offering to recover the losses: fake law firms, fake IC3 staff, fake "fund recovery" | Social networks, victim support groups, messengers |

Three details matter for anyone building defenses. **Contact is cheap and scripted;** the IC3 report notes that generative AI lets scammers "quickly generate thousands of conversations that appear different to each prospective victim," so content similarity across messages is weaker evidence than it was. **The platform that hosted first contact rarely sees the fraud:** some reports show scammers "communicated with their targets entirely using messaging apps, forgoing the use of investment platforms," and many move to a messenger within days. **The recovery stage targets people who already reported:** the IC3 counted 10,516 complaints about recovery scams in 2025 with $1.4 billion in losses (including, it notes, losses from the earlier scams), and warned that scammers create "female persona profiles on social media networking sites and join groups for financial fraud victims," then hand victims to a fake IC3 official on Telegram. A victim support group is a target list.

The FTC's data shows how much starts on social media. Nearly 30% of people who reported losing money to a scam in 2025 said it started on social media, with $2.1 billion lost; more than half of that, $1.1 billion, went to investment scammers; and nearly 60% of people who lost money to a romance scam said it started on a social media platform, with Facebook reported most and WhatsApp and Instagram "a distant second and third."

**The name.** "Pig butchering" (from the Chinese term for fattening a pig before slaughter) is still the common name, and FinCEN's 2023 alert used it. INTERPOL urged an end to the term in December 2024 because it shames victims; FinCEN now uses "digital asset investment scam" and the FBI "cryptocurrency investment fraud." My default is the neutral term in anything a victim reads (warnings, report forms, notices) and whatever term the classifier and policy teams find clearest internally, recorded once as a synonym.

## The Industry Behind It

The scale is industrial, and the industry is documented in US enforcement records. FinCEN's September 2026 alert says reported US losses to these scams rose "from $907 million in 2021 to $7.2 billion in 2025," that "criminal gangs have trafficked hundreds of thousands of people to these centers," and that operations have spread "to South Asia, Pacific Islands, Africa, the Middle East, and South America." The United Nations documents the labor behind it. The UN Human Rights Office reported in August 2023 that credible sources indicate "at least 120,000 people across Myanmar" may be held and forced to carry out online scams, with estimates in Cambodia around 100,000, and that the centers generate billions of dollars a year. UNODC's *Inflection Point* (April 2025) puts the industry at hundreds of industrial-scale scam centers "generating just under US $40 billion in annual profits," with Asian-led centers found in Africa, South Asia, the Middle East and Pacific islands as crackdowns displace them.

The actions that bear on platforms:

| Date | Action | What it says about platforms and infrastructure |
| --- | --- | --- |
| May 5, 2025 | OFAC designates the Karen National Army, a Burmese militia, as a transnational criminal organization | Profits by "leasing land it controls to other organized crime groups" and selling utilities to scam operations |
| May 29, 2025 | OFAC sanctions Funnull Technology; FBI FLASH on its infrastructure | Funnull "is linked to the majority of virtual currency investment scam websites reported to the FBI," buys "IP addresses in bulk from major cloud services companies," and ran 548 CNAMEs linked to over 332,000 domains, moving hundreds of domains between IPs at once |
| October 14, 2025 | OFAC and the UK sanction 146 Prince Group targets; DOJ indicts its chairman and files to forfeit about 127,271 bitcoin; FinCEN's Section 311 final rule cuts Huione Group off from the US financial system | Victims reached "through messaging or social media applications"; Huione laundered at least $4 billion between August 2021 and January 2025, and its Haowang Guarantee marketplace sold illicit services |
| November 2025 | DOJ forms the Scam Center Strike Force | The IC3 says it targets US-based infrastructure, "which includes U.S. internet service providers and social media accounts scammers use" |
| April 23, 2026 | Strike Force actions | More than 503 web domains identified through the FBI's victim-notification work; a "first-of-its-kind seizure of a Telegram channel with more than 6,000 followers" used to recruit workers; Meta and Microsoft among companies that "voluntarily took internal investigative measures" |
| June 23, 2026 | DOJ seizes a cloud computing account used by Huione subsidiaries | The account helped operate Huione Guarantee, which "operated Telegram channels" |

The Strike Force's own page reports $1,006,460,156.82 in cryptocurrency restrained as of October 2026.

**Guarantee marketplaces are the supply chain.** FinCEN describes them as "online marketplaces that typically operate as networks of Chinese-language chat groups on the Telegram messaging platform," selling "online social media account creation and verification, social media targeting, and mass phishing services," and warns that "guarantee marketplaces can quickly reconstitute after takedowns simply by creating new chat groups." For a social platform that means its verified accounts, aged accounts and ad accounts are inventory on someone else's marketplace ([Account Farms](/books/user-generated-platforms/spam-and-bots#account-farms)). For a messaging platform hosting the marketplace, removal works only as a continuing practice keyed on the operators, not the groups.

**Sanctions reach the platform's own money.** A designated person can't be an advertiser, a creator paid out, or a customer of a hosting or CDN business with US exposure; the screening machinery is [Sanctions Screening and Background Checks](/books/user-generated-platforms/marketplace-fraud#sanctions-screening-and-background-checks), and advertiser onboarding is one more trigger for it.

## Impersonation

Impersonation borrows trust instead of building it, and it takes four forms on platforms.

**Celebrity-bait ads.** An ad shows a famous person (increasingly an AI-generated video of them) endorsing a trading platform or a coin. Google's misrepresentation policy says "Public figure impersonation isn't allowed under the unacceptable business practices policy," with "Using AI-generated videos of popular YouTubers to mislead people into thinking they endorse a 'Get rich quick' scheme" as its example, and suspends the advertiser "upon detection and without prior warning"; it reported permanently suspending over 700,000 advertiser accounts for it in 2024. Meta compares faces in a suspected scam ad "to the public figure's Facebook and Instagram profile pictures," blocks the ad if it confirms a match and a scam, and says "We immediately delete any facial data generated from ads for this one-time comparison." Public figures are enrolled with an in-app notice and can opt out; Meta extended the program to the UK and EU in March 2025 and to impersonating accounts later that year, reports "nearly 500,000 public figures" protected, and says user reports of celebrity-bait ads per ad impression fell 22% globally in the first half of 2025.

**Fake support accounts.** An account named for an exchange's or a wallet's support team answers people who post about a problem, then asks for a seed phrase or a "verification" transfer. Meta reported action on "over 21,000 Pages and accounts pretending to be customer support" in 2025 through October; YouTube's scams policy covers fake customer support contact information. Replies to public complaints are the delivery channel, so the detector is a new account with a brand-like name replying to many strangers who mention the brand.

**Giveaway scams.** "Send 1 coin, get 2 back" in a hijacked account's post or live stream. Google's Threat Analysis Group reported in 2021 that hijacked YouTube channels were "rebranded for cryptocurrency scam live-streaming," traded for "$3 USD to $4,000 USD," and that it had "detected and auto-recovered over 99% of hijacked channels." The defense is mostly [Takeover Defense](/books/user-generated-platforms/accounts-and-identity#takeover-defense): a channel that changes its name, avatar and content type at once after a new-device login is a takeover until proven otherwise.

**Fake authorities and recovery services.** The IC3 says it "will never directly communicate with individuals via phone, email, social media, phone apps, or public forums," and warned in August 2025 that "There are no law firms which are officially authorized partners of US Government agencies." Accounts claiming to be a police unit, a regulator or a recovery firm that contact victims first are impersonation by definition.

Every form is a badge problem as much as a detection problem: a paid checkmark that looks like verification sells credibility to impersonators, which is the European Commission's finding against X ([Verification and Badges](/books/user-generated-platforms/accounts-and-identity#verification-and-badges)). Telegram's answer is the inverse badge, a public SCAM or FAKE label on a profile that "engage[s] in impersonation or attempt[s] to defraud other users," with "critical restrictions" approved by a human moderator.

## The Law

No regime makes a platform liable for a user's scam the way a bank can be liable for a payment; the law reaches platforms through ads, systemic risk and new sector duties.

**The EU.** The DSA requires every platform showing ads to say on whose behalf an ad is presented and who paid for it (Article 26), requires very large platforms to keep a searchable ad repository (Article 39) and to assess systemic risks including illegal content and consumer protection (Article 34) ([Very Large Online Platforms](/books/user-generated-platforms/regulators-and-enforcement#very-large-online-platforms)). Notice and action (Article 16) applies to scam ads like any illegal content, and it's being tested: on May 21, 2026, BEUC and 29 member organizations filed DSA complaints against Meta, TikTok and Google after consumer groups in 13 countries reported nearly 900 suspected financial scam ads between December 2025 and March 2026, of which the platforms took down 27% and rejected or ignored 52%.

**The UK.** The Online Safety Act gives Category 1 services a **fraudulent advertising duty** (section 38): "proportionate systems and processes designed to prevent individuals from encountering content consisting of fraudulent advertisements," to minimise how long such content is present and to "swiftly take down" it once aware; Category 2A search services have the matching duty for search results (section 39). Both have been in force since January 10, 2024, and the terms of service must describe any proactive technology used. Fraud Act offences and carrying on a regulated financial activity without authorisation are priority offences (Schedule 7, paragraphs 33 and 35), so scam posts and messages fall under the illegal content duties every user-to-user service has. Ofcom opened its consultation on Fraudulent Advertising Codes of Practice on July 10, 2026 (closing October 2, 2026), with separate draft codes for Category 1 and Category 2A services that apply to paid-for advertising, not user-generated content: nearly 40 measures, including checking that people setting up advertising accounts work for who they claim to, checking that anyone advertising banking or investment services is legally allowed to (such as by FCA registration), banning bad actors who post scam ads and preventing them from creating new accounts, securing accounts against hijacking, rigorously testing AI ad-creation tools and a dedicated channel for trusted bodies such as law enforcement to flag scam ads for swift removal. A separate consultation on proactive technology to filter fraudulent ads was announced for autumn 2026, and Ofcom plans its final statement by mid-2027 at the latest; the codes take effect once approved by Parliament. Which services are Category 1 and 2A is in [The UK Online Safety Act](/books/user-generated-platforms/regulators-and-enforcement#the-uk-online-safety-act).

**Australia.** The Scams Prevention Framework Act 2025 (assented February 20, 2025) lets the government designate sectors whose businesses must meet six principles: governance, prevent, detect, report, disrupt and respond. Its terms that matter for platforms: actionable scam intelligence goes to the ACCC within periods set by rules; a business that takes proportionate disruptive action in good faith while investigating is protected from civil liability for up to 28 days, and must "promptly" reverse it if the activity proves not to be a scam; and a tier 1 breach by a company carries up to the greatest of 159,745 penalty units, three times the benefit, or 30% of adjusted turnover. The Regulated Sectors Designation 2026 (made May 22, 2026) designates banking, telecommunications and digital platforms, and its digital platform services are three: instant messaging, advertising served with general internet search results, and social media, with dating and matchmaking services carved out of social media. It phases them in: until September 1, 2026 only the sector code provisions apply, from September 1 membership of the SPF dispute resolution scheme is added, and the rest of the framework applies from March 31, 2027.

**The US.** The FTC's Government and Business Impersonation Rule (16 CFR Part 461, effective April 1, 2024) lets it seek civil penalties and redress from impersonators, and on September 24, 2026 the Commission voted 2-0 to seek comment on extending it to platforms: whether "ad-optimization tools and services offered by social media, search engines and other digital marketplace platforms" further impersonation scams, and whether to require measures such as "vetting advertisers, monitoring posted ads, investigating suspected impersonation scam ads." State litigation has started: Rhode Island's Attorney General sued Meta in October 2026 under state consumer protection law over scam ads, including impersonations of a bank executive that led users to "scam stock trades on WhatsApp," following a similar suit by Santa Clara County in May 2026 (as reported; the allegations are untested, and Meta called the suit "unfounded"). Section 230 still shields most hosting of users' posts ([Section 230](/books/user-generated-platforms/hosting-liability#section-230)); the cases target the platform's own ad tools and revenue.

## Signals

No single message in a relationship scam is a violation; the conversation is. Signals come from four places, and only their combination should drive action:

- **The account.** Age, how it was created and from where, profile photos found elsewhere (stock or stolen images, AI-generated faces), a wealthy-lifestyle persona with few real connections, LinkedIn's "incomplete" profile with "low connection counts," and links to accounts already in a cluster ([Linked Accounts](/books/user-generated-platforms/marketplace-fraud#linked-accounts), [Account Links](/books/user-generated-platforms/spam-and-bots#how-to-build-it)). Scam-center accounts come in networks: the same devices, networks, scripts and photo sets across hundreds of personas, which is why Meta reports its takedowns by scam center rather than by message.
- **The first contact.** Messages to many strangers with no shared connection, wrong-number openers ("Is this Dave? Sorry, wrong person, but nice to meet you"), contact with people outside the account's region or language, and outreach that targets members of investment, crypto or scam-victim communities.
- **The conversation's direction.** Requests to move to another app (Match Group's guidance is that scammers "will attempt to get you on to another platform quickly"), mentions of trading platforms, returns, "my uncle's analyst," screenshots of profits, app download links outside the official stores (FinCEN's red flag), and later requests for money for fees or taxes.
- **Off-platform identifiers.** Domains, app identifiers, wallet addresses, messaging handles and phone numbers in messages, profiles and ads, matched against known-bad lists: FinCEN's red flags include "a recently registered web address or domain name" and contact methods "that include only chat or email," and the Funnull record shows thousands of scam domains sharing hosting.

**Conversation-stage models.** Because the scam is a sequence, the useful model scores where a conversation is, not whether one message is bad: contact, rapport, migration, pitch, deposit, withdrawal block, recovery. Stage scores rise slowly over days, which suits a design where the score is recomputed per conversation as messages arrive and acts at thresholds (warn the recipient at migration-plus-pitch, open a case on the sender's network at pitch-plus-identifier) rather than per message ([Classifiers as Prioritizers](/books/user-generated-platforms/moderation-at-scale#classifiers-as-prioritizers)). The sender side matters more than the recipient side: a sender with thirty conversations at the pitch stage in a week is a scam operator whatever each conversation looks like, and that's the network signal Meta's scam-center takedowns rest on.

**End-to-end encryption changes where models run.** On an encrypted messenger, the server sees metadata (account age, who adds whom to groups, contact patterns), not content. WhatsApp's controls are accordingly built on behavior: a safety overview when someone not in your contacts adds you to a group, warnings on screen sharing with unknown contacts during a call, alerts on suspicious device-linking requests. Content-based scoring there runs on the device or on messages a user chooses to report; Messenger asks a user "if you'd like to share recent chat messages for an AI scam review." [Encryption](/books/user-generated-platforms/real-time-chat#encryption) covers the trade-off.

**Signals cross platforms.** The first platform rarely sees the loss; the last rarely sees the contact. Two sharing efforts exist as of October 2026: the **Tech Against Scams** coalition (launched in May 2024; Meta names Coinbase, Ripple, Meta and Match Group among its members) for practice and information sharing across social, dating and crypto companies, and the **Global Signal Exchange**, launched in October 2024 as a clearinghouse "for online scams and fraud bad actor signals," which lists 41 participating organizations including Google, Meta, Microsoft, Amazon and Mastercard. (Google's launch post names GASA and the DNS Research Federation as partners; the exchange's own site names Oxford Information Labs, Google and GASA as founders.) Lantern's design rules apply: typed signals, vetted members, review before action ([Coordinated Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#coordinated-inauthentic-behavior)). In the US, sharing non-content records (a domain, a wallet, an account identifier) with another company is permitted, since the Stored Communications Act allows records to be divulged "to any person other than a governmental entity" (2702(c)(6)); message contents are a different matter (below).

## Friction

Warnings are the one intervention that works before the money moves, and they work only at the right moment. The platforms' published patterns:

- **At first contact from a stranger.** Message requests and alerts on unfamiliar senders ([Direct Messages and the Stranger Problem](/books/user-generated-platforms/real-time-chat#direct-messages-and-the-stranger-problem)); Meta is testing alerts on suspicious friend requests that help users "block or reject suspicious requests"; WhatsApp's group-add overview shows who added you and lets you leave before seeing the chat.
- **When someone asks to move off the platform.** LinkedIn interposes "This sender appears to be trying to move the conversation off LinkedIn" with the message hidden behind "View message anyway," and makes Report one click that moves the thread to spam.
- **When investment comes up.** Tinder shows pop-up safety tips "if certain language is detected in conversations between users," and Hinge tells users never to "send money or take investment advice from someone they've never met."
- **When an action hands over control.** Screen sharing with an unknown contact, linking a new device, installing an app from a link: WhatsApp warns on the first two.

My defaults for the warning itself: show it to the **recipient**, never accuse the sender in a way the sender sees (that teaches the operator which phrasing trips it); say what the pattern is in one sentence ("People who ask to move to another app and then talk about investing are often running a scam"); offer block and report in the same place; don't repeat the same warning in the same conversation; and measure it like a model, by what users do next (continued, blocked, reported) and by later confirmed scams among those who continued. A warning nobody reads is noise; a warning on every link is a warning nobody reads.

**Limits on new accounts** do the rest. Spam's rule of unlocking reach with age and behavior ([Account Farms](/books/user-generated-platforms/spam-and-bots#account-farms)) applies with one change: the privilege to watch is messaging many strangers, especially across age, region and language lines, rather than posting.

## Verifying Financial Advertisers

An ad is the one scam channel a platform takes money for, which is why the law looks there first. Verification for financial advertisers is now standard at the largest ad platforms:

- **Google** requires financial services verification in a growing list of countries, enforced in the UK from September 6, 2021; Australia, Singapore and Taiwan from August 30, 2022; India, Indonesia, Brazil, France, Germany, Portugal and Spain from January 24, 2023; and most remaining EU and EEA countries in 2026 (July 23 and September 15). Crypto advertisers must also be certified, against the local license: FCA registration in the UK, FinCEN money services business registration plus state money transmitter licensing in the US, and authorization as a crypto-asset service provider under MiCA in the EU.
- **Meta** requires written permission and "a recognized regulatory license or registration" to advertise crypto products, by country (FCA authorisation in the UK, for example), requires verification of identity for financial products and services advertisers, requires advertisers targeting Singapore to verify who benefits from and who pays for the ad, and requires SEBI registration details from securities and investment advertisers targeting India (enforced from July 28, 2025).

My rules for a platform selling ads:

- **Verify the license, not the logo.** A financial advertiser's authorization is checked against the regulator's public register for each jurisdiction the ad targets, re-checked on a schedule (registers change, firms lose authorization), and tied to the identity verification of the account that pays ([Verification and Badges](/books/user-generated-platforms/accounts-and-identity#verification-and-badges)).
- **Targeting follows authorization.** An ad for an investment product can target only the countries where its advertiser holds a license; the targeting UI enforces it, not a reviewer.
- **The landing page is part of the ad.** Cloaking (showing reviewers a harmless page and users a scam) is the classic evasion, so landing pages are fetched from varied networks and devices, and a landing domain that changes after approval sends the ad back to review.
- **Likeness is a restricted input.** An ad using a public figure's face or voice needs either the person's authorization on file or a match check against enrolled public figures; generative ad tools shouldn't produce real people's likenesses for financial ads at all, which is the risk Ofcom's draft codes ask platforms to test for.
- **Advertiser standing carries across.** A suspended scam advertiser's payment instruments, devices and business identity are linked evidence against the next account ([Account Farms](/books/user-generated-platforms/spam-and-bots#account-farms)), which is the measure in Ofcom's draft codes on banning bad actors who post scam ads and "preventing perpetrators from creating new accounts."

## Reporting and Referral

The report flow for scams has three audiences: the platform's own enforcement, the victim, and law enforcement.

- **Report from the conversation.** A report button on every message and profile, with a scam category that asks one more question (did you lose money?), attaches the stored messages and profile to the case ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)). The identifiers in the conversation (domains, wallets, handles) are extracted into indicators that feed detection and, after review, signal exchanges.
- **Tell the victim where to report.** In the US, the IC3 asks every victim to file "Regardless of the amount lost" at ic3.gov; equivalents exist in other countries. The report confirmation should name the right agency for the user's country and say plainly that no agency or law firm will contact them offering recovery for a fee, because the recovery scam comes next.
- **Know what you can share.** Unlike child sexual exploitation, there's no US statute requiring a platform to report fraud. The Stored Communications Act limits voluntary disclosure of contents to government, but it allows disclosure "with the lawful consent of the originator or an addressee or intended recipient" (2702(b)(3)), so a victim's consent, recorded with the report, lets the platform give the victim's own conversation to investigators. Everything else follows [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework): preservation on request, process for the scammer's data.
- **Work with victim notification.** The FBI's Operation Level Up contacts people who are being scammed, often before they know: it reported 8,935 victims notified by March 2026, 77% unaware they were being scammed, and an estimated $562,726,245 in losses avoided. Platforms that hold early-stage signals (a conversation at the pitch stage) are the natural source for the same kind of intervention, inside their own product.
- **Support the network takedown.** Enforcement against scam centers is by network: Meta's figures, the Strike Force's Telegram channel seizure and its domain seizures are all actions against clusters. A confirmed scam operator's cluster, with its infrastructure indicators, is what an investigator can use; a single reported account isn't.

## When Not To

Every control in this chapter has a cost paid by honest users, and the costs are concrete:

- **Moving off a platform is normal.** People on dating apps exchange numbers as the relationship goes well; professionals move to email; marketplace parties legitimately coordinate a pickup. A warning on every off-platform request trains users to ignore it, so warn on the combination (stranger, recent contact, migration, investment), not on the request alone.
- **Talking about crypto is legal.** Investment communities, crypto news and personal finance creators discuss coins, returns and exchanges all day. A keyword model that fires on "USDT" and "returns" will flag them; the stage model scores private conversations between recent strangers, not public discussion.
- **Financial advertiser verification excludes small, legitimate firms** in countries where registers are hard to check, and it costs advertisers time. Google's country-by-country rollout is how the largest platform staged that cost.
- **Face matching is biometric processing.** Meta's design (enrollment with notice and an opt-out, a one-time comparison, immediate deletion of facial data from ads) is the minimum, and the program reached the UK and EU later than elsewhere. My rule: run likeness matching only for enrolled people, keep the record of each comparison and not the faceprint, and treat it as a high-risk processing activity with its own assessment.
- **Victims aren't suspects.** A victim's account may send money, recruit friends ("my friend made so much") or post an exchange link on the scammer's instruction; banning it punishes the victim. Victims who report get help, not a strike, and a compromised or coached account gets a lock and recovery rather than a penalty ([Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing)).
- **Age is a weak targeting signal.** FinCEN's 2026 analysis found older adults "are not at a higher risk of victimization" in its reports, though losses among people over 60 are large; warnings shown only to older users miss most victims and patronize the rest.
- **Disruption is reversible or it's a penalty.** Australia's framework protects proportionate disruptive action for up to 28 days and requires prompt reversal if the activity isn't a scam; that's a sensible design for any platform: a hold with a deadline and a review, not a silent ban ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)).

## How to Build It

The chapter adds scam indicators, conversation stage scores, warnings and their responses, scam reports with consent and referral, financial advertiser authorizations, and likeness protection to the core model. Clusters reuse `inauthentic_clusters` from [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#how-to-build-it); conversations are `channels` and `messages` from [Real-Time Chat](/books/user-generated-platforms/real-time-chat#how-to-build-it); identity behind an advertiser is `verifications` from [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it):

```sql
ALTER TABLE inauthentic_clusters
  DROP CONSTRAINT inauthentic_clusters_kind_check,
  ADD CONSTRAINT inauthentic_clusters_kind_check CHECK (kind IN ('spam_farm',
    'vote_ring', 'ban_evasion', 'coordinated_inauthentic_behavior',
    'note_rating_ring', 'scam_operation'));

CREATE TABLE scam_indicators (           -- off-platform identifiers seen in scams
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  kind          TEXT NOT NULL CHECK (kind IN ('domain', 'url', 'app_id', 'wallet_address',
                  'phone', 'messaging_handle', 'payment_handle')),
  value_hash    BYTEA NOT NULL,          -- normalized, then hashed for matching
  value_ref     TEXT NOT NULL,           -- the raw value lives in the evidence store
  network       TEXT,                    -- wallet addresses: which chain
  source        TEXT NOT NULL CHECK (source IN ('user_report', 'investigator', 'model',
                  'signal_exchange', 'law_enforcement', 'sanctions_list')),
  status        TEXT NOT NULL CHECK (status IN ('suspected', 'confirmed', 'dismissed')),
  cluster_id    UUID REFERENCES inauthentic_clusters (id),
  first_seen_at TIMESTAMPTZ NOT NULL,
  expires_at    TIMESTAMPTZ,             -- domains and phone numbers get recycled
  shared_at     TIMESTAMPTZ,             -- sent to an exchange, after review
  CHECK (shared_at IS NULL OR status = 'confirmed'),
  UNIQUE (kind, value_hash)
);

CREATE TABLE conversation_risk (         -- the latest stage and score per sender per conversation
  channel_id        UUID NOT NULL REFERENCES channels (id),
  sender_account_id UUID NOT NULL REFERENCES accounts (id),
  stage             TEXT NOT NULL CHECK (stage IN ('contact', 'rapport', 'migration',
                      'pitch', 'deposit', 'withdrawal_block', 'recovery')),
  score             NUMERIC(6, 5) NOT NULL,
  signals           TEXT[] NOT NULL,     -- 'stranger_contact', 'off_platform_request', ...
  indicator_ids     UUID[] NOT NULL DEFAULT '{}',
  model_version     TEXT NOT NULL,
  scored_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, sender_account_id)
);

CREATE TABLE safety_interventions (      -- every warning shown, and what the user did next
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),  -- who saw it
  channel_id       UUID REFERENCES channels (id),
  counterpart_account_id UUID REFERENCES accounts (id),
  kind             TEXT NOT NULL CHECK (kind IN ('stranger_contact', 'off_platform_move',
                     'investment_mention', 'link_warning', 'group_add_overview',
                     'screen_share', 'device_link', 'impersonation')),
  trigger_ref      TEXT NOT NULL,        -- the detection or score that fired it
  copy_version     TEXT NOT NULL,        -- the exact warning text shown
  shown_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response         TEXT CHECK (response IN ('continued', 'blocked', 'reported',
                     'dismissed', 'left_group')),
  responded_at     TIMESTAMPTZ,
  CHECK ((response IS NULL) = (responded_at IS NULL))
);

CREATE TABLE scam_reports (              -- the scam details a report adds to its case
  case_id          UUID PRIMARY KEY REFERENCES moderation_cases (id),
  reporter_account_id UUID NOT NULL REFERENCES accounts (id),
  reporter_role    TEXT NOT NULL CHECK (reporter_role IN ('victim', 'witness',
                     'impersonated', 'trusted_flagger')),
  scam_type        TEXT NOT NULL CHECK (scam_type IN ('relationship_investment',
                     'impersonation_ad', 'fake_support', 'giveaway', 'recovery',
                     'other')),
  money_lost       BOOLEAN,
  loss_band        TEXT,                 -- self-reported range, never verified or shown
  indicator_ids    UUID[] NOT NULL DEFAULT '{}',
  disclosure_consent_at TIMESTAMPTZ,     -- victim consented to sharing their messages
  referral_shown   TEXT,                 -- the agency the confirmation pointed to
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (disclosure_consent_at IS NULL OR reporter_role = 'victim')
);

CREATE TABLE financial_ad_authorizations (  -- an advertiser's license, per jurisdiction
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_account_id UUID NOT NULL REFERENCES accounts (id),
  jurisdiction     TEXT NOT NULL,        -- country or bloc the ads may target
  product          TEXT NOT NULL CHECK (product IN ('crypto_exchange', 'crypto_wallet',
                     'securities', 'banking', 'lending', 'insurance', 'other')),
  regulator        TEXT NOT NULL,        -- 'FCA', 'SEBI', 'FinCEN', 'MiCA CASP', ...
  register_ref     TEXT NOT NULL,        -- the entry on the regulator's public register
  verification_id  UUID NOT NULL REFERENCES verifications (id),  -- identity behind it
  status           TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected',
                     'expired', 'revoked')),
  last_checked_at  TIMESTAMPTZ NOT NULL,
  valid_during     TSTZRANGE,            -- set on approval; closed on expiry or revocation
  CHECK ((status = 'approved') = (valid_during IS NOT NULL AND upper_inf(valid_during)))
);

CREATE TABLE likeness_protections (      -- a public figure enrolled for face matching
  profile_id       UUID PRIMARY KEY REFERENCES profiles (id),
  enrolled_at      TIMESTAMPTZ NOT NULL,
  notice_ref       TEXT NOT NULL,        -- the notice shown and the basis, per jurisdiction
  reference_ref    TEXT NOT NULL,        -- which profile images are the reference
  opted_out_at     TIMESTAMPTZ
);

CREATE TABLE likeness_matches (          -- one comparison; the facial data is already gone
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  profile_id       UUID NOT NULL REFERENCES likeness_protections (profile_id),
  subject_type     TEXT NOT NULL CHECK (subject_type IN ('ad', 'account', 'content_item')),
  subject_id       UUID NOT NULL,        -- ads live in the ad system
  matched          BOOLEAN NOT NULL,
  decision         TEXT CHECK (decision IN ('scam', 'authorized', 'not_scam', 'review')),
  case_id          UUID REFERENCES moderation_cases (id),
  compared_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  face_data_deleted_at TIMESTAMPTZ NOT NULL,
  CHECK (face_data_deleted_at >= compared_at)
);
```

Notes on the sketch:

- **Indicators are evidence with a shelf life.** A domain or phone number confirmed in a scam is matched by hash in messages, profiles, ads and landing pages; it expires because registrars and carriers recycle them, and only confirmed indicators are shared outside. Wallet addresses carry their network, and the address screening that payment flows do is in the Payments volume's [Stablecoins & Crypto Rails](/books/payments/stablecoins#screening-wallets-and-addresses).
- **Stages are scored per sender, acted on per network.** `conversation_risk` holds one row per sender per conversation; the query that matters aggregates it by sender and by cluster ("accounts with more than N conversations at pitch this week"), and that, not one conversation, opens a case on a `scam_operation` cluster. Scores on encrypted conversations exist only where the client or a reporter supplied the content.
- **Warnings are decisions.** Each `safety_interventions` row records the trigger and the exact copy, so warning effectiveness is measurable by kind and copy version, and a complaint that "the app accused my friend" can be answered. The sender never sees a row about them.
- **Scam reports extend the case.** The case, evidence and decision stay in the playbook's moderation model; `scam_reports` adds the type, the victim's consent to disclosure (which is what lets their messages go to investigators under 2702(b)(3)), and the referral the user was shown. Loss is a self-reported band for triage and counting, not a figure the platform asserts.
- **Authorizations gate targeting.** The ad system reads `financial_ad_authorizations` at campaign setup and at serving: an investment ad can target only jurisdictions with an approved, current row. The re-check job closes `valid_during` when a register entry disappears.
- **Likeness matching keeps the outcome, not the face.** `likeness_matches` records that a comparison happened, the result and when facial data was deleted; the constraint keeps a row from existing without a deletion time.
- **Events:** `scam_indicator.confirmed`, `conversation_risk.stage_changed`, `safety_intervention.shown`, `safety_intervention.responded`, `scam_report.created`, `financial_ad_authorization.revoked` and `likeness_match.scam` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to detection, ad serving, signal sharing and the trust and safety warehouse.

## Auditing

- **Every warning shown,** with its trigger, copy and the user's response, so effectiveness and false-positive rates can be measured and a regulator's question about "proportionate systems" answered with data.
- **Every financial advertiser authorization check,** with the register consulted and the result, which is the evidence for the UK fraudulent advertising duty and any successor to the FTC's inquiry.
- **Every likeness comparison** and the deletion of its facial data.
- **Indicator sharing:** what was shared, with which exchange, when, and on whose review; and what was received and whether it was acted on.
- **Disclosures to law enforcement** with the consent or process behind each ([Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#auditing)).
- **Scam ad takedowns** by time from first impression to removal, which is the measure the UK duty's "minimise the length of time" language and the BEUC complaint both use.

## What This Means for the System You Build

- **Treat the scam as a sequence across platforms,** and design for the stage you see: contact, persona, migration, pitch, or the ad that lured.
- **Score conversations by stage and act on senders and networks,** not on single messages; scam operators run many conversations at once.
- **Warn the recipient at the moment of risk** (a stranger, a request to move off the platform, investment talk, screen sharing), measure what users do next, and never tip off the sender.
- **Verify financial advertisers against regulators' registers** per targeted jurisdiction, re-check on a schedule, and treat landing pages and likenesses as part of the ad.
- **Protect public figures by enrollment and one-time comparison,** keeping the outcome, never the faceprint.
- **Extract and share off-platform indicators** (domains, wallets, handles) through vetted exchanges, after review.
- **Route victims to law enforcement and warn them about recovery scams,** and record their consent so their own messages can reach investigators.
- **Screen advertisers and payees against sanctions lists,** since scam-center networks and their infrastructure are designated.
- **Never punish victims,** and make every disruption a reviewed hold with a deadline.

## References

**Government and law enforcement**

- [FinCEN: Alert on Prevalent Virtual Currency Investment Scam Commonly Known as "Pig Butchering" (FIN-2023-Alert005)](https://www.fincen.gov/system/files/shared/FinCEN_Alert_Pig_Butchering_FINAL_508c.pdf), September 8, 2023, the stages from first contact to withdrawal fees, the channels of contact, the persona, fake platforms and red flags on unsolicited contacts, new domains and sideloaded apps
- [OHCHR: Hundreds of thousands trafficked to work as online scammers in SE Asia, says UN report](https://www.ohchr.org/en/press-releases/2023/08/hundreds-thousands-trafficked-work-online-scammers-se-asia-says-un-report), August 29, 2023, at least 120,000 in Myanmar and around 100,000 in Cambodia, revenue in the billions of dollars a year
- [UNODC: Cyberfraud in the Mekong reaches inflection point](https://www.unodc.org/roseap/en/2025/04/cyberfraud-mekong-inflection-point/story.html), April 21, 2025, the *Inflection Point* report, just under US $40 billion in annual profits, displacement and centers found outside the region
- [FinCEN: Alert on Money Laundering Activity Associated with Digital Asset Investment Scam Centers (FIN-2026-Alert005)](https://www.fincen.gov/system/files/2026-08/FinCEN-Alert-Scam-Centers.pdf), September 3, 2026, losses from $907 million in 2021 to $7.2 billion in 2025, trafficking and geographic spread, Telegram guarantee marketplaces and their reconstitution, the term "digital asset investment scam" and INTERPOL's December 2024 call to drop "pig butchering"
- [FinCEN: Digital Asset Investment Scams, 2023-2025 Threat Pattern & Trend Information](https://www.fincen.gov/system/files/2026-08/FinCEN-FTA-Digital-Asset-Investment-Scams.pdf), September 3, 2026, 33,904 reports and about $12.7 billion, the shift to encrypted messaging, scams run entirely in messaging apps, older adults not at higher risk
- [FinCEN: Final rule severing Huione Group from the US financial system](https://www.fincen.gov/news/news-releases/fincen-issues-final-rule-severing-huione-group-us-financial-system), October 14, 2025, the Section 311 action
- [FinCEN: Huione Group a primary money laundering concern](https://www.fincen.gov/news/news-releases/fincen-finds-cambodia-based-huione-group-be-primary-money-laundering-concern), May 1, 2025, at least $4 billion laundered and Haowang Guarantee
- [FBI: Internet Crime Report 2025](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf), cryptocurrency investment fraud as the largest loss category, how contact starts and moves to messaging, fake profits, loans and withdrawal fees, AI-generated conversations, recovery scam complaints and losses, the Scam Center Strike Force's targets, filing at ic3.gov
- [IC3: FBI Warns of Scammers Impersonating the IC3 (I-041825-PSA)](https://www.ic3.gov/PSA/2025/PSA250418), April 18, 2025, persona profiles joining victim groups, the hand-off on Telegram, the IC3 never contacting individuals
- [IC3: Fictitious Law Firms Targeting Cryptocurrency Scam Victims (I-081325-PSA)](https://www.ic3.gov/PSA/2025/PSA250813), August 13, 2025, no law firms are authorized partners of US agencies
- [IC3: Fraudsters Target US Stock Investors through Investment Clubs (I-070325-PSA)](https://www.ic3.gov/PSA/2025/PSA250703), July 3, 2025, investment clubs promoted by social media ads and moved to messaging apps
- [FBI FLASH 20250529-001: Infrastructure Used to Manage Domains Related to Cryptocurrency Investment Fraud Scams](https://www.ic3.gov/CSA/2025/250529.pdf), May 29, 2025, Funnull's 548 CNAMEs and over 332,000 domains, simultaneous IP migration, the request to raise domains' risk scores
- [Treasury: Treasury Takes Action Against Major Cyber Scam Facilitator](https://home.treasury.gov/news/press-releases/sb0149), May 29, 2025, Funnull linked to the majority of investment scam websites reported to the FBI, IP addresses bought in bulk from cloud providers
- [Treasury: Treasury Sanctions Burma Warlord and Militia Tied to Cyber Scam Operations](https://home.treasury.gov/news/press-releases/sb0129), May 5, 2025, the Karen National Army designation, land leasing and utilities
- [Treasury: U.S. and U.K. Take Largest Action Ever Targeting Cybercriminal Networks in Southeast Asia](https://home.treasury.gov/news/press-releases/sb0278), October 14, 2025, 146 Prince Group targets
- [DOJ: Chairman of Prince Group Indicted for Operating Cambodian Forced Labor Scam Compounds](https://www.justice.gov/opa/pr/chairman-prince-group-indicted-operating-cambodian-forced-labor-scam-compounds-engaged), October 14, 2025, about 127,271 bitcoin, victims reached through messaging and social media
- [DOJ: Scam Center Strike Force Takes Major Actions Against Southeast Asian Scam Centers](https://www.justice.gov/opa/pr/scam-center-strike-force-takes-major-actions-against-southeast-asian-scam-centers-targeting), April 23, 2026, more than 503 domains, the Telegram channel seizure, companies' voluntary measures, Operation Level Up figures as of March 2026
- [DOJ: Justice Department Seizes Backend Infrastructure Used by the Huione Group](https://www.justice.gov/opa/pr/justice-department-seizes-backend-infrastructure-used-huione-group-money-laundering-services), June 23, 2026, the cloud account and Huione Guarantee's Telegram channels
- [DOJ: Scam Center Strike Force](https://www.justice.gov/usao-dc/scam-center-strike-force), cryptocurrency restrained as of October 2026
- [FTC: Reported losses to scams on social media eight times higher than in 2020](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2026/04/reported-losses-scams-social-media-eight-times-higher-2020), April 27, 2026, the share and losses starting on social media in 2025, investment and romance scams, platforms most reported
- [FTC: Impersonation rule goes into effect](https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-announces-impersonation-rule-goes-effect-today), April 1, 2024, 16 CFR Part 461, civil penalties and redress
- [FTC: FTC seeks public comment on whether to update the impersonation rule to address platforms](https://www.ftc.gov/news-events/news/press-releases/2026/09/ftc-seeks-public-comment-whether-update-rule-impersonation-government-businesses-address-platforms), September 24, 2026, ad-optimization tools, advertiser vetting and ad monitoring, the 2-0 vote

**Statutes and regulations**

- [Online Safety Act 2023, section 38](https://www.legislation.gov.uk/ukpga/2023/50/section/38), the Category 1 fraudulent advertising duty, terms of service on proactive technology, in force January 10, 2024
- [Online Safety Act 2023, section 39](https://www.legislation.gov.uk/ukpga/2023/50/section/39), the Category 2A duty for search results
- [Online Safety Act 2023, Schedule 7](https://www.legislation.gov.uk/ukpga/2023/50/schedule/7), fraud and financial services offences as priority offences (paragraphs 33 and 35)
- [Scams Prevention Framework Act 2025 (Australia)](https://legislation.gov.au/C2025A00015/asmade/2025-02-20/text/original/epub/OEBPS/document_1/document_1.html), the six principles, actionable scam intelligence reports, the 28-day safe harbour for disruptive action and its reversal, tier 1 penalties
- [Competition and Consumer (Scams Prevention Framework, Regulated Sectors) Designation 2026 (F2026L00627)](https://www.legislation.gov.au/F2026L00627/asmade/2026-05-28/text/original/epub/OEBPS/document_1/document_1.html), made May 22, 2026, the banking, telecommunications and digital platform sectors, the three designated digital platform services and the dating carve-out, the phase-in to March 31, 2027
- [Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065), Articles 16 (notice and action), 26 (advertising transparency), 34 (systemic risks) and 39 (ad repositories)
- [18 U.S.C. § 2702](https://www.law.cornell.edu/uscode/text/18/2702), disclosure of contents with a party's consent and of records to non-government persons

**Platforms**

- [Meta: Cracking Down on Organized Crime Behind Scam Centers](https://about.fb.com/news/2024/11/cracking-down-organized-crime-scam-centers/), November 21, 2024, over two million scam-center accounts, how the scams start and move, Tech Against Scams members
- [Meta: New WhatsApp Tools and Tips to Beat Messaging Scams](https://about.fb.com/news/2025/08/new-whatsapp-tools-tips-beat-messaging-scams/), August 5, 2025, 6.8 million WhatsApp accounts, the group-add safety overview
- [Meta: Helping Older Adults Avoid Online Scams](https://about.fb.com/news/2025/10/cybersecurity-awareness-month-helping-older-adults-avoid-online-scams/), October 21, 2025, screen-sharing warnings, Messenger scam detection, over 21,000 fake customer support Pages and accounts
- [Meta: Testing New Ways to Combat Scams and Help Restore Access to Compromised Accounts](https://about.fb.com/news/2024/10/testing-combat-scams-restore-compromised-accounts/), October 2024 with updates through September 2025, celebrity-bait face matching, deletion of facial data, enrollment and opt-out, UK and EU expansion, the 22% fall in reports, nearly 500,000 public figures
- [Meta: Fighting Scammers and Protecting People With New Technology and Partnerships](https://about.fb.com/news/2026/03/fighting-scammers-protecting-people-with-new-technology-and-partnerships/), March 11, 2026, 159 million scam ads and 92% proactive, 10.9 million scam-center accounts, the 90% verified-advertiser revenue target, friend request alerts, Messenger AI scam review, device-linking alerts
- [Meta: Cryptocurrency Products and Services](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/cryptocurrency-products-and-services/), written permission and a recognized license by country
- [Meta: Financial and Insurance Products and Services](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/financial-services/), identity verification for financial advertisers
- [Meta: New Verification Requirements for All Advertisers Targeting Singapore](https://www.facebook.com/business/news/new-verification-requirements-for-all-advertisers-targeting-singapore), March 5, 2025, beneficiary and payer verification
- [Meta: Verification and transparency requirements for securities and investments ads in India](https://developers.facebook.com/blog/post/2025/06/26/verification-and-transparency-requirements-for-advertisers-targeting-users-in-india-with-securities-and-investments-ads/), June 26, 2025, SEBI registration, enforcement from July 28, 2025
- [Google: Misrepresentation, unacceptable business practices](https://support.google.com/adspolicy/answer/15938071), public figure impersonation, the AI-generated YouTuber example, suspension on detection without warning
- [Google: Financial services verification, relevant regulators and enforcement dates](https://support.google.com/adspolicy/answer/12390454), the countries and enforcement dates
- [Google: Cryptocurrencies and related products](https://support.google.com/adspolicy/answer/14009787), certification and the UK, US and EU licensing requirements
- [Google: 2024 Ads Safety Report](https://blog.google/products/ads-commerce/google-ads-safety-report-2024/), over 700,000 advertiser accounts suspended for public figure impersonation
- [Google: 2025 Ads Safety Report](https://blog.google/products/ads-commerce/2025-ads-safety-report/), 602 million ads and 4 million accounts associated with scams
- [Google TAG: Phishing campaign targets YouTube creators with cookie theft malware](https://blog.google/threat-analysis-group/phishing-campaign-targets-youtube-creators-cookie-theft-malware/), October 20, 2021, hijacked channels rebranded for crypto scam live streams, prices, over 99% recovered, 2-Step Verification for monetizing creators
- [YouTube: Impersonation policy](https://support.google.com/youtube/answer/2801947), AI-generated likeness and "Official" channel names
- [YouTube: Spam, deceptive practices and scams policies](https://support.google.com/youtube/answer/2801973), get-rich-quick schemes and fake customer support
- [LinkedIn: Detect and avoid scams in your messages](https://www.linkedin.com/help/linkedin/answer/a1355851), the off-platform warning, View message anyway and one-click report
- [LinkedIn: Recognize and report scams](https://www.linkedin.com/help/linkedin/answer/a1336387), romance scams, urgent requests to move off-platform, incomplete profiles with low connection counts
- [LinkedIn: Community Report](https://about.linkedin.com/transparency/community-report), fake accounts stopped before a member report, July to December 2025
- [Match Group: Tells Spammers To Bot Off](https://mtch.com/news/64-2/), June 9, 2023, nearly 5 million spam and bot accounts blocked in a quarter
- [Match Group: Romance Scam Campaign](https://mtch.com/single-trust-and-safety/61/), May 1, 2023, moving to another platform quickly, crypto advice from a match
- [Match Group: Tinder partners with Jonathan Bennett to help users avoid online fraudsters](https://ir.mtch.com/investor-relations/news-events/news-events/news-details/2023/Tinder-Partners-With-Mean-Girls-Actor-Jonathan-Bennett-To-Help-Users-Avoid-Online-Fraudsters/default.aspx), October 2, 2023, pop-up safety tips on detected language and Hinge's in-app message
- [Match Group: Trust & Safety](https://mtch.com/trust-safety/), cofounder of Tech Against Scams
- [Hinge: World Romance Scam Prevention Day](https://hinge.co/newsroom/Scam-Prevention-Awareness-2024), October 3, 2024, Tech Against Scams launched in May 2024
- [Telegram: EU DSA user guidance](https://telegram.org/tos/eu-dsa), the SCAM and FAKE labels and human approval of critical restrictions
- [Telegram: Moderation](https://telegram.org/moderation), groups and channels blocked in 2026
- [Telegram: FAQ](https://telegram.org/faq), @NoToScam for impersonation

**Programs, complaints and reporting**

- [Google: The new Global Signal Exchange will help fight scams and fraud](https://blog.google/technology/safety-security/the-new-global-signal-exchange-will-help-fight-scams-and-fraud/), October 9, 2024, the clearinghouse, partners and shared URLs
- [Global Signal Exchange](https://www.globalsignalexchange.org/), founders and 41 participating organizations
- [Tech Against Scams](https://www.techagainstscams.io/), cross-industry information sharing across social, dating, consumer tech and crypto companies
- [BEUC: Consumer groups file complaints against Meta, TikTok and Google](https://www.beuc.eu/press-releases/consumer-groups-file-complaints-against-meta-tiktok-and-google-failing-protect), May 21, 2026, nearly 900 reported ads, 27% removed, 52% rejected or ignored
- [Ofcom: Consultation: Fraudulent Advertising Codes of Practice](https://www.ofcom.org.uk/online-safety/online-fraud/consultation-fraudulent-advertising-code-of-practice), published July 10, 2026, closing October 2, 2026, draft codes for Category 1 and Category 2A services (Annexes 4 and 5), paid-for advertising only, statement by mid-2027
- [Ofcom: Big Tech must tackle scourge of scam adverts (July 10, 2026)](https://www.ofcom.org.uk/online-safety/online-fraud/big-tech-must-tackle-scourge-of-scam-adverts-says-ofcom), nearly 40 measures, advertiser and authorisation checks, re-registration bans, account security, AI ad tools, trusted flaggers and the autumn proactive technology consultation
- [Insurance Journal (Reuters): Rhode Island sues Meta over scam ads](https://www.insurancejournal.com/news/east/2026/10/23/890093.htm), October 23, 2026, the allegations, the bank-executive impersonation, relief sought, Santa Clara County's earlier suit, Meta's response (reported)
