# Archived Ren’Py prototype

This preserves the October 15 migration experiment, including the provisional museum chapter and native story tests. Kevin chose to return to the existing React presentation. The root application and Pages workflow now use React/Vite; this archive is outside that build.

The game scripts, images, audio, and tests are unchanged. With the official pinned SDK installed in the repository’s `.tools/` folder, run `./legacy/renpy/tools/renpy.ps1 run` or `lint` from the repository root. The wrapper uses this directory as the Ren’Py project. Archived web builds go to this directory’s ignored `dist/`; native test saves go to the repository’s `.qa/renpy/`.

`tools/render-audio.py` reproduces the native audio from the original palette; it requires Python and FFmpeg. The active React application uses its original Web Audio implementation.
