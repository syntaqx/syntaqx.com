+++
title = "Accessibility"
description = "Game accessibility with the Xbox and Game Accessibility Guidelines: text, contrast, subtitles, color, remapping, assists, narration, the CVAA and testing it."
category = "Gaming Industry"
order = 1627
part = "The Rules"
tags = ["gaming", "accessibility", "xag", "subtitles", "remapping", "cvaa"]
+++

A game asks more of its players than most software does. It wants them to read small text quickly, hear where a footstep came from, tell red from green under pressure, press two buttons at once, hold a trigger for three minutes and react inside a frame. Every one of those demands excludes someone, and most of them can be relaxed without changing what makes the game good. Microsoft's guideline on text opens with the scale of one group alone: "approximately 2.9 billion people in the world with some degree of low vision."

Web accessibility has a single baseline standard; game accessibility has guidelines. The two most used are the **Xbox Accessibility Guidelines** (XAGs) and the **Game Accessibility Guidelines**, and both are practical: what to build, with numbers where numbers help. This chapter walks through them area by area (text, contrast, subtitles, color and cues, photosensitivity, motion and camera comfort, input and adaptive controllers, difficulty and assists, screen narration, speech-to-text and text-to-speech chat), covers the one US law that reaches game communication features and the store tags that advertise accessibility to buyers, and then the engineering: the input layer, assists recorded per match, settings as a system, and how to test. The chat and voice systems the law reaches are built in [Parties, Presence, Chat & Voice](/books/gaming/social-systems), and the UI frameworks narration depends on are in [Game Clients & Launchers](/books/gaming/game-clients#ui-technology-inside-the-game). The web surfaces around a game (the store page, the account site, the support portal) follow the playbook's [Accessibility](/docs/frontend/accessibility) chapter and WCAG; this chapter is about the game itself. Figures are from the guidelines as published in October 2026.

## The Guidelines

**The Xbox Accessibility Guidelines.** Microsoft's page says "Version 3.2 was published on Jun 8, 2023." The XAGs are "a set of best practices that have been developed in partnership with industry experts and members of the Gaming & Disability Community," intended for designers as a source of ideas, for developers as guardrails, and "for test teams as a checklist to validate the accessibility of their titles." Microsoft is clear about what they aren't: "The XAGs aren't intended to act as a checklist to validate any type of compliance or legal requirements." Each guideline has the same structure: a goal, an overview, scoping questions that tell you whether it applies, implementation guidelines, examples from shipped games, and the players it affects. They're numbered: XAG 101 is text display, 102 contrast, 103 additional channels for visual and audio cues, 104 subtitles and captions, 106 screen narration, 107 input, 117 moving content and camera motion, 118 photosensitivity, 119 speech-to-text and text-to-speech communication.

**The Game Accessibility Guidelines** sort their recommendations into three levels, Basic ("Easy to implement, wide reaching and apply to almost all game mechanics"), Intermediate and Advanced, across six categories: motor, cognitive, vision, hearing, speech and general. Basic examples include adjustable game speed, plain language, high-contrast text and UI, subtitles for important dialogue, and settings that are saved and remembered.

The two agree on almost everything. Where the XAGs give a number, this chapter uses it, because a number can be tested.

## The Law

Most game accessibility is driven by players, platforms and studios rather than law, with one exception in the US. The **Twenty-First Century Communications and Video Accessibility Act** (CVAA) added 47 U.S.C. 617, which requires manufacturers of equipment and software used for **advanced communications services**, and the providers of those services, a category in-game text and voice chat can fall into, to make them "accessible to and usable by individuals with disabilities," unless that "is not achievable," meaning not possible "with reasonable effort or expense, as determined by the Commission." Where accessibility isn't achievable, the product must be compatible with the peripheral devices and specialized equipment people with disabilities commonly use. The statute lets the FCC waive the requirements for equipment and services "designed primarily for purposes other than using advanced communications services," and the FCC did that for video game software, in a class waiver requested by the Entertainment Software Association and extended several times. The last extension (DA 17-1243, December 2017) ran "through December 31, 2018," and the FCC granted it based in part on the ESA's assertion "that this will be its final request." Since January 1, 2019, game chat has had no class waiver: text and voice chat in a game are advanced communications services the accessibility rules can reach. The FCC's rules also carry a paperwork duty: covered manufacturers and service providers keep records of their efforts to consult people with disabilities, descriptions of their accessibility features, and information on compatibility with peripherals and specialized equipment, for two years after a product stops being made or a service stops being offered, and an officer files a compliance certificate with the FCC every April 1 for the previous calendar year (47 CFR 14.31). The features that answer the law for chat are in [Speech-to-Text and Text-to-Speech Chat](#speech-to-text-and-text-to-speech-chat). How the rules apply to a given game's chat, and what records the FCC expects a publisher to keep, are questions for counsel.

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

## Photosensitivity

XAG 118 puts the risk at "approximately 1 in 4,000" people who can have a seizure from flashing lights or patterns, notes that many players don't know they have epilepsy until their first seizure, and draws the conclusion that shapes the engineering: "eliminating game content that can potentially cause photosensitive seizures is preferred over splash-screen warnings or other methods." Its scoping is total: "All games should be tested for photosensitive seizure triggers, regardless of whether the game includes intentional flashing." Repetitive flashing also affects players who are autistic, prone to migraines or have sensory processing disorder.

The thresholds come from broadcasting. ITU-R BT.1702, "Guidance for the reduction of photosensitive epileptic seizures caused by television," is in force as BT.1702-3 (November 2023); in the UK, Annex 1 of Ofcom's guidance note on flashing images and regular patterns sets the technical standards for television, and the advertising regulator expects broadcast ads to pass a Harding Flash and Pattern Analyser test or an equivalent. WCAG 2.3.1 carries the same model onto the web: nothing flashes "more than three times in any one second period," unless the flashes are below the general and red flash thresholds. XAG 118 restates it for games:

| Failure | What counts | Fails when (XAG 118) |
| --- | --- | --- |
| Luminance flash | A 10% change in luminance (100% is a white screen), with the darker state below 0.8 | More than about three flashes a second, over about 20% of the screen or more |
| Red flash | Either extreme is a saturated red, R/(R + G + B) >= 0.8, which takes less luminance change to fail | The same frequency and area |
| Spatial pattern | Alternating high-contrast bands | Contrast difference above 10%, over about 20% of the screen or more |

WCAG measures area differently, as 25% of any 10 degree visual field at typical viewing distance, and XAG 118 adds that "lower intensity flashing can also cause a failure if it's continued for an extended period of time." The fixes it lists are the same for every failure type: reduce the contrast between the brightest and darkest states, reduce the frequency, shrink the area, and for red flashes, desaturate the red.

The game-specific problem is that a broadcast is a fixed sequence and a game isn't. A program is checked once; a game's frames depend on what the player does, and two effects that each pass (a muzzle flash at the weapon's fire rate, a screen-wide damage pulse, lightning in the skybox, a blinking objective marker) can stack into a sequence that fails. So the limit belongs to the renderer, not to each effect. My default is a frame-level flash budget in post-processing: track full-screen luminance transitions over a sliding one-second window and attenuate any new screen-wide flash that would exceed three, so that no combination of effects can cross the threshold, with the per-effect fixes above applied in content.

Then an option, for players who want less than the default: an **effects intensity** setting that dims or removes flashes, strobes and high-contrast patterns. Name it for what it does. A label like "epilepsy safe mode" promises something no developer can guarantee, because triggers vary between people, which is why accessibility writing on the subject recommends wording such as "effects intensity" instead. Playdate shows the platform version: on first power-on it asks whether the player has photosensitivity, and its system-wide Reduce Flashing setting is one "any Playdate game can read," so a game can turn an effect off or show a warning without asking again. Seed the game's setting from a platform setting like that wherever one exists.

User content needs the same check. Animated sprays, emotes, avatar textures and user-built levels let one player put flashing images in front of another, and in the UK, section 183 of the Online Safety Act 2023 makes sending or showing flashing images to someone known or suspected to have epilepsy, with intent to cause harm, an offence carrying up to five years' imprisonment; the provider of the service the images travel through isn't treated as the sender. My rule: run the flash and pattern analysis from [Testing](#testing) on every animated upload as one of the automated gates in the content pipeline ([Content Pipelines and Review](/books/gaming/creator-economies#content-pipelines-and-review)).

## Motion and Camera Comfort

XAG 117 covers two things that move. The first is UI: content that scrolls, blinks or auto-updates on a screen with text needs a way to pause, hide or disable it, and auto-updating content (leaderboards, rankings) needs a way to control how often it updates. The second is the camera. Motion sickness comes from a mismatch: a first-person view bobs with each step, the brain reads walking, and the body on the couch reports none, which is why the XAG names "camera field of view, camera bobbing, motion blur, weapon sway, automatic changes in camera angle" as decisions to make deliberately. Its guidelines, with the examples it cites:

- **Camera shake, bobbing, motion blur and mouse blur** avoided or switchable. Halo Infinite sets radial blur, screen shake, full-screen effects and speed lines individually "across a sliding scale from zero to 100%"; Cyberpunk 2077 scales "additive or secondary camera movements."
- **No repetitive side-to-side or up-and-down movement** that isn't core to play, such as weapon sway and head bob; The Elder Scrolls Online puts first-person head bob on a slider.
- **Adjustable field of view,** because the least nauseating angle depends on the player's distance from the screen. Minecraft goes up to 110 degrees; Halo Infinite explains in the setting that lower angles reduce the "fishbowl" effect.
- **Camera sensitivity** per axis, and the ability to **disable automatic camera movement**; Sea of Thieves exposes auto-centering, its delay and its speed.
- **First- or third-person** choice where the game can support both.

Stores now ask about this too: Steam's "Camera Comfort" feature means players "can adjust or disable" screen shake, camera bob or sway, motion blur and the game taking camera control away, or the game doesn't have them, and one of Apple's Accessibility Nutrition Labels is Reduced Motion ([Store Accessibility Tags](#store-accessibility-tags)).

For the camera system this argues for one structure: a base camera driven by the player, and every secondary motion (shake, bob, sway, recoil kick, lens effects, blur) applied as a separate additive layer with its own scale from 0 to 1 read from settings, so that zero removes the layer without touching gameplay. A shake that's baked into an animation, or a blur that's part of a material, is the kind that can't be switched off later. Field of view is the setting that most clearly belongs to the device rather than the person, since it depends on screen size and distance ([Settings as a System](#settings-as-a-system)). The web equivalent, honoring the operating system's reduced motion preference, is in the playbook's [Motion](/docs/frontend/accessibility#motion).

### VR Comfort

VR removes the screen edge, so comfort is a store-level concern. The Meta Horizon Store requires every app to carry one of three comfort ratings: "Comfortable" experiences "generally avoid camera movement, player motion, or disorienting content and effects," and apps with a fixed camera are generally rated that way; "Moderate" experiences "might have more camera and player motion"; and "Intense" experiences "usually incorporate first person camera motion, acceleration, or significant camera movement" and player motion. Meta's accessibility checks (VRCs) add the options that let more players in whatever the rating: rotating the view "without physically moving their head or neck" (VRC.Quest.Accessibility.7), multiple locomotion styles such as "teleportation, free locomotion, and snap turning" (Accessibility.8), and every interaction reachable from a fixed seated or standing position (Accessibility.9). As of October 2026, Meta's checklist says "All accessibility VRCs are recommended, not required for Store submission." My rule is to treat them as required anyway: locomotion style and turning mode are settings like any other in the accessibility row, and I pick the rating for the default configuration, not for the most comfortable one a player can reach.

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

### Adaptive Controllers and System Remapping

Both console platforms sell controllers built to be reconfigured, and both remap below the game:

- **Xbox Adaptive Controller,** available from September 4, 2018 at $99.99: "Nineteen 3.5mm ports and two USB 2.0 ports for external inputs," button remapping and profiles through the Xbox Accessories app, and a Profile button that switches between three of them. It also works with Windows PCs.
- **PlayStation's Access controller:** swappable button and stick caps, "four industry standard 3.5mm expansion ports," up to 30 control profiles configured in the PS5's settings with three stored on the controller (profiles don't transfer to another console), and button assignment, stick sensitivity and deadzone set on the console. Sony says it works with "every game available on PS5."
- **Two controllers as one.** Xbox Controller Assist (called Copilot when the Adaptive Controller launched) "links two controllers so you can use them as if they were one controller"; on PS5, "Use Second Controller for Assistance" does the same for two DualSense controllers, and up to two Access controllers and one DualSense can act as "a single virtual controller." A helper can play alongside the player, or one player can split inputs across two devices placed differently. The PS5 assist controller has no haptics, adaptive triggers, microphone or custom button assignments.

Everything in that list happens before input reaches the game: the game sees one standard controller, which is why it works in every title. That's also its limit, and it sets what the game still owes:

- **In-game remapping is still required.** A system remap moves one button to another; it can't turn a hold into a toggle, split a chord into one press, or rebind an action, which is what XAG 107 asks of the game "whatever the platform offers."
- **Prompts can't know about a system remap.** If the player moved A to a foot switch at the system level, "Press A" is now wrong, and only an in-game binding the prompt system reads is ever right. That's one more reason players remap in the game when it lets them.
- **Every input needs a standard-controller path.** The game can't tell an Access controller from a DualSense, so features that rely on a controller-specific input (a touchpad swipe, motion, haptic cues) need an alternative; Sony suggests pairing an Access controller with a DualSense for touchpad features, and XAG 103 already rules out haptics as the only channel because the Adaptive Controller doesn't vibrate.
- **Merged input is one player.** With two controllers as one, inputs from both arrive as a single device, so presses can overlap in ways one pair of hands wouldn't produce; input handling that treats an impossible combination as cheating or as a bug will misfire.

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

## Speech-to-Text and Text-to-Speech Chat

XAG 119 starts from a point that settles most arguments about chat: "The provision of voice chat isn't the same as making text chat accessible. The provision of text chat isn't the same as making voice chat accessible." A player who is deaf or hard of hearing needs voice turned into text; a player who doesn't speak, by choice or because of a disability, needs text turned into voice; a blind player needs text read aloud. Its guidelines:

- **Speech-to-text:** all voice from other players "transcribed into text in real time." Halo Wars 2 shows the transcript in a dedicated display area.
- **Text-to-speech:** a text-entry box whose contents are "transformed into synthesized audio in real time and broadcast on the voice channel to all other players," who need no setting of their own to hear it.
- **A text-entry box everywhere communication is available,** in lobbies and result screens as well as in play; Gears 5 and Sea of Thieves are the XAG's examples.
- **Incoming text narrated** for players with screen narration on, emojis included, read by their Unicode CLDR short names ("Grinning Face").
- **Chat-wheel voice lines transcribed** for speech-to-text users, and each wheel option previewed aloud on focus for narration users.
- **Platform settings read by default, with in-game overrides.** Sea of Thieves applies the Xbox settings and lets players override each one per game; Forza Horizon 4 offers "System Default" alongside on and off.

Xbox piloted this as Game Chat Transcription in Halo Wars 2 on March 15, 2017; Xbox now transcribes Party Chat and in-game chat and reads typed chat aloud at the platform level. Nintendo's Switch 2 has a "Change Speech ⇔ Text During GameChat" accessibility option, whose languages its June 2026 system update extended. Steam's store features include "Chat Text-to-speech" and "Chat Speech-to-text," the latter meaning "Voice chat can be read as a text transcript in real time."

As with voice itself ([Voice](/books/gaming/social-systems#voice)), most games buy this. PlayFab Party transcribes and synthesizes, delivering each transcription with the speaker, the receivers and whether the text is a `Hypothesis` (an interim guess that improves perceived responsiveness) or a `Final` phrase. Vivox's text-to-speech is "intended to support developers who are pursuing Communications and Video Accessibility Act (CVAA) compliance," plays a synthesized phrase locally, to remote participants or both, and as of October 2026 is documented as "only available in US English" and for one logged-in user. Check language coverage against the game's chat languages before relying on any vendor.

Microsoft's display guidance for transcripts reads like the subtitle rules, because the problem is the same: rapid conversational text over a moving game. A minimum of 28 px at 1080p for transcription text in a living-room setup, larger than the rest of the UI because it's on screen briefly; newest lines at the bottom with auto-scrolling; speakers distinguished; a window the player can position (the Xbox overlay uses nine screen regions) and minimize, closed after a period of silence (its example is 15 seconds, the time to read one 280-character message); and a look clearly different from game UI, so chat isn't mistaken for game instructions.

Two rules connect this to the rest of the social system. A transcript is chat: blocks and mutes apply to it, so a muted player's speech never appears as text, and reports on transcribed speech go through the same moderation path as voice. And synthesized speech is the player's voice on the channel: the text-entry box runs the same text filter as typed chat, since the filter is the only place to catch it before it's spoken ([Filtering and Moderation Hooks](/books/gaming/social-systems#filtering-and-moderation-hooks)).

## Store Accessibility Tags

Players can now filter stores by accessibility, which turns a game's settings into public claims. Every major store has a scheme, and they don't share a vocabulary:

| Store | Since | What it is |
| --- | --- | --- |
| Xbox (console store, PC and mobile apps, xbox.com) | November 16, 2021; Accessible Games Initiative tags from July 9, 2025 | 20 Xbox tags at launch, each with requirements for "a consistent bar for quality"; now the industry tags, keeping five Xbox tags with no equivalent ("Accessibility on launch," "On-demand tutorials," "Pausable," "Adjustable input sensitivity," "Single stick gameplay") |
| PlayStation Store on PS5 | April 2023 | More than 50 tags across six categories (visual, audio, subtitles and captions, controls, gameplay, online communication), for PS4 and PS5 games |
| Steam | June 2025 | 19 features in four groups (gameplay, audio, visual, input), declared through the Accessibility Feature Wizard on the store page's Basic Info tab, with search filters; Valve reported over 5,000 apps had filled them in at launch |
| Apple App Store | Announced May 13, 2025; shown on iOS 26 and the matching OS versions | Accessibility Nutrition Labels for nine features (VoiceOver, Voice Control, Larger Text, Dark Interface, Differentiate Without Color Alone, Sufficient Contrast, Reduced Motion, Captions, Audio Descriptions), declared per device |

The **Accessible Games Initiative** is the attempt at a shared vocabulary: announced by the Entertainment Software Association at GDC on March 20, 2025 with Electronic Arts, Google, Microsoft, Nintendo of America and Ubisoft, it defines 24 tags "all with clear criteria," which participating companies show on storefronts and product pages. Use is "completely voluntary for video game companies and storefronts," with timelines set company by company; Ubisoft began showing the tags on its product pages on May 21, 2026, starting with four games.

The rules that matter for engineering are in the criteria. Apple's is the strictest statement: to indicate a feature, "users must be able to complete all of the common tasks of your app using that feature," where common tasks include first launch, login, purchase and settings, and it's assessed per device. Labels are "voluntary to start," but Apple says that over time sharing them will be required to submit new apps and updates. A tag is therefore a claim about a specific build on a specific device, and it can go false when a patch breaks the feature it describes. I keep the claims as data, each tied to the check that proves it:

```sql
CREATE TABLE store_accessibility_claims (   -- what each store page says, and the evidence
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  game_id           UUID NOT NULL REFERENCES games (id),
  store             TEXT NOT NULL,           -- 'xbox', 'playstation', 'steam', 'apple', ...
  device_class      TEXT CHECK (device_class IN ('console', 'pc', 'mobile', 'vr')),  -- null: all
  tag               TEXT NOT NULL,           -- the store's own name: 'Camera Comfort', 'Reduced Motion'
  check_name        TEXT NOT NULL,           -- the automated or manual test that proves it
  verified_build_id UUID NOT NULL REFERENCES builds (id),
  declared_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at      TIMESTAMPTZ
);
```

A release gate then reads the table: for every claim not withdrawn, the named check must have passed on the build being shipped, and a claim whose check fails is withdrawn from the store page before the build goes out rather than after a player finds it.

## Settings as a System

Every guideline above ends in a setting, and settings have engineering requirements of their own:

- **Available before they're needed.** Subtitles, text size, contrast and narration must be reachable before the first cinematic and the first menu that needs them. XAG 104's example is a game that turns subtitles on by default for its first launch and opens the accessibility menu right after the opening video.
- **Seeded from the platform.** Read the platform's caption, high contrast, narration, chat transcription and reduce-flashing settings on first launch and use them as defaults, then let the player override in the game. Where the platform has a setting, the game's value has three states, not two: follow the system, on, or off (Forza Horizon 4's "System Default" in [Speech-to-Text and Text-to-Speech Chat](#speech-to-text-and-text-to-speech-chat)), so a player who changes the platform setting later isn't silently overridden by a value the game copied once.
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

The settings document holds the newer areas the same way. A sketch of the parts this chapter adds, with the three-state values stored as `"system"`, `"on"` or `"off"` and the camera layers as scales from 0 to 1:

```json
{
  "effects": { "intensity": "reduced" },
  "camera":  { "fov": 95, "shake": 0.0, "head_bob": 0.0, "motion_blur": 0.0, "auto_center": false },
  "vr":      { "locomotion": "teleport", "turning": "snap", "seated": true },
  "chat":    { "speech_to_text": "system", "text_to_speech": "on",
               "transcript": { "position": "left_bottom", "scale": 1.5 } }
}
```

The sketch shows the resolved result. In storage, `camera.fov` usually lives in a device-class row, since the right angle depends on the screen and the distance to it, while effects, camera layers and chat choices live in the account row and follow the player everywhere. The table extends the volume's core model ([The Games Business](/books/gaming/games-business#the-core-data-model)). Resolution runs from the most specific row to the least (this game on this device class, this game, all games on this device class, all games), and the client caches the result so the game starts correctly offline, queuing changes made offline and syncing them when it reconnects, with the newest change per setting winning ([Offline-First Sync](/docs/architecture/offline-sync#conflicts-choosing-who-wins)). Two cautions: a settings row is personal data about a person's disability in some readings, so keep it out of analytics that aren't about accessibility, and summarize usage in aggregate ([Telemetry & Analytics](/books/gaming/telemetry)); and a remote config or live-ops change must never reset accessibility settings to defaults, which is a bug that only the players who need them notice.

## Testing

The XAGs are written to be tested, and most of their numbers can be checked by machine:

- **Text size from screenshots.** XAG 101 describes measuring body height on a screenshot from the highest ascender to the lowest descender, counting edge pixels only if their contrast with the background is above 2:1. An automated UI test can capture each screen at the target resolution, at 100% and 200% scale, and measure text bounding boxes against the minimums, failing the build on a regression the way web pipelines fail on axe violations ([Accessibility](/docs/frontend/accessibility#testing)).
- **Contrast** in the same captures, measured against the lowest-contrast area behind each text element, with gameplay captures sampled across levels and lighting conditions rather than one menu screen.
- **Subtitle lint** at build time: line length, line count and speaker labels for every language.
- **Flash and pattern analysis** on video, in two tiers. In the pipeline, an automated check runs over captured frames from bot matches, replays and every cinematic ([Automated Testing at Scale](/books/gaming/production-pipelines#automated-testing-at-scale)): compute relative luminance per frame, count opposing transitions of 10% or more where the darker state is below 0.8, and red transitions by the saturated-red rule, over any one-second window and by screen area, and fail the build on more than three, the same way it fails on text size. Capture with effects intensity at its default, because the default is what has to pass, and in every output mode the game ships. Before release, the reference test: Harding FPA, the tool XAG 118 lists, whose game systems analyze "live video game play direct from the game platform (console, PC, or hand-held device)" over HDMI or from captured files, at "any point in the development process." The in-house check catches regressions on every build; the reference test is the evidence. The same automated check gates animated user uploads.
- **Camera comfort:** each camera layer at 0 produces a camera path identical to the base camera, checked by replaying a recorded input sequence with every layer off.
- **Chat:** with the platform's speech-to-text and text-to-speech settings on, the game starts with both on; each in-game override works; and the text-entry box is reachable on every screen where chat is.
- **Store claims:** every claim in `store_accessibility_claims` names a check that passed on the release build.
- **Input coverage:** every action has a binding, every binding can be changed, every prompt reads the current binding, and every hold or simultaneous input has an alternative. A list of actions with their properties makes this a data check instead of a play-through.
- **Narration:** every focusable element has a name, role and value; focus order matches the layout; narration stops on focus change.
- **People.** XAG 103 says simulation filters "shouldn't be used as a replacement for testing with actual players with colorblindness," and the same holds for every disability. Machine checks find regressions; playtests with disabled players find whether the game is actually playable.

## What This Means for the System You Build

- **Text styles defined at a reference resolution** with XAG 101 minimums enforced by the layout system, scaling to 200% without truncation, and touch targets sized in millimeters.
- **Contrast built in:** optional backgrounds and outlines for text, player-chosen HUD colors, a 7:1 high contrast mode seeded from the platform setting.
- **Subtitles as authored data** per language, with speaker, segmentation and timing, linted for 40 characters and two lines, on before the first sound, with captions by category.
- **No information in one channel only,** and per-element color choices through the theme system.
- **A flash budget in the renderer** so no combination of effects exceeds three flashes a second over a large area, an effects intensity setting named for what it does, and flash analysis on every build and every animated upload.
- **Camera motion as additive layers** (shake, bob, sway, blur) each scaled from 0 to 1, field of view per device class, and VR locomotion and turning modes as settings, with the comfort rating chosen for the default.
- **An action-based input layer** with a player-editable binding table, hold, toggle and repeat as binding properties, and prompts read from the bindings.
- **No dependence on one controller,** since adaptive controllers and two-controllers-as-one remap below the game: in-game remapping still required, a standard-controller path for every input, merged input treated as one player.
- **Speech-to-text and text-to-speech chat** wherever chat exists, seeded from the platform with in-game overrides, under the same blocks, mutes and filters as typed chat.
- **Store accessibility tags as claims** tied to a check and a build, withdrawn before a release that breaks them.
- **Assists as separate settings,** with a per-mode policy and assist state recorded on match participants.
- **An accessibility tree** under the UI, feeding the platform screen reader or a speech synthesizer.
- **Settings per account with device overrides,** seeded from the platform, cached for offline start, never reset by live config.
- **Automated checks in the build** for text size, contrast, subtitles, flashing, camera layers, bindings, narration and chat, a reference photosensitivity test before release, and playtests with disabled players.

## References

**Specifications**

- [Microsoft: Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/gaming/accessibility/guidelines), version 3.2 published June 8, 2023; purpose, structure and the statement that they aren't a compliance checklist
- [XAG 101: Text display](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101), minimum text sizes by platform, measuring body height, 200% scaling, fonts and spacing
- [XAG 102: Contrast](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102), 4.5:1, 3:1 and 7:1 ratios, large text by platform and measuring over non-solid backgrounds
- [XAG 103: Additional channels for visual and audio cues](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103), color never alone, multiple senses, player-chosen colors and simulation filters
- [XAG 104: Subtitles and captions](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/104), speaker identification, defaults, 40 characters, two lines, backgrounds and previews
- [XAG 106: Screen narration](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/106), what to narrate, name-role-value-position order, interruption, rate and pitch
- [XAG 107: Input](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107), full remapping, action remapping, holds and taps, sensitivity, game speed and touch target sizes
- [XAG 117 (moving content and camera motion)](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117), pausing moving UI, camera shake, bob, blur, field of view, auto camera and first or third person, with the Halo Infinite, Cyberpunk 2077, Elder Scrolls Online, Minecraft and Sea of Thieves examples
- [XAG 118: Photosensitivity](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/118), about 1 in 4,000, elimination over warnings, luminance, red flash and spatial pattern failures, and the Harding FPA as a tool
- [XAG 119 (communication experiences)](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/119), voice is not text accessibility, STT, TTS, text entry everywhere, emoji narration, platform defaults and overrides, with the Halo Wars 2, Gears 5, Sea of Thieves, Minecraft and Forza Horizon 4 examples
- [W3C: Understanding SC 2.3.1 Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html), three flashes a second, general and red flash definitions, 25% of a 10 degree visual field
- [ITU-R BT.1702](https://www.itu.int/rec/R-REC-BT.1702-3-202311-I), guidance for the reduction of photosensitive epileptic seizures caused by television; BT.1702-3 approved November 2023 and in force
- [47 U.S.C. 617](https://www.law.cornell.edu/uscode/text/47/617), the CVAA's accessibility requirement for advanced communications services, achievability, compatibility and waivers
- [47 CFR 14.31](https://www.law.cornell.edu/cfr/text/47/14.31), CVAA recordkeeping, two-year retention and the annual April 1 compliance certificate
- [FCC: Order DA 17-1243 (PDF)](https://docs.fcc.gov/public/attachments/DA-17-1243A1.pdf), December 2017; the final extension of the video game software class waiver through December 31, 2018
- [Online Safety Act 2023, section 183](https://www.legislation.gov.uk/ukpga/2023/50/part/10/crossheading/offences-of-sending-or-showing-flashing-images), the UK offence of sending or showing flashing images, five-year maximum and the provider exemption
- [Meta Horizon Store policies](https://developers.meta.com/horizon/policy/store-policies), the required Comfortable, Moderate and Intense comfort ratings
- [Meta: Accessibility checklist](https://developers.meta.com/vr/design/accessibility-checklist/), updated April 13, 2026; accessibility VRCs 7 to 9 and that they're recommended, not required

**Reference**

- [Game Accessibility Guidelines: Full list](https://gameaccessibilityguidelines.com/full-list/), basic, intermediate and advanced guidelines across motor, cognitive, vision, hearing, speech and general
- [ASA: Flashing images in advertising](https://www.asa.org.uk/news/flashing-images-in-advertising.html), Annex 1 of Ofcom's guidance note as the UK technical standard and the expectation of a Harding FPA test or equivalent
- [HardingFPA for games](https://www.hardingfpa.com/hardingfpa-for-games/games-industry/), live analysis from console, PC or handheld over HDMI or captured files, at any point in development
- [Laura Kate Dale: Why games don't have epilepsy safe mode settings](https://laurakbuzz.com/2020/08/28/the-important-reason-games-dont-have-epilepsy-safe-mode-settings-access-ability/), no game can be guaranteed safe; "effects intensity" wording
- [Playdate: Reduce Flashing mode](https://help.play.date/accessibility/reduce-flashing/), the first-launch question and the system-wide setting games can read
- [Xbox Wire: Xbox Adaptive Controller now available](https://news.xbox.com/en-us/2018/09/04/xbox-adaptive-controller-now-available/), September 4, 2018, $99.99, Copilot
- [Xbox Adaptive Controller](https://www.xbox.com/en-US/accessories/controllers/xbox-adaptive-controller), 19 3.5mm ports and two USB ports, remapping in the Accessories app, three-profile switching, Windows support
- [Xbox: Accessibility](https://www.xbox.com/en-US/community/for-everyone/accessibility), Controller Assist, the Accessories app, Accessible Games Initiative tags and speech transcription for party and in-game chat
- [PlayStation: Access controller](https://www.playstation.com/en-us/accessories/access-controller/), four 3.5mm ports, 30 profiles with three on the controller, two Access controllers and a DualSense as one virtual controller
- [PlayStation Blog: The Access controller for PS5 starter's guide](https://blog.playstation.com/2023/12/04/the-access-controller-for-ps5-starters-guide/), console-side button assignment, profiles not transferring, "every game available on PS5," pairing with a DualSense for touchpad features
- [PlayStation: Second controller for assistance](https://www.playstation.com/en-us/support/hardware/second-controller-assistance/), two controllers as one and the functions missing on the assist controller
- [Microsoft Accessibility Blog: Game Chat Transcription in Halo Wars 2](https://blogs.microsoft.com/accessibility/game-chat-transcription-feature-available-today-in-halo-wars-2-for-xbox-one-and-windows-10-pcs/), March 15, 2017; the speech-to-text and text-to-speech pilot
- [Gematsu: Switch 2 and Switch system update 22.5.0](https://www.gematsu.com/2026/06/switch-2-and-switch-system-updates-version-22-5-0-now-available), June 15, 2026; the "Change Speech ⇔ Text During GameChat" option and its added languages
- [PlayFab Party: Speech-to-text and text display UX guidelines](https://learn.microsoft.com/en-us/gaming/playfab/features/multiplayer/networking/party-speech-to-text-ux-guidelines), Hypothesis and Final phrases, 28 px at 1080p, nine positions, 15-second close and visual distinction
- [Unity: Vivox text-to-speech](https://docs.unity.com/en-us/vivox-unity/developer-guide/text-to-speech), CVAA purpose, local and remote destinations, US English and one logged-in user
- [Xbox Wire: Game accessibility feature tags now available](https://news.xbox.com/en-us/2021/11/16/game-accessibility-feature-tags-now-available/), November 16, 2021; 20 tags with requirements
- [Xbox Wire: Accessible Games Initiative tags now available across all digital Xbox experiences](https://news.xbox.com/2025/07/09/accessible-games-initiative-tags-xbox-interview/), July 9, 2025; where they appear and the five retained Xbox tags
- [PlayStation Blog: Accessibility Tags roll out on PlayStation Store on PS5](https://blog.playstation.com/2023/04/03/accessibility-tags-roll-out-this-week-on-playstation-store-on-the-ps5-console/), April 3, 2023; more than 50 tags in six categories for PS4 and PS5 games
- [Steamworks: Accessibility features](https://partner.steamgames.com/doc/accessibility_features), the feature wizard, the 19 features by category, Camera Comfort and Chat Speech-to-text definitions
- [GamingOnLinux: Steam adds accessibility features to store pages](https://www.gamingonlinux.com/2025/06/steam-adds-accessibility-features-to-store-pages-and-filters-for-searching/), June 12, 2025 launch and Valve's figure of over 5,000 apps
- [Apple: Overview of Accessibility Nutrition Labels](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels), the nine features, all common tasks, per-device answers, voluntary to start and OS 26 display
- [Apple Newsroom: Accessibility Nutrition Labels announced](https://www.apple.com/newsroom/2025/05/apple-unveils-powerful-accessibility-features-coming-later-this-year/), May 13, 2025; labels for apps and games
- [ESA: Accessible Games Initiative](https://www.theesa.com/entertainment-software-association-introduces-the-accessible-games-initiative-to-provide-players-with-information-about-accessibility-features-in-video-games/), March 20, 2025; founding members, 24 tags with criteria, voluntary use

**In practice**

- [PlayStation: The Last of Us Part II accessibility](https://www.playstation.com/en-us/games/the-last-of-us-part-ii/accessibility/), more than 60 settings, full remapping, camera shake and motion blur intensity and a field of view slider
- [Xbox Wire: Forza Motorsport accessibility](https://news.xbox.com/en-us/2023/04/27/forza-motorsport-accessibility-features-blind-driving/), Blind Driving Assists as a set of audio-cue features with pitch and volume, and One Touch Driving
- [Ubisoft: Star Wars Outlaws accessibility spotlight](https://news.ubisoft.com/en-us/article/4J5XWevEccm1LBSduyij2H/star-wars-outlaws-accessibility-spotlight), separate FOV for default and aiming, three motion blur controls, screen shake and a removed glitch effect
- [Ubisoft: Accessible Games Initiative tags launch](https://news.ubisoft.com/en-us/article/14lo8Iw0nGj7M1G4kbEwWN/ubisoft-launches-accessible-games-initiative-tags-for-global-accessibility-awareness-day), May 21, 2026; tags on product pages, starting with four games
