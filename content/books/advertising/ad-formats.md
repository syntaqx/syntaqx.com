+++
title = "Ad Formats & Standards"
nav_title = "Ad Formats"
description = "The IAB New Ad Portfolio, fixed and flex sizes, OpenRTB Native 1.2, rich media and MRAID, interstitial rules, CTV formats and the LEAN load limits."
category = "Advertising Industry"
order = 2910
part = "Ad Serving and Creative"
tags = ["advertising", "ad-tech", "ad-formats", "native-ads", "ctv", "data-model"]
+++

An ad format is the contract between the slot and the ad: what shape the space is, what the ad may contain, how heavy it may be, what it may do on its own and what only after a tap, and how the buyer is told all of that in a bid request. A 300x250 medium rectangle, a 6:1 flexible banner, an in-feed native unit assembled from a headline and an image, a full-screen interstitial between two levels of a game, an expanding rich media unit in an app and a pause ad on a television are all formats, and each is defined three times: by a standard (IAB Tech Lab's New Ad Portfolio, OpenRTB Native, MRAID, the CTV Ad Portfolio), by the platform selling it (Google Ad Manager's sizes, Meta's placements, Google Ads' responsive display specs) and by the rules that limit where it may appear (the Better Ads Standards, Google's interstitial policies).

It is harder than a list of sizes because the three definitions disagree and drift. The IAB moved from fixed pixel sizes to aspect ratios in 2017, but the fixed sizes still carry most of the money, so every publisher supports both. Native ads are not a size at all but a set of parts the publisher renders, so a "creative" is a bundle of assets that must satisfy per-asset limits. Interstitials are a format whose rules are mostly about timing (when it may show, how often), not shape. And CTV added non-linear formats (pause, overlay, menu) that ride on the video and native objects in ways the display world never needed. A system that stores a format as a string like `"300x250"` cannot answer the questions that matter: will this creative fit this slot, is it light enough, does the slot allow it to expand, and which OpenRTB fields describe it.

This chapter covers the IAB New Ad Portfolio (aspect ratios, flex ranges, the fixed sizes still in use, and the LEAN load limits), how platforms define their formats, native ads under OpenRTB Native 1.2, rich media and MRAID, interstitials and the rules that bind them, video and CTV formats at the format level, and the records that turn formats into data. It extends `creatives` and `ad_units` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). VAST itself (versions, wrappers, tracking events, SIMID) belongs to [VAST & Video Ads](/books/advertising/vast-and-video-ads) in the Channels part, and this chapter mentions it only where a format depends on it; in-app SDK rendering belongs to [In-App Advertising & Mediation](/books/advertising/in-app-advertising); how a format is placed on a page, iframed and lazy-loaded is the next chapter, [Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering); and how creatives are built, checked and assembled dynamically is [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco). Ads on user content and their moderation are the User-Generated Platforms volume's [Moderating the Ads](/books/user-generated-platforms/ads-and-data-licensing#moderating-the-ads).

## How the Platforms Do It

As of November 2026, from each platform's help center and developer documentation:

| Platform | Display formats | Native | Interstitials and full screen | Video and CTV |
| --- | --- | --- | --- | --- |
| **AdMob** | App formats through the SDK ([In-App Advertising & Mediation](/books/advertising/in-app-advertising)) | Rendered by the app's code | Interstitials only at "logical breaks"; "no more than one interstitial ad after every two user actions"; none on app load or exit | In-App Advertising & Mediation |
| **Google Ad Manager** | 5 "top-performing" sizes (728x90, 336x280, 300x250, 300x50, 160x600), 21 other supported sizes and 10 regional sizes; fixed, multi-size and responsive slots in GPT | Native styles designed by the publisher; `"fluid"` is a GPT size, and "Native ads are currently the only fluid ad type supported" | Web interstitials through GPT with a default cap of "1 impression per 10 minutes" and fixed triggers; anchor, side rail and rewarded out-of-page formats | Through VAST ([VAST & Video Ads](/books/advertising/vast-and-video-ads)) |
| **Google Ads** | Responsive display ads: the advertiser uploads assets and Google assembles the ad per slot | The same uploaded assets fill native slots | Assembled from the assets | VAST & Video Ads |
| **Meta** | Placements, not sizes: Facebook Feed images at 4:5, 1440x1800 recommended, up to 30MB, headline 27 characters | Every placement is native to the app | Stories and Reels full screen at 9:16 | Reels video 9:16 at 1440x2560, from 0 seconds to 15 minutes, up to 4GB, with safe zones |

Three patterns run through the table. The open web sells **slots with sizes** (Ad Manager's list, the IAB portfolio); walled gardens sell **placements with aspect ratios** and assemble the ad from parts (Meta, responsive display); and everyone treats **interstitials as a timing rule**, not a size. A system that serves the open web and also accepts assets for assembled ads needs both models.

## The IAB New Ad Portfolio

The IAB Tech Lab's New Ad Portfolio, released in 2017, is "based on aspect ratio and size range rather than fixed pixel sizes" and "replaces all the previous creative display guidelines for mobile and desktop," including the Universal Ad Package and the old rich media units. It has two halves: flexible size ads defined by aspect ratio, and a short list of fixed sizes kept because they still carry most revenue. Both share one set of load limits and one set of experience rules, LEAN.

### Flexible sizes

A flex ad is defined by its aspect ratio and a size range in density-independent pixels (dp), and is expected to keep its ratio while scaling to the container. The specification groups them as horizontal (landscape banners that span the content width), vertical (portrait units at the page edges), tiles (squares and near-squares in grids) and full page (device-shaped units for interstitials and expanded rich media). A few rows from the flexible size specification:

| Aspect ratio | Size range (dp) | Transition from | Initial load (kB) | Subload (kB) |
| --- | --- | --- | --- | --- |
| 1:1 | 300x300 to 450x450 | 300x250 medium rectangle | 150 | 300 |
| 1:2 | 300x600 to 450x900 | 300x600 half page | 200 | 400 |
| 4:1 | 900x225 to 1800x450 | 970x250 billboard | 250 | 500 |
| 6:1 | 300x50 to 450x75 | 300x50 and 320x50 smartphone banners | 50 | 100 |
| 9:16 | 300x540 to 450x800 (large) | none | 200 | 400 |

The "transition" column names the old fixed size closest to each flex unit, for publishers moving inventory across. Full page units are given as several ratios (9:16, 10:16, 2:3, 3:4 portrait; 16:9, 16:10, 3:2, 4:3 landscape) because devices are not exact ratios, and the specification borrows print's safe zone, trim line and bleed zone so the critical message survives cropping or letterboxing. The IAB Tech Lab's page examples add smartphone units at 2:3, tablet units at 5:3 and 4:3, and mobile adhesion banners at 3:1, 4:1 and 6:1.

OpenRTB carries flex sizes natively. The 2.6 `Format` object has `w` and `h` for a fixed size, or `wratio`, `hratio` and `wmin` ("the minimum width ... at which the ad will be displayed [when] the size is expressed as a ratio") for a flex one, and a bid's `wratio` and `hratio` are "Required for Flex Ads." A slot that accepts a 6:1 flex ad no smaller than 300dp wide sends `{"wratio": 6, "hratio": 1, "wmin": 300}` in `imp.banner.format`.

### Fixed sizes still in use

The portfolio's fixed sizes were chosen from an IAB attitudes-and-usage study of which units "contribute to the majority of revenue":

| Unit | Size (px) | Initial load (kB) | Subload (kB) |
| --- | --- | --- | --- |
| Billboard | 970x250 | 250 | 500 |
| Smartphone banner | 300x50 or 320x50 | 50 | 100 |
| Leaderboard | 728x90 | 150 | 300 |
| Super leaderboard or pushdown | 970x90 | 200 | 400 |
| Portrait | 300x1050 | 250 | 500 |
| Skyscraper | 160x600 | 150 | 300 |
| Medium rectangle | 300x250 | 150 | 300 |
| Financial (20x60) | 120x60 | 50 | 100 |
| Mobile phone interstitial | 640x1136, 750x1334 or 1080x1920 | 300 | 600 |

Feature phone banners (120x20, 168x28, 216x36) at 5 kB complete the list. Platforms list more: Ad Manager lists the 336x280 large rectangle among its five top-performing sizes, and the 300x600 "half page," 320x100, 468x60 and 88x31 among its 21 "other supported" sizes, plus regional sizes such as 980x120 and 750x300. The practical rule is that a slot advertises every size it can physically hold, because each size it drops is demand it cannot receive; GPT's own guidance is that "the more sizes you specify when defining a slot, the more ads that will be eligible to serve to it."

### Load limits

Every ad in the portfolio is "a LEAN ad," and the load rules are the part engineers enforce:

- **Initial load** is every file the ad needs for its first visual display, requested before the host page's `load` event; **subload** is what it fetches after that event without user action; **user-initiated load** after a tap or click is unlimited. Subload "must not start prior to" the page's load event, or the ad iframe's own load event when the ad cannot see the host page.
- **Weights are gzipped** and include every file the ad loads, including shared libraries unless the publisher or ad server exempts them; exempt shared libraries are allowed "a combined maximum of 50 kB" of initial load. Ad server and measurement or verification files "must not be counted against ad K-weight."
- **No more than 10 file requests** during initial load.
- **CPU:** "30% CPU load max (based on the average CPU of the user base) per active ad," animation stops using CPU once it ends, and animation scripts should not run when the ad is out of view.
- **Slow connections:** on 3G (1.5 Mbps) or slower, file weights "should be 30% less than recommended."
- **Interest-based advertising controls** (the AdChoices icon) are included in ads that use behavioral targeting, at 5 kB at most; audio is muted until the user turns it on.

For sizes outside the portfolio, the specification gives a sizing grid by pixel count at 2x density: a 728x90 counts as 728 x 90 x 4 = 262,080 pixels, which falls in the 180,000 to 300,000 pixel band with 100 kB initial and 200 kB subload (the fixed-size table gives the leaderboard itself 150 and 300). The IAB Tech Lab's advertiser guide adds that the subload is triggered when the page reaches "readystate = complete," that a creative that cannot see that event may wait for an `IAB_HOST_LOADED` message for at most 4 seconds, and that the subload must be "only started once per advertising medium." These limits are guidance, not enforcement; the browser enforces its own, and Chrome's Heavy Ad Intervention unloads an ad that uses more than 4 MB of network without user interaction ([Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering) covers the thresholds and the reports).

### LEAN

The portfolio page describes LEAN as "lightweight, encrypted, AdChoices supported, and non-invasive advertising" (the Tech Lab's LEAN post spells the letters "Light, Encryption, Allowing Choice, Non-invasive ads"), and the flexible size specification sets three principles: Respect ("A consumer's primary objective is consuming publisher content"), Control and Choice. The IAB Tech Lab reads each letter onto another standard: Light is the portfolio's load criteria; Encrypted is HTTPS; AdChoices is the DAA's icon in the US and the TCF in Europe; Non-invasive "requires compliance with the Better Ads Standards for ad experiences and page ad density." It also says lightweight ads are "one of the areas where we have not observed the required level of adoption," which is why the browser-side limits exist. Encrypted has a protocol field: OpenRTB's `imp.secure` set to 1 means the impression "requires secure HTTPS URL creative assets and markup," and a creative with any `http://` asset is ineligible for it.

## Native Ads

A native ad is "element-based": Google Ad Manager describes native as ads "styled by the publisher instead of the advertiser," where the advertiser supplies parts (a headline, an image, a logo, a call to action, a sponsor name) and the publisher's template or app code renders them to match the surrounding content. That inverts the display model. The slot doesn't have a size the creative must fit; the creative has assets that must satisfy the slot's template.

### OpenRTB Native 1.2

The IAB Tech Lab's Dynamic Native Ads API, OpenRTB Native, is at version 1.2 ("has been finalized"; 1.0 was released February 2015 and 1.1 March 2016, with the 1.2 changes logged in March 2017). The native request travels inside an OpenRTB 2.6 bid request as an opaque string in `imp.native.request`, with `imp.native.ver` naming the version. The request object describes the context and the assets:

- **Context:** `context` (content-centric, social or product), `contextsubtype`, `plcmttype` (in feed, atomic unit, outside the content, recommendation widget), `plcmtcnt` (how many identical placements in the unit) and `seq`.
- **Assets:** an array, each with an `id`, a `required` flag and exactly one of `title`, `img`, `video` or `data`. A title has a required `len`, "Recommended to be 25, 90, or 140." An image has a `type` (1 icon, 3 main) and either an exact `w`/`h` or `wmin`/`hmin`. A data asset has a `type`: 1 sponsored, 2 desc, 3 rating, 4 likes, 5 downloads, 6 price, 7 salesprice, 8 phone, 9 address, 10 desc2, 11 displayurl, 12 ctatext.
- **Tracking:** `eventtrackers` lists the events and methods the publisher supports: event types 1 impression, 2 viewable-mrc50, 3 viewable-mrc100, 4 viewable-video50; methods 1 image pixel and 2 JavaScript.
- **Privacy:** `privacy` set to 1 "when the native ad supports buyer-specific privacy notice," so the buyer can return its own privacy link.

The specification's recommended asset minimums are the ones a template should accept: an icon at least 50 high at 1:1; a main image in small (at least 200 high, widths of 200, 267 or 382) or large (at least 627 high, widths of 627, 836 or 1198) variants at 1:1, 4:3 or 1.91:1; a sponsored name of 25 characters or longer; a description of 140 or longer; a call to action of 15 or longer.

A request for an in-feed unit with a required headline and main image (a sponsor name and call to action would be two more assets, each a data object with `type` 1 or 12 and a `len`):

```json
{
  "ver": "1.2",
  "context": 1,
  "plcmttype": 1,
  "plcmtcnt": 1,
  "assets": [
    { "id": 1, "required": 1, "title": { "len": 90 } },
    { "id": 2, "required": 1, "img": { "type": 3, "wmin": 627, "hmin": 627 } }
  ],
  "eventtrackers": [
    { "event": 1, "methods": [1] },
    { "event": 2, "methods": [1, 2] }
  ],
  "privacy": 1
}
```

The response returns `assets` keyed by the same `id`s, a required `link` with the click URL and click trackers, and `eventtrackers` with the buyer's tracking URLs; the older `imptrackers` and `jstracker` fields are to be deprecated in favor of `eventtrackers`. The response may instead give an `assetsurl` to fetch the assets from. The bid itself declares `mtype` 4 (native) in OpenRTB 2.6.

The engineering consequence is that native validation is per asset and per slot: a response missing a required asset, a headline longer than the slot's `len`, or an image smaller than `wmin` must be rejected before render, and the rejection recorded, because the template will otherwise truncate a sponsor's name or crop a product out of the image. Ad Manager lists ad attribution and the AdChoices icon among a native ad's elements, with the attribution rendered in the app's own code and AdChoices "added automatically by the SDK in the corner you specify."

### Native on the platforms

Ad Manager sells native through native styles, a publisher-built template per format, and GPT renders native in `"fluid"` slots that take the container's width and grow to fit the creative (which causes layout shift, and is why GPT advises fluid slots only below the fold). Google Ads' responsive display ads are the buyer-side mirror: the advertiser uploads several images, logos, headlines and descriptions, and Google builds the ad each slot shows from them. Meta has no "native" format because every placement renders inside its own app; its formats are placements with an aspect ratio and text limits.

## Rich Media and MRAID

Rich media is any ad that does more than display: expands, plays video inside a banner, responds to gestures, uses device features. On the web, an expanding ad is a cross-origin iframe asking the page for more room, which SafeFrame standardizes and [the next chapter](/books/advertising/ad-tags-and-rendering#iframes-and-safeframe) covers. In apps, the standard is MRAID, "the common API (Application Programming Interface) for mobile rich media ads," which since 2011 has let an ad running inside an SDK's web view ask the container to expand, resize, close and query device state.

MRAID 3.0 is the current version, "backwards compatible to all versions of MRAID," so a 3.0 creative degrades in an older container. It standardizes the close control for expanded ads and interstitials, includes viewability and audibility measurement, and folds in "select VPAID events" so video in a rich media ad reports like video elsewhere. The IAB's LEAN guidance points at MRAID 3.0 as the standard that "standardizes consumer management of ad via close controls." The OpenRTB side is the API framework list: `imp.banner.api` lists the frameworks the slot supports (MRAID versions, OMID for Open Measurement), and the bid's `apis` field says which ones the creative needs; a creative requiring MRAID 3.0 is ineligible for a slot that supports only MRAID 2.0, and an OM SDK-dependent verification script is pointless in a slot that does not declare OMID. Which SDKs implement which versions belongs to [In-App Advertising & Mediation](/books/advertising/in-app-advertising).

## Interstitials and Their Rules

An interstitial covers the screen. It is the highest-paying display format in apps and the one most constrained by rules, because the user didn't ask for it. Three sets of rules apply, and they agree on the substance: not on entry or exit, not mid-task, not repeatedly, always closable.

**The Better Ads Standards.** The Coalition for Better Ads, from research with "more than 150,000 consumers," lists the experiences that fall below its threshold. Desktop web: pop-up ads, auto-playing video with sound, prestitial ads with countdown, large sticky ads, ad density higher than 50%, and ad density higher than 30% combined with a sticky video ad. Mobile web: pop-up ads, prestitial ads, ad density higher than 30%, flashing animated ads, auto-playing video with sound, postitial ads with countdown, full-screen scrollover ads, large sticky ads, sticky pop-out video ads, and a sticky video ad with a large inline ad. Short-form video: long pre-roll ads that can't be skipped, mid-roll ads and large display ads. Mobile apps: interruptive interstitials, interruptive video interstitials, non-skippable video interruptive interstitials and video interstitials when opening an app. Chrome enforces the web standards: it removes all ads from a site "failing" the Ad Experience Report for more than 30 days ([Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering) covers the enforcement).

**Google's platform rules.** AdMob places interstitials only "at logical breaks in between your app's content (e.g. pages, stages, or levels)," never on app load or exit, never unexpectedly "when a user is focused on a task at hand," and "no more than one interstitial ad after every two user actions," including Back, and never immediately after another interstitial closes. Ad Manager's web interstitials, served through GPT's `INTERSTITIAL` out-of-page format, have a default frequency cap of "1 impression per 10 minutes" (configurable down to one per minute) and show only on defined triggers: a link click, returning to a hidden tab (opt-in), clicking the browser's navigation bar on desktop (opt-in), reaching the end of the article and scrolling back or waiting 5 seconds on mobile or 10 on desktop, 30 seconds of inactivity followed by an interaction, or a "Continue" button on blurred content. Links that are not HTTP or HTTPS or that open a new window don't trigger one, and the browser's back button closes it. For search, Google's guidance to sites is "Don't obscure the entire page with interstitials," with legally mandatory interstitials such as an age gate exempt.

**Acceptable Ads**, the program that ad blockers whitelist against (Ad Tags, Rendering & Page Performance), lists "Expanding ads," "Interstitial page ads" and "Overlay ads" among the types that "cannot be considered for inclusion on the allowlist."

The protocol flag is `imp.instl` in OpenRTB ("1 = the ad is interstitial or full screen"), with `imp.rwdd` for a rewarded impression. A system that sells interstitials enforces the timing rules where the ad is triggered (the page script or the app), not in the ad server, and records the trigger with the request, because the policy question after a complaint is when it fired, not what size it was.

## Video and CTV Formats

Video formats are defined by where the ad plays relative to content, and the protocol carries that in `imp.video.plcmt` (which replaced the older `placement` field in OpenRTB 2.6-202303). The delivery format is VAST, now at 4.3 (December 2022) with a 2024 CTV addendum for the Ad Creative ID Framework and DSA icons; VPAID is "Deprecated, replaced with SIMID." The markup, wrappers, tracking events and SIMID are [VAST & Video Ads](/books/advertising/vast-and-video-ads); pods, SSAI and competitive separation are [Server-Side Ad Insertion & Ad Pods](/books/advertising/server-side-ad-insertion). At the format level, the change since 2025 is that CTV acquired formats that are not a commercial in a break.

**The CTV Ad Portfolio.** IAB Tech Lab announced the portfolio on December 11, 2025 with six core formats, "Pause, Menu, Screensaver, In Scene, Squeezebacks, and Overlays," built from more than 100 submissions to its Ad Format Hero initiative, with Pause and Menu prioritized for OpenRTB support. After public comment rounds that closed January 31 and July 16, 2026, the Ad Format Guidelines for Digital Video and CTV were final on July 22, 2026; the CTV Ad Portfolio Signaling Guidance, whose comment period closed June 5, 2026, is final too (the Tech Lab page prints its date as "July 222, 2026", most likely July 22). The definitions:

- **Pause:** starts when the viewer pauses content with the remote.
- **Screensaver:** like pause, but initiated by the operating system or app after inactivity.
- **Menu:** inside the TV or streaming platform's interface (home screen, content navigation), not during playback.
- **In Scene:** branded elements composited into the content, with standardization focused on out-of-home style insertions rather than product placement.
- **Overlay:** a non-linear ad over program content outside breaks, in lower-third or bottom-right variants, interactive by remote or QR code.
- **Squeezeback:** the content shrinks to share the screen with the ad (L-shape, frame or double box), so none of it is covered.

**Signaling.** Five of the six are video-object formats delivered as VAST NonLinear ads, and the signaling guidance adds AdCOM values to the existing fields rather than new objects: `plcmt` 5 Pause, 6 Screensaver, 7 Overlay, 8 Squeezeback, 9 In-scene; `pos` 7 fullscreen or 8 partial screen for pause and screensaver (other values for overlay and squeezeback positions); and `playbackmethod` 8 and 9 for pause with sound on and off, 10 and 11 for screensaver. Creative attributes say how much the ad moves: 21 static visual, 22 limited motion (cinemagraph), 23 full-motion video, so a publisher that wants a still pause ad blocks 22 and 23 in `battr`. VAST's `NonLinearAds` now carries `<MediaFiles>` (a change that lands in the VAST 4.4 draft, still without a publication date, per [VAST & Video Ads](/books/advertising/vast-and-video-ads)), so a non-linear ad can be an image, a cinemagraph or a video file rather than only a static resource, with interactive ones as SIMID `InteractiveCreativeFile`s. Menu ads go through the native object instead, because the platform renders them: `plcmttype` 1 (tile) or 3 (headline banner) on a device with `devicetype` 3, with image or video assets returned as `img.url` or `video.vasttag`.

A pause ad request for a still image, adapted from the guidance's cinemagraph example (which sends `"mimes": ["video/mp4"]` and blocks only attribute 23):

```json
{
  "imp": [{
    "id": "1",
    "video": {
      "mimes": ["image/jpeg", "image/png"],
      "plcmt": 5,
      "pos": 7,
      "playbackmethod": [9],
      "battr": [22, 23]
    }
  }]
}
```

For a format catalog, the lesson of the CTV portfolio is that a format is a combination of protocol values (`mtype`, `plcmt`, `pos`, `playbackmethod`, allowed attributes), not a name, and that the same "pause ad" from two exchanges is only the same format if those values match.

## How Platforms Define Formats

Each platform's specification is what an advertiser actually builds to, and each is a different shape of the same record.

**Google Ad Manager** defines formats as sizes on ad units and creatives, plus out-of-page formats that GPT manages itself: `TOP_ANCHOR`, `BOTTOM_ANCHOR`, `LEFT_SIDE_RAIL`, `RIGHT_SIDE_RAIL`, `INTERSTITIAL`, `REWARDED`, `GAME_MANUAL_INTERSTITIAL` and `AD_INTENTS` in GPT's `OutOfPageFormat` enumeration. A GPT slot is fixed-size (one size: "only creatives with size `300x250` will be served"), multi-size (a list, including `"fluid"`) or responsive (a size mapping from viewport to sizes). Interstitial sizes run from 1920x1080 down to 180x150, and "Ads served programmatically can be a range of sizes depending on the size of the viewport." Some mobile web slots "expand automatically to the maximum width allowed on a device" for backfill.

**Google Ads responsive display ads** are a set of assets with per-type limits: images at 1.91:1 (1200x628 recommended, 600x314 minimum), 1:1 (1200x1200, minimum 300x300) and 9:16 (900x1600, minimum 600x1067), up to 15 images, each at most 5120 KB; logos at 4:1 (1200x300, minimum 512x128) and 1:1 (1200x1200, minimum 128x128); 1 to 5 headlines of 30 characters or fewer, one long headline of up to 90 characters, and 1 to 5 descriptions, with Google's best-practice guide giving descriptions an 80-character limit. Google notes Display campaigns are moving to Demand Gen, with a voluntary migration starting June 2026.

**Meta** defines formats as placements with aspect ratios, resolutions and text limits. A Facebook Feed image ad is JPG or PNG at 4:5, 1440x1800 recommended, at least 600 wide, up to 30MB, with a 3% aspect ratio tolerance, primary text of 50-150 characters and a 27-character headline. An Instagram Reels video is 9:16 at 1440x2560, 0 seconds to 15 minutes, up to 4GB, with "at least 14% of the top, 35% of the bottom, and 6% on each side" kept free of text, logos and key visuals so the interface doesn't cover them.

Two rules follow for anyone building a platform. First, a placement spec is not only a size: it is a ratio with a tolerance, a resolution, a file cap, text limits and a safe zone, and the validation must check all of them. Second, my rule is to check safe zones and text limits as hard failures, because a creative can be the right size and still put its logo under the like button.

## How to Build It

Formats become a catalog that ad units declare and creatives conform to. The core's `ad_units.formats` and `ad_units.sizes` arrays stay as what the tag sends; the catalog says what each format means, and a join table says which formats a unit accepts:

```sql
CREATE TABLE ad_formats (                -- a format: a standard's, a platform's or this system's own
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  code                  TEXT NOT NULL UNIQUE,  -- 'nap_medium_rectangle', 'nap_flex_6x1', 'native_in_feed', 'ctv_pause'
  name                  TEXT NOT NULL,
  family                TEXT NOT NULL CHECK (family IN ('display', 'native', 'video', 'audio',
                          'rich_media', 'ctv_nonlinear', 'text', 'dooh')),
  source                TEXT NOT NULL,   -- 'iab_nap_2017', 'openrtb_native_1.2', 'iab_ctv_2026', 'platform:<key>', 'self'
  width                 INT CHECK (width > 0),       -- fixed size, CSS pixels / dp
  height                INT CHECK (height > 0),
  aspect_w              SMALLINT CHECK (aspect_w > 0),  -- flex: OpenRTB wratio
  aspect_h              SMALLINT CHECK (aspect_h > 0),  -- flex: OpenRTB hratio
  aspect_tolerance_bp   INT NOT NULL DEFAULT 0,      -- basis points; 300 = Meta's 3%
  min_width             INT,             -- flex range; OpenRTB wmin
  min_height            INT,
  max_width             INT,
  max_height            INT,
  initial_load_max_kb   INT,             -- gzipped, LEAN initial load
  subload_max_kb        INT,             -- gzipped, host-initiated subload
  initial_requests_max  SMALLINT,        -- 10 under the portfolio
  file_max_bytes        BIGINT,          -- per uploaded asset, for assembled formats
  interstitial          BOOLEAN NOT NULL DEFAULT FALSE,  -- OpenRTB imp.instl
  openrtb_mtype         SMALLINT CHECK (openrtb_mtype IN (1, 2, 3, 4)),  -- banner, video, audio, native
  openrtb_plcmt         SMALLINT,        -- video plcmt, e.g. 5 pause; native plcmttype for native
  openrtb_pos           SMALLINT[] NOT NULL DEFAULT '{}',
  allowed_attrs         SMALLINT[],      -- AdCOM creative attributes allowed; null: any not blocked
  api_frameworks        SMALLINT[] NOT NULL DEFAULT '{}',  -- AdCOM API frameworks required by the slot side
  safe_zone             JSONB,           -- e.g. {"top_pct": 14, "bottom_pct": 35, "side_pct": 6}
  text_limits           JSONB NOT NULL DEFAULT '{}',  -- e.g. {"headline": 27, "primary_text": 150}
  status                TEXT NOT NULL CHECK (status IN ('active', 'legacy', 'retired')),
  CHECK ((width IS NULL) = (height IS NULL)),
  CHECK ((aspect_w IS NULL) = (aspect_h IS NULL)),
  CHECK (family IN ('video', 'audio', 'native', 'text') OR width IS NOT NULL OR aspect_w IS NOT NULL)
);

CREATE TABLE native_asset_specs (        -- one asset slot in a native format's template
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_format_id     UUID NOT NULL REFERENCES ad_formats (id),
  asset_key        TEXT NOT NULL,        -- 'headline', 'main_image', 'icon', 'sponsor', 'cta'
  request_asset_id INT NOT NULL,         -- the assets[].id sent in the native request
  kind             TEXT NOT NULL CHECK (kind IN ('title', 'img', 'video', 'data')),
  type_code        SMALLINT,             -- img type (1 icon, 3 main) or data type (1 sponsored, 2 desc, 12 ctatext)
  required         BOOLEAN NOT NULL DEFAULT FALSE,
  max_len          INT CHECK (max_len > 0),        -- title and data, in characters
  min_width        INT,                  -- img: wmin
  min_height       INT,                  -- img: hmin
  aspect_ratios    TEXT[] NOT NULL DEFAULT '{}',   -- e.g. {'1:1','1.91:1'}
  mimes            TEXT[] NOT NULL DEFAULT '{}',
  CHECK (kind <> 'title' OR max_len IS NOT NULL),
  CHECK ((kind IN ('img', 'data')) = (type_code IS NOT NULL)),
  UNIQUE (ad_format_id, request_asset_id),
  UNIQUE (ad_format_id, asset_key)
);

CREATE TABLE ad_unit_formats (           -- which formats a slot accepts
  ad_unit_id    UUID NOT NULL REFERENCES ad_units (id),
  ad_format_id  UUID NOT NULL REFERENCES ad_formats (id),
  api_frameworks SMALLINT[] NOT NULL DEFAULT '{}',  -- what this slot's container supports: MRAID versions, OMID
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (ad_unit_id, ad_format_id)
);

ALTER TABLE creatives ADD COLUMN ad_format_id UUID;
ALTER TABLE creatives ADD CONSTRAINT creatives_ad_format_fk
  FOREIGN KEY (ad_format_id) REFERENCES ad_formats (id) NOT VALID;
ALTER TABLE creatives ADD COLUMN aspect_w SMALLINT, ADD COLUMN aspect_h SMALLINT;  -- flex creatives
ALTER TABLE creatives ADD COLUMN initial_load_bytes INT,     -- measured, gzipped
                      ADD COLUMN subload_bytes INT,
                      ADD COLUMN initial_requests SMALLINT;
ALTER TABLE creatives ADD COLUMN attrs SMALLINT[] NOT NULL DEFAULT '{}',  -- AdCOM creative attributes
                      ADD COLUMN api_frameworks SMALLINT[] NOT NULL DEFAULT '{}',  -- what it needs
                      ADD COLUMN secure BOOLEAN;              -- every asset HTTPS, as last scanned
ALTER TABLE creatives ADD CONSTRAINT creatives_format_required_check
  CHECK (ad_format_id IS NOT NULL OR review_status = 'pending') NOT VALID;

CREATE INDEX CONCURRENTLY creatives_ad_format_idx ON creatives (ad_format_id);
CREATE INDEX CONCURRENTLY ad_unit_formats_format_idx ON ad_unit_formats (ad_format_id);
```

Eligibility of a creative for a slot is then a query, not a string match. A creative fits a unit when the unit accepts its format, the slot supports every API framework the creative needs, and its measured weight is within the format's limits:

```sql
SELECT c.id
FROM creatives c
JOIN ad_formats f      ON f.id = c.ad_format_id AND f.status <> 'retired'
JOIN ad_unit_formats u ON u.ad_format_id = f.id AND u.ad_unit_id = $1 AND u.active
WHERE c.review_status IN ('approved', 'limited')
  AND c.api_frameworks <@ u.api_frameworks               -- slot supports what the creative needs
  AND (f.initial_load_max_kb IS NULL OR c.initial_load_bytes <= f.initial_load_max_kb * 1024)
  AND (f.subload_max_kb IS NULL OR c.subload_bytes <= f.subload_max_kb * 1024)
  AND (f.initial_requests_max IS NULL OR c.initial_requests <= f.initial_requests_max)
  AND (NOT $2::boolean OR c.secure);                     -- $2: imp.secure on this request
```

Design notes:

- **A format is a row, not a string.** `"300x250"` in `ad_units.sizes` is what GPT sends; `ad_formats` is what it means (weights, interstitial or not, protocol values). The same pixel size can be two formats (an in-page medium rectangle and a 300x250 interstitial), and one flex format accepts many pixel sizes.
- **Standards, platforms and house formats share the table.** `source` says whose definition a row is, so the IAB's 6:1 banner, Meta's Feed image and a publisher's own sponsored-tile format sit side by side, and a platform spec that changes becomes a new row with the old one marked `legacy`, so past creatives keep the definition they were built to.
- **Measure weight, never trust a declared one.** `initial_load_bytes`, `subload_bytes` and `initial_requests` come from loading the creative in a test harness and counting gzipped bytes before and after the load event, the way the portfolio defines them; ad server and verification files are excluded, as the specification says. [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco) owns that check.
- **Native formats are templates with asset slots.** `native_asset_specs` is the template; the request's asset IDs, lengths and minimum sizes are generated from it, so the request and the validator can never disagree. A response is validated against the same rows before render.
- **Protocol values live with the format.** `openrtb_mtype`, `openrtb_plcmt`, `openrtb_pos` and `allowed_attrs` let the request builder emit the right fields for a CTV pause ad or a flex banner, and let a bid's declared `mtype`, `attr` and `wratio`/`hratio` be checked against what was asked for.
- **API frameworks are both sides.** The slot's container declares what it supports (`ad_unit_formats.api_frameworks`), the creative declares what it needs (`creatives.api_frameworks`); eligibility is containment. This is how an MRAID 3.0 creative stays off an MRAID 2.0 container.
- **Interstitial rules are enforced where the trigger fires,** in the page or app, with the trigger recorded on the request; `ad_formats.interstitial` only says the format is one.
- **The `NOT VALID` format check** lets old creatives without a format keep serving while new and re-reviewed ones must have one; after a backfill maps each old creative to a format, validate it ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations#lock-aware-ddl)).

## What This Means for the System You Build

- **Model formats as a catalog** with sizes or ratios, ranges, load limits, protocol values and text limits, and point creatives and ad units at it.
- **Support fixed and flex sizes together:** declare every fixed size a slot can hold, and send `wratio`/`hratio`/`wmin` for flex demand.
- **Measure creative weight and requests** against the LEAN initial load, subload and 10-request limits, and reject before the browser intervenes.
- **Treat native as a template:** generate the Native 1.2 request from the template's asset specs and validate responses against the same specs.
- **Match API frameworks both ways,** so rich media and measurement scripts only serve where the container supports them.
- **Enforce interstitial timing where it triggers** and record the trigger, following the Better Ads Standards and the platform rules: never on entry or exit, never mid-task, capped and closable.
- **Describe CTV formats by their protocol values** (`plcmt`, `pos`, `playbackmethod`, creative attributes), not by name, and route menu ads through native.
- **Keep platform specs versioned,** because a placement's ratio, safe zone or text limit changes and old creatives were built to the old one.

## References

**Specifications**

- [IAB Tech Lab: IAB New Ad Portfolio](https://iabtechlab.com/standards/iab-new-ad-portfolio/), aspect ratio and size range instead of fixed sizes, replacement of earlier guidelines, LEAN, aspect ratio examples and linked specifications
- [IAB: New Ad Portfolio Fixed Size Ad Specifications](https://www.iab.com/wp-content/uploads/2019/04/IABNewAdPortfolio_LW_FixedSizeSpec.pdf), the fixed sizes and their initial and subload weights, the 10-request, 30% CPU, 50 kB shared library and 3G rules, the pixel-count sizing grid, and initial load versus subload definitions
- [IAB: New Ad Portfolio Flexible Size Ad Specifications](https://www.iab.com/wp-content/uploads/2019/04/IABNewAdPortfolio_LW_FlexSizeSpec.pdf), the LEAN principles and "a LEAN ad", subload not starting before the load event, flex aspect ratios, size ranges in dp, transition sizes, ad type groups, full page ratios and safe, trim and bleed zones
- [IAB Tech Lab: Building light weight and load optimized ad creatives](https://iabtechlab.com/blog/building-light-weight-and-load-optimized-ad-creatives/), subload on readystate complete, the IAB_HOST_LOADED message and 4-second wait, and one subload per advertising medium
- [IAB Tech Lab: What does it mean to be LEAN?](https://iabtechlab.com/blog/what-does-it-mean-to-be-lean/), each LEAN letter mapped to standards, low adoption of lightweight ads, and MRAID 3.0 close controls
- [IAB Tech Lab: OpenRTB Native](https://iabtechlab.com/standards/openrtb-native/), version 1.2 final and the 1.0 and 1.1 release dates
- [IAB Tech Lab: OpenRTB Dynamic Native Ads API 1.2](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/Native-Ads/main/OpenRTB-Native-Ads-Specification-Final-1.2.md), request and response objects, asset types, data types, recommended lengths and image sizes, event trackers and the privacy flag
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the Format object's wratio, hratio and wmin, banner and native objects, imp.instl, imp.rwdd, imp.secure, video plcmt, and the bid's mtype, wratio and hratio
- [IAB Tech Lab: MRAID](https://iabtechlab.com/standards/mraid/), MRAID since 2011, 3.0 backward compatibility, close control standardization, viewability and audibility and VPAID events
- [IAB: MRAID](https://www.iab.com/guidelines/mraid/), the common API for mobile rich media ads and expand and resize commands
- [IAB Tech Lab: VAST](https://iabtechlab.com/standards/vast/), VAST 4.3, the 2024 CTV addendum, and VPAID deprecated for SIMID
- [IAB Tech Lab: CTV Ad Portfolio announcement (December 11, 2025)](https://iabtechlab.com/press-releases/iab-tech-lab-announces-ctv-ad-portfolio/), six formats, more than 100 Ad Format Hero submissions, Pause and Menu prioritized, comment period to January 31, 2026
- [IAB Tech Lab: CTV Ad Portfolio](https://iabtechlab.com/standards/ctv-ad-portfolio/), format definitions, the comment rounds and final status of the guidelines and signaling guidance
- [IAB Tech Lab: What's new in CTV ad format signaling](https://iabtechlab.com/whats-new-in-ctv-ad-format-signaling/), video object with VAST NonLinear for five formats, MediaFiles in NonLinearAds, native object for menu ads
- [IAB Tech Lab: CTV signaling implementation guidelines](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/Ad-Format-Guidelines-for-Digital-Video-CTV/main/Signaling-Implementation-Guidelines.md), plcmt 5-9, pos and playbackmethod values, creative attributes 21-23, MediaFiles and SIMID InteractiveCreativeFile in NonLinear ads, the pause request and menu ads through native

**Reference**

- [Coalition for Better Ads: Better Ads Standards](https://www.betterads.org/standards/), the desktop, mobile web, short-form video and mobile app experiences and the 150,000-consumer research base
- [Chrome Developers: Heavy ad interventions](https://developer.chrome.com/blog/heavy-ad-interventions), the 4 MB network threshold without user interaction
- [Chrome Developers: Improving advertising on the web](https://developer.chrome.com/blog/better-ads), removal of all ads from sites failing the Ad Experience Report for more than 30 days
- [Acceptable Ads: The Acceptable Ads Standard](https://acceptableads.com/standard/), expanding, overlay and interstitial page ads excluded from the allowlist
- [Google Search Central: Avoid intrusive interstitials and dialogs](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials), not obscuring the page and the exemption for legally mandatory interstitials

**In practice**

- [Google Ad Manager Help: Supported ad sizes](https://support.google.com/admanager/answer/1100453), top-performing, other supported and regional sizes, size names, and automatic slot expansion on mobile web
- [Google Ad Manager Help: Native ads](https://support.google.com/admanager/answer/6366845), element-based ads styled by the publisher, ad attribution and AdChoices placement
- [Google Ad Manager Help: Traffic web interstitials](https://support.google.com/admanager/answer/9840201), the 10-minute default cap, triggers, ineligible links and interstitial sizes
- [Google Publisher Tag: Ad sizes](https://developers.google.com/publisher-tag/guides/ad-sizes), fixed, multi-size, fluid and responsive slots and size mapping
- [Google Publisher Tag: Minimize layout shift](https://developers.google.com/publisher-tag/guides/minimize-layout-shift), fluid slots below the fold only
- [Google Publisher Tag: Best practices](https://developers.google.com/publisher-tag/guides/ad-best-practices), more sizes making more ads eligible
- [Google Publisher Tag: Reference](https://developers.google.com/publisher-tag/reference), the OutOfPageFormat enumeration
- [AdMob Help: Disallowed interstitial implementations](https://support.google.com/admob/answer/6201362), logical breaks, no interstitials on load or exit, one per two user actions
- [Google Ads Help: About responsive display ads](https://support.google.com/google-ads/answer/6363750), uploaded assets assembled by Google for each placement
- [Google Ads Help: Create responsive display ads](https://support.google.com/google-ads/answer/7005917), headline counts and lengths, image and logo sizes and file limits
- [Google Ads Help: Best practices for responsive display ads](https://support.google.com/google-ads/answer/9823397), the 9:16 image spec, up to 15 images, the 80-character description, and the Demand Gen migration
- [Meta Ads Guide: Facebook Feed image](https://www.facebook.com/business/ads-guide/update/image/facebook-feed), 4:5 ratio, resolution, file size, tolerance and text limits
- [Meta Ads Guide: Instagram Reels video](https://www.facebook.com/business/ads-guide/update/video/instagram-reels), 9:16 ratio, resolution, duration, file size and safe zones
