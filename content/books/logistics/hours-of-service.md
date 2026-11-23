+++
title = "Hours of Service"
description = "The property-carrying limits: 11 and 14 hours, the 30-minute break, 60/70 and the restart, sleeper splits, exceptions, a worked calculation and a calculator."
category = "Logistics & Supply Chain Industry"
order = 2822
part = "Carrier Regulation"
tags = ["logistics", "trucking", "fmcsa", "hours-of-service", "eld", "compliance", "scheduling"]
+++

Hours of service are the federal limits on how long a commercial driver may drive and work before resting. For a driver of a property-carrying commercial motor vehicle in interstate commerce, 49 CFR 395.3 sets four clocks at once: no driving without first taking 10 consecutive hours off duty; no driving after 14 consecutive hours from coming on duty; no more than 11 hours of driving inside that window; and no driving after 60 hours on duty in 7 days or 70 hours in 8, a cycle a 34-hour off-duty period can reset. A fifth rule interrupts the driving: after 8 hours of driving, a 30-minute break. Every load plan, every dispatch, every ETA and every detention dispute in trucking runs into these clocks, because a driver who is out of hours stops wherever they are, and the freight stops with them.

The rules fit on a page; computing them isn't simple. Each clock resets on a different event, the 14-hour window keeps running through breaks unless the break is part of a qualifying sleeper berth split, the cycle is a rolling sum over days that begin at a time the carrier designates in its home terminal's time zone, exceptions extend or suspend individual clocks, and the inputs are a log of duty statuses that drivers and carriers can edit after the fact. A dispatcher asking "can this driver make a 06:00 delivery 600 miles away" needs all four clocks projected forward, not the hours used so far. This chapter covers the limits and what counts as on duty, the break, the sleeper berth split, the cycle and the restart, the exceptions, the pilot programs proposed in 2025 and 2026, a worked calculation, a calculator in Go and Rust, and the tables that hold duty status and clocks. The devices that record the log are in [ELDs & Telematics](/books/logistics/electronic-logging-devices), driver qualification in [Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification), and roadside enforcement of hours violations in [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa). Service vans that only occasionally cross the CMV line, and the short-haul exception that covers most of them, are in Field Operations' [When a Service Van Is a Commercial Motor Vehicle](/books/field-operations/fleet-and-safety#when-a-service-van-is-a-commercial-motor-vehicle).

## How the Platforms Do It

Carriers don't compute hours from scratch: the ELD vendor computes clocks from the log and exposes them, and dispatch systems read the vendor's clocks. As of November 2026, from the vendors' developer documentation:

| Vendor | Clock interface | What it returns | Notes |
| --- | --- | --- | --- |
| **Geotab** | The `DutyStatusAvailability` object | `driving`, `duty`, `workday`, `rest` (time before a break is due), `cycle`, `cycleDriving`, `cycleRest`, a `recap` of each day's on-duty time since the cycle began, and flags such as `is16HourExemptionAvailable` and `isAdverseDrivingExemptionAvailable` | Logs are `DutyStatusLog` records with an `eventType` of 1 to 7 from the ELD rule and a `parentId` linking an edit to the original |
| **Motive** | `GET /v1/hours_of_service`, `GET /v1/logs`, `v1/hos_violations` | Per driver and day, `driving_duration`, `on_duty_duration`, `off_duty_duration`, `sleeper_duration` and `waiting_duration` in seconds; logs with `events` of a `type`, `start_time` and `end_time` | Durations used, not remaining; the consumer computes what remains |
| **Samsara** | `GET /fleet/hos/clocks`, `GET /fleet/hos/logs` | `driveRemainingDurationMs` (against 11 hours), `shiftRemainingDurationMs` (14 hours), `timeUntilBreakDurationMs`, `cycleRemainingDurationMs`, `cycleTomorrowDurationMs`, `cycleStartedAtTime`, and current violations; logs of `hosStatusType` `offDuty`, `sleeperBed`, `driving`, `onDuty`, `yardMove` or `personalConveyance` | Advises waiting "a couple of days" after a log is created because driver app data may not be fully uploaded |

Three patterns:

- **The vendor's clock is the operational truth, the log is the legal one.** Dispatch decisions use the vendor's remaining-time fields because they include rules the dispatcher's system doesn't model (exceptions, state variants), but what an inspector or auditor reads is the record of duty status. A dispatch system that computes its own clocks uses them to project, and reconciles with the vendor's.
- **Tomorrow matters as much as now.** Samsara's `cycleTomorrowDurationMs` and Geotab's `recap` exist because the cycle frees hours as old days drop off; a planner booking a load for tomorrow needs tomorrow's cycle, not today's.
- **Logs change after the fact.** Geotab's `parentId` and record statuses, and Samsara's advice to wait before treating a log as complete, both reflect that drivers edit, carriers propose edits and unassigned driving gets claimed later. Clocks computed from a log are provisional until the log is certified.

## The Limits

The property-carrying limits in 395.3, in the regulation's words:

| Limit | Rule | What resets it |
| --- | --- | --- |
| **10 hours off** | "A driver may not drive without first taking 10 consecutive hours off duty" | Is the reset for the 11 and 14 |
| **14-hour window** | "A driver may not drive after a period of 14 consecutive hours after coming on-duty following 10 consecutive hours off-duty" | 10 consecutive hours off, or a qualifying sleeper split |
| **11 hours driving** | "A driver may drive a total of 11 hours during the period" of the window | Same as the window |
| **30-minute break** | "driving is not permitted if more than 8 hours of driving time have passed without at least a consecutive 30-minute interruption in driving status," satisfiable by off duty, sleeper berth or on-duty not driving time, or a combination | Any 30 consecutive minutes not driving |
| **60/70-hour cycle** | No driving after "60 hours in any period of 7 consecutive days" if the carrier doesn't operate every day of the week, or "70 hours in any period of 8 consecutive days" if it does | Old days rolling off, or a restart: a period "may end with the beginning of an off-duty period of 34 or more consecutive hours" |

The limits on what a driver may do after a limit is reached are about driving, not work: a driver past 14 hours may keep doing on-duty work (fueling, paperwork, unloading), and a driver at 11 hours of driving may still be on duty; they just can't drive. Passenger-carrying drivers have different limits (395.5), not covered here.

What counts depends on definitions in 395.2. **Driving time** is "all time spent at the driving controls of a commercial motor vehicle in operation." **On-duty time** starts when a driver begins work or must be ready to work and runs until released, and includes waiting at a carrier's or shipper's facility "to be dispatched, unless the driver has been relieved from duty by the motor carrier," inspecting and servicing the vehicle, loading and unloading or supervising it, handling shipment receipts, repairing a disabled vehicle, giving a breath or urine sample for testing, and "any other work for a motor carrier" or paid work for anyone else. Waiting at a dock is therefore on duty unless the driver has been relieved, which is why detention eats into the 14-hour window and why the 2025 pilot below targets time at pickup and delivery.

The days of the cycle are not calendar days. A **24-hour period** is "any 24-consecutive-hour period beginning at the time designated by the motor carrier for the terminal from which the driver is normally dispatched," and the 7 and 8 consecutive days begin at that same designated time. A carrier with a Chicago home terminal and a midnight start counts days in Central time even when the driver is in California; a system that computes the cycle on UTC days, or the driver's current zone, gets a different answer near midnight ([Future Wall-Clock Times: Local Time Plus a Zone](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)).

## The Sleeper Berth Split

A driver with a sleeper berth can meet the 10 hours off with two shorter periods. Under 395.1(g)(1)(ii), the driver may split rest into two periods where neither is under 2 hours, one is "at least 7 consecutive hours in the sleeper berth," and together they total at least 10. Two consequences follow:

- **The qualifying periods don't count against the window.** "The 14-hour driving window for purposes of § 395.3(a)(2) does not include qualifying rest periods" taken under the split ((g)(1)(iii)(B)). A 7/3 or 8/2 split therefore pauses the 14-hour clock for both pieces.
- **The recalculation point moves.** After the second period, the 11-hour and 14-hour limits are computed "from the end of the first of the two periods" ((g)(1)(iii)(A)), so driving and on-duty time between the two rest periods counts against the new shift, and time before the first doesn't.

The current form of the split (a 7-hour minimum in the berth, a 2-hour minimum for the other period, and neither counting against the window) came from the June 1, 2020 final rule (85 FR 33396, effective September 29, 2020), which also moved the 30-minute break to after 8 hours of driving rather than 8 hours on duty, let on-duty not driving time satisfy it, extended the adverse driving exception to the window, and expanded the short-haul exception to 150 air miles and 14 hours. The same rulemaking had proposed a single off-duty pause of up to 3 hours in the 14-hour window, and "the Agency has not included the 3-hour pause in this final rule."

The split is where most home-grown calculators go wrong: pairing periods is a search (any qualifying pair, with the earlier one possibly already in the past), and the window's start point changes retroactively once the second period completes. My rule is to model it explicitly as pairs found in the log, test against the vendor's clocks, and keep the simple calculator below for projection, not enforcement.

## The Cycle and the Restart

The cycle is a rolling sum: on any day, the on-duty hours (driving plus on-duty not driving) in the current day and the previous 6 (60/7) or 7 (70/8) days. A driver who works 10 hours a day on a 70/8 cycle reaches 70 on the seventh day and must stop driving until enough hours from the oldest days roll off, or until a restart. The restart ends the 7 or 8 day period at the beginning of an off-duty period of 34 or more consecutive hours, after which the sum starts from zero. Which cycle a carrier uses is set by whether it "operates commercial motor vehicles every day of the week," and it is a carrier attribute, not a driver choice.

Two practical points. The restart is the only way to recover a cycle all at once, so carriers plan driver home time around it. And the cycle counts on-duty time for every carrier the driver works for: 395.3(b) applies "regardless of the number of motor carriers using the driver's services," which is why a leased-on owner-operator who also hauls under their own authority has one cycle, not two.

## Exceptions

The exceptions in 395.1 extend or suspend particular clocks; each is a condition the calculator has to know about and the log has to record:

- **Adverse driving conditions.** A driver who meets "snow, ice, sleet, fog, or other adverse weather conditions or unusual road or traffic conditions" that couldn't have been known before the duty day or dispatch may drive "for not more than two additional hours" beyond the normal limits, which since 2020 extends both the 11 and the 14 ((b)(1) and the definition in 395.2).
- **Short haul, 150 air miles.** A driver who operates "within a 150 air-mile radius (172.6 statute miles) of the normal work reporting location," returns there and is released within 14 consecutive hours, with 10 hours off between shifts, is exempt from records of duty status and supporting documents (395.8 and 395.11), keeping time records instead ((e)(1)). Most local delivery, LTL pickup and delivery, and service fleets live here; it's the exception Field Operations' fleets mostly use.
- **Non-CDL short haul.** A driver of a property-carrying CMV that doesn't need a CDL, within the radius, is exempt from the 14-hour rule and the logs, but may drive past the 14th hour on only 5 days and past the 16th on 2 days in any 7 ((e)(2)).
- **The 16-hour exception.** If the driver hasn't used it in the previous 6 consecutive days (or has since started a new cycle with a 34-hour restart), a driver who returned to the work reporting location and was released there on the previous five duty tours may extend the window to 16 hours, provided the carrier releases the driver within 16 hours of coming on duty that day ((o)).
- **Agricultural operations.** During planting and harvesting periods each state sets, drivers carrying agricultural commodities, farm supplies or livestock within 150 air miles of the source are outside part 395 entirely ((k)).
- **Personal conveyance and yard moves.** Neither is an exception in the regulation; they are FMCSA guidance on how to log. Personal conveyance is moving a CMV "for personal use or reasons" as off duty while "relieved from work and all responsibility for performing work by the motor carrier," such as travel from en route lodging "to restaurants and entertainment facilities" or to "a nearby, reasonable, safe location to obtain required rest after loading or unloading," and the vehicle "may be used for personal conveyance even if it is laden," though carriers may restrict that (83 FR 26377, June 7, 2018). Moving the truck "to enhance the operational readiness of a motor carrier," or to the carrier's terminal after a stop, is not personal conveyance. Yard moves (driving inside a yard or terminal, logged as on duty rather than driving) were the subject of proposed guidance in January 2021 (86 FR 179); I found no final version in the Federal Register. <!-- source-gap: logistics-hours-of-service-yard-move-guidance | status | whether FMCSA finalized its January 2021 proposed yard move guidance, and its final text | closes with: FMCSA's guidance portal entry or a Federal Register notice of the final guidance, opened | checked: 2026-11-22 -->

Exemptions granted to individual carriers and associations (railroads, pyrotechnics companies, specific fleets) run through Federal Register notices every month and attach to the carrier, with an expiry; a calculator that serves many carriers treats them as rule overrides with validity ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).

## The Pilots

In response to Executive Order 14286, FMCSA proposed two pilot programs on September 17, 2025, and in October 2026 published the information collections needed to run them, with comments due December 7, 2026. Neither changes the rules for anyone outside the study, and as of November 2026 neither has started:

- **Flexible sleeper berth.** About 256 drivers, each for 16 weeks, could reduce "the longer period in the sleeper berth to a minimum of 5 consecutive hours," allowing a 5/5 or 6/4 split, or anything between, as the equivalent of 10 hours off (91 FR, October 7, 2026, doc 2026-20524; proposal 2025-17939).
- **Split duty period.** About 256 drivers, for 16 weeks each, could extend the 14-hour window "with up to 3 hours of off duty, sleeper berth, or on-duty/not driving time" taken at a pickup or delivery location (doc 2026-20476; proposal 2025-17938). FMCSA notes that a similar pilot proposed in 2020 never started.

If either becomes a rule, the calculator's window logic changes, which is the argument for keeping the limits as data with validity rather than constants scattered through code.

## A Worked Calculation

An illustrative driver for a carrier on the 70-hour, 8-day cycle, home terminal in Central time with days starting at midnight, has had 12 hours off duty before 06:00 Wednesday. Wednesday's log so far:

| Time | Status | Duration |
| --- | --- | --- |
| 06:00-06:45 | On duty, not driving (pre-trip inspection, hooking a loaded trailer) | 0:45 |
| 06:45-11:15 | Driving | 4:30 |
| 11:15-12:00 | On duty, not driving (a live delivery) | 0:45 |
| 12:00-16:00 | Driving | 4:00 |

Over the previous seven days, the on-duty totals were 10, 9, 11, 6, 8, 10 and 4 hours, oldest first: 58 hours. (No day is zero: a whole day off between two shifts is usually 34 hours off, which would have been a restart.) At 16:00 Wednesday:

1. **Driving limit.** 4:30 + 4:00 = 8:30 driven since the 10-hour reset; 11:00 - 8:30 = **2:30** left.
2. **Window.** The window began at 06:00 when the driver came on duty after 10 hours off; it ends at 20:00. **4:00** left.
3. **Break.** The 45 minutes on duty at the delivery was a 30-minute interruption, so the 8-hour count restarted at 12:00. 4:00 driven since; **4:00** left before a break is required.
4. **Cycle.** 58 hours in the prior seven days plus 10 hours on duty today (06:00 to 16:00) is 68; 70 - 68 = **2:00** left.

The driver can drive **2 hours** more today, and the cycle, not the driving limit, is what binds. A planner who looked only at "11 hours minus 8:30" would have booked a 2.5-hour leg and put the driver in violation 30 minutes short of the consignee.

Tomorrow's answer is different. At midnight the oldest day (10 hours) drops out of the 8-day sum. If the driver drives the 2 hours today and goes off duty at 18:00, today's total is 12 and the sum for Thursday's 8 days starts at 9 + 11 + 6 + 8 + 10 + 4 + 12 = 60, so Thursday has **10 hours** of cycle available, and after 10 hours off at 04:00 the 11 and 14 are fresh. That number is the one Samsara exposes as `cycleTomorrowDurationMs`, and it's the one a planner needs for a next-day pickup.

## A Calculator

The sketch below computes the four clocks for the property-carrying rules from a list of duty periods, without the sleeper split, the exceptions or the 16-hour rule. The caller supplies the periods in order, reaching back to the last 10-hour rest and to the start of the cycle, and the start of the cycle as an instant computed in the home terminal's zone (the designated hour 7 days before today's for 70/8, 6 for 60/7). It counts off duty and sleeper berth together as rest, which 395.1(g)(1) allows for the 10 hours; it also counts them together toward the 34-hour restart. <!-- source-gap: logistics-hours-of-service-restart-sleeper | missing | whether sleeper berth time counts toward the 34-hour off-duty restart in 395.3(c) | closes with: FMCSA's hours of service guidance or interpretation on the restart, opened | checked: 2026-11-22 -->

```go tab="Go"
package hos

import "time"

type Status int

const (
	OffDuty Status = iota
	SleeperBerth
	Driving
	OnDuty // on duty, not driving
)

// Period is one duty status. End is the zero time for the current status.
type Period struct {
	Status Status
	Start  time.Time
	End    time.Time
}

// Clocks are what remains under 49 CFR 395.3 for a property-carrying driver.
type Clocks struct {
	Drive, Window, Break, Cycle time.Duration
}

// Available is the driving time left before any limit is reached.
func (c Clocks) Available() time.Duration {
	return min(c.Drive, c.Window, c.Break, c.Cycle)
}

const (
	driveLimit    = 11 * time.Hour
	windowLimit   = 14 * time.Hour
	breakAfter    = 8 * time.Hour
	breakLength   = 30 * time.Minute
	resetLength   = 10 * time.Hour
	restartLength = 34 * time.Hour
)

// Remaining computes the clocks at now. periods are in order and contiguous;
// cycleFrom is the start of the oldest day in the cycle, at the carrier's
// designated hour in the home terminal's zone; cycleLimit is 60 or 70 hours.
func Remaining(periods []Period, now, cycleFrom time.Time, cycleLimit time.Duration) Clocks {
	var (
		shiftStart time.Time     // came on duty after a 10-hour rest
		driven     time.Duration // driving since shiftStart
		sinceBreak time.Duration // driving since the last 30-minute interruption
		notDriving time.Duration // current run of time not driving
		rest       time.Duration // current run of off duty and sleeper berth
		restartEnd time.Time     // end of the last 34-hour rest
	)
	for _, p := range periods {
		end := p.End
		if end.IsZero() || end.After(now) {
			end = now
		}
		if !end.After(p.Start) {
			continue
		}
		d := end.Sub(p.Start)
		if p.Status == OffDuty || p.Status == SleeperBerth {
			rest += d
		} else {
			if rest >= restartLength {
				restartEnd = p.Start
			}
			if rest >= resetLength {
				shiftStart, driven, sinceBreak = p.Start, 0, 0
			}
			rest = 0
		}
		if p.Status == Driving {
			notDriving = 0
			driven += d
			sinceBreak += d
		} else {
			notDriving += d
			if notDriving >= breakLength {
				sinceBreak = 0
			}
		}
	}
	if rest >= resetLength { // resting now with a full reset: the next shift is fresh
		shiftStart, driven, sinceBreak = now, 0, 0
	}
	if rest >= restartLength {
		restartEnd = now
	}

	from := cycleFrom
	if restartEnd.After(from) {
		from = restartEnd
	}
	var onDuty time.Duration
	for _, p := range periods {
		if p.Status != Driving && p.Status != OnDuty {
			continue
		}
		start, end := p.Start, p.End
		if end.IsZero() || end.After(now) {
			end = now
		}
		if start.Before(from) {
			start = from
		}
		if end.After(start) {
			onDuty += end.Sub(start)
		}
	}

	window := time.Duration(0)
	if !shiftStart.IsZero() {
		window = max(shiftStart.Add(windowLimit).Sub(now), 0)
	}
	return Clocks{
		Drive:  max(driveLimit-driven, 0),
		Window: window,
		Break:  max(breakAfter-sinceBreak, 0),
		Cycle:  max(cycleLimit-onDuty, 0),
	}
}
```

```rust tab="Rust"
//! Clocks under 49 CFR 395.3 for a property-carrying driver. Times are Unix
//! seconds; durations are seconds.

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Status {
    OffDuty,
    SleeperBerth,
    Driving,
    OnDuty, // on duty, not driving
}

/// One duty status; `end` is None for the current status.
pub struct Period {
    pub status: Status,
    pub start: i64,
    pub end: Option<i64>,
}

#[derive(Debug, PartialEq, Eq)]
pub struct Clocks {
    pub drive: i64,
    pub window: i64,
    pub break_in: i64,
    pub cycle: i64,
}

impl Clocks {
    /// Driving time left before any limit is reached.
    pub fn available(&self) -> i64 {
        self.drive.min(self.window).min(self.break_in).min(self.cycle)
    }
}

const HOUR: i64 = 3600;
const DRIVE_LIMIT: i64 = 11 * HOUR;
const WINDOW_LIMIT: i64 = 14 * HOUR;
const BREAK_AFTER: i64 = 8 * HOUR;
const BREAK_LENGTH: i64 = 30 * 60;
const RESET_LENGTH: i64 = 10 * HOUR;
const RESTART_LENGTH: i64 = 34 * HOUR;

/// Clocks at `now`. `periods` are in order and contiguous; `cycle_from` is the
/// start of the oldest day in the cycle at the carrier's designated hour in
/// the home terminal's zone; `cycle_limit` is 60 or 70 hours.
pub fn remaining(periods: &[Period], now: i64, cycle_from: i64, cycle_limit: i64) -> Clocks {
    let mut shift_start: Option<i64> = None;
    let (mut driven, mut since_break, mut not_driving, mut rest) = (0i64, 0i64, 0i64, 0i64);
    let mut restart_end: Option<i64> = None;

    for p in periods {
        let end = p.end.unwrap_or(now).min(now);
        if end <= p.start {
            continue;
        }
        let d = end - p.start;
        if matches!(p.status, Status::OffDuty | Status::SleeperBerth) {
            rest += d;
        } else {
            if rest >= RESTART_LENGTH {
                restart_end = Some(p.start);
            }
            if rest >= RESET_LENGTH {
                shift_start = Some(p.start);
                driven = 0;
                since_break = 0;
            }
            rest = 0;
        }
        if p.status == Status::Driving {
            not_driving = 0;
            driven += d;
            since_break += d;
        } else {
            not_driving += d;
            if not_driving >= BREAK_LENGTH {
                since_break = 0;
            }
        }
    }
    if rest >= RESET_LENGTH {
        shift_start = Some(now);
        driven = 0;
        since_break = 0;
    }
    if rest >= RESTART_LENGTH {
        restart_end = Some(now);
    }

    let from = restart_end.map_or(cycle_from, |r| r.max(cycle_from));
    let on_duty: i64 = periods
        .iter()
        .filter(|p| matches!(p.status, Status::Driving | Status::OnDuty))
        .map(|p| (p.end.unwrap_or(now).min(now) - p.start.max(from)).max(0))
        .sum();

    Clocks {
        drive: (DRIVE_LIMIT - driven).max(0),
        window: shift_start.map_or(0, |s| (s + WINDOW_LIMIT - now).max(0)),
        break_in: (BREAK_AFTER - since_break).max(0),
        cycle: (cycle_limit - on_duty).max(0),
    }
}
```

Run on the worked example (Wednesday's four periods after 12 hours off, plus the prior days' on-duty periods reaching back to the start of the oldest day), it returns 2:30 drive, 4:00 window, 4:00 break and 2:00 cycle, and `Available` of 2 hours. The tests worth writing are the boundaries: exactly 30 minutes not driving, exactly 10 hours off, a 34-hour rest that ends inside the cycle window, a period that straddles `cycleFrom`, and an open current period. To project, append the planned periods (a drive leg, a stop, a rest) and call it at the planned time; to plan tomorrow, compute `cycleFrom` for tomorrow.

What the sketch leaves out, and a production calculator needs, in order of how often it matters: the sleeper split (pairing periods, the paused window and the moved recalculation point), adverse driving (two hours more on the 11 and the 14, for one shift), the short-haul exceptions (no 30-minute break for drivers who qualify, 395.3(a)(3)(ii)), the 16-hour exception, carrier and association exemptions with expiries, state intrastate rules, and Canada's different limits for cross-border drivers.

## How to Build It

Hours data extends the core `drivers` and `loads` rows and adds the duty log and the clocks. The log is the ELD's, received through the vendor ([ELDs & Telematics](/books/logistics/electronic-logging-devices#how-to-build-it) holds the raw events); this chapter's tables are the derived duty periods a planner reads and the clocks a vendor or the calculator reports.

```sql
ALTER TABLE drivers                          -- home_terminal_facility_id is Truckload's
  ADD COLUMN hos_ruleset TEXT,                 -- 'us_property_70_8', 'us_property_60_7', ...
  ADD COLUMN short_haul  TEXT;                 -- 'none', 'cdl_150', 'non_cdl_150'
ALTER TABLE drivers ADD CONSTRAINT drivers_short_haul_check
  CHECK (short_haul IN ('none', 'cdl_150', 'non_cdl_150')) NOT VALID;
ALTER TABLE drivers VALIDATE CONSTRAINT drivers_short_haul_check;

ALTER TABLE carriers
  ADD COLUMN hos_day_start TIME;               -- the designated start of the 24-hour period

ALTER TABLE loads
  ADD COLUMN planned_drive_minutes INT,
  ADD COLUMN hos_checked_at        TIMESTAMPTZ;  -- when dispatch last checked the driver's clocks
ALTER TABLE loads ADD CONSTRAINT loads_planned_drive_minutes_check
  CHECK (planned_drive_minutes >= 0) NOT VALID;
ALTER TABLE loads VALIDATE CONSTRAINT loads_planned_drive_minutes_check;

CREATE TABLE hos_rulesets (                    -- the limits, as data with validity
  code            TEXT NOT NULL,               -- 'us_property_70_8'
  valid_during    TSTZRANGE NOT NULL,
  drive_limit     INTERVAL NOT NULL,           -- 11 hours
  window_limit    INTERVAL NOT NULL,           -- 14 hours
  break_after     INTERVAL,                    -- 8 hours; null where no break applies
  break_length    INTERVAL,                    -- 30 minutes
  reset_length    INTERVAL NOT NULL,           -- 10 hours
  cycle_limit     INTERVAL NOT NULL,           -- 70 hours
  cycle_days      SMALLINT NOT NULL CHECK (cycle_days IN (7, 8)),
  restart_length  INTERVAL,                    -- 34 hours
  citation        TEXT NOT NULL,               -- '49 CFR 395.3'
  PRIMARY KEY (code, valid_during)
);

CREATE TABLE hos_duty_periods (                -- the driver's log as periods, derived from ELD events
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  driver_id        UUID NOT NULL REFERENCES drivers (id),
  status           TEXT NOT NULL CHECK (status IN ('off_duty', 'sleeper_berth', 'driving',
                     'on_duty')),
  special          TEXT CHECK (special IN ('personal_conveyance', 'yard_move',
                     'adverse_driving', 'short_haul', 'sixteen_hour')),
  during           TSTZRANGE NOT NULL,         -- upper bound null while current
  equipment_id     UUID REFERENCES equipment_units (id),
  load_id          UUID REFERENCES loads (id),
  location_start   TEXT,                       -- the ELD's location description
  source_event_id  UUID,                       -- the ELD event that started it
  record_state     TEXT NOT NULL CHECK (record_state IN ('active', 'superseded',
                     'edit_requested', 'edit_rejected')),
  certified_on     DATE,                       -- the driver's certification of that day
  EXCLUDE USING gist (driver_id WITH =, during WITH &&)
    WHERE (record_state = 'active')            -- needs btree_gist
);

CREATE TABLE hos_clock_snapshots (             -- clocks as computed, by whom, at what time
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  driver_id        UUID NOT NULL REFERENCES drivers (id),
  computed_by      TEXT NOT NULL,              -- 'samsara', 'geotab', 'motive', 'internal'
  as_of            TIMESTAMPTZ NOT NULL,       -- the instant the clocks describe
  drive_remaining  INTERVAL NOT NULL,
  window_remaining INTERVAL NOT NULL,
  break_remaining  INTERVAL,
  cycle_remaining  INTERVAL NOT NULL,
  cycle_tomorrow   INTERVAL,
  violations       JSONB NOT NULL DEFAULT '[]',
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON hos_clock_snapshots (driver_id, as_of DESC);
```

Before a dispatcher assigns a load, the check compares the driver's latest clocks with the planned driving on the first leg; a fuller check projects the whole trip with planned rests:

```sql
SELECT d.id AS driver_id,
       c.as_of,
       LEAST(c.drive_remaining, c.window_remaining,
             COALESCE(c.break_remaining, c.drive_remaining), c.cycle_remaining) AS available,
       make_interval(mins => l.planned_drive_minutes) AS needed
FROM drivers d
JOIN LATERAL (
  SELECT * FROM hos_clock_snapshots s
  WHERE s.driver_id = d.id ORDER BY s.as_of DESC LIMIT 1
) c ON TRUE
JOIN loads l ON l.id = $2
WHERE d.id = $1;
-- assign when available >= needed and as_of is recent; otherwise plan a rest
-- stop (a 30-minute break, a 10-hour reset) and recompute at the planned times
```

Design notes:

- **The log is append-only; the periods are a projection.** ELD events and edits arrive in [ELDs & Telematics](/books/logistics/electronic-logging-devices#how-to-build-it)' tables, and `hos_duty_periods` is rebuilt from them; an edit supersedes a period rather than updating it, keeping what dispatch saw when it decided ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).
- **Limits are rows with validity.** `hos_rulesets` lets a pilot participant, an exemption holder or a future rule change get different limits from a date, and the calculator reads them rather than constants.
- **Day boundaries come from the carrier and the home terminal.** `carriers.hos_day_start` and the terminal facility's `time_zone` compute every day boundary; never the server's zone or the driver's current position.
- **Keep the vendor's clocks beside your own.** `computed_by` separates vendor snapshots from internal projections, and a disagreement between them is an alert, not a rounding error.
- **Hours are personal data.** Duty status and location over time describe a person's working life; access, retention and use outside compliance follow [Consent, Law and Retention](/docs/building-blocks/location-tracking#consent-law-and-retention).

## Auditing

- **Records of duty status, six months.** A carrier keeps records of duty status for "not less than 6 months from the date of receipt," and the driver keeps the previous 7 consecutive days available while on duty (395.8(k)); drivers submit records to the carrier "within 13 days" (395.8(a)(2)(ii)).
- **Supporting documents.** Bills of lading, dispatch records, expense receipts, fleet communications and payroll records for each driver's 24-hour period, up to eight per day, each with the driver, date, location and time (395.11), because they are how an auditor tests the log against what the truck did.
- **What dispatch knew.** Each clock snapshot dispatch read when it assigned or extended a load, so a claim that a carrier pushed a driver past limits (harassment and coercion are prohibited, 390.36(b) per the 2015 ELD rule) can be answered with what the carrier saw.
- **Exceptions claimed.** Every use of adverse driving, personal conveyance, the 16-hour exception and short-haul, with the annotation the driver entered ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Compute all four clocks, and project them forward,** before assigning or re-planning a load; the binding clock is often the cycle or the window, not the 11 hours.
- **Count days at the carrier's designated hour in the home terminal's zone,** and store both.
- **Keep the limits as data with validity,** so exemptions, pilots and rule changes are rows.
- **Treat the vendor's clocks as operational truth and the certified log as legal truth,** and alert when your projection disagrees with either.
- **Model sleeper splits and exceptions explicitly** in production; a simple calculator is for planning only.
- **Keep the log append-only and the periods derived,** with every edit and certification preserved.

## References

**Regulations**

- [49 CFR 395.2: Definitions](https://www.law.cornell.edu/cfr/text/49/395.2), the 24-hour period, adverse driving conditions, driving time, on-duty time and the 7 and 8 consecutive days
- [49 CFR 395.3: Maximum driving time for property-carrying vehicles](https://www.law.cornell.edu/cfr/text/49/395.3), the 10, 14 and 11 hours, the 30-minute interruption, 60/7 and 70/8 and the 34-hour restart
- [49 CFR 395.1: Scope of rules in this part](https://www.law.cornell.edu/cfr/text/49/395.1), adverse driving conditions, the 150 air-mile and non-CDL short-haul exceptions, the sleeper berth split, agricultural operations and the 16-hour exception
- [49 CFR 395.8: Driver's record of duty status](https://www.law.cornell.edu/cfr/text/49/395.8), duty status categories, submission within 13 days and six-month retention
- [49 CFR 395.11: Supporting documents](https://www.law.cornell.edu/cfr/text/49/395.11), the five categories, eight per day and their data elements

**Federal Register**

- [Hours of Service of Drivers (June 1, 2020)](https://www.govinfo.gov/content/pkg/FR-2020-06-01/html/2020-11469.htm), 85 FR 33396, effective September 29, 2020: short-haul, adverse driving, the break and the sleeper split, and the pause left out
- [Hours of Service; Personal Conveyance guidance (June 7, 2018)](https://www.govinfo.gov/content/pkg/FR-2018-06-07/html/2018-12256.htm), 83 FR 26377, appropriate and inappropriate uses and laden vehicles
- [Federal Register search: FMCSA yard moves](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=%22yard+moves%22&conditions%5Bagencies%5D%5B%5D=federal-motor-carrier-safety-administration&fields%5B%5D=title&fields%5B%5D=document_number&fields%5B%5D=publication_date&fields%5B%5D=type&fields%5B%5D=citation&per_page=20), the January 2021 proposed guidance (86 FR 179) and no final version
- [Pilot Program To Allow Commercial Drivers To Split Sleeper Berth Time, information collection (October 7, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-10-07/html/2026-20524.htm), the 5-hour minimum, 256 drivers, 16 weeks and comments to December 7, 2026
- [Pilot Program To Allow Commercial Drivers To Pause Their 14-Hour Driving Window, information collection (October 6, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-10-06/html/2026-20476.htm), up to 3 hours at a pickup or delivery, 256 drivers, 16 weeks and the 2020 pilot that never started
- [FMCSA pilot program documents since June 2025 (Federal Register API)](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=federal-motor-carrier-safety-administration&conditions%5Bterm%5D=pilot+program&conditions%5Bpublication_date%5D%5Bgte%5D=2025-06-01&per_page=40&fields%5B%5D=title&fields%5B%5D=document_number&fields%5B%5D=publication_date&fields%5B%5D=type), the September 17, 2025 split sleeper berth proposal (2025-17939) and 14-hour pause notice (2025-17938), and the October 2026 information collections
- [Electronic Logging Devices and Hours of Service Supporting Documents (December 16, 2015)](https://www.govinfo.gov/content/pkg/FR-2015-12-16/html/2015-31336.htm), 80 FR 78292, the harassment prohibition in 390.36(b)

**Vendors**

- [Geotab: DutyStatusAvailability](https://developers.geotab.com/myGeotab/apiReference/objects/DutyStatusAvailability), remaining driving, duty, workday, rest and cycle, the recap and exemption flags
- [Geotab: DutyStatusLog](https://developers.geotab.com/myGeotab/apiReference/objects/DutyStatusLog), event types, record status and the parent of an edited log
- [Motive: List company drivers with Hours of Service](https://developer.gomotive.com/reference/fetch-a-list-of-company-drivers-with-hours-of-service-hos), `v1/hours_of_service` and its durations in seconds
- [Motive: List the HOS logs of the drivers](https://developer.gomotive.com/reference/list-the-hours-of-service-hos-logs-of-the-drivers), `v1/logs` and its events
- [Samsara: Get HOS clocks](https://developers.samsara.com/reference/gethosclocks), remaining drive, shift, break and cycle, cycle tomorrow and violations
- [Samsara: Get HOS logs](https://developers.samsara.com/reference/gethoslogs), log entries by status type, including yard move and personal conveyance, and the advice to wait for uploads
