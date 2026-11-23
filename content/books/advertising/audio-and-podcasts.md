+++
title = "Audio & Podcasts"
description = "Streaming audio, podcasts and radio ads: dynamic ad insertion, IAB Podcast Measurement v2.3 downloads and ad delivery, host-read ads and audio programmatic."
category = "Advertising Industry"
order = 2951
part = "Channels"
tags = ["advertising", "audio", "podcasts", "dai", "measurement", "data-model"]
+++

Audio advertising is three businesses that share a format. **Streaming audio** (music and radio services) plays an ad between songs to a listener whose app is open and connected, much like a video pre-roll without the picture. **Podcasts** deliver episodes as files, downloaded from a server through an open RSS feed to whatever app the listener chose, with ads either recorded into the episode or inserted into the file at the moment it's downloaded. **Broadcast radio** sells spots in a schedule, the way linear television does. A single company can run all three (SiriusXM with Pandora and its podcast network; iHeartMedia with stations, a podcast business and an audio exchange), and buyers increasingly buy them together.

It is hard because the podcast, the largest growth area, was designed without any way to know whether anyone listened. A podcast server sees an HTTP request for a file and the bytes it sent; it does not see playback, completion or skips, and the same file may be fetched in pieces by a phone, a watch and a smart speaker, or downloaded automatically and never played. So podcast measurement is a set of agreed rules for turning server logs into downloads and delivered ads, and every number a podcast buyer receives (downloads, listeners, ad delivery) is a filtered, windowed count of HTTP requests, not of people. Meanwhile the most valuable podcast ads are read by the host, which makes them part of the content, hard to insert dynamically and subject to endorsement rules.

This chapter covers the audio market and its sellers, streaming audio insertion and programmatic, podcast ad models (baked-in, dynamically inserted, host-read), IAB Tech Lab's Podcast Measurement Technical Guidelines v2.3 (downloads, podcast consumers, delivered ads, filtering and windowing), client-side measurement where an app can report playback, and how attribution works for audio. It extends `properties` and `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and adds podcast episodes, counted downloads, dynamic insertions and host-read spots. Audio in OpenRTB (the `audio` object) is [OpenRTB](/books/advertising/openrtb); the VAST document that carries audio ads is [VAST & Video Ads](/books/advertising/vast-and-video-ads); the size of the podcast market is in [How Big the Market Is](/books/advertising/advertising-landscape#how-big-the-market-is); disclosure of endorsements in host-read ads is Commerce's [The Endorsement Guides](/books/commerce/acquisition-and-attribution#the-endorsement-guides). Creator payouts on audio and video platforms are the User-Generated Platforms volume's [Creator Monetization](/books/user-generated-platforms/creator-monetization).

## How the Platforms Do It

As of November 2026, from annual reports and company pages. Rows are sellers of audio inventory.

| Seller | What it sells | How it's bought | Published scale |
| --- | --- | --- | --- |
| **iHeartMedia** | Broadcast radio, its Digital Audio Group (including podcasting) and Katz Media representation | Direct sales, programmatic marketplaces and the Triton Audio Marketplace, "an innovative global open audio exchange" across broadcast, podcast and streaming | Podcasting revenue $563.7 million in 2025 (from $448.8 million in 2024); "167 million global monthly downloads and streams," as measured by Podtrac |
| **SiriusXM** (Pandora, SiriusXM Media, AdsWizz) | Audio, display and video ads on Pandora's free tier, off-platform inventory, and the SiriusXM Podcast Network | Direct through SiriusXM Media; AdsWizz technology "from dynamic ad insertion to advanced programmatic platforms" | SiriusXM Media reaches "approximately 170 million monthly listeners"; Pandora had about 41.1 million monthly active users at December 31, 2025 |
| **Spotify** | Ads in music and podcasts on its free tier, and podcast inventory through Megaphone and the Spotify Audience Network ("audio-first advertising marketplace") | Direct, Spotify Ads Manager and the Spotify Ad Exchange (open to The Trade Desk and DV360 as of April 2, 2025) | Ad-Supported revenue €1,836 million in 2025, 11% of total revenue; 476 million ad-supported monthly active users |

The filings also show the pricing shift. Spotify's ad revenue fell 1% in 2025, which it attributes mainly to lower direct music and podcast sales from "a decrease in fixed-CPM rates as well as a decrease in music impressions sold," partly offset by €103 million more from automated channels "driven by an increase in music impressions sold primarily on our biddable offerings." Audio is moving from direct, fixed-price sales to auctions, as display did a decade earlier, and its systems need the programmatic plumbing (OpenRTB audio, deals, supply chain files) that the rest of this volume describes.

## Streaming Audio

On a streaming service, the client knows when an ad plays. An ad break between songs is requested by the app or inserted by the service's servers into the audio stream, played in full (audio ads are usually not skippable), and reported by the client: started, quartiles, completed, often with a companion banner on screen. Counting follows the digital rules: client-initiated, begin to play, filtered for invalid activity, with the MRC's Digital Audio Measurement Standards (January 2018, including podcasting) as the accreditation basis.

Spotify says it uses "streaming ad insertion technology to improve our targeting and measurement capabilities for podcast advertising," which applies the same model to podcasts played inside its app: the ad is chosen and reported at playback, not at download. That gives a podcast heard in a streaming app real impressions and listen-through, while the same episode downloaded through RSS to another app gets only download-based counts.

**Programmatic audio.** OpenRTB's `Audio` object mirrors video (MIME types, durations, pods with `podid`, `poddur`, `rqddurs`, `slotinpod`, `mincpmpersec`) and adds audio specifics such as `feed` (the feed type), `stitched` (whether the ad is stitched into the audio) and `nvol` (volume normalization). Pods in audio are filled exactly like video pods ([Server-Side Ad Insertion & Ad Pods](/books/advertising/server-side-ad-insertion) covers the filler). The response is a VAST document with audio media files; the universal ad ID identifies the spot across systems.

## Podcast Ad Models

A podcast episode is a file referenced by an RSS feed's enclosure. Its ads arrive in one of three ways:

- **Baked-in.** The ad is part of the audio file as recorded and published. It plays to everyone who ever downloads the episode, years later included, and it can't be targeted, rotated or stopped. It is counted by downloads of the episode.
- **Dynamically inserted (DAI).** The episode is published with marked ad positions (pre-roll, mid-rolls, post-roll), and the hosting server stitches ads into the file at download time, chosen for that request by geography, device, time and the feed's targeting. The same episode gets different ads for different listeners and different ads next month. DAI ads are counted by delivered bytes.
- **Host-read.** The host reads the advertiser's message, often in their own words. It can be baked-in (recorded with the episode) or recorded separately and inserted dynamically into chosen episodes and positions. Host-reads command higher prices because they carry the host's credibility, which is also why the FTC's Endorsement Guides apply: a host who presents a sponsor's product as their own experience is making an endorsement, and the material connection must be disclosed ([The Endorsement Guides](/books/commerce/acquisition-and-attribution#the-endorsement-guides)).

**Video podcasts.** The v2.3 guidelines "apply to both audio and video podcast episodes when distributed via open RSS feeds," and Spotify describes a partner program "offering creators audience-driven payouts for eligible video streaming of their content on our platform." Video episodes in apps behave like streaming video (client-side playback, video ad formats); video episodes over RSS are counted like audio downloads.

## Counting Podcast Downloads

IAB Tech Lab's Podcast Measurement Technical Guidelines are the industry's counting rules, at version 2.3 since September 2026 (versions 1.0 September 2016, 2.0 December 2017, 2.1 February 2021, 2.2 May 2024). The guidelines state the premise directly: episodes are downloaded for consumption, and "measurement is based on server logs." The rules that matter for a system that counts:

- **A download** is "a unique episode request that results in an episode being delivered to the podcast consumer's device." Partial downloads count only if they include the file's header information and "enough of the podcast content to play for 1 minute," a byte threshold computed per episode from its bitrate and ID3 size; episodes under a minute, or whose sizes can't be computed, count only complete downloads.
- **Uniqueness** uses IP address plus user agent: "A combination of IP Address + UA is used to identify unique podcast consumers and downloads." IPv6 addresses are truncated to their first 64 bits before combining.
- **Windows.** Repeated requests from the same IP and user agent for the same episode within a window count once. The guidelines describe three options: a fixed calendar day that "resets at a fixed time (e.g., 12:00am UTC) each day," a "first touch" rolling window (typically 24 hours from the first qualifying request) and a "last touch" rolling window that "extends and resets" with each request. The method in use is disclosed.
- **Request handling.** "Disregard any 2 byte (0-1 byte) range requests" (players probe with them); HEAD requests "should be excluded"; 304 responses "should not be counted."
- **Filtering** removes requests from "known bots, data centers, VPN traffic, or other non-human sources," plus known duplicates such as Apple Watch requests identified by user agent patterns, and podcast players are asked to register their user agents on IAB Tech Lab's Spiders and Bots list.
- **Podcast consumers** (v2.3 renames "listener") are "the unique combination of IP address and User Agent" over a stated period, with the caveat that IP changes double-count and shared IPs undercount.
- **Delivered ads.** An ad is delivered "as determined by filtered server logs for validated downloads," and a dynamically inserted ad counts only if "100% of the ad content (all bytes)" was downloaded.
- **Player behavior.** The guidelines ask apps not to "preload podcast episodes unless the intent was clearly to play the podcast," not to "automatically download all episodes (e.g. back catalog episodes) by default," and not to autoplay without implied intent, since each inflates downloads.
- **Compliance.** Companies can certify compliance through IAB Tech Lab's program; compliant hosts and measurement companies are listed by IAB Tech Lab.

The guidelines also distinguish two ways an ad play is known: server-side, "calculated based on server logs that provide information about what was served," and client-side, which "counts an ad that was able to prompt a tracking beacon from the client device when the file was played." Most RSS podcast ads are counted server-side; a client-side count needs the app's cooperation.

A counter that applies the rules to a day's log lines, first-touch windows, the one-minute threshold and the delivered-ad rule:

```go tab="Go"
type LogLine struct {
	At         time.Time
	Method     string // GET, HEAD
	Status     int
	IP         netip.Addr
	UA         string
	EpisodeID  string
	RangeStart int64 // byte range served; whole file is 0..size-1
	RangeEnd   int64
}

type Episode struct {
	ID             string
	MinBytes       int64             // header + one minute of audio, from bitrate and ID3 size
	SizeBytes      int64
	AdSpans        map[string][2]int64 // inserted ad ID -> [start, end] bytes in this rendition
}

type key struct{ who, episode string }

type window struct {
	start  time.Time
	spans  []([2]int64)
	counted bool
}

// who returns the IP+UA identity, with IPv6 truncated to its first 64 bits.
func who(l LogLine) string {
	ip := l.IP
	if ip.Is6() && !ip.Is4In6() {
		p, _ := ip.Prefix(64)
		ip = p.Addr()
	}
	return ip.String() + "|" + l.UA
}

type Counter struct {
	Episodes map[string]Episode
	IsBot    func(LogLine) bool // UA lists, data center and VPN ranges
	Window   time.Duration      // e.g. 24h, first touch
	open     map[key]*window
	Downloads int
	AdsDelivered map[string]int
}

func (c *Counter) Add(l LogLine) {
	if l.Method == "HEAD" || l.Status == http.StatusNotModified || c.IsBot(l) {
		return
	}
	if l.RangeStart == 0 && l.RangeEnd <= 1 {
		return // the 0-1 byte probe
	}
	ep, ok := c.Episodes[l.EpisodeID]
	if !ok {
		return
	}
	k := key{who(l), l.EpisodeID}
	w := c.open[k]
	if w == nil || l.At.Sub(w.start) >= c.Window {
		w = &window{start: l.At}
		c.open[k] = w
	}
	w.spans = append(w.spans, [2]int64{l.RangeStart, l.RangeEnd})
	if w.counted || covered(w.spans, 0, ep.MinBytes-1) < ep.MinBytes {
		return
	}
	w.counted = true
	c.Downloads++
	for adID, span := range ep.AdSpans {
		if covered(w.spans, span[0], span[1]) == span[1]-span[0]+1 {
			c.AdsDelivered[adID]++ // all bytes of the ad were delivered
		}
	}
}

// covered returns how many bytes of [from, to] the spans cover, without double counting.
func covered(spans [][2]int64, from, to int64) int64 {
	s := append([][2]int64(nil), spans...)
	sort.Slice(s, func(i, j int) bool { return s[i][0] < s[j][0] })
	var n, cur int64 = 0, from
	for _, r := range s {
		lo, hi := max(r[0], cur), min(r[1], to)
		if hi >= lo {
			n += hi - lo + 1
			cur = hi + 1
		}
	}
	return n
}
```

```rust tab="Rust"
use std::{collections::HashMap, net::IpAddr, time::Duration};

pub struct LogLine {
    pub at: std::time::SystemTime,
    pub method: String,
    pub status: u16,
    pub ip: IpAddr,
    pub ua: String,
    pub episode_id: String,
    pub range: (u64, u64), // inclusive byte range served
}

pub struct Episode {
    pub min_bytes: u64, // header + one minute of audio
    pub ad_spans: HashMap<String, (u64, u64)>,
}

struct Window { start: std::time::SystemTime, spans: Vec<(u64, u64)>, counted: bool }

fn who(l: &LogLine) -> String {
    let ip = match l.ip {
        IpAddr::V6(v6) if v6.to_ipv4_mapped().is_none() => {
            let s = v6.segments(); // keep the first 64 bits
            IpAddr::V6(std::net::Ipv6Addr::new(s[0], s[1], s[2], s[3], 0, 0, 0, 0))
        }
        other => other,
    };
    format!("{ip}|{}", l.ua)
}

fn covered(spans: &[(u64, u64)], from: u64, to: u64) -> u64 {
    let mut s = spans.to_vec();
    s.sort();
    let (mut n, mut cur) = (0, from);
    for (a, b) in s {
        let (lo, hi) = (a.max(cur), b.min(to));
        if hi >= lo {
            n += hi - lo + 1;
            cur = hi + 1;
        }
    }
    n
}

pub struct Counter<F: Fn(&LogLine) -> bool> {
    pub episodes: HashMap<String, Episode>,
    pub is_bot: F,
    pub window: Duration,
    open: HashMap<(String, String), Window>,
    pub downloads: u64,
    pub ads_delivered: HashMap<String, u64>,
}

impl<F: Fn(&LogLine) -> bool> Counter<F> {
    pub fn add(&mut self, l: &LogLine) {
        if l.method == "HEAD" || l.status == 304 || (self.is_bot)(l) || l.range == (0, 1) {
            return;
        }
        let Some(ep) = self.episodes.get(&l.episode_id) else { return };
        let k = (who(l), l.episode_id.clone());
        let fresh = match self.open.get(&k) {
            Some(w) => l.at.duration_since(w.start).map_or(false, |d| d >= self.window),
            None => true,
        };
        if fresh {
            self.open.insert(k.clone(), Window { start: l.at, spans: vec![], counted: false });
        }
        let w = self.open.get_mut(&k).unwrap();
        w.spans.push(l.range);
        if w.counted || covered(&w.spans, 0, ep.min_bytes - 1) < ep.min_bytes {
            return;
        }
        w.counted = true;
        self.downloads += 1;
        for (ad, &(a, b)) in &ep.ad_spans {
            if covered(&w.spans, a, b) == b - a + 1 {
                *self.ads_delivered.entry(ad.clone()).or_default() += 1; // all bytes delivered
            }
        }
    }
}
```

Two details matter in production. Ad spans differ per download in DAI, because each request got its own stitched file, so the counter needs the insertion record of that request, not the episode's template; and a window that stays open across midnight must still land its download on one reporting day, which is why the window method is part of the disclosed methodology.

## What a Download Is Worth

A download is not a listen, and podcast pricing reflects it: CPMs are quoted per thousand downloads (for baked-in and host-read spots) or per thousand delivered ads (for DAI), and buyers discount for the share of downloads never played. The guidelines' player rules (no preloading, no back-catalog auto-downloads) exist because those downloads inflate counts without listeners, and a host or network whose numbers jump after an app changes its download behavior is seeing that, not audience growth. Where a platform can report playback (streaming ad insertion inside an app, or an app that sends client-side beacons), the seller can offer impressions and listen-through, and the same buyer will compare the two numbers.

**Attribution.** Audio has no click, so podcast attribution matches downloads or plays to later visits by household IP address and user agent, or uses promo codes and vanity URLs read by the host. IP-based matching is pseudonymous, not anonymous, and falls under the same consent rules as any other use of IP addresses for advertising ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)); [Attribution](/books/advertising/attribution) covers methods and windows.

## Broadcast Radio

Radio spots are sold like television's. iHeartMedia's report says rates "are principally based on the length of the spot" and on audience size measured by ratings services; network radio sells programs with national personalities and syndication; traffic and weather inserts reach hundreds of stations. The records are the same as linear TV's (orders, a schedule, an as-run log, ratings posts against guarantees where there are guarantees), so [Linear TV, Upfronts & Addressable TV](/books/advertising/linear-tv-and-upfronts)'s `spot_airings` and `audience_guarantees` serve radio as well, with a station as the property.

## How to Build It

The core model holds a podcast or radio station as a `properties` row (`kind = 'podcast'` or `'channel'`), an audio creative as `creatives` with `format = 'audio'`, and delivery in `ad_events`. [VAST & Video Ads](/books/advertising/vast-and-video-ads) adds the universal ad ID; [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) adds counting policies with `inventory_type = 'audio'`. This chapter adds episodes with the byte thresholds counting needs, counted downloads, the dynamic insertions in each download, and host-read spots.

```sql
CREATE TABLE podcast_episodes (           -- one episode of a podcast property
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id       UUID NOT NULL REFERENCES properties (id),  -- kind 'podcast'
  guid              TEXT NOT NULL,         -- the RSS item GUID
  title             TEXT NOT NULL,
  published_at      TIMESTAMPTZ NOT NULL,
  media_kind        TEXT NOT NULL CHECK (media_kind IN ('audio', 'video')),
  duration_ms       INT NOT NULL,
  bitrate_kbps      INT NOT NULL,
  id3_bytes         INT NOT NULL DEFAULT 0,
  min_count_bytes   BIGINT NOT NULL,       -- header + one minute, per the guidelines; complete file if < 1 min
  ad_markers        JSONB NOT NULL DEFAULT '[]',  -- [{"pos":"pre"},{"pos":"mid","at_ms":1200000}]
  UNIQUE (property_id, guid)
);

CREATE TABLE podcast_downloads (          -- one counted download, after filtering and windowing
  id                UUID NOT NULL DEFAULT uuidv7(),
  counted_at        TIMESTAMPTZ NOT NULL,  -- when the threshold was reached
  episode_id        UUID NOT NULL,
  consumer_key      BYTEA NOT NULL,        -- keyed hash of IP (IPv6 /64) + user agent
  ua_family         TEXT NOT NULL,         -- the app, from the user agent
  window_method     TEXT NOT NULL CHECK (window_method IN ('calendar_day', 'first_touch',
                      'last_touch')),
  window_start      TIMESTAMPTZ NOT NULL,
  bytes_delivered   BIGINT NOT NULL,
  complete          BOOLEAN NOT NULL,
  country           CHAR(2),
  counting_policy_id UUID,                 -- the guidelines version and filters applied
  PRIMARY KEY (counted_at, id)
) PARTITION BY RANGE (counted_at);

CREATE TABLE dai_insertions (             -- an ad stitched into one download's file
  id                UUID NOT NULL DEFAULT uuidv7(),
  inserted_at       TIMESTAMPTZ NOT NULL,
  episode_id        UUID NOT NULL,
  request_ref       TEXT NOT NULL,         -- the hosting server's request ID
  consumer_key      BYTEA NOT NULL,
  position          TEXT NOT NULL CHECK (position IN ('pre', 'mid', 'post')),
  slot_index        SMALLINT NOT NULL,     -- order within the position's pod
  line_item_id      UUID NOT NULL,
  creative_id       UUID NOT NULL,
  byte_start        BIGINT NOT NULL,       -- where the ad sits in this stitched file
  byte_end          BIGINT NOT NULL,
  auction_id        UUID,                  -- when programmatic
  delivered         BOOLEAN,               -- all bytes downloaded; null until the window closes
  delivered_event_id UUID,                 -- the ad_events impression it became
  PRIMARY KEY (inserted_at, id),
  CHECK (byte_end > byte_start)
) PARTITION BY RANGE (inserted_at);

CREATE TABLE host_read_spots (            -- a host-read ad booked into episodes
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  line_item_id      UUID NOT NULL REFERENCES line_items (id),
  property_id       UUID NOT NULL REFERENCES properties (id),
  delivery          TEXT NOT NULL CHECK (delivery IN ('baked_in', 'dynamic')),
  episode_id        UUID REFERENCES podcast_episodes (id),  -- baked-in: the episode it was recorded in
  creative_id       UUID REFERENCES creatives (id),          -- dynamic: the recorded read
  position          TEXT NOT NULL CHECK (position IN ('pre', 'mid', 'post')),
  talking_points_ref TEXT NOT NULL,        -- the advertiser's brief the host read from
  approved_by_advertiser_at TIMESTAMPTZ,   -- script or recording approval
  disclosure        TEXT NOT NULL,         -- how the sponsorship was disclosed in the read
  host_uses_product BOOLEAN,               -- the endorsement claim, as the host made it
  guaranteed_downloads BIGINT,             -- what the spot was sold against, if guaranteed
  CHECK ((delivery = 'baked_in') = (episode_id IS NOT NULL))
);

ALTER TABLE ad_events ADD COLUMN measured_by TEXT;  -- 'server_log' or 'client_beacon', per the guidelines
ALTER TABLE ad_events ADD CONSTRAINT ad_events_measured_by_check
  CHECK (measured_by IN ('server_log', 'client_beacon')) NOT VALID;  -- on the parent; Postgres adds it to every partition
```

Design notes:

- **The threshold belongs to the episode.** One minute of audio is a byte count that depends on bitrate and ID3 size, so `min_count_bytes` is computed once at publish (and recomputed if the file changes), not guessed in the counter.
- **Downloads are counted rows, not log lines.** The raw logs stay in object storage with short retention; `podcast_downloads` records each counted download with the window method and the counting policy (guidelines version, filter lists) it was counted under, so a methodology change is visible in the data.
- **Consumers are hashed IP and user agent.** The guidelines' identity is pseudonymous personal data; it is hashed with a rotating key, kept as briefly as the reporting periods allow, and never joined to other identifiers without the consent that use needs.
- **A DAI ad is delivered only with all its bytes.** Each insertion records where the ad sits in that request's file, so delivery is decided per download against the bytes actually served, and only then becomes an `ad_events` impression with `measured_by = 'server_log'`.
- **Host-reads are endorsements with records.** The brief, the approval, the disclosure and whether the host claimed personal use are the facts an endorsement inquiry asks about; storing them with the booking costs little.
- **Baked-in delivery is the episode's downloads.** A baked-in spot has no insertion record; its delivery is the counted downloads of its episode over the period sold, which is why buyers of baked-in reads ask for a guarantee window.

## Auditing

- **How downloads were counted.** The guidelines version, the window method, the filter lists and their versions, and the episode thresholds, for every reporting period, so a buyer or a compliance audit can recompute.
- **What each download carried.** For DAI, every insertion with its line item, creative, position and byte span, and whether it was delivered; for baked-in and host-read spots, the episode and the period.
- **What the host said.** For each host-read, the brief, the approval and the disclosure, kept as long as the episode is available.
- **Who could be identified.** Retention and key rotation for consumer keys, and any attribution joins made on IP addresses, with the consent they relied on.

## What This Means for the System You Build

- **Count podcast downloads by IAB Tech Lab's v2.3 rules:** one-minute byte thresholds per episode, IP plus user agent with IPv6 truncated, a disclosed window, probes, HEAD and 304s excluded, bots, data centers and VPNs filtered.
- **Count a dynamically inserted ad only when all its bytes were delivered,** from that download's own insertion record.
- **Record whether each ad event came from server logs or a client beacon,** and offer playback-based metrics only where the app reports them.
- **Treat host-reads as endorsements:** keep the brief, approval and disclosure with the booking.
- **Plan for auctions in audio:** OpenRTB audio objects, pods, deals and supply chain files, since spend is moving to biddable channels.
- **Hash and expire the IP and user agent keys** that podcast measurement depends on.

## References

**Specifications**

- [IAB Tech Lab: Podcast Measurement Technical Guidelines v2.3 (GitHub)](https://github.com/IABTechLab/Podcast-Technical-Measurement/blob/main/PTM-Guidelines_v2.3.md), download definition, one-minute partial rule, IP and user agent uniqueness, IPv6 truncation, windows, range, HEAD and 304 handling, filtering, delivered ads and the 100% rule, player behavior, video over RSS, server-side and client-side ad plays
- [IAB Tech Lab: Podcast Measurement Guidelines](https://iabtechlab.com/standards/podcast-measurement-guidelines/), version history from 1.0 (2016) to 2.3 (September 2026), the compliance program, measurement based on server logs
- [IAB Tech Lab: OpenRTB 2.6](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the Audio object and pod fields
- [MRC: Standards and guidelines](https://mediaratingcouncil.org/standards-and-guidelines), Digital Audio Measurement Standards including podcasting, January 2018

**Filings**

- [iHeartMedia: Annual Report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1400891/000162828026013221/ihrt-20251231.htm), podcasting revenue, downloads and streams per Podtrac, spot pricing by length and ratings, network radio, the Triton Audio Marketplace, Katz Media
- [SiriusXM: Annual Report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/908937/000090893726000006/siri-20251231.htm), Pandora advertising, AdsWizz, SiriusXM Media's monthly listeners, the SiriusXM Podcast Network, Pandora monthly active users
- [Spotify Technology: Annual Report on Form 20-F for 2025](https://www.sec.gov/Archives/edgar/data/1639920/000162828026006874/ck0001639920-20251231.htm), Ad-Supported revenue and its share, ad-supported MAUs, fixed-CPM declines and automated channel growth, streaming ad insertion for podcasts, the Spotify Partner Program, the Spotify Ad Exchange

**In practice**

- [Spotify: Spotify tunes up platform for advertisers (April 2, 2025)](https://newsroom.spotify.com/2025-04-02/spotify-tunes-up-platform-to-make-it-easy-for-advertisers-to-buy-create-and-measure/), the Spotify Ad Exchange through The Trade Desk and DV360
- [Spotify Advertising: Spotify Audience Network](https://ads.spotify.com/en-US/spotify-audience-network/), the audio-first marketplace on and off Spotify, Megaphone for publishers
