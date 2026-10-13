# First-slice validation

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
