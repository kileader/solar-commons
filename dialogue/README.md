# Dialogue recordings

These 94 MP3s were supplied by Kevin on October 15, 2026: the original 26 harbor/opening tracks and 68 museum, optional-reading, and preview tracks. The game uses them unchanged; no audio was generated through an API during integration.

[`script.json`](script.json) preserves the exact recorded wording, speaker, production ID, and any shared runtime ID from the voice handoff. `src/audio/dialogueAssets.ts` matches **runtime ID + speaker + exact text** to the corresponding MP3. This resolves all eleven museum variant performances without changing narrative IDs or story progression. A rewritten line never silently plays the old wording.

`src/audio/recordings.test.ts` checks all 94 tracks against current harbor content, opening captions, every museum branch combination, the optional readings, and the voice preview. It also checks the explicit written-account/open-gate/closed-gate and character/ending variants. All supplied clips are reachable; both gate positions at dawn share `model-2-closed.mp3`, because the displayed dawn account is identical.

`src/audio/dialogueAssets.ts` imports MP3 URLs at build time. Vite gives them hashed filenames and resolves them beneath the deployment's base path. Keep this directory when building or cloning the project. Clips load on demand, rather than downloading the entire voice library at startup.

Recordings take priority over device speech. Missing or failed clips leave text readable and use reading-time pacing in Auto. Players can opt into **Sound → Device voice fallback** for local English speech on unrecorded lines. No provider key, live TTS request, or remote speech fallback is used.

The opening captions begin at 3.15, 6.45, 11, and 18.1 seconds. Their supplied durations (2.24, 2.32, 1.52, and 1.36 seconds) fit the existing shots. Pause, seek, skip, mute, and voice volume apply to these clips. The original S01 video's embedded sound stays on the effects channel.

Character voice stops when a line is skipped, a panel opens, the page loses focus, or playback settings change. Returning to a line restarts its recording. Evidence conversations play sequentially without closing their panel. Listen replays the current line. Autoplay waits until the selected performance finishes, then uses the configured gap.

## Optional museum narration

The history introduction, four sections, and source note each have a Listen/Stop control. Section headings and paragraphs play in order through the existing voice player. Gallery descriptions, flood explanations, the handover record, and the chapter epilogue have the same optional controls. Opening an exhibit does not start a long lecture automatically. A new reading replaces the previous one; closing it or changing a reconstruction control cancels pending clips. Reading does not progress the story or operate the model.

When replacing a performance, preserve its filename. For new or rewritten dialogue, supply the new recording and update `script.json` to its actual words and speaker; keep route variants separate. The tests deliberately flag missing, additional, renamed, or stale tracks so the audio and authored content can be reviewed together. The history remains provisional despite being voiced.
