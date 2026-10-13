# Solar Commons

A short hard-science-fiction solarpunk visual novel about sharing a point of view with an AI you have known for years.

Mara and Kite investigate an unexpected structure beneath the harbor of Larkhaven. Sonar, temperature readings, and an incomplete historical survey point toward different possibilities. The player examines the evidence and chooses how to proceed.

## Play locally

Requires Node.js 22.12 or newer (developed with Node.js 24).

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Click **Continue**, choose a way into the investigation, and examine the three harbor markers. **Cognitive Perception** reveals Kite’s shared sensorium. Once all three clues are recorded, choose an approach to reach one of two endings. **Field notes** summarizes the evidence.

Keyboard: **Enter/Space** continues dialogue; **C** toggles perception; **J** opens notes; **1/2** selects a story choice; **Escape** closes a panel. Every control also works with Tab and Enter. Settings offer reduced motion and larger dialogue; system reduced-motion preferences are respected automatically.

## Scope

- One harbor scene, about five minutes, with two entry choices and two endings.
- Original illustrated environment and transparent human portrait, layered with parallax, water light, and atmospheric motion.
- A procedural SVG portrait of Kite with a faceted silhouette and animated connections.
- A cybernetic perception layer with scientific traces and a partial reconstruction of the anomaly.
- Three evidence inspections separating observations, modeled explanations, and unresolved questions.
- Responsive presentation, native modal focus handling, and reduced-motion support.

This is a browser-local, authored story. It makes no AI requests, collects no telemetry, and has no backend. Scene progress resets on reload; sound preferences persist on this device. There is no story save system or additional chapter in this slice.

## Sound and controllers

Click **Enable sound**, or use the scene controls, to start audio. The original ambient score layers a continuous shore texture, slowly changing chords, and sparse glass tones. It ducks beneath spoken dialogue. Focus, dialogue, choices, evidence, perception, panels, settings, and endings have their own restrained feedback.

**Listen** replays the current dialogue. Mara and Kite use different local device voices when available. Opening an evidence panel plays its character dialogue; advancing, closing a panel, muting, or leaving the foreground cancels old speech. Dialogue never advances automatically.

Settings include **Master**, **Music**, **Voice**, and **Sound effects** volumes, a mute switch, automatic dialogue playback, local voice selection, and a voice test. Preferences are stored locally. Voices must be reported by the browser as local English voices; remote voices are excluded, with no fallback to a cloud speech service. Availability and voice quality depend on the device and browser. See [MDN: local speech services](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService).

Standard-mapped Xbox and PlayStation controllers use the following controls:

| Control                                       | Action                      |
| --------------------------------------------- | --------------------------- |
| D-pad / left stick                            | Move focus                  |
| A / Cross                                     | Continue or select          |
| B / Circle                                    | Close a panel               |
| X / Square                                    | Cognitive Perception        |
| Y / Triangle                                  | Field notes                 |
| Start / Options                               | Settings                    |
| LB / L1                                       | Replay dialogue             |
| RB / R1                                       | Mute or unmute              |
| Right stick                                   | Scroll the scene or a panel |
| Left/right on a selected slider or voice list | Adjust it                   |

Press a controller button to let the browser detect it. The first detected held press is consumed; held face buttons cannot skip multiple lines. Stick dead zones, delayed navigation repeats, disconnect handling, and background input isolation keep controller actions predictable. Controller focus receives a visible cyan outline. Some browsers require one mouse/keyboard interaction to unlock sound: click **Enable sound** if necessary.

Controller wiring is exercised by simulated gamepad input against the actual React scene; physical hardware testing remains outstanding. Browser API requirements are described in [MDN: Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API).

## Engineering

React, TypeScript, Vite, Lucide icons, and Vitest. The scene is a small deterministic reducer, not an AI conversation.

```sh
npm test
npm run build
npm run preview
```

- `src/content/harbor.ts`: dialogue, choices, evidence, and authored scene copy.
- `src/state/scene.ts`: guarded progression, clue inspection, perception, and replay.
- `src/state/scene.test.ts`: meaningful progression and reset tests.
- `src/App.tsx`: scene presentation and input.
- `src/components/`: Kite, scientific overlays, and accessible modal shell.
- `src/art.ts` and `public/art/`: replaceable art manifest and optimized assets.
- `src/audio/`: original score, synthesized cues, local voice playback, and validated preferences.
- `src/hooks/useAudio.ts`: audio lifecycle, voice cancellation, foreground handling, and music ducking.
- `src/input/` and `src/hooks/useGamepad.ts`: controller sampling, focus navigation, and integration tests.

The investigation has one canonical state. Viewing evidence is idempotent; unknown choices and out-of-phase actions are ignored; the final choice is gated on all three distinct clues. Dialogue content does not own presentation or mutate state.

## Art and science

See [art direction and asset provenance](docs/ART_DIRECTION.md) for the asset prompts and replacement workflow. Harbor and Mara art were generated specifically for this project with the built-in image generation tool; no third-party artwork or downloaded fonts are included. Kite and the interface geometry are original SVG/CSS. Lucide icons are used under their ISC license.

All sensor values and historical records are fictional. The presentation keeps direct measurements distinct from model outputs: solid traces identify observations and dashed traces identify reconstructions. A shape does not establish age, warmth does not establish intelligence, and a survey with incomplete coverage does not establish absence.

The short-range blue-light greeting is grounded in demonstrated underwater optical communication; range and clarity matter. Background reading: [Woods Hole Oceanographic Institution: Can You Hear Me Now?](https://www.whoi.edu/ocean-learning-hub/multimedia/can-you-hear-me-now/). The delayed emission in the story remains an ambiguous fictional observation.

Recorded character clips can replace `VoicePlayback` using the existing stable dialogue IDs. Commissioned or licensed music can replace the score in `HarborAudio` while retaining its mixing and ducking. Neither change needs a new story-state system. The next useful step is refining the characters, voice, and visual identity through this scene before adding more chapters.
