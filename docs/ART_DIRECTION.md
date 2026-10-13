# Art direction and provenance

## Current identity

A warm, prosperous coastal commons seen through a precise cybernetic interface. The environment stays lush and luminous; shared cognition introduces cyan and mint geometry, deep teal glass, and flowing connections. Large serif dialogue preserves a visual-novel rhythm. Technical labels are limited to information that helps the player interpret evidence.

Kite is an origami-like intelligence: a faceted diamond, folded fins, a small gold sensor, and trailing threads. Mara is a human coastal researcher. These are first-pass character and location choices, deliberately easy to revise.

## Assets

| Asset                    | Source                                                             | In-project file                 |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------- |
| Harbor panorama          | Built-in imagegen, generated for Solar Commons on October 13, 2026 | `public/art/harbor.webp`        |
| Mara portrait with alpha | Built-in imagegen, generated for Solar Commons on October 13, 2026 | `public/art/mara.webp`          |
| Kite                     | Original procedural SVG and CSS                                    | `src/components/Kite.tsx`       |
| Perception geometry      | Original illustrative SVG and CSS                                  | `src/components/Perception.tsx` |
| Interface icons          | Lucide, ISC license                                                | Dependency `lucide-react`       |
| Fonts                    | System Georgia and Trebuchet MS, with standard fallbacks           | No font files redistributed     |

The panorama is 1672 × 941; the portrait is an optimized 600 × 800 transparent WebP. Encoding to WebP and portrait downsampling use Pillow. Original generated PNGs remain in the local image-generation output folder; the running project references only its own checked-in assets.

The harbor score and interaction effects are original Web Audio synthesis in `src/audio/HarborAudio.ts`, with no third-party recordings or downloaded samples. Dialogue uses English speech voices reported as local by the device/browser. No voice model, recording, or third-party voice file is redistributed. Stable dialogue IDs provide replacement points for later licensed character recordings.

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
