+++
title = "Camera & Effects"
description = "In-app capture and drafts, on-device face and body tracking, effect creator platforms and rewards, beauty filter rules, generative effects and biometric law."
category = "User-Generated Platforms Industry"
order = 1822
part = "Social and Short-Form"
tags = ["user-generated-content", "short-form-video", "camera", "augmented-reality", "biometrics", "privacy"]
+++

On a short-form platform the camera is the first screen and the main product. Snapchat opens to it; TikTok, Instagram Reels and YouTube Shorts put a record button one tap from every feed. Inside it sits a small video studio (multi-clip recording, speed ramps, countdown timers, alignment overlays, per-segment filters, music cut to the beat) and a real-time graphics engine that tracks faces, hands, bodies and backgrounds at 30 frames a second on a phone that may be five years old. Users don't just upload what they shot elsewhere; they make the post inside the platform's own tool, and the tool leaves its fingerprints on everything: which effect was used, which version of it, whether the face in the frame was smoothed, whether the background was generated.

That makes the camera a source of product signals and a source of legal exposure at once. Effects are user-generated content in their own right, built by outside creators, reviewed, versioned, ranked and paid for, and a single popular effect can appear in millions of posts before anyone notices it breaks a rule. Beauty filters raised body-image concerns that led platforms to restrict them for teens and led Norway to require labels on retouched advertising. Face geometry is regulated: Illinois' biometric law produced settlements of $650 million, $92 million and $35 million against Facebook, TikTok and Snap, and Texas settled with Meta for $1.4 billion. Generative effects put the platform in the position of a provider of synthetic media, with the labeling and watermarking duties that come with it. This chapter covers the camera as a product, drafts and the offline upload model, the on-device effect runtime and its performance budget, effect creator platforms, beauty filters and body image, generative effects, biometric law, and what can be checked on the device before anything uploads. It extends `media_assets` and `upload_sessions` from [The Upload Path](/books/user-generated-platforms/upload-path#how-to-build-it), which owns everything that happens once bytes reach the server; the labeling of AI-generated content in general belongs to [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#labeling-ai-generated-content), and the rest of this part ([Interest-Graph Feeds](/books/user-generated-platforms/interest-graph-feeds), [Sounds, Remix & Duets](/books/user-generated-platforms/sounds-remix-and-duets), [Stories & Disappearing Content](/books/user-generated-platforms/stories-and-disappearing-content), [Social Commerce & Live Shopping](/books/user-generated-platforms/social-commerce-and-live-shopping)) covers what happens to a post after the camera.

## How the Platforms Do It

What the platforms and the on-device toolkits publish about their cameras and effects, as of October 2026:

| Platform or vendor | Capture tools | Effect platform | What's published about scale and rules |
| --- | --- | --- | --- |
| **Snapchat** | Camera-first app; Quick Cut turns Memories into beat-synced Snaps | Lens Studio (desktop, plus an iOS app and web tool launched in 2025); Camera Kit SDK puts Lenses in other companies' iOS, Android and web apps | Lenses used 8 billion times a day, more than 350 million users engaging with AR daily and over 450,000 developers with more than 5 million Lenses (Q4 2025); Lenses must stay under 8 MB and 150 MB of RAM |
| **TikTok** | Multi-clip recording, speed, timer, effects, drafts and device upload | Effect House, with Effect Creator Rewards paying for effects used in public videos | Effect packages capped at 8 MB with a 4-second load time; some appearance effects restricted for under-18s since late 2024; reads and writes C2PA Content Credentials |
| **Instagram and Facebook (Meta)** | Reels and Stories camera; Restyle edits Stories with Meta AI prompts and presets (October 2025) | Meta Spark, for third-party effects, shut down on January 14, 2025; only Meta-owned effects remain | Plastic-surgery effects removed from Instagram in October 2019; AR effects switched off in Texas and Illinois in May 2022 |
| **YouTube Shorts** | Multi-segment camera up to 3 minutes, speed 0.3x to 3x, timer, Align, per-segment filters, Retouch, low-light adjustment, Green Screen | First-party effects only; Dream Screen generates backgrounds and, since February 2025, clips with Veo 2 | Generated clips carry a SynthID watermark and a label |
| **Google MediaPipe and ML Kit** | On-device toolkits other apps build on | Face, hand, pose and segmentation models | 478 face landmarks and 52 blendshape scores; ML Kit "detects" faces and does not recognize people |
| **Apple Sensitive Content Analysis** | An OS framework apps call | Not an effect platform: on-device nudity detection | Runs only when the user or a parent has turned the feature on; apps may not send results off the device |

Four patterns run through the table. **Capture is in-house:** every short-form platform built its own camera rather than relying on the phone's, because the camera is where effects, sounds and remix tools attach and where the platform learns what was made. **Effects are a supply side:** Snap and TikTok run creator platforms with review, guidelines and payouts, and Meta's withdrawal from third-party effects shows that a platform can also decide the supply isn't worth its cost. **Performance is a published rule:** both effect platforms publish package size, memory or load-time limits, and both warn that some effects won't run on low-end Android phones. **Faces are regulated:** the same tracking that powers a puppy-ears Lens is "face geometry" under Illinois law, and the platforms' public position (Snap's, that Lenses "don't identify specific faces"; Meta's, that its AR technology "is not facial recognition") is a legal argument as much as a product description.

## The Camera Is the Product

YouTube's help pages describe the toolset every short-form camera now has. A multi-segment recorder makes Shorts up to 3 minutes long, with Undo removing the last clip and Redo restoring it. Speed changes a shot "between 0.3x - 3x." A timer sets a countdown before recording and the point where recording stops, so a creator can prop up the phone and step into frame. Align overlays the last frame of the previous clip so the next one lines up, the trick behind outfit-change transitions. Filters can differ "for each segment that you record." Retouch is "a skin smoothing effect that you can toggle on and off," and a lighting control brightens video recorded in dim rooms. Green Screen puts the creator in front of a photo, a video or another Short. Snap's Quick Cut goes a step further and cuts a set of Memories into "beat-synced" Snaps automatically. Music selection and the remix tools that reuse another post's audio or frame belong to [Sounds, Remix & Duets](/books/user-generated-platforms/sounds-remix-and-duets).

The platforms want capture in their own camera for three reasons:

- **Signals.** An in-app capture tells the platform what was recorded and how: which effects and sounds were used, how many segments, how long the creator spent, whether the face is the creator's own. Effect usage is itself a ranking and trend signal, because "posts made with this effect" is a feed of its own.
- **Attribution.** An effect's creator can be paid and credited only if the platform knows which posts used it. That's only reliable when the effect ran in the platform's camera and the client recorded it, with its version, at the moment of capture.
- **Quality control.** The platform controls resolution, frame rate, encoding and aspect ratio, so its transcoder gets inputs it expects ([Mezzanine Specs](/books/user-generated-platforms/upload-path#mezzanine-specs)), and it can apply its own rules on the device: an effect that isn't approved for a teen account never appears in that account's tray.

The capture record matters for provenance too. C2PA's actions vocabulary has entries for exactly what a short-form camera does: `c2pa.filtered` ("changes to appearance with applied filters, styles, etc."), `c2pa.changedSpeed` and `c2pa.cropped`, alongside the mandatory `c2pa.created` for new captures. A platform camera that knows which effects ran can describe them precisely, which an upload from the camera roll can't. My rule: **record capture metadata as structured data on the media asset at the moment the post is made** (in-app or imported, which effects and versions, which edits), because it drives attribution, payouts, labels and provenance, and it can't be reconstructed from the pixels later.

Imported media is the other path. Every platform also accepts video from the camera roll or from a separate editor, and those uploads arrive with whatever metadata the other tool left. The platform can read their provenance ([Provenance That Must Survive](/books/user-generated-platforms/images-at-scale#provenance-that-must-survive)) but can't know what effects were applied, so a post's capture source (in-app, imported, exported from the platform's own editor app, API) is a fact worth keeping.

## Drafts and the Offline Upload

A short-form post is assembled on the phone: segments recorded, effects rendered into the frames, music laid in, text and stickers placed, then encoded once into the file that uploads. The draft lives on the device until the user publishes, and the upload starts after. That ordering has three consequences.

**The client encodes.** The phone renders effects and composites in real time and writes the result; the server never sees the raw camera feed. This is what lets effects run without a round trip, and it's why the platform's mezzanine spec is really an instruction to its own client: encode at the resolution, frame rate and bitrate the transcoder wants. The server still treats the result as an untrusted upload and validates and scans it like any other ([Validation and Hostile Files](/books/user-generated-platforms/upload-path#validation-and-hostile-files)).

**The upload outlives the screen.** A user taps Post and puts the phone away. The upload has to continue in the background, survive a network change and resume after a drop, which is the resumable protocol from [Resumable and Chunked Uploads](/books/user-generated-platforms/upload-path#resumable-and-chunked-uploads) driven by the OS's background transfer service. The platforms ration that differently ([Background Execution Is Rationed](/docs/architecture/offline-sync#background-execution-is-rationed)). On iOS a background `URLSession` hands transfers to a separate system process that continues "even when the app itself is suspended or terminated," but "if the user terminates the app from the multitasking screen, the system cancels all of the session's background transfers"; the encoded file has to be written to disk first and the upload rebuilt from it on the next launch ([Attachments on a Separate Lane](/docs/architecture/offline-sync#attachments-on-a-separate-lane)). On Android, WorkManager persists scheduled work across restarts and reboots, can wait for an unmetered network, and supports long-running workers that show a notification. The product consequence is a post that says "uploading" in the profile until it's done, and a retry that doesn't create a second post: the create call carries an idempotency key tied to the draft.

**Drafts are private until published, and the law has noticed.** TikTok's 2022 privacy settlement included an injunction against "uploading content generated by users to the App's servers before the user saves or publishes it," unless disclosed in its privacy policy. Uploading early is tempting (it makes publishing feel instant, and a server can pre-scan and pre-transcode while the user writes a caption), but a draft the user abandoned is a recording the platform now holds and was never given. My default: **drafts stay on the device; the upload session opens when the user commits to post** (or saves a draft to an explicitly cloud-backed draft feature, disclosed as such), and anything uploaded speculatively is deleted on abandon on a short, stated clock.

Pre-uploading during caption entry is still worth it when the user has tapped Post. Opening the upload session as the composer appears and sending bytes while the user types makes the post appear seconds after they finish, and the asset stays in `uploading` or `scanning` until the gate passes ([Scanning Before Publish](/books/user-generated-platforms/upload-path#scanning-before-publish)), so nothing is visible early. The line is between "the user decided to post and is finishing the caption" and "the user is still deciding."

## Real-Time Effects on Device

An effect is a small program that runs on every camera frame. The pipeline under it is the same on every platform: detect the subject, track it frame to frame, estimate its geometry, then render graphics, distortions or color changes anchored to it. Google's MediaPipe documentation shows what the trackers produce:

| Tracker | Output | Published performance |
| --- | --- | --- |
| **Face landmarker** | 478 three-dimensional face landmarks, 52 blendshape scores (expression coefficients), and a transformation matrix from a canonical face model to the detected face, through a three-model pipeline (BlazeFace detector, face mesh, blendshapes) | No timing published; documented uses include "facial filters and effects" and avatars |
| **Hand landmarker** | 21 hand-knuckle coordinates per detected hand | 17.12 ms on CPU, 12.27 ms on GPU (Pixel 6) |
| **Pose landmarker** | 33 body landmarks, in image and world coordinates; Lite, Full and Heavy models | No timing published |
| **Image segmenter** | Selfie masks (person and background), hair masks, and a multi-class model for hair, body skin, face skin, clothes and accessories | Selfie segmenter about 33 to 35 ms; multi-class 217.76 ms on CPU, 71.24 ms on GPU (Pixel 6) |

Google's ML Kit draws the line platforms rely on legally: its face detection API locates eyes, ears, cheeks, nose and mouth, returns contours and smile and eyes-open probabilities, and assigns tracking IDs that persist across frames, but it "detects faces" and does not recognize who they belong to. Every effect platform's position on biometrics rests on that distinction, and the next sections show how far the law accepts it.

**The frame budget is the hard constraint.** At 30 frames a second a frame lasts 33 milliseconds, and in that time the camera has to deliver the frame, the trackers have to run, the effect has to render, and the encoder has to take the result if recording. The table shows the problem: on a Pixel 6, the selfie segmenter alone takes about a frame, and the multi-class segmenter takes two to seven frames depending on whether it gets the GPU. Effects that combine trackers therefore run them at lower resolution, skip frames and interpolate, or reuse results between frames, and low-end phones get simpler versions or nothing. The effect platforms publish the limits that follow:

- **Snap's Lens Studio** targets 30 FPS "for the best viewing experience" and requires a Lens to stay "greater than 15 FPS on most devices," under 150 MB of RAM and under 8 MB in size (models loaded through Snap ML and remote assets are counted separately); sponsored Lenses need an activation time under 650 ms on Snap's benchmark device. Its guide says to test "especially a lower-end Android device."
- **TikTok's Effect House** caps an effect's loading time at 4 seconds and its package at 8 MB on both iOS and Android, with images at 1024 KB and 1024 by 1024 pixels, and rejects effects that show a blank screen, crash or lag. Some effects "may not run on lower-end Android devices," which then display "This effect doesn't work with this device."

**The effect runtime is a sandbox for third-party code.** An effect package carries assets (meshes, textures, shaders, sounds), models and scripts that the platform's runtime executes on the user's phone, inside the camera, with access to the face mesh and the camera feed. Treat it the way [On-Platform App Runtimes](/books/user-generated-platforms/developer-platforms-and-apis#on-platform-app-runtimes) treats hosted apps: a scripting API that exposes only what effects need (tracking results, touch, time, audio levels), no network access except through platform-mediated calls, no file system, hard caps on memory and frame time, and a kill switch per effect and per version. The policy bans in Effect House's guidelines (no QR codes, no external links, no "artificial traffic schemes") are as much about the runtime as the content: an effect that can show a link can phish.

**Device tiers are data.** Which effects a phone gets is a decision made from the device model, OS version and measured performance, not a guess in the client. An effect version declares its minimum tier and the capabilities it uses; the effect tray asks for effects compatible with the device; and the platform measures frame rate and crash rate per effect version per device tier, so a version that drops low-end phones below 15 FPS can be pulled from that tier without being pulled everywhere.

## Effect Creator Platforms

Two platforms run effect ecosystems at scale, and a third shut its down.

**Snap** builds on Lens Studio, which it describes as "Snap's world-leading AR tools": over 450,000 developers had built more than 5 million Lenses by the end of 2025, and the same Lenses reach other companies' apps through Camera Kit, "Snap's cross-platform SDK for delivering AR experiences to your iOS, Android, and web apps," which has its own app review before distribution. Snap added a Lens Studio iOS app and web tool in 2025 for building from templates and AI tools "even without prior coding experience."

**TikTok** runs Effect House, whose guidelines bind effects to TikTok's terms, privacy policy and Community Guidelines and to effect-specific rules.

**Meta** announced on August 27, 2024 that Meta Spark, its platform for third-party AR effects, would close on January 14, 2025: from that date effects built by third parties, "including brands and our wider community of AR Creators," would "no longer be available," while "AR Effects owned by Meta will continue to be available." Meta said it was focusing on the products that "will best serve the future needs of our consumers and business customers alike," and Social Media Today reported it as shifting resources to "new form factors like glasses." What replaced the third-party supply on Instagram is first-party and generative: Restyle, launched in Instagram Stories in October 2025, edits photos by prompt ("Add, Remove, or Change") and applies preset effects to video with Meta AI, and an Add Yours sticker lets friends apply the same edit. The lesson for a platform deciding whether to open an effect platform is that the decision is reversible only at a cost to creators: Spark creators lost their distribution on Meta's apps, and Tubefilter pointed them to Snap and TikTok, whose reward programs pay for popular effects.

### Submission and Review

Both live platforms run the same two-stage review, and it's the one to copy:

1. **Technical checks, automated.** Snap tests each Lens "for performance, memory, and device compatibility across iOS and Android"; a Lens that fails shows as **Invalid**. Effect House's limits (load time, package size, image sizes, no crashes or lag) are checked the same way.
2. **Content review against policy.** Snap checks Lenses against its Community Guidelines and marks failures **Rejected**, with a reason; appeals go through its support site. Effect House lists its rejection categories (violent extremism, illegal activities and regulated goods, violent or graphic content and self-harm, hateful behavior and harassment, adult nudity and sexual content, minor safety, integrity, intellectual property) and specific bans relevant to effects: no depicting or promoting cosmetic surgery "including facelifts, rhinoplasty, and lip fillers," no disparaging disabled people "including by attempting to alter users' appearances," and no brand logos or call-to-action links in community effects without the brand's permission.

The submission itself is metadata the review relies on. Effect House requires a name unique to the creator, a compliant icon, a demo video that "accurately shows its features," an accurate category and accurate tags, and allows up to 10 resubmissions. The demo video matters because reviewers can't try an effect on every face, skin tone and device; an effect whose behavior differs from its demo (one that alters a face more on some inputs, or reveals a hidden mode after a gesture) is an integrity violation.

What review can't do is test every combination of face, lighting and device in advance, so post-publication signals carry the rest: user reports on the effect itself (Effect House takes them through a feedback form), reports on posts that used it, classifier hits on those posts, and crash and frame-rate telemetry. A report about an effect is a moderation case whose subject is the effect version, handled with the playbook's machinery ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)).

### Versions, Pages and Attribution

**Every update is a new version, reviewed again.** Snap's rule is the right one: "if a Lens was previously Live and only your latest update is Invalid, the previous version stays active." The live version doesn't change until its replacement passes; posts record the version that made them; and an effect can be rolled back to a prior approved version without a new review.

**Effect pages are feeds.** Each effect has a public page with its name, its creator and the posts that used it, and the effect name on a post links there. That page is how effects spread (users pick an effect from a post they liked) and why attribution has to be exact: the page is a query over posts by effect, and a creator's reward is the count behind it.

**Takedown of an effect used in millions of posts** has three separate levers, and they shouldn't be confused:

- **Stop new uses.** Withdraw the version (or the whole effect) from trays, search and the effect page's "try it" button. This is immediate and is the default for any confirmed violation, a broken version, or a legal problem (an IP claim on the effect's assets, a biometric law in one state).
- **Restrict by audience or place.** Pull an effect from minor accounts, or from one jurisdiction, without removing it elsewhere: the mechanism TikTok's teen restriction and Meta's 2022 Texas and Illinois shutdown both needed.
- **Act on existing posts.** Posts made with an effect are users' content, and most effect removals leave them alone. When the effect itself made the posts violating (a hateful overlay, a nudifying generative effect, an effect that displays a scam link), the posts are swept: the attribution table gives the list, the sweep opens cases in bulk, and the decision on each post is recorded like any other moderation decision ([Takedowns and Cache Purges](/books/user-generated-platforms/storage-and-delivery#takedowns-and-cache-purges) covers removing the files).

### Creator Rewards

Both live platforms pay effect creators from the platform's own budget, on usage in public posts within a window after launch, which makes the rewards incentive programs in [Incentive and Guaranteed Pay](/books/user-generated-platforms/creator-monetization#incentive-and-guaranteed-pay) terms:

- **TikTok's Effect Creator Rewards** launched in May 2023 with a $6 million fund, paying $700 when an effect was "used in 500K unique videos within 90 days of being published" and $140 for each further 100,000. For effects published from March 12, 2024, TechCrunch reported a lower threshold of 100,000 unique public video publishes, a per-volume (RPM) payout instead of flat fees, private videos no longer counting, 53 eligible regions, and caps some creators had reached of $14,000 per effect and $50,000 per month. I couldn't open TikTok's current terms page, so these figures are as reported in March 2024.
- **Snap's Lens Creator Rewards**, as of October 2026, has two options. Top Performer payouts reward Lenses that become high-performing "within the first 90 days after submission," based on "the number of unique users who post a Snap" with the Lens in qualified regions; Lens+ payouts are a revenue share by engagement for approved creators. Creators must be 18 or over, a Lens can be in only one payout option at a time and can't be un-enrolled, Lenses that violate moderation guidelines earn nothing, and Top Performer excludes Lenses based mainly on basic color filters, "beautification modifiers," static 2D images, frames or collages, and copies of other Lenses.

Three design points follow. **Count distinct posters or distinct public posts, not uses:** both programs do, because a try-on that's never posted, a private video or one account posting a hundred times would otherwise be farmed. **Count only posts that stand:** a post later removed, or made by an account later found inauthentic, comes out of the count, and a reward already paid on it is reversed as an earnings adjustment ([Fraud on Creator Money](/books/user-generated-platforms/creator-monetization#fraud-on-creator-money)). **The exclusions are policy:** Snap's refusal to pay for beautification modifiers is a body-image decision made through the incentive system rather than the content rules, and a platform that pays for usage without exclusions will be paid back in skin-smoothing filters, because they're the effects people use most.

## Beauty Filters and Body Image

Effects that change how a face or body looks became a policy problem before they became a legal one. The record:

- **October 2019, Instagram.** Spark AR said it would "remove effects that simulate the outcome of plastic surgery procedures or otherwise point out facial flaws" and that it was "re-evaluating our existing policies as they relate to well-being."
- **February 2021, UK advertising.** The Advertising Standards Authority ruled against two tanning-product ads in influencers' Instagram Stories whose beauty filters were "directly relevant to the performance of the products being advertised," and advised influencers and brands to "avoid applying filters to photos or videos which are directly relevant to the product being advertised." The ad is the advertiser's responsibility, but the filter is often the platform's or a third-party effect.
- **July 1, 2022, Norway.** Section 2, second paragraph, of the Marketing Control Act requires a standard label on advertising in which retouching or other manipulation alters a person's body shape, size or skin; the Consumer Authority's guideline says filters and lenses are covered because the rule says "manipulation."
- **November 26, 2024, TikTok.** After an Internet Matters study in which teens and parents drew "a clear distinction" between "effects designed to be obvious and funny (e.g. animal ear effects)" and "effects designed to alter your appearance," and worried "that those viewing the content might not realise it had been altered," TikTok announced it would restrict "some appearance effects for teens under 18," provide "more information about how an effect might change their appearance if applied," and refresh Effect House guidance on "unintended outcomes."

Norway's guideline is the most detailed public rule, and it's worth reading for what a platform's camera has to make possible. Any alteration of body shape, size or skin counts, "even removing a single pimple," whether or not it was meant to beautify; narrowing a jaw, enlarging lips or eyes and smoothing skin are listed examples. It doesn't cover makeup and lighting applied before the shot, color changes to hair, teeth or eyes, general brightness and contrast, or parody where the alteration is obvious. The label, "RETUSJERT PERSON REKLAME," covers about 7% of the image, sits in the upper left corner below any username or platform filter overlay, and stays on screen for the whole of a film. Responsibility falls on advertisers and anyone paid to make advertising, influencers included, with accessory liability for those who help display unlabeled ads to Norwegian consumers. The Authority recommends keeping original files, because when it suspects retouching the advertiser has to prove there wasn't any.

None of these rules require a platform to do anything directly, but each one lands on its camera:

- **Effects need an appearance flag.** Whether an effect alters face shape, size or skin is a property of the effect version, declared by the creator and checked in review, the same way a category is. TikTok's teen restriction, a disclosure in the effect picker ("this effect smooths skin and reshapes features"), Snap's reward exclusion and an advertiser's Norwegian label all depend on knowing it.
- **Restrictions by age are rules, not code.** Appearance effects for minors are a row in the feature rules by age band and jurisdiction from [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#how-to-build-it), so the tray filters on it and the rule can change by market.
- **Posts should carry what was applied.** A post made with an appearance effect can show the effect's name (which most platforms already do) and, where a rule or the platform's policy calls for it, a disclosure that the person's appearance was altered. A platform with branded content tools can prompt advertisers in Norway to add the label when an appearance effect was used in a paid partnership post, because it knows both facts.
- **Retouch is a default.** A skin-smoothing control that is off unless the user turns it on, as YouTube's toggle allows, is a different product from one that's on for everyone, and a teen default is a choice the platform makes.

## Generative Effects

Generative models turned effects from overlays into rewrites. Snap reported that more than 700 million users had engaged with its Gen AI Lenses over 17 billion times by the end of 2025, and that its Imagine Lens was used nearly two billion times in the months after its September launch; it also launched Animate It, an "open prompt video generation Lens" on its own video model. YouTube's Dream Screen generates Shorts backgrounds from a prompt and, since February 13, 2025, standalone clips with Google DeepMind's Veo 2. Instagram's Restyle edits Stories by prompt. These differ from tracking effects in two ways that matter to the build: **the work usually happens on a server,** so frames or photos leave the device, and **the output is synthetic media the platform made,** which puts the platform in the provider's and deployer's roles under the EU AI Act ([The EU AI Act's Transparency Duties](/books/user-generated-platforms/ai-on-user-generated-platforms#the-eu-ai-act-s-transparency-duties)).

The platforms mark what their own tools generate, in three layers:

- **A visible mark on export.** Snap adds "a watermark of a Snap Ghost with sparkles" when a generated image is exported or saved to the camera roll, marks AI features with a sparkle icon for the person using them, shows recipients a context card on shared Dreams images, and treats removing the watermark as a terms violation.
- **An invisible watermark.** YouTube applies SynthID to Veo-generated Shorts clips, alongside a label that they were "made with AI."
- **Signed provenance.** TikTok labels content made with its AI effects and, since May 2024, attaches C2PA Content Credentials to its content so they travel with downloads; it calls itself the "first video sharing platform to put Content Credentials into practice."

The general rules for labels (declared, detected, from provenance, reviewed) and for reading other tools' credentials belong to [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#labeling-ai-generated-content). The camera-specific rule is simpler: **when the platform's own effect generated or materially altered the pixels, the platform knows it, so the label is set from the capture record, never left to the creator's declaration.** The effect version says it's generative; the post's attribution row says it was used; the label follows.

**Capture credentials** are the other half. Google's Pixel 10 attaches Content Credentials to "any JPEG photo capture" in Pixel Camera, at the C2PA Conformance Program's Assurance Level 2, with certificate management designed so that "no image or group of images can be related to one another or the person who created them," and trusted time-stamps that work offline. Google's reason is the one that should shape a platform camera: if only synthetic content is labeled, "users falsely believe unlabeled content is 'not AI'," which it calls "the implied truth effect." A platform camera can do the same for its own captures: sign a manifest at publish that records a `c2pa.created` capture, the `c2pa.filtered` and `c2pa.changedSpeed` actions it applied, and a digital source type of generative composite when a generative effect ran. That turns "made in our camera, with these effects" into something a viewer, another platform or a regulator can verify, and it needs the signing infrastructure [Provenance That Must Survive](/books/user-generated-platforms/images-at-scale#provenance-that-must-survive) describes. Two limits apply: a signed manifest says what the platform's camera did, not that the scene was real (a camera pointed at a screen is still a capture), and it must not identify the user beyond what the post already shows, which is why Google's per-image certificates are the model rather than a per-account key.

Generative effects also widen the abuse surface. An effect that edits a body on prompt can be prompted to undress it, and an effect that swaps faces can put a real person into a scene they were never in. Generative effects get the strictest review tier, prompt and output filters on the server, a ban on generating sexual imagery of real people, and the hash and reporting path in [Deepfakes](/books/user-generated-platforms/intimate-image-abuse#deepfakes) for anything that gets through.

## Faces, Biometrics and the Law

Face tracking is the legal center of this chapter. A Lens or effect computes a mesh of the user's face many times a second; whether that mesh is a "biometric identifier" decides whether the platform owes notice, written consent, a published retention schedule and statutory damages per person.

**Illinois' Biometric Information Privacy Act** (740 ILCS 14) defines a biometric identifier as "a retina or iris scan, fingerprint, voiceprint, or scan of hand or face geometry," and excludes photographs. Its duties on a private entity:

- **Before collecting** (Section 15(b)): inform the subject in writing that biometric identifiers are being collected or stored, inform them in writing of "the specific purpose and length of term," and receive "a written release," which the 2024 amendment allows to be signed electronically.
- **A public retention schedule** (15(a)) with destruction when the purpose is satisfied or "within 3 years of the individual's last interaction," whichever comes first.
- **No profit** from biometric data (15(c)) and **no disclosure** without consent or legal compulsion (15(d)), with storage at least as protective as other confidential data (15(e)).
- **A private right of action** (Section 20): liquidated damages of $1,000 per negligent violation and $5,000 per intentional or reckless one, or actual damages if greater, plus attorneys' fees.

The Illinois Supreme Court held in *Cothron v. White Castle* (2023) that a claim accrues with each collection, which risked what it called "annihilative liability"; the legislature answered with SB 2979, signed and effective on August 2, 2024, under which repeated collection of the same identifier from the same person by the same method is one violation and an "aggrieved person is entitled to, at most, one recovery." On April 1, 2026, the Seventh Circuit held in *Clay v. Union Pacific Railroad* that the amendment applies to pending cases. The per-person exposure remains, and a platform with millions of Illinois users still faces it.

The settlements show where the line has been drawn in practice:

- **Facebook, $650 million.** Judge James Donato of the Northern District of California approved the settlement on February 26, 2021, for Illinois users for whom Facebook created and stored a face template after June 7, 2011, through its Tag Suggestions feature, with at least $345 for each claimant. The injunctive terms included not creating face templates without express consent "after a separate disclosure." This was recognition (matching faces to people), not effects.
- **TikTok, $92 million.** Judge John Z. Lee of the Northern District of Illinois granted final approval on July 28, 2022, in *In re TikTok, Inc., Consumer Privacy Litigation* (MDL No. 2948), for a nationwide class of an estimated 89 million users and an Illinois subclass of about 1.4 million. The Illinois claims alleged that the app harvested facial scans without consent, and plaintiffs' discovery covered whether they "used any of the App's video editing features or facial filters." TikTok denied collecting facial recognition data without authorization. Besides the fund, it agreed not to use the app to collect or store biometric information, transmit user data outside the US, or upload users' content before they save or publish it, unless disclosed in its privacy policy.
- **Snap, $35 million.** Snap settled an Illinois class action in 2022 over Lenses and filters used since November 17, 2015, which alleged collection of facial biometric data "without obtaining informed written consent each time it scanned their faces." Snap denied that Lenses violate BIPA and said Lenses can't identify a specific person and "the data never leaves the user's mobile device."

Meta's response before its own effect settlements arrived was to switch the features off. On May 11, 2022 it disabled AR effects using face geometry for users in Texas and Illinois, saying "the technology we use to power augmented reality effects like avatars and filters is not facial recognition or any technology covered by the Texas and Illinois laws and is not used to identify anyone," and that it was acting "to prevent meritless and distracting litigation"; it said it would build an opt-in.

**Texas' Capture or Use of Biometric Identifier Act** (Business and Commerce Code § 503.001) covers "a retina or iris scan, fingerprint, voiceprint, or record of hand or face geometry" captured for a commercial purpose. It requires informing the individual and receiving consent before capture, bars sale or disclosure with narrow exceptions, requires destruction within a reasonable time and no later than the first anniversary of the purpose expiring, and carries a civil penalty of up to $25,000 per violation, enforced by the attorney general rather than private suits. Texas used it against Meta: a suit filed in February 2022 under CUBI and the Deceptive Trade Practices Act over Tag Suggestions ended in a $1.4 billion settlement announced on July 30, 2024.

**The GDPR** draws the line where the platforms argue it should be. Biometric data is personal data from technical processing of physical characteristics "which allow or confirm the unique identification of that natural person" (Article 4(14)), and the special-category prohibition in Article 9(1) covers "biometric data for the purpose of uniquely identifying a natural person." A face mesh used only to place sunglasses, computed and discarded on the device, is a weak fit for that definition; a face template kept to recognize the user across sessions, or a selfie uploaded to train a personalized generative model, is a strong one.

The design that follows from all three regimes:

- **Process faces on the device, transiently.** Landmarks, meshes and masks exist in memory for the frame and are never written, logged or sent. This is the factual basis of every platform's defense and the easiest thing to break with a stray analytics event or a crash report that includes a frame.
- **Never compute a template that persists.** Tracking IDs that last for a session (ML Kit's are per detection stream) are fine; an embedding stored to re-identify the face tomorrow is recognition, whatever the feature is called.
- **Treat server-side face processing as a separate feature with its own consent.** A generative effect that uploads a selfie, an avatar built from a face scan, or a feature that remembers "your face" sends face data to the platform. That needs the notice, purpose, retention period and written release BIPA describes, gated per jurisdiction, recorded per user, and destroyed on schedule.
- **Declare it per effect version.** Whether an effect uses face tracking, and whether it sends any frame or face-derived data off the device, are capabilities in the effect's manifest that the runtime enforces (no network for a tracking-only effect) and review checks. A third-party effect that exfiltrates face data is the platform's BIPA problem.
- **Publish what you do.** A plain statement of what face processing happens, where, and for how long, in the privacy policy and next to the feature, is what BIPA's notice requires when it applies and what a court reads when the question is whether it does. The playbook's [Privacy by Design and by Default](/docs/compliance/gdpr#privacy-by-design-and-by-default) covers the impact assessment that belongs behind it.
- **Be able to turn it off by place.** Meta's 2022 shutdown worked because effects could be disabled by state. Jurisdiction-scoped feature rules are the mechanism, and they're the same rows that carry age restrictions.

## Safety Before Upload

Some checks can run on the device before a file is sent, and the OS vendors now provide them. Apple's Sensitive Content Analysis framework (iOS 17 and macOS 14 on) lets an app "check content for nudity and other sensitive material" before displaying it, and from iOS 26 an `SCVideoStreamAnalyzer` can watch a video stream "from either the device's camera or the remote devices" on a call. It works only when the user has turned on Sensitive Content Warning (for adults) or a parent has enabled Communication Safety in Screen Time (for children), which Apple turns on by default for under-18 accounts on its latest software; children under 13 can't view flagged content without a parent's passcode. Communication Safety also covers some third-party apps "when a child selects a photo or video to share."

The constraint that shapes the design is Apple's: "don't transmit any information off the person's device about whether the Sensitive Content Analysis framework identified an image or video as containing sensitive content," and "Apple doesn't receive an indication that sensitive content was detected." The framework is for protecting the person holding the phone, "not as a way for an app to report on someone's behavior." So the on-device result can blur, warn, interrupt a video call or ask a child to involve a parent before sending, but it can't become a moderation signal, a report or a ranking feature on the server. The platform's own scanning gate still runs on every upload ([Scanning Before Publish](/books/user-generated-platforms/upload-path#scanning-before-publish)), and hash matching against child sexual abuse lists stays on the server path that [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#hash-matching) owns.

What the camera can do on its own:

- **Intervene for the user, not about them.** A teen account about to post or send something an on-device classifier flags gets a pause and a choice; the platform doesn't learn which.
- **Use the OS framework where it's on, and don't duplicate it badly.** Where a platform runs its own on-device classifier, the same rule should hold: a pre-upload warning is a user-facing feature, and anything the platform needs to know comes from the server-side scan of what was actually uploaded.
- **Keep the pre-upload record minimal.** The draft, its frames and any on-device verdict stay on the device unless the user publishes; what uploads is the post, and what the server knows is what it scanned.

## How to Build It

The chapter adds effects as first-class records (the effect, its versions, its reviews, and the posts that used it), capture metadata on media assets, a draft key on upload sessions, and biometric consent records. Rewards and age rules reuse tables other chapters own.

```sql
CREATE TABLE effects (                   -- an effect a creator publishes; the stable identity
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_account_id   UUID REFERENCES accounts (id),  -- null: a first-party effect
  profile_id         UUID REFERENCES profiles (id),  -- the creator face it's credited to
  name               TEXT NOT NULL,
  origin             TEXT NOT NULL CHECK (origin IN ('first_party', 'creator', 'brand',
                       'partner')),          -- partner: licensed in from another effect platform
  live_version_id    UUID,                   -- effect_versions; what trays serve now
  state              TEXT NOT NULL CHECK (state IN ('draft', 'live', 'restricted',
                       'withdrawn', 'removed')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_account_id, name)          -- names unique per creator
);

CREATE TABLE effect_versions (           -- every submitted package; immutable once reviewed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  effect_id          UUID NOT NULL REFERENCES effects (id),
  version            INT NOT NULL,
  package_key        TEXT NOT NULL,          -- object storage key of the signed package
  package_sha256     BYTEA NOT NULL,
  package_bytes      INT NOT NULL CHECK (package_bytes > 0),
  demo_asset_id      UUID REFERENCES media_assets (id),  -- the demo reviewers judge against
  capabilities       TEXT[] NOT NULL,        -- 'face_tracking', 'hand_tracking', 'body_tracking',
                                             -- 'segmentation', 'audio_reactive', 'world_tracking'
  alters_appearance  BOOLEAN NOT NULL,       -- reshapes or resizes features, or alters skin
  generative         BOOLEAN NOT NULL,       -- a model generates or rewrites pixels
  off_device         TEXT NOT NULL DEFAULT 'none' CHECK (off_device IN ('none',
                       'frames', 'selfie', 'face_derived')),  -- what leaves the phone, if anything
  min_device_tier    SMALLINT NOT NULL DEFAULT 1,
  state              TEXT NOT NULL CHECK (state IN ('submitted', 'invalid', 'in_review',
                       'rejected', 'approved', 'superseded', 'withdrawn')),
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at        TIMESTAMPTZ,
  UNIQUE (effect_id, version),
  CHECK (state <> 'approved' OR approved_at IS NOT NULL)
);

ALTER TABLE effects
  ADD CONSTRAINT effects_live_version FOREIGN KEY (live_version_id)
    REFERENCES effect_versions (id);

CREATE TABLE effect_reviews (            -- each check a version went through
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  effect_version_id  UUID NOT NULL REFERENCES effect_versions (id),
  stage              TEXT NOT NULL CHECK (stage IN ('technical', 'content', 'privacy',
                       'post_publication')),
  outcome            TEXT NOT NULL CHECK (outcome IN ('pass', 'invalid', 'rejected',
                       'restricted', 'escalated')),
  reasons            TEXT[] NOT NULL DEFAULT '{}',  -- policy codes or failed limits
  measurements       JSONB,                  -- fps by device tier, memory, load time, size
  reviewer_id        UUID REFERENCES accounts (id),  -- null: automated
  checker_version    TEXT,                   -- the test harness or model that ran
  moderation_decision_id UUID REFERENCES moderation_decisions (id),  -- content outcomes
  reviewed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE content_effects (           -- which effect versions made a post; the attribution
  content_item_id    UUID NOT NULL REFERENCES content_items (id),
  effect_version_id  UUID NOT NULL REFERENCES effect_versions (id),
  effect_id          UUID NOT NULL REFERENCES effects (id),  -- denormalized for effect pages
  media_asset_id     UUID REFERENCES media_assets (id),      -- the file it was rendered into
  source             TEXT NOT NULL CHECK (source IN ('capture', 'editor', 'remix')),
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_item_id, effect_version_id)
);

CREATE INDEX content_effects_by_effect ON content_effects (effect_id, recorded_at);

ALTER TABLE media_assets
  ADD COLUMN capture_source   TEXT CHECK (capture_source IN ('in_app_camera',
                                'device_library', 'platform_editor', 'external_editor',
                                'api')),        -- what the client says; imported means unknown
  ADD COLUMN capture_edits    JSONB,            -- segments, speed changes, retouch on/off, trims
  ADD COLUMN platform_manifest_key TEXT;        -- the C2PA manifest the platform signed, if any

ALTER TABLE upload_sessions
  ADD COLUMN client_draft_id  TEXT,             -- the device's draft; retries reuse the session
  ADD COLUMN started_from     TEXT CHECK (started_from IN ('post_tapped', 'cloud_draft')),
  ADD COLUMN discard_after    TIMESTAMPTZ;      -- speculative bytes deleted if never published

CREATE TABLE biometric_consents (        -- notice and release for features that keep face data
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  feature            TEXT NOT NULL,          -- 'avatar_from_selfie', 'generative_selfie', ...
  jurisdiction       TEXT NOT NULL,          -- where the rule that required it applies
  notice_version     TEXT NOT NULL,          -- the exact text shown: purpose and term
  purpose            TEXT NOT NULL,
  retention_term     INTERVAL NOT NULL,      -- what the notice promised
  released_at        TIMESTAMPTZ NOT NULL,   -- the written (electronic) release
  withdrawn_at       TIMESTAMPTZ,
  data_destroyed_at  TIMESTAMPTZ,            -- when the face data was actually deleted
  CHECK (withdrawn_at IS NULL OR withdrawn_at >= released_at)
);
```

The reward count is one query over attribution, run per effect at the end of its window:

```sql
-- Qualified posts for an effect in its first 90 days: distinct public posts that still
-- stand, by authors in good standing, in eligible regions. The window, the visibility
-- rule and the regions come from the reward program's terms in force at launch.
SELECT ce.effect_id, COUNT(DISTINCT ce.content_item_id) AS qualified_posts
FROM content_effects ce
JOIN effects e        ON e.id = ce.effect_id
JOIN content_items ci ON ci.id = ce.content_item_id
JOIN accounts a       ON a.id = ci.author_account_id
WHERE ce.effect_id = $1
  AND ci.state = 'published'
  AND ci.visibility = 'public'
  AND ci.published_at < $2 + INTERVAL '90 days'   -- $2: the effect's first approval
  AND a.status = 'active'
  AND a.home_country = ANY ($3)                   -- the program's eligible regions
GROUP BY ce.effect_id;
```

Notes on the sketch:

- **Effects are content, and versions are what's judged.** An effect has a creator, a state and a public page like a content item, but what reviewers approve, posts record and takedowns target is a version. `live_version_id` moves only when a new version is `approved`, so an `invalid` or `rejected` update leaves the previous version serving, Snap's rule. Rolling back is pointing `live_version_id` at an older approved version.
- **The manifest is declared and enforced.** `capabilities`, `alters_appearance`, `generative` and `off_device` are what the creator declares and review verifies; the runtime refuses network access to a version declared `off_device = 'none'`, and a version that sends frames needs a `privacy` review row before approval. These columns drive the teen filter, the AI label, the disclosure in the picker and the biometric consent gate.
- **Review rows are evidence.** Each stage writes a row with its measurements or reasons, the harness or model version, and, for content outcomes, the `moderation_decisions` row that gives the creator a notice and an appeal ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons)). Reports against an effect open a `moderation_cases` row whose `subject_type` gains `'effect_version'`, and their outcomes land as `post_publication` reviews.
- **Attribution is written by the client and checked by the server.** The camera records which effect versions ran into the draft, and the publish call sends them with the post; the server accepts only versions that were approved and available to that account and device at capture time, so a modified client can't inflate a creator's count or attribute a post to an effect the account couldn't use. `content_effects` is the effect page's feed, the reward count and the sweep list for a violating effect.
- **Restrictions are rules as data.** Appearance effects for minors and face-tracking effects in a jurisdiction are `feature_age_rules` rows from [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#how-to-build-it) with features such as `'appearance_effects'` and `'face_tracking_effects'` (one row per age band for a rule that applies to everyone in a jurisdiction), so the tray query filters on the rules in force and a change by market is a row ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Rewards are earnings.** An effect reward program is a `revenue_programs` row with terms (window, threshold, visibility, regions, caps, exclusions such as appearance effects) from [Creator Monetization](/books/user-generated-platforms/creator-monetization#how-to-build-it); each payout is an `earnings` row with `source_type = 'incentive'`, and a post removed after payment produces a reversal rather than an edit.
- **Capture metadata is a client claim.** `capture_source` and `capture_edits` come from the client and are trusted only as far as the platform's own app is: they're good for attribution, labels and analytics, not for provenance. `platform_manifest_key` is the stronger statement: a C2PA manifest the platform signed at publish from its own capture record, stored with the original beside the provenance rows [Images at Scale](/books/user-generated-platforms/images-at-scale#how-to-build-it) keeps.
- **Speculative uploads expire.** A session opened before the user tapped Post isn't allowed by default; where a cloud-draft feature exists, `started_from = 'cloud_draft'` and `discard_after` record what the user agreed to, and the sweeper from [The Upload Path](/books/user-generated-platforms/upload-path#how-to-build-it) deletes the bytes when the clock runs out.
- **Consent is per feature, per jurisdiction, with destruction tracked.** `biometric_consents` records the notice text version, purpose and term the user agreed to, and the job that deletes face data on withdrawal or expiry stamps `data_destroyed_at`, so the platform can show both halves of BIPA's retention duty ([Erasure Requests](/docs/architecture/data-retention#erasure-requests)). Effects that track faces only on the device never write a row here, and that absence is the point.
- **Events:** `effect.submitted`, `effect.version_approved`, `effect.version_rejected`, `effect.withdrawn`, `effect.restricted`, `content.effects_recorded` and `biometric_consent.withdrawn` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)); the tray service, effect pages, reward counting, AI labeling and the face-data deletion job consume them.

## Auditing

- **Every effect version's review history:** the technical measurements, the content decision with its reasons and reviewer or model, the privacy review for anything that leaves the device, and every post-publication report and outcome, because a creator disputing a rejection or a regulator asking why a teen saw an appearance effect is answered from these rows.
- **Every change to what's live:** which version served, from when to when, who withdrew or restricted it and under which rule, so "which effect did this post use, and was it approved at the time?" has an answer.
- **Attribution as recorded at publish,** including the version, so reward counts, effect pages and sweeps can be reproduced, and so a reward dispute can be settled against the posts that counted.
- **Reward calculations:** the terms in force, the qualified-post count and the exclusions applied, and every reversal.
- **Biometric consents and destruction:** the notice version shown, the release, withdrawal, and when the data was destroyed, kept beyond the data itself as proof of compliance.
- **Restrictions by age and place,** with the source of each rule and its dates, because Meta's 2022 shutdown and TikTok's 2024 teen restriction are the kind of change a court or regulator will ask the platform to date.
- **Platform-signed manifests:** what the platform's camera asserted about each capture, and with which certificate, for as long as the content is served.

## What This Means for the System You Build

- **Build the camera as a product,** with multi-clip capture, speed, timers and alignment, and record what it did as structured data on the asset at publish.
- **Keep drafts on the device** until the user commits to post, then upload resumably through the OS background service, with an idempotency key from the draft.
- **Run effects in a sandboxed runtime** with no network by default, hard memory and frame-time limits, and a kill switch per version.
- **Publish a performance budget** (frame rate floor, memory, package size, load time) and enforce it by device tier from measured telemetry.
- **Review every effect version in two stages,** automated technical checks then content review against policy, and keep the previous version live when an update fails.
- **Record attribution by effect version** on every post, server-validated, because effect pages, rewards, labels and takedown sweeps all depend on it.
- **Pay effect rewards on distinct, standing, public posts** within a window, reverse on removal, and decide which effects you won't pay for.
- **Flag appearance-altering effects** per version and use the flag for teen restrictions, disclosures and advertising labels such as Norway's.
- **Label your own generative output from the capture record,** watermark and sign it, and give generative effects the strictest review tier.
- **Process faces on the device, transiently, and never persist a template;** anything that sends face data to a server needs notice, written release, a retention term and destruction you can prove.
- **Gate features by jurisdiction as well as age,** so a biometric law or a court order can switch off one state without a release.
- **Use on-device safety checks for the user's protection only,** and keep server-side scanning as the gate for everything that uploads.

## References

**Law and regulation**

- [Illinois Biometric Information Privacy Act, 740 ILCS 14 (annotated text, Akin Gump)](https://www.akingump.com/a/web/101105/Biometric-Information-Privacy-Act-740-ILCS-14-1-et-seq..pdf), the definition of biometric identifier including face geometry and excluding photographs, Section 15(a) to (e) duties, the 3-year destruction limit, Section 20 liquidated damages of $1,000 and $5,000
- [Sidley: Seventh Circuit holds 2024 BIPA amendment applies retroactively](https://datamatters.sidley.com/2026/04/08/seventh-circuit-limits-potential-damages-under-bipa-holds-2024-amendment-applies-retroactively/), SB 2979's one-recovery rule, *Cothron v. White Castle* (2023) and "annihilative liability," *Clay v. Union Pacific Railroad* (April 1, 2026)
- [Davis Wright Tremaine: Illinois revises biometrics law](https://dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages), SB 2979 signed and effective August 2, 2024, the single-violation rule and electronic signatures for written releases
- [Texas Business and Commerce Code § 503.001 (Capture or Use of Biometric Identifier)](https://texas.public.law/statutes/tex._bus._and_com._code_section_503.001), record of face geometry, notice and consent, disclosure limits, destruction by the first anniversary, $25,000 civil penalty, attorney general enforcement
- [GDPR Article 4](https://gdpr-info.eu/art-4-gdpr/), the definition of biometric data in point (14)
- [GDPR Article 9](https://gdpr-info.eu/art-9-gdpr/), biometric data for the purpose of uniquely identifying a person as a special category
- [Norwegian Consumer Authority: Guideline on labelling retouched advertising](https://www.forbrukertilsynet.no/english/the-norwegian-consumer-authoritys-guideline-on-labelling-retouched-advertising), Marketing Control Act Section 2 second paragraph from July 1, 2022, body shape, size and skin, filters and lenses, exclusions, the label's text, size and placement, responsibility and enforcement
- [ASA: The (mis)use of social media beauty filters when advertising cosmetic products](https://www.asa.org.uk/news/the-mis-use-of-social-media-beauty-filters-when-advertising-cosmetic-products.html), 11 February 2021, the Skinny Tan and We Are Luxe rulings and the guidance on filters

**Court records**

- [In re Facebook Biometric Information Privacy Litigation, order granting final approval (N.D. Cal., February 26, 2021)](https://infobytes.orrick.com/wp-content/uploads/pdf/Buckley%20InfoBytes%20-%20In%20re%20Facebook%20Biometric%20Information%20Privacy%20Litigation%20-%20Order%202021.02.26.pdf), the $650 million fund, Tag Suggestions and face templates after June 7, 2011, at least $345 per claimant, consent after a separate disclosure
- [In re TikTok, Inc., Consumer Privacy Litigation, memorandum opinion and order (N.D. Ill., July 28, 2022)](https://www.birdmarella.com/wp-content/uploads/2022/08/2022_TikTok_Opinion_and_Order.pdf), MDL No. 2948, the $92 million fund, the 89 million class and Illinois subclass, facial scan allegations, facial filters in discovery, and the injunction against collecting biometrics and uploading content before it's saved or published unless disclosed

**Platform documentation**

- [Snap: Lens Studio performance optimization guide](https://developers.snap.com/lens-studio/sponsored/optimization/performance-optimization-guide), 30 FPS target and 15 FPS floor, 150 MB RAM, 8 MB size, 650 ms activation for sponsored Lenses, testing on lower-end Android
- [Snap: Content rules and moderation guide](https://developers.snap.com/lens-studio/features/lens-studio-ai/easy-lens/content-rules-and-moderation), automated technical testing, content review, Invalid and Rejected states, the previous version staying live, appeals
- [Snap: Lens Creator Rewards](https://developers.snap.com/lens-studio/monetization/lens-creator-rewards), Top Performer and Lens+ payouts, the 90-day window, unique posters in qualified regions, the age requirement, enrollment rules and exclusions including beautification modifiers
- [Snap: Camera Kit](https://developers.snap.com/camera-kit/home), the cross-platform SDK for Lenses in other apps and its app review
- [Snap: Spectacles, publishing a Lens](https://developers.snap.com/spectacles/get-started/start-building/publishing-lens), the 8 MB limit for Lenses on Snapchat
- [Snap: Privacy by product, Lenses](https://values.snap.com/privacy/privacy-by-product/lenses), object detection rather than identifying faces
- [TikTok Effect House: Effect guidelines](https://effecthouse.tiktok.com/learn/guides/general/effect-guidelines), submission requirements, 10 resubmissions, load time, package and image limits, device support, rejection categories, cosmetic surgery and appearance rules, branding and links
- [TikTok: Updates from our European Safety Forum](https://newsroom.tiktok.com/en-eu/updates-from-our-european-safety-forum-strengthening-safety-for-our-now-175-m-strong-european-community), November 26, 2024, the Internet Matters findings, the under-18 restriction on some appearance effects, appearance information and Effect House guidance
- [TikTok: Introducing more ways for creators to monetize](https://newsroom.tiktok.com/introducing-more-ways-for-creators-to-monetize-their-content-authentically?lang=en), May 16, 2023, the $6 million Effect Creator Rewards fund and its launch thresholds
- [TikTok: Partnering with our industry to advance AI transparency and literacy](https://newsroom.tiktok.com/en-us/partnering-with-our-industry-to-advance-ai-transparency-and-literacy), May 9, 2024, reading and attaching Content Credentials and labels on AI effects
- [Meta Spark: Announcement](https://spark.meta.com/blog/meta-spark-announcement/), August 27, 2024, the January 14, 2025 shutdown of third-party effects and the continuation of Meta-owned effects
- [Instagram: Restyle your Stories with Meta AI](https://about.instagram.com/blog/announcements/ai-restyle-instagram-stories/), prompt edits, preset video effects and the Add Yours sticker
- [YouTube: Tips to create YouTube Shorts](https://support.google.com/youtube/answer/12948448), speed, timer, Align, per-segment filters, Retouch, lighting, Green Screen and effects
- [YouTube: Create YouTube Shorts](https://support.google.com/youtube/answer/10059070?hl=en), the multi-segment camera up to 3 minutes, Undo and Redo, drafts
- [Google: MediaPipe Face Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker), 478 landmarks, 52 blendshapes, transformation matrices, the three-model pipeline, use for filters and effects
- [Google: MediaPipe Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker), 21 landmarks and Pixel 6 latency
- [Google: MediaPipe Pose Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker), 33 landmarks and the model variants
- [Google: MediaPipe Image Segmenter](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter), selfie, hair and multi-class models and their Pixel 6 latency
- [Google: ML Kit Face Detection](https://developers.google.com/ml-kit/vision/face-detection), landmarks, contours, classification and tracking IDs, detection rather than recognition
- [Apple: Sensitive Content Analysis](https://developer.apple.com/documentation/sensitivecontentanalysis), on-device checks for nudity, the user and parental settings, iOS 17 and macOS 14
- [Apple: Detecting nudity in media and providing intervention options](https://developer.apple.com/documentation/sensitivecontentanalysis/detecting-nudity-in-media-and-providing-intervention-options), not transmitting results off the device, adult and child settings, the entitlement
- [Apple: SCVideoStreamAnalyzer](https://developer.apple.com/documentation/sensitivecontentanalysis/scvideostreamanalyzer), analyzing camera and call video streams from iOS 26
- [Apple: About Communication Safety](https://support.apple.com/en-us/105069), on by default under 18, under-13 permission, on-device analysis, third-party apps
- [Apple: background(withIdentifier:)](https://developer.apple.com/documentation/foundation/urlsessionconfiguration/background(withidentifier:)), background transfers in a separate process and cancellation on force quit
- [Android: Persistent work with WorkManager](https://developer.android.com/develop/background-work/background-tasks/persistent), persistence across reboots, network constraints, long-running and expedited work

**Standards**

- [C2PA: Technical specification 2.2](https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html), the actions vocabulary including `c2pa.created`, `c2pa.filtered` and `c2pa.changedSpeed`
- [Google Security Blog: How Pixel and Android are bringing a new level of trust to your images with C2PA Content Credentials](https://security.googleblog.com/2025/09/pixel-android-trusted-images-c2pa-content-credentials.html), September 10, 2025, credentials on every Pixel Camera JPEG, Assurance Level 2, unlinkable certificates, offline time-stamps, the implied truth effect

**Filings**

- [Snap: Fourth quarter and full year 2025 results (PDF)](https://s25.q4cdn.com/442043304/files/doc_financials/2025/q4/Snap-Inc-Q4-25-Press-Release.pdf), February 4, 2026, Lens usage, developers and Lenses, daily AR engagement, Gen AI Lens engagement, the Imagine and Animate It Lenses, Quick Cut
- [Snap: Second quarter 2025 results (PDF)](https://s25.q4cdn.com/442043304/files/doc_financials/2025/q2/Q2-25-Final-Earnings-Release.pdf), the Lens Studio iOS app and web tool

**In practice**

- [TechCrunch: TikTok lets creators in more countries get rewarded for effects](https://techcrunch.com/2024/03/12/tiktok-letting-creators-more-countries-get-rewarded-effects/amp/), March 12, 2024, the 100,000 public video threshold, RPM payouts, 53 regions and reported caps
- [TechCrunch: TikTok will restrict some beauty filters for under-18s](https://techcrunch.com/2024/11/27/tiktok-will-restrict-some-beauty-filters-for-under-18s/), the global rollout
- [TechCrunch: YouTube Shorts adds Veo 2](https://www.techcrunch.com/2025/02/13/youtube-shorts-adds-veo-2-so-creators-can-make-gen-ai-videos), February 13, 2025, Dream Screen clips, SynthID and labels, launch countries
- [Social Media Today: Meta's shutting down Spark AR](https://www.socialmediatoday.com/news/metas-shutting-down-spark-ar-studio/725443/), Meta's statement on shifting resources to glasses and the effect on campaigns
- [Tubefilter: Meta is shutting down its AR platform](https://www.tubefilter.com/2024/08/27/meta-shutting-down-spark-ar-augmented-reality-platform/), Snap and TikTok reward programs as the alternatives for Spark creators
- [Social Media Today: Snapchat adds AI watermarks and transparency measures](https://www.socialmediatoday.com/news/snapchat-adds-new-ai-watermarks-and-transparency-measures/713370/), April 16, 2024, the ghost-and-sparkles watermark on export, sparkle icons, context cards, the removal ban
- [9to5Mac: Instagram Stories now support AI-powered edits with Restyle](https://9to5mac.com/2025/10/23/instagram-stories-now-support-ai-powered-edits-with-the-new-restyle-tool/), October 23, 2025, the launch date
- [PhillyVoice: Instagram bans plastic surgery filters](https://www.phillyvoice.com/instagram-bans-plastic-surgery-filters-mental-health-concerns-spark-ar/), October 24, 2019, Spark AR's statement on removing plastic surgery effects
- [Complex: Meta disables Instagram filters in Texas and Illinois](https://www.complex.com/life/a/brad-callas/meta-disables-instagram-filters-texas-illinois-facial-recognition-laws), May 11, 2022, Meta's statement and the planned opt-in
- [NBC Chicago: Illinois residents may be owed money in a Snapchat lawsuit](https://www.nbcchicago.com/news/local/illinois-residents-may-be-owed-money-in-a-snapchat-lawsuit-worth-millions-heres-how-to-find-out/2921243/), August 23, 2022, the $35 million settlement, the class period, the allegation and Snap's denial
- [The Record: Meta to pay Texas $1.4 billion over facial recognition](https://therecord.media/meta-texas-facial-recognition-settlement), July 30, 2024, the CUBI and DTPA suit filed February 2022 over Tag Suggestions
