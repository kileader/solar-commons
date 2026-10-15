# Art handoff

| File | Role | Format / dimensions | Use |
|---|---|---|---|
| `art/backgrounds/nocturnal_canal.webp` | Chapter entry | 1672 × 941 WebP | Larkhaven's inviting nocturnal arts district, establishing exterior |
| `art/backgrounds/quiet_index.webp` | Main interior | 1672 × 941 WebP | The Quiet Index restoration studio, for dialogue and investigation |
| `art/portraits/ilex_dialogue_avatar.png` | Character sprite | 1086 × 1448 RGBA PNG | Transparent Ilex portrait, scaled without distortion |
| `art/video_frames/ilex_start.png` | Future video **first frame** | 1600 × 900 PNG | Ilex looks down at delicate restoration work |
| `art/video_frames/ilex_end.png` | Future video **last frame** | 1600 × 900 PNG | Ilex looks up with a knowing smile |
| `source_pngs/nocturnal_canal_original.png` | Master background | 1672 × 941 PNG | Source for editing / re-export |
| `source_pngs/quiet_index_original.png` | Master background | 1672 × 941 PNG | Source for editing / re-export |

## Visual continuity and technical boundaries

- Ilex uses **they/them**; androgynous adult, asymmetrical dark hair, amber augmented eye, exposed ceramic-metal lattice, white-and-brass precision prosthetic hands, ornate dark green/black clothing.
- Use the sprite over backgrounds with correct aspect ratio and unclipped expression. Preserve the existing Mara and Kite designs from the repository; do not replace them with generated generic alternatives.
- The video frames belong to **one shot** (looking down → looking up), not two scenes. Their backgrounds and composition are imperfectly matched. A video generator with start/end frame input can attempt interpolation, but the result should be previewed for face / prosthetic morphing.
- The package contains still images **only**. No video or new dialogue MP3 has been generated.
- You may use `ilex_start.png` as a temporary still. Don't require video for playability.
- For a future animation: restrained 4–6 seconds, stable camera, minor hand movement, Ilex looks up and smiles. No lip-sync or extra limbs. Generate externally only with approval.
- Settings are visually lush and sometimes retrofuturistic. The *functional* technologies in the writing must remain physically plausible, not magical.
