import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { quietIndexVoiceLines } from '../src/content/quietIndex.ts'

const quote = (value) => `"${value.replaceAll('"', '""')}"`
const rows = [...quietIndexVoiceLines].sort((a, b) => a.id.localeCompare(b.id))
const script = JSON.parse(readFileSync(new URL('../dialogue/script.json', import.meta.url), 'utf8'))
const recorded = (line) =>
  script.some(
    (clip) => clip.id === line.id && clip.speaker === line.speaker && clip.text === line.text,
  ) && existsSync(new URL(`../dialogue/${line.id}.mp3`, import.meta.url))
writeFileSync(
  new URL('../docs/quiet-index/VOICE_RECORDING_PLAN.csv', import.meta.url),
  [
    'dialogue_id,speaker,text,status',
    ...rows.map((line) =>
      [line.id, line.speaker, line.text, recorded(line) ? 'recorded' : 'unrecorded']
        .map(quote)
        .join(','),
    ),
  ].join('\n') + '\n',
)
console.log(
  `Exported ${rows.length} passages (${rows.filter(recorded).length} recorded). No audio generated.`,
)
