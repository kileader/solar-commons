# Opening cinematic

The 34-second opening runs between the Phicid studio splash and the existing harbor scene. It focuses on Mara voluntarily widening her connection with Kite, then returning to the living city. It reuses the approved eight-shot storyboard and Kevin's finished S01 clip with audio. No further AI video generation, external services, or animation dependencies are required.

Mara and Kite have been partners for twelve years. Her existing right-temple module supports the connection. This is voluntary calibration, not implantation, unrestricted mind reading, an upload, or Kite becoming conscious. The biological mechanism remains open for story development. The civic room supports the session without establishing a permanent body or a single cabinet containing Kite's identity.

## Running sequence

| Time    | Shot                       | Treatment                                                                                                                             |
| ------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 0–3 s   | S01 · Civic computing room | First three seconds of the accepted clip, including its finished audio. Matching still for reduced motion or failed video.            |
| 3–6 s   | S02 · Permission           | Ready and pressed plates switch quickly; a mint pulse and quiet click acknowledge contact. Mara: “A little wider, then.”              |
| 6–10 s  | S03 · A familiar partner   | Camera push and highlights along the painted paths. Kite: “Your pace. Your choice.”                                                   |
| 10–16 s | S04 · The threshold        | Physical rack detail, incomplete dashed reconstruction and two offset attention rhythms. Kite: “Follow this.”                         |
| 16–22 s | S05 · Shared cognition     | Dissolve into the jade rendered workspace. Cyan and gold cues settle into the same rhythm while remaining separate. Kite: “With you.” |
| 22–25 s | S06 · Still herself        | Intimate eye and temple detail; camera and sound settle. No fabricated blink.                                                         |
| 25–30 s | S07 · Into the living city | Camera reveal and daylight over the departure illustration. No simulated walking or limb interpolation.                               |
| 30–34 s | S08 · The Harbor           | Reveal the exact runtime harbor asset, then mount the first narrator line.                                                            |

These are flattened illustrations. Framing, transitions and registered SVG light supply motion; characters are not independent 3D layers. Painted Kite remains the only avatar in its shots. There are no QTEs, scores or branching outcomes in this opening.

## Controls and accessibility

- **Begin with sound** explicitly enables audio. **Watch silently** saves mute for the following scene too.
- Pause/Resume, Restart while paused, a seek bar, Sound, Reduced motion and Skip remain available.
- Space pauses/resumes outside focused controls; Escape skips. Tab and native button activation work normally.
- A standard gamepad uses A/Cross to activate a focused button, B/Circle to skip, D-pad/left stick to move focus, left/right to adjust a selected slider, LB/L1 to restart and RB/R1 to mute.
- Leaving the foreground pauses the clock and media. Resume is explicit.
- Captions work without sound. Compositions retain their full 16:9 framing on phones.
- System or manual reduced motion removes video, camera transforms and animated light. Timed stills, captions, seeking and Skip remain available.
- Completion consumes held keys, pointer gestures and controller buttons through release before mounting gameplay. Harbor input and audio do not exist during the opening.

## Files and replacement workflow

- `src/content/opening.ts` owns shot URLs, durations, camera framing and captions.
- `src/components/OpeningCinematic.tsx` owns one clock, temporary media and controls. CSS and SVG effects derive from that clock, so Pause and seeking reposition them together.
- `src/audio/OpeningAudio.ts` supplies an original locally synthesized score, room air and sparse cues. Saved master/music/effects/mute preferences are shared with the harbor. S01's embedded track follows master × effects volume and stops at the first cut.
- `public/art/opening/` contains eight optimized WebP derivatives, about 1.5 MB total. S08 directly reuses `public/art/harbor.webp`.
- `public/media/opening/s01-connection.mp4` is Kevin's accepted Firefly clip with his finished audio, supplied for this opening. Only its first three seconds play; it never loops. It is about 6.3 MB.
- [Storyboard masters and exact generation prompts](storyboard/server-room/README.md) remain the source record. No new art was generated for this implementation.

To replace a still, supply commissioned, owned or appropriately licensed art with the same composition/aspect ratio, update the timeline URL if needed, and recheck anchored light paths. `tools/prepare-opening-art.py` reproducibly converts the existing PNG masters using Pillow (`python -m pip install Pillow`, then `python tools/prepare-opening-art.py`). Replace the video independently; its poster/still remains a fallback.

Runtime URLs use Vite's `BASE_URL`, including the video and original harbor, for GitHub Pages project-path compatibility. The [review board](storyboard/server-room/review.html) remains a historical timing/storyboard tool; use the game for the current sequence.

## Scientific and story boundaries

| Visual                                | Meaning                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Physical panel and indicator          | Features Mara can directly see.                                                                  |
| Broken incomplete contours            | A partial model, explicitly labeled as such.                                                     |
| Cyan circle and gold diamond paths    | Shared attention and pacing, distinguished by shape as well as color. Not neural measurements.   |
| Jade planes and represented indicator | A rendered perceptual workspace, not physical architecture changing.                             |
| Harbor panorama                       | Ordinary perception restored; no anomaly, sonar or historical evidence before the investigation. |

The opening preserves `initialSceneState`: intro line zero, perception off, no inspected clues and no choices. Harbor Replay restarts only that scene. The Unbinding's detailed history remains unwritten; this cinematic establishes no new historical canon.

## Validation

See [validation notes](VALIDATION.md) for automated lifecycle checks, browser inspection and remaining hardware/audio review limits. The earlier [harbor-alcove draft](OPENING_CINEMATIC_HARBOR_DRAFT.md) is superseded; its references remain archived.
