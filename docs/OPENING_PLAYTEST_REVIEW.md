# Opening playtest review — October 16, 2026

Based on Kevin’s supplied feedback from Gadiel and lhsg. A GitHub issue search returned no issues; this review does not assume access to additional playtest notes or a particular build Gadiel played.

## Implemented UX changes

- Evidence navigation now leads with **Continue examination**. **Finish examination** replaces it only on the final rendered page, including when text needs additional pages on phones. Back and the section selector remain available. Auto never finishes or dismisses the examination.
- **Saved to field notes automatically** is a separate status. **Close for now**, the close icon, Escape, and controller Back allow early departure. Opening a reading still records it immediately; the existing decision gate and story branches are unchanged. The harbor now reports **readings recorded**, rather than claiming that opening a card means it was examined.
- Opening evidence focuses the forward action rather than the close icon. Finishing or leaving returns to the harbor; reopening begins with the observations.
- Mara’s first harbor dialogue carries **Ocean researcher**; Kite’s introductory dialogue carries **Independent intelligence**. These labels restate established character information without changing spoken lines.
- Following Kevin’s direction, the unvoiced start-screen invitation identifies their roles, their twelve-year companionship, and their reason for going to the harbor: trying the wider connection together. The float’s alert catches their attention during that outing; Mara’s playful curiosity turns it into an investigation.
- After Kite’s existing alert, Mara adds the approved beat: **“Well, now I want to know what we’ve been sailing over.”** Kevin supplied its recording, which now plays before both existing entry choices and their recorded responses. Short landscape screens use a compact invitation layout to retain the text and controls.

All existing dialogue wording and all 147 recordings are preserved. Cinematic timelines, art, endings, and later chapters are unchanged.

## Why this change

Previously, the start screen said “Twelve years together. Today, a little closer.” The 34-second cinematic shows voluntary calibration, consent, and shared attention. Its four short spoken captions convey trust, but left the nature of the characters and the purpose of the connection implicit. The harbor then provided arrival narration, Mara’s reaction to the expanded connection, Kite’s twelve-year-partnership line, and the maintenance float’s discovery before the first choice.

The relationship is present, but a new player has to interpret it. The immediate investigation has measurements and uncertainty, but little expressed motivation beyond an unusual shape and a possible resemblance to pre-Unbinding work. Calling the Unbinding by name before explaining it also introduces a question that the museum answers considerably later. That history need not become an opening lecture.

Kevin prioritized **the buried structure, and why Mara and Kite want to investigate it**, chose the shared-perception outing as the inciting situation, and chose Mara as the character who gets curious first. His approval of the playful reaction led to the small additions above. We still do not know where Gadiel first felt lost; a fresh playtest should test whether this orientation and motive are sufficient before expanding the introduction again.

## Prediction interaction for approval

Try one optional prediction after the complete sonar observation and before Kite’s structural interpretation. Proposed prompt: **“What might these ribs belong to?”** Proposed responses: **“An old harbor foundation”**, **“Modern reef supports”**, and **“I’d keep both possibilities open.”** A **“Compare with Kite”** action then reveals the existing model and uncertainty. Players can skip predicting and read directly.

The useful payoff is comparing a provisional idea with evidence that fits more than one explanation, rather than guessing a hidden correct answer. Do not score it, claim that the scan dates the structure, add a new story route, or require a hypothesis on every card. If retained, a prediction must be labeled as the player’s hypothesis and kept separate from observations in field notes.

This interaction is a proposal only. A small, unvoiced UI prompt could preserve all current recordings. Any character reaction or changed spoken passage needs exact wording approval and a matching recording before integration.

## Audio handoff

Kevin supplied the new performance for the added beat on October 16. No existing recording needed regenerating:

| Runtime / recording ID | Speaker | Exact text                                             | Proposed file                   |
| ---------------------- | ------- | ------------------------------------------------------ | ------------------------------- |
| `harbor-curiosity`     | Mara    | Well, now I want to know what we’ve been sailing over. | `dialogue/harbor-curiosity.mp3` |

The file and its exact wording are now integrated through `dialogue/script.json`. Auto waits for the performance to finish, then uses the configured gap before presenting the existing choices. Listen replays the supplied clip. The recording coverage test requires exact matches for all 148 performances, with no pending-recording exception. FFmpeg decodes the new MP3 successfully; its duration is 3.52 seconds.

The current exact-text recording matcher and its coverage tests remain intact. If the harbor introduction is rewritten, the affected files are `dialogue/arrival.mp3` (narrator), `dialogue/integration.mp3` (Mara), `dialogue/familiar.mp3` (Kite), and/or `dialogue/anomaly.mp3` (Kite), depending on which lines change. Update only the affected script entries in `dialogue/script.json` after replacement performances are supplied.

Keep `opening-consent.mp3`, `opening-kite.mp3`, `opening-threshold.mp3`, and `opening-shared.mp3` unless their cinematic captions are explicitly revised. The unvoiced start-screen invitation needs no replacement audio. No audio was generated for this change.

## Validation

`npm test`: **205 tests pass across 20 files**. `npm run build`: TypeScript and the Vite production build pass. New coverage checks every evidence card’s progression and finish action, early closing with retained notes, default focus, character role labels, completion after measured text pagination/reflow, and Auto waiting for the new recording before offering the existing choices. Existing coverage verifies all 148 recordings and the harbor, museum, and Quiet Index routes.

After adding the new MP3, Vitest’s persistent module cache initially retained the previous 147-file glob expansion. Running `npx vitest --clearCache` refreshed that generated asset list before the final test run; no runtime workaround or dependency change was needed.

Browser checks at 1280 × 720 and 320 × 568 verify role-label layout, the measurements-first route, separate save/close controls, forward focus, all sonar evidence sections, and finishing back at the harbor. The expanded invitation was also inspected at 640 × 360, where its text and start controls remain above the cinematic controls. This is local verification, not a Pages deployment or a fresh human playtest.

Suggested coherent commit: **Clarify harbor evidence navigation and character introductions**.
