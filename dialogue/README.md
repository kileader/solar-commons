# Dialogue recordings

These 26 MP3s were supplied by Kevin on October 15, 2026. The game uses them unchanged; no audio was generated through an API during integration.

Filenames match the authored line IDs in `src/content/harbor.ts`, plus the two investigation guides (`investigation-false` and `investigation-true`) and four cinematic captions (`opening-consent`, `opening-kite`, `opening-threshold`, `opening-shared`). All 26 IDs are checked against the authored content by `src/audio/recordings.test.ts`.

`src/audio/dialogueAssets.ts` imports MP3 URLs at build time. Vite gives them hashed filenames and resolves them beneath the deployment's base path. Keep this directory when building or cloning the project. Clips load on demand, rather than downloading the entire voice library at startup.

Recordings take priority over device speech. Missing or failed clips leave text readable and use reading-time pacing in Auto. Players can opt into **Sound → Device voice fallback** for local English speech on unrecorded lines. No provider key, live TTS request, or remote speech fallback is used.

The opening captions begin at 3.15, 6.45, 11, and 18.1 seconds. Their supplied durations (2.24, 2.32, 1.52, and 1.36 seconds) fit the existing shots. Pause, seek, skip, mute, and voice volume apply to these clips. The original S01 video's embedded sound stays on the effects channel.

Harbor voice stops when a line is skipped, a panel opens, the page loses focus, or playback settings change. Returning to a line restarts its recording. Evidence conversations play sequentially without closing their panel. Listen replays the current line.

## Still needed

No museum recordings were included. Museum dialogue uses its text (or the optional device voice). The previously exported voice handoff contains the provisional museum script and performance tags. Several museum runtime IDs have different spoken text depending on the player's route: the handoff distinguishes these with `--v1`, `--v2`, etc. Those variants will need an explicit content-aware mapping when supplied; do not map a single recording over different versions of a line. Optional exhibit prose does not require narration.

The mapping test deliberately flags additional or renamed clips so their authored IDs and any variants can be reviewed together.
