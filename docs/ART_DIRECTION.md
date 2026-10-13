# Art direction and provenance

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

## Opening storyboard draft

The first opening keyframe, **S01 — A room that belongs to the city**, was generated with the built-in image-generation tool on October 13, 2026, using the existing Mara portrait and harbor panorama as references. The current PNG master is [s01-integration-room-v3-cybernetic.png](storyboard/s01-integration-room-v3-cybernetic.png). The [initial prompt set](storyboard/s01-integration-room-v2.prompt.txt) records generation and a hand-position correction; the [temple-module edit](storyboard/s01-integration-room-v3-cybernetic.prompt.txt) adds Kevin's approved cybernetic detail. Dimensions are 1672 × 941. See the [asset record](storyboard/README.md) for provenance and review notes.

This is a storyboard candidate, stored separately from runtime art. The room stages synchronization rather than an implantation procedure. The exact biological mechanism and Kite's physical embodiment remain future design decisions.

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
