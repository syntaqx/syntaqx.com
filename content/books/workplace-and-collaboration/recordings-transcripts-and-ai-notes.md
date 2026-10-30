+++
title = "Recordings, Transcripts & AI Notes"
nav_title = "Recordings & AI Notes"
description = "Meeting recordings, transcripts and AI summaries: who owns them, compliance recording, notetaker bots and the Otter case, consent law, voiceprints and expiry."
category = "Workplace & Collaboration Industry"
order = 2019
part = "Meetings and Voice"
tags = ["meetings", "recording", "transcription", "ai-notes", "recording-consent", "retention"]
+++

A meeting that nobody records is gone when it ends. Press record and it becomes a file: a video someone owns, stored in some tenant's storage, shared with some audience, indexed for search, subject to a retention policy and a legal hold, and producible in discovery. Turn on transcription and every sentence becomes searchable text with a speaker attached. Turn on an AI summary and the service writes its own account of what was decided and who owes what, then emails it to people who may not have attended. Let a third-party notetaker join and a company the other participants never heard of now holds the conversation.

Each step adds value and each adds a duty. Consent law differs by state and country and applies to everyone on the call, not just the account that pressed the button. Ownership is not obvious: the organizer, the person who started the recording, the channel, the company. Retention pulls two ways, because storage teams want recordings to expire and legal teams want them preserved. And AI raises a question the industry answered publicly in 2023 and is still litigating in 2026: whether the vendor may use what was said for its own purposes. This chapter covers how Teams, Zoom and Meet store recordings and transcripts, convenience versus compliance recording, captions and speaker identification, AI summaries and notetaker bots including the Otter.ai litigation, the consent law, and expiry and retention. The meeting itself is [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video); preservation and discovery in general are [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) and [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export).

## How the Platforms Do It

As of October 2026:

| Platform | Where recordings live | Notice and consent | Expiry and retention | AI notes |
| --- | --- | --- | --- | --- |
| **Microsoft Teams** | Organizer's OneDrive (private meetings) or the channel's SharePoint site, as ordinary files under Purview | Notification enforced; an explicit-consent policy requires participants to agree before being recorded or transcribed | Auto-expiry default of 120 days, set by policy; Purview retention for compliance | Copilot "only during the meeting" without a saved transcript, or during and after with one |
| **Zoom** | Zoom cloud recording | Consent prompt on recording start or on joining a recorded meeting; leave to opt out | "Delete cloud recordings after a specified number of days"; 30-day trash; WORM retention on request | AI Companion summaries shared by the host; Zoom AI can join Teams and Meet meetings |
| **Google Meet** | Organizer's Google Drive, in a "Google Meet" folder | Everyone notified when recording starts or stops, including external and phone participants | Governed as a Drive file | "Take notes for me" saved to the organizer's Drive and emailed to chosen recipients |
| **Third-party notetakers** (Otter.ai and others) | The notetaker vendor's cloud | Whatever the bot and its vendor provide | The vendor's policy | The product itself; Otter's is the subject of a class action filed in 2025 |

The suites converged on one design: **a recording is a file in the customer's own storage,** so the customer's permissions, retention policies, holds, DLP and search apply without special cases. Microsoft states that "Microsoft Purview, OneDrive file storage, and access permissions apply to the meeting recording files the same as with other files," and that Microsoft 365 Search indexes them. Zoom, without its own document store, keeps recordings in its cloud with its own retention controls. Notetaker vendors sit outside the customer's tenant entirely, which is the source of most of the legal trouble in this chapter.

## Who Owns a Recording

Ownership decides who can share, download, delete and keep a recording after people leave, and the vendors encode it in storage location:

- **Teams** uploads a meeting recording to "the meeting organizer's OneDrive (private meetings) or SharePoint (channel meetings)." People invited to the meeting get permission to view; guests and external attendees see it only if it's "explicitly shared with them." Users with edit rights can change permissions and share further. For channel meetings, an admin policy can block downloads, saving recordings to a `Recordings\View only` folder where only channel owners have full rights.
- **Google Meet** saves recordings "to the meeting organizer's Google Drive," in a Google Meet folder with a sub-folder per meeting; the organizer and the person who started the recording get an email with the link, same-organization attendees get shortcuts in their Drive, the link is added to the Calendar event, and groups don't automatically get access.

Putting the recording in a person's storage has a predictable failure: the person leaves. A recording in a departed employee's OneDrive or Drive follows that account's offboarding, which may mean transfer to a manager, a retention hold, or deletion with the account. Content ownership transfer at offboarding is [Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim#content-ownership-on-the-way-out); a system that stores recordings per person needs the same transfer path, or recordings of team meetings vanish with whoever happened to schedule them.

Who may record at all is policy. Teams requires both the organizer and the recording initiator to have recording permission; guests can't start convenience recordings; external participants can't record "except when it's a Teams third-party compliance recording." Meet requires the admin to turn on recording, and a participant can't record if the host lacks permission. Recording is never a participant's right in a workplace product; it's a capability the customer's admin grants.

## Convenience and Compliance Recording

There are two kinds of recording with different owners and different rules, and Microsoft's comparison table states the difference precisely:

| Property | Convenience recording | Compliance recording |
| --- | --- | --- |
| Started by | A licensed user, as policy allows | The system, for users under an admin policy |
| Storage and access owner | The meeting's OneDrive or SharePoint | Admin or compliance officer |
| Participant notification enforced | Yes | Yes |
| Participant consent supported | Yes | No |
| Retention | Meeting storage rules | Configured in the partner solution |

**Compliance recording** captures every call and meeting of a user under policy, automatically and "owned by the company," for regulations Microsoft lists as including MiFID II, Dodd-Frank, FDCPA, HIPAA and GDPR. It's built by certified third parties whose recording bots join calls through Microsoft Graph and run on Windows virtual machines in Azure; Microsoft lists nineteen certified partners as of October 2026, from ASC and NICE to Verint and Theta Lake. Users under the policy are told they're recorded (a visual notice in Teams clients, an audio notice for PSTN and SIP callers) and "might not be able to disable the recording and might not have access to the recording." Compliance recording isn't supported for E911 calls, and its platform is tested to 750 users per meeting. Because it needs the media, a user subject to it can't use end-to-end encryption ([Meetings & Video](/books/workplace-and-collaboration/meetings-and-video#e2ee-as-shipped)).

A related cross-tenant rule: if an external participant subject to their own employer's compliance recording joins, "the other organization records that meeting or call for compliance purposes, regardless of the Meeting recording setting in your organization," and the organizers are notified so they can remove that participant. One tenant's regulatory duty reaches into another tenant's meeting, and the product resolves it with notice rather than a block. Why a broker-dealer must capture these communications at all is [Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications#cftc-and-mifid-ii-recording-calls-and-chats).

## Transcripts, Captions and Speaker Identification

**Live captions** are generated and shown during the meeting and, depending on settings, not kept. A **transcript** is stored, timestamped and attributed to speakers, and in Teams it's stored and expires alongside the recording. Captions are an accessibility feature with a legal floor of their own ([Accessibility & Localization](/books/workplace-and-collaboration/accessibility-and-localization)); transcripts are records.

Speaker attribution is where transcription becomes biometrics. Microsoft's voice and face enrollment lets a user opt in to a voice profile (built manually or passively "from in-meeting speech") and a face profile, used for speaker attribution, voice isolation and identifying people in Teams Rooms. Microsoft's published rules for it, as of October 2026:

- Enrollment is on by default at the policy level, but each user must opt in, and can unenroll at any time, even after an admin disables enrollment.
- A profile is removed immediately on unenrollment, within 90 days of the account's deletion, and automatically if unused for one year.
- Admins can see enrollment status and delete a user's profile but can't export it; only the user can export their data.
- Microsoft says it doesn't use the profiles "to train any models or for any other purposes other than providing the voice and face enrollment feature."

Those rules read like a checklist written for biometric privacy law. Illinois' Biometric Information Privacy Act lists a voiceprint as a biometric identifier and requires informed written consent before collection, a published retention schedule and destruction, with liquidated damages per violation; the User-Generated Platforms volume covers it in [Faces, Biometrics and the Law](/books/user-generated-platforms/camera-and-effects#faces-biometrics-and-the-law). A meeting product that identifies speakers by voice is collecting voiceprints, whether or not anyone calls them that.

## AI Summaries and Meeting Assistants

AI meeting features come in three shapes: answering questions during the meeting, producing a recap afterward, and taking action items into other tools. The design choice that matters is **whether a durable transcript is created to feed them.**

Microsoft makes that choice an explicit setting. Copilot in Teams meetings runs either **during and after the meeting**, which requires someone to start transcription, or **only during the meeting**, which "relies on speech-to-text audio processing data that isn't saved after the meeting or event ends." The organizer picks per meeting within the admin's policy, and the policy's default value is the strictest about records: "On with saved transcript required," under which Copilot always runs from a saved transcript and organizers can't change it. Two details show how the parts interlock. Turning Copilot off for a meeting also turns off recording and transcription. And even in "only during" mode, "Copilot prompts and responses during meetings might be retained for compliance purposes" under the customer's Purview retention policies. The AI's interaction is itself a record, governed by the same admin.

Zoom's AI Companion meeting summary is controlled by the host: if the host chooses to share it, signed-in participants receive it by email and in the meeting's Team Chat, people who weren't signed in don't, the host can share it later with anyone by email, only the host can edit or delete it, and "the account owner can access the meeting summary." Summaries have their own auto-delete setting, separate from recordings. Google's "Take notes for me" can be started by the organizer and internal participants (or only hosts when host controls are on), shows every participant a notice and a pencil icon, saves notes to the organizer's Drive, and emails them to the people the organizer chose after the meeting; it supports one spoken language per meeting.

Three properties of AI notes deserve design attention:

- **A summary is a new record, not a copy.** It can be wrong, it attributes statements and commitments to people, and it's discoverable like any document. Record which model and settings produced it, and let the organizer correct it.
- **Distribution can exceed attendance.** Every vendor lets the organizer send the summary to people who weren't in the room, which publishes participants' words to a wider audience than they spoke to.
- **Training is the question customers ask first.** In a post on its terms of service and AI published August 7, 2023 (updated February 7, 2024), Zoom stated that it "does not use any customer audio, video, chat, screen sharing, attachments, or other communications" to train its own or third-party AI models. Customer data-use commitments across AI features are [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants#data-use-commitments).

## Notetaker Bots

A notetaker bot is an app that joins a meeting as a participant, records or transcribes it, and sends notes to the person who invited it, usually after connecting to that person's calendar so it joins every meeting automatically. The suites now build their own: Zoom lets admins or users allow Zoom AI "to join meetings on third-party platforms," such as Teams and Google Meet, with a bot that can "join all meetings on a user's synced calendar automatically," and with an optional email to all invitees or only the host ten minutes before the meeting.

The legal exposure sits in the gap between the one person who invited the bot and everyone else in the meeting.

### The Otter.ai Litigation

On August 15, 2025, a plaintiff filed a putative class action against Otter.ai in the Northern District of California (No. 5:25-cv-06911), later captioned In re Otter.ai Privacy Litigation. The operative complaint, as the court summarized it, alleges that the Otter Notetaker joins Zoom and Teams meetings as a "silent participant," records and transcribes them "without obtaining the consent of all participants," and keeps the conversations and voiceprints "for its own commercial use, including to train its automatic speech recognition and machine-learning models." Seven plaintiffs from California, Illinois and Washington pleaded the Electronic Communications Privacy Act, the Computer Fraud and Abuse Act, the California Invasion of Privacy Act (CIPA), California's computer-fraud statute, the California Constitution, the Unfair Competition Law, Illinois' Biometric Information Privacy Act (BIPA), the Washington Privacy Act and common-law privacy torts.

On August 13, 2026, Judge Eumi K. Lee granted Otter's motion to dismiss in part. The order's reasoning, at the pleading stage:

- **Standing.** Recording private conversations without consent "closely resembles the common-law privacy tort of intrusion upon seclusion," so the plaintiffs had a concrete injury; the court distinguished the Ninth Circuit's session-replay case, Popa v. Microsoft, because eavesdropping on whole conversations about medical and financial matters is "materially more invasive" than watching clicks on a website.
- **Wiretap Act: survives.** Real-time recording is a contemporaneous interception. Otter argued it was a party to the meetings; the court held that the party exception doesn't apply to an interception for a "criminal or tortious" purpose, that the plaintiffs alleged Otter used their conversations to train its models "for its own pecuniary gain," and that "committing a tort and seeking a profit are not mutually exclusive."
- **CIPA section 631: survives, and this is the holding that matters for notetakers.** Otter said its Notetaker is an invited participant that "functions as the meeting host's recording tool." The court agreed that a software vendor acting only as "an extension" of its customer isn't a third-party interceptor, but held that because the plaintiffs alleged Otter "independently collects, retains, and uses communications for its own commercial purposes," they had "sufficiently alleged that Otter is a third-party eavesdropper under section 631."
- **BIPA: survives.** Voiceprints are biometric identifiers, and the complaint alleged Otter builds a "speaker identification profile" so it "will be able to recognize that speaker in future conversations"; the court let both the collection-without-written-release claim (section 15(b)) and the missing retention-schedule claim (section 15(a)) proceed.
- **Dismissed with leave to amend:** the CFAA claims (no access to the plaintiffs' computers, no cognizable loss), the California computer-fraud claim, the Washington Privacy Act claim, and the intrusion claims of plaintiffs who described their conversations only as "private" or "sensitive." The intrusion and confidential-communication (section 632) theories survived for the plaintiff whose meeting was with a medical provider.

The case is pending in discovery as of October 2026 (a protective-order ruling followed on August 20, 2026), and nothing in it is a final ruling on the merits.

The design lesson doesn't wait for the verdict, because the order draws the line itself. Under the federal one-party rule, a participant can consent to recording, and a tool acting purely as that participant's recorder is, in the court's words, "an extension" of its customer. A vendor that keeps the recording and uses it for its own product is alleged to be a different party, and the participant's consent may not reach it. A notetaker that wants to stay on the right side of that line keeps data only for its customer, doesn't train on it without consent from the people recorded, announces itself to everyone, and lets anyone in the meeting stop or remove it.

The customer's admin has three levers over bots, and all three belong in the product: app approval (which bots may be installed or connected to calendars at all, [Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces)), the lobby (a bot is a participant and can be held there; [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video#meeting-security)), and participant identity (showing bots as bots, with the app behind them, rather than as a person's name).

## Consent Law

The floor is set by wiretap and eavesdropping statutes written for phone calls:

- **US federal law is one-party consent.** 18 U.S.C. 2511(2)(d) makes it lawful for a person who is "a party to the communication," or where "one of the parties to the communication has given prior consent," to intercept it, unless the purpose is a criminal or tortious act.
- **Some states require every party.** California Penal Code 632 prohibits recording "without the consent of all parties to a confidential communication," and Penal Code 637.2 gives a civil claim for the greater of $5,000 per violation or three times actual damages. Illinois and Washington are the other common examples; the playbook's [Recording Calls](/docs/compliance/consumer-contact#recording-calls) covers them and the build-to-the-strictest-rule approach.
- **In the EU and UK,** a recording of identifiable people is personal data that needs a lawful basis and transparency ([GDPR](/docs/compliance/gdpr#lawful-bases)), and an employer recording employees adds the works-council and monitoring rules of [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy).

A meeting has participants in many places, so the vendor mechanisms all implement the strictest rule as a product default: **notice before capture, an indicator throughout, and a way to decline.**

- Zoom prompts participants for consent when the host starts recording or when they join a meeting already being recorded; on desktop and mobile they click OK or leave, on H.323/SIP devices they press # to consent or * to exit, and admins can customize the notice and scope it to external participants or everyone, depending on the account.
- Teams always notifies participants of recording, and an admin policy (`-ExplicitRecordingConsent`) requires "participants to give their explicit consent to be recorded or transcribed" in meetings organized under it. Admins can also replace the default recording privacy statement with their own URL.
- Meet notifies all participants when recording starts or stops, including people outside the organization and on phones, who are told but "can't control the recording."

Transcription and AI notes are recordings for consent purposes, and the vendors treat them so: Teams' explicit consent covers transcription, and Meet notifies participants when notes are taken. The playbook's [Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data) states the general rule.

## Expiry, Retention and Holds

Recordings are large and mostly never watched again, so storage owners want them to expire; some recordings are evidence, so legal owners want them kept. The products resolve it with two separate mechanisms, and confusing them is the common mistake.

**Expiry** is storage management. In Teams, recordings and transcripts get a default expiration of 120 days, configurable per policy from 1 to 99,999 days, or never (-1, PowerShell only); A1 education users are capped at 30 days, changes apply only to new recordings, and published event recordings have their own shorter expiry that organizers can extend. An expired file moves to the OneDrive or SharePoint recycle bin, which for work accounts deletes items after 93 days unless an admin changed it. Zoom's equivalent deletes cloud recordings a set number of days after creation, with a separate 30-day trash that admins can't lock and that doesn't count against storage.

**Retention and holds** are compliance. A Teams recording is an ordinary OneDrive or SharePoint file, and Microsoft states that Purview applies to recording files "the same as with other files," so the tenant's retention policies and holds govern it alongside the expiry setting; Zoom offers WORM (write once, read many) retention through its support team, under which recordings "can't be edited or deleted until the retention period expires" and auto-delete starts only after it. The rule to implement: **a hold always beats an expiry, and an expiry never silently deletes a held item.** Retention design in general is [Data Retention & Deletion](/docs/architecture/data-retention#retention-windows); preservation and the spoliation cases that punish getting it wrong are [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold).

Copies leak outside both. Teams keeps recordings that fail to upload available for local download for 20 days; summaries emailed to recipients live in their mailboxes under the mailbox's retention; notetaker vendors keep their own copies under their own policies. An organization's retention policy covers the copy in its storage, not the copies its meeting features distributed.

## How to Build It

The [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) has `items.kind = 'recording'`. This chapter adds the recording kind table, transcripts, AI summaries, consent and voice profiles, keyed to the meeting sessions of [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video#how-to-build-it). Async video reuses `recordings` in [Async Video & Screen Recording](/books/workplace-and-collaboration/async-video#how-to-build-it).

```sql
CREATE TABLE recordings (                  -- kind table for items.kind = 'recording'
  item_id              UUID PRIMARY KEY REFERENCES items (id),
  source               TEXT NOT NULL CHECK (source IN ('meeting', 'compliance', 'async',
                         'call')),
  meeting_session_id   UUID REFERENCES meeting_sessions (id),
  started_by           UUID REFERENCES members (id),      -- null for compliance and system
  app_installation_id  UUID REFERENCES app_installations (id),  -- recorder or notetaker app
  owner_container_id   UUID NOT NULL REFERENCES containers (id), -- the person's drive or the
                                                           -- channel's library it lives in
  storage_key          TEXT NOT NULL,
  duration             INTERVAL,
  layout               TEXT,                -- speaker, gallery, content: what was composed
  expires_at           TIMESTAMPTZ,         -- storage expiry; ignored while any hold applies
  download_blocked     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transcripts (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  meeting_session_id   UUID NOT NULL REFERENCES meeting_sessions (id),
  recording_item_id    UUID REFERENCES recordings (item_id),
  language             TEXT NOT NULL,
  engine_version       TEXT NOT NULL,
  durable              BOOLEAN NOT NULL,    -- false for "only during the meeting" processing
  storage_key          TEXT,                -- null when not durable
  expires_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meeting_summaries (           -- AI notes: a derived record with its provenance
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  meeting_session_id   UUID NOT NULL REFERENCES meeting_sessions (id),
  transcript_id        UUID REFERENCES transcripts (id),
  produced_by          TEXT NOT NULL,       -- model and prompt version
  item_id              UUID REFERENCES items (id),         -- when saved as a page or file
  shared_with          JSONB NOT NULL,      -- recipients chosen by the organizer
  edited_by            UUID REFERENCES members (id),
  expires_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE capture_consents (            -- notice and answer, per participant per capture
  meeting_participant_id UUID NOT NULL REFERENCES meeting_participants (id),
  capture_kind         TEXT NOT NULL CHECK (capture_kind IN ('recording', 'transcription',
                         'ai_notes', 'compliance')),
  notice_version       TEXT NOT NULL,       -- which text, including a customer's custom URL
  response             TEXT NOT NULL CHECK (response IN ('notified', 'accepted', 'declined',
                         'left')),
  channel              TEXT NOT NULL CHECK (channel IN ('visual', 'audio_prompt', 'keypad',
                         'email_before')),
  responded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (meeting_participant_id, capture_kind, notice_version)
);

CREATE TABLE voice_profiles (              -- opt-in biometric enrollment for speaker attribution
  member_id            UUID PRIMARY KEY REFERENCES members (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('voice', 'face', 'voice_and_face')),
  enrollment           TEXT NOT NULL CHECK (enrollment IN ('manual', 'passive')),
  consented_at         TIMESTAMPTZ NOT NULL,
  consent_text_version TEXT NOT NULL,
  last_used_at         TIMESTAMPTZ,
  delete_after         TIMESTAMPTZ NOT NULL, -- unused-profile and account-deletion limits
  storage_key          TEXT NOT NULL
);
```

Notes on the sketch:

- **The capture path checks policy, session encryption and consent before writing a byte.** Recording or transcription starts only if the effective policy allows it, the session isn't E2EE, and (under an explicit-consent policy) every participant whose media will be captured has an `accepted` row for the current notice; anyone who declines is forced to listen only.
- **Expiry is a scheduled job that asks the hold service first.** An item under `legal_holds` (directly, or through a `hold_custodians` row for its owner) is skipped and logged; only unheld items move to the recycle state, and the recycle purge asks again.
- **Ownership is a container, not a person,** so offboarding can move a person's recordings to another container without rewriting the recordings.
- **Non-durable AI processing still writes a row,** with `durable = false`, so that "was this meeting processed by AI" has an answer even when no transcript exists.
- **Voice profiles carry their own deletion clock** and are excluded from every export except the user's own.
- **Events:** `recording.started`, `recording.stopped`, `recording.available`, `transcript.available`, `summary.created`, `summary.shared`, `consent.declined`, `recording.expired`, `recording.hold_skipped` go to the audit log, retention, search indexing and webhooks.

## Auditing

- **Every capture start and stop,** with who or what started it (a member, the compliance system, an app), the policy in force, and the consents collected.
- **Every share** of a recording, transcript or summary beyond the meeting's invitees, including emailed summaries.
- **Every view and download** of recordings in sensitive containers ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Every expiry, deletion and restore,** and every expiry skipped because of a hold.
- **Every bot and notetaker** that joined, the app installation behind it, and whether it was admitted from the lobby.
- **Voice profile enrollment, use and deletion,** retained as long as the biometric law the customer is under requires.

## What This Means for the System You Build

- **Store recordings as files in the customer's own governed storage,** so retention, holds, DLP and search apply without special cases.
- **Make recording a capability the admin grants,** checked for both organizer and initiator.
- **Separate convenience recording from compliance recording,** with different owners, consent rules and retention, and block E2EE for users under compliance recording.
- **Treat transcripts and AI summaries as recordings** for consent and as new records for retention and discovery, with provenance.
- **Offer AI without a durable transcript as an explicit mode,** and record that the processing happened.
- **Treat speaker identification as biometric collection:** opt-in, user-deletable, auto-expiring, never exported by admins.
- **Show bots as bots,** let the lobby hold them, and let the admin approve which may join.
- **Give notice before capture and an indicator throughout,** with a consent mode that blocks capture until participants agree.
- **Never use meeting content for your own models without consent from the people recorded,** not only the account holder.
- **Keep expiry and retention separate,** and make a hold beat every expiry and purge.

## References

**Vendor documentation**

- [Microsoft Learn: Manage Teams recording policies for meetings and events](https://learn.microsoft.com/en-us/microsoftteams/meeting-recording), storage in OneDrive and SharePoint, viewer permissions, Purview and search, external participants, channel download blocking, explicit recording consent, custom privacy URL
- [Microsoft Learn: Introduction to recording Teams calls, meetings, and events](https://learn.microsoft.com/en-us/microsoftteams/teams-recording-policy), convenience versus compliance recording comparison
- [Microsoft Learn: Microsoft Teams compliance recording (third-party)](https://learn.microsoft.com/en-us/microsoftteams/teams-recording-compliance), regulations, certified partners, notifications, unsupported scenarios, the 750-user scale note, bot requirements
- [Microsoft Learn: Manage Teams recording expiration policy](https://learn.microsoft.com/en-us/microsoftteams/manage-teams-recording-expiration-policy), the 120-day default, range, A1 cap, event recordings, recycle bin behavior
- [Microsoft Learn: Plan for Teams events](https://learn.microsoft.com/en-us/microsoftteams/plan-events), published event recording expiration and its extension
- [Microsoft Learn: Limits and specifications for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/limits-specifications-teams), the 20-day local download window for recordings that don't upload
- [Microsoft Learn: Manage Microsoft Copilot in Teams meetings and events](https://learn.microsoft.com/en-us/microsoftteams/copilot-teams-transcription), during-and-after versus only-during modes, policy values and default, Purview retention of prompts
- [Microsoft Learn: Overview and configuration of voice and face enrollment](https://learn.microsoft.com/en-us/microsoftteams/rooms/voice-and-face-recognition), opt-in, deletion timelines, admin delete without export, no training use
- [Zoom Support: Providing consent to be recorded](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0059819), the consent prompt and how each device type consents or leaves
- [Zoom Support: Managing cloud recording settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065362), auto-delete after a set number of days, the 30-day trash, WORM retention
- [Zoom Support: Enabling or disabling Zoom AI to join third-party meetings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0080357), the bot joining Teams and Meet meetings, auto-join from synced calendars, pre-meeting email
- [Zoom: How Zoom's terms of service and practices apply to AI features](https://www.zoom.com/en/blog/zooms-term-service-ai/), the no-training commitment (August 7, 2023, updated February 7, 2024)
- [Google Meet Help: Record a video meeting](https://support.google.com/meet/answer/9308681), who can record, editions, storage in the organizer's Drive, notifications, access
- [Google Meet Help: Take notes for me](https://support.google.com/meet/answer/14754931), who can start notes, storage, sharing, notification, one language per meeting

**Law and regulation**

- [18 U.S.C. 2511](https://www.law.cornell.edu/uscode/text/18/2511), the federal one-party consent rule in (2)(d)
- [California Penal Code 632](https://california.public.law/codes/penal_code_section_632), all-party consent for confidential communications
- [California Penal Code 637.2](https://california.public.law/codes/penal_code_section_637.2), $5,000 per violation or three times actual damages

**Court records and case commentary**

- [In re Otter.ai Privacy Litigation, No. 5:25-cv-06911-EKL (N.D. Cal.), Dkt. 68: Order Granting Motion to Dismiss in Part (August 13, 2026)](https://storage.courtlistener.com/recap/gov.uscourts.cand.454675/gov.uscourts.cand.454675.68.0.pdf), the allegations and claims pleaded, the standing, Wiretap Act, CIPA third-party, BIPA and dismissed-claim holdings, quoted language
- [In re Otter.ai Privacy Litigation, Dkt. 72: Interim Order re Stipulated Protective Order (August 20, 2026)](https://storage.courtlistener.com/recap/gov.uscourts.cand.454675/gov.uscourts.cand.454675.72.0.pdf), the case proceeding in discovery
- [Fisher Phillips: New Lawsuit Highlights Concerns About AI Notetakers](https://www.fisherphillips.com/en/news-insights/new-lawsuit-highlights-concerns-about-ai-notetakers.html), the August 15, 2025 filing date of the original complaint (secondary)
