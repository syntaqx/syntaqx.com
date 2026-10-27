+++
title = "Terrorism, Violent Extremism & Graphic Content"
nav_title = "Extremism & Graphic Content"
description = "GIFCT hash sharing and incident response, the Christchurch Call, EU one-hour removal orders, livestreamed attacks, and gore, warning screens and newsworthiness."
category = "User-Generated Platforms Industry"
order = 1837
part = "Trust and Safety"
tags = ["trust-and-safety", "violent-extremism", "terrorist-content", "livestreaming", "graphic-content", "hash-matching"]
+++

Terrorist and violent extremist content is the harm where the industry cooperates most and the law moves fastest. A video of an attack, filmed by the attacker and made to be shared, is worthless to the platform that hosts it and valuable only to the people who made it; nobody argues for keeping it up, and every platform that removes a copy wants every other platform to remove theirs. So the field has shared infrastructure that most harms lack: a cross-industry hash database run by a nonprofit, an incident protocol that turns on within hours of an attack, a government-and-industry compact named after the attack that created it, and an EU regulation that gives a hosting provider one hour to comply with a removal order. None of it is optional for a platform that hosts uploads and lets strangers see them.

The same chapter has to hold the opposite problem. Most violent imagery on a user-generated platform isn't terrorist propaganda: it's war footage, police violence, the aftermath of an accident, a medical procedure, a hunting video, a documentary. Some of it is the most important material on the platform, and removing it erases evidence and news. Platforms handle that with a different set of tools: warning screens that make viewers click through, age restrictions instead of removals, blur by default, and a newsworthiness exception that lets a policy team keep up something the rules would otherwise remove.

This chapter covers both: the shared machinery for terrorist content (GIFCT, incident response, the Christchurch Call, EU removal orders), livestreamed attacks, and the handling of graphic content that stays up. The general moderation machinery (policy, queues, ladders, notices, appeals) is the playbook's [Trust & Safety](/docs/security/trust-and-safety); hashing technology and list hygiene are in [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#hash-matching). None of this is legal advice.

## How the Platforms Do It

The published practice converges on a few patterns:

| Practice | Who publishes it | What it looks like |
| --- | --- | --- |
| **Shared hashes of known terrorist content** | GIFCT members integrated into its hash-sharing database include Discord, Dropbox, Facebook, Instagram, Google, Microsoft, Pinterest, Twitch, Vimeo, X and YouTube | Each member matches uploads against shared hashes and decides the action under its own terms |
| **Incident response after attacks** | GIFCT's Incident Response Framework, activated 7 times in 2024 and 14 times in 2025 | A protocol that alerts members, opens hash sharing for one event's perpetrator content, and closes when re-upload attempts subside |
| **Hash matching plus human review** | Reddit, second half of 2025: automated tools (including hash matching) flagged 2,200 items, 696 were removed after human review, with all associated accounts permanently suspended; 166 user reports led to 136 removals | Automation finds, people confirm, accounts go to the top of the ladder |
| **Zero tolerance at the account level** | Discord ("a zero-tolerance policy towards violent extremism"), Reddit (permanent suspension of associated accounts), Meta (a Live ban for a first violation of its most serious policies) | Severity skips the ladder ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)) |
| **Graphic content kept up behind a gate** | YouTube age-restricts instead of removing when context is enough; Meta puts allowed disturbing content behind a warning screen and may limit it to adults | Interstitials, age gates, signed-in requirements |
| **Blur by default** | Discord blurs possibly sensitive media for teens by default, and for all UK users since July 21, 2025; Bluesky's labelers can hide, block or blur content per user setting | The viewer sees a placeholder and chooses to reveal |
| **A documented newsworthiness exception** | Meta: 44 documented newsworthy allowances from June 2024 to June 2025, up from 32 the year before | Escalation to a policy team, a balancing test, a record |

The pattern under all of it: **terrorist content is a list problem, graphic content is a context problem.** Known propaganda and attack footage are matched against lists and removed with little judgment; violent imagery that might be news is judged in context and usually kept behind a gate rather than removed. A platform that treats the two the same either leaves propaganda up while it deliberates or deletes the war crimes archive.

## GIFCT and Hash Sharing

The Global Internet Forum to Counter Terrorism (GIFCT) grew from four founding companies into an independent organization with more than 30 member platforms. Its main tool for a platform is the **hash-sharing database (HSDB)**: a shared store of hashes ("digital fingerprints") of known terrorist and violent extremist content, contributed by members and queried by members.

**What it holds.** The database takes cryptographic hashes (GIFCT names MD5 and SHA-256) for exact copies and perceptual hashes (PDQ for images, TMK for video) for visually similar ones; content forms are images, videos, PDFs and URLs. At the end of 2024 it held about 2.3 million hashes for about 408,000 unique items: roughly 330,000 visually distinct images, 78,000 visually distinct videos and 200 PDFs. The hash count fell slightly from 2023 while unique items rose by 38,000, because members reviewed their submissions and removed hashes no longer needed. How these algorithms work, and how exact and perceptual matching differ in cost and error, is in [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#hash-matching).

**What gets in.** Inclusion follows a published taxonomy rather than any one government's list. It began with images and videos from entities on the UN Security Council's 1267 (Al-Qaida and ISIL) sanctions list, expanded in 2019 to perpetrator footage of livestreamed or recorded attacks, and after a 2021 taxonomy report to attacker manifestos, branded propaganda PDFs and URLs pointing at covered content. Every hash carries labels, and the labels are what let a member write policy against the list:

- **Entity labels** tie content to a designated organization on the 1267 list.
- **Behavioral labels** say what the content does. At the end of 2024 about 91% of hashes had one: glorification of terrorist acts (75.94%), graphic violence from offline terrorist or violent extremist events (16.65%), recruitment and instruction (5.27%) and imminent credible threats (2.14%).
- **Incident labels** tie content to an attack that activated the Incident Response Framework. About 13% of hashes had one; the largest shares were Udaipur, India (40.38% of incident-labeled hashes), Christchurch (30.68%), Buffalo (15.63%), Halle (10.90%) and Memphis (1.21%).

**Who gets access.** Only member companies, and only those that have signed GIFCT's information-sharing agreement; use of the database must follow its code of conduct. Membership reached 33 at the end of 2024, and seven companies joined in 2025 (Anthropic, SoundCloud, Roblox, TikTok, GitHub, Snap Inc. and 4D Hype), a record year by GIFCT's account. Joining requires meeting published membership criteria, which is a reason to have a terrorism policy, a reporting path and a transparency report before applying.

**What a match means.** "Adding hashes does not prompt any direct or automatic action on another member's platform," in GIFCT's words: each member decides what to do with content that matches, under its own terms. That design choice shapes the integration:

- **Act per label, not per list.** A match labeled "imminent credible threat" or carrying an incident label is a different decision from one labeled "glorification", and a hash with a 1267 entity label means something different in a news context. Store the labels on the match (`hash_matches` carries them) and route by label.
- **Exact matches can act without a viewer; near matches need one.** An exact cryptographic match on perpetrator footage can be removed or blocked at upload with no person watching it. A perceptual match within a distance threshold can be a news report that embeds a frame, a debunk, or a researcher's archive, and goes to review.
- **Feedback is part of the deal.** Members can mark whether they agree with a hash's labels and inclusion; at the end of 2024 about 2% of hashes had feedback, mostly agreeing. Members remove hashes after their own reviews, after feedback, when context changes, or when they no longer retain the underlying content.
- **Contribute what you remove.** A platform that only consumes the list gets the industry's past; one that contributes hashes of what its own reviewers confirm helps the next platform. Contribution means hashing the content before deletion and keeping the decision that justified it.

## Incident Response

The **Incident Response Framework (IRF)** is how GIFCT and its members respond when an offline attack has an online dimension: GIFCT acts as a communications hub, shares situational awareness, and, for the activation types that allow it, opens hash sharing for the perpetrator's content. Its first form, the **Content Incident Protocol (CIP)**, was modeled on the response to the March 2019 Christchurch attack.

**The levels, then and now.** Until 2025 the IRF had three response types: Incident, Content Incident and Content Incident Protocol. From its creation in 2019 to the end of 2024 it was activated 21 times (11 Incidents, 2 Content Incidents, 8 CIPs), seven of them in 2024 (Perry, Iowa; Levittown, Pennsylvania; Mumbai; Moscow; Eskişehir, Türkiye; Volgograd; and Aleppo). After a review informed by its incident-response working group, GIFCT retired those types in 2025 and replaced them with three non-hierarchical ones:

| Activation type | When it applies |
| --- | --- |
| **Perpetrator Content Incident** | Online, perpetrator-produced content directly related to a terrorist or violent extremist event |
| **Digital Footprint Incident** | The perpetrators or accomplices have a significant online presence but didn't produce media as part of the attack |
| **Incident Advisory** | An extremely unclear information environment, or an event not obviously time-bound |

The IRF was activated 14 times in 2025.

**What activates hash sharing.** The criteria GIFCT published for the Louisville activation in April 2023 show the shape: a livestreamed video of the attack, apparently produced and distributed by the perpetrator; depicting attempted violence against people; shared on a member platform. All three had to hold.

**What an activation looks like.** GIFCT's public notices give a timeline that a platform's own incident mode should mirror:

| Step | Louisville CIP (April 2023) | Bistrița, Romania PCI (October 2026) |
| --- | --- | --- |
| Before activation | | GIFCT and members already communicating about the offline violence |
| Activation | 12:02 p.m. EDT, April 10 | 12:24 p.m. EST, October 19 |
| During | Members alerted; hashes of perpetrator video and images shared; affected government, GIFCT's Independent Advisory Committee and the EU and Christchurch Call crisis protocols notified | Members alerted; open-source information on the event shared; hashes shared; members enforce under their own terms; Romanian government and the advisory committee notified |
| Conclusion | 4:00 a.m. EDT, April 11 | 4:47 p.m. EST, October 20 |
| Why it closed | Time since the violence ended, and member reports of re-upload attempts | The same two tests |
| Hashes | About 3, for one visually distinct video | 3 visually distinct items, with more possible after close |
| After | Multi-stakeholder debrief; research from GIFCT's academic network | The same |

Three things to take from it. **Activations last hours to about a day,** and the platform's surge staffing must be ready in minutes, not scheduled for the next shift. **Hash counts per incident are small** (a handful of distinct items), because the job is catching copies, crops and re-encodes of a few videos, which is why perceptual matching and a low review threshold matter during the window. And **the end of an activation isn't the end of matching:** GIFCT notes that members may keep adding hashes, and its 2024 report shows hashes added per incident across the year as people keep trying new versions.

A platform's own incident mode follows from that:

1. **Declare an incident** from an external activation (GIFCT, a government crisis protocol) or internal signals (a spike in reports of one video), with a start time and an owner.
2. **Load the incident's hashes** from the shared database as they arrive, and add your own as reviewers confirm new variants.
3. **Tighten the bands for that incident only:** auto-remove exact matches, quarantine near matches pending review, and hold new uploads that match the incident's audio or visual signature for review before they're visible ([Automated Detection, Human Review](/docs/security/trust-and-safety#automated-detection-human-review)).
4. **Staff a live queue** for reports tied to the incident, and pull reviewers from other queues with the exposure rules in [Reviewer Wellbeing](/books/user-generated-platforms/moderation-at-scale#reviewer-wellbeing).
5. **Watch search, recommendations and trending:** suppress the event's names and hashes from autocomplete and recommendation surfaces while the incident is open.
6. **Close with a record:** when it ended, why, what was added and removed, and what the debrief found.

## The Christchurch Call

On 15 March 2019 an attack on two mosques in Christchurch, New Zealand, killed 51 people and was livestreamed on Facebook. Meta's account of the hours after is the reference case for why the machinery above exists: fewer than 200 people watched during the live broadcast; about 4,000 views happened before removal; the first user report came 29 minutes after the video started and 12 minutes after the broadcast ended; and in the first 24 hours Facebook removed about 1.5 million videos of the attack, more than 1.2 million of them blocked at upload. Copies kept coming in variants (screen recordings among them) that defeated the first hash, which led Meta to add detection including audio matching, and it shared more than 800 visually distinct videos through GIFCT's database.

Two months later, on 15 May 2019 in Paris, New Zealand and France launched the **Christchurch Call**: commitments by governments and online service providers against terrorist and violent extremist content online, to be delivered transparently and in ways that uphold human rights and a free, open, secure internet. Two outcomes shape what a platform deals with today:

- **A shared crisis response protocol.** On 23 September 2019, at the UN General Assembly, New Zealand and France announced a shared protocol for governments and companies to respond together to livestreamed terrorist content after an attack. GIFCT's activation notices list the Christchurch Call and EU crisis protocols among the parties it notifies.
- **An independent GIFCT.** At the same event the companies announced GIFCT's relaunch as an independent, staffed legal entity with a mandate covering violent extremism as well as terrorism; the Call then counted 58 country and company supporters.

As of October 2026, the Call is carried by the **Christchurch Call Foundation**, which says supporters have made 25 commitments, delivered with civil society and partner organizations. For a platform the practical effects are two: joining as a supporter is a public commitment worth taking only with the machinery in place, and in a crisis the government and industry protocols are channels the platform should already have contacts for, not discover during the event.

## EU Removal Orders

The EU's **Terrorist Content Online Regulation (EU) 2021/784** (the TCO Regulation) has applied since 7 June 2022. It applies to hosting service providers offering services in the EU, wherever they're established, insofar as they disseminate information to the public; interpersonal communications such as email and private messaging are outside it, and so are conduits, caches, registrars and DNS providers. Material disseminated for educational, journalistic, artistic or research purposes, or to prevent or counter terrorism, isn't terrorist content under the Regulation. What it requires of a platform:

| Duty | Article | What it means |
| --- | --- | --- |
| **Remove within one hour** | Art. 3(3) | On receipt of a removal order from a competent authority, remove or disable access "in all Member States as soon as possible and in any event within one hour" |
| **12-hour first-order notice** | Art. 3(2) | An authority issuing its first order to a provider must send information on procedures and deadlines at least 12 hours before, except in duly justified emergencies |
| **What an order contains** | Art. 3(4) | The authority's identification and authentication, a statement of reasons, the exact URL, the legal basis, a date, time stamp and electronic signature, redress information, and any decision to withhold notice from the uploader |
| **Report back** | Art. 3(6) to 3(8) | Tell the authority when the content came down (Annex II); if force majeure or de facto impossibility stops you, say so (Annex III) and the hour runs from when the obstacle ends; if the order has manifest errors or too little information, ask for clarification and the hour runs from the answer |
| **Cross-border scrutiny** | Art. 4 | An order from another Member State's authority is copied to the authority where the provider is established, which may scrutinize it within 72 hours; provider and uploader may request scrutiny within 48 hours; if the order is found to infringe, the provider reinstates immediately |
| **Specific measures if exposed** | Art. 5 | An authority may decide a provider is "exposed to terrorist content", for example after two or more final removal orders in 12 months; the provider must then take specific measures of its choice (staffing, technical means, user flagging, other), report on them within three months and annually, with human oversight of any automated tools; no general monitoring obligation and no obligation to use automated tools |
| **Preserve for six months** | Art. 6 | Content removed under an order or specific measures, and related data, kept six months from removal for review proceedings and for preventing, detecting, investigating and prosecuting terrorist offences; longer on request while proceedings run |
| **Transparency** | Art. 7 | Terms must explain the policy, including automated tools; a provider that took action in a year publishes a report before 1 March of the next year: measures, re-upload prevention, items removed, orders not executed and why, complaints and outcomes, reinstatements |
| **Complaints** | Art. 10 | A mechanism for uploaders whose content was removed under specific measures; examine expeditiously and tell the complainant the outcome within two weeks |
| **Tell the uploader** | Art. 11 | Inform the uploader of a removal, with reasons or a copy of the order on request, unless the authority decides on non-disclosure for up to six weeks, extendable by six more |
| **Imminent threats** | Art. 14(5) | Content involving an imminent threat to life goes promptly to the competent law enforcement authorities, or to Europol where the Member State can't be identified |
| **Contact point and representative** | Arts. 15, 17 | A contact point for electronic receipt of orders, publicly listed, naming its languages; a provider without an EU establishment designates a legal representative in a Member State |
| **Penalties** | Art. 18 | Set by Member States; systematic or persistent failure to meet the one-hour duty can cost up to 4% of global turnover for the preceding business year |

Recital 42 adds the operational point the hour implies: for providers exposed to terrorist content, the contact point should be accessible at any time. A platform that receives orders needs a 24-hour on-call rotation that can act on a URL, not a mailbox that someone checks in the morning.

**How it's used.** The Commission's implementation report of 14 February 2024 found that 23 Member States had designated competent authorities by the end of 2023, about 350 removal orders had been issued, and no provider had challenged one. Europol's **PERCI** platform, launched on 3 July 2023 to process removal orders and referrals, had handled 14,615 referrals by the end of 2023. Referrals are the other channel: an authority or Europol flags content for the provider's voluntary assessment against its own terms, with no legal clock, and the Regulation keeps them available alongside orders (recital 40). Most platforms will see far more referrals than orders; Reddit reported zero TCO removal orders in the second half of 2025, alongside five government or law enforcement requests about terrorist content.

What the Regulation means for the build:

- **An order is a legal notice with a one-hour clock** (`legal_notices.kind = 'tco_removal_order'`), and its `due_at` is receipt plus one hour, paused only by the documented Annex III grounds ([Legal Clocks](/books/user-generated-platforms/hosting-liability#legal-clocks)).
- **Verify the authority, fast.** The Commission keeps an online register of competent authorities and their contact points (Art. 12(4)); check the sender against it, then act. Fake legal orders are a real abuse pattern: Reddit caught and rejected 26 fraudulent requests in the second half of 2025 that purported to come from government and law enforcement agencies, 15 of them asking for removals. A one-hour clock is exactly what an impersonator would exploit.
- **Remove in every Member State,** not just the issuing one, and keep the content for six months under a hold (`legal_holds.reason = 'regulatory_retention'`) so a successful scrutiny or appeal can reinstate it.
- **Suppress the uploader notice** when the order carries a non-disclosure decision, until it lapses.
- **Count from day one:** every Art. 7 figure (orders, items, failures with reasons, complaints, reinstatements) is a query over notices, decisions and appeals, published before 1 March.

**The UK and Australia** add less that is terrorism-specific. In the UK, Ofcom's June 2025 consultation proposed that services use hash matching to detect terrorism content, have crisis response protocols for spikes in illegal content, and avoid recommending material with indicators of illegality until reviewed; as of October 2026 Ofcom said it would publish its decisions on these Additional Safety Measures before the end of the year. In Australia, eSafety's transparency notices under the Basic Online Safety Expectations include a series on terrorist and violent extremist material and activity, with published summaries of providers' responses; the notices, their penalties and the enforcement record are [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#australia-s-esafety-regime)'s.

## Livestreams

Christchurch was livestreamed, and so was every attack that drove a CIP activation in GIFCT's incident list: Halle (2019), Glendale (2020), Buffalo (2022), Memphis (2022), Louisville (2023), Perry (2024), Levittown (2024) and Eskişehir (2024). Live video is where the attacker's goal (an audience in real time) meets the platform's weakest point (nothing to hash until it exists).

Buffalo is the second reference case. On 14 May 2022 an attacker livestreamed a shooting at a supermarket in Buffalo, New York. The New York Attorney General's report of 18 October 2022 named Twitch among the livestreaming platforms "weaponized to publicize and encourage copycat violent attacks", found that the platform he used disabled the stream within two minutes of the onset of violence, and said that "two minutes is still too much": a viewer's recording proliferated on fringe sites afterward. The report recommended restrictions on livestreaming, including verification requirements and tape delays, to identify first-person violence before it spreads, and a reform of Section 230 so a platform claiming its protection would first show reasonable steps to address unlawful content.

What platforms and regulators have converged on:

- **Gate who can go live.** Meta announced in May 2019 a "one strike" policy for Facebook Live: a first violation of its most serious policies, including its Dangerous Individuals and Organizations policy, bars the person from Live for a set period such as 30 days. Account age, standing, verification and a follower threshold are the usual gates; a new account with no history is the riskiest broadcaster on any platform ([Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing)).
- **A report path that knows it's live.** A report on a live stream that indicates a risk of imminent physical harm should reach a person in minutes. Ofcom's June 2025 proposals would have services that allow livestreaming make such reports visible to them and keep human moderators available at all times to act in real time.
- **Classifiers on frames and audio** during the broadcast, scoring for weapons, gore and first-person shooter perspective, as prioritizers for the live queue rather than automatic kill switches ([Classifiers as Prioritizers](/books/user-generated-platforms/moderation-at-scale#classifiers-as-prioritizers)).
- **Interrupt, then decide.** Ending a stream (`streams.state = 'interrupted'`) is reversible; deleting the recording is not. The interruption keeps the recording as evidence and stops distribution; review decides the rest.
- **Hash the recording immediately.** The moment a stream is confirmed as an attack, hash the recording and its key frames, block re-uploads, and contribute to the shared database or an incident activation.
- **Delays for the riskiest broadcasters.** The NY Attorney General recommended tape delays; a short delay for new or low-standing accounts gives the classifiers and reviewers a head start without delaying everyone.

The engineering of ingest, latency and recordings is in [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding) and [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#from-live-to-vod); this chapter owns what happens when a stream is the incident.

## Graphic Content

Most violent imagery on a platform isn't terrorist content and isn't removed. Platforms keep it up with friction, and the published policies show the tools.

**YouTube** allows violent or graphic content in educational, documentary, scientific or artistic (EDSA) contexts, but the context has to be in the video's images or audio: "Providing it in the title or description is insufficient." Public-interest material (warzones, civil unrest, humanitarian crises, natural disasters) can be allowed with context in the video, title or description. Where context is enough, YouTube may **age-restrict instead of removing**: age-restricted videos aren't viewable by users under 18 or signed out, most third-party embeds send viewers to YouTube to sign in, and the video may earn limited or no ads. Its factors for allowing, age-restricting or removing include whether violence is the focus, whether the title signals intent to shock, whether the imagery is blurred or masked, how long it lasts, and whether it's dramatized. Two categories stay down regardless of context: violent physical sexual assaults, and footage filmed by the perpetrator during a deadly or major violent event where weapons, violence or injured victims are visible or audible.

**Meta** puts sensitive or disturbing content that it allows (including content kept up as newsworthy) behind a **warning screen**, and may limit it to adults 18 and over.

**Discord** blurs media that may be sensitive by default for teens, with an opt-in for adults, and since 21 July 2025 has its sensitive-content filter on by default for all UK users, who must verify they're 18 to turn it off. **Bluesky** lets users subscribe to labeling services whose labels can hide, block or blur content, each label configurable by the user. **Mastodon** lets a server mark an account sensitive, which automatically marks all media it posts as sensitive.

From those, the controls a platform needs, from least to most restrictive:

| Control | What the viewer sees | Typical use |
| --- | --- | --- |
| **Label** | The item, with a notice | Mild sensitivity; context the viewer should know |
| **Blur by default** | A blurred placeholder; tap to reveal | Possibly graphic media in feeds, DMs and previews; teen defaults |
| **Warning screen (interstitial)** | A full overlay naming the kind of content; click through | Graphic violence kept up for news, documentary or awareness |
| **Age restriction** | Nothing unless signed in and 18+ | Graphic content with context, where minors shouldn't see it |
| **Reduced distribution** | Visible on direct link or profile, absent from recommendations, search suggestions and trending | Allowed but not to be amplified |
| **Removal** | A tombstone | No context saves it, or law requires removal |

Three design rules make them work:

- **They're decisions, not author settings.** An author can mark their own post sensitive; a reviewer applying a warning screen or an age restriction is a moderation decision, recorded with category, policy version and reason, and appealable like any other ([Appeals](/docs/security/trust-and-safety#appeals)). It's also a restriction the user is told about, with the reasons a statement of reasons requires in the EU ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons)).
- **Gates apply everywhere the item renders:** feeds, search results, embeds, link previews, notifications and the API. An interstitial that the embed player ignores is no interstitial.
- **Age gates need an age.** An age restriction is only as good as the platform's knowledge of who is 18, and the signed-out viewer is treated as a minor. Age assurance methods and the law around them are [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#age-assurance-on-a-general-audience-platform).

## Newsworthiness

A platform with graphic content rules will remove, by those rules, something that the public needs to see: a politician's statement that breaks the hate speech policy, video of soldiers shooting civilians, a protester's footage of police violence. The newsworthiness exception is the documented way to keep it up.

Meta's is the most detailed public version. It allows content that would otherwise violate its standards only when keeping it visible is in the public interest, weighing "the public interest against the risk of harm". Reviewers escalate potentially newsworthy content to the Content Policy team, which asks whether it surfaces an imminent threat to public health or safety or gives voice to perspectives in an active political process, and considers country context (an election, a war, whether there's a free press). No speaker is presumed newsworthy, politicians included. Content that poses a risk of harm, or a direct threat to public safety, comes down even if it has news value. Allowances are **narrow** (one item) or **scaled** (a phrase or broader class), and allowed sensitive content gets a warning screen and may be limited to adults. Meta counted 44 documented newsworthy allowances from June 2024 to June 2025 (20 for politicians' content, 6 scaled), against 32 the year before.

The EU's TCO Regulation writes the same exception into law for terrorist content (journalistic, educational, artistic and research purposes, and countering terrorism, aren't terrorist content), and YouTube's EDSA exception is the same idea for graphic violence.

A newsworthiness workflow that holds up:

1. **First-line reviewers don't grant it.** They apply the rules and escalate; the allowance is made by a policy role separated from the queue, so the exception doesn't become a reviewer's personal judgment.
2. **Write down both sides.** The public interest served, the harm weighed against it, the policy and version it overrides, and the conditions attached (warning screen, age restriction, no recommendation).
3. **Narrow by default, scaled with care.** A scaled allowance changes enforcement for every matching item and should expire and be reviewed.
4. **Some things are never newsworthy enough:** perpetrator-filmed attack footage, content that identifies victims of sexual violence, and anything under the child safety rules. Encode those as categories the allowance can't override.
5. **Count them and publish the count,** as Meta does; a newsworthiness exception that nobody can count is a back door.

## How to Build It

This chapter extends the [core data model](/books/user-generated-platforms/platform-business#the-core-data-model): `content_items` gains its visibility gates, an incident mode joins the hash lists of [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#how-to-build-it) (whose `hash_lists` include source `'gifct'`) and the cases of the playbook, and newsworthiness allowances become records. TCO orders are rows in the `legal_notices` table that [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#how-to-build-it) defines, which already carries authenticity checks and uploader non-disclosure.

```sql
ALTER TABLE content_items
  ADD COLUMN warning_screen TEXT CHECK (warning_screen IN ('graphic_violence', 'disturbing',
    'sensitive')),                       -- null: none; set by a moderation decision
  ADD COLUMN age_restricted BOOLEAN NOT NULL DEFAULT FALSE;  -- signed-in 18+ viewers only

CREATE TABLE crisis_incidents (          -- one event in incident mode: its hashes, its queue
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  source           TEXT NOT NULL CHECK (source IN ('gifct_irf', 'christchurch_call_protocol',
                     'eu_crisis_protocol', 'government', 'internal')),
  activation_type  TEXT,                 -- the source's own level, e.g. 'perpetrator_content_incident'
  external_ref     TEXT,                 -- the source's identifier or public notice
  title            TEXT NOT NULL,        -- place and date; never the perpetrator's name
  event_started_at TIMESTAMPTZ,          -- the offline attack, when known
  activated_at     TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,          -- the source's close; matching continues after
  hash_list_id     UUID REFERENCES hash_lists (id),  -- incident-labeled entries, shared and own
  hashes_added     INT NOT NULL DEFAULT 0,          -- contributed by this platform
  bands            JSONB NOT NULL,       -- incident thresholds: auto-remove, quarantine, review
  debrief          TEXT,
  CHECK (ended_at IS NULL OR ended_at >= activated_at)
);

ALTER TABLE moderation_cases
  ADD COLUMN crisis_incident_id UUID REFERENCES crisis_incidents (id);

CREATE TABLE newsworthy_allowances (     -- a documented exception to the rules
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  scope           TEXT NOT NULL CHECK (scope IN ('narrow', 'scaled')),
  content_item_id UUID REFERENCES content_items (id),  -- narrow: the one item
  match_rule      JSONB,                 -- scaled: the hash, phrase or URL pattern covered
  category        TEXT NOT NULL,         -- the policy category it overrides
  policy_version  TEXT NOT NULL,
  basis           TEXT NOT NULL CHECK (basis IN ('newsworthy', 'documentary', 'educational',
                    'scientific', 'artistic', 'counter_speech')),
  public_interest TEXT NOT NULL,         -- what keeping it up serves
  harm_assessment TEXT NOT NULL,         -- the risk weighed against it
  conditions      TEXT[] NOT NULL DEFAULT '{}',  -- 'warning_screen', 'age_restricted', 'no_recommendation'
  decision_id     UUID NOT NULL REFERENCES moderation_decisions (id),
  escalated_from  UUID REFERENCES moderation_decisions (id),  -- the reviewer's original call
  valid_during    TSTZRANGE NOT NULL,
  revoked_at      TIMESTAMPTZ,
  CHECK ((scope = 'narrow') = (content_item_id IS NOT NULL)),
  CHECK (scope = 'narrow' OR match_rule IS NOT NULL)
);
```

Notes on the sketch:

- **Gates are columns because every renderer reads them.** `warning_screen` and `age_restricted` are read by feeds, search, embeds, previews and the API on every request, so they sit on the item; the decision that set them is in `moderation_decisions` like any other. They're separate from `content_rating`, which is the author's or community's declared maturity rating: a war documentary is rated `general` by its uploader and age-restricted by a reviewer.
- **An incident is a mode, not a queue name.** Matching reads the open incidents' `bands` and hash lists on every upload while `ended_at` is null, and keeps reading the incident's list after it closes at normal bands. Cases opened under it carry `crisis_incident_id`, so the debrief can count reports, removals, re-upload attempts and time to action per incident.
- **Labels decide the action.** A match against a `'gifct'` list keeps its labels in `hash_matches`; policy maps labels to actions (an incident label or imminent-threat label auto-removes on exact match; a glorification label on a news account goes to review).
- **TCO orders reuse the notices pipeline.** The order is a `legal_notices` row (`kind = 'tco_removal_order'`) with a one-hour `due_at`, `authenticity` checked against the Commission's register before action, and whether the order came as an emergency without the 12-hour first-order notice recorded in `validity_checks`. The case links to it through `moderation_cases.legal_notice_id`; removal writes a decision and `actioned_at`, the Annex II response reports that time, and a `legal_holds` row with reason `'regulatory_retention'` keeps content and related data six months. The uploader notice waits on `notify_uploader` and `nondisclosure_until`.
- **Allowances bind decisions.** Enforcement checks for an allowance in force before removing; a scaled allowance's `match_rule` is evaluated like a hash or keyword list. An allowance can't name a category on the never-allowed list (perpetrator footage, child safety), enforced in the policy service.
- **Events:** `crisis.activated`, `crisis.ended`, `tco.order_received`, `tco.order_executed`, `newsworthy.allowed`, `newsworthy.revoked` and `content.gated` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the on-call pager, recommendations (to suppress incident content), transparency counts and the uploader notice service.

## Auditing

- **Every removal order, end to end:** receipt time, authority and how it was verified, the URL, removal time across all Member States, any Annex III grounds or clarification request, the uploader notice (or the non-disclosure decision), and the six-month hold. The one-hour figure is computed from those timestamps, never typed in.
- **Every incident:** source, activation and close times, bands in force, hashes consumed and contributed, cases, removals and the debrief.
- **Every hash-list action:** which list version matched, with what labels and distance, and what the platform did; and every hash the platform contributed, tied to the decision that confirmed it.
- **Every gate and allowance:** who applied a warning screen or age restriction, under which rule, and every newsworthiness allowance with both sides of the balance and its approver.
- **The annual TCO transparency report** and the platform's own transparency counts as queries over these records ([Transparency Reporting](/docs/security/trust-and-safety#transparency-reporting)); [Transparency Reporting](/books/user-generated-platforms/transparency-reporting) covers the formats.

## What This Means for the System You Build

- **Treat terrorist content as a list problem:** match uploads against the shared hash database with per-label policy, and contribute what your reviewers confirm.
- **Build an incident mode before you need it,** with external activation, tighter bands for one event's hashes, a live queue and a recorded close.
- **Run a 24-hour contact point for EU removal orders,** verify the authority against the Commission's register, and act within the hour across every Member State.
- **Keep removed terrorist content for six months** under a hold, and publish the TCO transparency report before 1 March.
- **Gate who can go live** by standing and history, give live reports of imminent harm a path to a person in minutes, and interrupt before you delete.
- **Hash a confirmed attack recording at once** and block its re-uploads everywhere media enters.
- **Keep most graphic content up behind friction:** blur, warning screens, age restriction and reduced distribution, applied as appealable decisions and honored in every renderer.
- **Make newsworthiness an escalated, recorded exception** with both sides of the balance, a never-allowed list, and a published count.

## References

**Statutes and regulations**

- [Regulation (EU) 2021/784 on addressing the dissemination of terrorist content online](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32021R0784), scope and exclusions, removal orders and the one-hour rule, 12-hour first-order notice, order contents, Annex II and III responses, cross-border scrutiny, specific measures and "exposed" status, six-month preservation, transparency reports before 1 March, complaints within two weeks, uploader information and six-week non-disclosure, imminent threats to Europol, contact points, legal representatives, penalties up to 4% of global turnover, application from 7 June 2022, recitals 40 and 42

**Regulators and governments**

- [eucrim: Report on the dissemination of terrorist content online](https://eucrim.eu/news/report-on-the-dissemination-of-terrorist-content-online/), the Commission's 14 February 2024 implementation report: 23 Member States with authorities, about 350 removal orders, PERCI launched 3 July 2023 with 14,615 referrals, no orders challenged
- [Ofcom: Pushing platforms to go further](https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/pushing-platforms-to-go-further-ofcom-sets-out-more-online-protections), June 2025 proposals for crisis protocols, terrorism hash matching, livestream reports of imminent harm and moderators available at all times
- [Ofcom: Online Safety industry bulletin, October 2026](https://www.ofcom.org.uk/online-safety/protecting-children/online-safety-industry-bulletin-october-2026), Additional Safety Measures decisions due before the end of 2026
- [eSafety: Basic Online Safety Expectations](https://www.esafety.gov.au/industry/basic-online-safety-expectations), transparency notices, including the terrorist and violent extremist material series
- [New York Attorney General: Report on the role of online platforms in the Buffalo shooting](https://ag.ny.gov/press-release/2022/attorney-general-james-and-governor-hochul-release-report-role-online-platforms), 18 October 2022: stream disabled within two minutes, "two minutes is still too much", verification and tape-delay recommendations, Section 230 reform proposal
- [New Zealand MFAT: Significant progress under Christchurch Call announced at UN Leaders' Week](https://www.mfat.govt.nz/br/media-and-resources/significant-progress-under-christchurch-call-announced-at-un-leaders-week), the 23 September 2019 crisis response protocol, GIFCT relaunch as an independent organization, the Paris launch on 15 May 2019

**Programs**

- [GIFCT: Hash-Sharing Database](https://gifct.org/hsdb/), hash types, taxonomy history, labels, member feedback, members decide their own enforcement
- [GIFCT: Annual and Transparency Report 2024](https://gifct.org/wp-content/uploads/2025/07/GIFCT-Annual-and-Transparency-Report-2024.pdf), 33 members, integrated members, access by information-sharing agreement and code of conduct, no automatic action, 2.3 million hashes and 408,000 unique items, label distributions, feedback and removals, 21 IRF activations to end of 2024 and the 7 in 2024
- [GIFCT: Our impact in 2025](https://gifct.org/2026/05/21/our-impact-in-2025/), seven new members in 2025, 14 IRF activations
- [GIFCT: Incident Response Framework](https://gifct.org/incident-response/), the 2025 activation types and the retired ones
- [GIFCT: Content Incident Protocol](https://gifct.org/content-incident-protocol/), the Louisville criteria, timeline, notifications and hash count
- [GIFCT: Perpetrator Content Incident, Bistrița, Romania](https://gifct.org/2026/10/19/incident-response-perpetrator-content-incident-activated-in-response-to-violent-extremist-event-in-bistrita-romania/), activation and close times, actions, hashes and notifications (October 2026)
- [Christchurch Call Foundation](https://www.christchurchcall.org/), the attack, the 25 commitments, the Foundation's role

**Platforms**

- [Meta: Update on New Zealand](https://about.fb.com/news/2019/03/update-on-new-zealand/), live and total views, first report timing, 1.5 million removals and 1.2 million upload blocks in 24 hours, variants, 800 videos shared through GIFCT
- [Meta: Protecting Facebook Live from abuse](https://about.fb.com/news/2019/05/protecting-live-from-abuse/), the one-strike Live restriction
- [Meta: Approach to newsworthy content](https://transparency.meta.com/features/approach-to-newsworthy-content/), the balancing test, escalation, narrow and scaled allowances, warning screens and adult limits, counts for 2023 to 2025
- [YouTube: Violent or graphic content policies](https://support.google.com/youtube/answer/2802008), EDSA context in the video, age restriction instead of removal, factors, never-allowed categories
- [YouTube: Age-restricted content](https://support.google.com/youtube/answer/2802167), under-18 and signed-out viewers, embeds, ads
- [Reddit: Transparency Report, July to December 2025](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), terrorist content flagged, reviewed and removed, permanent suspensions, government requests, zero TCO orders
- [Discord: Building a safer place for teens](https://discord.com/safety/safer-place-for-teens), sensitive media blur defaults and zero tolerance for violent extremism
- [Discord: Adapting Discord for the UK Online Safety Act](https://discord.com/safety/adapting-discord-for-the-uk-online-safety-act), the sensitive content filter on by default for UK users from 21 July 2025
- [Bluesky: Stackable moderation](https://bsky.social/about/blog/03-12-2024-stackable-moderation), labelers that hide, block or blur, configurable per user
- [Mastodon: Moderation actions](https://docs.joinmastodon.org/admin/moderation/), marking an account's media sensitive
