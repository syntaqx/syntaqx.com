+++
title = "Time"
description = "Standard formats for datetimes, durations, and recurring schedules."
category = "Fundamentals"
order = -0.5
tags = ["time", "rfc3339", "iso8601", "standards"]
+++

Time shows up everywhere. Getting it wrong causes subtle bugs that are painful to track down. These are the standard formats, and every example across these docs follows them.

## Datetimes: RFC 3339

All datetimes use [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) format. Always include the timezone offset.

```
2025-03-14T14:23:45Z
```

Breaking it down:

- `2025-03-14` is the date (year-month-day).
- `T` separates the date from the time.
- `14:23:45` is the time in 24-hour format.
- `Z` means UTC. You may also see offsets like `+02:00` or `-05:00`.

Store timestamps in UTC. Convert to local time on the client side.

## Durations: ISO 8601

When measuring how long something lasts, use [ISO 8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations).

```
P1Y2M10DT2H30M
```

Breaking it down:

- `P` starts the duration.
- `1Y` = 1 year, `2M` = 2 months, `10D` = 10 days.
- `T` separates the date portion from the time portion.
- `2H` = 2 hours, `30M` = 30 minutes.

Mix and match as needed. `P5D` means 5 days. `PT3H` means 3 hours.

## Recurrence: iCalendar (RFC 5545)

The [iCalendar specification (RFC 5545)](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html) defines several properties for modeling recurring events. RRULE is the most common, but it's not the only tool available.

### RRULE

RRULE defines a repeating pattern.

```
FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR
```

- `FREQ=WEEKLY`: repeats weekly.
- `INTERVAL=2`: every 2 weeks.
- `BYDAY=MO,WE,FR`: on Monday, Wednesday, and Friday.

RRULE handles everything from simple daily schedules to complex yearly patterns.

### EXDATE

EXDATE excludes specific dates from a recurrence set. Use it to skip holidays, cancellations, or one-off exceptions without changing the underlying rule.

```
RRULE:FREQ=WEEKLY;BYDAY=TU
EXDATE:20250325T090000Z,20250401T090000Z
```

This creates a weekly Tuesday event but skips March 25 and April 1.

### RDATE

RDATE adds individual dates to a recurrence set. Use it for irregular additions that don't fit a pattern.

```
RRULE:FREQ=MONTHLY;BYMONTHDAY=15
RDATE:20250420T090000Z
```

Monthly on the 15th, plus an extra occurrence on April 20.

### Combining Properties

The real power comes from combining these properties. An RRULE defines the base pattern, EXDATE carves out exceptions, and RDATE adds one-offs. Together they can model schedules that would be impossible with a single rule.

```
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR
EXDATE:20250324T090000Z
RDATE:20250322T090000Z
```

Every Monday, Wednesday, and Friday, except skip Monday March 24 and add Saturday March 22 instead. The recurrence engine evaluates the union of RRULE + RDATE, then subtracts EXDATE.

### DTSTART

`DTSTART` anchors the recurrence. It defines the first occurrence and establishes the time-of-day and timezone for the entire series.

```
DTSTART:20250301T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
```

Without DTSTART, recurrence rules lack a reference point. Always include it when persisting schedules.

## In Practice

In practice, these show up as:

```json
{
  "created_at": "2025-03-14T14:23:45Z",
  "trial_duration": "P14D",
  "billing_schedule": "FREQ=MONTHLY;BYMONTHDAY=1"
}
```

Fields ending in `_at` are always RFC 3339 datetimes. Fields ending in `_on` are date-only values (`2025-03-14`). See [Database Naming Conventions](/docs/database-naming-conventions) for the full suffix reference.
