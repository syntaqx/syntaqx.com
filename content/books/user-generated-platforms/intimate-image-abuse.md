+++
title = "Intimate Image Abuse"
description = "The TAKE IT DOWN Act's 48-hour removal duty, StopNCII and Take It Down hashes, deepfakes and nudify tools, state laws, and UK, EU and Australian duties."
category = "User-Generated Platforms Industry"
order = 1838
part = "Trust and Safety"
tags = ["trust-and-safety", "intimate-image-abuse", "ncii", "deepfakes", "hash-matching", "take-it-down-act"]
+++

Intimate image abuse is the publication of someone's nude or sexual images without their consent: an ex-partner's revenge, a hacked phone, a hidden camera, a sextortion payout that didn't stop the leak, and now, more and more, an image that was never taken at all because software made it. The harm has a property that shapes everything a platform does about it: it's done by copies. A victim isn't helped by the removal of one post if fifty copies remain, and each re-upload repeats the injury. So the work is less about judging a single item than about finding every copy, keeping them from coming back, and doing it fast enough to matter.

For most of the last decade the law left this to platform policy. That changed in the United States on 19 May 2026, when the notice-and-removal duty of the **TAKE IT DOWN Act** came into force: a covered platform must remove a reported intimate image within 48 hours of a valid request, make reasonable efforts to remove known identical copies, and answer to the Federal Trade Commission if it doesn't. The UK, the EU and Australia have their own duties, and victim-side hashing services (StopNCII for adults, NCMEC's Take It Down for images taken before 18) give platforms a way to block an image before anyone reports it.

This chapter covers that regime, the hash services, digital forgeries and the tools that make them, and the state laws underneath. Imagery of anyone under 18 is child sexual abuse material and goes down the reporting path in [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#the-reporting-duty), whatever form the report arrives in. Hash technology is in that chapter's [Hash Matching](/books/user-generated-platforms/child-safety#hash-matching) section; the general moderation machinery is the playbook's [Trust & Safety](/docs/security/trust-and-safety). None of this is legal advice.

## How the Platforms Do It

| Practice | Who publishes it | What it looks like |
| --- | --- | --- |
| **Victim-side hash intake** | StopNCII's industry partners include Facebook, Instagram, Threads, Microsoft, TikTok, Reddit, OnlyFans, Pornhub, Snap, Patreon, X and Depop | The victim hashes on their own device; platforms match the hashes and remove under their own policies |
| **Hash lists in more places** | Microsoft uses validated StopNCII hashes in Bing and, from May 2026, in GroupMe, Teams Free, OneDrive and Xbox | One list reaches search, chat, storage and gaming |
| **Matching in chat** | Reddit, second half of 2025: StopNCII in chat produced an 89.6% increase in chat messages removed for non-consensual intimate media over the prior half | Matching where most sharing happens, not only in public posts |
| **Minors' hash source** | Reddit added NCMEC's Take It Down to its hash detection sources in the second half of 2025 | Matches route to the child safety path |
| **A statutory removal form** | Every covered platform in the US since 19 May 2026, per the FTC's guidance: a clear and conspicuous notice, a request path for people without an account, a tracking number, an outcome message | Notice and removal with a 48-hour clock |
| **Action against the tools** | Meta sued the maker of the CrushAI "nudify" app in Hong Kong in June 2025 over ads on its platforms and shares nudify URLs through the Tech Coalition's Lantern program; San Francisco's City Attorney sued the operators of 16 nudify sites in August 2024 | Platforms and prosecutors going after the supply, not only the uploads |

The pattern: **the request is the start of a sweep, not a single removal.** Every mature process turns one report into a hash, removes every identical copy, adds the hash to a list that blocks re-uploads, and, where the victim has consented, shares it so other platforms can do the same.

## The TAKE IT DOWN Act

The **Tools to Address Known Exploitation by Immobilizing Technological Deepfakes on Websites and Networks Act**, Pub. L. 119-12, was approved on 19 May 2025. It has two halves: a federal crime for the people who publish, and a removal duty for the platforms that host.

**The crimes (new 47 U.S.C. 223(h)).** It is a federal offense to knowingly publish, through an interactive computer service:

- an **authentic intimate visual depiction** of an identifiable adult, where it was obtained or created under circumstances in which the person had a reasonable expectation of privacy, wasn't voluntarily exposed in a public or commercial setting, isn't a matter of public concern, and publication is intended to cause harm or causes it;
- a **digital forgery** of an identifiable adult, published without consent, with the same intent or harm test;
- either kind of depiction of a **minor**, with intent to abuse, humiliate, harass or degrade the minor or to arouse or gratify sexual desire.

Penalties run to two years in prison for offenses involving adults and three for minors; threatening to publish is itself an offense, with up to 18 months (adults) or 30 months (minors) for threats involving digital forgeries. A **digital forgery** is any intimate visual depiction of an identifiable individual created through software, machine learning, artificial intelligence or other technological means, including by altering an authentic image, that a reasonable person would find indistinguishable from an authentic depiction. **Consent** to create an image isn't consent to publish it, and sharing an image with someone isn't consent to their publishing it. The exceptions cover law enforcement and intelligence activity; good-faith disclosures to law enforcement, in legal proceedings, for medical or educational purposes, in reporting unlawful content or seeking help after receiving an unsolicited image; disclosures meant to assist the person depicted; and a person publishing their own images. Courts must order forfeiture and restitution.

**Who has the removal duty.** A **covered platform** is a website, online service, online application or mobile application that serves the public and either primarily provides a forum for user-generated content ("including messages, videos, images, games, and audio files") or regularly publishes, curates, hosts or makes available non-consensual intimate depictions as part of its business. Excluded: broadband internet access providers, email, and services that consist primarily of content the provider preselected, where chat, comments or other interactive features are incidental. The FTC's guidance reads the definition to include social media, messaging, image and video sharing, and gaming platforms. Nonprofits are covered: the Act extends the FTC's jurisdiction to organizations not run for profit (Sec. 3(b)(2)(D)).

**The process (Sec. 3(a)).** By 19 May 2026 a covered platform had to establish a process through which an identifiable individual, or an authorized person acting for them, can notify it of an intimate visual depiction of that person published without consent and request its removal. A request is valid when it includes, in writing:

1. a physical or electronic **signature** of the individual or their authorized representative;
2. an **identification of, and information reasonably sufficient to locate,** the depiction;
3. a **brief statement of good-faith belief** that the depiction isn't consensual, including any relevant information for the platform to determine it was published without consent;
4. **contact information** for the individual or representative.

The platform must give a clear and conspicuous notice of the process (a clear and conspicuous link to it counts), in plain language, explaining its responsibilities and how to submit a request.

**The clock (Sec. 3(a)(3)).** On a valid request the platform shall, "as soon as possible, but not later than 48 hours after receiving such request", (A) remove the depiction and (B) make reasonable efforts to identify and remove any known identical copies. Both duties sit inside the 48 hours.

**The safe harbor (Sec. 3(a)(4)).** A platform isn't liable for any claim based on its good-faith disabling of access to, or removal of, material claimed to be a non-consensual intimate depiction, based on facts or circumstances from which unlawful publishing is apparent, whether or not the material is ultimately found unlawful. There's no counter-notice procedure in the Act; a platform that wants a path to restore wrongly removed content builds it under its own terms.

**Enforcement.** A failure to reasonably comply with the notice-and-takedown obligations is treated as a violation of an FTC rule on unfair or deceptive acts or practices, enforced with the FTC Act's powers. The FTC's business guidance puts civil penalties at $53,088 per violation. On 11 May 2026 the FTC announced that Chairman Andrew Ferguson had written to more than a dozen companies reminding them of the deadline; the enforcement announcement names Alphabet, Amazon, Apple, Automattic, Bumble, Discord, Match Group, Meta, Microsoft, Pinterest, Reddit, SmugMug, Snapchat, TikTok and X. Enforcement began on 19 May 2026, with complaints taken at TakeItDown.ftc.gov from people whose valid requests weren't acted on or who found no process at all. As of October 2026 I found no published FTC enforcement action under the Act.

The FTC's guidance, "Complying With the Take It Down Act", adds practice the statute doesn't spell out:

- **Make it easy to find:** a notice on the home page and wherever intimate content might appear, and a way to request removal directly from the photo or video.
- **Let people without an account submit.** Victims often aren't users of the platform that hosts their images.
- **Give each request an identifying number** that the requester, the platform and law enforcement can all refer to.
- **Tell the requester the outcome:** that the content was removed or, if not, why not.
- **Requesters don't have to find the duplicates;** the platform must make reasonable efforts to find them.
- **Hash removed content** to keep it from reappearing, and consider sharing hashes with NCMEC's Take It Down for minors and StopNCII for adults.

What that means for the intake:

- **Validity is a checklist, not a judgment of the victim.** The four elements are the test. The Act asks for a good-faith statement, not proof of identity or proof of non-consent; demanding an ID document before acting puts a barrier the statute doesn't, and the guidance's emphasis on ease of submission points the other way.
- **Reject only for missing elements or a clear mismatch,** such as a request pointing at content that isn't an intimate visual depiction at all, and say which element was missing so the requester can resubmit. The statute runs the 48 hours from receipt of a valid request, so my default is to start the clock when a corrected request arrives and to log the incomplete one beside it.
- **Route minors out.** A request about someone under 18, or content that appears to depict a minor, is a child safety case with a reporting duty ([The Reporting Duty](/books/user-generated-platforms/child-safety#the-reporting-duty)); the removal still happens inside the 48 hours.
- **Expect abuse of the form.** A removal form with a 48-hour clock and a safe harbor will be used to take down lawful content. The safe harbor protects good-faith removals; the platform's own appeal path, and penalties for repeat bad-faith requesters, are its defenses ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)).

The 48-hour clock sits beside the other legal clocks in [Legal Clocks](/books/user-generated-platforms/hosting-liability#legal-clocks).

## Hash-Based Prevention

A removal request reacts to an image already up. Hash services let a person act before anyone sees it, and let a platform block the image the first time someone tries to post it.

**StopNCII.org**, a tool of the nonprofit SWGfL, is for intimate images of adults. The person selects the images or videos on their own device; StopNCII computes a hash there, and "a hash will be sent from your device, but not the image/video itself". The person gets a case number and a PIN, which isn't recoverable if lost, and can use them to check progress or withdraw the case. Participating platforms look for matches and remove those that violate their intimate image abuse policies, and StopNCII "will periodically continue to look for matches". It only reaches partner platforms. As of October 2026 its industry partners include Facebook, Instagram, Threads, Microsoft, TikTok, Reddit, OnlyFans, Pornhub, Snap Inc., Playhouse, RedGIFs, Patreon, Vivastreet, X, F2F, FetLife, xVideos, Tik.Porn and Depop; Microsoft uses validated StopNCII hashes in Bing and, as of May 2026, in GroupMe, Teams Free, OneDrive and Xbox. StopNCII's pages don't name the hash algorithms it uses.

**Take It Down**, run by NCMEC, is for nude, partially nude or sexually explicit images or videos of someone taken before they were 18. It works the same way: the file stays on the device, only the hash goes to NCMEC's list, the person can stay anonymous, and participating platforms use the list to scan their public or unencrypted services. Images taken at 18 or older go to StopNCII. NCMEC warns users that platforms may have limited ability to remove content already posted, and that re-sharing the images after submitting may get their own account flagged.

How a platform uses them:

- **Each is a list source.** StopNCII and Take It Down are `hash_lists` rows with sources `'stopncii'` and `'take_it_down'`, ingested on the provider's schedule under its access agreement ([The Hash Lists](/books/user-generated-platforms/child-safety#the-hash-lists)).
- **Match at upload and back-scan the stock.** New uploads are checked as they arrive; every new batch of hashes is also run against media already stored, because the person hashed the image after it may already have been posted. That back-scan is what "periodically continue to look for matches" requires of a partner.
- **Different lists, different paths.** A StopNCII match is an intimate image abuse case under the platform's policy. A Take It Down match is imagery of a minor, and goes to the child safety path with its reporting duty, whatever the content looks like to the reviewer.
- **Match where you can see.** Both services work on content the platform can access; end-to-end encrypted messages are outside what server-side matching reaches.
- **Don't re-victimize in review.** A hash match on a victim-submitted hash rarely needs a person to look at the image to decide; where review is needed (a perceptual match at a distance), it goes to trained reviewers with blurred-by-default tooling ([Reviewer Wellbeing](/books/user-generated-platforms/moderation-at-scale#reviewer-wellbeing)).

**Ofcom's measure.** In the UK, Ofcom announced on 18 May 2026 that it would add a recommendation to its Illegal Content Codes that certain services use hash matching to detect intimate image abuse, naming StopNCII as "the market leader" database. By its October 2026 bulletin the measure applied to user-to-user services at high risk of intimate image abuse that either have pornography as their principal purpose, are file-sharing or file-storage services, or have more than 700,000 monthly active UK users; to large user-to-user services at medium risk; and to large general search services. Ofcom has opened an enforcement programme on the measures services take, focused on hash matching or the alternatives a service uses instead.

### The Identical-Copy Sweep

The Act's "reasonable efforts to identify and remove any known identical copies" is the part that needs engineering. The FTC's guidance doesn't define "known identical copies", so the design follows the words:

1. **Resolve the request to assets.** The located depiction is a content item; its media are `media_assets` rows with `sha256` and `perceptual_hash` from upload ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model)). A URL that points outside the platform resolves to nothing, and the response says so.
2. **Remove the reported items,** then sweep: every `media_assets` row with the same `sha256` is an identical copy, wherever it's attached (posts, comments, messages the platform can read, profile images, stream recordings, albums). Because one asset can sit in many content items, removing the asset removes it everywhere it's attached.
3. **Search the derived stores too:** thumbnails, transcoded renditions, CDN caches and search indexes hold copies of the same file under other keys; purge them through the media pipeline, not just the database.
4. **Treat perceptual matches as "known" only after review.** A near match (a crop, a re-encode, a screenshot) is very likely the same image and should be removed, but it can also be a different image of a different person; within a tight distance it goes to a review lane inside the same 48 hours, not to automatic removal. My rule: exact matches remove automatically, near matches are reviewed fast, and both are logged as part of the sweep.
5. **Block the future.** The hashes join the platform's own intimate image list (a `hash_lists` row with source `'platform'`), checked on every upload path, so the next attempt fails at upload.
6. **Offer to share.** With the requester's consent, point them to StopNCII or Take It Down so other platforms can block the image too; the platform doesn't send the victim's image anywhere itself.
7. **Record it.** What was swept, when it finished and what was found is the evidence that the efforts were reasonable, and the number the FTC would ask for.

The sweep runs as a job against the notice's deadline ([Background Jobs](/docs/architecture/background-jobs)), and the request isn't closed until it's done.

![A dimensional drawing of one removal request on an hours timeline. Before a break, an incomplete request is logged as a dashed box; the valid request at T0 starts the clock, and the request lane runs to T0 plus 48 hours. Below it, dashed windows from T0 to the same bound hold each duty: remove the reported items; exact copies with the same file hash removed everywhere and derived stores purged; near matches through a review lane, then removed. The own hash list lane starts at T0 and runs past the bound, with hashes added so re-uploads are blocked. An accented dimension D1 spans T0 to T0 plus 48 hours. Notes give the four elements of a valid request, and a variable table gives T0 and D1 as as soon as possible, 48 hours at most.](/diagrams/ugp-intimate-image-abuse-removal-clock.svg "The TAKE IT DOWN Act's 48 hours run from a valid request and cover the whole sweep, not just the reported post: identical copies and the near-match review lane share the same deadline. The own hash list is what keeps working after the request closes.")

## Deepfakes

Intimate image abuse no longer needs an intimate image: "nudify" or "undress" apps and general image generators make one from any photo of a real person. The law has moved to treat those images like authentic ones.

- **Federal criminal law.** The TAKE IT DOWN Act's digital forgery offense covers them, and its removal duty applies to digital forgeries the same way; the FTC's guidance says so explicitly.
- **Federal civil law.** Since 1 October 2022, **15 U.S.C. 6851** (Section 1309 of the Consolidated Appropriations Act, 2022) has given a person whose intimate visual depiction was disclosed without consent a federal civil action against the person who disclosed it knowing of, or recklessly disregarding, the lack of consent: actual damages or liquidated damages of $150,000, costs and attorney's fees, injunctions requiring the defendant to stop displaying the image, and the right to sue under a pseudonym. Exceptions cover commercial pornographic content not produced by force, fraud, misrepresentation or coercion; good-faith disclosures to law enforcement, in legal proceedings, in medical education or treatment, or in reporting unlawful content; matters of public concern; and disclosures meant to assist the person. Its "intimate visual depiction" definition is the one the TAKE IT DOWN Act adopts.
- **The DEFIANCE Act.** S. 1837 would amend that civil remedy to add punitive damages and the defendant's profits, create a federal civil action against anyone who knowingly discloses, produces or possesses with intent to disclose, or solicits and receives, an intimate digital forgery without consent, and set a ten-year limitation period running from discovery or age 18. It passed the Senate by unanimous consent on 13 January 2026 and, as of October 2026, was held at the desk in the House.

For a platform, the rule is simpler than the law: **authenticity isn't part of the decision.** A request about a fake is valid under the same four elements as a request about a real photo, and the same sweep applies. Reviewers shouldn't try to decide whether an image is real; a platform that asks the victim to prove an image is fake, or that it's real, has added a burden no statute imposes.

**The tools.** Nudify apps and sites reach users through ads, app stores, payment providers and search, and the public actions so far target those channels:

- **Platforms suing advertisers.** Meta sued Joy Timeline HK, the company behind CrushAI, in Hong Kong in June 2025 for repeatedly placing nudify ads after removals; it also described detection for nudify ads without nudity in them, and said it had shared more than 3,800 unique nudify URLs through the Tech Coalition's Lantern program since March 2025.
- **Prosecutors suing operators.** San Francisco's City Attorney sued the operators of 16 of the most-visited nudify websites in August 2024. By 2 June 2025, 10 of them were offline or inaccessible in California, and one operator, Briver LLC, had agreed to a permanent injunction and $100,000 in civil penalties; the office credited domain registrars and registries that cooperated.
- **Regulators banning the tools.** Ofcom's May 2026 announcement refers to new UK legislation banning nudification tools.

What a platform can do on its own side: classify and remove ads, links and listings for nudify services as a policy category; treat promotion of them as a violation in its own right; and share URLs and signals through industry programs.

## State Laws

Before federal law, the states built the regime, and their laws remain: criminal statutes for distribution, civil actions for victims, and, increasingly, explicit coverage of altered and AI-generated images. I haven't found a neutral, current count of state laws that I could open, so this section gives primary examples rather than a number.

- **Virginia, Code § 18.2-386.2.** Maliciously disseminating or selling a nude or sexual image of another person with intent to coerce, harass or intimidate, knowing you lack authorization, is a Class 1 misdemeanor. "Another person" includes a person whose image was used to create, adapt or modify an image intended to depict an actual person who is recognizable, so altered and composite images are covered. Subsection B exempts internet service providers, email providers and other information service or access providers for content posted by another person.
- **New York, Civil Rights Law § 52-c.** A private right of action against anyone who discloses, disseminates or publishes sexually explicit material of a person without consent, including a "digitization" (a realistic depiction made with software, AI or other technological means). A disclaimer that the image is unauthorized is no defense. Consent requires a signed, plain-language agreement. Remedies include injunctions, compensatory and punitive damages and attorney's fees; claims run three years from dissemination or one year from discovery. The section neither limits nor expands Section 230's protection for interactive computer services.

Two features recur and matter to a platform. **Provider carve-outs:** most state laws reach the person who publishes, and many say expressly that a service provider isn't liable for what users post, consistent with [Section 230](/books/user-generated-platforms/hosting-liability#section-230). The platform's duties come from the TAKE IT DOWN Act and its own policies, not from these statutes. **Civil injunctions:** a victim who wins an injunction under a state law or 15 U.S.C. 6851 may bring the order to the platform; that's a court order in the notices pipeline (`legal_notices.kind = 'court_order'`), with its own clock and validity checks.

**Outside the US**, three regimes matter most:

- **United Kingdom.** Beyond Ofcom's hash-matching measure above, Ofcom says new legislation now requires services to take down non-consensual intimate images within 48 hours of a report; as of October 2026 it planned to consult on the duty by the end of the year and bring it into force in 2027.
- **European Union.** Directive (EU) 2024/1385 on combating violence against women and domestic violence requires Member States to criminalize making intimate images accessible to the public without consent where likely to cause serious harm, producing or altering images to make it appear a person is engaged in sexual activity and making them public, and threatening either to coerce someone (Art. 5). Member States must also ensure such material is promptly removed, including through binding orders to hosting providers that meet the conditions of DSA Article 9 (Art. 23). Transposition is due by 14 June 2027. Until then, the DSA's notice-and-action duties apply as for any illegal content ([DSA Hosting Liability](/books/user-generated-platforms/hosting-liability#dsa-hosting-liability)).
- **Australia.** Under the Online Safety Act 2021's image-based abuse scheme, eSafety can give a removal notice to the provider of a social media service, relevant electronic service or designated internet service (s 77), to the person who posted (s 78) or to a hosting provider (s 79), requiring all reasonable steps to remove the image within 24 hours or a longer period eSafety allows; failing to comply carries a civil penalty of 500 penalty units (s 80). The scheme applies where the person depicted or the person who posted is ordinarily resident in Australia (s 75), and an image counts as intimate even if it has been altered (s 15(5)). eSafety's notices and enforcement are in [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#australia-s-esafety-regime).

## How to Build It

Removal requests are rows in the `legal_notices` table that [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#how-to-build-it) defines, with `kind = 'tida_removal'` and a `due_at` 48 hours after a valid request arrives; eSafety removal notices and court orders use the same table with their own kinds and clocks. StopNCII and Take It Down are `hash_lists` sources from [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#how-to-build-it), and the platform's own intimate image list is a `'platform'` list there. This chapter adds the sweep:

```sql
CREATE TABLE copy_sweeps (               -- one identical-copy sweep per removal request
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_notice_id   UUID NOT NULL REFERENCES legal_notices (id),  -- 'tida_removal', 'court_order', ...
  source_asset_ids  UUID[] NOT NULL,     -- media_assets the request located
  source_sha256     BYTEA[] NOT NULL,    -- exact hashes swept for
  source_perceptual BYTEA[],             -- near-match hashes, for the review lane
  hash_list_id      UUID REFERENCES hash_lists (id),  -- the own list the hashes joined
  stores            TEXT[] NOT NULL,     -- 'media_assets', 'renditions', 'cdn', 'search_index', ...
  exact_matches     UUID[] NOT NULL DEFAULT '{}',     -- identical copies removed
  near_matches      UUID[] NOT NULL DEFAULT '{}',     -- sent to review
  near_removed      UUID[] NOT NULL DEFAULT '{}',     -- removed after review
  status            TEXT NOT NULL CHECK (status IN ('running', 'review_pending', 'completed',
                      'failed')),
  due_at            TIMESTAMPTZ NOT NULL, -- the notice's due_at: the sweep shares the 48 hours
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  CHECK ((status = 'completed') = (completed_at IS NOT NULL))
);

CREATE INDEX ON media_assets (sha256);   -- the sweep's lookup; dedup uses it too
```

Notes on the sketch:

- **The notice carries the clock; the sweep carries the evidence.** The `legal_notices` row records the requester's four elements, the validity result, the received and valid times, and `due_at`; the case links to it through `moderation_cases.legal_notice_id`. The sweep records what "reasonable efforts" actually covered, and the request closes only when the sweep has completed or its review lane is empty.
- **Remove the asset, not just the post.** Setting the shared `media_assets` row to `removed` takes it out of every content item that attaches it, and the media pipeline purges renditions and caches. Assets that might be evidence (a sextortion case, a court order) move to `quarantined` under a `legal_holds` row instead of being purged.
- **Keep the hash, drop the image.** After the hold period, the bytes go; the hash stays in the own list so the image can't return. Store the requester's contact details only as long as the case needs them.
- **The upload path checks every list.** New media is matched against the own list, StopNCII and Take It Down before it's visible; each new list batch triggers a back-scan of stored media, written as `hash_matches` rows with the list version ([Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#how-to-build-it)).
- **Minors route out early.** A Take It Down match, or a request about someone under 18, opens a child safety case and the removal still meets the 48 hours; the reporting duty runs on its own path.
- **Repeat uploaders are penalized.** An account whose upload matches a removed intimate image gets a penalty in `penalties` at the severity the policy sets, usually the top of the ladder for a knowing re-upload, and the match is evidence for it ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)).
- **Events:** `ncii.request_received`, `ncii.request_valid`, `ncii.request_rejected`, `copy_sweep.completed`, `hash_list.entry_added` and `ncii.reupload_blocked` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the requester notifications, the upload gate, the penalty service and transparency counts.

## Auditing

- **Every request, with its clock:** when it arrived, which of the four elements it had, when it became valid, when the content came down, and what the requester was told, with the request number the FTC's guidance recommends.
- **Every sweep:** the hashes swept, the stores covered, exact and near matches, review outcomes and completion time against the deadline. This is the record that answers "reasonable efforts".
- **Every rejection,** with the missing element or the reason, because a rejected victim's complaint to the FTC will be judged on it.
- **Every list match:** which list and version, the distance, the action and whether a person viewed the image.
- **Every re-upload blocked,** and the account behind it.
- **Who saw what:** review access to intimate images is logged like child safety evidence ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Publish a removal form anyone can use,** linked from wherever intimate content can appear, with no account required and a request number.
- **Validate on the statute's four elements** and say which is missing; don't demand proof the statute doesn't.
- **Run the 48-hour clock on the valid request,** and put the identical-copy sweep inside it.
- **Sweep by asset hash across every store,** remove exact copies automatically, review near matches fast, and add the hashes to your own list.
- **Ingest StopNCII and Take It Down,** match at upload, back-scan on every new batch, and route minors' matches to child safety.
- **Treat digital forgeries exactly like authentic images,** and never make the victim prove which it is.
- **Act on the supply:** nudify ads, links and listings are a policy category of their own.
- **Keep hashes, drop images,** and hold evidence only under a legal hold.
- **Count everything** the FTC, Ofcom, eSafety and your transparency report will ask for.

## References

**Statutes and regulations**

- [TAKE IT DOWN Act, Pub. L. 119-12](https://www.govinfo.gov/content/pkg/PLAW-119publ12/html/PLAW-119publ12.htm), the criminal provisions in 47 U.S.C. 223(h), digital forgery and consent definitions, penalties and threats, exceptions, the notice-and-removal process and its four elements, clear and conspicuous notice, the 48-hour duty and known identical copies, the limitation on liability, FTC enforcement including nonprofits, covered platform definition and exclusions, approval on 19 May 2025
- [15 U.S.C. 6851](https://www.law.cornell.edu/uscode/text/15/6851), the federal civil action for disclosure of intimate images: elements, liquidated damages, injunctions, pseudonyms, exceptions, definitions, effective 1 October 2022
- [Congress.gov: S. 1837, DEFIANCE Act of 2025](https://www.congress.gov/bill/119th-congress/senate-bill/1837), the CRS summary and actions: passed the Senate on 13 January 2026, held at the desk in the House
- [Code of Virginia § 18.2-386.2](https://law.lis.virginia.gov/vacode/title18.2/chapter8/section18.2-386.2/), unlawful dissemination of images, altered images, the provider exemption
- [New York Civil Rights Law § 52-c](https://www.nysenate.gov/legislation/laws/CVR/52-C), the private right of action for sexually explicit depictions including digitizations, consent, remedies, limitations, Section 230
- [Directive (EU) 2024/1385 on combating violence against women and domestic violence](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024L1385), Article 5 offenses, Article 23 removal orders, transposition by 14 June 2027
- [Australia: Online Safety Act 2021](https://www.legislation.gov.au/C2021A00076/2024-12-11/2024-12-11/text/original/epub/OEBPS/document_1/document_1.html), intimate image definition including altered images (s 15), Australian connection (s 75), removal notices (ss 77 to 79), compliance and the 500 penalty unit civil penalty (s 80)

**Regulators and courts**

- [FTC: FTC begins enforcing the Take It Down Act](https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-begins-enforcing-take-it-down-act), enforcement from 19 May 2026, the companies written to, the TakeItDown.ftc.gov complaint portal
- [FTC: Chairman Ferguson advises companies to comply with the Take It Down Act](https://ftc.gov/news-events/news/press-releases/2026/05/ftc-chairman-ferguson-advises-companies-comply-take-it-down-act), the 11 May 2026 letters
- [FTC: Complying With the Take It Down Act](https://www.ftc.gov/business-guidance/resources/complying-take-it-down-act), covered services, notice placement, requests without accounts, request numbers, outcome notices, duplicates, hashing and hash sharing, digital forgeries, $53,088 per violation
- [Ofcom: Platforms should use detection technology to stop spread of illegal intimate images online](https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/platforms-should-use-detection-technology-to-stop-spread-of-illegal-intimate-images-online-under-strengthened-ofcom-codes), the 18 May 2026 hash-matching recommendation, StopNCII, the nudification ban and 48-hour takedown legislation
- [Ofcom: Online Safety industry bulletin, October 2026](https://www.ofcom.org.uk/online-safety/protecting-children/online-safety-industry-bulletin-october-2026), which services the hash-matching measure covers, the enforcement programme, the 48-hour duty consultation and 2027 target
- [San Francisco City Attorney: City Attorney shuts down 10 websites that create nonconsensual deepfake pornography](https://www.sf.gov/news-city-attorney-shuts-down-10-websites-that-create-nonconsensual-deepfake-pornography), the August 2024 suit against 16 sites, 10 offline, the Briver settlement (2 June 2025)

**Programs**

- [StopNCII.org: How it works](https://stopncii.org/how-it-works/), on-device hashing, case number and unrecoverable PIN, partner matching and periodic re-checks, withdrawal
- [StopNCII.org: Industry partners](https://stopncii.org/partners/industry-partners/), the partner list and Microsoft's use in Bing and its consumer services from May 2026
- [NCMEC: Take It Down](https://takeitdown.ncmec.org/), images taken under 18, on-device hashing, anonymity, platform scanning of public or unencrypted services, limits on removal

**Platforms**

- [Reddit: Transparency Report, July to December 2025](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), StopNCII (via the nonprofit SWGfL) in chat and the 89.6% increase, Take It Down added as a hash source (Reddit's own PDF; copy hosted by TorrentFreak, as redditinc.com blocks automated access)
- [Meta: Taking action against nudify apps](https://about.fb.com/news/2025/06/taking-action-against-nudify-apps/), the Hong Kong suit against Joy Timeline HK (CrushAI), nudify ad detection without nudity, more than 3,800 unique URLs shared through Lantern since the end of March (12 June 2025)
