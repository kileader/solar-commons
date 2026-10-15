# Cid task: The Quiet Index (Solar Commons Chapter 2)

Repository: `kileader/solar-commons`. **Extend the existing React/TypeScript/Vite visual novel. Do not change engines or rework the harbor/opening/museum chapters.** Read `README.md`, `docs/CREATIVE_DIRECTION.md`, `src/state/scene.ts`, `src/content/museum.ts`, and the existing dialogue/audio setup first.

## Goal

Build a **small playable, text-first** scene after the Hall of Waters, called **The Quiet Index**. Introduce Ilex Vale, a stylish, visibly cybernetic, gender-neutral (they/them) independent archivist in Larkhaven's nocturnal district. Mara and Kite seek an ethically restricted, damaged recording about the occupied lower refuge after the last ferry. Make the scene atmospheric, funny, intriguing, and grounded in established science. This should be a memorable story encounter, **not** a large RPG framework.

Use `STORY_THE_QUIET_INDEX.md` as the narrative source draft. It includes the opening, conversation, three investigation branches, playback, and conclusion. It's provisional: preserve its characterization and distinctive jokes, but make only minimal line-level copyediting needed for clarity/consistency. Flag major proposed plot changes to Kevin rather than silently replacing the story. Keep the player's pace and preserve voiced-line efficiency: combine coherent same-speaker passages, retain short lines only for comedy/drama, never mix speakers in one clip.

## Integration

- Continue from `museum-complete`. **Respect the museum's existing selected lead** (`stair` versus `voices`) with brief conditional introductory wording; both approaches reach Ilex. Don't discard the user's prior museum approach (`memory` vs `signal`) or other existing state. Preserve the already planned shore survey / testimony search; don't fabricate that a real external request was sent.
- Existing endings, field notes, choice history, and all previously recorded content must remain functional and unchanged. Add a natural way to proceed to Chapter 2 from the museum's completion view; existing replay/exhibit controls remain accessible.
- Render the **nocturnal canal** background for arrival, then the **Quiet Index interior** and Ilex's transparent dialogue sprite. If the existing engine has responsive/mobile variations, preserve them.
- Implement a clearly signposted **Analysis / Empathy / Intuition** choice. These are **story approaches**, not stats. Each has distinct dialogue and grants a distinct retained field note. All routes reconverge on the same audible recording. Don't roll dice or add a skill tree.
- Continue to a deliberate chapter-ending beat that acknowledges the earlier museum lead and chosen investigation approach. Leave the harbor's structure and the speaker's identity unresolved. Don't introduce definitive proof of identity, age, or consciousness through damaged data.
- **Kite has independent agency**: Mara asks whether they'd like to join; Ilex opens a restricted guest channel; Kite requests public visual/avatar + voice presence; Ilex accepts. Ilex sees Kite through their augmented optical interface and hears Kite through their auditory interface. No holographic object, no involuntary mind-reading or private-sensory-stream sharing.
- The sealed old recording might be reconstructed; label interpretation vs observed data, restoration artifacts, and uncertainty honestly. Ilex protects donor restrictions and consent. Kite may form hypotheses and be wrong.
- A screen/scene to visualize the degraded audio waveform using the existing UI/CSS is enough. **No new complex audio DSP, animated cinematics, or simulated AI agents.**

## Art and motion

Use the exact bundled assets as specified in `ASSET_MANIFEST.md`. Don't regenerate artwork or replace approved character designs. **`ilex_start.png` and `ilex_end.png` are two frames of the same future video**. They are *not* two full-screen story backgrounds or an existing movie. The chapter must work with stills alone. If convenient, leave a clean asset hook for a future approved MP4/WebM (with skip/reduced-motion/fallback), but do not fabricate a video or spend API credits.

## Voice/audio

**No new voice generation yet.** Kevin will cast Ilex and finalize the script after playtesting. Existing recordings in `dialogue/` use a text-sensitive matching system (`dialogue/script.json`, `src/audio/dialogueAssets.ts`), so never rename/reuse/misassign an existing clip for a new line. New lines should display cleanly with no sound or optional local fallback according to current settings. Use stable, unique dialogue IDs and support future per-line audio. Supply a list of new dialogue IDs/text after implementation for voice generation. Don't include unvoiced exposition that stalls Auto; preserve the current intended reading delay.

## Definition of done

- A reader can finish the existing museum, proceed through the nighttime arrival, meet Ilex, choose any of the three approaches, hear/read the same recovered excerpt, and reach a satisfying stopping point.
- The chapter correctly adapts to museum `stair`/`voices`, and retains the Analysis/Empathy/Intuition choice in its notes/state.
- All existing opening, harbor, museum, voice playback, accessibility, keyboard/controller controls, and optional readings still work; no regressions.
- Add focused tests for all three routes, state transitions, and the conditional museum lead. Run `npm test` and `npm run build`.
- Summarize file changes, any deliberate departures from the provisional script, a clear list of clips to record **later**, and the manual steps (if any) to preview the scene. Commit using an imperative message, e.g. `Add the Quiet Index encounter`.

**Scope control:** One new authored encounter, not an overhaul of the game or a full Disco Elysium RPG. Prioritize fun, chemistry, meaningful investigation, and a polished short playable slice.
