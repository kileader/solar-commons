# Solar Commons

A short solarpunk visual novel about Mara and Kite sharing a point of view while investigating an unexpected structure beneath Larkhaven’s harbor.

[Play in your browser](https://kileader.github.io/solar-commons/).

The active project uses **React, TypeScript, and Vite**. The original 34-second cinematic, animated attention paths, camera movement, local score, character voices, and responsive harbor presentation are restored. Choose **Begin with sound** or **Watch silently**; pause, seek, restart, reduced motion, and skip are available. The accepted S01 video and all approved character art are unchanged.

## Play and develop

Use Node.js 22.12 or newer (developed with Node.js 24).

```sh
npm ci
npm run dev
```

Continue the conversation, choose an approach, inspect the three harbor readings, then choose either original ending. Cognitive Perception distinguishes observations from partial reconstructions. Field notes retain what you have examined.

Keyboard: **Enter/Space** continues dialogue, **C** toggles perception, **J** opens notes, **1/2** selects a story choice, and **Escape** closes a panel. All controls work with Tab and Enter. Standard controllers retain the existing browser controls. Settings include reduced motion, larger dialogue, sound levels, and local device voices where available.

This is an authored, offline-capable story with no backend, telemetry, paid inference, or external messaging. Scene progress lasts for the current visit; audio preferences stay on the device. Character speech uses local English device voices only and depends on browser availability.

## Verify and publish

```sh
npm test
npm run build
npm run preview
```

GitHub Actions runs tests, builds the static application, and publishes `dist/` to Pages when pushed to `main`. A local commit does not publish it.

The provisional Hall of Waters treatment and four supplied backgrounds are preserved in the [Ren’Py archive](legacy/renpy/README.md) while the museum is integrated into the restored scene. The [migration record](docs/MIGRATION.md) explains the engine experiment. Original storyboard masters, art direction, and studio sources remain in `docs/` and `studio/`.
