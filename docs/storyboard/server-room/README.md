# Server-room opening storyboard

This restarts the cinematic after Kevin requested a different room, stronger technological setting, varied views and visible events. See the [current plan](../../OPENING_CINEMATIC.md). The earlier harbor-alcove images remain in the parent folder as historical references.

## Review the sequence

Ready to generate motion: use the [Firefly upload recipe and seven motion prompts](FIREFLY_GUIDE.md). The prompts continue each approved starting frame; S08 remains the original harbor still.

Open the [ordered review board](review.html) and select **Play 34-second preview** to watch the silent timing animatic. It uses the existing stills, draft dialogue captions, gentle fades and a small camera move. Pause/Resume, Replay, a scrubber and Reduce motion support review; system reduced-motion preferences are respected and losing foreground focus pauses playback. Select individual frames below for larger manual views. It can be opened directly as a local HTML file or at `/docs/storyboard/server-room/review.html` through the Vite development server. Authored shot order/timing/captions are in `shots.js`; presentation and playback are in `review.js`.

The preview plays all eight shots in 34 seconds, with captions at S02–S05, and stops on the original harbor. Full playback, pause/resume, scrubbing and the reduced-motion control were checked in the browser. This is a timing animatic; character motion and interactive synchronization remain future work. Next: review pacing, try one generated-video shot, then build the game opening with separable attention layers, two inputs, audio and the studio → opening → harbor handoff. The running game currently mounts the harbor directly after the studio splash.

## S01 — Civic machinery

[Original starting image, now archived for video](s01-civic-compute-room-v1.png) · [Exact generation prompt](s01-civic-compute-room-v1.prompt.txt). Use the corrected start below for the current review and video attempt.

Generated on October 13, 2026 with the built-in image-generation tool. The current `public/art/mara-cybernetic.webp` supplied character identity only; no previous room or harbor image was used as a scene reference.

Mara enters a civic computing facility toward a modest calibration station. Tall teal rack cabinets, orderly coolant hardware, a clear service aisle and cool daylight establish the new room. This is an entry action; S02 must show her settled at the station before authorization.

Reviewed: face/curls, natural hand anatomy, ivory/coral clothing, left-chest brooch, strap and anatomical right-temple module remain recognizable. The technical setting and diagonal aisle composition differ substantially from the older harbor frames. There is no harbor vista, surgical implication or new implant. Hardware is conceptual scenery, not a validated engineering schematic.

Master: PNG, 1672 × 941, 2,492,497 bytes. SHA-256: `a8c26943840180ce798d6b4faf738e58cd0fa610da376650b6664b3082786212`.

Status: all eight working plates are available: seven newly generated restart frames S01–S07 and the existing harbor reused as S08. Review them together before the timing animatic. These images are not yet wired into runtime playback.

### S01 corrected starting frame

[Current starting image, version 2](s01-civic-compute-room-start-v2.png) · [Exact image-generation prompt](s01-civic-compute-room-start-v2.prompt.txt) · [Current video motion prompt](s01-civic-compute-room-v3.motion.txt)

Generated October 13, 2026 with the built-in image-generation tool, using the matching end image as the room/pose edit target and the approved Mara portrait as identity reference. Kevin identified that the original entry pose pointed past the chair and required an awkward reversal. The replacement starts with Mara already facing screen-left toward the green chair, her hand just short of contact, and her feet set for a small approach. The end frame completes the reach without changing her body/head orientation.

Reviewed: same 1672 × 941 framing, recognizable rear outfit/bag/curls and broadly aligned background. The right-temple module remains naturally occluded in both poses, avoiding a large visible head rotation. The hand contact and stance change are deliberately small. The two plates still require video review for interpolation artifacts; they are not a guarantee of identity preservation. The review board and animatic now use this start image.

Master: PNG, 1672 × 941, 2,263,470 bytes. SHA-256: `3941d0d7003d2a6ec496d181c16c8e08a10275c3a192cbc96ebd7563b45867fe`.

### S01 matching end frame

[End frame, version 1](s01-civic-compute-room-end-v1.png) · [Exact image-generation prompt](s01-civic-compute-room-end-v1.prompt.txt) · [Current video motion prompt](s01-civic-compute-room-v3.motion.txt)

Generated October 13, 2026 with the built-in image-generation tool. S01 supplied the edit target and fixed room/camera composition; the approved Mara portrait supplied identity. Kevin requested an end keyframe after the generated clips showed an incorrect or excessive walk and an ivory shape migrating from the temple onto the hair.

Mara now stands beside the existing green calibration chair, turned toward the desk, with one hand on the chair back. The rack, desk, glass partition and floor perspective retain the starting composition. Her ordinary curls have no white floating piece; the anatomical right-temple module is naturally occluded by the turned head rather than moved onto the hair. She remains standing, ready for the cut to S02's seated permission insert.

Reviewed: same image dimensions and broadly aligned room geometry, recognizable clothing/bag/curls, natural hand contact and a clear destination. The two raster plates are not pixel-identical; video interpolation still needs review for character and background drift. Use this as **Last** with the corrected S01 start version 2 as **First** in a model that supports both inputs, such as Firefly Video. This end plate does not change the eight-shot order or add another scene.

Master: PNG, 1672 × 941, 2,320,069 bytes. SHA-256: `1028c24aaaf1188051731c8f31ef97bc735fa107792eefe4d0388e57c0f5f1a4`.

## S02 — Permission

[Working image, version 1](s02-permission-v1.png) · [Exact generation prompt](s02-permission-v1.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool using new S01 for the workstation/control/chair and the current Mara portrait for skin and clothing. A tight diagonal hand/control insert shows Mara now seated, deliberately pressing the same mint consent cap. Its restrained indicator responds; the authored caption is **“A little wider, then.”** Captions remain outside the raster.

Reviewed against S01: index fingertip contact, natural overlapping fingers, ivory/brass control, pale worktop, green upholstery, seated torso/lap and rolled ivory/coral sleeve are coherent. The face and broad room view are cropped out; defocused teal racks preserve location context. This visibly advances the action from entry to authorization. The control grants permission without operating server power or cooling.

Master: PNG, 1672 × 941, 2,163,208 bytes. SHA-256: `de606f0c60290bcafd7341dbcc8af8421ae9015484ce32f62c264ca8ee7a9c3d`.

## S03 — A familiar partner

[Working image, version 1](s03-familiar-partner-v1.png) · [Exact generation prompt](s03-familiar-partner-v1.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool using the canonical Kite anchor for geometry and new S01/S02 for technical material and light. Kite acknowledges Mara's consent as two separate cyan/gold attention paths visibly open into the right side of the frame. The cyan cue has a round endpoint and the gold cue a diamond endpoint; neither path has aligned yet. The authored caption is **“Your pace. Your choice.”** Captions remain separate.

Reviewed against the anchor: tall mint/teal diamond, broad folded fins, dark central diamond, gold slit/lower bar, detached top ornament and exactly two asymmetric ribbon tails remain intact and fully framed. Slight posture/fin asymmetry conveys response. Dark defocused rack structure and amber/mint bokeh continue the new setting without a room panorama. No chassis, projector, cast physical shadow or environmental light spill establishes a physical body. The paths depict shared attention, not measurements or cables.

Master: PNG, 1672 × 941, 1,680,721 bytes. SHA-256: `df0945f329d8e26d162a97ea0791ad8459576a109659218211f7c02b0cff8636`.

## S04 — The threshold

[Completed storyboard preview, version 1](s04-threshold-v1.png) · [Exact generation prompt](s04-threshold-v1.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool using new S01 for physical rack hardware and S03 for attention-path design. A close oblique first-person view centers one recessed rectangular mint status indicator beside the rack grille. Two cyan/gold cues approach with separated round/diamond endpoints as a partial dashed panel reconstruction opens into darker space. The authored caption is **“Follow this.”** Captions and QTE controls remain external.

Reviewed: matte teal panel, grille, brass fittings and rectangular indicator are coherent with the established racks. The tangible target remains single and intact. Solid contours follow visible edges; the continuation uses broken incomplete strokes. Paths depict shared attention, not cables or measured brain activity. No hidden circuitry or sensor values are introduced. This is a completed preview with the perceptual event visible, not an ordinary clean plate. Separating source layers and adding QTE timing remain future work.

Master: PNG, 1672 × 941, 1,844,403 bytes. SHA-256: `c867fc8381dccc664d57a71b54f5500e4c44e3e9a26d61d379c989fa55594109`.

## S05 — Shared cognition

[Completed storyboard preview, version 1](s05-shared-cognition-v1.png) · [Exact generation prompt](s05-shared-cognition-v1.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool using S04 for the rectangular target, the canonical Kite anchor for character geometry and S03 for attention-path design. The scene enters a rendered workspace of translucent jade/ivory planes, with Kite at left and the represented indicator at right. Cyan/gold paths coordinate near the same reference; round/diamond endpoints remain distinguishable. The aligned response is **“With you.”** Captions and QTE controls remain external.

Reviewed: immersive composition differs clearly from the physical rack close-up and earlier Kite portrait. The full canonical Kite silhouette and two tails remain visible at supporting scale. The indicator's rectangular identity persists; adjacent endpoint registration and matched final path directions show the result of coordination. The bezel and planes are represented interface geometry, not newly observed objects or a literal room transformation. No neural readouts, hidden circuitry, upload imagery or server-power changes are depicted. This completed preview is the coordinated result reference; timing, partial-miss variations and production source-layer separation remain future work.

Master: PNG, 1672 × 941, 1,837,259 bytes. SHA-256: `70f2800746c54a63be3bd66773d80b22d715ac6a3f9b7bf5bea91fe124f7815b`.

## S06 — Still human

[Working image, version 1](s06-still-human-v1.png) · [Exact generation prompt](s06-still-human-v1.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool using the current Mara portrait for identity and new S01 for the computing-room setting/light. An intimate right-eye and temple detail returns to embodied Mara after the shared workspace. Technical teal/amber/mint bokeh replaces the earlier draft's sunset window backdrop.

Reviewed: natural hazel iris and ordinary catchlight, relaxed expression, warm brown skin/freckles, curls and recognizable facial proportions are preserved. The small ivory/brass plaque remains on her anatomical right temple with its upper mint indicator and lower teal contact. No reflected data, glowing iris, new hardware, surgical imagery or perceptual paths appear. This is the reaction keyframe; animating the eye opening remains future work.

Master: PNG, 1672 × 941, 2,323,928 bytes. SHA-256: `5f139b02fb10c252d44ffef62c7a7d0a8193543436a2862a6d48a0955c52bb4f`.

## S07 — Into the living city

[Working image, version 1](s07-living-city-v1.png) · [Exact generation prompt](s07-living-city-v1.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool using new S01 for clothing/facility continuity, the current Mara portrait for identity, and the original harbor for civic materials and palette only. A wide rear three-quarter view captures Mara walking through a glazed doorway into a bright planted public passage. The near rack edge establishes departure; trees, shade, benches and distant residents establish the new place without a harbor vista.

Reviewed: the trailing heel lifts as the front foot advances beyond the threshold, making the crossing legible. Curls, ivory/coral clothes, boots, left-shoulder-to-right-hip strap, olive bag and naturally visible right-temple module remain coherent. No physical implant relocation, seated pose, perception graphics or early anomaly appears. This completes the new generated storyboard frames; movement animation remains future work.

Master: PNG, 1672 × 941, 2,768,433 bytes. SHA-256: `4d5c9a5655be3b347fc3e1861dd0f81d63cf4dfef5e80f2abf675fa124d57d48`.

## S08 — The Harbor

Reuse the [original runtime harbor panorama](../../../public/art/harbor.webp) directly. No new generation is needed. Its [original prompt and provenance](../../ART_DIRECTION.md#harbor-generation-prompt) remain recorded. Match the runtime crop and focal point from `src/art.ts`; remove cinematic captions and any remaining attention graphics before mounting the existing first narrator line. This is the destination after the computing room, shared workspace and public passage.
