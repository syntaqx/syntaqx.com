+++
title = "Regulators & Enforcement"
description = "The DSA, the UK Online Safety Act and Australia's eSafety regime as platforms meet them: tiers, designations, clocks, fines, withdrawals and a ledger."
category = "User-Generated Platforms Industry"
order = 1841
part = "The Rules"
tags = ["user-generated-content", "regulation", "digital-services-act", "online-safety-act", "esafety", "trust-and-safety"]
+++

For most of their history user-generated platforms answered to courts, not regulators. A takedown notice, a subpoena or a lawsuit arrived, and the platform responded case by case under a liability shield. That changed between 2022 and 2025. The EU's Digital Services Act, the UK's Online Safety Act and Australia's Online Safety Act each put a regulator in charge of how a platform runs its moderation system, not just of what it does with one post: whether it assessed the risks, whether its notice channel works, whether its age checks are effective, whether its reports are accurate, and whether it answered the regulator's questions on time. Each regulator can fine a share of worldwide turnover, and each has used that power against platforms with user content.

The engineering consequence is that compliance becomes a set of records and clocks. A designation date starts a four-month countdown; an information notice has a response date; a statement of reasons has a database submission; a dispute body has a 90-day decision window; a trusted flagger's notice jumps the queue. A platform that serves the EU, the UK and Australia runs three overlapping regimes with different service classes, thresholds and deadlines, and the duties change every few months as designations, codes and amendments land.

This chapter covers the regulators as a platform meets them: the DSA (service tiers, very large platform designation, fines, out-of-court dispute settlement, trusted flaggers), the UK Online Safety Act (codes, the categorisation register, fines and business disruption, withdrawals), Australia's eSafety regime (the Basic Online Safety Expectations, transparency notices, the under-16 minimum age), the US regulators where they act as platform regulators, and an enforcement ledger of what each has done. The general moderation machinery (notices, statements of reasons, appeals, audit) is the playbook's [Trust & Safety](/docs/security/trust-and-safety); the DSA duty table and the Online Safety Act's dates as a game meets them are in the Gaming volume's [Regulatory Duties](/books/gaming/player-behavior#regulatory-duties); minors' rules are [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance); transparency reports are [Transparency Reporting](/books/user-generated-platforms/transparency-reporting). The chapter extends `reports` and `moderation_decisions` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) and adds the tables that hold designations, regulator requests, trusted flaggers, disputes and geographic restrictions. Status lines are as of October 2026, and none of it is legal advice.

## How the Platforms Do It

| Platform | EU (DSA) | UK (Online Safety Act) | Australia (eSafety) | Regulatory event |
| --- | --- | --- | --- | --- |
| **Reddit** | Designated a very large online platform on August 31, 2026; very large platform duties apply from January 2027 | Age verification through Persona for adult content from the July 2025 children's deadline | Named by eSafety as an age-restricted social media platform from December 10, 2025 | Moves from the general platform tier to the very large tier |
| **X** | First DSA non-compliance decision, €120 million, December 5, 2025 | Announced age checks for the July 2025 deadline | A$650,000 penalty and A$100,000 costs for a non-compliant transparency notice response | Fined in two jurisdictions for transparency failures, not for a post |
| **Imgur** | General platform tier | Blocked UK users from September 30, 2025 after the ICO's notice of intent; £247,590 ICO fine on February 5, 2026 | None found | Withdrawal from a market as a compliance response |
| **Bluesky** | General platform tier | Age checks through Kids Web Services | Not covered here | Stayed in the UK and added age assurance |
| **Discord** | General platform tier | Announced age checks for the July 2025 deadline | Not covered here | Adapted the product per jurisdiction ([Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance)) |
| **Twitch and Kick** | General platform tier | Not covered here | Both named as age-restricted social media platforms | Live streaming treated as social media for minimum age |
| **Temu and AliExpress** | Very large online platforms; fined €200 million and €550 million for risk assessment and mitigation failures | Not covered here | Not covered here | Marketplaces fined for illegal products, not content |

The patterns: **regulators fine process failures, not single posts** (a risk assessment, a checkmark's design, an ad repository, a transparency notice answered in the wrong form, age checks that weren't highly effective); **the tier decides the duties**, so a designation is a product event with a deadline; **a platform's response can be geographic** (block a country, change defaults in one country, or leave); and **the same platform sits in different tiers in each regime**, so duties have to be data keyed by regime and jurisdiction rather than a list in a compliance document.

## The Digital Services Act

The DSA applies to intermediary services offered to people in the EU, with duties that stack by tier: intermediary, hosting service, online platform, and very large online platform or search engine. The base duties for hosting services and platforms (notice and action under Article 16, statements of reasons under Article 17, internal complaint handling under Article 20, the Transparency Database under Article 24(5), the transparency report under Article 15, and the micro and small enterprise exemption) are tabulated in the Gaming volume's [Digital Services Act](/books/gaming/player-behavior#the-digital-services-act) section, and the mechanics of notices and statements in [Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons). What a user-generated platform adds is the top tier, the regulators' clocks and the parties who stand between the platform and its users.

### Very Large Online Platforms

A platform or search engine with "equal to or higher than 45 million" average monthly active recipients in the EU is designated very large by the Commission (Article 33), and the additional duties apply "from four months after the notification." Every online platform must publish its average monthly active recipients at least every six months (Article 24(2)), which is the number the Commission designates from, so the count is a regulated figure, not a marketing one ([Operating Metrics](/books/user-generated-platforms/operating-metrics#audience) covers its definition).

On August 31, 2026 the Commission designated Reddit and Roblox as very large online platforms and ChatGPT as a very large online search engine, bringing the total to 28, with four months (to January 2027) to comply. The duties that switch on:

| Duty | Article | What it requires |
| --- | --- | --- |
| Systemic risk assessment | 34 | Assess risks from the service and its design, including illegal content, effects on fundamental rights, elections, public security, minors and users' physical and mental well-being |
| Risk mitigation | 35 | Reasonable, proportionate measures against the assessed risks, including design and recommender changes |
| Independent audit | 37 | An audit at least once a year by an independent organization, and an implementation report within one month of recommendations in an audit that isn't positive |
| Recommender option | 38 | "At least one option for each of their recommender systems which is not based on profiling" |
| Ad repository | 39 | A searchable repository of the ads shown, who paid and whom they targeted |
| Researcher data access | 40 | Access to data for vetted researchers, and no terms that block access to publicly accessible data |
| Six-monthly transparency reports | 42 | Reports every six months, with content moderation staff per official language, their qualifications, accuracy indicators per language, and recipients per member state; risk assessments, mitigation measures and audit reports published within three months of each audit report |

For a community platform the designation changes the product as well as the paperwork. A feed without a non-profiling option, an ad system without a repository, and terms that forbid scraping are the three things the Commission fined X for in December 2025 (Articles 25, 39 and 40(12)), and each is an engineering backlog item with a four-month clock from the day the notification arrives.

### Fines, Commitments and Findings

The Commission enforces the very large tier directly; national Digital Services Coordinators enforce everyone else. Fines reach "6 % of its total worldwide annual turnover" for infringements, 1% for supplying incorrect, incomplete or misleading information or refusing an inspection (Article 74), and periodic penalty payments of up to 5% of average daily income or turnover per day (Article 76). The record so far, all from the Commission unless noted:

- **Fines.** X, €120 million on December 5, 2025: the paid blue checkmark as a deceptive design, an ad repository that was neither transparent nor reliably accessible, and terms and hurdles that blocked researchers; X had 60 working days to say how it would end the checkmark deception and 90 for an action plan, while the 2023 investigation into illegal content and information manipulation continues. Temu, €200 million on May 28, 2026, for an inadequate assessment and mitigation of illegal product risks, with a binding action plan due August 28, 2026. AliExpress, €550 million on July 20, 2026, the largest so far: understaffing, a detection system that didn't work, illegal products left online for weeks, a trader penalty policy not properly applied, checks that could be dodged by miscategorising products, and an understaffed brand authorisation system; action plan due October 20, 2026.
- **Commitments.** AliExpress (June 18, 2025) on ad and recommender transparency and illegal product risks; TikTok (December 5, 2025) on its ad repository.
- **Preliminary findings.** TikTok's addictive design under Articles 34 and 35 (February 6, 2026); four unnamed adult content platforms for relying on self-declared age (March 26, 2026).
- **Investigations.** Shein (February 17, 2026), Meta's under-13 access (April 29, 2026), and two from the Netherlands' coordinator, the ACM: Snapchat over vape sales to minors (September 9, 2025) and Roblox over minors' protection (January 30, 2026).

Two lessons for the system. **The findings are about measurement:** AliExpress was fined partly because it overestimated its detection system's effectiveness and underestimated its moderators' workload, which means the numbers a platform keeps about its own moderation (precision, time to removal, queue load per reviewer) are evidence ([Operating Metrics](/books/user-generated-platforms/operating-metrics#trust-and-safety-metrics)). **An action plan is a project with a regulator watching:** each fine came with deadlines measured in working days and periodic penalties behind them.

### Out-of-Court Dispute Settlement

Article 21 gives users of online platforms a step between the internal appeal and a court. A body certified by a Digital Services Coordinator (for up to five years) hears disputes about moderation decisions, including those not resolved through the internal complaint system. Its decisions aren't binding, but the platform must engage in good faith, may refuse only where the same information and grounds were already decided, and pays: if the user wins, the platform pays the body's fees and reimburses the user's reasonable expenses; if the platform wins, the user pays nothing unless they acted in bad faith. Decisions are due within 90 calendar days, extendable to 180 for complex disputes.

The scale is no longer theoretical. The Appeals Centre Europe, certified in Ireland, reported for April 2025 to March 2026 that it received 24,000 disputes, over 12,000 of them eligible, and issued more than 10,000 decisions. Where it could review the content, it disagreed with the platform in 59% of nearly 3,000 decisions (52% of removals, 63% of decisions to leave content up, 70% of 1,400 hate speech cases left up), and it issued more than 7,000 default decisions for users, mostly account suspensions, because the platform didn't provide the content.

The default decisions are the engineering point. A dispute body asks for the content, the decision and the statement of reasons; a platform that can't produce them by case reference loses by default. That requires the evidence snapshot the [Trust & Safety](/docs/security/trust-and-safety#reports-and-queues) model already keeps, retained for at least as long as a dispute can be brought, an intake that receives a body's request and routes it to the original case, and a way to implement the outcome (restore, reinstate) and record whether it did, because Article 24(1) asks platforms to report how many dispute outcomes they implemented ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#the-dsa-reports)).

### Trusted Flaggers

Under Article 22, platforms must ensure that notices from trusted flaggers, within their designated area of expertise, are "given priority and are processed and decided upon without undue delay." The status is awarded by the Digital Services Coordinator where the applicant is established, to entities with expertise, independence from platforms, and a record of diligent, accurate notices, and is recognized across the EU; the Commission publishes the list in a machine-readable database. Ireland's coordinator, Coimisiún na Meán, added the Irish Internet Hotline, the Irish Music Rights Organisation and the Jewish Representative Council of Ireland on June 25, 2026, for three years each.

Three requirements fall on the platform. **Recognize the flagger** at intake: a notice from a designated entity, in its field, goes to a priority lane, not the general queue. **Keep the status current:** status can be suspended or revoked, so the platform syncs the Commission's list rather than a spreadsheet someone maintained once. **Report bad flaggers:** a platform that sees "a significant number of insufficiently precise, inaccurate or inadequately substantiated notices" from a trusted flagger must tell the awarding coordinator with the supporting evidence, which means tracking each flagger's notices and their outcomes. Trusted flaggers' notice counts are also a line in the Article 15 report.

![EU notice and action as a pipeline. Four kinds of sender, a member, a non-user, a trusted flagger (accented) and an authority, join into one notice, where the sender's kind sets the lane. The notice leads to a decision with its legal ground and territorial scope, then a statement to the user and to the public database, then the internal complaint system, then a certified dispute body that decides in 90 days, or 180 if complex. Below the dispute body, implement and record: restore if overturned, and the platform pays the fees if the user wins. Footnotes say a trusted flagger's notice in its field takes the priority lane, and a platform that can't supply the content, decision and statement loses by default.](/diagrams/ugp-regulators-notice-and-action.svg "Under the DSA, one decision record carries the notice through the statement of reasons, the internal complaint and an Article 21 dispute body. Trusted flaggers under Article 22 get the fast lane, and a platform that can't produce its records loses the dispute by default.")

### Who Enforces What

The Commission supervises very large platforms; for everyone else, the coordinator of the member state where the provider has its main establishment is the regulator (Ireland's Coimisiún na Meán for providers established in Ireland). Coordinators certify dispute bodies and award trusted flagger status, and a coordinator elsewhere can still open its own investigation, as the Dutch ACM did with Snapchat and Roblox. A provider with no establishment in the EU must designate a legal representative in a member state where it offers services, whom authorities can address instead of the provider and who can be held liable (Article 13). Record the establishment, the representative and the coordinator as data, because every regulator request hangs off them.

## The UK Online Safety Act

The Online Safety Act applies to user-to-user and search services with links to the UK, regardless of where the provider is based. Its scope, penalties and the age-check duty for primary priority content are in [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#the-uk-online-safety-act), and the illegal harms and children's dates (March and July 2025) in the Gaming volume's [Online Safety Act](/books/gaming/player-behavior#the-online-safety-act) section. What a platform meets on top:

- **Codes as the safe path.** Ofcom's codes of practice set measures that, if followed, count as compliance; a provider can choose other measures but must show they work. The codes are amended by statement: in June 2026 Ofcom decided that user-to-user services at high risk of intimate image abuse that are pornography services, file-sharing or file-storage services, or have more than 700,000 monthly active UK users, plus large services at medium risk, should use hash matching to detect intimate image abuse, and opened an enforcement programme on it. A separate 48-hour takedown duty for non-consensual intimate images has passed into law, with Ofcom consulting by the end of 2026 and aiming to bring it into force in 2027 ([Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse#the-take-it-down-act) covers the US equivalent).
- **Categorisation.** Ofcom published its register of categorised services on July 10, 2026. Category 1 (the published examples are Facebook, Instagram, Snapchat and TikTok) carries user empowerment, journalistic and democratic content and fraudulent advertising duties; Category 2A adds risk assessment record-keeping and a published summary; Categories 1, 2A and 2B all produce annual transparency reports under section 77. Ofcom also lists "emerging Category 1" services that meet 75% of the user number condition and a functionality condition. A provider can appeal its categorisation to the Upper Tribunal within a month, and Category 1 and 2A providers were advised to publish risk assessment summaries by November 2026. The thresholds combine UK monthly users with features such as a content recommender system and resharing, so a feature launch can move a service across a line.
- **Transparency notices.** Ofcom issues transparency notices annually to categorised services saying what to publish; draft notices go to providers from November 25, 2026 with representations closing January 20, 2027 ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#the-uk-and-australia)).
- **Fees.** Providers above the revenue threshold notify Ofcom and pay a fee; the tariff for the 2026/27 charging year was set at 0.02232% of qualifying worldwide revenue.
- **Penalties and business disruption.** Fines reach £18 million or 10% of qualifying worldwide revenue, whichever is greater. Ofcom can't close a website; in the most serious cases it applies to a court for business disruption measures that require payment providers or advertisers to withdraw, or internet service providers to block access in the UK. It must pass fines to the Treasury and recover unpaid ones as debts, and it can't bring criminal proceedings once it has imposed a penalty.

Ofcom's enforcement so far has fallen mostly on small and adult services and on non-response: 4chan (£20,000 plus £100 a day in August 2025, then £520,000 in March 2026, made up of £450,000 for no age checks on pornographic content, £50,000 for no illegal content risk assessment and £20,000 for terms of service, each with daily penalties to June 1, 2026); Itai Tech (£50,000 plus £5,000 for not answering information requests); AVS Group (£1 million plus £50,000 for the same); and an unnamed suicide forum, the first service Ofcom investigated, fined £950,000 on May 13, 2026. Three things in those decisions matter for any platform. **Information requests are enforced on their own:** two of the fines include a separate amount for not responding. **Being outside the UK is no defense:** the forum's US provider argued it wasn't subject to UK law, and Ofcom said a service capable of being used from the UK "must comply." **A geoblock has to work:** the forum blocked UK IP addresses on July 1, 2025, a third mirror domain stayed reachable without a VPN until November, and Ofcom found the restrictions "not consistently applied or effective," fined anyway, and prepared a court application to have ISPs block the site.

### Withdrawals

Some services chose to leave rather than comply. Gab and Civitai blocked UK users; a cycling forum and the Microcosm forum host closed, citing the cost of compliance. Imgur is the most cited example, and its trigger was the data protection regulator, not Ofcom: the ICO issued MediaLab, Imgur's owner, a notice of intent to fine on September 10, 2025 in its investigation into how Imgur used children's information and its approach to age assurance, Imgur blocked UK users from September 30, 2025, and the ICO said that "exiting the UK does not allow an organisation to avoid responsibility." It fined MediaLab £247,590 on February 5, 2026 for the period September 2021 to September 2025: no age checks, under-13s' data processed without parental consent, and no data protection impact assessment ([Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#the-imgur-case) covers the children's side).

Withdrawal is an engineering project in its own right, and its consequences reach past the country: an image host's embeds stop rendering on every UK page that used them, accounts held by UK users go dark, and the past processing remains enforceable. [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#leaving-a-country) covers the mechanics of a country exit; this chapter's `geo_restrictions` table holds the decision.

## Australia's eSafety Regime

Australia's Online Safety Act 2021 gives the eSafety Commissioner three tools that reach user-generated platforms:

- **The Basic Online Safety Expectations.** A ministerial determination of what social media, messaging, gaming and other services should do: let users use the service safely, treat children's best interests as a primary consideration, make features such as encryption, anonymous accounts, generative AI and recommender systems safe, minimize unlawful and harmful material, take and respond to reports, and enforce their terms. The Expectations aren't enforceable on their own; the reporting is. eSafety can require one-off (non-periodic) or periodic reports on how a provider meets them, and as of October 2026 it had issued eight periodic notices, seven information requests and 27 non-periodic notices, with summaries published by topic (child sexual exploitation, terrorist content, online hate, AI, gaming, children's use of social media).
- **Codes and standards.** Industry codes registered by eSafety, including Age-Restricted Material Codes: three (hosting, internet carriage, search) in effect from December 27, 2025 and six (app stores, equipment, social media core features and messaging features, relevant electronic services, designated internet services) from March 9, 2026.
- **The social media minimum age.** From December 10, 2025, age-restricted social media platforms must take reasonable steps to prevent Australians under 16 from creating or keeping an account. eSafety's view is that Facebook, Instagram, Snapchat, Threads, TikTok, Twitch, X, YouTube, Kick and Reddit are age-restricted platforms, "among others"; online gaming and standalone messaging are excluded by ministerial rules (amended in March 2026), though messaging services with social-media-style features may be in. There's no penalty for children or parents. A court can order a platform that fails to take reasonable steps to pay up to 300,000 penalty units, which eSafety puts at A$109.2 million after the Online Safety Amendment (Strengthening Enforcement for the Social Media Minimum Age) Bill 2026 passed on September 10, 2026, which also lets eSafety compel information from age assurance providers and app stores and require individuals to attend and answer questions. Platforms removed access to 4.7 million under-16 accounts by mid-December 2025, and eSafety's March 2026 compliance update drew on compulsory notices to the ten named platforms.

The enforcement record that matters most for builders is about transparency notices. X failed to comply fully with a February 2023 non-periodic notice about child sexual exploitation material, argued it wasn't bound after merging with Twitter, lost at first instance and on appeal, admitted breaching section 57 (its report didn't follow the manner and form the notice specified), and was ordered in 2026 to pay A$650,000 plus A$100,000 in costs. The lesson is the same as Ofcom's: the answer to a regulator's question is a regulated deliverable, with a format and a deadline, and the penalty attaches to the answer.

## US Regulators as Platform Regulators

The US has no single online safety regulator, and Section 230 still shields most moderation decisions ([The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#section-230)). Regulators reach platforms through narrower statutes:

- **The FTC** enforces COPPA, its Section 5 authority over unfair and deceptive practices (a platform's own promises about moderation, privacy and safety), the fees and fake reviews rules for marketplaces, and the TAKE IT DOWN Act's 48-hour removal duty for intimate images. Minors are [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#coppa-and-age-checks); intimate images are [Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse#the-take-it-down-act).
- **State attorneys general** enforce state minors' laws and transparency statutes. New York's Stop Hiding Hate Act requires social media companies with more than $100 million in annual gross revenue to file their terms of service and moderation data with the Attorney General twice a year, with civil penalties of up to $15,000 per violation per day after a 30-day cure period. Reddit, Discord, Twitch (through Amazon), Kick, Snap and X are among the filers listed ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#us-state-filings)).
- **NCMEC** is not a regulator, but the CyberTipline is a statutory reporting duty with fines ([Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#the-reporting-duty)).

## The Enforcement Ledger

Every action below targets a platform's process. Amounts are as announced; appeals and payment status are noted where known, as of October 2026:

| Date | Regulator | Platform | Law | Outcome |
| --- | --- | --- | --- | --- |
| June 18, 2025 | European Commission | AliExpress | DSA | Binding commitments on ad and recommender transparency and illegal product risks |
| August 2025 | Ofcom | 4chan | Online Safety Act | £20,000 plus £100 a day |
| September 10, 2025 | ICO | MediaLab (Imgur) | UK GDPR | Notice of intent to fine; Imgur blocks UK users from September 30 |
| November 2025 | Ofcom | Itai Tech | Online Safety Act | £50,000 plus £5,000 for not answering information requests |
| December 2025 | Ofcom | AVS Group | Online Safety Act | £1 million plus £50,000 for not answering information requests |
| December 5, 2025 | European Commission | X | DSA | €120 million: deceptive paid checkmark, ad repository, researcher access |
| December 5, 2025 | European Commission | TikTok | DSA | Binding commitments on its ad repository |
| February 5, 2026 | ICO | MediaLab (Imgur) | UK GDPR | £247,590: no age checks, under-13 data without consent, no DPIA |
| February 6, 2026 | European Commission | TikTok | DSA | Preliminary findings on addictive design (Articles 34 and 35) |
| March 2026 | Ofcom | 4chan | Online Safety Act | £520,000 with daily penalties; 4chan says it won't pay |
| March 26, 2026 | European Commission | Four adult platforms | DSA | Preliminary findings on minors' access through self-declared age |
| May 13, 2026 | Ofcom | Unnamed suicide forum | Online Safety Act | £950,000; ineffective geoblock; court blocking application prepared |
| May 28, 2026 | European Commission | Temu | DSA | €200 million for risk assessment of illegal products |
| June 2026 | Federal Court of Australia | X | Online Safety Act 2021 | A$650,000 plus A$100,000 costs for a non-compliant transparency notice response |
| July 20, 2026 | European Commission | AliExpress | DSA | €550 million for illegal and unsafe product risks; appeal announced in press reports |

Keep a ledger like this inside the platform too, for the platform's own matters: every regulator contact, request, finding, commitment and deadline, with the people responsible. The table that holds it is `regulator_requests` below.

## Geoblocking, Withholding and Withdrawal

A platform has four geographic responses to a law, and they're different operations:

1. **Withhold one item in one country.** A court or authority says a post is illegal in its territory; the platform keeps it up elsewhere and blocks it on requests from that country. Pinterest's transparency report shows the pattern: of 24,785 government removal requests in the second half of 2025, 3,173 led to content blocked in-territory only because it didn't break Pinterest's own rules ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#what-the-voluntary-reports-count)).
2. **Change the product in one country.** Different defaults, age checks or features for users there, as several platforms did for the UK's July 2025 children's deadline.
3. **Block the whole service in one country.** Imgur's UK exit; Gab and Civitai.
4. **Change the product everywhere.** Often cheaper than per-country variants: one set of teen defaults instead of four.

The rules for building them:

- **Decide on the request, record on the row.** Whether a viewer can see an item depends on where the viewer is, not where the author is ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model)'s design notes), so the check runs at serving time against a table of restrictions, not a column on the content.
- **Say why.** HTTP 451 (Unavailable For Legal Reasons) exists for this: the response body "should" explain the legal demand, who made it and under which law, and a `Link` header with `rel="blocked-by"` names the entity doing the blocking. The DSA also requires the statement of reasons to give a restriction's territorial scope.
- **A geoblock is a control you have to prove.** Ofcom fined a forum whose block had gaps through mirror domains. Block by account country as well as by IP where accounts exist, cover every host name and embed path, and test the block from the country on a schedule.
- **Embeds and APIs are surfaces.** A withdrawn image host's embeds break on third-party pages; an API or federation feed can leak withheld content to a client in the blocked country. Apply restrictions at the API and the media edge, not only in the web app.

## Regulator Requests and Their Clocks

Every regime gives the regulator a power to demand information, and every enforcement record above includes penalties for not answering or answering badly: the DSA's 1% fine for incorrect, incomplete or misleading information, Ofcom's separate fines for ignoring information notices, eSafety's case against X over the form of its response. Treat a regulator request like a legal process request ([Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-operating-model)), with intake, an owner, a deadline computed and stored when it arrives ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), a response assembled from the same records that produce transparency reports, and a record of exactly what was sent. The format matters as much as the content: the X judgment turned on the manner and form of the report.

## How to Build It

The chapter's additions: duties as rules data, designations, regulator requests, trusted flaggers, dispute bodies' cases, geographic restrictions, and the DSA fields on reports and decisions.

```sql
CREATE TABLE regime_duties (             -- what each regime requires, as dated rules
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  regime         TEXT NOT NULL CHECK (regime IN ('eu_dsa', 'uk_osa', 'au_osa', 'us_coppa',
                   'us_take_it_down', 'ny_stop_hiding_hate', 'uk_gdpr')),
  duty           TEXT NOT NULL,          -- 'statement_of_reasons', 'systemic_risk_assessment', ...
  legal_ref      TEXT NOT NULL,          -- 'DSA Art. 17', 'OSA s. 77', 'OSA 2021 s. 63D'
  applies_to     TEXT NOT NULL,          -- service class or designation it attaches to
  threshold      JSONB,                  -- users, revenue, features, when the duty depends on them
  effective      DATERANGE NOT NULL,
  source_url     TEXT NOT NULL           -- the statute, code or guidance it came from
);

CREATE TABLE service_designations (      -- the tier a regulator has put the service in
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  regime         TEXT NOT NULL,
  designation    TEXT NOT NULL CHECK (designation IN ('hosting_service', 'online_platform',
                   'vlop', 'vlose', 'osa_category_1', 'osa_category_2a', 'osa_category_2b',
                   'osa_emerging_category_1', 'au_age_restricted_platform')),
  notified_on    DATE,                   -- the clock starts here (DSA: four months)
  duties_apply_from DATE,
  valid_during   DATERANGE NOT NULL,
  appealed       BOOLEAN NOT NULL DEFAULT FALSE,
  source_ref     TEXT NOT NULL           -- decision, register entry or notice
);

CREATE TABLE regulator_requests (        -- every information request, notice and inquiry
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  regulator      TEXT NOT NULL,          -- 'european_commission', 'cnam', 'ofcom', 'esafety', 'ico'
  regime         TEXT NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('information_request', 'transparency_notice',
                   'periodic_notice', 'investigation', 'preliminary_findings', 'decision',
                   'commitments', 'action_plan', 'dispute_body_request')),
  reference      TEXT,                   -- the regulator's own reference
  received_at    TIMESTAMPTZ NOT NULL,
  due_at         TIMESTAMPTZ,            -- computed from the request and stored
  format_spec    TEXT,                   -- the manner and form the response must take
  status         TEXT NOT NULL CHECK (status IN ('received', 'in_progress', 'responded',
                   'extended', 'closed')),
  owner_account_id UUID REFERENCES accounts (id),  -- staff accountable for the answer
  response_ref   TEXT,                   -- exactly what was sent, kept immutable
  responded_at   TIMESTAMPTZ
);

CREATE TABLE trusted_flaggers (          -- synced from the Commission's published list
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  name           TEXT NOT NULL,
  awarding_coordinator TEXT NOT NULL,    -- e.g. 'IE-CnaM'
  expertise      TEXT[] NOT NULL,        -- policy categories it may flag with priority
  status         TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'revoked')),
  valid_during   DATERANGE NOT NULL,
  contact_domains TEXT[],                -- to recognize notices at intake
  synced_at      TIMESTAMPTZ NOT NULL
);

-- On top of Abuse Desks' reports columns (nullable reporter_id, reporter_contact,
-- intake_channel, external_ref, acknowledged_at): who the notifier is in DSA terms.
ALTER TABLE reports
  ADD COLUMN notifier_kind     TEXT NOT NULL DEFAULT 'user' CHECK (notifier_kind IN ('user',
                                 'non_user', 'trusted_flagger', 'authority')),
  ADD COLUMN trusted_flagger_id UUID REFERENCES trusted_flaggers (id),
  ADD COLUMN is_illegal_content_notice BOOLEAN NOT NULL DEFAULT FALSE,  -- an Art. 16 notice
  ADD COLUMN legal_notice_id   UUID REFERENCES legal_notices (id),  -- its 'dsa_notice' row
  ADD COLUMN legal_reference   TEXT,     -- the law the notifier says is broken
  ADD COLUMN notifier_country  CHAR(2),
  ADD CONSTRAINT reports_trusted_flagger
    CHECK ((notifier_kind = 'trusted_flagger') = (trusted_flagger_id IS NOT NULL)),
  ADD CONSTRAINT reports_user_is_account
    CHECK (notifier_kind <> 'user' OR reporter_id IS NOT NULL);

ALTER TABLE moderation_decisions
  ADD COLUMN legal_ground       TEXT CHECK (legal_ground IN ('illegal_content',
                                  'terms_of_service')),
  ADD COLUMN legal_reference    TEXT,    -- the law or the terms clause relied on
  ADD COLUMN territorial_scope  TEXT[],  -- ISO country codes, or '{*}' for everywhere
  ADD COLUMN statement_sent_at  TIMESTAMPTZ,
  ADD COLUMN transparency_db_id TEXT,    -- the Commission database's id for the statement
  ADD COLUMN transparency_db_submitted_at TIMESTAMPTZ;

CREATE TABLE out_of_court_disputes (     -- a certified body's case about one decision
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  decision_id    UUID NOT NULL REFERENCES moderation_decisions (id),
  body           TEXT NOT NULL,          -- the certified body
  body_reference TEXT NOT NULL,
  received_at    TIMESTAMPTZ NOT NULL,
  content_supplied_at TIMESTAMPTZ,       -- not supplying it loses by default
  outcome        TEXT CHECK (outcome IN ('upheld', 'overturned', 'default_for_user',
                   'withdrawn', 'refused_duplicate')),
  outcome_at     TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,            -- Art. 24(1) asks how many were implemented
  fee_amount     BIGINT,                 -- minor units; paid by the platform if the user wins
  fee_currency   CHAR(3)
);

CREATE TABLE geo_restrictions (          -- withheld in a country, or the service withdrawn
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  scope          TEXT NOT NULL CHECK (scope IN ('content_item', 'media_asset', 'account',
                   'community', 'feature', 'service')),
  subject_id     UUID,                   -- null when scope = 'service' or 'feature'
  feature        TEXT,                   -- when scope = 'feature'
  country        CHAR(2) NOT NULL,
  basis          TEXT NOT NULL CHECK (basis IN ('court_order', 'authority_order',
                   'local_law_notice', 'regulatory_withdrawal', 'sanctions', 'business')),
  decision_id    UUID REFERENCES moderation_decisions (id),
  legal_reference TEXT,
  valid_during   TSTZRANGE NOT NULL,
  CHECK ((scope IN ('service', 'feature')) = (subject_id IS NULL))
);
```

Notes on the sketch:

- **Duties are data with sources.** `regime_duties` and `service_designations` together answer "what must this service do in this country today?", and both carry effective dates and the source they came from, the [Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions) pattern. A designation row with `notified_on` computes `duties_apply_from` (four months under the DSA), and a backlog of product changes hangs off it.
- **Reports know who sent them.** `notifier_kind` distinguishes a member's report, a non-user's Article 16 notice through a web form, a trusted flagger and an authority. Intake sets the priority lane from it, and the Article 15 report counts notices by trusted flaggers from the same column ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#how-to-build-it)). The report stays the intake record for every channel ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks#how-to-build-it) made the reporter optional and added the channel); a non-user's report has no `reporter_id`, so it can't be a `user` report. A report can be both a terms report and an illegal content notice; the flag says so, as the Gaming volume's [Digital Services Act](/books/gaming/player-behavior#the-digital-services-act) section describes, and an Article 16 notice also gets a `dsa_notice` row in the `legal_notices` table of [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#how-to-build-it), which carries its clock and validity.
- **The decision row carries the statement.** Legal ground, the law or clause relied on, territorial scope, when the statement went to the user and the database id are all columns on the playbook's `moderation_decisions`, so the statement, the database submission, a dispute body's request and the transparency counts are queries over one row. Submission to the Transparency Database is a [background job](/docs/architecture/background-jobs) with retries that writes `transparency_db_id` back.
- **Dispute outcomes are decisions too.** An overturn by a dispute body that the platform implements becomes a new `moderation_decisions` row that reviews the original, and `implemented_at` on the dispute records when, so the restoration flows through the same path as an internal appeal ([Appeals](/docs/security/trust-and-safety#appeals)).
- **Geographic restrictions are their own rows.** The serving path checks `geo_restrictions` for the item, its author, its community and the service against the viewer's country, and answers 451 with the legal basis. A whole-country withdrawal is a `service` row; [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#how-to-build-it) adds the sunset plan around it.
- **Events:** `designation.notified`, `regulator_request.received`, `regulator_request.due_soon`, `trusted_flagger.status_changed`, `dispute.received`, `dispute.decided` and `geo_restriction.applied` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the trust and safety tools, legal, and the serving edge.

## Auditing

- **Every designation and its date,** and the duties it switched on, so "when did we become subject to Article 38?" has an answer.
- **Every regulator request and response,** exactly as sent, with who approved it and when. The X cases in Brussels and Melbourne were about what was sent and in what form.
- **Every Article 16 notice** with its notifier kind, its handling time and outcome, including the trusted flagger lane.
- **Every statement of reasons** with its database submission id, and every dispute body case with the content supplied, the outcome and whether it was implemented.
- **Every geographic restriction** with its legal basis, scope and the tests that showed it worked.
- **Every self-assessment the regulator might test:** risk assessments by version, the measurement behind them (detection precision, queue load, time to removal), and the audit reports. The AliExpress decision is a reminder that a regulator will compare the claims to the data.

The record mechanics are [Audit Trails](/docs/architecture/audit-trails); the moderation decision audit is [Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions).

## What This Means for the System You Build

- **Model each regime's duties as dated data** with sources, keyed by the service's designation in that regime, and expect the designation to change.
- **Treat a designation as a product deadline:** the DSA gives four months, and the very large tier adds a non-profiling feed, an ad repository and researcher access.
- **Answer regulators from the same records** that produce transparency reports, in the format asked for, on a stored deadline with an owner.
- **Tell reports from notices** and record who sent each: member, non-user, trusted flagger or authority, with a priority lane for trusted flaggers kept in sync with the published list.
- **Put the statement of reasons on the decision row:** ground, legal reference, territorial scope, sent time and database id.
- **Be ready for dispute bodies:** produce the content and decision by case reference, implement outcomes through the appeal path, and pay the fees.
- **Measure your own moderation** (precision, time to removal, reviewer load), because regulators fine claims that the numbers don't support.
- **Restrict by country at serving time,** answer with 451 and the legal basis, cover APIs, embeds and mirrors, and test blocks from the country.
- **Plan withdrawal as an operation,** not an announcement: accounts, embeds, exports and past liability all survive it.
- **Keep a ledger** of every regulator matter, finding, commitment and deadline.

## References

**Law and regulation**

- [DSA Article 21: Out-of-court dispute settlement](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_21.html), certification, fees, the 90-day and 180-day limits, good-faith engagement
- [DSA Article 22: Trusted flaggers](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_22.html), priority handling, conditions, reporting imprecise notices, the Commission's list
- [DSA Article 24: Transparency reporting obligations for providers of online platforms](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_24.html), dispute and suspension counts, average monthly active recipients every six months, database submission
- [DSA Article 33: Very large online platforms and search engines](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_33.html), the 45 million threshold and the four-month start
- [DSA Article 13: Legal representatives](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_13.html), representatives for providers without an EU establishment
- [DSA Article 37: Independent audit](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_37.html), annual audits and the one-month implementation report
- [DSA Article 38: Recommender systems](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_38.html), the non-profiling option
- [DSA Article 42: Transparency reporting obligations](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_42.html), six-monthly reports, staff per language, publication of risk assessments and audits
- [DSA Article 74: Fines](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_74.html), 6% for infringements, 1% for incorrect information or refusing inspection
- [DSA Article 76: Periodic penalty payments](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_76.html), up to 5% of average daily income or turnover
- [RFC 7725: An HTTP Status Code to Report Legal Obstacles](https://www.rfc-editor.org/rfc/rfc7725.html), status 451, the explanation in the body and the `blocked-by` link

**Regulators**

- [Ofcom: Online Safety industry bulletin, October 2026](https://www.ofcom.org.uk/online-safety/protecting-children/online-safety-industry-bulletin-october-2026), intimate image hash matching scope, the 48-hour takedown duty timeline, risk assessment summaries, transparency notice process, the 2026/27 fee tariff
- [Ofcom: Ofcom fines online suicide forum £950,000](https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/ofcom-fines-online-suicide-forum-950000), the ineffective geoblock and mirrors, jurisdiction over a US provider, business disruption measures, fines passed to the Treasury
- [eSafety Commissioner: Social media age restrictions](https://www.esafety.gov.au/about-us/industry-regulation/social-media-age-restrictions), the December 10, 2025 start, the named platforms, exclusions, penalty units and A$109.2 million, the 4.7 million accounts, the 2026 amendment's powers, the Age-Restricted Material Codes dates
- [eSafety Commissioner: Basic Online Safety Expectations](https://www.esafety.gov.au/industry/basic-online-safety-expectations), the Expectations, periodic and non-periodic notices and their counts
- [ICO: Statement on the Imgur investigation (September 30, 2025)](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/09/statement-update-on-imgur-investigation/), the notice of intent and "exiting the UK"
- [ICO: ICO fines Imgur owner MediaLab over children's privacy failures](https://ico-newsroom.prgloo.com/news/ico-finesimgurownermedialabover-childrens-privacy-failures), the £247,590 fine, findings and period
- [New York Attorney General: Stop Hiding Hate Act](https://ag.ny.gov/resources/organizations/social-media-tos-reporting/stop-hiding-hate-act), coverage, report contents and penalties
- [New York Attorney General: Social media terms of service reports](https://ag.ny.gov/resources/organizations/social-media-tos-reporting/reports), the filers

**Enforcement reporting**

- [Hunton: Commission designates ChatGPT, Reddit and Roblox under the DSA](https://www.hunton.com/privacy-and-cybersecurity-law-blog/european-commission-designates-chatgpt-reddit-and-roblox-under-the-digital-services-act), the August 31, 2026 designations, 28 services, the January 2027 deadline
- [Loyens & Loeff: DSA enforcement in practice](https://www.loyensloeff.com/insights/news--events/news/dsa-enforcement-in-practice-from-rules-to-commitments-and-fines/), commitments, fines, preliminary findings and investigations through May 2026
- [eucrim: EU fines X €120 million in first DSA non-compliance decision](https://eucrim.eu/news/eu-fines-x-120-million-in-first-dsa-non-compliance-decision/), the three breaches and the working-day deadlines
- [Law Society Gazette: AliExpress handed €550 million DSA fine](https://www.lawsociety.ie/gazette/top-stories/2026/july/aliexpress-handed-550-million-dsa-fine/), the July 20, 2026 decision, findings and action plan date
- [Law Society Gazette: CnaM names three more as trusted flaggers](https://www.lawsociety.ie/gazette/top-stories/2026/june/cnam-names-three-more-as-trusted-flaggers/), the June 2026 designations and three-year status
- [techbuzzireland: Appeals Centre Europe report](https://techbuzzireland.com/2026/05/28/ireland-data-in-new-appeals-centre-report/), disputes, decisions, overturn rates and default decisions for April 2025 to March 2026
- [RPC: Ofcom publishes register of categorised services](https://www.rpclegal.com/thinking/media/ofcom-publishes-register-of-categorised-services/), the July 10, 2026 register, duties by category, emerging Category 1, appeals
- [Wikipedia: Online Safety Act 2023](https://en.wikipedia.org/wiki/Online_Safety_Act_2023), Ofcom's fines, penalty maxima, business disruption, withdrawals and closures, age checks by Bluesky and Reddit
- [Help Net Security: Ofcom fines 4chan over age checks](https://www.helpnetsecurity.com/2026/03/19/uk-ofcom-4chan-age-checks-fine/), the £520,000 breakdown and daily penalties
- [The Lawyer Magazine: Federal Court makes X pay $750k](https://www.thelawyermag.com/au/practice-areas/litigation-dispute-resolution/federal-court-makes-elon-musks-x-pay-750k-after-finding-breach-of-online-safety-act/577167), the penalty, costs, section 57 and the 2023 notice
- [ABC: Australia to enforce social media age limit of 16](https://abc13.com/post/australia-enforce-social-media-age-limit-16-week-fines-33-million/18251734/), the platforms named at launch and eSafety's notices

**Transparency reports**

- [Pinterest: Transparency report, July to December 2025](https://policy.pinterest.com/en/transparency-report), government removal requests and in-territory blocking
