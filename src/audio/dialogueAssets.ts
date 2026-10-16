import type { DialogueLine } from '../content/harbor'
import script from '../../dialogue/script.json'

// Keep the supplied filenames intact, including Chapter Two's lead variants.
// Vite ships each clip with a cache-safe URL.
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

const keyFor = (line: DialogueLine) => JSON.stringify([line.id, line.speaker, line.text])
const recordingIds = new Map(
  script.map((line) => [
    keyFor({ ...line, id: line.runtimeId ?? line.id } as DialogueLine),
    line.id,
  ]),
)

/** The recorded script is a snapshot: changed words must never play an older performance. */
export function recordingIdFor(line: DialogueLine) {
  return recordingIds.get(keyFor(line))
}

export function recordingFor(line: DialogueLine) {
  const id = recordingIdFor(line)
  return id ? dialogueRecordings[id] : undefined
}
