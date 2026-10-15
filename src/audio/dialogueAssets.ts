import type { DialogueLine } from '../content/harbor'

// Keep Kevin's source filenames intact; Vite ships each clip with a cache-safe URL.
const files = import.meta.glob<string>('../../dialogue/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const dialogueRecordings: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path
      .split('/')
      .pop()!
      .replace(/\.mp3$/, ''),
    url,
  ]),
)

export function recordingFor(line: Pick<DialogueLine, 'id'>) {
  return dialogueRecordings[line.id]
}
