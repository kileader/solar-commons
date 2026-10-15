# Solar Commons

A short solarpunk visual novel about Mara, a coastal researcher, and Kite, the AI she has known for twelve years. They share a point of view while investigating an unexpected structure under Larkhaven’s harbor.

The playable project now uses **Ren’Py 8.5.3**. The original React prototype is preserved in [`legacy/react`](legacy/react/README.md). The public [browser release](https://kileader.github.io/solar-commons/) updates when changes are pushed to `main`; a local commit alone does not update it.

## Play and develop

On Windows, install the pinned official SDK and web support, then launch:

```powershell
./tools/renpy.ps1 setup
./tools/renpy.ps1 run
```

Setup downloads the free SDK from renpy.org into ignored `.tools/` and verifies the official SHA-256 checksums. Alternatively, select this repository as a project in the Ren’Py launcher, or set `RENPY_SDK` to an existing 8.5.3 SDK. No Python, Node, accounts, API keys, or paid services are required to play.

**Begin the story** leads through the studio splash and existing eight-shot opening, the harbor, and the Hall of Waters. The chapter takes roughly 15 minutes, depending on optional reading.

- Inspect the three original harbor readings, then choose either the careful survey or the optical greeting. Both continue to the museum.
- Read the optional history wall at your pace. It introduces the Unbinding and the Night of Two Waters without a quiz.
- Try a small flood reconstruction: follow storm tide, hill runoff, and dawn; open or close the sea gate and examine the competing pressures.
- Inspect an unexplained observation at dawn to find a handover record and choose your next investigation lead. The chapter ends before that next investigation.
- Leave the reconstruction whenever you like and revisit it from the chapter ending. Field notes retain evidence and your chosen lead.

The new history, refuge record, and flood interaction are **provisional authored fiction**. The water display is a simplified museum illustration, not a hydrodynamic model. The discovery does not identify or date the present-day structure, explain its warmth, or establish that the lights were a reply.

## Controls

| Input | Action |
| --- | --- |
| Click / Enter / Space | Continue dialogue or activate a focused control |
| 1 / 2 | Choose a dialogue option |
| 1 / 2 / 3 at the reconstruction | Select a historical moment |
| C | Toggle Cognitive Perception |
| J | Open field notes |
| Escape | Close reading panels or open the game menu |
| Mouse wheel up / Page Up / Back | Roll back the story |
| Mouse wheel / arrows / Page Up and Down in a reading panel | Scroll the exhibit |
| V on supported desktops | Ren’Py self-voicing |

The menu provides six manual save slots, loading, dialogue history, music/effects volumes, mute, text speed, larger text, fullscreen, and reduced motion. Ren’Py handles normal controller navigation and confirmation; physical controller testing remains outstanding. Browser play works best in landscape on small screens.

The original browser-specific character speech and cinematic seek/pause player are retained in the legacy prototype. The Ren’Py opening supports skipping and click-to-advance; its native desktop self-voicing replaces browser character voices. Sound uses original locally rendered synthesis and the accepted opening clip’s embedded audio. No third-party music or voice service is called.

## Verify and build

```powershell
./tools/renpy.ps1 lint
./tools/renpy.ps1 test
./tools/renpy.ps1 web
./tools/renpy.ps1 desktop
```

The native suite exercises all 16 combinations of harbor entry, harbor ending, gate choice, and museum lead; optional reading and leaving/revisiting; duplicate evidence; perception; new-game reset; save/load; rollback; opening sound modes; and preferences. Test saves and captures stay in ignored folders. See [`docs/VALIDATION.md`](docs/VALIDATION.md) for verified results and limits.

The web build goes to `dist/`. Serve it with any static web server, for example `python -m http.server 4174 --directory dist`. Desktop archives go to `.qa/releases/`. GitHub Actions downloads the pinned SDK, checks the script, runs the native suite under Xvfb, builds the browser game, and publishes it to Pages.

## Project layout

- `game/script.rpy`: native scene progression and saved story variables.
- `game/dialogue.rpy`: the preserved harbor dialogue and new museum conversations, using native characters, menus, and labels.
- `game/screens.rpy`: story presentation, evidence, notes, exhibits, flood controls, and standard game menus.
- `game/content/`: authored evidence readings and optional historical text.
- `game/opening.rpy`: the existing opening adapted to native playback.
- `game/images/`: original harbor/Mara/Kite art and four supplied museum backgrounds. The Mara temple module and Kite silhouette are unchanged.
- `game/tests/story.rpy`: native interaction and branching tests, excluded from distributions.
- `tools/`: reproducible SDK commands, opening-art encoding, and original audio rendering.
- `docs/HALL_OF_WATERS.md`: bounded museum design and provisional story decisions.
- `docs/MIGRATION.md`: migration mapping and presentation differences.

This is a deterministic, authored story. It has no backend, telemetry, live AI, or external messaging. Game saves and preferences stay on the device. Art provenance is in [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md); original storyboard masters and studio sources remain in the repository.
