# Validation

## Background playback and narration — October 15, 2026

- All **108 tests** pass, and TypeScript plus the production Vite build pass. New regressions cover an uninterrupted recording through blur/visibility changes, progression to the next voiced line in the background, returning focus without replay, and retaining the remainder of the Auto delay. Optional museum narration also continues across focus changes.
- The cinematic keeps its existing timeline moving on a 250 ms background timer when animation frames are unavailable. Tests cover hidden-tab progress, explicit pause/resume, natural completion exactly once, and timer/frame disposal. Controller focus and held-input protections remain in place.
- Narrator lines have an explicit **NARRATION** heading and no character portrait. Speaker transitions restore Mara's approved portrait or Kite's existing design. The dialogue card retains its desktop column and narration removes the mobile heading's portrait inset.
- Browser verification: the cinematic completes with another tab open; voiced Auto progresses from the narrator through Mara/Kite dialogue and waits at the first two-choice menu. The narrator view was visually inspected at 1280 × 720 and 390 × 844; the phone view has no horizontal overflow. Continue restores Mara's portrait. No new browser warnings or errors were observed. These are transport/layout checks, not a human listening review.
- Explicit panels still pause story playback and Auto; choices, evidence, and museum interactions continue to require player input. Browsers or the operating system can still throttle or suspend background pages; device sleep and mobile background policies have not been verified.

## Museum recordings — October 15, 2026

- All **105 tests** pass. The complete 94-track script is matched against current authored words and speakers across both harbor endings, both museum approaches, written/model discovery, both gate positions, and both leads. Explicit assertions protect every `--v1`/`--v2`/`--v3` selection, and changed words or speakers cannot reuse an old recording.
- The existing two React museum journey tests now verify real audio URLs for both character approaches and discovery paths; sequential exhibit headings/paragraphs; completion cleanup; canceled callbacks after closing history; stopping a reading when the gate or timeline changes; and optional handover/epilogue narration. Existing autoplay, cinematic, cancellation, and story-route coverage still passes.
- All **94 MP3s** decode successfully with FFmpeg. TypeScript and the production Vite build pass. The asset library remains on demand, with no TTS API calls, new audio engine, or paid generation.
- Optional Listen controls use the existing voice player and never select choices, advance scenes, or operate the tide model. The recorded script is versioned beside the supplied clips; museum historical content and character designs are unchanged.
- Browser verification plays the museum arrival and handshake callback, Mara's route, a history section, a flood explanation, the open-gate discovery, and the handover record. Native `speaking` events are observed; closing history and turning the gate restore idle playback. Exhibit and handover controls were visually checked at the normal panel width and 390 × 844; the paper record's button uses a darker ink color for readable contrast. Screenshots are ignored QA artifacts. This validates playback and controls, not a human review of every performance.

## Recorded dialogue and VN settings — October 15, 2026

- All **103 tests** pass across 13 files. Added coverage checks every supplied filename against actual content, recording playback without device speech, sequential evidence dialogue, cancellation and late events, failed/muted clips, cinematic seeks and pause/resume, autoplay timers and reading time, foreground checks, settings pauses, choice/evidence gates through the actual React UI, and reading-preference recovery/persistence. Existing harbor and museum route coverage remains green.
- TypeScript and the production Vite build pass. All **26 supplied MP3s** decode successfully with FFmpeg. The build emits 26 hashed audio assets from the unchanged source files, with no TTS API or key.
- Actual browser playback reaches the `speaking` media event, progresses naturally through the opening harbor conversation in Auto, and waits at the first choice. Opening Settings stops the current recording and holds that line; closing the panel restarts it before Auto continues. The sound page exposes all four mixer channels and the opt-in local voice fallback.
- Visual inspection covers the Reading menu and dialogue toolbar at desktop 1280 × 720, phone 390 × 844, and narrow 320 × 568 with larger text. The narrow toolbar's Listen label is collapsed to retain its accessible icon control; vertical scrolling accommodates larger text.
- The opening's four recordings fit their existing shot durations. Automated transport tests cover caption offsets, no repeated starts, mute/voice volume, seek, resume, disposal, and an aborted pending play request. Human listening review, real mobile audio policies, and physical controller hardware remain to be checked.
- Museum recordings were not among the supplied files; museum dialogue stays readable, with optional device speech. Auto uses reading time for missing or failed voice playback and never selects an answer or operates an exhibit. Story saves and rollback are outside this change. These changes are locally verified; this entry does not claim a new Pages deployment.

## React restoration and branching Hall of Waters — October 15, 2026

- All **85 tests** pass across nine files. This includes the original 46 tests, 37 museum progression tests, and two museum journeys through the actual React UI. The route matrix combines both harbor entry choices, both harbor endings, both museum approaches, both gate positions, and both final leads. Reading-only discovery, leaving/revisiting the model, invalid actions, replay reset, and evidence retention are covered.
- `npm run build` passes the TypeScript check and production Vite build. The active source, run commands, and Pages workflow use React/TypeScript again; the Ren’Py experiment is retained under `legacy/renpy/`.
- Original harbor content, cinematic components, Mara artwork, Kite SVG, Cognitive Perception, and original runtime assets were compared against the pre-migration version. The four supplied museum WebPs match their imported originals by hash.
- The restored opening was exercised in the browser: natural completion enters the original first harbor line; Begin with sound, pause, actual timeline seeking, and Skip respond. The S01 video reports ready state 4 and its expected 5.042-second duration.
- Actual browser controls were used to play the harbor investigation into the museum, inspect both character approaches, operate the gate and all three model moments, discover the handover record, follow the written-account alternative, and reach both lead endings. Field notes retain the original three observations, the approach-specific information, the record, and the chosen next step.
- Visual review at desktop 1280 × 900 and phone 390 × 844 covered the gallery, history panel, flood model, and handover record. Review found and corrected exhibit contrast, redundant model layout height, and phone control/record overlap. The final phone discovery view has no horizontal overflow. Screenshots are local QA artifacts under ignored `.qa/`.
- Museum history and reconstruction remain provisional. Water responses are qualitative teaching illustrations; the lamp is separately identified as a recorded observation. The final lead records the next investigation without resolving the harbor mystery.
- Progress lasts for the current visit; cross-session story saves are not implemented. Simulated controller coverage passes, but physical hardware and real mobile devices remain untested. Restored audio/voice playback has not received a fresh human listening review. The restored Pages workflow has not been run or deployed for these local commits.

The following records describe earlier validation stages. Native-engine results apply only to the archived experiment.

## Archived Ren’Py migration and Hall of Waters — October 15, 2026

- Ren’Py **8.5.3.26051504** lint passes with no reported problems: 60 dialogue blocks, three menus, seven named images, and 29 screens.
- **20 native test cases and 241 assertions pass**. Sixteen parameterized full routes combine both harbor entry choices, both harbor endings, both gate positions, and both museum leads. Additional cases cover new-game reset, leaving and revisiting the reconstruction, both opening sound modes, and preferences.
- The interaction suite also checks duplicate evidence inspection, the three-clue decision gate, perception toggling, optional reading, saving/loading at the discovery, rollback before a lead choice, and reviewing the exhibit and field notes at the ending. Test saves use `.qa/saves`.
- Actual Ren’Py renders were inspected at 1600 × 900 for the harbor, original perception geometry, supplied museum gallery, exhibit text and scrolling, reconstruction controls, discovery record, and chapter ending. A zero-width reading viewport was found during visual review and fixed by supplying the vertical scrollbar’s width. Screenshots are generated under ignored `tests/screenshots/`.
- A comparison against the original content confirmed all **20 harbor dialogue lines** and original observations are preserved. All original runtime raster artwork was checked by hash after copying. Mara’s approved right-temple module and Kite’s canonical SVG remain unchanged.
- All **46 archived React tests** also pass after relocation; the studio-logo import was adjusted to the preserved root studio source.
- Browser and PC builds succeed. The PC archive is `SolarCommons-0.2.0-pc.zip` (58,000,109 bytes). Archive inspection confirms tests and the legacy prototype are excluded from the game distribution.
- The browser export was served locally and opened in the in-app browser at 1280 × 720. The main menu, opening invitation, skip into the exact original harbor narrator line, and Cognitive Perception rendered and responded to input. Full route coverage is from the native engine suite, not a full manual browser playthrough.
- The Pages workflow now targets Ren’Py; its Linux/Xvfb run and live deployment have not been exercised in this local-only commit. Physical gamepads, mobile browsers, desktop self-voicing, and human listening review of the adapted audio remain outstanding. The older React voice selector and cinematic transport controls are archived, not claimed as native features.
- Museum history and the flood concept are explicitly provisional in the design notes. The model labels predicted water behavior separately from the recorded lamp observation. No paid generation, live AI, external messages, or telemetry were added.

The records below describe the earlier React version, now restored at the repository root.

## Opening cinematic — October 14, 2026

- All **46 tests** pass, including the unchanged harbor progression/controller/voice coverage, the studio boundary, three authored-timeline checks and ten cinematic integration checks.
- TypeScript and the production Vite build pass. The eight optimized stills total 1,460,508 bytes. The preparation script reproduces them from the recorded masters.
- Startup follows studio → opening → harbor. Tests exercise the complete 34-second sequence, pause/resume, foreground loss, saved mute/clip levels, failed-video fallback, reduced motion, controller confirmation and completion through keyboard/pointer/controller release. Strict Mode unmount leaves no polling frames or cinematic audio engine.
- Browser: S01 reaches native media ready state 4, reports 5.042-second duration, advances unmuted after Begin with sound, and stops at the first cut. Only its first three seconds are used. The checked-in clip matches Kevin's supplied finished file: SHA-256 `0ac6d01f35658ef8fce0e0bd49cb4aee7012bbeaa0f6e46d3855615f85f3f7d4`.
- Desktop 1280 × 720, phone 390 × 844 and narrow phone 320 × 568 framing inspected. The narrow invitation was corrected to separate text from the image and retain both start buttons. No horizontal overflow or unloaded image assets observed.
- Browser reduced motion: all eight camera transforms compute to `none`, no animated effect SVG exists and native video remains paused. Captions and the partial-model label remain legible.
- Actual-control seeking inspected consent acknowledgement, the threshold, shared workspace and city departure. Natural completion reaches the exact original first narrator line, with zero clues and Cognitive Perception off. No console warnings or errors observed during this walkthrough.
- Audio preferences and video transport were checked; the new synthesized mix has not received a human listening review. Controller lifecycle tests use a simulated standard pad; physical hardware remains to be tried.
- No new image/video generation, paid calls, new animation dependencies or upload kits were used. The cinematic does not change harbor story state or establish additional Unbinding history.

The notes below record earlier validation stages.

Verified locally on October 13, 2026.

- `npm run build`: TypeScript check and production Vite bundle pass.
- `npm test`: all ten progression tests pass, covering both entry responses, both endings, clue gating, repeated inspection, unknown IDs, perception, and complete replay reset.
- Browser walkthrough: opening dialogue, both entry choices, all three evidence panels, notes, both endings, and replay exercised through actual controls.
- Browser sizes: 1440 × 900 desktop, 748 × 884 in-app panel, 390 × 844 phone, and 320 × 568 narrow phone. No horizontal overflow observed; the narrow view scrolls vertically for larger text.
- Keyboard: Continue remains focused between lines; C works from a focused control; numbered choices work; phase changes focus the next relevant control; Escape dismisses evidence and settings.
- Reduced motion: enabling the setting yielded zero animated elements and no background transform in computed browser styles. The system media preference is also handled in CSS and the motion hook; OS emulation was not used.
- Assets: harbor and Mara load from project-owned WebP files. The portrait retains alpha transparency.
- Console: no warning or error logs in the final browser walkthrough.

Initial browser interaction checks used the Vite development server. No live AI calls are part of the prototype.

## Audio and controller pass

- Production build and all 28 tests pass: ten original progression tests, six gamepad sampler tests, four actual-scene controller integration tests, five voice playback tests, and three preference tests.
- Browser activation: explicit Enable sound activates the score without inadvertently muting it. Returning to a fresh page leaves audio locked until interaction.
- Real local voices enumerated: Microsoft David, Mark, and Zira. Kite's test line produced a speech-start event; closing panels and setting master to zero canceled speech.
- Audio output sampled after the master bus: music alone produced a nonzero peak of 0.035986; perception effects with music disabled produced 0.026353. Master volume zero produced exactly zero output. These are signal checks, not a claim of human listening review.
- Controller integration exercises actual React controls and scene transitions with a simulated standard gamepad: held A advances one line, D-pad selects a choice, A opens evidence, B closes it, X toggles perception, Y opens notes, Start opens settings, and left/right changes a real volume slider. Focus loss and reconnect consume stale held input. Polling stops on unmount.
- Physical controller hardware was not exercised in the browser verification session. Hardware mapping, Bluetooth behavior, and controller-specific feel remain to be checked with Kevin's controller.
- A fresh page load, audio activation, and local voice test produced no new console warnings or errors. An earlier hot-reload hook-order error during development did not recur on the fresh load.
- All audio is generated locally or uses a local speech service. No paid calls, cloud speech fallback, or unlicensed music assets were used.

## Studio startup and Pages

- Production build and all 33 tests pass, including five startup boundary tests. Startup waits for the image, runs once, consumes keyboard holds and mouse clicks, ignores held controller buttons and stick drift, and cleans up timers/polling under Strict Mode.
- Browser: the supplied logo fits a centered rectangle exactly 70% of viewport width and height with `object-fit: contain`; full-opacity hold observed on black. Natural completion enters the harbor.
- Native Enter and mouse skip leave the opening narrator line unchanged and audio locked.
- The supplied `studio/` source files remain unchanged. Reduced-motion CSS removes fades while retaining the presentation interval.
- GitHub Actions runs the full tests and production build before publishing the static output to Pages.
- Public Pages verification: `https://kileader.github.io/solar-commons/` loads the studio logo, transitions to the opening narrator line, and loads both harbor and Mara images from the project path. Continue advances dialogue and Cognitive Perception toggles through actual controls. No browser warnings or errors were observed.
- The first hosted run passed all 33 tests, built the production bundle, and deployed successfully. Pages actions were subsequently updated to their official Node.js 24 releases to remove the runtime deprecation notice.

## Mara's temple module and first storyboard image

- Built-in imagegen produced S01 from the existing Mara and harbor references, followed by targeted hand/control separation and the approved temple-module edit. The room master, portrait master and exact prompts are preserved in `docs/storyboard/`.
- The in-game portrait matches the storyboard's anatomical right-temple ivory/brass plate, upper mint indicator and lower teal contact. Character identity, pose, costume, brooch/strap orientation and module matching were visually reviewed against the references.
- Runtime WebP is 600 × 800, 157,322 bytes, RGBA with alpha spanning 0–255 and transparent top corners. The original portrait remains available.
- All 33 tests and the production build pass. Browser inspection confirmed the new portrait URL loads, the module appears beside her eye, transparency blends into the scene, the current dialogue is unchanged, and no warnings/errors were observed.
- Only the portrait asset reference and accessible image description changed in the game. The cinematic and QTE remain planned work; S01 is a storyboard asset.
