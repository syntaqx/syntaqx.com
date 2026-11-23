+++
title = "VAST & Video Ads"
description = "VAST 4.3 and its InLine, Wrapper and tracking model, wrapper chains, error codes and macros, VMAP, VPAID's replacement by SIMID and OMID, and renditions."
category = "Advertising Industry"
order = 2948
part = "Channels"
tags = ["advertising", "video", "vast", "vmap", "simid", "omid", "data-model"]
+++

A video ad is a document before it is a video. When a player reaches an ad break, it asks an ad server for ads and gets back XML in IAB Tech Lab's Video Ad Serving Template (VAST): which media files to play, in which renditions, which URLs to call when the ad starts, reaches each quartile, is skipped or fails, which verification scripts to run, what to do on a click, and what the creative's registered ID is. Every video and audio ad on the open web, in apps and on connected TVs travels this way, whether a browser player, a TV app or a server stitching ads into a stream reads it.

It is hard because the document is usually not the ad but a pointer to another document. An agency's ad server wraps the advertiser's, a DSP wraps the agency's, an SSP wraps the DSP's, and the player follows the chain, accumulating every party's tracking URLs, until it reaches the one document with media files. Each hop adds latency and a failure mode; each party counts from its own pixels; the media file may not exist in a rendition the device or the stitcher can play; and the interactive and measurement code that used to ride inside the ad (VPAID) has been replaced by two standards that split the job. The player's job is to play the right file, fire every party's tracking exactly once at the right moment, and report errors with codes everyone understands.

This chapter covers VAST's structure and versions (4.3 current, 4.4 in preparation), InLine and Wrapper responses and how wrapper chains are resolved, tracking events and the impression, error codes and macros, VMAP for scheduling breaks, the move from VPAID to SIMID and OMID, media files, mezzanines and renditions, and the CTV additions. It extends `creatives` and `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and adds VAST responses as served, VAST errors and creative renditions. Video formats and their OpenRTB signaling (`plcmt`, the CTV Ad Portfolio) are [Ad Formats & Standards](/books/advertising/ad-formats); impression counting rules (begin to render, server-side counting) are [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks); pods, stitching and competitive separation are [Server-Side Ad Insertion & Ad Pods](/books/advertising/server-side-ad-insertion); video viewability is [Viewability & Attention](/books/advertising/viewability-and-attention). Encoding ladders and packaging for content (as opposed to ads) are the User-Generated Platforms volume's [Video on Demand](/books/user-generated-platforms/video-on-demand#encoding-ladders-and-per-title-encoding).

## How the Platforms Do It

As of November 2026, from the specifications and each vendor's documentation. Rows are the standards and the players and services that read them.

| Standard or system | Role | Versions supported | Notes |
| --- | --- | --- | --- |
| **AWS Elemental MediaTailor** | Server-side ad insertion: requests VAST or VMAP from an ad decision server and stitches the ads | VAST and VMAP from the ADS | Transcodes ads to match the content; an ad not yet transcoded is skipped and prepared "for the next request" |
| **Google Ad Manager Dynamic Ad Insertion** | Server-side insertion for live and VOD | "All video ads must be VAST compliant" | VPAID not supported; every video ad must be transcoded into HLS variants, at the latest on the first monetizable impression |
| **Google IMA SDK (HTML5)** | Client-side player SDK that requests and plays VAST | VAST 2 and 3 fully; VAST 4 partially (SIMID, multiple `UniversalAdId`, some 4.0 features); VMAP 1.0.1 partially; VPAID 2; SIMID 1.0; OM SDK 1.3 | VMAP tracking events, error codes and `repeatAfter` unsupported |
| **IAB Tech Lab OM SDK** | Measurement API (OMID) verification vendors use through one integration | OMID 1.6 current | Web video SDK since December 2020; CTV formats in the November 2026 release |
| **IAB Tech Lab SIMID** | Interactive layer replacing VPAID's interactivity | 1.2 | Creative runs sandboxed; separation "allows publisher players to be in control of their streams" |
| **IAB Tech Lab VAST** | The ad response format | 4.3 (December 2022) latest published; CTV Addendum (July 2024); 4.4 on GitHub with "Publication Date TBD" | VPAID "Deprecated, replaced with SIMID" |

Two things stand out. Support is uneven: the most widely used client SDK still fully supports only VAST 2 and 3, so a creative that relies on a 4.x feature has to degrade. And the server-side services don't play VPAID at all, which is why CTV and stitched video run on plain media files plus OMID and SIMID where the device allows.

## VAST in One Page

A VAST response is a `<VAST>` root with a `version` attribute and one or more `<Ad>` elements, each either an `<InLine>` (the ad itself) or a `<Wrapper>` (a pointer to another VAST document plus this party's tracking). An `Ad` with a `sequence` attribute is part of a pod and plays in that order. The InLine carries:

- **`<AdSystem>`, `<AdTitle>`, `<AdServingId>`:** who served it, and an ID for this serve that tracking can echo as `[ADSERVINGID]`, in the macro list's format `{AD SERVER NAME}-{UUID}`.
- **`<Impression>`:** URLs to call when the impression occurs. All Impression URIs in the InLine and every preceding Wrapper "should be triggered at the same time when the impression for the ad occurs, or as close in time as possible."
- **`<Error>`:** URLs to call with `[ERRORCODE]` when the ad fails.
- **`<AdVerifications>`:** verification scripts. IAB Tech Lab "strongly recommends" OMID-compatible code; a player that declines one must call its `verificationNotExecuted` URI with a reason code.
- **`<Creatives>`:** one or more `<Creative>`, each with a `<UniversalAdId>` and a `<Linear>`, `<NonLinearAds>` or `<CompanionAds>` element.
- **`<Linear>`:** `<Duration>`, optional `skipoffset`, `<MediaFiles>` (each `<MediaFile>` a rendition with delivery, type, width, height, bitrate and codec; plus `<Mezzanine>` and `<InteractiveCreativeFile>`), `<TrackingEvents>`, `<VideoClicks>` and `<Icons>` (AdChoices and, since the 2024 CTV addendum, DSA transparency icons).

**UniversalAdId** is required for linear ads and identifies the creative across systems. It "consists of an attribute for defining the `idRegistry`" (the registry where the ID is cataloged, such as Ad-ID for US TV commercials) and the ID value; VAST 4.2 allows several. It is the field that lets a stitcher cache one transcode for a creative served by ten ad servers, a pod deduplicate the same commercial bought twice, and a TV measurer match a digital spot to its linear airing. The CTV guide says it plainly: "there needs to be a way to uniquely identify each piece of creative content across all ad systems."

**Media files and the mezzanine.** `<MediaFile>` "should only be used to include video or audio files"; code goes in `<InteractiveCreativeFile>`. The **mezzanine** is "the raw high-quality video file that the publisher can use to produce the best quality file where needed"; it is never played, only transcoded, and exists for server-side insertion, where the stitcher must re-encode the ad to match the content's ladder. Error 406 means a mezzanine was required and missing, 407 that it is being downloaded for the first time (so the ad was skipped this time), and 411 that it is out of spec.

A minimal InLine with one rendition, a mezzanine, a verification script and quartile tracking:

```xml
<VAST version="4.3">
  <Ad id="a-7731">
    <InLine>
      <AdSystem version="2.1">ExampleAdServer</AdSystem>
      <AdServingId>ExampleAdServer-0190f3c2-6c1e-7b4a-9d1e-2b7f8a1c4e55</AdServingId>
      <AdTitle>Spring Running Shoe 30s</AdTitle>
      <Impression><![CDATA[https://ads.example.com/i?s=[ADSERVINGID]&t=[TIMESTAMP]&ss=[SERVERSIDE]]]></Impression>
      <Error><![CDATA[https://ads.example.com/e?code=[ERRORCODE]&s=[ADSERVINGID]]]></Error>
      <AdVerifications>
        <Verification vendor="verifier.example.com-omid">
          <JavaScriptResource apiFramework="omid" browserOptional="true">
            <![CDATA[https://verifier.example.com/omid.js]]>
          </JavaScriptResource>
          <TrackingEvents>
            <Tracking event="verificationNotExecuted">
              <![CDATA[https://verifier.example.com/nx?r=[REASON]]]>
            </Tracking>
          </TrackingEvents>
        </Verification>
      </AdVerifications>
      <Creatives>
        <Creative id="c-412" adId="ABCD1234000H">
          <UniversalAdId idRegistry="ad-id.org">ABCD1234000H</UniversalAdId>
          <Linear>
            <Duration>00:00:30.000</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://ads.example.com/t?e=start&s=[ADSERVINGID]]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://ads.example.com/t?e=q1&s=[ADSERVINGID]]]></Tracking>
              <Tracking event="midpoint"><![CDATA[https://ads.example.com/t?e=mid&s=[ADSERVINGID]]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[https://ads.example.com/t?e=q3&s=[ADSERVINGID]]]></Tracking>
              <Tracking event="complete"><![CDATA[https://ads.example.com/t?e=complete&s=[ADSERVINGID]]]></Tracking>
            </TrackingEvents>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080"
                         bitrate="8000" codec="avc1.640028">
                <![CDATA[https://cdn.example.com/c-412/1080p.mp4]]>
              </MediaFile>
              <Mezzanine delivery="progressive" type="video/mp4" width="1920" height="1080">
                <![CDATA[https://cdn.example.com/c-412/mezzanine.mov]]>
              </Mezzanine>
            </MediaFiles>
            <VideoClicks>
              <ClickThrough><![CDATA[https://shoes.example.com/spring]]></ClickThrough>
            </VideoClicks>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

## Versions

VAST has been extended rather than replaced since 2.0, and players negotiate by declaring which versions they accept (OpenRTB's `video.protocols`). From IAB Tech Lab's VAST page and the 4.x repository:

- **VAST 4.0** added the mezzanine file "for server-side ad insertion" and `UniversalAdId`.
- **VAST 4.1 (November 2018)** added "Ad verification with Open Measurement," the `loaded` and `closeLinear` events, and the macro set most tracking uses today (`[SERVERSIDE]`, `[DEVICEIP]`, `[IFA]`, `[TRANSACTIONID]`), and removed `acceptInvitationLinear` and `timeSpentViewing`.
- **VAST 4.2 (June 2019)** introduced SIMID as "the replacement for VPAID for interactive use cases" and allowed several `UniversalAdId` nodes.
- **VAST 4.3 (December 2022)** is the latest numbered release; it allows inline data URIs for interactive files.
- **VAST CTV Addendum (July 2024)** "Includes ACIF Support for Ad Registration, Icons to Support DSA," to be read with 2.0 through 4.3.
- **VAST 4.4** is in IAB Tech Lab's GitHub repository with "Publication Date TBD": it expands `NonLinearAds` for the CTV Ad Portfolio (pause, screensaver, overlay, squeezeback, in-scene), allows `<MediaFiles>` and `<InteractiveCreativeFile>` under non-linear ads, adds icons to non-linear ads, standardizes AdCOM signaling (`plcmt`, `pos`, `playbackmethod`, `attr`) in extensions, and adds a QR code creative extension. An XSD for 4.4 is already in the schema repository. Treat it as a draft until IAB Tech Lab's page lists it.

My rule for a system that produces VAST: emit the lowest version that carries what the ad needs, declare it honestly in `version`, and validate against that version's XSD before serving, because players reject on version and schema (errors 101 and 102) before they look at anything else.

## Wrappers and Chains

A **Wrapper** says "the ad is over there" (`<VASTAdTagURI>`) and adds this party's `<Impression>`, `<Error>` and tracking. The player fetches the next document, and the next, until it reaches an InLine, then fires every party's impression URLs together when the ad starts. Wrappers are how an agency ad server, a DSP and an SSP each count the same impression from their own pixels without trusting each other's.

The spec limits the chain: "VAST Wrappers should be limited to five before resulting in an InLine response." A player that sees more may stop, call the error URLs with 302 ("Wrapper limit reached") and move on. "Error codes should be sent for all wrappers in the chain where provided," so a failure deep in the chain reaches every party that wrapped it. Two attributes on a Wrapper control fallbacks: `followAdditionalWrappers` (whether the chain may continue) and `fallbackOnNoAd` (whether to try the next ad in a pod or buffet if this one comes back empty).

Server-side stitchers don't play wrappers: the CTV guide says "If the VAST tag response is a Wrapper tag then the ad-stitching service should extract the inner InLine response," and fire the accumulated tracking itself. So in SSAI, the stitcher does the chain resolution a player would, under a much tighter time budget, for thousands of viewers at once.

A resolver that follows a chain within limits and carries tracking forward:

```go tab="Go"
type Doc struct {
	IsWrapper   bool
	NextURL     string   // VASTAdTagURI, for a wrapper
	Impressions []string // this document's Impression URLs
	Errors      []string // this document's Error URLs
	Tracking    map[string][]string
	InLine      *InLine  // set when !IsWrapper
}

type InLine struct {
	MediaFiles []MediaFile
	Duration   time.Duration
}

type MediaFile struct{ URL, Type string; Width, Height, BitrateKbps int }

type Resolved struct {
	InLine      *InLine
	Impressions []string            // every party's, fired together at the impression
	Errors      []string            // every party's, fired with [ERRORCODE] on failure
	Tracking    map[string][]string // merged per event
}

type Fetch func(ctx context.Context, url string) (*Doc, error)

const maxWrappers = 5 // "limited to five before resulting in an InLine response"

// Resolve follows wrappers to an InLine, returning a VAST error code on failure.
func Resolve(ctx context.Context, fetch Fetch, url string, perHop time.Duration) (*Resolved, int) {
	out := &Resolved{Tracking: map[string][]string{}}
	for hop := 0; ; hop++ {
		hopCtx, cancel := context.WithTimeout(ctx, perHop)
		doc, err := fetch(hopCtx, url)
		cancel()
		switch {
		case errors.Is(err, context.DeadlineExceeded):
			return out, 301 // wrapper URI timeout
		case err != nil:
			return out, 300 // general wrapper error
		case doc == nil:
			return out, 303 // no VAST response after one or more wrappers
		}
		out.Impressions = append(out.Impressions, doc.Impressions...)
		out.Errors = append(out.Errors, doc.Errors...)
		for ev, urls := range doc.Tracking {
			out.Tracking[ev] = append(out.Tracking[ev], urls...)
		}
		if !doc.IsWrapper {
			out.InLine = doc.InLine
			return out, 0
		}
		if hop+1 >= maxWrappers {
			return out, 302 // wrapper limit reached
		}
		url = doc.NextURL
	}
}
```

```rust tab="Rust"
use std::{collections::HashMap, future::Future, time::Duration};

pub struct Doc {
    pub is_wrapper: bool,
    pub next_url: String,
    pub impressions: Vec<String>,
    pub errors: Vec<String>,
    pub tracking: HashMap<String, Vec<String>>,
    pub inline: Option<InLine>,
}

pub struct InLine {
    pub media_files: Vec<MediaFile>,
    pub duration: Duration,
}

pub struct MediaFile {
    pub url: String,
    pub mime: String,
    pub width: u32,
    pub height: u32,
    pub bitrate_kbps: u32,
}

#[derive(Default)]
pub struct Resolved {
    pub inline: Option<InLine>,
    pub impressions: Vec<String>,
    pub errors: Vec<String>,
    pub tracking: HashMap<String, Vec<String>>,
}

pub enum FetchError { Timeout, Other }

const MAX_WRAPPERS: usize = 5; // "limited to five before resulting in an InLine response"

/// Follows wrappers to an InLine; on failure returns the VAST error code with what was gathered.
pub async fn resolve<F, Fut>(fetch: F, mut url: String) -> Result<Resolved, (u16, Resolved)>
where
    F: Fn(String) -> Fut,
    Fut: Future<Output = Result<Option<Doc>, FetchError>>,
{
    let mut out = Resolved::default();
    for hop in 0.. {
        let doc = match fetch(url.clone()).await {
            Err(FetchError::Timeout) => return Err((301, out)), // wrapper URI timeout
            Err(FetchError::Other) => return Err((300, out)),   // general wrapper error
            Ok(None) => return Err((303, out)),                 // no VAST after wrappers
            Ok(Some(d)) => d,
        };
        out.impressions.extend(doc.impressions);
        out.errors.extend(doc.errors);
        for (ev, urls) in doc.tracking {
            out.tracking.entry(ev).or_default().extend(urls);
        }
        if !doc.is_wrapper {
            out.inline = doc.inline;
            return Ok(out);
        }
        if hop + 1 >= MAX_WRAPPERS {
            return Err((302, out)); // wrapper limit reached
        }
        url = doc.next_url;
    }
    unreachable!()
}
```

The design point is that errors are reported to everyone already in the chain: a 302 at hop five reaches the four parties that wrapped it, which is the only way an SSP learns that a DSP's agency tags are too deep.

## Tracking Events

VAST's events are what video billing and reporting are built from. From section 3.14 of VAST 4.3:

- **Linear ad metrics:** `loaded` (enough buffered to play), `start`, `firstQuartile`, `midpoint` and `thirdQuartile` (played "continuously" for at least 25, 50 and 75 percent of the duration "at normal speed"), `complete` (played to the end at normal speed, so 100% was played), `progress` with an `offset` (a set time or percentage, linear only), `otherAdInteraction`, and `closeLinear`.
- **Player operation:** `mute`, `unmute`, `pause`, `resume`, `rewind`, `skip`, `playerExpand`, `playerCollapse`, and `notUsed` (prefetched but never played, a terminal event).
- **Non-linear:** `creativeView` (also the only event for companions), `acceptInvitation`, `adExpand`, `adCollapse`, `minimize`, `close` and `overlayViewDuration`.
- **Interactive:** `interactiveStart`, timed by the interactive spec (SIMID).

Three rules turn events into counts. The impression is the `<Impression>` URLs, not `start`, though most players fire them together; counting rules decide when that is ([Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) owns begin-to-render for video). Quartiles count continuous play, so a viewer who scrubs to the end has not completed the ad. And `notUsed` exists because prefetching is normal in apps and stitchers: an ad fetched for a break that never played must not count, and the event lets every party close the record.

**Macros** are how a tracking URL carries context. The ones that matter most for video and CTV, from IAB Tech Lab's macro list:

| Macro | Meaning | Since |
| --- | --- | --- |
| `[ERRORCODE]` | The VAST error code, in error URLs only | 3.0 |
| `[ADPLAYHEAD]` | The ad's playhead, HH:MM:SS.mmm (replaces `[CONTENTPLAYHEAD]`, deprecated in 4.1) | 4.1 |
| `[BREAKPOSITION]` | 1 pre-roll, 2 mid-roll, 3 post-roll, 4 standalone, 0 none or other | 4.1 |
| `[SERVERSIDE]` | 0 the client fired it; 1 a server fired it on behalf of a client that told it to; 2 a server fired it on behalf of another server or on its own decision | 4.1 |
| `[DEVICEIP]`, `[SERVERUA]`, `[CLIENTUA]` | The device's IP when a server makes the call; the server's own user agent, which should "identify the company and product or service making the request"; the player and VAST client | 4.1 |
| `[IFA]`, `[IFATYPE]`, `[LIMITADTRACKING]` | The device's advertising ID, its type and the limit-ad-tracking setting | 4.1 |
| `[TRANSACTIONID]` | A UUID generated by the initiating player and passed down the chain | 4.1 |
| `[ADSERVINGID]`, `[UNIVERSALADID]` | This serve's ID; the creative's registry and ID | 4.1 |
| `[GDPRCONSENT]`, `[GPPSTRING]`, `[REGULATIONS]` | The TCF string, the GPP string and the regulations that apply | 4.1, 4.x |
| `[BREAKMAXDURATION]`, `[BREAKMAXADS]` | The break's maximum seconds and ads | 4.2 |

Values a player knows but may not share are replaced with -2, unknown values with -1, where a macro allows it. A counter receiving video beacons stores `[SERVERSIDE]` with the event, because 1 and 2 are different trust levels: a server acting on a client's playback signal keeps the link to client initiation that the MRC's counting rules require; a server acting on its own has none, and the MRC warns that server-to-server tracking "may be limited and not fully able to satisfy client-initiated measurement requirements."

## Error Codes

VAST's error table is how a failed ad becomes a diagnosis. The groups, from 4.3:

- **100s, XML:** 100 parse error, 101 schema validation error, 102 version not supported.
- **200s, trafficking:** 200 unexpected or unplayable ad type, 201 wrong linearity, 202 wrong duration, 203 wrong size, 204 required category missing, 205 category blocked by `BlockedAdCategories`, 206 ad break shortened.
- **300s, wrappers:** 300 general, 301 wrapper URI timeout, 302 wrapper limit reached, 303 no VAST after one or more wrappers, 304 InLine failed to display in time.
- **400s, linear:** 400 general, 401 file not found, 402 media file timeout, 403 no supported media file, 405 media file found but couldn't display, 406 mezzanine required but missing, 407 mezzanine still downloading, 409 interactive creative file not executed, 410 verification not executed, 411 mezzanine out of spec.
- **500s and 600s, non-linear and companions;** **900** undefined, 901 general VPAID error, 902 general interactive creative file error.

A video seller's error dashboard is these codes by ad system and creative: 303 and 301 rates by demand partner show which DSPs' chains are slow or empty, 403 by creative shows ads that shipped without a rendition the device plays, and 407 by creative in SSAI shows ads that will start filling once their transcode finishes.

## VMAP

VAST describes ads; **VMAP** (Video Multiple Ad Playlist) describes when breaks occur in a piece of content: pre-roll, mid-rolls at time offsets or positions, post-roll, each pointing to a VAST tag or carrying VAST inline. A long-form VOD player or a stitcher fetches one VMAP per program and one VAST per break. Support is partial in practice: Google's HTML5 IMA SDK lists VMAP 1.0.1 as partially supported, without VMAP tracking events, error codes, overlays or `repeatAfter`, and notes that ad rules on iPhone require custom playback. For live streams, breaks come from the stream itself (SCTE-35 markers carried into the manifest), not from VMAP; the User-Generated Platforms volume's [Timed Metadata and Ad Breaks](/books/user-generated-platforms/live-latency-and-vods#timed-metadata-and-ad-breaks) covers the markers.

## From VPAID to SIMID and OMID

VPAID (Video Player-Ad Interface Definition) let an ad ship executable code that the player ran inside itself, for two purposes: interactivity (an overlay, a choice, a game) and measurement (verification vendors' code inside the ad). Running arbitrary ad code in the player was slow, unsafe and impossible on most TVs and in server-side insertion. IAB Tech Lab's VAST page now lists VPAID as "Deprecated, replaced with SIMID," and the Digital Video Technical Working Group replaced it with two narrower standards:

- **SIMID** (Secure Interactive Media Interface Definition), now 1.2, for interactivity: the creative is "securely enclosed in the SIMID container" and can request player operations, while the publisher's player keeps control of the media; 1.2 requires that "session IDs be cryptographically secure," and SIMID "enables use cases such as server-side ad insertion (SSAI)." In VAST it arrives as an `<InteractiveCreativeFile>`.
- **OMID** (Open Measurement Interface Definition) for measurement: the publisher integrates OM SDK once, and every verification vendor's script in `<AdVerifications>` reads the same signals.

Support lags the standard: Google's HTML5 IMA SDK still lists VPAID 2 alongside SIMID 1.0 and OM SDK 1.3, and its server-side DAI lists VPAID as not supported. My default for a buy that needs interactivity or verification is SIMID and OMID with a plain media file fallback, because a VPAID-only creative simply doesn't run on the devices where video money is moving.

## Renditions and Transcoding

The player picks one `<MediaFile>` by type, size and bitrate; a creative that ships only a 1080p MP4 at 8 Mbps fails on a weak connection and wastes bandwidth on a phone. Ad servers therefore transcode an uploaded video into a ladder of renditions, much as content is encoded ([Encoding Ladders and Per-Title Encoding](/books/user-generated-platforms/video-on-demand#encoding-ladders-and-per-title-encoding)).

Server-side insertion raises the bar: the ad must match the content stream's encoding (resolution steps, codecs, segment duration, audio loudness) or the stitched stream glitches. So stitchers transcode every ad themselves, from the mezzanine where one exists. Google's DAI says all video ads must be transcoded into HLS variants and that if ingestion doesn't happen before launch, it occurs "on the first monetizable impression"; MediaTailor says that if an ad "hasn't yet been transcoded to match the content, MediaTailor will skip inserting it" and prepares it "for the next request." Both mean the first serve of a new creative in SSAI is often lost (the CTV guide has the stitcher skip it with error 407 and reuse the transcode for later serves of the same creative ID), which is why my default is to pre-register creatives with stitchers by `UniversalAdId` before a campaign starts.

## How to Build It

The core model holds a video creative as a `creatives` row with `format = 'video'`, `duration_ms` and its VAST tag or assets in `assets`; [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco) adds `creative_assets` (with `kind = 'video'` and `'vast_tag'`) and immutable `creative_versions`; [Ad Formats & Standards](/books/advertising/ad-formats) adds `ad_formats` with `openrtb_plcmt`; the core `ad_events` already has `video_start`, the quartiles and `complete`. This chapter adds the creative's universal ad ID, the renditions each version was transcoded into, the VAST each serve returned, the errors players reported, and the rest of the VAST event vocabulary.

```sql
ALTER TABLE creatives
  ADD COLUMN universal_ad_id_registry TEXT,   -- 'ad-id.org', or 'unknown' per VAST's default
  ADD COLUMN universal_ad_id TEXT,            -- the registered ID value
  ADD COLUMN skip_offset_ms INT,              -- null: not skippable
  ADD COLUMN vast_max_version TEXT;           -- the highest VAST version this creative needs

ALTER TABLE creatives ADD CONSTRAINT creatives_universal_ad_id_check
  CHECK (format NOT IN ('video', 'audio') OR universal_ad_id IS NOT NULL) NOT VALID;

CREATE INDEX CONCURRENTLY creatives_universal_ad_id_idx
  ON creatives (universal_ad_id_registry, universal_ad_id);

CREATE TABLE creative_renditions (        -- one playable file produced from one creative version
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  creative_version_id UUID NOT NULL REFERENCES creative_versions (id),
  source_asset_id     UUID NOT NULL REFERENCES creative_assets (id),  -- the mezzanine or upload
  produced_by_org_id  UUID NOT NULL REFERENCES organizations (id),    -- this ad server, or a stitcher
  profile             TEXT NOT NULL,        -- the ladder rung or the stitcher's content profile
  delivery            TEXT NOT NULL CHECK (delivery IN ('progressive', 'hls', 'dash')),
  mime                TEXT NOT NULL,        -- 'video/mp4', 'application/x-mpegURL', 'audio/mpeg'
  codec               TEXT,                 -- RFC 6381 string, e.g. 'avc1.640028'
  width               INT,
  height              INT,
  bitrate_kbps        INT,
  duration_ms         INT NOT NULL,         -- measured, to compare with the VAST Duration
  loudness_lkfs_milli INT,                  -- integrated loudness x 1000, where measured
  url                 TEXT,                 -- null until ready
  status              TEXT NOT NULL CHECK (status IN ('queued', 'transcoding', 'ready',
                        'failed', 'out_of_spec')),
  error               TEXT,
  ready_at            TIMESTAMPTZ,
  UNIQUE (creative_version_id, produced_by_org_id, profile)
);

CREATE TABLE vast_responses (             -- what this system returned for one ad request
  id                  UUID NOT NULL DEFAULT uuidv7(),
  served_at           TIMESTAMPTZ NOT NULL,
  ad_request_id       UUID,                 -- joined by time and ID, as with the other logs
  auction_id          UUID,
  ad_serving_id       TEXT NOT NULL,        -- the AdServingId echoed as [ADSERVINGID]
  transaction_id      TEXT,                 -- [TRANSACTIONID] from the initiating player
  vast_version        TEXT NOT NULL,
  response_kind       TEXT NOT NULL CHECK (response_kind IN ('inline', 'wrapper', 'empty')),
  wrapped_url         TEXT,                 -- the VASTAdTagURI this response points to
  wrapper_depth       SMALLINT NOT NULL DEFAULT 0,  -- hops already above this one, where known
  ad_count            SMALLINT NOT NULL DEFAULT 0,  -- Ads returned; more than one for a pod
  creative_ids        UUID[] NOT NULL DEFAULT '{}',
  bytes               INT,
  body_ref            TEXT,                 -- object storage key of the document, kept for the dispute window
  PRIMARY KEY (served_at, id),
  UNIQUE (served_at, ad_serving_id)
) PARTITION BY RANGE (served_at);

CREATE TABLE vast_errors (                -- one [ERRORCODE] call received
  id                  UUID NOT NULL DEFAULT uuidv7(),
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ad_serving_id       TEXT,                 -- from the URL; null when the macro wasn't filled
  creative_id         UUID,
  error_code          SMALLINT NOT NULL CHECK (error_code BETWEEN 100 AND 999),
  server_side         SMALLINT CHECK (server_side IN (0, 1, 2)),  -- [SERVERSIDE] as sent
  reporter_ua         TEXT,                 -- [SERVERUA] or [CLIENTUA], parsed to family
  break_position      SMALLINT CHECK (break_position BETWEEN 0 AND 4),
  PRIMARY KEY (received_at, id)
) PARTITION BY RANGE (received_at);

ALTER TABLE ad_events
  ADD COLUMN server_side_macro SMALLINT,    -- [SERVERSIDE] on the beacon: 0, 1 or 2
  ADD COLUMN ad_serving_id TEXT,
  ADD COLUMN progress_offset_ms INT;        -- for kind 'progress'
```

The core `ad_events.kind` check lists only the impression, click, video start, quartile and reward events. Widening it to VAST's vocabulary (`loaded`, `progress`, `skip`, `mute`, `unmute`, `pause`, `resume`, `close_linear`, `creative_view`, `interactive_start`, `not_used`) works on the partitioned log like on any table: a check added `NOT VALID` on the parent is added to every partition, also unvalidated, and `VALIDATE CONSTRAINT` on the parent then scans each partition under a lock that doesn't block reads or writes. Postgres won't mark the parent's check valid unless it is valid on every partition, and rejects `ALTER TABLE ONLY` for that reason.

```sql
ALTER TABLE ad_events DROP CONSTRAINT ad_events_kind_check;
ALTER TABLE ad_events ADD CONSTRAINT ad_events_kind_check
  CHECK (kind IN ('impression', 'viewable_impression', 'click', 'video_start',
    'first_quartile', 'midpoint', 'third_quartile', 'complete', 'reward',
    'loaded', 'progress', 'skip', 'mute', 'unmute', 'pause', 'resume', 'close_linear',
    'creative_view', 'interactive_start', 'not_used')) NOT VALID;  -- a superset: old rows pass

ALTER TABLE ad_events VALIDATE CONSTRAINT ad_events_kind_check;  -- recurses to every partition
```

Design notes:

- **The universal ad ID is the join key across systems.** Stitchers cache transcodes by it, pods deduplicate by it, ACR and TV measurement match by it, and a make-good dispute names it. Requiring it for every video and audio creative is cheap at upload and expensive to backfill.
- **Renditions belong to a version and a producer.** The same creative version is transcoded by this ad server for client players and again by each stitcher for its content profile; `produced_by_org_id` and `profile` keep them apart, and `status` explains a 403 or 407 without opening a log.
- **Keep what was served, by reference.** `vast_responses` stores the document's key in object storage rather than the XML in the row, partitioned by hour like the other logs, kept for the dispute window. When a buyer says "your wrapper had no impression pixel," the answer is the document.
- **Errors are their own log.** Error calls arrive without an impression (that is the point), often without a filled `[ADSERVINGID]`, so they are not `ad_events`. Rolled up by code, creative and demand partner, they are the video seller's most useful operational report.
- **Store the server-side flag on every beacon.** `[SERVERSIDE]` 1 and 2 are different trust levels for counting and for invalid traffic, and the counter should never infer it from the source address.
- **Not used is a terminal event.** A prefetched ad that never played closes with `not_used`, so pacing doesn't wait for an impression that won't come and billing never counts it.

## Auditing

- **What each party saw.** For a disputed impression: the VAST this system returned (or the wrapper it pointed to), its version, the chain depth, the creative and its universal ad ID.
- **What fired, from where.** Each event with its `[SERVERSIDE]` value, the reporting user agent and the serving ID, so client and server counts can be told apart and reconciled.
- **Why ads failed.** Error codes by demand partner, creative and break position over time, kept long enough to support a seller's claim that a buyer's tags, not its player, lost the impressions.
- **What was playable.** Renditions per creative version and producer with their readiness times, so an under-delivery on a new creative in SSAI can be traced to transcoding rather than demand.

## What This Means for the System You Build

- **Emit the lowest VAST version that carries the ad,** validate it against that version's schema, and read 4.4 as a draft until IAB Tech Lab publishes it.
- **Require a universal ad ID with its registry** on every video and audio creative.
- **Resolve wrapper chains within the five-wrapper limit** under a per-hop timeout, carry every party's tracking forward, and report errors to everyone in the chain.
- **Fire all impression URLs together** at the impression, and quartiles only for continuous play.
- **Record `[SERVERSIDE]` on every beacon** and treat 1 and 2 differently.
- **Ship SIMID and OMID, not VPAID,** with a plain media file fallback.
- **Transcode renditions per producer and pre-register creatives with stitchers** so the first SSAI serve isn't lost.
- **Keep served documents and error calls as their own logs** for the dispute window.

## References

**Specifications**

- [PostgreSQL 18: ALTER TABLE](https://www.postgresql.org/docs/18/sql-altertable.html), NOT VALID checks, recursion to partitions and the VALIDATE CONSTRAINT lock
- [IAB Tech Lab: VAST](https://iabtechlab.com/standards/vast/), VAST 4.3 (December 2022) as the latest listed, the CTV Addendum (July 2024), VPAID deprecated and replaced with SIMID, the mezzanine in VAST 4, Open Measurement in 4.1, SIMID in 4.2
- [IAB Tech Lab: VAST 4.3 specification (GitHub)](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/VAST4.x/main/4.3.md), tracking events, idRegistry, unavailable-macro values
- [IAB Tech Lab: VAST 4.4 draft (GitHub)](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/VAST4.x/main/4.4.md), "Publication Date TBD", the non-linear and CTV additions, error codes, the five-wrapper limit, Impression timing, AdVerifications, the mezzanine and InteractiveCreativeFile
- [IAB Tech Lab: VAST repository (GitHub)](https://github.com/InteractiveAdvertisingBureau/vast), the 4.4 XSD and the CTV addendum
- [IAB Tech Lab: VAST 4 macros data](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/VAST/master/vast4macros/data/macros-data.json), macro definitions, values and the version each was introduced
- [IAB Tech Lab: SIMID](https://iabtechlab.com/standards/simid/), SIMID 1.2, the secure enclosure, player control, secure session IDs and SSAI use cases
- [IAB Tech Lab: Open Measurement SDK](https://iabtechlab.com/standards/open-measurement-sdk/), OMID 1.6 and the web video SDK
- [IAB Tech Lab: CTV Programmatic Guide](https://iabtechlab.com/standards-old/ctv-programmatic-guide/), extracting the InLine from wrappers in SSAI, the need for a universal creative identifier, skipping an untranscoded creative with error 407
- [MRC: Server-Side Ad Insertion and OTT Guidance (August 2021, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/083021%20SSAI%20and%20OTT%20Guidance%20%20FINAL.pdf), counting server-side tracking on client-initiated signals

**In practice**

- [AWS Elemental MediaTailor: How ad insertion works](https://docs.aws.amazon.com/mediatailor/latest/ug/what-is-flow.html), VAST or VMAP from the ADS, transcoding to match the content, skipping an ad not yet transcoded
- [Google Ad Manager: Dynamic Ad Insertion](https://support.google.com/admanager/answer/6147120?hl=en), VAST-compliant ads only, VPAID not supported, transcoding into HLS variants on the first monetizable impression
- [Google IMA SDK: HTML5 compatibility](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/compatibility), supported VAST, VMAP, VPAID, SIMID and OM SDK versions
