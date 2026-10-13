# Solar Commons — Firefly video handoff

Prepared October 13, 2026. Use the approved **server-room restart** images. Start with S01.

Use the **individual image and motion-prompt files linked below**. S01 and S02 each have matching First and Last images; S03–S07 currently have one starting image each. S08 remains the original harbor still. Generate each shot separately; we will assemble the edit afterward.

## Firefly recipe

1. Open [Adobe Firefly](https://firefly.adobe.com/) → **Video → Generate video**.
2. Select **Firefly Video**, if available in your account.
3. Under **Frame → First**, upload the PNG for the current shot. For **S01 and S02**, also upload their matching end image under **Last**. Leave Last empty for S03–S07.
4. Set **16:9**, choose **1080p** if available, and use **Camera → Motion → Static** when the control is available. Adding a Last frame disables Firefly's camera-motion selector; the S01/S02 prompts request a stationary camera.
5. Paste the matching motion prompt below. Keep **Enhance prompt off** so the intended small movement is not expanded.
6. Generate S01 first, then download the result. Firefly's image/keyframe and camera controls are described in [Adobe's official guide](https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/generate-videos-using-images.html).
7. If the first result preserves Mara and the room, continue through S07. Save the downloads as **S01.mp4**, **S02.mp4**, … **S07.mp4**.

Leave captions, voice, music and QTE controls for the game/edit. The first-frame image already carries the character, setting and style; the short prompts focus on movement.

Our storyboard uses camera cuts. Do not put S01 in First and S02 in Last, or feed the entire contact sheet into one generation. Keep each composition as its own shot.

S01 uses a corrected starting pose and a matching end frame of the **same camera view**. Mara already faces the green chair in both frames; the movement is a short approach and hand contact, without a large turn. Kevin identified that the original start pose pointed her past the chair and forced a reversal; that image is now archived for this shot. The keyframes constrain the movement but do not guarantee clean intermediate frames. Use **Firefly Video** for this two-frame test. Adobe's current [partner-model instructions](https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/generate-videos-using-non-adobe-models.html) list only a First frame input for Runway Gen-4.5, so do not assume the same controls are available on that model.

Use the available default clip length. The durations below are editing targets. We can trim longer clips; S04/S05 can use a brief still hold to reach six seconds and later pause for their game interaction.

## Cost and access

Firefly offers limited free daily generations on a curated set of models; paid plans provide credits and expanded access. Check the model and credit cost in your account before generating. Start with one available test rather than buying a large plan for this seven-shot prototype. [Adobe plan details](https://www.adobe.com/products/firefly/plans.html), [generative-credit FAQ](https://helpx.adobe.com/creative-cloud/apps/generative-ai/generative-credits-faq.html).

If Firefly Video is unavailable on your account, these individual assets can be used with another image-to-video model you can access. S01/S02 need a model supporting both First and Last inputs; other shots currently use a starting image plus motion prompt.

## Shot uploads and copyable prompts

### S01 — Civic machinery

First: [s01-civic-compute-room-start-v2.png](s01-civic-compute-room-start-v2.png). Last: [s01-civic-compute-room-end-v1.png](s01-civic-compute-room-end-v1.png). Editing target: **3 seconds**. Generate **5 seconds**, then download as **S01.mp4**. Use the [matching motion prompt](s01-civic-compute-room-v3.motion.txt).

```text
The woman completes a small step toward the green chair on the left and gently rests her left hand on the chair back, settling into the pose shown in the final frame. Subtle natural breathing and hair movement. Locked camera. The room remains still.
```

### S02 — Permission

First: [s02-permission-start-v2.png](s02-permission-start-v2.png), with the index fingertip just above the raised cap and the indicator dim. Last: [s02-permission-pressed-v1.png](s02-permission-pressed-v1.png), with centered fingertip contact, a lower cap and bright mint acknowledgement ring. Editing target: **3 seconds**. Generate **5 seconds**, then download as **S02.mp4**. Use the [matching motion prompt](s02-permission-v2.motion.txt).

This pair replaces the original already-touching start image after the first video test produced stroking instead of a clear press. Keep the final finger contact held; a release can be implied by the cut to S03. The bright end image represents the pulse peak, not animation by itself.

```text
Locked close-up camera. The index finger moves straight down onto the center of the mint button and depresses the cap once. The mint ring brightens with one soft acknowledgement pulse. The fingertip stays planted on the center and holds the button down. The rest of the hand, device and room remain still.
```

### S03 — A familiar partner

Upload: [s03-familiar-partner-v1.png](s03-familiar-partner-v1.png). Editing target: **4 seconds**. Download name: **S03.mp4**.

```text
Static camera. The faceted diamond companion makes a slight attentive inclination; its two ribbon tails drift gently. A soft pulse travels outward along the separate cyan and gold attention paths. Preserve every facet, folded fin, gold accent, tail and the round and diamond endpoints. Background rack lights remain softly defocused.
```

### S04 — The threshold

Upload: [s04-threshold-v1.png](s04-threshold-v1.png). Editing target: **6 seconds**. Download name: **S04.mp4**.

```text
Locked camera on the rectangular mint rack indicator. The cyan round cue and gold diamond cue pulse gently in their separate positions. The incomplete dashed panel contours gradually become clearer against the dark perceptual field. Preserve the single physical indicator, grille and panel. Keep broken model lines broken. Calm shared attention.
```

### S05 — Shared cognition

Upload: [s05-shared-cognition-v1.png](s05-shared-cognition-v1.png). Editing target: **6 seconds**. Download name: **S05.mp4**.

```text
Static camera inside the rendered shared space. Translucent jade and ivory planes gently open farther in depth. The separate cyan and gold paths pulse together in a calm matched rhythm, with their round and diamond endpoints remaining aligned beside the same rectangular reference. The geometric companion and its two tails remain stable and recognizable.
```

### S06 — Still human

Upload: [s06-still-human-v1.png](s06-still-human-v1.png). Editing target: **3 seconds**. Download name: **S06.mp4**.

```text
Locked intimate close-up. The woman makes one slow natural blink, then reopens her hazel eye with a relaxed brow and quiet relief. Tiny natural breathing movement. Preserve her face, freckles, curls and the exact ivory and brass right-temple module. Ordinary eye catchlight and stable softly blurred rack lights.
```

### S07 — Into the living city

Upload: [s07-living-city-v1.png](s07-living-city-v1.png). Editing target: **5 seconds**. Download name: **S07.mp4**.

```text
Static wide camera from behind. The woman takes two unhurried steps farther through the doorway into the sunlit public passage. Her bag and curls sway naturally. Leaves stir gently and distant residents continue walking. Preserve her proportions, ivory and coral clothes, boots, bag orientation, temple module and the doorway architecture.
```

### S08 — The Harbor

Keep the [original harbor still](../../../public/art/harbor.webp) for the final **4 seconds**; skip video generation for this shot. The game will use its existing panorama for the handoff.

## Bring back the results

Keep the downloaded shot files separate. I can trim them, assemble the three segments, add captions/audio and connect the game. You do not need to produce a finished 34-second movie yourself.

Check the results for obvious face, hand or geometry distortion. S03–S05 contain precise geometric art; if it morphs badly, keep the approved still for that beat rather than repeatedly spending on retries. These motion prompts are starting directions, not a guarantee of model fidelity.
