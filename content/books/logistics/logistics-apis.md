+++
title = "Logistics APIs & Standards"
nav_title = "APIs & Standards"
description = "Carrier and visibility APIs from the integrator's side: LTL and rail APIs, NMFTA eBOL and DSDC standards, DCSA, ONE Record, webhooks, feeds, credentials."
category = "Logistics & Supply Chain Industry"
order = 2835
part = "Data and Visibility"
tags = ["logistics", "apis", "webhooks", "ebol", "dcsa", "one-record", "integrations", "data-model"]
+++

For decades freight data moved as EDI; it now moves as EDI and APIs together. An LTL carrier publishes REST endpoints for quotes, bills of lading, pickups, tracking and documents; a railroad publishes shipment, action and exception APIs behind a letter of authority; a visibility network takes a shipper's loads by API and pushes milestones, positions and exceptions back to a webhook; a telematics vendor exposes a feed of every truck's positions that the integrator polls with a cursor. Industry bodies have started writing the APIs down as standards: NMFTA's Digital LTL Council published an electronic bill of lading standard that "over 70 affiliates" support, its Digital Standards catalog now covers truckload booking, visibility and invoicing, the Digital Container Shipping Association defines ocean APIs, and IATA made ONE Record "the preferred data-sharing standard for air cargo from 1 January 2026."

It is hard because an API integration is a long-lived connection to someone else's system, and freight multiplies them. A broker can integrate with many carriers, more than one visibility network and its shippers' TMSs; each has its own authentication, rate limits, retry behavior, payload shapes and deprecation schedule, and each is a door into a customer's data that someone must have authorized. The messages also arrive the hard way: late, twice, out of order, signed in a provider's own scheme, or not at all when a webhook endpoint was down for an hour.

This chapter covers carrier APIs (LTL, rail and parcel from the integrator's side), the standards bodies and what each has published, connections and credentials, visibility networks, receiving webhooks, polling feeds, and change. It extends `documents`, `shipment_events`, `parties` and `loads` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). The generic integration engineering is the playbook's: the connection as a record, token storage and refresh, sync strategies and rate limits ([Integrations](/docs/building-blocks/integrations)), and webhook signing, retries and replay ([Webhooks](/docs/api-design/webhooks)). The X12 equivalents of these exchanges are [Transportation EDI](/books/logistics/transportation-edi); what the events become is [Visibility & Tracking](/books/logistics/visibility-and-tracking) and [ETAs & Exception Management](/books/logistics/etas-and-exceptions); the shipper's parcel carrier APIs (rate shopping, labels) are the Commerce volume's [Carrier APIs](/books/commerce/shipping-and-carriers#carrier-apis).

## How the Platforms Do It

As of November 2026, from developer portals, published specifications and standards bodies' catalogs:

| Platform | What it exposes | Authentication and delivery, as documented | Rules worth knowing |
| --- | --- | --- | --- |
| **Estes Express Lines** (LTL carrier) | RouteGuides (transit), Rate Quote, Reserve PRO, BOL, Pickup, Shipment Tracking, Images, Subscription | Client ID and secret by Basic auth to `POST /v1/api-key`, then the API key plus MyEstes credentials to `/authenticate` for a bearer token; both sent on every call; separate test and production hosts | The BOL API "complies with version 2.0.1 of the DLC BOL standard"; subscriptions for pickup and shipment events instead of polling; invoice subscription not self-serve |
| **UPS** (parcel carrier) | OpenAPI specifications on GitHub for Rating, Shipping, Tracking, TimeInTransit, Pickup, Paperless, DangerousGoods, LandedCost, Locator, QuantumView, Track Alert and others | Separate `OAuthClientCredentials` and `OAuthAuthCode` specifications | Specifications published as YAML in a public repository; Track Alert specifications beside Tracking |
| **Union Pacific** (railroad) | Shipment API ("real-time information on your shipment's location and ETAs"), Action API ("release equipment, order-in rail cars or create intermodal terminal reservations"), Cases API ("when shipments are off course") | Developer registration through UP's portal | "Third-parties must have an active Letter of Authority with Union Pacific"; "Third-party management will be performed by Transentric" |
| **project44** (visibility network) | All modes "through a single API, using a unified data structure" | Webhooks to a URL the customer sets "when registering your webhook" | Unified payload of events, positions, states and exceptions; the legacy truckload payload: "It is recommended to not use this way of ingesting data" |
| **Samsara** (telematics) | Fleet, vehicle and equipment APIs, location and stats feeds, webhooks | API access tokens, 150 requests per second per token and 200 per organization; webhooks signed with HMAC SHA-256 | A 429 carries `Retry-After`; non-2xx webhook answers are retried "a total of 5 times" with exponential backoff |
| **Geotab** (telematics) | `GetFeed` for each entity type (positions as `LogRecord`, duty status, diagnostics, trips and more) | Polling with version tokens | "The server does not track your position"; save the token only after processing |
| **Motive** (telematics) | Users, Vehicles, Vehicle Gateway (ELD Devices), Groups, HOS Logs, Locations, Messaging, Inspection Reports, IFTA Reports, Fault Codes, Driver Performance, Webhooks | Documented in its API reference | Webhooks listed as a category |
| **DCSA** (ocean standard) | Track & Trace 2.2 events and event subscriptions; Booking; Bill of Lading | Subscriber's `callbackUrl`, a shared secret that computes a `Notification-Signature` header, 204 to accept | Track & Trace 2.2.0 is public on SwaggerHub; the standards also include Arrival Notice, Port Call, Commercial Schedules and others |
| **NMFTA Digital Standards** (LTL and truckload standards) | LTL eBOL 2.1, Pickup Request and Visibility, Preliminary Freight Charges, In-Transit Visibility; truckload Appointment Scheduling, eBOL, Invoice and Documentation, In-Transit Visibility, Rate/Quote, Book and Tender | Specifications, implemented by each carrier and platform | The LTL eBOL is developed by the Digital LTL Council |

Four patterns:

- **Every connection is authorized twice.** The API credential proves who is calling; something else proves the caller may see this customer's freight: Estes's MyEstes user credentials beside the API key, Union Pacific's letter of authority, a carrier's consent to share its trucks with a visibility network. Both belong on the connection record, with their dates.
- **Networks push, telematics is polled.** Visibility networks, DCSA and carrier subscription APIs deliver to the subscriber's endpoint; telematics bulk data (Geotab's `GetFeed`, Samsara's feeds) is read with a cursor. My default is to build both for any provider that offers both, each with a reconciliation path for what the other missed.
- **Standards arrive as APIs, adoption arrives carrier by carrier.** The DLC eBOL went from a pledge in October 2022 to over 70 affiliates; ONE Record became IATA's preferred standard on January 1, 2026; DCSA's Track & Trace 2.2.0 is a public specification that each carrier implements on its own schedule. An integrator supports the standard and every carrier's deviation from it.
- **The payload is a report, not the truth.** project44 orders events ascending inside a payload but says its `states` have no guaranteed order, positions "may be down-sampled," Geotab's duty status logs are "likely to be edited on a frequent basis," and webhooks are retried. Ingestion keeps the raw payload and applies it to the timeline by event time, never by arrival order.

## Carrier APIs

Parcel carriers have the oldest and broadest APIs, and the shipper's integration with them (rate shopping, labels, tracking for a merchant) is the Commerce volume's [Carrier APIs](/books/commerce/shipping-and-carriers#carrier-apis), including the USPS and FedEx API migrations of 2026. From the logistics side the parcel APIs are one more set of connections and tracking sources; UPS's public specifications show the breadth, from Rating and Shipping through Pickup, Paperless documents, DangerousGoods and LandedCost to Tracking and Track Alert.

**LTL carriers** publish the quote-to-cash cycle as APIs. Estes's catalog is representative: transit times between points (RouteGuides), a rate quote, a block of PRO numbers reserved ahead of shipping (Reserve PRO), an electronic bill of lading (BOL), pickup requests with create, update, delete and status (Pickup), status, history, ETAs and GPS coordinates (Shipment Tracking), document images as Base64 or URLs (Images), and event notifications for pickups and shipments (Subscription). Each call maps onto the core model: a quote is a `rate_agreements` row of kind `spot_quote` with its `lane_rates`, a reserved PRO is a [PRO reservation](/books/logistics/ltl-networks#how-to-build-it), the eBOL creates the shipment's bill of lading `documents` row and sets `shipments.pro_number`, tracking becomes `shipment_events` with source `api`, and images become `documents` of kind `bill_of_lading`, `delivery_receipt` or `proof_of_delivery`.

**The eBOL standard** is why LTL APIs look alike. The Digital LTL Council, part of NMFTA, announced its eBOL standard on October 24, 2022 with 29 companies pledging to "develop and fully operationalize the eBOL with at least one business partner or 3PL" no later than July 20, 2023. Version 2.1, posted March 21, 2024, added update and delete keyed on the PRO number, nine-digit postal codes, optional `trailerid` and `manifestid` references, an optional weight unit, carriers' terms and conditions in responses, a returned `scac`, standardized numeric `resultsStatusCodes`, and a requirement that returned PRO and barcode images include check digits; NMFTA called the update "completely compatible with the existing versions." Old Dominion counted "over 70 affiliates" on the standardized eBOL API in September 2024 and cited the Council's estimate of 2% to 4% savings per shipment at full adoption. Carriers implement different versions (Estes states 2.0.1), so the version is per carrier connection.

**Truckload carriers** take tenders through the 204 and 990 of [Transportation EDI](/books/logistics/transportation-edi#the-204-load-tender), through APIs and portals, and by email and phone, and most shippers and brokers use several channels at once ([Tendering & Acceptance](/books/logistics/tendering)); NMFTA's truckload standards (below), at version 1.1.0, are the attempt to make the API channel alike. **Railroads** expose APIs to shippers they already serve: Union Pacific's Shipment, Action and Cases families cover tracking with ETAs, equipment release, car orders and intermodal terminal reservations, and exceptions, behind developer registration and, for third parties, a letter of authority ([Waybills, Interchange and Car Events](/books/logistics/rail-freight#waybills-interchange-and-car-events)).

Integration rules for carrier APIs:

- **A write is idempotent or it is a duplicate shipment.** A BOL or pickup request that times out may have been created; retry with the same shipment reference and look it up before creating again, because two pickups are two trucks ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)). Reserved PROs exist so the identifier is known before the call.
- **Test and production are different credentials and hosts.** Estes issues "one each for test and production" and publishes separate hosts; the connection records which environment it is, and nothing in test may reach a production carrier.
- **The carrier's identifiers are data.** A PRO from an eBOL response, a pickup confirmation number, a document image ID: each is stored as the carrier issued it, scoped to that carrier.

## Standards Bodies

Three bodies publish the API standards freight integrations are converging on, one per mode family, and each maps onto an EDI set it supplements:

| Body | Standard, as published | Covers | Closest EDI |
| --- | --- | --- | --- |
| **NMFTA Digital Standards** (LTL) | eBOL 2.1 | Creating, updating and deleting bills of lading | 211 |
| | Pickup Request and Visibility 1.0.0 | "digital scheduling and real-time tracking of shipment pickups," including delay reasons | 216 |
| | Preliminary Freight Charges 1.0.0 | Notice of new or updated charges, "including accessorial additions and reweighs," before invoicing | None (ahead of the 210) |
| | In-Transit Visibility 1.0.0 | Milestones, exception notifications, terminal updates and customs status for international shipments | 214 |
| **NMFTA Digital Standards** (truckload) | Appointment Scheduling 1.1.0 | Requesting, confirming, modifying and cancelling appointments | None |
| | eBOL 1.1.0 | Exchanging electronic bills of lading | 211 |
| | Invoice and Documentation 1.1.0 | Carrier invoices with PODs and BOLs attached | 210 |
| | In-Transit Visibility 1.1.0 | Status, milestones and location updates | 214 |
| | Rate/Quote 1.1.0 | Requesting and exchanging truckload pricing | None |
| | Book and Tender 1.1.0 | "digitally reserving capacity and formally tendering truckload shipments," with accept or reject responses | 204, 990 |
| **DCSA** (ocean) | Track & Trace, Booking, Bill of Lading, Arrival Notice and others (13 standards, as of November 2026) | Container shipping events, bookings, electronic bills of lading | 315, 300, 301, 304, 310 |
| **IATA ONE Record** (air) | Data model and API | "a single record view of the shipment," shared through "standardized and secured web API" | Cargo-IMP and Cargo-XML messages |

The pickup and visibility standard was released March 4, 2025; NMFTA's catalog page has an inconsistency on the truckload eBOL (a 1.1.0 heading over body text that says "Version 1.0"), which is the kind of thing an integrator confirms with each carrier rather than assumes.

**DCSA's** Track & Trace 2.2 is the public reference for ocean events: query them, or subscribe with a `callbackUrl` and a shared secret that is "used to compute the contents of the Notification-Signature header," the subscriber answering 204 "if it accepts the callback," and a `PUT .../secret` call that "Resets the Secret on an existing subscription." Its event types, classifiers (planned, estimated, actual) and codes are [Ocean Shipping](/books/logistics/ocean-shipping)'s subject.

**ONE Record** takes a different shape from both EDI and a typical REST API: a common data model in JSON-LD, data that "stays at the source" with the owner deciding who may read it, and "an industrywide and federated trust network" for identifying and authenticating systems, so a forwarder, airline and ground handler read and update one shipment record instead of sending each other messages. IATA's December 2025 survey found over 70% of respondents aware of it and nearly 50% indicating readiness; how its events map from the FSU status messages is [Air Cargo](/books/logistics/air-cargo)'s subject.

My rule for all three: implement the standard as the canonical shape of the connection, map each partner's deviations as configuration, and keep the EDI path alive until the partner retires it, because every mode will run both for years.

## Connections and Credentials

Each integration is a connection: one party's link to one provider account, with its credentials, scopes, environment, rate limit budget, status and history ([A Connection Is a Record](/docs/building-blocks/integrations#a-connection-is-a-record)). Freight adds three things the generic record doesn't have:

- **The authorization to see someone else's freight.** A broker reading a railroad's API for a shipper needs the shipper's authority (Union Pacific's letter of authority), a shipper reading a carrier's trucks through a visibility network needs the carrier's consent, and a 3PL using a customer's carrier account acts under that customer's agreement. The authorizing party, the document and its validity go on the connection, and an expired authority stops the connection the way an expired token does.
- **Layered credentials.** Estes needs an API key from a client ID and secret, then MyEstes user credentials, then a bearer token, and rotates the client secret when the key is issued ("This new Client Secret replaces the secret sent in the previous e-mail"). Credentials are stored encrypted and refreshed without racing ([Storing Tokens](/docs/building-blocks/integrations#storing-tokens), [Refresh Without Racing](/docs/building-blocks/integrations#refresh-without-racing)); a user credential belongs to a service account, not a person who will leave.
- **The provider is a party.** A carrier, a visibility network, a telematics vendor and an EDI network are rows in `parties`, so a connection, its events and its invoices point at the same organization, and the provider's own identifiers for this system's records (a project44 shipment ID, a Samsara vehicle ID) live in `external_refs` keyed by provider.

Rate limits are a shared budget. Samsara's limits are per token and per organization ("200 API requests per second" shared across all of an organization's tokens, with lower per-endpoint limits) and its 429 carries a `Retry-After` such as `0.40235` seconds; several workers polling for one customer must share one limiter keyed by the provider account, not each keep their own ([Their Rate Limits Are Your Budget](/docs/building-blocks/integrations#their-rate-limits-are-your-budget), [Handling a 429](/docs/requests/rate-limiting#handling-a-429)).

## Visibility Networks

A visibility network sits between the parties who want to see freight (shippers, brokers, 3PLs) and the sources that know where it is (carriers' ELDs and telematics, drivers' phones, carriers' 214s and APIs, ocean and air carriers' events). The integrator's side of it is a request and a stream:

1. **Create the tracking.** The shipper or broker sends the load (stops, appointment windows, carrier and an equipment identifier; project44's are listed in [How the Platforms Do It](/books/logistics/visibility-and-tracking#how-the-platforms-do-it)) to the network's API, or the network reads it from the TMS. The network's shipment ID is stored in the load's `external_refs`.
2. **The network finds the source.** It connects to the carrier's telematics if the carrier has authorized it, asks the driver's app, or uses the carrier's own EDI or API feed; the method, and when tracking started and ended, are the visibility chapter's tracking session ([Tracking Sessions](/books/logistics/visibility-and-tracking#tracking-sessions)).
3. **Updates come back.** project44 pushes to a webhook whose "actual webhook URL is defined by you," in a unified payload with `events`, `positions`, `states` and `exceptions`, events "in ascending order by the date the event occurred" and positions that "may be down-sampled."
4. **The integrator maps them.** Each event type becomes a `shipment_events` row through the provider's entries in [Partner Code Maps](/books/logistics/transportation-edi#partner-code-maps), with source `api`, the provider's own event ID kept for deduplication, and both of the provider's clocks: when the event happened and when the provider received it, plus when this system received it (`dateTime` and `receivedDateTime` appear in project44's sample payload, which doesn't define them).

FourKites' official API documentation could not be reached publicly for this chapter, and the material describing its callbacks is third-party, so this chapter doesn't describe them. <!-- source-gap: logistics-logistics-apis-fourkites | missing | FourKites API authentication, callback types and delivery behavior | closes with: a public FourKites developer or help-center page describing its API and callbacks | checked: 2026-11-22 -->

Three rules for using a network:

- **The network is a source, not the record.** Its milestones are evidence alongside the carrier's 214 and the facility's gate log, kept with its source and resolved by the same precedence rules ([One Timeline Across Sources](/books/logistics/visibility-and-tracking#one-timeline-across-sources)).
- **Its exceptions are inputs.** A network's exception (`category`, `reason`, `status` in project44's payload) opens or updates an exception in this system through a rule; it doesn't replace the rule ([Exceptions](/books/logistics/etas-and-exceptions#exceptions)).
- **Two networks are two maps.** A broker whose shippers each mandate a different network maps each network's codes separately and keeps one timeline per load.

## Receiving Webhooks

The playbook's receiving rules apply as written: verify before parsing, store the raw event in an inbox under the provider's event ID, acknowledge fast, process from a queue, never trust order ([Receiving Their Webhooks](/docs/building-blocks/integrations#receiving-their-webhooks), [Consumer Expectations](/docs/api-design/webhooks#consumer-expectations)). The logistics providers show why each rule is there:

- **Every scheme is different.** Samsara signs `v1:<timestamp>:<body>` with HMAC SHA-256 using a secret that "is Base64 encoded" and must be decoded before use, sends it in `X-Samsara-Signature` with a `v1=` prefix and the time in `X-Samsara-Timestamp`, and warns that the `User-Agent` "should not be used to verify the request." DCSA signs with a per-subscription secret into `Notification-Signature`. Verification is per provider, from the raw bytes, in constant time ([Verifying](/docs/api-design/webhooks#verifying)).
- **Retries are finite.** Samsara treats any non-2xx answer as an error and tries "a total of 5 times" with exponential backoff, then stops sending that notification, and may treat a webhook whose handler never returns 2xx as inactive and disable it. An hour of downtime loses events for good unless a poll reconciles them, so every webhook source has a reconciliation query behind it.
- **The answer must be quick and plain.** Samsara asks for a 2xx "as soon as you have verified the contents of the alert," with longer work in a background job, and doesn't follow redirects; DCSA expects a 204. Verification, the inbox insert and the answer are the whole request.
- **Duplicates are normal.** A retried delivery repeats the event; Samsara's body carries an `eventId` and its headers an `X-Samsara-Request`, project44's documentation gives no deduplication guidance, so the inbox key is the provider's ID where it has one and a hash of the provider, subject, type and event time where it doesn't.

A receiver that does exactly that, using Samsara's scheme as the example:

```go tab="Go"
// Samsara-style verification: HMAC-SHA256 over "v1:<timestamp>:<raw body>",
// secret Base64-encoded, signature in X-Samsara-Signature as "v1=<hex>".
func (h *Receiver) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		http.Error(w, "read", http.StatusBadRequest)
		return
	}
	ts := r.Header.Get("X-Samsara-Timestamp")
	sig, ok := strings.CutPrefix(r.Header.Get("X-Samsara-Signature"), "v1=")
	if !ok || !h.fresh(ts) || !h.valid(ts, body, sig) {
		http.Error(w, "signature", http.StatusUnauthorized)
		return
	}
	var env struct {
		EventID string `json:"eventId"`
	}
	if err := json.Unmarshal(body, &env); err != nil || env.EventID == "" {
		http.Error(w, "payload", http.StatusBadRequest)
		return
	}
	// The inbox insert is the only work done in the request; a repeat is a no-op.
	_, err = h.db.ExecContext(r.Context(), `
		INSERT INTO inbound_webhook_deliveries
		  (connection_id, provider_event_id, signature_verified, payload, received_at)
		VALUES ($1, $2, TRUE, $3, NOW())
		ON CONFLICT (connection_id, provider_event_id) DO NOTHING`,
		h.connectionID, env.EventID, body)
	if err != nil {
		http.Error(w, "retry", http.StatusServiceUnavailable) // the provider retries
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Receiver) valid(ts string, body []byte, sigHex string) bool {
	got, err := hex.DecodeString(sigHex)
	if err != nil {
		return false
	}
	for _, secret := range h.secrets { // current and previous, during a rotation
		mac := hmac.New(sha256.New, secret) // secret already Base64-decoded
		mac.Write([]byte("v1:" + ts + ":"))
		mac.Write(body)
		if hmac.Equal(mac.Sum(nil), got) {
			return true
		}
	}
	return false
}

func (h *Receiver) fresh(ts string) bool {
	sec, err := strconv.ParseInt(ts, 10, 64)
	if err != nil {
		return false
	}
	d := time.Since(time.Unix(sec, 0))
	return d < 5*time.Minute && d > -5*time.Minute
}
```

```rust tab="Rust"
use axum::{body::Bytes, extract::State, http::{HeaderMap, StatusCode}};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::time::{SystemTime, UNIX_EPOCH};

type HmacSha256 = Hmac<Sha256>;

pub struct Receiver {
    pub secrets: Vec<Vec<u8>>, // current and previous, Base64-decoded
    pub connection_id: uuid::Uuid,
    pub db: sqlx::PgPool,
}

/// Samsara-style verification: HMAC-SHA256 over "v1:<timestamp>:<raw body>".
pub async fn receive(State(h): State<std::sync::Arc<Receiver>>, headers: HeaderMap, body: Bytes)
    -> StatusCode {
    let ts = headers.get("X-Samsara-Timestamp").and_then(|v| v.to_str().ok()).unwrap_or("");
    let sig = headers.get("X-Samsara-Signature").and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("v1=")).and_then(|v| hex::decode(v).ok());
    let Some(sig) = sig else { return StatusCode::UNAUTHORIZED };
    if !fresh(ts) || !h.secrets.iter().any(|s| valid(s, ts, &body, &sig)) {
        return StatusCode::UNAUTHORIZED;
    }
    let event_id = serde_json::from_slice::<serde_json::Value>(&body).ok()
        .and_then(|v| v.get("eventId").and_then(|e| e.as_str()).map(str::to_owned));
    let Some(event_id) = event_id else { return StatusCode::BAD_REQUEST };
    // The inbox insert is the only work done in the request; a repeat is a no-op.
    let res = sqlx::query(
        "INSERT INTO inbound_webhook_deliveries
           (connection_id, provider_event_id, signature_verified, payload, received_at)
         VALUES ($1, $2, TRUE, $3, NOW())
         ON CONFLICT (connection_id, provider_event_id) DO NOTHING")
        .bind(h.connection_id).bind(&event_id).bind(body.as_ref())
        .execute(&h.db).await;
    match res {
        Ok(_) => StatusCode::NO_CONTENT,
        Err(_) => StatusCode::SERVICE_UNAVAILABLE, // the provider retries
    }
}

fn valid(secret: &[u8], ts: &str, body: &[u8], sig: &[u8]) -> bool {
    let mut mac = HmacSha256::new_from_slice(secret).expect("any key length");
    mac.update(format!("v1:{ts}:").as_bytes());
    mac.update(body);
    mac.verify_slice(sig).is_ok() // constant-time comparison
}

fn fresh(ts: &str) -> bool {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs() as i64);
    match (ts.parse::<i64>(), now) {
        (Ok(t), Ok(n)) => (n - t).abs() < 300,
        _ => false,
    }
}
```

The five-minute window and the two-secret rotation are the playbook's rules, not Samsara's ([Verifying](/docs/api-design/webhooks#verifying)). A worker then reads the inbox in order of `received_at`, maps each payload into `shipment_events` and the other owning tables, and marks the row processed; a mapping bug is fixed by replaying the inbox, not by asking the provider to resend ([Replay](/docs/api-design/webhooks#replay)).

## Polling Feeds

Telematics bulk data is pulled, and Geotab's documentation states the rules any feed consumer needs:

- **The cursor is the consumer's.** "Each GetFeed response includes a `toVersion` token," passed back as `fromVersion`; "The server does not track your position," so the cursor lives in this system, per connection and entity type.
- **Save the cursor after the work, not before.** "Saving the checkpoint first can skip records permanently when processing fails." The batch's records and the new cursor commit in one transaction, and processing is idempotent so a replayed batch is harmless.
- **Poll adaptively.** If a response is full, "call GetFeed again immediately"; if partial, wait briefly; if empty, back off until data appears. A fixed interval is too slow when a fleet comes online and wasteful at night.
- **Scope costs time.** A feed user without Company Group access "may trigger the 180-second timeout," so feed users are scoped as the provider recommends and the timeout is a handled case.
- **Records change after they arrive.** Geotab's duty status, DVIR, annotation and shipment logs are "likely to be edited on a frequent basis"; an edited record "will retain its original unique GUID" with a higher version, so ingestion upserts by the provider's ID and keeps the version, and the ELD chapter's rule of keeping every version applies ([ELDs & Telematics](/books/logistics/electronic-logging-devices#how-to-build-it)).

Samsara's feed endpoints run under their own limits (`GET fleet/vehicles/locations/feed` at 50 requests per second per organization) inside the organization-wide budget. Positions from feeds go to the playbook's high-rate `positions` table, not to `shipment_events`; only the milestones derived from them are promoted ([A Position Is a Measurement](/docs/building-blocks/location-tracking#a-position-is-a-measurement), [Where Positions Come From](/books/logistics/visibility-and-tracking#where-positions-come-from)).

## When Providers Change

Most providers in this chapter have a change in flight or behind it: the parcel carriers' 2026 API migrations ([Carrier APIs](/books/commerce/shipping-and-carriers#carrier-apis)), Samsara's endpoint-level rate limits that took effect October 23, 2023 and its plan to deprecate Webhooks 1.0 in favor of Webhooks 2.0 ("This deprecation date has not been decided on yet"), project44 steering integrations away from its legacy truckload payload, and the DLC eBOL's move to 2.1 in March 2024. The playbook's rules hold: pin the version on the connection, watch the provider's changelog, run the new version beside the old under a flag, and cut over connection by connection ([When They Change Their API](/docs/building-blocks/integrations#when-they-change-their-api)). A freight-specific addition: a provider change is a partner change for every customer whose loads flow through it, so it is scheduled outside peak season and tested against real multi-stop loads in the provider's sandbox ([Sandboxes and Testing](/docs/building-blocks/integrations#sandboxes-and-testing)).

## How to Build It

The playbook's `connections` table becomes a logistics `partner_connections` keyed by party rather than tenant, with the authority that permits the connection and the standard version it speaks; an inbox holds every webhook delivery as received; feed cursors live per connection and entity. `shipment_events` gains the provider's event ID and the connection it came through; `loads` gains `external_refs` for the networks' shipment IDs, keyed by provider party; `documents` records which connection carried an API payload; `parties` gets an index over the providers' identifiers. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE partner_connections (       -- one party's link to one provider account
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id        UUID NOT NULL REFERENCES parties (id),  -- whose connection it is
  provider_party_id     UUID NOT NULL REFERENCES parties (id),  -- the carrier, network or vendor
  kind                  TEXT NOT NULL CHECK (kind IN ('carrier_api', 'visibility_network',
                          'telematics', 'rail_api', 'ocean_api', 'air_api', 'edi_network',
                          'tms', 'other')),
  environment           TEXT NOT NULL CHECK (environment IN ('test', 'production')),
  external_account_id   TEXT NOT NULL,   -- their id for this account
  standard              TEXT,            -- 'dlc_ebol', 'dcsa_tnt', 'one_record', or null
  standard_version      TEXT,            -- '2.0.1', '2.2.0', as the provider implements it
  auth_kind             TEXT NOT NULL CHECK (auth_kind IN ('oauth_client_credentials',
                          'oauth_authorization_code', 'api_key', 'api_key_and_user',
                          'basic', 'shared_secret')),
  credentials_ref       TEXT NOT NULL,   -- a secrets-manager reference, never the secret
  access_expires_at     TIMESTAMPTZ,
  authorized_by_party_id UUID REFERENCES parties (id),  -- the shipper or carrier whose data it is
  authority_document_id UUID REFERENCES documents (id), -- a letter of authority, a consent
  authority_valid_during TSTZRANGE,
  rate_limit            JSONB NOT NULL DEFAULT '{}',    -- the provider's published limits
  webhook_secret_refs   TEXT[] NOT NULL DEFAULT '{}',   -- current and previous during rotation
  status                TEXT NOT NULL CHECK (status IN ('pending_authority', 'active',
                          'needs_reconnect', 'authority_expired', 'revoked', 'disabled')),
  status_reason         TEXT,
  last_success_at       TIMESTAMPTZ,
  last_error_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_party_id, provider_party_id, environment, external_account_id),
  CHECK ((authority_document_id IS NULL) = (authority_valid_during IS NULL))
);

CREATE TABLE inbound_webhook_deliveries (  -- every delivery, as received, before processing
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  connection_id      UUID NOT NULL REFERENCES partner_connections (id),
  provider_event_id  TEXT NOT NULL,      -- theirs, or a hash of subject, type and event time
  signature_verified BOOLEAN NOT NULL,
  headers            JSONB,              -- the provider's delivery and timestamp headers
  payload            BYTEA NOT NULL,     -- the raw body, as signed
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at       TIMESTAMPTZ,
  attempts           INT NOT NULL DEFAULT 0,
  error              TEXT,
  UNIQUE (connection_id, provider_event_id)
);
CREATE INDEX inbound_webhook_deliveries_pending ON inbound_webhook_deliveries (received_at)
  WHERE processed_at IS NULL;

CREATE TABLE feed_cursors (              -- where a polling feed stopped, per entity type
  connection_id  UUID NOT NULL REFERENCES partner_connections (id),
  entity         TEXT NOT NULL,          -- 'LogRecord', 'DutyStatusLog', 'vehicles/locations'
  cursor         TEXT,                   -- toVersion or the provider's page token
  last_batch_size INT,
  next_poll_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- adaptive: now when full, later when empty
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- committed with the batch it follows
  PRIMARY KEY (connection_id, entity)
);

ALTER TABLE shipment_events
  ADD COLUMN connection_id       UUID,   -- the connection it arrived through
  ADD COLUMN provider_event_id   TEXT,   -- the provider's own event ID
  ADD COLUMN provider_received_at TIMESTAMPTZ;  -- when the provider learned it, if stated
ALTER TABLE shipment_events ADD CONSTRAINT shipment_events_connection_fkey
  FOREIGN KEY (connection_id) REFERENCES partner_connections (id) NOT VALID;

ALTER TABLE loads
  ADD COLUMN external_refs JSONB NOT NULL DEFAULT '{}';  -- network shipment IDs, by provider party

ALTER TABLE documents
  ADD COLUMN connection_id UUID;         -- for API payloads and pulled images
ALTER TABLE documents ADD CONSTRAINT documents_connection_fkey
  FOREIGN KEY (connection_id) REFERENCES partner_connections (id) NOT VALID;

CREATE UNIQUE INDEX CONCURRENTLY shipment_events_provider_event_idx
  ON shipment_events (connection_id, provider_event_id)
  WHERE provider_event_id IS NOT NULL;
CREATE INDEX CONCURRENTLY parties_external_refs_idx
  ON parties USING gin (external_refs jsonb_path_ops);
ALTER TABLE shipment_events VALIDATE CONSTRAINT shipment_events_connection_fkey;
ALTER TABLE documents VALIDATE CONSTRAINT documents_connection_fkey;
```

The reconciliation that keeps a finite-retry webhook honest, for each connection that pushes:

```sql
-- Loads in transit on a pushing connection with no event from it for 4 hours
-- (4 hours, 30 days and 1 day in these queries are my illustrative defaults, not provider rules)
SELECT l.id, l.number, pc.provider_party_id, max(e.received_at) AS last_event
FROM loads l
JOIN partner_connections pc ON pc.owner_party_id = l.owner_party_id
                           AND pc.kind = 'visibility_network' AND pc.status = 'active'
LEFT JOIN shipment_events e ON e.load_id = l.id AND e.connection_id = pc.id
WHERE l.status = 'in_transit'
  AND l.external_refs ? pc.provider_party_id::text   -- tracked on this network
GROUP BY l.id, l.number, pc.provider_party_id
HAVING max(e.received_at) IS NULL OR max(e.received_at) < NOW() - interval '4 hours';
-- each row becomes a pull from the provider's API for that load
```

And the connections needing a person, before a customer notices:

```sql
SELECT pc.id, p.display_name AS provider, pc.status, pc.status_reason,
       upper(pc.authority_valid_during) AS authority_expires, pc.last_success_at
FROM partner_connections pc
JOIN parties p ON p.id = pc.provider_party_id
WHERE pc.environment = 'production'
  AND (pc.status IN ('needs_reconnect', 'authority_expired', 'pending_authority')
       OR upper(pc.authority_valid_during) < NOW() + interval '30 days'
       OR pc.last_success_at < NOW() - interval '1 day')
ORDER BY pc.status, authority_expires NULLS LAST;
```

Design notes:

- **Inbox, then map, then apply.** A delivery is verified and stored before anything else; the worker maps it through `partner_code_maps` into owning tables and marks it processed, so a mapping fix replays from the inbox ([Receiving Their Webhooks](/docs/building-blocks/integrations#receiving-their-webhooks)).
- **Three clocks on an API event.** `occurred_at` from the provider's event time, `provider_received_at` when the provider got it, `received_at` when this system did; a network's latency and the carrier's latency are different scorecards.
- **Authority is a state.** A connection whose letter of authority or carrier consent lapses moves to `authority_expired` and stops reading, even with a valid token.
- **Credentials are references.** `credentials_ref` and `webhook_secret_refs` point at a secrets manager; the table never holds a secret ([Storing Tokens](/docs/building-blocks/integrations#storing-tokens)).
- **One limiter per provider account.** Workers draw from a shared budget keyed by the connection, sized from `rate_limit` and slowed by every `Retry-After`.
- **Standards are attributes, not code paths.** `standard` and `standard_version` say what the connection speaks; deviations are map entries, so a carrier on eBOL 2.0.1 and one on 2.1 run through one implementation.
- **Events.** `connection.authorized`, `connection.needs_reconnect`, `connection.authority_expiring`, `webhook.delivery_failed` and `feed.stalled` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the integration support queue.

## Auditing

- **Every delivery as received,** with its headers, signature result, raw payload and processing outcome, so "we sent you the delivery at 14:05" can be checked against what arrived and when.
- **Every connection's history:** who authorized it, under which letter of authority or consent, its environment, standard version and status changes.
- **Every pulled document** (BOL images, PODs, invoices) with the connection it came through and its hash, as for any document in [Auditing](/books/logistics/logistics-business#auditing).
- **Feed cursors and their batches,** so a gap in a telematics record can be traced to a cursor that moved without its batch.
- **Who looked.** API access to a carrier's positions is access to drivers' locations, logged as the playbook's location rules require ([Consent, Law and Retention](/docs/building-blocks/location-tracking#consent-law-and-retention)).

## What This Means for the System You Build

- **Treat each integration as a connection record** with credentials, environment, standard version, rate limit, status and the authority to see the data.
- **Make every write to a carrier idempotent** on your shipment reference, and reserve identifiers (PROs) before the call where the carrier offers it.
- **Implement the standards (DLC eBOL, NMFTA, DCSA, ONE Record) as the canonical shape,** with each provider's deviations as configuration.
- **Verify webhooks per provider from the raw bytes,** store them in an inbox under the provider's event ID, answer 2xx fast, and process from the inbox.
- **Reconcile every push source with a pull,** because retries are finite and endpoints go down.
- **Keep feed cursors yourself and commit them with the batch,** poll adaptively, and upsert edited records by the provider's ID and version.
- **Share one rate limit budget per provider account** across workers, honoring `Retry-After`.
- **Keep three clocks on API events** and score providers on their own latency.
- **Plan provider deprecations as partner changes,** tested in the sandbox and cut over connection by connection.

## References

**Standards**

- [NMFTA Digital Standards: API catalog](https://dsdc.nmfta.org/apis), the LTL eBOL 2.1, Pickup Request and Visibility 1.0.0, Preliminary Freight Charges 1.0.0 and In-Transit Visibility 1.0.0, the truckload Appointment Scheduling, eBOL, Invoice and Documentation, In-Transit Visibility, Rate/Quote and Book and Tender 1.1.0 standards, and the eBOL version inconsistency
- [NMFTA: Digital LTL Council establishes new industry standard for electronic bills of lading](https://nmfta.org/news/digital-ltl-council-establishes-new-industry-standard-for-electronic-bills-of-lading-seeks-widespread-adoption/), the October 24, 2022 announcement, the pledge, 29 companies and the July 20, 2023 deadline
- [NMFTA: Digital LTL Council releases eBOL 2.1](https://nmfta.org/in-response-to-industry-feedback-digital-ltl-council-releases-ebol-2-1/), the March 21, 2024 release, its changes and compatibility
- [NMFTA: Digital LTL Council releases new API standards for pickup requests and visibility](https://nmfta.org/news/digital-ltl-council-releases-new-api-standards-for-pickup-requests-and-visibility/), the March 4, 2025 release
- [DCSA: Track & Trace 2.2.0 specification](https://api.swaggerhub.com/apis/dcsaorg/DCSA_TNT/2.2.0), event subscriptions, the callback URL, the shared secret and Notification-Signature header, the 204 answer and the secret reset
- [DCSA: Standards](https://dcsa.org/standards), the 13 standards, including Booking, Bill of Lading, Arrival Notice, Port Call, Commercial Schedules and Track & Trace
- [IATA: ONE Record](https://www.iata.org/en/programs/cargo/e/one-record/), the single record view, the web API, JSON-LD, data at the source and the federated trust network
- [IATA: Industry survey on ONE Record (December 10, 2025)](https://www.iata.org/en/pressroom/2025-releases/2025-12-10-02/), the preferred standard from January 1, 2026 and the awareness and readiness figures

**Carriers**

- [Estes Express Lines: Developer portal](https://developer.estes-express.com/), the API products, the authentication flow, test and production hosts, DLC BOL 2.0.1 compliance and the subscription API
- [Old Dominion Freight Line: Single-standard eBOLs](https://www.odfl.com/us/en/resources/freight-knowledge/odfl-blog/single-standard-ebols-july-2023.html), over 70 affiliates, eBOL 2.1 and the Council's 2% to 4% savings estimate, posted September 9, 2024
- [UPS: API documentation repository](https://github.com/UPS-API/api-documentation), the published OpenAPI specifications including Tracking, Track Alert and the OAuth flows
- [Union Pacific: API developer resources](https://www.up.com/shipping/resources/api-developer), the Shipment, Action and Cases APIs, the letter of authority and Transentric

**Visibility and telematics**

- [project44: Shipment webhook data](https://developers.project44.com/api-reference/api-docs/shipment-webhook-data), the customer-defined webhook URL, the unified and legacy payloads, event ordering, down-sampled positions and event fields
- [project44: Shippers guide](https://developers.project44.com/guides/shippers), all modes through a single API with a unified data structure
- [Samsara: Rate limits](https://developers.samsara.com/docs/rate-limits), per-token, per-organization and endpoint limits, the October 23, 2023 effective date, 429 and Retry-After
- [Samsara: Webhooks](https://developers.samsara.com/docs/webhooks), the signature scheme, headers, Base64 secret, retries, expected responses, event IDs and the Webhooks 2.0 deprecation plan
- [Geotab: Data feed guide](https://developers.geotab.com/myGeotab/guides/dataFeed), version tokens, checkpoint order, adaptive polling, the 180-second timeout, feed types and edited records
- [Motive: Developer portal](https://developer.gomotive.com/), the API endpoint families
