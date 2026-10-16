# Solar Commons

An illustrated science-fiction adventure about Mara, an ocean researcher, and Kite, an independent intelligence who shares her perception. An unexpected structure beneath Larkhaven’s harbor draws them into a mystery about the city’s history, the people it remembers, and the voices it left out.

**[Play Solar Commons in your browser](https://kileader.github.io/solar-commons/)**

The game is a work in progress, currently playable through **Chapter Two: The Quiet Index**. It uses React, TypeScript, and Vite, with illustrated scenes, branching dialogue, recorded performances, and short cinematics.

## The playable story

- **Prologue — A shared point of view.** A 34-second opening introduces Mara and Kite’s connection before their arrival in Larkhaven. Watch with sound or silently; pause, seek, skip, and reduced motion are available.
- **Chapter One — The Harbor and Hall of Waters.** Investigate three harbor readings through shared perception, then visit the museum. Follow Mara’s family memories or trace the old listening system with Kite. Optional history readings and a small tide reconstruction offer context; a written account provides another route to the discovery. Choose the next investigation: the listening line or missing testimony.
- **Chapter Two — The Quiet Index.** Follow that lead into Larkhaven’s nocturnal district and meet Ilex Vale, a visibly cybernetic archivist. Ilex and Kite authorize a limited AR introduction, then Mara chooses **Analysis**, **Empathy**, or **Intuition** to investigate a protected refuge recording. Each approach reveals a different insight and retains a field note. The chapter ends with an unresolved mystery and remembers the museum lead you selected.

The story favors character chemistry, humor, and questions worth pursuing. Branches rejoin while remembering the player’s choices. Field notes distinguish observations from interpretations; a plausible explanation is never automatically treated as proof. The [creative direction](docs/CREATIVE_DIRECTION.md) describes the intended tone and scope.

## Playing

Start with **Begin with sound** or **Watch silently**, or skip the prologue. Continue the dialogue, choose how Mara responds, and examine the harbor markers. Both harbor endings lead to the museum. After choosing a museum lead, select **Continue to The Quiet Index**. The current stopping point offers chapter replay, field notes, and a return to the museum.

Mara and Kite begin with an outing to try their expanded perception. A maintenance float’s discovery catches their attention, and Mara’s curiosity draws them into investigating the shape beneath the breakwater.

Use **Chapters** on the opening screen or the list icon in the story toolbar to start at the **Prologue**, **The Harbor**, **Hall of Waters**, or **The Quiet Index**. Later starts let you choose the earlier harbor outcome and, for Chapter Two, the museum lead; existing choices are prefilled when available. The required earlier readings appear in field notes, while the new scene’s choices remain open. Starting here replaces story progress for the current visit and keeps your sound and reading preferences. Close the selector to continue your current scene without changing it.

Switch on **Cognitive Perception** to see Kite’s shared attention: harbor geometry, museum arches and water paths, canal reflections, and an archive workbench with a guest-channel diagram. Select a focus marker—or **Shared traces** on phones—to inspect observations, interpretations, and remaining uncertainties. These optional readings pause the dialogue. The archive view only shows an accepted guest connection or a route-specific insight after the story establishes it. Reduced motion keeps the diagrams still.

| Keyboard        | Action                                          |
| --------------- | ----------------------------------------------- |
| Enter / Space   | Continue dialogue or activate a focused control |
| 1 / 2 / 3       | Select an available story choice                |
| A               | Toggle Auto                                     |
| C               | Toggle Cognitive Perception                     |
| J               | Open field notes                                |
| Escape          | Close a panel; skip a cinematic                 |
| Tab / Shift+Tab | Move between controls                           |

Standard controllers are supported. Use the D-pad or left stick to move between controls, A / Cross to select, and B / Circle to close a panel or skip a cinematic. The right stick scrolls dialogue. **Settings → Controls** lists the remaining shortcuts. During cinematics, Space pauses or resumes playback.

Dialogue stays inside the viewport. Long passages scroll with the wheel, touch, or keyboard; field notes and optional readings also have Back / Next pages. **Settings → Reading** offers larger text, reduced motion, reading pace, and the pause between passages.

Harbor readings are added to field notes automatically for the current visit. **Continue examination** leads through observations, models, uncertainty, and the characters’ responses; **Finish examination** returns to the harbor from the final page. **Close for now** lets you leave earlier and reopen the reading later.

**Auto** follows the current recording and waits for it to finish before continuing. Unvoiced dialogue uses the selected reading pace. Choices, investigation controls, and chapter endings wait for the player. Opening a panel pauses the underlying dialogue. Manual scrolling takes over the current passage; toggle Auto to resume automatic scrolling.

## Sound and cinematics

The checked-in [dialogue recordings](dialogue/README.md) contain **148 MP3 performances** covering the harbor, museum, opening captions, optional readings, voice preview, and all 53 Chapter Two passages and variants. **Listen** replays an available recording. Sound settings control music, effects, and dialogue; optional local device speech for unrecorded text is off by default.

Mara’s added harbor reaction, `harbor-curiosity`, uses its supplied recording. All existing recorded dialogue remains intact. The [opening playtest review](docs/OPENING_PLAYTEST_REVIEW.md) includes the opening changes and the optional sonar-prediction proposal.

**The Quiet Index is voiced**, including Ilex, narration, all three investigation approaches, both museum-lead variations, and the recovered refuge excerpt. Quiet canal water, restoration machinery, a guest-channel chime, the cartridge reader, and archival hiss and switching clicks complement the performances. These brief original synthesized effects follow the Effects volume and stop when their passage is skipped or paused. The hiss and clicks are authored sound design, not additional historical evidence.

Ilex’s supplied five-second introduction remains one silent video shot, with pause and skip controls. Reduced motion or unavailable video presents a still image with Continue. Mara, Kite, and Ilex retain their established artwork and consistent dialogue portraits.

The prologue and dialogue can continue while another tab or window is active. Browsers and operating systems may suspend background playback, especially on mobile or during sleep.

## Current limits

This is an unfinished, authored story. The museum history and archival testimony remain provisional, and the investigation beyond The Quiet Index is not yet playable. The tide model illustrates competing pressures rather than simulating fluid dynamics.

Story progress and choices last for the current visit; there is no cross-session save system yet. Reading, motion, and sound preferences stay on the device. The game runs locally in the browser without a backend, accounts, telemetry, paid inference, or external messaging. Kite’s dialogue and the in-world sensor readings are authored fiction. Voice playback uses bundled recordings or optional local device speech; it does not call a speech-generation service.

## Develop

Use **Node.js 24**, matching the GitHub Actions build.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To test and preview a production build:

```sh
npm test
npm run build
npm run preview
```

Tests cover story transitions and branches, remembered choices, keyboard/controller input, reading and Auto behavior, cinematic fallbacks, and exact matching between recorded dialogue and displayed text.

## Source and production notes

| Location                       | Contents                                                   |
| ------------------------------ | ---------------------------------------------------------- |
| `src/content/`                 | Authored dialogue, choices, readings, and field notes      |
| `src/state/scene.ts`           | Story progression and retained choices                     |
| `src/components/`              | Scene presentation, readers, settings, and cinematics      |
| `src/audio/`                   | Playback, preferences, and text-sensitive recording lookup |
| `public/art/`, `public/media/` | Runtime artwork and video                                  |
| `dialogue/`                    | Recorded performances and their exact script mapping       |
| `docs/`, `studio/`             | Creative direction, storyboards, and production sources    |

The [Quiet Index production notes](docs/quiet-index/README.md) document the supplied assets, editorial adaptations, and playtest results. Its [voice recording plan](docs/quiet-index/VOICE_RECORDING_PLAN.csv) lists all 53 passage IDs, speakers, exact text, and recording status. Regenerate that list after script changes; rewritten text is marked unrecorded until a matching performance is supplied:

```sh
node tools/export-quiet-index-voices.mjs
```

The original [Ren’Py experiment](legacy/renpy/README.md) is archived and excluded from the browser build. The [migration record](docs/MIGRATION.md) explains the transition to the current stack.

## Publishing

Pushing to `main` runs the **Publish Solar Commons** GitHub Actions workflow: install dependencies, run tests, build, and deploy `dist/` to [GitHub Pages](https://kileader.github.io/solar-commons/). A local commit alone does not update the public game.
