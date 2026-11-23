+++
title = "Ads in Games"
description = "Game ad formats from the platform side: rewarded and interstitial ads, playables, intrinsic in-game measurement, signed reward callbacks and kids' games."
category = "Advertising Industry"
order = 2953
part = "Channels"
tags = ["advertising", "games", "rewarded-ads", "playables", "intrinsic-in-game", "data-model"]
+++

Games are the largest in-app ad inventory and the largest in-app buyers at the same time. A free-to-play mobile game earns from players who watch a rewarded video for extra lives, see an interstitial between levels, or tap a playable ad for another game; and it grows by buying those same ads in other games, because the cheapest players to acquire are people who already play games. Beyond mobile, ads appear inside game worlds themselves: a billboard beside a race track, a poster in a stadium, a branded object in a lobby, rendered by the game engine as part of the scene. Each of these has its own format, its own counting rule and its own trust problem.

It is hard because games turn ads into game mechanics. A rewarded ad is a transaction: the player gives attention and the game gives an item, so the ad platform's completion event becomes a grant in the game's economy, and a forged or replayed completion is counterfeit currency. A playable ad is a small game shipped as an HTML bundle inside someone else's game. An intrinsic in-game ad is a texture on a 3D object that may be half off screen, at an angle, behind another car. And many games are played by children, which brings the strictest privacy law and store policy in the volume to bear on every ad call.

This chapter covers game ad formats from the ad platform's side (rewarded, rewarded interstitial, interstitial, playables, offerwalls and intrinsic in-game), signed server-side reward callbacks as the network builds and delivers them, playable ads as creatives, intrinsic in-game measurement under the IAB/MRC guidelines, and ads in children's games (COPPA, Google Play's Families policy and Apple's Kids Category). It extends `ad_events` and `properties` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and adds reward callbacks and in-game surfaces. Ownership is split with the Gaming volume: it owns the game's side (the reward grant as a ledger transaction, the verification endpoint on the game's server, ad placement as game design, and mobile user acquisition economics) in [Ad Mediation and Rewarded Ads](/books/gaming/mobile-games#ad-mediation-and-rewarded-ads), [Ads in Mobile Games](/books/gaming/monetization#ads-in-mobile-games) and [CPI, ROAS and Payback](/books/gaming/mobile-games#cpi-roas-and-payback); this chapter owns the network and platform side. Mediation, in-app bidding and impression-level revenue are [In-App Advertising & Mediation](/books/advertising/in-app-advertising); format definitions in general are [Ad Formats & Standards](/books/advertising/ad-formats).

## How the Platforms Do It

As of November 2026, from each company's documentation and the published guidelines. Rows are the game ad formats and the rules each platform publishes for them.

| Format | What the player experiences | Platform rules, by their own pages |
| --- | --- | --- |
| **Interstitial** | A full-screen ad at a break, dismissed by the player | Apple 2.5.18: must "clearly indicate that they are an ad" and have "easily accessible and visible close/skip buttons"; Google Play Families bans interstitials "displayed immediately upon app launch" in children's apps |
| **Intrinsic in-game** | An ad on an object in the game world, part of the scene | IAB/MRC Intrinsic In-Game Advertising Measurement Guidelines 2.0 (August 2022): 50% of the creative visible for one continuous second (two for video), at least 1.5% of the screen, a recommended angle no greater than 55 degrees per axis, polling every 200 ms |
| **Playable** | A short interactive demo of another game, usually ending in an install button | Google Ads: a ZIP "with a maximum size of 5MB and no more than 512 files," relative paths only, no sound before interaction, `ExitApi.exit()` or an MRAID equivalent for the call to action |
| **Rewarded** | The player opts in to watch and receives an item | AdMob: rewards granted on server-side verification callbacks signed with ECDSA; Gaming covers MAX's and LevelPlay's callbacks |
| **Rewarded interstitial** | A rewarded ad shown at a transition without an opt-in, after an intro screen | AdMob: the intro screen must state the reward and offer "A clear, unobstructed option to skip the ad before it starts"; "Only skippable ads will be served" |

The rows share one design principle: the closer an ad is to gameplay, the more the platform specifies how it may interrupt, how it may be closed and how it is counted, because each of those is where players are tricked or numbers are inflated.

## Rewarded Ads

A rewarded ad is the format games prefer because the player chooses it. Google's definition: "Rewarded ads allow you to reward users with in-app items for interacting with video ads, playable ads, and surveys." The flow:

1. The game offers a reward at a moment it designs (a continue after failing, a double-coins button).
2. The player accepts; the mediation SDK shows the ad it pre-loaded.
3. The network decides the reward is earned (the video completed, or the playable reached its end state) and fires two things: a client-side callback to the SDK, and a **server-side verification (SSV) callback** from the network's servers to the game's server.
4. The game's server verifies the callback and grants the reward; the client's callback only updates the UI.

The rule for both sides is that the reward is earned on the network's signed word, not the client's. A client that says "I watched the ad, give me 50 coins" can be replayed or forged; a network's signed callback keyed by a unique transaction ID can be verified and granted once. The game's verification endpoint and the grant as a ledger transaction are the Gaming volume's ([Ad Mediation and Rewarded Ads](/books/gaming/mobile-games#ad-mediation-and-rewarded-ads)); what follows is what the network has to build.

**What AdMob sends.** AdMob's SSV callback carries `ad_network`, `ad_unit`, `custom_data`, `key_id`, `reward_amount`, `reward_item`, `signature`, `timestamp`, `transaction_id` and `user_id`. Parameters arrive in alphabetical order, with `signature` and `key_id` always last, in that order; the signature is ECDSA with SHA-256 over the query parameters before `signature`, and "Content from the SSV callback should not be modified in any way (including keeping the order of query parameters)." The game fetches public keys from a published key file and selects one by `key_id`; "public keys should not be cached for longer than 24 hours," because keys rotate on a variable schedule. The app sets the user ID and custom data on the ad before showing it, and "If no user identifier is provided by the app, this query parameter will not be present." If the game's server doesn't answer with 200 OK, "Google will re-attempt to send SSV callbacks up to five times in one-second intervals."

**What a network must build.** The same contract, from the sending side:

- **A signed, canonical message.** The network decides the parameter order, signs the exact bytes it sends, and never re-encodes them in transit, so the receiver can verify without guessing. Asymmetric signatures (ECDSA, as AdMob uses) mean the receiver holds only a public key; shared-secret hashes (the MD5 and SHA-1 tokens other mediation platforms use, per the Gaming volume) mean every game holds a secret that can sign forgeries if it leaks.
- **Key rotation with overlap.** New keys are published before they sign anything, old keys stay published until every callback signed with them has been delivered or expired, and the key ID travels in the message.
- **One transaction ID per earned reward,** generated once and reused on every retry, so the receiver's idempotency key is stable ([Idempotency](/docs/requests/idempotency)).
- **At-least-once delivery from an outbox.** The completion is recorded and the callback queued in the same transaction, then delivered with retries on a schedule the documentation states, because a callback lost between the network and the game is a player who watched an ad for nothing ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).
- **Fast-answer expectations.** Receivers are told to answer quickly and grant asynchronously; the sender times out and retries rather than waiting.
- **A test tool.** AdMob offers a testing tool in its UI and a reference verifier (Tink's `RewardedAdsVerifier`), and suggests confirming callbacks come from Google by reverse DNS. A network without a test path ships games with untested reward endpoints.

The sending side, signing a callback and delivering it with retries:

```go tab="Go"
type RewardEvent struct {
	TransactionID string // generated once when the reward is earned; stable across retries
	AdNetwork     string
	AdUnit        string
	RewardItem    string
	RewardAmount  int
	UserID        string // only if the app set one
	CustomData    string
	EarnedAt      time.Time
	CallbackURL   string // the game's SSV endpoint
}

type Signer struct {
	KeyID string
	Key   *ecdsa.PrivateKey // P-256; the public half is published under KeyID before first use
}

// Query builds the exact parameter order, signs those bytes, and appends signature and key_id, last, in that order.
func (s Signer) Query(e RewardEvent) (string, error) {
	parts := []string{
		"ad_network=" + url.QueryEscape(e.AdNetwork),
		"ad_unit=" + url.QueryEscape(e.AdUnit),
	}
	if e.CustomData != "" {
		parts = append(parts, "custom_data="+url.QueryEscape(e.CustomData))
	}
	parts = append(parts,
		"reward_amount="+strconv.Itoa(e.RewardAmount),
		"reward_item="+url.QueryEscape(e.RewardItem),
		"timestamp="+strconv.FormatInt(e.EarnedAt.UnixMilli(), 10),
		"transaction_id="+url.QueryEscape(e.TransactionID),
	)
	if e.UserID != "" {
		parts = append(parts, "user_id="+url.QueryEscape(e.UserID))
	}
	msg := strings.Join(parts, "&")
	digest := sha256.Sum256([]byte(msg))
	sig, err := ecdsa.SignASN1(rand.Reader, s.Key, digest[:]) // DER-encoded
	if err != nil {
		return "", err
	}
	return msg + "&signature=" + base64.RawURLEncoding.EncodeToString(sig) + "&key_id=" + s.KeyID, nil
}

// Deliver sends one queued callback; the outbox worker calls it until it returns true or the event expires.
func Deliver(ctx context.Context, c *http.Client, e RewardEvent, query string) (delivered bool, status int) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, e.CallbackURL+"?"+query, nil)
	resp, err := c.Do(req)
	if err != nil {
		return false, 0 // retry later with the same query: same transaction_id, same signature
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK, resp.StatusCode
}
```

```rust tab="Rust"
use p256::ecdsa::{signature::Signer as _, DerSignature, SigningKey};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use std::time::Duration;

pub struct RewardEvent {
    pub transaction_id: String, // stable across retries
    pub ad_network: String,
    pub ad_unit: String,
    pub reward_item: String,
    pub reward_amount: u32,
    pub user_id: Option<String>,
    pub custom_data: Option<String>,
    pub earned_at_ms: i64,
    pub callback_url: String,
}

pub struct Signer {
    pub key_id: String,
    pub key: SigningKey, // P-256; public key published under key_id before first use
}

fn enc(s: &str) -> String {
    url::form_urlencoded::byte_serialize(s.as_bytes()).collect()
}

impl Signer {
    pub fn query(&self, e: &RewardEvent) -> String {
        let mut parts = vec![format!("ad_network={}", enc(&e.ad_network)),
                             format!("ad_unit={}", enc(&e.ad_unit))];
        if let Some(c) = &e.custom_data { parts.push(format!("custom_data={}", enc(c))); }
        parts.push(format!("reward_amount={}", e.reward_amount));
        parts.push(format!("reward_item={}", enc(&e.reward_item)));
        parts.push(format!("timestamp={}", e.earned_at_ms));
        parts.push(format!("transaction_id={}", enc(&e.transaction_id)));
        if let Some(u) = &e.user_id { parts.push(format!("user_id={}", enc(u))); }
        let msg = parts.join("&");
        let sig: DerSignature = self.key.sign(msg.as_bytes()); // ECDSA P-256 with SHA-256, DER
        format!("{msg}&signature={}&key_id={}", URL_SAFE_NO_PAD.encode(sig.as_bytes()), self.key_id)
    }
}

/// One delivery attempt; the outbox worker retries with the same query until 200 or expiry.
pub async fn deliver(client: &reqwest::Client, e: &RewardEvent, query: &str) -> (bool, u16) {
    let res = client
        .get(format!("{}?{}", e.callback_url, query))
        .timeout(Duration::from_secs(5))
        .send()
        .await;
    match res {
        Ok(r) => (r.status().as_u16() == 200, r.status().as_u16()),
        Err(_) => (false, 0),
    }
}
```

The query is computed once, stored with the outbox row and resent byte for byte, so a retry after a key rotation still verifies against the key that signed it, which is why old keys stay published until their callbacks drain.

**Reward integrity on the network's side.** The network decides "earned," so its rules are the reward's rules: a video counts as complete per its counting policy (a skipped or backgrounded video doesn't), a playable's end state is defined in the creative spec, and invalid traffic filtering applies before the callback, not after. A completion later found invalid is removed from billing, but the reward has been granted; networks don't claw back game items, so the cost of rewarded fraud lands on the advertiser unless it's caught before the callback. [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud) covers the detection.

## Interstitials and Placement Rules

Interstitials earn more per impression than banners and annoy more per impression than anything. The stores' rules are the floor: Apple's guideline 2.5.18 requires interstitials to identify themselves as ads, not "manipulate or trick users into tapping into them," and provide visible close or skip buttons; Google Play's Families policy, for apps reaching children, bans interstitials at app launch, ads that interfere with normal use "that are not closeable after 5 seconds" (rewarded or opt-in ads included), multiple ad placements on a page, and "Deceptive ads that force the user to click-through by using a dismiss button to trigger another ad." [Ad Formats & Standards](/books/advertising/ad-formats) covers the Better Ads Standards that govern interstitials on the web.

Two counting rules from the MRC's mobile application guidelines matter most in games, because games pre-load interstitials to show them instantly: a pre-loaded interstitial counts only after the code that "chooses to display it" runs, or "only ... when displayed/visible," never at load. [In-App Advertising & Mediation](/books/advertising/in-app-advertising) covers app counting in general.

## Playables

A playable ad is an interactive demo that lets a player try a game before installing it, usually 15 to 60 seconds of a simplified level ending with an install button. For the ad system, a playable is an HTML5 creative with tighter rules than display:

- **Packaging.** Google Ads takes a ZIP "with a maximum size of 5MB and no more than 512 files," with all code and assets referenced by relative path; external references are limited to Google Fonts, Google-hosted jQuery, GreenSock and CreateJS; local storage and expandable ads aren't supported.
- **Orientation and layout.** Declared with a meta tag; the asset must be responsive because it renders full screen across device sizes.
- **Sound.** Supported, but "Sound should not be enabled before the user interacts with a Playable ad."
- **Exit.** The call to action calls `ExitApi.exit()` (or an MRAID equivalent); if it doesn't, Google adds an "Install" button.

Other networks publish their own playable specs, and most accept MRAID-based single-file or zipped HTML; a studio producing one playable for several networks builds to the strictest common subset and validates against each network's checker. In this volume's model a playable is a `creatives` row of format `rich_media` with an `ad_formats` entry carrying its size and request limits ([Ad Formats & Standards](/books/advertising/ad-formats) owns `ad_formats`), and its "complete" event is the end state the creative defines, which is also what a rewarded playable's reward depends on.

## Offerwalls

An offerwall is a list of tasks (install an app and reach level 10, complete a survey, sign up for a trial) that each pay a reward in the game's currency. The advertiser pays per completed action, so the network's completion signal is a conversion, typically from a mobile measurement partner's postback, and the reward follows the same signed-callback pattern as rewarded video, with longer delays (days, for "reach level 10"). The fraud surface is the conversion, not the view, so offerwall integrity is attribution integrity ([Mobile Measurement Partners](/books/advertising/mobile-measurement-partners) covers postbacks and fraud tools). The economics and design of offerwalls in a game's economy are the Gaming volume's.

## Intrinsic In-Game Advertising

Intrinsic in-game ads are part of the game world: a billboard texture, a jersey, a poster in a lobby. They are seen while the player plays, not instead of playing, which makes them unobtrusive and hard to measure, because "visible" in a 3D scene depends on distance, angle, occlusion and motion.

The IAB, IAB Tech Lab and MRC published the **Intrinsic In-Game Advertising Measurement Guidelines 2.0** in August 2022 (first released September 2009). An intrinsic impression is "the measurement of an advertising exposure occurrence within a gaming environment being played by a Client-User (device)," sourced from "a properly functioning (not crashed, frozen or otherwise corrupted) game application." The viewable impression rules:

- **Pixels, then time.** At least 50% of the intended creative visible "from the game player's perspective or on the game player's screen," and that condition held for "one continuous second, post ad render" for display, or "2 continuous seconds" of video meeting the same pixel requirement. The clock starts only once the pixel threshold is met.
- **Screen share.** "The ad must be a minimum of 1.5% of screen coverage to be considered viewable," measured on the visible portion of the ad.
- **Angle.** Where angles can be measured on X, Y and Z, the guidelines recommend "an ad angle no greater than 55 degrees for any one coordinate (on an absolute basis)," with combined-axis distortion an area for further study.
- **Polling.** Measurers sample visibility every "200 milliseconds (ms) for both Display and Video ads," which "equates to five and ten consecutive positive observations" for display and video, with guidance allowing a majority-of-observations approach (at least three of five polls in a second) for partial occlusions.
- **Disclosure and IVT.** The ad unit's physical attributes and placement in the game are disclosed to the buyer, and impressions are filtered for invalid activity.

What this means for the game engine integration: the SDK computes, every 200 ms, each ad surface's projected screen area, the share of its pixels unoccluded by other geometry and UI, and its angle to the camera, and emits a viewable impression when the thresholds hold for the required continuous time. The participants listed on the guidelines include intrinsic in-game vendors (AdInMo, Admix, Frameplay) alongside agencies, verification vendors and publishers; the vendors' own integration details are in their SDK documentation.

Intrinsic ads are also where game ratings and brand suitability meet: an ad on a billboard in a mature-rated shooter needs the same suitability controls as a video next to violent content, and a children's game needs the rules below.

## Children's Games

Many games are directed to children or have mixed audiences, and the rules are the strictest in the volume. The general law is in the playbook ([The 2025 Amendments](/docs/compliance/childrens-privacy#the-2025-amendments) to the COPPA Rule, compliance due April 22, 2026, require separate verifiable parental consent before disclosing a child's data to third parties, including for targeted advertising), and [Children, Teens & Advertising](/books/advertising/children-and-teens) covers the ad-specific law. The platform rules a game's ad stack must implement:

- **Google Play Families policy.** If an app's target audience is only children, "you must use only Families self-certified ads SDK versions"; mixed-audience apps must screen ages and make sure ads to children "come exclusively from Google Play self-certified ads SDK versions." Ads to children or users of unknown age must not involve interest-based advertising or remarketing, must be appropriate for children, and must follow the Families ad format rules above.
- **Apple Kids Category.** "Apps in the Kids Category should not include third-party analytics or third-party advertising," with a narrow exception: "Third-party contextual advertising may also be permitted in limited cases provided that the services have publicly documented practices and policies for Kids Category apps that include human review of ad creatives for age appropriateness." Kids Category apps "may not send personally identifiable information or device information to third parties."
- **SDK signals.** The ad SDK must receive and pass the child-directed state on every request. AdMob's (now deprecated in favor of an age-restricted treatment setting) child-directed tag is a COPPA setting under which Google takes "steps to disable IBA and remarketing ads on that ad request" and prevents transmission of the Android advertising ID; a separate under-age-of-consent tag for EEA users (deprecated the same way) disables personalized advertising and "requests to third-party ad vendors, such as ad measurement pixels and third-party ad servers"; and a maximum ad content rating (G, PG, T, MA) limits the creative's rating. OpenRTB carries the child-directed state as `regs.coppa`, set from the property's `child_directed` flag in the core model.

The decision of who is a child belongs to the game's backend, which holds the age band from its age screen, not to an ad SDK's guess ([Ratings, Age & Children](/books/gaming/ratings-and-age)). The ad platform's job is to treat a child-directed or unknown-age request as contextual only, with no identifiers sent to any partner, a creative category and rating filter, and only partners certified for children.

## How to Build It

The core model already has `ad_events.kind = 'reward'` and `properties.child_directed`; [In-App Advertising & Mediation](/books/advertising/in-app-advertising) adds mediation instances and impression-level revenue; [Viewability & Attention](/books/advertising/viewability-and-attention) adds `viewability_measurements` and `viewability_standards`; [Ad Formats & Standards](/books/advertising/ad-formats) adds `ad_formats` (where playable specs live as rows); [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) adds counting policies. This chapter adds the network's outbound reward callbacks and the in-game surfaces intrinsic ads render on.

```sql
CREATE TABLE reward_callbacks (           -- the network's signed SSV callback for one earned reward
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  transaction_id      TEXT NOT NULL UNIQUE, -- generated once; the receiver's idempotency key
  reward_event_id     UUID NOT NULL,        -- the ad_events row of kind 'reward'
  reward_event_at     TIMESTAMPTZ NOT NULL,
  property_id         UUID NOT NULL REFERENCES properties (id),
  ad_unit_id          UUID NOT NULL REFERENCES ad_units (id),
  callback_url        TEXT NOT NULL,        -- as configured for the ad unit at the time
  reward_item         TEXT NOT NULL,
  reward_amount       INT NOT NULL CHECK (reward_amount > 0),
  app_user_ref        TEXT,                 -- the app-set user ID, passed through; null if not set
  key_id              TEXT NOT NULL,        -- the signing key
  signed_query        TEXT NOT NULL,        -- the exact bytes sent; resent unchanged on retry
  attempts            SMALLINT NOT NULL DEFAULT 0,
  last_status         SMALLINT,             -- HTTP status of the last attempt; 0 for a network error
  next_attempt_at     TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ NOT NULL, -- stop retrying after the documented schedule
  status              TEXT NOT NULL CHECK (status IN ('queued', 'delivering', 'delivered',
                        'expired', 'suppressed')),  -- suppressed: invalid traffic found before sending
  CHECK (status <> 'delivered' OR delivered_at IS NOT NULL)
);

CREATE INDEX reward_callbacks_due_idx ON reward_callbacks (next_attempt_at)
  WHERE status IN ('queued', 'delivering');

CREATE TABLE signing_keys (               -- keys published for receivers to verify callbacks
  key_id          TEXT PRIMARY KEY,
  algorithm       TEXT NOT NULL CHECK (algorithm IN ('ecdsa_p256_sha256')),
  public_key_pem  TEXT NOT NULL,
  published_at    TIMESTAMPTZ NOT NULL,   -- before first use
  signs_from      TIMESTAMPTZ NOT NULL,
  signs_until     TIMESTAMPTZ,            -- null: current
  unpublish_after TIMESTAMPTZ,            -- after every callback it signed is delivered or expired
  CHECK (signs_from >= published_at)
);

CREATE TABLE ingame_surfaces (            -- an object in a game world that renders intrinsic ads
  ad_unit_id        UUID PRIMARY KEY REFERENCES ad_units (id),  -- the surface is an ad unit
  scene_ref         TEXT NOT NULL,        -- level, map or scene in the game build
  object_ref        TEXT NOT NULL,        -- the game object or material slot
  aspect_w          SMALLINT NOT NULL,
  aspect_h          SMALLINT NOT NULL,
  media             TEXT NOT NULL CHECK (media IN ('display', 'video')),
  min_screen_share_bp INT NOT NULL DEFAULT 150,   -- 1.5% of the screen, in basis points
  max_angle_deg     SMALLINT NOT NULL DEFAULT 55, -- per axis
  poll_interval_ms  SMALLINT NOT NULL DEFAULT 200,
  min_visible_ms    INT NOT NULL,         -- 1000 display, 2000 video
  game_rating       TEXT,                 -- the game's age rating where the surface appears
  disclosed_to_buyers JSONB NOT NULL DEFAULT '{}',  -- placement description per the guidelines
  CHECK (min_visible_ms >= CASE media WHEN 'video' THEN 2000 ELSE 1000 END)
);
```

Design notes:

- **The callback is an outbox row.** The reward event and its `reward_callbacks` row are written in one transaction when the network decides a reward is earned; a worker delivers due rows, resending `signed_query` unchanged, so retries are byte-identical and the receiver's deduplication on `transaction_id` is enough.
- **Suppression happens before sending.** Invalid traffic checks run between the completion and the first attempt; a suppressed callback is a record that the network chose not to grant, which matters when a developer asks why players complained.
- **Keys outlive their signing window.** `signing_keys` keeps a key published until every callback it signed has resolved, so a callback queued during an outage still verifies when it finally arrives.
- **The user ID is the app's, passed through.** The network doesn't interpret it, and it is absent when the app didn't set one; it never becomes a network identifier.
- **In-game surfaces are ad units with geometry rules.** Each surface carries the guidelines' thresholds as columns, so the SDK's measurement and the buyer's disclosure come from the same row, and a surface in a mature-rated scene can be excluded from children's and brand-sensitive demand.
- **Playables are formats, not tables.** Their size and file limits are `ad_formats` rows per network, so creative QA checks a playable against every network it will run on.

## Auditing

- **Every reward the network owed.** Each earned reward with its transaction ID, the signed query, every delivery attempt and status, and suppressions with their reasons, kept as long as developers can dispute.
- **Which key signed what.** Key publication, signing windows and retirement, so any callback can be verified years later against the key that signed it.
- **How intrinsic impressions were decided.** The surface's thresholds, the measurement SDK version, and the viewability measurements per impression, for an accreditation audit or a buyer's challenge.
- **What a child-directed request received.** The COPPA and age signals on the request, which partners were called, which identifiers were removed, and the creative's rating, so a regulator's question about one child's ad can be answered.

## What This Means for the System You Build

- **Grant rewards only on signed server-side callbacks,** with one transaction ID per reward reused on every retry.
- **Sign the exact bytes you send, with asymmetric keys,** publish keys before use and keep them published until their callbacks drain.
- **Deliver callbacks from an outbox with a documented retry schedule** and suppress before sending when traffic is invalid.
- **Count pre-loaded interstitials at display** and follow the stores' close-button and placement rules as product requirements.
- **Validate playables against each network's spec** as `ad_formats` rows.
- **Measure intrinsic in-game ads by the guidelines:** 50% of pixels for one second (two for video), 1.5% of the screen, 55 degrees per axis, polled every 200 ms.
- **Treat child-directed and unknown-age requests as contextual only,** with certified partners, no identifiers, and a creative rating filter, decided by the game's age record.

## References

**Specifications**

- [IAB, IAB Tech Lab and MRC: Intrinsic In-Game Advertising Measurement Guidelines 2.0 (August 2022, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/In-Game%20Advertising%20Measurement%20Guidelines%2008-31-22.pdf), the impression definition, pixel and time requirements, 1.5% screen coverage, the 55-degree angle rule, 200 ms polling, participants
- [IAB, MMA and MRC: Mobile Application Advertising Measurement Guidelines (October 2017, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/Mobile%20In-App%20Measurement%20Guidelines%20%28MMTF%20Final%20v1.1%29.pdf), counting pre-loaded interstitials at display

**In practice**

- [Apple: App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), interstitial rules in 2.5.18, Kids Category rules in 1.3 and 5.1.4
- [Google Play: Families policies](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en), self-certified ads SDKs, no interest-based ads or remarketing to children, ad format rules including the five-second close rule and launch interstitials
- [Google AdMob: Rewarded ads (Android)](https://developers.google.com/admob/android/rewarded), the rewarded-ad definition
- [Google AdMob: Server-side verification callbacks (Android)](https://developers.google.com/admob/android/ssv), callback parameters, ECDSA SHA-256 signatures, unmodified parameter order, key rotation and 24-hour caching, retries, test tool and reverse DNS
- [Google AdMob: Targeting (Android)](https://developers.google.com/admob/android/targeting), child-directed treatment and its deprecation, under age of consent, maximum ad content rating
- [Google AdMob: Rewarded interstitial ad units](https://support.google.com/admob/answer/9884467?hl=en), the intro screen, skip option and skippable-only rule
- [Google Ads: HTML5 and playable ads for App campaigns](https://support.google.com/google-ads/answer/9981650?hl=en), ZIP size and file limits, relative paths, permitted external libraries, sound after interaction, ExitApi
