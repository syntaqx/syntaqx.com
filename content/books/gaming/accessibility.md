+++
title = "Accessibility"
description = "Game accessibility with the Xbox and Game Accessibility Guidelines: text, contrast, subtitles, color, remapping, assists, narration, the CVAA and testing it."
category = "Gaming Industry"
order = 1627
part = "The Rules"
tags = ["gaming", "accessibility", "xag", "subtitles", "remapping", "cvaa"]
+++

A game asks more of its players than most software does. It wants them to read small text quickly, hear where a footstep came from, tell red from green under pressure, press two buttons at once, hold a trigger for three minutes and react inside a frame. Every one of those demands excludes someone, and most of them can be relaxed without changing what makes the game good. Microsoft's guideline on text opens with the scale of one group alone: "approximately 2.9 billion people in the world with some degree of low vision."

Web accessibility has a single baseline standard; game accessibility has guidelines. The two most used are the **Xbox Accessibility Guidelines** (XAGs) and the **Game Accessibility Guidelines**, and both are practical: what to build, with numbers where numbers help. This chapter walks through them area by area (text, contrast, subtitles, color and cues, input, difficulty and assists, screen narration), covers the one US law that reaches game communication features, and then the engineering: the input layer, assists recorded per match, settings as a system, and how to test. The chat and voice systems the law reaches are built in [Parties, Presence, Chat & Voice](/books/gaming/social-systems), and the UI frameworks narration depends on are in [Game Clients & Launchers](/books/gaming/game-clients#ui-technology-inside-the-game). The web surfaces around a game (the store page, the account site, the support portal) follow the playbook's [Accessibility](/docs/frontend/accessibility) chapter and WCAG; this chapter is about the game itself. Figures are from the guidelines as published in October 2026.

## The Guidelines

**The Xbox Accessibility Guidelines.** Microsoft's page says "Version 3.2 was published on Jun 8, 2023." The XAGs are "a set of best practices that have been developed in partnership with industry experts and members of the Gaming & Disability Community," intended for designers as a source of ideas, for developers as guardrails, and "for test teams as a checklist to validate the accessibility of their titles." Microsoft is clear about what they aren't: "The XAGs aren't intended to act as a checklist to validate any type of compliance or legal requirements." Each guideline has the same structure: a goal, an overview, scoping questions that tell you whether it applies, implementation guidelines, examples from shipped games, and the players it affects. They're numbered: XAG 101 is text display, 102 contrast, 103 additional channels for visual and audio cues, 104 subtitles and captions, 106 screen narration, 107 input.

**The Game Accessibility Guidelines** sort their recommendations into three levels, Basic ("Easy to implement, wide reaching and apply to almost all game mechanics"), Intermediate and Advanced, across six categories: motor, cognitive, vision, hearing, speech and general. Basic examples include adjustable game speed, plain language, high-contrast text and UI, subtitles for important dialogue, and settings that are saved and remembered.

The two agree on almost everything. Where the XAGs give a number, this chapter uses it, because a number can be tested.

## The Law

Most game accessibility is driven by players, platforms and studios rather than law, with one exception in the US. The **Twenty-First Century Communications and Video Accessibility Act** (CVAA) added 47 U.S.C. 617, which requires manufacturers of equipment and software used for **advanced communications services**, and the providers of those services, a category in-game text and voice chat can fall into, to make them "accessible to and usable by individuals with disabilities," unless that "is not achievable," meaning not possible "with reasonable effort or expense, as determined by the Commission." Where accessibility isn't achievable, the product must be compatible with the peripheral devices and specialized equipment people with disabilities commonly use. The statute lets the FCC waive the requirements for equipment and services "designed primarily for purposes other than using advanced communications services," and the FCC did that for video game software, in a class waiver requested by the Entertainment Software Association and extended several times. The last extension (DA 17-1243, December 2017) ran "through December 31, 2018," and the FCC granted it based in part on the ESA's assertion "that this will be its final request." Since January 1, 2019, game chat has had no class waiver: text and voice chat in a game are advanced communications services the accessibility rules can reach. How the rules apply to a given game's chat, and what records the FCC expects a publisher to keep, are questions for counsel.

In the EU, the European Accessibility Act has applied since June 28, 2025 to e-commerce and other consumer services ([Accessibility](/docs/frontend/accessibility#it-s-the-law-too)); a game's web store and account pages are the clearest fit. Whether and how it reaches anything inside a game is also a question for counsel.

## Text and UI Scale

XAG 101 sets minimum default text sizes, measured as **body height** (descender plus x-height plus ascender, in pixels on a screenshot):

| Platform | Minimum default size |
| --- | --- |
| Console | 26 px at 1080p; 52 px at 4K |
| PC and VR | 18 px at 1080p; 36 px at 4K |
| Mobile and game streaming | 18 px at 100 DPI, 36 px at 200 DPI, 72 px at 400 DPI, scaling linearly with DPI |

The console number is larger because of distance from the screen. Mobile numbers are larger in pixels because the pixels are smaller: XAG 101 notes that "a 5.5" screen with a 1080p resolution is roughly 400 DPI." It also says "platform-provided screen magnification tools aren't an appropriate mitigation for small text size."

Beyond the defaults:

- **Scaling to 200%** "without the loss of content, functionality, or meaning": console text at 1080p must scale from 26 px to 52 px, headings stay distinct from body text, and the player never has to scroll in two directions to read one panel. Icons and glyphs scale with the text up to 200%, and the text inside a button glyph meets the minimum too.
- **At least one sans serif font,** and a non-stylized option if the game uses a decorative one.
- **Spacing,** for blocks over two lines, if the player can't configure it: lines no wider than 80 characters (40 for Chinese, Japanese or Korean), line spacing of 1.5, paragraph spacing twice the line spacing, letter spacing 0.12 times the font size and word spacing 0.16 times.
- **Sentence case** rather than all capitals for lines of text, and alignment that follows the language's direction rather than centering.

For a UI system, these numbers belong in the layout engine, not in each screen. A text style is defined by its size at a reference resolution and platform, a scale factor comes from the player's settings, and the layout is tested at 100% and 200% so that a panel designed at the default doesn't truncate at the maximum.

On touch screens, XAG 107 sets minimum touch targets: 15 mm (59 px at 100 DPI) on phones and 24 mm (94 px at 100 DPI) on tablets, with layouts the player can resize and rearrange.

## Contrast

XAG 102 gives contrast ratios in the same terms as web standards, with "large text" defined per platform:

| Element | Minimum contrast |
| --- | --- |
| Standard text and important visual elements | 4.5:1 |
| Large text and large visual elements (console: 52 px at 1080p; PC/VR: 36 px at 1080p) | 3:1 |
| Text on inactive elements | 3:1 |
| Placeholder or input text | 4.5:1, or 3:1 if large |
| Everything, in a high contrast mode | 7:1 |

Games add a problem web pages rarely have: the background moves. XAG 102 says that over a non-solid background, contrast is measured "between the text and the lowest contrasting area of the background," which over a 3D scene means the worst frame. The practical answers are the ones the XAG lists: an optional solid background behind text with adjustable opacity, outlines around text and symbols, player-chosen colors for HUD elements, and a high contrast mode. Read the platform's high contrast setting at launch and start the game in its high contrast mode if the platform has it on. A high contrast mode is a theme, so build it the way UI themes are built, as redefined color tokens with contrast checked in every theme ([Design Tokens](/docs/frontend/design-tokens#check-contrast-in-every-theme)).

## Subtitles and Captions

XAG 104 distinguishes **subtitles** ("text equivalents for the speech or dialogue of a character") from **captions** ("text equivalents for all audio," including sound effects, music and who is speaking). The guidelines, with their numbers:

- **Subtitles for all spoken content,** with the speaker named when the speaker changes and an indication of direction when the speaker isn't visible (arrows like `<` and `>` are the common convention).
- **On before anything plays.** Players "can adjust the option before starting the game, or subtitles are enabled by default," so no one sits through an opening cinematic they can't follow.
- **Captions for important sounds** not already shown on screen, with direction where it matters, and each type (main dialogue, background chatter, ambient sound) switchable on its own.
- **Platform caption settings as defaults** where the platform offers them.
- **Size** at least the XAG 101 minimum, larger by default if possible since subtitles are on screen briefly, and scalable to at least 200%.
- **Length:** "Avoid long lines of text (more than 40 characters)"; "Show no more than two lines of subtitles on screen at a time (three can be used in exceptional cases)"; line breaks placed by hand at sensible points rather than by automatic wrapping.
- **Background:** a solid background the player can turn on, with a configurable color and opacity "on a scale from 0 to 100 percent."
- **A preview** of the current settings, ideally in a game context; subtitles that persist in screen recordings for viewers who want them; transcripts of cutscenes; sign language interpretation for cutscenes as the advanced practice.

![Subtitle legibility sheet for a console game at 1080p. A plan view of a 1920 by 1080 frame at 1:4 shows a two-line subtitle block near the bottom on a solid background, with the line dimensioned at no more than 40 characters and leaders for the second line and the background. Detail A, at 10:1, compares the default body height S1 = 26 px with the height at 200% scaling, S5 = S1 x K1 = 26 x 2.00 = 52 px, highlighted, which equals T1, the console threshold for large text. A variable table lists the XAG sizes for console and PC at 1080p and 4K, the 4.5:1 and 3:1 contrast ratios, and the 40-character and two-line limits.](/diagrams/gm-accessibility-subtitles.svg "Subtitle limits come in numbers you can test: 26 px default on console, scalable to 52 px, at most 40 characters and two lines. At full scale, console text crosses the large-text line and its contrast floor drops from 4.5:1 to 3:1.")

Subtitles are also a data problem. The 40-character limit and hand-placed line breaks mean subtitle text is authored per language with its own breaks and timing, not generated from the dialogue script by wrapping. A localization pipeline that stores dialogue lines should store subtitle segmentations next to them, with the speaker, and lint every language for line length and line count at build time, since a line that fits in English often won't fit once translated ([Text Expansion](/docs/frontend/internationalization#text-expansion)); externalized strings and pseudo-localization in CI catch the rest ([Internationalization](/docs/frontend/internationalization)).

## Color and Multiple Channels

XAG 103 is about not depending on one sense: "Color alone should never be used to represent information," and anything critical to play or the story that's shown visually should also be expressed through "at least one other sensory method," such as spatial audio or haptics, and vice versa for sound. Haptics shouldn't be the only alternative, because some controllers (the XAG names the Xbox Adaptive Controller) don't vibrate, and some players turn vibration off.

For color vision deficiency, the XAG's guidance is more specific than a "colorblind mode" toggle:

- Pair color with a second signifier (shape, pattern, icon or text label) for anything that matters.
- Where color is the primary channel (rarity colors, team colors), let players choose the colors, through presets or "ideally, free choice of color."
- Don't signal unavailable controls by graying alone; add a lock icon or a label.

A full-screen filter that shifts the whole palette is the cheapest approach to build and the weakest: it changes the art for everyone in the mode and still can't separate two elements that the filter maps to the same color. Per-element color choices go through the same theme system as everything else, which is why they're cheaper if they're designed in.

## Input and Remapping

XAG 107 starts from the observation that remapping alone doesn't solve input barriers: a player who can't press buttons quickly, hold them, or press two at once is still blocked after the buttons move. Its guidelines:

- **Remap everything in the game,** whatever the platform offers: digital and analog controls, each stick's axes inverted independently, and the Esc key on PC. Ideally remap **actions**, so "pick up" can be one button instead of A and B together.
- **Prompts follow the mapping.** Every hint, tutorial and control diagram shows the player's current binding.
- **Digital alternatives for analog input,** including menus navigable with single, non-simultaneous presses, and a full keyboard path on PC from launch to exit.
- **Avoid rapid repeated presses, long holds and simultaneous presses;** where they can't be avoided, offer a less demanding alternative or a way to skip the event. XAG 107 points to toggles and "auto" holds (auto-sprint, auto-fire, auto-jump) and to letting players choose "press and hold" or "quick taps" for button challenges.
- **Sensitivity** adjustable per analog control, by at least 50% either way.
- **No game-critical input that only works by speech or motion.**

Mechanically, this argues for an input layer that maps physical inputs to **actions** through a binding table the player edits, with hold, toggle and repeat behavior as properties of the binding rather than of the action, and with every prompt in the UI reading from the same table. The discipline is that no gameplay or UI code path reads a raw button.

The pieces, as I'd build them: the game ships an **action list** (each action's name, whether it's digital or analog, and the input demands it can make: hold, rapid repeat, simultaneous with another action); a **default binding set** per device; and the player's **overrides**, stored in the accessibility settings row below as a map from action to binding with its press mode (`press`, `hold`, `toggle`). At runtime the layer resolves overrides over defaults, turns a toggle binding into the held state the action expects, and publishes the resolved table to the prompt system. Because the action list declares each demand, the build can check that every hold, repeat and chord has an alternative, which is the input test in [Testing](#testing).

## Difficulty and Assists

The Game Accessibility Guidelines' Basic list includes adjustable game speed, and XAG 107 suggests "allowing players to control the speed in which gameplay occurs" because more time between enemy attacks helps players who can't act quickly. The broader family of assists includes slowing the game, skipping or simplifying quick-time events and puzzles, aim and navigation help, more forgiving timing windows, and the option to continue past a section.

Two design questions come with them. First, **assists are settings, not difficulty levels**: a player who needs slower timing may still want the hardest enemies, so separate switches serve more people than three presets. Second, **competitive modes need a policy.** In a single-player game an assist only changes that player's experience; in a ranked match it changes what an opponent faces. My rule: decide per assist whether it's allowed in each mode, say so in the settings screen, and record the assist state on the match participant, so ranked and anti-cheat systems ([Matchmaking & Ranked](/books/gaming/matchmaking), [Anti-Cheat](/books/gaming/anti-cheat)) see what was on rather than inferring it:

```sql
CREATE TABLE assist_mode_policies (         -- which assists each mode allows, versioned
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  game_id      UUID NOT NULL REFERENCES games (id),
  mode         TEXT NOT NULL,               -- matches.mode: 'ranked', 'casual', ...
  assist       TEXT NOT NULL,               -- 'aim_assist', 'game_speed', 'auto_sprint', ...
  allowed      BOOLEAN NOT NULL,
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING gist (game_id WITH =, mode WITH =, assist WITH =, valid_during WITH &&)
);

ALTER TABLE match_participants
  ADD COLUMN assists TEXT[] NOT NULL DEFAULT '{}';  -- assists on for this player in this match
```

The game server, not the client, writes `assists` at match start from the settings the client declared, after checking each against the mode's policy. My default is that a disallowed assist is turned off for the match rather than refused, so a player is never blocked from queuing by an accessibility setting.

## Screen Narration

XAG 106 asks that all core UI text support the platform's screen reader or be voiced by a speech synthesizer, noting that recorded audio files "can also be a solution but isn't ideal." What gets narrated: menu labels, roles, values and descriptions, interaction prompts ("Press A to select"), HUD elements, objectives, incoming chat, notifications, and text alternatives for images that carry information. The order is fixed: **name, role, value or state, then position** (its example is "Gamma, slider, 38%, 6 of 9"), with interaction information when needed.

Behavior matters as much as content:

- **Narrate on focus change and context change** (a new screen, a dialog, loading into a match).
- **Stop the current string immediately** when focus moves, and start the new one.
- **Let players cancel or repeat** narration from any input device, and adjust speaking rate and pitch.
- **Repeat timed state sparingly:** for loading screens or countdowns, reading the state "every 7-10 seconds" is acceptable.
- **Don't narrate decoration,** and don't overdo it: front-load the key information and drop repetition.
- **Expose the language** of the game and of any lines in another language, so an external screen reader pronounces them correctly.

The engineering implication is that the UI framework needs an accessibility tree: every focusable element has a name, a role, a value and a position, available programmatically, the way web pages expose them to assistive technology. Games built on immediate-mode UI or custom renderers usually have no such tree, which is why narration is expensive to retrofit. Front-end clients built on web technology can expose one through the browser engine's own accessibility support ([Game Clients & Launchers](/books/gaming/game-clients)).

## Settings as a System

Every guideline above ends in a setting, and settings have engineering requirements of their own:

- **Available before they're needed.** Subtitles, text size, contrast and narration must be reachable before the first cinematic and the first menu that needs them. XAG 104's example is a game that turns subtitles on by default for its first launch and opens the accessibility menu right after the opening video.
- **Seeded from the platform.** Read the platform's caption, high contrast and narration settings on first launch and use them as defaults, then let the player override in the game.
- **Saved and remembered** (a Basic Game Accessibility Guideline), and carried across devices where the account system allows. A player who set up the game on a console shouldn't redo it on PC.
- **Previewed** where the effect isn't obvious: subtitle style, colors and text size.
- **Named in plain words,** with a description of what each value does: XAG 104 credits a game whose settings explain "on" versus "minimal" instead of leaving players to guess.

Some settings belong to the person (subtitles, colors, narration, assist preferences) and some to the device (text size depends on screen size and distance, sensitivity on the controller). A table keyed by account with optional device overrides covers both:

```sql
CREATE TABLE accessibility_settings (       -- one row per account, plus device overrides
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,             -- the publisher, as in the core model
  account_id     UUID NOT NULL REFERENCES accounts (id),
  game_id        UUID REFERENCES games (id),  -- null: applies to all the tenant's games
  device_class   TEXT CHECK (device_class IN ('console', 'pc', 'mobile', 'vr')),  -- null: all devices
  schema_version INTEGER NOT NULL,          -- settings evolve; migrate on read
  settings       JSONB NOT NULL,            -- {"subtitles": {"on": true, "scale": 1.5, ...}, ...}
  seeded_from    TEXT,                      -- 'platform' when defaults came from the OS
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (account_id, game_id, device_class)
);
```

The table extends the volume's core model ([The Games Business](/books/gaming/games-business#the-core-data-model)). Resolution runs from the most specific row to the least (this game on this device class, this game, all games on this device class, all games), and the client caches the result so the game starts correctly offline, queuing changes made offline and syncing them when it reconnects, with the newest change per setting winning ([Offline-First Sync](/docs/architecture/offline-sync#conflicts-choosing-who-wins)). Two cautions: a settings row is personal data about a person's disability in some readings, so keep it out of analytics that aren't about accessibility, and summarize usage in aggregate ([Telemetry & Analytics](/books/gaming/telemetry)); and a remote config or live-ops change must never reset accessibility settings to defaults, which is a bug that only the players who need them notice.

## Testing

The XAGs are written to be tested, and most of their numbers can be checked by machine:

- **Text size from screenshots.** XAG 101 describes measuring body height on a screenshot from the highest ascender to the lowest descender, counting edge pixels only if their contrast with the background is above 2:1. An automated UI test can capture each screen at the target resolution, at 100% and 200% scale, and measure text bounding boxes against the minimums, failing the build on a regression the way web pipelines fail on axe violations ([Accessibility](/docs/frontend/accessibility#testing)).
- **Contrast** in the same captures, measured against the lowest-contrast area behind each text element, with gameplay captures sampled across levels and lighting conditions rather than one menu screen.
- **Subtitle lint** at build time: line length, line count and speaker labels for every language.
- **Input coverage:** every action has a binding, every binding can be changed, every prompt reads the current binding, and every hold or simultaneous input has an alternative. A list of actions with their properties makes this a data check instead of a play-through.
- **Narration:** every focusable element has a name, role and value; focus order matches the layout; narration stops on focus change.
- **People.** XAG 103 says simulation filters "shouldn't be used as a replacement for testing with actual players with colorblindness," and the same holds for every disability. Machine checks find regressions; playtests with disabled players find whether the game is actually playable.

## What This Means for the System You Build

- **Text styles defined at a reference resolution** with XAG 101 minimums enforced by the layout system, scaling to 200% without truncation, and touch targets sized in millimeters.
- **Contrast built in:** optional backgrounds and outlines for text, player-chosen HUD colors, a 7:1 high contrast mode seeded from the platform setting.
- **Subtitles as authored data** per language, with speaker, segmentation and timing, linted for 40 characters and two lines, on before the first sound, with captions by category.
- **No information in one channel only,** and per-element color choices through the theme system.
- **An action-based input layer** with a player-editable binding table, hold, toggle and repeat as binding properties, and prompts read from the bindings.
- **Assists as separate settings,** with a per-mode policy and assist state recorded on match participants.
- **An accessibility tree** under the UI, feeding the platform screen reader or a speech synthesizer.
- **Settings per account with device overrides,** seeded from the platform, cached for offline start, never reset by live config.
- **Automated checks in the build** for text size, contrast, subtitles, bindings and narration, and playtests with disabled players.

## References

**Specifications**

- [Microsoft: Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/gaming/accessibility/guidelines), version 3.2 published June 8, 2023; purpose, structure and the statement that they aren't a compliance checklist
- [XAG 101: Text display](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101), minimum text sizes by platform, measuring body height, 200% scaling, fonts and spacing
- [XAG 102: Contrast](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102), 4.5:1, 3:1 and 7:1 ratios, large text by platform and measuring over non-solid backgrounds
- [XAG 103: Additional channels for visual and audio cues](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103), color never alone, multiple senses, player-chosen colors and simulation filters
- [XAG 104: Subtitles and captions](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/104), speaker identification, defaults, 40 characters, two lines, backgrounds and previews
- [XAG 106: Screen narration](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/106), what to narrate, name-role-value-position order, interruption, rate and pitch
- [XAG 107: Input](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107), full remapping, action remapping, holds and taps, sensitivity, game speed and touch target sizes
- [47 U.S.C. 617](https://www.law.cornell.edu/uscode/text/47/617), the CVAA's accessibility requirement for advanced communications services, achievability, compatibility and waivers
- [FCC: Order DA 17-1243 (PDF)](https://docs.fcc.gov/public/attachments/DA-17-1243A1.pdf), December 2017; the final extension of the video game software class waiver through December 31, 2018

**Reference**

- [Game Accessibility Guidelines: Full list](https://gameaccessibilityguidelines.com/full-list/), basic, intermediate and advanced guidelines across motor, cognitive, vision, hearing, speech and general
