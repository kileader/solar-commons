# Art direction and provenance

## Ren’Py runtime and supplied museum art — October 15, 2026

The active runtime now lives in `game/`. The original harbor and Mara WebPs were copied byte-for-byte to `game/images/`; Kite’s canonical SVG is `game/images/kite.svg`, and the original perception projection is preserved in `game/images/harbor-perception.svg`. The original browser source and art manifest remain under `legacy/react/`. Historical paths below describe that production history.

Kevin supplied `solar_commons_hall_of_waters_webp.zip`, containing six 1672 × 941 background-only WebPs generated in his Solar Commons conversation with Phi in October 2026. This chapter uses four, unchanged, under `game/images/museum/`: `01_hall_exterior.webp`, `02_main_hall.webp`, `03_flood_exhibit.webp`, and `05_city_scale_model.webp`. The archive and memorial candidates are not used. No generated character-inclusive museum art replaces Mara or Kite. The right-temple module remains the original approved portrait; the character SVG retains its original silhouette.

Museum writing, timeline controls, the simplified flood diagram, and the handover record are separate runtime text and geometry. The new history and puzzle remain provisional; see [Hall of Waters design](HALL_OF_WATERS.md). No new image generation or paid service was used for this addition. New Ogg/WAV files render the original procedural score’s palette with `tools/render-audio.py`, using original synthesis and no external samples.

## Current identity

A warm, prosperous coastal commons seen through a precise cybernetic interface. The environment stays lush and luminous; shared cognition introduces cyan and mint geometry, deep teal glass, and flowing connections. Large serif dialogue preserves a visual-novel rhythm. Technical labels are limited to information that helps the player interpret evidence.

Kite is an origami-like intelligence: a faceted diamond, folded fins, a small gold sensor, and trailing threads. Mara is a human coastal researcher with a low-profile ivory/brass temple module, upper mint indicator and lower teal contact on her anatomical right side. Her face, curls, ivory/coral jacket, green brooch and strap remain the original character design. These are first-pass character and location choices, deliberately easy to revise.

## Assets

| Asset                   | Source                                                             | In-project file                   |
| ----------------------- | ------------------------------------------------------------------ | --------------------------------- |
| Harbor panorama         | Built-in imagegen, generated for Solar Commons on October 13, 2026 | `public/art/harbor.webp`          |
| Original Mara portrait  | Built-in imagegen, generated for Solar Commons on October 13, 2026 | `public/art/mara.webp`            |
| Mara with temple module | Built-in imagegen edit, generated on October 13, 2026              | `public/art/mara-cybernetic.webp` |
| Kite                    | Original procedural SVG and CSS                                    | `src/components/Kite.tsx`         |
| Perception geometry     | Original illustrative SVG and CSS                                  | `src/components/Perception.tsx`   |
| Interface icons         | Lucide, ISC license                                                | Dependency `lucide-react`         |
| Fonts                   | System Georgia and Trebuchet MS, with standard fallbacks           | No font files redistributed       |

The panorama is 1672 × 941; the portrait is an optimized 600 × 800 transparent WebP. Encoding to WebP and portrait downsampling use Pillow. Original generated PNGs remain in the local image-generation output folder; the running project references only its own checked-in assets.

The harbor score and interaction effects are original Web Audio synthesis in `src/audio/HarborAudio.ts`, with no third-party recordings or downloaded samples. Dialogue uses English speech voices reported as local by the device/browser. No voice model, recording, or third-party voice file is redistributed. Stable dialogue IDs provide replacement points for later licensed character recordings.

## Mara's neural-interface portrait

The current runtime portrait is `public/art/mara-cybernetic.webp`, a 600 × 800 RGBA WebP encoded from the [generated PNG master](storyboard/mara-neural-interface-v1.png). The [exact edit prompt](storyboard/mara-neural-interface-v1.prompt.txt) used the original `mara.webp` as the identity/pose target and the cybernetic S01 frame as the module reference. Built-in imagegen generated the edit on October 13, 2026; Pillow performed asset downsampling and WebP encoding only. Alpha spans 0–255 and both top corners are transparent. The original portrait remains available as the facial/costume reference.

## Current opening — civic computing room

**Runtime update, October 14, 2026:** the [opening player](OPENING_CINEMATIC.md) now uses eight WebP derivatives of these masters, Kevin's accepted S01 video with finished audio, and local camera/light/sound effects. No additional art or paid video generation was used. The production notes below record the original image-generation stage; references to future playback, eye animation and QTEs describe that earlier plan, not current features. QTEs and independent character animation are outside this slice.

Kevin requested a full visual restart after the first sequence repeated the harbor setting and deferred visible integration to future overlays. The [current opening plan](OPENING_CINEMATIC.md) now moves through a computing room, a rendered shared-perception space, a public passage and finally the harbor. Each shot must depict an event or a changed perceptual state, rather than only a different portrait crop.

The original [S01 — Civic machinery](storyboard/server-room/s01-civic-compute-room-v1.png) was generated with built-in imagegen on October 13, 2026, using the current Mara portrait for identity only. Its [exact prompt](storyboard/server-room/s01-civic-compute-room-v1.prompt.txt) establishes teal server cabinets, coolant hardware, a calibration workstation and Mara entering the facility. The [asset record](storyboard/server-room/README.md) contains dimensions, hash and review notes. This replaces the old room as the opening's working location reference. Seven new restart frames are now available; S08 reuses the existing harbor.

S01's current video pair uses a [corrected first frame](storyboard/server-room/s01-civic-compute-room-start-v2.png) and a [matching last frame](storyboard/server-room/s01-civic-compute-room-end-v1.png), generated with built-in imagegen on October 13, 2026. The original pose pointed Mara past the chair and required a large reversal; both replacement poses face the green chair so the action is only a small approach and hand contact. The end frame used the original room and Mara portrait; the corrected start used that end frame and the portrait. Exact [start](storyboard/server-room/s01-civic-compute-room-start-v2.prompt.txt) and [end](storyboard/server-room/s01-civic-compute-room-end-v1.prompt.txt) prompts remain recorded. The module is naturally occluded by the left-facing rear head angle in both images. The original S01 remains an archived room reference.

[S02 — Permission](storyboard/server-room/s02-permission-v1.png) cuts to a tight hand/control insert after Mara sits at the workstation. Built-in imagegen generated it on October 13, 2026, using S01 and the current portrait as references. Its [exact prompt](storyboard/server-room/s02-permission-v1.prompt.txt) preserves the ivory/brass/mint consent device, green upholstery and ivory/coral sleeve. Review confirmed deliberate fingertip contact and natural anatomy; the image shows the next action rather than another room portrait.

S02's current video pair uses a [ready-to-press First frame](storyboard/server-room/s02-permission-start-v2.png) and [pressed/pulse Last frame](storyboard/server-room/s02-permission-pressed-v1.png), both generated with built-in imagegen on October 13, 2026 using the original S02 as the edit target. The original first-frame-only video stroked the cap; the corrected pair gives the index pad a visible starting gap and a centered final contact with a brighter mint status ring. Exact [start](storyboard/server-room/s02-permission-start-v2.prompt.txt) and [end](storyboard/server-room/s02-permission-pressed-v1.prompt.txt) prompts, hashes and review limits are recorded in the asset record. The light is the physical consent device's acknowledgement indicator; no new neural or environmental measurement is implied.

[S03 — A familiar partner](storyboard/server-room/s03-familiar-partner-v1.png) shows Kite responding as two visibly separate cyan/gold attention paths begin to open. Built-in imagegen generated it on October 13, 2026 from the exported Kite anchor and new S01/S02 technical references; its [exact prompt](storyboard/server-room/s03-familiar-partner-v1.prompt.txt) records the constraints. Review confirmed the complete canonical geometry and tails, distinct round/diamond path endpoints, dark rack bokeh and perceptual presentation. The Connection segment now has all three working frames.

[S04 — The threshold](storyboard/server-room/s04-threshold-v1.png) begins Synchronization with a completed perceptual preview. Built-in imagegen generated it on October 13, 2026 from new S01 rack hardware and S03 attention cues; its [exact prompt](storyboard/server-room/s04-threshold-v1.prompt.txt) preserves the rectangular physical target. Two separated round/diamond endpoints approach it while broken model contours extend beyond solid visible panel edges. The change is present in the image; interactive timing and production layer separation remain future work.

[S05 — Shared cognition](storyboard/server-room/s05-shared-cognition-v1.png) completes Synchronization's preview pair with an immersive jade/ivory rendered workspace and coordinated cyan/gold paths. Built-in imagegen generated it on October 13, 2026 from S04, the canonical Kite anchor and S03; its [exact prompt](storyboard/server-room/s05-shared-cognition-v1.prompt.txt) records the composition and scientific boundaries. Review confirmed a distinct environment, complete supporting Kite silhouette, represented rectangular target and adjacent round/diamond endpoints. The planes and retained bezel are interface representations, not new physical observations. Layer separation and QTE playback remain future work.

[S06 — Still human](storyboard/server-room/s06-still-human-v1.png) begins Awakening with an intimate right-eye/temple detail in the computing room. Built-in imagegen generated it on October 13, 2026 from the approved Mara portrait and new S01; its [exact prompt](storyboard/server-room/s06-still-human-v1.prompt.txt) preserves natural eye rendering and the existing module. Review confirmed recognizable face/curls/freckles, restrained hardware and technical rack bokeh, with no perceptual graphics or data reflected in the eye. This returns from the rendered workspace to the human who experienced it.

[S07 — Into the living city](storyboard/server-room/s07-living-city-v1.png) shows physical departure through a glazed threshold into a bright planted public passage. Built-in imagegen generated it on October 13, 2026 from new S01, Mara's portrait and the original harbor's materials/palette; its [exact prompt](storyboard/server-room/s07-living-city-v1.prompt.txt) keeps the harbor view out. Review confirmed readable gait, coherent full-body clothing, bag/strap orientation and correct module placement. The complete working sequence now moves through distinct settings and events before S08's original harbor arrival. Playback and motion remain future work.

Keep the computing room purposeful and maintained, with restrained indicators and clear service access. The station supports voluntary calibration through Mara's existing interface. Kite remains a perceptual companion; the racks do not establish its whole identity or physical embodiment. S04/S05 previews visibly show the shared channel changing before later layer separation. No early anomaly imagery or numeric neural readouts.

## Archived harbor-alcove storyboard

The [earlier plan](OPENING_CINEMATIC_HARBOR_DRAFT.md) and frames below preserve the first exploration. They are superseded as a sequence; their provenance and character references remain available. Cinematic playback has not been implemented.

The first opening keyframe, **S01 — A room that belongs to the city**, was generated with the built-in image-generation tool on October 13, 2026, using the existing Mara portrait and harbor panorama as references. The current PNG master is [s01-integration-room-v3-cybernetic.png](storyboard/s01-integration-room-v3-cybernetic.png). The [initial prompt set](storyboard/s01-integration-room-v2.prompt.txt) records generation and a hand-position correction; the [temple-module edit](storyboard/s01-integration-room-v3-cybernetic.prompt.txt) adds Kevin's approved cybernetic detail. Dimensions are 1672 × 941. See the [asset record](storyboard/README.md) for provenance and review notes.

This is a storyboard candidate, stored separately from runtime art. The room stages synchronization rather than an implantation procedure. The exact biological mechanism and Kite's physical embodiment remain future design decisions.

The second opening keyframe, [S02 — A little wider](storyboard/s02-consent-v1.png), uses S01 version 3 and the updated portrait as references. It shows a closer, same-axis consent-control press, with the approved temple module retained. Its [exact generation prompt](storyboard/s02-consent-v1.prompt.txt) and review notes are recorded with the storyboard assets. The in-game cinematic remains planned work.

The third keyframe, [S03 — Someone familiar](storyboard/s03-kite-response-v1.png), uses the [static Kite reference](storyboard/kite-visual-anchor.png) exported from the current SVG, alongside S01's room/light reference. The [exact prompt](storyboard/s03-kite-response-v1.prompt.txt) preserves Kite's geometry as a perceptual avatar. The three Connection storyboard frames are now available; no runtime cinematic has been added.

[S04 — Attend together](storyboard/s04-attend-together-v1.png) begins Synchronization with Mara's seated view of the established sill plant and harbor. Its [exact prompt](storyboard/s04-attend-together-v1.prompt.txt) generates a clean ordinary-view plate. The visible leaf edge is the future calibration target; markers, attention paths and QTE controls remain separate, and S05 uses a new reverse interior angle with its own target anchor.

[S05 — Meet my pace](storyboard/s05-meet-my-pace-v1.png) responds to Kevin's request for varied camera angles: the foreground leaf leads to Mara's focused face against the warm room interior. The [exact prompt](storyboard/s05-meet-my-pace-v1.prompt.txt) uses character/room/plant references while changing viewpoint and background. S06 uses tight eye/temple detail; S07 uses a rear over-shoulder wide reveal. Preserve identity and world continuity while varying cinematography.

[S06 — Still Mara](storyboard/s06-awakening-detail-v1.png) begins Awakening with an extreme eye-and-temple close-up, soft interior bokeh and natural window catchlights. The [exact prompt](storyboard/s06-awakening-detail-v1.prompt.txt) uses S05 and the current portrait as references. Built-in imagegen generated it on October 13, 2026; continuity review preserves Mara's natural eye, freckles, curls and approved module. This frame varies the camera without adding new hardware or baking cognitive data into the eye.

[S07 — The city, together](storyboard/s07-city-together-v1.png) opens out to a wide rear over-shoulder harbor view. The [exact prompt](storyboard/s07-city-together-v1.prompt.txt) uses S01's alcove, the original harbor and the current Mara portrait as continuity references. Built-in imagegen generated it on October 13, 2026; the new camera keeps the chair, sill, plant, curl silhouette, temple module, major landmarks and physical afternoon light coherent. The clean plate leaves Kite and attention graphics for separate compositing. S08 reuses `public/art/harbor.webp` directly for the final handoff.

## Replace the art

1. Put licensed replacement assets in `public/art/`.
2. Update `src/art.ts`, or retain the current filenames.
3. Preserve a transparent portrait and head/shoulder composition for Mara.
4. Recheck focal point and the clue percentage coordinates in `src/content/harbor.ts` at desktop and phone widths.
5. Record the replacement's creator, license, and provenance here.

Scene state never depends on pixels. The scientific traces are illustrative projections, not a physically registered sonar renderer. Particle, water, light, foreground, and cognitive layers remain separate from dialogue and the replaceable raster background.

## Harbor generation prompt

```text
Use case: stylized-concept. Panoramic 16:9 environment concept art for a premium solarpunk visual novel. Breathtaking vibrant ecological coastal city harbor, plausible lush terraced limestone architecture with solar roofs and shaded public promenades, palms and vines foreground, turquoise water middle and right, tiny inhabitants and electric ferries, distant coastal mountains and elegant footbridges, warm late-afternoon light, peach clouds, jade and ivory. Sophisticated detailed hand-painted cinematic game background. No text, UI, watermark, or foreground characters.
```

## Mara generation prompt

```text
Use case: illustration-story
Asset type: transparent character portrait cutout for a premium solarpunk visual novel.
Primary request: Mara, a human coastal field researcher in her late twenties, warm brown skin, thoughtful clear hazel eyes, dark curly hair in a loose short windswept bob, quietly curious half-smile. Wearing a beautiful practical pale ivory linen high-collar jacket with muted coral details, a small green ceramic sensor brooch, understated elegant technology. Three-quarter bust portrait facing a little to the right, hands not visible, fully include head and shoulders and mid-chest.
Style: Refined painterly illustrated visual-novel character art, nuanced expressive face, hand-painted gouache softness and confident linework, warm late-afternoon golden light, polished cinematic illustration, grounded near-future coastal aesthetic, no exaggerated anime proportions.
Composition: one isolated character, 3:4 portrait, generous margin around head, no background whatsoever, transparent alpha background, no scenery or halo behind subject.
Constraints: no text, no lettering, no watermark, no logos, no giant cybernetic implants, no fantasy armor. Beautiful inviting approachable character.
```
