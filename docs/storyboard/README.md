# Opening storyboard assets

## S01 — A room that belongs to the city

[Working image, version 3 — cybernetic Mara](s01-integration-room-v3-cybernetic.png) · [Temple-module edit prompt](s01-integration-room-v3-cybernetic.prompt.txt)

[Version 2 — original appearance](s01-integration-room-v2.png) · [Initial generation and hand correction prompts](s01-integration-room-v2.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool for Solar Commons. The existing `public/art/mara.webp` supplied the character reference; `public/art/harbor.webp` supplied the setting, palette and light reference. One targeted correction moved Mara's resting hand beside the consent control so S02 can show its first deliberate press.

- Version 2 master: PNG, 1672 × 941, 2,708,985 bytes.
- Version 2 SHA-256: `a200a18915e55ba0b271c001b79643415574af6db3fe8c75c73e7e7514b60c58`.
- Review: recognizable Mara face/costume, brooch and strap orientation, harbor landmarks, warm light, comfortable seat, and hand/control separation inspected against the existing art.
- Version 3 adds the approved right-temple ivory/brass module with upper mint indicator and lower teal contact. It preserves Mara's face, posture, costume and the room/harbor composition. The same design now appears in her runtime portrait.
- Status: working room/storyboard candidate. Recommended story mechanism is an existing implanted neural interface, with synchronization calibrating a richer shared-attention channel. The exact neural hardware and Kite's physical embodiment are still design decisions.
- The first iteration is preserved locally under ignored `.qa/storyboard/`; the corrected master is the working reference for later room shots.

This image is stored with the storyboard documents and is not wired into the running game. See the [opening cinematic package](../OPENING_CINEMATIC.md) for shot order, prompts, QTE concept and future integration.

## S02 — A little wider

[Working image, version 1](s02-consent-v1.png) · [Exact generation prompt](s02-consent-v1.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool, using S01 version 3 for the room/lighting/module and `public/art/mara-cybernetic.webp` for character identity. This closer frame shows Mara deliberately pressing the same green armrest control. The generated index-finger press was accepted as a natural staging refinement to the drafted thumb gesture.

Reviewed against S01: face and temple hardware, costume, camera axis, chair and armrest, sill plant, harbor, light direction, and readable hand anatomy are consistent. This is the second keyframe of Clip 1; the authored caption is **“A little wider, then.”** Captions remain separate from the raster image.

Master: PNG, 1672 × 941, 2,458,922 bytes. SHA-256: `2724c73139b928ed77b263c194e365c417833254556af181bdf9a6a66b237cad`.

## S03 — Someone familiar

[Working image, version 1](s03-kite-response-v1.png) · [Exact generation prompt](s03-kite-response-v1.prompt.txt)

Generated on October 13, 2026 with the built-in image-generation tool, using the exported current Kite SVG as character reference and S01 version 3 as room/light reference. The close perceptual portrait preserves the diamond core, folded fins, mint/teal facets, gold attention slit, top ornament and two ribbon tails. No physical cast shadow, projector or mechanical body is depicted.

Reviewed against the anchor and S01: silhouette, palette, room, chair, plant, arch and harbor are consistent. This completes the three storyboard frames for Clip 1, Connection. The authored caption is **“Your pace. Your choice.”** Captions remain separate from the raster image. Animation and in-game cinematic playback remain future work.

Master: PNG, 1672 × 941, 2,099,765 bytes. SHA-256: `8b453a954442e8e3e21bbaefc65db36fae94979f5065cee54d8904d30e4d2432`.

## Kite visual anchor

[PNG reference](kite-visual-anchor.png) · [Original exported SVG](kite-visual-anchor.svg)

The reference is a static export of the existing `Kite` component in `src/components/Kite.tsx`, rendered with React's `renderToStaticMarkup`. The field, attention accent and signal styling use the current inactive portrait values; animation is absent and inactive cognition branches remain hidden. Sharp rasterized the export on a plain deep-teal background at 960 × 1040 for image-generation reference. The SVG geometry and runtime component were not redesigned.

## Mara visual anchor / runtime portrait

[PNG master](mara-neural-interface-v1.png) · [Exact edit prompt](mara-neural-interface-v1.prompt.txt)

Built-in imagegen used the original `public/art/mara.webp` as edit target and S01 version 3 as the temple-module reference. The master is 1086 × 1448 with alpha. Asset encoding produces `public/art/mara-cybernetic.webp` at the original 600 × 800 runtime size, with transparency retained. The game's art manifest references the new WebP; the original portrait remains unchanged.
