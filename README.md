# Solar Commons

An illustrated science-fiction choose-your-own-adventure about Mara and Kite sharing a point of view while investigating an unexpected structure beneath Larkhaven’s harbor.

[Play in your browser](https://kileader.github.io/solar-commons/).

The active project uses **React, TypeScript, and Vite**. The original 34-second cinematic, animated attention paths, camera movement, local score, character voices, and responsive harbor presentation are restored. Choose **Begin with sound** or **Watch silently**; pause, seek, restart, reduced motion, and skip are available. The accepted S01 video and all approved character art are unchanged.

## Play and develop

Use Node.js 22.12 or newer (developed with Node.js 24).

```sh
npm ci
npm run dev
```

Continue the conversation, choose an approach, inspect the three harbor readings, then choose either original ending. Cognitive Perception distinguishes observations from partial reconstructions. Field notes retain what you have examined.

Both endings lead to the **Hall of Waters**. Follow Mara’s family memories or trace the listening system with Kite: each route has its own illustrated conversation, reveals a different clue, and is remembered when they interpret the discovery. An optional history wall introduces the Unbinding and the Night of Two Waters. Reach the dawn handover through a small flood reconstruction or a written account, then choose which lead to follow. The chapter ends with a concrete next step and an unresolved mystery.

Continue from the museum to **The Quiet Index**, a short Chapter Two encounter in Larkhaven’s nocturnal district. Meet Ilex Vale, a visibly cybernetic independent archivist, and introduce Kite through a mutually authorized AR guest channel. Choose **Analysis**, **Empathy**, or **Intuition** to uncover a distinct insight before reading the same recovered refuge excerpt. Field notes keep that insight and the earlier museum choices; the stopping point preserves your selected next investigation. The supplied canal, studio, and transparent Ilex portrait are used unchanged; the portrait shares Mara’s sizing and placement. Kevin’s supplied five-second Ilex introduction plays as one silent shot with pause, skip, keyboard/controller input, and a playable still for reduced motion or failed playback. Chapter Two’s dialogue is text-first and unrecorded: Auto uses the existing reading pace, with optional local device speech following your sound settings. No new voices or video were generated.

The museum history, family testimony, and reconstruction remain provisional. Four supplied backgrounds appear unchanged; Mara’s temple module and Kite’s design are preserved. The water display illustrates competing pressures rather than simulating fluid dynamics. There is no mandatory quiz, registration, or lore gate.

The [creative direction](docs/CREATIVE_DIRECTION.md) favors strong prose, character chemistry, manageable branches with remembered consequences, optional lore, and occasional interactions that earn their place in the story. This chapter is the first example, not a complete novel.

Keyboard: **Enter/Space** continues dialogue, **A** toggles Auto, **C** toggles perception, **J** opens notes, **1/2/3** selects an available story choice, and **Escape** closes a panel. All controls work with Tab and Enter. Standard controllers retain the existing browser controls.

The scene fits the viewport, with dialogue and choices always in reach. Each recorded line keeps its complete text in one internally scrollable passage; separate recordings get separate pages. Unvoiced evidence and field notes use measured **Back / Next** pages, and a section selector jumps directly to an entry. Text reflows for the available space, preserving every word. Phone prose uses 17 px text (16 px in short landscape), with a larger-text option. The handover record opens in its own reader. Settings use short pages, and the small-screen tide model puts its explanation behind **Read flood account**. A quiet footer keeps the current step visible; the overall page never needs scrolling.

The gear opens **Reading**, **Sound**, and **Controls** settings. Auto gently scrolls the current passage with its recording, waits for the voice to finish, then pauses **one second** before continuing (adjustable from 0.5–5 seconds). Unvoiced lines use the selected reading pace. Wheel, touch, or keyboard scrolling takes over the current passage; toggle Auto to resume its scrolling. The controller’s right stick scrolls and turns Auto off. Choices, sensor readings, and the flood model wait for player input. Evidence conversations advance between visible character pages; optional exhibit readings only begin after Listen, then Auto can continue through the readings. Panels have their own Auto control. Opening a panel pauses the underlying story; switching tabs or focusing another window keeps audio and Auto running. The opening cinematic also continues until you pause it. Browsers or the operating system may suspend background pages, especially on mobile or during sleep. Auto starts off each visit. Text size, reduced motion, timing, reading pace, and sound preferences stay on this device. Narration is labeled separately and has no character portrait.

Kevin's 94 MP3 recordings in [`dialogue/`](dialogue/README.md) cover the harbor, museum branches, four opening captions, and voice preview. Optional **Listen** buttons narrate the history wall, flood explanations, handover record, and gallery/epilogue descriptions. Reading never chooses an answer or advances the reconstruction. Closing a panel, changing a model control, or pressing Stop ends its narration. An optional local English device-voice fallback remains off by default. Opening dialogue follows its existing timeline, pause, and seek controls.

The [Quiet Index production notes](docs/quiet-index/README.md) explain the handoff, preview route, and small editorial adaptations. Its [53 future recording passages](docs/quiet-index/VOICE_RECORDING_PLAN.csv) have stable IDs, speakers, and exact implemented text. Regenerate that list with `node tools/export-quiet-index-voices.mjs` after editing the chapter. Existing audio assignments remain unchanged.

This is an authored, browser-local story with no backend, telemetry, paid inference, or external messaging. Scene progress lasts for the current visit. Voice playback serves checked-in audio assets; it never calls a TTS provider.

## Verify and publish

```sh
npm test
npm run build
npm run preview
```

GitHub Actions runs tests, builds the static application, and publishes `dist/` to Pages when pushed to `main`. A local commit does not publish it.

The native experiment is preserved in the [Ren’Py archive](legacy/renpy/README.md) and excluded from the browser build. The [migration record](docs/MIGRATION.md) explains the decision. Original storyboard masters, art direction, and studio sources remain in `docs/` and `studio/`.
