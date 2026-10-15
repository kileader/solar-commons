# React to Ren’Py migration

Kevin authorized moving to Ren’Py during the museum addition on October 15, 2026. Ren’Py 8.5.3 is pinned to a published release, including SDK and web-package hashes. The root `game/` is the active project; `legacy/react/` preserves the previous implementation.

## What carries over

- All 20 authored harbor dialogue lines, both entry responses, three distinct evidence readings, and both endings.
- The same evidence gate: inspecting three distinct known clues enables the decision. Reopening a clue does not add another observation.
- Cognitive Perception as an optional toggle, with the original SVG projection, observed/model distinction, and uncertainty labels. It never proves the shape’s identity or age.
- The exact harbor panorama, current Mara portrait and right-temple module, Kite geometry, eight opening plates, studio logo, and accepted S01 clip. Runtime raster files were checked against their source copies by hash.
- Original ambient synthesis, rendered into reproducible Ogg/WAV files for the native engine with `tools/render-audio.py`. This is an adaptation of the original palette, not a recording of the Web Audio output.

The state reducer is replaced by ordinary Ren’Py labels, menus, `default` story variables, and screen actions. Native saves, loading, history, and rollback own progress. Scene content lives in native dialogue and two small JSON files for the readings and exhibit copy. JavaScript and React are not part of the new runtime.

## Presentation differences

The native opening reuses the eight-shot sequence and first three seconds of the accepted clip, with skip and click-to-advance. The previous browser player’s seeking, pause UI, and independent camera/light animation remain in the legacy snapshot. Reduced motion uses the still room plate in place of the clip. Character portraits and perception geometry retain their designs; their browser-specific CSS animation and parallax are not reproduced as a separate animation framework.

Browser speech synthesis and device voice selection are not ported. Ren’Py desktop self-voicing is available through V where supported; browser character voices are absent. Native standard gamepad support replaces the custom JavaScript sampler. Physical hardware remains unverified. The new interface uses a 1600 × 900 virtual canvas, so landscape is preferable on phones.

## Building and publishing

`tools/renpy.ps1` wraps setup, launching, lint, test, web, and PC packaging. The Windows SDK and official web support are installed only in ignored `.tools/`, with pinned SHA-256 verification. Tests use `.qa/saves` rather than normal player saves.

The Pages workflow uses the same engine release, verifies official package hashes, runs lint and native interaction tests, and uploads a Ren’Py web distribution. A local commit does not publish anything. The historical public React release remains online until a new workflow completes after a push.

Older opening/storyboard documentation describes the React implementation and art-production history. Its original paths are historical; active runtime files now live under `game/`.
