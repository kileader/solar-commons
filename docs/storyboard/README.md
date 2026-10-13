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

## Mara visual anchor / runtime portrait

[PNG master](mara-neural-interface-v1.png) · [Exact edit prompt](mara-neural-interface-v1.prompt.txt)

Built-in imagegen used the original `public/art/mara.webp` as edit target and S01 version 3 as the temple-module reference. The master is 1086 × 1448 with alpha. Asset encoding produces `public/art/mara-cybernetic.webp` at the original 600 × 800 runtime size, with transparency retained. The game's art manifest references the new WebP; the original portrait remains unchanged.
