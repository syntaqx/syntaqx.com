+++
title = "Sounds, Remix & Duets"
description = "Sounds as first-class objects, duets, stitches, remixes and templates, lineage between posts, music licensing by account and region, and how trends spread."
category = "User-Generated Platforms Industry"
order = 1821
part = "Social and Short-Form"
aliases = []
tags = ["user-generated-content", "short-form-video", "music-licensing", "remix", "sounds", "trends"]
+++

On a short-form video platform the audio is a thing in its own right. A creator records a clip of themselves talking over a beat; the platform pulls the audio out, names it after the creator, and gives it a page; a hundred thousand other people pick that audio from the page and make their own videos with it; some of them put their video beside the original, some clip its first five seconds and answer it, some reuse its cut timing with their own footage. Each of those is a new post with its own author, audience and moderation state, and each is also a derivative of something else: of a sound, of a parent video, of a template. The platform has to record those links, show them, rank by them, and pull them apart again when a sound is removed, a parent is deleted, or a record label's license runs out and every video using its catalog goes silent at once.

This chapter covers the sound as an object (extraction, the sound page, attribution, renaming and removal), the remix primitives (side-by-side duets, clipped stitches and cuts, green-screen backgrounds, templates), per-post reuse permissions and the defaults for minors, lineage between posts and what happens when a parent goes, music licensing (general and commercial libraries, label and publisher deals, the account-type and region limits, and how a license decides which features exist), voiceover and synthetic voices, and how trends spread and get charted. Fingerprinting uploads against rights holders' references, Content ID-style claims and the Article 17 regime are [Copyright at Scale](/books/user-generated-platforms/copyright#fingerprinting-and-content-id); who bears music costs in revenue pools is [Music Costs Shared With Creators](/books/user-generated-platforms/creator-monetization#music-costs-shared-with-creators); the ranking that turns a sound into a trend is [Interest-Graph Feeds](/books/user-generated-platforms/interest-graph-feeds); the camera, filters and the green-screen effect itself are [Camera & Effects](/books/user-generated-platforms/camera-and-effects). None of this is legal advice.

## How the Platforms Do It

Every major short-form platform now has a sound object and at least one way to build on someone else's video; they differ in what a sound page aggregates, which primitives exist, who may reuse a post by default, and what happens to derivatives when the original goes. As of October 2026, from each platform's help pages:

| Platform | Sounds | Remix primitives | Reuse controls | When the original goes |
| --- | --- | --- | --- | --- |
| **TikTok** | Original sounds extracted from posts; a sound detail page; business accounts limited to music licensed for commercial use | Duet (side by side, with left-right, react, top-bottom and three-screen layouts since 2020); Stitch (up to five seconds of another video, then yours); credit up to three videos in a description | Per account (Everyone or Friends) and per post ("Allow reuse of content"); one switch covers Duet, Stitch, stickers and adding to Stories | Existing Stitches stay; the originator can remove all associated Duets and Stitches, which also removes the original |
| **Instagram** | Original audio with the creator's username; audio pages per song; licensed audio must be attributed to the artist and track | Remix with the original as background, in a chosen layout, or after it; Templates reuse a reel's music and clip timing | Per account per content type and per post; defaults follow account privacy; turning off remixing doesn't stop use of original audio | Deleting the post deletes its remixes; a private account for more than 24 hours deletes them; restoring within 30 days restores them |
| **YouTube Shorts** | Sound from Shorts, long-form videos and Official Artist Channels, credited on the Sound Library page | Sound, Green Screen, Cut (a segment with its audio and video), Collab; Shorts templates | Opted in by default; opt out per video or in bulk in YouTube Studio; partners can restrict audio and video remixing | Audio remixes muted, unlisted and deleted after 30 days; video remixes deleted |
| **Snapchat** | Sounds tool for licensed song clips, TV and film excerpts and original audio | Remix, tested in 2021 as a reply to a friend's Story, with side-by-side, top-and-bottom and overlay formats | A permission toggle was reported by a reverse engineer during the 2021 test | Not published |

Triller matters here for its licensing history rather than its features: Universal Music Group pulled its catalog in February 2021 over withheld payments, and the NMPA signed an opt-in deal for its publishers a month later ([Recordings and Compositions](#recordings-and-compositions)). The rows show three positions on the hardest question in this chapter, whether a derivative outlives its parent: TikTok keeps it, Instagram deletes it, YouTube deletes video remixes at once and audio remixes after 30 days. [Lineage](#lineage) is where I take a position.

## The Sound as an Object

A sound is audio with an identity: a title, an attribution, a page, a license position and a list of every post that uses it. It isn't the audio track of one video. The same 15 seconds of audio sits in thousands of posts, each trimmed to a different start point and mixed at a different volume, and the platform has to answer for all of them at once when the sound is renamed, matched to a song, or removed.

### Original Audio

There are two ways a sound comes into existence. A **catalog or library track** arrives from a licensor with its metadata and rights. An **original sound** is extracted from an upload: the creator records or uploads a video, and the platform makes its audio reusable under the creator's name. Instagram defines original audio as "unique audio you created, either while filming your reel in the Instagram app or in a video you uploaded", displayed with the creator's username, and says that when a reel is posted on a public account "anyone on Instagram" can record a reel with that audio; it adds a separate toggle for use in its Meta AI apps. Snapchat's Sounds tool lets users add licensed clips, TV and film excerpts and their own original audio. YouTube Shorts can take sound from other Shorts, from long-form videos and from Official Artist Channels, which makes any long-form upload a potential sound source unless its owner opts out.

Two design rules come from that. **Extraction is a pipeline step, not a property of the video.** The upload path produces a separate audio asset (and, where the editor kept them apart, separate stems for the creator's voice and the added music) so that the sound can be served, trimmed and muted on its own; the track model is in [Thumbnails, Captions and Audio Tracks](/books/user-generated-platforms/video-on-demand#thumbnails-captions-and-audio-tracks). **An original sound isn't cleared just because a user made it.** A creator who films over a song playing on a speaker has made an "original sound" that is a commercial recording. That is why the match step in the next section runs on every extracted sound before it gets a page.

### Attribution and Re-attribution

Attribution is the field platforms change most. Instagram says that when it detects that recorded or uploaded audio uses licensed audio, it will "automatically change attribution from Original Audio to the artist and song title" and add the reel to that song's audio page; if it got the match wrong, the creator can choose Remove From Audio Page and the audio goes back to their username. It also says "all licensed audio must be attributed or linked to the artist and include the name of the track", which reads as a license term surfacing in the product.

So a sound has a lifecycle of attributions, not one: created as the originator's, matched to a catalog recording and merged into its page, possibly unmatched on the creator's dispute. Each change moves every post that uses the sound, so it's a recorded event with an actor (the originator, the matcher, staff) and a reason, never an overwrite. The matcher is the same fingerprinting service the copyright chapter describes ([Fingerprinting and Content ID](/books/user-generated-platforms/copyright#fingerprinting-and-content-id)), pointed at sounds as well as uploads; a match on a sound is worth more than a match on a post, because one decision covers every use.

### The Sound Page

The sound page is the aggregation: the sound's title and attribution, the originating post, a "use this sound" action, and a ranked feed of every post that uses it. TikTok's help pages call it the original sound screen, and its 2023 Add to Music App feature put a save-to-streaming button on the sound detail page as well as under videos, which makes the page a hand-off to Spotify, Apple Music and Amazon Music. Instagram calls it the audio page; YouTube credits sources on its Sound Library page and links from the Shorts player to the source video.

Three things the page has to get right:

- **It's filtered for the viewer.** A use whose post is private, removed, age-restricted or blocked in the viewer's country isn't on the page for that viewer, and neither is the sound if its license doesn't cover the viewer's territory or the viewer's account type.
- **The originator is pinned.** Attribution back to the first post is the creator's credit and the reason they made something reusable; it stays at the top of the page while the sound exists, unless the sound was re-attributed to a catalog track, in which case the song's page gets the uses and the creator's post becomes one use among many.
- **It's a ranked surface.** Which uses appear first is a feed decision with the same ranking, safety filtering and regulatory duties as any feed ([Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#what-the-feed-optimizes)).

### Renaming and Removing a Sound

Renaming changes the title on every post that uses the sound, so it's a revision with history. My rule: an originator can rename an unmatched original sound, every rename is kept, a rename never changes the attribution, and once a sound is matched to a catalog track the licensor's metadata wins and the originator's rename is off.

Removal is the cascade that makes the sound model worth building carefully. TikTok documents three paths:

- **The originator removes it.** A creator can remove an original sound "at any time", and it is "permanently removed from all videos that use that sound, including your own"; creators who used it are notified.
- **The platform removes it for intellectual property or policy.** The originator is notified and "any TikTok videos that use that sound will be muted". Other creators whose videos lost the sound aren't notified but see the reason (copyright claim, Community Guidelines or both) under View details and can change the sound.
- **Appeals hold the mute.** While an appeal is reviewed, "all videos that use your sound on TikTok will remain muted"; an approved appeal restores the sound on all of them; a rejected policy appeal leaves them muted with no replacement allowed; for copyright, a creator can pick a new sound, one video at a time, sometimes after approval.

Instagram's equivalent is muting on license changes: audio "can become muted as a result of any changes made to these agreements" while the reel stays viewable, and a creator "can only replace a muted track one time". Read together, these give the shape of the operation: the decision is taken once on the sound, applied to every use as a state change (muted, not deleted), reversible on appeal, and each affected creator gets a notice and a replace action on their own post. That's a background job over a list of uses that can run into the millions, which is why the use list is a table and not a search query ([How to Build It](#how-to-build-it)).

A note on muting granularity. TikTok warns that changing the music replaces "all previous background music and voices", which is what happens when a post keeps only one mixed audio track. A post that kept the creator's voice and the added sound as separate stems can lose the music and keep the talking. That's the reason to store stems at upload whenever the in-app editor produced them.

## Remix Primitives

Every platform's remix features reduce to a few shapes, whatever they're called. The book's names are by shape; the platforms' names are in the table above.

| Shape | What the child takes from the parent | Examples |
| --- | --- | --- |
| **Side by side** | The whole parent video, playing at the same time as the child, in a layout | TikTok Duet; Instagram Remix with original; Snapchat Remix; YouTube Collab |
| **Sequential clip** | A trimmed segment of the parent, played before the child's own footage | TikTok Stitch; YouTube Cut; Instagram Remix after original |
| **Background** | The parent's video as the backdrop behind the child's recording | YouTube Green Screen; Instagram Remix's default background layout |
| **Template** | The parent's sound and edit timing, with the child's own clips in the slots | Instagram Templates; YouTube Shorts templates; CapCut templates |
| **Sound only** | The parent's audio, not its picture | TikTok original sounds; Instagram original audio; YouTube Sound |

### Side by Side

TikTok's Duet "contains two videos in a split screen that play at the same time". Its September 2020 update added four layouts, "a left and right layout, react layout, top and bottom layout, and three screen layout", with the option to swap sides and drag the video; Duets credit the original creator in the caption with a link. A Duet appears only on the profile of the person who recorded it, and "that person's privacy settings will determine who can watch, comment on, download, or interact with the Duet". Instagram's Remix sets the original as the background by default and lets the remixer pick a layout; the shared remix shows "Remix with [original creator's username]", which anyone can tap to watch the original and make their own. Snapchat's 2021 test, as Snap described it to TechCrunch, let a user "build on your friend's Snap while recording your own alongside the original as it plays".

The child is a new post with a composite render, but it carries two authors' content. The render is the child's media asset; the parent's contribution is a reference to the parent's asset, its layout and its position, kept so that a takedown of the parent's material can find the child ([Takedowns Through the Graph](#takedowns-through-the-graph)).

### Sequential Clips

TikTok launched Stitch on 3 September 2020: a user selects "up to five seconds from the video" and records their own after it, and each Stitch credits the original creator in its caption with a link to the source. YouTube's Cut samples a segment of another video, and for music videos only "a 1-5 second segment", which "includes both the audio and video". Instagram's after-original mode is the same shape with tighter audio rules: the remixer "can't change the audio on the original reel or mix the audio".

The span is the fact to keep. A five-second clip from a three-minute video is a different use from the whole video, it determines whether a copyright claim on the parent touches the child, and it's what the attribution should link to (the parent at that timestamp).

### Background

YouTube's Green Screen samples another video as a background; for music videos, "as the background of your Short", with either the visual only or both audio and video. The rendering is a camera effect (segmentation of the creator from their own background, which [Camera & Effects](/books/user-generated-platforms/camera-and-effects) covers); for this chapter it's a side-by-side use with a full-frame layout, and it records the same edge.

### Templates and Audio-Sync Editing

A template reuses structure, not footage. Instagram's templates are "only available for reels that include music and at least 3 clips" and let a user "use the same music and timing as the original reel, and replace the photos or video clips with your own"; "not all reels can be used as a template". YouTube's Shorts templates provide "a framework for your Short" (length, number of clips, text, music, effects), and "eligible Shorts can be used as templates by other creators by default"; a Short may be eligible when it has remixable audio, multiple clips and text segments, "among other conditions". CapCut, ByteDance's editor, lets a creator mark placeholder slots, cut clips to the beats of the audio and "Share as Template" for review; TikTok videos made from a CapCut template show a CapCut icon above the caption that opens the template in the app.

A template is a record of slot timings against a sound, plus text and effects, and it inherits the sound's license position: a template built on a track that isn't licensed for an account type or a country can't be offered there, even though the template contains none of the original footage. Templates also cross apps (CapCut to TikTok), so the template reference on a post can point to an external catalog, which is a reason to keep it as its own record rather than as an edge to a post.

## Who May Reuse a Post

Every platform gives the author control over reuse, at two levels: an account default and a per-post override.

- **TikTok** has one "Allow reuse of content" switch per post that governs Stitch, Duet, stickers and adding the post to Stories, and an account-level audience of Everyone or Friends (followers you follow back); Stitch also offers Only you. A private account can't be Duetted or Stitched at all.
- **Instagram** sets the default from account privacy (public: anyone can remix; private: no one), lets users turn remixing off per content type (reels, feed videos, photos) and per post, and keeps original audio separate: "turning off remixing won't affect who can use your original audio".
- **YouTube** opts Shorts in to remixing by default; creators opt out per video, in bulk, or at upload under "Shorts remixing"; partners using Content Manager can restrict audio and video remixing, and opting out of remixing also opts a Short out of being a template.

Two details are easy to miss. **Turning reuse off doesn't undo past reuse.** Instagram says existing remixes "won't be affected unless you delete your video or photo"; TikTok says existing Stitches "will remain on TikTok" when the setting changes. The permission is checked at creation, so the edge records the permission that allowed it. **Download is a reuse permission too.** Instagram says remix creators "can download your content as part of their remix", and TikTok documents its video downloads setting alongside Duet and Stitch in its privacy settings.

**Minors.** The defaults for teens are where reuse permissions get strict. TikTok's teen settings, as of October 2026:

| Setting | Ages 13 to 15 | Ages 16 to 17 |
| --- | --- | --- |
| Account | Private by default | Private by default |
| Duet and Stitch of their videos | "No one can Duet with your videos and this can't be changed" (same for Stitch); they can Duet and Stitch videos by people over 16 | Off on a private account; on a public account, Friends by default, changeable to Everyone |
| Downloads | Off "and can't be changed, even if you have a public account" | Off by default; can be turned on for a public account |
| Stickers from their posts | Not allowed | Friends by default on a public account |

Instagram lets users under 18 restrict remixing by audience (everyone, people you follow, no one) with "people you follow" as the default. These are the reuse rows of the broader teen defaults in [Defaults by Age](/books/user-generated-platforms/minors-and-age-assurance#defaults-by-age), and they belong in the same `feature_age_rules` table there: reuse by strangers is how a minor's video ends up beside an adult's on someone else's profile, which is why the youngest band's setting is locked rather than defaulted. A detail worth copying from TikTok: the restriction runs in one direction, so a 13-year-old can Duet a video by someone over 16 but nobody can Duet theirs.

## Lineage

A remix graph is a set of edges from a child post to its parent, each with a shape, a clipped span, a layout and the permission in force when it was made. Instagram caps the depth at one: "you can't remix a video that's already a remix". YouTube says "you can remix content that was already remixed"; TikTok doesn't publish a depth limit. My default is to record edges at any depth but to let each shape set its own limit, because a chain of side-by-side layouts gets unwatchable after two levels while a chain of sequential clips (an answer to an answer) is the format working as intended.

### When the Parent Goes

The parent can be deleted by its author, removed by the platform, made private, have reuse turned off, or be trimmed or blurred. The platforms disagree on what that does to children:

| Event | TikTok | Instagram | YouTube Shorts |
| --- | --- | --- | --- |
| Parent deleted | Existing Stitches remain | Remixes deleted, including those shared to Facebook; restored if the post is restored within 30 days | Video remixes deleted; audio remixes muted, unlisted, deleted after 30 days |
| Parent made private | Private accounts can't be reused | Remixes deleted if the account stays private for more than 24 hours | Private videos can't be remixed |
| Reuse turned off | Existing Stitches remain | Existing remixes remain | Limiting remixing triggers the same actions as deletion |
| Author removes derivatives | "Remove all posts" removes the original and every associated Duet and Stitch; more than 10 posts may need account verification | Deleting the original deletes them | Deleting the original deletes them |

There's no single right answer, because two interests collide: the parent's author controls their own content and likeness, and the child's author made something of their own that the platform let them publish. My rule:

- **The parent's material leaves with the parent.** A child that renders the parent's footage or audio can't keep showing it once the parent's author has withdrawn it or the platform has removed it. That favors Instagram's and YouTube's behavior for side-by-side, background and clip shapes, and it's the only position that holds up when the parent was removed for a privacy or intimate-image complaint.
- **The child's own material stays the child's.** Give the child's author a grace period and a re-publish path (YouTube's 30 days, after which the creator can "upload your video again with different audio", is the model), keep their views and stats, and keep their own footage.
- **Reuse turned off is prospective.** It blocks new edges and leaves existing ones, as TikTok and Instagram do; YouTube instead treats limiting remixing like deletion.
- **Template and sound-only children aren't affected by the parent post's deletion,** because they don't contain the parent's footage; they follow the sound's state instead.
- **A grace period needs a clock,** stored on the edge, so restoration within the parent's own restore window (Instagram's 30 days) reattaches the children.

### Takedowns Through the Graph

A takedown of the parent is a takedown of the parent's material, and the parent's material is also inside its children. A copyright notice that names a parent video doesn't name its 400 Duets, but the platform knows them, and leaving them up with the same footage is a copy it now knows about. Platforms aren't obliged to search for other copies under 512(m) ([Notices](/books/user-generated-platforms/copyright#notices)), but the graph isn't a search; it's a list the platform keeps.

Propagation rules I'd use:

- **Copyright on the parent's footage or audio:** each child whose clipped span overlaps the noticed material gets the same action on the parent's part (remove the composite, or mute the parent's audio), with its own notice to the child's author and its own counter-notice path, because the child's author is a separate user with separate rights.
- **Policy removal of the parent:** children are reviewed, not removed, since a Stitch that responds to a harmful video is often commentary on it; the edge puts each child in the queue with the parent's decision attached.
- **Privacy, likeness and intimate-image removals:** children are removed with the parent, without waiting for review, and their renders are swept like any other copy ([Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse#how-to-build-it)).
- **Sound removal:** follows the sound's uses, not the edges ([Renaming and Removing a Sound](#renaming-and-removing-a-sound)).

### Attribution Display

Every platform links the child to the parent in the post itself: TikTok's Duet and Stitch caption credit, Instagram's "Remix with" label, YouTube's link in the Shorts player and on the Sound Library page. TikTok's separate Mention feature lets a creator credit up to three videos that inspired a post without reusing them, and the credited creator is notified. Show the link only while the parent is visible to the viewer: a child whose parent is private, blocked in the viewer's country or blocked by the viewer shows "original unavailable" rather than leaking the parent's existence or its author's handle.

## Music Licensing

Music is why sounds exist and why they're hard. A song in a short video involves at least two sets of rights: the **recording** (the master, owned by a label or the artist through a distributor) and the **composition** (the song as written, owned by its publishers on behalf of its songwriters). A short-form platform needs both for every track in its library, in every country where it's offered, for every way the track can be used.

### Two Libraries

Platforms split music by use. TikTok says that a business account "cannot use music on TikTok that's not licensed for commercial use", and points businesses at its Commercial Music Library, which it describes as "more than 600,000 tracks pre-cleared for royalty-free use in branded content and ads", filterable by region; songs in its general library "are not pre-cleared for commercial content" and "are not available for use by any brand or business". Instagram says its licensed library "is intended for personal, non-commercial use", that "certain business accounts and certain types of posts do not have access to the library", that licensed music "may also not be available in certain countries or regions", and that those accounts can use Meta's Sound Collection, "over 14,000 songs and sounds which are entirely royalty free" and usable in ads.

What that means for the model:

- **The account's kind is a licensing input.** Personal, creator and business accounts see different libraries, and switching an account to business can make sounds already saved, and arguably already used, unavailable. The kind at the moment of publish is recorded on the use.
- **The post's kind is a licensing input.** An ad, a branded post and a paid partnership are commercial uses even from a creator account.
- **The viewer's country is a licensing input,** for playback as well as for creation.
- **"Original sound" is not a license.** A business account that uses another user's original sound has no clearance from the platform's catalog deals; the match step that re-attributes a sound to a catalog track also tells the platform whether a business may use it.

### Recordings and Compositions

The deals behind the libraries are with three kinds of licensor:

- **Major labels and their publishers,** directly. Universal Music Group's contract with TikTok was set to expire on 31 January 2024, and its publishing arm's license on 1 March 2024.
- **Collectives for independents.** Merlin, which describes itself as "the digital licensing hub for the world's independent music sector" with members accounting for "over 15%" of the global recorded music market, signed a multi-territory deal with TikTok on 23 January 2020 covering every market where TikTok operates.
- **Publisher frameworks.** The NMPA announced a deal with TikTok on 23 July 2020 that accounted for "TikTok's past use of musical works", let eligible members opt in, and applied retroactively to 1 May 2020. It expired on 30 April 2024; the NMPA said it was "not engaging in an extension", told members TikTok "should not be using your musical works" without a license and offered its attorneys for enforcement, while TikTok said it had "direct deals in place with thousands of music publishers". Triller signed a similar opt-in deal with the NMPA in March 2021, after a year of public criticism from it and a month after UMG pulled its catalog from Triller.

The consequence for the data is that a song's availability is a conjunction. A track is usable only if its recording is licensed and every publisher holding a share of its composition is licensed, for that territory, account kind and surface. A song co-written by four writers at three publishers is unavailable if one of those publishers has no deal. That's exactly how the 2024 dispute widened.

### When a Deal Lapses

UMG's open letter set out its case: the contract "expires January 31, 2024"; it was pressing on "appropriate compensation", "protecting human artists from the harmful effects of AI" and "online safety"; TikTok accounted for "only about 1% of our total revenue"; and it accused TikTok of "selectively removing the music of certain of our developing artists". TikTok, as AP reported on 2 February 2024, called the position "sad and disappointing". The takedown of UMG music began at the start of February, after the contract expired. On 27 February TikTok began removing music owned by Universal Music Publishing Group, ahead of that license's expiry on 1 March, which, as Music Business Worldwide reported via Mixmag, meant removing songs "written, co-written, owned and/or distributed by UMG or UMPG" and muting the videos that contained them. On 2 May 2024 the two announced a new agreement promising "improved remuneration", "industry-leading protections with respect to generative AI", work "to remove unauthorized AI-generated music from the platform" and "tools to improve artist and songwriter attribution", with music returning "in due course"; on 22 May 2026 they renewed it as a multi-year global deal, again with AI protections and attribution improvements.

What a lapse looks like from inside the system:

- **It's scheduled.** The expiry date is in the contract; the platform knows weeks ahead which sounds depend on the deal, how many uses each has, and which territories are affected. The mute should be a planned batch with a dry run, not a scramble.
- **It's partial.** A lapse removes the sounds that depend on one licensor; songs with a share held by that licensor go with them, which is far more than its own catalog suggests.
- **It's reversible.** Muting, not deleting, is what let the catalog come back when the deal was signed. The uses keep their sound references in a muted state, and unmuting on a new deal is the same batch run backward.
- **The creator sees a reason and a choice:** the sound is unavailable because of a licensing change, the post stays up, and they can replace the audio.

### How the License Shapes the Product

License terms show up as product limits, and the help pages are where to read them:

- **Duration.** TikTok leaves "sounds that are not available for long videos" out of a user's favorite sound list when they upload a long video and suggests setting the length to 15 or 60 seconds. YouTube lets a Short use "up to 90 seconds" of a music video's audio, and says some are limited to 30 seconds "depending on partner agreements"; a Short "longer than one minute" with "an active claim" is globally blocked.
- **Which segments.** YouTube's Cut allows only "a 1-5 second segment" of a music video.
- **Attribution.** Instagram's licensed audio "must be attributed or linked to the artist and include the name of the track".
- **Surfaces.** A license for short videos isn't a license for live streams or recordings of them ([Music in Streams](/books/user-generated-platforms/copyright#music-in-streams)), nor for ads.
- **Promotion and commerce.** UMG's 2024 deal names e-commerce and promotion alongside remuneration, so a licensor's catalog can carry permissions for a shopping surface that another's doesn't.

Lyrics are a separate display surface of the composition. I treat lyric display as its own surface in a license scope, off unless a deal grants it, rather than assuming the music license covers showing the words.

The general rule I take from this: **every feature that touches music checks a scope, not a flag.** The scope is (sound, territory, account kind, surface, duration, time), and it's answered by the deals behind the sound's rights, at creation and again at playback.

### Matching Music in Uploads

Uploads with music the user brought in from outside (a song playing in the room, a track added in another editor) go through the fingerprinting service in [Fingerprinting and Content ID](/books/user-generated-platforms/copyright#fingerprinting-and-content-id). For a short-form platform the match has a third outcome beyond claim and block: **attach.** A match against a track in the platform's licensed library can turn an unlicensed original sound into a licensed use of the catalog track, attributed and added to the song's page, as Instagram describes. YouTube notes that a Short with copyright-protected content made outside its tools "may get a Content ID claim or be removed due to a copyright removal request". The decision order I use: attach where the library license covers the account kind, territory and surface; mute the matched stem where it doesn't; block only where the rights holder's policy says so; and in the EU route anything short of a manifest match to review under [Article 17](/books/user-generated-platforms/copyright#article-17).

## Voiceover and Synthetic Voices

Voiceover is the other common audio layer: Instagram lets a remixer "add voiceovers to your remix" and mix the audio, and every short-form editor offers recorded narration and text-to-speech. A recorded voiceover is the creator's own audio and can become an original sound like any other. A synthetic voice is different: it's someone's voice, licensed or not, rendered on demand by the platform.

The best-known case is one filed by a voice actor, Beverly Standing, against ByteDance in the Southern District of New York on 5 May 2021 (7:21-cv-04033). As MusicTech reported, her central complaint was that TikTok's text-to-speech voice was hers, built from recordings she had made for a text-to-speech project translating Chinese text, and used to say whatever users typed, including "foul and offensive language"; TikTok changed the voice about two weeks after the suit, never confirmed it was hers, and settled in September 2021; her lawyer said the details would not be disclosed and that TikTok would license her voice. The court dismissed the case on 29 September 2021 with leave to reopen if the settlement wasn't consummated, and the parties filed a stipulation of voluntary dismissal with prejudice on 29 October 2021.

What a platform needs from that:

- **Every synthetic voice is a licensed asset** with a talent agreement, a consent scope (which features, which languages, whether user-typed text is allowed), territories, and a retirement date; the voice catalog is a table, not a model checkpoint.
- **Each use records the voice,** so retiring a voice can find and re-render or mute the posts that used it, the same cascade as a sound removal.
- **Voice cloning of real people is a likeness problem as well as a license one,** and the AI labeling and provenance duties in [Labeling AI-Generated Content](/books/user-generated-platforms/ai-on-user-generated-platforms#labeling-ai-generated-content) apply to synthetic audio as much as to images.

## Trends and Charts

A sound spreads by reuse. One post's audio gets used by a few creators, their posts get distributed, viewers tap through to the sound page, and the page becomes a feed in its own right; each new use is a creation event on the sound, and the count of creations, by how many distinct creators, over what window, is what makes a sound a trend. That's a different signal from a post's views: a video can be watched a million times and reused by nobody, and a sound can be used by a hundred thousand creators whose posts each get a few hundred views.

### Sound-Level Signals

The signals I'd compute per sound, per territory, per day:

- **Creations,** distinct posts using the sound, and **distinct creators,** because one account posting fifty times isn't a trend.
- **Velocity,** creations in the latest window against the prior one, which is what separates a rising sound from a large one.
- **Views and engagement on uses,** summed, for reach.
- **Sound page visits and "use this sound" taps,** the funnel from watching to making.
- **Off-platform saves,** such as Add to Music App taps, which are the signal labels care about most.

Two cautions. Creation counts are cheap to fake with networks of accounts, so they go through the same inauthentic-behavior filtering as votes and follows ([Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#how-to-build-it)) before they feed a chart or a ranking. And how these signals feed the For You ranking is [Interest-Graph Feeds](/books/user-generated-platforms/interest-graph-feeds)' subject; this chapter only defines them.

### Charts

The public chart products are built on these signals. The TikTok Billboard Top 50, launched in September 2023 as the "first official chart in the U.S. to monitor music discovery and engagement on TikTok", is based on "creations, video views, and user engagement" and published weekly on Thursdays; its weighting isn't published. A chart is a contract with a third party about definitions: which uses count (originals matched to the song, or only library uses), which territory, which window and which filtering, and it should be computed from the same recorded events as the platform's own trend surfaces, with the definition versioned like any metric ([Operating Metrics](/books/user-generated-platforms/operating-metrics#how-to-build-it)).

### Paying Artists

Sounds generate money for musicians in two ways. **Through licensors:** the platform pays labels, publishers and collectives under their deals, and they pay artists and songwriters; the terms aren't public (UMG's and TikTok's 2024 and 2026 deals disclosed none). **Through distribution:** TikTok launched SoundOn on 9 March 2022, a distributor for independent artists that, as TechCrunch reported, paid 100% of royalties on ByteDance's own platforms (TikTok, Resso, CapCut) with no time limit and 100% from other services in the first year, falling to 90% from the second, with artists keeping their masters and getting promotional support. A platform that distributes music has both sides of the trade: it licenses the artist's track into its library and pays the artist for its use, so the sound's rights rows point at the platform's own distribution contract.

## How to Build It

The chapter adds seven tables to the core model in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model): sounds and their revisions, the deals and rights behind them, the uses that tie sounds to posts, the remix edges between posts, reuse permissions, templates and synthetic voices. A sound's audio is a `media_assets` row of kind 'audio'; a catalog sound's fingerprint is a `rights_references` row from [Copyright at Scale](/books/user-generated-platforms/copyright#how-to-build-it); a post's stems are `media_tracks` from [Video on Demand](/books/user-generated-platforms/video-on-demand#how-to-build-it); teen defaults are `feature_age_rules` rows from [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#how-to-build-it).

```sql
CREATE TABLE sounds (                    -- reusable audio with an identity and a page
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                   TEXT NOT NULL CHECK (kind IN ('original', 'catalog_track',
                           'library_track')),  -- library: royalty-free, commercial-safe
  audio_asset_id         UUID NOT NULL REFERENCES media_assets (id),  -- kind = 'audio'
  origin_content_item_id UUID REFERENCES content_items (id),  -- the post it came from
  owner_account_id       UUID REFERENCES accounts (id),       -- the originator
  rights_reference_id    UUID REFERENCES rights_references (id),  -- catalog fingerprint
  isrc                   TEXT,             -- the recording's code, for catalog tracks
  title                  TEXT NOT NULL,    -- current; history in sound_revisions
  artist_display         TEXT,
  merged_into_sound_id   UUID REFERENCES sounds (id),  -- an original matched to a track
  state                  TEXT NOT NULL CHECK (state IN ('active', 'restricted', 'muted',
                           'removed')),
  removal_reason         TEXT CHECK (removal_reason IN ('originator', 'copyright',
                           'policy', 'license_lapse')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at             TIMESTAMPTZ,
  CHECK ((kind = 'original') = (origin_content_item_id IS NOT NULL)),
  CHECK (kind <> 'catalog_track' OR isrc IS NOT NULL),
  CHECK (merged_into_sound_id IS NULL OR kind = 'original'),
  CHECK ((state = 'removed') = (removed_at IS NOT NULL))
);

CREATE TABLE sound_revisions (           -- renames and re-attributions, never overwrites
  sound_id         UUID NOT NULL REFERENCES sounds (id),
  revision         INT NOT NULL,
  title            TEXT NOT NULL,
  artist_display   TEXT,
  attributed_to    TEXT NOT NULL CHECK (attributed_to IN ('originator', 'catalog',
                     'library')),
  changed_by       TEXT NOT NULL CHECK (changed_by IN ('originator', 'matcher', 'staff',
                     'licensor')),
  reason           TEXT,                 -- 'rename', 'matched', 'match_disputed', ...
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (sound_id, revision)
);

CREATE TABLE music_deals (               -- one licensor agreement and its scope
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  licensor         TEXT NOT NULL,        -- a label, publisher, collective or distributor
  licensor_kind    TEXT NOT NULL CHECK (licensor_kind IN ('label', 'publisher',
                     'collective', 'publisher_framework', 'distributor', 'library')),
  side             TEXT NOT NULL CHECK (side IN ('recording', 'composition', 'both')),
  territories      CHAR(2)[],            -- null: everywhere the platform operates
  account_kinds    TEXT[] NOT NULL,      -- 'personal', 'creator', 'business'
  surfaces         TEXT[] NOT NULL,      -- 'short', 'long_video', 'story', 'live',
                                         -- 'ad', 'template', 'remix', 'lyrics'
  max_clip_ms      INT,                  -- longest excerpt allowed; null: no cap
  on_lapse         TEXT NOT NULL DEFAULT 'mute' CHECK (on_lapse IN ('mute',
                     'keep_existing')),
  effective        TSTZRANGE NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('draft', 'active', 'lapsed',
                     'terminated')),
  contract_ref     TEXT NOT NULL
);

CREATE TABLE sound_rights (              -- who must license a sound before it plays
  sound_id         UUID NOT NULL REFERENCES sounds (id),
  side             TEXT NOT NULL CHECK (side IN ('recording', 'composition')),
  holder           TEXT NOT NULL,        -- the label or the publisher with a share
  share_bps        INT CHECK (share_bps BETWEEN 1 AND 10000),  -- composition splits
  music_deal_id    UUID REFERENCES music_deals (id),  -- null: no deal, not playable
  PRIMARY KEY (sound_id, side, holder)
);

CREATE TABLE sound_uses (                -- one sound (or voice) in one post
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  content_item_id  UUID NOT NULL REFERENCES content_items (id),
  sound_id         UUID REFERENCES sounds (id),
  synthetic_voice_id UUID,               -- synthetic_voices; text-to-speech uses
  track_id         UUID REFERENCES media_tracks (id),  -- the stem, if kept separate
  sound_span_ms    INT8RANGE,            -- which part of the sound
  item_span_ms     INT8RANGE,            -- where in the post it plays
  source           TEXT NOT NULL CHECK (source IN ('picker', 'extracted', 'remix',
                     'template', 'matched', 'tts')),
  account_kind     TEXT NOT NULL,        -- the author's kind at publish
  surface          TEXT NOT NULL,        -- 'short', 'ad', 'story', ...
  license_check    JSONB,                -- deals, territories and caps checked at publish
  state            TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'muted',
                     'replaced', 'removed')),
  muted_reason     TEXT CHECK (muted_reason IN ('sound_removed', 'copyright', 'policy',
                     'license_lapse', 'voice_retired', 'parent_gone')),
  muted_at         TIMESTAMPTZ,
  replaced_by_id   UUID REFERENCES sound_uses (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((sound_id IS NULL) <> (synthetic_voice_id IS NULL)),
  CHECK ((source = 'tts') = (synthetic_voice_id IS NOT NULL)),
  CHECK ((state = 'muted') = (muted_at IS NOT NULL))
);

CREATE INDEX sound_uses_by_sound ON sound_uses (sound_id, created_at) WHERE state = 'active';

CREATE TABLE remix_edges (               -- a child post built on a parent post
  child_content_item_id  UUID NOT NULL REFERENCES content_items (id),
  parent_content_item_id UUID NOT NULL REFERENCES content_items (id),
  parent_media_asset_id  UUID NOT NULL REFERENCES media_assets (id),  -- what was used
  shape            TEXT NOT NULL CHECK (shape IN ('side_by_side', 'sequential_clip',
                     'background', 'template', 'collab')),
  product_name     TEXT NOT NULL,        -- what the app called it: 'duet', 'stitch', ...
  parent_span_ms   INT8RANGE,            -- the clipped range; null: the whole video
  layout           TEXT,                 -- 'left_right', 'top_bottom', 'react', ...
  depth            SMALLINT NOT NULL DEFAULT 1 CHECK (depth >= 1),
  permission_at_create TEXT NOT NULL,    -- the audience that allowed it
  on_parent_gone   TEXT NOT NULL CHECK (on_parent_gone IN ('keep', 'remove',
                     'mute_then_remove')),
  state            TEXT NOT NULL DEFAULT 'attached' CHECK (state IN ('attached',
                     'parent_gone', 'reattached', 'removed')),
  parent_gone_at   TIMESTAMPTZ,
  grace_until      TIMESTAMPTZ,          -- re-publish or restore before this
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (child_content_item_id, parent_content_item_id),
  CHECK (child_content_item_id <> parent_content_item_id),
  CHECK (state <> 'parent_gone' OR parent_gone_at IS NOT NULL)
);

CREATE INDEX remix_edges_by_parent ON remix_edges (parent_content_item_id)
  WHERE state = 'attached';

CREATE TABLE reuse_permissions (         -- who may build on an account's posts, or one post
  account_id       UUID NOT NULL REFERENCES accounts (id),
  content_item_id  UUID REFERENCES content_items (id),  -- null: the account default
  capability       TEXT NOT NULL CHECK (capability IN ('side_by_side', 'sequential_clip',
                     'background', 'template', 'sound', 'download', 'sticker')),
  audience         TEXT NOT NULL CHECK (audience IN ('everyone', 'followers', 'mutuals',
                     'none')),
  set_by           TEXT NOT NULL CHECK (set_by IN ('user', 'age_rule', 'guardian',
                     'platform')),
  feature_age_rule_id UUID REFERENCES feature_age_rules (id),  -- when an age rule set it
  locked           BOOLEAN NOT NULL DEFAULT FALSE,  -- the user can't change it
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (account_id, content_item_id, capability),
  CHECK (set_by <> 'age_rule' OR feature_age_rule_id IS NOT NULL)
);

CREATE TABLE edit_templates (            -- slot timings against a sound, reusable
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  source_content_item_id UUID REFERENCES content_items (id),  -- null: from another app
  external_ref     TEXT,                 -- the editor app's template id
  sound_id         UUID NOT NULL REFERENCES sounds (id),
  slots            JSONB NOT NULL,       -- [{start_ms, end_ms, kind, text}, ...]
  state            TEXT NOT NULL CHECK (state IN ('active', 'withdrawn')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((source_content_item_id IS NULL) <> (external_ref IS NULL))
);

CREATE TABLE synthetic_voices (          -- text-to-speech and voice effects, licensed
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  name             TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('tts', 'voice_effect')),
  talent_agreement_ref TEXT,             -- null only for fully synthetic voices
  consent_scope    TEXT[] NOT NULL,      -- 'user_text', 'captions', 'ads', languages
  territories      CHAR(2)[],
  effective        TSTZRANGE NOT NULL,
  retired_at       TIMESTAMPTZ
);
```

Whether a sound can be used, or played, in a context is one query over its rights and deals; an original sound with no rights rows is the originator's own and passes:

```sql
-- Can sound $1 be used in country $2 by an account of kind $3 on surface $4, now?
SELECT s.id
FROM sounds s
WHERE s.id = $1
  AND s.state = 'active'
  AND s.merged_into_sound_id IS NULL
  AND NOT EXISTS (                       -- every holder of every side needs a deal
    SELECT 1 FROM sound_rights r
    WHERE r.sound_id = s.id
      AND NOT EXISTS (
        SELECT 1 FROM music_deals d
        WHERE d.id = r.music_deal_id
          AND d.status = 'active'
          AND d.effective @> NOW()
          AND (d.territories IS NULL OR $2 = ANY (d.territories))
          AND $3 = ANY (d.account_kinds)
          AND $4 = ANY (d.surfaces)));
```

The sound page is the uses, filtered for the viewer, with the originator first:

```sql
-- Sound page for a viewer in country $2: newest public uses, originating post pinned
SELECT ci.id, ci.author_account_id, ci.published_at,
       (ci.id = s.origin_content_item_id) AS is_origin
FROM sounds s
JOIN sound_uses u    ON u.sound_id = s.id AND u.state = 'active'
JOIN content_items ci ON ci.id = u.content_item_id
WHERE s.id = $1
  AND ci.state = 'published'
  AND ci.visibility = 'public'
  AND NOT EXISTS (SELECT 1 FROM geo_restrictions g   -- Regulators & Enforcement
                  WHERE g.scope = 'content_item' AND g.subject_id = ci.id
                    AND g.country = $2 AND g.valid_during @> NOW())
  AND NOT EXISTS (SELECT 1 FROM blocks b             -- Feeds & Recommendations
                  WHERE b.kind = 'block' AND b.blocker_account_id = $3
                    AND b.blocked_account_id = ci.author_account_id)
ORDER BY is_origin DESC, ci.published_at DESC
LIMIT 50;
```

Removing a sound, or losing a deal, is a mute over its uses:

```sql
-- A deal lapsed: mute every active use of every sound that depended on it
WITH lapsed AS (
  UPDATE music_deals SET status = 'lapsed'
  WHERE id = $1 AND status = 'active' AND on_lapse = 'mute'
  RETURNING id
)
UPDATE sound_uses u
SET state = 'muted', muted_reason = 'license_lapse', muted_at = NOW()
FROM sound_rights r, lapsed
WHERE r.music_deal_id = lapsed.id
  AND u.sound_id = r.sound_id
  AND u.state = 'active'
RETURNING u.id, u.content_item_id;
```

And the parent going is a pass over its edges:

```sql
-- Parent $1 deleted, removed or made private: detach children, set grace by policy
UPDATE remix_edges e
SET state = 'parent_gone',
    parent_gone_at = NOW(),
    grace_until = CASE e.on_parent_gone WHEN 'mute_then_remove'
                    THEN NOW() + INTERVAL '30 days' END
WHERE e.parent_content_item_id = $1
  AND e.state IN ('attached', 'reattached')
RETURNING e.child_content_item_id, e.shape, e.on_parent_gone, e.parent_span_ms;
```

Trending is a query over uses, not a counter:

```sql
-- Rising sounds in a country: distinct creators this week against last week
SELECT u.sound_id,
       count(DISTINCT ci.author_account_id) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days') AS creators_7d,
       count(DISTINCT ci.author_account_id) FILTER (WHERE u.created_at <  NOW() - INTERVAL '7 days') AS creators_prev_7d
FROM sound_uses u
JOIN content_items ci ON ci.id = u.content_item_id
JOIN accounts a       ON a.id = ci.author_account_id
WHERE u.created_at >= NOW() - INTERVAL '14 days'
  AND u.state = 'active'
  AND a.home_country = $1
  AND NOT a.automated                    -- Spam, Bots & Inauthentic Behavior
  AND NOT EXISTS (SELECT 1 FROM cluster_members m
                  WHERE m.subject_type = 'account' AND m.subject_id = a.id
                    AND m.removed_at IS NULL)
GROUP BY u.sound_id
HAVING count(DISTINCT ci.author_account_id) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days') >= 50
ORDER BY creators_7d::numeric / GREATEST(creators_prev_7d, 1) DESC
LIMIT 100;
```

Notes on the sketch:

- **Sounds are rows, uses are rows.** The use list is what every cascade walks, so it's indexed by sound and kept with a state per use; muting a sound with two million uses is a batched background job ([Background Jobs](/docs/architecture/background-jobs#job-design)) that updates uses in chunks and notifies authors, and the sound's own `state` flips first so no new uses are created meanwhile.
- **Matching merges, it doesn't rewrite.** When the matcher ties an original to a catalog track, the original gets `merged_into_sound_id`, a `sound_revisions` row records the re-attribution, and its uses resolve to the catalog sound for display, page and license checks; a successful dispute clears the merge and adds a revision back.
- **Rights are a conjunction.** `sound_rights` holds one row per recording owner and per composition share; a missing or lapsed deal on any row makes the sound unplayable in that scope. Where other deals still cover other territories, the mute is territorial and is enforced at delivery like any geographic restriction ([Withdrawing From a Country](/books/user-generated-platforms/storage-and-delivery#withdrawing-from-a-country)).
- **Check at publish, recheck at play.** `license_check` on the use records what was checked when the post was made (deals, territory, account kind, surface, clip length); playback reruns the scope query, cached per sound and territory and invalidated by `music_deal.*` events.
- **Edges record the permission and the policy.** `permission_at_create` keeps the audience that allowed the reuse, so later changes are visibly prospective; `on_parent_gone` is set from the shape and the platform's rules at creation (rules as data with versions, [Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)), so the cascade doesn't depend on today's code.
- **Spans make takedowns precise.** A copyright decision on the parent's media at a span reaches the children whose `parent_span_ms` overlaps it (`&&`), and each child gets its own case and notice ([The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#how-to-build-it)).
- **Reuse permissions resolve per request:** the post's row, else the account's default, else the platform default for the author's age band from `feature_age_rules`, with locked rows for the bands where the law or the platform forbids a change.
- **Platform names stay out of the schema.** `shape` is the book's vocabulary and `product_name` keeps the app's label for display and support; renaming a feature doesn't migrate data.
- **Events:** `sound.created`, `sound.matched`, `sound.renamed`, `sound.removed`, `sound.restored`, `sound_use.muted`, `music_deal.activated`, `music_deal.lapsed`, `remix.created`, `remix.parent_gone`, `remix.removed` and `synthetic_voice.retired` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to notifications, the sound page cache, search, trend counts and licensor usage reports.

## Auditing

- **The license position at publish,** per use: which deals were checked, for which territory, account kind and surface, and what the scope query returned, so a licensor's complaint about a use can be answered with what the platform knew then ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Every deal's life:** effective dates, scope changes, lapse and renewal, and the batch runs that muted and unmuted uses, with counts per territory.
- **Every sound's attribution history:** renames, matches, merges, disputes and who made each change.
- **Every cascade:** for a sound removal, a deal lapse, a voice retirement or a parent's removal, the trigger, the rule version, the uses or edges affected, the notices sent and the restores.
- **Every reuse permission change,** with who set it (user, guardian, age rule, platform), because a minor's video reused against a locked rule is a compliance failure that needs a trail.
- **Chart and trend inputs:** the events and filters behind each published chart week, so a disputed position can be recomputed.

## What This Means for the System You Build

- **Make the sound a first-class object** with its own audio asset, attribution history, page and use list, separate from any video's audio track.
- **Keep stems apart at upload** whenever the editor produced them, so a music mute leaves the creator's voice.
- **Match every extracted sound** against the catalog before it gets a page, and re-attribute by merge, with a dispute path.
- **Model remixes as edges by shape** with the clipped span, layout, permission at creation and a parent-gone policy, and keep the platform's feature names out of the schema.
- **Let the parent's material leave with the parent,** give the child's author a grace period and a re-publish path, and make reuse-off prospective.
- **Propagate takedowns through the graph** by span overlap, with a separate notice and appeal for each child's author.
- **Answer music availability as a scope** (sound, territory, account kind, surface, length, time) from the deals behind every recording owner and every composition share, at publish and at playback.
- **Plan for deals to lapse:** mute, don't delete, in a rehearsed batch, so a renewed deal can restore everything.
- **License synthetic voices like talent,** record every use, and be able to retire a voice.
- **Count trends in distinct creators and velocity,** filtered for inauthentic accounts, and version every chart definition.

## References

**Platforms: TikTok**

- [TikTok Support: Duets](https://www.tiktok.com/support/faq_detail?id=7636670084584512021), side-by-side split screen, Everyone or Friends, Duet only on the recorder's profile, the recorder's settings govern the Duet, deleting associated Duets
- [TikTok Support: Stitch](https://www.tiktok.com/support/faq_detail?id=7612493022214822420), Everyone, Friends or Only you, existing Stitches remain after settings change or deletion, the Stitch on the recorder's profile
- [TikTok Support: Stitch privacy settings](https://www.tiktok.com/support/faq_detail?id=7636676986101864980), the Allow reuse of content switch covering Duet, stickers and Stories, Remove all posts removing the original and associated Duets and Stitches, verification above 10 posts
- [TikTok Support: Teen privacy and safety settings](https://www.tiktok.com/support/faq_detail?id=7611839632052853259), private by default, Duet, Stitch, downloads and stickers by age band, Duet and Stitch of videos by people over 16
- [TikTok Support: Sounds](https://www.tiktok.com/support/faq_detail?id=7581821548110125580), business accounts and commercial music, sounds unavailable for long videos, replacing music replaces voices
- [TikTok Support: Remove original sounds](https://www.tiktok.com/support/faq_detail?id=7543604775011637816), removal from every video that uses the sound, notifications to creators
- [TikTok Support: A sound I added to TikTok was removed](https://www.tiktok.com/support/faq_detail?id=7636670084748122644), muting of every video using a removed sound, appeals, muted during review, restore on approval, per-video replacement
- [TikTok Support: A sound was removed from my video](https://www.tiktok.com/support/faq_detail?id=7636670084748155412), reasons shown under View details, no notification to non-originators, Change sound
- [TikTok Support: Credit a video](https://www.tiktok.com/support/faq_detail?id=7581820703155001912), mentions of up to three videos, notification of credited creators
- [TikTok Newsroom: Feature highlight, new layouts for Duet](https://newsroom.tiktok.com/feature-highlight-new-layouts-for-duet?lang=en), four layouts, side swapping, caption credit with a link (30 September 2020)
- [TikTok Newsroom: New on TikTok, introducing Stitch](https://newsroom.tiktok.com/new-on-tiktok-introducing-stitch?lang=en), up to five seconds, caption credit with a link, account and per-upload controls (3 September 2020)
- [TikTok for Business: Explore royalty-free music in our Commercial Music Library](https://ads.tiktok.com/business/en-US/blog/audio-library-royalty-free-music), more than 600,000 pre-cleared tracks, region filter, general library not cleared for brands
- [TikTok Newsroom: Universal Music Group and TikTok announce new licensing agreement](https://newsroom.tiktok.com/universal-music-group-and-tiktok-announce-new-licensing-agreement/?lang=en), remuneration, generative AI protections, removal of unauthorized AI music, attribution tools, e-commerce (2 May 2024)

**Platforms: others**

- [Instagram Help: Who can create a remix of your reels, videos, and photos](https://help.instagram.com/792438641600810), defaults by account privacy, per-type and per-post controls, original audio unaffected, under-18 audiences, deletion and the 24-hour private rule, 30-day restore
- [Instagram Help: Remix a video on Instagram](https://help.instagram.com/iphone-app/139004934231412), background by default, layouts, Remix with label, no remix of a remix, with-original and after-original audio rules, downloads
- [Instagram Help: What audio you can use in your reel](https://help.instagram.com/329208821595430), original audio definition, Meta AI toggle, re-attribution to artist and song, audio pages, Remove From Audio Page, licensed audio attribution, muting on changes to rights holder agreements
- [Instagram Help: Replace muted audio on your Instagram reel](https://help.instagram.com/825171856327681), muting from changes to rights holder agreements, one replacement
- [Instagram Help: Access to the licensed music library](https://help.instagram.com/402084904469945), personal non-commercial use, business accounts and post types restricted, regional availability, Sound Collection of more than 14,000 royalty-free tracks
- [Instagram Help: Use a template to create an Instagram reel](https://help.instagram.com/android-app/610485296790527), music and at least three clips, same music and timing, not all reels can be templates
- [YouTube Help: Create YouTube Shorts with remixed content](https://support.google.com/youtube/answer/10623810?hl=en), Sound, Green Screen, Cut and Collab, Green Screen and Cut for music videos, 90 and 30 second audio limits, 1 to 5 second music video segments, private videos unavailable, remixing a remix, opt-in default and Studio opt-out, attribution, consequences of deleting or limiting the original, re-upload with different audio, Content ID claims on Shorts made elsewhere, blocking of claimed Shorts over one minute
- [YouTube Help: Get started with Shorts templates](https://support.google.com/youtube/answer/16738000?hl=en), template framework, eligibility conditions including remixable audio, eligible by default, opt-out through Shorts remixing
- [Snap Creators: Snap Sounds and Music](https://creators.snapchat.com/learn-be-creative-snap-sounds-and-music), the Sounds tool for licensed clips, TV and film excerpts and original audio
- [CapCut: How to make a CapCut template](https://www.capcut.com/resource/how-to-make-a-capcut-template), placeholder slots, beat-synced cuts, Share as Template and review, the CapCut icon on TikTok videos

**Labels, publishers and collectives**

- [Universal Music Group: An open letter to the artist and songwriter community](https://www.universalmusic.com/an-open-letter-to-the-artist-and-songwriter-community-why-we-must-call-time-out-on-tiktok/), the 31 January 2024 expiry, the three issues, about 1% of revenue, selective removal of developing artists
- [Music Business Worldwide: Universal Music Group and TikTok strike new multi-year licensing deal](https://www.musicbusinessworldwide.com/universal-music-group-and-tiktok-strike-new-multi-year-licensing-deal/), the 22 May 2026 renewal, AI protections, attribution, commerce
- [NMPA: NMPA and TikTok announce global multi-year partnership agreement](https://www.nmpa.org/?p=1237), past use, opt-in for members, retroactive to 1 May 2020 (23 July 2020)
- [Music Business Worldwide: The NMPA's TikTok deal has officially ended](https://www.musicbusinessworldwide.com/the-nmpas-tiktok-deal-has-officially-ended-what-does-that-mean-for-independent-publishers-in-the-us), the 30 April 2024 expiry, the NMPA memo and enforcement offer, TikTok's direct deals statement (1 May 2024)
- [WIN: Merlin and TikTok agree to a landmark global music licensing partnership](https://winformusic.org/merlin-and-tiktok-agree-to-a-landmark-global-music-licensing-partnership), Merlin's description and market share, multi-territory scope (23 January 2020)

**Courts**

- [Standing v. Bytedance E-Commerce, Inc., No. 7:21-cv-04033 (S.D.N.Y.)](https://www.courtlistener.com/docket/59884390/standing-v-bytedance-e-commerce-inc/), filed 5 May 2021, settlement letter, order of dismissal of 29 September 2021, stipulation of voluntary dismissal with prejudice of 29 October 2021

**In practice**

- [Mixmag: TikTok begins removing music from UMG amid licensing dispute](https://mixmag.net/read/tiktok-umg-licensing-debate-continues-february-2024-news), UMPG removals from 27 February 2024, the 1 March expiry, songs written, co-written, owned or distributed, muted videos (1 March 2024)
- [TheGrio (AP): Songs by Taylor Swift, Drake and more are starting to disappear from TikTok](https://thegrio.com/2024/02/02/songs-by-taylor-swift-drake-and-more-are-starting-to-disappear-from-tiktok-heres-why/), TikTok's "sad and disappointing" response, UMG's revenue share, the takedown after the 31 January expiry (2 February 2024)
- [Tubefilter: After licensing skirmish, Triller inks deal with NMPA](https://www.tubefilter.com/2021/03/25/triller-licensing-agreement-national-music-publishers-association/), the opt-in deal and UMG's February 2021 withdrawal (25 March 2021)
- [TechCrunch: Snapchat is developing its own take on TikTok Duets with a new Remix feature](https://techcrunch.com/2021/03/25/snapchat-is-developing-its-own-take-on-tiktok-duets-with-a-new-remix-feature/), the 2021 test, formats, Snap's statement, the permission toggle reported by Alessandro Paluzzi (25 March 2021)
- [TechCrunch: TikTok launches a music distribution platform, SoundOn](https://techcrunch.com/2022/03/09/tiktok-launches-a-music-distribution-platform-soundon/), royalty terms on ByteDance and other services, masters kept, marketing support (9 March 2022)
- [TechCrunch: TikTok's newest feature lets you save favorite songs directly to Spotify or Amazon Music](https://techcrunch.com/2023/11/14/tiktoks-newest-feature-lets-you-save-favorite-songs-directly-to-spotify-or-amazon-music), Add Song on videos and the sound detail page, services and markets (14 November 2023)
- [FOX 13: TikTok and Billboard team up to launch new Top 50 songs chart](https://www.fox13news.com/news/tiktok-billboard-top-50-songs-chart), creations, views and engagement, weekly on Thursdays (15 September 2023)
- [MusicTech: TikTok reaches settlement with text-to-speech voice actress](https://musictech.com/news/industry/tiktok-reaches-settlement-voice-without-permission-for-text-to-speech), the complaint's focus, the original recordings, the voice change two weeks later, undisclosed settlement details and the voice license (30 September 2021)

**Reference**

- [Copyright at Scale](/books/user-generated-platforms/copyright), fingerprinting, claims, notices and Article 17
- [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance), `feature_age_rules` and teen defaults
