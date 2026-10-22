+++
title = "Time & Date Formats"
description = "RFC 3339 instants in UTC, local wall-clock times with IANA zones for future events, ISO 8601 durations, and iCalendar rules for anything recurring."
category = "Fundamentals"
order = 102
tags = ["time", "rfc3339", "iso8601", "standards"]
aliases = ["time"]
+++

Most time bugs come from treating different kinds of time as one kind. "When did this payment happen?", "when should this meeting start?", "how long is the trial?" and "every other Tuesday" are four different questions, and each needs its own representation. Get the kind right and the format follows.

## Instants: RFC 3339, in UTC

An instant is a single point on the global timeline: when a payment was captured, when a row was written. Write it in [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339), always with an offset, and send it in UTC.

```
2026-03-14T14:23:45Z
2026-03-14T14:23:45.123Z
```

- **Not Unix timestamps.** `1773498225` is compact, but nobody can read it in a log, and nothing in it says whether it's seconds or milliseconds. Guess wrong and a date lands in 1970, or around the year 58,000.
- **Not local time without an offset.** `2026-03-14 14:23:45` means a different instant in every time zone, and the reader can't tell which one you meant.
- **Always UTC in responses.** Other offsets are valid RFC 3339, but when every instant uses `Z`, clients can sort them as strings and logs from different services line up.

Store instants as `TIMESTAMPTZ` in Postgres (which stores UTC internally) and convert to local time only for display.

## Future Wall-Clock Times: Local Time Plus a Zone

"UTC everywhere" is right for instants and wrong for one important case: an event in the future, defined by a local clock. A meeting at 9:00 in Denver next July is not a fixed UTC instant today. If Colorado changes its daylight saving rules before then (governments do this, sometimes with weeks of notice), the meeting is still at 9:00 local, and a stored UTC value is now an hour off.

So a future local event stores what the user meant: the local time and the [IANA time zone](https://www.iana.org/time-zones), not an offset.

```json
{
  "starts_at_local": "2027-07-14T09:00:00",
  "time_zone": "America/Denver"
}
```

Compute the UTC instant when you need it (to schedule a job, to show it in another zone), using the current zone rules. [RFC 9557](https://datatracker.ietf.org/doc/html/rfc9557) extends RFC 3339 with a bracketed zone suffix (`2027-07-14T09:00:00-06:00[America/Denver]`) for systems that want both in one string, and JavaScript's `Temporal` API speaks it natively.

An offset like `-06:00` is not a time zone. It's the zone's offset at one moment, and it changes twice a year.

## Dates Without Times

A birthday, a due date or a settlement date is a calendar day, not an instant: `YYYY-MM-DD`, with no time and no zone.

```json
{ "due_on": "2026-04-01" }
```

Encoding a date as midnight UTC (`2026-04-01T00:00:00Z`) is the classic bug: a client west of Greenwich renders it as March 31.

## Durations: ISO 8601

For human, calendar-based periods (a 14-day trial, a 1-month billing period), use the [ISO 8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations):

```
P14D        14 days
P1M         1 month
PT2H30M     2 hours 30 minutes
```

`P` starts the duration and `T` separates the date part from the time part. Calendar units deliberately have no fixed length: `P1M` added to January 31 lands at the end of February, and `P1D` across a daylight saving change is 23 or 25 hours. That's what "a month" means to a customer, and the format preserves it.

For machine durations where the exact length matters (a timeout, a TTL, `Retry-After`), use plain integer seconds or milliseconds in a field whose name says the unit: `timeout_ms`, `ttl_seconds`.

## Recurrence: iCalendar

Recurring schedules are the hardest time problem, and [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545) already solved it. A home-grown JSON schema for "every other Monday except holidays" rediscovers every edge case the iCalendar authors did, one bug report at a time.

```
DTSTART;TZID=America/Denver:20260302T090000
RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR
EXDATE;TZID=America/Denver:20260316T090000
RDATE;TZID=America/Denver:20260321T090000
```

- **`DTSTART`** anchors the series: the first occurrence, its time of day, and its zone. Give it a `TZID`, not `Z`. A weekly 9:00 meeting anchored in UTC drifts to 8:00 or 10:00 local at every daylight saving change.
- **`RRULE`** is the repeating pattern: every two weeks, on Monday, Wednesday and Friday.
- **`EXDATE`** removes occurrences (a holiday) without changing the rule.
- **`RDATE`** adds one-off occurrences that don't fit the pattern.

The set is `RRULE` plus `RDATE`, minus `EXDATE`. Expand it with a library (`dateutil.rrule` in Python, `rrule` in JavaScript, `rrule-go` in Go): expansion around daylight saving and month ends is where hand-written code fails.

## In Practice

```json
{
  "created_at": "2026-03-14T14:23:45Z",
  "due_on": "2026-04-01",
  "trial_duration": "P14D",
  "timeout_ms": 30000,
  "schedule": {
    "rrule": "FREQ=MONTHLY;BYMONTHDAY=1",
    "dtstart_local": "2026-04-01T09:00:00",
    "time_zone": "America/Denver"
  }
}
```

Field suffixes carry the kind: `_at` is an instant, `_on` is a date. See [JSON Field Conventions](/docs/requests/json-conventions) and [Database Naming Conventions](/docs/database/naming-conventions).

## References

**Specifications**

- [RFC 3339: Date and Time on the Internet](https://datatracker.ietf.org/doc/html/rfc3339), the timestamp format for instants
- [RFC 9557: Timestamps with Additional Information](https://datatracker.ietf.org/doc/html/rfc9557), the bracketed time zone suffix
- [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601), the standard RFC 3339 profiles, and the source of the duration format
- [RFC 5545: iCalendar](https://datatracker.ietf.org/doc/html/rfc5545), `RRULE`, `EXDATE`, `RDATE` and `DTSTART`
- [IANA Time Zone Database](https://www.iana.org/time-zones), the zone names and their changing rules

**Reference**

- [MDN: Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal), JavaScript's date API with zones, plain dates and durations
- [MDN: Date.prototype.toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString), producing UTC timestamps in JavaScript
- [PostgreSQL: Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html), `TIMESTAMPTZ` and `DATE`

**In practice**

- [GitHub REST API: Getting started](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api), UTC timestamps in ISO 8601 format on every response
