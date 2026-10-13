# First-slice validation

Verified locally on October 13, 2026.

- `npm run build`: TypeScript check and production Vite bundle pass.
- `npm test`: all ten progression tests pass, covering both entry responses, both endings, clue gating, repeated inspection, unknown IDs, perception, and complete replay reset.
- Browser walkthrough: opening dialogue, both entry choices, all three evidence panels, notes, both endings, and replay exercised through actual controls.
- Browser sizes: 1440 × 900 desktop, 748 × 884 in-app panel, 390 × 844 phone, and 320 × 568 narrow phone. No horizontal overflow observed; the narrow view scrolls vertically for larger text.
- Keyboard: Continue remains focused between lines; C works from a focused control; numbered choices work; phase changes focus the next relevant control; Escape dismisses evidence and settings.
- Reduced motion: enabling the setting yielded zero animated elements and no background transform in computed browser styles. The system media preference is also handled in CSS and the motion hook; OS emulation was not used.
- Assets: harbor and Mara load from project-owned WebP files. The portrait retains alpha transparency.
- Console: no warning or error logs in the final browser walkthrough.

Browser interaction checks used the Vite development server. Production output was built successfully; it has not been deployed to a public host. No live AI calls are part of the prototype.
