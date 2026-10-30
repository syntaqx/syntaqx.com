+++
title = "Reminders, Confirmations & Recall"
nav_title = "Reminders & Recall"
description = "Confirmations and reminder cadences, the evidence, no-show measurement, hygiene recall, vaccine and optical reminders, reactivation and unscheduled treatment."
category = "Health Tech Industry"
order = 1931
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "reminders", "recall", "no-shows", "dental", "veterinary", "data-model"]
+++

Reminders are the first product patient engagement vendors sold and still the one every practice buys. They do two jobs that look alike and aren't. **Confirmations and reminders** protect appointments already on the books: a text two days out that the patient confirms, a reminder the morning before, an early warning that Tuesday's 9 a.m. crown won't show. **Recall** creates appointments that don't exist yet: the hygiene patient due for a cleaning six months after the last one, the dog due for its rabies booster, the contact lens wearer whose prescription is about to expire. Confirmations save revenue the practice already scheduled; recall is where much of a dental or veterinary practice's future revenue comes from, because the patient who isn't reminded often doesn't come back. Both losses are real, and only one of them, the no-show, ever appears on the schedule.

This chapter covers both: how the platforms run them, confirmation flows and reminder cadences, what the research says reminders do, no-shows and how to measure them, recall in dentistry, veterinary medicine and optometry, reactivation and unscheduled treatment, and the rules that bound how often a practice may text. It extends `appointments` and `communications` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model) and adds recalls. The sending machinery (consent ledger, one outbound gate, send-time re-checks) is the playbook's [Notifications & Consent](/docs/architecture/notifications); the field-service message lifecycle it resembles is the Field Operations volume's [Customer Communications](/books/field-operations/customer-communications); the texting law for health care is [Two-Way Texting & Messaging](/books/health-tech/patient-texting).

## How the Platforms Do It

As of October 2026, from public product pages and documentation:

| Platform | Reminders and confirmations | Recall | Notable mechanics |
| --- | --- | --- | --- |
| **Open Dental** (PMS) | Automated Messaging rules: eReminders (free with support), eConfirmations ($25 per location per month), thank-yous, arrivals | Recall types, due dates and the Recall List built in; Web Sched Recall ($75) books from a link | Lead time and send order per rule, overridable per clinic; confirmation values written to the appointment |
| **Weave** | Default "the day before the appointment at 10:00 am," configurable in days or hours, several per appointment, by text, call or email | Recall campaigns from PMS data | Reply sentiment read for texts; "Weave will automatically update your calendar with their response" |
| **Solutionreach** | Reminders that let patients "confirm, cancel, or reschedule" | "Targeted messages based on the care, timing, or patient group you choose" | Claims 50,000+ practices |
| **RevenueWell** (dental) | Automated calls, texts and emails | Recall with 24/7 online booking | Claims 11,200+ dental practices; Dentrix, Eaglesoft, Open Dental, Denticon, WinOMS |
| **Lighthouse 360** (Henry Schein One) | Dental patient communication; cadence details not on its public pages | Not detailed publicly | Dental systems only on its supported-platforms list |
| **Yapi** (dental) | Automated texts and emails, confirm by reply | Treatment plan reminders for pending treatment | Dentrix, Eaglesoft, Open Dental |
| **PetDesk** (veterinary) | Appointment reminders; confirmed appointments sent back to the PIMS | "When a reminder is due, it pulls from your PIMS records to send it"; flags clients "overdue for wellness visits or preventive care" | Cornerstone and AVImark integrations |
| **Luma Health** (medical) | "Automated communication" and reminders | "Recalls/care gap closure" | Outbound AI for "cancellation and no-show recovery" |

Two things repeat across vendors. The reminder's real product is the **confirmation status written back to the PMS**, so the front desk's schedule shows which patients confirmed and which to call; Weave, Open Dental and PetDesk all describe that write. And recall is driven from **PMS data**, not from the engagement vendor's own records: the due date, the interval and whether the patient is already booked live in the PMS, and the vendor reads them ([Integrating with Practice Management Systems](/books/health-tech/pms-integration)).

## Confirmations and Reminder Cadences

A typical cadence, built from the vendors' defaults and settings rather than any one of them:

| When | Message | Purpose |
| --- | --- | --- |
| At booking | Confirmation of date, time, location, what to bring, forms link | Transactional record of the appointment |
| A week or more out (long-lead appointments) | Early reminder | Catch conflicts while the slot can still be refilled |
| Two to three days out | Confirmation request: reply C to confirm, R to reschedule | Set the confirmation status; the unconfirmed list becomes the call list |
| The day before | Reminder, often the default (Weave's is 10 a.m. the day before) | Reduce forgetting |
| Morning of (optional) | Short reminder with arrival instructions | Same-day forgetting, parking, curbside check-in for vets |
| After a no-show | Rebook message | Recover the patient into a new slot |

The design points that matter:

- **Confirmation is a status, not a message.** Open Dental's API sets an appointment's confirmation to `None`, `Sent`, `Confirmed`, `Not Accepted`, `Failed` or a practice-defined value; the front desk sorts tomorrow's schedule by it. A reply "C" that changes nothing in the PMS has wasted the patient's effort.
- **Replies are free text.** Patients write "yes," "Yes!", "can't make it," "who is this." Weave reads sentiment on text replies; anything not clearly a confirm or a cancel goes to a person, and STOP is handled before any of it ([Revocation and STOP](/books/health-tech/patient-texting#revocation-and-stop)).
- **Cancel by text is a choice.** Letting patients cancel by reply frees the slot early, which is good, and makes cancelling easy, which some practices don't want. Most offer "reply R to reschedule" and route it to the office or a booking link, rather than a one-word cancel.
- **Lead time is per appointment type.** A two-hour crown deserves an earlier confirmation than a 15-minute recheck, and a new patient's confirmation carries the forms link. Open Dental's rules each have a lead time ("How far in advance of an appointment, or after an appointment") and a send order across methods.
- **Re-check at send time.** A reminder rendered on Monday for Wednesday's appointment must check on Wednesday that the appointment still exists at that time, in that office, with that provider. A reminder for an appointment the front desk moved yesterday is the category's most common error, and it comes from a stale PMS copy ([Drift, Conflicts and Health Checks](/books/health-tech/pms-integration#drift-conflicts-and-health-checks)).
- **Families share phones.** A parent with three children booked back to back should get one message listing all three, not three messages; Open Dental's Web Sched Recall sends family members sharing contact information "one aggregated message." Aggregating also keeps a practice inside the frequency limits of the TCPA's health care exemption (below).

## What Reminders Do: the Evidence

The effect of reminders is one of the better-studied questions in health services research, and the answers are consistent:

- **A 2013 Cochrane review** of mobile phone messaging reminders (8 randomized trials, 6,615 participants) found text reminders improved attendance compared with no reminder (risk ratio 1.14, moderate-quality evidence), with attendance of 67.8% without a reminder and 78.6% with a text. Texts and phone calls performed about the same (RR 0.99), and in two studies texts cost 55% and 65% less per attendance than calls.
- **A 2016 BMJ Open meta-analysis** (26 articles, 21 in the primary analysis) found patients sent digital notifications were 23% more likely to attend (67% against 54%) and less likely to miss (15% against 21%, RR 0.75). "Multiple notifications were significantly more effective at improving attendance than single notifications," and "voice notifications appeared more effective than text notifications."
- **A 2018 systematic review of no-shows** (105 articles) put the average no-show rate "of the order of 23%," highest in Africa (43.0%) and lowest in Oceania (13.2%), and found the most common predictors were "high lead time and prior no-show history."

The studies are mostly medical clinics, not dental or veterinary practices, and I found no peer-reviewed or government no-show rate specific to US dental or veterinary practices. <!-- source-gap: dental-vet-no-show-rates | missing | a peer-reviewed or government source for no-show and late-cancellation rates in US dental and veterinary practices | closes with: an ADA Health Policy Institute, AVMA or peer-reviewed study | checked: 2026-10-29 --> Three conclusions still carry over: more than one reminder beats one, lead time predicts no-shows (so long-lead appointments, which recall usually books six months out, need more reminders, not fewer), and a patient who has missed before is the one to call.

## No-Shows: Economics and Measurement

A no-show costs the practice the production scheduled in the slot, less whatever it recovers by filling it, plus the staff time spent on the chair that sat empty. For a hygiene column the loss is the cleaning, the exam and whatever treatment the exam would have found. The rate a practice cares about is not one number:

- **No-show rate:** appointments where the patient didn't arrive and didn't cancel, over appointments that reached their start time. The denominator excludes appointments cancelled in advance.
- **Late cancellation rate:** cancellations inside a window (24 or 48 hours, per the practice's policy) over the same base. A late cancellation is a no-show the practice learned about too late to fill, and in many practices it's the larger number.
- **Broken appointment rate:** the PMS's own term for the two together. Open Dental breaks appointments as missed (D9986) or cancelled (D9987).
- **Refill rate:** broken appointments whose time was rebooked by someone else before it started, which is what waitlists and ASAP lists exist to raise ([Waitlists and ASAP Lists](/books/health-tech/scheduling-and-online-booking#waitlists-and-asap-lists)).
- **Lost production:** scheduled production of broken appointments not refilled.

Measurement pitfalls are specific. A practice that converts no-shows to "cancelled" when it rebooks them hides them; compute from the status history, not the final status. A reminder vendor reporting "confirmation rate" is measuring replies, not attendance; the outcome is arrival. And comparing the rate before and after buying a reminder product mixes in seasonality and staff changes, so the honest comparison is a holdout: a random slice of appointments that get the old cadence, measured by arrival ([Progressive Rollout](/docs/delivery/feature-flags#progressive-rollout)). This part's Practice Analytics & AI Front Desk chapter defines the practice KPIs these feed.

## Recall: the Core Revenue Loop

Recall is a due date attached to a patient for a kind of visit, recalculated when the visit happens. Each completed visit sets the next due date, outreach starts before it, and a patient who books closes the loop. A patient who doesn't is overdue, then lapsed, then a reactivation target.

### Hygiene Recall

Open Dental's model is representative. Each patient may have one recall per recall type ("A patient may only have one recall for each RecallType"), and the default types are Prophy, Child Prophy and Perio, each triggered by specific procedures. "A common prophy interval is 6 months plus 1 day" (why a single day can matter to a dental plan's frequency limits is covered in this part's Dental Practice chapter). Completing a trigger procedure recalculates the due date: Calculated Due Date equals the previous date plus the interval, and the interval is stored as a string like `1y6m20d`. A patient diagnosed with periodontal disease moves from prophy to perio recall at a shorter interval, and the API has a call for it (`PUT /recalls/SwitchType`). `DateDue` is "the date that is actually used when doing reports for recall," separate from the calculated date because the office can override it.

The outreach is a sequence. Open Dental's Setup Recall sets the days between reminders, a maximum number of reminders and of automated reminders, a Days Past and Days Future range bounding the Recall List, templates per reminder number, the mode (email, postcard, Web Sched email or text), and an exclusion for patients who already have a recall or any future appointment. Web Sched Recall puts a booking link in the message; by default it sends at most two recall messages every ten minutes per clinic, so a practice doesn't flood its own phones.

My rules for recall outreach:

- **Start before the due date.** A patient due in March should hear in February, because the hygiene schedule fills weeks ahead; the reminder that lands on the due date offers slots a month later.
- **Exclude anyone already booked,** checked at send time against fresh data, not when the list was built.
- **Book from the message.** A recall text with a link to real open hygiene slots for that patient converts better than "call us," and it's the safest identity for online booking ([New Patients Versus Existing](/books/health-tech/scheduling-and-online-booking#new-patients-versus-existing)).
- **Stop after a limit,** and move the patient to reactivation rather than texting a lapsed patient every month forever.
- **Reappoint in the chair.** The best recall is the next hygiene visit booked before the patient leaves; outreach is the fallback for those who wouldn't book six months out.

### Vaccine and Wellness Reminders

Veterinary recall is driven by **reminders on the patient (the animal)** for vaccines, heartworm and parasite tests, dental cleanings and annual wellness exams, each with its own interval from the last time the service was performed, and sent to the **client (the owner)**. A household with two dogs and a cat has a dozen due dates and one phone. PetDesk's reminders "pull from your PIMS records" when due and flag clients "overdue for wellness visits or preventive care." Two veterinary specifics: the reminders are often the legal or practical trigger for a required vaccine (a rabies booster for licensing), and veterinary clinics are not HIPAA covered entities, which changes the texting analysis below. The veterinary record model is this part's Veterinary Practice chapter.

### Optical and Other Recalls

Optometry recalls annual or biennial eye exams and, separately, contact lens wearers whose prescriptions are about to expire, since a patient can't refill lenses on an expired prescription (the federal prescription rules are in this part's Optometry, PT & Other Specialties chapter). Physical therapy recalls patients at the end of a plan of care for a re-evaluation and reactivates patients who dropped out of one. Medical practices run care-gap recall from quality measures (Luma lists "recalls/care gap closure"), covered in this volume's Value-Based Care & Quality chapter. All of them fit the same shape: a recall type, an interval or a computed due date, a status and an outreach sequence.

## Reactivation and Unscheduled Treatment

Two more lists hold revenue the schedule doesn't show.

- **Unscheduled treatment.** A dentist diagnoses a crown; the patient says they'll call. Open Dental models this as a **Planned** appointment (`POST /appointments/Planned`, later `SchedulePlanned`, which "creates Scheduled from Planned, leaves planned intact") and an **Unscheduled List** for broken appointments waiting to be rebooked. Yapi sells "treatment plan reminders for pending treatment." The follow-up is a reminder about a specific diagnosed treatment, so it's a treatment communication, and it's also the message most likely to be read as a sales pitch. Keep it factual: what was recommended, by whom, and how to book. Case acceptance and treatment planning are in this part's Dental Practice chapter.
- **Reactivation.** Patients with no visit and no appointment in 18 months or more, the threshold being the practice's choice. Reactivation is recall's last step, with fewer messages and a clear end, and a lapsed patient's contact details are often stale: a reassigned number now belongs to someone else, and texting it is a TCPA problem, not a marketing one ([Reassigned Numbers](/docs/compliance/consumer-contact#reassigned-numbers)).

## What the Rules Allow

Reminder and recall texts sit under three regimes at once.

**The TCPA health care exemption.** Automated texts to a cell phone need the recipient's prior express consent, but 47 CFR 64.1200(a)(9)(iv) exempts calls and texts "made by, or on behalf of, healthcare providers" when every condition holds, including that the message is not charged to the recipient or counted against their plan. The permitted purposes start with "appointment and exam confirmations and reminders" and "wellness checkups," the message must be under 160 characters, and the provider may send no more than one message a day and three a week per patient. A practice relying on the exemption has a hard frequency budget, which is why family aggregation and cadence design matter. The full conditions, and why I don't build a product that depends on the exemption alone, are in [The TCPA Healthcare Exemption](/books/health-tech/patient-texting#the-tcpa-healthcare-exemption).

**HIPAA's marketing rule.** A reminder or recall from the practice about the patient's own care is a treatment communication, not marketing, unless the practice is paid by a third party to send it (45 CFR 164.501). A recall text that adds "ask about whitening, 20% off this month" has become a communication about a product that encourages its purchase, and is marketing under HIPAA and telemarketing under the TCPA. Keep promotions in separate templates with marketing consent ([Marketing Versus Treatment](/books/health-tech/patient-texting#marketing-versus-treatment)).

**The veterinary difference.** A veterinary clinic isn't a HIPAA covered entity, and the TCPA exemption's text speaks of health care providers and requires HIPAA compliance. I wouldn't rely on the exemption for a vet clinic at all: get express consent for reminders when the client gives their number, which clinics collect at registration anyway.

## How to Build It

The chapter adds recall types and recalls, a reminder policy, and the confirmation status on appointments, and uses `communications` for every message sent:

```sql
CREATE TABLE recall_types (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  name               TEXT NOT NULL,              -- 'Prophy', 'Perio', 'Rabies', 'Annual Eye Exam'
  kind               TEXT NOT NULL CHECK (kind IN ('hygiene', 'perio', 'vaccine', 'wellness',
                       'eye_exam', 'contact_lens_rx', 'plan_of_care', 'care_gap', 'other')),
  default_interval   INTERVAL NOT NULL,          -- '6 months 1 day', '1 year', '3 years'
  trigger_codes      TEXT[] NOT NULL DEFAULT '{}',  -- procedures that reset it
  appointment_type_id UUID REFERENCES appointment_types (id)  -- what a recall books
);

CREATE TABLE recalls (                           -- one per patient per recall type
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  patient_id         UUID NOT NULL REFERENCES patients (id),   -- vet: the animal
  recall_type_id     UUID NOT NULL REFERENCES recall_types (id),
  interval           INTERVAL NOT NULL,          -- per patient; copied from the type
  previous_on        DATE,
  calculated_due_on  DATE,                       -- previous_on + interval
  due_on             DATE,                       -- what reports and outreach use; may be overridden
  status             TEXT NOT NULL CHECK (status IN ('due', 'scheduled', 'contacted', 'declined',
                       'lapsed', 'disabled')),
  scheduled_appointment_id UUID REFERENCES appointments (id),
  outreach_count     SMALLINT NOT NULL DEFAULT 0,
  last_outreach_at   TIMESTAMPTZ,
  source_external_id TEXT,                       -- the PMS's recall key, when synced
  UNIQUE (patient_id, recall_type_id)
);

CREATE TABLE reminder_policies (                 -- cadence as data, versioned per location
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  location_id        UUID NOT NULL REFERENCES locations (id),
  version            INT NOT NULL,
  steps              JSONB NOT NULL,             -- [{"key": "confirm_72h", "offset": "-72 hours",
                                                 --   "template_id": "...", "only_types": [...]}]
  recall_steps       JSONB NOT NULL,             -- [{"offset_from_due": "-30 days"}, ...]
  max_recall_outreach SMALLINT NOT NULL DEFAULT 3,
  aggregate_family   BOOLEAN NOT NULL DEFAULT TRUE,
  relies_on_tcpa_healthcare_exemption BOOLEAN NOT NULL DEFAULT FALSE,
  effective_from     TIMESTAMPTZ NOT NULL,
  approved_by        UUID NOT NULL,
  UNIQUE (location_id, version)
);

ALTER TABLE appointments
  ADD COLUMN confirmation_status TEXT NOT NULL DEFAULT 'none'
    CHECK (confirmation_status IN ('none', 'sent', 'confirmed', 'not_accepted', 'failed',
           'confirmed_by_staff')),
  ADD COLUMN confirmed_at TIMESTAMPTZ,
  ADD COLUMN confirmed_via_communication_id UUID REFERENCES communications (id),
  ADD COLUMN broken_kind TEXT CHECK (broken_kind IN ('no_show', 'late_cancel', 'cancel')),
  ADD COLUMN broken_at TIMESTAMPTZ,
  ADD COLUMN refilled_by_appointment_id UUID REFERENCES appointments (id);

ALTER TABLE communications
  ADD COLUMN subject_appointment_id UUID REFERENCES appointments (id),
  ADD COLUMN subject_recall_id UUID REFERENCES recalls (id),
  ADD COLUMN subject_version TEXT,               -- the appointment version it was rendered for
  ADD COLUMN cadence_step TEXT,                  -- 'confirm_72h', 'day_before', 'recall_1'
  ADD COLUMN reminder_policy_version INT;
```

Notes on the sketch:

- **Recalls are the PMS's, mirrored.** When the PMS owns recall (Open Dental, Dentrix, Cornerstone), `recalls` is a synced copy with `source_external_id`, and only outreach fields are yours. When you own it (a practice on a system without recall, or a vendor that computes care gaps), the same table is authoritative.
- **One recall per patient per type,** as Open Dental enforces, with the interval on the patient's row because a perio patient's interval isn't the type's default.
- **Every send carries its subject and its version.** `subject_version` is what the send-time check compares against; a mismatch drops the message, and the drop is logged ([Event-Triggered, Re-Checked at Send Time](/docs/architecture/notifications#event-triggered-re-checked-at-send-time)).
- **Idempotency key per step.** The key is the appointment, the cadence step and the appointment version, so a double-fired event sends one reminder, and a reschedule starts a new sequence.
- **The exemption is a flag on the policy.** A location whose policy relies on the TCPA health care exemption gets a frequency budget enforced at send time (one a day, three a week per patient across every template) and a 160-character limit enforced at render; a location with express consent on file doesn't.
- **Broken appointments are recorded, not overwritten,** with what refilled them, so no-show, late-cancel and refill rates come from history.
- **Events:** `appointment.confirmed`, `appointment.broken`, `recall.due`, `recall.scheduled` and `recall.lapsed` drive the cadence and the reports.

## Auditing

- **Every reminder and recall message with its subject, version and cadence step,** and every suppressed one with the reason (stale appointment, already booked, frequency budget, no consent, quiet hours). "Why didn't my patient get a reminder?" is answered by the suppression row.
- **Every confirmation status change** with the message that caused it or the staff member who set it.
- **Recall due-date overrides and interval changes,** since they change what a patient is told and, for dental frequency limits, whether insurance pays.
- **The policy version in force** for every send, so a TCPA complaint can be answered with the exact cadence and frequency limits that applied.

## What This Means for the System You Build

- **Write confirmation status back to the PMS;** that's the product the front desk uses.
- **Run cadences as versioned policy per location and appointment type,** with lead times that grow with booking lead time and multiple reminders by default.
- **Re-check every reminder at send time** against a fresh copy and drop stale ones.
- **Aggregate families,** and enforce one-a-day, three-a-week budgets wherever a policy relies on the TCPA health care exemption.
- **Measure arrival, not replies:** no-show, late-cancel, refill and lost production from appointment history, against a holdout.
- **Model recall as a due date per patient per type,** reset by trigger procedures, with outreach that starts early, excludes the booked, books from the message and stops at a limit.
- **Treat veterinary reminders as owner contact under express consent,** with due dates per animal.
- **Keep promotions out of reminder and recall templates.**

## References

**Regulation**

- [Cornell LII: 47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), the health care exemption's purposes, 160-character limit, one-a-day and three-a-week limits, and the no-charge condition
- [Cornell LII: 45 CFR 164.501](https://www.law.cornell.edu/cfr/text/45/164.501), marketing and the treatment communication exception

**Research**

- [Gurol-Urganci et al.: Mobile phone messaging reminders for attendance at healthcare appointments (Cochrane, 2013)](https://pubmed.ncbi.nlm.nih.gov/24310741/), 8 trials, RR 1.14, attendance 67.8% and 78.6%, texts against calls and cost per attendance
- [Robotham et al.: Using digital notifications to improve attendance in clinic (BMJ Open, 2016)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5093388/), RR 1.23 for attendance and 0.75 for no-shows, multiple notifications and voice against text
- [Dantas et al.: No-shows in appointment scheduling, a systematic literature review (Health Policy, 2018)](https://pubmed.ncbi.nlm.nih.gov/29482948/), the average no-show rate of about 23% and its predictors

**PMS documentation**

- [Open Dental: Recall types](https://www.opendental.com/manual/recalltypes.html), Prophy, Child Prophy and Perio, the six months plus one day interval
- [Open Dental: Recall](https://www.opendental.com/manual/recall.html), due date calculation and status reset
- [Open Dental: Recall setup](https://www.opendental.com/manual/recallsetup.html), reminder spacing and limits, Days Past and Days Future, exclusions, modes and templates
- [Open Dental: Recalls API](https://www.opendental.com/site/apirecalls.html), one recall per type, `DateDue`, interval strings, switching prophy and perio
- [Open Dental: Web Sched Recall setup](https://www.opendental.com/manual/webschedrecallsetup.html), send rate and family aggregation
- [Open Dental: Appointments API](https://www.opendental.com/site/apiappointments.html), confirmation values, planned and unscheduled appointments, missed and cancelled codes
- [Open Dental: Automated Messaging](https://www.opendental.com/manual/automatedmessaging.html), rule types, lead time and send order
- [Open Dental: Fees](https://opendental.com/site/fees.html), eReminders, eConfirmations and Web Sched Recall prices

**Vendors**

- [Weave: Reminders](https://www.getweave.com/weave-reminders/), the day-before 10 a.m. default, channels, sentiment and calendar updates
- [Solutionreach](https://www.solutionreach.com/), confirm, cancel or reschedule, recall targeting, practice count
- [RevenueWell](https://www.revenuewell.com/), reminders, recall, online booking, practice count and integrations
- [Lighthouse 360: Supported platforms](https://www.lh360.com/support/supported-platforms/), dental systems supported
- [Yapi](https://yapiapp.com/), reminders and treatment plan reminders
- [PetDesk: Cornerstone](https://petdesk.com/compatible-pims/cornerstone), reminders pulled from PIMS records and overdue wellness flags
- [Luma Health](https://www.lumahealth.io/), recalls and care gap closure, no-show recovery
