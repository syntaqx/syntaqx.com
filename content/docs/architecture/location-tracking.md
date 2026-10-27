+++
title = "Location Tracking & Geofences"
description = "Positions with accuracy, mobile sampling limits, geofence arrival with dwell and hysteresis, ETAs, safe tracking links, and consent and retention."
category = "Architecture"
order = 418
tags = ["architecture", "location", "geofencing", "mobile", "privacy"]
aliases = ["location-tracking"]
+++

A courier's van, a technician's phone, a rideshare driver, a rental scooter, a delivery robot, a nurse on home visits: once a product knows where something is, it can tell a customer "22 minutes away," mark an arrival nobody tapped, prove a visit happened and plan the next one. It's also the most sensitive data most products ever collect about the people doing the work, and it arrives as a stream of noisy points from devices that the operating system is actively trying to keep asleep.

This chapter is the general machinery: what a position record holds, how to sample it on a phone without draining the battery, how to turn points into arrival and departure events, how to compute an ETA, how to share live location with a customer safely, and how long to keep any of it.

## A Position Is a Measurement

A position isn't a fact; it's a measurement with an error bar, taken at one time and received at another. Store it that way:

```sql
CREATE TABLE positions (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  subject_type  TEXT NOT NULL CHECK (subject_type IN ('device', 'vehicle')),
  subject_id    UUID NOT NULL,              -- the phone or the vehicle, never the person directly
  source        TEXT NOT NULL,              -- 'phone_gps', 'phone_fused', 'telematics', 'manual'
  lat           DOUBLE PRECISION NOT NULL,
  lon           DOUBLE PRECISION NOT NULL,
  accuracy_m    REAL,                       -- radius; NULL if the source didn't say
  speed_mps     REAL,
  heading_deg   REAL,
  device_time   TIMESTAMPTZ NOT NULL,       -- when it was measured
  received_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  external_ref  TEXT,                       -- the provider's point ID, for idempotent ingest
  UNIQUE (tenant_id, source, subject_id, device_time)
);
```

- **Accuracy is part of the point.** The W3C Geolocation API defines `accuracy` as "the 95% confidence level in meters," and mobile platforms report the same kind of radius. A point 15 meters from a house with 10 meters of accuracy is consistent with being there; the same point with 400 meters of accuracy proves little. Store it, use it in every decision below, and show it wherever a person judges a position.
- **Two clocks.** Order and reason by `device_time` (when it was measured), and keep `received_at` (when you learned about it). Phones batch uploads and replay hours of points after a dead zone; telematics feeds retry. Sorting by arrival puts a truck in two places at once ([Offline-First Sync](/docs/architecture/offline-sync#two-clocks)).
- **Positions belong to a device or vehicle, not a person.** People swap phones and trucks. Join a position to a person through an effective-dated assignment (who held which device or drove which vehicle, when), as in [Temporal Data](/docs/database/temporal-data#effective-dated-rows). That join is also where privacy rules apply: only positions inside a working assignment are attributed to anyone.
- **Ingest idempotently.** Providers resend, so the unique key on source, subject and measurement time makes a duplicate a no-op ([Webhooks](/docs/api-design/webhooks#consumer-expectations)).

At volume, raw positions are time-series data: partition by time, keep them out of the transactional tables that hold visits and orders, and promote only derived facts (arrived at 10:42, departed at 11:15) into the business record.

## Sampling on Mobile

Phones are designed to stop apps from doing exactly this. What you can collect depends on whether the app is in the foreground, what the user granted, and the OS version:

- **iOS suspends background apps.** Apple's guidance is that the system suspends most apps "shortly after they move to the background," and suspended apps don't receive location updates until they run again; continuous background updates need the Location updates background mode and, for Always authorization, telling the user that updates arrive in the background. The low-power alternative, the significant-change service, notifies an app "as soon as the device moves 500 meters or more from its previous notification," and apps "should not expect notifications more frequently than once every five minutes." It relaunches a terminated app when a new event arrives.
- **Android throttles background location.** Since Android 8.0, apps in the background "can receive location updates only a few times each hour." A foreground service (with its ongoing notification) is how an app gets more, and on Android 11 and later a foreground service started from the background can't access location unless the user granted background location permission.

The design that follows from those limits:

- **Sample by need, not by clock.** High frequency (every few seconds) only while it matters: en route to a customer, during an active delivery. Low frequency or significant-change while idle. Nothing outside working time.
- **Make tracking a visible mode.** "On shift" or "en route" in the app maps directly to a foreground service on Android and an active background session on iOS, and the user sees why location is on.
- **Batch uploads.** Collect points locally and send them in batches over the [device outbox](/docs/architecture/offline-sync#the-device-outbox), which also survives dead zones. Upload more often only while a customer is watching a live map.
- **Expect gaps.** Background limits, force-quits, battery savers and airplane mode all produce holes. A missing point means "unknown," never "stationary."

Vehicles don't have these problems. A telematics unit is wired to power and reports on its own schedule, which is why it's the better source for anything that drives (below).

## Filtering Noise

Raw points jump: a phone indoors snaps to a cell tower a kilometer away, a GPS fix under trees drifts across the street, a cached position arrives stamped as new. Filter before any decision, and keep the raw points so the filter can be changed later:

- **Drop or down-weight poor accuracy.** Decide a threshold per use: an arrival decision might ignore anything worse than 100 meters, a breadcrumb trail might keep everything.
- **Reject impossible motion.** A jump that implies 300 km/h between two points from a delivery van is a bad fix, not a teleport.
- **Ignore stale cached fixes.** Location APIs can return a cached position; the W3C API's `maximumAge` makes that explicit. Check the measurement time, not just the arrival.
- **Smooth for display, not for evidence.** Snapping to roads and smoothing the dot make a nicer map. Arrival and time-on-site decisions use the filtered points with their accuracy, not the prettified line.

## Combining Sources

Most fleets have two sources for the same trip: the worker's phone and the vehicle's telematics unit. They're good at different things.

| | Phone | Telematics |
| --- | --- | --- |
| Power and sampling | Rationed by the OS | Constant while the vehicle runs |
| Tells you about | The person, including on foot at the door | The vehicle, including when nobody's app is open |
| Fails when | App killed, permissions revoked, battery low | Worker leaves the vehicle, vehicle shared or swapped |
| Identity | The signed-in user | The vehicle, joined to a driver through assignment |

Use both and keep them separate. Telematics is the better source for travel and for "the vehicle stopped at the property." The phone is the better source for "the worker walked to the back building." An explicit tap ("arrived," "delivered") is a third source. Each is stored with its source, and **disagreement is the interesting fact**: a check-in tapped from three miles away, or a van parked at a customer for three minutes against a 30-minute job, is a flag for review, not something to silently resolve by picking a winner.

## Arrival and Departure Detection

People forget to tap "arrived," and some tap it early. Geofences fill the gap and keep the tap honest, but a geofence that fires on one point produces phantom arrivals at the neighbor's house.

### Enter and Exit Need Track State

An arrival isn't "a point inside the fence"; it's a transition. GIS event processing defines it precisely: Esri's GeoEvent filters treat an event as having entered a geofence when its geometry is inside and the previous position "from the same track" was outside, and exited when the reverse is true. The state per subject and fence (inside or outside, since when) is what turns a stream of points into events, and it has to survive restarts and out-of-order points, so it's computed in device-time order.

### Dwell

Require the subject to stay inside for a while, or to stop inside, before declaring arrival. Android's geofencing API has this built in: a `DWELL` transition fires only when the user stops inside a geofence for a loitering delay you choose, and Android recommends dwell over enter to reduce "alert spam" from devices that briefly cross a fence. Telematics providers model the same idea as a stop inside a zone. Pick the dwell from the work: a parcel drop might need 30 seconds stopped, a service visit a few minutes.

### Hysteresis

Use a larger exit fence than entry fence. A truck parked on the boundary of a single fence flaps between inside and outside with every noisy fix; with an entry radius of, say, 100 meters and an exit radius of 200, it has to leave properly to count as departed.

### Fence Size and Shape

- **Not smaller than the accuracy.** Android recommends a minimum radius of 100 to 150 meters for best results, and says to assume Wi-Fi location accuracy is about 50 meters unless indoor location is available; in rural areas without Wi-Fi it can be several hundred meters or more. A 20-meter fence around a house in that environment fires at random.
- **Shape per site.** A house needs a small circle; a hospital campus, a farm, an apartment complex or a distribution center needs a polygon. Store the fence on the location, and let staff correct it when it's wrong.
- **On-device fences are scarce.** iOS prevents any single app from monitoring more than 20 conditions at once; Android allows 100 geofences per app per device user. Register on the device only the next few sites on today's route, and evaluate everything else server-side from uploaded positions.
- **Latency is minutes, not seconds.** Android reports typical geofence alert latency under 2 minutes, about 2 to 3 minutes when background limits apply, and up to 6 minutes for a device that has been stationary. Design arrival logic, and customer messages, for that.

### Evidence, Not Truth

A geofence arrival is evidence alongside the worker's tap and the vehicle's stop, not a replacement for any of them. Store every arrival and departure with its source, the points that triggered it and their accuracy. Time on site computed from these feeds pay, time-and-materials billing and disputes about whether anyone came, so it has to be explainable from the record ([Audit Trails](/docs/architecture/audit-trails#what-a-record-holds)).

## ETAs

An ETA a customer sees is a promise, recomputed many times.

- **ETA is travel time plus remaining work.** Travel time from the current position through a routing engine with traffic, plus the remaining time on the current job if the worker isn't yet en route to this customer, plus any stops in between.
- **Recompute on meaningful change,** not on every point: a new position more than some distance from the last computation, a stop completed, a route change. Routing calls cost money and rate limits.
- **Smooth what you show.** An ETA that jumps from 12 to 19 to 11 minutes is worse than a slightly stale one. Change the displayed value only when the new estimate differs by more than a threshold, and prefer showing a short range to false precision.
- **Lateness is computed, not reported.** When the ETA passes the end of the promised window by more than a threshold, flag it and send one "running late" message with the new estimate, before the customer has to ask, through the [outbound gate](/docs/architecture/notifications#one-outbound-gate).

## Shareable Tracking Links

"Track your technician" links are the most visible use of location, and the easiest to get wrong, because they're shown to people who don't log in.

- **The link is a bearer token.** Anyone holding it sees a moving vehicle. Make the token long and random (not a sequential ID), scoped to one job or stop, and dead when that job completes or after a maximum lifetime, whichever comes first. Samsara's live share links, for example, need no authorization, and each belongs to one route stop.
- **Share only while en route to that recipient.** Location starts when the worker starts toward this customer and stops at arrival. Never show where they are between other customers' stops, and never before they're on the way.
- **Reveal the minimum.** Stop location, status and ETA, plus whatever identifies the arriving person well enough for safety (a first name, a photo, a vehicle description), and nothing else: no full name, no phone number, no next address. Samsara's links state that they show only the stop location, status and ETA and expose no personal information about the carrier, driver or vehicle.
- **Treat it like any public endpoint.** Rate-limit it, set `Referrer-Policy` and `noindex`, don't log the token in analytics, and let staff revoke a link (a customer forwarded it, or a dispute turned hostile).

## Consent, Law and Retention

Tracking a vehicle or a work phone is tracking the person using it, and in many places that's regulated.

- **Tell people, in writing, before you track them.** New Jersey, for example, subjects an employer who knowingly uses a tracking device in a vehicle used by an employee without providing written notice to civil penalties of up to $1,000 for a first violation and up to $2,500 for each subsequent one (P.L.2021, c.449). Other jurisdictions have their own rules; written notice everywhere is my baseline, and the law in each place you operate decides the rest.
- **Be ready to justify it.** In the UK, the ICO's guidance on monitoring workers says that for driver monitoring "You must carry out a DPIA as this type of processing would be considered high risk," that employers should consider "whether less intrusive methods could achieve your purpose," and that during private use of a work vehicle "you will rarely be able to justify monitoring." Its model example is a tracker the driver can disable outside working time. That's a sound default anywhere: a working-time mode, enforced in the app and on the server.
- **Customers' location is personal data too.** A customer sharing their location to meet a driver, or an address history that reveals routines, gets the same purpose limitation and access controls ([GDPR](/docs/compliance/gdpr#privacy-by-design-and-by-default)).
- **Keep raw tracks briefly and derived facts longer.** Breadcrumb trails are useful for days or weeks (disputes, route review) and dangerous after that. Arrival and departure events, time on site and mileage are business records with their own, longer retention. Set both windows explicitly, delete raw points on schedule, and restrict who can query a person's history ([Data Retention](/docs/architecture/data-retention#retention-schedules-by-record-type)).
- **Log who looked.** Viewing where a named person was last Tuesday is an access worth auditing ([Audit Trails](/docs/architecture/audit-trails#log-access-not-just-changes)).

## Checklist

- Positions store accuracy, source, device time and received time, against a device or vehicle; people are joined through effective-dated assignments.
- Raw points are ingested idempotently and kept out of transactional tables; only derived events become business records.
- Mobile sampling is a visible mode, frequent only while it matters, batched through the outbox, and off outside working time.
- Filters drop poor accuracy, impossible jumps and stale fixes; smoothing is for display only.
- Phone, telematics and manual taps are kept as separate sources; large disagreements are flagged.
- Geofence events come from track state, with dwell, hysteresis and fences sized to the accuracy and shaped per site.
- On-device fences cover only the next few sites; the rest are evaluated server-side.
- ETAs combine travel and remaining work, recompute on meaningful change, and are smoothed for display; lateness triggers one proactive message.
- Tracking links are random, single-job, short-lived bearer tokens showing only location, status and ETA while en route.
- Workers get written notice, tracking stops outside working time, raw tracks have a short retention window, and access to location history is logged.

## References

**Specifications**

- [W3C: Geolocation](https://www.w3.org/TR/geolocation/), `accuracy` as a 95% confidence radius in meters, `enableHighAccuracy` and `maximumAge`
- [New Jersey P.L.2021, c.449](https://pub.njleg.state.nj.us/Bills/2020/AL21/449_.PDF), written notice before an employer uses a tracking device in a vehicle used by an employee, and its civil penalties

**Reference**

- [Apple: Handling location updates in the background](https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background), suspension of background apps and the background mode for location
- [Apple: startMonitoringSignificantLocationChanges()](https://developer.apple.com/documentation/corelocation/cllocationmanager/startmonitoringsignificantlocationchanges()), 500 meters, no more than once every five minutes, and relaunch on new events
- [Apple: Monitoring the user's proximity to geographic regions](https://developer.apple.com/documentation/corelocation/monitoring-the-user-s-proximity-to-geographic-regions), the limit of 20 monitored conditions per app and relaunch when a condition is satisfied
- [Android: Background location limits](https://developer.android.com/about/versions/oreo/background-location-limits), updates "only a few times each hour" in the background and foreground services
- [Android: Create and monitor geofences](https://developer.android.com/develop/sensors-and-location/location/geofencing), 100 geofences per app per device user, 100 to 150 meter minimum radius, dwell and loitering delay, and alert latency
- [Esri GeoEvent: Spatial filters](https://gis.dot.ny.gov/hostingny/help/en/geoevent/11.5/analyze/spatial-filters.htm), ENTER and EXIT defined against the previous position on the same track
- [ICO: Monitoring workers, specific considerations](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/specific-data-protection-considerations-for-different-ways-or-methods-of-monitoring-workers/), DPIAs for driver monitoring, less intrusive methods, private use of vehicles and trackers drivers can disable

**In practice**

- [Samsara: Live share links](https://developers.samsara.com/docs/live-share-links), unauthenticated per-stop links showing only stop location, status and ETA, without driver or vehicle personal information
